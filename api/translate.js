import { applyCors } from "./_lib/cors.js";

const MAX_ITEMS = 900;
const MAX_ITEM_CHARS = 45000;
const MAX_TOTAL_CHARS = 45000;
const DEFAULT_ENDPOINT = "https://api.cognitive.microsofttranslator.com";

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
    const error = new Error("Lote de tradução grande demais.");
    error.status = 413;
    error.code = "translation_batch_too_large";
    throw error;
  }

  return texts;
}

function azureConfig(){
  const key = String(process.env.AZURE_TRANSLATOR_KEY || "").trim();
  const region = String(process.env.AZURE_TRANSLATOR_REGION || "").trim();
  const endpoint = String(process.env.AZURE_TRANSLATOR_ENDPOINT || DEFAULT_ENDPOINT)
    .trim()
    .replace(/\/+$/,"");

  if(!key){
    const error = new Error("O Azure Translator ainda não foi configurado no Terra Z.");
    error.status = 503;
    error.code = "azure_translator_not_configured";
    throw error;
  }

  return {key,region,endpoint};
}

function azureErrorMessage(status, payload){
  const upstream = String(
    payload?.error?.message ||
    payload?.message ||
    ""
  ).trim();

  if(status === 401 || status === 403){
    return "A chave ou a região do Azure Translator não foi aceita.";
  }

  if(status === 429){
    return "A cota gratuita do Azure Translator foi atingida ou consumida rápido demais. Tente novamente mais tarde.";
  }

  return upstream || "Falha no Azure Translator.";
}

async function translateWithAzure(texts){
  const {key,region,endpoint} = azureConfig();
  const url = endpoint + "/translate?api-version=3.0&from=en&to=pt";

  const headers = {
    "Ocp-Apim-Subscription-Key":key,
    "Content-Type":"application/json",
    "Accept":"application/json"
  };

  if(region && region.toLowerCase() !== "global"){
    headers["Ocp-Apim-Subscription-Region"] = region;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try{
    const response = await fetch(url,{
      method:"POST",
      headers,
      body:JSON.stringify(texts.map(text => ({text}))),
      signal:controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if(!response.ok){
      const error = new Error(azureErrorMessage(response.status,data));
      error.status = response.status === 429 ? 503 : 502;
      error.code = response.status === 429
        ? "azure_translator_quota"
        : "azure_translator_failed";
      throw error;
    }

    if(!Array.isArray(data) || data.length !== texts.length){
      const error = new Error("O Azure Translator retornou uma resposta incompleta.");
      error.status = 502;
      error.code = "azure_translator_incomplete";
      throw error;
    }

    return data.map((item,index) => {
      const translated = item?.translations?.[0]?.text;
      return String(translated || texts[index]);
    });
  }catch(error){
    if(error?.name === "AbortError"){
      const timeout = new Error("O Azure Translator demorou demais para responder.");
      timeout.status = 504;
      timeout.code = "azure_translator_timeout";
      throw timeout;
    }
    throw error;
  }finally{
    clearTimeout(timer);
  }
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;

  if(req.method !== "POST"){
    res.setHeader("Allow","POST, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }

  res.setHeader("Cache-Control","no-store, max-age=0");

  try{
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const texts = cleanTexts(body.texts || (body.text != null ? [body.text] : []));
    const translations = await translateWithAzure(texts);

    return res.status(200).json({
      ok:true,
      translations,
      provider:"azure-translator",
      target:"pt-BR"
    });
  }catch(error){
    console.error("Terra Z translation:",error);
    return res.status(error.status || 502).json({
      error:error.code || "translation_failed",
      message:error.message || "Não foi possível traduzir o artigo."
    });
  }
}
