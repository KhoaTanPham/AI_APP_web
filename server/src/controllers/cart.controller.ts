import type { PrismaClient } from '@prisma/client'
import type { Request, Response } from 'express'
import { requireSessionId } from '../middleware/session.js'
import { CartService } from '../services/cart.service.js'
import { cartItemSchema, cartQuantitySchema, idSchema } from '../validators/schemas.js'

export class CartController {
  private readonly carts: CartService

  constructor(prisma: PrismaClient) {
    this.carts = new CartService(prisma)
  }

  get = async (request: Request, response: Response) => {
    const sessionId = requireSessionId(request, response)
    if (!sessionId) return
    response.json(await this.carts.getCart(sessionId))
  }

  addItem = async (request: Request, response: Response) => {
    const sessionId = requireSessionId(request, response)
    if (!sessionId) return
    const result = await this.carts.addItem(sessionId, cartItemSchema.parse(request.body))
    if (result.conflict) return response.status(409).json({ error: { code: 'STOCK_CONFLICT', message: result.conflict } })
    response.status(201).json(result.item)
  }

  updateItem = async (request: Request, response: Response) => {
    const sessionId = requireSessionId(request, response)
    if (!sessionId) return
    const body = cartQuantitySchema.parse(request.body)
    const item = await this.carts.updateItem(sessionId, idSchema.parse(request.params.id), body.quantity)
    if (item === 'NOT_FOUND') return response.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'Cart item not found' } })
    if (item === 'STOCK_CONFLICT') return response.status(409).json({ error: { code: 'STOCK_CONFLICT', message: 'Quantity exceeds stock' } })
    response.json(item)
  }

  deleteItem = async (request: Request, response: Response) => {
    const sessionId = requireSessionId(request, response)
    if (!sessionId) return
    const deleted = await this.carts.deleteItem(sessionId, idSchema.parse(request.params.id))
    if (!deleted) return response.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'Cart item not found' } })
    response.status(204).end()
  }
}
