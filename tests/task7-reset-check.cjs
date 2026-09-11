const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.setDefaultTimeout(5000);

  await page.route('**/supabase.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: '',
  }));
  await page.route('**/supabase-config.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `
      (() => {
        let user = {
          id: 'reset-test-user',
          created_at: '2026-01-01T00:00:00.000Z',
          user_metadata: { trainer_progress: {
            math: {
              task6: { '6.1': { prototype: '6.1', score: 9 } },
              task7: { '7.2': { prototype: '7.2', savedAt: '2026-09-01T00:00:00.000Z', score: 4 } },
            },
          } },
        };
        window.ogeSupabase = { auth: {
          getSession: async () => {
            await new Promise((resolve) => setTimeout(resolve, 250));
            return { data: { session: { user } } };
          },
          getUser: async () => ({ data: { user } }),
          updateUser: async ({ data }) => {
            if (data.trainer_progress && window.__failNextProgressUpdate) {
              window.__failNextProgressUpdate = false;
              return { data: { user }, error: new Error('offline test') };
            }
            user = { ...user, user_metadata: { ...user.user_metadata, ...data } };
            window.__resetTestUser = user;
            return { data: { user }, error: null };
          },
        } };
        window.__resetTestUser = user;
      })();
    `,
  }));
  await page.route('**/auth-session.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: '',
  }));

  await page.goto('http://127.0.0.1:8765/study/math/part-one/task7.html?prototype=7.1#trainer');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('[data-task7-quiz] input');
  const reset = page.locator('[data-task7-reset]');
  if (!(await reset.isDisabled())) throw new Error('reset must stay disabled until the account is loaded');
  await page.waitForFunction(() => !document.querySelector('[data-task7-reset]')?.disabled);

  await page.evaluate(() => {
    const proto = window.OgeTask7DataPrototypes.find((item) => item.id === '7.1');
    proto.items.forEach((item) => {
      document.querySelector(`[data-task7-quiz] input[name="${item.id}"]`).value = item.answer;
    });
  });
  await page.locator('[data-task7-submit]').click();
  await page.waitForFunction(() => window.__resetTestUser?.user_metadata?.trainer_progress?.math?.task7?.['7.1']);

  let cancelledConfirmation = '';
  page.once('dialog', (dialog) => {
    cancelledConfirmation = dialog.message();
    dialog.dismiss();
  });
  await reset.click();
  await page.waitForTimeout(100);
  if (cancelledConfirmation !== 'Сбросить ответы типа 7.1?') throw new Error('reset cancellation must show the selected type');
  if ((await page.locator('[data-task7-score]').innerText()) !== '5') throw new Error('cancelling reset must preserve the current result');

  let confirmation = '';
  page.once('dialog', (dialog) => {
    confirmation = dialog.message();
    dialog.accept();
  });
  await reset.click();
  await page.waitForFunction(() => window.__resetTestUser?.user_metadata?.oge_reset_math_task7_7_1);

  const result = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-task7-quiz] label[data-item-id]')];
    const storageKey = 'ogeTrainer:v3:math:task7:account:reset-test-user:7.1';
    const resetKey = 'ogeTrainer:v3:math:task7Reset:account:reset-test-user:7.1';
    return {
      inputs: rows.map((row) => row.querySelector('input')?.value),
      classes: rows.map((row) => row.className),
      score: document.querySelector('[data-task7-score]')?.textContent,
      navScore: document.querySelector('[data-task7-prototype="7.1"] span')?.textContent,
      localAttempt: localStorage.getItem(storageKey),
      localReset: localStorage.getItem(resetKey),
      resetMarker: window.__resetTestUser?.user_metadata?.oge_reset_math_task7_7_1,
      preservedTask7: window.__resetTestUser?.user_metadata?.trainer_progress?.math?.task7?.['7.2'],
      preservedTask6: window.__resetTestUser?.user_metadata?.trainer_progress?.math?.task6?.['6.1'],
    };
  });

  if (result.inputs.some(Boolean)) throw new Error('reset must clear every visible answer');
  if (confirmation !== 'Сбросить ответы типа 7.1?') throw new Error(`reset must request confirmation, got ${confirmation}`);
  if (result.classes.some((value) => !value.includes('question-empty'))) throw new Error('reset must return every row to the empty state');
  if (result.score !== '0') throw new Error(`reset score must be 0, got ${result.score}`);
  if (result.navScore !== '0/5') throw new Error(`reset nav score must be 0/5, got ${result.navScore}`);
  if (result.localAttempt !== null) throw new Error('reset must remove the local attempt');
  if (!result.localReset || !result.resetMarker) throw new Error('reset must persist an independent reset marker');
  const localReset = JSON.parse(result.localReset);
  if (localReset.token !== result.resetMarker || localReset.pending) throw new Error('local and account reset tokens must be synchronized');
  if (result.preservedTask7?.score !== 4) throw new Error('reset must preserve another task 7 type');
  if (result.preservedTask6?.score !== 9) throw new Error('reset must preserve another task');

  await page.evaluate(() => {
    window.__resetTestUser.user_metadata.trainer_progress.math.task7['7.1'] = {
      prototype: '7.1',
      savedAt: '2099-01-01T00:00:00.000Z',
      resetToken: 'previous-generation-from-a-fast-clock',
      score: 5,
      correctIds: ['7.1.1', '7.1.2', '7.1.3', '7.1.4', '7.1.5'],
      answeredIds: ['7.1.1', '7.1.2', '7.1.3', '7.1.4', '7.1.5'],
      answers: { '7.1.1': '1' },
    };
    window.dispatchEvent(new Event('oge-auth-ready'));
  });
  await page.waitForTimeout(400);
  if ((await page.locator('[data-task7-score]').innerText()) !== '0') throw new Error('a delayed old save must not resurrect reset progress');

  await page.evaluate(() => {
    const proto = window.OgeTask7DataPrototypes.find((item) => item.id === '7.1');
    proto.items.forEach((item) => {
      document.querySelector(`[data-task7-quiz] input[name="${item.id}"]`).value = item.answer;
    });
    window.__failNextProgressUpdate = true;
  });
  await page.locator('[data-task7-submit]').click();
  await page.waitForTimeout(100);
  if ((await page.locator('[data-task7-prototype="7.1"] span').innerText()) !== '5/5') throw new Error('a new local solution after reset must update progress immediately');

  await page.evaluate(() => window.dispatchEvent(new Event('oge-auth-ready')));
  await page.waitForTimeout(400);
  if ((await page.locator('[data-task7-score]').innerText()) !== '5') throw new Error('cloud reload must preserve a newer local solution after failed sync');
  if ((await page.locator('[data-task7-prototype="7.1"] span').innerText()) !== '5/5') throw new Error('new local progress must survive cloud reload');

  await browser.close();
  console.log('task7 reset: selected type cleared locally, in the account, and in the interface');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
