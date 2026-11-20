<div align="center">

<a href="https://globalbot.site"><img src="assets/global.png" alt="Global" width="120" height="120"></a>

# Global

O site do chat que liga o Fluxer e o Discord.

[![Site](https://img.shields.io/badge/site-globalbot.site-0330ef?style=flat-square&labelColor=0B0B0B)](https://globalbot.site)
[![Bot](https://img.shields.io/badge/bot-globaloficial%2Fglobal-0330ef?style=flat-square&labelColor=0B0B0B&logo=github)](https://github.com/globaloficial/global)
[![Vercel](https://img.shields.io/badge/Vercel-hospedagem-0330ef?style=flat-square&labelColor=0B0B0B&logo=vercel&logoColor=white)](https://vercel.com)

<br>

<img src="assets/readme/chat.png" alt="Mensagens do Fluxer e do Discord chegando no Global" width="640">

</div>

<br>

> Este repositório é só o site. O código do bot fica em [globaloficial/global](https://github.com/globaloficial/global).

<br>

<h2 align="center">O que tem aqui</h2>

<div align="center">

| Página | Para que serve |
| --- | --- |
| `index.html` | Página inicial, com a apresentação do Global |
| `parceiros.html` | Comunidades parceiras |
| `estatisticas.html` | Números do bot em tempo real |
| `comandos.html` | Todos os comandos, por plataforma |
| `docs/` | Documentação e política de privacidade |
| `support/` | Central de suporte, FAQ e conversas com a equipe |
| `dash/` | Painel web de configuração |

</div>

<br>

<h2 align="center">Como a mensagem chega</h2>

<div align="center">
<img src="assets/readme/fluxo.png" alt="O caminho de uma mensagem pelo Global" width="760">
</div>

<br>

<h2 align="center">Estatísticas</h2>

<p align="center">
A página de estatísticas lê os números de <code>api.globalbot.site/stats</code>,<br>
que é servida pelo próprio bot.
</p>

<br>

<h2 align="center">Rodando localmente</h2>

<p align="center">O site é HTML, CSS e JavaScript puro, sem etapa de build. Basta servir a pasta:</p>

```sh
git clone https://github.com/globaloficial/global_site
cd global_site
npx serve .
```

<br>

<h2 align="center">Parceiros</h2>

<p align="center">
Os parceiros ficam em <code>js/partners-data.js</code> e as imagens em <code>assets/partners</code>.<br>
Para incluir um, adicione o item na lista e coloque a imagem na pasta.
</p>

<br>

<h2 align="center">Estrutura</h2>

```
global_site/
├── index.html
├── parceiros.html
├── estatisticas.html
├── vercel.json
├── css/
├── js/
├── docs/
└── assets/
```

<br>

<h2 align="center">Cores</h2>

<div align="center">

| Uso | Cor |
| --- | --- |
| Oficial | ![#0330ef](https://img.shields.io/badge/-%230330ef-0330ef?style=flat-square) |
| Fundo | ![#0B0B0B](https://img.shields.io/badge/-%230B0B0B-0B0B0B?style=flat-square) |
| Cartões | ![#0F0F0F](https://img.shields.io/badge/-%230F0F0F-0F0F0F?style=flat-square) |

</div>

<br>

<p align="center">Criado por xMqR · Apoiado financeiramente por Joao.</p>
