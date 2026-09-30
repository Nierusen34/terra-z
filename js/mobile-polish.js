(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var MOBILE_QUERY = '(max-width: 900px)';

function isMobile(){
  return window.matchMedia && window.matchMedia(MOBILE_QUERY).matches;
}

function enhanceTables(root){
  if(!isMobile()) return;
  root = root || document;

  Array.from(root.querySelectorAll('table')).forEach(function(table){
    if(table.closest('.mobile-table-scroll')) return;

    var headers = table.querySelectorAll('thead tr:first-child th').length;
    if(headers < 4) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'mobile-table-scroll';
    if(headers >= 6) wrapper.classList.add('very-wide');
    else wrapper.classList.add('wide');
    wrapper.setAttribute('role','region');
    wrapper.setAttribute('aria-label','Tabela com rolagem horizontal');

    table.parentNode.insertBefore(wrapper,table);
    wrapper.appendChild(table);
  });

  requestAnimationFrame(function(){
    Array.from(document.querySelectorAll('.mobile-table-scroll')).forEach(function(wrapper){
      wrapper.classList.toggle('is-scrollable',wrapper.scrollWidth > wrapper.clientWidth + 4);
    });
  });
}

function setupLightbox(){
  var lightbox = document.getElementById('lightbox');
  var image = document.getElementById('lightboxImg');
  if(!lightbox || !image) return;

  image.setAttribute('tabindex','0');
  image.setAttribute('role','button');
  image.setAttribute('aria-label','Toque para ampliar ou reduzir a imagem');

  function toggleZoom(event){
    if(!isMobile()) return;
    if(event) event.stopPropagation();

    lightbox.classList.toggle('mobile-zoomed');
    var zoomed = lightbox.classList.contains('mobile-zoomed');
    image.setAttribute('aria-pressed',zoomed ? 'true' : 'false');

    if(zoomed){
      requestAnimationFrame(function(){
        var left = Math.max(0,(lightbox.scrollWidth - lightbox.clientWidth) / 2);
        lightbox.scrollTo({top:0,left:left,behavior:'smooth'});
      });
    } else {
      lightbox.scrollTo({top:0,left:0,behavior:'smooth'});
    }
  }

  image.addEventListener('click',toggleZoom);
  image.addEventListener('keydown',function(event){
    if(event.key === 'Enter' || event.key === ' '){
      event.preventDefault();
      toggleZoom(event);
    }
  });

  document.querySelectorAll('.photo img').forEach(function(source){
    source.addEventListener('click',function(){
      lightbox.classList.remove('mobile-zoomed');
      image.setAttribute('aria-pressed','false');
      lightbox.scrollTop = 0;
      lightbox.scrollLeft = 0;
    });
  });

  var close = document.getElementById('lightboxClose');
  if(close){
    close.addEventListener('click',function(){
      lightbox.classList.remove('mobile-zoomed');
    });
  }
}

function markGraphScroll(){
  if(!isMobile()) return;
  document.querySelectorAll('.graph-wrap').forEach(function(node){
    node.classList.add('mobile-scroll-region');
  });
}

function apply(){
  if(!isMobile()) return;
  document.documentElement.classList.add('mobile-polish');
  enhanceTables(document);
  markGraphScroll();

  requestAnimationFrame(function(){
    Array.from(document.querySelectorAll('.mobile-table-scroll')).forEach(function(wrapper){
      wrapper.classList.toggle('is-scrollable',wrapper.scrollWidth > wrapper.clientWidth + 4);
    });
  });
}

document.addEventListener('DOMContentLoaded',function(){
  apply();
  setupLightbox();
});

[
  'terra-z:runtime-data-loaded',
  'terra-z:characters-rendered'
].forEach(function(name){
  document.addEventListener(name,function(){ enhanceTables(document); });
});

var resizeTimer = null;
window.addEventListener('resize',function(){
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(apply,120);
},{passive:true});

window.TerraZApp.mobilePolish = {
  apply:apply,
  enhanceTables:enhanceTables
};

})();