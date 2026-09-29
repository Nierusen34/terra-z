(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Cidades externas e tempos/distâncias de referência.
window.TerraZData.externalCities = [
  {
    "city": "Gotham City",
    "flightKm": "~1.750",
    "flightTime": "~2h45",
    "driveKm": "~2.050",
    "driveTime": "~23h",
    "edit": {
      "city": {
        "id": "tz-0274",
        "legacyId": "e_273"
      },
      "flightKm": {
        "id": "tz-0275",
        "legacyId": "e_274"
      },
      "flightTime": {
        "id": "tz-0276",
        "legacyId": "e_275"
      },
      "driveKm": {
        "id": "tz-0277",
        "legacyId": "e_276"
      },
      "driveTime": {
        "id": "tz-0278",
        "legacyId": "e_277"
      }
    }
  },
  {
    "city": "Metrópolis",
    "flightKm": "~1.600",
    "flightTime": "~2h30",
    "driveKm": "~1.850",
    "driveTime": "~21h",
    "edit": {
      "city": {
        "id": "tz-0279",
        "legacyId": "e_278"
      },
      "flightKm": {
        "id": "tz-0280",
        "legacyId": "e_279"
      },
      "flightTime": {
        "id": "tz-0281",
        "legacyId": "e_280"
      },
      "driveKm": {
        "id": "tz-0282",
        "legacyId": "e_281"
      },
      "driveTime": {
        "id": "tz-0283",
        "legacyId": "e_282"
      }
    }
  },
  {
    "city": "Blüdhaven",
    "flightKm": "~1.600",
    "flightTime": "~2h30",
    "driveKm": "~1.900",
    "driveTime": "~21h",
    "edit": {
      "city": {
        "id": "tz-0284",
        "legacyId": "e_283"
      },
      "flightKm": {
        "id": "tz-0285",
        "legacyId": "e_284"
      },
      "flightTime": {
        "id": "tz-0286",
        "legacyId": "e_285"
      },
      "driveKm": {
        "id": "tz-0287",
        "legacyId": "e_286"
      },
      "driveTime": {
        "id": "tz-0288",
        "legacyId": "e_287"
      }
    }
  },
  {
    "city": "Star City",
    "flightKm": "~4.200",
    "flightTime": "~5h30",
    "driveKm": "~4.800",
    "driveTime": "~53h",
    "edit": {
      "city": {
        "id": "tz-0289",
        "legacyId": "e_288"
      },
      "flightKm": {
        "id": "tz-0290",
        "legacyId": "e_289"
      },
      "flightTime": {
        "id": "tz-0291",
        "legacyId": "e_290"
      },
      "driveKm": {
        "id": "tz-0292",
        "legacyId": "e_291"
      },
      "driveTime": {
        "id": "tz-0293",
        "legacyId": "e_292"
      }
    }
  },
  {
    "city": "Coast City",
    "flightKm": "~4.000",
    "flightTime": "~5h15",
    "driveKm": "~4.600",
    "driveTime": "~51h",
    "edit": {
      "city": {
        "id": "tz-0294",
        "legacyId": "e_293"
      },
      "flightKm": {
        "id": "tz-0295",
        "legacyId": "e_294"
      },
      "flightTime": {
        "id": "tz-0296",
        "legacyId": "e_295"
      },
      "driveKm": {
        "id": "tz-0297",
        "legacyId": "e_296"
      },
      "driveTime": {
        "id": "tz-0298",
        "legacyId": "e_297"
      }
    }
  },
  {
    "city": "Central City",
    "flightKm": "~2.000",
    "flightTime": "~3h00",
    "driveKm": "~2.300",
    "driveTime": "~26h",
    "edit": {
      "city": {
        "id": "tz-0299",
        "legacyId": "e_298"
      },
      "flightKm": {
        "id": "tz-0300",
        "legacyId": "e_299"
      },
      "flightTime": {
        "id": "tz-0301",
        "legacyId": "e_300"
      },
      "driveKm": {
        "id": "tz-0302",
        "legacyId": "e_301"
      },
      "driveTime": {
        "id": "tz-0303",
        "legacyId": "e_302"
      }
    }
  },
  {
    "city": "Keystone City",
    "flightKm": "~2.000",
    "flightTime": "~3h00",
    "driveKm": "~2.300",
    "driveTime": "~26h",
    "edit": {
      "city": {
        "id": "tz-0304",
        "legacyId": "e_303"
      },
      "flightKm": {
        "id": "tz-0305",
        "legacyId": "e_304"
      },
      "flightTime": {
        "id": "tz-0306",
        "legacyId": "e_305"
      },
      "driveKm": {
        "id": "tz-0307",
        "legacyId": "e_306"
      },
      "driveTime": {
        "id": "tz-0308",
        "legacyId": "e_307"
      }
    }
  },
  {
    "city": "Fawcett City",
    "flightKm": "~2.050",
    "flightTime": "~3h00",
    "driveKm": "~2.400",
    "driveTime": "~27h",
    "edit": {
      "city": {
        "id": "tz-0309",
        "legacyId": "e_308"
      },
      "flightKm": {
        "id": "tz-0310",
        "legacyId": "e_309"
      },
      "flightTime": {
        "id": "tz-0311",
        "legacyId": "e_310"
      },
      "driveKm": {
        "id": "tz-0312",
        "legacyId": "e_311"
      },
      "driveTime": {
        "id": "tz-0313",
        "legacyId": "e_312"
      }
    }
  },
  {
    "city": "Ivy Town",
    "flightKm": "~1.880",
    "flightTime": "~2h50",
    "driveKm": "~2.200",
    "driveTime": "~24h",
    "edit": {
      "city": {
        "id": "tz-0314",
        "legacyId": "e_313"
      },
      "flightKm": {
        "id": "tz-0315",
        "legacyId": "e_314"
      },
      "flightTime": {
        "id": "tz-0316",
        "legacyId": "e_315"
      },
      "driveKm": {
        "id": "tz-0317",
        "legacyId": "e_316"
      },
      "driveTime": {
        "id": "tz-0318",
        "legacyId": "e_317"
      }
    }
  },
  {
    "city": "Opal City",
    "flightKm": "~1.540",
    "flightTime": "~2h25",
    "driveKm": "~1.800",
    "driveTime": "~20h",
    "edit": {
      "city": {
        "id": "tz-0319",
        "legacyId": "e_318"
      },
      "flightKm": {
        "id": "tz-0320",
        "legacyId": "e_319"
      },
      "flightTime": {
        "id": "tz-0321",
        "legacyId": "e_320"
      },
      "driveKm": {
        "id": "tz-0322",
        "legacyId": "e_321"
      },
      "driveTime": {
        "id": "tz-0323",
        "legacyId": "e_322"
      }
    }
  },
  {
    "city": "Midway City",
    "flightKm": "~1.860",
    "flightTime": "~2h45",
    "driveKm": "~2.150",
    "driveTime": "~24h",
    "edit": {
      "city": {
        "id": "tz-0324",
        "legacyId": "e_323"
      },
      "flightKm": {
        "id": "tz-0325",
        "legacyId": "e_324"
      },
      "flightTime": {
        "id": "tz-0326",
        "legacyId": "e_325"
      },
      "driveKm": {
        "id": "tz-0327",
        "legacyId": "e_326"
      },
      "driveTime": {
        "id": "tz-0328",
        "legacyId": "e_327"
      }
    }
  },
  {
    "city": "Midvale",
    "flightKm": "~1.600",
    "flightTime": "~2h30",
    "driveKm": "~1.850",
    "driveTime": "~21h",
    "edit": {
      "city": {
        "id": "tz-0329",
        "legacyId": "e_328"
      },
      "flightKm": {
        "id": "tz-0330",
        "legacyId": "e_329"
      },
      "flightTime": {
        "id": "tz-0331",
        "legacyId": "e_330"
      },
      "driveKm": {
        "id": "tz-0332",
        "legacyId": "e_331"
      },
      "driveTime": {
        "id": "tz-0333",
        "legacyId": "e_332"
      }
    }
  },
  {
    "city": "Gateway City",
    "flightKm": "~4.200",
    "flightTime": "~5h30",
    "driveKm": "~4.800",
    "driveTime": "~53h",
    "edit": {
      "city": {
        "id": "tz-0334",
        "legacyId": "e_333"
      },
      "flightKm": {
        "id": "tz-0335",
        "legacyId": "e_334"
      },
      "flightTime": {
        "id": "tz-0336",
        "legacyId": "e_335"
      },
      "driveKm": {
        "id": "tz-0337",
        "legacyId": "e_336"
      },
      "driveTime": {
        "id": "tz-0338",
        "legacyId": "e_337"
      }
    }
  },
  {
    "city": "Jump City",
    "flightKm": "~3.775",
    "flightTime": "~5h00",
    "driveKm": "~4.300",
    "driveTime": "~48h",
    "edit": {
      "city": {
        "id": "tz-0339",
        "legacyId": "e_338"
      },
      "flightKm": {
        "id": "tz-0340",
        "legacyId": "e_339"
      },
      "flightTime": {
        "id": "tz-0341",
        "legacyId": "e_340"
      },
      "driveKm": {
        "id": "tz-0342",
        "legacyId": "e_341"
      },
      "driveTime": {
        "id": "tz-0343",
        "legacyId": "e_342"
      }
    }
  },
  {
    "city": "Smallville",
    "flightKm": "~2.190",
    "flightTime": "~3h15",
    "driveKm": "~2.500",
    "driveTime": "~28h",
    "edit": {
      "city": {
        "id": "tz-0344",
        "legacyId": "e_343"
      },
      "flightKm": {
        "id": "tz-0345",
        "legacyId": "e_344"
      },
      "flightTime": {
        "id": "tz-0346",
        "legacyId": "e_345"
      },
      "driveKm": {
        "id": "tz-0347",
        "legacyId": "e_346"
      },
      "driveTime": {
        "id": "tz-0348",
        "legacyId": "e_347"
      }
    }
  }
];

})();
