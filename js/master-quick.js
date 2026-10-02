(function(){
"use strict";

window.TerraZApp=window.TerraZApp||{};
var core=window.TerraZCore;
if(!core) throw new Error("Terra Z: núcleo não carregado antes de js/master-quick.js");

var escapeHtml=core.escapeHtml;
var escapeAttr=core.escapeAttr;
var showToast=core.showToast;
var searchTerm="";

function el(id){return document.getElementById(id);}
function backend(){return window.TerraZApp&&window.TerraZApp.backend;}
function privateApi(){return window.TerraZApp&&window.TerraZApp.privateContent;}
function authenticated(){
  var b=backend();
  return !!(b&&b.isAuthenticated&&b.isAuthenticated());
}
function master(){
  var p=privateApi();
  return p&&p.getMasterState?p.getMasterState():{
    notes:[],revelations:[],goals:[],clues:[],npcStates:[],timelineEvents:[]
  };
}
function normalize(value){
  return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
}
function matches(item){
  if(!searchTerm)return true;
  try{return normalize(JSON.stringify(item)).includes(searchTerm);}catch(e){return true;}
}
function fmtDate(value){
  if(!value)return "";
  var date=new Date(value);if(Number.isNaN(date.getTime()))return "";
  try{return date.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});}catch(e){return "";}
}
function renderStats(state){
  var root=el("masterQuickStats");if(!root)return;
  var activeGoals=(state.goals||[]).filter(function(x){return x.status==="active";}).length;
  var hiddenClues=(state.clues||[]).filter(function(x){return x.status==="hidden";}).length;
  var planned=(state.revelations||[]).filter(function(x){return x.status==="planned";}).length;
  var activeNpcs=(state.npcStates||[]).filter(function(x){return !x.status||x.status==="active"||x.status==="unknown";}).length;

  root.innerHTML=[
    ["🎯",activeGoals,"Objetivos ativos"],
    ["🧩",hiddenClues,"Pistas ocultas"],
    ["🔮",planned,"Revelações"],
    ["👤",activeNpcs,"NPCs em jogo"]
  ].map(function(row){
    return '<div><span>'+row[0]+'</span><strong>'+row[1]+'</strong><small>'+escapeHtml(row[2])+'</small></div>';
  }).join("");
}
function itemCard(icon,title,summary,chips){
  return '<article class="master-quick-item">'+
    '<div><strong>'+icon+" "+escapeHtml(title||"Sem título")+'</strong>'+
    (summary?'<p>'+escapeHtml(summary)+'</p>':"")+'</div>'+
    ((chips||[]).filter(Boolean).length?'<div class="master-quick-chips">'+chips.filter(Boolean).map(function(chip){return '<span>'+escapeHtml(chip)+'</span>';}).join("")+'</div>':"")+
  '</article>';
}
function renderList(id,countId,items,mapper,empty){
  var root=el(id),count=el(countId);if(!root)return;
  var list=(items||[]).filter(matches);
  if(count)count.textContent=String(list.length);
  root.innerHTML=list.length?list.map(mapper).join(""):'<div class="master-quick-empty">'+escapeHtml(empty)+'</div>';
}
function recentEvents(state){
  var app=window.TerraZApp||{};
  var rows=[];

  var parseDate=app.timeline&&app.timeline.parseWorldDate
    ? app.timeline.parseWorldDate
    : function(value){
        var match=String(value||"").match(/\b(\d{4})[-/]?(\d{2})?[-/]?(\d{2})?\b/);
        return match ? Number(match[1]+(match[2]||"01")+(match[3]||"01")) : 0;
      };
  var sessions=app.sessions&&app.sessions.getAll
    ? app.sessions.getAll()
    : ((window.TerraZData&&window.TerraZData.sessions)||[]);
  sessions.forEach(function(session){
    rows.push({
      kind:"session",
      title:session.title||"Sessão",
      summary:session.summary||"",
      date:session.inWorldDate||session.realDate||"",
      sort:parseDate(session.inWorldDate)||parseDate(session.realDate)||0,
      visibility:session.visibility||"public"
    });
  });

  var timelineEvents=app.timeline&&app.timeline.events
    ? app.timeline.events()
    : [];
  if(timelineEvents.length){
    timelineEvents.forEach(function(event){
      rows.push({
        kind:"event",
        title:event.title||event.year||"Evento",
        summary:event.text||event.summary||"",
        date:event.year||"",
        sort:Number(event.sortKey||0),
        visibility:event.visibility||"public"
      });
    });
  }else{
    var timeline=(window.TerraZData&&window.TerraZData.timeline)||[];
    timeline.forEach(function(group){
      (group.events||[]).forEach(function(event){
        rows.push({
          kind:"event",
          title:event.title||event.year||"Evento",
          summary:event.text||"",
          date:event.year||"",
          sort:Number(event.sortKey||0),
          visibility:event.visibility||"public"
        });
      });
    });
  }

  return rows.sort(function(a,b){return Number(b.sort||0)-Number(a.sort||0);}).slice(0,10);
}

