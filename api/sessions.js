"use strict";

const { json, applyCors, requireEditor } = require("../server/auth");
const { installationToken, getFile, putFile, OWNER, REPO, BRANCH } = require("../server/github");

const SESSIONS_RE = /window\.TerraZData\.sessions\s*=\s*(\[[\s\S]*?\]);/;
const ALLOWED_VISIBILITY = new Set(["public","rumor","restricted","master"]);

function slugify(value){
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/['’]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")
    .slice(0,100);
}

function list(value, maxItems){
  if(!Array.isArray(value)) return [];
  return value.slice(0,maxItems).map(x=>String(x || "").trim().slice(0,240)).filter(Boolean);
}

function normalizeSession(input){
  const title = String(input.title || "").trim().slice(0,160);
  if(!title) throw new Error("Título da sessão é obrigatório.");

  const realDate = String(input.realDate || "").trim().slice(0,20);
  if(realDate && !/^\d{4}-\d{2}-\d{2}$/.test(realDate)) throw new Error("Data real inválida.");

  const visibility = ALLOWED_VISIBILITY.has(input.visibility) ? input.visibility : "public";
  const id = slugify(input.id || ((realDate ? realDate + "-" : "") + title));
  if(!id) throw new Error("Não foi possível gerar o ID da sessão.");

  return {
    id,
    title,
    realDate,
    inWorldDate:String(input.inWorldDate || "").trim().slice(0,120),
    summary:String(input.summary || "").trim().slice(0,4000),
    characters:list(input.characters,30),
    locations:list(input.locations,30),
    consequences:list(input.consequences,50),
    visibility,
    links:list(input.links,20)
  };
}

function renderSessions(sessions){
  return `(function(){\n"use strict";\n\nwindow.TerraZData = window.TerraZData || {};\n\n// Histórico vivo da campanha.\nwindow.TerraZData.sessions = ${JSON.stringify(sessions,null,2)};\n\nwindow.TerraZData.sessionSchema = {\n  id: "slug-estavel-da-sessao",\n  title: "Título da sessão",\n  realDate: "YYYY-MM-DD",\n  inWorldDate: "texto livre, ex.: Janeiro de 2027",\n  summary: "Resumo curto",\n  characters: ["Nome do personagem"],\n  locations: ["Nome do local"],\n  consequences: ["Consequência"],\n  visibility: "public",\n  links: []\n};\n\n})();\n`;
}

module.exports = async function handler(req,res){
  applyCors(req,res);
  if(req.method === "OPTIONS"){ res.statusCode=204; return res.end(); }
  if(req.method !== "POST") return json(res,405,{error:"method_not_allowed"});
  if(!requireEditor(req,res)) return;

  try {
    const body = req.body || {};
    if(body.schema !== "terra-z-session-v1") return json(res,400,{error:"unsupported_payload"});

    const session = normalizeSession(body.session || {});
    const token = await installationToken();
    const current = await getFile("data/sessions.js",token);
    const source = Buffer.from(current.content || "","base64").toString("utf8");
    const match = source.match(SESSIONS_RE);
    if(!match) throw new Error("Não foi possível ler a lista de sessões.");

    const sessions = JSON.parse(match[1]);
    const index = sessions.findIndex(x=>x && x.id === session.id);
    if(index >= 0) sessions[index] = session;
    else sessions.push(session);

    const result = await putFile(
      "data/sessions.js",
      renderSessions(sessions),
      (index >= 0 ? "sessions: atualizar " : "sessions: adicionar ") + session.title,
      token,
      current.sha
    );
    const sha = result.commit && result.commit.sha;

    return json(res,200,{
      ok:true,
      repository:OWNER + "/" + REPO,
      branch:BRANCH,
      commit_sha:sha,
      commit_url:result.commit && result.commit.html_url,
      session:session,
      status_url:"/api/status?sha=" + encodeURIComponent(sha || "")
    });
  } catch(err){
    console.error(err);
    return json(res,err.status || 500,{error:"session_failed",message:err.message});
  }
};
