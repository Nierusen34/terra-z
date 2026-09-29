# Roadmap — Próximas fases do Terra Z

Atualizado em 29/09/2026 após a conclusão das Fases 1–4.

## Estado atual

Concluído:

- estabilização do editor, backups e exportação;
- IDs permanentes de edição;
- separação entre dados/lore e comportamento;
- modularização do JavaScript;
- organização e carregamento sob demanda dos assets PNG.

A partir daqui, a prioridade deixa de ser reestruturação interna e passa a ser **autonomia editorial, colaboração e experiência de uso**.

## Fase 5 — Edição colaborativa e publicação pelo próprio site

### Objetivo

Permitir que usuários autorizados editem conteúdo pelo Terra Z e publiquem a alteração no GitHub sem precisar alterar arquivos manualmente ou solicitar uma mudança para cada detalhe.

### Arquitetura recomendada

O GitHub Pages continuará estático. Credenciais de escrita **não devem** ficar no JavaScript do navegador.

Fluxo recomendado:

```text
Editor no site
   ↓
Autenticação
   ↓
API segura / função serverless
   ↓
Validação e sanitização
   ↓
GitHub App
   ↓
Commit na main
   ↓
GitHub Pages publica
   ↓
Todos veem a alteração
```

Tecnologias adequadas para a pequena API:

- Cloudflare Worker;
- Vercel Function;
- Netlify Function.

A integração com o repositório deve usar uma GitHub App com permissão somente para o repositório Terra Z.

### Comportamento desejado

- visitantes continuam sem login;
- apenas editores autorizados veem ações de publicação;
- botão **Salvar rascunho** mantém alteração local;
- botão **Publicar** envia a alteração ao GitHub;
- cada publicação gera um commit legível;
- o site mostra estado: salvando → commit criado → deploy em andamento → publicado;
- alterações conflitantes não devem sobrescrever silenciosamente trabalho de outra pessoa;
- histórico do GitHub funciona como trilha de auditoria e permite reversão.

### Conteúdo genérico

Para o editor atual, considerar um arquivo:

```text
data/content-overrides.json
```

com conteúdo indexado pelos atuais `data-edit-id`.

Isso permite publicar pequenas correções textuais sem reescrever `index.html`.

### Conteúdo estruturado

Personagens, locais, eventos, equipes e relações devem ser alterados por formulários próprios e gravados na respectiva camada `data/`.

Como evolução, os arquivos de dados podem migrar de JavaScript para JSON para simplificar validação e edição programática.

---

## Fase 6 — Imagens de personagens e gerenciador de mídia

### Objetivo

Exibir retratos nos cards e nas fichas de personagens.

### Fonte principal recomendada

Upload direto pelo editor do site.

Estrutura:

```text
images/
└── characters/
    ├── tristan-queen.png
    ├── riot.png
    ├── mark.png
    └── ...
```

Cada personagem deve possuir metadados como:

```js
image: {
  src: "images/characters/tristan-queen.png",
  alt: "Tristan Queen",
  source: "local",
  credit: ""
}
```

O upload deve:

- aceitar drag-and-drop;
- validar formato e tamanho;
- gerar nome de arquivo consistente;
- criar ou substituir o asset pelo backend;
- atualizar os dados do personagem;
- publicar imagem + dado no mesmo commit.

### Fandom como fallback

A integração existente com a DC Wiki pode oferecer uma ação **Buscar imagem de referência**.

Não usar automaticamente a primeira imagem da Fandom como fonte definitiva.

Motivos:

- pode representar outra versão visual do personagem;
- URLs externas podem mudar;
- personagens originais não terão imagem;
- estilo visual fica inconsistente;
- imagens de terceiros exigem atenção a direitos de uso e atribuição.

Fallback sugerido:

```text
imagem local → imagem externa explicitamente escolhida → placeholder
```

### Layout sugerido

Nos cards de personagem:

- retrato quadrado ou circular de 72–88 px;
- texto ao lado;
- imagem com `object-fit: cover`;
- placeholder estilizado com iniciais/símbolo quando não houver foto.

Na ficha completa:

- retrato maior de aproximadamente 180 × 240 px;
- nome, codinome e resumo ao lado;
- ficha detalhada abaixo.

---

## Fase 7 — URLs, busca e descoberta de conteúdo

- URL/deep link para cada aba, subseção e personagem;
- link direto como `#personagem=Tristan-Queen`;
- botão copiar link;
- busca global com filtros;
- filtros de personagens por núcleo, equipe, local, espécie ou status;
- cards recentemente atualizados;
- atalhos para favoritos e histórico recente.

---

## Fase 8 — Permissões, spoilers e modo mestre

Separar informação por nível de visibilidade:

- Público;
- Jogadores;
- Restrito;
- Mestre;
- Rumor.

Possibilidades:

- visitantes veem apenas o conteúdo público;
- jogadores autorizados podem receber uma camada adicional;
- mestre/editor vê tudo;
- segredos das fichas deixam de depender somente de um botão visual.

Isso deve ser implementado apenas depois de existir autenticação segura.

---

## Fase 9 — Histórico vivo da campanha

Adicionar uma camada editorial para sessões e acontecimentos:

- log de sessões;
- data dentro do universo;
- acontecimentos recentes;
- personagens envolvidos;
- consequências;
- locais relacionados;
- links para fichas;
- linha do tempo alimentada pelos registros.

A página inicial pode mostrar **Últimas mudanças no universo** e **Última sessão**.

---

## Fase 10 — Evoluções de mapas e relações

### Grafo

- clicar em um nó abre a ficha do personagem;
- filtro por núcleo/relação;
- destacar caminho entre dois personagens;
- esconder relações secretas dependendo da permissão;
- centralizar no personagem selecionado.

### Mapas

- transformar mapas em pontos clicáveis;
- ligar distrito → locais → personagens/eventos;
- filtro de crime, transporte, facções e acontecimentos;
- links diretos para cada ponto.

---

## Melhorias de experiência adicionais

Candidatos após as fases prioritárias:

- activity feed com alterações publicadas;
- botão de desfazer/reverter uma publicação;
- preview antes de publicar;
- autosave de rascunho;
- validação de dados antes do commit;
- thumbnails automáticos de imagens;
- comando rápido / command palette;
- modo PWA/offline;
- exportação de um dossiê por personagem ou sessão;
- indicadores de “atualizado recentemente”;
- página de changelog gerada do histórico do GitHub.

## Ordem recomendada

```text
5. publicação pelo site
        ↓
6. imagens e media manager
        ↓
7. deep links + filtros + busca
        ↓
8. permissões / spoilers
        ↓
9. histórico da campanha
        ↓
10. mapas e relações avançados
```

A prioridade máxima é a Fase 5, pois ela muda o Terra Z de um site que precisa ser mantido externamente para uma ferramenta editorial autônoma.
