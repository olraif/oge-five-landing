const assert = require('node:assert/strict');
const path = require('node:path');

const modelPath = path.join(__dirname, '..', 'study', 'progress-model.js');
const { TASK6_ANSWER_KEYS, TASK8_TOTALS, TASK9_TOTALS, TASK10_TOTALS, buildTask6Summary, buildTask8Summary, buildTask9Summary, buildTask10Summary, getPrototypeStatus } = require(modelPath);

const attempt = (key, correct, wrong, empty) => {
  const answers = {};
  for (let index = 0; index < correct + wrong + empty; index += 1) {
    if (index < correct) answers[`q${index + 1}`] = TASK6_ANSWER_KEYS[key][index];
    else answers[`q${index + 1}`] = index < correct + wrong ? 'wrong' : '';
  }
  return { score: correct, answers };
};

const summary = buildTask6Summary({
  '6.1': attempt('6.1', 8, 1, 0),
  '6.2': attempt('6.2', 3, 1, 5),
  '6.10': {
    prototype: '6.10',
    score: 6,
    total: 7,
    answers: { q1: '9,4', q2: '14,3', q3: '10,1', q4: '13,7', q5: '12,1', q6: '10', q7: '14,7' },
  },
});

assert.equal(summary.total, 85, 'task 6 should count all 85 analogues');
assert.equal(summary.correct, 11);
assert.equal(summary.wrong, 2);
assert.equal(summary.untouched, 72);
assert.equal(summary.percent, 13, '11 of 85 rounds to 13%');
assert.equal(summary.prototypes[9].correct, 0, 'copied 6.1 answers must not count as 6.10 progress');
assert.equal(summary.prototypes[9].wrong, 0, 'corrupted legacy attempt must be ignored, not marked as a real mistake');
assert.equal(summary.prototypes[9].untouched, 7);
assert.deepEqual(summary.prototypes[0].cells, [
  'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'yellow',
]);
assert.deepEqual(summary.prototypes[1].cells, [
  'green', 'green', 'green', 'yellow', 'pink', 'pink', 'pink', 'pink', 'pink',
]);

const genericAttempt = (correct, wrong, empty) => {
  const answers = {};
  for (let index = 0; index < correct + wrong + empty; index += 1) {
    answers[`q${index + 1}`] = index < correct + wrong ? 'answer' : '';
  }
  return { score: correct, answers };
};

assert.equal(getPrototypeStatus(genericAttempt(8, 1, 0), 9), 'in-progress');
assert.equal(getPrototypeStatus(genericAttempt(9, 0, 0), 9), 'complete');
assert.equal(getPrototypeStatus(genericAttempt(0, 0, 9), 9), 'not-started');

assert.equal(Object.values(TASK8_TOTALS).reduce((sum, value) => sum + value, 0), 143, 'task 8 should count all 143 tasks');
const task8Summary = buildTask8Summary({
  '8.1': { total: 5, correctIds: ['8.1.1', '8.1.2'], answeredIds: ['8.1.1', '8.1.2', '8.1.3'] },
  '8.2': { total: 4, correctIds: ['8.2.1', '8.2.2', '8.2.3', '8.2.4'], answeredIds: ['8.2.1', '8.2.2', '8.2.3', '8.2.4'] },
});
assert.equal(task8Summary.total, 143);
assert.equal(task8Summary.correct, 6);
assert.equal(task8Summary.wrong, 1);
assert.equal(task8Summary.untouched, 136);
assert.equal(task8Summary.percent, 4);
assert.deepEqual(task8Summary.prototypes[0].cells, ['green', 'green', 'yellow', 'pink', 'pink']);
assert.deepEqual(task8Summary.prototypes[1].cells, ['green', 'green', 'green', 'green']);
assert.equal(Object.values(TASK9_TOTALS).reduce((sum, value) => sum + value, 0), 124, 'task 9 should count all 124 tasks');
const task9Summary = buildTask9Summary({
  '9.1': { total: 9, correctIds: ['9.1.1', '9.1.2', '9.1.3'], answeredIds: ['9.1.1', '9.1.2', '9.1.3', '9.1.4'] },
  '9.2': { total: 9, correctIds: ['9.2.1'], answeredIds: ['9.2.1'] },
});
assert.equal(task9Summary.total, 124);
assert.equal(task9Summary.correct, 4);
assert.equal(task9Summary.wrong, 1);
assert.equal(task9Summary.untouched, 119);
assert.equal(task9Summary.percent, 3);
assert.deepEqual(task9Summary.prototypes[0].cells, ['green', 'green', 'green', 'yellow', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink']);
assert.deepEqual(task9Summary.prototypes[1].cells, ['green', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink']);
assert.equal(Object.values(TASK10_TOTALS).reduce((sum, value) => sum + value, 0), 217, 'task 10 should count all 217 tasks');
const task10Summary = buildTask10Summary({
  '10.1': { total: 10, correctIds: ['10.1.1', '10.1.2'], answeredIds: ['10.1.1', '10.1.2', '10.1.3'] },
  '10.2': { total: 16, correctIds: ['10.2.1'], answeredIds: ['10.2.1'] },
});
assert.equal(task10Summary.total, 217);
assert.equal(task10Summary.correct, 3);
assert.equal(task10Summary.wrong, 1);
assert.equal(task10Summary.untouched, 213);
assert.equal(task10Summary.percent, 1);
assert.deepEqual(task10Summary.prototypes[0].cells, ['green', 'green', 'yellow', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink']);
assert.deepEqual(task10Summary.prototypes[1].cells, ['green', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink', 'pink']);
console.log('progress-model: grouped task 6, task 8, task 9, and task 10 summaries passed');
