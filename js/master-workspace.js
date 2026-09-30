(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/master-workspace.js');

var showToast = core.showToast;
var showConfirm = core.showConfirm;
var escapeHtml = core.escapeHtml;
var escapeAttr = core.escapeAttr;

var activeTab = 'notes';
var editingId = '';
var state = emptyState();

var DEFINITIONS = {
  notes:{
    label:'Notas',
    icon:'📝',
    singular:'Nota',
    empty:'Nenhuma nota privada ainda.'
  },
  revelations:{
    label:'Revelações',
    icon:'🔮',
    singular:'Revelação',
    empty:'Nenhuma revelação futura registrada.'
  },
  goals:{
    label:'Objetivos',
    icon:'🎯',
    singular:'Objetivo',
    empty:'Nenhum objetivo oculto registrado.'
  },
  clues:{
    label:'Pistas',
    icon:'🧩',
    singular:'Pista',
    empty:'Nenhuma pista registrada.'
  },
  npcStates:{
    label:'NPCs',
    icon:'👤',
    singular:'Estado de NPC',
    empty:'Nenhum estado privado de NPC registrado.'
  }
};

var LABELS = {
  revelationStatus:{planned:'Planejada',revealed:'Revelada',discarded:'Descartada'},
  goalStatus:{active:'Ativo',paused:'Pausado',completed:'Concluído',failed:'Falhou'},
  clueTruth:{true:'Verdadeira',false:'Falsa',partial:'Parcial',unknown:'Incerta'},
  clueStatus:{hidden:'Oculta',discovered:'Descoberta',consumed:'Consumida'},
  npcStatus:{active:'Ativo',missing:'Desaparecido',captured:'Capturado',dead:'Morto',unknown:'Desconhecido'}
};

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }
function privateContent(){ return window.TerraZApp && window.TerraZApp.privateContent; }

function emptyState(){
  return {
    version:1,
    notes:[],
    revelations:[],
    goals:[],
    clues:[],
    npcStates:[]
  };
}

function clone(value){
  return JSON.parse(JSON.stringify(value || emptyState()));
}

function normalizeState(value){
  var input = value && typeof value === 'object' ? value : {};
  return {
    version:1,
    notes:Array.isArray(input.notes) ? input.notes : [],
    revelations:Array.isArray(input.revelations) ? input.revelations : [],
    goals:Array.isArray(input.goals) ? input.goals : [],
    clues:Array.isArray(input.clues) ? input.clues : [],
    npcStates:Array.isArray(input.npcStates) ? input.npcStates : []
  };
}

function uid(prefix){
  var random = '';
  if(window.crypto && window.crypto.randomUUID){
    random = window.crypto.randomUUID().replace(/-/g,'').slice(0,12);
  } else {
    random = Math.random().toString(36).slice(2,10);
  }
  return prefix + '-' + Date.now().toString(36) + '-' + random;
}

function splitComma(value){
  return String(value || '').split(',').map(function(item){ return item.trim(); }).filter(Boolean);
}

function joinComma(value){
  return Array.isArray(value) ? value.join(', ') : '';
}

function formatDate(value){
  if(!value) return '';
  var date = new Date(value);
  if(Number.isNaN(date.getTime())) return '';
  try {
    return date.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
  } catch(e){
    return date.toLocaleString('pt-BR');
  }
}

function setStatus(message,stateName){
  var node = el('masterWorkspaceStatus');
  if(!node) return;
  node.textContent = message || '🔒 Privado';
  node.setAttribute('data-state',stateName || 'idle');
}

function authenticated(){
  var b = backend();
  return !!(b && b.isConfigured && b.isConfigured() && b.isAuthenticated && b.isAuthenticated());
}

function updateAccess(){
  var button = el('masterWorkspaceBtn');
  var ready = authenticated();
  if(button) button.hidden = !ready;
  if(!ready) close();
}

function definition(){
  return DEFINITIONS[activeTab] || DEFINITIONS.notes;
}

