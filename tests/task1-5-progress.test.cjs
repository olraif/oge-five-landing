const assert = require('node:assert/strict');
const model = require('../study/math/part-one/task1-5-model.js');

assert.equal(model.ROUTE_PROTOTYPES.length, 2);
assert.equal(model.ROUTE_PROTOTYPES[0].analogs.length, 20);
assert.equal(model.ROUTE_PROTOTYPES[1].analogs.length, 4);
assert.equal(model.TIRE_PROTOTYPES.length, 1);
assert.equal(model.TIRE_PROTOTYPES[0].number, '2.1');
assert.equal(model.TIRE_PROTOTYPES[0].analogs.length, 21);
assert.equal(model.PLOT_PROTOTYPES.length, 1);
assert.equal(model.PLOT_PROTOTYPES[0].number, '3.1');
assert.equal(model.PLOT_PROTOTYPES[0].analogs.length, 8);
assert.equal(model.SHEET_PROTOTYPES.length, 1);
assert.equal(model.SHEET_PROTOTYPES[0].number, '4.1');
assert.equal(model.SHEET_PROTOTYPES[0].analogs.length, 4);
assert.equal(model.STOVE_PROTOTYPES.length, 1);
assert.equal(model.STOVE_PROTOTYPES[0].number, '5.1');
assert.equal(model.STOVE_PROTOTYPES[0].analogs.length, 2);
assert.equal(model.APARTMENT_PROTOTYPES.length, 1);
assert.equal(model.APARTMENT_PROTOTYPES[0].number, '6.1');
assert.equal(model.APARTMENT_PROTOTYPES[0].analogs.length, 8);
assert.equal(model.TARIFF_PROTOTYPES.length, 1);
assert.equal(model.TARIFF_PROTOTYPES[0].number, '7.1');
assert.equal(model.TARIFF_PROTOTYPES[0].analogs.length, 5);
assert.equal(model.PRACTICAL_TASK_SET_COUNT, 76);
assert.deepEqual(model.PRACTICAL_TASK_TOTALS, { 1: 76, 2: 76, 3: 76, 4: 76, 5: 76 });

const firstTireAnalog = model.TIRE_PROTOTYPES[0].analogs[0];
assert.equal(firstTireAnalog.id, 'tires-2.1.1');
assert.deepEqual(firstTireAnalog.answers, { 1: '185', 2: '112,75', 3: '603', 4: '13,3', 5: '2,2' });
assert.equal(model.PRACTICAL_TYPES.tires.prototypes, model.TIRE_PROTOTYPES);

const firstPlotAnalog = model.PLOT_PROTOTYPES[0].analogs[0];
assert.equal(firstPlotAnalog.id, 'plots-3.1.1');
assert.deepEqual(firstPlotAnalog.answers, { 1: '7425', 2: '7', 3: '36', 4: '29', 5: '500' });
assert.equal(model.PRACTICAL_TYPES.plots.prototypes, model.PLOT_PROTOTYPES);

const firstSheetAnalog = model.SHEET_PROTOTYPES[0].analogs[0];
assert.equal(firstSheetAnalog.id, 'sheets-4.1.1');
assert.deepEqual(firstSheetAnalog.answers, {
  1: '2413', 2: '2', 3: ['1250', '1247.4'], 4: '840', 5: '1250',
});
assert.equal(model.PRACTICAL_TYPES.sheets.prototypes, model.SHEET_PROTOTYPES);
const sheetChecked = model.checkAnswers(firstSheetAnalog, {
  1: '2413', 2: '2', 3: '1247,4', 4: '840', 5: '1250',
});
assert.deepEqual(sheetChecked.correctQuestionNumbers, [1, 2, 3, 4, 5]);

