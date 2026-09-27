/* えいごタワー — みちを すすんでくる てきの ぐんだんから おしろを まもる 3D タワーディフェンス（Three.js）
   ・たてる ばしょ（🪙の まる）を タップ → タワーを たてる。タワーを タップ → レベルアップ
   ・てきを たおすと コイン。コインで タワーを ふやす／つよくする
   ・ウェーブの まえに えいごの もんだい：せいかいで コイン＋かみなり（⚡ボタンで てきの むれに おとす）
   ・さいごの ウェーブは ボス。ぜんぶ たおすと ステージクリア。てきが おしろに はいると ❤️ が へる
   app.js から EigoTower.start({...}) で よぶ。THREE と WAR_GFX を さきに 読みこんでおく。 */
(function(){
'use strict';
var R={}, FONT='"Hiragino Maru Gothic ProN","Hiragino Sans","M PLUS Rounded 1c","Noto Sans JP",sans-serif';
var MAX_EN=700, MAX_P=200;
function rnd(a,b){ return a+Math.random()*(b-a); }
function el(tag,css,html){ var e=document.createElement(tag); if(css) e.style.cssText=css; if(html!=null) e.innerHTML=html; return e; }
function escH(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function furi(t,y){ var a=0,b=0; while(a<t.length&&a<y.length&&t[a]===y[a]&&!/[一-鿿々]/.test(t[a])) a++; while(b<t.length-a&&b<y.length-a&&t[t.length-1-b]===y[y.length-1-b]&&!/[一-鿿々]/.test(t[t.length-1-b])) b++; return [t.slice(0,a),t.slice(a,t.length-b),y.slice(a,y.length-b),t.slice(t.length-b)]; }
function rb(t,y){ if(!(y&&/[一-鿿々]/.test(t))) return escH(t); var f=furi(t,y); return escH(f[0])+'<ruby style="white-space:nowrap;">'+escH(f[1])+'<rt style="font-size:.5em;">'+escH(f[2])+'</rt></ruby>'+escH(f[3]); }

// タワーの つよさ（lv1〜3）。cost＝その レベルに する コイン
var TW=[null,
  {cost:20,dmg:2,rate:1.1,range:3.9,splash:0},
  {cost:30,dmg:3,rate:1.6,range:4.3,splash:0},
  {cost:50,dmg:5,rate:1.8,range:4.7,splash:1.0}];
// てきの しゅるい：hp＝きほんの なんばい、spd＝はやさ、sc＝おおきさ、coin、dmg＝おしろへの ダメージ
var ET={n:{hp:1,spd:1.5,sc:1.2,coin:1,dmg:1},f:{hp:0.6,spd:2.5,sc:1.0,coin:1,dmg:1},b:{hp:5,spd:1.0,sc:1.9,coin:4,dmg:3},boss:{hp:45,spd:0.65,sc:1,coin:30,dmg:10}};

function start(opt){
  stop();
  var GX=window.WAR_GFX;
  var root=opt.container; root.innerHTML='';
  root.style.cssText='position:fixed;inset:0;z-index:200;overflow:hidden;background:#3f8f4a;touch-action:none;user-select:none;-webkit-user-select:none;';
  var renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
  root.appendChild(renderer.domElement); renderer.domElement.style.cssText='display:block;width:100%;height:100%;';
  GX.setup(renderer);
  var scene=new THREE.Scene(); scene.background=new THREE.Color(0x9fd3f0);
  var cam=new THREE.PerspectiveCamera(50,1,0.1,200);
  scene.add(new THREE.HemisphereLight(0xf2f8ff,0x557a4a,0.9));
  var key=new THREE.DirectionalLight(0xfff1dc,0.9); key.position.set(-6,16,8); scene.add(key);
  R={renderer:renderer,scene:scene,root:root,raf:0};

  // --- みち（くねくね） ---
  var PTS=[[-3.8,-17],[-3.8,-10.5],[0,-9.6],[3.9,-8],[4,-3.2],[0.5,-1.4],[-3.9,0.2],[-4,4.6],[-0.5,6.2],[3.6,7.6],[3.4,11],[0.6,12.4],[0,14.2]];
  PTS=PTS.map(function(p){ return [p[0],p[1]*0.8]; });   // たてながの がめんに おさまるように
  var curve=new THREE.CatmullRomCurve3(PTS.map(function(p){ return new THREE.Vector3(p[0],0,p[1]); }),false,'catmullrom',0.3);
  var PLEN=curve.getLength(), NS=600, samp=curve.getSpacedPoints(NS);
  function atS(s){ var f=Math.max(0,Math.min(1,s/PLEN))*NS, i=Math.min(NS-1,Math.floor(f)), k=f-i, a=samp[i], b=samp[i+1];
    return {x:a.x+(b.x-a.x)*k, z:a.z+(b.z-a.z)*k, dx:b.x-a.x, dz:b.z-a.z}; }
  function distToPath(x,z){ var m=1e9; for(var i=0;i<=NS;i+=3){ var d=(samp[i].x-x)*(samp[i].x-x)+(samp[i].z-z)*(samp[i].z-z); if(d<m) m=d; } return Math.sqrt(m); }

  // じめん
  (function ground(){
    var g=new THREE.PlaneGeometry(40,50,40,50); g.rotateX(-Math.PI/2);
    var pos=g.attributes.position, col=new Float32Array(pos.count*3), c=new THREE.Color();
    for(var i=0;i<pos.count;i++){ var x=pos.getX(i), z=pos.getZ(i), d=distToPath(x,z);
      var n=Math.sin(x*1.3)*Math.cos(z*1.1)*0.5+Math.sin(x*0.4+z*0.7)*0.5;
      c.setHSL(0.3+n*0.015,0.5,0.4+n*0.04); if(d<2.2) c.multiplyScalar(0.8+0.2*Math.max(0,d-1.2));
      col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; }
    g.setAttribute('color',new THREE.BufferAttribute(col,3));
    var m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true})); m.position.z=-1; scene.add(m);
    // みちの おび（ふち＋すな いろ）
    function strip(wd,y,color){ var pos2=[], idx=[];
      for(var i=0;i<=NS;i++){ var a=samp[Math.max(0,i-1)], b=samp[Math.min(NS,i+1)], dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz)||1, nx=-dz/l*wd, nz=dx/l*wd;
        pos2.push(samp[i].x+nx,y,samp[i].z+nz, samp[i].x-nx,y,samp[i].z-nz); if(i<NS) idx.push(i*2,i*2+1,i*2+2, i*2+1,i*2+3,i*2+2); }
      var sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute(pos2,3)); sg.setIndex(idx); sg.computeVertexNormals();
      var mm=new THREE.Mesh(sg,new THREE.MeshLambertMaterial({color:color,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-y*40,polygonOffsetUnits:-y*40})); scene.add(mm); }
    strip(1.2,0.03,'#b08a5a'); strip(1.0,0.08,'#e3c795');
  })();
  // かざり：がけ・き・いわ（1つに まとめる）
  var DEC=[], P=GX.part;
  [[-8.6,-10,3,4.2,7],[8.4,-4,2.6,3.2,6],[-8.3,5,2.4,2.6,8],[8.6,10,2.2,3.6,6],[-6.5,-16,14,2.5,2.5],[6,-15.5,9,3.5,2.5]].forEach(function(c2){
    DEC.push(P(new THREE.BoxGeometry(c2[2],c2[3],c2[4]),'#8b8f96',c2[0],c2[3]/2,c2[1]));
    DEC.push(P(new THREE.BoxGeometry(c2[2]+0.1,0.35,c2[4]+0.1),'#4fa35a',c2[0],c2[3]+0.1,c2[1])); });
  var treeSpots=[];
  for(var t=0;t<70;t++){ var tx=rnd(-9,9), tz=rnd(-16,14); if(distToPath(tx,tz)<2.4) continue; treeSpots.push([tx,tz]); }
  // たてる ばしょ（みちの そば）
  var pads=[];
  (function(){ var cand=[];
    for(var s=4;s<PLEN-4;s+=1.2){ var p=atS(s), l=Math.hypot(p.dx,p.dz)||1, nx=-p.dz/l, nz=p.dx/l;
      [1,-1].forEach(function(sd){ cand.push({x:p.x+nx*2.25*sd,z:p.z+nz*2.25*sd,s:s}); }); }
    cand.sort(function(){ return Math.random()-0.5; });
    cand.forEach(function(c3){ if(pads.length>=10) return; if(Math.abs(c3.x)>6.6||c3.z<-11.8||c3.z>9.8) return;
      if(distToPath(c3.x,c3.z)<2.0) return; if(pads.some(function(q){ return Math.hypot(q.x-c3.x,q.z-c3.z)<3.0; })) return;
      pads.push({x:c3.x,z:c3.z,lv:0,cd:0,mesh:null,aim:0}); });
  })();
  treeSpots=treeSpots.filter(function(q){ return !pads.some(function(p){ return Math.hypot(p.x-q[0],p.z-q[1])<1.4; }); });
  treeSpots.forEach(function(q){ var h=rnd(0.9,1.5);
    DEC.push(P(new THREE.CylinderGeometry(0.1,0.13,0.5,5),'#7a5230',q[0],0.25,q[1]));
    DEC.push(P(new THREE.ConeGeometry(0.55*h,1.4*h,7),'#2f7d3b',q[0],0.5+0.7*h,q[1])); });
  // てきの もん（うえ）と おしろ（した）
  var g0=PTS[0];
  DEC.push(P(new THREE.BoxGeometry(3.4,1.8,1),'#7c4a33',g0[0],0.9,g0[1]+1), P(new THREE.BoxGeometry(1.6,1.3,1.05),'#2a1a12',g0[0],0.65,g0[1]+1.02));
  DEC.push(P(new THREE.ConeGeometry(1.2,1.2,4),'#b91c1c',g0[0]-1.4,2.4,g0[1]+1), P(new THREE.ConeGeometry(1.2,1.2,4),'#b91c1c',g0[0]+1.4,2.4,g0[1]+1));
  DEC.push(P(new THREE.CylinderGeometry(0.5,0.55,2.4,8),'#8d5a3d',g0[0]-1.4,1.2,g0[1]+1), P(new THREE.CylinderGeometry(0.5,0.55,2.4,8),'#8d5a3d',g0[0]+1.4,1.2,g0[1]+1));
  var CS={x:0,z:12.4};
  DEC.push(P(new THREE.BoxGeometry(4.6,1.6,2.4),'#e8e2d4',CS.x,0.8,CS.z), P(new THREE.BoxGeometry(1.3,1.05,0.1),'#5b3a1e',CS.x,0.55,CS.z-1.22));
  [[-2.2,-1.1],[2.2,-1.1],[-2.2,1.1],[2.2,1.1]].forEach(function(o){ DEC.push(P(new THREE.CylinderGeometry(0.6,0.65,2.6,10),'#f1ece1',CS.x+o[0],1.3,CS.z+o[1]), P(new THREE.ConeGeometry(0.8,1.2,10),'#2563eb',CS.x+o[0],3.2,CS.z+o[1])); });
  DEC.push(P(new THREE.BoxGeometry(2,1.6,1.4),'#f1ece1',CS.x,2.4,CS.z+0.2), P(new THREE.ConeGeometry(1.4,1.4,4),'#1d4ed8',CS.x,3.9,CS.z+0.2));
  DEC.push(P(new THREE.CylinderGeometry(0.03,0.03,1.4,4),'#555',CS.x,5.2,CS.z+0.2), P(new THREE.BoxGeometry(0.7,0.4,0.03),'#fbbf24',CS.x+0.36,5.7,CS.z+0.2));
  var decM=new THREE.Mesh(GX.merge(DEC),new THREE.MeshLambertMaterial({vertexColors:true})); scene.add(decM);
  // たてる ばしょの まる
  var padGeo=new THREE.CylinderGeometry(0.85,0.95,0.14,20), padMat=new THREE.MeshLambertMaterial({color:0xcdb88f});
  var ringMat=new THREE.MeshBasicMaterial({color:0xffe066,transparent:true,opacity:0.8});
  pads.forEach(function(p){ var m=new THREE.Mesh(padGeo,padMat); m.position.set(p.x,0.07,p.z); scene.add(m); p.base=m;
    var r=new THREE.Mesh(new THREE.RingGeometry(0.72,0.86,24),ringMat); r.rotation.x=-Math.PI/2; r.position.set(p.x,0.16,p.z); scene.add(r); p.ring=r; });

  // タワーの かたち（レベルで かわる）
  var towerMat=new THREE.MeshLambertMaterial({vertexColors:true});
  function towerGeo(lv){ var h=[0,1.5,2.0,2.5][lv], roof=['','#8b5a2b','#2563eb','#f59e0b'][lv], L=[];
    L.push(P(new THREE.CylinderGeometry(0.62,0.75,h,10),lv===3?'#d6d3d1':'#a8a29e',0,h/2,0));
    for(var i=0;i<8;i++){ var a=i/8*Math.PI*2; L.push(P(new THREE.BoxGeometry(0.2,0.26,0.2),'#d6d3d1',Math.cos(a)*0.62,h+0.12,Math.sin(a)*0.62)); }
    L.push(P(new THREE.CylinderGeometry(0.7,0.7,0.1,10),'#78716c',0,h,0));
    L.push(P(new THREE.BoxGeometry(0.34,0.5,0.06),'#44403c',0,h*0.45,0.66));
    if(lv>=2){ L.push(P(new THREE.CylinderGeometry(0.66,0.66,0.12,10),roof,0,h*0.6,0)); }
    return GX.merge(L); }
  var TG=[null,towerGeo(1),towerGeo(2),towerGeo(3)];
  function archerGeo(lv){ var L=[P(new THREE.BoxGeometry(0.3,0.36,0.22),'#2563eb',0,0.18,0), P(new THREE.SphereGeometry(0.15,8,6),'#f2c7a5',0,0.5,0), P(new THREE.SphereGeometry(0.165,8,6,0,Math.PI*2,0,Math.PI/2),'#1d4ed8',0,0.53,0)];
    if(lv===3){ L.push(P(new THREE.CylinderGeometry(0.13,0.16,0.8,8).rotateX(Math.PI/2),'#374151',0,0.2,-0.35)); }
    else L.push(P(new THREE.BoxGeometry(0.62,0.05,0.07),'#7c4a1e',0,0.3,-0.2), P(new THREE.BoxGeometry(0.05,0.05,0.5),'#a16207',0,0.3,-0.25));
    return GX.merge(L); }
  var AG=[null,archerGeo(1),archerGeo(2),archerGeo(3)];
  function setTower(p){ if(p.mesh) scene.remove(p.mesh);
    var g=new THREE.Group(); g.add(new THREE.Mesh(TG[p.lv],towerMat)); var h=[0,1.5,2.0,2.5][p.lv];
    var ar=new THREE.Mesh(AG[p.lv],towerMat); ar.position.y=h+0.05; g.add(ar); p.archer=ar;
    g.position.set(p.x,0.14,p.z); scene.add(g); p.mesh=g; p.ring.visible=false; }

  var enA=GX.army(scene,'red',MAX_EN), fx=GX.particles(scene,600);
  var bossM=GX.boss(scene); bossM.g.visible=false; bossM.g.scale.setScalar(0.42);
  var pMesh=GX.bullets(scene,MAX_P), _c=new THREE.Color(), tmp=new THREE.Object3D();
  var bolt=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.5,30,8,1,true),new THREE.MeshBasicMaterial({color:0xbfe6ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  bolt.visible=false; scene.add(bolt);
  var boom=new THREE.Mesh(new THREE.RingGeometry(0.2,1,32),new THREE.MeshBasicMaterial({color:0xfff3b0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  boom.rotation.x=-Math.PI/2; boom.position.y=0.1; boom.visible=false; scene.add(boom);

  // --- HUD ---
  var hud=el('div','position:absolute;inset:0;pointer-events:none;font-family:'+FONT+';'); root.appendChild(hud);
  var pill='background:rgba(20,50,30,.82);color:#fff;border-radius:12px;padding:6px 12px;font-weight:900;';
  var topL=el('div','position:absolute;left:10px;top:calc(10px + env(safe-area-inset-top));display:flex;gap:6px;');
  topL.appendChild(el('div',pill,'<div style="font-size:10px;opacity:.75;">STAGE</div><div id="twStage" style="font-size:18px;line-height:1.1;"></div>'));
  topL.appendChild(el('div',pill,'<div style="font-size:10px;opacity:.75;">ウェーブ</div><div id="twWave" style="font-size:18px;line-height:1.1;"></div>'));
  hud.appendChild(topL);
  var right=el('div','position:absolute;right:10px;top:calc(10px + env(safe-area-inset-top));display:flex;gap:6px;align-items:center;pointer-events:auto;');
  right.appendChild(el('div',pill+'font-size:16px;','❤️ <span id="twHp"></span>'));
  right.appendChild(el('div',pill+'font-size:16px;','🪙 <span id="twCoin"></span>'));
  var pauseBtn=el('button',pill+'font-size:18px;border:none;width:40px;height:40px;padding:0;cursor:pointer;','Ⅱ'); right.appendChild(pauseBtn); hud.appendChild(right);
  var boltBtn=el('button','position:absolute;right:14px;bottom:calc(18px + env(safe-area-inset-bottom));pointer-events:auto;border:3px solid #fff;border-radius:50%;width:74px;height:74px;font-size:30px;font-weight:900;background:radial-gradient(circle at 35% 30%,#fde68a,#f59e0b);color:#7c2d12;box-shadow:0 4px 14px rgba(0,0,0,.35);display:none;cursor:pointer;font-family:inherit;line-height:1;','⚡<div id="twBolt" style="font-size:13px;"></div>');
  hud.appendChild(boltBtn);
  var labels=el('div','position:absolute;inset:0;'); hud.appendChild(labels);
  var toast=el('div','position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-weight:900;font-size:32px;color:#fff;-webkit-text-stroke:6px rgba(20,40,20,.85);paint-order:stroke fill;opacity:0;transition:opacity .2s;text-align:center;white-space:nowrap;');
  hud.appendChild(toast);
  var hint=el('div','position:absolute;left:50%;bottom:calc(22px + env(safe-area-inset-bottom));transform:translateX(-50%);'+pill+'font-size:13px;text-align:center;line-height:1.7;white-space:nowrap;',
    '🪙の まるを タップで タワーを たてる<br>タワーを タップで レベルアップ<br><span style="color:#fde047;">えいごに せいかいで コインと ⚡かみなり！</span>');
  hud.appendChild(hint);
  var panel=el('div','position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,30,20,.45);pointer-events:auto;'); root.appendChild(panel);
  function say(t,color,ms){ toast.innerHTML=t; toast.style.color=color||'#fff'; toast.style.opacity='1'; clearTimeout(say.t); say.t=setTimeout(function(){ toast.style.opacity='0'; },ms||900); }
  function snd(k){ try{ opt.sfx&&opt.sfx(k); }catch(e){} }
  function showPanel(html,btns){ panel.innerHTML=''; panel.style.display='flex';
    var card=el('div','background:#fffaf0;border-radius:18px;padding:20px 18px;width:min(88vw,350px);text-align:center;font-family:'+FONT+';color:#14532d;box-shadow:0 10px 30px rgba(0,0,0,.25);',html);
    btns.forEach(function(b){ var bt=el('button','display:block;width:100%;margin-top:10px;border:none;border-radius:12px;padding:13px 8px;font-size:17px;font-weight:900;color:#fff;background:'+b.c+';font-family:inherit;cursor:pointer;line-height:1.5;',b.t);
      bt.onclick=function(e){ e.stopPropagation(); b.f(); }; card.appendChild(bt); });
    panel.appendChild(card); }

  // --- じょうたい ---
  var stage=Math.max(1,opt.stage||1), NW=4+Math.min(4,stage);
  var S={coins:40,hp:20,maxHp:20,wave:0,phase:'prep',prepT:0,spawnQ:[],spawnT:0,en:[],proj:[],bolts:0,right:0,wrong:0,kills:0,over:false,paused:false,last:0,t:0,shake:0};
  R.S=S;
  document.getElementById('twStage').textContent=stage;
  function baseHp(w){ return 4*(1+0.22*(w-1))*(1+0.3*(stage-1)); }
  function makeWave(w){ var q=[], n=8+w*4+stage*2, i;
    for(i=0;i<n;i++){ var r=Math.random(), ty=(w>=2&&r<0.22)?'f':(w>=3&&r<0.3)?'b':'n'; q.push({ty:ty,gap:ty==='b'?0.9:0.5}); }
    if(w===NW){ q.splice(Math.floor(n*0.6),0,{ty:'boss',gap:1.2}); }
    return q; }
  function hud2(){ document.getElementById('twHp').textContent=Math.max(0,S.hp); document.getElementById('twCoin').textContent=S.coins;
    document.getElementById('twWave').textContent=Math.min(S.wave,NW)+'/'+NW; boltBtn.style.display=S.bolts>0&&!S.over?'block':'none'; document.getElementById('twBolt').textContent='×'+S.bolts; }

  // --- えいごの もんだい（ウェーブの まえ） ---
  function askEnglish(then){
    var q=opt.getQuestion&&opt.getQuestion(); if(!q){ then(); return; } S.q=q;
    var order=[0,1,2].slice(0,q.choices.length).sort(function(){ return Math.random()-0.5; }), t0=Date.now();
    S.paused=true; S.asking=true;
    try{ opt.speak&&opt.speak(q.en); }catch(e){}
    var bonus=15+S.wave*5;
    showPanel('<div style="font-size:12px;font-weight:800;opacity:.7;">えいごチャレンジ　せいかいで 🪙+'+bonus+' と ⚡</div>'+
      '<div style="font-size:34px;font-weight:900;font-family:Arial,Helvetica,sans-serif;color:#1e3a8a;margin:6px 0 4px;">'+escH(q.en)+'</div>'+
      '<div style="font-size:12px;opacity:.7;">いみは どれ？</div>',
      order.map(function(ci){ return {t:rb(q.choices[ci],(q.yomi||[])[ci]),c:'#15803d',f:function(){
        var ok=ci===0; try{ opt.onAnswer&&opt.onAnswer(q.en,ok,Date.now()-t0); }catch(e){}
        panel.style.display='none'; S.paused=false; S.asking=false; S.last=0;
        if(ok){ S.right++; S.coins+=bonus; S.bolts++; snd('correct'); say('せいかい！ 🪙+'+bonus+' ⚡','#bbf7d0',1300); }
        else { S.wrong++; snd('wrong'); say('<span style="font-size:22px;">'+escH(q.en)+' ＝ '+rb(q.choices[0],(q.yomi||[])[0])+'</span>','#fecaca',2000); }
        hud2(); then(); }}; }));
  }
  function nextWave(){ S.wave++; hud2();
    askEnglish(function(){ S.phase='prep'; S.prepT=S.wave===1?1.5:3; setTimeout(function(){ if(!S.over) say('ウェーブ '+S.wave+(S.wave===NW?'　ボスが くる！':''),S.wave===NW?'#fecaca':'#fff',1300); },S.wave===1?0:1400); }); }

  // --- タップ：たてる／レベルアップ／かみなり ---
  var ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), gpl=new THREE.Plane(new THREE.Vector3(0,1,0),0), hitP=new THREE.Vector3();
  function tap(e){ if(S.over||S.paused) return; var p=e.touches?e.touches[0]:e, rc=renderer.domElement.getBoundingClientRect();
    ndc.set((p.clientX-rc.left)/rc.width*2-1,-(p.clientY-rc.top)/rc.height*2+1); ray.setFromCamera(ndc,cam);
    if(!ray.ray.intersectPlane(gpl,hitP)) return;
    var best=null, bd=1.6; pads.forEach(function(q){ var d=Math.hypot(q.x-hitP.x,q.z-hitP.z); if(q.lv>0) d=Math.min(d,Math.hypot(q.x-hitP.x,q.z-1.2-hitP.z)); if(d<bd){ bd=d; best=q; } });
    if(!best) return; hint.style.display='none';
    if(best.lv>=3){ say('MAX！','#fde68a',600); return; }
    var c=TW[best.lv+1].cost; if(S.coins<c){ say('🪙が たりない','#fecaca',700); snd('wrong'); return; }
    S.coins-=c; best.lv++; setTower(best); snd(best.lv===1?'coin':'correct'); fx.burst(best.x,1.5,best.z,24,best.lv===1?0xfff1b8:0x93c5fd,4,0.7);
    say(best.lv===1?'タワー！':'レベル '+best.lv+'！','#fff',700); hud2(); }
  renderer.domElement.addEventListener('pointerdown',tap);
  boltBtn.onclick=function(e){ e.stopPropagation(); if(S.bolts<=0||S.over||S.paused) return;
    var best=null, bn=-1; S.en.forEach(function(a){ if(a.dead) return; var n=0; S.en.forEach(function(b){ if(!b.dead&&Math.hypot(a.x-b.x,a.z-b.z)<2.6) n++; }); if(a.ty==='boss') n+=6; if(n>bn){ bn=n; best=a; } });
    if(!best){ say('てきが いない','#fff',600); return; }
    S.bolts--; hud2(); var bx=best.x, bz=best.z, dmg=baseHp(S.wave)*8;
    S.en.forEach(function(a){ if(!a.dead&&Math.hypot(a.x-bx,a.z-bz)<2.8) hurt(a,a.ty==='boss'?dmg*0.6:dmg); });
    bolt.position.set(bx,15,bz); bolt.visible=true; bolt.material.opacity=1; boom.position.set(bx,0.1,bz); boom.visible=true; boom.material.opacity=1; boom.scale.setScalar(0.5); S.boltT=0.5;
    fx.burst(bx,0.5,bz,60,0xbfe6ff,8,0.8); fx.burst(bx,0.5,bz,30,0xffffff,4,0.5); S.shake=0.9; snd('crash'); };

  // --- ポーズ ---
  function setPause(p){ if(S.asking) return; S.paused=p; pauseBtn.textContent=p?'▶':'Ⅱ';
    if(p) showPanel('<div style="font-size:26px;font-weight:900;margin-bottom:14px;">ひとやすみ</div>',[{t:'つづける',c:'#15803d',f:function(){ setPause(false); }},{t:'やめる',c:'#8a9392',f:function(){ finish(false,true); }}]);
    else { panel.style.display='none'; S.last=0; } }
  pauseBtn.onclick=function(e){ e.stopPropagation(); if(!S.over) setPause(!S.paused); };
  function vis(){ if(document.hidden&&!S.over&&!S.asking) setPause(true); } document.addEventListener('visibilitychange',vis);
  function resize(){ var w=root.clientWidth||window.innerWidth, h=root.clientHeight||window.innerHeight; renderer.setSize(w,h,false); cam.aspect=w/h;
    var a=w/h; cam.fov=a<0.6?52:a<0.8?48:40; cam.position.set(0,a<0.8?27:22,a<0.8?19:17); cam.lookAt(0,0,a<0.8?0.2:0); cam.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize',resize);
  R.off=function(){ window.removeEventListener('resize',resize); document.removeEventListener('visibilitychange',vis); };

  // --- たたかい ---
  function hurt(a,d){ if(a.dead) return; a.hp-=d; a.flash=0.08;
    if(a.hp<=0){ a.dead=true; S.kills++; var et=ET[a.ty]; S.coins+=et.coin; hud2();
      fx.burst(a.x,0.6,a.z,a.ty==='boss'?60:6,0xffd34d,a.ty==='boss'?6:2.5,0.5); if(a.ty==='boss'){ snd('fanfare'); say('ボス げきは！','#fde047',1300); S.shake=1; }
      else if(Math.random()<0.25) snd('coin'); } }
  function spawn(ty){ var et=ET[ty], hp=baseHp(S.wave)*et.hp; S.en.push({ty:ty,s:0,off:ty==='boss'?0:rnd(-0.55,0.55),hp:hp,max:hp,spd:et.spd*rnd(0.92,1.08),ph:Math.random()*6,x:PTS[0][0],z:PTS[0][1],dead:false,flash:0}); }
  function frame(now){
    R.raf=requestAnimationFrame(frame);
    var dt=S.last?Math.min(0.05,(now-S.last)/1000):0; S.last=now;
    if(!S.paused&&!S.over){ S.t+=dt; step(dt); }
    draw(dt);
  }
  function step(dt){
    // ウェーブ
    if(S.phase==='prep'){ if(S.wave>0){ S.prepT-=dt; if(S.prepT<=0){ S.phase='run'; S.spawnQ=makeWave(S.wave); S.spawnT=0; } } }
    else if(S.phase==='run'){
      S.spawnT-=dt; if(S.spawnQ.length&&S.spawnT<=0){ var it=S.spawnQ.shift(); spawn(it.ty); S.spawnT=it.gap; }
      if(!S.spawnQ.length&&!S.en.some(function(a){ return !a.dead; })){ S.en=[];
        if(S.wave>=NW){ finish(true); return; }
        S.phase='wait'; S.coins+=5+S.wave*2; hud2(); say('ウェーブ クリア！ 🪙+'+(5+S.wave*2),'#bbf7d0',1100); setTimeout(function(){ if(!S.over) nextWave(); },1300); } }
    // てきが すすむ
    for(var i=0;i<S.en.length;i++){ var a=S.en[i]; if(a.dead) continue; a.s+=a.spd*dt; a.flash-=dt;
      var p=atS(a.s), l=Math.hypot(p.dx,p.dz)||1; a.x=p.x-p.dz/l*a.off; a.z=p.z+p.dx/l*a.off; a.hx=p.dx/l; a.hz=p.dz/l;
      if(a.s>=PLEN-0.8){ a.dead=true; S.hp-=ET[a.ty].dmg; S.shake=0.5; snd('crash'); fx.burst(a.x,0.8,a.z,10,0xff5a3c,3,0.5); hud2();
        if(S.hp<=0){ S.hp=0; hud2(); finish(false); return; } } }
    if(S.en.length>60&&S.en.filter(function(a){ return a.dead; }).length>30) S.en=S.en.filter(function(a){ return !a.dead; });
    // タワーが うつ
    pads.forEach(function(q){ if(!q.lv) return; var T=TW[q.lv]; q.cd-=dt; if(q.cd>0) return;
      var tg=null, far=-1; for(var j=0;j<S.en.length;j++){ var a=S.en[j]; if(a.dead) continue; if(Math.hypot(a.x-q.x,a.z-q.z)<=T.range&&a.s>far){ far=a.s; tg=a; } }
      if(!tg) return; q.cd=1/T.rate; q.aim=Math.atan2(-(tg.x-q.x),-(tg.z-q.z));
      var h=[0,1.5,2.0,2.5][q.lv]+0.5; S.proj.push({x:q.x,y:h,z:q.z,sx:q.x,sy:h,sz:q.z,tg:tg,t:0,dur:q.lv===3?0.45:0.28,lv:q.lv}); });
    for(var k=S.proj.length-1;k>=0;k--){ var pr=S.proj[k]; pr.t+=dt; var f=Math.min(1,pr.t/pr.dur);
      pr.x=pr.sx+(pr.tg.x-pr.sx)*f; pr.z=pr.sz+(pr.tg.z-pr.sz)*f; pr.y=pr.sy+(0.6-pr.sy)*f+Math.sin(f*Math.PI)*(pr.lv===3?1.4:0.5);
      if(f>=1){ var T2=TW[pr.lv];
        if(T2.splash){ S.en.forEach(function(a){ if(!a.dead&&Math.hypot(a.x-pr.x,a.z-pr.z)<=T2.splash) hurt(a,T2.dmg); }); fx.burst(pr.x,0.5,pr.z,14,0xff8a3d,3.5,0.45); }
        else { hurt(pr.tg,T2.dmg); if(Math.random()<0.4) fx.emit(pr.x,0.7,pr.z,rnd(-1,1),1.5,rnd(-1,1),0xfff1b8,0.25); }
        S.proj.splice(k,1); } }
  }
  var lbl=[];   // たてる ばしょの ラベル
  pads.forEach(function(){ var d=el('div','position:absolute;transform:translate(-50%,-100%);font-weight:900;font-size:12px;border-radius:9px;padding:1px 7px;white-space:nowrap;border:2px solid #fff;'); labels.appendChild(d); lbl.push(d); });
  var proj=new THREE.Vector3();
  function toScreen(x,y,z){ proj.set(x,y,z).project(cam); return {x:(proj.x*0.5+0.5)*root.clientWidth,y:(-proj.y*0.5+0.5)*root.clientHeight}; }
  var bossLab=el('div','position:absolute;transform:translate(-50%,-100%);display:none;width:60px;height:8px;background:#111;border:2px solid #fff;border-radius:5px;overflow:hidden;','<div style="height:100%;background:#ef4444;width:100%;"></div>'); labels.appendChild(bossLab);
  function draw(dt){
    // てき
    enA.begin(); var boss=null;
    for(var i=0;i<S.en.length;i++){ var a=S.en[i]; if(a.dead) continue; if(a.ty==='boss'){ boss=a; continue; }
      enA.put(a.x,a.flash>0?0.08:0,a.z,Math.atan2(-(a.hx||0),-(a.hz||1)),S.t*9*a.spd/1.5+a.ph,ET[a.ty].sc); }
    enA.end();
    if(boss){ bossM.g.visible=true; bossM.g.position.set(boss.x,0,boss.z); bossM.g.rotation.y=Math.atan2(boss.hx||0,boss.hz||1); bossM.anim(S.t,true,false,boss.flash>0);
      var bp=toScreen(boss.x,2.9,boss.z); bossLab.style.display='block'; bossLab.style.left=bp.x+'px'; bossLab.style.top=bp.y+'px'; bossLab.firstChild.style.width=Math.max(0,boss.hp/boss.max*100)+'%'; }
    else { bossM.g.visible=false; bossLab.style.display='none'; }
    // たま
    for(var k=0;k<S.proj.length;k++){ var pr=S.proj[k], big=pr.lv===3;
      tmp.position.set(pr.x,pr.y,pr.z); tmp.rotation.set(0,Math.atan2(pr.tg.x-pr.sx,pr.tg.z-pr.sz),0); tmp.scale.set(big?5:1.6,big?5:1.6,big?0.35:0.5); tmp.updateMatrix(); pMesh.setMatrixAt(k,tmp.matrix);
      _c.setHex(big?0xff7a2a:pr.lv===2?0xbfe6ff:0xffe27a); pMesh.setColorAt(k,_c); }
    pMesh.count=S.proj.length; pMesh.instanceMatrix.needsUpdate=true; if(pMesh.instanceColor) pMesh.instanceColor.needsUpdate=true;
    // タワーの ゆみ
    pads.forEach(function(q,idx){ if(q.archer) q.archer.rotation.y+=(((q.aim-q.archer.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI)*Math.min(1,dt*12);
      var d=lbl[idx], sp=toScreen(q.x,q.lv?[0,1.5,2.0,2.5][q.lv]+1.3:0.5,q.z);
      if(q.lv>=3||S.over){ d.style.display='none'; return; } var c=TW[q.lv+1].cost, ok=S.coins>=c;
      d.style.display='block'; d.style.left=sp.x+'px'; d.style.top=sp.y+'px';
      var txt=(q.lv?'⬆':'')+'🪙'+c; if(d._t!==txt+ok){ d._t=txt+ok; d.textContent=txt; d.style.background=ok?(q.lv?'#2563eb':'#16a34a'):'rgba(60,60,60,.75)'; d.style.color='#fff'; d.style.opacity=ok?'1':'.8'; }
      if(!q.lv){ q.ring.material=ok?ringMat:ringMat; q.ring.scale.setScalar(ok?1+Math.sin(S.t*5)*0.06:1); } });
    // かみなり
    if(S.boltT>0){ S.boltT-=dt; var k2=Math.max(0,S.boltT/0.5); bolt.material.opacity=k2; boom.material.opacity=k2; boom.scale.setScalar(0.5+(1-k2)*3.5); if(S.boltT<=0){ bolt.visible=false; boom.visible=false; } }
    fx.update(dt,0);
    var sh=S.shake||0; S.shake=Math.max(0,sh-dt*2.5); var bx=cam.position.x, by=cam.position.y;
    cam.position.x=bx+(Math.random()-0.5)*sh*0.5; cam.position.y=by+(Math.random()-0.5)*sh*0.5;
    renderer.render(scene,cam); cam.position.x=bx; cam.position.y=by;
  }
  function finish(win,quit){
    if(S.over) return; S.over=true; panel.style.display='none'; S.asking=false;
    var res={win:!!win,quit:!!quit,stage:stage,wave:S.wave,waves:NW,right:S.right,wrong:S.wrong,kills:S.kills,hp:S.hp};
    var extra={}; try{ extra=opt.onEnd?opt.onEnd(res)||{}:{}; }catch(e){}
    hud2();
    setTimeout(function(){ if(!R.S||R.S!==S) return;
      showPanel('<div style="font-size:14px;font-weight:800;opacity:.7;">STAGE '+stage+'</div>'+
      '<div style="font-size:30px;font-weight:900;line-height:1.2;margin:4px 0 10px;color:'+(win?'#15803d':'#b91c1c')+';">'+(win?'おしろを まもった！':(quit?'おつかれさま':'おしろが おちた…'))+'</div>'+
      '<div style="display:flex;justify-content:space-around;background:#ecfdf5;border-radius:12px;padding:10px 4px;font-weight:900;font-size:15px;">'+
      '<div>🌊 '+Math.min(S.wave,NW)+'/'+NW+'</div><div>💥 '+S.kills+'</div><div style="color:#16a34a;">○ '+S.right+'</div><div style="color:#dc2626;">× '+S.wrong+'</div></div>'+
      (extra.reward?'<div style="font-size:12px;font-weight:800;margin-top:10px;opacity:.8;">'+extra.reward+'</div>':''),
      [{t:extra.retryLabel||'つぎへ',c:'#15803d',f:function(){ if(opt.onRetry) opt.onRetry(); }},{t:'もどる',c:'#8a9392',f:function(){ stop(); if(opt.onExit) opt.onExit(); }}]); },win?1200:600);
  }
  hud2();
  R.raf=requestAnimationFrame(frame);
  setTimeout(function(){ if(R.S===S) nextWave(); },900);
  R.debug={cam:cam,S:S,pads:pads,finish:finish,TW:TW,build:function(i){ var q=pads[i]; if(!q||q.lv>=3) return false; var c=TW[q.lv+1].cost; if(S.coins<c) return false; S.coins-=c; q.lv++; setTower(q); hud2(); return true; },
    bolt:function(){ boltBtn.onclick({stopPropagation:function(){}}); },info:function(){ var i=renderer.info; return {calls:i.render.calls,tris:i.render.triangles}; }};
  return R;
}
function stop(){
  if(!R||!R.renderer){ R={}; return; }
  cancelAnimationFrame(R.raf); if(R.off) R.off(); if(R.S) R.S.over=true;
  try{ R.scene.traverse(function(n){ if(n.geometry) n.geometry.dispose(); if(n.material){ [].concat(n.material).forEach(function(m){ if(m.map) m.map.dispose(); m.dispose(); }); } }); }catch(e){}
  try{ R.renderer.dispose(); R.renderer.forceContextLoss(); }catch(e){}
  if(R.root){ R.root.innerHTML=''; R.root.style.display='none'; }
  R={};
}
window.EigoTower={ start:function(o){ o.container.style.display='block'; return start(o); }, stop:stop, _dbg:function(){ return R.debug; } };
})();
