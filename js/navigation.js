(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/navigation.js');

var showToast = core.showToast;

/* ===== CONFIGURAÇÃO DOS JORNAIS ===== */
var paperConfig = {
  "farol":{title:'O Farol de <span class="city">Vanguard</span>',subtitle:'"A verdade ilumina a Cidade Dourada"',section:'Dossiê Completo Universo',footer:'O FAROL DE VANGUARD · Dossiê Especial · v1.3.2 · Jan 2027'},
  "vbn":{title:'VBN · Vanguard <span class="city">Broadcasting</span>',subtitle:'🔴 AO VIVO · Informação em Tempo Real',section:'VBN Mapas · Transmissão Contínua',footer:'VBN – VANGUARD BROADCASTING NETWORK · Dossiê Especial · Jan 2027'},
  "cais":{title:'O Diário do <span class="city">Cais</span>',subtitle:'"O jornal do povo trabalhador"',section:'Caderno Cotidiano · Transporte & Serviço',footer:'O DIÁRIO DO CAIS · Caderno de Serviço · v1.3.2 · Jan 2027'},
  "sentinela":{title:'A Sentinela <span class="city">Dourada</span>',subtitle:'🔥 Nada escapa do nosso radar',section:'🔥 EXCLUSIVO · O que ninguém quer que você saiba',footer:'A SENTINELA DOURADA · Edição Especial · v1.3.2 · Jan 2027'}
};

function applyPaper(k){
  if(!paperConfig[k]) return;
  document.documentElement.setAttribute('data-paper', k);
  var c = paperConfig[k];
  var mt = document.getElementById('mastTitle');
  var ms = document.getElementById('mastSubtitle');
  var msec = document.getElementById('mastSection');
  var ft = document.getElementById('footerText');
  if(mt) mt.innerHTML = c.title;
  if(ms) ms.textContent = c.subtitle;
  if(msec) msec.textContent = c.section;
  if(ft) ft.textContent = c.footer;
}



var readingMode = false;
function toggleReadingMode(){
  readingMode = !readingMode;
  document.body.classList.toggle('reading-mode', readingMode);
  localStorage.setItem('terraZ_reading', readingMode ? '1' : '0');
  if(readingMode) showToast('Modo Leitura ativado — pressione ESC para sair', 'info', 3500);
  window.scrollTo({top:0, behavior:'smooth'});
}

function toggleChangelog(){
  var el = document.getElementById('changelogContent');
  if(el) el.classList.toggle('open');
}

document.querySelectorAll('.tab-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    var t = btn.getAttribute('data-tab');
    var p = btn.getAttribute('data-paper') || 'farol';
    document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
    document.querySelectorAll('.tab-content').forEach(function(c){ c.classList.remove('active'); });
    btn.classList.add('active');
    var el = document.getElementById(t); if(el) el.classList.add('active');
    if(el && window.TerraZApp && window.TerraZApp.media){
      window.TerraZApp.media.hydrate(el.querySelector('.sub-content.active') || el);
    }
    applyPaper(p);
    syncGlobalSidebar(t, null);
    closeDrawer();
    window.scrollTo({top:0, behavior:'smooth'});
  });
});

document.querySelectorAll('.sidebar-item').forEach(function(item){
  item.addEventListener('click', function(){
    var parent = item.closest('.tab-content'); if(!parent) return;
    var t = item.getAttribute('data-sub');
    parent.querySelectorAll('.sidebar-item').forEach(function(i){ i.classList.remove('active'); });
    parent.querySelectorAll('.sub-content').forEach(function(c){ c.classList.remove('active'); });
    item.classList.add('active');
    var el = document.getElementById(t); if(el) el.classList.add('active');
    if(el && window.TerraZApp && window.TerraZApp.media) window.TerraZApp.media.hydrate(el);
    var crumb = parent.querySelector('.breadcrumbs .current');
    if(crumb) crumb.textContent = item.textContent.replace(/[^\w\sÀ-ÿ]/g,'').trim();
    syncGlobalSidebar(parent.id, t);
    closeDrawer();
    window.scrollTo({top:0, behavior:'smooth'});
    if(t === 'sub-tz-relacoes' && window.TerraZApp && window.TerraZApp.graph) window.TerraZApp.graph.render();
  });
});

