(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/characters.js');

var showToast = core.showToast;
var escapeHtml = core.escapeHtml;

/* ===== FICHAS DE PERSONAGENS ===== */
var baseFichasPersonagens = (window.TerraZData && window.TerraZData.characters) || {};
var characterOverrides = (window.TerraZData && window.TerraZData.characterOverrides) || {};
var fichasPersonagens = {};
var deletedCharacterNames = new Set();

function rebuildFichas(){
  baseFichasPersonagens = (window.TerraZData && window.TerraZData.characters) || baseFichasPersonagens || {};
  characterOverrides = (window.TerraZData && window.TerraZData.characterOverrides) || {};
  fichasPersonagens = {};
  deletedCharacterNames = new Set(
    Object.keys(characterOverrides).filter(function(name){
      return characterOverrides[name] && characterOverrides[name].deleted === true;
    })
  );

  Object.keys(baseFichasPersonagens).forEach(function(name){
    var base = baseFichasPersonagens[name] || {};
    var override = characterOverrides[name] || {};
    if(override.deleted === true) return;
    fichasPersonagens[name] = {
      ...base,
      ...override,
      sections:Array.isArray(override.sections) ? override.sections : base.sections,
      secrets:base.secrets
    };
  });

  Object.keys(characterOverrides).forEach(function(name){
    if(fichasPersonagens[name]) return;
    var override = characterOverrides[name] || {};
    if(override.deleted === true || !override.created) return;
    fichasPersonagens[name] = {
      eyebrow:override.eyebrow || '',
      sections:Array.isArray(override.sections) ? override.sections : [],
      secrets:[],
      created:true,
      card:override.card || {}
    };
  });
}

rebuildFichas();

if(!window.TerraZData || !window.TerraZData.characters){
  console.error('Terra Z: data/characters.js não foi carregado.');
}

function characterAccessMeta(name){
  var taxonomy = (window.TerraZData && window.TerraZData.characterTaxonomy) || {};
  var all = taxonomy.characters && typeof taxonomy.characters === 'object' ? taxonomy.characters : {};
  return all[name] || {};
}

function editorAuthenticated(){
  var backend = window.TerraZApp && window.TerraZApp.backend;
  return !!(backend && backend.isAuthenticated && backend.isAuthenticated());
}

function canViewCharacter(name){
  var meta = characterAccessMeta(name);
  return meta.visibility !== 'private' || editorAuthenticated();
}

function openFichaModal(characterName){
  if(!canViewCharacter(characterName)){
    showToast('Esta ficha é visível apenas para editores autorizados.','warning',4500);
    return;
  }

  var ficha = fichasPersonagens[characterName];
  if(!ficha){ showToast('Ficha não disponível para: ' + characterName, 'warning'); return; }
  var modal = document.getElementById('fichaModal');
  var header = document.getElementById('fichaHeader');
  var body = document.getElementById('fichaBody');
  var portrait = (window.TerraZApp.characterMedia)
    ? window.TerraZApp.characterMedia.renderPortraitHtml(characterName, 'large')
    : '';
  var canUploadPortrait = window.TerraZApp.mediaManager && window.TerraZApp.mediaManager.canUpload();
  var backend = window.TerraZApp && window.TerraZApp.backend;
  var canEditCharacter = !!(backend && backend.isConfigured && backend.isConfigured() && backend.isAuthenticated && backend.isAuthenticated());
  var uploadBtn = canUploadPortrait ? '<button class="fh-link" id="fichaUploadPortraitBtn" title="Enviar imagem própria">🖼️</button>' : '';
  var browsePortraitBtn = canEditCharacter ? '<button class="fh-link" id="fichaBrowsePortraitBtn" title="Escolher versão ou imagem na DC Database">🎴</button>' : '';
  var editBtn = canEditCharacter ? '<button class="fh-link" id="fichaEditCharacterBtn" title="Editar personagem">✏️</button>' : '';
  header.innerHTML = portrait + '<div class="fh-info"><div class="fh-eyebrow">' + escapeHtml(ficha.eyebrow) + '</div><h2>' + escapeHtml(characterName) + '</h2></div><div class="fh-actions">' + editBtn + browsePortraitBtn + uploadBtn + '<button class="fh-link" id="fichaCopyLinkBtn" title="Copiar link direto">🔗</button><button class="fh-close" id="fichaCloseBtn">✕</button></div>';
  var bodyHtml = '';
  var privateSecrets = (window.TerraZApp.privateContent && window.TerraZApp.privateContent.getCharacterSecrets)
    ? window.TerraZApp.privateContent.getCharacterSecrets(characterName)
    : null;
  var secrets = Array.isArray(privateSecrets) ? privateSecrets : ficha.secrets;
  ficha.sections.forEach(function(sec){
    bodyHtml += '<div class="ficha-section"><h3>' + sec.title + '</h3>' + sec.content + '</div>';
  });
  if(secrets && secrets.length > 0){
    bodyHtml += '<div class="ficha-secrets" id="fichaSecretsBox" data-visibility="master"><button class="ficha-secrets-toggle" id="fichaSecretsToggle"><span>🔒 Mostrar Segredos (' + secrets.length + ')</span><span class="arrow">▶</span></button><div class="ficha-secrets-content"><ul>';
    secrets.forEach(function(s){ bodyHtml += '<li>' + escapeHtml(s) + '</li>'; });
    bodyHtml += '</ul></div></div>';
  }
  bodyHtml += '<div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid var(--line2)"><button id="fichaSearchBtn" style="background:var(--accent);color:#fff;border:none;padding:10px 22px;border-radius:20px;font-family:\'Share Tech Mono\',monospace;font-size:11px;letter-spacing:1px;cursor:pointer;text-transform:uppercase">🔍 Buscar na DC Wiki</button></div>';
  body.innerHTML = bodyHtml;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  if(window.TerraZApp.characterMedia) window.TerraZApp.characterMedia.hydrate(header);
  if(window.TerraZApp.visibility) window.TerraZApp.visibility.apply();

  function openPortraitLightbox(target){
    var wrapper = target && target.closest ? target.closest('.character-portrait.large[data-portrait-zoom]') : null;
    if(!wrapper) return false;
    var img = wrapper.querySelector('img');
    if(!img) return false;

    var src = img.getAttribute('data-full-src') || img.currentSrc || img.src || img.getAttribute('data-src');
    var nav = window.TerraZApp && window.TerraZApp.navigation;
    if(nav && nav.openLightbox) nav.openLightbox(src,img.alt || characterName);
    else if(window.openLightbox) window.openLightbox(src,img.alt || characterName);
    return true;
  }

  header.onclick = function(event){
    if(openPortraitLightbox(event.target)){
      event.preventDefault();
      event.stopPropagation();
    }
  };

  header.onkeydown = function(event){
    if(event.key !== 'Enter' && event.key !== ' ') return;
    if(openPortraitLightbox(event.target)){
      event.preventDefault();
      event.stopPropagation();
    }
  };
  document.getElementById('fichaCloseBtn').addEventListener('click', closeFichaModal);
  var editCharacterBtn = document.getElementById('fichaEditCharacterBtn');
  if(editCharacterBtn) editCharacterBtn.addEventListener('click', function(){
    if(window.TerraZApp.characterEditor) window.TerraZApp.characterEditor.open(characterName);
  });
  var browsePortraitBtn = document.getElementById('fichaBrowsePortraitBtn');
  if(browsePortraitBtn) browsePortraitBtn.addEventListener('click', function(){
    if(window.TerraZApp.portraitBrowser) window.TerraZApp.portraitBrowser.open(characterName);
  });

  var uploadPortraitBtn = document.getElementById('fichaUploadPortraitBtn');
  if(uploadPortraitBtn) uploadPortraitBtn.addEventListener('click', function(){
    if(window.TerraZApp.mediaManager) window.TerraZApp.mediaManager.choose(characterName);
  });
  var copyBtn = document.getElementById('fichaCopyLinkBtn');
  if(copyBtn) copyBtn.addEventListener('click', function(){
    if(window.TerraZApp.router) window.TerraZApp.router.copyCurrentLink();
  });
  if(window.TerraZApp.router) window.TerraZApp.router.setCharacter(characterName);
  document.getElementById('fichaSearchBtn').addEventListener('click', function(){ window.searchOnFandom(characterName); });
  var secretsToggle = document.getElementById('fichaSecretsToggle');
  if(secretsToggle){
    secretsToggle.addEventListener('click', function(){
      var box = document.getElementById('fichaSecretsBox');
      box.classList.toggle('open');
      var label = secretsToggle.querySelector('span:first-child');
      var isOpen = box.classList.contains('open');
      if(label) label.textContent = (isOpen ? '🔓 Ocultar Segredos' : '🔒 Mostrar Segredos') + ' (' + secrets.length + ')';
    });
  }
}

function closeFichaModal(){
  document.getElementById('fichaModal').classList.remove('show');
  document.body.style.overflow = '';
  if(window.TerraZApp.router) window.TerraZApp.router.clearCharacter();
}


function characterNameFromCard(card){
  var h4 = card && card.querySelector ? card.querySelector('h4') : null;
  if(!h4) return '';

  var title = h4.textContent.replace(/^[^\w]*\s*/,'').trim();
  title = title.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s⭐]+/u,'').trim();

  var match = '';
  Object.keys(fichasPersonagens).some(function(name){
    if(title === name || title.indexOf(name) !== -1 || name.indexOf(title) !== -1){
      match = name;
      return true;
    }
    return false;
  });

  return match;
}

