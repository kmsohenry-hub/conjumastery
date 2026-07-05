
import { createStore } from './store.js';
import { loadState, saveState } from '../persistence/storage.js';
import { getWeakPoints as getWeakPointsSelector, getReviewQueue as getReviewQueueSelector } from './selectors.js';

const store = createStore();
store.subscribe(() => {
  // We need to keep a reference to `data` getter to get state
});

const State = {
  get data() {
    return store.getState();
  },
  set data(newState) {
    store.setState(newState);
  },

  init() {
    const saved = loadState('conjumaster_data');
    if (saved) {
      store.setState(saved);
    }
    this.checkStreak();
    this.save();
  },

  save() {
    saveState('conjumaster_data', store.getState());
  },

  checkStreak() {
    const state = store.getState();
    const today = new Date().toDateString();
    if (state.lastActiveDate) {
      const last = new Date(state.lastActiveDate);
      const diff = Math.floor((new Date(today) - last) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        store.setState({ daysStreak: state.daysStreak + 1 });
      } else if (diff > 1) {
        store.setState({ daysStreak: 0 });
      }
    }
  },

  addXP(amount) {
    const oldLevel = store.getState().level;
    const newLevel = store.addXP(amount);
    if (newLevel > oldLevel) {
      window.showToast?.(`🎉 Niveau ${newLevel} atteint !`, 'success');
      window.launchConfetti?.();
    }
    this.save();
    window.updateUI?.();
  },

  recordAnswer(tenseId, correct) {
    // In store.js, recordAnswer also updates spacedRepetition.
    // If the old code calls both `State.recordAnswer` AND `State.updateSpacedRepetition`, it might double count.
    // Let's check how app.js uses it.
    store.recordAnswer(tenseId, correct);
    this.save();
  },

  completeLesson(lessonId) {
    const oldLevel = store.getState().level;
    const newState = store.completeLesson(lessonId);
    if (newState.level > oldLevel) {
      window.showToast?.(`🎉 Niveau ${newState.level} atteint !`, 'success');
      window.launchConfetti?.();
    }
    this.save();
    window.updateUI?.();
  },

  addFavorite(item) {
    if (!store.getState().favorites.includes(item)) {
      store.toggleFavorite(item);
      this.save();
    }
  },

  removeFavorite(item) {
    if (store.getState().favorites.includes(item)) {
      store.toggleFavorite(item);
      this.save();
    }
  },

  isFavorite(item) {
    return store.getState().favorites.includes(item);
  },

  getWeakPoints() {
    return getWeakPointsSelector(store.getState());
  },

  getReviewQueue() {
    return getReviewQueueSelector(store.getState());
  },

  updateSpacedRepetition(tenseId, correct) {
    // Kept for backward compatibility and tests.
    // In normal execution, this is handled by store.recordAnswer.
    const spacedRepetition = { ...store.getState().spacedRepetition };
    if (!spacedRepetition[tenseId]) {
      spacedRepetition[tenseId] = { interval: 1, nextReview: Date.now(), ease: 2.5, errors: 0 };
    }
    const sr = { ...spacedRepetition[tenseId] };
    if (correct) {
      sr.interval = Math.round(sr.interval * sr.ease);
      sr.ease += 0.1;
      sr.errors = Math.max(0, sr.errors - 1);
    } else {
      sr.interval = 1;
      sr.ease = Math.max(1.3, sr.ease - 0.2);
      sr.errors++;
    }
    sr.nextReview = Date.now() + sr.interval * 60 * 1000;
    spacedRepetition[tenseId] = sr;
    store.setState({ spacedRepetition });
    this.save();
  },

  reset() {
    store.reset();
    this.save();
    window.updateUI?.();
    window.showToast?.('Progression réinitialisée', 'info');
  },
};

export { store, State };
