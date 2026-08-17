import type { Order, OrderItem, Shipment } from '../types/models'
import type { OrderListModel } from '../types/orderList'
import { formatDateTime, fullAddress } from './format'

export type { OrderListModel } from '../types/orderList'
export type OrderRow = Order & { order_items?: OrderItem[] | null; shipments?: Shipment[] | null }

export function toOrderListModel(order: OrderRow): OrderListModel {
  const items = order.order_items ?? []
  return {
    id: order.id,
    customerName: order.recipient_name,
    productSummary: items.map((item) => `${item.product_name} ×${item.quantity}`).join(', ') || '상품',
    amount: order.total_amount,
    address: fullAddress(order.address, order.address_detail, order.zonecode),
    status: order.status,
    orderDate: formatDateTime(order.created_at),
    memo: order.request_memo,
    orderNo: order.order_no,
    trackingNumber: order.shipments?.[0]?.tracking_number,
  }
}
