import { Check, Snowflake } from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { farmNavItems } from '../../config/farmNav'
import { farmProfile } from '../../data/mockData'

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '29,000',
    features: ['주문·배송 관리', '기본 CRM', '우체국 간편 접수'],
    current: false,
  },
  {
    id: 'pro',
    name: 'NH 연동 Pro',
    price: '49,000',
    features: ['Basic 전체 기능', 'NH 콜드체인 연동', '씽씽몰 채널 연동', '익일 배송 최적화'],
    current: true,
  },
]

export function FarmSettings() {
  return (
    <AppShell navItems={farmNavItems} roleLabel="농가 관리">
      <Header title="설정" subtitle={farmProfile.name} />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-5">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">농가 정보</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">농가명</span>
              <span className="font-medium">{farmProfile.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">대표</span>
              <span className="font-medium">{farmProfile.owner}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">지역</span>
              <span className="font-medium">{farmProfile.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">품목</span>
              <span className="font-medium">{farmProfile.product}</span>
            </div>
          </div>
        </Card>

        <Card className="bg-primary-light border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Snowflake className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold text-gray-900">NH 콜드체인 연동</h4>
                <p className="text-xs text-muted">씽씽몰 · 냉장 물류창고</p>
              </div>
            </div>
            <Badge variant="primary">
              <Check className="mr-1 h-3 w-3" />
              연동됨
            </Badge>
          </div>
        </Card>

        <section>
          <h3 className="font-semibold text-gray-900 mb-3">이용 요금제</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={plan.current ? 'ring-2 ring-primary' : ''}
              >
                {plan.current && (
                  <Badge className="mb-2">현재 플랜</Badge>
                )}
                <h4 className="text-lg font-bold">{plan.name}</h4>
                <p className="mt-1">
                  <span className="text-2xl font-bold text-primary">₩{plan.price}</span>
                  <span className="text-sm text-muted">/월</span>
                </p>
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        <Card>
          <h4 className="font-semibold text-gray-900 mb-2">NH 연동 혜택</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>· 수수료 0% 농가 직판 채널 확보</li>
            <li>· NH 기반 신뢰성 있는 판매 채널</li>
            <li>· 초신선·고품질 이미지 구축</li>
            <li>· 지역화폐 연동으로 수수료 절감</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  )
}
