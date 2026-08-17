import { adminClient, corsHeaders, getUserFromRequest, isAdmin, json } from '../_shared/http.ts'
import { sendPush } from '../_shared/push.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const user = await getUserFromRequest(req)
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401)

  const admin = adminClient()
  const body = (await req.json().catch(() => ({}))) as { userId?: string; title?: string; body?: string; url?: string }
  const targetUserId = (await isAdmin(admin, user.id)) ? (body.userId ?? user.id) : user.id

  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', targetUserId)

  await sendPush((subs ?? []) as { endpoint: string; p256dh: string; auth: string }[], {
    title: body.title ?? '팜어시',
    body: body.body ?? '알림이 도착했습니다.',
    url: body.url ?? '/farm',
  })

  return json({ ok: true, sent: (subs ?? []).length })
})
