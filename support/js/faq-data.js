const FAQ_GROUPS = [
  {
    title: "Primeiros passos",
    items: [
      {
        question: "O que é o Global?",
        answer: "O Global é um bot que conecta servidores do Fluxer e do Discord em um chat global. O que alguém escreve no canal conectado de um servidor aparece nos canais conectados dos outros."
      },
      {
        question: "Como conecto o meu servidor?",
        answer: "Adicione o bot ao servidor, vá até o canal que vai receber o chat global e use <code>g.conectar</code> no Fluxer ou <code>/conectar</code> no Discord. Quem usa o comando precisa da permissão Gerenciar Canais."
      },
      {
        question: "Que permissões o bot precisa?",
        answer: "Ler e enviar mensagens no canal conectado. Para o modo webhook, que deixa a conversa mais natural, ele também precisa da permissão Gerenciar Webhooks."
      },
      {
        question: "Como troco entre embed e webhook?",
        answer: "Use <code>g.config modo webhook</code> ou <code>g.config modo embed</code>. No Discord, escreva <code>/config</code> e coloque o texto no campo argumentos."
      }
    ]
  },
  {
    title: "Problemas comuns",
    items: [
      {
        question: "As mensagens não chegam ao meu canal",
        answer: "Confira, nesta ordem: se o canal está conectado (<code>g.config</code> mostra o estado), se o chat não está pausado (use <code>g.retomar</code>), se o canal não é 18+, se o bot tem permissão de enviar mensagens no canal e se ele está online (<code>g.ping</code>)."
      },
      {
        question: "A minha mensagem não foi para os outros servidores",
        answer: "Ela pode ter sido bloqueada por um filtro (palavrões ou links), por conter mídia imprópria ou por você ou o seu servidor estar bloqueado do chat global. Mandar muitas mensagens em pouco tempo também pode fazer o bot ignorar algumas."
      },
      {
        question: "Não consigo conectar um canal",
        answer: "Canais e servidores marcados como 18+ não podem ser conectados ao chat global. Verifique também se você tem a permissão Gerenciar Canais."
      },
      {
        question: "Como pauso o chat sem desconectar?",
        answer: "Use <code>g.pausar</code>. As mensagens deixam de chegar e de sair, e o canal continua conectado. Para voltar, use <code>g.retomar</code>."
      }
    ]
  },
  {
    title: "Moderação e privacidade",
    items: [
      {
        question: "Como denuncio uma mensagem?",
        answer: "No Fluxer, responda à mensagem com <code>g.report</code> e, se quiser, escreva o motivo. A equipe revisa a denúncia."
      },
      {
        question: "Como ajusto os filtros do meu servidor?",
        answer: "Use <code>g.automod</code> para abrir o painel, ou direto, por exemplo, <code>g.automod palavroes on</code> e <code>g.automod links off</code>."
      },
      {
        question: "O Global guarda as minhas mensagens?",
        answer: "O bot não guarda o conteúdo das mensagens, só retransmite. Ele mantém por 7 dias o vínculo entre a mensagem original e as cópias, para sincronizar edições e exclusões. Os detalhes estão na <a href=\"https://docs.globalbot.site/privacidade\">Política de Privacidade</a>."
      },
      {
        question: "Como peço a exclusão dos meus dados?",
        answer: "Escreva para <a href=\"mailto:contato.xmqr@gmail.com\">contato.xmqr@gmail.com</a> com o seu ID de usuário ou o ID do servidor. A resposta sai em até 15 dias."
      }
    ]
  },
  {
    title: "Outros recursos",
    items: [
      {
        question: "O que são pontes?",
        answer: "Pontes são conexões privadas entre canais escolhidos, separadas do chat global. Quem cria a ponte recebe um código, e quem tem o código pode entrar. Veja o comando <code>g.ponte</code> na <a href=\"https://globalbot.site/comandos\">lista de comandos</a>."
      },
      {
        question: "Como ganho badges?",
        answer: "A badge Conversador é automática para quem envia bastante mensagem no chat global. Use <code>g.perfil</code> para ver as suas e <code>g.destacar</code> para escolher qual aparece em destaque."
      },
      {
        question: "Onde vejo todos os comandos?",
        answer: "Na <a href=\"https://globalbot.site/comandos\">página de comandos</a>, separada por Fluxer e Discord, ou usando <code>g.ajuda</code> no próprio servidor."
      }
    ]
  }
];
