import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, type Role } from './lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = {
    '/dashboard/admin': ['ADMIN'],
    '/dashboard/vendor': ['VENDOR', 'ADMIN'],
    '/dashboard/customer': ['CUSTOMER', 'VENDOR', 'ADMIN'],
  }

  // Check if the current path is protected
  const protectedRoute = Object.keys(protectedRoutes).find(route =>
    pathname.startsWith(route)
  )

  if (protectedRoute) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const allowedRoles = protectedRoutes[protectedRoute as keyof typeof protectedRoutes]
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}