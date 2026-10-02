(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/session-editor.js');

var showToast = core.showToast;
var showConfirm = core.showConfirm;
var currentId = '';

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }

var visibilityCapability=null;

async function supportsVisibilitySystem(){
  if(visibilityCapability !== null) return visibilityCapability;
  var b=backend();
  if(!b || !b.health) return false;
  try{
    var health=await b.health();
    visibilityCapability=!!(health && health.visibility_system === 'public-spoiler-master');
  }catch(error){
    visibilityCapability=false;
  }
  return visibilityCapability;
}

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

function fill(session){
  session = session || {};
  currentId = session.id || '';
  el('sessionTitle').value = session.title || '';
  el('sessionRealDate').value = session.realDate || '';
  el('sessionWorldDate').value = session.inWorldDate || '';
  el('sessionSummary').value = session.summary || '';
  el('sessionCharacters').value = Array.isArray(session.characters) ? session.characters.join(', ') : '';
  el('sessionLocations').value = Array.isArray(session.locations) ? session.locations.join(', ') : '';
  el('sessionConsequences').value = Array.isArray(session.consequences) ? session.consequences.join('\n') : '';
  var visibility=session.visibility === 'rumor' ? 'spoiler' : (session.visibility || 'public');
  el('sessionVisibility').value = visibility;
  var title = el('sessionEditorTitle');
  if(title) title.textContent = currentId ? '📓 Editar sessão' : '📓 Registrar sessão';
  var saveBtn = el('sessionSaveBtn');
  if(saveBtn) saveBtn.textContent = currentId ? '💾 Atualizar sessão' : '💾 Registrar sessão';

  var deleteBtn = el('sessionDeleteBtn');
  if(deleteBtn) deleteBtn.hidden = !currentId;
}

function open(id){
  var b = backend();
  if(!b || !b.isConfigured() || !b.isAuthenticated()){
    showToast('Entre como editor no painel Publicar para registrar sessões.','warning',5000);
    if(window.TerraZApp.publishing) window.TerraZApp.publishing.open();
    return;
  }
  var manager = window.TerraZApp && window.TerraZApp.sessions;
  var all = manager && manager.getAll ? manager.getAll() : ((window.TerraZData && window.TerraZData.sessions) || []);
  var session = id ? all.find(function(item){ return item && item.id === id; }) : null;
  fill(session || {});

  var panel = el('sessionEditorPanel');
  if(panel){
    panel.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function openDraft(draft){
  var b=backend();
  if(!b || !b.isConfigured() || !b.isAuthenticated()){
    showToast('Entre como editor para preparar o registro da sessão.','warning',5000);
    return;
  }
  fill(draft || {});
  currentId='';
  var panel=el('sessionEditorPanel');
  if(panel){
    panel.classList.add('show');
    document.body.style.overflow='hidden';
  }
}

function close(){
  currentId = '';
  var deleteBtn = el('sessionDeleteBtn');
  if(deleteBtn) deleteBtn.hidden = true;
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

  var selectedVisibility=el('sessionVisibility').value;
  if(selectedVisibility === 'spoiler' && !(await supportsVisibilitySystem())){
    showToast('O nível Spoiler está em staging e será habilitado para salvamento após o próximo deploy consolidado.','warning',6000);
    return;
  }

  var button = el('sessionSaveBtn');
  button.disabled = true;
  button.textContent = 'Salvando…';

  var sessionPayload = {
    id:currentId,
    title:title,
    realDate:el('sessionRealDate').value,
    inWorldDate:el('sessionWorldDate').value.trim(),
    summary:el('sessionSummary').value.trim(),
    characters:splitComma(el('sessionCharacters').value),
    locations:splitComma(el('sessionLocations').value),
    consequences:splitLines(el('sessionConsequences').value),
    visibility:selectedVisibility
  };

  try {
    var wasEditing = !!currentId;
    var result = await b.request('/api/session',{
      method:'POST',
      body:{session:sessionPayload}
    });

    var manager = window.TerraZApp && window.TerraZApp.sessions;
    if(manager && manager.upsert && result.session) manager.upsert(result.session);

    close();
    showToast(
      wasEditing ? 'Sessão atualizada com sucesso.' : 'Sessão registrada com sucesso.',
      'success',
      4500
    );

    var runtime = window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh) runtime.refresh({force:true,bust:result.sha,silent:true});

    var publishing = window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url){
      publishing.trackDeployment(result.status_url);
    }
  } catch(err){
    console.error(err);
    showToast(err.message || 'Falha ao registrar sessão','error',6000);
  } finally {
    button.disabled = false;
    button.textContent = currentId ? '💾 Atualizar sessão' : '💾 Registrar sessão';
  }
}

function requestDelete(){
  if(!currentId) return;

  var manager = window.TerraZApp && window.TerraZApp.sessions;
  var all = manager && manager.getAll ? manager.getAll() : [];
  var session = all.find(function(item){ return item && item.id === currentId; });
  var title = session && session.title ? session.title : 'esta sessão';

  showConfirm(
    'Apagar sessão',
    'Apagar "' + title + '" do Diário da Campanha? Esta ação remove o registro da sessão, mas não apaga automaticamente personagens, locais ou outros conteúdos citados nela.',
    performDelete,
    'Apagar sessão'
  );
}

async function performDelete(){
  if(!currentId) return;

  var b = backend();
  if(!b || !b.isAuthenticated()){
    close();
    showToast('Sua sessão de editor expirou.','warning');
    return;
  }

  var id = currentId;
  var deleteBtn = el('sessionDeleteBtn');
  var saveBtn = el('sessionSaveBtn');

  if(deleteBtn){
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Apagando…';
  }
  if(saveBtn) saveBtn.disabled = true;

  try {
    var result = await b.request('/api/session',{
      method:'DELETE',
      body:{session:{id:id}}
    });

    var manager = window.TerraZApp && window.TerraZApp.sessions;
    if(manager && manager.remove) manager.remove(result.deleted || id);

    close();
    showToast('Sessão apagada com sucesso.','success',4500);

    var runtime = window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh) runtime.refresh({force:true,bust:result.sha,silent:true});

    var publishing = window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url){
      publishing.trackDeployment(result.status_url);
    }
  } catch(error){
    console.error('Terra Z session delete:',error);
    showToast(error.message || 'Falha ao apagar a sessão.','error',6000);
  } finally {
    if(deleteBtn){
      deleteBtn.disabled = false;
      deleteBtn.textContent = '🗑️ Apagar sessão';
    }
    if(saveBtn) saveBtn.disabled = false;
  }
}

function setup(){
  var openBtn = el('addSessionBtn');
  var closeBtn = el('sessionEditorClose');
  var cancelBtn = el('sessionCancelBtn');
  var saveBtn = el('sessionSaveBtn');
  var deleteBtn = el('sessionDeleteBtn');
  var panel = el('sessionEditorPanel');

  if(openBtn) openBtn.addEventListener('click',function(){ open(''); });
  if(closeBtn) closeBtn.addEventListener('click',close);
  if(cancelBtn) cancelBtn.addEventListener('click',close);
  if(saveBtn) saveBtn.addEventListener('click',save);
  if(deleteBtn) deleteBtn.addEventListener('click',requestDelete);
  if(panel) panel.addEventListener('click',function(e){ if(e.target === panel) close(); });

  document.addEventListener('terra-z:auth-changed',function(){
    visibilityCapability=null;
    refresh();
  });
  refresh();
}

setup();

window.TerraZApp.sessionEditor = {
  open:open,
  openDraft:openDraft,
  close:close,
  refresh:refresh,
  deleteSession:requestDelete
};

})();