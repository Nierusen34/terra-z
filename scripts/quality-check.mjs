import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";

const root=process.cwd();
const failures=[];
const warnings=[];
const passes=[];

function rel(file){ return path.relative(root,file).replaceAll("\\","/"); }
function pass(message){ passes.push(message); console.log("✓",message); }
function warn(message){ warnings.push(message); console.warn("⚠",message); }
function fail(message){ failures.push(message); console.error("✗",message); }
function exists(relative){ return fs.existsSync(path.join(root,relative)); }
function read(relative){ return fs.readFileSync(path.join(root,relative),"utf8"); }

function walk(dir,filter){
  const base=path.join(root,dir);
  if(!fs.existsSync(base)) return [];
  const out=[];
  for(const entry of fs.readdirSync(base,{withFileTypes:true})){
    const full=path.join(base,entry.name);
    if(entry.isDirectory()) out.push(...walk(rel(full),filter));
    else if(!filter || filter(full)) out.push(full);
  }
  return out;
}

function checkSyntax(){
  const files=[
    path.join(root,"config.js"),
    path.join(root,"terra-z.js"),
    ...walk("js",file=>file.endsWith(".js")),
    ...walk("data",file=>file.endsWith(".js")),
    ...walk("api",file=>file.endsWith(".js"))
  ].filter(fs.existsSync);

  let broken=0;
  for(const file of files){
    const result=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
    if(result.status!==0){
      broken++;
      fail("JavaScript inválido em "+rel(file)+": "+String(result.stderr||result.stdout).trim());
    }
  }
  if(!broken) pass("Sintaxe JavaScript válida em "+files.length+" arquivos");
}

function loadTerraData(){
  const sandbox={window:{TerraZData:{}}};
  sandbox.window.window=sandbox.window;
  vm.createContext(sandbox);

  const ordered=[
    "data/characters.js",
    "data/character-overrides.js",
    "data/character-meta.js",
    "data/character-media.js",
    "data/relations.js",
    "data/graph-overrides.js",
    "data/locations.js",
    "data/events.js",
    "data/timeline.js",
    "data/cities.js",
    "data/teams.js",
    "data/sessions.js",
    "data/visibility.js",
    "data/content-overrides.js"
  ];

  for(const file of ordered){
    if(!exists(file)) continue;
    try{
      vm.runInContext(read(file),sandbox,{filename:file,timeout:2000});
    }catch(error){
      fail("Não foi possível carregar "+file+": "+error.message);
    }
  }
  return sandbox.window.TerraZData || {};
}

