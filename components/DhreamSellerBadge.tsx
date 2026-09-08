'use client'

import Image from 'next/image'

interface DhreamSellerBadgeProps {
  className?: string
}

export default function DhreamSellerBadge({ className = 'h-7 w-auto max-w-none' }: DhreamSellerBadgeProps) {
  return (
    <Image
      src="/assets/images/dhreamsellerbadge.PNG"
      alt="Dhream Seller"
      width={100}
      height={100}
      className={`inline-block object-contain ${className}`}
    />
  )
}
