(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};

var currentSha = '';
var loadingPromise = null;
var requestSerial = 0;
var appliedSerial = 0;

function backend(){
  return window.TerraZApp && window.TerraZApp.backend;
}

function applyData(result){
  if(!result || !result.data) return result;

  window.TerraZData = window.TerraZData || {};
  Object.keys(result.data).forEach(function(key){
    window.TerraZData[key] = result.data[key];
  });

  currentSha = result.sha || currentSha;

  document.dispatchEvent(new CustomEvent('terra-z:runtime-data-loaded',{
    detail:{
      sha:currentSha,
      data:result.data
    }
  }));

  return result;
}

async function refresh(options){
  options = options || {};
  var b = backend();
  if(!b || !b.isConfigured()) return null;

  if(loadingPromise && !options.force) return loadingPromise;

  var serial = ++requestSerial;
  var suffix = options.bust
    ? ('?v=' + encodeURIComponent(options.bust))
    : ('?t=' + Date.now());

  var promise = b.request('/api/runtime-data' + suffix,{method:'GET'},false)
    .then(function(result){
      if(serial < appliedSerial) return result;
      appliedSerial = serial;
      return applyData(result);
    })
    .catch(function(error){
      if(!options.silent) console.error('Terra Z runtime data:',error);
      return null;
    })
    .finally(function(){
      if(loadingPromise === promise) loadingPromise = null;
    });

  loadingPromise = promise;
  return promise;
}

function mediaUrl(path,sha){
  var b = backend();
  var raw = String(path || '');
  if(!raw || !b || !b.isConfigured()) return raw;
  if(!/^images\/characters\/[a-z0-9._-]+\.(png|jpe?g|webp)$/i.test(raw)) return raw;

  var url = b.endpoint('/api/runtime-media?path=' + encodeURIComponent(raw));
  var version = sha || currentSha;
  if(version) url += '&v=' + encodeURIComponent(version);
  return url;
}

window.TerraZApp.runtimeData = {
  refresh:refresh,
  mediaUrl:mediaUrl,
  getSha:function(){ return currentSha; },
  isLoading:function(){ return !!loadingPromise; }
};

refresh({silent:true});

})();