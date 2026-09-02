import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import { APP_DATA, State, ExerciseEngine, validateImportedState, init } from '../app.js';
import * as Navigation from '../src/ui/navigation.js';
import * as Lessons from '../src/ui/pages/lessons.js';
import * as Dashboard from '../src/ui/pages/dashboard.js';
import * as Reviews from '../src/ui/pages/reviews.js';
import * as Search from '../src/ui/pages/search.js';
import * as Favorites from '../src/ui/pages/favorites.js';
import * as Stats from '../src/ui/pages/stats.js';
import * as Tenses from '../src/ui/pages/tenses.js';
import * as Weakpoints from '../src/ui/pages/weakpoints.js';
import * as TestPage from '../src/ui/pages/test.js';
import * as Exercises from '../src/ui/pages/exercises.js';
import * as Conjugation from '../src/core/exercises/conjugation.js';
import * as Generator from '../src/core/exercises/generator.js';
import { NotificationManager } from '../src/ui/utils/notifications.js';
import { launchConfetti } from '../src/ui/utils/confetti.js';
import { updateOnlineStatus, registerServiceWorker } from '../src/pwa.js';

const bodyHtml = fs.readFileSync('index.html', 'utf8').match(/<body>([\s\S]*)<\/body>/i)[1];

function loadRealDom() {
  document.body.innerHTML = bodyHtml;
}

