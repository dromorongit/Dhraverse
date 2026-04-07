import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'

export default function VendorDashboard() {
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
              <p className="text-3xl font-bold text-orange-600 mb-2">0</p>
              <p className="text-sm text-gray-600">Pending orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 mb-2">GH₵ 0.00</p>
              <p className="text-sm text-gray-600">This month</p>
            </CardContent>
          </Card>
        </div>

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
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Orders:</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}