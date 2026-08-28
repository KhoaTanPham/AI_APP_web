import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { api } from './services/api'

vi.mock('./services/api', () => ({
  api: {
    products: vi.fn(),
    cart: vi.fn(),
    addToCart: vi.fn(),
    updateCartItem: vi.fn(),
    removeCartItem: vi.fn(),
    product: vi.fn(),
    createOrder: vi.fn(),
    order: vi.fn(),
  },
}))

const product = {
  id: 1,
  name: 'Atlas Phone',
  brand: 'Northstar',
  price: 799,
  description: 'A dependable test phone.',
  stockQuantity: 4,
  imageUrl: '',
}

const emptyCart = { id: 1, items: [], totalAmount: 0 }

describe('shopping app', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.products).mockResolvedValue([product])
    vi.mocked(api.cart).mockResolvedValue(emptyCart)
    vi.mocked(api.addToCart).mockResolvedValue({})
  })

  it('renders the current product lineup after loading', async () => {
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Atlas Phone' })).toBeInTheDocument()
    expect(screen.getByText('Northstar')).toBeInTheDocument()
    expect(screen.getByText('$799')).toBeInTheDocument()
  })

  it('shows required checkout fields with red markers', async () => {
    const user = userEvent.setup()
    const cartWithItem = { ...emptyCart, items: [{ id: 1, productId: 1, product, quantity: 1, unitPrice: 799, subtotal: 799 }], totalAmount: 799 }
    vi.mocked(api.cart).mockResolvedValue(cartWithItem)

    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Add Atlas Phone to cart' }))
    await user.click(await screen.findByRole('button', { name: /Checkout/ }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument())
    expect(document.querySelectorAll('.required-mark')).toHaveLength(4)
    expect(screen.getByLabelText(/^Full name/)).toBeRequired()
    expect(screen.getByLabelText(/^Phone number/)).toBeRequired()
    expect(screen.getByLabelText(/^Shipping address/)).toBeRequired()
    expect(screen.getByLabelText(/^City/)).toBeRequired()
  })
})