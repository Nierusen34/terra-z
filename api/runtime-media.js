import { applyCors } from "./_lib/cors.js";
import { readBinaryFile } from "./_lib/github.js";

const TYPES = {
  png:"image/png",
  jpg:"image/jpeg",
  jpeg:"image/jpeg",
  webp:"image/webp"
};

export default async function handler(req,res){
  if(applyCors(req,res)) return;

  if(req.method !== "GET"){
    res.setHeader("Allow","GET, OPTIONS");
    return res.status(405).end();
  }

  const path = String(req.query && req.query.path || "");
  if(!/^images\/characters\/[a-z0-9._/-]+\.(png|jpe?g|webp)$/i.test(path)){
    return res.status(400).json({error:"invalid_media_path"});
  }

  try {
    const file = await readBinaryFile(path);
    const ext = path.split(".").pop().toLowerCase();
    res.setHeader("Content-Type",TYPES[ext] || "application/octet-stream");
    res.setHeader("Cache-Control","public, max-age=60, s-maxage=60");
    return res.status(200).send(file.buffer);
  } catch(error){
    console.error(error);
    return res.status(error.status || 404).end();
  }
}
