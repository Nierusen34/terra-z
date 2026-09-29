function scanJsonValue(text, assignment){
  const start = text.indexOf(assignment);
  if(start < 0) throw new Error("Estrutura de dados não encontrada: " + assignment);

  let i = start + assignment.length;
  while(/\s/.test(text[i] || "")) i++;

  const opener = text[i];
  const closer = opener === "{" ? "}" : opener === "[" ? "]" : null;
  if(!closer) throw new Error("Valor JSON esperado após " + assignment);

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
