# Lore Canônico — Terra Z

## Objetivo deste arquivo

Este documento define **como o lore deve ser tratado no projeto**. Ele não substitui ainda todo o conteúdo narrativo existente no site; nesta fase, funciona como índice canônico e regra editorial.

A intenção é impedir que fatos do universo fiquem espalhados entre HTML, JavaScript, conversas antigas e notas externas sem uma hierarquia clara.

## 1. Regra de canon

Um fato é considerado canônico quando estiver em pelo menos uma destas fontes, em ordem de prioridade:

1. documentação de lore aprovada no repositório;
2. dados canônicos em `data/` quando essa pasta for criada;
3. conteúdo publicado na branch `main`;
4. decisões explicitamente aprovadas durante o desenvolvimento e posteriormente registradas no repositório.

Edições mantidas apenas no `localStorage` de um navegador não constituem canon oficial.

## 2. Premissa atual

Terra Z é uma realidade alternativa do multiverso DC.

O site apresenta Vanguard Bay como principal cenário atual da campanha e descreve uma geração mais jovem convivendo com os legados, falhas e ausências dos heróis anteriores.

## 3. Vanguard Bay

Localização atual indicada pelo site: **costa sul da Flórida, EUA**.

População apresentada: aproximadamente **2,06 milhões de habitantes**.

Estrutura geográfica: continente + Ilha Solara.

Distritos atualmente definidos:

- A Muralha
- Coral Gate
- Downtown
- O Dique
- Distrito Solar
- Emaranhado
- A Fenda

O site estabelece que Vanguard Bay não possui atualmente uma equipe heroica fixa, criando um “vácuo heroico”.

## 4. Marco temporal

O presente principal do dossiê está em **janeiro de 2027**.

Eventos históricos e futuros citados pelo site devem sempre indicar claramente se são:

- passado consolidado;
- presente da campanha;
- previsão/prazo futuro;
- rumor;
- segredo de mestre.

## 5. Personagens

As fichas locais atualmente incluem personagens originais e personagens derivados do universo DC.

Os três nomes centrais apresentados pelo site como encontro da nova geração em Vanguard Bay são:

- Tristan Queen
- Riot
- M'ark

O JavaScript também mantém fichas locais para diversos personagens ligados aos núcleos Queen, Wayne, marciano e Lobo.

## 6. Relações

O grafo atual organiza relações nos seguintes tipos técnicos:

- `family` — família;
- `ally` — aliado/vínculo positivo;
- `tension` — tensão/conflito;
- `clone` — origem genética/clonagem.

Esses tipos são categorias de interface. Eles não devem substituir descrições narrativas mais precisas quando o lore exigir nuance.

## 7. Segredos e informação pública

Ao expandir o projeto, cada dado sensível deveria receber uma classificação editorial:

- **Público** — pode aparecer no dossiê geral.
- **Restrito** — conhecido apenas por grupos/personagens específicos.
- **Mestre** — informação fora do alcance dos jogadores.
- **Rumor** — existe no mundo, mas não é confirmado.

Isso permitirá criar no futuro modos de visualização diferentes sem duplicar o lore.

## 8. Separação entre lore e interface

Exemplos de **lore**:

- biografias;
- parentescos;
- datas;
- locais;
- eventos;
- organizações;
- segredos;
- poderes;
- relações;
- cronologia.

Exemplos de **interface**:

- modal;
- card;
- cor;
- busca;
- favoritos;
- modo apresentação;
- sidebar;
- exportação;
- armazenamento local.

Regra: mudar a aparência de uma ficha não deve exigir reescrever o dado canônico; alterar um fato canônico não deve exigir mexer na lógica do modal.

## 9. Próxima evolução deste arquivo

Quando a camada `data/` for criada, este documento deve passar a funcionar como guia editorial enquanto os dados estruturados se tornam a fonte primária para personagens, locais, eventos e relações.
