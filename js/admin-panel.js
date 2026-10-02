(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/admin-panel.js');

var showToast = core.showToast;
var showConfirm = core.showConfirm;
var escapeHtml = core.escapeHtml;

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

function privateCount(){
  var privateContent = window.TerraZApp && window.TerraZApp.privateContent;
  if(!privateContent || !privateContent.isLoaded || !privateContent.isLoaded()) return null;
  if(!privateContent.getPrivateCharacterNames) return null;
  return privateContent.getPrivateCharacterNames().length;
}

var dashboardHealth = null;
var dashboardOverview = null;
var dashboardBusy = false;

function shortSha(value){
  return String(value || '').slice(0,7) || '—';
}

function formatDashboardDate(value){
  if(!value) return 'data indisponível';
  try {
    return new Intl.DateTimeFormat('pt-BR',{
      dateStyle:'short',
      timeStyle:'short'
    }).format(new Date(value));
  } catch(error){
    return String(value);
  }
}

function setDashboardCard(id,state,title,note){
  var card = el(id);
  if(card) card.setAttribute('data-state',state || 'unknown');
  var stateNode = card && card.querySelector('strong');
  var noteNode = card && card.querySelector('small');
  if(stateNode) stateNode.textContent = title || '—';
  if(noteNode) noteNode.textContent = note || '';
}

function renderDashboard(){
  var status = el('adminDashboardStatus');
  if(!status) return;

  var health = dashboardHealth;
  var overview = dashboardOverview;
  var alerts = [];
  var pending = pendingCount();

  if(!health && !overview){
    status.textContent = dashboardBusy ? 'Verificando continuidade do projeto…' : 'Dados de continuidade ainda não carregados.';
    status.setAttribute('data-state',dashboardBusy ? 'working' : 'idle');
    return;
  }

  if(health){
    var systemOk = health.ok === true && health.editor_auth === true && health.github_write === true;
    setDashboardCard(
      'adminContinuityCard',
      systemOk ? 'ok' : 'warning',
      systemOk ? 'Operacional' : 'Revisar',
      systemOk
        ? 'Backend autenticado e escrita no GitHub disponíveis.'
        : 'Uma ou mais capacidades essenciais do backend precisam de atenção.'
    );

    var privacyOk = health.master_content === 'ready' &&
      health.private_character_encryption === 'aes-256-gcm' &&
      health.secure_master_sections === true &&
      health.secure_master_relations === true;

    setDashboardCard(
      'adminPrivacyCard',
      privacyOk ? 'ok' : 'warning',
      privacyOk ? 'Protegido' : 'Revisar',
      privacyOk
        ? 'Mestre em AES-256-GCM; fichas, seções e relações privadas suportadas.'
        : 'O armazenamento Mestre ou a criptografia não estão completamente prontos.'
    );

    if(health.editor_auth !== true) alerts.push({level:'critical',text:'Autenticação do editor não está pronta no backend.'});
    if(health.github_write !== true) alerts.push({level:'critical',text:'Backend sem permissão de escrita no GitHub.'});
    if(health.master_content !== 'ready') alerts.push({level:'critical',text:'Conteúdo Mestre não está marcado como pronto.'});
    if(health.private_character_encryption !== 'aes-256-gcm') alerts.push({level:'critical',text:'Criptografia privada não está em AES-256-GCM.'});
    if(health.production_update_from_site !== true) alerts.push({level:'warning',text:'Publicação de produção pelo próprio Terra Z não foi confirmada.'});
  }else{
    setDashboardCard('adminContinuityCard','warning','Indisponível','Não foi possível consultar /api/health.');
    setDashboardCard('adminPrivacyCard','warning','Indeterminado','Privacidade não pôde ser validada agora.');
    alerts.push({level:'warning',text:'A verificação de saúde do backend falhou.'});
  }

  if(overview){
    var sync = overview.sync || {};
    var syncState = String(sync.state || 'unknown');
    var ahead = Number(sync.ahead_by || 0);

    if(syncState === 'synced'){
      setDashboardCard('adminProductionCard','ok','Sincronizada','GitHub main e Vercel estão no mesmo checkpoint.');
    }else if(syncState === 'development'){
      setDashboardCard(
        'adminProductionCard',
        'warning',
        ahead + ' commit' + (ahead === 1 ? '' : 's') + ' à frente',
        'Há desenvolvimento no main que ainda não foi publicado em produção.'
      );
      alerts.push({
        level:'info',
        text:ahead + ' commit' + (ahead === 1 ? '' : 's') + ' no main aguardando checkpoint de produção.'
      });
    }else if(syncState === 'diverged'){
      setDashboardCard('adminProductionCard','critical','Divergente','Main e produção não estão na mesma linha direta de histórico.');
      alerts.push({level:'critical',text:'GitHub main e produção estão divergentes.'});
    }else{
      setDashboardCard('adminProductionCard','warning','Indeterminada','O SHA de produção não pôde ser comparado com o main.');
      alerts.push({level:'warning',text:'Estado de sincronização da produção está indeterminado.'});
    }

    if(overview.auto_deploy_paused === false){
      alerts.push({level:'warning',text:'Deploy automático do Git está habilitado; o fluxo seguro prevê publicação por checkpoint.'});
    }

    var history = Array.isArray(overview.history) ? overview.history : [];
    var checkpoint = history.find(function(row){ return row && row.is_checkpoint; });
    if(checkpoint){
      setDashboardCard(
        'adminCheckpointCard',
        checkpoint.is_production ? 'ok' : 'neutral',
        shortSha(checkpoint.sha),
        (checkpoint.is_production ? 'Em produção · ' : '') + formatDashboardDate(checkpoint.date)
      );
    }else{
      setDashboardCard('adminCheckpointCard','neutral','Nenhum','Nenhum checkpoint recente apareceu no histórico carregado.');
    }

    var recent = el('adminRecentChanges');
    if(recent){
      if(!history.length){
        recent.innerHTML = '<div class="admin-recent-empty">Nenhum commit recente carregado.</div>';
      }else{
        recent.innerHTML = history.slice(0,5).map(function(row){
          var badges = '';
          if(row.is_head) badges += '<span>MAIN</span>';
          if(row.is_production) badges += '<span>PRODUÇÃO</span>';
          if(row.is_checkpoint) badges += '<span>CHECKPOINT</span>';
          return '<article class="admin-recent-row">' +
            '<div class="admin-recent-top"><code>' + escapeHtml(shortSha(row.sha)) + '</code><div>' + badges + '</div></div>' +
            '<strong>' + escapeHtml(row.message || 'Commit sem mensagem') + '</strong>' +
            '<small>' + escapeHtml(formatDashboardDate(row.date)) + (row.author ? ' · ' + escapeHtml(row.author) : '') + '</small>' +
          '</article>';
        }).join('');
      }
    }
  }else{
    setDashboardCard('adminProductionCard','warning','Indisponível','Não foi possível carregar o estado de produção.');
    setDashboardCard('adminCheckpointCard','neutral','—','Histórico de checkpoints indisponível.');
    alerts.push({level:'warning',text:'Histórico Git e estado de produção não puderam ser carregados.'});
  }

  if(pending > 0){
    alerts.unshift({
      level:'warning',
      text:pending + (pending === 1 ? ' alteração local pendente de publicação.' : ' alterações locais pendentes de publicação.')
    });
  }

  var alertsRoot = el('adminDashboardAlerts');
  if(alertsRoot){
    if(!alerts.length){
      alertsRoot.innerHTML = '<li class="ok">Nenhum alerta crítico. O fluxo administrativo está pronto para uso.</li>';
    }else{
      alertsRoot.innerHTML = alerts.map(function(item){
        return '<li class="' + escapeHtml(item.level || 'neutral') + '">' + escapeHtml(item.text || '') + '</li>';
      }).join('');
    }
  }

  status.textContent = 'Continuidade verificada · ' + new Intl.DateTimeFormat('pt-BR',{
    hour:'2-digit',
    minute:'2-digit'
  }).format(new Date());
  status.setAttribute('data-state','success');
}

async function loadDashboard(){
  if(dashboardBusy || !isAuthenticated()) return;

  var b = backend();
  if(!b || !b.isConfigured || !b.isConfigured()) return;

  dashboardBusy = true;
  var refreshButton = el('adminDashboardRefresh');
  if(refreshButton) refreshButton.disabled = true;
  renderDashboard();

  try {
    var results = await Promise.all([
      b.health().then(function(value){ return {value:value}; }).catch(function(error){ return {error:error}; }),
      b.request('/api/publish?limit=8',{method:'GET'}).then(function(value){ return {value:value}; }).catch(function(error){ return {error:error}; })
    ]);

    dashboardHealth = results[0].value || null;
    dashboardOverview = results[1].value || null;

    if(results[0].error) console.warn('Terra Z dashboard health:',results[0].error);
    if(results[1].error) console.warn('Terra Z dashboard history:',results[1].error);
  } finally {
    dashboardBusy = false;
    if(refreshButton) refreshButton.disabled = false;
    renderDashboard();
  }
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

  var privateNode = el('adminPrivateCount');
  if(privateNode){
    var privateTotal = privateCount();
    privateNode.textContent = privateTotal === null ? '—' : String(privateTotal);
  }

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

  renderDashboard();
}

function open(){
  var panel = el('adminPanel');
  if(panel) panel.classList.add('show');
  document.body.style.overflow = 'hidden';
  setLoginStatus('','idle');
  refresh();

  if(isAuthenticated()) loadDashboard();

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
    loadDashboard();
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
  dashboardHealth = null;
  dashboardOverview = null;
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

  if(action === 'visibility'){
    requireEditorAction(async function(){
      close();
      if(app.privateContent && app.privateContent.load) await app.privateContent.load();
      if(app.sessions && app.sessions.reloadPrivate) await app.sessions.reloadPrivate();
      if(app.visibilityManager && app.visibilityManager.open) app.visibilityManager.open();
    });
    return;
  }

  if(action === 'media-library'){
    requireEditorAction(function(){
      close();
      if(app.mediaLibrary && app.mediaLibrary.open) app.mediaLibrary.open();
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

  if(action === 'bulk-edit'){
    requireEditorAction(async function(){
      close();
      if(app.privateContent && app.privateContent.load) await app.privateContent.load();
      if(app.bulkEditor && app.bulkEditor.open) app.bulkEditor.open();
    });
    return;
  }

  if(action === 'master-quick'){
    requireEditorAction(async function(){
      close();
      if(app.privateContent && app.privateContent.load) await app.privateContent.load();
      if(app.masterQuick && app.masterQuick.open) app.masterQuick.open();
    });
    return;
  }

  if(action === 'session-mode'){
    requireEditorAction(async function(){
      close();
      if(app.privateContent && app.privateContent.load) await app.privateContent.load();
      if(app.sessionMode && app.sessionMode.open) app.sessionMode.open();
    });
    return;
  }

  if(action === 'table-mode'){
    requireEditorAction(async function(){
      close();
      if(app.privateContent && app.privateContent.load && navigator.onLine) await app.privateContent.load();
      if(app.tableMode && app.tableMode.open) app.tableMode.open();
    });
    return;
  }

  if(action === 'backup-export'){
    requireEditorAction(function(){
      close();
      if(app.backupExport && app.backupExport.open) app.backupExport.open();
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

  if(action === 'history'){
    requireEditorAction(function(){
      close();
      if(app.historyManager && app.historyManager.open) app.historyManager.open();
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
  var dashboardRefresh = el('adminDashboardRefresh');
  var password = el('adminPassword');

  if(openBtn) openBtn.addEventListener('click',open);
  if(closeBtn) closeBtn.addEventListener('click',close);
  if(loginBtn) loginBtn.addEventListener('click',login);
  if(logoutBtn) logoutBtn.addEventListener('click',logout);
  if(dashboardRefresh) dashboardRefresh.addEventListener('click',loadDashboard);

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
  refresh:refresh,
  loadDashboard:loadDashboard
};

})();