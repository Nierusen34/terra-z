# Terra Z — Linha do Tempo da Campanha

## Objetivo

A Etapa 8 transforma **Universo → Linha do Tempo** na cronologia central do Terra Z.

Ela não duplica o Diário da Campanha. Eventos de lore continuam em `data/timeline.js`; sessões continuam em seus próprios armazenamentos e são incorporadas dinamicamente por `js/timeline-manager.js`.

## Camadas

- **História** — fatos consolidados do universo.
- **Pré-Campanha** — acontecimentos que conduzem ao início da campanha.
- **Campanha** — sessões registradas no Diário.
- **Atualidade** — acontecimentos do mundo no presente narrativo.
- **Futuro** — marcos futuros já estabelecidos no cânone.

## Eventos canônicos

Cada evento de lore possui:

- `id` permanente;
- `category`;
- `sortKey` cronológico;
- `year` e `text` editáveis;
- conexões opcionais com `characters`, `locations` e `teams`;
- `visibility`.

Os IDs de edição existentes foram preservados para continuar compatíveis com rascunhos e `content-overrides`.

## Sessões

As sessões são lidas de `TerraZApp.sessions.getAll()`.

O gerenciador usa preferencialmente `inWorldDate` para posicioná-las cronologicamente. Datas em português como **4 de Janeiro de 2027** são reconhecidas. Na ausência de uma data no universo, `realDate` funciona como fallback.

Uma sessão gera um evento virtual com ID:

`sessao-<id-da-sessao>`

Apagar ou editar a sessão no Diário atualiza a Linha do Tempo; não há cópia independente para manter.

## Navegação

Eventos possuem deep links:

`#/linha-do-tempo/<id-do-evento>`

Ao abrir o endereço, o Terra Z:

1. entra em Universo → Linha do Tempo;
2. limpa filtros que impediriam a visualização;
3. expande o evento;
4. centraliza e destaca o registro.

Conexões reutilizam o roteador da Etapa 7 para abrir personagens, distritos, cidades, equipes e sessões.

## Privacidade

A linha do tempo respeita o mesmo modelo Público / Spoiler / Mestre.

Sessões Mestre só entram em memória depois da autenticação. Eventos e chips com `data-visibility` continuam submetidos a `TerraZApp.visibility`.

## Regra de arquitetura

Não criar um segundo cadastro de sessões dentro da linha do tempo.

A Linha do Tempo é uma **visão cronológica agregada** sobre fontes canônicas já existentes.


## Editor de eventos

O Mestre autenticado pode administrar eventos de lore diretamente em **Universo → Linha do Tempo**.

Controles disponíveis:

- **＋ Novo evento**
- **✏️ Editar**
- **🗑️ Excluir**

O formulário gerencia título opcional, data exibida, ordem cronológica, camada, visibilidade, descrição e conexões com personagens, locais e equipes.

Eventos derivados de sessões não são duplicados nem apagados pelo Editor de Eventos. O botão de edição desses registros abre o **Diário da Campanha**.

### Armazenamento

- Público e Spoiler → `data/timeline.js`
- Mestre → `data/private-character-data.enc.json`, dentro de `master.timelineEvents`

Ao converter um evento público em Mestre, a API remove o registro de `data/timeline.js` e também limpa eventuais `content-overrides` públicos associados aos antigos `data-edit-id`. O evento privado não recebe IDs do editor visual genérico.

O CRUD usa ações dentro de `/api/publish`; nenhuma função serverless adicional é criada.

### Compatibilidade com edição antiga

Os 16 eventos históricos originais preservam seus IDs de edição visual. Eventos novos criados pelo Editor de Eventos usam exclusivamente o editor estruturado, portanto não precisam receber novos IDs globais `tz-####`.
