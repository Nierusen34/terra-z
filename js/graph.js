(function(){
"use strict";

window.TerraZApp=window.TerraZApp || {};
var core=window.TerraZCore;
if(!core) throw new Error("Terra Z: núcleo não carregado antes de js/graph.js");

var showToast=core.showToast;
var showConfirm=core.showConfirm;
var escapeHtml=core.escapeHtml;
var escapeAttr=core.escapeAttr;

var GRAPH_KEY="terraZ_graph_v3";
var GRAPH_BACKUP_KEY="terraZ_graph_backup_v3";

var KIND={
  character:{label:"Personagem",icon:"👤",color:"#8b1a1a"},
  team:{label:"Equipe",icon:"🛡️",color:"#286c8f"},
  faction:{label:"Facção",icon:"⚑",color:"#76578d"},
  organization:{label:"Organização",icon:"◆",color:"#a47719"},
  location:{label:"Local",icon:"📍",color:"#3f7f53"},
  event:{label:"Evento",icon:"✦",color:"#a24f2d"},
  custom:{label:"Outro",icon:"●",color:"#3a3028"}
};

var RELATION={
  family:{label:"Família",color:"#c4186f"},
  romance:{label:"Romance",color:"#b33c7a"},
  ally:{label:"Aliado",color:"#0064a8"},
  mentor:{label:"Mentoria",color:"#2586a8"},
  member:{label:"Membro de",color:"#3f7f53"},
  command:{label:"Comando",color:"#a47719"},
  business:{label:"Negócio",color:"#8a6a45"},
  investigation:{label:"Investigação",color:"#607d8b"},
  origin:{label:"Origem",color:"#7a4aff"},
  clone:{label:"Clone",color:"#7a4aff"},
  tension:{label:"Tensão",color:"#cc4444"},
  enemy:{label:"Inimizade",color:"#b51f1f"},
  rivalry:{label:"Rivalidade",color:"#d06b28"},
  other:{label:"Outro",color:"#6f6862"}
};

var legacyCharacterMap={
  oliver:"Oliver Queen",dinah:"Dinah Lance",tristan:"Tristan Queen",
  connor:"Connor Hawke",bruce:"Bruce Wayne",damian:"Damian Wayne",
  jason:"Jason Todd",dick:"Dick Grayson",tim:"Tim Drake",
  mgann:"M'gann M'orzz",conner2:"Conner Kent",mark:"M'ark",
  jonn:"J'onn J'onzz",lobo:"Lobo",riot:"Riot",kendra:"Kendra Saunders"
};

var defaultGraph=(window.TerraZData && window.TerraZData.defaultGraph) || {version:3,quadrants:[],nodes:[],edges:[]};
var publishedGraph=(window.TerraZData && window.TerraZData.graphOverride) || null;
var graphData=null;
var selectedNodeId="";
var selectedEdgeId="";
var graphRelationFilter="all";
var graphEntityFilter="all";
var graphSearch="";
var visibilityCapability=null;
var graphV3Capability=null;
var GRAPH_SCALE_KEY="terraZ_graph_scale_v1";
var graphScale=1.3;
var graphPortraitPending=Object.create(null);

var editorDraft=null;
var editorMode="nodes";
var editorSelectedId="";
var editorSearch="";
var editorUndoStack=[];
var editorLayoutDrag=null;

var graphViewPositions=Object.create(null);
var graphViewDrag=null;
var graphSuppressClickUntil=0;

var quickRelationState={
  sourceId:"",
  targetId:"",
  draft:false,
  picking:false
};

function clone(value){ return JSON.parse(JSON.stringify(value)); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }
function router(){ return window.TerraZApp && window.TerraZApp.router; }
function privateContent(){ return window.TerraZApp && window.TerraZApp.privateContent; }

function slugify(value){
  var r=router();
  if(r && r.slugify) return r.slugify(value);
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}

function normalizeVisibility(value){
  var raw=String(value || "public");
  if(raw==="master" || raw==="private") return "master";
  if(raw==="spoiler" || raw==="rumor" || raw==="restricted") return "spoiler";
  return "public";
}

function normalizeKind(value){
  return KIND[value] ? value : "custom";
}

function normalizeRelation(value){
  return RELATION[value] ? value : "other";
}

function edgeId(edge,index){
  return String(edge && edge.id || ("edge-"+(index+1)));
}

function normalizeGraph(graph){
  graph=clone(graph || {version:3,quadrants:[],nodes:[],edges:[]});
  graph.version=3;
  graph.quadrants=Array.isArray(graph.quadrants) ? graph.quadrants : [];
  graph.nodes=(Array.isArray(graph.nodes) ? graph.nodes : []).map(function(node,index){
    var legacy=legacyCharacterMap[node.id] || "";
    var kind=normalizeKind(node.kind || (legacy ? "character" : "custom"));
    var ref=String(node.ref || legacy || "");
    return {
      id:String(node.id || ("node-"+(index+1))),
      label:String(node.label || node.id || "ENTIDADE"),
      subtitle:String(node.subtitle || ref || ""),
      kind:kind,
      ref:ref,
      route:String(node.route || ""),
      icon:String(node.icon || ""),
      mediaMode:["none","character","library","url"].includes(node.mediaMode)
        ? node.mediaMode
        : (kind==="character" && ref ? "character" : "none"),
      mediaId:String(node.mediaId || ""),
      mediaUrl:/^https:\/\//i.test(String(node.mediaUrl || "")) ? String(node.mediaUrl) : "",
      mediaFraming:{
        fit:node.mediaFraming && node.mediaFraming.fit==="contain" ? "contain" : "cover",
        x:Number.isFinite(Number(node.mediaFraming && node.mediaFraming.x)) ? Math.max(0,Math.min(100,Number(node.mediaFraming.x))) : 50,
        y:Number.isFinite(Number(node.mediaFraming && node.mediaFraming.y)) ? Math.max(0,Math.min(100,Number(node.mediaFraming.y))) : 24,
        zoom:Number.isFinite(Number(node.mediaFraming && node.mediaFraming.zoom)) ? Math.max(.5,Math.min(2.5,Number(node.mediaFraming.zoom))) : 1
      },
      x:Number.isFinite(Number(node.x)) ? Number(node.x) : 500,
      y:Number.isFinite(Number(node.y)) ? Number(node.y) : 360,
      color:/^#[0-9a-f]{6}$/i.test(String(node.color || "")) ? String(node.color) : KIND[kind].color,
      r:Number.isFinite(Number(node.r)) ? Math.max(18,Math.min(120,Number(node.r))) : 38,
      visibility:normalizeVisibility(node.visibility)
    };
  });

  graph.edges=(Array.isArray(graph.edges) ? graph.edges : []).map(function(edge,index){
    return {
      id:edgeId(edge,index),
      from:String(edge.from || ""),
      to:String(edge.to || ""),
      type:normalizeRelation(edge.type),
      label:String(edge.label || ""),
      note:String(edge.note || ""),
      strength:Number.isFinite(Number(edge.strength)) ? Math.max(1,Math.min(5,Number(edge.strength))) : 3,
      directed:edge.directed===true,
      visibility:normalizeVisibility(edge.visibility)
    };
  });

  return graph;
}

function privateGraph(){
  var api=privateContent();
  return api && api.getPrivateGraph ? api.getPrivateGraph() : {nodes:[],edges:[]};
}

function mergePrivateGraph(base){
  var graph=normalizeGraph(base);
  var secure=normalizeGraph({version:3,quadrants:[],nodes:privateGraph().nodes || [],edges:privateGraph().edges || []});
  var ids=new Set(graph.nodes.map(function(node){ return node.id; }));

  secure.nodes.forEach(function(node){
    if(ids.has(node.id)) return;
    graph.nodes.push({...node,visibility:"master"});
    ids.add(node.id);
  });

  secure.edges.forEach(function(edge){
    var copy={...edge,visibility:"master"};
    if(!graph.edges.some(function(row){ return row.id===copy.id; })) graph.edges.push(copy);
  });

  return graph;
}

function publicGraphSnapshot(graph){
  graph=normalizeGraph(graph);
  var masterIds=new Set(graph.nodes.filter(function(n){ return n.visibility==="master"; }).map(function(n){ return n.id; }));
  return {
    version:3,
    quadrants:clone(graph.quadrants),
    nodes:graph.nodes.filter(function(n){ return n.visibility!=="master"; }),
    edges:graph.edges.filter(function(e){
      return e.visibility!=="master" && !masterIds.has(e.from) && !masterIds.has(e.to);
    })
  };
}

function loadGraph(){
  var base=publishedGraph && Array.isArray(publishedGraph.nodes) ? publishedGraph : defaultGraph;
  if(!publishedGraph){
    try{
      var saved=localStorage.getItem(GRAPH_KEY);
      if(!saved) saved=localStorage.getItem("terraZ_graph_v2");
      if(saved) base=JSON.parse(saved);
    }catch(error){ console.error(error); }
  }
  return mergePrivateGraph(base);
}

function saveLocalGraph(){
  try{
    var snapshot=publicGraphSnapshot(graphData);
    localStorage.setItem(GRAPH_KEY,JSON.stringify(snapshot));
  }catch(error){ console.error(error); }
}

function storeLayoutBackup(graph){
  try{
    var source=normalizeGraph(graph);
    var positions={};
    source.nodes.forEach(function(node){
      if(normalizeVisibility(node.visibility)==="master") return;
      positions[node.id]={x:node.x,y:node.y,r:node.r};
    });
    localStorage.setItem(GRAPH_BACKUP_KEY,JSON.stringify({
      version:2,
      kind:"layout",
      savedAt:new Date().toISOString(),
      positions:positions
    }));
  }catch(error){ console.error(error); }
}

function allowed(level){
  var visibility=window.TerraZApp && window.TerraZApp.visibility;
  return !visibility || !visibility.isLevelAllowed || visibility.isLevelAllowed(normalizeVisibility(level));
}

function canEdit(){
  var b=backend();
  return !!(b && b.isConfigured && b.isConfigured() && b.isAuthenticated && b.isAuthenticated());
}

async function supportsVisibilitySystem(){
  if(visibilityCapability!==null) return visibilityCapability;
  var b=backend();
  if(!b || !b.health) return false;
  try{
    var health=await b.health();
    visibilityCapability=!!(
      health &&
      health.visibility_system==="public-spoiler-master" &&
      health.secure_master_relations===true
    );
  }catch(error){ visibilityCapability=false; }
  return visibilityCapability;
}

async function supportsGraphV3(){
  if(graphV3Capability!==null) return graphV3Capability;
  var b=backend();
  if(!b || !b.health) return false;
  try{
    var health=await b.health();
    graphV3Capability=!!(
      health &&
      health.relations_graph_v3===true &&
      health.relations_entity_editor===true &&
      health.media_library_v1===true &&
      health.graph_independent_media===true
    );
  }catch(error){ graphV3Capability=false; }
  return graphV3Capability;
}

function routeForNode(node){
  if(!node) return "";
  if(node.route && node.route.charAt(0)==="/") return node.route;
  var ref=String(node.ref || node.subtitle || node.label || "");
  var r=router();

  if(node.kind==="character") return ref ? "/personagens/"+slugify(ref) : "";
  if(node.kind==="team") return ref ? "/equipes/"+slugify(ref) : "";
  if(node.kind==="event") return ref ? "/linha-do-tempo/"+slugify(ref) : "";
  if(node.kind==="location" && r && r.routeForLocation) return r.routeForLocation(ref);
  return "";
}

function nodeById(id,source){
  var graph=source || graphData;
  return graph && graph.nodes ? graph.nodes.find(function(node){ return node.id===id; }) : null;
}

function edgeById(id,source){
  var graph=source || graphData;
  return graph && graph.edges ? graph.edges.find(function(edge){ return edge.id===id; }) : null;
}

function quickRelationGraph(){
  return quickRelationState.draft && editorDraft ? editorDraft : graphData;
}

function quickRelationNode(id){
  return nodeById(id,quickRelationGraph());
}

function quickRelationOptions(selectedId){
  var graph=quickRelationGraph() || {nodes:[]};
  return (graph.nodes || []).filter(function(node){
    return node.id!==quickRelationState.sourceId && (quickRelationState.draft || allowed(node.visibility));
  }).sort(function(a,b){
    return String(a.label).localeCompare(String(b.label),"pt-BR");
  }).map(function(node){
    return '<option value="'+escapeAttr(node.id)+'"'+(node.id===selectedId?' selected':'')+'>'+escapeHtml(node.label)+'</option>';
  }).join("");
}

function quickRelationTypeOptions(selected){
  return Object.keys(RELATION).map(function(type){
    return '<option value="'+type+'"'+(type===selected?' selected':'')+'>'+escapeHtml(RELATION[type].label)+'</option>';
  }).join("");
}

function setQuickRelationStatus(message,state){
  var node=document.getElementById("graphQuickStatus");
  if(!node) return;
  node.textContent=message || "";
  node.dataset.state=state || "idle";
}

function updateQuickPair(){
  var from=quickRelationNode(quickRelationState.sourceId);
  var target=document.getElementById("graphQuickTarget");
  var targetId=target ? target.value : quickRelationState.targetId;
  var to=quickRelationNode(targetId);
  var fromLabel=document.getElementById("graphQuickFromLabel");
  var toLabel=document.getElementById("graphQuickToLabel");
  if(fromLabel) fromLabel.textContent=from ? from.label : "—";
  if(toLabel) toLabel.textContent=to ? to.label : "Escolha o destino";
}

function updateConnectBar(){
  var bar=document.getElementById("graphConnectBar");
  if(!bar) return;
  var active=!!(!quickRelationState.draft && quickRelationState.picking && quickRelationState.sourceId);
  bar.hidden=!active;
  if(!active) return;
  var source=quickRelationNode(quickRelationState.sourceId);
  var title=document.getElementById("graphConnectBarTitle");
  var text=document.getElementById("graphConnectBarText");
  if(title) title.textContent="🔗 Conectando "+(source ? source.label : "entidade");
  if(text) text.textContent="Clique ou toque na segunda bolinha. Você também pode escolher o destino pela lista.";
}

function closeQuickRelationModal(){
  var modal=document.getElementById("graphQuickRelationModal");
  if(modal){
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");
  }
}

function resetQuickRelationState(){
  quickRelationState={sourceId:"",targetId:"",draft:false,picking:false};
  updateConnectBar();
}

function cancelQuickRelation(){
  closeQuickRelationModal();
  resetQuickRelationState();
  renderGraph();
  if(editorMode==="layout" && editorDraft) renderEditorDetail();
}

function openQuickRelation(sourceId,targetId,options){
  options=options || {};
  if(!canEdit()){
    showToast("Entre como editor para criar relações.","warning",4200);
    return;
  }

  quickRelationState={
    sourceId:String(sourceId || ""),
    targetId:String(targetId || ""),
    draft:options.draft===true,
    picking:false
  };
  var source=quickRelationNode(quickRelationState.sourceId);
  if(!source){
    showToast("Entidade de origem não encontrada.","warning");
    resetQuickRelationState();
    return;
  }

  var modal=document.getElementById("graphQuickRelationModal");
  var target=document.getElementById("graphQuickTarget");
  var type=document.getElementById("graphQuickType");
  var label=document.getElementById("graphQuickLabel");
  var strength=document.getElementById("graphQuickStrength");
  var directed=document.getElementById("graphQuickDirected");
  var visibility=document.getElementById("graphQuickVisibility");
  var note=document.getElementById("graphQuickNote");

  if(target){
    target.innerHTML='<option value="">Escolha uma entidade…</option>'+quickRelationOptions(quickRelationState.targetId);
    target.value=quickRelationState.targetId || "";
  }
  if(type){type.innerHTML=quickRelationTypeOptions("ally");type.value="ally";}
  if(label) label.value="";
  if(strength) strength.value="3";
  if(directed) directed.checked=false;
  if(visibility) visibility.value="public";
  if(note) note.value="";
  setQuickRelationStatus(
    quickRelationState.draft
      ? "A conexão entrará no rascunho atual e será publicada quando você salvar o grafo."
      : "A nova conexão será salva diretamente no Grafo 2.0.",
    "idle"
  );
  updateQuickPair();
  updateConnectBar();

  if(modal){
    modal.classList.add("show");
    modal.setAttribute("aria-hidden","false");
  }
}

function beginQuickPick(sourceId,options){
  options=options || {};
  if(!canEdit()){
    showToast("Entre como editor para criar relações.","warning",4200);
    return;
  }

  quickRelationState={
    sourceId:String(sourceId || quickRelationState.sourceId || ""),
    targetId:"",
    draft:options.draft===true || quickRelationState.draft===true,
    picking:true
  };
  if(!quickRelationNode(quickRelationState.sourceId)){
    resetQuickRelationState();
    return;
  }

  closeQuickRelationModal();
  updateConnectBar();

  if(quickRelationState.draft && editorMode==="layout" && editorDraft){
    renderEditorDetail();
    showToast("Toque ou clique na segunda bolinha para criar a conexão.","info",4200);
  }else{
    renderGraph();
    var wrap=document.querySelector(".graph-canvas-card");
    if(wrap) wrap.scrollIntoView({behavior:"smooth",block:"start"});
  }
}

function existingQuickRelation(graph,edge){
  return (graph.edges || []).find(function(row){
    if(row.type!==edge.type) return false;
    if(row.directed || edge.directed){
      return row.from===edge.from && row.to===edge.to && row.directed===edge.directed;
    }
    return (row.from===edge.from && row.to===edge.to) || (row.from===edge.to && row.to===edge.from);
  }) || null;
}

function quickRelationEdge(graph){
  var target=document.getElementById("graphQuickTarget");
  var type=document.getElementById("graphQuickType");
  var label=document.getElementById("graphQuickLabel");
  var strength=document.getElementById("graphQuickStrength");
  var directed=document.getElementById("graphQuickDirected");
  var visibility=document.getElementById("graphQuickVisibility");
  var note=document.getElementById("graphQuickNote");
  var targetId=String(target && target.value || quickRelationState.targetId || "");
  if(!targetId || targetId===quickRelationState.sourceId) return null;

  var base="relacao-"+quickRelationState.sourceId+"-"+targetId+"-"+String(type && type.value || "ally");
  var used=new Set((graph.edges || []).map(function(row){return row.id;}));
  var id=slugify(base) || "relacao";
  var candidate=id,i=2;
  while(used.has(candidate)){candidate=id+"-"+i;i++;}

  return {
    id:candidate,
    from:quickRelationState.sourceId,
    to:targetId,
    type:normalizeRelation(type && type.value || "ally"),
    label:String(label && label.value || "").trim(),
    note:String(note && note.value || "").trim(),
    strength:Math.max(1,Math.min(5,Number(strength && strength.value)||3)),
    directed:!!(directed && directed.checked),
    visibility:normalizeVisibility(visibility && visibility.value || "public")
  };
}

async function saveQuickRelation(){
  var graph=quickRelationGraph();
  if(!graph) return;
  var edge=quickRelationEdge(graph);
  if(!edge){
    setQuickRelationStatus("Escolha uma entidade de destino diferente da origem.","warning");
    return;
  }
  if(existingQuickRelation(graph,edge)){
    setQuickRelationStatus("Essa conexão já existe. Abra a relação existente para editá-la.","warning");
    return;
  }

  if(edge.visibility!=="public" && !(await supportsVisibilitySystem())){
    setQuickRelationStatus("O backend atual ainda não permite salvar relações Spoiler/Mestre.","warning");
    return;
  }

  if(quickRelationState.draft){
    pushEditorUndo();
    editorDraft.edges.push(edge);
    editorSelectedId=editorMode==="layout" ? edge.from : edge.id;
    closeQuickRelationModal();
    resetQuickRelationState();
    if(editorMode==="layout") renderEditorDetail();
    else {
      editorMode="edges";
      renderEditorTabs();renderEditorList();renderEditorDetail();
    }
    showToast("Conexão adicionada ao rascunho. Salve o grafo quando terminar.","success",4800);
    return;
  }

  if(!(await supportsGraphV3())){
    setQuickRelationStatus("O backend de Relações 2.0 ainda não está disponível.","warning");
    return;
  }

  var save=document.getElementById("graphQuickSave");
  if(save){save.disabled=true;save.textContent="Salvando…";}
  try{
    var next=normalizeGraph(graphData);
    next.edges.push(edge);
    var before=clone(graphData);
    var b=backend();
    var result=await b.request("/api/graph",{method:"POST",body:{graph:next}});
    storeLayoutBackup(before);
    publishedGraph=result.publicGraph ? clone(result.publicGraph) : publishedGraph;
    graphData=result.graph ? normalizeGraph(result.graph) : normalizeGraph(next);

    var pc=privateContent();
    if(pc && pc.reload){
      await pc.reload();
      graphData=loadGraph();
    }
    saveLocalGraph();
    closeQuickRelationModal();
    resetQuickRelationState();
    selectedEdgeId=edge.id;selectedNodeId="";
    renderGraph();renderInspector();
    showToast("Conexão criada com sucesso.","success",4200);

    var runtime=window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh) runtime.refresh({force:true,bust:result.sha,silent:true});
    var publishing=window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url) publishing.trackDeployment(result.status_url);
  }catch(error){
    console.error("Terra Z quick relation:",error);
    setQuickRelationStatus(error.message || "Não foi possível criar a conexão.","error");
  }finally{
    if(save){save.disabled=false;save.textContent="＋ Criar conexão";}
  }
}

