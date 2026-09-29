# Imagens — Terra Z

A Fase 4 organiza os assets visuais por função e reduz o custo de carregamento inicial.

## Estrutura

```text
images/
├── city/
│   ├── vista-aerea-dia.png
│   └── vista-aerea-noite.png
└── districts/
    ├── a-fenda.png
    ├── a-muralha.png
    ├── bar-urso-polar.png
    ├── distrito-solar.png
    ├── downtown.png
    ├── emaranhado.png
    └── la-ventanita.png
```

## Peso atual

As 9 imagens PNG somam aproximadamente **25,39 MB**.

Elas são concept arts e imagens de ambientação; por isso o projeto preserva os PNGs atuais como fonte visual nesta etapa.

## Estratégia de carregamento

Imagens pesadas utilizam `data-src` e só recebem `src` quando a aba/subseção correspondente fica ativa.

Isso evita baixar os 25,39 MB de imagens durante a abertura inicial da capa do dossiê.

Também são usados:

- `loading="lazy"`;
- `decoding="async"`;
- `fetchpriority="low"` para as imagens de conteúdo.

## Próxima otimização binária

As imagens continuam candidatas a conversão para WebP/AVIF após comparação visual.

Critérios:

1. preservar detalhes de concept art;
2. evitar banding em névoa, céu e gradientes;
3. manter PNG apenas quando houver motivo de fidelidade/transparência;
4. atualizar os caminhos em `data/locations.js` e `index.html` somente depois da validação visual.

A conversão deve ser feita em uma PR própria para permitir comparação e reversão simples.
