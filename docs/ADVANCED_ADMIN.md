# Terra Z — Administração Avançada · Etapas 11, 12 e 13

## Visão geral

As Etapas 11–13 formam uma camada única de Administração Avançada, mas continuam separadas internamente:

- **Etapa 11 — Taxonomias e Organização do Universo**
- **Etapa 12 — Edição em Lote**
- **Etapa 13 — Sala do Mestre**

Todas reutilizam `js/admin-foundation.js` e são carregadas sob demanda pelo `js/admin-loader.js`.

---

## Etapa 11 — Taxonomias

A antiga tela “Filtros / Núcleos” foi transformada em um gerenciador geral de taxonomias de personagem.

Coleções administráveis:

- **Núcleos** — agrupamentos narrativos e chips da página de Personagens;
- **Tipos** — protagonista, herói, vilão, NPC etc.;
- **Status** — ativo, desaparecido, morto etc.;
- **Tags** — etiquetas livres criadas pelo Mestre.

### CRUD

É possível:

- criar;
- renomear;
- reordenar;
- excluir.

IDs internos permanecem estáveis quando o rótulo é renomeado.

Fall­backs protegidos:

- núcleo `other`;
- tipo `other`;
- status `unknown`.

Ao remover uma definição, personagens públicos e Mestre são reconciliados automaticamente. Personagens Mestre são atualizados dentro do cofre criptografado.

### Tags

Tags entram também em:

- editor individual de personagem;
- busca de personagens;
- filtros avançados;
- edição em lote.

### Entidades reais não viram taxonomia

Equipes, cidades, organizações, facções, locais e demais elementos que representam **coisas reais do universo** continuam sendo entidades/conteúdo estruturado, e não simples valores de taxonomia.

Exemplo:

- “Gotham” como cidade continua sendo uma cidade;
- “Liga da Justiça” como equipe continua sendo uma equipe;
- “Gotham / Bat Família” como agrupamento de personagens pode continuar sendo um núcleo.

Isso evita duplicar ou empobrecer o modelo de dados.

---

## Etapa 12 — Edição em Lote

Nova ferramenta:

**Administração → Edição em Lote**

Permite selecionar vários personagens e aplicar em uma única publicação:

- tipo;
- status;
- destaque/principal;
- visibilidade Público ↔ Spoiler;
- adicionar/remover/substituir núcleos;
- adicionar/remover/substituir tags.

### Personagens Mestre

Personagens Mestre aparecem na seleção depois do carregamento privado e podem receber:

- tipo;
- status;
- núcleos;
- tags;
- destaque.

Eles **não podem ser convertidos de/para Mestre pelo lote**. Essa mudança continua no editor individual porque exige migração segura de ficha, mídia e dados entre arquivos públicos e o cofre criptografado.

### Backend

A ação usa o endpoint existente:

`POST /api/character`

com:

`action: "bulk-update-meta"`

Nenhuma nova função serverless foi criada.

---

## Etapa 13 — Sala do Mestre

Nova ferramenta:

**Administração → Sala do Mestre**

É um painel de condução rápida e não substitui o Conteúdo Mestre detalhado.

Mostra:

- objetivos ativos;
- pistas ainda ocultas;
- revelações planejadas;
- NPCs ativos, desaparecidos ou capturados;
- notas privadas recentes;
- últimos acontecimentos da Timeline e do Diário;
- sessões Mestre quando autenticado.

Também oferece atalhos para:

- Conteúdo Mestre;
- Registrar sessão;
- atualização manual do painel.

### Alertas automáticos

A Sala do Mestre sinaliza situações simples, como:

- nenhum objetivo ativo;
- muitas pistas ainda ocultas;
- revelações planejadas;
- NPCs desaparecidos/capturados.

Esses alertas são auxiliares e não alteram conteúdo automaticamente.

---

## Privacidade

As três etapas respeitam Público / Spoiler / Mestre.

- Definições de taxonomia são públicas porque seus nomes alimentam filtros de interface.
- Metadados de personagens Mestre continuam dentro do perfil criptografado.
- Sala do Mestre só abre para editor autenticado e lê `privateContent`.
- Edição em lote não expõe nem migra ficha Mestre para arquivo público.

---

## Arquivos principais

- `js/taxonomy-manager.js`
- `js/bulk-editor.js`
- `js/master-quick.js`
- `js/admin-foundation.js`
- `api/character.js`
- `data/character-meta.js`

## Capacidades de backend

`/api/health` anuncia:

- `taxonomy_manager_v2:true`
- `bulk_editor_v1:true`
- `master_quick_panel_v1:true`

## Serverless

As Etapas 11–13 reutilizam as APIs atuais.

Contagem permanece em **8 funções serverless**.
