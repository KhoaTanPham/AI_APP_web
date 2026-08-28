import type { Request, Response } from 'express'
import { ProductRepository } from '../repositories/product.repository.js'
import { idSchema } from '../validators/schemas.js'

export class ProductController {
  private readonly products: ProductRepository

  constructor(prisma: ConstructorParameters<typeof ProductRepository>[0]) {
    this.products = new ProductRepository(prisma)
  }

  list = async (request: Request, response: Response) => {
    response.json(await this.products.findActive(String(request.query.search || '')))
  }

  get = async (request: Request, response: Response) => {
    const id = idSchema.parse(request.params.id)
    const product = await this.products.findById(id)
    product ? response.json(product) : response.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'Product not found' } })
  }
}
