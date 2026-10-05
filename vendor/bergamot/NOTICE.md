# Bergamot Translator no Terra Z

O fallback de tradução local do Terra Z usa código do projeto **browsermt/bergamot-translator**, licenciado sob MPL-2.0.

- Projeto: https://github.com/browsermt/bergamot-translator
- Pacote WASM fixado: @browsermt/bergamot-translator 0.4.9
- Modelos: Bergamot / Mozilla, baixados sob demanda pelo navegador
- Uso no Terra Z: tradução local inglês → português em navegadores sem a API nativa Translator

Os artefatos WASM pesados não fazem parte do carregamento inicial do site. Eles são buscados apenas quando a tradução local é necessária.
