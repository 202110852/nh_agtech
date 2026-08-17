import {
  CreditCard,
  LayoutDashboard,
  Package,
  Sprout,
  Truck,
  Users,
} from 'lucide-react'
import type { NavItem } from '../components/layout/BottomNav'

export const adminNavItems: NavItem[] = [
  { to: '/admin', label: '대시보드', icon: LayoutDashboard, end: true },
  { to: '/admin/applications', label: '농가 신청', icon: Users },
  { to: '/admin/farms', label: '농가', icon: Sprout },
  { to: '/admin/products', label: '상품', icon: Package },
  { to: '/admin/orders', label: '주문', icon: Package },
  { to: '/admin/deposits', label: '입금', icon: CreditCard },
  { to: '/admin/shipments', label: '송장', icon: Truck },
]
