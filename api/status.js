import { applyCors } from "./_lib/cors.js";
import { pagesRunStatus, workflowRunStatus } from "./_lib/github.js";

export default async function handler(req,res){
  if(applyCors(req,res)) return;

  if(req.method !== "GET"){
    res.setHeader("Allow","GET, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }

  const sha = String((req.query || {}).sha || "");
  if(!/^[a-f0-9]{40}$/i.test(sha)){
    return res.status(400).json({error:"invalid_sha"});
  }

  try {
    const kind=String((req.query || {}).kind || "pages").toLowerCase();
    const result=kind === "vercel"
      ? await workflowRunStatus(sha,"Vercel emergency deploy hook")
      : await pagesRunStatus(sha);
    res.setHeader("Cache-Control","no-store, max-age=0");
    return res.status(200).json({...result,kind});
  } catch(error){
    console.error(error);
    return res.status(200).json({status:"pending"});
  }
}
