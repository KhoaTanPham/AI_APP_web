import type { PrismaClient } from '@prisma/client'
import type { z } from 'zod'
import { CartRepository } from '../repositories/cart.repository.js'
import { cartItemSchema } from '../validators/schemas.js'

export class CartService {
  private readonly carts: CartRepository

  constructor(private readonly prisma: PrismaClient) {
    this.carts = new CartRepository(prisma)
  }

  getCart(sessionId: string) {
    return this.carts.getOrCreate(sessionId).then((cart) => ({
      ...cart,
      items: cart.items.map((item) => ({
        ...item,
        subtotal: item.unitPrice * item.quantity,
      })),
      totalAmount: cart.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    }))
  }

  async addItem(sessionId: string, input: z.infer<typeof cartItemSchema>) {
    const product = await this.prisma.product.findUnique({ where: { id: input.productId } })
    if (!product || !product.isActive || product.stockQuantity < input.quantity) return { conflict: 'Product is unavailable' as const }

    const cart = await this.carts.getOrCreate(sessionId)
    const existing = cart.items.find((item) => item.productId === input.productId)
    const quantity = (existing?.quantity || 0) + input.quantity
    if (quantity > product.stockQuantity) return { conflict: 'Requested quantity exceeds stock' as const }

    const item = existing
      ? await this.prisma.cartItem.update({ where: { id: existing.id }, data: { quantity }, include: { product: true } })
      : await this.prisma.cartItem.create({ data: { cartId: cart.id, productId: input.productId, quantity, unitPrice: product.price }, include: { product: true } })
    return { item }
  }

  async updateItem(sessionId: string, id: number, quantity: number) {
    const item = await this.carts.findItemForSession(id, sessionId)
    if (!item) return 'NOT_FOUND' as const
    if (!item.product.isActive || quantity > item.product.stockQuantity) return 'STOCK_CONFLICT' as const
    return this.carts.updateQuantity(item.id, quantity)
  }

  async deleteItem(sessionId: string, id: number) {
    const item = await this.carts.findItemForSession(id, sessionId)
    if (!item) return false
    await this.carts.deleteItem(item.id)
    return true
  }
}
