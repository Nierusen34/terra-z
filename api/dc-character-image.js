import { applyCors } from "./_lib/cors.js";

const FANDOM_API = "https://dc.fandom.com/api.php";
const MAX_TITLE_LENGTH = 180;

function safeText(value,max=MAX_TITLE_LENGTH){
  return String(value || "").trim().slice(0,max);
}

function cleanTitle(value){
  return safeText(value).replace(/[\u0000-\u001f\u007f]/g,"");
}

function pageImage(page){
  if(!page || page.missing) return "";
  return (
    (page.thumbnail && page.thumbnail.source) ||
    (page.original && page.original.source) ||
    ""
  );
}

function pageUrl(page){
  if(page && page.fullurl) return page.fullurl;
  if(page && page.title){
    return "https://dc.fandom.com/wiki/" + encodeURIComponent(page.title.replace(/ /g,"_"));
  }
  return "";
}

async function fandom(params){
  const url = new URL(FANDOM_API);
  Object.entries(params).forEach(([key,value])=>{
    if(value !== undefined && value !== null && value !== "") url.searchParams.set(key,String(value));
  });

  const response = await fetch(url,{
    headers:{
      "Accept":"application/json",
      "User-Agent":"Terra-Z/1.0 (character portrait resolver)"
    },
    signal:AbortSignal.timeout(9000)
  });

  if(!response.ok){
    const error = new Error("DC Database respondeu HTTP " + response.status);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function exactPage(title){
  const data = await fandom({
    action:"query",
    format:"json",
    formatversion:"2",
    redirects:"1",
    prop:"pageimages|info",
    inprop:"url",
    piprop:"thumbnail|original|name",
    pithumbsize:"900",
    pilicense:"any",
    titles:title
  });

  return data && data.query && Array.isArray(data.query.pages)
    ? data.query.pages[0]
    : null;
}

function scoreCandidate(page,name,preferredTitle){
  const title=String((page && page.title) || "").toLowerCase();
  const n=String(name || "").toLowerCase();
  const preferred=String(preferredTitle || "").toLowerCase();
  let score=0;
  if(title === preferred) score += 100;
  if(title.includes("(prime earth)")) score += 50;
  if(n && title.startsWith(n)) score += 30;
  if(pageImage(page)) score += 20;
  return score;
}

async function searchPage(name,preferredTitle){
  const query = [name,"Prime Earth"].filter(Boolean).join(" ");
  const data = await fandom({
    action:"query",
    format:"json",
    formatversion:"2",
    generator:"search",
    gsrsearch:query,
    gsrnamespace:"0",
    gsrlimit:"8",
    prop:"pageimages|info",
    inprop:"url",
    piprop:"thumbnail|original|name",
    pithumbsize:"900",
    pilicense:"any"
  });

  const pages = data && data.query && Array.isArray(data.query.pages)
    ? data.query.pages.filter(page=>page && !page.missing)
    : [];

  pages.sort((a,b)=>scoreCandidate(b,name,preferredTitle)-scoreCandidate(a,name,preferredTitle));
  return pages.find(page=>pageImage(page)) || pages[0] || null;
}

export default async function handler(req,res){
  if(applyCors(req,res)) return;

  if(req.method !== "GET"){
    res.setHeader("Allow","GET, OPTIONS");
    return res.status(405).json({error:"method_not_allowed"});
  }

  const title=cleanTitle((req.query || {}).title);
  const name=cleanTitle((req.query || {}).name || title.replace(/\s*\([^)]*\)\s*$/,""));

  if(!title || title.length > MAX_TITLE_LENGTH){
    return res.status(400).json({
      error:"invalid_title",
      message:"Título da página da DC Database inválido."
    });
  }

  try{
    let page=await exactPage(title);

    if(!page || page.missing || !pageImage(page)){
      page=await searchPage(name,title);
    }

    const imageUrl=pageImage(page);

    if(!page || !imageUrl){
      res.setHeader("Cache-Control","public, max-age=300, s-maxage=21600, stale-while-revalidate=86400");
      return res.status(200).json({
        ok:true,
        found:false,
        name,
        requestedTitle:title,
        provider:"dc-fandom"
      });
    }

    res.setHeader("Cache-Control","public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");

    return res.status(200).json({
      ok:true,
      found:true,
      name,
      requestedTitle:title,
      title:page.title || title,
      imageUrl,
      pageUrl:pageUrl(page),
      provider:"dc-fandom",
      source:"DC Database · Fandom"
    });
  }catch(error){
    console.error("Terra Z DC portrait resolver:",error);
    res.setHeader("Cache-Control","no-store");
    return res.status(502).json({
      error:"dc_source_unavailable",
      message:"A fonte automática de retratos da DC está temporariamente indisponível."
    });
  }
}
