(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Sobrescritas estruturadas de personagens existentes.
// A base canônica continua em data/characters.js.
window.TerraZData.characterOverrides = {
  "Tristan Queen": {
    "eyebrow": "🏹 Ranger · Filho de Arqueiros",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Tristan Queen<br><strong>Codinome:</strong> Ranger<br><strong>Idade:</strong> 20 anos (nascido em 2007)<br><strong>Pais:</strong> Oliver Queen (biológico) e Dinah Lance (biológica)<br><strong>Irmãos:</strong> Connor Hawke (meio-irmão paterno)<br><strong>Local:</strong> Vanguard Bay – Downtown (cobertura)</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "📖 História",
        "content": "<p>Cresceu em Star City até os 12 anos, quando presenciou a discussão entre os pais — Dinah partiu para Gotham logo depois. Aos 13, perdeu o pai para o bolsão dimensional. Foi criado pelo meio-irmão Connor durante o luto.</p><p>Aos 15 anos, decidiu ir para Gotham treinar com Jason Todd. Oliver se opôs e parou de falar com ele a partir daí — teimosia e orgulho. Tristan treinou com Jason entre 2022 e 2025, aprendendo arco tático, furtividade e rastreamento. Em 2026, mudou-se para Vanguard Bay, onde vive em uma cobertura no Downtown sob o codinome <em>Ranger</em>.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Frio, calculista, independente e reservado. Mantém controle emocional sob tensão e sempre tem um plano. Não é movido por ressentimento — suas escolhas vêm de dentro, não de mágoas.</p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Arco e flecha:</strong> tático e preciso. Aprendido com Oliver, Connor e Jason.</li><li><strong>Combate corpo a corpo:</strong> letal. Aprendido com Dinah Lance.</li><li><strong>Furtividade:</strong> infiltração e movimento silencioso (com Jason).</li><li><strong>Rastreamento:</strong> seguir alvos em ambiente urbano.</li></ul>",
        "visibility": "public",
        "position": 3
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Oliver (pai):</strong> Relação fraturada — mas o silêncio parte de Oliver, não de Tristan. Oliver é teimoso e orgulhoso e não aceita a escolha do filho de ir para Gotham em 2022.</li><li><strong>Dinah (mãe):</strong> Distante, mas sem culpa de Tristan. A culpa é dela — por ter ido para Gotham em 2019 e não ter estado presente em 2020. Conversam por mensagem.</li><li><strong>Connor (irmão):</strong> Irmãos próximos. Connor é o elo de comunicação com a família — figura fraterna estável.</li><li><strong>Jason Todd:</strong> Mentor e figura fraterna oposta a Connor — o contraponto rebelde ao irmão estável.</li><li><strong>Lian Harper:</strong> Amiga de infância, filha de Roy Harper. Conversam frequentemente por mensagem. Atualmente é a Cheshire Cat nos Titãs de Jason.</li></ul>",
        "visibility": "public",
        "position": 4
      }
    ],
    "created": true,
    "card": {
      "icon": "🏹",
      "codename": "Ranger",
      "age": "20 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Riot": {
    "eyebrow": "💀 Clone Czarniano · Aprendiz de Kendra",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Riot<br><strong>Idade:</strong> Aparência 35 anos (cronológico: 5)<br><strong>Origem:</strong> Clone da Cadmus, resgatado em 2022<br><strong>Mãe adotiva:</strong> Kendra Saunders (Hawkgirl)<br><strong>Pai genético:</strong> Lobo (Czarniano)<br><strong>Status:</strong> Em missão pessoal em Vanguard Bay (sem local fixo)</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "📖 História",
        "content": "<p>Criado por uma equipe dissidente da Cadmus — que depois se tornaria a organização <strong>Sumdac</strong> — como clone do Lobo. Seria descartado, mas foi resgatado em 2022 na <em>Tower of Fate</em> por uma equipe formada por <strong>Kendra Saunders, Oliver Queen, Metamorfo (Rex Mason) e Gladiador Dourado (Michael Carter)</strong>.</p><p>Durante o resgate, o clone bebê mordeu Lobo — e o Czarniano, divertido, prometeu dar 50 anos antes de caçá-lo. Kendra o criou por 5 anos (2022–2027), treinando-o intensamente e <strong>contando a ele sobre a promessa</strong>. Em janeiro de 2027, Kendra o apoiou a ir para Vanguard Bay para investigar a Sumdac sozinho — ele não fugiu.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Rebelde no geral — odeia autoridade e regras — mas <strong>respeita e gosta muito de Kendra</strong>, sentindo-se calmo na presença dela. Impulsivo, age antes de pensar. Carrega um <em>rage</em> interno constante, e sua consciência às vezes divaga entre memórias genéticas de Lobo e memórias próprias — quando isso acontece, ele anda sem rumo, quase como um sonâmbulo. Em relação ao destino de 2072, tende a <strong>desafiar</strong> em vez de aceitar.</p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Superforça:</strong> capacidade física sobre-humana.</li><li><strong>Resistência:</strong> suporta danos extremos.</li><li><strong>Regeneração acelerada:</strong> cura rápida.</li><li><strong>Crescimento acelerado:</strong> aparência de 20 anos em apenas 5 de vida.</li><li><strong>Estilo de luta:</strong> cru e bruto — mesmo treinado por Kendra, luta por instinto. Sem armas.</li></ul>",
        "visibility": "public",
        "position": 3
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Kendra (mãe adotiva):</strong> Respeito e afeto genuínos. Sente-se calmo com ela. A rebeldia dele dificilmente é direcionada a ela.</li><li><strong>Lobo:</strong> Origem genética. Promessa de caça em 2072. Riot sente raiva e é perturbado pelas memórias genéticas.</li><li><strong>Oliver, Metamorfo e Gladiador Dourado:</strong> Colegas da missão de resgate de 2022. Relação positiva, mas distante — sempre checavam com Kendra se ele estava bem.</li><li><strong>Tristan Queen:</strong> Dois estranhos que estão se ajudando em um mesmo objetivo. Riot confia em Tristan por conhecer Oliver — como se a familiaridade fosse uma garantia.</li></ul>",
        "visibility": "public",
        "position": 4
      },
      {
        "title": "🆕 A ORGANIZAÇÃO SUMDAC",
        "content": "<p>A equipe da Cadmus que criou Riot era <strong>dissidente</strong>. Separaram-se da Cadmus e formaram a <strong>Sumdac</strong> — mesma logotipo da Cadmus, mas toda em <strong>vermelho</strong>. Estão operando em <strong>Vanguard Bay</strong>, fazendo experimentos. Riot descobriu isso durante eventos recentes.</p>",
        "visibility": "public",
        "position": 5
      }
    ],
    "created": true,
    "card": {
      "icon": "💀",
      "codename": "R10T",
      "age": "5 (Aparenta ter 35)",
      "origin": "Clone da Cadmus",
      "status": "Ativo"
    }
  },
  "M'ark": {
    "eyebrow": "🟢 Filho de M'gann · Nome provisório",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> M'ark (provisório — o jogador definirá o nome final)<br><strong>Idade:</strong> 23 anos (nascido em 2004)<br><strong>Mãe:</strong> M'gann M'orzz (Miss Martian)<br><strong>Pai biológico:</strong> Armek (falecido, Marciano Branco)<br><strong>Criação:</strong> Criado por M'gann e J'onn J'onzz<br><strong>Status:</strong> <strong>Prisioneiro da Sumdac</strong> — em local secreto</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "📖 História",
        "content": "<p>Concebido em 2003–2004, quando Armek — um Marciano Branco cruel — enganou e violentou M'gann na Terra. J'onn descobriu, viajou a Marte e matou Armek antes que ele soubesse da gravidez. Criado em segredo por M'gann e J'onn até 2021, quando Conner descobriu sua existência.</p><p>Em outubro/novembro de 2026, foi apresentado publicamente como um <strong>Marciano Verde sobrevivente de uma colônia perdida</strong> — identidade que ele <strong>concordou</strong> em assumir. Em dezembro de 2026, viajou para Vanguard Bay. Ao chegar, foi <strong>emboscado pela Sumdac</strong> e capturado. A Sumdac quer estudar seu DNA alienígena.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p><em>A definir pelo jogador.</em></p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Telepatia:</strong> confirmada.</li><li><strong>Telecinese:</strong> confirmada.</li><li><strong>Intangibilidade:</strong> confirmada.</li><li><strong>Invisibilidade:</strong> confirmada.</li><li><strong>Disfarce marciano:</strong> confirmado (usa forma Verde publicamente).</li><li><em>Outros poderes a definir pelo jogador.</em></li></ul>",
        "visibility": "public",
        "position": 3
      },
      {
        "title": "🔗 Relações",
        "content": "<p><em>Todas as relações ainda a definir com o jogador (M'gann, J'onn, Conner, Armek).</em></p>",
        "visibility": "public",
        "position": 4
      },
      {
        "title": "🆕 O CATIVEIRO E CAMILA VARGAS",
        "content": "<p><strong>Como foi capturado:</strong> emboscado pela Sumdac ao chegar em Vanguard Bay.<br><strong>Motivo:</strong> estudar seu DNA alienígena.<br><strong>Duração:</strong> não sabe quantos dias está preso. Perdeu a noção do tempo.<br><strong>Quem sabe:</strong> ninguém — nem M'gann, nem J'onn, nem Conner. <strong>Apenas Camila Vargas.</strong></p><p><strong>Camila Vargas</strong> é uma meta-humana recém-desperta (telepata), braço-direito de Leland Shaw na Shaw Innovations. Ao despertar seus poderes, criou acidentalmente um <strong>elo telepático</strong> com M'ark. Ela não sabe a localização dele, mas sabe que ele está preso e em perigo. É leal à empresa, mas <strong>não a Shaw</strong>, e esconde seus poderes dele. Propôs uma <strong>aliança com Tristan e Riot</strong> para resgatar M'ark — já que a Sumdac também é parte do objetivo deles. A Sumdac não sabe do elo.</p>",
        "visibility": "spoiler",
        "position": 5
      },
      {
        "title": "💀 A VOZ DE ARMek",
        "content": "<p>Às vezes, M'ark <strong>conversa com Armek na própria cabeça</strong>. A natureza disso ainda não foi definida — pode ser alucinação, loucura (herança genética) ou um resquício da existência de seu falecido pai. Um dos maiores mistérios do personagem.</p>",
        "visibility": "public",
        "position": 6
      }
    ],
    "created": true,
    "card": {
      "icon": "🟢",
      "codename": "Nenhum ainda",
      "age": "23 anos",
      "origin": "Marciano Branco",
      "status": "Ativo"
    }
  },
  "Kendra Saunders": {
    "eyebrow": "🦅 Reencarnação de Shiera Hall",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Kendra Shiera Saunders<br><strong>Codinome:</strong> Hawkgirl<br><strong>Idade:</strong> ~32 anos<br><strong>Origem:</strong> Humana que herdou a alma de Shiera Hall<br><strong>Residência:</strong> Midway City<br><strong>Papel:</strong> Mãe adotiva de Riot. Membro da JSA e JLU.</p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Juventude conturbada: perdeu os pais, teve uma filha aos 16 (entregue para adoção em 2011) e tentou suicídio aos 17. Ao morrer, sua alma foi substituída pela de Shiera Hall. Seu avô, Speed Saunders, percebeu a mudança (olhos mudaram de verde para castanho) e a treinou.</p><p>Em 2022, resgatou Riot na <em>Tower of Fate</em> — equipe com Oliver, Metamorfo e Gladiador Dourado. Lobo fez a promessa dos 50 anos. Adotou Riot e o criou por 5 anos, treinando-o intensamente. Em janeiro de 2027, <strong>apoiou a ida de Riot para Vanguard Bay</strong> — ele precisa aprender sobre a Sumdac sozinho, e ela confia nele.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Forte, resiliente e bem-humorada — especialmente com quem considera família. <strong>Confiante</strong> nas decisões de Riot. Independente, sem contato com Carter Hall (Shiera foi para Thanagar). Preparada para enfrentar Lobo em 2072, se necessário.</p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Voo:</strong> asas e cinto de Nth Metal.</li><li><strong>Maça de Nth Metal:</strong> arma principal.</li><li><strong>Fator de cura:</strong> regeneração acelerada.</li><li><strong>Memórias de vidas passadas:</strong> acesso limitado a memórias de Shiera Hall.</li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Riot (filho adotivo):</strong> Respeito e afeto genuínos. Apoiou a ida dele para Vanguard Bay — confia nas decisões dele. Pretende ficar em Midway City.</li><li><strong>Lobo:</strong> Testemunhou a promessa dos 50 anos. Odeia e teme, mas Lobo não tem motivo para atacá-la — deixou Riot com ela.</li><li><strong>Filha biológica:</strong> Sabe onde ela está. Apenas observa de longe.</li><li><strong>Oliver, Metamorfo e Gladiador Dourado:</strong> Colegas da missão de 2022.</li><li><strong>Carter Hall:</strong> Sem contato. Shiera Hall foi para Thanagar.</li></ul>"
      }
    ],
    "created": true
  },
  "Lobo": {
    "eyebrow": "💀 O Maioral · Czarniano",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Lobo<br><strong>Idade:</strong> 400+ anos (imortal)<br><strong>Espécie:</strong> Czarniano<br><strong>Ocupação:</strong> Mercenário cósmico. Membro temporário da Liga da Justiça.<br><strong>Local atual:</strong> Espaço (missões cósmicas)</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "📖 História",
        "content": "<p>Nascido em Czárnia. Aos 16 anos matou metade da população do planeta; aos 17, criou uma praga que matou o restante. Foi expulso do céu e do inferno, condenado à imortalidade.</p><p>Em 2022, foi mordido pelo clone bebê Riot durante o resgate e — divertido — prometeu 50 anos antes de caçá-lo. <strong>Prazo: 2072.</strong> Após Superman se tornar o Rei Ômega e a Liga entrar na fase <strong>Liga da Justiça Sem Limites</strong> — recrutando heróis, anti-heróis e alguns vilões — Lobo se tornou um <strong>membro temporário</strong> da JLU.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Cruel, violento, sádico por diversão. Não odeia Riot — é pura diversão sádica. Tem humor ácido e código de ética próprio (cumpre a palavra dada). Nunca matou por engano — sempre escolhe as vítimas. Gosta mais de caçar do que de matar.</p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Superforça:</strong> nível Superman.</li><li><strong>Super-velocidade:</strong> extremamente rápido.</li><li><strong>Regeneração:</strong> cura acelerada.</li><li><strong>Imortalidade:</strong> não pode morrer.</li><li><strong>Olfato superdesenvolvido:</strong> rastreia alvos a longas distâncias.</li></ul>",
        "visibility": "public",
        "position": 3
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Riot:</strong> Origem genética. Promessa de caça em 2072 — por diversão sádica.</li><li><strong>Kendra:</strong> Deixou Riot com ela. Sem motivo para atacá-la.</li><li><strong>Liga da Justiça Sem Limites:</strong> Membro temporário — recrutado na fase de expansão.</li><li><strong>Superman (Rei Ômega):</strong> Contexto — a ascensão dele abriu a fase JLU.</li></ul>",
        "visibility": "public",
        "position": 4
      }
    ],
    "created": true,
    "card": {
      "icon": "💀",
      "codename": "O Maioral",
      "age": "400+ anos (imortal)",
      "origin": "Czarniano",
      "status": "Ativo"
    }
  },
  "M'gann M'orzz": {
    "eyebrow": "🟢 Miss Martian · Marciana Branca",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> M'gann M'orzz (Megan Morse na Terra)<br><strong>Idade:</strong> ~39 anos<br><strong>Origem:</strong> Marciana Branca fugitiva<br><strong>Papel:</strong> Mãe de M'ark. Ex-Novos Titãs.<br><strong>Local atual:</strong> A caminho de Vanguard Bay</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "📖 História",
        "content": "<p>Chegou à Terra em ~2000–2002, fugindo do genocídio em Marte. Acolhida por J'onn, que a ajudou a se passar por Marciana Verde. Em 2003–2004, foi enganada e violentada por Armek. Criou M'ark em segredo por 20 anos. Terminou com Conner em 2019 (motivo real: o peso do segredo), mas reataram em 2021 quando ele descobriu M'ark. Apoiou a ida do filho para Vanguard Bay, mas com preocupação — é a primeira vez em anos que não estarão juntos.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Carrega múltiplos traumas: a violência de Armek, a mentira sobre sua raça, o segredo de seu filho. Protetora, mas aprendendo a confiar no filho. Relação sólida com Conner em 2027.</p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Telepatia:</strong> poderosa.</li><li><strong>Telecinese:</strong> sim.</li><li><strong>Metamorfose:</strong> sim.</li><li><strong>Intangibilidade:</strong> sim.</li><li><strong>Invisibilidade:</strong> sim.</li><li><strong>Voo:</strong> sim.</li></ul>",
        "visibility": "public",
        "position": 3
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>M'ark:</strong> Filho. Superprotetora, mas apoiou a ida dele para Vanguard Bay — com preocupação.</li><li><strong>Conner Kent:</strong> Namorado. Relação sólida em 2027.</li><li><strong>J'onn J'onzz:</strong> Mentor e figura paterna.</li><li><strong>Armek:</strong> Violentador (falecido).</li><li><strong>Novos Titãs:</strong> Ex-membro.</li></ul>",
        "visibility": "public",
        "position": 4
      }
    ],
    "created": true,
    "card": {
      "icon": "🟢",
      "codename": "Miss Marte",
      "age": "~39 anos",
      "origin": "Marciana Branca fugitiva",
      "status": "Ativo"
    }
  },
  "J'onn J'onzz": {
    "eyebrow": "🟢 Caçador de Marte · Último Marciano Verde",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> J'onn J'onzz<br><strong>Codinome:</strong> Caçador de Marte<br><strong>Idade:</strong> ~227 anos<br><strong>Espécie:</strong> Marciano Verde (último)<br><strong>Papel:</strong> Membro fundador da Liga da Justiça. Mentor de M'gann e M'ark.<br><strong>Local atual:</strong> Torre de Vigia</p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Sobreviveu à Maldição de H'ronmeer — perdeu esposa e filha. Chegou à Terra nos anos 1950–1960. Membro fundador da Liga da Justiça. Em 2006–2007, ao descobrir o que Armek fez com M'gann, viajou a Marte e o matou — decisão difícil, mas necessária.</p><p>Seu irmão gêmeo, <strong>Ma'alefa'ak</strong> (criador da Maldição de H'ronmeer), foi <strong>morto durante um combate com J'onn</strong> — consumido pelo sol. Em 2027, atua ativamente na JLU.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Filósofo, pacifista e protetor. Carrega o peso de ter matado Armek — não foi fácil, mas foi necessário naquela situação. Mentor e figura paterna de M'gann e M'ark. Respeita o silêncio de M'gann sobre outros segredos.</p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Telepatia:</strong> de escala planetária.</li><li><strong>Telecinese:</strong> poderosa.</li><li><strong>Metamorfose:</strong> qualquer forma.</li><li><strong>Intangibilidade e invisibilidade:</strong> sim.</li><li><strong>Regeneração:</strong> cura acelerada.</li><li><strong>Voo:</strong> sim.</li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>M'gann M'orzz:</strong> Figura paterna. Mentor.</li><li><strong>M'ark:</strong> Figura paterna / avô.</li><li><strong>Conner Kent:</strong> Aliado próximo.</li><li><strong>Armek:</strong> Matou em vingança — decisão difícil, mas necessária.</li><li><strong>Ma'alefa'ak:</strong> Irmão gêmeo. Morto — consumido pelo sol durante combate.</li><li><strong>Liga da Justiça:</strong> Membro fundador. Atuação ativa em 2027.</li></ul>"
      }
    ],
    "created": true
  },
  "Oliver Queen": {
    "eyebrow": "🏹 O Queen · Agente da JLU",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Oliver Jonas Queen<br><strong>Codinome:</strong> O Queen (ex-Arqueiro Verde)<br><strong>Idade:</strong> 47 anos (nascido em 1980)<br><strong>Status:</strong> Vivo — ressuscitado em 2022<br><strong>Papel:</strong> Agente da Liga da Justiça Sem Limites<br><strong>Local:</strong> Gotham (investigando anomalia)</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "📖 História",
        "content": "<p>Fundador do manto do Arqueiro Verde em Star City. Em 2020, uma explosão o sugou para um bolsão dimensional. Passou 2 anos isolado — o que lhe deixou um <strong>trauma emocional profundo</strong>: não consegue se afastar de Dinah por muito tempo. Resgatado por Cyborg e Flash em 2022. Faz parte da equipe de resgate de Riot (com Kendra, Metamorfo e Gladiador Dourado). Não reassumiu o manto — Connor mantém o título. Tornou-se agente da JLU.</p><p>Em 2022, quando Tristan decidiu ir para Gotham treinar com Jason, Oliver se opôs e <strong>parou de falar com o filho</strong> — teimosia e orgulho.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Teimoso e orgulhoso. Calmo com ressalvas, mas ainda impulsivo em momentos-chave. Carrega trauma emocional do bolsão dimensional — não consegue se afastar de Dinah por muito tempo. Sem problemas de saúde físicos. Fala sobre Tristan com Dinah e Connor, mas não diretamente com o filho.</p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Arco e flecha:</strong> mestre arqueiro nível lendário. Ainda tem o arco.</li><li><strong>Combate corpo a corpo:</strong> treinado, mas não é o foco.</li><li><strong>Táticas:</strong> estrategista experiente.</li><li><strong>Liderança:</strong> ex-líder da JLU em missões.</li></ul>",
        "visibility": "public",
        "position": 3
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Dinah Lance:</strong> Esposa. Reataram. Não consegue se afastar dela por muito tempo.</li><li><strong>Tristan Queen:</strong> Filho. Silêncio total por parte de Oliver desde 2022 — teimosia e orgulho. Não gosta que Tristan esteja em Vanguard Bay, mas reconhece que é melhor do que Gotham.</li><li><strong>Connor Hawke:</strong> Filho que assumiu o manto. Respeito mútuo.</li><li><strong>Kendra Saunders:</strong> Contato regular. Colegas e amigos.</li><li><strong>Jason Todd:</strong> Não aprova que ele tenha treinado Tristan.</li></ul>",
        "visibility": "public",
        "position": 4
      }
    ],
    "created": true,
    "card": {
      "icon": "🏹",
      "codename": "O Queen (ex-Arqueiro Verde)",
      "age": "47 anos (nascido em 1980)",
      "origin": "Humano",
      "status": "Vivo — ressuscitado em 2022"
    }
  },
  "Dinah Lance": {
    "eyebrow": "🐤 Canário Negro · Líder das Aves de Rapina",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Dinah Laurel Lance<br><strong>Codinome:</strong> Canário Negro<br><strong>Idade:</strong> 40 anos (nascida em 1987)<br><strong>Status:</strong> Viva<br><strong>Papel:</strong> Líder das Aves de Rapina (grupo em hiato).<br><strong>Local:</strong> Gotham</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "📖 História",
        "content": "<p>Em 2019, após o tiro em Bárbara e a morte de Jason, foi para Gotham ajudar a amiga — e fundou as Aves de Rapina com Bárbara, Helena e Zinda. Estava em Gotham quando Oliver \"morreu\" em 2020. Retornou para o velório e descobriu que Connor já assumia o manto e cuidava de Tristan. Desde então, carrega culpa por não ter estado presente.</p><p>Em 2027, está em Gotham com Oliver. As Aves de Rapina estão em <strong>hiato</strong>. Seus poderes (Grito Canário) estão falhando por causa da distorção do Rei Ômega — a falha é conhecida por membros da Liga e pessoas próximas.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Resiliente, culpada por 2019/2020, mãe presente mesmo à distância. Conversa com Tristan por mensagem — não há evitação mútua. Está deixando Oliver agir do jeito dele, acreditando que a decisão de resolver o silêncio deve vir dele.</p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Grito Canário:</strong> falhando — distorção do Rei Ômega. Temporário ou permanente ainda não revelado.</li><li><strong>Combate corpo a corpo:</strong> mestre — ensinou Tristan.</li><li><strong>Liderança:</strong> fundadora das Aves de Rapina (em hiato).</li><li><strong>Táticas:</strong> estrategista.</li></ul>",
        "visibility": "public",
        "position": 3
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Oliver Queen:</strong> Marido. Amor sólido. Ciente do trauma dele e do silêncio com Tristan.</li><li><strong>Tristan Queen:</strong> Filho. Conversam por mensagem. Não há evitação mútua.</li><li><strong>Connor Hawke:</strong> Gratidão — ele cuidou de Tristan em 2020.</li><li><strong>Bárbara Gordon:</strong> Melhor amiga. Aves de Rapina em hiato.</li><li><strong>Helena Bertinelli e Zinda Blake:</strong> Aliadas nas Aves de Rapina.</li></ul>",
        "visibility": "public",
        "position": 4
      }
    ],
    "created": true,
    "card": {
      "icon": "🐤",
      "codename": "Canário Negro",
      "age": "40 anos (nascida em 1987)",
      "origin": "Humana",
      "status": "Viva"
    }
  },
  "Connor Hawke": {
    "eyebrow": "🏹 Arqueiro Verde · Herói de Star City",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Connor Hawke<br><strong>Codinome:</strong> Arqueiro Verde (atual)<br><strong>Idade:</strong> 25 anos (nascido em 2002)<br><strong>Status:</strong> Solteiro<br><strong>Papel:</strong> Herói principal de Star City. Responsável pelos negócios da família Queen.<br><strong>Assumiu o manto:</strong> 2020, aos 17/18 anos</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "📖 História",
        "content": "<p>Filho biológico de Oliver com Sandra Hawke — relacionamento anterior ao casamento com Dinah. Cresceu longe do pai, mas se aproximou com o tempo. Em 2020, quando Oliver \"morreu\", assumiu o manto com o apoio de Dinah (que na época estava em Gotham) e cuidou de Tristan durante o luto. Mantém o título até hoje, mesmo após o retorno do pai.</p><p>Em 2027, além de ser o Arqueiro Verde de Star City, é <strong>responsável pelos negócios da família Queen financeiramente</strong>.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Calmo, equilibrado, estável — o \"pilar\" da família. Mediador (tenta resolver o silêncio entre Oliver e Tristan, sem muito sucesso). Responsável. Não se sente sobrecarregado por ser o Arqueiro Verde.</p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Arco e flecha:</strong> nível Oliver — talvez superior.</li><li><strong>Combate corpo a corpo:</strong> treinado.</li><li><strong>Táticas:</strong> estrategista.</li><li><strong>Gestão financeira:</strong> responsável pelos negócios Queen.</li></ul>",
        "visibility": "public",
        "position": 3
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Oliver Queen:</strong> Pai. Respeito, mas tensão não resolvida.</li><li><strong>Tristan Queen:</strong> Irmão mais novo. Elo de comunicação. Contato não constante (ocupado).</li><li><strong>Dinah Lance:</strong> Madrasta. Gratidão.</li><li><strong>Jason Todd:</strong> Contato por causa de Tristan.</li><li><strong>Roy Harper (Arsenal):</strong> Amigo. Roy atua às vezes com Connor e Mia.</li><li><strong>Mia Dearden (Speedy):</strong> Parceira de combate.</li><li><strong>Cyborg (Victor Stone):</strong> Amigo.</li><li><strong>Lian Harper:</strong> Amiga — filha de Roy.</li></ul>",
        "visibility": "public",
        "position": 4
      }
    ],
    "created": true,
    "card": {
      "icon": "🏹",
      "codename": "Arqueiro Verde (atual)",
      "age": "25 anos (nascido em 2002)",
      "origin": "Humano",
      "status": "Solteiro"
    }
  },
  "Jason Todd": {
    "eyebrow": "🦇 Capuz Vermelho · Líder dos Jovens Titãs",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Jason Peter Todd<br><strong>Codinome:</strong> Capuz Vermelho<br><strong>Idade:</strong> 23 anos (nascido em 2004)<br><strong>Status:</strong> Vivo — ressuscitado em 2021<br><strong>Papel:</strong> Treinou Tristan (2022–2025). Líder dos Jovens Titãs.<br><strong>Local:</strong> Fora de Gotham — já não estava mais lá quando se juntou aos Titãs</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "📖 História",
        "content": "<p>Segundo Robin, morto pelo Coringa em 2019 aos 15 anos. Ressuscitado em 2021 pelo <strong>Poço de Lázaro</strong> (artefato da Liga dos Assassinos). Tornou-se o anti-herói Capuz Vermelho. Em 2022, aceitou treinar Tristan Queen em Gotham. Em 2026, foi escolhido para liderar a nova geração dos Jovens Titãs (Fairplay, Cheshire Cat, Flatline, Proxy, Wildcard) — como provocação a Dick Grayson, que lidera os Titãs adultos.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Frio, endurecido pela morte e ressurreição. Rebelde — não segue as regras de Bruce. Protetor com quem considera família. Ainda tem pesadelos com a morte de 2019. Relação com os Jovens Titãs ainda em adaptação — eles precisam se acostumar uns com os outros.</p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Combate:</strong> brutal, eficiente, letal.</li><li><strong>Armas:</strong> pistolas, facas, explosivos.</li><li><strong>Estratégia:</strong> táticas de guerrilha.</li><li><strong>Liderança:</strong> relutante, mas eficaz.</li></ul>",
        "visibility": "public",
        "position": 3
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Tristan Queen:</strong> Ex-aluno. Mentor e figura fraterna oposta a Connor — o contraponto rebelde ao irmão estável.</li><li><strong>Bruce:</strong> Relação distante, mas Bruce não interfere.</li><li><strong>Dick:</strong> Irmão adotivo. Rivalidade de irmãos. Jason criou sua própria equipe para provocá-lo.</li><li><strong>Tim:</strong> Irmão adotivo. Respeito.</li><li><strong>Damian:</strong> Meio-irmão adotivo. Rivalidade.</li><li><strong>Jovens Titãs:</strong> Líder. Relação em adaptação.</li><li><strong>Lian Harper (Cheshire Cat):</strong> Membro da equipe dele.</li><li><strong>Talia al-Ghul:</strong> Pouco contato.</li></ul>",
        "visibility": "public",
        "position": 4
      }
    ],
    "created": true,
    "card": {
      "icon": "🦇",
      "codename": "Capuz Vermelho",
      "age": "23 anos (nascido em 2004)",
      "origin": "Humano",
      "status": "Vivo — ressuscitado em 2021"
    }
  },
  "Conner Kent": {
    "eyebrow": "🦸 Superboy · Clone de Superman e Lex Luthor",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Conner Kent (Kon-El)<br><strong>Codinome:</strong> Superboy<br><strong>Idade:</strong> ~29 anos (clone)<br><strong>Origem:</strong> Clone híbrido de Superman e Lex Luthor<br><strong>Local:</strong> A caminho de Vanguard Bay</p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Criado em laboratório como clone híbrido de Superman e Lex Luthor. Conheceu M'gann nos Novos Titãs (~2010–2012). Em 2019, M'gann terminou com ele sem explicação. Em 2021, investigou e descobriu M'ark — e toda a verdade sobre Armek. Reataram e passou a ser figura paterna para o garoto.</p><p>Em 2027, Conner e M'gann são vistos como casal pela comunidade heroica. Tinha contato regular com Superman antes dele virar Rei Ômega.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Protetor com M'ark, leal a M'gann. Ainda tem <strong>receio de se tornar como Lex</strong> — o que piorou porque <strong>Lex está na JLU atualmente</strong>. Assume papel de pai para M'ark.</p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Superforça:</strong> nível Superman.</li><li><strong>Super-velocidade:</strong> sim.</li><li><strong>Invulnerabilidade:</strong> sim.</li><li><strong>Voo:</strong> sim.</li><li><strong>Visão de calor:</strong> sim.</li><li><strong>Super-audição:</strong> sim.</li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>M'gann M'orzz:</strong> Namorada. Relação sólida.</li><li><strong>M'ark:</strong> Filho adotivo de fato.</li><li><strong>Superman:</strong> Doador genético. Contato regular antes do Rei Ômega.</li><li><strong>Lex Luthor:</strong> Doador genético. Odeia. Lex está na JLU — o que aumenta o receio.</li><li><strong>J'onn J'onzz:</strong> Aliado.</li></ul>"
      }
    ],
    "created": true
  },
  "Bruce Wayne": {
    "eyebrow": "🦇 Batman · O Maior Detetive do Mundo",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Bruce Thomas Wayne<br><strong>Codinome:</strong> Batman<br><strong>Idade:</strong> 46 anos (nascido em 1981)<br><strong>Status:</strong> Ativo<br><strong>Papel:</strong> Batman de Gotham. Membro fundador da Liga da Justiça.<br><strong>Local:</strong> Gotham</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Ainda em luto por Alfred (2022) — a chegada de Verity está ajudando a se adaptar. Reservado e não interfere nas escolhas de Jason (inclusive sobre Tristan). Contato regular com a JL.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Alfred Pennyworth:</strong> Pai adotivo. Morto em 2022. Visita o túmulo periodicamente.</li><li><strong>Dick Grayson:</strong> Filho adotivo. Respeito.</li><li><strong>Jason Todd:</strong> Filho adotivo. Relação distante, mas não interfere no que ele faz.</li><li><strong>Tim Drake:</strong> Filho adotivo. Respeita a escolha de se aposentar.</li><li><strong>Damian Wayne:</strong> Filho biológico. Relação tensa, mas de amor.</li><li><strong>Barbara Gordon:</strong> Aliada e amiga. Batgirl.</li><li><strong>Verity Pennyworth:</strong> Nova mordoma. Ajudando no luto.</li></ul>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🦇",
      "codename": "Batman",
      "age": "46 anos (nascido em 1981)",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Dick Grayson": {
    "eyebrow": "🦅 Asa Noturna · Líder dos Titãs",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Richard John Grayson<br><strong>Codinome:</strong> Asa Noturna<br><strong>Idade:</strong> 29 anos (nascido em 1998)<br><strong>Status:</strong> Ativo<br><strong>Papel:</strong> Líder dos Titãs adultos. Herói de Blüdhaven.<br><strong>Local:</strong> Blüdhaven</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Carismático, líder natural, idealista. Rivalidade de irmãos com Jason ainda existe. Namorando Bárbara Gordon.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Barbara Gordon:</strong> Namorada.</li><li><strong>Bruce:</strong> Pai adotivo. Respeito.</li><li><strong>Jason Todd:</strong> Rivalidade de irmãos. Jason criou sua própria equipe para provocá-lo.</li><li><strong>Tim Drake:</strong> Confiança.</li><li><strong>Damian Wayne:</strong> Mentoria.</li><li><strong>Tristan Queen:</strong> Conhece, mas poucas interações — ocupado em Gotham e Blüdhaven.</li></ul>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🦅",
      "codename": "Asa Noturna",
      "age": "29 anos (nascido em 1998)",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Barbara Gordon": {
    "eyebrow": "🦇 Batgirl · Oráculo",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Barbara Joan Gordon<br><strong>Codinome:</strong> Batgirl (voltou a andar)<br><strong>Idade:</strong> 32 anos (nascida em 1995)<br><strong>Status:</strong> Ativa<br><strong>Papel:</strong> Batgirl. Fundadora das Aves de Rapina (em hiato).<br><strong>Local:</strong> Gotham</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Determinada — superou a paraplegia e voltou a andar. Inteligente, líder. Envolvida com as Aves de Rapina (em hiato).</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Dick Grayson:</strong> Namorado.</li><li><strong>Bruce:</strong> Mentor. Respeito.</li><li><strong>Dinah Lance:</strong> Melhor amiga. Aves de Rapina.</li><li><strong>Tristan Queen:</strong> Conhece e já conversaram algumas vezes.</li></ul>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "📝 Nota",
        "content": "<p>Voltou a andar e atua como Batgirl — não precisa de exoesqueleto ou muletas.</p>",
        "visibility": "public",
        "position": 3
      }
    ],
    "created": true,
    "card": {
      "icon": "🦇",
      "codename": "Batgirl (voltou a andar)",
      "age": "32 anos (nascida em 1995)",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Damian Wayne": {
    "eyebrow": "🦇 Robin · Filho de Bruce e Talia",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Damian Wayne<br><strong>Codinome:</strong> Robin<br><strong>Idade:</strong> 14 anos<br><strong>Status:</strong> Ativo<br><strong>Papel:</strong> Robin atual.<br><strong>Local:</strong> Gotham</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Arrogante, impulsivo, determinado. <strong>Não aprovou o treinamento de Tristan por Jason</strong> — por isso não se aproximou muito dele. Desvinculou-se da Liga dos Assassinos.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Bruce:</strong> Pai. Relação tensa, mas de respeito.</li><li><strong>Talia:</strong> Mãe. Desvinculado da Liga, mas se importam à distância.</li><li><strong>Dick:</strong> Mentoria.</li><li><strong>Jason:</strong> Rivalidade. Não aprovou o treinamento de Tristan.</li><li><strong>Tim:</strong> Competição.</li><li><strong>Tristan Queen:</strong> Conhece, mas não se aproximou — não concorda com o treinamento de Jason.</li></ul>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🦇",
      "codename": "Robin",
      "age": "14 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Tim Drake": {
    "eyebrow": "📚 Ex-Robin · Vida civil",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Timothy Jackson Drake<br><strong>Idade:</strong> 20 anos (nascido em 2007)<br><strong>Status:</strong> Aposentado — vida civil<br><strong>Namorado:</strong> Bernard Dowd<br><strong>Local:</strong> Gotham (como civil)</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Focado em si mesmo — prioriza sua vida pessoal, amorosa e independência. Evita assuntos sobre a Bat-Família, mas mantém contato com todos. Foca na vida fora do vigilantismo.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 História",
        "content": "<p>Em 2019 (aos 12 anos), deduziu as identidades de Bruce e Dick — tornou-se Robin. Em 2022, com a morte de Alfred, começou a sentir que a vida de vigilante não era para ele. Passou o manto para Damian, tornou-se Robin Vermelho por um tempo e, eventualmente, <strong>aposentou-se</strong>. Em 2027, vive como civil em Gotham e namora Bernard Dowd.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "📚",
      "codename": "Red Robin",
      "age": "20 anos (nascido em 2007)",
      "origin": "Humano",
      "status": "Aposentado — vida civil"
    }
  },
  "Verity Pennyworth": {
    "eyebrow": "🎩 Nova Mordoma da Mansão Wayne",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Verity Pennyworth<br><strong>Idade:</strong> 26 anos<br><strong>Status:</strong> Ativa<br><strong>Papel:</strong> Nova mordoma da Mansão Wayne.<br><strong>Conexão:</strong> Sobrinha-neta de Alfred.<br><strong>Local:</strong> Gotham</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Elegante, austera, confiante nas próprias habilidades. Mulher branca, de cabelos longos loiros.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 História",
        "content": "<p>Chegou a Gotham em 2026, enviada por um plano que o próprio Alfred deixou antes de morrer. Assume o lugar do tio-avô como mordoma da Mansão Wayne, ajudando Bruce a se adaptar ao luto.</p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "📝 Conhecimento",
        "content": "<p>Sabe tudo que precisa saber sobre a vida da Bat-Família.</p>",
        "visibility": "public",
        "position": 3
      }
    ],
    "created": true,
    "card": {
      "icon": "🎩",
      "codename": "Nenhum",
      "age": "26 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Lian Harper": {
    "eyebrow": "🐱 Cheshire Cat · Filha de Roy Harper",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Lian Harper<br><strong>Codinome:</strong> Cheshire Cat<br><strong>Pai:</strong> Roy Harper (Arsenal)<br><strong>Mãe:</strong> Jade Nguyen (Cheshire)<br><strong>Status:</strong> Ativa<br><strong>Afiliação:</strong> Jovens Titãs (equipe de Jason Todd)</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Tristan Queen:</strong> Amiga de infância. Conversam frequentemente por mensagem. Cresceram juntos no círculo heroico (filhos de arqueiros/justiça).</li><li><strong>Jason Todd:</strong> Líder da equipe dela.</li><li><strong>Roy Harper:</strong> Pai. Arsenal (com prótese no braço).</li><li><strong>Connor Hawke:</strong> Amigo da família.</li></ul>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📝 Nota narrativa",
        "content": "<p>A amizade com Tristan é uma das poucas pontes que ele mantém com o círculo heroico. Lian está na equipe de Jason — o que cria uma ligação entre Tristan e os Jovens Titãs.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🐱",
      "codename": "Cheshire Cat",
      "age": "17 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Roy Harper": {
    "eyebrow": "🏹 Arsenal · Pai de Lian",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Roy Harper<br><strong>Codinome:</strong> Arsenal<br><strong>Idade:</strong> ~35 anos<br><strong>Status:</strong> Ativo<br><strong>Filha:</strong> Lian Harper (Cheshire Cat)<br><strong>Característica especial:</strong> Perdeu um dos braços e usa uma <strong>prótese</strong>. Continua sendo um arqueiro excelente.</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Connor Hawke:</strong> Amigo. Atuam juntos ocasionalmente.</li><li><strong>Mia Dearden (Speedy):</strong> Atuam juntos ocasionalmente.</li><li><strong>Lian Harper:</strong> Filha.</li><li><strong>Titãs (Dick Grayson):</strong> Atua com eles às vezes.</li></ul>",
        "visibility": "public",
        "position": 1
      }
    ],
    "created": true,
    "card": {
      "icon": "🏹",
      "codename": "Arsenal",
      "age": "~35 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "George Gandenzio Toombs": {
    "eyebrow": "",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong><b>George Gandenzio Toombs</b><br><strong>Idade: 65 anos</strong><br><strong>Local: Downtown</strong></p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "📖 História",
        "content": "<p>Dono do Bar One Bourbon, One Scotch, One Beer.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>É um senhor de idade com bastante atitude e que não tem medo de se posicionar.&nbsp;</p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li>Adicione uma habilidade.</li></ul>",
        "visibility": "public",
        "position": 3
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li>Adicione uma relação importante.</li></ul>",
        "visibility": "public",
        "position": 4
      }
    ],
    "created": true,
    "card": {
      "icon": "🍺",
      "codename": "Nenhum",
      "age": "65 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Michael Carter": {
    "eyebrow": "",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> <br><strong>Codinome:</strong> <br><strong>Idade:</strong> <br><strong>Local:</strong> </p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "📖 História",
        "content": "<p>Escreva aqui a história do personagem.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Descreva a personalidade do personagem.</p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li>Adicione uma habilidade.</li></ul>",
        "visibility": "public",
        "position": 3
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li>Adicione uma relação importante.</li></ul>",
        "visibility": "public",
        "position": 4
      }
    ],
    "created": true,
    "card": {
      "icon": "⏳",
      "codename": "Gladiador Dourado",
      "age": "33",
      "origin": "Humano do Século XXV",
      "status": "Ativo"
    }
  },
  "Rex Mason": {
    "eyebrow": "Referência · DC Database",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong>&nbsp;Rex Mason<br><strong>Codinome: Metamorpho</strong><br><strong>Idade:</strong> <br><strong>Origem:</strong> <br><strong>Status:</strong> <br><strong>Local:</strong> </p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "📖 História",
        "content": "<p>Escreva aqui a história do personagem.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Descreva a personalidade do personagem.</p>",
        "visibility": "public",
        "position": 2
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li>Adicione uma habilidade.</li></ul>",
        "visibility": "public",
        "position": 3
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li>Kendra: Aliado</li></ul>",
        "visibility": "public",
        "position": 4
      }
    ],
    "created": true,
    "card": {
      "icon": "👤",
      "codename": "Metamorpho",
      "age": "30",
      "origin": "Experimento Meta Humano",
      "status": "Ativo"
    }
  },
  "Leland Shaw": {
    "eyebrow": "🏢 CEO da Shaw Innovations",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Leland Shaw<br><strong>Idade:</strong> 52 anos<br><strong>Função:</strong> CEO da Shaw Innovations<br><strong>Local:</strong> Vanguard Bay – Ilha Solara</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Elegante, magro e de postura ereta. Cabelos grisalhos perfeitamente penteados para trás. Usa ternos minimalistas, caros e de cores neutras (cinza, preto ou azul-marinho). Seus olhos são frios e analíticos, como se estivesse constantemente processando dados. Tem um sorriso contido e monótono.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Se enxerga como um &quot;rei-filósofo&quot;. Busca a imortalidade através de experimentos (Projeto Ascensão). Seus funcionários o idolatram como um líder de culto.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🏢",
      "codename": "Nenhum",
      "age": "52 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Alden Mitchell": {
    "eyebrow": "☀️ Zenit · Ex-herói de Vanguard Bay",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Alden Mitchell<br><strong>Idade:</strong> 90+ anos<br><strong>Função:</strong> Zenit · Ex-herói de Vanguard Bay<br><strong>Local:</strong> Vanguard Bay – Ilha Solara</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Idoso franzino, encurvado, com cabelos brancos ralos e pele enrugada. Usa roupas velhas e surradas. Apesar da fragilidade, mantém uma postura rígida e olhos amargurados, cheios de ressentimento. Quando ativa seus poderes, emana uma luz dourada ofuscante.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>O primeiro herói da cidade. Agora, recluso e aposentado.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "☀️",
      "codename": "Zenit",
      "age": "90+ anos",
      "origin": "Meta-humano",
      "status": "Aposentado"
    }
  },
  "Geneviève Lachance": {
    "eyebrow": "🎨 Curadora da Galerie Vanguard",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Geneviève Lachance<br><strong>Idade:</strong> 45 anos<br><strong>Função:</strong> Curadora da Galerie Vanguard<br><strong>Local:</strong> Vanguard Bay – Ilha Solara</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Francesa típica, elegante e impecável. Cabelos loiros platinados, curtos ou em um chignon. Usa vestidos de grife, lenços de seda no pescoço e joias discretas, mas caríssimas. Tem um ar de superioridade e um sorriso irônico permanente.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Comanda uma fachada de bom gosto que, na verdade, é um mercado negro de arte roubada e artefatos místicos. Atende clientes como Maxwell Lord.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🎨",
      "codename": "Nenhum",
      "age": "45 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Marcos Jimenez": {
    "eyebrow": "📺 Âncora do VBN Nightly News",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Marcos Jimenez<br><strong>Idade:</strong> 47 anos<br><strong>Função:</strong> Âncora do VBN Nightly News<br><strong>Local:</strong> Vanguard Bay – Ilha Solara</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Apresentador clássico, de terno escuro, gravata e cabelos grisalhos perfeitamente penteados. Rosto confiável, sorriso profissional e voz grave e aveludada.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Âncora confiável. Fonte de notícias mais assistida da cidade.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "📺",
      "codename": "Nenhum",
      "age": "47 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Dr. Kenji Tanaka": {
    "eyebrow": "🌊 Oceanógrafo",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Dr. Kenji Tanaka<br><strong>Idade:</strong> 61 anos<br><strong>Função:</strong> Oceanógrafo<br><strong>Local:</strong> Vanguard Bay – Ilha Solara</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Cientista excêntrico, com cabelos bagunçados e grisalhos, óculos grossos de fundo de garrafa e jaleco cheio de manchas de produtos químicos. Tem olhos brilhantes e obsessivos, fala rápido e gesticula muito.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Defende teorias sobre ecossistemas inteligentes. É tratado como pária, mas pode ser uma fonte valiosa de informações submarinas.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🌊",
      "codename": "Nenhum",
      "age": "61 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Dr. Ahron Nax": {
    "eyebrow": "🔬 Diretor do Instituto de Oceanografia",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Dr. Ahron Nax<br><strong>Idade:</strong> 68 anos<br><strong>Função:</strong> Diretor do Instituto de Oceanografia<br><strong>Local:</strong> Vanguard Bay – Ilha Solara</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Cientista respeitável, com barba branca bem aparada, óculos de leitura e roupas formais. Mantém postura de autoridade acadêmica.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Lidera o melhor instituto de oceanografia da cidade e recebe dados secretos de Atlantes.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🔬",
      "codename": "Nenhum",
      "age": "68 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Silas": {
    "eyebrow": "🛎️ Concierge do The Starlight Grand Hotel",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Silas<br><strong>Idade:</strong> 48 anos<br><strong>Função:</strong> Concierge do The Starlight Grand Hotel<br><strong>Local:</strong> Vanguard Bay – Ilha Solara</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Impecável, de terno cinza ou preto, cabelos engraxados para trás. Movimentos suaves e silenciosos. Tem um sorriso enigmático e olhos que parecem saber de tudo, mas não contam nada.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Sabe os podres de todos e opera uma rede de informações valiosíssima.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🛎️",
      "codename": "Nenhum",
      "age": "48 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Lila Marlowe": {
    "eyebrow": "👻 Fantasma do Starlight Grand Hotel",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Lila Marlowe<br><strong>Idade:</strong> 20–30 anos quando faleceu, em 1930<br><strong>Função:</strong> Fantasma do Starlight Grand Hotel<br><strong>Local:</strong> Vanguard Bay – Ilha Solara</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Aparição bela e melancólica, de pele pálida e translúcida. Usa um vestido de gala da Era de Ouro, com lantejoulas e plumas. Tem cabelos ondulados e um olhar triste e perdido. Emite uma luz suave e fria.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Assombra a suíte presidencial, causando melancolia e desespero nos hóspedes, associados a &quot;suicídios&quot; inexplicáveis.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "👻",
      "codename": "Nenhum",
      "age": "20–30 anos quando faleceu, em 1930",
      "origin": "Aparição",
      "status": "Morta — aparição ativa"
    }
  },
  "Camila Vargas": {
    "eyebrow": "💼 Braço direito de Leland Shaw",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Camila Vargas<br><strong>Idade:</strong> 32 anos<br><strong>Função:</strong> Braço direito de Leland Shaw<br><strong>Local:</strong> Vanguard Bay – A Muralha</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Executiva de postura rígida. Cabelos escuros sempre presos em um coque impecável. Usa terninhos sob medida, de corte reto, sem adornos. Tem olhar de precisão cirúrgica, raramente esboça emoções e anda com passos firmes e decididos.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>A &quot;ação direta&quot; de Shaw. Leal à empresa, não necessariamente a ele.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "💼",
      "codename": "Nenhum",
      "age": "32 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Alia Hazari": {
    "eyebrow": "💾 Payload · Mercenária",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Alia Hazari<br><strong>Idade:</strong> 25 anos<br><strong>Função:</strong> Payload · Mercenária<br><strong>Local:</strong> Vanguard Bay – A Muralha</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Magra, de movimentos felinos. Cabelos escuros raspados de um lado ou presos. Veste roupas táticas, com couro, lycra e cintos de ferramentas. Seus olhos são atentos e frios. Quando em forma de dados, é descrita como um rastro de luz e código binário.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Espiã corporativa que se transforma em dados vivos. Rouba informações para quem pagar melhor e opera pelo ciberespaço.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "💾",
      "codename": "Payload",
      "age": "25 anos",
      "origin": "Meta-humana",
      "status": "Ativa"
    }
  },
  "Donovan Mason": {
    "eyebrow": "🏭 Diretor da Vanguard-Stagg Industries",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Donovan Mason<br><strong>Idade:</strong> 65 anos<br><strong>Função:</strong> Diretor da Vanguard-Stagg Industries<br><strong>Local:</strong> Vanguard Bay – A Muralha</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Corpulento, com ombros largos e rosto permanentemente avermelhado. Tem um &quot;sorriso de caçador&quot; que não esconde os dentes. Usa ternos caros que parecem sempre apertados demais e mantém olhos inquietos que nunca param de calcular.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Agressivo e nada sutil. Despreza Leland Shaw e resolve problemas com brutalidade através da Stagg Security.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🏭",
      "codename": "Nenhum",
      "age": "65 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Dra. Zara Kovač": {
    "eyebrow": "🧬 Geneticista da Vanguard-Stagg",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Dra. Zara Kovač<br><strong>Idade:</strong> 40 anos<br><strong>Função:</strong> Geneticista da Vanguard-Stagg<br><strong>Local:</strong> Vanguard Bay – A Muralha</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Magra, com olheiras profundas e permanentes. Cabelos castanhos com fios brancos, normalmente presos de forma desleixada. Veste jaleco amarrotado sobre roupas escuras, mantém os ombros tensos e evita contato visual prolongado.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Brilhante e assombrada. Lidera o antiético Projeto Meta-Quimera. Sua consciência pesa, mas a pressão de Donovan Mason a mantém na linha.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🧬",
      "codename": "Nenhum",
      "age": "40 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Dra. Anya Petrova": {
    "eyebrow": "🧪 Cientista governamental · A.R.G.U.S./D.E.O.",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Dra. Anya Petrova<br><strong>Idade:</strong> 55 anos<br><strong>Função:</strong> Cientista governamental · A.R.G.U.S./D.E.O.<br><strong>Local:</strong> Vanguard Bay – A Muralha</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Rosto severo e anguloso, cabelos grisalhos presos de forma prática e funcional. Usa jaleco branco impecável sobre roupas sóbrias. Carrega um silêncio mortal ao entrar em um ambiente e mantém olhos clínicos, sem calor humano.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Lidera uma inquisição contra meta-humanos, tratando-os como dados em vez de pessoas. Sua única superior respeitada era Amanda Waller.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🧪",
      "codename": "Nenhum",
      "age": "55 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Roxana \"Roxy\" Sharpe": {
    "eyebrow": "📱 Colunista do Sentinela Dourada",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Roxana &quot;Roxy&quot; Sharpe<br><strong>Idade:</strong> 31 anos<br><strong>Função:</strong> Colunista do Sentinela Dourada<br><strong>Local:</strong> Vanguard Bay – A Muralha</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Estilosa e moderna, com cabelos de mechas coloridas, unhas longas e impecáveis. Usa roupas da moda, óculos de sol de grife e está sempre com um smartphone na mão. Tem sorriso presunçoso e olhar de caçadora de cliques.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Amoral. Usa chantagem e drones para conseguir furos e trata meta-humanos como &quot;conteúdo&quot;.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "📱",
      "codename": "Roxy",
      "age": "31 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Antoine Devereaux": {
    "eyebrow": "🍷 Maître do The Ledger",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Antoine Devereaux<br><strong>Idade:</strong> 64 anos<br><strong>Função:</strong> Maître do The Ledger<br><strong>Local:</strong> Vanguard Bay – A Muralha</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Magro, elegante, com bigode e costeletas bem aparados. Olhos cansados de quem já viu de tudo. Veste sempre smoking ou terno impecável, com gravata borboleta, sotaque francês suave e maneirismos refinados.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Ex-MI6. Vende segredos valiosos com a mesma discrição de um sommelier servindo vinho.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🍷",
      "codename": "Nenhum",
      "age": "64 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Matheus Silva": {
    "eyebrow": "👻 O Fantasma · Líder dos Espectros",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Matheus Silva<br><strong>Idade:</strong> 30 anos<br><strong>Função:</strong> O Fantasma · Líder dos Espectros<br><strong>Local:</strong> Vanguard Bay – Coral Gate</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Matheus Solis Silva é latino, com porte atlético de ex-soldado de operações especiais. Usa cabelo raspado ou muito curto, barba por fazer e olhar de sobrevivente. Veste roupas casuais, mas funcionais, como jaqueta de couro e botas.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Se considera o nobre protetor do bairro. Controla o contrabando em Coral Gate, mas mantém um código de honra rígido.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "👻",
      "codename": "O Fantasma",
      "age": "30 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Oficial Leo Martinez": {
    "eyebrow": "🚓 Policial do 5º Distrito",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Oficial Leo Martinez<br><strong>Idade:</strong> 28 anos<br><strong>Função:</strong> Policial do 5º Distrito<br><strong>Local:</strong> Vanguard Bay – Coral Gate</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Jovem e atlético, com rosto limpo e olhar ainda esperançoso e idealista. Mantém o uniforme sempre impecável, embora pareça um pouco deslocado em meio ao colorido de Coral Gate. Tem um sorriso fácil.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Patrulha o bairro onde cresceu. Vê meta-humanos como a &quot;cavalaria&quot; de que a polícia precisa e admira heróis abertamente.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🚓",
      "codename": "Nenhum",
      "age": "28 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Mama Montoya": {
    "eyebrow": "☕ Proprietária do café La Ventanita",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Mama Montoya<br><strong>Idade:</strong> 70 anos<br><strong>Função:</strong> Proprietária do café La Ventanita<br><strong>Local:</strong> Vanguard Bay – Coral Gate</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Senhora baixinha, de cabelos grisalhos em coque e avental sobre vestido florido. Tem olhos vivos e atentos, rosto marcado por rugas de expressão e quase sempre um sorriso cúmplice ou uma xícara de café na mão.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Matriarca não oficial de Coral Gate. Sabe exatamente em quem confiar.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "☕",
      "codename": "Nenhum",
      "age": "70 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Hector Ramos": {
    "eyebrow": "🌿 Proprietário da Botânica Raízes & Ramos",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Hector Ramos<br><strong>Idade:</strong> 70 anos<br><strong>Função:</strong> Proprietário da Botânica Raízes &amp; Ramos<br><strong>Local:</strong> Vanguard Bay – Coral Gate</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Sereno, de pele morena e cabelos brancos. Tem olhar observador e profundo, como se lesse a alma das pessoas. Veste roupas simples, geralmente uma guayabera branca ou de linho, e costuma mexer em ervas.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Vende artigos místicos. Dizem que contacta o outro mundo. Seu passado em Santa Prisca guarda mistérios.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🌿",
      "codename": "Nenhum",
      "age": "70 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Lina Ramos": {
    "eyebrow": "🌿 Sobrinha de Hector Ramos",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Lina Ramos<br><strong>Idade:</strong> 21 anos<br><strong>Função:</strong> Sobrinha de Hector Ramos<br><strong>Local:</strong> Vanguard Bay – Coral Gate</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Jovem, de cabelos escuros e rebeldes, com estilo despojado, jaqueta jeans e camiseta de banda. Tem um olhar confiante e pronto para briga. É recém-chegada de Metrópolis.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Ajuda na loja do tio e já se meteu em várias confusões no bairro.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🌿",
      "codename": "Nenhum",
      "age": "21 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Dra. Ana Cruz": {
    "eyebrow": "🩺 Médica da Clínica da Comunidade",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Dra. Ana Cruz<br><strong>Idade:</strong> 34 anos<br><strong>Função:</strong> Médica da Clínica da Comunidade<br><strong>Local:</strong> Vanguard Bay – Coral Gate</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Rosto cansado, mas gentil. Cabelos escuros presos em um rabo de cavalo prático. Veste jaleco branco sobre roupas casuais. Tem olheiras de quem trabalha horas extras, mas um sorriso acolhedor.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Voluntária na clínica gratuita e principal fonte de cuidados para moradores sem seguro.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🩺",
      "codename": "Nenhum",
      "age": "34 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Pops Carter": {
    "eyebrow": "🎣 Velho pescador",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Pops Carter<br><strong>Idade:</strong> 73 anos<br><strong>Função:</strong> Velho pescador<br><strong>Local:</strong> Vanguard Bay – Coral Gate</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Idoso, com pele enrugada e queimada de sol, barba e cabelos brancos e bagunçados. Usa roupas de pescador, boné, colete e botas de borracha. Tem olhos miúdos e costuma carregar um cachimbo ou cigarro.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Jura ter visto &quot;algo&quot; se movendo sob a areia da Praia da Concha.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🎣",
      "codename": "Pops",
      "age": "73 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Lucia Ortega": {
    "eyebrow": "📣 Ativista comunitária",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Lucia Ortega<br><strong>Idade:</strong> 26 anos<br><strong>Função:</strong> Ativista comunitária<br><strong>Local:</strong> Vanguard Bay – Coral Gate</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Latina, de cabelos crespos ou ondulados, presos ou soltos. Rosto determinado e pele morena. Usa roupas confortáveis para protesto e frequentemente carrega cartazes e um megafone.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Lidera protestos contra a privatização da Praia da Concha.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "📣",
      "codename": "Nenhum",
      "age": "26 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Dante Rodrigues": {
    "eyebrow": "🏀 Astro do basquete · Vanguard Vipers",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Dante Rodrigues<br><strong>Idade:</strong> 20 anos<br><strong>Função:</strong> Astro do basquete · Vanguard Vipers<br><strong>Local:</strong> Vanguard Bay – Coral Gate</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Atleta alto, acima de 1,90 m, com porte físico definido, pele morena, sorriso carismático e genuíno. Usa cabelo black power ou trançado, roupas esportivas ou ternos despojados.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Humilde e carismático. Usa a fama para ajudar crianças pobres.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🏀",
      "codename": "Inferno",
      "age": "20 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "General Markov": {
    "eyebrow": "🎖️ Líder da Irmandade Markoviana",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> General Markov<br><strong>Idade:</strong> 54 anos<br><strong>Função:</strong> Líder da Irmandade Markoviana<br><strong>Local:</strong> Vanguard Bay – Downtown</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Figura enigmática, nunca descrita em detalhes. Provavelmente veste ternos militares ou sóbrios, com condecorações. Tem postura rígida e olhar calculista, mantendo-se sempre nos bastidores.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Lidera a célula do Leste Europeu em Downtown, focada em espionagem e contrabando de tecnologia da Intergangue.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🎖️",
      "codename": "General",
      "age": "54 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Flinch Archer": {
    "eyebrow": "🚓 Chefe de Polícia da V-BPD",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Flinch Archer<br><strong>Idade:</strong> 55–65 anos<br><strong>Função:</strong> Chefe de Polícia da V-BPD<br><strong>Local:</strong> Vanguard Bay – Downtown</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Corpulento, com ombros cansados e postura que revela o peso do cargo. Rosto marcado por rugas profundas, bigode grisalho e olhos de desconfiança. Veste o uniforme com o paletó desabotoado e a gravata frouxa.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Velha guarda. Tem código de honra inabalável, mas odeia heróis que ignoram a lei. Pode ignorá-los ou caçá-los ativamente.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🚓",
      "codename": "Nenhum",
      "age": "55–65 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Juíza Mariana Sandoval": {
    "eyebrow": "⚖️ Magistrada de Vanguard Bay",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Juíza Mariana Sandoval<br><strong>Idade:</strong> 50–60 anos<br><strong>Função:</strong> Magistrada de Vanguard Bay<br><strong>Local:</strong> Vanguard Bay – Downtown</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Imponente, de estatura média para alta. Cabelos grisalhos presos em um coque severo, voz grave carregada de ordem e comando. Veste togas impecáveis ou ternos sociais de corte clássico e mantém olhos sérios e penetrantes.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Bastião de empatia em meio à corrupção judicial. Tem relação conturbada com meta-humanos, especialmente após descobrir que seu sobrinho Isaac, o Inerte, pode ser um deles.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "⚖️",
      "codename": "Nenhum",
      "age": "50–60 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Julia Reyes": {
    "eyebrow": "🏛️ Prefeita de Vanguard Bay",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Julia Reyes<br><strong>Idade:</strong> 29 anos<br><strong>Função:</strong> Prefeita de Vanguard Bay<br><strong>Local:</strong> Vanguard Bay – Downtown</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Gentil, de estatura média para baixa. Cabelos castanhos e longos presos em um rabo de cavalo. Tem voz doce e triste de alguém sobrecarregada, veste ternos sociais nem sempre bem passados e mantém olhar cansado.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Começou a carreira determinada a enfrentar a corrupção da cidade, mas se viu sobrecarregada pelas verdades e conexões escondidas da Cidade Dourada. É bastante precavida quando meta-humanos começam a aparecer por considerá-los um tipo de ameaça difícil de administrar.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🏛️",
      "codename": "Nenhum",
      "age": "29 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Sofia Navarro": {
    "eyebrow": "🎤 Repórter de campo da VBN",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Sofia Navarro<br><strong>Idade:</strong> 33 anos<br><strong>Função:</strong> Repórter de campo da VBN<br><strong>Local:</strong> Vanguard Bay – Downtown</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Latina, de cabelos escuros e lisos, frequentemente presos ou ao vento. Tem postura determinada e olhar curioso. Veste blazer e calça social, mas sempre pronta para correr, usando tênis confortáveis. Carrega o microfone como extensão do corpo.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Serva da verdade, inspirada em Lois Lane. Não tem medo de batalhas.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🎤",
      "codename": "Nenhum",
      "age": "33 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Boris Borkov": {
    "eyebrow": "🐻 O Urso · Líder da Bratva Volkov",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Boris Borkov<br><strong>Idade:</strong> 45–55 anos<br><strong>Função:</strong> O Urso · Líder da Bratva Volkov<br><strong>Local:</strong> Vanguard Bay – O Dique</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Uma autêntica montanha de músculos. Pescoço grosso, cabeça raspada e corpo coberto por tatuagens de prisão russas, incluindo estrelas e cúpulas de igreja. Rosto largo, com cicatrizes e olhos gelados de uma paciência assustadora.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Controla o Dique com mão de ferro. Especializado em contrabando de armas de alta tecnologia e tráfico de meta-humanos.</p>",
        "visibility": "spoiler",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🐻",
      "codename": "O Urso",
      "age": "45–55 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Osias \"Osi\" Rivers": {
    "eyebrow": "📰 Repórter investigativo do Farol de Vanguard",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Osias &quot;Osi&quot; Rivers<br><strong>Idade:</strong> 40–50 anos<br><strong>Função:</strong> Repórter investigativo do Farol de Vanguard<br><strong>Local:</strong> Vanguard Bay – O Dique</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Homem de aparência cansada, mas obstinada. Usa roupas simples, possivelmente um sobretudo surrado, com caderno e caneta sempre à mão. Tem olhos inquisitivos e cabelos bagunçados.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Jornalista tradicional. Obcecado em provar que Leland Shaw é uma fraude.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "📰",
      "codename": "Osi",
      "age": "40–50 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "Dra. Helen Finch": {
    "eyebrow": "🔬 Chefe de Criminologia Forense do VBPI",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Dra. Helen Finch<br><strong>Idade:</strong> 34 anos<br><strong>Função:</strong> Chefe de Criminologia Forense do VBPI<br><strong>Local:</strong> Vanguard Bay – O Dique</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Mulher séria, de cabelos curtos e óculos de grau. Veste sempre um jaleco branco sobre roupas práticas e tem olhar analítico de cientista forense.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Desenvolveu o programa &quot;Análise de Resíduos Meta-humanos&quot;.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "🔬",
      "codename": "Nenhum",
      "age": "34 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  },
  "Brigitte Oliveira": {
    "eyebrow": "⛵ Campeã de regatas",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Brigitte Oliveira<br><strong>Idade:</strong> 22 anos<br><strong>Função:</strong> Campeã de regatas<br><strong>Local:</strong> Vanguard Bay – O Dique</p>",
        "visibility": "public",
        "position": 0
      },
      {
        "title": "👁️ Aparência",
        "content": "<p>Brasileira, de cabelos longos ao vento, corpo atlético e bronzeado pelo sol da Flórida. Rosto expressivo e sincero, sem muitos rodeios. Veste roupas de esporte náutico, como regata, bermuda e tênis de barco.</p>",
        "visibility": "public",
        "position": 1
      },
      {
        "title": "📖 Perfil",
        "content": "<p>Perfeccionista e dedicada. Alvo de boatos de ser atlante, que ela nega.</p>",
        "visibility": "public",
        "position": 2
      }
    ],
    "created": true,
    "card": {
      "icon": "⛵",
      "codename": "Nenhum",
      "age": "22 anos",
      "origin": "Humana",
      "status": "Ativa"
    }
  }
};

})();
