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

    if (paystackResponse.data.status === 'success') {
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
      })

      return NextResponse.json({
        success: true,
        orderId: payment.orderId,
        message: 'Payment verified successfully',
      })
    } else {
      // Payment failed or was abandoned
      await getPrisma().$transaction(async (prisma) => {
        // Update payment status to FAILED
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            message: paystackResponse.data.status || 'Payment verification failed',
          },
        })

        // Update order payment status
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'FAILED',
          },
        })
      })

      return NextResponse.json({
        success: false,
        error: 'Payment verification failed',
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}