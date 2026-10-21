(function(){
"use strict";

window.TerraZApp=window.TerraZApp || {};
var core=window.TerraZCore;
if(!core) throw new Error("Terra Z: núcleo não carregado antes de js/organization-editor.js");

var showToast=core.showToast;
var showConfirm=core.showConfirm;
var currentId="";
var creating=false;

function el(id){return document.getElementById(id);}
function backend(){return window.TerraZApp && window.TerraZApp.backend;}
function organizations(){
  return Array.isArray(window.TerraZData && window.TerraZData.organizations)
    ? window.TerraZData.organizations
    : [];
}
function byId(id){return organizations().find(function(item){return item&&item.id===id;})||null;}
function lines(value){
  return String(value||"").split(/\r?\n/).map(function(v){return v.trim();}).filter(Boolean);
}
function listText(value){return Array.isArray(value)?value.join("\n"):"";}
function escapeHtml(value){
  return String(value==null?"":value)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function slugify(value){
  return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"").slice(0,80);
}
function categoryDefaultLabel(category){
  return ({
    criminal:"Facção Criminosa",
    corporate:"Empresa",
    academic:"Ensino Superior",
    media:"Mídia",
    agency:"Agência"
  })[category]||"Organização";
}
function categoryOptions(value){
  var rows=[
    ["criminal","Facção criminosa"],
    ["corporate","Empresa"],
    ["academic","Instituição acadêmica"],
    ["media","Mídia"],
    ["agency","Agência"]
  ];
  return rows.map(function(row){
    return '<option value="'+row[0]+'"'+(value===row[0]?' selected':'')+'>'+row[1]+'</option>';
  }).join("");
}
function visibilityOptions(value){
  return '<option value="public"'+(value==="public"?' selected':'')+'>Público</option>'+
    '<option value="spoiler"'+(value==="spoiler"?' selected':'')+'>Spoiler</option>';
}
function emptyOrganization(){
  return {
    id:"",
    name:"",
    icon:"◆",
    category:"corporate",
    categoryLabel:"Empresa",
    base:"",
    leader:"",
    description:"",
    activities:[],
    aliases:[],
    rivals:[],
    subunits:[],
    relatedCharacters:[],
    relatedLocations:[],
    spoiler:"",
    visibility:"public"
  };
}
function status(message,state){
  var node=el("organizationEditorStatus");
  if(!node)return;
  node.textContent=message||"";
  node.setAttribute("data-state",state||"idle");
}
function fill(item){
  item=item||emptyOrganization();
  var categoryLabelInput=el("organizationEditorCategoryLabel");
  if(categoryLabelInput) delete categoryLabelInput.dataset.userEdited;
  el("organizationEditorId").value=item.id||"";
  el("organizationEditorName").value=item.name||"";
  el("organizationEditorIcon").value=item.icon||"◆";
  el("organizationEditorCategory").innerHTML=categoryOptions(item.category||"corporate");
  el("organizationEditorCategoryLabel").value=item.categoryLabel||categoryDefaultLabel(item.category);
  el("organizationEditorBase").value=item.base||"";
  el("organizationEditorLeader").value=item.leader||"";
  el("organizationEditorDescription").value=item.description||"";
  el("organizationEditorActivities").value=listText(item.activities);
  el("organizationEditorAliases").value=listText(item.aliases);
  el("organizationEditorRivals").value=listText(item.rivals);
  el("organizationEditorSubunits").value=listText(item.subunits);
  el("organizationEditorCharacters").value=listText(item.relatedCharacters);
  el("organizationEditorLocations").value=listText(item.relatedLocations);
  el("organizationEditorSpoiler").value=item.spoiler||"";
  el("organizationEditorVisibility").innerHTML=visibilityOptions(item.visibility||"public");
  el("organizationEditorDelete").hidden=creating;
  el("organizationEditorTitle").textContent=creating?"Nova organização":item.name;
  el("organizationEditorMode").textContent=creating?"CRIAR ORGANIZAÇÃO":"EDITAR ORGANIZAÇÃO";
  status(
    creating
      ? "Crie a organização e depois, se necessário, conecte-a ao grafo."
      : "Alterações são salvas diretamente no GitHub. O ID permanente não muda.",
    "ready"
  );
}
function readForm(){
  var category=el("organizationEditorCategory").value;
  var name=el("organizationEditorName").value.trim();
  return {
    id:creating ? slugify(name) : el("organizationEditorId").value,
    name:name,
    icon:el("organizationEditorIcon").value.trim()||"◆",
    category:category,
    categoryLabel:el("organizationEditorCategoryLabel").value.trim()||categoryDefaultLabel(category),
    base:el("organizationEditorBase").value.trim(),
    leader:el("organizationEditorLeader").value.trim(),
    description:el("organizationEditorDescription").value.trim(),
    activities:lines(el("organizationEditorActivities").value),
    aliases:lines(el("organizationEditorAliases").value),
    rivals:lines(el("organizationEditorRivals").value),
    subunits:lines(el("organizationEditorSubunits").value),
    relatedCharacters:lines(el("organizationEditorCharacters").value),
    relatedLocations:lines(el("organizationEditorLocations").value),
    spoiler:el("organizationEditorSpoiler").value.trim(),
    visibility:el("organizationEditorVisibility").value
  };
}
function renderList(){
  var root=el("organizationEditorList");
  if(!root)return;
  var rows=organizations();
  root.innerHTML=rows.length?rows.map(function(item){
    return '<button type="button" data-organization-editor-select="'+escapeHtml(item.id)+'"'+(item.id===currentId?' class="active"':'')+'>'+
      '<span>'+escapeHtml(item.icon||"◆")+'</span><span><strong>'+escapeHtml(item.name)+'</strong><small>'+escapeHtml(item.categoryLabel||categoryDefaultLabel(item.category))+'</small></span>'+
    '</button>';
  }).join(""):'<div class="organization-editor-empty">Nenhuma organização cadastrada.</div>';
}
function refreshPublic(){
  var root=el("organizationsData");
  if(root) root.innerHTML="";
  if(window.TerraZApp.dataRenderer && window.TerraZApp.dataRenderer.render) window.TerraZApp.dataRenderer.render();
  if(window.TerraZApp.commandPalette && window.TerraZApp.commandPalette.refresh) window.TerraZApp.commandPalette.refresh();
  document.dispatchEvent(new CustomEvent("terra-z:organizations-changed"));
}
function open(id){
  var b=backend();
  if(!b||!b.isAuthenticated||!b.isAuthenticated()){
    showToast("Entre como editor para editar organizações.","warning",4500);
    if(window.TerraZApp.adminLoader&&window.TerraZApp.adminLoader.open) window.TerraZApp.adminLoader.open();
    return;
  }
  creating=false;
  currentId=String(id||"");
  var item=byId(currentId);
  if(!item){showToast("Organização não encontrada.","warning",4200);return;}
  renderList();
  fill(item);
  el("organizationEditorModal").classList.add("show");
  document.body.style.overflow="hidden";
}
function openManager(){
  var b=backend();
  if(!b||!b.isAuthenticated||!b.isAuthenticated()){
    showToast("Entre como editor para gerenciar organizações.","warning",4500);
    return;
  }
  var rows=organizations();
  if(rows.length){
    open(rows[0].id);
  }else{
    openCreate();
  }
}

function openCreate(){
  var b=backend();
  if(!b||!b.isAuthenticated||!b.isAuthenticated()){
    showToast("Entre como editor para criar organizações.","warning",4500);
    return;
  }
  creating=true;
  currentId="";
  renderList();
  fill(emptyOrganization());
  el("organizationEditorModal").classList.add("show");
  document.body.style.overflow="hidden";
  setTimeout(function(){el("organizationEditorName").focus();},40);
}
function close(){
  var modal=el("organizationEditorModal");
  if(modal) modal.classList.remove("show");
  document.body.style.overflow="";
}
async function save(){
  var b=backend();
  if(!b||!b.isAuthenticated||!b.isAuthenticated()){
    showToast("Sua sessão de editor expirou.","warning",4500);
    return;
  }
  var item=readForm();
  if(!item.name){status("Informe o nome da organização.","warning");el("organizationEditorName").focus();return;}
  var button=el("organizationEditorSave");
  if(button)button.disabled=true;
  status("Salvando organização…","working");
  try{
    var result=await b.request("/api/organization",{
      method:"POST",
      body:{id:creating?"":currentId,organization:item}
    });
    if(Array.isArray(result.organizations)) window.TerraZData.organizations=result.organizations;
    currentId=result.organization&&result.organization.id?result.organization.id:item.id;
    creating=false;
    renderList();
    fill(byId(currentId)||result.organization||item);
    refreshPublic();
    status("Organização salva no GitHub.","success");
    showToast("Organização salva com sucesso.","success",4200);
    if(window.TerraZApp.publishing&&window.TerraZApp.publishing.trackDeployment&&result.status_url){
      window.TerraZApp.publishing.trackDeployment(result.status_url);
    }
  }catch(error){
    console.error(error);
    status(error.message||"Falha ao salvar organização.","error");
  }finally{
    if(button)button.disabled=false;
  }
}
function remove(){
  if(creating||!currentId)return;
  var item=byId(currentId);
  if(!item)return;
  showConfirm(
    "Excluir organização",
    'Excluir "'+item.name+'"? Esta ação não apaga personagens ou locais relacionados.',
    async function(){
      status("Excluindo organização…","working");
      try{
        var result=await backend().request("/api/organization",{method:"DELETE",body:{id:currentId}});
        if(Array.isArray(result.organizations)) window.TerraZData.organizations=result.organizations;
        currentId="";
        creating=true;
        renderList();
        fill(emptyOrganization());
        refreshPublic();
        showToast("Organização excluída.","success",4200);
        if(window.TerraZApp.publishing&&window.TerraZApp.publishing.trackDeployment&&result.status_url){
          window.TerraZApp.publishing.trackDeployment(result.status_url);
        }
      }catch(error){
        console.error(error);
        status(error.message||"Não foi possível excluir a organização.","error");
      }
    },
    "Excluir"
  );
}
function setup(){
  var modal=el("organizationEditorModal");
  if(!modal)return;
  el("organizationEditorClose").addEventListener("click",close);
  el("organizationEditorCancel").addEventListener("click",close);
  el("organizationEditorSave").addEventListener("click",save);
  el("organizationEditorDelete").addEventListener("click",remove);
  el("organizationEditorNew").addEventListener("click",openCreate);
  el("organizationEditorCategory").addEventListener("change",function(){
    var label=el("organizationEditorCategoryLabel");
    if(label&&!label.dataset.userEdited) label.value=categoryDefaultLabel(this.value);
  });
  el("organizationEditorCategoryLabel").addEventListener("input",function(){this.dataset.userEdited="true";});
  el("organizationEditorList").addEventListener("click",function(event){
    var button=event.target.closest("[data-organization-editor-select]");
    if(!button)return;
    creating=false;
    currentId=button.getAttribute("data-organization-editor-select")||"";
    renderList();
    fill(byId(currentId));
  });
  modal.addEventListener("click",function(event){if(event.target===modal)close();});
  document.addEventListener("keydown",function(event){
    if(event.key==="Escape"&&modal.classList.contains("show"))close();
  });
}
setup();
window.TerraZApp.organizationEditor={open:open,openManager:openManager,openCreate:openCreate,close:close,save:save};
})();
