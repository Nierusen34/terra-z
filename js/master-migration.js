(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/master-migration.js');

var showToast = core.showToast;
var showConfirm = core.showConfirm;

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }
function publishing(){ return window.TerraZApp && window.TerraZApp.publishing; }

function setStatus(text,state){
  var node=el('masterMigrationStatus');
  if(!node) return;
  node.textContent=text;
  node.setAttribute('data-state',state||'idle');
}

function setButtons(copyEnabled,finalizeEnabled){
  var copy=el('masterCopyBtn');
  var finalize=el('masterFinalizeBtn');
  if(copy) copy.disabled=!copyEnabled;
  if(finalize) finalize.disabled=!finalizeEnabled;
}

async function refresh(){
  var box=el('masterMigrationBox');
  var b=backend();
  var authenticated=!!(b && b.isConfigured && b.isConfigured() && b.isAuthenticated && b.isAuthenticated());

  if(box) box.hidden=!authenticated;
  if(!authenticated){
    setButtons(false,false);
    return;
  }

  setButtons(true,false);
  setStatus('Verificando conteúdo privado…','working');

  try {
    var health=await b.health();
    if(health.master_content==='ready'){
      var state=await b.request('/api/master-template',{method:'GET'});
      if(state.secrets===0){
        setStatus('Migração concluída. Os segredos já estão fora do bundle público e permanecem no MASTER_CONTENT_JSON privado.','success');
        setButtons(false,false);
      } else {
        setStatus('MASTER_CONTENT_JSON válido. Já é seguro finalizar a migração.','ready');
        setButtons(true,true);
      }
    } else if(health.master_content==='invalid'){
      setStatus('MASTER_CONTENT_JSON existe, mas contém JSON inválido.','error');
      setButtons(true,false);
    } else {
      setStatus('1. Copie o JSON Mestre; 2. cole em MASTER_CONTENT_JSON na Vercel; 3. faça redeploy.','setup');
      setButtons(true,false);
    }
  } catch(err){
    console.error('Terra Z master health:',err);
    setStatus('Não foi possível verificar o estado do conteúdo Mestre.','error');
  }
}

async function copyText(value){
  if(navigator.clipboard && navigator.clipboard.writeText){
    await navigator.clipboard.writeText(value);
    return;
  }
  var area=document.createElement('textarea');
  area.value=value;
  area.style.position='fixed';
  area.style.opacity='0';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

async function copyTemplate(){
  var b=backend();
  if(!b || !b.isAuthenticated()){
    showToast('Faça login como editor para preparar o conteúdo Mestre.','warning');
    return;
  }

  var btn=el('masterCopyBtn');
  if(btn) btn.disabled=true;
  setStatus('Gerando JSON Mestre…','working');

  try {
    var result=await b.request('/api/master-template',{method:'GET'});
    if(result.secrets===0){
      setStatus('Migração concluída. Não há mais segredos públicos para copiar. Mantenha o MASTER_CONTENT_JSON atual da Vercel.','success');
      setButtons(false,false);
      showToast('Migração já concluída. O JSON Mestre privado atual deve ser mantido.','info',6000);
      return;
    }
    var payload=JSON.stringify(result.content);
    await copyText(payload);
    setStatus('JSON copiado: '+result.secrets+' segredos de '+result.characters+' personagens. Cole em MASTER_CONTENT_JSON na Vercel e faça redeploy.','success');
    showToast('MASTER_CONTENT_JSON copiado para a área de transferência.','success',6000);
  } catch(err){
    console.error('Terra Z master template:',err);
    setStatus(err.message || 'Falha ao gerar conteúdo Mestre.','error');
    showToast(err.message || 'Falha ao gerar conteúdo Mestre.','error',6000);
  } finally {
    if(btn) btn.disabled=false;
  }
}

async function performFinalize(){
  var b=backend();
  var p=publishing();
  var btn=el('masterFinalizeBtn');
  if(btn) btn.disabled=true;
  setStatus('Validando cópia privada e criando commit…','working');

  try {
    var result=await b.request('/api/master-finalize',{method:'POST',body:{}});
    if(result.already_migrated){
      setStatus('Os segredos já não estão mais no bundle público.','success');
      showToast('Migração privada já estava concluída.','success');
      return;
    }

    setStatus('Commit criado. Aguardando GitHub Pages…','working');
    var published=(p && p.waitForDeployment && result.status_url)
      ? await p.waitForDeployment(result.status_url)
      : null;

    if(published){
      setStatus('Migração concluída: '+result.secrets+' segredos removidos do bundle público.','success');
      showToast('Conteúdo Mestre migrado com segurança.','success',6000);
      setTimeout(function(){ location.reload(); },1200);
    } else {
      setStatus('Commit criado; o deploy ainda está processando.','working');
      showToast('A remoção foi commitada; o deploy ainda está processando.','info',6000);
    }
  } catch(err){
    console.error('Terra Z master finalize:',err);
    setStatus(err.message || 'Falha ao finalizar migração.','error');
    showToast(err.message || 'Falha ao finalizar migração.','error',7000);
  } finally {
    if(btn) btn.disabled=false;
  }
}

function finalize(){
  showConfirm(
    'Finalizar conteúdo Mestre',
    'Isso removerá os segredos das fichas do bundle público somente se MASTER_CONTENT_JSON contiver uma cópia idêntica. Continuar?',
    performFinalize,
    'Finalizar migração'
  );
}

function setup(){
  var copy=el('masterCopyBtn');
  var finalizeBtn=el('masterFinalizeBtn');
  if(copy) copy.addEventListener('click',copyTemplate);
  if(finalizeBtn) finalizeBtn.addEventListener('click',finalize);
  document.addEventListener('terra-z:auth-changed',refresh);
  refresh();
}

setup();

window.TerraZApp.masterMigration={
  refresh:refresh,
  copyTemplate:copyTemplate,
  finalize:finalize
};

})();
