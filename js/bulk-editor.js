(function(){
"use strict";

window.TerraZApp=window.TerraZApp||{};
var core=window.TerraZCore;
if(!core) throw new Error("Terra Z: núcleo não carregado antes de js/bulk-editor.js");

var showToast=core.showToast;
var escapeHtml=core.escapeHtml;
var escapeAttr=core.escapeAttr;
var foundation=window.TerraZApp.adminFoundation;
var selection=foundation&&foundation.createSelection
  ? foundation.createSelection({eventName:"terra-z:bulk-selection-changed"})
  : null;
var capability=null;

function el(id){return document.getElementById(id);}
function backend(){return window.TerraZApp&&window.TerraZApp.backend;}
function taxonomy(){
  return (window.TerraZData&&window.TerraZData.characterTaxonomy)||{nuclei:[],types:[],statuses:[],tags:[],characters:{}};
}
function privateApi(){return window.TerraZApp&&window.TerraZApp.privateContent;}
function charactersApi(){return window.TerraZApp&&window.TerraZApp.characters;}
function authenticated(){
  var b=backend();
  return !!(b&&b.isAuthenticated&&b.isAuthenticated());
}

async function supported(force){
  if(force) capability=null;
  if(capability!==null) return capability;
  var b=backend();
  if(!b||!b.health) return false;
  try{
    var health=await b.health();
    capability=!!(health&&health.bulk_editor_v1===true);
  }catch(error){
    capability=false;
  }
  return capability;
}
function label(list,id){
  var item=(Array.isArray(list)?list:[]).find(function(row){return row&&row.id===id;});
  return item?item.label:(id||"—");
}
function metaFor(name){
  var tax=taxonomy(),publicMeta=tax.characters&&tax.characters[name];
  if(publicMeta) return {...publicMeta,private:false,tags:Array.isArray(publicMeta.tags)?publicMeta.tags:[]};
  var p=privateApi();
  var profile=p&&p.getCharacterProfile?p.getCharacterProfile(name):null;
  var meta=profile&&profile.meta&&typeof profile.meta==="object"?profile.meta:{};
  return {
    ...meta,
    featured:meta.featured===true,
    nuclei:Array.isArray(meta.nuclei)?meta.nuclei:[],
    tags:Array.isArray(meta.tags)?meta.tags:[],
    type:meta.type||"other",
    status:meta.status||"unknown",
    visibility:"master",
    private:true
  };
}
function rows(){
  var api=charactersApi();
  var names=api&&api.names?api.names():Object.keys(taxonomy().characters||{});
  return names.sort(function(a,b){return a.localeCompare(b,"pt-BR");}).map(function(name){
    return {name:name,meta:metaFor(name)};
  });
}
function searchText(row){
  var tax=taxonomy(),meta=row.meta;
  return [
    row.name,
    label(tax.types,meta.type),
    label(tax.statuses,meta.status),
    (meta.nuclei||[]).map(function(id){return label(tax.nuclei,id);}).join(" "),
    (meta.tags||[]).map(function(id){return label(tax.tags,id);}).join(" ")
  ].join(" ");
}
function visibleRows(){
  var all=rows(),term=el("bulkEditorSearch")?el("bulkEditorSearch").value:"";
  var nucleus=el("bulkEditorNucleusFilter")?el("bulkEditorNucleusFilter").value:"all";
  if(foundation&&foundation.filterRows){
    return foundation.filterRows(all,{
      search:term,
      fields:[searchText],
      predicates:[function(row){return nucleus==="all"||(row.meta.nuclei||[]).indexOf(nucleus)!==-1;}]
    });
  }
  return all;
}
function fillSelect(id,defs,placeholder){
  var node=el(id);if(!node)return;
  var previous=node.value;
  node.innerHTML='<option value="">'+escapeHtml(placeholder||"Não alterar")+'</option>'+
    (defs||[]).map(function(item){return '<option value="'+escapeAttr(item.id)+'">'+escapeHtml(item.label)+'</option>';}).join("");
  if(Array.from(node.options).some(function(option){return option.value===previous;}))node.value=previous;
}
function fillNucleusFilter(){
  var node=el("bulkEditorNucleusFilter");if(!node)return;
  var previous=node.value||"all";
  node.innerHTML='<option value="all">Todos os núcleos</option>'+
    (taxonomy().nuclei||[]).map(function(item){return '<option value="'+escapeAttr(item.id)+'">'+escapeHtml(item.label)+'</option>';}).join("");
  if(Array.from(node.options).some(function(option){return option.value===previous;}))node.value=previous;
}
function checksHtml(defs,kind){
  return (defs||[]).map(function(item){
    return '<label><input type="checkbox" data-bulk-'+kind+'="'+escapeAttr(item.id)+'"><span>'+escapeHtml(item.label)+'</span></label>';
  }).join("")||'<span class="bulk-editor-empty">Nenhuma categoria cadastrada.</span>';
}
function renderControls(){
  var tax=taxonomy();
  fillSelect("bulkEditorType",tax.types,"Não alterar");
  fillSelect("bulkEditorStatus",tax.statuses,"Não alterar");
  fillNucleusFilter();
  var nuclei=el("bulkEditorNuclei"),tags=el("bulkEditorTags");
  if(nuclei)nuclei.innerHTML=checksHtml(tax.nuclei,"nucleus");
  if(tags)tags.innerHTML=checksHtml(tax.tags,"tag");
}
function render(){
  var root=el("bulkEditorCharacters");if(!root)return;
  var visible=visibleRows(),tax=taxonomy();

  root.innerHTML=visible.length?visible.map(function(row){
    var meta=row.meta,selected=selection&&selection.has(row.name);
    return '<label class="bulk-character-row'+(selected?" selected":"")+'">'+
      '<input type="checkbox" data-bulk-character="'+escapeAttr(row.name)+'"'+(selected?" checked":"")+'>'+
      '<div class="bulk-character-main"><strong>'+escapeHtml(row.name)+'</strong>'+
        '<span>'+escapeHtml(label(tax.types,meta.type))+' · '+escapeHtml(label(tax.statuses,meta.status))+
        (meta.private?' · 🔒 Mestre':(meta.visibility==="spoiler"?' · ⚠️ Spoiler':""))+'</span>'+
        '<small>'+escapeHtml((meta.nuclei||[]).map(function(id){return label(tax.nuclei,id);}).join(" · ")||"Sem núcleo")+
        ((meta.tags||[]).length?' · '+escapeHtml(meta.tags.map(function(id){return "#"+label(tax.tags,id);}).join(" ")):"")+'</small></div>'+
    '</label>';
  }).join(""):'<div class="bulk-editor-empty">Nenhum personagem corresponde aos filtros.</div>';

  root.querySelectorAll("[data-bulk-character]").forEach(function(input){
    input.addEventListener("change",function(){
      selection.toggle(input.getAttribute("data-bulk-character"),input.checked);
      renderSummary();
      input.closest(".bulk-character-row").classList.toggle("selected",input.checked);
    });
  });
  if(el("bulkEditorVisibleCount"))el("bulkEditorVisibleCount").textContent=visible.length+" visíveis";
  renderSummary();
}
function renderSummary(){
  if(el("bulkEditorSelectedCount"))el("bulkEditorSelectedCount").textContent=String(selection?selection.size():0);
}
function checkedValues(attr){
  return Array.from(document.querySelectorAll("["+attr+"]:checked")).map(function(input){return input.getAttribute(attr);});
}
function buildPatch(){
  var patch={};
  var type=el("bulkEditorType").value,status=el("bulkEditorStatus").value;
  var featured=el("bulkEditorFeatured").value,visibility=el("bulkEditorVisibility").value;
  if(type)patch.type=type;
  if(status)patch.status=status;
  if(featured==="true"||featured==="false")patch.featured=featured==="true";
  if(visibility)patch.visibility=visibility;

  var nuclei=checkedValues("data-bulk-nucleus"),nMode=el("bulkEditorNucleiMode").value;
  if(nuclei.length)patch[nMode==="replace"?"nucleiReplace":(nMode==="remove"?"nucleiRemove":"nucleiAdd")]=nuclei;

  var tags=checkedValues("data-bulk-tag"),tMode=el("bulkEditorTagsMode").value;
  if(tags.length||tMode==="replace"){
    patch[tMode==="replace"?"tagsReplace":(tMode==="remove"?"tagsRemove":"tagsAdd")]=tags;
  }
  return patch;
}
function patchHasChanges(patch){return Object.keys(patch).length>0;}
function setStatus(message,state){
  var node=el("bulkEditorStatusText");if(!node)return;
  node.textContent=message||"";node.setAttribute("data-state",state||"idle");
}
async function apply(){
  if(!(await supported(false))){
    showToast("Publique o checkpoint atual para ativar a Edição em Lote no backend.","warning",6500);
    return;
  }
  var names=selection?selection.values():[];
  if(!names.length){showToast("Selecione ao menos um personagem.","warning",4000);return;}
  var patch=buildPatch();
  if(!patchHasChanges(patch)){showToast("Escolha ao menos uma alteração para aplicar.","warning",4000);return;}

  var button=el("bulkEditorApply");
  if(button){button.disabled=true;button.textContent="Aplicando…";}
  setStatus("Atualizando "+names.length+" personagens em uma única publicação…","working");

  try{
    var result=await backend().request("/api/character",{method:"POST",body:{
      action:"bulk-update-meta",characters:names,patch:patch
    }});
    window.TerraZData=window.TerraZData||{};
    window.TerraZData.characterTaxonomy=result.taxonomy||taxonomy();

    var runtime=window.TerraZApp&&window.TerraZApp.runtimeData;
    if(runtime&&runtime.refresh)await runtime.refresh({force:true,bust:result.sha,silent:true});
    var p=privateApi();if(p&&p.reload)await p.reload();

    document.dispatchEvent(new CustomEvent("terra-z:taxonomy-changed",{detail:{bulk:true,updated:result.updated||[]}}));
    var filters=window.TerraZApp&&window.TerraZApp.characterFilters;
    if(filters&&filters.refreshTaxonomy)filters.refreshTaxonomy();

    setStatus((result.updated||[]).length+" personagens atualizados.","success");
    showToast((result.updated||[]).length+" personagens atualizados em lote.","success",5000);
    render();
    var publishing=window.TerraZApp&&window.TerraZApp.publishing;
    if(publishing&&publishing.trackDeployment&&result.status_url)publishing.trackDeployment(result.status_url);
  }catch(error){
    console.error("Terra Z bulk editor:",error);
    setStatus(error.message||"Falha na edição em lote.","error");
    showToast(error.message||"Falha na edição em lote.","error",6500);
  }finally{
    if(button){button.disabled=false;button.textContent="Aplicar aos selecionados";}
  }
}
async function open(){
  if(!authenticated()){showToast("Entre como editor para usar a edição em lote.","warning",4500);return;}
  if(!(await supported(false))){
    showToast("A Edição em Lote aguarda o novo checkpoint da Vercel.","warning",6500);
    return;
  }
  var p=privateApi();if(p&&p.load)await p.load();
  if(selection)selection.clear();
  renderControls();render();setStatus("","idle");
  var panel=el("bulkEditorPanel");if(panel)panel.classList.add("show");
  document.body.style.overflow="hidden";
}
function close(){
  var panel=el("bulkEditorPanel");if(panel)panel.classList.remove("show");
  var keep=!!document.querySelector("#adminPanel.show,#taxonomyManagerPanel.show,#masterQuickPanel.show,#masterWorkspacePanel.show");
  document.body.style.overflow=keep?"hidden":"";
}
function setup(){
  [["bulkEditorClose",close],["bulkEditorApply",apply]].forEach(function(row){var node=el(row[0]);if(node)node.addEventListener("click",row[1]);});
  var search=el("bulkEditorSearch");if(search)search.addEventListener("input",render);
  var filter=el("bulkEditorNucleusFilter");if(filter)filter.addEventListener("change",render);
  var selectVisible=el("bulkEditorSelectVisible");if(selectVisible)selectVisible.addEventListener("click",function(){selection.add(visibleRows().map(function(row){return row.name;}));render();});
  var clear=el("bulkEditorClearSelection");if(clear)clear.addEventListener("click",function(){selection.clear();render();});
  var panel=el("bulkEditorPanel");if(panel)panel.addEventListener("click",function(e){if(e.target===panel)close();});
  document.addEventListener("terra-z:taxonomy-changed",function(){if(panel&&panel.classList.contains("show")){renderControls();render();}});
  document.addEventListener("terra-z:auth-changed",function(){capability=null;});
}
setup();
window.TerraZApp.bulkEditor={open:open,close:close,refresh:render};
})();