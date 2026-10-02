(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core=window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/timeline-manager.js');

var escapeHtml=core.escapeHtml;
var escapeAttr=core.escapeAttr;

var categoryConfig={
  "history":{label:"História",icon:"📜"},
  "pre-campaign":{label:"Pré-Campanha",icon:"⏳"},
  "campaign":{label:"Campanha",icon:"🎲"},
  "current":{label:"Atualidade",icon:"📡"},
  "future":{label:"Futuro",icon:"⌛"}
};
var categoryOrder=["history","pre-campaign","campaign","current","future"];
var activeCategory="all";
var query="";
var eventsCache=[];
var liveDrafts={};

function router(){ return window.TerraZApp && window.TerraZApp.router; }
function visibility(){ return window.TerraZApp && window.TerraZApp.visibility; }
function editor(){ return window.TerraZApp && window.TerraZApp.editor; }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }
function privateContent(){ return window.TerraZApp && window.TerraZApp.privateContent; }
function authenticated(){
  var b=backend();
  return !!(b && b.isAuthenticated && b.isAuthenticated());
}

function slugify(value){
  var r=router();
  if(r && r.slugify) return r.slugify(value);
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}

function normalizeVisibility(level){
  level=String(level || "public").toLowerCase();
  if(level==="rumor" || level==="restricted") return "spoiler";
  if(level==="private") return "master";
  return level==="master" || level==="spoiler" ? level : "public";
}

function captureLiveDrafts(){
  liveDrafts={};
  var root=document.getElementById("timelineData");
  if(!root) return;
  root.querySelectorAll("[data-edit-id]").forEach(function(node){
    var id=node.getAttribute("data-edit-id");
    if(id) liveDrafts[id]=node.innerHTML;
  });
}

function localDrafts(){
  try{
    var raw=localStorage.getItem("terraZ_v1_edits");
    return raw ? JSON.parse(raw) : {};
  }catch(error){ return {}; }
}

function editableHtml(meta,fallback,drafts){
  var id=meta && meta.id;
  if(id && liveDrafts[id] !== undefined) return liveDrafts[id];
  if(id && drafts[id] !== undefined) return drafts[id];

  var overrides=(window.TerraZData && window.TerraZData.contentOverrides) || {};
  if(id && overrides[id] !== undefined) return overrides[id];
  return escapeHtml(fallback || "");
}

function editAttrs(meta){
  if(!meta || !meta.id) return "";
  return ' data-edit-id="'+escapeAttr(meta.id)+'"'+
    (meta.legacyId ? ' data-legacy-edit-id="'+escapeAttr(meta.legacyId)+'"' : "");
}

function staticEvents(){
  var groups=(window.TerraZData && window.TerraZData.timeline) || [];
  var rows=[];
  if(!Array.isArray(groups)) return rows;

  groups.forEach(function(group){
    (group.items || []).forEach(function(item){
      if(!item || !item.id) return;
      rows.push({
        id:String(item.id),
        category:String(item.category || "history"),
        sortKey:Number(item.sortKey || 0),
        period:String(group.title || "Cronologia"),
        year:String(item.year || ""),
        text:String(item.text || ""),
        characters:Array.isArray(item.characters) ? item.characters.slice() : [],
        locations:Array.isArray(item.locations) ? item.locations.slice() : [],
        teams:Array.isArray(item.teams) ? item.teams.slice() : [],
        visibility:normalizeVisibility(item.visibility),
        edit:item.edit || {},
        source:"lore"
      });
    });
  });
  return rows;
}

