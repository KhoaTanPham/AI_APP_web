import type { PrismaClient } from '@prisma/client'

export class OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByIdempotency(sessionId: string, idempotencyKey: string) {
    return this.prisma.order.findUnique({ where: { sessionId_idempotencyKey: { sessionId, idempotencyKey } }, include: { items: true } })
  }

  findByNumberForSession(orderNumber: string, sessionId: string) {
    return this.prisma.order.findFirst({ where: { orderNumber, sessionId }, include: { items: true } })
  }
}
