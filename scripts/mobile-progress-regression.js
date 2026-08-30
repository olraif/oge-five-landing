async (page) => {
  await page.route('**/auth-session.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: 'window.ogeHasCourseAccess = async () => ({ data: true, user: null });'
  }));
  await page.setViewportSize({ width: 390, height: 844 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.goto(`http://127.0.0.1:8765/study/index.html?mobile-progress=${Date.now()}#progress`);
  await page.waitForSelector('.progress-scale');
  await page.evaluate(() => {
    document.querySelectorAll('.studio-view').forEach(view => view.classList.remove('is-active'));
    document.querySelector('#progress').classList.add('is-active');
  });

  const checks = [];
  const expect = (condition, message, details) => checks.push({ pass: Boolean(condition), message, details });
  const metric = async selector => page.locator(selector).first().evaluate(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      scrollLeft: element.scrollLeft,
      overflowX: style.overflowX
    };
  });

  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    'progress page has no horizontal page overflow',
    await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }))
  );

  const scale = await metric('.progress-scale');
  expect(scale.right <= 390, 'progress chart fits inside the mobile viewport', scale);
  expect(scale.scrollWidth > scale.clientWidth, 'progress chart scrolls horizontally to tasks 20-25', scale);
  const bars = await metric('.progress-bars');
  const firstBar = await metric('.progress-bars .bar:first-child');
  expect(firstBar.top - bars.top <= 20, 'pink task columns reach the 100% line', { bars, firstBar });
  await page.locator('.progress-scale').evaluate(element => { element.scrollLeft = element.scrollWidth; });
  const lastBar = await metric('.progress-bars .bar:last-child');
  expect(lastBar.left >= 0 && lastBar.right <= 390, 'task 25 becomes visible after horizontal scroll', lastBar);

  const tableScroll = await metric('.fipi-bank-scroll');
  expect(tableScroll.right <= 390, 'themes table fits inside the mobile viewport', tableScroll);
  expect(tableScroll.scrollWidth > tableScroll.clientWidth, 'themes table has horizontal scrolling', tableScroll);

  const failures = checks.filter(check => !check.pass);
  if (failures.length) {
    throw new Error(`Mobile progress regression failed:\n${failures.map(item => `- ${item.message}: ${JSON.stringify(item.details || {})}`).join('\n')}`);
  }
  return checks;
}
