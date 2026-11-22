const state = { server: null, token: 0 };

const FIELD_LABELS = {
  canalId: "Canal da conexão",
  pausado: "Conexão pausada",
  filtrarPalavroes: "Filtro de palavrões",
  filtrarLinks: "Filtro de links",
  ocultarServidor: "Ocultar nome do servidor",
  ocultarPerfil: "Ocultar link do perfil",
  ocultarInfoRecebida: "Ocultar info dos outros servidores",
  mostrarIcone: "Ícone do servidor (embed)",
  modoEnvio: "Modo de envio",
  cor: "Cor das mensagens"
};

const PONTE_LOG = {
  "ponte:criar": "criou a ponte",
  "ponte:entrar": "entrou na ponte",
  "ponte:sair": "tirou este servidor da ponte",
  "ponte:remover": "removeu um servidor da ponte",
  "ponte:removido": "teve este servidor removido da ponte",
  "ponte:encerrar": "encerrou a ponte",
  "ponte:renomear": "renomeou a ponte",
  "ponte:pausa": "mudou a pausa da ponte"
};

const SERVER_SECTIONS = [
  { id: "", label: "Visão geral", icon: "ri-dashboard-line" },
  { id: "conexao", label: "Conexão Global", icon: "ri-global-line" },
  { id: "pontes", label: "Pontes", icon: "ri-links-line" },
  { id: "filtros", label: "Filtros", icon: "ri-shield-check-line" },
  { id: "mensagens", label: "Mensagens", icon: "ri-chat-settings-line" },
  { id: "logs", label: "Registro de alterações", icon: "ri-history-line" }
];

const TEAM_SECTIONS = [
  { id: "servidores", label: "Todos os servidores", icon: "ri-server-line" },
  { id: "filtro", label: "Filtro global", icon: "ri-filter-3-line" },
  { id: "bloqueios", label: "Bloqueios", icon: "ri-forbid-2-line" }
];

function serverBase() {
  const { plataforma, id } = state.server.servidor;
  return `#/s/${plataforma}/${id}`;
}

function isCurrent(token) {
  return token === state.token;
}

async function saveServer(body) {
  const { plataforma, id } = state.server.servidor;

  try {
    state.server = await apiRequest(`/dash/servidores/${plataforma}/${id}`, { method: "PATCH", body });
    toast("Alterações salvas");
  } catch (error) {
    toast(error.message, "error");
  }

  renderRoute();
}

function formatValue(campo, valor) {
  if (valor === null || valor === undefined) return campo === "canalId" ? "nenhum" : "padrão";
  if (typeof valor === "boolean") return valor ? "ligado" : "desligado";
  if (campo === "canalId") {
    const canal = state.server && state.server.canais.find((item) => item.id === valor);
    return canal ? `#${canal.nome}` : valor;
  }
  if (campo === "modoEnvio") return valor === "webhook" ? "Webhook" : "Embed";
  return String(valor);
}

function serverLink(item) {
  const status = item.bloqueado ? badge("Bloqueado", "danger")
    : item.pausado ? badge("Pausado", "warn")
      : item.conectado ? badge("Conectado", "ok") : badge("Desconectado");

  return el("a", { class: "server", href: `#/s/${item.plataforma}/${item.id}` },
    avatar(item, "avatar--large"),
    el("span", { class: "server__info" },
      el("strong", { class: "server__name" }, item.nome),
      el("span", { class: "server__meta" }, badge(PLATFORM_LABEL[item.plataforma], "brand"), status)
    ),
    icon("ri-arrow-right-s-line")
  );
}

