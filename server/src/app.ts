import cors from 'cors'
import express from 'express'
import type { PrismaClient } from '@prisma/client'
import { errorHandler } from './middleware/error-handler.js'
import { registerRoutes } from './routes/index.js'

export const createApp = (prisma: PrismaClient) => {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use('/api', registerRoutes(prisma))
  app.use(errorHandler)
  return app
}
