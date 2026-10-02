# UX Polish — revisão de usabilidade

## Objetivo

Esta revisão melhora a descoberta e a velocidade de uso sem alterar a arquitetura, o modelo de dados, o esquema de privacidade ou o fluxo de publicação do Terra Z.

A regra desta etapa é: **manter as ferramentas avançadas existentes, mas tornar as ações comuns mais diretas**.

## Melhorias aplicadas

### Grafo

O fluxo principal de criação de vínculos deixa de depender do editor avançado.

Novo fluxo:

1. selecionar uma entidade;
2. clicar em **Conectar**;
3. clicar/tocar na entidade de destino;
4. escolher tipo, intensidade, direção e visibilidade;
5. criar a conexão.

Também é possível escolher o destino por lista.

Durante a seleção visual, o grafo mostra uma linha temporária partindo da entidade de origem. No editor de Layout visual, a entidade selecionada também oferece **Conectar**, permitindo criar vínculos sem sair da organização espacial.

O editor avançado de Entidades/Relações continua disponível para manutenção detalhada.

### Personagens

O editor de personagem ganhou navegação interna:

- Básico;
- Retrato;
- Organização;
- Ficha;
- Mestre.

Nada foi ocultado ou removido. Os atalhos apenas percorrem o mesmo formulário longo.

O botão antigo **Relações / Grafo** passa a abrir o grafo no contexto do personagem. Se a bolinha já existir, ela é selecionada. Se ainda não existir, o Terra Z prepara uma nova entidade para posicionamento e revisão.

A ficha pública também oferece um atalho visual para localizar o personagem no grafo quando houver entidade correspondente.

### Administração

A Administração mantém todas as seções atuais, mas adiciona uma faixa **Uso frequente** com acesso direto a:

- Modo Mesa;
- novo personagem;
- nova sessão;
- grafo;
- publicação.

As ferramentas completas continuam nas seções originais.

### Grafo expansível

A revisão foi estendida para preparar o crescimento próximo do mapa de relações.

Foram adicionados:

- modo tela cheia;
- inspector retrátil;
- foco automático da entidade selecionada e suas conexões diretas;
- rótulos menos agressivos para vínculos entre núcleos;
- roteamento periférico de relações inter-núcleo;
- pan/zoom por viewport;
- roda do mouse e pinça touch;
- enquadramento de toda a rede;
- canvas calculado dinamicamente para futuros núcleos.

A mudança atua na visualização. Schema, relações, coordenadas publicadas e permissões continuam compatíveis com o Grafo 2.0.

## Áreas revisadas sem mudança estrutural

### Busca e Central de Comandos

As duas ferramentas cumprem papéis diferentes:

- a busca superior trabalha com conteúdo da página e DC Wiki;
- a Central de Comandos navega pelo universo e por ações administrativas.

A separação atual foi preservada para não juntar fluxos com objetivos diferentes.

### Sala do Mestre, Modo Sessão e Modo Mesa

Esses módulos já possuem navegação orientada à tarefa e ações explícitas. Não foram reorganizados para evitar regressões durante partidas.

### Linha do Tempo e Diário

Os fluxos atuais de busca, filtros, expansão e registro de sessão já apresentam ações primárias claras. Foram mantidos.

### PWA / mobile

A revisão preserva:

- funcionamento offline público;
- isolamento de conteúdo Mestre;
- atualização explícita da PWA;
- arraste touch do grafo;
- layout responsivo.

## Itens observados para uma revisão futura

Estes pontos podem ser avaliados depois, mas não justificam mudança nesta etapa:

- reduzir a quantidade de botões da barra superior no celular por meio de um menu “Mais”;
- oferecer edição rápida de uma relação existente diretamente no painel lateral;
- permitir atalhos contextuais semelhantes entre Linha do Tempo, Sessões e personagens.

Eles foram adiados porque alteram descoberta/navegação global e merecem testes próprios.

## Compatibilidade

Esta etapa não muda:

- schema do Grafo 2.0;
- formato de personagens;
- dados privados;
- backup;
- endpoints existentes;
- fluxo main/dev/checkpoint;
- versão pública do projeto.
