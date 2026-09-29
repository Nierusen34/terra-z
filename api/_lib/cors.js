const DEFAULT_ORIGINS = [
  "https://nierusen34.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
];

export function allowedOrigins(){
  const configured = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(v => v.trim())
    .filter(Boolean);
  return configured.length ? configured : DEFAULT_ORIGINS;
}

export function applyCors(req, res){
  const origin = req.headers.origin || "";
  const allowed = allowedOrigins();

  if(origin && allowed.includes(origin)){
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if(req.method === "OPTIONS"){
    res.status(204).end();
    return true;
  }

  if(origin && !allowed.includes(origin)){
    res.status(403).json({ error:"origin_not_allowed", message:"Origem não autorizada." });
    return true;
  }

  return false;
}
