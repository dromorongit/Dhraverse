'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { formatPrice } from '@/lib/currency'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category: {
    id: string
    name: string
  }
  store: {
    id: string
    name: string
  }
  images: Array<{
    id: string
    url: string
    alt: string | null
  }>
}

export default function ProductDetail() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
      } else {
        alert('Product not found')
        router.push('/marketplace')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Error loading product')
      router.push('/marketplace')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading product...</div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <Button onClick={() => router.push('/marketplace')}>
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push('/marketplace')}
          className="text-blue-600 hover:text-blue-800 mb-8 inline-flex items-center"
        >
          ← Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImageIndex].url}
                  alt={product.images[selectedImageIndex].alt || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-w-1 aspect-h-1 bg-gray-200 rounded border-2 overflow-hidden ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-4">by {product.store.name}</p>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
                <span className={`text-sm px-2 py-1 rounded ${
                  product.stock > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Category: {product.category.name}
              </p>
            </div>

            {product.description && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Store:</span>
                    <span className="font-medium">{product.store.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.category.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-medium">{product.stock} units</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                className="w-full"
                disabled={product.stock === 0}
                size="lg"
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <p className="text-sm text-gray-500 text-center">
                * Purchase functionality coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}