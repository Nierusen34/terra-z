# Backend de publicação do Terra Z

Este repositório contém funções serverless compatíveis com Vercel para transformar o botão **Publicar** do editor em commits seguros no GitHub.

## Endpoints

- `POST /api/publish` — publica alterações de `data-edit-id` em `data/content-overrides.js`;
- `POST /api/media` — envia/substitui retratos e atualiza `data/character-media.js` no mesmo commit;
- `POST /api/sessions` — cria ou atualiza sessões em `data/sessions.js`;
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

A chave de editor é comparada no servidor com comparação resistente a timing e nunca fica no repositório. No navegador ela é mantida somente em `sessionStorage`, portanto some ao encerrar a sessão do navegador ou ao usar **Esquecer**.

Conteúdo HTML do editor passa por sanitização server-side antes do commit.

A chave privada da GitHub App existe apenas como variável de ambiente no provedor serverless.

Uploads aceitos: PNG, JPEG ou WebP, até 3 MB.

## Ativação do cliente

Depois do deploy serverless, atualizar `config.js`:

```js
window.TerraZConfig.publishing = {
  enabled: true,
  endpoint: "https://SEU-PROJETO.vercel.app/api/publish",
  mediaEndpoint: "https://SEU-PROJETO.vercel.app/api/media",
  sessionsEndpoint: "https://SEU-PROJETO.vercel.app/api/sessions",
  statusEndpoint: "https://SEU-PROJETO.vercel.app/api/status",
  repository: "Nierusen34/terra-z",
  branch: "main"
};
```

Somente depois dessa alteração os controles remotos ficam operacionais.