async function pageServers(view, token, team) {
  const title = team ? "Todos os servidores" : "Seus servidores";
  const desc = team ? "Todos os servidores onde o Global está, nas três plataformas." : "Servidores onde o Global está e você tem Administrador ou Gerenciar Canais.";

  mount(view, pageHead(title, desc), el("p", { class: "muted" }, "Carregando…"));

  let lista;
  try {
    lista = (await apiRequest(team ? "/dash/equipe/servidores" : "/dash/servidores")).servidores;
  } catch (error) {
    if (isCurrent(token)) mount(view, pageHead(title, desc), emptyState("ri-error-warning-line", "Não foi possível carregar", error.message));
    return;
  }
  if (!isCurrent(token)) return;

  const grid = el("div", { class: "servers" });
  const search = el("input", { class: "input", type: "search", placeholder: "Buscar servidor", "aria-label": "Buscar servidor" });

  const draw = () => {
    const termo = search.value.trim().toLowerCase();
    const itens = lista.filter((item) => item.nome.toLowerCase().includes(termo));

    mount(grid, ...(itens.length
      ? itens.map(serverLink)
      : [emptyState("ri-server-line", lista.length ? "Nenhum servidor encontrado" : "Nenhum servidor por aqui",
        lista.length ? "Tente buscar por outro nome." : "Você precisa ser Administrador ou ter Gerenciar Canais em um servidor onde o Global esteja. Peça a quem administra para adicionar o Global.")]));
  };

  search.addEventListener("input", draw);
  draw();
  mount(view, pageHead(title, desc), lista.length > 6 ? search : null, grid);
}

function statCard(iconName, label, value) {
  return el("div", { class: "stat" }, icon(iconName), el("span", { class: "stat__label" }, label), el("strong", { class: "stat__value" }, value));
}

function logDetail(item) {
  if (item.campo === "ponte:pausa") return `${item.de ? "pausada" : "ativa"} → ${item.para ? "pausada" : "ativa"}`;
  if (item.campo.startsWith("ponte:")) return item.de ? `${item.de} → ${item.para}` : String(item.para ?? "");
  return `${formatValue(item.campo, item.de)} → ${formatValue(item.campo, item.para)}`;
}

function logRow(item) {
  const text = PONTE_LOG[item.campo] || `alterou ${FIELD_LABELS[item.campo] || item.campo}`;

  return el("li", { class: "log" },
    avatar(item.autor, "avatar--small"),
    el("div", { class: "log__text" },
      el("p", {}, el("strong", {}, item.autor.nome), ` ${text}`),
      el("p", { class: "log__change" }, logDetail(item))
    ),
    el("time", {}, formatDate(item.em))
  );
}

async function fillLogs(list, limit, token) {
  const { plataforma, id } = state.server.servidor;

  try {
    const { logs } = await apiRequest(`/dash/servidores/${plataforma}/${id}/logs`);
    if (!isCurrent(token)) return;
    const itens = limit ? logs.slice(0, limit) : logs;

    mount(list, ...(itens.length ? itens.map(logRow) : [emptyState("ri-history-line", "Nada por aqui ainda", "As alterações feitas pelo painel aparecem neste registro.")]));
  } catch (error) {
    if (isCurrent(token)) mount(list, emptyState("ri-error-warning-line", "Não foi possível carregar", error.message));
  }
}

function pageOverview(view, token) {
  const { config, canais } = state.server;
  const canal = canais.find((item) => item.id === config.canalId);
  const logs = el("ul", { class: "logs" });

  fillLogs(logs, 5, token);

  mount(view, 
    pageHead("Visão geral", "Como o Global está configurado neste servidor."),
    config.bloqueado ? el("div", { class: "alert alert--danger" }, icon("ri-forbid-2-line"), "Este servidor está bloqueado do Global. As mensagens não são enviadas nem recebidas.") : null,
    el("div", { class: "stats" },
      statCard("ri-global-line", "Conexão Global", config.conectado ? (config.pausado ? "Pausada" : "Ativa") : "Desconectada"),
      statCard("ri-hashtag", "Canal", canal ? canal.nome : config.conectado ? "Canal não encontrado" : "—"),
      statCard("ri-send-plane-line", "Modo de envio", config.modoEnvio === "webhook" ? "Webhook" : "Embed"),
      statCard("ri-shield-check-line", "Filtros", [config.filtrarPalavroes && "Palavrões", config.filtrarLinks && "Links"].filter(Boolean).join(" e ") || "Nenhum")
    ),
    card("Atalhos", "Ajustes mais usados.",
      el("div", { class: "shortcuts" },
        el("a", { class: "btn btn--line", href: `${serverBase()}/conexao` }, icon("ri-global-line"), "Conexão Global"),
        el("a", { class: "btn btn--line", href: `${serverBase()}/filtros` }, icon("ri-shield-check-line"), "Filtros"),
        el("a", { class: "btn btn--line", href: `${serverBase()}/mensagens` }, icon("ri-chat-settings-line"), "Mensagens")
      )
    ),
    card("Últimas alterações", "O que mudou por aqui recentemente.", logs)
  );
}

