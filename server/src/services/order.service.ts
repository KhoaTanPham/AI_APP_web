import { createHash } from 'node:crypto'
import { randomUUID } from 'node:crypto'
import type { PrismaClient } from '@prisma/client'
import type { OrderResponse } from '@mobilemarket/shared'
import type { OrderInput } from '../validators/schemas.js'
import { CartRepository } from '../repositories/cart.repository.js'
import { OrderRepository } from '../repositories/order.repository.js'

const fingerprintOrder = (data: OrderInput, items: Array<{ productId: number; quantity: number; unitPrice: number }>) => createHash('sha256')
  .update(JSON.stringify({ data, items: items.map(({ productId, quantity, unitPrice }) => ({ productId, quantity, unitPrice })) }))
  .digest('hex')

class OrderConflictError extends Error {
  constructor(public readonly code: 'STOCK_CONFLICT', public readonly fields: Record<string, string>) {
    super(code)
  }
}

const toOrderResponse = (order: { orderNumber: string; customerName: string; shippingAddress: string; city: string; postalCode: string | null; paymentMethod: string; status: string; totalAmount: number; items: Array<{ id: number; productId: number; productName: string; unitPrice: number; quantity: number; subtotal: number }> }): OrderResponse => ({
  orderNumber: order.orderNumber,
  customerName: order.customerName,
  shippingAddress: order.shippingAddress,
  city: order.city,
  postalCode: order.postalCode,
  paymentMethod: 'COD',
  status: 'Pending',
  totalAmount: order.totalAmount,
  items: order.items.map((item) => ({ ...item })),
})

export class OrderService {
  private readonly carts: CartRepository
  private readonly orders: OrderRepository

  constructor(private readonly prisma: PrismaClient) {
    this.carts = new CartRepository(prisma)
    this.orders = new OrderRepository(prisma)
  }

  async create(sessionId: string, idempotencyKey: string, data: OrderInput) {
    const cart = await this.carts.getOrCreate(sessionId)
    const previousOrder = await this.orders.findByIdempotency(sessionId, idempotencyKey)
    if (previousOrder) {
      const previousFingerprint = fingerprintOrder(data, previousOrder.items)
    return previousOrder.requestFingerprint !== previousFingerprint ? { conflict: 'IDEMPOTENCY_CONFLICT' as const } : { replay: toOrderResponse(previousOrder) }
    }
    if (!cart.items.length) return { conflict: 'CART_EMPTY' as const }

    const requestFingerprint = fingerprintOrder(data, cart.items)
    const order = await this.prisma.$transaction(async (transaction) => {
      const previous = await transaction.order.findUnique({ where: { sessionId_idempotencyKey: { sessionId, idempotencyKey } }, include: { items: true } })
      if (previous) {
        if (previous.requestFingerprint !== requestFingerprint) throw new Error('IDEMPOTENCY_CONFLICT')
        return previous
      }
      const currentProducts = new Map<number, Awaited<ReturnType<typeof transaction.product.findUnique>>>()
      for (const item of cart.items) {
        const current = await transaction.product.findUnique({ where: { id: item.productId } })
        if (!current || !current.isActive || current.stockQuantity < item.quantity) {
          throw new OrderConflictError('STOCK_CONFLICT', { productId: String(item.productId), productName: item.product.name, availableStock: String(current?.stockQuantity || 0) })
        }
        currentProducts.set(item.productId, current)
      }
      const total = cart.items.reduce((sum, item) => sum + (currentProducts.get(item.productId)?.price || 0) * item.quantity, 0)
      const created = await transaction.order.create({
        data: { ...data, email: data.email || null, sessionId, idempotencyKey, requestFingerprint, paymentMethod: 'COD', orderNumber: `ORD-${randomUUID()}`, totalAmount: total, items: { create: cart.items.map((item) => ({ productId: item.productId, productName: item.product.name, unitPrice: currentProducts.get(item.productId)?.price || 0, quantity: item.quantity, subtotal: (currentProducts.get(item.productId)?.price || 0) * item.quantity })) } },
        include: { items: true },
      })
      for (const item of cart.items) {
        const updated = await transaction.product.updateMany({ where: { id: item.productId, stockQuantity: { gte: item.quantity } }, data: { stockQuantity: { decrement: item.quantity } } })
        if (updated.count !== 1) throw new OrderConflictError('STOCK_CONFLICT', { productId: String(item.productId), productName: item.product.name, availableStock: '0' })
      }
      await transaction.cartItem.deleteMany({ where: { cartId: cart.id } })
      return created
    })
    return { created: toOrderResponse(order) }
  }

  findByNumber(orderNumber: string, sessionId: string) {
    return this.orders.findByNumberForSession(orderNumber, sessionId).then((order) => order ? toOrderResponse(order) : null)
  }
}
