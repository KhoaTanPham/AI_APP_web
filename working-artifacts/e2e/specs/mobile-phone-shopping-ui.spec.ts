import { test, expect } from '@playwright/test'
import { ShopPage } from '../pages/ShopPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { ConfirmationPage } from '../pages/ConfirmationPage'

/**
 * Approach: A5 existing page-object reuse + A2 frontend source analysis.
 * Traceability: TC_MOBILE_001, 005, 006, 013, 014, 018, 027, 031.
 * Locator evidence: existing semantic labels/roles and stable product-card/cart-item classes.
 * Risk: seeded inventory is shared by the local E2E server; cases use fresh browser sessions.
 */
test.describe('Mobile Phone Shopping UI', () => {
  test('TC_MOBILE_006: opens product detail with quantity and availability controls', async ({ page }) => {
    const shop = new ShopPage(page)
    await shop.goto()
    const product = page.locator('.product-card').filter({ has: page.locator('button.add-button:not([disabled])') }).first()
    const productName = await product.getByRole('heading', { level: 3 }).innerText()
    await product.locator('button.product-image').click()

    await expect(page.getByRole('heading', { name: productName })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Increase quantity' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Add to cart/ })).toBeEnabled()
  })

  test('TC_MOBILE_013 / TC_MOBILE_018: completes guest COD checkout and displays confirmation', async ({ page }) => {
    const shop = new ShopPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)
    const confirmation = new ConfirmationPage(page)
    await shop.goto()
    const availableProduct = page.locator('.product-card').filter({ has: page.locator('button.add-button:not([disabled])') }).first()
    const productName = await availableProduct.getByRole('heading', { level: 3 }).innerText()
    await shop.addProduct(productName)
    await cart.checkout()
    await checkout.fillDetails({
      customerName: 'UI Test Shopper',
      phoneNumber: '+84901234567',
      shippingAddress: '1 Test Street',
      city: 'Test City',
      postalCode: '70000',
      email: 'ui@example.com',
    })
    await expect(page.getByText('Cash on Delivery')).toBeVisible()
    await checkout.submit()

    await expect(page.getByRole('heading', { name: /Thank you, UI/ })).toBeVisible()
    await expect(confirmation.orderNumber).toHaveText(/^ORD-/)
    await expect(page.getByText('Pending')).toBeVisible()
  })

  test('TC_MOBILE_014: shows field-level errors for invalid checkout data', async ({ page }) => {
    const shop = new ShopPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)
    await shop.goto()
    const availableProduct = page.locator('.product-card').filter({ has: page.locator('button.add-button:not([disabled])') }).first()
    const productName = await availableProduct.getByRole('heading', { level: 3 }).innerText()
    await shop.addProduct(productName)
    await cart.checkout()
    await checkout.fillDetails({ customerName: '   ', phoneNumber: '123', shippingAddress: '   ', city: '   ' })
    await checkout.submit()

    await expect(page.getByRole('alert')).toHaveCount(4)
    await expect(checkout.field('Full name')).toHaveAttribute('aria-invalid', 'true')
    await expect(checkout.field('Phone number')).toHaveAttribute('aria-invalid', 'true')
    await expect(checkout.field('Shipping address')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible()
  })

  test('TC_MOBILE_031: unknown product detail URL shows no purchase controls', async ({ page }) => {
    await page.goto('/products/999999')
    await expect(page.getByRole('heading', { name: 'Product not found' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Add to cart/ })).toHaveCount(0)
  })
})
