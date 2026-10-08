const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:8765';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  for (const pathname of ['/', '/study/', '/study/login.html', '/study/legal/privacy.html']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const trackerRequests = [];
    page.on('request', (request) => {
      if (new URL(request.url()).hostname === 'top-fwz1.mail.ru') trackerRequests.push(request.url());
    });

    await page.goto(`${baseUrl}${pathname}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const trackerPresent = await page.evaluate(() => Boolean(
      document.querySelector('#tmr-code, script[src*="top-fwz1.mail.ru"], img[src*="top-fwz1.mail.ru"]')
      || window._tmr,
    ));
    if (trackerPresent || trackerRequests.length) {
      throw new Error(`${pathname}: Top.Mail.Ru is still present: ${trackerRequests.join(', ')}`);
    }

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
  console.log('Top.Mail.Ru is absent; the purchase button still opens the offer dialog.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