function privateTimelineEvents(){
  var pc=privateContent();
  if(!pc || !pc.isLoaded || !pc.isLoaded() || !pc.getMasterState) return [];
  var master=pc.getMasterState() || {};
  var items=Array.isArray(master.timelineEvents) ? master.timelineEvents : [];

  return items.filter(function(item){ return item && item.id; }).map(function(item){
    return {
      id:String(item.id),
      category:String(item.category || "current"),
      sortKey:Number(item.sortKey || 0),
      period:periodForSort(Number(item.sortKey || 0)),
      year:String(item.year || ""),
      title:String(item.title || ""),
      text:String(item.text || ""),
      characters:Array.isArray(item.characters) ? item.characters.slice() : [],
      locations:Array.isArray(item.locations) ? item.locations.slice() : [],
      teams:Array.isArray(item.teams) ? item.teams.slice() : [],
      visibility:"master",
      source:"lore",
      privateRuntime:true
    };
  });
}

var months={
  janeiro:1,fevereiro:2,marco:3,"março":3,abril:4,maio:5,junho:6,
  julho:7,agosto:8,setembro:9,outubro:10,novembro:11,dezembro:12
};

function numericDate(year,month,day){
  year=Number(year)||0; month=Number(month)||0; day=Number(day)||0;
  return year*10000+month*100+day;
}

function parseWorldDate(value){
  var text=String(value || "").trim().toLowerCase();
  if(!text) return 0;

  var iso=text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if(iso) return numericDate(iso[1],iso[2],iso[3]);

  var full=text.match(/(\d{1,2})\s+de\s+([a-záàâãéêíóôõúç]+)\s+de\s+(\d{4})/i);
  if(full && months[full[2]]) return numericDate(full[3],months[full[2]],full[1]);

  var monthYear=text.match(/([a-záàâãéêíóôõúç]+)\s+(?:de\s+)?(\d{4})/i);
  if(monthYear && months[monthYear[1]]) return numericDate(monthYear[2],months[monthYear[1]],1);

  var year=text.match(/\b(\d{4})\b/);
  return year ? numericDate(year[1],1,1) : 0;
}

function periodForSort(sortKey){
  sortKey=Number(sortKey || 0);
  if(sortKey && sortKey<10000000) return "Séculos Atrás – Marte";
  if(sortKey<20100000) return "1950–2008 – Chegada e Tragédia";
  if(sortKey<20260000) return "2010–2025 – Heróis e Tragédias";
  if(sortKey<20280000) return "2026–2027 – Pré-Campanha e Campanha";
  return "Futuro";
}

function sessionEvents(){
  var manager=window.TerraZApp && window.TerraZApp.sessions;
  var sessions=manager && manager.getAll
    ? manager.getAll()
    : ((window.TerraZData && window.TerraZData.sessions) || []);

  if(!Array.isArray(sessions)) return [];

  return sessions.filter(function(session){ return session && session.id; }).map(function(session){
    var sortKey=parseWorldDate(session.inWorldDate) || parseWorldDate(session.realDate) || 99999999;
    return {
      id:"sessao-"+slugify(session.id),
      category:"campaign",
      sortKey:sortKey,
      period:periodForSort(sortKey),
      year:String(session.inWorldDate || session.realDate || "Data não informada"),
      title:String(session.title || "Sessão sem título"),
      text:String(session.summary || ""),
      characters:Array.isArray(session.characters) ? session.characters.slice() : [],
      locations:Array.isArray(session.locations) ? session.locations.slice() : [],
      teams:[],
      consequences:Array.isArray(session.consequences) ? session.consequences.slice() : [],
      visibility:normalizeVisibility(session.visibility),
      source:"session",
      sessionId:String(session.id),
      realDate:String(session.realDate || "")
    };
  });
}

function allEvents(){
  return staticEvents().concat(privateTimelineEvents()).concat(sessionEvents()).sort(function(a,b){
    if(a.sortKey!==b.sortKey) return a.sortKey-b.sortKey;
    return String(a.id).localeCompare(String(b.id),"pt-BR");
  });
}

function knownCharacter(name){
  var manager=window.TerraZApp && window.TerraZApp.characters;
  return !!(manager && manager.get && manager.get(name));
}

