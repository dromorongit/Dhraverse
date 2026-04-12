import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
const prisma = getPrisma()
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// GET all orders with optional filters
export async function GET(request: NextRequest) {
  try {
    const authCheck = requireAdmin()
    if (authCheck instanceof NextResponse) {
      return authCheck
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    
    if (status && ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      where.status = status
    }
    
    if (paymentStatus && ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(paymentStatus)) {
      where.paymentStatus = paymentStatus
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: { items: true },
          },
          payment: {
            select: {
              id: true,
              status: true,
              amount: true,
              reference: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    // Calculate summary stats
    const summary = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    })

    const paymentSummary = await prisma.order.groupBy({
      by: ['paymentStatus'],
      _count: true,
    })

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      summary: {
        byStatus: summary,
        byPaymentStatus: paymentSummary,
      },
    })
  } catch (error) {
    console.error('Admin orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}