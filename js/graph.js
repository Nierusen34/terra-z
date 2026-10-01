(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/graph.js');

var showToast = core.showToast;
var showConfirm = core.showConfirm;
var escapeHtml = core.escapeHtml;
var escapeAttr = core.escapeAttr;

/* ===== GRAFO DE RELAÇÕES ===== */
var GRAPH_KEY = 'terraZ_graph_v2';
var GRAPH_BACKUP_KEY = 'terraZ_graph_backup_v2';
var defaultGraph = (window.TerraZData && window.TerraZData.defaultGraph) || { quadrants:[], nodes:[], edges:[] };
var publishedGraph = (window.TerraZData && window.TerraZData.graphOverride) || null;
if(!window.TerraZData || !window.TerraZData.defaultGraph){
  console.error('Terra Z: data/relations.js não foi carregado.');
}

var graphData = null;
var graphRelationFilter = 'all';
var visibilityCapability = null;
var graphCharacterMap = {
  oliver:'Oliver Queen',
  dinah:'Dinah Lance',
  tristan:'Tristan Queen',
  connor:'Connor Hawke',
  bruce:'Bruce Wayne',
  damian:'Damian Wayne',
  jason:'Jason Todd',
  dick:'Dick Grayson',
  tim:'Tim Drake',
  mgann:"M'gann M'orzz",
  conner2:'Conner Kent',
  mark:"M'ark",
  jonn:"J'onn J'onzz",
  lobo:'Lobo',
  riot:'Riot',
  kendra:'Kendra Saunders'
};
function normalizeVisibility(value){
  var raw=String(value || 'public');
  if(raw === 'master' || raw === 'private') return 'master';
  if(raw === 'spoiler' || raw === 'rumor' || raw === 'restricted') return 'spoiler';
  return 'public';
}

function privateGraph(){
  var api=window.TerraZApp && window.TerraZApp.privateContent;
  return api && api.getPrivateGraph ? api.getPrivateGraph() : {nodes:[],edges:[]};
}

function normalizeGraphVisibility(graph){
  graph=graph || {quadrants:[],nodes:[],edges:[]};
  graph.nodes=(Array.isArray(graph.nodes) ? graph.nodes : []).map(function(node){
    return {...node,visibility:normalizeVisibility(node.visibility)};
  });
  graph.edges=(Array.isArray(graph.edges) ? graph.edges : []).map(function(edge){
    return {...edge,visibility:normalizeVisibility(edge.visibility)};
  });
  return graph;
}

function mergePrivateGraph(base){
  var graph=normalizeGraphVisibility(JSON.parse(JSON.stringify(base || {quadrants:[],nodes:[],edges:[]})));
  var secure=privateGraph();
  var nodeIds=new Set(graph.nodes.map(function(node){ return node.id; }));
  (secure.nodes || []).forEach(function(node){
    if(!nodeIds.has(node.id)){
      graph.nodes.push({...node,visibility:'master'});
      nodeIds.add(node.id);
    }
  });
  (secure.edges || []).forEach(function(edge){
    graph.edges.push({...edge,visibility:'master'});
  });
  return graph;
}

function publicGraphSnapshot(graph){
  graph=normalizeGraphVisibility(JSON.parse(JSON.stringify(graph || {quadrants:[],nodes:[],edges:[]})));
  var masterNodes=new Set(graph.nodes.filter(function(node){ return node.visibility === 'master'; }).map(function(node){ return node.id; }));
  return {
    quadrants:graph.quadrants || [],
    nodes:graph.nodes.filter(function(node){ return node.visibility !== 'master'; }),
    edges:graph.edges.filter(function(edge){
      return edge.visibility !== 'master' && !masterNodes.has(edge.from) && !masterNodes.has(edge.to);
    })
  };
}

function loadGraph(){
  var base=publishedGraph && Array.isArray(publishedGraph.nodes) ? publishedGraph : defaultGraph;
  if(!publishedGraph){
    try {
      var saved=localStorage.getItem(GRAPH_KEY);
      if(saved) base=JSON.parse(saved);
    } catch(e){ console.error(e); }
  }
  return mergePrivateGraph(base);
}

function saveGraph(){
  try {
    var publicOnly=publicGraphSnapshot(graphData);
    localStorage.setItem(GRAPH_BACKUP_KEY,localStorage.getItem(GRAPH_KEY) || JSON.stringify(publicOnly));
    localStorage.setItem(GRAPH_KEY,JSON.stringify(publicOnly));
  } catch(e){ console.error(e); }
}

async function supportsVisibilitySystem(){
  if(visibilityCapability !== null) return visibilityCapability;
  var b=window.TerraZApp && window.TerraZApp.backend;
  if(!b || !b.health) return false;

  try{
    var health=await b.health();
    visibilityCapability=!!(
      health &&
      health.visibility_system === 'public-spoiler-master' &&
      health.secure_master_relations === true
    );
  }catch(error){
    visibilityCapability=false;
  }
  return visibilityCapability;
}

function graphUsesAdvancedVisibility(){
  return (graphData.nodes || []).some(function(node){
    return normalizeVisibility(node.visibility) !== 'public';
  }) || (graphData.edges || []).some(function(edge){
    return normalizeVisibility(edge.visibility) !== 'public';
  });
}

function edgeColor(type){
  return { family:'#c4186f', ally:'#0064a8', tension:'#cc2222', clone:'#7a4aff' }[type] || '#3a3028';
}

function renderGraph(){
  var svg = document.getElementById('graphSvg');
  if(!svg || !graphData) return;
  var html = '';
  html += '<defs><filter id="glowNode"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  graphData.quadrants.forEach(function(q){
    html += '<rect x="' + q.x + '" y="' + q.y + '" width="' + q.w + '" height="' + q.h + '" rx="8" fill="' + q.bg + '" stroke="' + q.color + '" stroke-width="1.5"/>';
    html += '<text x="' + (q.x + q.w/2) + '" y="' + (q.y + 28) + '" font-family="Oswald,sans-serif" font-size="16" fill="' + q.color + '" text-anchor="middle" letter-spacing="3" font-weight="700">' + escapeHtml(q.title) + '</text>';
  });
  var nodeMap = {};
  graphData.nodes.forEach(function(n){ nodeMap[n.id] = n; });
  graphData.edges.forEach(function(e){
    if(graphRelationFilter !== 'all' && e.type !== graphRelationFilter) return;
    var visibility=window.TerraZApp && window.TerraZApp.visibility;
    if(visibility && visibility.isLevelAllowed && !visibility.isLevelAllowed(normalizeVisibility(e.visibility))) return;
    var a=nodeMap[e.from], b=nodeMap[e.to];
    if(!a || !b) return;
    if(visibility && visibility.isLevelAllowed){
      if(!visibility.isLevelAllowed(normalizeVisibility(a.visibility))) return;
      if(!visibility.isLevelAllowed(normalizeVisibility(b.visibility))) return;
    }
    var stroke = edgeColor(e.type);
    var dash = (e.type === 'tension' || e.type === 'clone') ? ' stroke-dasharray="5,4"' : '';
    html += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="' + stroke + '" stroke-width="2"' + dash + ' opacity="0.75"/>';
    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.sqrt(dx*dx + dy*dy) || 1;
    var offX = -dy / len * 14, offY = dx / len * 14;
    html += '<text x="' + (mx + offX) + '" y="' + (my + offY) + '" font-family="Share Tech Mono,monospace" font-size="9" fill="' + stroke + '" text-anchor="middle" style="paint-order:stroke;stroke:var(--paper3);stroke-width:4px;stroke-linejoin:round">' + escapeHtml(e.label) + '</text>';
  });
  graphData.nodes.forEach(function(n){
    var visibility=window.TerraZApp && window.TerraZApp.visibility;
    if(visibility && visibility.isLevelAllowed && !visibility.isLevelAllowed(normalizeVisibility(n.visibility))) return;
    var character = graphCharacterMap[n.id] || '';
    var manager = window.TerraZApp && window.TerraZApp.characters;
    var hasActiveFicha = !!(character && manager && manager.get && manager.get(character));
    var cls = hasActiveFicha ? 'graph-node graph-node-clickable' : 'graph-node';
    html += '<g class="' + cls + '" data-node-id="' + escapeAttr(n.id) + '" data-character="' + escapeAttr(hasActiveFicha ? character : '') + '">';
    html += '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + n.r + '" fill="' + n.color + '" stroke="#fff" stroke-width="3" filter="url(#glowNode)"/>';
    html += '<text x="' + n.x + '" y="' + (n.y + Math.round(n.r * 0.13)) + '" font-family="Oswald,sans-serif" font-size="' + Math.max(10, Math.round(n.r * 0.37)) + '" fill="#fff" text-anchor="middle" font-weight="700">' + escapeHtml(n.label) + '</text>';
    html += '</g>';
  });
  svg.innerHTML = html;

  svg.querySelectorAll('.graph-node-clickable').forEach(function(node){
    node.addEventListener('click', function(){
      var name = node.getAttribute('data-character');
      if(name && window.TerraZApp.characters) window.TerraZApp.characters.open(name);
    });
  });
}

