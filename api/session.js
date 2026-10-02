import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { getHead, readTextFile, commitFiles } from "./_lib/github.js";
import { parseDataAssignment, renderSessions } from "./_lib/data-files.js";
import { PRIVATE_SESSIONS_PATH, readPrivateSessions, renderPrivateSessions } from "./_lib/private-sessions.js";

const VISIBILITY = new Set(["public","spoiler","master"]);

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
  if(req.method !== "GET" && req.method !== "POST" && req.method !== "DELETE"){
    res.setHeader("Allow","GET, POST, DELETE, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }
  if(!requireEditor(req,res)) return;

  try {
    const action=String((req.query || {}).action || "").toLowerCase();
    if(req.method === "GET"){
      if(action !== "private"){
        return res.status(400).json({error:"missing_action",message:"Ação de sessão não informada."});
      }
      const sessions=await readPrivateSessions();
      return res.status(200).json({ok:true,sessions});
    }

    const input = (req.body || {}).session || req.body || {};
    const deleting = req.method === "DELETE";

    const suppliedId = text(input.id,100);
    const title = text(input.title,160);

    if(!deleting && !title){
      return res.status(400).json({error:"missing_title",message:"Informe o título da sessão."});
    }

    const realDate = text(input.realDate,20);
    const id = suppliedId || (!deleting ? slugify((realDate ? realDate + "-" : "") + title) : "");
    if(!id) return res.status(400).json({error:"invalid_session_id",message:"Sessão não informada."});

    const head = await getHead();
    const sessionsFile = await readTextFile("data/sessions.js");
    const publicSessions = parseDataAssignment(sessionsFile.content,"sessions");
    const privateSessions = await readPrivateSessions();

    const publicIndex = publicSessions.findIndex(row => row && row.id === id);
    const privateIndex = privateSessions.findIndex(row => row && row.id === id);

    if(deleting){
      if(publicIndex < 0 && privateIndex < 0){
        return res.status(404).json({
          error:"session_not_found",
          message:"Sessão não encontrada."
        });
      }

      const wasPrivate = privateIndex >= 0;
      const removed = publicIndex >= 0 ? publicSessions[publicIndex] : privateSessions[privateIndex];
      const files = [];

      if(publicIndex >= 0){
        publicSessions.splice(publicIndex,1);
        files.push({
          path:"data/sessions.js",
          content:renderSessions(publicSessions),
          encoding:"utf-8"
        });
      }

      if(privateIndex >= 0){
        privateSessions.splice(privateIndex,1);
        files.push({
          path:PRIVATE_SESSIONS_PATH,
          content:renderPrivateSessions(privateSessions),
          encoding:"utf-8"
        });
      }

      const commit = await commitFiles(
        files,
        wasPrivate ? "sessions: apagar conteúdo privado do Mestre" : "sessions: apagar " + text(removed && removed.title,160),
        head
      );

      return res.status(200).json({
        ok:true,
        sha:commit.sha,
        deleted:id,
        visibility:removed && removed.visibility ? removed.visibility : (wasPrivate ? "master" : "public"),
        status_url:statusUrl(req,commit.sha)
      });
    }

    const item = {
      id,
      title,
      realDate,
      inWorldDate:text(input.inWorldDate,120),
      summary:text(input.summary,5000),
      characters:list(input.characters),
      locations:list(input.locations),
      consequences:list(input.consequences,40,500),
      visibility:(input.visibility === "rumor"
        ? "spoiler"
        : (VISIBILITY.has(input.visibility) ? input.visibility : "public")),
      links:list(input.links,20,500)
    };

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

    const commitMessage = item.visibility === "master"
      ? (existed ? "sessions: atualizar conteúdo privado do Mestre" : "sessions: registrar conteúdo privado do Mestre")
      : (existed ? "sessions: atualizar " : "sessions: registrar ") + title;

    const commit = await commitFiles(
      files,
      commitMessage,
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
