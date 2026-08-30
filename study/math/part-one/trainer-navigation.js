(() => {
  const taskRoutes = Object.freeze({
    '1-5': 'task1-5.html#trainer',
    6: 'index.html#trainer',
    7: 'task7.html#trainer',
    8: 'task8.html#trainer',
    9: 'task9.html#trainer',
    10: 'task10.html#trainer',
    11: 'task11.html#trainer',
    12: 'task12.html#trainer',
    13: 'task13.html#trainer',
    14: 'task14.html#trainer',
    15: 'task15.html#trainer',
    16: 'task16.html#trainer',
    17: 'task17.html#trainer',
    18: 'task18.html#trainer',
    19: 'task19.html#trainer',
  });
  const developmentMessage = 'Задание ещё не загружено. Оно находится в разработке.';

  const showDevelopmentMessage = () => {
    let toast = document.querySelector('[data-trainer-development-toast]');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'trainer-development-toast';
      toast.dataset.trainerDevelopmentToast = '';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.append(toast);
    }
    toast.textContent = developmentMessage;
    toast.classList.add('is-visible');
    window.clearTimeout(showDevelopmentMessage.timeoutId);
    showDevelopmentMessage.timeoutId = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
  };

  const revealCurrentTaskOnMobile = () => {
    if (!window.matchMedia('(max-width: 720px)').matches) return;
    const strip = document.querySelector('.task-nav--sidebar');
    const current = strip?.querySelector('.is-current');
    if (!strip || !current) return;
    window.requestAnimationFrame(() => {
      const centered = current.offsetLeft - ((strip.clientWidth - current.offsetWidth) / 2);
      strip.scrollLeft = Math.max(0, centered);
    });
  };

  const initializeTrainerNavigation = () => {
    document.querySelectorAll('.task-nav a').forEach((link) => {
      const label = link.textContent.trim().replace(/\s+/g, '');
      const taskKey = label === '1–5' || label === '1-5'
        ? '1-5'
        : Number.parseInt(label, 10);
      const route = taskRoutes[taskKey];
      if (route) {
        link.href = route;
        link.classList.remove('is-unavailable');
        link.removeAttribute('title');
        return;
      }

      link.href = '#';
      link.classList.add('is-unavailable');
      link.title = developmentMessage;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        showDevelopmentMessage();
      });
    });
    revealCurrentTaskOnMobile();
  };

  window.OgeTrainerNavigation = {
    taskRoutes,
    developmentMessage,
    initializeTrainerNavigation,
  };
  initializeTrainerNavigation();
})();
