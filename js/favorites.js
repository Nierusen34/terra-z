(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/favorites.js');

var showToast = core.showToast;
var escapeHtml = core.escapeHtml;
var escapeAttr = core.escapeAttr;

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
        if(ficha) window.openFichaModal(ficha);
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



attachFavoriteButtons();
initFavoritesPanel();

window.toggleFavorite = toggleFavorite;
window.showFavoritesPanel = showFavoritesPanel;
window.closeFavoritesPanel = closeFavoritesPanel;

window.TerraZApp.favorites = {
  toggle: toggleFavorite,
  show: showFavoritesPanel,
  close: closeFavoritesPanel,
  refresh: updateAllCardFavorites
};

})();
