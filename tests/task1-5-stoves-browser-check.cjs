const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const report = [];
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    for (const url of ['**/supabase.js', '**/supabase-config.js']) {
      await page.route(url, (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
    }
    await page.route('**/auth-session.js', (route) => route.fulfill({
      contentType: 'application/javascript',
      body: 'window.ogeHasCourseAccess=async()=>({data:true,user:null});',
    }));
    await page.goto('http://127.0.0.1:8765/study/math/part-one/task1-5.html#trainer');
    await page.locator('[data-practical-type="stoves"]').click();
    await page.waitForSelector('.route-analog-tabs .route-tab');
    const tabs = page.locator('.route-analog-tabs .route-tab');
    if (await tabs.count() !== 2) throw new Error('The stove bank does not render both sets');

    for (let index = 0; index < 2; index += 1) {
      await tabs.nth(index).click();
      await page.waitForFunction((expected) => document.querySelector('#route-set-title')?.textContent.includes(expected), `5.1.${index + 1}`);
      await page.waitForFunction(() => [...document.querySelectorAll('.route-set img')].every((image) => image.complete));
      const state = await page.evaluate(() => ({
        inputs: document.querySelectorAll('.route-question input').length,
        emptyPrompts: [...document.querySelectorAll('.route-question-text')].filter((item) => !item.textContent.trim()).length,
        brokenImages: [...document.querySelectorAll('.route-set img')].filter((image) => image.naturalWidth === 0).length,
        images: document.querySelectorAll('.route-set img').length,
        tables: document.querySelectorAll('.route-set .latex-table').length,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      }));
      if (state.inputs !== 5 || state.emptyPrompts || state.brokenImages || state.images < 2 || state.tables < 3 || state.overflow) {
        throw new Error(`Invalid stove layout 5.1.${index + 1}: ${JSON.stringify(state)}`);
      }
      await page.evaluate((analogIndex) => {
        const analog = window.OgeTaskOneToFiveStoves[0].analogs[analogIndex];
        document.querySelectorAll('.route-question[data-question-number]').forEach((row) => {
          row.querySelector('input').value = analog.answers[row.dataset.questionNumber];
        });
      }, index);
      await page.locator('.route-check-button').click();
      if ((await page.locator('.route-set-result strong').textContent()) !== '5/5') {
        throw new Error(`Correct answers were rejected for stove set ${index + 1}`);
      }
    }
    report.push({ viewport, sets: 2, images: 'loaded', answers: '5/5', errors });
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
  if (report.some((item) => item.errors.length)) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
