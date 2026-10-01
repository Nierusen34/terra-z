(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/character-editor.js');

var showToast = core.showToast;
var showConfirm = core.showConfirm;
var escapeAttr = core.escapeAttr;

var currentName = '';
var createMode = false;
var privateLoaded = false;
var taxonomy = (window.TerraZData && window.TerraZData.characterTaxonomy) || {nuclei:[],types:[],statuses:[],characters:{}};

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }

function definitions(kind){
  return Array.isArray(taxonomy[kind]) ? taxonomy[kind] : [];
}

function metaFor(name){
  var all = taxonomy.characters && typeof taxonomy.characters === 'object' ? taxonomy.characters : {};
  var meta = all[name] || {};
  return {
    featured:meta.featured === true,
    nuclei:Array.isArray(meta.nuclei) ? meta.nuclei.slice() : [],
    type:meta.type || 'other',
    status:meta.status || 'unknown'
  };
}

function fillSelect(id,defs,value){
  var select = el(id);
  if(!select) return;
  select.innerHTML = '';
  defs.forEach(function(item){
    var option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.label;
    select.appendChild(option);
  });
  if(defs.some(function(item){ return item.id === value; })) select.value = value;
  else if(defs[0]) select.value = defs[0].id;
}

function renderEditorNuclei(selected){
  var root = el('characterEditorNuclei');
  if(!root) return;
  var chosen = new Set(Array.isArray(selected) ? selected : []);
  root.innerHTML = '';

  definitions('nuclei').forEach(function(item){
    var label = document.createElement('label');
    label.className = 'character-editor-nucleus-option';

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.value = item.id;
    input.checked = chosen.has(item.id);

    var span = document.createElement('span');
    span.textContent = item.label;

    label.appendChild(input);
    label.appendChild(span);
    root.appendChild(label);
  });
}

function fillOrganization(meta){
  meta = meta || {};
  fillSelect('characterEditorType',definitions('types'),meta.type || 'other');
  fillSelect('characterEditorStatusMeta',definitions('statuses'),meta.status || 'unknown');

  var featured = el('characterEditorFeatured');
  if(featured) featured.checked = meta.featured === true;

  renderEditorNuclei(meta.nuclei || []);
}

function collectOrganization(){
  var nucleiRoot = el('characterEditorNuclei');
  var nuclei = nucleiRoot
    ? Array.from(nucleiRoot.querySelectorAll('input[type="checkbox"]:checked')).map(function(input){ return input.value; })
    : [];

  return {
    featured:!!(el('characterEditorFeatured') && el('characterEditorFeatured').checked),
    nuclei:nuclei,
    type:el('characterEditorType') ? el('characterEditorType').value : 'other',
    status:el('characterEditorStatusMeta') ? el('characterEditorStatusMeta').value : 'unknown'
  };
}

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

function mediaFor(name){
  var all = (window.TerraZData && window.TerraZData.characterMedia) || {};
  return all[name] || {};
}

function syncMediaSourceFields(){
  var provider = el('characterEditorMediaProvider');
  var value = provider ? provider.value : 'none';
  var fandom = value === 'dc-fandom';
  var external = value === 'external-url';

  if(el('characterEditorWikiTitleWrap')) el('characterEditorWikiTitleWrap').hidden = !fandom;
  if(el('characterEditorExternalUrlWrap')) el('characterEditorExternalUrlWrap').hidden = !external;
  if(el('characterEditorExternalPageWrap')) el('characterEditorExternalPageWrap').hidden = !external;
  if(el('characterEditorExternalLabelWrap')) el('characterEditorExternalLabelWrap').hidden = !external;
}

function fillMediaSource(name){
  var panel = el('characterEditorMediaSource');
  if(panel) panel.hidden = !name || createMode;

  var item = name ? mediaFor(name) : {};
  var auto = item.auto || {};
  var provider = auto.provider === 'dc-fandom' || auto.provider === 'external-url'
    ? auto.provider
    : 'none';

  if(el('characterEditorMediaProvider')) el('characterEditorMediaProvider').value = provider;
  if(el('characterEditorWikiTitle')) el('characterEditorWikiTitle').value = auto.wikiTitle || '';
  if(el('characterEditorExternalUrl')) el('characterEditorExternalUrl').value = auto.imageUrl || '';
  if(el('characterEditorExternalPage')) el('characterEditorExternalPage').value = auto.pageUrl || '';
  if(el('characterEditorExternalLabel')) el('characterEditorExternalLabel').value = auto.sourceLabel || '';
  syncMediaSourceFields();
}

