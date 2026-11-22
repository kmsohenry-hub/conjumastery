import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  'dashboard',
  'lessons',
  'exercises',
  'test',
  'tenses',
  'verbs',
  'comparison',
  'revision',
  'weakpoints',
  'search',
  'favorites',
  'stats',
  'settings',
].map((name) => ({
  name,
  setup:
    name === 'dashboard'
      ? async () => {}
      : async (page) => {
          await page.locator(`.nav-item[data-page="${name}"]`).click();
        },
}));

for (const route of routes) {
  test(`has no critical or serious accessibility violations on ${route.name}`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await route.setup(page);

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const blocking = results.violations.filter((violation) =>
      ['critical', 'serious'].includes(violation.impact),
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}

test('has no critical or serious accessibility violations in dark mode and open modal', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.locator('#themeBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  const darkResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const darkBlocking = darkResults.violations.filter((violation) =>
    ['critical', 'serious'].includes(violation.impact),
  );
  expect(darkBlocking, JSON.stringify(darkBlocking, null, 2)).toEqual([]);

  await page.locator('.nav-item[data-page="lessons"]').click();
  await page.locator('#lessonContent .lesson-card:not(.locked)').first().click();
  await expect(page.locator('#modalOverlay')).toHaveClass(/active/);

  const modalResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const modalBlocking = modalResults.violations.filter((violation) =>
    ['critical', 'serious'].includes(violation.impact),
  );
  expect(modalBlocking, JSON.stringify(modalBlocking, null, 2)).toEqual([]);
});
