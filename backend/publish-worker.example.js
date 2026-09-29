export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "https://nierusen34.github.io";
    const cors = {
      "Access-Control-Allow-Origin": origin === allowedOrigin ? origin : allowedOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors);
    }

    if (origin !== allowedOrigin) {
      return json({ error: "Origin not allowed" }, 403, cors);
    }

    const email = (request.headers.get("Cf-Access-Authenticated-User-Email") || "").toLowerCase();
    const allowedEditors = String(env.ALLOWED_EDITORS || "")
      .split(",").map(v => v.trim().toLowerCase()).filter(Boolean);

    if (!email || !allowedEditors.includes(email)) {
      return json({ error: "Editor not authorized" }, 401, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, cors);
    }

    if (body.type !== "content-overrides" || !isValidChanges(body.changes)) {
      return json({ error: "Invalid publish payload" }, 400, cors);
    }

    const owner = env.GITHUB_OWNER || "Nierusen34";
    const repo = env.GITHUB_REPO || "terra-z";
    const branch = env.GITHUB_BRANCH || "main";
    const path = "data/content-overrides.js";
    const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
    const headers = githubHeaders(env.GITHUB_TOKEN);

    const currentResponse = await fetch(api, { headers });
    if (!currentResponse.ok) {
      return json({ error: "Unable to read current content" }, 502, cors);
    }

    const currentFile = await currentResponse.json();
    const source = decodeBase64(currentFile.content || "");
    const current = parseOverrides(source);

    if (String(body.baseVersion || "initial") !== String(current.version || "initial")) {
      return json({
        error: "Content changed remotely",
        currentVersion: current.version || "initial"
      }, 409, cors);
    }

    const merged = Object.assign({}, current.edits || {}, body.changes);
    const nextVersion = new Date().toISOString();
    const nextData = {
      version: nextVersion,
      updatedAt: nextVersion,
      edits: merged
    };
    const nextSource = renderOverrides(nextData);

    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: sanitizeMessage(body.message),
          content: encodeBase64(nextSource),
          sha: currentFile.sha,
          branch
        })
      }
    );

    const result = await updateResponse.json();
    if (!updateResponse.ok) {
      return json({ error: result.message || "GitHub update failed" }, 502, cors);
    }

    return json({
      ok: true,
      version: nextVersion,
      commitSha: result.commit && result.commit.sha,
      editor: email
    }, 200, cors);
  }
};

function isValidChanges(changes) {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) return false;
  const entries = Object.entries(changes);
  if (entries.length < 1 || entries.length > 602) return false;
  return entries.every(([key, value]) =>
    /^tz-\d{4}$/.test(key) &&
    typeof value === "string" &&
    value.length <= 20000
  );
}

function parseOverrides(source) {
  const marker = "window.TerraZData.contentOverrides = ";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("Invalid override file");
  const jsonStart = start + marker.length;
  const jsonEnd = source.indexOf(";\n", jsonStart);
  if (jsonEnd < 0) throw new Error("Invalid override file");
  return JSON.parse(source.slice(jsonStart, jsonEnd));
}

function renderOverrides(data) {
  return `(function(){\n"use strict";\n\nwindow.TerraZData = window.TerraZData || {};\n\n// Pequenas correções publicadas pelo editor visual.\nwindow.TerraZData.contentOverrides = ${JSON.stringify(data, null, 2)};\n\n})();\n`;
}

function githubHeaders(token) {
  return {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "terra-z-publisher",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

function sanitizeMessage(message) {
  const value = String(message || "content: publicar alterações pelo editor").replace(/[\r\n]+/g, " ").trim();
  return value.slice(0, 120) || "content: publicar alterações pelo editor";
}

function json(value, status, extraHeaders) {
  return new Response(JSON.stringify(value), {
    status,
    headers: Object.assign({ "Content-Type": "application/json; charset=utf-8" }, extraHeaders)
  });
}

function decodeBase64(value) {
  const binary = atob(String(value).replace(/\s+/g, ""));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}