function selectQuickTarget(id){
  if(!quickRelationState.picking || !quickRelationState.sourceId) return false;
  if(id===quickRelationState.sourceId){
    showToast("Escolha outra entidade para formar a conexão.","info",3000);
    return true;
  }
  quickRelationState.targetId=id;
  openQuickRelation(quickRelationState.sourceId,id,{draft:quickRelationState.draft});
  return true;
}

function graphDisplayNode(node){
  if(!node) return null;
  var pos=graphViewPositions[node.id];
  if(!pos) return node;
  return {...node,x:Number(pos.x),y:Number(pos.y)};
}

function graphDisplayNodeById(id){
  return graphDisplayNode(nodeById(id));
}

function graphViewHasChanges(){
  return Object.keys(graphViewPositions).length>0;
}

function updateGraphViewResetButton(){
  var button=document.getElementById("graphViewResetBtn");
  if(!button) return;
  var changed=graphViewHasChanges();
  button.disabled=!changed;
  button.setAttribute("aria-disabled",changed?"false":"true");
  button.title=changed
    ? "Restaurar as posições publicadas do grafo"
    : "As entidades já estão nas posições publicadas";
}

function resetGraphViewPositions(showMessage){
  graphViewPositions=Object.create(null);
  graphViewDrag=null;
  graphSuppressClickUntil=0;
  var wrap=document.querySelector(".graph-wrap-v2");
  if(wrap) wrap.classList.remove("is-node-dragging");
  renderGraph();
  if(showMessage!==false) showToast("Posições restauradas para o layout publicado.","info",3200);
}

function svgPointFromEvent(svg,event){
  var ctm=svg && svg.getScreenCTM ? svg.getScreenCTM() : null;
  if(!ctm) return {x:0,y:0};
  var point=svg.createSVGPoint();
  point.x=Number(event.clientX)||0;
  point.y=Number(event.clientY)||0;
  return point.matrixTransform(ctm.inverse());
}

function updateGraphViewEdgeDom(svg,nodeId){
  (graphData && graphData.edges || []).forEach(function(edge){
    if(edge.from!==nodeId && edge.to!==nodeId) return;
    var group=svg.querySelector('[data-edge-id="'+CSS.escape(edge.id)+'"]');
    if(!group) return;
    var a=graphDisplayNodeById(edge.from),b=graphDisplayNodeById(edge.to);
    if(!a||!b) return;
    var index=Number(group.getAttribute("data-edge-index"))||0;
    var geometry=curveForEdge(a,b,index);
    group.querySelectorAll("path").forEach(function(path){ path.setAttribute("d",geometry.d); });
    var label=group.querySelector(".graph-edge-label");
    if(label) label.setAttribute("transform","translate("+geometry.mx+" "+geometry.my+")");
  });
}

function updateGraphViewNodeDom(svg,node,drag){
  var group=svg.querySelector('[data-node-id="'+CSS.escape(node.id)+'"]');
  if(group){
    group.setAttribute("transform","translate("+(node.x-drag.startX)+" "+(node.y-drag.startY)+")");
    group.classList.add("dragging");
  }
  updateGraphViewEdgeDom(svg,node.id);
}

function bindGraphViewDrag(svg,group){
  var id=group.getAttribute("data-node-id")||"";
  if(!id) return;

  group.addEventListener("pointerdown",function(event){
    if(event.button!==undefined && event.button!==0) return;

    if(!quickRelationState.draft && quickRelationState.picking){
      event.preventDefault();
      event.stopPropagation();
      graphSuppressClickUntil=Date.now()+360;
      selectQuickTarget(id);
      return;
    }

    var start=graphDisplayNodeById(id);
    if(!start) return;

    event.preventDefault();
    event.stopPropagation();

    graphViewDrag={
      id:id,
      pointerId:event.pointerId,
      startClientX:event.clientX,
      startClientY:event.clientY,
      startX:start.x,
      startY:start.y,
      moved:false
    };

    var wrap=svg.closest(".graph-wrap-v2");
    if(wrap) wrap.classList.add("is-node-dragging");
    try{ group.setPointerCapture(event.pointerId); }catch(error){}

    var move=function(moveEvent){
      if(!graphViewDrag || graphViewDrag.id!==id || graphViewDrag.pointerId!==moveEvent.pointerId) return;
      moveEvent.preventDefault();
      moveEvent.stopPropagation();

      var distance=Math.hypot(
        moveEvent.clientX-graphViewDrag.startClientX,
        moveEvent.clientY-graphViewDrag.startClientY
      );
      if(distance<2 && !graphViewDrag.moved) return;

      var base=nodeById(id);
      if(!base) return;
      var point=svgPointFromEvent(svg,moveEvent);
      var pad=Math.max(8,Number(base.r)||38);
      var x=Math.round(Math.max(pad,Math.min(1000-pad,point.x)));
      var y=Math.round(Math.max(pad,Math.min(720-pad-30,point.y)));

      graphViewDrag.moved=true;
      graphViewPositions[id]={x:x,y:y};
      updateGraphViewNodeDom(svg,graphDisplayNodeById(id),graphViewDrag);
      updateGraphViewResetButton();
    };

    var finish=function(endEvent){
      if(!graphViewDrag || graphViewDrag.id!==id || graphViewDrag.pointerId!==endEvent.pointerId) return;
      endEvent.preventDefault();
      endEvent.stopPropagation();

      var moved=graphViewDrag.moved;
      try{ group.releasePointerCapture(endEvent.pointerId); }catch(error){}
      if(wrap) wrap.classList.remove("is-node-dragging");

      window.removeEventListener("pointermove",move,true);
      window.removeEventListener("pointerup",finish,true);
      window.removeEventListener("pointercancel",finish,true);

      graphViewDrag=null;
      if(moved){
        graphSuppressClickUntil=Date.now()+360;
        requestAnimationFrame(function(){ renderGraph(); });
      }
    };

    window.addEventListener("pointermove",move,{capture:true,passive:false});
    window.addEventListener("pointerup",finish,{capture:true,passive:false});
    window.addEventListener("pointercancel",finish,{capture:true,passive:false});
  });
}

function relationColor(type){
  return (RELATION[normalizeRelation(type)] || RELATION.other).color;
}

function svgId(value){
  return String(value || "node").replace(/[^a-zA-Z0-9_-]+/g,"-");
}

