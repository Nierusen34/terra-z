(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var root = document.getElementById('sub-tz-personagens');
var input = document.getElementById('characterFilter');
var countEl = document.getElementById('characterCount');
var nucleiRoot = document.getElementById('characterNucleiFilters');
var favoritesBtn = document.getElementById('characterFavoritesToggle');
var moreBtn = document.getElementById('characterMoreFiltersBtn');
var advanced = document.getElementById('characterAdvancedFilters');
var typeSelect = document.getElementById('characterTypeFilter');
var statusSelect = document.getElementById('characterStatusFilter');
var mediaSelect = document.getElementById('characterMediaFilter');
var clearBtn = document.getElementById('characterClearFilters');
var sizeControl = document.getElementById('characterCardSizeControl');
var sizeButtons = sizeControl ? Array.from(sizeControl.querySelectorAll('[data-character-size]')) : [];
var CARD_SIZE_KEY = 'terraZ_character_card_size';
var cardSize = 'standard';
try {
  var savedSize = localStorage.getItem(CARD_SIZE_KEY);
  if(savedSize === 'compact' || savedSize === 'standard' || savedSize === 'large') cardSize = savedSize;
} catch(e){}

var taxonomy = (window.TerraZData && window.TerraZData.characterTaxonomy) || {
  nuclei:[],types:[],statuses:[],characters:{}
};

var activeNucleus = 'all';
var favoritesOnly = false;

function getCards(){
  return root ? Array.from(root.querySelectorAll('.card-grid .card')) : [];
}

function normalize(value){
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function characterName(card){
  var direct = card.getAttribute('data-ficha') || card.getAttribute('data-generated-character') || card.getAttribute('data-created-character');
  if(direct) return direct;

  var h4 = card.querySelector('h4');
  if(!h4) return '';

  var text = h4.textContent.replace(/^[^\w]*\s*/,'').trim();
  text = text.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s⭐]+/u,'').trim();
  return text;
}

function metaFor(name){
  var all = taxonomy.characters && typeof taxonomy.characters === 'object' ? taxonomy.characters : {};
  var meta = all[name] || {};
  return {
    featured:meta.featured === true,
    nuclei:Array.isArray(meta.nuclei) && meta.nuclei.length ? meta.nuclei : ['other'],
    type:meta.type || 'other',
    status:meta.status || 'unknown',
    visibility:meta.visibility === 'private' ? 'private' : 'public'
  };
}

function labelFor(list,id){
  var found = (Array.isArray(list) ? list : []).find(function(item){ return item && item.id === id; });
  return found ? found.label : id;
}

function searchableText(card,name,meta){
  var nucleiLabels = meta.nuclei.map(function(id){ return labelFor(taxonomy.nuclei,id); }).join(' ');
  return normalize([
    name,
    card.textContent,
    nucleiLabels,
    labelFor(taxonomy.types,meta.type),
    labelFor(taxonomy.statuses,meta.status)
  ].join(' '));
}

function matchesNucleus(meta){
  if(activeNucleus === 'all') return true;
  if(activeNucleus === 'featured') return meta.featured === true;
  return meta.nuclei.indexOf(activeNucleus) !== -1;
}

function matchesMedia(card){
  var mode = mediaSelect ? mediaSelect.value : 'all';
  if(mode === 'with-image') return !!card.querySelector('.character-portrait img');
  if(mode === 'without-image') return !!card.querySelector('.character-portrait.placeholder');
  return true;
}

function matchesAdvanced(meta){
  var type = typeSelect ? typeSelect.value : 'all';
  var status = statusSelect ? statusSelect.value : 'all';

  if(type !== 'all' && meta.type !== type) return false;
  if(status !== 'all' && meta.status !== status) return false;
  return true;
}

function renderNuclei(){
  if(!nucleiRoot) return;

  var items = [
    {id:'all',label:'Todos'},
    {id:'featured',label:'Principais'}
  ].concat(Array.isArray(taxonomy.nuclei) ? taxonomy.nuclei : []);

  nucleiRoot.innerHTML = '';

  items.forEach(function(item){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'character-nucleus-chip';
    btn.setAttribute('data-nucleus',item.id);
    btn.setAttribute('aria-pressed',item.id === activeNucleus ? 'true' : 'false');
    btn.textContent = item.label;

    if(item.id === activeNucleus) btn.classList.add('active');

    btn.addEventListener('click',function(){
      activeNucleus = item.id;
      renderNuclei();
      apply();
    });

    nucleiRoot.appendChild(btn);
  });
}

function fillSelect(select,defs){
  if(!select) return;
  var current = select.value || 'all';
  select.innerHTML = '<option value="all">Todos</option>';

  (Array.isArray(defs) ? defs : []).forEach(function(item){
    var option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.label;
    select.appendChild(option);
  });

  if(Array.from(select.options).some(function(option){ return option.value === current; })){
    select.value = current;
  }
}

