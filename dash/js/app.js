function initTheme() {
  const root = document.documentElement;

  try {
    const saved = localStorage.getItem("global-theme");
    if (saved) root.dataset.theme = saved;
  } catch {}

  return () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";

    root.dataset.theme = next;
    try {
      localStorage.setItem("global-theme", next);
    } catch {}
  };
}

const toggleTheme = initTheme();

function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);

  if (parts[0] === "s" && parts[1] && parts[2]) return { type: "server", plataforma: parts[1], id: parts[2], section: parts[3] || "" };
  if (parts[0] === "equipe") return { type: "team", section: parts[1] || "servidores" };
  return { type: "servers" };
}

function navLink(href, iconName, label, active) {
  return el("a", { class: `nav__link${active ? " is-active" : ""}`, href, "aria-current": active ? "page" : null }, icon(iconName), el("span", {}, label));
}

function renderSide(route) {
  const side = $("#side");
  const user = Session.user;
  const nav = el("nav", { class: "nav" });

  if (route.type === "server" && state.server) {
    const { servidor } = state.server;

    mount(side);
    nav.append(
      el("div", { class: "side__server" }, avatar(servidor, "avatar--xl"), el("strong", {}, servidor.nome), badge(PLATFORM_LABEL[servidor.plataforma], "brand")),
      el("a", { class: "btn btn--line btn--small side__back", href: "#/" }, icon("ri-arrow-left-s-line"), "Voltar aos servidores"),
      el("p", { class: "nav__label" }, "Servidor"),
      ...SERVER_SECTIONS.map((item) => navLink(`#/s/${servidor.plataforma}/${servidor.id}${item.id ? `/${item.id}` : ""}`, item.icon, item.label, route.section === item.id))
    );
  } else {
    nav.append(el("p", { class: "nav__label" }, "Painel"), navLink("#/", "ri-server-line", "Seus servidores", route.type === "servers"));
  }

  if (user.equipe) {
    nav.append(
      el("p", { class: "nav__label" }, "Equipe"),
      ...TEAM_SECTIONS.map((item) => navLink(`#/equipe/${item.id}`, item.icon, item.label, route.type === "team" && route.section === item.id))
    );
  }

  const theme = el("button", { class: "iconbtn", type: "button", "aria-label": "Alternar tema", onclick: toggleTheme }, icon("ri-contrast-2-line"));
  const logout = el("button", { class: "iconbtn", type: "button", "aria-label": "Sair", onclick: async () => {
    await Session.logout();
    start();
  } }, icon("ri-logout-box-r-line"));

  mount(side, 
    el("a", { class: "side__logo", href: "#/", "aria-label": "Global — painel" }, el("img", { src: "assets/wordmark.svg", alt: "", width: "1920", height: "1157" })),
    nav,
    el("div", { class: "side__user" },
      avatar(user, "avatar--small"),
      el("span", { class: "side__name" }, el("strong", {}, user.nome), user.equipe ? badge("Equipe", "brand") : null),
      theme,
      logout
    )
  );
}

async function loadServer(route, token) {
  const current = state.server && state.server.servidor;

  if (current && current.plataforma === route.plataforma && current.id === route.id) return true;

  state.server = null;
  mount($("#view"), el("p", { class: "muted" }, "Carregando…"));

  try {
    const data = await apiRequest(`/dash/servidores/${route.plataforma}/${route.id}`);
    if (!isCurrent(token)) return false;
    state.server = data;
    return true;
  } catch (error) {
    if (isCurrent(token)) {
      renderSide({ type: "servers" });
      mount($("#view"), emptyState("ri-lock-line", "Não foi possível abrir este servidor", error.message), el("a", { class: "btn btn--line", href: "#/" }, "Voltar aos servidores"));
    }
    return false;
  }
}

async function renderRoute() {
  if (!Session.user) return;

  const token = ++state.token;
  const route = parseRoute();
  const view = $("#view");

  if (route.type !== "server") state.server = null;

  closeMenu();
  window.scrollTo(0, 0);

  if (route.type === "server") {
    if (!(await loadServer(route, token))) return;
    renderSide(route);
    document.title = `${state.server.servidor.nome} — Painel do Global`;
    (SERVER_PAGES[route.section] || pageOverview)(view, token);
    return;
  }

  renderSide(route);

  if (route.type === "team") {
    if (!Session.user.equipe) {
      mount(view, emptyState("ri-lock-line", "Área restrita", "Esta área é só para a equipe do Global."));
      return;
    }
    document.title = "Equipe — Painel do Global";
    if (route.section === "filtro") return pageTeamFilter(view, token);
    if (route.section === "bloqueios") return pageTeamBlocks(view, token);
    return pageServers(view, token, true);
  }

  document.title = "Painel — Global";
  pageServers(view, token, false);
}

function openMenu() {
  $("#side").classList.add("is-open");
  $("#scrim").classList.add("is-open");
}

function closeMenu() {
  $("#side").classList.remove("is-open");
  $("#scrim").classList.remove("is-open");
}

function showLogin() {
  $("#shell").hidden = true;
  $("#login").hidden = false;
  $$("[data-login]").forEach((link) => {
    link.href = Session.loginUrl(link.dataset.login);
  });
}

async function start() {
  if (!Session.user) await Session.load();

  if (!Session.user) {
    showLogin();
    return;
  }

  $("#login").hidden = true;
  $("#shell").hidden = false;
  renderRoute();
}

function init() {
  const params = new URLSearchParams(location.search);
  const status = params.get("login");

  if (status) history.replaceState(null, "", location.pathname + location.hash);
  if (status === "erro") $("#login-error").textContent = "Não foi possível concluir o login. Tente novamente.";
  if (status === "indisponivel") $("#login-error").textContent = "O login está indisponível no momento.";

  $("#menu-open").addEventListener("click", openMenu);
  $("#scrim").addEventListener("click", closeMenu);
  window.addEventListener("hashchange", renderRoute);

  start();
}

init();
