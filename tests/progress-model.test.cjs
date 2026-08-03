const assert = require('node:assert/strict');
const path = require('node:path');

const modelPath = path.join(__dirname, '..', 'study', 'progress-model.js');
const { buildTask6Summary, getPrototypeStatus } = require(modelPath);

const attempt = (correct, wrong, empty) => {
  const answers = {};
  for (let index = 0; index < correct + wrong + empty; index += 1) {
    answers[`q${index + 1}`] = index < correct + wrong ? 'answer' : '';
  }
  return { score: correct, answers };
};

const summary = buildTask6Summary({
  '6.1': attempt(8, 1, 0),
  '6.2': attempt(3, 1, 5),
});

assert.equal(summary.total, 85, 'task 6 should count all 85 analogues');
assert.equal(summary.correct, 11);
assert.equal(summary.wrong, 2);
assert.equal(summary.untouched, 72);
assert.equal(summary.percent, 13, '11 of 85 rounds to 13%');
assert.deepEqual(summary.prototypes[0].cells, [
  'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'yellow',
]);
assert.deepEqual(summary.prototypes[1].cells, [
  'green', 'green', 'green', 'yellow', 'pink', 'pink', 'pink', 'pink', 'pink',
]);

assert.equal(getPrototypeStatus(attempt(8, 1, 0), 9), 'in-progress');
assert.equal(getPrototypeStatus(attempt(9, 0, 0), 9), 'complete');
assert.equal(getPrototypeStatus(attempt(0, 0, 9), 9), 'not-started');

console.log('progress-model: grouped task 6 summary passed');
