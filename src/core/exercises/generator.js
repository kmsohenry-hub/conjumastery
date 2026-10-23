import { APP_DATA } from '../../data/index.js';
import {
  getIrregularForms,
  getRegularPast,
  getPresentSimpleForm,
  getIngForm,
  getConjugation,
  getAuxiliary,
} from './conjugation.js';
import { shuffle } from './shuffle.js';

function pickTemplate(templates, usedSentences) {
  if (!Array.isArray(templates) || templates.length === 0) return null;
  if (usedSentences && usedSentences.size > 0) {
    const unused = templates.filter((tpl) => {
      const key = tpl.sentence || tpl.wrong || tpl.fr || '';
      return !usedSentences.has(key);
    });
    if (unused.length > 0) {
      return unused[Math.floor(Math.random() * unused.length)];
    }
  }
  return templates[Math.floor(Math.random() * templates.length)];
}

export function buildFillAcceptedAnswers(sentence, answer) {
  if (!sentence || !answer) return [];
  const accepted = new Set();
  const cleanSentence = String(sentence).replace(/\s*\([^)]*\)/g, '');
  const blanks = (cleanSentence.match(/___/g) || []).length;
  const answerParts = String(answer).trim().split(/\s+/);

  if (blanks === 1) {
    const full = cleanSentence.replace('___', answer).replace(/\s+/g, ' ').trim();
    accepted.add(full);
    const prefixBeforeBlank = cleanSentence.split('___')[0].trim();
    if (prefixBeforeBlank) {
      accepted.add(`${prefixBeforeBlank} ${answer}`.replace(/\s+/g, ' ').trim());
    }
  } else if (blanks > 1 && answerParts.length >= blanks) {
    let idx = 0;
    const filled = cleanSentence
      .replace(/___/g, () => {
        idx += 1;
        if (idx < blanks) return answerParts[idx - 1];
        return answerParts.slice(idx - 1).join(' ');
      })
      .replace(/\s+/g, ' ')
      .trim();
    accepted.add(filled);
    // Also accept the span from first blank to last blank (e.g. "Did they win")
    const spanRegex = new RegExp(
      `${answerParts[0]}\\s+(.+?)\\s+${answerParts.slice(1).join('\\s+')}`,
      'i',
    );
    const spanMatch = filled.match(spanRegex);
    if (spanMatch) {
      accepted.add(`${answerParts[0]} ${spanMatch[1]} ${answerParts.slice(1).join(' ')}`);
    }
  }

  return Array.from(accepted);
}

export function generatePassiveQuestion(indexHint) {
  const examples = APP_DATA.passiveInfo?.examples || [
    { tense: 'Present Simple', active: 'They build houses.', passive: 'Houses are built.' },
  ];
  const item =
    typeof indexHint === 'number'
      ? examples[indexHint % examples.length]
      : examples[Math.floor(Math.random() * examples.length)];
  const acceptedAnswers = [item.passive, item.altPassive].filter(Boolean);
  return {
    type: 'transform',
    sentence: `Transformez à la voix passive :\n"${item.active}"`,
    answer: item.passive,
    acceptedAnswers,
    tenseId: 'passive_voice',
    explanation: `À la voix passive : "${item.passive}" (${item.tense})`,
  };
}

export function generateReportedQuestion(indexHint) {
  const rules = APP_DATA.reportedSpeech?.rules || [
    { direct: 'I am happy', reported: 'He said he was happy', example: 'Present -> Past' },
  ];
  const item =
    typeof indexHint === 'number'
      ? rules[indexHint % rules.length]
      : rules[Math.floor(Math.random() * rules.length)];

  if (item.example && item.example.includes('→')) {
    const [rawDirect, rawReported] = item.example.split('→').map((s) => s.trim());
    const directClean = rawDirect.replace(/^["«]|["»]$/g, '').trim();
    const reportedClean = rawReported.trim();
    const prefixMatch = reportedClean.match(/^((?:He|She|They|I|We)\s+said)/i);
    const promptHint = prefixMatch ? ` (${prefixMatch[1]}...)` : '';
    const ruleSummary = `${item.direct.replace('→', '').trim()} → ${item.reported}`;

    return {
      type: 'transform',
      sentence: `Transformez au discours indirect :\n"${directClean}"${promptHint}`,
      answer: reportedClean,
      acceptedAnswers: [reportedClean, item.reported].filter(Boolean),
      tenseId: 'reported_speech',
      explanation: `Au discours indirect : "${reportedClean}" (${ruleSummary})`,
    };
  }

  return {
    type: 'transform',
    sentence: `Transformez au discours indirect :\n"${item.direct}"`,
    answer: item.reported,
    acceptedAnswers: [item.reported],
    tenseId: 'reported_speech',
    explanation: `Au discours indirect : "${item.reported}" (${item.example})`,
  };
}

