(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var core = window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/taxonomy-manager.js');

var showToast = core.showToast;
var showConfirm = core.showConfirm;
var escapeHtml = core.escapeHtml;
var escapeAttr = core.escapeAttr;

var draft = [];

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }

function taxonomy(){
  return (window.TerraZData && window.TerraZData.characterTaxonomy) || {
    nuclei:[],
    types:[],
    statuses:[],
    characters:{}
  };
}

function canEdit(){
  var b = backend();
  return !!(b && b.isConfigured && b.isConfigured() && b.isAuthenticated && b.isAuthenticated());
}

function slugify(value){
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,60);
}

function uniqueId(label){
  var base = slugify(label) || 'nucleo';
  if(base === 'all' || base === 'featured') base = 'grupo-' + base;

  var used = new Set(draft.map(function(item){ return item.id; }));
  var id = base;
  var suffix = 2;

  while(used.has(id)){
    id = base + '-' + suffix;
    suffix++;
  }

  return id;
}

function countCharacters(id){
  var all = taxonomy().characters || {};
  return Object.keys(all).filter(function(name){
    var meta = all[name] || {};
    return Array.isArray(meta.nuclei) && meta.nuclei.indexOf(id) !== -1;
  }).length;
}

function setStatus(message,state){
  var node = el('taxonomyManagerStatus');
  if(!node) return;
  node.textContent = message || '';
  node.setAttribute('data-state',state || 'idle');
}

function resetDraft(){
  var defs = Array.isArray(taxonomy().nuclei) ? taxonomy().nuclei : [];
  draft = defs.map(function(item){
    return {
      id:String(item && item.id || ''),
      label:String(item && item.label || '')
    };
  }).filter(function(item){ return item.id && item.label; });
}

function move(index,direction){
  var next = index + direction;
  if(index < 0 || next < 0 || index >= draft.length || next >= draft.length) return;

  var temp = draft[index];
  draft[index] = draft[next];
  draft[next] = temp;
  render();
  setStatus('Ordem alterada no rascunho. Salve para publicar.','warning');
}

function remove(index){
  var item = draft[index];
  if(!item || item.id === 'other') return;

  var count = countCharacters(item.id);
  var message = count
    ? '“' + item.label + '” está associado a ' + count + (count === 1 ? ' personagem.' : ' personagens.') +
      ' Ao salvar, esse vínculo será removido. Quem ficar sem outro núcleo passará para “Outros”.'
    : 'Excluir o núcleo “' + item.label + '”?';

  showConfirm(
    'Excluir núcleo',
    message,
    function(){
      draft.splice(index,1);
      render();
      setStatus('Núcleo removido do rascunho. Clique em “Salvar filtros” para publicar.','warning');
    },
    'Excluir núcleo'
  );
}

function updateLabel(index,value){
  if(!draft[index]) return;
  draft[index].label = String(value || '').slice(0,100);
  setStatus('Nome alterado no rascunho. Salve para publicar.','warning');
}

function render(){
  var root = el('taxonomyManagerList');
  if(!root) return;

  if(!draft.length){
    root.innerHTML = '<div class="taxonomy-manager-empty">Nenhum núcleo configurado.</div>';
    return;
  }

  root.innerHTML = draft.map(function(item,index){
    var count = countCharacters(item.id);
    var protectedItem = item.id === 'other';

    return '<div class="taxonomy-manager-row" data-taxonomy-index="' + index + '">' +
      '<div class="taxonomy-manager-order">' +
        '<button type="button" data-taxonomy-up="' + index + '"' + (index === 0 ? ' disabled' : '') + ' title="Mover para cima">↑</button>' +
        '<button type="button" data-taxonomy-down="' + index + '"' + (index === draft.length - 1 ? ' disabled' : '') + ' title="Mover para baixo">↓</button>' +
      '</div>' +
      '<div class="taxonomy-manager-main">' +
        '<input class="taxonomy-manager-label" data-taxonomy-label="' + index + '" type="text" maxlength="100" value="' + escapeAttr(item.label) + '">' +
        '<div class="taxonomy-manager-meta">' +
          '<code>' + escapeHtml(item.id) + '</code>' +
          '<span>' + count + (count === 1 ? ' personagem' : ' personagens') + '</span>' +
          (protectedItem ? '<span class="taxonomy-protected">fallback protegido</span>' : '') +
        '</div>' +
      '</div>' +
      '<button class="taxonomy-manager-delete" type="button" data-taxonomy-delete="' + index + '"' +
        (protectedItem ? ' disabled title="O núcleo Outros é o fallback do sistema"' : ' title="Excluir núcleo"') +
      '>🗑️</button>' +
    '</div>';
  }).join('');

  root.querySelectorAll('[data-taxonomy-up]').forEach(function(button){
    button.addEventListener('click',function(){
      move(Number(button.getAttribute('data-taxonomy-up')),-1);
    });
  });

  root.querySelectorAll('[data-taxonomy-down]').forEach(function(button){
    button.addEventListener('click',function(){
      move(Number(button.getAttribute('data-taxonomy-down')),1);
    });
  });

  root.querySelectorAll('[data-taxonomy-delete]').forEach(function(button){
    button.addEventListener('click',function(){
      remove(Number(button.getAttribute('data-taxonomy-delete')));
    });
  });

  root.querySelectorAll('[data-taxonomy-label]').forEach(function(input){
    input.addEventListener('input',function(){
      updateLabel(Number(input.getAttribute('data-taxonomy-label')),input.value);
    });
  });
}

