(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/character-editor.js');

var showToast = core.showToast;
var escapeAttr = core.escapeAttr;

var currentName = '';
var createMode = false;
var privateLoaded = false;

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }

function setStatus(message,state){
  var node = el('characterEditorStatus');
  if(!node) return;
  node.textContent = message || '';
  node.setAttribute('data-state',state || 'idle');
}

function sectionHtml(section,index){
  section = section || {};
  return '<div class="character-editor-section" data-character-section="' + index + '">' +
    '<div class="character-editor-section-head">' +
      '<input class="character-section-title" type="text" maxlength="160" value="' + escapeAttr(section.title || '') + '" placeholder="Título da seção">' +
      '<button type="button" class="character-section-remove" title="Remover seção">🗑</button>' +
    '</div>' +
    '<div class="character-section-content" contenteditable="true" spellcheck="true">' + (section.content || '') + '</div>' +
  '</div>';
}

function defaultSections(){
  return [
    {title:'📋 Ficha Básica',content:'<p><strong>Nome:</strong> <br><strong>Codinome:</strong> <br><strong>Idade:</strong> <br><strong>Local:</strong> </p>'},
    {title:'📖 História',content:'<p>Escreva aqui a história do personagem.</p>'},
    {title:'🎯 Personalidade',content:'<p>Descreva a personalidade do personagem.</p>'},
    {title:'⚔️ Habilidades',content:'<ul><li>Adicione uma habilidade.</li></ul>'},
    {title:'🔗 Relações',content:'<ul><li>Adicione uma relação importante.</li></ul>'}
  ];
}

function renderSections(sections){
  var root = el('characterEditorSections');
  if(!root) return;
  root.innerHTML = (sections || []).map(sectionHtml).join('');
}

function addSection(){
  var root = el('characterEditorSections');
  if(!root) return;
  var index = root.querySelectorAll('[data-character-section]').length;
  root.insertAdjacentHTML('beforeend',sectionHtml({title:'Nova seção',content:'<p>Conteúdo da seção.</p>'},index));
  var items = root.querySelectorAll('[data-character-section]');
  var latest = items[items.length-1];
  if(latest){
    var input = latest.querySelector('.character-section-title');
    if(input){ input.focus(); input.select(); }
  }
}

function collectSections(){
  var root = el('characterEditorSections');
  if(!root) return [];
  return Array.from(root.querySelectorAll('[data-character-section]')).map(function(row){
    var title = row.querySelector('.character-section-title');
    var content = row.querySelector('.character-section-content');
    return {
      title:title ? title.value.trim() : '',
      content:content ? content.innerHTML.trim() : ''
    };
  }).filter(function(section){ return section.title || section.content; });
}

function splitSecrets(value){
  return String(value || '').split(/\r?\n/).map(function(v){ return v.trim(); }).filter(Boolean);
}

function refreshCreateButton(){
  var btn = el('addCharacterBtn');
  if(!btn) return;
  var b = backend();
  var ready = !!(b && b.isConfigured && b.isConfigured() && b.isAuthenticated && b.isAuthenticated());
  btn.disabled = !ready;
  btn.title = ready ? 'Criar novo personagem ou NPC' : 'Entre como editor em Publicar para criar personagens';
}

function setCreateFieldsVisible(visible){
  var fields = el('characterEditorCardFields');
  if(fields) fields.hidden = !visible;
}

function setCreateDependentButtons(disabled){
  var portrait = el('characterEditorPortraitBtn');
  var graph = el('characterEditorGraphBtn');

  if(portrait){
    portrait.disabled = disabled;
    portrait.title = disabled ? 'Salve o personagem primeiro para adicionar retrato' : 'Trocar retrato';
  }
  if(graph){
    graph.disabled = disabled;
    graph.title = disabled ? 'Salve o personagem primeiro para adicionar relações no grafo' : 'Relações / Grafo';
  }
}

function preparePanel(){
  var panel = el('characterEditorPanel');
  if(panel) panel.classList.add('show');
  document.body.style.overflow = 'hidden';
}

