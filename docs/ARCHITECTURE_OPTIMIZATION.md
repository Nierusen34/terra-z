# Terra Z — Otimização de Arquitetura

## Objetivo

Esta etapa técnica reduz o custo de desenvolvimento, deploy e carregamento sem reescrever o Terra Z ou alterar seu modelo de privacidade.

## Resultado

### Desenvolvimento

Antes:

`main → commit → GitHub Pages → smoke → novo commit → novo Pages → ...`

Agora:

`dev → Quality Gate + dev smoke → vários commits → integração única no main → GitHub Pages → checkpoint Vercel`

O branch `dev` é a área oficial de desenvolvimento de código.

### Serverless

A arquitetura passou de **12 funções** para **8 funções serverless de nível superior**.

Consolidações:

- `master-template.js` → `master.js?action=template`
- `master-finalize.js` → `master.js?action=finalize`
- `private-sessions.js` → `session.js?action=private`
- `status.js` → `health.js?mode=status`

`vercel.json` mantém rewrites para que clientes antigos continuem funcionando durante a transição.

Meta permanente: **<= 9 funções**, limite absoluto conhecido do projeto: 12.

### Carregamento administrativo

Antes, o HTML carregava 52 scripts externos no boot.

Depois da separação administrativa, o boot público carrega **37 scripts**.

Ferramentas administrativas são carregadas somente ao abrir **⚙️ Administração** através de:

- `js/admin-loader.js`
- `js/admin-foundation.js`

Módulos como editores, Histórico, Integridade, Biblioteca, Mestre e Taxonomias deixam de fazer parte do carregamento inicial.

### Imagens

9 PNGs pesados de cidade/distritos foram convertidos para WebP de alta qualidade.

Resultado da conversão:

- antes: **25,39 MB**
- depois: **4,62 MB**
- redução nesse conjunto: **81,8%**

O repositório caiu de aproximadamente **33,3 MB para 11,5 MB** no snapshot da otimização, sem alterar dimensões das imagens.

Detalhes: `docs/IMAGE_OPTIMIZATION.md`.

### Infraestrutura para Etapas 11–13

`js/admin-foundation.js` oferece utilitários comuns para:

- seleção múltipla;
- busca normalizada;
- filtros;
- agrupamento;
- operações em lote;
- normalização/slug.

Isso evita reconstruir a mesma infraestrutura em:

- Etapa 11 — Taxonomias;
- Etapa 12 — Edição em Lote;
- Etapa 13 — Painel Rápido do Mestre.

## Testes

### No dev

Cada push executa:

- **Terra Z quality gate**
- **Terra Z dev smoke**

Execuções antigas são canceladas quando substituídas por commits novos.

O smoke do `dev` usa um servidor HTTP local dentro do GitHub Actions, portanto não precisa publicar GitHub Pages para validar os arquivos estáticos.

### No main

Após integração:

- Quality Gate;
- GitHub Pages;
- GitHub Pages smoke test.

### Produção

Somente depois da aprovação do `main`:

**Administração → Histórico e Produção → Publicar checkpoint**

O checkpoint continua sendo a única via oficial para atualizar a Vercel.

## Compatibilidade

A otimização não altera:

- URLs públicas do site;
- formato de fichas;
- Público / Spoiler / Mestre;
- criptografia AES-256-GCM;
- histórico e restauração;
- editor via navegador;
- GitHub Pages;
- fluxo de checkpoint;
- dados canônicos da campanha.

## Orçamento permanente

O Quality Gate passa a verificar:

- no máximo 40 scripts no boot público;
- meta de até 9 funções serverless;
- ausência de PNGs > 1 MB em cidade/distritos;
- alerta se o acervo visual superar 20 MB;
- existência dos workflows `dev` e do relatório de imagens.
