import { Navigate } from 'react-router-dom'
import { useState } from 'react'
import { Header } from '../../components/layout/Header'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Textarea } from '../../components/ui/Field'
import { ErrorText, PageSpinner } from '../../components/ui/Feedback'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

export function FarmApply() {
  const { user, loading, isFarmUser, latestApplication, profile } = useAuth()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState({
    farm_name: '',
    owner_name: profile?.display_name ?? '',
    location: '',
    product_summary: '',
    description: '',
    bank_name: '',
    account_number: '',
    account_holder: '',
    phone: profile?.phone ?? '',
  })

  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/login?next=/apply" replace />
  if (isFarmUser) return <Navigate to="/farm" replace />
  if (latestApplication?.status === 'pending') return <Navigate to="/apply/status" replace />

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-dvh bg-surface pb-10">
      <Header title="농가 입점 신청" showBack backTo="/" />
      <form
        className="px-4 py-4 max-w-lg mx-auto space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          setError('')
          setPending(true)
          const { error: insertError } = await supabase.from('farm_applications').insert({
            user_id: user.id,
            ...form,
          })
          setPending(false)
          if (insertError) {
            setError(insertError.message)
            return
          }
          window.location.href = '/apply/status'
        }}
      >
        {latestApplication?.status === 'rejected' && (
          <Card className="bg-red-50 border-red-100">
            <p className="text-sm text-red-700">
              이전 신청이 거절되었습니다. {latestApplication.review_note || '정보를 수정해 다시 신청해주세요.'}
            </p>
          </Card>
        )}
        <Card className="space-y-3">
          <Input label="농가명" value={form.farm_name} onChange={(e) => set('farm_name', e.target.value)} required />
          <Input label="대표자명" value={form.owner_name} onChange={(e) => set('owner_name', e.target.value)} required />
          <Input label="지역" value={form.location} onChange={(e) => set('location', e.target.value)} required />
          <Input
            label="주요 품목"
            value={form.product_summary}
            onChange={(e) => set('product_summary', e.target.value)}
            placeholder="감귤, 한라봉"
          />
          <Textarea
            label="소개"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Card>
        <Card className="space-y-3">
          <h3 className="font-semibold">입금 계좌</h3>
          <Input label="은행명" value={form.bank_name} onChange={(e) => set('bank_name', e.target.value)} required />
          <Input
            label="계좌번호"
            value={form.account_number}
            onChange={(e) => set('account_number', e.target.value)}
            required
          />
          <Input
            label="예금주"
            value={form.account_holder}
            onChange={(e) => set('account_holder', e.target.value)}
            required
          />
          <Input label="연락처" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </Card>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" fullWidth size="lg" disabled={pending}>
          신청하기
        </Button>
      </form>
    </div>
  )
}
