import { ChevronRight, Snowflake } from 'lucide-react'
import type { Product } from '../../data/mockData'
import { formatPrice } from '../../data/mockData'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

interface ProductCardProps {
  product: Product
  onClick: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card onClick={onClick} className="overflow-hidden p-0">
      <div className={`h-36 bg-gradient-to-br ${product.imageGradient} flex items-end p-4`}>
        <div className="flex gap-2">
          {product.coldChain && (
            <Badge variant="cold">
              <Snowflake className="mr-1 h-3 w-3" />
              NH 콜드체인
            </Badge>
          )}
          <Badge variant="primary">신선도 {product.freshness}</Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-900">{product.name}</h3>
            <p className="mt-0.5 text-sm text-muted">
              {product.farmName} · {product.weight}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-300 shrink-0" />
        </div>
        <p className="mt-2 text-lg font-bold text-primary">{formatPrice(product.price)}</p>
        <p className="mt-1 text-xs text-muted">익일 배송 · {product.deliveryDate}</p>
      </div>
    </Card>
  )
}
