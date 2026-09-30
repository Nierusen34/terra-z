import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { readPrivateSessions } from "./_lib/private-sessions.js";

export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(applyCors(req,res)) return;

  if(req.method !== "GET"){
    res.setHeader("Allow","GET, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }

  if(!requireEditor(req,res)) return;

  try {
    const sessions = await readPrivateSessions();
    return res.status(200).json({ok:true,sessions});
  } catch(error){
    console.error(error);
    return res.status(error.status || 500).json({
      error:error.code || "private_sessions_failed",
      message:error.message || "Falha ao carregar sessões privadas."
    });
  }
}
