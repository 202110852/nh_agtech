import { CheckCircle, Printer, Truck } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { OrderItem } from '../../components/shared/OrderItem'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { farmNavItems } from '../../config/farmNav'
import { orders } from '../../data/mockData'

const pendingOrders = orders.filter((o) => o.status === 'received' || o.status === 'packing')

export function FarmDelivery() {
  const [selected, setSelected] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleSubmit = () => {
    if (selected.length > 0) setSubmitted(true)
  }

  return (
    <AppShell navItems={farmNavItems} roleLabel="농가 관리">
      <Header title="배송 관리" subtitle="우체국 택배 간편 사전 접수" />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-4">
        <Card className="bg-amber-50 border-amber-100">
          <div className="flex gap-3">
            <Truck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">계약소포 · 택배비 지원사업</h4>
              <p className="mt-1 text-sm text-amber-700">
                우체국 방문 없이 간편 사전 접수가 가능합니다. 운송장 출력과 송장 부착을 자동화하여 농가 업무를 줄여드립니다.
              </p>
            </div>
          </div>
        </Card>

        {submitted ? (
          <Card className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="font-bold text-gray-900">우체국 접수 완료</h3>
            <p className="mt-2 text-sm text-muted">
              {selected.length}건의 운송장이 생성되었습니다
            </p>
            <div className="mt-4 space-y-2">
              {selected.map((id, i) => (
                <div key={id} className="flex items-center justify-between rounded-xl bg-primary-light px-4 py-2">
                  <span className="text-sm font-medium">주문 {id.toUpperCase()}</span>
                  <Badge variant="primary">KR{98765432100 + i}</Badge>
                </div>
              ))}
            </div>
            <Button className="mt-4" variant="outline">
              <Printer className="h-4 w-4" />
              운송장 일괄 출력
            </Button>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                접수 대기 {pendingOrders.length}건 · {selected.length}건 선택
              </p>
              <Button
                size="sm"
                disabled={selected.length === 0}
                onClick={handleSubmit}
              >
                간편 접수 ({selected.length})
              </Button>
            </div>

            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <OrderItem
                  key={order.id}
                  order={order}
                  selected={selected.includes(order.id)}
                  onSelect={toggleSelect}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
