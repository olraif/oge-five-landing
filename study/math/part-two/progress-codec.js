(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OgePartTwoProgress = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const totals = Object.freeze({ 20: 72, 21: 63, 22: 45, 23: 57, 24: 45, 25: 48 });
  const offsets = Object.freeze({ 20: 0, 21: 72, 22: 135, 23: 180, 24: 237, 25: 282 });
  const total = 330;
  const taskIndex = (id) => {
    const match = String(id).match(/^(2[0-5])\.(\d+)-([abc])$/);
    if (!match) return null;
    const number = Number(match[1]);
    const prototype = Number(match[2]);
    if (!totals[number] || prototype < 1 || prototype > totals[number] / 3) return null;
    return offsets[number] + (prototype - 1) * 3 + 'abc'.indexOf(match[3]);
  };
  const statusAt = (progress, userId, id) => {
    const index = taskIndex(id);
    if (index === null) return null;
    const compact = progress?.partTwoV1;
    if (compact?.ownerId === userId && typeof compact.statuses === 'string') {
      if (compact.statuses[index] === '1') return 'correct';
      if (compact.statuses[index] === '2') return 'reviewed';
    }
    const legacy = progress?.[`task${id.split('.')[0]}`]?.[id];
    return legacy?.ownerId === userId && ['correct', 'reviewed'].includes(legacy.status)
      ? legacy.status : null;
  };
  const withStatus = (progress, userId, id, status) => {
    const index = taskIndex(id);
    if (index === null || !['correct', 'reviewed'].includes(status)) throw new Error('Неверная отметка задания');
    const old = progress?.partTwoV1?.ownerId === userId ? progress.partTwoV1.statuses : '';
    const chars = String(old || '').slice(0, total).padEnd(total, '0').split('');
    chars[index] = status === 'correct' ? '1' : '2';
    return { ...progress, partTwoV1: { ownerId: userId, statuses: chars.join('') } };
  };
  const summary = (progress, userId, number) => {
    if (!totals[number]) return null;
    let correct = 0; let reviewed = 0;
    for (let prototype = 1; prototype <= totals[number] / 3; prototype += 1) {
      for (const suffix of 'abc') {
        const status = statusAt(progress, userId, `${number}.${prototype}-${suffix}`);
        if (status === 'correct') correct += 1;
        if (status === 'reviewed') reviewed += 1;
      }
    }
    return { total: totals[number], correct, reviewed };
  };
  return { totals, taskIndex, statusAt, withStatus, summary };
});
