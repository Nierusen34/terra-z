function findArrayEnd(text,start){
  let depth=0;
  let quote="";
  let escaped=false;

  for(let i=start;i<text.length;i++){
    const ch=text[i];

    if(quote){
      if(escaped) escaped=false;
      else if(ch==="\\") escaped=true;
      else if(ch===quote) quote="";
      continue;
    }

    if(ch==='"' || ch==="'"){
      quote=ch;
      continue;
    }

    if(ch==="[") depth++;
    else if(ch==="]"){
      depth--;
      if(depth===0) return i;
    }
  }

  throw new Error("Array de segredos sem fechamento.");
}

function decodeKey(raw){
  return JSON.parse('"' + raw + '"');
}

export function extractCharacterSecrets(source){
  const matches=[...source.matchAll(/^\s{2}"((?:\\.|[^"\\])+)":\s*\{/gm)];
  const entries=[];

  matches.forEach((match,index)=>{
    const name=decodeKey(match[1]);
    const start=match.index;
    const end=index+1<matches.length ? matches[index+1].index : source.length;
    const block=source.slice(start,end);
    const secretMatch=/\bsecrets\s*:\s*\[/.exec(block);

    if(!secretMatch){
      entries.push({name,secrets:[],arrayStart:-1,arrayEnd:-1});
      return;
    }

    const bracketOffset=block.indexOf("[",secretMatch.index);
    const arrayStart=start+bracketOffset;
    const arrayEnd=findArrayEnd(source,arrayStart);
    const arrayText=source.slice(arrayStart,arrayEnd+1);

    let secrets;
    try {
      secrets=JSON.parse(arrayText);
    } catch {
      throw new Error("Segredos de " + name + " não estão em formato JSON válido.");
    }

    if(!Array.isArray(secrets)) throw new Error("Segredos de " + name + " não são uma lista.");
    entries.push({name,secrets,arrayStart,arrayEnd});
  });

  return entries;
}

export function buildMasterContent(source){
  const entries=extractCharacterSecrets(source);
  const characters={};
  let secretCount=0;
  let characterCount=0;

  entries.forEach(entry=>{
    if(!entry.secrets.length) return;
    characters[entry.name]={secrets:entry.secrets};
    characterCount++;
    secretCount+=entry.secrets.length;
  });

  return {
    content:{characters},
    characterCount,
    secretCount
  };
}

export function validateMasterContent(master,source){
  const expected=buildMasterContent(source);
  const privateCharacters=master && master.characters && typeof master.characters==="object"
    ? master.characters
    : {};

  const missing=[];
  const mismatched=[];

  Object.entries(expected.content.characters).forEach(([name,data])=>{
    const candidate=privateCharacters[name] && privateCharacters[name].secrets;
    if(!Array.isArray(candidate)){
      missing.push(name);
      return;
    }
    if(JSON.stringify(candidate)!==JSON.stringify(data.secrets)) mismatched.push(name);
  });

  return {
    ok:missing.length===0 && mismatched.length===0,
    missing,
    mismatched,
    characterCount:expected.characterCount,
    secretCount:expected.secretCount
  };
}

export function stripPublicSecrets(source){
  const entries=extractCharacterSecrets(source)
    .filter(entry=>entry.arrayStart>=0 && entry.secrets.length>0)
    .sort((a,b)=>b.arrayStart-a.arrayStart);

  let output=source;
  entries.forEach(entry=>{
    output=output.slice(0,entry.arrayStart)+"[]"+output.slice(entry.arrayEnd+1);
  });
  return output;
}
