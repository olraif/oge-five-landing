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

const contactUrls = {
  max: "https://max.ru/u/f9LHodD0cOJ-WhJxLmY8QmF0qkpfQyUtIpdxsmy0NXN-tXKcYjrT8ztesFg",
  vk: "https://vk.com/olraif",
  telegram: "https://t.me/olraif",
};

const configureContactLink = (link, url, label) => {
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  if (label) link.textContent = label;
  return link;
};

document.querySelectorAll("a").forEach((link) => {
  const label = link.textContent.trim().toLowerCase();
  if (label === "\u0432\u043a") configureContactLink(link, contactUrls.vk);
  if (label === "telegram") configureContactLink(link, contactUrls.telegram);
  if (label === "\u043d\u0430\u043f\u0438\u0441\u0430\u0442\u044c \u0432 max") {
    configureContactLink(link, contactUrls.max, "MAX");
  }
});

const createContactLink = (source, url, label) => {
  const link = source.cloneNode(false);
  return configureContactLink(link, url, label);
};

const headerMax = document.querySelector('.site-header .header-message[href*="max.ru"]');
if (headerMax && !document.querySelector(".header-contacts")) {
  const group = document.createElement("div");
  group.className = "header-contacts";
  group.setAttribute("aria-label", "\u0421\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f \u0441 \u043f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u0435\u043c");
  headerMax.replaceWith(group);
  group.append(
    configureContactLink(headerMax, contactUrls.max, "MAX"),
    createContactLink(headerMax, contactUrls.vk, "\u0412\u041a"),
    createContactLink(headerMax, contactUrls.telegram, "Telegram"),
  );
}

const heroMessageGroup = document.querySelector(".hero .message-actions");
if (heroMessageGroup && !heroMessageGroup.querySelector('[href*="vk.com"]')) {
  const maxLink = heroMessageGroup.querySelector('a[href*="max.ru"]');
  if (maxLink) {
    configureContactLink(maxLink, contactUrls.max, "MAX");
    heroMessageGroup.append(
      createContactLink(maxLink, contactUrls.vk, "\u0412\u041a"),
      createContactLink(maxLink, contactUrls.telegram, "Telegram"),
    );
    const primaryMax = document.querySelector('.hero-actions > .button--primary[href*="max.ru"]');
    if (primaryMax) primaryMax.remove();
  }
}
