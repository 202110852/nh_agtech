import { Leaf } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { NavItem } from './BottomNav'

interface SidebarProps {
  items: NavItem[]
  roleLabel: string
}

export function Sidebar({ items, roleLabel }: SidebarProps) {
  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 md:border-r md:border-gray-100 md:bg-white md:min-h-screen">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">스테이블 퓨전</p>
            <p className="text-xs text-muted">{roleLabel}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
