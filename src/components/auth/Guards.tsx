import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../lib/auth'
import { PageSpinner } from '../ui/Feedback'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageSpinner />
  if (!user) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }
  return children
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { loading, user, isAdmin } = useAuth()
  if (loading) return <PageSpinner />
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />
  return children
}

export function RequireFarm({ children }: { children: ReactNode }) {
  const { loading, user, isFarmUser, latestApplication } = useAuth()
  const location = useLocation()

  if (loading) return <PageSpinner />
  if (!user) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }
  if (isFarmUser) return children
  if (latestApplication?.status === 'pending') {
    return <Navigate to="/apply/status" replace />
  }
  return <Navigate to="/apply" replace />
}
