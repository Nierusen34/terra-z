(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core=window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/timeline-editor.js');

var showToast=core.showToast;
var showConfirm=core.showConfirm;
var currentId="";
var capability=null;

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }
function timeline(){ return window.TerraZApp && window.TerraZApp.timeline; }

function splitComma(value){
  return String(value || "").split(",").map(function(item){ return item.trim(); }).filter(Boolean);
}

function sortKeyFromInput(value,year){
  var raw=String(value || "").trim();
  if(/^\d{8}$/.test(raw)) return Number(raw);
  var iso=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(iso) return Number(iso[1]+iso[2]+iso[3]);
  if(/^\d+$/.test(raw)) return Number(raw);

  var manager=timeline();
  var parsed=manager && manager.parseWorldDate ? manager.parseWorldDate(raw || year) : 0;
  return Number(parsed || 0);
}

function formatSortKey(value){
  var raw=String(value == null ? "" : value);
  if(/^\d{8}$/.test(raw) && Number(raw)>=10000101){
    return raw.slice(0,4)+"-"+raw.slice(4,6)+"-"+raw.slice(6,8);
  }
  return raw;
}

async function supportsEditor(force){
  if(force) capability=null;
  if(capability!==null) return capability;

  var b=backend();
  if(!b || !b.isConfigured || !b.isConfigured()) return false;
  try{
    var health=await b.health();
    capability=!!(health && health.timeline_event_editor===true && health.secure_master_timeline===true);
  }catch(error){
    capability=false;
  }
  return capability;
}

async function refresh(){
  var button=el("timelineAddEventBtn");
  if(!button) return;

  var b=backend();
  var authed=!!(b && b.isAuthenticated && b.isAuthenticated());
  var supported=authed ? await supportsEditor(false) : false;
  button.disabled=!(authed && supported);

  if(!authed) button.title="Entre como editor para administrar eventos da linha do tempo";
  else if(!supported) button.title="O editor de eventos será habilitado após publicar este checkpoint na Vercel";
  else button.title="Criar novo evento de lore";
}

function setStatus(message,state){
  var node=el("timelineEditorStatus");
  if(!node) return;
  node.textContent=message || "";
  node.setAttribute("data-state",state || "idle");
}

function fill(event){
  event=event || {};
  currentId=event.id || "";

  el("timelineEditorTitleText").value=event.title || "";
  el("timelineEditorYear").value=event.year || "";
  el("timelineEditorSortKey").value=event.sortKey!==undefined ? formatSortKey(event.sortKey) : "";
  el("timelineEditorCategory").value=event.category || "current";
  el("timelineEditorVisibility").value=event.visibility || "public";
  el("timelineEditorText").value=event.text || "";
  el("timelineEditorCharacters").value=Array.isArray(event.characters) ? event.characters.join(", ") : "";
  el("timelineEditorLocations").value=Array.isArray(event.locations) ? event.locations.join(", ") : "";
  el("timelineEditorTeams").value=Array.isArray(event.teams) ? event.teams.join(", ") : "";

  var heading=el("timelineEditorHeading");
  if(heading) heading.textContent=currentId ? "✏️ Editar evento" : "＋ Novo evento";

  var save=el("timelineEditorSave");
  if(save) save.textContent=currentId ? "💾 Atualizar evento" : "💾 Criar evento";

  var del=el("timelineEditorDelete");
  if(del) del.hidden=!currentId;

  var permalink=el("timelineEditorPermalink");
  if(permalink){
    permalink.textContent=currentId
      ? "ID permanente: "+currentId
      : "O ID permanente e o link serão criados automaticamente.";
  }

  setStatus(
    event.visibility==="master"
      ? "🔒 Este evento está no cofre privado do Mestre."
      : "Eventos Público/Spoiler são versionados em data/timeline.js.",
    event.visibility==="master" ? "secure" : "idle"
  );
}

async function open(id){
  var b=backend();
  if(!b || !b.isAuthenticated || !b.isAuthenticated()){
    showToast("Entre como editor para administrar a Linha do Tempo.","warning",5000);
    if(window.TerraZApp.publishing) window.TerraZApp.publishing.open();
    return;
  }

  if(!(await supportsEditor(false))){
    showToast("Publique primeiro o checkpoint atual para ativar o backend do Editor de Eventos.","warning",6500);
    return;
  }

  var manager=timeline();
  var event=id && manager && manager.getEvent ? manager.getEvent(id) : null;
  if(event && event.source==="session"){
    if(window.TerraZApp.sessionEditor) window.TerraZApp.sessionEditor.open(event.sessionId);
    return;
  }

  fill(event || {});
  var panel=el("timelineEditorPanel");
  if(panel){
    panel.classList.add("show");
    document.body.style.overflow="hidden";
  }
}

function close(){
  currentId="";
  var panel=el("timelineEditorPanel");
  if(panel) panel.classList.remove("show");
  document.body.style.overflow="";
  var del=el("timelineEditorDelete");
  if(del) del.hidden=true;
}

function clearLocalDrafts(event){
  if(!event || !event.edit) return;
  var ids=[
    event.edit.year && event.edit.year.id,
    event.edit.text && event.edit.text.id
  ].filter(Boolean);
  if(!ids.length) return;

  try{
    var raw=localStorage.getItem("terraZ_v1_edits");
    if(!raw) return;
    var data=JSON.parse(raw);
    var changed=false;
    ids.forEach(function(id){
      if(Object.prototype.hasOwnProperty.call(data,id)){
        delete data[id];
        changed=true;
      }
    });
    if(changed) localStorage.setItem("terraZ_v1_edits",JSON.stringify(data));
  }catch(error){}
}

