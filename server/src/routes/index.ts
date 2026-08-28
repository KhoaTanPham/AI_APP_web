import type { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { CartController } from '../controllers/cart.controller.js'
import { OrderController } from '../controllers/order.controller.js'
import { ProductController } from '../controllers/product.controller.js'

export const registerRoutes = (prisma: PrismaClient) => {
  const router = Router()
  const products = new ProductController(prisma)
  const carts = new CartController(prisma)
  const orders = new OrderController(prisma)

  router.get('/products', products.list)
  router.get('/products/:id', products.get)
  router.get('/cart', carts.get)
  router.post('/cart/items', carts.addItem)
  router.put('/cart/items/:id', carts.updateItem)
  router.delete('/cart/items/:id', carts.deleteItem)
  router.post('/orders', orders.create)
  router.get('/orders/:orderNumber', orders.get)
  return router
}
