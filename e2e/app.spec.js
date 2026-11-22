/* global Buffer */

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
  expect(persisted.version).toBe(1);
  expect(persisted.data.totalExercises).toBe(1);
  expect(persisted.data.correctAnswers + persisted.data.incorrectAnswers).toBe(1);
  expect(Object.keys(persisted.data.tenseStats)).toHaveLength(1);

  await page.locator('#exNextBtn').click();
  await expect(page.locator('#exCurrent')).toHaveText('2');
  await expect(page.locator('#exValidateBtn')).toBeVisible();
});

test('restores persisted progress after a browser reload', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'conjumaster_data',
      JSON.stringify({
        version: 1,
        data: {
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
        },
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

test('opens unlocked lessons, blocks locked lessons and dismisses modal via Escape', async ({
  page,
}) => {
  await page.locator('.nav-item[data-page="lessons"]').click();
  await expect(page.locator('#page-lessons')).toBeVisible();

  await page.locator('#lessonContent .lesson-card:not(.locked)').first().click();
  await expect(page.locator('#modalOverlay')).toHaveClass(/active/);
  await expect(page.locator('#modalTitle')).toBeVisible();
  await expect(page.locator('#modalContent .timeline-container')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('#modalOverlay')).not.toHaveClass(/active/);

  await page.locator('#lessonContent .lesson-card.locked').first().click({ force: true });
  await expect(page.locator('#modalOverlay')).not.toHaveClass(/active/);
  await expect(page.locator('#toastContainer')).toContainText('75%');
});

test('filters irregular verbs, expands conjugations and persists favorites', async ({ page }) => {
  await page.locator('.nav-item[data-page="verbs"]').click();
  await expect(page.locator('#page-verbs')).toBeVisible();

  await page.locator('#verbSearch').fill('went');
  const cards = page.locator('#verbsList .verb-card');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('go');
  await expect(cards.first()).toContainText('went');
  await expect(cards.first()).toContainText('gone');

  await cards.first().locator('.verb-base').click();
  await expect(cards.first().locator('[data-action="toggle-verb"]')).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(cards.first().locator('.verb-conjugation-table')).toBeVisible();
  await expect(cards.first().locator('.verb-conjugation-table')).toContainText('am/is/are going');
  await expect(cards.first().locator('.verb-conjugation-table')).toContainText('was/were going');

  const favBtn = cards.first().locator('[data-action="toggle-fav"]');
  await favBtn.click();
  await expect(favBtn).toHaveClass(/active/);

  await page.locator('.nav-item[data-page="favorites"]').click();
  await expect(page.locator('#favoritesContent')).toContainText('go');
  await expect(page.locator('#favoritesContent')).toContainText('went');
});

test('runs global search case-insensitively and switches comparison tabs', async ({ page }) => {
  await page.locator('.nav-item[data-page="search"]').click();
  await expect(page.locator('#page-search')).toBeVisible();

  await page.locator('#globalSearchInput').fill('GIVE UP');
  await expect(page.locator('#searchResults')).toContainText(/give up/i);

  await page.locator('#globalSearchInput').fill('since');
  await expect(page.locator('#searchResults')).toContainText('Present Perfect');

  await page.locator('#globalSearchInput').fill('PRESENT SIMPLE');
  const tenseItem = page.locator('.search-result-item[data-action="open-tense-modal"]').first();
  await expect(tenseItem).toBeVisible();
  await tenseItem.click();
  await expect(page.locator('#modalOverlay')).toHaveClass(/active/);
  await page.keyboard.press('Escape');

  await page.locator('.nav-item[data-page="comparison"]').click();
  await expect(page.locator('#page-comparison')).toBeVisible();
  const futureTab = page.locator('#comparisonTabs .tab[data-comp-id="future"]');
  await futureTab.click();
  await expect(futureTab).toHaveClass(/active/);
  await expect(page.locator('#comparisonContent .comparison-table')).toContainText(
    'Futur simple (will)',
  );

  const pastTab = page.locator('#comparisonTabs .tab[data-comp-id="past"]');
  await pastTab.click();
  await expect(pastTab).toHaveClass(/active/);
  await expect(page.locator('#comparisonContent .comparison-table')).toContainText('Prétérit');
});

test('preserves hash route across reload, manages backup/import and resets via accessible modal', async ({
  page,
}) => {
  const dialogs = [];
  page.on('dialog', (dialog) => {
    dialogs.push(dialog.type());
    dialog.dismiss();
  });

  await page.evaluate(() => {
    localStorage.setItem(
      'conjumaster_data',
      JSON.stringify({
        version: 1,
        data: {
          xp: 120,
          level: 2,
          totalExercises: 4,
          correctAnswers: 4,
          incorrectAnswers: 0,
          bestStreak: 4,
          currentStreak: 4,
          daysStreak: 2,
          lastActiveDate: new Date().toDateString(),
          completedLessons: ['l_present_simple'],
          tenseStats: { present_simple: { correct: 4, total: 4 } },
          errorLog: [],
          activityLog: [],
          favorites: [],
          spacedRepetition: {},
          settings: { theme: 'light' },
        },
      }),
    );
  });

  await page.reload();
  await expect(page.locator('#dashXP')).toHaveText('120');

  await page.locator('.nav-item[data-page="settings"]').click();
  await expect(page).toHaveURL(/#settings$/);

  await page.reload();
  await expect(page.locator('#page-settings')).toHaveClass(/active/);
  await expect(page.locator('#headerXP')).toHaveText('120');

  await page.locator('#resetProgressBtn').click();
  await expect(page.locator('#modalOverlay')).toHaveClass(/active/);
  await expect(page.locator('#confirmResetBtn')).toBeVisible();
  await page.locator('#cancelResetBtn').click();
  await expect(page.locator('#modalOverlay')).not.toHaveClass(/active/);
  await expect(page.locator('#headerXP')).toHaveText('120');

  await page.locator('#resetProgressBtn').click();
  await page.locator('#confirmResetBtn').click();
  await expect(page.locator('#modalOverlay')).not.toHaveClass(/active/);
  await expect(page.locator('#page-dashboard')).toHaveClass(/active/);
  await expect(page.locator('#headerXP')).toHaveText('0');
  await expect(page.locator('#toastContainer')).toContainText('Progression réinitialisée');
  expect(dialogs).toEqual([]);

  await page.locator('.nav-item[data-page="settings"]').click();
  await page.locator('#importFile').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{broken json'),
  });
  await expect(page.locator('#toastContainer')).toContainText('Fichier invalide');
  await expect(page.locator('#headerXP')).toHaveText('0');

  await page.locator('#importFile').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({
        version: 1,
        data: {
          xp: 240,
          level: 3,
          completedLessons: ['l_present_simple'],
          settings: { theme: 'light' },
        },
      }),
    ),
  });
  await expect(page.locator('#headerXP')).toHaveText('240');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#exportDataBtn').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^conjumaster_backup_\d{4}-\d{2}-\d{2}\.json$/);
});

