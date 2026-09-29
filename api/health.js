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

  return res.status(200).json({
    ok:true,
    editor_auth:editorReady,
    github_write:githubAppReady || tokenReady,
    github_mode:githubAppReady ? "app" : (tokenReady ? "token" : "none"),
    ...githubConfig()
  });
}
