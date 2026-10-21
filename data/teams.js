(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Equipes e membros de referência do universo Terra Z.
window.TerraZData.teams = {
  "teams": [
    {
      "name": "Sociedade da Justiça",
      "year": "1940",
      "leader": "Jay Garrick",
      "members": "SJA clássica",
      "edit": {
        "name": {
          "id": "tz-0524",
          "legacyId": "e_523"
        },
        "year": {
          "id": "tz-0525",
          "legacyId": "e_524"
        },
        "leader": {
          "id": "tz-0526",
          "legacyId": "e_525"
        },
        "members": {
          "id": "tz-0527",
          "legacyId": "e_526"
        }
      }
    },
    {
      "name": "Liga da Justiça",
      "year": "~2005",
      "leader": "Superman, Batman",
      "members": "Fundadores + J'onn",
      "edit": {
        "name": {
          "id": "tz-0528",
          "legacyId": "e_527"
        },
        "year": {
          "id": "tz-0529",
          "legacyId": "e_528"
        },
        "leader": {
          "id": "tz-0530",
          "legacyId": "e_529"
        },
        "members": {
          "id": "tz-0531",
          "legacyId": "e_530"
        }
      }
    },
    {
      "name": "Novos Titãs",
      "year": "~2010–2012",
      "leader": "Dick Grayson",
      "members": "Dick, Ravena, Mutano, Cyborg, M'gann",
      "edit": {
        "name": {
          "id": "tz-0532",
          "legacyId": "e_531"
        },
        "year": {
          "id": "tz-0533",
          "legacyId": "e_532"
        },
        "leader": {
          "id": "tz-0534",
          "legacyId": "e_533"
        },
        "members": {
          "id": "tz-0535",
          "legacyId": "e_534"
        }
      }
    },
    {
      "name": "Titãs",
      "year": "2024",
      "leader": "Dick Grayson",
      "members": "Membros originais",
      "edit": {
        "name": {
          "id": "tz-0536",
          "legacyId": "e_535"
        },
        "year": {
          "id": "tz-0537",
          "legacyId": "e_536"
        },
        "leader": {
          "id": "tz-0538",
          "legacyId": "e_537"
        },
        "members": {
          "id": "tz-0539",
          "legacyId": "e_538"
        }
      }
    },
    {
      "name": "Aves de Rapina",
      "year": "2019",
      "leader": "Dinah Lance",
      "members": "Dinah, Bárbara, Helena, Zinda",
      "edit": {
        "name": {
          "id": "tz-0540",
          "legacyId": "e_539"
        },
        "year": {
          "id": "tz-0541",
          "legacyId": "e_540"
        },
        "leader": {
          "id": "tz-0542",
          "legacyId": "e_541"
        },
        "members": {
          "id": "tz-0543",
          "legacyId": "e_542"
        }
      }
    },
    {
      "name": "Jovens Titãs",
      "year": "2026",
      "leader": "Jason Todd",
      "members": "Fairplay, Cheshire Cat, Flatline, Proxy, Wildcard",
      "edit": {
        "name": {
          "id": "tz-0544",
          "legacyId": "e_543"
        },
        "year": {
          "id": "tz-0545",
          "legacyId": "e_544"
        },
        "leader": {
          "id": "tz-0546",
          "legacyId": "e_545"
        },
        "members": {
          "id": "tz-0547",
          "legacyId": "e_546"
        }
      }
    }
  ],
  "justiceLeagueMembers": [
    {
      "character": "Bruce Wayne",
      "codename": "Batman",
      "born": "1981",
      "age2027": "46",
      "edit": {
        "character": {
          "id": "tz-0552",
          "legacyId": "e_551"
        },
        "codename": {
          "id": "tz-0553",
          "legacyId": "e_552"
        },
        "born": {
          "id": "tz-0554",
          "legacyId": "e_553"
        },
        "age2027": {
          "id": "tz-0555",
          "legacyId": "e_554"
        }
      }
    },
    {
      "character": "Clark Kent",
      "codename": "Superman",
      "born": "1979",
      "age2027": "48",
      "edit": {
        "character": {
          "id": "tz-0556",
          "legacyId": "e_555"
        },
        "codename": {
          "id": "tz-0557",
          "legacyId": "e_556"
        },
        "born": {
          "id": "tz-0558",
          "legacyId": "e_557"
        },
        "age2027": {
          "id": "tz-0559",
          "legacyId": "e_558"
        }
      }
    },
    {
      "character": "Diana Prince",
      "codename": "Mulher-Maravilha",
      "born": "~1980",
      "age2027": "~47",
      "edit": {
        "character": {
          "id": "tz-0560",
          "legacyId": "e_559"
        },
        "codename": {
          "id": "tz-0561",
          "legacyId": "e_560"
        },
        "born": {
          "id": "tz-0562",
          "legacyId": "e_561"
        },
        "age2027": {
          "id": "tz-0563",
          "legacyId": "e_562"
        }
      }
    },
    {
      "character": "Barry Allen",
      "codename": "Flash",
      "born": "1990",
      "age2027": "37",
      "edit": {
        "character": {
          "id": "tz-0564",
          "legacyId": "e_563"
        },
        "codename": {
          "id": "tz-0565",
          "legacyId": "e_564"
        },
        "born": {
          "id": "tz-0566",
          "legacyId": "e_565"
        },
        "age2027": {
          "id": "tz-0567",
          "legacyId": "e_566"
        }
      }
    },
    {
      "character": "Hal Jordan",
      "codename": "Lanterna Verde",
      "born": "1985",
      "age2027": "42",
      "edit": {
        "character": {
          "id": "tz-0568",
          "legacyId": "e_567"
        },
        "codename": {
          "id": "tz-0569",
          "legacyId": "e_568"
        },
        "born": {
          "id": "tz-0570",
          "legacyId": "e_569"
        },
        "age2027": {
          "id": "tz-0571",
          "legacyId": "e_570"
        }
      }
    },
    {
      "character": "Arthur Curry",
      "codename": "Aquaman",
      "born": "1985",
      "age2027": "42",
      "edit": {
        "character": {
          "id": "tz-0572",
          "legacyId": "e_571"
        },
        "codename": {
          "id": "tz-0573",
          "legacyId": "e_572"
        },
        "born": {
          "id": "tz-0574",
          "legacyId": "e_573"
        },
        "age2027": {
          "id": "tz-0575",
          "legacyId": "e_574"
        }
      }
    },
    {
      "character": "Victor Stone",
      "codename": "Cyborg",
      "born": "1995",
      "age2027": "32",
      "edit": {
        "character": {
          "id": "tz-0576",
          "legacyId": "e_575"
        },
        "codename": {
          "id": "tz-0577",
          "legacyId": "e_576"
        },
        "born": {
          "id": "tz-0578",
          "legacyId": "e_577"
        },
        "age2027": {
          "id": "tz-0579",
          "legacyId": "e_578"
        }
      }
    },
    {
      "character": "Barbara Gordon",
      "codename": "Oráculo",
      "born": "1995",
      "age2027": "32",
      "edit": {
        "character": {
          "id": "tz-0580",
          "legacyId": "e_579"
        },
        "codename": {
          "id": "tz-0581",
          "legacyId": "e_580"
        },
        "born": {
          "id": "tz-0582",
          "legacyId": "e_581"
        },
        "age2027": {
          "id": "tz-0583",
          "legacyId": "e_582"
        }
      }
    },
    {
      "character": "Dick Grayson",
      "codename": "Asa Noturna",
      "born": "1998",
      "age2027": "29",
      "edit": {
        "character": {
          "id": "tz-0584",
          "legacyId": "e_583"
        },
        "codename": {
          "id": "tz-0585",
          "legacyId": "e_584"
        },
        "born": {
          "id": "tz-0586",
          "legacyId": "e_585"
        },
        "age2027": {
          "id": "tz-0587",
          "legacyId": "e_586"
        }
      }
    },
    {
      "character": "Tim Drake",
      "codename": "Robin (ex)",
      "born": "2007",
      "age2027": "20",
      "edit": {
        "character": {
          "id": "tz-0588",
          "legacyId": "e_587"
        },
        "codename": {
          "id": "tz-0589",
          "legacyId": "e_588"
        },
        "born": {
          "id": "tz-0590",
          "legacyId": "e_589"
        },
        "age2027": {
          "id": "tz-0591",
          "legacyId": "e_590"
        }
      }
    },
    {
      "character": "Jay Garrick",
      "codename": "Flash (original)",
      "born": "1918",
      "age2027": "109",
      "edit": {
        "character": {
          "id": "tz-0592",
          "legacyId": "e_591"
        },
        "codename": {
          "id": "tz-0593",
          "legacyId": "e_592"
        },
        "born": {
          "id": "tz-0594",
          "legacyId": "e_593"
        },
        "age2027": {
          "id": "tz-0595",
          "legacyId": "e_594"
        }
      }
    }
  ]
};

// Organizações locais e instituições de Vanguard Bay.
// Mantidas separadas das equipes heroicas para permitir expansão futura do grafo.
window.TerraZData.organizations = [
  {
    "id": "os-espectros",
    "name": "Os Espectros",
    "icon": "👻",
    "category": "criminal",
    "categoryLabel": "Facção Criminosa",
    "base": "Coral Gate",
    "leader": "Matheus Silva · O Fantasma",
    "description": "Organização de Coral Gate envolvida com contrabando e proteção do bairro.",
    "activities": [
      "Contrabando",
      "Proteção territorial"
    ],
    "rivals": [
      "Los Martillo"
    ],
    "relatedCharacters": [
      "Matheus Silva"
    ],
    "relatedLocations": [
      "Rumba & Samba Room",
      "Coral Gate"
    ],
    "visibility": "public"
  },
  {
    "id": "los-martillo",
    "name": "Los Martillo",
    "icon": "🔨",
    "category": "criminal",
    "categoryLabel": "Facção Criminosa",
    "base": "Coral Gate",
    "leader": "Não especificado no material",
    "description": "Gangue jovem de Coral Gate ligada ao tráfico da droga conhecida como Gelo.",
    "activities": [
      "Tráfico de Gelo"
    ],
    "rivals": [
      "Os Espectros"
    ],
    "relatedCharacters": [],
    "relatedLocations": [
      "Coral Gate"
    ],
    "visibility": "public"
  },
  {
    "id": "bratva-volkov",
    "name": "Bratva Volkov",
    "icon": "🐻",
    "category": "criminal",
    "categoryLabel": "Facção Criminosa",
    "base": "O Dique",
    "leader": "Boris Borkov · O Urso",
    "description": "Organização criminosa atuante em O Dique, especializada em contrabando de armas e tráfico de meta-humanos.",
    "activities": [
      "Contrabando de armas",
      "Tráfico de meta-humanos"
    ],
    "relatedCharacters": [
      "Boris Borkov"
    ],
    "relatedLocations": [
      "Bar Urso Polar",
      "Docas de Carga Sul",
      "O Dique"
    ],
    "visibility": "public"
  },
  {
    "id": "irmandade-markoviana",
    "name": "Irmandade Markoviana",
    "icon": "🦅",
    "category": "criminal",
    "categoryLabel": "Facção Criminosa",
    "base": "Downtown · Pequena Markóvia",
    "leader": "General Markov",
    "description": "Organização baseada na Pequena Markóvia, envolvida com espionagem e contrabando de tecnologia.",
    "activities": [
      "Espionagem",
      "Contrabando de tecnologia"
    ],
    "relatedCharacters": [
      "General Markov"
    ],
    "relatedLocations": [
      "Centro Cultural Markoviano",
      "Pequena Markóvia"
    ],
    "visibility": "public"
  },
  {
    "id": "no-face",
    "name": "No-Face",
    "icon": "💻",
    "category": "criminal",
    "categoryLabel": "Grupo Hacker",
    "base": "A Muralha · O Comutador",
    "leader": "Não especificado no material",
    "description": "Grupo de hackers que usa O Comutador e atua na compra e venda de informações sigilosas.",
    "activities": [
      "Invasão digital",
      "Comércio de informações"
    ],
    "relatedCharacters": [
      "Alia Hazari"
    ],
    "relatedLocations": [
      "O Comutador",
      "A Muralha"
    ],
    "visibility": "public"
  },
  {
    "id": "shaw-innovations",
    "name": "Shaw Innovations",
    "icon": "🏢",
    "category": "corporate",
    "categoryLabel": "Empresa",
    "base": "A Muralha · Shaw Spire",
    "leader": "Leland Shaw",
    "description": "Grande empresa de Vanguard Bay voltada a energia limpa, inteligência artificial e software.",
    "activities": [
      "Energia limpa",
      "Inteligência artificial",
      "Software"
    ],
    "relatedCharacters": [
      "Leland Shaw",
      "Camila Vargas"
    ],
    "relatedLocations": [
      "Shaw Spire",
      "Shaw Medical Center"
    ],
    "spoiler": "A meta pessoal de Leland Shaw ligada à empresa é alcançar a imortalidade por meio de seus experimentos.",
    "visibility": "public"
  },
  {
    "id": "vanguard-stagg-industries",
    "name": "Vanguard-Stagg Industries",
    "icon": "🏭",
    "category": "corporate",
    "categoryLabel": "Empresa",
    "base": "A Muralha · Vanguard-Stagg Pinnacle",
    "leader": "Donovan Mason",
    "description": "Conglomerado voltado a hardware militar, engenharia química e biotecnologia.",
    "activities": [
      "Hardware militar",
      "Engenharia química",
      "Biotecnologia",
      "Segurança privada"
    ],
    "relatedCharacters": [
      "Donovan Mason",
      "Dra. Zara Kovač"
    ],
    "relatedLocations": [
      "Vanguard-Stagg Pinnacle"
    ],
    "subunits": [
      "Stagg Security"
    ],
    "visibility": "public"
  },
  {
    "id": "uvb",
    "name": "Universidade de Vanguard Bay (UVB)",
    "icon": "🎓",
    "category": "academic",
    "categoryLabel": "Ensino Superior",
    "base": "Ilha Solara",
    "leader": "Não especificado no material",
    "description": "Universidade tradicional e cara, com forte cultura de fraternidades e destaque em Direito e Oceanografia.",
    "activities": [
      "Direito",
      "Oceanografia",
      "Pesquisa acadêmica"
    ],
    "relatedCharacters": [
      "Dr. Ahron Nax"
    ],
    "relatedLocations": [
      "Universidade de Vanguard Bay (UVB)"
    ],
    "subunits": [
      "Ordem do Zenit"
    ],
    "spoiler": "O material registra colaboração da área de Oceanografia com Atlantes.",
    "visibility": "public"
  },
  {
    "id": "vbpi",
    "name": "Instituto Politécnico de Vanguard Bay (VBPI)",
    "icon": "🧪",
    "category": "academic",
    "categoryLabel": "Ensino Superior",
    "base": "Downtown",
    "leader": "Não especificado no material",
    "description": "Instituição pública, mais acessível e interdisciplinar, com laboratórios e destaque para engenharia, tecnologia e criminologia forense.",
    "activities": [
      "Engenharia",
      "Tecnologia",
      "Criminologia Forense"
    ],
    "relatedCharacters": [
      "Dra. Helen Finch"
    ],
    "relatedLocations": [
      "Instituto Politécnico de Vanguard Bay (VBPI)"
    ],
    "subunits": [
      "Departamento de Criminologia Forense",
      "Programa Análise de Resíduos Meta-humanos"
    ],
    "visibility": "public"
  },
  {
    "id": "farol-de-vanguard",
    "name": "Farol de Vanguard",
    "icon": "📰",
    "category": "media",
    "categoryLabel": "Mídia",
    "base": "A Muralha",
    "leader": "Não especificado no material",
    "description": "Jornal tradicional de Vanguard Bay.",
    "activities": [
      "Jornalismo",
      "Reportagem investigativa"
    ],
    "relatedCharacters": [
      "Osias \"Osi\" Rivers"
    ],
    "relatedLocations": [
      "Farol de Vanguard"
    ],
    "visibility": "public"
  },
  {
    "id": "sentinela-dourada",
    "name": "A Sentinela Dourada",
    "icon": "📱",
    "category": "media",
    "categoryLabel": "Mídia",
    "base": "A Muralha",
    "leader": "Não especificado no material",
    "description": "Tabloide digital de Vanguard Bay.",
    "activities": [
      "Noticiário digital",
      "Colunismo"
    ],
    "relatedCharacters": [
      "Roxana \"Roxy\" Sharpe"
    ],
    "relatedLocations": [
      "A Sentinela Dourada"
    ],
    "visibility": "public"
  },
  {
    "id": "vbn",
    "name": "VBN · Vanguard Broadcasting Network",
    "aliases": [
      "Vanguard Broadcasting Network",
      "VBN"
    ],
    "icon": "📺",
    "category": "media",
    "categoryLabel": "Mídia",
    "base": "Vanguard Bay",
    "leader": "Não especificado no material",
    "description": "Emissora de televisão responsável pelo telejornal VBN Nightly News.",
    "activities": [
      "Televisão",
      "Telejornalismo"
    ],
    "relatedCharacters": [
      "Marcos Jimenez",
      "Sofia Navarro"
    ],
    "relatedLocations": [],
    "subunits": [
      "VBN Nightly News"
    ],
    "visibility": "public"
  },
  {
    "id": "argus",
    "name": "A.R.G.U.S.",
    "icon": "🛡️",
    "category": "agency",
    "categoryLabel": "Agência",
    "base": "Operações em Vanguard Bay",
    "leader": "Não especificado no material",
    "description": "Agência com presença operacional em Vanguard Bay. O material associa a A.R.G.U.S. a instalações e programas especiais na cidade.",
    "activities": [
      "Co-gestão de A Lâmina",
      "Financiamento da Unidade de Trauma Meta-humano",
      "Reserva Criptobiológica",
      "Instalação secreta no terminal de cargas do aeroporto"
    ],
    "relatedCharacters": [
      "Dra. Anya Petrova"
    ],
    "relatedLocations": [
      "Penitenciária Estadual de Black-Reef",
      "Vanguard Bay General Hospital (VBGH)",
      "Zoológico Metropolitano de Vanguard Bay",
      "Aeroporto Internacional de Vanguard Bay"
    ],
    "visibility": "spoiler"
  },
  {
    "id": "deo",
    "name": "D.E.O.",
    "icon": "🔒",
    "category": "agency",
    "categoryLabel": "Agência",
    "base": "Ligação histórica com Vanguard Bay",
    "leader": "Não especificado no material",
    "description": "O material relaciona o D.E.O. à história de Vanguard Bay por meio do antigo Projeto Panoptes, na Ilha Quimera.",
    "activities": [
      "Ligação com o Projeto Panoptes"
    ],
    "relatedCharacters": [
      "Dra. Anya Petrova"
    ],
    "relatedLocations": [
      "Ilha Quimera"
    ],
    "visibility": "spoiler"
  }
];

})();
