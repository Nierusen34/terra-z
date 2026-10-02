(function(){
"use strict";

window.TerraZApp=window.TerraZApp||{};
var core=window.TerraZCore;
if(!core) throw new Error("Terra Z: núcleo não carregado antes de js/taxonomy-manager.js");

var showToast=core.showToast;
var showConfirm=core.showConfirm;
var escapeHtml=core.escapeHtml;
var escapeAttr=core.escapeAttr;
var foundation=window.TerraZApp.adminFoundation||{};

var activeKind="nuclei";
var draft={nuclei:[],types:[],statuses:[],tags:[]};
var capability=null;

var DEFINITIONS={
  nuclei:{label:"Núcleos",singular:"núcleo",icon:"🧭",required:"other",help:"Agrupamentos narrativos usados nos chips e filtros de personagens."},
  types:{label:"Tipos",singular:"tipo",icon:"🎭",required:"other",help:"Classificação geral do personagem, como herói, vilão, NPC ou protagonista."},
  statuses:{label:"Status",singular:"status",icon:"📌",required:"unknown",help:"Estado atual do personagem na campanha."},
  tags:{label:"Tags",singular:"tag",icon:"🏷️",required:"",help:"Etiquetas livres para organização, busca e edição em lote."}
};

function el(id){return document.getElementById(id);}
function backend(){return window.TerraZApp&&window.TerraZApp.backend;}
function taxonomy(){
  var value=window.TerraZData&&window.TerraZData.characterTaxonomy;
  return value&&typeof value==="object"?value:{nuclei:[],types:[],statuses:[],tags:[],characters:{}};
}
function canEdit(){
  var b=backend();
  return !!(b&&b.isConfigured&&b.isConfigured()&&b.isAuthenticated&&b.isAuthenticated());
}

async function supported(force){
  if(force) capability=null;
  if(capability!==null) return capability;
  var b=backend();
  if(!b||!b.health) return false;
  try{
    var health=await b.health();
    capability=!!(health&&health.taxonomy_manager_v2===true);
  }catch(error){
    capability=false;
  }
  return capability;
}
function slugify(value){
  if(foundation.slugify) return foundation.slugify(value);
  return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60);
}
function cloneRows(kind){
  return (Array.isArray(taxonomy()[kind])?taxonomy()[kind]:[]).map(function(item){
    return {id:String(item&&item.id||""),label:String(item&&item.label||"")};
  }).filter(function(item){return item.id&&item.label;});
}
function resetDraft(){
  Object.keys(DEFINITIONS).forEach(function(kind){draft[kind]=cloneRows(kind);});
}
function current(){return draft[activeKind]||[];}
function definition(){return DEFINITIONS[activeKind]||DEFINITIONS.nuclei;}
function metaUses(meta,kind,id){
  meta=meta||{};
  if(kind==="nuclei") return Array.isArray(meta.nuclei)&&meta.nuclei.indexOf(id)!==-1;
  if(kind==="tags") return Array.isArray(meta.tags)&&meta.tags.indexOf(id)!==-1;
  if(kind==="types") return meta.type===id;
  if(kind==="statuses") return meta.status===id;
  return false;
}
function countUse(kind,id){
  var all=taxonomy().characters||{};
  var names=new Set();
  Object.keys(all).forEach(function(name){
    if(metaUses(all[name],kind,id)) names.add(name);
  });

  var p=window.TerraZApp&&window.TerraZApp.privateContent;
  if(p&&p.getPrivateCharacterNames&&p.getCharacterProfile){
    p.getPrivateCharacterNames().forEach(function(name){
      var profile=p.getCharacterProfile(name);
      if(profile&&metaUses(profile.meta,kind,id)) names.add(name);
    });
  }
  return names.size;
}
function uniqueId(label){
  var base=slugify(label)||activeKind.slice(0,-1)||"categoria";
  if(activeKind==="nuclei"&&(base==="all"||base==="featured")) base="grupo-"+base;
  var used=new Set(current().map(function(item){return item.id;}));
  var id=base,suffix=2;
  while(used.has(id)){id=base+"-"+suffix;suffix++;}
  return id;
}
function setStatus(message,state){
  var node=el("taxonomyManagerStatus");
  if(!node)return;
  node.textContent=message||"";
  node.setAttribute("data-state",state||"idle");
}
function renderTabs(){
  var root=el("taxonomyManagerTabs");
  if(!root)return;
  root.innerHTML=Object.keys(DEFINITIONS).map(function(kind){
    var def=DEFINITIONS[kind];
    return '<button type="button" class="taxonomy-kind-tab'+(kind===activeKind?" active":"")+'" data-taxonomy-kind="'+kind+'">'+
      '<span>'+def.icon+" "+escapeHtml(def.label)+'</span><strong>'+String((draft[kind]||[]).length)+'</strong></button>';
  }).join("");
  root.querySelectorAll("[data-taxonomy-kind]").forEach(function(btn){
    btn.addEventListener("click",function(){
      activeKind=btn.getAttribute("data-taxonomy-kind")||"nuclei";
      render();
    });
  });
}
function move(index,direction){
  var list=current(),next=index+direction;
  if(index<0||next<0||index>=list.length||next>=list.length)return;
  var tmp=list[index];list[index]=list[next];list[next]=tmp;
  renderList();setStatus("Ordem alterada no rascunho. Salve para publicar.","warning");
}
function remove(index){
  var list=current(),item=list[index],def=definition();
  if(!item||item.id===def.required)return;
  var count=countUse(activeKind,item.id);
  var replacement=def.required?(" Vínculos inválidos serão convertidos para “"+def.required+"”."):" Vínculos serão removidos.";
  showConfirm(
    "Excluir "+def.singular,
    "Excluir “"+item.label+"”? "+count+" "+(count===1?"personagem usa":"personagens usam")+" esta categoria."+replacement,
    function(){list.splice(index,1);renderList();renderTabs();setStatus("Categoria removida do rascunho. Salve para publicar.","warning");},
    "Excluir"
  );
}
function add(){
  var input=el("taxonomyManagerNewLabel");
  var label=input?input.value.trim():"";
  if(!label){showToast("Digite um nome para a nova categoria.","warning",3500);if(input)input.focus();return;}
  current().push({id:uniqueId(label),label:label.slice(0,100)});
  if(input)input.value="";
  renderList();renderTabs();setStatus("Categoria adicionada ao rascunho. Salve para publicar.","warning");
}
function renderList(){
  var root=el("taxonomyManagerList");
  var help=el("taxonomyManagerHelp");
  var add=el("taxonomyManagerAdd");
  var input=el("taxonomyManagerNewLabel");
  if(help)help.textContent=definition().help;
  if(add)add.textContent="＋ Adicionar "+definition().singular;
  if(input)input.placeholder="Nome do novo "+definition().singular;
  if(!root)return;

  var list=current();
  if(!list.length){root.innerHTML='<div class="taxonomy-manager-empty">Nenhuma categoria configurada.</div>';return;}

  root.innerHTML=list.map(function(item,index){
    var count=countUse(activeKind,item.id);
    var locked=item.id===definition().required;
    return '<div class="taxonomy-manager-row" data-taxonomy-index="'+index+'">'+
      '<div class="taxonomy-manager-order">'+
        '<button type="button" data-up="'+index+'"'+(index===0?" disabled":"")+'>↑</button>'+
        '<button type="button" data-down="'+index+'"'+(index===list.length-1?" disabled":"")+'>↓</button>'+
      '</div>'+
      '<div class="taxonomy-manager-main">'+
        '<input data-label="'+index+'" type="text" maxlength="100" value="'+escapeAttr(item.label)+'">'+
        '<div class="taxonomy-manager-meta"><code>'+escapeHtml(item.id)+'</code><span>'+count+" "+(count===1?"uso":"usos")+'</span>'+
          (locked?'<span class="taxonomy-protected">fallback protegido</span>':"")+
        '</div>'+
      '</div>'+
      '<button class="taxonomy-manager-delete" data-delete="'+index+'" type="button"'+(locked?' disabled title="Categoria de fallback do sistema"':"")+'>🗑️</button>'+
    '</div>';
  }).join("");

  root.querySelectorAll("[data-up]").forEach(function(btn){btn.addEventListener("click",function(){move(Number(btn.dataset.up),-1);});});
  root.querySelectorAll("[data-down]").forEach(function(btn){btn.addEventListener("click",function(){move(Number(btn.dataset.down),1);});});
  root.querySelectorAll("[data-delete]").forEach(function(btn){btn.addEventListener("click",function(){remove(Number(btn.dataset.delete));});});
  root.querySelectorAll("[data-label]").forEach(function(input){input.addEventListener("input",function(){
    var item=current()[Number(input.dataset.label)];if(item)item.label=input.value.slice(0,100);
    setStatus("Nome alterado no rascunho. Salve para publicar.","warning");
  });});
}
function render(){renderTabs();renderList();}
function validate(){
  var requirements={nuclei:"other",types:"other",statuses:"unknown"};
  for(var kind of Object.keys(DEFINITIONS)){
    var list=draft[kind]||[],labels=new Set(),ids=new Set();
    if(requirements[kind]&&!list.some(function(item){return item.id===requirements[kind];})) return "A categoria protegida “"+requirements[kind]+"” é obrigatória.";
    for(var item of list){
      item.label=String(item.label||"").trim();
      if(!item.id||!item.label)return "Todas as categorias precisam de nome.";
      var labelKey=item.label.toLocaleLowerCase("pt-BR");
      if(labels.has(labelKey)||ids.has(item.id))return "Existem categorias duplicadas em "+DEFINITIONS[kind].label+".";
      labels.add(labelKey);ids.add(item.id);
    }
  }
  return "";
}
async function save(){
  if(!canEdit()){showToast("Sua sessão de editor expirou.","warning",4500);close();return;}
  if(!(await supported(false))){
    showToast("Publique o checkpoint atual para ativar Taxonomias v2 no backend.","warning",6500);
    return;
  }
  var problem=validate();
  if(problem){setStatus(problem,"error");showToast(problem,"warning",4500);return;}
  var button=el("taxonomyManagerSave");
  if(button){button.disabled=true;button.textContent="Salvando…";}
  setStatus("Atualizando taxonomias e reconciliando personagens…","working");
  try{
    var result=await backend().request("/api/character",{method:"POST",body:{
      action:"update-taxonomy",
      nuclei:draft.nuclei,types:draft.types,statuses:draft.statuses,tags:draft.tags
    }});
    window.TerraZData=window.TerraZData||{};
    window.TerraZData.characterTaxonomy=result.taxonomy||taxonomy();
    resetDraft();render();setStatus("Taxonomias atualizadas com sucesso.","success");
    var filters=window.TerraZApp&&window.TerraZApp.characterFilters;
    if(filters&&filters.refreshTaxonomy)filters.refreshTaxonomy();
    document.dispatchEvent(new CustomEvent("terra-z:taxonomy-changed",{detail:{taxonomy:window.TerraZData.characterTaxonomy}}));
    var runtime=window.TerraZApp&&window.TerraZApp.runtimeData;
    if(runtime&&runtime.refresh)await runtime.refresh({force:true,bust:result.sha,silent:true});
    var publishing=window.TerraZApp&&window.TerraZApp.publishing;
    if(publishing&&publishing.trackDeployment&&result.status_url)publishing.trackDeployment(result.status_url);
    showToast("Organização do universo atualizada.","success",4200);
  }catch(error){
    console.error("Terra Z taxonomy manager:",error);
    setStatus(error.message||"Falha ao salvar taxonomias.","error");
    showToast(error.message||"Falha ao salvar taxonomias.","error",6000);
  }finally{
    if(button){button.disabled=false;button.textContent="💾 Salvar taxonomias";}
  }
}
async function open(){
  if(!canEdit()){showToast("Entre como editor para gerenciar taxonomias.","warning",4500);return;}
  if(!(await supported(false))){
    showToast("Taxonomias v2 aguardam o novo checkpoint da Vercel.","warning",6500);
    return;
  }
  var p=window.TerraZApp&&window.TerraZApp.privateContent;
  if(p&&p.load) await p.load();
  resetDraft();render();setStatus("","idle");
  var panel=el("taxonomyManagerPanel");if(panel)panel.classList.add("show");
  document.body.style.overflow="hidden";
}
function close(){
  var panel=el("taxonomyManagerPanel");if(panel)panel.classList.remove("show");
  var keep=!!document.querySelector("#adminPanel.show,#fichaModal.show,.character-editor-panel.show,#presentationModal.show,#graphEditorModal.show,#bulkEditorPanel.show,#masterQuickPanel.show");
  document.body.style.overflow=keep?"hidden":"";
}
function setup(){
  [["taxonomyManagerClose",close],["taxonomyManagerCancel",close],["taxonomyManagerSave",save],["taxonomyManagerAdd",add]].forEach(function(row){
    var node=el(row[0]);if(node)node.addEventListener("click",row[1]);
  });
  var input=el("taxonomyManagerNewLabel");if(input)input.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();add();}});
  var panel=el("taxonomyManagerPanel");if(panel)panel.addEventListener("click",function(e){if(e.target===panel)close();});
  document.addEventListener("terra-z:runtime-data-loaded",function(){if(panel&&panel.classList.contains("show")){resetDraft();render();}});
  document.addEventListener("terra-z:auth-changed",function(){
    capability=null;
    if(panel&&panel.classList.contains("show")&&!canEdit())close();
  });
}
setup();
window.TerraZApp.taxonomyManager={open:open,close:close,refresh:function(){resetDraft();render();}};
})();