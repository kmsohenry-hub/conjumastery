export function getWeakPoints(state) {
  const weak = [];
  for (const tenseId in state.tenseStats) {
    if (!Object.prototype.hasOwnProperty.call(state.tenseStats, tenseId)) continue;
    const stats = state.tenseStats[tenseId];
    const accuracy = stats.correct / stats.total;
    if (stats.total >= 3 && accuracy < 0.7) {
      weak.push({ tenseId, accuracy, total: stats.total, errors: stats.total - stats.correct });
    }
  }
  weak.sort((a, b) => a.accuracy - b.accuracy);
  return weak;
}

export function getReviewQueue(state, now = Date.now()) {
  const queue = [];
  for (const [tenseId, data] of Object.entries(state.spacedRepetition)) {
    if (data.nextReview <= now) {
      queue.push({ tenseId, ...data });
    }
  }
  queue.sort((a, b) => a.nextReview - b.nextReview);
  return queue;
}
