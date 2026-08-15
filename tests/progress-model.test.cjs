const assert = require('node:assert/strict');
const path = require('node:path');

const modelPath = path.join(__dirname, '..', 'study', 'progress-model.js');
const { TASK6_ANSWER_KEYS, TASK8_TOTALS, TASK9_TOTALS, TASK10_TOTALS, TASK11_TOTALS, TASK12_TOTALS, TASK13_TOTALS, TASK14_TOTALS, TASK15_TOTALS, buildTask6Summary, buildTask8Summary, buildTask9Summary, buildTask10Summary, buildTask11Summary, buildTask12Summary, buildTask13Summary, buildTask14Summary, buildTask15Summary, getPrototypeStatus, createAccountProgressStorage, isAttemptOwnedByAccount } = require(modelPath);

assert.equal(
  typeof createAccountProgressStorage,
  'function',
  'progress cache must be scoped to the authenticated student account',
);

const memory = new Map();
const browserStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
};
const accountStorage = createAccountProgressStorage(browserStorage);
const oldOlesyaAttempt = { prototype: '6.1', score: 9, answers: { q1: '9,4' } };
browserStorage.setItem('ogeTrainer:v3:math:task6:prototype6.1', JSON.stringify(oldOlesyaAttempt));

assert.equal(
  accountStorage.read('ogeTrainer:v3:math:task6:', 'new-student-id', 'prototype6.1'),
  null,
  'a new student must not inherit a legacy unscoped browser attempt',
);

accountStorage.write('ogeTrainer:v3:math:task6:', 'olesya-id', 'prototype6.1', oldOlesyaAttempt);
assert.deepEqual(
  accountStorage.read('ogeTrainer:v3:math:task6:', 'olesya-id', 'prototype6.1'),
  oldOlesyaAttempt,
  'the owner must keep her own cached attempt',
);
assert.equal(
  accountStorage.read('ogeTrainer:v3:math:task6:', 'new-student-id', 'prototype6.1'),
  null,
  'another authenticated student must start with empty progress',
);

const newStudent = { id: 'new-student-id', created_at: '2026-08-15T10:00:00.000Z' };
assert.equal(
  isAttemptOwnedByAccount({ savedAt: '2026-08-14T10:00:00.000Z' }, newStudent),
  false,
  'an attempt saved before registration cannot belong to the new student',
);
assert.equal(
  isAttemptOwnedByAccount({ ownerId: 'new-student-id', savedAt: '2026-08-15T10:01:00.000Z' }, newStudent),
  true,
  'an explicitly owned attempt must remain visible to its student',
);

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

assert.equal(Object.values(TASK11_TOTALS).reduce((sum, value) => sum + value, 0), 103, 'task 11 should count all 103 tasks');
const task11Summary = buildTask11Summary({
  '11.1': { total: 14, correctIds: ['11.1.1', '11.1.2'], answeredIds: ['11.1.1', '11.1.2', '11.1.3'] },
  '11.2': { total: 13, correctIds: ['11.2.1'], answeredIds: ['11.2.1'] },
});
assert.equal(task11Summary.total, 103);
assert.equal(task11Summary.correct, 3);
assert.equal(task11Summary.wrong, 1);
assert.equal(task11Summary.untouched, 99);
assert.equal(task11Summary.percent, 3);
assert.deepEqual(task11Summary.prototypes[0].cells.slice(0, 5), ['green', 'green', 'yellow', 'pink', 'pink']);
assert.deepEqual(task11Summary.prototypes[1].cells.slice(0, 3), ['green', 'pink', 'pink']);

assert.equal(Object.values(TASK12_TOTALS).reduce((sum, value) => sum + value, 0), 182, 'task 12 should count all 182 tasks');
const task12Summary = buildTask12Summary({
  '12.1': { total: 8, correctIds: ['12.1.1', '12.1.2'], answeredIds: ['12.1.1', '12.1.2', '12.1.3'] },
  '12.2': { total: 4, correctIds: ['12.2.1'], answeredIds: ['12.2.1'] },
});
assert.equal(task12Summary.total, 182);
assert.equal(task12Summary.correct, 3);
assert.equal(task12Summary.wrong, 1);
assert.equal(task12Summary.untouched, 178);
assert.equal(task12Summary.percent, 2);
assert.equal(typeof TASK13_TOTALS, "object");
assert.equal(Object.values(TASK13_TOTALS).reduce((sum, value) => sum + value, 0), 131, "task 13 should count all 131 tasks");
const task13Summary = buildTask13Summary({
  "13.1": { total: 10, correctIds: ["13.1.1", "13.1.2"], answeredIds: ["13.1.1", "13.1.2", "13.1.3"] },
  "13.2": { total: 20, correctIds: ["13.2.1"], answeredIds: ["13.2.1"] },
});
assert.equal(task13Summary.total, 131);
assert.equal(task13Summary.correct, 3);
assert.equal(task13Summary.wrong, 1);
assert.equal(task13Summary.untouched, 127);
assert.equal(task13Summary.percent, 2);
assert.deepEqual(task13Summary.prototypes[0].cells.slice(0, 5), ["green", "green", "yellow", "pink", "pink"]);
assert.deepEqual(task13Summary.prototypes[1].cells.slice(0, 3), ["green", "pink", "pink"]);
assert.equal(typeof TASK14_TOTALS, "object");
assert.equal(Object.values(TASK14_TOTALS).reduce((sum, value) => sum + value, 0), 117, "task 14 should count all 117 tasks");
const task14Summary = buildTask14Summary({
  "14.1": { total: 10, correctIds: ["14.1.1", "14.1.2"], answeredIds: ["14.1.1", "14.1.2", "14.1.3"] },
  "14.2": { total: 10, correctIds: ["14.2.1"], answeredIds: ["14.2.1"] },
});
assert.equal(task14Summary.total, 117);
assert.equal(task14Summary.correct, 3);
assert.equal(task14Summary.wrong, 1);
assert.equal(task14Summary.untouched, 113);
assert.equal(task14Summary.percent, 3);
assert.deepEqual(task14Summary.prototypes[0].cells.slice(0, 5), ["green", "green", "yellow", "pink", "pink"]);
assert.deepEqual(task14Summary.prototypes[1].cells.slice(0, 3), ["green", "pink", "pink"]);

assert.equal(typeof TASK15_TOTALS, "object");
assert.equal(Object.values(TASK15_TOTALS).reduce((sum, value) => sum + value, 0), 258);
const task15Summary = buildTask15Summary({
  "15.1": { total: 12, correctIds: ["15.1.1", "15.1.2"], answeredIds: ["15.1.1", "15.1.2", "15.1.3"] },
  "15.2": { total: 10, correctIds: ["15.2.1"], answeredIds: ["15.2.1"] },
});
assert.equal(task15Summary.total, 258);
assert.equal(task15Summary.correct, 3);
assert.equal(task15Summary.wrong, 1);
assert.equal(task15Summary.untouched, 254);
assert.equal(task15Summary.percent, 1);
assert.deepEqual(task15Summary.prototypes[0].cells.slice(0, 5), ["green", "green", "yellow", "pink", "pink"]);
assert.deepEqual(task15Summary.prototypes[1].cells.slice(0, 3), ["green", "pink", "pink"]);
assert.deepEqual(task12Summary.prototypes[0].cells.slice(0, 5), ['green', 'green', 'yellow', 'pink', 'pink']);
assert.deepEqual(task12Summary.prototypes[1].cells.slice(0, 3), ['green', 'pink', 'pink']);
console.log('progress-model: grouped task 6 through task 15 summaries passed');
