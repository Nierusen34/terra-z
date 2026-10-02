import { applyCors } from "./_lib/cors.js";
import { githubConfig, getHead, readTextFile } from "./_lib/github.js";
import { parseDataAssignment } from "./_lib/data-files.js";


const RUNTIME_FILES = {
  contentOverrides:["data/content-overrides.js","contentOverrides"],
  characterOverrides:["data/character-overrides.js","characterOverrides"],
  characterTaxonomy:["data/character-meta.js","characterTaxonomy"],
  characterMedia:["data/character-media.js","characterMedia"],
  graphOverride:["data/graph-overrides.js","graphOverride"],
  sessions:["data/sessions.js","sessions"],
  timeline:["data/timeline.js","timeline"]
};

async function runtimePayload(){
  const head = await getHead();
  const entries = await Promise.all(
    Object.entries(RUNTIME_FILES).map(async ([key,[path,property]])=>{
      const file = await readTextFile(path);
      return [key,parseDataAssignment(file.content,property)];
    })
  );

  return {
    ok:true,
    sha:head,
    data:Object.fromEntries(entries)
  };
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;

  if(req.method !== "GET"){
    res.setHeader("Allow","GET, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }


  if(String((req.query || {}).runtime || "") === "1"){
    res.setHeader("Cache-Control","no-store, max-age=0");
    try {
      return res.status(200).json(await runtimePayload());
    } catch(error){
      console.error(error);
      return res.status(error.status || 500).json({
        error:error.code || "runtime_data_failed",
        message:"Falha ao carregar os dados atuais do Terra Z."
      });
    }
  }

  const githubAppReady = !!(process.env.GITHUB_APP_ID && process.env.GITHUB_INSTALLATION_ID && process.env.GITHUB_PRIVATE_KEY);
  const tokenReady = !!process.env.GITHUB_TOKEN;
  const editorReady = !!(process.env.EDITOR_AUTH_SECRET && (process.env.EDITOR_PASSWORD_HASH || process.env.EDITOR_PASSWORD));
  const editorPasswordMode = process.env.EDITOR_PASSWORD_HASH ? "hash" : (process.env.EDITOR_PASSWORD ? "plaintext" : "none");
  const rawEditorHash = process.env.EDITOR_PASSWORD_HASH ? String(process.env.EDITOR_PASSWORD_HASH) : "";
  const normalizedEditorHash = rawEditorHash.trim().replace(/^["']|["']$/g,"");
  const editorHashFormat = normalizedEditorHash
    ? (/^[a-f0-9]{64}$/i.test(normalizedEditorHash) ? "valid" : "invalid")
    : "missing";
  const editorHashHadWrapping = !!rawEditorHash && rawEditorHash !== normalizedEditorHash;
  let masterContent = "missing";
  if(process.env.MASTER_CONTENT_JSON){
    try {
      JSON.parse(process.env.MASTER_CONTENT_JSON);
      masterContent = "ready";
    } catch {
      masterContent = "invalid";
    }
  }

  return res.status(200).json({
    ok:true,
    editor_auth:editorReady,
    editor_password_mode:editorPasswordMode,
    editor_password_hash_format:editorHashFormat,
    editor_password_hash_had_wrapping:editorHashHadWrapping,
    github_write:githubAppReady || tokenReady,
    github_mode:githubAppReady ? "app" : (tokenReady ? "token" : "none"),
    master_content:masterContent,
    private_character_profiles:true,
    private_character_encryption:editorReady ? "aes-256-gcm" : "unavailable",
    visibility_system:"public-spoiler-master",
    secure_master_sections:true,
    secure_master_relations:true,
    relations_graph_v3:true,
    relations_entity_editor:true,
    portrait_framing:true,
    secure_master_timeline:true,
    timeline_event_editor:true,
    history_restore:true,
    deployment_control:true,
    history_model:"git-content-checkpoints-v1",
    deployment_strategy:"github-actions-deploy-hook",
    production_update_from_site:true,
    vercel_connector_required:false,
    vercel_connector_role:"optional-diagnostics",
    deployment_commit:String(process.env.VERCEL_GIT_COMMIT_SHA || ""),
    deployment_env:String(process.env.VERCEL_ENV || ""),
    ...githubConfig()
  });
}
