(() => {
  const script = document.currentScript;
  const studyRoot = new URL('../', script.src);
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('legal/legal.css', studyRoot).href;
  document.head.append(stylesheet);

  const render = () => {
    if (document.querySelector('[data-app-legal-footer]')) return;
    const footer = document.createElement('footer');
    footer.className = 'app-legal-footer';
    footer.dataset.appLegalFooter = '';
    footer.innerHTML = `
      <nav aria-label="Правовая информация">
        <a href="${new URL('legal/privacy.html', studyRoot).href}">Политика конфиденциальности</a>
        <span aria-hidden="true">·</span>
        <a href="${new URL('legal/offer.html', studyRoot).href}">Публичная оферта</a>
      </nav>`;
    document.body.append(footer);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render, { once: true });
  } else {
    render();
  }
})();
