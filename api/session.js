import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { getHead, readTextFile, commitFiles } from "./_lib/github.js";
import { parseDataAssignment, renderSessions } from "./_lib/data-files.js";

const VISIBILITY = new Set(["public","rumor","restricted","master"]);

function text(value,max=2000){
  return String(value || "").replace(/[<>]/g,"").trim().slice(0,max);
}

function list(value,maxItems=30,maxLen=240){
  if(!Array.isArray(value)) return [];
  return value.slice(0,maxItems).map(v => text(v,maxLen)).filter(Boolean);
}

function slugify(value){
  return String(value)
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .replace(/['’]/g,"")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .slice(0,90);
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
    const input = (req.body || {}).session || req.body || {};
    const title = text(input.title,160);
    if(!title) return res.status(400).json({error:"missing_title",message:"Informe o título da sessão."});

    const realDate = text(input.realDate,20);
    const id = text(input.id,100) || slugify((realDate ? realDate + "-" : "") + title);
    if(!id) return res.status(400).json({error:"invalid_session_id"});

    const item = {
      id,
      title,
      realDate,
      inWorldDate:text(input.inWorldDate,120),
      summary:text(input.summary,5000),
      characters:list(input.characters),
      locations:list(input.locations),
      consequences:list(input.consequences,40,500),
      visibility:VISIBILITY.has(input.visibility) ? input.visibility : "public",
      links:list(input.links,20,500)
    };

    const head = await getHead();
    const sessionsFile = await readTextFile("data/sessions.js");
    const sessions = parseDataAssignment(sessionsFile.content,"sessions");
    const index = sessions.findIndex(row => row && row.id === id);

    if(index >= 0) sessions[index] = item;
    else sessions.push(item);

    const commit = await commitFiles([
      {path:"data/sessions.js",content:renderSessions(sessions),encoding:"utf-8"}
    ],(index >= 0 ? "sessions: atualizar " : "sessions: registrar ") + title,head);

    return res.status(200).json({
      ok:true,
      sha:commit.sha,
      session:item,
      status_url:statusUrl(req,commit.sha)
    });
  } catch(error){
    console.error(error);
    return res.status(error.status || 500).json({
      error:error.code || "session_publish_failed",
      message:error.status ? error.message : "Falha ao publicar a sessão."
    });
  }
}
