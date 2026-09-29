# Contexto do Projeto — Terra Z

## 1. Objetivo

O Terra Z é o site de referência do RPG JLU. Ele funciona ao mesmo tempo como:

- dossiê de cenário;
- wiki compacta;
- atlas de Vanguard Bay;
- arquivo de personagens e relações;
- ferramenta de consulta durante o RPG;
- apresentação visual do universo.

O site adota uma linguagem editorial de jornais fictícios de Vanguard Bay, alternando identidade visual conforme a seção.

## 2. Estado técnico em 29/09/2026

Versão apresentada no site: **v1.3.2**.

Arquivos centrais:

| Arquivo | Papel | Tamanho aproximado |
|---|---|---:|
| `index.html` | conteúdo, estrutura e componentes estáticos | 53 KB / 764 linhas |
| `terra-z.css` | identidade visual e responsividade | 51 KB / 527 linhas |
| `terra-z.js` | comportamento, dados dinâmicos e persistência | 99 KB / 1.474 linhas |

O repositório também contém **9 imagens PNG**, totalizando aproximadamente **25,4 MB**.

## 3. Estrutura atual do site

Navegação principal:

1. **Capa**
2. **Cidade**
3. **Mapas**
4. **Transporte**
5. **Universo**

Subseções atualmente detectadas:

### Cidade
- Visão Geral
- Distritos
- História
- Cultura
- Eventos

### Mapas
- Mapa Detalhado
- Mapa Criminal
- Mapa de Transporte

### Transporte
- Internas
- Externas
- Sistema

### Universo
- Visão Geral
- Personagens
- Linha do Tempo
- Equipes
- Relações

## 4. Linguagem visual

O CSS mantém quatro identidades editoriais principais:

- **O Farol de Vanguard** — vermelho/vinho e dourado, linguagem de jornal clássico.
- **VBN / Vanguard Broadcasting** — azul, aparência de rede de notícias.
- **O Diário do Cais** — laranja/azul, aparência popular e industrial.
- **A Sentinela Dourada** — magenta/dourado, aparência sensacionalista.

Há suporte a tema claro e escuro por meio de variáveis CSS.

## 5. Princípios que devem ser preservados

1. O site deve continuar utilizável como um arquivo de RPG, e não apenas como vitrine.
2. A identidade visual de “dossiê/jornal” é parte central do projeto.
3. Vanguard Bay deve permanecer o núcleo geográfico da experiência atual.
4. Lore canônico e código de interface devem ser tratados como camadas distintas.
5. A `main` deve permanecer estável e publicável.
6. Refatorações futuras devem ser incrementais, sem uma reescrita total desnecessária.
7. HTML, CSS e JavaScript puro continuam aceitáveis enquanto atenderem bem ao projeto.

## 6. Fonte de verdade

Para desenvolvimento:

- **GitHub / branch `main`** = versão publicada e fonte técnica oficial.
- **`docs/LORE.md` + dados canônicos do projeto** = referência editorial/lore.
- Edições feitas apenas no navegador via `localStorage` não devem ser consideradas canônicas até serem incorporadas ao repositório.

## 7. Estado arquitetural

Hoje há três grandes camadas misturadas:

### Conteúdo
Grande parte do lore está diretamente no `index.html` e parte das fichas de personagens está declarada dentro de `terra-z.js`.

### Interface
Navegação, modais, apresentação, favoritos, sidebar, busca e editor vivem no mesmo arquivo JavaScript.

### Persistência local
Preferências, edições e grafo são gravados no `localStorage`.

Essa estrutura funciona, mas torna mudanças grandes progressivamente mais arriscadas. O roadmap prevê separar essas responsabilidades sem mudar a experiência visual do usuário.
