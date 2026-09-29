(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var cache = null;

function backend(){ return window.TerraZApp && window.TerraZApp.backend; }

async function load(){
  var b = backend();
  if(!b || !b.isConfigured() || !b.isAuthenticated()) return null;
  if(cache) return cache;

  try {
    var result = await b.request('/api/master',{method:'GET'});
    cache = result.content || {};
    document.dispatchEvent(new CustomEvent('terra-z:private-content-loaded'));
    return cache;
  } catch(err){
    if(err.status !== 503) console.error('Terra Z private content:',err);
    return null;
  }
}

function getCharacterSecrets(name){
  if(!cache || !cache.characters || !cache.characters[name]) return null;
  return cache.characters[name].secrets || null;
}

function clear(){
  cache = null;
}

document.addEventListener('terra-z:auth-changed',function(){
  clear();
  load();
});

if(backend() && backend().isAuthenticated()) load();

window.TerraZApp.privateContent = {
  load:load,
  clear:clear,
  getCharacterSecrets:getCharacterSecrets,
  isLoaded:function(){ return !!cache; }
};

})();