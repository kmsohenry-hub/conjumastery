// ============================================================
// MOTEUR DE CONJUGAISON PUR
// ============================================================

const VOWELS = 'aeiou';

const splitForms = (forms) =>
  forms
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Renvoie toutes les variantes BrE/AmE du past et du past participle.
 * Ex: learn -> { past: ['learnt','learned'], pp: ['learnt','learned'] }
 * Pour les verbes réguliers, renvoie un tableau à un seul élément.
 */
export function getAllIrregularForms(verbsByBase, verb) {
  const irreg = verbsByBase[verb];
  if (irreg) {
    return {
      past: splitForms(irreg.past),
      pp: splitForms(irreg.pp),
    };
  }
  const regularPast = getRegularPast(verb);
  return { past: [regularPast], pp: [regularPast] };
}

// Conserve la signature historique : retourne UNE forme (la première / forme principale).
export function getIrregularForms(verbsByBase, verb) {
  const all = getAllIrregularForms(verbsByBase, verb);
  return { past: all.past[0], pp: all.pp[0] };
}

export function getRegularPast(verb) {
  if (verb.endsWith('e')) return `${verb}d`;
  if (verb.endsWith('y') && !VOWELS.includes(verb[verb.length - 2]))
    return `${verb.slice(0, -1)}ied`;
  if (shouldDoubleFinalConsonant(verb)) return `${verb}${verb[verb.length - 1]}ed`;
  return `${verb}ed`;
}

export function getPresentSimpleForm(verb, is3rdSing) {
  if (!is3rdSing) return verb;
  if (
    verb.endsWith('s') ||
    verb.endsWith('ch') ||
    verb.endsWith('sh') ||
    verb.endsWith('x') ||
    verb.endsWith('o')
  )
    return `${verb}es`;
  if (verb.endsWith('y') && !VOWELS.includes(verb[verb.length - 2]))
    return `${verb.slice(0, -1)}ies`;
  return `${verb}s`;
}

export function getIngForm(verb) {
  if (verb.endsWith('ie')) return `${verb.slice(0, -2)}ying`;
  if (verb.endsWith('e') && verb !== 'be') return `${verb.slice(0, -1)}ing`;
  if (shouldDoubleFinalConsonant(verb)) return `${verb}${verb[verb.length - 1]}ing`;
  return `${verb}ing`;
}

/**
 * Polysyllabic verbs where the stress falls on the final syllable.
 * In these cases the final consonant is doubled (BrE + AmE agree).
 * Sources : Oxford, Cambridge dictionaries.
 */
const FINAL_STRESS_DOUBLE = new Set([
  'begin', 'forget', 'prefer', 'regret', 'compel', 'expel', 'propel',
  'defer', 'infer', 'occur', 'refer', 'transfer', 'confer',
  'admit', 'commit', 'permit', 'submit', 'control',
  'demur', 'distil', 'enrol', 'fulfil', 'instil',
  'rebel', 'equip',
]);

/**
 * Determines whether the final consonant of a verb should be doubled
 * before -ed / -ing suffixes, following British English rules.
 *
 * Rules:
 *   1. Must be CVC pattern (consonant-vowel-consonant).
 *   2. Monosyllables → always double (stop → stopped, run → running).
 *   3. Polysyllables → double only if final-syllable stress
 *      (begin → beginning, prefer → preferred).
 *   4. BrE exception: final 'l' after a single vowel always doubles
 *      regardless of stress (travel → travelled, cancel → cancelled).
 *
 * @param {string} verb - base form of the verb (lowercase).
 * @returns {boolean} true if the final consonant should be doubled.
 */
export function shouldDoubleFinalConsonant(verb) {
  if (verb.length < 3) return false;
  if (verb.endsWith('w') || verb.endsWith('x') || verb.endsWith('y')) return false;

  const last = verb[verb.length - 1];
  const previous = verb[verb.length - 2];
  const beforePrevious = verb[verb.length - 3];

  // Must be CVC: consonant-vowel-consonant
  if (VOWELS.includes(last) || !VOWELS.includes(previous)) return false;
  if (VOWELS.includes(beforePrevious)) return false;

  // Estimate syllable count via vowel groups
  const vowelGroups = verb.match(/[aeiou]+/g);
  const syllableCount = vowelGroups ? vowelGroups.length : 1;

  // Monosyllable CVC → always double
  if (syllableCount <= 1) return true;

  // BrE: final 'l' after single vowel always doubles (travel → travelled)
  if (last === 'l') return true;

  // Polysyllabic: double only if stress falls on the final syllable
  return FINAL_STRESS_DOUBLE.has(verb);
}

export function getConjugation(verbsByBase, verb, tenseId, subject, is3rdSing) {
  const { pp, past } = getIrregularForms(verbsByBase, verb);

  switch (tenseId) {
    case 'present_simple':
      return getPresentSimpleForm(verb, is3rdSing);
    case 'present_continuous':
      return getIngForm(verb);
    case 'present_perfect':
      return pp;
    case 'present_perfect_continuous':
      return getIngForm(verb);
    case 'past_simple':
      return past;
    case 'past_continuous':
      return getIngForm(verb);
    case 'past_perfect':
      return pp;
    case 'past_perfect_continuous':
      return getIngForm(verb);
    case 'future_will':
      return verb;
    case 'future_going_to':
      return verb;
    case 'future_continuous':
      return getIngForm(verb);
    case 'future_perfect':
      return pp;
    case 'future_perfect_continuous':
      return getIngForm(verb);
    default:
      return verb;
  }
}

export function getAuxiliary(tenseId, subject, is3rdSing, negative = false) {
  // Helper "to be" en fonction du sujet et du temps
  const beNow =
    subject === 'I'
      ? negative
        ? 'am not'
        : 'am'
      : is3rdSing
        ? negative
          ? "isn't"
          : 'is'
        : negative
          ? "aren't"
          : 'are';
  const bePast =
    subject === 'I' || is3rdSing ? (negative ? "wasn't" : 'was') : negative ? "weren't" : 'were';
  const hasHave = is3rdSing ? (negative ? "hasn't" : 'has') : negative ? "haven't" : 'have';

  const aux = {
    present_simple: is3rdSing ? (negative ? "doesn't" : 'does') : negative ? "don't" : 'do',
    present_continuous: beNow,
    present_perfect: hasHave,
    present_perfect_continuous: `${hasHave} been`,
    past_simple: negative ? "didn't" : 'did',
    past_continuous: bePast,
    past_perfect: negative ? "hadn't" : 'had',
    past_perfect_continuous: `${negative ? "hadn't" : 'had'} been`,
    future_will: negative ? "won't" : 'will',
    future_going_to:
      subject === 'I'
        ? negative
          ? 'am not going to'
          : 'am going to'
        : is3rdSing
          ? negative
            ? "isn't going to"
            : 'is going to'
          : negative
            ? "aren't going to"
            : 'are going to',
    future_continuous: `${negative ? "won't" : 'will'} be`,
    future_perfect: `${negative ? "won't" : 'will'} have`,
    future_perfect_continuous: `${negative ? "won't" : 'will'} have been`,
    conditional_0: is3rdSing ? (negative ? "doesn't" : 'does') : negative ? "don't" : 'do',
    conditional_1: negative ? "won't" : 'will',
    conditional_2: negative ? "wouldn't" : 'would',
    conditional_3: `${negative ? "wouldn't" : 'would'} have`,
    mixed_conditional: negative ? "wouldn't" : 'would',
  };

  return aux[tenseId] || '';
}
