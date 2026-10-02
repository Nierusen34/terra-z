(function(){
"use strict";

window.TerraZApp=window.TerraZApp || {};

function normalize(value){
  return String(value == null ? "" : value)
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function slugify(value){
  return normalize(value)
    .replace(/['’]/g,"")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .slice(0,100);
}

function unique(values){
  return [...new Set((values || []).map(function(value){ return String(value || "").trim(); }).filter(Boolean))];
}

function createSelection(options){
  options=options || {};
  var selected=new Set();
  var listeners=new Set();

  function emit(){
    var snapshot=api.values();
    listeners.forEach(function(listener){
      try{ listener(snapshot); }catch(error){ console.error(error); }
    });
    if(options.eventName){
      document.dispatchEvent(new CustomEvent(options.eventName,{detail:{values:snapshot}}));
    }
  }

  var api={
    has:function(id){ return selected.has(String(id || "")); },
    toggle:function(id,force){
      id=String(id || "");
      if(!id) return api.values();
      var shouldAdd=force===undefined ? !selected.has(id) : !!force;
      if(shouldAdd) selected.add(id); else selected.delete(id);
      emit();
      return api.values();
    },
    add:function(ids){ unique(Array.isArray(ids)?ids:[ids]).forEach(function(id){ selected.add(id); });emit();return api.values(); },
    remove:function(ids){ unique(Array.isArray(ids)?ids:[ids]).forEach(function(id){ selected.delete(id); });emit();return api.values(); },
    replace:function(ids){ selected=new Set(unique(ids));emit();return api.values(); },
    clear:function(){ if(!selected.size) return []; selected.clear();emit();return []; },
    values:function(){ return Array.from(selected); },
    size:function(){ return selected.size; },
    subscribe:function(listener){ if(typeof listener==="function") listeners.add(listener);return function(){listeners.delete(listener);}; }
  };
  return api;
}

function filterRows(rows,options){
  options=options || {};
  var term=normalize(options.search);
  var fields=Array.isArray(options.fields) ? options.fields : [];
  var predicates=Array.isArray(options.predicates) ? options.predicates : [];

  return (Array.isArray(rows)?rows:[]).filter(function(row){
    if(term){
      var hay=fields.map(function(field){
        var value=typeof field==="function" ? field(row) : row && row[field];
        return Array.isArray(value) ? value.join(" ") : value;
      }).join(" ");
      if(normalize(hay).indexOf(term)===-1) return false;
    }
    return predicates.every(function(predicate){ return typeof predicate!=="function" || predicate(row); });
  });
}

function batchApply(rows,ids,updater,getId){
  var idSet=new Set(unique(ids));
  getId=typeof getId==="function" ? getId : function(row){ return row && row.id; };
  updater=typeof updater==="function" ? updater : function(row){ return row; };

  return (Array.isArray(rows)?rows:[]).map(function(row,index){
    var id=String(getId(row,index) || "");
    return idSet.has(id) ? updater(row,index) : row;
  });
}

function groupBy(rows,key){
  var groups=new Map();
  (Array.isArray(rows)?rows:[]).forEach(function(row){
    var value=typeof key==="function" ? key(row) : row && row[key];
    var values=Array.isArray(value) ? value : [value];
    values.forEach(function(item){
      var label=String(item || "").trim();
      if(!label) return;
      if(!groups.has(label)) groups.set(label,[]);
      groups.get(label).push(row);
    });
  });
  return groups;
}

window.TerraZApp.adminFoundation={
  normalize:normalize,
  slugify:slugify,
  unique:unique,
  createSelection:createSelection,
  filterRows:filterRows,
  batchApply:batchApply,
  groupBy:groupBy
};

document.dispatchEvent(new CustomEvent("terra-z:admin-foundation-ready"));
})();