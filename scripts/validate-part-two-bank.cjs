#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'content/part-two-prototype-catalog.json'), 'utf8'));
const bank = require(path.join(root, 'content/part-two-author-bank.cjs'));
const expected = new Map(catalog.map((entry) => [entry.prototypeId, entry]));
const seenPrototypes = new Set();
const seenTasks = new Set();
const problems = [];

if (catalog.length !== 110 || expected.size !== 110) problems.push('Каталог PDF должен содержать 110 уникальных прототипов.');

for (const group of bank) {
  const source = expected.get(group.prototypeId);
  if (!source) problems.push(`Неизвестный прототип ${group.prototypeId}.`);
  if (seenPrototypes.has(group.prototypeId)) problems.push(`Дублирован прототип ${group.prototypeId}.`);
  seenPrototypes.add(group.prototypeId);
  if (source && (source.examNumber !== group.examNumber || source.sourcePage !== group.sourcePage)) {
    problems.push(`Неверная привязка к PDF: ${group.prototypeId}.`);
  }
  if (!Array.isArray(group.analogs) || group.analogs.length !== 3) {
    problems.push(`У прототипа ${group.prototypeId} должно быть ровно три аналога.`);
    continue;
  }
  for (const analog of group.analogs) {
    if (!analog.id || !analog.id.startsWith(`${group.prototypeId}-`) || seenTasks.has(analog.id)) {
      problems.push(`Неверный или повторный идентификатор аналога ${analog.id}.`);
    }
    seenTasks.add(analog.id);
    for (const key of ['prompt', 'answer', 'solution', 'validationMode']) {
      if (typeof analog[key] !== 'string' || !analog[key].trim()) {
        problems.push(`Пустое поле ${key} у ${analog.id}.`);
      }
    }
  }
}

if (process.argv.includes('--require-complete') && seenPrototypes.size !== expected.size) {
  problems.push(`Банк неполный: ${seenPrototypes.size} из ${expected.size} прототипов.`);
}

console.log(`Авторский банк: ${seenPrototypes.size}/${expected.size} прототипов, ${seenTasks.size}/330 аналогов.`);
if (problems.length) {
  for (const problem of problems) console.error(`ОШИБКА: ${problem}`);
  process.exitCode = 1;
}
