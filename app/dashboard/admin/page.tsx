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

interface AdminDashboardProps {
  stats: PlatformStats | null
  recentOrders: Array<{
    id: string
    createdAt: string
    user: {
      email: string
      role: string
    }
    total: number
  }>
  recentUsers: Array<{
    id: string
    email: string
    role: string
    createdAt: string
  }>
  recentVendors: Array<{
    id: string
    email: string
    role: string
    createdAt: string
    store: {
      name: string
    } | null
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentOrders, setRecentOrders] = useState<Array<{
    id: string
    createdAt: string
    user: {
      email: string
      role: string
    }
    total: number
  }>>([])
  const [recentUsers, setRecentUsers] = useState<Array<{
    id: string
    email: string
    role: string
    createdAt: string
  }>>([])
  const [recentVendors, setRecentVendors] = useState<Array<{
    id: string
    email: string
    role: string
    createdAt: string
    store: {
      name: string
    } | null
  }>>([])

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
      setRecentOrders(data.recentOrders)
      setRecentUsers(data.recentUsers)
      setRecentVendors(data.recentVendors)
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

         {/* Recent Activity */}
         <div className="mt-8">
           <Card>
             <CardHeader>
               <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
             </CardHeader>
             <CardContent>
               {loading ? (
                 <div className="space-y-4">
                   <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                   <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                   <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                 </div>
               ) : (
                 <div className="space-y-6">
                   <div>
                     <h4 className="font-medium text-gray-900 mb-2">Recent Orders</h4>
                     {recentOrders.length === 0 ? (
                       <p className="text-gray-500 text-center py-4">No recent orders</p>
                     ) : (
                       <div className="space-y-3">
                         {recentOrders.map((order) => (
                           <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                             <div className="flex-1">
                               <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                               <p className="text-xs text-gray-600">
                                 {new Date(order.createdAt).toLocaleDateString('en-GH', {
                                   year: 'numeric',
                                   month: 'short',
                                   day: 'numeric'
                                 })}
                               </p>
                             </div>
                             <div className="text-right">
                               <span className={`inline-block text-xs px-2 py-1 rounded ${
                                 order.total > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                               }`}>
                                 GH₵ {order.total.toFixed(2)}
                               </span>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                   <div>
                     <h4 className="font-medium text-gray-900 mb-2">Recent Users</h4>
                     {recentUsers.length === 0 ? (
                       <p className="text-gray-500 text-center py-4">No recent users</p>
                     ) : (
                       <div className="space-y-3">
                         {recentUsers.map((user) => (
                           <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                             <div className="flex-1">
                               <p className="text-sm font-medium text-gray-900">{user.email}</p>
                               <p className="text-xs text-gray-600">
                                 {user.role === 'ADMIN' ? '(Admin)' : user.role === 'VENDOR' ? '(Vendor)' : '(Customer)'}
                               </p>
                             </div>
                             <div className="text-right">
                               <p className="text-xs text-gray-600">
                                 {new Date(user.createdAt).toLocaleDateString('en-GH', {
                                   year: 'numeric',
                                   month: 'short',
                                   day: 'numeric'
                                 })}
                               </p>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                   <div>
                     <h4 className="font-medium text-gray-900 mb-2">Recent Vendors</h4>
                     {recentVendors.length === 0 ? (
                       <p className="text-gray-500 text-center py-4">No recent vendors</p>
                     ) : (
                       <div className="space-y-3">
                         {recentVendors.map((vendor) => (
                           <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                             <div className="flex-1">
                               <p className="text-sm font-medium text-gray-900">{vendor.email}</p>
                               <p className="text-xs text-gray-600">
                                 {vendor.store ? `Store: ${vendor.store.name}` : 'No store yet'}
                               </p>
                             </div>
                             <div className="text-right">
                               <p className="text-xs text-gray-600">
                                 {new Date(vendor.createdAt).toLocaleDateString('en-GH', {
                                   year: 'numeric',
                                   month: 'short',
                                   day: 'numeric'
                                 })}
                               </p>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>
               )}
             </CardContent>
           </Card>
         </div>
      </div>
    </div>
  )
}