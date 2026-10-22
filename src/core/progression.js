import { APP_DATA } from '../data/index.js';

export const UNLOCK_THRESHOLD = 75;

/**
 * Returns the flat, difficulty-graduated sequence of lessons across all modules,
 * starting with Present Simple (index 0).
 */
export function getOrderedLessons(modules = APP_DATA.modules) {
  if (!Array.isArray(modules)) return [];
  const ordered = [];
  modules.forEach((mod) => {
    if (!Array.isArray(mod?.lessons)) return;
    mod.lessons.forEach((lesson) => {
      ordered.push({
        ...lesson,
        moduleId: mod.id,
        moduleName: mod.name,
        moduleLevel: mod.level,
        orderIndex: ordered.length,
      });
    });
  });
  return ordered;
}

/**
 * Computes the user's progress and mastery status (threshold: 75%) for a lesson.
 */
export function getLessonProgress(stateData, lesson) {
  if (!lesson) {
    return { isCompleted: false, accuracy: 0, attempts: 0, isMastered: false };
  }
  const completedLessons = Array.isArray(stateData?.completedLessons)
    ? stateData.completedLessons
    : [];
  const isCompleted = completedLessons.includes(lesson.id);

  const stats = lesson.tenseId ? stateData?.tenseStats?.[lesson.tenseId] : null;
  const attempts = Number(stats?.total) || 0;
  const correct = Number(stats?.correct) || 0;
  const rawAccuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  const accuracy = isCompleted ? Math.max(rawAccuracy, 100) : rawAccuracy;
  const isMastered = isCompleted || (attempts > 0 && rawAccuracy >= UNLOCK_THRESHOLD);

  return {
    isCompleted,
    accuracy,
    rawAccuracy,
    attempts,
    isMastered,
  };
}

/**
 * Returns the previous lesson in the graduated curriculum, or null for the first lesson.
 */
export function getPreviousLesson(lessonId, modules = APP_DATA.modules) {
  const ordered = getOrderedLessons(modules);
  const idx = ordered.findIndex((l) => l.id === lessonId);
  if (idx <= 0) return null;
  return ordered[idx - 1];
}

/**
 * Determines whether a lesson is unlocked.
 * Lesson 0 (Present Simple) is always unlocked.
 * Each subsequent lesson unlocks sequentially once the previous lesson reaches >= 75% mastery.
 */
export function isLessonUnlocked(stateData, lessonId, modules = APP_DATA.modules) {
  const ordered = getOrderedLessons(modules);
  const idx = ordered.findIndex((l) => l.id === lessonId);
  if (idx === -1) return true;
  if (idx === 0) return true;

  const completedLessons = Array.isArray(stateData?.completedLessons)
    ? stateData.completedLessons
    : [];
  if (completedLessons.includes(lessonId)) return true;

  for (let i = 0; i < idx; i++) {
    const progress = getLessonProgress(stateData, ordered[i]);
    if (!progress.isMastered) {
      return false;
    }
  }
  return true;
}

/**
 * Determines whether a verb tense is unlocked in the graduated progression.
 */
export function isTenseUnlocked(stateData, tenseId, modules = APP_DATA.modules) {
  if (!tenseId) return true;
  const ordered = getOrderedLessons(modules);
  const lesson = ordered.find((l) => l.tenseId === tenseId);
  if (!lesson) return true;
  return isLessonUnlocked(stateData, lesson.id, modules);
}

/**
 * Returns all currently unlocked tense IDs in curriculum order.
 */
export function getUnlockedTenseIds(stateData, modules = APP_DATA.modules) {
  const ordered = getOrderedLessons(modules);
  const unlocked = ordered
    .filter((l) => l.tenseId && isLessonUnlocked(stateData, l.id, modules))
    .map((l) => l.tenseId);
  return unlocked.length > 0 ? unlocked : ['present_simple'];
}
