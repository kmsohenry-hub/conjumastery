/**
 * Tests unitaires pour ConjuMaster UK
 * Testent les fonctionnalités principales de l'application
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

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
  remove: vi.fn()
});

// Mock DOM & globals before importing the application module.
global.window = global;
global.document = {
  addEventListener: vi.fn(),
  createElement: vi.fn(createMockElement),
  getElementById: vi.fn(() => createMockElement()),
  documentElement: { setAttribute: vi.fn() },
  body: { appendChild: vi.fn() },
  DOMContentLoaded: 'DOMContentLoaded'
};
global.localStorage = {
  store: {},
  clear() { this.store = {}; },
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); },
  removeItem(key) { delete this.store[key]; }
};
global.Notification = {
  permission: 'granted',
  requestPermission: vi.fn().mockResolvedValue('granted')
};

const { State, ExerciseEngine, APP_DATA } = await import('../app.js');

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
    settings: { theme: 'light' }
  };
  localStorage.clear();
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

    test('devrait enregistrer l\'activité dans le log', () => {
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
      
      const pastPerfectWeak = weakPoints.find(wp => wp.tenseId === 'past_perfect');
      if (pastPerfectWeak) {
        expect(pastPerfectWeak.accuracy).toBeLessThan(0.7);
      }
    });

    test('devrait retourner un tableau vide sans données insuffisantes', () => {
      State.recordAnswer('present_simple', false);
      State.recordAnswer('present_simple', true);
      // Seulement 2 exercices, moins que le minimum de 3
      
      const weakPoints = State.getWeakPoints();
      const presentSimple = weakPoints.find(wp => wp.tenseId === 'present_simple');
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
      expect(ExerciseEngine.getConjugation('work', 'present_continuous', 'I', false)).toBe('working');
      expect(ExerciseEngine.getConjugation('play', 'past_continuous', 'He', true)).toBe('playing');
      expect(ExerciseEngine.getConjugation('study', 'future_continuous', 'They', false)).toBe('studying');
      expect(ExerciseEngine.getConjugation('make', 'present_continuous', 'I', false)).toBe('making');
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
    questions.forEach(q => {
      expect(q.type).toBe('qcm');
      expect(q.sentence).toBeDefined();
      expect(q.options).toBeDefined();
    });
  });

  test('devrait générer des questions de type fill', () => {
    const questions = ExerciseEngine.generateQuestions('fill', ['past_simple'], 'easy', 2);
    questions.forEach(q => {
      expect(q.type).toBe('fill');
      expect(q.answer).toBeDefined();
    });
  });

  test('devrait inclure l\'ID du temps dans chaque question', () => {
    const questions = ExerciseEngine.generateQuestions('qcm', ['present_simple'], 'easy', 3);
    questions.forEach(q => {
      expect(q.tenseId).toBeDefined();
    });
  });
});

describe('Spaced Repetition', () => {
  beforeEach(() => {
    State.data.spacedRepetition = {};
  });

  describe('updateSpacedRepetition', () => {
    test('devrait augmenter l\'intervalle pour une réponse correcte', () => {
      State.updateSpacedRepetition('present_simple', true);
      
      const sr = State.data.spacedRepetition['present_simple'];
      expect(sr.interval).toBeGreaterThan(1);
      expect(sr.ease).toBeGreaterThan(2.5);
    });

    test('devrait réinitialiser l\'intervalle pour une réponse incorrecte', () => {
      State.updateSpacedRepetition('past_simple', false);
      
      const sr = State.data.spacedRepetition['past_simple'];
      expect(sr.interval).toBe(1);
      expect(sr.errors).toBeGreaterThan(0);
    });

    test('devrait planifier la prochaine révision', () => {
      const before = Date.now();
      State.updateSpacedRepetition('present_perfect', true);
      const after = Date.now();
      
      const sr = State.data.spacedRepetition['present_perfect'];
      expect(sr.nextReview).toBeGreaterThan(before);
      expect(sr.nextReview).toBeLessThanOrEqual(after + sr.interval * 60 * 1000);
    });
  });

  describe('getReviewQueue', () => {
    test('devrait retourner les éléments à réviser', () => {
      // Ajouter un élément avec une révision due maintenant
      State.data.spacedRepetition['present_simple'] = {
        interval: 1,
        nextReview: 0, // Déjà dû
        ease: 2.5,
        errors: 0
      };
      
      const queue = State.getReviewQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].tenseId).toBe('present_simple');
    });

    test('devrait trier par date de révision', () => {
      State.data.spacedRepetition['tense_1'] = { interval: 1, nextReview: 1000, ease: 2.5, errors: 0 };
      State.data.spacedRepetition['tense_2'] = { interval: 1, nextReview: 500, ease: 2.5, errors: 0 };
      State.data.spacedRepetition['tense_3'] = { interval: 1, nextReview: 1500, ease: 2.5, errors: 0 };
      
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
      'present_simple', 'present_continuous', 'present_perfect', 'present_perfect_continuous',
      'past_simple', 'past_continuous', 'past_perfect', 'past_perfect_continuous',
      'future_will', 'future_going_to', 'future_continuous', 'future_perfect', 'future_perfect_continuous'
    ];
    
    expectedTenses.forEach(tenseId => {
      const tense = APP_DATA.tenses.find(t => t.id === tenseId);
      expect(tense).toBeDefined();
      expect(tense.name).toBeDefined();
      expect(tense.nameFR).toBeDefined();
    });
  });

  test('devrait avoir des verbes irréguliers', () => {
    expect(APP_DATA.irregularVerbs.length).toBeGreaterThan(0);
    
    const go = APP_DATA.irregularVerbs.find(v => v.base === 'go');
    expect(go).toBeDefined();
    expect(go.past).toBe('went');
    expect(go.pp).toBe('gone');
  });

  test('chaque temps devrait avoir une structure définie', () => {
    APP_DATA.tenses.forEach(tense => {
      expect(tense.structure).toBeDefined();
      expect(tense.explanation).toBeDefined();
      expect(tense.examples).toBeDefined();
      expect(tense.examples.length).toBeGreaterThan(0);
    });
  });
});
