(() => {
  const config = window.OGE_SUPABASE;
  if (!config || !window.supabase?.createClient) return;

  const client = window.supabase.createClient(config.url, config.publishableKey);
  window.ogeSupabase = client;
  window.ogeActivateCourseCode = async (code) => {
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) return { error: new Error('AUTH_REQUIRED') };
    const { data, error } = await client.rpc('activate_coupon', { p_code: code });
    return { data, error };
  };

  const applyUser = (user) => {
    const email = user?.email || '';
    const name = user?.user_metadata?.display_name || email.split('@')[0] || 'гость';
    document.querySelectorAll('.student-badge strong').forEach((el) => { el.textContent = 'Кабинет ученика'; });
    document.querySelectorAll('.student-badge small').forEach((el) => { el.textContent = user ? email : 'гость'; });
    document.querySelectorAll('[data-auth-open]').forEach((el) => { el.textContent = user ? 'Выйти' : 'Войти'; });
    document.documentElement.dataset.authenticated = user ? 'true' : 'false';
  };

  client.auth.getSession().then(({ data }) => applyUser(data.session?.user || null));
  client.auth.onAuthStateChange((_event, session) => applyUser(session?.user || null));

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
