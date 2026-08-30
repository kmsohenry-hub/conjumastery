export const exerciseTemplates = {
    present_simple: {
      qcm: [
        {
          sentence: 'She ___ to work by bus every day.',
          options: ['go', 'goes', 'going', 'went'],
          correct: 1,
          explanation: '3e personne du singulier → on ajoute -es à go.',
        },
        {
          sentence: 'They ___ football on Saturdays.',
          options: ['plays', 'play', 'playing', 'played'],
          correct: 1,
          explanation: "Sujet 'they' → base verbale sans -s.",
        },
        {
          sentence: 'He ___ like spicy food.',
          options: ["don't", "doesn't", "isn't", "aren't"],
          correct: 1,
          explanation: "He → doesn't + base verbale.",
        },
        {
          sentence: '___ you speak French?',
          options: ['Does', 'Do', 'Are', 'Is'],
          correct: 1,
          explanation: 'You → Do + base verbale.',
        },
        {
          sentence: 'Water ___ at 100°C.',
          options: ['boil', 'boils', 'is boiling', 'boiled'],
          correct: 1,
          explanation: 'Vérité générale → Present Simple, 3e personne → boils.',
        },
        {
          sentence: 'The train ___ at 9:15 every morning.',
          options: ['leave', 'leaves', 'is leaving', 'left'],
          correct: 1,
          explanation: 'Emploi du temps fixe → Present Simple, 3e personne → leaves.',
        },
        {
          sentence: 'My parents ___ in a small village in Yorkshire.',
          options: ['lives', 'live', 'are living', 'lived'],
          correct: 1,
          explanation: 'État permanent + sujet pluriel (My parents = they) → base verbale.',
        },
        {
          sentence: 'How often ___ to the dentist?',
          options: ['you go', 'do you go', 'are you going', 'does you go'],
          correct: 1,
          explanation: 'Question sur une habitude (How often) → Do + sujet + base verbale.',
        },
      ],
      fill: [
        {
          sentence: 'My brother ___ (work) in a bank.',
          answer: 'works',
          explanation: '3e personne du singulier → works.',
        },
        {
          sentence: 'We ___ (not/watch) telly in the evening.',
          answer: "don't watch",
          explanation: "We → don't + base verbale.",
        },
        {
          sentence: 'Does she ___ (live) in Bristol?',
          answer: 'live',
          explanation: 'Question au Present Simple → Does + sujet + base verbale.',
        },
        {
          sentence: 'The Earth ___ (go) around the Sun.',
          answer: 'goes',
          explanation: 'Vérité scientifique (3e personne) → goes.',
        },
        {
          sentence: 'I usually ___ (wake up) at 7 am.',
          answer: 'wake up',
          explanation: "Habitude avec 'I' → base verbale.",
        },
      ],
    },
    present_continuous: {
      qcm: [
        {
          sentence: 'Look! The children ___ in the garden.',
          options: ['play', 'plays', 'are playing', 'played'],
          correct: 2,
          explanation: "'Look!' indique une action en cours → Present Continuous.",
        },
        {
          sentence: 'I ___ for my exam at the moment.',
          options: ['study', 'am studying', 'studies', 'studied'],
          correct: 1,
          explanation: "'At the moment' → Present Continuous, I → am studying.",
        },
        {
          sentence: 'She ___ not ___ her homework right now.',
          options: ['do...doing', 'does...do', 'is...doing', 'is...do'],
          correct: 2,
          explanation: 'She → is + not + doing.',
        },
        {
          sentence: 'They ___ dinner at the moment.',
          options: ['cook', 'are cooking', 'cooks', 'cooked'],
          correct: 1,
          explanation: 'Action en cours → are cooking.',
        },
        {
          sentence: "Why ___ that heavy coat? It's boiling outside!",
          options: ['do you wear', 'are you wearing', 'you wear', 'did you wear'],
          correct: 1,
          explanation: 'Action temporaire/en cours (en ce moment même) → Present Continuous.',
        },
        {
          sentence: "I can't talk right now, I ___ a bath.",
          options: ['have', 'am having', 'has', 'had'],
          correct: 1,
          explanation: 'Action en cours de déroulement → am having.',
        },
      ],
      fill: [
        {
          sentence: 'She ___ (read) a book right now.',
          answer: 'is reading',
          explanation: 'Action en cours → is + reading.',
        },
        {
          sentence: 'We ___ (not/go) out tonight.',
          answer: "aren't going",
          explanation: "Futur planifié (tonight) → Present Continuous (aren't going).",
        },
        {
          sentence: 'Are you ___ (listen) to me?',
          answer: 'listening',
          explanation: 'Question → Are + sujet + verbe-ing.',
        },
        {
          sentence: 'The climate ___ (change) rapidly.',
          answer: 'is changing',
          explanation: 'Évolution/changement en cours → is changing.',
        },
        {
          sentence: 'He ___ (always/complain) about his boss!',
          answer: 'is always complaining',
          explanation: 'Agacement face à une habitude → is always complaining.',
        },
      ],
    },
    past_simple: {
      qcm: [
        {
          sentence: 'I ___ to Paris last summer.',
          options: ['go', 'goes', 'went', 'gone'],
          correct: 2,
          explanation: "Past Simple de go → went. 'Last summer' = moment passé précis.",
        },
        {
          sentence: 'She ___ the answer to the question.',
          options: ['know', 'knew', 'known', 'knows'],
          correct: 1,
          explanation: 'Past Simple de know → knew.',
        },
        {
          sentence: 'They ___ come to the party yesterday.',
          options: ["didn't", "don't", "doesn't", "wasn't"],
          correct: 0,
          explanation: "Past Simple négatif → didn't + base verbale.",
        },
        {
          sentence: '___ you see the match last night?',
          options: ['Do', 'Did', 'Were', 'Had'],
          correct: 1,
          explanation: 'Question au Past Simple → Did + sujet + base verbale.',
        },
        {
          sentence: 'He ___ his homework and went to bed.',
          options: ['finishes', 'finished', 'has finished', 'finishing'],
          correct: 1,
          explanation: "Série d'actions passées → Past Simple.",
        },
        {
          sentence: 'When I was a child, I ___ football every day.',
          options: ['play', 'played', 'was playing', 'have played'],
          correct: 1,
          explanation: "Habitude passée révolue ('When I was a child') → Past Simple.",
        },
        {
          sentence: "Shakespeare ___ 'Hamlet' in 1599.",
          options: ['writes', 'has written', 'wrote', 'was writing'],
          correct: 2,
          explanation: 'Fait historique daté → Past Simple (wrote).',
        },
      ],
      fill: [
        {
          sentence: 'She ___ (buy) a new dress yesterday.',
          answer: 'bought',
          explanation: 'Past Simple de buy → bought.',
        },
        {
          sentence: 'We ___ (not/enjoy) the film.',
          answer: "didn't enjoy",
          explanation: "Past Simple négatif → didn't + base verbale.",
        },
        {
          sentence: 'He ___ (write) a letter to his grandmother.',
          answer: 'wrote',
          explanation: 'Past Simple de write → wrote.',
        },
        {
          sentence: 'I ___ (find) £20 in the street this morning.',
          answer: 'found',
          explanation: 'Past Simple de find → found.',
        },
        {
          sentence: '___ they ___ (win) the match last weekend?',
          answer: 'Did win',
          explanation: 'Question au passé → Did + sujet + base verbale.',
        },
      ],
    },
    past_continuous: {
      qcm: [
        {
          sentence: 'I ___ when the phone rang.',
          options: ['sleep', 'slept', 'was sleeping', 'am sleeping'],
          correct: 2,
          explanation: 'Action longue interrompue → Past Continuous + Past Simple.',
        },
        {
          sentence: 'While she ___, he was reading.',
          options: ['cooks', 'cooked', 'was cooking', 'is cooking'],
          correct: 2,
          explanation: 'Deux actions simultanées dans le passé → Past Continuous.',
        },
        {
          sentence: 'They ___ listening to the teacher.',
          options: ["wasn't", "weren't", "didn't", "aren't"],
          correct: 1,
          explanation: "They → weren't + verbe-ing.",
        },
        {
          sentence: 'What ___ at 8pm last night?',
          options: ['did you do', 'were you doing', 'you were doing', 'have you done'],
          correct: 1,
          explanation: 'Action en cours à un moment précis du passé → were you doing.',
        },
        {
          sentence: 'The sun ___, and the birds were singing.',
          options: ['shone', 'was shining', 'shines', 'is shining'],
          correct: 1,
          explanation: 'Description du décor/contexte dans un récit → Past Continuous.',
        },
      ],
      fill: [
        {
          sentence: 'At 8pm, I ___ (watch) telly.',
          answer: 'was watching',
          explanation: 'Action en cours à un moment précis du passé → Past Continuous.',
        },
        {
          sentence: 'What were you ___ (do) when I called?',
          answer: 'doing',
          explanation: 'Question au Past Continuous → Were + sujet + verbe-ing.',
        },
        {
          sentence: 'It ___ (rain) heavily when we left the house.',
          answer: 'was raining',
          explanation:
            'Action longue (pleuvoir) interrompue par une action courte (partir) → was raining.',
        },
        {
          sentence: 'I ___ (not/listen) when the teacher gave the instructions.',
          answer: "wasn't listening",
          explanation: "Négation au Past Continuous → wasn't listening.",
        },
      ],
    },
    present_perfect: {
      qcm: [
        {
          sentence: 'I ___ already ___ my homework.',
          options: ['have...finished', 'has...finished', 'had...finished', 'am...finishing'],
          correct: 0,
          explanation: "I → have + participe passé. 'Already' → Present Perfect.",
        },
        {
          sentence: 'She ___ never ___ to Scotland.',
          options: ['has...been', 'have...been', 'had...been', 'is...been'],
          correct: 0,
          explanation: 'She → has + been. Expérience de vie → Present Perfect.',
        },
        {
          sentence: 'Have you ___ seen a ghost?',
          options: ['ever', 'never', 'yet', 'already'],
          correct: 0,
          explanation:
            "'Ever' = à un moment de ta vie, utilisé dans les questions au Present Perfect.",
        },
        {
          sentence: 'We ___ known each other since 2010.',
          options: ['have', 'has', 'had', 'are'],
          correct: 0,
          explanation: "We → have. 'Since' + date → Present Perfect.",
        },
        {
          sentence: "I can't find my keys. I think I ___ them.",
          options: ['lost', 'have lost', 'was losing', 'lose'],
          correct: 1,
          explanation:
            'Action passée avec un résultat visible au présent (je ne les ai pas) → Present Perfect.',
        },
        {
          sentence: '___ you finished that report yet?',
          options: ['Did', 'Have', 'Are', 'Do'],
          correct: 1,
          explanation: "'Yet' s'utilise avec le Present Perfect → Have you finished.",
        },
      ],
      fill: [
        {
          sentence: "I ___ (lose) my keys. I can't find them.",
          answer: 'have lost',
          explanation: 'Résultat présent → Present Perfect.',
        },
        {
          sentence: 'She ___ (not/call) me yet.',
          answer: "hasn't called",
          explanation: "'Yet' dans une phrase négative → Present Perfect.",
        },
        {
          sentence: 'They ___ (live) here for five years.',
          answer: 'have lived',
          explanation: "'For' + durée → Present Perfect.",
        },
        {
          sentence: '___ you ever ___ (eat) sushi?',
          answer: 'Have eaten',
          explanation: "Expérience de vie avec 'ever' → Have + eaten.",
        },
        {
          sentence: 'He ___ (just/arrive) at the station.',
          answer: 'has just arrived',
          explanation: "Action très récente avec 'just' → has just arrived.",
        },
      ],
    },
    present_perfect_continuous: {
      qcm: [
        {
          sentence: "I ___ for three hours. I'm exhausted!",
          options: ['have studied', 'have been studying', 'am studying', 'studied'],
          correct: 1,
          explanation:
            "Insistance sur la durée d'une action récente avec résultat visible (épuisé) → Present Perfect Continuous.",
        },
        {
          sentence: 'How long ___ here?',
          options: ['do you wait', 'are you waiting', 'have you been waiting', 'did you wait'],
          correct: 2,
          explanation:
            "Question sur la durée d'une action toujours en cours → How long have you been waiting.",
        },
        {
          sentence: 'It ___ all day. The garden is flooded.',
          options: ['has rained', 'has been raining', 'is raining', 'rained'],
          correct: 1,
          explanation: 'Action continue (all day) avec résultat visible → has been raining.',
        },
      ],
      fill: [
        {
          sentence: 'She ___ (work) here since 2018.',
          answer: 'has been working',
          explanation:
            'Action commencée dans le passé et toujours en cours (insistance sur la durée) → has been working.',
        },
        {
          sentence: 'Your eyes are red. ___ you ___ (cry)?',
          answer: 'Have been crying',
          explanation: "Résultat visible d'une action récente continue → Have you been crying.",
        },
        {
          sentence: 'They ___ (not/talk) to each other lately.',
          answer: "haven't been talking",
          explanation: "Situation continue récente (lately) → haven't been talking.",
        },
      ],
    },
    past_perfect: {
      qcm: [
        {
          sentence: 'When I arrived at the station, the train ___.',
          options: ['left', 'has left', 'had left', 'was leaving'],
          correct: 2,
          explanation:
            'Le train est parti AVANT mon arrivée (qui est déjà au passé) → Past Perfect (had left).',
        },
        {
          sentence: 'She was tired because she ___ all day.',
          options: ['worked', 'has worked', 'had worked', 'was working'],
          correct: 2,
          explanation: 'Le travail a eu lieu AVANT la fatigue (qui est au passé) → Past Perfect.',
        },
        {
          sentence: "I didn't know who he was. I ___ him before.",
          options: ["didn't see", "haven't seen", 'had never seen', "wasn't seeing"],
          correct: 2,
          explanation: "Fait de ne pas l'avoir vu avant un moment du passé → Past Perfect.",
        },
      ],
      fill: [
        {
          sentence: 'By the time we got to the cinema, the film ___ (already/start).',
          answer: 'had already started',
          explanation: 'Action terminée avant une autre action passée → had already started.',
        },
        {
          sentence: 'He told me he ___ (buy) a new car.',
          answer: 'had bought',
          explanation:
            'Discours indirect (Reported speech) : Past Simple devient Past Perfect → had bought.',
        },
        {
          sentence: "I couldn't pay for my coffee because I ___ (forget) my wallet.",
          answer: 'had forgotten',
          explanation: "L'oubli s'est produit avant l'impossibilité de payer → had forgotten.",
        },
      ],
    },
    future_will: {
      qcm: [
        {
          sentence: 'I think it ___ tomorrow.',
          options: ['rains', 'is raining', 'will rain', 'is going to rain'],
          correct: 2,
          explanation: "Prédiction basée sur une opinion ('I think') → will rain.",
        },
        {
          sentence: "A: 'We don't have any milk.' B: 'Really? I ___ get some.'",
          options: ['am going to', 'will', 'am getting', 'get'],
          correct: 1,
          explanation: 'Décision spontanée prise au moment de parler → will.',
        },
        {
          sentence: 'I promise I ___ tell anyone your secret.',
          options: ["don't", 'am not going to', "won't", "didn't"],
          correct: 2,
          explanation: "Promesse → will not (won't).",
        },
      ],
      fill: [
        {
          sentence: "Don't worry, I ___ (help) you with those heavy bags.",
          answer: 'will help',
          explanation: "Offre d'aide spontanée → will help.",
        },
        {
          sentence: "I'm sure she ___ (pass) her driving test.",
          answer: 'will pass',
          explanation: "Prédiction avec 'I'm sure' → will pass.",
        },
        {
          sentence: '___ you ___ (marry) me?',
          answer: 'Will marry',
          explanation: 'Demande/Offre → Will you marry.',
        },
      ],
    },
    future_going_to: {
      qcm: [
        {
          sentence: 'Look at those black clouds! It ___.',
          options: ['will rain', 'is going to rain', 'rains', 'is raining'],
          correct: 1,
          explanation: 'Prédiction basée sur une évidence visuelle présente → is going to rain.',
        },
        {
          sentence: 'I ___ study medicine at university next year.',
          options: ['will', 'am going to', 'am', 'study'],
          correct: 1,
          explanation: 'Intention ou plan déjà décidé → am going to.',
        },
        {
          sentence: 'Watch out! You ___ drop those glasses!',
          options: ['will', 'are going to', 'are', 'do'],
          correct: 1,
          explanation: "Avertissement d'un danger imminent et évident → are going to.",
        },
      ],
      fill: [
        {
          sentence: "We ___ (buy) a new house next month. We've already saved the money.",
          answer: 'are going to buy',
          explanation: "Plan défini à l'avance → are going to buy.",
        },
        {
          sentence: 'He ___ (not/apply) for that job.',
          answer: "isn't going to apply",
          explanation: "Intention négative → isn't going to apply.",
        },
        {
          sentence: '___ they ___ (sell) their car?',
          answer: 'Are going to sell',
          explanation: 'Question sur une intention → Are they going to sell.',
        },
      ],
    },
    conditional_1: {
      qcm: [
        {
          sentence: 'If it rains, I ___ an umbrella.',
          options: ['take', 'will take', 'would take', 'took'],
          correct: 1,
          explanation: 'First Conditional : If + Present Simple, will + base verbale.',
        },
        {
          sentence: 'If you study hard, you ___ the exam.',
          options: ['pass', 'will pass', 'would pass', 'passed'],
          correct: 1,
          explanation: 'Situation probable → First Conditional avec will.',
        },
        {
          sentence: "If she ___ late, we'll leave without her.",
          options: ['is', 'will be', 'would be', 'was'],
          correct: 0,
          explanation: "Jamais de 'will' après 'if'. Présent simple dans la condition.",
        },
      ],
      fill: [
        {
          sentence: "If he ___ (not/hurry), he'll miss the train.",
          answer: "doesn't hurry",
          explanation: "If + Present Simple (négatif) → doesn't hurry.",
        },
        {
          sentence: 'I will call you if I ___ (need) help.',
          answer: 'need',
          explanation: "Clause avec 'if' au First Conditional → Present Simple (need).",
        },
      ],
    },
    conditional_2: {
      qcm: [
        {
          sentence: 'If I ___ rich, I would travel the world.',
          options: ['am', 'was', 'were', 'will be'],
          correct: 2,
          explanation:
            'Second Conditional : If + Past Simple (were pour tous les sujets), would + base.',
        },
        {
          sentence: 'If she spoke French, she ___ to Paris.',
          options: ['moves', 'will move', 'would move', 'moved'],
          correct: 2,
          explanation: 'Conséquence hypothétique → would + base verbale.',
        },
        {
          sentence: 'What would you do if you ___ your job?',
          options: ['lose', 'lost', 'will lose', 'would lose'],
          correct: 1,
          explanation: 'Condition irréelle → Past Simple (lost).',
        },
      ],
      fill: [
        {
          sentence: 'If I ___ (be) you, I would apologise.',
          answer: 'were',
          explanation: "Second Conditional : 'If I were you' est la forme recommandée.",
        },
        {
          sentence: 'If we had more money, we ___ (buy) a bigger house.',
          answer: 'would buy',
          explanation: 'Conséquence irréelle → would + base verbale.',
        },
      ],
    },
    conditional_3: {
      qcm: [
        {
          sentence: 'If I had known you were in hospital, I ___ you.',
          options: ['would visit', 'will visit', 'would have visited', 'visited'],
          correct: 2,
          explanation:
            'Third Conditional (regret passé) : If + Past Perfect, would have + participe passé.',
        },
        {
          sentence: "She wouldn't have missed the flight if she ___ an alarm.",
          options: ['set', 'had set', 'would set', 'has set'],
          correct: 1,
          explanation: 'Condition non réalisée dans le passé → Past Perfect (had set).',
        },
        {
          sentence: "If they ___ earlier, they wouldn't have been caught in the rain.",
          options: ['left', 'leave', 'had left', 'would leave'],
          correct: 2,
          explanation: 'Condition passée irréelle → Past Perfect (had left).',
        },
      ],
      fill: [
        {
          sentence: 'If you had studied harder, you ___ (pass) the exam.',
          answer: 'would have passed',
          explanation: 'Conséquence passée irréelle → would have + participe passé.',
        },
        {
          sentence: 'I ___ (not/make) that mistake if you had warned me.',
          answer: "wouldn't have made",
          explanation: "Conséquence passée négative → wouldn't have made.",
        },
      ],
    },
  }
