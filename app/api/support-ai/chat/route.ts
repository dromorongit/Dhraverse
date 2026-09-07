import { NextRequest, NextResponse } from 'next/server'
import { getSupportEngine } from '@/lib/support-ai/engine'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const rateLimitCheck = rateLimit('support-ai-chat')(request)
  if (rateLimitCheck.success !== true) {
    return rateLimitCheck.response
  }

  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string.' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message must be 2000 characters or fewer.' },
        { status: 400 }
      )
    }

    const token = request.cookies.get('token')?.value
    const engine = getSupportEngine()
    const result = await engine.chat({ message: message.trim() }, token)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[SupportAI] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