function pageConnection(view) {
  const { config, canais } = state.server;
  const select = el("select", { class: "input", "aria-label": "Canal da conexão" },
    el("option", { value: "" }, "Escolha um canal"),
    ...canais.map((canal) => el("option", { value: canal.id }, `# ${canal.nome}${canal.nsfw ? " (+18)" : ""}`))
  );
  select.value = config.canalId || "";

  const connect = el("button", { class: "btn btn--fill", type: "button" }, icon("ri-plug-line"), config.conectado ? "Trocar canal" : "Conectar");

  connect.addEventListener("click", () => {
    if (!select.value) return toast("Escolha um canal primeiro.", "error");
    if (select.value === config.canalId) return toast("Esse já é o canal conectado.", "error");
    connect.disabled = true;
    saveServer({ canalId: select.value });
  });

  const disconnect = el("button", { class: "btn btn--danger", type: "button" }, icon("ri-link-unlink"), "Desconectar");

  disconnect.addEventListener("click", () => {
    if (!confirmDialog("Desconectar este servidor do chat global? As mensagens deixam de ser enviadas e recebidas.")) return;
    disconnect.disabled = true;
    saveServer({ canalId: null });
  });

  mount(view, 
    pageHead("Conexão Global", "Escolha o canal que conversa com os outros servidores."),
    config.bloqueado ? el("div", { class: "alert alert--danger" }, icon("ri-forbid-2-line"), "Este servidor está bloqueado do Global e não pode se conectar.") : null,
    card("Canal da conexão", "Canais +18 não podem ser conectados, conforme a Política de Privacidade.",
      el("div", { class: "field" }, select, connect, config.conectado ? disconnect : null)
    ),
    card(null, null,
      switchRow({
        title: "Pausar conexão",
        description: "Pausa o envio e o recebimento de mensagens sem desconectar o canal.",
        checked: config.pausado,
        disabled: !config.conectado,
        onChange: (value) => saveServer({ pausado: value })
      })
    )
  );
}

function pageFilters(view) {
  const { config } = state.server;

  mount(view, 
    pageHead("Filtros", "Escolha o que este servidor aceita enviar e receber."),
    card(null, null,
      switchRow({
        title: "Filtrar palavrões",
        description: "Com o filtro ativo, este servidor não recebe mensagens com palavrões e as enviadas daqui com isso são apagadas.",
        checked: config.filtrarPalavroes,
        onChange: (value) => saveServer({ filtrarPalavroes: value })
      }),
      switchRow({
        title: "Filtrar links",
        description: "Bloqueia mensagens com links, tanto as recebidas quanto as enviadas daqui.",
        checked: config.filtrarLinks,
        onChange: (value) => saveServer({ filtrarLinks: value })
      })
    )
  );
}

function modeOption(value, title, text, current) {
  const button = el("button", { class: `mode${current === value ? " is-active" : ""}`, type: "button", "aria-pressed": String(current === value) },
    el("strong", {}, title), el("span", {}, text));

  button.addEventListener("click", () => {
    if (current !== value) saveServer({ modoEnvio: value });
  });
  return button;
}

