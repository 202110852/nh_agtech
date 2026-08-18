import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { composePhone, CUSTOM_PHONE_PREFIX, parsePhone, PHONE_PREFIXES } from '../../lib/phone'

interface PhoneFieldProps {
  label?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

const boxClass =
  'h-11 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

export function PhoneField({ label = '전화번호', value, onChange, required }: PhoneFieldProps) {
  const parsed = parsePhone(value)
  const [custom, setCustom] = useState(!parsed.isListed && Boolean(value))
  const [customPrefix, setCustomPrefix] = useState(parsed.isListed ? '' : parsed.prefix)
  const [listedPrefix, setListedPrefix] = useState(parsed.isListed ? parsed.prefix : '010')
  const [menuOpen, setMenuOpen] = useState(false)
  const lastRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!value.trim()) return
    const next = parsePhone(value)
    if (next.isListed) {
      setCustom(false)
      setListedPrefix(next.prefix)
    } else {
      setCustom(true)
      setCustomPrefix(next.prefix)
    }
  }, [value])

  useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  const prefix = custom ? customPrefix : listedPrefix

  function emit(nextPrefix: string, mid: string, last: string) {
    onChange(composePhone(nextPrefix, mid, last))
  }

  function choosePrefix(next: string) {
    setMenuOpen(false)
    if (next === CUSTOM_PHONE_PREFIX) {
      const start = customPrefix || listedPrefix
      setCustom(true)
      setCustomPrefix(start)
      emit(start, parsed.mid, parsed.last)
      return
    }
    setCustom(false)
    setListedPrefix(next)
    emit(next, parsed.mid, parsed.last)
  }

  return (
    <div>
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="mt-1 flex min-w-0 items-center gap-1.5">
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            className={`${boxClass} inline-flex w-24 items-center justify-between px-2.5`}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="truncate">{custom ? '직접입력' : listedPrefix}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
          </button>
          {menuOpen && (
            <ul
              role="listbox"
              className="absolute left-0 top-full z-20 mt-1 max-h-56 w-28 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
            >
              <li>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-primary-light"
                  onClick={() => choosePrefix(CUSTOM_PHONE_PREFIX)}
                >
                  직접입력
                </button>
              </li>
              {PHONE_PREFIXES.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-primary-light"
                    onClick={() => choosePrefix(item)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {custom && (
          <input
            type="tel"
            inputMode="numeric"
            aria-label="앞자리 직접입력"
            className={`${boxClass} w-16 shrink-0 px-2 text-center`}
            placeholder="010"
            maxLength={4}
            required={required}
            value={customPrefix}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, '').slice(0, 4)
              setCustomPrefix(next)
              emit(next, parsed.mid, parsed.last)
            }}
          />
        )}
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required={required}
          placeholder="1234"
          maxLength={4}
          className={`${boxClass} min-w-0 flex-1 px-3 text-center tracking-wide`}
          value={parsed.mid}
          onChange={(e) => {
            const mid = e.target.value.replace(/\D/g, '').slice(0, 4)
            emit(prefix, mid, parsed.last)
            if (mid.length === 4) lastRef.current?.focus()
          }}
        />
        <span className="shrink-0 text-muted">-</span>
        <input
          ref={lastRef}
          type="tel"
          inputMode="numeric"
          placeholder="5678"
          maxLength={4}
          required={required}
          className={`${boxClass} min-w-0 flex-1 px-3 text-center tracking-wide`}
          value={parsed.last}
          onChange={(e) => {
            const last = e.target.value.replace(/\D/g, '').slice(0, 4)
            emit(prefix, parsed.mid, last)
          }}
        />
      </div>
    </div>
  )
}
