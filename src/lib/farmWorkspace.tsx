import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { PageSpinner } from '../components/ui/Feedback'
import { farmNavItems } from '../config/farmNav'
import type { Farm } from '../types/models'
import { useAuth } from './auth'
import { supabase } from './supabase'

interface FarmWorkspaceValue {
  farm: Farm
  basePath: string
  isAdminView: boolean
  refreshFarm: () => Promise<void>
}

const FarmWorkspaceContext = createContext<FarmWorkspaceValue | null>(null)

export function useFarmWorkspace() {
  const ctx = useContext(FarmWorkspaceContext)
  if (!ctx) throw new Error('useFarmWorkspace는 농가 워크스페이스 안에서만 사용할 수 있습니다.')
  return ctx
}

export function FarmOwnerLayout() {
  const { currentFarm } = useAuth()
  if (!currentFarm) return null
  return (
    <FarmWorkspaceProvider farm={currentFarm} basePath="/manage" isAdminView={false}>
      <FarmShell />
    </FarmWorkspaceProvider>
  )
}

export function AdminFarmLayout() {
  const { farmId = '' } = useParams()
  const [farm, setFarm] = useState<Farm | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    supabase
      .from('farms')
      .select('*')
      .eq('id', farmId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setFarm((data as Farm) ?? null)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [farmId])

  if (loading) return <PageSpinner />
  if (!farm) return <Navigate to="/admin/farms" replace />

  return (
    <FarmWorkspaceProvider farm={farm} basePath={`/admin/farms/${farm.id}`} isAdminView>
      <FarmShell />
    </FarmWorkspaceProvider>
  )
}

function FarmWorkspaceProvider({
  farm: farmProp,
  basePath,
  isAdminView,
  children,
}: {
  farm: Farm
  basePath: string
  isAdminView: boolean
  children: ReactNode
}) {
  const [farm, setFarm] = useState(farmProp)

  useEffect(() => {
    setFarm(farmProp)
  }, [farmProp])

  const refreshFarm = useCallback(async () => {
    const { data } = await supabase.from('farms').select('*').eq('id', farmProp.id).maybeSingle()
    if (data) setFarm(data as Farm)
  }, [farmProp.id])

  const value = useMemo<FarmWorkspaceValue>(
    () => ({ farm, basePath, isAdminView, refreshFarm }),
    [farm, basePath, isAdminView, refreshFarm],
  )

  return <FarmWorkspaceContext.Provider value={value}>{children}</FarmWorkspaceContext.Provider>
}

function FarmShell() {
  const { farm, basePath, isAdminView } = useFarmWorkspace()
  const navItems = isAdminView
    ? farmNavItems(basePath).filter((item) => !item.to.endsWith('/settings'))
    : farmNavItems(basePath)

  return (
    <AppShell
      navItems={navItems}
      roleLabel={isAdminView ? `관리자 · ${farm.name}` : '농가'}
      settingsPath={isAdminView ? '/admin/none' : `${basePath}/settings`}
    >
      <Outlet />
    </AppShell>
  )
}
