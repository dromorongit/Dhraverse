'use client'

import { useState, useEffect } from 'react'
import { Button } from './Button'
import { Badge } from './Badge'

interface VendorFollowButtonProps {
  vendorId: string
  initialFollowerCount?: number
}

export function VendorFollowButton({ vendorId, initialFollowerCount = 0 }: VendorFollowButtonProps) {
  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/vendors/${vendorId}/follow`)
        if (!response.ok) {
          setLoading(false)
          return
        }
        const data = await response.json()
        if (!cancelled) {
          setFollowing(!!data.isFollowing)
          if (typeof data.followerCount === 'number') {
            setFollowerCount(data.followerCount)
          }
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStatus()
    return () => { cancelled = true }
  }, [vendorId])

  const toggleFollow = async () => {
    if (loading) return
    try {
      const response = await fetch(`/api/vendors/${vendorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        setFollowing(data.followed)
        setFollowerCount((prev) => (data.followed ? prev + 1 : prev - 1))
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" disabled>
          ...
        </Button>
        <span className="text-sm text-gray-500">{followerCount} followers</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={following ? 'primary' : 'outline'}
        size="sm"
        onClick={toggleFollow}
      >
        {following ? 'Following' : 'Follow'}
      </Button>
      <span className="text-sm text-gray-500">{followerCount} followers</span>
    </div>
  )
}