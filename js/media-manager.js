(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/media-manager.js');

var showToast = core.showToast;
var showConfirm = core.showConfirm;

function backend(){ return window.TerraZApp && window.TerraZApp.backend; }
function publishing(){ return window.TerraZApp && window.TerraZApp.publishing; }

function canUpload(){
  var b = backend();
  return !!(b && b.isConfigured() && b.isAuthenticated());
}

function readDataUrl(file){
  return new Promise(function(resolve,reject){
    var reader = new FileReader();
    reader.onload = function(){ resolve(reader.result); };
    reader.onerror = function(){ reject(new Error('Não foi possível ler a imagem.')); };
    reader.readAsDataURL(file);
  });
}

async function upload(character,file){
  var b = backend();
  if(!b || !b.isConfigured()) throw new Error('Backend ainda não configurado.');
  if(!b.isAuthenticated()) throw new Error('Faça login como editor antes de enviar uma imagem.');

  if(!file) throw new Error('Selecione uma imagem.');
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('Use PNG, JPEG ou WebP.');
  if(file.size > 2 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 2 MB.');

  var dataUrl = await readDataUrl(file);
  var result = await b.request('/api/media',{
    method:'POST',
    body:{
      character:character,
      mimeType:file.type,
      contentBase64:dataUrl,
      alt:character,
      credit:''
    }
  });

  showToast('Retrato enviado. Aguardando publicação…','info',5000);

  var p = publishing();
  if(p && p.waitForDeployment && result.status_url){
    var ok = await p.waitForDeployment(result.status_url);
    if(ok){
      showToast('Retrato publicado com sucesso','success',5000);
      setTimeout(function(){ location.reload(); },1000);
    } else {
      showToast('Retrato enviado; o deploy ainda está processando.','info',5000);
    }
  }

  return result;
}

function choose(character){
  if(!canUpload()){
    showToast('Entre como editor no painel Publicar para enviar retratos.','warning',5000);
    if(window.TerraZApp.publishing) window.TerraZApp.publishing.open();
    return;
  }

  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/webp';
  input.style.display = 'none';
  document.body.appendChild(input);

  input.onchange = function(){
    var file = input.files && input.files[0];
    if(!file){ input.remove(); return; }

    showConfirm(
      'Atualizar retrato',
      'Publicar "' + file.name + '" como retrato de ' + character + '?',
      function(){
        upload(character,file).catch(function(err){
          console.error(err);
          showToast(err.message || 'Falha ao enviar retrato','error',6000);
        }).finally(function(){ input.remove(); });
      },
      'Enviar imagem'
    );
  };

  input.click();
}

window.TerraZApp.mediaManager = {
  canUpload:canUpload,
  choose:choose,
  upload:upload
};

})();