export const PAYMENT_METHODS = ['COD'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const ORDER_STATUSES = ['Pending'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface ApiErrorBody {
  code: string
  message: string
  fields?: Record<string, string>
}

export interface ApiErrorResponse {
  error: ApiErrorBody
}

export interface ProductSummary {
  id: number
  name: string
  brand: string
  price: number
  description: string
  stockQuantity: number
  imageUrl: string
}

export interface ProductDetails extends ProductSummary {
  description: string
  specifications: string
}

export interface CartItem {
  id: number
  productId: number
  product: ProductSummary
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface CartResponse {
  id: number
  items: CartItem[]
  totalAmount: number
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface OrderResponse {
  orderNumber: string
  customerName: string
  shippingAddress: string
  city: string
  postalCode: string | null
  paymentMethod: PaymentMethod
  status: OrderStatus
  totalAmount: number
  items: OrderItem[]
}
