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
- `visibility`;
- `nuclei` — lista de IDs dos núcleos aos quais a entidade pertence.

Uma entidade pode pertencer a mais de um núcleo ou ficar temporariamente sem núcleo. O ID não é alterado pelo editor para preservar relações existentes.

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
- seletor único de núcleo;
- modos **Somente núcleo** e **Núcleo + conexões**;
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

### Núcleos dinâmicos

Os núcleos deixaram de depender dos quadrantes desenhados no canvas. O grafo agora mantém um registro próprio em `graph.nuclei`, e cada entidade guarda sua participação em `node.nuclei`.

O seletor **◎ Núcleo** é montado automaticamente a partir desse registro. Isso significa que novos núcleos criados no editor passam a aparecer na interface sem novos botões ou alterações de código.

Com um núcleo selecionado:

- **Somente núcleo** mostra apenas as entidades pertencentes a ele e os vínculos internos;
- **Núcleo + conexões** inclui também entidades externas conectadas diretamente ao núcleo;
- **Todos os núcleos** restaura a rede completa.

O viewport é recalculado a partir do conteúdo real do núcleo ativo. A câmera não reutiliza mais a antiga área fixa 1000×720 como âncora: cada núcleo é centralizado pela própria geometria, o quadro é expandido para a proporção real disponível na tela e o modo **Núcleo + conexões** mantém o núcleo principal como centro mesmo quando entidades externas aparecem. A altura visual do mapa permanece estável entre trocas de núcleo para evitar saltos de layout.

Os quadrantes continuam existindo como recurso de composição visual do layout global, mas não são mais a fonte de verdade para definir pertencimento. A auto-organização pode reconstruir zonas visuais com base nos núcleos cadastrados.

Vanguard Bay usa exatamente o mesmo sistema de Família Queen, Família Wayne, Núcleo Marciano e Prazo de Lobo; não existe mais uma camada especial exclusiva para Vanguard Bay.

## Editor

O editor autenticado possui quatro abas:

1. **Entidades**
2. **Relações**
3. **Núcleos**
4. **Layout visual**

Na aba **Núcleos** é possível criar, renomear, recolorir e excluir núcleos. Excluir um núcleo não apaga suas entidades ou relações; apenas remove aquela classificação dos nós associados.

Na aba **Entidades**, cada item pode ser associado a um ou mais núcleos por caixas de seleção. É possível criar, editar e excluir itens. A exclusão de uma entidade também remove do rascunho as relações que apontam para ela.

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

O algoritmo usa primeiro os núcleos cadastrados e depois as relações entre as entidades. Cada entidade é posicionada pelo seu núcleo principal; entidades sem núcleo recebem uma zona própria. As zonas visuais são geradas dinamicamente conforme a quantidade de núcleos em uso. Dentro de cada núcleo, entidades mais conectadas funcionam como pontos centrais e os demais nós são distribuídos em camadas com espaçamento seguro.

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

`js/graph.js` migra em memória o schema antigo e também lê o antigo `terraZ_graph_v2` do localStorage quando não existe estado v3 publicado. Grafos antigos sem `nuclei` recebem uma migração inicial baseada apenas nos quadrantes existentes; depois de salvos, o pertencimento passa a ser explícito.

A API continua usando `/api/graph`; nenhuma nova função serverless foi criada. O backend anuncia a capacidade `graph_nuclei_v1` antes de permitir alterações pelo editor, evitando que um backend antigo remova associações de núcleo ao salvar.
