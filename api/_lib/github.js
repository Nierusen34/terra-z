import crypto from "node:crypto";

const API = "https://api.github.com";
const DEFAULT_REPO = "Nierusen34/terra-z";

function repo(){
  return process.env.GITHUB_REPOSITORY || DEFAULT_REPO;
}

function branch(){
  return process.env.GITHUB_BRANCH || "main";
}

function base64urlJson(value){
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

async function appInstallationToken(){
  const appId = process.env.GITHUB_APP_ID;
  const installationId = process.env.GITHUB_INSTALLATION_ID;
  const privateKeyRaw = process.env.GITHUB_PRIVATE_KEY;

  if(!appId || !installationId || !privateKeyRaw) return null;

  const now = Math.floor(Date.now()/1000);
  const header = base64urlJson({alg:"RS256",typ:"JWT"});
  const payload = base64urlJson({iat:now-30,exp:now+540,iss:appId});
  const unsigned = header + "." + payload;
  const privateKey = privateKeyRaw.replace(/\\n/g,"\n");
  const signature = crypto.sign("RSA-SHA256",Buffer.from(unsigned),privateKey).toString("base64url");
  const jwt = unsigned + "." + signature;

  const response = await fetch(API + "/app/installations/" + installationId + "/access_tokens",{
    method:"POST",
    headers:{
      "Accept":"application/vnd.github+json",
      "Authorization":"Bearer " + jwt,
      "X-GitHub-Api-Version":"2022-11-28",
      "User-Agent":"terra-z-publishing-api"
    }
  });

  if(!response.ok){
    const body = await response.text();
    throw new Error("Falha ao obter installation token: " + response.status + " " + body.slice(0,300));
  }

  const data = await response.json();
  return data.token;
}

export async function githubToken(){
  if(process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  const token = await appInstallationToken();
  if(token) return token;
  throw new Error("Configure GITHUB_TOKEN ou as credenciais da GitHub App.");
}

async function request(path, options={}){
  const token = await githubToken();
  const response = await fetch(API + path,{
    ...options,
    headers:{
      "Accept":"application/vnd.github+json",
      "Authorization":"Bearer " + token,
      "X-GitHub-Api-Version":"2022-11-28",
      "User-Agent":"terra-z-publishing-api",
      ...(options.headers || {})
    }
  });

  if(!response.ok){
    const body = await response.text();
    const error = new Error("GitHub API " + response.status + ": " + body.slice(0,500));
    error.status = response.status;
    throw error;
  }

  if(response.status === 204) return null;
  return response.json();
}

function refPath(name){
  return name.split("/").map(encodeURIComponent).join("/");
}

export async function getHead(){
  const data = await request("/repos/" + repo() + "/git/ref/heads/" + refPath(branch()));
  return data.object.sha;
}

export async function getCommit(sha){
  return request("/repos/" + repo() + "/git/commits/" + encodeURIComponent(sha));
}

export async function readTextFile(path){
  const data = await request("/repos/" + repo() + "/contents/" + path.split("/").map(encodeURIComponent).join("/") + "?ref=" + encodeURIComponent(branch()));
  if(!data || data.type !== "file") throw new Error("Arquivo não encontrado: " + path);
  return {
    sha:data.sha,
    content:Buffer.from(String(data.content || "").replace(/\s+/g,""),"base64").toString("utf8")
  };
}

async function createBlob(content, encoding){
  return request("/repos/" + repo() + "/git/blobs",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({content,encoding})
  });
}

export async function commitFiles(files, message, expectedHeadSha){
  if(!Array.isArray(files) || files.length === 0) throw new Error("Nenhum arquivo para publicar.");

  const head = await getHead();
  if(expectedHeadSha && expectedHeadSha !== head){
    const error = new Error("O repositório mudou desde que a edição começou.");
    error.code = "head_conflict";
    error.status = 409;
    error.currentHead = head;
    throw error;
  }

  const currentCommit = await getCommit(head);
  const entries = [];

  for(const file of files){
    if(file.delete){
      entries.push({
        path:file.path,
        mode:"100644",
        type:"blob",
        sha:null
      });
      continue;
    }

    const blob = await createBlob(file.content, file.encoding || "utf-8");
    entries.push({
      path:file.path,
      mode:"100644",
      type:"blob",
      sha:blob.sha
    });
  }

  const tree = await request("/repos/" + repo() + "/git/trees",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      base_tree:currentCommit.tree.sha,
      tree:entries
    })
  });

  const commit = await request("/repos/" + repo() + "/git/commits",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      message,
      tree:tree.sha,
      parents:[head]
    })
  });

  await request("/repos/" + repo() + "/git/refs/heads/" + refPath(branch()),{
    method:"PATCH",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({sha:commit.sha,force:false})
  });

  return {
    sha:commit.sha,
    previousHead:head,
    repository:repo(),
    branch:branch()
  };
}

export async function pagesRunStatus(sha){
  const url = API + "/repos/" + repo() + "/actions/runs?head_sha=" + encodeURIComponent(sha) + "&per_page=20";
  const token = await githubToken().catch(()=>null);
  const response = await fetch(url,{
    headers:{
      "Accept":"application/vnd.github+json",
      ...(token ? {"Authorization":"Bearer " + token} : {}),
      "X-GitHub-Api-Version":"2022-11-28",
      "User-Agent":"terra-z-publishing-api"
    }
  });

  if(!response.ok) return {status:"pending"};

  const data = await response.json();
  const run = (data.workflow_runs || []).find(item => /pages build and deployment/i.test(item.name || ""));

  if(!run) return {status:"pending"};
  if(run.status !== "completed") return {status:"pending",run_id:run.id};
  if(run.conclusion === "success") return {status:"published",run_id:run.id};
  return {status:"failed",run_id:run.id,conclusion:run.conclusion};
}

export function githubConfig(){
  return {repository:repo(),branch:branch()};
}
