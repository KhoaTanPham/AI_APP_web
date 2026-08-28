import type { Request, Response } from 'express'
import { uuidHeaderSchema } from '../validators/schemas.js'

const getHeader = (request: Request, name: string) => request.header(name) || undefined

export const getSessionId = (request: Request): string | undefined => {
  const value = getHeader(request, 'x-session-id')
  return value && uuidHeaderSchema.safeParse(value).success ? value : undefined
}

export const hasSessionHeader = (request: Request) => Boolean(getHeader(request, 'x-session-id'))

export const requireSessionId = (request: Request, response: Response): string | undefined => {
  const sessionId = getSessionId(request)
  if (!sessionId) {
    response.status(400).json({ error: { code: hasSessionHeader(request) ? 'VALIDATION_ERROR' : 'SESSION_REQUIRED', message: hasSessionHeader(request) ? 'x-session-id must be a valid UUID' : 'x-session-id is required' } })
  }
  return sessionId
}

export const getIdempotencyKey = (request: Request): string | undefined => {
  const value = getHeader(request, 'Idempotency-Key')
  return value && uuidHeaderSchema.safeParse(value).success ? value : undefined
}

export const hasIdempotencyHeader = (request: Request) => Boolean(getHeader(request, 'Idempotency-Key'))