function characterMediaApi(){
  return window.TerraZApp && window.TerraZApp.characterMedia;
}

function mediaLibraryApi(){
  return window.TerraZApp && window.TerraZApp.mediaLibrary;
}

function libraryAsset(id){
  var api=mediaLibraryApi();
  if(api && api.getAsset) return api.getAsset(id);
  var library=(window.TerraZData && window.TerraZData.mediaLibrary) || {};
  return (library.assets || []).find(function(asset){ return asset && asset.id===id; }) || null;
}

function libraryAssetUrl(asset){
  var api=mediaLibraryApi();
  if(api && api.assetUrl) return api.assetUrl(asset);
  if(!asset) return "";
  var src=String(asset.src || "");
  var runtime=window.TerraZApp && window.TerraZApp.runtimeData;
  return runtime && runtime.mediaUrl ? runtime.mediaUrl(src) : src;
}

function frameStyle(frame){
  frame=frame || {};
  var fit=frame.fit==="contain" ? "contain" : "cover";
  var x=Number.isFinite(Number(frame.x)) ? Number(frame.x) : 50;
  var y=Number.isFinite(Number(frame.y)) ? Number(frame.y) : 24;
  var zoom=Number.isFinite(Number(frame.zoom)) ? Number(frame.zoom) : 1;
  return "--portrait-fit:"+fit+";--portrait-x:"+x+"%;--portrait-y:"+y+"%;--portrait-zoom:"+zoom;
}

function nodeMedia(node){
  if(!node || node.mediaMode==="none") return {src:"",style:"",mode:"none"};

  if(node.mediaMode==="library"){
    var asset=libraryAsset(node.mediaId);
    return {
      src:libraryAssetUrl(asset),
      style:frameStyle(node.mediaFraming || (asset && asset.framing)),
      mode:"library",
      asset:asset
    };
  }

  if(node.mediaMode==="url"){
    return {
      src:/^https:\/\//i.test(String(node.mediaUrl || "")) ? String(node.mediaUrl) : "",
      style:frameStyle(node.mediaFraming),
      mode:"url"
    };
  }

  if(node.mediaMode==="character" && node.ref){
    var api=characterMediaApi();
    var meta=api && api.get ? api.get(node.ref) : {};
    return {
      src:String(meta && meta.src || ""),
      style:api && api.framingStyle
        ? api.framingStyle(node.ref,"graph")
        : frameStyle(node.mediaFraming),
      mode:"character",
      meta:meta || {}
    };
  }

  return {src:"",style:"",mode:"none"};
}

function queueGraphPortrait(node){
  if(!node || node.mediaMode!=="character" || !node.ref) return;
  var media=nodeMedia(node);
  if(media.src || graphPortraitPending[node.ref]) return;

  var api=characterMediaApi();
  if(!api || !api.resolveAutomatic) return;

  graphPortraitPending[node.ref]=true;
  api.resolveAutomatic(node.ref).then(function(result){
    delete graphPortraitPending[node.ref];
    if(result && result.found){
      renderGraph();
      if(selectedNodeId===node.id || selectedEdgeId) renderInspector();
    }
  }).catch(function(){
    delete graphPortraitPending[node.ref];
  });
}

function inspectorPortrait(node,size){
  if(!node) return "";
  var kind=KIND[node.kind] || KIND.custom;
  var media=nodeMedia(node);

  if(media.mode==="character" && node.ref){
    var api=characterMediaApi();
    if(api && api.renderPortraitHtml){
      return '<div class="graph-inspector-portrait">'+api.renderPortraitHtml(node.ref,size || "large","graph")+'</div>';
    }
  }

  if(media.src){
    return '<div class="graph-inspector-portrait graph-inspector-independent">'+
      '<div class="graph-node-portrait-frame" style="'+escapeAttr(media.style)+'">'+
        '<img src="'+escapeAttr(media.src)+'" alt="'+escapeAttr(node.label || "")+'" loading="lazy" decoding="async" referrerpolicy="no-referrer">'+
      '</div>'+
    '</div>';
  }

  return '<div class="graph-inspector-portrait graph-inspector-portrait-fallback"><span>'+escapeHtml(node.icon || kind.icon)+'</span></div>';
}

function hydrateInspectorPortraits(root){
  var api=characterMediaApi();
  if(api && api.hydrate && root) api.hydrate(root);
}

function readGraphScale(){
  try{
    var raw=Number(localStorage.getItem(GRAPH_SCALE_KEY));
    if(Number.isFinite(raw) && raw>=.75 && raw<=2) return raw;
  }catch(error){}
  return 1.3;
}

function applyGraphScale(){
  var svg=document.getElementById("graphSvg");
  if(svg){
    svg.style.width=Math.round(graphScale*100)+"%";
    svg.style.minWidth=Math.round(780*graphScale)+"px";
    svg.style.maxWidth="none";
  }

  var range=document.getElementById("graphZoomRange");
  var label=document.getElementById("graphZoomLabel");
  if(range) range.value=String(Math.round(graphScale*100));
  if(label) label.textContent=Math.round(graphScale*100)+"%";
}

function setGraphScale(value,persist){
  var next=Math.max(.75,Math.min(2,Number(value) || 1.3));
  graphScale=Math.round(next*20)/20;
  if(persist!==false){
    try{ localStorage.setItem(GRAPH_SCALE_KEY,String(graphScale)); }catch(error){}
  }
  applyGraphScale();
}

