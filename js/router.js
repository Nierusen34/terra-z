(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/router.js');

var showToast = core.showToast;
var BASE_TITLE = document.title;
var STORAGE_KEY = 'terraZ_last_route_v2';
var applying = false;
var scheduled = null;
var lastTabNavigation = null;
var lastWarning = {key:'',at:0};

var SECTION_ROUTES = [
  {route:'/capa',tab:'tab-home',sub:null,title:'Capa'},
  {route:'/cidade/visao-geral',tab:'tab-city',sub:'sub-visao',title:'Cidade · Visão Geral'},
  {route:'/cidade/distritos',tab:'tab-city',sub:'sub-distritos',title:'Cidade · Distritos'},
  {route:'/cidade/historia',tab:'tab-city',sub:'sub-historia',title:'Cidade · História'},
  {route:'/cidade/cultura',tab:'tab-city',sub:'sub-cultura',title:'Cidade · Cultura'},
  {route:'/cidade/eventos',tab:'tab-city',sub:'sub-eventos',title:'Cidade · Eventos'},
  {route:'/mapas/visao-geral',tab:'tab-maps',sub:'sub-mapa-detalhado',title:'Mapas · Visão Geral'},
  {route:'/mapas/transporte',tab:'tab-maps',sub:'sub-mapa-transporte',title:'Mapas · Transporte'},
  {route:'/mapas/nacional',tab:'tab-maps',sub:'sub-mapa-nacional',title:'Mapas · Nacional'},
  {route:'/mapas/criminalidade',tab:'tab-maps',sub:'sub-mapa-criminal',title:'Mapas · Criminalidade'},
  {route:'/transporte/internas',tab:'tab-transport',sub:'sub-dist-internas',title:'Transporte · Internas'},
  {route:'/transporte/cidades',tab:'tab-transport',sub:'sub-cidades-externas',title:'Transporte · Cidades Externas'},
  {route:'/transporte/sistema',tab:'tab-transport',sub:'sub-sistema-transporte',title:'Transporte · Sistema'},
  {route:'/universo/visao-geral',tab:'tab-terraz',sub:'sub-universo-visao',title:'Universo · Visão Geral'},
  {route:'/universo/personagens',tab:'tab-terraz',sub:'sub-tz-personagens',title:'Universo · Personagens'},
  {route:'/universo/linha-do-tempo',tab:'tab-terraz',sub:'sub-tz-timeline',title:'Universo · Linha do Tempo'},
  {route:'/universo/equipes',tab:'tab-terraz',sub:'sub-tz-equipes',title:'Universo · Equipes'},
  {route:'/universo/relacoes',tab:'tab-terraz',sub:'sub-tz-relacoes',title:'Universo · Relações'},
  {route:'/universo/sessoes',tab:'tab-terraz',sub:'sub-tz-sessoes',title:'Universo · Sessões'}
];

function slugify(value){
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function decodePart(value){
  try { return decodeURIComponent(value); }
  catch(error){ return String(value || ''); }
}

function encodePart(value){
  return encodeURIComponent(String(value || '')).replace(/%2F/gi,'%252F');
}

function normalizeRoute(value){
  var route=String(value || '').trim();
  if(!route) return '/capa';
  route=route.replace(/^#+/,'');
  if(route.charAt(0) !== '/') route='/'+route;
  route=route.replace(/\/{2,}/g,'/');
  if(route.length > 1) route=route.replace(/\/+$/,'');
  return route;
}

function sectionEntry(tab,sub){
  var exact=SECTION_ROUTES.find(function(item){
    return item.tab === tab && item.sub === (sub || null);
  });
  if(exact) return exact;

  var activeSub=null;
  if(tab){
    var root=document.getElementById(tab);
    var active=root && root.querySelector('.sidebar-item.active');
    activeSub=active ? active.getAttribute('data-sub') : null;
  }

  var activeMatch=SECTION_ROUTES.find(function(item){
    return item.tab === tab && item.sub === activeSub;
  });
  if(activeMatch) return activeMatch;

  return SECTION_ROUTES.find(function(item){ return item.tab === tab; }) || SECTION_ROUTES[0];
}

function routeForSection(tab,sub){
  return sectionEntry(tab,sub).route;
}

function sectionForRoute(route){
  route=normalizeRoute(route);
  return SECTION_ROUTES.find(function(item){ return item.route === route; }) || null;
}

function findCharacterBySlug(slug){
  var manager=window.TerraZApp && window.TerraZApp.characters;
  var names=manager && manager.names
    ? manager.names()
    : Object.keys((window.TerraZData && window.TerraZData.characters) || {});
  return names.find(function(name){ return slugify(name) === slugify(slug); }) || null;
}

function findSession(value){
  var manager=window.TerraZApp && window.TerraZApp.sessions;
  var sessions=manager && manager.getAll ? manager.getAll() : ((window.TerraZData && window.TerraZData.sessions) || []);
  var wanted=slugify(value);
  return sessions.find(function(item){
    return item && (
      String(item.id || '') === String(value || '') ||
      slugify(item.id) === wanted ||
      slugify(item.title) === wanted
    );
  }) || null;
}

function findTeamBySlug(slug){
  var teams=window.TerraZData && window.TerraZData.teams && window.TerraZData.teams.teams;
  if(!Array.isArray(teams)) return null;
  return teams.find(function(item){ return item && slugify(item.name) === slugify(slug); }) || null;
}

function findCityBySlug(slug){
  var cities=window.TerraZData && window.TerraZData.externalCities;
  if(!Array.isArray(cities)) return null;
  return cities.find(function(item){ return item && slugify(item.city) === slugify(slug); }) || null;
}

function findDistrictBySlug(slug){
  var districts=window.TerraZData && window.TerraZData.districts;
  if(!Array.isArray(districts)) return null;
  var wanted=slugify(slug);
  return districts.find(function(item){
    return item && (slugify(item.id) === wanted || slugify(item.name) === wanted);
  }) || null;
}

function legacyRoute(raw){
  var params=new URLSearchParams(raw);
  var character=params.get('personagem');
  if(character) return '/personagens/'+slugify(character);

  var tab=params.get('secao');
  var sub=params.get('sub');
  if(tab || sub) return routeForSection(tab,sub);

  return '/capa';
}

function routeFromAnchor(raw){
  var id=String(raw || '').replace(/^#/,'');
  if(!id) return '';

  var subEntry=SECTION_ROUTES.find(function(item){ return item.sub === id; });
  if(subEntry) return subEntry.route;

  var tabEntry=SECTION_ROUTES.find(function(item){ return item.tab === id; });
  if(tabEntry) return tabEntry.route;

  return '';
}

function rawRouteFromLocation(){
  var raw=String(location.hash || '').replace(/^#/,'').trim();
  if(!raw) return '';
  if(raw.indexOf('=') !== -1) return legacyRoute(raw);
  if(raw.charAt(0) !== '/'){
    var anchored=routeFromAnchor(raw);
    return anchored || normalizeRoute(raw);
  }
  return normalizeRoute(raw);
}

function parseRoute(route){
  route=normalizeRoute(route);
  var parts=route.split('/').filter(Boolean).map(decodePart);
  var first=parts[0] || '';

  if(first === 'personagens' && parts[1]){
    return {kind:'character',route:'/personagens/'+slugify(parts[1]),slug:slugify(parts[1]),title:'Personagem'};
  }
  if(first === 'sessoes' && parts[1]){
    return {kind:'session',route:'/sessoes/'+encodePart(parts[1]),id:parts[1],title:'Sessão'};
  }
  if(first === 'equipes' && parts[1]){
    return {kind:'team',route:'/equipes/'+slugify(parts[1]),slug:slugify(parts[1]),title:'Equipe'};
  }
  if(first === 'cidades' && parts[1]){
    return {kind:'city',route:'/cidades/'+slugify(parts[1]),slug:slugify(parts[1]),title:'Cidade'};
  }
  if(first === 'distritos' && parts[1]){
    return {kind:'district',route:'/distritos/'+slugify(parts[1]),slug:slugify(parts[1]),title:'Distrito'};
  }

  if(first === 'universo' && parts[1] === 'personagens' && parts[2]){
    return {kind:'character',route:'/personagens/'+slugify(parts[2]),slug:slugify(parts[2]),title:'Personagem'};
  }
  if(first === 'universo' && parts[1] === 'sessoes' && parts[2]){
    return {kind:'session',route:'/sessoes/'+encodePart(parts[2]),id:parts[2],title:'Sessão'};
  }
  if(first === 'universo' && parts[1] === 'equipes' && parts[2]){
    return {kind:'team',route:'/equipes/'+slugify(parts[2]),slug:slugify(parts[2]),title:'Equipe'};
  }
  if(first === 'transporte' && parts[1] === 'cidades' && parts[2]){
    return {kind:'city',route:'/cidades/'+slugify(parts[2]),slug:slugify(parts[2]),title:'Cidade'};
  }
  if(first === 'cidade' && parts[1] === 'distritos' && parts[2]){
    return {kind:'district',route:'/distritos/'+slugify(parts[2]),slug:slugify(parts[2]),title:'Distrito'};
  }

  var section=sectionForRoute(route);
  if(section){
    return {
      kind:'section',
      route:section.route,
      tab:section.tab,
      sub:section.sub,
      title:section.title
    };
  }

  return {kind:'unknown',route:route,title:'Terra Z'};
}

function remember(route){
  try { localStorage.setItem(STORAGE_KEY,normalizeRoute(route)); }
  catch(error){}
}

function buildUrl(route){
  return location.origin + location.pathname + location.search + '#' + normalizeRoute(route);
}

function writeRoute(route,options){
  options=options || {};
  route=normalizeRoute(route);

  var url=location.pathname + location.search + '#' + route;
  var current=rawRouteFromLocation();

  if(current === route && !options.force){
    remember(route);
    return;
  }

  var state={terraZ:true,route:route};
  if(options.replace) history.replaceState(state,'',url);
  else history.pushState(state,'',url);

  remember(route);
}

function updateTitle(label){
  document.title=label ? label + ' · Terra Z' : BASE_TITLE;
}

function navigateSection(tab,sub){
  var tabBtn=tab ? document.querySelector('.tab-btn[data-tab="'+tab+'"]') : null;
  if(tabBtn && !tabBtn.classList.contains('active')) tabBtn.click();

  if(sub){
    var subBtn=document.querySelector('.sidebar-item[data-sub="'+sub+'"]');
    if(subBtn && !subBtn.classList.contains('active')) subBtn.click();
  }
}

function clearFocus(){
  document.querySelectorAll('.deep-link-focus').forEach(function(node){
    node.classList.remove('deep-link-focus');
  });
}

function findTargetByRoute(route){
  var nodes=document.querySelectorAll('[data-deep-route]');
  for(var i=0;i<nodes.length;i++){
    if(nodes[i].getAttribute('data-deep-route') === route) return nodes[i];
  }
  return null;
}

function focusTarget(route){
  decorateTargets();
  var target=findTargetByRoute(route);
  if(!target) return false;

  clearFocus();
  target.classList.add('deep-link-focus');
  setTimeout(function(){
    try { target.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'}); }
    catch(error){ target.scrollIntoView(); }
  },80);
  return true;
}

function warnOnce(key,message){
  var now=Date.now();
  if(lastWarning.key === key && now-lastWarning.at < 3500) return;
  lastWarning={key:key,at:now};
  showToast(message,'warning',4500);
}

function closeCharacterFromRoute(){
  var modal=document.getElementById('fichaModal');
  if(modal && modal.classList.contains('show')){
    var manager=window.TerraZApp && window.TerraZApp.characters;
    if(manager && manager.close) manager.close({fromRouter:true});
  }
}

function applyRoute(route,options){
  options=options || {};
  var parsed=parseRoute(route);
  applying=true;
  clearFocus();

  try{
    if(parsed.kind !== 'character') closeCharacterFromRoute();

    if(parsed.kind === 'section'){
      navigateSection(parsed.tab,parsed.sub);
      updateTitle(parsed.title);
      remember(parsed.route);
      return parsed;
    }

    if(parsed.kind === 'character'){
      navigateSection('tab-terraz','sub-tz-personagens');
      var character=findCharacterBySlug(parsed.slug);
      if(character){
        var manager=window.TerraZApp && window.TerraZApp.characters;
        if(manager && manager.open) manager.open(character,{fromRouter:true});
        updateTitle(character);
      }else{
        updateTitle('Personagem · Terra Z');
        warnOnce('character:'+parsed.slug,'Personagem não disponível neste modo ou link inválido.');
      }
      remember(parsed.route);
      return parsed;
    }

    if(parsed.kind === 'session'){
      navigateSection('tab-terraz','sub-tz-sessoes');
      var session=findSession(parsed.id);
      if(session){
        var canonical='/sessoes/'+encodePart(session.id || parsed.id);
        if(canonical !== parsed.route && options.canonicalize !== false) writeRoute(canonical,{replace:true});
        focusTarget(canonical);
        updateTitle(session.title || 'Sessão');
        remember(canonical);
      }else{
        updateTitle('Sessões · Terra Z');
        warnOnce('session:'+parsed.id,'Sessão não encontrada ou disponível apenas após autenticação.');
        remember(parsed.route);
      }
      return parsed;
    }

    if(parsed.kind === 'team'){
      navigateSection('tab-terraz','sub-tz-equipes');
      var team=findTeamBySlug(parsed.slug);
      if(team){
        var teamRoute='/equipes/'+slugify(team.name);
        if(teamRoute !== parsed.route && options.canonicalize !== false) writeRoute(teamRoute,{replace:true});
        focusTarget(teamRoute);
        updateTitle(team.name);
        remember(teamRoute);
      }else{
        updateTitle('Equipes · Terra Z');
        warnOnce('team:'+parsed.slug,'Equipe não encontrada neste link.');
        remember(parsed.route);
      }
      return parsed;
    }

    if(parsed.kind === 'city'){
      navigateSection('tab-transport','sub-cidades-externas');
      var city=findCityBySlug(parsed.slug);
      if(city){
        var cityRoute='/cidades/'+slugify(city.city);
        if(cityRoute !== parsed.route && options.canonicalize !== false) writeRoute(cityRoute,{replace:true});
        focusTarget(cityRoute);
        updateTitle(city.city);
        remember(cityRoute);
      }else{
        updateTitle('Cidades · Terra Z');
        warnOnce('city:'+parsed.slug,'Cidade não encontrada neste link.');
        remember(parsed.route);
      }
      return parsed;
    }

    if(parsed.kind === 'district'){
      navigateSection('tab-city','sub-distritos');
      var district=findDistrictBySlug(parsed.slug);
      if(district){
        var districtRoute='/distritos/'+slugify(district.id || district.name);
        if(districtRoute !== parsed.route && options.canonicalize !== false) writeRoute(districtRoute,{replace:true});
        focusTarget(districtRoute);
        updateTitle(district.name || 'Distrito');
        remember(districtRoute);
      }else{
        updateTitle('Distritos · Terra Z');
        warnOnce('district:'+parsed.slug,'Distrito não encontrado neste link.');
        remember(parsed.route);
      }
      return parsed;
    }

    warnOnce('route:'+parsed.route,'Este link não corresponde a uma área atual do Terra Z.');
    writeRoute('/capa',{replace:true,force:true});
    navigateSection('tab-home',null);
    updateTitle('Capa');
    remember('/capa');
    return parseRoute('/capa');
  } finally {
    applying=false;
  }
}

function applyLocation(options){
  options=options || {};
  var raw=String(location.hash || '').replace(/^#/,'').trim();
  var route=rawRouteFromLocation();

  if(!route){
    try { route=localStorage.getItem(STORAGE_KEY) || ''; }
    catch(error){ route=''; }
    if(!route) route='/capa';
    writeRoute(route,{replace:true,force:true});
  }else if(raw.indexOf('=') !== -1 || raw.charAt(0) !== '/'){
    writeRoute(route,{replace:true,force:true});
  }

  return applyRoute(route,options);
}

function scheduleApply(){
  if(scheduled) clearTimeout(scheduled);
  scheduled=setTimeout(function(){
    scheduled=null;
    decorateTargets();
    applyLocation({canonicalize:true});
  },35);
}

function go(route,options){
  options=options || {};
  route=normalizeRoute(route);
  writeRoute(route,{replace:!!options.replace,force:!!options.force});
  return applyRoute(route,{canonicalize:true});
}

function setSection(tab,sub,options){
  options=options || {};
  var route=routeForSection(tab,sub);
  writeRoute(route,{replace:!!options.replace});
  updateTitle(sectionEntry(tab,sub).title);
  return route;
}

function setCharacter(name,options){
  options=options || {};
  var route='/personagens/'+slugify(name);
  writeRoute(route,{replace:!!options.replace});
  updateTitle(name);
  return route;
}

function clearCharacter(options){
  options=options || {};
  var route='/universo/personagens';
  writeRoute(route,{replace:options.replace !== false});
  updateTitle('Universo · Personagens');
  return route;
}

function sessionRoute(id){
  return '/sessoes/'+encodePart(id);
}
function teamRoute(name){
  return '/equipes/'+slugify(name);
}
function cityRoute(name){
  return '/cidades/'+slugify(name);
}
function districtRoute(value){
  var district=findDistrictBySlug(value);
  return '/distritos/'+slugify(district ? (district.id || district.name) : value);
}

function openSession(id,options){ return go(sessionRoute(id),options); }
function openTeam(name,options){ return go(teamRoute(name),options); }
function openCity(name,options){ return go(cityRoute(name),options); }
function openDistrict(value,options){ return go(districtRoute(value),options); }

function routeForLocation(name){
  var district=findDistrictBySlug(name);
  if(district) return districtRoute(district.id || district.name);
  var city=findCityBySlug(name);
  if(city) return cityRoute(city.city);
  return '';
}

function openLocation(name,options){
  var route=routeForLocation(name);
  if(!route) return false;
  go(route,options);
  return true;
}

async function copyText(textValue){
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      await navigator.clipboard.writeText(textValue);
      return true;
    }
  }catch(error){}

  try{
    var input=document.createElement('input');
    input.value=textValue;
    input.setAttribute('readonly','readonly');
    input.style.position='fixed';
    input.style.opacity='0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
    return true;
  }catch(error){
    return false;
  }
}

async function copyRoute(route,label){
  route=normalizeRoute(route || rawRouteFromLocation() || routeForCurrentUi());
  var ok=await copyText(buildUrl(route));
  if(ok) showToast((label ? 'Link de '+label : 'Link atual')+' copiado.','success',2600);
  else showToast('Não foi possível copiar o link automaticamente.','warning',3500);
  return ok;
}

async function copyCurrentLink(){
  var route=rawRouteFromLocation() || routeForCurrentUi();
  return copyRoute(route,'navegação');
}

function routeForCurrentUi(){
  var tab=document.querySelector('.tab-content.active');
  if(!tab) return '/capa';
  var sub=tab.querySelector('.sidebar-item.active');
  return routeForSection(tab.id,sub ? sub.getAttribute('data-sub') : null);
}

function addCopyButton(container,route,label){
  if(!container || container.querySelector(':scope > .deep-link-copy')) return;

  var button=document.createElement('button');
  button.type='button';
  button.className='deep-link-copy';
  button.textContent='🔗';
  button.title='Copiar link direto para '+label;
  button.setAttribute('aria-label','Copiar link direto para '+label);
  button.addEventListener('click',function(event){
    event.preventDefault();
    event.stopPropagation();
    copyRoute(route,label);
  });
  container.appendChild(button);
}

function bindOpenTarget(node,route){
  if(!node || node.getAttribute('data-deep-bound') === '1') return;
  node.setAttribute('data-deep-bound','1');
  node.classList.add('deep-link-openable');
  if(!node.hasAttribute('tabindex')) node.setAttribute('tabindex','0');

  function activate(event){
    if(applying) return;
    if(event && event.target && event.target.closest && event.target.closest('button,a,input,select,textarea')) return;
    if(node.isContentEditable || (event && event.target && event.target.isContentEditable)) return;
    go(route);
  }

  node.addEventListener('click',activate);
  node.addEventListener('keydown',function(event){
    if(event.key === 'Enter'){
      event.preventDefault();
      activate(event);
    }
  });
}

function decorateDistricts(){
  var districts=window.TerraZData && window.TerraZData.districts;
  if(!Array.isArray(districts)) return;

  districts.forEach(function(district){
    if(!district) return;
    var route=districtRoute(district.id || district.name);
    var figure=document.querySelector('[data-district="'+String(district.id || '').replace(/"/g,'')+'"]');
    if(figure) figure.setAttribute('data-deep-route',route);

    var card=figure && figure.nextElementSibling && figure.nextElementSibling.classList.contains('card')
      ? figure.nextElementSibling
      : null;
    if(card){
      card.setAttribute('data-deep-route',route);
      card.classList.add('deep-link-card');
      addCopyButton(card,route,district.name || district.id || 'distrito');
      bindOpenTarget(card,route);
    }
  });
}

function decorateTable(bodyId,items,nameKey,routeBuilder){
  var body=document.getElementById(bodyId);
  if(!body || !Array.isArray(items)) return;
  var rows=body.querySelectorAll('tr');

  items.forEach(function(item,index){
    var row=rows[index];
    if(!row || !item) return;
    var name=String(item[nameKey] || '');
    if(!name) return;

    var route=routeBuilder(name);
    row.setAttribute('data-deep-route',route);
    row.classList.add('deep-link-row');

    var cell=row.cells && row.cells[0];
    if(cell){
      cell.classList.add('deep-link-name');
      cell.title='Abrir link permanente para '+name;
      bindOpenTarget(cell,route);
    }
  });
}

function decorateSessions(){
  document.querySelectorAll('.session-entry[data-session-id]').forEach(function(article){
    var id=article.getAttribute('data-session-id');
    if(!id) return;

    var route=sessionRoute(id);
    article.setAttribute('data-deep-route',route);

    var title=article.querySelector('.session-title-row h3');
    if(title){
      title.classList.add('deep-link-title');
      bindOpenTarget(title,route);
    }

    var titleRow=article.querySelector('.session-title-row');
    if(titleRow) addCopyButton(titleRow,route,(title && title.textContent) || 'sessão');
  });
}

function decorateTargets(){
  decorateDistricts();

  var cities=window.TerraZData && window.TerraZData.externalCities;
  decorateTable('externalCitiesBody',cities,'city',cityRoute);

  var teams=window.TerraZData && window.TerraZData.teams && window.TerraZData.teams.teams;
  decorateTable('teamsBody',teams,'name',teamRoute);

  decorateSessions();
}

function bindUi(){
  document.querySelectorAll('.tab-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(applying) return;

      var tab=btn.getAttribute('data-tab');
      var root=document.getElementById(tab);
      var activeSub=root && root.querySelector('.sidebar-item.active');
      var sub=activeSub ? activeSub.getAttribute('data-sub') : null;
      setSection(tab,sub);
      lastTabNavigation={tab:tab,at:Date.now()};
    });
  });

  document.querySelectorAll('.sidebar-item').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(applying) return;

      var parent=btn.closest('.tab-content');
      var tab=parent ? parent.id : null;
      var replace=!!(lastTabNavigation &&
        lastTabNavigation.tab === tab &&
        Date.now()-lastTabNavigation.at < 450);

      setSection(tab,btn.getAttribute('data-sub'),{replace:replace});
      lastTabNavigation=null;
    });
  });

  var copyButton=document.getElementById('copyRouteBtn');
  if(copyButton) copyButton.addEventListener('click',copyCurrentLink);
}

