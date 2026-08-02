const quiz = document.getElementById("fractionQuiz");
const result = document.getElementById("quizResult");
const getCell = () => document.querySelector(`[data-prototype-cell="${activePrototype}"]`);
let storageKey = "ogeTrainer:math:task6:prototype6.1";
const cloudPath = ["trainer_progress", "math", "task6", "6.1"];

const syncCourseView = () => document.body.classList.toggle("task6-view", location.hash === "#trainer");
window.addEventListener("hashchange", syncCourseView);
syncCourseView();

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
const prototypeData = {
  "6.1": { title: "СЃР»РѕР¶РµРЅРёРµ РґРµСЃСЏС‚РёС‡РЅС‹С… РґСЂРѕР±РµР№", items: [["6.1.1","6,8 + 2,6","9,4"],["6.1.2","6,9 + 7,4","14,3"],["6.1.3","7,9 + 2,2","10,1"],["6.1.4","8,3 + 5,4","13,7"],["6.1.5","8,4 + 3,7","12,1"],["6.1.6","8,7 + 4,6","13,3"],["6.1.7","8,8 + 5,9","14,7"],["6.1.8","9,3 + 7,8","17,1"],["6.1.9","9,8 + 8,6","18,4"]] },
  "6.2": { title: "РІС‹С‡РёС‚Р°РЅРёРµ РґРµСЃСЏС‚РёС‡РЅС‹С… РґСЂРѕР±РµР№", items: [["6.2.1","4,9 - 9,4","-4,5"],["6.2.2","3,6 - 4,1","-0,5"],["6.2.3","3,9 - 7,3","-3,4"],["6.2.4","4,4 - 1,7","2,7"],["6.2.5","4,7 - 8,2","-3,5"],["6.2.6","5,7 - 7,6","-1,9"],["6.2.7","6,1 - 2,5","3,6"],["6.2.8","6,4 - 4,8","1,6"],["6.2.9","9,2 - 2,4","6,8"]] },
  "6.3": { title: "СѓРјРЅРѕР¶РµРЅРёРµ РґРµСЃСЏС‚РёС‡РЅС‹С… РґСЂРѕР±РµР№", items: [["6.3.1","2,1 * 9,6","20,16"],["6.3.2","2,3 * 7,5","17,25"],["6.3.3","3,2 * 6,2","19,84"],["6.3.4","5,2 * 3,1","16,12"],["6.3.5","6,7 * 5,5","36,85"],["6.3.6","7,7 * 5,3","40,81"],["6.3.7","8,1 * 7,2","58,32"],["6.3.8","8,9 * 4,3","38,27"],["6.3.9","9,9 * 7,1","70,29"]] },
  "6.4": { title: "РґРµР»РµРЅРёРµ РґРµСЃСЏС‚РёС‡РЅС‹С… РґСЂРѕР±РµР№", items: [["6.4.1","4,8 : 0,4","12"],["6.4.2","8,4 : 1,2","7"],["6.4.3","6,8 : 1,7","4"],["6.4.4","8,7 : 2,9","3"],["6.4.5","8,2 : 4,1","2"],["6.4.6","9,6 : 1,2","8"],["6.4.7","13,2 : 1,2","11"],["6.4.8","8,1 : 0,9","9"],["6.4.9","6,5 : 1,3","5"]] },
  "6.5": { title: "СЃР»РѕР¶РµРЅРёРµ РѕР±С‹РєРЅРѕРІРµРЅРЅС‹С… РґСЂРѕР±РµР№", items: [["6.5.1","1/2 + 31/20","2,05"],["6.5.2","1/2 + 33/50","1,16"],["6.5.3","1/4 + 37/20","2,1"],["6.5.4","1/5 + 17/10","1,9"],["6.5.5","1/5 + 19/20","1,15"],["6.5.6","1/5 + 53/50","1,26"],["6.5.7","1/10 + 29/20","1,55"],["6.5.8","1/10 + 21/50","0,52"],["6.5.9","1/25 + 43/50","0,9"]] },
  "6.6": { title: "РІС‹С‡РёС‚Р°РЅРёРµ РѕР±С‹РєРЅРѕРІРµРЅРЅС‹С… РґСЂРѕР±РµР№", items: [["6.6.1","1/2 - 49/20","-1,95"],["6.6.2","1/2 - 13/50","0,24"],["6.6.3","1/4 - 51/20","-2,3"],["6.6.4","1/5 - 47/10","-4,5"],["6.6.5","1/5 - 41/50","-0,62"],["6.6.6","1/5 - 27/20","-1,15"],["6.6.7","1/10 - 39/50","-0,68"],["6.6.8","1/10 - 23/20","-1,05"],["6.6.9","1/25 - 7/50","-0,1"]] },
  "6.7": { title: "СѓРјРЅРѕР¶РµРЅРёРµ РѕР±С‹РєРЅРѕРІРµРЅРЅС‹С… РґСЂРѕР±РµР№", items: [["6.7.1","5/3 * 9/2","7,5"],["6.7.2","3/4 * 6/5","0,9"],["6.7.3","15/4 * 6/5","4,5"],["6.7.4","2/5 * 9/8","0,45"],["6.7.5","3/5 * 25/4","3,75"],["6.7.6","7/5 * 12/35","0,48"],["6.7.7","9/5 * 2/3","1,2"],["6.7.8","21/5 * 3/7","1,8"],["6.7.9","7/6 * 9/5","2,1"]] },
  "6.8": { title: "РґРµР»РµРЅРёРµ РѕР±С‹РєРЅРѕРІРµРЅРЅС‹С… РґСЂРѕР±РµР№", items: [["6.8.1","15/4 : 3/7","8,75"],["6.8.2","3/5 : 2/15","4,5"],["6.8.3","3/5 : 4/35","5,25"],["6.8.4","4/5 : 2/7","2,8"],["6.8.5","6/5 : 4/11","3,3"],["6.8.6","12/5 : 15/2","0,32"],["6.8.7","14/5 : 7/2","0,8"],["6.8.8","21/5 : 6/7","4,9"],["6.8.9","7/8 : 5/6","1,05"]] },
  "6.9": { title: "РїСЂРёРІРµРґРµРЅРёРµ Рє Р·Р°РґР°РЅРЅРѕРјСѓ Р·РЅР°РјРµРЅР°С‚РµР»СЋ", items: [["6.9.1","1/7 + 3/4 В· Р·РЅР°РјРµРЅР°С‚РµР»СЊ 56","50"],["6.9.2","2/3 - 7/13 В· Р·РЅР°РјРµРЅР°С‚РµР»СЊ 78","10"],["6.9.3","3/4 - 8/11 В· Р·РЅР°РјРµРЅР°С‚РµР»СЊ 88","2"],["6.9.4","5/8 + 1/3 В· Р·РЅР°РјРµРЅР°С‚РµР»СЊ 48","46"],["6.9.5","6/7 - 3/5 В· Р·РЅР°РјРµРЅР°С‚РµР»СЊ 70","18"],["6.9.6","7/9 - 2/5 В· Р·РЅР°РјРµРЅР°С‚РµР»СЊ 90","34"]] },
  "6.10": { title: "DEMO: СЃРјРµС€Р°РЅРЅС‹Рµ С‡РёСЃР»Р°", items: [["6.10.1","1 1/28 + 1/12","8,4"],["6.10.2","1 1/36 + 1/45","20"],["6.10.3","1 1/21 + 1/28","12"],["6.10.4","1 1/14 - 1/63","18"],["6.10.5","1 1/36 - 1/44","198"],["6.10.6","1 1/35 - 1/60","84"],["6.10.7","1 1/72 - 1/99","264"]] }
};
let activePrototype = "6.1";
let activeAnswers = answers;

