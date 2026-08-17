import type { ReactNode } from 'react'

export function PageSpinner({ label = '불러오는 중...' }: { label?: string }) {
  return (
    <div className="min-h-dvh flex items-center justify-center text-sm text-muted">
      {label}
    </div>
  )
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{children}</p>
  )
}
