/* メタルアサルト の え（描画だけ）
   ・座標は ゲームと おなじ「論理px」。キャラの 中は 原作単位（960幅）で かいて S=340/960 で ちぢめる
   ・ぜんぶ ふちどり＋かげ つきの 手がき風。うごき（あるく・うつ・なげる・ひざをつく）も ここで つける */
(function(){
'use strict';
var S=340/960, OL='#1d1712', FL=false, A={};
function c(x){ return FL?'#ffffff':x; }                         // ヒット時は まっしろ
function rr(ctx,x,y,w,h,r){ r=Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function fill(ctx,f,lw){ ctx.fillStyle=c(f); ctx.fill(); if(lw!==0){ ctx.lineWidth=lw||2.2; ctx.strokeStyle=OL; ctx.stroke(); } }
function box(ctx,x,y,w,h,f,r,lw){ rr(ctx,x,y,w,h,r==null?1.6:r); fill(ctx,f,lw); }
function circ(ctx,x,y,r,f,lw){ ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); fill(ctx,f,lw); }
function ell(ctx,x,y,rx,ry,f,lw,rot){ ctx.beginPath(); ctx.ellipse(x,y,rx,ry,rot||0,0,Math.PI*2); fill(ctx,f,lw); }
function poly(ctx,pts,f,lw){ ctx.beginPath(); ctx.moveTo(pts[0],pts[1]); for(var i=2;i<pts.length;i+=2) ctx.lineTo(pts[i],pts[i+1]); ctx.closePath(); fill(ctx,f,lw); }
function limb(ctx,x1,y1,x2,y2,w,f){ ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.strokeStyle=OL; ctx.lineWidth=w+2.4; ctx.stroke();
  ctx.strokeStyle=c(f); ctx.lineWidth=w; ctx.stroke(); }
function hl(ctx,x,y,w,h,col){ if(FL) return; ctx.fillStyle=col||'rgba(255,255,255,.28)'; ctx.fillRect(x,y,w,h); }   // ハイライト
function hash(i){ var x=Math.sin(i*127.1+311.7)*43758.5453; return x-Math.floor(x); }
function lerpC(a,b,t){ var pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16);
  var r=((pa>>16)&255)+(((pb>>16)&255)-((pa>>16)&255))*t, g=((pa>>8)&255)+(((pb>>8)&255)-((pa>>8)&255))*t, bl=(pa&255)+((pb&255)-(pa&255))*t;
  return 'rgb('+Math.round(r)+','+Math.round(g)+','+Math.round(bl)+')'; }
function local(ctx,x,y,face,sc){ ctx.save(); ctx.translate(x,y); ctx.scale((sc||S)*(face<0?-1:1),(sc||S)); ctx.lineJoin='round'; ctx.lineCap='round'; }

/* ================= ひと（へいたい など） ================= */
var PAL={
  soldier  :{skin:'#e9b98f',shirt:'#7b8a3e',shirtD:'#5a6629',pants:'#65723a',pantsD:'#4a5427',boot:'#3a2e22',hat:'#5f6d2e',hatD:'#46521f',belt:'#4a3a24'},
  knife    :{skin:'#d9a070',shirt:'#efe6cc',shirtD:'#cfc4a4',pants:'#6b7a45',pantsD:'#4f5a32',boot:'#2e2a26',hat:'#d8392b',hatD:'#a92a1f',belt:'#3b2f22'},
  grenadier:{skin:'#e3b088',shirt:'#c2a466',shirtD:'#9e8349',pants:'#a88d56',pantsD:'#86703f',boot:'#3a2e22',hat:'#8f7a47',hatD:'#6e5c33',belt:'#5a4428'},
  bazooka  :{skin:'#e0ad86',shirt:'#56657a',shirtD:'#3e4a5a',pants:'#4c596b',pantsD:'#36404e',boot:'#23201d',hat:'#8a2436',hatD:'#641827',belt:'#2b2b2b'},
  shield   :{skin:'#e3b088',shirt:'#34435c',shirtD:'#253146',pants:'#2e3b52',pantsD:'#1f283a',boot:'#18181a',hat:'#2b3850',hatD:'#1b2436',belt:'#161616'},
  sniper   :{skin:'#d9a57c',shirt:'#5d6e36',shirtD:'#46542a',pants:'#56652f',pantsD:'#3f4b22',boot:'#2d261e',hat:'#4d5d2a',hatD:'#3a4720',belt:'#3b2f22'},
  pow      :{skin:'#f0c9a0',shirt:'#e9dfc7',shirtD:'#c9bd9f',pants:'#c8b894',pantsD:'#a99a76',boot:'#6a5540',hat:'#e9dfc7',hatD:'#c9bd9f',belt:'#8a6a3c'},
  general  :{skin:'#f0c29a',shirt:'#6c7a3a',shirtD:'#505b28',pants:'#5b6831',pantsD:'#434d22',boot:'#1e1a16',hat:'#3b4a22',hatD:'#2a3517',belt:'#b8912c'}
};
var HAT={soldier:'helmet',knife:'bandana',grenadier:'cap',bazooka:'beret',shield:'riot',sniper:'hood',pow:'none',general:'beret'};

function gun(ctx,kind,sh){        // てきの ぶき（かたの たかさ y=-35 ふきん。まえ＝+x）
  if(kind==='rifle'){
    box(ctx,-5,-35.5,9,4.4,'#8a5a2b',1.2);                 // ストック
    box(ctx,2,-37,19,4.6,'#3b3b3f',1.2);                  // 本体
    box(ctx,8,-33.5,3.4,6,'#2b2b2e',0.8);                 // マガジン
    box(ctx,20,-36.2,8,2.2,'#2b2b2e',0.6);                // バレル
    hl(ctx,3,-36.4,16,1);
  } else if(kind==='sniper'){
    box(ctx,-6,-35.5,10,4.6,'#6b4a26',1.2);
    box(ctx,3,-37,22,4.2,'#3a4020',1.2);
    box(ctx,7,-41.5,11,3.6,'#1f1f22',1.4); circ(ctx,18.6,-39.7,1.8,'#7fd6ff',1);   // スコープ
    box(ctx,24,-36.3,16,1.8,'#2b2b2e',0.6);
  } else if(kind==='pistol'){
    box(ctx,6,-35,9,3.4,'#2f2f33',1); box(ctx,6,-33,3,4,'#2f2f33',0.8);
  }
  if(sh>0){ muzzleStar(ctx,kind==='sniper'?42:(kind==='pistol'?17:30),kind==='pistol'?-33.4:-35.2,7+sh*0.6); }
}
function muzzleStar(ctx,x,y,r){ if(FL) return;
  ctx.save(); ctx.globalCompositeOperation='lighter';
  ctx.fillStyle='rgba(255,210,90,.95)'; ctx.beginPath();
  for(var i=0;i<10;i++){ var a=i*Math.PI/5, rr2=i%2?r*0.4:r; ctx.lineTo(x+Math.cos(a)*rr2*1.3,y+Math.sin(a)*rr2*0.8); }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(255,255,230,1)'; ctx.beginPath(); ctx.arc(x,y,r*0.35,0,7); ctx.fill(); ctx.restore(); }

function hat(ctx,type,P,t,kind){
  if(type==='helmet'){
    ctx.beginPath(); ctx.arc(0,-48.5,8.6,Math.PI,0); ctx.closePath(); fill(ctx,P.hat);
    box(ctx,-10.2,-49.8,20.4,3,P.hatD,1.4); hl(ctx,-5,-55,5,1.6);
    ctx.strokeStyle=OL; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-5,-47); ctx.lineTo(-3,-41.5); ctx.stroke();   // あごひも
  } else if(type==='bandana'){
    box(ctx,-7.4,-53.6,14.8,4,P.hat,1.2);
    var wv=Math.sin(t*0.35)*2.2;
    poly(ctx,[-7,-52.6,-15,-54+wv,-16,-50+wv*0.6,-7,-50.4],P.hatD,1.6);
    ctx.fillStyle=c('#5a3a24'); ctx.fillRect(-6.5,-55.8,13,2.4);                 // かみ
  } else if(type==='cap'){
    ctx.beginPath(); ctx.arc(0,-49.2,7.6,Math.PI,0); ctx.closePath(); fill(ctx,P.hat);
    box(ctx,3,-50.4,9,2.4,P.hatD,1);
    // ガスマスク
    box(ctx,1.5,-47,6.5,6,'#6b6f68',1.6); circ(ctx,7.4,-43.6,1.9,'#4a4d47',1.2); circ(ctx,4,-46.6,1.3,'#9ee7ff',0.8);
  } else if(type==='beret'){
    ell(ctx,-1,-52.5,8.8,3.4,P.hat,1.8,-0.12); circ(ctx,3.8,-53.8,1.3,'#f2c230',0.8);
    if(kind==='general'){ // ぐんぼうの バッジ と りっぱな ひげ
      poly(ctx,[0,-44.6,9,-43.2,11.5,-40.5,6,-42.3,0,-42.6],'#3b2a1a',1);
    }
  } else if(type==='riot'){
    ctx.beginPath(); ctx.arc(0,-48,9,Math.PI*1.05,Math.PI*-0.02); ctx.closePath(); fill(ctx,P.hat);
    box(ctx,1,-50,8.6,5.8,'#1b2533',1.2); hl(ctx,2.5,-49.2,4.5,1.4,'rgba(160,220,255,.45)');
  } else if(type==='hood'){
    ctx.beginPath(); ctx.arc(-0.5,-48.5,9.2,Math.PI*0.9,Math.PI*2.05); ctx.closePath(); fill(ctx,P.hat);
    if(!FL){ ctx.strokeStyle='#3a4a1c'; ctx.lineWidth=1.4;
      for(var i=0;i<7;i++){ var a=Math.PI*(0.95+i*0.16); ctx.beginPath(); ctx.moveTo(Math.cos(a)*8.8-0.5,-48.5+Math.sin(a)*8.8); ctx.lineTo(Math.cos(a)*12-0.5,-48.5+Math.sin(a)*12+2); ctx.stroke(); } }
  }
}

/* st: {walk, pose:'stand'|'walk'|'run'|'aim'|'throw'|'kneel'|'peek'|'block', sh, t, ko} */
function human(ctx,x,y,face,kind,st){
  var P=PAL[kind]||PAL.soldier, t=st.t||0, w=st.walk||0, pose=st.pose||'stand';
  local(ctx,x,y,face,st.sc);
  if(st.rot){ ctx.translate(0,-22); ctx.rotate(st.rot); ctx.translate(0,22); }
  // かげ
  if(!st.air&&!FL){ ctx.fillStyle='rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0,0.5,11,2.4,0,0,7); ctx.fill(); }
  var lean=pose==='run'?0.22:0, kneel=pose==='kneel';
  ctx.save(); if(lean){ ctx.translate(0,-2); ctx.rotate(lean); }
  var sw=(pose==='walk'||pose==='run')?Math.sin(w)*(pose==='run'?0.85:0.55):0;
  var hipY=kneel?-15:-22;
  // うしろの あし
  var b1x=kneel?-9:Math.sin(-sw)*20, b1y=kneel?0:hipY+Math.cos(sw)*21;
  if(kneel){ limb(ctx,-1,hipY,-8,-6,7,P.pantsD); limb(ctx,-8,-6,-12,0,6.5,P.pantsD); box(ctx,-16,-3.4,7,3.4,P.boot,1); }
  else { limb(ctx,-1,hipY,b1x,b1y-3,7,P.pantsD); box(ctx,b1x-4,b1y-4.4,10,4.4,P.boot,1.4); }
  // うしろの うで
  if(kind==='knife'&&pose==='run') limb(ctx,-2,-37,-9+Math.sin(w)*6,-27,5.4,P.skin);
  // リュック（グレネーダー）
  if(kind==='grenadier'){ box(ctx,-15,-41,8.5,17,'#6b5433',2);
    circ(ctx,-11,-27.5,2.6,'#5d7a3a',1.2); circ(ctx,-11,-33,2.6,'#5d7a3a',1.2); }
  if(kind==='sniper'&&!FL){ ctx.strokeStyle='#46552a'; ctx.lineWidth=1.3; for(var f=0;f<6;f++){ ctx.beginPath(); ctx.moveTo(-8+f*3,-24); ctx.lineTo(-9+f*3+Math.sin(t*0.1+f)*1,-17); ctx.stroke(); } }
  // どう
  var tY=kneel?-34:-41;
  box(ctx,-8.2,tY,16.4,19.5,P.shirt,2.2);
  ctx.fillStyle=c(P.shirtD); ctx.fillRect(-8.2,tY+1,4,17.5);
  if(kind==='knife'){ ctx.fillStyle=c(P.skin); ctx.fillRect(-5,tY+0.8,10,4); }       // タンクトップ
  if(kind==='soldier'||kind==='general'){ box(ctx,-3,tY+4,5,4,P.shirtD,0.8); box(ctx,3,tY+4,4,4,P.shirtD,0.8); }  // ポケット
  if(kind==='general'){ for(var m=0;m<3;m++) circ(ctx,-4+m*3.4,tY+3,1.2,m===1?'#e04a3a':'#f2c230',0.7); }       // くんしょう
  if(kind==='pow'&&!st.free){ ctx.strokeStyle=c('#9a6a3a'); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-8,tY+8); ctx.lineTo(8,tY+11); ctx.moveTo(-8,tY+12); ctx.lineTo(8,tY+15); ctx.stroke(); }
  box(ctx,-8.6,tY+15,17.2,3.6,P.belt,1); if(!FL){ ctx.fillStyle='#d9b64a'; ctx.fillRect(-1.3,tY+15.6,2.6,2.4); }
  // まえの あし
  var f1x=kneel?5:Math.sin(sw)*20, f1y=kneel?0:hipY+Math.cos(sw)*21;
  if(kneel){ limb(ctx,1,hipY,8,-12,7.4,P.pants); limb(ctx,8,-12,8,-2,6.8,P.pants); box(ctx,5,-4.6,10,4.6,P.boot,1.4); }
  else { limb(ctx,1,hipY,f1x,f1y-3,7.4,P.pants); box(ctx,f1x-4,f1y-4.6,10.5,4.6,P.boot,1.4); }
  // あたま
  var hy=kneel?7:0; ctx.save(); ctx.translate(0,hy);
  circ(ctx,0.5,-46.5,7,P.skin); hl(ctx,-2,-51,3,1.6,'rgba(255,255,255,.35)');
  if(st.ko){ ctx.strokeStyle=OL; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(2,-49.5); ctx.lineTo(5.5,-46); ctx.moveTo(5.5,-49.5); ctx.lineTo(2,-46); ctx.stroke(); }
  else if(HAT[kind]!=='riot'){ ctx.fillStyle=c(OL); ctx.fillRect(3.4,-48.6,1.9,2.6);
    if(kind==='knife'&&pose==='run'){ ctx.fillRect(4,-43.6,3,1.4); }                               // さけんでいる くち
    if(kind==='general'||kind==='pow'){ ctx.fillStyle=c(kind==='pow'?'#b9a88a':'#3b2a1a'); ctx.fillRect(1,-44,7,2.2); } }
  if(!st.nohat) hat(ctx,HAT[kind],P,t,kind);
  if(kind==='pow'){ poly(ctx,[-3,-43,7,-43,5,-36,-1,-36],'#d8ccb0',1.2); }                       // ひげ
  ctx.restore();
  // ぶきと まえの うで
  var ay=kneel?7:0; ctx.save(); ctx.translate(0,ay);
  if(kind==='soldier'){ if(pose==='aim'||st.sh>0){ gun(ctx,'rifle',st.sh||0); limb(ctx,1,-37,9,-34.5,5.4,P.shirt); circ(ctx,10,-34.2,2.3,P.skin,1.2); }
    else { ctx.save(); ctx.rotate(0.45); gun(ctx,'rifle',0); ctx.restore(); limb(ctx,1,-37,7,-29,5.4,P.shirt); circ(ctx,7.4,-28.6,2.3,P.skin,1.2); } }
  else if(kind==='sniper'){ gun(ctx,'sniper',st.sh||0); limb(ctx,1,-37,10,-34.5,5.4,P.shirt); circ(ctx,10.5,-34.2,2.3,P.skin,1.2); }
  else if(kind==='knife'){ var ka=pose==='run'?-0.4+Math.sin(w)*0.5:0.3;
    ctx.save(); ctx.translate(2,-37); ctx.rotate(ka);
    limb(ctx,0,0,10,4,5.4,P.skin);
    poly(ctx,[12,1,27,-1.5,28.5,1,13,5],'#dfe6ee',1.4); box(ctx,9,1,4.4,5,'#5a3a24',0.8); hl(ctx,14,1.5,11,0.9,'rgba(255,255,255,.7)');
    ctx.restore(); }
  else if(kind==='grenadier'){
    if(pose==='throw'){ var th=st.throwP||0, a2=-2.4+th*2.8; ctx.save(); ctx.translate(0,-37); ctx.rotate(a2);
      limb(ctx,0,0,12,0,5.4,P.shirt); circ(ctx,14,0,3.2,'#5d7a3a',1.4); ctx.restore(); }
    else { limb(ctx,1,-37,6,-28,5.4,P.shirt); circ(ctx,6.5,-26.6,3,'#5d7a3a',1.4); } }
  else if(kind==='bazooka'){
    var by=-45.5, back=st.sh>0?-2:0;
    box(ctx,-16+back,by,36,7,'#5d6b3a',2.6); ctx.fillStyle=c('#46522a'); ctx.fillRect(-16+back,by+4.6,36,2.4);
    box(ctx,-20+back,by-0.8,5,8.6,'#3f4a26',1.6);
    poly(ctx,[20+back,by-0.4,28+back,by+3.5,20+back,by+7.4],'#d8392b',1.6);                          // だんとう
    box(ctx,4+back,by-4.2,5,4,'#2b2b2e',0.8);                                                    // しょうじゅん
    limb(ctx,1,-37,8,by+9,5.4,P.shirt); circ(ctx,8.6,by+9.6,2.3,P.skin,1.2);
    if(st.sh>0&&!FL){ ctx.fillStyle='rgba(230,230,230,'+(0.5*st.sh/10)+')'; ctx.beginPath(); ctx.arc(-24,by+3,6+ (10-st.sh),0,7); ctx.fill(); }   // うしろの けむり
    if(st.sh>0) muzzleStar(ctx,30,by+3.5,6+st.sh*0.5); }
  else if(kind==='shield'){
    var down=pose==='peek'?1:0;
    if(down){ gun(ctx,'pistol',st.sh||0); limb(ctx,1,-37,8,-34,5.4,P.shirt); circ(ctx,8.5,-33.5,2.2,P.skin,1.2); }
    ctx.save(); ctx.translate(10,-24); ctx.rotate(down?0.95:0);
    box(ctx,-2.5,-24,6.5,47,'#9fb0c4',2.4); ctx.fillStyle=c('#7f91a8'); ctx.fillRect(2,-22,1.8,43);
    box(ctx,-1.8,-18,5,8,'#2a3a52',1); hl(ctx,-1,-17,2,6,'rgba(170,220,255,.5)');
    ctx.fillStyle=c('#f2c230'); ctx.fillRect(-1.6,4,5,2.2); ctx.fillRect(-1.6,9,5,2.2);
    ctx.restore(); }
  else if(kind==='pow'){ if(st.free){ // けいれい
      limb(ctx,1,-37,6,-48,5,P.shirt); circ(ctx,6.6,-49,2.2,P.skin,1.2); } }
  else if(kind==='general'){ // サーベルを ふりあげる
    var sa=-1.9+Math.sin(t*0.12)*0.5; ctx.save(); ctx.translate(2,-37); ctx.rotate(sa);
    limb(ctx,0,0,10,0,5.4,P.shirt); box(ctx,9,-2.4,3,4.8,'#b8912c',0.8);
    poly(ctx,[12,-1,34,-0.3,35,0.8,12,1.5],'#e8eef4',1.2); ctx.restore(); }
  ctx.restore();
  ctx.restore(); ctx.restore();
}
A.human=function(ctx,x,y,face,kind,st,flash){ FL=!!flash; human(ctx,x,y,face,kind,st||{}); FL=false; };

/* ================= のりもの ================= */
function treads(ctx,x0,w,y0,h,odo,col){
  box(ctx,x0,y0,w,h,'#2a2926',h/2,2.4);
  var n=Math.max(3,Math.round(w/13));
  for(var i=0;i<n;i++){ var wx=x0+h/2+i*(w-h)/(n-1);
    circ(ctx,wx,y0+h/2,h*0.36,col||'#56544c',1.6);
    if(!FL){ ctx.strokeStyle='#2a2926'; ctx.lineWidth=1.2; var a=odo*0.25;
      ctx.beginPath(); ctx.moveTo(wx+Math.cos(a)*h*0.3,y0+h/2+Math.sin(a)*h*0.3); ctx.lineTo(wx-Math.cos(a)*h*0.3,y0+h/2-Math.sin(a)*h*0.3); ctx.stroke(); } }
  if(!FL){ ctx.fillStyle='#4a4842'; var off=(odo*2)%6; for(var k=x0+3-off;k<x0+w-2;k+=6){ ctx.fillRect(k,y0-0.2,2.4,1.4); ctx.fillRect(k,y0+h-1.2,2.4,1.4); } }
}
function star(ctx,x,y,r,col){ if(FL) return; ctx.fillStyle=col; ctx.beginPath();
  for(var i=0;i<10;i++){ var a=-Math.PI/2+i*Math.PI/5, q=i%2?r*0.42:r; ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q); } ctx.closePath(); ctx.fill(); }

