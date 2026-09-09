import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Rewards are now awarded automatically from the relevant action routes (login, profile update, follow vendor, wishlist add, collection create).' },
    { status: 410 }
  )
}
