import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  { name: 'dashboard', setup: async () => {} },
  {
    name: 'exercises',
    setup: async (page) => {
      await page.locator('[data-page="exercises"]').click();
    },
  },
  {
    name: 'test',
    setup: async (page) => {
      await page.locator('[data-page="test"]').click();
    },
  },
];

for (const route of routes) {
  test(`has no critical accessibility violations on ${route.name}`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await route.setup(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter((violation) => violation.impact === 'critical');
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });
}
