'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { formatPrice } from '@/lib/currency'

interface Order {
  id: string
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
    }
  }>
}

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        // Hide onboarding if user has orders
        if (data.orders.length > 0) {
          setShowOnboarding(false)
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Banner - Onboarding Guidance */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Account</h1>
              <p className="text-gray-600 mb-4">
                Your personal dashboard for managing orders, tracking purchases, and exploring new products.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/marketplace">
                  <Button size="sm">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Browse Marketplace
                    </span>
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="outline" size="sm">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      View Cart
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Onboarding Guidance for New Users */}
      {showOnboarding && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Getting Started</h2>
                 <p className="text-gray-600">
                   Here are a few simple steps to help you make the most of Dhream Market:
                 </p>
                <div className="space-y-3 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">Explore the Marketplace</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Browse products from verified vendors across various categories to find what you need.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">Add to Cart</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Select products and add them to your cart for easy checkout when you're ready to purchase.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">Secure Checkout</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Complete your purchase with our secure payment processing powered by Paystack.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage your personal information and account settings.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm text-gray-900">{new Date().toLocaleDateString('en-GH')}</span>
                </div>
                <Link href="/dashboard/customer/profile" className="inline-block">
                  <Button variant="outline" size="sm">
                    Update Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/cart">
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <span className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      View Shopping Cart
                    </span>
                  </Button>
                </Link>
                <Link href="/dashboard/customer/orders">
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <span className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      View All Orders
                    </span>
                  </Button>
                </Link>
                <Link href="/dashboard/customer/wishlist">
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <span className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Wishlist
                    </span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
                {orders.length > 0 && (
                  <Link href="/dashboard/customer/orders">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You haven't placed any orders yet. Browse our marketplace to find great products from verified vendors.
                  </p>
                  <Link href="/marketplace">
                    <Button size="lg">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <Link 
                      key={order.id} 
                      href={`/dashboard/customer/orders/${order.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('en-GH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(order.total)}</p>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              order.paymentStatus === 'PAID'
                                ? 'bg-green-100 text-green-800'
                                : order.paymentStatus === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.paymentStatus === 'FAILED' || order.paymentStatus === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.paymentStatus}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              order.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'PROCESSING'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'SHIPPED'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'DELIVERED'
                                ? 'bg-indigo-100 text-indigo-800'
                                : order.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}: {order.items.map(item => item.product.name).join(', ')}
                      </div>
                    </Link>
                  ))}
                  {orders.length > 5 && (
                    <div className="text-center pt-4">
                      <Link href="/dashboard/customer/orders">
                        <Button variant="outline" size="sm">
                          View All {orders.length} Orders
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Contact Support</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Have questions or need assistance? Our support team is here to help.
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" size="sm">
                      Get in Touch
                    </Button>
                  </Link>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Submit Feedback</h4>
                  <p className="text-sm text-green-800 mb-3">
                    Help us improve Dhraverse by sharing your suggestions and ideas.
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" size="sm">
                      Share Feedback
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
