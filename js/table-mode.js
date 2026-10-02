(function(){
"use strict";

window.TerraZApp=window.TerraZApp||{};
var core=window.TerraZCore;
if(!core) throw new Error("Terra Z: núcleo não carregado antes de js/table-mode.js");

var escapeHtml=core.escapeHtml;
var escapeAttr=core.escapeAttr;
var showToast=core.showToast;
var showConfirm=core.showConfirm;
var KEY="terraZ_session_mode_v1";
var state=null;
var activeTab="session";
var mapKey="city";
var timer=null;

function el(id){return document.getElementById(id);}
function app(){return window.TerraZApp||{};}
function backend(){return app().backend;}
function privateApi(){return app().privateContent;}
function authenticated(){
  var b=backend();
  return !!(b&&b.isAuthenticated&&b.isAuthenticated());
}
function freshState(){
  return {
    version:1,title:"",worldDate:"",location:"",visibility:"master",
    characters:[],npcs:[],goals:[],clues:[],log:[],
    startedAt:new Date().toISOString(),
    table:{tab:"session",map:"city",clues:{},goals:{}}
  };
}
function ensure(value){
  var s=value&&value.version===1?value:freshState();
  if(!Array.isArray(s.characters))s.characters=[];
  if(!Array.isArray(s.npcs))s.npcs=[];
  if(!Array.isArray(s.goals))s.goals=[];
  if(!Array.isArray(s.clues))s.clues=[];
  if(!Array.isArray(s.log))s.log=[];
  if(!s.startedAt)s.startedAt=new Date().toISOString();
  if(!s.table||typeof s.table!=="object")s.table={};
  if(!s.table.clues||typeof s.table.clues!=="object")s.table.clues={};
  if(!s.table.goals||typeof s.table.goals!=="object")s.table.goals={};
  if(!s.table.tab)s.table.tab="session";
  if(!s.table.map)s.table.map="city";
  return s;
}
function load(){
  try{return ensure(JSON.parse(sessionStorage.getItem(KEY)||"null"));}
  catch(error){return freshState();}
}
function save(){
  state=ensure(state);
  state.table.tab=activeTab;
  state.table.map=mapKey;
  try{sessionStorage.setItem(KEY,JSON.stringify(state));}catch(error){console.warn("Terra Z table mode:",error);}
  updateHeader();
}
function master(){
  var p=privateApi();
  return p&&p.getMasterState?p.getMasterState():{goals:[],clues:[],npcStates:[]};
}
function setList(list,key,on){
  var index=list.indexOf(key);
  if(on&&index<0)list.push(key);
  if(!on&&index>=0)list.splice(index,1);
}
function fmtTime(value){
  try{return new Date(value).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});}catch(error){return "";}
}
function elapsed(){
  var started=new Date(state&&state.startedAt||Date.now()).getTime();
  if(!Number.isFinite(started))started=Date.now();
  var mins=Math.max(0,Math.floor((Date.now()-started)/60000));
  var h=Math.floor(mins/60),m=mins%60;
  return h?String(h)+"h "+String(m).padStart(2,"0")+"m":String(m)+" min";
}
function strip(value){
  var node=document.createElement("div");
  node.innerHTML=String(value||"");
  return String(node.textContent||"").replace(/\s+/g," ").trim();
}
function normalize(value){
  return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}
