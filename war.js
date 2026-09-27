/* えいごウォー — はしの うえで ぐんだんを ふやして てきの ぐんだんと たたかう 3D ゲーム（Three.js）
   ・よこに ドラッグで いどう。みかたは じどうで うつ
   ・かずの ゲート（+10 ×2 −8）を くぐると ぐんだんの かずが かわる。うつと ゲートの かずが ふえる
   ・えいごゲート：うえの えいごの いみの ほうを くぐると ×2、まちがえると へる
   ・さいごに ボス。たおすと ステージクリア
   app.js から EigoWar.start({...}) で よぶ。THREE は さきに 読みこんでおく。 */
(function(){
'use strict';
var R={}, HW=5.2, FONT='"Hiragino Maru Gothic ProN","Hiragino Sans","M PLUS Rounded 1c","Noto Sans JP",sans-serif';
var MAX_SQUAD=400, MAX_EN=1400, MAX_B=260;
function rnd(a,b){ return a+Math.random()*(b-a); }
function el(tag,css,html){ var e=document.createElement(tag); if(css) e.style.cssText=css; if(html!=null) e.innerHTML=html; return e; }
function escH(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

/* ---------- へいたいの かたち（1つの ジオメトリに まとめる＝かるい） ---------- */
function part(geo,color,x,y,z,sx,sy,sz){
  geo=geo.index?geo.toNonIndexed():geo;
  var m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(sx||1,sy||1,sz||1));
  geo.applyMatrix4(m);
  var n=geo.attributes.position.count, col=new Float32Array(n*3), c=new THREE.Color(color);
  for(var i=0;i<n;i++){ col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; }
  geo.setAttribute('color',new THREE.BufferAttribute(col,3)); return geo;
}
function merge(list){
  var n=0; list.forEach(function(g){ n+=g.attributes.position.count; });
  var pos=new Float32Array(n*3), nor=new Float32Array(n*3), col=new Float32Array(n*3), o=0;
  list.forEach(function(g){ pos.set(g.attributes.position.array,o*3); nor.set(g.attributes.normal.array,o*3); col.set(g.attributes.color.array,o*3); o+=g.attributes.position.count; });
  var out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.BufferAttribute(pos,3)); out.setAttribute('normal',new THREE.BufferAttribute(nor,3)); out.setAttribute('color',new THREE.BufferAttribute(col,3));
  return out;
}
function soldierGeo(body,helmet,skin){
  var B=THREE.BoxGeometry, S=THREE.SphereGeometry;
  return merge([
    part(new B(0.11,0.3,0.14),'#2b2f3a',-0.08,0.15,0), part(new B(0.11,0.3,0.14),'#2b2f3a',0.08,0.15,0),     // あし
    part(new B(0.36,0.36,0.24),body,0,0.46,0),                                                               // どう
    part(new B(0.37,0.06,0.25),'#3a2e22',0,0.32,0),                                                          // ベルト
    part(new B(0.09,0.28,0.1),body,-0.23,0.46,-0.04), part(new B(0.09,0.28,0.1),body,0.23,0.46,-0.04),      // うで
    part(new S(0.15,10,8),skin,0,0.76,0),                                                                    // あたま
    part(new S(0.172,10,6,0,Math.PI*2,0,Math.PI/2),helmet,0,0.79,0),                                         // ヘルメット
    part(new B(0.36,0.04,0.36),helmet,0,0.79,-0.02),                                                         // つば
    part(new B(0.07,0.07,0.36),'#2a2a2e',0.12,0.5,-0.22)                                                     // じゅう
  ]);
}
function canvasTex(w,h,draw){ var c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); var t=new THREE.CanvasTexture(c); t.anisotropy=4; return t; }
function gateTex(text,good,sub){
  return canvasTex(512,256,function(g,w,h){
    var gr=g.createLinearGradient(0,0,0,h);
    gr.addColorStop(0,good?'rgba(96,165,250,.92)':'rgba(248,113,113,.92)'); gr.addColorStop(1,good?'rgba(37,99,235,.92)':'rgba(185,28,28,.92)');
    g.fillStyle=gr; g.fillRect(0,0,w,h);
    g.strokeStyle='rgba(255,255,255,.85)'; g.lineWidth=10; g.strokeRect(6,6,w-12,h-12);
    g.fillStyle='#fff'; g.textAlign='center'; g.textBaseline='middle';
    if(sub){ g.font='900 34px '+FONT; g.fillText(sub,w/2,48); }
    var fs=sub?96:130; g.font='900 '+fs+'px '+FONT;
    while(g.measureText(text).width>w-40&&fs>30){ fs-=4; g.font='900 '+fs+'px '+FONT; }
    g.lineWidth=12; g.strokeStyle='rgba(0,0,0,.35)'; g.strokeText(text,w/2,sub?h/2+28:h/2+6); g.fillText(text,w/2,sub?h/2+28:h/2+6);
  });
}

