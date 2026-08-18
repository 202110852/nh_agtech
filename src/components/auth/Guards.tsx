import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { PageSpinner } from '../ui/Feedback'
import { dismissPath, useLoginSheet } from './LoginSheet'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { openLogin } = useLoginSheet()
  const next = `${location.pathname}${location.search}`

  useEffect(() => {
    if (loading || user) return
    openLogin({ next, dismissTo: dismissPath(location.pathname) })
  }, [loading, user, next, location.pathname, openLogin])

  if (loading) return <PageSpinner />
  if (!user) return <div className="min-h-dvh bg-surface" />
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
  const { openLogin } = useLoginSheet()
  const next = `${location.pathname}${location.search}`

  useEffect(() => {
    if (loading || user) return
    openLogin({ next, dismissTo: '/' })
  }, [loading, user, next, openLogin])

  if (loading) return <PageSpinner />
  if (!user) return <div className="min-h-dvh bg-surface" />
  if (isFarmUser) return children
  if (latestApplication?.status === 'pending') {
    return <Navigate to="/apply/status" replace />
  }
  return <Navigate to="/apply" replace />
}
