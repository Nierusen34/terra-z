(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

function hydrate(root){
  root = root || document;
  var images = [];

  if(root.matches && root.matches('img[data-src]')) images.push(root);
  root.querySelectorAll('img[data-src]').forEach(function(img){ images.push(img); });

  images.forEach(function(img){
    if(img.getAttribute('src')) return;
    var src = img.getAttribute('data-src');
    if(!src) return;
    img.setAttribute('src', src);
  });
}

function hydrateActive(){
  var activeTab = document.querySelector('.tab-content.active');
  if(!activeTab) return;
  hydrate(activeTab.querySelector('.sub-content.active') || activeTab);
}

window.TerraZApp.media = {
  hydrate: hydrate,
  hydrateActive: hydrateActive
};

hydrateActive();

})();
