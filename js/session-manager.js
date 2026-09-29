(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/session-manager.js');

var showToast = core.showToast;
var sessions = (window.TerraZData && window.TerraZData.sessions) || [];

function pub(){ return window.TerraZApp && window.TerraZApp.publishing; }
function byId(id){ return document.getElementById(id); }

function ensureModal(){
  var modal = byId('sessionEditorModal');
  if(modal) return modal;

  modal = document.createElement('div');
  modal.id = 'sessionEditorModal';
  modal.className = 'session-editor-modal';
  modal.innerHTML =
    '<div class="session-editor-card" role="dialog" aria-modal="true" aria-labelledby="sessionEditorTitle">' +
      '<div class="session-editor-head"><h3 id="sessionEditorTitle">📓 Sessão</h3><button id="sessionEditorClose">✕</button></div>' +
      '<input id="sessionId" type="hidden">' +
      '<label>Título<input id="sessionTitle" maxlength="160"></label>' +
      '<div class="session-editor-grid">' +
        '<label>Data real<input id="sessionRealDate" type="date"></label>' +
        '<label>Data no universo<input id="sessionWorldDate" maxlength="120" placeholder="Ex.: Janeiro de 2027"></label>' +
      '</div>' +
      '<label>Resumo<textarea id="sessionSummary" rows="4" maxlength="4000"></textarea></label>' +
      '<label>Personagens <span>separados por vírgula</span><input id="sessionCharacters" placeholder="Tristan Queen, Riot, M\'ark"></label>' +
      '<label>Locais <span>separados por vírgula</span><input id="sessionLocations" placeholder="O Dique, A Fenda"></label>' +
      '<label>Consequências <span>uma por linha</span><textarea id="sessionConsequences" rows="4"></textarea></label>' +
      '<label>Visibilidade<select id="sessionVisibility"><option value="public">Público</option><option value="rumor">Rumor</option><option value="restricted">Restrito</option><option value="master">Mestre</option></select></label>' +
      '<div id="sessionEditorStatus" class="publish-status" data-state="idle"></div>' +
      '<div class="session-editor-actions"><button id="sessionEditorCancel">Cancelar</button><button id="sessionEditorSave" class="primary">🚀 Publicar sessão</button></div>' +
    '</div>';
  document.body.appendChild(modal);

  byId('sessionEditorClose').addEventListener('click',close);
  byId('sessionEditorCancel').addEventListener('click',close);
  byId('sessionEditorSave').addEventListener('click',save);
  modal.addEventListener('click',function(e){ if(e.target === modal) close(); });
  return modal;
}

function splitComma(value){
  return String(value || '').split(',').map(x=>x.trim()).filter(Boolean);
}
function splitLines(value){
  return String(value || '').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
}

function fill(session){
  session = session || {};
  byId('sessionId').value = session.id || '';
  byId('sessionTitle').value = session.title || '';
  byId('sessionRealDate').value = session.realDate || '';
  byId('sessionWorldDate').value = session.inWorldDate || '';
  byId('sessionSummary').value = session.summary || '';
  byId('sessionCharacters').value = Array.isArray(session.characters) ? session.characters.join(', ') : '';
  byId('sessionLocations').value = Array.isArray(session.locations) ? session.locations.join(', ') : '';
  byId('sessionConsequences').value = Array.isArray(session.consequences) ? session.consequences.join('\n') : '';
  byId('sessionVisibility').value = session.visibility || 'public';
  byId('sessionEditorStatus').textContent = '';
}

function open(id){
  ensureModal();
  var session = id ? sessions.find(x=>x && x.id === id) : null;
  fill(session);
  byId('sessionEditorTitle').textContent = session ? '📓 Editar sessão' : '📓 Nova sessão';
  byId('sessionEditorModal').classList.add('show');
  document.body.style.overflow = 'hidden';
  setTimeout(function(){ byId('sessionTitle').focus(); },0);
}

function close(){
  var modal = byId('sessionEditorModal');
  if(modal) modal.classList.remove('show');
  document.body.style.overflow = '';
}

function payload(){
  return {
    schema:'terra-z-session-v1',
    session:{
      id:byId('sessionId').value.trim(),
      title:byId('sessionTitle').value.trim(),
      realDate:byId('sessionRealDate').value,
      inWorldDate:byId('sessionWorldDate').value.trim(),
      summary:byId('sessionSummary').value.trim(),
      characters:splitComma(byId('sessionCharacters').value),
      locations:splitComma(byId('sessionLocations').value),
      consequences:splitLines(byId('sessionConsequences').value),
      visibility:byId('sessionVisibility').value,
      links:[]
    }
  };
}

async function save(){
  var publishing = pub();
  var status = byId('sessionEditorStatus');

  if(!publishing || !publishing.isConfigured() || !publishing.apiUrl('sessions')){
    if(status){ status.textContent = 'Backend seguro ainda não conectado.'; status.dataset.state='setup'; }
    showToast('Publicação de sessões ainda não está conectada ao backend.','warning',5000);
    return;
  }

  var data = payload();
  if(!data.session.title){
    if(status){ status.textContent='Informe o título da sessão.'; status.dataset.state='error'; }
    return;
  }

  var btn = byId('sessionEditorSave');
  btn.disabled = true;
  if(status){ status.textContent='Criando commit…'; status.dataset.state='working'; }

  try {
    var response = await publishing.authenticatedFetch(publishing.apiUrl('sessions'), {
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(data)
    });
    var result = await response.json().catch(function(){return {};});
    if(response.status === 401 && publishing.clearEditorKey) publishing.clearEditorKey();
    if(!response.ok) throw new Error(result.message || ('Erro HTTP ' + response.status));

    if(status){ status.textContent='Commit criado. Aguardando deploy…'; status.dataset.state='working'; }
    var deployed = await publishing.waitForDeployment(result.status_url);
    if(deployed){
      showToast('Sessão publicada com sucesso.','success',3500);
      setTimeout(function(){ location.reload(); },900);
    }else{
      if(status){ status.textContent='Commit criado; deploy ainda processando.'; status.dataset.state='working'; }
      btn.disabled = false;
    }
  } catch(err){
    console.error('Terra Z session publish:',err);
    if(status){ status.textContent='Falha: ' + err.message; status.dataset.state='error'; }
    showToast('Erro ao publicar sessão: ' + err.message,'error',6000);
    btn.disabled = false;
  }
}

function setup(){
  ensureModal();
  var add = byId('sessionNewBtn');
  if(add) add.addEventListener('click',function(){ open(''); });

  var root = byId('campaignSessions');
  if(root){
    root.addEventListener('click',function(e){
      var btn = e.target.closest('[data-session-edit]');
      if(!btn) return;
      open(btn.getAttribute('data-session-edit'));
    });
  }
}

setup();

window.TerraZApp.sessionManager = { open:open, close:close, save:save };

})();
