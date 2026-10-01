(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Histórico vivo da campanha.
window.TerraZData.sessions = [
  {
    "id": "2026-09-27-dupla-improvavel",
    "title": "Dupla Improvável",
    "realDate": "2026-09-27",
    "inWorldDate": "4 de Janeiro de 2027",
    "summary": "Riot faz seu ultimo treinamento com Kendra em Midway City antes de partir para Vanguard Bay.\nTristan tem um flashback de quando era criança sobre a discussão de Oliver e Dinah em 2019 quando ela vai para Gotham.\nEm uma das suas primeiras missões, Tristan acaba encontrando Riot no Dique achando que é o Lobo, os dois enfrentam capangas que estavam fazendo tráfico humano para Sumdac. \nO celular hackeado de Tristan marca uma reunião dele e de Riot com a misteriosa senhorita C, que pede a ajuda deles para ajudar um alienigena telepata.",
    "characters": [
      "Tristan Queen",
      "Riot"
    ],
    "locations": [
      "Dique",
      "Downtown",
      "Muralha"
    ],
    "consequences": [],
    "visibility": "public",
    "links": []
  }
];

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
