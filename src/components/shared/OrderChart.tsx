import { Card } from '../ui/Card'

interface OrderTrendItem {
  label: string
  day: string
  orders: number
  today?: boolean
}

interface OrderChartProps {
  data: OrderTrendItem[]
}

export function OrderChart({ data }: OrderChartProps) {
  const maxOrders = Math.max(...data.map((item) => item.orders))
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0)

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-bold text-gray-900">고객 주문 추이</h3>
          <p className="mt-1 text-sm text-muted">최근 7일 주문 건수</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-primary">{totalOrders}건</p>
          <p className="text-xs text-muted">주간 합계</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-36">
        {data.map((item) => {
          const height = `${(item.orders / maxOrders) * 100}%`

          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2 min-w-0">
              <span className="text-xs font-semibold text-gray-700">{item.orders}</span>
              <div className="flex w-full items-end justify-center h-24">
                <div
                  className={`w-full max-w-8 rounded-t-lg transition-all ${
                    item.today ? 'bg-primary' : 'bg-primary/25'
                  }`}
                  style={{ height }}
                  title={`${item.label} (${item.day}) ${item.orders}건`}
                />
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${item.today ? 'text-primary' : 'text-muted'}`}>
                  {item.day}
                </p>
                <p className="text-[10px] text-muted">{item.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
