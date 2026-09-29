(function(){
"use strict";

/* ===== NÚCLEO COMPARTILHADO ===== */
function showToast(msg, type, duration){
  type = type || 'info';
  duration = duration || 3000;
  var container = document.getElementById('toastContainer');
  if(!container) return;
  var icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span class="icon">' + (icons[type]||'ℹ️') + '</span><span class="msg">' + escapeHtml(msg) + '</span>';
  container.appendChild(toast);
  setTimeout(function(){
    toast.classList.add('leaving');
    setTimeout(function(){ if(toast.parentElement) toast.remove(); }, 300);
  }, duration);
}

function showConfirm(title, msg, onConfirm, confirmLabel){
  var modal = document.getElementById('confirmModal');
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = msg;
  document.getElementById('confirmOk').textContent = confirmLabel || 'Confirmar';
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  var okBtn = document.getElementById('confirmOk');
  var cancelBtn = document.getElementById('confirmCancel');
  function cleanup(){
    modal.classList.remove('show');
    document.body.style.overflow = '';
    okBtn.removeEventListener('click', onOk);
    cancelBtn.removeEventListener('click', onCancel);
  }
  function onOk(){ cleanup(); if(onConfirm) onConfirm(); }
  function onCancel(){ cleanup(); }
  okBtn.addEventListener('click', onOk);
  cancelBtn.addEventListener('click', onCancel);
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function escapeAttr(s){ return String(s).replace(/"/g, '&quot;'); }
function escapeRegex(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

window.TerraZCore = {
  showToast: showToast,
  showConfirm: showConfirm,
  escapeHtml: escapeHtml,
  escapeAttr: escapeAttr,
  escapeRegex: escapeRegex
};
window.TerraZApp = window.TerraZApp || {};
window.showToast = showToast;

/* ===== ATALHOS GLOBAIS ===== */
document.addEventListener('keydown', function(e){
  var app = window.TerraZApp || {};

  if((e.ctrlKey || e.metaKey) && e.key === 's'){
    e.preventDefault();
    if(app.editor && app.editor.isEditing()) app.editor.save();
    else showToast('Ative o modo de edição primeiro (✏️)', 'warning');
  }

  if(e.altKey && e.key === 'ArrowLeft'){
    var fandomModal = document.getElementById('fandomModal');
    if(fandomModal && fandomModal.classList.contains('show') && app.search){
      e.preventDefault();
      app.search.back();
    }
  }

  var presentationModal = document.getElementById('presentationModal');
  if(presentationModal && presentationModal.classList.contains('show') && app.presentation){
    if(e.key === 'ArrowRight'){ e.preventDefault(); app.presentation.next(); }
    if(e.key === 'ArrowLeft'){ e.preventDefault(); app.presentation.prev(); }
  }

  if(e.key === 'Escape'){
    if(presentationModal && presentationModal.classList.contains('show') && app.presentation){
      app.presentation.close();
      return;
    }

    var graphModal = document.getElementById('graphEditorModal');
    if(graphModal && graphModal.classList.contains('show') && app.graph){
      app.graph.closeEditor();
      return;
    }

    if(app.navigation && app.navigation.isReading()){
      app.navigation.toggleReading();
      return;
    }

    if(app.navigation){
      app.navigation.closeLightbox();
      app.navigation.closeDrawer();
    }
    if(app.search){
      app.search.closeModal();
      app.search.closePanel();
    }
    if(app.characters) app.characters.close();
    if(app.favorites) app.favorites.close();
  }
});

/* ===== BOOTSTRAP ===== */
document.addEventListener('DOMContentLoaded', function(){
  showToast('Universo Terra Z · v1.3.2', 'info', 3500);
});

})();
