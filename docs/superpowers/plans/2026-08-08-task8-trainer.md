# Task 8 Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить полный тренажёр задания №8 «Степени и корни» из 143 карточек банка ФИПИ/MathStart и связать его с персональным прогрессом ученика.

**Architecture:** №8 получает отдельную страницу и клиентский контроллер по проверенной схеме №7, но визуально повторяет отлажанный №6. Данные разделяются на 35 файлов по прототипам; ответы сохраняются локально и в `user_metadata.trainer_progress.math.task8`, а общий кабинет строит сгруппированный столбец №8 через `OgeProgressModel`.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, MathJax 3, Supabase Auth user metadata, Node.js contract tests, Python `unittest`, GitHub Pages.

## Global Constraints

- Полный набор: ровно 143 задания, распределённые по 35 прототипам `8.1`–`8.35`.
- Источник структуры и карточек: `https://mathstart.ru/sources/FIPI_OGE_MATH/powers`, банк ФИПИ.
- Цвета: зелёный — верно, жёлтый — ошибка, бледно-розовый — не решено.
- Enter немедленно проверяет выбранный прототип.
- Динамические русские строки записываются безопасно для UTF-8; битая кириллица недопустима.
- Состояние гостя не должно открывать доступ или попадать в кабинет другого ученика.
- Не добавлять зависимости и не изменять несвязанные пользовательские файлы.

---

### Task 1: Полный набор данных №8

**Files:**
- Create: `scripts/import-task8.py`
- Create: `study/math/part-one/task8-data-01.js` … `study/math/part-one/task8-data-35.js`
- Create: `tests/test_task8_data.py`

**Interfaces:**
- Consumes: публичные HTML-карточки MathStart и `/api/analog/FIPI_OGE_MATH/powers/{parent_id}/{current_id}`.
- Produces: `window.OgeTask8DataPrototypes: Array<{id:string,title:string,items:Array<{id:string,taskHtml:string,answer:string}>}>`.

- [ ] **Step 1: Write the failing dataset contract test**

```python
import json, re, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "study" / "math" / "part-one"

class Task8DataTests(unittest.TestCase):
    def test_full_task8_bank(self):
        files = sorted(DATA_DIR.glob("task8-data-*.js"))
        self.assertEqual(len(files), 35)
        joined = "\n".join(p.read_text(encoding="utf-8") for p in files)
        ids = re.findall(r"id:\s*['\"](8\.\d+\.\d+)['\"]", joined)
        self.assertEqual(len(ids), 143)
        self.assertEqual(len(set(ids)), 143)
        for number in range(1, 36):
            self.assertRegex(joined, rf"id:\s*['\"]8\.{number}['\"]")
        self.assertNotIn("РЎ", joined)
        self.assertNotIn("Рџ", joined)

if __name__ == "__main__": unittest.main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_task8_data -v`

Expected: FAIL because no `task8-data-*.js` files exist.

- [ ] **Step 3: Implement the importer**

`scripts/import-task8.py` must use `urllib.request` and `html.parser` only. It must:

```python
SOURCE = "https://mathstart.ru/sources/FIPI_OGE_MATH/powers"
ANALOG = "https://mathstart.ru/api/analog/FIPI_OGE_MATH/powers/{parent}/{current}"
EXPECTED_PROTOTYPES = 35
EXPECTED_ITEMS = 143
```

Parse each base `<article class="problem">` into `parent_id`, `task_html`, `answer_value`; repeatedly request analogs while adding unseen `internal_id` values. Stop a prototype only after every known analogue has been collected and repeated requests produce no new ID; abort unless final totals are exactly 35 prototypes and 143 unique items. Emit one UTF-8 JavaScript file per prototype with stable IDs `8.N.M`, JSON-escaped HTML and normalized string answers. Append each prototype to `window.OgeTask8DataPrototypes` without overwriting earlier files.

- [ ] **Step 4: Generate all data files**

Run: `python scripts/import-task8.py`

Expected: `Generated 35 prototypes, 143 items` and files `task8-data-01.js` through `task8-data-35.js`.

- [ ] **Step 5: Run dataset test**

Run: `python -m unittest tests.test_task8_data -v`

Expected: PASS.

- [ ] **Step 6: Commit the dataset**

```bash
git add scripts/import-task8.py tests/test_task8_data.py study/math/part-one/task8-data-*.js
git commit -m "Add complete task 8 FIPI dataset"
```

