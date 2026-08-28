import type { Locator, Page } from '@playwright/test'

export class CartPage {
  readonly page: Page
  readonly items: Locator

  constructor(page: Page) {
    this.page = page
    this.items = page.locator('.cart-item')
  }

  item(name: string) {
    return this.items.filter({ hasText: name })
  }

  async increase(name: string) {
    await this.item(name).getByRole('button', { name: '+' }).click()
  }

  async decrease(name: string) {
    await this.item(name).getByRole('button', { name: '−' }).click()
  }

  async remove(name: string) {
    await this.item(name).getByRole('button', { name: 'Remove' }).click()
  }

  async checkout() {
    await this.page.getByRole('button', { name: /Checkout/ }).click()
  }

  async continueShopping() {
    await this.page.getByRole('button', { name: /Continue shopping/ }).click()
  }
}