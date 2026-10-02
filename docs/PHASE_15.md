# Etapa 15 — Modo Mesa · Terra Z v1.4.0

## Objetivo

Criar uma interface operacional para uso ao vivo durante as sessões, especialmente quando o Terra Z estiver instalado como PWA em celular ou tablet.

O **Modo Mesa** não substitui o **Modo Sessão**. O Modo Sessão continua sendo o rascunho estruturado e o fluxo de encerramento; o Modo Mesa é a camada rápida usada durante a partida.

## Princípios

- poucos toques;
- tipografia maior e contraste alto;
- navegação fixa por abas;
- nenhum salvamento automático no cânone;
- compartilhamento do mesmo rascunho temporário do Modo Sessão;
- dados temporários somente em `sessionStorage`;
- conteúdo Mestre continua dependendo de autenticação;
- nenhuma API privada entra no cache do PWA.

## Áreas

### Sessão

Mostra duração, local atual, participantes selecionados, contadores e registro rápido de acontecimentos.

### NPCs

Lista NPCs Mestre em jogo, estado, intenção, localização e relações privadas disponíveis. Permite marcar quem está em cena.

### Pistas

Permite classificar localmente cada pista como **Oculta**, **Revelada** ou **Resolvida**. Essa classificação é da mesa atual e não altera o conteúdo canônico automaticamente.

### Objetivos

Permite marcar objetivos como **Pendente**, **Trabalhado** ou **Concluído** durante a mesa. O estado canônico permanece intacto até edição explícita.

### Personagens

Mostra personagens disponíveis, metadados úteis e segredos Mestre carregados. Permite marcar presença em cena.

### Mapas

Exibe rapidamente os mapas de Vanguard Bay, transporte, mapa nacional e criminalidade sem sair do painel.

## Encerramento

**Encerrar Mesa** entrega o mesmo rascunho ao fluxo do Modo Sessão e prepara o formulário normal do Diário. A publicação continua exigindo revisão e ação explícita do Mestre.

## PWA e offline

O Modo Mesa pode continuar operando com o rascunho e os dados que já estiverem em memória quando a conexão cair. Em uma abertura fria totalmente offline, conteúdo Mestre não é restaurado de Cache Storage por decisão de segurança.

## Versão

A Etapa 15 marca a atualização do Terra Z para **v1.4.0**.
