(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var LEGACY_STORAGE_KEY='terraZ_spoiler_mode';

// Segurança por padrão: toda nova abertura/recarregamento começa em Modo Jogador.
// A escolha de exibir spoilers vale apenas para a página atualmente aberta.
var mode='safe';

try {
  localStorage.removeItem(LEGACY_STORAGE_KEY);
} catch(e){}

function backend(){ return window.TerraZApp && window.TerraZApp.backend; }
function authenticated(){
  var b=backend();
  return !!(b && b.isAuthenticated && b.isAuthenticated());
}
function normalizeLevel(level){
  var raw=String(level || 'public').toLowerCase();
  var aliases=(window.TerraZData && window.TerraZData.visibilityAliases) || {};
  raw=aliases[raw] || raw;
  return raw === 'spoiler' || raw === 'master' ? raw : 'public';
}
function levelOf(el){
  if(!el || !el.closest) return 'public';
  var owner=el.closest('[data-visibility]');
  return normalizeLevel(owner ? owner.getAttribute('data-visibility') : 'public');
}
function isLevelAllowed(level){
  var normalized=normalizeLevel(level);
  if(normalized === 'master') return authenticated() && mode !== 'safe';
  if(normalized === 'spoiler') return mode !== 'safe';
  return true;
}
function isAllowed(el){ return isLevelAllowed(levelOf(el)); }

function closeSensitiveUi(){
  var app=window.TerraZApp || {};
  if(app.search && app.search.closePanel) app.search.closePanel();
  if(mode !== 'safe') return;
  if(app.masterWorkspace && app.masterWorkspace.close) app.masterWorkspace.close();
  if(app.adminPanel && app.adminPanel.close) app.adminPanel.close();
}
function apply(options){
  options=options || {};
  var hiddenCount=0;
  document.documentElement.setAttribute('data-spoiler-mode',mode);
  document.documentElement.classList.toggle('player-mode',mode === 'safe');

  document.querySelectorAll('[data-visibility]').forEach(function(el){
    var level=normalizeLevel(el.getAttribute('data-visibility'));
    el.setAttribute('data-visibility',level);
    var hide=!isLevelAllowed(level);
    el.hidden=hide;
    if(hide) hiddenCount++;
  });

  var btn=document.getElementById('spoilerToggle');
  if(btn){
    var safe=mode === 'safe';
    btn.textContent=safe ? '👁️ Ver Spoilers' : '🛡️ Modo Jogador';
    btn.setAttribute('aria-pressed',safe ? 'true' : 'false');
    btn.classList.toggle('active',safe);
    btn.title=safe
      ? 'Exibir conteúdo Público e Spoiler; conteúdo Mestre continua restrito ao editor'
      : 'Mostrar somente conteúdo Público';
  }

  if(options.closeSensitive !== false) closeSensitiveUi();

  document.dispatchEvent(new CustomEvent('terra-z:visibility-changed',{
    detail:{mode:mode,hiddenCount:hiddenCount,authenticated:authenticated()}
  }));
  return hiddenCount;
}
function toggle(){
  mode=mode === 'safe' ? 'full' : 'safe';
  var hiddenCount=apply({closeSensitive:true});
  var core=window.TerraZCore;
  if(core && core.showToast){
    if(mode === 'safe'){
      core.showToast('Modo Jogador ativado — apenas conteúdo Público permanece visível.','success',4200);
    }else{
      core.showToast(
        authenticated()
          ? 'Visão completa restaurada — Spoilers e conteúdo Mestre autenticado estão disponíveis.'
          : 'Spoilers reexibidos. Conteúdo Mestre exige autenticação.',
        'info',3800
      );
    }
  }
  return hiddenCount;
}

var btn=document.getElementById('spoilerToggle');
if(btn) btn.addEventListener('click',toggle);
document.addEventListener('terra-z:auth-changed',function(){ apply({closeSensitive:false}); });
apply({closeSensitive:false});

window.TerraZApp.visibility={
  apply:apply,
  toggle:toggle,
  getMode:function(){ return mode; },
  isPlayerMode:function(){ return mode === 'safe'; },
  isAllowed:isAllowed,
  isLevelAllowed:isLevelAllowed,
  normalizeLevel:normalizeLevel,
  isSecure:function(level){ return normalizeLevel(level) === 'master'; }
};

})();
