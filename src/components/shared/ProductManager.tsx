import { GripVertical, ImagePlus, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input, Select, Textarea } from '../ui/Field'
import { ErrorText } from '../ui/Feedback'
import {
  KPOST_CONTENT_CODES,
  KPOST_DELIVERY_TYPES,
  KPOST_VOLUMES,
  KPOST_WEIGHTS,
} from '../../lib/kpostParcelExcel'
import { formatPrice } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import type { Product } from '../../types/models'
import { ProductCard } from './ProductCard'

const PRODUCT_IMAGES_BUCKET = 'product-images'
const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_PRODUCT_IMAGE_EDGE = 1920
const PRODUCT_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function mimeFromName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'heic' || ext === 'heif') return 'image/heic'
  return ''
}

async function rasterToJpeg(file: File) {
  let source: CanvasImageSource
  let width: number
  let height: number
  try {
    const bitmap = await createImageBitmap(file)
    source = bitmap
    width = bitmap.width
    height = bitmap.height
  } catch {
    const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      const url = URL.createObjectURL(file)
      image.onload = () => {
        URL.revokeObjectURL(url)
        resolve(image)
      }
      image.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('이미지를 읽을 수 없습니다.'))
      }
      image.src = url
    })
    source = loaded
    width = loaded.naturalWidth
    height = loaded.naturalHeight
  }
  const scale = Math.min(1, MAX_PRODUCT_IMAGE_EDGE / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('이미지를 변환할 수 없습니다.')
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  if ('close' in source && typeof source.close === 'function') source.close()
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (next) => (next ? resolve(next) : reject(new Error('이미지를 변환할 수 없습니다.'))),
      'image/jpeg',
      0.85,
    )
  })
  return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
}

async function prepareProductImage(file: File) {
  const type = (file.type || mimeFromName(file.name)).toLowerCase()
  const allowed = Boolean(PRODUCT_IMAGE_TYPES[type])
  if (allowed && file.size <= MAX_PRODUCT_IMAGE_BYTES) return file
  if (type && !type.startsWith('image/')) return '이미지 파일만 업로드할 수 있습니다.'
  try {
    const converted = await rasterToJpeg(file)
    if (converted.size > MAX_PRODUCT_IMAGE_BYTES) return '이미지가 너무 큽니다. 다른 사진을 선택하세요.'
    return converted
  } catch {
    return allowed
      ? '이미지가 너무 큽니다. 다른 사진을 선택하세요.'
      : '이 기기에서 해당 사진을 변환할 수 없습니다. JPEG 또는 PNG로 선택하세요.'
  }
}

function ImageFileInput({ onPick }: { onPick: (file: File) => void }) {
  return (
    <input
      type="file"
      accept="image/*"
      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      onChange={(e) => {
        const next = e.target.files?.[0]
        e.target.value = ''
        if (next) onPick(next)
      }}
    />
  )
}

interface ProductFormValues {
  name: string
  price: string
  unit: string
  description: string
  image_url: string
  parcel_weight_kg: string
  parcel_volume_cm: string
  parcel_content_code: string
  parcel_delivery_type: string
}

const emptyProductForm: ProductFormValues = {
  name: '',
  price: '',
  unit: '',
  description: '',
  image_url: '',
  parcel_weight_kg: '5',
  parcel_volume_cm: '80',
  parcel_content_code: '농/수/축산물(일반)',
  parcel_delivery_type: '',
}

function productToForm(product: Product): ProductFormValues {
  return {
    name: product.name,
    price: String(product.price),
    unit: product.unit ?? '',
    description: product.description ?? '',
    image_url: product.image_url ?? '',
    parcel_weight_kg: product.parcel_weight_kg,
    parcel_volume_cm: product.parcel_volume_cm,
    parcel_content_code: product.parcel_content_code,
    parcel_delivery_type: product.parcel_delivery_type,
  }
}

function productImagePathFromUrl(url: string | null) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const prefix = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`
    if (!parsed.pathname.startsWith(prefix)) return null
    return decodeURIComponent(parsed.pathname.slice(prefix.length))
  } catch {
    return null
  }
}

async function uploadProductImage(farmId: string, file: File) {
  const ext = PRODUCT_IMAGE_TYPES[file.type] ?? 'jpg'
  const path = `${farmId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl
}