function characterVisibility(name){
  var taxonomy=window.TerraZData && window.TerraZData.characterTaxonomy;
  var row=taxonomy && taxonomy.characters && taxonomy.characters[name];
  return normalizeVisibility(row && row.visibility);
}

function knownTeam(name){
  var teams=window.TerraZData && window.TerraZData.teams && window.TerraZData.teams.teams;
  return Array.isArray(teams) && teams.some(function(team){ return team && team.name===name; });
}

function connectionButton(label,route,kind,level){
  if(!route) return '<span class="timeline-chip '+kind+'">'+escapeHtml(label)+'</span>';
  return '<button type="button" class="timeline-chip '+kind+'" data-timeline-route="'+escapeAttr(route)+'"'+
    (level ? ' data-visibility="'+escapeAttr(level)+'"' : "")+'>'+escapeHtml(label)+'</button>';
}

function renderConnections(event){
  var r=router();
  var parts=[];

  (event.characters || []).forEach(function(name){
    var route=knownCharacter(name) ? "/personagens/"+slugify(name) : "";
    parts.push(connectionButton(name,route,"character",characterVisibility(name)));
  });

  (event.locations || []).forEach(function(name){
    var route=r && r.routeForLocation ? r.routeForLocation(name) : "";
    parts.push(connectionButton(name,route,"location"));
  });

  (event.teams || []).forEach(function(name){
    var route=knownTeam(name) ? "/equipes/"+slugify(name) : "";
    parts.push(connectionButton(name,route,"team"));
  });

  if(event.sessionId && r && r.sessionRoute){
    parts.push(connectionButton("Abrir sessão",r.sessionRoute(event.sessionId),"session"));
  }

  if(!parts.length) return "";
  return '<div class="timeline-connections"><span class="timeline-connections-label">Conexões</span>'+parts.join("")+'</div>';
}

function routeForEvent(event){
  var r=router();
  return r && r.timelineEventRoute
    ? r.timelineEventRoute(event.id)
    : "/linha-do-tempo/"+slugify(event.id);
}

function renderEvent(event,drafts){
  var category=categoryConfig[event.category] || categoryConfig.history;
  var route=routeForEvent(event);
  var body="";

  if(event.title){
    body+='<h4 class="timeline-event-title">'+escapeHtml(event.title)+'</h4>';
  }

  if(event.source==="lore"){
    body+='<div class="timeline-event-text"'+editAttrs(event.edit && event.edit.text)+'>'+
      editableHtml(event.edit && event.edit.text,event.text,drafts)+'</div>';
  }else if(event.text){
    body+='<div class="timeline-event-text">'+escapeHtml(event.text)+'</div>';
  }

  body+=renderConnections(event);

  if(event.consequences && event.consequences.length){
    body+='<div class="timeline-consequences"><strong>Consequências</strong><ul>'+
      event.consequences.map(function(item){ return "<li>"+escapeHtml(item)+"</li>"; }).join("")+
      "</ul></div>";
  }

  if(event.source==="session" && event.realDate){
    body+='<div class="timeline-session-realdate">Sessão jogada em '+escapeHtml(event.realDate)+'</div>';
  }

  var yearHtml=event.source==="lore"
    ? '<div class="timeline-event-date"'+editAttrs(event.edit && event.edit.year)+'>'+
        editableHtml(event.edit && event.edit.year,event.year,drafts)+'</div>'
    : '<div class="timeline-event-date">'+escapeHtml(event.year)+'</div>';

  return '<article class="timeline-event timeline-kind-'+escapeAttr(event.category)+'"'+
    ' data-timeline-id="'+escapeAttr(event.id)+'"'+
    ' data-timeline-kind="'+escapeAttr(event.category)+'"'+
    ' data-deep-route="'+escapeAttr(route)+'"'+
    ' data-visibility="'+escapeAttr(event.visibility)+'">'+
      '<div class="timeline-event-head">'+
        yearHtml+
        '<div class="timeline-event-badges">'+
          '<span class="timeline-kind-badge">'+category.icon+' '+escapeHtml(category.label)+'</span>'+
          (event.source==="session" ? '<span class="timeline-source-badge">DIÁRIO</span>' : '<span class="timeline-source-badge">LORE</span>')+
        '</div>'+
        '<div class="timeline-event-actions">'+
          (authenticated()
            ? (event.source==="session"
                ? '<button type="button" class="timeline-event-edit" data-timeline-edit-session="'+escapeAttr(event.sessionId || "")+'" title="Editar esta sessão no Diário">✏️</button>'
                : '<button type="button" class="timeline-event-edit" data-timeline-edit="'+escapeAttr(event.id)+'" title="Editar evento">✏️</button>'+
                  '<button type="button" class="timeline-event-delete danger" data-timeline-delete="'+escapeAttr(event.id)+'" title="Excluir evento">🗑️</button>')
            : '')+
          '<button type="button" class="timeline-event-link" data-timeline-copy="'+escapeAttr(route)+'" title="Copiar link deste evento">🔗</button>'+
          '<button type="button" class="timeline-event-toggle" title="Recolher ou expandir evento" aria-expanded="true">▾</button>'+
        '</div>'+
      '</div>'+
      '<div class="timeline-event-body">'+body+'</div>'+
    '</article>';
}