function refreshActionStates(){
  if(favoritesBtn){
    favoritesBtn.classList.toggle('active',favoritesOnly);
    favoritesBtn.setAttribute('aria-pressed',favoritesOnly ? 'true' : 'false');
  }

  if(moreBtn && advanced){
    var open = !advanced.hidden;
    moreBtn.classList.toggle('active',open);
    moreBtn.setAttribute('aria-expanded',open ? 'true' : 'false');
  }
}

function editorAuthenticated(){
  var backend = window.TerraZApp && window.TerraZApp.backend;
  return !!(backend && backend.isAuthenticated && backend.isAuthenticated());
}
function canView(meta){ return !meta || meta.visibility !== 'private' || editorAuthenticated(); }
function applyCardSize(size,persist){
  if(size !== 'compact' && size !== 'large') size = 'standard';
  cardSize = size;
  if(root) root.setAttribute('data-card-size',size);
  sizeButtons.forEach(function(button){
    var active = button.getAttribute('data-character-size') === size;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',active ? 'true' : 'false');
  });
  if(persist !== false){ try { localStorage.setItem(CARD_SIZE_KEY,size); } catch(e){} }
}
function apply(){
  var term = normalize(input ? input.value : '').trim();
  var visible = 0;

  getCards().forEach(function(card){
    var name = characterName(card);
    var meta = metaFor(name);

    var permitted = canView(meta);
    card.setAttribute('data-character-visibility',meta.visibility);
    card.classList.toggle('character-private-card',meta.visibility === 'private' && editorAuthenticated());
    var show =
      permitted &&
      (!term || searchableText(card,name,meta).includes(term)) &&
      matchesNucleus(meta) &&
      (!favoritesOnly || card.classList.contains('is-favorite')) &&
      matchesAdvanced(meta) &&
      matchesMedia(card);
    card.hidden = !show;
    if(show) visible++;
  });

  if(countEl) countEl.textContent = visible + (visible === 1 ? ' personagem' : ' personagens');
  refreshActionStates();
}

function clearFilters(){
  activeNucleus = 'all';
  favoritesOnly = false;
  if(input) input.value = '';
  if(typeSelect) typeSelect.value = 'all';
  if(statusSelect) statusSelect.value = 'all';
  if(mediaSelect) mediaSelect.value = 'all';
  renderNuclei();
  apply();
}

fillSelect(typeSelect,taxonomy.types);
fillSelect(statusSelect,taxonomy.statuses);
renderNuclei();

applyCardSize(cardSize,false);
sizeButtons.forEach(function(button){
  button.addEventListener('click',function(){ applyCardSize(button.getAttribute('data-character-size'),true); });
});
if(input) input.addEventListener('input',apply);
if(typeSelect) typeSelect.addEventListener('change',apply);
if(statusSelect) statusSelect.addEventListener('change',apply);
if(mediaSelect) mediaSelect.addEventListener('change',apply);

if(favoritesBtn){
  favoritesBtn.addEventListener('click',function(){
    favoritesOnly = !favoritesOnly;
    apply();
  });
}

if(moreBtn && advanced){
  moreBtn.addEventListener('click',function(){
    advanced.hidden = !advanced.hidden;
    refreshActionStates();
  });
}

if(clearBtn) clearBtn.addEventListener('click',clearFilters);

document.addEventListener('terraz:favoriteschange',apply);
document.addEventListener('terra-z:characters-rendered',apply);
function refreshTaxonomy(){
  taxonomy = (window.TerraZData && window.TerraZData.characterTaxonomy) || taxonomy;
  fillSelect(typeSelect,taxonomy.types);
  fillSelect(statusSelect,taxonomy.statuses);

  var available = ['all','featured'].concat(
    (Array.isArray(taxonomy.nuclei) ? taxonomy.nuclei : []).map(function(item){ return item.id; })
  );
  if(available.indexOf(activeNucleus) === -1) activeNucleus = 'all';

  renderNuclei();
  apply();
}

document.addEventListener('terra-z:runtime-data-loaded',refreshTaxonomy);
document.addEventListener('terra-z:private-profiles-changed',refreshTaxonomy);
document.addEventListener('terra-z:private-content-cleared',refreshTaxonomy);
document.addEventListener('terra-z:auth-changed',apply);

window.TerraZApp.characterFilters = {
  apply:apply,
  refreshTaxonomy:refreshTaxonomy,
  clear:clearFilters,
  setCardSize:function(size){ applyCardSize(size,true); },
  getCardSize:function(){ return cardSize; },
  nucleus:function(id){
    activeNucleus = id || 'all';
    renderNuclei();
    apply();
  }
};

apply();

})();