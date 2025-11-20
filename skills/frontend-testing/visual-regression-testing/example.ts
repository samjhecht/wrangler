import { test, expect } from '@playwright/test';

test('checkout form visual regression', async ({ page }) => {
  await page.goto('/checkout');

  // Take screenshot of specific element
  const checkoutForm = page.locator('[data-testid="checkout-form"]');
  await expect(checkoutForm).toHaveScreenshot('checkout-form.png', {
    maxDiffPixels: 100,
  });

  // Verify no console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.reload();
  expect(errors).toHaveLength(0);
});