function renderPeriod(title,events,drafts){
  return '<section class="timeline-period" data-timeline-period="'+escapeAttr(title)+'">'+
    '<div class="timeline-period-title"><span>'+escapeHtml(title)+'</span><small>'+events.length+(events.length===1?" evento":" eventos")+'</small></div>'+
    '<div class="timeline-period-track">'+events.map(function(event){ return renderEvent(event,drafts); }).join("")+'</div>'+
  '</section>';
}

function renderFilters(){
  var root=document.getElementById("timelineFilters");
  if(!root) return;

  var visibilityApi=visibility();
  var allowed=eventsCache.filter(function(event){
    return !visibilityApi || !visibilityApi.isLevelAllowed || visibilityApi.isLevelAllowed(event.visibility);
  });

  var buttons=[{id:"all",label:"Todos",icon:"◎"}].concat(categoryOrder.map(function(id){
    var config=categoryConfig[id];
    return {id:id,label:config.label,icon:config.icon};
  }));

  root.innerHTML=buttons.map(function(button){
    var count=button.id==="all"
      ? allowed.length
      : allowed.filter(function(event){ return event.category===button.id; }).length;
    return '<button type="button" data-timeline-filter="'+escapeAttr(button.id)+'" aria-pressed="'+(activeCategory===button.id?"true":"false")+'">'+
      button.icon+' '+escapeHtml(button.label)+' <span>'+count+'</span></button>';
  }).join("");

  root.querySelectorAll("[data-timeline-filter]").forEach(function(button){
    button.addEventListener("click",function(){
      activeCategory=button.getAttribute("data-timeline-filter") || "all";
      renderFilters();
      applyFilters();
    });
  });
}

function searchableText(event){
  var config=categoryConfig[event.category] || categoryConfig.history;
  return [
    config.label,event.period,event.year,event.title,event.text,
    (event.characters||[]).join(" "),
    (event.locations||[]).join(" "),
    (event.teams||[]).join(" "),
    (event.consequences||[]).join(" ")
  ].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
}

function visibilityAllowed(event){
  var api=visibility();
  return !api || !api.isLevelAllowed || api.isLevelAllowed(event.visibility);
}

