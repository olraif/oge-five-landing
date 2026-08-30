async (page) => {
  await page.route('**/auth-session.js', route => route.fulfill({ contentType: 'application/javascript', body: 'window.ogeHasCourseAccess = async () => ({ data: true, user: null });' }));
  await page.setViewportSize({ width: 360, height: 800 });
  const checks = [];
  const expect = (condition, message, details) => checks.push({ pass: Boolean(condition), message, details });
  const metric = async selector => page.locator(selector).first().evaluate(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { width: Math.round(rect.width), height: Math.round(rect.height), scrollWidth: element.scrollWidth, clientWidth: element.clientWidth, overflowX: style.overflowX };
  });
  await page.goto('http://127.0.0.1:8765/study/math/part-one/task1-5.html#trainer');
  await page.waitForSelector('.route-question input');
  const practicalSidebar = await metric('.course-sidebar');
  const practicalTaskNav = await metric('.task-nav--sidebar');
  expect(practicalSidebar.height <= 170, 'mobile sidebar is compact', practicalSidebar);
  expect(practicalTaskNav.height <= 64, 'task numbers use one compact row', practicalTaskNav);
  expect(practicalTaskNav.overflowX === 'auto', 'task numbers scroll horizontally', practicalTaskNav);
  for (const selector of ['.practical-prototype-grid', '.route-prototype-tabs', '.route-analog-tabs']) {
    const strip = await metric(selector);
    expect(strip.height <= 80, `${selector} uses one row`, strip);
    expect(strip.overflowX === 'auto', `${selector} scrolls horizontally`, strip);
  }
  const practicalInput = await metric('.route-question input');
  expect(practicalInput.height >= 44, 'task 1-5 input is finger friendly', practicalInput);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), 'task 1-5 has no page overflow');
  for (const task of ['index.html#trainer', 'task7.html#trainer', 'task10.html#trainer', 'task15.html#trainer']) {
    await page.goto(`http://127.0.0.1:8765/study/math/part-one/${task}`);
    await page.waitForSelector('.prototype-progress-grid');
    const grid = await metric('.prototype-progress-grid');
    const sidebar = await metric('.course-sidebar');
    const currentTask = await page.locator('.task-nav--sidebar .is-current').evaluate(element => {
      const item = element.getBoundingClientRect();
      const strip = element.parentElement.getBoundingClientRect();
      return { visible: item.left >= strip.left && item.right <= strip.right, left: Math.round(item.left), right: Math.round(item.right) };
    });
    expect(grid.height <= 90, `${task}: type cards use one row`, grid);
    expect(grid.overflowX === 'auto', `${task}: type cards scroll horizontally`, grid);
    expect(sidebar.height <= 170, `${task}: sidebar is compact`, sidebar);
    expect(currentTask.visible, `${task}: current task number is visible`, currentTask);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), `${task}: no page overflow`);
  }
  const failures = checks.filter(check => !check.pass);
  if (failures.length) throw new Error(`Mobile trainer regression failed:\n${failures.map(item => `- ${item.message}: ${JSON.stringify(item.details || {})}`).join('\n')}`);
  return checks;
}
