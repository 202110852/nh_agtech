import { BRAND } from '../config/brand'
import { fullAddress } from './format'
import { formatPhone } from './phone'

export const FARM_SHARE_ORDER_CTA = '👇 💬 카카오톡 문의와 주문하러가기[클릭] 👇'

export function farmLandingPath(slug: string) {
  return `/farm/${slug}/landingpage`
}

export function farmPublicOrigin() {
  return BRAND.siteUrl.replace(/\/+$/, '')
}

export function farmLandingUrl(slug: string, origin = farmPublicOrigin()) {
  return `${origin.replace(/\/+$/, '')}${farmLandingPath(slug)}`
}

export function farmProductLines(summary: string | null | undefined) {
  if (!summary?.trim()) return []
  return summary
    .split(/[\n,·/|]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function farmShareLead(description: string | null | undefined) {
  const text = description?.trim()
  if (!text) return ''
  return /^\(광고\)/.test(text) ? text : `(광고) ${text}`
}

export interface FarmShareInput {
  name: string
  slug: string
  description?: string | null
  product_summary?: string | null
  phone?: string | null
  mobile_phone?: string | null
  address?: string | null
  address_zonecode?: string | null
  address_detail?: string | null
  map_url?: string | null
  share_text?: string | null
}

export function hasFarmShareDetails(farm: FarmShareInput) {
  return Boolean(
    farm.share_text?.trim() ||
      farm.description?.trim() ||
      farm.product_summary?.trim() ||
      farm.phone?.trim() ||
      farm.mobile_phone?.trim() ||
      farm.address?.trim() ||
      farm.address_detail?.trim() ||
      farm.map_url?.trim(),
  )
}

export function formatShareTextPhones(text: string) {
  return text.replace(/^([☎️📱]\s*)(.+)$/gm, (_match, prefix: string, raw: string) => {
    const formatted = formatPhone(raw)
    return `${prefix}${formatted || raw.trim()}`
  })
}

export function resolveFarmShareText(farm: FarmShareInput, origin?: string) {
  const text = farm.share_text?.trim() || buildFarmShareText(farm, origin)
  return formatShareTextPhones(text)
}

export function buildFarmShareText(farm: FarmShareInput, origin?: string) {
  const lines: string[] = []
  const lead = farmShareLead(farm.description)
  if (lead) lines.push(lead)

  const name = farm.name.trim()
  if (name) {
    if (lines.length) lines.push('')
    lines.push(`"${name}" 입니다.`)
  }

  const products = farmProductLines(farm.product_summary)
  if (products.length) {
    lines.push('')
    for (const item of products) lines.push(`🍇 ${item}`)
  }

  const slug = farm.slug.trim()
  if (slug) {
    lines.push('')
    lines.push(FARM_SHARE_ORDER_CTA)
    lines.push(farmLandingUrl(slug, origin))
  }

  const phone = formatPhone(farm.phone)
  const mobile = formatPhone(farm.mobile_phone)
  if (phone || mobile) {
    lines.push('')
    lines.push('문의전화')
    if (phone) lines.push(`☎️ ${phone}`)
    if (mobile) lines.push(`📱 ${mobile}`)
  }

  const address = fullAddress(farm.address ?? '', farm.address_detail, farm.address_zonecode)
  const map = farm.map_url?.trim()
  if (address || map) {
    lines.push('')
    if (address) lines.push(`▶️ 위치 : ${address}`)
    if (map) lines.push(`▶️ 길안내 : ${map}`)
  }

  return lines.join('\n').trim()
}

export function telHref(phone: string | null | undefined) {
  const digits = phone?.replace(/[^\d+]/g, '') ?? ''
  return digits ? `tel:${digits}` : null
}
