(() => {
  const taskRoutes = Object.freeze({
    '1-5': '/study/math/part-one/task1-5.html#trainer',
    6: '/study/math/part-one/index.html#trainer',
    7: '/study/math/part-one/task7.html#trainer',
    8: '/study/math/part-one/task8.html#trainer',
    9: '/study/math/part-one/task9.html#trainer',
    10: '/study/math/part-one/task10.html#trainer',
    11: '/study/math/part-one/task11.html#trainer',
    12: '/study/math/part-one/task12.html#trainer',
    13: '/study/math/part-one/task13.html#trainer',
    14: '/study/math/part-one/task14.html#trainer',
    15: '/study/math/part-one/task15.html#trainer',
    16: '/study/math/part-one/task16.html#trainer',
    17: '/study/math/part-one/task17.html#trainer',
    18: '/study/math/part-one/task18.html#trainer',
    19: '/study/math/part-one/task19.html#trainer',
    20: '/study/math/part-two/algebra.html?task=20',
    21: '/study/math/part-two/algebra.html?task=21',
    22: '/study/math/part-two/algebra.html?task=22',
    23: '/study/math/part-two/geometry.html?task=23',
    24: '/study/math/part-two/geometry.html?task=24',
    25: '/study/math/part-two/geometry.html?task=25',
  });
  const courseForTask = (task) => task <= 19 || task === '1-5'
    ? 'math-first' : task <= 22 ? 'math-algebra' : 'math-geometry';
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
    document.querySelectorAll('.task-nav').forEach((nav) => {
      if (!nav.querySelector('a')) {
        const firstHeading = document.createElement('small');
        firstHeading.textContent = 'ЗАДАНИЯ 1–19';
        nav.append(firstHeading);
        const firstRange = document.createElement('a');
        firstRange.className = 'task-range-link';
        firstRange.textContent = '1–5';
        nav.append(firstRange);
        for (let number = 6; number <= 19; number += 1) {
          const link = document.createElement('a');
          link.textContent = String(number);
          nav.append(link);
        }
      }
      if (nav.querySelector('[data-second-part-task]')) return;
      const heading = document.createElement('small');
      heading.textContent = 'ЗАДАНИЯ 20–25';
      nav.append(heading);
      for (let number = 20; number <= 25; number += 1) {
        const link = document.createElement('a');
        link.textContent = String(number);
        link.dataset.secondPartTask = String(number);
        nav.append(link);
      }
      nav.setAttribute('aria-label', 'Задания 1–25');
    });
    document.querySelectorAll('.task-nav a').forEach((link) => {
      const label = link.textContent.trim().replace(/\s+/g, '');
      const taskKey = label === '1–5' || label === '1-5'
        ? '1-5'
        : Number.parseInt(label, 10);
      const route = taskRoutes[taskKey];
      if (route) {
        link.dataset.taskRoute = route;
        link.dataset.courseId = courseForTask(taskKey);
        link.removeAttribute('href');
        link.setAttribute('aria-disabled', 'true');
        link.tabIndex = -1;
        link.classList.add('is-access-locked');
        link.title = 'Доступ к этому блоку не активирован';
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

  const refreshAccess = async () => {
    if (!window.ogeGetEnrollmentIds) return;
    const result = await window.ogeGetEnrollmentIds();
    const active = result.error ? new Set() : new Set(result.data);
    document.querySelectorAll('.task-nav a[data-course-id]').forEach((link) => {
      const allowed = active.has(link.dataset.courseId);
      link.classList.toggle('is-access-locked', !allowed);
      link.setAttribute('aria-disabled', String(!allowed));
      if (allowed) {
        link.href = link.dataset.taskRoute;
        link.removeAttribute('tabindex');
        link.removeAttribute('title');
      } else {
        link.removeAttribute('href');
        link.tabIndex = -1;
        link.title = 'Доступ к этому блоку не активирован';
      }
    });
  };

  window.OgeTrainerNavigation = {
    taskRoutes,
    developmentMessage,
    initializeTrainerNavigation,
    refreshAccess,
    revealCurrentTaskOnMobile,
  };
  initializeTrainerNavigation();
  window.addEventListener('oge-auth-ready', refreshAccess);
})();
