import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

export const errorHandler = (error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) return response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', fields: error.flatten().fieldErrors } })
  if (error instanceof SyntaxError && 'body' in error) return response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON request' } })
  console.error(error)
  return response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } })
}
