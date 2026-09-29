(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/data-renderer.js');

var escapeHtml = core.escapeHtml;
var escapeAttr = core.escapeAttr;

function editAttrs(meta){
  if(!meta) return '';
  return ' data-edit-id="' + escapeAttr(meta.id) + '" data-legacy-edit-id="' + escapeAttr(meta.legacyId) + '"';
}

function renderDistrictData(){
  var root = document.getElementById('districtsData');
  if(!root || root.children.length > 0) return;

  var districts = window.TerraZData && window.TerraZData.districts;
  if(!Array.isArray(districts)){
    console.error('Terra Z: data/locations.js não foi carregado.');
    return;
  }

  var html = '';
  districts.forEach(function(d){
    var locationText = Array.isArray(d.locations) ? d.locations.join(', ') : '';
    if(locationText && !/[.!?]$/.test(locationText)) locationText += '.';
    if(d.note) locationText += (locationText ? ' ' : '') + d.note;

    html += '<figure class="photo" data-district="' + escapeAttr(d.id) + '">';
    html += '<img data-district-image src="' + escapeAttr(d.image.src) + '" alt="' + escapeAttr(d.image.alt) + '" loading="lazy" decoding="async">';
    html += '<figcaption' + editAttrs(d.edit.caption) + '>' + escapeHtml(d.image.caption) + '</figcaption></figure>';
    html += '<div class="card"><h4' + editAttrs(d.edit.title) + '>' + escapeHtml(d.icon + ' ' + d.name) + '</h4>';
    html += '<p' + editAttrs(d.edit.details) + '><strong>Tipo:</strong> ' + escapeHtml(d.type) + '<br><strong>Locais:</strong> ' + escapeHtml(locationText) + '</p></div>';
  });

  root.innerHTML = html;
  root.querySelectorAll('img[data-district-image]').forEach(function(img){
    img.addEventListener('error', function(){
      var figure = img.closest('figure');
      if(figure) figure.classList.add('missing');
    });
  });
}

function renderAnnualEventsData(){
  var body = document.getElementById('annualEventsBody');
  if(!body || body.children.length > 0) return;

  var events = window.TerraZData && window.TerraZData.annualEvents;
  if(!Array.isArray(events)){
    console.error('Terra Z: data/events.js não foi carregado.');
    return;
  }

  var html = '';
  events.forEach(function(event){
    html += '<tr>';
    html += '<td' + editAttrs(event.edit.name) + '>' + escapeHtml(event.name) + '</td>';
    html += '<td' + editAttrs(event.edit.month) + '>' + escapeHtml(event.month) + '</td>';
    html += '<td' + editAttrs(event.edit.description) + '>' + escapeHtml(event.description) + '</td>';
    html += '</tr>';
  });
  body.innerHTML = html;
}

function renderTimelineData(){
  var root = document.getElementById('timelineData');
  if(!root || root.children.length > 0) return;

  var groups = window.TerraZData && window.TerraZData.timeline;
  if(!Array.isArray(groups)){
    console.error('Terra Z: data/timeline.js não foi carregado.');
    return;
  }

  var html = '';
  groups.forEach(function(group){
    html += '<div class="subsection-title">' + escapeHtml(group.title) + '</div>';
    html += '<div class="timeline">';
    group.items.forEach(function(item){
      html += '<div class="timeline-item">';
      html += '<div' + editAttrs(item.edit.year) + ' class="timeline-year">' + escapeHtml(item.year) + '</div>';
      html += '<div' + editAttrs(item.edit.text) + ' class="timeline-text">' + escapeHtml(item.text) + '</div>';
      html += '</div>';
    });
    html += '</div>';
  });
  root.innerHTML = html;
}

function renderExternalCitiesData(){
  var body = document.getElementById('externalCitiesBody');
  if(!body || body.children.length > 0) return;

  var cities = window.TerraZData && window.TerraZData.externalCities;
  if(!Array.isArray(cities)){
    console.error('Terra Z: data/cities.js não foi carregado.');
    return;
  }

  var html = '';
  cities.forEach(function(city){
    html += '<tr>';
    html += '<td' + editAttrs(city.edit.city) + '>' + escapeHtml(city.city) + '</td>';
    html += '<td' + editAttrs(city.edit.flightKm) + '>' + escapeHtml(city.flightKm) + '</td>';
    html += '<td' + editAttrs(city.edit.flightTime) + '>' + escapeHtml(city.flightTime) + '</td>';
    html += '<td' + editAttrs(city.edit.driveKm) + '>' + escapeHtml(city.driveKm) + '</td>';
    html += '<td' + editAttrs(city.edit.driveTime) + '>' + escapeHtml(city.driveTime) + '</td>';
    html += '</tr>';
  });
  body.innerHTML = html;
}

function renderTeamsData(){
  var teamsBody = document.getElementById('teamsBody');
  var leagueBody = document.getElementById('justiceLeagueBody');
  var data = window.TerraZData && window.TerraZData.teams;

  if(!data || !Array.isArray(data.teams) || !Array.isArray(data.justiceLeagueMembers)){
    console.error('Terra Z: data/teams.js não foi carregado.');
    return;
  }

  if(teamsBody && teamsBody.children.length === 0){
    var teamsHtml = '';
    data.teams.forEach(function(team){
      teamsHtml += '<tr>';
      teamsHtml += '<td' + editAttrs(team.edit.name) + '>' + escapeHtml(team.name) + '</td>';
      teamsHtml += '<td' + editAttrs(team.edit.year) + '>' + escapeHtml(team.year) + '</td>';
      teamsHtml += '<td' + editAttrs(team.edit.leader) + '>' + escapeHtml(team.leader) + '</td>';
      teamsHtml += '<td' + editAttrs(team.edit.members) + '>' + escapeHtml(team.members) + '</td>';
      teamsHtml += '</tr>';
    });
    teamsBody.innerHTML = teamsHtml;
  }

  if(leagueBody && leagueBody.children.length === 0){
    var leagueHtml = '';
    data.justiceLeagueMembers.forEach(function(member){
      leagueHtml += '<tr>';
      leagueHtml += '<td' + editAttrs(member.edit.character) + '>' + escapeHtml(member.character) + '</td>';
      leagueHtml += '<td' + editAttrs(member.edit.codename) + '>' + escapeHtml(member.codename) + '</td>';
      leagueHtml += '<td' + editAttrs(member.edit.born) + '>' + escapeHtml(member.born) + '</td>';
      leagueHtml += '<td' + editAttrs(member.edit.age2027) + '>' + escapeHtml(member.age2027) + '</td>';
      leagueHtml += '</tr>';
    });
    leagueBody.innerHTML = leagueHtml;
  }
}

function renderCanonicalData(){
  renderDistrictData();
  renderAnnualEventsData();
  renderTimelineData();
  renderExternalCitiesData();
  renderTeamsData();
}

// Scripts são carregados com defer; neste ponto o HTML já foi analisado.
// Renderizar agora mantém os componentes disponíveis para listeners registrados abaixo.
renderCanonicalData();




window.TerraZApp.dataRenderer = {
  render: renderCanonicalData
};

})();
