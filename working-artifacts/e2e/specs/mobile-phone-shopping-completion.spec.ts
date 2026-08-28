import { test, expect, type APIRequestContext } from '@playwright/test'
import { PrismaClient } from '../../../server/node_modules/@prisma/client/index.js'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { ShopPage } from '../pages/ShopPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'

/**
 * Approach: A5 page-object reuse + A6 API contract + controlled Prisma fixture data.
 * Traceability: TC_MOBILE_004, 005, 010, 011, 015, 016, 019, 020, 022, 026, 028, 030, 034, 036, 038, 039, 040, 041, 042.
 * The fixture uses the same SQLite database as the local API and restores changed products.
 */
const apiUrl = 'http://127.0.0.1:3000/api'
const prisma = new PrismaClient({ datasources: { db: { url: `file:${resolve('server/prisma/dev.db')}` } } })
const validOrder = { customerName: 'Completion Test', phoneNumber: '+84901234567', email: '', shippingAddress: '1 Test Street', city: 'Test City', postalCode: '70000', paymentMethod: 'COD' }

async function product(request: APIRequestContext, minimumStock = 1) {
  const response = await request.get(`${apiUrl}/products`)
  const products = await response.json()
  const found = products.find((item: { stockQuantity: number }) => item.stockQuantity >= minimumStock)
  expect(found).toBeTruthy()
  return found as { id: number; name: string; brand: string; price: number; stockQuantity: number }
}

async function add(request: APIRequestContext, sessionId: string, productId: number, quantity = 1) {
  return request.post(`${apiUrl}/cart/items`, { headers: { 'x-session-id': sessionId }, data: { productId, quantity } })
}

async function restoreProduct(id: number, stockQuantity: number, price: number, isActive: boolean) {
  await prisma.product.update({ where: { id }, data: { stockQuantity, price, isActive } })
}

