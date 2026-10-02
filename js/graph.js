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
    var previous=localStorage.getItem(GRAPH_KEY);
    if(previous) localStorage.setItem(GRAPH_BACKUP_KEY,previous);
    localStorage.setItem(GRAPH_KEY,JSON.stringify(snapshot));
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
      health.relations_entity_editor===true
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

function relationColor(type){
  return (RELATION[normalizeRelation(type)] || RELATION.other).color;
}

function svgId(value){
  return String(value || "node").replace(/[^a-zA-Z0-9_-]+/g,"-");
}

function characterMediaApi(){
  return window.TerraZApp && window.TerraZApp.characterMedia;
}

function characterPortraitUrl(node){
  if(!node || node.kind!=="character" || !node.ref) return "";
  var api=characterMediaApi();
  if(!api || !api.get) return "";
  var meta=api.get(node.ref) || {};
  return String(meta.src || "");
}

function queueGraphPortrait(node){
  if(!node || node.kind!=="character" || !node.ref) return;
  if(characterPortraitUrl(node) || graphPortraitPending[node.ref]) return;

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
  if(node.kind==="character" && node.ref){
    var api=characterMediaApi();
    if(api && api.renderPortraitHtml){
      return '<div class="graph-inspector-portrait">'+api.renderPortraitHtml(node.ref,size || "large")+'</div>';
    }
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
    return node.kind==="character" && !!characterPortraitUrl(node);
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

  var nodes=visibleNodes();
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
    var a=nodeById(edge.from),b=nodeById(edge.to);
    if(!a || !b) return;
    var geometry=curveForEdge(a,b,index);
    var color=relationColor(edge.type);
    var selected=edge.id===selectedEdgeId;
    var width=1.2+Number(edge.strength || 3)*.45;
    var dash=(edge.type==="tension" || edge.type==="enemy" || edge.type==="rivalry" || edge.type==="clone") ? ' stroke-dasharray="7 5"' : "";
    var marker=edge.directed ? ' marker-end="url(#graph-arrow-'+escapeAttr(edge.type)+')"' : "";

    html+='<g class="graph-edge-group'+(selected?' selected':'')+'" data-edge-id="'+escapeAttr(edge.id)+'">'+
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

    var portrait=characterPortraitUrl(node);
    if(node.kind==="character" && !portrait) queueGraphPortrait(node);

    var nodeVisual='';
    if(node.kind==="character"){
      nodeVisual=
        '<g filter="'+(selected?'url(#graph-selected)':'url(#graph-shadow)')+'">'+
          '<circle cx="'+node.x+'" cy="'+node.y+'" r="'+node.r+'" fill="'+escapeAttr(node.color)+'" stroke="var(--graph-node-stroke,#fff)" stroke-width="2.5"/>'+
        '</g>'+
        (!portrait
          ? '<text x="'+node.x+'" y="'+(node.y+3)+'" text-anchor="middle" class="graph-node-icon">'+escapeHtml(node.icon || kind.icon)+'</text>'
          : '<image class="graph-node-portrait" href="'+escapeAttr(portrait)+'" x="'+(node.x-node.r+3)+'" y="'+(node.y-node.r+3)+'" width="'+((node.r-3)*2)+'" height="'+((node.r-3)*2)+'" preserveAspectRatio="xMidYMid slice" clip-path="url(#graph-portrait-clip-'+svgId(node.id)+')" referrerpolicy="no-referrer"/>'+
            '<circle cx="'+node.x+'" cy="'+node.y+'" r="'+(node.r-1.5)+'" fill="none" stroke="var(--graph-node-stroke,#fff)" stroke-width="2.5"/>');
    }else{
      nodeVisual=
        '<g filter="'+(selected?'url(#graph-selected)':'url(#graph-shadow)')+'">'+nodeShape(node)+'</g>'+
        '<text x="'+node.x+'" y="'+(node.y+3)+'" text-anchor="middle" class="graph-node-icon">'+escapeHtml(node.icon || kind.icon)+'</text>';
    }

    html+='<g class="graph-node-v2'+(route?' routable':'')+(selected?' selected':'')+(matched?' search-match':' search-context')+'" data-node-id="'+escapeAttr(node.id)+'" tabindex="0" role="button" aria-label="'+escapeAttr(node.label)+'">'+
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
    var choose=function(){
      selectedNodeId=group.getAttribute("data-node-id") || "";
      selectedEdgeId="";
      renderGraph();
      renderInspector();
    };
    group.addEventListener("click",function(event){ event.stopPropagation(); choose(); });
    group.addEventListener("keydown",function(event){
      if(event.key==="Enter" || event.key===" "){ event.preventDefault(); choose(); }
    });
    group.addEventListener("dblclick",function(event){
      event.stopPropagation();
      var node=nodeById(group.getAttribute("data-node-id"));
      openNodeRoute(node);
    });
  });

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
    '<p>Clique em um nó ou vínculo para ver detalhes, conexões e atalhos narrativos.</p>'+
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
        (canEdit() ? '<button type="button" id="graphInspectorEdit">✏️ Editar</button>' : '')+
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
  if(edit) edit.addEventListener("click",function(){ openGraphEditor("nodes",""); });

  var zoomOut=document.getElementById("graphZoomOut");
  var zoomIn=document.getElementById("graphZoomIn");
  var zoomReset=document.getElementById("graphZoomReset");
  var zoomRange=document.getElementById("graphZoomRange");

  if(zoomOut) zoomOut.addEventListener("click",function(){ setGraphScale(graphScale-.1,true); });
  if(zoomIn) zoomIn.addEventListener("click",function(){ setGraphScale(graphScale+.1,true); });
  if(zoomReset) zoomReset.addEventListener("click",function(){ setGraphScale(1,true); });
  if(zoomRange) zoomRange.addEventListener("input",function(){ setGraphScale(Number(zoomRange.value)/100,true); });
  applyGraphScale();

  var svg=document.getElementById("graphSvg");
  if(svg) svg.addEventListener("click",function(event){
    if(event.target===svg || event.target.classList.contains("graph-grid-bg")){
      selectedNodeId="";
      selectedEdgeId="";
      renderGraph();
      renderInspector();
    }
  });

  refreshGraphAccess();
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
    : "Publique o checkpoint desta etapa para ativar o backend de Relações 2.0";
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
  var add=document.getElementById("graphEditorAdd");
  if(add) add.textContent=editorMode==="nodes" ? "＋ Nova entidade" : "＋ Nova relação";
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
  var items=editorMode==="nodes" ? graph.nodes : graph.edges;
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

