"use strict";

const crypto = require("crypto");

function json(res, status, body){
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function allowedOrigins(){
  const configured = String(process.env.TERRAZ_ALLOWED_ORIGINS || "")
    .split(",").map(x=>x.trim()).filter(Boolean);
  if(configured.length) return configured;
  return ["https://nierusen34.github.io", "http://localhost:3000", "http://127.0.0.1:3000"];
}

function applyCors(req, res){
  const origin = req.headers.origin || "";
  const allowed = allowedOrigins();
  if(origin && allowed.includes(origin)){
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-TerraZ-Editor-Key");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

function safeEqual(a,b){
  const aa = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  if(aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function requireEditor(req, res){
  const expected = process.env.TERRAZ_EDITOR_KEY;
  if(!expected){
    json(res, 503, { error:"publishing_not_configured", message:"TERRAZ_EDITOR_KEY não configurada." });
    return false;
  }
  const received = req.headers["x-terraz-editor-key"];
  if(!safeEqual(received, expected)){
    json(res, 401, { error:"unauthorized", message:"Chave de editor inválida." });
    return false;
  }
  return true;
}

module.exports = { json, applyCors, requireEditor };
