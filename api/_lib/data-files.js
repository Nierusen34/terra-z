function scanJsonValue(text, assignment){
  const start = text.indexOf(assignment);
  if(start < 0) throw new Error("Estrutura de dados não encontrada: " + assignment);

  let i = start + assignment.length;
  while(/\s/.test(text[i] || "")) i++;

  const opener = text[i];
  const closer = opener === "{" ? "}" : opener === "[" ? "]" : null;

  if(!closer){
    const tail = text.slice(i);
    const literal = tail.match(/^(null|true|false|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/);
    if(literal) return literal[1];

    if(opener === '"'){
      let escaped = false;
      for(let j=i+1; j<text.length; j++){
        const ch = text[j];
        if(escaped) escaped = false;
        else if(ch === "\\") escaped = true;
        else if(ch === '"') return text.slice(i,j+1);
      }
    }

    throw new Error("Valor JSON esperado após " + assignment);
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for(let j=i; j<text.length; j++){
    const ch = text[j];

    if(inString){
      if(escaped) escaped = false;
      else if(ch === "\\") escaped = true;
      else if(ch === '"') inString = false;
      continue;
    }

    if(ch === '"'){
      inString = true;
      continue;
    }

    if(ch === opener) depth++;
    else if(ch === closer){
      depth--;
      if(depth === 0) return text.slice(i,j+1);
    }
  }

  throw new Error("Valor JSON sem fechamento em " + assignment);
}

export function parseDataAssignment(text, property){
  return JSON.parse(scanJsonValue(text, "window.TerraZData." + property + " ="));
}

export function renderContentOverrides(data){
  return `(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Alterações publicadas pelo editor visual, indexadas pelos data-edit-id permanentes.
window.TerraZData.contentOverrides = ${JSON.stringify(data,null,2)};

})();
`;
}

export function renderCharacterMedia(data){
  return `(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Metadados visuais de personagens.
// src vazio = usar placeholder do Terra Z.
window.TerraZData.characterMedia = ${JSON.stringify(data,null,2)};

})();
`;
}


export function renderCharacterOverrides(data){
  return `(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Sobrescritas estruturadas de personagens existentes.
// A base canônica continua em data/characters.js.
window.TerraZData.characterOverrides = ${JSON.stringify(data,null,2)};

})();
`;
}

export function renderSessions(data){
  return `(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Histórico vivo da campanha.
window.TerraZData.sessions = ${JSON.stringify(data,null,2)};

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
`;
}


export function renderGraphOverride(data){
  return `(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Grafo publicado pelo editor visual. null = usar data/relations.js como padrão.
window.TerraZData.graphOverride = ${JSON.stringify(data,null,2)};

})();
`;
}


export function renderCharacterTaxonomy(data){
  return `(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

window.TerraZData.characterTaxonomy = ${JSON.stringify(data,null,2)};

})();
`;
}


export function renderTimeline(data){
  const groups=Array.isArray(data) ? data : [];
  return `(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Linha do tempo canônica do universo Terra Z.
// Sessões continuam no Diário da Campanha e são agregadas dinamicamente.
window.TerraZData.timeline = ${JSON.stringify(groups,null,2)};

window.TerraZData.timelineSchema = {
  id:"slug-estavel-do-evento",
  category:"history | pre-campaign | campaign | current | future",
  sortKey:"número cronológico YYYYMMDD; períodos imprecisos usam valor aproximado estável",
  year:"rótulo exibido",
  title:"título opcional",
  text:"descrição canônica",
  characters:["Nome exato da ficha"],
  locations:["Distrito, cidade ou local"],
  teams:["Nome exato da equipe"],
  visibility:"public | spoiler",
  edit:{year:{id:"tz-...",legacyId:"e-..."},text:{id:"tz-...",legacyId:"e-..."}}
};

})();
`;
}
