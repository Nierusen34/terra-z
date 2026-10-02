# Terra Z — Testes de Navegador com Playwright

## Objetivo

O Terra Z possui uma camada leve de testes reais em Chromium para detectar regressões que o Quality Gate estrutural não enxerga sozinho.

O navegador é executado dentro do GitHub Actions. Nenhum screenshot de sucesso é salvo no repositório.

## Quando roda

O workflow **Terra Z browser visual check** roda:

- em pull requests direcionados ao `main`;
- manualmente por `workflow_dispatch`.

Ele não roda a cada commit do `dev`, para não reduzir a velocidade normal de desenvolvimento.

O ciclo recomendado permanece:

`dev → Quality Gate + dev smoke → PR → browser visual check → merge → Pages`

## O que é verificado

Em desktop e mobile:

- boot público;
- presença do roteador e do lazy loader;
- ausência dos módulos administrativos no carregamento inicial;
- Relações/Grafo 2.0;
- nó do Armek com mídia independente carregada;
- painel lateral do Armek;
- controles de zoom do grafo;
- abertura de uma ficha pública;
- lazy loading real da Administração;
- ausência de erros JavaScript não tratados.

No projeto mobile também é verificado overflow horizontal da página-base.

## Screenshots

Configuração do Playwright:

`screenshot: "only-on-failure"`

Portanto:

- teste passou → nenhum screenshot é criado;
- teste falhou → o Playwright gera screenshot apenas da falha.

## Retenção

Em caso de falha, `test-results/browser/` é enviado como artifact do GitHub Actions com:

`retention-days: 1`

Depois desse prazo o próprio GitHub remove o artifact.

O artifact não é commitado e não aumenta o tamanho do repositório.

## Vídeo e trace

Ambos permanecem desativados:

- `video: "off"`
- `trace: "off"`

Isso mantém o artifact mínimo. Eles só devem ser ativados temporariamente se uma falha específica exigir diagnóstico mais profundo.

## Acesso pelo ChatGPT

Quando o workflow falhar, o artifact pode ser consultado pela integração GitHub. Assim, a inspeção visual pode ser feita a partir do screenshot temporário da falha sem depender de acesso direto ao domínio público.

## Ambiente

O workflow usa a imagem oficial:

`mcr.microsoft.com/playwright:v1.55.0-noble`

e instala somente o test runner correspondente.

O site é servido localmente dentro do job em:

`http://127.0.0.1:4173/`

Isso evita depender de GitHub Pages ou Vercel para validar uma alteração antes do merge.

## Arquivos

- `playwright.config.mjs`
- `tests/browser/visual-smoke.spec.mjs`
- `.github/workflows/browser-visual.yml`

## Política

Não adicionar diretórios de screenshots ao Git.

Não implementar snapshots pixel-a-pixel permanentes sem necessidade concreta.

A finalidade desta camada é detectar quebra visual/funcional e gerar evidência temporária apenas quando houver falha.
