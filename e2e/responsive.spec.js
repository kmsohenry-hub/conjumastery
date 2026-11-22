import { expect, test } from '@playwright/test';

test('keeps the primary navigation usable on a mobile viewport', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.locator('.main-content')).toBeVisible();
  await expect(page.locator('#menuToggleBtn')).toBeVisible();

  const pagesToCheck = ['dashboard', 'lessons', 'exercises', 'verbs', 'comparison', 'settings'];
  for (const targetPage of pagesToCheck) {
    await page.locator('#menuToggleBtn').click();
    await expect(page.locator('#sidebar')).toHaveClass(/open/);

    await page.locator(`.nav-item[data-page="${targetPage}"]`).click();
    await expect(page.locator(`#page-${targetPage}`)).toBeVisible();
    await expect(page.locator('#sidebar')).not.toHaveClass(/open/);

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(horizontalOverflow, `Unexpected horizontal overflow on ${targetPage}`).toBe(false);
  }
});
