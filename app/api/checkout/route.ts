import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-middleware'
import { initializePaystackPayment, isPaystackConfigured } from '@/lib/paystack'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Paystack is configured
    if (!isPaystackConfigured()) {
      return NextResponse.json({ 
        error: 'Payment system not configured. Please contact support.' 
      }, { status: 500 })
    }

    // Get user's cart
    const cart = await getPrisma().cart.findUnique({
      where: { userId: payload.userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`
        }, { status: 400 })
      }
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

    // Generate unique reference for the payment
    const reference = `DHV-${crypto.randomBytes(8).toString('hex').toUpperCase()}`

    // Get user's email for Paystack
    const user = await getPrisma().user.findUnique({
      where: { id: payload.userId },
      select: { email: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create order and payment record in a transaction
    const result = await getPrisma().$transaction(async (prisma) => {
      // Create order in PENDING payment status (stock not deducted yet)
      const order = await prisma.order.create({
        data: {
          userId: payload.userId,
          total,
          status: 'PENDING',
          paymentStatus: 'PENDING',
        },
      })

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          userId: payload.userId,
          orderId: order.id,
          amount: total,
          currency: 'GHS',
          status: 'PENDING',
          reference,
        },
      })

      // Create order items (without deducting stock yet)
      for (const item of cart.items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          },
        })
      }

      // DO NOT clear cart here - only clear after successful payment
      // This ensures cart items are preserved if payment is cancelled or failed
      // Cart will be cleared in payment/verify route after successful payment

      return { order, payment }
    })

    // Initialize Paystack payment
    // Callback to checkout page which handles verification
    const callbackUrl = `https://dhraverse-production.up.railway.app/checkout?reference=${reference}`
    
    try {
      const paystackResponse = await initializePaystackPayment(
        user.email,
        total,
        reference,
        callbackUrl,
        {
          orderId: result.order.id,
          userId: payload.userId,
        }
      )

      // Update payment with Paystack reference
      await getPrisma().payment.update({
        where: { id: result.payment.id },
        data: { paystackRef: paystackResponse.data.reference },
      })

      // Send order confirmation email (non-blocking, don't fail if email fails)
      const userProfile = await getPrisma().profile.findUnique({
        where: { userId: payload.userId },
      })
      const customerName = userProfile?.firstName || user?.email.split('@')[0] || 'Customer'
      sendOrderConfirmationEmail(user.email, customerName, result.order.id, total, 'GHS').catch(err => {
        console.error('Failed to send order confirmation email:', err)
      })

      // Create in-app notification
      createNotification(payload.userId, 'ORDER_PLACED', 'Order Placed', `Your order #${result.order.id.slice(0, 8)} has been placed. Total: GHS ${total.toFixed(2)}`).catch(err => {
        console.error('Failed to create notification:', err)
      })

      return NextResponse.json({
        orderId: result.order.id,
        paymentId: result.payment.id,
        reference,
        authorizationUrl: paystackResponse.data.authorization_url,
      })
    } catch (paystackError) {
      // If Paystack initialization fails, update payment status to FAILED
      await getPrisma().payment.update({
        where: { id: result.payment.id },
        data: { 
          status: 'FAILED',
          message: paystackError instanceof Error ? paystackError.message : 'Payment initialization failed',
        },
      })

      // Update order status
      await getPrisma().order.update({
        where: { id: result.order.id },
        data: { paymentStatus: 'FAILED' },
      })

      return NextResponse.json({ 
        error: 'Failed to initialize payment. Please try again.' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error initializing checkout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}