# Módulos JavaScript — Terra Z

A Fase 3 separa o comportamento do site por responsabilidade, mantendo HTML/CSS/JavaScript puro e GitHub Pages.

## Ordem de carregamento

Depois dos arquivos em `data/`, o site carrega:

1. `terra-z.js` — núcleo compartilhado e bootstrap
2. `js/data-renderer.js` — transforma dados canônicos em DOM
3. `js/editor.js` — hidrata edições salvas, edição, exportação e backups
4. `js/navigation.js` — navegação, temas, jornais, drawers, lightbox e timeline interativa
5. `js/search.js` — busca local e integração com DC Wiki
6. `js/characters.js` — fichas e modal de personagens
7. `js/favorites.js` — favoritos
8. `js/presentation.js` — modo apresentação
9. `js/graph.js` — grafo de relações e editor

A ordem importa. A camada de dados é renderizada primeiro e o editor hidrata as edições salvas antes de módulos como personagens e favoritos lerem o texto do DOM. Os módulos de interface dependem de `TerraZCore`.

## Núcleo

`terra-z.js` expõe:

```js
window.TerraZCore
window.TerraZApp
```

### `TerraZCore`

Helpers compartilhados:

- `showToast`
- `showConfirm`
- `escapeHtml`
- `escapeAttr`
- `escapeRegex`

### `TerraZApp`

Namespace para APIs funcionais dos módulos:

- `TerraZApp.dataRenderer`
- `TerraZApp.navigation`
- `TerraZApp.search`
- `TerraZApp.characters`
- `TerraZApp.favorites`
- `TerraZApp.presentation`
- `TerraZApp.editor`
- `TerraZApp.graph`

## Compatibilidade

Algumas funções continuam expostas diretamente em `window` porque o HTML existente já as utiliza em listeners registrados no script da página.

Isso é uma camada de compatibilidade, não o padrão preferido para código novo.

Novos módulos devem preferir:

```js
window.TerraZApp.nomeDoModulo
```

## Regras para novos módulos

1. Um módulo deve ter uma responsabilidade principal.
2. Estado interno deve permanecer dentro do IIFE sempre que possível.
3. Comunicação entre módulos deve ocorrer por `TerraZApp` ou `TerraZCore`.
4. Evitar novas variáveis globais.
5. Não duplicar dados canônicos que pertencem a `data/`.
6. Não adicionar framework apenas para organizar arquivos.
7. APIs públicas devem ser pequenas e explícitas.

## Resultado da Fase 3

O antigo `terra-z.js` concentrava navegação, busca, favoritos, apresentação, fichas, edição, backup, grafo e inicialização.

Após a modularização, ele funciona apenas como núcleo/bootstrap, enquanto cada sistema vive em arquivo próprio.
