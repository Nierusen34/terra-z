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

Object.keys(baseFichasPersonagens).forEach(function(name){
  var base = baseFichasPersonagens[name] || {};
  var override = characterOverrides[name] || {};
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
  if(!override.created) return;
  fichasPersonagens[name] = {
    eyebrow:override.eyebrow || '',
    sections:Array.isArray(override.sections) ? override.sections : [],
    secrets:[],
    created:true,
    card:override.card || {}
  };
});

if(!window.TerraZData || !window.TerraZData.characters){
  console.error('Terra Z: data/characters.js não foi carregado.');
}

function openFichaModal(characterName){
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
  var uploadBtn = canUploadPortrait ? '<button class="fh-link" id="fichaUploadPortraitBtn" title="Atualizar retrato">🖼️</button>' : '';
  var editBtn = canEditCharacter ? '<button class="fh-link" id="fichaEditCharacterBtn" title="Editar personagem">✏️</button>' : '';
  header.innerHTML = portrait + '<div class="fh-info"><div class="fh-eyebrow">' + escapeHtml(ficha.eyebrow) + '</div><h2>' + escapeHtml(characterName) + '</h2></div><div class="fh-actions">' + editBtn + uploadBtn + '<button class="fh-link" id="fichaCopyLinkBtn" title="Copiar link direto">🔗</button><button class="fh-close" id="fichaCloseBtn">✕</button></div>';
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
  document.getElementById('fichaCloseBtn').addEventListener('click', closeFichaModal);
  var editCharacterBtn = document.getElementById('fichaEditCharacterBtn');
  if(editCharacterBtn) editCharacterBtn.addEventListener('click', function(){
    if(window.TerraZApp.characterEditor) window.TerraZApp.characterEditor.open(characterName);
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


function renderCreatedCharacterCards(){
  var grid = document.querySelector('#sub-tz-personagens .card-grid');
  if(!grid) return;

  Object.keys(characterOverrides).forEach(function(name){
    var override = characterOverrides[name] || {};
    if(!override.created) return;
    if(grid.querySelector('[data-created-character="' + CSS.escape(name) + '"]')) return;

    var card = override.card || {};
    var icon = String(card.icon || '👤').trim() || '👤';
    var summary = String(card.summary || override.eyebrow || 'Personagem do universo Terra Z').trim();

    var wrapper = document.createElement('div');
    wrapper.className = 'card character-created-card';
    wrapper.setAttribute('data-created-character',name);

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
  });
}

function attachFichaHandlers(){
  document.querySelectorAll('#sub-tz-personagens .card-grid .card').forEach(function(card){
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
      if(window.TerraZApp.characterMedia) window.TerraZApp.characterMedia.decorateCard(card, match);
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



renderCreatedCharacterCards();
attachFichaHandlers();

window.openFichaModal = openFichaModal;
window.closeFichaModal = closeFichaModal;

window.TerraZApp.characters = {
  open: openFichaModal,
  close: closeFichaModal,
  attach: attachFichaHandlers,
  get:function(name){ return fichasPersonagens[name] || null; },
  names:function(){ return Object.keys(fichasPersonagens); },
  isCreated:function(name){ return !!(characterOverrides[name] && characterOverrides[name].created); },
  card:function(name){ return (characterOverrides[name] && characterOverrides[name].card) || null; }
};

})();
