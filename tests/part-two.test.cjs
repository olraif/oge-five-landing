const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { compare } = require('../study/math/part-two/answer-check.js');

const root = path.resolve(__dirname, '..');
const algebra = JSON.parse(fs.readFileSync(path.join(root, 'study/math/part-two/data/algebra-20-22.json'), 'utf8'));
const geometry = JSON.parse(fs.readFileSync(path.join(root, 'study/math/part-two/data/geometry-23-25.json'), 'utf8'));

test('оба раздела содержат по четыре задачи для каждого номера', () => {
  for (const [tasks, numbers] of [[algebra, [20, 21, 22]], [geometry, [23, 24, 25]]]) {
    assert.equal(tasks.length, 12);
    assert.equal(new Set(tasks.map((task) => task.id)).size, 12);
    for (const number of numbers) assert.equal(tasks.filter((task) => task.examNumber === number).length, 4);
    for (const task of tasks) {
      for (const key of ['prototypeFamily', 'prompt', 'answer', 'solution', 'validationMode']) assert.ok(task[key]);
      assert.notEqual(compare(task.validationMode, task.answer, task.answer), false, task.id);
    }
  }
});

test('числа, дроби, корни и множества сравниваются без ложного совпадения', () => {
  assert.equal(compare('number_with_unit', '4,8 см', '24/5 см'), true);
  assert.equal(compare('number_with_unit', '2√37', '2√37 см'), true);
  assert.equal(compare('set_of_numbers', '4; -3; 3', '−3; 3; 4'), true);
  assert.equal(compare('set_of_numbers', '4; -3', '−3; 3; 4'), false);
  assert.equal(compare('number_with_unit', '15', '12 см'), false);
});

test('графики и доказательства не объявляются автоматически полностью проверенными', () => {
  assert.equal(compare('parameter_set_plus_graph_self_check', 'm = 3 или m = −1', 'm = −1 или m = 3'), true);
  assert.equal(compare('parameter_set_plus_graph_self_check', 'm >= 4', 'm > 4'), false);
  assert.equal(compare('self_check_proof', 'Любой текст', 'Доказательство приведено в решении'), null);
});

test('ссылки на отдельные блоки ведут к созданным страницам', () => {
  const index = fs.readFileSync(path.join(root, 'study/index.html'), 'utf8');
  for (const file of ['algebra.html', 'geometry.html']) {
    assert.ok(index.includes(`math/part-two/${file}`));
    assert.ok(fs.existsSync(path.join(root, 'study/math/part-two', file)));
  }
});
