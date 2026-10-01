(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/character-media.js');

var escapeHtml = core.escapeHtml;
var escapeAttr = core.escapeAttr;
var media = (window.TerraZData && window.TerraZData.characterMedia) || {};

var AUTO_CACHE_PREFIX = 'terraZ_dc_portrait_v1:';
var AUTO_CACHE_MS = 24 * 60 * 60 * 1000;
var autoResolved = Object.create(null);
var autoPending = Object.create(null);
var autoObserver = null;

function initials(name){
  var parts = String(name || '').replace(/[’']/g, '').split(/\s+/).filter(Boolean);
  if(parts.length === 0) return '?';
  if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

function automaticConfig(item){
  var auto = item && item.auto;
  if(!auto || auto.provider !== 'dc-fandom' || !auto.wikiTitle) return null;
  return auto;
}

function getMeta(name){
  var item = media[name] || {};
  var resolved = autoResolved[name] || null;
  return {
    src: item.src || (resolved && resolved.imageUrl) || '',
    alt: item.alt || name,
    source: item.src ? (item.source || 'local') : (resolved ? resolved.provider : (automaticConfig(item) ? 'auto' : (item.source || ''))),
    credit: item.credit || (resolved && resolved.source) || '',
    pageUrl: (resolved && resolved.pageUrl) || '',
    automatic: !item.src && !!automaticConfig(item)
  };
}

function cacheKey(name,config){
  return AUTO_CACHE_PREFIX + encodeURIComponent(name) + ':' + encodeURIComponent(config.wikiTitle);
}

function readCache(name,config){
  try{
    var raw = localStorage.getItem(cacheKey(name,config));
    if(!raw) return null;
    var item = JSON.parse(raw);
    if(!item || !item.savedAt || Date.now() - item.savedAt > AUTO_CACHE_MS){
      localStorage.removeItem(cacheKey(name,config));
      return null;
    }
    return item.data || null;
  }catch(e){
    return null;
  }
}

function writeCache(name,config,data){
  try{
    localStorage.setItem(cacheKey(name,config),JSON.stringify({
      savedAt:Date.now(),
      data:data
    }));
  }catch(e){}
}

async function directFandom(config){
  var url = 'https://dc.fandom.com/api.php?action=query&format=json&formatversion=2&redirects=1' +
    '&prop=pageimages%7Cinfo&inprop=url&piprop=thumbnail%7Coriginal%7Cname&pithumbsize=900&pilicense=any' +
    '&titles=' + encodeURIComponent(config.wikiTitle) + '&origin=*';

  var response = await fetch(url,{headers:{'Accept':'application/json'}});
  if(!response.ok) throw new Error('DC Fandom HTTP ' + response.status);
  var data = await response.json();
  var page = data && data.query && Array.isArray(data.query.pages) ? data.query.pages[0] : null;
  var imageUrl = page && ((page.thumbnail && page.thumbnail.source) || (page.original && page.original.source));
  if(!page || page.missing || !imageUrl) return {ok:true,found:false,provider:'dc-fandom'};
  return {
    ok:true,
    found:true,
    provider:'dc-fandom',
    source:'DC Database · Fandom',
    title:page.title || config.wikiTitle,
    imageUrl:imageUrl,
    pageUrl:page.fullurl || ''
  };
}

async function fetchAutomatic(name,config){
  var backend = window.TerraZApp && window.TerraZApp.backend;

  if(backend && backend.isConfigured && backend.isConfigured() && backend.publicJson){
    try{
      return await backend.publicJson(
        '/api/media?dc=1&name=' + encodeURIComponent(name) +
        '&title=' + encodeURIComponent(config.wikiTitle)
      );
    }catch(error){
      console.warn('Terra Z: fallback direto para DC Fandom em',name,error);
    }
  }

  return directFandom(config);
}

function resolveAutomatic(name){
  var item = media[name] || {};
  if(item.src) return Promise.resolve(null);

  var config = automaticConfig(item);
  if(!config) return Promise.resolve(null);

  if(autoResolved[name]) return Promise.resolve(autoResolved[name]);
  if(autoPending[name]) return autoPending[name];

  var cached = readCache(name,config);
  if(cached){
    if(cached.found && cached.imageUrl) autoResolved[name] = cached;
    return Promise.resolve(cached);
  }

  autoPending[name] = fetchAutomatic(name,config)
    .then(function(result){
      var normalized = result && result.found && result.imageUrl
        ? {
            found:true,
            provider:'dc-fandom',
            source:result.source || 'DC Database · Fandom',
            title:result.title || config.wikiTitle,
            imageUrl:result.imageUrl,
            pageUrl:result.pageUrl || ''
          }
        : {found:false,provider:'dc-fandom'};

      writeCache(name,config,normalized);
      if(normalized.found) autoResolved[name] = normalized;
      return normalized;
    })
    .catch(function(error){
      console.warn('Terra Z: retrato automático indisponível para',name,error);
      return {found:false,provider:'dc-fandom'};
    })
    .finally(function(){
      delete autoPending[name];
    });

  return autoPending[name];
}

function renderPortraitHtml(name, size){
  var meta = getMeta(name);
  var item = media[name] || {};
  var auto = automaticConfig(item);
  var cls = 'character-portrait ' + (size === 'large' ? 'large' : 'small');

  if(meta.src){
    var runtime = window.TerraZApp && window.TerraZApp.runtimeData;
    var src = item.src && runtime && runtime.mediaUrl ? runtime.mediaUrl(item.src) : meta.src;
    var sourceClass = meta.automatic ? ' auto-source' : '';
    var title = meta.automatic ? ' title="Retrato automático · DC Database (Fandom)"' : '';
    return '<div class="' + cls + sourceClass + '" data-character="' + escapeAttr(name) + '"' + title + '>' +
      '<img data-src="' + escapeAttr(src) + '" alt="' + escapeAttr(meta.alt) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">' +
      '</div>';
  }

  var autoAttrs = auto
    ? ' data-auto-portrait="1" data-auto-state="idle" title="Buscando retrato automático na DC Database"'
    : '';

  return '<div class="' + cls + ' placeholder' + (auto ? ' auto-pending' : '') + '" data-character="' + escapeAttr(name) + '"' + autoAttrs + ' aria-label="Sem retrato para ' + escapeAttr(name) + '">' +
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

function replaceAutomaticPortrait(wrapper,result){
  if(!wrapper || !wrapper.isConnected || !result || !result.found || !result.imageUrl) return;

  var name = wrapper.getAttribute('data-character');
  var size = wrapper.classList.contains('large') ? 'large' : 'small';
  var holder = document.createElement('div');
  holder.innerHTML = renderPortraitHtml(name,size);
  var next = holder.firstElementChild;

  if(next){
    next.classList.add('auto-source');
    next.title = 'Retrato automático · DC Database (Fandom)';
    wrapper.replaceWith(next);
    if(window.TerraZApp.media) window.TerraZApp.media.hydrate(next);
  }

  document.dispatchEvent(new CustomEvent('terra-z:auto-portrait-resolved',{
    detail:{
      character:name,
      source:result.source || 'DC Database · Fandom',
      pageUrl:result.pageUrl || ''
    }
  }));
}

function loadAutomaticWrapper(wrapper){
  if(!wrapper || wrapper.getAttribute('data-auto-state') === 'loading') return;
  var name = wrapper.getAttribute('data-character');
  if(!name) return;

  wrapper.setAttribute('data-auto-state','loading');

  resolveAutomatic(name).then(function(result){
    if(result && result.found){
      replaceAutomaticPortrait(wrapper,result);
    }else if(wrapper && wrapper.isConnected){
      wrapper.classList.remove('auto-pending');
      wrapper.setAttribute('data-auto-state','missing');
      wrapper.title = 'Sem retrato automático disponível';
    }
  });
}

function observer(){
  if(autoObserver) return autoObserver;
  if(!('IntersectionObserver' in window)) return null;

  autoObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      autoObserver.unobserve(entry.target);
      loadAutomaticWrapper(entry.target);
    });
  },{rootMargin:'400px 0px'});

  return autoObserver;
}

function observeAutomaticPortraits(root){
  root = root || document;
  var wrappers = [];

  if(root.matches && root.matches('.character-portrait[data-auto-portrait="1"]')) wrappers.push(root);
  if(root.querySelectorAll){
    root.querySelectorAll('.character-portrait[data-auto-portrait="1"]').forEach(function(node){ wrappers.push(node); });
  }

  var io = observer();
  wrappers.forEach(function(wrapper){
    if(wrapper.getAttribute('data-auto-observed') === '1') return;
    wrapper.setAttribute('data-auto-observed','1');
    if(io) io.observe(wrapper);
    else loadAutomaticWrapper(wrapper);
  });
}

function hydratePortraits(root){
  root = root || document;
  if(window.TerraZApp.media) window.TerraZApp.media.hydrate(root);
  observeAutomaticPortraits(root);
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
  get:getMeta,
  renderPortraitHtml:renderPortraitHtml,
  decorateCard:decorateCard,
  hydrate:hydratePortraits,
  refresh:refreshPortraits,
  resolveAutomatic:resolveAutomatic
};

})();