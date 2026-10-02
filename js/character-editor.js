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
var createImportContext = null;
var taxonomy = (window.TerraZData && window.TerraZData.characterTaxonomy) || {nuclei:[],types:[],statuses:[],tags:[],characters:{}};

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }

var visibilityCapability=null;
var portraitFramingCapability=null;
var framingDraft=null;

async function supportsPortraitFraming(){
  if(portraitFramingCapability !== null) return portraitFramingCapability;
  var b=backend();
  if(!b || !b.health) return false;

  try{
    var health=await b.health();
    portraitFramingCapability=!!(health && health.portrait_framing === true);
  }catch(error){
    portraitFramingCapability=false;
  }

  return portraitFramingCapability;
}

async function supportsVisibilitySystem(){
  if(visibilityCapability !== null) return visibilityCapability;
  var b=backend();
  if(!b || !b.health) return false;

  try{
    var health=await b.health();
    visibilityCapability=!!(
      health &&
      health.visibility_system === 'public-spoiler-master' &&
      health.secure_master_sections === true
    );
  }catch(error){
    visibilityCapability=false;
  }

  return visibilityCapability;
}

function usesAdvancedVisibility(meta,sections){
  if(meta && meta.visibility && meta.visibility !== 'public') return true;
  return (sections || []).some(function(section){
    return section && section.visibility && section.visibility !== 'public';
  });
}

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
    status:meta.status || 'unknown',
    tags:Array.isArray(meta.tags) ? meta.tags.slice() : [],
    visibility:(meta.visibility === 'master' || meta.visibility === 'private')
      ? 'master'
      : (meta.visibility === 'spoiler' ? 'spoiler' : 'public')
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

function renderEditorTags(selected){
  var root=el('characterEditorTags');
  if(!root) return;
  var chosen=new Set(Array.isArray(selected)?selected:[]);
  var defs=definitions('tags');
  if(!defs.length){
    root.innerHTML='<span class="character-editor-empty-taxonomy">Nenhuma tag cadastrada. Crie tags em Administração → Taxonomias.</span>';
    return;
  }
  root.innerHTML='';
  defs.forEach(function(item){
    var label=document.createElement('label');
    label.className='character-editor-nucleus-option';
    var input=document.createElement('input');
    input.type='checkbox';input.value=item.id;input.checked=chosen.has(item.id);
    var span=document.createElement('span');span.textContent=item.label;
    label.appendChild(input);label.appendChild(span);root.appendChild(label);
  });
}

function fillOrganization(meta){
  meta = meta || {};
  fillSelect('characterEditorType',definitions('types'),meta.type || 'other');
  fillSelect('characterEditorStatusMeta',definitions('statuses'),meta.status || 'unknown');

  var featured = el('characterEditorFeatured');
  if(featured) featured.checked = meta.featured === true;

  var visibilitySelect=el('characterEditorVisibility');
  if(visibilitySelect){
    var value=meta.visibility === 'private' ? 'master' : (meta.visibility || 'public');
    visibilitySelect.value=(value === 'master' || value === 'spoiler') ? value : 'public';
  }

  renderEditorNuclei(meta.nuclei || []);
  renderEditorTags(meta.tags || []);
}

function collectOrganization(){
  var nucleiRoot = el('characterEditorNuclei');
  var tagsRoot=el('characterEditorTags');
  var nuclei = nucleiRoot
    ? Array.from(nucleiRoot.querySelectorAll('input[type="checkbox"]:checked')).map(function(input){ return input.value; })
    : [];

  var tags=tagsRoot
    ? Array.from(tagsRoot.querySelectorAll('input[type="checkbox"]:checked')).map(function(input){ return input.value; })
    : [];

  return {
    featured:!!(el('characterEditorFeatured') && el('characterEditorFeatured').checked),
    nuclei:nuclei,
    tags:tags,
    type:el('characterEditorType') ? el('characterEditorType').value : 'other',
    status:el('characterEditorStatusMeta') ? el('characterEditorStatusMeta').value : 'unknown',
    visibility:el('characterEditorVisibility') ? el('characterEditorVisibility').value : 'public'
  };
}

function setStatus(message,state){
  var node = el('characterEditorStatus');
  if(!node) return;
  node.textContent = message || '';
  node.setAttribute('data-state',state || 'idle');
}

