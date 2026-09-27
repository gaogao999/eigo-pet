/* えいごウォー — はしの うえで ぐんだんを ふやして てきの ぐんだんと たたかう 3D ゲーム（Three.js）
   ・よこに ドラッグで いどう。みかたは じどうで うつ
   ・かずの ゲート（+10 ×2 −8）を くぐると ぐんだんの かずが かわる。うつと ゲートの かずが ふえる
   ・えいごゲート：うえの えいごの いみの ほうを くぐると なかまが すこし ふえる（+20%・5〜15人）、まちがえると へる
   ・さいごに ボス。たおすと ステージクリア
   app.js から EigoWar.start({...}) で よぶ。THREE は さきに 読みこんでおく。 */
(function(){
'use strict';
var R={}, HW=5.2, FONT='"Hiragino Maru Gothic ProN","Hiragino Sans","M PLUS Rounded 1c","Noto Sans JP",sans-serif';
var MAX_SQUAD=400, MAX_EN=1400, MAX_B=260;
function rnd(a,b){ return a+Math.random()*(b-a); }
function el(tag,css,html){ var e=document.createElement(tag); if(css) e.style.cssText=css; if(html!=null) e.innerHTML=html; return e; }
function escH(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

/* ---------- ゲーム ---------- */
function start(opt){
  stop();
  var root=opt.container; root.innerHTML='';
  root.style.cssText='position:fixed;inset:0;z-index:200;overflow:hidden;background:#0f3b66;touch-action:none;user-select:none;-webkit-user-select:none;';
  var renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
  root.appendChild(renderer.domElement); renderer.domElement.style.cssText='display:block;width:100%;height:100%;';
  var GX=window.WAR_GFX; GX.setup(renderer);
  var scene=new THREE.Scene(); scene.fog=new THREE.Fog(GX.HORIZON,55,170);
  var cam=new THREE.PerspectiveCamera(55,1,0.1,700);
  scene.add(new THREE.HemisphereLight(0xeaf4ff,0x5b7a96,0.85));
  var key=new THREE.DirectionalLight(0xfff1dc,0.95); key.position.set(5,14,11); scene.add(key);     // カメラがわから（せなかも あかるく）
  var rim=new THREE.DirectionalLight(0xbfe3ff,0.35); rim.position.set(-6,8,-12); scene.add(rim);
  GX.sky(scene); var sea=GX.sea(scene); GX.scenery(scene);
  var br=GX.bridge(scene,HW), scroll=br.scroll;
  var squadA=GX.army(scene,'blue',MAX_SQUAD), enA=GX.army(scene,'red',MAX_EN);
  var bMesh=GX.bullets(scene,MAX_B);
  var fx=GX.particles(scene,700);
  var bossM=GX.boss(scene); bossM.g.visible=false;
  var glowTex=GX.glowTex();

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
  var toast=el('div','position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);font-weight:900;font-size:32px;color:#fff;-webkit-text-stroke:6px rgba(15,30,60,.85);paint-order:stroke fill;text-shadow:0 4px 0 rgba(0,0,0,.3);opacity:0;transition:opacity .2s;text-align:center;white-space:nowrap;');
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
    // est＝よい ほうを えらんだ ときの にんずうの みこみ。てきは その わりあいまでに おさえて、かならず クリアできる コースに する
    var est=10, frac=Math.min(0.8,0.4+stage*0.06), ap=function(o,n){ return o.op==='+'?n+o.v:o.op==='−'?n-o.v:o.op==='×'?n*o.v:Math.ceil(n/o.v); };
    for(var i=0;i<segs;i++){
      var r=Math.random();
      if(i%3===1){ S.gates.push({wz:z,kind:'eng',done:false}); q++; est+=Math.max(5,Math.min(15,Math.round(est*0.2))); }
      else if(r<0.5||i===0||est<14){ var a=pickGood(i), b=Math.random()<0.55?pickBad(i):pickGood(i);
        if(Math.random()<0.5){ var tmp=a; a=b; b=tmp; }
        S.gates.push({wz:z,kind:'num',L:a,R:b,done:false}); est=Math.max(ap(a,est),ap(b,est)); }
      else { var cnt=Math.round((10+stage*7+i*5)*rnd(0.8,1.2)); cnt=Math.max(4,Math.min(cnt,Math.round(est*frac))); est-=cnt;
        var w=Math.random()<0.35?HW*2-0.6:rnd(3.4,6);
        var cx=w>HW*2-1?0:rnd(-HW+w/2,HW-w/2); S.groups.push(makeGroup(z,cx,w,cnt)); }
      z+=rnd(34,44);
    }
    S.len=z+20;
    S.boss={wz:S.len,hp:Math.round(Math.min(80+stage*55,40+est*3)),max:0,alive:true,x:0};
    S.boss.max=S.boss.hp;
  })();
  // かずの ゲート：ふえすぎない ように ひかえめ（×2 は たまに、×3 は ステージ3から）
  function pickGood(i){ var r=Math.random(); if(r<0.12) return {op:'×',v:2}; if(r<0.15&&stage>=3) return {op:'×',v:3}; return {op:'+',v:Math.round(rnd(3,7)+i*0.8)}; }
  function pickBad(i){ var r=Math.random(); if(r<0.15) return {op:'÷',v:2}; return {op:'−',v:Math.round(rnd(4,8)+i*1.0)}; }
  function makeGroup(wz,x,w,cnt){
    var offs=[], cols=Math.max(3,Math.round(w/0.62)), rows=Math.ceil(cnt/cols);
    for(var i=0;i<cnt;i++){ var c=i%cols, r=Math.floor(i/cols);
      offs.push({x:-w/2+(c+0.5)*(w/cols)+rnd(-0.12,0.12), z:-r*0.62+rnd(-0.12,0.12), ph:Math.random()*6}); }
    offs.sort(function(a,b){ return b.z-a.z; });                 // まえ（プレイヤーがわ）から たおれる
    return {wz:wz,x:x,w:w,total:cnt,count:cnt,offs:offs,depth:rows*0.62,melee:false,passed:false,lab:null};
  }
  // ゲートの メッシュ
  S.gates.forEach(function(g){ g.mesh=new THREE.Group(); scene.add(g.mesh); g.hitL=0; g.hitR=0; g.upL=0; g.upR=0; });
  var GATE_HITS=10, GATE_UP_MAX=8;                                 // 10ぱつで +1、1つの ゲートは +8 まで
  function gateText(o){ return o.op+o.v; }
  function isGood(o){ return o.op==='+'||o.op==='×'; }
  function buildGateMesh(g){
    while(g.mesh.children.length){ var c=g.mesh.children.pop(); c.traverse(function(n){ if(n.material){ if(n.material.map&&n.material.map!==glowTex) n.material.map.dispose(); n.material.dispose(); } if(n.geometry) n.geometry.dispose(); }); }
    var eng=g.kind==='eng';
    var sides=eng?[[-1,g.q?g.q.choices[g.q.order[0]]:'?',true],[1,g.q?g.q.choices[g.q.order[1]]:'?',true]]
             :[[-1,gateText(g.L),isGood(g.L)],[1,gateText(g.R),isGood(g.R)]];
    sides.forEach(function(sd){ var s2=sd[0], good=sd[2], col=eng?0xffc53d:good?0x60a5fa:0xf87171, W=HW-0.35;
      var pane=new THREE.Mesh(new THREE.PlaneGeometry(W,2.3),new THREE.MeshBasicMaterial({map:GX.gateTex(sd[1],good,eng),transparent:true,side:THREE.DoubleSide,depthWrite:false}));
      pane.position.set(s2*HW/2,1.4,0); g.mesh.add(pane);
      var fm=new THREE.MeshBasicMaterial({color:col});
      [[-1],[1]].forEach(function(e){ var pst=new THREE.Mesh(new THREE.BoxGeometry(0.16,2.7,0.16),fm); pst.position.set(s2*HW/2+e[0]*W/2,1.35,0); g.mesh.add(pst); });
      var top=new THREE.Mesh(new THREE.BoxGeometry(W+0.16,0.16,0.16),fm); top.position.set(s2*HW/2,2.62,0); g.mesh.add(top);
      var bot=new THREE.Mesh(new THREE.BoxGeometry(W+0.16,0.1,0.16),fm); bot.position.set(s2*HW/2,0.2,0); g.mesh.add(bot);
      var spill=new THREE.Mesh(new THREE.PlaneGeometry(W,3.2),new THREE.MeshBasicMaterial({map:glowTex,color:col,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false}));
      spill.rotation.x=-Math.PI/2; spill.position.set(s2*HW/2,0.03,1.6); g.mesh.add(spill); g.spills=(g.spills||[]).concat([spill]);
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
    say((txt?txt+'<br>':'')+'<span style="font-size:30px;">'+(dlt>=0?'+':'')+dlt+'</span>',good?'#9ed0ff':'#ffb4b4',900); snd(good?'coin':'wrong');
    if(S.n<=0) finish(false); }

  // えいごゲートの ごほうび：すこし ふえる（+20%、5〜15人）
  function engBonus(){ return Math.max(5,Math.min(15,Math.round(S.n*0.2))); }
  // えいごゲートの 問題を よういする（ちかづいた ときに）
  function prepEng(g){ if(g.q!==undefined) return; var q=opt.getQuestion&&opt.getQuestion();
    if(!q){ g.q=null; g.kind='num'; g.L={op:'+',v:5}; g.R={op:'−',v:5}; buildGateMesh(g); return; }
    q.order=Math.random()<0.5?[0,1]:[1,0]; g.q=q; g.shownAt=Date.now(); buildGateMesh(g);
    var lab=function(side,t){ return '<div style="flex:1;min-width:0;background:#dbeafe;border:2px solid #93c5fd;border-radius:9px;padding:4px 6px;font-size:14px;line-height:1.25;word-break:break-all;"><div style="font-size:9px;opacity:.6;">'+side+'</div>'+escH(t)+'</div>'; };
    qBanner.innerHTML='<div style="font-size:11px;opacity:.7;white-space:nowrap;">えいごゲート　せいかいで <span style="color:#2563eb">なかま ＋'+engBonus()+'</span></div><div style="font-size:28px;line-height:1.2;font-family:Arial,Helvetica,sans-serif;">'+escH(q.en)+'</div>'+
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
    if(run){ S.fireAcc+=(4+Math.sqrt(S.n)*1.6)*dt;                         // なかまが ふえても うつ かずは ゆっくり ふえる
      while(S.fireAcc>=1&&S.bullets.length<MAX_B){ S.fireAcc-=1;
        var a=Math.random()*Math.PI*2, rr=Math.sqrt(Math.random())*r0*0.9;
        S.bullets.push({x:S.x+Math.cos(a)*rr,wz:S.dist+0.4,life:0.6}); }        // とどくのは 20m くらい
      if(S.fireAcc>3) S.fireAcc=3; }
    // たま
    for(var i=S.bullets.length-1;i>=0;i--){ var b=S.bullets[i]; b.wz+=34*dt; b.life-=dt; var hit=false;
      for(var j=0;j<S.groups.length&&!hit;j++){ var G=S.groups[j]; if(G.count<=0) continue;
        var front=G.wz; if(b.wz>=front&&b.wz<=front+G.depth+1&&Math.abs(b.x-G.x)<=G.w/2+0.1){ G.count--; S.kills++; hit=true;
          var od=G.offs[G.total-G.count-1]; if(od&&GX.R()<0.7) fx.burst(G.x+od.x,0.6,-(G.wz-S.dist)+od.z,4,GX.R()<0.5?0xff6a4d:0xffe0c2,2.5,0.45);
          if(G.count<=0) snd('coin'); } }
      for(var k=0;k<S.gates.length&&!hit;k++){ var g=S.gates[k]; if(g.done||g.kind!=='num') continue;
        if(Math.abs(b.wz-g.wz)<0.5){ hit=true; var sd=b.x<0?'L':'R', o=g[sd]; if(GX.R()<0.25) fx.emit(b.x,1+GX.R(),-(g.wz-S.dist)+0.1,(GX.R()-0.5)*2,1.5,1.5,isGood(o)?0x9cc9ff:0xffa0a0,0.3);
          g['hit'+sd]++; if(g['hit'+sd]%GATE_HITS===0&&g['up'+sd]<GATE_UP_MAX&&(o.op==='+'||o.op==='−')){   // うつと ゲートの かずが すこし ふえる
            g['up'+sd]++; if(o.op==='−'){ o.v--; if(o.v<=0){ o.op='+'; o.v=1; } } else o.v++; g.dirty=true; } } }
      if(!hit&&S.boss.alive&&b.wz>=S.boss.wz-1&&Math.abs(b.x-S.boss.x)<1.8){ hit=true; S.boss.hp--; S.boss.flash=0.08; if(GX.R()<0.3) fx.emit(b.x,2+GX.R()*3,-(S.boss.wz-S.dist)+2,(GX.R()-0.5)*3,2,2,0xffd08a,0.3); }
      if(hit||b.life<=0) S.bullets.splice(i,1);
    }
    // てきの ぐんだん
    for(var gi=S.groups.length-1;gi>=0;gi--){ var G2=S.groups[gi];
      if(run&&G2!==engaged) G2.wz-=2.6*dt;
      if(G2===engaged){                                                            // ぶつかった：1たい1で へる（どちらかが 0に なるまで）
        if(!G2.melee){ G2.melee=true; snd('crash'); S.shake=0.5; }
        if(GX.R()<0.8) fx.burst(S.x+(GX.R()-0.5)*squadR(),0.7,-squadR()*0.6,3,GX.R()<0.5?0xfff1b8:0xff7a59,3.5,0.35);
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
          if(ok){ S.right++; changeN(Math.min(MAX_SQUAD,S.n+engBonus()),'せいかい！',true); snd('correct'); }
          else { S.wrong++; changeN(Math.max(1,Math.floor(S.n*0.7)),'<span style="font-size:20px;">'+escH(g.q.en)+' ＝ '+escH(g.q.choices[0])+'</span>',false); }
          setTimeout(function(){ qBanner.style.display='none'; },700); }
        else if(g.kind==='num'){ var o=left?g.L:g.R; changeN(apply(o),gateText(o),isGood(o)); }
        var gc=g.kind==='eng'?0xffd166:(g.kind==='num'&&isGood(left?g.L:g.R))?0x7fb8ff:0xff8a8a;
        fx.burst(left?-HW/2:HW/2,1.2,0,26,gc,5,0.7);
        g.mesh.visible=false; } });
    // ボス
    var B=S.boss;
    if(B.alive){ var brel=B.wz-S.dist;
      if(run&&bossZone&&brel>r0*0.8) B.wz-=1.6*dt;
      B.x+=((S.x*0.4)-B.x)*dt*0.8;
      if(brel<r0*0.8+0.8&&run){ B.hp-=S.n*2.2*dt; var lost=Math.max(0,dt*9); S.nf=(S.nf||0)+lost; if(S.nf>=1){ var kl=Math.floor(S.nf); S.nf-=kl; S.n=Math.max(0,S.n-kl); }
        if(S.n<=0){ finish(false); return; } }
      if(B.hp<=0){ B.alive=false; bossM.g.visible=false; S.kills+=1; var bzz=-(B.wz-S.dist); fx.burst(B.x,3,bzz,60,0xffb020,9,1.2); fx.burst(B.x,2,bzz,40,0xff5a3c,6,1.0); S.shake=1.2; snd('fanfare'); say('<span style="font-size:40px;">ボス げきは！</span>','#fde047',1500);
        setTimeout(function(){ finish(true); },1300); } }
    // ---- かく ----
    var dz=S.dist-(S.lastDist||0); S.lastDist=S.dist;
    scroll.forEach(function(s3){ s3.g.position.z=S.dist%s3.p; });
    br.roadTex.offset.y=S.dist/16;
    sea.material.uniforms.uT.value=S.t; sea.material.uniforms.uOff.value=S.dist;
    br.foamMat.opacity=0.6+Math.sin(S.t*2.2)*0.25;
    (GX.boats||[]).forEach(function(bt){ bt.position.x+=bt.userData.v*dt; bt.position.z+=dz*0.15; bt.rotation.z=Math.sin(S.t*1.4+bt.position.x)*0.06;
      if(bt.position.z>10) bt.position.z-=170; if(Math.abs(bt.position.x)>90) bt.userData.v*=-1; });
    // みかた（ひまわりの ならびかた＋あるく あし）
    var n=Math.min(S.n,MAX_SQUAD), ga=2.39996; squadA.begin();
    for(var si=0;si<n;si++){ var rr2=0.35*Math.sqrt(si+0.5), an=si*ga;
      squadA.put(S.x+Math.cos(an)*rr2,run?Math.abs(Math.sin(S.t*11+si))*0.04:0,Math.sin(an)*rr2*0.9,0,run?S.t*11+si*1.7:0,0.92); }
    squadA.end();
    // てき
    enA.begin();
    for(var q2=0;q2<S.groups.length;q2++){ var G3=S.groups[q2], z0=-(G3.wz-S.dist); if(z0<-110) continue;
      for(var m=G3.total-G3.count;m<G3.total;m++){ var o2=G3.offs[m];
        enA.put(G3.x+o2.x,0,z0+o2.z,Math.PI,run?S.t*8+o2.ph:0,0.95); } }
    enA.end();
    // たま・マズルフラッシュ
    for(var bi=0;bi<S.bullets.length;bi++){ var b2=S.bullets[bi]; tmp.position.set(b2.x,0.55,-(b2.wz-S.dist)); tmp.rotation.set(0,0,0); tmp.scale.set(1,1,1); tmp.updateMatrix(); bMesh.setMatrixAt(bi,tmp.matrix); }
    bMesh.count=S.bullets.length; bMesh.instanceMatrix.needsUpdate=true;
    if(run&&GX.R()<Math.min(0.9,S.n/40)){ var fa=GX.R()*Math.PI*2, fr2=Math.sqrt(GX.R())*squadR()*0.8; fx.emit(S.x+Math.cos(fa)*fr2,0.6,-0.3+Math.sin(fa)*fr2*0.5,0,0.4,-3,0xffd66b,0.08); }
    fx.update(dt,dz);
    S.gates.forEach(function(g){ g.mesh.position.z=-(g.wz-S.dist); (g.spills||[]).forEach(function(sp2){ sp2.material.opacity=0.35+Math.sin(S.t*4)*0.18; }); });
    if(B.alive){ var bz=-(B.wz-S.dist); bossM.g.visible=bz>-130; bossM.g.position.set(B.x,0,bz); bossM.g.rotation.y=Math.PI;   // プレイヤーの ほうを むく
      var attacking=bz>-(squadR()+4); bossM.anim(S.t,bossZone&&!attacking,attacking,B.flash>0); if(B.flash>0) B.flash-=dt; }
    else bossM.g.visible=false;
    // カメラ（すこし ゆれる）
    var shk=S.shake||0; S.shake=Math.max(0,shk-dt*3);
    cam.position.set(S.x*0.5+(GX.R()-0.5)*shk,12.5+(GX.R()-0.5)*shk,12); cam.lookAt(S.x*0.3,0,-15);
    // ラベル
    var sp=toScreen(S.x,1.9,0); sqLabel.style.left=sp.x+'px'; sqLabel.style.top=sp.y+'px'; sqLabel.textContent=S.n;
    var html='';
    S.groups.forEach(function(G4){ if(G4.count<=0) return; var z4=-(G4.wz-S.dist); if(z4<-80) return;
      var p4=toScreen(G4.x,1.6,z4-0.2); if(p4.in) html+='<div style="position:absolute;left:'+p4.x+'px;top:'+p4.y+'px;transform:translate(-50%,-100%);background:#dc2626;color:#fff;border:2px solid #fff;border-radius:10px;padding:1px 9px;font-weight:900;font-size:15px;">'+G4.count+'</div>'; });
    if(B.alive){ var zb=-(B.wz-S.dist); if(zb>-90){ var pb=toScreen(B.x,9.4,zb); if(pb.in) html+='<div style="position:absolute;left:'+pb.x+'px;top:'+pb.y+'px;transform:translate(-50%,-100%);background:#111827;color:#fde047;border:3px solid #fde047;border-radius:12px;padding:2px 12px;font-weight:900;font-size:20px;">👑 '+Math.max(0,Math.ceil(B.hp))+'</div>'; } }
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
