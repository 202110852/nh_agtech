import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorText, PageSpinner } from '../../components/ui/Feedback'
import { invokeFunction } from '../../lib/functions'
import { clearKakaoCallback, readKakaoCallback } from '../../lib/kakao'
import { supabase } from '../../lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const next = params.get('next') || sessionStorage.getItem('farmassi-next') || '/'
    let done = false

    function go(path: string) {
      if (done) return
      done = true
      sessionStorage.removeItem('farmassi-next')
      clearKakaoCallback()
      navigate(path, { replace: true })
    }

    async function finish() {
      const kakao = readKakaoCallback(params)
      if (kakao.error) {
        setError(kakao.errorDescription || kakao.error)
        return
      }

      if (kakao.isKakaoCallback) {
        if (kakao.state !== kakao.savedState) {
          setError('로그인 요청이 만료되었습니다. 다시 시도해주세요.')
          return
        }
        try {
          const { hashedToken } = await invokeFunction<{ hashedToken: string }>('kakao-login', {
            code: kakao.code,
            redirectUri: kakao.redirectUri,
          })
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash: hashedToken,
            type: 'email',
          })
          if (otpError) throw otpError
          go(next)
        } catch (err) {
          setError(err instanceof Error ? err.message : '카카오 로그인에 실패했습니다.')
        }
        return
      }

      const { data } = await supabase.auth.getSession()
      if (data.session) {
        go(next)
        return
      }
      go('/login')
    }

    void finish()
  }, [navigate, params])

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 px-4">
        <ErrorText>{error}</ErrorText>
        <Link to="/login" className="text-sm font-semibold text-primary">
          로그인으로 돌아가기
        </Link>
      </div>
    )
  }

  return <PageSpinner label="로그인 처리 중..." />
}
