#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const bank = require(path.join(root, 'content/part-two-author-bank.cjs'));
const target = path.join(root, 'study/math/part-two/data/author-bank.json');
const allowIncomplete = process.argv.includes('--allow-incomplete');

if (bank.length !== 110 && !allowIncomplete) {
  console.error(`Сборка для публикации остановлена: готово ${bank.length}/110 прототипов.`);
  process.exit(1);
}
if (bank.some((group) => !Array.isArray(group.analogs) || group.analogs.length !== 3)) {
  console.error('Сборка остановлена: у каждого прототипа должно быть три аналога.');
  process.exit(1);
}

fs.writeFileSync(target, `${JSON.stringify(bank, null, 2)}\n`, 'utf8');
console.log(`Собрано ${bank.length} прототипов и ${bank.length * 3} аналогов: ${target}`);
