import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { getHead, readTextFile, readBinaryFile, commitFiles } from "./_lib/github.js";
import { parseDataAssignment, renderCharacterMedia } from "./_lib/data-files.js";

const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS = {
  "image/png":"png",
  "image/jpeg":"jpg",
  "image/webp":"webp"
};

const MIME_BY_EXT = {
  png:"image/png",
  jpg:"image/jpeg",
  jpeg:"image/jpeg",
  webp:"image/webp"
};

const FANDOM_API = "https://dc.fandom.com/api.php";
const MAX_DC_TITLE_LENGTH = 180;

function safeDcText(value,max=MAX_DC_TITLE_LENGTH){
  return String(value || "").trim().slice(0,max);
}

function cleanDcTitle(value){
  return safeDcText(value).replace(/[\u0000-\u001f\u007f]/g,"");
}

function safeHttpsUrl(value,max=1200){
  const raw=String(value || "").trim().slice(0,max);
  if(!raw) return "";
  try{
    const url=new URL(raw);
    if(url.protocol !== "https:") return "";
    return url.toString();
  }catch(error){
    return "";
  }
}

function normalizeAutoSource(body){
  const provider=String(body.provider || "none").trim();

  if(provider === "none") return null;

  if(provider === "dc-fandom"){
    const wikiTitle=cleanDcTitle(body.wikiTitle);
    if(!wikiTitle){
      const error=new Error("Informe o título da página/versão na DC Database.");
      error.status=400;
      error.code="missing_wiki_title";
      throw error;
    }
    return {provider:"dc-fandom",wikiTitle};
  }

  if(provider === "external-url"){
    const imageUrl=safeHttpsUrl(body.imageUrl);
    if(!imageUrl){
      const error=new Error("Informe uma URL HTTPS válida para a imagem externa.");
      error.status=400;
      error.code="invalid_external_image_url";
      throw error;
    }

    const pageUrl=safeHttpsUrl(body.pageUrl);
    const sourceLabel=safeDcText(body.sourceLabel,160) || "Fonte externa";
    const fallbackWikiTitle=cleanDcTitle(body.fallbackWikiTitle);

    return {
      provider:"external-url",
      imageUrl,
      ...(pageUrl ? {pageUrl} : {}),
      ...(fallbackWikiTitle ? {fallbackWikiTitle} : {}),
      sourceLabel
    };
  }

  const error=new Error("Fonte automática de retrato desconhecida.");
  error.status=400;
  error.code="invalid_auto_provider";
  throw error;
}

function dcPageImage(page){
  if(!page || page.missing) return "";
  return (
    (page.thumbnail && page.thumbnail.source) ||
    (page.original && page.original.source) ||
    ""
  );
}

function dcPageOriginal(page){
  if(!page || page.missing) return "";
  return (
    (page.original && page.original.source) ||
    (page.thumbnail && page.thumbnail.source) ||
    ""
  );
}

function dcPageUrl(page){
  if(page && page.fullurl) return page.fullurl;
  if(page && page.title){
    return "https://dc.fandom.com/wiki/" + encodeURIComponent(page.title.replace(/ /g,"_"));
  }
  return "";
}

