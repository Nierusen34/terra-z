# Edição remota e publicação — desenho técnico

## Problema

O Terra Z é hospedado no GitHub Pages. O navegador pode ler arquivos públicos, mas não deve possuir um token com permissão de escrita no repositório.

Colocar um Personal Access Token no JavaScript, HTML, `localStorage` ou qualquer arquivo publicado permitiria que qualquer visitante recuperasse a credencial.

## Solução proposta

Usar uma pequena API intermediária e uma GitHub App.

### Componentes

1. **GitHub Pages**
   - interface pública;
   - editor visual;
   - preview;
   - nenhum segredo.

2. **API serverless**
   - autentica o editor;
   - recebe somente alterações permitidas;
   - valida tamanho e estrutura;
   - sanitiza conteúdo;
   - verifica versão/base SHA;
   - solicita um installation token temporário da GitHub App;
   - cria o commit.

3. **GitHub App**
   - instalada somente no `Nierusen34/terra-z`;
   - permissão mínima de Contents: Read/Write;
   - segredo e chave privada ficam exclusivamente no ambiente serverless.

4. **GitHub Pages**
   - novo commit dispara deploy;
   - todos os visitantes passam a receber a nova versão.

## Fluxo de publicação

```text
Editar
  ↓
Preview local
  ↓
Publicar
  ↓
POST /api/publish
  ↓
autorização + validação
  ↓
commit
  ↓
retorna SHA/URL
  ↓
UI mostra "Deploy em andamento"
  ↓
GitHub Pages atualizado
```

## Estratégia de commits

Para edições pequenas, commit direto na `main` é aceitável se:

- somente editores autorizados puderem publicar;
- houver validação;
- cada commit registrar autor e conteúdo alterado;
- existir proteção contra conflito.

Exemplos:

```text
content: atualizar idade de Tristan Queen
content: corrigir descrição de Downtown
media: atualizar retrato de Dinah Lance
relations: alterar vínculo Riot ↔ Lobo
```

Mudanças estruturais de código continuam usando branch + Pull Request.

## Concorrência

Cada tela de edição deve guardar o SHA/base usado ao abrir os dados.

Se o GitHub avançar antes do envio:

- não sobrescrever silenciosamente;
- avisar que houve mudança remota;
- recarregar ou mostrar comparação.

## Segurança do conteúdo

Mesmo usuários autorizados não devem conseguir publicar HTML arbitrário sem filtragem.

Para conteúdo rico, permitir somente uma allowlist como:

- `p`
- `br`
- `strong`
- `em`
- `ul`
- `ol`
- `li`
- links HTTP/HTTPS quando necessários.

Scripts, iframes, eventos inline e URLs ativas devem ser removidos.

## Imagens

Uploads devem ir ao backend, nunca diretamente ao GitHub com um token exposto no navegador.

O backend pode criar dois blobs/arquivos no mesmo commit:

1. `images/characters/<slug>.png`;
2. atualização do arquivo de dados do personagem.

Limites recomendados:

- PNG/JPEG/WebP;
- tamanho máximo configurável;
- dimensões verificadas;
- nome de arquivo normalizado.

## Autenticação

Opções possíveis:

### GitHub OAuth

Adequado se os editores possuem conta GitHub.

A API confere o usuário autenticado contra uma allowlist.

### Login próprio simples

Pode funcionar para um grupo muito pequeno, mas exige gerenciar credenciais.

### GitHub App + allowlist

Recomendado para Terra Z: GitHub fornece identidade e o backend restringe quais logins podem publicar.

## Não recomendado

- token GitHub dentro do JavaScript;
- PAT salvo no `localStorage`;
- senha compartilhada embutida no site;
- endpoint público que aceita qualquer commit;
- permitir upload sem validação;
- usar Actions como endpoint de escrita com token exposto no cliente.
