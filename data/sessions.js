(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Histórico vivo da campanha.
window.TerraZData.sessions = [];

window.TerraZData.sessionSchema = {
  id: "slug-estavel-da-sessao",
  title: "Título da sessão",
  realDate: "YYYY-MM-DD",
  inWorldDate: "texto livre, ex.: Janeiro de 2027",
  summary: "Resumo curto",
  characters: ["Nome do personagem"],
  locations: ["Nome do local"],
  consequences: ["Consequência"],
  visibility: "public",
  links: []
};

})();
