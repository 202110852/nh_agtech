const PREFIX = 'farmassi-cart:'

export interface CartItem {
  productId: string
  quantity: number
}

function key(farmSlug: string) {
  return `${PREFIX}${farmSlug}`
}

export function getCart(farmSlug: string): CartItem[] {
  try {
    const raw = localStorage.getItem(key(farmSlug))
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return parsed.filter((item) => item.productId && item.quantity > 0)
  } catch {
    return []
  }
}

export function setCart(farmSlug: string, items: CartItem[]) {
  const next = items.filter((item) => item.quantity > 0)
  localStorage.setItem(key(farmSlug), JSON.stringify(next))
}

export function clearCart(farmSlug: string) {
  localStorage.removeItem(key(farmSlug))
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}
