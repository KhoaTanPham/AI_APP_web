import { test, expect } from '@playwright/test'
import { ShopPage } from '../pages/ShopPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'

test('TC_MOBILE_001 / TC_MOBILE_007: shopper can add a phone and reach checkout', async ({ page }) => {
  const shop = new ShopPage(page)
  const cart = new CartPage(page)
  const checkout = new CheckoutPage(page)
  await shop.goto()

  await expect(page.getByRole('heading', { name: 'Find your' })).toBeVisible()
  await expect(shop.productCards.first()).toBeVisible()
  const availableProduct = page.locator('.product-card').filter({ has: page.locator('button.add-button:not([disabled])') }).first()
  const productName = await availableProduct.getByRole('heading', { level: 3 }).innerText()
  await shop.addProduct(productName)

  await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Checkout/ })).toBeVisible()
  await cart.checkout()

  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible()
  await expect(checkout.requiredMarks).toHaveCount(4)
  await expect(checkout.field('Full name')).toHaveAttribute('required', '')
  await expect(checkout.field('Phone number')).toHaveAttribute('required', '')
  await expect(checkout.field('Shipping address')).toHaveAttribute('required', '')
  await expect(checkout.field('City')).toHaveAttribute('required', '')
})

test('TC_MOBILE_002 / TC_MOBILE_003: shopper can search by product name and see an empty state for no match', async ({ page }) => {
  const shop = new ShopPage(page)
  await shop.goto()

  await expect(shop.productCards).toHaveCount(5)
  await shop.searchFor('  iphone ')
  await expect(shop.productCards).toHaveCount(1)
  await expect(shop.productCards.first()).toContainText('iPhone 16')

  await shop.searchFor('not-a-phone')
  await expect(page.getByText('No phones match that search.')).toBeVisible()
  await expect(shop.productCards).toHaveCount(0)
})

test('TC_MOBILE_012: shopper can open an empty cart and continue shopping', async ({ page }) => {
  const shop = new ShopPage(page)
  await shop.goto()
  await shop.openCart()

  await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible()
  await expect(page.getByText('Your cart is waiting for something good.')).toBeVisible()
  await expect(page.getByRole('button', { name: /Checkout/ })).toHaveCount(0)
  await page.getByRole('button', { name: /Browse phones/ }).click()
  await expect(shop.productCards.first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Cart/ })).toBeVisible()
})

test('TC_MOBILE_027: shopping layout remains usable on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const shop = new ShopPage(page)
  await shop.goto()

  await expect(shop.productCards.first()).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})