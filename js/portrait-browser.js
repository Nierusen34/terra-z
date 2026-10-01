(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/portrait-browser.js');

var escapeHtml = core.escapeHtml;
var escapeAttr = core.escapeAttr;
var showToast = core.showToast;
var showConfirm = core.showConfirm;

var FANDOM_API = 'https://dc.fandom.com/api.php';
var currentCharacter = '';
var currentPage = null;
var requestSerial = 0;
var versions = [];

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }

function mediaItem(name){
  var all = (window.TerraZData && window.TerraZData.characterMedia) || {};
  return all[name] || {};
}

function canEdit(){
  var b = backend();
  return !!(b && b.isConfigured && b.isConfigured() && b.isAuthenticated && b.isAuthenticated());
}

function configuredQuery(name){
  var item = mediaItem(name);
  var auto = item.auto || {};

  if(auto.provider === 'dc-fandom' && auto.wikiTitle){
    return String(auto.wikiTitle).replace(/\s*\([^)]*\)\s*$/,'').trim();
  }

  return name;
}

function setStatus(message,state){
  var node = el('portraitBrowserStatus');
  if(!node) return;
  node.textContent = message || '';
  node.setAttribute('data-state',state || 'idle');
}

function setCurrentSummary(){
  var node = el('portraitBrowserCurrent');
  if(!node) return;

  var item = mediaItem(currentCharacter);
  var auto = item.auto || {};

  if(item.src){
    node.innerHTML = '<strong>Atual:</strong> imagem própria · ela tem prioridade sobre fontes automáticas.';
    return;
  }

  if(auto.provider === 'dc-fandom' && auto.wikiTitle){
    node.innerHTML = '<strong>Atual:</strong> DC Database · ' + escapeHtml(auto.wikiTitle);
    return;
  }

  if(auto.provider === 'external-url' && auto.imageUrl){
    node.innerHTML = '<strong>Atual:</strong> imagem específica · ' + escapeHtml(auto.sourceLabel || 'fonte externa');
    return;
  }

  node.innerHTML = '<strong>Atual:</strong> sem fonte automática configurada.';
}

function fandomUrl(params){
  var url = new URL(FANDOM_API);
  Object.keys(params || {}).forEach(function(key){
    var value = params[key];
    if(value !== undefined && value !== null && value !== ''){
      url.searchParams.set(key,String(value));
    }
  });
  url.searchParams.set('origin','*');
  return url.toString();
}

async function fandom(params){
  var response = await fetch(fandomUrl(params),{
    headers:{'Accept':'application/json'}
  });
  if(!response.ok) throw new Error('DC Database respondeu HTTP ' + response.status);
  return response.json();
}

function pageImage(page){
  if(!page) return '';
  return (page.thumbnail && page.thumbnail.source) ||
    (page.original && page.original.source) || '';
}

function fullPageImage(page){
  if(!page) return '';
  return (page.original && page.original.source) || pageImage(page);
}

function pageUrl(page){
  if(page && page.fullurl) return page.fullurl;
  if(page && page.title){
    return 'https://dc.fandom.com/wiki/' + encodeURIComponent(page.title.replace(/ /g,'_'));
  }
  return '';
}

