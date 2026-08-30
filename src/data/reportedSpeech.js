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
