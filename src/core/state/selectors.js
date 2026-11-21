export function getWeakPoints(state) {
  const weak = [];
  const tenseStats = state?.tenseStats;
  if (!tenseStats || typeof tenseStats !== 'object') return weak;
  for (const tenseId in tenseStats) {
    if (!Object.prototype.hasOwnProperty.call(tenseStats, tenseId)) continue;
    const stats = tenseStats[tenseId];
    if (!stats || typeof stats !== 'object') continue;
    const total = Number(stats.total) || 0;
    const correct = Number(stats.correct) || 0;
    if (total < 3) continue;
    const accuracy = correct / total;
    if (accuracy < 0.7) {
      weak.push({ tenseId, accuracy, total, errors: Math.max(0, total - correct) });
    }
  }
  weak.sort((a, b) => a.accuracy - b.accuracy);
  return weak;
}

export function getReviewQueue(state, now = Date.now()) {
  const queue = [];
  const spacedRepetition = state?.spacedRepetition;
  if (!spacedRepetition || typeof spacedRepetition !== 'object') return queue;
  for (const [tenseId, data] of Object.entries(spacedRepetition)) {
    if (!data || typeof data !== 'object') continue;
    const nextReview = Number(data.nextReview);
    if (Number.isFinite(nextReview) && nextReview <= now) {
      queue.push({ tenseId, ...data });
    }
  }
  queue.sort((a, b) => a.nextReview - b.nextReview);
  return queue;
}
