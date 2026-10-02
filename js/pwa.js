(function(){
"use strict";

window.TerraZApp=window.TerraZApp||{};
var core=window.TerraZCore;
var showToast=core&&core.showToast?core.showToast:function(){};
var deferredPrompt=null;
var registration=null;
var refreshing=false;

function standalone(){
  return window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone===true;
}
function ios(){
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}
function installButton(){
  var old=document.getElementById("pwaInstallBtn");
  if(old)return old;
  var host=document.querySelector(".topbar-actions");
  if(!host)return null;
  var button=document.createElement("button");
  button.id="pwaInstallBtn";
  button.type="button";
  button.className="pwa-install-btn";
  button.hidden=true;
  button.textContent="⬇ App";
  button.title="Instalar Terra Z neste dispositivo";
  var separator=host.querySelector(".topbar-separator");
  host.insertBefore(button,separator||null);
  button.addEventListener("click",install);
  return button;
}
function statusPill(){
  var node=document.getElementById("pwaNetworkStatus");
  if(node)return node;
  node=document.createElement("div");
  node.id="pwaNetworkStatus";
  node.className="pwa-network-status";
  node.setAttribute("role","status");
  node.hidden=true;
  node.textContent="◌ Offline · consulta pública disponível";
  document.body.appendChild(node);
  return node;
}
function updateBanner(){
  var node=document.getElementById("pwaUpdateBanner");
  if(node)return node;
  node=document.createElement("div");
  node.id="pwaUpdateBanner";
  node.className="pwa-update-banner";
  node.hidden=true;
  node.innerHTML='<span><strong>Nova versão do Terra Z disponível</strong><small>Atualize quando for conveniente.</small></span><button id="pwaUpdateApply" type="button">Atualizar</button><button id="pwaUpdateLater" type="button" aria-label="Fechar">Depois</button>';
  document.body.appendChild(node);
  node.querySelector("#pwaUpdateApply").addEventListener("click",applyUpdate);
  node.querySelector("#pwaUpdateLater").addEventListener("click",function(){node.hidden=true;});
  return node;
}
function showUpdate(){updateBanner().hidden=false;}
function applyUpdate(){
  if(!registration||!registration.waiting)return;
  refreshing=true;
  registration.waiting.postMessage({type:"SKIP_WAITING"});
}
function syncInstall(){
  var button=installButton();
  if(!button)return;
  if(standalone()){button.hidden=true;return;}
  button.hidden=!(deferredPrompt||ios());
}
async function install(){
  if(standalone())return;
  if(deferredPrompt){
    deferredPrompt.prompt();
    var choice=await deferredPrompt.userChoice.catch(function(){return null;});
    if(choice&&choice.outcome==="accepted") showToast("Instalação do Terra Z iniciada.","success",3500);
    deferredPrompt=null;
    syncInstall();
    return;
  }
  if(ios()){
    showToast("No iPhone/iPad: toque em Compartilhar e depois em “Adicionar à Tela de Início”.","info",6500);
  }
}
function setDisabled(selector,offline){
  document.querySelectorAll(selector).forEach(function(node){
    if(offline){
      if(!node.disabled)node.dataset.pwaWasEnabled="1";
      node.disabled=true;
      node.setAttribute("aria-disabled","true");
      node.title="Requer conexão com a internet";
    }else if(node.dataset.pwaWasEnabled==="1"){
      node.disabled=false;
      delete node.dataset.pwaWasEnabled;
      node.removeAttribute("aria-disabled");
    }
  });
}
function syncNetwork(){
  var offline=!navigator.onLine;
  document.body.classList.toggle("pwa-offline",offline);
  var pill=statusPill();
  pill.hidden=!offline;
  setDisabled("#publishBtn,#adminLoginBtn,[data-admin-action='publish'],#backupExportComplete,#backupExportPublicJson",offline);
  document.dispatchEvent(new CustomEvent("terra-z:network-changed",{detail:{online:!offline}}));
}
async function register(){
  if(!("serviceWorker" in navigator))return;
  try{
    registration=await navigator.serviceWorker.register("./sw.js",{scope:"./"});
    if(registration.waiting&&navigator.serviceWorker.controller)showUpdate();

    registration.addEventListener("updatefound",function(){
      var worker=registration.installing;
      if(!worker)return;
      worker.addEventListener("statechange",function(){
        if(worker.state==="installed"&&navigator.serviceWorker.controller)showUpdate();
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange",function(){
      if(refreshing)location.reload();
    });

    if(navigator.onLine)registration.update().catch(function(){});
  }catch(error){
    console.warn("Terra Z PWA:",error);
  }
}
function setup(){
  installButton();
  statusPill();
  updateBanner();
  syncInstall();
  syncNetwork();
  register();
  window.addEventListener("online",syncNetwork);
  window.addEventListener("offline",syncNetwork);
  window.addEventListener("appinstalled",function(){
    deferredPrompt=null;
    syncInstall();
    showToast("Terra Z instalado neste dispositivo.","success",4000);
  });
  document.addEventListener("visibilitychange",function(){
    if(document.visibilityState==="visible"&&navigator.onLine&&registration){
      registration.update().catch(function(){});
    }
  });
  var observer=new MutationObserver(syncNetwork);
  var admin=document.getElementById("adminPanel");
  if(admin)observer.observe(admin,{childList:true,subtree:true});
}
window.addEventListener("beforeinstallprompt",function(event){
  event.preventDefault();
  deferredPrompt=event;
  syncInstall();
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup);
else setup();

window.TerraZApp.pwa={
  isStandalone:standalone,
  isOnline:function(){return navigator.onLine;},
  registration:function(){return registration;},
  checkUpdate:function(){return registration?registration.update():Promise.resolve();}
};
})();