'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
    stock: number
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

export default function Cart() {
  const router = useRouter()
  const [cart, setCart] = useState<CartResponse['cart'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data: CartResponse = await response.json()
        setCart(data.cart)
      } else if (response.status === 401) {
        // Redirect to login if not authenticated
        router.push('/login')
      } else {
        console.error('Failed to fetch cart')
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return

    setUpdatingItems(prev => new Set(prev).add(itemId))
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        const data: CartResponse = await response.json()
        setCart(data.cart)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update quantity')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert('Error updating quantity')
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId))
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data: CartResponse = await response.json()
        setCart(data.cart)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove item')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      alert('Error removing item')
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const placeOrder = async () => {
    if (!cart || cart.items.length === 0) return

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        alert('Order placed successfully! Order ID: ' + data.order.id)
        // Clear cart after order
        setCart({ id: null, items: [], total: 0 })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart</h1>
            <Card>
              <CardContent className="py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Add some products to get started!</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

        <div className="space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                    <h3 className="text-lg font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-gray-600">{formatPrice(item.product.price)}</p>
                    <p className="text-sm text-gray-500">Stock: {item.product.stock}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={updatingItems.has(item.id) || item.quantity <= 1}
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 min-w-[3rem] text-center border border-gray-300 rounded-md">
                      {updatingItems.has(item.id) ? '...' : item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updatingItems.has(item.id) || item.quantity >= item.product.stock}
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updatingItems.has(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Total: {formatPrice(cart.total)}</span>
                <Link href="/checkout">
                  <Button size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}