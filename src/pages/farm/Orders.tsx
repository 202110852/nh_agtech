import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { OrderItem } from '../../components/shared/OrderItem'
import { farmNavItems } from '../../config/farmNav'
import type { OrderStatus } from '../../data/mockData'
import { orders } from '../../data/mockData'

type FilterStatus = 'all' | OrderStatus

const filters: { id: FilterStatus; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'received', label: '접수' },
  { id: 'packing', label: '포장중' },
  { id: 'shipping', label: '배송중' },
  { id: 'completed', label: '완료' },
]

export function FarmOrders() {
  const [filter, setFilter] = useState<FilterStatus>('all')

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <AppShell navItems={farmNavItems} roleLabel="농가 관리">
      <Header title="주문 관리" subtitle={`총 ${orders.length}건`} />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {filters.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === id
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
              }`}
            >
              {label}
              {id !== 'all' && (
                <span className="ml-1 text-xs opacity-70">
                  ({orders.filter((o) => o.status === id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-muted py-8">해당 상태의 주문이 없습니다</p>
          ) : (
            filtered.map((order) => (
              <OrderItem key={order.id} order={order} showActions />
            ))
          )}
        </div>
      </div>
    </AppShell>
  )
}
