(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/session-editor.js');

var showToast = core.showToast;

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }

function splitComma(value){
  return String(value || '').split(',').map(function(v){ return v.trim(); }).filter(Boolean);
}

function splitLines(value){
  return String(value || '').split(/\r?\n/).map(function(v){ return v.trim(); }).filter(Boolean);
}

function refresh(){
  var b = backend();
  var btn = el('addSessionBtn');
  if(!btn) return;
  var ready = !!(b && b.isConfigured() && b.isAuthenticated());
  btn.disabled = !ready;
  btn.title = ready ? 'Registrar nova sessão' : 'Entre como editor em Publicar para registrar sessões';
}

function open(){
  var b = backend();
  if(!b || !b.isConfigured() || !b.isAuthenticated()){
    showToast('Entre como editor no painel Publicar para registrar sessões.','warning',5000);
    if(window.TerraZApp.publishing) window.TerraZApp.publishing.open();
    return;
  }
  var panel = el('sessionEditorPanel');
  if(panel){
    panel.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function close(){
  var panel = el('sessionEditorPanel');
  if(panel) panel.classList.remove('show');
  document.body.style.overflow = '';
}

async function save(){
  var b = backend();
  if(!b || !b.isAuthenticated()) return open();

  var title = el('sessionTitle').value.trim();
  if(!title){
    showToast('Informe um título para a sessão.','warning');
    el('sessionTitle').focus();
    return;
  }

  var button = el('sessionSaveBtn');
  button.disabled = true;
  button.textContent = 'Publicando…';

  try {
    var result = await b.request('/api/session',{
      method:'POST',
      body:{
        session:{
          title:title,
          realDate:el('sessionRealDate').value,
          inWorldDate:el('sessionWorldDate').value.trim(),
          summary:el('sessionSummary').value.trim(),
          characters:splitComma(el('sessionCharacters').value),
          locations:splitComma(el('sessionLocations').value),
          consequences:splitLines(el('sessionConsequences').value),
          visibility:el('sessionVisibility').value
        }
      }
    });

    showToast('Sessão registrada. Aguardando GitHub Pages…','info',5000);

    if(window.TerraZApp.publishing && result.status_url){
      var published = await window.TerraZApp.publishing.waitForDeployment(result.status_url);
      if(published){
        showToast('Sessão publicada com sucesso','success',5000);
        setTimeout(function(){ location.reload(); },1000);
        return;
      }
    }

    close();
    showToast('Commit criado; o deploy ainda está processando.','info',5000);
  } catch(err){
    console.error(err);
    showToast(err.message || 'Falha ao registrar sessão','error',6000);
  } finally {
    button.disabled = false;
    button.textContent = '💾 Registrar sessão';
  }
}

function setup(){
  var openBtn = el('addSessionBtn');
  var closeBtn = el('sessionEditorClose');
  var cancelBtn = el('sessionCancelBtn');
  var saveBtn = el('sessionSaveBtn');
  var panel = el('sessionEditorPanel');

  if(openBtn) openBtn.addEventListener('click',open);
  if(closeBtn) closeBtn.addEventListener('click',close);
  if(cancelBtn) cancelBtn.addEventListener('click',close);
  if(saveBtn) saveBtn.addEventListener('click',save);
  if(panel) panel.addEventListener('click',function(e){ if(e.target === panel) close(); });

  document.addEventListener('terra-z:auth-changed',refresh);
  refresh();
}

setup();

window.TerraZApp.sessionEditor = {
  open:open,
  close:close,
  refresh:refresh
};

})();