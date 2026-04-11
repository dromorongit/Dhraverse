import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'

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
      return NextResponse.json({ orderItems: [] })
    }

    const productIds = store.products.map(p => p.id)

    // Get order items for vendor's products
    const orderItems = await getPrisma().orderItem.findMany({
      where: {
        productId: { in: productIds },
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { order: { createdAt: 'desc' } },
    })

    return NextResponse.json({ orderItems })
  } catch (error) {
    console.error('Error fetching vendor orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}