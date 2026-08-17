import { Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { NotificationBell } from '../../components/notifications/NotificationBell'
import { OrderItem } from '../../components/shared/OrderItem'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { farmNavItems } from '../../config/farmNav'
import { invokeFunction } from '../../lib/functions'
import { useAuth } from '../../lib/auth'
import { toOrderListModel, type OrderRow } from '../../lib/orders'
import { supabase } from '../../lib/supabase'
import { ErrorText } from '../../components/ui/Feedback'

export function FarmDelivery() {
  const { currentFarm } = useAuth()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentFarm) return
    supabase
      .from('orders')
      .select('*, order_items(*), shipments(*)')
      .eq('farm_id', currentFarm.id)
      .in('status', ['paid', 'packing'])
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrders((data as OrderRow[]) ?? []))
  }, [currentFarm])

  return (
    <AppShell navItems={farmNavItems} roleLabel="농가">
      <Header title="배송 관리" subtitle="우체국 택배 송장 신청" rightElement={<NotificationBell />} />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-4">
        <Card className="bg-amber-50 border-amber-100">
          <div className="flex gap-3">
            <Truck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">우체국 API 연동 준비 중</h4>
              <p className="mt-1 text-sm text-amber-700">
                지금은 송장 신청 기반만 연결되어 있습니다. 실제 운송장 발급은 이후 우체국 API를 붙이면 동작합니다.
              </p>
            </div>
          </div>
        </Card>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            출고 대기 {orders.length}건 · {selected.length}건 선택
          </p>
          <Button
            size="sm"
            disabled={selected.length === 0}
            onClick={async () => {
              setError('')
              setMessage('')
              try {
                const result = await invokeFunction<{ message?: string; error?: string }>('kpost-shipment', {
                  orderIds: selected,
                })
                setMessage(result.message ?? '연동이 아직 준비되지 않았습니다.')
              } catch (err) {
                setError(err instanceof Error ? err.message : '송장 신청을 진행할 수 없습니다.')
              }
            }}
          >
            송장 신청 ({selected.length})
          </Button>
        </div>
        <ErrorText>{error}</ErrorText>
        {message && <p className="text-sm text-primary">{message}</p>}
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderItem
              key={order.id}
              order={toOrderListModel(order)}
              selected={selected.includes(order.id)}
              onSelect={(id) =>
                setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
              }
            />
          ))}
          {orders.length === 0 && <p className="text-center text-muted py-8">출고 대기 주문이 없습니다</p>}
        </div>
      </div>
    </AppShell>
  )
}
