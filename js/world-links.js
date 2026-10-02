(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

function openDistrict(slug){
  var tabBtn = document.querySelector('.tab-btn[data-tab="tab-city"]');
  if(tabBtn) tabBtn.click();

  var subBtn = document.querySelector('.sidebar-item[data-sub="sub-distritos"]');
  if(subBtn) subBtn.click();

  setTimeout(function(){
    var figure = document.querySelector('#sub-distritos [data-district="' + slug + '"]');
    if(!figure) return;

    var card = figure.nextElementSibling;
    var target = card || figure;

    document.querySelectorAll('.district-focus').forEach(function(el){ el.classList.remove('district-focus'); });
    target.classList.add('district-focus');
    target.scrollIntoView({behavior:'smooth', block:'center'});

    setTimeout(function(){ target.classList.remove('district-focus'); }, 2400);
  }, 80);
}

document.querySelectorAll('[data-map-district]').forEach(function(el){
  el.setAttribute('tabindex','0');
  el.setAttribute('role','button');

  function activate(){
    var slug = el.getAttribute('data-map-district');
    var router = window.TerraZApp && window.TerraZApp.router;
    if(router && router.openDistrict) router.openDistrict(slug);
    else openDistrict(slug);
  }

  el.addEventListener('click', activate);
  el.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      activate();
    }
  });
});

window.TerraZApp.worldLinks = {
  openDistrict: openDistrict
};

})();