function pageMessages(view) {
  const { config, permissoes } = state.server;
  const embed = config.modoEnvio !== "webhook";
  const color = el("input", { class: "color", type: "color", value: config.cor || "#0330ef", "aria-label": "Cor das mensagens" });

  mount(view, 
    pageHead("Mensagens", "Como as mensagens de outros servidores aparecem aqui."),
    card("Modo de envio", "O webhook deixa as conversas mais naturais, com o nome e a foto de quem escreveu.",
      el("div", { class: "modes" },
        modeOption("embed", "Embed", "Cada mensagem aparece dentro de um cartão.", config.modoEnvio),
        modeOption("webhook", "Webhook", "A mensagem aparece como se a pessoa tivesse escrito.", config.modoEnvio)
      )
    ),
    card("Aparência", "Escolha o que mostrar junto de cada mensagem.",
      switchRow({
        title: "Ocultar nome do servidor",
        description: "Esconde o nome do servidor de origem nas mensagens.",
        checked: config.ocultarServidor,
        onChange: (value) => saveServer({ ocultarServidor: value })
      }),
      switchRow({
        title: "Ocultar link do perfil",
        description: "Remove o link “Ver perfil” das mensagens.",
        checked: config.ocultarPerfil,
        onChange: (value) => saveServer({ ocultarPerfil: value })
      }),
      switchRow({
        title: "Ocultar info dos outros servidores",
        description: "Remove o nome do servidor e o “Ver perfil” das mensagens que chegam aqui, deixando cada mensagem mais limpa.",
        checked: config.ocultarInfoRecebida,
        onChange: (value) => saveServer({ ocultarInfoRecebida: value })
      }),
      switchRow({
        title: "Mostrar ícone do servidor",
        description: embed ? "Aparece no rodapé das mensagens em embed." : "Só funciona no modo embed.",
        checked: config.mostrarIcone,
        disabled: !embed,
        onChange: (value) => saveServer({ mostrarIcone: value })
      })
    ),
    permissoes.equipe ? card("Cor das mensagens", "Área da equipe: cor usada nas mensagens deste servidor.",
      el("div", { class: "field" }, color,
        el("button", { class: "btn btn--fill", type: "button", onclick: () => saveServer({ cor: color.value }) }, "Salvar cor"),
        config.cor ? el("button", { class: "btn btn--line", type: "button", onclick: () => saveServer({ cor: null }) }, "Remover cor") : null)
    ) : null
  );
}

function pageLogs(view, token) {
  const logs = el("ul", { class: "logs" });

  fillLogs(logs, 0, token);
  mount(view, 
    pageHead("Registro de alterações", "Quem mudou o quê neste servidor pelo painel. Os registros ficam guardados por 90 dias."),
    card(null, null, logs)
  );
}

function chip(text, onRemove) {
  return el("span", { class: "chip" }, text, el("button", { type: "button", "aria-label": `Remover ${text}`, onclick: onRemove }, icon("ri-close-line")));
}

