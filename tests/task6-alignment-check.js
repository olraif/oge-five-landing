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

  await page.goto(base + 'index.html#trainer');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('#fractionQuiz input');
  await page.locator('#fractionQuiz input').nth(0).fill('9,4');
  await page.locator('#fractionQuiz input').nth(1).fill('0');
  await page.locator('#fractionQuiz input').nth(1).press('Enter');
  const task6Colours = await page.evaluate(() => {
    const background = selector => getComputedStyle(document.querySelector(selector)).backgroundColor;
    return {
      correctClass: document.querySelector('[data-question="q1"]').className,
      wrongClass: document.querySelector('[data-question="q2"]').className,
      emptyClass: document.querySelector('[data-question="q3"]').className,
      correctBackground: background('[data-question="q1"]'),
      wrongBackground: background('[data-question="q2"]'),
      emptyBackground: background('[data-question="q3"]'),
      prototypeBackground: background('[data-prototype-cell="6.1"]'),
    };
  });
  expect(task6Colours.correctClass.includes('question-correct'), 'Правильный ответ шестого задания должен получить класс question-correct');
  expect(task6Colours.wrongClass.includes('question-wrong'), 'Неправильный ответ шестого задания должен получить класс question-wrong');
  expect(task6Colours.emptyClass.includes('question-empty'), 'Пустой ответ шестого задания должен получить класс question-empty');
  expect(task6Colours.correctBackground === 'rgb(223, 248, 231)', `Правильный ответ должен быть зелёным, получено ${task6Colours.correctBackground}`);
  expect(task6Colours.wrongBackground === 'rgb(255, 245, 216)', `Неправильный ответ должен быть жёлтым, получено ${task6Colours.wrongBackground}`);
  expect(task6Colours.emptyBackground === 'rgb(255, 241, 245)', `Пустой ответ должен быть розовым, получено ${task6Colours.emptyBackground}`);
  expect(task6Colours.prototypeBackground === 'rgb(255, 245, 216)', `Частично решённый тип должен быть жёлтым, получено ${task6Colours.prototypeBackground}`);

  const taskPages = ['task1-5.html', ...Array.from({ length: 13 }, (_, index) => `task${index + 7}.html`)];
  for (const taskPage of taskPages) {
    await page.goto(base + taskPage + '#trainer');
    const icon = (await page.locator('.course-sidebar > a:first-child span').innerText()).trim();
    expect(icon === '•', `${taskPage}: в кнопке «Обзор тренажёра» должна быть точка, получено «${icon}»`);
  }

  if (failures.length) throw new Error(failures.join('\n'));
  return { reference, task6, task6Colours, checkedOverviewIcons: taskPages.length };
}