async function fandomQuery(params){
  const url = new URL(FANDOM_API);
  Object.entries(params).forEach(([key,value])=>{
    if(value !== undefined && value !== null && value !== "") url.searchParams.set(key,String(value));
  });

  const response = await fetch(url,{
    headers:{
      "Accept":"application/json",
      "User-Agent":"Terra-Z/1.0 (character portrait resolver)"
    },
    signal:AbortSignal.timeout(9000)
  });

  if(!response.ok){
    const error = new Error("DC Database respondeu HTTP " + response.status);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function exactDcPage(title){
  const data = await fandomQuery({
    action:"query",
    format:"json",
    formatversion:"2",
    redirects:"1",
    prop:"pageimages|info",
    inprop:"url",
    piprop:"thumbnail|original|name",
    pithumbsize:"900",
    pilicense:"any",
    titles:title
  });

  return data && data.query && Array.isArray(data.query.pages)
    ? data.query.pages[0]
    : null;
}

function scoreDcCandidate(page,name,preferredTitle){
  const title=String((page && page.title) || "").toLowerCase();
  const n=String(name || "").toLowerCase();
  const preferred=String(preferredTitle || "").toLowerCase();
  let score=0;
  if(title === preferred) score += 100;
  if(title.includes("(prime earth)")) score += 50;
  if(n && title.startsWith(n)) score += 30;
  if(dcPageImage(page)) score += 20;
  return score;
}

async function searchDcPage(name,preferredTitle){
  const query = [name,"Prime Earth"].filter(Boolean).join(" ");
  const data = await fandomQuery({
    action:"query",
    format:"json",
    formatversion:"2",
    generator:"search",
    gsrsearch:query,
    gsrnamespace:"0",
    gsrlimit:"8",
    prop:"pageimages|info",
    inprop:"url",
    piprop:"thumbnail|original|name",
    pithumbsize:"900",
    pilicense:"any"
  });

  const pages = data && data.query && Array.isArray(data.query.pages)
    ? data.query.pages.filter(page=>page && !page.missing)
    : [];

  pages.sort((a,b)=>scoreDcCandidate(b,name,preferredTitle)-scoreDcCandidate(a,name,preferredTitle));
  return pages.find(page=>dcPageImage(page)) || pages[0] || null;
}

async function handleDcPortrait(req,res){
  const title=cleanDcTitle((req.query || {}).title);
  const name=cleanDcTitle((req.query || {}).name || title.replace(/\s*\([^)]*\)\s*$/,""));

  if(!title || title.length > MAX_DC_TITLE_LENGTH){
    return res.status(400).json({
      error:"invalid_title",
      message:"Título da página da DC Database inválido."
    });
  }

  try{
    let page=await exactDcPage(title);

    if(!page || page.missing || !dcPageImage(page)){
      page=await searchDcPage(name,title);
    }

    const imageUrl=dcPageImage(page);

    if(!page || !imageUrl){
      res.setHeader("Cache-Control","public, max-age=300, s-maxage=21600, stale-while-revalidate=86400");
      return res.status(200).json({
        ok:true,
        found:false,
        name,
        requestedTitle:title,
        provider:"dc-fandom"
      });
    }

    res.setHeader("Cache-Control","public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");

    return res.status(200).json({
      ok:true,
      found:true,
      name,
      requestedTitle:title,
      title:page.title || title,
      imageUrl,
      fullImageUrl:dcPageOriginal(page),
      pageUrl:dcPageUrl(page),
      provider:"dc-fandom",
      source:"DC Database · Fandom"
    });
  }catch(error){
    console.error("Terra Z DC portrait resolver:",error);
    res.setHeader("Cache-Control","no-store");
    return res.status(502).json({
      error:"dc_source_unavailable",
      message:"A fonte automática de retratos da DC está temporariamente indisponível."
    });
  }
}

async function handleExternalPortrait(req,res){
  const name=cleanDcTitle((req.query || {}).name);

  if(!name){
    return res.status(400).json({error:"missing_character",message:"Personagem não informado."});
  }

  try{
    const mediaFile=await readTextFile("data/character-media.js");
    const mediaData=parseDataAssignment(mediaFile.content,"characterMedia");
    const item=mediaData[name] && typeof mediaData[name] === "object" ? mediaData[name] : {};
    const auto=item.auto && typeof item.auto === "object" ? item.auto : {};
    const imageUrl=auto.provider === "external-url" ? safeHttpsUrl(auto.imageUrl,1600) : "";

    if(!imageUrl){
      return res.status(404).json({
        error:"external_portrait_not_found",
        message:"Este personagem não possui retrato externo configurado."
      });
    }

    const response=await fetch(imageUrl,{
      redirect:"follow",
      headers:{
        "Accept":"image/avif,image/webp,image/apng,image/jpeg,image/png,image/*,*/*;q=0.8",
        "User-Agent":"Mozilla/5.0 (compatible; Terra-Z/1.0; +https://terra-z.vercel.app)"
      },
      signal:AbortSignal.timeout(12000)
    });

    if(!response.ok) throw new Error("Fonte externa respondeu HTTP " + response.status);

    const contentType=String(response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if(!contentType.startsWith("image/")) throw new Error("A fonte externa não retornou uma imagem.");

    const buffer=Buffer.from(await response.arrayBuffer());
    if(!buffer.length || buffer.length > 8 * 1024 * 1024) throw new Error("Imagem externa inválida ou grande demais.");

    res.setHeader("Content-Type",contentType);
    res.setHeader("Cache-Control","public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
    res.setHeader("X-Content-Type-Options","nosniff");
    return res.status(200).send(buffer);
  }catch(error){
    console.error("Terra Z external portrait proxy:",name,error);
    res.setHeader("Cache-Control","no-store");
    return res.status(502).json({
      error:"external_source_unavailable",
      message:"A fonte externa do retrato está temporariamente indisponível."
    });
  }
}

function slugify(value){
  return String(value)
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .replace(/['’]/g,"")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .slice(0,80);
}

function validMagic(buffer,mime){
  if(mime === "image/png") return buffer.length >= 8 && buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if(mime === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if(mime === "image/webp") return buffer.length >= 12 && buffer.subarray(0,4).toString() === "RIFF" && buffer.subarray(8,12).toString() === "WEBP";
  return false;
}

function statusUrl(req,sha){
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  return proto + "://" + req.headers.host + "/api/status?sha=" + encodeURIComponent(sha);
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;

  if(req.method === "GET"){
    if(String((req.query || {}).dc || "") === "1"){
      return handleDcPortrait(req,res);
    }

    if(String((req.query || {}).external || "") === "1"){
      return handleExternalPortrait(req,res);
    }

    const path = String((req.query || {}).path || "");
    if(!/^images\/characters\/[a-z0-9._-]+\.(png|jpe?g|webp)$/i.test(path)){
      return res.status(400).json({error:"invalid_media_path"});
    }

    try {
      const file = await readBinaryFile(path);
      const ext = path.split(".").pop().toLowerCase();
      res.setHeader("Content-Type",MIME_BY_EXT[ext] || "application/octet-stream");
      res.setHeader("Cache-Control","public, max-age=60, s-maxage=60");
      return res.status(200).send(file.buffer);
    } catch(error){
      console.error(error);
      return res.status(error.status || 404).end();
    }
  }

  if(req.method !== "POST" && req.method !== "DELETE"){
    res.setHeader("Allow","GET, POST, DELETE, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }

  if(!requireEditor(req,res)) return;

  try {
    const requestBody = req.body || {};

    if(req.method === "POST" && requestBody.action === "configure-source"){
      const character=String(requestBody.character || "").trim();
      if(!character){
        return res.status(400).json({error:"missing_character",message:"Personagem não informado."});
      }

      const head=await getHead();
      const mediaFile=await readTextFile("data/character-media.js");
      const mediaData=parseDataAssignment(mediaFile.content,"characterMedia");

      if(!Object.prototype.hasOwnProperty.call(mediaData,character)){
        return res.status(404).json({error:"unknown_character",message:"Personagem não encontrado na camada de mídia."});
      }

      const current=mediaData[character] && typeof mediaData[character] === "object"
        ? mediaData[character]
        : {src:"",alt:character,source:"local",credit:""};

      const auto=normalizeAutoSource(requestBody);

      mediaData[character]={
        ...current,
        source:current.src ? "local" : (auto ? "auto" : "local")
      };

      if(auto) mediaData[character].auto=auto;
      else delete mediaData[character].auto;

      const commit=await commitFiles(
        [{
          path:"data/character-media.js",
          content:renderCharacterMedia(mediaData),
          encoding:"utf-8"
        }],
        "media: atualizar fonte de retrato de " + character,
        head
      );

      return res.status(200).json({
        ok:true,
        sha:commit.sha,
        character,
        media:mediaData[character],
        status_url:statusUrl(req,commit.sha)
      });
    }

    if(req.method === "DELETE"){
      const body = req.body || {};
      const character = String(body.character || "").trim();

      if(!character){
        return res.status(400).json({error:"missing_character",message:"Personagem não informado."});
      }

      const head = await getHead();
      const mediaFile = await readTextFile("data/character-media.js");
      const mediaData = parseDataAssignment(mediaFile.content,"characterMedia");

      if(!Object.prototype.hasOwnProperty.call(mediaData,character)){
        return res.status(404).json({error:"unknown_character",message:"Personagem não encontrado na camada de mídia."});
      }

      const previousPath = mediaData[character] && mediaData[character].src
        ? String(mediaData[character].src)
        : "";

      if(!previousPath){
        return res.status(409).json({error:"no_portrait",message:"Este personagem não possui retrato para remover."});
      }

      mediaData[character] = {
        ...mediaData[character],
        src:"",
        source:mediaData[character] && mediaData[character].auto ? "auto" : "local",
        credit:""
      };

      const files = [
        {
          path:"data/character-media.js",
          content:renderCharacterMedia(mediaData),
          encoding:"utf-8"
        }
      ];

      if(/^images\/characters\/[a-z0-9._-]+\.(png|jpe?g|webp)$/i.test(previousPath)){
        try {
          await readBinaryFile(previousPath);
          files.push({path:previousPath,delete:true});
        } catch(error){
          if(!error || error.status !== 404) throw error;
        }
      }

      const commit = await commitFiles(
        files,
        "media: remover retrato de " + character,
        head
      );

      return res.status(200).json({
        ok:true,
        sha:commit.sha,
        character,
        status_url:statusUrl(req,commit.sha)
      });
    }
    const body = req.body || {};
    const character = String(body.character || "").trim();
    const mime = String(body.mimeType || "").toLowerCase();
    const extension = EXTENSIONS[mime];

    if(!character || !extension){
      return res.status(400).json({error:"invalid_media",message:"Personagem ou formato de imagem inválido."});
    }

    let encoded = String(body.contentBase64 || "");
    const comma = encoded.indexOf(",");
    if(encoded.startsWith("data:") && comma >= 0) encoded = encoded.slice(comma+1);
    encoded = encoded.replace(/\s+/g,"");

    const buffer = Buffer.from(encoded,"base64");
    if(!buffer.length || buffer.length > MAX_BYTES){
      return res.status(413).json({error:"image_too_large",message:"A imagem deve ter no máximo 2 MB."});
    }
    if(!validMagic(buffer,mime)){
      return res.status(400).json({error:"invalid_image",message:"O conteúdo do arquivo não corresponde ao formato informado."});
    }

    const head = await getHead();
    const mediaFile = await readTextFile("data/character-media.js");
    const mediaData = parseDataAssignment(mediaFile.content,"characterMedia");

    if(!Object.prototype.hasOwnProperty.call(mediaData,character)){
      return res.status(404).json({error:"unknown_character",message:"Personagem não encontrado na camada de mídia."});
    }

    const filename = slugify(character) + "." + extension;
    const imagePath = "images/characters/" + filename;
    const previousPath = mediaData[character] && mediaData[character].src
      ? String(mediaData[character].src)
      : "";

    mediaData[character] = {
      ...mediaData[character],
      src:imagePath,
      alt:String(body.alt || character).slice(0,160),
      source:"local",
      credit:String(body.credit || "").slice(0,240)
    };

    const files = [
      {path:imagePath,content:buffer.toString("base64"),encoding:"base64"},
      {path:"data/character-media.js",content:renderCharacterMedia(mediaData),encoding:"utf-8"}
    ];

    if(previousPath &&
       previousPath !== imagePath &&
       /^images\/characters\/[a-z0-9._/-]+$/i.test(previousPath)){
      files.push({path:previousPath,delete:true});
    }

    const commit = await commitFiles(
      files,
      "media: atualizar retrato de " + character,
      head
    );

    return res.status(200).json({
      ok:true,
      sha:commit.sha,
      path:imagePath,
      status_url:statusUrl(req,commit.sha)
    });
  } catch(error){
    console.error(error);
    return res.status(error.status || 500).json({
      error:error.code || "media_publish_failed",
      message:error.status ? error.message : "Falha ao publicar a imagem."
    });
  }
}