function sectionHtml(section,index){
  section=section || {};
  var visibility=section.visibility === 'master' ? 'master' : (section.visibility === 'spoiler' ? 'spoiler' : 'public');
  return '<div class="character-editor-section" data-character-section="' + index + '">' +
    '<div class="character-editor-section-head">' +
      '<input class="character-section-title" type="text" maxlength="160" value="' + escapeAttr(section.title || '') + '" placeholder="Título da seção">' +
      '<select class="character-section-visibility" title="Visibilidade desta seção">' +
        '<option value="public"' + (visibility === 'public' ? ' selected' : '') + '>🌐 Público</option>' +
        '<option value="spoiler"' + (visibility === 'spoiler' ? ' selected' : '') + '>⚠️ Spoiler</option>' +
        '<option value="master"' + (visibility === 'master' ? ' selected' : '') + '>🔒 Mestre</option>' +
      '</select>' +
      '<button type="button" class="character-section-remove" title="Remover seção">🗑</button>' +
    '</div>' +
    '<div class="character-section-content" contenteditable="true" spellcheck="true">' + (section.content || '') + '</div>' +
  '</div>';
}

function defaultSections(){
  return [
    {title:'📋 Ficha Básica',content:'<p><strong>Nome:</strong> <br><strong>Codinome:</strong> <br><strong>Idade:</strong> <br><strong>Origem:</strong> <br><strong>Status:</strong> <br><strong>Local:</strong> </p>'},
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
  root.insertAdjacentHTML('beforeend',sectionHtml({title:'Nova seção',visibility:'public',content:'<p>Conteúdo da seção.</p>'},index));
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
    var title=row.querySelector('.character-section-title');
    var content=row.querySelector('.character-section-content');
    var visibility=row.querySelector('.character-section-visibility');
    return {
      title:title ? title.value.trim() : '',
      content:content ? content.innerHTML.trim() : '',
      visibility:visibility ? visibility.value : 'public'
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

function characterMediaApi(){
  return window.TerraZApp && window.TerraZApp.characterMedia;
}

function cloneFrame(frame){
  return {
    fit:frame && frame.fit === 'contain' ? 'contain' : 'cover',
    x:Number(frame && frame.x),
    y:Number(frame && frame.y),
    zoom:Number(frame && frame.zoom)
  };
}

function buildFramingDraft(name){
  var api=characterMediaApi();
  var meta=api && api.get ? api.get(name) : {};
  var automatic=!!(meta && meta.automatic);
  var contexts=['card','sheet','graph'];
  var draft={};

  contexts.forEach(function(context){
    var frame=api && api.getFraming
      ? api.getFraming(name,context)
      : (context === 'sheet' && automatic
        ? {fit:'contain',x:50,y:8,zoom:1}
        : {fit:'cover',x:50,y:context === 'sheet' ? 50 : 24,zoom:1});
    draft[context]=cloneFrame(frame);
  });

  return draft;
}

function currentFramingContext(){
  var select=el('characterEditorFramingContext');
  var value=select ? select.value : 'card';
  return value === 'sheet' || value === 'graph' ? value : 'card';
}

function framingCurrent(){
  if(!framingDraft) framingDraft=buildFramingDraft(currentName);
  var context=currentFramingContext();
  if(!framingDraft[context]) framingDraft[context]=buildFramingDraft(currentName)[context];
  return framingDraft[context];
}

function refreshFramingLabels(){
  var frame=framingCurrent();
  if(el('characterEditorFramingZoomValue')) el('characterEditorFramingZoomValue').textContent=Math.round(frame.zoom*100)+'%';
  if(el('characterEditorFramingXValue')) el('characterEditorFramingXValue').textContent=Math.round(frame.x)+'%';
  if(el('characterEditorFramingYValue')) el('characterEditorFramingYValue').textContent=Math.round(frame.y)+'%';
}

function renderFramingPreview(){
  var preview=el('characterEditorFramingPreview');
  if(!preview || !currentName) return;

  var api=characterMediaApi();
  var context=currentFramingContext();
  var frame=framingCurrent();
  preview.setAttribute('data-context',context);

  if(api && api.renderPortraitHtml){
    preview.innerHTML=api.renderPortraitHtml(
      currentName,
      context === 'card' ? 'small' : 'large',
      context,
      frame
    );
    if(api.hydrate) api.hydrate(preview);

    var meta=api.get ? api.get(currentName) : {};
    if(meta && meta.automatic && !meta.src && api.resolveAutomatic){
      api.resolveAutomatic(currentName).then(function(result){
        if(result && result.found && currentName && preview.isConnected){
          preview.innerHTML=api.renderPortraitHtml(
            currentName,
            context === 'card' ? 'small' : 'large',
            context,
            framingCurrent()
          );
          if(api.hydrate) api.hydrate(preview);
        }
      });
    }
  }else{
    preview.innerHTML='<div class="character-framing-no-preview">Prévia indisponível.</div>';
  }
}

function syncFramingControls(){
  if(!framingDraft || !currentName) return;
  var frame=framingCurrent();

  if(el('characterEditorFramingFit')) el('characterEditorFramingFit').value=frame.fit;
  if(el('characterEditorFramingZoom')) el('characterEditorFramingZoom').value=String(Math.round(frame.zoom*100));
  if(el('characterEditorFramingX')) el('characterEditorFramingX').value=String(Math.round(frame.x));
  if(el('characterEditorFramingY')) el('characterEditorFramingY').value=String(Math.round(frame.y));

  refreshFramingLabels();
  renderFramingPreview();
}

function updateFramingDraftFromControls(){
  if(!framingDraft || !currentName) return;
  var frame=framingCurrent();

  frame.fit=el('characterEditorFramingFit') && el('characterEditorFramingFit').value === 'contain' ? 'contain' : 'cover';
  frame.zoom=Math.max(.5,Math.min(2.5,Number(el('characterEditorFramingZoom') ? el('characterEditorFramingZoom').value : 100)/100));
  frame.x=Math.max(0,Math.min(100,Number(el('characterEditorFramingX') ? el('characterEditorFramingX').value : 50)));
  frame.y=Math.max(0,Math.min(100,Number(el('characterEditorFramingY') ? el('characterEditorFramingY').value : 50)));

  refreshFramingLabels();
  renderFramingPreview();
}

async function refreshFramingAccess(){
  var button=el('characterEditorFramingSaveBtn');
  if(!button) return;

  var b=backend();
  var authenticated=!!(b && b.isAuthenticated && b.isAuthenticated());
  var supported=authenticated ? await supportsPortraitFraming() : false;
  button.disabled=!(authenticated && supported);

  if(!authenticated) button.title='Entre como editor para salvar o enquadramento';
  else if(!supported) button.title='Publique o checkpoint atual para ativar o ajuste de enquadramento na Vercel';
  else button.title='Salvar enquadramento para cards, ficha e grafo';
}

function fillMediaFraming(name){
  var panel=el('characterEditorMediaFraming');
  if(panel) panel.hidden=!name || createMode;
  framingDraft=name && !createMode ? buildFramingDraft(name) : null;

  if(!name || createMode) return;

  if(el('characterEditorFramingContext')) el('characterEditorFramingContext').value='card';
  syncFramingControls();
  refreshFramingAccess();
}

function resetCurrentFraming(){
  if(!currentName || !framingDraft) return;
  var context=currentFramingContext();
  var api=characterMediaApi();
  var meta=api && api.get ? api.get(currentName) : {};
  var automatic=!!(meta && meta.automatic);
  var fallback=api && api.defaultFraming
    ? api.defaultFraming(context,automatic)
    : (context === 'sheet' && automatic
      ? {fit:'contain',x:50,y:8,zoom:1}
      : {fit:'cover',x:50,y:context === 'sheet' ? 50 : 24,zoom:1});

  framingDraft[context]=cloneFrame(fallback);
  syncFramingControls();
}

async function saveMediaFraming(){
  if(createMode || !currentName || !framingDraft) return;

  var b=backend();
  if(!b || !b.isAuthenticated || !b.isAuthenticated()){
    showToast('Entre como editor para ajustar o enquadramento.','warning',5000);
    return;
  }

  if(!(await supportsPortraitFraming())){
    showToast('Publique primeiro o checkpoint atual para ativar o enquadramento de retratos na Vercel.','warning',6500);
    return;
  }

  updateFramingDraftFromControls();

  var button=el('characterEditorFramingSaveBtn');
  if(button){ button.disabled=true; button.textContent='Salvando…'; }

  try{
    var result=await b.request('/api/media',{
      method:'POST',
      body:{
        action:'configure-display',
        character:currentName,
        framing:framingDraft
      }
    });

    window.TerraZData=window.TerraZData || {};
    window.TerraZData.characterMedia=window.TerraZData.characterMedia || {};
    window.TerraZData.characterMedia[currentName]=result.media || window.TerraZData.characterMedia[currentName] || {};

    var api=characterMediaApi();
    if(api && api.refresh) api.refresh(document);

    framingDraft=buildFramingDraft(currentName);
    syncFramingControls();

    document.dispatchEvent(new CustomEvent('terra-z:character-media-changed',{
      detail:{character:currentName,framingChanged:true}
    }));

    showToast('Enquadramento atualizado em cards, ficha e grafo.','success',4500);

    var runtime=window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh) await runtime.refresh({force:true,bust:result.sha,silent:true});

    if(result.private){
      var privateApi=window.TerraZApp && window.TerraZApp.privateContent;
      if(privateApi && privateApi.reload) await privateApi.reload();
    }

    var publishing=window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url){
      publishing.trackDeployment(result.status_url);
    }
  }catch(error){
    console.error('Terra Z portrait framing:',error);
    showToast(error.message || 'Falha ao salvar o enquadramento.','error',6000);
  }finally{
    if(button){
      button.disabled=false;
      button.textContent='💾 Salvar enquadramento';
    }
  }
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

  setCreateFieldsVisible(true);
  var card = manager && manager.cardData ? manager.cardData(name) : {};
  el('characterEditorIcon').value = card.icon || '👤';
  el('characterEditorCardCodename').value = card.codename === '—' ? '' : (card.codename || '');
  el('characterEditorCardAge').value = card.age === '—' ? '' : (card.age || '');
  el('characterEditorCardOrigin').value = card.origin === '—' ? '' : (card.origin || '');
  el('characterEditorCardStatus').value = card.status === '—' ? '' : (card.status || '');

  setCreateDependentButtons(false);
  refreshPortraitRemoval(name);
  fillMediaSource(name);
  fillMediaFraming(name);
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

function openCreate(prefill){
  var b = backend();
  if(!b || !b.isConfigured() || !b.isAuthenticated()){
    showToast('Entre como editor para criar personagens.','warning',5000);
    if(window.TerraZApp.publishing) window.TerraZApp.publishing.open();
    return;
  }

  prefill=prefill && typeof prefill === 'object' ? prefill : {};
  createImportContext=prefill.importSource === 'dc-fandom'
    ? {
        provider:'dc-fandom',
        wikiTitle:String(prefill.wikiTitle || '').trim(),
        addToGraph:prefill.addToGraph === true
      }
    : null;

  createMode = true;
  currentName = '';
  privateLoaded = true;

  var nameField = el('characterEditorName');
  nameField.readOnly = false;
  nameField.value = String(prefill.name || '').trim();
  nameField.placeholder = 'Nome completo ou codinome';

  el('characterEditorEyebrow').value = String(prefill.eyebrow || '').trim();
  el('characterEditorIcon').value = String(prefill.icon || '👤').trim() || '👤';
  el('characterEditorCardCodename').value = String(prefill.codename || '').trim();
  el('characterEditorCardAge').value = '';
  el('characterEditorCardOrigin').value = '';
  el('characterEditorCardStatus').value = '';
  el('characterEditorSecrets').value = '';
  el('characterEditorSecrets').disabled = false;
  el('characterEditorSecrets').placeholder = 'Um segredo por linha';

  var sections=defaultSections();
  if(nameField.value){
    sections[0].content='<p><strong>Nome:</strong> '+escapeAttr(nameField.value)+'<br><strong>Codinome:</strong> <br><strong>Idade:</strong> <br><strong>Origem:</strong> <br><strong>Status:</strong> <br><strong>Local:</strong> </p>';
  }
  renderSections(sections);
  setCreateFieldsVisible(true);
  setCreateDependentButtons(true);
  refreshPortraitRemoval('');
  fillMediaSource('');
  fillMediaFraming('');
  fillOrganization({featured:false,nuclei:['other'],type:'npc',status:'active',visibility:'public'});

  var title = el('characterEditorTitle');
  if(title) title.textContent = createImportContext ? '＋ Importar personagem da DC' : '＋ Novo personagem';
  var saveBtn = el('characterEditorSave');
  if(saveBtn) saveBtn.textContent = createImportContext && createImportContext.addToGraph
    ? '＋ Criar card e preparar grafo'
    : '＋ Criar personagem';

  var deleteBtn = el('characterEditorDelete');
  if(deleteBtn) deleteBtn.hidden = true;

  setStatus(
    createImportContext
      ? 'Importado da DC Database apenas como ponto de partida. Revise nome, card e ficha; o conteúdo da wiki não será copiado automaticamente.'
      : 'Preencha a ficha. O retrato e o grafo poderão ser adicionados após o primeiro salvamento.',
    'ready'
  );
  preparePanel();

  setTimeout(function(){ if(nameField.value) nameField.select(); else nameField.focus(); },50);
}

function close(){
  currentName = '';
  createMode = false;
  privateLoaded = false;
  createImportContext = null;

  var nameField = el('characterEditorName');
  if(nameField){
    nameField.readOnly = true;
    nameField.placeholder = '';
  }

  setCreateFieldsVisible(false);
  setCreateDependentButtons(false);
  refreshPortraitRemoval('');
  fillMediaSource('');
  fillMediaFraming('');

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

  var organization=collectOrganization();
  if(usesAdvancedVisibility(organization,sections) && !(await supportsVisibilitySystem())){
    setStatus('Os novos níveis Público / Spoiler / Mestre estão em staging. O backend consolidado ainda não foi publicado na Vercel, então esta alteração foi bloqueada para evitar exposição acidental.','warning');
    showToast('Visibilidade avançada em staging: aguarde o próximo deploy consolidado antes de salvar este nível.','warning',6500);
    return;
  }

  var button = el('characterEditorSave');
  var wasCreating = createMode;
  var importContext = wasCreating && createImportContext ? {...createImportContext} : null;
  button.disabled = true;
  button.textContent = wasCreating ? 'Criando…' : 'Salvando…';
  setStatus(wasCreating ? 'Criando personagem no Terra Z…' : 'Salvando personagem…','working');

  try {
    var payload = {
      name:name,
      create:wasCreating,
      eyebrow:el('characterEditorEyebrow').value.trim(),
      sections:sections,
      meta:organization
    };

    payload.card = {
      icon:el('characterEditorIcon').value.trim() || '👤',
      codename:el('characterEditorCardCodename').value.trim(),
      age:el('characterEditorCardAge').value.trim(),
      origin:el('characterEditorCardOrigin').value.trim(),
      status:el('characterEditorCardStatus').value.trim()
    };

    if(privateLoaded){
      payload.secrets = splitSecrets(el('characterEditorSecrets').value);
    }

    var result = await b.request('/api/character',{
      method:'POST',
      body:{character:payload}
    });

    var latestSha=result.sha;
    var portraitConfigured=false;

    if(wasCreating && importContext && importContext.wikiTitle){
      try{
        var mediaResult=await b.request('/api/media',{
          method:'POST',
          body:{
            action:'configure-source',
            character:name,
            provider:'dc-fandom',
            wikiTitle:importContext.wikiTitle
          }
        });
        latestSha=mediaResult.sha || latestSha;
        portraitConfigured=true;
      }catch(mediaError){
        console.warn('Terra Z DC import portrait:',mediaError);
        showToast('O card foi criado, mas a fonte automática do retrato não pôde ser vinculada. Você pode escolhê-la depois no editor.','warning',6500);
      }
    }

    // A API separa dados públicos e Mestre no armazenamento. Para evitar que
    // uma resposta combinada seja aplicada sobre um overlay privado já ativo,
    // recarregamos primeiro a base pública canônica e depois o cofre.
    var runtime = window.TerraZApp && window.TerraZApp.runtimeData;
    var runtimeResult = null;

    if(runtime && runtime.refresh){
      runtimeResult = await runtime.refresh({
        force:true,
        bust:latestSha,
        silent:true
      });
    }

    var privateApi = window.TerraZApp && window.TerraZApp.privateContent;
    if(privateLoaded && privateApi && privateApi.reload){
      await privateApi.reload();
    }

    if(!runtimeResult){
      // O commit já foi salvo com segurança no backend. Evitamos reconstruir
      // localmente uma ficha parcialmente pública/privada porque isso poderia
      // duplicar overlays. A próxima atualização/reload buscará a versão canônica.
      showToast(
        'Ficha salva. A sincronização visual não terminou; recarregue a página para ver o estado mais recente.',
        'warning',
        6500
      );
    }

    taxonomy = (window.TerraZData && window.TerraZData.characterTaxonomy) || taxonomy;

    var filters = window.TerraZApp && window.TerraZApp.characterFilters;
    if(filters && filters.refreshTaxonomy) filters.refreshTaxonomy();

    var characters = window.TerraZApp && window.TerraZApp.characters;
    if(characters && characters.refresh) characters.refresh();

    close();

    if(wasCreating && importContext && importContext.addToGraph && window.TerraZApp.graph && window.TerraZApp.graph.importCharacter){
      await window.TerraZApp.graph.importCharacter(name,{
        wikiTitle:importContext.wikiTitle,
        portraitConfigured:portraitConfigured
      });
    }else if(characters && characters.open){
      characters.open(name);
    }

    showToast(
      wasCreating
        ? (name + (importContext && importContext.addToGraph ? ' foi criado; revise a nova bolinha e salve o grafo.' : ' foi adicionado ao Terra Z.'))
        : ('Ficha de ' + name + ' atualizada.'),
      'success',
      5200
    );

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
  if(el('characterEditorMediaBrowseBtn')) el('characterEditorMediaBrowseBtn').addEventListener('click',function(){
    if(currentName && window.TerraZApp.portraitBrowser) window.TerraZApp.portraitBrowser.open(currentName);
  });
  if(el('characterEditorMediaSaveBtn')) el('characterEditorMediaSaveBtn').addEventListener('click',saveMediaSource);
  if(el('characterEditorMediaRefreshBtn')) el('characterEditorMediaRefreshBtn').addEventListener('click',refreshAutomaticPortrait);
  if(el('characterEditorFramingContext')) el('characterEditorFramingContext').addEventListener('change',syncFramingControls);
  if(el('characterEditorFramingFit')) el('characterEditorFramingFit').addEventListener('change',updateFramingDraftFromControls);
  ['characterEditorFramingZoom','characterEditorFramingX','characterEditorFramingY'].forEach(function(id){
    if(el(id)) el(id).addEventListener('input',updateFramingDraftFromControls);
  });
  if(el('characterEditorFramingResetBtn')) el('characterEditorFramingResetBtn').addEventListener('click',resetCurrentFraming);
  if(el('characterEditorFramingSaveBtn')) el('characterEditorFramingSaveBtn').addEventListener('click',saveMediaFraming);

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
    visibilityCapability=null;
    portraitFramingCapability=null;
    refreshCreateButton();
    refreshFramingAccess();
    var b = backend();
    if(!b || !b.isAuthenticated()) close();
  });

  document.addEventListener('terra-z:runtime-data-loaded',function(){
    taxonomy = (window.TerraZData && window.TerraZData.characterTaxonomy) || taxonomy;
    if(currentName){
      refreshPortraitRemoval(currentName);
      fillMediaSource(currentName);
      fillMediaFraming(currentName);
    }
  });

  document.addEventListener('terra-z:character-media-changed',function(event){
    var changed = event.detail && event.detail.character;
    if(currentName && changed === currentName){
      refreshPortraitRemoval(currentName);
      fillMediaSource(currentName);
      fillMediaFraming(currentName);
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
  deleteCharacter:requestDelete,
  importFromDc:function(options){
    options=options || {};
    openCreate({
      importSource:'dc-fandom',
      wikiTitle:options.wikiTitle || '',
      name:options.name || '',
      codename:options.codename || '',
      eyebrow:options.eyebrow || 'Referência · DC Database',
      icon:'👤',
      addToGraph:options.addToGraph === true
    });
  }
};

})();