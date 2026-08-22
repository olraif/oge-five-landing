(function initTaskOneToFiveModel(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OgeTaskOneToFiveModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createTaskOneToFiveModel(root) {
  const ROUTE_PROTOTYPES = root?.OgeTaskOneToFiveRoutes
    || (typeof require === 'function' ? require('./task1-5-routes-data.js') : []);
  const TIRE_PROTOTYPES = root?.OgeTaskOneToFiveTires
    || (typeof require === 'function' ? require('./task1-5-tires-data.js') : []);
  const PRACTICAL_TYPES = {
    routes: { id: 'routes', label: 'Маршруты', prototypes: ROUTE_PROTOTYPES },
    tires: { id: 'tires', label: 'Шины', prototypes: TIRE_PROTOTYPES },
  };

  const normalize = (value) => String(value ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace('.', ',')
    .toLowerCase();

  const findAnalog = (attemptId) => Object.values(PRACTICAL_TYPES)
    .flatMap((type) => type.prototypes || [])
    .flatMap((prototype) => prototype.analogs || [])
    .find((analog) => analog.id === attemptId) || null;

  const checkAnswers = (analog, answers = {}) => {
    const expected = analog?.answers || {};
    const answeredQuestionNumbers = [];
    const correctQuestionNumbers = [];
    [1, 2, 3, 4, 5].forEach((number) => {
      const value = answers[number] ?? answers[String(number)] ?? '';
      if (normalize(value)) answeredQuestionNumbers.push(number);
      if (normalize(value) === normalize(expected[number] ?? expected[String(number)])) {
        correctQuestionNumbers.push(number);
      }
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

  const aggregateTaskProgress = (attempts = {}) => {
    const totals = Object.fromEntries(
      [1, 2, 3, 4, 5].map((number) => [number, { correct: 0, answered: 0, total: 0 }]),
    );
    Object.values(attempts || {}).forEach((attempt) => {
      [1, 2, 3, 4, 5].forEach((number) => {
        const value = attempt?.taskProgress?.[number] || attempt?.taskProgress?.[String(number)];
        if (!value) return;
        totals[number].correct += Number(value.correct || 0);
        totals[number].answered += Number(value.answered || 0);
        totals[number].total += Number(value.total || 0);
      });
    });
    return totals;
  };

  const checkRouteAnswers = checkAnswers;

  return {
    ROUTE_PROTOTYPES,
    TIRE_PROTOTYPES,
    PRACTICAL_TYPES,
    findAnalog,
    normalize,
    checkRouteAnswers,
    checkAnswers,
    buildTaskProgress,
    aggregateTaskProgress,
  };
});
