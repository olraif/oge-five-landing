(() => {
  const course = document.body.dataset.course;
  const source = document.body.dataset.data;
  const state = document.getElementById('state');
  const nav = document.getElementById('groups');
  const container = document.getElementById('tasks');
  const client = window.ogeSupabase;
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
  const saveProgress = async (task, status, answer) => {
    const { user, progress } = await readProgress();
    const key = `task${task.examNumber}`;
    const next = {
      ...user.user_metadata,
      trainer_progress: {
        ...user.user_metadata?.trainer_progress,
        math: {
          ...progress,
          [key]: {
            ...progress[key],
            [task.id]: { status, answer, savedAt: new Date().toISOString(), ownerId: user.id },
          },
        },
      },
    };
    const result = await client.auth.updateUser({ data: next });
    if (result.error) throw result.error;
    window.dispatchEvent(new CustomEvent('oge-part-two-progress-updated'));
  };

  const renderTask = (task, saved) => {
    const card = el('article', 'task');
    card.dataset.status = saved?.status || '';
    const top = el('div', 'task__top');
    top.append(el('span', 'task__type', `Тип задачи: ${task.prototypeFamily}`));
    const badge = el('span', 'task__status', saved?.status === 'correct' ? 'Ответ совпал' : saved?.status === 'reviewed' ? 'Сверено' : 'Не решено');
    top.append(badge);
    card.append(top, el('p', 'task__prompt', task.prompt));
    const form = el('form', 'task__form');
    const label = el('label', '', task.validationMode === 'self_check_proof' ? 'Ваше доказательство' : 'Ваш ответ');
    const field = el(task.validationMode === 'self_check_proof' ? 'textarea' : 'input');
    field.required = true;
    field.name = 'answer';
    field.value = saved?.answer || '';
    field.setAttribute('aria-label', label.textContent);
    label.append(field);
    const button = el('button', '', task.validationMode === 'self_check_proof' ? 'Сверить доказательство' : 'Проверить ответ');
    button.type = 'submit';
    const feedback = el('p', 'task__feedback');
    feedback.setAttribute('role', 'status');
    form.append(label, button, feedback);
    card.append(form);
    const solution = el('div', 'task__solution');
    solution.hidden = true;
    solution.append(el('strong', '', `Ответ: ${task.answer}`), el('p', '', task.solution));
    const mark = el('button', '', 'Я сверил(а) решение');
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
      const matched = window.PartTwoAnswerCheck.compare(task.validationMode, field.value, task.answer);
      if (matched === true && task.validationMode !== 'parameter_set_plus_graph_self_check') {
        button.disabled = true;
        feedback.textContent = 'Ответ совпал. Сверьте также ход решения.';
        try {
          await saveProgress(task, 'correct', field.value.trim());
          setStatus('correct');
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
        await saveProgress(task, 'reviewed', field.value.trim());
        setStatus('reviewed');
        feedback.textContent = 'Самопроверка отмечена, прогресс сохранён.';
      } catch (error) {
        feedback.textContent = 'Не удалось сохранить прогресс. Повторите попытку.';
      } finally {
        mark.disabled = false;
      }
    });
    return card;
  };

  const render = (tasks, progress, userId) => {
    const groups = [...new Set(tasks.map((task) => task.examNumber))];
    for (const number of groups) {
      const link = el('a', '', `№ ${number}`);
      link.href = `#task-${number}`;
      nav.append(link);
      const section = el('section', 'task-group');
      section.id = `task-${number}`;
      const head = el('div', 'task-group__head');
      head.append(el('h2', '', `Задание №${number}`));
      const items = tasks.filter((task) => task.examNumber === number);
      head.append(el('small', '', `${items.length} типа задачи`));
      section.append(head);
      const grid = el('div', 'task-grid');
      for (const task of items) {
        const saved = progress[`task${number}`]?.[task.id];
        grid.append(renderTask(task, saved?.ownerId === userId ? saved : null));
      }
      section.append(grid);
      container.append(section);
    }
    nav.hidden = false;
    container.hidden = false;
  };

  const start = async () => {
    if (!client || !window.ogeHasCourseAccess) {
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
      const tasks = await response.json();
      if (!Array.isArray(tasks) || tasks.length !== 12 || tasks.some((task) => !task.id || !task.examNumber || !task.prompt || !task.solution)) {
        throw new Error('Данные заданий неполны');
      }
      render(tasks, account.progress, account.user.id);
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
