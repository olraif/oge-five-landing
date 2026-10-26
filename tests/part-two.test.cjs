const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { compare } = require('../study/math/part-two/answer-check.js');
const progressCodec = require('../study/math/part-two/progress-codec.js');
const typography = require('../study/math/part-two/math-typography.js');

const root = path.resolve(__dirname, '..');
const algebra = JSON.parse(fs.readFileSync(path.join(root, 'study/math/part-two/data/algebra-20-22.json'), 'utf8'));
const geometry = JSON.parse(fs.readFileSync(path.join(root, 'study/math/part-two/data/geometry-23-25.json'), 'utf8'));

test('черновые файлы второй части не выдаются за полный банк прототипов', () => {
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
  assert.equal(compare('set_of_numbers', '√13; 2√13; 3√5', '1√13; 2√13; 3√5'), true);
  assert.equal(compare('number_with_unit', '15', '12 см'), false);
  assert.equal(compare('set_of_pairs', '(3; 12); (1; 0)', '(1; 0); (3; 12)'), true);
  assert.equal(compare('set_of_pairs', '(1; 0); (3; 10)', '(1; 0); (3; 12)'), false);
});

test('графики и доказательства не объявляются автоматически полностью проверенными', () => {
  assert.equal(compare('parameter_set_plus_graph_self_check', 'm = 3 или m = −1', 'm = −1 или m = 3'), true);
  assert.equal(compare('parameter_set_plus_graph_self_check', 'm >= 4', 'm > 4'), false);
  assert.equal(compare('self_check_proof', 'Любой текст', 'Доказательство приведено в решении'), null);
});

test('прогресс 330 аналогов сохраняется компактно и отдельно для каждого ученика', () => {
  const bank = require(path.join(root, 'content/part-two-author-bank.cjs'));
  const indexes = bank.flatMap((group) => group.analogs.map((task) => progressCodec.taskIndex(task.id)));
  assert.equal(new Set(indexes).size, 330);
  assert.equal(Math.min(...indexes), 0);
  assert.equal(Math.max(...indexes), 329);
  let progress = progressCodec.withStatus({}, 'student-a', '20.1-a', 'correct');
  progress = progressCodec.withStatus(progress, 'student-a', '24.15-c', 'reviewed');
  assert.equal(progress.partTwoV1.statuses.length, 330);
  assert.equal(progressCodec.statusAt(progress, 'student-a', '20.1-a'), 'correct');
  assert.equal(progressCodec.statusAt(progress, 'student-a', '24.15-c'), 'reviewed');
  assert.equal(progressCodec.statusAt(progress, 'student-b', '20.1-a'), null);
  assert.deepEqual(progressCodec.summary(progress, 'student-a', 20), { total: 72, correct: 1, reviewed: 0 });
  assert.deepEqual(progressCodec.summary(progress, 'student-a', 24), { total: 45, correct: 0, reviewed: 1 });
  assert.equal(progressCodec.taskIndex('25.17-a'), null);
});

test('все три карточки доступа ведут в общую панель 1–25', () => {
  const index = fs.readFileSync(path.join(root, 'study/index.html'), 'utf8');
  assert.equal((index.match(/class="access-enter" href="math\/index\.html"/g) || []).length, 3);
  const hub = fs.readFileSync(path.join(root, 'study/math/index.html'), 'utf8');
  for (const course of ['math-first', 'math-algebra', 'math-geometry']) assert.ok(hub.includes(`data-course-summary="${course}"`));
  const nav = fs.readFileSync(path.join(root, 'study/math/part-one/trainer-navigation.js'), 'utf8');
  for (let number = 20; number <= 25; number += 1) assert.ok(nav.includes(`${number}: '/study/math/part-two/`));
});

