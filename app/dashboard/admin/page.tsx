'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/Card'

interface PlatformStats {
  totalUsers: number
  totalVendors: number
  totalProducts: number
  totalOrders: number
  verifiedVendors: number
  totalRevenue: number
  totalReviews: number
  totalCategories: number
  paidOrderCount: number
}

interface RecentItem {
  id: string
  createdAt: string
  email?: string
  role?: string
  status?: string
  total?: number
  name?: string
  isVerified?: boolean
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Failed to load stats')
        return
      }
      
      setStats(data.stats)
    } catch (err) {
      setError('Failed to fetch stats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={fetchStats}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Platform overview and management</p>
          </div>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {stats?.totalUsers.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Active Vendors</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {stats?.totalVendors.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">
                {stats?.verifiedVendors.toLocaleString() || 0} verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Total Products</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {stats?.totalProducts.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">Listed items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">
                {stats?.totalOrders.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">
                {stats?.paidOrderCount.toLocaleString() || 0} paid
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Card */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700">
            <CardHeader className="bg-transparent">
              <h3 className="text-lg font-semibold text-white">Total Platform Revenue</h3>
            </CardHeader>
            <CardContent className="bg-transparent">
              <p className="text-4xl font-bold text-white">
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-blue-100 mt-1">
                From {stats?.paidOrderCount.toLocaleString() || 0} paid orders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-700">
                {stats?.totalCategories.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">Product categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-700">
                {stats?.totalReviews.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">Customer reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Verified Vendors</h3>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-700">
                {stats?.verifiedVendors.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">
                {stats?.totalVendors ? Math.round((stats.verifiedVendors / stats.totalVendors) * 100) : 0}% of vendors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/dashboard/admin/users"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-600">View and manage platform users</p>
                </a>
                <a
                  href="/dashboard/admin/vendors"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-900">Manage Vendors</p>
                  <p className="text-sm text-gray-600">Verify and manage vendor stores</p>
                </a>
                <a
                  href="/dashboard/admin/products"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-900">Manage Products</p>
                  <p className="text-sm text-gray-600">Oversee platform products</p>
                </a>
                <a
                  href="/dashboard/admin/orders"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-900">View Orders</p>
                  <p className="text-sm text-gray-600">Track all platform orders</p>
                </a>
                <a
                  href="/dashboard/admin/payments"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-900">View Payments</p>
                  <p className="text-sm text-gray-600">Payment records</p>
                </a>
                <a
                  href="/dashboard/admin/categories"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-900">Categories</p>
                  <p className="text-sm text-gray-600">Manage categories</p>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Platform Status</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Database</span>
                  </div>
                  <span className="text-green-700 text-sm font-medium">Connected</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">API Services</span>
                  </div>
                  <span className="text-green-700 text-sm font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Payment Gateway</span>
                  </div>
                  <span className="text-green-700 text-sm font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Platform Version</span>
                  </div>
                  <span className="text-blue-700 text-sm font-medium">Phase 7</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}