import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ErrorText } from '../../components/ui/Feedback'
import { BRAND } from '../../config/brand'
import { useAuth } from '../../lib/auth'
import { kakaoJsKey } from '../../lib/kakao'

export function Login() {
  const { signInWithKakao } = useAuth()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  return (
    <div className="min-h-dvh bg-surface">
      <Header title="로그인" showBack backTo="/" />
      <div className="px-4 py-8 max-w-md mx-auto space-y-4">
        <Card>
          <h2 className="text-lg font-bold">{BRAND.serviceName} 카카오 로그인</h2>
          <p className="mt-2 text-sm text-muted">
            휴대폰에서는 카카오톡 앱이 바로 열립니다. PC에서는 카카오계정 로그인 화면으로 이동합니다.
          </p>
          <ErrorText>{error}</ErrorText>
          {!kakaoJsKey() && (
            <ErrorText>
              VITE_KAKAO_JS_KEY가 없습니다. 카카오디벨로퍼스 JavaScript 키를 .env.local에 넣고 개발 서버를 다시
              시작하세요.
            </ErrorText>
          )}
          <Button
            className="mt-4 bg-[#FEE500] text-[#191919] hover:bg-[#ead84a]"
            fullWidth
            size="lg"
            disabled={pending || !kakaoJsKey()}
            onClick={async () => {
              setError('')
              setPending(true)
              try {
                sessionStorage.setItem('farmassi-next', next)
                await signInWithKakao(next)
              } catch (err) {
                setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
                setPending(false)
              }
            }}
          >
            카카오톡으로 시작하기
          </Button>
        </Card>
        <p className="text-center text-sm text-muted">
          관리자이신가요?{' '}
          <Link to="/admin/login" className="text-primary font-semibold">
            이메일 로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
