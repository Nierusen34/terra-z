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

function locationVisibility(value){
  return value === 'spoiler' ? 'spoiler' : 'public';
}

function renderPoiCard(point){
  point = point || {};
  var visibility = locationVisibility(point.visibility);
  var html = '<article class="district-poi-card" data-location-name="' + escapeAttr(point.name || '') + '" data-visibility="' + visibility + '">';
  html += '<div class="district-poi-head"><span>' + escapeHtml(point.kind || 'Local') + '</span><strong>' + escapeHtml(point.name || 'Local') + '</strong></div>';
  html += '<p>' + escapeHtml(point.description || '') + '</p>';
  if(point.spoiler){
    html += '<div class="district-poi-spoiler" data-visibility="spoiler"><span>⚠ Informação restrita</span>' + escapeHtml(point.spoiler) + '</div>';
  }
  html += '</article>';
  return html;
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

    html += '<figure class="photo" data-district="' + escapeAttr(d.id) + '">';
    html += '<img data-district-image data-src="' + escapeAttr(d.image.src) + '" alt="' + escapeAttr(d.image.alt) + '" loading="lazy" decoding="async" fetchpriority="low">';
    html += '<figcaption' + editAttrs(d.edit.caption) + '>' + escapeHtml(d.image.caption) + '</figcaption></figure>';
    html += '<div class="card district-summary-card"><h4' + editAttrs(d.edit.title) + '>' + escapeHtml(d.icon + ' ' + d.name) + '</h4>';
    html += '<p' + editAttrs(d.edit.details) + '><strong>Tipo:</strong> ' + escapeHtml(d.type);
    if(d.summary) html += '<br><span class="district-summary-copy">' + escapeHtml(d.summary) + '</span>';
    html += '<br><strong>Locais:</strong> ' + escapeHtml(locationText);
    if(d.note) html += '<br><em>' + escapeHtml(d.note) + '</em>';
    html += '</p></div>';

    var points = Array.isArray(d.pointsOfInterest) ? d.pointsOfInterest : [];
    if(points.length){
      html += '<details class="district-poi-details" data-district-pois="' + escapeAttr(d.id) + '">';
      html += '<summary><span>📍 Pontos de Interesse</span><small>' + points.length + (points.length === 1 ? ' local detalhado' : ' locais detalhados') + '</small></summary>';
      html += '<div class="district-poi-grid">';
      points.forEach(function(point){ html += renderPoiCard(point); });
      html += '</div></details>';
    }
  });

  var strategic = window.TerraZData && window.TerraZData.strategicSites;
  if(Array.isArray(strategic) && strategic.length){
    html += '<section class="strategic-sites" id="strategicSites">';
    html += '<div class="subsection-title">🧭 Instalações e Áreas Estratégicas</div>';
    html += '<p class="strategic-sites-intro">Locais importantes de Vanguard Bay que não pertencem diretamente a um único distrito.</p>';
    html += '<div class="district-poi-grid strategic-sites-grid">';
    strategic.forEach(function(site){
      var visibility = locationVisibility(site.visibility);
      html += '<article class="district-poi-card strategic-site-card" data-location-name="' + escapeAttr(site.name || '') + '" data-location-id="' + escapeAttr(site.id || '') + '" data-visibility="' + visibility + '">';
      html += '<div class="district-poi-head"><span>' + escapeHtml((site.icon || '📍') + ' ' + (site.kind || 'Local')) + '</span><strong>' + escapeHtml(site.name || 'Local') + '</strong></div>';
      if(site.area) html += '<div class="district-poi-area">' + escapeHtml(site.area) + '</div>';
      html += '<p>' + escapeHtml(site.description || '') + '</p>';
      if(site.spoiler) html += '<div class="district-poi-spoiler" data-visibility="spoiler"><span>⚠ Informação restrita</span>' + escapeHtml(site.spoiler) + '</div>';
      html += '</article>';
    });
    html += '</div></section>';
  }

  root.innerHTML = html;
  root.querySelectorAll('img[data-district-image]').forEach(function(img){
    img.addEventListener('error', function(){
      var figure = img.closest('figure');
      if(figure) figure.classList.add('missing');
    });
  });

  if(window.TerraZApp && window.TerraZApp.visibility) window.TerraZApp.visibility.apply({closeSensitive:false});
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

function organizationCategoryMeta(category){
  var map={
    criminal:{label:'Facções criminosas',icon:'☠️'},
    corporate:{label:'Empresas',icon:'🏢'},
    academic:{label:'Instituições acadêmicas',icon:'🎓'},
    media:{label:'Mídia',icon:'📰'},
    agency:{label:'Agências',icon:'🛡️'}
  };
  return map[category] || {label:'Outras organizações',icon:'◆'};
}

function renderOrganizationLinks(label,items,kind){
  if(!Array.isArray(items) || !items.length) return '';
  var html='<div class="organization-links"><span>'+escapeHtml(label)+'</span><div>';
  items.forEach(function(item){
    html+='<button type="button" class="organization-link-chip" data-org-link-kind="'+escapeAttr(kind)+'" data-org-link-value="'+escapeAttr(item)+'">'+escapeHtml(item)+'</button>';
  });
  html+='</div></div>';
  return html;
}

function organizationInVanguardGraph(id){
  var layer=window.TerraZData && window.TerraZData.vanguardGraphLayer;
  if(!layer || !Array.isArray(layer.nodes)) return false;
  var wanted=String(id || '');
  return layer.nodes.some(function(node){
    return node && (node.ref===wanted || node.id===wanted);
  });
}

