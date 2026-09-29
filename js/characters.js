(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/characters.js');

var showToast = core.showToast;
var escapeHtml = core.escapeHtml;

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
  var portrait = (window.TerraZApp.characterMedia)
    ? window.TerraZApp.characterMedia.renderPortraitHtml(characterName, 'large')
    : '';
  var canUploadPortrait = window.TerraZApp.mediaManager && window.TerraZApp.mediaManager.canUpload();
  var uploadBtn = canUploadPortrait ? '<button class="fh-link" id="fichaUploadPortraitBtn" title="Atualizar retrato">🖼️</button>' : '';
  header.innerHTML = portrait + '<div class="fh-info"><div class="fh-eyebrow">' + escapeHtml(ficha.eyebrow) + '</div><h2>' + escapeHtml(characterName) + '</h2></div><div class="fh-actions">' + uploadBtn + '<button class="fh-link" id="fichaCopyLinkBtn" title="Copiar link direto">🔗</button><button class="fh-close" id="fichaCloseBtn">✕</button></div>';
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



attachFichaHandlers();

window.openFichaModal = openFichaModal;
window.closeFichaModal = closeFichaModal;

window.TerraZApp.characters = {
  open: openFichaModal,
  close: closeFichaModal,
  attach: attachFichaHandlers
};

})();
