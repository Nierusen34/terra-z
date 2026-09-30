(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/character-editor.js');

var showToast = core.showToast;
var escapeHtml = core.escapeHtml;
var escapeAttr = core.escapeAttr;

var currentName = '';
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

  currentName = name;
  el('characterEditorName').value = name;
  el('characterEditorEyebrow').value = ficha.eyebrow || '';
  renderSections(Array.isArray(ficha.sections) ? ficha.sections : []);

  privateLoaded = false;
  var secretsField = el('characterEditorSecrets');
  secretsField.value = '';
  secretsField.disabled = true;
  secretsField.placeholder = 'Carregando conteúdo privado…';

  setStatus('Carregando conteúdo privado…','working');

  var panel = el('characterEditorPanel');
  if(panel) panel.classList.add('show');
  document.body.style.overflow = 'hidden';

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

function close(){
  currentName = '';
  privateLoaded = false;
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

  var sections = collectSections();
  if(!sections.length){
    setStatus('A ficha precisa ter ao menos uma seção.','error');
    return;
  }

  var button = el('characterEditorSave');
  button.disabled = true;
  button.textContent = 'Salvando…';
  setStatus('Publicando ficha no Terra Z…','working');

  try {
    var payload = {
      name:currentName,
      eyebrow:el('characterEditorEyebrow').value.trim(),
      sections:sections
    };

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
        setStatus('Personagem atualizado com sucesso.','success');
        showToast('Ficha de ' + currentName + ' atualizada.','success',5000);
        setTimeout(function(){ location.reload(); },900);
        return;
      }
    }

    setStatus('Commit criado; o deploy ainda está processando.','working');
    showToast('Alterações enviadas. O deploy ainda está processando.','info',5000);
  } catch(error){
    console.error('Terra Z character editor:',error);
    setStatus(error.message || 'Falha ao atualizar personagem.','error');
    showToast(error.message || 'Falha ao atualizar personagem.','error',6000);
  } finally {
    button.disabled = false;
    button.textContent = '💾 Salvar personagem';
  }
}

function openPortrait(){
  if(currentName && window.TerraZApp.mediaManager){
    window.TerraZApp.mediaManager.choose(currentName);
  }
}

function openGraph(){
  close();
  if(window.TerraZApp.graph && window.TerraZApp.graph.openEditor){
    window.TerraZApp.graph.openEditor();
  }
}

function setup(){
  var panel = el('characterEditorPanel');
  var sections = el('characterEditorSections');

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
    var b = backend();
    if(!b || !b.isAuthenticated()) close();
  });
}

setup();

window.TerraZApp.characterEditor = {
  open:open,
  close:close,
  save:save
};

})();
