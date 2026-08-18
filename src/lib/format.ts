export function formatPrice(price: number): string {
  return `₩${price.toLocaleString('ko-KR')}`
}

export function formatWon(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

export function productGradient(id: string): string {
  const list = [
    'from-orange-400 to-amber-500',
    'from-green-500 to-emerald-600',
    'from-red-400 to-rose-500',
    'from-purple-500 to-violet-600',
    'from-yellow-400 to-orange-500',
    'from-lime-400 to-green-600',
  ]
  let n = 0
  for (let i = 0; i < id.length; i += 1) n += id.charCodeAt(i)
  return list[n % list.length]
}

export function fullAddress(address: string, detail?: string | null, zonecode?: string | null): string {
  const zip = zonecode ? `[${zonecode}] ` : ''
  const extra = detail ? ` ${detail}` : ''
  return `${zip}${address}${extra}`.trim()
}

export function kakaoChannelHref(value: string | null | undefined): string | null {
  const raw = value?.trim()
  if (!raw) return null
  if (/^(javascript|data|vbscript):/i.test(raw)) return null
  if (/^https?:\/\//i.test(raw)) return raw
  if (/^pf\.kakao\.com\//i.test(raw)) return `https://${raw}`
  const id = raw.replace(/^\/+/, '')
  return `https://pf.kakao.com/${id}`
}
