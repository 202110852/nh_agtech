import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { formatDateTime } from '../../lib/format'
import type { AppNotification } from '../../types/models'

export function NotificationBell({ farmPath = '/farm/orders' }: { farmPath?: string }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])

  useEffect(() => {
    if (!user) return
    const userId = user.id
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      if (!cancelled) setItems((data as AppNotification[]) ?? [])
    }

    void load()
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as AppNotification
          setItems((prev) => [row, ...prev.filter((item) => item.id !== row.id)].slice(0, 20))
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) {
            new Notification(row.title, { body: row.body })
          }
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [user])

  const unread = items.filter((item) => !item.is_read).length

  async function markAllRead() {
    if (!user || unread === 0) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setItems((prev) => prev.map((item) => ({ ...item, is_read: true })))
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          void markAllRead()
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
        aria-label="알림"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl border border-gray-100 bg-white shadow-lg z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold">알림</p>
            <button type="button" className="text-xs text-muted" onClick={() => setOpen(false)}>
              닫기
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">아직 알림이 없습니다</p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  to={item.order_id ? `${farmPath}?highlight=${item.order_id}` : farmPath}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                >
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{item.body}</p>
                  <p className="mt-1 text-[10px] text-muted">{formatDateTime(item.created_at)}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
