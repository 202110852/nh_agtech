import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export function PageSpinner({ label = '불러오는 중...' }: { label?: string }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-3 text-sm text-muted">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p>{label}</p>
    </div>
  )
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{children}</p>
  )
}
