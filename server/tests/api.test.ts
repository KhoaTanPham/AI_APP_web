import request from 'supertest'
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { createApp } from '../src/app.js'

const prisma = new PrismaClient({ datasources: { db: { url: 'file:./test.db' } } })
const app = createApp(prisma)
const validOrder = {
  customerName: 'Test Shopper',
  phoneNumber: '0900000000',
  email: '',
  shippingAddress: '1 Test Street',
  city: 'Test City',
  postalCode: '10000',
  paymentMethod: 'COD',
}
const testProducts = [
  { name: 'Test Phone 1', brand: 'Test Brand', price: 100, description: 'Test product', specifications: 'Test spec', stockQuantity: 10, imageUrl: '' },
  { name: 'Test Phone 2', brand: 'Test Brand', price: 200, description: 'Test product', specifications: 'Test spec', stockQuantity: 10, imageUrl: '' },
  { name: 'Test Phone 3', brand: 'Test Brand', price: 300, description: 'Test product', specifications: 'Test spec', stockQuantity: 10, imageUrl: '' },
  { name: 'Test Phone 4', brand: 'Test Brand', price: 400, description: 'Test product', specifications: 'Test spec', stockQuantity: 10, imageUrl: '' },
]
let productIds: number[] = []
const sessions = {
  first: '00000000-0000-4000-8000-000000000001',
  second: '00000000-0000-4000-8000-000000000002',
  overflow: '00000000-0000-4000-8000-000000000003',
  order: '00000000-0000-4000-8000-000000000004',
  conflict: '00000000-0000-4000-8000-000000000005',
  owner: '00000000-0000-4000-8000-000000000006',
  other: '00000000-0000-4000-8000-000000000007',
}
const keys = {
  order: '10000000-0000-4000-8000-000000000001',
  conflict: '10000000-0000-4000-8000-000000000002',
  privacy: '10000000-0000-4000-8000-000000000003',
}

beforeAll(async () => {
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON')
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.product.deleteMany()
  const created = await prisma.product.createManyAndReturn({ data: testProducts })
  productIds = created.map((product) => product.id)
})

beforeEach(async () => {
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.product.updateMany({ data: { stockQuantity: 10, isActive: true } })
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('shopping API', () => {
  it('requires a session for cart requests', async () => {
    const response = await request(app).get('/api/cart')
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: { code: 'SESSION_REQUIRED', message: 'x-session-id is required' } })
  })

  it('keeps carts isolated by session', async () => {
    await request(app).post('/api/cart/items').set('x-session-id', sessions.first).send({ productId: productIds[0], quantity: 1 }).expect(201)
    const response = await request(app).get('/api/cart').set('x-session-id', sessions.second).expect(200)
    expect(response.body.items).toHaveLength(0)
  })

  it('rejects duplicate add overflow without mutating the cart', async () => {
    await prisma.product.update({ where: { id: productIds[0] }, data: { stockQuantity: 2 } })
    await request(app).post('/api/cart/items').set('x-session-id', sessions.overflow).send({ productId: productIds[0], quantity: 2 }).expect(201)
    const response = await request(app).post('/api/cart/items').set('x-session-id', sessions.overflow).send({ productId: productIds[0], quantity: 1 }).expect(409)
    expect(response.body.error.code).toBe('STOCK_CONFLICT')
    const cart = await request(app).get('/api/cart').set('x-session-id', sessions.overflow).expect(200)
    expect(cart.body.items[0].quantity).toBe(2)
  })

  it('creates an order and replays the same idempotency key', async () => {
    const headers = { 'x-session-id': sessions.order, 'Idempotency-Key': keys.order }
    await request(app).post('/api/cart/items').set('x-session-id', headers['x-session-id']).send({ productId: productIds[1], quantity: 1 }).expect(201)
    const first = await request(app).post('/api/orders').set(headers).send(validOrder).expect(201)
    const replay = await request(app).post('/api/orders').set(headers).send(validOrder).expect(200)
    expect(replay.body.orderNumber).toBe(first.body.orderNumber)
    expect(await prisma.order.count()).toBe(1)
    expect((await prisma.product.findUnique({ where: { id: productIds[1] } }))?.stockQuantity).toBe(9)
  })

  it('rejects a different payload with the same idempotency key', async () => {
    const headers = { 'x-session-id': sessions.conflict, 'Idempotency-Key': keys.conflict }
    await request(app).post('/api/cart/items').set('x-session-id', headers['x-session-id']).send({ productId: productIds[2], quantity: 1 }).expect(201)
    await request(app).post('/api/orders').set(headers).send(validOrder).expect(201)
    const response = await request(app).post('/api/orders').set(headers).send({ ...validOrder, city: 'Different City' }).expect(409)
    expect(response.body.error.code).toBe('IDEMPOTENCY_CONFLICT')
  })

  it('does not expose an order to another session', async () => {
    const headers = { 'x-session-id': sessions.owner, 'Idempotency-Key': keys.privacy }
    await request(app).post('/api/cart/items').set('x-session-id', headers['x-session-id']).send({ productId: productIds[3], quantity: 1 }).expect(201)
    const order = await request(app).post('/api/orders').set(headers).send(validOrder).expect(201)
    const response = await request(app).get(`/api/orders/${order.body.orderNumber}`).set('x-session-id', sessions.other).expect(404)
    expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND')
  })
})