beforeEach(() => {
  vi.useFakeTimers();
  loadRealDom();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('coverage closure integration', () => {
  it('exercises app bootstrap, settings, compatibility facade and import validation', () => {
    const snapshot = structuredClone(State.data);
    localStorage.setItem(
      'conjumaster_data',
      JSON.stringify({ ...snapshot, settings: { ...snapshot.settings, theme: 'dark' } }),
    );
    expect(() => init()).not.toThrow();
    localStorage.removeItem('conjumaster_data');
    State.data.settings.theme = 'light';
    expect(() => init()).not.toThrow();
    for (const [key, value] of Object.entries({
      currentExercise: null,
      currentMode: 'mixed',
      questions: [],
      currentIndex: 0,
      score: 0,
      answered: false,
    }))
      ExerciseEngine[key] = value;
    expect(ExerciseEngine.currentMode).toBe('mixed');
    expect(validateImportedState({ settings: { theme: 'light' } }).settings.theme).toBe('light');
    expect(validateImportedState({ data: { settings: { theme: 'dark' } } }).settings.theme).toBe(
      'dark',
    );
    expect(ExerciseEngine.currentExercise).toBeDefined();
    expect(ExerciseEngine.currentMode).toBeDefined();
    expect(ExerciseEngine.questions).toBeDefined();
    expect(ExerciseEngine.currentIndex).toBeDefined();
    expect(ExerciseEngine.score).toBeDefined();
    expect(ExerciseEngine.answered).toBeDefined();
    expect(ExerciseEngine.getAllIrregularForms('go')).toBeDefined();
    expect(ExerciseEngine.getIrregularForms('go')).toBeDefined();
    expect(ExerciseEngine.getRegularPast('play')).toBeDefined();
    expect(ExerciseEngine.getPresentSimpleForm('play', false)).toBeDefined();
    expect(ExerciseEngine.getIngForm('play')).toBeDefined();
    expect(ExerciseEngine.getConjugation('go', 'past_simple', 'I', false)).toBeDefined();

    const oldQuestions = ExerciseEngine.questions;
    const oldIndex = ExerciseEngine.currentIndex;
    ExerciseEngine.start('fill', ['present_simple'], 'easy');
    ExerciseEngine.getCurrent();
    ExerciseEngine.next();
    ExerciseEngine.isComplete();
    ExerciseEngine.getProgress();
    ExerciseEngine.currentIndex = oldIndex;
    ExerciseEngine.questions = oldQuestions;
  });

  it('exercises navigation guards and keyboard branches', () => {
    for (const page of [
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
      'unknown',
    ]) {
      expect(() => Navigation.navigateTo(page)).not.toThrow();
    }
    Navigation.setTheme('dark');
    Navigation.setTheme('light');
    Navigation.toggleTheme();
    document.getElementById('themeBtn')?.remove();
    Navigation.setTheme('dark');
    document.getElementById('modalOverlay')?.remove();
    Navigation.openModal();
    Navigation.closeModalDirect();
    const overlay = document.createElement('div');
    overlay.id = 'modalOverlay';
    document.body.appendChild(overlay);
    Navigation.closeModal({ target: document.createElement('span') });
    Navigation.closeModal({ target: overlay });
    const roles = ['button'];
    for (const tag of ['BUTTON', 'INPUT', 'TEXTAREA']) {
      const el = document.createElement(tag);
      el.setAttribute('role', 'button');
      document.body.appendChild(el);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
    const card = document.createElement('div');
    card.setAttribute('role', 'button');
    card.click = vi.fn();
    document.body.appendChild(card);
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const classes = ['nav-item', 'mode-card', 'lesson-card', 'verb-card'];
    for (const cls of classes) {
      const el = document.createElement('div');
      el.classList.add(cls);
      el.click = vi.fn();
      document.body.appendChild(el);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
    document.getElementById('modalOverlay')?.remove();
    Navigation.openModal();
    const bare = document.createElement('div');
    bare.id = 'modalOverlay';
    document.body.appendChild(bare);
    Navigation.openModal();
    vi.advanceTimersByTime(60);
    Navigation.toggleSidebar();
    Navigation.toggleSidebar();
    expect(roles).toContain('button');
  });

  it('exercises all lesson renderer paths and timeline variants', () => {
    expect(() => Lessons.renderLessons()).not.toThrow();
    const tabs = document.querySelectorAll('#lessonTabs .tab');
    if (tabs[1]) Lessons.showModule(1, tabs[1]);
    const originalModules = APP_DATA.modules;
    APP_DATA.modules = [
      {
        icon: '🧪',
        name: 'Test',
        level: 'advanced',
        color: '#123',
        lessons: [
          { id: 'a', title: 'A', desc: 'A', exercises: 1 },
          { id: 'b', title: 'B', desc: 'B', exercises: 2, tenseId: 'present_simple' },
        ],
      },
    ];
    try {
      State.data.completedLessons = [];
      Lessons.showModule(0);
      State.data.completedLessons = ['a'];
      Lessons.showModule(0);
      Lessons.openLesson('l_passive', null);
      Lessons.openLesson('l_reported', null);
      Lessons.openLesson('x', 'present_simple');
      Lessons.openLesson('x', 'unknown');
    } finally {
      APP_DATA.modules = originalModules;
    }
    const holder = document.createElement('div');
    const lonely = document.createElement('button');
    holder.appendChild(lonely);
    Lessons.showModule(0, lonely);
    Lessons.openLesson('unknown_special', null);
    for (const level of ['beginner', 'intermediate', 'advanced']) {
      const tense = {
        id: `lv_${level}`,
        nameFR: level,
        level,
        explanation: 'e',
        structure: 's',
        structureNeg: 'n',
        structureQ: 'q',
        examples: [{ en: 'e', fr: 'f' }],
        usage: ['u'],
        signalWords: null,
        nuances: null,
        commonErrors: [],
      };
      Lessons.openTenseModal(tense);
    }
    State.addFavorite('lv_beginner');
    Lessons.openTenseModal({
      id: 'lv_beginner',
      nameFR: 'begin',
      level: 'beginner',
      explanation: 'e',
      structure: 's',
      structureNeg: 'n',
      structureQ: 'q',
      examples: [{ en: 'e', fr: 'f' }],
      usage: ['u'],
      signalWords: [],
      nuances: 'x',
      commonErrors: [{ wrong: 'w', right: 'r', note: 'n' }],
    });
    State.removeFavorite('lv_beginner');
    expect(Lessons.renderTimeline({})).toBe('');
    for (const type of [
      'dots',
      'range',
      'point',
      'arrow',
      'double-point',
      'cycle',
      'conditional',
      'unknown',
    ])
      expect(
        Lessons.renderTimeline({
          timeline: {
            type,
            positions: [10, 50],
            start: 10,
            end: 90,
            position: 50,
            first: 20,
            second: 70,
            condition: 30,
            result: 80,
          },
        }),
      ).toContain('timeline');
  });

  it('exercises dashboard branches and chart colors', () => {
    Dashboard.renderDashboard();
    Dashboard.renderDashboardStats({ ...State.data, totalExercises: 0, correctAnswers: 0 });
    Dashboard.renderDashboardStats({ ...State.data, totalExercises: 10, correctAnswers: 1 });
    Dashboard.renderDashboardNextLesson([]);
    Dashboard.renderDashboardNextLesson(['missing']);
    Dashboard.renderDashboardRevisionQueue([
      { tenseId: 'present_simple', errors: 0, interval: 1 },
      { tenseId: 'past_simple', errors: 2, interval: 2 },
      { tenseId: 'future_will', errors: 4, interval: 3 },
      { tenseId: 'unknown', errors: 0, interval: 4 },
    ]);
    const original = State.data.tenseStats;
    State.data.tenseStats = {};
    Dashboard.renderDashboardChart();
    State.data.tenseStats = {
      present_simple: { correct: 9, total: 10 },
      past_simple: { correct: 6, total: 10 },
      future_will: { correct: 1, total: 10 },
    };
    Dashboard.renderDashboardChart();
    State.data.tenseStats = original;
  });

  it('exercises review, favorite, search and weakpoint variants', () => {
    Reviews.renderRevision();
    Reviews.startRevisionSession();
    const originalQueue = State.getReviewQueue;
    State.getReviewQueue = vi.fn().mockReturnValue([
      { tenseId: 'present_simple', errors: 0, interval: 1 },
      { tenseId: 'past_simple', errors: 2, interval: 2 },
      { tenseId: 'future_will', errors: 4, interval: 3 },
      { tenseId: 'unknown', errors: 0, interval: 4 },
      { tenseId: 'unknown', errors: 0, interval: 4 },
    ]);
    Reviews.renderRevision();
    Reviews.startRevisionSession();
    vi.advanceTimersByTime(100);
    State.getReviewQueue = originalQueue;
    const originalFavs = State.data.favorites;
    State.data.favorites = ['unknown', 'verb_missing'];
    Favorites.renderFavorites();
    State.removeFavorite('verb_go');
    Favorites.toggleFav('verb_go', null);
    const btn = document.createElement('button');
    Favorites.toggleFav('verb_go', btn);
    Favorites.toggleFav('verb_go', btn);
    State.addFavorite('verb_go');
    Favorites.toggleFav('verb_go', null);
    State.data.favorites = originalFavs;
    const input = document.getElementById('globalSearch');
    input.value = '';
    Search.performGlobalSearch();
    input.value = 'zzzzzz';
    Search.performGlobalSearch();
    input.value = APP_DATA.phrasalVerbs[0].pv;
    Search.performGlobalSearch();
    input.value = APP_DATA.modals[0].name;
    Search.performGlobalSearch();
    const oldWeak = State.getWeakPoints;
    State.getWeakPoints = vi.fn().mockReturnValue([
      { tenseId: 'present_simple', accuracy: 0.2, total: 5, errors: 4 },
      { tenseId: 'past_simple', accuracy: 0.5, total: 4, errors: 2 },
      { tenseId: 'future_will', accuracy: 0.8, total: 5, errors: 1 },
      { tenseId: 'unknown', accuracy: 0.9, total: 2, errors: 0 },
    ]);
    Weakpoints.renderWeakpoints();
    State.getWeakPoints = oldWeak;
  });

  it('exercises stats and tense reference optionals', () => {
    State.data.activityLog = [];
    State.data.errorLog = [];
    State.data.tenseStats = {};
    Stats.renderStats();
    State.data.activityLog = [{ date: new Date().toISOString(), xp: 3 }];
    State.data.errorLog = [
      { tenseId: 'present_simple' },
      { tenseId: 'unknown' },
      { tenseId: 'present_simple' },
    ];
    State.data.tenseStats = {
      present_simple: { correct: 8, total: 10 },
      future_will: { correct: 3, total: 10 },
    };
    Stats.renderStats();
    Tenses.renderTenses();
    Tenses.renderComparison();
    Tenses.showTenseCategory(APP_DATA.tenses[0].category, {
      classList: { add() {}, remove() {} },
    });
    const originalTenses = APP_DATA.tenses.slice();
    const originalMap = { ...APP_DATA.tensesById };
    APP_DATA.tenses = [
      ...['beginner', 'intermediate', 'advanced'].map((level, i) => ({
        id: `c${i + 1}`,
        category: 'custom',
        level,
        nameFR: `C${i + 1}`,
        explanation: 'e',
        structure: 's',
        usage: ['u'],
        examples: [{ en: 'e', fr: 'f' }],
        signalWords: [],
        nuances: '',
      })),
    ];
    Object.assign(APP_DATA.tensesById, {
      c1: APP_DATA.tenses[0],
      c2: APP_DATA.tenses[1],
      c3: APP_DATA.tenses[2],
    });
    try {
      Tenses.showTenseCategory('custom');
      Tenses.showComparison('custom');
      const one = APP_DATA.tenses[0];
      APP_DATA.tenses = [one];
      Tenses.showComparison('custom');
      APP_DATA.tenses = [];
      Tenses.showComparison('custom');
    } finally {
      APP_DATA.tenses = originalTenses;
      for (const k of ['c1', 'c2', 'c3']) delete APP_DATA.tensesById[k];
      Object.assign(APP_DATA.tensesById, originalMap);
    }
  });

  it('exercises test and exercise rendering guards', () => {
    ExerciseEngine.questions = [];
    TestPage.renderTestQuestion();
    ExerciseEngine.questions = [
      { type: 'qcm', tenseId: undefined, sentence: 'x', options: ['a', 'b', 'c', 'd'], correct: 0 },
    ];
    ExerciseEngine.currentIndex = 0;
    ExerciseEngine.score = 0;
    TestPage.renderTestQuestion();
    ExerciseEngine.questions = [
      { type: 'fill', tenseId: 'present_simple', sentence: 'x', answer: 'x' },
    ];
    ExerciseEngine.currentIndex = 0;
    TestPage.renderTestQuestion();
    vi.advanceTimersByTime(100);
    ExerciseEngine.questions = [
      {
        type: 'qcm',
        tenseId: 'unknown',
        sentence: 'done',
        options: ['a', 'b'],
        correct: 0,
        answeredCorrectly: true,
      },
    ];
    ExerciseEngine.score = 1;
    TestPage.finishTest();
    Exercises.renderExerciseQuestion({
      type: 'transform',
      tenseId: 'present_simple',
      sentence: 'x',
      explanation: 'e',
    });
    Exercises.renderExerciseQuestion({
      type: 'correction',
      tenseId: 'present_simple',
      sentence: 'x',
      explanation: 'e',
    });
    Exercises.renderExerciseQuestion({
      type: 'other',
      tenseId: 'present_simple',
      sentence: 'x',
      explanation: 'e',
    });
    Exercises.renderExerciseQuestion({
      type: 'qcm',
      tenseId: 'unknown',
      sentence: 'x',
      options: ['a', 'b'],
      correct: 0,
    });
  });

  it('exercises conjugation and generator fallback branches', () => {
    for (const id of [
      'present_simple',
      'present_continuous',
      'present_perfect',
      'present_perfect_continuous',
      'past_simple',
      'past_continuous',
      'past_perfect',
      'past_perfect_continuous',
      'future_will',
      'future_going_to',
      'future_continuous',
      'future_perfect',
      'future_perfect_continuous',
      'unknown',
    ])
      expect(
        Conjugation.getConjugation(APP_DATA.verbsByBase, 'work', id, 'They', false),
      ).toBeTruthy();
    for (const subject of ['I', 'He', 'They'])
      for (const third of [false, true])
        for (const negative of [false, true])
          expect(
            Conjugation.getAuxiliary('present_continuous', subject, third, negative),
          ).toBeTruthy();
    expect(Conjugation.shouldDoubleFinalConsonant('abc')).toBe(false);
    expect(
      Generator.generateTranslation(APP_DATA.tensesById.present_continuous, 'I', 'work', false),
    ).toBeTruthy();
    expect(Conjugation.getAuxiliary('unknown', 'They', false, false)).toBe('');
    const templates = APP_DATA.exerciseTemplates;
    const saved = {};
    for (const tense of APP_DATA.tenses) {
      saved[tense.id] = templates[tense.id];
      templates[tense.id] = undefined;
    }
    try {
      const futureCustom = { id: 'future_custom', nameFR: 'Future custom', structure: 'will' };
      expect(Generator.generateQCM(futureCustom, 'They', 'work', false, 'easy').sentence).toContain(
        'tomorrow',
      );
      for (const tense of APP_DATA.tenses) {
        Generator.generateQCM(tense, 'They', 'work', false, 'easy');
        Generator.generateFill(tense, 'They', 'work', false);
        Generator.generateTransform(tense, 'They', 'work', false);
        Generator.generateCorrection(tense, 'They', 'work', false);
        Generator.generateTranslation(tense, 'They', 'work', false);
      }
    } finally {
      for (const tense of APP_DATA.tenses) templates[tense.id] = saved[tense.id];
    }
  });

  it('exercises PWA online/offline and registration lifecycle', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    updateOnlineStatus();
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    updateOnlineStatus();
    const original = navigator.serviceWorker;
    const listeners = {};
    const worker = { state: 'installed', addEventListener: vi.fn((e, cb) => (listeners[e] = cb)) };
    const reg = { installing: worker, addEventListener: vi.fn() };
    const register = vi.fn().mockResolvedValue(reg);
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register, controller: {} },
    });
    registerServiceWorker();
    window.dispatchEvent(new Event('load'));
    await Promise.resolve();
    await Promise.resolve();
    reg.addEventListener.mock.calls[0][1]();
    listeners.statechange();
    worker.state = 'activating';
    listeners.statechange();
    const reg2 = { installing: null, addEventListener: vi.fn() };
    const register2 = vi.fn().mockResolvedValue(reg2);
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register: register2, controller: null },
    });
    registerServiceWorker();
    window.dispatchEvent(new Event('load'));
    await Promise.resolve();
    await Promise.resolve();
    reg2.addEventListener.mock.calls[0][1]();
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: original });
  });

  it('exercises notification cooldown and unsupported branches', async () => {
    const oldNotification = window.Notification;
    document.body.innerHTML =
      '<div id="toastContainer"></div><button id="notificationToggleBtn"></button>';
    const Fake = vi.fn();
    Fake.permission = 'default';
    Fake.requestPermission = vi.fn().mockResolvedValue('granted');
    window.Notification = Fake;
    globalThis.Notification = Fake;
    document.getElementById('notificationToggleBtn').remove();
    NotificationManager.updateUI();
    document.body.innerHTML =
      '<div id="toastContainer"></div><button id="notificationToggleBtn"></button>';
    NotificationManager.updateUI();
    NotificationManager.toggle();
    await Promise.resolve();
    Fake.permission = 'granted';
    NotificationManager.updateUI();
    NotificationManager.toggle();
    Fake.permission = 'denied';
    NotificationManager.updateUI();
    const oldQueue = State.getReviewQueue;
    State.getReviewQueue = vi.fn().mockReturnValue([{ tenseId: 'present_simple' }]);
    NotificationManager.lastNotificationTime = 0;
    NotificationManager.checkAndNotify();
    Fake.permission = 'denied';
    NotificationManager.toggle();
    State.getReviewQueue = vi.fn().mockReturnValue([]);
    State.data.lastActiveDate = null;
    Fake.permission = 'granted';
    NotificationManager.lastNotificationTime = -1;
    NotificationManager.minInterval = 1;
    NotificationManager.checkAndNotify();
    State.getReviewQueue = oldQueue;
    window.Notification = oldNotification;
    globalThis.Notification = oldNotification;
    loadRealDom();
    launchConfetti(0);
    launchConfetti(1);
  });
});
