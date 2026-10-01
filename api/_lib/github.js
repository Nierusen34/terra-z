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

export async function listCommits(limit=40){
  const perPage=Math.max(1,Math.min(Number(limit) || 40,100));
  return request(
    "/repos/" + repo() + "/commits?sha=" + encodeURIComponent(branch()) +
    "&per_page=" + perPage
  );
}

export async function compareCommits(baseSha,headSha){
  const base=String(baseSha || "");
  const head=String(headSha || "");
  if(!/^[a-f0-9]{40}$/i.test(base) || !/^[a-f0-9]{40}$/i.test(head)){
    return {status:"unknown",ahead_by:0,behind_by:0,total_commits:0};
  }
  if(base === head) return {status:"identical",ahead_by:0,behind_by:0,total_commits:0};

  return request(
    "/repos/" + repo() + "/compare/" +
    encodeURIComponent(base) + "..." + encodeURIComponent(head)
  );
}

async function commitTree(sha){
  const commit=await getCommit(sha);
  const tree=await request(
    "/repos/" + repo() + "/git/trees/" +
    encodeURIComponent(commit.tree.sha) + "?recursive=1"
  );
  return {commit,tree};
}

async function createTreeCommit(treeSha,message,parentSha){
  return request("/repos/" + repo() + "/git/commits",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      message,
      tree:treeSha,
      parents:[parentSha]
    })
  });
}

async function moveHead(sha){
  return request("/repos/" + repo() + "/git/refs/heads/" + refPath(branch()),{
    method:"PATCH",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({sha,force:false})
  });
}

async function checkedHead(expectedHeadSha){
  const head=await getHead();
  if(expectedHeadSha && expectedHeadSha !== head){
    const error=new Error("O repositório mudou desde que esta tela foi carregada.");
    error.code="head_conflict";
    error.status=409;
    error.currentHead=head;
    throw error;
  }
  return head;
}

export async function createCheckpointCommit(message,expectedHeadSha){
  const head=await checkedHead(expectedHeadSha);
  const current=await getCommit(head);
  const commit=await createTreeCommit(
    current.tree.sha,
    String(message || "[vercel-hook] deploy: checkpoint Terra Z").slice(0,180),
    head
  );
  await moveHead(commit.sha);

  return {
    sha:commit.sha,
    previousHead:head,
    repository:repo(),
    branch:branch()
  };
}

export async function restoreContentSnapshot(targetSha,expectedHeadSha,options={}){
  const target=String(targetSha || "");
  if(!/^[a-f0-9]{40}$/i.test(target)){
    const error=new Error("Checkpoint de restauração inválido.");
    error.code="invalid_restore_sha";
    error.status=400;
    throw error;
  }

  const head=await checkedHead(expectedHeadSha);
  if(target === head){
    const error=new Error("Este já é o estado atual do repositório.");
    error.code="snapshot_already_current";
    error.status=409;
    throw error;
  }

  const exactPaths=new Set(Array.isArray(options.paths) ? options.paths : []);
  const prefixes=(Array.isArray(options.prefixes) ? options.prefixes : [])
    .map(value => String(value || ""))
    .filter(Boolean);
  const managed=path => exactPaths.has(path) || prefixes.some(prefix => path.startsWith(prefix));

  const [currentInfo,targetInfo]=await Promise.all([
    commitTree(head),
    commitTree(target)
  ]);

  const currentEntries=(currentInfo.tree.tree || []).filter(item =>
    item && item.type === "blob" && managed(String(item.path || ""))
  );
  const targetEntries=(targetInfo.tree.tree || []).filter(item =>
    item && item.type === "blob" && managed(String(item.path || ""))
  );

  const currentMap=new Map(currentEntries.map(item => [item.path,item]));
  const targetMap=new Map(targetEntries.map(item => [item.path,item]));

  const missingRequired=[...exactPaths].filter(path => !targetMap.has(path));
  if(missingRequired.length){
    const error=new Error("Este ponto é antigo demais para uma restauração segura de conteúdo.");
    error.code="incompatible_snapshot";
    error.status=409;
    error.missingPaths=missingRequired;
    throw error;
  }

  const allPaths=new Set([...currentMap.keys(),...targetMap.keys()]);
  const entries=[];
  const changed=[];
  const deleted=[];

  [...allPaths].sort().forEach(path => {
    const current=currentMap.get(path);
    const desired=targetMap.get(path);

    if(desired){
      if(current && current.sha === desired.sha && current.mode === desired.mode) return;
      entries.push({
        path,
        mode:desired.mode || "100644",
        type:"blob",
        sha:desired.sha
      });
      changed.push(path);
      return;
    }

    if(current && prefixes.some(prefix => path.startsWith(prefix))){
      entries.push({
        path,
        mode:current.mode || "100644",
        type:"blob",
        sha:null
      });
      deleted.push(path);
    }
  });

  if(!entries.length){
    const error=new Error("O conteúdo gerenciado já corresponde a este checkpoint.");
    error.code="snapshot_already_current";
    error.status=409;
    throw error;
  }

  const tree=await request("/repos/" + repo() + "/git/trees",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      base_tree:currentInfo.commit.tree.sha,
      tree:entries
    })
  });

  const message=String(
    options.message || ("restore: restaurar conteúdo de " + target.slice(0,7))
  ).slice(0,180);

  const commit=await createTreeCommit(tree.sha,message,head);
  await moveHead(commit.sha);

  return {
    sha:commit.sha,
    previousHead:head,
    sourceSha:target,
    changedPaths:changed,
    deletedPaths:deleted,
    repository:repo(),
    branch:branch()
  };
}

export async function workflowRunStatus(sha,workflowName){
  const value=String(sha || "");
  if(!/^[a-f0-9]{40}$/i.test(value)) return {status:"pending"};

  const data=await request(
    "/repos/" + repo() + "/actions/runs?head_sha=" +
    encodeURIComponent(value) + "&per_page=30"
  );

  const needle=String(workflowName || "").toLowerCase();
  const run=(data.workflow_runs || []).find(item =>
    String(item.name || "").toLowerCase().includes(needle)
  );

  if(!run) return {status:"pending"};
  if(run.status !== "completed") return {status:"pending",run_id:run.id};
  if(run.conclusion === "success") return {status:"published",run_id:run.id};
  if(run.conclusion === "skipped") return {status:"skipped",run_id:run.id};
  return {
    status:"failed",
    run_id:run.id,
    conclusion:run.conclusion
  };
}

export async function readTextFile(path){
  const data = await request("/repos/" + repo() + "/contents/" + path.split("/").map(encodeURIComponent).join("/") + "?ref=" + encodeURIComponent(branch()));
  if(!data || data.type !== "file") throw new Error("Arquivo não encontrado: " + path);
  return {
    sha:data.sha,
    content:Buffer.from(String(data.content || "").replace(/\s+/g,""),"base64").toString("utf8")
  };
}


export async function readBinaryFile(path){
  const data = await request("/repos/" + repo() + "/contents/" + path.split("/").map(encodeURIComponent).join("/") + "?ref=" + encodeURIComponent(branch()));
  if(!data || data.type !== "file") throw new Error("Arquivo não encontrado: " + path);
  return {
    sha:data.sha,
    buffer:Buffer.from(String(data.content || "").replace(/\s+/g,""),"base64")
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
