import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Textarea } from '../../components/ui/Field'
import { ErrorText, PageSpinner } from '../../components/ui/Feedback'
import { clearCart, getCart } from '../../lib/cart'
import { formatPrice } from '../../lib/format'
import { invokeFunction } from '../../lib/functions'
import { openPostcode } from '../../lib/postcode'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { Farm, Product, SavedAddress } from '../../types/models'

interface CheckoutResult {
  orderId: string
}

export function Checkout() {
  const { farmSlug = '' } = useParams()
  const navigate = useNavigate()
  const { user, profile, refresh } = useAuth()
  const [farm, setFarm] = useState<Farm | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new')
  const [saveAddress, setSaveAddress] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    recipient_name: '',
    phone: '',
    zonecode: '',
    address: '',
    address_detail: '',
    request_memo: '',
  })

  const cart = getCart(farmSlug)
  const qtyById = useMemo(
    () => Object.fromEntries(cart.map((item) => [item.productId, item.quantity])),
    [cart],
  )

  useEffect(() => {
    async function load() {
      const { data: farmRow } = await supabase.from('farms').select('*').eq('slug', farmSlug).maybeSingle()
      const farmData = farmRow as Farm | null
      setFarm(farmData)
      if (farmData) {
        const { data: productRows } = await supabase
          .from('products')
          .select('*')
          .eq('farm_id', farmData.id)
          .eq('is_active', true)
        setProducts((productRows as Product[]) ?? [])
      }
      if (user) {
        const { data: addrRows } = await supabase
          .from('saved_addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('last_used_at', { ascending: false })
        const list = (addrRows as SavedAddress[]) ?? []
        setAddresses(list)
        const def = list.find((a) => a.is_default) ?? list[0]
        if (def) applyAddress(def)
      }
      setLoading(false)
    }
    void load()
  }, [farmSlug, user])

  function applyAddress(addr: SavedAddress) {
    setSelectedAddressId(addr.id)
    setForm((prev) => ({
      ...prev,
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      zonecode: addr.zonecode ?? '',
      address: addr.address,
      address_detail: addr.address_detail ?? '',
    }))
  }

  const lines = products
    .filter((product) => (qtyById[product.id] ?? 0) > 0)
    .map((product) => ({
      product,
      quantity: qtyById[product.id] ?? 0,
    }))
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)

  if (loading) return <PageSpinner />
  if (!farm) {
    return <div className="min-h-dvh flex items-center justify-center text-muted">농가를 찾을 수 없습니다</div>
  }
  if (lines.length === 0) {
    return (
      <div className="min-h-dvh bg-surface">
        <Header title="주문하기" showBack backTo={`/o/${farmSlug}`} />
        <div className="px-4 py-10 text-center text-muted">
          담긴 상품이 없습니다.{' '}
          <Link className="text-primary font-semibold" to={`/o/${farmSlug}`}>
            상품 선택하기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-surface pb-10">
      <Header title="주문하기" showBack backTo={`/o/${farmSlug}`} />
      <form
        className="px-4 py-4 md:px-6 max-w-lg mx-auto space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          setError('')
          setPending(true)
          try {
            const result = await invokeFunction<CheckoutResult>('create-order', {
              farmId: farm.id,
              items: lines.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
              recipient: {
                name: form.recipient_name,
                phone: form.phone,
                zonecode: form.zonecode,
                address: form.address,
                addressDetail: form.address_detail,
              },
              requestMemo: form.request_memo,
              saveAddress,
            })
            clearCart(farmSlug)
            await refresh()
            navigate(`/me/orders/${result.orderId}`, { replace: true })
          } catch (err) {
            setError(err instanceof Error ? err.message : '주문에 실패했습니다.')
          } finally {
            setPending(false)
          }
        }}
      >
        <Card>
          <h3 className="font-semibold mb-3">주문 상품 · {farm.name}</h3>
          <div className="space-y-2">
            {lines.map((line) => (
              <div key={line.product.id} className="flex justify-between text-sm">
                <span>
                  {line.product.name} {line.product.unit} ×{line.quantity}
                </span>
                <span className="font-medium">{formatPrice(line.product.price * line.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between font-bold">
            <span>합계</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="font-semibold">배송지</h3>
          {addresses.length > 0 && (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <button
                  type="button"
                  key={addr.id}
                  onClick={() => applyAddress(addr)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                    selectedAddressId === addr.id ? 'border-primary bg-primary-light' : 'border-gray-200'
                  }`}
                >
                  <p className="font-medium">
                    {addr.recipient_name} · {addr.phone}
                    {addr.is_default ? ' (기본)' : ''}
                  </p>
                  <p className="text-muted">
                    {addr.address} {addr.address_detail}
                  </p>
                </button>
              ))}
              <button
                type="button"
                className="text-sm text-primary font-medium"
                onClick={() => {
                  setSelectedAddressId('new')
                  setForm((prev) => ({
                    ...prev,
                    recipient_name: profile?.display_name ?? '',
                    phone: profile?.phone ?? '',
                    zonecode: '',
                    address: '',
                    address_detail: '',
                  }))
                }}
              >
                새 주소 입력
              </button>
            </div>
          )}
          <Input
            label="받는 분"
            value={form.recipient_name}
            onChange={(e) => setForm((p) => ({ ...p, recipient_name: e.target.value }))}
            required
          />
          <Input
            label="전화번호"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            required
          />
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input label="우편번호" value={form.zonecode} readOnly placeholder="주소 검색" required />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                const result = await openPostcode()
                setSelectedAddressId('new')
                setForm((p) => ({ ...p, zonecode: result.zonecode, address: result.address }))
              }}
            >
              주소 검색
            </Button>
          </div>
          <Input label="주소" value={form.address} readOnly required />
          <Input
            label="상세주소"
            value={form.address_detail}
            onChange={(e) => setForm((p) => ({ ...p, address_detail: e.target.value }))}
          />
          <Textarea
            label="요청사항"
            value={form.request_memo}
            onChange={(e) => setForm((p) => ({ ...p, request_memo: e.target.value }))}
            placeholder="문 앞에 놓아주세요"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
              className="rounded accent-primary"
            />
            이 주소를 계정에 저장하고 다음에 사용
          </label>
        </Card>

        <Card className="bg-primary-light border-primary/20">
          <p className="text-sm text-gray-800">
            주문 후 농가 계좌({farm.bank_name} {farm.account_number})로 입금해주세요. 입금 확인 후 출고가 진행됩니다.
          </p>
        </Card>

        <ErrorText>{error}</ErrorText>
        <Button type="submit" fullWidth size="lg" disabled={pending}>
          {formatPrice(total)} 주문하기
        </Button>
      </form>
    </div>
  )
}
