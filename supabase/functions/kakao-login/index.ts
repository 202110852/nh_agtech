import { adminClient, corsHeaders, json } from '../_shared/http.ts'

interface KakaoToken {
  access_token?: string
  error?: string
  error_description?: string
}

interface KakaoUser {
  id: number
  kakao_account?: {
    profile?: {
      nickname?: string
      profile_image_url?: string
      thumbnail_image_url?: string
    }
  }
  properties?: {
    nickname?: string
    profile_image?: string
    thumbnail_image?: string
  }
}

const PRODUCTION_HOSTS = new Set(['farmassi.kr', 'www.farmassi.kr', 'nh-agtech.vercel.app'])

function isAllowedRedirectUri(raw: string) {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }
  if (url.pathname !== '/auth/callback') return false
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return url.protocol === 'http:' || url.protocol === 'https:'
  }
  if (url.protocol !== 'https:') return false
  if (PRODUCTION_HOSTS.has(url.hostname) || url.hostname.endsWith('.vercel.app')) return true
  const extras = (Deno.env.get('KAKAO_ALLOWED_ORIGINS') ?? Deno.env.get('SITE_URL') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return extras.some((origin) => {
    try {
      return new URL(origin).host === url.host
    } catch {
      return origin === url.host
    }
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: '잘못된 요청입니다.' }, 405)

  try {
    const body = (await req.json()) as { code?: string; redirectUri?: string }
    if (!body.code || !body.redirectUri) return json({ error: '인가 코드가 없습니다.' }, 400)
    if (!isAllowedRedirectUri(body.redirectUri)) return json({ error: '허용되지 않은 리다이렉트 주소입니다.' }, 400)

    const restKey = Deno.env.get('KAKAO_REST_API_KEY')
    const clientSecret = Deno.env.get('KAKAO_CLIENT_SECRET')
    if (!restKey) {
      return json({ error: '카카오 REST API 키를 Edge Function 시크릿으로 등록하세요.' }, 500)
    }

    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: restKey,
      redirect_uri: body.redirectUri,
      code: body.code,
    })
    if (clientSecret) tokenBody.set('client_secret', clientSecret)

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: tokenBody,
    })
    const token = (await tokenRes.json()) as KakaoToken
    if (!token.access_token) {
      return json({ error: token.error_description || token.error || '카카오 토큰 발급에 실패했습니다.' }, 400)
    }

    const meRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    })
    const me = (await meRes.json()) as KakaoUser
    if (!me.id) return json({ error: '카카오 사용자 정보를 가져오지 못했습니다.' }, 400)

    const nickname = me.kakao_account?.profile?.nickname || me.properties?.nickname || '카카오 사용자'
    const avatar =
      me.kakao_account?.profile?.profile_image_url ||
      me.properties?.profile_image ||
      me.kakao_account?.profile?.thumbnail_image_url ||
      null
    const email = `kakao-${me.id}@users.farmassi.local`
    const metadata = {
      full_name: nickname,
      name: nickname,
      avatar_url: avatar,
      kakao_id: String(me.id),
    }

    const admin = adminClient()
    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: metadata,
      app_metadata: { provider: 'kakao', providers: ['kakao'] },
    })
    if (created.error && !/already|registered|exists/i.test(created.error.message)) {
      return json({ error: created.error.message }, 400)
    }

    const link = await admin.auth.admin.generateLink({ type: 'magiclink', email })
    const hashedToken = link.data.properties?.hashed_token
    const userId = link.data.user?.id ?? created.data.user?.id
    if (link.error || !hashedToken) {
      return json({ error: link.error?.message ?? '로그인 세션을 만들지 못했습니다.' }, 400)
    }
    if (userId) {
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: metadata,
        app_metadata: { provider: 'kakao', providers: ['kakao'] },
      })
      await admin.from('profiles').update({ display_name: nickname, avatar_url: avatar }).eq('id', userId)
    }

    return json({ hashedToken })
  } catch (error) {
    const message = error instanceof Error ? error.message : '카카오 로그인에 실패했습니다.'
    return json({ error: message }, 400)
  }
})