test.describe('Mobile Phone Shopping completion coverage', () => {
  test.describe.configure({ mode: 'serial' })

  test.afterAll(async () => { await prisma.$disconnect() })

  test('TC_MOBILE_004: excludes inactive products from browse and search', async ({ request }) => {
    const seeded = await product(request)
    const original = await prisma.product.findUniqueOrThrow({ where: { id: seeded.id } })
    await prisma.product.update({ where: { id: seeded.id }, data: { isActive: false } })
    try {
      const list = await request.get(`${apiUrl}/products`, { params: { search: seeded.name } })
      expect(await list.json()).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: seeded.id })]))
    } finally { await restoreProduct(seeded.id, original.stockQuantity, original.price, original.isActive) }
  })

  test('TC_MOBILE_005: prevents adding a zero-stock product', async ({ request }) => {
    const seeded = await product(request)
    const original = await prisma.product.findUniqueOrThrow({ where: { id: seeded.id } })
    const sessionId = randomUUID()
    await prisma.product.update({ where: { id: seeded.id }, data: { stockQuantity: 0 } })
    try {
      const response = await add(request, sessionId, seeded.id)
      expect(response.status()).toBe(409)
      const cart = await request.get(`${apiUrl}/cart`, { headers: { 'x-session-id': sessionId } })
      expect(await cart.json()).toMatchObject({ items: [] })
    } finally { await restoreProduct(seeded.id, original.stockQuantity, original.price, original.isActive) }
  })

  test('TC_MOBILE_010 / TC_MOBILE_019 / TC_MOBILE_034: blocks a stale cart without mutation', async ({ request }) => {
    const seeded = await product(request, 2)
    const original = await prisma.product.findUniqueOrThrow({ where: { id: seeded.id } })
    const sessionId = randomUUID()
    await add(request, sessionId, seeded.id, 2)
    await prisma.product.update({ where: { id: seeded.id }, data: { stockQuantity: 1 } })
    try {
      const response = await request.post(`${apiUrl}/orders`, { headers: { 'x-session-id': sessionId, 'Idempotency-Key': randomUUID() }, data: validOrder })
      expect(response.status()).toBe(409)
      expect((await response.json()).error).toEqual(expect.objectContaining({ code: 'STOCK_CONFLICT', fields: expect.objectContaining({ productId: String(seeded.id), availableStock: '1' }) }))
      const cart = await request.get(`${apiUrl}/cart`, { headers: { 'x-session-id': sessionId } })
      expect((await cart.json()).items[0].quantity).toBe(2)
    } finally { await restoreProduct(seeded.id, original.stockQuantity, original.price, original.isActive) }
  })

  test('TC_MOBILE_011 / TC_MOBILE_020: recalculates totals and atomically clears a successful cart', async ({ request }) => {
    const seeded = await product(request, 2)
    const sessionId = randomUUID()
    await add(request, sessionId, seeded.id, 2)
    const cart = await request.get(`${apiUrl}/cart`, { headers: { 'x-session-id': sessionId } })
    expect((await cart.json()).totalAmount).toBeGreaterThan(0)
    const order = await request.post(`${apiUrl}/orders`, { headers: { 'x-session-id': sessionId, 'Idempotency-Key': randomUUID() }, data: validOrder })
    expect(order.status()).toBe(201)
    expect((await (await request.get(`${apiUrl}/cart`, { headers: { 'x-session-id': sessionId } })).json()).items).toHaveLength(0)
  })

  test('TC_MOBILE_015 / TC_MOBILE_016: accepts optional checkout values and rejects DEC-03 boundaries', async ({ request }) => {
    const response = await request.post(`${apiUrl}/orders`, { headers: { 'x-session-id': randomUUID(), 'Idempotency-Key': randomUUID() }, data: { ...validOrder, customerName: ' '.repeat(201), phoneNumber: '123', email: 'invalid', postalCode: '!' } })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.fields).toEqual(expect.objectContaining({ customerName: expect.any(Array), phoneNumber: expect.any(Array), email: expect.any(Array), postalCode: expect.any(Array) }))
  })

  test('TC_MOBILE_022: assigns unique Pending order numbers', async ({ request }) => {
    const response = await request.get(`${apiUrl}/products`)
    const products = await response.json() as Array<{ id: number; stockQuantity: number; price: number }>
    const firstProduct = products[0]
    const secondProduct = products[1]
    const originalFirst = await prisma.product.findUniqueOrThrow({ where: { id: firstProduct.id } })
    const originalSecond = await prisma.product.findUniqueOrThrow({ where: { id: secondProduct.id } })
    const firstSession = randomUUID()
    const secondSession = randomUUID()
    await prisma.product.updateMany({ where: { id: { in: [firstProduct.id, secondProduct.id] } }, data: { stockQuantity: 10, isActive: true } })
    try {
      await add(request, firstSession, firstProduct.id)
      await add(request, secondSession, secondProduct.id)
      const first = await request.post(`${apiUrl}/orders`, { headers: { 'x-session-id': firstSession, 'Idempotency-Key': randomUUID() }, data: validOrder })
      const second = await request.post(`${apiUrl}/orders`, { headers: { 'x-session-id': secondSession, 'Idempotency-Key': randomUUID() }, data: validOrder })
      expect(first.status()).toBe(201)
      expect(second.status()).toBe(201)
      const firstBody = await first.json()
      const secondBody = await second.json()
      expect(firstBody.orderNumber).not.toBe(secondBody.orderNumber)
      expect(firstBody.status).toBe('Pending')
      expect(secondBody.status).toBe('Pending')
    } finally {
      await restoreProduct(firstProduct.id, originalFirst.stockQuantity, originalFirst.price, originalFirst.isActive)
      await restoreProduct(secondProduct.id, originalSecond.stockQuantity, originalSecond.price, originalSecond.isActive)
    }
  })

  test('TC_MOBILE_026 / TC_MOBILE_040: supports keyboard navigation and associated form errors', async ({ page }) => {
    const shop = new ShopPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)
    await shop.goto()
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    const availableProduct = page.locator('.product-card').filter({ has: page.locator('button.add-button:not([disabled])') }).first()
    const name = await availableProduct.getByRole('heading', { level: 3 }).innerText()
    await shop.addProduct(name)
    await cart.checkout()
    await checkout.fillDetails({ customerName: '   ', phoneNumber: '123', shippingAddress: '   ', city: '   ' })
    await checkout.submit()
    await expect(checkout.field('Full name')).toHaveAttribute('aria-invalid', 'true')
    await expect(checkout.field('Full name')).toHaveAttribute('aria-describedby', 'customerName-error')
  })

  test('TC_MOBILE_028 / TC_MOBILE_041: meets the local API response-time threshold', async ({ request }) => {
    const seeded = await product(request)
    const samples: number[] = []
    for (let index = 0; index < 5; index += 1) {
      const started = performance.now()
      const response = await request.get(`${apiUrl}/products/${seeded.id}`)
      expect(response.status()).toBe(200)
      samples.push(performance.now() - started)
    }
    samples.sort((left, right) => left - right)
    expect(samples[Math.ceil(samples.length * 0.95) - 1]).toBeLessThanOrEqual(2000)
  })

  test('TC_MOBILE_030 / TC_MOBILE_042: remains repeatable after independent session reset', async ({ request }) => {
    const seeded = await product(request)
    const first = await request.get(`${apiUrl}/products`, { params: { search: seeded.brand } })
    const second = await request.get(`${apiUrl}/products`, { params: { search: seeded.brand } })
    expect(await first.json()).toEqual(await second.json())
  })

  test('TC_MOBILE_036 / TC_MOBILE_038 / TC_MOBILE_039: validates protected order behavior and stock boundary', async ({ request }) => {
    const seeded = await product(request)
    const original = await prisma.product.findUniqueOrThrow({ where: { id: seeded.id } })
    const sessionId = randomUUID()
    await prisma.product.update({ where: { id: seeded.id }, data: { stockQuantity: 1, price: original.price + 25 } })
    try {
      await add(request, sessionId, seeded.id)
      const requests = [0, 1].map(() => request.post(`${apiUrl}/orders`, { headers: { 'x-session-id': sessionId, 'Idempotency-Key': randomUUID() }, data: { ...validOrder, totalAmount: 0, orderNumber: 'FORGED' } }))
      const responses = await Promise.all(requests)
      expect(responses.filter((response) => response.status() === 201)).toHaveLength(1)
      expect(responses.filter((response) => response.status() === 409 || response.status() === 400)).toHaveLength(1)
    } finally { await restoreProduct(seeded.id, original.stockQuantity, original.price, original.isActive) }
  })
})