function checkIndexAssets(){
  const html=read("index.html");
  const refs=[];

  for(const match of html.matchAll(/<(?:script|link)\b[^>]+(?:src|href)="([^"]+)"/gi)){
    const value=match[1];
    if(!value || /^(?:https?:|data:|#)/i.test(value)) continue;
    const clean=value.split(/[?#]/)[0].replace(/^\.?\//,"");
    if(clean) refs.push(clean);
  }

  const missing=[...new Set(refs)].filter(file=>!exists(file));
  if(missing.length) fail("index.html referencia arquivos inexistentes: "+missing.join(", "));
  else pass("Todos os "+new Set(refs).size+" assets locais referenciados pelo index existem");

  const ids={};
  for(const match of html.matchAll(/\sid="([^"]+)"/g)){
    ids[match[1]]=(ids[match[1]]||0)+1;
  }
  const duplicated=Object.entries(ids).filter(([,count])=>count>1);
  if(duplicated.length) fail("IDs HTML duplicados: "+duplicated.map(([id,count])=>id+" ("+count+")").join(", "));
  else pass("IDs HTML estáticos são únicos");

  if(!html.includes('src="js/integrity-checker.js"')) fail("Verificador de integridade não está carregado no index.html");
  else pass("Verificador de integridade está conectado ao site");
}

function checkCharacterData(data){
  const overrides=data.characterOverrides || {};
  const taxonomy=data.characterTaxonomy || {};
  const meta=taxonomy.characters || {};
  const media=data.characterMedia || {};
  const names=Object.keys(overrides).filter(name=>!overrides[name] || overrides[name].deleted!==true);
  const nameSet=new Set(names);

  if(!names.length){
    fail("Nenhum personagem público encontrado em character-overrides.js");
    return;
  }
  pass(names.length+" personagens públicos carregados");

  const normalized={};
  for(const name of names){
    const key=name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"");
    if(normalized[key]) fail("Personagens com identificador equivalente: "+normalized[key]+" / "+name);
    else normalized[key]=name;

    if(!meta[name]) fail("Personagem sem taxonomia: "+name);
    if(!media[name]) fail("Personagem sem registro de mídia: "+name);

    const characterMeta=meta[name] || {};
    const visibility=String(characterMeta.visibility || "public");
    if(!["public","spoiler"].includes(visibility)){
      fail("Personagem Mestre/privado vazou para a taxonomia pública: "+name+" ("+visibility+")");
    }

    const row=overrides[name] || {};
    if(!Array.isArray(row.sections) || !row.sections.length) warn("Ficha sem seções: "+name);
    for(const section of Array.isArray(row.sections)?row.sections:[]){
      const level=String(section&&section.visibility||"public");
      if(level==="master"||level==="private"){
        fail("Seção Mestre vazou para character-overrides.js: "+name+" / "+String(section&&section.title||"sem título"));
      }
      if(!["public","spoiler","rumor","restricted"].includes(level)){
        fail("Visibilidade de seção inválida em "+name+": "+level);
      }
    }
  }

  for(const name of Object.keys(meta)){
    if(!nameSet.has(name)) warn("Taxonomia órfã: "+name);
  }
  for(const name of Object.keys(media)){
    if(!nameSet.has(name)) warn("Mídia órfã: "+name);
  }

  const nuclei=new Set((taxonomy.nuclei || []).map(row=>row&&row.id).filter(Boolean));
  const types=new Set((taxonomy.types || []).map(row=>row&&row.id).filter(Boolean));
  const statuses=new Set((taxonomy.statuses || []).map(row=>row&&row.id).filter(Boolean));

  const duplicateIds=(rows,label)=>{
    const seen=new Set();
    for(const row of rows || []){
      if(!row || !row.id){ fail("Definição sem ID em "+label); continue; }
      if(seen.has(row.id)) fail("ID duplicado em "+label+": "+row.id);
      seen.add(row.id);
    }
  };
  duplicateIds(taxonomy.nuclei,"núcleos");
  duplicateIds(taxonomy.types,"tipos");
  duplicateIds(taxonomy.statuses,"status");

  for(const [name,row] of Object.entries(meta)){
    for(const id of Array.isArray(row.nuclei)?row.nuclei:[]){
      if(!nuclei.has(id)) fail(name+" referencia núcleo inexistente: "+id);
    }
    if(row.type && !types.has(row.type)) fail(name+" referencia tipo inexistente: "+row.type);
    if(row.status && !statuses.has(row.status)) fail(name+" referencia status inexistente: "+row.status);
  }

  for(const [name,row] of Object.entries(media)){
    const src=String(row&&row.src||"");
    if(src && !/^(?:https?:|data:)/i.test(src) && !exists(src)){
      fail("Imagem local inexistente para "+name+": "+src);
    }
    const auto=row&&row.auto;
    if(auto&&auto.provider==="external-url"&&!/^https:\/\//i.test(String(auto.imageUrl||""))){
      fail("URL externa inválida para "+name);
    }
    if(auto&&auto.provider==="dc-fandom"&&!String(auto.wikiTitle||"").trim()){
      fail("Fonte DC sem wikiTitle para "+name);
    }
  }

  pass("Taxonomia e mídia dos personagens passaram pelas validações estruturais");
  return nameSet;
}

function checkSessions(data,characters){
  const sessions=Array.isArray(data.sessions)?data.sessions:[];
  const ids=new Set();
  for(const row of sessions){
    if(!row||typeof row!=="object"){ fail("Entrada inválida em data/sessions.js"); continue; }
    if(!row.id) fail("Sessão sem ID");
    else if(ids.has(row.id)) fail("ID de sessão duplicado: "+row.id);
    else ids.add(row.id);

    if(row.realDate&&!/^\d{4}-\d{2}-\d{2}$/.test(String(row.realDate))) warn("Data de sessão fora de YYYY-MM-DD: "+row.realDate);
    const visibility=String(row.visibility||"public");
    if(visibility==="master") fail("Sessão Mestre vazou para data/sessions.js: "+String(row.id||row.title||"sem ID"));
    if(!["public","spoiler","rumor"].includes(visibility)) fail("Visibilidade pública de sessão inválida: "+visibility);
    for(const name of Array.isArray(row.characters)?row.characters:[]){
      if(characters&&!characters.has(name)) warn("Sessão "+row.id+" referencia personagem não público: "+name);
    }
  }
  pass(sessions.length+" sessões públicas validadas");
}

function checkGraph(data){
  const graph=data.graphOverride&&Array.isArray(data.graphOverride.nodes)?data.graphOverride:data.defaultGraph;
  if(!graph){ warn("Nenhum grafo encontrado"); return; }

  const nodes=Array.isArray(graph.nodes)?graph.nodes:[];
  const edges=Array.isArray(graph.edges)?graph.edges:[];
  const ids=new Set();

  for(const node of nodes){
    if(!node||!node.id){ fail("Nó do grafo sem ID"); continue; }
    if(ids.has(node.id)) fail("ID de nó duplicado no grafo: "+node.id);
    ids.add(node.id);
  }

  for(const node of nodes){
    const level=String(node&&node.visibility||"public");
    if(level==="master"||level==="private") fail("Nó Mestre vazou para o grafo público: "+String(node&&node.id||"sem ID"));
  }

  for(const edge of edges){
    if(!ids.has(edge.from)||!ids.has(edge.to)){
      fail("Relação aponta para nó inexistente: "+String(edge.from)+" -> "+String(edge.to));
    }
    const level=String(edge&&edge.visibility||"public");
    if(level==="master"||level==="private") fail("Relação Mestre vazou para o grafo público: "+String(edge.from)+" -> "+String(edge.to));
  }
  pass(nodes.length+" nós e "+edges.length+" relações validados");

  const visibilityRuntime=read("js/visibility.js");
  if(!/var\s+mode\s*=\s*['"]safe['"]/.test(visibilityRuntime)){
    fail("Visibilidade deve iniciar em Modo Jogador (safe) por padrão.");
  }
  if(/localStorage\.setItem\([^\n]*spoiler_mode/.test(visibilityRuntime)){
    fail("Preferência de exibir spoilers não deve persistir entre recarregamentos.");
  }
  pass("Modo Jogador é o padrão seguro de inicialização");

  const publishApi=read("api/publish.js");
  const githubLib=read("api/_lib/github.js");
  if(!publishApi.includes('body.action === "restore-content"')){
    fail("API de publicação não oferece restauração segura de conteúdo.");
  }
  if(!publishApi.includes('body.action === "deploy-checkpoint"')){
    fail("API de publicação não oferece checkpoint controlado de deploy.");
  }
  if(!githubLib.includes("restoreContentSnapshot") || !githubLib.includes("createCheckpointCommit")){
    fail("Biblioteca GitHub não contém infraestrutura de histórico/restauração.");
  }

  const restoreScopeMatch=publishApi.match(
    /const RESTORABLE_CONTENT_PATHS = \[([\s\S]*?)\];\s*const RESTORABLE_CONTENT_PREFIXES = \[([\s\S]*?)\];/
  );
  if(!restoreScopeMatch){
    fail("Escopo de restauração não foi encontrado na API de publicação.");
  }else{
    const restoreScope=restoreScopeMatch[1]+"\n"+restoreScopeMatch[2];
    if(/["'](?:api\/|js\/|index\.html|terra-z\.css)/.test(restoreScope)){
      fail("Escopo de restauração de conteúdo não pode incluir código da aplicação.");
    }
  }
  pass("Histórico/restauração e deploy inteligente usam APIs existentes sem restaurar código");

  const healthApi=read("api/health.js");
  const deployWorkflow=read(".github/workflows/vercel-deploy-hook.yml");
  const statusApi=read("api/status.js");

  if(!healthApi.includes('deployment_strategy:"github-actions-deploy-hook"') ||
     !healthApi.includes('vercel_connector_required:false')){
    fail("A política operacional deve declarar GitHub Actions/Deploy Hook como caminho oficial e Vercel Connector como opcional.");
  }
  if(!/name:\s*Vercel production checkpoint/.test(deployWorkflow) ||
     !deployWorkflow.includes("VERCEL_DEPLOY_HOOK_URL")){
    fail("Workflow oficial de produção via Deploy Hook não está configurado.");
  }
  if(!statusApi.includes('workflowRunStatus(sha,"Vercel production checkpoint")')){
    fail("api/status.js não acompanha o workflow oficial de produção.");
  }
  if(!exists("OPERATIONS.md")){
    fail("OPERATIONS.md ausente; novas conversas precisam de uma política operacional persistente.");
  }
  pass("Fluxo oficial GitHub → Actions → Deploy Hook → Vercel está documentado e testado");
}

function checkEncryptedFiles(){
  for(const file of ["data/private-character-data.enc.json","data/private-sessions.enc.json"]){
    if(!exists(file)){ fail("Arquivo criptografado ausente: "+file); continue; }
    try{
      const parsed=JSON.parse(read(file));
      if(parsed.algorithm!=="aes-256-gcm") fail(file+" não usa aes-256-gcm");
      for(const key of ["version","algorithm","iv","tag","ciphertext"]){
        if(parsed[key]===undefined||parsed[key]===null||parsed[key]==="") fail(file+" sem campo "+key);
      }
      const extras=Object.keys(parsed).filter(key=>!["version","algorithm","iv","tag","ciphertext"].includes(key));
      if(extras.length) warn(file+" contém campos adicionais: "+extras.join(", "));
      pass(file+" possui envelope criptografado válido");
    }catch(error){
      fail("JSON criptografado inválido em "+file+": "+error.message);
    }
  }
}

function checkVercel(){
  try{
    const config=JSON.parse(read("vercel.json"));
    const topLevel=fs.readdirSync(path.join(root,"api"),{withFileTypes:true})
      .filter(entry=>entry.isFile()&&entry.name.endsWith(".js")).length;
    if(topLevel>12) fail("Vercel Hobby: "+topLevel+" funções serverless de nível superior; máximo conhecido do projeto é 12");
    else pass("Quantidade de funções serverless dentro do limite: "+topLevel+"/12");

    if(config.git&&config.git.deploymentEnabled===false){
      warn("Deploy automático da Vercel está pausado (staging intencional)");
    }
  }catch(error){
    fail("vercel.json inválido: "+error.message);
  }
}

function checkSensitivePublicPatterns(){
  const publicFiles=[
    "data/character-overrides.js",
    "data/character-meta.js",
    "data/character-media.js",
    "data/sessions.js"
  ].filter(exists);

  for(const file of publicFiles){
    const content=read(file);
    if(/EDITOR_AUTH_SECRET|GITHUB_TOKEN|PRIVATE_KEY-----|BEGIN PRIVATE KEY/i.test(content)){
      fail("Possível segredo encontrado em arquivo público: "+file);
    }
  }
  pass("Arquivos públicos não contêm padrões óbvios de credenciais");
}

console.log("\nTerra Z · Quality Gate\n");
checkSyntax();
checkIndexAssets();
const data=loadTerraData();
const characters=checkCharacterData(data);
checkSessions(data,characters);
checkGraph(data);
checkEncryptedFiles();
checkVercel();
checkSensitivePublicPatterns();

console.log("\nResumo");
console.log("  OK:",passes.length);
console.log("  Avisos:",warnings.length);
console.log("  Falhas:",failures.length);

if(warnings.length){
  console.log("\nAvisos não bloqueantes:");
  for(const message of warnings) console.log("  -",message);
}

if(failures.length){
  console.error("\nQuality gate REPROVADO.");
  process.exit(1);
}

console.log("\nQuality gate APROVADO.");
