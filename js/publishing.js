(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/publishing.js');

var showToast = core.showToast;
var config = (window.TerraZConfig && window.TerraZConfig.publishing) || {};
var btn = document.getElementById('publishBtn');
var statusEl = document.getElementById('publishStatus');

function setStatus(text, state){
  if(!statusEl) return;
  statusEl.textContent = text || '';
  statusEl.setAttribute('data-state', state || 'idle');
}

function updateButton(){
  if(!btn) return;
  var enabled = !!(config.enabled && config.endpoint);
  btn.disabled = !enabled;
  btn.classList.toggle('publish-disabled', !enabled);
  btn.title = enabled
    ? 'Publicar alterações para todos'
    : 'Publicação remota aguardando configuração do backend seguro';
}

async function publish(){
  var editor = window.TerraZApp.editor;
  if(!editor){
    showToast('Editor indisponível.', 'error');
    return;
  }

  editor.save(true);
  var changes = editor.getPendingChanges();

  if(Object.keys(changes).length === 0){
    showToast('Nenhuma alteração pendente para publicar.', 'info');
    return;
  }

  if(!config.enabled || !config.endpoint){
    showToast('Rascunho salvo. A publicação remota ainda aguarda a conexão do backend seguro.', 'warning', 5500);
    return;
  }

  btn.disabled = true;
  setStatus('Publicando…', 'working');

  try {
    var response = await fetch(config.endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        type: 'content-overrides',
        repository: config.repository,
        branch: config.branch || 'main',
        baseVersion: editor.getPublishedVersion(),
        changes: changes,
        message: editor.suggestCommitMessage(changes)
      })
    });

    var result = await response.json().catch(function(){ return {}; });

    if(response.status === 409){
      throw new Error('O conteúdo remoto mudou desde que você abriu a página. Recarregue antes de publicar.');
    }
    if(!response.ok){
      throw new Error(result.error || ('Falha HTTP ' + response.status));
    }

    editor.markPublished(changes, result.version || result.commitSha || new Date().toISOString());
    setStatus('Publicado ✓', 'success');
    showToast('Alteração enviada ao GitHub. O Pages será atualizado em seguida.', 'success', 5000);

    setTimeout(function(){ setStatus('', 'idle'); }, 6000);
  } catch(err){
    console.error('publish:', err);
    setStatus('Falha ao publicar', 'error');
    showToast(err.message || 'Erro ao publicar.', 'error', 6500);
  } finally {
    updateButton();
  }
}

if(btn) btn.addEventListener('click', publish);
updateButton();

window.TerraZApp.publishing = {
  publish: publish,
  updateButton: updateButton,
  isConfigured: function(){ return !!(config.enabled && config.endpoint); }
};

})();
