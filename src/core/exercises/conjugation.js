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
  return `${verb}ing`;
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
  switch (tenseId) {
    case 'present_perfect':
      return is3rdSing ? 'has' : 'have';
    case 'past_perfect':
      return 'had';
    case 'future_will':
      return 'will';
    case 'future_going_to':
      return subject === 'I' ? 'am going to' : is3rdSing ? 'is going to' : 'are going to';
    default:
      return '';
  }
}
