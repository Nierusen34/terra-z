# Roadmap — Terra Z

Baseline: **v1.3.2 / 29.09.2026**

O objetivo deste roadmap é permitir crescimento sem reescrever o projeto inteiro.

## Fase 0 — Documentação e estabilização

Status: **em andamento nesta branch**

- [x] Documentar estado atual.
- [x] Inventariar funcionalidades.
- [x] Registrar riscos e acoplamentos.
- [x] Definir separação conceitual entre lore e interface.
- [x] Definir fluxo de branches, PRs e versionamento.
- [x] Criar roadmap inicial.
- [ ] Revisar e integrar a documentação à `main`.

## Fase 1 — Correções de estabilidade

Objetivo: reduzir risco antes de expandir conteúdo.

- [ ] Corrigir limpeza do `exportHtml()`.
- [ ] Criar IDs estáveis para elementos editáveis.
- [ ] Planejar migração dos backups de edição existentes.
- [ ] Validar schema dos backups JSON.
- [ ] Restringir/sanitizar melhor HTML vindo da DC Wiki.
- [ ] Substituir handlers inline do editor do grafo por eventos JavaScript.

Versão alvo sugerida: **1.3.3 / 1.3.4**, em patches pequenos.

## Fase 2 — Separar dados do comportamento

Objetivo: retirar lore de dentro do arquivo principal de lógica.

Estrutura alvo inicial:

```text
data/
├── characters.js
├── relations.js
├── locations.js
└── timeline.js
```

Primeiros candidatos:

- fichas de personagens;
- `defaultGraph`;
- timeline;
- distritos e locais.

O site pode continuar usando JavaScript puro.

Versão alvo sugerida: **1.4.0**.

## Fase 3 — Modularizar JavaScript

Estrutura possível:

```text
js/
├── app.js
├── navigation.js
├── search.js
├── fandom.js
├── favorites.js
├── presentation.js
├── editor.js
├── characters.js
└── graph.js
```

Objetivo:

- reduzir acoplamento;
- facilitar testes;
- evitar conflitos;
- permitir alterações isoladas.

## Fase 4 — Organização de assets e performance

- [ ] Criar `images/`.
- [ ] Separar imagens por categoria.
- [ ] Converter imagens grandes para WebP/AVIF quando adequado.
- [ ] Medir peso da página.
- [ ] Revisar carregamento lazy.

Meta inicial: reduzir significativamente os atuais **~25,4 MB** de imagens no repositório principal da página.

## Fase 5 — Evolução editorial

Depois da estabilização técnica:

- [ ] ampliar fichas de personagens;
- [ ] enriquecer Vanguard Bay;
- [ ] estruturar organizações;
- [ ] criar classificação Público / Restrito / Mestre / Rumor;
- [ ] melhorar timeline;
- [ ] evoluir grafo de relações;
- [ ] considerar filtros por personagem, núcleo ou período.

## Fase 6 — Recursos futuros opcionais

Somente se houver necessidade real:

- rotas/URLs internas por seção;
- busca estruturada por dados;
- painel de mestre;
- filtros de spoiler;
- importação/exportação completa do universo;
- mapa verdadeiramente interativo;
- PWA/offline;
- testes automatizados.

## O que não é prioridade agora

- migrar para React/Next/Vue apenas por modernização;
- criar backend sem necessidade concreta;
- reescrever todo o CSS;
- transformar tudo em banco de dados antes de estabilizar o formato;
- reorganizar todos os arquivos e corrigir bugs na mesma PR.

A regra geral é: **estabilizar → separar dados → modularizar → expandir**.
