'use client'

import Image from 'next/image'
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary-image'

interface DhreamSellerBadgeProps {
  className?: string
}

export default function DhreamSellerBadge({ className = 'h-7 w-auto max-w-none' }: DhreamSellerBadgeProps) {
  return (
    <Image
      src={getOptimizedCloudinaryUrl('https://res.cloudinary.com/doqfxvcy2/image/upload/v1789091545/dhream-market/images/ud1wwibcsxmz9kfmua5s.png')}
      alt="Dhream Seller"
      width={100}
      height={100}
      className={`inline-block object-contain ${className}`}
    />
  )
}
