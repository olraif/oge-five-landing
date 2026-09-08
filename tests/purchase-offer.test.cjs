const assert = require('node:assert/strict');
const path = require('node:path');

const purchaseOffer = require(path.join(__dirname, '..', 'study', 'purchase-offer.js'));

const fakeLink = () => {
  const attributes = new Map();
  return {
    classList: {
      values: new Set(),
      toggle(name, enabled) {
        if (enabled) this.values.add(name);
        else this.values.delete(name);
      },
      contains(name) { return this.values.has(name); },
    },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    removeAttribute(name) { attributes.delete(name); },
    getAttribute(name) { return attributes.get(name); },
  };
};

const links = [fakeLink(), fakeLink()];
purchaseOffer.setContactEnabled(links, false);
for (const link of links) {
  assert.equal(link.getAttribute('aria-disabled'), 'true');
  assert.equal(link.getAttribute('tabindex'), '-1');
  assert.equal(link.classList.contains('is-disabled'), true);
}

purchaseOffer.setContactEnabled(links, true);
for (const link of links) {
  assert.equal(link.getAttribute('aria-disabled'), 'false');
  assert.equal(link.getAttribute('tabindex'), '0');
  assert.equal(link.classList.contains('is-disabled'), false);
}

console.log('purchase offer state: ok');
