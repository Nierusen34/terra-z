(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var STORAGE_KEY = 'terraZ_spoiler_mode';
var mode = localStorage.getItem(STORAGE_KEY) || 'full';
var HIDDEN_LEVELS = new Set(['restricted','master']);

function levelOf(el){
  if(!el || !el.closest) return 'public';
  var owner = el.closest('[data-visibility]');
  return owner ? (owner.getAttribute('data-visibility') || 'public') : 'public';
}

function isLevelAllowed(level){
  return !(mode === 'safe' && HIDDEN_LEVELS.has(level || 'public'));
}

function isAllowed(el){
  return isLevelAllowed(levelOf(el));
}

function closeSensitiveUi(){
  var app = window.TerraZApp || {};
  if(app.search && app.search.closePanel) app.search.closePanel();
  if(mode !== 'safe') return;
  if(app.masterWorkspace && app.masterWorkspace.close) app.masterWorkspace.close();
  if(app.adminPanel && app.adminPanel.close) app.adminPanel.close();
}

function apply(options){
  options = options || {};
  var hiddenCount = 0;

  document.documentElement.setAttribute('data-spoiler-mode', mode);
  document.documentElement.classList.toggle('player-mode', mode === 'safe');

  document.querySelectorAll('[data-visibility]').forEach(function(el){
    var level = el.getAttribute('data-visibility') || 'public';
    var hide = !isLevelAllowed(level);
    el.hidden = hide;
    if(hide) hiddenCount++;
  });

  var btn = document.getElementById('spoilerToggle');
  if(btn){
    var safe = mode === 'safe';
    btn.textContent = safe ? '👁️ Visão Completa' : '🛡️ Modo Jogador';
    btn.setAttribute('aria-pressed', safe ? 'true' : 'false');
    btn.classList.toggle('active', safe);
    btn.title = safe
      ? 'Sair do Modo Jogador e reexibir o conteúdo completo'
      : 'Ocultar revelações, informações restritas e conteúdo do Mestre';
  }

  if(options.closeSensitive !== false) closeSensitiveUi();

  document.dispatchEvent(new CustomEvent('terra-z:visibility-changed',{
    detail:{mode:mode,hiddenCount:hiddenCount}
  }));

  return hiddenCount;
}

function toggle(){
  mode = mode === 'safe' ? 'full' : 'safe';
  localStorage.setItem(STORAGE_KEY, mode);
  var hiddenCount = apply({closeSensitive:true});

  var core = window.TerraZCore;
  if(core && core.showToast){
    if(mode === 'safe'){
      core.showToast(
        'Modo Jogador ativado — ' + hiddenCount + ' bloco(s) com spoilers ou conteúdo restrito ocultado(s).',
        'success',
        4200
      );
    } else {
      core.showToast('Visão completa restaurada.','info',3000);
    }
  }
}

var btn = document.getElementById('spoilerToggle');
if(btn) btn.addEventListener('click', toggle);
apply({closeSensitive:false});

window.TerraZApp.visibility = {
  apply: apply,
  toggle: toggle,
  getMode: function(){ return mode; },
  isPlayerMode: function(){ return mode === 'safe'; },
  isAllowed: isAllowed,
  isLevelAllowed: isLevelAllowed,
  isSecure: function(){ return false; }
};

})();