# Backend de publicação — Terra Z

O GitHub Pages continua público e sem credenciais. A escrita no repositório deve acontecer por uma função serverless protegida.

## Referência incluída

`publish-worker.example.js` é uma implementação de referência para Cloudflare Workers.

Ela:

- exige identidade autenticada pelo Cloudflare Access;
- valida o e-mail contra uma allowlist;
- lê `data/content-overrides.js` no GitHub;
- rejeita conflito de versão com HTTP 409;
- aceita apenas IDs `tz-####`;
- limita tamanho de conteúdo;
- mescla somente as alterações enviadas;
- cria um commit na `main`;
- nunca envia o token GitHub ao navegador.

## Variáveis/segredos

Configure no ambiente do Worker:

```text
GITHUB_OWNER=Nierusen34
GITHUB_REPO=terra-z
GITHUB_BRANCH=main
ALLOWED_ORIGIN=https://nierusen34.github.io
ALLOWED_EDITORS=email1@example.com,email2@example.com
```

Segredo:

```text
GITHUB_TOKEN=<fine-grained token>
```

O token deve ter acesso apenas ao repositório Terra Z e somente Contents: Read/Write.

Para uma implantação mais robusta, substitua o token estático por uma GitHub App e tokens de instalação temporários.

## Ativação no frontend

Depois do Worker estar publicado e protegido pelo Access, altere `data/config.js`:

```js
publishing: {
  enabled: true,
  endpoint: "https://SEU-WORKER.workers.dev/",
  repository: "Nierusen34/terra-z",
  branch: "main"
}
```

Nenhuma credencial deve ser adicionada a `data/config.js`.
