import { applyCors } from "./_lib/cors.js";

const MAX_ITEMS = 180;
const MAX_ITEM_CHARS = 7000;
const MAX_TOTAL_CHARS = 70000;
const GROUP_CHAR_LIMIT = 3200;
const SPLIT_TOKEN = "[[[TERRA_Z_SPLIT_5E7F]]]";

function cleanTexts(value){
  const list = Array.isArray(value) ? value : [];
  const texts = list.map(item => String(item ?? ""));

  if(!texts.length || texts.length > MAX_ITEMS){
    const error = new Error("Quantidade de trechos inválida.");
    error.status = 400;
    error.code = "invalid_text_count";
    throw error;
  }

  let total = 0;
  texts.forEach(text => {
    if(text.length > MAX_ITEM_CHARS){
      const error = new Error("Um trecho excede o limite de tradução.");
      error.status = 413;
      error.code = "translation_item_too_large";
      throw error;
    }
    total += text.length;
  });

  if(total > MAX_TOTAL_CHARS){
    const error = new Error("O artigo é grande demais para uma única tradução.");
    error.status = 413;
    error.code = "translation_too_large";
    throw error;
  }

  return texts;
}

function groupsFor(texts){
  const groups = [];
  let current = [];
  let size = 0;

  texts.forEach((text,index) => {
    const extra = text.length + (current.length ? SPLIT_TOKEN.length + 4 : 0);
    if(current.length && size + extra > GROUP_CHAR_LIMIT){
      groups.push(current);
      current = [];
      size = 0;
    }
    current.push({text,index});
    size += extra;
  });

  if(current.length) groups.push(current);
  return groups;
}

function parseUnofficialPayload(data, fallback){
  if(!Array.isArray(data) || !Array.isArray(data[0])) return fallback;
  const translated = data[0]
    .map(part => Array.isArray(part) && part[0] ? part[0] : "")
    .join("");
  return translated || fallback;
}

async function translateUnofficial(text){
  const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=" +
    encodeURIComponent(text);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url,{
      method:"GET",
      headers:{
        "Accept":"application/json,text/plain,*/*",
        "User-Agent":"Mozilla/5.0 Terra-Z-Translation/1.0"
      },
      signal:controller.signal
    });

    if(!response.ok){
      const error = new Error("Serviço de tradução respondeu HTTP " + response.status + ".");
      error.status = 502;
      throw error;
    }

    const data = await response.json();
    return parseUnofficialPayload(data,text);
  } finally {
    clearTimeout(timer);
  }
}

async function translateWithUnofficialApi(texts){
  const output = new Array(texts.length);
  const groups = groupsFor(texts);

  for(const group of groups){
    const joined = group.map(item => item.text).join("\n\n" + SPLIT_TOKEN + "\n\n");
    const translated = await translateUnofficial(joined);
    const parts = translated.split(SPLIT_TOKEN);

    if(parts.length === group.length){
      group.forEach((item,idx) => {
        output[item.index] = String(parts[idx] || item.text).trim();
      });
      continue;
    }

    for(const item of group){
      output[item.index] = await translateUnofficial(item.text);
    }
  }

  return output.map((value,index) => value || texts[index]);
}

async function translateWithOfficialApi(texts, apiKey){
  const response = await fetch(
    "https://translation.googleapis.com/language/translate/v2?key=" + encodeURIComponent(apiKey),
    {
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify({
        q:texts,
        source:"en",
        target:"pt",
        format:"text"
      })
    }
  );

  const data = await response.json().catch(() => ({}));
  if(!response.ok){
    const error = new Error(
      data?.error?.message || "Falha no serviço oficial de tradução."
    );
    error.status = 502;
    throw error;
  }

  const translations = data?.data?.translations || [];
  if(translations.length !== texts.length){
    const error = new Error("O serviço de tradução retornou uma resposta incompleta.");
    error.status = 502;
    throw error;
  }

  return translations.map((item,index) =>
    String(item?.translatedText || texts[index])
  );
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;

  if(req.method !== "POST"){
    res.setHeader("Allow","POST, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }

  res.setHeader("Cache-Control","no-store, max-age=0");

  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const texts = cleanTexts(body.texts || (body.text != null ? [body.text] : []));

    const apiKey = String(process.env.GOOGLE_TRANSLATE_API_KEY || "").trim();
    const translations = apiKey
      ? await translateWithOfficialApi(texts,apiKey)
      : await translateWithUnofficialApi(texts);

    return res.status(200).json({
      ok:true,
      translations,
      provider:apiKey ? "google-cloud" : "google-web-fallback"
    });
  } catch(error){
    console.error("Terra Z translation:",error);
    return res.status(error.status || 502).json({
      error:error.code || "translation_failed",
      message:error.message || "Não foi possível traduzir o artigo."
    });
  }
}
