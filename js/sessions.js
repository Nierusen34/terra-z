(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/sessions.js');

var escapeHtml = core.escapeHtml;
var escapeAttr = core.escapeAttr;
var publicSessions = (window.TerraZData && window.TerraZData.sessions) || [];
var privateSessions = [];

function backend(){ return window.TerraZApp && window.TerraZApp.backend; }

function allSessions(){
  var byId = {};
  publicSessions.forEach(function(item){
    if(item && item.id) byId[item.id] = item;
  });
  privateSessions.forEach(function(item){
    if(item && item.id) byId[item.id] = item;
  });
  return Object.keys(byId).map(function(id){ return byId[id]; });
}

function characterLink(name){
  var manager = window.TerraZApp && window.TerraZApp.characters;
  var hasFicha = !!(manager && manager.get && manager.get(name));

  if(!hasFicha){
    return '<span class="session-chip session-character-unavailable" title="Sem ficha ativa">' + escapeHtml(name) + '</span>';
  }

  var router = window.TerraZApp.router;
  var slug = router && router.slugify ? router.slugify(name) : '';
  return '<button class="session-chip session-character" data-character="' + escapeAttr(name) + '" data-character-slug="' + escapeAttr(slug) + '">' + escapeHtml(name) + '</button>';
}

function locationLink(name){
  var router = window.TerraZApp && window.TerraZApp.router;
  var route = router && router.routeForLocation ? router.routeForLocation(name) : '';

  if(!route){
    return '<span class="session-chip">' + escapeHtml(name) + '</span>';
  }

  return '<button class="session-chip session-location" data-location-route="' + escapeAttr(route) + '">' + escapeHtml(name) + '</button>';
}

function normalizeVisibility(level){
  if(level === 'rumor') return 'spoiler';
  return level === 'master' || level === 'spoiler' ? level : 'public';
}
function visibilityBadge(level){
  level=normalizeVisibility(level);
  if(level === 'master') return '<span class="session-visibility master">🔒 Mestre</span>';
  if(level === 'spoiler') return '<span class="session-visibility spoiler">⚠️ Spoiler</span>';
  return '<span class="session-visibility public">🌐 Público</span>';
}

function render(){
  var root = document.getElementById('campaignSessions');
  var count = document.getElementById('campaignSessionCount');
  if(!root) return;

  var sessions = allSessions();
  if(count) count.textContent = sessions.length + (sessions.length === 1 ? ' sessão registrada' : ' sessões registradas');

  if(!sessions.length){
    root.innerHTML = '<div class="campaign-empty"><strong>Nenhuma sessão registrada ainda.</strong><p>Quando você adicionar a primeira sessão, ela aparecerá aqui com personagens, locais e consequências ligados ao restante do dossiê.</p></div>';
    return;
  }

  var b = backend();
  var canEdit = !!(b && b.isConfigured && b.isConfigured() && b.isAuthenticated && b.isAuthenticated());

  var ordered = sessions.slice().sort(function(a,b){
    return String(b.realDate || '').localeCompare(String(a.realDate || ''));
  });

  var html = '';
  ordered.forEach(function(session){
    var visibility = normalizeVisibility(session.visibility);
    html += '<article class="session-entry session-' + escapeAttr(visibility) + '" data-session-id="' + escapeAttr(session.id || '') + '" data-visibility="' + escapeAttr(visibility) + '">';
    html += '<div class="session-meta">';
    if(session.realDate) html += '<span>' + escapeHtml(session.realDate) + '</span>';
    if(session.inWorldDate) html += '<span>· ' + escapeHtml(session.inWorldDate) + '</span>';
    html += visibilityBadge(visibility);
    html += '</div>';
    html += '<div class="session-title-row"><h3>' + escapeHtml(session.title || 'Sessão sem título') + '</h3>';
    if(canEdit) html += '<button class="session-edit-btn" data-session-edit="' + escapeAttr(session.id || '') + '">✏️ Editar</button>';
    html += '</div>';
    if(session.summary) html += '<p class="session-summary">' + escapeHtml(session.summary) + '</p>';

    if(Array.isArray(session.characters) && session.characters.length){
      html += '<div class="session-block"><strong>Personagens</strong><div class="session-chips">';
      session.characters.forEach(function(name){ html += characterLink(name); });
      html += '</div></div>';
    }

    if(Array.isArray(session.locations) && session.locations.length){
      html += '<div class="session-block"><strong>Locais</strong><div class="session-chips">';
      session.locations.forEach(function(name){ html += locationLink(name); });
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

  root.querySelectorAll('[data-session-edit]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var id = btn.getAttribute('data-session-edit');
      if(window.TerraZApp.sessionEditor) window.TerraZApp.sessionEditor.open(id);
    });
  });

  root.querySelectorAll('[data-character]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var name = btn.getAttribute('data-character');
      if(window.TerraZApp.characters) window.TerraZApp.characters.open(name);
    });
  });

  root.querySelectorAll('[data-location-route]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var route = btn.getAttribute('data-location-route');
      var router = window.TerraZApp && window.TerraZApp.router;
      if(router && router.go) router.go(route);
    });
  });

  if(window.TerraZApp.visibility) window.TerraZApp.visibility.apply();
  document.dispatchEvent(new CustomEvent('terra-z:sessions-rendered'));
}

async function loadPrivateSessions(){
  var b = backend();

  if(!b || !b.isConfigured() || !b.isAuthenticated()){
    privateSessions = [];
    render();
    return;
  }

  try {
    var result = await b.request('/api/private-sessions',{method:'GET'});
    privateSessions = Array.isArray(result.sessions) ? result.sessions : [];
  } catch(error){
    privateSessions = [];
    console.error('Terra Z private sessions:',error);
  }

  render();
}

function removeSession(id){
  if(!id) return;
  publicSessions = publicSessions.filter(function(row){ return !row || row.id !== id; });
  privateSessions = privateSessions.filter(function(row){ return !row || row.id !== id; });
  render();
}

function upsertSession(item){
  if(!item || !item.id) return;

  item.visibility=normalizeVisibility(item.visibility);
  if(item.visibility === 'master'){
    var privateIndex = privateSessions.findIndex(function(row){ return row && row.id === item.id; });
    if(privateIndex >= 0) privateSessions[privateIndex] = item;
    else privateSessions.push(item);

    publicSessions = publicSessions.filter(function(row){ return !row || row.id !== item.id; });
  } else {
    var publicIndex = publicSessions.findIndex(function(row){ return row && row.id === item.id; });
    if(publicIndex >= 0) publicSessions[publicIndex] = item;
    else publicSessions.push(item);

    privateSessions = privateSessions.filter(function(row){ return !row || row.id !== item.id; });
  }

  render();
}

document.addEventListener('terra-z:auth-changed', loadPrivateSessions);
document.addEventListener('terra-z:runtime-data-loaded',function(){
  publicSessions = (window.TerraZData && window.TerraZData.sessions) || [];
  render();
});

render();
if(backend() && backend().isAuthenticated()) loadPrivateSessions();

window.TerraZApp.sessions = {
  render:render,
  reloadPrivate:loadPrivateSessions,
  upsert:upsertSession,
  remove:removeSession,
  getAll:allSessions,
  count:function(){ return allSessions().length; }
};

})();