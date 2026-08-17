import { useEffect, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { OrderItem } from '../../components/shared/OrderItem'
import { Button } from '../../components/ui/Button'
import { ErrorText } from '../../components/ui/Feedback'
import { adminNavItems } from '../../config/adminNav'
import { invokeFunction } from '../../lib/functions'
import { toOrderListModel, type OrderRow } from '../../lib/orders'
import { supabase } from '../../lib/supabase'

export function AdminDeposits() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [error, setError] = useState('')

  async function load() {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('status', 'pending_deposit')
      .order('created_at', { ascending: false })
    setOrders((data as OrderRow[]) ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <AppShell navItems={adminNavItems} roleLabel="관리자" settingsPath="/admin/none">
      <Header title="입금 확인" subtitle={`${orders.length}건 대기`} />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-3">
        <ErrorText>{error}</ErrorText>
        {orders.map((order) => (
          <OrderItem
            key={order.id}
            order={toOrderListModel(order)}
            extra={
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted">입금자명 {order.deposit_code}</p>
                <Button
                  size="sm"
                  onClick={async () => {
                    setError('')
                    try {
                      await invokeFunction('confirm-deposit', { orderId: order.id, provider: 'manual' })
                      await load()
                    } catch (err) {
                      setError(err instanceof Error ? err.message : '입금 확인에 실패했습니다.')
                    }
                  }}
                >
                  입금 확인
                </Button>
              </div>
            }
          />
        ))}
        {orders.length === 0 && <p className="text-sm text-muted">입금 대기 주문이 없습니다.</p>}
      </div>
    </AppShell>
  )
}
