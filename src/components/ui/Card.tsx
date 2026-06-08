import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  const hasCustomBg = /\bbg-/.test(className)
  const hasCustomBorder = /\bborder(?:-|$)/.test(className)
  const hasCustomPadding = /\bp(?:[xytrbl])?-/.test(className)

  return (
    <div
      className={[
        'rounded-2xl shadow-sm',
        !hasCustomBg && 'bg-white',
        !hasCustomPadding && 'p-4',
        !hasCustomBorder && 'border border-gray-100',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  )
}
