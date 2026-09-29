(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/publishing.js');

var showToast = core.showToast;

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }
function editor(){ return window.TerraZApp && window.TerraZApp.editor; }

function setStatus(text,state){
  var node = el('publishStatus');
  if(!node) return;
  node.textContent = text;
  node.setAttribute('data-state',state || 'idle');
}

function pending(){
  var e = editor();
  return e && e.getPendingChanges ? e.getPendingChanges() : {};
}

function refresh(){
  var b = backend();
  var changes = pending();
  var count = Object.keys(changes).length;
  var configured = !!(b && b.isConfigured());
  var authenticated = !!(b && b.isAuthenticated());

  if(el('publishCount')) el('publishCount').textContent = String(count);
  if(el('publishSubmitBtn')) el('publishSubmitBtn').disabled = count === 0 || !configured || !authenticated;

  var loggedOut = el('publishLoggedOut');
  var loggedIn = el('publishLoggedIn');
  if(loggedOut) loggedOut.hidden = !configured || authenticated;
  if(loggedIn) loggedIn.hidden = !configured || !authenticated;

  if(!configured) setStatus('Backend seguro ainda não conectado', 'setup');
  else if(!authenticated) setStatus('Faça login como editor para publicar', 'setup');
  else if(count === 0) setStatus('Nenhuma alteração pendente', 'idle');
  else setStatus(count + (count === 1 ? ' alteração pronta para publicar' : ' alterações prontas para publicar'),'ready');
}

function openPanel(){
  var panel = el('publishPanel');
  if(!panel) return;
  panel.classList.add('show');
  document.body.style.overflow = 'hidden';
  refresh();
}

function closePanel(){
  var panel = el('publishPanel');
  if(panel) panel.classList.remove('show');
  document.body.style.overflow = '';
}

async function login(){
  var b = backend();
  var input = el('publishPassword');
  if(!b || !b.isConfigured()) return setStatus('Backend seguro ainda não conectado','setup');
  var password = input ? input.value : '';
  if(!password) return setStatus('Informe a senha do editor','error');

  try {
    setStatus('Autenticando…','working');
    await b.login(password);
    if(input) input.value = '';
    showToast('Editor autenticado', 'success');
    refresh();
  } catch(err){
    setStatus(err.message,'error');
  }
}

function logout(){
  var b = backend();
  if(b) b.logout();
  refresh();
  showToast('Sessão de editor encerrada','info');
}

function buildPayload(){
  var changes = pending();
  var e = editor();
  var ids = Object.keys(changes);
  var messageInput = el('publishMessage');
  var message = messageInput ? messageInput.value.trim() : '';

  return {
    schema:'terra-z-publish-v1',
    type:'content-overrides',
    message:message || 'content: atualizar conteúdo pelo editor do Terra Z',
    changes:changes,
    base:e && e.getPublishedBaseline ? e.getPublishedBaseline(ids) : {},
    client:{url:location.href,timestamp:new Date().toISOString()}
  };
}

async function waitForDeployment(statusUrl){
  if(!statusUrl) return null;
  var b = backend();
  for(var attempt=0; attempt<35; attempt++){
    await new Promise(function(resolve){ setTimeout(resolve,2000); });
    var result = await b.publicJson(statusUrl);
    if(result.status === 'published' || result.status === 'success') return true;
    if(result.status === 'failed' || result.status === 'error') throw new Error(result.message || 'Falha no deploy.');
  }
  return false;
}

async function publish(){
  var b = backend();
  var changes = pending();

  if(!Object.keys(changes).length){
    showToast('Nenhuma alteração pendente para publicar','warning');
    return;
  }
  if(!b || !b.isConfigured()){
    openPanel();
    return setStatus('Backend seguro ainda não conectado','setup');
  }
  if(!b.isAuthenticated()){
    openPanel();
    return setStatus('Faça login como editor para continuar','setup');
  }

  var btn = el('publishSubmitBtn');
  if(btn) btn.disabled = true;
  setStatus('Enviando alterações…','working');

  try {
    var result = await b.request('/api/publish',{method:'POST',body:buildPayload()});
    setStatus('Commit criado. Aguardando GitHub Pages…','working');

    var published = await waitForDeployment(result.status_url);
    if(published === null || published === false){
      setStatus('Commit criado; deploy ainda está processando','working');
      showToast('Commit criado. O rascunho local foi preservado até a confirmação do deploy.','info',6000);
      return;
    }

    var e = editor();
    var remaining = e && e.markPublished ? e.markPublished(changes) : 0;
    setStatus(remaining ? 'Publicado; há novas alterações locais' : 'Publicado com sucesso','success');
    showToast(remaining ? 'Publicado. Novas edições locais foram preservadas.' : 'Alterações publicadas no Terra Z','success',5000);
    setTimeout(function(){ location.reload(); },1200);
  } catch(err){
    console.error('Terra Z publish:',err);
    setStatus(err.message || 'Falha ao publicar','error');
    showToast('Erro ao publicar: ' + (err.message || 'falha desconhecida'),'error',6000);
    if(btn) btn.disabled = false;
  }
}

function setup(){
  var pairs = [
    ['publishBtn',openPanel],
    ['publishClose',closePanel],
    ['publishCancelBtn',closePanel],
    ['publishSubmitBtn',publish],
    ['publishLoginBtn',login],
    ['publishLogoutBtn',logout]
  ];
  pairs.forEach(function(pair){
    var node = el(pair[0]);
    if(node) node.addEventListener('click',pair[1]);
  });

  var input = el('publishPassword');
  if(input) input.addEventListener('keydown',function(e){ if(e.key === 'Enter') login(); });

  var panel = el('publishPanel');
  if(panel) panel.addEventListener('click',function(e){ if(e.target === panel) closePanel(); });

  document.addEventListener('terra-z:edits-changed',refresh);
  document.addEventListener('terra-z:auth-changed',refresh);
  refresh();
}

setup();

window.TerraZApp.publishing = {
  open:openPanel,
  close:closePanel,
  refresh:refresh,
  publish:publish,
  waitForDeployment:waitForDeployment,
  isConfigured:function(){ var b=backend(); return !!(b && b.isConfigured()); }
};

})();
