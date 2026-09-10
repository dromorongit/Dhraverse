import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-middleware'
import { LoyaltyEngine } from '@/lib/loyalty/loyalty-engine'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { amount } = body

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    if (amount < 1000) {
      return NextResponse.json({ error: 'Minimum redemption is 1,000 points (GH₵10.00)' }, { status: 400 })
    }

    const currentBalance = await getPrisma().rewardPoints.findUnique({
      where: { userId: payload.userId },
      select: { balance: true },
    })

    if (!currentBalance || currentBalance.balance < amount) {
      return NextResponse.json({ error: 'Insufficient points balance' }, { status: 400 })
    }

    const result = await LoyaltyEngine.reward.redeemPointsToWallet({
      userId: payload.userId,
      amount,
      description: `Redeemed ${amount} points to wallet`,
    })

    return NextResponse.json({
      success: true,
      pointsRedeemed: amount,
      cedisReceived: Math.round((amount / 100) * 100) / 100,
      redemption: result.redemption,
    })
  } catch (error: any) {
    console.error('Error redeeming points to wallet:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
