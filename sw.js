/* えいごペット：オフラインで あそべるように する サービスワーカー
   ・つうしんが できる ときは さいしんばんを とりにいき（ネットワーク ゆうせん）、キャッシュも こうしんする
   ・つうしんが できない／おそい（3びょう）ときは キャッシュを つかう
   ・ファイルを ふやしたら PRECACHE に たして VERSION を あげる */
var VERSION='eigopet-v2';
var PRECACHE=["./",
  "./fonts/fonts.css",
  "./fonts/mplusrounded1c-400.woff2",
  "./fonts/mplusrounded1c-700.woff2",
  "./fonts/mplusrounded1c-800.woff2",
  "./fonts/mplusrounded1c-900.woff2",
  "./fonts/dotgothic16.woff2",
  "./index.html",
  "./manifest.webmanifest",
  "./app.js",
  "./easy.js",
  "./runner.js",
  "./support.js",
  "./tower.js",
  "./tower_bosses.js",
  "./tower_buildings.js",
  "./tower_core.js",
  "./tower_heroes.js",
  "./war.js",
  "./war_gfx.js",
  "./words.js",
  "./vendor/react-dom.production.min.js",
  "./vendor/react.production.min.js",
  "./vendor/three.min.js",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./characters/%E3%81%86%E3%81%95%E3%81%9F%E3%81%BE.png",
  "./characters/%E3%81%86%E3%81%95%E3%81%9F%E3%81%BE_sleep.png",
  "./characters/%E3%81%86%E3%82%89%E3%82%89.png",
  "./characters/%E3%81%86%E3%82%89%E3%82%89_sleep.png",
  "./characters/%E3%81%8A%E3%81%B0%E3%81%91.png",
  "./characters/%E3%81%8A%E3%81%B0%E3%81%91_sleep.png",
  "./characters/%E3%81%8A%E3%81%B2%E3%81%95%E3%81%BE.png",
  "./characters/%E3%81%8A%E3%81%B2%E3%81%95%E3%81%BE_sleep.png",
  "./characters/%E3%81%8B%E3%81%B6%E3%82%89.png",
  "./characters/%E3%81%8B%E3%81%B6%E3%82%89_sleep.png",
  "./characters/%E3%81%8C%E3%81%8F%E3%81%8C%E3%81%8F.png",
  "./characters/%E3%81%8C%E3%81%8F%E3%81%8C%E3%81%8F_sleep.png",
  "./characters/%E3%81%8F%E3%81%95%E3%81%9F%E3%81%BE.png",
  "./characters/%E3%81%8F%E3%81%95%E3%81%9F%E3%81%BE_sleep.png",
  "./characters/%E3%81%8F%E3%81%A1%E3%81%B1.png",
  "./characters/%E3%81%8F%E3%81%A1%E3%81%B1_sleep.png",
  "./characters/%E3%81%8F%E3%82%8D%E3%81%A0%E3%81%BE.png",
  "./characters/%E3%81%8F%E3%82%8D%E3%81%A0%E3%81%BE_sleep.png",
  "./characters/%E3%81%92%E3%83%BC%E3%82%80.png",
  "./characters/%E3%81%92%E3%83%BC%E3%82%80_sleep.png",
  "./characters/%E3%81%97%E3%82%8D%E3%81%93%E3%82%8D.png",
  "./characters/%E3%81%97%E3%82%8D%E3%81%93%E3%82%8D_sleep.png",
  "./characters/%E3%81%99%E3%81%84%E3%81%99%E3%81%84%E3%81%9F%E3%81%BE.png",
  "./characters/%E3%81%99%E3%81%84%E3%81%99%E3%81%84%E3%81%9F%E3%81%BE_sleep.png",
  "./characters/%E3%81%9F%E3%81%BE%E3%81%94.png",
  "./characters/%E3%81%9F%E3%81%BE%E3%81%94_sleep.png",
  "./characters/%E3%81%9F%E3%81%BE%E3%81%B1.png",
  "./characters/%E3%81%9F%E3%81%BE%E3%81%B1_sleep.png",
  "./characters/%E3%81%A1%E3%81%B3%E3%81%A3%E3%81%93.png",
  "./characters/%E3%81%A1%E3%81%B3%E3%81%A3%E3%81%93_sleep.png",
  "./characters/%E3%81%A1%E3%82%83%E3%82%81.png",
  "./characters/%E3%81%A1%E3%82%83%E3%82%81_sleep.png",
  "./characters/%E3%81%A9%E3%81%8D%E3%81%A9%E3%81%8D.png",
  "./characters/%E3%81%A9%E3%81%8D%E3%81%A9%E3%81%8D_sleep.png",
  "./characters/%E3%81%AB%E3%82%93%E3%81%98%E3%82%83.png",
  "./characters/%E3%81%AB%E3%82%93%E3%81%98%E3%82%83_sleep.png",
  "./characters/%E3%81%AD%E3%82%80%E3%81%AD.png",
  "./characters/%E3%81%AD%E3%82%80%E3%81%AD_sleep.png",
  "./characters/%E3%81%AF%E3%81%8C%E3%81%9F.png",
  "./characters/%E3%81%AF%E3%81%8C%E3%81%9F_sleep.png",
  "./characters/%E3%81%AF%E3%82%93%E3%81%B0.png",
  "./characters/%E3%81%AF%E3%82%93%E3%81%B0_sleep.png",
  "./characters/%E3%81%B0%E3%81%B6%E3%81%9F%E3%81%BE.png",
  "./characters/%E3%81%B0%E3%81%B6%E3%81%9F%E3%81%BE_sleep.png",
  "./characters/%E3%81%B4%E3%81%93%E3%81%B4%E3%81%93.png",
  "./characters/%E3%81%B4%E3%81%93%E3%81%B4%E3%81%93_sleep.png",
  "./characters/%E3%81%B4%E3%81%AA.png",
  "./characters/%E3%81%B4%E3%81%AA_sleep.png",
  "./characters/%E3%81%B4%E3%81%AD%E3%82%80.png",
  "./characters/%E3%81%B4%E3%81%AD%E3%82%80_sleep.png",
  "./characters/%E3%81%B4%E3%82%88%E3%81%9F%E3%81%BE.png",
  "./characters/%E3%81%B4%E3%82%88%E3%81%9F%E3%81%BE_sleep.png",
  "./characters/%E3%81%B4%E3%82%88%E3%81%A3%E3%81%93.png",
  "./characters/%E3%81%B4%E3%82%88%E3%81%A3%E3%81%93_sleep.png",
  "./characters/%E3%81%B7%E3%81%8F%E3%81%9F%E3%81%BE.png",
  "./characters/%E3%81%B7%E3%81%8F%E3%81%9F%E3%81%BE_sleep.png",
  "./characters/%E3%81%BF%E3%82%89%E3%81%9F%E3%81%BE.png",
  "./characters/%E3%81%BF%E3%82%89%E3%81%9F%E3%81%BE_sleep.png",
  "./characters/%E3%82%81%E3%81%A3%E3%81%93.png",
  "./characters/%E3%82%81%E3%81%A3%E3%81%93_sleep.png",
  "./characters/%E3%82%81%E3%82%89%E3%82%81%E3%82%89.png",
  "./characters/%E3%82%81%E3%82%89%E3%82%81%E3%82%89_sleep.png",
  "./characters/%E3%82%82%E3%81%90%E3%82%82%E3%81%90.png",
  "./characters/%E3%82%82%E3%81%90%E3%82%82%E3%81%90_sleep.png",
  "./characters/%E3%82%82%E3%81%B5%E3%81%9F%E3%81%BE.png",
  "./characters/%E3%82%82%E3%81%B5%E3%81%9F%E3%81%BE_sleep.png"];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){
    return Promise.all(PRECACHE.map(function(u){ return fetch(new Request(u,{cache:'reload'})).then(function(r){ if(r.ok) return c.put(u,r); }).catch(function(){}); }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k!==VERSION; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
function fromCache(req){ return caches.open(VERSION).then(function(c){ return c.match(req,{ignoreSearch:true}).then(function(r){ return r||(req.mode==='navigate'?c.match('./index.html'):undefined); }); }); }
self.addEventListener('fetch',function(e){
  var req=e.request; if(req.method!=='GET') return;
  var url=new URL(req.url), same=url.origin===self.location.origin;
  if(!same) return;
  e.respondWith(new Promise(function(resolve){
    var done=false, net=fetch(req).then(function(r){
      if(r&&(r.ok||r.type==='opaque')){ var cp=r.clone(); caches.open(VERSION).then(function(c){ c.put(same?url.origin+url.pathname:req, cp); }); }
      return r; });
    var t=setTimeout(function(){ fromCache(req).then(function(r){ if(r&&!done){ done=true; resolve(r); } }); },3000);
    net.then(function(r){ if(!done){ done=true; clearTimeout(t); resolve(r); } }).catch(function(){ clearTimeout(t); fromCache(req).then(function(r){ if(!done){ done=true; resolve(r||new Response('',{status:504})); } }); });
  }));
});
