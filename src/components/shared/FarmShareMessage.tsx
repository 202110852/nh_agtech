import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { KakaoSymbol } from './KakaoChannelButton'
import { BRAND } from '../../config/brand'
import { hasFarmShareDetails, resolveFarmShareText, type FarmShareInput } from '../../lib/farmShareText'

function ownHost() {
  try {
    return new URL(BRAND.siteUrl).hostname.replace(/^www\./, '')
  } catch {
    return 'farmassi.kr'
  }
}

function withKakaoInquiry(text: string, keyPrefix: string) {
  const parts = text.split(/(?:💬\s*)?카카오톡 문의/)
  if (parts.length === 1) return text
  return parts.flatMap((part, index) => {
    if (index === parts.length - 1) return [<span key={`${keyPrefix}-t-${index}`}>{part}</span>]
    return [
      <span key={`${keyPrefix}-t-${index}`}>{part}</span>,
      <span key={`${keyPrefix}-k-${index}`} className="inline-flex items-baseline gap-0.5">
        <KakaoSymbol size={14} fill="#FEE500" />
        카카오톡 문의
      </span>,
    ]
  })
}

function ShareTextBody({ text }: { text: string }) {
  const chunks = text.split(/(https?:\/\/[^\s]+)/g)
  return (
    <p className="whitespace-pre-wrap break-all text-sm leading-7 text-gray-800">
      {chunks.map((chunk, index) => {
        if (!/^https?:\/\//i.test(chunk)) return <span key={index}>{withKakaoInquiry(chunk, String(index))}</span>
        try {
          const url = new URL(chunk)
          if (url.hostname.replace(/^www\./, '') === ownHost()) {
            return (
              <Link key={index} to={`${url.pathname}${url.search}${url.hash}`} className="font-medium text-primary">
                {chunk}
              </Link>
            )
          }
        } catch {
          /* keep as external */
        }
        return (
          <a key={index} href={chunk} target="_blank" rel="noreferrer" className="font-medium text-primary">
            {chunk}
          </a>
        )
      })}
    </p>
  )
}

export function FarmShareMessage({ farm }: { farm: FarmShareInput }) {
  if (!hasFarmShareDetails(farm)) return null
  const text = resolveFarmShareText(farm)
  if (!text) return null
  return (
    <Card>
      <ShareTextBody text={text} />
    </Card>
  )
}
