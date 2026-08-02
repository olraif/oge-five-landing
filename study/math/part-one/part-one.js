const quiz = document.getElementById("fractionQuiz");
const result = document.getElementById("quizResult");
const cell = document.querySelector('[data-prototype-cell="6.1"]');
const storageKey = "ogeTrainer:math:task6:prototype6.1";
const cloudPath = ["trainer_progress", "math", "task6", "6.1"];

const normalizeAnswer = (value) => value
  .trim()
  .replace(/\s+/g, "")
  .replace(".", ",")
  .toLowerCase();

const answers = {
  q1: ["9,4"],
  q2: ["14,3"],
  q3: ["10,1"],
  q4: ["13,7"],
  q5: ["12,1"],
  q6: ["13,3"],
  q7: ["14,7"],
  q8: ["17,1"],
  q9: ["18,4"]
};

const applyProgress = (score) => {
  if (!cell) return;
  cell.classList.remove("is-green", "is-yellow");
  if (score >= 5) cell.classList.add("is-green");
  else if (score >= 3) cell.classList.add("is-yellow");
  const counter = cell.querySelector("span");
  if (counter) counter.textContent = `${score}/9`;
};

const applyQuestionStatuses = (submittedAnswers = {}) => {
  Object.entries(answers).forEach(([name, valid]) => {
    const row = document.querySelector(`[data-question="${name}"]`);
    if (!row) return;
    const raw = submittedAnswers[name] || "";
    row.classList.remove("question-correct", "question-wrong", "question-empty");
    if (!raw.trim()) row.classList.add("question-empty");
    else if (valid.includes(normalizeAnswer(raw))) row.classList.add("question-correct");
    else row.classList.add("question-wrong");
  });
};

const showResult = (score, misses = []) => {
  if (!result) return;
  const status = score >= 5
    ? "Прототип 6.1 закрыт"
    : score >= 3 ? "Прототип 6.1 в работе" : "Прототип 6.1 ещё не закрыт";
  result.innerHTML = `
    <strong>${score}/9 · ${status}</strong>
    <p>${score >= 5 ? "Порог прототипа достигнут: 5 правильных ответов." : "Для зелёного статуса нужно 5 правильных ответов."}</p>
    ${misses.length ? `<ul>${misses.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
  `;
};

const saveCloudProgress = async (payload) => {
  if (!window.ogeSupabase) return;
  const { data } = await window.ogeSupabase.auth.getSession();
  const user = data?.session?.user;
  if (!user) return;
  const current = user.user_metadata?.trainer_progress || {};
  const next = { ...current, math: { ...(current.math || {}), task6: { ...(current.math?.task6 || {}), [cloudPath[3]]: payload } } };
  await window.ogeSupabase.auth.updateUser({ data: { trainer_progress: next } });
};

const loadCloudProgress = async () => {
  if (!window.ogeSupabase) return;
  const { data } = await window.ogeSupabase.auth.getSession();
  const saved = data?.session?.user?.user_metadata?.trainer_progress?.math?.task6?.[cloudPath[3]];
  if (!saved || !Number.isFinite(Number(saved.score))) {
    try {
      const localSaved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (localSaved && Number.isFinite(Number(localSaved.score))) await saveCloudProgress(localSaved);
    } catch (error) { /* local storage may be unavailable */ }
    return;
  }
  applyProgress(Number(saved.score));
  if (saved.answers && quiz) Object.entries(saved.answers).forEach(([name, value]) => {
    const input = quiz.elements.namedItem(name);
    if (input) input.value = value;
  });
  applyQuestionStatuses(saved.answers || {});
  showResult(Number(saved.score), saved.misses || []);
  localStorage.setItem(storageKey, JSON.stringify(saved));
};

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
  if (saved && Number.isFinite(saved.score)) {
    applyProgress(saved.score);
    if (saved.answers && quiz) Object.entries(saved.answers).forEach(([name, value]) => {
      const input = quiz.elements.namedItem(name);
      if (input) input.value = value;
    });
    applyQuestionStatuses(saved.answers || {});
    showResult(saved.score, saved.misses || []);
  }
} catch (error) {
  // Progress remains usable if browser storage is unavailable.
}

if (quiz && result) {
  quiz.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(quiz);
    let score = 0;
    const misses = [];
    const submittedAnswers = {};

    Object.entries(answers).forEach(([name, valid], index) => {
      const raw = data.get(name) || "";
      const userAnswer = normalizeAnswer(raw);
      submittedAnswers[name] = raw;
      if (valid.includes(userAnswer)) score += 1;
      else misses.push(`6.1.${index + 1}`);
    });

    applyProgress(score);
    applyQuestionStatuses(submittedAnswers);
    showResult(score, misses);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ score, misses, answers: submittedAnswers, savedAt: new Date().toISOString() }));
      saveCloudProgress({ score, misses, answers: submittedAnswers, savedAt: new Date().toISOString() });
    } catch (error) {
      // Visual result still works without storage.
    }

    if (typeof window.ym === "function" && window.METRIKA_COUNTER_ID) {
      window.ym(window.METRIKA_COUNTER_ID, "reachGoal", "MATH_PART_ONE_TEST");
    }
  });
}

window.addEventListener("oge-auth-ready", loadCloudProgress);
setTimeout(loadCloudProgress, 700);

document.querySelectorAll("[data-prototype-cell]").forEach((prototypeCell) => {
  prototypeCell.addEventListener("click", () => {
    if (prototypeCell.dataset.prototypeCell !== "6.1" && result) {
      result.innerHTML = `<strong>Прототип ${prototypeCell.dataset.prototypeCell}</strong><p>Аналоги этого прототипа добавим следующим шагом из PDF.</p>`;
    }
  });
});
