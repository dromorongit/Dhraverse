import { Card, CardContent, CardHeader } from '@/components/Card'

export default function CustomerDashboard() {
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
              <p className="text-gray-600">Your past orders will appear here.</p>
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