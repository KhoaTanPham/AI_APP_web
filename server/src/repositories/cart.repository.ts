import type { PrismaClient } from '@prisma/client'

const cartInclude = { items: { include: { product: true } } } as const

export class CartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  getOrCreate(sessionId: string) {
    return this.prisma.cart.upsert({ where: { sessionId }, create: { sessionId }, update: {}, include: cartInclude })
  }

  findItemForSession(id: number, sessionId: string) {
    return this.prisma.cartItem.findFirst({ where: { id, cart: { sessionId } }, include: { product: true } })
  }

  updateQuantity(id: number, quantity: number) {
    return this.prisma.cartItem.update({ where: { id }, data: { quantity } })
  }

  deleteItem(id: number) {
    return this.prisma.cartItem.delete({ where: { id } })
  }
}
