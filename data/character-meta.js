(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

window.TerraZData.characterTaxonomy = {
  "nuclei": [
    {
      "id": "vanguard",
      "label": "Vanguard Bay"
    },
    {
      "id": "jlu",
      "label": "Liga da Justiça"
    },
    {
      "id": "queen",
      "label": "Queen / Arqueiros"
    },
    {
      "id": "gotham",
      "label": "Gotham / Bat Família"
    },
    {
      "id": "martian",
      "label": "Marcianos"
    },
    {
      "id": "lobo-cadmus",
      "label": "Projeto Sumdac"
    },
    {
      "id": "new-titans",
      "label": "Jovens Titãs"
    },
    {
      "id": "novos-titas",
      "label": "Novos Titãs"
    },
    {
      "id": "other",
      "label": "Outros"
    }
  ],
  "types": [
    {
      "id": "protagonist",
      "label": "Protagonista"
    },
    {
      "id": "hero",
      "label": "Herói"
    },
    {
      "id": "antihero",
      "label": "Anti-herói"
    },
    {
      "id": "villain",
      "label": "Vilão"
    },
    {
      "id": "npc",
      "label": "NPC"
    },
    {
      "id": "civilian",
      "label": "Civil"
    },
    {
      "id": "other",
      "label": "Outro"
    }
  ],
  "statuses": [
    {
      "id": "active",
      "label": "Ativo"
    },
    {
      "id": "retired",
      "label": "Aposentado"
    },
    {
      "id": "missing",
      "label": "Desaparecido"
    },
    {
      "id": "dead",
      "label": "Morto"
    },
    {
      "id": "unknown",
      "label": "Desconhecido"
    }
  ],
  "characters": {
    "Tristan Queen": {
      "featured": true,
      "nuclei": [
        "vanguard",
        "queen"
      ],
      "type": "protagonist",
      "status": "active"
    },
    "Riot": {
      "featured": true,
      "nuclei": [
        "vanguard",
        "lobo-cadmus"
      ],
      "type": "protagonist",
      "status": "active"
    },
    "M'ark": {
      "featured": true,
      "nuclei": [
        "vanguard",
        "martian"
      ],
      "type": "protagonist",
      "status": "missing",
      "visibility": "public"
    },
    "Kendra Saunders": {
      "featured": false,
      "nuclei": [
        "lobo-cadmus",
        "jlu"
      ],
      "type": "hero",
      "status": "active"
    },
    "Lobo": {
      "featured": false,
      "nuclei": [
        "lobo-cadmus",
        "jlu"
      ],
      "type": "antihero",
      "status": "active"
    },
    "M'gann M'orzz": {
      "featured": false,
      "nuclei": [
        "martian",
        "novos-titas"
      ],
      "type": "hero",
      "status": "active"
    },
    "J'onn J'onzz": {
      "featured": false,
      "nuclei": [
        "martian",
        "jlu"
      ],
      "type": "hero",
      "status": "active"
    },
    "Oliver Queen": {
      "featured": false,
      "nuclei": [
        "queen",
        "gotham",
        "lobo-cadmus",
        "jlu"
      ],
      "type": "hero",
      "status": "active"
    },
    "Dinah Lance": {
      "featured": false,
      "nuclei": [
        "queen",
        "gotham"
      ],
      "type": "hero",
      "status": "active"
    },
    "Connor Hawke": {
      "featured": false,
      "nuclei": [
        "queen"
      ],
      "type": "hero",
      "status": "active"
    },
    "Jason Todd": {
      "featured": false,
      "nuclei": [
        "gotham",
        "new-titans"
      ],
      "type": "antihero",
      "status": "active"
    },
    "Conner Kent": {
      "featured": false,
      "nuclei": [
        "martian",
        "novos-titas"
      ],
      "type": "hero",
      "status": "active"
    },
    "Bruce Wayne": {
      "featured": false,
      "nuclei": [
        "gotham",
        "jlu"
      ],
      "type": "hero",
      "status": "active"
    },
    "Dick Grayson": {
      "featured": false,
      "nuclei": [
        "gotham",
        "novos-titas"
      ],
      "type": "hero",
      "status": "active"
    },
    "Barbara Gordon": {
      "featured": false,
      "nuclei": [
        "gotham",
        "jlu"
      ],
      "type": "hero",
      "status": "active"
    },
    "Damian Wayne": {
      "featured": false,
      "nuclei": [
        "gotham"
      ],
      "type": "hero",
      "status": "active"
    },
    "Tim Drake": {
      "featured": false,
      "nuclei": [
        "gotham"
      ],
      "type": "civilian",
      "status": "retired"
    },
    "Verity Pennyworth": {
      "featured": false,
      "nuclei": [
        "gotham"
      ],
      "type": "civilian",
      "status": "active"
    },
    "Lian Harper": {
      "featured": false,
      "nuclei": [
        "queen",
        "new-titans"
      ],
      "type": "hero",
      "status": "active"
    },
    "Roy Harper": {
      "featured": false,
      "nuclei": [
        "queen"
      ],
      "type": "hero",
      "status": "active"
    },
    "George Gandenzio Toombs": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active"
    },
    "Michael Carter": {
      "featured": false,
      "nuclei": [
        "jlu",
        "lobo-cadmus"
      ],
      "type": "npc",
      "status": "active"
    }
  }
};

})();
