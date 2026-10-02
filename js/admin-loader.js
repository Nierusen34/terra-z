(function(){
"use strict";

window.TerraZApp=window.TerraZApp || {};

var scripts=[
  "js/admin-foundation.js",
  "js/editor.js",
  "js/private-content.js",
  "js/publishing.js",
  "js/master-migration.js",
  "js/media-manager.js",
  "js/media-library.js",
  "js/portrait-browser.js",
  "js/master-workspace.js",
  "js/character-editor.js",
  "js/taxonomy-manager.js",
  "js/session-editor.js",
  "js/timeline-editor.js",
  "js/integrity-checker.js",
  "js/history-manager.js",
  "js/visibility-manager.js",
  "js/admin-panel.js"
];

var promise=null;
var loaded=false;

function loadScript(src){
  return new Promise(function(resolve,reject){
    var existing=document.querySelector('script[data-admin-module="'+src+'"]');
    if(existing){
      if(existing.dataset.loaded==="true") return resolve();
      existing.addEventListener("load",resolve,{once:true});
      existing.addEventListener("error",reject,{once:true});
      return;
    }

    var script=document.createElement("script");
    script.src=src;
    script.defer=false;
    script.async=false;
    script.dataset.adminModule=src;
    script.addEventListener("load",function(){
      script.dataset.loaded="true";
      resolve();
    },{once:true});
    script.addEventListener("error",function(){
      reject(new Error("Falha ao carregar "+src));
    },{once:true});
    document.head.appendChild(script);
  });
}

async function loadAll(){
  if(loaded) return window.TerraZApp;
  if(promise) return promise;

  promise=(async function(){
    document.documentElement.classList.add("admin-loading");
    try{
      for(const src of scripts) await loadScript(src);
      loaded=true;
      document.documentElement.classList.add("admin-loaded");
      document.dispatchEvent(new CustomEvent("terra-z:admin-modules-loaded"));
      return window.TerraZApp;
    }finally{
      document.documentElement.classList.remove("admin-loading");
    }
  })();

  try{
    return await promise;
  }catch(error){
    promise=null;
    console.error("Terra Z admin loader:",error);
    var core=window.TerraZCore;
    if(core && core.showToast) core.showToast("Falha ao carregar as ferramentas administrativas.","error",6500);
    throw error;
  }
}

async function openAdmin(){
  var button=document.getElementById("adminPanelBtn");
  if(button){
    button.disabled=true;
    button.dataset.loading="true";
  }
  try{
    await loadAll();
    if(window.TerraZApp.adminPanel && window.TerraZApp.adminPanel.open){
      window.TerraZApp.adminPanel.open();
    }
  }finally{
    if(button){
      button.disabled=false;
      delete button.dataset.loading;
    }
  }
}

function setup(){
  var button=document.getElementById("adminPanelBtn");
  if(button) button.addEventListener("click",openAdmin);

  // If an authenticated editor returns to a page, load the private/admin layer
  // only after authentication is actually detected.
  document.addEventListener("terra-z:auth-changed",function(event){
    if(event && event.detail && event.detail.authenticated && !loaded) loadAll();
  });
}

window.TerraZApp.adminLoader={
  load:loadAll,
  open:openAdmin,
  isLoaded:function(){ return loaded; },
  modules:function(){ return scripts.slice(); }
};

setup();
})();