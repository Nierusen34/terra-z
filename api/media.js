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
        source:"local",
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