A.tank=function(ctx,e,t,flash){ FL=!!flash; local(ctx,e.x,e.y,e.face);
  if(!FL){ ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0,1,56,4,0,0,7); ctx.fill(); }
  treads(ctx,-52,104,-17,17,e.x/S*0.1,'#5d5a50');
  poly(ctx,[-50,-17,-45,-32,38,-32,54,-19,54,-17],'#7a7446',2.4);
  ctx.fillStyle=c('#5f5a36'); ctx.fillRect(-48,-21,100,4);
  hl(ctx,-40,-31,70,2.2);
  for(var r=0;r<6;r++) circ(ctx,-38+r*15,-26,1.1,'#4a4628',0);
  star(ctx,-24,-26,4.4,'#f2c230');
  var rec=(e.shotT||0)>0?-(e.shotT/10)*6:0;
  box(ctx,12+rec,-43,44,5,'#5d583a',1.6); box(ctx,52+rec,-44.2,7,7.4,'#48442c',1.4);                // ほうしん
  rr(ctx,-22,-50,40,19,7); fill(ctx,'#857e4c',2.4); hl(ctx,-16,-48.5,28,2);
  box(ctx,-14,-55,14,5,'#5f5a36',1.4);                                                            // ハッチ
  // しゃちょう（のぞいている）
  ctx.save(); ctx.translate(-7,-9); circ(ctx,0,-48,4.6,'#e9b98f',1.8);
  ctx.beginPath(); ctx.arc(0,-49,5.6,Math.PI,0); ctx.closePath(); fill(ctx,'#5f6d2e',1.6);
  ctx.fillStyle=c(OL); ctx.fillRect(2,-48.8,1.4,1.8); ctx.restore();
  if((e.shotT||0)>0) muzzleStar(ctx,62+rec,-40.5,9+e.shotT*0.8);
  // はいきガス
  if(!FL&&t%12<6){ ctx.fillStyle='rgba(80,80,80,.35)'; ctx.beginPath(); ctx.arc(-56-(t%12)*0.8,-28-(t%12),3+(t%12)*0.4,0,7); ctx.fill(); }
  ctx.restore(); FL=false; };

