import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'rounded' | 'circular' | 'text'
  className?: string
}

export function Skeleton({
  variant = 'default',
  className,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-lg',
    rounded: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-lg w-full',
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-100',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
    </div>
  )
}

// Compound components for common skeleton patterns
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <Skeleton variant="rounded" className="h-48 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === 0 ? 'w-3/4' : i === 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}