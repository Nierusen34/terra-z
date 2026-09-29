# Camada de dados — Terra Z

Esta pasta contém dados canônicos/estruturados que não devem depender da lógica de interface.

## Arquivos atuais

### `characters.js`

Expõe:

```js
window.TerraZData.characters
```

Contém as fichas locais de personagens usadas pelo modal de fichas e pela integração com cards.

### `relations.js`

Expõe:

```js
window.TerraZData.defaultGraph
```

Contém o estado canônico padrão do grafo de relações.

O grafo editado pelo usuário continua sendo armazenado separadamente em `localStorage`.

## Contrato

Os arquivos desta pasta devem:

1. conter dados, não comportamento de interface;
2. preservar a estrutura esperada pelo `terra-z.js`;
3. ser carregados antes de `terra-z.js`;
4. evitar manipular DOM;
5. evitar registrar listeners;
6. não gravar diretamente em `localStorage`.

## Próximos candidatos

A separação futura deve considerar, em etapas independentes:

- distritos e locais;
- eventos e timeline;
- equipes;
- cidades externas.

Antes de mover conteúdo atualmente editável do HTML para JavaScript, é necessário preservar os `data-edit-id` permanentes usados pelo sistema de edição.
