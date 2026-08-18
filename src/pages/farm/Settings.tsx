import { Bell, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Header } from '../../components/layout/Header'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Field'
import { ErrorText } from '../../components/ui/Feedback'
import { useAuth } from '../../lib/auth'
import { useFarmWorkspace } from '../../lib/farmWorkspace'
import { isPushSupported, registerServiceWorker, subscribePush } from '../../lib/push'
import { supabase } from '../../lib/supabase'

export function FarmSettings() {
  const { farm, isAdminView } = useFarmWorkspace()
  const { profile, signOut, refresh } = useAuth()
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pushMessage, setPushMessage] = useState('')

  if (isAdminView) {
    return (
      <>
        <Header title="설정" subtitle={farm.name} />
        <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto">
          <p className="text-sm text-muted">농가명, 계좌, 소개 등 농가 정보는 농가 목록에서만 수정할 수 있습니다.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="설정" subtitle={farm.name} />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-5">
        <Card className="space-y-3">
          <h3 className="font-semibold">연락처</h3>
          <Input label="연락처" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <ErrorText>{error}</ErrorText>
          {message && <p className="text-sm text-primary">{message}</p>}
          <Button
            onClick={async () => {
              setError('')
              setMessage('')
              if (!profile) return
              const { error: profileError } = await supabase
                .from('profiles')
                .update({ phone })
                .eq('id', profile.id)
              if (profileError) {
                setError(profileError.message)
                return
              }
              await refresh()
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
    </>
  )
}
