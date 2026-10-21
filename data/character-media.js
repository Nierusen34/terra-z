(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Metadados visuais de personagens.
// src vazio = usar placeholder do Terra Z.
window.TerraZData.characterMedia = {
  "Tristan Queen": {
    "src": "images/characters/tristan-queen.jpg",
    "alt": "Tristan Queen",
    "source": "local",
    "credit": ""
  },
  "Riot": {
    "src": "images/characters/riot.jpg",
    "alt": "Riot",
    "source": "local",
    "credit": ""
  },
  "M'ark": {
    "src": "images/characters/mark.jpg",
    "alt": "M'ark",
    "source": "local",
    "credit": "",
    "framing": {
      "card": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "sheet": {
        "fit": "cover",
        "x": 50,
        "y": 50,
        "zoom": 1
      },
      "graph": {
        "fit": "cover",
        "x": 70,
        "y": 6,
        "zoom": 2.5
      }
    }
  },
  "Kendra Saunders": {
    "src": "",
    "alt": "Kendra Saunders",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Kendra Saunders (Prime Earth)"
    }
  },
  "Lobo": {
    "src": "",
    "alt": "Lobo",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Lobo (Prime Earth)"
    }
  },
  "M'gann M'orzz": {
    "src": "",
    "alt": "M'gann M'orzz",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "M'gann M'orzz (Prime Earth)"
    },
    "framing": {
      "card": {
        "fit": "cover",
        "x": 50,
        "y": 7,
        "zoom": 1
      },
      "sheet": {
        "fit": "cover",
        "x": 50,
        "y": 8,
        "zoom": 1
      },
      "graph": {
        "fit": "cover",
        "x": 50,
        "y": 0,
        "zoom": 1
      }
    }
  },
  "J'onn J'onzz": {
    "src": "",
    "alt": "J'onn J'onzz",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "J'onn J'onzz (Prime Earth)"
    }
  },
  "Oliver Queen": {
    "src": "",
    "alt": "Oliver Queen",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Oliver Queen (Prime Earth)"
    }
  },
  "Dinah Lance": {
    "src": "",
    "alt": "Dinah Lance",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "external-url",
      "imageUrl": "https://i.pinimg.com/736x/7c/c8/3f/7cc83fd1736c5f0544a82fe2cb56eb2f.jpg",
      "sourceLabel": "Google Imagens · Dan Mora"
    }
  },
  "Connor Hawke": {
    "src": "",
    "alt": "Connor Hawke",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Connor Hawke"
    }
  },
  "Jason Todd": {
    "src": "",
    "alt": "Jason Todd",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Jason Todd (Prime Earth)"
    }
  },
  "Conner Kent": {
    "src": "images/characters/conner-kent.jpg",
    "alt": "Conner Kent",
    "source": "local",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Kon-El (Prime Earth)"
    }
  },
  "Bruce Wayne": {
    "src": "",
    "alt": "Bruce Wayne",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Bruce Wayne (Prime Earth)"
    },
    "framing": {
      "card": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "sheet": {
        "fit": "cover",
        "x": 50,
        "y": 8,
        "zoom": 1
      },
      "graph": {
        "fit": "cover",
        "x": 50,
        "y": 0,
        "zoom": 1
      }
    }
  },
  "Dick Grayson": {
    "src": "",
    "alt": "Dick Grayson",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Richard Grayson (Prime Earth)"
    }
  },
  "Barbara Gordon": {
    "src": "",
    "alt": "Barbara Gordon",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "external-url",
      "imageUrl": "https://i.pinimg.com/736x/ee/f0/38/eef0385e1a2dac794f9794e528db89d5.jpg",
      "sourceLabel": "Google Imagens · Dan Mora"
    },
    "framing": {
      "card": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "sheet": {
        "fit": "cover",
        "x": 50,
        "y": 8,
        "zoom": 1
      },
      "graph": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      }
    }
  },
  "Damian Wayne": {
    "src": "",
    "alt": "Damian Wayne",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Damian Wayne (Prime Earth)"
    }
  },
  "Tim Drake": {
    "src": "",
    "alt": "Tim Drake",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Timothy Drake (Prime Earth)"
    },
    "framing": {
      "card": {
        "fit": "cover",
        "x": 50,
        "y": 24,
        "zoom": 1
      },
      "sheet": {
        "fit": "cover",
        "x": 50,
        "y": 8,
        "zoom": 1
      },
      "graph": {
        "fit": "cover",
        "x": 22,
        "y": 8,
        "zoom": 1.6
      }
    }
  },
  "Verity Pennyworth": {
    "src": "",
    "alt": "Verity Pennyworth",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Verity Pennyworth"
    }
  },
  "Lian Harper": {
    "src": "",
    "alt": "Lian Harper",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Lian Harper (Prime Earth)"
    }
  },
  "Roy Harper": {
    "src": "",
    "alt": "Roy Harper",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Roy Harper (Prime Earth)"
    }
  },
  "George Gandenzio Toombs": {
    "src": "images/characters/george-gandenzio-toombs.png",
    "alt": "George Gandenzio Toombs",
    "source": "local",
    "credit": ""
  },
  "Michael Carter": {
    "src": "",
    "alt": "Michael Carter",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Michael Carter (New Earth)"
    }
  },
  "Rex Mason": {
    "src": "",
    "alt": "Rex Mason",
    "source": "auto",
    "credit": "",
    "auto": {
      "provider": "dc-fandom",
      "wikiTitle": "Metamorpho"
    }
  },
  "Leland Shaw": {
    "src": "images/characters/leland-shaw.jpg",
    "alt": "Leland Shaw",
    "source": "local",
    "credit": ""
  },
  "Alden Mitchell": {
    "src": "",
    "alt": "Alden Mitchell",
    "source": "local",
    "credit": ""
  },
  "Geneviève Lachance": {
    "src": "",
    "alt": "Geneviève Lachance",
    "source": "local",
    "credit": ""
  },
  "Marcos Jimenez": {
    "src": "",
    "alt": "Marcos Jimenez",
    "source": "local",
    "credit": ""
  },
  "Dr. Kenji Tanaka": {
    "src": "",
    "alt": "Dr. Kenji Tanaka",
    "source": "local",
    "credit": ""
  },
  "Dr. Ahron Nax": {
    "src": "",
    "alt": "Dr. Ahron Nax",
    "source": "local",
    "credit": ""
  },
  "Silas": {
    "src": "",
    "alt": "Silas",
    "source": "local",
    "credit": ""
  },
  "Lila Marlowe": {
    "src": "",
    "alt": "Lila Marlowe",
    "source": "local",
    "credit": ""
  },
  "Camila Vargas": {
    "src": "",
    "alt": "Camila Vargas",
    "source": "local",
    "credit": ""
  },
  "Alia Hazari": {
    "src": "",
    "alt": "Alia Hazari",
    "source": "local",
    "credit": ""
  },
  "Donovan Mason": {
    "src": "",
    "alt": "Donovan Mason",
    "source": "local",
    "credit": ""
  },
  "Dra. Zara Kovač": {
    "src": "",
    "alt": "Dra. Zara Kovač",
    "source": "local",
    "credit": ""
  },
  "Dra. Anya Petrova": {
    "src": "",
    "alt": "Dra. Anya Petrova",
    "source": "local",
    "credit": ""
  },
  "Roxana \"Roxy\" Sharpe": {
    "src": "",
    "alt": "Roxana \"Roxy\" Sharpe",
    "source": "local",
    "credit": ""
  },
  "Antoine Devereaux": {
    "src": "",
    "alt": "Antoine Devereaux",
    "source": "local",
    "credit": ""
  },
  "Matheus Silva": {
    "src": "",
    "alt": "Matheus Silva",
    "source": "local",
    "credit": ""
  },
  "Oficial Leo Martinez": {
    "src": "",
    "alt": "Oficial Leo Martinez",
    "source": "local",
    "credit": ""
  },
  "Mama Montoya": {
    "src": "",
    "alt": "Mama Montoya",
    "source": "local",
    "credit": ""
  },
  "Hector Ramos": {
    "src": "",
    "alt": "Hector Ramos",
    "source": "local",
    "credit": ""
  },
  "Lina Ramos": {
    "src": "",
    "alt": "Lina Ramos",
    "source": "local",
    "credit": ""
  },
  "Dra. Ana Cruz": {
    "src": "",
    "alt": "Dra. Ana Cruz",
    "source": "local",
    "credit": ""
  },
  "Pops Carter": {
    "src": "",
    "alt": "Pops Carter",
    "source": "local",
    "credit": ""
  },
  "Lucia Ortega": {
    "src": "",
    "alt": "Lucia Ortega",
    "source": "local",
    "credit": ""
  },
  "Dante Rodrigues": {
    "src": "",
    "alt": "Dante Rodrigues",
    "source": "local",
    "credit": ""
  },
  "General Markov": {
    "src": "",
    "alt": "General Markov",
    "source": "local",
    "credit": ""
  },
  "Flinch Archer": {
    "src": "",
    "alt": "Flinch Archer",
    "source": "local",
    "credit": ""
  },
  "Juíza Mariana Sandoval": {
    "src": "",
    "alt": "Juíza Mariana Sandoval",
    "source": "local",
    "credit": ""
  },
  "Julia Reyes": {
    "src": "",
    "alt": "Julia Reyes",
    "source": "local",
    "credit": ""
  },
  "Sofia Navarro": {
    "src": "",
    "alt": "Sofia Navarro",
    "source": "local",
    "credit": ""
  },
  "Boris Borkov": {
    "src": "",
    "alt": "Boris Borkov",
    "source": "local",
    "credit": ""
  },
  "Osias \"Osi\" Rivers": {
    "src": "",
    "alt": "Osias \"Osi\" Rivers",
    "source": "local",
    "credit": ""
  },
  "Dra. Helen Finch": {
    "src": "",
    "alt": "Dra. Helen Finch",
    "source": "local",
    "credit": ""
  },
  "Brigitte Oliveira": {
    "src": "",
    "alt": "Brigitte Oliveira",
    "source": "local",
    "credit": ""
  }
};

})();
