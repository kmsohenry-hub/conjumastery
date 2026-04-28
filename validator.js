(function attachValidator(global) {
  const contractionPatterns = [
    [/\bcan't\b/g, 'cannot'],
    [/\bwon't\b/g, 'will not'],
    [/\bn't\b/g, ' not'],
    [/\bI'm\b/gi, 'I am'],
    [/\bI've\b/gi, 'I have'],
    [/\bYou're\b/gi, 'You are'],
    [/\bHe's\b/gi, 'He is'],
    [/\bShe's\b/gi, 'She is'],
    [/\bWe're\b/gi, 'We are'],
    [/\bThey're\b/gi, 'They are'],
    [/\bI'd\b/gi, 'I would'],
    [/\bYou'd\b/gi, 'You would'],
    [/\bWe'd\b/gi, 'We would'],
    [/\bThey'd\b/gi, 'They would']
  ];

  const grammarHints = [
    { pattern: /\b(he|she|it)\s+[a-z]+\b/i, hint: 'Attention à la 3e personne du singulier (souvent -s au Present Simple).' },
    { pattern: /\bdid\s+\w+ed\b/i, hint: 'Après did/didn\'t, utilisez la base verbale.' },
    { pattern: /\b(he|she|it)\s+have\b/i, hint: 'Avec he/she/it, utilisez généralement "has".' }
  ];

  function normalize(text, expandContractions = true) {
    if (typeof text !== 'string') return '';
    let result = text
      .toLowerCase()
      .replace(/[‘’´`]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    if (expandContractions) {
      contractionPatterns.forEach(([pattern, replacement]) => {
        result = result.replace(pattern, replacement.toLowerCase());
      });
      result = result.replace(/\s+/g, ' ').trim();
    }

    return result;
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[a.length][b.length];
  }

  function toAnswersArray(expectedAnswer) {
    if (Array.isArray(expectedAnswer)) return expectedAnswer.filter(Boolean);
    if (typeof expectedAnswer === 'string') return expectedAnswer.split('|').map(a => a.trim()).filter(Boolean);
    return [];
  }

  function validate(userAnswer, expectedAnswer) {
    const acceptedAnswers = toAnswersArray(expectedAnswer);
    const normalizedUser = normalize(userAnswer);
    const compactUser = normalize(userAnswer, false);

    const exactVariant = acceptedAnswers.find(answer => normalize(answer) === normalizedUser);
    if (exactVariant) {
      const exactFormattingMatch = acceptedAnswers.some(answer => answer.trim() === String(userAnswer).trim());
      return {
        isCorrect: true,
        reason: exactFormattingMatch ? 'exact' : 'equivalent',
        acceptedAnswer: exactVariant,
        explanation: exactFormattingMatch
          ? 'Parfait, réponse exacte.'
          : 'Bonne réponse : forme équivalente acceptée (contraction/format).'
      };
    }

    const fuzzyCandidate = acceptedAnswers.find(answer => {
      const norm = normalize(answer);
      if (Math.abs(norm.length - normalizedUser.length) > 2) return false;
      const distance = levenshtein(norm, normalizedUser);
      return distance <= 1;
    });

    if (fuzzyCandidate) {
      return {
        isCorrect: true,
        reason: 'typo',
        acceptedAnswer: fuzzyCandidate,
        explanation: 'Bonne réponse (petite faute de frappe tolérée).'
      };
    }

    const strictCandidate = acceptedAnswers.find(answer => normalize(answer, false) === compactUser);
    if (strictCandidate) {
      return {
        isCorrect: true,
        reason: 'spacing',
        acceptedAnswer: strictCandidate,
        explanation: 'Bonne réponse : ponctuation/espaces normalisés.'
      };
    }

    const grammarHint = grammarHints.find(rule => rule.pattern.test(String(userAnswer || '')))?.hint;

    return {
      isCorrect: false,
      reason: grammarHint ? 'grammar' : 'wrong',
      acceptedAnswer: acceptedAnswers[0] || '',
      explanation: grammarHint || 'La conjugaison attendue est différente.'
    };
  }

  global.AnswerValidator = {
    normalize,
    validate,
    toAnswersArray
  };
})(window);
