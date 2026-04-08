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

    // Get user's cart
    const cart = await getPrisma().cart.findUnique({
      where: { userId: payload.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    })

    if (!cart) {
      return NextResponse.json({
        cart: {
          id: null,
          items: [],
          total: 0,
        }
      })
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

    return NextResponse.json({
      cart: {
        id: cart.id,
        items: cart.items,
        total,
      }
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
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
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 })
    }

    // Verify product exists and has stock
    const product = await getPrisma().product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    // Get or create cart
    let cart = await getPrisma().cart.findUnique({
      where: { userId: payload.userId },
    })

    if (!cart) {
      cart = await getPrisma().cart.create({
        data: { userId: payload.userId },
      })
    }

    // Check if item already in cart
    const existingItem = await getPrisma().cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    if (existingItem) {
      // Update quantity
      await getPrisma().cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      // Create new item
      await getPrisma().cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      })
    }

    // Return updated cart
    const updatedCart = await getPrisma().cart.findUnique({
      where: { userId: payload.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    })

    const total = updatedCart?.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0

    return NextResponse.json({
      cart: {
        id: updatedCart?.id,
        items: updatedCart?.items || [],
        total,
      }
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}