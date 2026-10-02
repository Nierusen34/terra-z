# Terra Z — Relações e Grafo 2.0

## Objetivo

A Etapa 9 transforma **Universo → Relações** em uma rede narrativa administrável pelo site.

O grafo deixa de representar apenas personagem ↔ personagem e passa a aceitar:

- personagens;
- equipes;
- facções;
- organizações;
- locais;
- eventos;
- entidades personalizadas.

A etapa não cria novas relações canônicas automaticamente. Os vínculos existentes foram preservados e reclassificados quando o próprio rótulo já indicava o tipo, como casal, mentor ou inimigos.

## Entidades

Cada nó usa o schema v3:

- `id` — identificador permanente;
- `label` — nome curto exibido no grafo;
- `subtitle` — identificação complementar;
- `kind` — character, team, faction, organization, location, event ou custom;
- `ref` — nome/ID canônico usado para navegação interna;
- `route` — rota manual opcional;
- `icon`;
- `x`, `y`, `r`;
- `color`;
- `visibility`.

O ID não é alterado pelo editor para preservar relações existentes.

## Relações

Cada vínculo usa:

- `id`;
- `from` e `to`;
- `type`;
- `label`;
- `note`;
- `strength` de 1 a 5;
- `directed` para relações com direção;
- `visibility`.

Tipos disponíveis incluem família, romance, aliado, mentoria, membro, comando, negócio, investigação, origem, clone, tensão, inimizade, rivalidade e outro.

## Interface

A página principal oferece:

- busca de entidades;
- filtro por tipo de entidade;
- filtro por tipo de relação;
- legenda clicável;
- painel lateral de inspeção;
- conexões diretas;
- intensidade da relação;
- notas narrativas;
- abertura da entidade por deep link quando houver destino;
- controle de escala de 75% a 200%, persistido no navegador.

A escala inicial é 130% para priorizar legibilidade. O botão **100%** retorna ao tamanho-base.

O mapa usa formas distintas por tipo de entidade, linhas curvas, intensidade visual por força do vínculo e setas para relações direcionais.

### Imagens das entidades

A imagem do nó não depende mais da existência de uma ficha.

Cada entidade pode usar:

- **Sem imagem**;
- **Retrato da referência/personagem**;
- **Biblioteca de Mídia**;
- **URL direta**.

Personagens continuam podendo reutilizar `data/character-media.js`. Entidades sem ficha — como Armek — podem usar um ativo independente da Biblioteca, sem criar card de personagem.

O próprio nó guarda seu enquadramento para Biblioteca/URL, permitindo recorte e ampliação específicos no grafo.

## Editor

O editor autenticado possui três abas:

1. **Entidades**
2. **Relações**
3. **Layout visual**

É possível criar, editar e excluir itens. A exclusão de uma entidade também remove do rascunho as relações que apontam para ela.

### Layout visual

O Layout visual mostra o grafo inteiro dentro do editor e permite:

- arrastar qualquer nó diretamente com o mouse;
- arrastar com o dedo em telas touch/mobile;
- tocar para selecionar uma entidade;
- editar os dados da entidade selecionada;
- adicionar uma entidade e posicioná-la visualmente;
- remover a entidade selecionada;
- desfazer movimentos e alterações de layout antes de salvar.

As linhas ligadas ao nó acompanham o movimento em tempo real.

### Auto-organização inteligente

A auto-organização não agrupa mais entidades simplesmente pelo tipo. Personagens deixaram de ser colocados todos no mesmo círculo.

O algoritmo usa os núcleos/quadrantes do mapa e as relações entre as entidades. Para os núcleos conhecidos, a posição canônica do grafo padrão ajuda a preservar a associação correta mesmo quando um layout publicado ficou desorganizado. Dentro de cada núcleo, entidades mais conectadas funcionam como pontos centrais e os demais nós são distribuídos em camadas com espaçamento seguro.

### Layout anterior

O botão **Layout anterior** restaura somente posições e tamanhos do último layout publicado neste dispositivo, sem substituir relações, entidades ou conteúdo Mestre. Isso evita que um simples carregamento/refresh sobrescreva o backup e também impede que conteúdo privado seja armazenado no localStorage.

Há ações de:

- auto-organização inteligente;
- desfazer alterações da edição atual;
- restauração do layout publicado anterior;
- carregamento do grafo padrão;
- salvamento versionado no GitHub.

## Navegação interna

Quando possível, `kind + ref` resolve automaticamente:

- character → ficha do personagem;
- team → equipe;
- location → distrito/cidade/local resolvido pelo roteador;
- event → Linha do Tempo.

`route` pode ser usado para destinos internos personalizados.

## Privacidade

O comportamento Público / Spoiler / Mestre continua valendo.

- Público e Spoiler são persistidos em `data/graph-overrides.js`.
- Nós Mestre e relações Mestre são removidos do snapshot público e salvos dentro de `data/private-character-data.enc.json`.
- Qualquer relação conectada a um nó Mestre é forçada para Mestre pela API.

## Compatibilidade

`js/graph.js` migra em memória o schema antigo e também lê o antigo `terraZ_graph_v2` do localStorage quando não existe estado v3 publicado.

A API continua usando `/api/graph`; nenhuma nova função serverless foi criada.
