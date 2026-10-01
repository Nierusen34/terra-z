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
var autoResolvedKeys = Object.create(null);
var autoPending = Object.create(null);
var autoPendingKeys = Object.create(null);
var autoObserver = null;

function initials(name){
  var parts = String(name || '').replace(/[’']/g, '').split(/\s+/).filter(Boolean);
  if(parts.length === 0) return '?';
  if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

function automaticConfig(item){
  var auto = item && item.auto;
  if(!auto) return null;
  if(auto.provider === 'dc-fandom' && auto.wikiTitle) return auto;
  if(auto.provider === 'external-url' && auto.imageUrl) return auto;
  return null;
}

function automaticSourceLabel(config){
  if(!config) return '';
  if(config.provider === 'external-url') return config.sourceLabel || 'Fonte externa';
  return 'DC Database · Fandom';
}

function automaticTitle(config){
  if(!config) return '';
  if(config.provider === 'external-url') return 'Retrato automático · ' + automaticSourceLabel(config);
  return 'Retrato automático · DC Database (Fandom)';
}

function getMeta(name){
  var item = media[name] || {};
  var resolved = autoResolved[name] || null;
  var runtime = window.TerraZApp && window.TerraZApp.runtimeData;
  var localSrc = item.src && runtime && runtime.mediaUrl ? runtime.mediaUrl(item.src) : item.src;
  return {
    src: localSrc || (resolved && resolved.imageUrl) || '',
    fullImageUrl: localSrc || (resolved && (resolved.fullImageUrl || resolved.imageUrl)) || '',
    alt: item.alt || name,
    source: item.src ? (item.source || 'local') : (resolved ? resolved.provider : (automaticConfig(item) ? 'auto' : (item.source || ''))),
    credit: item.credit || (resolved && resolved.source) || '',
    pageUrl: (resolved && resolved.pageUrl) || '',
    automatic: !item.src && !!automaticConfig(item)
  };
}

function cacheKey(name,config){
  var sourceKey = config.wikiTitle || config.imageUrl || config.provider || '';
  return AUTO_CACHE_PREFIX + encodeURIComponent(name) + ':' + encodeURIComponent(sourceKey);
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
    fullImageUrl:(page.original && page.original.source) || imageUrl,
    pageUrl:page.fullurl || ''
  };
}

async function fetchAutomatic(name,config){
  if(config && config.provider === 'external-url'){
    var externalBackend = window.TerraZApp && window.TerraZApp.backend;
    var proxiedUrl = config.imageUrl;

    if(externalBackend &&
       externalBackend.isConfigured &&
       externalBackend.isConfigured() &&
       externalBackend.endpoint){
      proxiedUrl = externalBackend.endpoint('/api/media?external=1&name=' + encodeURIComponent(name));
    }

    return {
      ok:true,
      found:true,
      provider:'external-url',
      source:automaticSourceLabel(config),
      title:config.sourceLabel || name,
      imageUrl:proxiedUrl,
      fullImageUrl:proxiedUrl,
      originalImageUrl:config.imageUrl,
      fallbackWikiTitle:config.fallbackWikiTitle || '',
      pageUrl:config.pageUrl || ''
    };
  }

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

  var expectedKey = cacheKey(name,config);

  if(autoResolved[name] && autoResolvedKeys[name] === expectedKey){
    return Promise.resolve(autoResolved[name]);
  }

  if(autoResolvedKeys[name] !== expectedKey){
    delete autoResolved[name];
    delete autoResolvedKeys[name];
  }

  if(autoPending[name] && autoPendingKeys[name] === expectedKey){
    return autoPending[name];
  }

  if(autoPendingKeys[name] !== expectedKey){
    delete autoPending[name];
    delete autoPendingKeys[name];
  }

  var cached = readCache(name,config);
  if(cached){
    if(cached.found && cached.imageUrl){
      autoResolved[name] = cached;
      autoResolvedKeys[name] = expectedKey;
    }
    return Promise.resolve(cached);
  }

  autoPendingKeys[name] = expectedKey;
  autoPending[name] = fetchAutomatic(name,config)
    .then(function(result){
      var normalized = result && result.found && result.imageUrl
        ? {
            found:true,
            provider:result.provider || config.provider || 'dc-fandom',
            source:result.source || automaticSourceLabel(config),
            title:result.title || config.wikiTitle || config.sourceLabel || name,
            imageUrl:result.imageUrl,
            fullImageUrl:result.fullImageUrl || result.imageUrl,
            originalImageUrl:result.originalImageUrl || config.imageUrl || '',
            fallbackWikiTitle:result.fallbackWikiTitle || config.fallbackWikiTitle || '',
            pageUrl:result.pageUrl || config.pageUrl || ''
          }
        : {found:false,provider:'dc-fandom'};

      writeCache(name,config,normalized);
      if(normalized.found){
        autoResolved[name] = normalized;
        autoResolvedKeys[name] = expectedKey;
      }
      return normalized;
    })
    .catch(function(error){
      console.warn('Terra Z: retrato automático indisponível para',name,error);
      return {found:false,provider:'dc-fandom'};
    })
    .finally(function(){
      if(autoPendingKeys[name] === expectedKey){
        delete autoPending[name];
        delete autoPendingKeys[name];
      }
    });

  return autoPending[name];
}

function renderPortraitHtml(name, size){
  var meta = getMeta(name);
  var item = media[name] || {};
  var auto = automaticConfig(item);
  var cls = 'character-portrait ' + (size === 'large' ? 'large' : 'small');

  if(meta.src){
    var src = meta.src;
    var sourceClass = meta.automatic ? ' auto-source' : '';
    var zoomAttrs = size === 'large'
      ? ' data-portrait-zoom="1" role="button" tabindex="0" aria-label="Abrir retrato de ' + escapeAttr(name) + ' em tamanho maior"'
      : '';
    var title = size === 'large'
      ? ' title="Clique para ampliar o retrato"'
      : (meta.automatic ? ' title="' + escapeAttr(automaticTitle(auto)) + '"' : '');
    return '<div class="' + cls + sourceClass + '" data-character="' + escapeAttr(name) + '"' + zoomAttrs + title + '>' +
      '<img data-src="' + escapeAttr(src) + '" data-full-src="' + escapeAttr(meta.fullImageUrl || src) + '" alt="' + escapeAttr(meta.alt) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">' +
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
    var item = media[name] || {};
    next.title = size === 'large'
      ? 'Clique para ampliar o retrato'
      : automaticTitle(automaticConfig(item));
    wrapper.replaceWith(next);
    bindPortraitErrorFallbacks(next);
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

function replaceWithPortraitPlaceholder(wrapper,name,size){
  if(!wrapper || !wrapper.isConnected) return;

  var holder=document.createElement('div');
  holder.innerHTML =
    '<div class="character-portrait ' + (size === 'large' ? 'large' : 'small') +
    ' placeholder portrait-load-failed" data-character="' + escapeAttr(name) +
    '" aria-label="Retrato temporariamente indisponível para ' + escapeAttr(name) + '">' +
    '<span>' + escapeHtml(initials(name)) + '</span></div>';

  var next=holder.firstElementChild;
  if(next){
    next.title='Retrato temporariamente indisponível';
    wrapper.replaceWith(next);
  }
}

function loadPortraitFallback(wrapper,img){
  if(!wrapper || !img || img.getAttribute('data-fallback-running') === '1') return;

  var name=wrapper.getAttribute('data-character') || '';
  var item=media[name] || {};
  var config=automaticConfig(item);
  var size=wrapper.classList.contains('large') ? 'large' : 'small';

  if(!name || !config || config.provider !== 'external-url'){
    replaceWithPortraitPlaceholder(wrapper,name,size);
    return;
  }

  var original=config.imageUrl || '';
  var current=img.currentSrc || img.src || img.getAttribute('data-src') || '';

  if(original && current !== original && img.getAttribute('data-original-retried') !== '1'){
    img.setAttribute('data-original-retried','1');
    img.setAttribute('data-fallback-running','1');
    img.src=original;
    img.setAttribute('data-full-src',original);
    window.setTimeout(function(){ img.removeAttribute('data-fallback-running'); },0);
    return;
  }

  var fallbackTitle=config.fallbackWikiTitle || '';
  if(!fallbackTitle){
    replaceWithPortraitPlaceholder(wrapper,name,size);
    return;
  }

  img.setAttribute('data-fallback-running','1');

  directFandom({wikiTitle:fallbackTitle}).then(function(result){
    if(!wrapper.isConnected) return;

    if(result && result.found && result.imageUrl){
      img.src=result.imageUrl;
      img.setAttribute('data-src',result.imageUrl);
      img.setAttribute('data-full-src',result.fullImageUrl || result.imageUrl);
      img.setAttribute('data-fallback-source','dc-fandom');
      img.removeAttribute('data-fallback-running');
      wrapper.classList.add('portrait-fallback-source');
      wrapper.title=size === 'large'
        ? 'Clique para ampliar o retrato'
        : 'Fonte externa indisponível · fallback DC Database';
      return;
    }

    replaceWithPortraitPlaceholder(wrapper,name,size);
  }).catch(function(){
    replaceWithPortraitPlaceholder(wrapper,name,size);
  });
}

function bindPortraitErrorFallbacks(root){
  root=root || document;
  var images=[];

  if(root.matches && root.matches('img') && root.closest && root.closest('.character-portrait.auto-source')) images.push(root);
  if(root.querySelectorAll){
    root.querySelectorAll('.character-portrait.auto-source img').forEach(function(img){ images.push(img); });
  }

  images.forEach(function(img){
    if(img.getAttribute('data-portrait-error-bound') === '1') return;
    img.setAttribute('data-portrait-error-bound','1');
    img.addEventListener('error',function(){
      var wrapper=img.closest('.character-portrait');
      if(wrapper) loadPortraitFallback(wrapper,img);
    });
  });
}

function hydratePortraits(root){
  root = root || document;
  bindPortraitErrorFallbacks(root);
  if(window.TerraZApp.media) window.TerraZApp.media.hydrate(root);
  observeAutomaticPortraits(root);
}

function clearAutomaticCache(name){
  var prefix = AUTO_CACHE_PREFIX + encodeURIComponent(name) + ':';
  try{
    for(var i=localStorage.length-1;i>=0;i--){
      var key = localStorage.key(i);
      if(key && key.indexOf(prefix) === 0) localStorage.removeItem(key);
    }
  }catch(e){}
  delete autoResolved[name];
  delete autoResolvedKeys[name];
  delete autoPending[name];
  delete autoPendingKeys[name];
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
  resolveAutomatic:resolveAutomatic,
  clearAutomaticCache:clearAutomaticCache
};

})();