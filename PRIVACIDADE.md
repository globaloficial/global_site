# Política de Privacidade do Global

Última atualização: 15 de novembro de 2026.

O Global é um bot do [Fluxer](https://fluxer.app) criado para o público brasileiro, que também funciona no Discord. Ele conecta comunidades em um chat global: o que alguém escreve no canal conectado de um servidor é retransmitido para os canais conectados dos outros servidores, sejam eles do Fluxer ou do Discord.

## Quem opera o bot

- Operador: xMqR, responsável pelo projeto Global-APP.
- Contato para qualquer assunto desta política: contato.xmqr@gmail.com
- Código aberto: https://github.com/Global-APP/global

## Fluxer e Discord

O Global funciona nas duas plataformas, e os dados são tratados do mesmo jeito em ambas. No Discord, o bot recebe os mesmos tipos de dado descritos abaixo (IDs de usuário, servidor e canal, nome, avatar e o conteúdo das mensagens do canal conectado) e usa a permissão de ler o conteúdo das mensagens apenas nos canais conectados.

Cada plataforma tem as próprias regras e a própria política de privacidade, que continuam valendo para quem usa o Fluxer ou o Discord. Esta política trata apenas do que o Global faz com os dados que recebe. Nos comandos, o prefixo `g.` do Fluxer corresponde aos comandos slash (`/`) do Discord.

## O que o bot coleta e por quanto tempo

| Dado | Para que serve | Por quanto tempo |
| --- | --- | --- |
| Mensagens enviadas no canal global: texto, anexos, figurinhas, nome, avatar, ID do autor, nome e ícone do servidor | Retransmitir a mensagem para os outros servidores conectados | O bot não guarda o conteúdo. Ele só passa adiante, e as cópias ficam nos servidores de destino, onde seguem as regras de cada servidor e do Fluxer |
| Vínculo entre original e cópias: IDs da mensagem, do canal, do servidor e do autor, e a hora | Sincronizar edição, exclusão e resposta, e permitir denúncias | 7 dias, depois apagado automaticamente |
| Perfil do usuário: ID, selos (badges), selo escolhido e se é da equipe | Mostrar selos e o perfil | Até o usuário pedir a exclusão |
| Configuração do servidor: ID do servidor, plataforma (Fluxer ou Discord), ID do canal conectado, pausa, filtros, cor, ícone, modo de envio, dados do webhook e identificadores do painel de configuração | Fazer o chat global funcionar naquele servidor | Até a exclusão ser pedida pelo servidor |
| Pontes: código, nome, data de criação e, para cada servidor participante, plataforma, ID e nome do servidor, ID do canal, dados do webhook e data de entrada | Fazer a ponte funcionar entre os canais escolhidos | Até o canal sair da ponte, o servidor ser removido ou a ponte ser encerrada |
| Bloqueios: ID do usuário ou do servidor, motivo, quem bloqueou e quando | Moderação do chat global | Até o bloqueio ser removido ou a exclusão ser pedida |
| Registros (logs) do bot: nome de usuário, ID, nome e ID do servidor, IDs de canal, comandos usados, erros e horários. Os logs não guardam o texto das mensagens | Corrigir erros e investigar abusos | 30 dias, depois apagados automaticamente |
| Denúncias feitas com `g.report`: conteúdo da mensagem denunciada, link da mídia, motivo, ID de quem denunciou e do denunciado | Moderação | Ficam no canal privado da equipe e são apagadas em até 90 dias |

O bot lê os comandos (prefixo `g.` no Fluxer ou `/` no Discord) e as mensagens dos canais conectados. Ele não lê mensagens privadas e não processa as mensagens dos outros canais além de verificar se são comandos.

## Pontes

As pontes são conexões privadas entre canais escolhidos por quem as cria, separadas do chat global. Quem tem o código da ponte pode entrar nela, e as mensagens de um canal da ponte são retransmitidas para os outros canais da mesma ponte, no Fluxer ou no Discord. Essas mensagens passam pelos mesmos filtros e pela mesma verificação de mídia do chat global e seguem as mesmas regras de retenção da tabela acima. Por isso, não compartilhe o código de uma ponte com quem você não quer que participe dela.

## Arquivos, imagens e figurinhas

Como as mensagens são entregues por webhook, o bot baixa os anexos temporariamente na memória (até 4 arquivos de 8 MB) e os reenvia. Nada é gravado em disco nem no banco de dados. O que não couber nesse limite é enviado como link.

## Verificação de conteúdo impróprio (NSFW)

Toda imagem, vídeo e figurinha enviada no chat global é verificada antes de ser retransmitida. Para isso, o bot envia o **endereço (URL) da mídia** para um serviço externo de verificação, operado por Mubi, em `nsfw.mubilop.com`. O serviço acessa a mídia, analisa e devolve uma pontuação. Nenhum texto de mensagem, nome ou ID de usuário é enviado a esse serviço. O serviço não salva mídias.

Mídias consideradas impróprias são bloqueadas e não são retransmitidas.

## Conteúdo adulto e menores de idade

O chat global é compartilhado entre comunidades que podem ter menores de idade. Por isso:

- Canais e servidores marcados como 18+ no Fluxer ou no Discord não podem ser conectados ao chat global, e as mensagens enviadas deles não são retransmitidas.
- O filtro de palavras vem ligado por padrão nos servidores conectados.
- Mídia sexual ou imprópria é bloqueada em toda a rede, independentemente da configuração do servidor.

## Com quem compartilhamos

- Com os outros servidores conectados, no Fluxer ou no Discord: apenas as mensagens do chat global, com nome, avatar e nome/ícone do servidor de origem, como o próprio chat já exige.
- Com o serviço de verificação NSFW descrito acima.
- Não vendemos dados e não os usamos para publicidade.
- O banco de dados do bot fica em um servidor controlado pelo operador.

## Seus direitos e como pedir a exclusão

Você pode pedir acesso, correção ou exclusão dos dados que o Global guarda sobre você ou sobre o seu servidor, conforme a Lei Geral de Proteção de Dados (LGPD). Escreva para o contato acima informando o seu ID de usuário ou o ID do servidor. Respondemos em até 15 dias.

Para parar de ser retransmitido, o servidor pode usar `g.desconectar` (ou `/desconectar` no Discord), e um canal sai de uma ponte com `g.ponte sair`. Mensagens já enviadas continuam nos servidores de destino, e a exclusão delas depende dos moderadores desses servidores.

## Mudanças

Podemos atualizar esta política. A data no topo mostra a última versão, e o histórico fica no repositório do projeto.
