(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var root = document.getElementById('sub-tz-personagens');
var input = document.getElementById('characterFilter');
var select = document.getElementById('characterViewFilter');
var countEl = document.getElementById('characterCount');

function getCards(){
  return root ? Array.from(root.querySelectorAll('.card-grid .card')) : [];
}

function normalize(value){
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function matchesMode(card, mode){
  if(mode === 'favorites') return card.classList.contains('is-favorite');
  if(mode === 'with-image') return !!card.querySelector('.character-portrait img');
  if(mode === 'without-image') return !!card.querySelector('.character-portrait.placeholder');
  return true;
}

function apply(){
  var term = normalize(input ? input.value : '').trim();
  var mode = select ? select.value : 'all';
  var visible = 0;

  getCards().forEach(function(card){
    var text = normalize(card.textContent);
    var show = (!term || text.includes(term)) && matchesMode(card, mode);
    card.hidden = !show;
    if(show) visible++;
  });

  if(countEl) countEl.textContent = visible + (visible === 1 ? ' personagem' : ' personagens');
}

if(input) input.addEventListener('input', apply);
if(select) select.addEventListener('change', apply);
document.addEventListener('terraz:favoriteschange', apply);

window.TerraZApp.characterFilters = { apply: apply };
apply();

})();
