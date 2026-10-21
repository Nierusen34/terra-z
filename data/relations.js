(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Grafo narrativo padrão. O editor pode expandi-lo com personagens, equipes,
// facções, organizações, locais, eventos e entidades personalizadas.
window.TerraZData.defaultGraph = {
  "version": 3,
  "nuclei": [
    {
      "id": "queen",
      "label": "Família Queen",
      "color": "#c45a1c"
    },
    {
      "id": "wayne",
      "label": "Família Wayne",
      "color": "#0064a8"
    },
    {
      "id": "marciano",
      "label": "Núcleo Marciano",
      "color": "#0a8a4a"
    },
    {
      "id": "lobo",
      "label": "Prazo de Lobo",
      "color": "#7a4aff"
    },
    {
      "id": "vanguard-bay",
      "label": "Vanguard Bay",
      "color": "#9b6f2c"
    }
  ],
  "quadrants": [
    {
      "id": "queen",
      "title": "FAMÍLIA QUEEN",
      "x": 20,
      "y": 20,
      "w": 470,
      "h": 340,
      "color": "#c45a1c",
      "bg": "rgba(196,90,28,.05)"
    },
    {
      "id": "wayne",
      "title": "FAMÍLIA WAYNE",
      "x": 510,
      "y": 20,
      "w": 470,
      "h": 340,
      "color": "#0064a8",
      "bg": "rgba(0,100,168,.05)"
    },
    {
      "id": "marciano",
      "title": "NÚCLEO MARCIANO",
      "x": 20,
      "y": 380,
      "w": 470,
      "h": 320,
      "color": "#0a8a4a",
      "bg": "rgba(10,138,74,.05)"
    },
    {
      "id": "lobo",
      "title": "PRAZO DE LOBO",
      "x": 510,
      "y": 380,
      "w": 470,
      "h": 320,
      "color": "#7a4aff",
      "bg": "rgba(122,74,255,.05)"
    },
    {
      "id": "vanguard-bay",
      "title": "VANGUARD BAY · PODER LOCAL",
      "x": 1020,
      "y": 20,
      "w": 760,
      "h": 680,
      "color": "#9b6f2c",
      "bg": "rgba(155,111,44,.05)"
    }
  ],
  "nodes": [
    {
      "id": "oliver",
      "label": "OLIVER",
      "subtitle": "Oliver Queen",
      "kind": "character",
      "ref": "Oliver Queen",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 255,
      "y": 96,
      "color": "#c45a1c",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "queen"
      ]
    },
    {
      "id": "dinah",
      "label": "DINAH",
      "subtitle": "Dinah Lance",
      "kind": "character",
      "ref": "Dinah Lance",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 76,
      "y": 288,
      "color": "#8b1a1a",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "queen"
      ]
    },
    {
      "id": "tristan",
      "label": "TRISTAN",
      "subtitle": "Tristan Queen",
      "kind": "character",
      "ref": "Tristan Queen",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 255,
      "y": 288,
      "color": "#c45a1c",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "queen"
      ]
    },
    {
      "id": "connor",
      "label": "CONNOR",
      "subtitle": "Connor Hawke",
      "kind": "character",
      "ref": "Connor Hawke",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 434,
      "y": 288,
      "color": "#3a3028",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "queen"
      ]
    },
    {
      "id": "bruce",
      "label": "BRUCE",
      "subtitle": "Bruce Wayne",
      "kind": "character",
      "ref": "Bruce Wayne",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 745,
      "y": 96,
      "color": "#1a1512",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "wayne"
      ]
    },
    {
      "id": "damian",
      "label": "DAMIAN",
      "subtitle": "Damian Wayne",
      "kind": "character",
      "ref": "Damian Wayne",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 924,
      "y": 195,
      "color": "#8b1a1a",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "wayne"
      ]
    },
    {
      "id": "jason",
      "label": "JASON",
      "subtitle": "Jason Todd",
      "kind": "character",
      "ref": "Jason Todd",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 566,
      "y": 195,
      "color": "#8b1a1a",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "wayne"
      ]
    },
    {
      "id": "dick",
      "label": "DICK",
      "subtitle": "Dick Grayson",
      "kind": "character",
      "ref": "Dick Grayson",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 745,
      "y": 195,
      "color": "#8b1a1a",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "wayne"
      ]
    },
    {
      "id": "tim",
      "label": "TIM",
      "subtitle": "Tim Drake",
      "kind": "character",
      "ref": "Tim Drake",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 745,
      "y": 288,
      "color": "#8b1a1a",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "wayne"
      ]
    },
    {
      "id": "mgann",
      "label": "M'GANN",
      "subtitle": "M'gann M'orzz",
      "kind": "character",
      "ref": "M'gann M'orzz",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 255,
      "y": 456,
      "color": "#0a8a4a",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "marciano"
      ]
    },
    {
      "id": "conner2",
      "label": "CONNER",
      "subtitle": "Conner Kent",
      "kind": "character",
      "ref": "Conner Kent",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 434,
      "y": 545,
      "color": "#0064a8",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "marciano"
      ]
    },
    {
      "id": "mark",
      "label": "M'ARK",
      "subtitle": "M'ark",
      "kind": "character",
      "ref": "M'ark",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 255,
      "y": 545,
      "color": "#0a8a4a",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "marciano"
      ]
    },
    {
      "id": "armek",
      "label": "ARMEK",
      "subtitle": "Armek",
      "kind": "custom",
      "ref": "",
      "route": "",
      "icon": "",
      "mediaMode": "library",
      "mediaId": "armek",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 54,
        "y": 0,
        "zoom": 2
      },
      "x": 76,
      "y": 545,
      "color": "#3a3028",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "marciano"
      ]
    },
    {
      "id": "jonn",
      "label": "J'ONN",
      "subtitle": "J'onn J'onzz",
      "kind": "character",
      "ref": "J'onn J'onzz",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 255,
      "y": 628,
      "color": "#0a8a4a",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "marciano"
      ]
    },
    {
      "id": "lobo",
      "label": "LOBO",
      "subtitle": "Lobo",
      "kind": "character",
      "ref": "Lobo",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 572,
      "y": 545,
      "color": "#3a3028",
      "r": 44,
      "visibility": "public",
      "nuclei": [
        "lobo"
      ]
    },
    {
      "id": "riot",
      "label": "RIOT",
      "subtitle": "Riot",
      "kind": "character",
      "ref": "Riot",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 745,
      "y": 545,
      "color": "#3a3028",
      "r": 44,
      "visibility": "public",
      "nuclei": [
        "lobo"
      ]
    },
    {
      "id": "kendra",
      "label": "KENDRA",
      "subtitle": "Kendra Saunders",
      "kind": "character",
      "ref": "Kendra Saunders",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 745,
      "y": 462,
      "color": "#8b1a1a",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "lobo"
      ]
    },
    {
      "id": "rex-mason",
      "label": "Rex Mason",
      "subtitle": "Metamorpho",
      "kind": "character",
      "ref": "Rex Mason",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 745,
      "y": 628,
      "color": "#8b1a1a",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "lobo"
      ]
    },
    {
      "id": "entidade-19",
      "label": "Michael Carter",
      "subtitle": "Gladiador Dourado",
      "kind": "character",
      "ref": "Michael Carter",
      "route": "",
      "icon": "",
      "mediaMode": "character",
      "mediaId": "",
      "mediaUrl": "",
      "mediaFraming": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "x": 918,
      "y": 545,
      "color": "#3a3028",
      "r": 38,
      "visibility": "public",
      "nuclei": [
        "lobo"
      ]
    },
    {
      "id": "vb-leland",
      "label": "LELAND SHAW",
      "subtitle": "Shaw Innovations",
      "kind": "character",
      "ref": "Leland Shaw",
      "x": 1110,
      "y": 105,
      "color": "#8b1a1a",
      "r": 34,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-camila",
      "label": "CAMILA VARGAS",
      "subtitle": "Braço direito de Shaw",
      "kind": "character",
      "ref": "Camila Vargas",
      "x": 1110,
      "y": 185,
      "color": "#8b1a1a",
      "r": 34,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-donovan",
      "label": "DONOVAN MASON",
      "subtitle": "Vanguard-Stagg",
      "kind": "character",
      "ref": "Donovan Mason",
      "x": 1110,
      "y": 265,
      "color": "#8b1a1a",
      "r": 34,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-matheus",
      "label": "MATHEUS SILVA",
      "subtitle": "O Fantasma",
      "kind": "character",
      "ref": "Matheus Silva",
      "x": 1110,
      "y": 385,
      "color": "#8b1a1a",
      "r": 34,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-boris",
      "label": "BORIS BORKOV",
      "subtitle": "O Urso",
      "kind": "character",
      "ref": "Boris Borkov",
      "x": 1110,
      "y": 505,
      "color": "#8b1a1a",
      "r": 34,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-general",
      "label": "GENERAL MARKOV",
      "subtitle": "Irmandade Markoviana",
      "kind": "character",
      "ref": "General Markov",
      "x": 1110,
      "y": 625,
      "color": "#8b1a1a",
      "r": 34,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-shaw",
      "label": "SHAW INNOVATIONS",
      "subtitle": "Empresa",
      "kind": "organization",
      "ref": "shaw-innovations",
      "route": "/organizacoes/shaw-innovations",
      "x": 1385,
      "y": 105,
      "color": "#a47719",
      "r": 36,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-stagg",
      "label": "VANGUARD-STAGG",
      "subtitle": "Empresa",
      "kind": "organization",
      "ref": "vanguard-stagg-industries",
      "route": "/organizacoes/vanguard-stagg-industries",
      "x": 1385,
      "y": 265,
      "color": "#a47719",
      "r": 36,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-espectros",
      "label": "OS ESPECTROS",
      "subtitle": "Facção de Coral Gate",
      "kind": "faction",
      "ref": "os-espectros",
      "route": "/organizacoes/os-espectros",
      "x": 1385,
      "y": 365,
      "color": "#76578d",
      "r": 36,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-martillo",
      "label": "LOS MARTILLO",
      "subtitle": "Gangue de Coral Gate",
      "kind": "faction",
      "ref": "los-martillo",
      "route": "/organizacoes/los-martillo",
      "x": 1385,
      "y": 435,
      "color": "#76578d",
      "r": 34,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-bratva",
      "label": "BRATVA VOLKOV",
      "subtitle": "Facção de O Dique",
      "kind": "faction",
      "ref": "bratva-volkov",
      "route": "/organizacoes/bratva-volkov",
      "x": 1385,
      "y": 515,
      "color": "#76578d",
      "r": 36,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-irmandade",
      "label": "IRMANDADE MARKOVIANA",
      "subtitle": "Pequena Markóvia",
      "kind": "faction",
      "ref": "irmandade-markoviana",
      "route": "/organizacoes/irmandade-markoviana",
      "x": 1385,
      "y": 625,
      "color": "#76578d",
      "r": 36,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-noface",
      "label": "NO-FACE",
      "subtitle": "Grupo hacker",
      "kind": "faction",
      "ref": "no-face",
      "route": "/organizacoes/no-face",
      "x": 1385,
      "y": 555,
      "color": "#76578d",
      "r": 32,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-shaw-spire",
      "label": "SHAW SPIRE",
      "subtitle": "A Muralha",
      "kind": "location",
      "ref": "Shaw Spire",
      "x": 1655,
      "y": 105,
      "color": "#3f7f53",
      "r": 31,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-stagg-pinnacle",
      "label": "STAGG PINNACLE",
      "subtitle": "A Muralha",
      "kind": "location",
      "ref": "Vanguard-Stagg Pinnacle",
      "x": 1655,
      "y": 265,
      "color": "#3f7f53",
      "r": 31,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-rumba",
      "label": "RUMBA & SAMBA ROOM",
      "subtitle": "Coral Gate",
      "kind": "location",
      "ref": "Rumba & Samba Room",
      "x": 1655,
      "y": 385,
      "color": "#3f7f53",
      "r": 31,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-urso-polar",
      "label": "BAR URSO POLAR",
      "subtitle": "O Dique",
      "kind": "location",
      "ref": "Bar Urso Polar",
      "x": 1655,
      "y": 505,
      "color": "#3f7f53",
      "r": 31,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-centro-markoviano",
      "label": "CENTRO MARKOVIANO",
      "subtitle": "Downtown",
      "kind": "location",
      "ref": "Centro Cultural Markoviano",
      "x": 1655,
      "y": 625,
      "color": "#3f7f53",
      "r": 31,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    },
    {
      "id": "vb-comutador",
      "label": "O COMUTADOR",
      "subtitle": "A Muralha",
      "kind": "location",
      "ref": "O Comutador",
      "x": 1655,
      "y": 555,
      "color": "#3f7f53",
      "r": 31,
      "visibility": "public",
      "nuclei": [
        "vanguard-bay"
      ]
    }
  ],
  "edges": [
    {
      "id": "oliver-dinah",
      "from": "oliver",
      "to": "dinah",
      "type": "romance",
      "label": "casal",
      "note": "",
      "strength": 5,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "oliver-tristan",
      "from": "oliver",
      "to": "tristan",
      "type": "family",
      "label": "pai",
      "note": "",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "dinah-tristan",
      "from": "dinah",
      "to": "tristan",
      "type": "family",
      "label": "mãe",
      "note": "",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "oliver-connor",
      "from": "oliver",
      "to": "connor",
      "type": "family",
      "label": "pai",
      "note": "",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "tristan-connor",
      "from": "tristan",
      "to": "connor",
      "type": "family",
      "label": "irmãos",
      "note": "",
      "strength": 5,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "bruce-damian",
      "from": "bruce",
      "to": "damian",
      "type": "family",
      "label": "biológico",
      "note": "",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "bruce-jason",
      "from": "bruce",
      "to": "jason",
      "type": "family",
      "label": "adotivo",
      "note": "",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "bruce-dick",
      "from": "bruce",
      "to": "dick",
      "type": "family",
      "label": "adotivo",
      "note": "",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "bruce-tim",
      "from": "bruce",
      "to": "tim",
      "type": "family",
      "label": "adotivo",
      "note": "",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "mgann-armek",
      "from": "mgann",
      "to": "armek",
      "type": "tension",
      "label": "vítima",
      "note": "",
      "strength": 5,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "armek-mark",
      "from": "armek",
      "to": "mark",
      "type": "family",
      "label": "pai",
      "note": "",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "mgann-mark",
      "from": "mgann",
      "to": "mark",
      "type": "family",
      "label": "mãe",
      "note": "",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "mgann-conner2",
      "from": "mgann",
      "to": "conner2",
      "type": "romance",
      "label": "casal",
      "note": "",
      "strength": 5,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "mgann-jonn",
      "from": "mgann",
      "to": "jonn",
      "type": "mentor",
      "label": "mentor",
      "note": "",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "jonn-armek",
      "from": "jonn",
      "to": "armek",
      "type": "enemy",
      "label": "inimigos",
      "note": "",
      "strength": 5,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "conner2-mark",
      "from": "conner2",
      "to": "mark",
      "type": "ally",
      "label": "paterno",
      "note": "",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "jonn-mark",
      "from": "jonn",
      "to": "mark",
      "type": "mentor",
      "label": "mentor",
      "note": "",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "lobo-riot",
      "from": "lobo",
      "to": "riot",
      "type": "origin",
      "label": "origem genética",
      "note": "",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "kendra-riot",
      "from": "kendra",
      "to": "riot",
      "type": "family",
      "label": "mãe adotiva",
      "note": "",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "kendra-lobo",
      "from": "kendra",
      "to": "lobo",
      "type": "tension",
      "label": "aliados / inimigos",
      "note": "",
      "strength": 4,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "relacao-rex-mason-kendra-ally",
      "from": "rex-mason",
      "to": "kendra",
      "type": "ally",
      "label": "Parceiro de Missão",
      "note": "Partiparam da mesma missão para salvar Riot quando ele era um bebê",
      "strength": 2,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "relacao-kendra-oliver-ally",
      "from": "kendra",
      "to": "oliver",
      "type": "ally",
      "label": "Parceiro de Missão",
      "note": "Também participou da missão do bebê Riot",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "relacao-jason-tristan-mentor",
      "from": "jason",
      "to": "tristan",
      "type": "mentor",
      "label": "Mentor",
      "note": "",
      "strength": 5,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "relacao-rex-mason-oliver-ally",
      "from": "rex-mason",
      "to": "oliver",
      "type": "ally",
      "label": "Parceiro de Missão",
      "note": "",
      "strength": 2,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "relacao-entidade-19-kendra-ally",
      "from": "entidade-19",
      "to": "kendra",
      "type": "ally",
      "label": "Parceiro de Missão",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "vb-leland-shaw",
      "from": "vb-leland",
      "to": "vb-shaw",
      "type": "command",
      "label": "CEO",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "vb-camila-shaw",
      "from": "vb-camila",
      "to": "vb-shaw",
      "type": "member",
      "label": "braço direito",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "vb-shaw-spire-edge",
      "from": "vb-shaw",
      "to": "vb-shaw-spire",
      "type": "business",
      "label": "sede",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "vb-donovan-stagg",
      "from": "vb-donovan",
      "to": "vb-stagg",
      "type": "command",
      "label": "diretor",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "vb-stagg-pinnacle-edge",
      "from": "vb-stagg",
      "to": "vb-stagg-pinnacle",
      "type": "business",
      "label": "sede",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "vb-donovan-leland",
      "from": "vb-donovan",
      "to": "vb-leland",
      "type": "rivalry",
      "label": "desprezo / rivalidade",
      "strength": 4,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "vb-matheus-espectros",
      "from": "vb-matheus",
      "to": "vb-espectros",
      "type": "command",
      "label": "líder",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "vb-espectros-rumba",
      "from": "vb-espectros",
      "to": "vb-rumba",
      "type": "business",
      "label": "base",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "vb-espectros-martillo",
      "from": "vb-espectros",
      "to": "vb-martillo",
      "type": "rivalry",
      "label": "conflito territorial",
      "strength": 4,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "vb-boris-bratva",
      "from": "vb-boris",
      "to": "vb-bratva",
      "type": "command",
      "label": "líder",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "vb-bratva-urso",
      "from": "vb-bratva",
      "to": "vb-urso-polar",
      "type": "business",
      "label": "quartel-general",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "vb-general-irmandade",
      "from": "vb-general",
      "to": "vb-irmandade",
      "type": "command",
      "label": "líder",
      "strength": 5,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "vb-irmandade-centro",
      "from": "vb-irmandade",
      "to": "vb-centro-markoviano",
      "type": "business",
      "label": "base / fachada",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    },
    {
      "id": "vb-noface-comutador",
      "from": "vb-noface",
      "to": "vb-comutador",
      "type": "business",
      "label": "ponto de encontro",
      "strength": 4,
      "directed": true,
      "visibility": "public"
    }
  ]
};

})();
