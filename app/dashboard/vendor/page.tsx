import { Card, CardContent, CardHeader } from '@/components/Card'

export default function VendorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Dashboard</h1>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Store Overview</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your store setup will be available in future phases.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600">Received orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Store Rating</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">N/A</p>
              <p className="text-sm text-gray-600">Customer reviews</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}