async page => {
  const base = 'http://127.0.0.1:8765/study/math/part-one/';
  const failures = [];
  const expect = (condition, message) => {
    if (!condition) failures.push(message);
  };

  await page.goto(base + 'task1-5.html#trainer');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.route-tab--prototype');

  const practical = await page.evaluate(() => ({
    types: [...document.querySelectorAll('.route-tab--prototype strong')].map(node => node.textContent.trim()),
    numbers: [...document.querySelectorAll('.route-analog-tabs strong')].map(node => node.textContent.trim()),
    title: document.querySelector('#route-set-title')?.textContent.trim() || '',
  }));
  expect(practical.types[0] === 'Тип 1.1', 'Задания 1–5 должны показывать «Тип 1.1»');
  expect(practical.numbers[0] === '1.1.1', 'Первый вложенный номер должен быть 1.1.1');
  expect(practical.numbers[1] === '1.1.2', 'Второй вложенный номер должен быть 1.1.2');
  expect(practical.title === 'Тип 1.1 · 1.1.1', 'Заголовок должен содержать тип и полный номер');

  await page.goto(base + 'index.html#trainer');
  await page.waitForSelector('.quiz-caption');
  expect((await page.locator('.quiz-caption').first().innerText()).startsWith('Тип 6.1'), 'Задание 6 должно показывать «Тип 6.1»');

  for (let task = 7; task <= 19; task += 1) {
    await page.goto(base + `task${task}.html#trainer`);
    await page.waitForSelector(`[data-task${task}-title]`);
    const title = (await page.locator(`[data-task${task}-title]`).innerText()).trim();
    expect(title.startsWith(`Тип ${task}.`), `Задание ${task} должно показывать «Тип»`);
    const visibleText = await page.locator('body').innerText();
    expect(!/прототип/i.test(visibleText), `В задании ${task} осталось слово «прототип»`);
  }

  await page.goto(base + 'task7.html#trainer');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('[data-task7-quiz] input');
  await page.evaluate(() => {
    const proto = window.OgeTask7DataPrototypes[0];
    proto.items.forEach(item => {
      const input = document.querySelector(`[data-task7-quiz] input[name="${item.id}"]`);
      input.value = item.answer;
    });
    document.querySelector('[data-task7-submit]').click();
  });
  await page.waitForTimeout(100);
  expect((await page.locator('[data-task7-note]').innerText()).trim() === '', 'Повторная строка «Проверено…» должна быть удалена');

  if (failures.length) throw new Error(failures.join('\n'));
  return { checkedTasks: '1–19', practical, duplicateResultRemoved: true };
}
