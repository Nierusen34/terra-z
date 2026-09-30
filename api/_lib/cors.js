const REQUIRED_ORIGINS = [
  "https://nierusen34.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
];

function normalizeOrigin(value){
  const raw = String(value || "").trim();
  if(!raw) return "";

  try {
    return new URL(raw).origin;
  } catch {
    return raw.replace(/\/+$/,"");
  }
}

export function allowedOrigins(){
  const configured = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  return [...new Set([
    ...REQUIRED_ORIGINS.map(normalizeOrigin),
    ...configured
  ])];
}

export function applyCors(req, res){
  const rawOrigin = req.headers.origin || "";
  const origin = normalizeOrigin(rawOrigin);
  const allowed = allowedOrigins();

  // Requisições feitas pelo próprio domínio da API são sempre válidas.
  // Isso evita bloquear o login quando o Terra Z está aberto diretamente
  // no domínio de produção da Vercel (ex.: https://terra-z.vercel.app).
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "https")
    .split(",")[0]
    .trim();
  const forwardedHost = String(req.headers["x-forwarded-host"] || req.headers.host || "")
    .split(",")[0]
    .trim();
  const requestOrigin = forwardedHost
    ? normalizeOrigin(forwardedProto + "://" + forwardedHost)
    : "";

  const isAllowed = !origin || origin === requestOrigin || allowed.includes(origin);

  if(origin && isAllowed){
    res.setHeader("Access-Control-Allow-Origin", rawOrigin || origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if(req.method === "OPTIONS"){
    if(!isAllowed){
      return res.status(403).json({
        error:"origin_not_allowed",
        message:"Origem não autorizada.",
        received_origin:rawOrigin
      });
    }

    res.status(204).end();
    return true;
  }

  if(!isAllowed){
    res.status(403).json({
      error:"origin_not_allowed",
      message:"Origem não autorizada.",
      received_origin:rawOrigin
    });
    return true;
  }

  return false;
}