function buildSentenceForTense(tenseId, subj, verb, is3rdSing, context = 'practice') {
  const ing = getIngForm(verb);
  const { past, pp } = getIrregularForms(APP_DATA.verbsByBase, verb);
  const present = getPresentSimpleForm(verb, is3rdSing, subj);
  const beNow = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
  const bePast = subj === 'I' || is3rdSing ? 'was' : 'were';
  const hasHave = is3rdSing ? 'has' : 'have';
  const pastForm = verb === 'be' ? bePast : past;
  const cond2Past = verb === 'be' ? 'were' : pastForm;

  const sentences = {
    present_simple: `${subj} ${present} every day.`,
    present_continuous: `${subj} ${beNow} ${ing} right now.`,
    present_perfect: `${subj} ${hasHave} ${pp} already.`,
    present_perfect_continuous: `${subj} ${hasHave} been ${ing} for two hours.`,
    past_simple: `${subj} ${pastForm} yesterday.`,
    past_continuous: `${subj} ${bePast} ${ing} when I arrived.`,
    past_perfect: `${subj} had ${pp} before I arrived.`,
    past_perfect_continuous: `${subj} had been ${ing} for two hours before I arrived.`,
    future_will: `${subj} will ${verb} tomorrow.`,
    future_going_to: `${subj} ${beNow} going to ${verb} next week.`,
    future_continuous: `${subj} will be ${ing} tomorrow evening.`,
    future_perfect: `${subj} will have ${pp} by tomorrow.`,
    future_perfect_continuous: `${subj} will have been ${ing} for two hours by then.`,
    conditional_0: `If ${subj} ${present}, ${subj} ${present}.`,
    conditional_1: `If ${subj} ${present}, ${subj} will ${verb}.`,
    conditional_2: `If ${subj} ${cond2Past}, ${subj} would ${verb}.`,
    conditional_3: `If ${subj} had ${pp}, ${subj} would have ${pp}.`,
    mixed_conditional: `If ${subj} had ${pp}, ${subj} would ${verb}.`,
  };

  return sentences[tenseId] || `${subj} ${present} ${context}.`;
}

function buildCoreClauseForTense(tenseId, subj, verb, is3rdSing) {
  const ing = getIngForm(verb);
  const { past, pp } = getIrregularForms(APP_DATA.verbsByBase, verb);
  const present = getPresentSimpleForm(verb, is3rdSing, subj);
  const beNow = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
  const bePast = subj === 'I' || is3rdSing ? 'was' : 'were';
  const hasHave = is3rdSing ? 'has' : 'have';
  const pastForm = verb === 'be' ? bePast : past;
  const cond2Past = verb === 'be' ? 'were' : pastForm;

  const clauses = {
    present_simple: [`${subj} ${present}`, present],
    present_continuous: [`${subj} ${beNow} ${ing}`, `${beNow} ${ing}`],
    present_perfect: [`${subj} ${hasHave} ${pp}`, `${hasHave} ${pp}`],
    present_perfect_continuous: [`${subj} ${hasHave} been ${ing}`, `${hasHave} been ${ing}`],
    past_simple: [`${subj} ${pastForm}`, pastForm],
    past_continuous: [`${subj} ${bePast} ${ing}`, `${bePast} ${ing}`],
    past_perfect: [`${subj} had ${pp}`, `had ${pp}`],
    past_perfect_continuous: [`${subj} had been ${ing}`, `had been ${ing}`],
    future_will: [`${subj} will ${verb}`, `will ${verb}`],
    future_going_to: [`${subj} ${beNow} going to ${verb}`, `${beNow} going to ${verb}`],
    future_continuous: [`${subj} will be ${ing}`, `will be ${ing}`],
    future_perfect: [`${subj} will have ${pp}`, `will have ${pp}`],
    future_perfect_continuous: [`${subj} will have been ${ing}`, `will have been ${ing}`],
    conditional_0: [`If ${subj} ${present}`, present],
    conditional_1: [`If ${subj} ${present}`, present],
    conditional_2: [`If ${subj} ${cond2Past}`, cond2Past],
    conditional_3: [`If ${subj} had ${pp}`, `had ${pp}`],
    mixed_conditional: [`If ${subj} had ${pp}`, `had ${pp}`],
  };

  return clauses[tenseId] || [`${subj} ${present}`, present];
}