async function pageTeamFilter(view, token) {
  mount(view, pageHead("Filtro global", "Palavras bloqueadas e liberadas em todo o Global."), el("p", { class: "muted" }, "Carregando…"));

  const run = async (request) => {
    try {
      draw(await request());
      toast("Filtro atualizado");
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const act = (acao, palavra) => run(() => apiRequest("/dash/equipe/filtro", { method: "POST", body: { acao, palavra } }));

  const word = el("input", { class: "input", type: "text", maxlength: "50", placeholder: "Palavra", "aria-label": "Palavra" });
  const kind = el("select", { class: "input input--short", "aria-label": "Ação" },
    el("option", { value: "add" }, "Bloquear"), el("option", { value: "liberar" }, "Liberar"));
  const form = el("form", { class: "field" }, word, kind, el("button", { class: "btn btn--fill", type: "submit" }, icon("ri-add-line"), "Adicionar"));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!word.value.trim()) return;
    act(kind.value, word.value);
    word.value = "";
  });

  const lists = el("div", { class: "stack" });

  const draw = (data) => {
    if (!isCurrent(token)) return;

    const group = (title, items, remove) => card(title, `${items.length} palavra(s)`,
      items.length ? el("div", { class: "chips" }, ...items.map((item) => chip(item, () => act(remove, item)))) : el("p", { class: "muted" }, "Nenhuma por enquanto."));

    mount(lists, group("Bloqueadas", data.proibidas, "remove"), group("Liberadas", data.liberadas, "desliberar"));
    $("#filter-total").textContent = `${data.totalEntradas} entradas no filtro, somando as listas de arquivos.`;
  };

  try {
    const data = await apiRequest("/dash/equipe/filtro");
    if (!isCurrent(token)) return;
    mount(view, 
      pageHead("Filtro global", "Palavras bloqueadas e liberadas em todo o Global."),
      card("Adicionar palavra", null, form, el("p", { class: "muted", id: "filter-total" })),
      lists
    );
    draw(data);
  } catch (error) {
    if (isCurrent(token)) mount(view, pageHead("Filtro global"), emptyState("ri-error-warning-line", "Não foi possível carregar", error.message));
  }
}

