import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
      return NextResponse.json({
        productCount: 0,
        activeOrderCount: 0,
        revenue: 0
      })
    }

    const productIds = store.products.map(p => p.id)
    const productCount = productIds.length

    if (productIds.length === 0) {
      return NextResponse.json({
        productCount: 0,
        activeOrderCount: 0,
        revenue: 0
      })
    }

    // Get active orders (PENDING, PROCESSING, SHIPPED, DELIVERED) that contain vendor's products
    const activeOrders = await getPrisma().order.findMany({
      where: {
        items: {
          some: {
            productId: { in: productIds }
          }
        },
        status: { in: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
      },
      select: {
        id: true
      }
    })

    const activeOrderCount = activeOrders.length

    // Get completed orders that contain vendor's products and calculate revenue
    const completedOrders = await getPrisma().orderItem.findMany({
      where: {
        productId: { in: productIds },
        order: {
          status: 'COMPLETED'
        }
      },
      select: {
        price: true,
        quantity: true
      }
    })

    const revenue = completedOrders.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)

    return NextResponse.json({
      productCount,
      activeOrderCount,
      revenue
    })
  } catch (error) {
    console.error('Error fetching vendor metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}