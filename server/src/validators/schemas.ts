import { z } from 'zod'

export const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
})

export const cartQuantitySchema = z.object({ quantity: z.number().int().min(1) })

const trimmedRequiredText = z.string().trim().min(1).max(200)
const phoneSchema = z.string().trim().regex(/^\+?[0-9 ()-]{7,24}$/).refine((value) => value.replace(/\D/g, '').length >= 7 && value.replace(/\D/g, '').length <= 20)
const postalCodeSchema = z.string().trim().regex(/^[a-zA-Z0-9][a-zA-Z0-9 -]{2,19}$/)

export const orderSchema = z.object({
  customerName: trimmedRequiredText,
  phoneNumber: phoneSchema,
  email: z.string().trim().max(254).email().optional().or(z.literal('')),
  shippingAddress: trimmedRequiredText,
  city: trimmedRequiredText,
  postalCode: postalCodeSchema.optional().or(z.literal('')),
  paymentMethod: z.literal('COD'),
})

export const idSchema = z.coerce.number().int().positive()
export const uuidHeaderSchema = z.string().uuid()

export type OrderInput = z.infer<typeof orderSchema>