async function save(){
  var b=backend();
  if(!b || !b.isAuthenticated || !b.isAuthenticated()) return open(currentId);

  var year=el("timelineEditorYear").value.trim();
  var title=el("timelineEditorTitleText").value.trim();
  var bodyText=el("timelineEditorText").value.trim();
  var sortKey=sortKeyFromInput(el("timelineEditorSortKey").value,year);

  if(!year){
    showToast("Informe a data ou rótulo temporal do evento.","warning");
    el("timelineEditorYear").focus();
    return;
  }
  if(!title && !bodyText){
    showToast("Informe um título ou descrição para o evento.","warning");
    el("timelineEditorTitleText").focus();
    return;
  }
  if(!Number.isFinite(sortKey) || sortKey<=0){
    showToast("Informe uma ordem cronológica válida.","warning");
    el("timelineEditorSortKey").focus();
    return;
  }

  var manager=timeline();
  var previous=currentId && manager && manager.getEvent ? manager.getEvent(currentId) : null;
  var wasEditing=!!currentId;
  var button=el("timelineEditorSave");
  if(button){ button.disabled=true; button.textContent="Salvando…"; }
  setStatus("Salvando no GitHub…","working");

  var payload={
    id:currentId,
    title:title,
    year:year,
    sortKey:sortKey,
    category:el("timelineEditorCategory").value,
    visibility:el("timelineEditorVisibility").value,
    text:bodyText,
    characters:splitComma(el("timelineEditorCharacters").value),
    locations:splitComma(el("timelineEditorLocations").value),
    teams:splitComma(el("timelineEditorTeams").value)
  };

  try{
    var result=await b.request("/api/publish",{
      method:"POST",
      body:{action:"timeline-event-upsert",id:currentId,event:payload}
    });

    clearLocalDrafts(previous);
    clearLocalDrafts(result.event);
    if(manager && manager.upsertLore && result.event) manager.upsertLore(result.event);

    close();
    showToast(wasEditing ? "Evento atualizado com sucesso." : "Evento criado com sucesso.","success",4500);

    var runtime=window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh && result.event && result.event.visibility!=="master"){
      runtime.refresh({force:true,bust:result.sha,silent:true});
    }

    var publishing=window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url){
      publishing.trackDeployment(result.status_url);
    }

    var r=window.TerraZApp && window.TerraZApp.router;
    if(r && r.openTimelineEvent && result.event) r.openTimelineEvent(result.event.id,{replace:true});
  }catch(error){
    console.error("Terra Z timeline save:",error);
    setStatus("Erro ao salvar","error");
    showToast(error.message || "Falha ao salvar o evento.","error",6500);
  }finally{
    if(button){
      button.disabled=false;
      button.textContent=currentId ? "💾 Atualizar evento" : "💾 Criar evento";
    }
  }
}

function deleteEvent(id){
  var manager=timeline();
  var event=manager && manager.getEvent ? manager.getEvent(id) : null;
  if(!event || event.source==="session") return;

  showConfirm(
    "Excluir evento",
    "Excluir \""+(event.title || event.year || event.id)+"\" da Linha do Tempo? Esta ação remove apenas o evento de lore; personagens, locais, equipes e sessões relacionados não serão apagados.",
    function(){ performDelete(event); },
    "Excluir evento"
  );
}

async function performDelete(event){
  var b=backend();
  if(!b || !b.isAuthenticated || !b.isAuthenticated()){
    showToast("Sua sessão de editor expirou.","warning");
    return;
  }

  var del=el("timelineEditorDelete");
  if(del) del.disabled=true;
  setStatus("Excluindo evento…","working");

  try{
    var result=await b.request("/api/publish",{
      method:"POST",
      body:{action:"timeline-event-delete",id:event.id}
    });

    clearLocalDrafts(event);
    var manager=timeline();
    if(manager && manager.removeLore) manager.removeLore(event.id);

    close();
    showToast("Evento excluído com sucesso.","success",4500);

    var runtime=window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh) runtime.refresh({force:true,bust:result.sha,silent:true});

    var publishing=window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url){
      publishing.trackDeployment(result.status_url);
    }

    var r=window.TerraZApp && window.TerraZApp.router;
    if(r && r.go) r.go("/universo/linha-do-tempo",{replace:true});
  }catch(error){
    console.error("Terra Z timeline delete:",error);
    setStatus("Erro ao excluir","error");
    showToast(error.message || "Falha ao excluir o evento.","error",6500);
  }finally{
    if(del) del.disabled=false;
  }
}

function setup(){
  var add=el("timelineAddEventBtn");
  var closeBtn=el("timelineEditorClose");
  var cancel=el("timelineEditorCancel");
  var saveBtn=el("timelineEditorSave");
  var deleteBtn=el("timelineEditorDelete");
  var panel=el("timelineEditorPanel");

  if(add) add.addEventListener("click",function(){ open(""); });
  if(closeBtn) closeBtn.addEventListener("click",close);
  if(cancel) cancel.addEventListener("click",close);
  if(saveBtn) saveBtn.addEventListener("click",save);
  if(deleteBtn) deleteBtn.addEventListener("click",function(){ if(currentId) deleteEvent(currentId); });
  if(panel) panel.addEventListener("click",function(event){ if(event.target===panel) close(); });

  document.addEventListener("keydown",function(event){
    if(event.key==="Escape" && panel && panel.classList.contains("show")) close();
  });

  document.addEventListener("terra-z:auth-changed",function(){
    capability=null;
    refresh();
  });
  refresh();
}

window.TerraZApp.timelineEditor={
  open:open,
  close:close,
  refresh:refresh,
  deleteEvent:deleteEvent
};

setup();

})();