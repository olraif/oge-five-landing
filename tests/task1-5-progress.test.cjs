const assert = require('node:assert/strict');
const model = require('../study/math/part-one/task1-5-model.js');

const checked = model.checkRouteAnswers({ 1: '342', 2: '41', 3: '29', 4: '116', 5: '930' });
assert.deepEqual(checked.correctQuestionNumbers, [1, 2, 3, 4, 5]);
assert.deepEqual(checked.answeredQuestionNumbers, [1, 2, 3, 4, 5]);

const partial = model.checkRouteAnswers({ 1: '342', 2: '8', 3: '', 4: '116', 5: '930' });
assert.deepEqual(partial.correctQuestionNumbers, [1, 4, 5]);
assert.deepEqual(partial.answeredQuestionNumbers, [1, 2, 4, 5]);
assert.deepEqual(model.buildTaskProgress(partial), {
  1: { correct: 1, answered: 1, total: 1 },
  2: { correct: 0, answered: 1, total: 1 },
  3: { correct: 0, answered: 0, total: 1 },
  4: { correct: 1, answered: 1, total: 1 },
  5: { correct: 1, answered: 1, total: 1 },
});
console.log('task1-5 progress tests passed');