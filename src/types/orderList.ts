import type { OrderStatus } from './models'

export interface OrderListModel {
  id: string
  customerName: string
  productSummary: string
  amount: number
  address: string
  status: OrderStatus
  orderDate: string
  trackingNumber?: string | null
  memo?: string | null
  orderNo?: string
}
