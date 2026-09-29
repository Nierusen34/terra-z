# Retratos de personagens

Esta pasta é a fonte principal recomendada para imagens de personagens do Terra Z.

## Convenção

Use nomes estáveis e simples:

```text
images/characters/
├── tristan-queen.png
├── riot.png
├── mark.png
├── oliver-queen.png
└── ...
```

Depois de adicionar o arquivo, atualize `data/character-media.js`:

```js
"Tristan Queen": {
  src: "images/characters/tristan-queen.png",
  alt: "Tristan Queen",
  source: "local",
  credit: ""
}
```

## Prioridade de fonte

1. imagem local aprovada;
2. imagem externa escolhida explicitamente;
3. placeholder com iniciais.

A DC Wiki/Fandom deve funcionar como referência ou fallback escolhido conscientemente, não como fonte automática da primeira imagem encontrada.

## Futuro upload pelo site

Quando o backend seguro da Fase 5 estiver conectado, o gerenciador de mídia poderá enviar o arquivo ao backend e publicar, no mesmo commit:

- o novo asset em `images/characters/`;
- a atualização correspondente em `data/character-media.js`.
