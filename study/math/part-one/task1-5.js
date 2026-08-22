(() => {
  const form = document.querySelector('.route-questions');
  const rows = [...document.querySelectorAll('.route-question[data-question-number]')];
  const submit = document.querySelector('.route-check-button');
  const model = window.OgeTaskOneToFiveModel;
  if (!form || !rows.length || !submit || !model) return;

  const attemptId = 'routes-1.1.1';
  const storagePrefix = 'ogeTrainer:v3:math:task1to5:';
  const accountStorage = window.OgeProgressModel?.createAccountProgressStorage(localStorage);
  let cloudUser = null;

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
  };

  const getCloudAttempt = () => {
    const attempt = cloudUser?.user_metadata?.trainer_progress?.math?.task1to5?.[attemptId];
    return window.OgeProgressModel?.isAttemptOwnedByAccount(attempt, cloudUser) ? attempt : null;
  };

  const saveCloud = async (payload) => {
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
    const answers = readAnswers();
    const checked = model.checkRouteAnswers(answers);
    const payload = {
      prototype: attemptId,
      answers,
      ...checked,
      taskProgress: model.buildTaskProgress(checked),
      savedAt: new Date().toISOString(),
      ownerId: cloudUser?.id || null,
    };
    applyAttempt(payload);
    if (cloudUser?.id) {
      accountStorage?.write(storagePrefix, cloudUser.id, attemptId, payload);
      saveCloud(payload);
    }
  };

  const load = async () => {
    if (!window.ogeSupabase) return;
    try {
      const { data } = await window.ogeSupabase.auth.getSession();
      cloudUser = data?.session?.user || null;
      if (!cloudUser) return;
      const cloudAttempt = getCloudAttempt();
      const localAttempt = accountStorage?.read(storagePrefix, cloudUser.id, attemptId);
      const attempt = cloudAttempt || localAttempt;
      if (attempt) applyAttempt(attempt);
    } catch { /* В гостевом режиме ответы не сохраняются. */ }
  };

  submit.addEventListener('click', check);
  form.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    check();
  });
  window.addEventListener('oge-auth-ready', load);
  setTimeout(load, 700);
})();