A.heli=function(ctx,e,t,flash){ FL=!!flash; local(ctx,e.x,e.y,e.face);
  // テールブーム
  poly(ctx,[-12,-6,-56,-3,-56,3,-12,6],'#566276',2.2);
  box(ctx,-62,-15,8,14,'#4a5568',2);
  ell(ctx,-58,-2,2,9*Math.abs(Math.sin(t*0.9))+1,'rgba(200,210,220,.7)',0);
  // ボディ
  rr(ctx,-24,-15,50,27,12); fill(ctx,'#5b6a80',2.6);
  ctx.fillStyle=c('#465368'); ctx.fillRect(-22,3,46,6);
  hl(ctx,-16,-13,30,2.4);
  // キャノピー
  ctx.beginPath(); ctx.moveTo(10,-14); ctx.quadraticCurveTo(30,-12,28,4); ctx.lineTo(12,4); ctx.closePath(); fill(ctx,'#8fd3f0',2.2);
  if(!FL){ ctx.fillStyle='rgba(255,255,255,.45)'; ctx.fillRect(15,-11,5,6); }
  circ(ctx,16,-5,3.4,'#e9b98f',1.2); ctx.beginPath(); ctx.arc(16,-6,4,Math.PI,0); fill(ctx,'#3b4632',1.2);   // パイロット
  // ガンポッド・スキッド
  box(ctx,6,10,18,4.5,'#3a3f48',1.4); box(ctx,22,10.8,6,2.4,'#2b2b2e',0.8);
  if((e.shotT||0)>0) muzzleStar(ctx,15,20,7);
  limb(ctx,-14,12,-14,18,2,'#3a3f48'); limb(ctx,12,12,12,18,2,'#3a3f48'); limb(ctx,-22,19,24,19,2.4,'#3a3f48');
  // ローター
  box(ctx,-2,-21,5,7,'#3a3f48',1.2);
  if(!FL){ ctx.fillStyle='rgba(210,220,230,.35)'; ctx.beginPath(); ctx.ellipse(0,-21,58,3,0,0,7); ctx.fill(); }
  var ra=Math.cos(t*0.8)*56; limb(ctx,-ra,-21.5,ra,-20.5,2.2,'#2b2f36');
  ctx.restore(); FL=false; };

