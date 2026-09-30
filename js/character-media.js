(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/character-media.js');

var escapeHtml = core.escapeHtml;
var escapeAttr = core.escapeAttr;
var media = (window.TerraZData && window.TerraZData.characterMedia) || {};

function initials(name){
  var parts = String(name || '').replace(/[’']/g, '').split(/\s+/).filter(Boolean);
  if(parts.length === 0) return '?';
  if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

function getMeta(name){
  var item = media[name] || {};
  return {
    src: item.src || '',
    alt: item.alt || name,
    source: item.source || '',
    credit: item.credit || ''
  };
}

function renderPortraitHtml(name, size){
  var meta = getMeta(name);
  var cls = 'character-portrait ' + (size === 'large' ? 'large' : 'small');

  if(meta.src){
    var runtime = window.TerraZApp && window.TerraZApp.runtimeData;
    var src = runtime && runtime.mediaUrl ? runtime.mediaUrl(meta.src) : meta.src;
    return '<div class="' + cls + '" data-character="' + escapeAttr(name) + '">' +
      '<img data-src="' + escapeAttr(src) + '" alt="' + escapeAttr(meta.alt) + '" loading="lazy" decoding="async">' +
      '</div>';
  }

  return '<div class="' + cls + ' placeholder" data-character="' + escapeAttr(name) + '" aria-label="Sem retrato para ' + escapeAttr(name) + '">' +
    '<span>' + escapeHtml(initials(name)) + '</span>' +
    '</div>';
}

function decorateCard(card, name){
  if(!card) return;

  var existing = card.querySelector('.character-portrait');
  if(existing){
    hydratePortraits(existing);
    return;
  }

  card.classList.add('character-card');
  card.insertAdjacentHTML('afterbegin', renderPortraitHtml(name, 'small'));

  var portrait = card.querySelector('.character-portrait[data-character]');
  if(portrait) hydratePortraits(portrait);
}

function hydratePortraits(root){
  root = root || document;
  if(window.TerraZApp.media) window.TerraZApp.media.hydrate(root);
}


function refreshPortraits(root){
  root = root || document;
  media = (window.TerraZData && window.TerraZData.characterMedia) || {};

  Array.from(root.querySelectorAll('.character-portrait[data-character]')).forEach(function(wrapper){
    var name = wrapper.getAttribute('data-character');
    if(!name) return;
    var size = wrapper.classList.contains('large') ? 'large' : 'small';
    var holder = document.createElement('div');
    holder.innerHTML = renderPortraitHtml(name,size);
    var next = holder.firstElementChild;
    if(next){
      wrapper.replaceWith(next);
      hydratePortraits(next);
    }
  });
}

document.addEventListener('terra-z:runtime-data-loaded',function(){
  refreshPortraits(document);
});

window.TerraZApp.characterMedia = {
  get: getMeta,
  renderPortraitHtml: renderPortraitHtml,
  decorateCard: decorateCard,
  hydrate: hydratePortraits,
  refresh: refreshPortraits
};

})();
