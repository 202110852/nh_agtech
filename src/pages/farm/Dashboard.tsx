import { LayoutDashboard, Package, Truck, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { OrderChart } from '../../components/shared/OrderChart'
import { OrderItem } from '../../components/shared/OrderItem'
import { StatCard } from '../../components/ui/StatCard'
import { farmNavItems } from '../../config/farmNav'
import { dashboardStats, farmProfile, formatPrice, orders, weeklyOrderTrend } from '../../data/mockData'

export function FarmDashboard() {
  const navigate = useNavigate()
  const recentOrders = orders.slice(0, 3)

  return (
    <AppShell navItems={farmNavItems} roleLabel="농가 관리">
      <Header
        title={farmProfile.name}
        subtitle={`${farmProfile.owner} · ${farmProfile.location}`}
      />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="오늘 주문" value={`${dashboardStats.todayOrders}건`} icon={Package} trend="전일 대비 +3건" />
          <StatCard label="배송 대기" value={`${dashboardStats.pendingDelivery}건`} icon={Truck} />
          <StatCard label="신규 고객" value={`${dashboardStats.newCustomers}명`} icon={Users} />
          <StatCard label="이번 달 매출" value={formatPrice(dashboardStats.monthlyRevenue)} icon={LayoutDashboard} />
        </div>

        <OrderChart data={weeklyOrderTrend} />

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">최근 주문</h3>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-primary font-medium"
            >
              전체보기
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <OrderItem key={order.id} order={order} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
