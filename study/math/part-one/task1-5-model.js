(function initTaskOneToFiveModel(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OgeTaskOneToFiveModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createTaskOneToFiveModel(root) {
  const ROUTE_PROTOTYPES = root?.OgeTaskOneToFiveRoutes
    || (typeof require === 'function' ? require('./task1-5-routes-data.js') : []);
  const TIRE_PROTOTYPES = root?.OgeTaskOneToFiveTires
    || (typeof require === 'function' ? require('./task1-5-tires-data.js') : []);
  const PLOT_PROTOTYPES = root?.OgeTaskOneToFivePlots
    || (typeof require === 'function' ? require('./task1-5-plots-data.js') : []);
  const SHEET_PROTOTYPES = root?.OgeTaskOneToFiveSheets
    || (typeof require === 'function' ? require('./task1-5-sheets-data.js') : []);
  const STOVE_PROTOTYPES = root?.OgeTaskOneToFiveStoves
    || (typeof require === 'function' ? require('./task1-5-stoves-data.js') : []);
  const PRACTICAL_TYPES = {
    routes: { id: 'routes', label: 'Маршруты', prototypes: ROUTE_PROTOTYPES },
    tires: { id: 'tires', label: 'Шины', prototypes: TIRE_PROTOTYPES },
    plots: { id: 'plots', label: 'Участки', prototypes: PLOT_PROTOTYPES },
    sheets: { id: 'sheets', label: 'Листы', prototypes: SHEET_PROTOTYPES },
    stoves: { id: 'stoves', label: 'Печки', prototypes: STOVE_PROTOTYPES },
  };
  // В банке 380 практических подзаданий: 76 комплектов по пять вопросов.
  const PRACTICAL_TASK_SET_COUNT = 76;
  const PRACTICAL_TASK_TOTALS = Object.fromEntries(
    [1, 2, 3, 4, 5].map((number) => [number, PRACTICAL_TASK_SET_COUNT]),
  );

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
      const expectedValue = expected[number] ?? expected[String(number)];
      const acceptedValues = Array.isArray(expectedValue) ? expectedValue : [expectedValue];
      if (acceptedValues.some((accepted) => normalize(value) === normalize(accepted))) {
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
      [1, 2, 3, 4, 5].map((number) => [number, { correct: 0, answered: 0, total: PRACTICAL_TASK_TOTALS[number] }]),
    );
    Object.values(attempts || {}).forEach((attempt) => {
      [1, 2, 3, 4, 5].forEach((number) => {
        const value = attempt?.taskProgress?.[number] || attempt?.taskProgress?.[String(number)];
        if (!value) return;
        totals[number].correct += Number(value.correct || 0);
        totals[number].answered += Number(value.answered || 0);
      });
    });
    return totals;
  };

  const checkRouteAnswers = checkAnswers;

  return {
    ROUTE_PROTOTYPES,
    TIRE_PROTOTYPES,
    PLOT_PROTOTYPES,
    SHEET_PROTOTYPES,
    STOVE_PROTOTYPES,
    PRACTICAL_TYPES,
    PRACTICAL_TASK_SET_COUNT,
    PRACTICAL_TASK_TOTALS,
    findAnalog,
    normalize,
    checkRouteAnswers,
    checkAnswers,
    buildTaskProgress,
    aggregateTaskProgress,
  };
});