var globalStructure = [
  { id:'tab-home', icon:'📰', label:'Capa', subs:[] },
  { id:'tab-city', icon:'🏛️', label:'Cidade', subs:[
    {id:'sub-visao', label:'Visão Geral'},{id:'sub-distritos', label:'Distritos'},
    {id:'sub-historia', label:'História'},{id:'sub-cultura', label:'Cultura'},{id:'sub-eventos', label:'Eventos'}
  ]},
  { id:'tab-maps', icon:'🗺️', label:'Mapas', subs:[
    {id:'sub-mapa-detalhado', label:'Visão Geral'},
    {id:'sub-mapa-transporte', label:'Transporte'},
    {id:'sub-mapa-nacional', label:'Mapa Nacional'},
    {id:'sub-mapa-criminal', label:'Criminalidade'}
  ]},
  { id:'tab-transport', icon:'🚋', label:'Transporte', subs:[
    {id:'sub-dist-internas', label:'Internas'},{id:'sub-cidades-externas', label:'Externas'},{id:'sub-sistema-transporte', label:'Sistema'}
  ]},
  { id:'tab-terraz', icon:'🌌', label:'Universo', subs:[
    {id:'sub-universo-visao', label:'Visão Geral'},{id:'sub-tz-personagens', label:'Personagens'},
    {id:'sub-tz-timeline', label:'Linha do Tempo'},{id:'sub-tz-equipes', label:'Equipes'},{id:'sub-tz-relacoes', label:'Relações'},{id:'sub-tz-sessoes', label:'Sessões'}
  ]}
];

function buildGlobalSidebar(){
  var sidebar = document.getElementById('globalSidebar');
  if(!sidebar) return;
  var html = '<div class="gs-title">📑 Índice</div>';
  globalStructure.forEach(function(group){
    html += '<div class="gs-group" data-group="' + group.id + '">';
    html += '<button class="gs-group-btn" data-tab="' + group.id + '"><span style="margin-right:6px">' + group.icon + '</span>' + group.label + '</button>';
    if(group.subs.length > 0){
      html += '<div class="gs-sub">';
      group.subs.forEach(function(sub){
        html += '<button class="gs-sub-btn" data-tab="' + group.id + '" data-sub="' + sub.id + '">' + sub.label + '</button>';
      });
      html += '</div>';
    }
    html += '</div>';
  });
  html += '<div class="gs-footer">Universo Terra Z · v1.3.2<br>Jan 2027</div>';
  sidebar.innerHTML = html;
  sidebar.querySelectorAll('.gs-group-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var tab = btn.getAttribute('data-tab');
      var tabBtn = document.querySelector('.tab-btn[data-tab="' + tab + '"]');
      if(tabBtn) tabBtn.click();
    });
  });
  sidebar.querySelectorAll('.gs-sub-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var tab = btn.getAttribute('data-tab');
      var sub = btn.getAttribute('data-sub');
      var tabBtn = document.querySelector('.tab-btn[data-tab="' + tab + '"]');
      if(tabBtn) tabBtn.click();
      setTimeout(function(){
        var subBtn = document.querySelector('.sidebar-item[data-sub="' + sub + '"]');
        if(subBtn) subBtn.click();
      }, 120);
    });
  });
}

function syncGlobalSidebar(activeTab, activeSub){
  var sidebar = document.getElementById('globalSidebar');
  if(!sidebar) return;
  sidebar.querySelectorAll('.gs-group-btn').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-tab') === activeTab); });
  sidebar.querySelectorAll('.gs-group').forEach(function(g){ g.classList.toggle('expanded', g.getAttribute('data-group') === activeTab); });
  sidebar.querySelectorAll('.gs-sub-btn').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-sub') === activeSub && b.getAttribute('data-tab') === activeTab);
  });
}

