(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/sessions.js');

var escapeHtml = core.escapeHtml;
var sessions = (window.TerraZData && window.TerraZData.sessions) || [];

function characterLink(name){
  var router = window.TerraZApp.router;
  var slug = router && router.slugify ? router.slugify(name) : '';
  return '<button class="session-chip session-character" data-character="' + escapeHtml(name) + '" data-character-slug="' + escapeHtml(slug) + '">' + escapeHtml(name) + '</button>';
}

function render(){
  var root = document.getElementById('campaignSessions');
  var count = document.getElementById('campaignSessionCount');
  if(!root) return;

  if(count) count.textContent = sessions.length + (sessions.length === 1 ? ' sessão registrada' : ' sessões registradas');

  if(!sessions.length){
    root.innerHTML = '<div class="campaign-empty"><strong>Nenhuma sessão registrada ainda.</strong><p>Quando você adicionar a primeira sessão, ela aparecerá aqui com personagens, locais e consequências ligados ao restante do dossiê.</p></div>';
    return;
  }

  var ordered = sessions.slice().sort(function(a,b){
    return String(b.realDate || '').localeCompare(String(a.realDate || ''));
  });

  var html = '';
  ordered.forEach(function(session){
    var visibility = session.visibility || 'public';
    html += '<article class="session-entry" data-session-id="' + escapeHtml(session.id || '') + '" data-visibility="' + escapeHtml(visibility) + '">';
    html += '<div class="session-meta">';
    if(session.realDate) html += '<span>' + escapeHtml(session.realDate) + '</span>';
    if(session.inWorldDate) html += '<span>· ' + escapeHtml(session.inWorldDate) + '</span>';
    html += '</div>';
    html += '<h3>' + escapeHtml(session.title || 'Sessão sem título') + '</h3>';
    if(session.summary) html += '<p class="session-summary">' + escapeHtml(session.summary) + '</p>';

    if(Array.isArray(session.characters) && session.characters.length){
      html += '<div class="session-block"><strong>Personagens</strong><div class="session-chips">';
      session.characters.forEach(function(name){ html += characterLink(name); });
      html += '</div></div>';
    }

    if(Array.isArray(session.locations) && session.locations.length){
      html += '<div class="session-block"><strong>Locais</strong><div class="session-chips">';
      session.locations.forEach(function(name){ html += '<span class="session-chip">' + escapeHtml(name) + '</span>'; });
      html += '</div></div>';
    }

    if(Array.isArray(session.consequences) && session.consequences.length){
      html += '<div class="session-block"><strong>Consequências</strong><ul>';
      session.consequences.forEach(function(item){ html += '<li>' + escapeHtml(item) + '</li>'; });
      html += '</ul></div>';
    }

    html += '</article>';
  });

  root.innerHTML = html;

  root.querySelectorAll('[data-character]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var name = btn.getAttribute('data-character');
      if(window.TerraZApp.characters) window.TerraZApp.characters.open(name);
    });
  });

  if(window.TerraZApp.visibility) window.TerraZApp.visibility.apply();
}

render();

window.TerraZApp.sessions = {
  render: render,
  count: function(){ return sessions.length; }
};

})();
