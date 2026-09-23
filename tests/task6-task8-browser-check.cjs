const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const url of ['**/supabase.js', '**/supabase-config.js']) {
    await page.route(url, (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
  }
  await page.route('**/auth-session.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: 'window.ogeHasCourseAccess=async()=>({data:true,user:null});',
  }));

  await page.goto('http://127.0.0.1:8765/study/math/part-one/index.html#trainer');
  await page.waitForSelector('[data-question] .question-copy');
  for (let index = 1; index <= 10; index += 1) {
    await page.locator(`[data-prototype-cell="6.${index}"]`).click();
    const rows = page.locator('#fractionQuiz label[data-question]:visible');
    const count = await rows.count();
    const prompts = await rows.locator('.question-copy small').allTextContents();
    if (!count || prompts.length !== count || prompts.some((text) => !text.trim())) throw new Error(`6.${index}: missing card prompt`);
    if (index === 9 && prompts.some((text) => !text.includes('В ответе укажите числитель'))) throw new Error('6.9: unclear numerator prompt');
    if (index === 9) {
      const expressions = await rows.locator('.question-expression').allTextContents();
      if (expressions.some((text) => text.includes('знаменатель'))) throw new Error('6.9: denominator is duplicated in the expression');
    }
    if (index === 10 && prompts.some((text) => text !== 'Вычислите значение выражения.')) throw new Error('6.10: operation-specific prompt leaked');
  }
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('[data-task6-reset]').click();

  await page.goto('http://127.0.0.1:8765/study/math/part-one/task8.html?prototype=8.1#trainer');
  await page.waitForSelector('[data-task8-quiz] input');
  for (let index = 1; index <= 35; index += 1) {
    await page.locator(`[data-task8-prototype="8.${index}"]`).click();
    if (await page.locator('[data-task8-quiz] label').count() < 4) throw new Error(`8.${index}: missing rows`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    if (overflow) throw new Error(`8.${index}: horizontal page overflow`);
  }
  await page.evaluate(() => {
    const prototype = window.OgeTask8DataPrototypes.find((item) => item.id === '8.35');
    prototype.items.forEach((item) => { document.querySelector(`[name="${item.id}"]`).value = item.answer; });
  });
  await page.locator('[data-task8-submit]').click();
  if (await page.locator('[data-task8-score]').textContent() !== '4') throw new Error('task 8 answers do not validate');
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('[data-task8-reset]').click();
  if (await page.locator('[data-task8-score]').textContent() !== '0') throw new Error('task 8 reset failed');

  await page.goto('http://127.0.0.1:8765/study/math/part-one/task9.html?prototype=9.1#trainer');
  await page.waitForSelector('[data-task9-quiz] input');
  for (let index = 1; index <= 14; index += 1) {
    await page.locator(`[data-task9-prototype="9.${index}"]`).click();
    if (await page.locator('[data-task9-quiz] label').count() < 5) throw new Error(`9.${index}: missing rows`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    if (overflow) throw new Error(`9.${index}: horizontal page overflow`);
  }
  await page.evaluate(() => {
    const prototype = window.OgeTask9DataPrototypes.find((item) => item.id === '9.14');
    prototype.items.forEach((item) => { document.querySelector(`[name="${item.id}"]`).value = item.answer; });
  });
  await page.locator('[data-task9-submit]').click();
  if (await page.locator('[data-task9-score]').textContent() !== '6') throw new Error('task 9 answers do not validate');
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('[data-task9-reset]').click();
  if (await page.locator('[data-task9-score]').textContent() !== '0') throw new Error('task 9 reset failed');

  await page.goto('http://127.0.0.1:8765/study/math/part-one/task10.html?prototype=10.1#trainer');
  await page.waitForSelector('[data-task10-quiz] input');
  for (let index = 1; index <= 18; index += 1) {
    await page.locator(`[data-task10-prototype="10.${index}"]`).click();
    if (await page.locator('[data-task10-quiz] label').count() < 6) throw new Error(`10.${index}: missing rows`);
    await page.waitForFunction(() => [...document.querySelectorAll('[data-task10-quiz] img')].every((image) => image.complete));
    const brokenImages = await page.locator('[data-task10-quiz] img').evaluateAll((images) => images.filter((image) => !image.complete || image.naturalWidth === 0).length);
    if (brokenImages) throw new Error(`10.${index}: drawing failed to load`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    if (overflow) throw new Error(`10.${index}: horizontal page overflow`);
  }
  await page.evaluate(() => {
    const prototype = window.OgeTask10DataPrototypes.find((item) => item.id === '10.18');
    prototype.items.forEach((item) => { document.querySelector(`[name="${item.id}"]`).value = item.answer; });
  });
  await page.locator('[data-task10-submit]').click();
  if (await page.locator('[data-task10-score]').textContent() !== '10') throw new Error('task 10 answers do not validate');
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('[data-task10-reset]').click();
  if (await page.locator('[data-task10-score]').textContent() !== '0') throw new Error('task 10 reset failed');

  await page.goto('http://127.0.0.1:8765/study/math/part-one/task11.html?prototype=11.1#trainer');
  await page.waitForSelector('[data-task11-quiz] input');
  for (let index = 1; index <= 10; index += 1) {
    await page.locator(`[data-task11-prototype="11.${index}"]`).click();
    const rows = page.locator('[data-task11-quiz] label');
    const rowCount = await rows.count();
    if (rowCount < 2) throw new Error(`11.${index}: missing rows`);
    await page.waitForFunction(() => [...document.querySelectorAll('[data-task11-quiz] img')].every((image) => image.complete));
    const imageCount = await page.locator('[data-task11-quiz] img').count();
    if (imageCount !== rowCount * 3) throw new Error(`11.${index}: expected three drawings per row`);
    const brokenImages = await page.locator('[data-task11-quiz] img').evaluateAll((images) => images.filter((image) => !image.complete || image.naturalWidth === 0).length);
    if (brokenImages) throw new Error(`11.${index}: drawing failed to load`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    if (overflow) throw new Error(`11.${index}: horizontal page overflow`);
  }
  await page.evaluate(() => {
    const prototype = window.OgeTask11DataPrototypes.find((item) => item.id === '11.10');
    prototype.items.forEach((item) => { document.querySelector(`[name="${item.id}"]`).value = item.answer; });
  });
  await page.locator('[data-task11-submit]').click();
  if (await page.locator('[data-task11-score]').textContent() !== '4') throw new Error('task 11 answers do not validate');
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('[data-task11-reset]').click();
  if (await page.locator('[data-task11-score]').textContent() !== '0') throw new Error('task 11 reset failed');

  await page.goto('http://127.0.0.1:8765/study/math/part-one/task12.html?prototype=12.1#trainer');
  await page.waitForSelector('[data-task12-quiz] input');
  for (let index = 1; index <= 11; index += 1) {
    await page.locator(`[data-task12-prototype="12.${index}"]`).click();
    const rows = page.locator('[data-task12-quiz] label');
    if (await rows.count() < 4) throw new Error(`12.${index}: missing rows`);
    await page.waitForFunction(() => !document.querySelector('[data-task12-quiz]')?.textContent?.includes('$'));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    if (overflow) throw new Error(`12.${index}: horizontal page overflow`);
  }
  await page.evaluate(() => {
    const prototype = window.OgeTask12DataPrototypes.find((item) => item.id === '12.11');
    prototype.items.forEach((item) => { document.querySelector(`[name="${item.id}"]`).value = item.answer; });
  });
  await page.locator('[data-task12-submit]').click();
  if (await page.locator('[data-task12-score]').textContent() !== '7') throw new Error('task 12 answers do not validate');
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('[data-task12-reset]').click();
  if (await page.locator('[data-task12-score]').textContent() !== '0') throw new Error('task 12 reset failed');

  await page.goto('http://127.0.0.1:8765/study/math/part-one/task13.html?prototype=13.1#trainer');
  await page.waitForSelector('[data-task13-quiz] input');
  for (let index = 1; index <= 10; index += 1) {
    await page.locator(`[data-task13-prototype="13.${index}"]`).click();
    const rows = page.locator('[data-task13-quiz] label');
    if (await rows.count() < 10) throw new Error(`13.${index}: missing rows`);
    await page.waitForFunction(() => !document.querySelector('[data-task13-quiz]')?.textContent?.includes('$'));
    await page.waitForFunction(() => [...document.querySelectorAll('[data-task13-quiz] img')].every((image) => image.complete));
    const brokenImages = await page.locator('[data-task13-quiz] img').evaluateAll((images) => images.filter((image) => !image.complete || image.naturalWidth === 0).length);
    if (brokenImages) throw new Error(`13.${index}: ${brokenImages} broken images`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    if (overflow) throw new Error(`13.${index}: horizontal page overflow`);
  }
  await page.setViewportSize({ width: 730, height: 900 });
  for (const id of ['13.3', '13.9', '13.10']) {
    await page.locator(`[data-task13-prototype="${id}"]`).click();
    await page.waitForFunction(() => !document.querySelector('[data-task13-quiz]')?.textContent?.includes('$'));
    const metrics = await page.locator('[data-task13-quiz] label').first().evaluate((row) => {
      const content = row.querySelector(':scope > span').getBoundingClientRect();
      const input = row.querySelector(':scope > input').getBoundingClientRect();
      const cellHeights = [...row.querySelectorAll('.latex-table th, .latex-table td')]
        .map((cell) => cell.getBoundingClientRect().height);
      const optionWhiteSpaces = [...row.querySelectorAll('.latex-table th > span, .latex-table td > span')]
        .map((option) => getComputedStyle(option).whiteSpace);
      return { contentBottom: content.bottom, inputTop: input.top, cellHeights, optionWhiteSpaces };
    });
    if (metrics.inputTop < metrics.contentBottom - 2) throw new Error(`${id}: answer field squeezes the task body at tablet width`);
    if (metrics.cellHeights.some((height) => height > 30)) throw new Error(`${id}: answer choices wrap into broken lines at tablet width`);
    if (metrics.optionWhiteSpaces.some((value) => value !== 'nowrap')) throw new Error(`${id}: formula punctuation can detach from its option`);
  }
  await page.evaluate(() => {
    const prototype = window.OgeTask13DataPrototypes.find((item) => item.id === '13.10');
    prototype.items.forEach((item) => { document.querySelector(`[name="${item.id}"]`).value = item.answer; });
  });
  await page.locator('[data-task13-submit]').click();
  if (await page.locator('[data-task13-score]').textContent() !== '20') throw new Error('task 13 answers do not validate');
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('[data-task13-reset]').click();
  if (await page.locator('[data-task13-score]').textContent() !== '0') throw new Error('task 13 reset failed');
  if (errors.length) throw new Error(`browser errors: ${errors.join('; ')}`);
  await browser.close();
  console.log('browser: task 6 prompts and tasks 8-13 render, validate, and reset');
})().catch((error) => { console.error(error); process.exit(1); });
