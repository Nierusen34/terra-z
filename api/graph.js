import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { getHead, commitFiles } from "./_lib/github.js";
import { renderGraphOverride } from "./_lib/data-files.js";
import {
  PRIVATE_CHARACTER_DATA_PATH,
  readPrivateCharacterData,
  renderPrivateCharacterData
} from "./_lib/private-character-data.js";

function text(value,max=240){
  return String(value == null ? "" : value).replace(/[<>]/g,"").trim().slice(0,max);
}

function number(value,min,max,fallback){
  const n=Number(value);
  if(!Number.isFinite(n)) return fallback;
  return Math.min(max,Math.max(min,n));
}

function color(value,fallback="#3a3028"){
  const v=String(value || "");
  return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
}

function rgba(value,fallback="rgba(0,0,0,.04)"){
  const v=String(value || "").trim();
  return /^rgba?\([0-9.,\s%]+\)$/i.test(v) ? v.slice(0,80) : fallback;
}

function httpsUrl(value){
  const raw=String(value || "").trim().slice(0,1600);
  if(!raw) return "";
  try{
    const url=new URL(raw);
    return url.protocol==="https:" ? url.toString() : "";
  }catch(error){
    return "";
  }
}

function framing(value){
  const source=value && typeof value==="object" && !Array.isArray(value) ? value : {};
  return {
    fit:source.fit==="contain" ? "contain" : "cover",
    x:number(source.x,0,100,50),
    y:number(source.y,0,100,24),
    zoom:number(source.zoom,.5,2.5,1)
  };
}

function visibility(value){
  const raw=String(value || "public");
  if(raw==="master" || raw==="private") return "master";
  if(raw==="spoiler" || raw==="rumor" || raw==="restricted") return "spoiler";
  return "public";
}

function bool(value){ return value===true || value==="true" || value===1 || value==="1"; }

const NODE_KINDS=new Set([
  "character","team","faction","organization","location","event","custom"
]);

const MEDIA_MODES=new Set(["none","character","library","url"]);

const EDGE_TYPES=new Set([
  "family","ally","tension","clone","member","enemy","mentor","romance",
  "business","investigation","origin","command","rivalry","other"
]);

