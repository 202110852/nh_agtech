export const CUSTOM_PHONE_PREFIX = 'custom'

export const PHONE_PREFIXES = ['010', '011', '016', '017', '018', '019'] as const

export function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

export interface ParsedPhone {
  prefix: string
  mid: string
  last: string
  isListed: boolean
}

function splitRest(rest: string) {
  const digits = rest.slice(0, 8)
  if (digits.length <= 4) return { mid: digits, last: '' }
  if (digits.length <= 7) return { mid: digits.slice(0, digits.length - 4), last: digits.slice(-4) }
  return { mid: digits.slice(0, 4), last: digits.slice(4, 8) }
}

export function parsePhone(value: string): ParsedPhone {
  const parts = value.split('-').map(digitsOnly).filter(Boolean)
  if (parts.length >= 3) {
    const prefix = parts[0]
    return {
      prefix,
      mid: parts[1].slice(0, 4),
      last: parts[2].slice(0, 4),
      isListed: PHONE_PREFIXES.includes(prefix as (typeof PHONE_PREFIXES)[number]),
    }
  }
  if (parts.length === 2) {
    const prefix = parts[0]
    const rest = parts[1]
    return {
      prefix,
      ...(rest.length > 4 ? splitRest(rest) : { mid: rest.slice(0, 4), last: '' }),
      isListed: PHONE_PREFIXES.includes(prefix as (typeof PHONE_PREFIXES)[number]),
    }
  }

  const digits = digitsOnly(value)
  if (!digits) return { prefix: '010', mid: '', last: '', isListed: true }

  const listed = PHONE_PREFIXES.find((item) => digits.startsWith(item))
  if (listed) {
    return { prefix: listed, ...splitRest(digits.slice(listed.length)), isListed: true }
  }

  const prefixLen = digits.startsWith('0') ? 3 : 4
  return { prefix: digits.slice(0, prefixLen), ...splitRest(digits.slice(prefixLen)), isListed: false }
}

export function composePhone(prefix: string, mid: string, last: string) {
  const head = digitsOnly(prefix)
  const middle = digitsOnly(mid).slice(0, 4)
  const tail = digitsOnly(last).slice(0, 4)
  if (!middle && !tail) return ''
  return [head, middle, tail].filter(Boolean).join('-')
}

export function formatPhone(value: string | null | undefined) {
  const raw = value?.trim() ?? ''
  if (!raw) return ''
  const parsed = parsePhone(raw)
  return composePhone(parsed.prefix, parsed.mid, parsed.last) || raw
}
