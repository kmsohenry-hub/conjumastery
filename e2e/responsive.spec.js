import { expect, test } from '@playwright/test';

test('keeps the primary navigation usable on a mobile viewport', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.locator('.main-content')).toBeVisible();
  await expect(page.locator('#menuToggleBtn')).toBeVisible();

  await page.locator('#menuToggleBtn').click();
  await expect(page.locator('#sidebar')).toHaveClass(/open/);

  await page.locator('[data-page="exercises"]').click();
  await expect(page.locator('#page-exercises')).toBeVisible();
  await expect(page.locator('[data-mode="qcm"]')).toBeVisible();

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(horizontalOverflow).toBe(false);
});
