# Trainer Legal Documents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Опубликовать юридические документы внутри автономного тренажёра и связать их с регистрацией, активацией промокода и покупкой без изменения рекламного текста сайта.

**Architecture:** Пять статических общедоступных HTML-страниц используют один `legal.css`. На рабочих страницах тренажёра общий ненавязчивый футер создаёт `legal-footer.js`, который вычисляет путь `/study/` по собственному URL. Регистрация передаёт версии двух принятых документов в метаданные пользователя, а SQL-триггер фиксирует их в профиле серверным временем.

**Tech Stack:** статические HTML/CSS/JavaScript, Supabase Auth/PostgreSQL, Python unittest, Playwright CLI.

**Spec:** `docs/superpowers/specs/2026-09-05-trainer-legal-placement.md`

## Global Constraints

- Юридические ссылки не добавляются на рекламную страницу.
- Документы доступны без авторизации и не ведут на рекламную страницу.
- Два регистрационных флажка изначально пусты и показываются только при регистрации.
- Оферта принимается оплатой, а не регистрацией.
- Метрика временно отключена; вход, промокоды и прогресс не изменяются.

---

### Task 1: Контрактные тесты

**Files:**
- Create: `tests/test_legal_flow.py`

**Interfaces:**
- Produces: проверки публичных документов, регистрации, футера, покупки, активации и отключённой аналитики.

- [x] **Step 1: Write the failing tests**

Проверить существование пяти страниц, отсутствие авторизационных скриптов в документах, два обязательных флажка, версии `1.0`, подключение футера ко всем страницам кабинета, ссылку на оферту возле покупки, условия возле активации и отсутствие `mc.yandex.ru` в HTML.

- [x] **Step 2: Run tests to verify they fail**

Run: `python -m unittest tests.test_legal_flow -v`
Expected: FAIL because pages and controls do not exist and Metrika is active.

### Task 2: Публичные страницы и общий футер

**Files:**
- Create: `study/legal/index.html`
- Create: `study/legal/privacy.html`
- Create: `study/legal/consent.html`
- Create: `study/legal/offer.html`
- Create: `study/legal/terms.html`
- Create: `study/legal/legal.css`
- Create: `study/legal/legal-footer.js`
- Modify: `study/login.html`, `study/admin.html`, `study/index.html`, `study/informatics/index.html`, `study/math/part-one/*.html`

**Interfaces:**
- Produces: `<script src=".../legal/legal-footer.js" data-study-root="...">` and a footer with links to `privacy.html` and `index.html`.

- [x] **Step 1: Convert the four approved Markdown drafts to semantic static HTML**
- [x] **Step 2: Add the shared document index, styles and footer script**
- [x] **Step 3: Connect the footer to login, cabinet, admin and every trainer page**
- [x] **Step 4: Run `python -m unittest tests.test_legal_flow -v` and verify the page/footer tests pass**

### Task 3: Регистрация и фиксация согласий

**Files:**
- Modify: `study/login.html`
- Modify: `study/auth.css`
- Modify: `supabase/schema.sql`
- Create: `supabase/migrations/20260905_legal_acceptances.sql`

**Interfaces:**
- Consumes: versions `consent_version=1.0`, `terms_version=1.0` from registration metadata.
- Produces: profile fields `consent_accepted_at`, `consent_version`, `terms_accepted_at`, `terms_version` populated by `public.handle_new_user()` with `now()`.

- [x] **Step 1: Add two hidden-in-login required checkboxes and accessible document links**
- [x] **Step 2: Pass acceptance flags and document versions only during `signUp`**
- [x] **Step 3: Add idempotent SQL columns and update the new-user trigger**
- [x] **Step 4: Run the legal contract tests**

### Task 4: Покупка и активация

**Files:**
- Modify: `study/index.html`
- Modify: `study/informatics/index.html`
- Modify: `study/study.css`

**Interfaces:**
- Produces: offer links next to purchase actions and terms/minor notice inside every activation form.

- [x] **Step 1: Add the offer link to each pricing/purchase block**
- [x] **Step 2: Add one-time binding, 24-month term and minor-representative text to activation forms**
- [x] **Step 3: Run the legal contract tests**

### Task 5: Отключение аналитики, полная проверка и публикация

**Files:**
- Modify: `index.html`, `study/index.html`, `study/informatics/index.html`, `study/math/part-one/index.html`

**Interfaces:**
- Produces: no active Yandex Metrika loader or noscript pixel on published HTML.

- [x] **Step 1: Remove the four active Metrika snippets without touching functional scripts**
- [x] **Step 2: Run targeted legal tests, existing unaffected tests and `git diff --check`**
- [x] **Step 3: Use Playwright at desktop and mobile widths to inspect registration and a legal page**
- [ ] **Step 4: Commit, integrate into `main`, push, wait for GitHub Pages and verify the live URLs**
