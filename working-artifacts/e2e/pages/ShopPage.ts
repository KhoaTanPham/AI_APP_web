import type { Locator, Page } from '@playwright/test'

export class ShopPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly productCards: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByRole('textbox', { name: 'Search products' })
    this.productCards = page.locator('.product-card')
  }

  async goto() {
    await this.page.goto('/')
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query)
  }

  product(name: string) {
    return this.page.locator('.product-card').filter({ hasText: name })
  }

  async openProduct(name: string) {
    await this.product(name).getByRole('button', { name: name }).click()
  }

  async addProduct(name: string) {
    await this.product(name).getByRole('button', { name: `Add ${name} to cart` }).click()
  }

  async openCart() {
    await this.page.getByRole('button', { name: /Cart/ }).click()
  }
}