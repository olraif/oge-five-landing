const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const base = 'http://127.0.0.1:8765';
  const output = path.join(__dirname, '..', 'output', 'playwright');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const cases = [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
  ];
  const report = [];

  for (const item of cases) {
    const page = await browser.newPage({ viewport: item });
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      for (let y = 0; y < document.body.scrollHeight; y += Math.floor(innerHeight * 0.7)) {
        scrollTo(0, y);
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      scrollTo(0, 0);
      document.querySelectorAll('[data-reveal]').forEach(item => item.classList.add('is-visible'));
    });
    await page.waitForTimeout(700);
    const result = await page.evaluate(() => ({
      title: document.title,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      phoneLinks: document.querySelectorAll('a[href="tel:+79603837857"]').length,
      imageLoaded: document.querySelector('.portrait-shape img')?.naturalWidth > 0,
      heroVisible: document.querySelector('h1')?.getBoundingClientRect().height > 0,
      mobileCallDisplay: getComputedStyle(document.querySelector('.mobile-call')).display,
    }));
    await page.screenshot({ path: path.join(output, `${item.name}.png`), fullPage: true });
    report.push({ viewport: item.name, ...result, consoleErrors: errors });
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
  const failed = report.some(r => r.overflow || !r.imageLoaded || !r.heroVisible || r.phoneLinks < 3 || r.consoleErrors.length);
  if (failed) process.exit(1);
})();
