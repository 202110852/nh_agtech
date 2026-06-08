export type OrderStatus = 'received' | 'packing' | 'shipping' | 'completed'
export type PaymentMethod = 'card' | 'virtual' | 'local'

export interface Product {
  id: string
  name: string
  farmName: string
  location: string
  price: number
  weight: string
  freshness: '최상' | '상' | '보통'
  harvestDate: string
  deliveryDate: string
  coldChain: boolean
  imageGradient: string
  description: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  orderCount: number
  totalSpent: number
  lastOrderDate: string
  memo: string
  isRegular: boolean
  purchaseHistory: { date: string; product: string; amount: number }[]
}

export type AnnouncementType = 'delay' | 'general'

export interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  createdAt: string
  recipientCount: number
}

export interface ChatMessage {
  id: string
  sender: 'farm' | 'customer'
  content: string
  timestamp: string
}

export interface ChatThread {
  id: string
  customerId: string
  customerName: string
  lastMessage: string
  lastMessageAt: string
  unread: number
  messages: ChatMessage[]
}

export interface Order {
  id: string
  customerName: string
  customerPhone: string
  productName: string
  productId: string
  amount: number
  address: string
  status: OrderStatus
  orderDate: string
  trackingNumber?: string
  paymentMethod: PaymentMethod
  memo?: string
}

export interface TrackingStep {
  id: string
  label: string
  description: string
  completed: boolean
  active: boolean
  timestamp?: string
}

export const farmProfile = {
  name: '제주 햇살농원',
  owner: '김영수',
  location: '제주 서귀포시',
  product: '감귤 · 한라봉',
  nhConnected: true,
  plan: 'NH 연동 Pro',
}

export const products: Product[] = [
  {
    id: 'p1',
    name: '제주 감귤',
    farmName: '제주 햇살농원',
    location: '제주 서귀포시',
    price: 45000,
    weight: '5kg',
    freshness: '최상',
    harvestDate: '2025.06.05',
    deliveryDate: '2025.06.09',
    coldChain: true,
    imageGradient: 'from-orange-400 to-amber-500',
    description: '당일 수확 후 NH 냉장 물류를 경유하여 익일 배송됩니다. 신선도와 상품성이 최상입니다.',
  },
  {
    id: 'p2',
    name: '운악산 포도',
    farmName: '운악산 포도농장',
    location: '경기도 포천시',
    price: 32000,
    weight: '2kg',
    freshness: '최상',
    harvestDate: '2025.06.06',
    deliveryDate: '2025.06.09',
    coldChain: true,
    imageGradient: 'from-purple-500 to-violet-600',
    description: '운악산 일대에서 재배한 당도 높은 포도입니다. 농가에서 직접 포장하여 배송합니다.',
  },
  {
    id: 'p3',
    name: '제주 한라봉',
    farmName: '제주 햇살농원',
    location: '제주 서귀포시',
    price: 38000,
    weight: '3kg',
    freshness: '상',
    harvestDate: '2025.06.04',
    deliveryDate: '2025.06.08',
    coldChain: true,
    imageGradient: 'from-orange-300 to-yellow-400',
    description: '제주 청정 지역에서 자란 한라봉으로, 달콤하고 과즙이 풍부합니다.',
  },
  {
    id: 'p4',
    name: '친환경 토마토',
    farmName: '제주 그린팜',
    location: '제주 제주시',
    price: 18000,
    weight: '2kg',
    freshness: '최상',
    harvestDate: '2025.06.07',
    deliveryDate: '2025.06.09',
    coldChain: false,
    imageGradient: 'from-red-400 to-rose-500',
    description: '무농약 인증 친환경 토마토입니다. 당일 수확 직송으로 신선함을 유지합니다.',
  },
]

