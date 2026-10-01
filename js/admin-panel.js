(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/admin-panel.js');

var showToast = core.showToast;
var showConfirm = core.showConfirm;

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }

function isAuthenticated(){
  var b = backend();
  return !!(b && b.isConfigured && b.isConfigured() && b.isAuthenticated && b.isAuthenticated());
}

function setLoginStatus(message,state){
  var node = el('adminLoginStatus');
  if(!node) return;
  node.textContent = message || '';
  node.setAttribute('data-state',state || 'idle');
}

function pendingCount(){
  var editor = window.TerraZApp && window.TerraZApp.editor;
  if(!editor || !editor.getPendingChanges) return 0;
  return Object.keys(editor.getPendingChanges() || {}).length;
}

function characterCount(){
  var characters = window.TerraZApp && window.TerraZApp.characters;
  return characters && characters.names ? characters.names().length : 0;
}

function sessionCount(){
  var sessions = window.TerraZApp && window.TerraZApp.sessions;
  return sessions && sessions.count ? sessions.count() : 0;
}

function refresh(){
  var authenticated = isAuthenticated();
  var loggedOut = el('adminLoggedOut');
  var loggedIn = el('adminLoggedIn');

  if(loggedOut) loggedOut.hidden = authenticated;
  if(loggedIn) loggedIn.hidden = !authenticated;

  var backendStatus = el('adminBackendStatus');
  if(backendStatus){
    var b = backend();
    backendStatus.textContent = b && b.isConfigured && b.isConfigured()
      ? (authenticated ? 'Conectado' : 'Pronto')
      : 'Indisponível';
  }

  var pending = pendingCount();
  var pendingNode = el('adminPendingCount');
  if(pendingNode) pendingNode.textContent = String(pending);

  var charactersNode = el('adminCharacterCount');
  if(charactersNode) charactersNode.textContent = String(characterCount());

  var sessionsNode = el('adminSessionCount');
  if(sessionsNode) sessionsNode.textContent = String(sessionCount());

  var hint = el('adminPublishHint');
  if(hint){
    hint.textContent = pending
      ? pending + (pending === 1 ? ' alteração pendente para publicar.' : ' alterações pendentes para publicar.')
      : 'Nenhuma alteração de texto pendente.';
  }

  var editAction = document.querySelector('[data-admin-action="edit"] strong');
  var editor = window.TerraZApp && window.TerraZApp.editor;
  if(editAction && editor && editor.isEditing){
    editAction.textContent = editor.isEditing() ? 'Encerrar edição' : 'Editar conteúdo';
  }
}

function open(){
  var panel = el('adminPanel');
  if(panel) panel.classList.add('show');
  document.body.style.overflow = 'hidden';
  setLoginStatus('','idle');
  refresh();

  if(!isAuthenticated()){
    setTimeout(function(){
      var input = el('adminPassword');
      if(input) input.focus();
    },50);
  }
}

function close(){
  var panel = el('adminPanel');
  if(panel) panel.classList.remove('show');
  document.body.style.overflow = '';
}

async function login(){
  var b = backend();
  var input = el('adminPassword');
  var button = el('adminLoginBtn');

  if(!b || !b.isConfigured()){
    setLoginStatus('Backend de administração indisponível.','error');
    return;
  }

  var password = input ? input.value : '';
  if(!password){
    setLoginStatus('Informe a senha do editor.','warning');
    if(input) input.focus();
    return;
  }

  if(button) button.disabled = true;
  setLoginStatus('Entrando…','working');

  try {
    await b.login(password);
    if(input) input.value = '';
    setLoginStatus('','idle');
    refresh();
    showToast('Editor autenticado.','success',3500);
  } catch(error){
    console.error('Terra Z admin login:',error);
    setLoginStatus(error.message || 'Falha ao entrar.','error');
  } finally {
    if(button) button.disabled = false;
  }
}

function logout(){
  var b = backend();
  if(b && b.logout) b.logout();
  refresh();
  showToast('Sessão de editor encerrada.','info',3200);
}

function requireEditorAction(fn){
  if(!isAuthenticated()){
    showToast('Entre como editor para usar esta ferramenta.','warning',4500);
    refresh();
    return;
  }
  fn();
}

function openCharacters(){
  close();

  var tab = document.querySelector('.tab-btn[data-tab="tab-terraz"]');
  if(tab) tab.click();

  setTimeout(function(){
    var sub = document.querySelector('#tab-terraz .sidebar-item[data-sub="sub-tz-personagens"]');
    if(sub) sub.click();
    var target = document.getElementById('sub-tz-personagens');
    if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
  },80);
}

