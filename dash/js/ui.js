const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class") node.className = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? "" : value);
  }

  node.append(...children.flat().filter((child) => child !== null && child !== undefined && child !== false));
  return node;
}

function mount(target, ...nodes) {
  target.replaceChildren(...nodes.flat().filter((node) => node !== null && node !== undefined && node !== false));
}

const icon = (name) => el("i", { class: name, "aria-hidden": "true" });

const PLATFORM_LABEL = { fluxer: "Fluxer", discord: "Discord" };

const dateFormat = { format: (value) => new Intl.DateTimeFormat(document.documentElement.lang || "pt-BR", { dateStyle: "short", timeStyle: "short" }).format(value) };

function formatDate(timestamp) {
  return dateFormat.format(new Date(timestamp));
}

function avatar(item, className = "") {
  const label = (item.nome || "?").charAt(0).toUpperCase();
  const wrapper = el("span", { class: `avatar ${className}`.trim() }, label);
  const source = item.icone || item.avatar;

  if (source) {
    const image = el("img", { src: source, alt: "", referrerpolicy: "no-referrer" });

    image.addEventListener("load", () => mount(wrapper, image));
  }

  return wrapper;
}

function toast(message, type = "ok") {
  const item = el("div", { class: `toast toast--${type}` }, icon(type === "ok" ? "ri-checkbox-circle-line" : "ri-error-warning-line"), el("span", {}, message));

  $("#toasts").append(item);
  setTimeout(() => item.classList.add("is-leaving"), 3200);
  setTimeout(() => item.remove(), 3700);
}

function card(title, description, ...content) {
  return el("section", { class: "card" },
    title ? el("header", { class: "card__head" }, el("h2", { class: "card__title" }, title), description ? el("p", { class: "card__desc" }, description) : null) : null,
    ...content
  );
}

function pageHead(title, description) {
  return el("header", { class: "pagehead" }, el("h1", { class: "pagehead__title" }, title), description ? el("p", { class: "pagehead__desc" }, description) : null);
}

function switchRow({ title, description, checked, disabled = false, onChange }) {
  const button = el("button", {
    class: "switch",
    type: "button",
    role: "switch",
    "aria-checked": String(Boolean(checked)),
    "aria-label": title,
    disabled
  }, el("span", { class: "switch__thumb" }));

  button.addEventListener("click", async () => {
    if (button.disabled) return;
    const next = button.getAttribute("aria-checked") !== "true";

    button.setAttribute("aria-checked", String(next));
    button.disabled = true;
    await onChange(next);
    button.disabled = disabled;
  });

  return el("div", { class: `row${disabled ? " is-disabled" : ""}` },
    el("div", { class: "row__text" }, el("strong", {}, title), description ? el("span", {}, description) : null),
    button
  );
}

function badge(text, tone = "muted") {
  return el("span", { class: `badge badge--${tone}` }, text);
}

function emptyState(iconName, title, text) {
  return el("div", { class: "empty" }, icon(iconName), el("strong", {}, title), el("p", {}, text));
}

function confirmDialog(message) {
  return window.confirm(window.T ? window.T(message) : message);
}
