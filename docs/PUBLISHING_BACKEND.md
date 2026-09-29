# Backend de publicação do Terra Z

Este repositório contém funções serverless compatíveis com Vercel para transformar o botão **Publicar** do editor em commits seguros no GitHub.

## Endpoints

- `POST /api/publish` — publica alterações de `data-edit-id` em `data/content-overrides.js`.
- `GET /api/status?sha=<commit>` — acompanha o workflow do GitHub Pages.

## Variáveis de ambiente

Obrigatórias:

- `TERRAZ_EDITOR_KEY` — senha/chave compartilhada entre editores autorizados;
- `GITHUB_APP_ID`;
- `GITHUB_INSTALLATION_ID`;
- `GITHUB_PRIVATE_KEY`.

Opcionais:

- `GITHUB_OWNER=Nierusen34`
- `GITHUB_REPO=terra-z`
- `GITHUB_BRANCH=main`
- `TERRAZ_ALLOWED_ORIGINS=https://nierusen34.github.io`

## Permissões da GitHub App

Instalar somente no repositório `Nierusen34/terra-z`.

Permissões necessárias:

- Repository contents: Read & Write
- Actions: Read

Nenhuma chave privada deve ser adicionada ao Git.

## Fluxo

1. editor salva um rascunho local;
2. cliente envia somente as diferenças ao endpoint;
3. API valida IDs e autenticação;
4. API obtém token temporário da GitHub App;
5. API lê o arquivo mais recente da main;
6. mescla as alterações;
7. cria commit;
8. cliente acompanha GitHub Pages;
9. rascunho só é limpo após deploy confirmado.

## Segurança

A chave de editor é comparada no servidor e nunca fica no repositório.

A chave privada da GitHub App existe apenas como variável de ambiente no provedor serverless.
