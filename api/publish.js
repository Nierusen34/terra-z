"use strict";

const { json, applyCors, requireEditor } = require("../server/auth");
const { installationToken, getFile, putFile, OWNER, REPO, BRANCH } = require("../server/github");

const ASSIGN_RE = /window\.TerraZData\.contentOverrides\s*=\s*(\{[\s\S]*?\});/;

function normalizeChanges(changes){
  if(!changes || typeof changes !== "object" || Array.isArray(changes)) throw new Error("changes inválido.");
  const out = {};
  const keys = Object.keys(changes);
  if(keys.length > 650) throw new Error("Muitas alterações em uma única publicação.");
  keys.forEach(function(id){
    if(!/^tz-\d{4}$/.test(id)) throw new Error("ID de edição inválido: " + id);
    const value = String(changes[id]);
    if(Buffer.byteLength(value,"utf8") > 100000) throw new Error("Conteúdo excessivamente grande: " + id);
    out[id] = value;
  });
  return out;
}

function renderOverrides(data){
  return `(function(){\n"use strict";\n\nwindow.TerraZData = window.TerraZData || {};\n\n// Alterações publicadas pelo editor visual, indexadas pelos data-edit-id permanentes.\nwindow.TerraZData.contentOverrides = ${JSON.stringify(data,null,2)};\n\n})();\n`;
}

module.exports = async function handler(req,res){
  applyCors(req,res);
  if(req.method === "OPTIONS"){ res.statusCode=204; return res.end(); }
  if(req.method !== "POST") return json(res,405,{error:"method_not_allowed"});
  if(!requireEditor(req,res)) return;

  try {
    const body = req.body || {};
    if(body.schema !== "terra-z-publish-v1" || body.type !== "content-overrides"){
      return json(res,400,{error:"unsupported_payload",message:"Payload de publicação não suportado."});
    }

    const changes = normalizeChanges(body.changes);
    if(!Object.keys(changes).length) return json(res,400,{error:"no_changes",message:"Nenhuma alteração recebida."});

    const token = await installationToken();
    const current = await getFile("data/content-overrides.js", token);
    const source = Buffer.from(current.content || "", "base64").toString("utf8");
    const match = source.match(ASSIGN_RE);
    if(!match) throw new Error("Não foi possível ler contentOverrides.");

    const existing = JSON.parse(match[1]);
    const merged = Object.assign({}, existing, changes);
    const message = String(body.message || "content: atualizar conteúdo pelo editor do Terra Z").slice(0,120);

    const result = await putFile("data/content-overrides.js", renderOverrides(merged), message, token, current.sha);
    const sha = result.commit && result.commit.sha;

    return json(res,200,{
      ok:true,
      repository:OWNER + "/" + REPO,
      branch:BRANCH,
      commit_sha:sha,
      commit_url:result.commit && result.commit.html_url,
      status_url:"/api/status?sha=" + encodeURIComponent(sha || "")
    });
  } catch(err){
    console.error(err);
    return json(res,err.status || 500,{error:"publish_failed",message:err.message});
  }
};
