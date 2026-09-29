(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/campaign.js');

var escapeHtml = core.escapeHtml;
var root = document.getElementById('campaignJournal');
var searchInput = document.getElementById('campaignSearch');
var countEl = document.getElementById('campaignCount');

function getSessions(){
  return (window.TerraZData && Array.isArray(window.TerraZData.sessions))
    ? window.TerraZData.sessions.slice()
    : [];
}

function normalize(value){
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
}

function render(){
  if(!root) return;

  var term = normalize(searchInput ? searchInput.value : '').trim();
  var sessions = getSessions().filter(function(session){
    if(!term) return true;
    return normalize(JSON.stringify(session)).includes(term);
  });

  sessions.sort(function(a,b){
    return String(b.realDate || b.inWorldDate || '').localeCompare(String(a.realDate || a.inWorldDate || ''));
  });

  if(countEl) countEl.textContent = sessions.length + (sessions.length === 1 ? ' sessão' : ' sessões');

  if(sessions.length === 0){
    root.innerHTML = '<div class="campaign-empty"><div class="campaign-empty-icon">📓</div><strong>Nenhuma sessão registrada ainda</strong><p>O diário está preparado para receber sessões reais, acontecimentos, personagens, locais e consequências.</p></div>';
    return;
  }

  root.innerHTML = sessions.map(function(session){
    var participants = Array.isArray(session.participants) ? session.participants : [];
    var locations = Array.isArray(session.locations) ? session.locations : [];
    var consequences = Array.isArray(session.consequences) ? session.consequences : [];

    return '<article class="campaign-entry" id="' + escapeHtml(session.id || '') + '">' +
      '<div class="campaign-meta">' +
        '<span>' + escapeHtml(session.realDate || '') + '</span>' +
        '<span>' + escapeHtml(session.inWorldDate || '') + '</span>' +
      '</div>' +
      '<h3>' + escapeHtml(session.title || 'Sessão') + '</h3>' +
      '<p>' + escapeHtml(session.summary || '') + '</p>' +
      (participants.length ? '<div class="campaign-tags"><strong>Personagens:</strong> ' + participants.map(escapeHtml).join(' · ') + '</div>' : '') +
      (locations.length ? '<div class="campaign-tags"><strong>Locais:</strong> ' + locations.map(escapeHtml).join(' · ') + '</div>' : '') +
      (consequences.length ? '<ul class="campaign-consequences">' + consequences.map(function(item){ return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>' : '') +
    '</article>';
  }).join('');
}

if(searchInput) searchInput.addEventListener('input', render);
render();

window.TerraZApp.campaign = { render: render };

})();