---

### Task 2: Экран и проверка ответов №8

**Files:**
- Create: `study/math/part-one/task8.html`
- Create: `study/math/part-one/task8.css`
- Create: `study/math/part-one/task8.js`
- Create: `tests/test_task8_page.py`
- Modify: `study/math/part-one/index.html`
- Modify: `study/math/part-one/task7.html`

**Interfaces:**
- Consumes: `window.OgeTask8DataPrototypes` from Task 1 and `window.ogeSupabase` from `auth-session.js`.
- Produces: local keys `ogeTrainer:v3:math:task8:{prototype}` and cloud records `trainer_progress.math.task8[prototype]` with `{prototype,answers,answeredIds,correctIds,score,total,savedAt}`.

- [ ] **Step 1: Write the failing page contract test**

```python
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class Task8PageTests(unittest.TestCase):
    def test_page_contract(self):
        html = (ROOT / "study/math/part-one/task8.html").read_text(encoding="utf-8")
        js = (ROOT / "study/math/part-one/task8.js").read_text(encoding="utf-8")
        self.assertIn('data-task8-prototypes', html)
        self.assertIn('data-task8-quiz', html)
        self.assertIn('href="../../index.html#progress"', html)
        self.assertEqual(html.count('task8-data-'), 35)
        self.assertIn("ogeTrainer:v3:math:task8:", js)
        self.assertIn("trainer_progress", js)
        self.assertIn("task8", js)
        self.assertIn("event.key !== 'Enter'", js)
        self.assertNotIn("ОГЭ-студия", html)

if __name__ == "__main__": unittest.main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_task8_page -v`

Expected: FAIL because `task8.html` and `task8.js` do not exist.

- [ ] **Step 3: Build task8.html**

Use the structural markup of `task7.html`, but keep only the №6-style sidebar, compact task buttons 1–19, active button 8, `Мой прогресс`, prototype strip, quiz rows and compact score. Include `task8-data-01.js` … `task8-data-35.js` in numeric order before `task8.js`. Links 6 and 7 must point to `index.html#trainer` and `task7.html`; button 8 stays current.

- [ ] **Step 4: Build task8.css**

Start from the compact visual rules used by №6: five task buttons per row, 28px task button height, white panel, 35-prototype responsive strip, green/yellow/pink rows, compact neutral score area, no top bar and no 143-card summary tile.

- [ ] **Step 5: Build task8.js**

Implement these exact helpers:

```javascript
const normalize = value => String(value ?? '').trim().replace(/,/g, '.').replace(/\s+/g, '').toLowerCase();
const validSaved = (saved, proto) => { /* filter IDs to proto.items and recompute score */ };
const prototypeState = proto => { /* green only if every item is correct; yellow if answered; pink otherwise */ };
const checkPrototype = async () => { /* compare, save local, repaint, then save Supabase */ };
```

Render MathStart `$...$` formula fragments as MathJax `\(...\)`. On Enter prevent form submission and call `checkPrototype()`. Before each cloud write call `auth.getUser()` and merge only `task8[payload.prototype]`, preserving tasks 6, 7 and other prototypes. On load, accept cloud data only for an authenticated user and only after `validSaved` filters it against the active prototype.

- [ ] **Step 6: Link task 8 from existing pages**

Change every task button 8 in `index.html` and `task7.html` from `index.html#trainer`/`#trainer` to `task8.html`. Do not change task 6 or task 7 destinations.

- [ ] **Step 7: Run page and dataset tests**

Run: `python -m unittest tests.test_task8_page tests.test_task8_data -v`

Expected: PASS.

- [ ] **Step 8: Check JavaScript syntax**

Run: `node --check study/math/part-one/task8.js`

Expected: no output, exit code 0.

- [ ] **Step 9: Commit the trainer screen**

```bash
git add study/math/part-one/task8.html study/math/part-one/task8.css study/math/part-one/task8.js study/math/part-one/index.html study/math/part-one/task7.html tests/test_task8_page.py
git commit -m "Build task 8 trainer interface"
```

---

### Task 3: Общая диаграмма прогресса №8

**Files:**
- Modify: `study/progress-model.js`
- Modify: `study/index.html`
- Modify: `study/study.css`
- Modify: `tests/progress-model.test.cjs`
- Create: `tests/test_task8_progress_contract.py`

