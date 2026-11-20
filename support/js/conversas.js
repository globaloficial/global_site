const STATUS_LABELS = { aberta: "Aberta", andamento: "Em andamento", resolvida: "Resolvida" };
const DRAFT_KEY = "global-suporte-rascunho";
const LIST_REFRESH_MS = 20_000;
const CHAT_REFRESH_MS = 10_000;

const dateFormat = { format: (value) => new Intl.DateTimeFormat(document.documentElement.lang || "pt-BR", { dateStyle: "short", timeStyle: "short" }).format(value) };

const view = {
  filter: "todas",
  conversations: [],
  openId: null,
  chatTimer: null
};

function formatDate(timestamp) {
  return dateFormat.format(new Date(timestamp));
}

function element(tag, className, text) {
  const node = document.createElement(tag);

  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function avatarNode(person, size = "") {
  const wrapper = element("span", `avatar ${size}`.trim());

  if (person.avatar) {
    const image = document.createElement("img");

    image.src = person.avatar;
    image.alt = "";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => {
      image.remove();
      wrapper.textContent = person.nome.charAt(0).toUpperCase();
    });
    wrapper.append(image);
  } else {
    wrapper.textContent = person.nome.charAt(0).toUpperCase();
  }

  return wrapper;
}

function statusBadge(status) {
  return element("span", `status status--${status}`, STATUS_LABELS[status] || status);
}

function saveDraft(subject, text) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ subject, text }));
  } catch {}
}

function takeDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    sessionStorage.removeItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function renderSession() {
  const user = Session.user;
  const bar = $("#session-bar");

  bar.replaceChildren();

  if (!user) {
    bar.append(element("span", "session__hint", "Entre para falar com a equipe e acompanhar suas conversas."));

    ["fluxer", "discord"].forEach((provider) => {
      const link = element("a", "btn btn--line btn--small", `Entrar com ${provider === "fluxer" ? "Fluxer" : "Discord"}`);

      link.href = Session.loginUrl(provider);
      bar.append(link);
    });
  } else {
    const who = element("span", "session__user");
    const name = element("strong", "", user.nome);

    who.append(avatarNode(user, "avatar--small"), name);
    if (user.equipe) who.append(element("span", "tag", "Equipe"));

    const logout = element("button", "btn btn--line btn--small", "Sair");

    logout.type = "button";
    logout.addEventListener("click", async () => {
      await Session.logout();
      stopChat();
      view.conversations = [];
      renderAll();
    });

    bar.append(who, logout);
  }

  $$("[data-auth]").forEach((item) => (item.hidden = !user));
  $$("[data-staff]").forEach((item) => (item.hidden = !user || !user.equipe));
}

function renderTabs() {
  $$(".tabs__button", $("#conv-tabs")).forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === view.filter);
  });
}

function renderConversations() {
  const list = $("#conv-list");
  const empty = $("#conv-empty");
  const staff = Boolean(Session.user && Session.user.equipe);
  const items = view.conversations.filter((item) => view.filter === "todas" || item.status === view.filter);

  list.replaceChildren();
  empty.hidden = items.length > 0;
  empty.textContent = view.conversations.length === 0
    ? (staff ? "Nenhuma conversa foi iniciada ainda." : "Você ainda não iniciou nenhuma conversa com a equipe.")
    : "Nenhuma conversa com esse status.";

  items.forEach((item) => {
    const row = element("button", "conv");

    row.type = "button";
    row.dataset.id = item.id;

    const head = element("span", "conv__head");

    head.append(element("span", "conv__number", `#${item.id}`), statusBadge(item.status));

    const main = element("span", "conv__main");

    main.append(element("strong", "conv__subject", item.assunto), element("span", "conv__preview", item.ultimaMensagem));

    const meta = element("span", "conv__meta");

    if (staff) meta.append(avatarNode(item.autor, "avatar--small"), element("span", "", item.autor.nome));
    meta.append(element("time", "", formatDate(item.atualizadoEm)));

    row.append(head, main, meta);
    row.addEventListener("click", () => openChat(item.id));
    list.append(row);
  });
}

function renderAll() {
  renderSession();
  renderTabs();
  renderConversations();
}

async function loadConversations() {
  if (!Session.user) return;

  try {
    const data = await apiRequest("/suporte/conversas");
    view.conversations = data.conversas;
    renderConversations();
  } catch (error) {
    if (error.status === 401) {
      Session.user = null;
      renderAll();
    }
  }
}

function renderChat(conversation) {
  const user = Session.user;
  const staff = Boolean(user && user.equipe);
  const thread = $("#chat-thread");
  const nearBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 80;

  $("#chat-title").textContent = conversation.assunto;
  $("#chat-number").textContent = `#${conversation.id}`;

  const badge = $("#chat-status");

  badge.replaceChildren(statusBadge(conversation.status));
  if (staff) badge.append(element("span", "chat__author", `por ${conversation.autor.nome}`));

  thread.replaceChildren();
  conversation.mensagens.forEach((message) => {
    const mine = !message.equipe && message.autor.id === user.id;
    const bubble = element("div", `msg${message.equipe ? " msg--team" : ""}${mine ? " msg--mine" : ""}`);
    const head = element("div", "msg__head");

    head.append(avatarNode(message.autor, "avatar--small"), element("strong", "", message.autor.nome));
    if (message.equipe) head.append(element("span", "tag", "Equipe"));
    head.append(element("time", "", formatDate(message.em)));

    bubble.append(head, element("p", "msg__text", message.texto));
    thread.append(bubble);
  });

  if (nearBottom || thread.dataset.fresh === "1") thread.scrollTop = thread.scrollHeight;
  thread.dataset.fresh = "0";

  $("#chat-controls").hidden = !staff;
  $$("[data-set-status]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.setStatus === conversation.status);
  });

  const closed = conversation.status === "resolvida" && !staff;

  $("#chat-form").hidden = closed;
  $("#chat-closed").hidden = !closed;
}

