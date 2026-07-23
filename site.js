document.documentElement.classList.add("js");
document.getElementById("year").textContent = new Date().getFullYear();

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
