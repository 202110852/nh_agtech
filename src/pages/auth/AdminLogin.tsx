import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { useLoginSheet } from '../../components/auth/LoginSheet'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Field'
import { ErrorText } from '../../components/ui/Feedback'
import { useAuth } from '../../lib/auth'

export function AdminLogin() {
  const { isAdmin, user, loading, signInWithEmail } = useAuth()
  const { openLogin } = useLoginSheet()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  if (!loading && isAdmin) return <Navigate to="/admin" replace />

  return (
    <div className="min-h-dvh bg-surface">
      <Header title="관리자 로그인" showBack backTo="/" />
      <div className="px-4 py-8 max-w-md mx-auto">
        <Card className="space-y-4">
          <p className="text-sm text-muted">관리자만 이메일과 비밀번호로 로그인할 수 있습니다.</p>
          {user && !isAdmin && (
            <ErrorText>일반 계정으로는 관리자 페이지에 들어갈 수 없습니다.</ErrorText>
          )}
          <ErrorText>{error}</ErrorText>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setError('')
              setPending(true)
              try {
                await signInWithEmail(email, password)
              } catch (err) {
                setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
              } finally {
                setPending(false)
              }
            }}
          >
            <Input label="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth disabled={pending}>
              로그인
            </Button>
          </form>
        </Card>
        <p className="mt-4 text-center text-sm text-muted">
          주문자/농가이신가요?{' '}
          <button type="button" onClick={() => openLogin()} className="text-primary font-semibold">
            카카오 로그인
          </button>
        </p>
      </div>
    </div>
  )
}