async function saveMediaSource(){
  if(createMode || !currentName) return;

  var b = backend();
  if(!b || !b.isAuthenticated()){
    showToast('Entre como editor para alterar a fonte do retrato.','warning',5000);
    return;
  }

  var button = el('characterEditorMediaSaveBtn');
  var provider = el('characterEditorMediaProvider') ? el('characterEditorMediaProvider').value : 'none';
  var body = {
    action:'configure-source',
    character:currentName,
    provider:provider
  };

  if(provider === 'dc-fandom'){
    body.wikiTitle = el('characterEditorWikiTitle') ? el('characterEditorWikiTitle').value.trim() : '';
    if(!body.wikiTitle){
      showToast('Informe a página/versão da DC Database.','warning',4500);
      return;
    }
  } else if(provider === 'external-url'){
    body.imageUrl = el('characterEditorExternalUrl') ? el('characterEditorExternalUrl').value.trim() : '';
    body.pageUrl = el('characterEditorExternalPage') ? el('characterEditorExternalPage').value.trim() : '';
    body.sourceLabel = el('characterEditorExternalLabel') ? el('characterEditorExternalLabel').value.trim() : '';
    if(!body.imageUrl){
      showToast('Informe a URL HTTPS da imagem externa.','warning',4500);
      return;
    }
  }

  if(button){
    button.disabled = true;
    button.textContent = 'Salvando…';
  }

  try{
    var result = await b.request('/api/media',{method:'POST',body:body});

    window.TerraZData = window.TerraZData || {};
    window.TerraZData.characterMedia = window.TerraZData.characterMedia || {};
    window.TerraZData.characterMedia[currentName] = result.media || window.TerraZData.characterMedia[currentName] || {};

    var characterMedia = window.TerraZApp && window.TerraZApp.characterMedia;
    if(characterMedia && characterMedia.clearAutomaticCache) characterMedia.clearAutomaticCache(currentName);
    if(characterMedia && characterMedia.refresh) characterMedia.refresh(document);

    fillMediaSource(currentName);
    refreshPortraitRemoval(currentName);

    document.dispatchEvent(new CustomEvent('terra-z:character-media-changed',{
      detail:{character:currentName,sourceChanged:true}
    }));

    showToast('Fonte do retrato atualizada sem alterar a ficha.','success',4500);

    var runtime = window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh) runtime.refresh({force:true,bust:result.sha,silent:true});

    var publishing = window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url){
      publishing.trackDeployment(result.status_url);
    }
  }catch(error){
    console.error('Terra Z media source:',error);
    showToast(error.message || 'Falha ao salvar a fonte do retrato.','error',6000);
  }finally{
    if(button){
      button.disabled = false;
      button.textContent = '💾 Salvar fonte do retrato';
    }
  }
}

function refreshAutomaticPortrait(){
  if(createMode || !currentName) return;
  var characterMedia = window.TerraZApp && window.TerraZApp.characterMedia;
  if(!characterMedia) return;

  if(characterMedia.clearAutomaticCache) characterMedia.clearAutomaticCache(currentName);
  if(characterMedia.refresh) characterMedia.refresh(document);

  if(characterMedia.resolveAutomatic){
    characterMedia.resolveAutomatic(currentName).then(function(result){
      if(result && result.found){
        if(characterMedia.refresh) characterMedia.refresh(document);
        showToast('Retrato automático atualizado.','success',3500);
      } else {
        showToast('A fonte configurada ainda não retornou uma imagem para este personagem.','warning',5000);
      }
    });
  }
}

