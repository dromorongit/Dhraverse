'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from './Button'

interface User {
  userId: string
  role: string
}

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(err => console.error('Failed to get user:', err))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                <Image
                  src="/assets/images/Dhraverselogo.PNG"
                  alt="Dhraverse Logo"
                  width={64}
                  height={64}
                />
                <span className="text-2xl font-bold text-blue-600">Dhraverse</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/marketplace"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Marketplace
              </Link>
              {user && (
                <Link
                  href="/cart"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Cart
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">Welcome, {user.role}</span>
                {user.role === 'ADMIN' && (
                  <Link href="/dashboard/admin">
                    <Button variant="outline" size="sm">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === 'VENDOR' && (
                  <Link href="/dashboard/vendor">
                    <Button variant="outline" size="sm">
                      Vendor Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === 'CUSTOMER' && (
                  <Link href="/dashboard/customer">
                    <Button variant="outline" size="sm">
                      My Account
                    </Button>
                  </Link>
                )}
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
          <Link
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link
            href="/marketplace"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            onClick={closeMobileMenu}
          >
            Marketplace
          </Link>
          {user && (
            <Link
              href="/cart"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={closeMobileMenu}
            >
              Cart
            </Link>
          )}
          <div className="border-t border-gray-200 pt-4 pb-3">
            {user ? (
              <div className="space-y-3">
                <div className="px-3">
                  <p className="text-base font-medium text-gray-800">Welcome, {user.role}</p>
                </div>
                {user.role === 'ADMIN' && (
                  <Link href="/dashboard/admin" onClick={closeMobileMenu}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === 'VENDOR' && (
                  <Link href="/dashboard/vendor" onClick={closeMobileMenu}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Vendor Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === 'CUSTOMER' && (
                  <Link href="/dashboard/customer" onClick={closeMobileMenu}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      My Account
                    </Button>
                  </Link>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link href="/login" onClick={closeMobileMenu}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMobileMenu}>
                  <Button size="sm" className="w-full justify-start">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}