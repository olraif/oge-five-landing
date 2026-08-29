async page => {
  const base = 'http://127.0.0.1:8765/study/math/part-one/';
  const failures = [];
  const expect = (condition, message) => {
    if (!condition) failures.push(message);
  };

  await page.route('**/auth-session.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: 'window.ogeHasCourseAccess = async () => ({ data: true, user: null });',
  }));

  const readTrainerMetrics = async (path, workspaceSelector) => {
    await page.goto(base + path);
    await page.waitForSelector('.quiz-card label');
    return page.evaluate(selector => {
      const workspace = document.querySelector(selector);
      const row = document.querySelector('.quiz-card label');
      const expression = row?.querySelector('span');
      const input = row?.querySelector('input');
      const result = document.querySelector('.result-card');
      const instruction = document.querySelector('.task-instruction');
      const submit = document.querySelector('.quiz-card button, [data-task7-submit]');
      const panel = document.querySelector('#trainer');
      const prototype = document.querySelector('.prototype-progress');
      const guide = document.querySelector('.trainer-guide');
      const style = element => element ? getComputedStyle(element) : null;
      return {
        workspaceColumns: style(workspace)?.gridTemplateColumns,
        rowMinHeight: style(row)?.minHeight,
        expressionFontSize: style(expression)?.fontSize,
        expressionLineHeight: style(expression)?.lineHeight,
        inputWidth: input?.getBoundingClientRect().width,
        resultBackground: style(result)?.backgroundColor,
        resultPadding: style(result)?.padding,
        resultScoreFontSize: style(result?.querySelector('strong'))?.fontSize,
        instructionFontSize: style(instruction)?.fontSize,
        instructionDisplay: style(instruction)?.display,
        submitBackground: style(submit)?.backgroundColor,
        submitColor: style(submit)?.color,
        submitHeight: submit?.getBoundingClientRect().height,
        submitRadius: style(submit)?.borderRadius,
        panelPadding: style(panel)?.padding,
        prototypePadding: style(prototype)?.padding,
        guideVisible: guide ? style(guide)?.display !== 'none' : false,
      };
    }, workspaceSelector);
  };

  const reference = await readTrainerMetrics('task7.html#trainer', '.task7-workspace');
  const task6 = await readTrainerMetrics('index.html#trainer', '.trainer-layout');

  for (const key of [
    'workspaceColumns',
    'rowMinHeight',
    'expressionFontSize',
    'expressionLineHeight',
    'resultBackground',
    'resultPadding',
    'resultScoreFontSize',
    'instructionFontSize',
    'instructionDisplay',
    'submitBackground',
    'submitColor',
    'submitRadius',
    'panelPadding',
    'prototypePadding',
  ]) {
    expect(task6[key] === reference[key], `Задание 6: ${key} отличается от задания 7 (${task6[key]} вместо ${reference[key]})`);
  }
  expect(Math.abs(task6.inputWidth - reference.inputWidth) < 1, `Задание 6: ширина поля ответа отличается (${task6.inputWidth} вместо ${reference.inputWidth})`);
  expect(Math.abs(task6.submitHeight - reference.submitHeight) < 1, `Задание 6: высота кнопки проверки отличается (${task6.submitHeight} вместо ${reference.submitHeight})`);
  expect(!task6.guideVisible, 'В задании 6 остался лишний блок «Как пройти тип»');

  const taskPages = ['task1-5.html', ...Array.from({ length: 13 }, (_, index) => `task${index + 7}.html`)];
  for (const taskPage of taskPages) {
    await page.goto(base + taskPage + '#trainer');
    const icon = (await page.locator('.course-sidebar > a:first-child span').innerText()).trim();
    expect(icon === '•', `${taskPage}: в кнопке «Обзор тренажёра» должна быть точка, получено «${icon}»`);
  }

  if (failures.length) throw new Error(failures.join('\n'));
  return { reference, task6, checkedOverviewIcons: taskPages.length };
}