test('runs Test Mode validation guard, timed question flow, and cancels timer on navigation', async ({
  page,
}) => {
  await page.locator('.nav-item[data-page="test"]').click();
  await expect(page.locator('#page-test')).toBeVisible();
  await expect(page.locator('#testSetup')).toBeVisible();

  // Uncheck all tenses -> error toast and setup remains visible
  await page.evaluate(() => {
    document.querySelectorAll('#testTenseCheckboxes input[type="checkbox"]').forEach((cb) => {
      cb.checked = false;
    });
  });
  await page.locator('[data-action="start-test"]').click();
  await expect(page.locator('#toastContainer')).toContainText('Sélectionnez au moins un temps');
  await expect(page.locator('#testSetup')).toBeVisible();

  // Select Present Simple only and start the timed test
  await page.locator('#testTenseCheckboxes input[value="present_simple"]').check();
  await page.locator('[data-action="start-test"]').click();

  await expect(page.locator('#testArea')).toBeVisible();
  await expect(page.locator('#testCurrent')).toHaveText('1');
  await expect(page.locator('#testTotal')).toHaveText('20');

  // Answer question 1 (either QCM or free text)
  const optionCount = await page.locator('#testQuestionContainer .option-btn').count();
  if (optionCount > 0) {
    await page.locator('#testQuestionContainer .option-btn').first().click();
  } else {
    await page.locator('#testInput').fill('works');
  }
  await page.locator('#testValidateBtn').click();

  await expect(page.locator('#testFeedback')).toBeVisible();
  await expect(page.locator('#testNextBtn')).toBeVisible();
  await page.locator('#testNextBtn').click();
  await expect(page.locator('#testCurrent')).toHaveText('2');

  // Navigating away cancels and resets the timer cleanly
  await page.locator('.nav-item[data-page="dashboard"]').click();
  await expect(page.locator('#page-dashboard')).toBeVisible();
  await expect(page.locator('#testTimer')).toHaveText('00:00');

  // Returning to Test Mode restores setup instead of stranding the user on #testArea
  await page.locator('.nav-item[data-page="test"]').click();
  await expect(page.locator('#testSetup')).toBeVisible();
  await expect(page.locator('#testArea')).toBeHidden();

  // Clicking Mode mixte after a Test session starts a fresh 10-question free session
  await page.locator('.nav-item[data-page="exercises"]').click();
  await page.locator('[data-mode="mixed"]').click();
  await expect(page.locator('#exerciseArea')).toBeVisible();
  await expect(page.locator('#exTotal')).toHaveText('10');
});

test('revises passive_voice and reported_speech from Revision queue with readable labels and no crash', async ({
  page,
}) => {
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.evaluate(() => {
    localStorage.setItem(
      'conjumaster_data',
      JSON.stringify({
        version: 1,
        data: {
          xp: 40,
          level: 1,
          totalExercises: 4,
          correctAnswers: 1,
          incorrectAnswers: 3,
          bestStreak: 1,
          currentStreak: 0,
          daysStreak: 1,
          lastActiveDate: new Date().toDateString(),
          completedLessons: [],
          tenseStats: {
            passive_voice: { correct: 1, total: 4 },
          },
          errorLog: [{ tenseId: 'passive_voice', date: new Date().toISOString() }],
          activityLog: [],
          favorites: [],
          spacedRepetition: {
            passive_voice: { interval: 1, nextReview: 0, ease: 2.3, errors: 2 },
            reported_speech: { interval: 1, nextReview: 0, ease: 2.3, errors: 1 },
          },
          settings: { theme: 'light' },
        },
      }),
    );
  });

  await page.reload();
  await page.locator('.nav-item[data-page="revision"]').click();
  await expect(page.locator('#revisionContent')).toContainText('Voix Passive');
  await expect(page.locator('#revisionContent')).toContainText('Discours Indirect');
  await expect(page.locator('#revisionContent')).not.toContainText('passive_voice');

  await page.locator('[data-action="start-revision"]').click();
  await expect(page.locator('#exerciseArea')).toBeVisible();
  await expect(page.locator('#exTotal')).toHaveText('2');
  await expect(page.locator('#exerciseQuestionContainer .exercise-card')).toBeVisible();
  await expect(page.locator('#exerciseQuestionContainer')).toContainText(
    /Voix Passive|Discours Indirect/,
  );

  await page.locator('#exSkipBtn').click();
  await expect(page.locator('#exerciseFeedback')).toBeVisible();
  expect(pageErrors).toEqual([]);
});