function bindOrganizationLinks(root){
  if(!root) return;
  root.querySelectorAll('[data-org-link-kind][data-org-link-value]').forEach(function(button){
    button.addEventListener('click',function(){
      var kind=button.getAttribute('data-org-link-kind');
      var value=button.getAttribute('data-org-link-value') || '';
      var app=window.TerraZApp || {};
      if(kind==='character' && app.router && app.router.setCharacter){
        app.router.setCharacter(value);
        if(app.router.go) app.router.go('/personagens/'+app.router.slugify(value));
        return;
      }
      if(kind==='location' && app.router && app.router.openLocation){
        app.router.openLocation(value);
      }
    });
  });

  root.querySelectorAll('[data-org-graph-id]').forEach(function(button){
    button.addEventListener('click',function(){
      var id=button.getAttribute('data-org-graph-id') || '';
      var app=window.TerraZApp || {};
      if(app.graph && app.graph.focusEntity && app.graph.focusEntity('organization',id)) return;
      if(app.router && app.router.go) app.router.go('/universo/relacoes');
    });
  });
}

function renderOrganizationsData(){
  var root=document.getElementById('organizationsData');
  if(!root || root.children.length>0) return;

  var organizations=window.TerraZData && window.TerraZData.organizations;
  if(!Array.isArray(organizations)){
    console.error('Terra Z: organizações não foram carregadas.');
    return;
  }

  var order=['criminal','corporate','academic','media','agency'];
  var html='<div class="organization-overview">';
  order.forEach(function(category){
    var count=organizations.filter(function(item){return item && item.category===category;}).length;
    if(!count) return;
    var meta=organizationCategoryMeta(category);
    html+='<div class="organization-overview-card"><span>'+escapeHtml(meta.icon)+'</span><strong>'+count+'</strong><small>'+escapeHtml(meta.label)+'</small></div>';
  });
  html+='</div>';

  order.forEach(function(category){
    var items=organizations.filter(function(item){return item && item.category===category;});
    if(!items.length) return;
    var meta=organizationCategoryMeta(category);

    html+='<section class="organization-group" data-organization-category="'+escapeAttr(category)+'">';
    html+='<div class="subsection-title">'+escapeHtml(meta.icon+' '+meta.label)+'</div>';
    html+='<div class="organization-grid">';

    items.forEach(function(item){
      var visibility=item.visibility==='spoiler'?'spoiler':'public';
      html+='<article class="organization-card" data-organization-id="'+escapeAttr(item.id||'')+'" data-organization-name="'+escapeAttr(item.name||'')+'" data-visibility="'+visibility+'">';
      html+='<div class="organization-card-head"><div class="organization-icon">'+escapeHtml(item.icon||'◆')+'</div><div><span>'+escapeHtml(item.categoryLabel||meta.label)+'</span><h4>'+escapeHtml(item.name||'Organização')+'</h4></div></div>';
      html+='<div class="organization-meta">';
      if(item.base) html+='<div><span>Base</span><strong>'+escapeHtml(item.base)+'</strong></div>';
      if(item.leader) html+='<div><span>Liderança</span><strong>'+escapeHtml(item.leader)+'</strong></div>';
      html+='</div>';
      html+='<p>'+escapeHtml(item.description||'')+'</p>';

      if(Array.isArray(item.activities) && item.activities.length){
        html+='<div class="organization-activities">';
        item.activities.forEach(function(activity){ html+='<span>'+escapeHtml(activity)+'</span>'; });
        html+='</div>';
      }

      if(Array.isArray(item.subunits) && item.subunits.length){
        html+='<div class="organization-subunits"><span>Estruturas relacionadas</span><strong>'+escapeHtml(item.subunits.join(' · '))+'</strong></div>';
      }

      if(Array.isArray(item.rivals) && item.rivals.length){
        html+='<div class="organization-subunits"><span>Rivalidade</span><strong>'+escapeHtml(item.rivals.join(' · '))+'</strong></div>';
      }

      html+=renderOrganizationLinks('Personagens',item.relatedCharacters,'character');
      html+=renderOrganizationLinks('Locais',item.relatedLocations,'location');

      if(item.spoiler){
        html+='<div class="organization-spoiler" data-visibility="spoiler"><span>⚠ Informação restrita</span>'+escapeHtml(item.spoiler)+'</div>';
      }

      if(organizationInVanguardGraph(item.id)){
        html+='<div class="organization-card-actions"><button type="button" class="organization-graph-link" data-org-graph-id="'+escapeAttr(item.id)+'">◎ Ver no grafo</button></div>';
      }

      html+='</article>';
    });

    html+='</div></section>';
  });

  root.innerHTML=html;
  bindOrganizationLinks(root);
  if(window.TerraZApp && window.TerraZApp.visibility) window.TerraZApp.visibility.apply({closeSensitive:false});
}

function renderCanonicalData(){
  renderDistrictData();
  renderAnnualEventsData();
  renderTimelineData();
  renderExternalCitiesData();
  renderTeamsData();
  renderOrganizationsData();
}

// Scripts são carregados com defer; neste ponto o HTML já foi analisado.
// Renderizar agora mantém os componentes disponíveis para listeners registrados abaixo.
renderCanonicalData();




window.TerraZApp.dataRenderer = {
  render: renderCanonicalData
};

})();
