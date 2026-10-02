# Terra Z — Política Operacional

## Objetivo

O caminho oficial de desenvolvimento e publicação do Terra Z não depende da conexão Vercel do ChatGPT e evita deploys repetitivos durante implementação.

## Branches oficiais

### `main`

- representa o estado integrado do projeto;
- alimenta o GitHub Pages;
- é a origem dos checkpoints de produção para a Vercel;
- também recebe commits de conteúdo gerados pelo próprio editor do Terra Z.

### `dev`

- é o branch oficial para desenvolvimento de código;
- recebe as alterações técnicas feitas durante uma etapa;
- executa **Terra Z quality gate** e **Terra Z dev smoke**;
- não deve publicar GitHub Pages nem acionar a produção Vercel;
- só é integrado ao `main` quando a etapa está validada.

## Fluxo oficial de desenvolvimento

1. Antes de começar uma etapa, consultar o `main`.
2. Sincronizar `dev` com o estado mais recente de `main` quando houver novos commits de conteúdo/checkpoint.
3. Implementar código no `dev`.
4. Fazer quantos commits forem necessários no `dev`; execuções anteriores do Quality Gate/smoke podem ser canceladas automaticamente quando substituídas por commits mais novos.
5. Exigir:
   - **Terra Z quality gate** ✅
   - **Terra Z dev smoke** ✅
6. Integrar `dev` → `main` em um único ciclo de integração.
7. O GitHub Pages é atualizado somente depois da integração no `main`.
8. Confirmar Quality Gate + Pages + smoke do `main`.
9. Quando o usuário aprovar, usar **Administração → Histórico e Produção → Publicar checkpoint**.
10. O checkpoint cria o commit `[vercel-hook]` e o workflow **Vercel production checkpoint** executa Quality Gate → Deploy Hook → smoke test → confirmação exata do SHA em `/api/health`.

## Conteúdo editado pelo site

O editor do Terra Z continua escrevendo conteúdo em `main`, pois `main` é a linha canônica da campanha.

Isso inclui personagens, sessões, relações, Linha do Tempo, mídia, taxonomias e demais conteúdos administráveis.

Se o usuário editar conteúdo enquanto houver desenvolvimento aberto em `dev`, o `dev` deve ser sincronizado novamente com `main` antes da integração final.

## Serverless

A arquitetura otimizada usa **8 funções serverless de nível superior**.

Rotas antigas removidas como funções continuam compatíveis via `vercel.json`:

- `/api/master-template` → `/api/master?action=template`
- `/api/master-finalize` → `/api/master?action=finalize`
- `/api/private-sessions` → `/api/session?action=private`
- `/api/status` → `/api/health?mode=status`

Meta operacional: manter **até 9 funções** sempre que possível e nunca ultrapassar o limite de 12.

## Carregamento do frontend

A camada pública carrega apenas o necessário para consulta.

Ferramentas administrativas são carregadas sob demanda por `js/admin-loader.js` quando o usuário abre **⚙️ Administração**.

A infraestrutura compartilhada de futuras ferramentas administrativas fica em `js/admin-foundation.js`.

## Imagens

Imagens grandes de cidade/distritos usam WebP otimizado quando a conversão oferece redução segura.

O workflow **Optimize heavy images** pode ser executado manualmente quando novas imagens pesadas forem adicionadas.

## Relação com ChatGPT

- GitHub é a integração principal para desenvolvimento.
- O conector Vercel do ChatGPT é **opcional** e serve apenas para diagnóstico avançado.
- Uma conversa nova não deve solicitar reconexão da Vercel preventivamente.
- Se o conector Vercel retornar 401/403, continuar pelo GitHub e pelo fluxo de checkpoint.
- Não desenvolver diretamente no `main` salvo correção emergencial explicitamente justificada.

## Produção

- URL principal: `https://terra-z.vercel.app`
- GitHub Pages funciona como preview integrado do `main`.
- `/api/health` informa SHA e capacidades da produção.
- O painel **Histórico e Produção** compara `main` com o SHA de produção.
- O próprio site publica checkpoints; não é necessário abrir a Vercel manualmente.

## Segurança

- Conteúdo Mestre continua protegido por AES-256-GCM.
- Checkpoints e restaurações preservam o histórico Git.
- Restauração de conteúdo não reverte código.
- Checkpoints anteriores à migração de Privacidade Real são bloqueados.
- O Deploy Hook permanece somente nos secrets do GitHub Actions.

## Regra para novas conversas

Ao continuar o projeto:

1. consultar `main` e `dev`;
2. verificar se `dev` precisa ser sincronizado com `main`;
3. verificar os workflows recentes;
4. desenvolver no `dev`;
5. validar Quality Gate + dev smoke;
6. integrar no `main` somente quando a etapa estiver pronta;
7. usar o checkpoint do site para produção.

Não pedir ao usuário para desconectar/reconectar Vercel sem um erro real que exija especificamente o conector Vercel.
