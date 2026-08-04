(() => {
  const prototypes = Array.isArray(window.OgeTask7DataPrototypes) ? window.OgeTask7DataPrototypes : [];
  const prototypeById = new Map(prototypes.map((item) => [item.id, item]));
  const prototypeNav = document.querySelector('[data-task7-prototypes]');
  const quiz = document.querySelector('[data-task7-quiz]');
  const submit = document.querySelector('[data-task7-submit]');
  const title = document.querySelector('[data-task7-title]');
  const score = document.querySelector('[data-task7-score]');
  const currentTotal = document.querySelector('[data-task7-current-total]');
  const total = document.querySelector('[data-task7-total]');
  const percent = document.querySelector('[data-task7-percent]');
  const note = document.querySelector('[data-task7-note]');
  const result = document.querySelector('[data-task7-result]');
  if (!prototypeNav || !quiz || !prototypes.length) return;

  const storagePrefix = 'ogeTrainer:v3:math:task7:';
  const cloudPath = ['trainer_progress', 'math', 'task7'];
  let activeId = new URLSearchParams(location.search).get('prototype') || prototypes[0].id;
  if (!prototypeById.has(activeId)) activeId = prototypes[0].id;
  let cloudUser = null;

  const normalize = (value) => String(value ?? '').trim().replace(/,/g, '.').replace(/\s+/g, '');
  const prepareTaskHtml = (value) => String(value ?? '').replace(/\$([^$]+)\$/g, (_, expression) => `\\(${expression}\\)`);
  const getSaved = (id) => {
    try { return JSON.parse(localStorage.getItem(storagePrefix + id) || 'null'); } catch { return null; }
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
    total.textContent = all.total;
    const value = all.total ? Math.round(all.correct / all.total * 100) : 0;
    percent.textContent = `${value}%`;
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
    note.textContent = saved ? `Проверено: ${saved.correctIds.length} верных ответов из ${proto.items.length}.` : 'Заполните задания и нажмите «Проверить прототип».';
  };
  const render = () => {
    const proto = prototypeById.get(activeId);
    title.textContent = `Прототип ${proto.id} · ${proto.title}`;
    quiz.innerHTML = proto.items.map((item) => `<label data-item-id="${item.id}" class="question-empty"><b>${item.id}</b><span>${prepareTaskHtml(item.taskHtml)}</span><input name="${item.id}" autocomplete="off" inputmode="decimal" aria-label="Ответ ${item.id}"></label>`).join('');
    const saved = validSaved(getSaved(proto.id), proto);
    applySaved(proto, saved);
    renderNav();
    renderOverall();
    if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise([quiz]).catch(() => {});
  };
  const saveCloud = async (payload) => {
    if (!window.ogeSupabase || !cloudUser) return;
    const current = cloudUser.user_metadata?.trainer_progress || {};
    const next = { ...current, math: { ...(current.math || {}), task7: { ...(current.math?.task7 || {}), [payload.prototype]: payload } } };
    try { await window.ogeSupabase.auth.updateUser({ data: { trainer_progress: next } }); } catch (error) { console.warn('Не удалось сохранить прогресс №7', error); }
  };
  const loadCloud = async () => {
    if (!window.ogeSupabase) return;
    try {
      const { data } = await window.ogeSupabase.auth.getSession();
      cloudUser = data?.session?.user || null;
      const cloudValue = cloudUser?.user_metadata?.trainer_progress?.math?.task7?.[activeId];
      const proto = prototypeById.get(activeId);
      const cloudSaved = validSaved(cloudValue, proto);
      if (cloudSaved) localStorage.setItem(storagePrefix + activeId, JSON.stringify(cloudSaved));
      render();
    } catch { /* offline mode keeps local progress */ }
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
    const payload = { prototype: proto.id, answers, answeredIds, correctIds, score: correctIds.length, total: proto.items.length, savedAt: new Date().toISOString() };
    localStorage.setItem(storagePrefix + proto.id, JSON.stringify(payload));
    applySaved(proto, payload);
    renderNav();
    renderOverall();
    saveCloud(payload);
    if (typeof window.ym === 'function' && window.METRIKA_COUNTER_ID) window.ym(window.METRIKA_COUNTER_ID, 'reachGoal', 'MATH_TASK7_TEST');
  };
  submit.addEventListener('click', checkPrototype);
  quiz.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    checkPrototype();
  });
  window.addEventListener('oge-auth-ready', loadCloud);
  render();
  setTimeout(loadCloud, 700);
})();