function openGraphEditor(){
  var modal = document.getElementById('graphEditorModal');
  if(!modal) return;
  renderGraphEditorForm();
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeGraphEditor(){ document.getElementById('graphEditorModal').classList.remove('show'); document.body.style.overflow = ''; }
function cancelGraphEditor(){ closeGraphEditor(); }

function renderGraphEditorForm(){
  var nodesBody = document.getElementById('geNodesBody');
  var edgesBody = document.getElementById('geEdgesBody');
  if(!nodesBody || !edgesBody) return;

  var html = '';
  graphData.nodes.forEach(function(n, i){
    html += '<tr data-index="' + i + '">';
    html += '<td><input type="text" value="' + escapeAttr(n.id) + '" data-graph-kind="node" data-index="' + i + '" data-field="id"></td>';
    html += '<td><input type="text" value="' + escapeAttr(n.label) + '" data-graph-kind="node" data-index="' + i + '" data-field="label"></td>';
    html += '<td><input type="number" value="' + n.x + '" data-graph-kind="node" data-index="' + i + '" data-field="x" data-value-type="number"></td>';
    html += '<td><input type="number" value="' + n.y + '" data-graph-kind="node" data-index="' + i + '" data-field="y" data-value-type="number"></td>';
    html += '<td><input type="number" value="' + n.r + '" data-graph-kind="node" data-index="' + i + '" data-field="r" data-value-type="number"></td>';
    html += '<td><input type="color" value="' + escapeAttr(n.color) + '" data-graph-kind="node" data-index="' + i + '" data-field="color"></td>';
    html += '<td><select data-graph-kind="node" data-index="' + i + '" data-field="visibility">';
    ['public','spoiler','master'].forEach(function(level){
      var label=level === 'public' ? '🌐 Público' : (level === 'spoiler' ? '⚠️ Spoiler' : '🔒 Mestre');
      html += '<option value="' + level + '"' + (normalizeVisibility(n.visibility) === level ? ' selected' : '') + '>' + label + '</option>';
    });
    html += '</select></td>';
    html += '<td><button class="ge-btn-remove" data-graph-action="remove-node" data-index="' + i + '">🗑</button></td></tr>';
  });
  nodesBody.innerHTML = html;

  function nodeOptions(selectedId){
    return graphData.nodes.map(function(n){
      return '<option value="' + escapeAttr(n.id) + '"' + (n.id === selectedId ? ' selected' : '') + '>' + escapeHtml(n.label) + '</option>';
    }).join('');
  }

  var htmlE = '';
  graphData.edges.forEach(function(e, i){
    htmlE += '<tr data-index="' + i + '">';
    htmlE += '<td><select data-graph-kind="edge" data-index="' + i + '" data-field="from">' + nodeOptions(e.from) + '</select></td>';
    htmlE += '<td><select data-graph-kind="edge" data-index="' + i + '" data-field="to">' + nodeOptions(e.to) + '</select></td>';
    htmlE += '<td><input type="text" value="' + escapeAttr(e.label) + '" data-graph-kind="edge" data-index="' + i + '" data-field="label"></td>';
    htmlE += '<td><select data-graph-kind="edge" data-index="' + i + '" data-field="type">';
    ['family','ally','tension','clone'].forEach(function(t){
      htmlE += '<option value="' + t + '"' + (e.type === t ? ' selected' : '') + '>' + t + '</option>';
    });
    htmlE += '</select></td>';
    htmlE += '<td><select data-graph-kind="edge" data-index="' + i + '" data-field="visibility">';
    ['public','spoiler','master'].forEach(function(level){
      var label=level === 'public' ? '🌐 Público' : (level === 'spoiler' ? '⚠️ Spoiler' : '🔒 Mestre');
      htmlE += '<option value="' + level + '"' + (normalizeVisibility(e.visibility) === level ? ' selected' : '') + '>' + label + '</option>';
    });
    htmlE += '</select></td>';
    htmlE += '<td><button class="ge-btn-remove" data-graph-action="remove-edge" data-index="' + i + '">🗑</button></td></tr>';
  });
  edgesBody.innerHTML = htmlE;
}

function updateGraphNode(index, field, value){ if(graphData.nodes[index]) graphData.nodes[index][field] = value; }
function updateGraphEdge(index, field, value){ if(graphData.edges[index]) graphData.edges[index][field] = value; }
function addGraphNode(){
  var id = 'novo_' + Date.now();
  graphData.nodes.push({ id:id, label:'NOVO', x:500, y:400, color:'#3a3028', r:34, visibility:'public' });
  renderGraphEditorForm();
}
function removeGraphNode(index){
  var node = graphData.nodes[index];
  if(!node) return;
  if(!confirm('Remover o nó "' + node.label + '"? As conexões dele também serão removidas.')) return;
  graphData.nodes.splice(index, 1);
  graphData.edges = graphData.edges.filter(function(e){ return e.from !== node.id && e.to !== node.id; });
  renderGraphEditorForm();
}
function addGraphEdge(){
  if(graphData.nodes.length < 2){ showToast('Adicione pelo menos 2 nós antes.', 'warning'); return; }
  graphData.edges.push({ from:graphData.nodes[0].id, to:graphData.nodes[1].id, type:'ally', label:'nova', visibility:'public' });
  renderGraphEditorForm();
}
function removeGraphEdge(index){ graphData.edges.splice(index, 1); renderGraphEditorForm(); }

async function saveGraphEditor(){
  var b = window.TerraZApp && window.TerraZApp.backend;

  if(graphUsesAdvancedVisibility() && !(await supportsVisibilitySystem())){
    showToast(
      'Os níveis Spoiler/Mestre do grafo estão em staging. O salvamento foi bloqueado até o backend consolidado ser publicado.',
      'warning',
      6500
    );
    return;
  }

  saveGraph();
  renderGraph();
  var remote = !!(b && b.isConfigured && b.isConfigured() && b.isAuthenticated && b.isAuthenticated());

  if(!remote){
    closeGraphEditor();
    showToast('Grafo salvo apenas neste navegador. Entre como editor para publicar.','info',5000);
    return;
  }

  var button = document.getElementById('graphSaveBtn');
  if(button){
    button.disabled = true;
    button.textContent = 'Salvando…';
  }

  try {
    var result = await b.request('/api/graph',{
      method:'POST',
      body:{graph:graphData}
    });

    if(result.publicGraph) publishedGraph=JSON.parse(JSON.stringify(result.publicGraph));
    if(result.graph) graphData=normalizeGraphVisibility(JSON.parse(JSON.stringify(result.graph)));

    var privateApi=window.TerraZApp && window.TerraZApp.privateContent;
    if(privateApi && privateApi.reload){
      await privateApi.reload();
      graphData=loadGraph();
    }

    saveGraph();
    renderGraph();
    closeGraphEditor();
    showToast('Grafo salvo. Sincronização estática continua em segundo plano.','success',4500);

    var runtime = window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh) runtime.refresh({force:true,bust:result.sha,silent:true});

    var publishing = window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url){
      publishing.trackDeployment(result.status_url);
    }
  } catch(error){
    console.error('Terra Z graph publish:',error);
    showToast(error.message || 'Falha ao publicar o grafo','error',6000);
  } finally {
    if(button){
      button.disabled = false;
      button.textContent = '💾 Salvar Alterações';
    }
  }
}
function resetGraph(){
  showConfirm('Restaurar Grafo Padrão', 'Isso apagará todas as suas alterações no grafo e restaurará a versão original. Continuar?', function(){
    graphData = JSON.parse(JSON.stringify(defaultGraph));
    saveGraph();
    renderGraph();
    showToast('Grafo restaurado ao padrão', 'info');
  }, 'Restaurar');
}
function restoreGraphFromBackup(){
  try {
    var backup = localStorage.getItem(GRAPH_BACKUP_KEY);
    if(!backup){ showToast('Nenhum backup anterior encontrado', 'warning'); return; }
    graphData = JSON.parse(backup);
    renderGraphEditorForm();
    showToast('Backup carregado no editor. Clique em Salvar para confirmar.', 'info', 4000);
  } catch(e){ showToast('Erro ao restaurar backup', 'error'); }
}

