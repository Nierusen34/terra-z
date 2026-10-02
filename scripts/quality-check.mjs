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
    "data/media-library.js",
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

  const adminLoader=read("js/admin-loader.js");
  if(!html.includes('src="js/admin-loader.js"')) fail("Carregador administrativo não está conectado ao index.html");
  if(!adminLoader.includes('"js/integrity-checker.js"')) fail("Verificador de integridade não está registrado no lazy loader");
  else pass("Ferramentas administrativas usam carregamento sob demanda");

  const directlyLoadedAdmin=[
    "js/admin-panel.js","js/editor.js","js/private-content.js","js/master-workspace.js",
    "js/publishing.js","js/master-migration.js","js/media-manager.js","js/media-library.js",
    "js/portrait-browser.js","js/character-editor.js","js/taxonomy-manager.js",
    "js/session-editor.js","js/timeline-editor.js","js/integrity-checker.js",
    "js/history-manager.js","js/visibility-manager.js"
  ].filter(src=>html.includes('src="'+src+'"'));
  if(directlyLoadedAdmin.length) fail("Módulos administrativos ainda carregados no boot: "+directlyLoadedAdmin.join(", "));
  else pass("Módulos administrativos foram removidos do carregamento inicial");
}

function checkPerformanceBudget(){
  const html=read("index.html");
  const scripts=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(match=>match[1]);
  const localScripts=scripts.filter(src=>!/^https?:/i.test(src));

  if(localScripts.length>40){
    fail("Boot público excedeu o orçamento de scripts: "+localScripts.length+" > 40");
  }else{
    pass("Boot público dentro do orçamento: "+localScripts.length+"/40 scripts");
  }

  const heavyPngs=[
    ...walk("images/city",file=>file.toLowerCase().endsWith(".png")&&fs.statSync(file).size>1_000_000),
    ...walk("images/districts",file=>file.toLowerCase().endsWith(".png")&&fs.statSync(file).size>1_000_000)
  ];
  if(heavyPngs.length){
    fail("Imagens PNG pesadas voltaram ao acervo: "+heavyPngs.map(rel).join(", "));
  }else{
    pass("Cidade/distritos não possuem PNG > 1 MB");
  }

  const imageFiles=walk("images",file=>/\.(?:png|jpe?g|webp|gif)$/i.test(file));
  const imageBytes=imageFiles.reduce((total,file)=>total+fs.statSync(file).size,0);
  const imageMb=imageBytes/1024/1024;
  if(imageMb>20) warn("Acervo de imagens acima de 20 MB: "+imageMb.toFixed(2)+" MB");
  else pass("Acervo visual otimizado: "+imageMb.toFixed(2)+" MB");

  const qualityWorkflow=read(".github/workflows/quality-gate.yml");
  const devSmoke=read(".github/workflows/dev-smoke.yml");
  const browserWorkflow=read(".github/workflows/browser-visual.yml");
  const playwrightConfig=read("playwright.config.mjs");
  const browserTests=read("tests/browser/visual-smoke.spec.mjs");
  if(!qualityWorkflow.includes("- dev")) fail("Quality Gate não monitora o branch dev.");
  if(!/branches:\s*[\s\S]*- dev/.test(devSmoke)) fail("Dev smoke não monitora o branch dev.");
  if(!exists("docs/IMAGE_OPTIMIZATION.md")) fail("Relatório de otimização de imagens ausente.");
  if(!exists("docs/BROWSER_TESTING.md")) fail("Documentação de testes de navegador ausente.");

  if(!browserWorkflow.includes("pull_request:") || !browserWorkflow.includes("- main")){
    fail("Workflow de navegador não está protegido pelo fluxo PR → main.");
  }
  if(!browserWorkflow.includes("retention-days: 1")){
    fail("Artifacts visuais devem ter retenção de 1 dia.");
  }
  if(!browserWorkflow.includes("if: failure()")){
    fail("Screenshots de navegador só podem ser enviados em caso de falha.");
  }
  if(!playwrightConfig.includes('screenshot:"only-on-failure"')){
    fail("Playwright deve capturar screenshots somente em falhas.");
  }
  if(!playwrightConfig.includes('video:"off"') || !playwrightConfig.includes('trace:"off"')){
    fail("Vídeo/trace do Playwright devem permanecer desligados por padrão.");
  }
  if(!browserTests.includes('[data-node-id="armek"]') ||
     !browserTests.includes("script[data-admin-module]")){
    fail("Browser smoke não cobre mídia independente do grafo e lazy loading administrativo.");
  }
  pass("Playwright configurado sem acervo permanente de screenshots");
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

    const framing=row&&row.framing;
    if(framing!==undefined){
      if(!framing||typeof framing!=="object"||Array.isArray(framing)){
        fail("Enquadramento inválido para "+name);
      }else{
        for(const context of ["card","sheet","graph"]){
          const frame=framing[context];
          if(frame===undefined) continue;
          if(!frame||typeof frame!=="object"||Array.isArray(frame)){
            fail("Enquadramento "+context+" inválido para "+name);
            continue;
          }
          if(!["cover","contain"].includes(String(frame.fit||""))){
            fail("Modo de enquadramento inválido para "+name+" / "+context);
          }
          for(const axis of ["x","y"]){
            const value=Number(frame[axis]);
            if(!Number.isFinite(value)||value<0||value>100){
              fail("Posição "+axis+" inválida para "+name+" / "+context);
            }
          }
          const zoom=Number(frame.zoom);
          if(!Number.isFinite(zoom)||zoom<0.5||zoom>2.5){
            fail("Zoom inválido para "+name+" / "+context);
          }
        }
      }
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

function checkTimeline(data,characters){
  const groups=Array.isArray(data.timeline)?data.timeline:[];
  const ids=new Set();
  const allowedCategories=new Set(["history","pre-campaign","campaign","current","future"]);
  let eventCount=0;

  if(!groups.length){
    fail("Linha do tempo canônica está vazia");
    return;
  }

  for(const group of groups){
    if(!group||!String(group.title||"").trim()) fail("Grupo da linha do tempo sem título");
    if(!Array.isArray(group&&group.items)) fail("Grupo da linha do tempo sem items: "+String(group&&group.title||"sem título"));

    for(const item of Array.isArray(group&&group.items)?group.items:[]){
      eventCount++;
      const id=String(item&&item.id||"");
      if(!id) fail("Evento da linha do tempo sem ID");
      else if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail("ID de evento inválido: "+id);
      else if(ids.has(id)) fail("ID duplicado na linha do tempo: "+id);
      else ids.add(id);

      const category=String(item&&item.category||"");
      if(!allowedCategories.has(category)) fail("Categoria inválida na linha do tempo: "+id+" / "+category);
      if(!Number.isFinite(Number(item&&item.sortKey))) fail("sortKey inválido na linha do tempo: "+id);
      if(!String(item&&item.year||"").trim()) fail("Evento sem rótulo temporal: "+id);
      if(!String(item&&item.text||"").trim()) fail("Evento sem descrição: "+id);

      if(item.edit){
        if(!item.edit.year||!item.edit.year.id||!item.edit.text||!item.edit.text.id){
          fail("Metadados de edição incompletos no evento: "+id);
        }
      }

      const timelineVisibility=String(item&&item.visibility||"public");
      if(timelineVisibility==="master"||timelineVisibility==="private"){
        fail("Evento Mestre vazou para data/timeline.js: "+id);
      }
      if(!["public","spoiler","rumor"].includes(timelineVisibility)){
        fail("Visibilidade pública inválida na linha do tempo: "+id+" / "+timelineVisibility);
      }

      for(const name of Array.isArray(item&&item.characters)?item.characters:[]){
        if(characters&&!characters.has(name)) warn("Linha do tempo "+id+" referencia personagem não público: "+name);
      }
    }
  }

  const html=read("index.html");
  const router=read("js/router.js");
  if(!html.includes('src="js/timeline-manager.js"')) fail("Gerenciador da linha do tempo não está carregado no index.html");
  const adminLoader=read("js/admin-loader.js");
  if(!adminLoader.includes('"js/timeline-editor.js"')) fail("Editor estruturado da linha do tempo não está registrado no lazy loader");
  if(!router.includes("timeline-event")||!router.includes("timelineEventRoute")) fail("Roteador não oferece deep links para eventos da linha do tempo");
  if(!exists("docs/TIMELINE.md")) fail("docs/TIMELINE.md ausente");

  const publishApi=read("api/publish.js");
  const masterApi=read("api/master.js");
  const privateRuntime=read("js/private-content.js");
  if(!publishApi.includes('body.action === "timeline-event-upsert"') ||
     !publishApi.includes('body.action === "timeline-event-delete"')){
    fail("API de publicação não oferece CRUD estruturado de eventos da linha do tempo");
  }
  if(!publishApi.includes('"data/timeline.js"')){
    fail("data/timeline.js precisa fazer parte do conteúdo restaurável");
  }
  if(!masterApi.includes("timelineEvents:normalizeTimelineEvents") ||
     !privateRuntime.includes("timelineEvents:[]")){
    fail("Eventos Mestre da linha do tempo não estão integrados ao cofre privado");
  }

  pass(eventCount+" eventos canônicos da linha do tempo validados");
}

function checkMediaLibrary(data){
  const library=data.mediaLibrary || {};
  const assets=Array.isArray(library.assets) ? library.assets : [];
  const ids=new Set();
  const categories=new Set(["portrait","graph","map","editorial","team","other"]);

  if(Number(library.version||1)!==1) fail("Versão inválida da Biblioteca de Mídia.");

  for(const asset of assets){
    const id=String(asset&&asset.id||"");
    if(!id){ fail("Ativo da Biblioteca sem ID."); continue; }
    if(ids.has(id)) fail("ID duplicado na Biblioteca de Mídia: "+id);
    ids.add(id);

    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail("ID inválido na Biblioteca de Mídia: "+id);
    if(!String(asset.label||"").trim()) fail("Ativo sem nome na Biblioteca: "+id);
    if(!categories.has(String(asset.category||"other"))) fail("Categoria inválida no ativo: "+id);

    const source=String(asset.source||"local");
    const src=String(asset.src||"");
    if(source==="external"){
      if(!/^https:\/\//i.test(src)) fail("URL externa inválida no ativo: "+id);
    }else if(source==="local"){
      if(src&&!/^images\/library\/[a-z0-9._-]+\.(png|jpe?g|webp)$/i.test(src)){
        fail("Caminho local inválido no ativo: "+id+" / "+src);
      }
      if(src&&!exists(src)) fail("Arquivo da Biblioteca inexistente: "+src);
    }else if(source==="project"){
      if(!asset.readOnly) fail("Ativo estrutural precisa ser readOnly: "+id);
      if(!/^images\/[a-z0-9_./-]+\.(png|jpe?g|webp)$/i.test(src)){
        fail("Caminho de ativo estrutural inválido: "+id+" / "+src);
      }
      if(src&&!exists(src)) fail("Ativo estrutural inexistente: "+src);
    }else{
      fail("Fonte inválida no ativo da Biblioteca: "+id+" / "+source);
    }

    const frame=asset.framing || {};
    if(frame.fit!==undefined&&!["cover","contain"].includes(String(frame.fit))){
      fail("Modo de enquadramento inválido no ativo: "+id);
    }
    for(const axis of ["x","y"]){
      if(frame[axis]!==undefined){
        const value=Number(frame[axis]);
        if(!Number.isFinite(value)||value<0||value>100) fail("Posição "+axis+" inválida no ativo: "+id);
      }
    }
    if(frame.zoom!==undefined){
      const zoom=Number(frame.zoom);
      if(!Number.isFinite(zoom)||zoom<0.5||zoom>2.5) fail("Zoom inválido no ativo: "+id);
    }
  }

  pass(assets.length+" ativos reutilizáveis da Biblioteca de Mídia validados");
  return ids;
}

function checkGraph(data){
  const graph=data.graphOverride&&Array.isArray(data.graphOverride.nodes)?data.graphOverride:data.defaultGraph;
  if(!graph){ warn("Nenhum grafo encontrado"); return; }

  const nodes=Array.isArray(graph.nodes)?graph.nodes:[];
  const edges=Array.isArray(graph.edges)?graph.edges:[];
  const ids=new Set();
  const edgeIds=new Set();
  const allowedKinds=new Set(["character","team","faction","organization","location","event","custom"]);
  const allowedRelations=new Set([
    "family","ally","tension","clone","member","enemy","mentor","romance",
    "business","investigation","origin","command","rivalry","other"
  ]);
  const allowedMediaModes=new Set(["none","character","library","url"]);
  const libraryAssets=new Set(
    (((data.mediaLibrary||{}).assets)||[]).map(asset=>String(asset&&asset.id||"")).filter(Boolean)
  );

  if(Number(graph.version||0)!==3){
    warn("Snapshot público do grafo ainda está em schema legado; runtime fará migração para v3.");
  }

  for(const node of nodes){
    if(!node||!node.id){ fail("Nó do grafo sem ID"); continue; }
    if(ids.has(node.id)) fail("ID de nó duplicado no grafo: "+node.id);
    ids.add(node.id);

    if(!String(node.label||"").trim()) fail("Nó do grafo sem nome: "+node.id);
    if(node.kind && !allowedKinds.has(node.kind)) fail("Tipo de entidade inválido no grafo: "+node.id+" / "+node.kind);
    if(!Number.isFinite(Number(node.x))||!Number.isFinite(Number(node.y))){
      fail("Coordenadas inválidas no grafo: "+node.id);
    }

    const level=String(node&&node.visibility||"public");
    if(level==="master"||level==="private") fail("Nó Mestre vazou para o grafo público: "+String(node&&node.id||"sem ID"));
    if(!["public","spoiler","rumor"].includes(level)) fail("Visibilidade pública inválida no nó: "+node.id+" / "+level);

    if(node.mediaMode!==undefined){
      const mode=String(node.mediaMode||"none");
      if(!allowedMediaModes.has(mode)) fail("Modo de mídia inválido no nó: "+node.id+" / "+mode);
      if(mode==="library"&&!libraryAssets.has(String(node.mediaId||""))){
        fail("Nó referencia ativo inexistente da Biblioteca: "+node.id+" / "+String(node.mediaId||""));
      }
      if(mode==="url"&&!/^https:\/\//i.test(String(node.mediaUrl||""))){
        fail("Nó possui URL de mídia inválida: "+node.id);
      }
      const frame=node.mediaFraming||{};
      if(frame.fit!==undefined&&!["cover","contain"].includes(String(frame.fit))){
        fail("Enquadramento de mídia inválido no nó: "+node.id);
      }
    }
  }

  for(const [index,edge] of edges.entries()){
    const edgeId=String(edge&&edge.id||("edge-"+(index+1)));
    if(edgeIds.has(edgeId)) fail("ID de relação duplicado no grafo: "+edgeId);
    edgeIds.add(edgeId);

    if(!ids.has(edge.from)||!ids.has(edge.to)){
      fail("Relação aponta para nó inexistente: "+String(edge.from)+" -> "+String(edge.to));
    }
    if(edge.from===edge.to) fail("Relação aponta para o próprio nó: "+edgeId);
    if(edge.type && !allowedRelations.has(edge.type)) fail("Tipo de relação inválido: "+edgeId+" / "+edge.type);
    if(edge.strength!==undefined && (!Number.isFinite(Number(edge.strength))||Number(edge.strength)<1||Number(edge.strength)>5)){
      fail("Intensidade inválida na relação: "+edgeId);
    }

    const level=String(edge&&edge.visibility||"public");
    if(level==="master"||level==="private") fail("Relação Mestre vazou para o grafo público: "+String(edge.from)+" -> "+String(edge.to));
    if(!["public","spoiler","rumor"].includes(level)) fail("Visibilidade pública inválida na relação: "+edgeId+" / "+level);
  }

  const graphRuntime=read("js/graph.js");
  const graphApi=read("api/graph.js");
  const graphHealthApi=read("api/health.js");
  const html=read("index.html");

  if(!graphRuntime.includes("Relações 2.0") && !graphRuntime.includes("supportsGraphV3")){
    fail("Runtime do Grafo 2.0 não foi identificado.");
  }
  if(!graphApi.includes("const NODE_KINDS") || !graphApi.includes("const EDGE_TYPES")){
    fail("API do grafo não valida entidades e relações do schema v3.");
  }
  if(!graphHealthApi.includes("relations_graph_v3:true") || !graphHealthApi.includes("relations_entity_editor:true")){
    fail("Backend não anuncia capacidades do Grafo 2.0.");
  }
  if(!graphHealthApi.includes("portrait_framing:true")){
    fail("Backend não anuncia suporte a enquadramento de retratos.");
  }
  if(!graphHealthApi.includes("media_library_v1:true") ||
     !graphHealthApi.includes("graph_independent_media:true")){
    fail("Backend não anuncia Biblioteca de Mídia e imagens independentes do grafo.");
  }
  for(const id of [
    "graphEntityFilter","graphRelationFilter","graphInspector","graphEditorList","graphEditorDetail",
    "graphZoomOut","graphZoomRange","graphZoomLabel","graphZoomIn","graphZoomReset",
    "characterEditorMediaFraming","characterEditorFramingContext","characterEditorFramingFit",
    "characterEditorFramingZoom","characterEditorFramingX","characterEditorFramingY",
    "characterEditorFramingPreview","characterEditorFramingSaveBtn",
    "mediaLibraryModal","mediaLibraryGrid","mediaLibraryAdd","mediaLibraryEditor",
    "mediaAssetLabel","mediaAssetSource","mediaAssetSave"
  ]){
    if(!html.includes('id="'+id+'"')) fail("Interface de Relações 2.0 ausente: "+id);
  }

  if(!graphRuntime.includes("nodeMedia") ||
     !graphRuntime.includes("mediaLibraryApi") ||
     !graphRuntime.includes("queueGraphPortrait") ||
     !graphRuntime.includes("inspectorPortrait")){
    fail("Grafo 2.0 não suporta mídia independente e retratos de personagem.");
  }
  if(!graphRuntime.includes("mediaModeOptions") ||
     !graphRuntime.includes("mediaAssetOptions") ||
     !graphRuntime.includes("graph-node-portrait-frame")){
    fail("Editor do grafo não oferece seleção e enquadramento de mídia por entidade.");
  }
  if(!graphRuntime.includes("GRAPH_SCALE_KEY") ||
     !graphRuntime.includes("setGraphScale") ||
     !graphRuntime.includes("graphScale=1.3")){
    fail("Controles persistentes de escala do grafo não foram encontrados.");
  }
  if(!exists("docs/RELATIONS.md")) fail("docs/RELATIONS.md ausente");
  if(!exists("docs/PORTRAIT_FRAMING.md")) fail("docs/PORTRAIT_FRAMING.md ausente");

  const mediaApi=read("api/media.js");
  const mediaRuntime=read("js/character-media.js");
  const characterEditor=read("js/character-editor.js");
  if(!mediaApi.includes('requestBody.action === "configure-display"')){
    fail("API de mídia não oferece persistência estruturada do enquadramento.");
  }
  if(!mediaRuntime.includes("getFraming") || !mediaRuntime.includes("framingStyle")){
    fail("Runtime de mídia não oferece enquadramento compartilhado.");
  }
  if(!characterEditor.includes("saveMediaFraming") || !characterEditor.includes("renderFramingPreview")){
    fail("Editor de personagem não oferece prévia/salvamento do enquadramento.");
  }

  const mediaLibraryRuntime=read("js/media-library.js");
  if(!mediaApi.includes('requestBody.action === "library-upsert"') ||
     !mediaApi.includes('requestBody.action === "library-upload"') ||
     !mediaApi.includes('requestBody.action === "library-delete"')){
    fail("API de mídia não oferece CRUD completo da Biblioteca.");
  }
  if(!mediaLibraryRuntime.includes("graphUsage") ||
     !mediaLibraryRuntime.includes("openEditor") ||
     !mediaLibraryRuntime.includes("assetUrl")){
    fail("Runtime da Biblioteca de Mídia está incompleto.");
  }
  if(!exists("docs/MEDIA_LIBRARY.md")) fail("docs/MEDIA_LIBRARY.md ausente");

  const adminFoundation=read("js/admin-foundation.js");
  const adminLoaderRuntime=read("js/admin-loader.js");
  if(!adminFoundation.includes("createSelection") ||
     !adminFoundation.includes("filterRows")){
    fail("Infraestrutura compartilhada para etapas 11–13 está incompleta.");
  }
  if(!adminLoaderRuntime.includes('"js/admin-foundation.js"')){
    fail("Infraestrutura administrativa não está registrada no lazy loader.");
  }

  pass(nodes.length+" nós e "+edges.length+" relações do Grafo 2.0 validados");

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
  if(!publishApi.includes('"data/media-library.js"') || !publishApi.includes('"images/library/"')){
    fail("Biblioteca de Mídia não está incluída no histórico/restauração.");
  }
  pass("Histórico/restauração e deploy inteligente usam APIs existentes sem restaurar código");

  const healthApi=read("api/health.js");
  const deployWorkflow=read(".github/workflows/vercel-deploy-hook.yml");
  const vercelConfig=JSON.parse(read("vercel.json"));

  if(!healthApi.includes('deployment_strategy:"github-actions-deploy-hook"') ||
     !healthApi.includes('vercel_connector_required:false')){
    fail("A política operacional deve declarar GitHub Actions/Deploy Hook como caminho oficial e Vercel Connector como opcional.");
  }
  if(!/name:\s*Vercel production checkpoint/.test(deployWorkflow) ||
     !deployWorkflow.includes("VERCEL_DEPLOY_HOOK_URL")){
    fail("Workflow oficial de produção via Deploy Hook não está configurado.");
  }
  if(!healthApi.includes('workflowRunStatus(sha,"Vercel production checkpoint")')){
    fail("api/health.js não acompanha o workflow oficial de produção.");
  }
  const rewrites=Array.isArray(vercelConfig.rewrites) ? vercelConfig.rewrites : [];
  for(const source of ["/api/status","/api/master-template","/api/master-finalize","/api/private-sessions"]){
    if(!rewrites.some(row=>row&&row.source===source)){
      fail("Rewrite de compatibilidade ausente: "+source);
    }
  }
  if(!exists("OPERATIONS.md")){
    fail("OPERATIONS.md ausente; novas conversas precisam de uma política operacional persistente.");
  }
  pass("Fluxo oficial GitHub → Actions → Deploy Hook → Vercel está documentado e testado");
}

function checkModuleRegistry(){
  const html=read("index.html");
  const loader=read("js/admin-loader.js");
  const direct=[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)]
    .map(match=>String(match[1]||"").replace(/^\.\//,""))
    .filter(path=>path.startsWith("js/"));
  const lazy=[...loader.matchAll(/["'](js\/[^"']+\.js)["']/g)].map(match=>match[1]);
  const registered=direct.concat(lazy);
  const duplicates=registered.filter((path,index)=>registered.indexOf(path)!==index);

  if(duplicates.length){
    fail("Módulos JavaScript registrados mais de uma vez: "+[...new Set(duplicates)].join(", "));
  }

  const files=fs.readdirSync(path.join(root,"js"),{withFileTypes:true})
    .filter(entry=>entry.isFile()&&entry.name.endsWith(".js"))
    .map(entry=>"js/"+entry.name)
    .sort();
  const orphaned=files.filter(file=>!registered.includes(file));

  if(orphaned.length){
    fail("Módulos JavaScript órfãos, não carregados nem pelo boot nem pelo lazy loader: "+orphaned.join(", "));
  }else{
    pass(files.length+" módulos JavaScript possuem caminho de carregamento explícito");
  }
}

function checkAdvancedAdmin(data){
  const taxonomy=data.characterTaxonomy||{};
  const requiredCollections=["nuclei","types","statuses","tags"];

  for(const key of requiredCollections){
    if(!Array.isArray(taxonomy[key])){
      fail("Taxonomia "+key+" ausente ou inválida.");
      continue;
    }
    const ids=new Set();
    const labels=new Set();
    for(const item of taxonomy[key]){
      const id=String(item&&item.id||"");
      const label=String(item&&item.label||"").trim();
      if(!id||!label) fail("Item inválido na taxonomia "+key);
      if(ids.has(id)) fail("ID duplicado em "+key+": "+id);
      if(labels.has(label.toLocaleLowerCase("pt-BR"))) fail("Nome duplicado em "+key+": "+label);
      ids.add(id);labels.add(label.toLocaleLowerCase("pt-BR"));
    }
  }

  if(!taxonomy.nuclei.some(item=>item&&item.id==="other")) fail("Núcleo fallback 'other' ausente.");
  if(!taxonomy.types.some(item=>item&&item.id==="other")) fail("Tipo fallback 'other' ausente.");
  if(!taxonomy.statuses.some(item=>item&&item.id==="unknown")) fail("Status fallback 'unknown' ausente.");

  const allowedNuclei=new Set(taxonomy.nuclei.map(item=>item.id));
  const allowedTypes=new Set(taxonomy.types.map(item=>item.id));
  const allowedStatuses=new Set(taxonomy.statuses.map(item=>item.id));
  const allowedTags=new Set(taxonomy.tags.map(item=>item.id));

  for(const [name,meta] of Object.entries(taxonomy.characters||{})){
    for(const id of Array.isArray(meta.nuclei)?meta.nuclei:[]){
      if(!allowedNuclei.has(id)) fail("Personagem com núcleo inválido: "+name+" / "+id);
    }
    for(const id of Array.isArray(meta.tags)?meta.tags:[]){
      if(!allowedTags.has(id)) fail("Personagem com tag inválida: "+name+" / "+id);
    }
    if(meta.type&&!allowedTypes.has(meta.type)) fail("Personagem com tipo inválido: "+name+" / "+meta.type);
    if(meta.status&&!allowedStatuses.has(meta.status)) fail("Personagem com status inválido: "+name+" / "+meta.status);
  }

  const html=read("index.html");
  const characterApi=read("api/character.js");
  const taxonomyRuntime=read("js/taxonomy-manager.js");
  const bulkRuntime=read("js/bulk-editor.js");
  const masterQuick=read("js/master-quick.js");
  const adminLoader=read("js/admin-loader.js");
  const adminPanel=read("js/admin-panel.js");
  const health=read("api/health.js");

  for(const id of [
    "taxonomyManagerTabs","taxonomyManagerList","taxonomyManagerSave",
    "characterEditorTags","characterTagFilter",
    "bulkEditorPanel","bulkEditorCharacters","bulkEditorApply",
    "masterQuickPanel","masterQuickStats","masterQuickGoals","masterQuickClues"
  ]){
    if(!html.includes('id="'+id+'"')) fail("Interface de Administração Avançada ausente: "+id);
  }

  if(!taxonomyRuntime.includes('activeKind="nuclei"') ||
     !taxonomyRuntime.includes('types:{label:"Tipos"') ||
     !taxonomyRuntime.includes('tags:{label:"Tags"')){
    fail("Taxonomias v2 não administram núcleos, tipos, status e tags.");
  }
  if(!characterApi.includes('body.action === "update-taxonomy"') ||
     !characterApi.includes('body.action === "bulk-update-meta"')){
    fail("API de personagens não oferece Taxonomias v2 + edição em lote.");
  }
  if(!bulkRuntime.includes("bulk-update-meta") ||
     !bulkRuntime.includes("createSelection")){
    fail("Edição em lote não utiliza a infraestrutura compartilhada esperada.");
  }
  if(!masterQuick.includes("getMasterState") ||
     !masterQuick.includes("getAll") ||
     !masterQuick.includes("timeline.events")){
    fail("Sala do Mestre não agrega conteúdo privado, sessões e timeline.");
  }

  for(const module of ['"js/taxonomy-manager.js"','"js/bulk-editor.js"','"js/master-quick.js"']){
    if(!adminLoader.includes(module)) fail("Módulo administrativo não registrado no lazy loader: "+module);
  }
  if(!adminPanel.includes("action === 'bulk-edit'") ||
     !adminPanel.includes("action === 'master-quick'")){
    fail("Painel administrativo não conecta Etapas 12 e 13.");
  }

  if(!health.includes("taxonomy_manager_v2:true") ||
     !health.includes("bulk_editor_v1:true") ||
     !health.includes("master_quick_panel_v1:true")){
    fail("Backend não anuncia capacidades das Etapas 11–13.");
  }

  if(!exists("docs/ADVANCED_ADMIN.md")) fail("docs/ADVANCED_ADMIN.md ausente.");

  pass("Etapa 11 · Taxonomias v2 validada");
  pass("Etapa 12 · Edição em Lote validada");
  pass("Etapa 13 · Sala do Mestre validada");
}

function checkPhase14(){
  const html=read("index.html");
  const commandPalette=read("js/command-palette.js");
  const sessionMode=read("js/session-mode.js");
  const backupExport=read("js/backup-export.js");
  const sessionEditor=read("js/session-editor.js");
  const adminLoader=read("js/admin-loader.js");
  const adminPanel=read("js/admin-panel.js");
  const publishApi=read("api/publish.js");
  const health=read("api/health.js");

  for(const id of [
    "commandPalette","commandPaletteInput","commandPaletteResults","commandPaletteBtn",
    "sessionModePanel","sessionModeCharacters","sessionModeNpcs","sessionModeGoals","sessionModeClues","sessionModeLog","sessionModeFinish",
    "backupExportPanel","backupExportComplete","backupExportPublicJson","backupExportHtmlPublic","backupExportHtmlMaster"
  ]){
    if(!html.includes('id="'+id+'"')) fail("Fase 14 · elemento de interface ausente: "+id);
  }

  if(!html.includes('src="js/command-palette.js"')){
    fail("Busca Global 2.0 não está no runtime público.");
  }
  if(!commandPalette.includes('event.ctrlKey||event.metaKey') ||
     !commandPalette.includes('getMasterState') ||
     !commandPalette.includes('routeForLocation')){
    fail("Busca Global 2.0 não cobre atalho, conteúdo Mestre e navegação por entidades.");
  }

  for(const module of ['"js/session-mode.js"','"js/backup-export.js"']){
    if(!adminLoader.includes(module)) fail("Fase 14 · módulo administrativo ausente do lazy loader: "+module);
  }
  if(!adminPanel.includes("action === 'session-mode'") ||
     !adminPanel.includes("action === 'backup-export'")){
    fail("Fase 14 não está conectada ao painel administrativo.");
  }

  if(!sessionMode.includes('sessionStorage.setItem(KEY') ||
     !sessionMode.includes('sessionStorage.getItem(KEY') ||
     sessionMode.includes('localStorage.setItem(KEY')){
    fail("Modo Sessão deve persistir somente em sessionStorage.");
  }
  if(!sessionMode.includes("openDraft") || !sessionEditor.includes("openDraft:openDraft")){
    fail("Modo Sessão não prepara o editor normal de sessão.");
  }

  if(!publishApi.includes('body.action === "export-backup"') ||
     !publishApi.includes('schema:"terra-z-backup-v2"') ||
     !publishApi.includes('private_content:"encrypted-aes-256-gcm"')){
    fail("Backup completo criptografado não está implementado em /api/publish.");
  }
  if(!backupExport.includes('path==="data/private-character-data.enc.json"') ||
     !backupExport.includes('path==="data/private-sessions.enc.json"')){
    fail("Snapshot público não remove explicitamente os cofres privados.");
  }
  if(!backupExport.includes('backup_export_v2===true')){
    fail("Backup v2 não está protegido por capability do backend.");
  }

  if(!health.includes("command_palette_v2:true") ||
     !health.includes("session_mode_v1:true") ||
     !health.includes("backup_export_v2:true")){
    fail("Backend não anuncia capacidades da Fase 14.");
  }
  if(!exists("docs/PHASE_14.md")) fail("docs/PHASE_14.md ausente.");

  pass("Etapa 14A · Busca Global 2.0 validada");
  pass("Etapa 14B · Modo Sessão validado");
  pass("Etapa 14C · Backup e Exportação validada");
}

function checkPwa(){
  const html=read("index.html");
  const manifestPath="manifest.webmanifest";
  const swPath="sw.js";
  const pwaPath="js/pwa.js";

  for(const file of [manifestPath,swPath,pwaPath,"images/pwa/icon-192.webp","images/pwa/icon-512.svg","images/pwa/icon-maskable.svg","docs/PWA.md"]){
    if(!exists(file)) fail("PWA · arquivo ausente: "+file);
  }

  try{
    const manifest=JSON.parse(read(manifestPath));
    if(manifest.display!=="standalone") fail("PWA · manifest deve usar display standalone.");
    if(manifest.start_url!=="./#/capa" || manifest.scope!=="./"){
      fail("PWA · start_url/scope devem permanecer relativos para Vercel + GitHub Pages.");
    }
    const icons=Array.isArray(manifest.icons)?manifest.icons:[];
    if(!icons.some(icon=>String(icon.sizes||"").includes("192x192"))){
      fail("PWA · ícone 192x192 ausente.");
    }
    if(!icons.some(icon=>String(icon.purpose||"").includes("maskable"))){
      fail("PWA · ícone maskable ausente.");
    }
  }catch(error){
    fail("PWA · manifest inválido: "+error.message);
  }

  if(exists("images/pwa/icon-192.webp")){
    const bytes=fs.statSync(path.join(root,"images/pwa/icon-192.webp")).size;
    if(bytes<4000) fail("PWA · ícone aprovado parece inválido ou pequeno demais.");
  }

  const sw=exists(swPath)?read(swPath):"";
  for(const token of [
    'path.includes("/api/")',
    'request.headers.has("authorization")',
    'path.includes("/data/private-")',
    'path.endsWith(".enc.json")',
    'type==="SKIP_WAITING"',
    'CACHE_PREFIX="terra-z-pwa-"'
  ]){
    if(!sw.includes(token)) fail("PWA · proteção/atualização ausente no Service Worker: "+token);
  }

  const pwa=exists(pwaPath)?read(pwaPath):"";
  for(const token of [
    'serviceWorker.register("./sw.js"',
    '"beforeinstallprompt"',
    '"controllerchange"',
    'navigator.onLine',
    '"terra-z:network-changed"'
  ]){
    if(!pwa.includes(token)) fail("PWA · runtime incompleto: "+token);
  }

  if(!html.includes('rel="manifest" href="./manifest.webmanifest"') ||
     !html.includes('src="js/pwa.js"') ||
     !html.includes('id="commandPaletteBtn" title="Central de Comandos')){
    fail("PWA/Central não estão conectados ao index.html.");
  }

  for(const file of ["api/character.js","api/graph.js","api/session.js"]){
    if(!read(file).includes('Cache-Control","no-store, max-age=0')){
      fail("PWA · API autenticada sem no-store: "+file);
    }
  }

  if(!read("api/health.js").includes("pwa_v1:true")) fail("PWA · backend não anuncia pwa_v1.");
  const vercel=read("vercel.json");
  if(!vercel.includes('"/sw.js"') || !vercel.includes('"no-cache, no-store, must-revalidate"')){
    fail("PWA · Vercel não protege atualização do Service Worker.");
  }

  pass("Etapa PWA · instalação, offline público, atualização e privacidade validados");
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
    else if(topLevel>9) warn("Funções serverless dentro do limite, mas acima da meta otimizada: "+topLevel+"/12");
    else pass("Arquitetura serverless otimizada: "+topLevel+"/12 (meta <= 9)");

    if(config.git&&config.git.deploymentEnabled===false){
      warn("Deploy automático da Vercel está pausado (staging intencional)");
    }

    for(const legacy of ["master-template.js","master-finalize.js","private-sessions.js","status.js"]){
      if(exists("api/"+legacy)) fail("Endpoint legado ainda ocupa função serverless: api/"+legacy);
    }
    const masterApi=read("api/master.js");
    const sessionApi=read("api/session.js");
    const healthApi=read("api/health.js");
    if(!masterApi.includes('action === "template"') || !masterApi.includes('action === "finalize"')){
      fail("api/master.js não consolidou template/finalização.");
    }
    if(!sessionApi.includes('action !== "private"')){
      fail("api/session.js não consolidou leitura de sessões privadas.");
    }
    if(!healthApi.includes('mode || "") === "status"')){
      fail("api/health.js não consolidou acompanhamento de status.");
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
checkPerformanceBudget();
const data=loadTerraData();
const characters=checkCharacterData(data);
checkMediaLibrary(data);
checkSessions(data,characters);
checkTimeline(data,characters);
checkGraph(data);
checkModuleRegistry();
checkAdvancedAdmin(data);
checkPhase14();
checkPwa();
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
