'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { formatPrice } from '@/lib/currency'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: Array<{
      id: string
      url: string
      alt: string | null
    }>
  }
}

interface CartResponse {
  cart: {
    id: string | null
    items: CartItem[]
    total: number
  }
}

interface UserProfile {
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  address?: string | null
}

export default function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cart, setCart] = useState<CartResponse['cart'] | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Payment result states from callback
  const paymentStatus = searchParams.get('status')
  const reference = searchParams.get('reference')

  useEffect(() => {
    fetchCart()
    fetchProfile()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data: CartResponse = await response.json()
        setCart(data.cart)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user?.profile || null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return

    setProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = data.authorizationUrl
      } else {
        setError(data.error || 'Failed to initialize checkout')
        setProcessing(false)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('An error occurred during checkout')
      setProcessing(false)
    }
  }

  const verifyPayment = async (ref: string) => {
    setProcessing(true)
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: ref }),
      })

      const data = await response.json()
      
      if (data.success) {
        router.push(`/payment/success?orderId=${data.orderId}`)
      } else {
        router.push('/payment/failed')
      }
    } catch (err) {
      console.error('Payment verification error:', err)
      router.push('/payment/failed')
    } finally {
      setProcessing(false)
    }
  }

  // Handle payment callback
  useEffect(() => {
    if (paymentStatus && reference) {
      verifyPayment(reference)
    }
  }, [paymentStatus, reference])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading checkout...</div>
        </div>
      </div>
    )
  }

  // Payment processing state
  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {paymentStatus ? 'Verifying payment...' : 'Processing your payment...'}
              </h3>
              <p className="text-gray-600">Please wait while we confirm your payment.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
            <Card>
              <CardContent className="py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Add some products to proceed to checkout.</p>
                <Link href="/marketplace">
                  <Button>Browse Products</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 border-b border-gray-100 pb-4 last:border-0">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.images[0].alt || item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-xs text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        <p className="text-sm text-gray-500">{formatPrice(item.product.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            {profile && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {profile.firstName && (
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 text-gray-900">{profile.firstName} {profile.lastName || ''}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <span className="ml-2 text-gray-900">{profile.phone}</span>
                      </div>
                    )}
                    {profile.address && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Address:</span>
                        <span className="ml-2 text-gray-900">{profile.address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Section */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.items.length} items)</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <p className="mb-2">Secure payment powered by Paystack</p>
                  <p>Currency: GHS (Ghana Cedis)</p>
                </div>

                <Button 
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? 'Processing...' : 'Pay Now'}
                </Button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  By clicking "Pay Now", you agree to complete your purchase
                </p>
              </CardContent>
            </Card>

            <div className="mt-4 text-center">
              <Link href="/cart" className="text-sm text-blue-600 hover:text-blue-800">
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}