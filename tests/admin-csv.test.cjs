const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'study', 'admin.html'), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];

test('admin page has a valid script and CSV button', () => {
  assert.ok(script);
  assert.doesNotThrow(() => new Function(script));
  assert.match(html, /id="download-students"[^>]*disabled/);
  assert.match(script, /account\.account_role !== 'admin'/);
  assert.match(script, /client\.rpc\('admin_list_accounts'\)\.range\(/);
  assert.match(script, /client\.rpc\('admin_list_access'\)\.range\(/);
  assert.match(script, /accessByUser\.get\(account\.user_id\)/);
  assert.match(script, /'Промокод активирован', 'Доступ до', 'Статус'/);
  assert.match(script, /access\.is_active \? 'Действует' : 'Истёк'/);
});

test('CSV cells quote separators and neutralize spreadsheet formulas', () => {
  const body = script.match(/const csvCell = \(value\) => \{([\s\S]*?)\n      \};/)?.[1];
  assert.ok(body);
  const csvCell = new Function('value', body);
  assert.equal(csvCell('Олеся; "Тест"'), '"Олеся; ""Тест"""');
  assert.equal(csvCell('=1+1'), '"\'=1+1"');
  assert.equal(csvCell(' student@example.ru'), '" student@example.ru"');
});
