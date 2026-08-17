import { LayoutDashboard, Package, Settings, Truck } from 'lucide-react'
import type { NavItem } from '../components/layout/BottomNav'

export const farmNavItems: NavItem[] = [
  { to: '/farm', label: '대시보드', icon: LayoutDashboard, end: true },
  { to: '/farm/orders', label: '주문', icon: Package },
  { to: '/farm/delivery', label: '배송', icon: Truck },
  { to: '/farm/settings', label: '설정', icon: Settings },
]