export const orders: Order[] = [
  {
    id: 'o1',
    customerName: '이민지',
    customerPhone: '010-1234-5678',
    productName: '제주 감귤 5kg',
    productId: 'p1',
    amount: 45000,
    address: '서울시 강남구 테헤란로 123',
    status: 'received',
    orderDate: '2025.06.08 09:15',
    paymentMethod: 'card',
    memo: '문 앞에 놓아주세요. 벨 누르지 말아주세요.',
  },
  {
    id: 'o2',
    customerName: '박준호',
    customerPhone: '010-2345-6789',
    productName: '운악산 포도 2kg',
    productId: 'p2',
    amount: 32000,
    address: '경기도 성남시 분당구 정자동 45',
    status: 'packing',
    orderDate: '2025.06.08 08:30',
    paymentMethod: 'local',
    memo: '영수증 지역화폐용으로 부탁드립니다.',
  },
  {
    id: 'o3',
    customerName: '최수연',
    customerPhone: '010-3456-7890',
    productName: '제주 한라봉 3kg',
    productId: 'p3',
    amount: 38000,
    address: '부산시 해운대구 우동 78',
    status: 'shipping',
    orderDate: '2025.06.07 14:20',
    trackingNumber: 'KR12345678901',
    paymentMethod: 'virtual',
  },
  {
    id: 'o4',
    customerName: '김태영',
    customerPhone: '010-4567-8901',
    productName: '제주 감귤 5kg',
    productId: 'p1',
    amount: 45000,
    address: '대전시 유성구 봉명동 12',
    status: 'shipping',
    orderDate: '2025.06.07 11:00',
    trackingNumber: 'KR12345678902',
    paymentMethod: 'card',
  },
  {
    id: 'o5',
    customerName: '정하은',
    customerPhone: '010-5678-9012',
    productName: '친환경 토마토 2kg',
    productId: 'p4',
    amount: 18000,
    address: '인천시 연수구 송도동 90',
    status: 'completed',
    orderDate: '2025.06.06 16:45',
    trackingNumber: 'KR12345678903',
    paymentMethod: 'card',
  },
  {
    id: 'o6',
    customerName: '한소희',
    customerPhone: '010-6789-0123',
    productName: '운악산 포도 2kg',
    productId: 'p2',
    amount: 32000,
    address: '서울시 마포구 합정동 33',
    status: 'received',
    orderDate: '2025.06.08 10:00',
    paymentMethod: 'local',
    memo: '포도 알이 큰 것으로 골라주세요.',
  },
]

export const customers: Customer[] = [
  {
    id: 'c1',
    name: '이민지',
    phone: '010-1234-5678',
    orderCount: 5,
    totalSpent: 198000,
    lastOrderDate: '2025.06.08',
    memo: '감귤 단골 고객, 매주 주문',
    isRegular: true,
    purchaseHistory: [
      { date: '2025.06.08', product: '제주 감귤 5kg', amount: 45000 },
      { date: '2025.06.01', product: '제주 감귤 5kg', amount: 45000 },
      { date: '2025.05.25', product: '제주 한라봉 3kg', amount: 38000 },
    ],
  },
  {
    id: 'c2',
    name: '박준호',
    phone: '010-2345-6789',
    orderCount: 3,
    totalSpent: 102000,
    lastOrderDate: '2025.06.08',
    memo: '지역화폐 사용 선호',
    isRegular: true,
    purchaseHistory: [
      { date: '2025.06.08', product: '운악산 포도 2kg', amount: 32000 },
      { date: '2025.05.20', product: '제주 감귤 5kg', amount: 45000 },
    ],
  },
  {
    id: 'c3',
    name: '최수연',
    phone: '010-3456-7890',
    orderCount: 2,
    totalSpent: 76000,
    lastOrderDate: '2025.06.07',
    memo: '',
    isRegular: false,
    purchaseHistory: [
      { date: '2025.06.07', product: '제주 한라봉 3kg', amount: 38000 },
      { date: '2025.05.15', product: '제주 한라봉 3kg', amount: 38000 },
    ],
  },
  {
    id: 'c4',
    name: '김태영',
    phone: '010-4567-8901',
    orderCount: 1,
    totalSpent: 45000,
    lastOrderDate: '2025.06.07',
    memo: '신규 고객',
    isRegular: false,
    purchaseHistory: [
      { date: '2025.06.07', product: '제주 감귤 5kg', amount: 45000 },
    ],
  },
]

export const announcements: Announcement[] = [
  {
    id: 'a1',
    title: '배송 지연 안내',
    content: '우천으로 인해 6/8 발송 건이 6/9 오전 중 배송될 예정입니다. 불편을 드려 죄송합니다.',
    type: 'delay',
    createdAt: '2025.06.08 08:30',
    recipientCount: 12,
  },
  {
    id: 'a2',
    title: '한라봉 수확 일정 안내',
    content: '이번 주 한라봉 수확량이 예상보다 적어 6/10부터 순차 발송됩니다.',
    type: 'general',
    createdAt: '2025.06.07 18:00',
    recipientCount: 28,
  },
]

