import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '../ui/Button'
import { copyText } from '../../lib/clipboard'
import { buildFarmShareText, type FarmShareInput } from '../../lib/farmShareText'

export function FarmSharePreview({ farm }: { farm: FarmShareInput }) {
  const [copied, setCopied] = useState(false)
  const text = buildFarmShareText(farm)
  if (!text) return null

  async function handleCopy() {
    const ok = await copyText(text)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">안내 문자</p>
        <Button type="button" size="sm" variant="outline" onClick={() => void handleCopy()}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? '복사됨' : '복사'}
        </Button>
      </div>
      <pre className="whitespace-pre-wrap break-all rounded-xl bg-white px-3 py-3 text-sm leading-7 text-gray-800">
        {text}
      </pre>
    </div>
  )
}
