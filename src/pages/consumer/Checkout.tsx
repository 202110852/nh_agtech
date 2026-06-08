import { CreditCard, Landmark, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { PaymentMethod } from '../../data/mockData'
import { formatPrice, getProductById } from '../../data/mockData'

const paymentOptions: { id: PaymentMethod; label: string; desc: string; icon: typeof CreditCard }[] = [
  { id: 'card', label: '카드 결제', desc: '에스크로 · PG사 연동', icon: CreditCard },
  { id: 'virtual', label: '가상계좌', desc: '무통장 입금', icon: Landmark },
  { id: 'local', label: '지역화폐', desc: '수수료 절감 · 지역 활성화', icon: Wallet },
]

export function Checkout() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const product = getProductById(id ?? '')
  const [payment, setPayment] = useState<PaymentMethod>('card')

  if (!product) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-muted">상품을 찾을 수 없습니다</p>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/consumer/tracking')
  }

  return (
    <div className="min-h-dvh bg-surface pb-24">
      <Header title="주문하기" showBack />
      <form onSubmit={handleSubmit} className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-5">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">주문 상품</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{product.name} {product.weight}</p>
              <p className="text-sm text-muted">{product.farmName}</p>
            </div>
            <p className="font-bold text-primary">{formatPrice(product.price)}</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">배송지 정보</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted">받는 분</label>
              <input
                type="text"
                defaultValue="홍길동"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">연락처</label>
              <input
                type="tel"
                defaultValue="010-0000-0000"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">주소</label>
              <input
                type="text"
                defaultValue="서울시 강남구 테헤란로 123"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">결제 수단</h3>
          <div className="space-y-2">
            {paymentOptions.map(({ id: pid, label, desc, icon: Icon }) => (
              <button
                key={pid}
                type="button"
                onClick={() => setPayment(pid)}
                className={`w-full flex items-center gap-3 rounded-xl p-3 border-2 transition-colors text-left ${
                  payment === pid ? 'border-primary bg-primary-light' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <Icon className={`h-5 w-5 ${payment === pid ? 'text-primary' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="bg-primary-light border-primary/20">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">총 결제 금액</span>
            <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">배송비 포함 · 익일 배송</p>
        </Card>

        <Button type="submit" fullWidth size="lg">
          {formatPrice(product.price)} 결제하기
        </Button>
      </form>
    </div>
  )
}
