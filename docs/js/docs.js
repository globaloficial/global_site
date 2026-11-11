const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function initTheme() {
  const root = document.documentElement;

  try {
    const saved = localStorage.getItem("global-theme");
    if (saved) root.dataset.theme = saved;
  } catch {}

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    try {
      localStorage.setItem("global-theme", theme);
    } catch {}
  };

  const switchTheme = (originX, originY) => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";

    if (!document.startViewTransition) {
      applyTheme(next);
      return;
    }

    const transition = document.startViewTransition(() => applyTheme(next));
    transition.ready.then(() => {
      const radius = Math.hypot(
        Math.max(originX, innerWidth - originX),
        Math.max(originY, innerHeight - originY)
      );

      root.animate(
        { clipPath: [`circle(0 at ${originX}px ${originY}px)`, `circle(${radius}px at ${originX}px ${originY}px)`] },
        { duration: 900, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  };

  $$("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const { left, top, width, height } = button.getBoundingClientRect();
      switchTheme(left + width / 2, top + height / 2);
    });
  });
}

function initMenu() {
  const menu = $("#menu");

  $("[data-menu-open]").addEventListener("click", () => menu.showModal());
  $("[data-menu-close]").addEventListener("click", () => menu.close());
  $$("a", menu).forEach((link) => link.addEventListener("click", () => menu.close()));
}

function initReveal() {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      reveal.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  $$(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${(index % 3) * 100}ms`;
    reveal.observe(element);
  });
}

function initContents() {
  const links = $$(".toc__link");
  if (links.length === 0) return;

  const sections = links.map((link) => $(link.getAttribute("href")));

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-20% 0px -70% 0px" });

  sections.forEach((section) => spy.observe(section));
}

initTheme();
initMenu();
initReveal();
initContents();
