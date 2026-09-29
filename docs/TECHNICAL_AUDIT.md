# Auditoria Técnica — Baseline v1.3.2

Data: **29/09/2026**

Esta auditoria registra riscos e dívidas técnicas observadas sem alterar o comportamento do site.

## Prioridade alta

### 1. IDs do editor dependem da ordem do DOM

O editor cria identificadores como `e_0`, `e_1`, `e_2` conforme a ordem dos elementos retornados pelo seletor.

Consequência:

- se um novo parágrafo, título ou card for inserido antes de um elemento existente, os índices podem mudar;
- um backup antigo pode ser aplicado ao elemento errado;
- usuários com edições locais podem perceber conteúdo “deslocado” depois de uma atualização estrutural.

Recomendação:

- migrar gradualmente para IDs estáveis explícitos, como `data-edit-id="cidade.historia.fundacao"`;
- manter compatibilidade/migração para o formato antigo durante uma versão.

### 2. Limpeza do “Exportar HTML” está apontando para a coleção errada

A função `exportHtml()` cria um clone do documento, mas a etapa que tenta remover painéis e modais percorre `cloneEls`, que contém apenas elementos editáveis.

Consequência provável:

- estados temporários do documento podem permanecer no HTML exportado;
- classes de modal/painel aberto podem ser carregadas no arquivo exportado.

Recomendação:

- consultar cada seletor diretamente em `docClone` e remover os elementos/estados desejados;
- criar teste manual específico para exportação.

## Prioridade média

### 3. Conteúdo canônico está misturado à lógica da interface

Fichas completas de personagens e o grafo padrão vivem dentro de `terra-z.js`.

Consequências:

- alterações de lore exigem editar arquivo de lógica;
- aumenta o tamanho do JavaScript;
- dificulta revisar mudanças puramente narrativas;
- eleva o risco de conflito entre alterações de conteúdo e código.

Recomendação:

- mover fichas e dados do grafo para `data/`;
- manter funções de renderização em `js/`.

### 4. JavaScript monolítico

O arquivo possui cerca de 99 KB, 1.474 linhas e aproximadamente 79 funções nomeadas.

Hoje o mesmo arquivo cuida de:

- navegação;
- busca;
- Fandom;
- favoritos;
- apresentação;
- fichas;
- edição;
- backup;
- grafo;
- atalhos;
- inicialização.

Recomendação:

modularizar por responsabilidade, sem framework, em etapas pequenas.

### 5. Importação de backup valida apenas JSON sintático

`importEdits()` verifica se o arquivo pode ser interpretado por `JSON.parse`, mas não valida o formato dos dados.

Consequências:

- backups incompatíveis podem ser aceitos;
- dados inesperados podem gerar comportamento inconsistente;
- conteúdo HTML importado volta para o DOM por `innerHTML`.

Recomendação:

- versionar o schema do backup;
- validar propriedades, tipos e versão antes de gravar;
- sanitizar ou restringir conteúdo importado.

### 6. Sanitização da DC Wiki é parcial

O sistema remove scripts, iframes e atributos de evento, o que é positivo, mas a sanitização é manual e não cobre necessariamente todos os vetores de HTML ativo.

Recomendação:

- limitar protocolos de links para `http:`, `https:` e âncoras internas;
- remover atributos não necessários;
- considerar uma estratégia de allowlist.

### 7. Uso de handlers inline no editor do grafo

O editor do grafo gera `onclick` e `onchange` diretamente no HTML e expõe funções no objeto `window`.

Consequências:

- maior acoplamento global;
- refatoração mais difícil;
- incompatibilidade futura com uma Content Security Policy mais restrita.

Recomendação:

- migrar para delegação de eventos e atributos `data-*`.

## Prioridade baixa / performance

### 8. Imagens pesadas

Existem 9 imagens PNG totalizando aproximadamente **25,4 MB**.

Mesmo com `loading="lazy"` em parte das imagens, esse peso pode afetar:

- primeira visita em rede móvel;
- tempo de download;
- consumo de dados;
- cache.

Recomendação:

- converter fotografias/concept art para WebP ou AVIF;
- manter PNG apenas quando transparência ou fidelidade específica justificar.

### 9. Estrutura toda na raiz

Código e imagens convivem na raiz do repositório.

Recomendação futura:

```text
/
├── index.html
├── css/
├── js/
├── data/
├── images/
└── docs/
```

A reorganização deve ser posterior à estabilização para não misturar movimentação de arquivos com correções funcionais.

## Pontos positivos detectados

- sem IDs HTML duplicados;
- todas as imagens detectadas no HTML possuem atributo `alt`;
- uso consistente de helpers de escape em vários pontos de HTML dinâmico;
- chamadas de inicialização isoladas por `try/catch`, evitando que uma falha interrompa todo o boot;
- preferência de tema persistida;
- uso de `noopener` ao abrir determinados links externos;
- projeto continua sem dependência de framework, o que facilita hospedagem estática.

## Critério para próximas mudanças

Antes de adicionar sistemas grandes, corrigir primeiro:

1. estabilidade dos IDs de edição;
2. exportação HTML;
3. validação de backup;
4. separação dos dados canônicos do JavaScript.

Esses quatro itens reduzem o risco de perda ou mistura de conteúdo conforme o RPG crescer.
