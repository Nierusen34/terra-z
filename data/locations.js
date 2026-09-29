(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Distritos e locais canônicos de Vanguard Bay.
window.TerraZData.districts = [
  {
    "id": "a-muralha",
    "name": "A Muralha",
    "icon": "💎",
    "type": "Centro Corporativo",
    "locations": [
      "Shaw Spire",
      "Vanguard-Stagg",
      "Banco Central",
      "Farol",
      "The Ledger",
      "O Comutador",
      "A Pira"
    ],
    "note": null,
    "image": {
      "src": "a-muralha.png",
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
    "locations": [
      "Parque",
      "Aquário",
      "La Ventanita",
      "El Malecón",
      "Botânica",
      "Clínica",
      "Rumba Room"
    ],
    "note": null,
    "image": {
      "src": "la-ventanita.png",
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
    "locations": [
      "Paço Municipal",
      "V-BPD",
      "VBPI",
      "Distrito Teatral",
      "Museu",
      "Pequena Markóvia"
    ],
    "note": null,
    "image": {
      "src": "downtown.png",
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
    "locations": [
      "Docas Sul",
      "Mercado",
      "Bar Urso Polar",
      "Catedral",
      "7º DP"
    ],
    "note": null,
    "image": {
      "src": "bar-urso-polar.png",
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
    "icon": "🏝️",
    "type": "Elite / Luxo",
    "locations": [
      "Avenida Oceânica",
      "Alameda Neon",
      "Starlight",
      "Galerie",
      "UVB"
    ],
    "note": null,
    "image": {
      "src": "distrito-solar.png",
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
    "locations": [
      "Rio Serpente",
      "Bosques"
    ],
    "note": "Convergência do Verde e do Cinza.",
    "image": {
      "src": "emaranhado.png",
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
    "locations": [
      "Instabilidade dimensional (anos 70)"
    ],
    "note": null,
    "image": {
      "src": "a-fenda.png",
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

})();
