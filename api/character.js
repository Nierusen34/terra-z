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
  return value.slice(0,20).map((section,index) => {
    const raw=String(section && section.visibility || "public");
    const visibility=raw === "master"
      ? "master"
      : (raw === "spoiler" || raw === "rumor" || raw === "restricted" ? "spoiler" : "public");
    return {
      title:text(section && section.title,160),
      content:sanitizeHtml(section && section.content),
      visibility,
      position:index
    };
  }).filter(section => section.title || section.content);
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

  const tagDefs = Array.isArray(taxonomy.tags) ? taxonomy.tags : [];
  const allowedTags = new Set(tagDefs.map(item => String(item && item.id || "")));
  const tags = Array.isArray(input.tags)
    ? [...new Set(input.tags.map(v => String(v || "")).filter(v => allowedTags.has(v)))]
    : [];

  return {
    featured:input.featured === true,
    nuclei:[...new Set(nuclei)],
    type,
    status,
    tags,
    visibility:(input.visibility === "master" || input.visibility === "private")
      ? "master"
      : (input.visibility === "spoiler" ? "spoiler" : "public")
  };
}

const PRIVATE_MIME_BY_EXT = {
  png:"image/png",
  jpg:"image/jpeg",
  jpeg:"image/jpeg",
  webp:"image/webp"
};
const PRIVATE_EXT_BY_MIME = {
  "image/png":"png",
  "image/jpeg":"jpg",
  "image/webp":"webp"
};

