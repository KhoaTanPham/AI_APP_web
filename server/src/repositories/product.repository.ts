import type { PrismaClient } from '@prisma/client'

export class ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findActive(search: string) {
    const normalizedSearch = search.trim().toLocaleLowerCase()
    return this.prisma.product.findMany({ where: { isActive: true } }).then((products) => normalizedSearch
      ? products.filter((product) => product.name.toLocaleLowerCase().includes(normalizedSearch) || product.brand.toLocaleLowerCase().includes(normalizedSearch))
      : products)
  }

  findById(id: number) {
    return this.prisma.product.findFirst({ where: { id, isActive: true } })
  }
}
