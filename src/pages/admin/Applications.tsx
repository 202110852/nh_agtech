import { useEffect, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ErrorText } from '../../components/ui/Feedback'
import { adminNavItems } from '../../config/adminNav'
import { invokeFunction } from '../../lib/functions'
import { supabase } from '../../lib/supabase'
import type { FarmApplication } from '../../types/models'

export function AdminApplications() {
  const [rows, setRows] = useState<FarmApplication[]>([])
  const [error, setError] = useState('')
  const [note, setNote] = useState<Record<string, string>>({})

  async function load() {
    const { data } = await supabase
      .from('farm_applications')
      .select('*')
      .order('created_at', { ascending: false })
    setRows((data as FarmApplication[]) ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  async function review(id: string, action: 'approve' | 'reject') {
    setError('')
    try {
      await invokeFunction('approve-farm', { applicationId: id, action, reviewNote: note[id] ?? '' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리에 실패했습니다.')
    }
  }

  return (
    <AppShell navItems={adminNavItems} roleLabel="관리자" settingsPath="/admin/none">
      <Header title="농가 신청" subtitle={`${rows.length}건`} />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-3">
        <ErrorText>{error}</ErrorText>
        {rows.map((row) => (
          <Card key={row.id} className="space-y-2">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-bold">{row.farm_name}</p>
                <p className="text-sm text-muted">
                  {row.owner_name} · {row.location}
                </p>
              </div>
              <span className="text-xs font-semibold">{row.status}</span>
            </div>
            <p className="text-sm">
              {row.bank_name} {row.account_number} ({row.account_holder})
            </p>
            {row.status === 'pending' && (
              <div className="space-y-2">
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  placeholder="검토 메모"
                  value={note[row.id] ?? ''}
                  onChange={(e) => setNote((prev) => ({ ...prev, [row.id]: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void review(row.id, 'approve')}>
                    승인
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void review(row.id, 'reject')}>
                    거절
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted">신청 내역이 없습니다.</p>}
      </div>
    </AppShell>
  )
}
