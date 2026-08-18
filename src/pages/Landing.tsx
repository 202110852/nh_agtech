import { Leaf, LogIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { useLoginSheet } from '../components/auth/LoginSheet'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Feedback'
import { BRAND } from '../config/brand'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import type { Farm } from '../types/models'

export function Landing() {
  const { user, signOut } = useAuth()
  const { openLogin } = useLoginSheet()
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('farms')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        setFarms((data as Farm[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-dvh bg-surface">
      <Header
        title={BRAND.serviceName}
        subtitle={BRAND.tagline}
        rightElement={
          user ? (
            <button type="button" onClick={() => void signOut()} className="text-sm text-muted">
              로그아웃
            </button>
          ) : (
            <button type="button" onClick={() => openLogin()} className="text-sm font-semibold text-primary">
              로그인
            </button>
          )
        }
      />
      <div className="px-4 py-6 md:px-6 max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl bg-primary p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="h-5 w-5" />
            <span className="text-sm text-white/80">{BRAND.serviceNameEn}</span>
          </div>
          <h2 className="text-2xl font-bold">농가에서 바로, 신선한 직송</h2>
          <p className="mt-2 text-sm text-white/80">
            농가별 주문 페이지에서 상품을 담고, 안내된 계좌로 입금하면 농가가 배송을 준비합니다.
          </p>
        </div>

        {user ? null : (
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => openLogin()} className="w-full text-left">
            <Card className="h-full">
              <LogIn className="h-5 w-5 text-primary" />
              <p className="mt-2 font-semibold">카카오 로그인</p>
              <p className="mt-1 text-sm text-muted">주문자 · 농가 공통</p>
            </Card>
          </button>
        </div>
        )}

        <section>
          <h3 className="mb-3 font-bold text-gray-900">주문할 농가</h3>
          {loading ? (
            <PageSpinner />
          ) : farms.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">아직 공개된 농가가 없습니다.</p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {farms.map((farm) => (
                <Card key={farm.id}>
                  <p className="font-bold text-gray-900">{farm.name}</p>
                  <p className="mt-1 text-sm text-muted">{farm.location || '지역 미등록'}</p>
                  {farm.product_summary && (
                    <p className="mt-1 text-sm text-gray-700">{farm.product_summary}</p>
                  )}
                  <Link to={`/farm/${farm.slug}/landingpage`}>
                    <Button className="mt-4" fullWidth>
                      보러가기
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