function renderTabs(){
  var root = el('masterWorkspaceTabs');
  if(!root) return;
  root.innerHTML = '';

  Object.keys(DEFINITIONS).forEach(function(key){
    var def = DEFINITIONS[key];
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'master-workspace-tab' + (key === activeTab ? ' active' : '');
    button.setAttribute('data-master-tab',key);
    button.innerHTML = '<span>' + def.icon + ' ' + escapeHtml(def.label) + '</span><strong>' +
      String((state[key] || []).length) + '</strong>';
    root.appendChild(button);
  });
}

function searchable(item){
  try {
    return JSON.stringify(item).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  } catch(e){
    return '';
  }
}

function cardTitle(item){
  if(activeTab === 'npcStates') return item.name || 'NPC sem nome';
  return item.title || definition().singular + ' sem título';
}

function cardSummary(item){
  if(activeTab === 'npcStates') return item.state || item.intention || item.notes || '';
  return item.body || '';
}

function chipsFor(item){
  var chips = [];

  if(activeTab === 'notes'){
    (item.tags || []).slice(0,5).forEach(function(tag){ chips.push(tag); });
  }

  if(activeTab === 'revelations'){
    chips.push(LABELS.revelationStatus[item.status] || item.status || 'Planejada');
    if(item.trigger) chips.push('Gatilho: ' + item.trigger);
  }

  if(activeTab === 'goals'){
    chips.push(LABELS.goalStatus[item.status] || item.status || 'Ativo');
    if(item.owner) chips.push(item.owner);
  }

  if(activeTab === 'clues'){
    chips.push(LABELS.clueTruth[item.truth] || item.truth || 'Incerta');
    chips.push(LABELS.clueStatus[item.status] || item.status || 'Oculta');
  }

  if(activeTab === 'npcStates'){
    chips.push(LABELS.npcStatus[item.status] || item.status || 'Ativo');
    if(item.location) chips.push(item.location);
  }

  return chips.filter(Boolean);
}

function renderList(){
  var root = el('masterWorkspaceList');
  if(!root) return;

  var term = String(el('masterWorkspaceSearch') ? el('masterWorkspaceSearch').value : '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  var items = (state[activeTab] || []).slice().sort(function(a,b){
    return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
  });

  if(term){
    items = items.filter(function(item){ return searchable(item).indexOf(term) !== -1; });
  }

  if(!items.length){
    root.innerHTML = '<div class="master-workspace-empty">' +
      escapeHtml(term ? 'Nenhum resultado para esta busca.' : definition().empty) +
      '</div>';
    return;
  }

  root.innerHTML = items.map(function(item){
    var summary = cardSummary(item);
    var chips = chipsFor(item);
    var updated = formatDate(item.updatedAt);

    return '<article class="master-item-card" data-master-id="' + escapeAttr(item.id) + '">' +
      '<div class="master-item-head">' +
        '<h4>' + definition().icon + ' ' + escapeHtml(cardTitle(item)) + '</h4>' +
        '<div class="master-item-actions">' +
          '<button type="button" data-master-action="edit">✏️</button>' +
          '<button type="button" data-master-action="delete" class="danger">🗑</button>' +
        '</div>' +
      '</div>' +
      (chips.length ? '<div class="master-item-chips">' +
        chips.slice(0,6).map(function(chip){ return '<span>' + escapeHtml(chip) + '</span>'; }).join('') +
      '</div>' : '') +
      (summary ? '<p>' + escapeHtml(summary.length > 420 ? summary.slice(0,420) + '…' : summary) + '</p>' : '') +
      (updated ? '<div class="master-item-updated">Atualizado ' + escapeHtml(updated) + '</div>' : '') +
    '</article>';
  }).join('');
}

function inputField(id,label,value,placeholder){
  return '<label class="master-field">' +
    '<span>' + escapeHtml(label) + '</span>' +
    '<input id="' + id + '" type="text" value="' + escapeAttr(value || '') + '" placeholder="' + escapeAttr(placeholder || '') + '">' +
  '</label>';
}

function textareaField(id,label,value,placeholder,rows){
  return '<label class="master-field master-field-wide">' +
    '<span>' + escapeHtml(label) + '</span>' +
    '<textarea id="' + id + '" rows="' + String(rows || 6) + '" placeholder="' + escapeAttr(placeholder || '') + '">' +
      escapeHtml(value || '') +
    '</textarea>' +
  '</label>';
}

