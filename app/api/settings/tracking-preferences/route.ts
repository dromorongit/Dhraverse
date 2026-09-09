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
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getPrisma().user.findUnique({
      where: { id: payload.userId },
      select: { behavioralTrackingConsent: true },
    })

    return NextResponse.json({
      behavioralTrackingConsent: user?.behavioralTrackingConsent ?? true,
    })
  } catch (error) {
    console.error('Error fetching tracking preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { behavioralTrackingConsent } = body

    if (typeof behavioralTrackingConsent !== 'boolean') {
      return NextResponse.json({ error: 'behavioralTrackingConsent must be a boolean' }, { status: 400 })
    }

    await getPrisma().user.update({
      where: { id: payload.userId },
      data: { behavioralTrackingConsent },
    })

    return NextResponse.json({ behavioralTrackingConsent })
  } catch (error) {
    console.error('Error updating tracking preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
