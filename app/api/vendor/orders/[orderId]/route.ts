import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-middleware'

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const orderId = params.orderId
    const { status } = await request.json()

    const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED']
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get vendor's store
    const store = await getPrisma().store.findUnique({
      where: { userId: payload.userId },
      include: {
        products: {
          select: { id: true },
        },
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const productIds = store.products.map(p => p.id)

    // Check if the order contains any of the vendor's products
    const orderItems = await getPrisma().orderItem.findMany({
      where: {
        orderId,
        productId: { in: productIds },
      },
    })

    if (orderItems.length === 0) {
      return NextResponse.json({ error: 'Order not found or not related to your products' }, { status: 404 })
    }

    // Update the order status
    const updatedOrder = await getPrisma().order.update({
      where: { id: orderId },
      data: { status },
    })

    return NextResponse.json({
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
      }
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}