const applyProgress = (score) => {
  const cell = getCell();
  if (!cell) return;
  cell.classList.remove("is-green", "is-yellow");
  if (score >= 5) cell.classList.add("is-green");
  else if (score >= 3) cell.classList.add("is-yellow");
  const counter = cell.querySelector("span");
  if (counter) counter.textContent = `${score}/${Object.keys(activeAnswers).length}`;
};

const applyQuestionStatuses = (submittedAnswers = {}) => {
  Object.entries(activeAnswers).forEach(([name, valid]) => {
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
  result.innerHTML = `
    <strong>${score}/${Object.keys(activeAnswers).length}</strong>
    <p>РїСЂР°РІРёР»СЊРЅС‹С… РѕС‚РІРµС‚РѕРІ В· ${score >= 5 ? "РїСЂРѕС‚РѕС‚РёРї РѕСЃРІРѕРµРЅ" : "РґРѕ Р·РµР»С‘РЅРѕРіРѕ СЃС‚Р°С‚СѓСЃР° РЅСѓР¶РЅРѕ 5"}</p>
    ${misses.length ? `<ul>${misses.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
  `;
};

const getSaved = () => {
  try { return JSON.parse(localStorage.getItem(storageKey) || "null"); } catch (error) { return null; }
};

const guideElement = document.querySelector(".trainer-guide");
const defaultGuideMarkup = guideElement?.innerHTML || "";

const renderPrototype = (key, restore = true) => {
  const data = prototypeData[key];
  if (!data || !quiz) return;
  activePrototype = key;
  activeAnswers = Object.fromEntries(data.items.map((item, index) => [`q${index + 1}`, [item[2]]]));
  storageKey = `ogeTrainer:math:task6:prototype${key}`;

  if (guideElement) {
    guideElement.className = 'trainer-guide trainer-guide--image';
    guideElement.innerHTML = key === '6.1' ? '<img src="assets/lesson-06-01.png" alt="РЎС…РµРјР° СЃР»РѕР¶РµРЅРёСЏ РґРµСЃСЏС‚РёС‡РЅС‹С… РґСЂРѕР±РµР№">' : '';
  }
  const caption = document.querySelector(".quiz-caption");
  if (caption) caption.textContent = `РџСЂРѕС‚РѕС‚РёРї ${key} В· ${data.title}`;
  const rows = Array.from(quiz.querySelectorAll("label[data-question]"));
  data.items.forEach(([id, expression], index) => {
    const row = rows[index];
    if (!row) return;
    row.style.display = "grid";
    row.dataset.question = `q${index + 1}`;
    row.innerHTML = `${id} <span>${expression}</span><input name="q${index + 1}" autocomplete="off">`;
  });
  rows.slice(data.items.length).forEach((row) => { row.style.display = "none"; });
  document.querySelectorAll("[data-prototype-cell]").forEach((button) => {
    button.classList.toggle("is-current", button.dataset.prototypeCell === key);
  });
  applyProgress(0);
  applyQuestionStatuses({});
  showResult(0);
  if (restore) {
    const saved = getSaved();
    if (saved && Number.isFinite(Number(saved.score))) {
      if (saved.answers) Object.entries(saved.answers).forEach(([name, value]) => {
        const input = quiz.elements.namedItem(name);
        if (input) input.value = value;
      });
      applyProgress(Number(saved.score));
      applyQuestionStatuses(saved.answers || {});
      showResult(Number(saved.score), saved.misses || []);
    }
  }
};

const saveCloudProgress = async (payload) => {
  if (!window.ogeSupabase) return;
  const { data } = await window.ogeSupabase.auth.getSession();
  if (requestedPrototype !== activePrototype) return;
  const user = data?.session?.user;
  if (!user) return;
  const current = user.user_metadata?.trainer_progress || {};
  const next = { ...current, math: { ...(current.math || {}), task6: { ...(current.math?.task6 || {}), [cloudPath[3]]: payload } } };
  await window.ogeSupabase.auth.updateUser({ data: { trainer_progress: next } });
};

const loadCloudProgress = async () => {
  const requestedPrototype = activePrototype;
  if (!window.ogeSupabase) return;
  const { data } = await window.ogeSupabase.auth.getSession();
  if (requestedPrototype !== activePrototype) return;
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

    Object.entries(activeAnswers).forEach(([name, valid], index) => {
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
      result.innerHTML = `<strong>РџСЂРѕС‚РѕС‚РёРї ${prototypeCell.dataset.prototypeCell}</strong><p>РђРЅР°Р»РѕРіРё СЌС‚РѕРіРѕ РїСЂРѕС‚РѕС‚РёРїР° РґРѕР±Р°РІРёРј СЃР»РµРґСѓСЋС‰РёРј С€Р°РіРѕРј РёР· PDF.</p>`;
    }
  });
});

Object.assign(prototypeData, {
  "6.1": { ...prototypeData["6.1"], title: "СЃР»РѕР¶РµРЅРёРµ РґРµСЃСЏС‚РёС‡РЅС‹С… РґСЂРѕР±РµР№" },
  "6.2": { ...prototypeData["6.2"], title: "РІС‹С‡РёС‚Р°РЅРёРµ РґРµСЃСЏС‚РёС‡РЅС‹С… РґСЂРѕР±РµР№" },
  "6.3": { ...prototypeData["6.3"], title: "СѓРјРЅРѕР¶РµРЅРёРµ РґРµСЃСЏС‚РёС‡РЅС‹С… РґСЂРѕР±РµР№" },
  "6.4": { ...prototypeData["6.4"], title: "РґРµР»РµРЅРёРµ РґРµСЃСЏС‚РёС‡РЅС‹С… РґСЂРѕР±РµР№" },
  "6.5": { ...prototypeData["6.5"], title: "СЃР»РѕР¶РµРЅРёРµ РѕР±С‹РєРЅРѕРІРµРЅРЅС‹С… РґСЂРѕР±РµР№" },
  "6.6": { ...prototypeData["6.6"], title: "РІС‹С‡РёС‚Р°РЅРёРµ РѕР±С‹РєРЅРѕРІРµРЅРЅС‹С… РґСЂРѕР±РµР№" },
  "6.7": { ...prototypeData["6.7"], title: "СѓРјРЅРѕР¶РµРЅРёРµ РѕР±С‹РєРЅРѕРІРµРЅРЅС‹С… РґСЂРѕР±РµР№" },
  "6.8": { ...prototypeData["6.8"], title: "РґРµР»РµРЅРёРµ РѕР±С‹РєРЅРѕРІРµРЅРЅС‹С… РґСЂРѕР±РµР№" },
  "6.9": { ...prototypeData["6.9"], title: "РїСЂРёРІРµРґРµРЅРёРµ Рє Р·Р°РґР°РЅРЅРѕРјСѓ Р·РЅР°РјРµРЅР°С‚РµР»СЋ", items: [["6.9.1", "1/7 + 3/4 (Р·РЅР°РјРµРЅР°С‚РµР»СЊ 56)", "50"], ["6.9.2", "2/3 в€’ 7/13 (Р·РЅР°РјРµРЅР°С‚РµР»СЊ 78)", "10"], ["6.9.3", "3/4 в€’ 8/11 (Р·РЅР°РјРµРЅР°С‚РµР»СЊ 88)", "2"], ["6.9.4", "5/8 + 1/3 (Р·РЅР°РјРµРЅР°С‚РµР»СЊ 48)", "46"], ["6.9.5", "6/7 в€’ 3/5 (Р·РЅР°РјРµРЅР°С‚РµР»СЊ 70)", "18"], ["6.9.6", "7/9 в€’ 2/5 (Р·РЅР°РјРµРЅР°С‚РµР»СЊ 90)", "34"]] },
  "6.10": { ...prototypeData["6.10"], title: "СЃРјРµС€Р°РЅРЅС‹Рµ С‡РёСЃР»Р°" }
});

// Prototype navigation: every card loads the corresponding analogue set from the FIPI bank.
document.querySelectorAll("[data-prototype-cell]").forEach((prototypeCell) => {
  prototypeCell.addEventListener("click", () => renderPrototype(prototypeCell.dataset.prototypeCell));
});
renderPrototype("6.1");
