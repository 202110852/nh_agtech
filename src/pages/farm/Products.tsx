import { useState } from 'react'
import { FarmOrderPageLink } from '../../components/layout/FarmOrderPageLink'
import { Header } from '../../components/layout/Header'
import { NotificationBell } from '../../components/notifications/NotificationBell'
import { ProductManager } from '../../components/shared/ProductManager'
import { useFarmWorkspace } from '../../lib/farmWorkspace'

export function FarmProducts() {
  const { farm, basePath } = useFarmWorkspace()
  const [count, setCount] = useState(0)

  return (
    <>
      <Header
        title="상품 관리"
        subtitle={`총 ${count}건`}
        rightElement={
          <>
            <FarmOrderPageLink slug={farm.slug} />
            <NotificationBell farmPath={`${basePath}/orders`} />
          </>
        }
      />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto">
        <ProductManager farmId={farm.id} variant="farm" onCountChange={setCount} />
      </div>
    </>
  )
}
