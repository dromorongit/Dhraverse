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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Dashboard</h1>

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
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No reviews yet</p>
                  <p className="text-sm text-gray-400">Reviews will appear here when customers rate your products</p>
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
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No sales yet</p>
                  <p className="text-sm text-gray-400">Best-selling products will appear here</p>
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
              <p className="text-gray-600">No orders yet. Your products will appear here when customers make purchases.</p>
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
                          Order #{item.order.id.slice(-8)} • {new Date(item.order.createdAt).toLocaleDateString()}
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Store Status</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Store Setup:</span>
                  <span className="font-medium text-green-600">Complete</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Products Listed:</span>
                  <span className="font-medium">{loading ? '...' : metrics.productCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Orders:</span>
                  <span className="font-medium">{loading ? '...' : metrics.activeOrderCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}