import { test, expect, Page } from '@playwright/test';

// Page Object Model example
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.page.locator('[data-testid="user-menu"]').isVisible();
  }
}

class CheckoutPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/checkout');
  }

  async fillShippingInfo(info: { address: string; city: string; zip: string }) {
    await this.page.fill('[name="address"]', info.address);
    await this.page.fill('[name="city"]', info.city);
    await this.page.fill('[name="zip"]', info.zip);
  }

  async fillPaymentInfo(info: { cardNumber: string; expiry: string; cvc: string }) {
    await this.page.fill('[name="cardNumber"]', info.cardNumber);
    await this.page.fill('[name="expiry"]', info.expiry);
    await this.page.fill('[name="cvc"]', info.cvc);
  }

  async submitOrder() {
    await this.page.click('button[name="submit-order"]');
    await this.page.waitForSelector('[data-testid="order-confirmation"]');
  }

  async getOrderNumber(): Promise<string> {
    return await this.page.textContent('[data-testid="order-number"]');
  }
}

// Complete E2E test
test('user can complete checkout flow', async ({ page }) => {
  // Arrange
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  // Act: Login
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(testUser.email, testUser.password);
  expect(await loginPage.isLoggedIn()).toBe(true);

  // Act: Checkout
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.goto();

  await checkoutPage.fillShippingInfo({
    address: '123 Main St',
    city: 'Seattle',
    zip: '98101'
  });

  await checkoutPage.fillPaymentInfo({
    cardNumber: '4242424242424242',
    expiry: '12/25',
    cvc: '123'
  });

  await checkoutPage.submitOrder();

  // Assert
  const orderNumber = await checkoutPage.getOrderNumber();
  expect(orderNumber).toMatch(/^ORD-\d+$/);
});
