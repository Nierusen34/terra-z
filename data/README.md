# Camada de dados — Terra Z

A pasta `data/` contém o estado canônico e os overrides estruturados do universo. A lógica de interface permanece em `js/`.

## Arquivos principais

- `characters.js` — fichas públicas canônicas;
- `character-overrides.js` — personagens criados/alterados e tombstones;
- `character-meta.js` — taxonomias e metadados públicos;
- `character-media.js` — mídia/enquadramento de personagens;
- `media-library.js` — Biblioteca de Mídia;
- `relations.js` — grafo base;
- `graph-overrides.js` — Grafo 2.0 publicado;
- `locations.js` — distritos e locais de Vanguard Bay;
- `events.js` — eventos anuais;
- `timeline.js` — eventos públicos/spoiler da Timeline;
- `cities.js` — cidades externas;
- `teams.js` — equipes e membros de referência;
- `sessions.js` — sessões públicas/spoiler;
- `visibility.js` — metadados auxiliares de visibilidade;
- `content-overrides.js` — edições textuais publicadas.

## Conteúdo Mestre

Conteúdo Mestre não deve ser gravado em arquivos JavaScript públicos.

Os cofres atuais são:

- `private-character-data.enc.json` — fichas Mestre, seções privadas, conteúdo Mestre, Timeline Mestre e grafo Mestre;
- `private-sessions.enc.json` — sessões Mestre.

Ambos usam envelope AES-256-GCM e são lidos somente pelo backend autenticado.

## Runtime

`js/runtime-data.js` pode atualizar os contêineres públicos a partir do backend sem depender de um novo deploy estático para cada alteração de conteúdo.

Os módulos de renderização consomem `window.TerraZData` e reagem aos eventos de atualização.

## Persistência

Dados estruturados publicados são persistidos no GitHub. `localStorage` é reservado a preferências/rascunhos locais compatíveis com cada ferramenta; ele não é a fonte canônica do Grafo, personagens, sessões ou Timeline.

## IDs de edição

Conteúdo editorial editável preserva:

- `data-edit-id` — identificador permanente;
- `data-legacy-edit-id` — compatibilidade com backups antigos quando aplicável.

## Contrato

Arquivos de `data/` devem:

1. conter dados, não comportamento de interface;
2. preservar a estrutura esperada pelos renderers;
3. ser carregados antes dos módulos que os consomem;
4. não manipular DOM;
5. não registrar listeners;
6. não gravar em `localStorage`;
7. manter IDs estáveis e referências válidas;
8. nunca expor conteúdo marcado Mestre.

O Quality Gate valida estrutura, referências, privacidade e presença dos arquivos criptografados antes de qualquer checkpoint de produção.
