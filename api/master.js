import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  if(req.method !== "GET"){
    res.setHeader("Allow","GET, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }
  if(!requireEditor(req,res)) return;

  const raw = process.env.MASTER_CONTENT_JSON;
  if(!raw){
    return res.status(503).json({
      error:"master_content_not_configured",
      message:"Conteúdo privado ainda não foi configurado no backend."
    });
  }

  try {
    const data = JSON.parse(raw);
    return res.status(200).json({ok:true,content:data});
  } catch(error){
    console.error(error);
    return res.status(500).json({
      error:"invalid_master_content",
      message:"MASTER_CONTENT_JSON não contém JSON válido."
    });
  }
}
