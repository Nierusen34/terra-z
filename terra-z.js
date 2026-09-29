(function(){
"use strict";

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


function editAttrs(meta){
  if(!meta) return '';
  return ' data-edit-id="' + escapeAttr(meta.id) + '" data-legacy-edit-id="' + escapeAttr(meta.legacyId) + '"';
}

function renderDistrictData(){
  var root = document.getElementById('districtsData');
  if(!root || root.children.length > 0) return;

  var districts = window.TerraZData && window.TerraZData.districts;
  if(!Array.isArray(districts)){
    console.error('Terra Z: data/locations.js não foi carregado.');
    return;
  }

  var html = '';
  districts.forEach(function(d){
    var locationText = Array.isArray(d.locations) ? d.locations.join(', ') : '';
    if(locationText && !/[.!?]$/.test(locationText)) locationText += '.';
    if(d.note) locationText += (locationText ? ' ' : '') + d.note;

    html += '<figure class="photo" data-district="' + escapeAttr(d.id) + '">';
    html += '<img data-district-image src="' + escapeAttr(d.image.src) + '" alt="' + escapeAttr(d.image.alt) + '" loading="lazy" decoding="async">';
    html += '<figcaption' + editAttrs(d.edit.caption) + '>' + escapeHtml(d.image.caption) + '</figcaption></figure>';
    html += '<div class="card"><h4' + editAttrs(d.edit.title) + '>' + escapeHtml(d.icon + ' ' + d.name) + '</h4>';
    html += '<p' + editAttrs(d.edit.details) + '><strong>Tipo:</strong> ' + escapeHtml(d.type) + '<br><strong>Locais:</strong> ' + escapeHtml(locationText) + '</p></div>';
  });

  root.innerHTML = html;
  root.querySelectorAll('img[data-district-image]').forEach(function(img){
    img.addEventListener('error', function(){
      var figure = img.closest('figure');
      if(figure) figure.classList.add('missing');
    });
  });
}

function renderAnnualEventsData(){
  var body = document.getElementById('annualEventsBody');
  if(!body || body.children.length > 0) return;

  var events = window.TerraZData && window.TerraZData.annualEvents;
  if(!Array.isArray(events)){
    console.error('Terra Z: data/events.js não foi carregado.');
    return;
  }

  var html = '';
  events.forEach(function(event){
    html += '<tr>';
    html += '<td' + editAttrs(event.edit.name) + '>' + escapeHtml(event.name) + '</td>';
    html += '<td' + editAttrs(event.edit.month) + '>' + escapeHtml(event.month) + '</td>';
    html += '<td' + editAttrs(event.edit.description) + '>' + escapeHtml(event.description) + '</td>';
    html += '</tr>';
  });
  body.innerHTML = html;
}

function renderTimelineData(){
  var root = document.getElementById('timelineData');
  if(!root || root.children.length > 0) return;

  var groups = window.TerraZData && window.TerraZData.timeline;
  if(!Array.isArray(groups)){
    console.error('Terra Z: data/timeline.js não foi carregado.');
    return;
  }

  var html = '';
  groups.forEach(function(group){
    html += '<div class="subsection-title">' + escapeHtml(group.title) + '</div>';
    html += '<div class="timeline">';
    group.items.forEach(function(item){
      html += '<div class="timeline-item">';
      html += '<div' + editAttrs(item.edit.year) + ' class="timeline-year">' + escapeHtml(item.year) + '</div>';
      html += '<div' + editAttrs(item.edit.text) + ' class="timeline-text">' + escapeHtml(item.text) + '</div>';
      html += '</div>';
    });
    html += '</div>';
  });
  root.innerHTML = html;
}

function renderExternalCitiesData(){
  var body = document.getElementById('externalCitiesBody');
  if(!body || body.children.length > 0) return;

  var cities = window.TerraZData && window.TerraZData.externalCities;
  if(!Array.isArray(cities)){
    console.error('Terra Z: data/cities.js não foi carregado.');
    return;
  }

  var html = '';
  cities.forEach(function(city){
    html += '<tr>';
    html += '<td' + editAttrs(city.edit.city) + '>' + escapeHtml(city.city) + '</td>';
    html += '<td' + editAttrs(city.edit.flightKm) + '>' + escapeHtml(city.flightKm) + '</td>';
    html += '<td' + editAttrs(city.edit.flightTime) + '>' + escapeHtml(city.flightTime) + '</td>';
    html += '<td' + editAttrs(city.edit.driveKm) + '>' + escapeHtml(city.driveKm) + '</td>';
    html += '<td' + editAttrs(city.edit.driveTime) + '>' + escapeHtml(city.driveTime) + '</td>';
    html += '</tr>';
  });
  body.innerHTML = html;
}

function renderTeamsData(){
  var teamsBody = document.getElementById('teamsBody');
  var leagueBody = document.getElementById('justiceLeagueBody');
  var data = window.TerraZData && window.TerraZData.teams;

  if(!data || !Array.isArray(data.teams) || !Array.isArray(data.justiceLeagueMembers)){
    console.error('Terra Z: data/teams.js não foi carregado.');
    return;
  }

  if(teamsBody && teamsBody.children.length === 0){
    var teamsHtml = '';
    data.teams.forEach(function(team){
      teamsHtml += '<tr>';
      teamsHtml += '<td' + editAttrs(team.edit.name) + '>' + escapeHtml(team.name) + '</td>';
      teamsHtml += '<td' + editAttrs(team.edit.year) + '>' + escapeHtml(team.year) + '</td>';
      teamsHtml += '<td' + editAttrs(team.edit.leader) + '>' + escapeHtml(team.leader) + '</td>';
      teamsHtml += '<td' + editAttrs(team.edit.members) + '>' + escapeHtml(team.members) + '</td>';
      teamsHtml += '</tr>';
    });
    teamsBody.innerHTML = teamsHtml;
  }

  if(leagueBody && leagueBody.children.length === 0){
    var leagueHtml = '';
    data.justiceLeagueMembers.forEach(function(member){
      leagueHtml += '<tr>';
      leagueHtml += '<td' + editAttrs(member.edit.character) + '>' + escapeHtml(member.character) + '</td>';
      leagueHtml += '<td' + editAttrs(member.edit.codename) + '>' + escapeHtml(member.codename) + '</td>';
      leagueHtml += '<td' + editAttrs(member.edit.born) + '>' + escapeHtml(member.born) + '</td>';
      leagueHtml += '<td' + editAttrs(member.edit.age2027) + '>' + escapeHtml(member.age2027) + '</td>';
      leagueHtml += '</tr>';
    });
    leagueBody.innerHTML = leagueHtml;
  }
}

function renderCanonicalData(){
  renderDistrictData();
  renderAnnualEventsData();
  renderTimelineData();
  renderExternalCitiesData();
  renderTeamsData();
}

// Scripts são carregados com defer; neste ponto o HTML já foi analisado.
// Renderizar agora mantém os componentes disponíveis para listeners registrados abaixo.
renderCanonicalData();


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
    {id:'sub-mapa-detalhado', label:'Mapa'},{id:'sub-mapa-criminal', label:'Criminalidade'},{id:'sub-mapa-transporte', label:'Transporte'}
  ]},
  { id:'tab-transport', icon:'🚋', label:'Transporte', subs:[
    {id:'sub-dist-internas', label:'Internas'},{id:'sub-cidades-externas', label:'Externas'},{id:'sub-sistema-transporte', label:'Sistema'}
  ]},
  { id:'tab-terraz', icon:'🌌', label:'Universo', subs:[
    {id:'sub-universo-visao', label:'Visão Geral'},{id:'sub-tz-personagens', label:'Personagens'},
    {id:'sub-tz-timeline', label:'Linha do Tempo'},{id:'sub-tz-equipes', label:'Equipes'},{id:'sub-tz-relacoes', label:'Relações'}
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

document.querySelectorAll('.photo img').forEach(function(img){
  img.addEventListener('click', function(){
    document.getElementById('lightboxImg').src = img.src;
    document.getElementById('lightbox').classList.add('show');
    document.body.style.overflow = 'hidden';
  });
});
function closeLightbox(){
  document.getElementById('lightbox').classList.remove('show');
  document.body.style.overflow = '';
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

/* ===== FICHAS DE PERSONAGENS ===== */
var fichasPersonagens = (window.TerraZData && window.TerraZData.characters) || {};
if(!window.TerraZData || !window.TerraZData.characters){
  console.error('Terra Z: data/characters.js não foi carregado.');
}

function openFichaModal(characterName){
  var ficha = fichasPersonagens[characterName];
  if(!ficha){ showToast('Ficha não disponível para: ' + characterName, 'warning'); return; }
  var modal = document.getElementById('fichaModal');
  var header = document.getElementById('fichaHeader');
  var body = document.getElementById('fichaBody');
  header.innerHTML = '<div class="fh-info"><div class="fh-eyebrow">' + escapeHtml(ficha.eyebrow) + '</div><h2>' + escapeHtml(characterName) + '</h2></div><button class="fh-close" id="fichaCloseBtn">✕</button>';
  var bodyHtml = '';
  ficha.sections.forEach(function(sec){
    bodyHtml += '<div class="ficha-section"><h3>' + sec.title + '</h3>' + sec.content + '</div>';
  });
  if(ficha.secrets && ficha.secrets.length > 0){
    bodyHtml += '<div class="ficha-secrets" id="fichaSecretsBox"><button class="ficha-secrets-toggle" id="fichaSecretsToggle"><span>🔒 Mostrar Segredos (' + ficha.secrets.length + ')</span><span class="arrow">▶</span></button><div class="ficha-secrets-content"><ul>';
    ficha.secrets.forEach(function(s){ bodyHtml += '<li>' + escapeHtml(s) + '</li>'; });
    bodyHtml += '</ul></div></div>';
  }
  bodyHtml += '<div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid var(--line2)"><button id="fichaSearchBtn" style="background:var(--accent);color:#fff;border:none;padding:10px 22px;border-radius:20px;font-family:\'Share Tech Mono\',monospace;font-size:11px;letter-spacing:1px;cursor:pointer;text-transform:uppercase">🔍 Buscar na DC Wiki</button></div>';
  body.innerHTML = bodyHtml;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  document.getElementById('fichaCloseBtn').addEventListener('click', closeFichaModal);
  document.getElementById('fichaSearchBtn').addEventListener('click', function(){ window.searchOnFandom(characterName); });
  var secretsToggle = document.getElementById('fichaSecretsToggle');
  if(secretsToggle){
    secretsToggle.addEventListener('click', function(){
      var box = document.getElementById('fichaSecretsBox');
      box.classList.toggle('open');
      var label = secretsToggle.querySelector('span:first-child');
      var isOpen = box.classList.contains('open');
      if(label) label.textContent = (isOpen ? '🔓 Ocultar Segredos' : '🔒 Mostrar Segredos') + ' (' + ficha.secrets.length + ')';
    });
  }
}

function closeFichaModal(){ document.getElementById('fichaModal').classList.remove('show'); document.body.style.overflow = ''; }

function attachFichaHandlers(){
  document.querySelectorAll('.card-grid .card').forEach(function(card){
    var h4 = card.querySelector('h4');
    if(!h4) return;
    var title = h4.textContent.replace(/^[^\w]*\s*/,'').trim();
    title = title.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s⭐]+/u,'').trim();
    var match = null;
    for(var key in fichasPersonagens){
      if(title.indexOf(key) !== -1 || key.indexOf(title) !== -1){ match = key; break; }
    }
    if(match){
      card.setAttribute('data-ficha', match);
      card.setAttribute('title', 'Clique para ver a ficha completa');
      card.addEventListener('click', function(e){
        if(e.target.classList.contains('fav-btn')) return;
        openFichaModal(match);
      });
    } else {
      card.setAttribute('data-fandom', title);
      card.addEventListener('click', function(e){
        if(e.target.classList.contains('fav-btn')) return;
        window.searchOnFandom(title);
      });
    }
  });
}

/* ===== TECLADO ===== */
document.addEventListener('keydown', function(e){
  if((e.ctrlKey || e.metaKey) && e.key === 's'){
    e.preventDefault();
    var editor = window.TerraZApp && window.TerraZApp.editor;
    if(editor && editor.isEditing()) editor.save();
    else showToast('Ative o modo de edição primeiro (✏️)', 'warning');
  }
  if(e.altKey && e.key === 'ArrowLeft'){
    if(document.getElementById('fandomModal').classList.contains('show')){ e.preventDefault(); window.goBackFandom(); }
  }
  if(document.getElementById('presentationModal').classList.contains('show')){
    if(e.key === 'ArrowRight'){ e.preventDefault(); window.TerraZApp.presentation.next(); }
    if(e.key === 'ArrowLeft'){ e.preventDefault(); window.TerraZApp.presentation.prev(); }
  }
  if(e.key === 'Escape'){
    if(document.getElementById('presentationModal').classList.contains('show')){ window.TerraZApp.presentation.close(); return; }
    if(document.getElementById('graphEditorModal').classList.contains('show')){ window.TerraZApp.graph.closeEditor(); return; }
    if(readingMode){ toggleReadingMode(); return; }
    closeLightbox();
    window.closeFandomModal();
    closeFichaModal();
    window.closeSearchPanel();
    window.closeFavoritesPanel();
    closeDrawer();
  }
});

/* ===== EXPOR FUNÇÕES ===== */
window.closeLightbox = closeLightbox;
window.openFichaModal = openFichaModal;
window.closeFichaModal = closeFichaModal;
window.showToast = showToast;
window.toggleReadingMode = toggleReadingMode;
window.toggleChangelog = toggleChangelog;

/* ===== INICIALIZAÇÃO ===== */
document.addEventListener('DOMContentLoaded', function(){
  try { buildGlobalSidebar(); } catch(e){ console.error('buildGlobalSidebar:', e); }  try { attachFichaHandlers(); } catch(e){ console.error('attachFichaHandlers:', e); }  try { initInteractiveTimeline(); } catch(e){ console.error('initInteractiveTimeline:', e); }  try { syncGlobalSidebar('tab-home', null); } catch(e){ console.error('syncGlobalSidebar:', e); }
  try {
    if(localStorage.getItem('terraZ_reading') === '1'){
      readingMode = true;
      document.body.classList.add('reading-mode');
    }
  } catch(e){ console.error('reading:', e); }
  showToast('Universo Terra Z · v1.3.2', 'info', 3500);
});

})();
