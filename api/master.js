import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { getHead, commitFiles } from "./_lib/github.js";
import {
  PRIVATE_CHARACTER_DATA_PATH,
  readPrivateCharacterData,
  renderPrivateCharacterData
} from "./_lib/private-character-data.js";

function plain(value,max=6000){
  return String(value == null ? "" : value)
    .replace(/\u0000/g,"")
    .trim()
    .slice(0,max);
}

function id(value,prefix,index){
  const cleaned = plain(value,120)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g,"-")
    .replace(/^-+|-+$/g,"");
  return cleaned || (prefix + "-" + (index+1));
}

function list(value,maxItems=30,maxLen=160){
  if(!Array.isArray(value)) return [];
  return value
    .slice(0,maxItems)
    .map(item => plain(item,maxLen))
    .filter(Boolean);
}

function iso(value){
  const raw = plain(value,80);
  if(!raw) return "";
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function normalizeNotes(value){
  if(!Array.isArray(value)) return [];
  return value.slice(0,250).map((item,index)=>({
    id:id(item && item.id,"note",index),
    title:plain(item && item.title,180),
    body:plain(item && item.body,12000),
    tags:list(item && item.tags,20,80),
    updatedAt:iso(item && item.updatedAt)
  })).filter(item => item.title || item.body);
}

function normalizeRevelations(value){
  const statuses = new Set(["planned","revealed","discarded"]);
  if(!Array.isArray(value)) return [];
  return value.slice(0,250).map((item,index)=>({
    id:id(item && item.id,"revelation",index),
    title:plain(item && item.title,180),
    body:plain(item && item.body,12000),
    trigger:plain(item && item.trigger,1200),
    status:statuses.has(item && item.status) ? item.status : "planned",
    characters:list(item && item.characters,30,160),
    updatedAt:iso(item && item.updatedAt)
  })).filter(item => item.title || item.body);
}

function normalizeGoals(value){
  const statuses = new Set(["active","paused","completed","failed"]);
  if(!Array.isArray(value)) return [];
  return value.slice(0,250).map((item,index)=>({
    id:id(item && item.id,"goal",index),
    title:plain(item && item.title,180),
    owner:plain(item && item.owner,180),
    body:plain(item && item.body,12000),
    status:statuses.has(item && item.status) ? item.status : "active",
    characters:list(item && item.characters,30,160),
    updatedAt:iso(item && item.updatedAt)
  })).filter(item => item.title || item.body || item.owner);
}

function normalizeClues(value){
  const truths = new Set(["true","false","partial","unknown"]);
  const statuses = new Set(["hidden","discovered","consumed"]);
  if(!Array.isArray(value)) return [];
  return value.slice(0,300).map((item,index)=>({
    id:id(item && item.id,"clue",index),
    title:plain(item && item.title,180),
    body:plain(item && item.body,12000),
    truth:truths.has(item && item.truth) ? item.truth : "unknown",
    status:statuses.has(item && item.status) ? item.status : "hidden",
    characters:list(item && item.characters,30,160),
    locations:list(item && item.locations,30,160),
    updatedAt:iso(item && item.updatedAt)
  })).filter(item => item.title || item.body);
}

function normalizeNpcStates(value){
  const statuses = new Set(["active","missing","captured","dead","unknown"]);
  if(!Array.isArray(value)) return [];
  return value.slice(0,300).map((item,index)=>({
    id:id(item && item.id,"npc",index),
    name:plain(item && item.name,180),
    state:plain(item && item.state,1600),
    location:plain(item && item.location,240),
    intention:plain(item && item.intention,2400),
    status:statuses.has(item && item.status) ? item.status : "active",
    notes:plain(item && item.notes,6000),
    updatedAt:iso(item && item.updatedAt)
  })).filter(item => item.name || item.state || item.notes);
}

function normalizeMasterState(value){
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    version:1,
    notes:normalizeNotes(input.notes),
    revelations:normalizeRevelations(input.revelations),
    goals:normalizeGoals(input.goals),
    clues:normalizeClues(input.clues),
    npcStates:normalizeNpcStates(input.npcStates)
  };
}

function legacyMasterContent(){
  const raw = process.env.MASTER_CONTENT_JSON;
  if(!raw) return {characters:{}};
  const parsed = JSON.parse(raw);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? parsed
    : {characters:{}};
}

export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(applyCors(req,res)) return;

  if(req.method !== "GET" && req.method !== "POST"){
    res.setHeader("Allow","GET, POST, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }

  if(!requireEditor(req,res)) return;

  try {
    if(req.method === "POST"){
      const body = req.body || {};
      const privateData = await readPrivateCharacterData();
      privateData.characters = privateData.characters && typeof privateData.characters === "object"
        ? privateData.characters
        : {};
      privateData.master = normalizeMasterState(body.master);

      const head = await getHead();
      const commit = await commitFiles([
        {
          path:PRIVATE_CHARACTER_DATA_PATH,
          content:renderPrivateCharacterData(privateData),
          encoding:"utf-8"
        }
      ],"master: atualizar conteúdo privado",head);

      return res.status(200).json({
        ok:true,
        sha:commit.sha,
        master:privateData.master
      });
    }

    const data = legacyMasterContent();
    const privateOverrides = await readPrivateCharacterData();

    data.characters = data.characters && typeof data.characters === "object" ? data.characters : {};
    const extraCharacters = privateOverrides && privateOverrides.characters && typeof privateOverrides.characters === "object"
      ? privateOverrides.characters
      : {};

    Object.keys(extraCharacters).forEach(name => {
      data.characters[name] = {
        ...(data.characters[name] || {}),
        ...extraCharacters[name]
      };
    });

    data.master = normalizeMasterState(privateOverrides && privateOverrides.master);

    return res.status(200).json({ok:true,content:data});
  } catch(error){
    console.error(error);
    return res.status(error.status || 500).json({
      error:error.code || "master_content_failed",
      message:error.message || "Falha ao carregar ou salvar o conteúdo Mestre."
    });
  }
}
