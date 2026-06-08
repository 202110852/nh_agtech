import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'accent' | 'neutral' | 'cold'
  className?: string
}

const variants = {
  primary: 'bg-primary-light text-primary',
  accent: 'bg-amber-100 text-amber-700',
  neutral: 'bg-gray-100 text-gray-600',
  cold: 'bg-blue-50 text-blue-700',
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
