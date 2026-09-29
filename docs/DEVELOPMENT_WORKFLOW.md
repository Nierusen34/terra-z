# Fluxo de Desenvolvimento e Versionamento

## 1. Branches

### `main`
Representa a versão estável e publicada pelo GitHub Pages.

Não usar `main` como área de experimentação.

### Branches de trabalho

Padrões sugeridos:

- `feature/nome-da-funcionalidade`
- `fix/nome-do-problema`
- `refactor/nome-da-area`
- `docs/nome-da-documentacao`
- `content/nome-do-conteudo`

Exemplos:

- `feature/mapa-interativo`
- `fix/export-html`
- `content/ficha-tristan`
- `refactor/personagens-data`

## 2. Pull Requests

Mudanças relevantes devem chegar à `main` por Pull Request.

Cada PR deve responder:

1. O que mudou?
2. Por que mudou?
3. O visual mudou?
4. O lore mudou?
5. O formato de dados mudou?
6. Há impacto em `localStorage` ou backups?
7. Como testar?

## 3. Versionamento

Usar uma versão simplificada baseada em **MAJOR.MINOR.PATCH**.

### PATCH — ex.: 1.3.2 → 1.3.3

Para:

- correção de bug;
- ajuste visual pequeno;
- correção de texto sem mudança de canon relevante;
- melhoria de acessibilidade;
- otimização sem mudança funcional.

### MINOR — ex.: 1.3.2 → 1.4.0

Para:

- nova seção;
- novo sistema;
- nova categoria de dados;
- expansão significativa de personagens/mapas;
- mudança funcional compatível com o formato existente.

### MAJOR — ex.: 1.x → 2.0.0

Para:

- reestruturação incompatível de dados;
- mudança de arquitetura que invalide backups;
- substituição importante da experiência principal;
- migração que exija conversão de armazenamento.

## 4. Commits

Usar mensagens que expliquem a alteração, evitando mensagens genéricas como “Update file”.

Formato recomendado:

```text
tipo: descrição curta
```

Exemplos:

- `fix: corrigir limpeza do HTML exportado`
- `docs: registrar baseline da v1.3.2`
- `content: adicionar ficha de personagem`
- `refactor: extrair fichas para módulo de dados`
- `perf: converter imagens de distritos para webp`

## 5. Compatibilidade de dados

Sempre que uma alteração tocar em:

- `terraZ_v1_edits`;
- `terraZ_favorites`;
- `terraZ_graph_v2`;
- backups exportados;

a PR deve declarar explicitamente se os dados antigos continuam válidos.

## 6. Processo recomendado

```text
pedido
  ↓
ler estado atual da main
  ↓
criar branch
  ↓
implementar mudança pequena e isolada
  ↓
testar
  ↓
abrir PR
  ↓
revisar
  ↓
merge em main
  ↓
validar GitHub Pages
```

## 7. Regra de refatoração

Não misturar, sempre que possível:

- reorganização de arquivos;
- mudança de layout;
- mudança de lore;
- correção de bug;

na mesma PR.

PRs menores facilitam entender o histórico e reverter uma decisão sem perder outras.