function dedupePages(list){
  var seen = new Set();
  return (list || []).filter(function(page){
    if(!page || !page.title || page.missing) return false;
    var key = page.title.toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function relevance(page,query){
  var title = String(page && page.title || '').toLowerCase();
  var q = String(query || '').toLowerCase().trim();
  var item = mediaItem(currentCharacter);
  var configured = String(item.auto && item.auto.wikiTitle || '').toLowerCase();
  var score = 0;

  if(title === configured) score += 200;
  if(title === q) score += 100;
  if(q && title.indexOf(q) === 0) score += 60;
  if(title.indexOf('(prime earth)') >= 0) score += 30;
  if(title.indexOf('(new earth)') >= 0) score += 20;
  if(pageImage(page)) score += 15;
  if(title.indexOf('/gallery') >= 0 || title.indexOf('/appearances') >= 0) score -= 100;

  return score;
}

async function fetchExactConfigured(){
  var item = mediaItem(currentCharacter);
  var auto = item.auto || {};

  if(auto.provider !== 'dc-fandom' || !auto.wikiTitle) return [];

  var data = await fandom({
    action:'query',
    format:'json',
    formatversion:'2',
    redirects:'1',
    prop:'pageimages|info',
    inprop:'url',
    piprop:'thumbnail|original|name',
    pithumbsize:'500',
    pilicense:'any',
    titles:auto.wikiTitle
  });

  return data && data.query && Array.isArray(data.query.pages)
    ? data.query.pages
    : [];
}

async function searchPages(query){
  var data = await fandom({
    action:'query',
    format:'json',
    formatversion:'2',
    generator:'search',
    gsrsearch:query,
    gsrnamespace:'0',
    gsrlimit:'18',
    prop:'pageimages|info',
    inprop:'url',
    piprop:'thumbnail|original|name',
    pithumbsize:'500',
    pilicense:'any'
  });

  return data && data.query && Array.isArray(data.query.pages)
    ? data.query.pages
    : [];
}

function renderVersions(query){
  var body = el('portraitBrowserBody');
  if(!body) return;

  if(!versions.length){
    body.innerHTML =
      '<div class="portrait-browser-empty">' +
        '<strong>Nenhuma versão encontrada.</strong>' +
        '<span>Tente outro nome, identidade secreta ou título usado pela DC Database.</span>' +
      '</div>';
    return;
  }

  var item = mediaItem(currentCharacter);
  var auto = item.auto || {};

  body.innerHTML =
    '<div class="portrait-browser-section-head">' +
      '<div><strong>Versões encontradas</strong><span>' + escapeHtml(String(versions.length)) + ' resultados para “' + escapeHtml(query) + '”</span></div>' +
    '</div>' +
    '<div class="portrait-version-grid">' +
    versions.map(function(page,index){
      var image = pageImage(page);
      var isCurrent = auto.provider === 'dc-fandom' && auto.wikiTitle === page.title;

      return '<article class="portrait-version-card' + (isCurrent ? ' current' : '') + '">' +
        '<button class="portrait-version-preview" type="button" data-preview-version="' + index + '"' + (image ? '' : ' disabled') + '>' +
          (image
            ? '<img src="' + escapeAttr(image) + '" alt="' + escapeAttr(page.title) + '" loading="lazy" referrerpolicy="no-referrer">'
            : '<span class="portrait-version-noimage">SEM PREVIEW</span>') +
        '</button>' +
        '<div class="portrait-version-copy">' +
          '<div class="portrait-version-title">' +
            '<span>' + escapeHtml(page.title) + '</span>' +
            (isCurrent ? '<span class="portrait-current-badge">ATUAL</span>' : '') +
          '</div>' +
          '<div class="portrait-version-actions">' +
            '<button type="button" data-use-version="' + index + '">✓ Usar principal</button>' +
            '<button type="button" data-gallery-version="' + index + '">▦ Ver imagens</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('') +
    '</div>';

  bindVersionActions();
}

function bindVersionActions(){
  var body = el('portraitBrowserBody');
  if(!body) return;

  body.querySelectorAll('[data-preview-version]').forEach(function(button){
    button.addEventListener('click',function(){
      var page = versions[Number(button.getAttribute('data-preview-version'))];
      var src = fullPageImage(page);
      var nav = window.TerraZApp && window.TerraZApp.navigation;
      if(src && nav && nav.openLightbox) nav.openLightbox(src,page.title || currentCharacter);
    });
  });

  body.querySelectorAll('[data-use-version]').forEach(function(button){
    button.addEventListener('click',function(){
      var page = versions[Number(button.getAttribute('data-use-version'))];
      if(page) confirmUseVersion(page);
    });
  });

  body.querySelectorAll('[data-gallery-version]').forEach(function(button){
    button.addEventListener('click',function(){
      var page = versions[Number(button.getAttribute('data-gallery-version'))];
      if(page) loadGallery(page);
    });
  });
}

async function runSearch(){
  if(!currentCharacter) return;

  var input = el('portraitBrowserQuery');
  var query = input ? input.value.trim() : '';

  if(!query) query = configuredQuery(currentCharacter);
  if(input) input.value = query;

  var serial = ++requestSerial;
  setStatus('Consultando versões na DC Database…','working');

  var body = el('portraitBrowserBody');
  if(body) body.innerHTML = '<div class="portrait-browser-loading">Buscando versões e retratos…</div>';

  try{
    var results = await Promise.all([
      fetchExactConfigured().catch(function(){ return []; }),
      searchPages(query)
    ]);

    if(serial !== requestSerial) return;

    versions = dedupePages([].concat(results[0] || [],results[1] || []))
      .filter(function(page){
        var title = String(page.title || '');
        return title.indexOf('/Gallery') < 0 &&
          title.indexOf('/Appearances') < 0 &&
          title.indexOf('/Quotes') < 0;
      })
      .sort(function(a,b){
        return relevance(b,query) - relevance(a,query);
      })
      .slice(0,16);

    renderVersions(query);

    setStatus(
      versions.length
        ? 'Escolha uma versão ou abra “Ver imagens” para selecionar uma arte específica.'
        : 'Nenhuma versão correspondente foi encontrada.',
      versions.length ? 'ready' : 'warning'
    );
  }catch(error){
    console.error('Terra Z portrait browser:',error);

    if(serial !== requestSerial) return;

    versions = [];
    setStatus('Não foi possível consultar a DC Database agora. Tente novamente.','error');

    if(body){
      body.innerHTML =
        '<div class="portrait-browser-empty">' +
          '<strong>Consulta indisponível.</strong>' +
          '<span>Você ainda pode usar “Imagem externa (URL)” no editor da ficha.</span>' +
        '</div>';
    }
  }
}

function imageIsUseful(file){
  var info = file && Array.isArray(file.imageinfo) ? file.imageinfo[0] : null;

  if(!info || !info.url) return false;
  if(info.mime && String(info.mime).indexOf('image/') !== 0) return false;

  var title = String(file.title || '');

  if(/\.(svg|gif)$/i.test(title)) return false;
  if(/logo|favicon|icon|button|arrow|wiki-wordmark|placeholder|no[_ -]?image/i.test(title)) return false;

  var width = Number(info.width || 0);
  var height = Number(info.height || 0);

  if(width && height && (width < 180 || height < 180)) return false;

  return true;
}

async function loadGallery(page){
  currentPage = page;

  var body = el('portraitBrowserBody');
  if(!body) return;

  setStatus('Carregando imagens de ' + page.title + '…','working');

  body.innerHTML =
    '<div class="portrait-gallery-head">' +
      '<button id="portraitGalleryBack" type="button">← Versões</button>' +
      '<div><strong>' + escapeHtml(page.title) + '</strong><span>Imagens usadas nesta página da DC Database</span></div>' +
    '</div>' +
    '<div class="portrait-browser-loading">Carregando galeria…</div>';

  bindGalleryBack();

  try{
    var data = await fandom({
      action:'query',
      format:'json',
      formatversion:'2',
      titles:page.title,
      generator:'images',
      gimlimit:'50',
      prop:'imageinfo',
      iiprop:'url|size|mime',
      iiurlwidth:'420'
    });

    if(currentPage !== page) return;

    var files = data && data.query && Array.isArray(data.query.pages)
      ? data.query.pages.filter(imageIsUseful).slice(0,36)
      : [];

    renderGallery(page,files);

    setStatus(
      files.length
        ? 'Clique numa imagem para ampliar ou use “Aplicar” para escolhê-la.'
        : 'A página não retornou imagens utilizáveis além do retrato principal.',
      files.length ? 'ready' : 'warning'
    );
  }catch(error){
    console.error('Terra Z portrait gallery:',error);
    setStatus('Não foi possível carregar a galeria desta versão.','error');

    var loading = body.querySelector('.portrait-browser-loading');
    if(loading) loading.textContent = 'Galeria indisponível no momento.';
  }
}

function bindGalleryBack(){
  var back = el('portraitGalleryBack');
  if(!back) return;

  back.addEventListener('click',function(){
    currentPage = null;
    renderVersions(el('portraitBrowserQuery') ? el('portraitBrowserQuery').value : '');
    setStatus('Escolha uma versão ou abra “Ver imagens” para selecionar uma arte específica.','ready');
  });
}

function renderGallery(page,files){
  var body = el('portraitBrowserBody');
  if(!body) return;

  var item = mediaItem(currentCharacter);
  var auto = item.auto || {};

  body.innerHTML =
    '<div class="portrait-gallery-head">' +
      '<button id="portraitGalleryBack" type="button">← Versões</button>' +
      '<div><strong>' + escapeHtml(page.title) + '</strong><span>' + escapeHtml(String(files.length)) + ' imagens disponíveis</span></div>' +
      '<button id="portraitUseMainBtn" class="primary" type="button">✓ Usar retrato principal</button>' +
    '</div>' +
    (files.length
      ? '<div class="portrait-gallery-grid">' +
        files.map(function(file,index){
          var info = file.imageinfo[0];
          var thumb = info.thumburl || info.url;
          var isCurrent = auto.provider === 'external-url' && auto.imageUrl === info.url;

          return '<article class="portrait-gallery-item' + (isCurrent ? ' current' : '') + '">' +
            '<button class="portrait-gallery-preview" type="button" data-preview-image="' + index + '">' +
              '<img src="' + escapeAttr(thumb) + '" alt="' + escapeAttr(file.title || page.title) + '" loading="lazy" referrerpolicy="no-referrer">' +
            '</button>' +
            '<div class="portrait-gallery-meta">' +
              (isCurrent ? '<span class="portrait-current-badge">ATUAL</span>' : '<span></span>') +
              '<button type="button" data-use-image="' + index + '">Aplicar</button>' +
            '</div>' +
          '</article>';
        }).join('') +
        '</div>'
      : '<div class="portrait-browser-empty">' +
          '<strong>Sem imagens adicionais.</strong>' +
          '<span>Você ainda pode usar o retrato principal desta versão.</span>' +
        '</div>');

  bindGalleryBack();

  var main = el('portraitUseMainBtn');
  if(main) main.addEventListener('click',function(){
    confirmUseVersion(page);
  });

  body.querySelectorAll('[data-preview-image]').forEach(function(button){
    button.addEventListener('click',function(){
      var file = files[Number(button.getAttribute('data-preview-image'))];
      var info = file && file.imageinfo && file.imageinfo[0];
      var nav = window.TerraZApp && window.TerraZApp.navigation;

      if(info && info.url && nav && nav.openLightbox){
        nav.openLightbox(info.url,file.title || page.title);
      }
    });
  });

  body.querySelectorAll('[data-use-image]').forEach(function(button){
    button.addEventListener('click',function(){
      var file = files[Number(button.getAttribute('data-use-image'))];
      var info = file && file.imageinfo && file.imageinfo[0];

      if(info && info.url){
        confirmUseImage(page,file,info.url);
      }
    });
  });
}

function hasLocalPortrait(){
  return !!mediaItem(currentCharacter).src;
}

function withLocalPortraitRemoved(next){
  if(!hasLocalPortrait()){
    next();
    return;
  }

  showConfirm(
    'Substituir imagem própria',
    'Este personagem usa uma imagem própria, que sempre tem prioridade. Para aplicar a escolha da DC Database, essa imagem própria será removida do Terra Z. Continuar?',
    function(){
      var manager = window.TerraZApp && window.TerraZApp.mediaManager;

      if(!manager || !manager.remove){
        showToast('O gerenciador de mídia não está disponível.','error',5000);
        return;
      }

      manager.remove(currentCharacter)
        .then(next)
        .catch(function(error){
          console.error(error);
          showToast(error.message || 'Não foi possível remover a imagem própria.','error',6000);
        });
    },
    'Substituir retrato'
  );
}

function confirmUseVersion(page){
  showConfirm(
    'Aplicar versão',
    'Usar o retrato principal de “' + page.title + '” em ' + currentCharacter + '? A ficha narrativa não será alterada.',
    function(){
      withLocalPortraitRemoved(function(){
        saveSource({
          provider:'dc-fandom',
          wikiTitle:page.title
        });
      });
    },
    'Aplicar retrato'
  );
}

function confirmUseImage(page,file,imageUrl){
  showConfirm(
    'Aplicar imagem',
    'Usar esta imagem de “' + page.title + '” como retrato de ' + currentCharacter + '? A ficha narrativa não será alterada.',
    function(){
      withLocalPortraitRemoved(function(){
        saveSource({
          provider:'external-url',
          imageUrl:imageUrl,
          pageUrl:pageUrl(page),
          sourceLabel:'DC Database · Fandom · ' + page.title
        });
      });
    },
    'Aplicar imagem'
  );
}

async function saveSource(source){
  var b = backend();

  if(!b || !b.isAuthenticated()){
    showToast('Sua sessão de editor expirou.','warning',5000);
    close();
    return;
  }

  setStatus('Aplicando retrato…','working');

  try{
    var body = Object.assign({
      action:'configure-source',
      character:currentCharacter
    },source);

    var result = await b.request('/api/media',{
      method:'POST',
      body:body
    });

    window.TerraZData = window.TerraZData || {};
    window.TerraZData.characterMedia = window.TerraZData.characterMedia || {};
    window.TerraZData.characterMedia[currentCharacter] =
      result.media || window.TerraZData.characterMedia[currentCharacter] || {};

    var characterMedia = window.TerraZApp && window.TerraZApp.characterMedia;

    if(characterMedia && characterMedia.clearAutomaticCache){
      characterMedia.clearAutomaticCache(currentCharacter);
    }

    if(characterMedia && characterMedia.resolveAutomatic){
      await characterMedia.resolveAutomatic(currentCharacter);
    }

    if(characterMedia && characterMedia.refresh){
      characterMedia.refresh(document);
    }

    document.dispatchEvent(new CustomEvent('terra-z:character-media-changed',{
      detail:{character:currentCharacter,sourceChanged:true}
    }));

    showToast('Novo retrato aplicado a ' + currentCharacter + '.','success',4500);

    var runtime = window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh){
      runtime.refresh({force:true,bust:result.sha,silent:true});
    }

    var publishing = window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url){
      publishing.trackDeployment(result.status_url);
    }

    close();
  }catch(error){
    console.error('Terra Z portrait selection:',error);
    setStatus(error.message || 'Não foi possível aplicar o retrato.','error');
    showToast(error.message || 'Não foi possível aplicar o retrato.','error',6000);
  }
}

function open(name){
  if(!name) return;

  if(!canEdit()){
    showToast('Entre como editor para escolher retratos.','warning',5000);
    if(window.TerraZApp.publishing) window.TerraZApp.publishing.open();
    return;
  }

  currentCharacter = name;
  currentPage = null;
  versions = [];
  requestSerial++;

  var modal = el('portraitBrowserModal');
  if(!modal) return;

  var title = el('portraitBrowserTitle');
  if(title) title.textContent = 'Escolher retrato · ' + name;

  var query = el('portraitBrowserQuery');
  if(query) query.value = configuredQuery(name);

  setCurrentSummary();
  setStatus('Busque uma versão do personagem na DC Database.','ready');

  var body = el('portraitBrowserBody');
  if(body) body.innerHTML = '<div class="portrait-browser-loading">Preparando arquivo visual…</div>';

  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';

  runSearch();
}

function close(){
  requestSerial++;
  currentPage = null;

  var modal = el('portraitBrowserModal');
  if(modal){
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
  }

  var keepLocked = !!document.querySelector(
    '#fichaModal.show,.character-editor-panel.show,#presentationModal.show,#graphEditorModal.show'
  );
  document.body.style.overflow = keepLocked ? 'hidden' : '';
}

function setup(){
  var closeBtn = el('portraitBrowserClose');
  var searchBtn = el('portraitBrowserSearchBtn');
  var query = el('portraitBrowserQuery');
  var modal = el('portraitBrowserModal');

  if(closeBtn) closeBtn.addEventListener('click',close);
  if(searchBtn) searchBtn.addEventListener('click',runSearch);

  if(query){
    query.addEventListener('keydown',function(event){
      if(event.key === 'Enter'){
        event.preventDefault();
        runSearch();
      }
    });
  }

  if(modal){
    modal.addEventListener('click',function(event){
      if(event.target === modal) close();
    });
  }

  document.addEventListener('keydown',function(event){
    if(event.key === 'Escape' && modal && modal.classList.contains('show')){
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  },true);

  document.addEventListener('terra-z:auth-changed',function(){
    if(modal && modal.classList.contains('show') && !canEdit()) close();
  });
}

setup();

window.TerraZApp.portraitBrowser = {
  open:open,
  close:close,
  search:runSearch
};

})();