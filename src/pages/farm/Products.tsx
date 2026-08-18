import { useState } from 'react'
import { Header } from '../../components/layout/Header'
import { NotificationBell } from '../../components/notifications/NotificationBell'
import { ProductManager } from '../../components/shared/ProductManager'
import { useFarmWorkspace } from '../../lib/farmWorkspace'

export function FarmProducts() {
  const { farm, basePath, isAdminView } = useFarmWorkspace()
  const [count, setCount] = useState(0)

  return (
    <>
      <Header
        title="상품 관리"
        subtitle={`총 ${count}건`}
        showBack={isAdminView}
        backTo={basePath}
        rightElement={<NotificationBell farmPath={`${basePath}/orders`} />}
      />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto">
        <ProductManager farmId={farm.id} variant="farm" onCountChange={setCount} />
      </div>
    </>
  )
}
