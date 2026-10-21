const assert = require('node:assert/strict');
const { buildFirstPartSummary, buildSecondPartSummary, recordDailyProgress, summarizeLastSevenDays, buildPreparationPlan } = require('../study/progress-model.js');

const user = { id: 'student-1', created_at: '2026-10-01T00:00:00.000Z' };
const first = buildFirstPartSummary({
  task1to5: {
    own: { ownerId: user.id, taskProgress: { 1: { correct: 2, answered: 3 } } },
    other: { ownerId: 'student-2', taskProgress: { 1: { correct: 50, answered: 50 } } },
  },
  task7: {
    '7.1': { ownerId: user.id, correctIds: ['q1'], answeredIds: ['q1', 'q2'] },
  },
}, user);
assert.equal(first.correct, 3, 'only the student’s correct answers count');
assert.equal(first.attempted, 5, 'answered-but-wrong items count as attempted, not correct');
assert.equal(first.byTask[1].total, 72);
assert.equal(first.byTask[7].total, 81);
assert.equal(first.percent, Math.round(3000 / first.total) / 10);

const unavailable = buildSecondPartSummary({}, user);
assert.equal(unavailable.available, false, 'absence of second-part attempts remains distinguishable in the model');
assert.equal(unavailable.percent, 0, 'a student who has not started the optional second part sees 0%');
const second = buildSecondPartSummary({ partTwoV1: { ownerId: user.id, statuses: '120'.padEnd(330, '0') } }, user);
assert.equal(second.available, true);
assert.equal(second.completed, 2);
assert.equal(second.correct, 1);
assert.equal(second.reviewed, 1);
assert.equal(second.total, 330);
assert.equal(second.percent, 0.6);
assert.equal(buildSecondPartSummary({ partTwoV1: { ownerId: 'student-2', statuses: '1'.repeat(330) } }, user).available, false);

const firstChange = { task7: { '7.1': { ownerId: user.id, correctIds: ['q1', 'q2'], answeredIds: ['q1', 'q2'] } } };
const history1 = recordDailyProgress({}, {}, firstChange, user, '2026-10-21');
assert.deepEqual(history1.days['2026-10-21'], { first: 2, second: 0 });
const secondChange = { ...firstChange, partTwoV1: { ownerId: user.id, statuses: '120'.padEnd(330, '0') } };
const history2 = recordDailyProgress(history1, firstChange, secondChange, user, '2026-10-21');
assert.deepEqual(history2.days['2026-10-21'], { first: 2, second: 2 }, 'changes on the same day accumulate');
const history3 = recordDailyProgress(history2, secondChange, secondChange, user, '2026-10-22');
assert.deepEqual(history3.days['2026-10-22'], { first: 0, second: 0 }, 'saving unchanged work creates no fake growth');
const recent = summarizeLastSevenDays(history3, '2026-10-22', first.total);
assert.equal(recent.firstCount, 2);
assert.equal(recent.secondCount, 2);
assert.equal(recent.firstPercent, Math.round(20000 / first.total) / 100);
assert.equal(recent.secondPercent, 0.61);
assert.equal(summarizeLastSevenDays(history3, '2026-10-29', first.total).firstCount, 0, 'older changes leave the seven-day window');

const plan = buildPreparationPlan({
  targetDate: '2026-11-18', today: '2026-10-21', currentPercent: 35,
});
assert.equal(plan.daysLeft, 28);
assert.equal(plan.weeklyIncrease, 16.3, 'remaining 65 percentage points are spread over four weeks');
assert.equal(plan.nextWeekPercent, 51.3);
const afterPause = buildPreparationPlan({ targetDate: '2026-11-18', today: '2026-10-28', currentPercent: 35 });
assert.equal(afterPause.weeklyIncrease, 21.7, 'after an idle week, the remaining work is spread over the remaining three weeks');
assert.equal(afterPause.nextWeekPercent, 56.7);
const afterExtraWork = buildPreparationPlan({ targetDate: '2026-11-18', today: '2026-10-28', currentPercent: 60 });
assert.equal(afterExtraWork.weeklyIncrease, 13.4, 'after extra work, the required weekly pace drops');
assert.equal(buildPreparationPlan({ targetDate: '2026-11-18', today: '2026-11-17', currentPercent: 35 }).weeklyIncrease, 65);
assert.equal(buildPreparationPlan({ targetDate: '2026-11-18', today: '2026-11-17', currentPercent: 100 }).weeklyIncrease, 0);
assert.equal(buildPreparationPlan({ targetDate: '2026-11-18', today: '2026-11-18' }), null);
assert.equal(buildPreparationPlan({ targetDate: '2026-02-30', today: '2026-10-28' }), null);

console.log('Preparation analytics tests passed');
