import { useEffect, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { adminNavItems } from '../../config/adminNav'
import { invokeFunction } from '../../lib/functions'
import { supabase } from '../../lib/supabase'
import type { Order, Shipment } from '../../types/models'

type ShipmentRow = Shipment & { orders?: Pick<Order, 'order_no' | 'recipient_name'> | null }

export function AdminShipments() {
  const [rows, setRows] = useState<ShipmentRow[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase
      .from('shipments')
      .select('*, orders(order_no, recipient_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows((data as ShipmentRow[]) ?? []))
  }, [])

  return (
    <AppShell navItems={adminNavItems} roleLabel="관리자" settingsPath="/admin/none">
      <Header title="송장" subtitle="우체국 연동 준비" />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-3">
        <Card>
          <p className="text-sm text-muted">
            우체국 간편접수 API는 아직 연동되지 않았습니다. 신청 시 스텁 응답만 반환합니다.
          </p>
          <Button
            className="mt-3"
            variant="outline"
            onClick={async () => {
              try {
                const result = await invokeFunction<{ message?: string }>('kpost-shipment', { orderIds: [] })
                setMessage(result.message ?? '연동 준비 중입니다.')
              } catch (err) {
                setMessage(err instanceof Error ? err.message : '스텁 호출 실패')
              }
            }}
          >
            연동 상태 확인
          </Button>
          {message && <p className="mt-2 text-sm text-primary">{message}</p>}
        </Card>
        {rows.map((row) => (
          <Card key={row.id}>
            <p className="font-semibold">{row.orders?.order_no ?? row.order_id}</p>
            <p className="text-sm text-muted">
              {row.provider} · {row.status} · {row.tracking_number ?? '운송장 없음'}
            </p>
          </Card>
        ))}
      </div>
    </AppShell>
  )
}
