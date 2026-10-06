(() => {
  const config = window.OGE_SUPABASE;
  if (!config || !window.supabase?.createClient) return;

  const client = window.supabase.createClient(config.url, config.publishableKey);
  window.ogeSupabase = client;
  window.ogeGetEnrollmentIds = async () => {
    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData.session?.user || null;
    if (!user) return { data: [], error: null, user: null, trial: null };
    const { data, error } = await client
      .from('enrollments')
      .select('course_id')
      .eq('user_id', user.id);
    const ids = (data || []).map((row) => row.course_id);
    if (error || ids.includes('math-first')) {
      return { data: ids, error, user, trial: null };
    }
    const { data: trialRows, error: trialError } = await client.rpc('math_trial', { p_start: false });
    const trial = trialRows?.[0] || null;
    if (trial?.status === 'active') ids.push('math-first');
    return { data: ids, error: trialError, user, trial };
  };
  window.ogeHasCourseAccess = async (courseId) => {
    const result = await window.ogeGetEnrollmentIds();
    return {
      data: Boolean(result.user && result.data.includes(courseId)),
      error: result.error,
      user: result.user,
      trialRemainingMs: courseId === 'math-first' && result.trial?.status === 'active'
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
    if (access.trialRemainingMs !== null) {
      guardTimer = setTimeout(enforceMathAccess, Math.max(1000, access.trialRemainingMs + 250));
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

