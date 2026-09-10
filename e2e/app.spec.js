import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('loads the dashboard and navigates to exercises', async ({ page }) => {
  await expect(page).toHaveTitle(/ConjuMaster UK/);
  await expect(page.locator('#page-dashboard')).toBeVisible();

  await page.locator('[data-page="exercises"]').click();
  await expect(page.locator('#page-exercises')).toBeVisible();
  await expect(page.locator('#exerciseModeSelector')).toBeVisible();
  await expect(page.locator('[data-mode="qcm"]')).toBeVisible();
});

test('runs a complete first exercise interaction and persists progress', async ({ page }) => {
  await page.locator('[data-page="exercises"]').click();
  await page.locator('[data-mode="qcm"]').click();

  await expect(page.locator('#exerciseArea')).toBeVisible();
  await expect(page.locator('.option-btn').first()).toBeVisible();
  await expect(page.locator('#exCurrent')).toHaveText('1');

  await page.locator('.option-btn').first().click();
  await page.locator('#exValidateBtn').click();

  await expect(page.locator('#exerciseFeedback')).toBeVisible();
  await expect(page.locator('#exValidateBtn')).toBeHidden();
  await expect(page.locator('#exNextBtn')).toBeVisible();

  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('conjumaster_data')));
  expect(persisted.totalExercises).toBe(1);
  expect(persisted.correctAnswers + persisted.incorrectAnswers).toBe(1);
  expect(Object.keys(persisted.tenseStats)).toHaveLength(1);

  await page.locator('#exNextBtn').click();
  await expect(page.locator('#exCurrent')).toHaveText('2');
  await expect(page.locator('#exValidateBtn')).toBeVisible();
});

test('restores persisted progress after a browser reload', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'conjumaster_data',
      JSON.stringify({
        xp: 10,
        level: 1,
        totalExercises: 1,
        correctAnswers: 1,
        incorrectAnswers: 0,
        bestStreak: 1,
        currentStreak: 1,
        daysStreak: 1,
        lastActiveDate: new Date().toDateString(),
        completedLessons: [],
        tenseStats: { present_simple: { correct: 1, total: 1 } },
        errorLog: [],
        activityLog: [],
        favorites: [],
        spacedRepetition: {},
        settings: { theme: 'light' },
      }),
    );
  });

  await page.reload();
  await expect(page.locator('#dashXP')).toHaveText('10');
  await expect(page.locator('#dashExercises')).toHaveText('1');
  await expect(page.locator('#dashAccuracy')).toHaveText('100%');
});

test('toggles the application theme in the real browser', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#themeBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#themeBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
