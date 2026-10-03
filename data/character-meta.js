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
    },
    {
      "id": "cidadao",
      "label": "Cidadão"
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
  "tags": [],
  "characters": {
    "Tristan Queen": {
      "featured": true,
      "nuclei": [
        "vanguard",
        "queen"
      ],
      "type": "protagonist",
      "status": "active",
      "tags": []
    },
    "Riot": {
      "featured": true,
      "nuclei": [
        "vanguard",
        "lobo-cadmus"
      ],
      "type": "protagonist",
      "status": "active",
      "tags": []
    },
    "M'ark": {
      "featured": true,
      "nuclei": [
        "vanguard",
        "martian"
      ],
      "type": "protagonist",
      "status": "missing",
      "visibility": "public",
      "tags": []
    },
    "Kendra Saunders": {
      "featured": false,
      "nuclei": [
        "lobo-cadmus",
        "jlu"
      ],
      "type": "hero",
      "status": "active",
      "tags": []
    },
    "Lobo": {
      "featured": false,
      "nuclei": [
        "jlu",
        "lobo-cadmus"
      ],
      "type": "antihero",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "M'gann M'orzz": {
      "featured": false,
      "nuclei": [
        "martian",
        "novos-titas"
      ],
      "type": "hero",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "J'onn J'onzz": {
      "featured": false,
      "nuclei": [
        "martian",
        "jlu"
      ],
      "type": "hero",
      "status": "active",
      "tags": []
    },
    "Oliver Queen": {
      "featured": false,
      "nuclei": [
        "jlu",
        "queen",
        "gotham",
        "lobo-cadmus"
      ],
      "type": "hero",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "Dinah Lance": {
      "featured": false,
      "nuclei": [
        "queen",
        "gotham"
      ],
      "type": "hero",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "Connor Hawke": {
      "featured": false,
      "nuclei": [
        "queen"
      ],
      "type": "hero",
      "status": "active",
      "tags": []
    },
    "Jason Todd": {
      "featured": false,
      "nuclei": [
        "gotham",
        "new-titans"
      ],
      "type": "antihero",
      "status": "active",
      "tags": []
    },
    "Conner Kent": {
      "featured": false,
      "nuclei": [
        "martian",
        "novos-titas"
      ],
      "type": "hero",
      "status": "active",
      "tags": []
    },
    "Bruce Wayne": {
      "featured": false,
      "nuclei": [
        "gotham",
        "jlu"
      ],
      "type": "hero",
      "status": "active",
      "tags": []
    },
    "Dick Grayson": {
      "featured": false,
      "nuclei": [
        "gotham",
        "novos-titas"
      ],
      "type": "hero",
      "status": "active",
      "tags": []
    },
    "Barbara Gordon": {
      "featured": false,
      "nuclei": [
        "jlu",
        "gotham"
      ],
      "type": "hero",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "Damian Wayne": {
      "featured": false,
      "nuclei": [
        "gotham"
      ],
      "type": "hero",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "Tim Drake": {
      "featured": false,
      "nuclei": [
        "gotham"
      ],
      "type": "civilian",
      "status": "retired",
      "tags": [],
      "visibility": "public"
    },
    "Verity Pennyworth": {
      "featured": false,
      "nuclei": [
        "gotham"
      ],
      "type": "civilian",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "Lian Harper": {
      "featured": false,
      "nuclei": [
        "queen",
        "new-titans"
      ],
      "type": "hero",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "Roy Harper": {
      "featured": false,
      "nuclei": [
        "queen"
      ],
      "type": "hero",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "George Gandenzio Toombs": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "Michael Carter": {
      "featured": false,
      "nuclei": [
        "jlu",
        "lobo-cadmus"
      ],
      "type": "npc",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "Rex Mason": {
      "featured": false,
      "nuclei": [
        "other"
      ],
      "type": "npc",
      "status": "active",
      "tags": [],
      "visibility": "public"
    }
  }
};

})();