function handleAction(action){
  var app = window.TerraZApp || {};

  if(action === 'edit'){
    requireEditorAction(function(){
      if(app.editor && app.editor.toggle){
        app.editor.toggle();
        refresh();
        close();
      }
    });
    return;
  }

  if(action === 'draft'){
    requireEditorAction(function(){
      if(app.editor && app.editor.save) app.editor.save();
      refresh();
    });
    return;
  }

  if(action === 'publish'){
    requireEditorAction(function(){
      close();
      if(app.publishing && app.publishing.open) app.publishing.open();
    });
    return;
  }

  if(action === 'master'){
    requireEditorAction(function(){
      close();
      if(app.masterWorkspace && app.masterWorkspace.open) app.masterWorkspace.open();
    });
    return;
  }

  if(action === 'new-character'){
    requireEditorAction(function(){
      close();
      if(app.characterEditor && app.characterEditor.openCreate) app.characterEditor.openCreate();
    });
    return;
  }

  if(action === 'new-session'){
    requireEditorAction(function(){
      close();
      if(app.sessionEditor && app.sessionEditor.open) app.sessionEditor.open('');
    });
    return;
  }

  if(action === 'graph'){
    requireEditorAction(function(){
      close();
      if(app.graph && app.graph.openEditor) app.graph.openEditor();
    });
    return;
  }

  if(action === 'characters'){
    openCharacters();
    return;
  }

  if(action === 'taxonomy'){
    requireEditorAction(function(){
      close();
      if(app.taxonomyManager && app.taxonomyManager.open) app.taxonomyManager.open();
    });
    return;
  }

  if(action === 'integrity'){
    requireEditorAction(function(){
      close();
      if(app.integrityChecker && app.integrityChecker.open) app.integrityChecker.open();
    });
    return;
  }

  if(action === 'privacy-migrate'){
    requireEditorAction(async function(){
      var b = backend();

      try{
        var health = await b.health();
        if(!health || health.private_character_profiles !== true){
          showToast('A migração criptografada será ativada no próximo deploy consolidado do backend.','info',6000);
          return;
        }

        showConfirm(
          'Migrar personagens privados',
          'Mover agora todas as fichas marcadas “Somente editor” para o armazenamento criptografado? Elas deixarão de existir nos arquivos públicos e continuarão disponíveis após o login.',
          async function(){
            try{
              var result = await b.request('/api/character',{
                method:'POST',
                body:{action:'migrate-private-characters'}
              });

              var count = Array.isArray(result.migrated) ? result.migrated.length : 0;

              if(app.runtimeData && app.runtimeData.refresh){
                await app.runtimeData.refresh({force:true,bust:result.sha || Date.now(),silent:true});
              }
              if(app.privateContent && app.privateContent.reload){
                await app.privateContent.reload();
              }

              showToast(
                count
                  ? count + (count === 1 ? ' personagem migrado para o cofre criptografado.' : ' personagens migrados para o cofre criptografado.')
                  : 'Nenhum personagem aguardava migração.',
                'success',
                6000
              );
              refresh();
            }catch(error){
              console.error('Terra Z privacy migration:',error);
              showToast(error.message || 'Não foi possível migrar as fichas privadas.','error',6500);
            }
          },
          'Migrar agora'
        );
      }catch(error){
        console.error('Terra Z privacy capability:',error);
        showToast('Não foi possível verificar a capacidade de privacidade do backend.','warning',5500);
      }
    });
    return;
  }

  if(action === 'backup'){
    requireEditorAction(function(){
      if(app.editor && app.editor.exportEdits) app.editor.exportEdits();
    });
    return;
  }

  if(action === 'import'){
    requireEditorAction(function(){
      if(app.editor && app.editor.importEdits) app.editor.importEdits();
    });
    return;
  }

  if(action === 'export-html'){
    requireEditorAction(function(){
      if(app.editor && app.editor.exportHtml) app.editor.exportHtml();
    });
    return;
  }

  if(action === 'reset'){
    requireEditorAction(function(){
      if(app.editor && app.editor.reset) app.editor.reset();
    });
  }
}

function setup(){
  var openBtn = el('adminPanelBtn');
  var closeBtn = el('adminCloseBtn');
  var panel = el('adminPanel');
  var loginBtn = el('adminLoginBtn');
  var logoutBtn = el('adminLogoutBtn');
  var password = el('adminPassword');

  if(openBtn) openBtn.addEventListener('click',open);
  if(closeBtn) closeBtn.addEventListener('click',close);
  if(loginBtn) loginBtn.addEventListener('click',login);
  if(logoutBtn) logoutBtn.addEventListener('click',logout);

  if(password){
    password.addEventListener('keydown',function(event){
      if(event.key === 'Enter') login();
    });
  }

  if(panel){
    panel.addEventListener('click',function(event){
      if(event.target === panel){
        close();
        return;
      }

      var action = event.target.closest('[data-admin-action]');
      if(action){
        handleAction(action.getAttribute('data-admin-action'));
      }
    });
  }

  document.addEventListener('keydown',function(event){
    if(event.key === 'Escape' && panel && panel.classList.contains('show')){
      close();
    }
  });

  [
    'terra-z:auth-changed',
    'terra-z:edits-changed',
    'terra-z:runtime-data-loaded',
    'terra-z:characters-rendered',
    'terra-z:private-content-loaded'
  ].forEach(function(name){
    document.addEventListener(name,refresh);
  });

  document.addEventListener('DOMContentLoaded',refresh);
  refresh();
}

setup();

window.TerraZApp.adminPanel = {
  open:open,
  close:close,
  refresh:refresh
};

})();