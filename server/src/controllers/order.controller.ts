import type { PrismaClient } from '@prisma/client'
import type { Request, Response } from 'express'
import { getIdempotencyKey, getSessionId, hasIdempotencyHeader, requireSessionId } from '../middleware/session.js'
import { OrderService } from '../services/order.service.js'
import { orderSchema } from '../validators/schemas.js'

export class OrderController {
  private readonly orders: OrderService

  constructor(prisma: PrismaClient) {
    this.orders = new OrderService(prisma)
  }

  create = async (request: Request, response: Response) => {
    const data = orderSchema.parse(request.body)
    const sessionId = getSessionId(request)
    const idempotencyKey = getIdempotencyKey(request)
    if (!sessionId) return response.status(400).json({ error: { code: 'SESSION_REQUIRED', message: 'x-session-id is required' } })
    if (!idempotencyKey) return response.status(400).json({ error: { code: hasIdempotencyHeader(request) ? 'VALIDATION_ERROR' : 'IDEMPOTENCY_KEY_REQUIRED', message: hasIdempotencyHeader(request) ? 'Idempotency-Key must be a valid UUID' : 'Idempotency-Key is required' } })

    try {
      const result = await this.orders.create(sessionId, idempotencyKey, data)
      if (result.conflict === 'IDEMPOTENCY_CONFLICT') return response.status(409).json({ error: { code: result.conflict, message: 'Idempotency key was reused with a different request' } })
      if (result.conflict === 'CART_EMPTY') return response.status(400).json({ error: { code: result.conflict, message: 'Cart is empty' } })
      if (result.replay) return response.status(200).json(result.replay)
      response.status(201).json(result.created)
    } catch (error) {
      const code = error instanceof Error ? error.message : 'ORDER_CREATE_FAILED'
      if (code === 'STOCK_CONFLICT') {
        const fields = error && typeof error === 'object' && 'fields' in error ? error.fields : undefined
        return response.status(409).json({ error: { code, message: 'Inventory changed. Adjust the affected item before placing the order.', ...(fields ? { fields } : {}) } })
      }
      response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } })
    }
  }

  get = async (request: Request, response: Response) => {
    const sessionId = requireSessionId(request, response)
    if (!sessionId) return
    const order = await this.orders.findByNumber(String(request.params.orderNumber), sessionId)
    order ? response.json(order) : response.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'Order not found' } })
  }
}