async function pageTeamBlocks(view, token) {
  mount(view, pageHead("Bloqueios", "Usuários e servidores bloqueados do Global."), el("p", { class: "muted" }, "Carregando…"));

  const table = el("div");

  const draw = (lista) => {
    if (!isCurrent(token)) return;

    mount(table, card(null, null, lista.length
      ? el("ul", { class: "logs" }, ...lista.map((item) => el("li", { class: "log" },
        badge(item.tipo === "servidor" ? "Servidor" : "Usuário", "brand"),
        el("div", { class: "log__text" }, el("p", {}, el("strong", {}, item.id)), el("p", { class: "log__change" }, item.motivo || "Motivo não informado")),
        el("button", { class: "btn btn--line btn--small", type: "button", onclick: () => unblock(item) }, "Desbloquear"))))
      : emptyState("ri-checkbox-circle-line", "Tudo limpo por aqui", "Nenhum servidor ou pessoa está bloqueado.")));
  };

  const unblock = async (item) => {
    try {
      draw((await apiRequest(`/dash/equipe/bloqueios/${item.tipo}/${item.id}`, { method: "DELETE" })).bloqueios);
      toast("Desbloqueado");
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const kind = el("select", { class: "input input--short", "aria-label": "Tipo" }, el("option", { value: "servidor" }, "Servidor"), el("option", { value: "usuario" }, "Usuário"));
  const id = el("input", { class: "input", type: "text", inputmode: "numeric", placeholder: "ID", "aria-label": "ID", required: true });
  const reason = el("input", { class: "input", type: "text", maxlength: "200", placeholder: "Motivo (opcional)", "aria-label": "Motivo" });
  const form = el("form", { class: "field field--wrap" }, kind, id, reason, el("button", { class: "btn btn--danger", type: "submit" }, icon("ri-forbid-2-line"), "Bloquear"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      draw((await apiRequest("/dash/equipe/bloqueios", { method: "POST", body: { tipo: kind.value, id: id.value.trim(), motivo: reason.value } })).bloqueios);
      id.value = "";
      reason.value = "";
      toast("Bloqueado");
    } catch (error) {
      toast(error.message, "error");
    }
  });

  try {
    const { bloqueios } = await apiRequest("/dash/equipe/bloqueios");
    if (!isCurrent(token)) return;
    mount(view, pageHead("Bloqueios", "Usuários e servidores bloqueados do Global."), card("Novo bloqueio", null, form), table);
    draw(bloqueios);
  } catch (error) {
    if (isCurrent(token)) mount(view, pageHead("Bloqueios"), emptyState("ri-error-warning-line", "Não foi possível carregar", error.message));
  }
}

function participantRow(ponte, participante, run, base) {
  const info = el("div", { class: "member__info" },
    el("strong", {}, participante.nomeServidor),
    el("span", { class: "member__meta" },
      badge(PLATFORM_LABEL[participante.plataforma] || participante.plataforma, "brand"),
      participante.eu ? badge("Este servidor", "ok") : null,
      participante.dono ? badge("Dono da ponte") : null,
      participante.pausado ? badge("Pausado", "warn") : null,
      participante.canalNome ? el("span", { class: "muted" }, `# ${participante.canalNome}`) : null
    )
  );

  const actions = el("div", { class: "member__actions" });

  if (participante.eu) {
    actions.append(
      el("button", { class: "btn btn--line btn--small", type: "button", onclick: () => run(() => apiRequest(`${base}/${ponte.codigo}`, { method: "PATCH", body: { pausado: !participante.pausado } }), participante.pausado ? "Ponte retomada" : "Ponte pausada") },
        icon(participante.pausado ? "ri-play-line" : "ri-pause-line"), participante.pausado ? "Retomar" : "Pausar"),
      el("button", { class: "btn btn--line btn--small", type: "button", onclick: () => {
        if (!confirmDialog("Tirar este servidor da ponte? O canal deixa de enviar e receber mensagens dela.")) return;
        run(() => apiRequest(`${base}/${ponte.codigo}/participantes/${participante.guildId}`, { method: "DELETE" }), "Você saiu da ponte");
      } }, icon("ri-logout-box-line"), "Sair")
    );
  } else if (ponte.souDono) {
    actions.append(el("button", { class: "btn btn--line btn--small", type: "button", onclick: () => {
      if (!confirmDialog(`Remover ${participante.nomeServidor} da ponte?`)) return;
      run(() => apiRequest(`${base}/${ponte.codigo}/participantes/${participante.guildId}`, { method: "DELETE" }), "Servidor removido");
    } }, icon("ri-user-unfollow-line"), "Remover"));
  }

  return el("li", { class: "member" }, info, actions);
}

function bridgeCard(ponte, run, base, limites) {
  const copy = el("button", { class: "code", type: "button", "aria-label": "Copiar código da ponte", onclick: async () => {
    try {
      await navigator.clipboard.writeText(ponte.codigo);
      toast("Código copiado");
    } catch {
      toast("Não foi possível copiar. Selecione o código e copie.", "error");
    }
  } }, ponte.codigo, icon("ri-file-copy-line"));

  const owner = ponte.souDono ? el("div", { class: "bridge__tools" },
    el("button", { class: "btn btn--line btn--small", type: "button", onclick: () => {
      const nome = window.prompt("Novo nome da ponte", ponte.nome);
      if (nome && nome.trim() && nome.trim() !== ponte.nome) run(() => apiRequest(`${base}/${ponte.codigo}`, { method: "PATCH", body: { nome } }), "Ponte renomeada");
    } }, icon("ri-edit-line"), "Renomear"),
    el("button", { class: "btn btn--danger btn--small", type: "button", onclick: () => {
      if (!confirmDialog("Encerrar a ponte? Todos os canais são desligados dela e o código deixa de funcionar.")) return;
      run(() => apiRequest(`${base}/${ponte.codigo}`, { method: "DELETE" }), "Ponte encerrada");
    } }, icon("ri-delete-bin-line"), "Encerrar")
  ) : null;

  return el("section", { class: "card bridge" },
    el("header", { class: "bridge__head" },
      el("div", { class: "bridge__title" },
        el("h2", { class: "card__title" }, ponte.nome),
        el("div", { class: "bridge__meta" }, badge(ponte.souDono ? "Você é o dono" : "Participante", ponte.souDono ? "brand" : "muted"), copy,
          el("span", { class: "muted" }, `${ponte.participantes.length} de ${limites.participantes} servidores`))
      ),
      owner
    ),
    el("ul", { class: "members" }, ...ponte.participantes.map((p) => participantRow(ponte, p, run, base)))
  );
}

function channelSelect(canais, label) {
  const select = el("select", { class: "input", "aria-label": label, disabled: canais.length === 0 },
    el("option", { value: "" }, canais.length ? "Escolha um canal" : "Nenhum canal livre"),
    ...canais.map((canal) => el("option", { value: canal.id }, `# ${canal.nome}`))
  );

  return select;
}

async function pageBridges(view, token) {
  const { plataforma, id } = state.server.servidor;
  const base = `/dash/servidores/${plataforma}/${id}/pontes`;
  const head = pageHead("Pontes", "Ligue canais de servidores amigos, do Fluxer, do Discord ou do Stoat, sem passar pelo chat global.");

  mount(view, head, el("p", { class: "muted" }, "Carregando…"));

  let data;
  try {
    data = await apiRequest(base);
  } catch (error) {
    if (isCurrent(token)) mount(view, head, emptyState("ri-error-warning-line", "Não foi possível carregar", error.message));
    return;
  }
  if (!isCurrent(token)) return;

  const body = el("div", { class: "stack" });

  const run = async (request, success) => {
    try {
      data = await request();
      toast(success);
    } catch (error) {
      toast(error.message, "error");
    }
    if (isCurrent(token)) draw();
  };

  const draw = () => {
    const livres = data.canaisLivres;
    const createName = el("input", { class: "input", type: "text", maxlength: "40", placeholder: "Nome da ponte (opcional)", "aria-label": "Nome da ponte" });
    const createChannel = channelSelect(livres, "Canal da nova ponte");
    const createButton = el("button", { class: "btn btn--fill", type: "button", disabled: data.adulto || livres.length === 0 }, icon("ri-add-line"), "Criar ponte");
    const joinCode = el("input", { class: "input", type: "text", maxlength: "9", placeholder: "Código (XXXX-XXXX)", "aria-label": "Código da ponte", autocomplete: "off" });
    const joinChannel = channelSelect(livres, "Canal que vai entrar");
    const joinButton = el("button", { class: "btn btn--fill", type: "button", disabled: data.adulto || livres.length === 0 }, icon("ri-login-box-line"), "Entrar");

    createButton.addEventListener("click", () => {
      if (!createChannel.value) return toast("Escolha um canal primeiro.", "error");
      run(() => apiRequest(base, { method: "POST", body: { nome: createName.value, canalId: createChannel.value } }), "Ponte criada");
    });

    joinButton.addEventListener("click", () => {
      if (!joinCode.value.trim()) return toast("Digite o código da ponte.", "error");
      if (!joinChannel.value) return toast("Escolha um canal primeiro.", "error");
      run(() => apiRequest(`${base}/entrar`, { method: "POST", body: { codigo: joinCode.value, canalId: joinChannel.value } }), "Você entrou na ponte");
    });

    mount(body,
      data.adulto ? el("div", { class: "alert alert--danger" }, icon("ri-forbid-2-line"), "Servidores +18 não podem usar pontes, conforme a Política de Privacidade.") : null,
      el("div", { class: "two" },
        card("Criar ponte", "Você recebe um código para chamar os servidores amigos.", el("div", { class: "stack stack--tight" }, createName, createChannel, createButton)),
        card("Entrar numa ponte", "Use o código que um amigo te passou.", el("div", { class: "stack stack--tight" }, joinCode, joinChannel, joinButton))
      ),
      el("p", { class: "muted" }, `Até ${data.limites.participantes} servidores por ponte e ${data.limites.pontes} pontes por servidor. Um canal não fica no chat global e numa ponte ao mesmo tempo, e canais +18 não entram.`),
      data.pontes.length
        ? data.pontes.map((ponte) => bridgeCard(ponte, run, base, data.limites))
        : card(null, null, emptyState("ri-links-line", "Nenhuma ponte por aqui", "Crie uma ponte ou entre numa com o código de um amigo."))
    );
  };

  mount(view, head, body);
  draw();
}

const SERVER_PAGES = { "": pageOverview, conexao: pageConnection, pontes: pageBridges, filtros: pageFilters, mensagens: pageMessages, logs: pageLogs };
