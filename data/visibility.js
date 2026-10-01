(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

window.TerraZData.visibilityLevels = {
  public:  { label:"Público", rank:0, secure:false },
  spoiler: { label:"Spoiler", rank:1, secure:false },
  master:  { label:"Mestre", rank:2, secure:true }
};

window.TerraZData.visibilityAliases = {
  rumor:"spoiler",
  restricted:"spoiler",
  private:"master"
};

window.TerraZData.visibilityPolicy = {
  mode:"public-spoiler-master",
  secure:true,
  warning:"Público aparece para todos. Spoiler fica no bundle, mas é ocultado no Modo Jogador. Mestre é armazenado criptografado e entregue somente ao editor autenticado."
};

})();
