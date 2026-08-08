# Task 9 Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a complete task 9 OGE math trainer with 124 source-backed exercises and dashboard progress.

**Architecture:** Reuse the isolated static trainer pattern established by task 8. A Python importer creates one JavaScript data file per prototype; the task page renders, validates, and stores per-prototype progress locally and in Supabase; the student dashboard summarizes the same saved records.

**Tech Stack:** Python standard library, HTML, CSS, vanilla JavaScript, Supabase Auth metadata, MathJax, Python unittest, Node.js assertions, Playwright CLI.

## Global Constraints

- Source is `https://mathstart.ru/sources/FIPI_OGE_MATH/equations`.
- Dataset contains exactly 14 prototypes and 124 unique tasks, 9 per prototype.
- Enter checks the active prototype immediately.
- Answers never leak between prototypes or users.
- Dashboard task 9 colors and percentage use the same saved data as the trainer.
- Existing user-owned files and unrelated untracked previews remain untouched.

---

### Task 1: Data and page contracts

**Files:**
- Create: `tests/test_task9_data.py`
- Create: `tests/test_task9_page.py`
- Modify: `tests/progress-model.test.cjs`

**Interfaces:**
- Produces assertions for `window.OgeTask9DataPrototypes`, `ogeTrainer:v3:math:task9:`, `trainer_progress.math.task9`, and dashboard task 9 hooks.

- [ ] Write tests that require 14 prototypes, 124 unique items, source tasks and answers.
- [ ] Write tests that require the task 9 page, data scripts, Enter handling, local/cloud paths, navigation, and dashboard hooks.
- [ ] Run the tests and verify they fail because task 9 does not exist.

### Task 2: Source-backed dataset

**Files:**
- Create: `scripts/import-task9.py`
- Create: `study/math/part-one/task9-data-01.js` through `task9-data-14.js`

**Interfaces:**
- Produces `window.OgeTask9DataPrototypes`, each prototype shaped as `{id, title, source, items}` and each item as `{id, internalId, taskHtml, answer, answerHtml, format, analogNumber}`.

- [ ] Adapt the verified HTML and analog API parser to the equations route.
- [ ] Collect 9 unique tasks for each of 14 prototypes and reject duplicates.
- [ ] Run data tests and verify all 124 records pass.
- [ ] Commit the verified dataset.

### Task 3: Trainer page

**Files:**
- Create: `study/math/part-one/task9.html`
- Create: `study/math/part-one/task9.css`
- Create: `study/math/part-one/task9.js`
- Modify: `study/math/part-one/task8.html`

**Interfaces:**
- Consumes `window.OgeTask9DataPrototypes`.
- Produces local records keyed by `ogeTrainer:v3:math:task9:<prototype>` and cloud metadata at `trainer_progress.math.task9`.

- [ ] Copy the task 8 visual shell and replace only task-specific identifiers and text.
- [ ] Render 14 prototype tabs and 9 exercises per prototype.
- [ ] Implement Enter/click checking, strict per-prototype storage validation, MathJax rendering, and Supabase synchronization.
- [ ] Link task 9 from task 8 navigation.
- [ ] Run page contracts and verify they pass.

### Task 4: Dashboard progress

**Files:**
- Modify: `study/progress-model.js`
- Modify: `study/index.html`
- Modify: `study/study.css`
- Test: `tests/progress-model.test.cjs`

**Interfaces:**
- Produces `buildTask9Summary(storage, cloud)` with grouped segment counts and `percent = round(correct / 124 * 100)`.

- [ ] Add task 9 totals and summarization functions.
- [ ] Render grouped green/yellow/pink segments in bar 9 and print its percentage below the bar.
- [ ] Read both local task 9 keys and `user_metadata.trainer_progress.math.task9`.
- [ ] Run Node and Python progress contracts.

### Task 5: Browser verification and publication

**Files:**
- Verify: `study/math/part-one/task9.html`
- Verify: `study/index.html#progress`

**Interfaces:**
- Confirms the built trainer works in the browser and on GitHub Pages.

- [ ] Serve the worktree locally and open task 9 with Playwright CLI.
- [ ] Enter a correct answer in 9.1, press Enter, and verify the counter/color changes.
- [ ] Switch to 9.2 and verify fields are empty and storage remains prototype-specific.
- [ ] Verify desktop and 390 px mobile layouts and scan visible text for mojibake.
- [ ] Run all targeted tests, `git diff --check`, commit, fast-forward main, push, and verify live HTTP 200 responses.

