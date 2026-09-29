import sanitizeHtml from "sanitize-html";
import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { getHead, readTextFile, commitFiles } from "./_lib/github.js";
import { parseDataAssignment, renderContentOverrides } from "./_lib/data-files.js";

const ALLOWED_TAGS = ["br","strong","em","b","i","u","s","ul","ol","li","span","a","small","sup","sub","blockquote","code"];
const ALLOWED_ATTRIBUTES = {
  a:["href","title","target","rel"],
  span:["class"]
};

function sanitizeValue(value){
  if(typeof value !== "string") throw new Error("Conteúdo editado precisa ser texto.");
  if(value.length > 100000) throw new Error("Um dos campos excede o limite de 100 mil caracteres.");

  return sanitizeHtml(value,{
    allowedTags:ALLOWED_TAGS,
    allowedAttributes:ALLOWED_ATTRIBUTES,
    allowedSchemes:["http","https","mailto"],
    allowProtocolRelative:false,
    disallowedTagsMode:"discard"
  });
}

function statusUrl(req,sha){
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = req.headers.host;
  return proto + "://" + host + "/api/status?sha=" + encodeURIComponent(sha);
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  if(req.method !== "POST"){
    res.setHeader("Allow","POST, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }
  if(!requireEditor(req,res)) return;

  try {
    const body = req.body || {};
    if(body.schema !== "terra-z-publish-v1" || body.type !== "content-overrides"){
      return res.status(400).json({error:"invalid_payload",message:"Formato de publicação não reconhecido."});
    }

    const changes = body.changes;
    if(!changes || typeof changes !== "object" || Array.isArray(changes)){
      return res.status(400).json({error:"invalid_changes",message:"Alterações inválidas."});
    }

    const ids = Object.keys(changes);
    if(!ids.length) return res.status(400).json({error:"empty_changes",message:"Nenhuma alteração recebida."});
    if(ids.length > 200) return res.status(413).json({error:"too_many_changes",message:"Limite de 200 campos por publicação."});
    if(ids.some(id => !/^tz-\d{4}$/.test(id))){
      return res.status(400).json({error:"invalid_edit_id",message:"Foi recebido um ID de edição inválido."});
    }

    const head = await getHead();
    const currentFile = await readTextFile("data/content-overrides.js");
    const current = parseDataAssignment(currentFile.content,"contentOverrides");
    const base = (body.base && typeof body.base === "object" && !Array.isArray(body.base)) ? body.base : {};

    const conflicts = [];
    ids.forEach(id => {
      if(Object.prototype.hasOwnProperty.call(current,id) &&
         Object.prototype.hasOwnProperty.call(base,id) &&
         String(current[id]) !== String(base[id])){
        conflicts.push(id);
      }
    });

    if(conflicts.length){
      return res.status(409).json({
        error:"content_conflict",
        message:"Alguns campos foram alterados por outra publicação.",
        conflicts
      });
    }

    const merged = {...current};
    ids.forEach(id => { merged[id] = sanitizeValue(changes[id]); });

    const messageRaw = String(body.message || "content: atualizar conteúdo pelo editor do Terra Z").trim();
    const message = messageRaw.slice(0,120) || "content: atualizar conteúdo pelo editor do Terra Z";

    const commit = await commitFiles([
      {path:"data/content-overrides.js",content:renderContentOverrides(merged),encoding:"utf-8"}
    ],message,head);

    return res.status(200).json({
      ok:true,
      sha:commit.sha,
      status_url:statusUrl(req,commit.sha)
    });
  } catch(error){
    console.error(error);
    const status = error.status || 500;
    return res.status(status).json({
      error:error.code || "publish_failed",
      message:status === 500 ? "Falha ao publicar no GitHub." : error.message,
      current_head:error.currentHead || undefined
    });
  }
}
