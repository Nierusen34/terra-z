(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/presentation.js');

var showToast = core.showToast;
var escapeHtml = core.escapeHtml;

var presSlides = [];
var presIndex = 0;

function togglePresentation(){
  var modal = document.getElementById('presentationModal');
  if(!modal) return;
  if(modal.classList.contains('show')) closePresentation();
  else openPresentation();
}

function activeScope(){
  var activeTab = document.querySelector('.tab-content.active');
  if(!activeTab) return null;
  return activeTab.querySelector('.sub-content.active') || activeTab;
}

function isPresentable(el){
  if(!el || el.hidden) return false;
  var visibility = window.TerraZApp && window.TerraZApp.visibility;
  if(visibility && visibility.isAllowed && !visibility.isAllowed(el)) return false;
  return true;
}

function plainText(el){
  return el ? String(el.textContent || '').replace(/\s+/g,' ').trim() : '';
}

function plainTextFromHtml(html){
  var holder = document.createElement('div');
  holder.innerHTML = html || '';
  return plainText(holder);
}

function cleanCloneHtml(el, selectors){
  var clone = el.cloneNode(true);
  (selectors || []).forEach(function(selector){
    clone.querySelectorAll(selector).forEach(function(node){ node.remove(); });
  });
  clone.querySelectorAll('[id]').forEach(function(node){ node.removeAttribute('id'); });
  clone.querySelectorAll('[contenteditable]').forEach(function(node){ node.removeAttribute('contenteditable'); });
  return clone.innerHTML;
}

function previousHeading(el){
  var prev = el.previousElementSibling;
  while(prev){
    if(prev.classList && prev.classList.contains('subsection-title')) return plainText(prev);
    if(prev.classList && prev.classList.contains('section-title')) return plainText(prev);
    if(prev.matches && prev.matches('table,.card,.card-grid,.photo,.info-box')) break;
    prev = prev.previousElementSibling;
  }
  return '';
}

function addIntro(scope){
  var title = '';
  var body = '';

  if(scope.id === 'tab-home'){
    title = plainText(scope.querySelector('.home-hero h2')) || 'Terra Z';
    var lead = scope.querySelector('.home-hero .lead');
    var dateline = scope.querySelector('.home-hero .dateline');
    body = (lead ? '<p>' + escapeHtml(plainText(lead)) + '</p>' : '') +
      (dateline ? '<div class="pres-dateline">' + escapeHtml(plainText(dateline)) + '</div>' : '');
  } else {
    title = plainText(scope.querySelector('.section-title')) || plainText(scope.querySelector('.subsection-title'));
    var intro = scope.querySelector('.info-box');
    if(intro && isPresentable(intro)) body = cleanCloneHtml(intro,['.label']);
  }

  if(title){
    presSlides.push({
      type:'intro',
      kicker:'Dossiê Terra Z',
      title:title,
      html:body
    });
  }
}

function slideFromElement(el){
  if(!isPresentable(el)) return null;

  if(el.matches('figure.photo')){
    var img = el.querySelector('img');
    if(!img) return null;
    var src = img.getAttribute('src') || img.getAttribute('data-src') || '';
    if(!src) return null;
    return {
      type:'figure',
      kicker:'Arquivo visual',
      title:plainText(el.querySelector('figcaption')) || 'Registro visual',
      image:src,
      alt:img.getAttribute('alt') || '',
      html:''
    };
  }

  if(el.matches('.card')){
    var h = el.querySelector('h4,h3');
    if(!h) return null;
    var clone = el.cloneNode(true);
    clone.querySelectorAll('.fav-btn,.home-protagonist-badge').forEach(function(node){ node.remove(); });
    var heading = clone.querySelector('h4,h3');
    if(heading) heading.remove();
    clone.querySelectorAll('[id]').forEach(function(node){ node.removeAttribute('id'); });
    return {
      type:'card',
      kicker:'Dossiê',
      title:plainText(h).replace(/^[^\wÀ-ÿ]+\s*/,'').trim(),
      html:clone.innerHTML
    };
  }

  if(el.matches('.feature-card')){
    var label = plainText(el.querySelector('.fc-label'));
    var value = plainText(el.querySelector('.fc-value'));
    var desc = el.querySelector('.fc-desc');
    return {
      type:'feature',
      kicker:label || 'Destaque',
      title:value || label || 'Destaque',
      html:desc ? '<p>' + escapeHtml(plainText(desc)) + '</p>' : ''
    };
  }

  if(el.matches('.info-box')){
    var labelNode = el.querySelector('.label');
    return {
      type:'info',
      kicker:'Nota do dossiê',
      title:plainText(labelNode) || 'Informação',
      html:cleanCloneHtml(el,['.label'])
    };
  }

  if(el.matches('.event-item')){
    return {
      type:'event',
      kicker:plainText(el.querySelector('.date')) || 'Evento',
      title:plainText(el.querySelector('.title')) || 'Evento',
      html:el.querySelector('.desc') ? '<p>' + escapeHtml(plainText(el.querySelector('.desc'))) + '</p>' : ''
    };
  }

  if(el.matches('.pull-quote')){
    return {
      type:'quote',
      kicker:'Destaque',
      title:'',
      html:'<blockquote>' + escapeHtml(plainText(el)) + '</blockquote>'
    };
  }

  if(el.matches('table')){
    return {
      type:'table',
      kicker:'Dados',
      title:previousHeading(el) || 'Tabela do dossiê',
      html:'<div class="pres-table-wrap">' + el.outerHTML + '</div>'
    };
  }

  return null;
}

function buildSlides(scope){
  presSlides = [];
  addIntro(scope);

  var selector = [
    'figure.photo',
    '.feature-card',
    '.card',
    '.info-box',
    '.event-item',
    '.pull-quote',
    'table'
  ].join(',');

  Array.from(scope.querySelectorAll(selector)).forEach(function(el){
    if(el.matches('.info-box') && el.closest('.card')) return;
    if(el.matches('table') && el.closest('.card')) return;
    var slide = slideFromElement(el);
    if(slide) presSlides.push(slide);
  });

  var seen = new Set();
  presSlides = presSlides.filter(function(slide){
    var key = [slide.type,slide.kicker || '',slide.title || '',slide.image || '',plainTextFromHtml(slide.html || '')].join('|');
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function openPresentation(){
  var scope = activeScope();
  if(!scope){ showToast('Nenhuma seção ativa','warning'); return; }

  buildSlides(scope);
  if(presSlides.length === 0){
    showToast('Nenhum conteúdo apresentável nesta seção','warning');
    return;
  }

  presIndex = 0;
  var modal = document.getElementById('presentationModal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  renderPresentation();
}

function renderPresentation(){
  var modal = document.getElementById('presentationModal');
  var inner = modal && modal.querySelector('.pres-inner');
  if(!inner) return;

  if(presSlides.length === 0){
    inner.innerHTML = '<div class="pres-empty">Nenhum conteúdo disponível.</div>';
    return;
  }

  var slide = presSlides[presIndex];
  var counter = modal.querySelector('.pres-counter');
  if(counter) counter.textContent = (presIndex + 1) + ' / ' + presSlides.length;

  var media = slide.image
    ? '<div class="pres-media"><img src="' + escapeHtml(slide.image) + '" alt="' + escapeHtml(slide.alt || '') + '"></div>'
    : '';

  var title = slide.title ? '<h4>' + escapeHtml(slide.title) + '</h4>' : '';
  var kicker = slide.kicker ? '<div class="pres-kicker">' + escapeHtml(slide.kicker) + '</div>' : '';

  inner.innerHTML =
    '<article class="pres-card pres-' + escapeHtml(slide.type) + '">' +
      kicker + title + media +
      '<div class="pres-content">' + (slide.html || '') + '</div>' +
    '</article>' +
    '<div class="pres-nav">' +
      '<button id="presPrev"' + (presIndex === 0 ? ' disabled' : '') + '>← Anterior</button>' +
      '<button id="presNext"' + (presIndex === presSlides.length - 1 ? ' disabled' : '') + '>Próximo →</button>' +
    '</div>' +
    '<div class="pres-hint">Use ← → para navegar • ESC para sair</div>';

  var prevBtn = document.getElementById('presPrev');
  var nextBtn = document.getElementById('presNext');
  if(prevBtn) prevBtn.addEventListener('click', presPrev);
  if(nextBtn) nextBtn.addEventListener('click', presNext);
}

function presNext(){
  if(presIndex < presSlides.length - 1){
    presIndex++;
    renderPresentation();
  }
}

function presPrev(){
  if(presIndex > 0){
    presIndex--;
    renderPresentation();
  }
}

function closePresentation(){
  var modal = document.getElementById('presentationModal');
  if(!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

document.addEventListener('terra-z:visibility-changed',function(){
  var modal = document.getElementById('presentationModal');
  if(modal && modal.classList.contains('show')){
    var scope = activeScope();
    if(scope){
      buildSlides(scope);
      presIndex = Math.min(presIndex,Math.max(0,presSlides.length - 1));
      renderPresentation();
    }
  }
});

window.togglePresentation = togglePresentation;

window.TerraZApp.presentation = {
  toggle:togglePresentation,
  open:openPresentation,
  close:closePresentation,
  next:presNext,
  prev:presPrev
};

})();