function renderEditorDetail(){
  var root=document.getElementById("graphEditorDetail");
  if(!root) return;

  if(!editorSelectedId){
    root.innerHTML='<div class="ge-detail-empty"><strong>Escolha um item</strong><p>Selecione uma entidade ou relação na lista, ou crie uma nova.</p></div>';
    return;
  }

  var item=editorMode==="nodes" ? nodeById(editorSelectedId,editorDraft) : edgeById(editorSelectedId,editorDraft);
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
      renderEditorList();
    };
    input.addEventListener("input",handler);
    input.addEventListener("change",handler);
  });

  var del=document.getElementById("geDeleteCurrent");
  if(del) del.addEventListener("click",deleteEditorCurrent);
}

function addEditorItem(){
  if(editorMode==="nodes"){
    var count=editorDraft.nodes.length;
    var id=makeId("entidade","entidade-"+(count+1));
    var angle=(count%12)/12*Math.PI*2;
    var node={
      id:id,label:"NOVA ENTIDADE",subtitle:"",kind:"custom",ref:"",route:"",icon:"",
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
  var item=editorMode==="nodes" ? nodeById(editorSelectedId,editorDraft) : edgeById(editorSelectedId,editorDraft);
  if(!item) return;

  var message=editorMode==="nodes"
    ? 'Excluir "'+item.label+'"? Todas as relações ligadas a esta entidade também serão removidas.'
    : 'Excluir esta relação do grafo?';

  showConfirm("Excluir "+(editorMode==="nodes"?"entidade":"relação"),message,function(){
    if(editorMode==="nodes"){
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
  var groups={};
  editorDraft.nodes.forEach(function(node){
    var kind=normalizeKind(node.kind);
    (groups[kind]=groups[kind] || []).push(node);
  });

  var kinds=Object.keys(groups);
  var centers=[
    [190,150],[500,150],[810,150],
    [190,390],[500,390],[810,390],
    [500,610]
  ];

  kinds.forEach(function(kind,groupIndex){
    var nodes=groups[kind];
    var center=centers[groupIndex%centers.length];
    var radius=nodes.length>1 ? Math.min(115,42+nodes.length*10) : 0;
    nodes.forEach(function(node,index){
      var angle=nodes.length>1 ? (index/nodes.length)*Math.PI*2-Math.PI/2 : 0;
      node.x=Math.round(center[0]+Math.cos(angle)*radius);
      node.y=Math.round(center[1]+Math.sin(angle)*radius);
    });
  });

  showToast("Layout reorganizado no rascunho. Salve para publicar.","info",4000);
  renderEditorDetail();
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
  editorMode=mode==="edges" ? "edges" : "nodes";
  editorSelectedId=id || "";
  editorSearch="";

  var modal=document.getElementById("graphEditorModal");
  var search=document.getElementById("graphEditorSearch");
  if(search) search.value="";
  renderEditorTabs();renderEditorList();renderEditorDetail();

  if(modal){
    modal.classList.add("show");
    document.body.style.overflow="hidden";
  }
}

function closeGraphEditor(){
  var modal=document.getElementById("graphEditorModal");
  if(modal) modal.classList.remove("show");
  document.body.style.overflow="";
  editorDraft=null;editorSelectedId="";editorSearch="";
}

function restoreEditorBackup(){
  try{
    var raw=localStorage.getItem(GRAPH_BACKUP_KEY);
    if(!raw){ showToast("Nenhum backup local anterior encontrado.","warning"); return; }
    editorDraft=normalizeGraph(JSON.parse(raw));
    editorSelectedId="";
    renderEditorList();renderEditorDetail();
    showToast("Backup carregado no editor. Salve para publicar.","info",4200);
  }catch(error){ showToast("Não foi possível abrir o backup local.","error"); }
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
    var result=await b.request("/api/graph",{method:"POST",body:{graph:editorDraft}});
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
      editorMode=button.getAttribute("data-ge-tab")==="edges" ? "edges" : "nodes";
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

window.TerraZApp.graph={
  render:renderGraph,
  openEditor:openGraphEditor,
  closeEditor:closeGraphEditor,
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