async function refreshChat() {
  if (view.openId === null) return;

  try {
    renderChat(await apiRequest(`/suporte/conversas/${view.openId}`));
  } catch (error) {
    if (error.status === 404 || error.status === 401) closeChat();
  }
}

function stopChat() {
  clearInterval(view.chatTimer);
  view.chatTimer = null;
  view.openId = null;

  const dialog = $("#chat-dialog");

  if (dialog.open) dialog.close();
}

function closeChat() {
  stopChat();
  loadConversations();
}

async function openChat(id) {
  view.openId = id;

  const dialog = $("#chat-dialog");

  $("#chat-thread").dataset.fresh = "1";
  $("#chat-error").textContent = "";
  $("#chat-text").value = "";

  try {
    renderChat(await apiRequest(`/suporte/conversas/${id}`));
  } catch (error) {
    view.openId = null;
    alert(error.message);
    return;
  }

  if (!dialog.open) dialog.showModal();
  clearInterval(view.chatTimer);
  view.chatTimer = setInterval(refreshChat, CHAT_REFRESH_MS);
}

function initChat() {
  const dialog = $("#chat-dialog");

  $("[data-chat-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", closeChat);

  $("#chat-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = $("#chat-text");
    const error = $("#chat-error");
    const button = $("#chat-send");

    if (!text.value.trim()) return;

    button.disabled = true;
    error.textContent = "";

    try {
      const conversation = await apiRequest(`/suporte/conversas/${view.openId}/mensagens`, {
        method: "POST",
        body: { texto: text.value }
      });

      text.value = "";
      $("#chat-thread").dataset.fresh = "1";
      renderChat(conversation);
    } catch (failure) {
      error.textContent = failure.message;
    } finally {
      button.disabled = false;
    }
  });

  $$("[data-set-status]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        renderChat(await apiRequest(`/suporte/conversas/${view.openId}`, {
          method: "PATCH",
          body: { status: button.dataset.setStatus }
        }));
      } catch (failure) {
        $("#chat-error").textContent = failure.message;
      }
    });
  });
}

function initTabs() {
  $$(".tabs__button", $("#conv-tabs")).forEach((button) => {
    button.addEventListener("click", () => {
      view.filter = button.dataset.filter;
      renderTabs();
      renderConversations();
    });
  });
}

function initAsk() {
  const dialog = $("#ask-dialog");
  const subject = $("#ask-subject");
  const text = $("#ask-question");
  const input = $("#search-input");
  const error = $("#ask-error");

  const open = () => {
    const logged = Boolean(Session.user);

    $("#ask-login").hidden = logged;
    $("#ask-form").hidden = !logged;
    error.textContent = "";

    if (!text.value.trim()) text.value = input.value.trim();
    if (!subject.value.trim()) subject.value = input.value.trim().slice(0, 120);

    dialog.showModal();
    (logged ? (subject.value ? text : subject) : dialog).focus();
  };

  $("#search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    open();
  });
  $$("[data-ask]").forEach((button) => button.addEventListener("click", open));
  $("[data-ask-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  $$("[data-login]", dialog).forEach((link) => {
    link.href = Session.loginUrl(link.dataset.login);
    link.addEventListener("click", () => saveDraft(subject.value, text.value));
  });

  $("#ask-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = $("#ask-send");

    button.disabled = true;
    error.textContent = "";

    try {
      const conversation = await apiRequest("/suporte/conversas", {
        method: "POST",
        body: { assunto: subject.value, texto: text.value }
      });

      subject.value = "";
      text.value = "";
      input.value = "";
      filterFaq("");
      dialog.close();
      await loadConversations();
      openChat(conversation.id);
    } catch (failure) {
      error.textContent = failure.message;
    } finally {
      button.disabled = false;
    }
  });

  return { open, subject, text };
}

async function initConversations() {
  initTabs();
  initChat();

  const ask = initAsk();

  await Session.load();
  renderAll();

  const params = new URLSearchParams(location.search);
  const status = params.get("login");

  if (status) history.replaceState(null, "", location.pathname + location.hash);

  if (status === "ok" && Session.user) {
    const draft = takeDraft();

    if (draft) {
      ask.subject.value = draft.subject || "";
      ask.text.value = draft.text || "";
      ask.open();
    }
  } else if (status === "erro" || status === "indisponivel") {
    $("#session-error").textContent = status === "erro"
      ? "Não foi possível concluir o login. Tente novamente."
      : "O login está indisponível no momento.";
  }

  await loadConversations();
  setInterval(() => {
    if (!document.hidden && view.openId === null) loadConversations();
  }, LIST_REFRESH_MS);
}

initConversations();
