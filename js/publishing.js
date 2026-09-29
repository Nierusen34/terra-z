(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/publishing.js');

var showToast = core.showToast;
var config = (window.TerraZConfig && window.TerraZConfig.publishing) || {};

function el(id){ return document.getElementById(id); }

function setStatus(text, state){
  var status = el('publishStatus');
  if(!status) return;
  status.textContent = text;
  status.setAttribute('data-state', state || 'idle');
}

function getEditor(){
  return window.TerraZApp && window.TerraZApp.editor;
}

function getPending(){
  var editor = getEditor();
  return editor && editor.getPendingChanges ? editor.getPendingChanges() : {};
}

function refresh(){
  var changes = getPending();
  var count = Object.keys(changes).length;
  var countEl = el('publishCount');
  var btn = el('publishSubmitBtn');

  if(countEl) countEl.textContent = String(count);
  if(btn) btn.disabled = count === 0 || !config.enabled || !config.endpoint;

  if(!config.enabled || !config.endpoint){
    setStatus('Publicação remota ainda não conectada', 'setup');
  } else if(count === 0){
    setStatus('Nenhuma alteração pendente', 'idle');
  } else {
    setStatus(count + (count === 1 ? ' alteração pronta para publicar' : ' alterações prontas para publicar'), 'ready');
  }
}

function openPanel(){
  var panel = el('publishPanel');
  if(!panel) return;
  panel.classList.add('show');
  document.body.style.overflow = 'hidden';
  refresh();
}

function closePanel(){
  var panel = el('publishPanel');
  if(panel) panel.classList.remove('show');
  document.body.style.overflow = '';
}

function buildPayload(){
  var changes = getPending();
  var messageInput = el('publishMessage');
  var message = messageInput ? messageInput.value.trim() : '';

  if(!message) message = 'content: atualizar conteúdo pelo editor do Terra Z';

  return {
    schema: 'terra-z-publish-v1',
    repository: config.repository,
    branch: config.branch || 'main',
    type: 'content-overrides',
    message: message,
    changes: changes,
    client: {
      url: location.href,
      timestamp: new Date().toISOString()
    }
  };
}

async function waitForDeployment(statusUrl){
  if(!statusUrl) return null;

  for(var attempt = 0; attempt < 30; attempt++){
    await new Promise(function(resolve){ setTimeout(resolve, 2000); });

    var response = await fetch(statusUrl, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept':'application/json' }
    });

    if(!response.ok) continue;

    var result = await response.json();
    if(result.status === 'success' || result.status === 'published') return true;
    if(result.status === 'failed' || result.status === 'error') throw new Error(result.message || 'Falha no deploy.');
  }

  return false;
}

async function publish(){
  var changes = getPending();
  if(Object.keys(changes).length === 0){
    showToast('Nenhuma alteração pendente para publicar', 'warning');
    return;
  }

  if(!config.enabled || !config.endpoint){
    openPanel();
    setStatus('Conecte o endpoint seguro de publicação para ativar este botão.', 'setup');
    return;
  }

  var btn = el('publishSubmitBtn');
  if(btn) btn.disabled = true;
  setStatus('Enviando alterações…', 'working');

  try {
    var response = await fetch(config.endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
      body: JSON.stringify(buildPayload())
    });

    var result = await response.json().catch(function(){ return {}; });
    if(!response.ok) throw new Error(result.message || ('Erro HTTP ' + response.status));

    setStatus('Commit criado. Aguardando publicação…', 'working');

    var published = await waitForDeployment(result.status_url || result.statusUrl);
    if(published === null){
      setStatus('Commit criado. Aguardando o GitHub Pages…', 'working');
      showToast('Commit criado. O rascunho local foi preservado até o deploy ser confirmado.', 'info', 6000);
      return;
    }
    if(!published){
      setStatus('Commit criado; deploy ainda está processando.', 'working');
      showToast('Commit criado. O deploy ainda está em andamento.', 'info', 5000);
      return;
    }

    var editor = getEditor();
    var remaining = (editor && editor.markPublished) ? editor.markPublished(changes) : 0;
    setStatus(remaining ? 'Publicado; há novas alterações locais' : 'Publicado com sucesso', 'success');
    showToast(remaining ? 'Publicação concluída. Alterações feitas durante o deploy foram preservadas.' : 'Alterações publicadas no Terra Z', 'success', 5000);

    setTimeout(function(){ location.reload(); }, 1200);
  } catch(err){
    console.error('Terra Z publish:', err);
    setStatus('Falha: ' + err.message, 'error');
    showToast('Erro ao publicar: ' + err.message, 'error', 6000);
    if(btn) btn.disabled = false;
  }
}

function setup(){
  var open = el('publishBtn');
  var close = el('publishClose');
  var cancel = el('publishCancelBtn');
  var submit = el('publishSubmitBtn');
  var panel = el('publishPanel');

  if(open) open.addEventListener('click', openPanel);
  if(close) close.addEventListener('click', closePanel);
  if(cancel) cancel.addEventListener('click', closePanel);
  if(submit) submit.addEventListener('click', publish);
  if(panel) panel.addEventListener('click', function(e){ if(e.target === panel) closePanel(); });

  document.addEventListener('terra-z:edits-changed', refresh);
  refresh();
}

setup();

window.TerraZApp.publishing = {
  open: openPanel,
  close: closePanel,
  refresh: refresh,
  publish: publish,
  getPending: getPending,
  isConfigured: function(){ return !!(config.enabled && config.endpoint); }
};

})();