function inferredCardIcon(name,ficha){
  var override = characterOverrides[name] || {};
  if(override.card && override.card.icon) return String(override.card.icon).trim() || '👤';

  var first = String((ficha && ficha.eyebrow) || '').trim().split(/\s+/)[0] || '';
  if(first && first.length <= 12 && /[^A-Za-z0-9]/.test(first)) return first;
  return '👤';
}

function parseCardLines(value){
  var result = {};
  String(value || '').split(/\r?\n/).forEach(function(line){
    var match = String(line || '').trim().match(/^([^:]{1,40}):\s*(.*)$/);
    if(!match) return;
    var key = match[1].trim().toLocaleLowerCase('pt-BR');
    result[key] = match[2].trim();
  });
  return result;
}

function basicFieldsFromFicha(ficha){
  var sections = Array.isArray(ficha && ficha.sections) ? ficha.sections : [];
  var basic = sections.find(function(section){
    return /ficha básica/i.test(String(section && section.title || ''));
  }) || sections[0];

  if(!basic || !basic.content) return {};

  var html = String(basic.content)
    .replace(/<br\s*\/?>/gi,'\n')
    .replace(/<\/p>/gi,'\n')
    .replace(/<\/li>/gi,'\n');

  var temp = document.createElement('div');
  temp.innerHTML = html;

  return parseCardLines(temp.textContent || '');
}