function buildIncorrectSentenceForTense(tenseId, subj, verb, is3rdSing) {
  const correct = buildSentenceForTense(tenseId, subj, verb, is3rdSing);
  const ing = getIngForm(verb);
  const { past, pp } = getIrregularForms(APP_DATA.verbsByBase, verb);
  const present = getPresentSimpleForm(verb, is3rdSing, subj);
  const bePast = subj === 'I' || is3rdSing ? 'was' : 'were';
  const pastForm = verb === 'be' ? bePast : past;

  let wrongPresent;
  if (verb === 'be') {
    wrongPresent = is3rdSing ? 'are' : 'is';
  } else if (verb === 'have') {
    wrongPresent = is3rdSing ? 'have' : 'has';
  } else {
    wrongPresent = is3rdSing ? verb : getPresentSimpleForm(verb, true, subj);
  }

  const incorrect = {
    present_simple: `${subj} ${wrongPresent} every day.`,
    present_continuous: `${subj} ${present} right now.`,
    present_perfect: `${subj} ${pastForm} already.`,
    present_perfect_continuous: `${subj} has been ${verb} for two hours.`,
    past_simple: `${subj} ${verb} yesterday.`,
    past_continuous: `${subj} ${pastForm} when I arrived.`,
    past_perfect: `${subj} had ${pastForm} before I arrived.`,
    past_perfect_continuous: `${subj} had ${ing} for two hours before I arrived.`,
    future_will: `${subj} ${verb} tomorrow.`,
    future_going_to: `${subj} will going to ${verb} next week.`,
    future_continuous: `${subj} will ${ing} tomorrow evening.`,
    future_perfect: `${subj} will ${pp} by tomorrow.`,
    future_perfect_continuous: `${subj} will have ${ing} for two hours by then.`,
    conditional_0: `If ${subj} ${verb}, ${subj} ${present}.`,
    conditional_1: `If ${subj} ${pastForm}, ${subj} will ${verb}.`,
    conditional_2: `If ${subj} ${present}, ${subj} would ${verb}.`,
    conditional_3: `If ${subj} ${pastForm}, ${subj} would have ${pp}.`,
    mixed_conditional: `If ${subj} ${present}, ${subj} would ${verb}.`,
  };

  return incorrect[tenseId] === correct ? `${subj} ${verb} yesterday.` : incorrect[tenseId];
}

