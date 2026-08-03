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

  const isAnswered = (value) => String(value ?? '').trim().length > 0;

  const summarizePrototype = (key, attempt = {}, explicitTotal) => {
    const fallbackTotal = explicitTotal || TASK6_TOTALS[key] || 0;
    const answers = attempt && typeof attempt.answers === 'object' ? attempt.answers : {};
    const total = Math.max(0, Number(attempt.total) || Object.keys(answers).length || fallbackTotal);
    const answered = Math.min(total, Object.values(answers).filter(isAnswered).length);
    const correct = Math.min(total, answered, Math.max(0, Number(attempt.score) || 0));
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

  return { TASK6_TOTALS, summarizePrototype, getPrototypeStatus, buildTask6Summary };
});
