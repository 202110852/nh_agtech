import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, pending, onCancel])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="닫기"
        disabled={pending}
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-bold">
          {title}
        </h2>
        {description ? <div className="mt-2 text-sm text-muted">{description}</div> : null}
        <div className="mt-5 flex gap-2">
          <Button type="button" variant="ghost" fullWidth disabled={pending} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" fullWidth disabled={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
