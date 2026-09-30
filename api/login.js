import { applyCors } from "./_lib/cors.js";
import { verifyPassword, createEditorToken, TOKEN_TTL_SECONDS } from "./_lib/auth.js";

export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(applyCors(req,res)) return;

  if(req.method !== "POST"){
    res.setHeader("Allow","POST, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }

  try {
    const password = String((req.body || {}).password || "");
    if(!password || !verifyPassword(password)){
      return res.status(401).json({error:"invalid_credentials",message:"Senha de editor inválida."});
    }

    return res.status(200).json({
      token:createEditorToken(),
      expires_in:TOKEN_TTL_SECONDS
    });
  } catch(error){
    console.error(error);
    return res.status(500).json({error:"auth_configuration_error",message:"Autenticação do editor não configurada no servidor."});
  }
}
