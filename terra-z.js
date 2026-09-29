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

function renderCanonicalData(){
  renderDistrictData();
  renderAnnualEventsData();
  renderTimelineData();
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
    if(t === 'sub-tz-relacoes' && graphData) renderGraph();
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

/* ===== BUSCA ===== */
var searchInput = document.getElementById('searchInput');
var searchDebounce = null;
var fandomCache = {};
var fandomHistory = [];
var currentFandomTitle = null;
var searchMode = 'local';

if(searchInput){
  searchInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){ e.preventDefault(); executeSearch(); }
  });
  searchInput.addEventListener('input', function(){
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(executeSearch, 450);
  });
}

function switchSearchMode(mode){
  searchMode = mode;
  document.querySelectorAll('.search-tab').forEach(function(t){
    t.classList.toggle('active', t.getAttribute('data-mode') === mode);
  });
  var q = searchInput ? searchInput.value.trim() : '';
  if(q.length >= 2) executeSearch();
  else document.getElementById('searchPanel').classList.remove('show');
}

function executeSearch(){
  var query = searchInput.value.trim();
  if(query.length < 2){
    document.getElementById('searchPanel').classList.remove('show');
    clearLocalHighlights();
    return;
  }
  document.getElementById('searchPanel').classList.add('show');
  if(searchMode === 'local') searchLocalDocument(query);
  else {
    document.getElementById('searchInfo').textContent = 'Buscando por "' + query + '"...';
    document.getElementById('searchResults').innerHTML = '<div class="search-loading">Consultando DC Wiki...</div>';
    searchFandom(query);
  }
}

function clearLocalHighlights(){
  document.querySelectorAll('mark.search-hit').forEach(function(m){
    var parent = m.parentNode;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });
}