export function generateQCM(tense, subj, verb, is3rdSing, _difficulty, usedSentences = null) {
  let fullSentence, correctAnswer;
  let options;

  const correctForm = getConjugation(APP_DATA.verbsByBase, verb, tense.id, subj, is3rdSing);
  const aux = getAuxiliary(tense.id, subj, is3rdSing);

  // HYBRID ENGINE: Try curated rich templates first (70% probability)
  if (
    APP_DATA.exerciseTemplates[tense.id] &&
    APP_DATA.exerciseTemplates[tense.id].qcm &&
    Math.random() < 0.7
  ) {
    const templates = APP_DATA.exerciseTemplates[tense.id].qcm;
    const tpl = pickTemplate(templates, usedSentences);
    const originalAnswer = tpl.options[tpl.correct];
    const shuf = shuffle(tpl.options);
    return {
      type: 'qcm',
      sentence: tpl.sentence,
      options: shuf,
      correct: shuf.indexOf(originalAnswer),
      explanation: tpl.explanation,
      tenseId: tense.id,
      hint: `Temps : ${tense.nameFR}`,
    };
  }

  // DYNAMIC GENERATION (Fallback)
  if (tense.id === 'conditional_0') {
    correctAnswer = getPresentSimpleForm(verb, is3rdSing, subj);
    fullSentence = `If ${subj} ___, ${subj} ${correctAnswer}.`;
  } else if (tense.id === 'conditional_1') {
    correctAnswer = getPresentSimpleForm(verb, is3rdSing, subj);
    fullSentence = `If ${subj} ___, ${subj} will ${verb}.`;
  } else if (tense.id === 'conditional_2') {
    const { past: pastForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    correctAnswer = verb === 'be' ? 'were' : pastForm;
    fullSentence = `If ${subj} ___, ${subj} would ${verb}.`;
  } else if (tense.id === 'conditional_3') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    correctAnswer = ppForm;
    fullSentence = `If ${subj} had ___, ${subj} would have ${ppForm}.`;
  } else if (tense.id === 'mixed_conditional') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    correctAnswer = ppForm;
    fullSentence = `If ${subj} had ___, ${subj} would ${verb}.`;
  } else if (
    tense.id.includes('perfect') ||
    tense.id.includes('continuous') ||
    tense.id.includes('future')
  ) {
    if (tense.id === 'present_perfect') {
      fullSentence = `${subj} ${aux} ${correctForm} recently.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id === 'past_perfect') {
      fullSentence = `${subj} ${aux} ${correctForm} before I arrived.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id === 'present_perfect_continuous') {
      fullSentence = `${subj} ${aux} ${correctForm} for two hours.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id === 'past_perfect_continuous') {
      fullSentence = `${subj} ${aux} ${correctForm} before I arrived.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id === 'future_perfect') {
      fullSentence = `${subj} ${aux} ${correctForm} by tomorrow.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id === 'future_perfect_continuous') {
      fullSentence = `${subj} ${aux} ${correctForm} for two hours by then.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id === 'future_continuous') {
      fullSentence = `${subj} ${aux} ${correctForm} tomorrow evening.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id === 'future_will') {
      fullSentence = `${subj} will ${correctForm} tomorrow.`;
      correctAnswer = `will ${correctForm}`;
    } else if (tense.id === 'future_going_to') {
      const goAux = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
      fullSentence = `${subj} ${goAux} going to ${correctForm} next week.`;
      correctAnswer = `${goAux} going to ${correctForm}`;
    } else {
      fullSentence = `${subj} ${correctForm} tomorrow.`;
      correctAnswer = correctForm;
    }
  } else {
    if (tense.id === 'present_simple') {
      fullSentence = `${subj} ${correctForm} every day.`;
      correctAnswer = correctForm;
    } else {
      fullSentence = `${subj} ${correctForm} yesterday.`;
      correctAnswer = correctForm;
    }
  }

  // Generate distractors
  const distractors = new Set();
  const allForms = new Set();
  APP_DATA.irregularVerbs.forEach((v) => {
    if (v.base === verb) {
      v.past.split('/').forEach((p) => allForms.add(p.trim()));
      v.pp.split('/').forEach((p) => allForms.add(p.trim()));
    }
  });

  if (verb === 'be') {
    ['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being'].forEach((f) => allForms.add(f));
  } else if (verb === 'have') {
    ['have', 'has', 'had', 'having'].forEach((f) => allForms.add(f));
  } else {
    allForms.add(getRegularPast(verb));
    allForms.add(getIngForm(verb));
    allForms.add(getPresentSimpleForm(verb, is3rdSing, subj));
    allForms.add(getPresentSimpleForm(verb, true, subj));
  }

  allForms.delete('bes');
  allForms.delete('haves');

  for (const f of allForms) {
    if (f !== correctAnswer && !distractors.has(f)) distractors.add(f);
    if (distractors.size >= 3) break;
  }

  if (tense.id === 'present_simple') {
    if (verb === 'be') {
      ['am', 'is', 'are', 'be', 'was', 'were'].forEach((f) => {
        if (f !== correctAnswer) distractors.add(f);
      });
    } else if (verb === 'have') {
      ['have', 'has', 'had', 'having'].forEach((f) => {
        if (f !== correctAnswer) distractors.add(f);
      });
    } else {
      if (is3rdSing) {
        distractors.add(verb);
      } else {
        distractors.add(getPresentSimpleForm(verb, true, subj));
      }
    }
  }

  distractors.delete('bes');
  distractors.delete('haves');

  options = [correctAnswer];
  for (const d of distractors) {
    if (options.length >= 4) break;
    options.push(d);
  }

  const fillers =
    verb === 'be'
      ? ['is', 'are', 'am', 'was', 'were', 'be']
      : verb === 'have'
        ? ['has', 'have', 'had', 'having']
        : [getRegularPast(verb), getIngForm(verb), getPresentSimpleForm(verb, true, subj), verb];

  let fi = 0;
  while (options.length < 4 && fi < fillers.length) {
    const filler = fillers[fi];
    if (filler !== 'bes' && filler !== 'haves' && !options.includes(filler)) {
      options.push(filler);
    }
    fi++;
  }
  options = options.filter((opt) => opt !== 'bes' && opt !== 'haves').slice(0, 4);

  const shuffled = shuffle(options);
  const correctIndex = shuffled.indexOf(correctAnswer);

  return {
    type: 'qcm',
    sentence: fullSentence.replace(correctAnswer, '___'),
    options: shuffled,
    correct: correctIndex,
    explanation: `La forme correcte est "${correctAnswer}". ${tense.nameFR} : ${tense.structure}`,
    tenseId: tense.id,
    hint: `Temps : ${tense.nameFR}`,
  };
}

export function generateFill(tense, subj, verb, is3rdSing, usedSentences = null) {
  // HYBRID ENGINE: Try curated rich templates first (70% probability)
  if (
    APP_DATA.exerciseTemplates[tense.id] &&
    APP_DATA.exerciseTemplates[tense.id].fill &&
    Math.random() < 0.7
  ) {
    const templates = APP_DATA.exerciseTemplates[tense.id].fill;
    const tpl = pickTemplate(templates, usedSentences);
    return {
      type: 'fill',
      sentence: tpl.sentence,
      answer: tpl.answer,
      acceptedAnswers: buildFillAcceptedAnswers(tpl.sentence, tpl.answer),
      tenseId: tense.id,
      explanation: `${tpl.explanation} (${tense.nameFR})`,
    };
  }

  // DYNAMIC GENERATION (Fallback)
  let fullSentence, answer;

  if (tense.id === 'present_simple') {
    fullSentence = `${subj} ___ (${verb}) every morning.`;
    answer = getPresentSimpleForm(verb, is3rdSing, subj);
  } else if (tense.id === 'present_continuous') {
    const contAux = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
    fullSentence = `${subj} ___ (${verb}) at the moment.`;
    answer = `${contAux} ${getIngForm(verb)}`;
  } else if (tense.id === 'past_simple') {
    const { past: pastForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    const actualPast = verb === 'be' ? (subj === 'I' || is3rdSing ? 'was' : 'were') : pastForm;
    fullSentence = `${subj} ___ (${verb}) last week.`;
    answer = actualPast;
  } else if (tense.id === 'present_perfect') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    const hasAux = is3rdSing ? 'has' : 'have';
    fullSentence = `${subj} ___ (${verb}) already.`;
    answer = `${hasAux} ${ppForm}`;
  } else if (tense.id === 'future_will') {
    fullSentence = `${subj} ___ (${verb}) tomorrow.`;
    answer = `will ${verb}`;
  } else if (tense.id === 'future_going_to') {
    const goAux = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
    fullSentence = `${subj} ___ (${verb}) next month.`;
    answer = `${goAux} going to ${verb}`;
  } else if (tense.id === 'past_continuous') {
    const contAux = subj === 'I' || is3rdSing ? 'was' : 'were';
    fullSentence = `${subj} ___ (${verb}) when I arrived.`;
    answer = `${contAux} ${getIngForm(verb)}`;
  } else if (tense.id === 'present_perfect_continuous') {
    const hasAux = is3rdSing ? 'has' : 'have';
    fullSentence = `${subj} ___ (${verb}) for two hours.`;
    answer = `${hasAux} been ${getIngForm(verb)}`;
  } else if (tense.id === 'past_perfect') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    fullSentence = `${subj} ___ (${verb}) before I arrived.`;
    answer = `had ${ppForm}`;
  } else if (tense.id === 'past_perfect_continuous') {
    fullSentence = `${subj} ___ (${verb}) for two hours before I arrived.`;
    answer = `had been ${getIngForm(verb)}`;
  } else if (tense.id === 'future_continuous') {
    fullSentence = `${subj} ___ (${verb}) tomorrow evening.`;
    answer = `will be ${getIngForm(verb)}`;
  } else if (tense.id === 'future_perfect') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    fullSentence = `${subj} ___ (${verb}) by tomorrow.`;
    answer = `will have ${ppForm}`;
  } else if (tense.id === 'future_perfect_continuous') {
    fullSentence = `${subj} ___ (${verb}) for two hours by then.`;
    answer = `will have been ${getIngForm(verb)}`;
  } else if (tense.id === 'conditional_0') {
    const present = getPresentSimpleForm(verb, is3rdSing, subj);
    fullSentence = `If ${subj} ___, ${subj} ${present}.`;
    answer = present;
  } else if (tense.id === 'conditional_1') {
    const present = getPresentSimpleForm(verb, is3rdSing, subj);
    fullSentence = `If ${subj} ___, ${subj} will ${verb}.`;
    answer = present;
  } else if (tense.id === 'conditional_2') {
    const { past: pastForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    const actualPast = verb === 'be' ? 'were' : pastForm;
    fullSentence = `If ${subj} ___, ${subj} would ${verb}.`;
    answer = actualPast;
  } else if (tense.id === 'conditional_3') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    fullSentence = `If ${subj} had ___, ${subj} would have ${ppForm}.`;
    answer = ppForm;
  } else if (tense.id === 'mixed_conditional') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    fullSentence = `If ${subj} had ___, ${subj} would ${verb}.`;
    answer = ppForm;
  } else {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    const hasAux = is3rdSing ? 'has' : 'have';
    fullSentence = `${subj} ___ (${verb}) recently.`;
    answer = `${hasAux} ${ppForm}`;
  }

  return {
    type: 'fill',
    sentence: fullSentence,
    answer: answer,
    acceptedAnswers: buildFillAcceptedAnswers(fullSentence, answer),
    tenseId: tense.id,
    explanation: `La réponse est "${answer}". ${tense.nameFR} : ${tense.structure}`,
  };
}

export function generateTransform(tense, subj, verb, is3rdSing) {
  let affirmative, negative, question;
  let negCore, qCore;
  const s = ['I', 'John', 'Sarah', 'Emma'].includes(subj) ? subj : subj.toLowerCase();
  const ing = getIngForm(verb);
  const { past, pp } = getIrregularForms(APP_DATA.verbsByBase, verb);
  const present = getPresentSimpleForm(verb, is3rdSing, subj);
  const beNow = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
  const beNowCap = subj === 'I' ? 'Am' : is3rdSing ? 'Is' : 'Are';
  const bePast = subj === 'I' || is3rdSing ? 'was' : 'were';
  const bePastCap = subj === 'I' || is3rdSing ? 'Was' : 'Were';
  const hasHave = is3rdSing ? 'has' : 'have';
  const hasHaveCap = is3rdSing ? 'Has' : 'Have';
  const pastForm = verb === 'be' ? bePast : past;

  affirmative = buildSentenceForTense(tense.id, subj, verb, is3rdSing);

  if (tense.id === 'present_simple') {
    affirmative = `${subj} ${present} every day.`;
    if (verb === 'be') {
      const beNowNeg = subj === 'I' ? 'am not' : is3rdSing ? "isn't" : "aren't";
      negative = `${subj} ${beNowNeg} every day.`;
      question = `${beNowCap} ${s} every day?`;
      negCore = `${subj} ${beNowNeg}`;
      qCore = `${beNowCap} ${s}?`;
    } else {
      negative = `${subj} ${is3rdSing ? "doesn't" : "don't"} ${verb} every day.`;
      question = `${is3rdSing ? 'Does' : 'Do'} ${s} ${verb} every day?`;
      negCore = `${subj} ${is3rdSing ? "doesn't" : "don't"} ${verb}`;
      qCore = `${is3rdSing ? 'Does' : 'Do'} ${s} ${verb}?`;
    }
  } else if (tense.id === 'past_simple') {
    affirmative = `${subj} ${pastForm} yesterday.`;
    if (verb === 'be') {
      const bePastNeg = subj === 'I' || is3rdSing ? "wasn't" : "weren't";
      negative = `${subj} ${bePastNeg} yesterday.`;
      question = `${bePastCap} ${s} yesterday?`;
      negCore = `${subj} ${bePastNeg}`;
      qCore = `${bePastCap} ${s}?`;
    } else {
      negative = `${subj} didn't ${verb} yesterday.`;
      question = `Did ${s} ${verb} yesterday?`;
      negCore = `${subj} didn't ${verb}`;
      qCore = `Did ${s} ${verb}?`;
    }
  } else if (tense.id === 'present_continuous') {
    const beNowNeg = subj === 'I' ? 'am not' : is3rdSing ? 'is not' : 'are not';
    negative = `${subj} ${beNowNeg} ${ing}.`;
    question = `${beNowCap} ${s} ${ing}?`;
    negCore = `${subj} ${beNowNeg} ${ing} right now.`;
    qCore = `${beNowCap} ${s} ${ing} right now?`;
  } else if (tense.id === 'past_continuous') {
    const bePastNeg = subj === 'I' || is3rdSing ? 'was not' : 'were not';
    negative = `${subj} ${bePastNeg} ${ing}.`;
    question = `${bePastCap} ${s} ${ing}?`;
    negCore = `${subj} ${bePastNeg} ${ing} when I arrived.`;
    qCore = `${bePastCap} ${s} ${ing} when I arrived?`;
  } else if (tense.id === 'present_perfect') {
    negative = `${subj} ${hasHave}n't ${pp}.`;
    question = `${hasHaveCap} ${s} ${pp}?`;
    negCore = `${subj} ${hasHave}n't ${pp} yet.`;
    qCore = `${hasHaveCap} ${s} ${pp} already?`;
  } else if (tense.id === 'present_perfect_continuous') {
    negative = `${subj} ${hasHave}n't been ${ing}.`;
    question = `${hasHaveCap} ${s} been ${ing}?`;
    negCore = `${subj} ${hasHave}n't been ${ing} for two hours.`;
    qCore = `${hasHaveCap} ${s} been ${ing} for two hours?`;
  } else if (tense.id === 'past_perfect') {
    negative = `${subj} hadn't ${pp}.`;
    question = `Had ${s} ${pp}?`;
    negCore = `${subj} hadn't ${pp} before I arrived.`;
    qCore = `Had ${s} ${pp} before I arrived?`;
  } else if (tense.id === 'past_perfect_continuous') {
    negative = `${subj} hadn't been ${ing}.`;
    question = `Had ${s} been ${ing}?`;
    negCore = `${subj} hadn't been ${ing} for two hours before I arrived.`;
    qCore = `Had ${s} been ${ing} for two hours before I arrived?`;
  } else if (tense.id === 'future_will') {
    negative = `${subj} won't ${verb}.`;
    question = `Will ${s} ${verb}?`;
    negCore = `${subj} won't ${verb} tomorrow.`;
    qCore = `Will ${s} ${verb} tomorrow?`;
  } else if (tense.id === 'future_going_to') {
    negative = `${subj} ${beNow} not going to ${verb}.`;
    question = `${beNowCap} ${s} going to ${verb}?`;
    negCore = `${subj} ${beNow} not going to ${verb} next week.`;
    qCore = `${beNowCap} ${s} going to ${verb} next week?`;
  } else if (tense.id === 'future_continuous') {
    negative = `${subj} won't be ${ing}.`;
    question = `Will ${s} be ${ing}?`;
    negCore = `${subj} won't be ${ing} tomorrow evening.`;
    qCore = `Will ${s} be ${ing} tomorrow evening?`;
  } else if (tense.id === 'future_perfect') {
    negative = `${subj} won't have ${pp}.`;
    question = `Will ${s} have ${pp}?`;
    negCore = `${subj} won't have ${pp} by tomorrow.`;
    qCore = `Will ${s} have ${pp} by tomorrow?`;
  } else if (tense.id === 'future_perfect_continuous') {
    negative = `${subj} won't have been ${ing}.`;
    question = `Will ${s} have been ${ing}?`;
    negCore = `${subj} won't have been ${ing} for two hours by then.`;
    qCore = `Will ${s} have been ${ing} for two hours by then?`;
  } else if (tense.id === 'conditional_0') {
    if (verb === 'be') {
      const bePresNeg = subj === 'I' ? 'am not' : is3rdSing ? "isn't" : "aren't";
      negative = `If ${subj} ${bePresNeg}, ${subj} ${bePresNeg}.`;
      question = `If ${subj} ${present}, ${beNowCap} ${s}?`;
    } else {
      negative = `If ${subj} ${is3rdSing ? "doesn't" : "don't"} ${verb}, ${subj} ${is3rdSing ? "doesn't" : "don't"} ${verb}.`;
      question = `If ${subj} ${present}, ${is3rdSing ? 'Does' : 'Do'} ${s} ${verb}?`;
    }
  } else if (tense.id === 'conditional_1') {
    if (verb === 'be') {
      const bePresNeg = subj === 'I' ? 'am not' : is3rdSing ? "isn't" : "aren't";
      negative = `If ${subj} ${bePresNeg}, ${subj} won't be.`;
      question = `If ${subj} ${present}, will ${s} be?`;
    } else {
      negative = `If ${subj} ${is3rdSing ? "doesn't" : "don't"} ${verb}, ${subj} won't ${verb}.`;
      question = `If ${subj} ${present}, will ${s} ${verb}?`;
    }
  } else if (tense.id === 'conditional_2') {
    if (verb === 'be') {
      negative = `If ${subj} weren't, ${subj} wouldn't be.`;
      question = `If ${subj} were, would ${s} be?`;
    } else {
      negative = `If ${subj} didn't ${verb}, ${subj} wouldn't ${verb}.`;
      question = `If ${subj} ${pastForm}, would ${s} ${verb}?`;
    }
  } else if (tense.id === 'conditional_3') {
    negative = `If ${subj} hadn't ${pp}, ${subj} wouldn't have ${pp}.`;
    question = `If ${subj} had ${pp}, would ${s} have ${pp}?`;
  } else if (tense.id === 'mixed_conditional') {
    negative = `If ${subj} hadn't ${pp}, ${subj} wouldn't ${verb}.`;
    question = `If ${subj} had ${pp}, would ${s} ${verb}?`;
  } else {
    negative = `${subj} didn't ${verb}.`;
    question = `Did ${s} ${verb}?`;
  }

  const directions = [
    {
      dir: 'Mettez cette phrase à la forme négative :',
      answer: negative,
      alt: negCore,
    },
    {
      dir: 'Transformez en question :',
      answer: question,
      alt: qCore,
    },
  ];
  const chosen = directions[Math.floor(Math.random() * directions.length)];

  return {
    type: 'transform',
    sentence: `Phrase affirmative : "${affirmative}"\n${chosen.dir}`,
    answer: chosen.answer,
    acceptedAnswers: [chosen.answer, chosen.alt].filter(Boolean),
    tenseId: tense.id,
    explanation: `La forme ${chosen.dir.includes('négative') ? 'négative' : 'interrogative'} est : "${chosen.answer}"`,
  };
}

