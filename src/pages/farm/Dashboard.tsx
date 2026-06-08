import { LayoutDashboard, Package, Truck, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { OrderItem } from '../../components/shared/OrderItem'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { farmNavItems } from '../../config/farmNav'
import { dashboardStats, farmProfile, formatPrice, orders } from '../../data/mockData'

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

        <Card className="bg-primary text-white border-0">
          <h3 className="font-bold">우체국 택배 간편 사전 접수</h3>
          <p className="mt-1 text-sm text-white/80">
            배송 대기 주문을 한 번에 접수하고 운송장을 자동 생성하세요
          </p>
          <Button
            variant="secondary"
            className="mt-3 !bg-white !text-primary hover:!bg-white/90"
            onClick={() => navigate('/delivery')}
          >
            간편 접수하기
          </Button>
        </Card>

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
