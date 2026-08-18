import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const PRESETS = [
  { id: 'custom', label: '직접입력' },
  { id: 'none', label: '요청사항 없음' },
  { id: 'door', label: '문 앞에 놓아주세요' },
  { id: 'guard', label: '경비실에 맡겨주세요' },
  { id: 'locker', label: '택배함에 넣어주세요' },
  { id: 'call', label: '배송 전에 연락주세요' },
  { id: 'hand', label: '직접 받겠습니다' },
] as const

const PRESET_VALUES = PRESETS.filter((item) => item.id !== 'none' && item.id !== 'custom').map((item) => item.label)

interface RequestMemoFieldProps {
  label?: string
  value: string
  onChange: (value: string) => void
}

function resolveId(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 'none'
  if (PRESET_VALUES.includes(trimmed as (typeof PRESET_VALUES)[number])) {
    return PRESETS.find((item) => item.label === trimmed)?.id ?? 'custom'
  }
  return 'custom'
}

export function RequestMemoField({ label = '요청사항', value, onChange }: RequestMemoFieldProps) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(resolveId(value))
  const menuRef = useRef<HTMLDivElement>(null)
  const custom = selectedId === 'custom'
  const current = PRESETS.find((item) => item.id === selectedId) ?? PRESETS[0]

  useEffect(() => {
    const next = resolveId(value)
    if (next !== 'none' || value.trim()) setSelectedId(next)
  }, [value])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function choose(id: (typeof PRESETS)[number]['id']) {
    setSelectedId(id)
    setOpen(false)
    if (id === 'none') {
      onChange('')
      return
    }
    if (id === 'custom') {
      if (PRESET_VALUES.includes(value.trim() as (typeof PRESET_VALUES)[number]) || !value.trim()) {
        onChange('')
      }
      return
    }
    onChange(PRESETS.find((item) => item.id === id)?.label ?? '')
  }

  return (
    <div>
      <span className="text-xs font-medium text-muted">{label}</span>
      <div ref={menuRef} className="relative mt-1">
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className={current.id === 'none' ? 'text-muted' : 'text-gray-900'}>{current.label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
        {open && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          >
            {PRESETS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-primary-light ${
                    item.id === selectedId ? 'font-medium text-primary' : ''
                  }`}
                  onClick={() => choose(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {custom && (
        <textarea
          className="mt-2 min-h-24 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="예: 공동현관 비밀번호 1234, 벨은 누르지 말아주세요"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}
