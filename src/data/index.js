import { tenses } from './tenses.js';
import { modals } from './modals.js';
import { passiveInfo } from './passiveInfo.js';
import { reportedSpeech } from './reportedSpeech.js';
import { irregularVerbs } from './irregularVerbs.js';
import { phrasalVerbs } from './phrasalVerbs.js';
import { modules } from './modules.js';
import { exerciseTemplates } from './exerciseTemplates.js';
import { stativeVerbs } from './stativeVerbs.js';

const APP_DATA = {
  tenses,
  modals,
  passiveInfo,
  reportedSpeech,
  irregularVerbs,
  phrasalVerbs,
  modules,
  exerciseTemplates,
  stativeVerbs,
};

// O(1) indexes are part of the data-layer contract.
APP_DATA.tensesById = Object.fromEntries(tenses.map((tense) => [tense.id, tense]));
APP_DATA.verbsByBase = Object.fromEntries(irregularVerbs.map((verb) => [verb.base, verb]));
APP_DATA.specialTopicsById = Object.freeze({
  passive_voice: Object.freeze({
    id: 'passive_voice',
    name: 'Passive Voice',
    nameFR: 'Voix Passive',
    lessonId: 'l_passive',
  }),
  reported_speech: Object.freeze({
    id: 'reported_speech',
    name: 'Reported Speech',
    nameFR: 'Discours Indirect',
    lessonId: 'l_reported',
  }),
});

export { APP_DATA };
