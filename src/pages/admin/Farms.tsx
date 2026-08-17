import { useEffect, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Field'
import { adminNavItems } from '../../config/adminNav'
import { supabase } from '../../lib/supabase'
import type { Farm } from '../../types/models'

export function AdminFarms() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [editing, setEditing] = useState<Farm | null>(null)

  async function load() {
    const { data } = await supabase.from('farms').select('*').order('created_at', { ascending: false })
    setFarms((data as Farm[]) ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <AppShell navItems={adminNavItems} roleLabel="관리자" settingsPath="/admin/none">
      <Header title="농가" subtitle={`${farms.length}곳`} />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-3">
        {farms.map((farm) => (
          <Card key={farm.id} className="space-y-2">
            {editing?.id === farm.id ? (
              <div className="space-y-2">
                <Input
                  label="농가명"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
                <Input
                  label="슬러그"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                />
                <Input
                  label="은행"
                  value={editing.bank_name}
                  onChange={(e) => setEditing({ ...editing, bank_name: e.target.value })}
                />
                <Input
                  label="계좌"
                  value={editing.account_number}
                  onChange={(e) => setEditing({ ...editing, account_number: e.target.value })}
                />
                <Input
                  label="예금주"
                  value={editing.account_holder}
                  onChange={(e) => setEditing({ ...editing, account_holder: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await supabase
                        .from('farms')
                        .update({
                          name: editing.name,
                          slug: editing.slug,
                          bank_name: editing.bank_name,
                          account_number: editing.account_number,
                          account_holder: editing.account_holder,
                        })
                        .eq('id', farm.id)
                      setEditing(null)
                      await load()
                    }}
                  >
                    저장
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold">{farm.name}</p>
                    <p className="text-xs text-muted">/o/{farm.slug}</p>
                    <p className="text-sm mt-1">
                      {farm.bank_name} {farm.account_number}
                    </p>
                  </div>
                  <span className="text-xs">{farm.is_active ? '공개' : '비공개'}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(farm)}>
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await supabase.from('farms').update({ is_active: !farm.is_active }).eq('id', farm.id)
                      await load()
                    }}
                  >
                    {farm.is_active ? '비공개' : '공개'}
                  </Button>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  )
}
