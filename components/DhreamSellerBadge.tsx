'use client'

import Image from 'next/image'

interface DhreamSellerBadgeProps {
  className?: string
}

export default function DhreamSellerBadge({ className = 'w-5 h-5' }: DhreamSellerBadgeProps) {
  return (
    <Image
      src="/assets/images/dhreamsellerbadge.PNG"
      alt="Dhream Seller"
      width={20}
      height={20}
      className={`inline-block object-contain ${className}`}
    />
  )
}
