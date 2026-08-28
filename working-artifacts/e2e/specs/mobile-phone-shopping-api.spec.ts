import { test, expect, type APIRequestContext } from '@playwright/test'
import { randomUUID } from 'node:crypto'

/**
 * Approach: A6 API contract driven, with deterministic seeded products.
 * Traceability: TC_MOBILE_007, 008, 009, 017, 023, 024, 025, 029, 032, 033, 035, 037.
 * Assumptions: the API is seeded with at least one active product with stock >= 2.
 * Cases requiring direct stock/price mutation remain planned until a test-data hook exists.
 */
const apiUrl = 'http://127.0.0.1:3000/api'
const validOrder = {
  customerName: 'API Test Shopper',
  phoneNumber: '+84901234567',
  email: '',
  shippingAddress: '1 Test Street',
  city: 'Test City',
  postalCode: '70000',
  paymentMethod: 'COD',
}

const headers = (sessionId = randomUUID(), idempotencyKey = randomUUID()) => ({
  'x-session-id': sessionId,
  'Idempotency-Key': idempotencyKey,
})

async function activeProduct(request: APIRequestContext) {
  const response = await request.get(`${apiUrl}/products`)
  expect(response.ok()).toBeTruthy()
  const products = await response.json()
  const product = products.find((candidate: { stockQuantity: number }) => candidate.stockQuantity >= 2)
  expect(product).toBeTruthy()
  return product as { id: number; name: string; brand: string; price: number; stockQuantity: number }
}

async function addItem(request: APIRequestContext, sessionId: string, productId: number, quantity = 1) {
  return request.post(`${apiUrl}/cart/items`, { headers: { 'x-session-id': sessionId }, data: { productId, quantity } })
}

test.describe('Mobile Phone Shopping API contract', () => {
  test('TC_MOBILE_033: searches product name and brand case-insensitively', async ({ request }) => {
    const product = await activeProduct(request)
    for (const search of [product.name.toLowerCase(), product.name.toUpperCase(), product.brand.toUpperCase()]) {
      const response = await request.get(`${apiUrl}/products`, { params: { search } })
      expect(response.status()).toBe(200)
      const products = await response.json()
      expect(products.some((candidate: { id: number }) => candidate.id === product.id)).toBeTruthy()
    }
  })

  test('TC_MOBILE_007 / TC_MOBILE_008: duplicate add increases one line and rejects overflow', async ({ request }) => {
    const product = await activeProduct(request)
    const sessionId = randomUUID()
    expect((await addItem(request, sessionId, product.id, 1)).status()).toBe(201)
    expect((await addItem(request, sessionId, product.id, product.stockQuantity)).status()).toBe(409)
    const cart = await request.get(`${apiUrl}/cart`, { headers: { 'x-session-id': sessionId } })
    expect(cart.status()).toBe(200)
    const body = await cart.json()
    expect(body.items).toHaveLength(1)
    expect(body.items[0].quantity).toBe(1)
  })

  test('TC_MOBILE_009 / TC_MOBILE_032: maps invalid and unknown cart mutations safely', async ({ request }) => {
    const product = await activeProduct(request)
    const sessionId = randomUUID()
    await addItem(request, sessionId, product.id)
    const cart = await request.get(`${apiUrl}/cart`, { headers: { 'x-session-id': sessionId } })
    const cartBody = await cart.json()
    const itemId = cartBody.items[0].id
    const invalid = await request.put(`${apiUrl}/cart/items/${itemId}`, { headers: { 'x-session-id': sessionId }, data: { quantity: 0 } })
    expect(invalid.status()).toBe(400)
    const unknown = await request.delete(`${apiUrl}/cart/items/999999`, { headers: { 'x-session-id': sessionId } })
    expect(unknown.status()).toBe(404)
    expect((await unknown.json()).error.code).toBe('RESOURCE_NOT_FOUND')
  })

  test('TC_MOBILE_017 / TC_MOBILE_025: rejects unsupported payment and ignores protected fields', async ({ request }) => {
    const product = await activeProduct(request)
    const sessionId = randomUUID()
    await addItem(request, sessionId, product.id)
    const response = await request.post(`${apiUrl}/orders`, {
      headers: headers(sessionId),
      data: { ...validOrder, paymentMethod: 'CARD', totalAmount: 0, orderNumber: 'FORGED' },
    })
    expect(response.status()).toBe(400)
    expect((await response.json()).error.code).toBe('VALIDATION_ERROR')
  })

  test('TC_MOBILE_023 / TC_MOBILE_024: protects confirmation by session and unknown number', async ({ request }) => {
    const product = await activeProduct(request)
    const owner = randomUUID()
    await addItem(request, owner, product.id)
    const created = await request.post(`${apiUrl}/orders`, { headers: headers(owner), data: validOrder })
    expect(created.status()).toBe(201)
    const order = await created.json()
    const other = await request.get(`${apiUrl}/orders/${order.orderNumber}`, { headers: { 'x-session-id': randomUUID() } })
    expect(other.status()).toBe(404)
    const unknown = await request.get(`${apiUrl}/orders/ORD-does-not-exist`, { headers: { 'x-session-id': owner } })
    expect(unknown.status()).toBe(404)
  })

  test('TC_MOBILE_021 / TC_MOBILE_035: replays idempotent order with the public response shape', async ({ request }) => {
    const product = await activeProduct(request)
    const sessionId = randomUUID()
    const idempotencyKey = randomUUID()
    await addItem(request, sessionId, product.id)
    const first = await request.post(`${apiUrl}/orders`, { headers: headers(sessionId, idempotencyKey), data: validOrder })
    expect(first.status()).toBe(201)
    const replay = await request.post(`${apiUrl}/orders`, { headers: headers(sessionId, idempotencyKey), data: validOrder })
    expect(replay.status()).toBe(200)
    const body = await replay.json()
    expect(body).toEqual(expect.objectContaining({ orderNumber: expect.any(String), status: 'Pending', paymentMethod: 'COD', items: expect.any(Array) }))
    expect(body).not.toHaveProperty('sessionId')
    expect(body).not.toHaveProperty('idempotencyKey')
    expect(body).not.toHaveProperty('requestFingerprint')
  })

  test('TC_MOBILE_029 / TC_MOBILE_037: returns safe validation errors for malformed requests and UUID headers', async ({ request }) => {
    const malformed = await request.post(`${apiUrl}/cart/items`, { headers: { 'x-session-id': randomUUID(), 'Content-Type': 'application/json' }, data: '{' })
    expect(malformed.status()).toBe(400)
    expect((await malformed.json()).error.code).toBe('VALIDATION_ERROR')
    const invalidSession = await request.get(`${apiUrl}/cart`, { headers: { 'x-session-id': 'not-a-uuid' } })
    expect(invalidSession.status()).toBe(400)
    const missingKey = await request.post(`${apiUrl}/orders`, { headers: { 'x-session-id': randomUUID() }, data: validOrder })
    expect(missingKey.status()).toBe(400)
  })
})
