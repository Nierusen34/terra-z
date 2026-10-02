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
async function serverBackup(){
  return backend().request("/api/publish",{method:"POST",body:{action:"export-backup"}});
}
async function exportPublicJson(){
  if(!authenticated())return;
  var button=el("backupExportPublicJson");if(button)button.disabled=true;
  try{
    var result=await serverBackup();
    var source=result.backup||{};
    var files={};
    Object.keys(source.files||{}).forEach(function(path){
      if(path==="data/private-character-data.enc.json"||path==="data/private-sessions.enc.json")return;
      files[path]=source.files[path];
    });
    var exported={
      schema:"terra-z-public-export-v2",
      generated_at:new Date().toISOString(),
      head_sha:source.head_sha||"",
      files:files,
      media_manifest:source.media_manifest||[]
    };
    download("terra-z-publico-"+stamp()+".json",JSON.stringify(exported,null,2),"application/json;charset=utf-8");
    showToast("Snapshot público exportado sem conteúdo Mestre.","success",4000);
  }catch(error){
    console.error("Terra Z public export:",error);
    showToast(error.message||"Falha ao exportar snapshot público.","error",6000);
  }finally{if(button)button.disabled=false;}
}
function htmlEscape(value){
  return String(value==null?"":value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function readingBody(includeMaster){
  var source=document.querySelector(".container");
  var clone=source?source.cloneNode(true):document.createElement("main");

  clone.querySelectorAll([
    "script","button","input","textarea","select",
    ".sidebar",".breadcrumbs",".timeline-controls",".character-filter-bar",
    ".graph-toolbar",".edit-active",".deep-link-copy",".session-edit-btn"
  ].join(",")).forEach(function(node){node.remove();});

  if(!includeMaster){
    clone.querySelectorAll([
      '[data-visibility="master"]','[data-visibility="private"]','[data-visibility="spoiler"]',
      '[data-character-visibility="master"]','[data-character-visibility="private"]','[data-character-visibility="spoiler"]'
    ].join(",")).forEach(function(node){node.remove();});
  }

  clone.querySelectorAll("[contenteditable]").forEach(function(node){node.removeAttribute("contenteditable");});
  clone.querySelectorAll("[style]").forEach(function(node){
    if(/display\s*:\s*none/i.test(node.getAttribute("style")||""))node.removeAttribute("style");
  });
  return clone.innerHTML;
}
async function readingHtml(includeMaster){
  var appendix="";
  if(includeMaster&&authenticated()){
    var pc=app().privateContent;
    if(pc&&pc.load)await pc.load();
    var master=pc&&pc.getMasterState?pc.getMasterState():{};
    appendix='<section class="master-export"><h2>Conteúdo Mestre</h2><pre>'+htmlEscape(JSON.stringify(master,null,2))+"</pre></section>";
  }

  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Terra Z · Exportação</title><style>body{max-width:1100px;margin:40px auto;padding:0 24px;font:16px/1.65 system-ui,sans-serif;color:#161616;background:#faf8f2}h1,h2,h3,h4{font-family:Georgia,serif}h2{border-bottom:1px solid #bbb;padding-bottom:8px;margin-top:40px}img{max-width:100%;height:auto}article,.card,.box{break-inside:avoid}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#fff;border:1px solid #ddd;padding:14px}.tab-content,.sub-content{display:block!important}.master-export{margin-top:60px;border-top:3px solid #222}</style></head><body><h1>Terra Z</h1><p>Exportado em '+htmlEscape(new Date().toLocaleString("pt-BR"))+"</p>"+readingBody(includeMaster)+appendix+"</body></html>";
}
async function exportReading(includeMaster){
  var html=await readingHtml(includeMaster);
  download("terra-z-dossie-"+(includeMaster?"mestre-":"")+stamp()+".html",html,"text/html;charset=utf-8");
  showToast(includeMaster?"Dossiê Mestre exportado.":"Dossiê público exportado.","success",4000);
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