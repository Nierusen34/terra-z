const args=process.argv.slice(2);
function value(name,fallback=""){
  const index=args.indexOf(name);
  return index>=0&&args[index+1]?args[index+1]:fallback;
}
function has(name){ return args.includes(name); }

const base=value("--url");
const expectedSha=value("--expected-sha");
const waitSeconds=Math.max(0,Number(value("--wait","0"))||0);
const apiMode=has("--api");

if(!base){
  console.error("Uso: node scripts/smoke-test.mjs --url <URL> [--api] [--expected-sha <sha>] [--wait <segundos>]");
  process.exit(2);
}

const root=base.endsWith("/")?base:base+"/";
const deadline=Date.now()+waitSeconds*1000;

async function fetchText(url){
  const response=await fetch(url,{headers:{"cache-control":"no-cache"}});
  if(!response.ok) throw new Error(url+" respondeu HTTP "+response.status);
  return {response,text:await response.text()};
}

async function staticSmoke(){
  const stamp=Date.now();
  const home=await fetchText(root+"?smoke="+stamp);
  if(!/<title[\s>]/i.test(home.text)) throw new Error("HTML principal não contém <title>");
  if(!home.text.includes("js/characters.js")) throw new Error("HTML principal não carrega js/characters.js");
  if(!home.text.includes("js/integrity-checker.js")) throw new Error("HTML principal não carrega o verificador de integridade");

  const assets=[
    "terra-z.css",
    "js/characters.js",
    "js/integrity-checker.js",
    "data/character-overrides.js",
    "data/character-meta.js",
    "data/character-media.js"
  ];

  for(const asset of assets){
    const result=await fetch(root+asset+"?smoke="+stamp,{headers:{"cache-control":"no-cache"}});
    if(!result.ok) throw new Error(asset+" respondeu HTTP "+result.status);
    const length=Number(result.headers.get("content-length")||0);
    if(length===0){
      const body=await result.text();
      if(!body.trim()) throw new Error(asset+" retornou conteúdo vazio");
    }
  }

  return true;
}

async function apiSmoke(){
  const response=await fetch(root.replace(/\/$/,"")+"/api/health?smoke="+Date.now(),{
    headers:{"cache-control":"no-cache"}
  });
  if(!response.ok) throw new Error("/api/health respondeu HTTP "+response.status);
  const body=await response.json();
  if(body.ok!==true) throw new Error("/api/health não retornou ok:true");
  if(body.private_character_profiles!==true) throw new Error("Backend ainda não anuncia private_character_profiles:true");

  if(expectedSha){
    const deployed=String(body.deployment_commit||"");
    if(!deployed) throw new Error("Backend não informou deployment_commit");
    if(deployed!==expectedSha&&!deployed.startsWith(expectedSha)&&!expectedSha.startsWith(deployed)){
      const error=new Error("Deploy ainda está em "+deployed.slice(0,12)+"; esperado "+expectedSha.slice(0,12));
      error.code="WAIT_FOR_SHA";
      throw error;
    }
  }
  return body;
}

async function attempt(){
  await staticSmoke();
  if(apiMode) await apiSmoke();
}

let lastError=null;
do{
  try{
    await attempt();
    console.log("✓ Smoke test aprovado:",base);
    if(expectedSha) console.log("✓ Commit esperado ativo:",expectedSha.slice(0,12));
    process.exit(0);
  }catch(error){
    lastError=error;
    if(Date.now()>=deadline) break;
    console.log("Aguardando deploy:",error.message);
    await new Promise(resolve=>setTimeout(resolve,10000));
  }
}while(Date.now()<=deadline);

console.error("✗ Smoke test reprovado:",lastError?lastError.message:"erro desconhecido");
process.exit(1);
