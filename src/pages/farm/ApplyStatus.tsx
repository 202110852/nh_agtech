import { Link, Navigate } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Feedback'
import { useAuth } from '../../lib/auth'

export function FarmApplyStatus() {
  const { loading, isFarmUser, latestApplication } = useAuth()

  if (loading) return <PageSpinner />
  if (isFarmUser) return <Navigate to="/farm" replace />
  if (!latestApplication) return <Navigate to="/apply" replace />

  const statusText =
    latestApplication.status === 'pending'
      ? '관리자 검토를 기다리고 있습니다.'
      : latestApplication.status === 'approved'
        ? '승인되었습니다. 농가 페이지로 이동하세요.'
        : '신청이 거절되었습니다.'

  return (
    <div className="min-h-dvh bg-surface">
      <Header title="입점 신청 현황" showBack backTo="/" />
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Card className="space-y-3">
          <p className="text-lg font-bold">{latestApplication.farm_name}</p>
          <p className="text-sm text-muted">{statusText}</p>
          {latestApplication.review_note && (
            <p className="text-sm text-gray-700">메모: {latestApplication.review_note}</p>
          )}
          {latestApplication.status === 'rejected' && (
            <Link to="/apply">
              <Button fullWidth>다시 신청</Button>
            </Link>
          )}
        </Card>
      </div>
    </div>
  )
}
