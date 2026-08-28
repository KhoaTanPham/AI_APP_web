import type { CartResponse, OrderResponse, ProductDetails, ProductSummary } from '@mobilemarket/shared'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const sessionStorageKey = 'mobilemarket-session-id'

export function getSessionId(): string {
  const existing = sessionStorage.getItem(sessionStorageKey)
  if (existing) return existing
  const sessionId = crypto.randomUUID()
  sessionStorage.setItem(sessionStorageKey, sessionId)
  return sessionId
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('x-session-id', getSessionId())
  if (options.body) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.error?.message || 'Request failed')
  return payload as T
}

export const api = {
  products: (search: string) => request<ProductSummary[]>(`/products?search=${encodeURIComponent(search.trim())}`),
  product: (id: number) => request<ProductDetails>(`/products/${id}`),
  cart: () => request<CartResponse>('/cart'),
  addToCart: (productId: number, quantity = 1) => request('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (id: number, quantity: number) => request(`/cart/items/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeCartItem: (id: number) => request<void>(`/cart/items/${id}`, { method: 'DELETE' }),
  createOrder: (data: Record<string, string>) => request<OrderResponse>('/orders', { method: 'POST', headers: { 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ ...data, paymentMethod: 'COD' }) }),
  order: (orderNumber: string) => request<OrderResponse>(`/orders/${encodeURIComponent(orderNumber)}`),
}
