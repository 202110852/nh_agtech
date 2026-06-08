import type { ReactNode } from 'react'
import { BottomNav, type NavItem } from './BottomNav'
import { NavContext } from './NavContext'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: ReactNode
  navItems: NavItem[]
  roleLabel: string
}

const SETTINGS_PATH = '/settings'

export function AppShell({ children, navItems, roleLabel }: AppShellProps) {
  const mobileSettingsItem = navItems.find((item) => item.to === SETTINGS_PATH)
  const bottomNavItems = mobileSettingsItem
    ? navItems.filter((item) => item.to !== SETTINGS_PATH)
    : navItems

  return (
    <NavContext.Provider value={{ mobileSettingsItem }}>
      <div className="flex min-h-dvh bg-surface">
        <Sidebar items={navItems} roleLabel={roleLabel} />
        <div className="flex flex-1 flex-col min-w-0">
          <main className="flex-1 pb-20 md:pb-6">{children}</main>
          <BottomNav items={bottomNavItems} />
        </div>
      </div>
    </NavContext.Provider>
  )
}
