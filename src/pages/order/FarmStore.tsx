import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { useLoginSheet } from '../../components/auth/LoginSheet'
import { ProductCard } from '../../components/shared/ProductCard'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageSpinner } from '../../components/ui/Feedback'
import { cartCount, getCart, setCart, type CartItem } from '../../lib/cart'
import { formatPrice } from '../../lib/format'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import type { Farm, Product } from '../../types/models'

export function FarmStore() {
  const { farmSlug = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { openLogin } = useLoginSheet()
  const [farm, setFarm] = useState<Farm | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCartState] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setCartState(getCart(farmSlug))
    async function load() {
      const { data: farmRow } = await supabase.from('farms').select('*').eq('slug', farmSlug).eq('is_active', true).maybeSingle()
      if (!farmRow) {
        setFarm(null)
        setLoading(false)
        return
      }
      const farmData = farmRow as Farm
      setFarm(farmData)
      const { data: productRows } = await supabase
        .from('products')
        .select('*')
        .eq('farm_id', farmData.id)
        .eq('is_active', true)
        .order('sort_order')
      setProducts((productRows as Product[]) ?? [])
      setLoading(false)
    }
    void load()
  }, [farmSlug])

  const qtyById = useMemo(() => Object.fromEntries(cart.map((item) => [item.productId, item.quantity])), [cart])
  const selected = products.filter((product) => (qtyById[product.id] ?? 0) > 0)
  const total = selected.reduce((sum, product) => sum + product.price * (qtyById[product.id] ?? 0), 0)

  function updateQty(productId: string, quantity: number) {
    const next = cart.filter((item) => item.productId !== productId)
    if (quantity > 0) next.push({ productId, quantity })
    setCart(farmSlug, next)
    setCartState(next)
  }

  if (loading) return <PageSpinner />
  if (!farm) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-muted">
        농가를 찾을 수 없습니다
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-surface pb-28">
      <Header
        title={farm.name}
        subtitle={farm.location || BRAND_SUB}
        showBack
        backTo="/"
        rightElement={
          <button
            type="button"
            className="text-sm font-medium text-primary"
            onClick={() => {
              if (user) navigate('/me/orders')
              else openLogin({ next: '/me/orders' })
            }}
          >
            내 주문
          </button>
        }
      />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-4">
        {(farm.description || farm.product_summary) && (
          <Card>
            <p className="text-sm text-gray-700">{farm.description || farm.product_summary}</p>
          </Card>
        )}
        {products.length === 0 ? (
          <p className="text-center text-muted py-10">판매 중인 상품이 없습니다</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={qtyById[product.id] ?? 0}
                onChangeQuantity={(qty) => updateQty(product.id, qty)}
              />
            ))}
          </div>
        )}
      </div>
      {cartCount(cart) > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted">{cartCount(cart)}개 선택</p>
              <p className="font-bold text-primary">{formatPrice(total)}</p>
            </div>
            <Button
              size="lg"
              onClick={() => {
                const path = `/o/${farmSlug}/checkout`
                if (user) navigate(path)
                else openLogin({ next: path })
              }}
            >
              주문하기
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const BRAND_SUB = '농가 직송'
