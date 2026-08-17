import { useEffect, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { OrderItem } from '../../components/shared/OrderItem'
import { adminNavItems } from '../../config/adminNav'
import { statusLabels } from '../../lib/orderStatus'
import { toOrderListModel, type OrderRow } from '../../lib/orders'
import { supabase } from '../../lib/supabase'
import type { OrderStatus } from '../../types/models'

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([])

  async function load() {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*), shipments(*)')
      .order('created_at', { ascending: false })
    setOrders((data as OrderRow[]) ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <AppShell navItems={adminNavItems} roleLabel="관리자" settingsPath="/admin/none">
      <Header title="주문" subtitle={`${orders.length}건`} />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-3">
        {orders.map((order) => (
          <OrderItem
            key={order.id}
            order={toOrderListModel(order)}
            extra={
              <div className="mt-3">
                <select
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
                  value={order.status}
                  onChange={async (e) => {
                    await supabase.from('orders').update({ status: e.target.value as OrderStatus }).eq('id', order.id)
                    await load()
                  }}
                >
                  {(Object.keys(statusLabels) as OrderStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </div>
            }
          />
        ))}
      </div>
    </AppShell>
  )
}
