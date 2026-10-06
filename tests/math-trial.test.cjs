const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'study', 'auth-session.js'), 'utf8');

async function makeSession({ user = { id: 'student-1', email: 'test@example.com' }, paid = [], trial = null, pathname = '/study/' } = {}) {
  let redirect = null;
  let started = 0;
  const client = {
    auth: {
      getSession: async () => ({ data: { session: user ? { user } : null } }),
      onAuthStateChange: () => ({}),
      signOut: async () => {},
    },
    from: (table) => {
      assert.equal(table, 'enrollments');
      return {
        select: () => ({ eq: async () => ({ data: paid.map((course_id) => ({ course_id })), error: null }) }),
      };
    },
    rpc: async (name, { p_start }) => {
      assert.equal(name, 'math_trial');
      if (p_start) started += 1;
      return { data: [trial || { status: 'not_started', expires_at: null, remaining_seconds: null }], error: null };
    },
  };
  const window = {
    OGE_SUPABASE: { url: 'https://example.test', publishableKey: 'test' },
    supabase: { createClient: () => client },
    location: { pathname, replace: (value) => { redirect = value; } },
    dispatchEvent: () => {},
  };
  const document = { documentElement: { style: {}, dataset: {} }, querySelectorAll: () => [] };
  vm.runInNewContext(source, { window, document, CustomEvent: class {}, clearTimeout, setTimeout: () => 1 });
  await new Promise(setImmediate);
  return { window, document, getRedirect: () => redirect, getStarted: () => started };
}

test('free trial opens first-part mathematics for the server-reported remaining time', async () => {
  const session = await makeSession({ trial: { status: 'active', expires_at: '2026-10-06T12:00:00Z', remaining_seconds: 120 } });
  const access = await session.window.ogeHasCourseAccess('math-first');
  assert.equal(access.data, true);
  assert.equal(access.trialRemainingMs, 120000);
  assert.equal((await session.window.ogeHasCourseAccess('math-algebra')).data, false);
});

test('expired trial cannot reopen and direct exercise link returns to courses', async () => {
  const session = await makeSession({ trial: { status: 'expired', expires_at: '2026-10-06T10:00:00Z', remaining_seconds: 0 }, pathname: '/study/math/part-one/task17.html' });
  assert.equal((await session.window.ogeHasCourseAccess('math-first')).data, false);
  assert.equal(session.getRedirect(), '/study/#courses');
  assert.equal((await session.window.ogeStartMathTrial()).data.status, 'expired');
  assert.equal(session.getStarted(), 1);
});

test('paid enrollment remains open after trial expiry', async () => {
  const session = await makeSession({ paid: ['math-first'], trial: { status: 'expired', remaining_seconds: 0 }, pathname: '/study/math/part-one/task17.html' });
  assert.equal((await session.window.ogeHasCourseAccess('math-first')).data, true);
  assert.equal(session.getRedirect(), null);
  assert.equal(session.document.documentElement.style.visibility, '');
});

test('guest cannot activate free trial', async () => {
  const session = await makeSession({ user: null });
  assert.equal((await session.window.ogeStartMathTrial()).error.message, 'AUTH_REQUIRED');
  assert.equal(session.getStarted(), 0);
});
