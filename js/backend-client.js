(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var SESSION_KEY = 'terraZ_editor_session';

function config(){
  return (window.TerraZConfig && window.TerraZConfig.publishing) || {};
}

function baseUrl(){
  return String(config().apiBase || '').replace(/\/+$/,'');
}

function isConfigured(){
  return !!(config().enabled && baseUrl());
}

function getToken(){
  try { return sessionStorage.getItem(SESSION_KEY) || ''; }
  catch(e){ return ''; }
}

function isAuthenticated(){
  return !!getToken();
}

function setToken(token){
  try {
    if(token) sessionStorage.setItem(SESSION_KEY, token);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch(e){}
  document.dispatchEvent(new CustomEvent('terra-z:auth-changed'));
}

function endpoint(path){
  if(/^https?:\/\//i.test(path)) return path;
  return baseUrl() + (path.charAt(0) === '/' ? path : '/' + path);
}

async function request(path, options, requireAuth){
  if(requireAuth === undefined) requireAuth = true;
  if(!isConfigured()) throw new Error('Backend de publicação ainda não configurado.');

  options = options || {};
  var headers = Object.assign({'Accept':'application/json'}, options.headers || {});

  if(options.body && typeof options.body !== 'string'){
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  if(requireAuth){
    var token = getToken();
    if(!token) throw new Error('Faça login como editor para continuar.');
    headers['Authorization'] = 'Bearer ' + token;
  }

  var response = await fetch(endpoint(path), Object.assign({}, options, {headers:headers}));
  var result = await response.json().catch(function(){ return {}; });

  if(response.status === 401){
    setToken('');
    throw new Error(result.message || 'Sessão de editor expirada.');
  }
  if(!response.ok){
    var error = new Error(result.message || ('Erro HTTP ' + response.status));
    error.status = response.status;
    error.payload = result;
    throw error;
  }

  return result;
}

async function login(password){
  var result = await request('/api/login',{
    method:'POST',
    body:{password:password}
  },false);
  if(!result.token) throw new Error('O servidor não retornou uma sessão válida.');
  setToken(result.token);
  return result;
}

function logout(){
  setToken('');
}

async function health(){
  return request('/api/health',{method:'GET'},false);
}

async function publicJson(url){
  var response = await fetch(endpoint(url),{headers:{'Accept':'application/json'}});
  var result = await response.json().catch(function(){ return {}; });
  if(!response.ok) throw new Error(result.message || ('Erro HTTP ' + response.status));
  return result;
}

window.TerraZApp.backend = {
  isConfigured:isConfigured,
  isAuthenticated:isAuthenticated,
  login:login,
  logout:logout,
  request:request,
  health:health,
  publicJson:publicJson,
  endpoint:endpoint
};

})();
