export const reportedSpeech = {
  explanation:
    "Le discours indirect (reported speech) rapporte les paroles de quelqu'un sans les citer mot pour mot. Les temps verbaux 'reculent' d'un cran.",
  rules: [
    {
      direct: 'Present Simple →',
      reported: 'Past Simple',
      example: '"I like tea" → She said she liked tea.',
    },
    {
      direct: 'Present Continuous →',
      reported: 'Past Continuous',
      example: '"I am working" → He said he was working.',
    },
    {
      direct: 'Past Simple →',
      reported: 'Past Perfect',
      example: '"I went home" → She said she had gone home.',
    },
    {
      direct: 'Present Perfect →',
      reported: 'Past Perfect',
      example: '"I have finished" → He said he had finished.',
    },
    { direct: 'will →', reported: 'would', example: '"I will help" → She said she would help.' },
    { direct: 'can →', reported: 'could', example: '"I can swim" → He said he could swim.' },
    { direct: 'must →', reported: 'had to', example: '"I must go" → She said she had to go.' },
    {
      direct: 'Present Simple (negative) →',
      reported: 'Past Simple (negative)',
      example: '"I don\'t know the answer" → He said he didn\'t know the answer.',
    },
    {
      direct: 'Present Continuous (plural) →',
      reported: 'Past Continuous (plural)',
      example: '"We are waiting for the bus" → They said they were waiting for the bus.',
    },
    {
      direct: 'Past Simple (irregular) →',
      reported: 'Past Perfect',
      example: '"I bought a new laptop" → She said she had bought a new laptop.',
    },
    {
      direct: 'Present Perfect (negative) →',
      reported: 'Past Perfect (negative)',
      example: '"I haven\'t seen the film" → He said he hadn\'t seen the film.',
    },
    {
      direct: "will not (won't) →",
      reported: "would not (wouldn't)",
      example: '"I won\'t be late" → She said she wouldn\'t be late.',
    },
    {
      direct: 'am/is/are going to →',
      reported: 'was/were going to',
      example: '"I am going to travel" → He said he was going to travel.',
    },
    {
      direct: 'may →',
      reported: 'might',
      example: '"It may rain later" → She said it might rain later.',
    },
    {
      direct: 'Past Continuous →',
      reported: 'Past Perfect Continuous',
      example: '"I was sleeping" → He said he had been sleeping.',
    },
  ],
  timeChanges: [
    { direct: 'now', reported: 'then' },
    { direct: 'today', reported: 'that day' },
    { direct: 'yesterday', reported: 'the day before' },
    { direct: 'tomorrow', reported: 'the following day' },
    { direct: 'last week', reported: 'the previous week' },
    { direct: 'here', reported: 'there' },
    { direct: 'this', reported: 'that' },
  ],
};