**Interfaces:**
- Consumes: `trainer_progress.math.task8` records from Task 2.
- Produces: `TASK8_TOTALS`, `summarizeTask8Prototype(key, attempt)`, `buildTask8Summary(task8Progress)` and rendered `[data-task8-stack]`/`[data-task8-percent]`.

- [ ] **Step 1: Add failing model assertions**

Extend `tests/progress-model.test.cjs`:

```javascript
const { TASK8_TOTALS, buildTask8Summary } = require(modelPath);
assert.equal(Object.keys(TASK8_TOTALS).length, 35);
assert.equal(Object.values(TASK8_TOTALS).reduce((a, b) => a + b, 0), 143);
const task8 = buildTask8Summary({
  '8.1': { correctIds: ['8.1.1'], answeredIds: ['8.1.1', '8.1.2'] },
});
assert.equal(task8.correct, 1);
assert.equal(task8.wrong, 1);
assert.equal(task8.untouched, 141);
assert.equal(task8.percent, 1);
```

- [ ] **Step 2: Add failing dashboard contract**

`tests/test_task8_progress_contract.py` must assert `bar--task8`, `data-task8-stack`, `data-task8-percent`, `buildTask8Summary`, `trainer_progress?.math?.task8`, and the three task8 cell color classes exist.

- [ ] **Step 3: Run tests to verify they fail**

Run: `node tests/progress-model.test.cjs` and `python -m unittest tests.test_task8_progress_contract -v`

Expected: FAIL because task8 model and dashboard rendering do not exist.

- [ ] **Step 4: Implement model functions**

Add the exact 35 totals generated from the dataset files as immutable `TASK8_TOTALS`. `summarizeTask8Prototype` mirrors task7’s `correctIds`/`answeredIds` calculation. `buildTask8Summary` groups cells green, yellow, pink and calculates `Math.round(correct / 143 * 100)`.

- [ ] **Step 5: Render bar 8 in the student cabinet**

Add bar 8 beside bars 6 and 7. `renderTask8Progress` must create one group per prototype, append green cells first, then yellow, then pink, and place the percentage directly below number 8. Load only `user.user_metadata?.trainer_progress?.math?.task8 || {}`.

- [ ] **Step 6: Add task8 grouped-cell CSS**

Add `.task8-progress-prototype{display:contents}` and green/yellow/pink ordered cell rules matching task6/task7 dimensions. Preserve the pale background for untouched portions.

- [ ] **Step 7: Run progress tests**

Run: `node tests/progress-model.test.cjs` and `python -m unittest tests.test_task8_progress_contract -v`

Expected: PASS.

- [ ] **Step 8: Commit progress integration**

```bash
git add study/progress-model.js study/index.html study/study.css tests/progress-model.test.cjs tests/test_task8_progress_contract.py
git commit -m "Connect task 8 to student progress"
```

---

### Task 4: Сквозная проверка и публикация

**Files:**
- Modify only if a verification failure identifies a task8 defect.

**Interfaces:**
- Consumes: completed trainer, data and progress integration.
- Produces: verified GitHub Pages deployment.

- [ ] **Step 1: Run the complete local test suite**

Run: `node tests/progress-model.test.cjs`, `python -m unittest discover -s tests -p "test_*.py" -v`, and `node --check study/math/part-one/task8.js`.

Expected: all tests PASS and JavaScript syntax check exits 0.

- [ ] **Step 2: Run static encoding and link checks**

Run `rg` for common mojibake fragments (`РЎ`, `Рџ`, `вЂ`) in task8 files; expected no matches. Verify all task 8 links target `task8.html` and no other task number was redirected.

- [ ] **Step 3: Test in a browser**

Open task8 as a signed-in student. Verify prototype switching, correct/wrong/empty colors, Enter checking, reload persistence, cloud persistence, navigation to «Мой прогресс», and grouped bar 8. Sign out and verify guest data does not expose the student’s progress.

- [ ] **Step 4: Commit any verification fixes**

```bash
git add <only files changed by verification fixes>
git commit -m "Fix task 8 verification issues"
```

- [ ] **Step 5: Publish**

Run: `git push origin main`.

Expected: GitHub Pages build succeeds for the pushed commit.

- [ ] **Step 6: Verify production**

Open `https://oge-na-5.ru/study/math/part-one/task8.html`, repeat one answer check, reload, then open `https://oge-na-5.ru/study/index.html#progress`. Confirm live files match the pushed commit and bar 8 reflects the saved result before reporting completion.