A.gunship=function(ctx,e,t,flash){ FL=!!flash; local(ctx,e.x,e.y,e.face);
  // ほそながい ボディ（2つの ローター）
  rr(ctx,-78,-22,156,40,16); fill(ctx,'#4f5b4a',2.8);
  ctx.fillStyle=c('#3f4a3b'); ctx.fillRect(-74,6,148,10);
  hl(ctx,-66,-20,120,3);
  for(var i=0;i<6;i++){ box(ctx,-50+i*16,-12,9,8,'#8fd3f0',1.4); }                     // まど
  box(ctx,-70,-37,20,16,'#4a5645',2); box(ctx,50,-37,20,16,'#4a5645',2);                // ローターの だい
  poly(ctx,[66,-18,86,-6,78,14,62,14],'#8fd3f0',2.2);                                     // コクピット
  // ばくだん ベイ ＋ ガトリング
  box(ctx,-22,17,44,7,'#2f362c',1.6);
  if(!FL&&e.bombOpen){ ctx.fillStyle='#ff5c5c'; ctx.fillRect(-18,20,36,2); }
  box(ctx,-4,24,8,8,'#2b2b2e',1.4); box(ctx,-1,31,2.6,8,'#2b2b2e',0.8);
  if((e.shotT||0)>0) muzzleStar(ctx,0,41,8);
  star(ctx,-40,-2,5,'#e04a3a');
  [-60,60].forEach(function(rx,k){ var ra=Math.cos(t*0.7+k*1.6)*44;
    if(!FL){ ctx.fillStyle='rgba(210,220,230,.3)'; ctx.beginPath(); ctx.ellipse(rx,-40,46,3.4,0,0,7); ctx.fill(); }
    limb(ctx,rx-ra,-40.5,rx+ra,-39.5,2.4,'#23272c'); });
  // HPバー
  ctx.restore(); FL=false;
  var hw=60, r=Math.max(0,e.hp/36); ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(e.x-hw/2-1,e.y+S*46-1,hw+2,4);
  ctx.fillStyle=r>0.5?'#ffb020':'#ff5c5c'; ctx.fillRect(e.x-hw/2,e.y+S*46,hw*r,2); };

A.turret=function(ctx,e,t,flash){ FL=!!flash; local(ctx,e.x,e.y,e.face);
  // うしろの へいたい
  ctx.save(); ctx.translate(-4,8); circ(ctx,0,-40,6,'#e9b98f',1.8); ctx.beginPath(); ctx.arc(0,-41,7.4,Math.PI,0); ctx.closePath(); fill(ctx,'#5f6d2e',1.8);
  box(ctx,-8.6,-42.4,17.2,2.6,'#46521f',1); ctx.fillStyle=c(OL); ctx.fillRect(3,-40.4,1.6,2.2); ctx.restore();
  // きかんじゅう
  var spin=(e.shotT||0)>0?t*0.9:0;
  box(ctx,-2,-27,6,10,'#3a3a3f',1.4);
  box(ctx,0,-30,20,6,'#3b3b41',1.6); box(ctx,18,-29.5,14,3,'#2b2b2e',0.8);
  if(!FL){ ctx.fillStyle='#8a8a8a'; ctx.fillRect(20+Math.abs(Math.sin(spin))*8,-29.5,2,3); }
  if((e.shotT||0)>0) muzzleStar(ctx,35,-28,8);
  // どのう
  var bags=[[-16,-8],[-4,-8],[8,-8],[-10,-16],[2,-16],[-4,-24]];
  bags.forEach(function(b,i){ ell(ctx,b[0]+4,b[1]+4,7,4.6,i%2?'#b9a26e':'#c9b37e',2); if(!FL){ ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(b[0]+1,b[1]+4); ctx.lineTo(b[0]+7,b[1]+4); ctx.stroke(); } });
  ctx.restore(); FL=false; };

A.drone=function(ctx,e,t,flash){ FL=!!flash; local(ctx,e.x,e.y,e.face);
  var tilt=e.st==='dive'?0.5:Math.sin(t*0.1)*0.08; ctx.rotate(tilt);
  limb(ctx,-16,-3,16,-3,2.4,'#3a3f48');
  [-16,16].forEach(function(rx){ box(ctx,rx-2,-7,4,4,'#2b2f36',1);
    if(!FL){ ctx.fillStyle='rgba(220,230,240,.45)'; ctx.beginPath(); ctx.ellipse(rx,-8,9,1.6,0,0,7); ctx.fill(); }
    var ra=Math.cos(t*1.3+rx)*9; limb(ctx,rx-ra,-8.2,rx+ra,-7.8,1.4,'#23272c'); });
  rr(ctx,-9,-5,18,10,4); fill(ctx,'#6c7686',2.2); hl(ctx,-6,-4,10,1.4);
  var blink=Math.floor(t/8)%2===0||e.st==='dive';
  circ(ctx,5,1,2.8,blink?'#ff3b3b':'#7a1e1e',1.2);
  if(!FL&&blink){ ctx.fillStyle='rgba(255,70,70,.3)'; ctx.beginPath(); ctx.arc(5,1,6,0,7); ctx.fill(); }
  limb(ctx,-6,5,-8,9,1.4,'#3a3f48'); limb(ctx,6,5,8,9,1.4,'#3a3f48');
  ctx.restore(); FL=false; };

