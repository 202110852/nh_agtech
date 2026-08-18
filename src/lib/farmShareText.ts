export function farmLandingPath(slug: string) {
  return `/farm/${slug}/landingpage`
}

export function farmLandingUrl(slug: string, origin = typeof window === 'undefined' ? '' : window.location.origin) {
  const base = origin.replace(/\/+$/, '')
  return `${base}${farmLandingPath(slug)}`
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
  map_url?: string | null
}

export function hasFarmShareDetails(farm: FarmShareInput) {
  return Boolean(
    farm.description?.trim() ||
      farm.product_summary?.trim() ||
      farm.phone?.trim() ||
      farm.mobile_phone?.trim() ||
      farm.address?.trim() ||
      farm.map_url?.trim(),
  )
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
    lines.push('👇 주문하러가기[클릭] 👇')
    lines.push(farmLandingUrl(slug, origin))
  }

  const phone = farm.phone?.trim()
  const mobile = farm.mobile_phone?.trim()
  if (phone || mobile) {
    lines.push('')
    lines.push('문의전화')
    if (phone) lines.push(`☎️ ${phone}`)
    if (mobile) lines.push(`📱 ${mobile}`)
  }

  const address = farm.address?.trim()
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
