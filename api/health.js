import { applyCors } from "./_lib/cors.js";
import { githubConfig } from "./_lib/github.js";

export default async function handler(req,res){
  if(applyCors(req,res)) return;

  if(req.method !== "GET"){
    res.setHeader("Allow","GET, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
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
    ...githubConfig()
  });
}