function normalizeGraph(input){
  if(!input || typeof input!=="object" || Array.isArray(input)){
    const error=new Error("Grafo inválido.");
    error.status=400;
    error.code="invalid_graph";
    throw error;
  }

  const quadrants=Array.isArray(input.quadrants) ? input.quadrants.slice(0,30).map((q,i)=>({
    id:text(q && q.id,80) || "quadrant-"+(i+1),
    title:text(q && q.title,120),
    x:number(q && q.x,-5000,5000,0),
    y:number(q && q.y,-5000,5000,0),
    w:number(q && q.w,10,10000,400),
    h:number(q && q.h,10,10000,300),
    color:color(q && q.color),
    bg:rgba(q && q.bg)
  })) : [];

  const nodes=Array.isArray(input.nodes) ? input.nodes.slice(0,180).map((n,i)=>({
    id:text(n && n.id,80) || "node-"+(i+1),
    label:text(n && n.label,100),
    subtitle:text(n && n.subtitle,160),
    kind:NODE_KINDS.has(n && n.kind) ? n.kind : "custom",
    ref:text(n && n.ref,180),
    route:text(n && n.route,260),
    icon:text(n && n.icon,12),
    mediaMode:MEDIA_MODES.has(n && n.mediaMode)
      ? n.mediaMode
      : ((n && n.kind)==="character" && text(n && n.ref,180) ? "character" : "none"),
    mediaId:text(n && n.mediaId,100),
    mediaUrl:httpsUrl(n && n.mediaUrl),
    mediaFraming:framing(n && n.mediaFraming),
    x:number(n && n.x,-5000,5000,500),
    y:number(n && n.y,-5000,5000,400),
    color:color(n && n.color),
    r:number(n && n.r,18,120,38),
    visibility:visibility(n && n.visibility)
  })) : [];

  for(const node of nodes){
    if(node.mediaMode==="library" && !node.mediaId){
      const error=new Error("Entidade com mídia da Biblioteca precisa selecionar um ativo.");
      error.status=400;
      error.code="missing_graph_media_asset";
      throw error;
    }
    if(node.mediaMode==="url" && !node.mediaUrl){
      const error=new Error("Entidade com URL própria precisa informar uma URL HTTPS válida.");
      error.status=400;
      error.code="invalid_graph_media_url";
      throw error;
    }
    if(node.visibility==="master" && node.mediaMode==="library"){
      const error=new Error("Entidades Mestre não podem usar ativos públicos da Biblioteca. Use URL direta ou sem imagem.");
      error.status=400;
      error.code="master_graph_public_media";
      throw error;
    }
  }

  const nodeIds=new Set(nodes.map(n=>n.id));
  if(nodeIds.size!==nodes.length){
    const error=new Error("O grafo contém IDs de nós duplicados.");
    error.status=400;
    error.code="duplicate_graph_node";
    throw error;
  }

  const edges=Array.isArray(input.edges) ? input.edges.slice(0,500).map((e,i)=>({
    id:text(e && e.id,100) || "edge-"+(i+1),
    from:text(e && e.from,80),
    to:text(e && e.to,80),
    type:EDGE_TYPES.has(e && e.type) ? e.type : "other",
    label:text(e && e.label,120),
    note:text(e && e.note,1200),
    strength:number(e && e.strength,1,5,3),
    directed:bool(e && e.directed),
    visibility:visibility(e && e.visibility)
  })).filter(e=>nodeIds.has(e.from) && nodeIds.has(e.to) && e.from!==e.to) : [];

  const edgeIds=new Set();
  edges.forEach((edge,index)=>{
    if(edgeIds.has(edge.id)) edge.id=edge.id+"-"+(index+1);
    edgeIds.add(edge.id);
  });

  const byId=new Map(nodes.map(node=>[node.id,node]));
  edges.forEach(edge=>{
    const from=byId.get(edge.from),to=byId.get(edge.to);
    if((from && from.visibility==="master") || (to && to.visibility==="master")){
      edge.visibility="master";
    }
  });

  return {
    version:3,
    quadrants,
    nodes,
    edges
  };
}

function statusUrl(req,sha){
  const proto=String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  return proto+"://"+req.headers.host+"/api/status?sha="+encodeURIComponent(sha);
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  if(req.method!=="POST"){
    res.setHeader("Allow","POST, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }
  if(!requireEditor(req,res)) return;

  try {
    const graph=normalizeGraph((req.body || {}).graph);
    const masterNodeIds=new Set(
      graph.nodes.filter(node=>node.visibility==="master").map(node=>node.id)
    );

    const publicGraph={
      version:3,
      quadrants:graph.quadrants,
      nodes:graph.nodes.filter(node=>node.visibility!=="master"),
      edges:graph.edges.filter(edge=>
        edge.visibility!=="master" &&
        !masterNodeIds.has(edge.from) &&
        !masterNodeIds.has(edge.to)
      )
    };

    const privateGraph={
      version:3,
      nodes:graph.nodes.filter(node=>node.visibility==="master"),
      edges:graph.edges.filter(edge=>
        edge.visibility==="master" ||
        masterNodeIds.has(edge.from) ||
        masterNodeIds.has(edge.to)
      ).map(edge=>({...edge,visibility:"master"}))
    };

    const privateData=await readPrivateCharacterData();
    privateData.graph=privateGraph;

    const head=await getHead();
    const commit=await commitFiles([
      {path:"data/graph-overrides.js",content:renderGraphOverride(publicGraph),encoding:"utf-8"},
      {path:PRIVATE_CHARACTER_DATA_PATH,content:renderPrivateCharacterData(privateData),encoding:"utf-8"}
    ],"relations: atualizar Grafo 2.0",head);

    return res.status(200).json({
      ok:true,
      sha:commit.sha,
      graph,
      publicGraph,
      status_url:statusUrl(req,commit.sha)
    });
  } catch(error){
    console.error(error);
    return res.status(error.status || 500).json({
      error:error.code || "graph_publish_failed",
      message:error.status ? error.message : "Falha ao publicar o grafo de relações."
    });
  }
}
