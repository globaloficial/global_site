const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const stem = (term) => (term.length > 5 ? term.slice(0, term.length - 2) : term);

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

function renderFaq() {
  const list = $("#faq-list");

  FAQ_GROUPS.forEach((group) => {
    const section = document.createElement("div");

    section.className = "faq__group";
    section.innerHTML = `<h3 class="faq__title">${group.title}</h3>`;

    group.items.forEach((item) => {
      const details = document.createElement("details");

      details.className = "faq__item";
      details.dataset.search = normalize(`${item.question} ${item.answer.replace(/<[^>]+>/g, " ")}`);
      details.innerHTML = `
        <summary class="faq__question">${item.question}<svg class="icon" aria-hidden="true"><use href="#plus"/></svg></summary>
        <p class="faq__answer">${item.answer}</p>`;

      section.append(details);
    });

    list.append(section);
  });
}

function filterFaq(query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean).map(stem);
  let visible = 0;

  $$(".faq__item").forEach((item) => {
    const match = terms.every((term) => item.dataset.search.includes(term));

    item.hidden = !match;
    if (match) visible += 1;
  });

  $$(".faq__group").forEach((group) => {
    group.hidden = $$(".faq__item:not([hidden])", group).length === 0;
  });

  $("#faq-empty").hidden = visible > 0;
  $("#search-count").textContent = terms.length === 0 ? "" : `${visible} resultado${visible === 1 ? "" : "s"} nas perguntas frequentes`;
}

function initSearch() {
  const input = $("#search-input");

  input.addEventListener("input", () => filterFaq(input.value));
}

initTheme();
initMenu();
renderFaq();
initReveal();
initSearch();