function applyFilters(){
  var root=document.getElementById("timelineData");
  if(!root) return;

  var normalizedQuery=String(query || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  var visibleCount=0;
  var campaignCount=0;
  var allowedCount=0;

  eventsCache.forEach(function(event){
    var article=root.querySelector('[data-timeline-id="'+CSS.escape(event.id)+'"]');
    if(!article) return;

    var allowed=visibilityAllowed(event);
    if(allowed) allowedCount++;

    var categoryMatch=activeCategory==="all" || event.category===activeCategory;
    var searchMatch=!normalizedQuery || searchableText(event).indexOf(normalizedQuery)!==-1;
    var filtered=!(categoryMatch && searchMatch);
    article.classList.toggle("timeline-filter-hidden",filtered);

    if(allowed && !filtered){
      visibleCount++;
      if(event.category==="campaign") campaignCount++;
    }
  });

  root.querySelectorAll(".timeline-period").forEach(function(period){
    var any=Array.from(period.querySelectorAll(".timeline-event")).some(function(article){
      return !article.hidden && !article.classList.contains("timeline-filter-hidden");
    });
    period.classList.toggle("timeline-period-hidden",!any);
  });

  var status=document.getElementById("timelineStatus");
  if(status){
    status.textContent=visibleCount+" de "+allowedCount+" eventos visíveis · "+campaignCount+
      (campaignCount===1?" sessão da campanha":" sessões da campanha");
  }

  var empty=document.getElementById("timelineEmpty");
  if(empty) empty.hidden=visibleCount!==0;

  var total=document.getElementById("timelineTotalCount");
  var sessionTotal=document.getElementById("timelineSessionCount");
  var connections=document.getElementById("timelineConnectionCount");
  if(total) total.textContent=String(allowedCount);
  if(sessionTotal) sessionTotal.textContent=String(eventsCache.filter(function(event){ return event.category==="campaign" && visibilityAllowed(event); }).length);
  if(connections){
    var connectionCount=eventsCache.filter(visibilityAllowed).reduce(function(sum,event){
      return sum+(event.characters||[]).length+(event.locations||[]).length+(event.teams||[]).length+(event.sessionId?1:0);
    },0);
    connections.textContent=String(connectionCount);
  }
}

function restoreEditorState(){
  var e=editor();
  if(!e || !e.isEditing || !e.isEditing()) return;
  var root=document.getElementById("timelineData");
  if(!root) return;
  root.querySelectorAll("[data-edit-id]").forEach(function(node){
    node.contentEditable="true";
    node.classList.add("edit-active");
  });
}

function bindEventControls(){
  var root=document.getElementById("timelineData");
  if(!root) return;

  root.querySelectorAll("[data-timeline-route]").forEach(function(button){
    button.addEventListener("click",function(event){
      event.stopPropagation();
      var r=router();
      var route=button.getAttribute("data-timeline-route");
      if(r && r.go && route) r.go(route);
    });
  });

  root.querySelectorAll("[data-timeline-copy]").forEach(function(button){
    button.addEventListener("click",function(event){
      event.stopPropagation();
      var r=router();
      var route=button.getAttribute("data-timeline-copy");
      if(r && r.copyRoute && route) r.copyRoute(route,"evento");
    });
  });

  root.querySelectorAll("[data-timeline-edit]").forEach(function(button){
    button.addEventListener("click",function(event){
      event.stopPropagation();
      var timelineEditor=window.TerraZApp && window.TerraZApp.timelineEditor;
      if(timelineEditor && timelineEditor.open) timelineEditor.open(button.getAttribute("data-timeline-edit"));
    });
  });

  root.querySelectorAll("[data-timeline-delete]").forEach(function(button){
    button.addEventListener("click",function(event){
      event.stopPropagation();
      var timelineEditor=window.TerraZApp && window.TerraZApp.timelineEditor;
      if(timelineEditor && timelineEditor.deleteEvent) timelineEditor.deleteEvent(button.getAttribute("data-timeline-delete"));
    });
  });

  root.querySelectorAll("[data-timeline-edit-session]").forEach(function(button){
    button.addEventListener("click",function(event){
      event.stopPropagation();
      var sessionEditor=window.TerraZApp && window.TerraZApp.sessionEditor;
      if(sessionEditor && sessionEditor.open) sessionEditor.open(button.getAttribute("data-timeline-edit-session"));
    });
  });

  root.querySelectorAll(".timeline-event-toggle").forEach(function(button){
    button.addEventListener("click",function(event){
      event.stopPropagation();
      var article=button.closest(".timeline-event");
      if(!article) return;
      var collapsed=article.classList.toggle("timeline-event-collapsed");
      button.setAttribute("aria-expanded",collapsed ? "false" : "true");
      button.textContent=collapsed ? "▸" : "▾";
    });
  });
}

function render(){
  var root=document.getElementById("timelineData");
  if(!root) return;

  captureLiveDrafts();
  var drafts=localDrafts();
  eventsCache=allEvents();

  var periods=[];
  eventsCache.forEach(function(event){
    var group=periods.find(function(row){ return row.title===event.period; });
    if(!group){
      group={title:event.period,events:[]};
      periods.push(group);
    }
    group.events.push(event);
  });

  periods.sort(function(a,b){
    var aa=a.events.length ? a.events[0].sortKey : 0;
    var bb=b.events.length ? b.events[0].sortKey : 0;
    return aa-bb;
  });

  root.innerHTML=periods.map(function(period){
    return renderPeriod(period.title,period.events,drafts);
  }).join("")+'<div id="timelineEmpty" class="timeline-empty" hidden>Nenhum evento corresponde aos filtros atuais.</div>';

  bindEventControls();
  restoreEditorState();
  renderFilters();

  var api=visibility();
  if(api && api.apply) api.apply({closeSensitive:false});
  applyFilters();

  document.dispatchEvent(new CustomEvent("terra-z:timeline-rendered",{detail:{count:eventsCache.length}}));
}

function focus(id){
  id=String(id || "");
  var root=document.getElementById("timelineData");
  if(!root) return false;

  var target=root.querySelector('[data-timeline-id="'+CSS.escape(id)+'"]');
  if(!target) return false;

  activeCategory="all";
  query="";
  var input=document.getElementById("timelineSearch");
  if(input) input.value="";
  renderFilters();
  applyFilters();

  target.classList.remove("timeline-event-collapsed");
  var toggle=target.querySelector(".timeline-event-toggle");
  if(toggle){
    toggle.textContent="▾";
    toggle.setAttribute("aria-expanded","true");
  }

  document.querySelectorAll(".deep-link-focus").forEach(function(node){ node.classList.remove("deep-link-focus"); });
  target.classList.add("deep-link-focus");
  setTimeout(function(){
    try{ target.scrollIntoView({behavior:"smooth",block:"center"}); }
    catch(error){ target.scrollIntoView(); }
  },60);
  return true;
}

function labelFor(id){
  var event=eventsCache.find(function(row){ return row.id===id; });
  if(!event) return "";
  return event.title || event.year || "Evento";
}

function getEvent(id){
  var event=eventsCache.find(function(row){ return row.id===String(id || ""); });
  return event ? JSON.parse(JSON.stringify(event)) : null;
}

function rebuildPublicTimeline(items){
  var order=[
    "Séculos Atrás – Marte",
    "1950–2008 – Chegada e Tragédia",
    "2010–2025 – Heróis e Tragédias",
    "2026–2027 – Pré-Campanha e Campanha",
    "Futuro"
  ];
  var groups={};
  order.forEach(function(title,index){ groups[title]={title:title,order:(index+1)*10,items:[]}; });

  (items || []).forEach(function(item){
    var title=periodForSort(item.sortKey);
    if(!groups[title]) groups[title]={title:title,order:999,items:[]};
    groups[title].items.push(item);
  });

  window.TerraZData.timeline=Object.keys(groups).map(function(title){
    var group=groups[title];
    group.items.sort(function(a,b){
      return Number(a.sortKey||0)-Number(b.sortKey||0) || String(a.id||"").localeCompare(String(b.id||""),"pt-BR");
    });
    return group;
  }).filter(function(group){ return group.items.length; }).sort(function(a,b){ return a.order-b.order; });
}

function removeLore(id){
  id=String(id || "");
  var publicItems=[];
  ((window.TerraZData && window.TerraZData.timeline) || []).forEach(function(group){
    (group.items || []).forEach(function(item){
      if(item && item.id!==id) publicItems.push(item);
    });
  });
  rebuildPublicTimeline(publicItems);

  var pc=privateContent();
  if(pc && pc.getMasterState && pc.setMasterState){
    var master=JSON.parse(JSON.stringify(pc.getMasterState() || {}));
    master.timelineEvents=(Array.isArray(master.timelineEvents) ? master.timelineEvents : [])
      .filter(function(item){ return item && item.id!==id; });
    pc.setMasterState(master);
  }

  render();
}

function upsertLore(event){
  if(!event || !event.id) return;
  var id=String(event.id);
  var publicItems=[];

  ((window.TerraZData && window.TerraZData.timeline) || []).forEach(function(group){
    (group.items || []).forEach(function(item){
      if(item && item.id!==id) publicItems.push(item);
    });
  });

  var pc=privateContent();
  if(pc && pc.getMasterState && pc.setMasterState){
    var master=JSON.parse(JSON.stringify(pc.getMasterState() || {}));
    master.timelineEvents=(Array.isArray(master.timelineEvents) ? master.timelineEvents : [])
      .filter(function(item){ return item && item.id!==id; });
    if(event.visibility==="master"){
      master.timelineEvents.push(JSON.parse(JSON.stringify(event)));
    }
    pc.setMasterState(master);
  }

  if(event.visibility!=="master"){
    var publicCopy=JSON.parse(JSON.stringify(event));
    delete publicCopy.privateRuntime;
    delete publicCopy.period;
    delete publicCopy.source;
    publicItems.push(publicCopy);
  }

  rebuildPublicTimeline(publicItems);
  render();
}

function setupControls(){
  var search=document.getElementById("timelineSearch");
  if(search){
    search.addEventListener("input",function(){
      query=search.value || "";
      applyFilters();
    });
  }

  var clear=document.getElementById("timelineClear");
  if(clear){
    clear.addEventListener("click",function(){
      activeCategory="all";
      query="";
      if(search) search.value="";
      renderFilters();
      applyFilters();
    });
  }

  var expand=document.getElementById("timelineExpandAll");
  if(expand){
    expand.addEventListener("click",function(){
      document.querySelectorAll("#timelineData .timeline-event").forEach(function(article){
        article.classList.remove("timeline-event-collapsed");
        var button=article.querySelector(".timeline-event-toggle");
        if(button){ button.textContent="▾"; button.setAttribute("aria-expanded","true"); }
      });
    });
  }

  var collapse=document.getElementById("timelineCollapseAll");
  if(collapse){
    collapse.addEventListener("click",function(){
      document.querySelectorAll("#timelineData .timeline-event").forEach(function(article){
        article.classList.add("timeline-event-collapsed");
        var button=article.querySelector(".timeline-event-toggle");
        if(button){ button.textContent="▸"; button.setAttribute("aria-expanded","false"); }
      });
    });
  }
}

[
  "terra-z:sessions-rendered",
  "terra-z:runtime-data-loaded",
  "terra-z:auth-changed",
  "terra-z:private-content-loaded",
  "terra-z:private-content-cleared"
].forEach(function(name){
  document.addEventListener(name,function(){ setTimeout(render,0); });
});

document.addEventListener("terra-z:visibility-changed",function(){
  renderFilters();
  applyFilters();
});

window.TerraZApp.timeline={
  render:render,
  focus:focus,
  labelFor:labelFor,
  getEvent:getEvent,
  upsertLore:upsertLore,
  removeLore:removeLore,
  parseWorldDate:parseWorldDate,
  periodForSort:periodForSort,
  events:function(){ return eventsCache.slice(); },
  category:function(){ return activeCategory; }
};

setupControls();
render();

})();