function renderAlerts(state){
  var root=el("masterQuickAlerts");if(!root)return;
  var alerts=[];
  var activeGoals=(state.goals||[]).filter(function(x){return x.status==="active";});
  var hiddenClues=(state.clues||[]).filter(function(x){return x.status==="hidden";});
  var planned=(state.revelations||[]).filter(function(x){return x.status==="planned";});
  var missing=(state.npcStates||[]).filter(function(x){return x.status==="missing"||x.status==="captured";});

  if(!activeGoals.length)alerts.push({state:"warning",text:"Nenhum objetivo Mestre está marcado como ativo."});
  if(hiddenClues.length>5)alerts.push({state:"info",text:hiddenClues.length+" pistas ainda estão ocultas."});
  if(planned.length)alerts.push({state:"info",text:planned.length+" revelações continuam planejadas."});
  if(missing.length)alerts.push({state:"warning",text:missing.length+" NPCs estão desaparecidos ou capturados."});
  if(!alerts.length)alerts.push({state:"ok",text:"Nenhuma pendência automática detectada para a próxima sessão."});

  root.innerHTML=alerts.map(function(alert){
    return '<div data-state="'+alert.state+'">'+escapeHtml(alert.text)+'</div>';
  }).join("");
}
function render(){
  var state=master();
  renderStats(state);
  renderAlerts(state);

  renderList("masterQuickGoals","masterQuickGoalsCount",
    (state.goals||[]).filter(function(x){return x.status==="active";}),
    function(item){return itemCard("🎯",item.title,item.body,[item.owner,item.updatedAt?fmtDate(item.updatedAt):""]);},
    "Nenhum objetivo ativo.");

  renderList("masterQuickClues","masterQuickCluesCount",
    (state.clues||[]).filter(function(x){return x.status==="hidden";}),
    function(item){return itemCard("🧩",item.title,item.body,[item.truth,item.characters&&item.characters.slice(0,2).join(", ")]);},
    "Nenhuma pista oculta.");

  renderList("masterQuickRevelations","masterQuickRevelationsCount",
    (state.revelations||[]).filter(function(x){return x.status==="planned";}),
    function(item){return itemCard("🔮",item.title,item.body,[item.trigger]);},
    "Nenhuma revelação planejada.");

  renderList("masterQuickNpcs","masterQuickNpcsCount",
    (state.npcStates||[]).filter(function(x){return !x.status||x.status==="active"||x.status==="unknown"||x.status==="missing"||x.status==="captured";}),
    function(item){return itemCard("👤",item.name,item.state||item.intention,[item.status,item.location]);},
    "Nenhum NPC privado em jogo.");

  renderList("masterQuickNotes","masterQuickNotesCount",
    (state.notes||[]).slice().sort(function(a,b){return String(b.updatedAt||"").localeCompare(String(a.updatedAt||""));}).slice(0,8),
    function(item){return itemCard("📝",item.title,item.body,[item.tags&&item.tags.slice(0,3).join(" · "),fmtDate(item.updatedAt)]);},
    "Nenhuma nota privada.");

  var recent=recentEvents(state).filter(matches);
  var recentRoot=el("masterQuickRecent"),recentCount=el("masterQuickRecentCount");
  if(recentCount)recentCount.textContent=String(recent.length);
  if(recentRoot)recentRoot.innerHTML=recent.length?recent.map(function(item){
    return itemCard(item.kind==="session"?"📓":"📅",item.title,item.summary,[item.date,item.visibility==="master"?"🔒 Mestre":(item.visibility==="spoiler"?"⚠️ Spoiler":"🌐 Público")]);
  }).join(""):'<div class="master-quick-empty">Nenhum acontecimento recente.</div>';
}
async function refresh(){
  if(!authenticated())return;
  var p=privateApi();
  if(p&&p.reload)await p.reload();
  render();
}
async function open(){
  if(!authenticated()){showToast("Entre como editor para abrir a Sala do Mestre.","warning",4500);return;}
  var p=privateApi();if(p&&p.load)await p.load();
  searchTerm="";
  if(el("masterQuickSearch"))el("masterQuickSearch").value="";
  render();
  var panel=el("masterQuickPanel");if(panel)panel.classList.add("show");
  document.body.style.overflow="hidden";
}
function close(){
  var panel=el("masterQuickPanel");if(panel)panel.classList.remove("show");
  var keep=!!document.querySelector("#adminPanel.show,#taxonomyManagerPanel.show,#bulkEditorPanel.show,#masterWorkspacePanel.show");
  document.body.style.overflow=keep?"hidden":"";
}
function setup(){
  var panel=el("masterQuickPanel");if(panel)panel.addEventListener("click",function(e){if(e.target===panel)close();});
  var closeBtn=el("masterQuickClose");if(closeBtn)closeBtn.addEventListener("click",close);
  var refreshBtn=el("masterQuickRefresh");if(refreshBtn)refreshBtn.addEventListener("click",refresh);
  var search=el("masterQuickSearch");if(search)search.addEventListener("input",function(){searchTerm=normalize(search.value).trim();render();});
  var workspace=el("masterQuickWorkspace");if(workspace)workspace.addEventListener("click",function(){
    close();var w=window.TerraZApp&&window.TerraZApp.masterWorkspace;if(w&&w.open)w.open();
  });
  var mode=el("masterQuickSessionMode");if(mode)mode.addEventListener("click",function(){
    close();var sessionMode=window.TerraZApp&&window.TerraZApp.sessionMode;if(sessionMode&&sessionMode.open)sessionMode.open();
  });
  var session=el("masterQuickNewSession");if(session)session.addEventListener("click",function(){
    close();var editor=window.TerraZApp&&window.TerraZApp.sessionEditor;if(editor&&editor.open)editor.open("");
  });
  document.addEventListener("terra-z:private-content-loaded",function(){if(panel&&panel.classList.contains("show"))render();});
  document.addEventListener("terra-z:runtime-data-loaded",function(){if(panel&&panel.classList.contains("show"))render();});
}
setup();
window.TerraZApp.masterQuick={open:open,close:close,refresh:refresh,render:render};
})();