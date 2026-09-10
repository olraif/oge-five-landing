const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const trainerPath = path.join(root, 'study', 'math', 'part-one', 'part-one.js');
const source = fs.readFileSync(trainerPath, 'utf8');
const objectMatch = source.match(/const prototypeData = (\{[\s\S]+?\n\});\r?\nlet activePrototype/);
assert.ok(objectMatch, 'task 6 prototype data must be readable');

const prototypes = vm.runInNewContext('(' + objectMatch[1] + ')');
for (const match of source.matchAll(/prototypeData\["(6\.(?:9|10))"\]\.items = (\[\[[^;]+\]\]);/g)) {
  prototypes[match[1]].items = vm.runInNewContext(match[2]);
}

const legacyExpressions = new Set([
  '6,8 + 2,6', '6,9 + 7,4', '7,9 + 2,2', '8,3 + 5,4', '8,4 + 3,7', '8,7 + 4,6', '8,8 + 5,9', '9,3 + 7,8', '9,8 + 8,6',
  '4,9 - 9,4', '3,6 - 4,1', '3,9 - 7,3', '4,4 - 1,7', '4,7 - 8,2', '5,7 - 7,6', '6,1 - 2,5', '6,4 - 4,8', '9,2 - 2,4',
  '2,1 * 9,6', '2,3 * 7,5', '3,2 * 6,2', '5,2 * 3,1', '6,7 * 5,5', '7,7 * 5,3', '8,1 * 7,2', '8,9 * 4,3', '9,9 * 7,1',
  '4,8 : 0,4', '8,4 : 1,2', '6,8 : 1,7', '8,7 : 2,9', '8,2 : 4,1', '9,6 : 1,2', '13,2 : 1,2', '8,1 : 0,9', '6,5 : 1,3',
  '1/2 + 31/20', '1/2 + 33/50', '1/4 + 37/20', '1/5 + 17/10', '1/5 + 19/20', '1/5 + 53/50', '1/10 + 29/20', '1/10 + 21/50', '1/25 + 43/50',
  '1/2 - 49/20', '1/2 - 13/50', '1/4 - 51/20', '1/5 - 47/10', '1/5 - 41/50', '1/5 - 27/20', '1/10 - 39/50', '1/10 - 23/20', '1/25 - 7/50',
  '5/3 * 9/2', '3/4 * 6/5', '15/4 * 6/5', '2/5 * 9/8', '3/5 * 25/4', '7/5 * 12/35', '9/5 * 2/3', '21/5 * 3/7', '7/6 * 9/5',
  '15/4 : 3/7', '3/5 : 2/15', '3/5 : 4/35', '4/5 : 2/7', '6/5 : 4/11', '12/5 : 15/2', '14/5 : 7/2', '21/5 : 6/7', '7/8 : 5/6',
  '1/7 + 3/4 (знаменатель 56)', '2/3 - 7/13 (знаменатель 78)', '3/4 - 8/11 (знаменатель 88)', '5/8 + 1/3 (знаменатель 48)', '6/7 - 3/5 (знаменатель 70)', '7/9 - 2/5 (знаменатель 90)',
  '1 / (1/28 + 1/12)', '1 / (1/36 + 1/45)', '1 / (1/21 + 1/28)', '1 / (1/14 - 1/63)', '1 / (1/36 - 1/44)', '1 / (1/35 - 1/60)', '1 / (1/72 - 1/99)',
]);

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const fraction = (numerator, denominator = 1) => {
  assert.notEqual(denominator, 0, 'division by zero is not allowed');
  const sign = denominator < 0 ? -1 : 1;
  const divisor = gcd(numerator, denominator);
  return { numerator: sign * numerator / divisor, denominator: Math.abs(denominator) / divisor };
};
const decimal = (value) => {
  const normalized = String(value).replace(',', '.');
  const sign = normalized.startsWith('-') ? -1 : 1;
  const unsigned = normalized.replace(/^-/, '');
  const parts = unsigned.split('.');
  const whole = parts[0];
  const digits = parts[1] || '';
  return fraction(sign * Number(whole + digits), 10 ** digits.length);
};
const simpleFraction = (value) => {
  const parts = value.split('/').map(Number);
  return fraction(parts[0], parts[1]);
};
const calculate = (left, operator, right) => {
  if (operator === '+') return fraction(left.numerator * right.denominator + right.numerator * left.denominator, left.denominator * right.denominator);
  if (operator === '-') return fraction(left.numerator * right.denominator - right.numerator * left.denominator, left.denominator * right.denominator);
  if (operator === '*') return fraction(left.numerator * right.numerator, left.denominator * right.denominator);
  if (operator === ':') return fraction(left.numerator * right.denominator, left.denominator * right.numerator);
  throw new Error('unknown operator ' + operator);
};
const assertAnswer = (id, expression, answer) => {
  let actual;
  if (id.startsWith('6.9.')) {
    const match = expression.match(/^(\d+\/\d+) ([+-]) (\d+\/\d+) \(знаменатель (\d+)\)$/);
    assert.ok(match, id + ': invalid denominator expression');
    const value = calculate(simpleFraction(match[1]), match[2], simpleFraction(match[3]));
    actual = fraction(value.numerator * Number(match[4]), value.denominator);
  } else if (id.startsWith('6.10.')) {
    const match = expression.match(/^1 \/ \(1\/(\d+) ([+-]) 1\/(\d+)\)$/);
    assert.ok(match, id + ': invalid complex fraction');
    const denominator = calculate(fraction(1, Number(match[1])), match[2], fraction(1, Number(match[3])));
    actual = fraction(denominator.denominator, denominator.numerator);
  } else {
    const match = expression.match(/^([^ ]+) ([+*:-]) ([^ ]+)$/);
    assert.ok(match, id + ': invalid arithmetic expression');
    const parser = /^6\.[1-4]\./.test(id) ? decimal : simpleFraction;
    actual = calculate(parser(match[1]), match[2], parser(match[3]));
  }
  assert.deepEqual(actual, decimal(answer), id + ': ' + expression + ' must equal ' + answer);
};

const items = Object.values(prototypes).flatMap((prototype) => prototype.items);
assert.equal(items.length, 85, 'task 6 must keep all 85 exercises');
for (const item of items) {
  const [id, expression, answer] = item;
  assert.ok(!legacyExpressions.has(expression), id + ': operands were not remixed');
  assertAnswer(id, expression, answer);
}

const { TASK6_ANSWER_KEYS } = require(path.join(root, 'study', 'progress-model.js'));
for (const [key, prototype] of Object.entries(prototypes)) {
  assert.deepEqual(Array.from(TASK6_ANSWER_KEYS[key]), Array.from(prototype.items, (item) => item[2]), key + ': trainer and green progress answers must match');
}

console.log('Task 6: all 85 remixed exercises have exact answers and synchronized progress keys.');
