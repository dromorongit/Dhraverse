'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/Card'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  parentId: string | null
  createdAt: string
  children?: Category[]
  _count?: {
    products: number
  }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', parentId: '' })

  const fetchCategories = useCallback(async (includeChildren = true) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/categories?includeChildren=${includeChildren}`)
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Failed to load categories')
        return
      }
      
      setCategories(data.categories)
    } catch (err) {
      setError('Failed to fetch categories')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Category name is required')
      return
    }

    try {
      setSaving(true)
      
      const payload = {
        name: formData.name.trim(),
        parentId: formData.parentId || null,
      }

      let response
      if (editingCategory) {
        response = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCategory.id, ...payload }),
        })
      } else {
        response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      
      const data = await response.json()
      
      if (!response.ok) {
        alert(data.error || 'Failed to save category')
        return
      }
      
      // Reset form and refresh
      setShowForm(false)
      setEditingCategory(null)
      setFormData({ name: '', parentId: '' })
      fetchCategories()
    } catch (err) {
      alert('Failed to save category')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories?id=${categoryId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        alert(data.error || 'Failed to delete category')
        return
      }
      
      fetchCategories()
    } catch (err) {
      alert('Failed to delete category')
      console.error(err)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, parentId: category.parentId || '' })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({ name: '', parentId: '' })
  }

  if (error && !categories.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/dashboard/admin" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button onClick={() => fetchCategories()} className="mt-2 text-sm text-red-600 hover:underline">
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderCategoryRow = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0
    
    return (
      <div key={category.id}>
        <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 border-b">
          <div 
            className="flex-1 flex items-center gap-2"
            style={{ paddingLeft: level * 24 }}
          >
            {level > 0 && (
              <div className="w-6 h-px bg-gray-300"></div>
            )}
            <span className="text-sm font-medium text-gray-900">{category.name}</span>
            {hasChildren && (
              <span className="text-xs text-gray-500">({category.children?.length} subcategories)</span>
            )}
          </div>
          <div className="text-sm text-gray-600 w-24">
            {category._count?.products || 0} products
          </div>
          <div className="text-sm text-gray-500 w-32">
            {new Date(category.createdAt).toLocaleDateString()}
          </div>
          <div className="flex gap-3 w-32">
            <button
              onClick={() => handleEdit(category)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
        {hasChildren && category.children?.map((child) => renderCategoryRow(child, level + 1))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/dashboard/admin" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">Manage product categories</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Category
            </button>
          )}
        </div>

        {/* Category Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category (optional)
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No parent (top-level category)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <Card>
          <CardHeader className="border-b">
            <h2 className="text-lg font-semibold">Category List</h2>
          </CardHeader>
          {loading ? (
            <CardContent className="p-8 text-center">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          ) : categories.length === 0 ? (
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">No categories yet</p>
            </CardContent>
          ) : (
            <>
              <div className="hidden md:flex items-center px-6 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase">
                <div className="flex-1">Name</div>
                <div className="w-24">Products</div>
                <div className="w-32">Created</div>
                <div className="w-32">Actions</div>
              </div>
              {categories.map((category) => renderCategoryRow(category))}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}