window.addEventListener('popstate',scheduleApply);
window.addEventListener('hashchange',scheduleApply);

[
  'terra-z:runtime-data-loaded',
  'terra-z:characters-rendered',
  'terra-z:sessions-rendered',
  'terra-z:auth-changed'
].forEach(function(name){
  document.addEventListener(name,scheduleApply);
});

window.TerraZApp.router = {
  slugify:slugify,
  applyHash:applyLocation,
  applyRoute:applyRoute,
  go:go,
  setSection:setSection,
  setCharacter:setCharacter,
  clearCharacter:clearCharacter,
  openSession:openSession,
  openTeam:openTeam,
  openCity:openCity,
  openDistrict:openDistrict,
  openLocation:openLocation,
  routeForLocation:routeForLocation,
  routeForSection:routeForSection,
  sessionRoute:sessionRoute,
  teamRoute:teamRoute,
  cityRoute:cityRoute,
  districtRoute:districtRoute,
  copyCurrentLink:copyCurrentLink,
  copyRoute:copyRoute,
  current:function(){ return rawRouteFromLocation() || routeForCurrentUi(); },
  isApplying:function(){ return applying; },
  refreshTargets:decorateTargets
};

bindUi();
decorateTargets();
setTimeout(function(){
  decorateTargets();
  applyLocation({canonicalize:true});
},0);

})();
