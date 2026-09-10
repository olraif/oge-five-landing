const quiz = document.getElementById("fractionQuiz");
const result = document.getElementById("quizResult");
const getCell = () => document.querySelector(`[data-prototype-cell="${activePrototype}"]`);
const storagePrefix = "ogeTrainer:v3:math:task6:";
const accountStorage = window.OgeProgressModel?.createAccountProgressStorage(localStorage);
let cloudUser = null;
const cloudPath = ["trainer_progress", "math", "task6"];

const syncCourseView = () => document.body.classList.toggle("task6-view", location.hash === "#trainer");
window.addEventListener("hashchange", syncCourseView);
syncCourseView();

const formatExpression = (value) => value.replace(/(\d+)\s+(\d+)\/(\d+)|(\d+)\/(\d+)/g, (_, whole, mixedNum, mixedDen, num, den) => {
  const prefix = whole ? `${whole} ` : "";
  const top = whole ? mixedNum : num;
  const bottom = whole ? mixedDen : den;
  return `${prefix}<span class="fraction"><sup>${top}</sup><i></i><sub>${bottom}</sub></span>`;
});
const normalizeAnswer = (value) => value
  .trim()
  .replace(/\s+/g, "")
  .replace(".", ",")
  .toLowerCase();

const answers = {
  q1: ["14,2"],
  q2: ["9,1"],
  q3: ["13,3"],
  q4: ["12"],
  q5: ["13"],
  q6: ["14,6"],
  q7: ["16,6"],
  q8: ["17,9"],
  q9: ["12,4"]
};
const prototypeData = {
  "6.1": { title: "Р РЋР С“Р В Р’В»Р В РЎвЂўР В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РўвЂР В Р’ВµР РЋР С“Р РЋР РЏР РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“", items: [["6.1.1","6,8 + 7,4","14,2"],["6.1.2","6,9 + 2,2","9,1"],["6.1.3","7,9 + 5,4","13,3"],["6.1.4","8,3 + 3,7","12"],["6.1.5","8,4 + 4,6","13"],["6.1.6","8,7 + 5,9","14,6"],["6.1.7","8,8 + 7,8","16,6"],["6.1.8","9,3 + 8,6","17,9"],["6.1.9","9,8 + 2,6","12,4"]] },
  "6.2": { title: "Р В Р вЂ Р РЋРІР‚в„–Р РЋРІР‚РЋР В РЎвЂР РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РўвЂР В Р’ВµР РЋР С“Р РЋР РЏР РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“", items: [["6.2.1","4,9 - 4,1","0,8"],["6.2.2","3,6 - 7,3","-3,7"],["6.2.3","3,9 - 1,7","2,2"],["6.2.4","4,4 - 8,2","-3,8"],["6.2.5","4,7 - 7,6","-2,9"],["6.2.6","5,7 - 2,5","3,2"],["6.2.7","6,1 - 4,8","1,3"],["6.2.8","6,4 - 2,4","4"],["6.2.9","9,2 - 9,4","-0,2"]] },
  "6.3": { title: "Р РЋРЎвЂњР В РЎВР В Р вЂ¦Р В РЎвЂўР В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РўвЂР В Р’ВµР РЋР С“Р РЋР РЏР РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“", items: [["6.3.1","2,1 * 7,5","15,75"],["6.3.2","2,3 * 6,2","14,26"],["6.3.3","3,2 * 3,1","9,92"],["6.3.4","5,2 * 5,5","28,6"],["6.3.5","6,7 * 5,3","35,51"],["6.3.6","7,7 * 7,2","55,44"],["6.3.7","8,1 * 4,3","34,83"],["6.3.8","8,9 * 7,1","63,19"],["6.3.9","9,9 * 9,6","95,04"]] },
  "6.4": { title: "Р В РўвЂР В Р’ВµР В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РўвЂР В Р’ВµР РЋР С“Р РЋР РЏР РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“", items: [["6.4.1","4,8 : 1,2","4"],["6.4.2","8,4 : 0,4","21"],["6.4.3","6,8 : 0,4","17"],["6.4.4","11,6 : 2,9","4"],["6.4.5","12,3 : 4,1","3"],["6.4.6","9,6 : 0,4","24"],["6.4.7","13,2 : 0,4","33"],["6.4.8","8,1 : 1,2","6,75"],["6.4.9","6,5 : 0,5","13"]] },
  "6.5": { title: "Р РЋР С“Р В Р’В»Р В РЎвЂўР В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“", items: [["6.5.1","1/2 + 37/20","2,35"],["6.5.2","1/2 + 17/10","2,2"],["6.5.3","1/4 + 19/20","1,2"],["6.5.4","1/5 + 31/20","1,75"],["6.5.5","1/5 + 33/50","0,86"],["6.5.6","1/5 + 37/20","2,05"],["6.5.7","1/10 + 17/10","1,8"],["6.5.8","1/10 + 19/20","1,05"],["6.5.9","1/25 + 53/50","1,1"]] },
  "6.6": { title: "Р В Р вЂ Р РЋРІР‚в„–Р РЋРІР‚РЋР В РЎвЂР РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“", items: [["6.6.1","1/2 - 51/20","-2,05"],["6.6.2","1/2 - 47/10","-4,2"],["6.6.3","1/4 - 41/50","-0,57"],["6.6.4","1/5 - 39/50","-0,58"],["6.6.5","1/5 - 23/20","-0,95"],["6.6.6","1/5 - 7/50","0,06"],["6.6.7","1/10 - 49/20","-2,35"],["6.6.8","1/10 - 13/50","-0,16"],["6.6.9","1/25 - 51/20","-2,51"]] },
  "6.7": { title: "Р РЋРЎвЂњР В РЎВР В Р вЂ¦Р В РЎвЂўР В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“", items: [["6.7.1","5/3 * 6/5","2"],["6.7.2","3/4 * 9/8","0,84375"],["6.7.3","15/4 * 9/8","4,21875"],["6.7.4","2/5 * 6/5","0,48"],["6.7.5","3/5 * 2/3","0,4"],["6.7.6","7/5 * 3/7","0,6"],["6.7.7","9/5 * 25/4","11,25"],["6.7.8","21/5 * 2/3","2,8"],["6.7.9","7/6 * 12/35","0,4"]] },
  "6.8": { title: "Р В РўвЂР В Р’ВµР В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“", items: [["6.8.1","15/4 : 2/15","28,125"],["6.8.2","3/5 : 3/7","1,4"],["6.8.3","3/5 : 2/7","2,1"],["6.8.4","4/5 : 4/11","2,2"],["6.8.5","6/5 : 6/7","1,4"],["6.8.6","12/5 : 3/7","5,6"],["6.8.7","14/5 : 2/7","9,8"],["6.8.8","21/5 : 7/2","1,2"],["6.8.9","7/8 : 2/7","3,0625"]] },
  "6.9": { title: "Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В Р вЂ Р В Р’ВµР В РўвЂР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂќ Р В Р’В·Р В Р’В°Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р В РЎвЂўР В РЎВР РЋРЎвЂњ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’В°Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР вЂ№", items: [["6.9.1","1/7 + 1/3 (знаменатель 42)","20"],["6.9.2","2/3 - 3/5 (знаменатель 45)","3"],["6.9.3","3/4 - 2/5 (знаменатель 60)","21"],["6.9.4","5/8 + 3/4 (знаменатель 40)","55"],["6.9.5","6/7 - 7/13 (знаменатель 91)","29"],["6.9.6","7/9 - 8/11 (знаменатель 99)","5"]] },
  "6.10": { title: "DEMO: Р РЋР С“Р В РЎВР В Р’ВµР РЋРІвЂљВ¬Р В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р РЋРІР‚РЋР В РЎвЂР РЋР С“Р В Р’В»Р В Р’В°", items: [["6.10.1","1 / (1/28 + 1/28)","14"],["6.10.2","1 / (1/36 + 1/44)","19,8"],["6.10.3","1 / (1/21 + 1/63)","15,75"],["6.10.4","1 / (1/14 - 1/28)","28"],["6.10.5","1 / (1/36 - 1/45)","180"],["6.10.6","1 / (1/35 - 1/45)","157,5"],["6.10.7","1 / (1/28 - 1/44)","77"]] }
};
let activePrototype = "6.1";
let activeAnswers = answers;

