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

module.exports = { OWNER, REPO, BRANCH, installationToken, getFile, putFile, recentRuns };
