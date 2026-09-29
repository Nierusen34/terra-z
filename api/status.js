"use strict";

const { json, applyCors, requireEditor } = require("../server/auth");
const { installationToken, recentRuns } = require("../server/github");

module.exports = async function handler(req,res){
  applyCors(req,res);
  if(req.method === "OPTIONS"){ res.statusCode=204; return res.end(); }
  if(req.method !== "GET") return json(res,405,{error:"method_not_allowed"});
  if(!requireEditor(req,res)) return;

  try {
    const sha = String((req.query && req.query.sha) || "");
    if(!/^[0-9a-f]{40}$/i.test(sha)) return json(res,400,{error:"invalid_sha"});

    const token = await installationToken();
    const data = await recentRuns(token);
    const runs = Array.isArray(data.workflow_runs) ? data.workflow_runs : [];
    const run = runs.find(r=>r.head_sha === sha && /pages/i.test(String(r.name || r.workflow_name || "")));

    if(!run) return json(res,200,{status:"pending",message:"Deploy ainda não apareceu no GitHub Actions."});
    if(run.status !== "completed") return json(res,200,{status:"pending",run_status:run.status});
    if(run.conclusion === "success") return json(res,200,{status:"success",run_url:run.html_url});
    return json(res,200,{status:"failed",conclusion:run.conclusion,run_url:run.html_url});
  } catch(err){
    console.error(err);
    return json(res,err.status || 500,{error:"status_failed",message:err.message});
  }
};
