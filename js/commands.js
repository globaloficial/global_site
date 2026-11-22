const ACTIVE_PLATFORM_KEY = "global-commands-platform";

const platformOf = (command) => command.platforms ?? ["fluxer", "discord", "stoat"];

const isTyped = (platform) => PLATFORMS[platform].prefix !== "/";

function createSnippet(command, example, platform) {
  const button = document.createElement("button");
  const typed = [command.name, example.args].filter(Boolean).join(" ");

  button.type = "button";
  button.className = `snippet snippet--${platform}`;
  button.dataset.copy = isTyped(platform) ? `${PLATFORMS[platform].prefix}${typed}` : `/${command.name}`;

  if (isTyped(platform)) {
    button.innerHTML = `<span class="snippet__text"><i>${PLATFORMS[platform].prefix}</i>${escapeHtml(typed)}</span>`;
  } else {
    const option = example.args
      ? `<span class="chip chip--option">argumentos</span><span class="snippet__value">${escapeHtml(example.args)}</span>`
      : "";

    button.innerHTML = `<span class="snippet__text"><span class="chip chip--command">/${escapeHtml(command.name)}</span>${option}</span>`;
  }

  button.insertAdjacentHTML("beforeend", '<span class="snippet__copy">Copiar</span>');

  const wrapper = document.createElement("div");

  wrapper.className = "usage";
  wrapper.append(button);
  if (example.note) wrapper.insertAdjacentHTML("beforeend", `<p class="usage__note">${escapeHtml(example.note)}</p>`);

  return wrapper;
}

function createVariables(command) {
  if (command.variables.length === 0) return '<p class="command__empty">Este comando não tem variáveis.</p>';

  const items = command.variables.map(({ name, values, text, optional }) => `
    <li class="variable">
      <div class="variable__head">
        <code>${escapeHtml(name)}</code>
        ${values ? `<span class="variable__values">${escapeHtml(values)}</span>` : ""}
        ${optional ? '<span class="variable__optional">opcional</span>' : ""}
      </div>
      <p>${escapeHtml(text)}</p>
    </li>`);

  return `<ul class="variables">${items.join("")}</ul>`;
}

function createCommand(command, platform) {
  const article = document.createElement("article");
  const aliases = isTyped(platform) ? (command.aliases ?? []) : [];
  const prefix = PLATFORMS[platform].prefix;

  article.className = "command";
  article.setAttribute("data-reveal", "up");
  article.setAttribute("data-reveal", "up");
  article.id = `${platform}-${command.name}`;
  article.dataset.search = [command.name, ...aliases, command.description].join(" ").toLowerCase();
  article.innerHTML = `
    <header class="command__head">
      <h3 class="command__name"><i>${prefix}</i>${escapeHtml(command.name)}</h3>
      <div class="command__tags">
        ${aliases.map((alias) => `<span class="tag">${prefix}${escapeHtml(alias)}</span>`).join("")}
        ${command.permission ? `<span class="tag tag--permission"><svg class="icon" aria-hidden="true"><use href="#shield"/></svg>${escapeHtml(command.permission)}</span>` : ""}
      </div>
    </header>
    <p class="command__text">${escapeHtml(command.description)}</p>
    <div class="command__columns">
      <div>
        <h4 class="command__label">Variáveis</h4>
        ${createVariables(command)}
      </div>
      <div>
        <h4 class="command__label">Como usar</h4>
        <div class="usages"></div>
      </div>
    </div>`;

  article.querySelector(".usages").append(...command.examples.map((example) => createSnippet(command, example, platform)));

  return article;
}

function createGroup(group, platform) {
  const commands = group.commands.filter((command) => platformOf(command).includes(platform));
  const section = document.createElement("section");

  section.className = "group";
  section.innerHTML = `
    <header class="group__head">
      <h2 class="group__title">${escapeHtml(group.title)}</h2>
      <p>${escapeHtml(group.text)}</p>
    </header>
    <div class="group__list"></div>`;

  section.querySelector(".group__list").append(...commands.map((command) => createCommand(command, platform)));

  return section;
}

function renderPlatforms() {
  Object.keys(PLATFORMS).forEach((platform) => {
    const panel = $(`#panel-${platform}`);

    panel.append(...COMMAND_GROUPS.map((group) => createGroup(group, platform)));
    panel.insertAdjacentHTML("afterbegin", `<p class="commands__note">${escapeHtml(PLATFORMS[platform].note)}</p>`);
    panel.insertAdjacentHTML("beforeend", '<p class="commands__empty" hidden>Nenhum comando encontrado.</p>');
  });
}

function selectPlatform(platform) {
  $$("[role='tab']").forEach((tab) => {
    const selected = tab.dataset.platform === platform;

    tab.setAttribute("aria-selected", selected);
    tab.tabIndex = selected ? 0 : -1;
  });

  $$("[role='tabpanel']").forEach((panel) => {
    panel.hidden = panel.id !== `panel-${platform}`;
  });

  try {
    localStorage.setItem(ACTIVE_PLATFORM_KEY, platform);
  } catch {}

  filterCommands();
}

function initTabs() {
  const tabs = $$("[role='tab']");
  const fromHash = location.hash.slice(1);
  let saved = null;

  try {
    saved = localStorage.getItem(ACTIVE_PLATFORM_KEY);
  } catch {}

  tabs.forEach((tab) => tab.addEventListener("click", () => selectPlatform(tab.dataset.platform)));

  $(".tabs").addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    const next = tabs.find((tab) => tab !== document.activeElement) ?? tabs[0];

    next.focus();
    selectPlatform(next.dataset.platform);
  });

  selectPlatform(PLATFORMS[fromHash] ? fromHash : PLATFORMS[saved] ? saved : "fluxer");
}

function filterCommands() {
  const query = $("#commands-search").value.trim().toLowerCase();
  const panel = $("[role='tabpanel']:not([hidden])");
  let visible = 0;

  $$(".command", panel).forEach((command) => {
    const match = command.dataset.search.includes(query);

    command.hidden = !match;
    if (match) visible += 1;
  });

  $$(".group", panel).forEach((group) => {
    group.hidden = $$(".command:not([hidden])", group).length === 0;
  });

  $(".commands__empty", panel).hidden = visible > 0;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function initCopy() {
  document.addEventListener("click", async (event) => {
    const snippet = event.target.closest(".snippet");
    if (!snippet) return;

    const label = $(".snippet__copy", snippet);
    const copied = await copyText(snippet.dataset.copy);

    label.textContent = copied ? "Copiado" : "Selecione e copie";
    snippet.classList.toggle("is-copied", copied);

    setTimeout(() => {
      label.textContent = "Copiar";
      snippet.classList.remove("is-copied");
    }, 1600);
  });
}

renderPlatforms();
initTabs();
initCopy();
$("#commands-search").addEventListener("input", filterCommands);