async function loadExistingSecrets(name){
  privateLoaded = false;
  var secretsField = el('characterEditorSecrets');
  secretsField.value = '';
  secretsField.disabled = true;
  secretsField.placeholder = 'Carregando conteúdo privado…';
  setStatus('Carregando conteúdo privado…','working');

  try {
    var privateApi = window.TerraZApp.privateContent;
    var privateData = privateApi && privateApi.load ? await privateApi.load() : null;
    if(privateData){
      var secrets = privateApi.getCharacterSecrets ? privateApi.getCharacterSecrets(name) : null;
      secretsField.value = Array.isArray(secrets) ? secrets.join('\n') : '';
      secretsField.disabled = false;
      secretsField.placeholder = 'Um segredo por linha';
      privateLoaded = true;
      setStatus('Ficha pública e conteúdo Mestre carregados.','ready');
    } else {
      secretsField.disabled = true;
      secretsField.placeholder = 'Conteúdo privado indisponível; os segredos atuais serão preservados.';
      setStatus('Conteúdo Mestre indisponível. Você ainda pode editar os dados públicos; os segredos serão preservados.','warning');
    }
  } catch(error){
    console.error(error);
    setStatus('Não foi possível carregar os segredos. Os dados públicos ainda podem ser editados.','warning');
  }
}

async function open(name){
  var b = backend();
  if(!b || !b.isConfigured() || !b.isAuthenticated()){
    showToast('Entre como editor para editar personagens.','warning',5000);
    if(window.TerraZApp.publishing) window.TerraZApp.publishing.open();
    return;
  }

  var manager = window.TerraZApp.characters;
  var ficha = manager && manager.get ? manager.get(name) : null;
  if(!ficha){
    showToast('Ficha não encontrada para: ' + name,'error');
    return;
  }

  createMode = false;
  currentName = name;

  var nameField = el('characterEditorName');
  nameField.readOnly = true;
  nameField.value = name;

  el('characterEditorEyebrow').value = ficha.eyebrow || '';
  renderSections(Array.isArray(ficha.sections) ? ficha.sections : []);

  var isCreated = !!(manager && manager.isCreated && manager.isCreated(name));
  setCreateFieldsVisible(isCreated);
  if(isCreated){
    var card = manager.card ? (manager.card(name) || {}) : {};
    el('characterEditorIcon').value = card.icon || '👤';
    el('characterEditorCardSummary').value = card.summary || '';
  }

  setCreateDependentButtons(false);

  var title = el('characterEditorTitle');
  if(title) title.textContent = '✏️ Editar personagem';
  var saveBtn = el('characterEditorSave');
  if(saveBtn) saveBtn.textContent = '💾 Salvar personagem';

  preparePanel();
  await loadExistingSecrets(name);
}

function openCreate(){
  var b = backend();
  if(!b || !b.isConfigured() || !b.isAuthenticated()){
    showToast('Entre como editor para criar personagens.','warning',5000);
    if(window.TerraZApp.publishing) window.TerraZApp.publishing.open();
    return;
  }

  createMode = true;
  currentName = '';
  privateLoaded = true;

  var nameField = el('characterEditorName');
  nameField.readOnly = false;
  nameField.value = '';
  nameField.placeholder = 'Nome completo ou codinome';

  el('characterEditorEyebrow').value = '';
  el('characterEditorIcon').value = '👤';
  el('characterEditorCardSummary').value = '';
  el('characterEditorSecrets').value = '';
  el('characterEditorSecrets').disabled = false;
  el('characterEditorSecrets').placeholder = 'Um segredo por linha';

  renderSections(defaultSections());
  setCreateFieldsVisible(true);
  setCreateDependentButtons(true);

  var title = el('characterEditorTitle');
  if(title) title.textContent = '＋ Novo personagem';
  var saveBtn = el('characterEditorSave');
  if(saveBtn) saveBtn.textContent = '＋ Criar personagem';

  setStatus('Preencha a ficha. O retrato e o grafo poderão ser adicionados após o primeiro salvamento.','ready');
  preparePanel();

  setTimeout(function(){ nameField.focus(); },50);
}

function close(){
  currentName = '';
  createMode = false;
  privateLoaded = false;

  var nameField = el('characterEditorName');
  if(nameField){
    nameField.readOnly = true;
    nameField.placeholder = '';
  }

  setCreateFieldsVisible(false);
  setCreateDependentButtons(false);

  var panel = el('characterEditorPanel');
  if(panel) panel.classList.remove('show');
  document.body.style.overflow = '';
}

