import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-middleware'
import { verifyPaystackPayment } from '@/lib/paystack'

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

    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 })
    }

    // Find the payment record
    const payment = await getPrisma().payment.findUnique({
      where: { reference },
      include: {
        order: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Verify the payment with Paystack
    const paystackResponse = await verifyPaystackPayment(reference)

    // Check both Paystack status and our payment status
    const paymentStatus = paystackResponse.data.status
    
    // Check if payment was abandoned, cancelled, or failed
    if (paymentStatus !== 'success') {
      // Payment failed, abandoned, or cancelled - mark as failed/cancelled
      const isAbandoned = paymentStatus === 'abandoned'
      const failedStatus = isAbandoned ? 'CANCELLED' : 'FAILED'
      
      await getPrisma().$transaction(async (prisma) => {
        // Update payment status to FAILED or CANCELLED
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: failedStatus,
            message: isAbandoned ? 'Payment abandoned by user' : paymentStatus || 'Payment verification failed',
          },
        })

        // Update order payment status to match
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: failedStatus,
            status: 'CANCELLED', // Also cancel the order
          },
        })
      })

      return NextResponse.json({
        success: false,
        error: isAbandoned ? 'Payment was cancelled' : 'Payment verification failed',
      }, { status: 400 })
    }

    // Payment was successful - update payment and order status
    await getPrisma().$transaction(async (prisma) => {
        // Update payment status to PAID
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            message: 'Payment successful',
          },
        })

        // Update order status to PROCESSING (order is now active)
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'PROCESSING',
            paymentStatus: 'PAID',
          },
        })

        // Deduct stock for the order items
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: payment.orderId },
        })

        for (const item of orderItems) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          })

          if (product && product.stock >= item.quantity) {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: product.stock - item.quantity },
            })
          }
        }

        // Clear the user's cart after successful payment
        const cart = await prisma.cart.findUnique({
          where: { userId: payload.userId },
        })
        if (cart) {
          await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
          })
        }
      })

      return NextResponse.json({
        success: true,
        orderId: payment.orderId,
        message: 'Payment verified successfully',
      })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}