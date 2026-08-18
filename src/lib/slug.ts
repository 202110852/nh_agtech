const CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']
const JUNG = [
  'a',
  'ae',
  'ya',
  'yae',
  'eo',
  'e',
  'yeo',
  'ye',
  'o',
  'wa',
  'wae',
  'oe',
  'yo',
  'u',
  'wo',
  'we',
  'wi',
  'yu',
  'eu',
  'ui',
  'i',
]
const JONG = [
  '',
  'k',
  'k',
  'k',
  'n',
  'n',
  'n',
  't',
  'l',
  'k',
  'm',
  'l',
  'l',
  'l',
  'p',
  'l',
  'm',
  'p',
  'p',
  't',
  't',
  'ng',
  't',
  't',
  'k',
  't',
  'p',
  't',
]

function romanizeKorean(text: string) {
  let out = ''
  for (const char of text) {
    const code = char.charCodeAt(0) - 0xac00
    if (code < 0 || code > 11171) {
      out += char
      continue
    }
    const cho = Math.floor(code / 588)
    const jung = Math.floor((code % 588) / 28)
    const jong = code % 28
    out += `${CHO[cho]}${JUNG[jung]}${JONG[jong]}`
  }
  return out
}

export function toSlug(value: string) {
  return romanizeKorean(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
