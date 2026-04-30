import Link from 'next/link'
import { Button } from '@/components/Button'
import { Card, CardContent, CardHeader } from '@/components/Card'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
             <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
               Welcome to{' '}
               <span className="text-blue-600">Dhream Market</span>
             </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Powering Digital Trade - The Smart Commerce Ecosystem for businesses and people worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="px-8 py-3">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Dhraverse?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for the future of digital commerce with trust, efficiency, and scalability at its core.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Trusted Platform</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Secure, reliable infrastructure designed for B2B, B2C, and P2P transactions with enterprise-grade security.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Smart Automation</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Streamlined workflows and intelligent features that make digital trade efficient and seamless.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Scalable Growth</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built to grow with your business, from small vendors to large enterprises.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-lg text-gray-600">
              Discover products and services across our growing marketplace.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Electronics', id: 'electronics' },
              { name: 'Services', id: 'services' },
              { name: 'Fashion', id: 'fashion' },
              { name: 'Home & Garden', id: '' }
            ].map((category) => (
              <Link key={category.name} href={`/marketplace${category.id ? `?category=${category.id}` : ''}`}>
                <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm">Browse products</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vendors Preview */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join Our Vendor Network
            </h2>
            <p className="text-lg text-gray-600">
              Start selling on Dhraverse and reach customers worldwide.
            </p>
          </div>
          <div className="text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Become a Vendor</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Set up your store and start trading in our secure marketplace.
                </p>
                <Link href="/register">
                  <Button className="w-full">
                    Register as Vendor
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Digital Trade?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already using Dhraverse for their commerce needs.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8 py-3 bg-white text-blue-600 hover:bg-gray-50">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}