function selectField(id,label,value,options){
  return '<label class="master-field">' +
    '<span>' + escapeHtml(label) + '</span>' +
    '<select id="' + id + '">' +
      options.map(function(option){
        return '<option value="' + escapeAttr(option[0]) + '"' + (option[0] === value ? ' selected' : '') + '>' +
          escapeHtml(option[1]) +
        '</option>';
      }).join('') +
    '</select>' +
  '</label>';
}

function currentItem(){
  if(!editingId) return null;
  return (state[activeTab] || []).find(function(item){ return item.id === editingId; }) || null;
}

function formHtml(item){
  item = item || {};

  if(activeTab === 'notes'){
    return '<div class="master-fields-grid">' +
      inputField('mwTitle','Título',item.title,'Ex.: O que realmente aconteceu na Fenda') +
      inputField('mwTags','Tags',joinComma(item.tags),'fenda, lobo, sessão 12') +
      textareaField('mwBody','Nota privada',item.body,'Anotações livres do Mestre...',10) +
    '</div>';
  }

  if(activeTab === 'revelations'){
    return '<div class="master-fields-grid">' +
      inputField('mwTitle','Título',item.title,'Ex.: A origem real da Fenda') +
      selectField('mwStatus','Estado',item.status || 'planned',[
        ['planned','Planejada'],['revealed','Revelada'],['discarded','Descartada']
      ]) +
      inputField('mwTrigger','Gatilho / quando revelar',item.trigger,'Ex.: quando Tristan encontrar o arquivo 17') +
      inputField('mwCharacters','Personagens ligados',joinComma(item.characters),'Tristan Queen, Riot') +
      textareaField('mwBody','Revelação',item.body,'O que será revelado e por quê...',9) +
    '</div>';
  }

  if(activeTab === 'goals'){
    return '<div class="master-fields-grid">' +
      inputField('mwTitle','Objetivo',item.title,'Ex.: Recuperar o artefato antes da JLU') +
      inputField('mwOwner','Dono do objetivo',item.owner,'Ex.: Lex Luthor / organização / NPC') +
      selectField('mwStatus','Estado',item.status || 'active',[
        ['active','Ativo'],['paused','Pausado'],['completed','Concluído'],['failed','Falhou']
      ]) +
      inputField('mwCharacters','Personagens envolvidos',joinComma(item.characters),'M\'ark, Kendra Saunders') +
      textareaField('mwBody','Detalhes ocultos',item.body,'Motivação, plano, condição de sucesso...',9) +
    '</div>';
  }

  if(activeTab === 'clues'){
    return '<div class="master-fields-grid">' +
      inputField('mwTitle','Pista',item.title,'Ex.: Fragmento de metal marciano') +
      selectField('mwTruth','Natureza',item.truth || 'unknown',[
        ['true','Verdadeira'],['false','Falsa'],['partial','Parcial'],['unknown','Incerta']
      ]) +
      selectField('mwStatus','Estado',item.status || 'hidden',[
        ['hidden','Oculta'],['discovered','Descoberta'],['consumed','Consumida']
      ]) +
      inputField('mwCharacters','Personagens ligados',joinComma(item.characters),'M\'ark, J\'onn J\'onzz') +
      inputField('mwLocations','Locais ligados',joinComma(item.locations),'A Fenda, Downtown') +
      textareaField('mwBody','Conteúdo da pista',item.body,'O que a pista diz, sugere ou tenta induzir...',9) +
    '</div>';
  }

  return '<div class="master-fields-grid">' +
    inputField('mwName','NPC',item.name,'Ex.: George Gandenzio Toombs') +
    selectField('mwStatus','Estado geral',item.status || 'active',[
      ['active','Ativo'],['missing','Desaparecido'],['captured','Capturado'],['dead','Morto'],['unknown','Desconhecido']
    ]) +
    inputField('mwLocation','Localização atual',item.location,'Ex.: Downtown') +
    textareaField('mwState','Estado atual',item.state,'O que está acontecendo com este NPC agora?',5) +
    textareaField('mwIntention','Intenção / próximo movimento',item.intention,'O que ele pretende fazer em seguida?',5) +
    textareaField('mwNotes','Notas privadas',item.notes,'Informações adicionais...',6) +
  '</div>';
}

