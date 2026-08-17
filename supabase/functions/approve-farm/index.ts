import { adminClient, corsHeaders, getUserFromRequest, isAdmin, json, randomCode } from '../_shared/http.ts'

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '')
  return `${base || 'farm'}-${randomCode(6).toLowerCase()}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const user = await getUserFromRequest(req)
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401)

  const admin = adminClient()
  if (!(await isAdmin(admin, user.id))) return json({ error: '관리자만 처리할 수 있습니다.' }, 403)

  const body = (await req.json()) as {
    applicationId?: string
    action?: 'approve' | 'reject'
    reviewNote?: string
  }
  if (!body.applicationId || !body.action) return json({ error: '잘못된 요청입니다.' }, 400)

  const { data: application } = await admin
    .from('farm_applications')
    .select('*')
    .eq('id', body.applicationId)
    .maybeSingle()
  if (!application) return json({ error: '신청을 찾을 수 없습니다.' }, 404)
  if (application.status !== 'pending') return json({ error: '이미 처리된 신청입니다.' }, 400)

  if (body.action === 'reject') {
    const { error } = await admin
      .from('farm_applications')
      .update({
        status: 'rejected',
        review_note: body.reviewNote ?? null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', application.id)
    if (error) return json({ error: error.message }, 400)
    return json({ ok: true })
  }

  const { data: farm, error: farmError } = await admin
    .from('farms')
    .insert({
      slug: slugify(application.farm_name as string),
      name: application.farm_name,
      owner_user_id: application.user_id,
      location: application.location,
      product_summary: application.product_summary,
      description: application.description,
      bank_name: application.bank_name,
      account_number: application.account_number,
      account_holder: application.account_holder,
      is_active: true,
    })
    .select('id')
    .single()
  if (farmError || !farm) return json({ error: farmError?.message ?? '농가 생성 실패' }, 400)

  const { error: memberError } = await admin.from('farm_members').insert({
    farm_id: farm.id,
    user_id: application.user_id,
    member_role: 'owner',
  })
  if (memberError) return json({ error: memberError.message }, 400)

  await admin
    .from('farm_applications')
    .update({
      status: 'approved',
      review_note: body.reviewNote ?? null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      farm_id: farm.id,
    })
    .eq('id', application.id)

  try {
    await admin.auth.admin.updateUserById(application.user_id as string, {
      app_metadata: { is_farm: true },
    })
  } catch (error) {
    console.error('app_metadata update failed', error)
  }

  return json({ ok: true, farmId: farm.id })
})
