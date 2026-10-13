(() => {
  const message = document.getElementById('math-hub-message');
  const check = async () => {
    if (!window.ogeGetEnrollmentIds) {
      message.textContent = 'Не удалось проверить доступ. Обновите страницу позже.';
      document.documentElement.style.visibility = '';
      return;
    }
    const result = await window.ogeGetEnrollmentIds();
    if (result.error) {
      message.textContent = 'Не удалось проверить доступ. Обновите страницу позже.';
      document.documentElement.style.visibility = '';
      return;
    }
    const active = new Set(result.data);
    if (!result.user || !['math-first', 'math-algebra', 'math-geometry'].some((id) => active.has(id))) {
      window.location.replace('/study/#courses');
      return;
    }
    document.querySelectorAll('[data-course-summary]').forEach((card) => {
      const open = active.has(card.dataset.courseSummary);
      card.classList.toggle('is-open', open);
      card.classList.toggle('is-locked', !open);
      card.querySelector('[data-course-status]').textContent = open ? 'Доступ открыт' : 'Доступ не активирован';
    });
    await window.OgeTrainerNavigation?.refreshAccess();
    message.textContent = 'Для закрытого блока активируйте его промокод в разделе «Мои тренажёры».';
    document.documentElement.style.visibility = '';
  };
  check();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  window.setInterval(check, 60000);
})();