const firstStoveAnalog = model.STOVE_PROTOTYPES[0].analogs[0];
assert.equal(firstStoveAnalog.id, 'stoves-5.1.1');
assert.deepEqual(firstStoveAnalog.answers, {
  1: '312', 2: '15.4', 3: '2000', 4: '16200', 5: '65',
});
assert.equal(model.PRACTICAL_TYPES.stoves.prototypes, model.STOVE_PROTOTYPES);
const stoveChecked = model.checkAnswers(firstStoveAnalog, {
  1: '312', 2: '15,4', 3: '2000', 4: '16200', 5: '65',
});
assert.deepEqual(stoveChecked.correctQuestionNumbers, [1, 2, 3, 4, 5]);

const firstApartmentAnalog = model.APARTMENT_PROTOTYPES[0].analogs[0];
assert.equal(firstApartmentAnalog.id, 'apartments-6.1.1');
assert.deepEqual(firstApartmentAnalog.answers, {
  1: '2346', 2: '3.2', 3: '12', 4: '680', 5: '29700',
});
assert.equal(model.PRACTICAL_TYPES.apartments.prototypes, model.APARTMENT_PROTOTYPES);
const apartmentChecked = model.checkAnswers(firstApartmentAnalog, {
  1: '2346', 2: '3,2', 3: '12', 4: '680', 5: '29700',
});
assert.deepEqual(apartmentChecked.correctQuestionNumbers, [1, 2, 3, 4, 5]);

const firstTariffAnalog = model.TARIFF_PROTOTYPES[0].analogs[0];
assert.equal(firstTariffAnalog.id, 'tariffs-7.1.1');
assert.deepEqual(firstTariffAnalog.answers, {
  1: '83117', 2: '425', 3: '4', 4: '50', 5: '350',
});
assert.equal(model.PRACTICAL_TYPES.tariffs.prototypes, model.TARIFF_PROTOTYPES);
const tariffChecked = model.checkAnswers(firstTariffAnalog, {
  1: '83117', 2: '425', 3: '4', 4: '50', 5: '350',
});
assert.deepEqual(tariffChecked.correctQuestionNumbers, [1, 2, 3, 4, 5]);

const firstAnalog = model.ROUTE_PROTOTYPES[0].analogs[0];
assert.equal(firstAnalog.id, 'routes-1.1.1');
assert.deepEqual(firstAnalog.answers, { 1: '142', 2: '41', 3: '29', 4: '116', 5: '930' });

const checked = model.checkRouteAnswers(firstAnalog, { 1: '142', 2: '41', 3: '29', 4: '116', 5: '930' });
assert.deepEqual(checked.correctQuestionNumbers, [1, 2, 3, 4, 5]);
assert.deepEqual(checked.answeredQuestionNumbers, [1, 2, 3, 4, 5]);

const partial = model.checkRouteAnswers(firstAnalog, { 1: '142', 2: '8', 3: '', 4: '116', 5: '930' });
assert.deepEqual(partial.correctQuestionNumbers, [1, 4, 5]);
assert.deepEqual(partial.answeredQuestionNumbers, [1, 2, 4, 5]);
assert.deepEqual(model.buildTaskProgress(partial), {
  1: { correct: 1, answered: 1, total: 1 },
  2: { correct: 0, answered: 1, total: 1 },
  3: { correct: 0, answered: 0, total: 1 },
  4: { correct: 1, answered: 1, total: 1 },
  5: { correct: 1, answered: 1, total: 1 },
});

const tireChecked = model.checkAnswers(firstTireAnalog, { 1: '185', 2: '112.75', 3: '603', 4: '13,3', 5: '2,2' });
assert.deepEqual(tireChecked.correctQuestionNumbers, [1, 2, 3, 4, 5]);

const aggregate = model.aggregateTaskProgress({
  'routes-1.1.1': { taskProgress: model.buildTaskProgress(checked) },
  'routes-1.1.2': { taskProgress: model.buildTaskProgress(partial) },
});
assert.deepEqual(aggregate, {
  1: { correct: 2, answered: 2, total: 76 },
  2: { correct: 1, answered: 2, total: 76 },
  3: { correct: 1, answered: 1, total: 76 },
  4: { correct: 2, answered: 2, total: 76 },
  5: { correct: 2, answered: 2, total: 76 },
});
console.log('task1-5 progress tests passed');
