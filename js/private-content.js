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


function emptyMasterState(){
  return {
    version:1,
    notes:[],
    revelations:[],
    goals:[],
    clues:[],
    npcStates:[]
  };
}

function getMasterState(){
  if(!cache || !cache.master) return emptyMasterState();
  return cache.master;
}

function setMasterState(master){
  if(!cache) cache = {};
  cache.master = master || emptyMasterState();
  document.dispatchEvent(new CustomEvent('terra-z:private-content-loaded'));
}

function clear(){
  cache = null;
}


async function reload(){
  clear();
  return load();
}

function setCharacterSecrets(name,secrets){
  if(!cache) cache = {};
  if(!cache.characters || typeof cache.characters !== 'object') cache.characters = {};
  cache.characters[name] = cache.characters[name] || {};
  cache.characters[name].secrets = Array.isArray(secrets) ? secrets.slice() : [];
  document.dispatchEvent(new CustomEvent('terra-z:private-content-loaded'));
}

document.addEventListener('terra-z:auth-changed',function(){
  clear();
  load();
});

if(backend() && backend().isAuthenticated()) load();

window.TerraZApp.privateContent = {
  load:load,
  clear:clear,
  reload:reload,
  setCharacterSecrets:setCharacterSecrets,
  getCharacterSecrets:getCharacterSecrets,
  getMasterState:getMasterState,
  setMasterState:setMasterState,
  isLoaded:function(){ return !!cache; }
};

})();