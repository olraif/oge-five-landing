(() => {
  const ns = 'http://www.w3.org/2000/svg';
  const svgElement = (tag, attributes = {}) => {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
    return node;
  };

  const curve = (kind, p, x) => {
    switch (kind) {
      case 1: return x < 0 ? x + p.lineShift : (x - 1) ** 2;
      case 2: return x < 0 ? -p.numerator / x : (x - p.vertexX) ** 2;
      case 3: return x < -1 ? -p / x : x * x + p;
      case 4: return x < 0 ? x : x <= p ? 2 * p - x : x;
      case 5: return (x + p.a) * (x - p.b);
      case 6: return -x * x - p.c;
      case 7: return x * Math.abs(x);
      case 8: return (x + p.a) ** 2 - p.c * Math.abs(x + p.a) + p.d;
      case 9: return Math.abs(x) * (x - p.a) - p.b * x;
      case 10: return x * Math.abs(x) + p.c * Math.abs(x) - p.d * x;
      case 11: return Math.abs(x * x + p.b * x + p.c);
      case 12: return p.c - 1 / x;
      case 13: return 1 / x;
      case 14: return -1 / Math.abs(x);
      case 15: return p.scale * Math.max(x / p.a, p.a / x);
      default: return NaN;
    }
  };

  const specialPoints = (kind, p) => {
    switch (kind) {
      case 1: case 2: case 9: case 10: return { breaks: [0], holes: [] };
      case 3: return { breaks: [-1], holes: [] };
      case 4: return { breaks: [0, p], holes: [] };
      case 5: return { breaks: [-p.b, p.a], holes: [-p.b, p.a] };
      case 6: return { breaks: [p.a], holes: [p.a] };
      case 7: return { breaks: [-p, 0], holes: [-p] };
      case 8: return { breaks: [-p.a], holes: [] };
      case 11: return { breaks: [], holes: [] };
      case 12: return { breaks: [-p.a, 0], holes: [-p.a] };
      case 13: return { breaks: [0, p.q / p.p], holes: [p.q / p.p] };
      case 14: return { breaks: [-1 / p, 0, 1 / p], holes: [-1 / p, 1 / p] };
      case 15: return { breaks: [-p.a, 0, p.a], holes: [] };
      default: return { breaks: [], holes: [] };
    }
  };

  const boundaryPoints = (kind, p) => {
    switch (kind) {
      case 1: return { open: [[0, p.lineShift]], closed: [[0, 1]] };
      case 2: return { open: [], closed: [[0, p.vertexX ** 2]] };
      case 3: return { open: [[-1, p]], closed: [[-1, p + 1]] };
      case 4: return { open: [[0, 0]], closed: [[0, 2 * p], [p, p]] };
      default: return { open: [], closed: [] };
    }
  };

  const render = ({ kind, parameters: p }) => {
    const frame = document.createElement('figure');
    frame.className = 'task__graph-preview';
    const caption = document.createElement('figcaption');
    caption.textContent = 'Эскиз графика для самопроверки';
    const svg = svgElement('svg', {
      viewBox: '0 0 360 246', role: 'img',
      'aria-label': 'График функции по условию задания, с осями координат и выколотыми точками',
    });
    frame.append(caption, svg);
    const xMax = kind === 1 ? 4 : kind === 2 ? Math.max(5, p.vertexX + 2)
      : kind === 3 ? 4 : kind === 4 ? 2 * p + 1
        : Math.max(6, kind === 15 ? 2 * p.a + 2 : kind === 5 ? Math.max(p.a, p.b) + 3
          : kind === 8 ? p.a + p.c + 1 : kind === 13 ? 2 * p.q / p.p + 2 : 7);
    const { breaks, holes } = specialPoints(kind, p);
    const edges = [-xMax, ...breaks.filter((x) => x > -xMax && x < xMax).sort((a, b) => a - b), xMax];
    const values = [];
    for (let i = 0; i < 500; i += 1) {
      const x = -xMax + 2 * xMax * (i + 0.5) / 500;
      const y = curve(kind, p, x);
      if (Number.isFinite(y)) values.push(Math.abs(y));
    }
    values.sort((a, b) => a - b);
    const yMax = Math.min(55, Math.max(5, Math.ceil((values[Math.floor(values.length * 0.9)] || 5) * 1.15)));
    const left = 30; const right = 348; const top = 12; const bottom = 224;
    const sx = (x) => left + (x + xMax) * (right - left) / (2 * xMax);
    const sy = (y) => bottom - (y + yMax) * (bottom - top) / (2 * yMax);

    svg.append(svgElement('rect', { x: left, y: top, width: right - left, height: bottom - top, fill: '#fbfcff', stroke: '#dce5f5', rx: 8 }));
    for (const fraction of [-1, -0.5, 0, 0.5, 1]) {
      const x = sx(fraction * xMax); const y = sy(fraction * yMax);
      svg.append(svgElement('line', { x1: x, y1: top, x2: x, y2: bottom, stroke: fraction === 0 ? '#8396bd' : '#e9eef8', 'stroke-width': fraction === 0 ? 1.5 : 1 }));
      svg.append(svgElement('line', { x1: left, y1: y, x2: right, y2: y, stroke: fraction === 0 ? '#8396bd' : '#e9eef8', 'stroke-width': fraction === 0 ? 1.5 : 1 }));
    }
    const xLabel = svgElement('text', { x: right - 10, y: sy(0) - 6, fill: '#536587', 'font-size': 12 });
    xLabel.textContent = 'x'; svg.append(xLabel);
    const yLabel = svgElement('text', { x: sx(0) + 7, y: top + 16, fill: '#536587', 'font-size': 12 });
    yLabel.textContent = 'y'; svg.append(yLabel);

    for (let part = 0; part < edges.length - 1; part += 1) {
      const start = edges[part]; const end = edges[part + 1];
      if (end - start < 0.0001) continue;
      let path = '';
      let drawing = false;
      for (let i = 0; i <= 180; i += 1) {
        const x = start + (end - start) * (i + 0.02) / 180.04;
        const y = curve(kind, p, x);
        if (!Number.isFinite(y) || Math.abs(y) > yMax) { drawing = false; continue; }
        path += `${drawing ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)} `;
        drawing = true;
      }
      if (path) svg.append(svgElement('path', { d: path, fill: 'none', stroke: '#4b74ff', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    }
    for (const x of holes) {
      const y = curve(kind, p, x);
      if (Number.isFinite(y) && Math.abs(y) <= yMax) {
        svg.append(svgElement('circle', { cx: sx(x), cy: sy(y), r: 4.4, fill: '#fff', stroke: '#e15774', 'stroke-width': 2 }));
      }
    }
    const boundary = boundaryPoints(kind, p);
    for (const [x, y] of boundary.open) {
      if (Math.abs(y) <= yMax) svg.append(svgElement('circle', { cx: sx(x), cy: sy(y), r: 4.4, fill: '#fff', stroke: '#e15774', 'stroke-width': 2 }));
    }
    for (const [x, y] of boundary.closed) {
      if (Math.abs(y) <= yMax) svg.append(svgElement('circle', { cx: sx(x), cy: sy(y), r: 4.1, fill: '#4b74ff', stroke: '#fff', 'stroke-width': 1.5 }));
    }
    return frame;
  };

  window.OgeGraphPreview = { render };
})();
