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
  }
};

})();
