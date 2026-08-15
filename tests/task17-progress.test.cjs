const assert = require('node:assert/strict');
const path = require('node:path');
const model = require(path.join(__dirname, '..', 'study', 'progress-model.js'));

assert.equal(Object.values(model.TASK17_TOTALS).reduce((sum, value) => sum + value, 0), 320);
const summary = model.buildTask17Summary({
  '17.1': { correctIds: ['17.1.1', '17.1.2'], answeredIds: ['17.1.1', '17.1.2', '17.1.3'] },
  '17.2': { correctIds: ['17.2.1'], answeredIds: ['17.2.1'] },
});
assert.equal(summary.total, 320);
assert.equal(summary.correct, 3);
assert.equal(summary.wrong, 1);
assert.equal(summary.untouched, 316);
assert.equal(summary.percent, 1);
assert.deepEqual(summary.prototypes[0].cells, ['green', 'green', 'yellow', 'pink', 'pink']);
console.log('task17-progress: passed');