(function(){
"use strict";

window.TerraZApp=window.TerraZApp||{};
var core=window.TerraZCore;
if(!core) throw new Error("Terra Z: núcleo não carregado antes de js/backup-export.js");

var showToast=core.showToast;
var escapeHtml=core.escapeHtml;

function el(id){return document.getElementById(id);}
function app(){return window.TerraZApp||{};}
function backend(){return app().backend;}
function authenticated(){var b=backend();return !!(b&&b.isAuthenticated&&b.isAuthenticated());}
function download(name,content,type){
  var blob=new Blob([content],{type:type||"application/octet-stream"});
  var url=URL.createObjectURL(blob);
  var a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
}
function stamp(){return new Date().toISOString().replace(/[:.]/g,"-");}
function setStatus(message,state){
  var node=el("backupExportStatus");if(!node)return;
  node.textContent=message||"";node.setAttribute("data-state",state||"idle");
}
async function completeBackup(){
  if(!authenticated())return;
  var button=el("backupExportComplete");if(button)button.disabled=true;
  setStatus("Montando snapshot criptografado da campanha…","working");
  try{
    var result=await backend().request("/api/publish",{method:"POST",body:{action:"export-backup"}});
    download("terra-z-backup-"+stamp()+".json",JSON.stringify(result.backup,null,2),"application/json;charset=utf-8");
    setStatus("Backup completo gerado. Conteúdo Mestre permanece criptografado dentro do arquivo.","success");
    showToast("Backup completo do Terra Z exportado.","success",4500);
  }catch(error){
    console.error("Terra Z backup export:",error);
    setStatus(error.message||"Falha ao exportar backup.","error");
    showToast(error.message||"Falha ao exportar backup.","error",6000);
  }finally{if(button)button.disabled=false;}
}
function publicSnapshot(){
  var d=window.TerraZData||{},a=app();
  var characters=a.characters&&a.characters.names?a.characters.names().map(function(name){return {name:name,profile:a.characters.get(name)};}):[];
  return {
    generatedAt:new Date().toISOString(),
    characters:characters,
    districts:d.districts||[],
    cities:d.externalCities||[],
    teams:d.teams||{},
    sessions:a.sessions&&a.sessions.getAll?a.sessions.getAll().filter(function(x){return x.visibility!=="master";}):(d.sessions||[]),
    timeline:a.timeline&&a.timeline.events?a.timeline.events().filter(function(x){return x.visibility!=="master";}):[],
    graph:a.graph&&a.graph.getData?a.graph.getData():{},
    taxonomy:d.characterTaxonomy||{}
  };
}
function htmlEscape(value){
  return String(value==null?"":value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function readingHtml(includeMaster){
  var snap=publicSnapshot();
  var sections=[];
  sections.push("<h1>Terra Z</h1><p>Exportado em "+htmlEscape(new Date().toLocaleString("pt-BR"))+"</p>");
  sections.push("<h2>Personagens</h2>"+snap.characters.map(function(row){
    return "<article><h3>"+htmlEscape(row.name)+"</h3><pre>"+htmlEscape(JSON.stringify(row.profile,null,2))+"</pre></article>";
  }).join(""));
  sections.push("<h2>Sessões</h2>"+snap.sessions.map(function(s){
    return "<article><h3>"+htmlEscape(s.title||"Sessão")+"</h3><p>"+htmlEscape(s.inWorldDate||s.realDate||"")+"</p><p>"+htmlEscape(s.summary||"")+"</p></article>";
  }).join(""));
  sections.push("<h2>Linha do Tempo</h2>"+snap.timeline.map(function(e){
    return "<article><h3>"+htmlEscape(e.title||e.year||"Evento")+"</h3><p>"+htmlEscape(e.year||"")+"</p><p>"+htmlEscape(e.text||"")+"</p></article>";
  }).join(""));

  if(includeMaster&&authenticated()){
    var pc=app().privateContent;
    var master=pc&&pc.getMasterState?pc.getMasterState():{};
    sections.push("<h2>Conteúdo Mestre</h2><pre>"+htmlEscape(JSON.stringify(master,null,2))+"</pre>");
  }

  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Terra Z · Exportação</title><style>body{max-width:1000px;margin:40px auto;padding:0 24px;font:16px/1.6 system-ui,sans-serif;color:#161616;background:#faf8f2}h1,h2,h3{font-family:Georgia,serif}h2{border-bottom:1px solid #bbb;padding-bottom:8px;margin-top:40px}article{break-inside:avoid;margin:24px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#fff;border:1px solid #ddd;padding:14px}</style></head><body>'+sections.join("")+"</body></html>";
}
async function exportReading(includeMaster){
  if(includeMaster){
    var pc=app().privateContent;if(pc&&pc.load)await pc.load();
  }
  download("terra-z-dossie-"+(includeMaster?"mestre-":"")+stamp()+".html",readingHtml(includeMaster),"text/html;charset=utf-8");
  showToast(includeMaster?"Dossiê Mestre exportado.":"Dossiê público exportado.","success",4000);
}
function exportPublicJson(){
  download("terra-z-publico-"+stamp()+".json",JSON.stringify(publicSnapshot(),null,2),"application/json;charset=utf-8");
  showToast("Snapshot público exportado.","success",3500);
}
async function open(){
  if(!authenticated()){showToast("Entre como editor para abrir Backup e Exportação.","warning",4500);return;}
  var panel=el("backupExportPanel");if(panel)panel.classList.add("show");
  setStatus("O backup completo mantém o conteúdo Mestre criptografado.","idle");
  document.body.style.overflow="hidden";
}
function close(){
  var panel=el("backupExportPanel");if(panel)panel.classList.remove("show");
  var keep=!!document.querySelector("#adminPanel.show,#sessionModePanel.show,#masterQuickPanel.show");
  document.body.style.overflow=keep?"hidden":"";
}
function setup(){
  var closeBtn=el("backupExportClose");if(closeBtn)closeBtn.addEventListener("click",close);
  var complete=el("backupExportComplete");if(complete)complete.addEventListener("click",completeBackup);
  var publicJson=el("backupExportPublicJson");if(publicJson)publicJson.addEventListener("click",exportPublicJson);
  var htmlPublic=el("backupExportHtmlPublic");if(htmlPublic)htmlPublic.addEventListener("click",function(){exportReading(false);});
  var htmlMaster=el("backupExportHtmlMaster");if(htmlMaster)htmlMaster.addEventListener("click",function(){exportReading(true);});
  var old=el("backupExportLocalDraft");if(old)old.addEventListener("click",function(){if(app().editor&&app().editor.exportEdits)app().editor.exportEdits();});
  var panel=el("backupExportPanel");if(panel)panel.addEventListener("click",function(e){if(e.target===panel)close();});
}
setup();
window.TerraZApp.backupExport={open:open,close:close,complete:completeBackup,exportPublic:exportPublicJson,exportReading:exportReading};
})();