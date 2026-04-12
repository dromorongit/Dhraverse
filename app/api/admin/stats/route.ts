import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
const prisma = getPrisma()
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const authCheck = requireAdmin()
    if (authCheck instanceof NextResponse) {
      return authCheck
    }

    // Get counts
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      paidOrders,
      verifiedVendors,
      recentOrders,
      recentUsers,
      recentVendors,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'VENDOR' } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { total: true },
      }),
      prisma.store.count({ where: { isVerified: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { email: true, role: true },
          },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.store.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { email: true, role: true },
          },
        },
      }),
    ])

    // Calculate total revenue from paid orders
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0)

    // Count reviews and categories
    const [totalReviews, totalCategories] = await Promise.all([
      prisma.review.count(),
      prisma.category.count(),
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        verifiedVendors,
        totalRevenue,
        totalReviews,
        totalCategories,
        paidOrderCount: paidOrders.length,
      },
      recentOrders,
      recentUsers,
      recentVendors,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}