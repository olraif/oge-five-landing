# Task 6 Grouped Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Отобразить в общем прогрессе задания № 6 сгруппированные состояния всех аналогов 6.1–6.10 и процент правильных ответов.

**Architecture:** Чистый модуль `progress-model.js` превращает сохранённые попытки Supabase в десять групп цветных ячеек и общий процент. Тренажёр сохраняет полное количество заданий и считает прототип зелёным только при стопроцентном результате. Кабинет ученика строит специальный сегментированный столбик № 6 из результата чистого модуля.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node.js `assert`, Python `unittest` для существующих контрактов.

## Global Constraints

- Сохранять текущую палитру тренажёра: зелёный, жёлтый, бледно-розовый.
- Не показывать текст «освоен/не освоен» в общем прогрессе.
- Не менять структуру остальных заданий 1–5 и 7–25.
- Гость не получает прогресс зарегистрированного пользователя.

---

### Task 1: Модель сгруппированного прогресса

**Files:**
- Create: `study/progress-model.js`
- Create: `tests/progress-model.test.cjs`

**Interfaces:**
- Produces: `OgeProgressModel.buildTask6Summary(task6Progress)` с полями `prototypes`, `correct`, `wrong`, `untouched`, `total`, `percent`.

- [ ] **Step 1: Write the failing test**

Проверить литеральный пример: 6.1 содержит 8 правильных и 1 ошибочный ответ, 6.2 — 3 правильных, 1 ошибочный и 5 пустых; остальные прототипы пустые. Ожидать сгруппированные массивы цветов и `percent === 13` для 11 зелёных из 85.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/progress-model.test.cjs`
Expected: FAIL because `study/progress-model.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

Создать UMD-модуль с фиксированными размерами `{6.1:9, ..., 6.8:9, 6.9:6, 6.10:7}`. Непустые ответы сверх `score` считать жёлтыми, остаток — розовым. Цвета выдавать в порядке `green`, `yellow`, `pink` для последующей укладки снизу вверх.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/progress-model.test.cjs`
Expected: PASS.

### Task 2: Полное освоение прототипа в тренажёре

**Files:**
- Modify: `study/math/part-one/part-one.js`
- Test: `tests/progress-model.test.cjs`

**Interfaces:**
- Consumes: число правильных, непустые ответы и общее количество аналогов.
- Produces: зелёный статус только при `score === total`; жёлтый после начала работы; сохранённое поле `total`.

- [ ] **Step 1: Add a failing boundary test**

Проверить, что 8/9 не является полным результатом, а 9/9 является.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/progress-model.test.cjs`
Expected: FAIL on the mastery boundary.

- [ ] **Step 3: Implement the boundary**

Передавать ответы в `applyProgress`, заменить порог `5` на полное количество аналогов, убрать текст о пяти ответах и сохранять `total` в payload.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/progress-model.test.cjs`
Expected: PASS.

### Task 3: Сегментированный столбик и процент

**Files:**
- Modify: `study/index.html`
- Modify: `study/study.css`
- Modify: `tests/test_landing.py`

**Interfaces:**
- Consumes: `OgeProgressModel.buildTask6Summary`.
- Produces: десять участков внутри шестого столбика, сгруппированные микроячейки и подпись процента под номером 6.

- [ ] **Step 1: Add a failing integration contract**

Проверить подключение `progress-model.js`, наличие специального класса столбика № 6 и процентного элемента.

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_landing.LandingContractTests.test_task6_uses_grouped_cloud_progress`
Expected: FAIL because the grouped progress markup is absent.

- [ ] **Step 3: Implement rendering and styles**

Подключить модуль до основного inline-скрипта, построить десять групп `task6-progress-prototype`, добавить микроячейки трёх цветов и обновить процент. На сбросе показывать 0% и полностью розовый столбик.

- [ ] **Step 4: Verify targeted and full checks**

Run: `node tests/progress-model.test.cjs`
Run: `python -m unittest tests.test_landing.LandingContractTests.test_task6_uses_grouped_cloud_progress tests.test_landing.LandingContractTests.test_guest_access_does_not_inherit_browser_storage`
Run: `node --check study/progress-model.js`
Run: `node --check study/math/part-one/part-one.js`
Expected: all targeted checks pass.

- [ ] **Step 5: Publish**

Commit only the plan, tests, and changed production files; leave unrelated untracked PNG files untouched. Push `main` to `origin`.

