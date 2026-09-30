import crypto from "node:crypto";
import { readTextFile } from "./github.js";

export const PRIVATE_SESSIONS_PATH = "data/private-sessions.enc.json";

function encryptionKey(){
  const secret = process.env.EDITOR_AUTH_SECRET;
  if(!secret) throw new Error("EDITOR_AUTH_SECRET não configurado.");
  return crypto
    .createHash("sha256")
    .update("terra-z-private-sessions-v1\0")
    .update(String(secret))
    .digest();
}

function decode(value){
  return Buffer.from(String(value || ""),"base64url");
}

export async function readPrivateSessions(){
  let file;
  try {
    file = await readTextFile(PRIVATE_SESSIONS_PATH);
  } catch(error){
    if(error && error.status === 404) return [];
    throw error;
  }

  let envelope;
  try {
    envelope = JSON.parse(file.content);
  } catch {
    throw new Error("Arquivo privado de sessões contém JSON inválido.");
  }

  if(!envelope || envelope.version !== 1 ||
     envelope.algorithm !== "aes-256-gcm" ||
     !envelope.iv || !envelope.tag || !envelope.ciphertext){
    throw new Error("Formato do arquivo privado de sessões não reconhecido.");
  }

  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm",encryptionKey(),decode(envelope.iv));
    decipher.setAuthTag(decode(envelope.tag));
    const plain = Buffer.concat([
      decipher.update(decode(envelope.ciphertext)),
      decipher.final()
    ]).toString("utf8");

    const data = JSON.parse(plain);
    if(!Array.isArray(data)) throw new Error("Lista privada inválida.");
    return data;
  } catch(error){
    console.error("Falha ao descriptografar sessões privadas:",error);
    const wrapped = new Error("Não foi possível abrir as sessões privadas com a chave atual.");
    wrapped.code = "private_sessions_decrypt_failed";
    wrapped.status = 500;
    throw wrapped;
  }
}

export function renderPrivateSessions(sessions){
  const payload = JSON.stringify(Array.isArray(sessions) ? sessions : []);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm",encryptionKey(),iv);
  const ciphertext = Buffer.concat([
    cipher.update(payload,"utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    version:1,
    algorithm:"aes-256-gcm",
    iv:iv.toString("base64url"),
    tag:tag.toString("base64url"),
    ciphertext:ciphertext.toString("base64url")
  },null,2) + "\n";
}