function visibleNodes(){
  if(!graphData) return [];
  var base=graphData.nodes.filter(function(node){
    if(!allowed(node.visibility)) return false;
    if(graphEntityFilter!=="all" && node.kind!==graphEntityFilter) return false;
    return true;
  });

  var needle=String(graphSearch || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  if(!needle) return base;

  var matched=new Set();
  base.forEach(function(node){
    var text=[node.label,node.subtitle,node.ref,KIND[node.kind] && KIND[node.kind].label].join(" ")
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    if(text.indexOf(needle)!==-1) matched.add(node.id);
  });

  if(!matched.size) return [];

  var expanded=new Set(matched);
  graphData.edges.forEach(function(edge){
    if(matched.has(edge.from)) expanded.add(edge.to);
    if(matched.has(edge.to)) expanded.add(edge.from);
  });
  return base.filter(function(node){ return expanded.has(node.id); });
}

function visibleEdges(nodeIds){
  if(!graphData) return [];
  return graphData.edges.filter(function(edge){
    if(!allowed(edge.visibility)) return false;
    if(graphRelationFilter!=="all" && edge.type!==graphRelationFilter) return false;
    if(!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) return false;
    var from=nodeById(edge.from),to=nodeById(edge.to);
    return from && to && allowed(from.visibility) && allowed(to.visibility);
  });
}

function nodeShape(node){
  var x=node.x,y=node.y,r=node.r,color=node.color;
  var common=' fill="'+escapeAttr(color)+'" stroke="var(--graph-node-stroke,#fff)" stroke-width="2.5"';
  if(node.kind==="team"){
    return '<rect x="'+(x-r*1.35)+'" y="'+(y-r*.72)+'" width="'+(r*2.7)+'" height="'+(r*1.44)+'" rx="'+(r*.35)+'"'+common+'/>';
  }
  if(node.kind==="location"){
    var d=r*1.02;
    return '<polygon points="'+x+','+(y-d)+' '+(x+d)+','+y+' '+x+','+(y+d)+' '+(x-d)+','+y+'"'+common+'/>';
  }
  if(node.kind==="event"){
    return '<rect x="'+(x-r*1.25)+'" y="'+(y-r*.68)+'" width="'+(r*2.5)+'" height="'+(r*1.36)+'" rx="6"'+common+'/>';
  }
  if(node.kind==="faction" || node.kind==="organization"){
    var dx=r*.92,dy=r*.78;
    return '<polygon points="'+(x-dx)+','+y+' '+(x-dx*.45)+','+(y-dy)+' '+(x+dx*.45)+','+(y-dy)+' '+(x+dx)+','+y+' '+(x+dx*.45)+','+(y+dy)+' '+(x-dx*.45)+','+(y+dy)+'"'+common+'/>';
  }
  if(node.kind==="custom"){
    return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'"'+common+' stroke-dasharray="5 3"/>';
  }
  return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'"'+common+'/>';
}

function curveForEdge(a,b,index){
  var dx=b.x-a.x,dy=b.y-a.y;
  var length=Math.sqrt(dx*dx+dy*dy) || 1;
  var sign=index%2===0 ? 1 : -1;
  var amount=Math.min(42,Math.max(12,length*.08))*sign;
  var mx=(a.x+b.x)/2 + (-dy/length)*amount;
  var my=(a.y+b.y)/2 + (dx/length)*amount;
  return {
    d:"M "+a.x+" "+a.y+" Q "+mx+" "+my+" "+b.x+" "+b.y,
    mx:mx,my:my
  };
}

function renderDefs(nodes){
  var markers=Object.keys(RELATION).map(function(type){
    var color=RELATION[type].color;
    return '<marker id="graph-arrow-'+type+'" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">'+
      '<path d="M0,0 L7,3.5 L0,7 z" fill="'+color+'"/></marker>';
  }).join("");

  var clips=(nodes || []).filter(function(node){
    return !!nodeMedia(node).src;
  }).map(function(node){
    return '<clipPath id="graph-portrait-clip-'+svgId(node.id)+'">'+
      '<circle cx="'+node.x+'" cy="'+node.y+'" r="'+Math.max(10,node.r-3)+'"/>'+
    '</clipPath>';
  }).join("");

  return '<defs>'+
    '<filter id="graph-shadow" x="-40%" y="-40%" width="180%" height="180%">'+
      '<feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".18"/>'+
    '</filter>'+
    '<filter id="graph-selected" x="-50%" y="-50%" width="200%" height="200%">'+
      '<feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#b58a50" flood-opacity=".7"/>'+
    '</filter>'+
    '<pattern id="graph-grid" width="32" height="32" patternUnits="userSpaceOnUse">'+
      '<path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" stroke-opacity=".07" stroke-width="1"/>'+
    '</pattern>'+
    markers+
    clips+
  '</defs>';
}

function renderGraph(){
  var svg=document.getElementById("graphSvg");
  if(!svg || !graphData) return;

  var nodes=visibleNodes().map(graphDisplayNode);
  var nodeIds=new Set(nodes.map(function(n){ return n.id; }));
  var edges=visibleEdges(nodeIds);
  var html=renderDefs(nodes);

  html+='<rect x="0" y="0" width="1000" height="720" class="graph-grid-bg" fill="url(#graph-grid)"/>';

  (graphData.quadrants || []).forEach(function(q){
    html+='<g class="graph-zone">'+
      '<rect x="'+q.x+'" y="'+q.y+'" width="'+q.w+'" height="'+q.h+'" rx="18" fill="'+escapeAttr(q.bg)+'" stroke="'+escapeAttr(q.color)+'" stroke-opacity=".36" stroke-dasharray="4 5"/>'+
      '<text x="'+(q.x+18)+'" y="'+(q.y+26)+'" fill="'+escapeAttr(q.color)+'" class="graph-zone-title">'+escapeHtml(q.title)+'</text>'+
    '</g>';
  });

  edges.forEach(function(edge,index){
    var a=graphDisplayNodeById(edge.from),b=graphDisplayNodeById(edge.to);
    if(!a || !b) return;
    var geometry=curveForEdge(a,b,index);
    var color=relationColor(edge.type);
    var selected=edge.id===selectedEdgeId;
    var width=1.2+Number(edge.strength || 3)*.45;
    var dash=(edge.type==="tension" || edge.type==="enemy" || edge.type==="rivalry" || edge.type==="clone") ? ' stroke-dasharray="7 5"' : "";
    var marker=edge.directed ? ' marker-end="url(#graph-arrow-'+escapeAttr(edge.type)+')"' : "";

    html+='<g class="graph-edge-group'+(selected?' selected':'')+'" data-edge-id="'+escapeAttr(edge.id)+'" data-edge-index="'+index+'">'+
      '<path class="graph-edge-hit" d="'+geometry.d+'" stroke="transparent" stroke-width="16" fill="none"/>'+
      '<path class="graph-edge-line" d="'+geometry.d+'" stroke="'+color+'" stroke-width="'+width+'" fill="none"'+dash+marker+' opacity="'+(selected?'1':'.75')+'"/>'+
      (edge.label
        ? '<g class="graph-edge-label" transform="translate('+geometry.mx+' '+geometry.my+')">'+
            '<rect x="'+(-Math.max(28,edge.label.length*4.4))+'" y="-11" width="'+(Math.max(56,edge.label.length*8.8))+'" height="22" rx="11"/>'+
            '<text x="0" y="3" text-anchor="middle" fill="'+color+'">'+escapeHtml(edge.label)+'</text>'+
          '</g>'
        : '')+
    '</g>';
  });

  if(!quickRelationState.draft && quickRelationState.picking && quickRelationState.sourceId){
    var quickSource=graphDisplayNodeById(quickRelationState.sourceId);
    if(quickSource){
      html+='<line id="graphConnectPreview" class="graph-connect-preview" x1="'+quickSource.x+'" y1="'+quickSource.y+'" x2="'+quickSource.x+'" y2="'+quickSource.y+'"/>';
    }
  }

  nodes.forEach(function(node){
    var selected=node.id===selectedNodeId;
    var kind=KIND[node.kind] || KIND.custom;
    var route=routeForNode(node);
    var matched=true;
    if(graphSearch){
      var needle=graphSearch.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
      var hay=[node.label,node.subtitle,node.ref].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
      matched=hay.indexOf(needle)!==-1;
    }

    var media=nodeMedia(node);
    if(node.mediaMode==="character" && !media.src) queueGraphPortrait(node);

    var nodeVisual='';
    if(media.src){
      nodeVisual=
        '<g filter="'+(selected?'url(#graph-selected)':'url(#graph-shadow)')+'">'+
          '<circle cx="'+node.x+'" cy="'+node.y+'" r="'+node.r+'" fill="'+escapeAttr(node.color)+'" stroke="var(--graph-node-stroke,#fff)" stroke-width="2.5"/>'+
        '</g>'+
        '<foreignObject class="graph-node-portrait-fo" x="'+(node.x-node.r+3)+'" y="'+(node.y-node.r+3)+'" width="'+((node.r-3)*2)+'" height="'+((node.r-3)*2)+'" clip-path="url(#graph-portrait-clip-'+svgId(node.id)+')">'+
          '<div xmlns="http://www.w3.org/1999/xhtml" class="graph-node-portrait-frame" style="'+escapeAttr(media.style)+'">'+
            '<img src="'+escapeAttr(media.src)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">'+
          '</div>'+
        '</foreignObject>'+
        '<circle cx="'+node.x+'" cy="'+node.y+'" r="'+(node.r-1.5)+'" fill="none" stroke="var(--graph-node-stroke,#fff)" stroke-width="2.5"/>';
    }else{
      nodeVisual=
        '<g filter="'+(selected?'url(#graph-selected)':'url(#graph-shadow)')+'">'+nodeShape(node)+'</g>'+
        '<text x="'+node.x+'" y="'+(node.y+3)+'" text-anchor="middle" class="graph-node-icon">'+escapeHtml(node.icon || kind.icon)+'</text>';
    }

    html+='<g class="graph-node-v2'+(route?' routable':'')+(selected?' selected':'')+(matched?' search-match':' search-context')+'" data-node-id="'+escapeAttr(node.id)+'" tabindex="0" role="button" aria-label="'+escapeAttr(node.label)+'">'+
      '<circle class="graph-node-drag-hit" cx="'+node.x+'" cy="'+node.y+'" r="'+Math.max(46,node.r+14)+'" fill="transparent" style="touch-action:none"/>'+
      nodeVisual+
      '<text x="'+node.x+'" y="'+(node.y+node.r+17)+'" text-anchor="middle" class="graph-node-label">'+escapeHtml(node.label)+'</text>'+
      '<text x="'+node.x+'" y="'+(node.y+node.r+30)+'" text-anchor="middle" class="graph-node-kind">'+escapeHtml(kind.label)+'</text>'+
      (normalizeVisibility(node.visibility)!=="public"
        ? '<text x="'+(node.x+node.r*.76)+'" y="'+(node.y-node.r*.7)+'" text-anchor="middle" class="graph-node-visibility">'+(node.visibility==="master"?"🔒":"⚠")+'</text>'
        : '')+
    '</g>';
  });

  svg.innerHTML=html;

  svg.querySelectorAll("[data-node-id]").forEach(function(group){
    bindGraphViewDrag(svg,group);
    var choose=function(){
      var id=group.getAttribute("data-node-id") || "";
      if(selectQuickTarget(id)) return;
      selectedNodeId=id;
      selectedEdgeId="";
      renderGraph();
      renderInspector();
    };
    group.addEventListener("click",function(event){
      event.stopPropagation();
      if(Date.now()<graphSuppressClickUntil) return;
      choose();
    });
    group.addEventListener("keydown",function(event){
      if(event.key==="Enter" || event.key===" "){ event.preventDefault(); choose(); }
    });
    group.addEventListener("dblclick",function(event){
      event.stopPropagation();
      if(Date.now()<graphSuppressClickUntil) return;
      var node=nodeById(group.getAttribute("data-node-id"));
      openNodeRoute(node);
    });
  });

  if(!quickRelationState.draft && quickRelationState.picking){
    svg.addEventListener("pointermove",function(event){
      var line=svg.querySelector("#graphConnectPreview");
      if(!line) return;
      var point=svgPointFromEvent(svg,event);
      line.setAttribute("x2",Math.max(0,Math.min(1000,point.x)));
      line.setAttribute("y2",Math.max(0,Math.min(720,point.y)));
    },{passive:true});
  }

  svg.querySelectorAll("[data-edge-id]").forEach(function(group){
    group.addEventListener("click",function(event){
      event.stopPropagation();
      selectedEdgeId=group.getAttribute("data-edge-id") || "";
      selectedNodeId="";
      renderGraph();
      renderInspector();
    });
  });

  applyGraphScale();
  updateGraphViewResetButton();
  updateGraphStats(nodes,edges);
  renderLegend();
  document.dispatchEvent(new CustomEvent("terra-z:graph-rendered",{detail:{nodes:nodes.length,edges:edges.length}}));
}

function updateGraphStats(nodes,edges){
  var entity=document.getElementById("graphEntityCount");
  var relation=document.getElementById("graphRelationCount");
  var visible=document.getElementById("graphVisibleCount");
  if(entity) entity.textContent=String(graphData ? graphData.nodes.length : 0);
  if(relation) relation.textContent=String(graphData ? graphData.edges.length : 0);
  if(visible) visible.textContent=String((nodes || []).length);
}

function renderLegend(){
  var root=document.getElementById("graphLegend");
  if(!root) return;
  var used=new Set((graphData && graphData.edges || []).map(function(edge){ return edge.type; }));
  root.innerHTML=Object.keys(RELATION).filter(function(type){ return used.has(type); }).map(function(type){
    return '<button type="button" data-graph-legend="'+escapeAttr(type)+'" aria-pressed="'+(graphRelationFilter===type?'true':'false')+'">'+
      '<span style="background:'+RELATION[type].color+'"></span>'+escapeHtml(RELATION[type].label)+'</button>';
  }).join("");

  root.querySelectorAll("[data-graph-legend]").forEach(function(button){
    button.addEventListener("click",function(){
      var type=button.getAttribute("data-graph-legend");
      graphRelationFilter=graphRelationFilter===type ? "all" : type;
      var select=document.getElementById("graphRelationFilter");
      if(select) select.value=graphRelationFilter;
      renderGraph();
    });
  });
}

function inspectorEmpty(){
  return '<div class="graph-inspector-empty">'+
    '<div class="graph-inspector-symbol">◎</div>'+
    '<strong>Selecione uma entidade ou relação</strong>'+
    '<p>Clique em um nó ou vínculo para ver detalhes e conexões.'+
      (canEdit() ? ' Para criar um vínculo: selecione uma bolinha e use <strong>Conectar</strong>.' : '')+
    '</p>'+
  '</div>';
}

function renderInspector(){
  var root=document.getElementById("graphInspector");
  if(!root) return;

  if(selectedNodeId){
    var node=nodeById(selectedNodeId);
    if(!node){ selectedNodeId=""; root.innerHTML=inspectorEmpty(); return; }
    var kind=KIND[node.kind] || KIND.custom;
    var route=routeForNode(node);
    var relations=(graphData.edges || []).filter(function(edge){
      return (edge.from===node.id || edge.to===node.id) && allowed(edge.visibility);
    });

    root.innerHTML='<div class="graph-inspector-card">'+
      inspectorPortrait(node,"large")+
      '<div class="graph-inspector-kicker">'+escapeHtml(kind.icon+" "+kind.label)+'</div>'+
      '<h3>'+escapeHtml(node.label)+'</h3>'+
      (node.subtitle ? '<p class="graph-inspector-subtitle">'+escapeHtml(node.subtitle)+'</p>' : '')+
      '<div class="graph-inspector-meta">'+
        '<span>'+escapeHtml(node.visibility==="master"?"🔒 Mestre":(node.visibility==="spoiler"?"⚠️ Spoiler":"🌐 Público"))+'</span>'+
        '<span>'+relations.length+(relations.length===1?" relação":" relações")+'</span>'+
      '</div>'+
      '<div class="graph-inspector-actions">'+
        (route ? '<button type="button" id="graphInspectorOpen">Abrir entidade →</button>' : '')+
        (canEdit() ? '<button type="button" id="graphInspectorConnect" class="primary">🔗 Conectar</button><button type="button" id="graphInspectorEdit">⚙️ Editar</button>' : '')+
      '</div>'+
      '<div class="graph-inspector-relations">'+
        '<div class="graph-inspector-heading">Conexões diretas</div>'+
        (relations.length ? relations.map(function(edge){
          var other=nodeById(edge.from===node.id ? edge.to : edge.from);
          var info=RELATION[edge.type] || RELATION.other;
          return '<button type="button" data-inspector-edge="'+escapeAttr(edge.id)+'">'+
            '<span class="graph-inspector-relation-dot" style="background:'+info.color+'"></span>'+
            '<span><strong>'+escapeHtml(other ? other.label : "Entidade")+'</strong><small>'+escapeHtml(edge.label || info.label)+'</small></span>'+
          '</button>';
        }).join("") : '<p class="graph-inspector-none">Nenhuma conexão registrada.</p>')+
      '</div>'+
    '</div>';

    hydrateInspectorPortraits(root);
    var open=document.getElementById("graphInspectorOpen");
    if(open) open.addEventListener("click",function(){ openNodeRoute(node); });
    var connect=document.getElementById("graphInspectorConnect");
    if(connect) connect.addEventListener("click",function(){ beginQuickPick(node.id,{draft:false}); });
    var edit=document.getElementById("graphInspectorEdit");
    if(edit) edit.addEventListener("click",function(){ openGraphEditor("nodes",node.id); });
    root.querySelectorAll("[data-inspector-edge]").forEach(function(button){
      button.addEventListener("click",function(){
        selectedEdgeId=button.getAttribute("data-inspector-edge");
        selectedNodeId="";
        renderGraph();
        renderInspector();
      });
    });
    return;
  }

  if(selectedEdgeId){
    var edge=edgeById(selectedEdgeId);
    if(!edge){ selectedEdgeId=""; root.innerHTML=inspectorEmpty(); return; }
    var from=nodeById(edge.from),to=nodeById(edge.to);
    var relation=RELATION[edge.type] || RELATION.other;

    root.innerHTML='<div class="graph-inspector-card relation">'+
      '<div class="graph-relation-portraits">'+
        '<div>'+inspectorPortrait(from,"small")+'<span>'+escapeHtml(from ? from.label : edge.from)+'</span></div>'+
        '<div class="graph-relation-portrait-arrow">'+(edge.directed?"→":"↔")+'</div>'+
        '<div>'+inspectorPortrait(to,"small")+'<span>'+escapeHtml(to ? to.label : edge.to)+'</span></div>'+
      '</div>'+
      '<div class="graph-inspector-kicker" style="color:'+relation.color+'">'+escapeHtml(relation.label)+'</div>'+
      '<h3>'+escapeHtml(edge.label || relation.label)+'</h3>'+
      '<div class="graph-inspector-route">'+
        '<button type="button" data-inspector-node="'+escapeAttr(edge.from)+'">'+escapeHtml(from ? from.label : edge.from)+'</button>'+
        '<span>'+(edge.directed?"→":"↔")+'</span>'+
        '<button type="button" data-inspector-node="'+escapeAttr(edge.to)+'">'+escapeHtml(to ? to.label : edge.to)+'</button>'+
      '</div>'+
      '<div class="graph-strength"><span>Intensidade</span><strong>'+("●".repeat(edge.strength))+'<i>'+("○".repeat(5-edge.strength))+'</i></strong></div>'+
      (edge.note ? '<p class="graph-inspector-note">'+escapeHtml(edge.note)+'</p>' : '')+
      '<div class="graph-inspector-meta"><span>'+escapeHtml(edge.visibility==="master"?"🔒 Mestre":(edge.visibility==="spoiler"?"⚠️ Spoiler":"🌐 Público"))+'</span></div>'+
      (canEdit() ? '<div class="graph-inspector-actions"><button type="button" id="graphInspectorEditEdge">✏️ Editar relação</button></div>' : '')+
    '</div>';

    hydrateInspectorPortraits(root);
    root.querySelectorAll("[data-inspector-node]").forEach(function(button){
      button.addEventListener("click",function(){
        selectedNodeId=button.getAttribute("data-inspector-node");
        selectedEdgeId="";
        renderGraph();renderInspector();
      });
    });
    var editEdge=document.getElementById("graphInspectorEditEdge");
    if(editEdge) editEdge.addEventListener("click",function(){ openGraphEditor("edges",edge.id); });
    return;
  }

  root.innerHTML=inspectorEmpty();
}

function openNodeRoute(node){
  var route=routeForNode(node);
  var r=router();
  if(route && r && r.go) r.go(route);
  else showToast("Esta entidade ainda não possui um destino navegável.","info",3500);
}

function updateFilterOptions(){
  var relation=document.getElementById("graphRelationFilter");
  if(relation){
    relation.innerHTML='<option value="all">Todos os vínculos</option>'+
      Object.keys(RELATION).map(function(type){
        return '<option value="'+type+'">'+escapeHtml(RELATION[type].label)+'</option>';
      }).join("");
    relation.value=graphRelationFilter;
  }

  var entity=document.getElementById("graphEntityFilter");
  if(entity){
    entity.innerHTML='<option value="all">Todas as entidades</option>'+
      Object.keys(KIND).map(function(kind){
        return '<option value="'+kind+'">'+escapeHtml(KIND[kind].icon+" "+KIND[kind].label)+'</option>';
      }).join("");
    entity.value=graphEntityFilter;
  }
}

function setupQuickRelation(){
  var connectCancel=document.getElementById("graphConnectCancelBtn");
  if(connectCancel) connectCancel.addEventListener("click",cancelQuickRelation);

  var connectChoose=document.getElementById("graphConnectChooseBtn");
  if(connectChoose) connectChoose.addEventListener("click",function(){
    if(quickRelationState.sourceId) openQuickRelation(quickRelationState.sourceId,"",{draft:false});
  });

  var modal=document.getElementById("graphQuickRelationModal");
  if(modal) modal.addEventListener("click",function(event){
    if(event.target===modal) cancelQuickRelation();
  });

  var close=document.getElementById("graphQuickRelationClose");
  var cancel=document.getElementById("graphQuickCancel");
  var save=document.getElementById("graphQuickSave");
  var pick=document.getElementById("graphQuickPickBtn");
  var target=document.getElementById("graphQuickTarget");

  if(close) close.addEventListener("click",cancelQuickRelation);
  if(cancel) cancel.addEventListener("click",cancelQuickRelation);
  if(save) save.addEventListener("click",saveQuickRelation);
  if(pick) pick.addEventListener("click",function(){
    beginQuickPick(quickRelationState.sourceId,{draft:quickRelationState.draft});
  });
  if(target) target.addEventListener("change",function(){
    quickRelationState.targetId=target.value || "";
    updateQuickPair();
  });

  document.addEventListener("keydown",function(event){
    if(event.key!=="Escape") return;
    var quickModal=document.getElementById("graphQuickRelationModal");
    if((quickModal && quickModal.classList.contains("show")) || quickRelationState.picking){
      event.preventDefault();
      cancelQuickRelation();
    }
  });
}

function setupGraphView(){
  graphScale=readGraphScale();
  updateFilterOptions();

  var search=document.getElementById("graphSearch");
  if(search) search.addEventListener("input",function(){
    graphSearch=search.value || "";
    selectedNodeId="";
    selectedEdgeId="";
    renderGraph();renderInspector();
  });

  var entity=document.getElementById("graphEntityFilter");
  if(entity) entity.addEventListener("change",function(){
    graphEntityFilter=entity.value || "all";
    renderGraph();renderInspector();
  });

  var relation=document.getElementById("graphRelationFilter");
  if(relation) relation.addEventListener("change",function(){
    graphRelationFilter=relation.value || "all";
    renderGraph();renderInspector();
  });

  var clear=document.getElementById("graphClearFilters");
  if(clear) clear.addEventListener("click",function(){
    graphSearch="";graphEntityFilter="all";graphRelationFilter="all";
    if(search) search.value="";
    if(entity) entity.value="all";
    if(relation) relation.value="all";
    selectedNodeId="";selectedEdgeId="";
    renderGraph();renderInspector();
  });

  var edit=document.getElementById("graphOpenBtn");
  if(edit) edit.addEventListener("click",function(){ openGraphEditor("layout",""); });

  var resetView=document.getElementById("graphViewResetBtn");
  if(resetView) resetView.addEventListener("click",function(){ resetGraphViewPositions(true); });

  var zoomOut=document.getElementById("graphZoomOut");
  var zoomIn=document.getElementById("graphZoomIn");
  var zoomReset=document.getElementById("graphZoomReset");
  var zoomRange=document.getElementById("graphZoomRange");

  if(zoomOut) zoomOut.addEventListener("click",function(){ setGraphScale(graphScale-.1,true); });
  if(zoomIn) zoomIn.addEventListener("click",function(){ setGraphScale(graphScale+.1,true); });
  if(zoomReset) zoomReset.addEventListener("click",function(){ setGraphScale(1,true); });
  if(zoomRange) zoomRange.addEventListener("input",function(){ setGraphScale(Number(zoomRange.value)/100,true); });
  applyGraphScale();
  updateConnectBar();

  var svg=document.getElementById("graphSvg");
  if(svg) svg.addEventListener("click",function(event){
    if(event.target===svg || event.target.classList.contains("graph-grid-bg")){
      if(quickRelationState.picking){
        showToast("Escolha uma bolinha de destino ou cancele a conexão.","info",2800);
        return;
      }
      selectedNodeId="";
      selectedEdgeId="";
      renderGraph();
      renderInspector();
    }
  });

  refreshGraphAccess();
  setupQuickRelation();
}

async function refreshGraphAccess(){
  var edit=document.getElementById("graphOpenBtn");
  if(!edit) return;

  if(!canEdit()){
    edit.disabled=true;
    edit.title="Entre como editor para administrar o grafo";
    return;
  }

  var ready=await supportsGraphV3();
  edit.disabled=!ready;
  edit.title=ready
    ? "Criar, editar ou excluir entidades e relações"
    : "Publique o checkpoint desta etapa para ativar Relações 2.0 + Biblioteca de Mídia no backend";
}

function editorGraph(){ return editorDraft || graphData; }

function makeId(prefix,label){
  var base=slugify(label || prefix) || prefix;
  var used=new Set((editorGraph().nodes || []).map(function(n){ return n.id; })
    .concat((editorGraph().edges || []).map(function(e){ return e.id; })));
  var candidate=base;
  var i=2;
  while(used.has(candidate)){ candidate=base+"-"+i; i++; }
  return candidate;
}

function renderEditorTabs(){
  document.querySelectorAll("[data-ge-tab]").forEach(function(button){
    var active=button.getAttribute("data-ge-tab")===editorMode;
    button.classList.toggle("active",active);
    button.setAttribute("aria-pressed",active?"true":"false");
  });
  var modal=document.getElementById("graphEditorModal");
  if(modal) modal.classList.toggle("graph-editor-layout-mode",editorMode==="layout");
  var add=document.getElementById("graphEditorAdd");
  if(add) add.textContent=editorMode==="edges" ? "＋ Nova relação" : "＋ Nova entidade";
}

function editorItemTitle(item){
  if(editorMode==="nodes") return item.label || item.id;
  var from=nodeById(item.from,editorDraft),to=nodeById(item.to,editorDraft);
  return (from ? from.label : item.from)+" "+(item.directed?"→":"↔")+" "+(to ? to.label : item.to);
}

function editorItemSubtitle(item){
  if(editorMode==="nodes"){
    var kind=KIND[item.kind] || KIND.custom;
    return kind.icon+" "+kind.label+(item.subtitle ? " · "+item.subtitle : "");
  }
  var relation=RELATION[item.type] || RELATION.other;
  return relation.label+(item.label ? " · "+item.label : "");
}

function editorItems(){
  var graph=editorGraph();
  var items=editorMode==="edges" ? graph.edges : graph.nodes;
  var needle=editorSearch.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  if(!needle) return items;
  return items.filter(function(item){
    return (editorItemTitle(item)+" "+editorItemSubtitle(item)).normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"").toLowerCase().indexOf(needle)!==-1;
  });
}