function taxonomyStatusLabel(name){
  var taxonomy = (window.TerraZData && window.TerraZData.characterTaxonomy) || {};
  var meta = taxonomy.characters && taxonomy.characters[name] || {};
  var statusId = String(meta.status || '');
  var defs = Array.isArray(taxonomy.statuses) ? taxonomy.statuses : [];
  var found = defs.find(function(item){ return String(item && item.id || '') === statusId; });
  return found ? String(found.label || '') : '';
}

function structuredCardData(name,ficha){
  var override = characterOverrides[name] || {};
  var card = override.card && typeof override.card === 'object' ? override.card : {};
  var basic = basicFieldsFromFicha(ficha);
  var legacy = parseCardLines(card.summary || '');

  function pick(){
    for(var i=0;i<arguments.length;i++){
      var value = String(arguments[i] == null ? '' : arguments[i]).trim();
      if(value) return value;
    }
    return '—';
  }

  return {
    icon:pick(card.icon,inferredCardIcon(name,ficha),'👤'),
    codename:pick(card.codename,legacy['codinome'],basic['codinome']),
    age:pick(card.age,legacy['idade'],basic['idade']),
    origin:pick(card.origin,legacy['origem'],basic['origem'],basic['espécie']),
    status:pick(card.status,legacy['status'],basic['status'],taxonomyStatusLabel(name))
  };
}

function inferredCardSummary(name,ficha){
  var data = structuredCardData(name,ficha);
  return [
    'Codinome: ' + data.codename,
    'Idade: ' + data.age,
    'Origem: ' + data.origin,
    'Status: ' + data.status
  ].join('\n');
}

function applyStandardCard(card,name){
  if(!card || !name) return;

  var ficha = fichasPersonagens[name] || {};
  var data = structuredCardData(name,ficha);
  var h4 = card.querySelector('h4');
  var p = card.querySelector('p');

  if(!h4){
    h4 = document.createElement('h4');
    card.insertBefore(h4,card.firstChild || null);
  }
  h4.textContent = data.icon + ' ' + name;

  if(!p){
    p = document.createElement('p');
    card.appendChild(p);
  }

  p.innerHTML = '';
  [
    ['Codinome',data.codename],
    ['Idade',data.age],
    ['Origem',data.origin],
    ['Status',data.status]
  ].forEach(function(row,index){
    if(index) p.appendChild(document.createElement('br'));
    var strong = document.createElement('strong');
    strong.textContent = row[0] + ': ';
    p.appendChild(strong);
    p.appendChild(document.createTextNode(row[1]));
  });

  card.setAttribute('data-card-standard','1');
}

