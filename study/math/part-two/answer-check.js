(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PartTwoAnswerCheck = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const normalize = (value) => String(value || '').toLowerCase()
    .replace(/[−–—]/g, '-').replace(/,/g, '.').replace(/\s+/g, '')
    .replace(/ё/g, 'е');

  const mathNumber = (value) => {
    const match = normalize(value).match(/^([+-]?\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?(?:√(\d+(?:\.\d+)?))?/);
    if (!match) return null;
    const result = Number(match[1]) / Number(match[2] || 1) * Math.sqrt(Number(match[3] || 1));
    return Number.isFinite(result) ? result : null;
  };
  const sameNumber = (a, b) => a !== null && b !== null && Math.abs(a - b) < 1e-8;
  const parameter = (value) => normalize(value)
    .replace(/или/g, ';').replace(/m=/g, '').replace(/m(?=[<>])/g, '')
    .replace(/[^0-9.;+\-<>=]/g, '');

  const compare = (mode, submitted, expected) => {
    if (!String(submitted || '').trim()) return false;
    if (mode === 'self_check_proof') return null;
    if (mode === 'number' || mode === 'number_with_unit') {
      return sameNumber(mathNumber(submitted), mathNumber(expected));
    }
    if (mode === 'set_of_numbers') {
      const parseSet = (value) => normalize(value).split(';').map(mathNumber).sort((a, b) => a - b);
      const a = parseSet(submitted);
      const b = parseSet(expected);
      return a.length === b.length && a.every((number, index) => sameNumber(number, b[index]));
    }
    if (mode === 'interval') return normalize(submitted) === normalize(expected);
    if (mode === 'parameter_set_plus_graph_self_check') {
      const a = parameter(submitted).split(';').sort();
      const b = parameter(expected).split(';').sort();
      return a.length === b.length && a.every((value, index) => value === b[index]);
    }
    return null;
  };
  return { compare, mathNumber };
});
