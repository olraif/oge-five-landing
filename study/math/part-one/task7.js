(() => {
  const prototypes = Array.isArray(window.OgeTask7DataPrototypes) ? window.OgeTask7DataPrototypes : [];
  const prototypeById = new Map(prototypes.map((item) => [item.id, item]));
  const prototypeNav = document.querySelector('[data-task7-prototypes]');
  const quiz = document.querySelector('[data-task7-quiz]');
  const submit = document.querySelector('[data-task7-submit]');
  const reset = document.querySelector('[data-task7-reset]');
  const title = document.querySelector('[data-task7-title]');
  const score = document.querySelector('[data-task7-score]');
  const currentTotal = document.querySelector('[data-task7-current-total]');
  const total = document.querySelector('[data-task7-total]');
  const percent = document.querySelector('[data-task7-percent]');
  const note = document.querySelector('[data-task7-note]');
  const result = document.querySelector('[data-task7-result]');
  if (!prototypeNav || !quiz || !submit || !reset || !prototypes.length) return;

  const storagePrefix = 'ogeTrainer:v3:math:task7:';
  const resetStoragePrefix = 'ogeTrainer:v3:math:task7Reset:';
  const accountStorage = window.OgeProgressModel?.createAccountProgressStorage(localStorage);
  const progressPath = ['math', 'task7'];
  let activeId = new URLSearchParams(location.search).get('prototype') || prototypes[0].id;
  if (!prototypeById.has(activeId)) activeId = prototypes[0].id;
  let cloudUser = null;
  let loadCloudRevision = 0;

  const normalize = (value) => String(value ?? '').trim().replace(/,/g, '.').replace(/\s+/g, '');
  const prepareTaskHtml = (value) => String(value ?? '').replace(/\$([^$]+)\$/g, (_, expression) => `\\(${expression}\\)`);
  const createResetToken = () => window.crypto?.randomUUID?.()
    || `reset-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const getResetToken = (id) => {
    const resetKey = window.OgeProgressModel?.buildProgressResetKey(progressPath, id);
    const cloudReset = resetKey ? cloudUser?.user_metadata?.[resetKey] : null;
    const localReset = accountStorage?.read(resetStoragePrefix, cloudUser?.id, id);
    const localToken = localReset?.token || localReset?.resetAt || null;
    if (localReset?.pending && localToken) return localToken;
    return cloudReset || localToken || null;
  };
  const getSaved = (id) => {
    const cloudAttempt = cloudUser?.user_metadata?.trainer_progress?.math?.task7?.[id];
    const localAttempt = accountStorage?.read(storagePrefix, cloudUser?.id, id) || null;
    const resetToken = getResetToken(id);
    const candidates = [
      window.OgeProgressModel?.isAttemptOwnedByAccount(cloudAttempt, cloudUser) ? cloudAttempt : null,
      localAttempt,
    ].filter((attempt) => attempt && window.OgeProgressModel?.isAttemptVisibleAfterReset(attempt, resetToken));
    return candidates.reduce((latest, attempt) => {
      if (!latest) return attempt;
      const latestTime = Date.parse(latest.savedAt || '') || 0;
      const attemptTime = Date.parse(attempt.savedAt || '') || 0;
      return attemptTime >= latestTime ? attempt : latest;
    }, null);
  };
  const validSaved = (saved, proto) => {
    if (!saved || saved.prototype !== proto.id || typeof saved.answers !== 'object') return null;
    const allowed = new Set(proto.items.map((item) => item.id));
    const answers = Object.fromEntries(Object.entries(saved.answers).filter(([id]) => allowed.has(id)));
    const correctIds = Array.isArray(saved.correctIds) ? saved.correctIds.filter((id) => allowed.has(id)) : [];
    const answeredIds = Array.isArray(saved.answeredIds) ? saved.answeredIds.filter((id) => allowed.has(id)) : Object.keys(answers).filter((id) => answers[id] !== '');
    return { ...saved, prototype: proto.id, answers, correctIds, answeredIds, score: correctIds.length, total: proto.items.length };
  };
  const getAllSaved = () => Object.fromEntries(prototypes.map((proto) => [proto.id, validSaved(getSaved(proto.id), proto)]).filter(([,value]) => value));
  const prototypeState = (proto) => {
    const saved = validSaved(getSaved(proto.id), proto);
    const correct = saved?.correctIds?.length || 0;
    const answered = saved?.answeredIds?.length || 0;
    if (correct === proto.items.length) return 'is-green';
    if (answered > 0) return 'is-yellow';
    return 'is-pink';
  };
  const renderNav = () => {
    prototypeNav.innerHTML = prototypes.map((proto) => {
      const saved = validSaved(getSaved(proto.id), proto);
      const correct = saved?.correctIds?.length || 0;
      return `<button type="button" class="prototype-progress ${prototypeState(proto)} ${proto.id === activeId ? 'is-current' : ''}" data-task7-prototype="${proto.id}"><b>${proto.id}</b><span>${correct}/${proto.items.length}</span></button>`;
    }).join('');
    prototypeNav.querySelectorAll('[data-task7-prototype]').forEach((button) => button.addEventListener('click', () => {
      activeId = button.dataset.task7Prototype;
      render();
      const url = new URL(location.href); url.searchParams.set('prototype', activeId); history.replaceState({}, '', url);
    }));
  };
  const renderOverall = () => {
    const all = prototypes.reduce((acc, proto) => {
      const saved = validSaved(getSaved(proto.id), proto);
      acc.total += proto.items.length;
      acc.correct += saved?.correctIds?.length || 0;
      return acc;
    }, { total: 0, correct: 0 });
    if (total) total.textContent = all.total;
    const value = all.total ? Math.round(all.correct / all.total * 100) : 0;
    if (percent) percent.textContent = `${value}%`;
  };
  const applySaved = (proto, saved) => {
    const answers = saved?.answers || {};
    const correct = new Set(saved?.correctIds || []);
    const answered = new Set(saved?.answeredIds || Object.keys(answers));
    quiz.querySelectorAll('label[data-item-id]').forEach((row) => {
      const id = row.dataset.itemId;
      const input = row.querySelector('input');
      if (input) input.value = answers[id] || '';
      row.classList.remove('question-correct', 'question-wrong', 'question-empty');
      row.classList.add(correct.has(id) ? 'question-correct' : answered.has(id) ? 'question-wrong' : 'question-empty');
    });
    score.textContent = saved?.correctIds?.length || 0;
    currentTotal.textContent = proto.items.length;
    note.textContent = saved ? '' : '\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u044F \u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0442\u0438\u043F".';
  };
  const render = () => {
    const proto = prototypeById.get(activeId);
    title.textContent = `\u0422\u0438\u043F ${proto.id}: ${proto.title}`;
    quiz.innerHTML = proto.items.map((item) => `<label data-item-id="${item.id}" class="question-empty"><b>${item.id}</b><span>${prepareTaskHtml(item.taskHtml)}</span><input name="${item.id}" autocomplete="off" inputmode="decimal" aria-label="\u041E\u0442\u0432\u0435\u0442 ${item.id}"></label>`).join('');
    const saved = validSaved(getSaved(proto.id), proto);
    applySaved(proto, saved);
    renderNav();
    renderOverall();
    if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise([quiz]).catch(() => {});
  };
  const saveCloud = async (payload) => {
    if (!window.ogeSupabase || !cloudUser) return;
    try {
      // Берём свежие метаданные перед каждым сохранением, чтобы ответы
      // нескольких прототипов не перезаписывали друг друга.
      const { data } = await window.ogeSupabase.auth.getUser();
      const freshUser = data?.user || cloudUser;
      const current = freshUser.user_metadata?.trainer_progress || {};
      const ownedPayload = { ...payload, ownerId: freshUser.id };
      const next = {
        ...current,
        math: {
          ...(current.math || {}),
          task7: { ...(current.math?.task7 || {}), [ownedPayload.prototype]: ownedPayload },
        },
      };
      const { data: updated, error } = await window.ogeSupabase.auth.updateUser({ data: { trainer_progress: next } });
      if (error) throw error;
      cloudUser = updated?.user || { ...freshUser, user_metadata: { ...freshUser.user_metadata, trainer_progress: next } };
    } catch (error) {
      console.warn('Не удалось сохранить прогресс №7', error);
    }
  };
  const loadCloud = async () => {
    const requestRevision = ++loadCloudRevision;
    if (!window.ogeSupabase) {
      reset.disabled = false;
      return;
    }
    reset.disabled = true;
    try {
      const { data } = await window.ogeSupabase.auth.getSession();
      if (requestRevision !== loadCloudRevision) return;
      cloudUser = data?.session?.user || null;
      const proto = prototypeById.get(activeId);
      const selectedSaved = validSaved(getSaved(activeId), proto);
      if (selectedSaved) accountStorage?.write(storagePrefix, cloudUser?.id, activeId, selectedSaved);
      else accountStorage?.remove(storagePrefix, cloudUser?.id, activeId);
      render();
    } catch { /* offline mode keeps local progress */ }
    finally {
      if (requestRevision === loadCloudRevision) reset.disabled = false;
    }
  };
  const checkPrototype = async () => {
    const proto = prototypeById.get(activeId);
    const answers = {};
    const correctIds = [];
    const answeredIds = [];
    proto.items.forEach((item) => {
      const input = quiz.querySelector(`input[name="${item.id}"]`);
      const raw = input?.value || '';
      answers[item.id] = raw;
      if (raw.trim() !== '') answeredIds.push(item.id);
      if (normalize(raw) === normalize(item.answer)) correctIds.push(item.id);
    });
    const payload = { prototype: proto.id, answers, answeredIds, correctIds, score: correctIds.length, total: proto.items.length, savedAt: new Date().toISOString(), resetToken: getResetToken(proto.id) };
    accountStorage?.write(storagePrefix, cloudUser?.id, proto.id, payload);
    applySaved(proto, payload);
    renderNav();
    renderOverall();
    saveCloud(payload);
    if (typeof window.ym === 'function' && window.METRIKA_COUNTER_ID) window.ym(window.METRIKA_COUNTER_ID, 'reachGoal', 'MATH_TASK7_TEST');
  };
  const resetPrototype = async () => {
    const proto = prototypeById.get(activeId);
    if (!proto || !window.confirm(`Сбросить ответы типа ${proto.id}?`)) return;

    loadCloudRevision += 1;
    reset.disabled = true;
    submit.disabled = true;
    const resetToken = createResetToken();
    const resetKey = window.OgeProgressModel?.buildProgressResetKey(progressPath, proto.id);
    let syncFailed = false;

    accountStorage?.remove(storagePrefix, cloudUser?.id, proto.id);
    accountStorage?.write(resetStoragePrefix, cloudUser?.id, proto.id, { token: resetToken, pending: true });
    if (cloudUser && resetKey) {
      cloudUser = {
        ...cloudUser,
        user_metadata: { ...cloudUser.user_metadata, [resetKey]: resetToken },
      };
    }
    render();

    if (cloudUser && resetKey && window.ogeSupabase) {
      try {
        const { data: updated, error } = await window.ogeSupabase.auth.updateUser({ data: { [resetKey]: resetToken } });
        if (error) throw error;
        cloudUser = updated?.user || cloudUser;
        accountStorage?.write(resetStoragePrefix, cloudUser?.id, proto.id, { token: resetToken, pending: false });
      } catch (error) {
        syncFailed = true;
        console.warn('Не удалось синхронизировать сброс прогресса №7', error);
      }
    }

    note.textContent = syncFailed
      ? `Ответы типа ${proto.id} сброшены на этом устройстве. Синхронизация с аккаунтом не выполнена.`
      : `Ответы типа ${proto.id} сброшены.`;
    reset.disabled = false;
    submit.disabled = false;
  };
  submit.addEventListener('click', checkPrototype);
  reset.addEventListener('click', resetPrototype);
  quiz.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    checkPrototype();
  });
  window.addEventListener('oge-auth-ready', loadCloud);
  render();
  setTimeout(loadCloud, 700);
})();


