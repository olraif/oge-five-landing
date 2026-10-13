(() => {
  const course = document.body.dataset.course;
  const source = document.body.dataset.data;
  const state = document.getElementById('state');
  const nav = document.getElementById('groups');
  const container = document.getElementById('tasks');
  const title = document.getElementById('task-title');
  const client = window.ogeSupabase;
  const allowedNumbers = course === 'math-algebra' ? [20, 21, 22] : [23, 24, 25];
  const expectedCounts = { 20: 24, 21: 21, 22: 15, 23: 19, 24: 15, 25: 16 };
  const requestedNumber = Number(new URLSearchParams(window.location.search).get('task'));
  const examNumber = allowedNumbers.includes(requestedNumber) ? requestedNumber : allowedNumbers[0];
  const el = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };

  const readProgress = async () => {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) throw error || new Error('Требуется вход в аккаунт');
    return { user: data.user, progress: data.user.user_metadata?.trainer_progress?.math || {} };
  };
  const saveProgress = async (task, status) => {
    const { user, progress } = await readProgress();
    const next = {
      ...user.user_metadata,
      trainer_progress: {
        ...user.user_metadata?.trainer_progress,
        math: window.OgePartTwoProgress.withStatus(progress, user.id, task.id, status),
      },
    };
    const result = await client.auth.updateUser({ data: next });
    if (result.error) throw result.error;
    window.dispatchEvent(new CustomEvent('oge-part-two-progress-updated'));
  };

  const renderTask = (task, saved, onSaved) => {
    const card = el('article', 'task');
    card.setAttribute('aria-label', `Прототип ${task.prototypeId}, аналог ${task.analogNumber}`);
    card.dataset.status = saved?.status || '';
    const top = el('div', 'task__top');
    const badge = el('span', 'task__status', saved?.status === 'correct' ? 'Ответ совпал' : saved?.status === 'reviewed' ? 'Сверено' : 'Не решено');
    top.append(badge);
    card.append(top, el('p', 'task__prompt', window.OgeMathTypography.prompt(task.prompt)));
    const form = el('form', 'task__form');
    const label = el('label', '', task.validationMode === 'self_check_proof' ? 'Ваше доказательство' : 'Ваш ответ');
    const field = el(task.validationMode === 'self_check_proof' ? 'textarea' : 'input');
    field.required = true;
    field.name = 'answer';
    field.value = saved?.answer || '';
    field.setAttribute('aria-label', label.textContent);
    label.append(field);
    const button = el('button', '', task.validationMode === 'self_check_proof'
      ? 'Сверить доказательство' : task.requiresGraph ? 'Сверить ответ и график' : 'Проверить ответ');
    button.type = 'submit';
    const feedback = el('p', 'task__feedback');
    feedback.setAttribute('role', 'status');
    form.append(label, button, feedback);
    card.append(form);
    const solution = el('div', 'task__solution');
    solution.hidden = true;
    solution.append(el('strong', '', task.validationMode === 'self_check_proof'
      ? 'Образец доказательства' : `Ответ: ${window.OgeMathTypography.inline(task.answer)}`),
    el('p', '', window.OgeMathTypography.inline(task.solution)));
    const mark = el('button', '', task.requiresGraph ? 'Я сверил(а) график и решение' : 'Я сверил(а) решение');
    mark.type = 'button';
    mark.hidden = saved?.status === 'correct';
    solution.append(mark);
    card.append(solution);
    const setStatus = (status) => {
      card.dataset.status = status;
      badge.textContent = status === 'correct' ? 'Ответ совпал' : 'Сверено';
      mark.hidden = status === 'correct';
    };
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!field.value.trim()) return;
      solution.hidden = false;
      window.OgeMathTypography.typeset(solution).catch(() => {
        feedback.textContent = 'Не удалось отобразить формулы в решении. Обновите страницу.';
      });
      if (task.graphSpec && window.OgeGraphPreview && !solution.querySelector('.task__graph-preview')) {
        solution.insertBefore(window.OgeGraphPreview.render(task.graphSpec), mark);
      }
      const matched = window.PartTwoAnswerCheck.compare(task.validationMode, field.value, task.answer);
      if (matched === true && !task.requiresGraph && task.validationMode !== 'parameter_set_plus_graph_self_check') {
        button.disabled = true;
        feedback.textContent = 'Ответ совпал. Сверьте также ход решения.';
        try {
          await saveProgress(task, 'correct');
          setStatus('correct');
          onSaved(task.id, 'correct');
        } catch (error) {
          feedback.textContent = 'Ответ совпал, но прогресс не сохранился. Повторите попытку.';
        } finally {
          button.disabled = false;
        }
      } else if (matched === true) {
        feedback.textContent = 'Значения параметра совпали. Проверьте построение графика по решению.';
      } else {
        feedback.textContent = task.validationMode === 'self_check_proof'
          ? 'Сравните своё доказательство с решением ниже.'
          : 'Ответ не совпал в этой записи. Сравните его с решением ниже; равносильную запись оцените самостоятельно.';
      }
    });
    mark.addEventListener('click', async () => {
      mark.disabled = true;
      try {
        await saveProgress(task, 'reviewed');
        setStatus('reviewed');
        onSaved(task.id, 'reviewed');
        feedback.textContent = 'Самопроверка отмечена, прогресс сохранён.';
      } catch (error) {
        feedback.textContent = 'Не удалось сохранить прогресс. Повторите попытку.';
      } finally {
        mark.disabled = false;
      }
    });
    return card;
  };

  const render = (bank, progress, userId) => {
    title.textContent = `Задание ${examNumber}`;
    document.title = `Задание ${examNumber} · ОГЭ-тренажёр`;
    document.querySelectorAll(`.task-nav [data-second-part-task="${examNumber}"]`)
      .forEach((link) => link.classList.add('is-current'));
    window.OgeTrainerNavigation?.revealCurrentTaskOnMobile();
    const groups = bank.filter((group) => group.examNumber === examNumber);
    const expected = expectedCounts[examNumber];
    if (groups.length < expected) {
      container.append(el('p', 'math-part-two-draft-note',
        `Подготовлено ${groups.length} из ${expected} прототипов этого номера. Остальные задания ещё готовятся.`));
    }
    if (!groups.length) {
      nav.hidden = true;
      container.hidden = false;
      return;
    }
    groups.forEach((group, index) => {
      const button = el('button', 'prototype-progress');
      button.type = 'button';
      button.append(el('b', '', `Тип ${group.prototypeNumber || group.prototypeId.split('.')[1]}`));
      button.setAttribute('aria-label', `Прототип ${group.prototypeId}, три аналога`);
      const section = el('section', 'math-part-two-prototype');
      section.setAttribute('aria-label', `Прототип ${group.prototypeId}`);
      section.hidden = index !== 0;
      const statuses = new Map();
      const updateButton = () => {
        const values = [...statuses.values()];
        const complete = values.length === 3 && values.every((value) => value === 'correct' || value === 'reviewed');
        button.classList.toggle('is-green', complete);
        button.classList.toggle('is-yellow', values.length > 0 && !complete);
        button.classList.toggle('is-pink', values.length === 0);
      };
      group.analogs.forEach((analog, analogIndex) => {
        const task = { ...analog, examNumber, prototypeId: group.prototypeId, analogNumber: analogIndex + 1 };
        const status = window.OgePartTwoProgress.statusAt(progress, userId, task.id);
        const owned = status ? { status } : null;
        if (owned?.status) statuses.set(task.id, owned.status);
        section.append(renderTask(task, owned, (id, status) => {
          statuses.set(id, status);
          updateButton();
        }));
      });
      updateButton();
      button.classList.toggle('is-current', index === 0);
      button.addEventListener('click', () => {
        nav.querySelectorAll('button').forEach((tab) => tab.classList.remove('is-current'));
        container.querySelectorAll('.math-part-two-prototype').forEach((item) => { item.hidden = true; });
        button.classList.add('is-current');
        section.hidden = false;
        window.OgeMathTypography.typeset(section).catch(() => {
          state.textContent = 'Не удалось отобразить формулы. Обновите страницу.';
        });
      });
      nav.append(button);
      container.append(section);
    });
    nav.hidden = false;
    container.hidden = false;
    window.OgeMathTypography.typeset(container.querySelector('.math-part-two-prototype:not([hidden])')).catch(() => {
      state.textContent = 'Не удалось отобразить формулы. Обновите страницу.';
    });
  };

  const start = async () => {
    if (!client || !window.ogeHasCourseAccess || !window.OgePartTwoProgress) {
      state.textContent = 'Не удалось подключиться к сервису. Обновите страницу позже.';
      document.documentElement.style.visibility = '';
      return;
    }
    try {
      const access = await window.ogeHasCourseAccess(course);
      if (access.error || !access.data) {
        window.location.replace('/study/#courses');
        return;
      }
      const [response, account] = await Promise.all([fetch(source, { cache: 'no-store' }), readProgress()]);
      if (!response.ok) throw new Error('Не удалось загрузить задания');
      const bank = await response.json();
      if (!Array.isArray(bank) || bank.some((group) => !group.prototypeId || !group.examNumber
        || !Array.isArray(group.analogs) || group.analogs.length !== 3
        || group.analogs.some((task) => !task.id || !task.prompt || !task.solution))) {
        throw new Error('Данные заданий неполны');
      }
      render(bank, account.progress, account.user.id);
      state.textContent = '';
      document.documentElement.style.visibility = '';
      const recheckAccess = async () => {
        const current = await window.ogeHasCourseAccess(course);
        if (current.error || !current.data) window.location.replace('/study/#courses');
      };
      // Даже открытая вкладка закрывает тренажёр после истечения срока доступа.
      window.setInterval(recheckAccess, 60000);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) recheckAccess();
      });
    } catch (error) {
      state.textContent = 'Не удалось открыть задания. Обновите страницу позже.';
      document.documentElement.style.visibility = '';
    }
  };
  start();
})();
