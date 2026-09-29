(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/media-manager.js');

var showToast = core.showToast;
var currentCharacter = '';

function publishing(){
  return window.TerraZApp && window.TerraZApp.publishing;
}

function configured(){
  var pub = publishing();
  return !!(pub && pub.isConfigured && pub.isConfigured() && pub.apiUrl('media'));
}

function fileToDataUrl(file){
  return new Promise(function(resolve,reject){
    var reader = new FileReader();
    reader.onload = function(){ resolve(reader.result); };
    reader.onerror = function(){ reject(new Error('Não foi possível ler a imagem.')); };
    reader.readAsDataURL(file);
  });
}

async function upload(character,file){
  var pub = publishing();
  if(!configured()){
    showToast('Upload remoto ainda não está conectado ao backend seguro.','warning',5000);
    return;
  }

  if(!file) return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)){
    showToast('Use uma imagem PNG, JPEG ou WebP.','warning');
    return;
  }
  if(file.size > 3 * 1024 * 1024){
    showToast('A imagem deve ter no máximo 3 MB.','warning');
    return;
  }

  try {
    showToast('Preparando retrato de ' + character + '…','info',2500);
    var data = await fileToDataUrl(file);
    var response = await pub.authenticatedFetch(pub.apiUrl('media'), {
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({
        character:character,
        mime:file.type,
        data:data,
        alt:character,
        credit:''
      })
    });

    var result = await response.json().catch(function(){ return {}; });
    if(response.status === 401 && pub.clearEditorKey) pub.clearEditorKey();
    if(!response.ok) throw new Error(result.message || ('Erro HTTP ' + response.status));

    showToast('Retrato enviado. Aguardando publicação…','info',4000);
    var published = await pub.waitForDeployment(result.status_url);
    if(published){
      showToast('Retrato publicado com sucesso.','success',3500);
      setTimeout(function(){ location.reload(); },900);
    }else{
      showToast('Commit criado. O deploy ainda está processando.','info',5000);
    }
  } catch(err){
    console.error('Terra Z media upload:',err);
    showToast('Erro ao enviar retrato: ' + err.message,'error',6000);
  }
}

function ensureInput(){
  var input = document.getElementById('characterImageInput');
  if(input) return input;

  input = document.createElement('input');
  input.type = 'file';
  input.id = 'characterImageInput';
  input.accept = 'image/png,image/jpeg,image/webp';
  input.hidden = true;
  document.body.appendChild(input);

  input.addEventListener('change',function(){
    var file = input.files && input.files[0];
    var name = currentCharacter;
    input.value = '';
    if(file && name) upload(name,file);
  });

  return input;
}

function choose(character){
  currentCharacter = character || '';
  if(!currentCharacter) return;
  ensureInput().click();
}

ensureInput();

window.TerraZApp.mediaManager = {
  choose:choose,
  upload:upload,
  isConfigured:configured
};

})();
