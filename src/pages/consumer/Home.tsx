import { Home as HomeIcon, Package, Snowflake } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { ProductCard } from '../../components/shared/ProductCard'
import { Badge } from '../../components/ui/Badge'
import { products } from '../../data/mockData'

const navItems = [
  { to: '/consumer', label: '홈', icon: HomeIcon },
  { to: '/consumer/tracking', label: '배송조회', icon: Package },
]

export function ConsumerHome() {
  const navigate = useNavigate()

  return (
    <AppShell navItems={navItems} roleLabel="소비자">
      <Header title="스테이블 퓨전" subtitle="농가 직송 신선 농산물" />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl bg-primary p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Snowflake className="h-4 w-4" />
            <Badge className="!bg-white/20 !text-white text-xs">NH 콜드체인</Badge>
          </div>
          <h2 className="text-lg font-bold">익일 배송 · 최고 신선도</h2>
          <p className="mt-1 text-sm text-white/80">
            농가에서 NH 냉장 물류를 경유하여 신선하게 배송됩니다
          </p>
        </div>

        <section>
          <h3 className="mb-3 font-bold text-gray-900">오늘의 신선 농산물</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/consumer/product/${product.id}`)}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
