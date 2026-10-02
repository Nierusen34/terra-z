(function(){
"use strict";

window.TerraZApp=window.TerraZApp || {};
var core=window.TerraZCore;
if(!core) throw new Error("Terra Z: núcleo não carregado antes de js/media-library.js");

var showToast=core.showToast;
var showConfirm=core.showConfirm;
var escapeHtml=core.escapeHtml;
var escapeAttr=core.escapeAttr;

var selectedId="";
var search="";
var filter="all";
var capability=null;

var CATEGORIES={
  portrait:"Retrato",
  graph:"Grafo",
  map:"Mapa",
  editorial:"Editorial",
  team:"Equipe",
  other:"Outro"
};

function el(id){ return document.getElementById(id); }
function backend(){ return window.TerraZApp && window.TerraZApp.backend; }
function graph(){ return window.TerraZApp && window.TerraZApp.graph; }
function characterMedia(){ return window.TerraZApp && window.TerraZApp.characterMedia; }

function assets(){
  var library=(window.TerraZData && window.TerraZData.mediaLibrary) || {};
  return Array.isArray(library.assets) ? library.assets : [];
}

function getAsset(id){
  return assets().find(function(asset){ return asset && asset.id===String(id || ""); }) || null;
}

function assetUrl(asset){
  if(!asset) return "";
  var src=String(asset.src || "");
  if(!src) return "";
  var runtime=window.TerraZApp && window.TerraZApp.runtimeData;
  return runtime && runtime.mediaUrl ? runtime.mediaUrl(src) : src;
}

function framingStyle(asset){
  var frame=asset && asset.framing || {};
  var fit=frame.fit==="contain" ? "contain" : "cover";
  var x=Number.isFinite(Number(frame.x)) ? Number(frame.x) : 50;
  var y=Number.isFinite(Number(frame.y)) ? Number(frame.y) : 50;
  var zoom=Number.isFinite(Number(frame.zoom)) ? Number(frame.zoom) : 1;
  return "--portrait-fit:"+fit+";--portrait-x:"+x+"%;--portrait-y:"+y+"%;--portrait-zoom:"+zoom;
}

function graphUsage(id){
  var g=graph();
  var data=g && g.getData ? g.getData() : null;
  if(!data || !Array.isArray(data.nodes)) return [];
  return data.nodes.filter(function(node){
    return node && node.mediaMode==="library" && node.mediaId===id;
  }).map(function(node){ return node.label || node.id; });
}

function characterItems(){
  var data=(window.TerraZData && window.TerraZData.characterMedia) || {};
  return Object.keys(data).map(function(name){
    var api=characterMedia();
    var meta=api && api.get ? api.get(name) : data[name];
    var has=!!(meta && (meta.src || meta.automatic || (data[name] && data[name].auto)));
    if(!has) return null;
    return {
      id:"character:"+name,
      kind:"character",
      label:name,
      category:"portrait",
      src:meta && meta.src || "",
      source:meta && meta.automatic ? "auto" : (data[name].source || "local"),
      meta:meta || {},
      character:name
    };
  }).filter(Boolean);
}

function allItems(){
  return assets().map(function(asset){
    return {...asset,kind:"asset",usage:graphUsage(asset.id)};
  }).concat(characterItems());
}

function matches(item){
  if(filter==="characters" && item.kind!=="character") return false;
  if(filter==="library" && item.kind!=="asset") return false;
  if(filter==="orphan" && !(item.kind==="asset" && (!item.usage || !item.usage.length))) return false;
  if(CATEGORIES[filter] && item.category!==filter) return false;

  var needle=String(search || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  if(!needle) return true;
  var hay=[
    item.label,item.id,item.category,item.credit,item.source,
    item.character,(item.usage || []).join(" ")
  ].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  return hay.indexOf(needle)!==-1;
}

function imageHtml(item){
  if(item.kind==="character"){
    var api=characterMedia();
    if(api && api.renderPortraitHtml){
      return api.renderPortraitHtml(item.character,"large","card");
    }
    return '<div class="media-library-placeholder">👤</div>';
  }

  var url=assetUrl(item);
  if(!url) return '<div class="media-library-placeholder">🖼️</div>';
  return '<div class="media-library-asset-image" style="'+escapeAttr(framingStyle(item))+'">'+
    '<img src="'+escapeAttr(url)+'" alt="'+escapeAttr(item.alt || item.label || "")+'" loading="lazy" decoding="async" referrerpolicy="no-referrer">'+
  '</div>';
}

function renderStats(items){
  var total=el("mediaLibraryTotal");
  var reused=el("mediaLibraryUsed");
  var orphan=el("mediaLibraryOrphan");
  if(total) total.textContent=String(items.length);
  if(reused) reused.textContent=String(items.filter(function(item){
    return item.kind==="character" || (item.usage && item.usage.length);
  }).length);
  if(orphan) orphan.textContent=String(items.filter(function(item){
    return item.kind==="asset" && (!item.usage || !item.usage.length);
  }).length);
}

function render(){
  var root=el("mediaLibraryGrid");
  if(!root) return;

  var items=allItems();
  renderStats(items);
  var visible=items.filter(matches);

  root.innerHTML=visible.length ? visible.map(function(item){
    var usage=item.kind==="character"
      ? "Cards · Ficha"+(graph() ? " · Grafo quando vinculado" : "")
      : (item.usage && item.usage.length ? item.usage.join(" · ") : "Não utilizado");
    var badge=item.kind==="character"
      ? "PERSONAGEM"
      : (CATEGORIES[item.category] || "ATIVO");
    return '<article class="media-library-card" data-media-item="'+escapeAttr(item.id)+'">'+
      '<div class="media-library-thumb">'+imageHtml(item)+'</div>'+
      '<div class="media-library-card-body">'+
        '<div class="media-library-card-top"><span>'+escapeHtml(badge)+'</span>'+
          (item.kind==="asset" && (!item.usage || !item.usage.length) ? '<em>ÓRFÃO</em>' : '')+
        '</div>'+
        '<h4>'+escapeHtml(item.label || item.id)+'</h4>'+
        '<p>'+escapeHtml(usage)+'</p>'+
        '<small>'+escapeHtml(item.source==="auto" ? "Fonte automática" : (item.source==="external" ? "URL externa" : "Arquivo local"))+'</small>'+
      '</div>'+
      '<div class="media-library-card-actions">'+
        (item.kind==="asset"
          ? (item.readOnly
              ? '<button type="button" disabled>📁 Ativo do projeto</button>'
              : '<button type="button" data-media-edit="'+escapeAttr(item.id)+'">✏️ Editar</button>')
          : '<button type="button" data-media-character="'+escapeAttr(item.character)+'">👤 Personagem</button>')+
      '</div>'+
    '</article>';
  }).join("") : '<div class="media-library-empty">Nenhum ativo corresponde aos filtros atuais.</div>';

  var api=characterMedia();
  if(api && api.hydrate) api.hydrate(root);

  root.querySelectorAll("[data-media-edit]").forEach(function(button){
    button.addEventListener("click",function(){ openEditor(button.getAttribute("data-media-edit")); });
  });
  root.querySelectorAll("[data-media-character]").forEach(function(button){
    button.addEventListener("click",function(){
      var editor=window.TerraZApp && window.TerraZApp.characterEditor;
      close();
      if(editor && editor.open) editor.open(button.getAttribute("data-media-character"));
    });
  });

  resolveVisibleCharacters(visible);
}

function resolveVisibleCharacters(items){
  var api=characterMedia();
  if(!api || !api.resolveAutomatic) return;
  items.filter(function(item){
    return item.kind==="character" && item.meta && item.meta.automatic && !item.meta.src;
  }).slice(0,12).forEach(function(item){
    api.resolveAutomatic(item.character).then(function(result){
      if(result && result.found) render();
    }).catch(function(){});
  });
}

async function supportsLibrary(force){
  if(force) capability=null;
  if(capability!==null) return capability;
  var b=backend();
  if(!b || !b.isAuthenticated || !b.isAuthenticated()) return false;
  try{
    var health=await b.health();
    capability=!!(health && health.media_library_v1===true && health.graph_independent_media===true);
  }catch(error){ capability=false; }
  return capability;
}

async function refreshAccess(){
  var add=el("mediaLibraryAdd");
  if(!add) return;
  var ready=await supportsLibrary(false);
  add.disabled=!ready;
  add.title=ready ? "Adicionar ativo reutilizável" : "Publique o checkpoint atual para ativar a Biblioteca de Mídia em produção";
}

function open(){
  var b=backend();
  if(!b || !b.isAuthenticated || !b.isAuthenticated()){
    showToast("Entre como editor para abrir a Biblioteca de Mídia.","warning",5000);
    if(window.TerraZApp.publishing) window.TerraZApp.publishing.open();
    return;
  }
  var modal=el("mediaLibraryModal");
  if(modal){
    modal.classList.add("show");
    document.body.style.overflow="hidden";
  }
  render();
  refreshAccess();
}

function close(){
  var modal=el("mediaLibraryModal");
  if(modal) modal.classList.remove("show");
  var editor=el("mediaLibraryEditor");
  if(editor) editor.classList.remove("show");
  var graphModal=document.getElementById("graphEditorModal");
  document.body.style.overflow=graphModal && graphModal.classList.contains("show") ? "hidden" : "";
  selectedId="";
}

function readDataUrl(file){
  return new Promise(function(resolve,reject){
    var reader=new FileReader();
    reader.onload=function(){ resolve(reader.result); };
    reader.onerror=function(){ reject(new Error("Não foi possível ler a imagem.")); };
    reader.readAsDataURL(file);
  });
}

function setEditorState(asset){
  selectedId=asset && asset.id || "";
  el("mediaAssetLabel").value=asset && asset.label || "";
  el("mediaAssetCategory").value=asset && asset.category || "graph";
  el("mediaAssetSource").value=asset && asset.source==="external" ? "external" : "local";
  el("mediaAssetUrl").value=asset && asset.source==="external" ? (asset.src || "") : "";
  el("mediaAssetCredit").value=asset && asset.credit || "";
  var frame=asset && asset.framing || {fit:"cover",x:50,y:50,zoom:1};
  el("mediaAssetFit").value=frame.fit==="contain" ? "contain" : "cover";
  el("mediaAssetX").value=String(Number(frame.x ?? 50));
  el("mediaAssetY").value=String(Number(frame.y ?? 50));
  el("mediaAssetZoom").value=String(Math.round(Number(frame.zoom ?? 1)*100));
  el("mediaAssetFile").value="";
  var del=el("mediaAssetDelete");
  if(del) del.hidden=!selectedId;
  var title=el("mediaLibraryEditorTitle");
  if(title) title.textContent=selectedId ? "✏️ Editar ativo" : "＋ Novo ativo";
  syncEditorSource();
  renderEditorPreview();
}

function openEditor(id){
  if(!el("mediaLibraryEditor")) return;
  var asset=id ? getAsset(id) : null;
  if(asset && asset.readOnly){
    showToast("Este ativo pertence ao acervo estrutural do projeto. Ele pode ser reutilizado, mas não é alterado por esta biblioteca.","info",5500);
    return;
  }
  setEditorState(asset);
  el("mediaLibraryEditor").classList.add("show");
}

function closeEditor(){
  if(el("mediaLibraryEditor")) el("mediaLibraryEditor").classList.remove("show");
  selectedId="";
}

function syncEditorSource(){
  var source=el("mediaAssetSource").value;
  var fileWrap=el("mediaAssetFileWrap");
  var urlWrap=el("mediaAssetUrlWrap");
  if(fileWrap) fileWrap.hidden=source!=="local";
  if(urlWrap) urlWrap.hidden=source!=="external";
}

function draftFraming(){
  return {
    fit:el("mediaAssetFit").value==="contain" ? "contain" : "cover",
    x:Number(el("mediaAssetX").value || 50),
    y:Number(el("mediaAssetY").value || 50),
    zoom:Number(el("mediaAssetZoom").value || 100)/100
  };
}

function renderEditorPreview(){
  var root=el("mediaAssetPreview");
  if(!root) return;
  var source=el("mediaAssetSource").value;
  var url="";

  if(source==="external") url=el("mediaAssetUrl").value.trim();
  else if(selectedId){
    var current=getAsset(selectedId);
    if(current) url=assetUrl(current);
  }

  if(!url){
    root.innerHTML='<div class="media-library-placeholder">🖼️</div>';
    return;
  }

  root.innerHTML='<div class="media-library-asset-image" style="'+escapeAttr(framingStyle({framing:draftFraming()}))+'">'+
    '<img src="'+escapeAttr(url)+'" alt="" referrerpolicy="no-referrer">'+
  '</div>';
}

async function saveAsset(){
  if(!(await supportsLibrary(false))){
    showToast("O backend da Biblioteca de Mídia ainda não está ativo em produção.","warning",6500);
    return;
  }

  var label=el("mediaAssetLabel").value.trim();
  if(!label){
    showToast("Informe um nome para o ativo.","warning");
    el("mediaAssetLabel").focus();
    return;
  }

  var source=el("mediaAssetSource").value;
  var file=el("mediaAssetFile").files && el("mediaAssetFile").files[0];
  var b=backend();
  var body={
    id:selectedId,
    label:label,
    category:el("mediaAssetCategory").value,
    source:source,
    src:source==="external" ? el("mediaAssetUrl").value.trim() : undefined,
    credit:el("mediaAssetCredit").value.trim(),
    alt:label,
    framing:draftFraming()
  };

  if(source==="local" && !file && !selectedId){
    showToast("Selecione uma imagem local ou escolha URL externa.","warning");
    return;
  }

  var save=el("mediaAssetSave");
  if(save){ save.disabled=true; save.textContent="Salvando…"; }

  try{
    if(source==="local" && file){
      if(!["image/png","image/jpeg","image/webp"].includes(file.type)) throw new Error("Use PNG, JPEG ou WebP.");
      if(file.size>2*1024*1024) throw new Error("A imagem deve ter no máximo 2 MB.");
      body.action="library-upload";
      body.mimeType=file.type;
      body.contentBase64=await readDataUrl(file);
    }else{
      body.action="library-upsert";
      if(source==="local" && selectedId){
        var current=getAsset(selectedId);
        body.src=current && current.src || "";
      }
    }

    var result=await b.request("/api/media",{method:"POST",body:body});
    window.TerraZData=window.TerraZData || {};
    window.TerraZData.mediaLibrary=result.library || {version:1,assets:[]};
    var savedId=result.asset && result.asset.id || selectedId;
    closeEditor();
    render();
    showToast("Ativo salvo na Biblioteca de Mídia.","success",4200);

    var runtime=window.TerraZApp && window.TerraZApp.runtimeData;
    if(runtime && runtime.refresh) await runtime.refresh({force:true,bust:result.sha,silent:true});

    document.dispatchEvent(new CustomEvent("terra-z:media-library-changed",{detail:{id:savedId}}));

    var publishing=window.TerraZApp && window.TerraZApp.publishing;
    if(publishing && publishing.trackDeployment && result.status_url) publishing.trackDeployment(result.status_url);
  }catch(error){
    console.error("Terra Z media library save:",error);
    showToast(error.message || "Falha ao salvar o ativo.","error",6500);
  }finally{
    if(save){ save.disabled=false; save.textContent="💾 Salvar ativo"; }
  }
}

function requestDelete(){
  var asset=getAsset(selectedId);
  if(!asset) return;
  if(asset.readOnly){
    showToast("Ativos estruturais do projeto não podem ser excluídos pela Biblioteca.","warning",5000);
    return;
  }
  var use=graphUsage(asset.id);
  if(use.length){
    showToast("Este ativo está em uso no grafo: "+use.join(", ")+". Remova a associação antes de excluir.","warning",7000);
    return;
  }

  showConfirm(
    "Excluir ativo",
    'Excluir "'+(asset.label || asset.id)+'" da Biblioteca de Mídia?',
    async function(){
      try{
        var result=await backend().request("/api/media",{
          method:"POST",
          body:{action:"library-delete",id:asset.id}
        });
        window.TerraZData.mediaLibrary=result.library || {version:1,assets:[]};
        closeEditor();
        render();
        showToast("Ativo removido da Biblioteca.","success",4200);

        var runtime=window.TerraZApp && window.TerraZApp.runtimeData;
        if(runtime && runtime.refresh) await runtime.refresh({force:true,bust:result.sha,silent:true});
        document.dispatchEvent(new CustomEvent("terra-z:media-library-changed",{detail:{id:asset.id,deleted:true}}));
      }catch(error){
        console.error(error);
        showToast(error.message || "Falha ao excluir o ativo.","error",6000);
      }
    },
    "Excluir"
  );
}

function setup(){
  var modal=el("mediaLibraryModal");
  var editor=el("mediaLibraryEditor");
  if(modal) modal.addEventListener("click",function(event){ if(event.target===modal) close(); });
  if(editor) editor.addEventListener("click",function(event){ if(event.target===editor) closeEditor(); });

  [
    ["mediaLibraryClose",close],
    ["mediaLibraryAdd",function(){ openEditor(""); }],
    ["mediaLibraryEditorClose",closeEditor],
    ["mediaAssetCancel",closeEditor],
    ["mediaAssetSave",saveAsset],
    ["mediaAssetDelete",requestDelete]
  ].forEach(function(row){
    var node=el(row[0]); if(node) node.addEventListener("click",row[1]);
  });

  var searchNode=el("mediaLibrarySearch");
  if(searchNode) searchNode.addEventListener("input",function(){ search=searchNode.value || "";render(); });
  var filterNode=el("mediaLibraryFilter");
  if(filterNode) filterNode.addEventListener("change",function(){ filter=filterNode.value || "all";render(); });

  var source=el("mediaAssetSource");
  if(source) source.addEventListener("change",function(){ syncEditorSource();renderEditorPreview(); });

  var fileInput=el("mediaAssetFile");
  if(fileInput) fileInput.addEventListener("change",function(){
    var file=fileInput.files && fileInput.files[0];
    if(!file){ renderEditorPreview(); return; }
    if(!["image/png","image/jpeg","image/webp"].includes(file.type)){
      showToast("Use PNG, JPEG ou WebP.","warning");
      fileInput.value="";
      return;
    }
    var reader=new FileReader();
    reader.onload=function(){
      var root=el("mediaAssetPreview");
      if(root){
        root.innerHTML='<div class="media-library-asset-image" style="'+escapeAttr(framingStyle({framing:draftFraming()}))+'">'+
          '<img src="'+escapeAttr(String(reader.result || ""))+'" alt="">'+
        '</div>';
      }
    };
    reader.readAsDataURL(file);
  });
  ["mediaAssetUrl","mediaAssetFit","mediaAssetX","mediaAssetY","mediaAssetZoom"].forEach(function(id){
    var node=el(id);
    if(node) node.addEventListener("input",renderEditorPreview);
    if(node) node.addEventListener("change",renderEditorPreview);
  });

  document.addEventListener("terra-z:runtime-data-loaded",render);
  document.addEventListener("terra-z:character-media-changed",render);
  document.addEventListener("terra-z:graph-rendered",function(){ if(modal && modal.classList.contains("show")) render(); });
  document.addEventListener("terra-z:auth-changed",function(){ capability=null;refreshAccess(); });
}

window.TerraZApp.mediaLibrary={
  open:open,
  close:close,
  render:render,
  getAsset:getAsset,
  assets:assets,
  assetUrl:assetUrl,
  framingStyle:framingStyle,
  usage:graphUsage,
  openEditor:openEditor
};

setup();

})();