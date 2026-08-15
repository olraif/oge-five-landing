(function initProgressModel(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OgeProgressModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createProgressModel() {
  const TASK6_TOTALS = Object.freeze({
    '6.1': 9,
    '6.2': 9,
    '6.3': 9,
    '6.4': 9,
    '6.5': 9,
    '6.6': 9,
    '6.7': 9,
    '6.8': 9,
    '6.9': 6,
    '6.10': 7,
  });

  const TASK6_ANSWER_KEYS = Object.freeze({
    '6.1': ['9,4', '14,3', '10,1', '13,7', '12,1', '13,3', '14,7', '17,1', '18,4'],
    '6.2': ['-4,5', '-0,5', '-3,4', '2,7', '-3,5', '-1,9', '3,6', '1,6', '6,8'],
    '6.3': ['20,16', '17,25', '19,84', '16,12', '36,85', '40,81', '58,32', '38,27', '70,29'],
    '6.4': ['12', '7', '4', '3', '2', '8', '11', '9', '5'],
    '6.5': ['2,05', '1,16', '2,1', '1,9', '1,15', '1,26', '1,55', '0,52', '0,9'],
    '6.6': ['-1,95', '0,24', '-2,3', '-4,5', '-0,62', '-1,15', '-0,68', '-1,05', '-0,1'],
    '6.7': ['7,5', '0,9', '4,5', '0,45', '3,75', '0,48', '1,2', '1,8', '2,1'],
    '6.8': ['8,75', '4,5', '5,25', '2,8', '3,3', '0,32', '0,8', '4,9', '1,05'],
    '6.9': ['50', '10', '2', '46', '18', '34'],
    '6.10': ['8,4', '20', '12', '18', '198', '84', '264'],
  });

  const TASK7_TOTALS = Object.freeze({
    '7.1': 5, '7.2': 4, '7.3': 4, '7.4': 4, '7.5': 4,
    '7.6': 5, '7.7': 5, '7.8': 5, '7.9': 5, '7.10': 5,
    '7.11': 5, '7.12': 5, '7.13': 5, '7.14': 5, '7.15': 5,
    '7.16': 5, '7.17': 5,
  });
  const TASK8_TOTALS = Object.freeze(Object.fromEntries(
    Array.from({ length: 35 }, (_, index) => {
      const number = index + 1;
      return [`8.${number}`, [1, 14, 34].includes(number) ? 5 : 4];
    }),
  ));
  const TASK9_TOTALS = Object.freeze({
    '9.1': 10, '9.2': 10, '9.3': 10, '9.4': 10, '9.5': 10,
    '9.6': 10, '9.7': 10, '9.8': 10, '9.9': 10, '9.10': 10,
    '9.11': 7, '9.12': 5, '9.13': 6, '9.14': 6,
  });
  const TASK10_TOTALS = Object.freeze({
    '10.1': 10, '10.2': 16, '10.3': 16, '10.4': 16, '10.5': 8, '10.6': 17,
    '10.7': 10, '10.8': 16, '10.9': 10, '10.10': 6, '10.11': 10, '10.12': 16,
    '10.13': 16, '10.14': 10, '10.15': 10, '10.16': 10, '10.17': 10, '10.18': 10,
  });
  const TASK11_TOTALS = Object.freeze({
    '11.1': 14, '11.2': 13, '11.3': 10, '11.4': 13, '11.5': 14,
    '11.6': 12, '11.7': 6, '11.8': 2, '11.9': 15, '11.10': 4,
  });
  const TASK12_TOTALS = Object.freeze({
    '12.1': 8, '12.2': 4, '12.3': 20, '12.4': 20, '12.5': 18, '12.6': 20,
    '12.7': 20, '12.8': 20, '12.9': 22, '12.10': 23, '12.11': 7,
  });
  const TASK13_TOTALS = Object.freeze({
    '13.1': 10, '13.2': 20, '13.3': 20, '13.4': 10, '13.5': 11,
    '13.6': 10, '13.7': 10, '13.8': 10, '13.9': 10, '13.10': 20,
  });
const TASK14_TOTALS = Object.freeze({
    '14.1': 10, '14.2': 10, '14.3': 10, '14.4': 10, '14.5': 10, '14.6': 10,
    '14.7': 20, '14.8': 7, '14.9': 10, '14.10': 10, '14.11': 10,
  });
  const TASK15_TOTALS = Object.freeze({
    '15.1': 12, '15.2': 10, '15.3': 12, '15.4': 12, '15.5': 5, '15.6': 12, '15.7': 10,
    '15.8': 10, '15.9': 10, '15.10': 12, '15.11': 4, '15.12': 4, '15.13': 4, '15.14': 4,
    '15.15': 4, '15.16': 4, '15.17': 12, '15.18': 12, '15.19': 10, '15.20': 10,
    '15.21': 12, '15.22': 12, '15.23': 10, '15.24': 11, '15.25': 10, '15.26': 10,
    '15.27': 10, '15.28': 10,
  });
  const TASK16_TOTALS = Object.freeze({
    '16.1': 10, '16.2': 10, '16.3': 10, '16.4': 10, '16.5': 10, '16.6': 5, '16.7': 5,
    '16.8': 10, '16.9': 10, '16.10': 10, '16.11': 10, '16.12': 10, '16.13': 10, '16.14': 12,
    '16.15': 10, '16.16': 10, '16.17': 10, '16.18': 10, '16.19': 10, '16.20': 10, '16.21': 12,
    '16.22': 5, '16.23': 10, '16.24': 10, '16.25': 10, '16.26': 10, '16.27': 10, '16.28': 10,
    '16.29': 10, '16.30': 11, '16.31': 10, '16.32': 10, '16.33': 10, '16.34': 10,
  });
  const isAnswered = (value) => String(value ?? '').trim().length > 0;
  const normalizeAnswer = (value) => String(value ?? '').trim().replace(/\s+/g, '').replace('.', ',').toLowerCase();

  const summarizePrototype = (key, attempt = {}, explicitTotal) => {
    const fallbackTotal = explicitTotal || TASK6_TOTALS[key] || 0;
    const answers = attempt && typeof attempt.answers === 'object' ? attempt.answers : {};
    const total = Math.max(0, fallbackTotal || Number(attempt.total) || Object.keys(answers).length);
    const claimedScore = Math.max(0, Number(attempt.score) || 0);
    const answerKey = TASK6_ANSWER_KEYS[key];
    const verifiedScore = answerKey
      ? answerKey.reduce((result, expected, index) => result + (normalizeAnswer(answers[`q${index + 1}`]) === normalizeAnswer(expected) ? 1 : 0), 0)
      : claimedScore;

    if (answerKey && verifiedScore !== claimedScore) {
      return { key, total, correct: 0, wrong: 0, untouched: total, cells: Array(total).fill('pink') };
    }

    const answered = Math.min(total, Object.values(answers).filter(isAnswered).length);
    const correct = Math.min(total, answered, verifiedScore);
    const wrong = Math.max(0, answered - correct);
    const untouched = Math.max(0, total - answered);
    const cells = [
      ...Array(correct).fill('green'),
      ...Array(wrong).fill('yellow'),
      ...Array(untouched).fill('pink'),
    ];

    return { key, total, correct, wrong, untouched, cells };
  };

  const getPrototypeStatus = (attempt = {}, total = 0) => {
    const summary = summarizePrototype('', attempt, total);
    if (summary.correct === summary.total && summary.total > 0) return 'complete';
    if (summary.correct > 0 || summary.wrong > 0) return 'in-progress';
    return 'not-started';
  };

  const buildTask6Summary = (task6Progress = {}) => {
    const prototypes = Object.keys(TASK6_TOTALS).map((key) => summarizePrototype(key, task6Progress?.[key]));
    const totals = prototypes.reduce((result, prototype) => ({
      total: result.total + prototype.total,
      correct: result.correct + prototype.correct,
      wrong: result.wrong + prototype.wrong,
      untouched: result.untouched + prototype.untouched,
    }), { total: 0, correct: 0, wrong: 0, untouched: 0 });

    return {
      prototypes,
      ...totals,
      percent: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0,
    };
  };

  const summarizeTask7Prototype = (key, attempt = {}) => {
    const total = TASK7_TOTALS[key] || Number(attempt.total) || 0;
    const correctIds = Array.isArray(attempt.correctIds) ? attempt.correctIds : [];
    const answeredIds = Array.isArray(attempt.answeredIds) ? attempt.answeredIds : Object.keys(attempt.answers || {}).filter((id) => isAnswered(attempt.answers[id]));
    const correct = Math.min(total, correctIds.length);
    const answered = Math.min(total, Math.max(correct, answeredIds.length));
    const wrong = Math.max(0, answered - correct);
    const untouched = Math.max(0, total - answered);
    return { key, total, correct, wrong, untouched, cells: [...Array(correct).fill('green'), ...Array(wrong).fill('yellow'), ...Array(untouched).fill('pink')] };
  };

  const buildTask7Summary = (task7Progress = {}) => {
    const prototypes = Object.keys(TASK7_TOTALS).map((key) => summarizeTask7Prototype(key, task7Progress?.[key]));
    const totals = prototypes.reduce((result, prototype) => ({
      total: result.total + prototype.total,
      correct: result.correct + prototype.correct,
      wrong: result.wrong + prototype.wrong,
      untouched: result.untouched + prototype.untouched,
    }), { total: 0, correct: 0, wrong: 0, untouched: 0 });
    return { prototypes, ...totals, percent: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0 };
  };
  const summarizeTask8Prototype = (key, attempt = {}) => {
    const total = TASK8_TOTALS[key] || Number(attempt.total) || 0;
    const correctIds = Array.isArray(attempt.correctIds) ? attempt.correctIds : [];
    const answeredIds = Array.isArray(attempt.answeredIds) ? attempt.answeredIds : Object.keys(attempt.answers || {}).filter((id) => isAnswered(attempt.answers[id]));
    const correct = Math.min(total, correctIds.length);
    const answered = Math.min(total, Math.max(correct, answeredIds.length));
    const wrong = Math.max(0, answered - correct);
    const untouched = Math.max(0, total - answered);
    return { key, total, correct, wrong, untouched, cells: [...Array(correct).fill('green'), ...Array(wrong).fill('yellow'), ...Array(untouched).fill('pink')] };
  };

  const buildTask8Summary = (task8Progress = {}) => {
    const prototypes = Object.keys(TASK8_TOTALS).map((key) => summarizeTask8Prototype(key, task8Progress?.[key]));
    const totals = prototypes.reduce((result, prototype) => ({
      total: result.total + prototype.total,
      correct: result.correct + prototype.correct,
      wrong: result.wrong + prototype.wrong,
      untouched: result.untouched + prototype.untouched,
    }), { total: 0, correct: 0, wrong: 0, untouched: 0 });
    return { prototypes, ...totals, percent: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0 };
  };
  const summarizeTask9Prototype = (key, attempt = {}) => {
    const total = TASK9_TOTALS[key] || Number(attempt.total) || 0;
    const correctIds = Array.isArray(attempt.correctIds) ? attempt.correctIds : [];
    const answeredIds = Array.isArray(attempt.answeredIds) ? attempt.answeredIds : Object.keys(attempt.answers || {}).filter((id) => isAnswered(attempt.answers[id]));
    const correct = Math.min(total, correctIds.length);
    const answered = Math.min(total, Math.max(correct, answeredIds.length));
    const wrong = Math.max(0, answered - correct);
    const untouched = Math.max(0, total - answered);
    return { key, total, correct, wrong, untouched, cells: [...Array(correct).fill('green'), ...Array(wrong).fill('yellow'), ...Array(untouched).fill('pink')] };
  };
  const buildTask9Summary = (task9Progress = {}) => {
    const prototypes = Object.keys(TASK9_TOTALS).map((key) => summarizeTask9Prototype(key, task9Progress?.[key]));
    const totals = prototypes.reduce((result, prototype) => ({
      total: result.total + prototype.total,
      correct: result.correct + prototype.correct,
      wrong: result.wrong + prototype.wrong,
      untouched: result.untouched + prototype.untouched,
    }), { total: 0, correct: 0, wrong: 0, untouched: 0 });
    return { prototypes, ...totals, percent: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0 };
  };
  const summarizeTask10Prototype = (key, attempt = {}) => {
    const total = TASK10_TOTALS[key] || Number(attempt.total) || 0;
    const correctIds = Array.isArray(attempt.correctIds) ? attempt.correctIds : [];
    const answeredIds = Array.isArray(attempt.answeredIds) ? attempt.answeredIds : Object.keys(attempt.answers || {}).filter((id) => isAnswered(attempt.answers[id]));
    const correct = Math.min(total, correctIds.length);
    const answered = Math.min(total, Math.max(correct, answeredIds.length));
    const wrong = Math.max(0, answered - correct);
    const untouched = Math.max(0, total - answered);
    return { key, total, correct, wrong, untouched, cells: [...Array(correct).fill('green'), ...Array(wrong).fill('yellow'), ...Array(untouched).fill('pink')] };
  };
  const buildTask10Summary = (task10Progress = {}) => {
    const prototypes = Object.keys(TASK10_TOTALS).map((key) => summarizeTask10Prototype(key, task10Progress?.[key]));
    const totals = prototypes.reduce((result, prototype) => ({
      total: result.total + prototype.total,
      correct: result.correct + prototype.correct,
      wrong: result.wrong + prototype.wrong,
      untouched: result.untouched + prototype.untouched,
    }), { total: 0, correct: 0, wrong: 0, untouched: 0 });
    return { prototypes, ...totals, percent: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0 };
  };
  const summarizeTask11Prototype = (key, attempt = {}) => {
    const total = TASK11_TOTALS[key] || Number(attempt.total) || 0;
    const correctIds = Array.isArray(attempt.correctIds) ? attempt.correctIds : [];
    const answeredIds = Array.isArray(attempt.answeredIds) ? attempt.answeredIds : Object.keys(attempt.answers || {}).filter((id) => isAnswered(attempt.answers[id]));
    const correct = Math.min(total, correctIds.length);
    const answered = Math.min(total, Math.max(correct, answeredIds.length));
    const wrong = Math.max(0, answered - correct);
    const untouched = Math.max(0, total - answered);
    return { key, total, correct, wrong, untouched, cells: [...Array(correct).fill('green'), ...Array(wrong).fill('yellow'), ...Array(untouched).fill('pink')] };
  };
  const buildTask11Summary = (task11Progress = {}) => {
    const prototypes = Object.keys(TASK11_TOTALS).map((key) => summarizeTask11Prototype(key, task11Progress?.[key]));
    const totals = prototypes.reduce((result, prototype) => ({
      total: result.total + prototype.total,
      correct: result.correct + prototype.correct,
      wrong: result.wrong + prototype.wrong,
      untouched: result.untouched + prototype.untouched,
    }), { total: 0, correct: 0, wrong: 0, untouched: 0 });
    return { prototypes, ...totals, percent: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0 };
  };
  const summarizeTask12Prototype = (key, attempt = {}) => {
    const total = TASK12_TOTALS[key] || Number(attempt.total) || 0;
    const correctIds = Array.isArray(attempt.correctIds) ? attempt.correctIds : [];
    const answeredIds = Array.isArray(attempt.answeredIds) ? attempt.answeredIds : Object.keys(attempt.answers || {}).filter((id) => isAnswered(attempt.answers[id]));
    const correct = Math.min(total, correctIds.length);
    const answered = Math.min(total, Math.max(correct, answeredIds.length));
    const wrong = Math.max(0, answered - correct);
    const untouched = Math.max(0, total - answered);
    return { key, total, correct, wrong, untouched, cells: [...Array(correct).fill('green'), ...Array(wrong).fill('yellow'), ...Array(untouched).fill('pink')] };
  };
  const buildTask12Summary = (task12Progress = {}) => {
    const prototypes = Object.keys(TASK12_TOTALS).map((key) => summarizeTask12Prototype(key, task12Progress?.[key]));
    const totals = prototypes.reduce((result, prototype) => ({
      total: result.total + prototype.total,
      correct: result.correct + prototype.correct,
      wrong: result.wrong + prototype.wrong,
      untouched: result.untouched + prototype.untouched,
    }), { total: 0, correct: 0, wrong: 0, untouched: 0 });
    return { prototypes, ...totals, percent: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0 };
  };
  const summarizeTask13Prototype = (key, attempt = {}) => {
    const total = TASK13_TOTALS[key] || Number(attempt.total) || 0;
    const correctIds = Array.isArray(attempt.correctIds) ? attempt.correctIds : [];
    const answeredIds = Array.isArray(attempt.answeredIds) ? attempt.answeredIds : Object.keys(attempt.answers || {}).filter((id) => isAnswered(attempt.answers[id]));
    const correct = Math.min(total, correctIds.length);
    const answered = Math.min(total, Math.max(correct, answeredIds.length));
    const wrong = Math.max(0, answered - correct);
    const untouched = Math.max(0, total - answered);
    return { key, total, correct, wrong, untouched, cells: [...Array(correct).fill('green'), ...Array(wrong).fill('yellow'), ...Array(untouched).fill('pink')] };
  };
  const buildTask13Summary = (task13Progress = {}) => {
    const prototypes = Object.keys(TASK13_TOTALS).map((key) => summarizeTask13Prototype(key, task13Progress?.[key]));
    const totals = prototypes.reduce((result, prototype) => ({
      total: result.total + prototype.total,
      correct: result.correct + prototype.correct,
      wrong: result.wrong + prototype.wrong,
      untouched: result.untouched + prototype.untouched,
    }), { total: 0, correct: 0, wrong: 0, untouched: 0 });
    return { prototypes, ...totals, percent: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0 };
  };
const summarizeTask14Prototype = (key, attempt = {}) => {
    const total = TASK14_TOTALS[key] || Number(attempt.total) || 0;
    const correctIds = Array.isArray(attempt.correctIds) ? attempt.correctIds : [];
    const answeredIds = Array.isArray(attempt.answeredIds) ? attempt.answeredIds : Object.keys(attempt.answers || {}).filter((id) => isAnswered(attempt.answers[id]));
    const correct = Math.min(total, correctIds.length);
    const answered = Math.min(total, Math.max(correct, answeredIds.length));
    const wrong = Math.max(0, answered - correct);
    const untouched = Math.max(0, total - answered);
    return { key, total, correct, wrong, untouched, cells: [...Array(correct).fill('green'), ...Array(wrong).fill('yellow'), ...Array(untouched).fill('pink')] };
  };
  const buildTask14Summary = (task14Progress = {}) => {
    const prototypes = Object.keys(TASK14_TOTALS).map((key) => summarizeTask14Prototype(key, task14Progress?.[key]));
    const totals = prototypes.reduce((result, prototype) => ({
      total: result.total + prototype.total,
      correct: result.correct + prototype.correct,
      wrong: result.wrong + prototype.wrong,
      untouched: result.untouched + prototype.untouched,
    }), { total: 0, correct: 0, wrong: 0, untouched: 0 });
    return { prototypes, ...totals, percent: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0 };
  };

const summarizeTask15Prototype = (key, attempt = {}) => {
    const total = TASK15_TOTALS[key] || Number(attempt.total) || 0;
    const correctIds = Array.isArray(attempt.correctIds) ? attempt.correctIds : [];
    const answeredIds = Array.isArray(attempt.answeredIds) ? attempt.answeredIds : Object.keys(attempt.answers || {}).filter((id) => isAnswered(attempt.answers[id]));
    const correct = Math.min(total, correctIds.length);
    const answered = Math.min(total, Math.max(correct, answeredIds.length));
    const wrong = Math.max(0, answered - correct);
    const untouched = Math.max(0, total - answered);
    return { key, total, correct, wrong, untouched, cells: [...Array(correct).fill('green'), ...Array(wrong).fill('yellow'), ...Array(untouched).fill('pink')] };
  };
  const buildTask15Summary = (task15Progress = {}) => {
    const prototypes = Object.keys(TASK15_TOTALS).map((key) => summarizeTask15Prototype(key, task15Progress?.[key]));
    const totals = prototypes.reduce((result, prototype) => ({
      total: result.total + prototype.total,
      correct: result.correct + prototype.correct,
      wrong: result.wrong + prototype.wrong,
      untouched: result.untouched + prototype.untouched,
    }), { total: 0, correct: 0, wrong: 0, untouched: 0 });
    return { prototypes, ...totals, percent: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0 };
  };

  const summarizeTask16Prototype = (key, attempt = {}) => {
    const total = TASK16_TOTALS[key] || Number(attempt.total) || 0;
    const correctIds = Array.isArray(attempt.correctIds) ? attempt.correctIds : [];
    const answeredIds = Array.isArray(attempt.answeredIds) ? attempt.answeredIds : Object.keys(attempt.answers || {}).filter((id) => isAnswered(attempt.answers[id]));
    const correct = Math.min(total, correctIds.length);
    const answered = Math.min(total, Math.max(correct, answeredIds.length));
    const wrong = Math.max(0, answered - correct);
    const untouched = Math.max(0, total - answered);
    return { key, total, correct, wrong, untouched, cells: [...Array(correct).fill('green'), ...Array(wrong).fill('yellow'), ...Array(untouched).fill('pink')] };
  };
  const buildTask16Summary = (task16Progress = {}) => {
    const prototypes = Object.keys(TASK16_TOTALS).map((key) => summarizeTask16Prototype(key, task16Progress?.[key]));
    const totals = prototypes.reduce((result, prototype) => ({
      total: result.total + prototype.total,
      correct: result.correct + prototype.correct,
      wrong: result.wrong + prototype.wrong,
      untouched: result.untouched + prototype.untouched,
    }), { total: 0, correct: 0, wrong: 0, untouched: 0 });
    return { prototypes, ...totals, percent: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0 };
  };

  const createAccountProgressStorage = (storage) => {
    const buildKey = (prefix, userId, itemId) => {
      if (!storage || !userId || !itemId) return null;
      return `${prefix}account:${encodeURIComponent(userId)}:${itemId}`;
    };
    return {
      read(prefix, userId, itemId) {
        const key = buildKey(prefix, userId, itemId);
        if (!key) return null;
        try { return JSON.parse(storage.getItem(key) || 'null'); } catch { return null; }
      },
      write(prefix, userId, itemId, value) {
        const key = buildKey(prefix, userId, itemId);
        if (!key) return false;
        storage.setItem(key, JSON.stringify(value));
        return true;
      },
      remove(prefix, userId, itemId) {
        const key = buildKey(prefix, userId, itemId);
        if (!key) return false;
        storage.removeItem(key);
        return true;
      },
    };
  };

  const isAttemptOwnedByAccount = (attempt, user) => {
    if (!attempt || !user?.id) return false;
    if (attempt.ownerId) return attempt.ownerId === user.id;
    const savedAt = Date.parse(attempt.savedAt || '');
    const accountCreatedAt = Date.parse(user.created_at || '');
    if (!Number.isFinite(savedAt) || !Number.isFinite(accountCreatedAt)) return false;
    return savedAt >= accountCreatedAt;
  };

  return { TASK6_TOTALS, TASK6_ANSWER_KEYS, TASK7_TOTALS, TASK8_TOTALS, TASK9_TOTALS, TASK10_TOTALS, TASK11_TOTALS, TASK12_TOTALS, TASK13_TOTALS, TASK14_TOTALS, TASK15_TOTALS, TASK16_TOTALS, summarizePrototype, summarizeTask7Prototype, summarizeTask8Prototype, summarizeTask9Prototype, summarizeTask10Prototype, summarizeTask11Prototype, summarizeTask12Prototype, summarizeTask13Prototype, summarizeTask14Prototype, summarizeTask15Prototype, summarizeTask16Prototype, getPrototypeStatus, buildTask6Summary, buildTask7Summary, buildTask8Summary, buildTask9Summary, buildTask10Summary, buildTask11Summary, buildTask12Summary, buildTask13Summary, buildTask14Summary, buildTask15Summary, buildTask16Summary, createAccountProgressStorage, isAttemptOwnedByAccount };
});
