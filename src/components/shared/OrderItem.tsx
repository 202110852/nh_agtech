import { MessageSquare, Star } from 'lucide-react'
import type { Order } from '../../data/mockData'
import { formatPrice, getCustomerByPhone, statusColors, statusLabels } from '../../data/mockData'
import { Card } from '../ui/Card'

interface OrderItemProps {
  order: Order
  showActions?: boolean
  selected?: boolean
  onSelect?: (id: string) => void
}

export function OrderItem({ order, showActions, selected, onSelect }: OrderItemProps) {
  const customer = getCustomerByPhone(order.customerPhone)
  const isRegular = customer?.isRegular ?? false

  return (
    <Card className={`${selected ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex items-start gap-3">
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(order.id)}
            className="mt-1 h-4 w-4 rounded accent-primary"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{order.customerName}</h4>
              {isRegular && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  단골
                </span>
              )}
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-700">{order.productName}</p>
          <p className="mt-0.5 text-sm text-muted truncate">{order.address}</p>
          {order.memo && (
            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-sm text-amber-900">
              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <p>
                <span className="font-medium">비고</span>
                <span className="text-amber-700"> · {order.memo}</span>
              </p>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="font-semibold text-primary">{formatPrice(order.amount)}</span>
            <span className="text-xs text-muted">{order.orderDate}</span>
          </div>
          {order.trackingNumber && (
            <p className="mt-1 text-xs text-muted">운송장: {order.trackingNumber}</p>
          )}
          {showActions && (
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary">
                상태 변경
              </button>
              <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600">
                상세보기
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