export function generateCorrection(tense, subj, verb, is3rdSing, usedSentences = null) {
  if (
    APP_DATA.exerciseTemplates[tense.id] &&
    APP_DATA.exerciseTemplates[tense.id].correction &&
    Math.random() < 0.7
  ) {
    const templates = APP_DATA.exerciseTemplates[tense.id].correction;
    const tpl = pickTemplate(templates, usedSentences);
    return {
      type: 'correction',
      sentence: `Trouvez l'erreur et corrigez-la :\n"${tpl.wrong}"`,
      answer: tpl.answer,
      acceptedAnswers: tpl.acceptedAnswers || [],
      tenseId: tense.id,
      explanation: `${tpl.explanation} (${tense.nameFR} : "${tpl.answer}")`,
    };
  }

  const correctSentence = buildSentenceForTense(tense.id, subj, verb, is3rdSing);
  const incorrectSentence = buildIncorrectSentenceForTense(tense.id, subj, verb, is3rdSing);
  const coreClauses = buildCoreClauseForTense(tense.id, subj, verb, is3rdSing);

  return {
    type: 'correction',
    sentence: `Trouvez l'erreur et corrigez-la :\n"${incorrectSentence}"`,
    answer: correctSentence,
    acceptedAnswers: [correctSentence, ...coreClauses],
    tenseId: tense.id,
    explanation: `La phrase correcte au ${tense.nameFR} est : "${correctSentence}"`,
  };
}

