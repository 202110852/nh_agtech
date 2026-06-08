import type { ReactNode } from 'react'
import { BottomNav, type NavItem } from './BottomNav'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: ReactNode
  navItems: NavItem[]
  roleLabel: string
}

export function AppShell({ children, navItems, roleLabel }: AppShellProps) {
  return (
    <div className="flex min-h-dvh bg-surface">
      <Sidebar items={navItems} roleLabel={roleLabel} />
      <div className="flex flex-1 flex-col min-w-0">
        <main className="flex-1 pb-20 md:pb-6">{children}</main>
        <BottomNav items={navItems} />
      </div>
    </div>
  )
}
