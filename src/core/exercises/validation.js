export function normalizeAnswer(str) {
  return str
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function answerMatches(userAnswer, expectedAnswer) {
  if (typeof expectedAnswer !== 'string') return false;
  const userNorm = normalizeAnswer(userAnswer);

  if (expectedAnswer.includes('/')) {
      // First try just splitting by slash, assuming exact variants
      // This is for "dreamt/dreamed" or "learnt / learned"
      const exactVariants = expectedAnswer.split('/').map(normalizeAnswer);
      if (exactVariants.includes(userNorm)) {
          return true;
      }

      // If not matched, try combinatorial (for sentences like "I dreamt/dreamed of it")
      const parts = expectedAnswer.split(' ');
      let variants = [''];

      for (const part of parts) {
          if (part.includes('/')) {
              const subparts = part.split('/').map(s => s.trim()).filter(Boolean);
              const newVariants = [];
              for (const v of variants) {
                  for (const sub of subparts) {
                      newVariants.push((v + ' ' + sub).trim());
                  }
              }
              variants = newVariants;
          } else {
              variants = variants.map(v => (v + ' ' + part).trim());
          }
      }
      return variants.map(v => normalizeAnswer(v)).includes(userNorm);
  }

  return userNorm === normalizeAnswer(expectedAnswer);
}
