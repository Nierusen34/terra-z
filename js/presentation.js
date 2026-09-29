(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/presentation.js');

var showToast = core.showToast;
var escapeHtml = core.escapeHtml;

/* ===== APRESENTAÇÃO ===== */
var presCards = [], presIndex = 0;
function togglePresentation(){
  var modal = document.getElementById('presentationModal');
  if(modal.classList.contains('show')) closePresentation();
  else openPresentation();
}

function openPresentation(){
  var activeTab = document.querySelector('.tab-content.active');
  if(!activeTab){ showToast('Nenhuma seção ativa', 'warning'); return; }
  presCards = [];
  activeTab.querySelectorAll('.sub-content').forEach(function(sub){
    if(!sub.classList.contains('active')) return;
    sub.querySelectorAll('.card').forEach(function(card){
      var h4 = card.querySelector('h4'), p = card.querySelector('p');
      if(h4) presCards.push({ title: h4.textContent.replace(/^[^\w]*\s*/,'').trim(), content: p ? p.innerHTML : '' });
    });
  });
  if(presCards.length === 0){
    activeTab.querySelectorAll('.card').forEach(function(card){
      var h4 = card.querySelector('h4'), p = card.querySelector('p');
      if(h4) presCards.push({ title: h4.textContent.replace(/^[^\w]*\s*/,'').trim(), content: p ? p.innerHTML : '' });
    });
  }
  if(presCards.length === 0){ showToast('Nenhum card para apresentar nesta seção', 'warning'); return; }
  presIndex = 0;
  document.getElementById('presentationModal').classList.add('show');
  document.body.style.overflow = 'hidden';
  renderPresentation();
}

function renderPresentation(){
  var modal = document.getElementById('presentationModal');
  var inner = modal.querySelector('.pres-inner');
  if(!inner) return;
  if(presCards.length === 0){ inner.innerHTML = '<div class="pres-empty">Nenhum card disponível.</div>'; return; }
  var card = presCards[presIndex];
  var counter = modal.querySelector('.pres-counter');
  if(counter) counter.textContent = (presIndex + 1) + ' / ' + presCards.length;
  inner.innerHTML = '<div class="pres-card"><h4>' + escapeHtml(card.title) + '</h4><p>' + card.content + '</p></div><div class="pres-nav"><button id="presPrev"' + (presIndex === 0 ? ' disabled' : '') + '>← Anterior</button><button id="presNext"' + (presIndex === presCards.length - 1 ? ' disabled' : '') + '>Próximo →</button></div><div class="pres-hint">Use ← → para navegar • ESC para sair</div>';
  var prevBtn = document.getElementById('presPrev');
  var nextBtn = document.getElementById('presNext');
  if(prevBtn) prevBtn.addEventListener('click', presPrev);
  if(nextBtn) nextBtn.addEventListener('click', presNext);
}
function presNext(){ if(presIndex < presCards.length - 1){ presIndex++; renderPresentation(); } }
function presPrev(){ if(presIndex > 0){ presIndex--; renderPresentation(); } }
function closePresentation(){ document.getElementById('presentationModal').classList.remove('show'); document.body.style.overflow = ''; }



window.togglePresentation = togglePresentation;

window.TerraZApp.presentation = {
  toggle: togglePresentation,
  open: openPresentation,
  close: closePresentation,
  next: presNext,
  prev: presPrev
};

})();
