"use strict";

const crypto = require("crypto");

const API = "https://api.github.com";
const OWNER = process.env.GITHUB_OWNER || "Nierusen34";
const REPO = process.env.GITHUB_REPO || "terra-z";
const BRANCH = process.env.GITHUB_BRANCH || "main";

function base64url(input){
  return Buffer.from(input).toString("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
}

function appJwt(){
  const appId = process.env.GITHUB_APP_ID;
  let key = process.env.GITHUB_PRIVATE_KEY;
  if(!appId || !key) throw new Error("GitHub App não configurada.");
  key = key.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now()/1000);
  const header = base64url(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const payload = base64url(JSON.stringify({iat:now-60,exp:now+540,iss:appId}));
  const unsigned = header + "." + payload;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), key);
  return unsigned + "." + base64url(signature);
}

async function api(path, options, token){
  const response = await fetch(API + path, {
    ...options,
    headers: {
      "Accept":"application/vnd.github+json",
      "X-GitHub-Api-Version":"2022-11-28",
      "User-Agent":"terra-z-publisher",
      ...(token ? {"Authorization":"Bearer " + token} : {}),
      ...((options && options.headers) || {})
    }
  });
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch(e){ body = {raw:text}; }
  if(!response.ok){
    const err = new Error(body.message || ("GitHub HTTP " + response.status));
    err.status = response.status;
    err.body = body;
    throw err;
  }
  return body;
}

async function installationToken(){
  const installationId = process.env.GITHUB_INSTALLATION_ID;
  if(!installationId) throw new Error("GITHUB_INSTALLATION_ID não configurado.");
  const result = await api("/app/installations/" + installationId + "/access_tokens", {method:"POST"}, appJwt());
  return result.token;
}

async function getFile(path, token){
  return api("/repos/" + OWNER + "/" + REPO + "/contents/" + encodePath(path) + "?ref=" + encodeURIComponent(BRANCH), {method:"GET"}, token);
}

function encodePath(path){
  return String(path).split("/").map(encodeURIComponent).join("/");
}

async function putFile(path, content, message, token, sha){
  return api("/repos/" + OWNER + "/" + REPO + "/contents/" + encodePath(path), {
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      message,
      content:Buffer.from(content,"utf8").toString("base64"),
      branch:BRANCH,
      ...(sha ? {sha} : {})
    })
  }, token);
}

async function recentRuns(token){
  return api("/repos/" + OWNER + "/" + REPO + "/actions/runs?branch=" + encodeURIComponent(BRANCH) + "&per_page=20", {method:"GET"}, token);
}

async function git(path, options, token){
  return api("/repos/" + OWNER + "/" + REPO + path, options, token);
}

async function commitFiles(files, message, token){
  const ref = await git("/git/ref/heads/" + encodeURIComponent(BRANCH), {method:"GET"}, token);
  const parentSha = ref.object.sha;
  const parentCommit = await git("/git/commits/" + parentSha, {method:"GET"}, token);

  const tree = [];
  for(const file of files){
    if(file.delete){
      tree.push({path:file.path,mode:"100644",type:"blob",sha:null});
      continue;
    }
    const blob = await git("/git/blobs", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        content:file.encoding === "base64" ? file.content : Buffer.from(file.content,"utf8").toString("base64"),
        encoding:"base64"
      })
    }, token);
    tree.push({path:file.path,mode:"100644",type:"blob",sha:blob.sha});
  }

  const newTree = await git("/git/trees", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({base_tree:parentCommit.tree.sha,tree})
  }, token);

  const commit = await git("/git/commits", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({message,tree:newTree.sha,parents:[parentSha]})
  }, token);

  await git("/git/refs/heads/" + encodeURIComponent(BRANCH), {
    method:"PATCH",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({sha:commit.sha,force:false})
  }, token);

  return commit;
}

module.exports = { OWNER, REPO, BRANCH, installationToken, getFile, putFile, recentRuns, commitFiles };
