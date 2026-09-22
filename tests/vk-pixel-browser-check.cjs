const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:8765';
const interceptPixel = process.env.INTERCEPT_PIXEL !== '0';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  for (const pathname of ['/', '/study/']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    let pixelRequests = 0;
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('request', (request) => {
      if (request.url() === 'https://top-fwz1.mail.ru/js/code.js') pixelRequests += 1;
    });
    if (interceptPixel) {
      await page.route('https://top-fwz1.mail.ru/js/code.js', (route) => route.fulfill({
        contentType: 'application/javascript',
        body: 'window.__vkPixelScriptRuns=(window.__vkPixelScriptRuns||0)+1;',
      }));
    }

    await page.goto(`${baseUrl}${pathname}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#tmr-code', { state: 'attached' });
    const state = await page.evaluate(() => {
      const comments = [];
      const walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT);
      while (walker.nextNode()) comments.push(walker.currentNode.nodeValue.trim());
      return {
        scriptCount: document.querySelectorAll('#tmr-code').length,
        scriptSource: document.querySelector('#tmr-code')?.src,
        pixelEvents: (window._tmr || []).filter((event) => event?.id === '3796192' && event?.type === 'pageView').length,
        pixelStartMarkers: comments.filter((comment) => comment === 'Top.Mail.Ru counter').length,
        pixelEndMarkers: comments.filter((comment) => comment === '/Top.Mail.Ru counter').length,
        scriptRuns: window.__vkPixelScriptRuns || 0,
      };
    });

    if (state.scriptCount !== 1) throw new Error(`${pathname}: expected one pixel script, got ${state.scriptCount}`);
    if (state.scriptSource !== 'https://top-fwz1.mail.ru/js/code.js') throw new Error(`${pathname}: wrong pixel source`);
    if (state.pixelEvents !== 1) throw new Error(`${pathname}: expected one pageView, got ${state.pixelEvents}`);
    if (state.pixelStartMarkers !== 1 || state.pixelEndMarkers !== 1) throw new Error(`${pathname}: pixel block duplicated`);
    if (pixelRequests !== 1) throw new Error(`${pathname}: expected one pixel request, got ${pixelRequests}`);
    if (interceptPixel && state.scriptRuns !== 1) throw new Error(`${pathname}: pixel script did not execute once`);
    if (errors.length) throw new Error(`${pathname}: browser errors: ${errors.join('; ')}`);

    if (pathname === '/study/') {
      if (await page.locator('#buy-part-one').count() !== 1) throw new Error('/study/: buy-part-one is not unique');
      await page.evaluate(() => { location.hash = 'pricing'; });
      await page.locator('#buy-part-one').waitFor({ state: 'visible' });
      await page.locator('#buy-part-one').click();
      if (!(await page.locator('[data-purchase-dialog]').evaluate((dialog) => dialog.open))) {
        throw new Error('/study/: purchase dialog did not open');
      }
    }
    await context.close();
  }

  await browser.close();
  console.log('vk pixel: one load and one pageView on / and /study/; purchase button still opens the offer dialog');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
