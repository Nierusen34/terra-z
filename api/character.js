import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { getHead, readTextFile, commitFiles } from "./_lib/github.js";
import { parseDataAssignment, renderCharacterOverrides } from "./_lib/data-files.js";
import {
  PRIVATE_CHARACTER_DATA_PATH,
  readPrivateCharacterData,
  renderPrivateCharacterData
} from "./_lib/private-character-data.js";

const ALLOWED_TAGS = new Set(["p","br","strong","em","b","i","u","s","ul","ol","li","small","blockquote","a"]);

function text(value,max=2000){
  return String(value == null ? "" : value).replace(/[<>]/g,"").trim().slice(0,max);
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
  if(compact.startsWith("javascript:") || compact.startsWith("data:") || compact.startsWith("vbscript:")) return "";

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
  if(closing) return tag === "br" ? "" : "</" + tag + ">";
  if(tag === "br") return "<br>";

  const attrs = [];
  if(tag === "a"){
    parseAttributes(rawAttributes).forEach(attr => {
      if(attr.name === "href"){
        const href = safeHref(attr.value);
        if(href) attrs.push('href="' + escapeAttribute(href) + '"');
      } else if(attr.name === "title"){
        attrs.push('title="' + escapeAttribute(String(attr.value).slice(0,300)) + '"');
      }
    });
  }

  return "<" + tag + (attrs.length ? " " + attrs.join(" ") : "") + ">";
}

function sanitizeHtml(value){
  let input = String(value == null ? "" : value);
  if(input.length > 60000){
    const error = new Error("Uma seção excede o limite permitido.");
    error.status = 413;
    error.code = "section_too_large";
    throw error;
  }

  input = input
    .replace(/<!--[\s\S]*?-->/g,"")
    .replace(/<![^>]*>/g,"")
    .replace(/<\?[^>]*>/g,"");

  return input.replace(/<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b([^<>]*?)\/?\s*>/g,
    function(full, slash, tagName, attrs){
      return sanitizeTag(tagName,attrs,slash === "/");
    }
  ).trim();
}

function normalizeSections(value){
  if(!Array.isArray(value)) return [];
  return value.slice(0,20).map(section => ({
    title:text(section && section.title,160),
    content:sanitizeHtml(section && section.content)
  })).filter(section => section.title || section.content);
}

function normalizeSecrets(value){
  if(!Array.isArray(value)) return null;
  return value
    .slice(0,80)
    .map(item => text(item,2000))
    .filter(Boolean);
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
    const input = (req.body || {}).character || req.body || {};
    const name = text(input.name,160);
    if(!name) return res.status(400).json({error:"missing_character",message:"Personagem não informado."});

    const mediaFile = await readTextFile("data/character-media.js");
    const media = parseDataAssignment(mediaFile.content,"characterMedia");
    if(!Object.prototype.hasOwnProperty.call(media,name)){
      return res.status(404).json({error:"unknown_character",message:"Personagem não encontrado na base atual."});
    }

    const eyebrow = text(input.eyebrow,240);
    const sections = normalizeSections(input.sections);
    if(!sections.length){
      return res.status(400).json({error:"missing_sections",message:"A ficha precisa ter ao menos uma seção."});
    }

    const head = await getHead();
    const overridesFile = await readTextFile("data/character-overrides.js");
    const overrides = parseDataAssignment(overridesFile.content,"characterOverrides");
    overrides[name] = {eyebrow,sections};

    const files = [
      {
        path:"data/character-overrides.js",
        content:renderCharacterOverrides(overrides),
        encoding:"utf-8"
      }
    ];

    const secrets = normalizeSecrets(input.secrets);
    if(secrets !== null){
      const privateData = await readPrivateCharacterData();
      privateData.characters = privateData.characters || {};
      privateData.characters[name] = {
        ...(privateData.characters[name] || {}),
        secrets
      };
      files.push({
        path:PRIVATE_CHARACTER_DATA_PATH,
        content:renderPrivateCharacterData(privateData),
        encoding:"utf-8"
      });
    }

    const commit = await commitFiles(
      files,
      "characters: atualizar ficha de " + name,
      head
    );

    return res.status(200).json({
      ok:true,
      sha:commit.sha,
      status_url:statusUrl(req,commit.sha)
    });
  } catch(error){
    console.error(error);
    return res.status(error.status || 500).json({
      error:error.code || "character_update_failed",
      message:error.status ? error.message : "Falha ao atualizar a ficha do personagem."
    });
  }
}
