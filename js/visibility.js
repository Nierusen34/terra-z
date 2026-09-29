(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var STORAGE_KEY = 'terraZ_spoiler_mode';
var mode = localStorage.getItem(STORAGE_KEY) || 'full';

function apply(){
  document.documentElement.setAttribute('data-spoiler-mode', mode);
  document.querySelectorAll('[data-visibility]').forEach(function(el){
    var level = el.getAttribute('data-visibility') || 'public';
    var hide = mode === 'safe' && (level === 'restricted' || level === 'master');
    el.hidden = hide;
  });

  var btn = document.getElementById('spoilerToggle');
  if(btn){
    btn.textContent = mode === 'safe' ? '👁️ Mostrar spoilers' : '🙈 Ocultar spoilers';
    btn.setAttribute('aria-pressed', mode === 'safe' ? 'true' : 'false');
  }
}

function toggle(){
  mode = mode === 'safe' ? 'full' : 'safe';
  localStorage.setItem(STORAGE_KEY, mode);
  apply();
}

var btn = document.getElementById('spoilerToggle');
if(btn) btn.addEventListener('click', toggle);
apply();

window.TerraZApp.visibility = {
  apply: apply,
  toggle: toggle,
  getMode: function(){ return mode; },
  isSecure: function(){ return false; }
};

})();