function renderEditorList(){
  var root=document.getElementById("graphEditorList");
  if(!root) return;
  if(editorMode==="layout"){ root.innerHTML=""; return; }
  var items=editorItems();
  root.innerHTML=items.length ? items.map(function(item){
    var id=item.id;
    return '<button type="button" class="ge-list-item'+(id===editorSelectedId?' active':'')+'" data-ge-select="'+escapeAttr(id)+'">'+
      '<strong>'+escapeHtml(editorItemTitle(item))+'</strong>'+
      '<span>'+escapeHtml(editorItemSubtitle(item))+'</span>'+
    '</button>';
  }).join("") : '<div class="ge-list-empty">Nenhum item encontrado.</div>';

  root.querySelectorAll("[data-ge-select]").forEach(function(button){
    button.addEventListener("click",function(){
      editorSelectedId=button.getAttribute("data-ge-select") || "";
      renderEditorList();
      renderEditorDetail();
    });
  });
}

function visibilityOptions(value){
  return [
    ["public","🌐 Público"],
    ["spoiler","⚠️ Spoiler"],
    ["master","🔒 Mestre"]
  ].map(function(row){
    return '<option value="'+row[0]+'"'+(value===row[0]?' selected':'')+'>'+row[1]+'</option>';
  }).join("");
}

function kindOptions(value){
  return Object.keys(KIND).map(function(kind){
    return '<option value="'+kind+'"'+(value===kind?' selected':'')+'>'+escapeHtml(KIND[kind].icon+" "+KIND[kind].label)+'</option>';
  }).join("");
}

function relationOptions(value){
  return Object.keys(RELATION).map(function(type){
    return '<option value="'+type+'"'+(value===type?' selected':'')+'>'+escapeHtml(RELATION[type].label)+'</option>';
  }).join("");
}

function nodeOptions(value){
  return (editorDraft.nodes || []).map(function(node){
    return '<option value="'+escapeAttr(node.id)+'"'+(value===node.id?' selected':'')+'>'+escapeHtml(node.label)+'</option>';
  }).join("");
}

function mediaAssetOptions(value){
  var library=(window.TerraZData && window.TerraZData.mediaLibrary) || {};
  var list=Array.isArray(library.assets) ? library.assets : [];
  return '<option value="">Selecione um ativo…</option>'+list.map(function(asset){
    return '<option value="'+escapeAttr(asset.id)+'"'+(value===asset.id?' selected':'')+'>'+escapeHtml(asset.label || asset.id)+'</option>';
  }).join("");
}

function mediaModeOptions(value){
  return [
    ["none","Sem imagem"],
    ["character","Retrato da referência/personagem"],
    ["library","Biblioteca de Mídia"],
    ["url","URL direta"]
  ].map(function(row){
    return '<option value="'+row[0]+'"'+(value===row[0]?' selected':'')+'>'+row[1]+'</option>';
  }).join("");
}

function graphEditorMediaPreview(item){
  var media=nodeMedia(item);
  var kind=KIND[item.kind] || KIND.custom;
  if(!media.src){
    return '<div class="ge-media-preview empty"><span>'+escapeHtml(item.icon || kind.icon)+'</span><small>Sem imagem</small></div>';
  }
  return '<div class="ge-media-preview">'+
    '<div class="graph-node-portrait-frame" style="'+escapeAttr(media.style)+'">'+
      '<img src="'+escapeAttr(media.src)+'" alt="'+escapeAttr(item.label || "")+'" loading="lazy" decoding="async" referrerpolicy="no-referrer">'+
    '</div>'+
  '</div>';
}


function pushEditorUndoSnapshot(snapshot){
  if(!snapshot) return;
  editorUndoStack.push(clone(snapshot));
  if(editorUndoStack.length>12) editorUndoStack.shift();
}

function pushEditorUndo(){
  if(editorDraft) pushEditorUndoSnapshot(editorDraft);
}

function undoEditorDraft(){
  if(!editorUndoStack.length){
    showToast("Nada para desfazer nesta edição.","info",3000);
    return;
  }
  editorDraft=normalizeGraph(editorUndoStack.pop());
  if(editorSelectedId && !nodeById(editorSelectedId,editorDraft) && !edgeById(editorSelectedId,editorDraft)) editorSelectedId="";
  renderEditorTabs();renderEditorList();renderEditorDetail();
  showToast("Última alteração de layout desfeita.","info",3000);
}

function pointQuadrant(node,quadrants){
  return (quadrants || []).find(function(q){
    return node.x>=q.x && node.x<=q.x+q.w && node.y>=q.y && node.y<=q.y+q.h;
  }) || null;
}

function defaultQuadrantId(nodeId,quadrants){
  var base=(defaultGraph.nodes || []).find(function(node){ return node.id===nodeId; });
  if(!base) return "";
  var q=pointQuadrant(base,quadrants);
  return q ? q.id : "";
}

function smartLayoutAssignments(graph){
  var quadrants=(graph.quadrants || []).filter(function(q){
    return Number.isFinite(Number(q.x))&&Number.isFinite(Number(q.y))&&Number(q.w)>0&&Number(q.h)>0;
  });
  if(!quadrants.length){
    quadrants=[{id:"__all",title:"REDE",x:20,y:20,w:960,h:680,color:"#777",bg:"transparent"}];
  }

  var valid=new Set(quadrants.map(function(q){return q.id;}));
  var assignment={};
  var buckets={};
  quadrants.forEach(function(q){buckets[q.id]=[];});

  // Entidades canônicas mantêm seu núcleo conhecido.
  // Entidades novas são classificadas primeiro pelas relações; a posição atual
  // só vira fallback para não transformar um layout já bagunçado em regra.
  graph.nodes.forEach(function(node){
    var qid=defaultQuadrantId(node.id,quadrants);
    if(qid && valid.has(qid)) assignment[node.id]=qid;
  });

  for(var pass=0;pass<6;pass++){
    var changed=false;
    graph.nodes.forEach(function(node){
      if(assignment[node.id]) return;
      var score={};
      graph.edges.forEach(function(edge){
        var other="";
        if(edge.from===node.id) other=edge.to;
        else if(edge.to===node.id) other=edge.from;
        if(!other || !assignment[other]) return;
        score[assignment[other]]=(score[assignment[other]]||0)+Math.max(1,Number(edge.strength)||1);
      });
      var best=Object.keys(score).sort(function(a,b){return score[b]-score[a];})[0];
      if(best){assignment[node.id]=best;changed=true;}
    });
    if(!changed) break;
  }

  graph.nodes.forEach(function(node){
    var qid=assignment[node.id];
    if(!qid){
      var current=pointQuadrant(node,quadrants);
      if(current) qid=current.id;
    }
    if(!qid){
      qid=quadrants.slice().sort(function(a,b){
        var ac=Object.values(assignment).filter(function(x){return x===a.id;}).length;
        var bc=Object.values(assignment).filter(function(x){return x===b.id;}).length;
        return ac-bc;
      })[0].id;
    }
    assignment[node.id]=qid;
    buckets[qid].push(node);
  });

  return {quadrants:quadrants,buckets:buckets,assignment:assignment};
}

