/* えいごダッシュ — せんろを はしる 3D ランゲーム（Three.js）
   ・3レーンを スワイプで いどう／うえで ジャンプ／したで スライディング
   ・でんしゃ・さく・ゲートを よける。コインを あつめる
   ・ときどき「えいごゲート」：うえに 出た えいごの いみの レーンを はしりぬける
   app.js から EigoRunner.start({...}) で よぶ。THREE は さきに 読みこんでおく。 */
(function(){
'use strict';
var R={};                                   // いま うごいている ゲーム
var LANE=2.2, FAR=150, BEHIND=14;
var JUMP_V=8.6, GRAV=-25, SLIDE_T=0.75;
var FONT='"Hiragino Maru Gothic ProN","Hiragino Sans","M PLUS Rounded 1c","Noto Sans JP",sans-serif';

function rnd(a,b){ return a+Math.random()*(b-a); }
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function el(tag,css,html){ var e=document.createElement(tag); if(css) e.style.cssText=css; if(html!=null) e.innerHTML=html; return e; }

/* ---------- テクスチャ（canvas で つくる） ---------- */
function canvasTex(w,h,draw){
  var c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h);
  var t=new THREE.CanvasTexture(c); t.anisotropy=4; return t;
}
function windowTex(){                       // ビルの まど（くりかえし）
  var t=canvasTex(64,64,function(g,w,h){
    g.fillStyle='#fff'; g.fillRect(0,0,w,h);
    g.fillStyle='#9fb9c4'; g.fillRect(8,10,20,26); g.fillRect(36,10,20,26);
    g.fillStyle='#c9d9df'; g.fillRect(8,10,20,6); g.fillRect(36,10,20,6);
    g.fillStyle='rgba(0,0,0,.08)'; g.fillRect(0,50,w,4);
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
function trainSideTex(){                    // でんしゃの よこ（まど＋おび）
  var t=canvasTex(256,64,function(g,w,h){
    g.fillStyle='#e9efe6'; g.fillRect(0,0,w,h);
    g.fillStyle='#2f8f83'; g.fillRect(0,40,w,10);            // おび
    g.fillStyle='#e0a13a'; g.fillRect(0,50,w,3);
    g.fillStyle='#34424a';
    for(var x=10;x<w;x+=40){ g.fillRect(x,10,28,22); }
    g.fillStyle='rgba(255,255,255,.35)';
    for(var x2=10;x2<w;x2+=40){ g.fillRect(x2+2,12,8,18); }
  });
  t.wrapS=THREE.RepeatWrapping; return t;
}
function trainFrontTex(){
  return canvasTex(128,128,function(g,w,h){
    g.fillStyle='#e9efe6'; g.fillRect(0,0,w,h);
    g.fillStyle='#34424a'; g.fillRect(12,18,104,46);
    g.fillStyle='rgba(255,255,255,.3)'; g.fillRect(16,22,30,38);
    g.fillStyle='#2f8f83'; g.fillRect(0,80,w,16);
    g.fillStyle='#ffe38a'; g.beginPath(); g.arc(24,106,8,0,7); g.fill(); g.beginPath(); g.arc(104,106,8,0,7); g.fill();
  });
}
function signTex(text,bg,fg){                // ゲートの かんばん
  return canvasTex(512,220,function(g,w,h){
    g.fillStyle=bg; g.fillRect(0,0,w,h);
    g.strokeStyle='rgba(0,0,0,.25)'; g.lineWidth=10; g.strokeRect(5,5,w-10,h-10);
    g.fillStyle=fg; g.textAlign='center'; g.textBaseline='middle';
    var fs=110; g.font='900 '+fs+'px '+FONT;
    while(g.measureText(text).width>w-40&&fs>26){ fs-=4; g.font='900 '+fs+'px '+FONT; }
    g.fillText(text,w/2,h/2+4);
  });
}
function stripeTex(){                       // ふみきりの しましま
  var t=canvasTex(64,16,function(g,w,h){ for(var i=0;i<8;i++){ g.fillStyle=i%2?'#222':'#f2c230'; g.fillRect(i*8,0,8,h); } });
  t.wrapS=THREE.RepeatWrapping; return t;
}

/* ---------- モデル ---------- */
var M={};                                   // マテリアル
function mat(c,o){ o=o||{}; o.color=c; return new THREE.MeshLambertMaterial(o); }
function box(w,h,d,m){ return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); }

function makeKid(){                          // ボクセルの こども（ヘッドホン・リュック）
  var g=new THREE.Group(), p={};
  var skin=mat(0xf2c7a5), navy=mat(0x28324a), red=mat(0xd9483b), shoe=mat(0xe23b3b), hair=mat(0x2b2220),
      pack=mat(0x2f8f83), yellow=mat(0xf2c230), dark=mat(0x222222);
  function limb(w,h,d,m,y){ var piv=new THREE.Group(); var b=box(w,h,d,m); b.position.y=-h/2; piv.add(b); piv.position.y=y; return piv; }
  p.legL=limb(0.2,0.62,0.22,navy,0.72); p.legL.position.x=-0.13;
  p.legR=limb(0.2,0.62,0.22,navy,0.72); p.legR.position.x=0.13;
  [p.legL,p.legR].forEach(function(l){ var s=box(0.24,0.12,0.32,shoe); s.position.set(0,-0.62,0.04); l.add(s); g.add(l); });
  var body=box(0.56,0.62,0.34,red); body.position.y=1.03; g.add(body); p.body=body;
  var zip=box(0.04,0.5,0.01,yellow); zip.position.set(0,1.03,-0.175); g.add(zip);
  var bp=box(0.46,0.5,0.22,pack); bp.position.set(0,1.06,0.27); g.add(bp);
  var bpk=box(0.3,0.2,0.05,yellow); bpk.position.set(0,0.94,0.39); g.add(bpk);
  p.armL=limb(0.16,0.56,0.18,red,1.3); p.armL.position.x=-0.36;
  p.armR=limb(0.16,0.56,0.18,red,1.3); p.armR.position.x=0.36;
  [p.armL,p.armR].forEach(function(a){ var h=box(0.15,0.12,0.15,skin); h.position.y=-0.6; a.add(h); g.add(a); });
  var head=new THREE.Group(); head.position.y=1.56; g.add(head); p.head=head;
  head.add(box(0.48,0.46,0.44,skin));
  var hr=box(0.52,0.2,0.48,hair); hr.position.y=0.2; head.add(hr);
  var hb=box(0.52,0.3,0.12,hair); hb.position.set(0,0.06,0.2); head.add(hb);
  var band=box(0.58,0.06,0.1,dark); band.position.y=0.3; head.add(band);
  [-1,1].forEach(function(s){ var cup=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,0.1,12),dark);
    cup.rotation.z=Math.PI/2; cup.position.set(0.29*s,0.02,0); head.add(cup); });
  var sh=new THREE.Mesh(new THREE.CircleGeometry(0.42,20),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.22,depthWrite:false}));
  sh.rotation.x=-Math.PI/2; sh.position.y=0.02;
  g.userData=p; return {g:g,shadow:sh};
}

