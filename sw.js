"use strict";

const VERSION="terra-z-pwa-v1.4.0-20261002e";
const CORE_CACHE=VERSION+"-core";
const IMAGE_CACHE=VERSION+"-images";
const CACHE_PREFIX="terra-z-pwa-";

const CORE_ASSETS=[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./terra-z.css",
  "./terra-z.js",
  "./config.js",
  "./images/pwa/icon-192.webp",
  "./images/pwa/icon-512.svg",
  "./images/pwa/icon-maskable.svg",
  "./data/characters.js",
  "./data/character-overrides.js",
  "./data/character-meta.js",
  "./data/character-media.js",
  "./data/media-library.js",
  "./data/relations.js",
  "./data/graph-overrides.js",
  "./data/locations.js",
  "./data/events.js",
  "./data/timeline.js",
  "./data/cities.js",
  "./data/teams.js",
  "./data/sessions.js",
  "./data/visibility.js",
  "./data/content-overrides.js",
  "./js/backend-client.js",
  "./js/admin-loader.js",
  "./js/runtime-data.js",
  "./js/data-renderer.js",
  "./js/visibility.js",
  "./js/media.js",
  "./js/character-media.js",
  "./js/navigation.js",
  "./js/mobile-polish.js",
  "./js/search.js",
  "./js/command-palette.js",
  "./js/characters.js",
  "./js/home-protagonists.js",
  "./js/favorites.js",
  "./js/presentation.js",
  "./js/graph.js",
  "./js/character-filters.js",
  "./js/router.js",
  "./js/sessions.js",
  "./js/timeline-manager.js",
  "./js/world-links.js",
  "./js/pwa.js"
];

function scoped(path){
  return new URL(path,self.registration.scope).href;
}

function privateRequest(request,url){
  if(request.method!=="GET") return true;
  if(request.headers.has("authorization")) return true;
  const path=url.pathname.toLowerCase();
  if(path.includes("/api/")) return true;
  if(path.includes("/data/private-")) return true;
  if(path.endsWith(".enc.json")) return true;
  return false;
}

function cacheable(response){
  if(!response || !response.ok) return false;
  const control=String(response.headers.get("cache-control")||"").toLowerCase();
  return !control.includes("no-store");
}

async function putSafe(cache,request,response){
  if(cacheable(response)){
    try{await cache.put(request,response.clone());}catch(error){}
  }
  return response;
}

async function networkFirst(request,fallback){
  const cache=await caches.open(CORE_CACHE);
  try{
    const response=await fetch(request);
    return putSafe(cache,request,response);
  }catch(error){
    const exact=await cache.match(request,{ignoreSearch:true});
    if(exact) return exact;
    if(fallback){
      const saved=await cache.match(scoped(fallback),{ignoreSearch:true});
      if(saved) return saved;
    }
    throw error;
  }
}

async function imageCacheFirst(request){
  const cache=await caches.open(IMAGE_CACHE);
  const hit=await cache.match(request);
  if(hit) return hit;
  const response=await fetch(request);
  await putSafe(cache,request,response);
  const keys=await cache.keys();
  if(keys.length>80){
    await Promise.all(keys.slice(0,keys.length-80).map(key=>cache.delete(key)));
  }
  return response;
}

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CORE_CACHE).then(cache=>cache.addAll(CORE_ASSETS.map(scoped)))
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(
      names.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CORE_CACHE&&name!==IMAGE_CACHE)
        .map(name=>caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message",event=>{
  if(event.data && event.data.type==="SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  const url=new URL(request.url);

  if(privateRequest(request,url)) return;

  if(request.mode==="navigate"){
    event.respondWith(networkFirst(request,"./index.html"));
    return;
  }

  if(url.origin!==self.location.origin) return;

  if(request.destination==="image"){
    event.respondWith(imageCacheFirst(request));
    return;
  }

  if(
    request.destination==="script" ||
    request.destination==="style" ||
    request.destination==="manifest" ||
    /\/(?:data|js)\/.+\.js$/i.test(url.pathname) ||
    /\.(?:css|js|webmanifest)$/i.test(url.pathname)
  ){
    event.respondWith(networkFirst(request));
  }
});
