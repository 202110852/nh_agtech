import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

interface PushRow {
  endpoint: string
  p256dh: string
  auth: string
}

export async function notifyFarmMembers(
  admin: SupabaseClient,
  params: {
    farmId: string
    orderId: string
    type: 'order_created' | 'deposit_confirmed' | 'shipment_requested'
    title: string
    body: string
    url?: string
  },
) {
  const { data: members } = await admin.from('farm_members').select('user_id').eq('farm_id', params.farmId)
  const userIds = [...new Set((members ?? []).map((row) => row.user_id as string))]
  if (userIds.length === 0) return

  const rows = userIds.map((userId) => ({
    user_id: userId,
    farm_id: params.farmId,
    order_id: params.orderId,
    type: params.type,
    title: params.title,
    body: params.body,
  }))
  await admin.from('notifications').insert(rows)

  const { data: subs } = await admin.from('push_subscriptions').select('endpoint, p256dh, auth').in('user_id', userIds)
  await sendPush((subs ?? []) as PushRow[], {
    title: params.title,
    body: params.body,
    url: params.url ?? `/admin/farms/${params.farmId}/orders`,
  })
}

export async function sendPush(
  subscriptions: PushRow[],
  payload: { title: string; body: string; url?: string },
) {
  const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')
  if (!vapidPublic || !vapidPrivate || subscriptions.length === 0) return

  try {
    const webpush = await import('npm:web-push@3.6.7')
    webpush.default.setVapidDetails('mailto:hello@farmassi.kr', vapidPublic, vapidPrivate)
    await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.default.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        ),
      ),
    )
  } catch (error) {
    console.error('web-push failed', error)
  }
}