var sidebarToggle = document.getElementById('sidebarToggle');
if(sidebarToggle){
  sidebarToggle.addEventListener('click', function(){
    var sb = document.getElementById('globalSidebar');
    sb.classList.toggle('collapsed');
    document.body.classList.toggle('sidebar-collapsed');
    sidebarToggle.textContent = sb.classList.contains('collapsed') ? '📑' : '◀';
  });
}

var menuBtn = document.getElementById('menuBtn');
var overlay = document.getElementById('drawerOverlay');
function openDrawer(){
  var activeTab = document.querySelector('.tab-content.active');
  if(!activeTab) return;
  var sidebar = activeTab.querySelector('.sidebar');
  if(!sidebar) return;
  sidebar.classList.add('open');
  if(overlay) overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeDrawer(){
  document.querySelectorAll('.sidebar.open').forEach(function(s){ s.classList.remove('open'); });
  if(overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';
}
if(menuBtn) menuBtn.addEventListener('click', openDrawer);
if(overlay) overlay.addEventListener('click', closeDrawer);

var themeBtn = document.getElementById('themeToggle');
if(themeBtn){
  themeBtn.addEventListener('click', function(){
    var root = document.documentElement;
    var next = (root.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    themeBtn.textContent = (next === 'dark') ? '☀️ Modo Claro' : '🌙 Modo Escuro';
    localStorage.setItem('terraZ_theme', next);
  });
  var savedTheme = localStorage.getItem('terraZ_theme');
  if(savedTheme){
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeBtn.textContent = (savedTheme === 'dark') ? '☀️ Modo Claro' : '🌙 Modo Escuro';
  }
}

var bt = document.getElementById('backTop');
if(bt){
  window.addEventListener('scroll', function(){
    if(window.pageYOffset > 300) bt.classList.add('show');
    else bt.classList.remove('show');
  }, {passive:true});
  bt.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
}

function openLightbox(src,alt){
  var lightbox = document.getElementById('lightbox');
  var image = document.getElementById('lightboxImg');
  if(!lightbox || !image || !src) return;

  image.src = src;
  image.alt = alt || '';
  lightbox.classList.add('show');
  document.body.style.overflow = 'hidden';
}

document.querySelectorAll('.photo img').forEach(function(img){
  img.addEventListener('click', function(){
    openLightbox(img.currentSrc || img.src,img.alt || '');
  });
});

function closeLightbox(){
  var lightbox = document.getElementById('lightbox');
  if(lightbox) lightbox.classList.remove('show');

  var keepLocked = !!document.querySelector(
    '#fichaModal.show,#presentationModal.show,#graphEditorModal.show,.character-editor-panel.show'
  );
  document.body.style.overflow = keepLocked ? 'hidden' : '';
}

function initInteractiveTimeline(){
  document.querySelectorAll('.timeline').forEach(function(tl){
    tl.classList.add('interactive');
    tl.querySelectorAll('.timeline-item').forEach(function(item){
      item.addEventListener('click', function(e){
        if(e.target.tagName === 'A') return;
        item.classList.toggle('collapsed');
      });
    });
  });
}



try { buildGlobalSidebar(); } catch(e){ console.error('buildGlobalSidebar:', e); }
try { initInteractiveTimeline(); } catch(e){ console.error('initInteractiveTimeline:', e); }
try { syncGlobalSidebar('tab-home', null); } catch(e){ console.error('syncGlobalSidebar:', e); }
try {
  if(localStorage.getItem('terraZ_reading') === '1'){
    readingMode = true;
    document.body.classList.add('reading-mode');
  }
} catch(e){ console.error('reading:', e); }

window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.toggleReadingMode = toggleReadingMode;
window.toggleChangelog = toggleChangelog;

window.TerraZApp.navigation = {
  applyPaper: applyPaper,
  toggleReading: toggleReadingMode,
  isReading: function(){ return readingMode; },
  closeDrawer: closeDrawer,
  openLightbox: openLightbox,
  closeLightbox: closeLightbox,
  syncSidebar: syncGlobalSidebar
};

})();
