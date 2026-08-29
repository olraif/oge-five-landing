(() => {
  const form = document.querySelector('.route-questions');
  const rows = [...document.querySelectorAll('.route-question[data-question-number]')];
  const submit = document.querySelector('.route-check-button');
  const prototypeTabs = document.querySelector('.route-prototype-tabs');
  const analogTabs = document.querySelector('.route-analog-tabs');
  const condition = document.querySelector('.route-source-condition');
  const typeButtons = [...document.querySelectorAll('[data-practical-type]')];
  const kicker = document.querySelector('.route-set-kicker');
  const title = document.querySelector('#route-set-title');
  const result = document.querySelector('.route-set-result');
  const model = window.OgeTaskOneToFiveModel;
  if (!form || !rows.length || !submit || !prototypeTabs || !analogTabs || !condition || !model) return;

  const storagePrefix = 'ogeTrainer:v3:math:task1to5:';
  const accountStorage = window.OgeProgressModel?.createAccountProgressStorage(localStorage);
  let selectedType = model.PRACTICAL_TYPES?.routes || { id: 'routes', label: 'Маршруты', prototypes: model.ROUTE_PROTOTYPES || [] };
  let prototypes = selectedType.prototypes || [];
  let selectedPrototype = prototypes[0] || null;
  let selectedAnalog = selectedPrototype?.analogs?.[0] || null;
  let cloudUser = null;
  let allAttempts = {};

  const cleanMarkup = (markup = '') => {
    const parser = new DOMParser();
    const normalizedMarkup = String(markup)
      .replace(/\$([^$]+)\$/g, '$1')
      .replace(/\\cdot/g, '&middot;')
      .replace(/\\%/g, '%')
      .replace(/\\text\{([^{}]*)\}/g, '$1')
      .replace(/\\times/g, '&times;')
      .replace(/\^\{?(\d+)\}?/g, '<sup>$1</sup>')
      .replace(/\\\s/g, ' ');
    const doc = parser.parseFromString(normalizedMarkup, 'text/html');
    doc.querySelectorAll('script,style,link,iframe,object').forEach((element) => element.remove());
    doc.querySelectorAll('*').forEach((element) => {
      [...element.attributes].forEach((attribute) => {
        if (attribute.name.toLowerCase().startsWith('on')) element.removeAttribute(attribute.name);
      });
    });
    doc.querySelectorAll('img').forEach((image) => {
      const src = image.getAttribute('src') || '';
      const fileName = src.match(/(trips-(?:[1-9]|1[01])|tires-[12]|homesteads-\d+)\.svg/i)?.[0]?.toLowerCase();
      if (!fileName) {
        image.remove();
        return;
      }
      image.src = `assets/task1-5/${fileName}`;
      image.alt = fileName.startsWith('trips-')
        ? 'Схема маршрутов между населёнными пунктами'
        : fileName.startsWith('tires-')
          ? 'Схема автомобильной шины'
          : 'План дачного участка';
      image.classList.add('route-map');
    });
    return doc.body.innerHTML;
  };

  const currentAttempt = () => allAttempts[selectedAnalog?.id] || null;

  const readAnswers = () => Object.fromEntries(rows.map((row) => [
    Number(row.dataset.questionNumber),
    row.querySelector('input')?.value || '',
  ]));

  const applyAttempt = (attempt) => {
    const answers = attempt?.answers || {};
    const answered = new Set(attempt?.answeredQuestionNumbers || []);
    const correct = new Set(attempt?.correctQuestionNumbers || []);
    rows.forEach((row) => {
      const number = Number(row.dataset.questionNumber);
      const input = row.querySelector('input');
      if (input) input.value = answers[number] ?? answers[String(number)] ?? '';
      row.classList.remove('is-correct', 'is-wrong');
      if (correct.has(number)) row.classList.add('is-correct');
      else if (answered.has(number)) row.classList.add('is-wrong');
    });
    const correctCount = correct.size;
    result.innerHTML = '<strong>' + correctCount + '/5</strong><span>верных ответов</span>';
  };

  const attemptCounts = (attempt) => ({
    correct: attempt?.correctQuestionNumbers?.length || 0,
    answered: attempt?.answeredQuestionNumbers?.length || 0,
  });

  const tabClass = (attempt, active) => {
    const counts = attemptCounts(attempt);
    return [
      'route-tab',
      active ? 'is-active' : '',
      counts.correct === 5 ? 'is-complete' : '',
      counts.answered > 0 && counts.correct < 5 ? 'is-started' : '',
    ].filter(Boolean).join(' ');
  };

  const renderTypeTabs = () => {
    typeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.practicalType === selectedType.id);
    });
  };
  const renderPrototypeTabs = () => {
    prototypeTabs.innerHTML = '';
    prototypes.forEach((prototype) => {
      const attempts = (prototype.analogs || []).map((analog) => allAttempts[analog.id]).filter(Boolean);
      const correct = attempts.reduce((sum, attempt) => sum + attemptCounts(attempt).correct, 0);
      const total = (prototype.analogs?.length || 0) * 5;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'route-tab route-tab--prototype'
        + (prototype.id === selectedPrototype?.id ? ' is-active' : '')
        + (correct === total && total ? ' is-complete' : '')
        + (correct > 0 && correct < total ? ' is-started' : '');
      button.innerHTML = '<strong>Прототип ' + prototype.number + '</strong><small>'
        + prototype.analogs.length + ' аналогов · ' + correct + '/' + total + '</small>';
      button.addEventListener('click', () => {
        selectedPrototype = prototype;
        selectedAnalog = prototype.analogs[0];
        renderAll();
      });
      prototypeTabs.append(button);
    });
  };

  const renderAnalogTabs = () => {
    analogTabs.innerHTML = '';
    (selectedPrototype?.analogs || []).forEach((analog, index) => {
      const counts = attemptCounts(allAttempts[analog.id]);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = tabClass(allAttempts[analog.id], analog.id === selectedAnalog?.id);
      button.innerHTML = '<strong>Аналог ' + (index + 1) + '</strong><small>' + counts.correct + '/5</small>';
      button.addEventListener('click', () => {
        selectedAnalog = analog;
        renderAll();
      });
      analogTabs.append(button);
    });
  };

  const renderAnalog = () => {
    if (!selectedAnalog) return;
    if (kicker) kicker.textContent = selectedType.label;
    title.textContent = 'Прототип ' + selectedPrototype.number + ' · аналог '
      + (selectedPrototype.analogs.indexOf(selectedAnalog) + 1);
    condition.innerHTML = cleanMarkup(selectedAnalog.taskHtml);
    const questions = selectedAnalog.questions || [];
    rows.forEach((row) => {
      const number = Number(row.dataset.questionNumber);
      const question = questions.find((item) => Number(item.number) === number);
      const text = row.querySelector('.route-question-text');
      if (text) text.innerHTML = cleanMarkup(question?.html || '');
    });
    applyAttempt(currentAttempt());
  };

  const renderAll = () => {
    renderTypeTabs();
    renderPrototypeTabs();
    renderAnalogTabs();
    renderAnalog();
  };

  const saveCloud = async (attemptId, payload) => {
    if (!window.ogeSupabase || !cloudUser) return;
    try {
      const { data } = await window.ogeSupabase.auth.getUser();
      const freshUser = data?.user || cloudUser;
      const current = freshUser.user_metadata?.trainer_progress || {};
      const ownedPayload = { ...payload, ownerId: freshUser.id };
      const next = {
        ...current,
        math: {
          ...(current.math || {}),
          task1to5: { ...(current.math?.task1to5 || {}), [attemptId]: ownedPayload },
        },
      };
      const { data: updated, error } = await window.ogeSupabase.auth.updateUser({ data: { trainer_progress: next } });
      if (error) throw error;
      cloudUser = updated?.user || { ...freshUser, user_metadata: { ...freshUser.user_metadata, trainer_progress: next } };
    } catch (error) {
      console.warn('Не удалось сохранить прогресс заданий 1–5', error);
    }
  };

  const check = () => {
    if (!selectedAnalog) return;
    const answers = readAnswers();
    const checked = model.checkRouteAnswers(selectedAnalog, answers);
    const payload = {
      type: selectedType.id,
      prototype: selectedPrototype.id,
      analog: selectedAnalog.id,
      answers,
      ...checked,
      taskProgress: model.buildTaskProgress(checked),
      savedAt: new Date().toISOString(),
      ownerId: cloudUser?.id || null,
    };
    allAttempts[selectedAnalog.id] = payload;
    applyAttempt(payload);
    renderPrototypeTabs();
    renderAnalogTabs();
    if (cloudUser?.id) {
      accountStorage?.write(storagePrefix, cloudUser.id, selectedAnalog.id, payload);
      saveCloud(selectedAnalog.id, payload);
    }
  };

  const load = async () => {
    if (!window.ogeSupabase) return;
    try {
      const { data } = await window.ogeSupabase.auth.getSession();
      cloudUser = data?.session?.user || null;
      if (!cloudUser) {
        allAttempts = {};
        renderAll();
        return;
      }
      const cloudAttempts = cloudUser.user_metadata?.trainer_progress?.math?.task1to5 || {};
      allAttempts = Object.fromEntries(Object.entries(cloudAttempts).filter(([, attempt]) => (
        window.OgeProgressModel?.isAttemptOwnedByAccount(attempt, cloudUser)
      )));
      Object.values(model.PRACTICAL_TYPES || {}).flatMap((type) => type.prototypes || []).flatMap((prototype) => prototype.analogs || []).forEach((analog) => {
        if (allAttempts[analog.id]) return;
        const localAttempt = accountStorage?.read(storagePrefix, cloudUser.id, analog.id);
        if (localAttempt) allAttempts[analog.id] = localAttempt;
      });
      renderAll();
    } catch {
      allAttempts = {};
      renderAll();
    }
  };

  typeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextType = model.PRACTICAL_TYPES?.[button.dataset.practicalType];
      if (!nextType) return;
      selectedType = nextType;
      prototypes = selectedType.prototypes || [];
      selectedPrototype = prototypes[0] || null;
      selectedAnalog = selectedPrototype?.analogs?.[0] || null;
      renderAll();
    });
  });
  submit.addEventListener('click', check);
  form.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    check();
  });
  window.addEventListener('oge-auth-ready', load);
  renderAll();
  setTimeout(load, 700);
})();
