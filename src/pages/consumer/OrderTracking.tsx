import { Home, Package } from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { DeliveryStep } from '../../components/shared/DeliveryStep'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { formatPrice, trackingSteps } from '../../data/mockData'

const navItems = [
  { to: '/consumer', label: '홈', icon: Home },
  { to: '/consumer/tracking', label: '배송조회', icon: Package },
]

export function OrderTracking() {
  return (
    <AppShell navItems={navItems} roleLabel="소비자">
      <Header title="배송 조회" subtitle="주문번호 #O20250608001" />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-5">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">제주 감귤 5kg</h3>
            <Badge variant="primary">배송 준비중</Badge>
          </div>
          <p className="text-sm text-muted">제주 햇살농원 · {formatPrice(45000)}</p>
          <p className="mt-2 text-sm">배송지: 서울시 강남구 테헤란로 123</p>
          <p className="mt-1 text-xs text-muted">운송장: KR12345678901</p>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">배송 현황</h3>
          {trackingSteps.map((step, i) => (
            <DeliveryStep key={step.id} step={step} isLast={i === trackingSteps.length - 1} />
          ))}
        </Card>

        <Card className="bg-primary-light border-primary/20">
          <p className="text-sm text-primary font-medium">
            NH 냉장 물류창고에서 보관 중입니다. 내일 오전 중 배송 예정입니다.
          </p>
        </Card>
      </div>
    </AppShell>
  )
}