function refreshPortraitRemoval(name){
  var button = el('characterEditorRemovePortraitBtn');
  var portrait = el('characterEditorPortraitBtn');

  if(createMode || !name){
    if(button) button.hidden = true;
    if(portrait) portrait.textContent = '🖼️ Trocar retrato';
    return;
  }

  var media = (window.TerraZData && window.TerraZData.characterMedia) || {};
  var item = media[name] || {};
  var hasLocal = !!item.src;
  var hasAutomatic = !!(item.auto && (
    (item.auto.provider === 'dc-fandom' && item.auto.wikiTitle) ||
    (item.auto.provider === 'external-url' && item.auto.imageUrl)
  ));

  if(button){
    button.hidden = !hasLocal;
    if(hasLocal && hasAutomatic) button.title = 'Remover a imagem própria e voltar ao retrato automático da DC Database';
  }

  if(portrait){
    portrait.textContent = hasLocal
      ? '🖼️ Trocar retrato'
      : (hasAutomatic ? '🖼️ Usar imagem própria' : '🖼️ Adicionar retrato');

    portrait.title = hasLocal
      ? 'Trocar retrato'
      : (hasAutomatic
        ? 'Substituir o retrato automático da DC Database por uma imagem própria'
        : 'Adicionar retrato');
  }
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
  refreshPortraitRemoval(name);
  fillMediaSource(name);
  fillOrganization(metaFor(name));

  var title = el('characterEditorTitle');
  if(title) title.textContent = '✏️ Editar personagem';
  var saveBtn = el('characterEditorSave');
  if(saveBtn) saveBtn.textContent = '💾 Salvar personagem';

  var deleteBtn = el('characterEditorDelete');
  if(deleteBtn) deleteBtn.hidden = false;

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
  refreshPortraitRemoval('');
  fillMediaSource('');
  fillOrganization({featured:false,nuclei:['other'],type:'npc',status:'active'});

  var title = el('characterEditorTitle');
  if(title) title.textContent = '＋ Novo personagem';
  var saveBtn = el('characterEditorSave');
  if(saveBtn) saveBtn.textContent = '＋ Criar personagem';

  var deleteBtn = el('characterEditorDelete');
  if(deleteBtn) deleteBtn.hidden = true;

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
  refreshPortraitRemoval('');
  fillMediaSource('');

  var deleteBtn = el('characterEditorDelete');
  if(deleteBtn) deleteBtn.hidden = true;

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
  var wasCreating = createMode;
  button.disabled = true;
  button.textContent = wasCreating ? 'Criando…' : 'Salvando…';
  setStatus(wasCreating ? 'Criando personagem no Terra Z…' : 'Salvando personagem…','working');

  try {
    var payload = {
      name:name,
      create:wasCreating,
      eyebrow:el('characterEditorEyebrow').value.trim(),
      sections:sections,
      meta:collectOrganization()
    };

    var manager = window.TerraZApp.characters;
    var hasCard = wasCreating || !!(manager && manager.isCreated && manager.isCreated(name));
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

    window.TerraZData = window.TerraZData || {};
    window.TerraZData.characterOverrides = window.TerraZData.characterOverrides || {};
    window.TerraZData.characterTaxonomy = window.TerraZData.characterTaxonomy || {characters:{}};
    window.TerraZData.characterTaxonomy.characters = window.TerraZData.characterTaxonomy.characters || {};

    if(result.character){
      var savedCharacter = Object.assign({},result.character);
      delete savedCharacter.name;
      window.TerraZData.characterOverrides[name] = savedCharacter;
    }
    if(result.meta){
      window.TerraZData.characterTaxonomy.characters[name] = result.meta;
      taxonomy = window.TerraZData.characterTaxonomy;
    }
    if(result.media){
      window.TerraZData.characterMedia = window.TerraZData.characterMedia || {};
      window.TerraZData.characterMedia[name] = result.media;
    }

    if(privateLoaded && window.TerraZApp.privateContent && window.TerraZApp.privateContent.setCharacterSecrets){
      window.TerraZApp.privateContent.setCharacterSecrets(name,payload.secrets || []);
    }

    var filters = window.TerraZApp && window.TerraZApp.characterFilters;
    if(filters && filters.refreshTaxonomy) filters.refreshTaxonomy();

    var characters = window.TerraZApp && window.TerraZApp.characters;
    if(characters && characters.refresh) characters.refresh();

    close();

    if(characters && characters.open){
      characters.open(name);
    }

    showToast(
      wasCreating ? (name + ' foi adicionado ao Terra Z.') : ('Ficha de ' + name + ' atualizada.'),
      'success',
      4500
    );

    var runtime = window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh) runtime.refresh({force:true,bust:result.sha,silent:true});

    var publishing = window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url){
      publishing.trackDeployment(result.status_url);
    }
  } catch(error){
    console.error('Terra Z character editor:',error);
    setStatus(error.message || (wasCreating ? 'Falha ao criar personagem.' : 'Falha ao atualizar personagem.'),'error');
    showToast(error.message || 'Falha ao salvar personagem.','error',6000);
  } finally {
    button.disabled = false;
    button.textContent = createMode ? '＋ Criar personagem' : '💾 Salvar personagem';
  }
}

function requestDelete(){
  if(createMode || !currentName) return;

  var name = currentName;
  showConfirm(
    'Apagar personagem',
    'Apagar "' + name + '"? A ficha, o card, os metadados, a associação de retrato e os segredos privados serão removidos. Referências históricas em sessões, textos e relações não serão reescritas automaticamente.',
    function(){ performDelete(name); },
    'Apagar personagem'
  );
}

