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
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const follows = await getPrisma().vendorFollow.findMany({
      where: { userId: payload.userId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            location: true,
            averageRating: true,
            reviewCount: true,
            vendor_categories: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    const vendors = follows.map((f) => ({
      id: f.store.id,
      name: f.store.name,
      logo: f.store.logo,
      slug: f.store.slug,
      location: f.store.location,
      averageRating: f.store.averageRating,
      reviewCount: f.store.reviewCount,
      category: f.store.vendor_categories,
    }))

    return NextResponse.json({ vendors })
  } catch (error) {
    console.error('Error fetching followed vendors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}