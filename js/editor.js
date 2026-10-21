(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/editor.js');

var showToast = core.showToast;
var showConfirm = core.showConfirm;

/* ===== MODO EDIÇÃO ===== */
var editMode = false;
var publishedBaseline = {};
var EDITS_KEY = 'terraZ_v1_edits';
var EDITS_LEGACY_BACKUP_KEY = 'terraZ_v1_edits_legacy_backup';
var EDITS_DRAFT_FORMAT = 'terra-z-edit-draft';
var EDITS_DRAFT_VERSION = 2;
var EDITS_BACKUP_FORMAT = 'terra-z-edits';
var EDITS_BACKUP_VERSION = 2;
var SEL = 'h1,h2,h3,h4,h5,h6,p,td,th,li,.timeline-year,.timeline-text,.card p,.info-box,.stat-num,.stat-label,.mast-subtitle,.home-hero .lead,.pull-quote,.event-item .title,.event-item .desc,.photo figcaption,.fc-value,.fc-desc';

function getAll(){
  // Somente conteúdo com ID permanente participa do editor/publicação.
  // Elementos da interface (modais, títulos de confirmação etc.) não podem
  // virar alterações pendentes por mudarem durante o uso do site.
  return document.querySelectorAll('.container [data-edit-id]');
}

function initEditables(){
  // Os IDs editáveis são definidos no HTML ou pela camada de dados canônica.
  // IDs gerados em runtime não são estáveis entre recargas e não devem ser publicados.
}

function toggleEdit(){
  initEditables();
  editMode = !editMode;
  getAll().forEach(function(el){
    if(editMode){ el.contentEditable = 'true'; el.classList.add('edit-active'); }
    else { el.contentEditable = 'false'; el.classList.remove('edit-active'); }
  });
  var btn = document.getElementById('editBtn');
  btn.textContent = editMode ? '✅ Finalizar' : '✏️ Editar';
  btn.classList.toggle('active', editMode);
  document.getElementById('editNotice').classList.toggle('show', editMode);
  if(editMode) showToast('Modo de edição ativado', 'info');
  else { saveEdits(true); showToast('Edições salvas automaticamente', 'success'); }
}

function captureCurrentEdits(){
  initEditables();
  var data = {};
  getAll().forEach(function(el){ data[el.dataset.editId] = el.innerHTML; });
  return data;
}

function applyPublishedOverrides(){
  var data = (window.TerraZData && window.TerraZData.contentOverrides) || {};
  initEditables();

  getAll().forEach(function(el){
    var id = el.dataset.editId;
    if(data[id] !== undefined) el.innerHTML = data[id];
  });

  publishedBaseline = captureCurrentEdits();
}

function syncRuntimeOverrides(){
  var data = (window.TerraZData && window.TerraZData.contentOverrides) || {};
  var current = captureCurrentEdits();

  getAll().forEach(function(el){
    var id = el.dataset.editId;
    var hadLocalDraft = publishedBaseline[id] !== undefined && current[id] !== publishedBaseline[id];

    if(!hadLocalDraft && data[id] !== undefined){
      el.innerHTML = data[id];
    }

    if(data[id] !== undefined){
      publishedBaseline[id] = data[id];
    }
  });

  notifyEditsChanged();
}

function getPendingChanges(){
  var current = captureCurrentEdits();
  var pending = {};

  Object.keys(current).forEach(function(id){
    if(publishedBaseline[id] !== current[id]) pending[id] = current[id];
  });

  return pending;
}

function getPublishedBaseline(ids){
  var out = {};
  (ids || Object.keys(publishedBaseline)).forEach(function(id){
    if(publishedBaseline[id] !== undefined) out[id] = publishedBaseline[id];
  });
  return out;
}

function draftPayload(changes){
  changes = changes || getPendingChanges();
  var ids = Object.keys(changes);
  return {
    format:EDITS_DRAFT_FORMAT,
    version:EDITS_DRAFT_VERSION,
    createdAt:new Date().toISOString(),
    base:getPublishedBaseline(ids),
    changes:changes
  };
}

function writePendingDraft(){
  var changes = getPendingChanges();
  try {
    if(Object.keys(changes).length){
      localStorage.setItem(EDITS_KEY, JSON.stringify(draftPayload(changes)));
    }else{
      localStorage.removeItem(EDITS_KEY);
    }
  } catch(e){ console.error(e); }
  return changes;
}

function notifyEditsChanged(){
  document.dispatchEvent(new CustomEvent('terra-z:edits-changed', {
    detail: { count:Object.keys(getPendingChanges()).length }
  }));
}

function markPublished(changes){
  changes = changes || {};
  Object.keys(changes).forEach(function(id){ publishedBaseline[id] = changes[id]; });
  var remaining = writePendingDraft();
  notifyEditsChanged();
  return Object.keys(remaining).length;
}

function saveEdits(silent){
  try {
    var changes = writePendingDraft();
    if(!silent){
      showToast(
        Object.keys(changes).length ? 'Rascunho salvo neste navegador' : 'Nenhuma alteração pendente',
        Object.keys(changes).length ? 'success' : 'info'
      );
    }
    notifyEditsChanged();
  } catch(e){ showToast('Erro ao salvar: ' + e.message, 'error'); }
}

function loadEdits(){
  var raw = localStorage.getItem(EDITS_KEY);
  if(!raw) return;

  try {
    var stored = JSON.parse(raw);
    initEditables();

    if(stored && stored.format===EDITS_DRAFT_FORMAT && stored.version===EDITS_DRAFT_VERSION){
      var changes = stored.changes && typeof stored.changes==='object' ? stored.changes : {};
      var base = stored.base && typeof stored.base==='object' ? stored.base : {};
      var applied=0,conflicts=0;

      getAll().forEach(function(el){
        var id=el.dataset.editId;
        if(changes[id]===undefined) return;

        // O rascunho só é reaplicado quando o conteúdo publicado ainda é o mesmo
        // que existia quando a edição local foi salva. Isso impede que snapshots
        // antigos ressuscitem conteúdo já atualizado no GitHub.
        if(base[id] !== undefined && publishedBaseline[id] !== base[id]){
          conflicts++;
          return;
        }

        el.innerHTML=changes[id];
        applied++;
      });

      if(conflicts){
        localStorage.setItem(EDITS_LEGACY_BACKUP_KEY, raw);
        localStorage.removeItem(EDITS_KEY);
        showToast(
          conflicts+' edição'+(conflicts===1?' local antiga foi preservada':' edições locais antigas foram preservadas')+
          ' como backup e não sobrescreveu conteúdo mais novo.',
          'warning',
          6000
        );
      }else if(applied){
        // Regrava somente diferenças reais contra a baseline publicada atual.
        writePendingDraft();
      }

      notifyEditsChanged();
      return;
    }

    // Formato legado: era um snapshot completo da página, sem baseline por campo.
    // Reaplicá-lo automaticamente pode reverter conteúdo publicado meses depois.
    if(stored && typeof stored==='object' && !Array.isArray(stored)){
      localStorage.setItem(EDITS_LEGACY_BACKUP_KEY, raw);
      localStorage.removeItem(EDITS_KEY);
      showToast(
        'Um rascunho antigo foi preservado como backup, mas não foi reaplicado automaticamente para evitar substituir conteúdo mais novo.',
        'info',
        6000
      );
      notifyEditsChanged();
      return;
    }

    localStorage.removeItem(EDITS_KEY);
  } catch(e){
    console.error(e);
    try{
      localStorage.setItem(EDITS_LEGACY_BACKUP_KEY, raw);
      localStorage.removeItem(EDITS_KEY);
    }catch(storageError){}
  }
}

function exportHtml(){
  saveEdits(true);
  var docClone = document.documentElement.cloneNode(true);
  var origEls = document.querySelectorAll('.container ' + SEL);
  var cloneEls = docClone.querySelectorAll('.container ' + SEL);

  // Consolida no clone o conteúdo atualmente editado, mas remove estado de edição.
  origEls.forEach(function(el, idx){ if(cloneEls[idx]) cloneEls[idx].innerHTML = el.innerHTML; });
  cloneEls.forEach(function(el){
    el.classList.remove('edit-active');
    el.removeAttribute('contenteditable');  });

  // O HTML exportado deve abrir em um estado neutro, independentemente do que
  // estava aberto no momento da exportação.
  var cloneBody = docClone.querySelector('body');
  if(cloneBody){
    cloneBody.classList.remove('reading-mode', 'sidebar-collapsed');
    cloneBody.style.overflow = '';
  }

  var globalSidebarClone = docClone.querySelector('#globalSidebar');
  if(globalSidebarClone) globalSidebarClone.classList.remove('collapsed');
  docClone.querySelectorAll('.sidebar.open').forEach(function(el){ el.classList.remove('open'); });

  ['searchPanel','fandomModal','fichaModal','confirmModal','lightbox','presentationModal','favoritesPanel','graphEditorModal','drawerOverlay','editNotice'].forEach(function(id){
    var el = docClone.querySelector('#' + id);
    if(el) el.classList.remove('show');
  });

  // Remove conteúdo gerado em runtime que perderia seus listeners ao ser
  // serializado. Na próxima abertura, a inicialização normal reconstrói tudo.
  docClone.querySelectorAll('.fav-btn').forEach(function(el){ el.remove(); });

  var favoritesPanelClone = docClone.querySelector('#favoritesPanel');
  if(favoritesPanelClone) favoritesPanelClone.innerHTML = '';

  var globalSidebarContent = docClone.querySelector('#globalSidebar');
  if(globalSidebarContent) globalSidebarContent.innerHTML = '';

  var toastContainerClone = docClone.querySelector('#toastContainer');
  if(toastContainerClone) toastContainerClone.innerHTML = '';

  var searchResultsClone = docClone.querySelector('#searchResults');
  if(searchResultsClone) searchResultsClone.innerHTML = '';
  var searchInfoClone = docClone.querySelector('#searchInfo');
  if(searchInfoClone) searchInfoClone.textContent = 'Digite ao menos 2 caracteres';

  var modalBodyClone = docClone.querySelector('#modalBody');
  if(modalBodyClone) modalBodyClone.innerHTML = '';
  var modalTitleClone = docClone.querySelector('#modalTitle');
  if(modalTitleClone) modalTitleClone.textContent = 'Título';
  var modalSourceClone = docClone.querySelector('#modalSource');
  if(modalSourceClone) modalSourceClone.textContent = '📚 dc.fandom.com';
  var modalBackClone = docClone.querySelector('#modalBackBtn');
  if(modalBackClone){
    modalBackClone.style.display = 'none';
    modalBackClone.textContent = '← Voltar';
  }
  var modalExternalClone = docClone.querySelector('#modalExternal');
  if(modalExternalClone) modalExternalClone.setAttribute('href', '#');

  var fichaHeaderClone = docClone.querySelector('#fichaHeader');
  if(fichaHeaderClone) fichaHeaderClone.innerHTML = '';
  var fichaBodyClone = docClone.querySelector('#fichaBody');
  if(fichaBodyClone) fichaBodyClone.innerHTML = '';

  var presInnerClone = docClone.querySelector('#presentationModal .pres-inner');
  if(presInnerClone) presInnerClone.innerHTML = '';
  var presCounterClone = docClone.querySelector('#presentationModal .pres-counter');
  if(presCounterClone) presCounterClone.textContent = '1 / 1';

  var geNodesClone = docClone.querySelector('#geNodesBody');
  if(geNodesClone) geNodesClone.innerHTML = '';
  var geEdgesClone = docClone.querySelector('#geEdgesBody');
  if(geEdgesClone) geEdgesClone.innerHTML = '';

  var lightboxImgClone = docClone.querySelector('#lightboxImg');
  if(lightboxImgClone) lightboxImgClone.setAttribute('src', '');

  var editBtnClone = docClone.querySelector('#editBtn');
  if(editBtnClone){
    editBtnClone.classList.remove('active');
    editBtnClone.textContent = '✏️ Editar';
  }

  // Destaques de busca são apenas estado visual temporário.
  docClone.querySelectorAll('mark.search-hit').forEach(function(mark){
    var parent = mark.parentNode;
    if(!parent) return;
    while(mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });

  var html = '<!DOCTYPE html>\n' + docClone.outerHTML;
  var blob = new Blob([html], {type:'text/html;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'index.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('HTML exportado como "index.html"', 'success', 4500);
}

function isValidEditsMap(data){
  if(!data || typeof data !== 'object' || Array.isArray(data)) return false;
  var keys = Object.keys(data);
  if(keys.length === 0) return true;

  return keys.every(function(key){
    var validKey = /^(?:tz-\d{4}|tz-runtime-\d{4}|e_\d+)$/.test(key);
    return validKey && typeof data[key] === 'string';
  });
}

function parseEditsBackup(raw){
  var parsed = JSON.parse(raw);

  // Formato atual, versionado.
  if(parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.format !== undefined){
    if(parsed.format !== EDITS_BACKUP_FORMAT) throw new Error('Formato de backup não reconhecido.');
    if(parsed.version !== EDITS_BACKUP_VERSION) throw new Error('Versão de backup não suportada.');
    if(!isValidEditsMap(parsed.edits)) throw new Error('Conteúdo de edições inválido.');
    return parsed.edits;
  }

  // Compatibilidade com backups antigos, que continham diretamente o mapa de edições.
  if(isValidEditsMap(parsed)) return parsed;

  throw new Error('Estrutura do backup inválida.');
}

function exportEdits(){
  saveEdits(true);
  var edits = getPendingChanges();
  if(!Object.keys(edits).length){ showToast('Nada para exportar', 'warning'); return; }

  try {
    if(!isValidEditsMap(edits)) throw new Error('As edições salvas estão em formato inválido.');

    var payload = {
      format: EDITS_BACKUP_FORMAT,
      version: EDITS_BACKUP_VERSION,
      createdAt: new Date().toISOString(),
      edits: edits
    };

    var blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'terra-z-backup-' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup JSON exportado', 'success');
  } catch(err){
    showToast('Erro ao exportar backup: ' + err.message, 'error');
  }
}

function importEdits(){
  var inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.json,application/json';

  inp.onchange = function(e){
    var f = e.target.files[0];
    if(!f) return;

    // Evita carregar arquivos evidentemente inadequados antes mesmo do parse.
    if(f.size > 5 * 1024 * 1024){
      showToast('Backup muito grande. Limite: 5 MB.', 'error');
      return;
    }

    var r = new FileReader();
    r.onload = function(ev){
      try {
        var edits = parseEditsBackup(ev.target.result);
        localStorage.setItem(EDITS_KEY, JSON.stringify(draftPayload(edits)));
        showToast('Backup validado e importado! Recarregando...', 'success');
        setTimeout(function(){ location.reload(); }, 1200);
      } catch(err){
        showToast('Backup inválido: ' + err.message, 'error', 5000);
      }
    };
    r.onerror = function(){ showToast('Não foi possível ler o arquivo de backup.', 'error'); };
    r.readAsText(f);
  };

  inp.click();
}

function resetEdits(){
  showConfirm('Confirmar Reset', 'Todas as edições salvas serão apagadas. Deseja continuar?', function(){
    localStorage.removeItem(EDITS_KEY);
    showToast('Edições apagadas. Recarregando...', 'info');
    setTimeout(function(){ location.reload(); }, 1000);
  }, 'Resetar');
}

var AUTO_BACKUP_KEY = 'terraZ_v1_backups';
function autoBackup(){
  var current = localStorage.getItem(EDITS_KEY);
  if(!current) return;
  try {
    var backups = JSON.parse(localStorage.getItem(AUTO_BACKUP_KEY) || '[]');
    backups.unshift({ timestamp: Date.now(), data: current });
    if(backups.length > 5) backups = backups.slice(0, 5);
    localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(backups));
    showToast('Backup automático criado', 'info', 2500);
  } catch(e){ console.error(e); }
}
setInterval(function(){ if(editMode) autoBackup(); }, 5 * 60 * 1000);



initEditables();
applyPublishedOverrides();
loadEdits();
notifyEditsChanged();

document.addEventListener('terra-z:runtime-data-loaded',syncRuntimeOverrides);

window.toggleEdit = toggleEdit;
window.saveEdits = saveEdits;
window.exportEdits = exportEdits;
window.exportHtml = exportHtml;
window.importEdits = importEdits;
window.resetEdits = resetEdits;

window.TerraZApp.editor = {
  isEditing: function(){ return editMode; },
  toggle: toggleEdit,
  save: saveEdits,
  exportEdits: exportEdits,
  exportHtml: exportHtml,
  importEdits: importEdits,
  reset: resetEdits,
  getCurrentEdits: captureCurrentEdits,
  getPendingChanges: getPendingChanges,
  getPublishedBaseline: getPublishedBaseline,
  markPublished: markPublished,
  syncRuntime: syncRuntimeOverrides,
  refreshPending: notifyEditsChanged
};

})();
