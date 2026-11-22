const SPELLING_EQUIVALENTS = [
  [/\bgotten\b/g, 'got'],
  [/\blearned\b/g, 'learnt'],
  [/\bdreamed\b/g, 'dreamt'],
  [/\bburned\b/g, 'burnt'],
  [/\bspelled\b/g, 'spelt'],
  [/\bsmelled\b/g, 'smelt'],
  [/\bspoiled\b/g, 'spoilt'],
  [/\bspilled\b/g, 'spilt'],
  [/\bleaped\b/g, 'leapt'],
  [/\bleaned\b/g, 'leant'],
  [/\bkneeled\b/g, 'knelt'],
  [/\btraveled\b/g, 'travelled'],
  [/\btraveling\b/g, 'travelling'],
  [/\btraveler(s?)\b/g, 'traveller$1'],
  [/\bcanceled\b/g, 'cancelled'],
  [/\bcanceling\b/g, 'cancelling'],
  [/\bmodeled\b/g, 'modelled'],
  [/\bmodeling\b/g, 'modelling'],
  [/\blabeled\b/g, 'labelled'],
  [/\blabeling\b/g, 'labelling'],
  [/\bsignaled\b/g, 'signalled'],
  [/\bsignaling\b/g, 'signalling'],
  [/\brealize([ds]?)\b/g, 'realise$1'],
  [/\brealizing\b/g, 'realising'],
  [/\bapologize([ds]?)\b/g, 'apologise$1'],
  [/\bapologizing\b/g, 'apologising'],
  [/\brecognize([ds]?)\b/g, 'recognise$1'],
  [/\brecognizing\b/g, 'recognising'],
  [/\borganize([ds]?)\b/g, 'organise$1'],
  [/\borganizing\b/g, 'organising'],
  [/\bmemorize([ds]?)\b/g, 'memorise$1'],
  [/\bmemorizing\b/g, 'memorising'],
  [/\banalyze([ds]?)\b/g, 'analyse$1'],
  [/\banalyzing\b/g, 'analysing'],
  [/\bpracticed\b/g, 'practised'],
  [/\bpracticing\b/g, 'practising'],
  [/\bcolor(s|ed|ing)?\b/g, 'colour$1'],
  [/\bfavor(s|ed)?\b/g, 'favour$1'],
  [/\bfavorite(s)?\b/g, 'favourite$1'],
  [/\bneighbor(s|hood)?\b/g, 'neighbour$1'],
  [/\bbehavior\b/g, 'behaviour'],
  [/\bhonor(s|ed)?\b/g, 'honour$1'],
  [/\bhumor\b/g, 'humour'],
  [/\bcenter(s|ed)?\b/g, 'centre$1'],
  [/\btheater(s)?\b/g, 'theatre$1'],
  [/\bmeter(s)?\b/g, 'metre$1'],
  [/\bliter(s)?\b/g, 'litre$1'],
  [/\bmovie(s)?\b/g, 'film$1'],
  [/\bvacation(s)?\b/g, 'holiday$1'],
  [/\bapartment(s)?\b/g, 'flat$1'],
  [/\belevator(s)?\b/g, 'lift$1'],
  [/\bsoccer\b/g, 'football'],
];

