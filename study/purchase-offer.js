(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (!root?.document) return;
  const start = () => api.init(root.document, root);
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const setContactEnabled = (links, enabled) => {
    links.forEach((link) => {
      link.setAttribute('aria-disabled', String(!enabled));
      link.setAttribute('tabindex', enabled ? '0' : '-1');
      link.classList.toggle('is-disabled', !enabled);
    });
  };

  const init = (document, window) => {
    const dialog = document.querySelector('[data-purchase-dialog]');
    if (!dialog) return null;

    const triggers = [...document.querySelectorAll('[data-purchase-open]')];
    const checkbox = dialog.querySelector('[data-purchase-accept]');
    const selection = dialog.querySelector('[data-purchase-selection]');
    const closeButton = dialog.querySelector('[data-purchase-close]');
    const contactLinks = [...dialog.querySelectorAll('[data-purchase-contact]')];
    if (!checkbox || !selection || !closeButton || !contactLinks.length) return null;

    const reset = () => {
      checkbox.checked = false;
      setContactEnabled(contactLinks, false);
    };
    const close = () => {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      reset();
    };
    const open = (trigger) => {
      reset();
      selection.textContent = trigger.dataset.purchaseLabel || trigger.textContent.trim();
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      checkbox.focus();
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        open(trigger);
      });
    });
    checkbox.addEventListener('change', () => setContactEnabled(contactLinks, checkbox.checked));
    closeButton.addEventListener('click', close);
    contactLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        if (!checkbox.checked) {
          event.preventDefault();
          return;
        }
        close();
      });
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) close();
    });
    dialog.addEventListener('close', reset);
    setContactEnabled(contactLinks, false);

    return { open, close, reset };
  };

  return { init, setContactEnabled };
});