async function performDelete(name){
  var b = backend();
  if(!b || !b.isAuthenticated()){
    close();
    showToast('Sua sessão de editor expirou.','warning');
    return;
  }

  var deleteBtn = el('characterEditorDelete');
  var saveBtn = el('characterEditorSave');

  if(deleteBtn){
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Apagando…';
  }
  if(saveBtn) saveBtn.disabled = true;

  document.body.style.overflow = 'hidden';
  setStatus('Apagando personagem do Terra Z…','working');

  try {
    var result = await b.request('/api/character',{
      method:'DELETE',
      body:{character:{name:name}}
    });

    var deletedName = result.deleted || name;

    window.TerraZData = window.TerraZData || {};
    window.TerraZData.characterOverrides = window.TerraZData.characterOverrides || {};
    window.TerraZData.characterTaxonomy = window.TerraZData.characterTaxonomy || {characters:{}};
    window.TerraZData.characterTaxonomy.characters = window.TerraZData.characterTaxonomy.characters || {};
    window.TerraZData.characterMedia = window.TerraZData.characterMedia || {};

    if(result.mode === 'tombstone'){
      window.TerraZData.characterOverrides[deletedName] = {deleted:true};
    } else {
      delete window.TerraZData.characterOverrides[deletedName];
    }

    delete window.TerraZData.characterTaxonomy.characters[deletedName];
    delete window.TerraZData.characterMedia[deletedName];
    taxonomy = window.TerraZData.characterTaxonomy;

    var privateApi = window.TerraZApp && window.TerraZApp.privateContent;
    if(privateApi && privateApi.removeCharacter) privateApi.removeCharacter(deletedName);

    var favorites = window.TerraZApp && window.TerraZApp.favorites;
    if(favorites && favorites.remove) favorites.remove(deletedName);

    var characters = window.TerraZApp && window.TerraZApp.characters;
    close();
    if(characters && characters.close) characters.close();

    var filters = window.TerraZApp && window.TerraZApp.characterFilters;
    if(filters && filters.refreshTaxonomy) filters.refreshTaxonomy();
    if(characters && characters.refresh) characters.refresh();

    showToast(deletedName + ' foi apagado do Terra Z.','success',5000);

    var runtime = window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh) runtime.refresh({force:true,bust:result.sha,silent:true});

    var publishing = window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url){
      publishing.trackDeployment(result.status_url);
    }
  } catch(error){
    console.error('Terra Z character delete:',error);
    setStatus(error.message || 'Falha ao apagar personagem.','error');
    showToast(error.message || 'Falha ao apagar personagem.','error',6000);
    document.body.style.overflow = 'hidden';
  } finally {
    if(deleteBtn){
      deleteBtn.disabled = false;
      deleteBtn.textContent = '🗑️ Apagar personagem';
    }
    if(saveBtn) saveBtn.disabled = false;
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

function removePortrait(){
  if(createMode || !currentName) return;
  if(window.TerraZApp.mediaManager && window.TerraZApp.mediaManager.requestRemove){
    window.TerraZApp.mediaManager.requestRemove(currentName);
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
  if(el('characterEditorDelete')) el('characterEditorDelete').addEventListener('click',requestDelete);
  if(el('characterEditorAddSection')) el('characterEditorAddSection').addEventListener('click',addSection);
  if(el('characterEditorPortraitBtn')) el('characterEditorPortraitBtn').addEventListener('click',openPortrait);
  if(el('characterEditorRemovePortraitBtn')) el('characterEditorRemovePortraitBtn').addEventListener('click',removePortrait);
  if(el('characterEditorGraphBtn')) el('characterEditorGraphBtn').addEventListener('click',openGraph);
  if(el('characterEditorMediaProvider')) el('characterEditorMediaProvider').addEventListener('change',syncMediaSourceFields);
  if(el('characterEditorMediaSaveBtn')) el('characterEditorMediaSaveBtn').addEventListener('click',saveMediaSource);
  if(el('characterEditorMediaRefreshBtn')) el('characterEditorMediaRefreshBtn').addEventListener('click',refreshAutomaticPortrait);

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

  document.addEventListener('terra-z:runtime-data-loaded',function(){
    taxonomy = (window.TerraZData && window.TerraZData.characterTaxonomy) || taxonomy;
    if(currentName){
      refreshPortraitRemoval(currentName);
      fillMediaSource(currentName);
    }
  });

  document.addEventListener('terra-z:character-media-changed',function(event){
    var changed = event.detail && event.detail.character;
    if(currentName && changed === currentName){
      refreshPortraitRemoval(currentName);
      fillMediaSource(currentName);
    }
  });

  refreshCreateButton();
}

setup();

window.TerraZApp.characterEditor = {
  open:open,
  openCreate:openCreate,
  close:close,
  save:save,
  deleteCharacter:requestDelete
};

})();