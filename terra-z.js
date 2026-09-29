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

function sanitizeWikiHtml(html){
  var temp = document.createElement('div');
  temp.innerHTML = html;
  temp.querySelectorAll('script, style, link, iframe, meta, .mw-editsection, .noprint, .navbox, .metadata, .toc, .reference, sup.reference, .mw-collapsible-toggle, .messagebox, .ambox, .dablink, .hatnote').forEach(function(el){ el.remove(); });
  temp.querySelectorAll('*').forEach(function(el){
    Array.from(el.attributes).forEach(function(attr){ if(attr.name.startsWith('on')) el.removeAttribute(attr.name); });
  });
  temp.querySelectorAll('a.new').forEach(function(a){ a.removeAttribute('href'); });
  var parserOutput = temp.querySelector('.mw-parser-output');
  return (parserOutput || temp).innerHTML;
}

function processWikiContent(root){
  root.querySelectorAll('img').forEach(function(img){
    var dataSrc = img.getAttribute('data-src');
    var realSrc = dataSrc || img.getAttribute('data-image-src') || img.getAttribute('src');
    if(!realSrc){ img.remove(); return; }
    if(realSrc.startsWith('data:image/gif') && !dataSrc){
      var srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
      if(srcset) realSrc = srcset.split(',')[0].trim().split(' ')[0];
      else { img.remove(); return; }
    }
    if(realSrc.startsWith('//')) realSrc = 'https:' + realSrc;
    else if(realSrc.startsWith('/')) realSrc = 'https://dc.fandom.com' + realSrc;
    else if(!realSrc.match(/^https?:/)) realSrc = 'https://dc.fandom.com/wiki/' + realSrc;
    img.setAttribute('src', realSrc);
    ['data-src','data-srcset','srcset','loading','decoding'].forEach(function(a){ img.removeAttribute(a); });
    img.classList.remove('lazyload','lazyloading');
  });
  root.querySelectorAll('a[href]').forEach(function(a){
    var href = a.getAttribute('href');
    if(!href) return;
    if(href.startsWith('/wiki/')) href = 'https://dc.fandom.com' + href;
    else if(href.startsWith('//')) href = 'https:' + href;
    a.setAttribute('href', href);
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
var fichasPersonagens = {
  "Tristan Queen": {
    eyebrow: "🏹 Ranger · Filho de Arqueiros",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Tristan Queen<br><strong>Codinome:</strong> Ranger<br><strong>Idade:</strong> 20 anos (nascido em 2007)<br><strong>Pais:</strong> Oliver Queen e Dinah Lance<br><strong>Local:</strong> Vanguard Bay – O Dique</p>" },
      { title:"📖 História", content:"<p>Filho biológico de Oliver e Dinah, Tristan cresceu em Star City até os 15 anos. Após a suposta morte do pai em 2020 e a ausência da mãe, foi criado pelo meio-irmão Connor Hawke.</p><p>Em 2022, aos 15 anos, fugiu para Gotham para treinar com Jason Todd, tornando-se um vigilante frio e calculista. Adotou o codinome <em>Ranger</em> e se isolou em Vanguard Bay em 2026.</p>" },
      { title:"🎯 Personalidade", content:"<p>Frio, calculista e independente. Carrega mágoa profunda do pai e culpa silenciosa pela mãe. Tem no irmão Connor o único elo real com a família.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li>Arco e flecha tático</li><li>Pistolas e explosivos</li><li>Combate corpo a corpo letal</li><li>Flechas sônicas, flechas de garra</li></ul>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Oliver:</strong> Mágoa profunda</li><li><strong>Dinah:</strong> Culpa silenciosa</li><li><strong>Connor:</strong> Irmãos próximos</li><li><strong>Jason Todd:</strong> Mentor</li></ul>" }
    ],
    secrets: [
      "Não sabe que Dinah tentou reconectar várias vezes nos últimos anos.",
      "Ainda tem o arco original do pai guardado, sem nunca ter usado.",
      "Jason lhe contou sobre a Pérola de Lázaro, mas ele nunca contou a ninguém."
    ]
  },
  "Riot": {
    eyebrow: "💀 Clone Czarniano · Filho Adotivo de Kendra",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Riot<br><strong>Idade:</strong> Aparência 20 anos (cronológico: 5)<br><strong>Origem:</strong> Clone da Cadmus, resgatado em 2022<br><strong>Mãe adotiva:</strong> Kendra Saunders<br><strong>Local:</strong> Vanguard Bay – O Dique / A Fenda</p>" },
      { title:"📖 História", content:"<p>Criado por cientistas demitidos da Cadmus. Seria descartado, mas foi resgatado por Kendra em 2022 na Tower of Fate. Durante o resgate, o clone bebê mordeu Lobo — e o Czarniano prometeu dar 50 anos antes de caçá-lo. <strong>Prazo: 2072.</strong></p>" },
      { title:"🎯 Personalidade", content:"<p>Rebelde, impulsivo e leal. Carrega o peso de saber o próprio destino — e ninguém mais sabe que ele sabe.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li>Força czarniana nível Lobo</li><li>Resistência sobre-humana</li><li>Regeneração acelerada</li><li>Crescimento acelerado</li></ul>" }
    ],
    secrets: [
      "SABE da promessa de Lobo (2072) — descobriu por conta própria e nunca contou a Kendra.",
      "Kendra guarda um vídeo do dia do resgate que nunca mostrou a ele.",
      "Ainda não decidiu se vai tentar fugir do confronto de 2072 ou enfrentar Lobo de frente."
    ]
  },
  "M'ark": {
    eyebrow: "🟢 Híbrido Marciano · Filho de M'gann",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> M'ark<br><strong>Idade:</strong> 23 anos (nascido em 2004)<br><strong>Mãe:</strong> M'gann M'orzz<br><strong>Pai:</strong> Armek (falecido)<br><strong>Local:</strong> Vanguard Bay – Emaranhado</p>" },
      { title:"📖 História", content:"<p>Concebido em 2003-2004, quando Armek enganou e violentou M'gann. J'onn descobriu e matou Armek antes que ele soubesse da gravidez. Criado em segredo por M'gann e J'onn.</p>" },
      { title:"🎯 Personalidade", content:"<p>Estóico, quieto, com medo profundo de sua herança marciana branca. Vive sob o peso de uma mentira pública.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li>Telepatia e telecinese</li><li>Intangibilidade e invisibilidade</li><li>Regeneração limitada</li><li>Disfarce marciano</li></ul>" }
    ],
    secrets: [
      "É Marciano Branco, não Verde — o público não sabe.",
      "É filho do estupro de Armek.",
      "J'onn matou seu pai biológico antes que ele nascesse."
    ]
  },
  "Kendra Saunders": {
    eyebrow: "🦅 Reencarnação de Shiera Hall",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Kendra Shiera Saunders<br><strong>Codinome:</strong> Hawkgirl<br><strong>Idade:</strong> ~32 anos<br><strong>Local:</strong> Vanguard Bay</p>" },
      { title:"📖 História", content:"<p>Juventude conturbada: perdeu os pais, teve uma filha aos 16 que entregou para adoção, tentou suicídio aos 17. Ao morrer, sua alma foi substituída pela de Shiera Hall. Adotou Riot em 2022.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li>Voo com asas de Nth Metal</li><li>Maça de Nth Metal</li><li>Fator de cura</li><li>Memórias de vidas passadas</li></ul>" },
      { title:"🎯 Personalidade", content:"<p>Forte, resiliente e bem-humorada. Carrega o peso de saber que Lobo virá buscar Riot em 2072.</p>" }
    ],
    secrets: [
      "Sabe da promessa de Lobo — mas não sabe que Riot também descobriu.",
      "Ainda pensa na filha que entregou para adoção em 2011.",
      "Tem pesadelos recorrentes com a morte de Shiera Hall."
    ]
  },
  "Lobo": {
    eyebrow: "💀 O Maioral · Czarniano Imortal",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Lobo<br><strong>Idade:</strong> 400+ anos<br><strong>Espécie:</strong> Czarniano<br><strong>Local:</strong> Desconhecido</p>" },
      { title:"📖 História", content:"<p>Nascido em Czárnia. Aos 16 matou metade da população; aos 17, criou uma praga que matou o restante. Em 2022, foi mordido pelo clone bebê Riot e prometeu 50 anos antes de caçá-lo. <strong>Prazo: 2072.</strong></p>" },
      { title:"⚔️ Habilidades", content:"<ul><li>Superforça nível Superman</li><li>Super-velocidade</li><li>Regeneração</li><li>Imortalidade</li><li>Olfato superdesenvolvido</li></ul>" },
      { title:"🎯 Personalidade", content:"<p>Cruel, sujo, violento. Gosta da ideia de caçar mais do que matar.</p>" }
    ],
    secrets: [
      "Sabe que Riot está crescendo e observa de longe.",
      "Pretende fazer da caça um espetáculo público em 2072.",
      "Nunca matou por engano — sempre escolhe as vítimas."
    ]
  },
  "M'gann M'orzz": {
    eyebrow: "🟢 Miss Martian · Marciana Branca",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> M'gann M'orzz<br><strong>Idade:</strong> ~39 anos<br><strong>Origem:</strong> Marciana Branca fugitiva<br><strong>Local:</strong> Buscando M'ark</p>" },
      { title:"📖 História", content:"<p>Chegou à Terra em 2000-2002, fugindo do genocídio em Marte. Em 2003-2004 foi enganada e violentada por Armek. Criou M'ark em segredo por 20 anos. Em 2019 terminou com Conner Kent. Em 2021, quando Conner descobriu M'ark, reataram.</p>" },
      { title:"🎯 Personalidade", content:"<p>Carrega múltiplos traumas: a violência de Armek, a mentira sobre sua raça, o segredo de seu filho.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li>Telepatia e telecinese</li><li>Metamorfose</li><li>Intangibilidade</li><li>Voo</li></ul>" }
    ],
    secrets: [
      "É Marciana Branca — apenas J'onn, Conner, Dick, Garfield e Raven sabem.",
      "Tem um filho (M'ark) — nem todos os Titãs sabem.",
      "Foi estuprada por Armek em 2003-2004.",
      "J'onn matou Armek em vingança."
    ]
  },
  "J'onn J'onzz": {
    eyebrow: "🟢 Caçador de Marte · Último Marciano Verde",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> J'onn J'onzz<br><strong>Codinome:</strong> Caçador de Marte<br><strong>Idade:</strong> ~227 anos<br><strong>Local:</strong> Torre de Vigia</p>" },
      { title:"📖 História", content:"<p>Sobreviveu à Maldição de H'ronmeer. Perdeu esposa e filha. Chegou à Terra nos anos 1950-1960. Em 2006-2007, ao descobrir o que Armek fez com M'gann, viajou a Marte e o matou.</p>" },
      { title:"🎯 Personalidade", content:"<p>Filósofo, pacifista e protetor. Carrega a culpa de ter matado Armek.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li>Telepatia planetária</li><li>Metamorfose</li><li>Intangibilidade</li><li>Regeneração</li><li>Voo</li></ul>" }
    ],
    secrets: [
      "Matou Armek em vingança — ato que nunca contou a M'ark.",
      "Ainda tem pesadelos com a Maldição de H'ronmeer.",
      "Sabe que M'gann esconde outros segredos, mas respeita o silêncio dela."
    ]
  },
  "Oliver Queen": {
    eyebrow: "🏹 O Queen · Agente da JLU",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Oliver Jonas Queen<br><strong>Codinome:</strong> O Queen (ex-Arqueiro Verde)<br><strong>Idade:</strong> 47 anos (nascido em 1980)<br><strong>Status:</strong> Vivo — ressuscitado em 2022<br><strong>Papel:</strong> Agente da Liga da Justiça Sem Limites<br><strong>Local:</strong> Gotham</p>" },
      { title:"📖 História", content:"<p>Fundador do manto do Arqueiro Verde em Star City. Em 2020, uma explosão o sugou para um bolsão dimensional. Dado como morto por dois anos, foi resgatado por Cyborg e Flash em 2022. Ao voltar, descobriu que seu filho Connor havia assumido o manto — e decidiu não retomá-lo.</p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Dinah Lance:</strong> Esposa</li><li><strong>Tristan:</strong> Filho distante</li><li><strong>Connor:</strong> Filho que assumiu o manto</li><li><strong>Jason Todd:</strong> Treinou Tristan — Oliver não aprova</li></ul>" }
    ],
    secrets: [
      "Durante o isolamento no bolsão dimensional, teve visões do futuro da família.",
      "Sente culpa por não ter conseguido impedir Dinah de ir para Gotham em 2019.",
      "Reconhece que Connor é um arqueiro melhor do que ele jamais foi."
    ]
  },
  "Dinah Lance": {
    eyebrow: "🐤 Canário Negro · Líder das Aves de Rapina",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Dinah Laurel Lance<br><strong>Codinome:</strong> Canário Negro<br><strong>Idade:</strong> 40 anos<br><strong>Status:</strong> Viva<br><strong>Papel:</strong> Fundadora das Aves de Rapina<br><strong>Problema:</strong> Poderes (Grito Canário) falhando</p>" },
      { title:"📖 História", content:"<p>Em 2019, viajou para Gotham para ajudar Bárbara Gordon e fundou as Aves de Rapina. Estava em Gotham quando Oliver \"morreu\" em 2020. Desde então, tenta reconciliar a família.</p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Oliver Queen:</strong> Marido</li><li><strong>Tristan:</strong> Filho — relação fraturada</li><li><strong>Bárbara Gordon:</strong> Melhor amiga</li><li><strong>Connor:</strong> Gratidão</li></ul>" }
    ],
    secrets: [
      "Seus poderes estão falhando por causa da distorção do Rei Ômega.",
      "Sente que Tristan a culpa pela \"morte\" de Oliver.",
      "Considera deixar as Aves de Rapina para focar na família."
    ]
  },
  "Connor Hawke": {
    eyebrow: "🏹 Arqueiro Verde · Herói de Star City",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Connor Hawke<br><strong>Codinome:</strong> Arqueiro Verde (atual)<br><strong>Idade:</strong> 25 anos (nascido em 2002)<br><strong>Papel:</strong> Herói principal de Star City<br><strong>Assumiu o manto:</strong> 2020</p>" },
      { title:"📖 História", content:"<p>Filho biológico de Oliver Queen com Sandra Hawke. Em 2020, quando Oliver \"morreu\", assumiu o manto com o apoio de Dinah. Cuidou de Tristan durante o luto.</p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Oliver:</strong> Pai</li><li><strong>Tristan:</strong> Irmão mais novo — elo de comunicação</li><li><strong>Dinah:</strong> Madrasta</li></ul>" }
    ],
    secrets: [
      "Nunca contou a Tristan que estava com Oliver no dia da explosão de 2020.",
      "Sente que Oliver ainda o vê como \"substituto\".",
      "Considera passar o manto adiante em alguns anos."
    ]
  },
  "Jason Todd": {
    eyebrow: "🦇 Capuz Vermelho · Líder dos Novos Titãs",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Jason Peter Todd<br><strong>Codinome:</strong> Capuz Vermelho<br><strong>Idade:</strong> 23 anos (nascido em 2004)<br><strong>Status:</strong> Vivo — ressuscitado em 2021<br><strong>Papel:</strong> Treinou Tristan (2022–2025). Líder dos Novos Titãs<br><strong>Local:</strong> Gotham</p>" },
      { title:"📖 História", content:"<p>Segundo Robin, morto pelo Coringa em 2019 aos 15 anos. Ressuscitado em 2021 pela Pérola de Lázaro. Em 2022, aceitou treinar Tristan Queen em Gotham. Em 2026, foi escolhido para liderar os Novos Titãs.</p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Tristan:</strong> Ex-aluno, figura paterna distorcida</li><li><strong>Bruce:</strong> Relação complexa</li><li><strong>Tim Drake:</strong> Irmão adotivo</li></ul>" }
    ],
    secrets: [
      "Nunca contou a Tristan que a Pérola de Lázaro foi obtida por Talia al-Ghul.",
      "Ainda tem pesadelos com a morte de 2019.",
      "Pretende deixar Gotham permanentemente quando Tristan estiver pronto."
    ]
  },
  "Conner Kent": {
    eyebrow: "🦸 Superboy · Clone de Superman e Lex Luthor",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Conner Kent (Kon-El)<br><strong>Codinome:</strong> Superboy<br><strong>Idade:</strong> ~29 anos<br><strong>Origem:</strong> Clone híbrido de Superman e Lex Luthor<br><strong>Papel:</strong> Figura paterna de M'ark</p>" },
      { title:"📖 História", content:"<p>Criado em laboratório. Conheceu M'gann nos Jovens Titãs. Em 2019, M'gann terminou com ele sem explicação. Em 2021, investigou o término e descobriu M'ark. Reataram e assumiu papel de figura paterna.</p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>M'gann:</strong> Namorada</li><li><strong>M'ark:</strong> Filho adotivo de fato</li><li><strong>Superman:</strong> Doador genético</li><li><strong>Lex Luthor:</strong> Doador genético (odeia)</li></ul>" }
    ],
    secrets: [
      "Ainda teme, em silêncio, que M'ark possa herdar a crueldade de Armek.",
      "Nunca contou a M'gann sobre os pesadelos com Lex Luthor.",
      "Considera pedir a M'ark para chamá-lo de \"pai\"."
    ]
  }
};

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
var editMode = false, counter = 0;
var SEL = 'h1,h2,h3,h4,h5,h6,p,td,th,li,.timeline-year,.timeline-text,.card p,.info-box,.stat-num,.stat-label,.mast-subtitle,.home-hero .lead,.pull-quote,.event-item .title,.event-item .desc,.photo figcaption,.fc-value,.fc-desc';

