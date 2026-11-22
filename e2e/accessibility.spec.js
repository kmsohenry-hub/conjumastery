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

async function waitForAnimationsToSettle(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const finiteAnimations = document
      .getAnimations()
      .filter((animation) => animation.effect?.getComputedTiming?.().iterations !== Infinity);
    await Promise.all(finiteAnimations.map((animation) => animation.finished.catch(() => {})));
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

async function expectNoBlockingA11yViolations(page, label) {
  await waitForAnimationsToSettle(page);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const blocking = results.violations.filter((violation) =>
    ['critical', 'serious'].includes(violation.impact),
  );
  expect(blocking, `${label}:\n${JSON.stringify(blocking, null, 2)}`).toEqual([]);
}

for (const route of routes) {
  test(`has no critical or serious accessibility violations on ${route.name}`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await route.setup(page);

    await expectNoBlockingA11yViolations(page, `route ${route.name}`);
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

  await expectNoBlockingA11yViolations(page, 'dark mode dashboard');

  await page.locator('.nav-item[data-page="lessons"]').click();
  await page.locator('#lessonContent .lesson-card:not(.locked)').first().click();
  await expect(page.locator('#modalOverlay')).toHaveClass(/active/);

  await expectNoBlockingA11yViolations(page, 'dark mode open modal');
});

test('has no critical or serious accessibility violations during active exercises and test mode', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // 1. Active Fill exercise (dynamic #exerciseInput) + feedback state
  await page.locator('.nav-item[data-page="exercises"]').click();
  await page.locator('[data-mode="fill"]').click();
  await expect(page.locator('#exerciseInput')).toBeVisible();
  await expectNoBlockingA11yViolations(page, 'active fill exercise');

  await page.locator('#exerciseInput').fill('test answer');
  await page.locator('#exValidateBtn').click();
  await expect(page.locator('#exerciseFeedback')).toBeVisible();
  await expectNoBlockingA11yViolations(page, 'fill exercise feedback');

  // 2. Active QCM exercise + feedback state
  await page.locator('[data-action="exit-exercise"]').click();
  await page.locator('[data-mode="qcm"]').click();
  await expect(page.locator('.option-btn').first()).toBeVisible();
  await expectNoBlockingA11yViolations(page, 'active qcm exercise');

  await page.locator('.option-btn').first().click();
  await page.locator('#exValidateBtn').click();
  await expect(page.locator('#exerciseFeedback')).toBeVisible();
  await expectNoBlockingA11yViolations(page, 'qcm exercise feedback');

  // 3. Active Test mode question
  await page.locator('.nav-item[data-page="test"]').click();
  await page.locator('[data-action="start-test"]').click();
  await expect(page.locator('#testArea')).toBeVisible();
  await expectNoBlockingA11yViolations(page, 'active test mode');
});

test('has no critical or serious accessibility violations on populated views (stats, revision, weakpoints, favorites, verbs, search)', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    const now = Date.now();
    localStorage.setItem(
      'conjumaster_data',
      JSON.stringify({
        version: 1,
        data: {
          xp: 420,
          level: 5,
          totalExercises: 25,
          correctAnswers: 18,
          incorrectAnswers: 7,
          bestStreak: 6,
          currentStreak: 2,
          daysStreak: 3,
          lastActiveDate: new Date().toDateString(),
          completedLessons: ['l_ps', 'l_pc'],
          tenseStats: {
            present_simple: { correct: 9, total: 10 },
            past_simple: { correct: 2, total: 6 },
            passive_voice: { correct: 4, total: 5 },
            reported_speech: { correct: 3, total: 4 },
          },
          errorLog: [
            {
              date: new Date().toISOString(),
              tenseId: 'past_simple',
              verb: 'go',
              expected: 'went',
              given: 'goed',
              prompt: 'Yesterday I ___ home.',
            },
          ],
          activityLog: [
            { date: new Date().toISOString(), desc: 'Exercice Présent Simple', xp: 10 },
            { date: new Date().toISOString(), desc: 'Voix Passive', xp: 15 },
          ],
          favorites: ['go', 'write'],
          spacedRepetition: {
            past_simple: { interval: 10, ease: 2.1, nextReview: now - 60_000, errors: 3 },
          },
          settings: { theme: 'light' },
        },
      }),
    );
  });
  await page.reload();

  for (const pageName of ['stats', 'revision', 'weakpoints', 'favorites']) {
    await page.locator(`.nav-item[data-page="${pageName}"]`).click();
    await expectNoBlockingA11yViolations(page, `populated ${pageName}`);
  }

  // Expanded irregular verb card
  await page.locator('.nav-item[data-page="verbs"]').click();
  await page.locator('#verbsList .verb-card .verb-base').first().click();
  await expectNoBlockingA11yViolations(page, 'expanded verb card');

  // Populated search results
  await page.locator('.nav-item[data-page="search"]').click();
  await page.locator('#globalSearchInput').fill('present');
  await expect(page.locator('#searchResults')).not.toBeEmpty();
  await expectNoBlockingA11yViolations(page, 'populated search results');
});