function makeTrain(len){
  var g=new THREE.Group();
  var side=M.trainSide.clone(); side.needsUpdate=true; side.repeat.set(len/6,1);
  var mSide=own(new THREE.MeshLambertMaterial({map:side}),true), mFront=M.trainFrontMat, mCream=M.cream;
  // BoxGeometry の 面：+x,-x,+y,-y,+z,-z
  var b=new THREE.Mesh(new THREE.BoxGeometry(1.9,2.5,len),[mSide,mSide,M.roof,mCream,mFront,mFront]);
  b.position.y=1.55; g.add(b);
  var roof=box(1.6,0.22,len-0.6,M.roofDark); roof.position.y=2.9; g.add(roof);
  var skirt=box(1.7,0.35,len-0.4,M.dark); skirt.position.y=0.25; g.add(skirt);
  var pant=box(0.08,0.9,0.08,M.dark); pant.position.set(0,3.4,-len/2+2); g.add(pant);
  return g;
}

function makeBarrier(){                      // ジャンプで こえる さく
  var g=new THREE.Group();
  var bar=box(1.8,0.34,0.14,M.stripe); bar.position.y=0.72; g.add(bar);
  var bar2=box(1.8,0.12,0.12,M.white); bar2.position.y=0.36; g.add(bar2);
  [-0.8,0.8].forEach(function(x){ var l=box(0.12,0.9,0.12,M.white); l.position.set(x,0.45,0); g.add(l); });
  return g;
}
function makeBar(){                          // スライディングで くぐる ゲート
  var g=new THREE.Group();
  var top=box(2.0,0.5,0.22,M.stripe); top.position.y=1.55; g.add(top);
  var sign=box(1.2,0.9,0.06,M.red); sign.position.y=2.25; g.add(sign);
  [-0.95,0.95].forEach(function(x){ var l=box(0.14,2.8,0.14,M.white); l.position.set(x,1.4,0); g.add(l); });
  return g;
}
function makeCoin(){
  var c=new THREE.Mesh(M.coinGeo,M.coin); c.rotation.x=Math.PI/2; return c;
}
function makeGate(text){                     // えいごゲート（1レーンぶん）
  var g=new THREE.Group();
  var tex=signTex(text,'#fffaf0','#1f3b36');
  var board=new THREE.Mesh(new THREE.PlaneGeometry(2.1,0.9),own(new THREE.MeshBasicMaterial({map:tex}),true));
  board.position.y=3.2; g.add(board);
  var frame=box(2.26,1.06,0.08,own(mat(0x1f3b36))); frame.position.set(0,3.2,-0.05); g.add(frame);
  [-1.07,1.07].forEach(function(x){ var l=box(0.12,3.7,0.12,M.gateFrame); l.position.set(x,1.85,0); g.add(l); });
  g.userData.board=board; g.userData.frame=frame;
  return g;
}

function makeBuilding(side){
  var w=rnd(5,9), h=rnd(6,20), d=rnd(6,12);
  var geo=new THREE.BoxGeometry(w,h,d), uv=geo.attributes.uv;
  for(var i=0;i<uv.count;i++){                 // まどの 大きさを ビルの 大きさに あわせる
    var face=Math.floor(i/4), sx=(face<2)?d:w;
    uv.setXY(i,uv.getX(i)*sx/2.4,uv.getY(i)*h/2.6);
  }
  var m=new THREE.Mesh(geo,pick(M.bld));
  m.position.set(side*(rnd(10.5,14)+w/2),h/2,0);
  var g=new THREE.Group(); g.add(m);
  if(Math.random()<0.4){ var rt=box(w*0.5,1.2,d*0.4,M.concrete); rt.position.set(m.position.x,h+0.6,0); g.add(rt); }
  g.userData.len=d; return g;
}
function treeX(side){ return side<0?-rnd(6.0,9.0):rnd(8.6,9.8); }   // みぎは ホーム（〜x=8）より そと
function makeTree(){
  var g=new THREE.Group();
  var tr=new THREE.Mesh(M.trunkGeo,M.trunk); tr.position.y=0.9; g.add(tr);
  var s=rnd(1.0,1.5), lf=new THREE.Mesh(M.leafGeo,pick(M.leaf)); lf.scale.set(s,s*1.15,s); lf.position.y=2.4; g.add(lf);
  return g;
}
function makePlatform(len){                  // えきの ホーム（ベンチ・やね）
  var g=new THREE.Group();
  var slab=box(4.2,1.0,len,M.concrete); slab.position.set(5.9,0.5,0); g.add(slab);
  var edge=box(0.25,0.03,len,M.yellowLine); edge.position.set(4.25,1.02,0); g.add(edge);
  var roof=box(3.6,0.18,len*0.8,M.red); roof.position.set(6.2,4.3,0); g.add(roof);
  for(var z=-len*0.38;z<=len*0.38;z+=6){
    var pl=box(0.18,3.3,0.18,M.dark); pl.position.set(7.4,2.65,z); g.add(pl);
    var bn=box(1.2,0.12,0.5,M.red); bn.position.set(6.6,1.45,z+2); g.add(bn);
    var bl=box(1.2,0.5,0.08,M.red); bl.position.set(6.6,1.7,z+2.25); g.add(bl);
  }
  return g;
}