const UNAMBIGUOUS_CONTRACTIONS = [
  [/\bwon't\b/g, 'will not'],
  [/\bshan't\b/g, 'shall not'],
  [/\bcan't\b/g, 'can not'],
  [/\bcannot\b/g, 'can not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bdon't\b/g, 'do not'],
  [/\bdidn't\b/g, 'did not'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bwasn't\b/g, 'was not'],
  [/\bweren't\b/g, 'were not'],
  [/\bhasn't\b/g, 'has not'],
  [/\bhaven't\b/g, 'have not'],
  [/\bhadn't\b/g, 'had not'],
  [/\bwouldn't\b/g, 'would not'],
  [/\bcouldn't\b/g, 'could not'],
  [/\bshouldn't\b/g, 'should not'],
  [/\bmustn't\b/g, 'must not'],
  [/\bneedn't\b/g, 'need not'],
  [/\bmightn't\b/g, 'might not'],
  [/\bi'm\b/g, 'i am'],
  [/\b(you|we|they)'re\b/g, '$1 are'],
  [/\b(i|you|we|they)'ve\b/g, '$1 have'],
  [/\b(i|you|he|she|it|we|they|that|there)'ll\b/g, '$1 will'],
  [/\b(would|could|should|might|must)'ve\b/g, '$1 have'],
  [/\b(i|you|he|she|it|we|they)'d've\b/g, '$1 would have'],
  [/\blet's\b/g, 'let us'],
];

const UNAMBIGUOUS_S_SUBJECTS = /\b(he|she|it|that|there|here|what|who|where|when|how|why)'s\b/;

const GENERAL_S_CONTRACTION_PATTERN = new RegExp(
  "\\b([a-z]*[a-rtuvwy])(?<!ch)(?<!sh)'s(?=\\s+(?:" +
    '[a-z]+(?:ing|ed|en)\\b|' +
    '(?:been|got|gone|done|made|had|said|told|sold|held|built|sent|spent|lent|bent|meant|learnt|burnt|dealt|felt|kept|left|lost|met|paid|put|read|run|sat|set|shut|slept|stood|struck|stuck|sung|sunk|swum|taught|thought|caught|bought|brought|fought|sought|found|bound|wound|heard|hurt|cut|hit|let|cost|quit|split|spread|won|begun|drunk|rung|shrunk|sprung|stunk|come|become|overcome|fed|fled|led|bred|bled|sped|wed|dug|hung|clung|flung|slung|spun|stung|strung|swung|wrung|lit|shone|shot|spat|understood|withstood|laid)\\b|' +
    '(?:not|never|always|already|just|still|ever|almost|nearly|really|very|so|too|quite|a|an|the|in|on|at|from|to|for|with|by|of|under|near|into|off|through|across|around|before|after|since|until|here|there|up|out|over|back|away|home|ready|late|early|fine|good|great|happy|angry|tired|busy|sick|ill|cold|hot|warm|true|false|wrong|right|sure|dead|open|going|about|able)\\b))',
);

const NON_CONTRACTIBLE_BEFORE_IS_HAS = new Set([
  'a',
  'an',
  'the',
  'to',
  'of',
  'in',
  'on',
  'at',
  'for',
  'with',
  'from',
  'by',
  'and',
  'or',
  'but',
  'if',
  'not',
  'no',
  'my',
  'your',
  'her',
  'our',
  'their',
  'all',
  'some',
  'any',
  'be',
  'am',
  'are',
  'were',
  'do',
  'did',
  'can',
  'could',
  'will',
  'would',
  'shall',
  'should',
  'may',
  'might',
  'must',
  'have',
  'had',
]);

const EXPECTED_IS_HAS_PATTERN = /\b([a-z]+)\s+(?:is|has)(?=\s+\S)/g;

const COMPILED_SPELLING_RULES = SPELLING_EQUIVALENTS.map(([pattern, replacement]) => ({
  source: pattern.source,
  globalInsensitive: new RegExp(pattern.source, 'gi'),
  singleInsensitive: new RegExp(pattern.source, 'i'),
  replacement,
}));

const MAX_SLASH_VARIANTS = 64;

function applyCasePreservingReplacement(match, singleInsensitive, replacement) {
  const replaced = match.replace(singleInsensitive, replacement);
  if (match === match.toUpperCase()) {
    return replaced.toUpperCase();
  }
  if (match[0] === match[0].toUpperCase()) {
    return replaced[0].toUpperCase() + replaced.slice(1);
  }
  return replaced;
}

export function normalizeAnswer(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .toLowerCase()
    .replace(/[’'‘`]/g, "'")
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[«»""]/g, '')
    .replace(/\.{2,}/g, ' ')
    .replace(/[.,!?;:]+/g, ' ')
    .replace(/\s+-\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function canonicalizeGrammar(str) {
  let out = normalizeAnswer(str);
  for (const [pattern, replacement] of UNAMBIGUOUS_CONTRACTIONS) {
    out = out.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of SPELLING_EQUIVALENTS) {
    out = out.replace(pattern, replacement);
  }
  out = out.replace(/\b(said|told\s+(?:me|him|her|us|them|you))\s+that\b/g, '$1');
  return out.replace(/\s+/g, ' ').trim();
}

function expandSingleContractionPattern(set, singleRegex, replacements) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const current of Array.from(set)) {
      if (singleRegex.test(current)) {
        for (const rep of replacements) {
          const next = current.replace(singleRegex, `$1 ${rep}`);
          if (!set.has(next)) {
            set.add(next);
            changed = true;
          }
        }
      }
    }
  }
}

function expandAmbiguousContractions(str) {
  const base = canonicalizeGrammar(str);
  const results = new Set([base]);

  const rawNormalized = String(str)
    .toLowerCase()
    .replace(/[’'‘`]/g, "'")
    .trim();
  const commaMatch = rawNormalized.match(/^if\s+([^,]+),\s*(.+)$/);
  if (commaMatch) {
    results.add(canonicalizeGrammar(`${commaMatch[2]} if ${commaMatch[1]}`));
  }

  expandSingleContractionPattern(results, UNAMBIGUOUS_S_SUBJECTS, ['is', 'has']);
  expandSingleContractionPattern(results, GENERAL_S_CONTRACTION_PATTERN, ['is', 'has']);

  const dSinglePattern = /\b(i|you|he|she|it|we|they)'d\b/;
  expandSingleContractionPattern(results, dSinglePattern, ['would', 'had']);

  return results;
}

function expandSlashVariants(expectedAnswer) {
  if (!expectedAnswer.includes('/')) {
    return [expectedAnswer];
  }
  const spaceJoined = expectedAnswer
    .replace(/\s*\/\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const exactVariants = expectedAnswer
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);

  const parts = expectedAnswer.split(' ');
  let combinatorial = [''];
  for (const part of parts) {
    if (part.includes('/')) {
      const subparts = part
        .split('/')
        .map((s) => s.trim())
        .filter(Boolean);
      const next = [];
      for (const v of combinatorial) {
        for (const sub of subparts) {
          next.push((v + ' ' + sub).trim());
          if (next.length >= MAX_SLASH_VARIANTS) break;
        }
        if (next.length >= MAX_SLASH_VARIANTS) break;
      }
      combinatorial = next;
    } else {
      combinatorial = combinatorial.map((v) => (v + ' ' + part).trim());
    }
  }

  return Array.from(new Set([spaceJoined, ...exactVariants, ...combinatorial]));
}

function canContractBeforeIsHas(word) {
  if (!word || NON_CONTRACTIBLE_BEFORE_IS_HAS.has(word)) return false;
  if (/(?:s|x|z|ch|sh)$/.test(word)) return false;
  return true;
}

function addExpectedIsHasContractions(expectedForms) {
  let changed = true;
  while (changed && expectedForms.size < MAX_SLASH_VARIANTS) {
    changed = false;
    for (const current of Array.from(expectedForms)) {
      if (expectedForms.size >= MAX_SLASH_VARIANTS) break;
      EXPECTED_IS_HAS_PATTERN.lastIndex = 0;
      let match;
      while ((match = EXPECTED_IS_HAS_PATTERN.exec(current)) !== null) {
        const subject = match[1];
        if (!canContractBeforeIsHas(subject)) continue;
        const contracted =
          current.slice(0, match.index) +
          `${subject}'s` +
          current.slice(match.index + match[0].length);
        if (!expectedForms.has(contracted)) {
          expectedForms.add(contracted);
          changed = true;
          if (expectedForms.size >= MAX_SLASH_VARIANTS) break;
        }
      }
    }
  }
}

export function answerMatches(userAnswer, expectedAnswer) {
  if (typeof expectedAnswer !== 'string') return false;
  if (typeof userAnswer !== 'string' || !userAnswer.trim()) return false;

  const cleanedUser = userAnswer.includes('/') ? userAnswer.replace(/\s*\/\s*/g, ' ') : userAnswer;

  const userForms = expandAmbiguousContractions(cleanedUser);
  const candidates = expandSlashVariants(expectedAnswer);

  for (const candidate of candidates) {
    const expectedForms = expandAmbiguousContractions(candidate);
    addExpectedIsHasContractions(expectedForms);
    for (const uForm of userForms) {
      if (!uForm) continue;
      if (expectedForms.has(uForm)) return true;

      const uWithoutLeadingThat = uForm.replace(/^that\s+/, '');
      for (const eForm of expectedForms) {
        const reportedPrefixMatch = eForm.match(
          /^(?:he|she|they|i|we)\s+(?:said|told\s+\w+)\s+(.+)$/,
        );
        if (reportedPrefixMatch && reportedPrefixMatch[1] === uWithoutLeadingThat) {
          return true;
        }
      }
    }
  }

  return false;
}

export function detectAmericanisms(str) {
  if (typeof str !== 'string' || !str.trim()) return [];
  const normalized = normalizeAnswer(str);
  const differences = [];
  const seen = new Set();

  for (const { globalInsensitive, singleInsensitive, replacement } of COMPILED_SPELLING_RULES) {
    globalInsensitive.lastIndex = 0;
    let match;
    while ((match = globalInsensitive.exec(normalized)) !== null) {
      const usWord = match[0].toLowerCase();
      const ukWord = usWord.replace(singleInsensitive, replacement).toLowerCase();
      const key = `${usWord}->${ukWord}`;
      if (usWord !== ukWord && !seen.has(key)) {
        seen.add(key);
        differences.push({ us: usWord, uk: ukWord });
      }
    }
  }

  return differences;
}

export function getExpectedBritishForm(expectedAnswer) {
  if (typeof expectedAnswer !== 'string') return '';
  let cleaned = expectedAnswer.trim();
  if (cleaned.includes('/')) {
    const slashParts = cleaned
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);
    if (
      slashParts.length > 1 &&
      slashParts.every((p) => canonicalizeGrammar(p) === canonicalizeGrammar(slashParts[0]))
    ) {
      cleaned = slashParts[0];
    }
  }
  for (const { globalInsensitive, singleInsensitive, replacement } of COMPILED_SPELLING_RULES) {
    globalInsensitive.lastIndex = 0;
    cleaned = cleaned.replace(globalInsensitive, (match) =>
      applyCasePreservingReplacement(match, singleInsensitive, replacement),
    );
  }
  return cleaned;
}

export function checkAmericanEnglishUsage(userAnswer, expectedAnswer = '') {
  const differences = detectAmericanisms(userAnswer);
  const expectedBritishAnswer = getExpectedBritishForm(expectedAnswer);
  if (differences.length === 0) {
    return {
      isAmerican: false,
      differences: [],
      expectedBritishAnswer,
      notice: '',
    };
  }

  const pairsText = differences.map((d) => `« ${d.us} » → « ${d.uk} »`).join(', ');
  const notice = expectedBritishAnswer
    ? `Attention : vous avez utilisé l'anglais américain (${pairsText}). La réponse est acceptée, mais ce n'était pas le résultat attendu en anglais britannique : « ${expectedBritishAnswer} ».`
    : `Attention : vous avez utilisé l'anglais américain (${pairsText}). La réponse est acceptée, mais ce n'était pas le résultat attendu en anglais britannique.`;

  return {
    isAmerican: true,
    differences,
    expectedBritishAnswer,
    notice,
  };
}
