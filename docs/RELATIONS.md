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
- abertura da entidade por deep link quando houver destino.

O mapa usa formas distintas por tipo de entidade, linhas curvas, intensidade visual por força do vínculo e setas para relações direcionais.

## Editor

O editor autenticado possui duas abas:

1. **Entidades**
2. **Relações**

É possível criar, editar e excluir itens. A exclusão de uma entidade também remove do rascunho as relações que apontam para ela.

Há ações de:

- auto-organização;
- restauração do backup local anterior;
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
