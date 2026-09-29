# Inventário Funcional — Terra Z v1.3.2

Esta lista descreve o comportamento atualmente identificado em `terra-z.js`.

## 1. Identidade editorial

- alternância automática de identidade de jornal por seção;
- alteração de masthead, subtítulo, seção e rodapé;
- suporte a quatro temas editoriais.

Função central: `applyPaper()`.

## 2. Feedback e diálogos

- toasts de sucesso, erro, informação e aviso;
- modal de confirmação reutilizável;
- helpers de escape de HTML, atributo e regex.

Funções principais:
`showToast()`, `showConfirm()`, `escapeHtml()`, `escapeAttr()`, `escapeRegex()`.

## 3. Leitura e navegação

- modo leitura;
- changelog;
- índice global lateral em desktop;
- drawer de navegação;
- botão voltar ao topo;
- sincronização entre abas e subseções;
- lightbox para imagens.

## 4. Tema

- tema claro/escuro;
- persistência da preferência em `localStorage`.

Chave atual: `terraZ_theme`.

## 5. Busca local

- busca no conteúdo do documento;
- destaque visual dos resultados;
- remoção dos destaques;
- painel de resultados.

## 6. Integração com DC Wiki

- pesquisa via API do Fandom;
- cache em memória durante a sessão;
- leitura de artigos em modal;
- histórico de navegação no modal;
- processamento de links e imagens;
- sanitização parcial do HTML retornado;
- abertura externa de links quando necessário.

Dependência externa:
`dc.fandom.com`.

## 7. Favoritos

- inclusão e remoção de cards;
- painel de favoritos;
- tentativa de localizar o card correspondente;
- destaque visual do card favorito.

Persistência:
`terraZ_favorites`.

## 8. Modo apresentação

- coleta dos cards da seção ativa;
- navegação anterior/próximo;
- suporte às setas do teclado;
- contador de slides;
- saída por ESC.

## 9. Timeline interativa

- timelines recebem comportamento expansível/retrátil por clique.

## 10. Fichas de personagens

O JavaScript contém um objeto de fichas canônicas/dinâmicas para personagens.

Foram identificadas definições para:

- Tristan Queen
- Riot
- M'ark
- Kendra Saunders
- Lobo
- M'gann M'orzz
- J'onn J'onzz
- Oliver Queen
- Dinah Lance
- Connor Hawke
- Jason Todd
- Conner Kent
- Bruce Wayne
- Dick Grayson
- Barbara Gordon
- Damian Wayne
- Tim Drake
- Verity Pennyworth
- Lian Harper
- Camila Vargas
- Roy Harper

O sistema abre essas informações em um modal próprio e, quando uma ficha local não é encontrada, pode recorrer à busca no Fandom.

## 11. Editor no navegador

- transforma blocos do site em `contentEditable`;
- atribui IDs temporários a elementos editáveis;
- salva HTML editado em `localStorage`;
- recarrega edições na inicialização;
- salva automaticamente ao finalizar o modo edição.

Chave principal:
`terraZ_v1_edits`.

## 12. Exportação e backup

- exportação de um `index.html` com o conteúdo editado;
- exportação de backup JSON;
- importação de backup JSON;
- reset das edições;
- backup automático enquanto o modo edição está ativo.

Chave de backup:
`terraZ_v1_backups`.

O backup automático mantém até cinco registros.

## 13. Grafo de relações

- estrutura padrão com quadrantes, nós e arestas;
- tipos de relação: `family`, `ally`, `tension`, `clone`;
- edição de nós e relações;
- criação e remoção;
- persistência;
- restauração de versão padrão;
- recuperação do backup anterior.

Chaves:
- `terraZ_graph_v2`
- `terraZ_graph_backup_v2`

## 14. Atalhos de teclado

- `Ctrl/Cmd + S`: salvar quando o modo edição está ativo;
- `Alt + ←`: voltar no histórico da DC Wiki;
- `← / →`: navegar no modo apresentação;
- `Esc`: fechar modais/painéis ou sair do modo leitura.

## 15. Inicialização

No `DOMContentLoaded`, o sistema:

1. constrói o índice global;
2. prepara os elementos editáveis;
3. carrega edições salvas;
4. conecta fichas de personagens;
5. adiciona favoritos;
6. inicializa o painel de favoritos;
7. prepara navegação interna do modal Fandom;
8. inicializa timelines;
9. carrega e renderiza o grafo;
10. sincroniza a sidebar;
11. restaura o modo leitura;
12. exibe o toast da versão.

## 16. Complexidade atual

Foram identificadas aproximadamente **79 funções nomeadas** dentro de um único arquivo JavaScript.

Isso não representa um defeito por si só, mas já justifica modularização gradual para reduzir o custo de manutenção.
