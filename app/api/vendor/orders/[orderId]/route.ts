import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-middleware'
import { OrderStatus } from '@prisma/client'

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    console.log('PATCH /api/vendor/orders/:orderId - Starting')
    console.log('Params:', params)
    
    const token = request.cookies.get('token')?.value
    console.log('Token exists:', !!token)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    console.log('Token payload:', payload)
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const orderId = params.orderId
    console.log('Order ID:', orderId)
    
    const { status } = await request.json()
    console.log('New status:', status)

    const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED']
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get vendor's store
    console.log('Getting vendor store for userId:', payload.userId)
    let store = null
    try {
      store = await getPrisma().store.findUnique({
        where: { userId: payload.userId },
        include: {
          products: {
            select: { id: true },
          },
        },
      })
    } catch (storeError) {
      console.error('Error fetching store:', storeError)
      return NextResponse.json({ error: 'Error fetching store' }, { status: 500 })
    }
    console.log('Store:', store ? 'found' : 'not found')

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const productIds = store.products.map(p => p.id)
    console.log('Product IDs:', productIds)

    // Check if the order contains any of the vendor's products
    console.log('Looking for order items with orderId:', orderId, 'productId in:', productIds)
    const orderItems = await getPrisma().orderItem.findMany({
      where: {
        orderId,
        productId: { in: productIds },
      },
    })
    console.log('Found order items:', orderItems.length)

    // Check if the order exists first
    console.log('Checking if order exists:', orderId)
    const existingOrder = await getPrisma().order.findUnique({
      where: { id: orderId },
    })
    console.log('Existing order:', existingOrder)
    
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: 'Order not found or not related to your products' }, { status: 404 })
    }

    // Update the order status in a transaction
    const updatedOrder = await getPrisma().$transaction(async (prisma) => {
      return await prisma.order.update({
        where: { id: orderId },
        data: { status: status as OrderStatus },
      })
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
    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Error details:', { message: errorMessage, stack: errorStack })
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 })
  }
}