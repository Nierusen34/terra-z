(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

function sourceCards(){
  return Array.from(document.querySelectorAll('#sub-tz-personagens .card[data-ficha]'));
}

function sourceCardFor(name){
  return sourceCards().find(function(card){
    return card.getAttribute('data-ficha') === name;
  }) || null;
}

function currentTaxonomy(){
  return (window.TerraZData && window.TerraZData.characterTaxonomy) || {characters:{}};
}

function isEligible(name, meta){
  if(!name || !meta || meta.type !== 'protagonist') return false;

  // A ficha continua histórica na página de Personagens, mas um protagonista morto
  // sai automaticamente da seleção viva da Capa.
  if(meta.status === 'dead') return false;

  var characters = window.TerraZApp && window.TerraZApp.characters;
  if(!characters || !characters.get || !characters.get(name)) return false;
  if(characters.isDeleted && characters.isDeleted(name)) return false;

  return true;
}

function navigateToCharacters(name){
  var universeTab = document.querySelector('.tab-btn[data-tab="tab-terraz"]');
  if(universeTab) universeTab.click();

  var charactersSub = document.querySelector('#tab-terraz .sidebar-item[data-sub="sub-tz-personagens"]');
  if(charactersSub) charactersSub.click();

  window.setTimeout(function(){
    if(!name) return;

    var source = sourceCardFor(name);
    if(source && source.scrollIntoView){
      source.scrollIntoView({block:'center',behavior:'auto'});
    }

    var characters = window.TerraZApp && window.TerraZApp.characters;
    if(characters && characters.open) characters.open(name);
  }, 360);
}

function render(){
  var section = document.getElementById('homeProtagonists');
  var grid = document.getElementById('homeProtagonistsGrid');
  if(!section || !grid) return;

  var taxonomy = currentTaxonomy();
  var metaByName = taxonomy.characters || {};
  var cards = sourceCards();
  var protagonists = cards.filter(function(card){
    var name = card.getAttribute('data-ficha');
    return isEligible(name, metaByName[name]);
  });

  grid.innerHTML = '';

  protagonists.forEach(function(source){
    var name = source.getAttribute('data-ficha');
    var clone = source.cloneNode(true);

    clone.classList.add('home-protagonist-card');
    clone.classList.remove('is-favorite');
    clone.removeAttribute('data-ficha-bound');
    clone.setAttribute('data-home-protagonist', name);
    clone.setAttribute('role','button');
    clone.setAttribute('tabindex','0');
    clone.setAttribute('aria-label','Abrir ficha de ' + name);
    clone.setAttribute('title','Abrir ' + name + ' em Personagens');

    clone.querySelectorAll('.fav-btn').forEach(function(button){ button.remove(); });

    var badge = document.createElement('span');
    badge.className = 'home-protagonist-badge';
    badge.textContent = 'Protagonista';
    clone.appendChild(badge);

    function open(){
      navigateToCharacters(name);
    }

    clone.addEventListener('click', open);
    clone.addEventListener('keydown', function(event){
      if(event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        open();
      }
    });

    grid.appendChild(clone);

    if(window.TerraZApp.characterMedia && window.TerraZApp.characterMedia.hydrate){
      window.TerraZApp.characterMedia.hydrate(clone);
    }
  });

  section.hidden = protagonists.length === 0;
}

var allCharactersBtn = document.getElementById('homeAllCharactersBtn');
if(allCharactersBtn){
  allCharactersBtn.addEventListener('click', function(){
    navigateToCharacters('');
  });
}

document.addEventListener('terra-z:characters-rendered',render);
document.addEventListener('terra-z:runtime-data-loaded',function(){
  window.setTimeout(render,0);
});

render();

window.TerraZApp.homeProtagonists = {
  render:render,
  open:navigateToCharacters
};

})();
