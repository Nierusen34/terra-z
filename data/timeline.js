(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Linha do tempo canônica do universo Terra Z.
// As sessões da campanha NÃO são duplicadas aqui: js/timeline-manager.js
// lê o Diário da Campanha e as incorpora dinamicamente à cronologia.
window.TerraZData.timeline = [
  {
    "title": "Séculos Atrás – Marte",
    "order": 10,
    "items": [
      {
        "year": "Milênios atrás",
        "text": "Coexistência e Conflito entre Marcianos Verdes e Brancos.",
        "edit": {
          "year": {
            "id": "tz-0488",
            "legacyId": "e_487"
          },
          "text": {
            "id": "tz-0489",
            "legacyId": "e_488"
          }
        },
        "id": "marte-coexistencia-verdes-brancos",
        "category": "history",
        "sortKey": 10,
        "characters": [],
        "locations": [
          "Marte"
        ],
        "teams": [],
        "visibility": "public"
      },
      {
        "year": "Era Antiga",
        "text": "Guerra Civil Marciana. Verdes vencem.",
        "edit": {
          "year": {
            "id": "tz-0490",
            "legacyId": "e_489"
          },
          "text": {
            "id": "tz-0491",
            "legacyId": "e_490"
          }
        },
        "id": "guerra-civil-marciana",
        "category": "history",
        "sortKey": 20,
        "characters": [],
        "locations": [
          "Marte"
        ],
        "teams": [],
        "visibility": "public"
      },
      {
        "year": "Anos depois",
        "text": "Maldição de H'ronmeer. J'onn perde esposa e filha.",
        "edit": {
          "year": {
            "id": "tz-0492",
            "legacyId": "e_491"
          },
          "text": {
            "id": "tz-0493",
            "legacyId": "e_492"
          }
        },
        "id": "maldicao-de-hronmeer",
        "category": "history",
        "sortKey": 30,
        "characters": [
          "J'onn J'onzz"
        ],
        "locations": [
          "Marte"
        ],
        "teams": [],
        "visibility": "public"
      }
    ]
  },
  {
    "title": "1950–2008 – Chegada e Tragédia",
    "order": 20,
    "items": [
      {
        "year": "~1950–1960",
        "text": "J'onn J'onzz chega à Terra.",
        "edit": {
          "year": {
            "id": "tz-0494",
            "legacyId": "e_493"
          },
          "text": {
            "id": "tz-0495",
            "legacyId": "e_494"
          }
        },
        "id": "jonn-chega-a-terra",
        "category": "history",
        "sortKey": 19550000,
        "characters": [
          "J'onn J'onzz"
        ],
        "locations": [
          "Terra"
        ],
        "teams": [],
        "visibility": "public"
      },
      {
        "year": "~2000–2002",
        "text": "M'gann M'orzz chega à Terra.",
        "edit": {
          "year": {
            "id": "tz-0496",
            "legacyId": "e_495"
          },
          "text": {
            "id": "tz-0497",
            "legacyId": "e_496"
          }
        },
        "id": "mgann-chega-a-terra",
        "category": "history",
        "sortKey": 20010000,
        "characters": [
          "M'gann M'orzz"
        ],
        "locations": [
          "Terra"
        ],
        "teams": [],
        "visibility": "public"
      },
      {
        "year": "2003–2004",
        "text": "M'gann é violentada por Armek.",
        "edit": {
          "year": {
            "id": "tz-0498",
            "legacyId": "e_497"
          },
          "text": {
            "id": "tz-0499",
            "legacyId": "e_498"
          }
        },
        "id": "armek-e-mgann-2003-2004",
        "category": "history",
        "sortKey": 20035000,
        "characters": [
          "M'gann M'orzz"
        ],
        "locations": [
          "Terra"
        ],
        "teams": [],
        "visibility": "public"
      },
      {
        "year": "2004",
        "text": "J'onn mata Armek. M'ark nasce.",
        "edit": {
          "year": {
            "id": "tz-0500",
            "legacyId": "e_499"
          },
          "text": {
            "id": "tz-0501",
            "legacyId": "e_500"
          }
        },
        "id": "morte-de-armek-e-nascimento-de-mark",
        "category": "history",
        "sortKey": 20040000,
        "characters": [
          "J'onn J'onzz",
          "M'ark"
        ],
        "locations": [
          "Terra"
        ],
        "teams": [],
        "visibility": "public"
      }
    ]
  },
  {
    "title": "2010–2025 – Heróis e Tragédias",
    "order": 30,
    "items": [
      {
        "year": "~2010–2012",
        "text": "M'gann nos Jovens Titãs. Conhece Conner Kent.",
        "edit": {
          "year": {
            "id": "tz-0502",
            "legacyId": "e_501"
          },
          "text": {
            "id": "tz-0503",
            "legacyId": "e_502"
          }
        },
        "id": "mgann-nos-jovens-titas",
        "category": "history",
        "sortKey": 20110000,
        "characters": [
          "M'gann M'orzz",
          "Conner Kent"
        ],
        "locations": [],
        "teams": [
          "Jovens Titãs"
        ],
        "visibility": "public"
      },
      {
        "year": "2019",
        "text": "Bárbara baleada. Jason Todd morto. Dinah vai para Gotham. M'gann termina com Conner.",
        "edit": {
          "year": {
            "id": "tz-0504",
            "legacyId": "e_503"
          },
          "text": {
            "id": "tz-0505",
            "legacyId": "e_504"
          }
        },
        "id": "gotham-e-rupturas-de-2019",
        "category": "history",
        "sortKey": 20190000,
        "characters": [
          "Barbara Gordon",
          "Jason Todd",
          "Dinah Lance",
          "M'gann M'orzz",
          "Conner Kent"
        ],
        "locations": [
          "Gotham City"
        ],
        "teams": [],
        "visibility": "public"
      },
      {
        "year": "2020",
        "text": "Oliver \"morre\". Connor assume o manto.",
        "edit": {
          "year": {
            "id": "tz-0506",
            "legacyId": "e_505"
          },
          "text": {
            "id": "tz-0507",
            "legacyId": "e_506"
          }
        },
        "id": "queda-de-oliver-e-manto-de-connor",
        "category": "history",
        "sortKey": 20200000,
        "characters": [
          "Oliver Queen",
          "Connor Hawke"
        ],
        "locations": [],
        "teams": [],
        "visibility": "public"
      },
      {
        "year": "2021",
        "text": "Jason ressuscita. Conner descobre M'ark e reata com M'gann.",
        "edit": {
          "year": {
            "id": "tz-0508",
            "legacyId": "e_507"
          },
          "text": {
            "id": "tz-0509",
            "legacyId": "e_508"
          }
        },
        "id": "retorno-de-jason-e-descoberta-de-mark",
        "category": "history",
        "sortKey": 20210000,
        "characters": [
          "Jason Todd",
          "Conner Kent",
          "M'ark",
          "M'gann M'orzz"
        ],
        "locations": [],
        "teams": [],
        "visibility": "public"
      },
      {
        "year": "2022",
        "text": "Oliver resgatado. Kendra resgata Riot. Lobo faz promessa (2072). Alfred morto por Bane.",
        "edit": {
          "year": {
            "id": "tz-0510",
            "legacyId": "e_509"
          },
          "text": {
            "id": "tz-0511",
            "legacyId": "e_510"
          }
        },
        "id": "resgates-e-perdas-de-2022",
        "category": "history",
        "sortKey": 20220000,
        "characters": [
          "Oliver Queen",
          "Kendra Saunders",
          "Riot",
          "Lobo"
        ],
        "locations": [],
        "teams": [],
        "visibility": "public"
      },
      {
        "year": "2024",
        "text": "Jovens Titãs mudam para \"Titãs\".",
        "edit": {
          "year": {
            "id": "tz-0512",
            "legacyId": "e_511"
          },
          "text": {
            "id": "tz-0513",
            "legacyId": "e_512"
          }
        },
        "id": "jovens-titas-tornam-se-titas",
        "category": "history",
        "sortKey": 20240000,
        "characters": [],
        "locations": [],
        "teams": [
          "Jovens Titãs",
          "Titãs"
        ],
        "visibility": "public"
      }
    ]
  },
  {
    "title": "2026–2027 – Pré-Campanha e Campanha",
    "order": 40,
    "items": [
      {
        "year": "2026",
        "text": "Superman torna-se Rei Ômega. M'ark apresentado como Marciano Verde.",
        "edit": {
          "year": {
            "id": "tz-0514",
            "legacyId": "e_513"
          },
          "text": {
            "id": "tz-0515",
            "legacyId": "e_514"
          }
        },
        "id": "rei-omega-e-apresentacao-de-mark",
        "category": "pre-campaign",
        "sortKey": 20260000,
        "characters": [
          "M'ark"
        ],
        "locations": [],
        "teams": [],
        "visibility": "public"
      },
      {
        "year": "Jan 2027",
        "text": "Encontro em Vanguard Bay: Tristan, Riot e M'ark.",
        "edit": {
          "year": {
            "id": "tz-0516",
            "legacyId": "e_515"
          },
          "text": {
            "id": "tz-0517",
            "legacyId": "e_516"
          }
        },
        "id": "encontro-em-vanguard-bay",
        "category": "current",
        "sortKey": 20270101,
        "characters": [
          "Tristan Queen",
          "Riot",
          "M'ark"
        ],
        "locations": [
          "Vanguard Bay"
        ],
        "teams": [],
        "visibility": "public"
      }
    ]
  },
  {
    "title": "Futuro",
    "order": 50,
    "items": [
      {
        "year": "2072",
        "text": "Fim do Prazo de Lobo.",
        "edit": {
          "year": {
            "id": "tz-0518",
            "legacyId": "e_517"
          },
          "text": {
            "id": "tz-0519",
            "legacyId": "e_518"
          }
        },
        "id": "fim-do-prazo-de-lobo",
        "category": "future",
        "sortKey": 20720000,
        "characters": [
          "Lobo",
          "Riot"
        ],
        "locations": [],
        "teams": [],
        "visibility": "public"
      }
    ]
  }
];

window.TerraZData.timelineSchema = {
  id:"slug-estavel-do-evento",
  category:"history | pre-campaign | campaign | current | future",
  sortKey:"número cronológico YYYYMMDD; períodos imprecisos usam valor aproximado estável",
  year:"rótulo exibido",
  text:"descrição canônica",
  characters:["Nome exato da ficha"],
  locations:["Distrito, cidade ou local"],
  teams:["Nome exato da equipe"],
  visibility:"public | spoiler | master",
  edit:{year:{id:"tz-...",legacyId:"e_..."},text:{id:"tz-...",legacyId:"e_..."}}
};

})();
