# Terra Z — Biblioteca de Mídia

## Objetivo

A Etapa 10 cria uma camada de mídia reutilizável independente de fichas de personagem.

Isso resolve casos como **Armek**: a entidade pode existir no Grafo 2.0, possuir imagem, relações e enquadramento próprios sem precisar receber card ou ficha de personagem.

## Fontes de mídia

O Terra Z agora trabalha com duas famílias principais:

1. **Retratos de personagens**
   - continuam em `data/character-media.js`;
   - alimentam cards, fichas e o grafo quando uma entidade usa o modo `character`;
   - preservam o enquadramento separado de card/ficha/grafo.

2. **Ativos reutilizáveis**
   - ficam em `data/media-library.js`;
   - podem ser arquivos locais ou URLs externas;
   - não exigem personagem, card ou ficha;
   - podem ser usados por entidades do grafo e futuramente por outras áreas.

## Biblioteca

A Biblioteca de Mídia fica no painel de Administração.

Ela mostra:

- retratos de personagens já existentes;
- ativos reutilizáveis;
- onde cada ativo independente está sendo usado no grafo;
- itens órfãos que não estão associados a nenhuma entidade;
- fonte da imagem;
- categoria do ativo.

Filtros disponíveis:

- todos;
- retratos de personagens;
- ativos reutilizáveis;
- órfãos;
- retrato;
- grafo;
- mapa;
- editorial;
- equipe;
- outros.

## CRUD de ativos

O editor autenticado pode:

- criar ativo por upload;
- criar ativo por URL HTTPS;
- editar nome, categoria e crédito;
- trocar arquivo;
- trocar entre arquivo local e URL externa;
- ajustar enquadramento;
- excluir um ativo órfão.

Um ativo em uso no grafo não pode ser excluído diretamente. Primeiro é necessário remover ou trocar sua associação na entidade correspondente.

## Arquivos locais

Uploads aceitam:

- PNG;
- JPEG;
- WebP;
- até 2 MB.

Arquivos ficam em:

`images/library/<id>.<ext>`

A API existente `/api/media` também serve esses arquivos, então nenhum novo endpoint serverless foi criado.

## Entidades do Grafo 2.0

Cada nó pode escolher uma fonte visual:

- `none` — sem imagem;
- `character` — retrato da referência/personagem;
- `library` — ativo independente da Biblioteca;
- `url` — URL HTTPS específica daquela entidade.

Campos:

- `mediaMode`;
- `mediaId`;
- `mediaUrl`;
- `mediaFraming`.

### Caso Armek

Armek pode continuar como uma entidade `custom` sem ficha.

Basta:

1. criar um ativo chamado **Armek** na Biblioteca;
2. abrir **Relações → Administrar relações**;
3. selecionar Armek;
4. escolher **Biblioteca de Mídia**;
5. selecionar o ativo;
6. ajustar recorte e ampliação;
7. salvar o grafo.

Nenhum card de personagem é criado nesse processo.

## Enquadramento por entidade

Ativos usados no grafo aceitam:

- Preencher / recortar;
- Imagem inteira;
- zoom de 50% a 250%;
- posição horizontal;
- posição vertical.

O enquadramento do nó pode ser diferente do enquadramento padrão do ativo.

## Privacidade

A Biblioteca canônica atual contém ativos públicos/reutilizáveis.

Entidades Mestre não podem referenciar ativos públicos da Biblioteca. Para uma entidade Mestre, a API exige **URL direta** ou ausência de imagem, de forma que a referência fique armazenada dentro do grafo privado criptografado.

Retratos de personagens Mestre continuam usando a infraestrutura privada de personagens já existente.

## Runtime

`/api/health?runtime=1` inclui `mediaLibrary`, permitindo que mudanças salvas sejam refletidas no site sem esperar um novo build do GitHub Pages.

## Histórico

`data/media-library.js` e `images/library/` fazem parte do escopo restaurável do histórico de conteúdo.
