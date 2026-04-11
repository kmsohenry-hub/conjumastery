/* ============================================================
   CONJUMASTER UK — COMPLETE EDUCATIONAL APPLICATION
   ============================================================ */

// ============================================================
// 1. DATA LAYER
// ============================================================

const APP_DATA = {
  // All English tenses with full pedagogical content
  tenses: [
    {
      id: "present_simple",
      name: "Present Simple",
      nameFR: "Présent simple",
      category: "present",
      level: "beginner",
      structure: "Sujet + base verbale (+ s/es à la 3e personne sing.)",
      structureNeg: "Sujet + do/does + not + base verbale",
      structureQ: "Do/Does + sujet + base verbale ?",
      explanation: "Le Present Simple exprime des habitudes, des vérités générales, des états permanents et des emplois du temps fixes. C'est le temps de base pour décrire ce qui est vrai de manière générale.",
      usage: [
        "Habitudes et routines : I wake up at 7 every morning.",
        "Vérités générales : Water boils at 100°C.",
        "États permanents : She lives in Manchester.",
        "Emplois du temps : The train leaves at 9:15.",
        "Commentaires sportifs en direct : He passes the ball to Smith!"
      ],
      examples: [
        { en: "She drinks tea every morning.", fr: "Elle boit du thé tous les matins." },
        { en: "They don't like cold weather.", fr: "Ils n'aiment pas le temps froid." },
        { en: "Does he work in London?", fr: "Travaille-t-il à Londres ?" },
        { en: "The sun rises in the east.", fr: "Le soleil se lève à l'est." }
      ],
      timeline: { type: "dots", positions: [15, 30, 50, 70, 85], label: "Répétition régulière" },
      commonErrors: [
        { wrong: "He go to school every day.", right: "He goes to school every day.", note: "Ne pas oublier le -s à la 3e personne du singulier." },
        { wrong: "She don't like fish.", right: "She doesn't like fish.", note: "On utilise 'doesn't' (et non 'don't') avec he/she/it." }
      ],
      nuances: "Contrairement au français, le Present Simple anglais n'exprime PAS une action en cours de déroulement. Pour cela, utilisez le Present Continuous. De plus, les verbes d'état (stative verbs) comme know, believe, want s'utilisent presque toujours au Present Simple, jamais au Continuous.",
      comparison: ["present_continuous", "present_perfect"],
      signalWords: ["always", "usually", "often", "sometimes", "never", "every day/week/month", "on Mondays", "once a week"]
    },
    {
      id: "present_continuous",
      name: "Present Continuous",
      nameFR: "Présent continu / progressif",
      category: "present",
      level: "beginner",
      structure: "Sujet + am/is/are + verbe-ing",
      structureNeg: "Sujet + am/is/are + not + verbe-ing",
      structureQ: "Am/Is/Are + sujet + verbe-ing ?",
      explanation: "Le Present Continuous décrit une action en train de se dérouler au moment où l'on parle, une situation temporaire, ou un futur planifié et certain.",
      usage: [
        "Action en cours : I'm reading a book right now.",
        "Situation temporaire : She's staying with friends this week.",
        "Changement/évolution : The weather is getting warmer.",
        "Futur planifié : We're meeting John tomorrow at 6.",
        "Agacement (avec always) : He's always complaining!"
      ],
      examples: [
        { en: "I'm currently studying English.", fr: "J'étudie l'anglais en ce moment." },
        { en: "They aren't working today.", fr: "Ils ne travaillent pas aujourd'hui." },
        { en: "Is she coming to the party?", fr: "Vient-elle à la fête ?" },
        { en: "It's raining outside.", fr: "Il pleut dehors." }
      ],
      timeline: { type: "range", start: 40, end: 60, label: "En cours maintenant" },
      commonErrors: [
        { wrong: "I am knowing the answer.", right: "I know the answer.", note: "Know est un stative verb : il ne s'utilise pas au continuous." },
        { wrong: "She is wanting a coffee.", right: "She wants a coffee.", note: "Want est un verbe d'état, pas d'action." }
      ],
      nuances: "Les stative verbs (know, believe, understand, want, need, like, love, hate, prefer, seem, belong, own, remember, mean) ne s'utilisent généralement PAS au continuous. Certains verbes changent de sens : 'I think he's nice' (opinion = stative) vs 'I'm thinking about the problem' (action mentale = dynamic).",
      comparison: ["present_simple", "past_continuous"],
      signalWords: ["now", "right now", "at the moment", "currently", "today", "this week", "look!", "listen!"]
    },
    {
      id: "present_perfect",
      name: "Present Perfect",
      nameFR: "Present Perfect",
      category: "perfect",
      level: "intermediate",
      structure: "Sujet + have/has + participe passé",
      structureNeg: "Sujet + have/has + not + participe passé",
      structureQ: "Have/Has + sujet + participe passé ?",
      explanation: "Le Present Perfect fait le lien entre le passé et le présent. Il exprime une action passée qui a un impact sur le présent, une expérience de vie, ou une action commencée dans le passé qui continue.",
      usage: [
        "Expérience de vie : I've been to Paris three times.",
        "Action passée avec résultat présent : She's lost her keys (elle ne les a pas maintenant).",
        "Action commencée dans le passé et toujours vraie : I've known him since 2010.",
        "Nouvelles récentes : The Prime Minister has announced new measures.",
        "Avec ever/never/yet/already/just"
      ],
      examples: [
        { en: "I've already finished my homework.", fr: "J'ai déjà fini mes devoirs." },
        { en: "Have you ever eaten haggis?", fr: "As-tu déjà mangé du haggis ?" },
        { en: "She hasn't called me yet.", fr: "Elle ne m'a pas encore appelé." },
        { en: "We've lived here for ten years.", fr: "Nous vivons ici depuis dix ans." }
      ],
      timeline: { type: "arrow", start: 10, now: 50, label: "Passé → Présent" },
      commonErrors: [
        { wrong: "I have seen him yesterday.", right: "I saw him yesterday.", note: "Avec un moment passé précisé (yesterday, last week...), on utilise le Past Simple, PAS le Present Perfect." },
        { wrong: "I am knowing him since 2015.", right: "I've known him since 2015.", note: "Depuis + date = Present Perfect, pas Present Continuous." }
      ],
      nuances: "C'est LE temps le plus difficile pour les francophones. En français, on utilise le passé composé pour les deux ('j'ai mangé hier' et 'j'ai déjà mangé'). En anglais : Past Simple avec un moment précis du passé, Present Perfect SANS moment précis ou avec un lien au présent. 'I've lost my keys' = je les ai perdues et je ne les ai toujours pas. 'I lost my keys yesterday' = fait passé daté.",
      comparison: ["present_simple", "past_simple", "present_perfect_continuous"],
      signalWords: ["already", "yet", "just", "ever", "never", "since", "for", "recently", "so far", "up to now", "lately"]
    },
    {
      id: "present_perfect_continuous",
      name: "Present Perfect Continuous",
      nameFR: "Present Perfect Continuous",
      category: "perfect",
      level: "intermediate",
      structure: "Sujet + have/has + been + verbe-ing",
      structureNeg: "Sujet + have/has + not + been + verbe-ing",
      structureQ: "Have/Has + sujet + been + verbe-ing ?",
      explanation: "Le Present Perfect Continuous met l'accent sur la durée d'une action commencée dans le passé et qui continue (ou vient juste de finir avec un résultat visible).",
      usage: [
        "Action qui dure depuis un moment : I've been studying for three hours.",
        "Activité récente avec résultat visible : You're out of breath. Have you been running?",
        "Insister sur la durée : She's been working here since 2018.",
        "Action temporaire en cours : I've been reading that book you lent me."
      ],
      examples: [
        { en: "I've been waiting for you for ages!", fr: "Je t'attends depuis des lustres !" },
        { en: "He's been playing football all afternoon.", fr: "Il joue au football depuis tout l'après-midi." },
        { en: "Have you been crying?", fr: "As-tu pleuré ?" },
        { en: "It's been raining all day.", fr: "Il pleut depuis toute la journée." }
      ],
      timeline: { type: "arrow", start: 5, now: 50, label: "Durée jusqu'à maintenant" },
      commonErrors: [
        { wrong: "I've been knowing him for years.", right: "I've known him for years.", note: "Les stative verbs ne s'utilisent pas au continuous, même au Present Perfect Continuous." },
        { wrong: "I've been reading this book since three hours.", right: "I've been reading this book for three hours.", note: "Since + point de départ (2010, Monday). For + durée (3 hours, 2 weeks)." }
      ],
      nuances: "La différence avec le Present Perfect simple est subtile : le continuous insiste sur la durée et l'activité en cours, le simple sur le résultat ou l'expérience. 'I've painted the room' (c'est fait, résultat) vs 'I've been painting the room' (j'étais occupé à peindre, pas forcément fini).",
      comparison: ["present_perfect", "past_perfect_continuous"],
      signalWords: ["for", "since", "all day", "all morning", "how long", "lately"]
    },
    {
      id: "past_simple",
      name: "Past Simple",
      nameFR: "Prétérit (Past Simple)",
      category: "past",
      level: "beginner",
      structure: "Sujet + verbe au prétérit (2e colonne irréguliers ou -ed)",
      structureNeg: "Sujet + did + not + base verbale",
      structureQ: "Did + sujet + base verbale ?",
      explanation: "Le Past Simple exprime une action terminée, située à un moment précis du passé. C'est le temps du récit et des événements passés datés.",
      usage: [
        "Action terminée dans le passé : I visited London last summer.",
        "Série d'actions passées : He woke up, had breakfast and left.",
        "Habitude passée : When I was a child, I played football every day.",
        "Vérité passée qui n'est plus vraie : She lived in York for five years (elle n'y habite plus)."
      ],
      examples: [
        { en: "She bought a new dress yesterday.", fr: "Elle a acheté une nouvelle robe hier." },
        { en: "They didn't come to the meeting.", fr: "Ils ne sont pas venus à la réunion." },
        { en: "Did you see the match last night?", fr: "As-tu vu le match hier soir ?" },
        { en: "Shakespeare wrote many plays.", fr: "Shakespeare a écrit de nombreuses pièces." }
      ],
      timeline: { type: "point", position: 25, label: "Point dans le passé" },
      commonErrors: [
        { wrong: "I didn't went to school.", right: "I didn't go to school.", note: "Après 'did/didn't', on utilise TOUJOURS la base verbale, jamais le prétérit." },
        { wrong: "She eated pizza.", right: "She ate pizza.", note: "Eat est irrégulier : eat → ate → eaten." }
      ],
      nuances: "Le Past Simple est le temps du récit par excellence. Il contraste avec le Present Perfect : Past Simple = moment passé précisé et action terminée ; Present Perfect = pas de moment précisé ou lien avec le présent. 'I went to France in 2019' (daté) vs 'I've been to France' (expérience de vie).",
      comparison: ["past_continuous", "present_perfect", "past_perfect"],
      signalWords: ["yesterday", "last week/month/year", "ago", "in 2015", "when I was...", "then", "after that"]
    },
    {
      id: "past_continuous",
      name: "Past Continuous",
      nameFR: "Prétérit continu",
      category: "past",
      level: "intermediate",
      structure: "Sujet + was/were + verbe-ing",
      structureNeg: "Sujet + was/were + not + verbe-ing",
      structureQ: "Was/Were + sujet + verbe-ing ?",
      explanation: "Le Past Continuous décrit une action en cours de déroulement à un moment précis du passé, ou une action longue interrompue par une action courte (Past Simple).",
      usage: [
        "Action en cours à un moment du passé : At 8pm, I was watching telly.",
        "Action longue interrompue : I was sleeping when the phone rang.",
        "Deux actions simultanées : While I was cooking, she was reading.",
        "Contexte/atmosphère dans un récit : The sun was shining, birds were singing...",
        "Politesse : I was wondering if you could help me."
      ],
      examples: [
        { en: "I was having a bath when you called.", fr: "Je prenais un bain quand tu as appelé." },
        { en: "They weren't listening to the teacher.", fr: "Ils n'écoutaient pas le professeur." },
        { en: "What were you doing at midnight?", fr: "Que faisiez-vous à minuit ?" },
        { en: "While we were walking, it started to rain.", fr: "Pendant que nous marchions, il a commencé à pleuvoir." }
      ],
      timeline: { type: "range", start: 20, end: 45, label: "Action longue dans le passé" },
      commonErrors: [
        { wrong: "I was knowing the answer.", right: "I knew the answer.", note: "Les stative verbs ne s'utilisent pas au continuous." },
        { wrong: "When I was arriving, she left.", right: "When I arrived, she was leaving.", note: "L'action courte (arrivée) = Past Simple. L'action longue (partir) = Past Continuous." }
      ],
      nuances: "La combinaison Past Continuous + Past Simple est fondamentale : 'While/When + Past Continuous, Past Simple'. Le Continuous donne le contexte (action longue), le Simple l'événement (action courte). 'I was walking home when I saw a fox.'",
      comparison: ["past_simple", "present_continuous"],
      signalWords: ["while", "when", "at 8pm yesterday", "at that moment", "all evening", "as"]
    },
    {
      id: "past_perfect",
      name: "Past Perfect",
      nameFR: "Past Perfect (Pluperfect)",
      category: "perfect",
      level: "advanced",
      structure: "Sujet + had + participe passé",
      structureNeg: "Sujet + had + not + participe passé",
      structureQ: "Had + sujet + participe passé ?",
      explanation: "Le Past Perfect exprime une action passée qui s'est produite AVANT une autre action passée. C'est le 'passé du passé'.",
      usage: [
        "Action antérieure à une autre action passée : When I arrived, the film had already started.",
        "Cause d'un état passé : She was tired because she had worked all day.",
        "Dans le discours indirect : He said he had finished his work.",
        "With 'by the time', 'before', 'after', 'when'"
      ],
      examples: [
        { en: "I had never seen the sea before I went to Cornwall.", fr: "Je n'avais jamais vu la mer avant d'aller en Cornouailles." },
        { en: "They had already eaten when we arrived.", fr: "Ils avaient déjà mangé quand nous sommes arrivés." },
        { en: "Had you studied English before you moved to London?", fr: "Aviez-vous étudié l'anglais avant de déménager à Londres ?" },
        { en: "By the time she was 30, she had travelled to 20 countries.", fr: "À 30 ans, elle avait voyagé dans 20 pays." }
      ],
      timeline: { type: "double-point", first: 15, second: 40, label: "Passé du passé" },
      commonErrors: [
        { wrong: "When I arrived, the film already started.", right: "When I arrived, the film had already started.", note: "Le film a commencé AVANT l'arrivée → Past Perfect." },
        { wrong: "She was tired because she worked all day.", right: "She was tired because she had worked all day.", note: "Le travail a eu lieu AVANT la fatigue → Past Perfect." }
      ],
      nuances: "Le Past Perfect n'est pas toujours obligatoire. Si la chronologie est claire (avec 'before', 'after'), le Past Simple suffit : 'After she finished work, she went home.' Mais il est essentiel pour clarifier l'ordre des événements : 'When I got to the station, the train had left.' (le train était parti avant mon arrivée).",
      comparison: ["past_simple", "past_perfect_continuous", "present_perfect"],
      signalWords: ["already", "just", "never", "before", "by the time", "after", "when", "until"]
    },
    {
      id: "past_perfect_continuous",
      name: "Past Perfect Continuous",
      nameFR: "Past Perfect Continuous",
      category: "perfect",
      level: "advanced",
      structure: "Sujet + had + been + verbe-ing",
      structureNeg: "Sujet + had + not + been + verbe-ing",
      structureQ: "Had + sujet + been + verbe-ing ?",
      explanation: "Le Past Perfect Continuous met l'accent sur la durée d'une action qui était en cours avant un autre moment du passé.",
      usage: [
        "Durée avant un moment passé : I had been waiting for two hours when the bus finally came.",
        "Cause d'un état passé : Her eyes were red because she had been crying.",
        "Activité récente avant un événement passé : The ground was wet because it had been raining."
      ],
      examples: [
        { en: "He had been working there for 10 years before he got promoted.", fr: "Il y travaillait depuis 10 ans avant d'être promu." },
        { en: "They had been arguing for hours.", fr: "Ils se disputaient depuis des heures." },
        { en: "How long had you been studying before the exam?", fr: "Depuis combien de temps étudiez-vous avant l'examen ?" }
      ],
      timeline: { type: "arrow", start: 5, end: 35, label: "Durée avant un point passé" },
      commonErrors: [
        { wrong: "I had been knowing her for years.", right: "I had known her for years.", note: "Stative verb → pas de continuous." }
      ],
      nuances: "Comme le Present Perfect Continuous, il insiste sur la durée plutôt que sur le résultat. La différence avec le Past Perfect simple : 'I had painted the room' (résultat) vs 'I had been painting the room' (activité en cours).",
      comparison: ["past_perfect", "present_perfect_continuous"],
      signalWords: ["for", "since", "how long", "before", "when", "by the time"]
    },
    {
      id: "future_will",
      name: "Future Simple (will)",
      nameFR: "Futur simple (will)",
      category: "future",
      level: "beginner",
      structure: "Sujet + will + base verbale",
      structureNeg: "Sujet + will + not (won't) + base verbale",
      structureQ: "Will + sujet + base verbale ?",
      explanation: "Le futur avec 'will' exprime une décision spontanée, une prédiction, une promesse, ou une offre. C'est le futur de l'improvisation et de la certitude.",
      usage: [
        "Décision spontanée : I'll have a coffee, please.",
        "Prédiction : I think it'll rain tomorrow.",
        "Promesse : I'll always love you.",
        "Offre/aide : I'll carry that bag for you.",
        "Menace/avertissement : Stop or I'll tell the teacher!"
      ],
      examples: [
        { en: "I'll help you with your homework.", fr: "Je t'aiderai avec tes devoirs." },
        { en: "She won't come to the party.", fr: "Elle ne viendra pas à la fête." },
        { en: "Will you marry me?", fr: "Veux-tu m'épouser ?" },
        { en: "I'm sure he'll pass the exam.", fr: "Je suis sûr qu'il réussira l'examen." }
      ],
      timeline: { type: "point", position: 75, label: "Futur" },
      commonErrors: [
        { wrong: "I will to go tomorrow.", right: "I will go tomorrow.", note: "Après 'will', on utilise TOUJOURS la base verbale, sans 'to'." },
        { wrong: "She wills come.", right: "She will come.", note: "'Will' est invariable : pas de -s à la 3e personne." }
      ],
      nuances: "'Will' ne s'utilise PAS pour des plans déjà décidés (→ 'going to'). 'I'll meet you at 6' (décision maintenant) vs 'I'm going to meet him at 6' (déjà prévu). Avec 'think', 'hope', 'probably', 'I'm sure', on utilise généralement 'will'.",
      comparison: ["future_going_to", "present_continuous"],
      signalWords: ["tomorrow", "next week/year", "soon", "in the future", "I think", "I hope", "probably", "I'm sure"]
    },
    {
      id: "future_going_to",
      name: "Future (going to)",
      nameFR: "Futur avec 'going to'",
      category: "future",
      level: "beginner",
      structure: "Sujet + am/is/are + going to + base verbale",
      structureNeg: "Sujet + am/is/are + not + going to + base verbale",
      structureQ: "Am/Is/Are + sujet + going to + base verbale ?",
      explanation: "'Going to' exprime une intention planifiée à l'avance ou une prédiction basée sur une évidence présente.",
      usage: [
        "Intention/plan : I'm going to study medicine at university.",
        "Prédiction avec évidence : Look at those clouds! It's going to rain.",
        "Décision prise avant le moment de parole : We're going to get married in June."
      ],
      examples: [
        { en: "I'm going to visit my grandparents this weekend.", fr: "Je vais rendre visite à mes grands-parents ce week-end." },
        { en: "She's not going to accept the offer.", fr: "Elle ne va pas accepter l'offre." },
        { en: "Are you going to apply for that job?", fr: "Allez-vous postuler pour ce poste ?" },
        { en: "Watch out! That vase is going to fall!", fr: "Attention ! Ce vase va tomber !" }
      ],
      timeline: { type: "point", position: 70, label: "Intention → Futur" },
      commonErrors: [
        { wrong: "I'm going to studying.", right: "I'm going to study.", note: "Après 'going to', on utilise la base verbale, PAS le verbe-ing." },
        { wrong: "He going to leave.", right: "He's going to leave.", note: "Ne pas oublier le verbe 'be' (am/is/are)." }
      ],
      nuances: "La différence clé avec 'will' : 'going to' = planifié/intention, 'will' = décision spontanée. 'I'm going to buy a car' (j'y ai réfléchi, c'est prévu) vs 'I'll buy a car' (décision prise maintenant). Pour les prédictions : 'going to' quand il y a une évidence visible, 'will' pour une opinion.",
      comparison: ["future_will", "present_continuous"],
      signalWords: ["tonight", "this weekend", "next month", "I've decided", "I plan to", "look!", "watch out!"]
    },
    {
      id: "future_continuous",
      name: "Future Continuous",
      nameFR: "Futur continu",
      category: "future",
      level: "advanced",
      structure: "Sujet + will be + verbe-ing",
      structureNeg: "Sujet + will not be + verbe-ing",
      structureQ: "Will + sujet + be + verbe-ing ?",
      explanation: "Le Future Continuous décrit une action qui sera en cours de déroulement à un moment précis du futur.",
      usage: [
        "Action en cours à un moment futur : This time tomorrow, I'll be flying to Edinburgh.",
        "Action future prévue/attendue : She'll be waiting for you at the station.",
        "Question polie : Will you be using the car tonight?",
        "Événements inévitables : I'll be seeing him at the meeting anyway."
      ],
      examples: [
        { en: "At 9pm tonight, I'll be watching the match.", fr: "À 21h ce soir, je regarderai le match." },
        { en: "This time next week, we'll be lying on a beach in Cornwall.", fr: "La semaine prochaine à cette heure, nous serons allongés sur une plage en Cornouailles." },
        { en: "Will you be coming to the office tomorrow?", fr: "Viendrez-vous au bureau demain ?" }
      ],
      timeline: { type: "range", start: 65, end: 85, label: "En cours dans le futur" },
      commonErrors: [
        { wrong: "I'll being working.", right: "I'll be working.", note: "La structure est 'will be + ing', pas 'will being'." }
      ],
      nuances: "Le Future Continuous est souvent utilisé pour parler d'actions routinières futures ou pour poser des questions polies (moins direct que 'Will you...?'). 'Will you be staying for dinner?' est plus poli que 'Will you stay for dinner?'",
      comparison: ["future_will", "future_perfect"],
      signalWords: ["this time tomorrow", "at 8pm tonight", "at this time next week", "in an hour's time"]
    },
    {
      id: "future_perfect",
      name: "Future Perfect",
      nameFR: "Futur antérieur",
      category: "future",
      level: "advanced",
      structure: "Sujet + will have + participe passé",
      structureNeg: "Sujet + will not have + participe passé",
      structureQ: "Will + sujet + have + participe passé ?",
      explanation: "Le Future Perfect exprime une action qui sera terminée AVANT un moment précis du futur.",
      usage: [
        "Action terminée avant un moment futur : By 6pm, I'll have finished the report.",
        "Avec 'by', 'by the time', 'before' : By the time you arrive, we'll have left.",
        "Durée jusqu'à un point futur : By next year, I'll have worked here for a decade."
      ],
      examples: [
        { en: "By the end of this month, I'll have read three books.", fr: "D'ici la fin du mois, j'aurai lu trois livres." },
        { en: "She'll have graduated by 2028.", fr: "Elle aura obtenu son diplôme d'ici 2028." },
        { en: "Will you have finished by Friday?", fr: "Aurez-vous fini d'ici vendredi ?" }
      ],
      timeline: { type: "arrow", start: 10, end: 60, label: "Terminé avant un point futur" },
      commonErrors: [
        { wrong: "By tomorrow, I will finished.", right: "By tomorrow, I will have finished.", note: "Il faut 'will have + participe passé', pas juste 'will + participe passé'." }
      ],
      nuances: "Le mot-clé est 'by' (d'ici). Le Future Perfect regarde depuis un point futur vers le passé de ce point. C'est l'équivalent du futur antérieur français, mais utilisé beaucoup moins fréquemment en anglais qu'en français.",
      comparison: ["future_will", "future_perfect_continuous"],
      signalWords: ["by", "by the time", "by then", "before", "by the end of", "in two years' time"]
    },
    {
      id: "future_perfect_continuous",
      name: "Future Perfect Continuous",
      nameFR: "Futur Perfect Continuous",
      category: "future",
      level: "advanced",
      structure: "Sujet + will have been + verbe-ing",
      structureNeg: "Sujet + will not have been + verbe-ing",
      structureQ: "Will + sujet + have been + verbe-ing ?",
      explanation: "Le Future Perfect Continuous met l'accent sur la durée d'une action qui aura été en cours jusqu'à un moment du futur.",
      usage: [
        "Durée jusqu'à un point futur : By December, I'll have been working here for five years.",
        "Insister sur la continuité : She'll have been studying for six hours by the time the exam starts."
      ],
      examples: [
        { en: "By next month, we'll have been living in this house for 20 years.", fr: "Le mois prochain, nous vivrons dans cette maison depuis 20 ans." },
        { en: "How long will you have been learning English by the end of this course?", fr: "Depuis combien de temps apprendrez-vous l'anglais à la fin de ce cours ?" }
      ],
      timeline: { type: "arrow", start: 5, end: 55, label: "Durée jusqu'à un point futur" },
      commonErrors: [],
      nuances: "C'est le temps le plus rare en anglais. On l'utilise presque exclusivement avec 'for' + durée et 'by' + point futur. Souvent, on peut le remplacer par le Future Perfect simple sans perdre de sens significatif.",
      comparison: ["future_perfect", "present_perfect_continuous"],
      signalWords: ["by... for...", "by the time... for..."]
    },
    {
      id: "conditional_0",
      name: "Zero Conditional",
      nameFR: "Conditionnel zéro",
      category: "conditionals",
      level: "intermediate",
      structure: "If + Present Simple, Present Simple",
      explanation: "Le Zero Conditional exprime des vérités générales, des faits scientifiques, des règles. C'est une relation de cause à effet toujours vraie.",
      usage: [
        "Vérités scientifiques : If you heat ice, it melts.",
        "Règles/instructions : If the alarm rings, leave the building.",
        "Habitudes : If I'm tired, I go to bed early."
      ],
      examples: [
        { en: "If you mix red and blue, you get purple.", fr: "Si vous mélangez du rouge et du bleu, vous obtenez du violet." },
        { en: "If it rains, the grass gets wet.", fr: "S'il pleut, l'herbe devient mouillée." }
      ],
      timeline: { type: "cycle", label: "Toujours vrai" },
      commonErrors: [
        { wrong: "If you will heat water, it boils.", right: "If you heat water, it boils.", note: "Pas de 'will' dans la proposition avec 'if' dans les conditionnels." }
      ],
      nuances: "On peut remplacer 'if' par 'when' sans changer le sens : 'When you heat water to 100°C, it boils.' Les deux propositions sont au Present Simple.",
      comparison: ["conditional_1"],
      signalWords: ["if", "when", "whenever"]
    },
    {
      id: "conditional_1",
      name: "First Conditional",
      nameFR: "Premier conditionnel",
      category: "conditionals",
      level: "intermediate",
      structure: "If + Present Simple, will + base verbale",
      explanation: "Le First Conditional exprime une situation réelle ou très probable dans le futur.",
      usage: [
        "Conséquence probable : If it rains, I'll take an umbrella.",
        "Avertissements : If you don't hurry, you'll miss the train.",
        "Promesses conditionnelles : If you pass your exams, I'll buy you a car."
      ],
      examples: [
        { en: "If she studies hard, she'll pass the exam.", fr: "Si elle étudie bien, elle réussira l'examen." },
        { en: "If we don't leave now, we'll be late.", fr: "Si nous ne partons pas maintenant, nous serons en retard." },
        { en: "If the weather is nice, we'll go to the seaside.", fr: "S'il fait beau, nous irons à la mer." }
      ],
      timeline: { type: "conditional", condition: 30, result: 65, label: "Possible → Futur probable" },
      commonErrors: [
        { wrong: "If it will rain, I'll stay home.", right: "If it rains, I'll stay home.", note: "Jamais de 'will' après 'if'. Le Present Simple suffit dans la condition." },
        { wrong: "If I will have time, I'll call you.", right: "If I have time, I'll call you.", note: "Même règle : Present Simple dans la clause avec 'if'." }
      ],
      nuances: "On peut utiliser d'autres modaux que 'will' dans la conséquence : 'If you study hard, you should pass.' On peut aussi utiliser l'impératif : 'If you see him, tell him to call me.' La condition est réelle et possible.",
      comparison: ["conditional_0", "conditional_2"],
      signalWords: ["if", "unless", "as long as", "provided that", "in case"]
    },
    {
      id: "conditional_2",
      name: "Second Conditional",
      nameFR: "Deuxième conditionnel",
      category: "conditionals",
      level: "intermediate",
      structure: "If + Past Simple, would + base verbale",
      explanation: "Le Second Conditional exprime une situation hypothétique, imaginaire ou peu probable dans le présent ou le futur.",
      usage: [
        "Situation imaginaire : If I won the lottery, I would travel the world.",
        "Conseil : If I were you, I'd apologise.",
        "Situation irréelle : If I had more time, I would learn Japanese."
      ],
      examples: [
        { en: "If I were rich, I would buy a castle in Scotland.", fr: "Si j'étais riche, j'achèterais un château en Écosse." },
        { en: "If she spoke French, she would move to Paris.", fr: "Si elle parlait français, elle déménagerait à Paris." },
        { en: "What would you do if you lost your job?", fr: "Que feriez-vous si vous perdiez votre emploi ?" }
      ],
      timeline: { type: "conditional", condition: 30, result: 65, label: "Hypothèse → Irréel" },
      commonErrors: [
        { wrong: "If I would be you, I would...", right: "If I were you, I would...", note: "On utilise le Past Simple (were) dans la condition, pas 'would'. 'Were' est préférable à 'was' pour tous les sujets dans le conditionnel." }
      ],
      nuances: "Avec 'be', on utilise traditionnellement 'were' pour tous les sujets : 'If I were you', 'If she were here'. Dans l'anglais courant, 'was' est accepté pour I/he/she/it, mais 'were' reste la forme recommandée dans un contexte formel et aux examens.",
      comparison: ["conditional_1", "conditional_3"],
      signalWords: ["if", "if I were you", "what would you do if..."]
    },
    {
      id: "conditional_3",
      name: "Third Conditional",
      nameFR: "Troisième conditionnel",
      category: "conditionals",
      level: "advanced",
      structure: "If + Past Perfect, would have + participe passé",
      explanation: "Le Third Conditional exprime une situation imaginaire dans le passé (irréelle, car le passé ne peut pas être changé). C'est le conditionnel du regret.",
      usage: [
        "Regrets : If I had studied harder, I would have passed.",
        "Situations passées irréelles : If she had caught the train, she wouldn't have been late.",
        "Critique rétrospective : If you had told me, I would have helped."
      ],
      examples: [
        { en: "If I had known about the traffic, I would have left earlier.", fr: "Si j'avais su pour les embouteillages, je serais parti plus tôt." },
        { en: "If they had invested in Bitcoin, they would have made a fortune.", fr: "S'ils avaient investi dans le Bitcoin, ils auraient fait fortune." },
        { en: "She wouldn't have missed the flight if she had set an alarm.", fr: "Elle n'aurait pas raté le vol si elle avait mis un réveil." }
      ],
      timeline: { type: "conditional", condition: 15, result: 40, label: "Passé irréel → Regret" },
      commonErrors: [
        { wrong: "If I would have known, I would have...", right: "If I had known, I would have...", note: "Jamais de 'would' dans la clause avec 'if'. On utilise le Past Perfect." }
      ],
      nuances: "Le Third Conditional est le temps du regret et de l'imagination rétrospective. La situation décrite ne s'est PAS produite. 'If I had studied harder' implique que je n'ai PAS étudié assez. On peut aussi exprimer la colère ou le soulagement : 'If you had told me the truth, I wouldn't have been so angry.'",
      comparison: ["conditional_2", "mixed_conditional"],
      signalWords: ["if", "if only", "I wish"]
    },
    {
      id: "mixed_conditional",
      name: "Mixed Conditionals",
      nameFR: "Conditionnels mixtes",
      category: "conditionals",
      level: "advanced",
      structure: "If + Past Perfect, would + base verbale (Type 3→2) OU If + Past Simple, would have + participe passé (Type 2→3)",
      explanation: "Les conditionnels mixtes combinent des temps différents pour exprimer une condition dans un temps et une conséquence dans un autre.",
      usage: [
        "Condition passée → conséquence présente : If I had studied medicine, I would be a doctor now.",
        "Condition permanente → conséquence passée : If she were more careful, she wouldn't have had that accident."
      ],
      examples: [
        { en: "If I had accepted that job, I would be living in London now.", fr: "Si j'avais accepté ce poste, je vivrais à Londres maintenant." },
        { en: "If he weren't so stubborn, he would have apologised.", fr: "S'il n'était pas si têtu, il se serait excusé." }
      ],
      timeline: { type: "conditional", condition: 20, result: 60, label: "Temps croisés" },
      commonErrors: [],
      nuances: "Les mixed conditionnels sont très courants dans la conversation naturelle. Il faut identifier si la condition est dans le passé (→ Past Perfect) ou permanente (→ Past Simple), et si la conséquence est dans le présent (→ would + base) ou le passé (→ would have + pp).",
      comparison: ["conditional_2", "conditional_3"],
      signalWords: ["if", "now", "at that time"]
    }
  ],

  // Modal verbs
  modals: [
    { id: "can", name: "Can / Could", ability: "Capacité", examples: ["I can swim.", "I could run fast when I was young."], nuance: "'Can' = capacité présente. 'Could' = capacité passée ou demande polie." },
    { id: "may", name: "May / Might", ability: "Possibilité / Permission", examples: ["It may rain tomorrow.", "Might I borrow your pen?"], nuance: "'Might' est moins certain que 'may'. 'May I' est très poli." },
    { id: "must", name: "Must / Have to", ability: "Obligation", examples: ["You must wear a seatbelt.", "I have to finish this report."], nuance: "'Must' = obligation interne/personnelle. 'Have to' = obligation externe/imposée." },
    { id: "should", name: "Should / Ought to", ability: "Conseil", examples: ["You should see a doctor.", "You ought to apologise."], nuance: "'Should' est le plus courant. 'Ought to' est plus formel." },
    { id: "would", name: "Would", ability: "Conditionnel / Habitude passée", examples: ["I would help if I could.", "When I was a child, I would play in the garden."], nuance: "'Would' pour les actions répétées dans le passé, mais pas pour les états : 'I used to live in Paris' ✓ mais pas 'I would live in Paris' pour un état." },
    { id: "shall", name: "Shall", ability: "Suggestion / Futur formel", examples: ["Shall we go?", "I shall endeavour to help."], nuance: "'Shall' est rare en anglais moderne, sauf dans les suggestions ('Shall we...?') et le langage juridique." },
    { id: "need", name: "Need (n't)", ability: "Nécessité", examples: ["You needn't worry.", "Need I say more?"], nuance: "'Needn't' = il n'est pas nécessaire. Différent de 'don't have to' (même sens, structure différente)." },
    { id: "dare", name: "Dare", ability: "Oser", examples: ["How dare you!", "I dare not tell her."], nuance: "Rare comme modal. Plus courant comme verbe normal : 'He dared to speak up'." },
    { id: "used_to", name: "Used to", ability: "Habitude passée révolue", examples: ["I used to smoke, but I quit.", "Did you use to play tennis?"], nuance: "Exprime un état ou une habitude passée qui n'est plus vraie aujourd'hui. Ne pas confondre avec 'be used to' (être habitué à)." },
    { id: "had_better", name: "Had better", ability: "Conseil fort / Avertissement", examples: ["You'd better leave now.", "We had better not wake him up."], nuance: "Plus fort que 'should'. Implique une conséquence négative si le conseil n'est pas suivi." },
    { id: "be_able_to", name: "Be able to", ability: "Capacité (tous les temps)", examples: ["I will be able to help you tomorrow.", "She hasn't been able to sleep."], nuance: "Sert de substitut à 'can' pour les temps où 'can' ne peut pas être conjugué (futur, perfect, infinitif)." }
  ],

  // Passive voice info
  passiveInfo: {
    structure: "Sujet + be (au temps voulu) + participe passé (+ by + agent)",
    explanation: "La voix passive met l'accent sur l'action ou le receveur plutôt que sur l'agent. Elle est très fréquente en anglais académique, journalistique et scientifique.",
    examples: [
      { active: "The chef prepared the meal.", passive: "The meal was prepared by the chef.", tense: "Past Simple" },
      { active: "They are building a new hospital.", passive: "A new hospital is being built.", tense: "Present Continuous" },
      { active: "Someone has stolen my bike.", passive: "My bike has been stolen.", tense: "Present Perfect" }
    ],
    nuances: "L'agent (by...) est souvent omis quand il est inconnu, évident ou sans importance : 'The bank was robbed last night.' La passive est plus formelle que l'active."
  },

  // Reported speech
  reportedSpeech: {
    explanation: "Le discours indirect (reported speech) rapporte les paroles de quelqu'un sans les citer mot pour mot. Les temps verbaux 'reculent' d'un cran.",
    rules: [
      { direct: "Present Simple →", reported: "Past Simple", example: '"I like tea" → She said she liked tea.' },
      { direct: "Present Continuous →", reported: "Past Continuous", example: '"I am working" → He said he was working.' },
      { direct: "Past Simple →", reported: "Past Perfect", example: '"I went home" → She said she had gone home.' },
      { direct: "Present Perfect →", reported: "Past Perfect", example: '"I have finished" → He said he had finished.' },
      { direct: "will →", reported: "would", example: '"I will help" → She said she would help.' },
      { direct: "can →", reported: "could", example: '"I can swim" → He said he could swim.' },
      { direct: "must →", reported: "had to", example: '"I must go" → She said she had to go.' }
    ],
    timeChanges: [
      { direct: "now", reported: "then" },
      { direct: "today", reported: "that day" },
      { direct: "yesterday", reported: "the day before" },
      { direct: "tomorrow", reported: "the following day" },
      { direct: "last week", reported: "the previous week" },
      { direct: "here", reported: "there" },
      { direct: "this", reported: "that" }
    ]
  },

  // Irregular verbs (comprehensive list)
  irregularVerbs: [
    { base: "arise", past: "arose", pp: "arisen", meaning: "survenir, se lever" },
    { base: "awake", past: "awoke", pp: "awoken", meaning: "réveiller" },
    { base: "be", past: "was/were", pp: "been", meaning: "être" },
    { base: "bear", past: "bore", pp: "borne/born", meaning: "supporter, donner naissance" },
    { base: "beat", past: "beat", pp: "beaten", meaning: "battre" },
    { base: "become", past: "became", pp: "become", meaning: "devenir" },
    { base: "begin", past: "began", pp: "begun", meaning: "commencer" },
    { base: "bend", past: "bent", pp: "bent", meaning: "plier, courber" },
    { base: "bet", past: "bet", pp: "bet", meaning: "parier" },
    { base: "bind", past: "bound", pp: "bound", meaning: "lier" },
    { base: "bite", past: "bit", pp: "bitten", meaning: "mordre" },
    { base: "bleed", past: "bled", pp: "bled", meaning: "saigner" },
    { base: "blow", past: "blew", pp: "blown", meaning: "souffler" },
    { base: "break", past: "broke", pp: "broken", meaning: "casser" },
    { base: "breed", past: "bred", pp: "bred", meaning: "élever, se reproduire" },
    { base: "bring", past: "brought", pp: "brought", meaning: "apporter" },
    { base: "build", past: "built", pp: "built", meaning: "construire" },
    { base: "burn", past: "burnt/burned", pp: "burnt/burned", meaning: "brûler" },
    { base: "burst", past: "burst", pp: "burst", meaning: "éclater" },
    { base: "buy", past: "bought", pp: "bought", meaning: "acheter" },
    { base: "catch", past: "caught", pp: "caught", meaning: "attraper" },
    { base: "choose", past: "chose", pp: "chosen", meaning: "choisir" },
    { base: "cling", past: "clung", pp: "clung", meaning: "s'agripper" },
    { base: "come", past: "came", pp: "come", meaning: "venir" },
    { base: "cost", past: "cost", pp: "cost", meaning: "coûter" },
    { base: "creep", past: "crept", pp: "crept", meaning: "ramper" },
    { base: "cut", past: "cut", pp: "cut", meaning: "couper" },
    { base: "deal", past: "dealt", pp: "dealt", meaning: "traiter, distribuer" },
    { base: "dig", past: "dug", pp: "dug", meaning: "creuser" },
    { base: "do", past: "did", pp: "done", meaning: "faire" },
    { base: "draw", past: "drew", pp: "drawn", meaning: "dessiner, tirer" },
    { base: "dream", past: "dreamt/dreamed", pp: "dreamt/dreamed", meaning: "rêver" },
    { base: "drink", past: "drank", pp: "drunk", meaning: "boire" },
    { base: "drive", past: "drove", pp: "driven", meaning: "conduire" },
    { base: "eat", past: "ate", pp: "eaten", meaning: "manger" },
    { base: "fall", past: "fell", pp: "fallen", meaning: "tomber" },
    { base: "feed", past: "fed", pp: "fed", meaning: "nourrir" },
    { base: "feel", past: "felt", pp: "felt", meaning: "sentir, ressentir" },
    { base: "fight", past: "fought", pp: "fought", meaning: "combattre" },
    { base: "find", past: "found", pp: "found", meaning: "trouver" },
    { base: "flee", past: "fled", pp: "fled", meaning: "s'enfuir" },
    { base: "fling", past: "flung", pp: "flung", meaning: "lancer violemment" },
    { base: "fly", past: "flew", pp: "flown", meaning: "voler" },
    { base: "forbid", past: "forbade", pp: "forbidden", meaning: "interdire" },
    { base: "forget", past: "forgot", pp: "forgotten", meaning: "oublier" },
    { base: "forgive", past: "forgave", pp: "forgiven", meaning: "pardonner" },
    { base: "freeze", past: "froze", pp: "frozen", meaning: "geler" },
    { base: "get", past: "got", pp: "got/gotten", meaning: "obtenir" },
    { base: "give", past: "gave", pp: "given", meaning: "donner" },
    { base: "go", past: "went", pp: "gone", meaning: "aller" },
    { base: "grind", past: "ground", pp: "ground", meaning: "moudre" },
    { base: "grow", past: "grew", pp: "grown", meaning: "grandir, cultiver" },
    { base: "hang", past: "hung", pp: "hung", meaning: "suspendre" },
    { base: "have", past: "had", pp: "had", meaning: "avoir" },
    { base: "hear", past: "heard", pp: "heard", meaning: "entendre" },
    { base: "hide", past: "hid", pp: "hidden", meaning: "cacher" },
    { base: "hit", past: "hit", pp: "hit", meaning: "frapper" },
    { base: "hold", past: "held", pp: "held", meaning: "tenir" },
    { base: "hurt", past: "hurt", pp: "hurt", meaning: "blesser" },
    { base: "keep", past: "kept", pp: "kept", meaning: "garder" },
    { base: "kneel", past: "knelt", pp: "knelt", meaning: "s'agenouiller" },
    { base: "know", past: "knew", pp: "known", meaning: "savoir, connaître" },
    { base: "lay", past: "laid", pp: "laid", meaning: "poser, pondre" },
    { base: "lead", past: "led", pp: "led", meaning: "mener, conduire" },
    { base: "lean", past: "leant/leaned", pp: "leant/leaned", meaning: "s'appuyer, pencher" },
    { base: "leap", past: "leapt/leaped", pp: "leapt/leaped", meaning: "sauter" },
    { base: "learn", past: "learnt/learned", pp: "learnt/learned", meaning: "apprendre" },
    { base: "leave", past: "left", pp: "left", meaning: "quitter, laisser" },
    { base: "lend", past: "lent", pp: "lent", meaning: "prêter" },
    { base: "let", past: "let", pp: "let", meaning: "laisser, permettre" },
    { base: "lie", past: "lay", pp: "lain", meaning: "être allongé" },
    { base: "light", past: "lit", pp: "lit", meaning: "allumer" },
    { base: "lose", past: "lost", pp: "lost", meaning: "perdre" },
    { base: "make", past: "made", pp: "made", meaning: "fabriquer, faire" },
    { base: "mean", past: "meant", pp: "meant", meaning: "signifier, vouloir dire" },
    { base: "meet", past: "met", pp: "met", meaning: "rencontrer" },
    { base: "mistake", past: "mistook", pp: "mistaken", meaning: "se méprendre" },
    { base: "overcome", past: "overcame", pp: "overcome", meaning: "surmonter" },
    { base: "pay", past: "paid", pp: "paid", meaning: "payer" },
    { base: "put", past: "put", pp: "put", meaning: "mettre, placer" },
    { base: "quit", past: "quit", pp: "quit", meaning: "quitter, arrêter" },
    { base: "read", past: "read", pp: "read", meaning: "lire (⚠️ le passé se prononce /rɛd/, le présent /riːd/)" },
    { base: "ride", past: "rode", pp: "ridden", meaning: "monter (cheval, vélo)" },
    { base: "ring", past: "rang", pp: "rung", meaning: "sonner" },
    { base: "rise", past: "rose", pp: "risen", meaning: "s'élever, se lever" },
    { base: "run", past: "ran", pp: "run", meaning: "courir" },
    { base: "say", past: "said", pp: "said", meaning: "dire" },
    { base: "see", past: "saw", pp: "seen", meaning: "voir" },
    { base: "seek", past: "sought", pp: "sought", meaning: "chercher" },
    { base: "sell", past: "sold", pp: "sold", meaning: "vendre" },
    { base: "send", past: "sent", pp: "sent", meaning: "envoyer" },
    { base: "set", past: "set", pp: "set", meaning: "installer, régler" },
    { base: "sew", past: "sewed", pp: "sewn/sewed", meaning: "coudre" },
    { base: "shake", past: "shook", pp: "shaken", meaning: "secouer" },
    { base: "shine", past: "shone", pp: "shone", meaning: "briller" },
    { base: "shoot", past: "shot", pp: "shot", meaning: "tirer" },
    { base: "show", past: "showed", pp: "shown", meaning: "montrer" },
    { base: "shrink", past: "shrank", pp: "shrunk", meaning: "rétrécir" },
    { base: "shut", past: "shut", pp: "shut", meaning: "fermer" },
    { base: "sing", past: "sang", pp: "sung", meaning: "chanter" },
    { base: "sink", past: "sank", pp: "sunk", meaning: "couler" },
    { base: "sit", past: "sat", pp: "sat", meaning: "s'asseoir" },
    { base: "sleep", past: "slept", pp: "slept", meaning: "dormir" },
    { base: "slide", past: "slid", pp: "slid", meaning: "glisser" },
    { base: "speak", past: "spoke", pp: "spoken", meaning: "parler" },
    { base: "speed", past: "sped", pp: "sped", meaning: "aller vite" },
    { base: "spell", past: "spelt/spelled", pp: "spelt/spelled", meaning: "épeler" },
    { base: "spend", past: "spent", pp: "spent", meaning: "dépenser, passer du temps" },
    { base: "spill", past: "spilt/spilled", pp: "spilt/spilled", meaning: "renverser" },
    { base: "spin", past: "spun", pp: "spun", meaning: "tourner, filer" },
    { base: "spit", past: "spat", pp: "spat", meaning: "cracher" },
    { base: "split", past: "split", pp: "split", meaning: "fendre, diviser" },
    { base: "spoil", past: "spoilt/spoiled", pp: "spoilt/spoiled", meaning: "gâter, abîmer" },
    { base: "spread", past: "spread", pp: "spread", meaning: "répandre, étaler" },
    { base: "spring", past: "sprang", pp: "sprung", meaning: "jaillir, bondir" },
    { base: "stand", past: "stood", pp: "stood", meaning: "se tenir debout" },
    { base: "steal", past: "stole", pp: "stolen", meaning: "voler" },
    { base: "stick", past: "stuck", pp: "stuck", meaning: "coller, planter" },
    { base: "sting", past: "stung", pp: "stung", meaning: "piquer" },
    { base: "stink", past: "stank", pp: "stunk", meaning: "puer" },
    { base: "strike", past: "struck", pp: "struck", meaning: "frapper" },
    { base: "swear", past: "swore", pp: "sworn", meaning: "jurer" },
    { base: "sweep", past: "swept", pp: "swept", meaning: "balayer" },
    { base: "swell", past: "swelled", pp: "swollen", meaning: "gonfler" },
    { base: "swim", past: "swam", pp: "swum", meaning: "nager" },
    { base: "swing", past: "swung", pp: "swung", meaning: "balancer" },
    { base: "take", past: "took", pp: "taken", meaning: "prendre" },
    { base: "teach", past: "taught", pp: "taught", meaning: "enseigner" },
    { base: "tear", past: "tore", pp: "torn", meaning: "déchirer" },
    { base: "tell", past: "told", pp: "told", meaning: "dire, raconter" },
    { base: "think", past: "thought", pp: "thought", meaning: "penser" },
    { base: "throw", past: "threw", pp: "thrown", meaning: "jeter" },
    { base: "understand", past: "understood", pp: "understood", meaning: "comprendre" },
    { base: "undertake", past: "undertook", pp: "undertaken", meaning: "entreprendre" },
    { base: "upset", past: "upset", pp: "upset", meaning: "bouleverser" },
    { base: "wake", past: "woke", pp: "woken", meaning: "réveiller" },
    { base: "wear", past: "wore", pp: "worn", meaning: "porter (vêtement)" },
    { base: "weave", past: "wove", pp: "woven", meaning: "tisser" },
    { base: "weep", past: "wept", pp: "wept", meaning: "pleurer" },
    { base: "win", past: "won", pp: "won", meaning: "gagner" },
    { base: "wind", past: "wound", pp: "wound", meaning: "enrouler" },
    { base: "withdraw", past: "withdrew", pp: "withdrawn", meaning: "retirer" },
    { base: "write", past: "wrote", pp: "written", meaning: "écrire" }
  ],

  // Common phrasal verbs (Base de données enrichie V2)
  phrasalVerbs: [
    { pv: "give up", meaning: "abandonner", example: "Don't give up!" },
    { pv: "look after", meaning: "s'occuper de", example: "Can you look after my cat?" },
    { pv: "put off", meaning: "remettre à plus tard", example: "Don't put off your homework." },
    { pv: "turn down", meaning: "refuser / baisser le son", example: "She turned down the offer." },
    { pv: "come across", meaning: "tomber sur par hasard", example: "I came across an old photo." },
    { pv: "get along with", meaning: "bien s'entendre avec", example: "I get along well with my colleagues." },
    { pv: "run out of", meaning: "ne plus avoir", example: "We've run out of milk." },
    { pv: "bring up", meaning: "élever / mentionner", example: "She was brought up in Liverpool." },
    { pv: "carry on", meaning: "continuer", example: "Carry on with your work." },
    { pv: "find out", meaning: "découvrir, apprendre", example: "I found out the truth." },
    { pv: "look forward to", meaning: "avoir hâte de", example: "I'm looking forward to the holidays." },
    { pv: "take off", meaning: "décoller / enlever", example: "The plane took off on time." },
    { pv: "break down", meaning: "tomber en panne / craquer", example: "My car broke down on the motorway." },
    { pv: "call off", meaning: "annuler", example: "They called off the meeting due to rain." },
    { pv: "catch up", meaning: "rattraper son retard", example: "I need to catch up on my sleep." },
    { pv: "figure out", meaning: "comprendre, résoudre", example: "I can't figure out this math problem." },
    { pv: "get over", meaning: "se remettre (maladie/rupture)", example: "It took him months to get over the flu." },
    { pv: "look up", meaning: "chercher (une information)", example: "If you don't know the word, look it up." },
    { pv: "make up", meaning: "inventer / se réconcilier", example: "He made up a crazy story." },
    { pv: "pass away", meaning: "mourir (euphémisme)", example: "Her grandfather passed away last night." },
    { pv: "point out", meaning: "signaler, faire remarquer", example: "I'd like to point out a mistake." },
    { pv: "set up", meaning: "installer, fonder", example: "She set up her own business." },
    { pv: "show up", meaning: "arriver, se pointer", example: "He showed up two hours late." },
    { pv: "take over", meaning: "prendre le contrôle", example: "The new manager will take over tomorrow." },
    { pv: "turn out", meaning: "s'avérer", example: "The movie turned out to be great." },
    { pv: "work out", meaning: "faire du sport / résoudre", example: "I work out three times a week." }
  ],

  // Lesson modules
  modules: [
    {
      id: "mod_basics",
      name: "Les bases",
      level: "beginner",
      icon: "🌱",
      color: "var(--secondary)",
      lessons: [
        { id: "l_present_simple", tenseId: "present_simple", title: "Present Simple", desc: "Habitudes, vérités générales, routines", exercises: 15 },
        { id: "l_present_continuous", tenseId: "present_continuous", title: "Present Continuous", desc: "Actions en cours, situations temporaires", exercises: 15 },
        { id: "l_past_simple", tenseId: "past_simple", title: "Past Simple", desc: "Actions terminées dans le passé", exercises: 20 },
        { id: "l_future_will", tenseId: "future_will", title: "Future Simple (will)", desc: "Décisions spontanées, prédictions", exercises: 15 },
        { id: "l_future_going_to", tenseId: "future_going_to", title: "Going to", desc: "Intentions et plans", exercises: 12 }
      ]
    },
    {
      id: "mod_intermediate",
      name: "Intermédiaire",
      level: "intermediate",
      icon: "🌿",
      color: "var(--warning)",
      lessons: [
        { id: "l_present_perfect", tenseId: "present_perfect", title: "Present Perfect", desc: "Lien passé-présent, expériences", exercises: 20 },
        { id: "l_past_continuous", tenseId: "past_continuous", title: "Past Continuous", desc: "Actions longues dans le passé", exercises: 15 },
        { id: "l_zero_cond", tenseId: "conditional_0", title: "Zero Conditional", desc: "Vérités générales et causes", exercises: 10 },
        { id: "l_first_cond", tenseId: "conditional_1", title: "First Conditional", desc: "Situations réelles et probables", exercises: 15 },
        { id: "l_second_cond", tenseId: "conditional_2", title: "Second Conditional", desc: "Situations hypothétiques", exercises: 15 }
      ]
    },
    {
      id: "mod_advanced",
      name: "Avancé",
      level: "advanced",
      icon: "🌳",
      color: "var(--accent)",
      lessons: [
        { id: "l_present_perfect_cont", tenseId: "present_perfect_continuous", title: "Present Perfect Continuous", desc: "Durée jusqu'au présent", exercises: 15 },
        { id: "l_past_perfect", tenseId: "past_perfect", title: "Past Perfect", desc: "Le passé du passé", exercises: 15 },
        { id: "l_past_perfect_cont", tenseId: "past_perfect_continuous", title: "Past Perfect Continuous", desc: "Durée avant un point passé", exercises: 12 },
        { id: "l_third_cond", tenseId: "conditional_3", title: "Third Conditional", desc: "Regrets et situations irréelles passées", exercises: 15 },
        { id: "l_mixed_cond", tenseId: "mixed_conditional", title: "Mixed Conditionals", desc: "Conditions à temps croisés", exercises: 12 }
      ]
    },
    {
      id: "mod_expert",
      name: "Expert",
      level: "advanced",
      icon: "🏔️",
      color: "var(--danger)",
      lessons: [
        { id: "l_future_continuous", tenseId: "future_continuous", title: "Future Continuous", desc: "Actions en cours dans le futur", exercises: 12 },
        { id: "l_future_perfect", tenseId: "future_perfect", title: "Future Perfect", desc: "Actions terminées avant un futur", exercises: 12 },
        { id: "l_future_perfect_cont", tenseId: "future_perfect_continuous", title: "Future Perfect Continuous", desc: "Durée jusqu'à un futur", exercises: 10 },
        { id: "l_passive", tenseId: null, title: "Voix Passive", desc: "Formation et usage de la passive", exercises: 15 },
        { id: "l_reported", tenseId: null, title: "Discours Indirect", desc: "Reported speech et concordance des temps", exercises: 15 }
      ]
    }
  ],

  // Exercise sentence templates (Base de données enrichie V2)
  exerciseTemplates: {
    present_simple: {
      qcm: [
        { sentence: "She ___ to work by bus every day.", options: ["go", "goes", "going", "went"], correct: 1, explanation: "3e personne du singulier → on ajoute -es à go." },
        { sentence: "They ___ football on Saturdays.", options: ["plays", "play", "playing", "played"], correct: 1, explanation: "Sujet 'they' → base verbale sans -s." },
        { sentence: "He ___ like spicy food.", options: ["don't", "doesn't", "isn't", "aren't"], correct: 1, explanation: "He → doesn't + base verbale." },
        { sentence: "___ you speak French?", options: ["Does", "Do", "Are", "Is"], correct: 1, explanation: "You → Do + base verbale." },
        { sentence: "Water ___ at 100°C.", options: ["boil", "boils", "is boiling", "boiled"], correct: 1, explanation: "Vérité générale → Present Simple, 3e personne → boils." },
        { sentence: "The train ___ at 9:15 every morning.", options: ["leave", "leaves", "is leaving", "left"], correct: 1, explanation: "Emploi du temps fixe → Present Simple, 3e personne → leaves." },
        { sentence: "My parents ___ in a small village in Yorkshire.", options: ["lives", "live", "are living", "lived"], correct: 1, explanation: "État permanent + sujet pluriel (My parents = they) → base verbale." },
        { sentence: "How often ___ to the dentist?", options: ["you go", "do you go", "are you going", "does you go"], correct: 1, explanation: "Question sur une habitude (How often) → Do + sujet + base verbale." }
      ],
      fill: [
        { sentence: "My brother ___ (work) in a bank.", answer: "works", explanation: "3e personne du singulier → works." },
        { sentence: "We ___ (not/watch) telly in the evening.", answer: "don't watch", explanation: "We → don't + base verbale." },
        { sentence: "Does she ___ (live) in Bristol?", answer: "live", explanation: "Question au Present Simple → Does + sujet + base verbale." },
        { sentence: "The Earth ___ (go) around the Sun.", answer: "goes", explanation: "Vérité scientifique (3e personne) → goes." },
        { sentence: "I usually ___ (wake up) at 7 am.", answer: "wake up", explanation: "Habitude avec 'I' → base verbale." }
      ]
    },
    present_continuous: {
      qcm: [
        { sentence: "Look! The children ___ in the garden.", options: ["play", "plays", "are playing", "played"], correct: 2, explanation: "'Look!' indique une action en cours → Present Continuous." },
        { sentence: "I ___ for my exam at the moment.", options: ["study", "am studying", "studies", "studied"], correct: 1, explanation: "'At the moment' → Present Continuous, I → am studying." },
        { sentence: "She ___ not ___ her homework right now.", options: ["do...doing", "does...do", "is...doing", "is...do"], correct: 2, explanation: "She → is + not + doing." },
        { sentence: "They ___ dinner at the moment.", options: ["cook", "are cooking", "cooks", "cooked"], correct: 1, explanation: "Action en cours → are cooking." },
        { sentence: "Why ___ that heavy coat? It's boiling outside!", options: ["do you wear", "are you wearing", "you wear", "did you wear"], correct: 1, explanation: "Action temporaire/en cours (en ce moment même) → Present Continuous." },
        { sentence: "I can't talk right now, I ___ a bath.", options: ["have", "am having", "has", "had"], correct: 1, explanation: "Action en cours de déroulement → am having." }
      ],
      fill: [
        { sentence: "She ___ (read) a book right now.", answer: "is reading", explanation: "Action en cours → is + reading." },
        { sentence: "We ___ (not/go) out tonight.", answer: "aren't going", explanation: "Futur planifié (tonight) → Present Continuous (aren't going)." },
        { sentence: "Are you ___ (listen) to me?", answer: "listening", explanation: "Question → Are + sujet + verbe-ing." },
        { sentence: "The climate ___ (change) rapidly.", answer: "is changing", explanation: "Évolution/changement en cours → is changing." },
        { sentence: "He ___ (always/complain) about his boss!", answer: "is always complaining", explanation: "Agacement face à une habitude → is always complaining." }
      ]
    },
    past_simple: {
      qcm: [
        { sentence: "I ___ to Paris last summer.", options: ["go", "goes", "went", "gone"], correct: 2, explanation: "Past Simple de go → went. 'Last summer' = moment passé précis." },
        { sentence: "She ___ the answer to the question.", options: ["know", "knew", "known", "knows"], correct: 1, explanation: "Past Simple de know → knew." },
        { sentence: "They ___ come to the party yesterday.", options: ["didn't", "don't", "doesn't", "wasn't"], correct: 0, explanation: "Past Simple négatif → didn't + base verbale." },
        { sentence: "___ you see the match last night?", options: ["Do", "Did", "Were", "Had"], correct: 1, explanation: "Question au Past Simple → Did + sujet + base verbale." },
        { sentence: "He ___ his homework and went to bed.", options: ["finishes", "finished", "has finished", "finishing"], correct: 1, explanation: "Série d'actions passées → Past Simple." },
        { sentence: "When I was a child, I ___ football every day.", options: ["play", "played", "was playing", "have played"], correct: 1, explanation: "Habitude passée révolue ('When I was a child') → Past Simple." },
        { sentence: "Shakespeare ___ 'Hamlet' in 1599.", options: ["writes", "has written", "wrote", "was writing"], correct: 2, explanation: "Fait historique daté → Past Simple (wrote)." }
      ],
      fill: [
        { sentence: "She ___ (buy) a new dress yesterday.", answer: "bought", explanation: "Past Simple de buy → bought." },
        { sentence: "We ___ (not/enjoy) the film.", answer: "didn't enjoy", explanation: "Past Simple négatif → didn't + base verbale." },
        { sentence: "He ___ (write) a letter to his grandmother.", answer: "wrote", explanation: "Past Simple de write → wrote." },
        { sentence: "I ___ (find) £20 in the street this morning.", answer: "found", explanation: "Past Simple de find → found." },
        { sentence: "___ they ___ (win) the match last weekend?", answer: "Did win", explanation: "Question au passé → Did + sujet + base verbale." }
      ]
    },
    past_continuous: {
      qcm: [
        { sentence: "I ___ when the phone rang.", options: ["sleep", "slept", "was sleeping", "am sleeping"], correct: 2, explanation: "Action longue interrompue → Past Continuous + Past Simple." },
        { sentence: "While she ___, he was reading.", options: ["cooks", "cooked", "was cooking", "is cooking"], correct: 2, explanation: "Deux actions simultanées dans le passé → Past Continuous." },
        { sentence: "They ___ listening to the teacher.", options: ["wasn't", "weren't", "didn't", "aren't"], correct: 1, explanation: "They → weren't + verbe-ing." },
        { sentence: "What ___ at 8pm last night?", options: ["did you do", "were you doing", "you were doing", "have you done"], correct: 1, explanation: "Action en cours à un moment précis du passé → were you doing." },
        { sentence: "The sun ___, and the birds were singing.", options: ["shone", "was shining", "shines", "is shining"], correct: 1, explanation: "Description du décor/contexte dans un récit → Past Continuous." }
      ],
      fill: [
        { sentence: "At 8pm, I ___ (watch) telly.", answer: "was watching", explanation: "Action en cours à un moment précis du passé → Past Continuous." },
        { sentence: "What were you ___ (do) when I called?", answer: "doing", explanation: "Question au Past Continuous → Were + sujet + verbe-ing." },
        { sentence: "It ___ (rain) heavily when we left the house.", answer: "was raining", explanation: "Action longue (pleuvoir) interrompue par une action courte (partir) → was raining." },
        { sentence: "I ___ (not/listen) when the teacher gave the instructions.", answer: "wasn't listening", explanation: "Négation au Past Continuous → wasn't listening." }
      ]
    },
    present_perfect: {
      qcm: [
        { sentence: "I ___ already ___ my homework.", options: ["have...finished", "has...finished", "had...finished", "am...finishing"], correct: 0, explanation: "I → have + participe passé. 'Already' → Present Perfect." },
        { sentence: "She ___ never ___ to Scotland.", options: ["has...been", "have...been", "had...been", "is...been"], correct: 0, explanation: "She → has + been. Expérience de vie → Present Perfect." },
        { sentence: "Have you ___ seen a ghost?", options: ["ever", "never", "yet", "already"], correct: 0, explanation: "'Ever' = à un moment de ta vie, utilisé dans les questions au Present Perfect." },
        { sentence: "We ___ known each other since 2010.", options: ["have", "has", "had", "are"], correct: 0, explanation: "We → have. 'Since' + date → Present Perfect." },
        { sentence: "I can't find my keys. I think I ___ them.", options: ["lost", "have lost", "was losing", "lose"], correct: 1, explanation: "Action passée avec un résultat visible au présent (je ne les ai pas) → Present Perfect." },
        { sentence: "___ you finished that report yet?", options: ["Did", "Have", "Are", "Do"], correct: 1, explanation: "'Yet' s'utilise avec le Present Perfect → Have you finished." }
      ],
      fill: [
        { sentence: "I ___ (lose) my keys. I can't find them.", answer: "have lost", explanation: "Résultat présent → Present Perfect." },
        { sentence: "She ___ (not/call) me yet.", answer: "hasn't called", explanation: "'Yet' dans une phrase négative → Present Perfect." },
        { sentence: "They ___ (live) here for five years.", answer: "have lived", explanation: "'For' + durée → Present Perfect." },
        { sentence: "___ you ever ___ (eat) sushi?", answer: "Have eaten", explanation: "Expérience de vie avec 'ever' → Have + eaten." },
        { sentence: "He ___ (just/arrive) at the station.", answer: "has just arrived", explanation: "Action très récente avec 'just' → has just arrived." }
      ]
    },
    present_perfect_continuous: {
      qcm: [
        { sentence: "I ___ for three hours. I'm exhausted!", options: ["have studied", "have been studying", "am studying", "studied"], correct: 1, explanation: "Insistance sur la durée d'une action récente avec résultat visible (épuisé) → Present Perfect Continuous." },
        { sentence: "How long ___ here?", options: ["do you wait", "are you waiting", "have you been waiting", "did you wait"], correct: 2, explanation: "Question sur la durée d'une action toujours en cours → How long have you been waiting." },
        { sentence: "It ___ all day. The garden is flooded.", options: ["has rained", "has been raining", "is raining", "rained"], correct: 1, explanation: "Action continue (all day) avec résultat visible → has been raining." }
      ],
      fill: [
        { sentence: "She ___ (work) here since 2018.", answer: "has been working", explanation: "Action commencée dans le passé et toujours en cours (insistance sur la durée) → has been working." },
        { sentence: "Your eyes are red. ___ you ___ (cry)?", answer: "Have been crying", explanation: "Résultat visible d'une action récente continue → Have you been crying." },
        { sentence: "They ___ (not/talk) to each other lately.", answer: "haven't been talking", explanation: "Situation continue récente (lately) → haven't been talking." }
      ]
    },
    past_perfect: {
      qcm: [
        { sentence: "When I arrived at the station, the train ___.", options: ["left", "has left", "had left", "was leaving"], correct: 2, explanation: "Le train est parti AVANT mon arrivée (qui est déjà au passé) → Past Perfect (had left)." },
        { sentence: "She was tired because she ___ all day.", options: ["worked", "has worked", "had worked", "was working"], correct: 2, explanation: "Le travail a eu lieu AVANT la fatigue (qui est au passé) → Past Perfect." },
        { sentence: "I didn't know who he was. I ___ him before.", options: ["didn't see", "haven't seen", "had never seen", "wasn't seeing"], correct: 2, explanation: "Fait de ne pas l'avoir vu avant un moment du passé → Past Perfect." }
      ],
      fill: [
        { sentence: "By the time we got to the cinema, the film ___ (already/start).", answer: "had already started", explanation: "Action terminée avant une autre action passée → had already started." },
        { sentence: "He told me he ___ (buy) a new car.", answer: "had bought", explanation: "Discours indirect (Reported speech) : Past Simple devient Past Perfect → had bought." },
        { sentence: "I couldn't pay for my coffee because I ___ (forget) my wallet.", answer: "had forgotten", explanation: "L'oubli s'est produit avant l'impossibilité de payer → had forgotten." }
      ]
    },
    future_will: {
      qcm: [
        { sentence: "I think it ___ tomorrow.", options: ["rains", "is raining", "will rain", "is going to rain"], correct: 2, explanation: "Prédiction basée sur une opinion ('I think') → will rain." },
        { sentence: "A: 'We don't have any milk.' B: 'Really? I ___ get some.'", options: ["am going to", "will", "am getting", "get"], correct: 1, explanation: "Décision spontanée prise au moment de parler → will." },
        { sentence: "I promise I ___ tell anyone your secret.", options: ["don't", "am not going to", "won't", "didn't"], correct: 2, explanation: "Promesse → will not (won't)." }
      ],
      fill: [
        { sentence: "Don't worry, I ___ (help) you with those heavy bags.", answer: "will help", explanation: "Offre d'aide spontanée → will help." },
        { sentence: "I'm sure she ___ (pass) her driving test.", answer: "will pass", explanation: "Prédiction avec 'I'm sure' → will pass." },
        { sentence: "___ you ___ (marry) me?", answer: "Will marry", explanation: "Demande/Offre → Will you marry." }
      ]
    },
    future_going_to: {
      qcm: [
        { sentence: "Look at those black clouds! It ___.", options: ["will rain", "is going to rain", "rains", "is raining"], correct: 1, explanation: "Prédiction basée sur une évidence visuelle présente → is going to rain." },
        { sentence: "I ___ study medicine at university next year.", options: ["will", "am going to", "am", "study"], correct: 1, explanation: "Intention ou plan déjà décidé → am going to." },
        { sentence: "Watch out! You ___ drop those glasses!", options: ["will", "are going to", "are", "do"], correct: 1, explanation: "Avertissement d'un danger imminent et évident → are going to." }
      ],
      fill: [
        { sentence: "We ___ (buy) a new house next month. We've already saved the money.", answer: "are going to buy", explanation: "Plan défini à l'avance → are going to buy." },
        { sentence: "He ___ (not/apply) for that job.", answer: "isn't going to apply", explanation: "Intention négative → isn't going to apply." },
        { sentence: "___ they ___ (sell) their car?", answer: "Are going to sell", explanation: "Question sur une intention → Are they going to sell." }
      ]
    },
    conditional_1: {
      qcm: [
        { sentence: "If it rains, I ___ an umbrella.", options: ["take", "will take", "would take", "took"], correct: 1, explanation: "First Conditional : If + Present Simple, will + base verbale." },
        { sentence: "If you study hard, you ___ the exam.", options: ["pass", "will pass", "would pass", "passed"], correct: 1, explanation: "Situation probable → First Conditional avec will." },
        { sentence: "If she ___ late, we'll leave without her.", options: ["is", "will be", "would be", "was"], correct: 0, explanation: "Jamais de 'will' après 'if'. Présent simple dans la condition." }
      ],
      fill: [
        { sentence: "If he ___ (not/hurry), he'll miss the train.", answer: "doesn't hurry", explanation: "If + Present Simple (négatif) → doesn't hurry." },
        { sentence: "I will call you if I ___ (need) help.", answer: "need", explanation: "Clause avec 'if' au First Conditional → Present Simple (need)." }
      ]
    },
    conditional_2: {
      qcm: [
        { sentence: "If I ___ rich, I would travel the world.", options: ["am", "was", "were", "will be"], correct: 2, explanation: "Second Conditional : If + Past Simple (were pour tous les sujets), would + base." },
        { sentence: "If she spoke French, she ___ to Paris.", options: ["moves", "will move", "would move", "moved"], correct: 2, explanation: "Conséquence hypothétique → would + base verbale." },
        { sentence: "What would you do if you ___ your job?", options: ["lose", "lost", "will lose", "would lose"], correct: 1, explanation: "Condition irréelle → Past Simple (lost)." }
      ],
      fill: [
        { sentence: "If I ___ (be) you, I would apologise.", answer: "were", explanation: "Second Conditional : 'If I were you' est la forme recommandée." },
        { sentence: "If we had more money, we ___ (buy) a bigger house.", answer: "would buy", explanation: "Conséquence irréelle → would + base verbale." }
      ]
    },
    conditional_3: {
      qcm: [
        { sentence: "If I had known you were in hospital, I ___ you.", options: ["would visit", "will visit", "would have visited", "visited"], correct: 2, explanation: "Third Conditional (regret passé) : If + Past Perfect, would have + participe passé." },
        { sentence: "She wouldn't have missed the flight if she ___ an alarm.", options: ["set", "had set", "would set", "has set"], correct: 1, explanation: "Condition non réalisée dans le passé → Past Perfect (had set)." },
        { sentence: "If they ___ earlier, they wouldn't have been caught in the rain.", options: ["left", "leave", "had left", "would leave"], correct: 2, explanation: "Condition passée irréelle → Past Perfect (had left)." }
      ],
      fill: [
        { sentence: "If you had studied harder, you ___ (pass) the exam.", answer: "would have passed", explanation: "Conséquence passée irréelle → would have + participe passé." },
        { sentence: "I ___ (not/make) that mistake if you had warned me.", answer: "wouldn't have made", explanation: "Conséquence passée négative → wouldn't have made." }
      ]
    }
  },

  // Stative verbs list
  stativeVerbs: [
    "know", "believe", "understand", "realise", "remember", "forget", "mean", "recognise",
    "like", "love", "hate", "prefer", "want", "need", "wish", "desire",
    "seem", "appear", "look", "sound", "smell", "taste", "feel",
    "belong", "own", "possess", "contain", "include", "consist",
    "be", "exist", "cost", "weigh", "measure", "matter", "depend",
    "see", "hear", "notice", "suppose", "expect"
  ]
};

// ============================================================
// 2. STATE MANAGEMENT
// ============================================================
