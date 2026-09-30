import { applyCors } from "./_lib/cors.js";
import { getHead, readTextFile } from "./_lib/github.js";
import { parseDataAssignment } from "./_lib/data-files.js";

const FILES = {
  contentOverrides:["data/content-overrides.js","contentOverrides"],
  characterOverrides:["data/character-overrides.js","characterOverrides"],
  characterTaxonomy:["data/character-meta.js","characterTaxonomy"],
  characterMedia:["data/character-media.js","characterMedia"],
  graphOverride:["data/graph-overrides.js","graphOverride"],
  sessions:["data/sessions.js","sessions"]
};

export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store, max-age=0");
  if(applyCors(req,res)) return;

  if(req.method !== "GET"){
    res.setHeader("Allow","GET, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }

  try {
    const head = await getHead();
    const entries = await Promise.all(
      Object.entries(FILES).map(async ([key,[path,property]])=>{
        const file = await readTextFile(path);
        return [key,parseDataAssignment(file.content,property)];
      })
    );

    return res.status(200).json({
      ok:true,
      sha:head,
      data:Object.fromEntries(entries)
    });
  } catch(error){
    console.error(error);
    return res.status(error.status || 500).json({
      error:error.code || "runtime_data_failed",
      message:"Falha ao carregar os dados atuais do Terra Z."
    });
  }
}
