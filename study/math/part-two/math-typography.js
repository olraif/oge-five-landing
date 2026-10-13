(() => {
  const superscripts = { '²': '2', '³': '3', '⁴': '4' };
  const isSuperscript = (char) => Object.hasOwn(superscripts, char);
  const isAtom = (char) => /[A-Za-z0-9·°αβπ₀-₉]/u.test(char) || isSuperscript(char);

  const matchingOpen = (text, end) => {
    const close = text[end];
    const open = close === ')' ? '(' : '[';
    let depth = 0;
    for (let index = end; index >= 0; index -= 1) {
      if (text[index] === close) depth += 1;
      else if (text[index] === open && --depth === 0) return index;
    }
    return -1;
  };
  const matchingClose = (text, start) => {
    const open = text[start];
    const close = open === '(' ? ')' : ']';
    let depth = 0;
    for (let index = start; index < text.length; index += 1) {
      if (text[index] === open) depth += 1;
      else if (text[index] === close && --depth === 0) return index + 1;
    }
    return -1;
  };

  const leftOperand = (text, slash) => {
    let start = slash - 1;
    if (start < 0) return null;
    while (isSuperscript(text[start])) start -= 1;
    if (text[start] === ')' || text[start] === ']') {
      start = matchingOpen(text, start);
      if (start < 0) return null;
      while (start > 0 && (isAtom(text[start - 1]) || text[start - 1] === ')')) {
        if (text[start - 1] === ')') start = matchingOpen(text, start - 1);
        else start -= 1;
        if (start < 0) return null;
      }
      if (start > 0 && text[start - 1] === '√') start -= 1;
    } else {
      while (start >= 0 && isAtom(text[start])) start -= 1;
      start += 1;
      const functionName = text.slice(0, start).match(/(?:sin|cos|tg|ctg)\s+$/u);
      if (functionName) start -= functionName[0].length;
    }
    if (start > 0 && /[−-]/u.test(text[start - 1])) start -= 1;
    return start < slash ? start : null;
  };

  const rightOperand = (text, slash) => {
    let end = slash + 1;
    if (end >= text.length) return null;
    if (text[end] === '|') {
      const close = text.indexOf('|', end + 1);
      return close < 0 ? null : close + 1;
    }
    if (text[end] === '√') {
      end += 1;
      if (text[end] === '(') return matchingClose(text, end);
      while (end < text.length && isAtom(text[end])) end += 1;
      return end;
    }
    if (text[end] === '(' || text[end] === '[') return matchingClose(text, end);
    if (/[−-]/u.test(text[end])) end += 1;
    while (end < text.length && isAtom(text[end])) end += 1;
    if (/\b(?:sin|cos|tg|ctg)$/u.test(text.slice(slash + 1, end))) {
      const argument = text.slice(end).match(/^\s+\d+°?/u);
      if (argument) end += argument[0].length;
    }
    return end > slash + 1 ? end : null;
  };

  const replaceRoots = (value, inline) => {
    let result = '';
    let cursor = 0;
    while (cursor < value.length) {
      const start = value.indexOf('√', cursor);
      if (start < 0) break;
      result += value.slice(cursor, start);
      let end = start + 1;
      if (value[end] === '(') end = matchingClose(value, end);
      else while (end < value.length && isAtom(value[end])) end += 1;
      if (end < 0 || end === start + 1) {
        result += '√';
        cursor = start + 1;
        continue;
      }
      const atom = value.slice(start + 1, end);
      const tex = `\\sqrt{${toTeX(unwrap(atom))}}`;
      result += inline ? `\\(${tex}\\)` : tex;
      cursor = end;
    }
    return result + value.slice(cursor);
  };
  const toTeX = (value) => replaceRoots(value, false)
    .replace(/[²³⁴]/gu, (char) => `^{${superscripts[char]}}`)
    .replace(/−/gu, '-')
    .replace(/·/gu, '\\cdot ')
    .replace(/≤/gu, '\\le ')
    .replace(/≥/gu, '\\ge ')
    .replace(/≠/gu, '\\ne ')
    .replace(/°/gu, '^{\\circ}')
    .replace(/∠/gu, '\\angle ')
    .replace(/[₀-₉]/gu, (char) => `_{${'₀₁₂₃₄₅₆₇₈₉'.indexOf(char)}}`)
    .replace(/\|([^|]+)\|/gu, (_, inside) => `\\lvert ${inside}\\rvert `)
    .replace(/\b(sin|cos|tg|ctg)\b/gu, (_, name) => `\\${name} `);
  const unwrap = (value) => {
    if ((value[0] === '(' || value[0] === '[')
      && matchingClose(value, 0) === value.length) return value.slice(1, -1);
    return value;
  };

  const fractions = (text, inline) => {
    let result = '';
    let cursor = 0;
    while (cursor < text.length) {
      const slash = text.indexOf('/', cursor);
      if (slash < 0) break;
      // Units such as км/ч and м/с are not mathematical division expressions.
      if (/[А-Яа-яЁё]/u.test(text[slash - 1] || '')
        || /[А-Яа-яЁё]/u.test(text[slash + 1] || '')) {
        result += text.slice(cursor, slash + 1);
        cursor = slash + 1;
        continue;
      }
      const start = leftOperand(text, slash);
      const end = rightOperand(text, slash);
      if (start === null || end === null || start < cursor || end < 0) {
        result += text.slice(cursor, slash + 1);
        cursor = slash + 1;
        continue;
      }
      result += text.slice(cursor, start);
      const fraction = `\\frac{${toTeX(unwrap(text.slice(start, slash)))}}{${toTeX(unwrap(text.slice(slash + 1, end)))}}`;
      result += inline ? `\\(${fraction}\\)` : fraction;
      cursor = end;
    }
    return result + text.slice(cursor);
  };

  const roots = (text) => replaceRoots(text, true);
  const inline = (text) => {
    const withNestedFraction = text.replace(/R=\((\(AM\+AN\)\/2−AT·cos∠A)\)\/sin∠A/gu,
      (_, numerator) => `\\(R=\\frac{${expression(numerator)}}{\\sin \\angle A}\\)`);
    return roots(fractions(withNestedFraction, true));
  };
  const expression = (text) => toTeX(fractions(text, false));

  const prompt = (text) => {
    const system = text.match(/^(Решите систему(?: уравнений)?):\s*(.+?);\s*(.+?)\.\s*(Запишите.*)$/u);
    if (system) {
      return `${system[1]}: \\[\\begin{cases}${expression(system[2])}\\\\${expression(system[3])}\\end{cases}\\] ${inline(system[4])}`;
    }
    const graph = text.match(/^(Постройте график(?: функции)?):?\s+(.+?)\.\s+(.+)$/u);
    if (graph && graph[2].includes('; y =')) {
      const branches = graph[2].split('; ').map((part) => part.match(/^y\s*=\s*(.+?)\s+при\s+(.+)$/u));
      if (branches.every(Boolean)) {
        const rows = branches.map((branch) => `${expression(branch[1])},&${expression(branch[2])}`).join('\\\\');
        return `${graph[1]} \\[y=\\begin{cases}${rows}\\end{cases}\\] ${inline(graph[3])}`;
      }
    }
    return inline(text);
  };

  const typeset = (node) => {
    const mathJax = window.MathJax;
    if (!mathJax?.startup?.promise) return Promise.resolve();
    return mathJax.startup.promise.then(() => mathJax.typesetPromise([node]));
  };

  const api = { inline, prompt, expression, typeset };
  if (typeof window !== 'undefined') window.OgeMathTypography = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