/* ボス：モーデン将軍の ようさい（第1段階＝そうこう／第2段階＝コアが むきだし） */
A.boss=function(ctx,b,t){ FL=b.flash>0&&Math.floor(t/2)%2===0; local(ctx,b.x,b.y,-1);
  var ph2=b.phase2, rage=b.hp<b.maxhp*0.35;
  if(!FL){ ctx.fillStyle='rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0,1,112,6,0,0,7); ctx.fill(); }
  treads(ctx,-104,208,-24,24,t*0.5,'#5a564a');
  // ほんたい
  poly(ctx,[-102,-24,-94,-78,70,-78,104,-44,104,-24],'#5f6b47',3);
  ctx.fillStyle=c('#4a5537'); ctx.fillRect(-98,-34,198,10);
  hl(ctx,-88,-76,150,3);
  // えんとつ
  box(ctx,-86,-112,12,36,'#3c3a34',2); box(ctx,-68,-104,10,28,'#3c3a34',2);
  if(!FL){ for(var s=0;s<3;s++){ var ph=(t*0.6+s*20)%60; ctx.fillStyle='rgba(70,70,70,'+(0.5-ph/130)+')'; ctx.beginPath(); ctx.arc(-80-ph*0.3,-116-ph*0.9,5+ph*0.18,0,7); ctx.fill(); } }
  if(!ph2){ // そうこう
    for(var i=0;i<5;i++){ box(ctx,-80+i*34,-72,30,34,i%2?'#6f7b52':'#76835a',2); for(var r2=0;r2<4;r2++) circ(ctx,-76+i*34+(r2%2)*22,-68+Math.floor(r2/2)*26,1.4,'#4a5537',0); }
  } else { // コア
    box(ctx,-80,-72,160,38,'#3b3f3a',2);
    for(var p2=0;p2<6;p2++){ box(ctx,-74+p2*25,-66,6,26,'#6a6f66',1); }
    var pul=0.6+0.4*Math.sin(t*(rage?0.5:0.2));
    circ(ctx,6,-53,13,'#7a1111',2.4);
    if(!FL){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,60,40,'+(0.55*pul)+')'; ctx.beginPath(); ctx.arc(6,-53,11+pul*6,0,7); ctx.fill(); ctx.restore(); }
    circ(ctx,6,-53,6,'#ff6a4a',1.4);
  }
  // ほうだい（アークカノン）
  var ang=-0.5; ctx.save(); ctx.translate(70,-92); ctx.rotate(ang);
  box(ctx,-4,-7,46,14,'#4f5a3c',2.4); box(ctx,40,-9,10,18,'#3f482f',2); ctx.restore();
  rr(ctx,48,-106,48,30,10); fill(ctx,'#66714b',2.6);
  // きかんじゅう
  box(ctx,96,-72,18,8,'#2e2e32',1.6); box(ctx,112,-70,14,4,'#232326',1);
  if(b.mgBurst>0&&b.mgShotT>2) muzzleStar(ctx,128,-68,9);
  // しょうぐん（ハッチから）
  ctx.save(); ctx.translate(-20,-78); A._gen(ctx,t); ctx.restore();
  // けいこうとう
  if(rage&&!FL&&Math.floor(t/6)%2===0){ circ(ctx,-60,-82,5,'#ff3b3b',1.4); circ(ctx,40,-82,5,'#ff3b3b',1.4); }
  ctx.restore(); FL=false;
  // HP
  var hw=110, rr3=Math.max(0,b.hp/b.maxhp);
  ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(b.x-hw/2-1,b.y-S*140-1,hw+2,5);
  ctx.fillStyle=rr3>0.6?'#5cde94':(rr3>0.35?'#ffb020':'#ff5c5c'); ctx.fillRect(b.x-hw/2,b.y-S*140,hw*rr3,3); };
A._gen=function(ctx,t){ // ようさいの ハッチから 上半身を だす しょうぐん（プレイヤーの ほうを むいて サーベル）
  ctx.save(); ctx.beginPath(); ctx.rect(-60,-120,120,118); ctx.clip();
  ctx.translate(0,30+Math.sin(t*0.08)*1.5); human(ctx,0,0,1,'general',{t:t,pose:'stand',air:true,sc:1.5}); ctx.restore();
  box(ctx,-20,-4,40,10,'#3c3a34',1.8); if(!FL){ ctx.fillStyle='#5a574e'; ctx.fillRect(-18,-3,36,2.4); } };

/* SLUG（のれる せんしゃ） */
A.slug=function(ctx,s,t,occ,aimUp,flash){ FL=!!flash; local(ctx,s.x,s.y,s.face);
  if(!FL){ ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0,1,46,3.6,0,0,7); ctx.fill(); }
  treads(ctx,-44,88,-15,15,s.x/S*0.12,'#6a7358');
  rr(ctx,-42,-40,84,26,9); fill(ctx,'#8a9b5c',2.6); ctx.fillStyle=c('#6f7f45'); ctx.fillRect(-40,-22,80,7); hl(ctx,-32,-38,60,2.4);
  ctx.fillStyle=c('#f2c230'); for(var i=0;i<4;i++) ctx.fillRect(-36+i*8,-19,4,3);
  // ほうしん
  if(occ&&aimUp){ box(ctx,-4,-84,10,44,'#5d6b3a',2); } else { box(ctx,20,-36,34,9,'#5d6b3a',2); box(ctx,50,-37.5,8,12,'#46522a',1.6); }
  // キャノピー
  ctx.beginPath(); ctx.arc(-6,-40,17,Math.PI,0); ctx.closePath(); fill(ctx,occ?'rgba(143,211,240,.45)':'#8fd3f0',2.2);
  ctx.restore(); FL=false;
  if(!occ){ var by=s.y-S*108+Math.sin(t*0.15)*1.6;                                   // のれる しるし
    ctx.fillStyle='#ffe38a'; ctx.strokeStyle=OL; ctx.lineWidth=0.7;
    ctx.beginPath(); ctx.moveTo(s.x-3,by+4); ctx.lineTo(s.x+3,by+4); ctx.lineTo(s.x,by+8); ctx.closePath(); ctx.fill(); ctx.stroke();
    otext(ctx,'のれる！',s.x,by+1,'#ffe38a',5,'center',1.6); }
  for(var a=0;a<s.maxhp;a++){ ctx.fillStyle=a<s.hp?'#5cde94':'rgba(0,0,0,.35)'; ctx.fillRect(s.x-12+a*8,s.y-S*98,6,2); } };

/* ================= こもの ================= */
A.crate=function(ctx,x,y){ local(ctx,x,y,1);
  box(ctx,-14,-28,28,28,'#a8793f',2.4); ctx.fillStyle='#8a5f2c'; ctx.fillRect(-12,-20,24,3); ctx.fillRect(-12,-10,24,3);
  ctx.strokeStyle='#6b4a22'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-12,-26); ctx.lineTo(12,-2); ctx.moveTo(12,-26); ctx.lineTo(-12,-2); ctx.stroke();
  hl(ctx,-12,-27,24,2); ctx.restore(); };
A.barrel=function(ctx,x,y,t){ local(ctx,x,y,1);
  box(ctx,-11,-32,22,32,'#c8412f',5,2.4); ctx.fillStyle='#8f2a1f'; ctx.fillRect(-11,-24,22,3); ctx.fillRect(-11,-10,22,3);
  hl(ctx,-8,-30,4,26,'rgba(255,255,255,.25)');
  poly(ctx,[0,-21,5,-13,-5,-13],'#f2c230',1.2); ctx.fillStyle=OL; ctx.fillRect(-0.7,-19,1.4,3.4);
  ctx.restore(); };
