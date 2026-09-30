const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('dialog', (dialog) => dialog.accept());
  for (const url of ['**/supabase.js', '**/supabase-config.js']) {
    await page.route(url, (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
  }
  await page.route('**/auth-session.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `
      (() => {
        const id = 'task1-5-reset-student';
        const read = () => JSON.parse(localStorage.getItem('fake-cloud-metadata') || '{}');
        const user = () => ({ id, created_at: '2026-09-01T00:00:00.000Z', user_metadata: read() });
        window.ogeSupabase = { auth: {
          getSession: async () => ({ data: { session: { user: user() } } }),
          getUser: async () => ({ data: { user: user() } }),
          updateUser: async ({ data }) => {
            localStorage.setItem('fake-cloud-metadata', JSON.stringify({ ...read(), ...data }));
            return { data: { user: user() }, error: null };
          },
        } };
        window.ogeHasCourseAccess = async () => ({ data: true, user: user() });
        window.ogeCurrentUser = user();
        setTimeout(() => window.dispatchEvent(new CustomEvent('oge-auth-ready', { detail: { user: user() } })), 0);
      })();
    `,
  }));

  await page.goto('http://127.0.0.1:8765/study/math/part-one/task1-5.html#trainer');
  await page.waitForSelector('[data-task1-5-reset]:not([disabled])');
  await page.evaluate(() => {
    const analog = window.OgeTaskOneToFiveModel.ROUTE_PROTOTYPES[0].analogs[0];
    document.querySelectorAll('.route-question[data-question-number]').forEach((row) => {
      row.querySelector('input').value = analog.answers[row.dataset.questionNumber];
    });
  });
  await page.locator('.route-check-button').click();
  await page.waitForFunction(() => document.querySelector('.route-set-result strong')?.textContent === '5/5');

  await page.locator('[data-task1-5-reset]').click();
  await page.waitForFunction(() => document.querySelector('.route-set-result strong')?.textContent === '0/5');
  assert.deepEqual(await page.locator('.route-question input').evaluateAll((inputs) => inputs.map((input) => input.value)), ['', '', '', '', '']);
  const metadata = await page.evaluate(() => JSON.parse(localStorage.getItem('fake-cloud-metadata') || '{}'));
  assert.ok(metadata.oge_reset_math_task1to5_routes_1_1_1, 'reset token must be synced to account metadata');

  await page.reload();
  await page.waitForSelector('[data-task1-5-reset]:not([disabled])');
  assert.equal(await page.locator('.route-set-result strong').textContent(), '0/5');
  assert.deepEqual(await page.locator('.route-question input').evaluateAll((inputs) => inputs.map((input) => input.value)), ['', '', '', '', '']);

  await page.evaluate(() => {
    const attempts = Object.fromEntries(Array.from({ length: 72 }, (_, index) => [
      `set-${index + 1}`,
      {
        ownerId: 'task1-5-reset-student',
        savedAt: '2026-09-30T12:00:00.000Z',
        taskProgress: Object.fromEntries([1, 2, 3, 4, 5].map((number) => [number, { correct: 1, answered: 1, total: 1 }])),
      },
    ]));
    localStorage.setItem('fake-cloud-metadata', JSON.stringify({ trainer_progress: { math: { task1to5: attempts } } }));
  });
  await page.goto('http://127.0.0.1:8765/study/index.html#progress');
  await page.waitForFunction(() => [...document.querySelectorAll('[data-practical-percent]')].every((item) => item.textContent === '100%'));
  assert.deepEqual(await page.locator('[data-practical-percent]').allTextContents(), ['100%', '100%', '100%', '100%', '100%']);
  assert.equal(await page.locator('.bar--task12').getAttribute('title'), 'Задание 12: 0%');
  assert.equal(await page.locator('link[rel="icon"][href="/favicon.svg"]').count(), 1);
  assert.equal(await page.evaluate(async () => (await fetch('/favicon.svg')).status), 200);
  await browser.close();
  console.log('task1-5 reset and dashboard browser checks passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
