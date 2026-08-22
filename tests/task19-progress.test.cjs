const assert = require('node:assert/strict');
const path = require('node:path');
const model = require(path.join(__dirname, '..', 'study', 'progress-model.js'));

assert.equal(Object.values(model.TASK19_TOTALS).reduce((sum, value) => sum + value, 0), 151);
const summary = model.buildTask19Summary({
  '19.1': { correctIds: ['19.1.1', '19.1.2'], answeredIds: ['19.1.1', '19.1.2', '19.1.3'] },
  '19.2': { correctIds: ['19.2.1'], answeredIds: ['19.2.1'] },
});
assert.equal(summary.total, 151);
assert.equal(summary.correct, 3);
assert.equal(summary.wrong, 1);
assert.equal(summary.untouched, 147);
assert.equal(summary.percent, 2);
assert.deepEqual(summary.prototypes[0].cells.slice(0, 4), ['green', 'green', 'yellow', 'pink']);
console.log('task19-progress: passed');
