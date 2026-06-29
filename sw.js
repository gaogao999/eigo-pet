/* えいごペット Service Worker
   - アプリ本体(同一オリジン)は network-first：オンラインなら常に最新、オフラインはキャッシュ
   - React(unpkg, 固定バージョン)は cache-first：一度取得すれば以後オフラインでも動く */
var CACHE = 'eigopet-cache-v1';
var LOCAL = ['./','./index.html','./app.js','./support.js','./words.js','./easy.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-180.png'];
var CDN = ['https://unpkg.com/react@18.3.1/umd/react.production.min.js','https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all([
      c.addAll(LOCAL).catch(function(){}),
      Promise.all(CDN.map(function(u){ return fetch(u,{mode:'cors'}).then(function(r){ if(r&&r.ok) return c.put(u,r); }).catch(function(){}); }))
    ]);
  }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  var req = e.request; if(req.method!=='GET') return;
  var url;
  try{ url = new URL(req.url); }catch(err){ return; }
  if(url.hostname==='unpkg.com'){
    // cache-first（固定バージョンなので不変）
    e.respondWith(caches.match(req).then(function(hit){
      return hit || fetch(req).then(function(r){ var cp=r.clone(); caches.open(CACHE).then(function(c){ c.put(req,cp); }); return r; });
    }));
    return;
  }
  if(url.origin===location.origin){
    // network-first（最新優先・オフラインはキャッシュ）
    e.respondWith(fetch(req).then(function(r){
      var cp=r.clone(); caches.open(CACHE).then(function(c){ c.put(req,cp); }); return r;
    }).catch(function(){
      return caches.match(req).then(function(hit){ return hit || caches.match('./index.html'); });
    }));
    return;
  }
});
