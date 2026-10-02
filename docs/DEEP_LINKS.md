# Terra Z — Links Profundos e Navegação Persistente

## Objetivo

A Etapa 7 transforma a navegação interna do Terra Z em endereços permanentes sem converter o projeto em múltiplas páginas HTML.

O roteamento usa **hash routes** para funcionar da mesma forma no GitHub Pages e na Vercel, sem rewrites de servidor.

## Rotas canônicas

### Seções

- `#/capa`
- `#/cidade/visao-geral`
- `#/cidade/distritos`
- `#/cidade/historia`
- `#/cidade/cultura`
- `#/cidade/eventos`
- `#/mapas/visao-geral`
- `#/mapas/transporte`
- `#/mapas/nacional`
- `#/mapas/criminalidade`
- `#/transporte/internas`
- `#/transporte/cidades`
- `#/transporte/sistema`
- `#/universo/visao-geral`
- `#/universo/personagens`
- `#/universo/linha-do-tempo`
- `#/universo/equipes`
- `#/universo/relacoes`
- `#/universo/sessoes`

### Entidades

- Personagem: `#/personagens/<slug>`
- Sessão: `#/sessoes/<id-estavel>`
- Equipe: `#/equipes/<slug>`
- Cidade externa: `#/cidades/<slug>`
- Distrito de Vanguard Bay: `#/distritos/<slug>`

## Comportamento

- Cliques em abas e subseções atualizam o histórico do navegador.
- Voltar/Avançar reaplica a navegação correspondente.
- A última rota válida é armazenada localmente e restaurada quando o Terra Z é aberto sem hash.
- Links antigos no formato `#secao=...&sub=...&personagem=...` são aceitos e convertidos para a rota canônica.
- Personagens respeitam Público / Spoiler / Mestre. Um link não contorna as regras de visibilidade.
- Sessões Mestre continuam dependendo de autenticação e do carregamento do armazenamento privado.
- Cidades, equipes, distritos e sessões podem ser focados diretamente e recebem destaque temporário.
- O botão **Link atual** copia a URL correspondente ao estado de navegação atual.

## Integração com conteúdo

Links de personagem já existentes passam a atualizar a rota automaticamente.
Locais de sessões que correspondem a um distrito ou cidade conhecida tornam-se navegáveis.

## Regra arquitetural

Nunca criar uma segunda fonte de verdade para os dados apenas para suportar URLs. O roteador deve resolver as rotas contra os dados já carregados em `window.TerraZData` e os gerenciadores existentes em `window.TerraZApp`.