export function generateTranslation(tense, subj, verb, is3rdSing, usedSentences = null) {
  if (
    APP_DATA.exerciseTemplates[tense.id] &&
    APP_DATA.exerciseTemplates[tense.id].translation &&
    Math.random() < 0.7
  ) {
    const templates = APP_DATA.exerciseTemplates[tense.id].translation;
    const tpl = pickTemplate(templates, usedSentences);
    return {
      type: 'translation',
      sentence: `Traduisez en anglais en utilisant le temps ${tense.nameFR} :\n« ${tpl.fr} » (${tpl.hint})`,
      answer: tpl.answer,
      acceptedAnswers: tpl.acceptedAnswers || [],
      tenseId: tense.id,
      explanation: `${tpl.explanation} (${tense.nameFR})`,
    };
  }

  const answer = buildSentenceForTense(tense.id, subj, verb, is3rdSing);
  const coreClauses = buildCoreClauseForTense(tense.id, subj, verb, is3rdSing);

  return {
    type: 'translation',
    sentence: `Traduisez en anglais en utilisant le temps ${tense.nameFR} :\n"${subj} / ${verb}"`,
    answer,
    acceptedAnswers: [answer, ...coreClauses],
    tenseId: tense.id,
    explanation: `La traduction correcte au ${tense.nameFR} est : "${answer}"`,
  };
}