function layoutRowsForNodes(nodes,edges){
  if(!nodes.length) return [];
  var ids=new Set(nodes.map(function(node){return node.id;}));
  var adjacency={};
  nodes.forEach(function(node){adjacency[node.id]=[];});
  edges.forEach(function(edge){
    if(!ids.has(edge.from)||!ids.has(edge.to)) return;
    adjacency[edge.from].push(edge.to);
    adjacency[edge.to].push(edge.from);
  });

  var unvisited=new Set(nodes.map(function(node){return node.id;}));
  var levels=[];
  while(unvisited.size){
    var candidates=nodes.filter(function(node){return unvisited.has(node.id);});
    candidates.sort(function(a,b){
      var degreeDiff=(adjacency[b.id]||[]).length-(adjacency[a.id]||[]).length;
      if(degreeDiff) return degreeDiff;
      var da=(defaultGraph.nodes||[]).find(function(n){return n.id===a.id;});
      var db=(defaultGraph.nodes||[]).find(function(n){return n.id===b.id;});
      var ax=da?da.x:a.x,bx=db?db.x:b.x;
      return ax-bx || String(a.label).localeCompare(String(b.label),"pt-BR");
    });
    var root=candidates[0];
    var queue=[{id:root.id,depth:0}];
    unvisited.delete(root.id);
    var seen=new Set([root.id]);
    while(queue.length){
      var current=queue.shift();
      (levels[current.depth]=levels[current.depth]||[]).push(nodeById(current.id,{nodes:nodes}));
      (adjacency[current.id]||[]).forEach(function(next){
        if(seen.has(next)||!unvisited.has(next)) return;
        seen.add(next);unvisited.delete(next);
        queue.push({id:next,depth:current.depth+1});
      });
    }
  }

  levels.forEach(function(row){
    row.sort(function(a,b){
      var da=(defaultGraph.nodes||[]).find(function(n){return n.id===a.id;});
      var db=(defaultGraph.nodes||[]).find(function(n){return n.id===b.id;});
      var ax=da?da.x:a.x,bx=db?db.x:b.x;
      return ax-bx || String(a.label).localeCompare(String(b.label),"pt-BR");
    });
  });
  return levels.filter(Boolean);
}

function layoutNodesInRegion(nodes,edges,region){
  if(!nodes.length) return;
  var maxRadius=nodes.reduce(function(max,node){return Math.max(max,Number(node.r)||38);},38);
  var side=Math.max(54,maxRadius+18);
  var top=region.y+Math.max(72,maxRadius+38);
  var bottom=region.y+region.h-Math.max(66,maxRadius+28);
  var left=region.x+side;
  var right=region.x+region.w-side;
  var maxPerRow=Math.max(2,Math.floor(Math.max(120,right-left)/Math.max(86,maxRadius*2+16)));
  var levels=layoutRowsForNodes(nodes,edges);
  var rows=[];
  levels.forEach(function(level){
    for(var i=0;i<level.length;i+=maxPerRow) rows.push(level.slice(i,i+maxPerRow));
  });
  if(!rows.length) rows=[nodes.slice()];

  rows.forEach(function(row,rowIndex){
    var y=rows.length===1 ? (top+bottom)/2 : top+(bottom-top)*(rowIndex/(rows.length-1));
    row.forEach(function(node,index){
      var x=row.length===1 ? (left+right)/2 : left+(right-left)*(index/(row.length-1));
      node.x=Math.round(Math.max(node.r+8,Math.min(1000-node.r-8,x)));
      node.y=Math.round(Math.max(node.r+8,Math.min(720-node.r-34,y)));
    });
  });
}

function smartArrangeGraph(graph){
  var setup=smartLayoutAssignments(graph);
  setup.quadrants.forEach(function(q){
    layoutNodesInRegion(setup.buckets[q.id]||[],graph.edges||[],q);
  });
  return graph;
}

function layoutEditorNodeVisual(node){
  var kind=KIND[node.kind]||KIND.custom;
  var media=nodeMedia(node);
  var r=Math.max(22,Math.min(52,Number(node.r)||38));
  var visual="";
  if(media.src){
    visual='<circle cx="0" cy="0" r="'+r+'" fill="'+escapeAttr(node.color)+'" class="ge-layout-node-bg"/>'+
      '<image href="'+escapeAttr(media.src)+'" x="'+(-r+3)+'" y="'+(-r+3)+'" width="'+((r-3)*2)+'" height="'+((r-3)*2)+'" preserveAspectRatio="xMidYMid slice" clip-path="url(#ge-layout-clip-'+svgId(node.id)+')"/>'+
      '<circle cx="0" cy="0" r="'+(r-1.5)+'" fill="none" class="ge-layout-node-ring"/>';
  }else{
    visual='<circle cx="0" cy="0" r="'+r+'" fill="'+escapeAttr(node.color)+'" class="ge-layout-node-bg"/>'+
      '<text x="0" y="4" text-anchor="middle" class="ge-layout-node-icon">'+escapeHtml(node.icon||kind.icon)+'</text>';
  }
  return '<g class="ge-layout-node'+(node.id===editorSelectedId?" selected":"")+(quickRelationState.draft&&quickRelationState.picking&&node.id===quickRelationState.sourceId?" connecting-source":"")+'" data-layout-node-id="'+escapeAttr(node.id)+'" transform="translate('+node.x+' '+node.y+')" tabindex="0" role="button">'+
    '<circle class="ge-layout-hit" cx="0" cy="0" r="'+Math.max(48,r+18)+'" fill="transparent" style="touch-action:none"/>'+
    visual+
    '<text x="0" y="'+(r+17)+'" text-anchor="middle" class="ge-layout-node-label">'+escapeHtml(node.label)+'</text>'+
  '</g>';
}

function layoutPoint(svg,event){
  var ctm=svg.getScreenCTM();
  if(!ctm) return {x:0,y:0};
  var point=svg.createSVGPoint();
  point.x=event.clientX;point.y=event.clientY;
  return point.matrixTransform(ctm.inverse());
}

function refreshLayoutSelection(root){
  if(!root) return;
  root.querySelectorAll("[data-layout-node-id]").forEach(function(group){
    group.classList.toggle("selected",group.getAttribute("data-layout-node-id")===editorSelectedId);
  });
  var selected=nodeById(editorSelectedId,editorDraft);
  var status=root.querySelector("#geLayoutSelection");
  if(status) status.textContent=selected ? selected.label+" · X "+Math.round(selected.x)+" · Y "+Math.round(selected.y) : "Toque em uma bolinha para selecionar.";
  var connect=root.querySelector("#geLayoutConnectSelected");
  var edit=root.querySelector("#geLayoutEditSelected");
  var del=root.querySelector("#geLayoutDeleteSelected");
  if(connect) connect.disabled=!selected;
  if(edit) edit.disabled=!selected;
  if(del) del.disabled=!selected;
}

function updateLayoutPositionStatus(root,node){
  var status=root && root.querySelector("#geLayoutSelection");
  if(status && node) status.textContent=node.label+" · X "+Math.round(node.x)+" · Y "+Math.round(node.y);
}

function updateLayoutNodeDom(svg,node){
  var group=svg.querySelector('[data-layout-node-id="'+CSS.escape(node.id)+'"]');
  if(group) group.setAttribute("transform","translate("+node.x+" "+node.y+")");
  svg.querySelectorAll('.ge-layout-edge[data-from="'+CSS.escape(node.id)+'"]').forEach(function(line){
    line.setAttribute("x1",node.x);line.setAttribute("y1",node.y);
  });
  svg.querySelectorAll('.ge-layout-edge[data-to="'+CSS.escape(node.id)+'"]').forEach(function(line){
    line.setAttribute("x2",node.x);line.setAttribute("y2",node.y);
  });
}

function renderLayoutEditor(root){
  if(!editorDraft){root.innerHTML="";return;}
  var clips=editorDraft.nodes.map(function(node){
    var r=Math.max(22,Math.min(52,Number(node.r)||38));
    return '<clipPath id="ge-layout-clip-'+svgId(node.id)+'"><circle cx="0" cy="0" r="'+Math.max(10,r-4)+'"/></clipPath>';
  }).join("");
  var zones=(editorDraft.quadrants||[]).map(function(q){
    return '<g class="ge-layout-zone"><rect x="'+q.x+'" y="'+q.y+'" width="'+q.w+'" height="'+q.h+'" rx="18" fill="'+escapeAttr(q.bg)+'" stroke="'+escapeAttr(q.color)+'"/>'+
      '<text x="'+(q.x+18)+'" y="'+(q.y+27)+'" fill="'+escapeAttr(q.color)+'">'+escapeHtml(q.title)+'</text></g>';
  }).join("");
  var edges=(editorDraft.edges||[]).map(function(edge){
    var a=nodeById(edge.from,editorDraft),b=nodeById(edge.to,editorDraft);
    if(!a||!b) return "";
    var dash=(edge.type==="tension"||edge.type==="enemy"||edge.type==="rivalry"||edge.type==="clone")?' stroke-dasharray="8 6"':"";
    return '<line class="ge-layout-edge" data-from="'+escapeAttr(edge.from)+'" data-to="'+escapeAttr(edge.to)+'" x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="'+relationColor(edge.type)+'" stroke-width="'+(1.5+Number(edge.strength||3)*.4)+'"'+dash+'/>';
  }).join("");
  var nodes=editorDraft.nodes.map(layoutEditorNodeVisual).join("");

  root.innerHTML='<div class="ge-layout-editor">'+
    '<div class="ge-layout-toolbar">'+
      '<div><strong>✥ Layout visual</strong><span id="geLayoutSelection">Arraste uma bolinha com o mouse ou dedo.</span></div>'+
      '<div class="ge-layout-actions">'+
        '<button id="geLayoutUndo" type="button">↶ Desfazer</button>'+
        '<button id="geLayoutConnectSelected" class="primary" type="button" disabled>🔗 Conectar</button>'+
        '<button id="geLayoutEditSelected" type="button" disabled>✏️ Editar dados</button>'+
        '<button id="geLayoutDeleteSelected" class="danger" type="button" disabled>🗑️ Remover</button>'+
      '</div>'+
    '</div>'+
    '<div class="ge-layout-hint">'+
      (quickRelationState.draft&&quickRelationState.picking
        ? '🔗 Modo conexão: toque na segunda bolinha · a origem está destacada · Esc cancela.'
        : 'Arraste para mover · toque para selecionar · use Conectar para criar vínculos · duplo clique no PC para editar.')+
    '</div>'+
    '<div class="ge-layout-canvas"><svg id="graphLayoutSvg" viewBox="0 0 1000 720" xmlns="http://www.w3.org/2000/svg">'+
      '<defs>'+clips+'<pattern id="ge-layout-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="currentColor" stroke-opacity=".08"/></pattern></defs>'+
      '<rect class="ge-layout-bg" x="0" y="0" width="1000" height="720" fill="url(#ge-layout-grid)"/>'+
      zones+edges+nodes+
    '</svg></div>'+
  '</div>';

  var svg=root.querySelector("#graphLayoutSvg");
  refreshLayoutSelection(root);

  svg.querySelectorAll("[data-layout-node-id]").forEach(function(group){
    var id=group.getAttribute("data-layout-node-id");
    group.addEventListener("pointerdown",function(event){
      if(event.button!==undefined && event.button!==0) return;
      event.preventDefault();
      event.stopPropagation();

      if(quickRelationState.draft && quickRelationState.picking){
        selectQuickTarget(id);
        return;
      }

      var node=nodeById(id,editorDraft);if(!node)return;
      editorSelectedId=id;
      refreshLayoutSelection(root);

      var canvas=svg.closest(".ge-layout-canvas");
      if(canvas) canvas.classList.add("is-node-dragging");

      editorLayoutDrag={
        id:id,
        pointerId:event.pointerId,
        startClientX:event.clientX,
        startClientY:event.clientY,
        snapshot:clone(editorDraft),
        undoPushed:false,
        moved:false
      };
      try{group.setPointerCapture(event.pointerId);}catch(error){}

      var move=function(moveEvent){
        if(!editorLayoutDrag||editorLayoutDrag.id!==id||editorLayoutDrag.pointerId!==moveEvent.pointerId)return;
        moveEvent.preventDefault();
        moveEvent.stopPropagation();

        var distance=Math.hypot(
          moveEvent.clientX-editorLayoutDrag.startClientX,
          moveEvent.clientY-editorLayoutDrag.startClientY
        );
        if(distance<2&&!editorLayoutDrag.moved)return;

        if(!editorLayoutDrag.undoPushed){
          pushEditorUndoSnapshot(editorLayoutDrag.snapshot);
          editorLayoutDrag.undoPushed=true;
        }

        editorLayoutDrag.moved=true;
        var current=nodeById(id,editorDraft);if(!current)return;
        var point=layoutPoint(svg,moveEvent);
        current.x=Math.round(Math.max(current.r+8,Math.min(1000-current.r-8,point.x)));
        current.y=Math.round(Math.max(current.r+8,Math.min(720-current.r-34,point.y)));
        updateLayoutNodeDom(svg,current);
        updateLayoutPositionStatus(root,current);
      };

      var end=function(endEvent){
        if(!editorLayoutDrag||editorLayoutDrag.id!==id||editorLayoutDrag.pointerId!==endEvent.pointerId)return;
        endEvent.preventDefault();
        endEvent.stopPropagation();

        try{group.releasePointerCapture(endEvent.pointerId);}catch(error){}
        if(canvas) canvas.classList.remove("is-node-dragging");

        window.removeEventListener("pointermove",move,true);
        window.removeEventListener("pointerup",end,true);
        window.removeEventListener("pointercancel",end,true);

        editorLayoutDrag=null;
      };

      window.addEventListener("pointermove",move,{capture:true,passive:false});
      window.addEventListener("pointerup",end,{capture:true,passive:false});
      window.addEventListener("pointercancel",end,{capture:true,passive:false});
    });
    group.addEventListener("dblclick",function(event){
      event.preventDefault();event.stopPropagation();
      editorSelectedId=id;editorMode="nodes";
      renderEditorTabs();renderEditorList();renderEditorDetail();
    });
    group.addEventListener("keydown",function(event){
      if(event.key==="Enter"||event.key===" "){
        event.preventDefault();editorSelectedId=id;refreshLayoutSelection(root);
      }
    });
  });

  var bg=root.querySelector(".ge-layout-bg");
  if(bg)bg.addEventListener("pointerdown",function(){editorSelectedId="";refreshLayoutSelection(root);});
  var connect=root.querySelector("#geLayoutConnectSelected");
  if(connect)connect.addEventListener("click",function(){
    if(!nodeById(editorSelectedId,editorDraft))return;
    openQuickRelation(editorSelectedId,"",{draft:true});
  });
  var edit=root.querySelector("#geLayoutEditSelected");
  if(edit)edit.addEventListener("click",function(){
    if(!nodeById(editorSelectedId,editorDraft))return;
    editorMode="nodes";renderEditorTabs();renderEditorList();renderEditorDetail();
  });
  var del=root.querySelector("#geLayoutDeleteSelected");
  if(del)del.addEventListener("click",deleteEditorCurrent);
  var undo=root.querySelector("#geLayoutUndo");
  if(undo)undo.addEventListener("click",undoEditorDraft);
}