function standardizeCharacterCards(){
  var grid = document.querySelector('#sub-tz-personagens .card-grid');
  if(!grid) return;

  Array.from(grid.querySelectorAll('.card')).forEach(function(card){
    var name = characterNameFromCard(card) || card.getAttribute('data-generated-character') || '';
    if(name && fichasPersonagens[name]) applyStandardCard(card,name);
  });
}

function renderMissingCharacterCards(){
  var grid = document.querySelector('#sub-tz-personagens .card-grid');
  if(!grid) return;

  grid.querySelectorAll('.character-generated-card').forEach(function(card){ card.remove(); });

  Array.from(grid.querySelectorAll('.card')).forEach(function(card){
    var h4 = card.querySelector('h4');
    if(!h4) return;

    var title = h4.textContent.replace(/^[^\w]*\s*/,'').trim();
    title = title.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s⭐]+/u,'').trim();

    var deleted = Array.from(deletedCharacterNames).some(function(name){
      return title === name || title.indexOf(name) !== -1 || name.indexOf(title) !== -1;
    });

    if(deleted) card.remove();
  });

  var represented = new Set();
  Array.from(grid.querySelectorAll('.card')).forEach(function(card){
    var name = characterNameFromCard(card);
    if(name) represented.add(name);
  });

  Object.keys(fichasPersonagens).forEach(function(name){
    if(represented.has(name)) return;

    var ficha = fichasPersonagens[name] || {};
    var cardData = structuredCardData(name,ficha);
    var icon = cardData.icon;
    var summary = inferredCardSummary(name,ficha);

    var wrapper = document.createElement('div');
    wrapper.className = 'card character-generated-card';
    wrapper.setAttribute('data-generated-character',name);

    var h4 = document.createElement('h4');
    h4.textContent = icon + ' ' + name;

    var p = document.createElement('p');
    summary.split(/\r?\n/).forEach(function(line,index){
      if(index) p.appendChild(document.createElement('br'));
      p.appendChild(document.createTextNode(line));
    });

    wrapper.appendChild(h4);
    wrapper.appendChild(p);
    grid.appendChild(wrapper);
    represented.add(name);
  });
}

function attachFichaHandlers(){
  document.querySelectorAll('#sub-tz-personagens .card-grid .card').forEach(function(card){
    if(card.getAttribute('data-ficha-bound') === '1') return;
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
      card.setAttribute('data-ficha-bound','1');
      if(window.TerraZApp.characterMedia) window.TerraZApp.characterMedia.decorateCard(card, match);
      card.setAttribute('title', 'Clique para ver a ficha completa');
      card.addEventListener('click', function(e){
        if(e.target.classList.contains('fav-btn')) return;
        openFichaModal(match);
      });
    } else {
      card.setAttribute('data-ficha-bound','1');
      card.setAttribute('data-fandom', title);
      card.addEventListener('click', function(e){
        if(e.target.classList.contains('fav-btn')) return;
        window.searchOnFandom(title);
      });
    }
  });
}



function refreshCharactersFromRuntime(){
  rebuildFichas();
  renderMissingCharacterCards();
  standardizeCharacterCards();
  attachFichaHandlers();

  document.dispatchEvent(new CustomEvent('terra-z:characters-rendered'));
}

document.addEventListener('terra-z:runtime-data-loaded',refreshCharactersFromRuntime);

refreshCharactersFromRuntime();

window.openFichaModal = openFichaModal;
window.closeFichaModal = closeFichaModal;

window.TerraZApp.characters = {
  open: openFichaModal,
  close: closeFichaModal,
  attach: attachFichaHandlers,
  get:function(name){ return fichasPersonagens[name] || null; },
  names:function(){ return Object.keys(fichasPersonagens); },
  isCreated:function(name){ return !!(characterOverrides[name] && characterOverrides[name].created); },
  isDeleted:function(name){ return deletedCharacterNames.has(name); },
  card:function(name){ return (characterOverrides[name] && characterOverrides[name].card) || null; },
  cardData:function(name){ return structuredCardData(name,fichasPersonagens[name] || {}); },
  canView:canViewCharacter,
  refresh:refreshCharactersFromRuntime
};

})();