const applyProgress = (score, submittedAnswers = {}) => {
  const cell = getCell();
  if (!cell) return;
  const total = Object.keys(activeAnswers).length;
  const answered = Object.values(submittedAnswers).filter((value) => normalizeAnswer(String(value || ""))).length;
  cell.classList.remove("is-green", "is-yellow");
  if (total > 0 && score === total) cell.classList.add("is-green");
  else if (answered > 0) cell.classList.add("is-yellow");
  const counter = cell.querySelector("span");
  if (counter) counter.textContent = `${score}/${total}`;
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
  const total = Object.keys(activeAnswers).length;
  const complete = total > 0 && score === total;
  result.innerHTML = `
    <strong>${score}/${total}</strong>
    <p>${complete ? "\u0422\u0438\u043f \u043f\u043e\u043b\u043d\u043e\u0441\u0442\u044c\u044e \u043f\u0440\u043e\u0439\u0434\u0435\u043d" : `\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e: ${score} \u0438\u0437 ${total}`}</p>
    ${misses.length ? `<ul>${misses.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
  `;
};

const getSaved = () => {
  const cloudAttempt = cloudUser?.user_metadata?.trainer_progress?.math?.task6?.[activePrototype];
  if (window.OgeProgressModel?.isAttemptOwnedByAccount(cloudAttempt, cloudUser)) return cloudAttempt;
  return accountStorage?.read(storagePrefix, cloudUser?.id, activePrototype) || null;
};

const validateSavedProgress = (saved, prototype = activePrototype) => {
  if (!saved || typeof saved.answers !== "object") return null;
  if (saved.prototype && saved.prototype !== prototype) return null;
  const score = Object.entries(activeAnswers).reduce((total, [name, valid]) => {
    const value = normalizeAnswer(saved.answers[name] || "");
    return total + (valid.includes(value) ? 1 : 0);
  }, 0);
  if (score !== Number(saved.score)) return null;
  return { ...saved, prototype, score };
};

const clearCurrentAttempt = () => {
  if (quiz) Array.from(quiz.querySelectorAll("input")).forEach((input) => { input.value = ""; });
  applyProgress(0);
  applyQuestionStatuses({});
  showResult(0);
};

const restoreAttempt = (saved) => {
  if (!saved || !quiz) return;
  Object.entries(saved.answers || {}).forEach(([name, value]) => {
    const input = quiz.elements.namedItem(name);
    if (input) input.value = value;
  });
  applyProgress(Number(saved.score), saved.answers || {});
  applyQuestionStatuses(saved.answers || {});
  showResult(Number(saved.score), saved.misses || []);
};

const guideElement = document.querySelector(".trainer-guide");
const defaultGuideMarkup = guideElement?.innerHTML || "";

const renderPrototype = (key, restore = true) => {
  const data = prototypeData[key];
  if (!data || !quiz) return;
  activePrototype = key;
  activeAnswers = Object.fromEntries(data.items.map((item, index) => [`q${index + 1}`, [item[2]]]));

  if (guideElement) {
    guideElement.className = 'trainer-guide trainer-guide--image';
    guideElement.innerHTML = "";
  }
  const caption = document.querySelector(".quiz-caption");
  if (caption) caption.textContent = `\u0422\u0438\u043f ${key} - ${data.title}`;
  const submitButton = quiz.querySelector('button[type="submit"]');
  if (submitButton) submitButton.textContent = "\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0442\u0438\u043f " + key;
  let formatNote = quiz.querySelector(".answer-format-note");
  if (!formatNote) {
    formatNote = document.createElement("p");
    formatNote.className = "answer-format-note";
    caption?.after(formatNote);
  }
  formatNote.textContent = "";
  formatNote.style.display = "none";
  let taskInstruction = quiz.querySelector(".task-instruction");
  if (!taskInstruction) {
    taskInstruction = document.createElement("p");
    taskInstruction.className = "task-instruction";
    caption?.after(taskInstruction);
  }
  const instructions = {
    "6.1": "Вычислите значение выражения.",
    "6.2": "Вычислите значение выражения.",
    "6.3": "Вычислите значение выражения.",
    "6.4": "Вычислите значение выражения.",
    "6.5": "Вычислите значение выражения. Ответ запишите десятичной дробью.",
    "6.6": "Вычислите значение выражения. Ответ запишите десятичной дробью.",
    "6.7": "Вычислите значение выражения. Ответ запишите десятичной дробью.",
    "6.8": "Вычислите значение выражения. Ответ запишите десятичной дробью.",
    "6.9": "Приведите дробь к указанному знаменателю и запишите числитель.",
    "6.10": "Вычислите значение выражения: единица делится на сумму двух дробей."
  };
  taskInstruction.textContent = ({"6.1":"\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f.","6.2":"\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f.","6.3":"\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f.","6.4":"\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f.","6.5":"\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f. \u041e\u0442\u0432\u0435\u0442 \u0437\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0434\u0435\u0441\u044f\u0442\u0438\u0447\u043d\u043e\u0439 \u0434\u0440\u043e\u0431\u044c\u044e.","6.6":"\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f. \u041e\u0442\u0432\u0435\u0442 \u0437\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0434\u0435\u0441\u044f\u0442\u0438\u0447\u043d\u043e\u0439 \u0434\u0440\u043e\u0431\u044c\u044e.","6.7":"\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f. \u041e\u0442\u0432\u0435\u0442 \u0437\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0434\u0435\u0441\u044f\u0442\u0438\u0447\u043d\u043e\u0439 \u0434\u0440\u043e\u0431\u044c\u044e.","6.8":"\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f. \u041e\u0442\u0432\u0435\u0442 \u0437\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0434\u0435\u0441\u044f\u0442\u0438\u0447\u043d\u043e\u0439 \u0434\u0440\u043e\u0431\u044c\u044e.","6.9":"\u041f\u0440\u0438\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0440\u043e\u0431\u044c \u043a \u0443\u043a\u0430\u0437\u0430\u043d\u043d\u043e\u043c\u0443 \u0437\u043d\u0430\u043c\u0435\u043d\u0430\u0442\u0435\u043b\u044e \u0438 \u0437\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0447\u0438\u0441\u043b\u0438\u0442\u0435\u043b\u044c.","6.10":"\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f: \u0435\u0434\u0438\u043d\u0438\u0446\u0430 \u0434\u0435\u043b\u0438\u0442\u0441\u044f \u043d\u0430 \u0441\u0443\u043c\u043c\u0443 \u0434\u0432\u0443\u0445 \u0434\u0440\u043e\u0431\u0435\u0439."})[key] || "";
  const rows = Array.from(quiz.querySelectorAll("label[data-question]"));
  data.items.forEach(([id, expression], index) => {
    const row = rows[index];
    if (!row) return;
    row.style.display = "grid";
    row.dataset.question = `q${index + 1}`;
    row.innerHTML = `${id} <span>${key === "6.10" ? formatComplexFraction(expression) : formatExpression(expression)}</span><input name="q${index + 1}" autocomplete="off">`;
  });
  rows.slice(data.items.length).forEach((row) => { row.style.display = "none"; });
  document.querySelectorAll("[data-prototype-cell]").forEach((button) => {
    button.classList.toggle("is-current", button.dataset.prototypeCell === key);
  });
  applyProgress(0);
  applyQuestionStatuses({});
  showResult(0);
  if (restore) {
    const saved = validateSavedProgress(getSaved(), key);
    if (saved) restoreAttempt(saved);
    else clearCurrentAttempt();
  }
};

const saveCloudProgress = async (payload) => {
  const prototype = activePrototype;
  if (!window.ogeSupabase) return;
  const { data } = await window.ogeSupabase.auth.getSession();
  if (prototype !== activePrototype) return;
  const user = data?.session?.user;
  if (!user) return;
  cloudUser = user;
  const current = user.user_metadata?.trainer_progress || {};
  const normalizedPayload = { ...payload, prototype, ownerId: user.id };
  const next = { ...current, math: { ...(current.math || {}), task6: { ...(current.math?.task6 || {}), [prototype]: normalizedPayload } } };
  const { data: updated, error } = await window.ogeSupabase.auth.updateUser({ data: { trainer_progress: next } });
  if (error) throw error;
  cloudUser = updated?.user || { ...user, user_metadata: { ...user.user_metadata, trainer_progress: next } };
  accountStorage?.write(storagePrefix, user.id, prototype, normalizedPayload);
};

const loadCloudProgress = async () => {
  const requestedPrototype = activePrototype;
  if (!window.ogeHasCourseAccess) return;
  const access = await window.ogeHasCourseAccess("math-first");
  if (requestedPrototype !== activePrototype) return;
  if (access.error || !access.data) {
    accountStorage?.remove(storagePrefix, cloudUser?.id, requestedPrototype);
    clearCurrentAttempt();
    window.location.replace("../../login.html");
    return;
  }
  cloudUser = access.user || null;
  const cloudValue = cloudUser?.user_metadata?.trainer_progress?.math?.task6?.[requestedPrototype];
  const cloudSaved = window.OgeProgressModel?.isAttemptOwnedByAccount(cloudValue, cloudUser)
    ? validateSavedProgress(cloudValue, requestedPrototype)
    : null;
  if (cloudSaved) {
    restoreAttempt(cloudSaved);
    accountStorage?.write(storagePrefix, cloudUser?.id, requestedPrototype, cloudSaved);
    return;
  }
  accountStorage?.remove(storagePrefix, cloudUser?.id, requestedPrototype);
  clearCurrentAttempt();
};
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

    applyProgress(score, submittedAnswers);
    applyQuestionStatuses(submittedAnswers);
    showResult(score, misses);
    try {
      const payload = { prototype: activePrototype, score, total: Object.keys(activeAnswers).length, misses, answers: submittedAnswers, savedAt: new Date().toISOString() };
      accountStorage?.write(storagePrefix, cloudUser?.id, activePrototype, payload);
      saveCloudProgress(payload);
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

Object.assign(prototypeData, {
  "6.1": { ...prototypeData["6.1"], title: "Р РЋР С“Р В Р’В»Р В РЎвЂўР В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РўвЂР В Р’ВµР РЋР С“Р РЋР РЏР РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“" },
  "6.2": { ...prototypeData["6.2"], title: "Р В Р вЂ Р РЋРІР‚в„–Р РЋРІР‚РЋР В РЎвЂР РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РўвЂР В Р’ВµР РЋР С“Р РЋР РЏР РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“" },
  "6.3": { ...prototypeData["6.3"], title: "Р РЋРЎвЂњР В РЎВР В Р вЂ¦Р В РЎвЂўР В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РўвЂР В Р’ВµР РЋР С“Р РЋР РЏР РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“" },
  "6.4": { ...prototypeData["6.4"], title: "Р В РўвЂР В Р’ВµР В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РўвЂР В Р’ВµР РЋР С“Р РЋР РЏР РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“" },
  "6.5": { ...prototypeData["6.5"], title: "Р РЋР С“Р В Р’В»Р В РЎвЂўР В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“" },
  "6.6": { ...prototypeData["6.6"], title: "Р В Р вЂ Р РЋРІР‚в„–Р РЋРІР‚РЋР В РЎвЂР РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“" },
  "6.7": { ...prototypeData["6.7"], title: "Р РЋРЎвЂњР В РЎВР В Р вЂ¦Р В РЎвЂўР В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“" },
  "6.8": { ...prototypeData["6.8"], title: "Р В РўвЂР В Р’ВµР В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р’ВµР В РІвЂћвЂ“" },
  "6.9": { ...prototypeData["6.9"], title: "Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В Р вЂ Р В Р’ВµР В РўвЂР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂќ Р В Р’В·Р В Р’В°Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р В РЎвЂўР В РЎВР РЋРЎвЂњ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’В°Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР вЂ№", items: [["6.9.1","1/7 + 1/3 (знаменатель 42)","20"],["6.9.2","2/3 - 3/5 (знаменатель 45)","3"],["6.9.3","3/4 - 2/5 (знаменатель 60)","21"],["6.9.4","5/8 + 3/4 (знаменатель 40)","55"],["6.9.5","6/7 - 7/13 (знаменатель 91)","29"],["6.9.6","7/9 - 8/11 (знаменатель 99)","5"]] },
  "6.10": { ...prototypeData["6.10"], title: "Р РЋР С“Р В РЎВР В Р’ВµР РЋРІвЂљВ¬Р В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р РЋРІР‚РЋР В РЎвЂР РЋР С“Р В Р’В»Р В Р’В°" }
});

// Prototype navigation: every card loads the selected exercise set.
document.querySelectorAll("[data-prototype-cell]").forEach((prototypeCell) => {
  prototypeCell.addEventListener("click", () => {
    renderPrototype(prototypeCell.dataset.prototypeCell);
    loadCloudProgress();
  });
});
renderPrototype("6.1");

// Readable Russian labels (kept as escapes so every browser decodes them consistently).
Object.keys(prototypeData).forEach((key) => {
  const labels = 
{"6.1":"\u0441\u043b\u043e\u0436\u0435\u043d\u0438\u0435\u0020\u0434\u0435\u0441\u044f\u0442\u0438\u0447\u043d\u044b\u0445\u0020\u0434\u0440\u043e\u0431\u0435\u0439","6.10":"\u0441\u043c\u0435\u0448\u0430\u043d\u043d\u044b\u0435\u0020\u0447\u0438\u0441\u043b\u0430","6.2":"\u0432\u044b\u0447\u0438\u0442\u0430\u043d\u0438\u0435\u0020\u0434\u0435\u0441\u044f\u0442\u0438\u0447\u043d\u044b\u0445\u0020\u0434\u0440\u043e\u0431\u0435\u0439","6.3":"\u0443\u043c\u043d\u043e\u0436\u0435\u043d\u0438\u0435\u0020\u0434\u0435\u0441\u044f\u0442\u0438\u0447\u043d\u044b\u0445\u0020\u0434\u0440\u043e\u0431\u0435\u0439","6.4":"\u0434\u0435\u043b\u0435\u043d\u0438\u0435\u0020\u0434\u0435\u0441\u044f\u0442\u0438\u0447\u043d\u044b\u0445\u0020\u0434\u0440\u043e\u0431\u0435\u0439","6.5":"\u0441\u043b\u043e\u0436\u0435\u043d\u0438\u0435\u0020\u043e\u0431\u044b\u043a\u043d\u043e\u0432\u0435\u043d\u043d\u044b\u0445\u0020\u0434\u0440\u043e\u0431\u0435\u0439","6.6":"\u0432\u044b\u0447\u0438\u0442\u0430\u043d\u0438\u0435\u0020\u043e\u0431\u044b\u043a\u043d\u043e\u0432\u0435\u043d\u043d\u044b\u0445\u0020\u0434\u0440\u043e\u0431\u0435\u0439","6.7":"\u0443\u043c\u043d\u043e\u0436\u0435\u043d\u0438\u0435\u0020\u043e\u0431\u044b\u043a\u043d\u043e\u0432\u0435\u043d\u043d\u044b\u0445\u0020\u0434\u0440\u043e\u0431\u0435\u0439","6.8":"\u0434\u0435\u043b\u0435\u043d\u0438\u0435\u0020\u043e\u0431\u044b\u043a\u043d\u043e\u0432\u0435\u043d\u043d\u044b\u0445\u0020\u0434\u0440\u043e\u0431\u0435\u0439","6.9":"\u043f\u0440\u0438\u0432\u0435\u0434\u0435\u043d\u0438\u0435\u0020\u043a\u0020\u0437\u0430\u0434\u0430\u043d\u043d\u043e\u043c\u0443\u0020\u0437\u043d\u0430\u043c\u0435\u043d\u0430\u0442\u0435\u043b\u044e"}
;
  prototypeData[key].title = labels[key] ? labels[key] : prototypeData[key].title;
});

prototypeData["6.9"].items = [["6.9.1","1/7 + 1/3 (знаменатель 42)","20"],["6.9.2","2/3 - 3/5 (знаменатель 45)","3"],["6.9.3","3/4 - 2/5 (знаменатель 60)","21"],["6.9.4","5/8 + 3/4 (знаменатель 40)","55"],["6.9.5","6/7 - 7/13 (знаменатель 91)","29"],["6.9.6","7/9 - 8/11 (знаменатель 99)","5"]];
prototypeData["6.10"].items = [["6.10.1","1 / (1/28 + 1/28)","14"],["6.10.2","1 / (1/36 + 1/44)","19,8"],["6.10.3","1 / (1/21 + 1/63)","15,75"],["6.10.4","1 / (1/14 - 1/28)","28"],["6.10.5","1 / (1/36 - 1/45)","180"],["6.10.6","1 / (1/35 - 1/45)","157,5"],["6.10.7","1 / (1/28 - 1/44)","77"]];
renderPrototype(activePrototype);

// Final content corrections: task statements and clean fraction expressions.
(() => {
  const taskText = {
    "6.1": "\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f.",
    "6.2": "\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f.",
    "6.3": "\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f.",
    "6.4": "\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f.",
    "6.5": "\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f. \u041e\u0442\u0432\u0435\u0442 \u0437\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0434\u0435\u0441\u044f\u0442\u0438\u0447\u043d\u043e\u0439 \u0434\u0440\u043e\u0431\u044c\u044e.",
    "6.6": "\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f. \u041e\u0442\u0432\u0435\u0442 \u0437\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0434\u0435\u0441\u044f\u0442\u0438\u0447\u043d\u043e\u0439 \u0434\u0440\u043e\u0431\u044c\u044e.",
    "6.7": "\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f. \u041e\u0442\u0432\u0435\u0442 \u0437\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0434\u0435\u0441\u044f\u0442\u0438\u0447\u043d\u043e\u0439 \u0434\u0440\u043e\u0431\u044c\u044e.",
    "6.8": "\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f. \u041e\u0442\u0432\u0435\u0442 \u0437\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0434\u0435\u0441\u044f\u0442\u0438\u0447\u043d\u043e\u0439 \u0434\u0440\u043e\u0431\u044c\u044e.",
    "6.9": "\u041f\u0440\u0438\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0440\u043e\u0431\u044c \u043a \u0443\u043a\u0430\u0437\u0430\u043d\u043d\u043e\u043c\u0443 \u0437\u043d\u0430\u043c\u0435\u043d\u0430\u0442\u0435\u043b\u044e \u0438 \u0437\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0447\u0438\u0441\u043b\u0438\u0442\u0435\u043b\u044c.",
    "6.10": "\u0412\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u0438\u044f: \u0435\u0434\u0438\u043d\u0438\u0446\u0430 \u0434\u0435\u043b\u0438\u0442\u0441\u044f \u043d\u0430 \u0441\u0443\u043c\u043c\u0443 \u0434\u0432\u0443\u0445 \u0434\u0440\u043e\u0431\u0435\u0439."
  };
  prototypeData["6.9"].items = [["6.9.1","1/7 + 1/3 (знаменатель 42)","20"],["6.9.2","2/3 - 3/5 (знаменатель 45)","3"],["6.9.3","3/4 - 2/5 (знаменатель 60)","21"],["6.9.4","5/8 + 3/4 (знаменатель 40)","55"],["6.9.5","6/7 - 7/13 (знаменатель 91)","29"],["6.9.6","7/9 - 8/11 (знаменатель 99)","5"]];
  prototypeData["6.10"].items = [["6.10.1","1 / (1/28 + 1/28)","14"],["6.10.2","1 / (1/36 + 1/44)","19,8"],["6.10.3","1 / (1/21 + 1/63)","15,75"],["6.10.4","1 / (1/14 - 1/28)","28"],["6.10.5","1 / (1/36 - 1/45)","180"],["6.10.6","1 / (1/35 - 1/45)","157,5"],["6.10.7","1 / (1/28 - 1/44)","77"]];
  renderPrototype(activePrototype);
  const caption = quiz?.querySelector(".quiz-caption");
  quiz?.querySelector(".task-instruction")?.remove();
  const instruction = document.createElement("p");
  instruction.className = "task-instruction";
  instruction.textContent = taskText[activePrototype] || "";
  caption?.after(instruction);
  const submit = quiz?.querySelector('button[type="submit"]');
  if (submit) submit.textContent = "\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0442\u0438\u043f " + activePrototype;
  document.querySelectorAll("[data-prototype-cell]").forEach((cell) => cell.addEventListener("click", () => setTimeout(() => {
    document.querySelector(".task-instruction")?.remove();
    const c = quiz?.querySelector(".quiz-caption");
    const i = document.createElement("p"); i.className = "task-instruction"; i.textContent = taskText[activePrototype] || ""; c?.after(i);
    const b = quiz?.querySelector('button[type="submit"]'); if (b) b.textContent = "\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0442\u0438\u043f " + activePrototype;
  }, 0)));
})();function formatComplexFraction(value) {
  const match = value.match(/1 \/ \((\d+\/\d+) ([+\-]) (\d+\/\d+)\)/);
  if (!match) return formatExpression(value);
  return `<span class="complex-fraction"><sup>1</sup><i></i><sub>${formatExpression(match[1])} ${match[2]} ${formatExpression(match[3])}</sub></span>`;
}