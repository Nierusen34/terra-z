# Terra Z — Política Operacional

## Objetivo

O caminho oficial de desenvolvimento e publicação do Terra Z não depende da conexão Vercel do ChatGPT.

## Fluxo oficial

1. Todo desenvolvimento é feito no repositório `Nierusen34/terra-z`, branch `main`.
2. Commits normais atualizam GitHub/GitHub Pages e executam o Quality Gate.
3. A produção Vercel permanece com deploy automático de Git desabilitado em `vercel.json`.
4. Quando houver alterações prontas, o editor abre **Administração → Histórico e Produção** no próprio Terra Z e usa **Publicar checkpoint**.
5. O backend cria um commit com `[vercel-hook]`.
6. O GitHub Actions executa o workflow **Vercel production checkpoint**:
   - roda o Quality Gate;
   - aciona `VERCEL_DEPLOY_HOOK_URL`;
   - aguarda a Vercel;
   - executa o smoke test;
   - confirma que `/api/health` está no SHA exato do checkpoint.
7. Só depois disso o painel considera a produção atualizada.

## Relação com ChatGPT

- GitHub é a integração principal para desenvolvimento.
- O conector Vercel do ChatGPT é **opcional** e deve ser usado apenas para diagnóstico avançado, como consultar deployments/logs quando estiver disponível.
- Uma conversa nova **não deve solicitar reconexão da Vercel preventivamente**.
- Se o conector Vercel retornar 401/403, continuar trabalhando normalmente pelo GitHub e pelo fluxo de checkpoint do site.
- Reconectar Vercel só é necessário se o usuário quiser especificamente recursos de diagnóstico do conector que não possam ser obtidos pelo fluxo oficial.

## Produção

- URL principal: `https://terra-z.vercel.app`
- O endpoint `/api/health` informa o SHA e as capacidades da produção.
- O painel **Histórico e Produção** compara `main` com o SHA de produção.
- O próprio painel pode publicar a produção; não é necessário abrir Vercel manualmente.

## Segurança

- Conteúdo Mestre continua protegido por AES-256-GCM.
- Checkpoints e restaurações preservam o histórico Git.
- Restauração de conteúdo não reverte código.
- Checkpoints anteriores à migração de Privacidade Real são bloqueados para restauração.
- O Deploy Hook é armazenado como secret do GitHub Actions e nunca deve ser exposto em arquivos públicos.

## Regra para novas conversas

Ao continuar o projeto em uma nova conversa:

1. consultar `main` no GitHub;
2. verificar os workflows recentes;
3. consultar `/api/health` quando necessário;
4. continuar o desenvolvimento;
5. usar o painel/site ou o workflow GitHub para produção.

Não pedir ao usuário para desconectar/reconectar Vercel sem um erro de autorização real em uma operação que exija especificamente o conector Vercel.