export function generateSingleQuestion(
  mode,
  tense,
  subjects,
  verbs,
  difficulty,
  usedSentences = null,
) {
  const subj = subjects[Math.floor(Math.random() * subjects.length)];
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const non3rdSingSubjects = [
    'I',
    'You',
    'We',
    'They',
    'The students',
    'The children',
    'My parents',
  ];
  const is3rdSing = !non3rdSingSubjects.includes(subj);

  switch (mode) {
    case 'qcm':
      return generateQCM(tense, subj, verb, is3rdSing, difficulty, usedSentences);
    case 'fill':
      return generateFill(tense, subj, verb, is3rdSing, usedSentences);
    case 'transform':
      return generateTransform(tense, subj, verb, is3rdSing);
    case 'correction':
      return generateCorrection(tense, subj, verb, is3rdSing, usedSentences);
    case 'translation':
      return generateTranslation(tense, subj, verb, is3rdSing, usedSentences);
    default:
      return generateQCM(tense, subj, verb, is3rdSing, difficulty, usedSentences);
  }
}

export function generateQuestions(
  mode,
  tenseFilter,
  difficulty,
  count = 10,
  isRevision = false,
  lessonId = null,
) {
  if (lessonId === 'l_passive') {
    const examples = APP_DATA.passiveInfo?.examples || [];
    const indices = shuffle(Array.from({ length: Math.max(examples.length, 1) }, (_, i) => i));
    return Array.from({ length: count }, (_, i) =>
      generatePassiveQuestion(indices[i % indices.length]),
    );
  }
  if (lessonId === 'l_reported') {
    const rules = APP_DATA.reportedSpeech?.rules || [];
    const indices = shuffle(Array.from({ length: Math.max(rules.length, 1) }, (_, i) => i));
    return Array.from({ length: count }, (_, i) =>
      generateReportedQuestion(indices[i % indices.length]),
    );
  }

  const questions = [];
  const usedSentences = new Set();
  const subjects = [
    'I',
    'You',
    'He',
    'She',
    'We',
    'They',
    'My friend',
    'The teacher',
    'The students',
    'John',
    'Sarah',
    'The children',
    'Emma',
    'My parents',
  ];
  const regularVerbs = [
    'work',
    'play',
    'study',
    'cook',
    'read',
    'write',
    'walk',
    'talk',
    'clean',
    'watch',
    'listen',
    'help',
    'ask',
    'call',
    'wait',
    'start',
    'finish',
    'open',
    'close',
    'use',
  ];
  const allVerbs = [...regularVerbs, ...APP_DATA.irregularVerbs.map((v) => v.base)];

  const tenses =
    tenseFilter && tenseFilter.length > 0 ? tenseFilter : APP_DATA.tenses.map((t) => t.id);

  const allModes = ['qcm', 'fill', 'transform', 'correction', 'translation'];

  for (let i = 0; i < count; i++) {
    const tenseId = isRevision
      ? tenses[i % tenses.length]
      : tenses[Math.floor(Math.random() * tenses.length)];
    const tense = APP_DATA.tensesById[tenseId];
    if (!tense) continue;

    let selectedQuestion = null;
    for (let attempt = 0; attempt < 12; attempt++) {
      const modeType =
        mode === 'mixed' ? allModes[Math.floor(Math.random() * allModes.length)] : mode;
      const candidate = generateSingleQuestion(
        modeType,
        tense,
        subjects,
        allVerbs,
        difficulty,
        usedSentences,
      );
      if (candidate) {
        selectedQuestion = candidate;
        if (!usedSentences.has(candidate.sentence)) {
          break;
        }
      }
    }

    if (selectedQuestion) {
      usedSentences.add(selectedQuestion.sentence);
      selectedQuestion.tenseId = tenseId;
      questions.push(selectedQuestion);
    }
  }
  return questions;
}
