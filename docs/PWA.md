# Terra Z — PWA

## Objetivo

O Terra Z pode ser instalado como aplicativo mantendo o conteúdo público disponível durante quedas de conexão, sem transformar o cache do navegador em armazenamento de conteúdo Mestre.

## Instalação

O manifesto usa caminhos relativos para funcionar tanto na Vercel, na raiz do domínio, quanto no GitHub Pages em `/terra-z/`.

A identidade visual do app usa o ícone Vanguard Bay aprovado, com monograma VB, pôr do sol neon, skyline e palmeiras.

## Estratégia offline

O Service Worker mantém em cache somente o núcleo público necessário para abrir e navegar pelo dossiê. Imagens públicas locais entram no cache conforme são visualizadas, com limite de 80 itens.

Não há pré-cache de toda a biblioteca de imagens, evitando uma instalação inicial de mais de 10 MB.

## Segurança

O Service Worker ignora explicitamente:

- qualquer rota `/api/`;
- requisições com cabeçalho `Authorization`;
- `data/private-*`;
- arquivos `.enc.json`.

Assim, login, cofre Mestre, sessões privadas, publicação, backup e APIs administrativas nunca são salvos no Cache Storage do PWA.

O token do editor continua em `sessionStorage`, fora do Service Worker.

## Atualizações

Uma nova versão não assume o controle silenciosamente durante uma sessão. Quando um Service Worker novo fica aguardando, a interface mostra **Nova versão do Terra Z disponível**. O usuário decide quando clicar em **Atualizar**.

## Offline e administração

Em modo offline, leitura e navegação pelo conteúdo público em cache continuam disponíveis. A interface mostra um indicador Offline e desabilita operações claramente dependentes do servidor, como login, publicação e backup JSON.

## Compatibilidade

- Vercel: escopo `/`.
- GitHub Pages: escopo `/terra-z/`.
- Android/Chromium: instalação via prompt nativo.
- iPhone/iPad: instrução via Compartilhar → Adicionar à Tela de Início.