function add(){
  var input = el('taxonomyManagerNewLabel');
  var label = input ? input.value.trim() : '';

  if(!label){
    showToast('Digite o nome do novo núcleo.','warning',3500);
    if(input) input.focus();
    return;
  }

  draft.push({id:uniqueId(label),label:label});

  if(input) input.value = '';
  render();
  setStatus('Novo núcleo adicionado ao rascunho. Salve para publicar.','warning');

  var root = el('taxonomyManagerList');
  if(root) root.scrollTop = root.scrollHeight;
}

function validate(){
  if(!draft.some(function(item){ return item.id === 'other'; })){
    return 'O núcleo “Outros” é obrigatório como fallback.';
  }

  var labels = new Set();

  for(var i=0;i<draft.length;i++){
    var label = String(draft[i].label || '').trim();

    if(!label) return 'Todos os núcleos precisam de um nome.';

    var key = label.toLocaleLowerCase('pt-BR');
    if(labels.has(key)) return 'Existem núcleos com o mesmo nome.';

    labels.add(key);
    draft[i].label = label;
  }

  return '';
}

async function save(){
  if(!canEdit()){
    showToast('Sua sessão de editor expirou.','warning',4500);
    close();
    return;
  }

  var problem = validate();
  if(problem){
    setStatus(problem,'error');
    showToast(problem,'warning',4500);
    return;
  }

  var button = el('taxonomyManagerSave');
  if(button){
    button.disabled = true;
    button.textContent = 'Salvando…';
  }

  setStatus('Salvando filtros e atualizando personagens…','working');

  try{
    var b = backend();
    var result = await b.request('/api/character',{
      method:'POST',
      body:{
        action:'update-taxonomy',
        nuclei:draft.map(function(item){
          return {id:item.id,label:item.label};
        })
      }
    });

    window.TerraZData = window.TerraZData || {};
    window.TerraZData.characterTaxonomy = result.taxonomy || taxonomy();

    resetDraft();
    render();
    setStatus('Filtros atualizados com sucesso.','success');

    var filters = window.TerraZApp && window.TerraZApp.characterFilters;
    if(filters && filters.refreshTaxonomy) filters.refreshTaxonomy();

    document.dispatchEvent(new CustomEvent('terra-z:taxonomy-changed',{
      detail:{
        taxonomy:window.TerraZData.characterTaxonomy,
        deleted:result.deleted || []
      }
    }));

    var runtime = window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh){
      runtime.refresh({force:true,bust:result.sha,silent:true});
    }

    var publishing = window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url){
      publishing.trackDeployment(result.status_url);
    }

    showToast('Filtros de personagens atualizados.','success',4000);
  }catch(error){
    console.error('Terra Z taxonomy manager:',error);
    setStatus(error.message || 'Não foi possível salvar os filtros.','error');
    showToast(error.message || 'Falha ao salvar filtros.','error',6000);
  }finally{
    if(button){
      button.disabled = false;
      button.textContent = '💾 Salvar filtros';
    }
  }
}

function open(){
  if(!canEdit()){
    showToast('Entre como editor para gerenciar filtros.','warning',4500);
    if(window.TerraZApp.adminPanel) window.TerraZApp.adminPanel.open();
    return;
  }

  resetDraft();
  render();
  setStatus('','idle');

  var input = el('taxonomyManagerNewLabel');
  if(input) input.value = '';

  var panel = el('taxonomyManagerPanel');
  if(panel) panel.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function close(){
  var panel = el('taxonomyManagerPanel');
  if(panel) panel.classList.remove('show');

  var keepLocked = !!document.querySelector(
    '#adminPanel.show,#fichaModal.show,.character-editor-panel.show,#presentationModal.show,#graphEditorModal.show'
  );
  document.body.style.overflow = keepLocked ? 'hidden' : '';
}

function setup(){
  var panel = el('taxonomyManagerPanel');
  var closeBtn = el('taxonomyManagerClose');
  var cancelBtn = el('taxonomyManagerCancel');
  var saveBtn = el('taxonomyManagerSave');
  var addBtn = el('taxonomyManagerAdd');
  var newLabel = el('taxonomyManagerNewLabel');

  if(closeBtn) closeBtn.addEventListener('click',close);
  if(cancelBtn) cancelBtn.addEventListener('click',close);
  if(saveBtn) saveBtn.addEventListener('click',save);
  if(addBtn) addBtn.addEventListener('click',add);

  if(newLabel){
    newLabel.addEventListener('keydown',function(event){
      if(event.key === 'Enter'){
        event.preventDefault();
        add();
      }
    });
  }

  if(panel){
    panel.addEventListener('click',function(event){
      if(event.target === panel) close();
    });
  }

  document.addEventListener('keydown',function(event){
    if(event.key === 'Escape' && panel && panel.classList.contains('show')){
      close();
    }
  });

  document.addEventListener('terra-z:runtime-data-loaded',function(){
    if(panel && panel.classList.contains('show')){
      resetDraft();
      render();
    }
  });

  document.addEventListener('terra-z:auth-changed',function(){
    if(panel && panel.classList.contains('show') && !canEdit()) close();
  });
}

setup();

window.TerraZApp.taxonomyManager = {
  open:open,
  close:close,
  refresh:function(){
    resetDraft();
    render();
  }
};

})();