import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { getHead, readTextFile, commitFiles } from "./_lib/github.js";
import { parseDataAssignment } from "./_lib/data-files.js";

const CATEGORIES = new Set(["criminal","corporate","academic","media","agency"]);
const VISIBILITY = new Set(["public","spoiler"]);

function text(value,max=3000){
  return String(value == null ? "" : value).replace(/[<>]/g,"").trim().slice(0,max);
}

function list(value,maxItems=40,maxLen=240){
  const input=Array.isArray(value) ? value : [];
  return [...new Set(input.map(item=>text(item,maxLen)).filter(Boolean))].slice(0,maxItems);
}

function slugify(value){
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .replace(/['’]/g,"")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .slice(0,80);
}

function categoryLabel(category){
  return ({
    criminal:"Facção Criminosa",
    corporate:"Empresa",
    academic:"Ensino Superior",
    media:"Mídia",
    agency:"Agência"
  })[category] || "Organização";
}

function normalizeOrganization(input,existingId=""){
  const raw=input && typeof input==="object" ? input : {};
  const name=text(raw.name,160);
  if(!name){
    const error=new Error("Informe o nome da organização.");
    error.status=400;
    error.code="missing_name";
    throw error;
  }

  const category=CATEGORIES.has(String(raw.category||"")) ? String(raw.category) : "corporate";
  const id=existingId || slugify(raw.id || name);
  if(!id){
    const error=new Error("Não foi possível gerar um identificador para a organização.");
    error.status=400;
    error.code="invalid_organization_id";
    throw error;
  }

  const item={
    id,
    name,
    icon:text(raw.icon,24) || "◆",
    category,
    categoryLabel:text(raw.categoryLabel,100) || categoryLabel(category),
    base:text(raw.base,240),
    leader:text(raw.leader,240),
    description:text(raw.description,6000),
    activities:list(raw.activities,40,240),
    relatedCharacters:list(raw.relatedCharacters,60,180),
    relatedLocations:list(raw.relatedLocations,60,220),
    visibility:VISIBILITY.has(String(raw.visibility||"")) ? String(raw.visibility) : "public"
  };

  const aliases=list(raw.aliases,30,180);
  const rivals=list(raw.rivals,30,180);
  const subunits=list(raw.subunits,30,220);
  const spoiler=text(raw.spoiler,6000);

  if(aliases.length) item.aliases=aliases;
  if(rivals.length) item.rivals=rivals;
  if(subunits.length) item.subunits=subunits;
  if(spoiler) item.spoiler=spoiler;

  return item;
}

function renderOrganizations(items){
  return `(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Organizações, facções, empresas e instituições de Vanguard Bay.
// Arquivo próprio para permitir edição estruturada pelo painel administrativo.
window.TerraZData.organizations = ${JSON.stringify(items,null,2)};

})();
`;
}

function statusUrl(req,sha){
  const proto=String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  return proto + "://" + req.headers.host + "/api/status?sha=" + encodeURIComponent(sha);
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  res.setHeader("Cache-Control","no-store, max-age=0");

  if(req.method!=="POST" && req.method!=="DELETE"){
    res.setHeader("Allow","POST, DELETE, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }
  if(!requireEditor(req,res)) return;

  try{
    const head=await getHead();
    const [orgFile,graphFile]=await Promise.all([
      readTextFile("data/organizations.js"),
      readTextFile("data/graph-overrides.js")
    ]);

    const organizations=parseDataAssignment(orgFile.content,"organizations");
    const graph=parseDataAssignment(graphFile.content,"graphOverride") || {nodes:[]};
    const body=req.body || {};
    const suppliedId=text(body.id || (body.organization && body.organization.id),80);
    const index=organizations.findIndex(item=>item && item.id===suppliedId);

    if(req.method==="DELETE"){
      if(!suppliedId || index<0){
        return res.status(404).json({error:"organization_not_found",message:"Organização não encontrada."});
      }

      const graphReference=(Array.isArray(graph.nodes)?graph.nodes:[]).find(node=>
        node && (node.kind==="organization" || node.kind==="faction") && String(node.ref||"")===suppliedId
      );
      if(graphReference){
        return res.status(409).json({
          error:"organization_in_graph",
          message:"Esta organização ainda possui uma entidade no grafo. Remova ou altere o nó do grafo antes de excluí-la."
        });
      }

      const removed=organizations[index];
      const referencedBy=organizations.find(item=>{
        if(!item || item.id===suppliedId) return false;
        const refs=[].concat(item.rivals||[],item.subunits||[]);
        return refs.some(value=>
          String(value||"").toLocaleLowerCase("pt-BR")===String(removed.name||"").toLocaleLowerCase("pt-BR")
        );
      });
      if(referencedBy){
        return res.status(409).json({
          error:"organization_referenced",
          message:'Esta organização ainda é citada por "'+String(referencedBy.name||"outra organização")+'". Remova essa referência antes de excluí-la.'
        });
      }

      organizations.splice(index,1);
      const commit=await commitFiles(
        [{path:"data/organizations.js",content:renderOrganizations(organizations),encoding:"utf-8"}],
        "organizations: excluir " + text(removed.name,160),
        head
      );
      return res.status(200).json({
        ok:true,sha:commit.sha,deleted:suppliedId,
        organizations,status_url:statusUrl(req,commit.sha)
      });
    }

    const input=body.organization || body;
    const creating=index<0;
    const normalized=normalizeOrganization(input,creating ? "" : suppliedId);

    const duplicate=organizations.find(item=>
      item && item.id!==normalized.id &&
      String(item.name||"").toLocaleLowerCase("pt-BR")===normalized.name.toLocaleLowerCase("pt-BR")
    );
    if(duplicate){
      return res.status(409).json({error:"duplicate_organization",message:"Já existe uma organização com esse nome."});
    }

    if(creating){
      if(organizations.some(item=>item && item.id===normalized.id)){
        return res.status(409).json({error:"duplicate_organization_id",message:"Já existe uma organização com esse identificador."});
      }
      organizations.push(normalized);
    }else{
      organizations[index]=normalized;
    }

    const order=["criminal","corporate","academic","media","agency"];
    organizations.sort((a,b)=>{
      const categoryDiff=order.indexOf(a.category)-order.indexOf(b.category);
      if(categoryDiff) return categoryDiff;
      return String(a.name||"").localeCompare(String(b.name||""),"pt-BR");
    });

    const commit=await commitFiles(
      [{path:"data/organizations.js",content:renderOrganizations(organizations),encoding:"utf-8"}],
      (creating ? "organizations: criar " : "organizations: atualizar ") + normalized.name,
      head
    );

    return res.status(200).json({
      ok:true,sha:commit.sha,organization:normalized,organizations,
      status_url:statusUrl(req,commit.sha)
    });
  }catch(error){
    console.error(error);
    return res.status(error.status || 500).json({
      error:error.code || "organization_publish_failed",
      message:error.status ? error.message : "Falha ao publicar a organização."
    });
  }
}
