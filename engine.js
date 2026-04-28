(function attachEngineHelpers(global) {
  function getAllLessons() {
    return (global.APP_DATA?.modules || []).flatMap(module => module.lessons || []);
  }

  function getUnlockedLessons(completedLessons = []) {
    const unlocked = [];
    (global.APP_DATA?.modules || []).forEach(module => {
      (module.lessons || []).forEach((lesson, index) => {
        const prevLesson = module.lessons[index - 1];
        const isCompleted = completedLessons.includes(lesson.id);
        const isUnlocked = index === 0 || isCompleted || completedLessons.includes(prevLesson?.id);
        if (isUnlocked) unlocked.push(lesson);
      });
    });
    return unlocked;
  }

  function getUnlockedTenseIds(completedLessons = []) {
    return getUnlockedLessons(completedLessons)
      .map(lesson => lesson.tenseId)
      .filter(Boolean);
  }

  function isLessonLocked(lessonId, completedLessons = []) {
    for (const module of global.APP_DATA?.modules || []) {
      const lessonIndex = (module.lessons || []).findIndex(lesson => lesson.id === lessonId);
      if (lessonIndex >= 0) {
        if (lessonIndex === 0) return false;
        const previousId = module.lessons[lessonIndex - 1]?.id;
        return !completedLessons.includes(previousId) && !completedLessons.includes(lessonId);
      }
    }
    return false;
  }

  global.ExercisePedagogy = {
    getAllLessons,
    getUnlockedLessons,
    getUnlockedTenseIds,
    isLessonLocked
  };
})(window);
