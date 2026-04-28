(function attachStateModel(global) {
  function createInitialState() {
    return {
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
      exerciseTypeStats: {},
      unlockedModes: ['qcm'],
      errorLog: [],
      activityLog: [],
      favorites: [],
      spacedRepetition: {},
      settings: { theme: 'light' }
    };
  }

  global.StateModel = { createInitialState };
})(window);