/* ---------- セットアップ ---------- */
function initMaterials(){
  M.white=mat(0xeeeae0); M.dark=mat(0x363b40); M.red=mat(0xc23c33); M.concrete=mat(0xcdc4b3);
  M.roof=mat(0xb9c0bf); M.roofDark=mat(0x8a9392); M.yellowLine=mat(0xf2c230);
  M.gateFrame=mat(0x1f3b36);
  M.stripe=new THREE.MeshLambertMaterial({map:stripeTex()});
  M.coin=new THREE.MeshLambertMaterial({color:0xf5c542,emissive:0x6b4a00});
  M.coinGeo=new THREE.CylinderGeometry(0.34,0.34,0.08,16);
  M.trunk=mat(0x7a5a3c); M.trunkGeo=new THREE.CylinderGeometry(0.14,0.18,1.8,6);
  M.leaf=[mat(0x7fb069),mat(0x8fbf6a),mat(0x6fa35b)]; M.leafGeo=new THREE.IcosahedronGeometry(1,0);
  var wt=windowTex();
  M.bld=[0xe9d3ae,0xdcc09a,0xeadcc2,0xd2b58e,0xe0cdb9,0xb9cbc4].map(function(c){ return new THREE.MeshLambertMaterial({color:c,map:wt}); });
  M.trainSide=trainSideTex(); M.trainFront=trainFrontTex();
  M.trainFrontMat=new THREE.MeshLambertMaterial({map:M.trainFront}); M.cream=mat(0xe9efe6);
}

function buildStatic(scene){
  // じめん
  var ground=new THREE.Mesh(new THREE.PlaneGeometry(80,FAR+40),mat(0xbdb4a3)); ground.rotation.x=-Math.PI/2; ground.position.set(0,-0.01,-FAR/2+10); scene.add(ground);
  var ballast=new THREE.Mesh(new THREE.PlaneGeometry(LANE*3+1.6,FAR+40),mat(0x7b766d)); ballast.rotation.x=-Math.PI/2; ballast.position.set(0,0.005,-FAR/2+10); scene.add(ballast);
  // レール（どこまでも おなじ なので うごかさない）
  var rail=mat(0x9ea4a8);
  [-1,0,1].forEach(function(l){ [-0.72,0.72].forEach(function(o){
    var r=box(0.1,0.14,FAR+40,rail); r.position.set(l*LANE+o,0.2,-FAR/2+10); scene.add(r); }); });
  // かべ・フェンス
  var wall=box(0.3,1.6,FAR+40,M.concrete); wall.position.set(-4.7,0.8,-FAR/2+10); scene.add(wall);
  // 架線（ワイヤー）
  var wire=mat(0x333333);
  [-1,0,1].forEach(function(l){ var w=box(0.03,0.03,FAR+40,wire); w.position.set(l*LANE,5.6,-FAR/2+10); scene.add(w); });
}

function buildScrolling(scene){               // くりかえしの かざり（まくらぎ・電柱）＝ z を ずらすだけ
  var S=[];
  // まくらぎ：InstancedMesh 1つで ぜんぶ
  var sp=0.9, n=Math.ceil((FAR+BEHIND)/sp), sl=new THREE.InstancedMesh(new THREE.BoxGeometry(1.9,0.1,0.26),mat(0x5a4c41),n*3);
  var d=new THREE.Object3D(), k=0;
  for(var l=-1;l<=1;l++) for(var i=0;i<n;i++){ d.position.set(l*LANE,0.07,BEHIND-i*sp); d.updateMatrix(); sl.setMatrixAt(k++,d.matrix); }
  var gs=new THREE.Group(); gs.add(sl); scene.add(gs); S.push({g:gs,period:sp});
  // 電柱＋はり（InstancedMesh で まとめて かく）
  function inst(geo,m,list){ var im=new THREE.InstancedMesh(geo,m,list.length), o=new THREE.Object3D();
    list.forEach(function(p,i){ o.position.set(p[0],p[1],p[2]); o.updateMatrix(); im.setMatrixAt(i,o.matrix); }); return im; }
  var pp=18, gp=new THREE.Group(), pole=mat(0x6f7a7c), P=[], B1=[], B2=[];
  for(var z=BEHIND;z>-FAR;z-=pp){ P.push([-4.3,3.3,z],[4.3,3.3,z]); B1.push([0,6.4,z]); B2.push([0,5.9,z]); }
  gp.add(inst(new THREE.BoxGeometry(0.25,6.6,0.25),pole,P));
  gp.add(inst(new THREE.BoxGeometry(8.9,0.22,0.22),pole,B1));
  gp.add(inst(new THREE.BoxGeometry(8.9,0.12,0.12),pole,B2));
  scene.add(gp); S.push({g:gp,period:pp});
  // かべの もよう
  var wp=4, gw=new THREE.Group(), W=[];
  for(var z2=BEHIND;z2>-FAR;z2-=wp) W.push([-4.7,0.8,z2]);
  gw.add(inst(new THREE.BoxGeometry(0.32,1.62,0.08),mat(0xc4bcae),W));
  scene.add(gw); S.push({g:gw,period:wp});
  return S;
}

