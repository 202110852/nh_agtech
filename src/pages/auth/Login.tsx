import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLoginSheet } from '../../components/auth/LoginSheet'
import { PageSpinner } from '../../components/ui/Feedback'

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/'
  return raw
}

export function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { openLogin } = useLoginSheet()

  const nextPath = params.get('next')

  useEffect(() => {
    openLogin({ next: safeNext(nextPath), dismissTo: '/' })
    navigate('/', { replace: true })
  }, [navigate, openLogin, nextPath])

  return <PageSpinner />
}
