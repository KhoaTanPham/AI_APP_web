import type { Locator, Page } from '@playwright/test'

export type CheckoutDetails = {
  customerName: string
  phoneNumber: string
  shippingAddress: string
  city: string
  postalCode?: string
  email?: string
}

export class CheckoutPage {
  readonly page: Page
  readonly requiredMarks: Locator
  readonly placeOrderButton: Locator

  constructor(page: Page) {
    this.page = page
    this.requiredMarks = page.locator('.required-mark')
    this.placeOrderButton = page.getByRole('button', { name: /Place order/ })
  }

  field(label: string) {
    return this.page.getByLabel(new RegExp(`^${label}`))
  }

  async fillDetails(details: CheckoutDetails) {
    await this.field('Full name').fill(details.customerName)
    await this.field('Phone number').fill(details.phoneNumber)
    await this.field('Shipping address').fill(details.shippingAddress)
    await this.field('City').fill(details.city)
    if (details.postalCode !== undefined) await this.field('Postal code').fill(details.postalCode)
    if (details.email !== undefined) await this.field('Email').fill(details.email)
  }

  async submit() {
    await this.placeOrderButton.click()
  }

  async backToCart() {
    await this.page.getByRole('button', { name: /Back to cart/ }).click()
  }
}