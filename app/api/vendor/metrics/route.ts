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

    // Get unique orders using raw SQL - simpler query
    const activeOrderItems = await getPrisma().$queryRaw<Array<{ orderId: string }>>`
      SELECT DISTINCT oi."orderId" FROM "orderItems" oi
      INNER JOIN "orders" o ON oi."orderId" = o.id
      WHERE oi."productId" = ANY(${productIds}::text[])
      AND (o.status = 'PENDING' OR o.status = 'PROCESSING' OR o.status = 'SHIPPED' OR o.status = 'DELIVERED')
    `

    // Count unique active orders
    const activeOrderIds = Array.from(new Set(activeOrderItems.map(item => item.orderId)))
    const activeOrderCount = activeOrderIds.length

    // Calculate revenue from completed orders using raw SQL
    const completedOrderItems = await getPrisma().$queryRaw<Array<{ total: number }>>`
      SELECT COALESCE(SUM(oi.price * oi.quantity), 0) as total
      FROM "orderItems" oi
      INNER JOIN "orders" o ON oi."orderId" = o.id
      WHERE oi."productId" = ANY(${productIds}::text[])
      AND o.status = 'COMPLETED'
    `

    const revenue = Number(completedOrderItems[0]?.total) || 0

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