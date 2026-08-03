(function initProgressModel(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OgeProgressModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createProgressModel() {
  const TASK6_TOTALS = Object.freeze({
    '6.1': 9,
    '6.2': 9,
    '6.3': 9,
    '6.4': 9,
    '6.5': 9,
    '6.6': 9,
    '6.7': 9,
    '6.8': 9,
    '6.9': 6,
    '6.10': 7,
  });

  const TASK6_ANSWER_KEYS = Object.freeze({
    '6.1': ['9,4', '14,3', '10,1', '13,7', '12,1', '13,3', '14,7', '17,1', '18,4'],
    '6.2': ['-4,5', '-0,5', '-3,4', '2,7', '-3,5', '-1,9', '3,6', '1,6', '6,8'],
    '6.3': ['20,16', '17,25', '19,84', '16,12', '36,85', '40,81', '58,32', '38,27', '70,29'],
    '6.4': ['12', '7', '4', '3', '2', '8', '11', '9', '5'],
    '6.5': ['2,05', '1,16', '2,1', '1,9', '1,15', '1,26', '1,55', '0,52', '0,9'],
    '6.6': ['-1,95', '0,24', '-2,3', '-4,5', '-0,62', '-1,15', '-0,68', '-1,05', '-0,1'],
    '6.7': ['7,5', '0,9', '4,5', '0,45', '3,75', '0,48', '1,2', '1,8', '2,1'],
    '6.8': ['8,75', '4,5', '5,25', '2,8', '3,3', '0,32', '0,8', '4,9', '1,05'],
    '6.9': ['50', '10', '2', '46', '18', '34'],
    '6.10': ['8,4', '20', '12', '18', '198', '84', '264'],
  });

  const isAnswered = (value) => String(value ?? '').trim().length > 0;
  const normalizeAnswer = (value) => String(value ?? '').trim().replace(/\s+/g, '').replace('.', ',').toLowerCase();

  const summarizePrototype = (key, attempt = {}, explicitTotal) => {
    const fallbackTotal = explicitTotal || TASK6_TOTALS[key] || 0;
    const answers = attempt && typeof attempt.answers === 'object' ? attempt.answers : {};
    const total = Math.max(0, fallbackTotal || Number(attempt.total) || Object.keys(answers).length);
    const claimedScore = Math.max(0, Number(attempt.score) || 0);
    const answerKey = TASK6_ANSWER_KEYS[key];
    const verifiedScore = answerKey
      ? answerKey.reduce((result, expected, index) => result + (normalizeAnswer(answers[`q${index + 1}`]) === normalizeAnswer(expected) ? 1 : 0), 0)
      : claimedScore;

    if (answerKey && verifiedScore !== claimedScore) {
      return { key, total, correct: 0, wrong: 0, untouched: total, cells: Array(total).fill('pink') };
    }

    const answered = Math.min(total, Object.values(answers).filter(isAnswered).length);
    const correct = Math.min(total, answered, verifiedScore);
    const wrong = Math.max(0, answered - correct);
    const untouched = Math.max(0, total - answered);
    const cells = [
      ...Array(correct).fill('green'),
      ...Array(wrong).fill('yellow'),
      ...Array(untouched).fill('pink'),
    ];

    return { key, total, correct, wrong, untouched, cells };
  };

  const getPrototypeStatus = (attempt = {}, total = 0) => {
    const summary = summarizePrototype('', attempt, total);
    if (summary.correct === summary.total && summary.total > 0) return 'complete';
    if (summary.correct > 0 || summary.wrong > 0) return 'in-progress';
    return 'not-started';
  };

  const buildTask6Summary = (task6Progress = {}) => {
    const prototypes = Object.keys(TASK6_TOTALS).map((key) => summarizePrototype(key, task6Progress?.[key]));
    const totals = prototypes.reduce((result, prototype) => ({
      total: result.total + prototype.total,
      correct: result.correct + prototype.correct,
      wrong: result.wrong + prototype.wrong,
      untouched: result.untouched + prototype.untouched,
    }), { total: 0, correct: 0, wrong: 0, untouched: 0 });

    return {
      prototypes,
      ...totals,
      percent: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0,
    };
  };

  return { TASK6_TOTALS, TASK6_ANSWER_KEYS, summarizePrototype, getPrototypeStatus, buildTask6Summary };
});
