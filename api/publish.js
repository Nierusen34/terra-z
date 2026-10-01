import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import {
  getHead,
  readTextFile,
  commitFiles,
  listCommits,
  compareCommits,
  createCheckpointCommit,
  restoreContentSnapshot
} from "./_lib/github.js";
import { parseDataAssignment, renderContentOverrides } from "./_lib/data-files.js";

const ALLOWED_TAGS = new Set(["br","strong","em","b","i","u","s","ul","ol","li","span","a","small","sup","sub","blockquote","code"]);
const VOID_TAGS = new Set(["br"]);

const RESTORABLE_CONTENT_PATHS = [
  "data/content-overrides.js",
  "data/character-overrides.js",
  "data/character-meta.js",
  "data/character-media.js",
  "data/graph-overrides.js",
  "data/sessions.js",
  "data/private-character-data.enc.json",
  "data/private-sessions.enc.json"
];

const RESTORABLE_CONTENT_PREFIXES = [
  "images/characters/"
];

function shortSha(value){
  return String(value || "").slice(0,7);
}

function safeCheckpointLabel(value){
  return String(value || "")
    .replace(/[\r\n\t]+/g," ")
    .replace(/\s+/g," ")
    .trim()
    .slice(0,80);
}

function commitKind(message){
  const text=String(message || "").toLowerCase();
  if(text.includes("[vercel-hook]")) return "deploy";
  if(text.startsWith("restore:")) return "restore";
  if(text.startsWith("characters:")) return "character";
  if(text.startsWith("sessions:") || text.startsWith("session:")) return "session";
  if(text.startsWith("relations:")) return "graph";
  if(text.startsWith("content:")) return "content";
  if(text.startsWith("security:")) return "security";
  if(text.startsWith("media:")) return "media";
  if(text.startsWith("ci:") || text.startsWith("test:")) return "quality";
  if(text.startsWith("fix:")) return "fix";
  if(text.startsWith("feat:")) return "feature";
  return "system";
}

function historyRow(item,productionSha,headSha){
  const commit=item && item.commit || {};
  const author=commit.author || {};
  const message=String(commit.message || "").split("\n")[0].slice(0,180);

  return {
    sha:String(item.sha || ""),
    short_sha:shortSha(item.sha),
    message,
    kind:commitKind(message),
    date:String(author.date || ""),
    author:String(author.name || ""),
    is_head:String(item.sha || "") === headSha,
    is_production:String(item.sha || "") === productionSha,
    is_checkpoint:/\[vercel-hook\]/i.test(message)
  };
}

function syncState(compare,productionSha,headSha){
  if(!productionSha || !/^[a-f0-9]{40}$/i.test(productionSha)) return "unknown";
  if(productionSha === headSha) return "synced";
  if(compare && compare.status === "ahead") return "development";
  if(compare && compare.status === "identical") return "synced";
  if(compare && compare.status === "diverged") return "diverged";
  return "development";
}

function escapeAttribute(value){
  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/"/g,"&quot;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");
}

function parseAttributes(raw){
  const attrs = [];
  const re = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+))/g;
  let match;
  while((match = re.exec(raw || ""))){
    attrs.push({
      name:String(match[1] || "").toLowerCase(),
      value:match[2] ?? match[3] ?? match[4] ?? ""
    });
  }
  return attrs;
}

function safeHref(value){
  const raw = String(value || "").trim();
  if(!raw) return "";
  const compact = raw.replace(/[\u0000-\u0020\u007f]+/g,"").toLowerCase();

  if(compact.startsWith("javascript:") ||
     compact.startsWith("data:") ||
     compact.startsWith("vbscript:")){
    return "";
  }

  if(/^https?:\/\//i.test(raw) ||
     /^mailto:/i.test(raw) ||
     raw.startsWith("#") ||
     raw.startsWith("/") ||
     raw.startsWith("./") ||
     raw.startsWith("../") ||
     !/^[a-z][a-z0-9+.-]*:/i.test(raw)){
    return raw;
  }

  return "";
}

function sanitizeTag(tagName, rawAttributes, closing){
  const tag = String(tagName || "").toLowerCase();
  if(!ALLOWED_TAGS.has(tag)) return "";

  if(closing){
    return VOID_TAGS.has(tag) ? "" : "</" + tag + ">";
  }

  if(tag === "br") return "<br>";

  const safe = [];

  if(tag === "a"){
    parseAttributes(rawAttributes).forEach(attr => {
      if(attr.name === "href"){
        const href = safeHref(attr.value);
        if(href) safe.push('href="' + escapeAttribute(href) + '"');
      } else if(attr.name === "title"){
        safe.push('title="' + escapeAttribute(attr.value.slice(0,500)) + '"');
      } else if(attr.name === "target"){
        const target = String(attr.value).toLowerCase();
        if(target === "_blank" || target === "_self"){
          safe.push('target="' + target + '"');
        }
      } else if(attr.name === "rel"){
        const rel = String(attr.value)
          .split(/\s+/)
          .map(v => v.toLowerCase())
          .filter(v => ["noopener","noreferrer","nofollow"].includes(v));
        if(rel.length) safe.push('rel="' + [...new Set(rel)].join(" ") + '"');
      }
    });

    if(safe.some(attr => attr === 'target="_blank"') &&
       !safe.some(attr => /^rel=/.test(attr))){
      safe.push('rel="noopener noreferrer"');
    }
  } else if(tag === "span"){
    parseAttributes(rawAttributes).forEach(attr => {
      if(attr.name !== "class") return;
      const classes = String(attr.value)
        .split(/\s+/)
        .filter(v => /^[a-z0-9_-]{1,64}$/i.test(v))
        .slice(0,8);
      if(classes.length) safe.push('class="' + escapeAttribute(classes.join(" ")) + '"');
    });
  }

  return "<" + tag + (safe.length ? " " + safe.join(" ") : "") + ">";
}

