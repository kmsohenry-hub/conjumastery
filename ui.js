(function attachUiHelpers(global) {
  function getFeedbackTitle(result) {
    if (!result.isCorrect) return '❌ Incorrect';
    if (result.reason === 'equivalent') return '✅ Correct (forme équivalente)';
    if (result.reason === 'typo') return '✅ Correct (typo tolérée)';
    return '✅ Correct !';
  }

  function lessonLockedMessage() {
    return 'Termine la leçon précédente pour débloquer celle-ci.';
  }

  global.UiHelpers = { getFeedbackTitle, lessonLockedMessage };
})(window);
