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
  mode: "hybrid-private-master",
  secure: true,
  warning: "Público e Rumor permanecem no bundle. Conteúdo Mestre é armazenado criptografado e entregue somente ao editor autenticado."
};

})();
