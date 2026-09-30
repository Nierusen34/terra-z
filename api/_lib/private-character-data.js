import crypto from "node:crypto";
import { readTextFile } from "./github.js";

export const PRIVATE_CHARACTER_DATA_PATH = "data/private-character-data.enc.json";

function encryptionKey(){
  const secret = process.env.EDITOR_AUTH_SECRET;
  if(!secret) throw new Error("EDITOR_AUTH_SECRET não configurado.");
  return crypto
    .createHash("sha256")
    .update("terra-z-private-character-data-v1\0")
    .update(String(secret))
    .digest();
}

function decode(value){
  return Buffer.from(String(value || ""),"base64url");
}

export async function readPrivateCharacterData(){
  let file;
  try {
    file = await readTextFile(PRIVATE_CHARACTER_DATA_PATH);
  } catch(error){
    if(error && error.status === 404) return {characters:{}};
    throw error;
  }

  let envelope;
  try {
    envelope = JSON.parse(file.content);
  } catch {
    throw new Error("Arquivo privado de personagens contém JSON inválido.");
  }

  if(!envelope || envelope.version !== 1 ||
     envelope.algorithm !== "aes-256-gcm" ||
     !envelope.iv || !envelope.tag || !envelope.ciphertext){
    throw new Error("Formato do arquivo privado de personagens não reconhecido.");
  }

  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm",encryptionKey(),decode(envelope.iv));
    decipher.setAuthTag(decode(envelope.tag));
    const plain = Buffer.concat([
      decipher.update(decode(envelope.ciphertext)),
      decipher.final()
    ]).toString("utf8");

    const data = JSON.parse(plain);
    if(!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Dados privados inválidos.");
    if(!data.characters || typeof data.characters !== "object" || Array.isArray(data.characters)) data.characters = {};
    return data;
  } catch(error){
    console.error("Falha ao descriptografar dados privados de personagens:",error);
    const wrapped = new Error("Não foi possível abrir os dados privados de personagens com a chave atual.");
    wrapped.code = "private_character_data_decrypt_failed";
    wrapped.status = 500;
    throw wrapped;
  }
}

export function renderPrivateCharacterData(data){
  const safe = data && typeof data === "object" && !Array.isArray(data) ? data : {characters:{}};
  if(!safe.characters || typeof safe.characters !== "object" || Array.isArray(safe.characters)) safe.characters = {};

  const payload = JSON.stringify(safe);
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
