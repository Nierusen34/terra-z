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

## Interação pública

O mapa publicado também é interativo para visitantes que não estão autenticados como editor.

- qualquer visitante pode arrastar uma bolinha com mouse ou toque;
- a movimentação é apenas visual e local à sessão atual;
- nenhuma posição movida por visitante é enviada para GitHub ou Vercel;
- o conteúdo canônico do grafo permanece inalterado;
- **↺ Posições** restaura imediatamente o layout publicado;
- tocar/clicar continua abrindo a inspeção e duplo clique continua abrindo a entidade quando houver destino.

Em telas touch, os nós possuem uma área de captura maior do que o círculo visível. Enquanto um nó está sendo arrastado, o canvas bloqueia rolagem concorrente para evitar que a página se mova junto com a entidade.

## Conexão rápida

Para o uso comum, não é mais necessário abrir o editor avançado de Relações.

Fluxo recomendado para editores:

1. selecione uma bolinha no mapa;
2. clique em **🔗 Conectar** no painel lateral;
3. clique/toque na entidade de destino;
4. escolha tipo, intensidade, direção e visibilidade;
5. clique em **Criar conexão**.

Enquanto o destino está sendo escolhido, uma linha temporária parte da entidade de origem. O botão **Escolher da lista** serve como alternativa quando o mapa está muito cheio.

O sistema bloqueia conexão da entidade com ela mesma e impede duplicação exata do mesmo vínculo.

No **Layout visual**, a entidade selecionada também possui **🔗 Conectar**. Nesse caso a conexão entra no rascunho e só é publicada junto com **Salvar alterações**.

O editor avançado de Entidades e Relações continua disponível para manutenção detalhada.

## Mapa expandido e crescimento por núcleos

O mapa principal não depende mais de uma área visual fixa de 1000×720 para navegação.

A estrutura canônica continua usando coordenadas do Grafo 2.0, mas o viewport agora é calculado dinamicamente a partir de:

- quadrantes/núcleos existentes;
- posições e tamanhos das entidades;
- margem externa de navegação.

Isso permite adicionar núcleos além da área original sem diminuir todas as bolinhas apenas para fazê-las caber na tela.

### Navegação

O mapa oferece:

- zoom de 60% a 300%;
- roda do mouse para zoom no desktop;
- arraste do fundo para mover o viewport;
- gesto de pinça no fundo em telas touch;
- **⊙ Ajustar** para enquadrar toda a rede;
- **⛶ Tela cheia** para usar o grafo como mapa principal;
- **☰ Ocultar/Mostrar painel** para liberar mais área de visualização.

No modo tela cheia, o inspector permanece ao lado no desktop e funciona como painel sobreposto/retrátil no mobile.

No mobile/PWA, os controles do mapa são compactados em duas faixas curtas: zoom e ações do viewport. O cabeçalho deixa de reservar altura de desktop e o grafo aparece imediatamente abaixo dos controles. Ao entrar em **Tela cheia** em uma tela estreita, o inspector começa recolhido para priorizar o mapa e pode ser reaberto por **Mostrar painel**.

A antiga dica **“Deslize o grafo horizontalmente”** não é usada no Grafo 2.0, pois o mapa agora possui pan/zoom próprio.

### Foco narrativo

Selecionar uma entidade ativa foco contextual:

- a entidade escolhida e suas conexões diretas permanecem em destaque;
- relações e entidades não conectadas ficam visualmente reduzidas;
- **◎ Rede completa** restaura a leitura global sem perder a seleção.

Isso evita que o crescimento do grafo transforme a rede inteira em uma teia visual difícil de interpretar.

### Relações entre núcleos

Vínculos cujas pontas pertencem a núcleos diferentes usam curvas externas ao invés da mesma curva curta das relações internas.

O roteamento escolhe uma faixa periférica do canvas com menor custo visual e reduz rótulos externos quando a relação não está em foco. Ao selecionar uma das entidades envolvidas ou a própria relação, o rótulo volta a aparecer.

Relações internas ao mesmo núcleo mantêm o desenho compacto anterior.

## Editor

O editor autenticado possui três abas:

1. **Entidades**
2. **Relações**
3. **Layout visual**

É possível criar, editar e excluir itens. A exclusão de uma entidade também remove do rascunho as relações que apontam para ela.

### Layout visual

O Layout visual mostra o grafo inteiro dentro do editor e permite:

- arrastar qualquer nó diretamente com o mouse;
- arrastar com o dedo em telas touch/mobile, com alvo de toque ampliado e bloqueio temporário da rolagem do canvas;
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