function buildClouds(scene){
  var cm=new THREE.MeshBasicMaterial({color:0xffffff,fog:false}), out=[];
  for(var i=0;i<7;i++){
    var g=new THREE.Group();
    for(var j=0;j<3;j++){ var s=new THREE.Mesh(new THREE.SphereGeometry(rnd(3,5),10,8),cm); s.scale.y=0.45; s.position.set(j*4-4,rnd(-0.5,0.5),rnd(-1,1)); g.add(s); }
    g.position.set(rnd(-70,70),rnd(26,38),rnd(-160,-110)); scene.add(g); out.push(g);
  }
  return out;
}

/* ---------- ゲーム本体 ---------- */
function start(opt){
  stop();
  var root=opt.container; root.innerHTML='';
  root.style.cssText='position:fixed;inset:0;z-index:200;overflow:hidden;background:linear-gradient(#bfe3ea 0%,#e4f1ee 55%,#f3ecdd 100%);touch-action:none;user-select:none;-webkit-user-select:none;';
  var renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
  root.appendChild(renderer.domElement);
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;';

  var scene=new THREE.Scene();
  scene.fog=new THREE.Fog(0xe2efec,40,FAR);
  var cam=new THREE.PerspectiveCamera(62,1,0.1,400);
  scene.add(new THREE.HemisphereLight(0xfff4e0,0x8f8574,0.78));
  var sun=new THREE.DirectionalLight(0xfff1dc,0.62); sun.position.set(-8,14,5); scene.add(sun);

  if(!M.white) initMaterials();
  buildStatic(scene);
  var scroll=buildScrolling(scene), clouds=buildClouds(scene);
  var kid=makeKid(); scene.add(kid.g); scene.add(kid.shadow);

  // --- HUD ---
  var hud=el('div','position:absolute;inset:0;pointer-events:none;font-family:'+FONT+';');
  root.appendChild(hud);
  var box1='background:rgba(22,48,46,.82);color:#fff;border-radius:12px;padding:6px 12px;font-weight:900;box-shadow:0 2px 8px rgba(0,0,0,.15);';
  var scoreEl=el('div','position:absolute;left:12px;top:calc(12px + env(safe-area-inset-top));'+box1+'min-width:84px;',
    '<div style="font-size:10px;opacity:.75;letter-spacing:.08em;">SCORE</div><div id="rnScore" style="font-size:24px;line-height:1.1;">0</div><div id="rnMeta" style="font-size:10px;opacity:.8;">0m</div>');
  hud.appendChild(scoreEl);
  var right=el('div','position:absolute;right:12px;top:calc(12px + env(safe-area-inset-top));display:flex;gap:8px;align-items:center;pointer-events:auto;');
  right.appendChild(el('div',box1+'font-size:18px;display:flex;align-items:center;gap:6px;','<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:#f5c542;box-shadow:inset 0 -2px 0 #c8962a;"></span><span id="rnCoin">0</span>'));
  var pauseBtn=el('button',box1+'font-size:18px;border:none;width:42px;height:42px;padding:0;cursor:pointer;','Ⅱ');
  right.appendChild(pauseBtn); hud.appendChild(right);
  var qBanner=el('div','position:absolute;left:50%;top:calc(76px + env(safe-area-inset-top));transform:translateX(-50%);background:#fffaf0;color:#1f3b36;border:3px solid #1f3b36;border-radius:14px;padding:6px 10px 8px;text-align:center;font-weight:900;display:none;box-shadow:0 4px 14px rgba(0,0,0,.18);width:min(92vw,380px);box-sizing:border-box;');
  hud.appendChild(qBanner);
  var toast=el('div','position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);font-weight:900;font-size:30px;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.35),0 0 12px rgba(0,0,0,.25);opacity:0;transition:opacity .2s;text-align:center;white-space:nowrap;');
  hud.appendChild(toast);
  var hint=el('div','position:absolute;left:50%;bottom:calc(40px + env(safe-area-inset-bottom));transform:translateX(-50%);background:rgba(22,48,46,.78);color:#fff;border-radius:12px;padding:10px 16px;font-weight:800;font-size:13px;text-align:center;line-height:1.7;white-space:nowrap;',
    '← → スワイプで レーンを かえる<br>↑ ジャンプ　↓ スライディング<br><span style="color:#f5c542;">えいごゲートは いみの あう レーンへ！</span>');
  hud.appendChild(hint);
  var panel=el('div','position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(20,40,38,.45);pointer-events:auto;');
  root.appendChild(panel);

  // --- じょうたい ---
  var S={ dist:0, v:12, lane:0, x:0, y:0, vy:0, slide:0, t:0, coins:0, right:0, wrong:0, combo:0, score:0,
          objs:[], nextRow:45, nextGate:110, gate:null, dead:0, over:false, paused:false, cd:3, last:0,
          bld:[], trees:[], plats:[], words:[] };
  R={renderer:renderer,scene:scene,root:root,S:S,raf:0,opt:opt};

  // ビル・木・ホーム（すぎたら うしろへ まわして 見た目を かえる）
  [-1,1].forEach(function(side){ var wz=-BEHIND-6, prev=0;
    while(wz<FAR+20){ var b=makeBuilding(side); wz+=prev/2+b.userData.len/2+rnd(0.8,3); prev=b.userData.len;
      b.userData.wz=wz; b.userData.side=side; scene.add(b); S.bld.push(b); } });
  for(var i=0;i<18;i++){ var tr=makeTree(); var side=i%2?1:-1; tr.userData.side=side; tr.userData.wz=i*9+rnd(0,6); tr.position.x=treeX(side); scene.add(tr); S.trees.push(tr); }
  var plat=makePlatform(46); plat.userData.wz=60; scene.add(plat); S.plats.push(plat);

  function resize(){ var w=root.clientWidth||window.innerWidth, h=root.clientHeight||window.innerHeight;
    renderer.setSize(w,h,false); cam.aspect=w/h; cam.fov=w/h<0.7?70:60; cam.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize',resize); R.resize=resize;

  function say(t,color,ms){ toast.innerHTML=t; toast.style.color=color||'#fff'; toast.style.opacity='1';
    clearTimeout(say.t); say.t=setTimeout(function(){ toast.style.opacity='0'; },ms||900); }

  // --- 入力 ---
  function act(a){
    if(S.over||S.paused||S.dead) return;
    if(S.cd>0) return;
    if(hint.style.display!=='none') hint.style.display='none';
    if(a==='L'&&S.lane>-1){ S.lane--; snd('swoosh'); }
    else if(a==='R'&&S.lane<1){ S.lane++; snd('swoosh'); }
    else if(a==='U'&&S.y<=0.001&&S.slide<=0){ S.vy=JUMP_V; snd('jump'); }
    else if(a==='U'&&S.slide>0){ S.slide=0; S.vy=JUMP_V; snd('jump'); }
    else if(a==='D'){ if(S.y>0.01) S.vy=-18; S.slide=SLIDE_T; snd('swoosh'); }
  }
  var t0=null;
  function ts(e){ var p=e.touches?e.touches[0]:e; t0={x:p.clientX,y:p.clientY,done:false}; }
  function tm(e){ if(!t0||t0.done) return; var p=e.touches?e.touches[0]:e, dx=p.clientX-t0.x, dy=p.clientY-t0.y;
    if(Math.max(Math.abs(dx),Math.abs(dy))<24) return;
    t0.done=true; if(Math.abs(dx)>Math.abs(dy)) act(dx<0?'L':'R'); else act(dy<0?'U':'D');
    if(e.cancelable) e.preventDefault(); }
  function te(){ t0=null; }
  function kd(e){ var k=e.key;
    if(k==='ArrowLeft'||k==='a') act('L'); else if(k==='ArrowRight'||k==='d') act('R');
    else if(k==='ArrowUp'||k==='w'||k===' ') act('U'); else if(k==='ArrowDown'||k==='s') act('D');
    else if(k==='Escape'||k==='p') togglePause();
    if(/^Arrow| $/.test(k)) e.preventDefault(); }
  root.addEventListener('touchstart',ts,{passive:true}); root.addEventListener('touchmove',tm,{passive:false}); root.addEventListener('touchend',te);
  root.addEventListener('mousedown',ts); root.addEventListener('mousemove',function(e){ if(e.buttons) tm(e); }); root.addEventListener('mouseup',te);
  window.addEventListener('keydown',kd);
  function vis(){ if(document.hidden&&!S.over&&!S.dead) setPause(true); }
  document.addEventListener('visibilitychange',vis);
  R.off=function(){ window.removeEventListener('keydown',kd); window.removeEventListener('resize',resize); document.removeEventListener('visibilitychange',vis); };

  function snd(k){ try{ opt.sfx&&opt.sfx(k); }catch(e){} }

  function setPause(p){ S.paused=p; pauseBtn.textContent=p?'▶':'Ⅱ';
    if(p){ showPanel('<div style="font-size:26px;font-weight:900;margin-bottom:14px;">ひとやすみ</div>',
      [{t:'つづける',c:'#29a65e',f:function(){ setPause(false); }},{t:'やめる',c:'#8a9392',f:function(){ finish(true); }}]); }
    else { panel.style.display='none'; S.last=0; } }
  function togglePause(){ if(!S.over&&!S.dead) setPause(!S.paused); }
  pauseBtn.onclick=function(e){ e.stopPropagation(); togglePause(); };

  function showPanel(html,btns){
    panel.innerHTML=''; panel.style.display='flex';
    var card=el('div','background:#fffaf0;border-radius:18px;padding:22px 20px;width:min(86vw,340px);text-align:center;font-family:'+FONT+';color:#1f3b36;box-shadow:0 10px 30px rgba(0,0,0,.25);',html);
    btns.forEach(function(b){ var bt=el('button','display:block;width:100%;margin-top:10px;border:none;border-radius:12px;padding:14px;font-size:16px;font-weight:900;color:#fff;background:'+b.c+';font-family:inherit;cursor:pointer;',b.t);
      bt.onclick=function(e){ e.stopPropagation(); b.f(); }; card.appendChild(bt); });
    panel.appendChild(card);
  }

  // --- 出現 ---
  function add(o){ scene.add(o.m); S.objs.push(o); return o; }
  function laneFree(l,wz,len){ return !S.objs.some(function(o){ return o.lane===l&&o.kind!=='coin'&&Math.abs(o.wz-wz)<(o.len+len)/2+3; }); }
  // その はんい（wz〜wz+len）に でんしゃが いる レーン
  function trainLanes(z1,z2){ var s={}; S.objs.forEach(function(o){ if(o.kind==='train'&&o.wz+o.len/2>z1-7&&o.wz-o.len/2<z2+7) s[o.lane]=1; }); return s; }
  // でんしゃを おいても かならず 1レーンは あいている か
  function canTrain(L,z1,z2,extra){ var s=trainLanes(z1,z2); s[L]=1; (extra||[]).forEach(function(x){ s[x]=1; }); return Object.keys(s).length<=2; }
  // むかってくる でんしゃ：とおりみちに ある 行を ぜんぶ しらべる
  function canOncoming(L,wz,len){
    var rows=S.objs.filter(function(o){ return o.kind==='train'&&o.wz-o.len/2<wz+len&&o.wz+o.len/2>S.dist; });
    if(rows.some(function(o){ return o.lane===L; })) return false;          // おなじ レーンの でんしゃを つきぬけない
    return !rows.some(function(a){ return rows.some(function(b){ return a!==b&&a.lane!==b.lane&&a.wz-a.len/2<b.wz+b.len/2+7&&b.wz-b.len/2<a.wz+a.len/2+7; }); });
  }
  function spawnRow(wz){
    var r=Math.random(), lanes=[-1,0,1].sort(function(){ return Math.random()-0.5; }), used=[];
    var hard=Math.min(1,S.dist/1500);
    if(r<0.34){ var L=lanes[0], len=pick([10,14,18]), onc=S.dist>250&&Math.random()<0.25+hard*0.2&&canOncoming(L,wz,len);
      if(laneFree(L,wz,len)&&canTrain(L,wz,wz+len)){ var t=makeTrain(len); add({kind:'train',lane:L,wz:wz+len/2,len:len,m:t,w:1.9,h:3.0,onc:onc?rnd(6,10):0}); used.push(L); } }
    else if(r<0.5+hard*0.1){ var put=[]; [lanes[0],lanes[1]].forEach(function(L){ var len=pick([10,14]);
      if(laneFree(L,wz,len)&&canTrain(L,wz,wz+len,put)){ var t=makeTrain(len); add({kind:'train',lane:L,wz:wz+len/2,len:len,m:t,w:1.9,h:3.0,onc:0}); used.push(L); put.push(L); } }); }
    else if(r<0.75){ var n=Math.random()<0.5?1:2; for(var i=0;i<n;i++){ var L2=lanes[i];
      add({kind:'barrier',lane:L2,wz:wz,len:0.3,m:makeBarrier(),w:1.8,h:0.9}); used.push(L2); } }
    else { var n2=Math.random()<0.6?1:(Math.random()<0.5?2:3); for(var j=0;j<n2;j++){ var L3=lanes[j];
      add({kind:'bar',lane:L3,wz:wz,len:0.3,m:makeBar(),w:2.0,y0:1.25,h:3.0}); used.push(L3); } }
    // コイン：ふさがっていない レーンに ならべる
    var free=[-1,0,1].filter(function(l){ return used.indexOf(l)<0; });
    if(free.length&&Math.random()<0.8){ var cl=pick(free), n3=6;
      for(var c=0;c<n3;c++){ var cwz=wz-8+c*2.2; if(!laneFree(cl,cwz,0.5)) continue;
        add({kind:'coin',lane:cl,wz:cwz,len:0.6,m:makeCoin(),y:0.9}); } }
    else if(used.length&&Math.random()<0.5){ var ol=used.find(function(l){ return S.objs.some(function(o){ return o.lane===l&&o.kind==='barrier'&&Math.abs(o.wz-wz)<1; }); });
      if(ol!==undefined) for(var a=-2;a<=2;a++) add({kind:'coin',lane:ol,wz:wz+a*1.6,len:0.6,m:makeCoin(),y:0.9+1.2*Math.cos(a/2.6)}); }
  }
  function spawnGate(wz){
    var q=opt.getQuestion&&opt.getQuestion(); if(!q) return false;
    var order=[0,1,2].sort(function(){ return Math.random()-0.5; });
    var g={wz:wz,q:q,correctLane:0,parts:[],done:false};
    order.forEach(function(ci,li){ var L=li-1, text=q.choices[ci];
      var m=makeGate(text); var o=add({kind:'gate',lane:L,wz:wz,len:0.3,m:m}); g.parts.push({o:o,ci:ci});
      if(ci===0) g.correctLane=L; });
    S.gate=g;
    var byLane=['','',''];
    g.parts.forEach(function(p){ byLane[p.o.lane+1]=q.choices[p.ci]; });
    qBanner.innerHTML='<div style="font-size:11px;opacity:.7;letter-spacing:.06em;white-space:nowrap;">えいごゲート　いみは どれ？</div>'+
      '<div style="font-size:30px;line-height:1.2;font-family:Arial,Helvetica,sans-serif;">'+escH(q.en)+'</div>'+
      '<div id="rnChoices" style="display:flex;gap:6px;margin-top:8px;">'+byLane.map(function(t,i){
        return '<div data-l="'+(i-1)+'" style="flex:1;min-width:0;background:#eef5f1;border:2px solid #cfe0d8;border-radius:10px;padding:6px 4px;font-size:14px;line-height:1.25;word-break:break-all;transition:.12s;">'+
          '<div style="font-size:9px;opacity:.6;">'+['ひだり','まんなか','みぎ'][i]+'</div>'+escH(t)+'</div>'; }).join('')+'</div>';
    qBanner.style.display='block';
    try{ opt.speak&&opt.speak(q.en); }catch(e){}
    q.shownAt=Date.now();
    return true;
  }
  function escH(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  function resolveGate(g){
    g.done=true; var ok=(S.lane===g.correctLane);
    g.parts.forEach(function(p){ var fr=p.o.m.userData.frame; if(fr) fr.material.color.setHex(p.ci===0?0x29a65e:(p.o.lane===S.lane?0xd9483b:0x8a9392)); });
    if(ok){ S.right++; S.combo++; var bonus=100+Math.min(5,S.combo-1)*20; S.score+=bonus; S.coins+=5;
      say('せいかい！ +'+bonus,'#fff'); snd('correct'); }
    else { S.wrong++; S.combo=0; say('<span style="font-size:22px;">'+escH(g.q.en)+' ＝ '+escH(g.q.choices[0])+'</span>','#ffe38a',1800); snd('wrong'); }
    try{ opt.onAnswer&&opt.onAnswer(g.q.en,ok,Date.now()-(g.q.shownAt||Date.now())); }catch(e){}
    setTimeout(function(){ if(S.gate===g){ S.gate=null; qBanner.style.display='none'; } },700);
  }

  // --- 当たり判定 ---
  function hit(o){
    if(o.lane===undefined) return false;
    var px=S.x, dx=Math.abs(o.m.position.x-px);
    if(dx>(o.w||1.8)/2+0.18) return false;
    if(Math.abs(o.wz-S.dist)>o.len/2+0.3) return false;
    var ph=S.slide>0?0.75:1.75, pb=S.y, pt=S.y+ph;
    if(o.kind==='barrier') return pb<o.h-0.05;
    if(o.kind==='bar') return pt>o.y0;
    if(o.kind==='train') return pb<o.h;
    return false;
  }

  function die(o){
    S.dead=1.1; snd('crash'); say('<span style="font-size:34px;">ドーン！</span>','#fff',1000);
    if(o&&o.kind==='train') S.x+= (S.x>o.m.position.x?0.3:-0.3);
  }

  function finish(quit){
    if(S.over) return; S.over=true; qBanner.style.display='none';
    var res={score:Math.floor(S.score),meters:Math.floor(S.dist),coins:S.coins,right:S.right,wrong:S.wrong,quit:!!quit};
    var extra={};
    try{ extra=opt.onEnd?opt.onEnd(res)||{}:{}; }catch(e){}
    var best=extra.best!=null?extra.best:res.score;
    showPanel(
      '<div style="font-size:14px;font-weight:800;opacity:.7;">'+(quit?'おつかれさま':'ゲームオーバー')+'</div>'+
      '<div style="font-size:40px;font-weight:900;line-height:1.1;margin:4px 0;">'+res.score+'</div>'+
      '<div style="font-size:12px;font-weight:800;opacity:.7;margin-bottom:10px;">さいこう '+best+(res.score>=best&&res.score>0&&!quit?'　<span style="color:#e0a13a;">しんきろく！</span>':'')+'</div>'+
      '<div style="display:flex;justify-content:space-around;background:#eef5f1;border-radius:12px;padding:10px 4px;font-weight:900;font-size:15px;">'+
        '<div>🏃 '+res.meters+'m</div><div><span style="color:#c8962a;">●</span> '+res.coins+'</div><div style="color:#29a65e;">○ '+res.right+'</div><div style="color:#d9483b;">× '+res.wrong+'</div></div>'+
      (extra.reward?'<div style="font-size:12px;font-weight:800;margin-top:10px;opacity:.8;">'+extra.reward+'</div>':''),
      [{t:extra.retryLabel||'もういちど',c:'#29a65e',f:function(){ if(opt.onRetry) opt.onRetry(); }},
       {t:'もどる',c:'#8a9392',f:function(){ stop(); if(opt.onExit) opt.onExit(); }}]);
  }

  // --- ループ ---
  function frame(now){
    R.raf=requestAnimationFrame(frame);
    var dt=S.last?Math.min(0.05,(now-S.last)/1000):0; S.last=now;
    if(S.paused||S.over){ renderer.render(scene,cam); return; }
    S.t+=dt;
    var run=S.cd<=0&&!S.dead;
    if(S.cd>0){ var before=Math.ceil(S.cd); S.cd-=dt; var after=Math.ceil(S.cd);
      if(after!==before||!say.shown){ say.shown=true; if(S.cd>0) say('<span style="font-size:64px;">'+after+'</span>','#fff',700); else say('<span style="font-size:48px;">GO!</span>','#fff',600); } }
    if(S.dead){ S.dead-=dt; if(S.dead<=0){ S.dead=0; finish(false); } }

    // しかけを ならべる（カウントダウン中から 見えるように）
    if(!S.over){
      while(S.nextRow<S.dist+FAR-10){
        var nearGate=Math.abs(S.nextRow-S.nextGate)<34;
        if(!nearGate) spawnRow(S.nextRow);
        S.nextRow+=Math.max(15,30-S.dist*0.006)+rnd(0,8);
      }
    }
    if(run){
      S.v=Math.min(26,12+S.dist*0.0075);
      var step=S.v*dt; S.dist+=step; S.score+=step*0.5;
      var lead=Math.max(95,S.v*6.5);
      if(!S.gate&&S.dist+lead>=S.nextGate){
        if(!spawnGate(S.nextGate)) S.nextGate+=400; }
      if(S.gate&&!S.gate.done&&S.dist>=S.gate.wz){ resolveGate(S.gate); S.nextGate=S.gate.wz+rnd(150,200); }
    }
    // プレイヤー
    var tx=S.lane*LANE; S.x+=(tx-S.x)*Math.min(1,dt*16);
    if(S.y>0||S.vy>0){ S.vy+=GRAV*dt; S.y+=S.vy*dt; if(S.y<=0){ S.y=0; S.vy=0; } }
    if(S.slide>0) S.slide-=dt;
    var p=kid.g.userData, sw=run?Math.sin(S.t*S.v*0.9):0;
    kid.g.position.set(S.x,S.y,0);
    if(S.dead){ kid.g.rotation.x=Math.min(1.4,kid.g.rotation.x+dt*5); }
    else if(S.slide>0){ kid.g.rotation.x=-1.05; kid.g.position.y=S.y+0.25; }
    else { kid.g.rotation.x=0; }
    kid.g.rotation.z=(tx-S.x)*-0.12;
    p.legL.rotation.x=sw*0.9; p.legR.rotation.x=-sw*0.9; p.armL.rotation.x=-sw*0.8; p.armR.rotation.x=sw*0.8;
    if(S.y>0){ p.legL.rotation.x=-0.6; p.legR.rotation.x=0.4; p.armL.rotation.x=-2.4; p.armR.rotation.x=-2.4; }
    p.body.position.y=1.03+(run&&S.y===0?Math.abs(sw)*0.05:0);
    kid.shadow.position.set(S.x,0.03,0); var sc=Math.max(0.4,1-S.y*0.25); kid.shadow.scale.set(sc,sc,sc);

    // もの
    for(var i=S.objs.length-1;i>=0;i--){ var o=S.objs[i];
      if(run&&o.onc) o.wz-=o.onc*dt;
      var z=-(o.wz-S.dist); o.m.position.set(o.lane*LANE,o.y||0,z);
      if(o.kind==='coin'){ o.m.rotation.z+=dt*4;
        if(!o.got&&Math.abs(o.m.position.x-S.x)<0.8&&Math.abs(z)<0.8&&Math.abs((o.y||0.9)-(S.y+0.8))<1.1){ o.got=true; S.coins++; S.score+=10; snd('coin'); o.m.visible=false; } }
      else if(run&&o.kind!=='gate'&&hit(o)) die(o);
      if(z>BEHIND){ scene.remove(o.m); disposeObj(o.m); S.objs.splice(i,1); }
    }
    // かざり
    scroll.forEach(function(s){ s.g.position.z=S.dist%s.period; });
    S.bld.forEach(function(b,bi){ var z=-(b.userData.wz-S.dist); b.position.z=z;
      if(z>BEHIND+12){ var side=b.userData.side, last=null;
        S.bld.forEach(function(o){ if(o.userData.side===side&&(!last||o.userData.wz>last.userData.wz)) last=o; });
        scene.remove(b); disposeObj(b); var nb=makeBuilding(side); nb.userData.side=side;
        nb.userData.wz=last.userData.wz+last.userData.len/2+nb.userData.len/2+rnd(0.8,3);
        nb.position.z=-(nb.userData.wz-S.dist); scene.add(nb); S.bld[bi]=nb; } });
    S.trees.forEach(function(t){ var z=-(t.userData.wz-S.dist); t.position.z=z; if(z>BEHIND){ t.userData.wz+=18*9+rnd(0,8); t.position.x=treeX(t.userData.side); } });
    S.plats.forEach(function(pl){ var z=-(pl.userData.wz-S.dist); pl.position.z=z; if(z>BEHIND+30) pl.userData.wz+=rnd(260,420); });
    clouds.forEach(function(c){ c.position.x+=dt*0.8; if(c.position.x>90) c.position.x=-90; });

    // カメラ
    var shake=S.dead?(Math.random()-0.5)*0.25*S.dead:0;
    cam.position.set(S.x*0.6+shake,4.3+S.y*0.35,8.2);
    cam.lookAt(S.x*0.35,1.4+S.y*0.2,-10);

    // HUD
    if(S.gate&&!S.gate.done){ var cc=document.getElementById('rnChoices');
      if(cc&&cc.dataset.l!==String(S.lane)){ cc.dataset.l=String(S.lane);
        [].forEach.call(cc.children,function(c){ var on=c.getAttribute('data-l')===String(S.lane);
          c.style.background=on?'#1f6f66':'#eef5f1'; c.style.color=on?'#fff':'#1f3b36'; c.style.borderColor=on?'#1f6f66':'#cfe0d8'; }); } }
    if(run&&S.dist>60&&hint.style.display!=='none') hint.style.display='none';
    S.score=Math.max(S.score,0);
    document.getElementById('rnScore').textContent=Math.floor(S.score);
    document.getElementById('rnMeta').textContent=Math.floor(S.dist)+'m　○'+S.right+' ×'+S.wrong;
    document.getElementById('rnCoin').textContent=S.coins;
    renderer.render(scene,cam);
  }
  R.raf=requestAnimationFrame(frame);
  R.debug={S:S,act:act,finish:finish,setPause:setPause,info:function(){ var i=renderer.info; return {calls:i.render.calls,tris:i.render.triangles,geos:i.memory.geometries,tex:i.memory.textures}; }};
  return R;
}

function disposeObj(o){ o.traverse(function(n){
  if(n.geometry&&n.geometry!==M.coinGeo&&n.geometry!==M.trunkGeo&&n.geometry!==M.leafGeo) n.geometry.dispose();
  [].concat(n.material||[]).forEach(function(m){ if(m&&m.userData&&m.userData.own){ if(m.map&&m.userData.ownMap) m.map.dispose(); m.dispose(); } }); }); }
function own(m,withMap){ m.userData.own=true; if(withMap) m.userData.ownMap=true; return m; }

function stop(){
  if(!R||!R.renderer) { R={}; return; }
  cancelAnimationFrame(R.raf); if(R.off) R.off();
  try{ R.scene.traverse(function(n){ if(n.geometry) n.geometry.dispose(); }); }catch(e){}
  try{ R.renderer.dispose(); R.renderer.forceContextLoss(); }catch(e){}
  if(R.root){ R.root.innerHTML=''; R.root.style.display='none'; }
  R={};
}

window.EigoRunner={ start:function(o){ o.container.style.display='block'; return start(o); }, stop:stop, _dbg:function(){ return R.debug; } };
})();
