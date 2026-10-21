const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const model = require('../study/progress-model.js');
const user = { id: 'student-1', created_at: '2026-10-01T00:00:00.000Z', email: 'test@example.test', user_metadata: {} };
let savedMetadata;
const client = {
  auth: {
    getSession: async () => ({ data: { session: { user } } }),
    onAuthStateChange: () => {},
    updateUser: async ({ data }) => {
      savedMetadata = data;
      return { data: { user: { ...user, user_metadata: data } }, error: null };
    },
  },
};
const document = {
  currentScript: { src: 'https://example.test/study/auth-session.js' },
  documentElement: { dataset: {} },
  querySelectorAll: () => [],
};
const window = {
  OGE_SUPABASE: { url: 'https://example.test', publishableKey: 'test' },
  OgeProgressModel: model,
  supabase: { createClient: () => client },
  dispatchEvent: () => {},
  location: { pathname: '/study/index.html', href: 'https://example.test/study/index.html' },
};
const source = fs.readFileSync(path.join(__dirname, '..', 'study', 'auth-session.js'), 'utf8');
vm.runInNewContext(source, { window, document, location: window.location, URL, Intl, Date, CustomEvent: class {} });

(async () => {
  const next = {
    math: { task7: { '7.1': { ownerId: user.id, correctIds: ['q1', 'q2'], answeredIds: ['q1', 'q2'] } } },
  };
  const result = await window.ogeSaveTrainerProgress(next, user);
  assert.equal(result.error, null);
  assert.equal(savedMetadata.trainer_progress, next);
  const history = savedMetadata.math_progress_history_v1;
  assert.equal(Object.values(history.days)[0].first, 2);
  assert.equal(Object.values(history.days)[0].second, 0);
  const secondNext = { math: { ...next.math, partTwoV1: { ownerId: user.id, statuses: '1'.padEnd(330, '0') } } };
  await window.ogeSaveTrainerProgress(secondNext, result.data.user);
  assert.equal(Object.values(savedMetadata.math_progress_history_v1.days)[0].first, 2);
  assert.equal(Object.values(savedMetadata.math_progress_history_v1.days)[0].second, 1);
  console.log('Progress history save test passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