function renderEditorDetail(){
  var root=document.getElementById("graphEditorDetail");
  if(!root) return;
  if(editorMode==="layout"){ renderLayoutEditor(root); return; }

  if(!editorSelectedId){
    root.innerHTML='<div class="ge-detail-empty"><strong>Escolha um item</strong><p>Selecione uma entidade ou relação na lista, ou crie uma nova.</p></div>';
    return;
  }

  var item=editorMode==="edges" ? edgeById(editorSelectedId,editorDraft) : nodeById(editorSelectedId,editorDraft);
  if(!item){ editorSelectedId=""; return renderEditorDetail(); }

  if(editorMode==="nodes"){
    root.innerHTML='<div class="ge-detail-head"><div><span>ENTIDADE</span><h3>'+escapeHtml(item.label)+'</h3></div><button type="button" class="danger" id="geDeleteCurrent">🗑️ Excluir</button></div>'+
      '<div class="ge-form-grid">'+
        '<label>Nome / rótulo<input data-ge-field="label" type="text" maxlength="100" value="'+escapeAttr(item.label)+'"></label>'+
        '<label>Tipo<select data-ge-field="kind">'+kindOptions(item.kind)+'</select></label>'+
        '<label class="ge-wide">Subtítulo / identificação<input data-ge-field="subtitle" type="text" maxlength="160" value="'+escapeAttr(item.subtitle)+'" placeholder="Ex.: Oliver Queen, Liga da Justiça, O Dique"></label>'+
        '<label>Referência interna<input data-ge-field="ref" type="text" maxlength="180" value="'+escapeAttr(item.ref)+'" placeholder="Nome canônico ou ID"></label>'+
        '<label>Rota manual<input data-ge-field="route" type="text" maxlength="260" value="'+escapeAttr(item.route)+'" placeholder="/cidade/visao-geral"></label>'+
        '<label>Ícone<input data-ge-field="icon" type="text" maxlength="12" value="'+escapeAttr(item.icon)+'" placeholder="'+escapeAttr((KIND[item.kind]||KIND.custom).icon)+'"></label>'+
        '<div class="ge-wide ge-media-box">'+
          '<div class="ge-media-box-head"><strong>Imagem da entidade</strong><button type="button" id="geOpenMediaLibrary">🖼️ Biblioteca</button></div>'+
          '<div class="ge-media-preview-row">'+graphEditorMediaPreview(item)+'</div>'+
          '<div class="ge-media-grid">'+
            '<label>Fonte visual<select data-ge-field="mediaMode">'+mediaModeOptions(item.mediaMode)+'</select></label>'+
            (item.mediaMode==="library"
              ? '<label>Ativo da biblioteca<select data-ge-field="mediaId">'+mediaAssetOptions(item.mediaId)+'</select></label>'
              : '')+
            (item.mediaMode==="url"
              ? '<label class="ge-wide">URL HTTPS<input data-ge-field="mediaUrl" type="url" maxlength="1600" value="'+escapeAttr(item.mediaUrl)+'" placeholder="https://..."></label>'
              : '')+
            (item.mediaMode==="library" || item.mediaMode==="url"
              ? '<label>Modo<select data-ge-frame="fit"><option value="cover"'+(item.mediaFraming.fit==="cover"?' selected':'')+'>Preencher / recortar</option><option value="contain"'+(item.mediaFraming.fit==="contain"?' selected':'')+'>Imagem inteira</option></select></label>'+
                '<label>Ampliação<input data-ge-frame="zoom" data-ge-frame-scale type="range" min="50" max="250" step="5" value="'+Math.round(item.mediaFraming.zoom*100)+'"></label>'+
                '<label>Horizontal<input data-ge-frame="x" type="range" min="0" max="100" step="1" value="'+item.mediaFraming.x+'"></label>'+
                '<label>Vertical<input data-ge-frame="y" type="range" min="0" max="100" step="1" value="'+item.mediaFraming.y+'"></label>'
              : '')+
          '</div>'+
          '<div class="ge-media-help">'+
            (item.mediaMode==="character"
              ? 'Usa a imagem da ficha quando houver. A entidade pode existir no grafo mesmo sem card.'
              : (item.mediaMode==="library"
                ? 'A imagem vem da Biblioteca de Mídia e não exige ficha de personagem.'
                : (item.mediaMode==="url"
                  ? 'Imagem exclusiva desta entidade. Para reutilizar em vários lugares, prefira a Biblioteca.'
                  : 'A entidade será exibida apenas com cor/ícone.')))+
          '</div>'+
        '</div>'+
        '<label>Visibilidade<select data-ge-field="visibility">'+visibilityOptions(item.visibility)+'</select></label>'+
        '<label>Cor<input data-ge-field="color" type="color" value="'+escapeAttr(item.color)+'"></label>'+
        '<label>Tamanho<input data-ge-field="r" data-ge-number type="number" min="18" max="120" value="'+item.r+'"></label>'+
        '<label>Posição X<input data-ge-field="x" data-ge-number type="number" min="0" max="1000" value="'+item.x+'"></label>'+
        '<label>Posição Y<input data-ge-field="y" data-ge-number type="number" min="0" max="720" value="'+item.y+'"></label>'+
        '<div class="ge-wide ge-help">O ID permanente é <code>'+escapeHtml(item.id)+'</code>. Para personagem/equipe/local/evento, a referência interna permite abrir diretamente a área correspondente do Terra Z.</div>'+
      '</div>';
  }else{
    root.innerHTML='<div class="ge-detail-head"><div><span>RELAÇÃO</span><h3>'+escapeHtml(editorItemTitle(item))+'</h3></div><button type="button" class="danger" id="geDeleteCurrent">🗑️ Excluir</button></div>'+
      '<div class="ge-form-grid">'+
        '<label>De<select data-ge-field="from">'+nodeOptions(item.from)+'</select></label>'+
        '<label>Para<select data-ge-field="to">'+nodeOptions(item.to)+'</select></label>'+
        '<label>Tipo<select data-ge-field="type">'+relationOptions(item.type)+'</select></label>'+
        '<label>Rótulo<input data-ge-field="label" type="text" maxlength="120" value="'+escapeAttr(item.label)+'" placeholder="Ex.: mentor, pai, investiga"></label>'+
        '<label>Intensidade<select data-ge-field="strength">'+[1,2,3,4,5].map(function(n){ return '<option value="'+n+'"'+(item.strength===n?' selected':'')+'>'+n+' / 5</option>'; }).join("")+'</select></label>'+
        '<label>Visibilidade<select data-ge-field="visibility">'+visibilityOptions(item.visibility)+'</select></label>'+
        '<label class="ge-check"><input data-ge-field="directed" type="checkbox"'+(item.directed?' checked':'')+'> Relação possui direção (→)</label>'+
        '<label class="ge-wide">Nota narrativa<textarea data-ge-field="note" rows="5" maxlength="1200" placeholder="Contexto opcional para esta relação...">'+escapeHtml(item.note)+'</textarea></label>'+
        '<div class="ge-wide ge-help">ID permanente: <code>'+escapeHtml(item.id)+'</code></div>'+
      '</div>';
  }

  root.querySelectorAll("[data-ge-field]").forEach(function(input){
    var handler=function(){
      var field=input.getAttribute("data-ge-field");
      var value=input.type==="checkbox" ? input.checked : input.value;
      if(input.hasAttribute("data-ge-number") || field==="strength") value=Number(value);
      item[field]=value;
      if(editorMode==="nodes" && field==="kind" && !item.color) item.color=KIND[value].color;
      if(editorMode==="nodes" && field==="mediaId" && item.mediaMode==="library"){
        var asset=libraryAsset(value);
        if(asset && asset.framing){
          item.mediaFraming={
            fit:asset.framing.fit==="contain" ? "contain" : "cover",
            x:Number(asset.framing.x ?? 50),
            y:Number(asset.framing.y ?? 50),
            zoom:Number(asset.framing.zoom ?? 1)
          };
        }
      }
      renderEditorList();
      if(field==="mediaMode" || field==="mediaId" || field==="mediaUrl") renderEditorDetail();
    };
    input.addEventListener("input",handler);
    input.addEventListener("change",handler);
  });

  root.querySelectorAll("[data-ge-frame]").forEach(function(input){
    var update=function(){
      var field=input.getAttribute("data-ge-frame");
      var value=input.value;
      if(input.hasAttribute("data-ge-frame-scale")) value=Number(value)/100;
      else if(field!=="fit") value=Number(value);
      item.mediaFraming=item.mediaFraming || {fit:"cover",x:50,y:24,zoom:1};
      item.mediaFraming[field]=value;
      var preview=root.querySelector(".ge-media-preview-row");
      if(preview) preview.innerHTML=graphEditorMediaPreview(item);
    };
    input.addEventListener("input",update);
    input.addEventListener("change",update);
  });

  var libraryButton=document.getElementById("geOpenMediaLibrary");
  if(libraryButton) libraryButton.addEventListener("click",function(){
    var library=window.TerraZApp && window.TerraZApp.mediaLibrary;
    if(library && library.open) library.open();
  });

  var del=document.getElementById("geDeleteCurrent");
  if(del) del.addEventListener("click",deleteEditorCurrent);
}

function addEditorItem(){
  pushEditorUndo();
  if(editorMode==="nodes" || editorMode==="layout"){
    var count=editorDraft.nodes.length;
    var id=makeId("entidade","entidade-"+(count+1));
    var angle=(count%12)/12*Math.PI*2;
    var node={
      id:id,label:"NOVA ENTIDADE",subtitle:"",kind:"custom",ref:"",route:"",icon:"",
      mediaMode:"none",mediaId:"",mediaUrl:"",
      mediaFraming:{fit:"cover",x:50,y:24,zoom:1},
      x:Math.round(500+Math.cos(angle)*230),y:Math.round(360+Math.sin(angle)*220),
      color:KIND.custom.color,r:38,visibility:"public"
    };
    editorDraft.nodes.push(node);
    editorSelectedId=id;
  }else{
    if(editorDraft.nodes.length<2){
      showToast("Crie pelo menos duas entidades antes de adicionar uma relação.","warning");
      return;
    }
    var id=makeId("relacao","relacao-"+(editorDraft.edges.length+1));
    var edge={
      id:id,from:editorDraft.nodes[0].id,to:editorDraft.nodes[1].id,
      type:"ally",label:"",note:"",strength:3,directed:false,visibility:"public"
    };
    editorDraft.edges.push(edge);
    editorSelectedId=id;
  }
  renderEditorList();renderEditorDetail();
}

function deleteEditorCurrent(){
  if(!editorSelectedId) return;
  var item=editorMode==="edges" ? edgeById(editorSelectedId,editorDraft) : nodeById(editorSelectedId,editorDraft);
  if(!item) return;

  var isNode=editorMode!=="edges";
  var message=isNode
    ? 'Excluir "'+item.label+'"? Todas as relações ligadas a esta entidade também serão removidas.'
    : 'Excluir esta relação do grafo?';

  showConfirm("Excluir "+(isNode?"entidade":"relação"),message,function(){
    pushEditorUndo();
    if(isNode){
      editorDraft.nodes=editorDraft.nodes.filter(function(node){ return node.id!==item.id; });
      editorDraft.edges=editorDraft.edges.filter(function(edge){ return edge.from!==item.id && edge.to!==item.id; });
    }else{
      editorDraft.edges=editorDraft.edges.filter(function(edge){ return edge.id!==item.id; });
    }
    editorSelectedId="";
    renderEditorList();renderEditorDetail();
  },"Excluir");
}

function autoArrangeDraft(){
  if(!editorDraft || !editorDraft.nodes.length) return;
  pushEditorUndo();
  smartArrangeGraph(editorDraft);
  showToast("Layout reorganizado por núcleos e relações. Revise arrastando os nós antes de salvar.","info",5000);
  renderEditorList();renderEditorDetail();
}

async function openGraphEditor(mode,id){
  if(!canEdit()){
    showToast("Entre como editor para administrar Relações 2.0.","warning",5000);
    if(window.TerraZApp.publishing) window.TerraZApp.publishing.open();
    return;
  }

  if(!(await supportsGraphV3())){
    showToast("Publique primeiro o checkpoint desta etapa para ativar o backend de Relações 2.0.","warning",6500);
    return;
  }

  editorDraft=normalizeGraph(graphData);
  editorMode=mode==="edges" ? "edges" : (mode==="layout" ? "layout" : "nodes");
  editorSelectedId=id || "";
  editorSearch="";
  editorUndoStack=[];
  editorLayoutDrag=null;

  var modal=document.getElementById("graphEditorModal");
  var search=document.getElementById("graphEditorSearch");
  if(search) search.value="";
  renderEditorTabs();renderEditorList();renderEditorDetail();

  if(modal){
    modal.classList.add("show");
    document.body.style.overflow="hidden";
  }
}

function importKey(value){
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}

function importDisplayName(value){
  var raw=String(value || "").trim();
  return raw.replace(/\s+\((?:prime earth|new earth|earth-[^)]+|pre-zero hour|post-zero hour)\)\s*$/i,"").trim() || raw;
}

