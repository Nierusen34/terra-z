# Editor de Organizações

O Terra Z mantém organizações, facções, empresas, instituições acadêmicas, veículos de mídia e agências em `data/organizations.js`.

## Acesso

O editor é carregado somente após autenticação administrativa.

Há dois pontos de entrada:

- **Administração → Organizações**
- botão **✏️ Editar** em cada card de organização autenticado

## Campos

O editor administra:

- nome, ícone e ID permanente;
- categoria e rótulo da categoria;
- base/sede e liderança;
- descrição;
- atividades;
- aliases;
- rivais;
- estruturas relacionadas;
- personagens relacionados;
- locais relacionados;
- informação restrita/spoiler;
- visibilidade Pública ou Spoiler.

O ID é gerado na criação e permanece estável em edições posteriores para preservar links e referências do grafo.

## Privacidade

O arquivo `data/organizations.js` é público. Por isso o editor não permite organizações totalmente Mestre. Conteúdo sensível de uma organização pública pode ser colocado no campo de spoiler e respeitará o Modo Jogador.

## Exclusão segura

Uma organização não pode ser excluída enquanto:

- existir um nó do grafo referenciando seu ID; ou
- outra organização ainda a citar como rival ou estrutura relacionada.

Isso evita referências quebradas.

## Persistência

As alterações são publicadas por `/api/organization` e entram no histórico/restauração de conteúdo do Terra Z. O runtime de `/api/health?runtime=1` também inclui `organizations`, permitindo atualização sem depender apenas do arquivo carregado no primeiro boot.
