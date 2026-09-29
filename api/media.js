"use strict";

const { json, applyCors, requireEditor } = require("../server/auth");
const { installationToken, getFile, commitFiles, OWNER, REPO, BRANCH } = require("../server/github");

const MEDIA_RE = /window\.TerraZData\.characterMedia\s*=\s*(\{[\s\S]*?\});/;
const MIME_TO_EXT = {
  "image/png":"png",
  "image/jpeg":"jpg",
  "image/webp":"webp"
};

function slugify(value){
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .replace(/['’]/g,"")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"");
}

function renderMedia(data){
  return `(function(){\n"use strict";\n\nwindow.TerraZData = window.TerraZData || {};\n\n// Metadados visuais de personagens.\n// src vazio = usar placeholder do Terra Z.\nwindow.TerraZData.characterMedia = ${JSON.stringify(data,null,2)};\n\n})();\n`;
}

function cleanBase64(value){
  const raw = String(value || "");
  const comma = raw.indexOf(",");
  return (comma >= 0 ? raw.slice(comma + 1) : raw).replace(/\s+/g,"");
}

module.exports = async function handler(req,res){
  applyCors(req,res);
  if(req.method === "OPTIONS"){ res.statusCode=204; return res.end(); }
  if(req.method !== "POST") return json(res,405,{error:"method_not_allowed"});
  if(!requireEditor(req,res)) return;

  try {
    const body = req.body || {};
    const character = String(body.character || "").trim();
    const mime = String(body.mime || "").toLowerCase();
    const ext = MIME_TO_EXT[mime];
    const imageBase64 = cleanBase64(body.data);

    if(!character) return json(res,400,{error:"missing_character"});
    if(!ext) return json(res,400,{error:"unsupported_image",message:"Use PNG, JPEG ou WebP."});
    if(!/^[A-Za-z0-9+/=]+$/.test(imageBase64)) return json(res,400,{error:"invalid_base64"});

    const image = Buffer.from(imageBase64,"base64");
    if(!image.length) return json(res,400,{error:"empty_image"});
    if(image.length > 3 * 1024 * 1024){
      return json(res,413,{error:"image_too_large",message:"A imagem deve ter no máximo 3 MB."});
    }

    const token = await installationToken();
    const current = await getFile("data/character-media.js", token);
    const source = Buffer.from(current.content || "", "base64").toString("utf8");
    const match = source.match(MEDIA_RE);
    if(!match) throw new Error("Não foi possível ler characterMedia.");

    const media = JSON.parse(match[1]);
    if(!Object.prototype.hasOwnProperty.call(media, character)){
      return json(res,404,{error:"unknown_character",message:"Personagem não encontrado em characterMedia."});
    }

    const slug = slugify(character);
    const path = "images/characters/" + slug + "." + ext;
    const previous = media[character] && media[character].src ? String(media[character].src) : "";

    media[character] = {
      src:path,
      alt:String(body.alt || character).slice(0,160),
      source:"local",
      credit:String(body.credit || "").slice(0,200)
    };

    const files = [
      {path,content:imageBase64,encoding:"base64"},
      {path:"data/character-media.js",content:renderMedia(media),encoding:"utf8"}
    ];

    if(previous && previous !== path && /^images\/characters\/[a-z0-9._/-]+$/i.test(previous)){
      files.push({path:previous,delete:true});
    }

    const commit = await commitFiles(
      files,
      "media: atualizar retrato de " + character,
      token
    );

    return json(res,200,{
      ok:true,
      repository:OWNER + "/" + REPO,
      branch:BRANCH,
      commit_sha:commit.sha,
      commit_url:commit.html_url,
      image_path:path,
      status_url:"/api/status?sha=" + encodeURIComponent(commit.sha)
    });
  } catch(err){
    console.error(err);
    return json(res,err.status || 500,{error:"media_failed",message:err.message});
  }
};
