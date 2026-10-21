(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Distritos, pontos de interesse e locais estratégicos canônicos de Vanguard Bay.
window.TerraZData.districts = [
  {
    "id": "a-muralha",
    "name": "A Muralha",
    "icon": "💎",
    "type": "Centro Corporativo",
    "summary": "Centro financeiro e corporativo de Vanguard Bay, dominado por arranha-céus, grandes empresas e uma atmosfera fria e competitiva.",
    "locations": [
      "Shaw Spire",
      "Vanguard-Stagg Pinnacle",
      "Banco Central de Vanguard Bay",
      "Farol de Vanguard",
      "A Sentinela Dourada",
      "The Ledger",
      "O Comutador",
      "A Pira"
    ],
    "pointsOfInterest": [
      {
        "name": "Shaw Spire",
        "kind": "Corporativo",
        "description": "Arranha-céu mais alto da cidade, com 110 metros, e sede da Shaw Innovations.",
        "spoiler": "No topo ficam o laboratório da I.A. Paragon e a antena da rede Aura Solar."
      },
      {
        "name": "Vanguard-Stagg Pinnacle",
        "kind": "Corporativo",
        "description": "Segundo maior arranha-céu de Vanguard Bay e sede da Vanguard-Stagg Industries.",
        "spoiler": "Os subsolos abrigam laboratórios da Divisão Prometeus."
      },
      {
        "name": "Banco Central de Vanguard Bay",
        "kind": "Financeiro",
        "description": "Instituição que guarda as fortunas das famílias mais antigas da cidade. Segundo a lenda local, nunca foi roubado."
      },
      {
        "name": "Farol de Vanguard",
        "kind": "Mídia",
        "description": "Jornal tradicional instalado em um prédio histórico de tijolos. Osias “Osi” Rivers atua como repórter investigativo."
      },
      {
        "name": "A Sentinela Dourada",
        "kind": "Mídia",
        "description": "Tabloide digital de alta rotatividade, conhecido pela cobertura agressiva e pela colunista Roxana “Roxy” Sharpe."
      },
      {
        "name": "The Ledger",
        "kind": "Restaurante",
        "description": "Restaurante de luxo no 60º andar, usado com frequência para encontros entre CEOs.",
        "spoiler": "O maître Antoine Devereaux é ex-MI6 e negocia segredos com extrema discrição."
      },
      {
        "name": "O Comutador",
        "kind": "Clandestino",
        "description": "Data center clandestino e ponto de encontro de hackers.",
        "spoiler": "Payload circula pelo local e o grupo No-Face usa a estrutura para compra e venda de informações sigilosas."
      },
      {
        "name": "A Pira",
        "kind": "Arena",
        "description": "Arena moderna de vidro e metal, casa do time de basquete Vanguard Bay Vipers. O complexo inclui o restaurante A Pira Grill."
      }
    ],
    "note": null,
    "image": {
      "src": "images/districts/a-muralha.webp",
      "alt": "Distrito corporativo de A Muralha ao anoitecer, com a Shaw Spire iluminada em azul e drones sobrevoando a avenida",
      "caption": "A Muralha — o centro corporativo, com a Shaw Spire dominando o horizonte."
    },
    "edit": {
      "caption": {
        "id": "tz-0052",
        "legacyId": "e_51"
      },
      "title": {
        "id": "tz-0053",
        "legacyId": "e_52"
      },
      "details": {
        "id": "tz-0054",
        "legacyId": "e_53"
      }
    }
  },
  {
    "id": "coral-gate",
    "name": "Coral Gate",
    "icon": "🌴",
    "type": "Bairro Latino",
    "summary": "Bairro de raízes latinas fundado por imigrantes cubanos, marcado pela vida nas ruas, comércio local e forte identidade comunitária.",
    "locations": [
      "Parque de los Héroes Caídos",
      "Aquário de Vanguard Bay",
      "La Ventanita",
      "El Malecón",
      "Bay Marketplace",
      "Botânica Raízes & Ramos",
      "Clínica da Comunidade",
      "Rumba & Samba Room",
      "Vanguard Bay General Hospital",
      "Praia da Concha",
      "5º Distrito Policial"
    ],
    "pointsOfInterest": [
      {
        "name": "Parque de los Héroes Caídos",
        "kind": "Parque",
        "description": "Praça comunitária em homenagem aos fundadores do bairro, os abuelos, e um dos principais pontos de encontro de Coral Gate."
      },
      {
        "name": "Aquário de Vanguard Bay",
        "kind": "Cultura",
        "description": "Aquário de arquitetura submersa em forma de onda, com túneis de acrílico e o tanque bioluminescente conhecido como O Abismo.",
        "spoiler": "Uma área restrita protege o Coral Atlante, fragmento com propriedades regenerativas."
      },
      {
        "name": "La Ventanita",
        "kind": "Café",
        "description": "Café mais popular do bairro, administrado por Mama Montoya, considerada uma matriarca não oficial de Coral Gate."
      },
      {
        "name": "El Malecón",
        "kind": "Restaurante",
        "description": "Restaurante de comida cubana que recebe reuniões comunitárias no último domingo de cada mês."
      },
      {
        "name": "Bay Marketplace",
        "kind": "Comércio",
        "description": "Shopping a céu aberto com lojas de departamento, pequenos negócios e quiosques."
      },
      {
        "name": "Botânica Raízes & Ramos",
        "kind": "Loja",
        "description": "Loja de Hector Ramos especializada em ervas, velas e artigos místicos. Lina Ramos ajuda o tio no atendimento.",
        "spoiler": "Hector afirma conseguir contactar o outro mundo e seu passado em Santa Prisca guarda mistérios."
      },
      {
        "name": "Clínica da Comunidade",
        "kind": "Saúde",
        "description": "Clínica gratuita conduzida pela Dra. Ana Cruz e voltada principalmente à população sem seguro."
      },
      {
        "name": "Rumba & Samba Room",
        "kind": "Vida Noturna",
        "description": "Clube de música e dança bastante movimentado em Coral Gate.",
        "spoiler": "Nos fundos funciona o escritório de Matheus “O Fantasma” Silva, líder dos Espectros."
      },
      {
        "name": "Vanguard Bay General Hospital (VBGH)",
        "kind": "Saúde",
        "description": "Principal hospital público da cidade, conhecido pela alta demanda e lotação constante.",
        "spoiler": "Abriga uma Unidade de Trauma Meta-humano financiada pela A.R.G.U.S."
      },
      {
        "name": "Praia da Concha",
        "kind": "Lazer",
        "description": "Praia frequentada por moradores locais, com quadras de vôlei e futebol de areia, além de vendedores ambulantes.",
        "spoiler": "O local vem sendo associado a desaparecimentos recentes."
      },
      {
        "name": "5º Distrito Policial",
        "kind": "Segurança",
        "description": "Delegacia de prédio antigo com forte relação comunitária. É onde atua o Oficial Leo Martinez."
      }
    ],
    "note": null,
    "image": {
      "src": "images/districts/la-ventanita.webp",
      "alt": "Esquina movimentada de Coral Gate ao pôr do sol, com o letreiro do café La Ventanita, clientes em mesas externas e músicos tocando",
      "caption": "Coral Gate — a La Ventanita, coração pulsante do bairro latino."
    },
    "edit": {
      "caption": {
        "id": "tz-0055",
        "legacyId": "e_54"
      },
      "title": {
        "id": "tz-0056",
        "legacyId": "e_55"
      },
      "details": {
        "id": "tz-0057",
        "legacyId": "e_56"
      }
    }
  },
  {
    "id": "downtown",
    "name": "Downtown",
    "icon": "🏛️",
    "type": "Centro Cívico",
    "summary": "Coração cívico e cultural de Vanguard Bay, reunindo governo, polícia, educação, artes e comunidades de imigrantes.",
    "locations": [
      "Paço Municipal Silas Vanguard",
      "Sede Central da V-BPD",
      "Escola Secundária Central de Vanguard Bay",
      "Instituto Politécnico de Vanguard Bay (VBPI)",
      "Distrito Teatral",
      "Museu de História de Vanguard Bay",
      "Parque da Diplomacia",
      "Pequena Markóvia",
      "Centro Cultural Markoviano"
    ],
    "pointsOfInterest": [
      {
        "name": "Paço Municipal Silas Vanguard",
        "kind": "Governo",
        "description": "Prefeitura em estilo deco solar e neoclássico, palco frequente de discursos e protestos e sede do gabinete de Julia Reyes."
      },
      {
        "name": "Sede Central da V-BPD",
        "kind": "Segurança",
        "description": "Quartel-general da polícia de Vanguard Bay, reunindo Homicídios, Crime Organizado, laboratórios e celas."
      },
      {
        "name": "Escola Secundária Central de Vanguard Bay",
        "kind": "Educação",
        "description": "Maior escola pública da cidade. É superlotada e seus times esportivos, os Ciclones, rivalizam com a Vanguard Academy."
      },
      {
        "name": "Instituto Politécnico de Vanguard Bay (VBPI)",
        "kind": "Educação",
        "description": "Campus público com laboratórios de ponta, forte presença estudantil e foco em engenharia e tecnologia."
      },
      {
        "name": "Distrito Teatral",
        "kind": "Cultura",
        "description": "Área de quatro quarteirões ao redor do Grande Teatro Vanguard, cercada por palcos menores, galerias independentes e clubes de jazz."
      },
      {
        "name": "Museu de História de Vanguard Bay",
        "kind": "Cultura",
        "description": "Museu dedicado à história da cidade, incluindo a ala Guardiões de Vanguard, voltada ao legado de Zenit."
      },
      {
        "name": "Parque da Diplomacia",
        "kind": "Parque",
        "description": "Área verde à beira da baía que abriga a Escultura do Leviatã, homenagem à batalha contra o Leviatã."
      },
      {
        "name": "Pequena Markóvia",
        "kind": "Subdistrito",
        "description": "Conjunto de três quarteirões marcado pela imigração do Leste Europeu, fachadas em alfabeto cirílico e o restaurante Ninho da Águia."
      },
      {
        "name": "Centro Cultural Markoviano",
        "kind": "Cultura",
        "description": "Centro voltado à comunidade markoviana de Downtown.",
        "spoiler": "Funciona como fachada da Irmandade Markoviana, envolvida com espionagem e contrabando de armas e tecnologia."
      }
    ],
    "note": null,
    "image": {
      "src": "images/districts/downtown.webp",
      "alt": "Praça cívica de Downtown ao anoitecer, com o Paço Municipal, o Fórum e o Grande Teatro Vanguard iluminados",
      "caption": "Downtown — Paço Municipal, Fórum e Grande Teatro Vanguard."
    },
    "edit": {
      "caption": {
        "id": "tz-0058",
        "legacyId": "e_57"
      },
      "title": {
        "id": "tz-0059",
        "legacyId": "e_58"
      },
      "details": {
        "id": "tz-0060",
        "legacyId": "e_59"
      }
    }
  },
  {
    "id": "o-dique",
    "name": "O Dique",
    "icon": "⚓",
    "type": "Operário / Docas",
    "summary": "Bairro operário do sul, marcado pelas docas, indústria pesada e pela forte presença de comunidades do Leste Europeu.",
    "locations": [
      "Docas de Carga Sul",
      "Mercado do Cais",
      "Bar Urso Polar",
      "Catedral de São Nicolau",
      "O Último Porto",
      "7º Distrito Policial — O Forte",
      "Memorial da Ponte da Bravura"
    ],
    "pointsOfInterest": [
      {
        "name": "Docas de Carga Sul",
        "kind": "Porto",
        "description": "Principal porto de Vanguard Bay, formado por um labirinto de contêineres e guindastes.",
        "spoiler": "É um dos centros de contrabando da Bratva Volkov."
      },
      {
        "name": "Mercado do Cais",
        "kind": "Comércio",
        "description": "Mercado e peixaria local que também funciona como ponto de encontro e circulação de informações do submundo."
      },
      {
        "name": "Bar Urso Polar",
        "kind": "Bar",
        "description": "Bar conhecido pelas mesas de pôquer e pela clientela perigosa.",
        "spoiler": "É o quartel-general não oficial de Boris “O Urso” Borkov e da Bratva Volkov."
      },
      {
        "name": "Catedral de São Nicolau",
        "kind": "Religioso",
        "description": "Igreja ortodoxa de cúpulas douradas considerada território neutro, respeitado inclusive por grupos criminosos."
      },
      {
        "name": "O Último Porto",
        "kind": "Bar",
        "description": "Bar de mergulho frequentado por marinheiros e mercenários, útil para notícias sobre o mar e movimentações nas docas."
      },
      {
        "name": "7º Distrito Policial — O Forte",
        "kind": "Segurança",
        "description": "Delegacia brutalista e altamente defensável que abriga a SWAT da V-BPD.",
        "spoiler": "Mantém conflito direto e constante com a Bratva Volkov."
      },
      {
        "name": "Memorial da Ponte da Bravura",
        "kind": "Memorial",
        "description": "Parque na base da Ponte do Sol Poente com uma escultura de bronze dedicada aos salvadores da Crise do Leviatã."
      }
    ],
    "note": null,
    "image": {
      "src": "images/districts/bar-urso-polar.webp",
      "alt": "Docas de O Dique à noite, com contêineres, guindastes e o letreiro de neon do Bar Urso Polar em vermelho",
      "caption": "O Dique — o Bar Urso Polar, quartel-general da Bratva Volkov."
    },
    "edit": {
      "caption": {
        "id": "tz-0061",
        "legacyId": "e_60"
      },
      "title": {
        "id": "tz-0062",
        "legacyId": "e_61"
      },
      "details": {
        "id": "tz-0063",
        "legacyId": "e_62"
      }
    }
  },
  {
    "id": "distrito-solar",
    "name": "Distrito Solar",
    "aliases": [
      "Ilha Solara"
    ],
    "icon": "🏝️",
    "type": "Elite / Luxo",
    "summary": "Bairro luxuoso da Ilha Solara, cartão-postal de Vanguard Bay e principal vitrine turística e social da elite.",
    "locations": [
      "Avenida Oceânica",
      "Alameda Neon",
      "The Starlight Grand Hotel",
      "Museu de Arte Contemporânea de Vanguard",
      "Galerie Vanguard",
      "Passeio das Conchas",
      "Clube Azure Key",
      "Academia Preparatória Vanguard",
      "Universidade de Vanguard Bay (UVB)",
      "Instituto de Antiguidades Marítimas",
      "Shaw Medical Center",
      "Zoológico Metropolitano de Vanguard Bay",
      "Praia Dourada"
    ],
    "pointsOfInterest": [
      {
        "name": "Avenida Oceânica",
        "kind": "Via",
        "description": "Principal avenida da Ilha Solara, conhecida pelo fluxo de carros de luxo e pela vida de cartão-postal."
      },
      {
        "name": "Alameda Neon",
        "kind": "Vida Noturna",
        "description": "Eixo de vida noturna intensa, marcado por iluminação forte, bares e multidões até altas horas."
      },
      {
        "name": "The Starlight Grand Hotel",
        "kind": "Hotel",
        "description": "Hotel histórico em estilo Deco Solar, com o bar Observatório no topo.",
        "spoiler": "O concierge Silas opera uma valiosa rede de informações a partir do hotel."
      },
      {
        "name": "Museu de Arte Contemporânea de Vanguard",
        "kind": "Cultura",
        "description": "Museu de arquitetura minimalista e ponto social recorrente da elite da cidade."
      },
      {
        "name": "Galerie Vanguard",
        "kind": "Cultura",
        "description": "Galeria sofisticada administrada pela curadora Geneviève Lachance.",
        "spoiler": "Por trás da fachada, funciona um mercado negro de arte roubada e artefatos místicos."
      },
      {
        "name": "Passeio das Conchas",
        "kind": "Comércio",
        "description": "Endereço de lojas de luxo, incluindo a joalheria Gemas de Mônaco e seu famoso cofre."
      },
      {
        "name": "Clube Azure Key",
        "kind": "Clandestino",
        "description": "Clube subterrâneo acessível por convite biométrico e usado como território neutro para negociações.",
        "visibility": "spoiler"
      },
      {
        "name": "Academia Preparatória Vanguard",
        "kind": "Educação",
        "description": "Campus de elite frequentado principalmente por filhos das famílias mais ricas da cidade."
      },
      {
        "name": "Universidade de Vanguard Bay (UVB)",
        "kind": "Educação",
        "description": "Universidade tradicional em uma ilha própria conectada por ponte particular, com destaque para Direito, Negócios e Biologia Marinha.",
        "spoiler": "Mantém colaboração acadêmica com Atlantes."
      },
      {
        "name": "Instituto de Antiguidades Marítimas",
        "kind": "Pesquisa",
        "description": "Instituto vizinho à UVB que abriga a Exposição Themyscira."
      },
      {
        "name": "Shaw Medical Center",
        "kind": "Saúde",
        "description": "Hospital particular de luxo, conhecido por tratamentos avançados.",
        "spoiler": "Os subsolos são associados a experimentos genéticos antiéticos ligados à busca de Leland Shaw pela imortalidade."
      },
      {
        "name": "Zoológico Metropolitano de Vanguard Bay",
        "kind": "Lazer",
        "description": "Santuário zoológico moderno da cidade.",
        "spoiler": "Sob o complexo existe uma Reserva Criptobiológica da A.R.G.U.S. para criaturas consideradas anômalas."
      },
      {
        "name": "Praia Dourada",
        "kind": "Lazer",
        "description": "Praia artificial, impecável e voltada ao público de alto poder aquisitivo da Ilha Solara."
      }
    ],
    "note": null,
    "image": {
      "src": "images/districts/distrito-solar.webp",
      "alt": "Complexo de luxo do Distrito Solar na Ilha Solara, com piscinas à beira-mar, palmeiras e mega-iates ancorados na marina",
      "caption": "Distrito Solar — a Ilha Solara, com piscinas de borda infinita e mega-iates."
    },
    "edit": {
      "caption": {
        "id": "tz-0064",
        "legacyId": "e_63"
      },
      "title": {
        "id": "tz-0065",
        "legacyId": "e_64"
      },
      "details": {
        "id": "tz-0066",
        "legacyId": "e_65"
      }
    }
  },
  {
    "id": "emaranhado",
    "name": "Emaranhado",
    "icon": "🌿",
    "type": "Pântano",
    "summary": "Zona pantanosa a oeste de Vanguard Bay e ponto de convergência das forças místicas do Verde e do Cinza.",
    "locations": [
      "Rio Serpente",
      "Manguezais da Baía",
      "Bosques de Pinheiro de Vanguard"
    ],
    "pointsOfInterest": [
      {
        "name": "Rio Serpente",
        "kind": "Natural",
        "description": "Rio que nasce no pântano, margeia O Dique e desemboca na baía.",
        "spoiler": "Também é utilizado como rota de contrabando."
      },
      {
        "name": "Manguezais da Baía",
        "kind": "Natural",
        "description": "Barreira natural espalhada pelas ilhas menores da baía.",
        "spoiler": "As áreas mais isoladas são usadas como esconderijo para atividades criminosas."
      },
      {
        "name": "Bosques de Pinheiro de Vanguard",
        "kind": "Natural",
        "description": "Bosques a noroeste com ilhas de madeira, usados para trilhas e áreas de difícil acesso.",
        "spoiler": "Há relatos de esconderijos ligados à A.R.G.U.S. e a praticantes de magia."
      }
    ],
    "note": "Convergência do Verde e do Cinza.",
    "image": {
      "src": "images/districts/emaranhado.webp",
      "alt": "Pântano do Emaranhado de Vanguard sob a lua cheia, com árvores retorcidas, neblina e luzes fantasmagóricas na água",
      "caption": "Emaranhado de Vanguard — o pântano ancestral."
    },
    "edit": {
      "caption": {
        "id": "tz-0067",
        "legacyId": "e_66"
      },
      "title": {
        "id": "tz-0068",
        "legacyId": "e_67"
      },
      "details": {
        "id": "tz-0069",
        "legacyId": "e_68"
      }
    }
  },
  {
    "id": "a-fenda",
    "name": "A Fenda",
    "icon": "⚠️",
    "type": "Área Industrial",
    "summary": "Zona industrial abandonada de quatro quarteirões na fronteira com o VBPI, oficialmente isolada como área de contaminação química.",
    "locations": [
      "Zona de Contaminação Química Nível 4"
    ],
    "pointsOfInterest": [
      {
        "name": "Zona de Contaminação Química Nível 4",
        "kind": "Área Restrita",
        "description": "Perímetro industrial abandonado e oficialmente interditado.",
        "spoiler": "A verdadeira causa é uma instabilidade dimensional criada por um experimento de teletransporte dos anos 1970; o local apresenta gravidade flutuante e luzes fantasmagóricas e atrai místicos e cultistas."
      }
    ],
    "note": "Instabilidade dimensional ligada a um experimento dos anos 1970.",
    "image": {
      "src": "images/districts/a-fenda.webp",
      "alt": "Vórtice dimensional roxo e vermelho em zona industrial abandonada de A Fenda, com destroços flutuantes e figuras encapuzadas ao redor",
      "caption": "A Fenda — instabilidade dimensional no coração industrial abandonado."
    },
    "edit": {
      "caption": {
        "id": "tz-0070",
        "legacyId": "e_69"
      },
      "title": {
        "id": "tz-0071",
        "legacyId": "e_70"
      },
      "details": {
        "id": "tz-0072",
        "legacyId": "e_71"
      }
    }
  }
];

window.TerraZData.strategicSites = [
  {
    "id": "black-reef",
    "name": "Penitenciária Estadual de Black-Reef",
    "icon": "⛓️",
    "kind": "Segurança Máxima",
    "area": "Ilha rochosa ao sul de Vanguard Bay",
    "description": "Prisão de segurança máxima conhecida pelo apelido de O Anzol.",
    "spoiler": "Uma ala subterrânea chamada A Lâmina é co-gerenciada pela A.R.G.U.S. e possui celas projetadas para neutralizar poderes de super-vilões."
  },
  {
    "id": "ilha-quimera",
    "name": "Ilha Quimera",
    "icon": "🧬",
    "kind": "Instalação Histórica",
    "area": "Arquipélago de Vanguard Bay",
    "description": "Ilha associada ao antigo Projeto Panoptes, precursor do D.E.O. O local é mencionado nos registros da cidade, mas não foi detalhado como área de acesso comum.",
    "visibility": "spoiler"
  },
  {
    "id": "sbcv",
    "name": "Sistema de Barreiras Ciclônicas de Vanguard (SBCV)",
    "icon": "🌊",
    "kind": "Infraestrutura",
    "area": "Baía de Vanguard",
    "description": "Rede de diques submersos combinada a um campo de força, financiada por Shaw Innovations e Vanguard-Stagg para proteger a cidade de eventos ciclônicos.",
    "spoiler": "É um ponto crítico da segurança urbana e um alvo potencial para sabotagem."
  }
];

})();
