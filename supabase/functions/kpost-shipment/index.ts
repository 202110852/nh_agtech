import { adminClient, corsHeaders, getUserFromRequest, isAdmin, json } from '../_shared/http.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const user = await getUserFromRequest(req)
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401)

  const admin = adminClient()
  const body = (await req.json().catch(() => ({}))) as { orderIds?: string[] }
  const orderIds = body.orderIds ?? []

  if (orderIds.length === 0) {
    return json({
      implemented: false,
      message: '우체국(계약소포) API 연동은 준비 중입니다. KPOST_API_KEY / KPOST_CONTRACT_NO 환경변수를 사용할 예정입니다.',
    })
  }

  const { data: orders } = await admin.from('orders').select('id, farm_id').in('id', orderIds)
  if (!orders?.length) return json({ error: '대상 주문이 없습니다.' }, 404)

  const farmIds = [...new Set(orders.map((o) => o.farm_id as string))]
  const adminUser = await isAdmin(admin, user.id)
  if (!adminUser) {
    const { data: memberships } = await admin
      .from('farm_members')
      .select('farm_id')
      .eq('user_id', user.id)
      .in('farm_id', farmIds)
    if ((memberships ?? []).length !== farmIds.length) {
      return json({ error: '해당 농가의 주문만 신청할 수 있습니다.' }, 403)
    }
  }

  const drafts = orders.map((order) => ({
    order_id: order.id,
    provider: 'kpost',
    status: 'draft',
    request_payload: { stub: true },
    response_payload: { implemented: false },
  }))
  await admin.from('shipments').insert(drafts)

  return json({
    implemented: false,
    message: '송장 초안만 저장했습니다. 우체국 API 연동 후 실제 운송장이 발급됩니다.',
    count: drafts.length,
  })
})