function setupGraphFilters(){
  var select = document.getElementById('graphRelationFilter');
  if(!select) return;
  select.value = graphRelationFilter;
  select.addEventListener('change', function(){
    graphRelationFilter = select.value || 'all';
    renderGraph();
  });
}

function setupGraphEditorEvents(){
  var staticActions = {
    graphOpenBtn: openGraphEditor,
    graphResetBtn: resetGraph,
    graphEditorClose: closeGraphEditor,
    graphAddNodeBtn: addGraphNode,
    graphAddEdgeBtn: addGraphEdge,
    graphCancelBtn: cancelGraphEditor,
    graphRestoreBtn: restoreGraphFromBackup,
    graphSaveBtn: saveGraphEditor
  };

  Object.keys(staticActions).forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.addEventListener('click', staticActions[id]);
  });

  var modal = document.getElementById('graphEditorModal');
  if(modal){
    modal.addEventListener('click', function(e){
      if(e.target === modal) closeGraphEditor();
    });
  }

  function handleFieldChange(e){
    var el = e.target.closest('[data-graph-kind][data-index][data-field]');
    if(!el) return;

    var index = parseInt(el.getAttribute('data-index'), 10);
    var field = el.getAttribute('data-field');
    var kind = el.getAttribute('data-graph-kind');
    var value = el.value;

    if(el.getAttribute('data-value-type') === 'number'){
      value = parseFloat(value);
      if(!Number.isFinite(value)) return;
    }

    if(kind === 'node') updateGraphNode(index, field, value);
    else if(kind === 'edge') updateGraphEdge(index, field, value);
  }

  var nodesBody = document.getElementById('geNodesBody');
  if(nodesBody){
    nodesBody.addEventListener('change', handleFieldChange);
    nodesBody.addEventListener('click', function(e){
      var btn = e.target.closest('[data-graph-action="remove-node"]');
      if(!btn) return;
      removeGraphNode(parseInt(btn.getAttribute('data-index'), 10));
    });
  }

  var edgesBody = document.getElementById('geEdgesBody');
  if(edgesBody){
    edgesBody.addEventListener('change', handleFieldChange);
    edgesBody.addEventListener('click', function(e){
      var btn = e.target.closest('[data-graph-action="remove-edge"]');
      if(!btn) return;
      removeGraphEdge(parseInt(btn.getAttribute('data-index'), 10));
    });
  }
}



