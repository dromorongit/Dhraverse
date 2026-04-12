'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { formatPrice } from '@/lib/currency'

interface CartResponse {
  cart: {
    id: string | null
    items: Array<any>
    total: number
  }
}

interface Review {
  id: string
  rating: number
  comment: string | null
  isVerified: boolean
  createdAt: string
  reviewer: string
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category?: {
    id: string
    name: string
  }
  store?: {
    id: string
    name: string
    isVerified?: boolean
  }
  images: Array<{
    id: string
    url: string
    alt: string | null
  }>
}

interface User {
  id: string
  role: string
  email: string
}

export default function ProductDetail() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  
  // User state
  const [user, setUser] = useState<User | null>(null)
  const [canReview, setCanReview] = useState(false)
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetchProduct()
    fetchUser()
  }, [productId])

  useEffect(() => {
    if (productId && user) {
      fetchReviews()
    }
  }, [productId, user])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

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

  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setAverageRating(data.averageRating)
        setTotalReviews(data.totalReviews)
        
        // Check if user can review
        if (user && user.role === 'CUSTOMER') {
          checkCanReview()
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const checkCanReview = async () => {
    try {
      // The backend will check if user has purchased and received the product
      const response = await fetch(`/api/reviews?productId=${productId}&checkEligibility=true`, {
        headers: {
          'Authorization': `Bearer ${document.cookie?.match(/token=([^;]+)/)?.[1]}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCanReview(data.canReview)
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error)
    }
  }

  const addToCart = async () => {
    if (!product || addingToCart) return

    setAddingToCart(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        const data: CartResponse = await response.json()
        alert('Product added to cart!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Error adding to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const submitReview = async () => {
    if (!user || submittingReview) return

    setSubmittingReview(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      })

      if (response.ok) {
        alert('Review submitted successfully!')
        setShowReviewForm(false)
        setReviewRating(5)
        setReviewComment('')
        fetchReviews()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error submitting review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={`text-2xl ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    )
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
              <p className="text-lg text-gray-600 mb-4 flex items-center gap-2">
                by {product.store?.name || 'Unknown Store'}
                {product.store?.isVerified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    ✓ Verified
                  </span>
                )}
              </p>
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
              
              {/* Rating Display */}
              {totalReviews > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  {renderStars(Math.round(averageRating))}
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)} ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mb-4">
                Category: {product.category?.name || 'Unknown Category'}
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
                    <span className="font-medium flex items-center gap-2">
                      {product.store?.name || 'Unknown Store'}
                      {product.store?.isVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          ✓ Verified
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.category?.name || 'Unknown Category'}</span>
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
                disabled={product.stock === 0 || addingToCart}
                size="lg"
                onClick={addToCart}
              >
                {addingToCart
                  ? 'Adding...'
                  : product.stock > 0
                  ? 'Add to Cart'
                  : 'Out of Stock'
                }
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            {user && user.role === 'CUSTOMER' && !showReviewForm && (
              <Button onClick={() => setShowReviewForm(true)} variant="outline">
                Write a Review
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Write Your Review</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    {renderStars(reviewRating, true, (r) => setReviewRating(r))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review (optional)
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Share your experience with this product..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={submitReview}
                      disabled={submittingReview}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReviewForm(false)
                        setReviewRating(5)
                        setReviewComment('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        {review.isVerified && (
                          <span className="text-xs text-green-600 flex items-center">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      By {review.reviewer}
                    </p>
                    {review.comment && (
                      <p className="text-gray-700">{review.comment}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}