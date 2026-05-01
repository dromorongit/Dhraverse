import { HTMLAttributes } from 'react'
import Link from 'next/link'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title = 'No items found',
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm max-w-sm mb-8">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary" size="md">
            {actionLabel}
          </Button>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  )
}