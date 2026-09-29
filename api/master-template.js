import { applyCors } from "./_lib/cors.js";
import { requireEditor } from "./_lib/auth.js";
import { readTextFile } from "./_lib/github.js";
import { buildMasterContent } from "./_lib/master-migration.js";

export default async function handler(req,res){
  if(applyCors(req,res)) return;
  if(req.method!=="GET"){
    res.setHeader("Allow","GET, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }
  if(!requireEditor(req,res)) return;

  try {
    const file=await readTextFile("data/characters.js");
    const result=buildMasterContent(file.content);
    return res.status(200).json({
      ok:true,
      content:result.content,
      characters:result.characterCount,
      secrets:result.secretCount
    });
  } catch(error){
    console.error(error);
    return res.status(error.status||500).json({
      error:error.code||"master_template_failed",
      message:error.status ? error.message : "Falha ao preparar conteúdo Mestre."
    });
  }
}
