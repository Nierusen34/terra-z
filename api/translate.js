import { applyCors } from "./_lib/cors.js";

const MAX_ITEMS = 50;
const MAX_ITEM_CHARS = 7000;
const MAX_TOTAL_CHARS = 6500;
const GATEWAY_MODEL = "openai/gpt-5.4-nano";

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

async function translateWithOfficialGoogle(texts, apiKey){
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
    const error = new Error(data?.error?.message || "Falha no serviço oficial de tradução.");
    error.status = response.status === 429 ? 503 : 502;
    error.code = "google_translate_failed";
    throw error;
  }

  const translations = data?.data?.translations || [];
  if(translations.length !== texts.length){
    const error = new Error("O serviço de tradução retornou uma resposta incompleta.");
    error.status = 502;
    error.code = "google_translate_incomplete";
    throw error;
  }

  return translations.map((item,index) => String(item?.translatedText || texts[index]));
}

function gatewayToken(){
  return String(
    process.env.AI_GATEWAY_API_KEY ||
    process.env.VERCEL_OIDC_TOKEN ||
    ""
  ).trim();
}

async function translateWithGateway(texts){
  const token = gatewayToken();
  if(!token){
    const error = new Error("O tradutor móvel ainda não está disponível nesta implantação.");
    error.status = 503;
    error.code = "translation_gateway_unavailable";
    throw error;
  }

  const schema = {
    type:"object",
    properties:{
      translations:{
        type:"array",
        items:{type:"string"},
        minItems:texts.length,
        maxItems:texts.length
      }
    },
    required:["translations"],
    additionalProperties:false
  };

  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions",{
    method:"POST",
    headers:{
      "Authorization":"Bearer " + token,
      "Content-Type":"application/json",
      "Accept":"application/json"
    },
    body:JSON.stringify({
      model:GATEWAY_MODEL,
      stream:false,
      messages:[
        {
          role:"system",
          content:[
            "Você é o tradutor integrado do projeto Terra Z.",
            "Traduza do inglês para português brasileiro natural e fiel.",
            "Preserve nomes próprios, nomes de personagens, codinomes, números e siglas quando não houver tradução consagrada.",
            "Não resuma, não explique, não censure e não acrescente informações.",
            "Mantenha exatamente a mesma quantidade de itens e a mesma ordem."
          ].join(" ")
        },
        {
          role:"user",
          content:JSON.stringify({texts})
        }
      ],
      response_format:{
        type:"json_schema",
        json_schema:{
          name:"terra_z_translation_batch",
          strict:true,
          schema
        }
      }
    })
  });

  const data = await response.json().catch(() => ({}));
  if(!response.ok){
    const upstreamStatus = Number(response.status || 0);
    const detail = String(data?.error?.message || "").trim();

    const error = new Error(
      upstreamStatus === 402
        ? "Os créditos mensais do tradutor foram esgotados."
        : upstreamStatus === 429
          ? "O tradutor está temporariamente ocupado. Tente novamente em instantes."
          : detail || "Falha no serviço de tradução."
    );
    error.status = upstreamStatus === 429 ? 503 : (upstreamStatus === 402 ? 503 : 502);
    error.code = "translation_gateway_failed";
    throw error;
  }

  const content = data?.choices?.[0]?.message?.content;
  let parsed;
  try{
    parsed = typeof content === "string" ? JSON.parse(content) : content;
  }catch{
    const error = new Error("O tradutor retornou uma resposta inválida.");
    error.status = 502;
    error.code = "translation_gateway_invalid";
    throw error;
  }

  const translations = parsed?.translations;
  if(!Array.isArray(translations) || translations.length !== texts.length){
    const error = new Error("O tradutor retornou um lote incompleto.");
    error.status = 502;
    error.code = "translation_gateway_incomplete";
    throw error;
  }

  return translations.map((value,index) => String(value || texts[index]));
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

    const googleKey = String(process.env.GOOGLE_TRANSLATE_API_KEY || "").trim();
    const translations = googleKey
      ? await translateWithOfficialGoogle(texts,googleKey)
      : await translateWithGateway(texts);

    return res.status(200).json({
      ok:true,
      translations,
      provider:googleKey ? "google-cloud" : "vercel-ai-gateway",
      model:googleKey ? null : GATEWAY_MODEL
    });
  }catch(error){
    console.error("Terra Z translation:",error);
    return res.status(error.status || 502).json({
      error:error.code || "translation_failed",
      message:error.message || "Não foi possível traduzir o artigo."
    });
  }
}
