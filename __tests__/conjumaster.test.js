const { APP_DATA, State, ExerciseEngine, answerMatches, validateImportedState } =
  await import('../app.js');
const appWindow = global.window;

/**
 * Tests unitaires pour ConjuMaster UK
 * Testent les fonctionnalités principales de l'application
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// Vitest compatibility for Bun
if (typeof vi === 'undefined') {
  global.vi = {
    fn: (fn) => {
      const mock = (...args) => {
        mock.calls.push(args);
        return fn ? fn(...args) : undefined;
      };
      mock.calls = [];
      mock.mockReturnValue = (val) => {
        fn = () => val;
        return mock;
      };
      mock.mockResolvedValue = (val) => {
        fn = () => Promise.resolve(val);
        return mock;
      };
      mock.mockClear = () => {
        mock.calls = [];
        return mock;
      };
      return mock;
    },
  };
}

// Helper for Mock elements
const createMockElement = () => ({
  style: {},
  classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn() },
  appendChild: vi.fn(),
  querySelector: vi.fn(() => null),
  querySelectorAll: vi.fn(() => []),
  setAttribute: vi.fn(),
  removeAttribute: vi.fn(),
  click: vi.fn(),
  innerHTML: '',
  textContent: '',
  remove: vi.fn(),
});

describe('answerMatches', () => {
  test('devrait retourner false pour un type expectedAnswer invalide', () => {
    expect(answerMatches('test', undefined)).toBe(false);
    expect(answerMatches('test', null)).toBe(false);
    expect(answerMatches('test', 123)).toBe(false);
    expect(answerMatches('test', true)).toBe(false);
  });

  test('devrait correspondre exactement', () => {
    expect(answerMatches('I went', 'I went')).toBe(true);
    expect(answerMatches('she goes', 'she goes')).toBe(true);
  });

  test('devrait être insensible à la casse', () => {
    expect(answerMatches('I WENT', 'i went')).toBe(true);
    expect(answerMatches('She Goes', 'she goes')).toBe(true);
  });

  test('devrait ignorer les espaces supplémentaires', () => {
    expect(answerMatches('  I   went  ', 'I went')).toBe(true);
    expect(answerMatches('she goes', '  she   goes  ')).toBe(true);
  });

  test('devrait normaliser les apostrophes', () => {
    expect(answerMatches("I've", "I've")).toBe(true);
    expect(answerMatches('I’ve', "I've")).toBe(true);
    expect(answerMatches("I've", 'I’ve')).toBe(true);
  });

  test('devrait gérer les variantes exactes avec des barres obliques', () => {
    expect(answerMatches('dreamt', 'dreamt/dreamed')).toBe(true);
    expect(answerMatches('dreamed', 'dreamt/dreamed')).toBe(true);
    expect(answerMatches('dreamed', 'dreamed/dreamt')).toBe(true);
    expect(answerMatches('learned', 'learnt / learned')).toBe(true);
  });

  test('devrait gérer les variantes dans des phrases', () => {
    expect(answerMatches('I dreamt of it', 'I dreamt/dreamed of it')).toBe(true);
    expect(answerMatches('I dreamed of it', 'I dreamt/dreamed of it')).toBe(true);
    expect(answerMatches('she learnt it', 'she learnt/learned it')).toBe(true);
  });

  test('ne devrait pas correspondre à des réponses incorrectes', () => {
    expect(answerMatches('I go', 'I went')).toBe(false);
    expect(answerMatches('dreamt', 'dream')).toBe(false);
    expect(answerMatches('dream', 'dreamt/dreamed')).toBe(false);
    expect(answerMatches('I dreamt of it', 'I dreamt/dreamed')).toBe(false);
  });
});

// Mock DOM & globals before importing the application module.
global.window = global;
global.document = {
  addEventListener: vi.fn(),
  createElement: vi.fn(createMockElement),
  getElementById: vi.fn(() => createMockElement()),
  documentElement: { setAttribute: vi.fn() },
  body: { appendChild: vi.fn() },
  DOMContentLoaded: 'DOMContentLoaded',
};
global.localStorage = {
  store: {},
  clear() {
    this.store = {};
  },
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
};
global.Notification = {
  permission: 'granted',
  requestPermission: vi.fn().mockResolvedValue('granted'),
};

beforeEach(() => {
  // Réinitialiser l'état avant chaque test
  State.data = {
    xp: 0,
    level: 1,
    totalExercises: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    bestStreak: 0,
    currentStreak: 0,
    daysStreak: 0,
    lastActiveDate: null,
    completedLessons: [],
    tenseStats: {},
    errorLog: [],
    activityLog: [],
    favorites: [],
    spacedRepetition: {},
    settings: { theme: 'light' },
  };
  localStorage.clear();
});

describe('validateImportedState', () => {
  test('nettoie les sauvegardes importées avant application', () => {
    const imported = validateImportedState({
      xp: 120,
      level: 'bad',
      completedLessons: ['l_present_simple', 42],
      favorites: ['present_simple', null],
      tenseStats: {
        present_simple: { correct: 2, total: 3 },
        broken: { correct: 5, total: 2 },
      },
      spacedRepetition: {
        past_simple: { interval: 3, nextReview: 1000, ease: 2.4, errors: 1 },
        '<img src=x onerror=alert(1)>': { interval: 1, nextReview: 0, ease: 2.5, errors: 0 },
      },
      errorLog: [{ tenseId: '<img src=x onerror=alert(1)>', date: '2026-08-30' }],
      settings: { theme: 'dark' },
      unknown: 'ignored',
    });

    expect(imported.xp).toBe(120);
    expect(imported.level).toBe(1);
    expect(imported.completedLessons).toEqual(['l_present_simple']);
    expect(imported.favorites).toEqual(['present_simple']);
    expect(imported.tenseStats.present_simple).toEqual({ correct: 2, total: 3 });
    expect(imported.tenseStats.broken).toBeUndefined();
    expect(imported.spacedRepetition.past_simple.interval).toBe(3);
    expect(imported.spacedRepetition['<img src=x onerror=alert(1)>']).toBeUndefined();
    expect(imported.errorLog).toEqual([]);
    expect(imported.settings.theme).toBe('dark');
    expect(imported.unknown).toBeUndefined();
  });

  test('rejette les sauvegardes qui ne sont pas des objets', () => {
    expect(() => validateImportedState(null)).toThrow('Invalid backup format');
    expect(() => validateImportedState('bad')).toThrow('Invalid backup format');
  });

  test('filtre les leçons et favoris qui ne correspondent pas au référentiel', () => {
    const imported = validateImportedState({
      completedLessons: ['l_present_simple', 'lesson_unknown', '<img src=x>'],
      favorites: ['present_simple', 'missing_tense', 'verb_go', 'verb_missing'],
    });

    expect(imported.completedLessons).toEqual(['l_present_simple']);
    expect(imported.favorites).toEqual(['present_simple', 'verb_go']);
  });

  test('ignore une date d’activité importée invalide', () => {
    const imported = validateImportedState({
      lastActiveDate: '<img src=x onerror=alert(1)>',
    });

    expect(imported.lastActiveDate).toBeNull();
  });

  test('ignore une date d’activité importée d’un type invalide', () => {
    const imported = validateImportedState({ lastActiveDate: 12345 });

    expect(imported.lastActiveDate).toBeNull();
  });
});

describe('State Management', () => {
  describe('addXP', () => {
    test('devrait ajouter des XP correctement', () => {
      State.addXP(50);
      expect(State.data.xp).toBe(50);

      State.addXP(30);
      expect(State.data.xp).toBe(80);
    });

    test('devrait augmenter le niveau quand le seuil est atteint', () => {
      State.addXP(100);
      expect(State.data.level).toBe(2);

      State.addXP(100);
      expect(State.data.level).toBe(3);
    });

    test("devrait enregistrer l'activité dans le log", () => {
      State.addXP(25);
      expect(State.data.activityLog.length).toBe(1);
      expect(State.data.activityLog[0].xp).toBe(25);
    });
  });

  describe('recordAnswer', () => {
    test('devrait enregistrer une réponse correcte', () => {
      State.recordAnswer('present_simple', true);

      expect(State.data.totalExercises).toBe(1);
      expect(State.data.correctAnswers).toBe(1);
      expect(State.data.currentStreak).toBe(1);
      expect(State.data.bestStreak).toBe(1);
      expect(State.data.tenseStats['present_simple'].correct).toBe(1);
      expect(State.data.tenseStats['present_simple'].total).toBe(1);
    });

    test('devrait enregistrer une réponse incorrecte', () => {
      State.recordAnswer('past_simple', false);

      expect(State.data.totalExercises).toBe(1);
      expect(State.data.incorrectAnswers).toBe(1);
      expect(State.data.currentStreak).toBe(0);
      expect(State.data.tenseStats['past_simple'].correct).toBe(0);
      expect(State.data.tenseStats['past_simple'].total).toBe(1);
    });

    test('devrait mettre à jour la meilleure série', () => {
      State.recordAnswer('present_simple', true);
      State.recordAnswer('present_simple', true);
      State.recordAnswer('present_simple', true);

      expect(State.data.currentStreak).toBe(3);
      expect(State.data.bestStreak).toBe(3);

      // Une réponse incorrecte réinitialise la série actuelle
      State.recordAnswer('present_simple', false);
      expect(State.data.currentStreak).toBe(0);
      expect(State.data.bestStreak).toBe(3); // La meilleure série est conservée
    });
  });

  describe('favorites', () => {
    test('devrait ajouter un favori', () => {
      State.addFavorite('present_simple_rule');
      expect(State.data.favorites).toContain('present_simple_rule');
      expect(State.data.favorites.length).toBe(1);
    });

    test('ne devrait pas ajouter un favori en double', () => {
      State.addFavorite('irregular_verb_go');
      State.addFavorite('irregular_verb_go');
      expect(State.data.favorites.length).toBe(1);
    });

    test('devrait supprimer un favori', () => {
      State.addFavorite('test_item');
      expect(State.isFavorite('test_item')).toBe(true);

      State.removeFavorite('test_item');
      expect(State.isFavorite('test_item')).toBe(false);
    });

    test('devrait vérifier si un élément est favori', () => {
      expect(State.isFavorite('new_item')).toBe(false);

      State.addFavorite('new_item');
      expect(State.isFavorite('new_item')).toBe(true);
    });
  });

  describe('getWeakPoints', () => {
    test('devrait identifier les points faibles', () => {
      // Simuler des réponses avec faible précision
      for (let i = 0; i < 5; i++) {
        State.recordAnswer('past_perfect', i < 2); // 2/5 correct = 40%
      }

      const weakPoints = State.getWeakPoints();
      expect(weakPoints.length).toBeGreaterThan(0);

      const pastPerfectWeak = weakPoints.find((wp) => wp.tenseId === 'past_perfect');
      if (pastPerfectWeak) {
        expect(pastPerfectWeak.accuracy).toBeLessThan(0.7);
      }
    });

    test('devrait retourner un tableau vide sans données insuffisantes', () => {
      State.recordAnswer('present_simple', false);
      State.recordAnswer('present_simple', true);
      // Seulement 2 exercices, moins que le minimum de 3

      const weakPoints = State.getWeakPoints();
      const presentSimple = weakPoints.find((wp) => wp.tenseId === 'present_simple');
      expect(presentSimple).toBeUndefined();
    });
  });

  describe('completeLesson', () => {
    test('devrait marquer une leçon comme terminée et ajouter des XP', () => {
      const initialXP = State.data.xp;
      State.completeLesson('lesson_1');

      expect(State.data.completedLessons).toContain('lesson_1');
      expect(State.data.xp).toBe(initialXP + 25);
    });

    test('ne devrait pas ajouter des XP pour une leçon déjà complétée', () => {
      State.completeLesson('lesson_1');
      const xpAfterFirst = State.data.xp;

      State.completeLesson('lesson_1');
      expect(State.data.xp).toBe(xpAfterFirst); // Pas de XP supplémentaires
    });
  });

  describe('reset', () => {
    test('devrait réinitialiser toutes les données', () => {
      State.addXP(100);
      State.recordAnswer('test', true);
      State.addFavorite('fav');
      State.completeLesson('lesson_1');

      State.reset();

      expect(State.data.xp).toBe(0);
      expect(State.data.level).toBe(1);
      expect(State.data.totalExercises).toBe(0);
      expect(State.data.favorites.length).toBe(0);
      expect(State.data.completedLessons.length).toBe(0);
    });
  });
});

describe('ExerciseEngine - getConjugation', () => {
  describe('Present Simple', () => {
    test('devrait conjuguer correctement à la 3ème personne du singulier', () => {
      expect(ExerciseEngine.getConjugation('work', 'present_simple', 'He', true)).toBe('works');
      expect(ExerciseEngine.getConjugation('play', 'present_simple', 'She', true)).toBe('plays');
      expect(ExerciseEngine.getConjugation('study', 'present_simple', 'He', true)).toBe('studies');
      expect(ExerciseEngine.getConjugation('go', 'present_simple', 'She', true)).toBe('goes');
      expect(ExerciseEngine.getConjugation('watch', 'present_simple', 'He', true)).toBe('watches');
    });

    test('devrait conjuguer correctement sans la 3ème personne', () => {
      expect(ExerciseEngine.getConjugation('work', 'present_simple', 'I', false)).toBe('work');
      expect(ExerciseEngine.getConjugation('work', 'present_simple', 'They', false)).toBe('work');
      expect(ExerciseEngine.getConjugation('work', 'present_simple', 'We', false)).toBe('work');
    });
  });

  describe('Past Simple', () => {
    test('devrait conjuguer les verbes réguliers', () => {
      expect(ExerciseEngine.getConjugation('work', 'past_simple', 'I', false)).toBe('worked');
      expect(ExerciseEngine.getConjugation('play', 'past_simple', 'He', true)).toBe('played');
      expect(ExerciseEngine.getConjugation('live', 'past_simple', 'I', false)).toBe('lived');
      expect(ExerciseEngine.getConjugation('study', 'past_simple', 'They', false)).toBe('studied');
    });

    test('devrait conjuguer les verbes irréguliers', () => {
      expect(ExerciseEngine.getConjugation('go', 'past_simple', 'I', false)).toBe('went');
      expect(ExerciseEngine.getConjugation('write', 'past_simple', 'She', true)).toBe('wrote');
    });
  });

  describe('Present Perfect', () => {
    test('devrait utiliser le participe passé', () => {
      expect(ExerciseEngine.getConjugation('work', 'present_perfect', 'I', false)).toBe('worked');
      expect(ExerciseEngine.getConjugation('go', 'present_perfect', 'She', true)).toBe('gone');
      expect(ExerciseEngine.getConjugation('write', 'present_perfect', 'I', false)).toBe('written');
    });
  });

  describe('Continuous tenses', () => {
    test('devrait ajouter -ing pour les temps continus', () => {
      expect(ExerciseEngine.getConjugation('work', 'present_continuous', 'I', false)).toBe(
        'working',
      );
      expect(ExerciseEngine.getConjugation('play', 'past_continuous', 'He', true)).toBe('playing');
      expect(ExerciseEngine.getConjugation('study', 'future_continuous', 'They', false)).toBe(
        'studying',
      );
      expect(ExerciseEngine.getConjugation('make', 'present_continuous', 'I', false)).toBe(
        'making',
      );
      expect(ExerciseEngine.getConjugation('lie', 'present_continuous', 'He', true)).toBe('lying');
    });
  });

  describe('Future tenses', () => {
    test('devrait retourner la base verbale pour future_will', () => {
      expect(ExerciseEngine.getConjugation('work', 'future_will', 'I', false)).toBe('work');
      expect(ExerciseEngine.getConjugation('go', 'future_will', 'She', true)).toBe('go');
    });

    test('devrait retourner la base verbale pour future_going_to', () => {
      expect(ExerciseEngine.getConjugation('work', 'future_going_to', 'I', false)).toBe('work');
    });
  });
});

describe('ExerciseEngine - generateQuestions', () => {
  test('devrait générer le bon nombre de questions', () => {
    const questions = ExerciseEngine.generateQuestions('qcm', [], 'easy', 5);
    expect(questions.length).toBeLessThanOrEqual(5);
    expect(questions.length).toBeGreaterThan(0);
  });

  test('devrait générer des questions avec un type spécifique', () => {
    const questions = ExerciseEngine.generateQuestions('qcm', ['present_simple'], 'easy', 3);
    questions.forEach((q) => {
      expect(q.type).toBe('qcm');
      expect(q.sentence).toBeDefined();
      expect(q.options).toBeDefined();
    });
  });

  test('devrait générer des questions de type fill', () => {
    const questions = ExerciseEngine.generateQuestions('fill', ['past_simple'], 'easy', 2);
    questions.forEach((q) => {
      expect(q.type).toBe('fill');
      expect(q.answer).toBeDefined();
    });
  });

  test("devrait inclure l'ID du temps dans chaque question", () => {
    const questions = ExerciseEngine.generateQuestions('qcm', ['present_simple'], 'easy', 3);
    questions.forEach((q) => {
      expect(q.tenseId).toBeDefined();
    });
  });
});

describe('Spaced Repetition', () => {
  beforeEach(() => {
    State.data.spacedRepetition = {};
  });

  describe('recordAnswer met à jour la spaced repetition', () => {
    test("devrait augmenter l'intervalle pour une réponse correcte", () => {
      State.recordAnswer('present_simple', true);

      const sr = State.data.spacedRepetition['present_simple'];
      expect(sr.interval).toBeGreaterThan(1);
      expect(sr.ease).toBeGreaterThan(2.5);
    });

    test("devrait réinitialiser l'intervalle pour une réponse incorrecte", () => {
      State.recordAnswer('past_simple', false);

      const sr = State.data.spacedRepetition['past_simple'];
      expect(sr.interval).toBe(1);
      expect(sr.errors).toBeGreaterThan(0);
    });

    test('devrait planifier la prochaine révision', () => {
      const before = Date.now();
      State.recordAnswer('present_perfect', true);
      const after = Date.now();

      const sr = State.data.spacedRepetition['present_perfect'];
      expect(sr.nextReview).toBeGreaterThan(before);
      expect(sr.nextReview).toBeLessThanOrEqual(after + sr.interval * 60 * 1000);
    });
  });

  describe('getReviewQueue', () => {
    test('devrait retourner les éléments à réviser', () => {
      State.data.spacedRepetition['present_simple'] = {
        interval: 1,
        nextReview: 0, // Déjà dû
        ease: 2.5,
        errors: 0,
      };

      const queue = State.getReviewQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].tenseId).toBe('present_simple');
    });

    test('devrait trier par date de révision', () => {
      State.data.spacedRepetition['tense_1'] = {
        interval: 1,
        nextReview: 1000,
        ease: 2.5,
        errors: 0,
      };
      State.data.spacedRepetition['tense_2'] = {
        interval: 1,
        nextReview: 500,
        ease: 2.5,
        errors: 0,
      };
      State.data.spacedRepetition['tense_3'] = {
        interval: 1,
        nextReview: 1500,
        ease: 2.5,
        errors: 0,
      };

      const queue = State.getReviewQueue();
      expect(queue[0].tenseId).toBe('tense_2');
      expect(queue[1].tenseId).toBe('tense_1');
      expect(queue[2].tenseId).toBe('tense_3');
    });
  });
});

describe('APP_DATA Structure', () => {
  test('devrait avoir tous les temps définis', () => {
    const expectedTenses = [
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
    ];

    expectedTenses.forEach((tenseId) => {
      const tense = APP_DATA.tenses.find((t) => t.id === tenseId);
      expect(tense).toBeDefined();
      expect(tense.name).toBeDefined();
      expect(tense.nameFR).toBeDefined();
    });
  });

  test('devrait avoir des verbes irréguliers', () => {
    expect(APP_DATA.irregularVerbs.length).toBeGreaterThan(0);

    const go = APP_DATA.irregularVerbs.find((v) => v.base === 'go');
    expect(go).toBeDefined();
    expect(go.past).toBe('went');
    expect(go.pp).toBe('gone');
  });

  test('chaque temps devrait avoir une structure définie', () => {
    APP_DATA.tenses.forEach((tense) => {
      expect(tense.structure).toBeDefined();
      expect(tense.explanation).toBeDefined();
      expect(tense.examples).toBeDefined();
      expect(tense.examples.length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// Bloc #2 — Bug de streak dans checkStreak()
// Vérifie qu'un redoublement de series ne se produit pas au reload et que
// la notion de jours consécutifs / saut / premier lancement est correcte.
// ---------------------------------------------------------------------------
describe('checkStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('premier lancement démarre la série à 1', () => {
    vi.setSystemTime(new Date('2025-01-10T12:00:00'));
    State.data = { ...State.data, lastActiveDate: null, daysStreak: 0 };
    State.checkStreak();
    expect(State.data.daysStreak).toBe(1);
    expect(State.data.lastActiveDate).toBe('Fri Jan 10 2025');
  });

  test('jour consécutif incrémente la série', () => {
    vi.setSystemTime(new Date('2025-01-10T12:00:00'));
    State.data = {
      ...State.data,
      lastActiveDate: 'Thu Jan 09 2025',
      daysStreak: 2,
    };
    State.checkStreak();
    expect(State.data.daysStreak).toBe(3);
    expect(State.data.lastActiveDate).toBe('Fri Jan 10 2025');
  });

  test('jour même — ne double pas la série au reload', () => {
    vi.setSystemTime(new Date('2025-01-10T18:00:00'));
    State.data = {
      ...State.data,
      lastActiveDate: 'Fri Jan 10 2025',
      daysStreak: 4,
    };
    // reload 1
    State.checkStreak();
    expect(State.data.daysStreak).toBe(4);
    // reload 2 — plus tard dans la même journée
    vi.setSystemTime(new Date('2025-01-10T23:30:00'));
    State.checkStreak();
    expect(State.data.daysStreak).toBe(4);
    expect(State.data.lastActiveDate).toBe('Fri Jan 10 2025');
  });

  test('saut d\u2019un jour ne casse pas la série', () => {
    vi.setSystemTime(new Date('2025-01-11T08:00:00'));
    State.data = {
      ...State.data,
      lastActiveDate: 'Fri Jan 10 2025',
      daysStreak: 4,
    };
    State.checkStreak();
    expect(State.data.daysStreak).toBe(5);
    expect(State.data.lastActiveDate).toBe('Sat Jan 11 2025');
  });

  test('saut de plusieurs jours remet la série à 0', () => {
    vi.setSystemTime(new Date('2025-01-13T09:00:00'));
    State.data = {
      ...State.data,
      lastActiveDate: 'Fri Jan 10 2025',
      daysStreak: 6,
    };
    State.checkStreak();
    expect(State.data.daysStreak).toBe(0);
    expect(State.data.lastActiveDate).toBe('Mon Jan 13 2025');
  });
});

describe('app UI and data management', () => {
  test('updateUI refreshes XP, level, streak and badges', () => {
    const elements = new Map();
    const makeElement = () => ({ textContent: '', style: { width: '' } });
    [
      'headerXP',
      'headerLevel',
      'sidebarLevel',
      'sidebarXP',
      'sidebarXPBar',
      'streakCount',
      'streakPlural',
      'revisionBadge',
      'lessonsBadge',
    ].forEach((id) => {
      elements.set(id, makeElement());
    });
    global.document.getElementById = vi.fn((id) => elements.get(id) || null);

    State.data = {
      ...State.data,
      xp: 275,
      level: 3,
      daysStreak: 2,
      completedLessons: ['l_present_simple'],
    };
    State.getReviewQueue = vi.fn(() => [
      { tenseId: 'past_simple' },
      { tenseId: 'present_perfect' },
    ]);

    appWindow.updateUI();

    expect(elements.get('headerXP').textContent).toBe(275);
    expect(elements.get('headerLevel').textContent).toBe(3);
    expect(elements.get('sidebarLevel').textContent).toBe(3);
    expect(elements.get('sidebarXP').textContent).toBe('75 / 100 XP');
    expect(elements.get('sidebarXPBar').style.width).toBe('75%');
    expect(elements.get('streakCount').textContent).toBe(2);
    expect(elements.get('streakPlural').textContent).toBe('s');
    expect(elements.get('revisionBadge').textContent).toBe(2);
    expect(Number(elements.get('lessonsBadge').textContent)).toBeGreaterThan(0);
  });

  test('updateUI tolerates missing optional badges', () => {
    const elements = new Map();
    const makeElement = () => ({ textContent: '', style: { width: '' } });
    [
      'headerXP',
      'headerLevel',
      'sidebarLevel',
      'sidebarXP',
      'sidebarXPBar',
      'streakCount',
      'streakPlural',
    ].forEach((id) => {
      elements.set(id, makeElement());
    });
    global.document.getElementById = vi.fn((id) => elements.get(id) || null);

    State.data = { ...State.data, xp: 100, level: 2, daysStreak: 1, completedLessons: [] };
    State.getReviewQueue = vi.fn(() => []);

    expect(() => appWindow.updateUI()).not.toThrow();
    expect(elements.get('headerXP').textContent).toBe(100);
    expect(elements.get('streakPlural').textContent).toBe('');
  });

  test('resetProgress resets state after confirmation', () => {
    const originalDocument = global.document;
    State.data = { ...State.data, xp: 200 };
    global.confirm = vi.fn(() => true);
    appWindow.document.body.innerHTML = `
      <section class="page" id="page-dashboard"></section>
      <button class="nav-item" data-page="dashboard"></button>
      <div id="pageTitle"></div>
      <div id="dashXP"></div><div id="dashLevel"></div>
      <div id="dashExercises"></div><div id="dashAccuracy"></div>
      <div id="dashNextLesson"></div><div id="dashRevisionQueue"></div>
      <div id="revisionBadge"></div><div id="dashChart"></div>
    `;
    global.document = appWindow.document;
    try {
      appWindow.resetProgress();
    } finally {
      global.document = originalDocument;
      appWindow.document.body.innerHTML = '';
    }

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(State.data.xp).toBe(0);
  });

  test('resetProgress leaves state untouched when confirmation is declined', () => {
    State.data = { ...State.data, xp: 200 };
    global.confirm = vi.fn(() => false);

    appWindow.resetProgress();

    expect(State.data.xp).toBe(200);
  });

  test('importData ignores an empty file selection', () => {
    const input = { type: '', accept: '', onchange: null, click: vi.fn() };
    const originalCreateElement = global.document.createElement;
    global.document.createElement = vi.fn((tag) =>
      tag === 'input' ? input : originalCreateElement(tag),
    );

    appWindow.importData();
    input.click.mockImplementationOnce(() => {
      input.onchange({ target: { files: [] } });
    });

    expect(input.type).toBe('file');
    expect(input.accept).toBe('.json');
    input.click();
    expect(State.data.xp).toBe(0);

    global.document.createElement = originalCreateElement;
  });

  test('importData applies a valid JSON backup', () => {
    const input = { type: '', accept: '', onchange: null, click: vi.fn() };
    const reader = { onload: null, readAsText: vi.fn() };
    const toastContainer = { appendChild: vi.fn() };
    const originalCreateElement = global.document.createElement;
    const originalGetElementById = global.document.getElementById;
    const originalFileReader = global.FileReader;
    global.document.createElement = vi.fn((tag) => {
      if (tag === 'input') return input;
      if (tag === 'div') return { className: '', textContent: '', style: {}, remove: vi.fn() };
      return originalCreateElement(tag);
    });
    global.document.getElementById = vi.fn((id) =>
      id === 'toastContainer' ? toastContainer : originalGetElementById(id),
    );
    global.FileReader = class {
      constructor() {
        return reader;
      }
    };
    const originalSave = State.save;
    const originalUpdateUI = appWindow.updateUI;
    State.save = vi.fn();
    appWindow.updateUI = vi.fn();

    appWindow.importData();
    input.click.mockImplementationOnce(() => {
      input.onchange({ target: { files: [{ name: 'backup.json' }] } });
    });
    input.click();
    reader.onload({
      target: {
        result: JSON.stringify({ xp: 150, level: 2, settings: { theme: 'dark' } }),
      },
    });

    expect(reader.readAsText).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'backup.json' }),
    );
    expect(State.data.xp).toBe(150);
    expect(State.data.level).toBe(2);
    expect(State.data.settings.theme).toBe('dark');
    expect(State.save).toHaveBeenCalledTimes(1);

    State.save = originalSave;
    appWindow.updateUI = originalUpdateUI;
    global.FileReader = originalFileReader;
    global.document.createElement = originalCreateElement;
    global.document.getElementById = originalGetElementById;
  });

  test('importData shows an error toast for invalid JSON', () => {
    const input = { type: '', accept: '', onchange: null, click: vi.fn() };
    const reader = { onload: null, readAsText: vi.fn() };
    const toastContainer = { appendChild: vi.fn() };
    const originalCreateElement = global.document.createElement;
    const originalGetElementById = global.document.getElementById;
    const originalFileReader = global.FileReader;
    global.document.createElement = vi.fn((tag) => {
      if (tag === 'input') return input;
      if (tag === 'div') return { className: '', textContent: '', style: {}, remove: vi.fn() };
      return originalCreateElement(tag);
    });
    global.document.getElementById = vi.fn((id) =>
      id === 'toastContainer' ? toastContainer : originalGetElementById(id),
    );
    global.FileReader = class {
      constructor() {
        return reader;
      }
    };

    appWindow.importData();
    input.click.mockImplementationOnce(() => {
      input.onchange({ target: { files: [{ name: 'broken.json' }] } });
    });
    input.click();
    reader.onload({ target: { result: '{invalid json' } });

    expect(toastContainer.appendChild).toHaveBeenCalledTimes(1);
    expect(toastContainer.appendChild.mock.calls[0][0].textContent).toBe('❌ Fichier invalide');

    global.FileReader = originalFileReader;
    global.document.createElement = originalCreateElement;
    global.document.getElementById = originalGetElementById;
  });

  test('exportData creates a dated JSON download and shows success toast', () => {
    const click = vi.fn();
    const anchor = { href: '', download: '', click };
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    global.URL = { createObjectURL, revokeObjectURL };
    const originalGetElementById = global.document.getElementById;
    const originalCreateElement = global.document.createElement;
    global.document.getElementById = vi.fn((id) =>
      id === 'toastContainer' ? { appendChild: vi.fn() } : originalGetElementById(id),
    );
    global.document.createElement = vi.fn((tag) => {
      if (tag === 'a') return anchor;
      if (tag === 'div') return { className: '', textContent: '', style: {}, remove: vi.fn() };
      return originalCreateElement(tag);
    });
    try {
      appWindow.exportData();
    } finally {
      global.document.getElementById = originalGetElementById;
      global.document.createElement = originalCreateElement;
    }

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(anchor.href).toBe('blob:test');
    expect(anchor.download).toMatch(/^conjumaster_backup_\d{4}-\d{2}-\d{2}\.json$/);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});
