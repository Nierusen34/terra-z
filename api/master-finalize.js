import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { getHead, readTextFile, commitFiles } from "./_lib/github.js";
import { buildMasterContent, validateMasterContent, stripPublicSecrets } from "./_lib/master-migration.js";

function statusUrl(req,sha){
  const proto=String(req.headers["x-forwarded-proto"]||"https").split(",")[0].trim();
  return proto+"://"+req.headers.host+"/api/status?sha="+encodeURIComponent(sha);
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  if(req.method!=="POST"){
    res.setHeader("Allow","POST, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }
  if(!requireEditor(req,res)) return;

  try {
    if(!process.env.MASTER_CONTENT_JSON){
      return res.status(409).json({
        error:"master_content_missing",
        message:"Configure MASTER_CONTENT_JSON na Vercel antes de finalizar a migração."
      });
    }

    let master;
    try {
      master=JSON.parse(process.env.MASTER_CONTENT_JSON);
    } catch {
      return res.status(409).json({
        error:"master_content_invalid",
        message:"MASTER_CONTENT_JSON não contém JSON válido."
      });
    }

    const head=await getHead();
    const file=await readTextFile("data/characters.js");
    const publicState=buildMasterContent(file.content);

    if(publicState.secretCount===0){
      return res.status(200).json({
        ok:true,
        already_migrated:true,
        characters:0,
        secrets:0
      });
    }

    const validation=validateMasterContent(master,file.content);
    if(!validation.ok){
      return res.status(409).json({
        error:"master_content_mismatch",
        message:"O conteúdo privado não corresponde aos segredos públicos atuais. Gere e configure novamente o JSON Mestre.",
        missing:validation.missing,
        mismatched:validation.mismatched
      });
    }

    const stripped=stripPublicSecrets(file.content);
    const commit=await commitFiles([
      {path:"data/characters.js",content:stripped,encoding:"utf-8"}
    ],"security: mover segredos de personagens para conteúdo privado",head);

    return res.status(200).json({
      ok:true,
      sha:commit.sha,
      characters:validation.characterCount,
      secrets:validation.secretCount,
      status_url:statusUrl(req,commit.sha)
    });
  } catch(error){
    console.error(error);
    return res.status(error.status||500).json({
      error:error.code||"master_finalize_failed",
      message:error.status ? error.message : "Falha ao finalizar a migração do conteúdo Mestre."
    });
  }
}
