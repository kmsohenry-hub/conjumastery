import { createStore, mergeStates } from './store.js';
import { loadState, saveState, migrateState } from '../persistence/storage.js';
import {
  getWeakPoints as getWeakPointsSelector,
  getReviewQueue as getReviewQueueSelector,
} from './selectors.js';

let storageSyncInitialized = false;

/**
 * Configure la synchronisation d'état automatique inter-onglets via l'événement 'storage'.
 */
export function setupStorageSync() {
  if (typeof window === 'undefined' || !window.addEventListener || storageSyncInitialized) {
    return;
  }
  storageSyncInitialized = true;

  window.addEventListener('storage', (event) => {
    if (event.key === 'conjumaster_data' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        const incoming = migrateState(parsed);
        State.syncExternalState(incoming);
      } catch {
        // noop
      }
    }
  });
}

const store = createStore();
store.subscribe(() => {
  if (typeof window !== 'undefined' && typeof window.updateUI === 'function') {
    window.updateUI();
  }
});

const State = {
  sessionPromotedTenses: new Set(),
  resetSessionPromotions() {
    this.sessionPromotedTenses.clear();
  },
  get data() {
    return store.getState();
  },
  set data(newState) {
    store.setState(newState);
  },
  subscribe(listener) {
    return store.subscribe(listener);
  },
  init() {
    const saved = loadState('conjumaster_data');
    if (saved) {
      store.setState(saved);
    }
    this.syncStreakOnLoad();
    this.save();
    setupStorageSync();
  },
  save() {
    const success = saveState('conjumaster_data', store.getState());
    if (!success) {
      try {
        window.dispatchEvent(
          new window.CustomEvent('conjumaster:save-error', {
            detail: { key: 'conjumaster_data' },
          }),
        );
      } catch {
        // fallback
      }
    }
    return success;
  },
  syncExternalState(incoming) {
    if (!incoming || typeof incoming !== 'object') return;
    const merged = mergeStates(store.getState(), incoming);
    store.setState(merged);
  },
  syncStreakOnLoad() {
    const state = store.getState();
    const todayStr = new Date().toDateString();

    if (state.lastActiveDate) {
      const msPerDay = 24 * 60 * 60 * 1000;
      const todayMidnight = new Date(todayStr).getTime();
      const lastMidnight = new Date(state.lastActiveDate).getTime();
      const diff = Math.round((todayMidnight - lastMidnight) / msPerDay);

      if (diff > 1) {
        // Série rompue si plus d'un jour s'est écoulé sans activité pédagogique
        store.setState({ daysStreak: 0 });
      }
    }
  },
  checkStreak() {
    const state = store.getState();
    const todayStr = new Date().toDateString();

    if (state.lastActiveDate === todayStr) return;

    if (state.lastActiveDate) {
      const msPerDay = 24 * 60 * 60 * 1000;
      const todayMidnight = new Date(todayStr).getTime();
      const lastMidnight = new Date(state.lastActiveDate).getTime();
      const diff = Math.round((todayMidnight - lastMidnight) / msPerDay);

      if (diff === 1) {
        // Jour consécutif — incrémente et marque aujourd'hui.
        store.setState({ daysStreak: state.daysStreak + 1, lastActiveDate: todayStr });
      } else if (diff > 1) {
        // Série brisée — la nouvelle activité démarre une nouvelle série.
        store.setState({ daysStreak: 1, lastActiveDate: todayStr });
      }
    } else {
      store.setState({ daysStreak: 1, lastActiveDate: todayStr });
    }
  },
  addXP(amount) {
    this.checkStreak();
    store.addXP(amount);
    this.save();
  },
  recordAnswer(tenseId, correct) {
    this.checkStreak();
    const previousSR = correct ? store.getState().spacedRepetition?.[tenseId] : null;
    const alreadyPromoted = correct && this.sessionPromotedTenses.has(tenseId);
    if (correct && !alreadyPromoted) {
      this.sessionPromotedTenses.add(tenseId);
    } else if (!correct) {
      this.sessionPromotedTenses.delete(tenseId);
    }
    store.recordAnswer(tenseId, correct);
    if (alreadyPromoted && previousSR) {
      const currentSR = store.getState().spacedRepetition;
      store.setState({
        spacedRepetition: {
          ...currentSR,
          [tenseId]: {
            ...currentSR[tenseId],
            interval: previousSR.interval,
            ease: previousSR.ease,
            nextReview: previousSR.nextReview,
          },
        },
      });
    }
    this.save();
  },
  completeLesson(lessonId) {
    this.checkStreak();
    store.completeLesson(lessonId);
    this.save();
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
  reset() {
    this.sessionPromotedTenses.clear();
    store.reset();
    this.save();
  },
};

export { State };
