const first = require('./part-two-author-bank.json');
const wordProblems = require('./part-two-author-21.cjs');
const graphs = require('./part-two-author-22.cjs');
const geometry = require('./part-two-author-23.cjs');
const proofs = require('./part-two-author-24.cjs');
const advancedGeometry = require('./part-two-author-25.cjs');

module.exports = [...first, ...wordProblems, ...graphs, ...geometry, ...proofs, ...advancedGeometry];
