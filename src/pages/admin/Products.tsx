import { useEffect, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Textarea } from '../../components/ui/Field'
import { adminNavItems } from '../../config/adminNav'
import { formatPrice } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import type { Farm, Product } from '../../types/models'

export function AdminProducts() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [farmId, setFarmId] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState({ name: '', price: '', unit: '', description: '' })

  async function loadProducts(id: string) {
    const { data } = await supabase.from('products').select('*').eq('farm_id', id).order('sort_order')
    setProducts((data as Product[]) ?? [])
  }

  useEffect(() => {
    supabase
      .from('farms')
      .select('*')
      .order('name')
      .then(({ data }) => {
        const list = (data as Farm[]) ?? []
        setFarms(list)
        if (list[0]) {
          setFarmId(list[0].id)
          void loadProducts(list[0].id)
        }
      })
  }, [])

  return (
    <AppShell navItems={adminNavItems} roleLabel="관리자" settingsPath="/admin/none">
      <Header title="상품" />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-4">
        <select
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          value={farmId}
          onChange={(e) => {
            setFarmId(e.target.value)
            void loadProducts(e.target.value)
          }}
        >
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>

        {farmId && (
          <Card className="space-y-3">
            <h3 className="font-semibold">상품 추가</h3>
            <Input label="상품명" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <Input
              label="가격"
              type="number"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            />
            <Input
              label="단위"
              placeholder="5kg"
              value={form.unit}
              onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
            />
            <Textarea
              label="설명"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <Button
              onClick={async () => {
                if (!form.name || !form.price) return
                await supabase.from('products').insert({
                  farm_id: farmId,
                  name: form.name,
                  price: Number(form.price),
                  unit: form.unit || null,
                  description: form.description || null,
                })
                setForm({ name: '', price: '', unit: '', description: '' })
                await loadProducts(farmId)
              }}
            >
              추가
            </Button>
          </Card>
        )}

        {products.map((product) => (
          <Card key={product.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">
                {product.name} {product.unit}
              </p>
              <p className="text-sm text-primary">{formatPrice(product.price)}</p>
              <p className="text-xs text-muted">{product.is_active ? '판매중' : '숨김'}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
                await loadProducts(farmId)
              }}
            >
              {product.is_active ? '숨기기' : '판매'}
            </Button>
          </Card>
        ))}
      </div>
    </AppShell>
  )
}
