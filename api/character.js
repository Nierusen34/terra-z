import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { getHead, readTextFile, readBinaryFile, commitFiles } from "./_lib/github.js";
import { parseDataAssignment, renderCharacterOverrides, renderCharacterMedia, renderCharacterTaxonomy } from "./_lib/data-files.js";
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

function extractTopLevelCharacterNames(source){
  const marker = "window.TerraZData.characters =";
  const markerIndex = source.indexOf(marker);
  if(markerIndex < 0) return [];

  const open = source.indexOf("{",markerIndex + marker.length);
  if(open < 0) return [];

  const names = [];
  let depth = 1;
  let i = open + 1;

  while(i < source.length && depth > 0){
    const ch = source[i];

    if(ch === "/" && source[i+1] === "/"){
      const nl = source.indexOf("\n",i+2);
      i = nl < 0 ? source.length : nl + 1;
      continue;
    }

    if(ch === "/" && source[i+1] === "*"){
      const end = source.indexOf("*/",i+2);
      i = end < 0 ? source.length : end + 2;
      continue;
    }

    if(ch === '"' || ch === "'"){
      const quote = ch;
      const start = i;
      i++;
      let escaped = false;

      while(i < source.length){
        const current = source[i];
        if(escaped){
          escaped = false;
        } else if(current === "\\"){
          escaped = true;
        } else if(current === quote){
          break;
        }
        i++;
      }

      const end = i;
      if(depth === 1){
        let k = end + 1;
        while(/\s/.test(source[k] || "")) k++;
        if(source[k] === ":"){
          let value = source.slice(start+1,end);
          value = value.replace(/\\(["'\\])/g,"$1");
          names.push(value);
        }
      }

      i = end + 1;
      continue;
    }

    if(ch === "{") depth++;
    else if(ch === "}") depth--;

    i++;
  }

  return names;
}

function findCaseInsensitiveKey(keys,name){
  const target = String(name).toLocaleLowerCase("pt-BR");
  return keys.find(key => String(key).toLocaleLowerCase("pt-BR") === target) || "";
}

function normalizeCharacterMeta(value,taxonomy,creating){
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const nucleiDefs = Array.isArray(taxonomy.nuclei) ? taxonomy.nuclei : [];
  const typeDefs = Array.isArray(taxonomy.types) ? taxonomy.types : [];
  const statusDefs = Array.isArray(taxonomy.statuses) ? taxonomy.statuses : [];

  const allowedNuclei = new Set(nucleiDefs.map(item => String(item && item.id || "")));
  const allowedTypes = new Set(typeDefs.map(item => String(item && item.id || "")));
  const allowedStatuses = new Set(statusDefs.map(item => String(item && item.id || "")));

  let nuclei = Array.isArray(input.nuclei)
    ? input.nuclei.map(v => String(v || "")).filter(v => allowedNuclei.has(v))
    : [];

  if(!nuclei.length && creating && allowedNuclei.has("other")) nuclei = ["other"];

  const type = allowedTypes.has(String(input.type || ""))
    ? String(input.type)
    : (creating && allowedTypes.has("npc") ? "npc" : "other");

  const status = allowedStatuses.has(String(input.status || ""))
    ? String(input.status)
    : (creating && allowedStatuses.has("active") ? "active" : "unknown");

  return {
    featured:input.featured === true,
    nuclei:[...new Set(nuclei)],
    type,
    status
  };
}

function statusUrl(req,sha){
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  return proto + "://" + req.headers.host + "/api/status?sha=" + encodeURIComponent(sha);
}

function normalizeNucleusId(value){
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .slice(0,60);
}

function normalizeNucleusDefinitions(value){
  if(!Array.isArray(value)){
    const error = new Error("Lista de núcleos inválida.");
    error.status = 400;
    error.code = "invalid_nuclei";
    throw error;
  }

  const seen = new Set();
  const items = value.slice(0,40).map(item => {
    const raw = item && typeof item === "object" ? item : {};
    const id = normalizeNucleusId(raw.id);
    const label = text(raw.label,100);

    if(!id || !label){
      const error = new Error("Todo núcleo precisa de identificador e nome.");
      error.status = 400;
      error.code = "invalid_nucleus";
      throw error;
    }

    if(id === "all" || id === "featured"){
      const error = new Error("“Todos” e “Principais” são filtros reservados do sistema.");
      error.status = 400;
      error.code = "reserved_nucleus";
      throw error;
    }

    if(seen.has(id)){
      const error = new Error("Existem núcleos com identificadores duplicados.");
      error.status = 400;
      error.code = "duplicate_nucleus";
      throw error;
    }

    seen.add(id);
    return {id,label};
  });

  if(!items.some(item => item.id === "other")){
    const error = new Error("O núcleo interno “Outros” não pode ser excluído.");
    error.status = 400;
    error.code = "missing_other_nucleus";
    throw error;
  }

  return items;
}

function applyNucleusDefinitionChanges(taxonomy,nextNuclei){
  taxonomy.nuclei = nextNuclei;

  const allowed = new Set(nextNuclei.map(item => item.id));
  const fallback = allowed.has("other") ? "other" : "";

  taxonomy.characters = taxonomy.characters && typeof taxonomy.characters === "object" && !Array.isArray(taxonomy.characters)
    ? taxonomy.characters
    : {};

  Object.keys(taxonomy.characters).forEach(name => {
    const current = taxonomy.characters[name] && typeof taxonomy.characters[name] === "object"
      ? taxonomy.characters[name]
      : {};

    let nuclei = Array.isArray(current.nuclei)
      ? current.nuclei.map(value => String(value || "")).filter(value => allowed.has(value))
      : [];

    nuclei = [...new Set(nuclei)];

    if(!nuclei.length && fallback) nuclei = [fallback];

    taxonomy.characters[name] = {
      ...current,
      nuclei
    };
  });

  return taxonomy;
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  if(req.method !== "POST" && req.method !== "DELETE"){
    res.setHeader("Allow","POST, DELETE, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }
  if(!requireEditor(req,res)) return;

  try {
    const body = req.body || {};

    if(req.method === "POST" && body.action === "update-taxonomy"){
      const metaFile = await readTextFile("data/character-meta.js");
      const taxonomy = parseDataAssignment(metaFile.content,"characterTaxonomy");
      const currentNuclei = Array.isArray(taxonomy.nuclei) ? taxonomy.nuclei : [];
      const nextNuclei = normalizeNucleusDefinitions(body.nuclei);

      const currentIds = new Set(currentNuclei.map(item => String(item && item.id || "")));
      const nextIds = new Set(nextNuclei.map(item => item.id));
      const deletedIds = [...currentIds].filter(id => id && !nextIds.has(id));

      applyNucleusDefinitionChanges(taxonomy,nextNuclei);

      const head = await getHead();
      const commit = await commitFiles(
        [{
          path:"data/character-meta.js",
          content:renderCharacterTaxonomy(taxonomy),
          encoding:"utf-8"
        }],
        "characters: atualizar filtros e núcleos",
        head
      );

      return res.status(200).json({
        ok:true,
        sha:commit.sha,
        taxonomy,
        deleted:deletedIds,
        status_url:statusUrl(req,commit.sha)
      });
    }

    const input = body.character || body || {};
    const name = text(input.name,160);
    if(!name) return res.status(400).json({error:"missing_character",message:"Personagem não informado."});

    const deleting = req.method === "DELETE";
    const creating = !deleting && input.create === true;

    const [mediaFile,overridesFile,charactersFile,metaFile] = await Promise.all([
      readTextFile("data/character-media.js"),
      readTextFile("data/character-overrides.js"),
      readTextFile("data/characters.js"),
      readTextFile("data/character-meta.js")
    ]);

    const media = parseDataAssignment(mediaFile.content,"characterMedia");
    const overrides = parseDataAssignment(overridesFile.content,"characterOverrides");
    const taxonomy = parseDataAssignment(metaFile.content,"characterTaxonomy");
    taxonomy.characters = taxonomy.characters && typeof taxonomy.characters === "object" && !Array.isArray(taxonomy.characters)
      ? taxonomy.characters
      : {};
    const baseCharacterNames = extractTopLevelCharacterNames(charactersFile.content);

    const baseExistingName = findCaseInsensitiveKey(baseCharacterNames,name);
    const overrideExistingName = findCaseInsensitiveKey(
      Object.keys(overrides).filter(key => overrides[key] && overrides[key].created === true),
      name
    );
    const mediaExistingName = findCaseInsensitiveKey(Object.keys(media),name);

    if(deleting){
      const canonicalName = baseExistingName || overrideExistingName;

      if(!canonicalName){
        return res.status(404).json({
          error:"unknown_character",
          message:"Nenhuma ficha de personagem com esse nome foi encontrada."
        });
      }

      if(baseExistingName && overrides[canonicalName] && overrides[canonicalName].deleted === true){
        return res.status(404).json({
          error:"character_already_deleted",
          message:"Este personagem já está apagado."
        });
      }

      const removedMedia = media[canonicalName] || null;
      const portraitPath = removedMedia && typeof removedMedia.src === "string"
        ? removedMedia.src.trim()
        : "";

      if(baseExistingName){
        overrides[canonicalName] = {
          deleted:true,
          deletedAt:new Date().toISOString()
        };
      } else {
        delete overrides[canonicalName];
      }

      if(taxonomy.characters) delete taxonomy.characters[canonicalName];
      delete media[canonicalName];

      const privateData = await readPrivateCharacterData();
      privateData.characters = privateData.characters && typeof privateData.characters === "object"
        ? privateData.characters
        : {};
      delete privateData.characters[canonicalName];

      const files = [
        {
          path:"data/character-overrides.js",
          content:renderCharacterOverrides(overrides),
          encoding:"utf-8"
        },
        {
          path:"data/character-meta.js",
          content:renderCharacterTaxonomy(taxonomy),
          encoding:"utf-8"
        },
        {
          path:"data/character-media.js",
          content:renderCharacterMedia(media),
          encoding:"utf-8"
        },
        {
          path:PRIVATE_CHARACTER_DATA_PATH,
          content:renderPrivateCharacterData(privateData),
          encoding:"utf-8"
        }
      ];

      if(/^images\/characters\/[a-z0-9._-]+\.(png|jpe?g|webp)$/i.test(portraitPath)){
        try {
          await readBinaryFile(portraitPath);
          files.push({
            path:portraitPath,
            delete:true
          });
        } catch(error){
          if(!error || error.status !== 404) throw error;
        }
      }

      const head = await getHead();
      const commit = await commitFiles(
        files,
        "characters: apagar " + canonicalName,
        head
      );

      return res.status(200).json({
        ok:true,
        sha:commit.sha,
        deleted:canonicalName,
        mode:baseExistingName ? "tombstone" : "removed",
        status_url:statusUrl(req,commit.sha)
      });
    }

    if(creating && (baseExistingName || overrideExistingName)){
      return res.status(409).json({error:"character_exists",message:"Já existe uma ficha de personagem com esse nome."});
    }

    if(!creating && !mediaExistingName){
      return res.status(404).json({error:"unknown_character",message:"Personagem não encontrado na base atual."});
    }

    const eyebrow = text(input.eyebrow,240);
    const sections = normalizeSections(input.sections);
    if(!sections.length){
      return res.status(400).json({error:"missing_sections",message:"A ficha precisa ter ao menos uma seção."});
    }

    const head = await getHead();
    const previousOverride = overrides[name] && typeof overrides[name] === "object" ? overrides[name] : {};

    const cardInput = input.card && typeof input.card === "object" ? input.card : null;
    const card = cardInput ? {
      icon:text(cardInput.icon,12) || "👤",
      summary:text(cardInput.summary,700)
    } : previousOverride.card;

    overrides[name] = {
      ...previousOverride,
      eyebrow,
      sections,
      ...(creating ? {created:true} : {}),
      ...(card ? {card} : {})
    };

    const characterMeta = normalizeCharacterMeta(
      input.meta || taxonomy.characters[name] || {},
      taxonomy,
      creating
    );
    taxonomy.characters[name] = characterMeta;

    const files = [
      {
        path:"data/character-overrides.js",
        content:renderCharacterOverrides(overrides),
        encoding:"utf-8"
      },
      {
        path:"data/character-meta.js",
        content:renderCharacterTaxonomy(taxonomy),
        encoding:"utf-8"
      }
    ];

    if(creating){
      if(!mediaExistingName){
        media[name] = {
          src:"",
          alt:name,
          source:"local",
          credit:""
        };
        files.push({
          path:"data/character-media.js",
          content:renderCharacterMedia(media),
          encoding:"utf-8"
        });
      }
    }

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
      creating ? "characters: criar " + name : "characters: atualizar ficha de " + name,
      head
    );

    return res.status(200).json({
      ok:true,
      sha:commit.sha,
      character:{
        name,
        ...overrides[name]
      },
      meta:characterMeta,
      media:media[name] || null,
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
