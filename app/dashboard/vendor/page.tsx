'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { formatPrice } from '@/lib/currency'

interface OrderItem {
  id: string
  quantity: number
  price: number
  order: {
    id: string
    status: string
    createdAt: string
    user: {
      id: string
      email: string
    }
  }
  product: {
    id: string
    name: string
  }
}

interface VendorMetrics {
  productCount: number
  activeOrderCount: number
  revenue: number
  averageRating: number
  totalReviews: number
  bestSellers: Array<{
    productId: string
    productName: string
    totalSold: number
  }>
  totalPaidOrders: number
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  action: string
  href: string
}

export default function VendorDashboard() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [metrics, setMetrics] = useState<VendorMetrics>({
    productCount: 0,
    activeOrderCount: 0,
    revenue: 0,
    averageRating: 0,
    totalReviews: 0,
    bestSellers: [],
    totalPaidOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchVendorOrders()
    fetchMetrics()
  }, [])

  const fetchVendorOrders = async () => {
    try {
      const response = await fetch('/api/vendor/orders')
      if (response.ok) {
        const data = await response.json()
        setOrderItems(data.orderItems)
      }
    } catch (error) {
      console.error('Error fetching vendor orders:', error)
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/vendor/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching vendor metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrders(prev => new Set(prev).add(orderId))
    try {
      const response = await fetch(`/api/vendor/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh orders and metrics
        await fetchVendorOrders()
        await fetchMetrics()
      } else {
        const error = await response.json()
        console.error('API error response:', error)
        alert(error.error || error.details || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error updating order status')
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  // Onboarding steps
  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'store',
      title: 'Store Profile',
      description: 'Set up your store information to build trust with customers',
      completed: metrics.productCount > 0,
      action: metrics.productCount > 0 ? 'View Store' : 'Set Up',
      href: '/dashboard/vendor/store'
    },
    {
      id: 'products',
      title: 'Add Products',
      description: 'List your products to start selling on the marketplace',
      completed: metrics.productCount > 0,
      action: metrics.productCount > 0 ? 'Manage Products' : 'Add Product',
      href: '/dashboard/vendor/products'
    },
    {
      id: 'orders',
      title: 'First Sale',
      description: 'Complete your first order to unlock vendor features',
      completed: metrics.totalPaidOrders > 0,
      action: metrics.totalPaidOrders > 0 ? 'View Orders' : 'Wait for Orders',
      href: '/dashboard/vendor/orders'
    },
    {
      id: 'reviews',
      title: 'Customer Reviews',
      description: 'Build trust by earning positive reviews from customers',
      completed: metrics.totalReviews > 0,
      action: metrics.totalReviews > 0 ? 'View Reviews' : 'Await Reviews',
      href: '/dashboard/vendor/orders'
    }
  ]

  const completedSteps = onboardingSteps.filter(step => step.completed).length
  const isFullyOnboarded = completedSteps === onboardingSteps.length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Dashboard</h1>

        {/* Onboarding Progress Section */}
        {!isFullyOnboarded && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                 <div>
                   <h2 className="text-xl font-semibold text-gray-900">Get Started on Dhream Market</h2>
                   <p className="text-gray-600">Complete these steps to maximize your store's potential</p>
                 </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">{completedSteps} of {onboardingSteps.length} steps</span>
                  <div className="w-24 h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-500" 
                      style={{ width: `${(completedSteps / onboardingSteps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {onboardingSteps.map((step) => (
                  <div 
                    key={step.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      step.completed 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {step.completed ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-white text-sm font-bold">{step.id === 'store' ? '1' : step.id === 'products' ? '2' : step.id === 'orders' ? '3' : '4'}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-sm font-semibold ${
                          step.completed ? 'text-green-800' : 'text-blue-900'
                        }`}>{step.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                        <Link 
                          href={step.href}
                          className={`inline-block mt-2 text-xs font-medium ${
                            step.completed ? 'text-green-700 hover:text-green-800' : 'text-blue-700 hover:text-blue-800'
                          }`}
                        >
                          {step.action} →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isFullyOnboarded && (
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome to Your Store!</h2>
                  <p className="text-gray-600">
                    Your store is fully set up and ready to sell. You've completed all onboarding steps!
                  </p>
                </div>
                <Link href="/marketplace">
                  <Button variant="outline">
                    View Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">My Store</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage your store profile and settings</p>
              <Link href="/dashboard/vendor/store">
                <Button size="sm" className="w-full">
                  Manage Store
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Products</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {loading ? '...' : metrics.productCount}
              </p>
              <p className="text-sm text-gray-600">Products listed</p>
              <Link href="/dashboard/vendor/products" className="mt-3 inline-block">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Products
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600 mb-2">
                {loading ? '...' : metrics.activeOrderCount}
              </p>
              <p className="text-sm text-gray-600">Active orders</p>
              <Link href="/dashboard/vendor/orders" className="mt-3 inline-block">
                <Button variant="outline" size="sm" className="w-full">
                  View Orders
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 mb-2">
                {loading ? '...' : `GH₵ ${metrics.revenue.toFixed(2)}`}
              </p>
              <p className="text-sm text-gray-600">Total completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rating & Reviews Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : metrics.totalReviews === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-2">No reviews yet</p>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto">
                    Reviews will appear here when customers rate your products. 
                    Great products and excellent service lead to positive reviews!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {metrics.averageRating.toFixed(1)}
                    </div>
                    <div>
                      {renderStars(metrics.averageRating)}
                      <p className="text-sm text-gray-600 mt-1">
                        Based on {metrics.totalReviews} review{metrics.totalReviews !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Best Sellers Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Best Sellers</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : metrics.bestSellers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-2">No sales yet</p>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto">
                    Best-selling products will appear here once you start making sales.
                    Promote your products to increase visibility!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.bestSellers.map((seller, index) => (
                    <div key={seller.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-900">{seller.productName}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {seller.totalSold} sold
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Paid Orders</p>
            <p className="text-2xl font-bold text-gray-900">{loading ? '...' : metrics.totalPaidOrders}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">{loading ? '...' : formatPrice(metrics.revenue)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : metrics.averageRating.toFixed(1)}</p>
              {!loading && metrics.totalReviews > 0 && renderStars(metrics.averageRating)}
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-600">Loading orders...</p>
            ) : orderItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">No orders yet</p>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Your orders will appear here once customers start purchasing your products.
                  Share your store link to attract more buyers!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.slice(0, 10).map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/dashboard/vendor/orders/${item.order.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          Order #{item.order.id.slice(-8)} • {new Date(item.order.createdAt).toLocaleDateString('en-GH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                        <span className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
                          item.order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : item.order.status === 'PROCESSING'
                            ? 'bg-blue-100 text-blue-800'
                            : item.order.status === 'SHIPPED'
                            ? 'bg-purple-100 text-purple-800'
                            : item.order.status === 'DELIVERED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : item.order.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Quantity: {item.quantity} • Customer: {item.order.user.email}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/vendor/products/new">
                  <Button variant="outline" className="w-full justify-start">
                    + Add New Product
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button variant="outline" className="w-full justify-start">
                    View Marketplace
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="w-full justify-start">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
            </CardHeader>
            <CardContent>
               <p className="text-gray-600 mb-4">
                 Our support team is here to help you succeed on Dhream Market.
               </p>
              <div className="space-y-2">
                <Link href="/contact" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    Submit Feedback
                  </Button>
                </Link>
                <a href="mailto:support@dhraverse.com" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    Email Support
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
