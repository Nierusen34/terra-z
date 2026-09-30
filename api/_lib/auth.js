import crypto from "node:crypto";

const TOKEN_TTL_SECONDS = 4 * 60 * 60;

function base64url(value){
  return Buffer.from(value).toString("base64url");
}

function sign(value){
  const secret = process.env.EDITOR_AUTH_SECRET;
  if(!secret) throw new Error("EDITOR_AUTH_SECRET não configurado.");
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a,b){
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if(left.length !== right.length) return false;
  return crypto.timingSafeEqual(left,right);
}

function passwordHash(password){
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

export function verifyPassword(password){
  const expectedHash = process.env.EDITOR_PASSWORD_HASH;
  const fallbackPassword = process.env.EDITOR_PASSWORD;

  if(expectedHash){
    const normalizedHash = String(expectedHash)
      .trim()
      .replace(/^["']|["']$/g,"")
      .toLowerCase();
    return safeEqual(passwordHash(password), normalizedHash);
  }

  if(fallbackPassword){
    return safeEqual(String(password), String(fallbackPassword));
  }

  throw new Error("EDITOR_PASSWORD_HASH/EDITOR_PASSWORD não configurado.");
}

export function createEditorToken(){
  const now = Math.floor(Date.now()/1000);
  const payload = {
    sub:"terra-z-editor",
    iat:now,
    exp:now + TOKEN_TTL_SECONDS
  };
  const encoded = base64url(JSON.stringify(payload));
  return encoded + "." + sign(encoded);
}

export function verifyEditorToken(token){
  if(!token || !token.includes(".")) return false;
  const [encoded, signature] = token.split(".",2);

  if(!safeEqual(signature, sign(encoded))) return false;

  try {
    const payload = JSON.parse(Buffer.from(encoded,"base64url").toString("utf8"));
    return payload.sub === "terra-z-editor" && Number(payload.exp) > Math.floor(Date.now()/1000);
  } catch {
    return false;
  }
}

export function requireEditor(req,res){
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if(!verifyEditorToken(token)){
    res.status(401).json({ error:"unauthorized", message:"Sessão de editor inválida ou expirada." });
    return false;
  }

  return true;
}

export { TOKEN_TTL_SECONDS };
