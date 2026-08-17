import { Minus, Plus } from 'lucide-react'
import type { Product } from '../../types/models'
import { formatPrice, productGradient } from '../../lib/format'
import { Card } from '../ui/Card'

interface ProductCardProps {
  product: Product
  quantity?: number
  onChangeQuantity?: (quantity: number) => void
}

export function ProductCard({ product, quantity = 0, onChangeQuantity }: ProductCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="h-36 w-full object-cover" />
      ) : (
        <div className={`h-36 bg-gradient-to-br ${productGradient(product.id)}`} />
      )}
      <div className="p-4">
        <h3 className="font-bold text-gray-900">{product.name}</h3>
        {product.unit && <p className="mt-0.5 text-sm text-muted">{product.unit}</p>}
        {product.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
        )}
        <p className="mt-2 text-lg font-bold text-primary">{formatPrice(product.price)}</p>
        {onChangeQuantity && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted">수량</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200"
                onClick={() => onChangeQuantity(Math.max(0, quantity - 1))}
                aria-label="수량 감소"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200"
                onClick={() => onChangeQuantity(quantity + 1)}
                aria-label="수량 증가"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
