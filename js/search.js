(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/search.js');

var showToast = core.showToast;
var escapeHtml = core.escapeHtml;
var escapeAttr = core.escapeAttr;
var escapeRegex = core.escapeRegex;

/* ===== BUSCA ===== */
var searchInput = document.getElementById('searchInput');
var searchDebounce = null;
var fandomCache = {};
var fandomHistory = [];
var currentFandomTitle = null;
var searchMode = 'fandom';

var fandomSearchAliases = Object.freeze({
  'estelar':'Starfire',
  'asa noturna':'Nightwing',
  'arqueiro verde':'Green Arrow',
  'arqueiro vermelho':'Red Arrow',
  'ricardito':'Speedy',
  'canario negro':'Black Canary',
  'cacador de marte':'Martian Manhunter',
  'miss marte':'Miss Martian',
  'mutano':'Beast Boy',
  'ciborgue':'Cyborg',
  'ravena':'Raven',
  'moca maravilha':'Wonder Girl',
  'capuz vermelho':'Red Hood',
  'lanterna verde':'Green Lantern',
  'mulher maravilha':'Wonder Woman',
  'super homem':'Superman',
  'homem morcego':'Batman',
  'mulher gaviao':'Hawkgirl',
  'gaviao negro':'Hawkman',
  'besouro azul':'Blue Beetle',
  'gladiador dourado':'Booster Gold',
  'super choque':'Static',
  'raio negro':'Black Lightning',
  'exterminador':'Deathstroke',
  'arlequina':'Harley Quinn',
  'mulher gato':'Catwoman',
  'hera venenosa':'Poison Ivy',
  'coringa':'Joker',
  'charada':'Riddler',
  'duas caras':'Two-Face',
  'espantalho':'Scarecrow',
  'senhor frio':'Mister Freeze',
  'sr frio':'Mister Freeze',
  'adao negro':'Black Adam',
  'capitao bumerangue':'Captain Boomerang',
  'flash reverso':'Reverse-Flash',
  'senhor destino':'Doctor Fate',
  'doutor destino':'Doctor Fate',
  'doutor luz':'Doctor Light',
  'capitao atomo':'Captain Atom',
  'atomo':'Atom',
  'homem elastico':'Elongated Man',
  'homem borracha':'Plastic Man',
  'homem animal':'Animal Man',
  'monstro do pantano':'Swamp Thing',
  'questao':'Question',
  'espectro':'Spectre',
  'patrulha do destino':'Doom Patrol',
  'liga da justica':'Justice League',
  'jovens titas':'Teen Titans',
  'sociedade da justica':'Justice Society of America',
  'aves de rapina':'Birds of Prey',
  'esquadrao suicida':'Suicide Squad',
  'legiao dos super herois':'Legion of Super-Heroes',
  'novos deuses':'New Gods'
});

function normalizeFandomSearchKey(value){
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}

function resolveFandomQuery(query){
  var original = String(query || '').trim();
  var alias = fandomSearchAliases[normalizeFandomSearchKey(original)] || '';
  return {
    original:original,
    query:alias || original,
    usedAlias:!!alias
  };
}

function fandomCacheKey(query){
  var resolved = resolveFandomQuery(query);
  return normalizeFandomSearchKey(resolved.original) + '|' + normalizeFandomSearchKey(resolved.query);
}
var fandomOriginalHtml = '';
var fandomTranslatedHtmlCache = {};
var fandomTextTranslationCache = {};
var fandomTranslationMode = 'original';
var fandomTranslatorPromise = null;
var fandomTranslationRunId = 0;
var fandomImageCache = {};
var dcImportCurrent = null;

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

        if(parent.getAttribute && parent.hasAttribute('data-character-visibility')){
          var characterLevel=parent.getAttribute('data-character-visibility') || 'public';
          var characterVisibility=window.TerraZApp && window.TerraZApp.visibility;
          if(characterVisibility && characterVisibility.isLevelAllowed &&
             !characterVisibility.isLevelAllowed(characterLevel)){
            return NodeFilter.FILTER_REJECT;
          }
        }

        if(parent.hasAttribute && parent.hasAttribute('data-visibility')){
          var level = parent.getAttribute('data-visibility') || 'public';
          var visibility = window.TerraZApp && window.TerraZApp.visibility;
          if(visibility && visibility.isLevelAllowed && !visibility.isLevelAllowed(level)){
            return NodeFilter.FILTER_REJECT;
          }
        }

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
  var resolved = resolveFandomQuery(query);
  var key = fandomCacheKey(query);
  if(fandomCache[key]){ renderFandomResults(fandomCache[key], query); return; }

  var url = 'https://dc.fandom.com/api.php?action=opensearch&search=' + encodeURIComponent(resolved.query) + '&limit=12&namespace=0&format=json&origin=*';
  fetch(url).then(function(r){ if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(data){
      var result = {
        titles:data[1] || [],
        descriptions:data[2] || [],
        urls:data[3] || [],
        searchedAs:resolved.query,
        usedAlias:resolved.usedAlias
      };
      fandomCache[key] = result;
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
  var aliasInfo = data.usedAlias && data.searchedAs ? ' · DC Wiki: "' + data.searchedAs + '"' : '';
  document.getElementById('searchInfo').textContent = titles.length + ' resultado(s) para "' + query + '"' + aliasInfo;
  if(titles.length === 0){
    document.getElementById('searchResults').innerHTML = '<div class="search-empty">Nenhum resultado encontrado na DC Wiki.</div>';
    return;
  }
  var html = '';
  for(var i = 0; i < titles.length; i++){
    var title = titles[i], desc = descriptions[i] || '';
    html += '<div class="search-result-item"><div class="r-info"><a class="r-title" href="#" data-title="' + escapeAttr(title) + '">' + escapeHtml(title) + '</a>';
    if(desc) html += '<div class="r-snippet">' + escapeHtml(desc) + '</div>';
    html += '<div class="r-source">📚 dc.fandom.com</div></div><div class="r-actions"><button class="primary" data-title="' + escapeAttr(title) + '">📖 Ler aqui</button>';
    if(canDcImport()) html += '<button class="dc-import-result-btn" data-dc-import-title="' + escapeAttr(title) + '">＋ Terra Z</button>';
    html += '</div></div>';
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
  document.querySelectorAll('#searchResults [data-dc-import-title]').forEach(function(el){
    el.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      openDcImport(el.getAttribute('data-dc-import-title') || '');
    });
  });
}

function dcImportKey(value){
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}

function dcImportDisplayName(title){
  var raw=String(title || '').trim();
  return raw.replace(/\s+\((?:prime earth|new earth|earth-[^)]+|pre-zero hour|post-zero hour)\)\s*$/i,'').trim() || raw;
}

function canDcImport(){
  var b=window.TerraZApp && window.TerraZApp.backend;
  return !!(b && b.isAuthenticated && b.isAuthenticated());
}

async function ensureDcImportAdmin(){
  var app=window.TerraZApp || {};
  if(app.adminLoader && app.adminLoader.load) await app.adminLoader.load();
  var b=app.backend;
  if(!b || !b.isAuthenticated || !b.isAuthenticated()){
    showToast('Entre como editor para adicionar referências da DC ao Terra Z.','warning',5000);
    if(app.publishing && app.publishing.open) app.publishing.open();
    return false;
  }
  return true;
}

function findExistingDcCharacter(title){
  var app=window.TerraZApp || {};
  var characters=app.characters;
  var names=characters && characters.names ? characters.names() : [];
  var keys=[title,dcImportDisplayName(title)].map(dcImportKey).filter(Boolean);

  var byName=names.find(function(name){ return keys.includes(dcImportKey(name)); });
  if(byName) return byName;

  var media=(window.TerraZData && window.TerraZData.characterMedia) || {};
  var titleKey=dcImportKey(title);
  return names.find(function(name){
    var item=media[name] || {};
    var auto=item.auto && typeof item.auto==='object' ? item.auto : {};
    return auto.provider==='dc-fandom' && dcImportKey(auto.wikiTitle)===titleKey;
  }) || '';
}

function findExistingDcGraphNode(title,characterName){
  var graph=window.TerraZApp && window.TerraZApp.graph;
  var data=graph && graph.getData ? graph.getData() : {nodes:[]};
  var keys=[title,dcImportDisplayName(title),characterName].map(dcImportKey).filter(Boolean);
  return (data.nodes || []).find(function(node){
    return [node.ref,node.label,node.subtitle].map(dcImportKey).filter(Boolean)
      .some(function(key){ return keys.includes(key); });
  }) || null;
}

function dcImportState(title){
  var character=findExistingDcCharacter(title);
  var node=findExistingDcGraphNode(title,character);
  return {character:character,node:node};
}

function updateDcImportExisting(){
  var root=document.getElementById('dcImportExisting');
  var cardBtn=document.getElementById('dcImportCardBtn');
  var graphBtn=document.getElementById('dcImportGraphBtn');
  var bothBtn=document.getElementById('dcImportBothBtn');
  if(!dcImportCurrent || !root) return;

  var state=dcImportState(dcImportCurrent.title);
  dcImportCurrent.existingCharacter=state.character;
  dcImportCurrent.existingNode=state.node;

  var chips=[];
  if(state.character) chips.push('<span class="exists">✓ Card: '+escapeHtml(state.character)+'</span>');
  else chips.push('<span>Card ainda não existe</span>');
  if(state.node) chips.push('<span class="exists">✓ Grafo: '+escapeHtml(state.node.label || state.node.id)+'</span>');
  else chips.push('<span>Bolinha ainda não existe</span>');
  root.innerHTML=chips.join('');

  if(cardBtn) cardBtn.textContent=state.character ? '✏️ Abrir Card existente' : '＋ Criar Card';
  if(graphBtn) graphBtn.textContent=state.node ? '◎ Abrir no Grafo' : '◎ Adicionar ao Grafo';
  if(bothBtn){
    bothBtn.disabled=!!(state.character && state.node);
    bothBtn.textContent=state.character && state.node
      ? '✓ Card + Grafo já existem'
      : (state.character ? '＋ Vincular Card ao Grafo' : '＋ Card + Grafo');
  }
}

async function fetchDcImportImage(title){
  if(fandomImageCache[title]) return fandomImageCache[title];
  var url='https://dc.fandom.com/api.php?action=query&format=json&formatversion=2&redirects=1'+
    '&prop=pageimages%7Cinfo&inprop=url&piprop=thumbnail%7Coriginal&pithumbsize=720&pilicense=any'+
    '&titles='+encodeURIComponent(title)+'&origin=*';
  try{
    var response=await fetch(url);
    if(!response.ok) throw new Error('HTTP '+response.status);
    var data=await response.json();
    var page=data && data.query && data.query.pages && data.query.pages[0];
    var image=page && ((page.thumbnail && page.thumbnail.source) || (page.original && page.original.source)) || '';
    var result={imageUrl:image,fullImageUrl:(page && page.original && page.original.source) || image};
    fandomImageCache[title]=result;
    return result;
  }catch(error){
    console.warn('Terra Z DC import image:',error);
    return {imageUrl:'',fullImageUrl:''};
  }
}

function closeDcImport(){
  var panel=document.getElementById('dcImportPanel');
  if(panel){
    panel.classList.remove('show');
    panel.setAttribute('aria-hidden','true');
  }
  dcImportCurrent=null;
  if(!document.getElementById('fandomModal').classList.contains('show')) document.body.style.overflow='';
}

async function openDcImport(title){
  title=String(title || '').trim();
  if(!title) return;
  if(!(await ensureDcImportAdmin())) return;

  dcImportCurrent={
    title:title,
    name:dcImportDisplayName(title),
    imageUrl:'',
    fullImageUrl:''
  };

  var panel=document.getElementById('dcImportPanel');
  var name=document.getElementById('dcImportName');
  var source=document.getElementById('dcImportSource');
  var preview=document.getElementById('dcImportPreview');
  var status=document.getElementById('dcImportStatus');
  if(name) name.textContent=dcImportCurrent.name;
  if(source) source.textContent='DC Database · '+title;
  if(preview) preview.innerHTML='<div class="dc-import-preview-placeholder">DC</div>';
  if(status) status.textContent='Buscando imagem de referência…';

  updateDcImportExisting();

  if(panel){
    panel.classList.add('show');
    panel.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }

  var image=await fetchDcImportImage(title);
  if(!dcImportCurrent || dcImportCurrent.title!==title) return;
  dcImportCurrent.imageUrl=image.imageUrl || '';
  dcImportCurrent.fullImageUrl=image.fullImageUrl || image.imageUrl || '';
  if(preview){
    preview.innerHTML=dcImportCurrent.imageUrl
      ? '<img src="'+escapeAttr(dcImportCurrent.imageUrl)+'" alt="'+escapeAttr(dcImportCurrent.name)+'" referrerpolicy="no-referrer">'
      : '<div class="dc-import-preview-placeholder">DC</div>';
  }
  if(status) status.textContent=dcImportCurrent.imageUrl
    ? 'Referência visual encontrada. Revise tudo antes de salvar no Terra Z.'
    : 'Sem imagem automática; ainda é possível criar o card ou a bolinha.';
}

async function runDcImport(action){
  if(!dcImportCurrent) return;
  if(!(await ensureDcImportAdmin())) return;

  var current={...dcImportCurrent};
  var state=dcImportState(current.title);
  var app=window.TerraZApp || {};

  if(action==='card'){
    closeDcImport();
    if(document.getElementById('fandomModal').classList.contains('show')) closeFandomModal();
    if(state.character){
      if(app.characterEditor && app.characterEditor.open) app.characterEditor.open(state.character);
      return;
    }
    if(app.characterEditor && app.characterEditor.importFromDc){
      app.characterEditor.importFromDc({
        wikiTitle:current.title,
        name:current.name,
        addToGraph:false
      });
    }
    return;
  }

  if(action==='graph'){
    closeDcImport();
    if(document.getElementById('fandomModal').classList.contains('show')) closeFandomModal();
    if(app.graph && app.graph.importFromDc){
      await app.graph.importFromDc({
        characterName:state.character || '',
        label:state.character || current.name,
        wikiTitle:current.title,
        imageUrl:current.fullImageUrl || current.imageUrl || ''
      });
    }
    return;
  }

  if(action==='both'){
    if(state.character){
      closeDcImport();
      if(document.getElementById('fandomModal').classList.contains('show')) closeFandomModal();
      if(app.graph && app.graph.importFromDc){
        await app.graph.importFromDc({
          characterName:state.character,
          label:state.character,
          wikiTitle:current.title,
          imageUrl:''
        });
      }
      return;
    }

    closeDcImport();
    if(document.getElementById('fandomModal').classList.contains('show')) closeFandomModal();
    if(app.characterEditor && app.characterEditor.importFromDc){
      app.characterEditor.importFromDc({
        wikiTitle:current.title,
        name:current.name,
        addToGraph:true
      });
    }
  }
}


function fandomTranslateButton(){
  return document.getElementById('modalTranslateBtn');
}

function updateFandomTranslateButton(state, progress){
  var btn = fandomTranslateButton();
  if(!btn) return;

  btn.classList.remove('translated','translating');

  if(state === 'loading'){
    btn.disabled = true;
    btn.textContent = '🌐 Carregando…';
    return;
  }

  if(state === 'preparing'){
    btn.disabled = true;
    btn.classList.add('translating');
    btn.textContent = '⬇️ Preparando tradutor local…';
    return;
  }

  if(state === 'translating'){
    btn.disabled = true;
    btn.classList.add('translating');
    btn.textContent = progress ? ('🌐 Traduzindo ' + progress + '%') : '🌐 Traduzindo…';
    return;
  }

  if(state === 'translated'){
    btn.disabled = false;
    btn.classList.add('translated');
    btn.textContent = '🇧🇷 Ver original';
    return;
  }

  btn.disabled = false;
  btn.textContent = '🌐 Traduzir PT-BR';
}

function resetFandomTranslation(){
  fandomTranslationRunId++;
  fandomOriginalHtml = '';
  fandomTranslationMode = 'original';
  updateFandomTranslateButton('loading');
}

function getTranslatableWikiTextNodes(root){
  var nodes = [];
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode:function(node){
      var value = node.nodeValue || '';
      var trimmed = value.trim();
      if(trimmed.length < 2 || !/[A-Za-z]/.test(trimmed)) return NodeFilter.FILTER_REJECT;

      var parent = node.parentElement;
      if(!parent) return NodeFilter.FILTER_REJECT;
      if(parent.closest('script,style,noscript,code,pre,kbd,samp,svg,math')) return NodeFilter.FILTER_REJECT;
      if(parent.closest('.mw-editsection,.noprint,.reference,.metadata')) return NodeFilter.FILTER_REJECT;

      return NodeFilter.FILTER_ACCEPT;
    }
  });

  while(walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function splitOuterWhitespace(value){
  var match = String(value || '').match(/^(\s*)([\s\S]*?)(\s*)$/);
  return {
    before:match ? match[1] : '',
    core:match ? match[2] : String(value || ''),
    after:match ? match[3] : ''
  };
}

var bergamotEnginePromise = null;

function bergamotModuleUrl(){
  return new URL('vendor/bergamot/translator.js', document.baseURI).href;
}

async function getBergamotEngine(){
  if(bergamotEnginePromise) return bergamotEnginePromise;

  if(!('WebAssembly' in self) || !('Worker' in self)){
    throw new Error('Este navegador não oferece WebAssembly/Web Worker para tradução local.');
  }

  bergamotEnginePromise = import(bergamotModuleUrl()).then(function(module){
    if(!module || typeof module.BatchTranslator !== 'function'){
      throw new Error('Módulo de tradução local inválido.');
    }

    return new module.BatchTranslator({
      workers:1,
      batchSize:4,
      cacheSize:4096,
      downloadTimeout:180000,
      pivotLanguage:null,
      useNativeIntGemm:false
    });
  }).catch(function(error){
    bergamotEnginePromise = null;
    throw error;
  });

  return bergamotEnginePromise;
}

async function translateFandomBergamotBatch(texts){
  var engine = await getBergamotEngine();
  var output = [];

  for(var start=0;start<texts.length;start+=16){
    var slice = texts.slice(start,start+16);
    var translated = await Promise.all(slice.map(function(text){
      return engine.translate({
        from:'en',
        to:'pt',
        text:String(text || ''),
        html:false,
        priority:0
      });
    }));

    translated.forEach(function(result,index){
      var source = slice[index];
      var value = result && result.target ? result.target.text : '';
      output.push(String(value || source));
    });
  }

  return output;
}

async function translateFandomBergamot(text){
  var result = await translateFandomBergamotBatch([text]);
  return result[0] || text;
}

async function getFandomTranslator(){
  if(fandomTranslatorPromise) return fandomTranslatorPromise;

  fandomTranslatorPromise = (async function(){
    if('Translator' in self && self.Translator && typeof self.Translator.create === 'function'){
      try{
        if(typeof self.Translator.availability === 'function'){
          var availability = await self.Translator.availability({
            sourceLanguage:'en',
            targetLanguage:'pt'
          });
          if(availability === 'unavailable') throw new Error('Par de idiomas indisponível.');
        }

        var nativeTranslator = await self.Translator.create({
          sourceLanguage:'en',
          targetLanguage:'pt',
          monitor:function(monitor){
            monitor.addEventListener('downloadprogress',function(event){
              var percent = Math.max(0,Math.min(100,Math.round((event.loaded || 0) * 100)));
              updateFandomTranslateButton('translating', percent);
            });
          }
        });

        return {
          kind:'native',
          translate:function(text){ return nativeTranslator.translate(text); }
        };
      }catch(error){
        console.warn('Terra Z: Translator nativo indisponível; usando Bergamot local.', error);
      }
    }

    return {
      kind:'bergamot',
      translate:translateFandomBergamot,
      translateMany:translateFandomBergamotBatch
    };
  })().catch(function(error){
    fandomTranslatorPromise = null;
    throw error;
  });

  return fandomTranslatorPromise;
}

async function translateFandomArticle(){
  var body = document.getElementById('modalBody');
  if(!body || !currentFandomTitle) return;

  if(fandomTranslationMode === 'translated'){
    if(fandomOriginalHtml){
      body.innerHTML = fandomOriginalHtml;
      processWikiContent(body);
      body.scrollTop = 0;
    }
    fandomTranslationMode = 'original';
    updateFandomTranslateButton('original');
    return;
  }

  var title = currentFandomTitle;
  var runId = ++fandomTranslationRunId;

  if(fandomTranslatedHtmlCache[title]){
    body.innerHTML = fandomTranslatedHtmlCache[title];
    processWikiContent(body);
    body.scrollTop = 0;
    fandomTranslationMode = 'translated';
    updateFandomTranslateButton('translated');
    return;
  }

  if(!fandomOriginalHtml){
    showToast('O artigo ainda está carregando.','warning');
    return;
  }

  updateFandomTranslateButton('translating', 0);

  try {
    var translator = await getFandomTranslator();
    if(runId !== fandomTranslationRunId || title !== currentFandomTitle) return;

    if(translator.kind === 'bergamot'){
      updateFandomTranslateButton('preparing');
      try{
        if(localStorage.getItem('terra-z-bergamot-first-use') !== '1'){
          showToast('Primeiro uso: baixando o modelo local EN→PT. Depois ele fica em cache no aparelho.','info',6000);
          localStorage.setItem('terra-z-bergamot-first-use','1');
        }
      }catch(error){}
    }

    var holder = document.createElement('div');
    holder.innerHTML = fandomOriginalHtml;

    var nodes = getTranslatableWikiTextNodes(holder);
    var unique = [];
    var seen = new Set();

    nodes.forEach(function(node){
      var parts = splitOuterWhitespace(node.nodeValue);
      var key = parts.core.trim();
      if(!key || seen.has(key)) return;
      seen.add(key);
      unique.push(key);
    });

    var translatedMap = {};
    var pending = unique.filter(function(sourceText){
      var cached = fandomTextTranslationCache[sourceText];
      if(cached){
        translatedMap[sourceText] = cached;
        return false;
      }
      return true;
    });

    if(translator.translateMany && pending.length){
      var batches = [];
      var currentBatch = [];
      var currentChars = 0;
      var maxBatchChars = 12000;
      var maxBatchItems = 24;

      pending.forEach(function(sourceText){
        var nextChars = currentChars + sourceText.length;
        if(currentBatch.length && (nextChars > maxBatchChars || currentBatch.length >= maxBatchItems)){
          batches.push(currentBatch);
          currentBatch = [];
          currentChars = 0;
        }
        currentBatch.push(sourceText);
        currentChars += sourceText.length;
      });
      if(currentBatch.length) batches.push(currentBatch);

      var completed = unique.length - pending.length;

      for(var batchIndex=0;batchIndex<batches.length;batchIndex++){
        if(runId !== fandomTranslationRunId || title !== currentFandomTitle) return;

        var batch = batches[batchIndex];
        var translatedBatch = await translator.translateMany(batch);

        batch.forEach(function(sourceText,index){
          var translated = String(translatedBatch[index] || sourceText);
          fandomTextTranslationCache[sourceText] = translated;
          translatedMap[sourceText] = translated;
        });

        completed += batch.length;
        updateFandomTranslateButton(
          'translating',
          unique.length ? Math.round((completed/unique.length)*100) : 100
        );
      }
    } else {
      for(var i=0;i<unique.length;i++){
        if(runId !== fandomTranslationRunId || title !== currentFandomTitle) return;

        var sourceText = unique[i];
        var translated = translatedMap[sourceText] || fandomTextTranslationCache[sourceText];

        if(!translated){
          translated = await translator.translate(sourceText);
          translated = String(translated || sourceText);
          fandomTextTranslationCache[sourceText] = translated;
        }

        translatedMap[sourceText] = translated;
        updateFandomTranslateButton('translating', unique.length ? Math.round(((i+1)/unique.length)*100) : 100);
      }
    }

    if(runId !== fandomTranslationRunId || title !== currentFandomTitle) return;

    nodes.forEach(function(node){
      var parts = splitOuterWhitespace(node.nodeValue);
      var key = parts.core.trim();
      if(!translatedMap[key]) return;
      node.nodeValue = parts.before + translatedMap[key] + parts.after;
    });

    var translatedHtml = holder.innerHTML;
    fandomTranslatedHtmlCache[title] = translatedHtml;

    body.innerHTML = translatedHtml;
    processWikiContent(body);
    body.scrollTop = 0;
    fandomTranslationMode = 'translated';
    updateFandomTranslateButton('translated');
    showToast('Artigo traduzido para português.','success',3500);
  } catch(error){
    console.error('Terra Z wiki translation:', error);
    fandomTranslationMode = 'original';
    updateFandomTranslateButton('original');
    showToast(error.message || 'Não foi possível traduzir o artigo.','error',6000);
  }
}

function openFandomModal(title){
  resetFandomTranslation();
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
  var importBtn=document.getElementById('modalImportBtn');
  if(importBtn){
    importBtn.hidden=!canDcImport();
    importBtn.dataset.dcImportTitle=title;
  }
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
      fandomOriginalHtml = body.innerHTML;
      fandomTranslationMode = 'original';
      updateFandomTranslateButton('original');
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
  fandomTranslationRunId++;
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



function searchOnFandom(term){
  if(window.closeFichaModal) window.closeFichaModal();
  var input = document.getElementById('searchInput');
  if(input) input.value = term;
  fandomHistory = [];
  currentFandomTitle = null;
  switchSearchMode('fandom');
  executeSearch();
  window.scrollTo({top:0, behavior:'smooth'});
}

setupModalBodyDelegation();
var fandomTranslateBtn = fandomTranslateButton();
if(fandomTranslateBtn) fandomTranslateBtn.addEventListener('click', translateFandomArticle);

var modalImportBtn=document.getElementById('modalImportBtn');
if(modalImportBtn) modalImportBtn.addEventListener('click',function(){
  openDcImport(modalImportBtn.dataset.dcImportTitle || currentFandomTitle || '');
});
var dcImportClose=document.getElementById('dcImportClose');
if(dcImportClose) dcImportClose.addEventListener('click',closeDcImport);
var dcImportPanel=document.getElementById('dcImportPanel');
if(dcImportPanel) dcImportPanel.addEventListener('click',function(event){
  if(event.target===dcImportPanel) closeDcImport();
});
var dcImportCardBtn=document.getElementById('dcImportCardBtn');
if(dcImportCardBtn) dcImportCardBtn.addEventListener('click',function(){runDcImport('card');});
var dcImportGraphBtn=document.getElementById('dcImportGraphBtn');
if(dcImportGraphBtn) dcImportGraphBtn.addEventListener('click',function(){runDcImport('graph');});
var dcImportBothBtn=document.getElementById('dcImportBothBtn');
if(dcImportBothBtn) dcImportBothBtn.addEventListener('click',function(){runDcImport('both');});

document.addEventListener('terra-z:auth-changed',function(){
  var btn=document.getElementById('modalImportBtn');
  if(btn) btn.hidden=!canDcImport();
  var query=searchInput ? searchInput.value.trim() : '';
  var key=fandomCacheKey(query);
  if(searchMode==='fandom' && query.length>=2 && fandomCache[key]){
    renderFandomResults(fandomCache[key],query);
  }
});

window.executeSearch = executeSearch;
window.closeFandomModal = closeFandomModal;
window.closeSearchPanel = closeSearchPanel;
window.goBackFandom = goBackFandom;
window.switchSearchMode = switchSearchMode;
window.searchOnFandom = searchOnFandom;

window.TerraZApp.search = {
  execute: executeSearch,
  closeModal: closeFandomModal,
  closePanel: closeSearchPanel,
  back: goBackFandom,
  switchMode: switchSearchMode,
  searchOnFandom: searchOnFandom,
  translateArticle: translateFandomArticle,
  openImport:openDcImport,
  closeImport:closeDcImport,
  importAction:runDcImport,
  importState:dcImportState
};

})();
