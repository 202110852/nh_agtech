import { adminClient, corsHeaders, getUserFromRequest, json, randomCode } from '../_shared/http.ts'
import { notifyFarmMembers } from '../_shared/push.ts'

interface OrderBody {
  farmId: string
  items: { productId: string; quantity: number }[]
  recipient: {
    name: string
    phone: string
    zonecode?: string
    address: string
    addressDetail?: string
  }
  requestMemo?: string
  saveAddress?: boolean
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const user = await getUserFromRequest(req)
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401)

  try {
    const body = (await req.json()) as OrderBody
    if (!body?.farmId || !body.items?.length || !body.recipient?.name || !body.recipient?.phone || !body.recipient?.address) {
      return json({ error: '주문 정보가 올바르지 않습니다.' }, 400)
    }

    const admin = adminClient()
    const { data: farm } = await admin.from('farms').select('*').eq('id', body.farmId).eq('is_active', true).maybeSingle()
    if (!farm) return json({ error: '농가를 찾을 수 없습니다.' }, 404)

    const productIds = body.items.map((item) => item.productId)
    const { data: products } = await admin
      .from('products')
      .select('*')
      .eq('farm_id', farm.id)
      .eq('is_active', true)
      .in('id', productIds)

    const productMap = new Map((products ?? []).map((p) => [p.id as string, p]))
    const lines = body.items.map((item) => {
      const product = productMap.get(item.productId)
      if (!product || item.quantity < 1) throw new Error('판매 중인 상품만 주문할 수 있습니다.')
      const unitPrice = product.price as number
      return {
        product_id: product.id,
        product_name: product.name,
        unit: product.unit,
        unit_price: unitPrice,
        quantity: item.quantity,
        line_amount: unitPrice * item.quantity,
      }
    })
    const total = lines.reduce((sum, line) => sum + line.line_amount, 0)
    const seoul = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }).replaceAll('-', '')
    const orderNo = `FA${seoul}-${randomCode(4)}`
    const depositCode = randomCode(6)

    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        order_no: orderNo,
        farm_id: farm.id,
        customer_id: user.id,
        status: 'pending_deposit',
        recipient_name: body.recipient.name,
        recipient_phone: body.recipient.phone,
        zonecode: body.recipient.zonecode ?? null,
        address: body.recipient.address,
        address_detail: body.recipient.addressDetail ?? null,
        request_memo: body.requestMemo ?? null,
        total_amount: total,
        deposit_due_amount: total,
        deposit_code: depositCode,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return json({ error: orderError?.message ?? '주문 생성에 실패했습니다.' }, 400)
    }

    const { error: itemsError } = await admin.from('order_items').insert(
      lines.map((line) => ({ ...line, order_id: order.id })),
    )
    if (itemsError) return json({ error: itemsError.message }, 400)

    const { data: savedRows } = await admin.from('saved_addresses').select('id, address, address_detail, zonecode').eq('user_id', user.id)
    const sameAddress = (savedRows ?? []).find(
      (row) =>
        normalizeText(row.address) === normalizeText(body.recipient.address) &&
        normalizeText(row.address_detail) === normalizeText(body.recipient.addressDetail) &&
        normalizeText(row.zonecode) === normalizeText(body.recipient.zonecode),
    )
    const savedPayload = {
      recipient_name: body.recipient.name,
      phone: body.recipient.phone,
      zonecode: body.recipient.zonecode ?? null,
      address: body.recipient.address,
      address_detail: body.recipient.addressDetail ?? null,
      last_used_at: new Date().toISOString(),
    }
    if (sameAddress) {
      await admin
        .from('saved_addresses')
        .update({ ...savedPayload, is_default: true })
        .eq('id', sameAddress.id)
    } else if (body.saveAddress) {
      await admin.from('saved_addresses').insert({
        ...savedPayload,
        user_id: user.id,
        is_default: true,
      })
    }

    await notifyFarmMembers(admin, {
      farmId: farm.id as string,
      orderId: order.id as string,
      type: 'order_created',
      title: '새 주문(입금대기)',
      body: `${body.recipient.name}님이 ₩${total.toLocaleString('ko-KR')} 주문했습니다. 입금자명 ${depositCode}`,
    })

    return json({ orderId: order.id })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : '주문에 실패했습니다.' }, 400)
  }
})

function normalizeText(value?: string | null) {
  return (value ?? '').trim().replace(/\s+/g, ' ')
}
