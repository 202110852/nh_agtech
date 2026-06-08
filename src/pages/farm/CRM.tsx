import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { Card } from '../../components/ui/Card'
import { farmNavItems } from '../../config/farmNav'
import type { Customer } from '../../data/mockData'
import { customers, formatPrice } from '../../data/mockData'

function matchesCustomerQuery(customer: Customer, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const normalizedPhone = customer.phone.replace(/-/g, '')
  const queryPhone = normalizedQuery.replace(/-/g, '')

  return (
    customer.name.toLowerCase().includes(normalizedQuery) ||
    normalizedPhone.includes(queryPhone) ||
    customer.memo.toLowerCase().includes(normalizedQuery)
  )
}

export function FarmCRM() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Customer>(customers[0])

  const filtered = useMemo(
    () => customers.filter((customer) => matchesCustomerQuery(customer, query)),
    [query],
  )

  const activeCustomer =
    filtered.find((customer) => customer.id === selected.id) ?? filtered[0] ?? null

  const subtitle =
    query.trim() === ''
      ? `총 ${customers.length}명`
      : `검색 결과 ${filtered.length}명 · 총 ${customers.length}명`

  return (
    <AppShell navItems={farmNavItems} roleLabel="농가 관리">
      <Header title="고객 관리" subtitle={subtitle} />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름, 연락처, 메모로 검색"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-2">
            {filtered.length === 0 ? (
              <p className="text-center text-muted py-8">검색 결과가 없습니다</p>
            ) : (
              filtered.map((customer) => (
              <Card
                key={customer.id}
                onClick={() => setSelected(customer)}
                className={`${activeCustomer?.id === customer.id ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary font-bold text-sm shrink-0">
                    {customer.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-xs text-muted">{customer.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-primary">{customer.orderCount}회</p>
                    <p className="text-xs text-muted">{customer.lastOrderDate}</p>
                  </div>
                </div>
              </Card>
              ))
            )}
          </div>

          <div className="lg:col-span-3 space-y-4">
            {activeCustomer ? (
              <>
                <Card>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white text-xl font-bold">
                      {activeCustomer.name[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{activeCustomer.name}</h3>
                      <p className="text-sm text-muted">{activeCustomer.phone}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-primary-light p-3">
                      <p className="text-xs text-muted">총 주문</p>
                      <p className="text-lg font-bold text-primary">{activeCustomer.orderCount}회</p>
                    </div>
                    <div className="rounded-xl bg-primary-light p-3">
                      <p className="text-xs text-muted">총 구매액</p>
                      <p className="text-lg font-bold text-primary">{formatPrice(activeCustomer.totalSpent)}</p>
                    </div>
                  </div>
                  {activeCustomer.memo && (
                    <p className="mt-3 text-sm text-muted bg-gray-50 rounded-xl p-3">
                      메모: {activeCustomer.memo}
                    </p>
                  )}
                </Card>

                <Card>
                  <h4 className="font-semibold text-gray-900 mb-3">구매 이력</h4>
                  <div className="space-y-3">
                    {activeCustomer.purchaseHistory.map((item, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium">{item.product}</p>
                          <p className="text-xs text-muted">{item.date}</p>
                        </div>
                        <p className="text-sm font-semibold text-primary">{formatPrice(item.amount)}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="text-center py-12">
                <p className="text-muted">검색 조건에 맞는 고객이 없습니다</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
