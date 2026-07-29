const quiz = document.getElementById("fractionQuiz");
const result = document.getElementById("quizResult");

const normalizeAnswer = (value) => value
  .trim()
  .replace(/\s+/g, "")
  .replace(".", ",")
  .toLowerCase();

const answers = {
  q1: ["15,3"],
  q2: ["1,4"],
  q3: ["8,16"],
  q4: ["6"],
  q5: ["8/5", "1,6", "1 3/5"]
};

if (quiz && result) {
  quiz.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(quiz);
    let score = 0;
    const misses = [];

    Object.entries(answers).forEach(([name, valid], index) => {
      const userAnswer = normalizeAnswer(data.get(name) || "");
      if (valid.includes(userAnswer)) {
        score += 1;
      } else {
        misses.push(`06.0${index + 1}`);
      }
    });

    const status = score === 5
      ? "Первые 5 прототипов закрыты"
      : "Есть прототипы, которые нужно повторить";

    result.innerHTML = `
      <strong>${score}/5 · ${status}</strong>
      <p>${score === 5 ? "Можно переходить к следующим типам дробей." : "Вернитесь к видео и практике по ошибочным прототипам."}</p>
      ${misses.length ? `<ul>${misses.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
    `;

    if (typeof window.ym === "function" && window.METRIKA_COUNTER_ID) {
      window.ym(window.METRIKA_COUNTER_ID, "reachGoal", "MATH_PART_ONE_TEST");
    }
  });
}
