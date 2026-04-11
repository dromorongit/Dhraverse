import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { verifyPaystackPayment } from '@/lib/paystack'

// This endpoint is called by Paystack after a payment attempt
// It serves as a webhook for payment status updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const reference = body.data?.reference

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
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
    const paymentStatus = paystackResponse.data.status

    // Check if payment was abandoned, cancelled, or failed
    if (paymentStatus !== 'success') {
      // Payment failed, abandoned, or cancelled
      const isAbandoned = paymentStatus === 'abandoned'
      const failedStatus = isAbandoned ? 'CANCELLED' : 'FAILED'
      
      await getPrisma().$transaction(async (prisma) => {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: failedStatus,
            message: isAbandoned ? 'Payment abandoned via webhook' : 'Payment failed via webhook',
          },
        })

        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: failedStatus,
            status: 'CANCELLED',
          },
        })
      })

      return NextResponse.json({ received: true })
    }

    // Payment was successful
    await getPrisma().$transaction(async (prisma) => {
        // Update payment status to PAID
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            message: 'Payment successful via webhook',
          },
        })

        // Update order status to PROCESSING
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

      return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing payment webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}