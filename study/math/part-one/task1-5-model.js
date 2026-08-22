(function initTaskOneToFiveModel(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OgeTaskOneToFiveModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createTaskOneToFiveModel() {
  const ROUTE_ANSWERS = Object.freeze({ 1: '342', 2: '41', 3: '29', 4: '116', 5: '930' });
  const normalize = (value) => String(value ?? '').trim().replace(/\s+/g, '').replace('.', ',').toLowerCase();
  const checkRouteAnswers = (answers = {}) => {
    const answeredQuestionNumbers = [];
    const correctQuestionNumbers = [];
    Object.keys(ROUTE_ANSWERS).forEach((key) => {
      const number = Number(key);
      const value = answers[number] ?? answers[key] ?? '';
      if (normalize(value)) answeredQuestionNumbers.push(number);
      if (normalize(value) === normalize(ROUTE_ANSWERS[key])) correctQuestionNumbers.push(number);
    });
    return { answeredQuestionNumbers, correctQuestionNumbers };
  };
  const buildTaskProgress = (checked = {}) => Object.fromEntries(
    [1, 2, 3, 4, 5].map((number) => [number, {
      correct: checked.correctQuestionNumbers?.includes(number) ? 1 : 0,
      answered: checked.answeredQuestionNumbers?.includes(number) ? 1 : 0,
      total: 1,
    }]),
  );
  return { ROUTE_ANSWERS, checkRouteAnswers, buildTaskProgress };
});
