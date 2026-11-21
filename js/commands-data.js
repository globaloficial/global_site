const PERMISSION = "Gerenciar Canais";

const COMMAND_GROUPS = [
  {
    id: "conexao",
    title: "Conexão",
    text: "Controle como o seu servidor participa do chat global.",
    commands: [
      {
        name: "conectar",
        aliases: ["connect"],
        permission: PERMISSION,
        description: "Define o canal atual como a conexão do chat global. Canais 18+ não podem ser conectados.",
        variables: [],
        examples: [{ args: "", note: "Use no canal que vai receber o chat global." }]
      },
      {
        name: "desconectar",
        permission: PERMISSION,
        description: "Remove a conexão deste canal, seja ela global ou uma ponte.",
        variables: [],
        examples: [{ args: "", note: "Use no canal que está conectado." }]
      },
      {
        name: "pausar",
        permission: PERMISSION,
        description: "Pausa o chat global neste servidor. As mensagens deixam de chegar e de sair, sem desconectar o canal.",
        variables: [],
        examples: [{ args: "", note: "Para voltar depois, use retomar." }]
      },
      {
        name: "retomar",
        permission: PERMISSION,
        description: "Retoma o chat global neste servidor depois de uma pausa.",
        variables: [],
        examples: [{ args: "", note: "Só funciona se a conexão estiver pausada." }]
      },
      {
        name: "atualizar",
        aliases: ["refresh", "tentar"],
        permission: PERMISSION,
        description: "Tenta criar o webhook de novo neste canal, sem esperar a pausa de 1 hora. Se funcionar, as mensagens voltam na hora. Funciona na Conexão Global e na Conexão Privada, no Fluxer e no Discord, e também como /atualizar.",
        variables: [],
        examples: [{ args: "", note: "Use depois de dar a permissão Gerenciar Webhooks ao Global. Se ainda faltar, ele avisa. Em servidores no modo embed não é preciso. Espere 5 segundos entre uma tentativa e outra." }]
      },
      {
        name: "config",
        aliases: ["configurar", "configurações"],
        permission: PERMISSION,
        description: "Mostra o estado da conexão, do webhook e dos filtros, e ajusta como as mensagens aparecem no seu servidor.",
        variables: [
          { name: "modo", values: "embed | webhook", text: "Como as mensagens chegam ao canal. O webhook deixa a conversa mais natural e exige a permissão Gerenciar Webhooks." },
          { name: "servidor", values: "mostrar | ocultar", text: "Mostra ou oculta o nome do servidor nas mensagens enviadas daqui." },
          { name: "perfil", values: "mostrar | ocultar", text: "Mostra ou oculta o link do perfil nas mensagens enviadas daqui." }
        ],
        examples: [
          { args: "", note: "Mostra o estado atual." },
          { args: "modo webhook", note: "Troca o modo de mensagens para webhook." },
          { args: "servidor ocultar", note: "Esconde o nome do servidor." },
          { args: "perfil mostrar", note: "Exibe o link do perfil." }
        ]
      },
      {
        name: "automod",
        aliases: ["moderacao"],
        permission: PERMISSION,
        description: "Escolhe se o servidor filtra palavrões e links. Sem variáveis, abre o painel de configuração.",
        variables: [
          { name: "filtro", values: "palavroes | links", text: "Qual filtro será alterado." },
          { name: "estado", values: "on | off", text: "Liga ou desliga o filtro. Por padrão os dois ficam liberados." }
        ],
        examples: [
          { args: "", note: "Abre o painel do automod." },
          { args: "palavroes on", note: "Passa a filtrar palavrões." },
          { args: "links off", note: "Libera os links." }
        ]
      },
      {
        name: "ponte",
        aliases: ["bridge", "pontes"],
        permission: PERMISSION,
        description: "Cria e gerencia pontes: conexões privadas entre canais escolhidos, separadas do chat global.",
        variables: [
          { name: "criar", values: "[nome]", text: "Cria uma ponte com o canal atual e gera um código de convite." },
          { name: "entrar", values: "<código>", text: "Entra em uma ponte com o código recebido." },
          { name: "listar", values: "", text: "Lista as pontes do servidor." },
          { name: "sair", values: "", text: "Tira o canal atual da ponte." },
          { name: "remover", values: "<código> <id do servidor>", text: "Remove outro servidor da ponte." },
          { name: "encerrar", values: "<código>", text: "Encerra a ponte para todos." }
        ],
        examples: [
          { args: "", note: "Abre o painel de pontes." },
          { args: "criar Amigos", note: "Cria uma ponte chamada Amigos." },
          { args: "entrar K7QM-4X2P", note: "Entra em uma ponte com o código." },
          { args: "listar", note: "Mostra as pontes do servidor." }
        ]
      }
    ]
  },
  {
    id: "geral",
    title: "Geral",
    text: "Perfil, badges, denúncias e informações do bot.",
    commands: [
      {
        name: "verreacao",
        aliases: ["verreação", "reacao", "reação", "inforeacao", "inforeação"],
        description: "Mostra quem reagiu à mensagem do Global que você respondeu, com o emoji e o perfil de cada pessoa, no Fluxer e no Discord. No Discord, funciona só escrito, não como /.",
        variables: [
          { name: "ver", values: "ver", text: "Palavra opcional, não muda o resultado.", optional: true }
        ],
        examples: [
          { args: "", note: "Responda a mensagem do Global com o comando." },
          { args: "ver", note: "Mesmo resultado, com a palavra ver." }
        ]
      },
      {
        name: "perfil",
        aliases: ["profile"],
        description: "Mostra o card de perfil, com as suas badges. Há um intervalo de 5 segundos entre usos.",
        variables: [
          { name: "usuário", values: "@menção | ID", text: "Quem terá o perfil mostrado. Sem variável, mostra o seu.", optional: true }
        ],
        examples: [
          { args: "", note: "Mostra o seu perfil." },
          { args: "@usuário", note: "Mostra o perfil de outra pessoa." }
        ]
      },
      {
        name: "destacar",
        aliases: ["selecionar"],
        description: "Escolhe a badge em destaque no seu perfil e na cor das suas mensagens.",
        variables: [
          { name: "badge", values: "conversador | desenvolvedor | parceiro | staff | verificado | contribuidor | otobank | nenhuma", text: "Nome da badge que você já ganhou. Use nenhuma para tirar o destaque.", optional: true }
        ],
        examples: [
          { args: "", note: "Lista as suas badges." },
          { args: "conversador", note: "Destaca a badge Conversador." },
          { args: "nenhuma", note: "Remove o destaque." }
        ]
      },
      {
        name: "report",
        aliases: ["denunciar"],
        platforms: ["fluxer"],
        description: "Denuncia uma mensagem do chat global. Responda à mensagem com o comando, e a denúncia é revisada por uma pessoa. Há um intervalo de 30 segundos entre usos.",
        variables: [
          { name: "motivo", values: "texto livre, até 300 caracteres", text: "Por que a mensagem está sendo denunciada.", optional: true }
        ],
        examples: [{ args: "spam", note: "Responda à mensagem denunciada com o comando." }]
      },
      {
        name: "botinfo",
        aliases: ["global"],
        description: "Mostra as informações principais do Global: prefixo, contribuidores, estatísticas e dados técnicos.",
        variables: [],
        examples: [{ args: "", note: "" }]
      },
      {
        name: "ping",
        description: "Mostra a latência da API e do gateway, e o risco de rate limit.",
        variables: [],
        examples: [{ args: "", note: "" }]
      },
      {
        name: "ajuda",
        aliases: ["help", "comandos"],
        description: "Apresenta o Global e os links principais: site, políticas de privacidade e esta página de comandos.",
        variables: [],
        examples: [{ args: "", note: "" }]
      }
    ]
  }
];

const PLATFORMS = {
  fluxer: {
    label: "Fluxer",
    prefix: "g.",
    note: "No Fluxer, os comandos começam com o prefixo g. e as variáveis vêm logo depois do nome."
  },
  discord: {
    label: "Discord",
    prefix: "/",
    note: "No Discord, os comandos são slash. Todos têm o campo opcional argumentos, onde você escreve as variáveis. O report não existe como slash, use a versão do Fluxer."
  }
};
