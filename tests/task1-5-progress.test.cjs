const assert = require('node:assert/strict');
const model = require('../study/math/part-one/task1-5-model.js');

assert.equal(model.ROUTE_PROTOTYPES.length, 2);
assert.equal(model.ROUTE_PROTOTYPES[0].analogs.length, 20);
assert.equal(model.ROUTE_PROTOTYPES[1].analogs.length, 4);
assert.equal(model.TIRE_PROTOTYPES.length, 1);
assert.equal(model.TIRE_PROTOTYPES[0].number, '2.1');
assert.equal(model.TIRE_PROTOTYPES[0].analogs.length, 21);
assert.equal(model.PRACTICAL_TASK_SET_COUNT, 76);
assert.deepEqual(model.PRACTICAL_TASK_TOTALS, { 1: 76, 2: 76, 3: 76, 4: 76, 5: 76 });

const firstTireAnalog = model.TIRE_PROTOTYPES[0].analogs[0];
assert.equal(firstTireAnalog.id, 'tires-2.1.1');
assert.deepEqual(firstTireAnalog.answers, { 1: '185', 2: '112,75', 3: '603', 4: '13,3', 5: '2,2' });
assert.equal(model.PRACTICAL_TYPES.tires.prototypes, model.TIRE_PROTOTYPES);

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
