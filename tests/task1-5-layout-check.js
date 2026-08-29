async page => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://127.0.0.1:8765/study/math/part-one/task1-5.html#trainer');
  await page.waitForSelector('.route-source-condition img');
  await page.locator('[data-practical-type="routes"]').click();
  await page.waitForTimeout(150);

  const measure = async label => page.evaluate(currentLabel => {
    const condition = document.querySelector('.route-source-condition');
    const panel = document.querySelector('.practical-panel');
    const tableWrappers = [...condition.querySelectorAll('.table-wrapper')];
    return {
      label: currentLabel,
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      panelWidth: Math.round(panel.getBoundingClientRect().width),
      conditionHeight: Math.round(condition.getBoundingClientRect().height),
      overflowingTables: tableWrappers.filter(item => item.scrollWidth > item.clientWidth + 1).length,
    };
  }, label);

  const routes = await measure('Маршруты');
  await page.locator('[data-practical-type="tires"]').click();
  await page.waitForTimeout(150);
  const tires = await measure('Шины');
  await page.locator('[data-practical-type="plots"]').click();
  await page.waitForTimeout(150);
  const plots = await measure('Участки');
  const results = [routes, tires, plots];
  const failures = results.filter(item => (
    item.documentWidth > item.viewportWidth
    || item.panelWidth > 1100
    || item.overflowingTables > 0
    || (item.label === 'Маршруты' && item.conditionHeight > 340)
    || (item.label === 'Шины' && item.conditionHeight > 500)
    || (item.label === 'Участки' && item.conditionHeight > 520)
  ));

  if (failures.length) {
    throw new Error('Макет 1–5 выходит за стандартный шаблон: ' + JSON.stringify(failures));
  }
  return results;
}
