# Terra Z — Fase 14A, 14B e 14C

## Visão geral

Esta fase fecha o núcleo funcional antes do PWA.

- **14A — Busca Global 2.0 / Central de Comandos**
- **14B — Modo Sessão**
- **14C — Backup e Exportação**

Nenhuma nova função serverless foi criada. A arquitetura permanece em 8 funções.

---

## 14A — Busca Global 2.0

Atalho:

`Ctrl+K` ou `⌘K`.

A Central de Comandos pesquisa em:

- personagens;
- cidades;
- distritos e locais;
- equipes;
- sessões;
- Linha do Tempo;
- entidades do Grafo 2.0.

Quando o editor está autenticado, a busca também inclui:

- notas Mestre;
- objetivos;
- pistas;
- revelações;
- NPCs;
- sessões/eventos Mestre;
- comandos administrativos.

Resultados privados são marcados como **MESTRE** e só entram no índice depois que o cofre privado foi carregado.

Comandos disponíveis incluem:

- Administração;
- Sala do Mestre;
- Modo Sessão;
- Registrar sessão;
- Backup e Exportação.

A busca antiga Local/DC Wiki continua existindo. A Central de Comandos é complementar e voltada a navegação rápida por entidades e ações.

---

## 14B — Modo Sessão

Acesso:

**Administração → Modo Sessão**

ou:

**Sala do Mestre → Modo Sessão**

O objetivo é apoiar a condução da mesa sem transformar cada clique em uma alteração canônica.

O rascunho contém:

- título/capítulo;
- data no universo;
- local atual;
- visibilidade desejada para o registro final;
- personagens em cena;
- NPCs em cena;
- objetivos trabalhados;
- pistas usadas;
- registro rápido cronológico.

Tipos de registro rápido:

- Narrativa;
- Decisão;
- Consequência;
- Pista;
- Combate;
- NPC;
- Nota.

### Persistência temporária

O estado usa:

`sessionStorage["terraZ_session_mode_v1"]`

Isso significa:

- sobrevive a reloads na mesma sessão/aba;
- não é dado canônico;
- não cria commits;
- não é publicado automaticamente;
- é eliminado quando a sessão do navegador termina.

Conteúdo Mestre não é gravado em `localStorage`.

### Finalização

**Concluir e preparar registro** transforma o rascunho em um draft do editor normal de sessão.

Nada é publicado automaticamente.

O Mestre ainda revisa:

- título;
- datas;
- resumo;
- personagens;
- locais;
- consequências;
- Público / Spoiler / Mestre.

Somente depois de clicar em **Registrar sessão** a API normal é usada.

---

## 14C — Backup e Exportação

Acesso:

**Administração → Backup e Exportação**

### Backup completo criptografado

Usa:

`POST /api/publish`

com:

`action: "export-backup"`

Formato:

`terra-z-backup-v2`

Inclui:

- arquivos canônicos de dados;
- conteúdo editável;
- metadados;
- Biblioteca de Mídia;
- Grafo 2.0;
- sessões;
- Timeline;
- cofres privados criptografados;
- SHA do `main`;
- manifesto dos caminhos de mídia.

Os arquivos:

- `data/private-character-data.enc.json`
- `data/private-sessions.enc.json`

permanecem criptografados em AES-256-GCM dentro do backup.

### Imagens

Imagens binárias não são convertidas para Base64 no JSON.

Motivo:

- evita backups gigantes;
- evita duplicar mídia;
- mantém o snapshot leve.

O backup inclui `media_manifest` com os caminhos relevantes. Os binários continuam preservados no repositório Git/GitHub.

### Snapshot público JSON

Gera uma cópia sem os dois cofres privados.

A exportação pública é montada a partir dos arquivos canônicos do backend, e não de fichas já mescladas com dados Mestre no navegador.

### Dossiê público HTML

Gera um HTML portátil para leitura.

Remove explicitamente conteúdo:

- Mestre;
- privado;
- Spoiler.

### Dossiê Mestre HTML

Pode incluir conteúdo Mestre descriptografado.

Esse arquivo deve ser tratado como privado porque, ao contrário do backup completo, o conteúdo Mestre está legível no HTML.

### Rascunho local

A exportação antiga do editor continua disponível separadamente como:

**Exportar rascunho local**

Ela não é equivalente ao backup completo.

---

## Compatibilidade de produção

Busca Global 2.0 e Modo Sessão são principalmente frontend.

O backup JSON completo depende de `backup_export_v2` no backend.

Antes do checkpoint compatível:

- painel de Backup abre;
- HTML público/Mestre continua disponível;
- backup completo e snapshot público JSON ficam desabilitados.

Depois do checkpoint, `/api/health` anuncia:

- `command_palette_v2:true`
- `session_mode_v1:true`
- `backup_export_v2:true`

---

## Arquivos principais

- `js/command-palette.js`
- `js/session-mode.js`
- `js/backup-export.js`
- `js/session-editor.js`
- `api/publish.js`
- `api/health.js`
- `index.html`
- `terra-z.css`

## Segurança

- Busca Mestre exige autenticação.
- Modo Sessão não publica automaticamente.
- Modo Sessão usa `sessionStorage`, não `localStorage`.
- Backup completo mantém os cofres criptografados.
- Exportações públicas removem conteúdo Mestre.
- Dossiê Mestre é explicitamente tratado como arquivo sensível.
