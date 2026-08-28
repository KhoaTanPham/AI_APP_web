import type { Locator, Page } from '@playwright/test'

export class ConfirmationPage {
  readonly page: Page
  readonly orderNumber: Locator

  constructor(page: Page) {
    this.page = page
    this.orderNumber = page.locator('.order-number strong')
  }

  async continueShopping() {
    await this.page.getByRole('button', { name: /Continue shopping/ }).click()
  }
}