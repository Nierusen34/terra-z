# Terra Z — Enquadramento de Retratos

## Objetivo

O Terra Z usa uma única imagem canônica por personagem, mas permite definir **como essa imagem aparece em cada contexto**.

Isso evita duplicar retratos apenas para corrigir cortes diferentes entre cards, fichas e nós circulares do grafo.

## Contextos

Cada personagem pode ter três ajustes independentes:

- **card** — cards/listagens de personagens;
- **sheet** — retrato principal dentro da ficha;
- **graph** — bolinhas do Grafo 2.0 e painel de Relações.

Os ajustes ficam em `characterMedia[personagem].framing`.

Exemplo:

```js
framing:{
  card:{fit:"cover",x:50,y:24,zoom:1},
  sheet:{fit:"contain",x:50,y:8,zoom:1},
  graph:{fit:"cover",x:50,y:20,zoom:1.15}
}
```

## Modos

### Preencher / recortar — `cover`

A imagem ocupa toda a área disponível mantendo a proporção. Partes das bordas podem ser cortadas.

É o modo indicado para cards e bolinhas do grafo.

### Imagem inteira / sem corte — `contain`

A imagem inteira fica visível mantendo a proporção. Dependendo do formato da arte, podem surgir áreas vazias ao redor.

É útil principalmente para artes de corpo inteiro ou capas verticais.

## Ajustes

- **Ampliação** — 50% a 250%;
- **Posição horizontal** — 0% a 100%;
- **Posição vertical** — 0% a 100%.

A ampliação é aplicada depois do modo cover/contain e usa o ponto X/Y como origem do zoom.

## Editor

Os controles ficam em:

**Personagens → Editar personagem → Enquadramento do retrato**

O editor mostra uma prévia do contexto selecionado antes de salvar.

O botão **Padrão deste contexto** restaura o enquadramento automático sem apagar ou trocar a imagem.

## Padrões quando não há configuração salva

O sistema mantém compatibilidade com personagens antigos:

- card → cover, foco superior moderado;
- ficha local → cover central;
- ficha automática → contain com foco superior;
- grafo → cover com foco superior moderado.

Nenhum personagem existente precisa ser migrado manualmente.

## Fontes de imagem

O enquadramento funciona da mesma forma para:

- imagens locais;
- DC Database / Fandom;
- imagens externas via proxy;
- mídia privada de personagens Mestre.

Trocar a fonte da imagem preserva os ajustes de enquadramento já salvos.

## Privacidade

Personagens públicos/spoiler guardam o enquadramento em `data/character-media.js`.

Personagens Mestre guardam o enquadramento dentro da mídia do perfil no cofre criptografado.

## API

O endpoint existente `/api/media` aceita:

```json
{
  "action":"configure-display",
  "character":"Nome",
  "framing":{
    "card":{"fit":"cover","x":50,"y":24,"zoom":1},
    "sheet":{"fit":"contain","x":50,"y":8,"zoom":1},
    "graph":{"fit":"cover","x":50,"y":24,"zoom":1}
  }
}
```

Nenhuma função serverless adicional foi criada.
