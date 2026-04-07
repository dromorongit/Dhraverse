'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/Card'
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

interface Category {
  id: string
  name: string
}

export default function Marketplace() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    const categoryParam = searchParams.get('category') || ''
    setSelectedCategory(categoryParam)
    fetchProducts()
    fetchCategories()
  }, [searchParams])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category.id === selectedCategory)
    : products

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading marketplace...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Marketplace</h1>
          <p className="text-gray-600">Discover products from our trusted vendors</p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedCategory ? 'No products in this category' : 'No products available'}
              </h3>
              <p className="text-gray-600">
                {selectedCategory
                  ? 'Try selecting a different category or check back later.'
                  : 'Check back later for new products from our vendors.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <Link href={`/marketplace/product/${product.id}`}>
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg overflow-hidden">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          className="w-full h-48 object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/marketplace/product/${product.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {product.description || 'No description'}
                    </p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{product.category.name}</span>
                      <span>{product.store.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}