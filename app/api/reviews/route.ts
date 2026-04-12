import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const checkEligibility = searchParams.get('checkEligibility') === 'true'

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // If checking eligibility, require authentication
    if (checkEligibility) {
      const token = request.cookies.get('token')?.value
      if (!token) {
        return NextResponse.json({ canReview: false }, { status: 200 })
      }

      const payload = await verifyToken(token)
      if (!payload || payload.role !== 'CUSTOMER') {
        return NextResponse.json({ canReview: false }, { status: 200 })
      }

      // Check if user already reviewed this product
      const existingReview = await getPrisma().review.findUnique({
        where: {
          productId_userId: {
            productId,
            userId: payload.userId,
          },
        },
      })

      if (existingReview) {
        return NextResponse.json({ canReview: false, reason: 'already_reviewed' }, { status: 200 })
      }

      // Check if user has purchased this product in a paid/completed order
      const paidOrder = await getPrisma().orderItem.findFirst({
        where: {
          productId,
          order: {
            userId: payload.userId,
            paymentStatus: 'PAID',
            status: {
              in: ['DELIVERED', 'COMPLETED'],
            },
          },
        },
      })

      return NextResponse.json({ canReview: !!paidOrder }, { status: 200 })
    }

    const reviews = await getPrisma().review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    // Mask user identities for privacy
    const maskedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      isVerified: review.isVerified,
      createdAt: review.createdAt,
      reviewer: review.user.profile?.firstName || 
                review.user.email.split('@')[0] + '***',
    }))

    return NextResponse.json({
      reviews: maskedReviews,
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: reviews.length,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can submit reviews' }, { status: 403 })
    }

    const { productId, rating, comment } = await request.json()

    // Validate required fields
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Verify product exists
    const product = await getPrisma().product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user already reviewed this product
    const existingReview = await getPrisma().review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: payload.userId,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })
    }

    // Verify user has purchased this product in a paid/completed order
    const paidOrder = await getPrisma().orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: payload.userId,
          paymentStatus: 'PAID',
          status: {
            in: ['DELIVERED', 'COMPLETED'],
          },
        },
      },
    })

    if (!paidOrder) {
      return NextResponse.json({ 
        error: 'You can only review products you have purchased and received' 
      }, { status: 400 })
    }

    // Create review
    const review = await getPrisma().review.create({
      data: {
        productId,
        userId: payload.userId,
        rating,
        comment: comment?.trim() || null,
        isVerified: true, // Mark as verified since user purchased the product
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}