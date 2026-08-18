import { Boxes, LayoutDashboard, Package, Settings, Truck } from 'lucide-react'
import type { NavItem } from '../components/layout/BottomNav'

export function farmNavItems(basePath: string): NavItem[] {
  return [
    { to: basePath, label: '대시보드', icon: LayoutDashboard, end: true },
    { to: `${basePath}/products`, label: '상품', icon: Boxes },
    { to: `${basePath}/orders`, label: '주문', icon: Package },
    { to: `${basePath}/delivery`, label: '배송', icon: Truck },
    { to: `${basePath}/settings`, label: '설정', icon: Settings },
  ]
}
