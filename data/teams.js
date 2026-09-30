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

})();
