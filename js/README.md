# Módulos JavaScript — Terra Z

O Terra Z usa JavaScript puro dividido em dois níveis de carregamento: **runtime público** e **ferramentas administrativas sob demanda**.

## Runtime público

Carregado diretamente por `index.html`:

1. `terra-z.js` — núcleo compartilhado (`TerraZCore` / `TerraZApp`);
2. `js/backend-client.js` — cliente do backend;
3. `js/admin-loader.js` — lazy loader administrativo;
4. `js/runtime-data.js` — atualização dos dados públicos em runtime;
5. `js/data-renderer.js` — renderização de dados canônicos;
6. `js/visibility.js` — Público / Spoiler / Mestre;
7. `js/media.js` e `js/character-media.js` — imagens e enquadramento;
8. `js/navigation.js` e `js/mobile-polish.js` — navegação e mobile;
9. `js/search.js` — busca Local/DC Wiki;
10. `js/command-palette.js` — Busca Global 2.0 / Central de Comandos;
11. `js/characters.js`, `js/home-protagonists.js`, `js/favorites.js` — personagens;
12. `js/presentation.js` — apresentação;
13. `js/graph.js` — Relações 2.0;
14. `js/character-filters.js` — filtros/taxonomias na página;
15. `js/router.js` e `js/world-links.js` — deep links e links entre entidades;
16. `js/sessions.js` — Diário;
17. `js/timeline-manager.js` — Timeline 2.0.

O objetivo é manter o boot público leve. Ferramentas de escrita não devem ser carregadas antes de o usuário abrir Administração.

## Administração sob demanda

`js/admin-loader.js` registra e carrega:

- `js/admin-foundation.js`;
- `js/editor.js`;
- `js/private-content.js`;
- `js/publishing.js`;
- `js/master-migration.js`;
- `js/media-manager.js`;
- `js/media-library.js`;
- `js/portrait-browser.js`;
- `js/master-workspace.js`;
- `js/character-editor.js`;
- `js/taxonomy-manager.js`;
- `js/bulk-editor.js`;
- `js/master-quick.js`;
- `js/session-mode.js`;
- `js/backup-export.js`;
- `js/session-editor.js`;
- `js/timeline-editor.js`;
- `js/integrity-checker.js`;
- `js/history-manager.js`;
- `js/visibility-manager.js`;
- `js/admin-panel.js`.

## Namespace

`terra-z.js` expõe:

```js
window.TerraZCore
window.TerraZApp
```

### TerraZCore

Helpers compartilhados de UI e segurança, como:

- `showToast`;
- `showConfirm`;
- `escapeHtml`;
- `escapeAttr`;
- `escapeRegex`.

### TerraZApp

Cada módulo publica somente a pequena API necessária para comunicação entre sistemas.

Novos módulos devem preferir:

```js
window.TerraZApp.nomeDoModulo
```

Algumas funções continuam em `window` exclusivamente por compatibilidade com listeners/HTML antigos que ainda as chamam.

## Regras

1. Um módulo deve ter responsabilidade principal clara.
2. Estado interno permanece dentro do IIFE quando possível.
3. Comunicação entre módulos ocorre por `TerraZApp`, `TerraZCore` ou eventos `terra-z:*`.
4. Evitar novas variáveis globais.
5. Dados canônicos pertencem a `data/`, não aos módulos de UI.
6. Ferramentas administrativas novas entram no lazy loader, não no boot público.
7. Todo arquivo `js/*.js` deve ter um caminho explícito de carregamento. O Quality Gate reprova módulos órfãos ou registrados duas vezes.
8. Código temporário ou helper sem consumidor deve ser removido antes de integrar ao `main`.


## Fase 14

A camada final antes do PWA inclui:

- **Busca Global 2.0** no runtime público, acionada por `Ctrl+K`;
- **Modo Sessão** no lazy loader administrativo, com estado temporário em `sessionStorage`;
- **Backup e Exportação** no lazy loader, reutilizando `/api/publish`.

A Fase 14 não aumenta a contagem serverless.
