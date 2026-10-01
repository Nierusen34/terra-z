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
        "content": "<p><strong>Nome:</strong> Tristan Queen<br><strong>Codinome:</strong> Ranger<br><strong>Idade:</strong> 20 anos (nascido em 2007)<br><strong>Pais:</strong> Oliver Queen (biológico) e Dinah Lance (biológica)<br><strong>Irmãos:</strong> Connor Hawke (meio-irmão paterno)<br><strong>Local:</strong> Vanguard Bay – Downtown (cobertura)</p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Cresceu em Star City até os 12 anos, quando presenciou a discussão entre os pais — Dinah partiu para Gotham logo depois. Aos 13, perdeu o pai para o bolsão dimensional. Foi criado pelo meio-irmão Connor durante o luto.</p><p>Aos 15 anos, decidiu ir para Gotham treinar com Jason Todd. Oliver se opôs e parou de falar com ele a partir daí — teimosia e orgulho. Tristan treinou com Jason entre 2022 e 2025, aprendendo arco tático, furtividade e rastreamento. Em 2026, mudou-se para Vanguard Bay, onde vive em uma cobertura no Downtown sob o codinome <em>Ranger</em>.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Frio, calculista, independente e reservado. Mantém controle emocional sob tensão e sempre tem um plano. Não é movido por ressentimento — suas escolhas vêm de dentro, não de mágoas.</p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Arco e flecha:</strong> tático e preciso. Aprendido com Oliver, Connor e Jason.</li><li><strong>Combate corpo a corpo:</strong> letal. Aprendido com Dinah Lance.</li><li><strong>Furtividade:</strong> infiltração e movimento silencioso (com Jason).</li><li><strong>Rastreamento:</strong> seguir alvos em ambiente urbano.</li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Oliver (pai):</strong> Relação fraturada — mas o silêncio parte de Oliver, não de Tristan. Oliver é teimoso e orgulhoso e não aceita a escolha do filho de ir para Gotham em 2022.</li><li><strong>Dinah (mãe):</strong> Distante, mas sem culpa de Tristan. A culpa é dela — por ter ido para Gotham em 2019 e não ter estado presente em 2020. Conversam por mensagem.</li><li><strong>Connor (irmão):</strong> Irmãos próximos. Connor é o elo de comunicação com a família — figura fraterna estável.</li><li><strong>Jason Todd:</strong> Mentor e figura fraterna oposta a Connor — o contraponto rebelde ao irmão estável.</li><li><strong>Lian Harper:</strong> Amiga de infância, filha de Roy Harper. Conversam frequentemente por mensagem. Atualmente é a Cheshire Cat nos Titãs de Jason.</li></ul>"
      }
    ],
    "card": {
      "icon": "🏹",
      "codename": "Ranger",
      "age": "20 anos",
      "origin": "Humano",
      "status": "Ativo"
    }
  },
  "George Gandenzio Toombs": {
    "eyebrow": "",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong><b>George Gandenzio Toombs</b><br><strong>Idade: 65 anos</strong><br><strong>Local: Downtown</strong></p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Dono do Bar One Bourbon, One Scotch, One Beer.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>É um senhor de idade com bastante atitude e que não tem medo de se posicionar.&nbsp;</p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li>Adicione uma habilidade.</li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li>Adicione uma relação importante.</li></ul>"
      }
    ],
    "created": true,
    "card": {
      "icon": "🍺",
      "summary": ""
    }
  },
  "Camila Vargas": {
    "eyebrow": "🧠 Telepata · Braço-direito de Shaw",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Camila Vargas<br><strong>Idade:</strong> 35–45 anos<br><strong>Origem:</strong> Humana<br><strong>Status:</strong> Ativa<br><strong>Papel:</strong> Braço-direito de Leland Shaw (CEO da Shaw Innovations)<br><strong>Local:</strong> Vanguard Bay</p>"
      },
      {
        "title": "🧠 Poderes",
        "content": "<ul><li><strong>Telepatia:</strong> recém-desperta — ainda em desenvolvimento.</li><li><strong>Elo com M'ark:</strong> criado acidentalmente ao despertar os poderes. Conversam periodicamente.</li></ul>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Estratégica, corajosa. Leal à empresa (Shaw Innovations), mas <strong>não a Leland Shaw</strong>. Esconde seus poderes meta-humanos dele.</p>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>M'ark:</strong> Elo telepático. Sabe que ele está preso e em perigo, mas não sabe a localização.</li><li><strong>Leland Shaw:</strong> Chefe. Leal à empresa, não a ele.</li><li><strong>Tristan Queen:</strong> Aliada. Comunicam-se por ligação ou telepatia.</li><li><strong>Riot:</strong> Aliada. Comunicam-se por ligação ou telepatia.</li></ul>"
      },
      {
        "title": "🎯 Objetivo",
        "content": "<p>Procurar M'ark junto com Tristan e Riot. Propôs a aliança — já que a Sumdac também é parte do objetivo deles.</p>"
      }
    ]
  },
  "Oliver Queen": {
    "eyebrow": "🏹 O Queen · Agente da JLU",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Oliver Jonas Queen<br><strong>Codinome:</strong> O Queen (ex-Arqueiro Verde)<br><strong>Idade:</strong> 47 anos (nascido em 1980)<br><strong>Status:</strong> Vivo — ressuscitado em 2022<br><strong>Papel:</strong> Agente da Liga da Justiça Sem Limites<br><strong>Local:</strong> Gotham (investigando anomalia)</p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Fundador do manto do Arqueiro Verde em Star City. Em 2020, uma explosão o sugou para um bolsão dimensional. Passou 2 anos isolado — o que lhe deixou um <strong>trauma emocional profundo</strong>: não consegue se afastar de Dinah por muito tempo. Resgatado por Cyborg e Flash em 2022. Faz parte da equipe de resgate de Riot (com Kendra, Metamorfo e Gladiador Dourado). Não reassumiu o manto — Connor mantém o título. Tornou-se agente da JLU.</p><p>Em 2022, quando Tristan decidiu ir para Gotham treinar com Jason, Oliver se opôs e <strong>parou de falar com o filho</strong> — teimosia e orgulho.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Teimoso e orgulhoso. Calmo com ressalvas, mas ainda impulsivo em momentos-chave. Carrega trauma emocional do bolsão dimensional — não consegue se afastar de Dinah por muito tempo. Sem problemas de saúde físicos. Fala sobre Tristan com Dinah e Connor, mas não diretamente com o filho.</p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Arco e flecha:</strong> mestre arqueiro nível lendário. Ainda tem o arco.</li><li><strong>Combate corpo a corpo:</strong> treinado, mas não é o foco.</li><li><strong>Táticas:</strong> estrategista experiente.</li><li><strong>Liderança:</strong> ex-líder da JLU em missões.</li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Dinah Lance:</strong> Esposa. Reataram. Não consegue se afastar dela por muito tempo.</li><li><strong>Tristan Queen:</strong> Filho. Silêncio total por parte de Oliver desde 2022 — teimosia e orgulho. Não gosta que Tristan esteja em Vanguard Bay, mas reconhece que é melhor do que Gotham.</li><li><strong>Connor Hawke:</strong> Filho que assumiu o manto. Respeito mútuo.</li><li><strong>Kendra Saunders:</strong> Contato regular. Colegas e amigos.</li><li><strong>Jason Todd:</strong> Não aprova que ele tenha treinado Tristan.</li></ul>"
      }
    ]
  },
  "Dick Grayson": {
    "eyebrow": "🦅 Asa Noturna · Líder dos Titãs",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Richard John Grayson<br><strong>Codinome:</strong> Asa Noturna<br><strong>Idade:</strong> 29 anos (nascido em 1998)<br><strong>Status:</strong> Ativo<br><strong>Papel:</strong> Líder dos Titãs adultos. Herói de Blüdhaven.<br><strong>Local:</strong> Blüdhaven</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Carismático, líder natural, idealista. Rivalidade de irmãos com Jason ainda existe. Namorando Bárbara Gordon.</p>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Barbara Gordon:</strong> Namorada.</li><li><strong>Bruce:</strong> Pai adotivo. Respeito.</li><li><strong>Jason Todd:</strong> Rivalidade de irmãos. Jason criou sua própria equipe para provocá-lo.</li><li><strong>Tim Drake:</strong> Confiança.</li><li><strong>Damian Wayne:</strong> Mentoria.</li><li><strong>Tristan Queen:</strong> Conhece, mas poucas interações — ocupado em Gotham e Blüdhaven.</li></ul>"
      }
    ]
  },
  "M'gann M'orzz": {
    "eyebrow": "🟢 Miss Martian · Marciana Branca",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> M'gann M'orzz (Megan Morse na Terra)<br><strong>Idade:</strong> ~39 anos<br><strong>Origem:</strong> Marciana Branca fugitiva<br><strong>Papel:</strong> Mãe de M'ark. Ex-Novos Titãs.<br><strong>Local atual:</strong> A caminho de Vanguard Bay</p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Chegou à Terra em ~2000–2002, fugindo do genocídio em Marte. Acolhida por J'onn, que a ajudou a se passar por Marciana Verde. Em 2003–2004, foi enganada e violentada por Armek. Criou M'ark em segredo por 20 anos. Terminou com Conner em 2019 (motivo real: o peso do segredo), mas reataram em 2021 quando ele descobriu M'ark. Apoiou a ida do filho para Vanguard Bay, mas com preocupação — é a primeira vez em anos que não estarão juntos.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Carrega múltiplos traumas: a violência de Armek, a mentira sobre sua raça, o segredo de seu filho. Protetora, mas aprendendo a confiar no filho. Relação sólida com Conner em 2027.</p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Telepatia:</strong> poderosa.</li><li><strong>Telecinese:</strong> sim.</li><li><strong>Metamorfose:</strong> sim.</li><li><strong>Intangibilidade:</strong> sim.</li><li><strong>Invisibilidade:</strong> sim.</li><li><strong>Voo:</strong> sim.</li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>M'ark:</strong> Filho. Superprotetora, mas apoiou a ida dele para Vanguard Bay — com preocupação.</li><li><strong>Conner Kent:</strong> Namorado. Relação sólida em 2027.</li><li><strong>J'onn J'onzz:</strong> Mentor e figura paterna.</li><li><strong>Armek:</strong> Violentador (falecido).</li><li><strong>Novos Titãs:</strong> Ex-membro.</li></ul>"
      }
    ]
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
    ]
  },
  "Michael Carter": {
    "eyebrow": "",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> <br><strong>Codinome:</strong> <br><strong>Idade:</strong> <br><strong>Local:</strong> </p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Escreva aqui a história do personagem.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Descreva a personalidade do personagem.</p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li>Adicione uma habilidade.</li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li>Adicione uma relação importante.</li></ul>"
      }
    ],
    "created": true,
    "card": {
      "icon": "⏳",
      "summary": "Codinome: Gladiador Dourado"
    }
  },
  "Tim Drake": {
    "eyebrow": "📚 Ex-Robin · Vida civil",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Timothy Jackson Drake<br><strong>Idade:</strong> 20 anos (nascido em 2007)<br><strong>Status:</strong> Aposentado — vida civil<br><strong>Namorado:</strong> Bernard Dowd<br><strong>Local:</strong> Gotham (como civil)</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Focado em si mesmo — prioriza sua vida pessoal, amorosa e independência. Evita assuntos sobre a Bat-Família, mas mantém contato com todos. Foca na vida fora do vigilantismo.</p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Em 2019 (aos 12 anos), deduziu as identidades de Bruce e Dick — tornou-se Robin. Em 2022, com a morte de Alfred, começou a sentir que a vida de vigilante não era para ele. Passou o manto para Damian, tornou-se Robin Vermelho por um tempo e, eventualmente, <strong>aposentou-se</strong>. Em 2027, vive como civil em Gotham e namora Bernard Dowd.</p>"
      }
    ]
  },
  "Riot": {
    "eyebrow": "💀 Clone Czarniano · Aprendiz de Kendra",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Riot<br><strong>Idade:</strong> Aparência 20 anos (cronológico: 5)<br><strong>Origem:</strong> Clone da Cadmus, resgatado em 2022<br><strong>Mãe adotiva:</strong> Kendra Saunders (Hawkgirl)<br><strong>Pai genético:</strong> Lobo (Czarniano)<br><strong>Status:</strong> Em missão pessoal em Vanguard Bay (sem local fixo)</p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Criado por uma equipe dissidente da Cadmus — que depois se tornaria a organização <strong>Sumdac</strong> — como clone do Lobo. Seria descartado, mas foi resgatado em 2022 na <em>Tower of Fate</em> por uma equipe formada por <strong>Kendra Saunders, Oliver Queen, Metamorfo (Rex Mason) e Gladiador Dourado (Michael Carter)</strong>.</p><p>Durante o resgate, o clone bebê mordeu Lobo — e o Czarniano, divertido, prometeu dar 50 anos antes de caçá-lo. Kendra o criou por 5 anos (2022–2027), treinando-o intensamente e <strong>contando a ele sobre a promessa</strong>. Em janeiro de 2027, Kendra o apoiou a ir para Vanguard Bay para investigar a Sumdac sozinho — ele não fugiu.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Rebelde no geral — odeia autoridade e regras — mas <strong>respeita e gosta muito de Kendra</strong>, sentindo-se calmo na presença dela. Impulsivo, age antes de pensar. Carrega um <em>rage</em> interno constante, e sua consciência às vezes divaga entre memórias genéticas de Lobo e memórias próprias — quando isso acontece, ele anda sem rumo, quase como um sonâmbulo. Em relação ao destino de 2072, tende a <strong>desafiar</strong> em vez de aceitar.</p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Superforça:</strong> capacidade física sobre-humana.</li><li><strong>Resistência:</strong> suporta danos extremos.</li><li><strong>Regeneração acelerada:</strong> cura rápida.</li><li><strong>Crescimento acelerado:</strong> aparência de 20 anos em apenas 5 de vida.</li><li><strong>Estilo de luta:</strong> cru e bruto — mesmo treinado por Kendra, luta por instinto. Sem armas.</li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Kendra (mãe adotiva):</strong> Respeito e afeto genuínos. Sente-se calmo com ela. A rebeldia dele dificilmente é direcionada a ela.</li><li><strong>Lobo:</strong> Origem genética. Promessa de caça em 2072. Riot sente raiva e é perturbado pelas memórias genéticas.</li><li><strong>Oliver, Metamorfo e Gladiador Dourado:</strong> Colegas da missão de resgate de 2022. Relação positiva, mas distante — sempre checavam com Kendra se ele estava bem.</li><li><strong>Tristan Queen:</strong> Dois estranhos que estão se ajudando em um mesmo objetivo. Riot confia em Tristan por conhecer Oliver — como se a familiaridade fosse uma garantia.</li></ul>"
      },
      {
        "title": "🆕 A ORGANIZAÇÃO SUMDAC",
        "content": "<p>A equipe da Cadmus que criou Riot era <strong>dissidente</strong>. Separaram-se da Cadmus e formaram a <strong>Sumdac</strong> — mesma logotipo da Cadmus, mas toda em <strong>vermelho</strong>. Estão operando em <strong>Vanguard Bay</strong>, fazendo experimentos. Riot descobriu isso durante eventos recentes.</p>"
      }
    ],
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
        "content": "<p><strong>Nome:</strong> M'ark (provisório — o jogador definirá o nome final)<br><strong>Idade:</strong> 23 anos (nascido em 2004)<br><strong>Mãe:</strong> M'gann M'orzz (Miss Martian)<br><strong>Pai biológico:</strong> Armek (falecido, Marciano Branco)<br><strong>Criação:</strong> Criado por M'gann e J'onn J'onzz<br><strong>Status:</strong> <strong>Prisioneiro da Sumdac</strong> — em local secreto</p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Concebido em 2003–2004, quando Armek — um Marciano Branco cruel — enganou e violentou M'gann na Terra. J'onn descobriu, viajou a Marte e matou Armek antes que ele soubesse da gravidez. Criado em segredo por M'gann e J'onn até 2021, quando Conner descobriu sua existência.</p><p>Em outubro/novembro de 2026, foi apresentado publicamente como um <strong>Marciano Verde sobrevivente de uma colônia perdida</strong> — identidade que ele <strong>concordou</strong> em assumir. Em dezembro de 2026, viajou para Vanguard Bay. Ao chegar, foi <strong>emboscado pela Sumdac</strong> e capturado. A Sumdac quer estudar seu DNA alienígena.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p><em>A definir pelo jogador.</em></p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Telepatia:</strong> confirmada.</li><li><strong>Telecinese:</strong> confirmada.</li><li><strong>Intangibilidade:</strong> confirmada.</li><li><strong>Invisibilidade:</strong> confirmada.</li><li><strong>Disfarce marciano:</strong> confirmado (usa forma Verde publicamente).</li><li><em>Outros poderes a definir pelo jogador.</em></li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<p><em>Todas as relações ainda a definir com o jogador (M'gann, J'onn, Conner, Armek).</em></p>"
      },
      {
        "title": "🆕 O CATIVEIRO E CAMILA VARGAS",
        "content": "<p><strong>Como foi capturado:</strong> emboscado pela Sumdac ao chegar em Vanguard Bay.<br><strong>Motivo:</strong> estudar seu DNA alienígena.<br><strong>Duração:</strong> não sabe quantos dias está preso. Perdeu a noção do tempo.<br><strong>Quem sabe:</strong> ninguém — nem M'gann, nem J'onn, nem Conner. <strong>Apenas Camila Vargas.</strong></p><p><strong>Camila Vargas</strong> é uma meta-humana recém-desperta (telepata), braço-direito de Leland Shaw na Shaw Innovations. Ao despertar seus poderes, criou acidentalmente um <strong>elo telepático</strong> com M'ark. Ela não sabe a localização dele, mas sabe que ele está preso e em perigo. É leal à empresa, mas <strong>não a Shaw</strong>, e esconde seus poderes dele. Propôs uma <strong>aliança com Tristan e Riot</strong> para resgatar M'ark — já que a Sumdac também é parte do objetivo deles. A Sumdac não sabe do elo.</p>"
      },
      {
        "title": "💀 A VOZ DE ARMek",
        "content": "<p>Às vezes, M'ark <strong>conversa com Armek na própria cabeça</strong>. A natureza disso ainda não foi definida — pode ser alucinação, loucura (herança genética) ou um resquício da existência de seu falecido pai. Um dos maiores mistérios do personagem.</p>"
      }
    ],
    "card": {
      "icon": "🟢",
      "codename": "",
      "age": "23 anos",
      "origin": "Marciano Branco",
      "status": "Ativo"
    }
  }
};

})();
