import { LayoutDashboard, Package, Settings, Truck, Users } from 'lucide-react'
import type { NavItem } from '../components/layout/BottomNav'

export const farmNavItems: NavItem[] = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/orders', label: '주문', icon: Package },
  { to: '/delivery', label: '배송', icon: Truck },
  { to: '/crm', label: '고객', icon: Users },
  { to: '/settings', label: '설정', icon: Settings },
]
