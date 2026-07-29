document.documentElement.classList.add("js");

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const trackGoal = (goalName) => {
  if (typeof window.ym !== "function" || !window.METRIKA_COUNTER_ID) return;
  window.ym(window.METRIKA_COUNTER_ID, "reachGoal", goalName);
};

document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
  link.addEventListener("click", () => trackGoal("CALL_CLICK"));
});

document.querySelectorAll('a[href*="max.ru"]').forEach((link) => {
  link.addEventListener("click", () => trackGoal("MAX_CLICK"));
});

const revealItems = [...document.querySelectorAll("[data-reveal]")];

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
  requestAnimationFrame(() => {
    revealItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.15 && rect.bottom > 0) {
        item.classList.add("is-visible");
      }
    });
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