function searchLocalDocument(query){
  clearLocalHighlights();
  var skipSelectors = '#globalSidebar, #searchPanel, .masthead, .topbar, .tabs-nav, .page-footer, .sidebar, .breadcrumbs, #fandomModal, #fichaModal, #confirmModal, #lightbox, #presentationModal, #favoritesPanel, #graphEditorModal, .changelog, #toastContainer';
  var regex = new RegExp(escapeRegex(query), 'gi');
  var walker = document.createTreeWalker(document.querySelector('.container'), NodeFilter.SHOW_TEXT, {
    acceptNode: function(node){
      if(!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      var parent = node.parentElement;
      while(parent && parent !== document.body){
        if(parent.matches && parent.matches(skipSelectors)) return NodeFilter.FILTER_REJECT;
        parent = parent.parentElement;
      }
      if(node.parentElement && node.parentElement.isContentEditable) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  var textNodes = [];
  while(walker.nextNode()) textNodes.push(walker.currentNode);
  var totalMatches = 0;
  textNodes.forEach(function(node){
    var text = node.nodeValue;
    regex.lastIndex = 0;
    if(!regex.test(text)) return;
    regex.lastIndex = 0;
    var frag = document.createDocumentFragment();
    var lastIndex = 0;
    var match;
    while((match = regex.exec(text)) !== null){
      if(match.index > lastIndex) frag.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
      var mark = document.createElement('mark');
      mark.className = 'search-hit';
      mark.textContent = match[0];
      frag.appendChild(mark);
      lastIndex = regex.lastIndex;
      totalMatches++;
      if(regex.lastIndex === match.index) regex.lastIndex++;
    }
    if(lastIndex < text.length) frag.appendChild(document.createTextNode(text.substring(lastIndex)));
    node.parentNode.replaceChild(frag, node);
  });
  document.getElementById('searchInfo').textContent = totalMatches + ' ocorrência(s) de "' + query + '"';
  var results = document.getElementById('searchResults');
  var highlights = document.querySelectorAll('mark.search-hit');
  if(highlights.length === 0){
    results.innerHTML = '<div class="search-empty">Nenhuma ocorrência encontrada no documento.</div>';
    return;
  }
  var grouped = {};
  highlights.forEach(function(h, idx){
    var tab = h.closest('.tab-content');
    var sub = h.closest('.sub-content');
    var tabBtn = tab ? tab.querySelector('.tab-btn.active') : null;
    var tabName = tabBtn ? tabBtn.textContent.replace(/[^\w\sÀ-ÿ]/g,'').trim() : 'Documento';
    var subBtn = sub ? sub.parentElement.querySelector('.sidebar-item.active') : null;
    var subName = subBtn ? subBtn.textContent.replace(/[^\w\sÀ-ÿ]/g,'').trim() : '';
    var key = tabName + '|' + subName;
    if(!grouped[key]) grouped[key] = { tabName: tabName, subName: subName, count: 0, firstIdx: idx };
    grouped[key].count++;
  });
  var html = '';
  Object.keys(grouped).forEach(function(key){
    var g = grouped[key];
    var label = g.tabName + (g.subName ? ' › ' + g.subName : '');
    html += '<div class="search-result-item"><div class="r-info"><span class="r-title" data-jump="' + g.firstIdx + '">' + escapeHtml(label) + '</span><div class="r-snippet">' + g.count + ' ocorrência(s) nesta seção</div></div><div class="r-actions"><button class="primary" data-jump="' + g.firstIdx + '">→ Ir</button></div></div>';
  });
  results.innerHTML = html;
  results.querySelectorAll('[data-jump]').forEach(function(el){
    el.addEventListener('click', function(){
      var idx = parseInt(el.getAttribute('data-jump'), 10);
      var hs = document.querySelectorAll('mark.search-hit');
      if(!hs[idx]) return;
      var target = hs[idx];
      var tab = target.closest('.tab-content');
      if(tab){
        var tabBtn = document.querySelector('.tab-btn[data-tab="' + tab.id + '"]');
        if(tabBtn) tabBtn.click();
      }
      setTimeout(function(){
        target.scrollIntoView({behavior:'smooth', block:'center'});
        var origBg = target.style.background;
        target.style.transition = 'background .5s ease';
        target.style.background = 'rgba(255,215,0,.9)';
        setTimeout(function(){ target.style.background = origBg; }, 1200);
      }, 150);
    });
  });
}

function searchFandom(query){
  if(fandomCache[query]){ renderFandomResults(fandomCache[query], query); return; }
  var url = 'https://dc.fandom.com/api.php?action=opensearch&search=' + encodeURIComponent(query) + '&limit=12&namespace=0&format=json&origin=*';
  fetch(url).then(function(r){ if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(data){
      var result = { titles: data[1] || [], descriptions: data[2] || [], urls: data[3] || [] };
      fandomCache[query] = result;
      renderFandomResults(result, query);
    })
    .catch(function(err){
      console.error('Erro Fandom:', err);
      document.getElementById('searchResults').innerHTML = '<div class="search-empty">❌ Não foi possível consultar a DC Wiki.<br><small style="opacity:.7">Verifique sua conexão e tente novamente.</small></div>';
      document.getElementById('searchInfo').textContent = 'Erro na busca';
      showToast('Falha ao consultar DC Wiki', 'error');
    });
}

function renderFandomResults(data, query){
  var titles = data.titles || [];
  var descriptions = data.descriptions || [];
  document.getElementById('searchInfo').textContent = titles.length + ' resultado(s) para "' + query + '"';
  if(titles.length === 0){
    document.getElementById('searchResults').innerHTML = '<div class="search-empty">Nenhum resultado encontrado na DC Wiki.</div>';
    return;
  }
  var html = '';
  for(var i = 0; i < titles.length; i++){
    var title = titles[i], desc = descriptions[i] || '';
    html += '<div class="search-result-item"><div class="r-info"><a class="r-title" href="#" data-title="' + escapeAttr(title) + '">' + escapeHtml(title) + '</a>';
    if(desc) html += '<div class="r-snippet">' + escapeHtml(desc) + '</div>';
    html += '<div class="r-source">📚 dc.fandom.com</div></div><div class="r-actions"><button class="primary" data-title="' + escapeAttr(title) + '">📖 Ler aqui</button></div></div>';
  }
  document.getElementById('searchResults').innerHTML = html;
  document.querySelectorAll('#searchResults [data-title]').forEach(function(el){
    el.addEventListener('click', function(e){
      e.preventDefault();
      var title = el.getAttribute('data-title');
      fandomHistory = []; currentFandomTitle = null;
      openFandomModal(title);
    });
  });
}

function openFandomModal(title){
  var modal = document.getElementById('fandomModal');
  var body = document.getElementById('modalBody');
  var modalTitle = document.getElementById('modalTitle');
  var modalSource = document.getElementById('modalSource');
  var externalLink = document.getElementById('modalExternal');
  if(currentFandomTitle && currentFandomTitle !== title) fandomHistory.push(currentFandomTitle);
  currentFandomTitle = title;
  modalTitle.textContent = title;
  modalSource.textContent = '📚 dc.fandom.com/wiki/' + title.replace(/ /g,'_');
  externalLink.href = 'https://dc.fandom.com/wiki/' + encodeURIComponent(title.replace(/ /g,'_'));
  body.innerHTML = '<div class="fandom-loading">Carregando artigo da DC Wiki...</div>';
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  closeSearchPanel();
  updateFandomBackButton();
  var url = 'https://dc.fandom.com/api.php?action=parse&page=' + encodeURIComponent(title) + '&format=json&prop=text&origin=*';
  fetch(url).then(function(r){ if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(data){
      if(data.error){ body.innerHTML = '<div class="fandom-error">❌ ' + escapeHtml(data.error.info || 'Artigo não encontrado.') + '</div>'; return; }
      var html = data.parse.text['*'] || '';
      body.innerHTML = sanitizeWikiHtml(html);
      processWikiContent(body);
      body.scrollTop = 0;
    })
    .catch(function(err){
      console.error('Erro ao carregar artigo:', err);
      body.innerHTML = '<div class="fandom-error">❌ Não foi possível carregar o artigo.<br><small style="opacity:.7">' + escapeHtml(err.message) + '</small><br><br><a href="' + externalLink.href + '" target="_blank" style="color:var(--accent)">Abrir na wiki original →</a></div>';
    });
}

function goBackFandom(){
  if(fandomHistory.length === 0) return;
  var previousTitle = fandomHistory.pop();
  var savedHistory = fandomHistory.slice();
  currentFandomTitle = null;
  openFandomModal(previousTitle);
  fandomHistory = savedHistory;
  updateFandomBackButton();
}

function updateFandomBackButton(){
  var backBtn = document.getElementById('modalBackBtn');
  if(!backBtn) return;
  if(fandomHistory.length > 0){
    backBtn.style.display = 'inline-block';
    backBtn.textContent = '← Voltar (' + fandomHistory.length + ')';
  } else backBtn.style.display = 'none';
}

function closeFandomModal(){
  document.getElementById('fandomModal').classList.remove('show');
  document.body.style.overflow = '';
  setTimeout(function(){
    if(!document.getElementById('fandomModal').classList.contains('show')){
      fandomHistory = []; currentFandomTitle = null; updateFandomBackButton();
    }
  }, 100);
}

function normalizeWikiUrl(raw, base){
  if(!raw) return null;
  var value = String(raw).trim();
  if(!value) return null;

  // Âncoras locais são permitidas sem conversão.
  if(value.charAt(0) === '#') return value;

  try {
    var url = new URL(value, base || 'https://dc.fandom.com/');
    if(url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.href;
  } catch(e){
    return null;
  }
}

function sanitizeWikiHtml(html){
  var temp = document.createElement('div');
  temp.innerHTML = html;

  temp.querySelectorAll([
    'script','style','link','iframe','meta','base','object','embed',
    'form','input','button','textarea','select','option',
    '.mw-editsection','.noprint','.navbox','.metadata','.toc',
    '.reference','sup.reference','.mw-collapsible-toggle',
    '.messagebox','.ambox','.dablink','.hatnote'
  ].join(',')).forEach(function(el){ el.remove(); });

  temp.querySelectorAll('*').forEach(function(el){
    Array.from(el.attributes).forEach(function(attr){
      var name = attr.name.toLowerCase();
      if(
        name.indexOf('on') === 0 ||
        name === 'style' ||
        name === 'srcdoc' ||
        name === 'formaction' ||
        name === 'action' ||
        name === 'ping' ||
        name === 'nonce' ||
        name === 'integrity'
      ){
        el.removeAttribute(attr.name);
      }
    });
  });

  temp.querySelectorAll('a[href]').forEach(function(a){
    if(a.classList.contains('new')){
      a.removeAttribute('href');
      return;
    }
    var safeHref = normalizeWikiUrl(a.getAttribute('href'), 'https://dc.fandom.com/');
    if(!safeHref) a.removeAttribute('href');
    else a.setAttribute('href', safeHref);
  });

  temp.querySelectorAll('img').forEach(function(img){
    ['src','data-src','data-image-src'].forEach(function(attr){
      var value = img.getAttribute(attr);
      if(!value) return;
      var safe = normalizeWikiUrl(value, 'https://dc.fandom.com/');
      if(!safe) img.removeAttribute(attr);
      else img.setAttribute(attr, safe);
    });
  });

  var parserOutput = temp.querySelector('.mw-parser-output');
  return (parserOutput || temp).innerHTML;
}

function processWikiContent(root){
  root.querySelectorAll('img').forEach(function(img){
    var dataSrc = img.getAttribute('data-src');
    var realSrc = dataSrc || img.getAttribute('data-image-src') || img.getAttribute('src');

    if(!realSrc){
      var srcsetFallback = img.getAttribute('srcset') || img.getAttribute('data-srcset');
      if(srcsetFallback) realSrc = srcsetFallback.split(',')[0].trim().split(/\s+/)[0];
    }

    var safeSrc = normalizeWikiUrl(realSrc, 'https://dc.fandom.com/');
    if(!safeSrc){ img.remove(); return; }

    img.setAttribute('src', safeSrc);
    ['data-src','data-image-src','data-srcset','srcset','loading','decoding'].forEach(function(a){ img.removeAttribute(a); });
    img.classList.remove('lazyload','lazyloading');
  });

  root.querySelectorAll('a[href]').forEach(function(a){
    var safeHref = normalizeWikiUrl(a.getAttribute('href'), 'https://dc.fandom.com/');
    if(!safeHref){
      a.removeAttribute('href');
      return;
    }

    a.setAttribute('href', safeHref);
    a.removeAttribute('target');
    a.removeAttribute('rel');
  });
}

function setupModalBodyDelegation(){
  var modalBody = document.getElementById('modalBody');
  if(!modalBody) return;
  modalBody.addEventListener('click', function(e){
    var link = e.target.closest('a');
    if(!link) return;
    var href = link.getAttribute('href');
    if(!href) return;
    var isInternalWiki = /^https?:\/\/dc\.fandom\.com\/wiki\//.test(href);
    if(isInternalWiki){
      e.preventDefault(); e.stopPropagation();
      var titleEncoded = href.replace(/^https?:\/\/dc\.fandom\.com\/wiki\//, '');
      titleEncoded = titleEncoded.split('#')[0].split('?')[0];
      var title = decodeURIComponent(titleEncoded).replace(/_/g, ' ');
      if(title) openFandomModal(title);
    } else if(href.match(/^https?:\/\//)){
      e.preventDefault();
      window.open(href, '_blank', 'noopener');
    }
  });
}

function closeSearchPanel(){
  document.getElementById('searchPanel').classList.remove('show');
  clearLocalHighlights();
}

/* ===== FAVORITOS ===== */
var FAV_KEY = 'terraZ_favorites';
function getFavorites(){ try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch(e){ return []; } }
function saveFavorites(list){ try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch(e){ console.error(e); } }
function isFavorite(name){ return getFavorites().indexOf(name) !== -1; }

function toggleFavorite(name, event){
  if(event){ event.stopPropagation(); event.preventDefault(); }
  var favs = getFavorites();
  var idx = favs.indexOf(name);
  if(idx === -1){ favs.push(name); showToast('⭐ "' + name + '" adicionado aos favoritos', 'success', 2000); }
  else { favs.splice(idx, 1); showToast('"' + name + '" removido dos favoritos', 'info', 2000); }
  saveFavorites(favs);
  updateAllCardFavorites();
  var panel = document.getElementById('favoritesPanel');
  if(panel && panel.classList.contains('show')) showFavoritesPanel();
}

function updateAllCardFavorites(){
  document.querySelectorAll('.card').forEach(function(card){
    var name = getCardName(card);
    if(!name) return;
    if(isFavorite(name)) card.classList.add('is-favorite');
    else card.classList.remove('is-favorite');
    var btn = card.querySelector('.fav-btn');
    if(btn) btn.textContent = isFavorite(name) ? '★' : '☆';
  });
}

function getCardName(card){
  var h4 = card.querySelector('h4');
  if(!h4) return null;
  var t = h4.textContent.replace(/^[^\w]*\s*/,'').trim();
  t = t.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s⭐]+/u,'').trim();
  return t;
}

function attachFavoriteButtons(){
  document.querySelectorAll('.card').forEach(function(card){
    var name = getCardName(card);
    if(!name) return;
    if(card.querySelector('.fav-btn')) return;
    var btn = document.createElement('button');
    btn.className = 'fav-btn';
    btn.setAttribute('aria-label', 'Marcar como favorito');
    btn.textContent = isFavorite(name) ? '★' : '☆';
    btn.addEventListener('click', function(e){ toggleFavorite(name, e); });
    card.appendChild(btn);
  });
  updateAllCardFavorites();
}

function showFavoritesPanel(){
  var panel = document.getElementById('favoritesPanel');
  var favs = getFavorites();
  var body = panel.querySelector('.fav-body') || panel;
  var html = '';
  if(favs.length === 0){
    html = '<div class="fav-empty">Nenhum favorito ainda. Clique na ☆ de qualquer card para adicionar.</div>';
  } else {
    favs.forEach(function(name){
      html += '<div class="fav-item"><span class="fav-name" data-open="' + escapeAttr(name) + '">' + escapeHtml(name) + '</span><div class="fav-actions"><button data-remove="' + escapeAttr(name) + '">🗑 Remover</button></div></div>';
    });
  }
  body.innerHTML = html;
  body.querySelectorAll('[data-open]').forEach(function(el){
    el.addEventListener('click', function(){
      var name = el.getAttribute('data-open');
      var card = findCardByName(name);
      if(card){
        closeFavoritesPanel();
        var ficha = card.getAttribute('data-ficha');
        if(ficha) openFichaModal(ficha);
        else {
          card.scrollIntoView({behavior:'smooth', block:'center'});
          card.style.transition = 'box-shadow .3s';
          card.style.boxShadow = '0 0 0 4px var(--accent2)';
          setTimeout(function(){ card.style.boxShadow = ''; }, 1500);
        }
      } else showToast('Card não encontrado. Talvez esteja em outra aba.', 'warning');
    });
  });
  body.querySelectorAll('[data-remove]').forEach(function(el){
    el.addEventListener('click', function(){ toggleFavorite(el.getAttribute('data-remove')); });
  });
  panel.classList.add('show');
}

function closeFavoritesPanel(){ document.getElementById('favoritesPanel').classList.remove('show'); }

function findCardByName(name){
  var found = null;
  document.querySelectorAll('.card').forEach(function(card){
    if(found) return;
    if(getCardName(card) === name) found = card;
  });
  return found;
}

function initFavoritesPanel(){
  var panel = document.getElementById('favoritesPanel');
  if(!panel || panel.querySelector('.fav-head')) return;
  var head = document.createElement('div');
  head.className = 'fav-head';
  head.innerHTML = '<span class="title">⭐ Favoritos</span><button class="search-close" id="favClose">✕</button>';
  panel.appendChild(head);
  var body = document.createElement('div');
  body.className = 'fav-body';
  panel.appendChild(body);
  document.getElementById('favClose').addEventListener('click', closeFavoritesPanel);
}

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
  document.getElementById('fichaSearchBtn').addEventListener('click', function(){ searchOnFandom(characterName); });
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

function searchOnFandom(term){
  closeFichaModal();
  document.getElementById('searchInput').value = term;
  fandomHistory = []; currentFandomTitle = null;
  switchSearchMode('fandom');
  executeSearch();
  window.scrollTo({top:0, behavior:'smooth'});
}

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
        searchOnFandom(title);
      });
    }
  });
}

/* ===== MODO EDIÇÃO ===== */
var editMode = false, fallbackEditCounter = 0;
var EDITS_KEY = 'terraZ_v1_edits';
var EDITS_BACKUP_FORMAT = 'terra-z-edits';
var EDITS_BACKUP_VERSION = 2;
var SEL = 'h1,h2,h3,h4,h5,h6,p,td,th,li,.timeline-year,.timeline-text,.card p,.info-box,.stat-num,.stat-label,.mast-subtitle,.home-hero .lead,.pull-quote,.event-item .title,.event-item .desc,.photo figcaption,.fc-value,.fc-desc';

function getAll(){ return document.querySelectorAll('.container ' + SEL); }

function initEditables(){
  getAll().forEach(function(el){
    if(el.dataset.editId) return;
    fallbackEditCounter++;
    el.dataset.editId = 'tz-runtime-' + String(fallbackEditCounter).padStart(4, '0');
    console.warn('Terra Z: elemento editável sem data-edit-id permanente.', el);
  });
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

function saveEdits(silent){
  initEditables();
  var data = {};
  getAll().forEach(function(el){ data[el.dataset.editId] = el.innerHTML; });
  try {
    localStorage.setItem(EDITS_KEY, JSON.stringify(data));
    if(!silent) showToast('Edições salvas com sucesso', 'success');
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

/* ===== GRAFO DE RELAÇÕES ===== */
var GRAPH_KEY = 'terraZ_graph_v2';
var GRAPH_BACKUP_KEY = 'terraZ_graph_backup_v2';
var defaultGraph = (window.TerraZData && window.TerraZData.defaultGraph) || { quadrants:[], nodes:[], edges:[] };
if(!window.TerraZData || !window.TerraZData.defaultGraph){
  console.error('Terra Z: data/relations.js não foi carregado.');
}

var graphData = null;
function loadGraph(){
  try { var saved = localStorage.getItem(GRAPH_KEY); if(saved) return JSON.parse(saved); } catch(e){ console.error(e); }
  return JSON.parse(JSON.stringify(defaultGraph));
}
function saveGraph(){
  try {
    localStorage.setItem(GRAPH_BACKUP_KEY, localStorage.getItem(GRAPH_KEY) || JSON.stringify(defaultGraph));
    localStorage.setItem(GRAPH_KEY, JSON.stringify(graphData));
  } catch(e){ console.error(e); }
}
function edgeColor(type){
  return { family:'#c4186f', ally:'#0064a8', tension:'#cc2222', clone:'#7a4aff' }[type] || '#3a3028';
}

function renderGraph(){
  var svg = document.getElementById('graphSvg');
  if(!svg || !graphData) return;
  var html = '';
  html += '<defs><filter id="glowNode"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  graphData.quadrants.forEach(function(q){
    html += '<rect x="' + q.x + '" y="' + q.y + '" width="' + q.w + '" height="' + q.h + '" rx="8" fill="' + q.bg + '" stroke="' + q.color + '" stroke-width="1.5"/>';
    html += '<text x="' + (q.x + q.w/2) + '" y="' + (q.y + 28) + '" font-family="Oswald,sans-serif" font-size="16" fill="' + q.color + '" text-anchor="middle" letter-spacing="3" font-weight="700">' + escapeHtml(q.title) + '</text>';
  });
  var nodeMap = {};
  graphData.nodes.forEach(function(n){ nodeMap[n.id] = n; });
  graphData.edges.forEach(function(e){
    var a = nodeMap[e.from], b = nodeMap[e.to];
    if(!a || !b) return;
    var stroke = edgeColor(e.type);
    var dash = (e.type === 'tension' || e.type === 'clone') ? ' stroke-dasharray="5,4"' : '';
    html += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="' + stroke + '" stroke-width="2"' + dash + ' opacity="0.75"/>';
    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.sqrt(dx*dx + dy*dy) || 1;
    var offX = -dy / len * 14, offY = dx / len * 14;
    html += '<text x="' + (mx + offX) + '" y="' + (my + offY) + '" font-family="Share Tech Mono,monospace" font-size="9" fill="' + stroke + '" text-anchor="middle" style="paint-order:stroke;stroke:var(--paper3);stroke-width:4px;stroke-linejoin:round">' + escapeHtml(e.label) + '</text>';
  });
  graphData.nodes.forEach(function(n){
    html += '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + n.r + '" fill="' + n.color + '" stroke="#fff" stroke-width="3" filter="url(#glowNode)"/>';
    html += '<text x="' + n.x + '" y="' + (n.y + Math.round(n.r * 0.13)) + '" font-family="Oswald,sans-serif" font-size="' + Math.max(10, Math.round(n.r * 0.37)) + '" fill="#fff" text-anchor="middle" font-weight="700">' + escapeHtml(n.label) + '</text>';
  });
  svg.innerHTML = html;
}

function openGraphEditor(){
  var modal = document.getElementById('graphEditorModal');
  if(!modal) return;
  renderGraphEditorForm();
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeGraphEditor(){ document.getElementById('graphEditorModal').classList.remove('show'); document.body.style.overflow = ''; }
function cancelGraphEditor(){ closeGraphEditor(); }

function renderGraphEditorForm(){
  var nodesBody = document.getElementById('geNodesBody');
  var edgesBody = document.getElementById('geEdgesBody');
  if(!nodesBody || !edgesBody) return;

  var html = '';
  graphData.nodes.forEach(function(n, i){
    html += '<tr data-index="' + i + '">';
    html += '<td><input type="text" value="' + escapeAttr(n.id) + '" data-graph-kind="node" data-index="' + i + '" data-field="id"></td>';
    html += '<td><input type="text" value="' + escapeAttr(n.label) + '" data-graph-kind="node" data-index="' + i + '" data-field="label"></td>';
    html += '<td><input type="number" value="' + n.x + '" data-graph-kind="node" data-index="' + i + '" data-field="x" data-value-type="number"></td>';
    html += '<td><input type="number" value="' + n.y + '" data-graph-kind="node" data-index="' + i + '" data-field="y" data-value-type="number"></td>';
    html += '<td><input type="number" value="' + n.r + '" data-graph-kind="node" data-index="' + i + '" data-field="r" data-value-type="number"></td>';
    html += '<td><input type="color" value="' + escapeAttr(n.color) + '" data-graph-kind="node" data-index="' + i + '" data-field="color"></td>';
    html += '<td><button class="ge-btn-remove" data-graph-action="remove-node" data-index="' + i + '">🗑</button></td></tr>';
  });
  nodesBody.innerHTML = html;

  function nodeOptions(selectedId){
    return graphData.nodes.map(function(n){
      return '<option value="' + escapeAttr(n.id) + '"' + (n.id === selectedId ? ' selected' : '') + '>' + escapeHtml(n.label) + '</option>';
    }).join('');
  }

  var htmlE = '';
  graphData.edges.forEach(function(e, i){
    htmlE += '<tr data-index="' + i + '">';
    htmlE += '<td><select data-graph-kind="edge" data-index="' + i + '" data-field="from">' + nodeOptions(e.from) + '</select></td>';
    htmlE += '<td><select data-graph-kind="edge" data-index="' + i + '" data-field="to">' + nodeOptions(e.to) + '</select></td>';
    htmlE += '<td><input type="text" value="' + escapeAttr(e.label) + '" data-graph-kind="edge" data-index="' + i + '" data-field="label"></td>';
    htmlE += '<td><select data-graph-kind="edge" data-index="' + i + '" data-field="type">';
    ['family','ally','tension','clone'].forEach(function(t){
      htmlE += '<option value="' + t + '"' + (e.type === t ? ' selected' : '') + '>' + t + '</option>';
    });
    htmlE += '</select></td>';
    htmlE += '<td><button class="ge-btn-remove" data-graph-action="remove-edge" data-index="' + i + '">🗑</button></td></tr>';
  });
  edgesBody.innerHTML = htmlE;
}

function updateGraphNode(index, field, value){ if(graphData.nodes[index]) graphData.nodes[index][field] = value; }
function updateGraphEdge(index, field, value){ if(graphData.edges[index]) graphData.edges[index][field] = value; }
function addGraphNode(){
  var id = 'novo_' + Date.now();
  graphData.nodes.push({ id: id, label:'NOVO', x:500, y:400, color:'#3a3028', r:34 });
  renderGraphEditorForm();
}
function removeGraphNode(index){
  var node = graphData.nodes[index];
  if(!node) return;
  if(!confirm('Remover o nó "' + node.label + '"? As conexões dele também serão removidas.')) return;
  graphData.nodes.splice(index, 1);
  graphData.edges = graphData.edges.filter(function(e){ return e.from !== node.id && e.to !== node.id; });
  renderGraphEditorForm();
}
function addGraphEdge(){
  if(graphData.nodes.length < 2){ showToast('Adicione pelo menos 2 nós antes.', 'warning'); return; }
  graphData.edges.push({ from: graphData.nodes[0].id, to: graphData.nodes[1].id, type:'ally', label:'nova' });
  renderGraphEditorForm();
}
function removeGraphEdge(index){ graphData.edges.splice(index, 1); renderGraphEditorForm(); }

function saveGraphEditor(){
  saveGraph();
  renderGraph();
  closeGraphEditor();
  showToast('✅ Grafo atualizado e salvo', 'success');
}
function resetGraph(){
  showConfirm('Restaurar Grafo Padrão', 'Isso apagará todas as suas alterações no grafo e restaurará a versão original. Continuar?', function(){
    graphData = JSON.parse(JSON.stringify(defaultGraph));
    saveGraph();
    renderGraph();
    showToast('Grafo restaurado ao padrão', 'info');
  }, 'Restaurar');
}
function restoreGraphFromBackup(){
  try {
    var backup = localStorage.getItem(GRAPH_BACKUP_KEY);
    if(!backup){ showToast('Nenhum backup anterior encontrado', 'warning'); return; }
    graphData = JSON.parse(backup);
    renderGraphEditorForm();
    showToast('Backup carregado no editor. Clique em Salvar para confirmar.', 'info', 4000);
  } catch(e){ showToast('Erro ao restaurar backup', 'error'); }
}

function setupGraphEditorEvents(){
  var staticActions = {
    graphOpenBtn: openGraphEditor,
    graphResetBtn: resetGraph,
    graphEditorClose: closeGraphEditor,
    graphAddNodeBtn: addGraphNode,
    graphAddEdgeBtn: addGraphEdge,
    graphCancelBtn: cancelGraphEditor,
    graphRestoreBtn: restoreGraphFromBackup,
    graphSaveBtn: saveGraphEditor
  };

  Object.keys(staticActions).forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.addEventListener('click', staticActions[id]);
  });

  var modal = document.getElementById('graphEditorModal');
  if(modal){
    modal.addEventListener('click', function(e){
      if(e.target === modal) closeGraphEditor();
    });
  }

  function handleFieldChange(e){
    var el = e.target.closest('[data-graph-kind][data-index][data-field]');
    if(!el) return;

    var index = parseInt(el.getAttribute('data-index'), 10);
    var field = el.getAttribute('data-field');
    var kind = el.getAttribute('data-graph-kind');
    var value = el.value;

    if(el.getAttribute('data-value-type') === 'number'){
      value = parseFloat(value);
      if(!Number.isFinite(value)) return;
    }

    if(kind === 'node') updateGraphNode(index, field, value);
    else if(kind === 'edge') updateGraphEdge(index, field, value);
  }

  var nodesBody = document.getElementById('geNodesBody');
  if(nodesBody){
    nodesBody.addEventListener('change', handleFieldChange);
    nodesBody.addEventListener('click', function(e){
      var btn = e.target.closest('[data-graph-action="remove-node"]');
      if(!btn) return;
      removeGraphNode(parseInt(btn.getAttribute('data-index'), 10));
    });
  }

  var edgesBody = document.getElementById('geEdgesBody');
  if(edgesBody){
    edgesBody.addEventListener('change', handleFieldChange);
    edgesBody.addEventListener('click', function(e){
      var btn = e.target.closest('[data-graph-action="remove-edge"]');
      if(!btn) return;
      removeGraphEdge(parseInt(btn.getAttribute('data-index'), 10));
    });
  }
}

/* ===== TECLADO ===== */
document.addEventListener('keydown', function(e){
  if((e.ctrlKey || e.metaKey) && e.key === 's'){
    e.preventDefault();
    if(editMode) saveEdits();
    else showToast('Ative o modo de edição primeiro (✏️)', 'warning');
  }
  if(e.altKey && e.key === 'ArrowLeft'){
    if(document.getElementById('fandomModal').classList.contains('show')){ e.preventDefault(); goBackFandom(); }
  }
  if(document.getElementById('presentationModal').classList.contains('show')){
    if(e.key === 'ArrowRight'){ e.preventDefault(); presNext(); }
    if(e.key === 'ArrowLeft'){ e.preventDefault(); presPrev(); }
  }
  if(e.key === 'Escape'){
    if(document.getElementById('presentationModal').classList.contains('show')){ closePresentation(); return; }
    if(document.getElementById('graphEditorModal').classList.contains('show')){ closeGraphEditor(); return; }
    if(readingMode){ toggleReadingMode(); return; }
    closeLightbox();
    closeFandomModal();
    closeFichaModal();
    closeSearchPanel();
    closeFavoritesPanel();
    closeDrawer();
  }
});

/* ===== EXPOR FUNÇÕES ===== */
window.toggleEdit = toggleEdit;
window.saveEdits = saveEdits;
window.exportEdits = exportEdits;
window.exportHtml = exportHtml;
window.importEdits = importEdits;
window.resetEdits = resetEdits;
window.executeSearch = executeSearch;
window.closeFandomModal = closeFandomModal;
window.closeSearchPanel = closeSearchPanel;
window.closeLightbox = closeLightbox;
window.openFichaModal = openFichaModal;
window.closeFichaModal = closeFichaModal;
window.searchOnFandom = searchOnFandom;
window.showToast = showToast;
window.goBackFandom = goBackFandom;
window.toggleReadingMode = toggleReadingMode;
window.toggleChangelog = toggleChangelog;
window.switchSearchMode = switchSearchMode;
window.toggleFavorite = toggleFavorite;
window.showFavoritesPanel = showFavoritesPanel;
window.closeFavoritesPanel = closeFavoritesPanel;
window.togglePresentation = togglePresentation;

/* ===== INICIALIZAÇÃO ===== */
document.addEventListener('DOMContentLoaded', function(){
  try { buildGlobalSidebar(); } catch(e){ console.error('buildGlobalSidebar:', e); }
  try { initEditables(); } catch(e){ console.error('initEditables:', e); }
  try { loadEdits(); } catch(e){ console.error('loadEdits:', e); }
  try { attachFichaHandlers(); } catch(e){ console.error('attachFichaHandlers:', e); }
  try { attachFavoriteButtons(); } catch(e){ console.error('attachFavoriteButtons:', e); }
  try { initFavoritesPanel(); } catch(e){ console.error('initFavoritesPanel:', e); }
  try { setupModalBodyDelegation(); } catch(e){ console.error('setupModalBodyDelegation:', e); }
  try { initInteractiveTimeline(); } catch(e){ console.error('initInteractiveTimeline:', e); }
  try { graphData = loadGraph(); renderGraph(); } catch(e){ console.error('graph:', e); }
  try { setupGraphEditorEvents(); } catch(e){ console.error('graph events:', e); }
  try { syncGlobalSidebar('tab-home', null); } catch(e){ console.error('syncGlobalSidebar:', e); }
  try {
    if(localStorage.getItem('terraZ_reading') === '1'){
      readingMode = true;
      document.body.classList.add('reading-mode');
    }
  } catch(e){ console.error('reading:', e); }
  showToast('Universo Terra Z · v1.3.2', 'info', 3500);
});

})();
