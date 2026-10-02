(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Grafo publicado pelo editor visual. null = usar data/relations.js como padrão.
window.TerraZData.graphOverride = {
  "version": 3,
  "quadrants": [
    {
      "id": "queen",
      "title": "FAMÍLIA QUEEN",
      "x": 20,
      "y": 20,
      "w": 470,
      "h": 340,
      "color": "#c45a1c",
      "bg": "rgba(196,90,28,.06)"
    },
    {
      "id": "wayne",
      "title": "FAMÍLIA WAYNE",
      "x": 510,
      "y": 20,
      "w": 470,
      "h": 340,
      "color": "#0064a8",
      "bg": "rgba(0,100,168,.06)"
    },
    {
      "id": "marciano",
      "title": "NÚCLEO MARCIANO",
      "x": 20,
      "y": 380,
      "w": 470,
      "h": 320,
      "color": "#0a8a4a",
      "bg": "rgba(10,138,74,.06)"
    },
    {
      "id": "lobo",
      "title": "PRAZO DE LOBO",
      "x": 510,
      "y": 380,
      "w": 470,
      "h": 320,
      "color": "#7a4aff",
      "bg": "rgba(122,74,255,.06)"
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
      "x": 140,
      "y": 130,
      "color": "#c45a1c",
      "r": 34,
      "visibility": "public"
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
      "x": 140,
      "y": 240,
      "color": "#8b1a1a",
      "r": 34,
      "visibility": "public"
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
      "x": 300,
      "y": 240,
      "color": "#c45a1c",
      "r": 34,
      "visibility": "public"
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
      "x": 400,
      "y": 130,
      "color": "#3a3028",
      "r": 34,
      "visibility": "public"
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
      "x": 700,
      "y": 130,
      "color": "#1a1512",
      "r": 34,
      "visibility": "public"
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
      "x": 800,
      "y": 130,
      "color": "#8b1a1a",
      "r": 34,
      "visibility": "public"
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
      "x": 600,
      "y": 240,
      "color": "#8b1a1a",
      "r": 34,
      "visibility": "public"
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
      "x": 700,
      "y": 240,
      "color": "#8b1a1a",
      "r": 34,
      "visibility": "public"
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
      "x": 800,
      "y": 240,
      "color": "#8b1a1a",
      "r": 34,
      "visibility": "public"
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
      "x": 120,
      "y": 470,
      "color": "#0a8a4a",
      "r": 34,
      "visibility": "public"
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
      "x": 400,
      "y": 470,
      "color": "#0064a8",
      "r": 34,
      "visibility": "public"
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
      "x": 260,
      "y": 580,
      "color": "#0a8a4a",
      "r": 34,
      "visibility": "public"
    },
    {
      "id": "armek",
      "label": "ARMEK",
      "subtitle": "",
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
      "x": 120,
      "y": 650,
      "color": "#3a3028",
      "r": 34,
      "visibility": "public"
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
      "x": 400,
      "y": 650,
      "color": "#0a8a4a",
      "r": 34,
      "visibility": "public"
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
      "x": 660,
      "y": 490,
      "color": "#3a3028",
      "r": 40,
      "visibility": "public"
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
      "x": 660,
      "y": 620,
      "color": "#3a3028",
      "r": 40,
      "visibility": "public"
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
      "x": 800,
      "y": 620,
      "color": "#8b1a1a",
      "r": 34,
      "visibility": "public"
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "from": "oliver",
      "to": "dinah",
      "type": "family",
      "label": "casal",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-2",
      "from": "oliver",
      "to": "tristan",
      "type": "family",
      "label": "pai",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-3",
      "from": "dinah",
      "to": "tristan",
      "type": "family",
      "label": "mãe",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-4",
      "from": "oliver",
      "to": "connor",
      "type": "family",
      "label": "pai",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-5",
      "from": "tristan",
      "to": "connor",
      "type": "family",
      "label": "irmãos",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-6",
      "from": "bruce",
      "to": "damian",
      "type": "family",
      "label": "biológico",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-7",
      "from": "bruce",
      "to": "jason",
      "type": "family",
      "label": "adotivo",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-8",
      "from": "bruce",
      "to": "dick",
      "type": "family",
      "label": "adotivo",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-9",
      "from": "bruce",
      "to": "tim",
      "type": "family",
      "label": "adotivo",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-10",
      "from": "mgann",
      "to": "armek",
      "type": "tension",
      "label": "vítima",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-11",
      "from": "armek",
      "to": "mark",
      "type": "family",
      "label": "pai",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-12",
      "from": "mgann",
      "to": "mark",
      "type": "family",
      "label": "mãe",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-13",
      "from": "mgann",
      "to": "conner2",
      "type": "ally",
      "label": "casal",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-14",
      "from": "mgann",
      "to": "jonn",
      "type": "ally",
      "label": "mentor",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-15",
      "from": "jonn",
      "to": "armek",
      "type": "tension",
      "label": "inimigos",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-16",
      "from": "conner2",
      "to": "mark",
      "type": "ally",
      "label": "paterno",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-17",
      "from": "jonn",
      "to": "mark",
      "type": "ally",
      "label": "mentor",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-18",
      "from": "lobo",
      "to": "riot",
      "type": "clone",
      "label": "origem genética",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-19",
      "from": "kendra",
      "to": "riot",
      "type": "family",
      "label": "mãe adotiva",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    },
    {
      "id": "edge-20",
      "from": "kendra",
      "to": "lobo",
      "type": "tension",
      "label": "aliados/inimigos",
      "note": "",
      "strength": 3,
      "directed": false,
      "visibility": "public"
    }
  ]
};

})();
