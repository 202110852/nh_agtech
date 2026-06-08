import type { Order } from '../../data/mockData'
import { formatPrice, statusColors, statusLabels } from '../../data/mockData'
import { Card } from '../ui/Card'

interface OrderItemProps {
  order: Order
  showActions?: boolean
  selected?: boolean
  onSelect?: (id: string) => void
}

export function OrderItem({ order, showActions, selected, onSelect }: OrderItemProps) {
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
            <h4 className="font-semibold text-gray-900 truncate">{order.customerName}</h4>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-700">{order.productName}</p>
          <p className="mt-0.5 text-sm text-muted truncate">{order.address}</p>
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
