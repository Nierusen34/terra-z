import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { getHead, commitFiles } from "./_lib/github.js";
import { renderGraphOverride } from "./_lib/data-files.js";

function text(value,max=240){
  return String(value == null ? "" : value).replace(/[<>]/g,"").trim().slice(0,max);
}

function number(value,min,max,fallback){
  const n = Number(value);
  if(!Number.isFinite(n)) return fallback;
  return Math.min(max,Math.max(min,n));
}

function color(value,fallback="#3a3028"){
  const v = String(value || "");
  return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
}

function rgba(value,fallback="rgba(0,0,0,.04)"){
  const v = String(value || "").trim();
  return /^rgba?\([0-9.,\s%]+\)$/i.test(v) ? v.slice(0,80) : fallback;
}

function normalizeGraph(input){
  if(!input || typeof input !== "object" || Array.isArray(input)){
    const error = new Error("Grafo inválido.");
    error.status = 400;
    error.code = "invalid_graph";
    throw error;
  }

  const quadrants = Array.isArray(input.quadrants) ? input.quadrants.slice(0,20).map((q,i)=>({
    id:text(q && q.id,80) || "quadrant-" + (i+1),
    title:text(q && q.title,120),
    x:number(q && q.x,-5000,5000,0),
    y:number(q && q.y,-5000,5000,0),
    w:number(q && q.w,10,10000,400),
    h:number(q && q.h,10,10000,300),
    color:color(q && q.color),
    bg:rgba(q && q.bg)
  })) : [];

  const nodes = Array.isArray(input.nodes) ? input.nodes.slice(0,100).map((n,i)=>({
    id:text(n && n.id,80) || "node-" + (i+1),
    label:text(n && n.label,100),
    x:number(n && n.x,-5000,5000,500),
    y:number(n && n.y,-5000,5000,400),
    color:color(n && n.color),
    r:number(n && n.r,8,200,34)
  })) : [];

  const nodeIds = new Set(nodes.map(n=>n.id));
  if(nodeIds.size !== nodes.length){
    const error = new Error("O grafo contém IDs de nós duplicados.");
    error.status = 400;
    error.code = "duplicate_graph_node";
    throw error;
  }

  const allowedTypes = new Set(["family","ally","tension","clone"]);
  const edges = Array.isArray(input.edges) ? input.edges.slice(0,250).map(e=>({
    from:text(e && e.from,80),
    to:text(e && e.to,80),
    type:allowedTypes.has(e && e.type) ? e.type : "ally",
    label:text(e && e.label,120)
  })).filter(e=>nodeIds.has(e.from) && nodeIds.has(e.to) && e.from !== e.to) : [];

  return {quadrants,nodes,edges};
}

function statusUrl(req,sha){
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  return proto + "://" + req.headers.host + "/api/status?sha=" + encodeURIComponent(sha);
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  if(req.method !== "POST"){
    res.setHeader("Allow","POST, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }
  if(!requireEditor(req,res)) return;

  try {
    const graph = normalizeGraph((req.body || {}).graph);
    const head = await getHead();
    const commit = await commitFiles([
      {
        path:"data/graph-overrides.js",
        content:renderGraphOverride(graph),
        encoding:"utf-8"
      }
    ],"relations: atualizar grafo pelo editor",head);

    return res.status(200).json({
      ok:true,
      sha:commit.sha,
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
