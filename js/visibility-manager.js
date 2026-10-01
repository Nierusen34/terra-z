(function(){
"use strict";

window.TerraZApp=window.TerraZApp || {};
var core=window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/visibility-manager.js');

var escapeHtml=core.escapeHtml;
var escapeAttr=core.escapeAttr;
var levelFilter='all';

function el(id){ return document.getElementById(id); }
function app(){ return window.TerraZApp || {}; }

function normalizeLevel(value){
  var visibility=app().visibility;
  if(visibility && visibility.normalizeLevel) return visibility.normalizeLevel(value);
  var raw=String(value || 'public');
  if(raw === 'master' || raw === 'private') return 'master';
  if(raw === 'spoiler' || raw === 'rumor' || raw === 'restricted') return 'spoiler';
  return 'public';
}

function levelLabel(level){
  if(level === 'master') return '🔒 Mestre';
  if(level === 'spoiler') return '⚠️ Spoiler';
  return '🌐 Público';
}

function typeLabel(type){
  return {
    character:'Personagem',
    section:'Seção de ficha',
    session:'Sessão',
    'graph-node':'Nó do grafo',
    'graph-edge':'Relação'
  }[type] || type;
}

function collect(){
  var rows=[];
  var data=window.TerraZData || {};
  var characters=app().characters;
  var taxonomy=data.characterTaxonomy || {characters:{}};
  var meta=taxonomy.characters || {};
  var names=characters && characters.names ? characters.names() : Object.keys(data.characterOverrides || {});

  names.forEach(function(name){
    var charMeta=meta[name] || {};
    var characterLevel=normalizeLevel(charMeta.visibility);
    rows.push({
      type:'character',
      level:characterLevel,
      title:name,
      detail:characterLevel === 'master' ? 'Ficha inteira protegida pelo cofre.' : 'Visibilidade do card e da ficha.',
      entity:name,
      action:'character'
    });

    var ficha=characters && characters.get ? characters.get(name) : null;
    (ficha && Array.isArray(ficha.sections) ? ficha.sections : []).forEach(function(section,index){
      rows.push({
        type:'section',
        level:normalizeLevel(section && section.visibility),
        title:(section && section.title) || ('Seção '+(index+1)),
        detail:'Ficha de '+name,
        entity:name,
        action:'character'
      });
    });
  });

  var sessions=app().sessions;
  var sessionRows=sessions && sessions.getAll ? sessions.getAll() : (data.sessions || []);
  sessionRows.forEach(function(session){
    if(!session) return;
    rows.push({
      type:'session',
      level:normalizeLevel(session.visibility),
      title:session.title || session.id || 'Sessão',
      detail:session.realDate || session.inWorldDate || '',
      entity:session.id || '',
      action:'session'
    });
  });

  var graph=app().graph;
  var graphData=graph && graph.getData ? graph.getData() : {nodes:[],edges:[]};
  var nodeNames={};
  (graphData.nodes || []).forEach(function(node){
    if(!node) return;
    nodeNames[node.id]=node.label || node.id;
    rows.push({
      type:'graph-node',
      level:normalizeLevel(node.visibility),
      title:node.label || node.id,
      detail:'Nó '+node.id,
      entity:node.id,
      action:'graph'
    });
  });
  (graphData.edges || []).forEach(function(edge){
    if(!edge) return;
    rows.push({
      type:'graph-edge',
      level:normalizeLevel(edge.visibility),
      title:(nodeNames[edge.from] || edge.from)+' ↔ '+(nodeNames[edge.to] || edge.to),
      detail:edge.label || edge.type || 'Relação',
      entity:'',
      action:'graph'
    });
  });

  return rows;
}

function currentRows(){
  var rows=collect();
  var type=el('visibilityManagerType') ? el('visibilityManagerType').value : 'all';
  var term=String(el('visibilityManagerSearch') ? el('visibilityManagerSearch').value : '').trim().toLocaleLowerCase('pt-BR');

  return rows.filter(function(row){
    if(levelFilter !== 'all' && row.level !== levelFilter) return false;
    if(type !== 'all' && row.type !== type) return false;
    if(term && [row.title,row.detail,typeLabel(row.type),levelLabel(row.level)].join(' ').toLocaleLowerCase('pt-BR').indexOf(term) === -1) return false;
    return true;
  });
}

function counts(rows){
  var out={all:rows.length,public:0,spoiler:0,master:0};
  rows.forEach(function(row){ out[row.level]=(out[row.level] || 0)+1; });
  return out;
}

function render(){
  var all=collect();
  var total=counts(all);
  if(el('visibilityManagerAllCount')) el('visibilityManagerAllCount').textContent=String(total.all);
  if(el('visibilityManagerPublicCount')) el('visibilityManagerPublicCount').textContent=String(total.public);
  if(el('visibilityManagerSpoilerCount')) el('visibilityManagerSpoilerCount').textContent=String(total.spoiler);
  if(el('visibilityManagerMasterCount')) el('visibilityManagerMasterCount').textContent=String(total.master);

  var rows=currentRows();
  var root=el('visibilityManagerList');
  if(!root) return;

  if(!rows.length){
    root.innerHTML='<div class="visibility-manager-empty"><strong>Nenhum item neste filtro.</strong><span>Altere o nível, tipo ou busca.</span></div>';
  }else{
    var order={master:0,spoiler:1,public:2};
    rows.sort(function(a,b){
      return order[a.level]-order[b.level] || a.type.localeCompare(b.type,'pt-BR') || a.title.localeCompare(b.title,'pt-BR');
    });

    root.innerHTML=rows.map(function(row){
      return '<article class="visibility-manager-row level-'+escapeAttr(row.level)+'">' +
        '<div class="visibility-manager-row-main">' +
          '<span class="visibility-manager-level">'+levelLabel(row.level)+'</span>' +
          '<span class="visibility-manager-type">'+escapeHtml(typeLabel(row.type))+'</span>' +
          '<strong>'+escapeHtml(row.title)+'</strong>' +
          (row.detail ? '<small>'+escapeHtml(row.detail)+'</small>' : '') +
        '</div>' +
        '<button type="button" data-visibility-action="'+escapeAttr(row.action)+'" data-visibility-entity="'+escapeAttr(row.entity || '')+'">Editar ↗</button>' +
      '</article>';
    }).join('');
  }

  if(el('visibilityManagerStatus')){
    el('visibilityManagerStatus').textContent=
      total.public+' público(s) · '+total.spoiler+' spoiler(s) · '+total.master+' Mestre';
  }

  root.querySelectorAll('[data-visibility-action]').forEach(function(button){
    button.addEventListener('click',function(){
      openEntity(button.getAttribute('data-visibility-action'),button.getAttribute('data-visibility-entity') || '');
    });
  });
}

function openEntity(action,entity){
  close();
  setTimeout(function(){
    if(action === 'character' && app().characterEditor) app().characterEditor.open(entity);
    else if(action === 'session' && app().sessionEditor) app().sessionEditor.open(entity);
    else if(action === 'graph' && app().graph) app().graph.openEditor();
  },50);
}

function setLevel(level){
  levelFilter=level || 'all';
  document.querySelectorAll('[data-visibility-manager-level]').forEach(function(button){
    button.classList.toggle('active',button.getAttribute('data-visibility-manager-level') === levelFilter);
  });
  render();
}

function open(){
  var panel=el('visibilityManagerPanel');
  if(!panel) return;
  levelFilter='all';
  if(el('visibilityManagerType')) el('visibilityManagerType').value='all';
  if(el('visibilityManagerSearch')) el('visibilityManagerSearch').value='';
  document.querySelectorAll('[data-visibility-manager-level]').forEach(function(button){
    button.classList.toggle('active',button.getAttribute('data-visibility-manager-level') === 'all');
  });
  panel.classList.add('show');
  document.body.style.overflow='hidden';
  render();
}

function close(){
  var panel=el('visibilityManagerPanel');
  if(panel) panel.classList.remove('show');
  document.body.style.overflow='';
}

function setup(){
  if(el('visibilityManagerClose')) el('visibilityManagerClose').addEventListener('click',close);
  if(el('visibilityManagerRefresh')) el('visibilityManagerRefresh').addEventListener('click',render);
  if(el('visibilityManagerType')) el('visibilityManagerType').addEventListener('change',render);
  if(el('visibilityManagerSearch')) el('visibilityManagerSearch').addEventListener('input',render);

  document.querySelectorAll('[data-visibility-manager-level]').forEach(function(button){
    button.addEventListener('click',function(){ setLevel(button.getAttribute('data-visibility-manager-level')); });
  });

  var panel=el('visibilityManagerPanel');
  if(panel) panel.addEventListener('click',function(event){ if(event.target === panel) close(); });

  ['terra-z:runtime-data-loaded','terra-z:private-content-loaded','terra-z:private-content-cleared','terra-z:visibility-changed'].forEach(function(eventName){
    document.addEventListener(eventName,function(){
      if(panel && panel.classList.contains('show')) render();
    });
  });
}

setup();

window.TerraZApp.visibilityManager={open:open,close:close,render:render};

})();