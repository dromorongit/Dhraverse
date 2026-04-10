'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'

export default function PaymentFailed() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-8">
            {/* Failure Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
              <p className="text-gray-600 mt-2">Your payment could not be completed</p>
            </div>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                The payment was not completed. This could be due to:
              </p>
              <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                <li>Insufficient funds in your account</li>
                <li>Card declined or expired</li>
                <li>Network or connection issues</li>
                <li>Cancellation by user</li>
              </ul>
            </div>

            {/* Info Message */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                No charges have been made to your account. You can try again or use a different payment method.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/checkout" className="flex-1">
                <Button className="w-full">
                  Try Again
                </Button>
              </Link>
              <Link href="/cart" className="flex-1">
                <Button variant="outline" className="w-full">
                  Return to Cart
                </Button>
              </Link>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Need help? <Link href="/contact" className="text-blue-600 hover:text-blue-800">Contact support</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}