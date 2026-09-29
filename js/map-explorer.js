(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/map-explorer.js');

var escapeHtml = core.escapeHtml;
var root = document.getElementById('mapDistrictLinks');

function getDistricts(){
  return (window.TerraZData && Array.isArray(window.TerraZData.districts))
    ? window.TerraZData.districts
    : [];
}

function renderLinks(){
  if(!root) return;
  root.innerHTML = getDistricts().map(function(d){
    return '<button type="button" data-map-district="' + escapeHtml(d.id) + '">' +
      escapeHtml((d.icon ? d.icon + ' ' : '') + d.name) +
      '</button>';
  }).join('');

  root.addEventListener('click', function(e){
    var btn = e.target.closest('[data-map-district]');
    if(!btn) return;
    var id = btn.getAttribute('data-map-district');
    if(window.TerraZApp.router) window.TerraZApp.router.setDistrict(id);
    else focusDistrict(id);
  });
}

function focusDistrict(id, scroll){
  var figure = document.querySelector('#districtsData figure[data-district="' + CSS.escape(id) + '"]');
  if(!figure) return false;

  document.querySelectorAll('.district-focus').forEach(function(el){ el.classList.remove('district-focus'); });
  figure.classList.add('district-focus');

  var card = figure.nextElementSibling;
  if(card && card.classList.contains('card')) card.classList.add('district-focus');

  if(scroll !== false){
    figure.scrollIntoView({behavior:'smooth', block:'center'});
  }

  setTimeout(function(){
    figure.classList.remove('district-focus');
    if(card) card.classList.remove('district-focus');
  }, 3500);

  return true;
}

renderLinks();

window.TerraZApp.mapExplorer = {
  focus: focusDistrict,
  render: renderLinks
};

})();
