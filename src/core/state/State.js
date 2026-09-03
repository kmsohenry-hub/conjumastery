import { createStore, mergeStates } from './store.js';
import { loadState, saveState, migrateState } from '../persistence/storage.js';
import {
  getWeakPoints as getWeakPointsSelector,
  getReviewQueue as getReviewQueueSelector,
} from './selectors.js';

const store = createStore();
store.subscribe(() => {
  // We need to keep a reference to `data` getter to get state
});

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
  checkStreak() {
    const state = store.getState();
    const todayStr = new Date().toDateString();

    // Déjà comptabilisé aujourd'hui — on ne fait rien (évite la double
    // incrémentation au reload / re-init).
    if (state.lastActiveDate === todayStr) return;

    if (state.lastActiveDate) {
      // Calcul robuste du nombre de jours : on compare les dates à minuit
      // (UTC) pour éviter les erreurs de changement d'heure (DST).
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
      // diff < 0 (horloge incohérente / date future) → on ignore sans
      // modifier lastActiveDate pour ne pas casser une série valide.
    } else {
      // Premier lancement — démarre la série à 1.
      store.setState({ daysStreak: 1, lastActiveDate: todayStr });
    }
  },
  addXP(amount) {
    // Toute activité qui accorde des XP doit d'abord synchroniser la série
    // quotidienne, y compris lorsqu'un onglet est resté ouvert après minuit.
    this.checkStreak();
    store.addXP(amount);
    this.save();
  },
  recordAnswer(tenseId, correct) {
    // store.recordAnswer gère aussi la mise à jour de spacedRepetition.
    store.recordAnswer(tenseId, correct);
    this.save();
  },
  completeLesson(lessonId) {
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
    store.reset();
    this.save();
  },
};

export { store, State };