function online(){
  return navigator.onLine!==false;
}
function updateHeader(){
  var title=el("tableModeSessionTitle");
  if(title)title.textContent=state&&state.title?state.title:"Sessão em andamento";
  var meta=el("tableModeSessionMeta");
  if(meta){
    var bits=[];
    if(state&&state.worldDate)bits.push(state.worldDate);
    if(state&&state.location)bits.push(state.location);
    bits.push(elapsed());
    meta.textContent=bits.join(" · ");
  }
  var net=el("tableModeNetwork");
  if(net){
    net.textContent=online()?"● Online":"● Offline";
    net.dataset.state=online()?"online":"offline";
  }
}
function setTab(tab){
  activeTab=tab||"session";
  document.querySelectorAll("[data-table-tab]").forEach(function(btn){
    btn.classList.toggle("active",btn.getAttribute("data-table-tab")===activeTab);
  });
  document.querySelectorAll("[data-table-view]").forEach(function(view){
    view.classList.toggle("active",view.getAttribute("data-table-view")===activeTab);
  });
  save();
  if(activeTab==="session")renderSession();
  if(activeTab==="npcs")renderNpcs();
  if(activeTab==="clues")renderClues();
  if(activeTab==="goals")renderGoals();
  if(activeTab==="characters")renderCharacters();
  if(activeTab==="maps")renderMaps();
}
function logItem(row){
  return '<article class="table-mode-log-item"><div><strong>'+escapeHtml(row.type||"Nota")+'</strong><span>'+escapeHtml(fmtTime(row.at))+'</span></div><p>'+escapeHtml(row.text||"")+'</p></article>';
}
function renderSession(){
  var root=el("tableModeSessionView");if(!root)return;
  var recent=state.log.slice().reverse().slice(0,12);
  root.innerHTML=
    '<div class="table-mode-session-grid">'+
      '<section class="table-mode-live-card table-mode-live-primary">'+
        '<div class="table-mode-section-title"><strong>⚡ Registro ao vivo</strong><span>'+state.log.length+' notas</span></div>'+
        '<div class="table-mode-log-form">'+
          '<select id="tableModeLogType"><option>Narrativa</option><option>Decisão</option><option>Consequência</option><option>Pista</option><option>Combate</option><option>NPC</option><option>Nota</option></select>'+
          '<textarea id="tableModeLogInput" rows="3" placeholder="O que acabou de acontecer?"></textarea>'+
          '<button id="tableModeAddLog" type="button">＋ Registrar</button>'+
        '</div>'+
      '</section>'+
      '<section class="table-mode-live-card">'+
        '<div class="table-mode-section-title"><strong>🎯 Estado da mesa</strong><span>rascunho</span></div>'+
        '<div class="table-mode-summary-stats">'+
          '<div><strong>'+state.characters.length+'</strong><span>Personagens</span></div>'+
          '<div><strong>'+state.npcs.length+'</strong><span>NPCs em cena</span></div>'+
          '<div><strong>'+state.goals.length+'</strong><span>Objetivos</span></div>'+
          '<div><strong>'+state.clues.length+'</strong><span>Pistas usadas</span></div>'+
        '</div>'+
        '<label class="table-mode-location">Local atual<input id="tableModeLocationInput" maxlength="180" value="'+escapeAttr(state.location||"")+'" placeholder="Ex.: Downtown"></label>'+
      '</section>'+
    '</div>'+
    '<section class="table-mode-live-card table-mode-log-card">'+
      '<div class="table-mode-section-title"><strong>📝 Últimos acontecimentos</strong><span>mais recente primeiro</span></div>'+
      '<div class="table-mode-log-list">'+(recent.length?recent.map(logItem).join(""):'<div class="table-mode-empty">Nenhum acontecimento registrado ainda.</div>')+'</div>'+
    '</section>';

  var add=el("tableModeAddLog"),input=el("tableModeLogInput");
  if(add)add.addEventListener("click",addLog);
  if(input)input.addEventListener("keydown",function(event){
    if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){event.preventDefault();addLog();}
  });
  var location=el("tableModeLocationInput");
  if(location)location.addEventListener("input",function(){state.location=location.value;save();});
}
function addLog(){
  var input=el("tableModeLogInput"),type=el("tableModeLogType");
  var value=input?input.value.trim():"";
  if(!value)return;
  state.log.push({
    id:"log-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),
    type:type?type.value:"Nota",
    text:value,
    at:new Date().toISOString()
  });
  save();renderSession();
  var freshInput=el("tableModeLogInput");if(freshInput)freshInput.focus();
}
function npcRelations(name){
  var p=privateApi();
  var graph=p&&p.getPrivateGraph?p.getPrivateGraph():{nodes:[],edges:[]};
  var nodes=Array.isArray(graph.nodes)?graph.nodes:[];
  var edges=Array.isArray(graph.edges)?graph.edges:[];
  var target=nodes.find(function(node){
    return normalize(node.label||node.name||node.id)===normalize(name);
  });
  if(!target)return [];
  var byId=new Map(nodes.map(function(node){return [String(node.id||""),node];}));
  return edges.filter(function(edge){
    return String(edge.from||edge.source||"")===String(target.id) || String(edge.to||edge.target||"")===String(target.id);
  }).slice(0,5).map(function(edge){
    var from=String(edge.from||edge.source||""),to=String(edge.to||edge.target||"");
    var other=from===String(target.id)?byId.get(to):byId.get(from);
    return {
      name:other&&(other.label||other.name||other.id)||"Relação",
      type:edge.type||edge.label||""
    };
  });
}
function renderNpcs(){
  var root=el("tableModeNpcsView");if(!root)return;
  var list=(master().npcStates||[]).filter(function(x){
    return !x.status||["active","unknown","missing","captured"].includes(x.status);
  });
  root.innerHTML='<div class="table-mode-card-grid">'+(list.length?list.map(function(item){
    var key=String(item.id||item.name||"");
    var selected=state.npcs.includes(key);
    var rels=npcRelations(item.name||key);
    return '<article class="table-mode-entity'+(selected?" active":"")+'">'+
      '<div class="table-mode-entity-head"><div><strong>👤 '+escapeHtml(item.name||"NPC")+'</strong><small>'+escapeHtml([item.status,item.location].filter(Boolean).join(" · "))+'</small></div>'+
      '<button type="button" data-table-npc="'+escapeAttr(key)+'">'+(selected?"✓ Em cena":"＋ Em cena")+'</button></div>'+
      (item.state||item.intention?'<p>'+escapeHtml(item.state||item.intention)+'</p>':"")+
      (item.intention&&item.state?'<div class="table-mode-detail"><b>Intenção:</b> '+escapeHtml(item.intention)+'</div>':"")+
      (rels.length?'<div class="table-mode-relations">'+rels.map(function(rel){return '<span>'+escapeHtml(rel.name)+(rel.type?" · "+escapeHtml(rel.type):"")+'</span>';}).join("")+'</div>':"")+
    '</article>';
  }).join(""):'<div class="table-mode-empty">Nenhum NPC Mestre disponível.</div>')+'</div>';
  root.querySelectorAll("[data-table-npc]").forEach(function(btn){
    btn.addEventListener("click",function(){
      var key=btn.getAttribute("data-table-npc");
      setList(state.npcs,key,!state.npcs.includes(key));
      save();renderNpcs();
    });
  });
}
function clueState(item){
  var key=String(item.id||item.title||"");
  if(state.table.clues[key])return state.table.clues[key];
  if(item.status==="discovered")return "revealed";
  if(item.status==="resolved")return "resolved";
  return "hidden";
}
function setClue(item,status){
  var key=String(item.id||item.title||"");
  state.table.clues[key]=status;
  setList(state.clues,key,status!=="hidden");
  save();renderClues();
}
function renderClues(){
  var root=el("tableModeCluesView");if(!root)return;
  var list=master().clues||[];
  root.innerHTML='<div class="table-mode-card-grid">'+(list.length?list.map(function(item){
    var key=String(item.id||item.title||"");
    var status=clueState(item);
    return '<article class="table-mode-entity" data-clue-state="'+status+'">'+
      '<div class="table-mode-entity-head"><div><strong>🧩 '+escapeHtml(item.title||"Pista")+'</strong><small>Estado nesta mesa · '+escapeHtml(status==="hidden"?"não revelada":status==="revealed"?"revelada":"resolvida")+'</small></div></div>'+
      (item.body?'<p>'+escapeHtml(item.body)+'</p>':"")+
      (item.truth?'<div class="table-mode-detail master"><b>Verdade:</b> '+escapeHtml(item.truth)+'</div>':"")+
      '<div class="table-mode-state-buttons">'+
        '<button type="button" data-clue-id="'+escapeAttr(key)+'" data-clue-status="hidden"'+(status==="hidden"?' class="active"':"")+'>Oculta</button>'+
        '<button type="button" data-clue-id="'+escapeAttr(key)+'" data-clue-status="revealed"'+(status==="revealed"?' class="active"':"")+'>Revelada</button>'+
        '<button type="button" data-clue-id="'+escapeAttr(key)+'" data-clue-status="resolved"'+(status==="resolved"?' class="active"':"")+'>Resolvida</button>'+
      '</div>'+
    '</article>';
  }).join(""):'<div class="table-mode-empty">Nenhuma pista Mestre disponível.</div>')+'</div>';
  root.querySelectorAll("[data-clue-id]").forEach(function(btn){
    btn.addEventListener("click",function(){
      var key=btn.getAttribute("data-clue-id");
      var item=list.find(function(x){return String(x.id||x.title||"")===key;});
      if(item)setClue(item,btn.getAttribute("data-clue-status"));
    });
  });
}
function goalState(item){
  var key=String(item.id||item.title||"");
  if(state.table.goals[key])return state.table.goals[key];
  return state.goals.includes(key)?"worked":"pending";
}
function setGoal(item,status){
  var key=String(item.id||item.title||"");
  state.table.goals[key]=status;
  setList(state.goals,key,status!=="pending");
  save();renderGoals();
}
function renderGoals(){
  var root=el("tableModeGoalsView");if(!root)return;
  var list=(master().goals||[]).filter(function(x){return x.status==="active"||!x.status;});
  root.innerHTML='<div class="table-mode-card-grid">'+(list.length?list.map(function(item){
    var key=String(item.id||item.title||"");
    var status=goalState(item);
    return '<article class="table-mode-entity" data-goal-state="'+status+'">'+
      '<div class="table-mode-entity-head"><div><strong>🎯 '+escapeHtml(item.title||"Objetivo")+'</strong><small>'+escapeHtml(item.owner||"Mestre")+'</small></div></div>'+
      (item.body?'<p>'+escapeHtml(item.body)+'</p>':"")+
      '<div class="table-mode-state-buttons">'+
        '<button type="button" data-goal-id="'+escapeAttr(key)+'" data-goal-status="pending"'+(status==="pending"?' class="active"':"")+'>Pendente</button>'+
        '<button type="button" data-goal-id="'+escapeAttr(key)+'" data-goal-status="worked"'+(status==="worked"?' class="active"':"")+'>Trabalhado</button>'+
        '<button type="button" data-goal-id="'+escapeAttr(key)+'" data-goal-status="completed"'+(status==="completed"?' class="active"':"")+'>Concluído</button>'+
      '</div>'+
    '</article>';
  }).join(""):'<div class="table-mode-empty">Nenhum objetivo ativo.</div>')+'</div>';
  root.querySelectorAll("[data-goal-id]").forEach(function(btn){
    btn.addEventListener("click",function(){
      var key=btn.getAttribute("data-goal-id");
      var item=list.find(function(x){return String(x.id||x.title||"")===key;});
      if(item)setGoal(item,btn.getAttribute("data-goal-status"));
    });
  });
}
function characterNames(){
  var c=app().characters;
  return c&&c.names?c.names():[];
}
function characterInfo(name){
  var overrides=window.TerraZData&&window.TerraZData.characterOverrides||{};
  var taxonomy=window.TerraZData&&window.TerraZData.characterTaxonomy||{};
  var meta=taxonomy.characters&&taxonomy.characters[name]||{};
  var ficha=overrides[name]||{};
  var secrets=privateApi()&&privateApi().getCharacterSecrets?privateApi().getCharacterSecrets(name):[];
  var preview="";
  var sections=Array.isArray(ficha.sections)?ficha.sections:[];
  if(sections.length)preview=strip(sections[0].content||"").slice(0,210);
  return {eyebrow:ficha.eyebrow||"",meta:meta,preview:preview,secrets:Array.isArray(secrets)?secrets:[]};
}
function renderCharacters(){
  var root=el("tableModeCharactersView");if(!root)return;
  var names=characterNames().slice().sort(function(a,b){
    var as=state.characters.includes(a)?0:1,bs=state.characters.includes(b)?0:1;
    return as-bs||a.localeCompare(b,"pt-BR");
  });
  root.innerHTML='<div class="table-mode-card-grid">'+(names.length?names.map(function(name){
    var selected=state.characters.includes(name),info=characterInfo(name);
    var chips=[];
    if(info.meta.type)chips.push(info.meta.type);
    if(info.meta.status)chips.push(info.meta.status);
    if(Array.isArray(info.meta.nuclei))chips=chips.concat(info.meta.nuclei.slice(0,2));
    return '<article class="table-mode-entity'+(selected?" active":"")+'">'+
      '<div class="table-mode-entity-head"><div><strong>🦸 '+escapeHtml(name)+'</strong><small>'+escapeHtml(info.eyebrow||chips.join(" · "))+'</small></div>'+
      '<button type="button" data-table-character="'+escapeAttr(name)+'">'+(selected?"✓ Em cena":"＋ Em cena")+'</button></div>'+
      (info.preview?'<p>'+escapeHtml(info.preview)+'</p>':"")+
      (chips.length?'<div class="table-mode-relations">'+chips.map(function(x){return '<span>'+escapeHtml(x)+'</span>';}).join("")+'</div>':"")+
      (info.secrets.length?'<details class="table-mode-secrets"><summary>🔒 Segredos ('+info.secrets.length+')</summary><ul>'+info.secrets.map(function(s){return '<li>'+escapeHtml(s)+'</li>';}).join("")+'</ul></details>':"")+
    '</article>';
  }).join(""):'<div class="table-mode-empty">Nenhum personagem disponível.</div>')+'</div>';
  root.querySelectorAll("[data-table-character]").forEach(function(btn){
    btn.addEventListener("click",function(){
      var name=btn.getAttribute("data-table-character");
      setList(state.characters,name,!state.characters.includes(name));
      save();renderCharacters();
    });
  });
}
var maps={
  city:{label:"Vanguard Bay",src:"images/maps/vanguard-bay-visao-geral.webp",alt:"Mapa geral de Vanguard Bay"},
  transport:{label:"Transporte",src:"images/maps/vanguard-bay-transporte.webp",alt:"Mapa de transporte de Vanguard Bay"},
  national:{label:"Mapa Nacional",src:"images/maps/estados-unidos-cidades-externas.webp",alt:"Mapa nacional do universo Terra Z"},
  crime:{label:"Criminalidade",src:"images/editorial/vanguard-bay-criminalidade.webp",alt:"Mapa e dossiê de criminalidade de Vanguard Bay"}
};
function renderMaps(){
  var root=el("tableModeMapsView");if(!root)return;
  var current=maps[mapKey]||maps.city;
  root.innerHTML=
    '<div class="table-mode-map-tabs">'+Object.keys(maps).map(function(key){
      return '<button type="button" data-table-map="'+key+'"'+(key===mapKey?' class="active"':"")+'>'+escapeHtml(maps[key].label)+'</button>';
    }).join("")+'</div>'+
    '<figure class="table-mode-map-stage"><img src="'+escapeAttr(current.src)+'" alt="'+escapeAttr(current.alt)+'"><figcaption>'+escapeHtml(current.label)+' · toque na imagem para ampliar</figcaption></figure>';
  root.querySelectorAll("[data-table-map]").forEach(function(btn){
    btn.addEventListener("click",function(){mapKey=btn.getAttribute("data-table-map");save();renderMaps();});
  });
  var img=root.querySelector(".table-mode-map-stage img");
  if(img)img.addEventListener("click",function(){
    var viewer=el("tableModeMapViewer"),full=el("tableModeMapFull");
    if(full){full.src=img.src;full.alt=img.alt;}
    if(viewer)viewer.classList.add("show");
  });
}
function render(){
  state=ensure(state||load());
  activeTab=state.table.tab||"session";
  mapKey=state.table.map||"city";
  updateHeader();
  setTab(activeTab);
}
function openSessionMode(){
  close();
  var mode=app().sessionMode;
  if(mode&&mode.open)mode.open();
}
function finish(){
  save();
  var mode=app().sessionMode;
  if(!mode||!mode.finish){showToast("Modo Sessão ainda não está disponível.","warning",4000);return;}
  close();
  mode.finish();
}
async function open(){
  if(!authenticated()){showToast("Entre como editor para usar o Modo Mesa.","warning",4500);return;}
  var p=privateApi();
  if(p&&p.load&&(!p.isLoaded||!p.isLoaded())&&online()){
    try{await p.load();}catch(error){}
  }
  state=load();
  activeTab=state.table.tab||"session";
  mapKey=state.table.map||"city";
  render();
  var panel=el("tableModePanel");if(panel)panel.classList.add("show");
  document.body.classList.add("table-mode-open");
  document.body.style.overflow="hidden";
  if(!online()&&(!p||!p.isLoaded||!p.isLoaded())){
    showToast("Offline: o conteúdo Mestre só estará disponível se já tiver sido carregado nesta abertura do app.","warning",6500);
  }
  clearInterval(timer);
  timer=setInterval(updateHeader,30000);
}
function close(){
  clearInterval(timer);timer=null;
  var panel=el("tableModePanel");if(panel)panel.classList.remove("show");
  document.body.classList.remove("table-mode-open");
  var keep=!!document.querySelector("#adminPanel.show,#masterQuickPanel.show,#masterWorkspacePanel.show,#sessionModePanel.show,#sessionEditorPanel.show");
  document.body.style.overflow=keep?"hidden":"";
}
function setup(){
  var closeBtn=el("tableModeClose");if(closeBtn)closeBtn.addEventListener("click",close);
  var session=el("tableModeOpenSession");if(session)session.addEventListener("click",openSessionMode);
  var finishBtn=el("tableModeFinish");if(finishBtn)finishBtn.addEventListener("click",finish);
  document.querySelectorAll("[data-table-tab]").forEach(function(btn){
    btn.addEventListener("click",function(){setTab(btn.getAttribute("data-table-tab"));});
  });
  var viewer=el("tableModeMapViewer");
  if(viewer)viewer.addEventListener("click",function(event){if(event.target===viewer||event.target.closest("[data-table-map-close]"))viewer.classList.remove("show");});
  window.addEventListener("online",updateHeader);
  window.addEventListener("offline",updateHeader);
}
setup();

window.TerraZApp.tableMode={
  open:open,
  close:close,
  render:render,
  draft:function(){return state?JSON.parse(JSON.stringify(state)):load();}
};
})();