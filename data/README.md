# Camada de dados — Terra Z

Esta pasta contém dados canônicos/estruturados que não devem depender da lógica de interface.

## Arquivos atuais

### `characters.js`

Expõe `window.TerraZData.characters`.

Contém as fichas locais de personagens usadas pelo modal de fichas e pela integração com cards.

### `relations.js`

Expõe `window.TerraZData.defaultGraph`.

Contém o estado canônico padrão do grafo de relações. O grafo editado pelo usuário continua sendo armazenado separadamente em `localStorage`.

### `locations.js`

Expõe `window.TerraZData.districts`.

Contém os sete distritos de Vanguard Bay, seus tipos, locais internos, imagens, legendas e os metadados necessários para preservar os IDs estáveis do editor.

### `events.js`

Expõe `window.TerraZData.annualEvents`.

Contém os eventos anuais de Vanguard Bay e seus metadados de edição.

### `timeline.js`

Expõe `window.TerraZData.timeline`.

Contém os grupos e itens da linha do tempo do universo, preservando os IDs estáveis de ano e descrição.

### `cities.js`

Expõe `window.TerraZData.externalCities`.

Contém as 15 cidades externas de referência e suas distâncias/tempos de viagem a partir de Vanguard Bay.

### `teams.js`

Expõe `window.TerraZData.teams`.

Contém a lista histórica de equipes e a tabela de membros da Liga da Justiça usada pelo dossiê.

## Renderização

`terra-z.js` transforma esses dados em HTML antes de registrar os listeners que dependem deles.

Os renderers são idempotentes: se o container já possuir conteúdo — por exemplo, em um HTML exportado com edições consolidadas — o conteúdo existente não é sobrescrito.

## IDs de edição

Conteúdo retirado do HTML continua carregando:

- `data-edit-id`: identificador permanente atual;
- `data-legacy-edit-id`: identificador usado para migrar backups antigos.

A soma de IDs estáticos no HTML e IDs presentes nesta camada deve continuar cobrindo todos os elementos editáveis esperados, sem duplicatas.

## Contrato

Os arquivos desta pasta devem:

1. conter dados, não comportamento de interface;
2. preservar a estrutura esperada pelo `terra-z.js`;
3. ser carregados antes de `terra-z.js`;
4. evitar manipular DOM;
5. evitar registrar listeners;
6. não gravar diretamente em `localStorage`;
7. manter metadados de edição quando o conteúdo correspondente for editável.

## Próximos candidatos

A separação futura pode considerar outros conjuntos tabulares de lore com fonte canônica clara, mas deve evitar transformar toda a prosa editorial do site em dados apenas por uniformidade.

A partir deste ponto, a maior dívida estrutural deixa de ser a localização dos dados principais e passa a ser a concentração de comportamento em `terra-z.js`.
