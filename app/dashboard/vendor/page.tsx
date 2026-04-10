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
}

export default function VendorDashboard() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [metrics, setMetrics] = useState<VendorMetrics>({
    productCount: 0,
    activeOrderCount: 0,
    revenue: 0
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
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Dashboard</h1>

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
              <p className="text-gray-600 mb-4">Add and manage your products</p>
              <Link href="/dashboard/vendor/products">
                <Button variant="outline" size="sm" className="w-full">
                  View Products
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
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          Order #{item.order.id.slice(-8)} • {new Date(item.order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                        <select
                          value={item.order.status}
                          onChange={(e) => updateOrderStatus(item.order.id, e.target.value)}
                          disabled={updatingOrders.has(item.order.id)}
                          className="text-xs px-2 py-1 rounded border border-gray-300 disabled:opacity-50"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Quantity: {item.quantity} • Customer: {item.order.user.email}
                    </div>
                  </div>
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