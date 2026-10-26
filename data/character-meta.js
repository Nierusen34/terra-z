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
  "tags": [
    {
      "id": "ilha-solara",
      "label": "Ilha Solara"
    },
    {
      "id": "a-muralha",
      "label": "A Muralha"
    },
    {
      "id": "coral-gate",
      "label": "Coral Gate"
    },
    {
      "id": "downtown",
      "label": "Downtown"
    },
    {
      "id": "o-dique",
      "label": "O Dique"
    }
  ],
  "characters": {
    "Tristan Queen": {
      "featured": true,
      "nuclei": [
        "queen"
      ],
      "type": "protagonist",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "Riot": {
      "featured": true,
      "nuclei": [
        "lobo-cadmus"
      ],
      "type": "protagonist",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "M'ark": {
      "featured": true,
      "nuclei": [
        "martian"
      ],
      "type": "protagonist",
      "status": "missing",
      "tags": [],
      "visibility": "public"
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
      "tags": [],
      "visibility": "public"
    },
    "Jason Todd": {
      "featured": false,
      "nuclei": [
        "gotham",
        "new-titans"
      ],
      "type": "antihero",
      "status": "active",
      "tags": [],
      "visibility": "public"
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
        "jlu",
        "gotham"
      ],
      "type": "hero",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "Dick Grayson": {
      "featured": false,
      "nuclei": [
        "gotham",
        "novos-titas"
      ],
      "type": "hero",
      "status": "active",
      "tags": [],
      "visibility": "public"
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
      "tags": [
        "downtown"
      ],
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
        "jlu",
        "lobo-cadmus"
      ],
      "type": "npc",
      "status": "active",
      "tags": [],
      "visibility": "public"
    },
    "Leland Shaw": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "ilha-solara"
      ],
      "visibility": "public"
    },
    "Alden Mitchell": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "hero",
      "status": "retired",
      "tags": [
        "ilha-solara"
      ],
      "visibility": "public"
    },
    "Geneviève Lachance": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "ilha-solara"
      ],
      "visibility": "public"
    },
    "Marcos Jimenez": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "civilian",
      "status": "active",
      "tags": [
        "ilha-solara"
      ],
      "visibility": "public"
    },
    "Dr. Kenji Tanaka": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "ilha-solara"
      ],
      "visibility": "public"
    },
    "Dr. Ahron Nax": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "ilha-solara"
      ],
      "visibility": "public"
    },
    "Silas": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "ilha-solara"
      ],
      "visibility": "public"
    },
    "Lila Marlowe": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "dead",
      "tags": [
        "ilha-solara"
      ],
      "visibility": "public"
    },
    "Camila Vargas": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "a-muralha"
      ],
      "visibility": "public"
    },
    "Alia Hazari": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "a-muralha"
      ],
      "visibility": "public"
    },
    "Donovan Mason": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "a-muralha"
      ],
      "visibility": "public"
    },
    "Dra. Zara Kovač": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "a-muralha"
      ],
      "visibility": "public"
    },
    "Dra. Anya Petrova": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "a-muralha"
      ],
      "visibility": "public"
    },
    "Roxana \"Roxy\" Sharpe": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "civilian",
      "status": "active",
      "tags": [
        "a-muralha"
      ],
      "visibility": "public"
    },
    "Antoine Devereaux": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "a-muralha"
      ],
      "visibility": "public"
    },
    "Matheus Silva": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "coral-gate"
      ],
      "visibility": "public"
    },
    "Oficial Leo Martinez": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "coral-gate"
      ],
      "visibility": "public"
    },
    "Mama Montoya": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "civilian",
      "status": "active",
      "tags": [
        "coral-gate"
      ],
      "visibility": "public"
    },
    "Hector Ramos": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "coral-gate"
      ],
      "visibility": "public"
    },
    "Lina Ramos": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "coral-gate"
      ],
      "visibility": "public"
    },
    "Dra. Ana Cruz": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "civilian",
      "status": "active",
      "tags": [
        "coral-gate"
      ],
      "visibility": "public"
    },
    "Pops Carter": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "civilian",
      "status": "active",
      "tags": [
        "coral-gate"
      ],
      "visibility": "public"
    },
    "Lucia Ortega": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "civilian",
      "status": "active",
      "tags": [
        "coral-gate"
      ],
      "visibility": "public"
    },
    "Dante Rodrigues": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "civilian",
      "status": "active",
      "tags": [
        "coral-gate"
      ],
      "visibility": "public"
    },
    "General Markov": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "downtown"
      ],
      "visibility": "public"
    },
    "Flinch Archer": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "downtown"
      ],
      "visibility": "public"
    },
    "Juíza Mariana Sandoval": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "downtown"
      ],
      "visibility": "public"
    },
    "Julia Reyes": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "downtown"
      ],
      "visibility": "public"
    },
    "Sofia Navarro": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "civilian",
      "status": "active",
      "tags": [
        "downtown"
      ],
      "visibility": "public"
    },
    "Boris Borkov": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "o-dique"
      ],
      "visibility": "public"
    },
    "Osias \"Osi\" Rivers": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "civilian",
      "status": "active",
      "tags": [
        "o-dique"
      ],
      "visibility": "public"
    },
    "Dra. Helen Finch": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "npc",
      "status": "active",
      "tags": [
        "o-dique"
      ],
      "visibility": "public"
    },
    "Brigitte Oliveira": {
      "featured": false,
      "nuclei": [
        "vanguard"
      ],
      "type": "civilian",
      "status": "active",
      "tags": [
        "o-dique"
      ],
      "visibility": "public"
    }
  }
};

})();