function importNodePosition(){
  var quadrants=(editorDraft && editorDraft.quadrants || []).filter(function(q){
    return Number(q.w)>0 && Number(q.h)>0;
  });
  if(!quadrants.length) return {x:500,y:360};

  var ranked=quadrants.map(function(q){
    var inside=(editorDraft.nodes || []).filter(function(node){
      return node.x>=q.x && node.x<=q.x+q.w && node.y>=q.y && node.y<=q.y+q.h;
    }).length;
    return {q:q,count:inside};
  }).sort(function(a,b){return a.count-b.count;});

  var choice=ranked[0];
  var q=choice.q;
  var index=choice.count;
  var cols=Math.max(2,Math.floor(Math.max(180,q.w-100)/100));
  var col=index%cols;
  var row=Math.floor(index/cols)%Math.max(2,Math.floor(Math.max(160,q.h-120)/100));
  var x=q.x+58+(col*(Math.max(100,q.w-116)/Math.max(1,cols-1)));
  var y=q.y+82+(row*96);
  return {
    x:Math.round(Math.max(48,Math.min(952,x))),
    y:Math.round(Math.max(58,Math.min(660,y)))
  };
}

function findImportedNode(options){
  if(!editorDraft) return null;
  var keys=[
    options && options.characterName,
    options && options.label,
    options && options.wikiTitle,
    importDisplayName(options && options.wikiTitle)
  ].map(importKey).filter(Boolean);

  return (editorDraft.nodes || []).find(function(node){
    var nodeKeys=[node.ref,node.label,node.subtitle].map(importKey).filter(Boolean);
    return keys.some(function(key){ return nodeKeys.includes(key); });
  }) || null;
}

async function importDcNode(options){
  options=options && typeof options==="object" ? options : {};
  if(!canEdit()){
    showToast("Entre como editor para adicionar esta referência ao grafo.","warning",5000);
    return {ok:false,reason:"auth"};
  }

  await openGraphEditor("layout","");
  if(!editorDraft) return {ok:false,reason:"editor"};

  var characterName=String(options.characterName || "").trim();
  var wikiTitle=String(options.wikiTitle || "").trim();
  var existing=findImportedNode(options);
  if(existing){
    if(characterName && importKey(existing.ref)!==importKey(characterName)){
      pushEditorUndo();
      existing.kind="character";
      existing.ref=characterName;
      existing.mediaMode="character";
      existing.mediaId="";
      existing.mediaUrl="";
      if(!existing.subtitle && wikiTitle && importKey(wikiTitle)!==importKey(existing.label)) existing.subtitle=wikiTitle;
      showToast(existing.label+" já estava no grafo e foi vinculado ao novo card. Revise e salve as relações.","success",5200);
    }else{
      showToast(existing.label+" já está no grafo. A entidade existente foi selecionada.","info",4500);
    }
    editorSelectedId=existing.id;
    renderEditorTabs();renderEditorList();renderEditorDetail();
    return {ok:true,created:false,id:existing.id,linked:!!characterName};
  }

  pushEditorUndo();
  var label=String(options.label || characterName || importDisplayName(wikiTitle) || "NOVA ENTIDADE").trim();
  var pos=importNodePosition();
  var mediaUrl=/^https:\/\//i.test(String(options.imageUrl || "")) ? String(options.imageUrl) : "";
  var node={
    id:makeId("personagem",label),
    label:label,
    subtitle:wikiTitle && importKey(wikiTitle)!==importKey(label) ? wikiTitle : "",
    kind:"character",
    ref:characterName,
    route:"",
    icon:"",
    mediaMode:characterName ? "character" : (mediaUrl ? "url" : "none"),
    mediaId:"",
    mediaUrl:characterName ? "" : mediaUrl,
    mediaFraming:{fit:"cover",x:50,y:24,zoom:1},
    x:pos.x,
    y:pos.y,
    color:KIND.character.color,
    r:38,
    visibility:"public"
  };

  editorDraft.nodes.push(node);
  editorSelectedId=node.id;
  renderEditorTabs();renderEditorList();renderEditorDetail();
  showToast(
    characterName
      ? label+" foi preparado no grafo. Posicione a bolinha, use “Conectar” se quiser criar vínculos e depois salve."
      : label+" foi adicionado como rascunho da DC. Posicione a bolinha, conecte se necessário e depois salve.",
    "success",
    5800
  );
  return {ok:true,created:true,id:node.id};
}

function closeGraphEditor(){
  if(quickRelationState.draft){
    closeQuickRelationModal();
    resetQuickRelationState();
  }
  var modal=document.getElementById("graphEditorModal");
  if(modal) modal.classList.remove("show");
  document.body.style.overflow="";
  editorDraft=null;editorSelectedId="";editorSearch="";editorUndoStack=[];editorLayoutDrag=null;
}

function restoreEditorBackup(){
  try{
    var raw=localStorage.getItem(GRAPH_BACKUP_KEY);
    if(!raw){ showToast("Nenhum layout anterior encontrado neste dispositivo.","warning"); return; }
    var parsed=JSON.parse(raw);
    var positions={};
    if(parsed && parsed.kind==="layout" && parsed.positions){
      positions=parsed.positions;
    }else if(parsed && Array.isArray(parsed.nodes)){
      parsed.nodes.forEach(function(node){
        if(node && node.id) positions[node.id]={x:node.x,y:node.y,r:node.r};
      });
    }
    var keys=Object.keys(positions);
    if(!keys.length){showToast("O backup anterior não possui posições válidas.","warning");return;}
    pushEditorUndo();
    var restored=0;
    editorDraft.nodes.forEach(function(node){
      var pos=positions[node.id];if(!pos)return;
      if(Number.isFinite(Number(pos.x)))node.x=Number(pos.x);
      if(Number.isFinite(Number(pos.y)))node.y=Number(pos.y);
      if(Number.isFinite(Number(pos.r)))node.r=Math.max(18,Math.min(120,Number(pos.r)));
      restored++;
    });
    editorSelectedId="";
    renderEditorList();renderEditorDetail();
    showToast("Layout anterior restaurado em "+restored+" entidade"+(restored===1?"":"s")+". Salve para publicar.","info",4800);
  }catch(error){ showToast("Não foi possível abrir o layout anterior.","error"); }
}

function graphUsesAdvancedVisibility(graph){
  return (graph.nodes || []).some(function(node){ return normalizeVisibility(node.visibility)!=="public"; }) ||
    (graph.edges || []).some(function(edge){ return normalizeVisibility(edge.visibility)!=="public"; });
}

async function saveGraphEditor(){
  if(!editorDraft) return;
  var b=backend();

  if(!(await supportsGraphV3())){
    showToast("O backend de Relações 2.0 ainda não está ativo em produção.","warning",6500);
    return;
  }

  if(graphUsesAdvancedVisibility(editorDraft) && !(await supportsVisibilitySystem())){
    showToast("Publique primeiro o backend consolidado para salvar conteúdo Spoiler/Mestre no grafo.","warning",6500);
    return;
  }

  var ids=new Set();
  for(var i=0;i<editorDraft.nodes.length;i++){
    var node=editorDraft.nodes[i];
    if(!node.label.trim()){ showToast("Toda entidade precisa de um nome.","warning"); return; }
    if(ids.has(node.id)){ showToast("Há IDs de entidades duplicados.","error"); return; }
    ids.add(node.id);
  }

  var save=document.getElementById("graphSaveBtn");
  if(save){ save.disabled=true;save.textContent="Salvando…"; }

  try{
    var graphBeforeSave=graphData ? clone(graphData) : null;
    var result=await b.request("/api/graph",{method:"POST",body:{graph:editorDraft}});
    if(graphBeforeSave) storeLayoutBackup(graphBeforeSave);
    publishedGraph=result.publicGraph ? clone(result.publicGraph) : publishedGraph;
    graphData=result.graph ? normalizeGraph(result.graph) : normalizeGraph(editorDraft);

    var pc=privateContent();
    if(pc && pc.reload){
      await pc.reload();
      graphData=loadGraph();
    }

    saveLocalGraph();
    closeGraphEditor();
    selectedNodeId="";selectedEdgeId="";
    renderGraph();renderInspector();
    showToast("Relações 2.0 salvas com sucesso.","success",4500);

    var runtime=window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh) runtime.refresh({force:true,bust:result.sha,silent:true});

    var publishing=window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url){
      publishing.trackDeployment(result.status_url);
    }
  }catch(error){
    console.error("Terra Z graph save:",error);
    showToast(error.message || "Falha ao salvar o grafo.","error",6500);
  }finally{
    if(save){ save.disabled=false;save.textContent="💾 Salvar alterações"; }
  }
}

function resetDraft(){
  if(!editorDraft) return;
  showConfirm(
    "Restaurar grafo padrão",
    "Substituir o rascunho atual pelo grafo padrão do Terra Z? Nada será publicado até você clicar em Salvar alterações.",
    function(){
      pushEditorUndo();
      editorDraft=normalizeGraph(defaultGraph);
      editorSelectedId="";
      renderEditorList();renderEditorDetail();
      showToast("Padrão carregado no rascunho.","info");
    },
    "Restaurar"
  );
}

function setupGraphEditor(){
  var modal=document.getElementById("graphEditorModal");
  if(modal) modal.addEventListener("click",function(event){ if(event.target===modal) closeGraphEditor(); });

  document.querySelectorAll("[data-ge-tab]").forEach(function(button){
    button.addEventListener("click",function(){
      var requested=button.getAttribute("data-ge-tab");
      editorMode=requested==="edges" ? "edges" : (requested==="layout" ? "layout" : "nodes");
      editorSelectedId="";
      renderEditorTabs();renderEditorList();renderEditorDetail();
    });
  });

  var search=document.getElementById("graphEditorSearch");
  if(search) search.addEventListener("input",function(){
    editorSearch=search.value || "";
    renderEditorList();
  });

  var actions={
    graphEditorClose:closeGraphEditor,
    graphCancelBtn:closeGraphEditor,
    graphEditorAdd:addEditorItem,
    graphAutoArrangeBtn:autoArrangeDraft,
    graphUndoBtn:undoEditorDraft,
    graphRestoreBtn:restoreEditorBackup,
    graphResetBtn:resetDraft,
    graphSaveBtn:saveGraphEditor
  };
  Object.keys(actions).forEach(function(id){
    var node=document.getElementById(id);
    if(node) node.addEventListener("click",actions[id]);
  });
}

function refreshGraphFromSources(){
  var modal=document.getElementById("graphEditorModal");
  if(modal && modal.classList.contains("show")) return;
  graphData=loadGraph();
  graphViewPositions=Object.create(null);
  graphViewDrag=null;
  saveLocalGraph();
  renderGraph();renderInspector();
}

document.addEventListener("terra-z:runtime-data-loaded",function(){
  publishedGraph=(window.TerraZData && window.TerraZData.graphOverride) || publishedGraph;
  refreshGraphFromSources();
});
document.addEventListener("terra-z:private-content-loaded",refreshGraphFromSources);
document.addEventListener("terra-z:private-content-cleared",refreshGraphFromSources);
document.addEventListener("terra-z:visibility-changed",function(){ renderGraph();renderInspector(); });
document.addEventListener("terra-z:auto-portrait-resolved",function(){
  renderGraph();
  if(selectedNodeId || selectedEdgeId) renderInspector();
});
document.addEventListener("terra-z:media-library-changed",function(){
  renderGraph();
  renderInspector();
  var modal=document.getElementById("graphEditorModal");
  if(modal && modal.classList.contains("show") && editorMode==="nodes") renderEditorDetail();
});
document.addEventListener("terra-z:auth-changed",function(){
  visibilityCapability=null;
  graphV3Capability=null;
  refreshGraphAccess();
  renderGraph();renderInspector();
});

try{
  graphData=loadGraph();
  setupGraphView();
  setupGraphEditor();
  renderGraph();
  renderInspector();
}catch(error){
  console.error("Terra Z Graph 2.0:",error);
}

function focusCharacterInGraph(name,options){
  options=options || {};
  var key=slugify(name);
  var node=(graphData && graphData.nodes || []).find(function(row){
    return row.kind==="character" && (
      slugify(row.ref)===key ||
      slugify(row.label)===key ||
      slugify(row.subtitle)===key
    );
  });
  if(!node) return false;

  var r=router();
  if(r && r.go) r.go("/universo/relacoes");
  selectedNodeId=node.id;
  selectedEdgeId="";
  setTimeout(function(){
    renderGraph();renderInspector();
    var target=document.querySelector(".graph-canvas-card");
    if(target) target.scrollIntoView({behavior:"smooth",block:"start"});
    if(options.connect===true && canEdit()) beginQuickPick(node.id,{draft:false});
  },60);
  return true;
}

window.TerraZApp.graph={
  render:renderGraph,
  openEditor:openGraphEditor,
  closeEditor:closeGraphEditor,
  autoArrange:function(){ if(editorDraft){ autoArrangeDraft(); return clone(editorDraft); } return null; },
  openLayout:function(){ return openGraphEditor("layout",""); },
  beginConnect:function(id,options){ return beginQuickPick(id,options || {}); },
  openQuickRelation:function(sourceId,targetId,options){ return openQuickRelation(sourceId,targetId,options || {}); },
  focusCharacter:focusCharacterInGraph,
  importCharacter:function(name,options){
    options=options || {};
    return importDcNode({
      characterName:name,
      label:name,
      wikiTitle:options.wikiTitle || "",
      imageUrl:""
    });
  },
  importFromDc:function(options){ return importDcNode(options || {}); },
  resetView:function(){ resetGraphViewPositions(true); },
  getViewPositions:function(){ return clone(graphViewPositions); },
  reset:function(){ openGraphEditor("nodes",""); resetDraft(); },
  getData:function(){ return graphData ? clone(graphData) : {version:3,quadrants:[],nodes:[],edges:[]}; },
  getCharacterMap:function(){
    var map={};
    (graphData && graphData.nodes || []).forEach(function(node){
      if(node.kind==="character" && node.ref) map[node.id]=node.ref;
    });
    return map;
  },
  focusNode:function(id){
    if(!nodeById(id)) return false;
    selectedNodeId=id;selectedEdgeId="";
    renderGraph();renderInspector();
    return true;
  }
};

})();