A.pow=function(ctx,po,t){ var st={t:t,pose:po.free?'stand':'kneel',free:po.free,air:po.free&&po.t%20<10&&po.t>10};
  var yy=po.y-(po.free&&po.t>10?Math.abs(Math.sin(po.t*0.3))*6:0);
  human(ctx,po.x+(po.free?po.t*0.35:0),yy,1,'pow',st);
  if(!po.free){ ctx.fillStyle='rgba(0,0,0,.6)'; ctx.font='bold 5px sans-serif'; ctx.textAlign='center'; ctx.fillText('HELP!',po.x,po.y-S*62+Math.sin(t*0.15)); ctx.textAlign='left'; }
};
var WCOL={mg:'#f6c445',spread:'#ff7ab6',rocket:'#ff6b4a',flame:'#ff9a2e',laser:'#5ee0ff',homing:'#b388ff',grenades:'#cbd5e1'};
var WKEY={mg:'H',spread:'S',rocket:'R',flame:'F',laser:'L',homing:'M',grenades:'G'};
A.WCOL=WCOL;
A.pick=function(ctx,it,t){ var x=it.x, y=it.y+Math.sin(t*0.12)*1.2;
  ctx.save(); ctx.globalAlpha=0.35+0.25*Math.sin(t*0.2); ctx.fillStyle=WCOL[it.t]||'#fff'; ctx.beginPath(); ctx.arc(x,y+4,9,0,7); ctx.fill(); ctx.restore();
  local(ctx,x,y+4,1,S*1.1); box(ctx,-16,-13,32,26,'#2a2f38',4,2.4); box(ctx,-13,-10,26,20,WCOL[it.t]||'#fff',3,1.6);
  ctx.fillStyle=OL; ctx.font='bold 18px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(WKEY[it.t]||'?',0,1); ctx.restore(); };

/* ================= プレイヤーの ぶき ================= */
A.playerGun=function(ctx,x,y,face,weapon,up,recoil,muzz,t){ local(ctx,x,y,face);
  if(up) ctx.rotate(-Math.PI/2);
  ctx.translate(-recoil*2,0);
  var mx=24;
  if(weapon==='pistol'){ box(ctx,0,-3,14,5,'#3a3a40',1.4); box(ctx,1,0,4,6,'#2a2a2e',1); mx=16; }
  else if(weapon==='mg'){ box(ctx,-6,-4,30,8,'#3f4046',2); box(ctx,22,-2.6,12,3.6,'#2a2a2e',1); box(ctx,4,3,7,7,'#6b5a2b',1.4);
    if(!FL){ ctx.fillStyle='#d9b64a'; for(var b=0;b<4;b++) ctx.fillRect(5+b*1.6,10,1.2,3); } hl(ctx,-4,-3,24,1.4); mx=36; }
  else if(weapon==='spread'){ box(ctx,-6,-4,32,7,'#4a3a2c',2); box(ctx,8,2,12,4,'#8a5a2b',1.4); box(ctx,24,-4.5,6,8,'#2a2a2e',1.2); mx=32; }
  else if(weapon==='rocket'){ box(ctx,-14,-6.5,44,11,'#5d6b3a',3); box(ctx,28,-7.5,7,13,'#3f4a26',1.6); box(ctx,-18,-7,5,12,'#3f4a26',1.4); box(ctx,4,-12,6,6,'#2a2a2e',1); mx=38; }
  else if(weapon==='flame'){ box(ctx,-16,-9,10,16,'#c8412f',4,1.8); box(ctx,-6,-3,28,6,'#5a5a60',1.6); box(ctx,20,-4.5,6,9,'#3a3a3e',1.4);
    if(!FL){ ctx.fillStyle='rgba(120,190,255,.9)'; ctx.beginPath(); ctx.arc(27,0,1.8+Math.sin(t*0.8)*0.5,0,7); ctx.fill(); } mx=30; }
  else if(weapon==='laser'){ box(ctx,-6,-5,30,10,'#e8eef4',3,2); box(ctx,20,-3,10,6,'#9aa7b8',1.4);
    if(!FL){ ctx.fillStyle='rgba(94,224,255,'+(0.6+0.4*Math.sin(t*0.4))+')'; ctx.fillRect(-2,-2,20,2.4); } mx=32; }
  else if(weapon==='homing'){ box(ctx,-8,-8,28,15,'#5a4a7a',3,2);
    for(var h=0;h<4;h++) circ(ctx,16,-4+h*0+(h%2)*6,2.2,'#2a2238',1); box(ctx,-12,-4,6,8,'#3f3456',1.2); mx=24; }
  if(muzz>0){ var col=weapon==='laser'?'rgba(94,224,255,.95)':(weapon==='homing'?'rgba(190,150,255,.9)':null);
    if(col&&!FL){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle=col; ctx.beginPath(); ctx.arc(mx,0,6+muzz,0,7); ctx.fill(); ctx.restore(); }
    else if(weapon!=='flame') muzzleStar(ctx,mx+2,0,6+muzz*1.4); }
  ctx.restore(); };

/* ================= たま・エフェクト ================= */
A.pbullet=function(ctx,b,t){
  ctx.save(); ctx.globalCompositeOperation='lighter';
  var sp=Math.hypot(b.vx,b.vy)||1, ux=b.vx/sp, uy=b.vy/sp;
  if(b.t==='flame'){ var k=b.t2||0, life=Math.min(1,k/24), r=2+k*0.14;
    var cc=life<0.25?'255,250,220':(life<0.5?'255,200,80':(life<0.8?'255,110,40':'140,60,30'));
    ctx.fillStyle='rgba('+cc+','+(0.9-life*0.6)+')'; ctx.beginPath(); ctx.arc(b.x,b.y-k*0.05,r,0,7); ctx.fill(); }
  else if(b.t==='rocket'||b.t==='homing'){ ctx.globalCompositeOperation='source-over';
    var ang=Math.atan2(b.vy,b.vx); ctx.translate(b.x,b.y); ctx.rotate(ang); ctx.scale(S,S);
    box(ctx,-10,-3,16,6,b.t==='homing'?'#cdb8ff':'#e0e3e6',2,1.4); poly(ctx,[6,-3,11,0,6,3],'#d8392b',1);
    poly(ctx,[-10,-3,-14,-6,-12,0,-14,6,-10,3],'#5a5a60',1);
    ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,180,60,.9)'; ctx.beginPath(); ctx.arc(-15,0,3+Math.random()*2,0,7); ctx.fill(); }
  else if(b.t==='spread'){ ctx.fillStyle='rgba(255,120,190,.35)'; ctx.beginPath(); ctx.arc(b.x,b.y,3,0,7); ctx.fill();
    ctx.fillStyle='#ffd6ec'; ctx.beginPath(); ctx.arc(b.x,b.y,1.4,0,7); ctx.fill(); }
  else { var L=b.t==='mg'?9:6, wdt=b.t==='mg'?1.9:1.4;
    ctx.strokeStyle='rgba(255,200,60,.55)'; ctx.lineWidth=wdt*2; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(b.x-ux*L,b.y-uy*L); ctx.lineTo(b.x,b.y); ctx.stroke();
    ctx.strokeStyle='#fff6cc'; ctx.lineWidth=wdt; ctx.beginPath(); ctx.moveTo(b.x-ux*L*0.6,b.y-uy*L*0.6); ctx.lineTo(b.x,b.y); ctx.stroke(); }
  ctx.restore(); };
A.ebullet=function(ctx,eb,t){ ctx.save();
  if(eb.boom){ var ang=Math.atan2(eb.vy,eb.vx); ctx.translate(eb.x,eb.y); ctx.rotate(ang); ctx.scale(S,S);
    box(ctx,-8,-3.4,14,6.8,'#6b6a4a',3,1.4); poly(ctx,[6,-3.4,11,0,6,3.4],'#c8412f',1);
    ctx.globalCompositeOperation='lighter'; ctx.fillStyle='rgba(255,160,60,.8)'; ctx.beginPath(); ctx.arc(-11,0,3.5,0,7); ctx.fill(); }
  else { ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=eb.snipe?'rgba(255,80,80,.5)':'rgba(255,90,70,.4)'; ctx.beginPath(); ctx.arc(eb.x,eb.y,eb.snipe?3:2.6,0,7); ctx.fill();
    ctx.fillStyle='#ffe0d0'; ctx.beginPath(); ctx.arc(eb.x,eb.y,1.1,0,7); ctx.fill(); }
  ctx.restore(); };
A.nade=function(ctx,gr,t,enemy){ local(ctx,gr.x,gr.y-S*4,1); ctx.rotate(t*0.3);
  ell(ctx,0,0,4.6,5.4,enemy?'#6b5a3a':'#5d7a3a',1.6); box(ctx,-2,-8,4,3,'#3a3a3e',0.8);
  if(Math.floor(t/5)%2===0&&!FL){ ctx.fillStyle='#ff5c5c'; ctx.fillRect(-1,-1,2,2); }
  ctx.restore(); };
A.beam=function(ctx,bm){ var a=Math.max(0,1-bm.t/7);
  ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineCap='round';
  ctx.strokeStyle='rgba(60,200,255,'+(0.35*a)+')'; ctx.lineWidth=6*a+1; ctx.beginPath(); ctx.moveTo(bm.x1,bm.y1); ctx.lineTo(bm.x2,bm.y2); ctx.stroke();
  ctx.strokeStyle='rgba(150,240,255,'+(0.8*a)+')'; ctx.lineWidth=2.4*a+0.5; ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,'+a+')'; ctx.lineWidth=0.9; ctx.stroke(); ctx.restore(); };
A.snipeLine=function(ctx,x1,y1,x2,y2,k,lock){ ctx.save();
  ctx.strokeStyle=lock?(Math.floor(k*30)%2?'rgba(255,40,40,.95)':'rgba(255,255,255,.9)'):'rgba(255,40,40,'+(0.25+0.45*k)+')';
  ctx.lineWidth=lock?0.9:0.6; ctx.setLineDash(lock?[]:[2,1.5]); ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,40,40,.9)'; ctx.beginPath(); ctx.arc(x2,y2,1.3,0,7); ctx.fill(); ctx.restore(); };
A.boom=function(ctx,bo){ var k=bo.t/14, r=bo.r;
  ctx.save();
  if(bo.t<3){ ctx.fillStyle='rgba(255,255,235,'+(1-bo.t/3)+')'; ctx.beginPath(); ctx.arc(bo.x,bo.y,r*0.9,0,7); ctx.fill(); }
  ctx.globalCompositeOperation='lighter';
  var n=6; for(var i=0;i<n;i++){ var a=i/n*Math.PI*2+(bo.seed||0), d=r*0.35*(0.4+k), rr2=r*(0.42-k*0.2)*(0.7+hash(i+(bo.seed||0)*9)*0.6);
    var col=k<0.3?'255,230,140':(k<0.6?'255,140,50':'200,70,30');
    ctx.fillStyle='rgba('+col+','+(0.8-k*0.7)+')'; ctx.beginPath(); ctx.arc(bo.x+Math.cos(a)*d,bo.y+Math.sin(a)*d*0.8-k*r*0.3,Math.max(0.5,rr2),0,7); ctx.fill(); }
  ctx.globalCompositeOperation='source-over';
  ctx.strokeStyle='rgba(255,240,200,'+(0.6-k*0.6)+')'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(bo.x,bo.y,r*(0.5+k*0.9),0,7); ctx.stroke();
  ctx.restore(); };
A.part=function(ctx,pa){ var a=Math.max(0,1-pa.t/pa.life);
  if(pa.smoke){ ctx.fillStyle='rgba(90,90,90,'+(0.45*a)+')'; ctx.beginPath(); ctx.arc(pa.x,pa.y,pa.size*(1+pa.t/pa.life*1.6),0,7); ctx.fill(); return; }
  if(pa.hat){ local(ctx,pa.x,pa.y,1); ctx.rotate(pa.t*0.3); ctx.globalAlpha=a;
    ctx.beginPath(); ctx.arc(0,0,8.6,Math.PI,0); ctx.closePath(); ctx.fillStyle=pa.col; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle=OL; ctx.stroke(); ctx.restore(); return; }
  ctx.globalAlpha=a; ctx.fillStyle=pa.col;
  if(pa.size>1.6){ ctx.beginPath(); ctx.arc(pa.x,pa.y,pa.size*0.6,0,7); ctx.fill(); } else ctx.fillRect(pa.x,pa.y,pa.size,pa.size);
  ctx.globalAlpha=1; };

/* ================= はいけい ================= */
var ZONES=[ // 原作単位の x で 砂ばく → まち → きち
  {x:0,    sky0:'#5aa6d6',sky1:'#f6dca8',far:'#c98a58',farD:'#a86d40',mid:'#e0b06c',gnd:'#d7a864',gndT:'#b98a47',gndD:'#c4924f'},
  {x:2600, sky0:'#44639a',sky1:'#f2ae72',far:'#5a5f7e',farD:'#474b66',mid:'#9a7a62',gnd:'#9c8c74',gndT:'#7e705c',gndD:'#8a7a63'},
  {x:5000, sky0:'#2c3353',sky1:'#dc7a5c',far:'#3e3a57',farD:'#2f2c44',mid:'#5f6470',gnd:'#8b877b',gndT:'#6c695e',gndD:'#7a766a'}
];
function zoneAt(ux){ for(var i=ZONES.length-1;i>=0;i--) if(ux>=ZONES[i].x) return i; return 0; }
function zoneMix(ux,key){ var i=zoneAt(ux), z=ZONES[i], n=ZONES[i+1];
  if(!n) return z[key]; var k=Math.max(0,Math.min(1,(ux-(n.x-500))/500)); return k>0?lerpC(z[key],n[key],k):z[key]; }
A.sky=function(ctx,g,W,H){ // スクリーン座標
  var ux=g.cam/S+300;
  var gr=ctx.createLinearGradient(0,0,0,H); gr.addColorStop(0,zoneMix(ux,'sky0')); gr.addColorStop(0.85,zoneMix(ux,'sky1')); gr.addColorStop(1,zoneMix(ux,'sky1'));
  ctx.fillStyle=gr; ctx.fillRect(0,0,W,H);
  // たいよう
  var sy=38+Math.min(40,ux/200);
  ctx.save(); ctx.globalAlpha=0.9; ctx.fillStyle='rgba(255,236,170,.35)'; ctx.beginPath(); ctx.arc(W*0.74,sy,22,0,7); ctx.fill();
  ctx.fillStyle='#fff3c4'; ctx.beginPath(); ctx.arc(W*0.74,sy,11,0,7); ctx.fill(); ctx.restore();
  // くも
  ctx.fillStyle='rgba(255,255,255,.55)';
  for(var i=0;i<5;i++){ var cx=((i*97-g.cam*0.05-g.t*0.03)%(W+120)+(W+120))%(W+120)-60, cy=18+hash(i)*40;
    ctx.beginPath(); ctx.arc(cx,cy,8,0,7); ctx.arc(cx+9,cy-3,10,0,7); ctx.arc(cx+20,cy,7,0,7); ctx.fill(); }
};
A.parallax=function(ctx,g,gy,W){ // ワールド座標（ズーム済み）で。cam からの ずれで 奥行き
  var cam=g.cam;
  // とおくの 山・ビル（0.25）
  for(var i=-1;i<10;i++){ var base=Math.floor(cam*0.25/60)+i, lx=base*60, sx=lx-cam*0.25+cam, ux=(cam+(sx-cam))/S, z=zoneAt(ux);
    var h=26+hash(base)*30;
    ctx.fillStyle=zoneMix(ux,'far');
    if(z===0){ ctx.beginPath(); ctx.moveTo(sx-10,gy); ctx.lineTo(sx+8,gy-h); ctx.lineTo(sx+44,gy-h+3); ctx.lineTo(sx+64,gy); ctx.fill();
      ctx.fillStyle=zoneMix(ux,'farD'); ctx.fillRect(sx+10,gy-h+6,32,3); }
    else if(z===1){ ctx.fillRect(sx,gy-h,24,h); ctx.fillRect(sx+28,gy-h*0.7,18,h*0.7); ctx.fillRect(sx+6,gy-h-6,3,6);
      ctx.fillStyle='rgba(255,220,140,.35)'; for(var wy=0;wy<4;wy++) for(var wx=0;wx<3;wx++) if(hash(base*7+wy*3+wx)>0.5) ctx.fillRect(sx+3+wx*7,gy-h+4+wy*7,3,3); }
    else { ctx.beginPath(); ctx.moveTo(sx-20,gy); ctx.lineTo(sx+20,gy-h*1.2); ctx.lineTo(sx+60,gy); ctx.fill(); }
  }
  // なかの そう（0.55）
  for(var j=-1;j<8;j++){ var b2=Math.floor(cam*0.55/48)+j, lx2=b2*48, sx2=lx2-cam*0.55+cam, ux2=sx2/S, z2=zoneAt(ux2), r=hash(b2*3.1);
    if(z2===0){ if(r<0.55){ // やしのき
        var tx=sx2+10, th=16+r*14; ctx.strokeStyle='#8a6a3c'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(tx,gy); ctx.quadraticCurveTo(tx+3,gy-th/2,tx+1,gy-th); ctx.stroke();
        ctx.fillStyle='#4f8a3c'; for(var l=0;l<5;l++){ var a=-Math.PI*0.95+l*Math.PI*0.23; ctx.beginPath(); ctx.ellipse(tx+1+Math.cos(a)*6,gy-th+Math.sin(a)*3+2,7,2,a,0,7); ctx.fill(); } }
      else { ctx.fillStyle=zoneMix(ux2,'mid'); ctx.beginPath(); ctx.ellipse(sx2+20,gy,26,8+r*6,0,Math.PI,0); ctx.fill(); } }
    else if(z2===1){ var bh=18+r*20; ctx.fillStyle=zoneMix(ux2,'mid'); ctx.fillRect(sx2,gy-bh,30,bh);
      ctx.fillStyle='rgba(40,30,30,.55)'; for(var y2=0;y2<3;y2++) for(var x2=0;x2<3;x2++) ctx.fillRect(sx2+4+x2*9,gy-bh+4+y2*7,5,4);
      ctx.fillStyle=zoneMix(ux2,'sky1'); ctx.beginPath(); ctx.moveTo(sx2+18,gy-bh-1); ctx.lineTo(sx2+31,gy-bh-1); ctx.lineTo(sx2+31,gy-bh+8); ctx.fill(); }   // こわれた かど
    else { if(r<0.4){ ctx.fillStyle='#4a4f5c'; ctx.fillRect(sx2+8,gy-34,4,34); ctx.fillRect(sx2+2,gy-40,16,7); ctx.fillStyle='rgba(255,240,180,.25)'; ctx.beginPath(); ctx.moveTo(sx2+10,gy-37); ctx.lineTo(sx2+40,gy-90); ctx.lineTo(sx2+55,gy-80); ctx.fill(); }  // みはりだい＋サーチライト
      else { ctx.fillStyle=zoneMix(ux2,'mid'); ctx.beginPath(); ctx.moveTo(sx2,gy); ctx.lineTo(sx2,gy-16); ctx.quadraticCurveTo(sx2+22,gy-32,sx2+44,gy-16); ctx.lineTo(sx2+44,gy); ctx.fill(); } }   // かくのうこ
  }
  // フェンス（きち）
};
A.ground=function(ctx,g,gy,bottom){
  var cam=g.cam, W=g.W, ux=(cam+W/2)/S;
  ctx.fillStyle=zoneMix(ux,'gnd'); ctx.fillRect(cam-10,gy,W+20,bottom-gy+10);
  ctx.fillStyle=zoneMix(ux,'gndT'); ctx.fillRect(cam-10,gy,W+20,1.6);
  ctx.fillStyle=zoneMix(ux,'gndD');
  var s0=Math.floor(cam/14);
  for(var i=s0-1;i<s0+W/14+2;i++){ var r=hash(i), x=i*14;
    ctx.fillRect(x+r*8,gy+3+r*6,3+r*4,1.1);
    if(r>0.8){ ctx.fillStyle='#8f8a80'; ctx.beginPath(); ctx.ellipse(x+5,gy+1,2.2,1.3,0,Math.PI,0); ctx.fill(); ctx.fillStyle=zoneMix(ux,'gndD'); } }
};
A.plat=function(ctx,pl,gy){
  var x=pl.x, y=pl.y, w=pl.w;
  ctx.strokeStyle='#4a4a50'; ctx.lineWidth=0.9;
  for(var k=x+2;k<x+w-4;k+=10){ ctx.beginPath(); ctx.moveTo(k,y+3); ctx.lineTo(k+10,gy); ctx.moveTo(k+10,y+3); ctx.lineTo(k,gy); ctx.stroke(); }
  ctx.fillStyle='#5a5a62'; ctx.fillRect(x+1,y+2,2.4,gy-y); ctx.fillRect(x+w-3.4,y+2,2.4,gy-y);
  ctx.fillStyle='#6a6a72'; ctx.fillRect(x,y,w,3.4); ctx.strokeStyle=OL; ctx.lineWidth=0.6; ctx.strokeRect(x,y,w,3.4);
  ctx.fillStyle='#f2c230'; for(var s=x;s<x+w-2;s+=5){ ctx.fillRect(s,y+0.6,2.5,1); }
};
A.mark=function(ctx,M,gy){ var bl=Math.floor(M.t/5)%2===0, r=6+Math.sin(M.t*0.25)*1.5;
  ctx.save(); ctx.strokeStyle=bl?'#ff4040':'#ffb020'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.ellipse(M.x,gy-1,r,r*0.4,0,0,7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(M.x-r,gy-1); ctx.lineTo(M.x+r,gy-1); ctx.moveTo(M.x,gy-1-r*0.4); ctx.lineTo(M.x,gy-1+r*0.4); ctx.stroke();
  ctx.fillStyle='#ff4040'; ctx.font='bold 7px sans-serif'; ctx.textAlign='center'; ctx.fillText('!',M.x,gy-10-Math.abs(Math.sin(M.t*0.2))*3); ctx.textAlign='left'; ctx.restore(); };

/* ================= HUD（スクリーン座標 よこ SW × たて 200） ================= */
function otext(ctx,s,x,y,fill,size,align,ow){ ctx.font='900 '+size+'px "M PLUS Rounded 1c","Hiragino Maru Gothic ProN",sans-serif'; ctx.textAlign=align||'left';
  ctx.lineWidth=ow||2.6; ctx.strokeStyle='rgba(20,16,12,.9)'; ctx.lineJoin='round'; ctx.strokeText(s,x,y); ctx.fillStyle=fill; ctx.fillText(s,x,y); ctx.textAlign='left'; }
A.otext=otext;
A.hud=function(ctx,g,WPN){
  var p=g.p, R=(g.SW||340)-10, SW=g.SW||340;
  // のこり
  for(var i=0;i<3;i++){ var on=i<Math.max(0,g.lives); ctx.save(); ctx.translate(10+i*12,9);
    ctx.fillStyle=on?'#ff4d5e':'rgba(0,0,0,.3)'; ctx.strokeStyle='#1d1712'; ctx.lineWidth=1.1;
    ctx.beginPath(); ctx.moveTo(4,7); ctx.bezierCurveTo(-2,2,0,-2,4,1); ctx.bezierCurveTo(8,-2,10,2,4,7); ctx.fill(); ctx.stroke();
    if(on){ ctx.fillStyle='rgba(255,255,255,.6)'; ctx.fillRect(1.5,1,1.5,1.5); } ctx.restore(); }
  // ぶき パネル
  var wk=p.inSlug?'slug':p.weapon, col=p.inSlug?'#9ee7ff':(WCOL[p.weapon]||'#e9eef4');
  ctx.fillStyle='rgba(15,18,24,.62)'; rr(ctx,8,19,96,23,4); ctx.fill();
  ctx.fillStyle=col; rr(ctx,10,21,19,19,3); ctx.fill();
  otext(ctx,p.inSlug?'SL':(WKEY[p.weapon]||'P'),19.5,34.5,'#1d1712',11,'center',0.1);
  otext(ctx,p.inSlug?'SLUG':WPN[p.weapon].n,33,29.5,'#fff',7.5);
  if(!p.inSlug){ if(p.ammo===Infinity) otext(ctx,'∞',33,39.5,'#ffe38a',8);
    else { var mx=WPN[p.weapon].ammo, r=Math.max(0,Math.min(1,p.ammo/mx)); ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(33,34.5,52,4); ctx.fillStyle=col; ctx.fillRect(33,34.5,52*r,4);
      otext(ctx,String(p.ammo),88,39.5,'#fff',6.5); } }
  // ばくだん
  ctx.fillStyle='rgba(15,18,24,.62)'; rr(ctx,8,44,40,12,3); ctx.fill();
  ctx.fillStyle='#5d7a3a'; ctx.beginPath(); ctx.arc(15,50,3.4,0,7); ctx.fill(); ctx.strokeStyle='#1d1712'; ctx.lineWidth=0.8; ctx.stroke();
  otext(ctx,'×'+p.grenades,21,53.5,'#fff',7.5);
  // スコア
  otext(ctx,String(g.score),R,17,'#ffe38a',13,'right',3);
  otext(ctx,'SCORE',R,26,'#fff',6,'right',2);
  // すすみぐあい
  if(g.sub!=='surv'){ var pr=Math.max(0,Math.min(1,p.x/g.levelW)); ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(R-80,31,80,3.4);
    ctx.fillStyle='#9ee7ff'; ctx.fillRect(R-80,31,80*pr,3.4); ctx.fillStyle='#ff5c5c'; ctx.fillRect(R-3,29.5,3,6.4); }
  else otext(ctx,'WAVE '+g.wave,R,38,'#9ee7ff',8,'right');
  if(g.combo.n>=2){ var sc=1+Math.max(0,(g.combo.t-mT2(1.9))/mT2(0.3))*0.4;
    ctx.save(); ctx.translate(R,50); ctx.scale(sc,sc);
    otext(ctx,'CHAIN ×'+g.combo.n,0,0,'#7fe3ff',10,'right',3); ctx.restore(); }
  if(g.banner>0){ var a=Math.min(1,g.banner/10);
    ctx.save(); ctx.globalAlpha=a; ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(0,86,SW,28);
    ctx.fillStyle='#f2c230'; for(var s=0;s<SW;s+=14){ ctx.fillRect(s,86,7,2); ctx.fillRect(s+7,112,7,2); }
    otext(ctx,g.bannerTxt,SW/2,105,'#ffe38a',13,'center',3.4); ctx.restore(); }
};
function mT2(s){ return s*60; }

window.MA_ART=A;
})();
