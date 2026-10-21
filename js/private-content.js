(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var cache = null;
var appliedSnapshots = Object.create(null);

function backend(){ return window.TerraZApp && window.TerraZApp.backend; }

function clone(value){
  if(value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function ensureRuntimeContainers(){
  window.TerraZData = window.TerraZData || {};
  window.TerraZData.characterOverrides = window.TerraZData.characterOverrides || {};
  window.TerraZData.characterTaxonomy = window.TerraZData.characterTaxonomy || {nuclei:[],types:[],statuses:[],characters:{}};
  window.TerraZData.characterTaxonomy.characters = window.TerraZData.characterTaxonomy.characters || {};
  window.TerraZData.characterMedia = window.TerraZData.characterMedia || {};
}

function restorePrivateProfiles(silent){
  ensureRuntimeContainers();

  Object.keys(appliedSnapshots).forEach(function(name){
    var snapshot=appliedSnapshots[name];

    if(snapshot.overrideHad) window.TerraZData.characterOverrides[name]=snapshot.override;
    else delete window.TerraZData.characterOverrides[name];

    if(snapshot.metaHad) window.TerraZData.characterTaxonomy.characters[name]=snapshot.meta;
    else delete window.TerraZData.characterTaxonomy.characters[name];

    if(snapshot.mediaHad) window.TerraZData.characterMedia[name]=snapshot.media;
    else delete window.TerraZData.characterMedia[name];
  });

  appliedSnapshots=Object.create(null);

  if(!silent){
    document.dispatchEvent(new CustomEvent('terra-z:private-profiles-changed',{
      detail:{names:[],cleared:true}
    }));
  }
}

function applyPrivateProfiles(options){
  options=options || {};

  if(options.freshBase){
    // runtime-data acabou de substituir os contêineres públicos pela versão
    // canônica mais recente. Snapshots anteriores pertencem à base antiga e
    // não podem ser restaurados por cima dela.
    appliedSnapshots=Object.create(null);
  }else{
    restorePrivateProfiles(true);
  }

  ensureRuntimeContainers();

  var characters=cache && cache.characters && typeof cache.characters === 'object'
    ? cache.characters
    : {};
  var applied=[];

  Object.keys(characters).forEach(function(name){
    var entry=characters[name] || {};
    var profile=entry.profile && typeof entry.profile === 'object' ? entry.profile : null;
    var masterSections=Array.isArray(entry.masterSections) ? clone(entry.masterSections) : [];
    if(!profile && !masterSections.length) return;

    appliedSnapshots[name]={
      overrideHad:Object.prototype.hasOwnProperty.call(window.TerraZData.characterOverrides,name),
      override:clone(window.TerraZData.characterOverrides[name]),
      metaHad:Object.prototype.hasOwnProperty.call(window.TerraZData.characterTaxonomy.characters,name),
      meta:clone(window.TerraZData.characterTaxonomy.characters[name]),
      mediaHad:Object.prototype.hasOwnProperty.call(window.TerraZData.characterMedia,name),
      media:clone(window.TerraZData.characterMedia[name])
    };

    var hasPublicOverride=appliedSnapshots[name].overrideHad &&
      appliedSnapshots[name].override &&
      typeof appliedSnapshots[name].override === 'object';
    var hasPublicMeta=appliedSnapshots[name].metaHad &&
      appliedSnapshots[name].meta &&
      typeof appliedSnapshots[name].meta === 'object';
    var publicCharacterCollision=!!(profile && hasPublicOverride && hasPublicMeta);

    if(profile && !publicCharacterCollision){
      // Personagem realmente privado: não existe uma ficha pública canônica com
      // o mesmo nome, então o perfil autenticado continua sendo Mestre.
      window.TerraZData.characterOverrides[name]={
        eyebrow:String(profile.eyebrow || ''),
        sections:Array.isArray(profile.sections) ? clone(profile.sections) : [],
        card:profile.card && typeof profile.card === 'object' ? clone(profile.card) : {},
        created:true,
        privateRuntime:true
      };

      window.TerraZData.characterTaxonomy.characters[name]={
        ...(profile.meta && typeof profile.meta === 'object' ? clone(profile.meta) : {}),
        visibility:'master'
      };

      var profileMedia=profile.media && typeof profile.media === 'object'
        ? clone(profile.media)
        : {src:'',alt:name,source:'local',credit:''};

      if(profile.privatePortrait && profile.privatePortrait.mime && profile.privatePortrait.dataBase64){
        profileMedia.src='data:' + profile.privatePortrait.mime + ';base64,' + profile.privatePortrait.dataBase64;
        profileMedia.source='private';
      }

      window.TerraZData.characterMedia[name]=profileMedia;
    }else{
      // A ficha pública é canônica. Um profile antigo no cofre com o mesmo nome
      // não pode transformar o personagem inteiro em Mestre (caso Camila Vargas).
      // Conteúdo privado legado continua disponível apenas como seções Mestre.
      var publicOverride=window.TerraZData.characterOverrides[name];
      if(publicOverride && typeof publicOverride === 'object'){
        var publicSections=Array.isArray(publicOverride.sections)
          ? clone(publicOverride.sections).filter(function(section){
              return !section || section.visibility !== 'master';
            })
          : [];

        var privateRows=[];
        if(publicCharacterCollision && Array.isArray(profile.sections)){
          privateRows=privateRows.concat(clone(profile.sections));
        }
        privateRows=privateRows.concat(masterSections);

        var seenSections=new Set();
        publicSections.forEach(function(section){
          var item=section && typeof section === 'object' ? section : {};
          seenSections.add(String(item.title || '') + '\n' + String(item.content || ''));
        });

        var privateSections=[];
        privateRows.forEach(function(section){
          var item=section && typeof section === 'object' ? clone(section) : {};
          var signature=String(item.title || '') + '\n' + String(item.content || '');
          if(seenSections.has(signature)) return;
          seenSections.add(signature);

          var title=String(item.title || 'Conteúdo Mestre');
          var titleCollision=publicSections.some(function(publicSection){
            return String(publicSection && publicSection.title || '') === title;
          });
          if(titleCollision && !/^🔒\s/.test(title)) title='🔒 Mestre · ' + title;

          privateSections.push({
            ...item,
            title:title,
            visibility:'master',
            position:publicSections.length + privateSections.length
          });
        });

        var combined=publicSections.map(function(section,index){
          var item=section && typeof section === 'object' ? section : {};
          return {
            ...item,
            visibility:item.visibility === 'spoiler' ? 'spoiler' : 'public',
            position:Number.isFinite(Number(item.position)) ? Number(item.position) : index
          };
        }).concat(privateSections);

        window.TerraZData.characterOverrides[name]={...publicOverride,sections:combined};
      }
    }

    applied.push(name);
  });

  document.dispatchEvent(new CustomEvent('terra-z:private-profiles-changed',{
    detail:{names:applied,cleared:false}
  }));
}

async function load(){
  var b = backend();
  if(!b || !b.isConfigured() || !b.isAuthenticated()) return null;
  if(cache) return cache;

  try {
    var result = await b.request('/api/master',{method:'GET'});
    cache = result.content || {};
    applyPrivateProfiles();
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

function getCharacterProfile(name){
  if(!cache || !cache.characters || !cache.characters[name]) return null;
  var profile=cache.characters[name].profile;
  return profile && typeof profile === 'object' ? profile : null;
}

function getCharacterMasterSections(name){
  if(!cache || !cache.characters || !cache.characters[name]) return [];
  return Array.isArray(cache.characters[name].masterSections)
    ? clone(cache.characters[name].masterSections)
    : [];
}

function setCharacterMasterSections(name,sections){
  if(!cache) cache={};
  if(!cache.characters || typeof cache.characters !== 'object') cache.characters={};
  cache.characters[name]=cache.characters[name] || {};
  cache.characters[name].masterSections=Array.isArray(sections) ? clone(sections) : [];
  applyPrivateProfiles();
}

function getPrivateCharacterNames(){
  if(!cache || !cache.characters) return [];
  return Object.keys(cache.characters).filter(function(name){
    return !!getCharacterProfile(name);
  });
}

function getPrivateGraph(){
  if(!cache || !cache.graph || typeof cache.graph !== 'object') return {nodes:[],edges:[]};
  return {
    nodes:Array.isArray(cache.graph.nodes) ? clone(cache.graph.nodes) : [],
    edges:Array.isArray(cache.graph.edges) ? clone(cache.graph.edges) : []
  };
}


function emptyMasterState(){
  return {
    version:1,
    notes:[],
    revelations:[],
    goals:[],
    clues:[],
    npcStates:[],
    timelineEvents:[]
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
  restorePrivateProfiles(false);
  cache = null;
  document.dispatchEvent(new CustomEvent('terra-z:private-content-cleared'));
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


function removeCharacter(name){
  if(!cache || !cache.characters || typeof cache.characters !== 'object') return;
  delete cache.characters[name];
  document.dispatchEvent(new CustomEvent('terra-z:private-content-loaded'));
}

document.addEventListener('terra-z:auth-changed',function(){
  clear();
  load();
});

document.addEventListener('terra-z:runtime-data-loaded',function(){
  if(cache) applyPrivateProfiles({freshBase:true});
});

if(backend() && backend().isAuthenticated()) load();

window.TerraZApp.privateContent = {
  load:load,
  clear:clear,
  reload:reload,
  setCharacterSecrets:setCharacterSecrets,
  removeCharacter:removeCharacter,
  getCharacterSecrets:getCharacterSecrets,
  getCharacterProfile:getCharacterProfile,
  getCharacterMasterSections:getCharacterMasterSections,
  setCharacterMasterSections:setCharacterMasterSections,
  getPrivateCharacterNames:getPrivateCharacterNames,
  getPrivateGraph:getPrivateGraph,
  getMasterState:getMasterState,
  setMasterState:setMasterState,
  isLoaded:function(){ return !!cache; }
};

})();