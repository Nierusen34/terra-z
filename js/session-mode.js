(function(){
"use strict";

window.TerraZApp=window.TerraZApp||{};
var core=window.TerraZCore;
if(!core) throw new Error("Terra Z: núcleo não carregado antes de js/session-mode.js");

var escapeHtml=core.escapeHtml;
var escapeAttr=core.escapeAttr;
var showToast=core.showToast;
var showConfirm=core.showConfirm;
var KEY="terraZ_session_mode_v1";
var state=null;

function el(id){return document.getElementById(id);}
function app(){return window.TerraZApp||{};}
function backend(){return app().backend;}
function authenticated(){var b=backend();return !!(b&&b.isAuthenticated&&b.isAuthenticated());}
function empty(){
  return {version:1,title:"",worldDate:"",location:"",visibility:"master",characters:[],npcs:[],goals:[],clues:[],log:[],startedAt:new Date().toISOString()};
}
function loadDraft(){
  try{
    var parsed=JSON.parse(sessionStorage.getItem(KEY)||"null");
    if(parsed&&parsed.version===1)return parsed;
  }catch(e){}
  return empty();
}
function saveDraft(){
  if(!state)return;
  try{sessionStorage.setItem(KEY,JSON.stringify(state));}catch(error){console.warn("Terra Z session draft:",error);}
  renderStatus();
}
function clearDraft(){
  sessionStorage.removeItem(KEY);state=empty();render();
}
function master(){
  var pc=app().privateContent;
  return pc&&pc.getMasterState?pc.getMasterState():{goals:[],clues:[],npcStates:[]};
}
function characterNames(){
  var api=app().characters;
  return api&&api.names?api.names():[];
}
function toggle(list,key){
  var index=list.indexOf(key);
  if(index>=0)list.splice(index,1);else list.push(key);
  saveDraft();render();
}
function renderStatus(){
  var node=el("sessionModeDraftStatus");if(!node||!state)return;
  node.textContent="Rascunho temporário · "+state.log.length+" registro"+(state.log.length===1?"":"s")+" · salvo nesta sessão do navegador";
}
function renderChecks(rootId,items,selected,kind,getLabel,getMeta){
  var root=el(rootId);if(!root)return;
  root.innerHTML=items.length?items.map(function(item){
    var key=typeof item==="string"?item:String(item.id||item.name||"");
    var label=getLabel?getLabel(item):key;
    var meta=getMeta?getMeta(item):"";
    return '<label class="session-mode-choice'+(selected.indexOf(key)>=0?" selected":"")+'">'+
      '<input type="checkbox" data-session-choice="'+kind+'" value="'+escapeAttr(key)+'"'+(selected.indexOf(key)>=0?" checked":"")+'>'+
      '<span><strong>'+escapeHtml(label)+'</strong>'+(meta?'<small>'+escapeHtml(meta)+'</small>':"")+'</span></label>';
  }).join(""):'<div class="session-mode-empty">Nenhum item disponível.</div>';

  root.querySelectorAll('[data-session-choice="'+kind+'"]').forEach(function(input){
    input.addEventListener("change",function(){
      toggle(state[kind],input.value);
    });
  });
}
function renderLog(){
  var root=el("sessionModeLog");if(!root)return;
  if(!state.log.length){
    root.innerHTML='<div class="session-mode-empty">Ainda não há acontecimentos registrados nesta sessão.</div>';return;
  }
  root.innerHTML=state.log.slice().reverse().map(function(item){
    var time="";
    try{time=new Date(item.at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});}catch(e){}
    return '<article class="session-mode-log-item" data-log-id="'+escapeAttr(item.id)+'">'+
      '<div><strong>'+escapeHtml(item.type||"Nota")+'</strong><span>'+escapeHtml(time)+'</span></div>'+
      '<p>'+escapeHtml(item.text)+'</p><button type="button" data-remove-log="'+escapeAttr(item.id)+'">✕</button></article>';
  }).join("");
  root.querySelectorAll("[data-remove-log]").forEach(function(btn){
    btn.addEventListener("click",function(){
      var id=btn.getAttribute("data-remove-log");
      state.log=state.log.filter(function(row){return row.id!==id;});
      saveDraft();renderLog();
    });
  });
}
function render(){
  if(!state)state=loadDraft();
  var title=el("sessionModeTitleInput"),world=el("sessionModeWorldDate"),location=el("sessionModeLocation"),visibility=el("sessionModeVisibility");
  if(title)title.value=state.title||"";
  if(world)world.value=state.worldDate||"";
  if(location)location.value=state.location||"";
  if(visibility)visibility.value=state.visibility||"master";

  var m=master();
  renderChecks("sessionModeCharacters",characterNames(),state.characters,"characters");
  renderChecks("sessionModeNpcs",Array.isArray(m.npcStates)?m.npcStates:[],state.npcs,"npcs",
    function(x){return x.name||"NPC";},function(x){return [x.status,x.location].filter(Boolean).join(" · ");});
  renderChecks("sessionModeGoals",(m.goals||[]).filter(function(x){return x.status==="active";}),state.goals,"goals",
    function(x){return x.title||"Objetivo";},function(x){return x.owner||"";});
  renderChecks("sessionModeClues",(m.clues||[]).filter(function(x){return x.status==="hidden"||x.status==="discovered";}),state.clues,"clues",
    function(x){return x.title||"Pista";},function(x){return x.status==="hidden"?"Oculta":"Descoberta";});
  renderLog();renderStatus();
}
function bindFields(){
  [["sessionModeTitleInput","title"],["sessionModeWorldDate","worldDate"],["sessionModeLocation","location"],["sessionModeVisibility","visibility"]].forEach(function(pair){
    var node=el(pair[0]);if(!node)return;
    var event=node.tagName==="SELECT"?"change":"input";
    node.addEventListener(event,function(){state[pair[1]]=node.value;saveDraft();});
  });
}
function addLog(){
  var input=el("sessionModeLogInput"),type=el("sessionModeLogType");
  var value=input?input.value.trim():"";if(!value)return;
  state.log.push({id:"log-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),type:type?type.value:"Nota",text:value,at:new Date().toISOString()});
  if(input)input.value="";
  saveDraft();renderLog();
}
function buildSessionDraft(){
  var m=master();
  var goalMap=new Map((m.goals||[]).map(function(x){return [String(x.id||""),x];}));
  var clueMap=new Map((m.clues||[]).map(function(x){return [String(x.id||""),x];}));
  var npcMap=new Map((m.npcStates||[]).map(function(x){return [String(x.id||x.name||""),x];}));
  var log=state.log.map(function(row){return "["+(row.type||"Nota")+"] "+row.text;});
  var sections=[];
  if(state.npcs.length)sections.push("NPCs em cena: "+state.npcs.map(function(id){var x=npcMap.get(id);return x&&x.name||id;}).join(", "));
  if(state.goals.length)sections.push("Objetivos trabalhados: "+state.goals.map(function(id){var x=goalMap.get(id);return x&&x.title||id;}).join("; "));
  if(state.clues.length)sections.push("Pistas usadas: "+state.clues.map(function(id){var x=clueMap.get(id);return x&&x.title||id;}).join("; "));
  if(log.length)sections.push(log.join("\n"));
  var today=new Date().toISOString().slice(0,10);
  return {
    title:state.title||"Sessão "+today,
    realDate:today,
    inWorldDate:state.worldDate||"",
    summary:sections.join("\n\n"),
    characters:state.characters.slice(),
    locations:state.location?[state.location]:[],
    consequences:state.log.filter(function(row){return row.type==="Consequência"||row.type==="Decisão";}).map(function(row){return row.text;}),
    visibility:state.visibility||"master"
  };
}
function finish(){
  state=loadDraft();
  if(!state.log.length&&!state.characters.length&&!state.title){
    showToast("O Modo Sessão ainda está vazio.","warning",4000);return;
  }
  showConfirm("Concluir Modo Sessão","Preparar o formulário do Diário com o rascunho atual? Nada será publicado até você revisar e salvar a sessão.",function(){
    var draft=buildSessionDraft();
    close();
    var editor=app().sessionEditor;
    if(editor&&editor.openDraft)editor.openDraft(draft);
    else if(editor&&editor.open)editor.open("");
  },"Preparar registro");
}
async function open(){
  if(!authenticated()){showToast("Entre como editor para usar o Modo Sessão.","warning",4500);return;}
  var pc=app().privateContent;
  if(pc&&pc.load)await pc.load();
  state=loadDraft();render();
  var panel=el("sessionModePanel");if(panel)panel.classList.add("show");
  document.body.style.overflow="hidden";
}
function close(){
  var panel=el("sessionModePanel");if(panel)panel.classList.remove("show");
  var keep=!!document.querySelector("#adminPanel.show,#masterQuickPanel.show,#masterWorkspacePanel.show,#sessionEditorPanel.show,#tableModePanel.show");
  document.body.style.overflow=keep?"hidden":"";
}
function requestClear(){
  showConfirm("Limpar Modo Sessão","Apagar o rascunho temporário desta sessão do navegador?",function(){clearDraft();showToast("Rascunho do Modo Sessão limpo.","success",3500);},"Limpar");
}
function setup(){
  bindFields();
  var closeBtn=el("sessionModeClose");if(closeBtn)closeBtn.addEventListener("click",close);
  var add=el("sessionModeAddLog");if(add)add.addEventListener("click",addLog);
  var input=el("sessionModeLogInput");if(input)input.addEventListener("keydown",function(event){if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){event.preventDefault();addLog();}});
  var finishBtn=el("sessionModeFinish");if(finishBtn)finishBtn.addEventListener("click",finish);
  var clear=el("sessionModeClear");if(clear)clear.addEventListener("click",requestClear);
  var panel=el("sessionModePanel");if(panel)panel.addEventListener("click",function(e){if(e.target===panel)close();});
}
setup();
window.TerraZApp.sessionMode={open:open,close:close,render:render,clear:clearDraft,finish:finish,draft:function(){return state?JSON.parse(JSON.stringify(state)):loadDraft();}};
})();