async function deleteProductImage(url: string | null) {
  const path = productImagePathFromUrl(url)
  if (!path) return
  await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path])
}

function formPayload(form: ProductFormValues) {
  return {
    name: form.name.trim(),
    price: Number(form.price),
    unit: form.unit.trim() || null,
    description: form.description.trim() || null,
    parcel_weight_kg: form.parcel_weight_kg,
    parcel_volume_cm: form.parcel_volume_cm,
    parcel_content_code: form.parcel_content_code,
    parcel_delivery_type: form.parcel_delivery_type,
  }
}

interface ProductFormCardProps {
  form: ProductFormValues
  editingId: string | null
  error: string
  showCancel: boolean
  saving: boolean
  imagePreview: string | null
  onChange: <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void
  onPickImage: (file: File) => void
  onClearImage: () => void
  onSave: () => void
  onCancel: () => void
}

function ProductFormCard({
  form,
  editingId,
  error,
  showCancel,
  saving,
  imagePreview,
  onChange,
  onPickImage,
  onClearImage,
  onSave,
  onCancel,
}: ProductFormCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{editingId ? '상품 수정' : '상품 추가'}</h3>
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted hover:bg-gray-100"
            aria-label="닫기"
          >
            닫기
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Input label="상품명" value={form.name} onChange={(e) => onChange('name', e.target.value)} />
      <Input label="가격" type="number" value={form.price} onChange={(e) => onChange('price', e.target.value)} />
      <Input
        label="단위"
        placeholder="5kg"
        value={form.unit}
        onChange={(e) => onChange('unit', e.target.value)}
      />
      <Textarea label="설명" value={form.description} onChange={(e) => onChange('description', e.target.value)} />
      <div>
        <span className="text-xs font-medium text-muted">이미지</span>
        {imagePreview ? (
          <div className="relative mt-1 overflow-hidden rounded-xl border border-gray-200">
            <img src={imagePreview} alt="" className="h-40 w-full object-cover" />
            <div className="absolute right-2 top-2 flex gap-1">
              <span className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-white/95 px-3 text-xs font-medium text-gray-700 shadow-sm">
                변경
                <ImageFileInput onPick={onPickImage} />
              </span>
              <button
                type="button"
                onClick={onClearImage}
                className="inline-flex min-h-11 items-center rounded-lg bg-white/95 px-3 text-xs font-medium text-gray-700 shadow-sm"
              >
                삭제
              </button>
            </div>
          </div>
        ) : (
          <div className="relative mt-1 flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-muted">
            <ImagePlus className="h-6 w-6" />
            앨범 또는 카메라에서 선택
            <span className="text-xs">최대 5MB · 큰 사진은 자동으로 줄입니다</span>
            <ImageFileInput onPick={onPickImage} />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="택배 중량(kg)" value={form.parcel_weight_kg} onChange={(e) => onChange('parcel_weight_kg', e.target.value)}>
          {KPOST_WEIGHTS.map((value) => (
            <option key={value} value={value}>
              {value}kg
            </option>
          ))}
        </Select>
        <Select label="택배 부피(cm)" value={form.parcel_volume_cm} onChange={(e) => onChange('parcel_volume_cm', e.target.value)}>
          {KPOST_VOLUMES.map((value) => (
            <option key={value} value={value}>
              {value}cm
            </option>
          ))}
        </Select>
        <Select
          label="내용품코드"
          value={form.parcel_content_code}
          onChange={(e) => onChange('parcel_content_code', e.target.value)}
        >
          {KPOST_CONTENT_CODES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Select
          label="배달방식"
          value={form.parcel_delivery_type}
          onChange={(e) => onChange('parcel_delivery_type', e.target.value)}
        >
          {KPOST_DELIVERY_TYPES.map((value) => (
            <option key={value || 'none'} value={value}>
              {value || '미입력'}
            </option>
          ))}
        </Select>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={saving}>
          {saving ? (editingId ? '저장 중...' : '추가 중...') : editingId ? '저장' : '추가'}
        </Button>
        {showCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            취소
          </Button>
        )}
      </div>
    </Card>
  )
}

function moveItem<T>(list: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

interface ProductManagerProps {
  farmId: string
  variant?: 'admin' | 'farm'
  onCountChange?: (count: number) => void
}

export function ProductManager({ farmId, variant = 'admin', onCountChange }: ProductManagerProps) {
  const isFarm = variant === 'farm'
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<ProductFormValues>(emptyProductForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(!isFarm)
  const [reordering, setReordering] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [saving, setSaving] = useState(false)
  const productsRef = useRef(products)
  const dragIdRef = useRef<string | null>(null)
  productsRef.current = products
  const imageObjectUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile])
  const imagePreview = imageObjectUrl ?? (imageRemoved ? null : form.image_url || null)

  useEffect(() => {
    if (!imageObjectUrl) return
    return () => URL.revokeObjectURL(imageObjectUrl)
  }, [imageObjectUrl])

  const formVisible = isFarm ? formOpen : true

  async function load() {
    const { data } = await supabase.from('products').select('*').eq('farm_id', farmId).order('sort_order')
    const list = (data as Product[]) ?? []
    setProducts(list)
    onCountChange?.(list.length)
  }

  useEffect(() => {
    setForm(emptyProductForm)
    setEditingId(null)
    setError('')
    setImageFile(null)
    setImageRemoved(false)
    setSaving(false)
    setReordering(false)
    setDraggingId(null)
    supabase
      .from('products')
      .select('*')
      .eq('farm_id', farmId)
      .order('sort_order')
      .then(({ data }) => {
        const list = (data as Product[]) ?? []
        setProducts(list)
        onCountChange?.(list.length)
      })
  }, [farmId, onCountChange])

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleAdd() {
    if (formOpen && !editingId) {
      closeForm()
      return
    }
    setEditingId(null)
    setForm(emptyProductForm)
    setError('')
    setImageFile(null)
    setImageRemoved(false)
    setFormOpen(true)
  }

  function closeForm() {
    setEditingId(null)
    setForm(emptyProductForm)
    setError('')
    setImageFile(null)
    setImageRemoved(false)
    if (isFarm) setFormOpen(false)
  }

  function pickImage(file: File) {
    void (async () => {
      const prepared = await prepareProductImage(file)
      if (typeof prepared === 'string') {
        setError(prepared)
        return
      }
      setError('')
      setImageFile(prepared)
      setImageRemoved(false)
    })()
  }

  function clearImage() {
    setImageFile(null)
    setImageRemoved(true)
  }

  function toggleReorder() {
    if (reordering) {
      setReordering(false)
      setDraggingId(null)
      dragIdRef.current = null
      return
    }
    closeForm()
    setReordering(true)
  }

  async function persistOrder(list: Product[]) {
    const results = await Promise.all(
      list.map((product, index) =>
        supabase.from('products').update({ sort_order: index }).eq('id', product.id),
      ),
    )
    if (results.some((result) => result.error)) await load()
  }

  function onReorderPointerDown(event: PointerEvent<HTMLDivElement>, id: string) {
    if (!reordering || event.button !== 0) return
    event.preventDefault()
    dragIdRef.current = id
    setDraggingId(id)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onReorderPointerMove(event: PointerEvent<HTMLDivElement>) {
    const dragId = dragIdRef.current
    if (!dragId) return
    const over = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-product-id]')
    const overId = over instanceof HTMLElement ? over.dataset.productId : undefined
    if (!overId || overId === dragId) return
    const current = productsRef.current
    const from = current.findIndex((product) => product.id === dragId)
    const to = current.findIndex((product) => product.id === overId)
    if (from < 0 || to < 0 || from === to) return
    const next = moveItem(current, from, to).map((product, index) => ({ ...product, sort_order: index }))
    productsRef.current = next
    setProducts(next)
  }

  function onReorderPointerUp() {
    if (!dragIdRef.current) return
    dragIdRef.current = null
    setDraggingId(null)
    void persistOrder(productsRef.current)
  }

  async function save() {
    setError('')
    const payload = formPayload(form)
    if (!payload.name || !Number.isFinite(payload.price) || payload.price < 0) {
      setError('상품명과 가격을 입력하세요.')
      return
    }
    setSaving(true)
    const previousImageUrl = form.image_url || null
    try {
      let imageUrl = imageRemoved ? null : previousImageUrl
      if (imageFile) imageUrl = await uploadProductImage(farmId, imageFile)
      const { error: saveError } = editingId
        ? await supabase.from('products').update({ ...payload, image_url: imageUrl }).eq('id', editingId)
        : await supabase.from('products').insert({
            ...payload,
            image_url: imageUrl,
            farm_id: farmId,
            sort_order: products.reduce((max, product) => Math.max(max, product.sort_order), -1) + 1,
          })
      if (saveError) {
        setError(saveError.message)
        return
      }
      if (previousImageUrl && previousImageUrl !== imageUrl) {
        void deleteProductImage(previousImageUrl)
      }
      closeForm()
      if (!isFarm) setForm(emptyProductForm)
      await load()
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const formCard = formVisible ? (
    <ProductFormCard
      form={form}
      editingId={editingId}
      error={error}
      showCancel={Boolean(editingId) || isFarm}
      saving={saving}
      imagePreview={imagePreview}
      onChange={update}
      onPickImage={pickImage}
      onClearImage={clearImage}
      onSave={() => void save()}
      onCancel={closeForm}
    />
  ) : null

  if (isFarm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button onClick={toggleAdd} disabled={reordering}>
            <Plus className="h-4 w-4" />
            새 상품 추가
          </Button>
          {products.length > 1 && (
            <Button variant={reordering ? 'primary' : 'outline'} onClick={toggleReorder}>
              {reordering ? '완료' : '순서 변경'}
            </Button>
          )}
        </div>
        {reordering && (
          <p className="text-sm text-muted">카드를 드래그해서 순서를 바꾸세요. 주문 페이지에도 같은 순서로 보입니다.</p>
        )}
        {!reordering && formCard}
        {products.length === 0 ? (
          <p className="text-center text-muted py-10">등록된 상품이 없습니다</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <div
                key={product.id}
                data-product-id={product.id}
                className={`relative h-full ${reordering ? 'cursor-grab touch-none select-none' : ''} ${
                  draggingId === product.id ? 'opacity-60 ring-2 ring-primary rounded-2xl' : ''
                }`}
                style={reordering ? { touchAction: 'none' } : undefined}
                onPointerDown={(event) => onReorderPointerDown(event, product.id)}
                onPointerMove={onReorderPointerMove}
                onPointerUp={onReorderPointerUp}
                onPointerCancel={onReorderPointerUp}
              >
                {reordering && (
                  <div className="pointer-events-none absolute right-2 top-2 z-10 rounded-lg bg-white/90 p-1 shadow-sm">
                    <GripVertical className="h-4 w-4 text-muted" />
                  </div>
                )}
                <ProductCard
                  product={product}
                  extra={
                    reordering ? undefined : (
                      <div className="mt-3 flex items-center gap-2">
                        <select
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
                          value={product.is_active ? 'active' : 'hidden'}
                          onChange={async (e) => {
                            await supabase
                              .from('products')
                              .update({ is_active: e.target.value === 'active' })
                              .eq('id', product.id)
                            await load()
                          }}
                        >
                          <option value="active">판매중</option>
                          <option value="hidden">숨김</option>
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(product.id)
                            setForm(productToForm(product))
                            setImageFile(null)
                            setImageRemoved(false)
                            setError('')
                            setFormOpen(true)
                          }}
                        >
                          수정
                        </Button>
                      </div>
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {formCard}
      {products.map((product) => (
        <Card key={product.id} className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold">
              {product.name} {product.unit}
            </p>
            <p className="text-sm text-primary">{formatPrice(product.price)}</p>
            <p className="text-xs text-muted">
              {product.is_active ? '판매중' : '숨김'} · 택배 {product.parcel_weight_kg}kg · {product.parcel_volume_cm}cm
              · {product.parcel_content_code}
              {product.parcel_delivery_type ? ` · ${product.parcel_delivery_type}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingId(product.id)
                setForm(productToForm(product))
                setImageFile(null)
                setImageRemoved(false)
                setError('')
              }}
            >
              수정
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
                await load()
              }}
            >
              {product.is_active ? '숨기기' : '판매'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
