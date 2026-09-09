const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');

function loadCourseStateHandler(relativePath, handlerName) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const match = source.match(new RegExp(
    `const ${handlerName} = \\(card\\) => \\{([\\s\\S]*?)\\n      \\};`,
  ));
  assert.ok(match, `${handlerName} must exist in ${relativePath}`);
  return vm.runInNewContext(`(card) => {${match[1]}}`, {
    localStorage: { setItem() {} },
  });
}

function makeCard() {
  const classes = new Set(['is-locked']);
  const status = { textContent: 'доступ закрыт' };
  const description = {
    textContent: 'После активации доступа откроется тренажёр.',
    dataset: {
      lockedText: 'После активации доступа откроется тренажёр.',
      activeText: 'Тренажёр доступен.',
    },
  };
  return {
    dataset: { courseId: 'test-course' },
    classList: {
      add(...names) { names.forEach((name) => classes.add(name)); },
      remove(...names) { names.forEach((name) => classes.delete(name)); },
    },
    querySelector(selector) {
      if (selector === '.access-status') return status;
      if (selector === '[data-access-description]') return description;
      return null;
    },
    classes,
    status,
    description,
  };
}

for (const relativePath of ['study/index.html', 'study/informatics/index.html']) {
  const activateCourse = loadCourseStateHandler(relativePath, 'activateCourse');
  const card = makeCard();
  activateCourse(card);
  assert.equal(card.status.textContent, 'доступ открыт');
  assert.equal(card.description.textContent, card.description.dataset.activeText);
}

const lockCourse = loadCourseStateHandler('study/index.html', 'lockCourse');
const lockedCard = makeCard();
lockedCard.description.textContent = lockedCard.description.dataset.activeText;
lockCourse(lockedCard);
assert.equal(lockedCard.status.textContent, 'доступ закрыт');
assert.equal(lockedCard.description.textContent, lockedCard.description.dataset.lockedText);

console.log('course access copy: ok');
