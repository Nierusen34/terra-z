(function(){
"use strict";

window.TerraZApp=window.TerraZApp||{};
var core=window.TerraZCore;
if(!core) throw new Error("Terra Z: núcleo não carregado antes de js/command-palette.js");

var escapeHtml=core.escapeHtml;
var escapeAttr=core.escapeAttr;
var selected=0;
var current=[];
var lastQuery="";
var masterLoaded=false;

function el(id){return document.getElementById(id);}
function app(){return window.TerraZApp||{};}
function data(){return window.TerraZData||{};}
function backend(){return app().backend;}
function normalize(value){
  return String(value==null?"":value)
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().trim();
}
function slug(value){
  var r=app().router;
  return r&&r.slugify?r.slugify(value):normalize(value).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
function authenticated(){
  var b=backend();
  return !!(b&&b.isConfigured&&b.isConfigured()&&b.isAuthenticated&&b.isAuthenticated());
}
function text(value){
  if(Array.isArray(value)) return value.join(" ");
  if(value&&typeof value==="object"){
    try{return JSON.stringify(value);}catch(e){return "";}
  }
  return String(value||"");
}
function push(rows,row){
  if(!row||!row.label)return;
  row.search=normalize([row.label,row.subtitle,text(row.keywords)].join(" "));
  rows.push(row);
}
function publicIndex(){
  var rows=[];
  var a=app();
  var r=a.router;

  var characters=a.characters&&a.characters.names?a.characters.names():[];
  characters.forEach(function(name){
    var ficha=a.characters.get?a.characters.get(name):null;
    push(rows,{
      id:"character:"+name,type:"Personagem",icon:"👤",label:name,
      subtitle:"Ficha de personagem",keywords:ficha,
      route:"/personagens/"+slug(name)
    });
  });

  var districts=Array.isArray(data().districts)?data().districts:[];
  districts.forEach(function(item){
    push(rows,{
      id:"district:"+item.id,type:"Distrito",icon:item.icon||"📍",label:item.name,
      subtitle:item.type||"Vanguard Bay",keywords:[item.locations,item.note],
      route:r&&r.districtRoute?r.districtRoute(item.id||item.name):"/distritos/"+slug(item.id||item.name)
    });
    (item.locations||[]).forEach(function(name){
      push(rows,{
        id:"location:"+item.id+":"+name,type:"Local",icon:"📌",label:name,
        subtitle:item.name,keywords:[item.type,item.note],
        route:(r&&r.routeForLocation&&r.routeForLocation(name))||"/distritos/"+slug(item.id||item.name)
      });
    });
  });

  var cities=Array.isArray(data().externalCities)?data().externalCities:[];
  cities.forEach(function(item){
    push(rows,{
      id:"city:"+item.city,type:"Cidade",icon:"🏙️",label:item.city,
      subtitle:"Cidade externa",keywords:item,
      route:r&&r.cityRoute?r.cityRoute(item.city):"/cidades/"+slug(item.city)
    });
  });

  var teams=data().teams&&Array.isArray(data().teams.teams)?data().teams.teams:[];
  teams.forEach(function(item){
    push(rows,{
      id:"team:"+item.name,type:"Equipe",icon:"🛡️",label:item.name,
      subtitle:item.leader?("Liderança: "+item.leader):"Equipe",keywords:item,
      route:r&&r.teamRoute?r.teamRoute(item.name):"/equipes/"+slug(item.name)
    });
  });

  var sessions=a.sessions&&a.sessions.getAll?a.sessions.getAll():(Array.isArray(data().sessions)?data().sessions:[]);
  sessions.forEach(function(item){
    push(rows,{
      id:"session:"+item.id,type:item.visibility==="master"?"Sessão Mestre":"Sessão",
      icon:item.visibility==="master"?"🔒":"📓",label:item.title||"Sessão",
      subtitle:item.inWorldDate||item.realDate||"Diário da Campanha",
      keywords:[item.summary,item.characters,item.locations,item.consequences],
      master:item.visibility==="master",
      route:r&&r.sessionRoute?r.sessionRoute(item.id):"/sessoes/"+item.id
    });
  });

  var timeline=a.timeline&&a.timeline.events?a.timeline.events():[];
  timeline.forEach(function(item){
    push(rows,{
      id:"timeline:"+item.id,type:item.visibility==="master"?"Evento Mestre":"Timeline",
      icon:item.visibility==="master"?"🔒":"📅",label:item.title||item.year||"Evento",
      subtitle:item.year||item.period||"Linha do Tempo",
      keywords:[item.text,item.characters,item.locations,item.teams],
      master:item.visibility==="master",
      route:r&&r.timelineEventRoute?r.timelineEventRoute(item.id):"/linha-do-tempo/"+item.id
    });
  });

  var graph=a.graph&&a.graph.getData?a.graph.getData():null;
  (graph&&Array.isArray(graph.nodes)?graph.nodes:[]).forEach(function(node){
    if(node.visibility==="master"&&!authenticated())return;
    push(rows,{
      id:"graph:"+node.id,type:node.visibility==="master"?"Entidade Mestre":"Relação",
      icon:node.visibility==="master"?"🔒":"🔗",label:node.label||node.id,
      subtitle:node.kind||"Entidade do grafo",keywords:[node.note,node.ref,node.tags],
      master:node.visibility==="master",
      action:function(){
        if(r&&r.go)r.go("/universo/relacoes");
        setTimeout(function(){if(a.graph&&a.graph.focusNode)a.graph.focusNode(node.id);},120);
      }
    });
  });

  if(authenticated()){
    [
      ["cmd:session","Comando","🎬","Modo Sessão","Abrir mesa de condução",function(){loadAdmin().then(function(){if(app().sessionMode)app().sessionMode.open();});}],
      ["cmd:master","Comando","🎲","Sala do Mestre","Objetivos, pistas e NPCs",function(){loadAdmin().then(function(){if(app().masterQuick)app().masterQuick.open();});}],
      ["cmd:new-session","Comando","📓","Registrar sessão","Abrir Diário da Campanha",function(){loadAdmin().then(function(){if(app().sessionEditor)app().sessionEditor.open("");});}],
      ["cmd:backup","Comando","🧳","Backup e Exportação","Exportar campanha e cofre criptografado",function(){loadAdmin().then(function(){if(app().backupExport)app().backupExport.open();});}],
      ["cmd:admin","Comando","⚙️","Administração","Abrir painel administrativo",function(){loadAdmin().then(function(){if(app().adminPanel)app().adminPanel.open();});}]
    ].forEach(function(cmd){
      push(rows,{id:cmd[0],type:cmd[1],icon:cmd[2],label:cmd[3],subtitle:cmd[4],action:cmd[5],master:true});
    });
  }

  return rows;
}
function privateIndex(){
  if(!authenticated())return [];
  var pc=app().privateContent;
  if(!pc||!pc.isLoaded||!pc.isLoaded())return [];
  var master=pc.getMasterState?pc.getMasterState():{};
  var rows=[];
  [
    ["notes","Nota Mestre","📝","notes"],
    ["goals","Objetivo Mestre","🎯","goals"],
    ["clues","Pista Mestre","🧩","clues"],
    ["revelations","Revelação Mestre","🔮","revelations"],
    ["npcStates","NPC Mestre","👤","npcStates"]
  ].forEach(function(def){
    (Array.isArray(master[def[0]])?master[def[0]]:[]).forEach(function(item){
      var label=def[0]==="npcStates"?(item.name||"NPC"):(item.title||def[1]);
      push(rows,{
        id:"master:"+def[0]+":"+(item.id||label),type:def[1],icon:def[2],label:label,
        subtitle:item.status||item.location||item.owner||"Conteúdo privado",
        keywords:item,master:true,
        action:function(){
          loadAdmin().then(function(){
            if(app().masterWorkspace&&app().masterWorkspace.open)app().masterWorkspace.open(def[3]);
          });
        }
      });
    });
  });
  return rows;
}
async function loadAdmin(){
  var loader=app().adminLoader;
  if(loader&&loader.load)await loader.load();
  var pc=app().privateContent;
  if(authenticated()&&pc&&pc.load&&!pc.isLoaded())await pc.load();
  masterLoaded=!!(pc&&pc.isLoaded&&pc.isLoaded());
}
async function ensurePrivate(){
  if(!authenticated()||masterLoaded)return;
  try{await loadAdmin();}catch(error){console.warn("Terra Z command palette private index:",error);}
}
function rank(row,query){
  if(!query)return row.type==="Comando"?120:20;
  var label=normalize(row.label),subtitle=normalize(row.subtitle),hay=row.search;
  if(label===query)return 300;
  if(label.startsWith(query))return 240;
  if(label.includes(query))return 190;
  if(subtitle.includes(query))return 120;
  if(hay.includes(query))return 80;
  var parts=query.split(/\s+/).filter(Boolean);
  if(parts.length&&parts.every(function(part){return hay.includes(part);}))return 70;
  return 0;
}
function results(query){
  var q=normalize(query);
  var rows=publicIndex().concat(privateIndex());
  return rows.map(function(row){return {row:row,score:rank(row,q)};})
    .filter(function(x){return x.score>0;})
    .sort(function(a,b){return b.score-a.score||a.row.label.localeCompare(b.row.label,"pt-BR");})
    .slice(0,40).map(function(x){return x.row;});
}
function render(){
  var root=el("commandPaletteResults"),input=el("commandPaletteInput");
  if(!root||!input)return;
  lastQuery=input.value;
  current=results(lastQuery);
  if(selected>=current.length)selected=0;

  var info=el("commandPaletteInfo");
  if(info)info.textContent=current.length+(current.length===1?" resultado":" resultados")+(authenticated()?" · Mestre incluído":"");

  if(!current.length){
    root.innerHTML='<div class="command-palette-empty">Nenhum resultado. Tente personagem, cidade, sessão, pista ou local.</div>';
    return;
  }

  root.innerHTML=current.map(function(row,index){
    return '<button type="button" class="command-palette-result'+(index===selected?" selected":"")+'" data-command-index="'+index+'">'+
      '<span class="command-palette-icon">'+escapeHtml(row.icon||"•")+'</span>'+
      '<span class="command-palette-copy"><strong>'+escapeHtml(row.label)+'</strong><small>'+escapeHtml(row.type)+(row.subtitle?" · "+escapeHtml(row.subtitle):"")+'</small></span>'+
      (row.master?'<span class="command-palette-private">MESTRE</span>':"")+
      '<span class="command-palette-enter">↵</span></button>';
  }).join("");

  root.querySelectorAll("[data-command-index]").forEach(function(button){
    button.addEventListener("mouseenter",function(){selected=Number(button.dataset.commandIndex)||0;renderSelection();});
    button.addEventListener("click",function(){selected=Number(button.dataset.commandIndex)||0;activate();});
  });
}
function renderSelection(){
  var root=el("commandPaletteResults");if(!root)return;
  root.querySelectorAll("[data-command-index]").forEach(function(node,index){
    node.classList.toggle("selected",index===selected);
  });
}
function activate(){
  var row=current[selected];if(!row)return;
  close();
  if(typeof row.action==="function"){row.action();return;}
  var r=app().router;
  if(row.route&&r&&r.go)r.go(row.route);
}
async function open(prefill){
  var panel=el("commandPalette"),input=el("commandPaletteInput");
  if(!panel||!input)return;
  panel.classList.add("show");document.body.classList.add("command-palette-open");
  input.value=prefill||"";selected=0;
  if(authenticated())await ensurePrivate();
  render();
  setTimeout(function(){input.focus();input.select();},0);
}
function close(){
  var panel=el("commandPalette");if(panel)panel.classList.remove("show");
  document.body.classList.remove("command-palette-open");
}
function setup(){
  var input=el("commandPaletteInput"),button=el("commandPaletteBtn"),closeBtn=el("commandPaletteClose"),panel=el("commandPalette");
  if(button)button.addEventListener("click",function(){open("");});
  if(closeBtn)closeBtn.addEventListener("click",close);
  if(input){
    input.addEventListener("input",function(){selected=0;render();});
    input.addEventListener("keydown",function(event){
      if(event.key==="ArrowDown"){event.preventDefault();selected=Math.min(current.length-1,selected+1);renderSelection();}
      else if(event.key==="ArrowUp"){event.preventDefault();selected=Math.max(0,selected-1);renderSelection();}
      else if(event.key==="Enter"){event.preventDefault();activate();}
      else if(event.key==="Escape"){event.preventDefault();close();}
    });
  }
  if(panel)panel.addEventListener("click",function(event){if(event.target===panel)close();});
  document.addEventListener("keydown",function(event){
    if((event.ctrlKey||event.metaKey)&&String(event.key).toLowerCase()==="k"){
      event.preventDefault();
      var shown=panel&&panel.classList.contains("show");
      if(shown)close();else open("");
    }
  });
  ["terra-z:runtime-data-loaded","terra-z:characters-rendered","terra-z:sessions-rendered","terra-z:private-content-loaded","terra-z:auth-changed"].forEach(function(name){
    document.addEventListener(name,function(){masterLoaded=false;if(panel&&panel.classList.contains("show"))render();});
  });
}
setup();
window.TerraZApp.commandPalette={open:open,close:close,refresh:render,results:function(q){return results(q);}};
})();