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

function notifyEditsChanged(){
  document.dispatchEvent(new CustomEvent('terra-z:edits-changed', {
    detail: { count:Object.keys(getPendingChanges()).length }
  }));
}

function markPublished(changes){
  changes = changes || {};
  var current = captureCurrentEdits();

  Object.keys(changes).forEach(function(id){ publishedBaseline[id] = changes[id]; });

  var remaining = Object.keys(current).filter(function(id){
    return publishedBaseline[id] !== current[id];
  });

  try {
    if(remaining.length) localStorage.setItem(EDITS_KEY, JSON.stringify(current));
    else localStorage.removeItem(EDITS_KEY);
  } catch(e){ console.error(e); }

  notifyEditsChanged();
  return remaining.length;
}

function saveEdits(silent){
  var data = captureCurrentEdits();
  try {
    localStorage.setItem(EDITS_KEY, JSON.stringify(data));
    if(!silent) showToast('Rascunho salvo neste navegador', 'success');
    notifyEditsChanged();
  } catch(e){ showToast('Erro ao salvar: ' + e.message, 'error'); }
}

function loadEdits(){
  var s = localStorage.getItem(EDITS_KEY);
  if(!s) return;
  try {
    var data = JSON.parse(s);
    var migratedLegacy = false;
    initEditables();

    getAll().forEach(function(el){
      var stableId = el.dataset.editId;
      var legacyId = el.dataset.legacyEditId;

      if(data[stableId] !== undefined){
        el.innerHTML = data[stableId];
        return;
      }

      if(legacyId && data[legacyId] !== undefined){
        el.innerHTML = data[legacyId];
        migratedLegacy = true;
      }
    });

    if(migratedLegacy){
      var migratedData = {};
      getAll().forEach(function(el){ migratedData[el.dataset.editId] = el.innerHTML; });
      localStorage.setItem(EDITS_KEY, JSON.stringify(migratedData));
      showToast('Edições antigas migradas para o novo formato', 'info', 3500);
    }
    notifyEditsChanged();
  } catch(e){ console.error(e); }
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
  var s = localStorage.getItem(EDITS_KEY);
  if(!s){ showToast('Nada para exportar', 'warning'); return; }

  try {
    var edits = JSON.parse(s);
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
        localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
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
  refreshPending: notifyEditsChanged
};

})();
