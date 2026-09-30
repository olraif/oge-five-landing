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
assert.equal(model.PRACTICAL_TASK_SET_COUNT, 72);
assert.deepEqual(model.PRACTICAL_TASK_TOTALS, { 1: 72, 2: 72, 3: 72, 4: 72, 5: 72 });

const firstTireAnalog = model.TIRE_PROTOTYPES[0].analogs[0];
assert.equal(firstTireAnalog.id, 'tires-2.1.1');
assert.deepEqual(firstTireAnalog.answers, { 1: '185', 2: '123', 3: '621,5', 4: '18,9', 5: '1,7' });
assert.equal(model.PRACTICAL_TYPES.tires.prototypes, model.TIRE_PROTOTYPES);

const firstPlotAnalog = model.PLOT_PROTOTYPES[0].analogs[0];
assert.equal(firstPlotAnalog.id, 'plots-3.1.1');
assert.deepEqual(firstPlotAnalog.answers, { 1: '7425', 2: '8', 3: '36', 4: '29', 5: '400' });
assert.equal(model.PRACTICAL_TYPES.plots.prototypes, model.PLOT_PROTOTYPES);

const firstSheetAnalog = model.SHEET_PROTOTYPES[0].analogs[0];
assert.equal(firstSheetAnalog.id, 'sheets-4.1.1');
assert.deepEqual(firstSheetAnalog.answers, {
  1: '2413', 2: '8', 3: '625', 4: '590', 5: '2250',
});
assert.equal(model.PRACTICAL_TYPES.sheets.prototypes, model.SHEET_PROTOTYPES);
const sheetChecked = model.checkAnswers(firstSheetAnalog, {
  1: '2413', 2: '8', 3: '625', 4: '590', 5: '2250',
});
assert.deepEqual(sheetChecked.correctQuestionNumbers, [1, 2, 3, 4, 5]);

const firstStoveAnalog = model.STOVE_PROTOTYPES[0].analogs[0];
assert.equal(firstStoveAnalog.id, 'stoves-5.1.1');
assert.deepEqual(firstStoveAnalog.answers, {
  1: '321', 2: '16.8', 3: '4100', 4: '21930', 5: '130',
});
assert.equal(model.PRACTICAL_TYPES.stoves.prototypes, model.STOVE_PROTOTYPES);
const stoveChecked = model.checkAnswers(firstStoveAnalog, {
  1: '321', 2: '16,8', 3: '4100', 4: '21930', 5: '130',
});
assert.deepEqual(stoveChecked.correctQuestionNumbers, [1, 2, 3, 4, 5]);

const firstApartmentAnalog = model.APARTMENT_PROTOTYPES[0].analogs[0];
assert.equal(firstApartmentAnalog.id, 'apartments-6.1.1');
assert.deepEqual(firstApartmentAnalog.answers, {
  1: '6723', 2: '14.4', 3: '12', 4: '525', 5: '28700',
});
assert.equal(model.PRACTICAL_TYPES.apartments.prototypes, model.APARTMENT_PROTOTYPES);
const apartmentChecked = model.checkAnswers(firstApartmentAnalog, {
  1: '6723', 2: '14,4', 3: '12', 4: '525', 5: '28700',
});
assert.deepEqual(apartmentChecked.correctQuestionNumbers, [1, 2, 3, 4, 5]);

const firstTariffAnalog = model.TARIFF_PROTOTYPES[0].analogs[0];
assert.equal(firstTariffAnalog.id, 'tariffs-7.1.1');
assert.deepEqual(firstTariffAnalog.answers, {
  1: '10724', 2: '680', 3: '4', 4: '50', 5: '480',
});
assert.equal(model.PRACTICAL_TYPES.tariffs.prototypes, model.TARIFF_PROTOTYPES);
const tariffChecked = model.checkAnswers(firstTariffAnalog, {
  1: '10724', 2: '680', 3: '4', 4: '50', 5: '480',
});
assert.deepEqual(tariffChecked.correctQuestionNumbers, [1, 2, 3, 4, 5]);

const firstAnalog = model.ROUTE_PROTOTYPES[0].analogs[0];
assert.equal(firstAnalog.id, 'routes-1.1.1');
assert.deepEqual(firstAnalog.answers, { 1: '142', 2: '41', 3: '29', 4: '116', 5: '954' });

const checked = model.checkRouteAnswers(firstAnalog, { 1: '142', 2: '41', 3: '29', 4: '116', 5: '954' });
assert.deepEqual(checked.correctQuestionNumbers, [1, 2, 3, 4, 5]);
assert.deepEqual(checked.answeredQuestionNumbers, [1, 2, 3, 4, 5]);

const partial = model.checkRouteAnswers(firstAnalog, { 1: '142', 2: '8', 3: '', 4: '116', 5: '954' });
assert.deepEqual(partial.correctQuestionNumbers, [1, 4, 5]);
assert.deepEqual(partial.answeredQuestionNumbers, [1, 2, 4, 5]);
assert.deepEqual(model.buildTaskProgress(partial), {
  1: { correct: 1, answered: 1, total: 1 },
  2: { correct: 0, answered: 1, total: 1 },
  3: { correct: 0, answered: 0, total: 1 },
  4: { correct: 1, answered: 1, total: 1 },
  5: { correct: 1, answered: 1, total: 1 },
});

const tireChecked = model.checkAnswers(firstTireAnalog, { 1: '185', 2: '123', 3: '621.5', 4: '18,9', 5: '1,7' });
assert.deepEqual(tireChecked.correctQuestionNumbers, [1, 2, 3, 4, 5]);

const aggregate = model.aggregateTaskProgress({
  'routes-1.1.1': { taskProgress: model.buildTaskProgress(checked) },
  'routes-1.1.2': { taskProgress: model.buildTaskProgress(partial) },
});
assert.deepEqual(aggregate, {
  1: { correct: 2, answered: 2, total: 72 },
  2: { correct: 1, answered: 2, total: 72 },
  3: { correct: 1, answered: 1, total: 72 },
  4: { correct: 2, answered: 2, total: 72 },
  5: { correct: 2, answered: 2, total: 72 },
});
console.log('task1-5 progress tests passed');
