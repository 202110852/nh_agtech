import { Bell, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Textarea } from '../../components/ui/Field'
import { ErrorText } from '../../components/ui/Feedback'
import { farmNavItems } from '../../config/farmNav'
import { useAuth } from '../../lib/auth'
import { isPushSupported, registerServiceWorker, subscribePush } from '../../lib/push'
import { supabase } from '../../lib/supabase'

export function FarmSettings() {
  const { currentFarm, profile, signOut } = useAuth()
  const [form, setForm] = useState({
    location: currentFarm?.location ?? '',
    product_summary: currentFarm?.product_summary ?? '',
    description: currentFarm?.description ?? '',
    bank_name: currentFarm?.bank_name ?? '',
    account_number: currentFarm?.account_number ?? '',
    account_holder: currentFarm?.account_holder ?? '',
    phone: profile?.phone ?? '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pushMessage, setPushMessage] = useState('')

  if (!currentFarm) return null

  return (
    <AppShell navItems={farmNavItems} roleLabel="농가">
      <Header title="설정" subtitle={currentFarm.name} />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-5">
        <Card className="space-y-3">
          <h3 className="font-semibold">농가 정보</h3>
          <Input
            label="지역"
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
          />
          <Input
            label="품목"
            value={form.product_summary}
            onChange={(e) => setForm((p) => ({ ...p, product_summary: e.target.value }))}
          />
          <Textarea
            label="소개"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
        </Card>
        <Card className="space-y-3">
          <h3 className="font-semibold">입금 계좌</h3>
          <Input label="은행" value={form.bank_name} onChange={(e) => setForm((p) => ({ ...p, bank_name: e.target.value }))} />
          <Input
            label="계좌번호"
            value={form.account_number}
            onChange={(e) => setForm((p) => ({ ...p, account_number: e.target.value }))}
          />
          <Input
            label="예금주"
            value={form.account_holder}
            onChange={(e) => setForm((p) => ({ ...p, account_holder: e.target.value }))}
          />
          <Input label="연락처" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <ErrorText>{error}</ErrorText>
          {message && <p className="text-sm text-primary">{message}</p>}
          <Button
            onClick={async () => {
              setError('')
              setMessage('')
              const { error: farmError } = await supabase
                .from('farms')
                .update({
                  location: form.location,
                  product_summary: form.product_summary,
                  description: form.description,
                  bank_name: form.bank_name,
                  account_number: form.account_number,
                  account_holder: form.account_holder,
                })
                .eq('id', currentFarm.id)
              if (farmError) {
                setError(farmError.message)
                return
              }
              if (profile) {
                await supabase.from('profiles').update({ phone: form.phone }).eq('id', profile.id)
              }
              setMessage('저장했습니다.')
            }}
          >
            저장
          </Button>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">웹 푸시 알림</h3>
          </div>
          <p className="text-sm text-muted">
            주문이 들어오거나 입금이 확인되면 알림을 받습니다. iOS는 홈 화면에 추가한 뒤에만 푸시가 동작하며, 권한·브라우저 제약으로 100% 보장은 되지 않습니다. 앱이 열려 있으면 화면 알림은 항상 표시됩니다.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Smartphone className="h-4 w-4" />
            공유 → 홈 화면에 추가 후 알림 허용
          </div>
          {pushMessage && <p className="text-sm text-primary">{pushMessage}</p>}
          <Button
            variant="outline"
            onClick={async () => {
              try {
                if (!isPushSupported()) throw new Error('이 브라우저는 웹 푸시를 지원하지 않습니다.')
                await registerServiceWorker()
                const sub = await subscribePush()
                const { error: subError } = await supabase.from('push_subscriptions').upsert(
                  {
                    user_id: profile?.id,
                    endpoint: sub.endpoint,
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                    user_agent: navigator.userAgent,
                  },
                  { onConflict: 'endpoint' },
                )
                if (subError) throw subError
                setPushMessage('푸시 알림이 허용되었습니다.')
              } catch (err) {
                setPushMessage(err instanceof Error ? err.message : '푸시 설정에 실패했습니다.')
              }
            }}
          >
            알림 허용하기
          </Button>
        </Card>

        <Button variant="ghost" onClick={() => void signOut()}>
          로그아웃
        </Button>
      </div>
    </AppShell>
  )
}