function openEditor(id){
  editingId = id || '';
  var item = currentItem();
  var editor = el('masterWorkspaceEditor');
  var fields = el('masterWorkspaceFields');
  var title = el('masterWorkspaceEditorTitle');

  if(title){
    title.textContent = (item ? '✏️ Editar ' : '＋ Novo ') + definition().singular.toLowerCase();
  }
  if(fields) fields.innerHTML = formHtml(item);
  if(editor) editor.hidden = false;

  var body = el('masterWorkspaceBody');
  if(body) body.classList.add('editing');

  setTimeout(function(){
    var first = fields && fields.querySelector('input,textarea,select');
    if(first) first.focus();
  },40);
}

function closeEditor(){
  editingId = '';
  var editor = el('masterWorkspaceEditor');
  if(editor) editor.hidden = true;
  var body = el('masterWorkspaceBody');
  if(body) body.classList.remove('editing');
}

function value(id){
  var node = el(id);
  return node ? String(node.value || '').trim() : '';
}

function itemFromForm(){
  var existing = currentItem() || {};
  var common = {
    id:existing.id || uid(activeTab.replace(/States$/,'')),
    updatedAt:new Date().toISOString()
  };

  if(activeTab === 'notes'){
    return Object.assign(common,{
      title:value('mwTitle'),
      body:value('mwBody'),
      tags:splitComma(value('mwTags'))
    });
  }

  if(activeTab === 'revelations'){
    return Object.assign(common,{
      title:value('mwTitle'),
      body:value('mwBody'),
      trigger:value('mwTrigger'),
      status:value('mwStatus') || 'planned',
      characters:splitComma(value('mwCharacters'))
    });
  }

  if(activeTab === 'goals'){
    return Object.assign(common,{
      title:value('mwTitle'),
      owner:value('mwOwner'),
      body:value('mwBody'),
      status:value('mwStatus') || 'active',
      characters:splitComma(value('mwCharacters'))
    });
  }

  if(activeTab === 'clues'){
    return Object.assign(common,{
      title:value('mwTitle'),
      body:value('mwBody'),
      truth:value('mwTruth') || 'unknown',
      status:value('mwStatus') || 'hidden',
      characters:splitComma(value('mwCharacters')),
      locations:splitComma(value('mwLocations'))
    });
  }

  return Object.assign(common,{
    name:value('mwName'),
    state:value('mwState'),
    location:value('mwLocation'),
    intention:value('mwIntention'),
    status:value('mwStatus') || 'active',
    notes:value('mwNotes')
  });
}

function validItem(item){
  if(activeTab === 'npcStates'){
    if(!item.name){
      showToast('Informe o nome do NPC.','warning');
      return false;
    }
    return true;
  }

  if(!item.title){
    showToast('Informe um título.','warning');
    return false;
  }
  return true;
}

async function persist(nextState,message){
  var b = backend();
  if(!b || !b.isAuthenticated()){
    showToast('Sua sessão de editor expirou.','warning');
    updateAccess();
    return false;
  }

  var saveButton = el('masterWorkspaceEditorSave');
  if(saveButton) saveButton.disabled = true;
  setStatus('Salvando…','working');

  try {
    var result = await b.request('/api/master',{
      method:'POST',
      body:{master:nextState}
    });

    state = normalizeState(result.master);
    var pc = privateContent();
    if(pc && pc.setMasterState) pc.setMasterState(state);

    setStatus('🔒 Privado · Salvo','success');
    renderTabs();
    renderList();
    closeEditor();
    showToast(message || 'Conteúdo Mestre salvo.','success',4200);
    return true;
  } catch(error){
    console.error('Terra Z master workspace:',error);
    setStatus('Erro ao salvar','error');
    showToast(error.message || 'Falha ao salvar conteúdo Mestre.','error',6000);
    return false;
  } finally {
    if(saveButton) saveButton.disabled = false;
  }
}

async function saveEditor(){
  var item = itemFromForm();
  if(!validItem(item)) return;

  var next = clone(state);
  var list = next[activeTab] || [];
  var index = list.findIndex(function(row){ return row.id === item.id; });

  if(index >= 0) list[index] = item;
  else list.push(item);

  next[activeTab] = list;
  await persist(next,definition().singular + ' salva.');
}

