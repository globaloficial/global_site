const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const stem = (term) => (term.length > 5 ? term.slice(0, term.length - 2) : term);

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

renderFaq();
initSearch();
