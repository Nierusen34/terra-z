(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

window.TerraZData.visibilityLevels = {
  public: { label:"Público", rank:0 },
  rumor: { label:"Rumor", rank:1 },
  restricted: { label:"Restrito", rank:2 },
  master: { label:"Mestre", rank:3 }
};

window.TerraZData.visibilityPolicy = {
  mode: "public-bundle",
  secure: false,
  warning: "Ocultação visual não é controle de acesso. Conteúdo presente no bundle público pode ser inspecionado."
};

})();