test('все 110 прототипов PDF имеют по три авторских аналога', () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'content/part-two-prototype-catalog.json'), 'utf8'));
  const bank = require(path.join(root, 'content/part-two-author-bank.cjs'));
  assert.equal(catalog.length, 110);
  assert.deepEqual([20, 21, 22, 23, 24, 25].map((number) => catalog.filter((p) => p.examNumber === number).length), [24, 21, 15, 19, 15, 16]);
  assert.equal(bank.length, catalog.length);
  assert.deepEqual([20, 21, 22, 23, 24, 25].map((number) => bank.filter((p) => p.examNumber === number).length), [24, 21, 15, 19, 15, 16]);
  assert.equal(new Set(bank.flatMap((group) => group.analogs.map((analog) => analog.id))).size, 330);
  assert.equal(bank[0].prototypeId, '20.1');
  for (const group of bank) {
    assert.equal(group.analogs.length, 3, group.prototypeId);
    for (const analog of group.analogs) {
      assert.notEqual(compare(analog.validationMode, analog.answer, analog.answer), false, analog.id);
      if (group.examNumber === 22) assert.equal(analog.graphSpec?.kind, group.prototypeId.split('.')[1] * 1);
      if (group.examNumber === 24) assert.equal(analog.validationMode, 'self_check_proof');
    }
  }
  for (const file of ['algebra.html', 'geometry.html']) {
    const page = fs.readFileSync(path.join(root, `study/math/part-two/${file}`), 'utf8');
    assert.match(page, /data-data="\.\/data\/author-bank\.json"/);
    assert.doesNotMatch(page, /data-(?:algebra-20-22|geometry-23-25)\.json/);
  }
});

test('во второй части дроби, корни, системы и кусочные функции оформлены математически', () => {
  const bank = require(path.join(root, 'content/part-two-author-bank.cjs'));
  const byId = (id) => bank.find((group) => group.prototypeId === id).analogs[0].prompt;
  assert.match(typography.prompt(byId('20.1')), /\\frac\{2a - 5b \+ 3\}\{4a \+ b - 2\}/);
  assert.match(typography.prompt(byId('20.8')), /\\sqrt\{2 - x\}/);
  assert.match(typography.prompt(byId('20.10')), /\\begin\{cases\}.*\\\\.*\\end\{cases\}/);
  assert.match(typography.prompt(byId('22.1')), /y=\\begin\{cases\}/);
  for (const task of bank.flatMap((group) => group.analogs)) {
    for (const value of [typography.prompt(task.prompt), typography.inline(task.solution), typography.inline(task.answer)]) {
      const withoutUnits = value.replace(/(?:км|м|л|деталей)\/(?:ч|с|мин)/gu, '');
      assert.doesNotMatch(withoutUnits, /[√/]/u, task.id);
    }
  }
});

test('лишние подписи удалены, выбранный прототип виден в обеих частях', () => {
  for (const file of ['algebra.html', 'geometry.html']) {
    const page = fs.readFileSync(path.join(root, `study/math/part-two/${file}`), 'utf8');
    assert.doesNotMatch(page, /Выберите прототип и решите три авторских аналога/);
    assert.match(page, /math-typography\.js/);
    assert.match(page, /mathjax-3\.2\.2/);
  }
  const script = fs.readFileSync(path.join(root, 'study/math/part-two/part-two.js'), 'utf8');
  assert.doesNotMatch(script, /'3 аналога'/);
  assert.doesNotMatch(script, /section\.append\(el\('h2'/);
  const css = fs.readFileSync(path.join(root, 'study/math/part-one/part-one.css'), 'utf8');
  assert.match(css, /prototype-progress\.is-current[^}]+box-shadow:inset 0 0 0 2px/u);
  assert.match(css, /practical-prototype-card\.is-active/u);
});

test('номера заданий второй части не сливаются с процентами прогресса', () => {
  const index = fs.readFileSync(path.join(root, 'study/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'study/study.css'), 'utf8');
  for (let number = 20; number <= 25; number += 1) {
    assert.match(index, new RegExp(`class="bar bar--part-two bar--task${number}"[^>]*><span>${number}<small data-part-two-percent>`));
  }
  assert.match(css, /\.bar--part-two>span\{[^}]*flex-direction:column/);
  assert.match(index, /data-first-correct-percent/);
  assert.match(index, /data-second-correct-percent/);
  assert.match(index, /formatPercent\(second\.correct, second\.total\)/);
});

test('сценарий публикации считает типографику новым файлом', () => {
  const script = fs.readFileSync(path.join(root, 'scripts/deploy-part-two.sh'), 'utf8');
  const files = script.match(/^files=\(([^]*?)^\)/mu)?.[1] || '';
  const newFiles = script.match(/^new_files=\(([^]*?)^\)/mu)?.[1] || '';
  const deployPath = 'study/math/part-two/math-typography.js';
  assert.equal(files.split('\n').filter((line) => line.trim() === deployPath).length, 1);
  assert.equal(newFiles.split('\n').filter((line) => line.trim() === deployPath).length, 1);
});
