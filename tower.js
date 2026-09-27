/* えいごタワー — みちを すすんでくる てきの ぐんだんから おしろを まもる 3D タワーディフェンス（Three.js）
   ・🪙の まるを タップ → タワーを えらんで たてる（ゆみ・まほう・こおり・たいほう）
   ・タワーを タップ → レベルアップ／うる
   ・てきは いろいろ：ふつう・はしりや・おおおとこ・よろい（かたい）・コウモリ（そらを とぶ）・まじゅつし（なかまを なおす）・ボス
   ・ウェーブの まえに えいごの もんだい：せいかいで コイン＋かみなり（⚡ボタンで てきの むれに おとす）
   app.js から EigoTower.start({...}) で よぶ。THREE と WAR_GFX を さきに 読みこんでおく。 */
(function(){
'use strict';
var R={}, FONT='"Hiragino Maru Gothic ProN","Hiragino Sans","M PLUS Rounded 1c","Noto Sans JP",sans-serif';
var MAX_EN=400, MAX_P=220;
function rnd(a,b){ return a+Math.random()*(b-a); }
function el(tag,css,html){ var e=document.createElement(tag); if(css) e.style.cssText=css; if(html!=null) e.innerHTML=html; return e; }
function escH(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function furi(t,y){ var a=0,b=0; while(a<t.length&&a<y.length&&t[a]===y[a]&&!/[一-鿿々]/.test(t[a])) a++; while(b<t.length-a&&b<y.length-a&&t[t.length-1-b]===y[y.length-1-b]&&!/[一-鿿々]/.test(t[t.length-1-b])) b++; return [t.slice(0,a),t.slice(a,t.length-b),y.slice(a,y.length-b),t.slice(t.length-b)]; }
function rb(t,y){ if(!(y&&/[一-鿿々]/.test(t))) return escH(t); var f=furi(t,y); return escH(f[0])+'<ruby style="white-space:nowrap;">'+escH(f[1])+'<rt style="font-size:.5em;">'+escH(f[2])+'</rt></ruby>'+escH(f[3]); }

// タワーの しゅるい（lv[0..2]＝レベル1〜3）。air＝そらの てきに とどく、magic＝よろいを むし
var TT={
  arrow: {name:'ゆみ',    ico:'🏹',desc:'はやい・そらにも',air:true, lv:[{cost:20,dmg:2,rate:1.2,range:4.0},{cost:30,dmg:3,rate:1.6,range:4.3},{cost:45,dmg:5,rate:2.0,range:4.7}]},
  magic: {name:'まほう',  ico:'🔮',desc:'よろいに つよい',air:true, magic:true, lv:[{cost:30,dmg:4,rate:0.8,range:3.8},{cost:40,dmg:7,rate:0.9,range:4.1},{cost:55,dmg:10,rate:1.0,range:4.4,chain:2}]},
  ice:   {name:'こおり',  ico:'❄️',desc:'てきを おそくする',air:true, lv:[{cost:25,dmg:1,rate:1.0,range:3.6,slow:0.4},{cost:35,dmg:1.5,rate:1.1,range:3.9,slow:0.5},{cost:45,dmg:2,rate:1.2,range:4.2,slow:0.6,splash:1.1}]},
  cannon:{name:'たいほう',ico:'💣',desc:'まとめて ドカン',air:false,lv:[{cost:35,dmg:4,rate:0.55,range:4.0,splash:1.0},{cost:45,dmg:6,rate:0.6,range:4.3,splash:1.2},{cost:60,dmg:9,rate:0.7,range:4.6,splash:1.4}]}
}, TKEYS=['arrow','magic','ice','cannon'];
// てきの しゅるい：hp＝きほんの なんばい、spd、sc＝おおきさ、coin、dmg＝おしろへの ダメージ、armor＝へらす ダメージ
var ET={
  n:   {name:'へいし',     hp:1,  spd:1.5, sc:1.2, coin:1, dmg:1},
  f:   {name:'はしりや',   hp:0.6,spd:2.6, sc:1.05,coin:1, dmg:1},
  b:   {name:'おおおとこ', hp:5,  spd:1.0, sc:1.35,coin:4, dmg:3},
  sh:  {name:'よろい',     hp:2.2,spd:1.25,sc:1.25,coin:3, dmg:2, armor:2},
  fly: {name:'コウモリ',   hp:0.8,spd:2.0, sc:1,   coin:2, dmg:1, air:true},
  heal:{name:'まじゅつし', hp:1.6,spd:1.3, sc:1.2, coin:3, dmg:1, heal:true},
  sl:  {name:'スライム',   hp:1.4,spd:1.2, sc:1.3, coin:1, dmg:1, split:true, army:'sl', hop:true},
  sl2: {name:'こスライム', hp:0.45,spd:1.8,sc:0.75,coin:1, dmg:1, army:'sl', hop:true},
  mo:  {name:'モグラ',     hp:1.6,spd:1.5, sc:1.15,coin:2, dmg:1, dig:true},
  boss:{name:'ボス',       hp:45, spd:0.65,sc:1,   coin:30,dmg:10,armor:1}
};

function start(opt){
  stop();
  var GX=window.WAR_GFX, P=GX.part, M=GX.merge;
  var root=opt.container; root.innerHTML='';
  root.style.cssText='position:fixed;inset:0;z-index:200;overflow:hidden;background:#3f8f4a;touch-action:none;user-select:none;-webkit-user-select:none;';
  var renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
  root.appendChild(renderer.domElement); renderer.domElement.style.cssText='display:block;width:100%;height:100%;';
  GX.setup(renderer);
  // マップ（ステージで かわる）：みどり → ゆき → さばく
  var MAPS=[
    {name:'みどりの おか',bg:0x8fcbe8,g:[0.29,0.55,0.42],path:'#e6c893',dot:['rgba(160,120,70,.25)','rgba(255,245,220,.35)'],edge:'#9c7a4c',cliff:'#8b8f96',cliff2:'#7b7f86',top:'#4f9e55',tree:'green',water:0x4fa3d9,
     pts:[[-3.8,-17],[-3.8,-10.5],[0,-9.6],[3.9,-8],[4,-3.2],[0.5,-1.4],[-3.9,0.2],[-4,4.6],[-0.5,6.2],[3.6,7.6],[3.4,11],[0.6,12.4],[0,14.2]]},
    {name:'ゆきの やま',bg:0xc8dff0,g:[0.58,0.3,0.86],path:'#dbe7f3',dot:['rgba(120,150,190,.25)','rgba(255,255,255,.6)'],edge:'#8aa3bd',cliff:'#9aa7b8',cliff2:'#8795a8',top:'#f8fafc',tree:'snow',water:0xbfe6ff,
     pts:[[3.8,-17],[3.8,-11],[0,-10],[-3.9,-8.4],[-4,-4],[-0.5,-2.6],[3.9,-1],[4,3.6],[0.5,5],[-3.7,6.8],[-3.4,11],[-0.6,12.4],[0,14.2]]},
    {name:'すなの さばく',bg:0xf1d9a8,g:[0.1,0.55,0.66],path:'#b98352',dot:['rgba(110,60,20,.25)','rgba(255,220,170,.3)'],edge:'#7c4a24',cliff:'#c47a45',cliff2:'#a8633a',top:'#e2a46a',tree:'cactus',water:0x2fb5e8,
     pts:[[0,-17],[0,-12],[-4,-10.5],[-4.1,-6],[0,-4.6],[4,-3],[4.1,1.6],[0,3],[-4,4.8],[-3.9,9],[-1,10.8],[0,14.2]]}];
  var MP=MAPS[(Math.max(1,opt.stage||1)-1)%3];
  var scene=new THREE.Scene(); scene.background=new THREE.Color(MP.bg); scene.fog=new THREE.Fog(MP.bg,40,75);
  var cam=new THREE.PerspectiveCamera(50,1,0.1,200);
  scene.add(new THREE.HemisphereLight(0xf4f9ff,0x4d6e3f,0.8));
  var key=new THREE.DirectionalLight(0xffedd0,1.0); key.position.set(-7,16,6); scene.add(key);
  var fill=new THREE.DirectionalLight(0xc7e3ff,0.25); fill.position.set(8,6,12); scene.add(fill);
  R={renderer:renderer,scene:scene,root:root,raf:0};
  var lam=new THREE.MeshLambertMaterial({vertexColors:true});

  // --- みち（くねくね） ---
  var PTS=MP.pts;
  PTS=PTS.map(function(p){ return [p[0],p[1]*0.8]; });   // たてながの がめんに おさまるように
  var curve=new THREE.CatmullRomCurve3(PTS.map(function(p){ return new THREE.Vector3(p[0],0,p[1]); }),false,'catmullrom',0.3);
  var PLEN=curve.getLength(), NS=600, samp=curve.getSpacedPoints(NS);
  function atS(s){ var f=Math.max(0,Math.min(1,s/PLEN))*NS, i=Math.min(NS-1,Math.floor(f)), k=f-i, a=samp[i], b=samp[i+1];
    return {x:a.x+(b.x-a.x)*k, z:a.z+(b.z-a.z)*k, dx:b.x-a.x, dz:b.z-a.z}; }
  function distToPath(x,z){ var m=1e9; for(var i=0;i<=NS;i+=3){ var d=(samp[i].x-x)*(samp[i].x-x)+(samp[i].z-z)*(samp[i].z-z); if(d<m) m=d; } return Math.sqrt(m); }

  // たてる ばしょ（みちの そば）
  var pads=[];
  (function(){ var cand=[];
    for(var s=4;s<PLEN-4;s+=1.2){ var p=atS(s), l=Math.hypot(p.dx,p.dz)||1, nx=-p.dz/l, nz=p.dx/l;
      [1,-1].forEach(function(sd){ cand.push({x:p.x+nx*2.25*sd,z:p.z+nz*2.25*sd,s:s}); }); }
    cand.sort(function(){ return Math.random()-0.5; });
    cand.forEach(function(c3){ if(pads.length>=10) return; if(Math.abs(c3.x)>6.6||c3.z<-11.8||c3.z>9.8) return;
      if(distToPath(c3.x,c3.z)<2.0) return; if(pads.some(function(q){ return Math.hypot(q.x-c3.x,q.z-c3.z)<3.0; })) return;
      pads.push({x:c3.x,z:c3.z,lv:0,type:null,cd:0,mesh:null,aim:0,spent:0}); });
  })();
  function nearPad(x,z,r){ return pads.some(function(p){ return Math.hypot(p.x-x,p.z-z)<r; }); }
  var CS={x:0,z:12.4}, g0=PTS[0];
  var pond={x:6.3,z:1.8,r:1.5}; if(distToPath(pond.x,pond.z)<pond.r+1.3||nearPad(pond.x,pond.z,pond.r+1.2)) pond=null;

  // じめん（くさの いろむら）
  (function ground(){
    var g=new THREE.PlaneGeometry(44,54,88,108); g.rotateX(-Math.PI/2);
    var pos=g.attributes.position, col=new Float32Array(pos.count*3), c=new THREE.Color();
    for(var i=0;i<pos.count;i++){ var x=pos.getX(i), z=pos.getZ(i)-1, d=distToPath(x,z);
      var n=Math.sin(x*1.3)*Math.cos(z*1.1)*0.5+Math.sin(x*0.4+z*0.7)*0.5+Math.sin(x*3.1+z*2.3)*0.15;
      c.setHSL(MP.g[0]+n*0.02,MP.g[1],MP.g[2]+n*0.045); if(d<2.4) c.multiplyScalar(0.78+0.22*Math.max(0,Math.min(1,(d-1.2)/1.2)));
      if(pond){ var pd=Math.hypot(x-pond.x,z-pond.z); if(pd<pond.r+0.5) c.multiplyScalar(0.85); }
      col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; }
    g.setAttribute('color',new THREE.BufferAttribute(col,3));
    var m=new THREE.Mesh(g,lam); m.position.z=-1; scene.add(m);
    // みちの おび（ふち＋すなの もよう）
    var sandTex=GX.canvasTex(128,256,function(c2,w,h){ c2.fillStyle=MP.path; c2.fillRect(0,0,w,h);
      for(var k=0;k<500;k++){ var v=Math.random(); c2.fillStyle=v<0.5?MP.dot[0]:MP.dot[1]; c2.beginPath(); c2.arc(Math.random()*w,Math.random()*h,0.8+Math.random()*2.2,0,7); c2.fill(); }
      c2.fillStyle='rgba(150,110,60,.18)'; c2.fillRect(0,0,10,h); c2.fillRect(w-10,0,10,h);
      c2.fillStyle='rgba(120,90,50,.25)'; for(var y=0;y<h;y+=32){ c2.fillRect(w*0.3,y,6,14); c2.fillRect(w*0.64,y+14,6,14); } });   // あしあと
    sandTex.wrapS=sandTex.wrapT=THREE.RepeatWrapping;
    function strip(wd,y,mat,uv){ var pos2=[], idx=[], uvs=[];
      for(var i=0;i<=NS;i++){ var a=samp[Math.max(0,i-1)], b=samp[Math.min(NS,i+1)], dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz)||1, nx=-dz/l*wd, nz=dx/l*wd;
        pos2.push(samp[i].x+nx,y,samp[i].z+nz, samp[i].x-nx,y,samp[i].z-nz); var v=i/NS*PLEN/2.2; uvs.push(0,v,1,v); if(i<NS) idx.push(i*2,i*2+1,i*2+2, i*2+1,i*2+3,i*2+2); }
      var sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute(pos2,3)); sg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); sg.setIndex(idx); sg.computeVertexNormals();
      mat.side=THREE.DoubleSide; mat.polygonOffset=true; mat.polygonOffsetFactor=-y*40; mat.polygonOffsetUnits=-y*40;
      scene.add(new THREE.Mesh(sg,mat)); }
    strip(1.25,0.04,new THREE.MeshLambertMaterial({color:MP.edge})); strip(1.02,0.16,new THREE.MeshLambertMaterial({map:sandTex}));
  })();

  // かざり（がけ・き・いし・はな・くさ・いけ・おしろ・もん）→ 1つに まとめる
  var DEC=[];
  [[-8.6,-10,3,4.2,7],[8.4,-4,2.6,3.2,6],[-8.3,5,2.4,2.6,8],[8.6,10,2.2,3.6,6],[-6.5,-16,14,2.5,2.5],[6,-15.5,9,3.5,2.5]].forEach(function(c2){
    DEC.push(P(new THREE.BoxGeometry(c2[2],c2[3],c2[4]),MP.cliff,c2[0],c2[3]/2,c2[1]));
    DEC.push(P(new THREE.BoxGeometry(c2[2]*0.7,c2[3]*0.5,0.2),MP.cliff2,c2[0],c2[3]*0.4,c2[1]+c2[4]/2+0.05));
    DEC.push(P(new THREE.BoxGeometry(c2[2]+0.14,0.4,c2[4]+0.14),MP.top,c2[0],c2[3]+0.12,c2[1])); });
  function freeSpot(x,z,r){ return distToPath(x,z)>r+1.2&&!nearPad(x,z,r+0.9)&&Math.hypot(x-CS.x,z-CS.z)>3.3&&!(pond&&Math.hypot(x-pond.x,z-pond.z)<pond.r+0.6); }
  for(var t=0;t<90;t++){ var tx=rnd(-9.5,9.5), tz=rnd(-15,14); if(!freeSpot(tx,tz,0.9)) continue; var h=rnd(0.8,1.5), kind=Math.random();
    if(MP.tree==='cactus'){ DEC.push(P(new THREE.CylinderGeometry(0.22*h,0.25*h,1.5*h,8),'#4d7c3a',tx,0.75*h,tz), P(new THREE.SphereGeometry(0.22*h,8,6),'#4d7c3a',tx,1.5*h,tz),
        P(new THREE.CylinderGeometry(0.12*h,0.12*h,0.6*h,6),'#5a8a44',tx+0.35*h,0.9*h,tz), P(new THREE.CylinderGeometry(0.12*h,0.12*h,0.3*h,6),'#5a8a44',tx+0.2*h,0.7*h,tz,1,1,1,0,0,Math.PI/2),
        P(new THREE.CylinderGeometry(0.1*h,0.1*h,0.5*h,6),'#5a8a44',tx-0.33*h,1.1*h,tz), P(new THREE.CylinderGeometry(0.1*h,0.1*h,0.25*h,6),'#5a8a44',tx-0.2*h,0.9*h,tz,1,1,1,0,0,Math.PI/2)); continue; }
    DEC.push(P(new THREE.CylinderGeometry(0.1,0.14,0.55,6),'#7a5230',tx,0.27,tz));
    if(MP.tree==='snow'){ DEC.push(P(new THREE.ConeGeometry(0.62*h,1.1*h,7),'#2f6b4f',tx,0.55+0.5*h,tz), P(new THREE.ConeGeometry(0.45*h,0.5*h,7),'#f8fafc',tx,0.55+0.8*h,tz), P(new THREE.ConeGeometry(0.46*h,0.9*h,7),'#357a5a',tx,0.55+1.05*h,tz), P(new THREE.ConeGeometry(0.3*h,0.4*h,7),'#ffffff',tx,0.55+1.35*h,tz)); continue; }
    if(kind<0.6){ DEC.push(P(new THREE.ConeGeometry(0.6*h,1.1*h,7),'#2f7d3b',tx,0.55+0.5*h,tz), P(new THREE.ConeGeometry(0.45*h,0.9*h,7),'#3c9a48',tx,0.55+1.05*h,tz)); }
    else { DEC.push(P(new THREE.IcosahedronGeometry(0.6*h,0),'#3f9448',tx,0.6+0.5*h,tz), P(new THREE.IcosahedronGeometry(0.4*h,0),'#4fae57',tx+0.25*h,0.75+0.7*h,tz-0.1)); } }
  for(var k=0;k<160;k++){ var fx0=rnd(-9,9), fz0=rnd(-14,13); if(!freeSpot(fx0,fz0,-0.6)) continue; var r0=Math.random();
    if(MP.tree!=='green'){ if(r0<0.6) DEC.push(P(new THREE.DodecahedronGeometry(rnd(0.12,0.32),0),MP.tree==='snow'?'#ffffff':'#d9a066',fx0,0.05,fz0,1,0.5,1)); else DEC.push(P(new THREE.DodecahedronGeometry(rnd(0.12,0.3),0),MP.tree==='snow'?'#94a3b8':'#a16a3c',fx0,0.05,fz0,1,0.6,1)); continue; }
    if(r0<0.45) DEC.push(P(new THREE.ConeGeometry(0.08,0.28,4),'#2d8a3c',fx0,0.14,fz0), P(new THREE.ConeGeometry(0.07,0.22,4),'#3aa14a',fx0+0.1,0.11,fz0+0.05));
    else if(r0<0.75) DEC.push(P(new THREE.SphereGeometry(0.07,5,4),['#fde047','#f472b6','#ffffff','#a78bfa'][k%4],fx0,0.14,fz0), P(new THREE.CylinderGeometry(0.015,0.015,0.14,3),'#2d8a3c',fx0,0.07,fz0));
    else DEC.push(P(new THREE.DodecahedronGeometry(rnd(0.12,0.3),0),'#9ca3af',fx0,0.05,fz0,1,0.6,1)); }
  for(var s2=2;s2<PLEN-2;s2+=0.9){ var q=atS(s2), l2=Math.hypot(q.dx,q.dz)||1; [1,-1].forEach(function(sd){ if(Math.random()<0.55) return; var d2=1.25+Math.random()*0.15;
      DEC.push(P(new THREE.DodecahedronGeometry(rnd(0.1,0.18),0),Math.random()<0.5?'#a8a29e':'#8d8781',q.x-q.dz/l2*d2*sd,0.06,q.z+q.dx/l2*d2*sd,1,0.6,1)); }); }
  if(pond){ DEC.push(P(new THREE.CylinderGeometry(pond.r+0.25,pond.r+0.35,0.1,24),'#8d8781',pond.x,0.02,pond.z));
    for(var pr=0;pr<5;pr++){ var pa=pr/5*6.28+0.4; DEC.push(P(new THREE.ConeGeometry(0.06,0.5,4),'#3f7f3a',pond.x+Math.cos(pa)*(pond.r+0.25),0.25,pond.z+Math.sin(pa)*(pond.r+0.25))); } }
  // てきの もん
  DEC.push(P(new THREE.BoxGeometry(3.6,2.0,1.2),'#57534e',g0[0],1.0,g0[1]+1), P(new THREE.BoxGeometry(1.7,1.5,1.25),'#1c1917',g0[0],0.75,g0[1]+1.02));
  [-1.5,1.5].forEach(function(o){ DEC.push(P(new THREE.CylinderGeometry(0.55,0.6,2.8,8),'#44403c',g0[0]+o,1.4,g0[1]+1), P(new THREE.ConeGeometry(0.75,1.2,8),'#991b1b',g0[0]+o,3.4,g0[1]+1),
    P(new THREE.ConeGeometry(0.08,0.4,5),'#f5f5f4',g0[0]+o-0.3,2.2,g0[1]+1.55,1,1,1,1.3,0,0.4), P(new THREE.ConeGeometry(0.08,0.4,5),'#f5f5f4',g0[0]+o+0.3,2.2,g0[1]+1.55,1,1,1,1.3,0,-0.4)); });
  for(var ci=0;ci<5;ci++) DEC.push(P(new THREE.BoxGeometry(0.4,0.35,0.4),'#57534e',g0[0]-1.2+ci*0.6,2.15,g0[1]+1));
  // おしろ
  DEC.push(P(new THREE.BoxGeometry(5.2,1.5,2.8),'#e7e0d0',CS.x,0.75,CS.z), P(new THREE.BoxGeometry(1.4,1.2,0.1),'#5b3a1e',CS.x,0.6,CS.z-1.42), P(new THREE.CylinderGeometry(0.7,0.7,0.1,12,1,false,0,Math.PI),'#5b3a1e',CS.x,1.2,CS.z-1.42,1,1,1,Math.PI/2,0,Math.PI/2));
  for(var cb=0;cb<9;cb++) DEC.push(P(new THREE.BoxGeometry(0.34,0.3,0.34),'#f1ece1',CS.x-2.4+cb*0.6,1.65,CS.z-1.25));
  [[-2.5,-1.3],[2.5,-1.3],[-2.5,1.3],[2.5,1.3]].forEach(function(o){ DEC.push(P(new THREE.CylinderGeometry(0.65,0.72,2.9,12),'#f4efe4',CS.x+o[0],1.45,CS.z+o[1]), P(new THREE.CylinderGeometry(0.78,0.78,0.2,12),'#d6cfbf',CS.x+o[0],2.95,CS.z+o[1]), P(new THREE.ConeGeometry(0.88,1.4,12),'#2563eb',CS.x+o[0],3.75,CS.z+o[1]), P(new THREE.BoxGeometry(0.18,0.3,0.05),'#3b2f22',CS.x+o[0],2.1,CS.z+o[1]-0.68)); });
  DEC.push(P(new THREE.BoxGeometry(2.2,2.2,1.6),'#f4efe4',CS.x,2.6,CS.z+0.3), P(new THREE.ConeGeometry(1.6,1.6,4),'#1d4ed8',CS.x,4.5,CS.z+0.3,1,1,1,0,Math.PI/4,0));
  DEC.push(P(new THREE.BoxGeometry(0.5,0.6,0.05),'#fbbf24',CS.x,2.9,CS.z-0.52), P(new THREE.BoxGeometry(0.3,0.3,0.06),'#1d4ed8',CS.x,2.9,CS.z-0.53));
  var decM=new THREE.Mesh(M(DEC),lam); scene.add(decM);
  // いけ（みずが ゆれる）
  var water=null; if(pond){ water=new THREE.Mesh(new THREE.CircleGeometry(pond.r,32),new THREE.MeshLambertMaterial({color:MP.water,transparent:true,opacity:0.9})); water.rotation.x=-Math.PI/2; water.position.set(pond.x,0.09,pond.z); scene.add(water);
    var shine=new THREE.Mesh(new THREE.RingGeometry(pond.r*0.3,pond.r*0.42,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.3})); shine.rotation.x=-Math.PI/2; shine.position.set(pond.x-0.3,0.1,pond.z-0.2); scene.add(shine); water.userData.shine=shine; }
  // おしろの はた（ゆれる）
  var flags=[]; [[-2.5,-1.3],[2.5,-1.3],[0,0.3]].forEach(function(o,i){ var fg=new THREE.Group(); fg.position.set(CS.x+o[0],i===2?5.3:4.45,CS.z+o[1]);
    var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1,4),new THREE.MeshLambertMaterial({color:0x555555})); pole.position.y=0.5; fg.add(pole);
    var fl=new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.42,6,1),new THREE.MeshLambertMaterial({color:i===2?0xfbbf24:0x60a5fa,side:THREE.DoubleSide})); fl.position.set(0.36,0.78,0); fg.add(fl); scene.add(fg); flags.push(fl); fl.userData.base=fl.geometry.attributes.position.array.slice(); });
  // もんの うずまき（ひかる）
  var portal=new THREE.Mesh(new THREE.CircleGeometry(0.8,24),new THREE.MeshBasicMaterial({map:GX.canvasTex(128,128,function(c2,w,h){ var r2=c2.createRadialGradient(64,64,4,64,64,64); r2.addColorStop(0,'rgba(255,120,255,1)'); r2.addColorStop(0.5,'rgba(140,40,200,.9)'); r2.addColorStop(1,'rgba(40,0,60,1)'); c2.fillStyle=r2; c2.fillRect(0,0,w,h);
      c2.strokeStyle='rgba(255,200,255,.6)'; c2.lineWidth=4; for(var a=0;a<3;a++){ c2.beginPath(); for(var tt=0;tt<40;tt++){ var an=a*2.1+tt*0.2, rr=tt*1.5; c2.lineTo(64+Math.cos(an)*rr,64+Math.sin(an)*rr); } c2.stroke(); } })}));
  portal.position.set(g0[0],0.8,g0[1]+1.66); scene.add(portal);
  // たてる ばしょの まる
  var padGeo=M([P(new THREE.CylinderGeometry(0.9,1.0,0.16,20),'#b9a27a',0,0.08,0),P(new THREE.CylinderGeometry(0.78,0.78,0.04,20),'#cdb88f',0,0.17,0)]);
  var ringMat=new THREE.MeshBasicMaterial({color:0xffe066,transparent:true,opacity:0.85});
  pads.forEach(function(p){ var m=new THREE.Mesh(padGeo,lam); m.position.set(p.x,0,p.z); scene.add(m); p.base=m;
    var r=new THREE.Mesh(new THREE.RingGeometry(0.66,0.8,28),ringMat); r.rotation.x=-Math.PI/2; r.position.set(p.x,0.2,p.z); scene.add(r); p.ring=r; });
  var rangeRing=new THREE.Mesh(new THREE.RingGeometry(0.96,1,64),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.7,depthWrite:false}));
  rangeRing.rotation.x=-Math.PI/2; rangeRing.visible=false; scene.add(rangeRing);
  var rangeFill=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.12,depthWrite:false}));
  rangeFill.rotation.x=-Math.PI/2; rangeFill.visible=false; scene.add(rangeFill);

  // --- タワーの かたち ---
  var TH=[1.3,1.7,2.1];
  function towerParts(type,lv){ var h=TH[lv-1], L=[], gold=lv===3;
    if(type==='arrow'){
      L.push(P(new THREE.CylinderGeometry(0.6,0.74,h,10),'#b5aea4',0,h/2,0));
      for(var i=0;i<4;i++) L.push(P(new THREE.BoxGeometry(0.64,0.05,0.05),'#8f877d',0,0.35+i*h/4,-0.0,1,1,1,0,i*0.8,0));
      L.push(P(new THREE.CylinderGeometry(0.72,0.66,0.2,10),'#8f877d',0,h,0));
      for(var j=0;j<8;j++){ var a=j/8*Math.PI*2; L.push(P(new THREE.BoxGeometry(0.2,0.24,0.2),'#c9c2b8',Math.cos(a)*0.64,h+0.2,Math.sin(a)*0.64)); }
      L.push(P(new THREE.BoxGeometry(0.34,0.5,0.06),'#5b3a1e',0,0.3,0.7));
      if(lv>=2){ [[0.5,0.5],[-0.5,0.5],[0.5,-0.5],[-0.5,-0.5]].forEach(function(o){ L.push(P(new THREE.CylinderGeometry(0.04,0.04,0.9,4),'#7a5230',o[0],h+0.5,o[1])); });
        L.push(P(new THREE.ConeGeometry(0.95,0.7,4),gold?'#b45309':'#9a3412',0,h+1.25,0,1,1,1,0,Math.PI/4,0)); }
      if(gold) L.push(P(new THREE.CylinderGeometry(0.75,0.75,0.08,10),'#fbbf24',0,h-0.35,0));
    } else if(type==='magic'){
      L.push(P(new THREE.CylinderGeometry(0.42,0.66,h,8),'#6b5b95',0,h/2,0));
      L.push(P(new THREE.CylinderGeometry(0.62,0.5,0.25,8),'#4c3d78',0,h+0.05,0));
      for(var m2=0;m2<4;m2++){ var a2=m2/4*Math.PI*2+0.4; L.push(P(new THREE.ConeGeometry(0.1,0.5,5),'#a78bfa',Math.cos(a2)*0.5,h+0.35,Math.sin(a2)*0.5)); }
      L.push(P(new THREE.BoxGeometry(0.1,0.3,0.05),'#fde68a',0,h*0.55,0.55), P(new THREE.BoxGeometry(0.1,0.3,0.05),'#fde68a',0.3,h*0.35,0.5));
      if(lv>=2) L.push(P(new THREE.TorusGeometry(0.55,0.05,6,16),gold?'#fbbf24':'#c4b5fd',0,h*0.7,0,1,1,1,Math.PI/2,0,0));
    } else if(type==='ice'){
      L.push(P(new THREE.CylinderGeometry(0.55,0.7,h,8),'#dbeafe',0,h/2,0));
      L.push(P(new THREE.CylinderGeometry(0.68,0.6,0.2,8),'#bfdbfe',0,h,0));
      for(var n2=0;n2<6;n2++){ var a3=n2/6*Math.PI*2; L.push(P(new THREE.ConeGeometry(0.1,0.55+(n2%2)*0.25,5),'#93c5fd',Math.cos(a3)*0.55,h+0.3,Math.sin(a3)*0.55)); }
      for(var n3=0;n3<4;n3++){ var a4=n3/4*Math.PI*2+0.3; L.push(P(new THREE.ConeGeometry(0.12,0.5,5),'#e0f2fe',Math.cos(a4)*0.72,0.2,Math.sin(a4)*0.72,1,1,1,Math.cos(a4)*0.5,0,-Math.sin(a4)*0.5)); }
      if(gold) L.push(P(new THREE.CylinderGeometry(0.72,0.72,0.08,8),'#fbbf24',0,h-0.3,0));
    } else {
      var hh=h*0.7; L.push(P(new THREE.CylinderGeometry(0.78,0.88,hh,8),'#78716c',0,hh/2,0));
      L.push(P(new THREE.CylinderGeometry(0.86,0.8,0.18,8),'#57534e',0,hh,0));
      for(var c3=0;c3<8;c3++){ var a5=c3/8*Math.PI*2; L.push(P(new THREE.BoxGeometry(0.26,0.26,0.26),'#a8a29e',Math.cos(a5)*0.74,hh+0.2,Math.sin(a5)*0.74)); }
      [[-0.5,0.3],[0.4,-0.2],[0.1,0.5]].forEach(function(o){ L.push(P(new THREE.SphereGeometry(0.1,6,5),'#1f2937',o[0]*0.5,hh+0.14,o[1]*0.5)); });
      if(gold) L.push(P(new THREE.CylinderGeometry(0.9,0.9,0.08,8),'#fbbf24',0,hh-0.3,0));
    }
    L.push(P(new THREE.CylinderGeometry(0.95,0.95,0.02,16),'#3f3f46',0,0.19,0));
    return M(L); }
  function headParts(type,lv){ var L=[];
    if(type==='arrow'){ L.push(P(new THREE.BoxGeometry(0.3,0.36,0.22),'#2563eb',0,0.18,0), P(new THREE.SphereGeometry(0.15,8,6),'#f2c7a5',0,0.5,0), P(new THREE.SphereGeometry(0.165,8,6,0,Math.PI*2,0,Math.PI/2),lv===3?'#fbbf24':'#1d4ed8',0,0.53,0),
        P(new THREE.TorusGeometry(0.3,0.025,4,10,Math.PI),'#7c4a1e',0,0.32,-0.25,1,1,1,0,Math.PI/2,Math.PI/2), P(new THREE.BoxGeometry(0.03,0.03,0.55),'#a16207',0,0.32,-0.25)); }
    else if(type==='cannon'){ var hl=0.9+lv*0.1; L.push(P(new THREE.BoxGeometry(0.5,0.2,0.6),'#5b3a1e',0,0.1,0), P(new THREE.CylinderGeometry(0.16+lv*0.02,0.22+lv*0.02,hl,10),'#27272a',0,0.34,-hl*0.35,1,1,1,Math.PI/2-0.25,0,0),
        P(new THREE.TorusGeometry(0.2+lv*0.02,0.04,5,10),'#52525b',0,0.4,-hl*0.75,1,1,1,-0.25,0,0), P(new THREE.CylinderGeometry(0.12,0.12,0.62,8),'#3f3f46',0,0.12,0,1,1,1,0,0,Math.PI/2)); }
    else if(type==='magic'){ L.push(P(new THREE.OctahedronGeometry(0.3+lv*0.05,0),'#d946ef',0,0,0,1,1.6,1)); }
    else { L.push(P(new THREE.OctahedronGeometry(0.28+lv*0.04,0),'#7dd3fc',0,0,0,1,1.7,1), P(new THREE.OctahedronGeometry(0.16,0),'#e0f2fe',0.28,-0.1,0,1,1.5,1)); }
    return M(L); }
  var tGeo={}, hGeo={}; TKEYS.forEach(function(k){ tGeo[k]=[null]; hGeo[k]=[null]; for(var i=1;i<=3;i++){ tGeo[k].push(towerParts(k,i)); hGeo[k].push(headParts(k,i)); } });
  var glowMat={magic:new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x7e22ce,emissiveIntensity:0.6}),ice:new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x0ea5e9,emissiveIntensity:0.45,transparent:true,opacity:0.92})};
  var auraTex=GX.glowTex();
  function setTower(p){ if(p.mesh) scene.remove(p.mesh);
    var g=new THREE.Group(); g.add(new THREE.Mesh(tGeo[p.type][p.lv],lam)); var h=TH[p.lv-1]*(p.type==='cannon'?0.7:1);
    var hd=new THREE.Mesh(hGeo[p.type][p.lv],glowMat[p.type]||lam);
    hd.position.y=p.type==='magic'||p.type==='ice'?h+(p.type==='magic'?0.9:0.85):h+(p.type==='arrow'?0.12:0.2); g.add(hd); p.head=hd; p.headY=hd.position.y;
    if(p.type==='magic'||p.type==='ice'){ var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:SPARK,color:p.type==='magic'?0xe879f9:0x7dd3fc,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); sp.scale.set(1.5,1.5,1); sp.position.y=hd.position.y; g.add(sp); p.aura=sp; }
    if(p.lv===3){ var fl=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.26),new THREE.MeshLambertMaterial({color:0xfbbf24,side:THREE.DoubleSide})); fl.position.set(0.2,h+(p.type==='arrow'?2.0:1.2),0); g.add(fl);
      var pl=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.6,4),new THREE.MeshLambertMaterial({color:0x444444})); pl.position.set(0,h+(p.type==='arrow'?1.9:1.1),0); g.add(pl); p.flag=fl; }
    g.position.set(p.x,0.16,p.z); scene.add(g); p.mesh=g; p.ring.visible=false; p.pop=0.35; }

  // --- てきの かたち ---
  function legGeo(c){ return M([P(new THREE.CylinderGeometry(0.065,0.06,0.3,6),c||'#3b1d1d',0,-0.15,0),P(new THREE.BoxGeometry(0.12,0.08,0.18),'#1b1b1f',0,-0.31,-0.03)]); }
  function eyes(y,z){ return [P(new THREE.BoxGeometry(0.05,0.035,0.02),'#111',-0.06,y,z),P(new THREE.BoxGeometry(0.05,0.035,0.02),'#111',0.06,y,z)]; }
  var C=THREE.CylinderGeometry, B=THREE.BoxGeometry, SP=THREE.SphereGeometry, K=THREE.ConeGeometry;
  var EG={
    n:GX.soldier('red'),
    f:{hipY:0.33,hipX:0.085,leg:legGeo('#365314'),body:M([P(new C(0.16,0.15,0.36,8),'#f97316',0,0.5,0),P(new SP(0.17,10,7),'#65a30d',0,0.82,0),
        P(new K(0.06,0.26,5),'#65a30d',-0.2,0.86,0,1,1,1,0,0,1.3),P(new K(0.06,0.26,5),'#65a30d',0.2,0.86,0,1,1,1,0,0,-1.3),P(new C(0.2,0.2,0.05,8),'#7c2d12',0,0.34,0)].concat(eyes(0.84,-0.16),
        [P(new B(0.04,0.04,0.3),'#d4d4d8',0.22,0.5,-0.18),P(new C(0.05,0.045,0.26,5),'#f97316',-0.21,0.5,-0.04,1,1,1,0.5)]))},
    b:{hipY:0.33,hipX:0.12,leg:legGeo('#44200f'),body:M([P(new C(0.27,0.22,0.46,9),'#7f1d1d',0,0.56,0),P(new SP(0.2,10,7),'#b45309',0,0.92,0),
        P(new K(0.06,0.2,6),'#f5f5f4',-0.14,1.1,0,1,1,1,0,0,0.5),P(new K(0.06,0.2,6),'#f5f5f4',0.14,1.1,0,1,1,1,0,0,-0.5),P(new SP(0.1,6,4),'#7f1d1d',-0.3,0.72,0),P(new SP(0.1,6,4),'#7f1d1d',0.3,0.72,0),
        P(new C(0.09,0.06,0.7,6),'#78350f',0.34,0.62,-0.2,1,1,1,-0.9,0,0),P(new SP(0.14,6,5),'#57534e',0.34,0.83,-0.48)].concat(eyes(0.94,-0.19)))},
    sh:{hipY:0.33,hipX:0.09,leg:legGeo('#475569'),body:M([P(new C(0.2,0.18,0.44,8),'#94a3b8',0,0.54,0),P(new SP(0.17,10,7),'#64748b',0,0.87,0),P(new B(0.26,0.05,0.04),'#111',0,0.88,-0.16),
        P(new K(0.05,0.18,4),'#dc2626',0,1.1,0),P(new B(0.46,0.52,0.06),'#1e293b',-0.05,0.55,-0.26),P(new B(0.36,0.42,0.07),'#b91c1c',-0.05,0.55,-0.27),P(new B(0.1,0.3,0.075),'#fbbf24',-0.05,0.55,-0.275),
        P(new C(0.02,0.02,1.1,4),'#78350f',0.24,0.7,-0.05),P(new K(0.05,0.16,4),'#d4d4d8',0.24,1.3,-0.05)])},
    heal:{hipY:0.3,hipX:0.08,leg:legGeo('#3b0764'),body:M([P(new K(0.3,0.62,9),'#7e22ce',0,0.45,0),P(new SP(0.15,10,7),'#d6a77a',0,0.84,0),P(new K(0.2,0.36,8),'#581c87',0,1.02,0.02),
        P(new C(0.025,0.025,1.1,4),'#78350f',0.28,0.62,-0.05),P(new SP(0.1,8,6),'#4ade80',0.28,1.2,-0.05),P(new C(0.31,0.31,0.05,9),'#fbbf24',0,0.2,0)].concat(eyes(0.85,-0.14)))}
  };
  EG.sl={hipY:0.05,hipX:0.05,leg:M([P(new THREE.BoxGeometry(0.01,0.01,0.01),'#16a34a',0,0,0)]),body:M([P(new SP(0.34,12,9),'#22c55e',0,0.3,0,1,0.8,1),P(new SP(0.2,10,7),'#86efac',-0.08,0.42,-0.12,1,0.7,0.6),
    P(new SP(0.06,6,5),'#ffffff',-0.1,0.4,-0.28),P(new SP(0.06,6,5),'#ffffff',0.1,0.4,-0.28),P(new SP(0.03,5,4),'#111',-0.1,0.4,-0.33),P(new SP(0.03,5,4),'#111',0.1,0.4,-0.33)])};
  EG.mo={hipY:0.3,hipX:0.1,leg:legGeo('#44403c'),body:M([P(new SP(0.26,10,8),'#78350f',0,0.55,0,1,1.1,1),P(new SP(0.07,6,5),'#f9a8d4',0,0.6,-0.26),P(new SP(0.035,5,4),'#111',-0.09,0.72,-0.21),P(new SP(0.035,5,4),'#111',0.09,0.72,-0.21),
    P(new B(0.12,0.05,0.12),'#fde68a',-0.24,0.42,-0.14),P(new B(0.12,0.05,0.12),'#fde68a',0.24,0.42,-0.14),P(new C(0.14,0.18,0.12,8),'#facc15',0,0.86,0),P(new SP(0.05,5,4),'#fef08a',0,0.9,-0.12)])};
  var armies={}; ['n','f','b','sh','heal','sl','mo'].forEach(function(k){ armies[k]=GX.army(scene,'red',k==='n'?MAX_EN:160,EG[k]); });
  // コウモリ（はねが パタパタ）
  var batBody=new THREE.InstancedMesh(M([P(new SP(0.2,8,6),'#3b0764',0,0,0,1,0.9,1.1),P(new K(0.06,0.14,4),'#3b0764',-0.09,0.2,0),P(new K(0.06,0.14,4),'#3b0764',0.09,0.2,0),P(new SP(0.04,5,4),'#ef4444',-0.07,0.04,-0.17),P(new SP(0.04,5,4),'#ef4444',0.07,0.04,-0.17)]),lam,120);
  var wingG=M([P(new B(0.55,0.03,0.3),'#581c87',0.3,0,0),P(new B(0.25,0.03,0.2),'#6b21a8',0.62,0,0.05)]);
  var batWL=new THREE.InstancedMesh(wingG,lam,120), batWR=new THREE.InstancedMesh(wingG,lam,120), batSh=new THREE.InstancedMesh(new THREE.PlaneGeometry(0.6,0.6),new THREE.MeshBasicMaterial({map:GX.shadowTex(),transparent:true,depthWrite:false,opacity:0.6}),120);
  [batBody,batWL,batWR,batSh].forEach(function(m){ m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled=false; scene.add(m); });
  var bossM=GX.boss(scene); bossM.g.visible=false; bossM.g.scale.setScalar(0.42);
  var bubble=new THREE.Mesh(new THREE.SphereGeometry(1.7,20,14),new THREE.MeshBasicMaterial({color:0x7dd3fc,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false})); bubble.visible=false; scene.add(bubble);
  var fx=GX.particles(scene,900);
  var arrowM=GX.bullets(scene,MAX_P);
  var orbM=new THREE.InstancedMesh(new THREE.SphereGeometry(0.16,10,8),new THREE.MeshBasicMaterial({color:0xffffff}),MAX_P); orbM.frustumCulled=false; scene.add(orbM);
  for(var oi=0;oi<MAX_P;oi++) orbM.setColorAt(oi,new THREE.Color(1,1,1));
  var SPARK=GX.canvasTex(64,64,function(c2,w,h){ var r2=c2.createRadialGradient(32,32,0,32,32,32); r2.addColorStop(0,'rgba(255,255,255,1)'); r2.addColorStop(0.35,'rgba(255,255,255,.45)'); r2.addColorStop(1,'rgba(255,255,255,0)'); c2.fillStyle=r2; c2.fillRect(0,0,w,h); },false);
  var _c=new THREE.Color(), tmp=new THREE.Object3D(), tmp2=new THREE.Object3D();
  var bolt=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.5,30,8,1,true),new THREE.MeshBasicMaterial({color:0xbfe6ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  bolt.visible=false; scene.add(bolt);
  var rings=[]; function ringFx(x,z,color,size,life){ var m=new THREE.Mesh(new THREE.RingGeometry(0.7,1,32),new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    m.rotation.x=-Math.PI/2; m.position.set(x,0.25,z); scene.add(m); rings.push({m:m,t:0,life:life||0.4,size:size}); }
  var SLOW=new THREE.Color(0.55,0.8,1.5), HIT=new THREE.Color(2,1.6,1.6);

  // --- ゆうしゃ（タップした ところへ あるく・ちかくの てきを きる） ---
  var hero=(function(){ var g=new THREE.Group(), sg=GX.soldier('blue');
    var body=new THREE.Mesh(sg.body,lam); g.add(body);
    var lL=new THREE.Mesh(sg.leg,lam), lR=new THREE.Mesh(sg.leg,lam); lL.position.set(-sg.hipX,sg.hipY,0); lR.position.set(sg.hipX,sg.hipY,0); g.add(lL); g.add(lR);
    var crownM=new THREE.MeshLambertMaterial({color:0xfbbf24}), capeM=new THREE.MeshLambertMaterial({color:0xdc2626,side:THREE.DoubleSide});
    g.add(new THREE.Mesh(M([P(new THREE.CylinderGeometry(0.2,0.22,0.08,10),'#ffffff',0,1.02,0),P(new THREE.ConeGeometry(0.05,0.14,4),'#ffffff',-0.12,1.12,0),P(new THREE.ConeGeometry(0.05,0.14,4),'#ffffff',0,1.13,0),P(new THREE.ConeGeometry(0.05,0.14,4),'#ffffff',0.12,1.12,0)]),crownM));
    var cape=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.55),capeM); cape.position.set(0,0.55,0.2); cape.rotation.x=0.15; g.add(cape);
    body.material=new THREE.MeshLambertMaterial({vertexColors:true});
    var arm=new THREE.Group(); arm.position.set(0.24,0.62,0); g.add(arm);
    arm.add(new THREE.Mesh(M([P(new THREE.BoxGeometry(0.06,0.06,0.7),'#e5e7eb',0,0,-0.45),P(new THREE.BoxGeometry(0.24,0.05,0.05),'#fbbf24',0,0,-0.1),P(new THREE.BoxGeometry(0.05,0.05,0.14),'#78350f',0,0,0)]),new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x334155})));
    var sh=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.9),new THREE.MeshBasicMaterial({map:GX.shadowTex(),transparent:true,depthWrite:false})); sh.rotation.x=-Math.PI/2; sh.position.y=0.02; g.add(sh);
    var halo=new THREE.Mesh(new THREE.RingGeometry(0.42,0.52,24),new THREE.MeshBasicMaterial({color:0x60a5fa,transparent:true,opacity:0.8,depthWrite:false})); halo.rotation.x=-Math.PI/2; halo.position.y=0.04; g.add(halo);
    g.scale.setScalar(1.55); scene.add(g);
    return {body:body,crownM:crownM,capeM:capeM,cape:cape,g:g,lL:lL,lR:lR,arm:arm,x:0,z:9.2,tx:0,tz:9.2,cd:0,skill:4,swing:0,ry:Math.PI,walk:0}; })();
  hero.g.position.set(hero.x,0,hero.z);
  var marker=new THREE.Mesh(new THREE.RingGeometry(0.3,0.42,24),new THREE.MeshBasicMaterial({color:0x60a5fa,transparent:true,opacity:0,depthWrite:false})); marker.rotation.x=-Math.PI/2; marker.position.y=0.25; scene.add(marker);
  function heroStep(dt){ var H=hero, dx=H.tx-H.x, dz=H.tz-H.z, d=Math.hypot(dx,dz), mul=(1+0.25*resLv('hero'))*(1+0.12*(stage-1));
    var tgt=null, td=1e9; S.en.forEach(function(a){ if(a.dead||ET[a.ty].air||a.under>0) return; var e=Math.hypot(a.x-H.x,a.z-H.z); if(e<td){ td=e; tgt=a; } });
    if(d>0.08){ var sp=Math.min(d,3.4*dt); H.x+=dx/d*sp; H.z+=dz/d*sp; H.ry=Math.atan2(-dx,-dz); H.walk+=dt*12; }
    else if(tgt&&td<1.7){ H.ry=Math.atan2(-(tgt.x-H.x),-(tgt.z-H.z)); }
    H.cd-=dt; H.skill-=dt;
    if(tgt&&td<1.6){ var near=S.en.filter(function(a){ return !a.dead&&!ET[a.ty].air&&Math.hypot(a.x-H.x,a.z-H.z)<2.3; });
      if(H.skill<=0&&near.length>=3){ H.skill=8; H.spin=0.5; near.forEach(function(a){ hurt(a,9*mul); }); ringFx(H.x,H.z,0x93c5fd,2.4,0.5); fx.burst(H.x,0.8,H.z,30,0xbfdbfe,5,0.5); say('ぐるぐる ぎり！','#bfdbfe',700); snd('crash'); }
      else if(H.cd<=0){ H.cd=0.7; H.swing=0.25; hurt(tgt,3.5*mul); fx.burst(tgt.x,0.8,tgt.z,5,0xe0f2fe,2.5,0.3); } } }
  function heroDraw(dt){ var H=hero; H.g.position.set(H.x,0,H.z); H.g.rotation.y+=(((H.ry-H.g.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI)*Math.min(1,dt*12);
    var moving=Math.hypot(H.tx-H.x,H.tz-H.z)>0.08, sw=moving?Math.sin(H.walk)*0.7:0; H.lL.rotation.x=sw; H.lR.rotation.x=-sw; H.g.position.y=moving?Math.abs(Math.sin(H.walk))*0.06:0;
    if(H.swing>0){ H.swing-=dt; H.arm.rotation.x=-1.6+(1-H.swing/0.25)*2.4; } else H.arm.rotation.x=-0.3;
    if(H.spin>0){ H.spin-=dt; H.g.rotation.y+=dt*30; }
    if(marker.material.opacity>0) marker.material.opacity=Math.max(0,marker.material.opacity-dt*1.2); }

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
  var spdBtn=el('button','position:absolute;left:12px;bottom:calc(18px + env(safe-area-inset-bottom));pointer-events:auto;'+pill+'border:2px solid #fff;font-size:16px;padding:8px 12px;cursor:pointer;font-family:inherit;','⏩ ×1');
  hud.appendChild(spdBtn); spdBtn.onclick=function(e){ e.stopPropagation(); S.speed=S.speed===1?2:1; spdBtn.innerHTML='⏩ ×'+S.speed; spdBtn.style.background=S.speed===2?'#ea580c':''; snd('tap'); };
  var callBtn=el('button','position:absolute;left:50%;top:calc(62px + env(safe-area-inset-top));transform:translateX(-50%);pointer-events:auto;border:2px solid #fff;border-radius:12px;background:#b91c1c;color:#fff;font-weight:900;font-size:13px;padding:6px 12px;cursor:pointer;font-family:inherit;display:none;box-shadow:0 3px 10px rgba(0,0,0,.3);','⚔ つぎの ウェーブを よぶ 🪙+10');
  hud.appendChild(callBtn); callBtn.onclick=function(e){ e.stopPropagation(); if(S.over||S.paused||S.called) return; S.called=true; callBtn.style.display='none'; S.coins+=10; hud2(); say('はやよび！ 🪙+10','#fecaca',900); nextWave(); };
  var st=document.createElement('style'); st.textContent='@keyframes twBoss{0%{transform:translate(-50%,-50%) scale(2.2);opacity:0}15%{transform:translate(-50%,-50%) scale(1);opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.05)}}'; root.appendChild(st);
  var bossBan=el('div','position:absolute;left:50%;top:30%;display:none;font-weight:900;font-size:34px;color:#fff;background:linear-gradient(90deg,transparent,rgba(185,28,28,.9) 20%,rgba(185,28,28,.9) 80%,transparent);padding:8px 40px;white-space:nowrap;-webkit-text-stroke:5px rgba(60,0,0,.8);paint-order:stroke fill;','⚠ ボス しゅつげん！'); hud.appendChild(bossBan);
  var newEn=el('div','position:absolute;left:10px;top:calc(62px + env(safe-area-inset-top));'+pill+'font-size:12px;display:none;'); hud.appendChild(newEn);
  var frz=el('div','position:absolute;inset:0;box-shadow:inset 0 0 60px 20px rgba(125,211,252,.7);opacity:0;transition:opacity .3s;'); hud.appendChild(frz);
  var labels=el('div','position:absolute;inset:0;'); hud.appendChild(labels);
  var toast=el('div','position:absolute;left:50%;top:36%;transform:translate(-50%,-50%);font-weight:900;font-size:30px;color:#fff;-webkit-text-stroke:6px rgba(20,40,20,.85);paint-order:stroke fill;opacity:0;transition:opacity .2s;text-align:center;white-space:nowrap;');
  hud.appendChild(toast);
  var hint=el('div','position:absolute;left:50%;bottom:calc(22px + env(safe-area-inset-bottom));transform:translateX(-50%);'+pill+'font-size:13px;text-align:center;line-height:1.7;white-space:nowrap;',
    '🪙の まるを タップで タワーを えらぶ<br>タワーを タップで レベルアップ<br><span style="color:#fde047;">えいごに せいかいで コインと ⚡かみなり！</span>');
  hud.appendChild(hint);
  var menu=el('div','position:absolute;left:50%;bottom:calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(94vw,420px);background:rgba(255,250,240,.97);border-radius:16px;padding:10px;box-sizing:border-box;display:none;pointer-events:auto;box-shadow:0 6px 20px rgba(0,0,0,.3);color:#14532d;font-weight:900;');
  hud.appendChild(menu);
  var panel=el('div','position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,30,20,.45);pointer-events:auto;'); root.appendChild(panel);
  function say(t,color,ms){ toast.innerHTML=t; toast.style.color=color||'#fff'; toast.style.opacity='1'; clearTimeout(say.t); say.t=setTimeout(function(){ toast.style.opacity='0'; },ms||900); }
  function snd(k){ try{ opt.sfx&&opt.sfx(k); }catch(e){} }
  function showPanel(html,btns){ panel.innerHTML=''; panel.style.display='flex';
    var card=el('div','background:#fffaf0;border-radius:18px;padding:20px 18px;width:min(88vw,350px);text-align:center;font-family:'+FONT+';color:#14532d;box-shadow:0 10px 30px rgba(0,0,0,.25);',html);
    btns.forEach(function(b){ var bt=el('button','display:block;width:100%;margin-top:10px;border:none;border-radius:12px;padding:13px 8px;font-size:17px;font-weight:900;color:#fff;background:'+b.c+';font-family:inherit;cursor:pointer;line-height:1.5;',b.t);
      bt.onclick=function(e){ e.stopPropagation(); b.f(); }; card.appendChild(bt); });
    panel.appendChild(card); }

  // --- じょうたい ---
  var stage=Math.max(1,opt.stage||1), NW=4+Math.min(4,stage), ENDLESS=false;
  // けんきゅう（★で つよくなる・ずっと のこる）
  var RES=[{k:'atk',ico:'⚔',name:'タワーの こうげき',per:'+10%'},{k:'coin',ico:'🪙',name:'スタートの コイン',per:'+15'},{k:'hp',ico:'❤️',name:'おしろの たいりょく',per:'+3'},{k:'bolt',ico:'⚡',name:'さいしょの かみなり',per:'+1'},{k:'hero',ico:'🗡',name:'ゆうしゃの つよさ',per:'+25%'}];
  function resLv(k){ try{ return (opt.research&&opt.research.get().lv[k])||0; }catch(e){ return 0; } }
  var S={speed:1,streak:0,freeze:0,slow:0,coins:40+stage*10,hp:20,maxHp:20,wave:0,phase:'prep',prepT:0,spawnQ:[],spawnT:0,en:[],proj:[],bolts:0,right:0,wrong:0,kills:0,over:false,paused:false,last:0,t:0,shake:0,seen:{}};
  R.S=S;
  document.getElementById('twStage').textContent=stage;
  function baseHp(w){ return 4*(1+0.22*(w-1))*(1+0.15*(stage-1)); }
  function makeWave(w){ var q=[], n=8+w*4+stage, u=w+stage-1, pool=[['n',5]];
    if(u>=2) pool.push(['f',2]); if(u>=3) pool.push(['b',1],['fly',2]); if(u>=4) pool.push(['sh',2]); if(u>=5) pool.push(['heal',1]); if(u>=3) pool.push(['sl',2]); if(u>=4) pool.push(['mo',2]);
    var tot=pool.reduce(function(a,b){ return a+b[1]; },0);
    for(var i=0;i<n;i++){ var r=Math.random()*tot, ty='n'; for(var j=0;j<pool.length;j++){ r-=pool[j][1]; if(r<=0){ ty=pool[j][0]; break; } }
      q.push({ty:ty,gap:ty==='b'||ty==='sh'?0.8:ty==='f'?0.35:0.5}); }
    if(ENDLESS?w%5===0:w===NW){ q.splice(Math.floor(n*0.6),0,{ty:'boss',gap:1.2}); }
    return q; }
  function hud2(){ document.getElementById('twHp').textContent=Math.max(0,S.hp); document.getElementById('twCoin').textContent=S.coins;
    document.getElementById('twWave').textContent=ENDLESS?S.wave+'/∞':Math.min(S.wave,NW)+'/'+NW; boltBtn.style.display=S.bolts>0&&!S.over?'block':'none'; document.getElementById('twBolt').textContent='×'+S.bolts; if(sel) renderMenu(); }

  // --- えいごの もんだい（ウェーブの まえ） ---
  function askEnglish(then,chest){
    var q=opt.getQuestion&&opt.getQuestion(); if(!q){ then(false); return; } S.q=q;
    var order=[0,1,2].slice(0,q.choices.length).sort(function(){ return Math.random()-0.5; }), t0=Date.now();
    S.paused=true; S.asking=true; closeMenu();
    try{ opt.speak&&opt.speak(q.en); }catch(e){}
    var hot=S.streak>=2, bonus=Math.round((15+S.wave*5)*(hot?1.5:1));
    var head=chest?'<div style="font-size:26px;">🎁</div><div style="font-size:12px;font-weight:800;opacity:.7;">たからばこ！ せいかいで ごほうび</div>'
      :'<div style="font-size:12px;font-weight:800;opacity:.7;">えいごチャレンジ　せいかいで 🪙+'+bonus+' と ⚡</div>'+(hot?'<div style="font-size:12px;color:#ea580c;font-weight:900;">🔥 '+S.streak+'れんぞく せいかいちゅう！ ボーナス 1.5ばい</div>':'');
    showPanel(head+
      '<div style="font-size:34px;font-weight:900;font-family:Arial,Helvetica,sans-serif;color:#1e3a8a;margin:6px 0 4px;">'+escH(q.en)+'</div>'+
      '<div style="font-size:12px;opacity:.7;">いみは どれ？</div>',
      order.map(function(ci){ return {t:rb(q.choices[ci],(q.yomi||[])[ci]),c:'#15803d',f:function(){
        var ok=ci===0; try{ opt.onAnswer&&opt.onAnswer(q.en,ok,Date.now()-t0); }catch(e){}
        panel.style.display='none'; S.paused=false; S.asking=false; S.last=0;
        if(ok){ S.right++; S.streak++; snd('correct');
          if(chest) chestReward(); else { S.coins+=bonus; S.bolts++; say((S.streak>=3?'🔥'+S.streak+'れんぞく！<br>':'せいかい！ ')+'🪙+'+bonus+' ⚡','#bbf7d0',1400); } }
        else { S.wrong++; S.streak=0; snd('wrong'); say('<span style="font-size:22px;">'+escH(q.en)+' ＝ '+rb(q.choices[0],(q.yomi||[])[0])+'</span>','#fecaca',2000); }
        hud2(); then(ok); }}; }));
  }
  // たからばこ（ウェーブの とちゅうに でる）：タップ → えいご → ごほうび
  var chestM=null;
  (function(){ var L=[P(new THREE.BoxGeometry(0.9,0.5,0.6),'#a16207',0,0.25,0),P(new THREE.BoxGeometry(0.94,0.08,0.64),'#fbbf24',0,0.5,0),P(new THREE.CylinderGeometry(0.3,0.3,0.92,10,1,false,0,Math.PI),'#b45309',0,0.52,0,1,1,1.05,0,0,Math.PI/2),
      P(new THREE.BoxGeometry(0.14,0.2,0.05),'#fde047',0,0.42,-0.32)];
    chestM=new THREE.Group(); chestM.add(new THREE.Mesh(M(L),lam)); var gl=new THREE.Sprite(new THREE.SpriteMaterial({map:SPARK,color:0xffe066,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); gl.scale.set(2.4,2.4,1); gl.position.y=0.5; chestM.add(gl); chestM.userData.glow=gl;
    chestM.visible=false; scene.add(chestM); })();
  function spawnChest(){ for(var tr=0;tr<30;tr++){ var s0=rnd(PLEN*0.2,PLEN*0.8), q0=atS(s0), l0=Math.hypot(q0.dx,q0.dz)||1, sd=Math.random()<0.5?1:-1, x=q0.x-q0.dz/l0*1.9*sd, z=q0.z+q0.dx/l0*1.9*sd;
      if(Math.abs(x)>6.5||nearPad(x,z,1.4)) continue; S.chest={x:x,z:z,t:9}; chestM.position.set(x,0,z); chestM.visible=true; ringFx(x,z,0xffe066,1.6,0.6); snd('coin'); say('🎁 たからばこ！ タップ！','#fde68a',1200); return; } }
  function chestReward(){ var r=Math.random();
    if(r<0.4){ S.freeze=4; say('⏸ じかんが とまった！','#bae6fd',1400); ringFx(0,0,0xbae6fd,14,0.8); }
    else if(r<0.75){ var c=30+S.wave*5; S.coins+=c; say('🪙+'+c+'！','#fde68a',1300); }
    else { S.bolts++; say('⚡ かみなり +1！','#fde68a',1300); } hud2(); }
  function nextWave(){ S.wave++; hud2();
    askEnglish(function(){ S.phase='prep'; S.prepT=S.wave===1?1.5:3;
      var nw=makeWave(S.wave), fresh=[]; nw.forEach(function(it){ if(!S.seen[it.ty]&&it.ty!=='n'){ S.seen[it.ty]=1; fresh.push(it.ty); } }); S.nextQ=nw;
      if(fresh.length){ newEn.innerHTML='あたらしい てき：'+fresh.map(function(k){ return ET[k].name+(k==='fly'?'（そら）':k==='sh'?'（かたい）':k==='heal'?'（なおす）':''); }).join('・'); newEn.style.display='block'; setTimeout(function(){ newEn.style.display='none'; },5000); }
      setTimeout(function(){ if(!S.over) var bw=ENDLESS?S.wave%5===0:S.wave===NW; say('ウェーブ '+S.wave+(bw?'　ボスが くる！':''),bw?'#fecaca':'#fff',1300); },S.wave===1?0:1400); }); }

  // --- タップ：タワーを えらぶ／レベルアップ／うる ---
  var sel=null;
  function closeMenu(){ sel=null; menu.style.display='none'; rangeRing.visible=false; rangeFill.visible=false; }
  function showRange(p,type,lv){ var r=TT[type].lv[lv-1].range; [rangeRing,rangeFill].forEach(function(m){ m.visible=true; m.position.set(p.x,0.22,p.z); m.scale.setScalar(r); }); }
  function btn(html,ok,f){ var b=el('button','flex:1;min-width:0;border:none;border-radius:12px;padding:7px 2px;font-family:inherit;font-weight:900;cursor:pointer;line-height:1.25;color:#fff;background:'+(ok?'#15803d':'#9ca3af')+';font-size:12px;',html);
    b.onclick=function(e){ e.stopPropagation(); f(); }; return b; }
  function renderMenu(){ var p=sel; if(!p) return; menu.innerHTML=''; menu.style.display='block';
    var row=el('div','display:flex;gap:6px;');
    if(!p.lv){ menu.appendChild(el('div','font-size:12px;opacity:.7;margin:0 0 6px 4px;','どの タワーに する？'));
      TKEYS.forEach(function(k){ var T=TT[k], c=T.lv[0].cost, ok=S.coins>=c;
        var b=btn('<div style="font-size:24px;">'+T.ico+'</div>'+T.name+'<div style="font-size:10px;opacity:.9;">'+T.desc+'</div><div>🪙'+c+'</div>',ok,function(){ build(p,k); });
        b.onpointerenter=function(){ showRange(p,k,1); }; row.appendChild(b); });
      menu.appendChild(el('div','font-size:10px;opacity:.75;margin:6px 4px 0;line-height:1.5;','💡コンボ：❄️こおりの てきに 💣たいほう＝2ばい・🔮まほう＝1.5ばい／🔮の ちかくの 🏹ゆみ＝+30%'));
      showRange(p,'arrow',1); }
    else { var T=TT[p.type]; menu.appendChild(el('div','font-size:14px;margin:0 0 6px 4px;',T.ico+' '+T.name+' タワー　Lv'+p.lv+(p.lv>=3?'（MAX）':'')));
      if(p.lv<3){ var c2=T.lv[p.lv].cost, ok2=S.coins>=c2; row.appendChild(btn('<div style="font-size:18px;">⬆</div>レベル'+(p.lv+1)+'<div>🪙'+c2+'</div>'+(p.lv===2?'<div style="font-size:10px;">'+(p.type==='arrow'?'れんしゃ':p.type==='magic'?'れんさ まほう':p.type==='ice'?'まわりも こおる':'だい ばくはつ')+'</div>':''),ok2,function(){ upgrade(p); })); }
      var back=Math.floor(p.spent*0.6); row.appendChild(btn('<div style="font-size:18px;">💰</div>うる<div>🪙+'+back+'</div>',true,function(){ sell(p); }));
      showRange(p,p.type,p.lv); }
    row.appendChild(btn('<div style="font-size:18px;">✕</div>とじる',true,closeMenu)); row.lastChild.style.background='#6b7280'; row.lastChild.style.flex='0.6';
    menu.appendChild(row); hint.style.display='none'; }
  function build(p,k){ var c=TT[k].lv[0].cost; if(S.coins<c){ say('🪙が たりない','#fecaca',700); snd('wrong'); return false; }
    S.coins-=c; p.type=k; p.lv=1; p.spent=c; p.cd=0.3; setTower(p); snd('coin'); fx.burst(p.x,1.2,p.z,26,0xfff1b8,4,0.7); ringFx(p.x,p.z,0xfff1b8,2,0.45); closeMenu(); hud2(); return true; }
  function upgrade(p){ if(p.lv>=3) return false; var c=TT[p.type].lv[p.lv].cost; if(S.coins<c){ say('🪙が たりない','#fecaca',700); snd('wrong'); return false; }
    S.coins-=c; p.spent+=c; p.lv++; setTower(p); snd('correct'); fx.burst(p.x,1.8,p.z,34,0x93c5fd,4.5,0.8); ringFx(p.x,p.z,0x93c5fd,2.4,0.5); say('レベル '+p.lv+'！','#fff',700); if(sel===p) renderMenu(); hud2(); return true; }
  function sell(p){ S.coins+=Math.floor(p.spent*0.6); scene.remove(p.mesh); p.mesh=null; p.head=null; p.lv=0; p.type=null; p.spent=0; p.ring.visible=true; fx.burst(p.x,1,p.z,20,0xffd34d,3,0.6); snd('coin'); closeMenu(); hud2(); }
  var ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), gpl=new THREE.Plane(new THREE.Vector3(0,1,0),0), hitP=new THREE.Vector3();
  function tap(e){ if(S.over||S.paused) return; var pt=e.touches?e.touches[0]:e, rc=renderer.domElement.getBoundingClientRect();
    ndc.set((pt.clientX-rc.left)/rc.width*2-1,-(pt.clientY-rc.top)/rc.height*2+1); ray.setFromCamera(ndc,cam);
    if(!ray.ray.intersectPlane(gpl,hitP)) return;
    if(S.chest&&Math.hypot(S.chest.x-hitP.x,S.chest.z-0.4-hitP.z)<1.4){ var cx=S.chest.x, cz=S.chest.z; S.chest=null; chestM.visible=false; fx.burst(cx,0.6,cz,30,0xffe066,4,0.6); askEnglish(function(){},true); return; }
    var best=null, bd=1.6; pads.forEach(function(q){ var d=Math.hypot(q.x-hitP.x,q.z-hitP.z); if(q.lv>0) d=Math.min(d,Math.hypot(q.x-hitP.x,q.z-1.3-hitP.z)); if(d<bd){ bd=d; best=q; } });
    if(!best){ closeMenu(); if(Math.abs(hitP.x)<9&&hitP.z>-15&&hitP.z<11.5){ hero.tx=hitP.x; hero.tz=hitP.z; marker.position.set(hitP.x,0.25,hitP.z); marker.material.opacity=1; hint.style.display='none'; } return; } sel=best; renderMenu(); snd('tap'); }
  renderer.domElement.addEventListener('pointerdown',tap);
  boltBtn.onclick=function(e){ e.stopPropagation(); if(S.bolts<=0||S.over||S.paused) return;
    var best=null, bn=-1; S.en.forEach(function(a){ if(a.dead) return; var n=0; S.en.forEach(function(b){ if(!b.dead&&Math.hypot(a.x-b.x,a.z-b.z)<2.6) n++; }); if(a.ty==='boss') n+=6; if(n>bn){ bn=n; best=a; } });
    if(!best){ say('てきが いない','#fff',600); return; }
    S.bolts--; hud2(); var bx=best.x, bz=best.z, dmg=baseHp(S.wave)*8;
    S.en.forEach(function(a){ if(!a.dead&&Math.hypot(a.x-bx,a.z-bz)<2.8) hurt(a,a.ty==='boss'?dmg*0.6:dmg,true); });
    bolt.position.set(bx,15,bz); bolt.visible=true; bolt.material.opacity=1; S.boltT=0.5; ringFx(bx,bz,0xfff3b0,4,0.6); ringFx(bx,bz,0xbfe6ff,2.5,0.4);
    fx.burst(bx,0.5,bz,70,0xbfe6ff,8,0.8); fx.burst(bx,0.5,bz,30,0xffffff,4,0.5); S.shake=0.9; snd('crash'); };

  // --- ポーズ ---
  function setPause(p){ if(S.asking) return; S.paused=p; pauseBtn.textContent=p?'▶':'Ⅱ';
    if(p){ closeMenu(); showPanel('<div style="font-size:26px;font-weight:900;margin-bottom:14px;">ひとやすみ</div>',[{t:'つづける',c:'#15803d',f:function(){ setPause(false); }},{t:'やめる',c:'#8a9392',f:function(){ finish(false,true); }}]); }
    else { panel.style.display='none'; S.last=0; } }
  pauseBtn.onclick=function(e){ e.stopPropagation(); if(!S.over) setPause(!S.paused); };
  function vis(){ if(document.hidden&&!S.over&&!S.asking) setPause(true); } document.addEventListener('visibilitychange',vis);
  var camBase=new THREE.Vector3();
  function resize(){ var w=root.clientWidth||window.innerWidth, h=root.clientHeight||window.innerHeight; renderer.setSize(w,h,false); cam.aspect=w/h;
    var a=w/h; cam.fov=a<0.6?52:a<0.8?48:40; camBase.set(0,a<0.8?27:22,a<0.8?19:17); cam.position.copy(camBase); cam.lookAt(0,0,a<0.8?0.2:0); cam.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize',resize);
  R.off=function(){ window.removeEventListener('resize',resize); document.removeEventListener('visibilitychange',vis); };

  // --- たたかい ---
  function hurt(a,d,magic,crit){ if(a.dead||a.under>0) return;
    if(a.barrier>0&&!magic){ d*=0.1; if(Math.random()<0.2) fx.emit(a.x,2,a.z,rnd(-1,1),1,rnd(-1,1),0x93c5fd,0.3); } var ar=magic?0:(ET[a.ty].armor||0); if(ar){ d=Math.max(d*0.25,d-ar); if(Math.random()<0.3) fx.emit(a.x,1,a.z,rnd(-1,1),2,rnd(-1,1),0xe5e7eb,0.25); }
    a.hp-=d; a.flash=0.08; if(d>=6||crit) dmgPop(a,d,crit);
    if(a.ty==='boss'&&!a.barUsed&&a.hp<a.max*0.5&&a.hp>0){ a.barUsed=true; a.barrier=5; say('🛡 バリア！ まほうで こわせ！','#bfdbfe',1600); snd('wrong'); ringFx(a.x,a.z,0x93c5fd,3,0.6); }
    if(a.hp<=0){ a.dead=true; S.kills++; var et=ET[a.ty];
      if(et.split){ for(var sp2=0;sp2<2;sp2++){ spawn('sl2'); var ch=S.en[S.en.length-1]; ch.s=Math.max(0,a.s-0.4*sp2); ch.off=a.off+(sp2?0.35:-0.35); ch.x=a.x; ch.z=a.z; } fx.burst(a.x,0.4,a.z,12,0x4ade80,3,0.5); } S.coins+=et.coin; hud2(); var y=a.y||0.6;
      fx.burst(a.x,y,a.z,a.ty==='boss'?60:5,0xffd34d,a.ty==='boss'?6:2.2,0.5); fx.burst(a.x,y,a.z,a.ty==='fly'?8:4,a.ty==='fly'?0x7e22ce:0xffffff,2,0.35);
      if(et.coin>=3) coinPop(a.x,y+0.6,a.z,et.coin);
      if(a.ty==='boss'){ snd('fanfare'); say('ボス げきは！','#fde047',1300); S.shake=1; ringFx(a.x,a.z,0xffd34d,4,0.7); }
      else if(Math.random()<0.25) snd('coin'); } }
  var pops=0;
  function dmgPop(a,d,crit){ if(pops>10) return; pops++; var sp=toScreen(a.x,(a.y||0)+1.4,a.z), dd=el('div','position:absolute;left:'+sp.x+'px;top:'+sp.y+'px;transform:translate(-50%,-50%) scale('+(crit?1.3:1)+');font-weight:900;font-size:'+(crit?17:13)+'px;color:'+(crit?'#fde047':'#fff')+';-webkit-text-stroke:3px rgba(80,0,0,.8);paint-order:stroke fill;transition:transform .6s ease-out,opacity .6s;pointer-events:none;',(crit?'クリティカル ':'')+Math.round(d));
    labels.appendChild(dd); requestAnimationFrame(function(){ dd.style.transform='translate(-50%,-150%) scale(1)'; dd.style.opacity='0'; }); setTimeout(function(){ dd.remove(); pops--; },650); }
  function coinPop(x,y,z,v){ var sp=toScreen(x,y,z), d=el('div','position:absolute;left:'+sp.x+'px;top:'+sp.y+'px;transform:translate(-50%,-50%);font-weight:900;font-size:15px;color:#fde047;-webkit-text-stroke:3px rgba(60,40,0,.8);paint-order:stroke fill;transition:transform .8s ease-out,opacity .8s;pointer-events:none;','🪙+'+v);
    labels.appendChild(d); requestAnimationFrame(function(){ d.style.transform='translate(-50%,-160%)'; d.style.opacity='0'; }); setTimeout(function(){ d.remove(); },850); }
  function spawn(ty){ var et=ET[ty], hp=baseHp(S.wave)*et.hp; S.en.push({ty:ty,s:0,off:ty==='boss'?0:rnd(-0.55,0.55),hp:hp,max:hp,spd:et.spd*rnd(0.92,1.08),ph:Math.random()*6,x:PTS[0][0],z:PTS[0][1],y:et.air?1.7:0,dead:false,flash:0,slowT:0,slowK:0,healT:rnd(0,1)});
    if(ty!=='sl2') fx.burst(PTS[0][0],0.8,PTS[0][1]+1.2,4,0xd946ef,2,0.4);
    if(ty==='boss'){ S.slow=1.4; S.shake=1.2; snd('crash'); ringFx(PTS[0][0],PTS[0][1]+1,0xff4d4d,5,1);
      bossBan.style.display='block'; bossBan.style.animation='none'; void bossBan.offsetWidth; bossBan.style.animation='twBoss 1.8s ease-out forwards'; setTimeout(function(){ bossBan.style.display='none'; },1800); } }
  function frame(now){
    R.raf=requestAnimationFrame(frame);
    var dt=S.last?Math.min(0.05,(now-S.last)/1000):0; S.last=now;
    if(S.slow>0){ S.slow-=dt; dt*=0.3; }                                    // ボスとうじょうは スローモーション
    dt*=S.speed;
    if(!S.paused&&!S.over){ S.t+=dt; step(dt); }
    draw(dt);
  }
  function step(dt){
    if(S.phase==='prep'){ if(S.wave>0){ S.prepT-=dt; if(S.prepT<=0){ S.phase='run'; S.spawnQ=S.nextQ||makeWave(S.wave); S.spawnT=0; S.called=false; } } }
    else if(S.phase==='run'){
      S.spawnT-=dt; if(S.spawnQ.length&&S.spawnT<=0){ var it=S.spawnQ.shift(); spawn(it.ty); S.spawnT=it.gap; }
      if(!S.spawnQ.length&&!S.called&&!S.en.some(function(a){ return !a.dead; })){ S.en=[];
        if(!ENDLESS&&S.wave>=NW){ finish(true); return; }
        S.phase='wait'; S.coins+=5+S.wave*2; hud2(); say('ウェーブ クリア！ 🪙+'+(5+S.wave*2),'#bbf7d0',1100); setTimeout(function(){ if(!S.over) nextWave(); },1300); }
      // はやく よぶ：でる てきが のこって いない とき
      callBtn.style.display=(!S.spawnQ.length&&(ENDLESS||S.wave<NW)&&!S.called)?'block':'none';
      // たからばこ
      S.chestCd=(S.chestCd===undefined?rnd(8,14):S.chestCd)-dt; if(S.chestCd<=0&&!S.chest){ spawnChest(); S.chestCd=rnd(22,32); } }
    else callBtn.style.display='none';
    if(S.chest){ S.chest.t-=dt; if(S.chest.t<=0){ S.chest=null; chestM.visible=false; } }
    if(S.freeze>0){ S.freeze-=dt; }
    heroStep(dt);
    // てきが すすむ
    for(var i=0;i<S.en.length;i++){ var a=S.en[i]; if(a.dead) continue; a.flash-=dt;
      var sp=a.spd; if(a.slowT>0){ a.slowT-=dt; sp*=1-a.slowK; } if(S.freeze>0) sp=0;
      if(ET[a.ty].dig&&!a.dug&&a.s>PLEN*0.3){ a.dug=true; a.under=2.2; fx.burst(a.x,0.3,a.z,16,0x92400e,3,0.6); }
      if(a.under>0){ a.under-=dt; sp*=2.2; if(Math.random()<0.5) fx.emit(a.x,0.15,a.z,rnd(-0.5,0.5),1,rnd(-0.5,0.5),0x92400e,0.4); if(a.under<=0) fx.burst(a.x,0.3,a.z,16,0x92400e,3,0.6); }
      if(a.barrier>0) a.barrier-=dt;
      a.s+=sp*dt;
      var p=atS(a.s), l=Math.hypot(p.dx,p.dz)||1, off=ET[a.ty].air?a.off*1.8:a.off; a.x=p.x-p.dz/l*off; a.z=p.z+p.dx/l*off; a.hx=p.dx/l; a.hz=p.dz/l;
      if(ET[a.ty].heal){ a.healT-=dt; if(a.healT<=0){ a.healT=1.4; var healed=0;
          S.en.forEach(function(b){ if(!b.dead&&b!==a&&b.hp<b.max&&Math.hypot(b.x-a.x,b.z-a.z)<2.2){ b.hp=Math.min(b.max,b.hp+b.max*0.2); healed++; fx.emit(b.x,1.2,b.z,0,1.5,0,0x4ade80,0.5); } });
          if(healed){ ringFx(a.x,a.z,0x4ade80,2.2,0.5); } } }
      if(a.s>=PLEN-0.8){ a.dead=true; S.hp-=ET[a.ty].dmg; S.shake=0.5; snd('crash'); fx.burst(a.x,0.8,a.z,12,0xff5a3c,3,0.5); hud2();
        if(S.hp<=0){ S.hp=0; hud2(); finish(false); return; } } }
    if(S.en.length>60&&S.en.filter(function(a){ return a.dead; }).length>30) S.en=S.en.filter(function(a){ return !a.dead; });
    // タワーが うつ
    pads.forEach(function(q){ if(!q.lv) return; var T=TT[q.type], L=T.lv[q.lv-1]; q.cd-=dt; if(q.cd>0) return;
      var tg=null, far=-1; for(var j=0;j<S.en.length;j++){ var a=S.en[j]; if(a.dead) continue; if(ET[a.ty].air&&!T.air) continue; if(a.under>0) continue;
        if(q.type==='ice'&&a.slowT>0.6&&tg) continue;
        if(Math.hypot(a.x-q.x,a.z-q.z)<=L.range&&a.s>far){ far=a.s; tg=a; } }
      if(!tg) return; q.cd=1/L.rate; q.aim=Math.atan2(-(tg.x-q.x),-(tg.z-q.z)); q.kick=0.15;
      var hy=q.headY+0.16+0.3; var buff=q.type==='arrow'&&pads.some(function(m){ return m.type==='magic'&&Math.hypot(m.x-q.x,m.z-q.z)<4; });
      if(buff&&Math.random()<0.5) fx.emit(q.x,q.headY+0.8,q.z,0,1,0,0xe879f9,0.4);
      S.proj.push({buff:buff,type:q.type,x:q.x,y:hy,z:q.z,sx:q.x,sy:hy,sz:q.z,tg:tg,t:0,dur:q.type==='cannon'?0.5:q.type==='magic'?0.35:0.26,L:L,lv:q.lv});
      if(q.type==='cannon'){ fx.burst(q.x-Math.sin(q.aim)*0.9,hy,q.z-Math.cos(q.aim)*0.9,8,0xd6d3d1,1.5,0.4); snd('crash'); } });
    for(var k=S.proj.length-1;k>=0;k--){ var pr=S.proj[k]; pr.t+=dt; var f=Math.min(1,pr.t/pr.dur), ty2=pr.tg.y||0.6;
      pr.x=pr.sx+(pr.tg.x-pr.sx)*f; pr.z=pr.sz+(pr.tg.z-pr.sz)*f; pr.y=pr.sy+(ty2+0.4-pr.sy)*f+Math.sin(f*Math.PI)*(pr.type==='cannon'?1.6:pr.type==='arrow'?0.5:0.2);
      if(pr.type==='magic'&&Math.random()<0.7) fx.emit(pr.x,pr.y,pr.z,rnd(-0.3,0.3),rnd(-0.3,0.3),rnd(-0.3,0.3),0xe879f9,0.3);
      if(pr.type==='ice'&&Math.random()<0.5) fx.emit(pr.x,pr.y,pr.z,0,0,0,0xbae6fd,0.25);
      if(f>=1){ land(pr); S.proj.splice(k,1); } }
  }
  var comboT=0;
  function combo(t,tg){ if(S.t-comboT<2.5) return; comboT=S.t; var sp=toScreen(tg.x,1.8,tg.z), d=el('div','position:absolute;left:'+sp.x+'px;top:'+sp.y+'px;transform:translate(-50%,-50%);font-weight:900;font-size:16px;color:#a5f3fc;-webkit-text-stroke:3px rgba(10,40,80,.85);paint-order:stroke fill;transition:transform .9s ease-out,opacity .9s;pointer-events:none;white-space:nowrap;',t);
    labels.appendChild(d); requestAnimationFrame(function(){ d.style.transform='translate(-50%,-180%)'; d.style.opacity='0'; }); setTimeout(function(){ d.remove(); },950); }
  function land(pr){ var L0=pr.L, tg=pr.tg, am=1+0.1*resLv('atk'), L={dmg:L0.dmg*am,splash:L0.splash,slow:L0.slow,chain:L0.chain};
    if(pr.type==='cannon'){ var cmb=false; S.en.forEach(function(a){ if(!a.dead&&!ET[a.ty].air&&Math.hypot(a.x-tg.x,a.z-tg.z)<=L.splash){ var fz=a.slowT>0; if(fz) cmb=true; hurt(a,L.dmg*(fz?2:1),false,fz&&Math.random()<0.3); } }); if(cmb) combo('❄️×💣 コンボ！',tg);
      fx.burst(tg.x,0.5,tg.z,18,0xff8a3d,4,0.5); fx.burst(tg.x,0.5,tg.z,8,0x57534e,2,0.6); ringFx(tg.x,tg.z,0xffb347,L.splash,0.35); S.shake=Math.max(S.shake,0.15); }
    else if(pr.type==='ice'){ var hitIce=function(a){ a.slowT=1.6; a.slowK=Math.max(a.slowK*(a.slowT>0?1:0),L.slow); };
      if(L.splash){ S.en.forEach(function(a){ if(!a.dead&&Math.hypot(a.x-tg.x,a.z-tg.z)<=L.splash){ hurt(a,L.dmg); hitIce(a); } }); ringFx(tg.x,tg.z,0xbae6fd,L.splash,0.35); }
      else { hurt(tg,L.dmg); hitIce(tg); } fx.burst(tg.x,(tg.y||0.6)+0.3,tg.z,8,0xe0f2fe,2,0.4); }
    else if(pr.type==='magic'){ var fz2=tg.slowT>0; hurt(tg,L.dmg*(fz2?1.5:1),true); if(fz2) combo('❄️×🔮 コンボ！',tg); fx.burst(tg.x,(tg.y||0.6)+0.3,tg.z,10,0xe879f9,2.5,0.4);
      if(L.chain){ var from=tg, hit=[tg]; for(var c=0;c<L.chain;c++){ var nx=null, nd=2.6; S.en.forEach(function(a){ if(a.dead||hit.indexOf(a)>=0) return; var d=Math.hypot(a.x-from.x,a.z-from.z); if(d<nd){ nd=d; nx=a; } });
          if(!nx) break; hit.push(nx); for(var s3=0;s3<6;s3++){ var u=s3/6; fx.emit(from.x+(nx.x-from.x)*u,1+(from.y||0)*0.5,from.z+(nx.z-from.z)*u,0,0,0,0xf0abfc,0.25); } hurt(nx,L.dmg*0.6,true); from=nx; } } }
    else { var cr=Math.random()<0.15; hurt(tg,L.dmg*(cr?2.5:1)*(pr.buff?1.3:1),false,cr); if(cr) fx.burst(tg.x,(tg.y||0.6)+0.4,tg.z,10,0xfde047,3,0.35); if(Math.random()<0.4) fx.emit(tg.x,(tg.y||0.6)+0.2,tg.z,rnd(-1,1),1.5,rnd(-1,1),0xfff1b8,0.25); } }
  var lbl=[];
  pads.forEach(function(){ var d=el('div','position:absolute;transform:translate(-50%,-100%);font-weight:900;font-size:12px;border-radius:9px;padding:1px 7px;white-space:nowrap;border:2px solid #fff;'); labels.appendChild(d); lbl.push(d); });
  var projV=new THREE.Vector3();
  function toScreen(x,y,z){ projV.set(x,y,z).project(cam); return {x:(projV.x*0.5+0.5)*root.clientWidth,y:(-projV.y*0.5+0.5)*root.clientHeight}; }
  var bossLab=el('div','position:absolute;transform:translate(-50%,-100%);display:none;width:60px;height:8px;background:#111;border:2px solid #fff;border-radius:5px;overflow:hidden;','<div style="height:100%;background:#ef4444;width:100%;"></div>'); labels.appendChild(bossLab);
  function draw(dt){
    // てき
    Object.keys(armies).forEach(function(k){ armies[k].begin(); }); var boss=null, nb=0;
    for(var i=0;i<S.en.length;i++){ var a=S.en[i]; if(a.dead) continue; if(a.ty==='boss'){ boss=a; continue; }
      var tint=a.flash>0?HIT:a.slowT>0?SLOW:null, ry=Math.atan2(-(a.hx||0),-(a.hz||1)), spd=a.slowT>0?1-a.slowK:1;
      if(a.ty==='fly'){ if(nb>=120) continue; var yy=a.y+Math.sin(S.t*4+a.ph)*0.15, fl=Math.sin(S.t*18*spd+a.ph)*0.7;
        tmp.position.set(a.x,yy,a.z); tmp.rotation.set(0,ry,0); tmp.scale.setScalar(1); tmp.updateMatrix(); batBody.setMatrixAt(nb,tmp.matrix);
        tmp2.position.set(a.x,yy,a.z); tmp2.rotation.set(0,ry,fl,'YXZ'); tmp2.updateMatrix(); batWR.setMatrixAt(nb,tmp2.matrix);
        tmp2.rotation.set(0,ry+Math.PI,-fl,'YXZ'); tmp2.updateMatrix(); batWL.setMatrixAt(nb,tmp2.matrix);
        tmp.position.set(a.x,0.03,a.z); tmp.rotation.set(-Math.PI/2,0,0); tmp.updateMatrix(); batSh.setMatrixAt(nb,tmp.matrix); nb++; continue; }
      if(a.under>0) continue; var hopY=ET[a.ty].hop?Math.abs(Math.sin(S.t*6+a.ph))*0.25:0;
      armies[ET[a.ty].army||a.ty].put(a.x,(a.flash>0?0.06:0)+hopY,a.z,ry,(S.t*9*a.spd/1.5)*spd+a.ph,ET[a.ty].sc,tint); }
    Object.keys(armies).forEach(function(k){ armies[k].end(); });
    [batBody,batWL,batWR,batSh].forEach(function(m){ m.count=nb; m.instanceMatrix.needsUpdate=true; });
    if(boss){ bossM.g.visible=true; bossM.g.position.set(boss.x,0,boss.z); bossM.g.rotation.y=Math.atan2(boss.hx||0,boss.hz||1); bossM.anim(S.t,true,false,boss.flash>0);
      var bp=toScreen(boss.x,2.9,boss.z); bossLab.style.display='block'; bossLab.style.left=bp.x+'px'; bossLab.style.top=bp.y+'px'; bossLab.firstChild.style.width=Math.max(0,boss.hp/boss.max*100)+'%'; }
    else { bossM.g.visible=false; bossLab.style.display='none'; }
    bubble.visible=!!(boss&&boss.barrier>0); if(bubble.visible){ bubble.position.set(boss.x,1.3,boss.z); bubble.material.opacity=0.25+Math.sin(S.t*8)*0.1; bubble.scale.setScalar(1+Math.sin(S.t*3)*0.04); }
    // たま
    var na=0, no=0;
    for(var k=0;k<S.proj.length;k++){ var pr=S.proj[k];
      if(pr.type==='arrow'||pr.type==='ice'){ var dx=pr.tg.x-pr.sx, dz=pr.tg.z-pr.sz; tmp.position.set(pr.x,pr.y,pr.z); tmp.rotation.set(0,Math.atan2(dx,dz),0);
        tmp.scale.set(pr.type==='ice'?2.4:1.5,pr.type==='ice'?2.4:1.5,pr.type==='ice'?0.4:0.55); tmp.updateMatrix(); arrowM.setMatrixAt(na,tmp.matrix); _c.setHex(pr.type==='ice'?0x7dd3fc:pr.buff?0xf0abfc:0xffe27a); arrowM.setColorAt(na,_c); na++; }
      else { var big=pr.type==='cannon'; tmp.position.set(pr.x,pr.y,pr.z); tmp.rotation.set(0,0,0); tmp.scale.setScalar(big?0.9+pr.lv*0.15:0.8+pr.lv*0.15); tmp.updateMatrix(); orbM.setMatrixAt(no,tmp.matrix);
        _c.setHex(big?0x27272a:0xf0abfc); orbM.setColorAt(no,_c); no++; } }
    arrowM.count=na; arrowM.instanceMatrix.needsUpdate=true; if(arrowM.instanceColor) arrowM.instanceColor.needsUpdate=true;
    orbM.count=no; orbM.instanceMatrix.needsUpdate=true; if(orbM.instanceColor) orbM.instanceColor.needsUpdate=true;
    // タワー
    pads.forEach(function(q,idx){
      if(q.head){ if(q.type==='arrow'||q.type==='cannon'){ q.head.rotation.y+=(((q.aim-q.head.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI)*Math.min(1,dt*12);
          if(q.kick>0){ q.kick-=dt; } q.head.position.y=q.headY-(q.kick>0?q.kick*0.3:0); }
        else { q.head.rotation.y+=dt*(q.type==='magic'?1.6:0.9); q.head.position.y=q.headY+Math.sin(S.t*2.2+idx)*0.1; if(q.aura){ q.aura.position.y=q.head.position.y; q.aura.material.opacity=0.55+Math.sin(S.t*4+idx)*0.25+(q.kick>0?0.4:0); if(q.kick>0) q.kick-=dt; } }
        if(q.flag) q.flag.rotation.y=Math.sin(S.t*3+idx)*0.4;
        if(q.pop>0){ q.pop-=dt; var ps=1+Math.sin(q.pop/0.35*Math.PI)*0.18; q.mesh.scale.set(ps,1/ps+0.0,ps); } else q.mesh.scale.set(1,1,1); }
      var d=lbl[idx];
      if(q.lv>=3||S.over||sel===q){ d.style.display='none'; return; }
      var c=q.lv?TT[q.type].lv[q.lv].cost:20, ok=S.coins>=c, sp=toScreen(q.x,q.lv?TH[q.lv-1]*(q.type==='cannon'?0.7:1)+1.5:0.5,q.z);
      if(q.lv&&!ok){ d.style.display='none'; return; }
      d.style.display='block'; d.style.left=sp.x+'px'; d.style.top=sp.y+'px';
      var txt=q.lv?'⬆🪙'+c:'🪙'+c+'〜'; if(d._t!==txt+ok){ d._t=txt+ok; d.textContent=txt; d.style.background=ok?(q.lv?'#2563eb':'#16a34a'):'rgba(60,60,60,.75)'; d.style.color='#fff'; }
      if(!q.lv) q.ring.scale.setScalar(ok?1+Math.sin(S.t*5)*0.06:1); });
    // こうか
    for(var r=rings.length-1;r>=0;r--){ var rg=rings[r]; rg.t+=dt; var kk=rg.t/rg.life; if(kk>=1){ scene.remove(rg.m); rg.m.geometry.dispose(); rg.m.material.dispose(); rings.splice(r,1); continue; }
      rg.m.scale.setScalar(rg.size*(0.3+kk*0.8)); rg.m.material.opacity=0.9*(1-kk); }
    if(S.boltT>0){ S.boltT-=dt; bolt.material.opacity=Math.max(0,S.boltT/0.5); if(S.boltT<=0) bolt.visible=false; }
    heroDraw(dt);
    portal.rotation.z-=dt*1.5;
    if(chestM.visible){ chestM.position.y=Math.abs(Math.sin(S.t*4))*0.25; chestM.rotation.y=Math.sin(S.t*2)*0.4; chestM.userData.glow.material.opacity=0.6+Math.sin(S.t*8)*0.3; }
    frz.style.opacity=S.freeze>0?'1':'0';
    if(water){ water.userData.shine.scale.setScalar(1+Math.sin(S.t*1.5)*0.15); }
    flags.forEach(function(fl,i){ var pa=fl.geometry.attributes.position, b0=fl.userData.base; for(var v=0;v<pa.count;v++){ var x=b0[v*3]; pa.setZ(v,Math.sin(S.t*5+x*6+i)*0.08*(x+0.35)); } pa.needsUpdate=true; });
    fx.update(dt,0);
    var sh=S.shake||0; S.shake=Math.max(0,sh-dt*2.5);
    cam.position.set(camBase.x+(Math.random()-0.5)*sh*0.5,camBase.y+(Math.random()-0.5)*sh*0.5,camBase.z);
    renderer.render(scene,cam);
  }
  function finish(win,quit){
    if(S.over) return; S.over=true; panel.style.display='none'; S.asking=false; closeMenu();
    var stars=win&&!ENDLESS?(S.hp>=18?3:S.hp>=10?2:1):0;
    var res={endless:ENDLESS,win:!!win,quit:!!quit,stage:stage,wave:S.wave,waves:NW,right:S.right,wrong:S.wrong,kills:S.kills,hp:S.hp,stars:stars};
    var extra={}; try{ extra=opt.onEnd?opt.onEnd(res)||{}:{}; }catch(e){}
    hud2();
    setTimeout(function(){ if(!R.S||R.S!==S) return;
      if(ENDLESS){ showPanel('<div style="font-size:14px;font-weight:800;opacity:.7;">♾ むげんモード</div><div style="font-size:44px;font-weight:900;color:#7c3aed;">ウェーブ '+S.wave+'</div>'+(extra.best?'<div style="font-size:16px;font-weight:900;color:#ea580c;">🏆 しんきろく！</div>':'<div style="font-size:12px;opacity:.7;">さいこう ウェーブ '+(extra.bestWave||S.wave)+'</div>')+
        '<div style="display:flex;justify-content:space-around;background:#f5f3ff;border-radius:12px;padding:10px 4px;margin-top:8px;font-weight:900;font-size:15px;"><div>💥 '+S.kills+'</div><div style="color:#16a34a;">○ '+S.right+'</div><div style="color:#dc2626;">× '+S.wrong+'</div></div>'+(extra.reward?'<div style="font-size:12px;font-weight:800;margin-top:10px;opacity:.8;">'+extra.reward+'</div>':''),
        [{t:'もういちど（えさ1）',c:'#7c3aed',f:function(){ if(opt.onRetry) opt.onRetry(); }},{t:'もどる',c:'#8a9392',f:function(){ stop(); if(opt.onExit) opt.onExit(); }}]); return; }
      showPanel('<div style="font-size:14px;font-weight:800;opacity:.7;">STAGE '+stage+'</div>'+
      '<div style="font-size:30px;font-weight:900;line-height:1.2;margin:4px 0 6px;color:'+(win?'#15803d':'#b91c1c')+';">'+(win?'おしろを まもった！':(quit?'おつかれさま':'おしろが おちた…'))+'</div>'+
      (win?'<div style="font-size:40px;letter-spacing:4px;margin-bottom:6px;">'+[1,2,3].map(function(i){ return '<span style="color:'+(i<=stars?'#f59e0b':'#d1d5db')+';">★</span>'; }).join('')+'</div><div style="font-size:11px;opacity:.7;margin-bottom:8px;">'+(stars<3?'❤️を 18いじょう のこすと ★3':'パーフェクト！')+'</div>':'')+
      '<div style="display:flex;justify-content:space-around;background:#ecfdf5;border-radius:12px;padding:10px 4px;font-weight:900;font-size:15px;">'+
      '<div>🌊 '+Math.min(S.wave,NW)+'/'+NW+'</div><div>💥 '+S.kills+'</div><div style="color:#16a34a;">○ '+S.right+'</div><div style="color:#dc2626;">× '+S.wrong+'</div></div>'+
      (extra.reward?'<div style="font-size:12px;font-weight:800;margin-top:10px;opacity:.8;">'+extra.reward+'</div>':''),
      [{t:extra.retryLabel||'つぎへ',c:'#15803d',f:function(){ if(opt.onRetry) opt.onRetry(); }},{t:'もどる',c:'#8a9392',f:function(){ stop(); if(opt.onExit) opt.onExit(); }}]); },win?1200:600);
  }
  hud2();
  R.raf=requestAnimationFrame(frame);
  var SKINS=[{k:'red',name:'あかマント',need:0,cape:0xdc2626,crown:0xfbbf24,tint:[1,1,1]},{k:'royal',name:'ロイヤル',need:5,cape:0x7c3aed,crown:0xfbbf24,tint:[0.95,0.85,1.2]},
    {k:'gold',name:'ゴールド',need:10,cape:0xf59e0b,crown:0xfde047,tint:[1.5,1.25,0.55]},{k:'ninja',name:'にんじゃ',need:15,cape:0x111827,crown:0x374151,tint:[0.45,0.45,0.5]},{k:'ice',name:'こおりの きし',need:20,cape:0x67e8f9,crown:0xe0f2fe,tint:[0.8,1.1,1.4]}];
  function applySkin(k){ var sk=SKINS.filter(function(x){ return x.k===k; })[0]||SKINS[0]; hero.capeM.color.setHex(sk.cape); hero.crownM.color.setHex(sk.crown); hero.body.material.color.setRGB(sk.tint[0],sk.tint[1],sk.tint[2]); }
  try{ applySkin(opt.research&&opt.research.get().skin); }catch(e){}
  function showSkin(){ var info=opt.research.get();
    showPanel('<div style="font-size:22px;font-weight:900;">👕 ゆうしゃの きせかえ</div><div style="font-size:12px;opacity:.75;margin-bottom:6px;">あつめた ★の ごうけい：'+info.total+'</div>',
      SKINS.map(function(sk){ var ok=info.total>=sk.need, on=(info.skin||'red')===sk.k;
        return {t:'<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#'+('00000'+sk.cape.toString(16)).slice(-6)+';border:2px solid #fff;vertical-align:-2px;"></span> '+sk.name+(on?'（そうび中）':ok?'':'　🔒★'+sk.need),
          c:on?'#0e7490':ok?'#0891b2':'#9ca3af',f:function(){ if(!ok){ say('★ '+sk.need+'で かいほう','#fecaca',900); return; } opt.research.setSkin(sk.k); applySkin(sk.k); snd('correct'); showSkin(); }}; })
      .concat([{t:'もどる',c:'#6b7280',f:showStart}])); }
  function startGame(){ panel.style.display='none'; S.paused=false; S.asking=false; S.last=0;
    S.coins+=15*resLv('coin'); S.hp=S.maxHp=20+3*resLv('hp'); S.bolts+=resLv('bolt'); hud2(); nextWave(); }
  function showStart(){ S.paused=true; S.asking=true; var info=null; try{ info=opt.research&&opt.research.get(); }catch(e){}
    var bonus=RES.filter(function(r){ return resLv(r.k); }).map(function(r){ return r.ico+'Lv'+resLv(r.k); }).join(' ');
    showPanel('<div style="font-size:13px;opacity:.7;font-weight:800;">STAGE '+stage+'</div><div style="font-size:28px;font-weight:900;margin:2px 0 6px;">'+MP.name+'</div>'+
      '<div style="font-size:12px;opacity:.75;">ウェーブ '+NW+'　さいごに ボス</div>'+(bonus?'<div style="font-size:12px;margin-top:6px;color:#1d4ed8;">'+bonus+'</div>':''),
      [{t:'▶ スタート',c:'#15803d',f:startGame}]
      .concat(info&&info.endless?[{t:'♾ むげんモード<div style="font-size:11px;opacity:.9;">さいこう ウェーブ '+(info.bestWave||0)+'</div>',c:'#db2777',f:function(){ ENDLESS=true; NW=9999; startGame(); }}]:[])
      .concat(info?[{t:'🔬 けんきゅう（★ '+info.stars+'）',c:'#7c3aed',f:showRes},{t:'👕 きせかえ',c:'#0891b2',f:showSkin}]:[])); }
  function showRes(){ var info=opt.research.get();
    var html='<div style="font-size:22px;font-weight:900;">🔬 けんきゅう</div><div style="font-size:12px;opacity:.75;margin-bottom:8px;">ステージの ★で ずっと つよくなる（のこり ★ '+info.stars+'）</div>';
    showPanel(html,RES.map(function(r){ var lv=info.lv[r.k]||0, cost=lv+1, max=lv>=3;
      return {t:'<div style="display:flex;align-items:center;gap:6px;font-size:14px;"><span style="font-size:20px;">'+r.ico+'</span><span style="flex:1;text-align:left;">'+r.name+' <span style="font-size:11px;opacity:.85;">'+r.per+'</span><br><span style="font-size:12px;letter-spacing:2px;">'+'●'.repeat(lv)+'○'.repeat(3-lv)+'</span></span><span>'+(max?'MAX':'★'+cost)+'</span></div>',
        c:max?'#9ca3af':info.stars>=cost?'#7c3aed':'#a78bfa',f:function(){ if(max) return; if(opt.research.buy(r.k,cost)){ snd('correct'); showRes(); } else { snd('wrong'); say('★が たりない','#fecaca',800); } }}; })
      .concat([{t:'もどる',c:'#6b7280',f:showStart}])); }
  setTimeout(function(){ if(R.S===S) showStart(); },300);
  R.debug={go:startGame,hero:hero,cam:cam,S:S,pads:pads,finish:finish,TT:TT,
    build:function(i,k){ var q=pads[i]; if(!q) return false; return q.lv?upgrade(q):build(q,k||'arrow'); },
    select:function(i){ sel=pads[i]; renderMenu(); },
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
