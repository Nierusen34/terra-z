import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { getHead, readTextFile, commitFiles } from "./_lib/github.js";
import { parseDataAssignment, renderSessions } from "./_lib/data-files.js";
import { PRIVATE_SESSIONS_PATH, readPrivateSessions, renderPrivateSessions } from "./_lib/private-sessions.js";

const VISIBILITY = new Set(["public","rumor","master"]);

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
    const publicSessions = parseDataAssignment(sessionsFile.content,"sessions");
    const privateSessions = await readPrivateSessions();

    const publicIndex = publicSessions.findIndex(row => row && row.id === id);
    const privateIndex = privateSessions.findIndex(row => row && row.id === id);
    const existed = publicIndex >= 0 || privateIndex >= 0;
    const files = [];

    if(item.visibility === "master"){
      if(publicIndex >= 0) publicSessions.splice(publicIndex,1);
      if(privateIndex >= 0) privateSessions[privateIndex] = item;
      else privateSessions.push(item);

      if(publicIndex >= 0){
        files.push({path:"data/sessions.js",content:renderSessions(publicSessions),encoding:"utf-8"});
      }
      files.push({path:PRIVATE_SESSIONS_PATH,content:renderPrivateSessions(privateSessions),encoding:"utf-8"});
    } else {
      if(publicIndex >= 0) publicSessions[publicIndex] = item;
      else publicSessions.push(item);

      if(privateIndex >= 0) privateSessions.splice(privateIndex,1);

      files.push({path:"data/sessions.js",content:renderSessions(publicSessions),encoding:"utf-8"});
      if(privateIndex >= 0){
        files.push({path:PRIVATE_SESSIONS_PATH,content:renderPrivateSessions(privateSessions),encoding:"utf-8"});
      }
    }

    const commit = await commitFiles(
      files,
      (existed ? "sessions: atualizar " : "sessions: registrar ") + title,
      head
    );

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
