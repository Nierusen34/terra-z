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
var fichasPersonagens = {
  "Tristan Queen": {
    eyebrow: "🏹 Ranger · Filho de Arqueiros",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Tristan Queen<br><strong>Codinome:</strong> Ranger<br><strong>Idade:</strong> 20 anos (nascido em 2007)<br><strong>Pais:</strong> Oliver Queen (biológico) e Dinah Lance (biológica)<br><strong>Irmãos:</strong> Connor Hawke (meio-irmão paterno)<br><strong>Local:</strong> Vanguard Bay – Downtown (cobertura)</p>" },
      { title:"📖 História", content:"<p>Cresceu em Star City até os 12 anos, quando presenciou a discussão entre os pais — Dinah partiu para Gotham logo depois. Aos 13, perdeu o pai para o bolsão dimensional. Foi criado pelo meio-irmão Connor durante o luto.</p><p>Aos 15 anos, decidiu ir para Gotham treinar com Jason Todd. Oliver se opôs e parou de falar com ele a partir daí — teimosia e orgulho. Tristan treinou com Jason entre 2022 e 2025, aprendendo arco tático, furtividade e rastreamento. Em 2026, mudou-se para Vanguard Bay, onde vive em uma cobertura no Downtown sob o codinome <em>Ranger</em>.</p>" },
      { title:"🎯 Personalidade", content:"<p>Frio, calculista, independente e reservado. Mantém controle emocional sob tensão e sempre tem um plano. Não é movido por ressentimento — suas escolhas vêm de dentro, não de mágoas.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li><strong>Arco e flecha:</strong> tático e preciso. Aprendido com Oliver, Connor e Jason.</li><li><strong>Combate corpo a corpo:</strong> letal. Aprendido com Dinah Lance.</li><li><strong>Furtividade:</strong> infiltração e movimento silencioso (com Jason).</li><li><strong>Rastreamento:</strong> seguir alvos em ambiente urbano.</li></ul><p><em>Não usa pistolas nem explosivos. Arsenal focado no arco e no combate corpo a corpo.</em></p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Oliver (pai):</strong> Relação fraturada — mas o silêncio parte de Oliver, não de Tristan. Oliver é teimoso e orgulhoso e não aceita a escolha do filho de ir para Gotham em 2022.</li><li><strong>Dinah (mãe):</strong> Distante, mas sem culpa de Tristan. A culpa é dela — por ter ido para Gotham em 2019 e não ter estado presente em 2020. Conversam por mensagem.</li><li><strong>Connor (irmão):</strong> Irmãos próximos. Connor é o elo de comunicação com a família — figura fraterna estável.</li><li><strong>Jason Todd:</strong> Mentor e figura fraterna oposta a Connor — o contraponto rebelde ao irmão estável.</li><li><strong>Lian Harper:</strong> Amiga de infância, filha de Roy Harper. Conversam frequentemente por mensagem. Atualmente é a Cheshire Cat nos Titãs de Jason.</li></ul>" }
    ],
    secrets: []
  },
  "Riot": {
    eyebrow: "💀 Clone Czarniano · Aprendiz de Kendra",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Riot<br><strong>Idade:</strong> Aparência 20 anos (cronológico: 5)<br><strong>Origem:</strong> Clone da Cadmus, resgatado em 2022<br><strong>Mãe adotiva:</strong> Kendra Saunders (Hawkgirl)<br><strong>Pai genético:</strong> Lobo (Czarniano)<br><strong>Status:</strong> Em missão pessoal em Vanguard Bay (sem local fixo)</p>" },
      { title:"📖 História", content:"<p>Criado por uma equipe dissidente da Cadmus — que depois se tornaria a organização <strong>Sumdac</strong> — como clone do Lobo. Seria descartado, mas foi resgatado em 2022 na <em>Tower of Fate</em> por uma equipe formada por <strong>Kendra Saunders, Oliver Queen, Metamorfo (Rex Mason) e Gladiador Dourado (Michael Carter)</strong>.</p><p>Durante o resgate, o clone bebê mordeu Lobo — e o Czarniano, divertido, prometeu dar 50 anos antes de caçá-lo. Kendra o criou por 5 anos (2022–2027), treinando-o intensamente e <strong>contando a ele sobre a promessa</strong>. Em janeiro de 2027, Kendra o apoiou a ir para Vanguard Bay para investigar a Sumdac sozinho — ele não fugiu.</p>" },
      { title:"🎯 Personalidade", content:"<p>Rebelde no geral — odeia autoridade e regras — mas <strong>respeita e gosta muito de Kendra</strong>, sentindo-se calmo na presença dela. Impulsivo, age antes de pensar. Carrega um <em>rage</em> interno constante, e sua consciência às vezes divaga entre memórias genéticas de Lobo e memórias próprias — quando isso acontece, ele anda sem rumo, quase como um sonâmbulo. Em relação ao destino de 2072, tende a <strong>desafiar</strong> em vez de aceitar.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li><strong>Superforça:</strong> capacidade física sobre-humana.</li><li><strong>Resistência:</strong> suporta danos extremos.</li><li><strong>Regeneração acelerada:</strong> cura rápida.</li><li><strong>Crescimento acelerado:</strong> aparência de 20 anos em apenas 5 de vida.</li><li><strong>Estilo de luta:</strong> cru e bruto — mesmo treinado por Kendra, luta por instinto. Sem armas.</li></ul>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Kendra (mãe adotiva):</strong> Respeito e afeto genuínos. Sente-se calmo com ela. A rebeldia dele dificilmente é direcionada a ela.</li><li><strong>Lobo:</strong> Origem genética. Promessa de caça em 2072. Riot sente raiva e é perturbado pelas memórias genéticas.</li><li><strong>Oliver, Metamorfo e Gladiador Dourado:</strong> Colegas da missão de resgate de 2022. Relação positiva, mas distante — sempre checavam com Kendra se ele estava bem.</li><li><strong>Tristan Queen:</strong> Dois estranhos que estão se ajudando em um mesmo objetivo. Riot confia em Tristan por conhecer Oliver — como se a familiaridade fosse uma garantia.</li></ul>" },
      { title:"🆕 A ORGANIZAÇÃO SUMDAC", content:"<p>A equipe da Cadmus que criou Riot era <strong>dissidente</strong>. Separaram-se da Cadmus e formaram a <strong>Sumdac</strong> — mesma logotipo da Cadmus, mas toda em <strong>vermelho</strong>. Estão operando em <strong>Vanguard Bay</strong>, fazendo experimentos. Riot descobriu isso durante eventos recentes.</p>" }
    ],
    secrets: [
      "Kendra contou sobre a promessa de Lobo — não é segredo entre eles.",
      "Riot parece querer enfrentar Lobo em 2072, em vez de fugir.",
      "Sabe que a Sumdac está em Vanguard Bay — mas Kendra não sabe que ele descobriu.",
      "Sua consciência às vezes divaga entre memórias genéticas de Lobo e memórias próprias."
    ]
  },
  "M'ark": {
    eyebrow: "🟢 Filho de M'gann · Nome provisório",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> M'ark (provisório — o jogador definirá o nome final)<br><strong>Idade:</strong> 23 anos (nascido em 2004)<br><strong>Mãe:</strong> M'gann M'orzz (Miss Martian)<br><strong>Pai biológico:</strong> Armek (falecido, Marciano Branco)<br><strong>Criação:</strong> Criado por M'gann e J'onn J'onzz<br><strong>Status:</strong> <strong>Prisioneiro da Sumdac</strong> — em local secreto</p>" },
      { title:"📖 História", content:"<p>Concebido em 2003–2004, quando Armek — um Marciano Branco cruel — enganou e violentou M'gann na Terra. J'onn descobriu, viajou a Marte e matou Armek antes que ele soubesse da gravidez. Criado em segredo por M'gann e J'onn até 2021, quando Conner descobriu sua existência.</p><p>Em outubro/novembro de 2026, foi apresentado publicamente como um <strong>Marciano Verde sobrevivente de uma colônia perdida</strong> — identidade que ele <strong>concordou</strong> em assumir. Em dezembro de 2026, viajou para Vanguard Bay. Ao chegar, foi <strong>emboscado pela Sumdac</strong> e capturado. A Sumdac quer estudar seu DNA alienígena.</p>" },
      { title:"🎯 Personalidade", content:"<p><em>A definir pelo jogador.</em></p>" },
      { title:"⚔️ Habilidades", content:"<ul><li><strong>Telepatia:</strong> confirmada.</li><li><strong>Telecinese:</strong> confirmada.</li><li><strong>Intangibilidade:</strong> confirmada.</li><li><strong>Invisibilidade:</strong> confirmada.</li><li><strong>Disfarce marciano:</strong> confirmado (usa forma Verde publicamente).</li><li><em>Outros poderes a definir pelo jogador.</em></li></ul>" },
      { title:"🔗 Relações", content:"<p><em>Todas as relações ainda a definir com o jogador (M'gann, J'onn, Conner, Armek).</em></p>" },
      { title:"🆕 O CATIVEIRO E CAMILA VARGAS", content:"<p><strong>Como foi capturado:</strong> emboscado pela Sumdac ao chegar em Vanguard Bay.<br><strong>Motivo:</strong> estudar seu DNA alienígena.<br><strong>Duração:</strong> não sabe quantos dias está preso. Perdeu a noção do tempo.<br><strong>Quem sabe:</strong> ninguém — nem M'gann, nem J'onn, nem Conner. <strong>Apenas Camila Vargas.</strong></p><p><strong>Camila Vargas</strong> é uma meta-humana recém-desperta (telepata), braço-direito de Leland Shaw na Shaw Innovations. Ao despertar seus poderes, criou acidentalmente um <strong>elo telepático</strong> com M'ark. Ela não sabe a localização dele, mas sabe que ele está preso e em perigo. É leal à empresa, mas <strong>não a Shaw</strong>, e esconde seus poderes dele. Propôs uma <strong>aliança com Tristan e Riot</strong> para resgatar M'ark — já que a Sumdac também é parte do objetivo deles. A Sumdac não sabe do elo.</p>" },
      { title:"💀 A VOZ DE ARMek", content:"<p>Às vezes, M'ark <strong>conversa com Armek na própria cabeça</strong>. A natureza disso ainda não foi definida — pode ser alucinação, loucura (herança genética) ou um resquício da existência de seu falecido pai. Um dos maiores mistérios do personagem.</p>" }
    ],
    secrets: [
      "É Marciano Branco — M'ark sabe. Ele tem plena consciência da própria natureza.",
      "Concordou em se passar por Marciano Verde publicamente. Não foi forçado.",
      "Está preso pela Sumdac — ninguém sabe, exceto Camila Vargas.",
      "Mantém contato telepático periódico com Camila Vargas.",
      "Ouve a voz de Armek na cabeça — natureza indefinida."
    ]
  },
  "Kendra Saunders": {
    eyebrow: "🦅 Reencarnação de Shiera Hall",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Kendra Shiera Saunders<br><strong>Codinome:</strong> Hawkgirl<br><strong>Idade:</strong> ~32 anos<br><strong>Origem:</strong> Humana que herdou a alma de Shiera Hall<br><strong>Residência:</strong> Midway City<br><strong>Papel:</strong> Mãe adotiva de Riot. Membro da JSA e JLU.</p>" },
      { title:"📖 História", content:"<p>Juventude conturbada: perdeu os pais, teve uma filha aos 16 (entregue para adoção em 2011) e tentou suicídio aos 17. Ao morrer, sua alma foi substituída pela de Shiera Hall. Seu avô, Speed Saunders, percebeu a mudança (olhos mudaram de verde para castanho) e a treinou.</p><p>Em 2022, resgatou Riot na <em>Tower of Fate</em> — equipe com Oliver, Metamorfo e Gladiador Dourado. Lobo fez a promessa dos 50 anos. Adotou Riot e o criou por 5 anos, treinando-o intensamente. Em janeiro de 2027, <strong>apoiou a ida de Riot para Vanguard Bay</strong> — ele precisa aprender sobre a Sumdac sozinho, e ela confia nele.</p>" },
      { title:"🎯 Personalidade", content:"<p>Forte, resiliente e bem-humorada — especialmente com quem considera família. <strong>Confiante</strong> nas decisões de Riot. Independente, sem contato com Carter Hall (Shiera foi para Thanagar). Preparada para enfrentar Lobo em 2072, se necessário.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li><strong>Voo:</strong> asas e cinto de Nth Metal.</li><li><strong>Maça de Nth Metal:</strong> arma principal.</li><li><strong>Fator de cura:</strong> regeneração acelerada.</li><li><strong>Memórias de vidas passadas:</strong> acesso limitado a memórias de Shiera Hall.</li></ul>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Riot (filho adotivo):</strong> Respeito e afeto genuínos. Apoiou a ida dele para Vanguard Bay — confia nas decisões dele. Pretende ficar em Midway City.</li><li><strong>Lobo:</strong> Testemunhou a promessa dos 50 anos. Odeia e teme, mas Lobo não tem motivo para atacá-la — deixou Riot com ela.</li><li><strong>Filha biológica:</strong> Sabe onde ela está. Apenas observa de longe.</li><li><strong>Oliver, Metamorfo e Gladiador Dourado:</strong> Colegas da missão de 2022.</li><li><strong>Carter Hall:</strong> Sem contato. Shiera Hall foi para Thanagar.</li></ul>" }
    ],
    secrets: [
      "Sabe da promessa de Lobo — foi testemunha e conversou com Riot sobre isso.",
      "Sabe onde sua filha biológica está, mas apenas observa de longe.",
      "Tem pesadelos recorrentes com a morte de Shiera Hall."
    ]
  },
  "Lobo": {
    eyebrow: "💀 O Maioral · Czarniano",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Lobo<br><strong>Idade:</strong> 400+ anos (imortal)<br><strong>Espécie:</strong> Czarniano<br><strong>Ocupação:</strong> Mercenário cósmico. Membro temporário da Liga da Justiça.<br><strong>Local atual:</strong> Espaço (missões cósmicas)</p>" },
      { title:"📖 História", content:"<p>Nascido em Czárnia. Aos 16 anos matou metade da população do planeta; aos 17, criou uma praga que matou o restante. Foi expulso do céu e do inferno, condenado à imortalidade.</p><p>Em 2022, foi mordido pelo clone bebê Riot durante o resgate e — divertido — prometeu 50 anos antes de caçá-lo. <strong>Prazo: 2072.</strong> Após Superman se tornar o Rei Ômega e a Liga entrar na fase <strong>Liga da Justiça Sem Limites</strong> — recrutando heróis, anti-heróis e alguns vilões — Lobo se tornou um <strong>membro temporário</strong> da JLU.</p>" },
      { title:"🎯 Personalidade", content:"<p>Cruel, violento, sádico por diversão. Não odeia Riot — é pura diversão sádica. Tem humor ácido e código de ética próprio (cumpre a palavra dada). Nunca matou por engano — sempre escolhe as vítimas. Gosta mais de caçar do que de matar.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li><strong>Superforça:</strong> nível Superman.</li><li><strong>Super-velocidade:</strong> extremamente rápido.</li><li><strong>Regeneração:</strong> cura acelerada.</li><li><strong>Imortalidade:</strong> não pode morrer.</li><li><strong>Olfato superdesenvolvido:</strong> rastreia alvos a longas distâncias.</li></ul>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Riot:</strong> Origem genética. Promessa de caça em 2072 — por diversão sádica.</li><li><strong>Kendra:</strong> Deixou Riot com ela. Sem motivo para atacá-la.</li><li><strong>Liga da Justiça Sem Limites:</strong> Membro temporário — recrutado na fase de expansão.</li><li><strong>Superman (Rei Ômega):</strong> Contexto — a ascensão dele abriu a fase JLU.</li></ul>" }
    ],
    secrets: [
      "Não observa Riot — não acompanha o crescimento dele.",
      "Pretende fazer da caça um espetáculo público em 2072.",
      "Deixou o clone com Kendra por escolha própria — sem ressentimento contra ela."
    ]
  },
  "M'gann M'orzz": {
    eyebrow: "🟢 Miss Martian · Marciana Branca",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> M'gann M'orzz (Megan Morse na Terra)<br><strong>Idade:</strong> ~39 anos<br><strong>Origem:</strong> Marciana Branca fugitiva<br><strong>Papel:</strong> Mãe de M'ark. Ex-Jovens Titãs.<br><strong>Local atual:</strong> A caminho de Vanguard Bay</p>" },
      { title:"📖 História", content:"<p>Chegou à Terra em ~2000–2002, fugindo do genocídio em Marte. Acolhida por J'onn, que a ajudou a se passar por Marciana Verde. Em 2003–2004, foi enganada e violentada por Armek. Criou M'ark em segredo por 20 anos. Terminou com Conner em 2019 (motivo real: o peso do segredo), mas reataram em 2021 quando ele descobriu M'ark. Apoiou a ida do filho para Vanguard Bay, mas com preocupação — é a primeira vez em anos que não estarão juntos.</p>" },
      { title:"🎯 Personalidade", content:"<p>Carrega múltiplos traumas: a violência de Armek, a mentira sobre sua raça, o segredo de seu filho. Protetora, mas aprendendo a confiar no filho. Relação sólida com Conner em 2027.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li><strong>Telepatia:</strong> poderosa.</li><li><strong>Telecinese:</strong> sim.</li><li><strong>Metamorfose:</strong> sim.</li><li><strong>Intangibilidade:</strong> sim.</li><li><strong>Invisibilidade:</strong> sim.</li><li><strong>Voo:</strong> sim.</li></ul>" },
      { title:"🔗 Relações", content:"<ul><li><strong>M'ark:</strong> Filho. Superprotetora, mas apoiou a ida dele para Vanguard Bay — com preocupação.</li><li><strong>Conner Kent:</strong> Namorado. Relação sólida em 2027.</li><li><strong>J'onn J'onzz:</strong> Mentor e figura paterna.</li><li><strong>Armek:</strong> Violentador (falecido).</li><li><strong>Jovens Titãs:</strong> Ex-membro.</li></ul>" }
    ],
    secrets: [
      "É Marciana Branca — J'onn, Conner, Dick, Garfield e Raven sabem.",
      "Tem um filho (M'ark) — nem todos os Titãs sabem.",
      "Foi estuprada por Armek em 2003–2004.",
      "J'onn matou Armek em vingança."
    ]
  },
  "J'onn J'onzz": {
    eyebrow: "🟢 Caçador de Marte · Último Marciano Verde",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> J'onn J'onzz<br><strong>Codinome:</strong> Caçador de Marte<br><strong>Idade:</strong> ~227 anos<br><strong>Espécie:</strong> Marciano Verde (último)<br><strong>Papel:</strong> Membro fundador da Liga da Justiça. Mentor de M'gann e M'ark.<br><strong>Local atual:</strong> Torre de Vigia</p>" },
      { title:"📖 História", content:"<p>Sobreviveu à Maldição de H'ronmeer — perdeu esposa e filha. Chegou à Terra nos anos 1950–1960. Membro fundador da Liga da Justiça. Em 2006–2007, ao descobrir o que Armek fez com M'gann, viajou a Marte e o matou — decisão difícil, mas necessária.</p><p>Seu irmão gêmeo, <strong>Ma'alefa'ak</strong> (criador da Maldição de H'ronmeer), foi <strong>morto durante um combate com J'onn</strong> — consumido pelo sol. Em 2027, atua ativamente na JLU.</p>" },
      { title:"🎯 Personalidade", content:"<p>Filósofo, pacifista e protetor. Carrega o peso de ter matado Armek — não foi fácil, mas foi necessário naquela situação. Mentor e figura paterna de M'gann e M'ark. Respeita o silêncio de M'gann sobre outros segredos.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li><strong>Telepatia:</strong> de escala planetária.</li><li><strong>Telecinese:</strong> poderosa.</li><li><strong>Metamorfose:</strong> qualquer forma.</li><li><strong>Intangibilidade e invisibilidade:</strong> sim.</li><li><strong>Regeneração:</strong> cura acelerada.</li><li><strong>Voo:</strong> sim.</li></ul>" },
      { title:"🔗 Relações", content:"<ul><li><strong>M'gann M'orzz:</strong> Figura paterna. Mentor.</li><li><strong>M'ark:</strong> Figura paterna / avô.</li><li><strong>Conner Kent:</strong> Aliado próximo.</li><li><strong>Armek:</strong> Matou em vingança — decisão difícil, mas necessária.</li><li><strong>Ma'alefa'ak:</strong> Irmão gêmeo. Morto — consumido pelo sol durante combate.</li><li><strong>Liga da Justiça:</strong> Membro fundador. Atuação ativa em 2027.</li></ul>" }
    ],
    secrets: [
      "Matou Armek em vingança — decisão difícil, mas necessária.",
      "Ainda tem pesadelos com a Maldição de H'ronmeer.",
      "Sabe que M'gann esconde outros segredos, mas respeita o silêncio dela."
    ]
  },
  "Oliver Queen": {
    eyebrow: "🏹 O Queen · Agente da JLU",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Oliver Jonas Queen<br><strong>Codinome:</strong> O Queen (ex-Arqueiro Verde)<br><strong>Idade:</strong> 47 anos (nascido em 1980)<br><strong>Status:</strong> Vivo — ressuscitado em 2022<br><strong>Papel:</strong> Agente da Liga da Justiça Sem Limites<br><strong>Local:</strong> Gotham (investigando anomalia)</p>" },
      { title:"📖 História", content:"<p>Fundador do manto do Arqueiro Verde em Star City. Em 2020, uma explosão o sugou para um bolsão dimensional. Passou 2 anos isolado — o que lhe deixou um <strong>trauma emocional profundo</strong>: não consegue se afastar de Dinah por muito tempo. Resgatado por Cyborg e Flash em 2022. Faz parte da equipe de resgate de Riot (com Kendra, Metamorfo e Gladiador Dourado). Não reassumiu o manto — Connor mantém o título. Tornou-se agente da JLU.</p><p>Em 2022, quando Tristan decidiu ir para Gotham treinar com Jason, Oliver se opôs e <strong>parou de falar com o filho</strong> — teimosia e orgulho.</p>" },
      { title:"🎯 Personalidade", content:"<p>Teimoso e orgulhoso. Calmo com ressalvas, mas ainda impulsivo em momentos-chave. Carrega trauma emocional do bolsão dimensional — não consegue se afastar de Dinah por muito tempo. Sem problemas de saúde físicos. Fala sobre Tristan com Dinah e Connor, mas não diretamente com o filho.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li><strong>Arco e flecha:</strong> mestre arqueiro nível lendário. Ainda tem o arco.</li><li><strong>Combate corpo a corpo:</strong> treinado, mas não é o foco.</li><li><strong>Táticas:</strong> estrategista experiente.</li><li><strong>Liderança:</strong> ex-líder da JLU em missões.</li></ul>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Dinah Lance:</strong> Esposa. Reataram. Não consegue se afastar dela por muito tempo.</li><li><strong>Tristan Queen:</strong> Filho. Silêncio total por parte de Oliver desde 2022 — teimosia e orgulho. Não gosta que Tristan esteja em Vanguard Bay, mas reconhece que é melhor do que Gotham.</li><li><strong>Connor Hawke:</strong> Filho que assumiu o manto. Respeito mútuo.</li><li><strong>Kendra Saunders:</strong> Contato regular. Colegas e amigos.</li><li><strong>Jason Todd:</strong> Não aprova que ele tenha treinado Tristan.</li></ul>" }
    ],
    secrets: [
      "Durante o isolamento no bolsão dimensional, teve visões do futuro da família — nunca contou.",
      "Sente culpa por não ter impedido Dinah de ir para Gotham em 2019.",
      "Reconhece que Connor é um arqueiro melhor do que ele jamais foi — nunca disse em voz alta."
    ]
  },
  "Dinah Lance": {
    eyebrow: "🐤 Canário Negro · Líder das Aves de Rapina",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Dinah Laurel Lance<br><strong>Codinome:</strong> Canário Negro<br><strong>Idade:</strong> 40 anos (nascida em 1987)<br><strong>Status:</strong> Viva<br><strong>Papel:</strong> Líder das Aves de Rapina (grupo em hiato).<br><strong>Local:</strong> Gotham</p>" },
      { title:"📖 História", content:"<p>Em 2019, após o tiro em Bárbara e a morte de Jason, foi para Gotham ajudar a amiga — e fundou as Aves de Rapina com Bárbara, Helena e Zinda. Estava em Gotham quando Oliver \"morreu\" em 2020. Retornou para o velório e descobriu que Connor já assumia o manto e cuidava de Tristan. Desde então, carrega culpa por não ter estado presente.</p><p>Em 2027, está em Gotham com Oliver. As Aves de Rapina estão em <strong>hiato</strong>. Seus poderes (Grito Canário) estão falhando por causa da distorção do Rei Ômega — a falha é conhecida por membros da Liga e pessoas próximas.</p>" },
      { title:"🎯 Personalidade", content:"<p>Resiliente, culpada por 2019/2020, mãe presente mesmo à distância. Conversa com Tristan por mensagem — não há evitação mútua. Está deixando Oliver agir do jeito dele, acreditando que a decisão de resolver o silêncio deve vir dele.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li><strong>Grito Canário:</strong> falhando — distorção do Rei Ômega. Temporário ou permanente ainda não revelado.</li><li><strong>Combate corpo a corpo:</strong> mestre — ensinou Tristan.</li><li><strong>Liderança:</strong> fundadora das Aves de Rapina (em hiato).</li><li><strong>Táticas:</strong> estrategista.</li></ul>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Oliver Queen:</strong> Marido. Amor sólido. Ciente do trauma dele e do silêncio com Tristan.</li><li><strong>Tristan Queen:</strong> Filho. Conversam por mensagem. Não há evitação mútua.</li><li><strong>Connor Hawke:</strong> Gratidão — ele cuidou de Tristan em 2020.</li><li><strong>Bárbara Gordon:</strong> Melhor amiga. Aves de Rapina em hiato.</li><li><strong>Helena Bertinelli e Zinda Blake:</strong> Aliadas nas Aves de Rapina.</li></ul>" }
    ],
    secrets: [
      "Seus poderes estão falhando por causa da distorção do Rei Ômega — a gravidade real é escondida.",
      "Sente culpa por não ter estado presente em 2020.",
      "Considera deixar as Aves de Rapina para focar na família — mas ainda não tomou coragem."
    ]
  },
  "Connor Hawke": {
    eyebrow: "🏹 Arqueiro Verde · Herói de Star City",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Connor Hawke<br><strong>Codinome:</strong> Arqueiro Verde (atual)<br><strong>Idade:</strong> 25 anos (nascido em 2002)<br><strong>Status:</strong> Solteiro<br><strong>Papel:</strong> Herói principal de Star City. Responsável pelos negócios da família Queen.<br><strong>Assumiu o manto:</strong> 2020, aos 17/18 anos</p>" },
      { title:"📖 História", content:"<p>Filho biológico de Oliver com Sandra Hawke — relacionamento anterior ao casamento com Dinah. Cresceu longe do pai, mas se aproximou com o tempo. Em 2020, quando Oliver \"morreu\", assumiu o manto com o apoio de Dinah (que na época estava em Gotham) e cuidou de Tristan durante o luto. Mantém o título até hoje, mesmo após o retorno do pai.</p><p>Em 2027, além de ser o Arqueiro Verde de Star City, é <strong>responsável pelos negócios da família Queen financeiramente</strong>.</p>" },
      { title:"🎯 Personalidade", content:"<p>Calmo, equilibrado, estável — o \"pilar\" da família. Mediador (tenta resolver o silêncio entre Oliver e Tristan, sem muito sucesso). Responsável. Não se sente sobrecarregado por ser o Arqueiro Verde.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li><strong>Arco e flecha:</strong> nível Oliver — talvez superior.</li><li><strong>Combate corpo a corpo:</strong> treinado.</li><li><strong>Táticas:</strong> estrategista.</li><li><strong>Gestão financeira:</strong> responsável pelos negócios Queen.</li></ul>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Oliver Queen:</strong> Pai. Respeito, mas tensão não resolvida.</li><li><strong>Tristan Queen:</strong> Irmão mais novo. Elo de comunicação. Contato não constante (ocupado).</li><li><strong>Dinah Lance:</strong> Madrasta. Gratidão.</li><li><strong>Jason Todd:</strong> Contato por causa de Tristan.</li><li><strong>Roy Harper (Arsenal):</strong> Amigo. Roy atua às vezes com Connor e Mia.</li><li><strong>Mia Dearden (Speedy):</strong> Parceira de combate.</li><li><strong>Cyborg (Victor Stone):</strong> Amigo.</li><li><strong>Lian Harper:</strong> Amiga — filha de Roy.</li></ul>" }
    ],
    secrets: [
      "Nunca contou a Tristan que estava com Oliver no dia da explosão de 2020.",
      "Sente que Oliver ainda o vê como \"substituto\" — e não como herdeiro legítimo.",
      "Considera passar o manto adiante em alguns anos para focar em ajudar Tristan."
    ]
  },
  "Jason Todd": {
    eyebrow: "🦇 Capuz Vermelho · Líder dos Novos Titãs",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Jason Peter Todd<br><strong>Codinome:</strong> Capuz Vermelho<br><strong>Idade:</strong> 23 anos (nascido em 2004)<br><strong>Status:</strong> Vivo — ressuscitado em 2021<br><strong>Papel:</strong> Treinou Tristan (2022–2025). Líder dos Novos Titãs.<br><strong>Local:</strong> Fora de Gotham — já não estava mais lá quando se juntou aos Titãs</p>" },
      { title:"📖 História", content:"<p>Segundo Robin, morto pelo Coringa em 2019 aos 15 anos. Ressuscitado em 2021 pelo <strong>Poço de Lázaro</strong> (artefato da Liga dos Assassinos). Tornou-se o anti-herói Capuz Vermelho. Em 2022, aceitou treinar Tristan Queen em Gotham. Em 2026, foi escolhido para liderar a nova geração dos Novos Titãs (Fairplay, Cheshire Cat, Flatline, Proxy, Wildcard) — como provocação a Dick Grayson, que lidera os Titãs adultos.</p>" },
      { title:"🎯 Personalidade", content:"<p>Frio, endurecido pela morte e ressurreição. Rebelde — não segue as regras de Bruce. Protetor com quem considera família. Ainda tem pesadelos com a morte de 2019. Relação com os Novos Titãs ainda em adaptação — eles precisam se acostumar uns com os outros.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li><strong>Combate:</strong> brutal, eficiente, letal.</li><li><strong>Armas:</strong> pistolas, facas, explosivos.</li><li><strong>Estratégia:</strong> táticas de guerrilha.</li><li><strong>Liderança:</strong> relutante, mas eficaz.</li></ul>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Tristan Queen:</strong> Ex-aluno. Mentor e figura fraterna oposta a Connor — o contraponto rebelde ao irmão estável.</li><li><strong>Bruce:</strong> Relação distante, mas Bruce não interfere.</li><li><strong>Dick:</strong> Irmão adotivo. Rivalidade de irmãos. Jason criou sua própria equipe para provocá-lo.</li><li><strong>Tim:</strong> Irmão adotivo. Respeito.</li><li><strong>Damian:</strong> Meio-irmão adotivo. Rivalidade.</li><li><strong>Novos Titãs:</strong> Líder. Relação em adaptação.</li><li><strong>Lian Harper (Cheshire Cat):</strong> Membro da equipe dele.</li><li><strong>Talia al-Ghul:</strong> Pouco contato.</li></ul>" }
    ],
    secrets: [
      "Nunca contou a Tristan que o Poço de Lázaro pertence à Liga dos Assassinos.",
      "Ainda tem pesadelos com a morte de 2019 — nunca admitiu a ninguém.",
      "Pretende deixar Gotham quando Tristan estiver pronto."
    ]
  },
  "Conner Kent": {
    eyebrow: "🦸 Superboy · Clone de Superman e Lex Luthor",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Conner Kent (Kon-El)<br><strong>Codinome:</strong> Superboy<br><strong>Idade:</strong> ~29 anos (clone)<br><strong>Origem:</strong> Clone híbrido de Superman e Lex Luthor<br><strong>Papel:</strong> Figura paterna de M'ark. Namorado de M'gann.<br><strong>Local:</strong> A caminho de Vanguard Bay</p>" },
      { title:"📖 História", content:"<p>Criado em laboratório como clone híbrido de Superman e Lex Luthor. Conheceu M'gann nos Jovens Titãs (~2010–2012). Em 2019, M'gann terminou com ele sem explicação. Em 2021, investigou e descobriu M'ark — e toda a verdade sobre Armek. Reataram e passou a ser figura paterna para o garoto.</p><p>Em 2027, Conner e M'gann são vistos como casal pela comunidade heroica. Tinha contato regular com Superman antes dele virar Rei Ômega.</p>" },
      { title:"🎯 Personalidade", content:"<p>Protetor com M'ark, leal a M'gann. Ainda tem <strong>receio de se tornar como Lex</strong> — o que piorou porque <strong>Lex está na JLU atualmente</strong>. Assume papel de pai para M'ark.</p>" },
      { title:"⚔️ Habilidades", content:"<ul><li><strong>Superforça:</strong> nível Superman.</li><li><strong>Super-velocidade:</strong> sim.</li><li><strong>Invulnerabilidade:</strong> sim.</li><li><strong>Voo:</strong> sim.</li><li><strong>Visão de calor:</strong> sim.</li><li><strong>Super-audição:</strong> sim.</li></ul>" },
      { title:"🔗 Relações", content:"<ul><li><strong>M'gann M'orzz:</strong> Namorada. Relação sólida.</li><li><strong>M'ark:</strong> Filho adotivo de fato.</li><li><strong>Superman:</strong> Doador genético. Contato regular antes do Rei Ômega.</li><li><strong>Lex Luthor:</strong> Doador genético. Odeia. Lex está na JLU — o que aumenta o receio.</li><li><strong>J'onn J'onzz:</strong> Aliado.</li></ul>" }
    ],
    secrets: [
      "Teme que M'ark herde a crueldade de Armek — nunca contou a M'gann.",
      "Pesadelos com Lex Luthor — pioraram com Lex na JLU.",
      "Considera pedir a M'ark para chamá-lo de \"pai\" — tem medo da resposta."
    ]
  },
  "Bruce Wayne": {
    eyebrow: "🦇 Batman · O Maior Detetive do Mundo",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Bruce Thomas Wayne<br><strong>Codinome:</strong> Batman<br><strong>Idade:</strong> 46 anos (nascido em 1981)<br><strong>Status:</strong> Ativo<br><strong>Papel:</strong> Batman de Gotham. Membro fundador da Liga da Justiça.<br><strong>Local:</strong> Gotham</p>" },
      { title:"🎯 Personalidade", content:"<p>Ainda em luto por Alfred (2022) — a chegada de Verity está ajudando a se adaptar. Reservado e não interfere nas escolhas de Jason (inclusive sobre Tristan). Contato regular com a JL.</p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Alfred Pennyworth:</strong> Pai adotivo. Morto em 2022. Visita o túmulo periodicamente.</li><li><strong>Dick Grayson:</strong> Filho adotivo. Respeito.</li><li><strong>Jason Todd:</strong> Filho adotivo. Relação distante, mas não interfere no que ele faz.</li><li><strong>Tim Drake:</strong> Filho adotivo. Respeita a escolha de se aposentar.</li><li><strong>Damian Wayne:</strong> Filho biológico. Relação tensa, mas de amor.</li><li><strong>Barbara Gordon:</strong> Aliada e amiga. Batgirl.</li><li><strong>Verity Pennyworth:</strong> Nova mordoma. Ajudando no luto.</li></ul>" }
    ],
    secrets: [
      "Ainda processa a morte de Alfred — Verity está ajudando.",
      "Situação atual de Gotham em 2027 — a definir."
    ]
  },
  "Dick Grayson": {
    eyebrow: "🦅 Asa Noturna · Líder dos Titãs",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Richard John Grayson<br><strong>Codinome:</strong> Asa Noturna<br><strong>Idade:</strong> 29 anos (nascido em 1998)<br><strong>Status:</strong> Ativo<br><strong>Papel:</strong> Líder dos Titãs adultos. Herói de Blüdhaven.<br><strong>Local:</strong> Blüdhaven</p>" },
      { title:"🎯 Personalidade", content:"<p>Carismático, líder natural, idealista. Rivalidade de irmãos com Jason ainda existe. Namorando Bárbara Gordon.</p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Barbara Gordon:</strong> Namorada.</li><li><strong>Bruce:</strong> Pai adotivo. Respeito.</li><li><strong>Jason Todd:</strong> Rivalidade de irmãos. Jason criou sua própria equipe para provocá-lo.</li><li><strong>Tim Drake:</strong> Confiança.</li><li><strong>Damian Wayne:</strong> Mentoria.</li><li><strong>Tristan Queen:</strong> Conhece, mas poucas interações — ocupado em Gotham e Blüdhaven.</li></ul>" }
    ],
    secrets: []
  },
  "Barbara Gordon": {
    eyebrow: "🦇 Batgirl · Oráculo",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Barbara Joan Gordon<br><strong>Codinome:</strong> Batgirl (voltou a andar)<br><strong>Idade:</strong> 32 anos (nascida em 1995)<br><strong>Status:</strong> Ativa<br><strong>Papel:</strong> Batgirl. Fundadora das Aves de Rapina (em hiato).<br><strong>Local:</strong> Gotham</p>" },
      { title:"🎯 Personalidade", content:"<p>Determinada — superou a paraplegia e voltou a andar. Inteligente, líder. Envolvida com as Aves de Rapina (em hiato).</p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Dick Grayson:</strong> Namorado.</li><li><strong>Bruce:</strong> Mentor. Respeito.</li><li><strong>Dinah Lance:</strong> Melhor amiga. Aves de Rapina.</li><li><strong>Tristan Queen:</strong> Conhece e já conversaram algumas vezes.</li></ul>" },
      { title:"📝 Nota", content:"<p>Voltou a andar e atua como Batgirl — não precisa de exoesqueleto ou muletas.</p>" }
    ],
    secrets: []
  },
  "Damian Wayne": {
    eyebrow: "🦇 Robin · Filho de Bruce e Talia",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Damian Wayne<br><strong>Codinome:</strong> Robin<br><strong>Idade:</strong> 14 anos<br><strong>Status:</strong> Ativo<br><strong>Papel:</strong> Robin atual.<br><strong>Local:</strong> Gotham</p>" },
      { title:"🎯 Personalidade", content:"<p>Arrogante, impulsivo, determinado. <strong>Não aprovou o treinamento de Tristan por Jason</strong> — por isso não se aproximou muito dele. Desvinculou-se da Liga dos Assassinos.</p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Bruce:</strong> Pai. Relação tensa, mas de respeito.</li><li><strong>Talia:</strong> Mãe. Desvinculado da Liga, mas se importam à distância.</li><li><strong>Dick:</strong> Mentoria.</li><li><strong>Jason:</strong> Rivalidade. Não aprovou o treinamento de Tristan.</li><li><strong>Tim:</strong> Competição.</li><li><strong>Tristan Queen:</strong> Conhece, mas não se aproximou — não concorda com o treinamento de Jason.</li></ul>" }
    ],
    secrets: []
  },
  "Tim Drake": {
    eyebrow: "📚 Ex-Robin · Vida civil",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Timothy Jackson Drake<br><strong>Codinome:</strong> Nenhum — aposentado<br><strong>Idade:</strong> 20 anos (nascido em 2007)<br><strong>Status:</strong> Aposentado — vida civil<br><strong>Namorado:</strong> Bernard Dowd<br><strong>Local:</strong> Gotham (como civil)</p>" },
      { title:"🎯 Personalidade", content:"<p>Focado em si mesmo — prioriza sua vida pessoal, amorosa e independência. Evita assuntos sobre a Bat-Família, mas mantém contato com todos. Foca na vida fora do vigilantismo.</p>" },
      { title:"📖 História", content:"<p>Em 2019 (aos 12 anos), deduziu as identidades de Bruce e Dick — tornou-se Robin. Em 2022, com a morte de Alfred, começou a sentir que a vida de vigilante não era para ele. Passou o manto para Damian, tornou-se Robin Vermelho por um tempo e, eventualmente, <strong>aposentou-se</strong>. Em 2027, vive como civil em Gotham e namora Bernard Dowd.</p>" }
    ],
    secrets: []
  },
  "Verity Pennyworth": {
    eyebrow: "🎩 Nova Mordoma da Mansão Wayne",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Verity Pennyworth<br><strong>Idade:</strong> 26 anos<br><strong>Status:</strong> Ativa<br><strong>Papel:</strong> Nova mordoma da Mansão Wayne.<br><strong>Conexão:</strong> Sobrinha-neta de Alfred.<br><strong>Local:</strong> Gotham</p>" },
      { title:"🎯 Personalidade", content:"<p>Elegante, austera, confiante nas próprias habilidades. Mulher branca, de cabelos longos loiros.</p>" },
      { title:"📖 História", content:"<p>Chegou a Gotham em 2026, enviada por um plano que o próprio Alfred deixou antes de morrer. Assume o lugar do tio-avô como mordoma da Mansão Wayne, ajudando Bruce a se adaptar ao luto.</p>" },
      { title:"📝 Conhecimento", content:"<p>Sabe tudo que precisa saber sobre a vida da Bat-Família.</p>" }
    ],
    secrets: []
  },
  "Lian Harper": {
    eyebrow: "🐱 Cheshire Cat · Filha de Roy Harper",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Lian Harper<br><strong>Codinome:</strong> Cheshire Cat<br><strong>Pai:</strong> Roy Harper (Arsenal)<br><strong>Mãe:</strong> Jade Nguyen (Cheshire)<br><strong>Status:</strong> Ativa<br><strong>Afiliação:</strong> Novos Titãs (equipe de Jason Todd)</p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Tristan Queen:</strong> Amiga de infância. Conversam frequentemente por mensagem. Cresceram juntos no círculo heroico (filhos de arqueiros/justiça).</li><li><strong>Jason Todd:</strong> Líder da equipe dela.</li><li><strong>Roy Harper:</strong> Pai. Arsenal (com prótese no braço).</li><li><strong>Connor Hawke:</strong> Amigo da família.</li></ul>" },
      { title:"📝 Nota narrativa", content:"<p>A amizade com Tristan é uma das poucas pontes que ele mantém com o círculo heroico. Lian está na equipe de Jason — o que cria uma ligação entre Tristan e os Novos Titãs.</p>" }
    ],
    secrets: []
  },
  "Camila Vargas": {
    eyebrow: "🧠 Telepata · Braço-direito de Shaw",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Camila Vargas<br><strong>Idade:</strong> 35–45 anos<br><strong>Origem:</strong> Meta-humana recém-desperta — telepata<br><strong>Status:</strong> Ativa<br><strong>Papel:</strong> Braço-direito de Leland Shaw (CEO da Shaw Innovations)<br><strong>Local:</strong> Vanguard Bay</p>" },
      { title:"🧠 Poderes", content:"<ul><li><strong>Telepatia:</strong> recém-desperta — ainda em desenvolvimento.</li><li><strong>Elo com M'ark:</strong> criado acidentalmente ao despertar os poderes. Conversam periodicamente.</li></ul>" },
      { title:"🎯 Personalidade", content:"<p>Estratégica, corajosa. Leal à empresa (Shaw Innovations), mas <strong>não a Leland Shaw</strong>. Esconde seus poderes meta-humanos dele.</p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>M'ark:</strong> Elo telepático. Sabe que ele está preso e em perigo, mas não sabe a localização.</li><li><strong>Leland Shaw:</strong> Chefe. Leal à empresa, não a ele.</li><li><strong>Tristan Queen:</strong> Aliada. Comunicam-se por ligação ou telepatia.</li><li><strong>Riot:</strong> Aliada. Comunicam-se por ligação ou telepatia.</li></ul>" },
      { title:"🎯 Objetivo", content:"<p>Procurar M'ark junto com Tristan e Riot. Propôs a aliança — já que a Sumdac também é parte do objetivo deles.</p>" }
    ],
    secrets: [
      "É meta-humana — esconde de Shaw.",
      "Elo telepático com M'ark — a Sumdac não sabe.",
      "Propôs aliança com Tristan e Riot para procurar M'ark.",
      "Não sabe a localização do cativeiro de M'ark."
    ]
  },
  "Roy Harper": {
    eyebrow: "🏹 Arsenal · Pai de Lian",
    sections: [
      { title:"📋 Ficha Básica", content:"<p><strong>Nome:</strong> Roy Harper<br><strong>Codinome:</strong> Arsenal<br><strong>Idade:</strong> ~35 anos<br><strong>Status:</strong> Ativo<br><strong>Filha:</strong> Lian Harper (Cheshire Cat)<br><strong>Característica especial:</strong> Perdeu um dos braços e usa uma <strong>prótese</strong>. Continua sendo um arqueiro excelente.</p>" },
      { title:"🔗 Relações", content:"<ul><li><strong>Connor Hawke:</strong> Amigo. Atuam juntos ocasionalmente.</li><li><strong>Mia Dearden (Speedy):</strong> Atuam juntos ocasionalmente.</li><li><strong>Lian Harper:</strong> Filha.</li><li><strong>Titãs (Dick Grayson):</strong> Atua com eles às vezes.</li></ul>" }
    ],
    secrets: []
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