function sanitizeValue(value){
  if(typeof value !== "string"){
    const error = new Error("Conteúdo editado precisa ser texto.");
    error.code = "invalid_content_value";
    error.status = 400;
    throw error;
  }

  if(value.length > 100000){
    const error = new Error("Um dos campos excede o limite de 100 mil caracteres.");
    error.code = "content_too_large";
    error.status = 413;
    throw error;
  }

  let output = value
    .replace(/<!--[\s\S]*?-->/g,"")
    .replace(/<![^>]*>/g,"")
    .replace(/<\?[^>]*>/g,"");

  output = output.replace(/<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b([^<>]*?)\/?\s*>/g,
    function(full, slash, tagName, attrs){
      return sanitizeTag(tagName, attrs, slash === "/");
    }
  );

  return output;
}

function statusUrl(req,sha){
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = req.headers.host;
  return proto + "://" + host + "/api/status?sha=" + encodeURIComponent(sha);
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  if(req.method !== "GET" && req.method !== "POST"){
    res.setHeader("Allow","GET, POST, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }
  if(!requireEditor(req,res)) return;

  try {
    if(req.method === "GET"){
      const limit=Math.max(10,Math.min(Number((req.query || {}).limit) || 40,80));
      const head=await getHead();
      const productionSha=String(process.env.VERCEL_GIT_COMMIT_SHA || "");
      const [commits,comparison,vercelConfigFile]=await Promise.all([
        listCommits(limit),
        productionSha && /^[a-f0-9]{40}$/i.test(productionSha)
          ? compareCommits(productionSha,head).catch(()=>null)
          : Promise.resolve(null),
        readTextFile("vercel.json").catch(()=>null)
      ]);

      const state=syncState(comparison,productionSha,head);
      let autoDeployPaused=null;
      if(vercelConfigFile){
        try{
          const parsed=JSON.parse(vercelConfigFile.content);
          autoDeployPaused=!!(parsed.git && parsed.git.deploymentEnabled === false);
        }catch{}
      }

      res.setHeader("Cache-Control","no-store, max-age=0");
      return res.status(200).json({
        ok:true,
        head_sha:head,
        production_sha:productionSha,
        deployment_env:String(process.env.VERCEL_ENV || ""),
        auto_deploy_paused:autoDeployPaused,
        sync:{
          state,
          ahead_by:Number(comparison && comparison.ahead_by || 0),
          behind_by:Number(comparison && comparison.behind_by || 0),
          total_commits:Number(comparison && comparison.total_commits || 0)
        },
        capabilities:{
          restore_content:true,
          deploy_checkpoint:true,
          restore_scope:"managed-content-v1"
        },
        history:(Array.isArray(commits) ? commits : []).map(item =>
          historyRow(item,productionSha,head)
        )
      });
    }

    const body = req.body || {};

    if(body.action === "restore-content"){
      if(body.confirm !== true){
        return res.status(400).json({
          error:"confirmation_required",
          message:"Confirme a restauração antes de continuar."
        });
      }

      const targetSha=String(body.target_sha || "");
      const expectedHead=String(body.expected_head || "");
      const restored=await restoreContentSnapshot(targetSha,expectedHead,{
        paths:RESTORABLE_CONTENT_PATHS,
        prefixes:RESTORABLE_CONTENT_PREFIXES,
        message:"restore: restaurar conteúdo de " + shortSha(targetSha)
      });

      return res.status(200).json({
        ok:true,
        action:"restore-content",
        sha:restored.sha,
        source_sha:restored.sourceSha,
        changed_paths:restored.changedPaths,
        deleted_paths:restored.deletedPaths,
        status_url:statusUrl(req,restored.sha)
      });
    }

    if(body.action === "deploy-checkpoint"){
      const expectedHead=String(body.expected_head || "");
      const label=safeCheckpointLabel(body.label);
      const message="[vercel-hook] deploy: checkpoint" + (label ? " — " + label : "");
      const checkpoint=await createCheckpointCommit(message,expectedHead);

      const proto=String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
      const host=req.headers.host;
      return res.status(200).json({
        ok:true,
        action:"deploy-checkpoint",
        sha:checkpoint.sha,
        previous_head:checkpoint.previousHead,
        vercel_status_url:proto + "://" + host + "/api/status?kind=vercel&sha=" + encodeURIComponent(checkpoint.sha),
        pages_status_url:statusUrl(req,checkpoint.sha)
      });
    }

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
    for(const id of ids){
      merged[id] = await sanitizeValue(changes[id]);
    }

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
    let message = error.message || "Falha ao publicar.";
    if(status === 500){
      if(/Estrutura de dados não encontrada|Valor JSON|JSON/i.test(message)){
        message = "O arquivo de conteúdo publicado está em formato inválido.";
      } else if(/GitHub API/i.test(message)){
        message = "Falha ao publicar no GitHub.";
      } else {
        message = "Falha interna ao preparar a publicação.";
      }
    }

    return res.status(status).json({
      error:error.code || "publish_failed",
      message,
      current_head:error.currentHead || undefined,
      missing_paths:error.missingPaths || undefined
    });
  }
}
