(() => {
  const config = window.OGE_SUPABASE;
  if (!config || !window.supabase?.createClient) return;

  const client = window.supabase.createClient(config.url, config.publishableKey);
  window.ogeSupabase = client;
  const progressModelUrl = new URL('./progress-model.js', document.currentScript?.src || location.href).href;
  let progressModelPromise = null;
  const loadProgressModel = () => {
    if (window.OgeProgressModel?.recordDailyProgress) return Promise.resolve(window.OgeProgressModel);
    if (!progressModelPromise) {
      progressModelPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = progressModelUrl;
        script.onload = () => window.OgeProgressModel?.recordDailyProgress ? resolve(window.OgeProgressModel) : reject(new Error('Модель прогресса не загрузилась'));
        script.onerror = () => reject(new Error('Модель прогресса недоступна'));
        document.head.append(script);
      });
    }
    return progressModelPromise;
  };
  const moscowDate = () => {
    const parts = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  };
  window.ogeSaveTrainerProgress = async (nextProgress, knownUser) => {
    const user = knownUser || (await client.auth.getUser()).data?.user;
    if (!user) return { data: null, error: new Error('AUTH_REQUIRED') };
    const previousHistory = user.user_metadata?.math_progress_history_v1 || {};
    let history;
    try {
      const model = await loadProgressModel();
      history = model.recordDailyProgress(
        previousHistory,
        user.user_metadata?.trainer_progress?.math || {},
        nextProgress?.math || {}, user, moscowDate(),
      );
    } catch (error) {
      console.warn('Не удалось обновить недельную аналитику', error);
      history = { ...previousHistory, incompleteSince: moscowDate() };
    }
    return client.auth.updateUser({ data: { trainer_progress: nextProgress, math_progress_history_v1: history } });
  };
  window.ogeGetEnrollmentIds = async () => {
    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData.session?.user || null;
    if (!user) return { data: [], error: null, user: null, trial: null, paidExpiry: null, paidExpiries: [] };
    const { data, error } = await client
      .from('enrollments')
      .select('course_id,expires_at')
      .eq('user_id', user.id);
    const activeEnrollments = (data || []).filter((row) => Date.parse(row.expires_at) > Date.now());
    const ids = activeEnrollments.map((row) => row.course_id);
    const paidExpiries = activeEnrollments.map((row) => row.expires_at);
    const paidExpiry = activeEnrollments.find((row) => row.course_id === 'math-first')?.expires_at || null;
    if (error || ids.includes('math-first')) {
      return { data: ids, error, user, trial: null, paidExpiry, paidExpiries };
    }
    const { data: trialRows, error: trialError } = await client.rpc('math_trial', { p_start: false });
    const trial = trialRows?.[0] || null;
    if (trial?.status === 'active') ids.push('math-first');
    // A temporary trial lookup failure must not close independently paid blocks.
    return { data: ids, error: ids.length ? null : trialError, user, trial, paidExpiry: null, paidExpiries };
  };
  window.ogeHasCourseAccess = async (courseId) => {
    const result = await window.ogeGetEnrollmentIds();
    return {
      data: Boolean(result.user && result.data.includes(courseId)),
      error: result.error,
      user: result.user,
      trialRemainingMs: courseId === 'math-first' && result.trial?.status === 'active'
        ? result.trial.remaining_seconds * 1000 : null,
      accessRemainingMs: courseId === 'math-first' && result.paidExpiry
        ? Math.max(0, Date.parse(result.paidExpiry) - Date.now())
        : courseId === 'math-first' && result.trial?.status === 'active'
          ? result.trial.remaining_seconds * 1000 : null,
    };
  };
  window.ogeStartMathTrial = async () => {
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) return { data: null, error: new Error('AUTH_REQUIRED') };
    const { data, error } = await client.rpc('math_trial', { p_start: true });
    return { data: data?.[0] || null, error };
  };
  window.ogeActivateCourseCode = async (code) => {
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) return { error: new Error('AUTH_REQUIRED') };
    const { data, error } = await client.rpc('activate_coupon', { p_code: code });
    return { data, error };
  };

  const applyUser = (user) => {
    const email = user?.email || '';
    const name = user?.user_metadata?.display_name || email.split('@')[0] || 'гость';
    window.ogeCurrentUser = user || null;
    document.documentElement.dataset.userId = user?.id || '';
    document.querySelectorAll('.student-badge strong').forEach((el) => { el.textContent = 'Кабинет ученика'; });
    document.querySelectorAll('.student-badge small').forEach((el) => { el.textContent = user ? email : 'гость'; });
    document.querySelectorAll('[data-auth-open]').forEach((el) => { el.textContent = user ? 'Выйти' : 'Войти'; });
    document.documentElement.dataset.authenticated = user ? 'true' : 'false';
    window.dispatchEvent(new CustomEvent('oge-auth-ready', { detail: { user } }));
  };

  const guardedMathPage = /^\/study\/math\/part-one\/(?:index\.html|task(?:1-5|[6-9]|1[0-9])\.html)?$/.test(window.location.pathname);
  let guardTimer;
  let guardRevision = 0;
  if (guardedMathPage) document.documentElement.style.visibility = 'hidden';
  const enforceMathAccess = async () => {
    if (!guardedMathPage) return;
    const revision = ++guardRevision;
    clearTimeout(guardTimer);
    const access = await window.ogeHasCourseAccess('math-first');
    if (revision !== guardRevision) return;
    if (access.error || !access.data) {
      window.location.replace('/study/#courses');
      return;
    }
    document.documentElement.style.visibility = '';
    if (access.accessRemainingMs !== null) {
      guardTimer = setTimeout(enforceMathAccess, Math.min(86400000, Math.max(1000, access.accessRemainingMs + 250)));
    }
  };

  client.auth.getSession().then(({ data }) => {
    applyUser(data.session?.user || null);
    enforceMathAccess();
  });
  client.auth.onAuthStateChange((_event, session) => {
    applyUser(session?.user || null);
    enforceMathAccess();
  });

  document.querySelectorAll('[data-auth-open]').forEach((button) => {
    button.addEventListener('click', async () => {
      const { data } = await client.auth.getSession();
      if (data.session) {
        await client.auth.signOut();
        return;
      }
      window.location.href = './login.html';
    });
  });
})();