export const chatThreads: ChatThread[] = [
  {
    id: 't1',
    customerId: 'c1',
    customerName: '이민지',
    lastMessage: '내일까지 받을 수 있을까요?',
    lastMessageAt: '2025.06.08 10:42',
    unread: 1,
    messages: [
      { id: 'm1', sender: 'customer', content: '안녕하세요, 오늘 주문한 감귤 배송 일정 문의드립니다.', timestamp: '2025.06.08 10:30' },
      { id: 'm2', sender: 'farm', content: '안녕하세요! NH 냉장 보관 후 내일 오전 중 배송 예정입니다.', timestamp: '2025.06.08 10:35' },
      { id: 'm3', sender: 'customer', content: '내일까지 받을 수 있을까요?', timestamp: '2025.06.08 10:42' },
    ],
  },
  {
    id: 't2',
    customerId: 'c2',
    customerName: '박준호',
    lastMessage: '네, 감사합니다!',
    lastMessageAt: '2025.06.08 09:15',
    unread: 0,
    messages: [
      { id: 'm4', sender: 'customer', content: '지역화폐로 결제했는데 영수증 발급 가능한가요?', timestamp: '2025.06.08 09:00' },
      { id: 'm5', sender: 'farm', content: '네, 주문 완료 후 마이페이지에서 전자영수증 확인 가능합니다.', timestamp: '2025.06.08 09:10' },
      { id: 'm6', sender: 'customer', content: '네, 감사합니다!', timestamp: '2025.06.08 09:15' },
    ],
  },
  {
    id: 't3',
    customerId: 'c3',
    customerName: '최수연',
    lastMessage: '한라봉 재입고되면 알려주세요.',
    lastMessageAt: '2025.06.07 16:20',
    unread: 0,
    messages: [
      { id: 'm7', sender: 'customer', content: '한라봉 재입고되면 알려주세요.', timestamp: '2025.06.07 16:20' },
    ],
  },
]

export const dashboardStats = {
  todayOrders: 12,
  pendingDelivery: 5,
  newCustomers: 3,
  monthlyRevenue: 1240000,
}

export const weeklyOrderTrend = [
  { label: '6/2', day: '월', orders: 8 },
  { label: '6/3', day: '화', orders: 11 },
  { label: '6/4', day: '수', orders: 9 },
  { label: '6/5', day: '목', orders: 14 },
  { label: '6/6', day: '금', orders: 10 },
  { label: '6/7', day: '토', orders: 16 },
  { label: '6/8', day: '일', orders: 12, today: true },
]

export const trackingSteps: TrackingStep[] = [
  {
    id: 's1',
    label: '주문 접수',
    description: '주문이 정상적으로 접수되었습니다',
    completed: true,
    active: false,
    timestamp: '2025.06.08 09:15',
  },
  {
    id: 's2',
    label: '농가 출고',
    description: '농가에서 상품을 포장하여 출고했습니다',
    completed: true,
    active: false,
    timestamp: '2025.06.08 14:30',
  },
  {
    id: 's3',
    label: 'NH 냉장 보관',
    description: 'NH 냉장 물류창고에서 신선도를 유지하며 보관 중',
    completed: false,
    active: true,
    timestamp: '2025.06.08 18:00',
  },
  {
    id: 's4',
    label: '익일 배송',
    description: '내일 오전 중 배송 예정',
    completed: false,
    active: false,
  },
]

export const statusLabels: Record<OrderStatus, string> = {
  received: '접수',
  packing: '포장중',
  shipping: '배송중',
  completed: '완료',
}

export const statusColors: Record<OrderStatus, string> = {
  received: 'bg-blue-100 text-blue-700',
  packing: 'bg-amber-100 text-amber-700',
  shipping: 'bg-primary-light text-primary',
  completed: 'bg-gray-100 text-gray-600',
}

export function formatPrice(price: number): string {
  return `₩${price.toLocaleString('ko-KR')}`
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getCustomerByPhone(phone: string): Customer | undefined {
  return customers.find((c) => c.phone === phone)
}
