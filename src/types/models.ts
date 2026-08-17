export type ProfileRole = 'customer' | 'admin'
export type FarmMemberRole = 'owner' | 'staff'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'
export type OrderStatus =
  | 'pending_deposit'
  | 'paid'
  | 'packing'
  | 'shipping'
  | 'completed'
  | 'cancelled'
export type NotificationType = 'order_created' | 'deposit_confirmed' | 'shipment_requested'
export type DepositProvider = 'manual' | 'gnd' | 'hecto' | 'banksalad' | 'codef'
export type ShipmentStatus = 'draft' | 'requested' | 'printed' | 'cancelled'
export type MatchStatus = 'unmatched' | 'matched' | 'ignored'

export interface Profile {
  id: string
  role: ProfileRole
  display_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Farm {
  id: string
  slug: string
  name: string
  owner_user_id: string
  location: string | null
  product_summary: string | null
  description: string | null
  bank_name: string
  account_number: string
  account_holder: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FarmMember {
  farm_id: string
  user_id: string
  member_role: FarmMemberRole
  created_at: string
}

export interface FarmApplication {
  id: string
  user_id: string
  farm_name: string
  owner_name: string
  location: string | null
  product_summary: string | null
  description: string | null
  bank_name: string
  account_number: string
  account_holder: string
  phone: string | null
  status: ApplicationStatus
  review_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  farm_id: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  farm_id: string
  name: string
  price: number
  unit: string | null
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SavedAddress {
  id: string
  user_id: string
  recipient_name: string
  phone: string
  zonecode: string | null
  address: string
  address_detail: string | null
  is_default: boolean
  last_used_at: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_no: string
  farm_id: string
  customer_id: string
  status: OrderStatus
  recipient_name: string
  recipient_phone: string
  zonecode: string | null
  address: string
  address_detail: string | null
  request_memo: string | null
  total_amount: number
  deposit_due_amount: number
  deposit_code: string
  deposit_confirmed_at: string | null
  deposit_confirmed_by: string | null
  deposit_provider: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  unit: string | null
  unit_price: number
  quantity: number
  line_amount: number
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
  farm?: Farm | null
}

export interface AppNotification {
  id: string
  user_id: string
  farm_id: string | null
  order_id: string | null
  type: NotificationType
  title: string
  body: string
  is_read: boolean
  created_at: string
}

export interface Shipment {
  id: string
  order_id: string
  provider: string
  status: ShipmentStatus
  tracking_number: string | null
  request_payload: Record<string, unknown> | null
  response_payload: Record<string, unknown> | null
  requested_at: string | null
  created_at: string
  updated_at: string
}

export interface DepositTransaction {
  id: string
  farm_id: string | null
  provider: DepositProvider
  occurred_at: string
  amount: number
  depositor_name: string | null
  raw_payload: Record<string, unknown> | null
  matched_order_id: string | null
  match_status: MatchStatus
  created_at: string
}
