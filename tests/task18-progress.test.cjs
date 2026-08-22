const assert = require('node:assert/strict');
const path = require('node:path');
const model = require(path.join(__dirname, '..', 'study', 'progress-model.js'));

assert.equal(Object.values(model.TASK18_TOTALS).reduce((sum, value) => sum + value, 0), 158);
const summary = model.buildTask18Summary({
  '18.1': { correctIds: ['18.1.1', '18.1.2'], answeredIds: ['18.1.1', '18.1.2', '18.1.3'] },
  '18.2': { correctIds: ['18.2.1'], answeredIds: ['18.2.1'] },
});
assert.equal(summary.total, 158);
assert.equal(summary.correct, 3);
assert.equal(summary.wrong, 1);
assert.equal(summary.untouched, 154);
assert.equal(summary.percent, 2);
assert.deepEqual(summary.prototypes[0].cells.slice(0, 4), ['green', 'green', 'yellow', 'pink']);
console.log('task18-progress: passed');
