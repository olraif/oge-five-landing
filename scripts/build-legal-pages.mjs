import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'docs', 'legal-drafts');
const outputDir = path.join(root, 'study', 'legal');

const documents = [
  ['01-privacy-policy.md', 'privacy.html', 'Политика'],
  ['02-personal-data-consent.md', 'consent.html', 'Согласие'],
  ['03-public-offer.md', 'offer.html', 'Оферта'],
  ['04-trainer-terms.md', 'terms.html', 'Правила'],
];

const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const inline = (value) => {
  let result = escapeHtml(value);
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/(^|\s)(olesy\.raif@mail\.ru)(?=$|[\s.,])/g, '$1<a href="mailto:$2">$2</a>');
  result = result.replace(/(^|\s)(https:\/\/oge-na-5\.ru\/?)(?=$|[\s.,])/g, '$1<a href="$2">$2</a>');
  return result;
};
const slug = (text, index) => `section-${index + 1}-${text.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 44)}`;

function markdownToDocument(markdown) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const title = lines.find((line) => line.startsWith('# '))?.slice(2).trim() || 'Документ';
  const revision = lines.find((line) => /^\*\*Редакция/.test(line))?.replaceAll('**', '') || 'Редакция 1.0 от 30 августа 2026 года';
  const sections = lines.filter((line) => line.startsWith('## ')).map((line, index) => ({ title: line.slice(3).trim(), id: slug(line.slice(3).trim(), index) }));
  let sectionIndex = 0;
  let body = '';
  let listType = null;
  let paragraph = [];
  const flushParagraph = () => {
    if (!paragraph.length) return;
    body += `<p>${inline(paragraph.join(' ').trim())}</p>\n`;
    paragraph = [];
  };
  const closeList = () => {
    if (!listType) return;
    body += `</${listType}>\n`;
    listType = null;
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '---') { flushParagraph(); closeList(); continue; }
    if (line.startsWith('# ')) continue;
    if (/^\*\*Редакция/.test(line)) continue;
    if (line.startsWith('> Рабочий черновик')) continue;
    if (line.startsWith('## ')) {
      flushParagraph(); closeList();
      const section = sections[sectionIndex++];
      body += `<h2 id="${section.id}">${inline(section.title)}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      flushParagraph(); closeList();
      body += `<h3>${inline(line.slice(4))}</h3>\n`;
      continue;
    }
    if (line.startsWith('> ')) {
      flushParagraph(); closeList();
      body += `<p class="legal-note">${inline(line.slice(2))}</p>\n`;
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)/);
    const ordered = line.match(/^\d+\.\s+(.+)/);
    if (bullet || ordered) {
      flushParagraph();
      const nextType = bullet ? 'ul' : 'ol';
      if (listType !== nextType) { closeList(); listType = nextType; body += `<${listType}>\n`; }
      body += `<li>${inline((bullet || ordered)[1])}</li>\n`;
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph(); closeList();
  return { title, revision, sections, body };
}

const navigation = (current = '') => `<nav class="legal-doc-nav" aria-label="Другие документы">
  ${documents.map(([, filename, label]) => `<a${filename === current ? ' aria-current="page"' : ''} href="./${filename}">${label}</a>`).join('\n  ')}
</nav>`;

function pageTemplate(document, filename) {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <title>${escapeHtml(document.title)} — ОГЭ-студия</title>
  <meta name="description" content="${escapeHtml(document.title)} онлайн-тренажёра ОГЭ-студия.">
  <link rel="stylesheet" href="./legal.css">
</head>
<body class="legal-page">
  <main class="legal-shell">
    <a class="legal-back" href="../login.html">← Вернуться к входу</a>
    <article class="legal-card">
      <p class="legal-kicker">ОГЭ-студия · документы</p>
      <h1>${escapeHtml(document.title)}</h1>
      <p class="legal-meta">${escapeHtml(document.revision)}</p>
      <nav class="legal-toc" aria-label="Содержание"><strong>Содержание</strong><ol>${document.sections.map((section) => `<li><a href="#${section.id}">${inline(section.title)}</a></li>`).join('')}</ol></nav>
      <div class="legal-body">${document.body}</div>
      ${navigation(filename)}
      <p class="legal-contact">Вопросы, отзыв согласия и обращения: <a href="mailto:olesy.raif@mail.ru">olesy.raif@mail.ru</a></p>
    </article>
  </main>
</body>
</html>
`;
}

fs.mkdirSync(outputDir, { recursive: true });
for (const [source, filename] of documents) {
  const markdown = fs.readFileSync(path.join(sourceDir, source), 'utf8');
  fs.writeFileSync(path.join(outputDir, filename), pageTemplate(markdownToDocument(markdown), filename), 'utf8');
}

const index = `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="index,follow"><title>Документы тренажёра — ОГЭ-студия</title><meta name="description" content="Документы, правила и контакты онлайн-тренажёра ОГЭ-студия."><link rel="stylesheet" href="./legal.css"></head>
<body class="legal-page"><main class="legal-shell"><a class="legal-back" href="../login.html">← Вернуться к входу</a><article class="legal-card"><p class="legal-kicker">ОГЭ-студия</p><h1>Документы тренажёра</h1><p class="legal-meta">Здесь собраны документы, относящиеся к регистрации, использованию тренажёра и покупке доступа.</p><div class="legal-index-grid"><a href="./privacy.html"><strong>Политика конфиденциальности</strong><span>Какие данные обрабатываются и как обратиться к оператору.</span></a><a href="./consent.html"><strong>Согласие на обработку данных</strong><span>Условия согласия, которое даётся при регистрации.</span></a><a href="./terms.html"><strong>Правила тренажёра</strong><span>Аккаунт, прогресс, промокоды и допустимое использование.</span></a><a href="./offer.html"><strong>Публичная оферта</strong><span>Условия платного доступа; акцептом является оплата.</span></a></div><p class="legal-note">Если тренажёром пользуется несовершеннолетний, необходимые решения и согласия принимает его законный представитель. Регистрироваться и учиться ребёнок может со своим email либо с email, доступ к которому обеспечивает представитель.</p><p class="legal-contact">Вопросы, отзыв согласия, удаление аккаунта, возвраты и претензии: <a href="mailto:olesy.raif@mail.ru">olesy.raif@mail.ru</a></p></article></main></body>
</html>
`;
fs.writeFileSync(path.join(outputDir, 'index.html'), index, 'utf8');