async function save(){
  var b = backend();
  if(!b || !b.isAuthenticated()){
    close();
    showToast('Sua sessão de editor expirou.','warning');
    return;
  }

  var name = createMode ? el('characterEditorName').value.trim() : currentName;
  if(!name){
    setStatus('Informe o nome do personagem.','error');
    el('characterEditorName').focus();
    return;
  }

  var sections = collectSections();
  if(!sections.length){
    setStatus('A ficha precisa ter ao menos uma seção.','error');
    return;
  }

  var button = el('characterEditorSave');
  button.disabled = true;
  button.textContent = createMode ? 'Criando…' : 'Salvando…';
  setStatus(createMode ? 'Criando personagem no Terra Z…' : 'Publicando ficha no Terra Z…','working');

  try {
    var payload = {
      name:name,
      create:createMode,
      eyebrow:el('characterEditorEyebrow').value.trim(),
      sections:sections
    };

    var manager = window.TerraZApp.characters;
    var hasCard = createMode || !!(manager && manager.isCreated && manager.isCreated(name));
    if(hasCard){
      payload.card = {
        icon:el('characterEditorIcon').value.trim() || '👤',
        summary:el('characterEditorCardSummary').value.trim()
      };
    }

    if(privateLoaded){
      payload.secrets = splitSecrets(el('characterEditorSecrets').value);
    }

    var result = await b.request('/api/character',{
      method:'POST',
      body:{character:payload}
    });

    setStatus('Commit criado. Aguardando GitHub Pages…','working');

    if(window.TerraZApp.publishing && result.status_url){
      var published = await window.TerraZApp.publishing.waitForDeployment(result.status_url);
      if(published){
        setStatus(createMode ? 'Personagem criado com sucesso.' : 'Personagem atualizado com sucesso.','success');
        showToast(createMode ? (name + ' foi adicionado ao Terra Z.') : ('Ficha de ' + name + ' atualizada.'),'success',5000);
        setTimeout(function(){ location.reload(); },900);
        return;
      }
    }

    setStatus('Commit criado; o deploy ainda está processando.','working');
    showToast('Alterações enviadas. O deploy ainda está processando.','info',5000);
  } catch(error){
    console.error('Terra Z character editor:',error);
    setStatus(error.message || (createMode ? 'Falha ao criar personagem.' : 'Falha ao atualizar personagem.'),'error');
    showToast(error.message || 'Falha ao salvar personagem.','error',6000);
  } finally {
    button.disabled = false;
    button.textContent = createMode ? '＋ Criar personagem' : '💾 Salvar personagem';
  }
}

function openPortrait(){
  if(createMode){
    showToast('Salve o personagem antes de adicionar o retrato.','info',4000);
    return;
  }
  if(currentName && window.TerraZApp.mediaManager){
    window.TerraZApp.mediaManager.choose(currentName);
  }
}

function openGraph(){
  if(createMode){
    showToast('Salve o personagem antes de adicioná-lo ao grafo.','info',4000);
    return;
  }
  close();
  if(window.TerraZApp.graph && window.TerraZApp.graph.openEditor){
    window.TerraZApp.graph.openEditor();
  }
}

function setup(){
  var panel = el('characterEditorPanel');
  var sections = el('characterEditorSections');

  if(el('addCharacterBtn')) el('addCharacterBtn').addEventListener('click',openCreate);
  if(el('characterEditorClose')) el('characterEditorClose').addEventListener('click',close);
  if(el('characterEditorCancel')) el('characterEditorCancel').addEventListener('click',close);
  if(el('characterEditorSave')) el('characterEditorSave').addEventListener('click',save);
  if(el('characterEditorAddSection')) el('characterEditorAddSection').addEventListener('click',addSection);
  if(el('characterEditorPortraitBtn')) el('characterEditorPortraitBtn').addEventListener('click',openPortrait);
  if(el('characterEditorGraphBtn')) el('characterEditorGraphBtn').addEventListener('click',openGraph);

  if(sections){
    sections.addEventListener('click',function(event){
      var btn = event.target.closest('.character-section-remove');
      if(!btn) return;
      var row = btn.closest('[data-character-section]');
      if(row) row.remove();
    });
  }

  if(panel){
    panel.addEventListener('click',function(event){
      if(event.target === panel) close();
    });
  }

  document.addEventListener('terra-z:auth-changed',function(){
    refreshCreateButton();
    var b = backend();
    if(!b || !b.isAuthenticated()) close();
  });

  refreshCreateButton();
}

setup();

window.TerraZApp.characterEditor = {
  open:open,
  openCreate:openCreate,
  close:close,
  save:save
};

})();