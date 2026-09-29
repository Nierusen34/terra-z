# Publicação operacional — Terra Z

Este documento descreve como ativar a publicação direta pelo site.

## O que já está implementado

O repositório contém uma API serverless compatível com Vercel:

- `POST /api/login` — autentica editor;
- `GET /api/health` — informa se backend/GitHub estão configurados;
- `POST /api/publish` — publica alterações textuais em `data/content-overrides.js`;
- `GET /api/status?sha=...` — acompanha o GitHub Pages;
- `POST /api/media` — publica retrato + metadados no mesmo commit;
- `POST /api/session` — registra/atualiza uma sessão;
- `GET /api/master` — entrega conteúdo mestre somente ao editor autenticado.

O frontend já contém:

- login de editor em **Publicar**;
- sessão de autenticação em `sessionStorage`;
- botão Publicar;
- upload de retrato pela ficha;
- formulário de sessão;
- preservação de rascunhos concorrentes;
- base para conteúdo mestre privado.

## Segurança

Nenhum token GitHub fica no GitHub Pages.

As credenciais vivem apenas nas Environment Variables da Vercel.

### GitHub

Há duas opções.

#### Opção rápida — Fine-grained Personal Access Token

Restrinja o token a:

- Repository access: **Only select repositories → Nierusen34/terra-z**
- Permissions:
  - Contents: **Read and write**

Salve na Vercel como:

```
GITHUB_TOKEN
```

#### Opção recomendada — GitHub App

Instale a app somente no repo Terra Z.

Permissões mínimas:

- Contents: Read and write
- Actions: Read (para acompanhar deploy; se não disponível, o commit continua funcionando)

Variáveis:

- `GITHUB_APP_ID`
- `GITHUB_INSTALLATION_ID`
- `GITHUB_PRIVATE_KEY`

## Autenticação do editor

Configure:

- `EDITOR_AUTH_SECRET`: string aleatória longa;
- `EDITOR_PASSWORD_HASH`: SHA-256 hexadecimal da senha escolhida.

`EDITOR_PASSWORD` existe apenas como fallback simples.

Tokens de editor duram 4 horas e ficam em `sessionStorage`, não em `localStorage`.

## Vercel

O projeto pode usar este mesmo repositório.

A raiz do projeto contém:

- `package.json`;
- `vercel.json`;
- diretório `api/`.

Após o deploy, haverá uma URL semelhante a:

```
https://<projeto>.vercel.app
```

Atualize então `config.js`:

```js
window.TerraZConfig.publishing = {
  enabled: true,
  apiBase: "https://<projeto>.vercel.app",
  repository: "Nierusen34/terra-z",
  branch: "main"
};
```

## Retratos

O site aceita:

- PNG;
- JPEG;
- WebP;
- até 2 MB.

O backend publica atomicamente:

1. `images/characters/<slug>.<ext>`;
2. `data/character-media.js`.

## Sessões

O formulário salva em `data/sessions.js`.

Campos:

- título;
- data real;
- data no universo;
- resumo;
- personagens;
- locais;
- consequências;
- visibilidade.

## Conteúdo mestre privado

A infraestrutura está preparada, mas a migração deve ocorrer em uma etapa controlada.

Hoje alguns segredos ainda existem em `data/characters.js` para não quebrar o site antes da configuração.

Quando `MASTER_CONTENT_JSON` estiver configurado e testado:

1. mover os segredos para a variável privada;
2. remover esses segredos do bundle público;
3. manter apenas a consulta autenticada via `/api/master`.

Não remover os segredos públicos antes de validar o endpoint privado.

## Conflitos

Publicações textuais usam:

- baseline do navegador;
- estado atual no GitHub;
- head SHA do branch.

Se outro usuário publicou o mesmo campo antes, a API retorna conflito em vez de sobrescrever silenciosamente.

## Fluxo final

```text
Editar no site
   ↓
Salvar rascunho local
   ↓
Entrar como editor
   ↓
Publicar
   ↓
Vercel API
   ↓
GitHub commit
   ↓
GitHub Pages
   ↓
Site recarrega
```


## Migração final dos segredos para o backend privado

O painel **Publicar** possui uma seção **Conteúdo Mestre privado** para concluir a Fase 8 com segurança.

Fluxo:

1. entre como editor;
2. clique em **Copiar JSON Mestre**;
3. na Vercel, crie/atualize `MASTER_CONTENT_JSON` com o valor copiado;
4. faça um novo deploy da Vercel;
5. volte ao painel Publicar;
6. quando o status indicar que o JSON está válido, clique em **Remover segredos públicos**.

O endpoint de finalização compara o conteúdo privado com os segredos ainda presentes em `data/characters.js`. A remoção é bloqueada se houver qualquer personagem ausente ou conteúdo diferente.

Endpoints envolvidos:

- `GET /api/master-template` — autenticado; gera a cópia privada;
- `POST /api/master-finalize` — autenticado; valida e remove os arrays públicos;
- `GET /api/health` — informa `master_content: missing | ready | invalid`.

Depois da finalização, usuários públicos deixam de receber esses segredos no JavaScript. Editores autenticados continuam recebendo-os por `/api/master`.
