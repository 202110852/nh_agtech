import { Calendar, MapPin, Snowflake, Truck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { formatPrice, getProductById } from '../../data/mockData'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const product = getProductById(id ?? '')

  if (!product) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-muted">상품을 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-surface pb-24">
      <Header title={product.name} showBack backTo="/consumer" />
      <div className="max-w-5xl mx-auto">
        <div className={`h-56 md:h-72 bg-gradient-to-br ${product.imageGradient}`} />
        <div className="px-4 py-5 md:px-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {product.coldChain && (
              <Badge variant="cold">
                <Snowflake className="mr-1 h-3 w-3" />
                NH 콜드체인
              </Badge>
            )}
            <Badge variant="primary">신선도 {product.freshness}</Badge>
            <Badge variant="neutral">직송</Badge>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <p className="mt-1 text-muted">{product.weight}</p>
            <p className="mt-2 text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
          </div>

          <Card>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{product.farmName}</p>
                  <p className="text-xs text-muted">{product.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-sm">수확일: {product.harvestDate}</p>
                  <p className="text-xs text-muted">배송 예정: {product.deliveryDate}</p>
                </div>
              </div>
            </div>
          </Card>

          {product.coldChain && (
            <Card className="bg-blue-50 border-blue-100">
              <div className="flex gap-3">
                <Snowflake className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">NH 냉장 물류 경유</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    농가 출고 후 NH 냉장 물류창고에서 보관되어 익일 배송됩니다.
                    신선도와 상품성을 최대한 유지합니다.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4 md:static md:border-0 md:max-w-5xl md:mx-auto md:px-6 md:pb-6">
        <Button
          fullWidth
          size="lg"
          onClick={() => navigate(`/consumer/checkout/${product.id}`)}
        >
          <Truck className="h-4 w-4" />
          주문하기
        </Button>
      </div>
    </div>
  )
}