function removeItem(id){
  var item = (state[activeTab] || []).find(function(row){ return row.id === id; });
  if(!item) return;

  showConfirm(
    'Excluir ' + definition().singular.toLowerCase(),
    'Excluir "' + cardTitle(item) + '" do conteúdo Mestre privado?',
    function(){
      document.body.style.overflow = 'hidden';
      var next = clone(state);
      next[activeTab] = (next[activeTab] || []).filter(function(row){ return row.id !== id; });
      persist(next,definition().singular + ' excluída.');
    },
    'Excluir'
  );
}

async function loadState(force){
  var pc = privateContent();
  if(!pc) return false;

  setStatus('Carregando…','working');

  try {
    var data = force && pc.reload ? await pc.reload() : await pc.load();
    if(!data){
      setStatus('Conteúdo privado indisponível','error');
      return false;
    }

    state = normalizeState(pc.getMasterState ? pc.getMasterState() : data.master);
    setStatus('🔒 Privado','ready');
    renderTabs();
    renderList();
    return true;
  } catch(error){
    console.error(error);
    setStatus('Falha ao carregar','error');
    showToast('Não foi possível carregar o Conteúdo Mestre.','error',6000);
    return false;
  }
}

async function open(){
  if(!authenticated()){
    showToast('Entre como editor para acessar o Conteúdo Mestre.','warning',5000);
    if(window.TerraZApp.publishing) window.TerraZApp.publishing.open();
    return;
  }

  var panel = el('masterWorkspacePanel');
  if(panel) panel.classList.add('show');
  document.body.style.overflow = 'hidden';
  closeEditor();
  await loadState(false);
}

function close(){
  var panel = el('masterWorkspacePanel');
  if(panel) panel.classList.remove('show');
  closeEditor();
  document.body.style.overflow = '';
}

function setup(){
  var button = el('masterWorkspaceBtn');
  var closeButton = el('masterWorkspaceClose');
  var tabs = el('masterWorkspaceTabs');
  var list = el('masterWorkspaceList');
  var search = el('masterWorkspaceSearch');
  var add = el('masterWorkspaceAdd');
  var editorClose = el('masterWorkspaceEditorClose');
  var editorCancel = el('masterWorkspaceEditorCancel');
  var editorSave = el('masterWorkspaceEditorSave');
  var panel = el('masterWorkspacePanel');

  if(button) button.addEventListener('click',open);
  if(closeButton) closeButton.addEventListener('click',close);
  if(add) add.addEventListener('click',function(){ openEditor(''); });
  if(search) search.addEventListener('input',renderList);
  if(editorClose) editorClose.addEventListener('click',closeEditor);
  if(editorCancel) editorCancel.addEventListener('click',closeEditor);
  if(editorSave) editorSave.addEventListener('click',saveEditor);

  if(tabs){
    tabs.addEventListener('click',function(event){
      var btn = event.target.closest('[data-master-tab]');
      if(!btn) return;
      activeTab = btn.getAttribute('data-master-tab') || 'notes';
      closeEditor();
      if(search) search.value = '';
      renderTabs();
      renderList();
    });
  }

  if(list){
    list.addEventListener('click',function(event){
      var buttonNode = event.target.closest('[data-master-action]');
      if(!buttonNode) return;
      var card = buttonNode.closest('[data-master-id]');
      if(!card) return;
      var id = card.getAttribute('data-master-id');
      var action = buttonNode.getAttribute('data-master-action');
      if(action === 'edit') openEditor(id);
      if(action === 'delete') removeItem(id);
    });
  }

  if(panel){
    panel.addEventListener('click',function(event){
      if(event.target === panel) close();
    });
  }

  document.addEventListener('keydown',function(event){
    if(event.key === 'Escape' && panel && panel.classList.contains('show')){
      if(el('masterWorkspaceEditor') && !el('masterWorkspaceEditor').hidden) closeEditor();
      else close();
    }
  });

  document.addEventListener('terra-z:auth-changed',updateAccess);
  updateAccess();
  renderTabs();
  renderList();
}

setup();

window.TerraZApp.masterWorkspace = {
  open:open,
  close:close,
  reload:function(){ return loadState(true); },
  getState:function(){ return clone(state); }
};

})();