function getAll(){ return document.querySelectorAll('.container ' + SEL); }
function initEditables(){ getAll().forEach(function(el){ if(!el.dataset.editId) el.dataset.editId = 'e_' + (counter++); }); }

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
    localStorage.setItem('terraZ_v1_edits', JSON.stringify(data));
    if(!silent) showToast('Edições salvas com sucesso', 'success');
  } catch(e){ showToast('Erro ao salvar: ' + e.message, 'error'); }
}

function loadEdits(){
  var s = localStorage.getItem('terraZ_v1_edits');
  if(!s) return;
  try {
    var data = JSON.parse(s);
    initEditables();
    getAll().forEach(function(el){ if(data[el.dataset.editId] !== undefined) el.innerHTML = data[el.dataset.editId]; });
  } catch(e){ console.error(e); }
}

function exportHtml(){
  saveEdits(true);
  var docClone = document.documentElement.cloneNode(true);
  var origEls = document.querySelectorAll('.container ' + SEL);
  var cloneEls = docClone.querySelectorAll('.container ' + SEL);
  origEls.forEach(function(el, idx){ if(cloneEls[idx]) cloneEls[idx].innerHTML = el.innerHTML; });
  cloneEls.forEach(function(el){ el.classList.remove('edit-active'); el.removeAttribute('contenteditable'); });
  ['.search-panel.show', '#fandomModal.show', '#fichaModal.show', '#confirmModal.show', '#lightbox.show', '#toastContainer', '#presentationModal.show', '#favoritesPanel.show', '#graphEditorModal.show'].forEach(function(sel){
    cloneEls.forEach(function(el){ if(el.matches && el.matches(sel)) el.remove(); });
  });
  var html = '<!DOCTYPE html>\n' + docClone.outerHTML;
  var blob = new Blob([html], {type:'text/html;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  var date = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = 'index.html';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('HTML exportado como "index.html"', 'success', 4500);
}

function exportEdits(){
  saveEdits(true);
  var s = localStorage.getItem('terraZ_v1_edits');
  if(!s){ showToast('Nada para exportar', 'warning'); return; }
  var blob = new Blob([s], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'terra-z-backup-' + new Date().toISOString().slice(0,10) + '.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('Backup JSON exportado', 'success');
}

function importEdits(){
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = function(e){
    var f = e.target.files[0]; if(!f) return;
    var r = new FileReader();
    r.onload = function(ev){
      try {
        JSON.parse(ev.target.result);
        localStorage.setItem('terraZ_v1_edits', ev.target.result);
        showToast('Backup importado! Recarregando...', 'success');
        setTimeout(function(){ location.reload(); }, 1200);
      } catch(err){ showToast('Arquivo inválido: ' + err.message, 'error'); }
    };
    r.readAsText(f);
  };
  inp.click();
}

function resetEdits(){
  showConfirm('Confirmar Reset', 'Todas as edições salvas serão apagadas. Deseja continuar?', function(){
    localStorage.removeItem('terraZ_v1_edits');
    showToast('Edições apagadas. Recarregando...', 'info');
    setTimeout(function(){ location.reload(); }, 1000);
  }, 'Resetar');
}

var AUTO_BACKUP_KEY = 'terraZ_v1_backups';
function autoBackup(){
  var current = localStorage.getItem('terraZ_v1_edits');
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
var defaultGraph = {
  quadrants: [
    { id:'queen', title:'FAMÍLIA QUEEN', x:20, y:20, w:470, h:340, color:'#c45a1c', bg:'rgba(196,90,28,.06)' },
    { id:'wayne', title:'FAMÍLIA WAYNE', x:510, y:20, w:470, h:340, color:'#0064a8', bg:'rgba(0,100,168,.06)' },
    { id:'marciano', title:'NÚCLEO MARCIANO', x:20, y:380, w:470, h:320, color:'#0a8a4a', bg:'rgba(10,138,74,.06)' },
    { id:'lobo', title:'PRAZO DE LOBO', x:510, y:380, w:470, h:320, color:'#7a4aff', bg:'rgba(122,74,255,.06)' }
  ],
  nodes: [
    { id:'oliver', label:'OLIVER', x:140, y:130, color:'#c45a1c', r:34 },
    { id:'dinah', label:'DINAH', x:140, y:240, color:'#8b1a1a', r:34 },
    { id:'tristan', label:'TRISTAN', x:300, y:240, color:'#c45a1c', r:34 },
    { id:'connor', label:'CONNOR', x:400, y:130, color:'#3a3028', r:34 },
    { id:'bruce', label:'BRUCE', x:700, y:130, color:'#1a1512', r:34 },
    { id:'damian', label:'DAMIAN', x:800, y:130, color:'#8b1a1a', r:34 },
    { id:'jason', label:'JASON', x:600, y:240, color:'#8b1a1a', r:34 },
    { id:'dick', label:'DICK', x:700, y:240, color:'#8b1a1a', r:34 },
    { id:'tim', label:'TIM', x:800, y:240, color:'#8b1a1a', r:34 },
    { id:'mgann', label:"M'GANN", x:120, y:470, color:'#0a8a4a', r:34 },
    { id:'conner2', label:'CONNER', x:400, y:470, color:'#0064a8', r:34 },
    { id:'mark', label:"M'ARK", x:260, y:580, color:'#0a8a4a', r:34 },
    { id:'armek', label:'ARMEK', x:120, y:650, color:'#3a3028', r:34 },
    { id:'jonn', label:"J'ONN", x:400, y:650, color:'#0a8a4a', r:34 },
    { id:'lobo', label:'LOBO', x:660, y:490, color:'#3a3028', r:40 },
    { id:'riot', label:'RIOT', x:660, y:620, color:'#3a3028', r:40 },
    { id:'kendra', label:'KENDRA', x:800, y:620, color:'#8b1a1a', r:34 }
  ],
  edges: [
    { from:'oliver', to:'dinah', type:'family', label:'casal' },
    { from:'oliver', to:'tristan', type:'family', label:'pai' },
    { from:'dinah', to:'tristan', type:'family', label:'mãe' },
    { from:'oliver', to:'connor', type:'family', label:'pai' },
    { from:'tristan', to:'connor', type:'family', label:'irmãos' },
    { from:'bruce', to:'damian', type:'family', label:'biológico' },
    { from:'bruce', to:'jason', type:'family', label:'adotivo' },
    { from:'bruce', to:'dick', type:'family', label:'adotivo' },
    { from:'bruce', to:'tim', type:'family', label:'adotivo' },
    { from:'mgann', to:'armek', type:'tension', label:'vítima' },
    { from:'armek', to:'mark', type:'family', label:'pai' },
    { from:'mgann', to:'mark', type:'family', label:'mãe' },
    { from:'mgann', to:'conner2', type:'ally', label:'casal' },
    { from:'mgann', to:'jonn', type:'ally', label:'mentor' },
    { from:'jonn', to:'armek', type:'tension', label:'inimigos' },
    { from:'conner2', to:'mark', type:'ally', label:'paterno' },
    { from:'jonn', to:'mark', type:'ally', label:'mentor' },
    { from:'lobo', to:'riot', type:'clone', label:'origem genética' },
    { from:'kendra', to:'riot', type:'family', label:'mãe adotiva' },
    { from:'kendra', to:'lobo', type:'tension', label:'aliados/inimigos' }
  ]
};

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
    html += '<td><input type="text" value="' + escapeAttr(n.id) + '" onchange="updateGraphNode(' + i + ',\'id\',this.value)"></td>';
    html += '<td><input type="text" value="' + escapeAttr(n.label) + '" onchange="updateGraphNode(' + i + ',\'label\',this.value)"></td>';
    html += '<td><input type="number" value="' + n.x + '" onchange="updateGraphNode(' + i + ',\'x\',parseFloat(this.value))"></td>';
    html += '<td><input type="number" value="' + n.y + '" onchange="updateGraphNode(' + i + ',\'y\',parseFloat(this.value))"></td>';
    html += '<td><input type="number" value="' + n.r + '" onchange="updateGraphNode(' + i + ',\'r\',parseFloat(this.value))"></td>';
    html += '<td><input type="color" value="' + n.color + '" onchange="updateGraphNode(' + i + ',\'color\',this.value)"></td>';
    html += '<td><button class="ge-btn-remove" onclick="removeGraphNode(' + i + ')">🗑</button></td></tr>';
  });
  nodesBody.innerHTML = html;
  var nodeOptions = graphData.nodes.map(function(n){ return '<option value="' + escapeAttr(n.id) + '">' + escapeHtml(n.label) + '</option>'; }).join('');
  var htmlE = '';
  graphData.edges.forEach(function(e, i){
    htmlE += '<tr data-index="' + i + '">';
    htmlE += '<td><select onchange="updateGraphEdge(' + i + ',\'from\',this.value)">' + nodeOptions.replace('value="' + e.from + '"', 'value="' + e.from + '" selected') + '</select></td>';
    htmlE += '<td><select onchange="updateGraphEdge(' + i + ',\'to\',this.value)">' + nodeOptions.replace('value="' + e.to + '"', 'value="' + e.to + '" selected') + '</select></td>';
    htmlE += '<td><input type="text" value="' + escapeAttr(e.label) + '" onchange="updateGraphEdge(' + i + ',\'label\',this.value)"></td>';
    htmlE += '<td><select onchange="updateGraphEdge(' + i + ',\'type\',this.value)">';
    ['family','ally','tension','clone'].forEach(function(t){
      htmlE += '<option value="' + t + '"' + (e.type === t ? ' selected' : '') + '>' + t + '</option>';
    });
    htmlE += '</select></td>';
    htmlE += '<td><button class="ge-btn-remove" onclick="removeGraphEdge(' + i + ')">🗑</button></td></tr>';
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
window.openGraphEditor = openGraphEditor;
window.closeGraphEditor = closeGraphEditor;
window.cancelGraphEditor = cancelGraphEditor;
window.saveGraphEditor = saveGraphEditor;
window.addGraphNode = addGraphNode;
window.removeGraphNode = removeGraphNode;
window.updateGraphNode = updateGraphNode;
window.addGraphEdge = addGraphEdge;
window.removeGraphEdge = removeGraphEdge;
window.updateGraphEdge = updateGraphEdge;
window.resetGraph = resetGraph;
window.restoreGraphFromBackup = restoreGraphFromBackup;

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