function privateSlug(value){
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .replace(/['’]/g,"")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .slice(0,80);
}

async function capturePrivatePortrait(mediaEntry){
  const media=mediaEntry && typeof mediaEntry === "object"
    ? {...mediaEntry}
    : null;
  const src=media && typeof media.src === "string" ? media.src.trim() : "";

  if(!src || !/^images\/characters\/[a-z0-9._-]+\.(png|jpe?g|webp)$/i.test(src)){
    return {media,privatePortrait:null,deletePath:""};
  }

  const file=await readBinaryFile(src);
  const ext=src.split(".").pop().toLowerCase();
  const mime=PRIVATE_MIME_BY_EXT[ext] || "image/jpeg";

  return {
    media:{...media,src:"",source:"private"},
    privatePortrait:{
      mime,
      dataBase64:file.buffer.toString("base64")
    },
    deletePath:src
  };
}

function publicPortraitFromPrivate(name,profile){
  const portrait=profile && profile.privatePortrait;
  if(!portrait || !portrait.mime || !portrait.dataBase64) return null;
  const ext=PRIVATE_EXT_BY_MIME[portrait.mime];
  if(!ext) return null;

  const path="images/characters/" + privateSlug(name) + "." + ext;
  return {
    path,
    content:portrait.dataBase64,
    media:{
      ...(profile.media && typeof profile.media === "object" ? profile.media : defaultCharacterMedia(name)),
      src:path,
      source:"local"
    }
  };
}

function defaultCharacterMedia(name){
  return {src:"",alt:name,source:"local",credit:""};
}

function privateProfile(entry){
  return entry && entry.profile && typeof entry.profile === "object" && !Array.isArray(entry.profile)
    ? entry.profile
    : null;
}

function cleanPrivateEntry(container,name){
  const entry=container[name];
  if(!entry || typeof entry !== "object") return;
  const hasSecrets=Array.isArray(entry.secrets) && entry.secrets.length > 0;
  const hasProfile=!!privateProfile(entry);
  const hasMasterSections=Array.isArray(entry.masterSections) && entry.masterSections.length > 0;
  if(!hasSecrets && !hasProfile && !hasMasterSections) delete container[name];
}

function statusUrl(req,sha){
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  return proto + "://" + req.headers.host + "/api/status?sha=" + encodeURIComponent(sha);
}

function normalizeTaxonomyId(value){
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .slice(0,60);
}

const TAXONOMY_RULES = {
  nuclei:{max:40,required:"other",reserved:new Set(["all","featured"])},
  types:{max:30,required:"other",reserved:new Set()},
  statuses:{max:30,required:"unknown",reserved:new Set()},
  tags:{max:80,required:"",reserved:new Set()}
};

function normalizeDefinitionList(kind,value){
  const rule=TAXONOMY_RULES[kind];
  if(!rule || !Array.isArray(value)){
    const error=new Error("Lista de taxonomia inválida.");
    error.status=400;
    error.code="invalid_taxonomy";
    throw error;
  }

  const seen=new Set();
  const items=value.slice(0,rule.max).map(item=>{
    const raw=item && typeof item==="object" ? item : {};
    const id=normalizeTaxonomyId(raw.id);
    const label=text(raw.label,100);

    if(!id || !label){
      const error=new Error("Toda categoria precisa de identificador e nome.");
      error.status=400;
      error.code="invalid_taxonomy_item";
      throw error;
    }
    if(rule.reserved.has(id)){
      const error=new Error("Este identificador é reservado pelo sistema: "+id);
      error.status=400;
      error.code="reserved_taxonomy_id";
      throw error;
    }
    if(seen.has(id)){
      const error=new Error("Existem categorias com identificadores duplicados.");
      error.status=400;
      error.code="duplicate_taxonomy_id";
      throw error;
    }

    seen.add(id);
    return {id,label};
  });

  if(rule.required && !items.some(item=>item.id===rule.required)){
    const error=new Error("A categoria interna “"+rule.required+"” não pode ser excluída.");
    error.status=400;
    error.code="missing_required_taxonomy";
    throw error;
  }

  return items;
}

function reconcileTaxonomyCharacters(taxonomy){
  taxonomy.characters=taxonomy.characters && typeof taxonomy.characters==="object" && !Array.isArray(taxonomy.characters)
    ? taxonomy.characters
    : {};

  const nuclei=new Set((taxonomy.nuclei||[]).map(item=>item.id));
  const types=new Set((taxonomy.types||[]).map(item=>item.id));
  const statuses=new Set((taxonomy.statuses||[]).map(item=>item.id));
  const tags=new Set((taxonomy.tags||[]).map(item=>item.id));

  Object.keys(taxonomy.characters).forEach(name=>{
    const current=taxonomy.characters[name] && typeof taxonomy.characters[name]==="object"
      ? taxonomy.characters[name]
      : {};

    let characterNuclei=Array.isArray(current.nuclei)
      ? [...new Set(current.nuclei.map(String).filter(id=>nuclei.has(id)))]
      : [];
    if(!characterNuclei.length && nuclei.has("other")) characterNuclei=["other"];

    taxonomy.characters[name]={
      ...current,
      nuclei:characterNuclei,
      type:types.has(String(current.type||"")) ? String(current.type) : (types.has("other") ? "other" : ""),
      status:statuses.has(String(current.status||"")) ? String(current.status) : (statuses.has("unknown") ? "unknown" : ""),
      tags:Array.isArray(current.tags)
        ? [...new Set(current.tags.map(String).filter(id=>tags.has(id)))]
        : []
    };
  });

  return taxonomy;
}

function normalizeTaxonomyPayload(current,body){
  const next={
    ...current,
    nuclei:normalizeDefinitionList("nuclei",body.nuclei),
    types:normalizeDefinitionList("types",body.types),
    statuses:normalizeDefinitionList("statuses",body.statuses),
    tags:normalizeDefinitionList("tags",body.tags || [])
  };
  return reconcileTaxonomyCharacters(next);
}

function applyMetaPatch(meta,patch,taxonomy,isPrivate){
  const current=meta && typeof meta==="object" ? meta : {};
  const nucleiAllowed=new Set((taxonomy.nuclei||[]).map(item=>item.id));
  const typesAllowed=new Set((taxonomy.types||[]).map(item=>item.id));
  const statusesAllowed=new Set((taxonomy.statuses||[]).map(item=>item.id));
  const tagsAllowed=new Set((taxonomy.tags||[]).map(item=>item.id));

  let nuclei=Array.isArray(current.nuclei) ? current.nuclei.filter(id=>nucleiAllowed.has(id)) : [];
  let tags=Array.isArray(current.tags) ? current.tags.filter(id=>tagsAllowed.has(id)) : [];

  if(Array.isArray(patch.nucleiReplace)){
    nuclei=[...new Set(patch.nucleiReplace.map(String).filter(id=>nucleiAllowed.has(id)))];
  }
  if(Array.isArray(patch.nucleiAdd)){
    nuclei=[...new Set(nuclei.concat(patch.nucleiAdd.map(String).filter(id=>nucleiAllowed.has(id))))];
  }
  if(Array.isArray(patch.nucleiRemove)){
    const remove=new Set(patch.nucleiRemove.map(String));
    nuclei=nuclei.filter(id=>!remove.has(id));
  }
  if(!nuclei.length && nucleiAllowed.has("other")) nuclei=["other"];

  if(Array.isArray(patch.tagsReplace)){
    tags=[...new Set(patch.tagsReplace.map(String).filter(id=>tagsAllowed.has(id)))];
  }
  if(Array.isArray(patch.tagsAdd)){
    tags=[...new Set(tags.concat(patch.tagsAdd.map(String).filter(id=>tagsAllowed.has(id))))];
  }
  if(Array.isArray(patch.tagsRemove)){
    const remove=new Set(patch.tagsRemove.map(String));
    tags=tags.filter(id=>!remove.has(id));
  }

  const next={
    ...current,
    nuclei,
    tags
  };

  if(typesAllowed.has(String(patch.type||""))) next.type=String(patch.type);
  if(statusesAllowed.has(String(patch.status||""))) next.status=String(patch.status);
  if(!typesAllowed.has(String(next.type||""))) next.type=typesAllowed.has("other") ? "other" : "";
  if(!statusesAllowed.has(String(next.status||""))) next.status=statusesAllowed.has("unknown") ? "unknown" : "";
  if(typeof patch.featured==="boolean") next.featured=patch.featured;

  if(!isPrivate && (patch.visibility==="public" || patch.visibility==="spoiler")){
    next.visibility=patch.visibility;
  }
  if(isPrivate) next.visibility="master";

  return next;
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  res.setHeader("Cache-Control","no-store, max-age=0");
  if(req.method !== "POST" && req.method !== "DELETE"){
    res.setHeader("Allow","POST, DELETE, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }
  if(!requireEditor(req,res)) return;

  try {
    const body = req.body || {};

    if(req.method === "POST" && body.action === "migrate-private-characters"){
      const [mediaFile,overridesFile,metaFile,privateData] = await Promise.all([
        readTextFile("data/character-media.js"),
        readTextFile("data/character-overrides.js"),
        readTextFile("data/character-meta.js"),
        readPrivateCharacterData()
      ]);

      const media=parseDataAssignment(mediaFile.content,"characterMedia");
      const overrides=parseDataAssignment(overridesFile.content,"characterOverrides");
      const taxonomy=parseDataAssignment(metaFile.content,"characterTaxonomy");
      taxonomy.characters=taxonomy.characters && typeof taxonomy.characters === "object" && !Array.isArray(taxonomy.characters)
        ? taxonomy.characters
        : {};
      privateData.characters=privateData.characters && typeof privateData.characters === "object" && !Array.isArray(privateData.characters)
        ? privateData.characters
        : {};

      const migrated=[];
      const privateDeletes=[];

      for(const name of Object.keys(taxonomy.characters)){
        const meta=taxonomy.characters[name] || {};
        if(meta.visibility !== "private" && meta.visibility !== "master") continue;

        const override=overrides[name] && typeof overrides[name] === "object" ? overrides[name] : null;
        if(!override || override.deleted === true) continue;

        const previous=privateData.characters[name] && typeof privateData.characters[name] === "object"
          ? privateData.characters[name]
          : {};
        const currentMedia=media[name] && typeof media[name] === "object"
          ? media[name]
          : defaultCharacterMedia(name);
        const captured=await capturePrivatePortrait(currentMedia);

        privateData.characters[name]={
          ...previous,
          profile:{
            version:1,
            eyebrow:String(override.eyebrow || ""),
            sections:Array.isArray(override.sections) ? override.sections : [],
            card:override.card && typeof override.card === "object" ? override.card : {},
            meta:{...meta,visibility:"master"},
            media:captured.media || defaultCharacterMedia(name),
            ...(captured.privatePortrait ? {privatePortrait:captured.privatePortrait} : {})
          }
        };

        if(captured.deletePath) privateDeletes.push({path:captured.deletePath,delete:true});

        delete overrides[name];
        delete taxonomy.characters[name];
        delete media[name];
        migrated.push(name);
      }

      if(!migrated.length){
        return res.status(200).json({ok:true,migrated:[],message:"Nenhum personagem aguardando migração privada."});
      }

      const head=await getHead();
      const commit=await commitFiles([
        {path:"data/character-overrides.js",content:renderCharacterOverrides(overrides),encoding:"utf-8"},
        {path:"data/character-meta.js",content:renderCharacterTaxonomy(taxonomy),encoding:"utf-8"},
        {path:"data/character-media.js",content:renderCharacterMedia(media),encoding:"utf-8"},
        {path:PRIVATE_CHARACTER_DATA_PATH,content:renderPrivateCharacterData(privateData),encoding:"utf-8"},
        ...privateDeletes
      ],"security: migrar personagens privados para armazenamento criptografado",head);

      return res.status(200).json({
        ok:true,
        sha:commit.sha,
        migrated,
        status_url:statusUrl(req,commit.sha)
      });
    }

    if(req.method === "POST" && body.action === "update-taxonomy"){
      const [metaFile,privateData]=await Promise.all([
        readTextFile("data/character-meta.js"),
        readPrivateCharacterData()
      ]);
      const current=parseDataAssignment(metaFile.content,"characterTaxonomy");
      const taxonomy=normalizeTaxonomyPayload(current,body);

      privateData.characters=privateData.characters && typeof privateData.characters==="object" && !Array.isArray(privateData.characters)
        ? privateData.characters
        : {};

      for(const name of Object.keys(privateData.characters)){
        const profile=privateProfile(privateData.characters[name]);
        if(!profile) continue;
        profile.meta=applyMetaPatch(profile.meta||{}, {
          nucleiReplace:Array.isArray(profile.meta&&profile.meta.nuclei) ? profile.meta.nuclei : [],
          tagsReplace:Array.isArray(profile.meta&&profile.meta.tags) ? profile.meta.tags : [],
          type:String(profile.meta&&profile.meta.type||""),
          status:String(profile.meta&&profile.meta.status||"")
        },taxonomy,true);
      }

      const head=await getHead();
      const commit=await commitFiles([
        {
          path:"data/character-meta.js",
          content:renderCharacterTaxonomy(taxonomy),
          encoding:"utf-8"
        },
        {
          path:PRIVATE_CHARACTER_DATA_PATH,
          content:renderPrivateCharacterData(privateData),
          encoding:"utf-8"
        }
      ],"characters: atualizar taxonomias do universo",head);

      return res.status(200).json({
        ok:true,
        sha:commit.sha,
        taxonomy,
        status_url:statusUrl(req,commit.sha)
      });
    }

    if(req.method === "POST" && body.action === "bulk-update-meta"){
      const names=Array.isArray(body.characters)
        ? [...new Set(body.characters.map(name=>text(name,160)).filter(Boolean))].slice(0,300)
        : [];
      if(!names.length){
        return res.status(400).json({error:"missing_characters",message:"Selecione ao menos um personagem."});
      }

      const [metaFile,privateData]=await Promise.all([
        readTextFile("data/character-meta.js"),
        readPrivateCharacterData()
      ]);
      const taxonomy=parseDataAssignment(metaFile.content,"characterTaxonomy");
      taxonomy.tags=Array.isArray(taxonomy.tags) ? taxonomy.tags : [];
      taxonomy.characters=taxonomy.characters && typeof taxonomy.characters==="object" && !Array.isArray(taxonomy.characters)
        ? taxonomy.characters
        : {};
      privateData.characters=privateData.characters && typeof privateData.characters==="object" && !Array.isArray(privateData.characters)
        ? privateData.characters
        : {};

      const patch=body.patch && typeof body.patch==="object" && !Array.isArray(body.patch) ? body.patch : {};
      const updated=[];
      const skipped=[];

      for(const requestedName of names){
        const publicName=findCaseInsensitiveKey(Object.keys(taxonomy.characters),requestedName);
        const privateName=findCaseInsensitiveKey(
          Object.keys(privateData.characters).filter(key=>privateProfile(privateData.characters[key])),
          requestedName
        );

        if(publicName){
          taxonomy.characters[publicName]=applyMetaPatch(taxonomy.characters[publicName],patch,taxonomy,false);
          updated.push(publicName);
          continue;
        }

        if(privateName){
          const profile=privateProfile(privateData.characters[privateName]);
          profile.meta=applyMetaPatch(profile.meta,patch,taxonomy,true);
          updated.push(privateName);
          continue;
        }

        skipped.push(requestedName);
      }

      if(!updated.length){
        return res.status(404).json({error:"no_characters_updated",message:"Nenhum personagem selecionado pôde ser atualizado.",skipped});
      }

      const head=await getHead();
      const commit=await commitFiles([
        {path:"data/character-meta.js",content:renderCharacterTaxonomy(taxonomy),encoding:"utf-8"},
        {path:PRIVATE_CHARACTER_DATA_PATH,content:renderPrivateCharacterData(privateData),encoding:"utf-8"}
      ],"characters: edição em lote de "+updated.length+" personagens",head);

      return res.status(200).json({
        ok:true,
        sha:commit.sha,
        updated,
        skipped,
        taxonomy,
        status_url:statusUrl(req,commit.sha)
      });
    }

    const input = body.character || body || {};
    const name = text(input.name,160);
    if(!name) return res.status(400).json({error:"missing_character",message:"Personagem não informado."});

    const deleting = req.method === "DELETE";
    const creating = !deleting && input.create === true;

    const [mediaFile,overridesFile,charactersFile,metaFile,privateData] = await Promise.all([
      readTextFile("data/character-media.js"),
      readTextFile("data/character-overrides.js"),
      readTextFile("data/characters.js"),
      readTextFile("data/character-meta.js"),
      readPrivateCharacterData()
    ]);

    const media = parseDataAssignment(mediaFile.content,"characterMedia");
    const overrides = parseDataAssignment(overridesFile.content,"characterOverrides");
    const taxonomy = parseDataAssignment(metaFile.content,"characterTaxonomy");
    taxonomy.characters = taxonomy.characters && typeof taxonomy.characters === "object" && !Array.isArray(taxonomy.characters)
      ? taxonomy.characters
      : {};
    const baseCharacterNames = extractTopLevelCharacterNames(charactersFile.content);
    privateData.characters = privateData.characters && typeof privateData.characters === "object" && !Array.isArray(privateData.characters)
      ? privateData.characters
      : {};

    const baseExistingName = findCaseInsensitiveKey(baseCharacterNames,name);
    const overrideExistingName = findCaseInsensitiveKey(
      Object.keys(overrides).filter(key => overrides[key] && overrides[key].created === true),
      name
    );
    const mediaExistingName = findCaseInsensitiveKey(Object.keys(media),name);
    const privateExistingName = findCaseInsensitiveKey(
      Object.keys(privateData.characters).filter(key => privateProfile(privateData.characters[key])),
      name
    );

    if(deleting){
      const canonicalName = baseExistingName || overrideExistingName || privateExistingName;

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

      const removedPrivateProfile = privateProfile(privateData.characters[canonicalName]);
      const removedMedia = media[canonicalName] || (removedPrivateProfile && removedPrivateProfile.media) || null;
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

    if(creating && (baseExistingName || overrideExistingName || privateExistingName)){
      return res.status(409).json({error:"character_exists",message:"Já existe uma ficha de personagem com esse nome."});
    }

    if(!creating && !(baseExistingName || overrideExistingName || privateExistingName || mediaExistingName)){
      return res.status(404).json({error:"unknown_character",message:"Personagem não encontrado na base atual."});
    }

    const eyebrow = text(input.eyebrow,240);
    const sections = normalizeSections(input.sections);
    if(!sections.length){
      return res.status(400).json({error:"missing_sections",message:"A ficha precisa ter ao menos uma seção."});
    }

    const head = await getHead();
    const previousPrivateEntry = privateData.characters[name] && typeof privateData.characters[name] === "object"
      ? privateData.characters[name]
      : {};
    const previousPrivateProfile = privateProfile(previousPrivateEntry);
    const previousOverride = overrides[name] && typeof overrides[name] === "object"
      ? overrides[name]
      : (previousPrivateProfile ? {
          eyebrow:previousPrivateProfile.eyebrow || "",
          sections:Array.isArray(previousPrivateProfile.sections) ? previousPrivateProfile.sections : [],
          card:previousPrivateProfile.card || {},
          created:true
        } : {});

    const cardInput = input.card && typeof input.card === "object" ? input.card : null;
    const card = cardInput ? {
      icon:text(cardInput.icon,12) || "👤",
      codename:text(cardInput.codename,160),
      age:text(cardInput.age,160),
      origin:text(cardInput.origin,200),
      status:text(cardInput.status,200)
    } : previousOverride.card;

    const characterMeta = normalizeCharacterMeta(
      input.meta ||
      (previousPrivateProfile && previousPrivateProfile.meta) ||
      taxonomy.characters[name] ||
      {},
      taxonomy,
      creating
    );

    const secrets = normalizeSecrets(input.secrets);
    const files = [];
    const existingMedia = media[name] && typeof media[name] === "object"
      ? media[name]
      : (previousPrivateProfile && previousPrivateProfile.media) || defaultCharacterMedia(name);

    const publicSections=sections.filter(section => section.visibility !== "master");
    const masterSections=sections.filter(section => section.visibility === "master");

    if(characterMeta.visibility === "master"){
      const captured=previousPrivateProfile
        ? {media:existingMedia,privatePortrait:previousPrivateProfile.privatePortrait || null,deletePath:""}
        : await capturePrivatePortrait(existingMedia);

      privateData.characters[name] = {
        ...previousPrivateEntry,
        ...(secrets !== null ? {secrets} : {}),
        profile:{
          version:1,
          eyebrow,
          sections,
          card:card || {},
          meta:{...characterMeta,visibility:"master"},
          media:captured.media || defaultCharacterMedia(name),
          ...(captured.privatePortrait ? {privatePortrait:captured.privatePortrait} : {})
        }
      };

      delete overrides[name];
      delete taxonomy.characters[name];
      delete media[name];

      files.push(
        {path:"data/character-overrides.js",content:renderCharacterOverrides(overrides),encoding:"utf-8"},
        {path:"data/character-meta.js",content:renderCharacterTaxonomy(taxonomy),encoding:"utf-8"},
        {path:"data/character-media.js",content:renderCharacterMedia(media),encoding:"utf-8"},
        {path:PRIVATE_CHARACTER_DATA_PATH,content:renderPrivateCharacterData(privateData),encoding:"utf-8"}
      );
      if(captured.deletePath) files.push({path:captured.deletePath,delete:true});
    }else{
      overrides[name] = {
        ...previousOverride,
        eyebrow,
        sections:publicSections,
        created:true,
        ...(card ? {card} : {})
      };
      taxonomy.characters[name] = characterMeta;

      const restoredPortrait=previousPrivateProfile
        ? publicPortraitFromPrivate(name,previousPrivateProfile)
        : null;

      if(restoredPortrait) media[name]=restoredPortrait.media;
      else if(!media[name]) media[name]=existingMedia;

      if(secrets !== null || masterSections.length || previousPrivateEntry.masterSections){
        privateData.characters[name] = {
          ...previousPrivateEntry,
          ...(secrets !== null ? {secrets} : {}),
          masterSections
        };
      }

      if(privateData.characters[name]){
        delete privateData.characters[name].profile;
        if(!masterSections.length) delete privateData.characters[name].masterSections;
        cleanPrivateEntry(privateData.characters,name);
      }

      files.push(
        {path:"data/character-overrides.js",content:renderCharacterOverrides(overrides),encoding:"utf-8"},
        {path:"data/character-meta.js",content:renderCharacterTaxonomy(taxonomy),encoding:"utf-8"},
        {path:"data/character-media.js",content:renderCharacterMedia(media),encoding:"utf-8"}
      );

      if(restoredPortrait){
        files.push({
          path:restoredPortrait.path,
          content:restoredPortrait.content,
          encoding:"base64"
        });
      }

      if(previousPrivateProfile || secrets !== null || masterSections.length || previousPrivateEntry.masterSections){
        files.push({
          path:PRIVATE_CHARACTER_DATA_PATH,
          content:renderPrivateCharacterData(privateData),
          encoding:"utf-8"
        });
      }
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
        ...(characterMeta.visibility === "master"
          ? {
              eyebrow,
              sections,
              card:card || {},
              created:true,
              privateRuntime:true
            }
          : {
              ...overrides[name],
              sections
            })
      },
      meta:characterMeta,
      media:characterMeta.visibility === "master"
        ? ((privateData.characters[name] && privateProfile(privateData.characters[name]) && privateProfile(privateData.characters[name]).media) || null)
        : (media[name] || null),
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