function refreshGraphFromSources(){
  var modal=document.getElementById('graphEditorModal');
  var editing=!!(modal && modal.classList.contains('show'));
  if(editing) return;
  graphData=loadGraph();
  saveGraph();
  renderGraph();
}

document.addEventListener('terra-z:runtime-data-loaded',function(){
  publishedGraph=(window.TerraZData && window.TerraZData.graphOverride) || publishedGraph;
  refreshGraphFromSources();
});
document.addEventListener('terra-z:private-content-loaded',refreshGraphFromSources);
document.addEventListener('terra-z:private-content-cleared',refreshGraphFromSources);
document.addEventListener('terra-z:visibility-changed',renderGraph);
document.addEventListener('terra-z:auth-changed',function(){
  visibilityCapability=null;
});

try {
  graphData = loadGraph();
  renderGraph();
  setupGraphFilters();
  setupGraphEditorEvents();
} catch(e){
  console.error('Terra Z graph:', e);
}

window.TerraZApp.graph = {
  render: renderGraph,
  openEditor: openGraphEditor,
  closeEditor: closeGraphEditor,
  reset: resetGraph,
  getData:function(){
    return graphData ? JSON.parse(JSON.stringify(graphData)) : {quadrants:[],nodes:[],edges:[]};
  },
  getCharacterMap:function(){
    return Object.assign({},graphCharacterMap);
  }
};

})();
