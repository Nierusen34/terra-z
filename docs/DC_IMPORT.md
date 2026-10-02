# DC Database → Terra Z

## Objetivo

A busca integrada da DC Database pode ser usada como ponto de entrada para novas entidades do Terra Z sem copiar automaticamente o cânone da wiki.

O fluxo exige editor autenticado.

## Ações

Ao pesquisar um personagem na aba **DC Wiki**, o editor pode abrir **＋ Terra Z** e escolher:

- **＋ Criar Card** — abre o editor de personagem já preenchido com o título-base da página;
- **◎ Adicionar ao Grafo** — cria uma bolinha em rascunho no Layout visual;
- **＋ Card + Grafo** — cria primeiro o card e, após salvar, prepara a entidade correspondente no grafo.

A mesma ação também fica disponível no cabeçalho do artigo aberto dentro do Terra Z.

## Princípio de segurança editorial

O Terra Z não importa automaticamente biografia, status, afiliações, poderes ou outros fatos da DC Database.

A wiki é usada somente como:

- referência de título/versão;
- fonte automática inicial de retrato;
- referência visual para uma entidade de grafo sem card.

O editor continua responsável por revisar nome, ficha, metadados, visibilidade e relações antes de salvar.

## Retrato

Ao criar um card pela DC Database, o Terra Z configura a fonte automática de retrato como:

`provider: dc-fandom`

e preserva o `wikiTitle` completo da página escolhida.

Assim, o card pode usar a mesma resolução automática de retrato já existente no projeto sem copiar a imagem para o repositório.

## Grafo

Se o card já existir, a bolinha usa:

- `kind: character`;
- `ref` apontando para o personagem do Terra Z;
- `mediaMode: character`.

Se ainda não houver card, a entidade é criada como rascunho de personagem com a imagem encontrada na DC Database em modo URL.

Nada é publicado automaticamente. O editor ainda precisa posicionar/revisar a entidade e clicar em **Salvar relações**.

## Duplicados

Antes de criar, o fluxo compara o título da página e sua forma sem sufixos comuns de continuidade, como `(Prime Earth)` ou `(New Earth)`, com:

- personagens existentes;
- `ref`, rótulo e subtítulo das entidades do grafo.

Se encontrar algo existente, o fluxo abre/seleciona a entidade atual em vez de criar uma cópia.

Se uma bolinha sem card já existir e o card for criado depois, o rascunho do grafo passa a apontar para esse card quando o editor revisar e salvar.

## Mobile

O painel **Adicionar ao Terra Z** usa ações empilhadas em telas pequenas para não competir com o artigo ou com os resultados da busca.
