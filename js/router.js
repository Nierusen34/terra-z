(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

function slugify(value){
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseHash(){
  var raw = location.hash.replace(/^#/, '');
  return new URLSearchParams(raw);
}

function writeHash(params, push){
  var hash = params.toString();
  var url = location.pathname + location.search + (hash ? '#' + hash : '');
  if(push) history.pushState(null, '', url);
  else history.replaceState(null, '', url);
}

function navigate(tab, sub){
  if(tab){
    var tabBtn = document.querySelector('.tab-btn[data-tab="' + CSS.escape(tab) + '"]');
    if(tabBtn && !tabBtn.classList.contains('active')) tabBtn.click();
  }
  if(sub){
    var subBtn = document.querySelector('.sidebar-item[data-sub="' + CSS.escape(sub) + '"]');
    if(subBtn && !subBtn.classList.contains('active')) subBtn.click();
  }
}

function findCharacterBySlug(slug){
  var data = (window.TerraZData && window.TerraZData.characters) || {};
  return Object.keys(data).find(function(name){ return slugify(name) === slug; }) || null;
}

function applyHash(){
  var params = parseHash();
  var characterSlug = params.get('personagem');
  var district = params.get('distrito');
  var tab = params.get('secao');
  var sub = params.get('sub');

  if(characterSlug){
    navigate('tab-terraz', 'sub-tz-personagens');
    var name = findCharacterBySlug(characterSlug);
    if(name && window.TerraZApp.characters){
      setTimeout(function(){ window.TerraZApp.characters.open(name, {fromRouter:true}); }, 0);
    }
    return;
  }

  if(district){
    navigate('tab-city', 'sub-distritos');
    setTimeout(function(){
      if(window.TerraZApp.mapExplorer) window.TerraZApp.mapExplorer.focus(district);
    }, 0);
    return;
  }

  if(tab || sub) navigate(tab, sub);
}

function setSection(tab, sub){
  var params = parseHash();
  params.delete('personagem');
  if(tab) params.set('secao', tab); else params.delete('secao');
  if(sub) params.set('sub', sub); else params.delete('sub');
  writeHash(params, false);
}

function setCharacter(name){
  var params = parseHash();
  params.set('secao', 'tab-terraz');
  params.set('sub', 'sub-tz-personagens');
  params.set('personagem', slugify(name));
  writeHash(params, false);
}

function clearCharacter(){
  var params = parseHash();
  params.delete('personagem');
  if(!params.get('secao')) params.set('secao', 'tab-terraz');
  if(!params.get('sub')) params.set('sub', 'sub-tz-personagens');
  writeHash(params, false);
}

function setDistrict(id){
  var params = parseHash();
  params.delete('personagem');
  params.set('secao', 'tab-city');
  params.set('sub', 'sub-distritos');
  params.set('distrito', id);
  writeHash(params, false);
  navigate('tab-city', 'sub-distritos');
  setTimeout(function(){
    if(window.TerraZApp.mapExplorer) window.TerraZApp.mapExplorer.focus(id);
  }, 0);
}

async function copyCurrentLink(){
  try {
    await navigator.clipboard.writeText(location.href);
    window.TerraZCore.showToast('Link copiado para a área de transferência', 'success', 2500);
  } catch(e){
    var input = document.createElement('input');
    input.value = location.href;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
    window.TerraZCore.showToast('Link copiado', 'success', 2500);
  }
}

document.querySelectorAll('.tab-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    setSection(btn.getAttribute('data-tab'), null);
  });
});

document.querySelectorAll('.sidebar-item').forEach(function(btn){
  btn.addEventListener('click', function(){
    var parent = btn.closest('.tab-content');
    setSection(parent ? parent.id : null, btn.getAttribute('data-sub'));
  });
});

window.addEventListener('hashchange', applyHash);

window.TerraZApp.router = {
  slugify: slugify,
  applyHash: applyHash,
  setSection: setSection,
  setCharacter: setCharacter,
  clearCharacter: clearCharacter,
  setDistrict: setDistrict,
  copyCurrentLink: copyCurrentLink
};

setTimeout(applyHash, 0);

})();
