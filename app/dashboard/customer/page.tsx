'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/Card'
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

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your profile details will be managed here.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-600">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-gray-600">No orders yet. Start shopping!</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Link 
                      key={order.id} 
                      href={`/dashboard/customer/orders/${order.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No recent activity to display.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}