/* ---------- ゲーム ---------- */
function start(opt){
  stop();
  var root=opt.container; root.innerHTML='';
  root.style.cssText='position:fixed;inset:0;z-index:200;overflow:hidden;background:#0f3b66;touch-action:none;user-select:none;-webkit-user-select:none;';
  var renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
  root.appendChild(renderer.domElement); renderer.domElement.style.cssText='display:block;width:100%;height:100%;';
  var scene=new THREE.Scene(); scene.background=new THREE.Color(0x8cc8ec); scene.fog=new THREE.Fog(0x8cc8ec,45,130);
  var cam=new THREE.PerspectiveCamera(55,1,0.1,300);
  scene.add(new THREE.HemisphereLight(0xffffff,0x4b6a88,0.75));
  var sun=new THREE.DirectionalLight(0xfff4e0,0.6); sun.position.set(6,14,8); scene.add(sun);

  // うみ・はし
  var sea=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshLambertMaterial({color:0x14508f})); sea.rotation.x=-Math.PI/2; sea.position.y=-3; scene.add(sea);
  var waves=new THREE.InstancedMesh(new THREE.PlaneGeometry(1.6,0.12),new THREE.MeshBasicMaterial({color:0x8fd0ff,transparent:true,opacity:0.5}),160);
  var d=new THREE.Object3D();
  for(var i=0;i<160;i++){ var side=i%2?1:-1; d.position.set(side*rnd(8,40),-2.95,-rnd(-10,120)); d.rotation.set(-Math.PI/2,0,0); d.updateMatrix(); waves.setMatrixAt(i,d.matrix); }
  scene.add(waves);
  var road=new THREE.Mesh(new THREE.BoxGeometry(HW*2+1.2,0.6,260),new THREE.MeshLambertMaterial({color:0x8a919b})); road.position.set(0,-0.3,-110); scene.add(road);
  var rail=new THREE.MeshLambertMaterial({color:0x6b7280});
  [-1,1].forEach(function(s){ var r=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.5,260),rail); r.position.set(s*(HW+0.55),0.45,-110); scene.add(r);
    var cur=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.25,260),new THREE.MeshLambertMaterial({color:0xc9ccd2})); cur.position.set(s*(HW+0.35),0.1,-110); scene.add(cur); });
  // くりかえしの もの（はしら・センターライン）＝ z を ずらすだけ
  var scroll=[];
  var posts=new THREE.InstancedMesh(new THREE.BoxGeometry(0.35,0.8,0.35),rail,2*40), k2=0;
  for(var z=10;z>-150;z-=4){ [-1,1].forEach(function(s){ d.position.set(s*(HW+0.55),0.4,z); d.rotation.set(0,0,0); d.updateMatrix(); posts.setMatrixAt(k2++,d.matrix); }); }
  posts.count=k2; var gp=new THREE.Group(); gp.add(posts); scene.add(gp); scroll.push({g:gp,p:4});
  var dash=new THREE.InstancedMesh(new THREE.BoxGeometry(0.16,0.02,2.2),new THREE.MeshBasicMaterial({color:0xffffff}),40), k3=0;
  for(var z2=10;z2>-150;z2-=6){ d.position.set(0,0.01,z2); d.updateMatrix(); dash.setMatrixAt(k3++,d.matrix); }
  dash.count=k3; var gd=new THREE.Group(); gd.add(dash); scene.add(gd); scroll.push({g:gd,p:6});
  var pil=new THREE.InstancedMesh(new THREE.BoxGeometry(2.2,3,2.2),new THREE.MeshLambertMaterial({color:0x9ca3af}),20), k4=0;
  for(var z3=10;z3>-150;z3-=30){ [-1,1].forEach(function(s){ d.position.set(s*3,-1.8,z3); d.updateMatrix(); pil.setMatrixAt(k4++,d.matrix); }); }
  pil.count=k4; var gpl=new THREE.Group(); gpl.add(pil); scene.add(gpl); scroll.push({g:gpl,p:30});

  // へいたい（インスタンス）
  var mat=new THREE.MeshLambertMaterial({vertexColors:true});
  var squadMesh=new THREE.InstancedMesh(soldierGeo('#3b82f6','#1d4ed8','#f2c7a5'),mat,MAX_SQUAD);
  var enMesh=new THREE.InstancedMesh(soldierGeo('#dc2626','#991b1b','#e8b48a'),mat,MAX_EN);
  squadMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); enMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  squadMesh.frustumCulled=false; enMesh.frustumCulled=false;
  scene.add(squadMesh); scene.add(enMesh);
  var bMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(0.08,0.08,0.7),new THREE.MeshBasicMaterial({color:0xffd34d}),MAX_B);
  bMesh.frustumCulled=false; scene.add(bMesh);
  // ボス
  var boss=new THREE.Mesh(soldierGeo('#b91c1c','#450a0a','#d99a74'),mat); boss.scale.set(4.2,4.2,4.2);
  var crown=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.6,0.5,6),new THREE.MeshLambertMaterial({color:0xf5c542})); crown.position.set(0,3.75,0); crown.scale.set(0.9,0.9,0.9);
  var bossG=new THREE.Group(); bossG.add(boss); boss.position.set(0,0,0); bossG.add(crown); bossG.visible=false; scene.add(bossG);

  // --- HUD ---
  var hud=el('div','position:absolute;inset:0;pointer-events:none;font-family:'+FONT+';'); root.appendChild(hud);
  var pill='background:rgba(15,40,70,.8);color:#fff;border-radius:12px;padding:6px 12px;font-weight:900;';
  var top=el('div','position:absolute;left:12px;top:calc(12px + env(safe-area-inset-top));'+pill,'<div style="font-size:10px;opacity:.75;">STAGE</div><div id="wrStage" style="font-size:20px;line-height:1.1;">1</div>');
  hud.appendChild(top);
  var right=el('div','position:absolute;right:12px;top:calc(12px + env(safe-area-inset-top));display:flex;gap:8px;align-items:center;pointer-events:auto;');
  right.appendChild(el('div',pill+'font-size:15px;','<span style="color:#86efac">○</span><span id="wrOk">0</span> <span style="color:#fca5a5;margin-left:6px;">×</span><span id="wrNg">0</span>'));
  var pauseBtn=el('button',pill+'font-size:18px;border:none;width:42px;height:42px;padding:0;cursor:pointer;','Ⅱ'); right.appendChild(pauseBtn); hud.appendChild(right);
  var prog=el('div','position:absolute;left:50%;top:calc(18px + env(safe-area-inset-top));transform:translateX(-50%);width:34%;height:8px;background:rgba(0,0,0,.25);border-radius:6px;overflow:hidden;','<div id="wrProg" style="height:100%;width:0;background:#fde047;"></div>');
  hud.appendChild(prog);
  var qBanner=el('div','position:absolute;left:50%;top:calc(58px + env(safe-area-inset-top));transform:translateX(-50%);background:#fffaf0;color:#1f3b36;border:3px solid #1e3a8a;border-radius:14px;padding:5px 10px 8px;text-align:center;font-weight:900;display:none;box-shadow:0 4px 14px rgba(0,0,0,.25);width:min(86vw,340px);box-sizing:border-box;');
  hud.appendChild(qBanner);
  var sqLabel=el('div','position:absolute;transform:translate(-50%,-100%);'+pill+'background:#2563eb;font-size:18px;padding:3px 12px;border:2px solid #fff;'); hud.appendChild(sqLabel);
  var labels=el('div','position:absolute;inset:0;'); hud.appendChild(labels);
  var toast=el('div','position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);font-weight:900;font-size:30px;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.35),0 0 12px rgba(0,0,0,.3);opacity:0;transition:opacity .2s;text-align:center;white-space:nowrap;');
  hud.appendChild(toast);
  var hint=el('div','position:absolute;left:50%;bottom:calc(36px + env(safe-area-inset-bottom));transform:translateX(-50%);'+pill+'font-size:13px;text-align:center;line-height:1.7;white-space:nowrap;',
    '← → ドラッグで いどう（うつのは じどう）<br>あおい ゲートで なかまを ふやそう<br><span style="color:#fde047;">えいごゲートは いみの あう ほうへ！</span>');
  hud.appendChild(hint);
  var panel=el('div','position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,30,50,.45);pointer-events:auto;'); root.appendChild(panel);
  function say(t,color,ms){ toast.innerHTML=t; toast.style.color=color||'#fff'; toast.style.opacity='1'; clearTimeout(say.t); say.t=setTimeout(function(){ toast.style.opacity='0'; },ms||900); }

  // --- じょうたい ---
  var stage=Math.max(1,opt.stage||1);
  var S={ dist:0, v:8.5, x:0, tx:0, n:10, t:0, over:false, paused:false, last:0, cd:2.2,
          groups:[], gates:[], bullets:[], fireAcc:0, right:0, wrong:0, len:0, boss:null, kills:0, maxN:10, fx:[] };
  R={renderer:renderer,scene:scene,root:root,S:S,raf:0};
  document.getElementById('wrStage').textContent=stage;

  // --- コース（ステージが あがると むずかしく） ---
  (function build(){
    var z=38, segs=8+Math.min(10,stage), q=0;
    for(var i=0;i<segs;i++){
      var r=Math.random();
      if(i%3===1){ S.gates.push({wz:z,kind:'eng',done:false}); q++; }
      else if(r<0.5||i===0){ var a=pickGood(i), b=Math.random()<0.55?pickBad(i):pickGood(i);
        if(Math.random()<0.5){ var tmp=a; a=b; b=tmp; }
        S.gates.push({wz:z,kind:'num',L:a,R:b,done:false}); }
      else { var cnt=Math.round((12+stage*7+i*5)*rnd(0.8,1.25)), w=Math.random()<0.35?HW*2-0.6:rnd(3.4,6);
        var cx=w>HW*2-1?0:rnd(-HW+w/2,HW-w/2); S.groups.push(makeGroup(z,cx,w,cnt)); }
      z+=rnd(34,44);
    }
    S.len=z+20;
    S.boss={wz:S.len,hp:Math.round(80+stage*55),max:0,alive:true,x:0};
    S.boss.max=S.boss.hp;
  })();
  function pickGood(i){ var r=Math.random(); if(r<0.22) return {op:'×',v:2}; if(r<0.28&&i>3) return {op:'×',v:3}; return {op:'+',v:Math.round(rnd(4,10)+i*1.5)}; }
  function pickBad(i){ var r=Math.random(); if(r<0.2) return {op:'÷',v:2}; return {op:'−',v:Math.round(rnd(5,10)+i*1.5)}; }
  function makeGroup(wz,x,w,cnt){
    var offs=[], cols=Math.max(3,Math.round(w/0.62)), rows=Math.ceil(cnt/cols);
    for(var i=0;i<cnt;i++){ var c=i%cols, r=Math.floor(i/cols);
      offs.push({x:-w/2+(c+0.5)*(w/cols)+rnd(-0.12,0.12), z:-r*0.62+rnd(-0.12,0.12), ph:Math.random()*6}); }
    offs.sort(function(a,b){ return b.z-a.z; });                 // まえ（プレイヤーがわ）から たおれる
    return {wz:wz,x:x,w:w,total:cnt,count:cnt,offs:offs,depth:rows*0.62,melee:false,passed:false,lab:null};
  }
  // ゲートの メッシュ
  S.gates.forEach(function(g){ g.mesh=new THREE.Group(); scene.add(g.mesh); g.hitL=0; g.hitR=0; });
  function gateText(o){ return o.op+o.v; }
  function isGood(o){ return o.op==='+'||o.op==='×'; }
  function buildGateMesh(g){
    while(g.mesh.children.length){ var c=g.mesh.children.pop(); if(c.material&&c.material.map) c.material.map.dispose(); if(c.material) c.material.dispose(); if(c.geometry) c.geometry.dispose(); }
    var sides=g.kind==='eng'?[[-1,g.q?g.q.choices[g.q.order[0]]:'?',true],[1,g.q?g.q.choices[g.q.order[1]]:'?',true]]
             :[[-1,gateText(g.L),isGood(g.L)],[1,gateText(g.R),isGood(g.R)]];
    sides.forEach(function(sd){ var s=sd[0];
      var tex=gateTex(sd[1],g.kind==='eng'?true:sd[2],g.kind==='eng'?'いみは どっち？':null);
      var pane=new THREE.Mesh(new THREE.BoxGeometry(HW-0.3,2.2,0.12),new THREE.MeshBasicMaterial({map:tex,transparent:true}));
      pane.position.set(s*HW/2,1.3,0); g.mesh.add(pane);
      [-1,1].forEach(function(e){ var p=new THREE.Mesh(new THREE.BoxGeometry(0.18,2.6,0.18),new THREE.MeshLambertMaterial({color:0xe5e7eb})); p.position.set(s*HW/2+e*(HW-0.3)/2,1.3,0); g.mesh.add(p); });
    });
  }
  S.gates.forEach(buildGateMesh);

  function resize(){ var w=root.clientWidth||window.innerWidth, h=root.clientHeight||window.innerHeight;
    renderer.setSize(w,h,false); cam.aspect=w/h; cam.fov=w/h<0.8?62:50; cam.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize',resize);

  // --- 入力：ドラッグ ---
  var drag=null;
  function ds(e){ var p=e.touches?e.touches[0]:e; drag={x:p.clientX,tx:S.tx}; if(hint.style.display!=='none'&&S.cd<=0) hint.style.display='none'; }
  function dm(e){ if(!drag) return; var p=e.touches?e.touches[0]:e; var w=root.clientWidth||400;
    S.tx=Math.max(-HW,Math.min(HW,drag.tx+(p.clientX-drag.x)/w*HW*2.6)); if(e.cancelable) e.preventDefault(); }
  function de(){ drag=null; }
  function kd(e){ if(e.key==='ArrowLeft') S.tx=Math.max(-HW,S.tx-1.2); else if(e.key==='ArrowRight') S.tx=Math.min(HW,S.tx+1.2); else if(e.key==='Escape') togglePause(); }
  root.addEventListener('touchstart',ds,{passive:true}); root.addEventListener('touchmove',dm,{passive:false}); root.addEventListener('touchend',de);
  root.addEventListener('mousedown',ds); window.addEventListener('mousemove',dm); window.addEventListener('mouseup',de);
  window.addEventListener('keydown',kd);
  function vis(){ if(document.hidden&&!S.over) setPause(true); } document.addEventListener('visibilitychange',vis);
  R.off=function(){ window.removeEventListener('keydown',kd); window.removeEventListener('resize',resize); window.removeEventListener('mousemove',dm); window.removeEventListener('mouseup',de); document.removeEventListener('visibilitychange',vis); };
  function snd(k){ try{ opt.sfx&&opt.sfx(k); }catch(e){} }

  function showPanel(html,btns){ panel.innerHTML=''; panel.style.display='flex';
    var card=el('div','background:#fffaf0;border-radius:18px;padding:22px 20px;width:min(86vw,340px);text-align:center;font-family:'+FONT+';color:#1e3a8a;box-shadow:0 10px 30px rgba(0,0,0,.25);',html);
    btns.forEach(function(b){ var bt=el('button','display:block;width:100%;margin-top:10px;border:none;border-radius:12px;padding:14px;font-size:16px;font-weight:900;color:#fff;background:'+b.c+';font-family:inherit;cursor:pointer;',b.t);
      bt.onclick=function(e){ e.stopPropagation(); b.f(); }; card.appendChild(bt); });
    panel.appendChild(card); }
  function setPause(p){ S.paused=p; pauseBtn.textContent=p?'▶':'Ⅱ';
    if(p) showPanel('<div style="font-size:26px;font-weight:900;margin-bottom:14px;">ひとやすみ</div>',[{t:'つづける',c:'#2563eb',f:function(){ setPause(false); }},{t:'やめる',c:'#8a9392',f:function(){ finish(false,true); }}]);
    else { panel.style.display='none'; S.last=0; } }
  function togglePause(){ if(!S.over) setPause(!S.paused); }
  pauseBtn.onclick=function(e){ e.stopPropagation(); togglePause(); };

  function apply(o){ var n=S.n;
    if(o.op==='+') n+=o.v; else if(o.op==='−') n-=o.v; else if(o.op==='×') n*=o.v; else if(o.op==='÷') n=Math.floor(n/o.v);
    return Math.max(0,Math.min(MAX_SQUAD,Math.round(n))); }
  function changeN(nn,txt,good){ var dlt=nn-S.n; S.n=nn; S.maxN=Math.max(S.maxN,nn);
    say((txt?txt+'<br>':'')+'<span style="font-size:24px;">'+(dlt>=0?'+':'')+dlt+'</span>',good?'#bfdbfe':'#fecaca',900); snd(good?'coin':'wrong');
    if(S.n<=0) finish(false); }

  // えいごゲートの 問題を よういする（ちかづいた ときに）
  function prepEng(g){ if(g.q!==undefined) return; var q=opt.getQuestion&&opt.getQuestion();
    if(!q){ g.q=null; g.kind='num'; g.L={op:'+',v:5}; g.R={op:'−',v:5}; buildGateMesh(g); return; }
    q.order=Math.random()<0.5?[0,1]:[1,0]; g.q=q; g.shownAt=Date.now(); buildGateMesh(g);
    var lab=function(side,t){ return '<div style="flex:1;min-width:0;background:#dbeafe;border:2px solid #93c5fd;border-radius:9px;padding:4px 6px;font-size:14px;line-height:1.25;word-break:break-all;"><div style="font-size:9px;opacity:.6;">'+side+'</div>'+escH(t)+'</div>'; };
    qBanner.innerHTML='<div style="font-size:11px;opacity:.7;white-space:nowrap;">えいごゲート　せいかいで <span style="color:#2563eb">×2</span></div><div style="font-size:28px;line-height:1.2;font-family:Arial,Helvetica,sans-serif;">'+escH(q.en)+'</div>'+
      '<div style="display:flex;gap:6px;margin-top:6px;">'+lab('ひだり',q.choices[q.order[0]])+lab('みぎ',q.choices[q.order[1]])+'</div>';
    qBanner.style.display='block'; try{ opt.speak&&opt.speak(q.en); }catch(e){} }

  // --- ループ ---
  var tmp=new THREE.Object3D(), proj=new THREE.Vector3();
  function toScreen(x,y,z){ proj.set(x,y,z).project(cam); var w=root.clientWidth, h=root.clientHeight; return {x:(proj.x*0.5+0.5)*w,y:(-proj.y*0.5+0.5)*h,in:proj.z<1&&proj.z>-1}; }
  function squadR(){ return 0.35*Math.sqrt(S.n)+0.3; }
  function frame(now){
    R.raf=requestAnimationFrame(frame);
    var dt=S.last?Math.min(0.05,(now-S.last)/1000):0; S.last=now;
    if(S.paused||S.over){ renderer.render(scene,cam); return; }
    S.t+=dt;
    if(S.cd>0){ S.cd-=dt; if(S.cd<=0) say('GO!','#fff',600); }
    var run=S.cd<=0;
    var bossZone=S.boss.alive&&S.dist>=S.len-26;
    // ぶつかっている てきが いれば その場で たたかう（すりぬけない）
    var rE=squadR(), engaged=null;
    S.groups.forEach(function(G){ if(engaged||G.count<=0) return; var rl=G.wz-S.dist;
      if(rl<rE*0.7&&rl>-G.depth-1&&Math.abs(G.x-S.x)<G.w/2+rE*0.8) engaged=G; });
    if(run&&!bossZone&&!engaged){ S.dist+=S.v*dt; }
    // いどう
    var r0=squadR(); var lim=HW-Math.min(r0,HW-0.6);
    S.x+=(Math.max(-lim,Math.min(lim,S.tx))-S.x)*Math.min(1,dt*9);
    // うつ
    if(run){ S.fireAcc+=Math.min(S.n,45)*2.2*dt;
      while(S.fireAcc>=1&&S.bullets.length<MAX_B){ S.fireAcc-=1;
        var a=Math.random()*Math.PI*2, rr=Math.sqrt(Math.random())*r0*0.9;
        S.bullets.push({x:S.x+Math.cos(a)*rr,wz:S.dist+0.4,life:1.1}); }
      if(S.fireAcc>3) S.fireAcc=3; }
    // たま
    for(var i=S.bullets.length-1;i>=0;i--){ var b=S.bullets[i]; b.wz+=34*dt; b.life-=dt; var hit=false;
      for(var j=0;j<S.groups.length&&!hit;j++){ var G=S.groups[j]; if(G.count<=0) continue;
        var front=G.wz; if(b.wz>=front&&b.wz<=front+G.depth+1&&Math.abs(b.x-G.x)<=G.w/2+0.1){ G.count--; S.kills++; hit=true;
          if(G.count<=0) snd('coin'); } }
      for(var k=0;k<S.gates.length&&!hit;k++){ var g=S.gates[k]; if(g.done||g.kind!=='num') continue;
        if(Math.abs(b.wz-g.wz)<0.5){ hit=true; var sd=b.x<0?'L':'R', o=g[sd];
          g['hit'+sd]++; if(g['hit'+sd]%3===0&&(o.op==='+'||o.op==='−')){                 // うつと ゲートの かずが ふえる
            if(o.op==='−'){ o.v--; if(o.v<=0){ o.op='+'; o.v=1; } } else o.v++; g.dirty=true; } } }
      if(!hit&&S.boss.alive&&b.wz>=S.boss.wz-1&&Math.abs(b.x-S.boss.x)<1.8){ hit=true; S.boss.hp--; S.boss.flash=0.08; }
      if(hit||b.life<=0) S.bullets.splice(i,1);
    }
    // てきの ぐんだん
    for(var gi=S.groups.length-1;gi>=0;gi--){ var G2=S.groups[gi];
      if(run&&G2!==engaged) G2.wz-=2.6*dt;
      if(G2===engaged){                                                            // ぶつかった：1たい1で へる（どちらかが 0に なるまで）
        if(!G2.melee){ G2.melee=true; snd('crash'); }
        var kk=Math.min(G2.count,S.n,Math.max(1,Math.round(dt*30)));
        G2.count-=kk; S.n-=kk; S.kills+=kk;
        if(S.n<=0){ S.n=0; finish(false); return; } }
      if(G2.wz+G2.depth<S.dist-4||G2.count<=0&&G2.melee){ if(G2.lab){ G2.lab.remove(); } S.groups.splice(gi,1); }
    }
    // ゲート
    S.gates.forEach(function(g){ if(g.done) return;
      if(g.kind==='eng'&&g.wz-S.dist<55) prepEng(g);
      if(g.dirty){ g.dirty=false; buildGateMesh(g); }
      if(S.dist>=g.wz){ g.done=true; var left=S.x<0;
        if(g.kind==='eng'&&g.q){ var ci=g.q.order[left?0:1], ok=ci===0;
          try{ opt.onAnswer&&opt.onAnswer(g.q.en,ok,Date.now()-(g.shownAt||Date.now())); }catch(e){}
          if(ok){ S.right++; changeN(Math.min(MAX_SQUAD,Math.max(S.n*2,S.n+10)),'せいかい！ ×2',true); snd('correct'); }
          else { S.wrong++; changeN(Math.max(1,Math.floor(S.n*0.7)),'<span style="font-size:20px;">'+escH(g.q.en)+' ＝ '+escH(g.q.choices[0])+'</span>',false); }
          setTimeout(function(){ qBanner.style.display='none'; },700); }
        else if(g.kind==='num'){ var o=left?g.L:g.R; changeN(apply(o),gateText(o),isGood(o)); }
        g.mesh.visible=false; } });
    // ボス
    var B=S.boss;
    if(B.alive){ var brel=B.wz-S.dist;
      if(run&&bossZone&&brel>r0*0.8) B.wz-=1.6*dt;
      B.x+=((S.x*0.4)-B.x)*dt*0.8;
      if(brel<r0*0.8+0.8&&run){ B.hp-=S.n*2.2*dt; var lost=Math.max(0,dt*9); S.nf=(S.nf||0)+lost; if(S.nf>=1){ var kl=Math.floor(S.nf); S.nf-=kl; S.n=Math.max(0,S.n-kl); }
        if(S.n<=0){ finish(false); return; } }
      if(B.hp<=0){ B.alive=false; bossG.visible=false; S.kills+=1; snd('fanfare'); say('<span style="font-size:40px;">ボス げきは！</span>','#fde047',1500);
        setTimeout(function(){ finish(true); },1300); } }
    // ---- かく ----
    scroll.forEach(function(s){ s.g.position.z=S.dist%s.p; });
    // みかた
    var n=Math.min(S.n,MAX_SQUAD), ga=2.39996;
    for(var si=0;si<n;si++){ var rr2=0.35*Math.sqrt(si+0.5), an=si*ga;
      var bob=run?Math.abs(Math.sin(S.t*12+si))*0.06:0;
      tmp.position.set(S.x+Math.cos(an)*rr2,bob,Math.sin(an)*rr2*0.9); tmp.rotation.set(0,0,0); tmp.scale.set(0.9,0.9,0.9); tmp.updateMatrix();
      squadMesh.setMatrixAt(si,tmp.matrix); }
    squadMesh.count=n; squadMesh.instanceMatrix.needsUpdate=true;
    // てき
    var ei=0;
    for(var q2=0;q2<S.groups.length;q2++){ var G3=S.groups[q2], z0=-(G3.wz-S.dist); if(z0<-130) continue;
      for(var m=G3.total-G3.count;m<G3.total&&ei<MAX_EN;m++){ var o2=G3.offs[m];
        tmp.position.set(G3.x+o2.x,run?Math.abs(Math.sin(S.t*10+o2.ph))*0.05:0,z0+o2.z); tmp.rotation.set(0,Math.PI,0); tmp.updateMatrix(); enMesh.setMatrixAt(ei++,tmp.matrix); } }
    enMesh.count=ei; enMesh.instanceMatrix.needsUpdate=true;
    // たま
    for(var bi=0;bi<S.bullets.length;bi++){ var b2=S.bullets[bi]; tmp.position.set(b2.x,0.55,-(b2.wz-S.dist)); tmp.rotation.set(0,0,0); tmp.updateMatrix(); bMesh.setMatrixAt(bi,tmp.matrix); }
    bMesh.count=S.bullets.length; bMesh.instanceMatrix.needsUpdate=true;
    S.gates.forEach(function(g){ g.mesh.position.z=-(g.wz-S.dist); });
    if(B.alive){ var bz=-(B.wz-S.dist); bossG.visible=bz>-120; bossG.position.set(B.x,0,bz); bossG.rotation.y=Math.PI;
      boss.position.y=Math.abs(Math.sin(S.t*3))*0.1; boss.scale.setScalar(B.flash>0?4.35:4.2); if(B.flash>0) B.flash-=dt; }
    // カメラ
    cam.position.set(S.x*0.5,12.5,12); cam.lookAt(S.x*0.3,0,-15);
    // ラベル
    var sp=toScreen(S.x,1.9,0); sqLabel.style.left=sp.x+'px'; sqLabel.style.top=sp.y+'px'; sqLabel.textContent=S.n;
    var html='';
    S.groups.forEach(function(G4){ if(G4.count<=0) return; var z4=-(G4.wz-S.dist); if(z4<-80) return;
      var p4=toScreen(G4.x,1.6,z4-0.2); if(p4.in) html+='<div style="position:absolute;left:'+p4.x+'px;top:'+p4.y+'px;transform:translate(-50%,-100%);background:#dc2626;color:#fff;border:2px solid #fff;border-radius:10px;padding:1px 9px;font-weight:900;font-size:15px;">'+G4.count+'</div>'; });
    if(B.alive){ var zb=-(B.wz-S.dist); if(zb>-90){ var pb=toScreen(B.x,6.2,zb); if(pb.in) html+='<div style="position:absolute;left:'+pb.x+'px;top:'+pb.y+'px;transform:translate(-50%,-100%);background:#111827;color:#fde047;border:3px solid #fde047;border-radius:12px;padding:2px 12px;font-weight:900;font-size:20px;">👑 '+Math.max(0,Math.ceil(B.hp))+'</div>'; } }
    labels.innerHTML=html;
    document.getElementById('wrProg').style.width=Math.min(100,S.dist/S.len*100)+'%';
    document.getElementById('wrOk').textContent=S.right; document.getElementById('wrNg').textContent=S.wrong;
    renderer.render(scene,cam);
  }
  function finish(win,quit){
    if(S.over) return; S.over=true; qBanner.style.display='none';
    var res={win:!!win,quit:!!quit,stage:stage,n:S.n,maxN:S.maxN,right:S.right,wrong:S.wrong,kills:S.kills};
    var extra={}; try{ extra=opt.onEnd?opt.onEnd(res)||{}:{}; }catch(e){}
    showPanel('<div style="font-size:14px;font-weight:800;opacity:.7;">STAGE '+stage+'</div>'+
      '<div style="font-size:32px;font-weight:900;line-height:1.2;margin:4px 0 10px;color:'+(win?'#2563eb':'#b91c1c')+';">'+(win?'ステージ クリア！':(quit?'おつかれさま':'ぜんめつ…'))+'</div>'+
      '<div style="display:flex;justify-content:space-around;background:#eef2ff;border-radius:12px;padding:10px 4px;font-weight:900;font-size:15px;">'+
      '<div>🪖 '+S.maxN+'</div><div>💥 '+S.kills+'</div><div style="color:#16a34a;">○ '+S.right+'</div><div style="color:#dc2626;">× '+S.wrong+'</div></div>'+
      (extra.reward?'<div style="font-size:12px;font-weight:800;margin-top:10px;opacity:.8;">'+extra.reward+'</div>':''),
      [{t:extra.retryLabel||'つぎへ',c:'#2563eb',f:function(){ if(opt.onRetry) opt.onRetry(); }},{t:'もどる',c:'#8a9392',f:function(){ stop(); if(opt.onExit) opt.onExit(); }}]);
  }
  R.raf=requestAnimationFrame(frame);
  R.debug={S:S,finish:finish,setPause:setPause,info:function(){ var i=renderer.info; return {calls:i.render.calls,tris:i.render.triangles}; }};
  return R;
}
function stop(){
  if(!R||!R.renderer){ R={}; return; }
  cancelAnimationFrame(R.raf); if(R.off) R.off();
  try{ R.scene.traverse(function(n){ if(n.geometry) n.geometry.dispose(); if(n.material){ [].concat(n.material).forEach(function(m){ if(m.map) m.map.dispose(); m.dispose(); }); } }); }catch(e){}
  try{ R.renderer.dispose(); R.renderer.forceContextLoss(); }catch(e){}
  if(R.root){ R.root.innerHTML=''; R.root.style.display='none'; }
  R={};
}
window.EigoWar={ start:function(o){ o.container.style.display='block'; return start(o); }, stop:stop, _dbg:function(){ return R.debug; } };
})();
