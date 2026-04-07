import { Card, CardContent, CardHeader } from '@/components/Card'

export default function VendorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Store Status</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">Active</p>
              <p className="text-sm text-gray-600">Your store is live</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Total Products</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-600">Listed products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600">Completed orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">$0</p>
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
              <div className="space-y-2">
                <p className="text-gray-600">Add new products, manage inventory, and track orders.</p>
                <p className="text-sm text-gray-500">Features coming in Phase 2.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Store Overview</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Welcome to your Dhraverse vendor dashboard. Your store is set up and ready for products.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}