/* えいごタワー：タワー・ゆうしゃ・てきの かたち（みため だけ）
   ミニチュア フィギュアの ような すがた：おおきな あたま・まるい からだ・すくない いろ */
(function(){
'use strict';
var PI=Math.PI, TM={};
var Cy=THREE.CylinderGeometry,Bx=THREE.BoxGeometry,Sp=THREE.SphereGeometry,Co=THREE.ConeGeometry,To=THREE.TorusGeometry,Ca=THREE.CapsuleGeometry,Oc=THREE.OctahedronGeometry,Ic=THREE.IcosahedronGeometry,Do=THREE.DodecahedronGeometry;
var MAT={};
function mat(c,m,r){ MAT[c]=[m,r]; return c; }
function P(g,c,x,y,z,sx,sy,sz,rx,ry,rz){ g=window.WAR_GFX.part(g,c,x||0,y||0,z||0,sx,sy,sz,rx,ry,rz); var mr=MAT[c]; if(mr&&g.attributes.pbr){ var a=g.attributes.pbr.array; for(var i=0;i<a.length;i+=2){ a[i]=mr[0]; a[i+1]=mr[1]; } } return g; }
function M(L){ return window.WAR_GFX.merge(L); }
var K={stone:'#e4dac8',stone2:'#c8baa2',stoneD:'#9a8c7a',wood:'#8b5a36',woodD:'#5a3a24',ink:'#2a2420',cream:'#f2ebdf',
  steel:mat('#bfc7d0',0.85,0.3),steelD:mat('#8d97a3',0.85,0.38),iron:mat('#4f545d',0.7,0.45),gold:mat('#d9a645',0.95,0.26),brass:mat('#c48d40',0.9,0.34),
  ice:mat('#c4e9f7',0.05,0.08),iceD:mat('#8ccbe6',0.05,0.1),glass:mat('#93cfe8',0.1,0.06),orb:mat('#8fe6ff',0,0.1),
  blue:'#3e6a93',red:'#a83a30',indigo:'#4b3e8c',teal:'#4c7f86',slate:'#4a5562'};
var INK=K.ink, SK='#f1c6a2', HY=0.27, HX=0.08;
function shade(h,k){ var c=new THREE.Color(h); c.multiplyScalar(k); return '#'+c.getHexString(); }
function lathe(pts,seg){ return new THREE.LatheGeometry(pts.map(function(p){ return new THREE.Vector2(p[0],p[1]); }),seg||14); }
function prism(w,h,len,alongX){ var g=new Cy(1,1,1,3); g.rotateX(-PI/2); g.scale(w/1.732,h/1.5,len); g.translate(0,h/3,0); if(alongX) g.rotateY(PI/2); return g; }
function seg(a,b,r0,r1,c,n){ var d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), l=d.length(), g=new Cy(r1,r0,l,n||6); g.translate(0,l/2,0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize())); g.translate(a[0],a[1],a[2]); return P(g,c); }

/* ---------- キャラクターの きほん ---------- */
function leg(c,fc,r){ r=r||0.058; return M([P(new Ca(r,0.1,3,8),c,0,-0.11,0),P(new Sp(r+0.012,10,6),fc||'#3a2a20',0,-0.22,-0.025,1,0.72,1.35)]); }
function noLeg(){ return M([P(new Bx(0.01,0.01,0.01),'#000',0,0.05,0)]); }
function fig(o){ var w=o.w||1, sk=o.skin||SK, c1=o.c1, hy=o.hy||0.84, hr=o.hr||0.22, hz=o.hz||0, L=[], ax=0.2*w+0.03;
  if(o.robe) L.push(P(lathe([[0,0.02],[0.25*w,0.02],[0.27*w,0.07],[0.22*w,0.3],[0.18*w,0.48],[0.12*w,0.61],[0,0.64]]),c1));
  else { L.push(P(lathe([[0,0.21],[0.165*w,0.21],[0.2*w,0.29],[0.2*w,0.42],[0.17*w,0.54],[0.1*w,0.62],[0,0.64]]),c1)); L.push(P(new Cy(0.207*w,0.207*w,0.05,14),o.belt||'#4a3426',0,0.3,0)); }
  [-1,1].forEach(function(s){ if(s>0&&o.noR) return; L.push(P(new Ca(0.05,0.13,3,8),o.sleeve||c1,s*ax,0.45,0,1,1,1,0,0,s*0.12),P(new Sp(0.052,8,6),o.hand||sk,s*(ax+0.015),0.33,0)); });
  L.push(P(new Sp(hr,16,12),sk,0,hy,hz));
  if(o.eyes!==false){ var ey=hy+(o.ey||0); [-1,1].forEach(function(s){ var ex=s*hr*0.34, ez=hz-Math.sqrt(Math.max(0,hr*hr-ex*ex-(ey-hy)*(ey-hy)))+0.004; L.push(P(new Sp(0.028,8,6),o.eyeC||INK,ex,ey,ez,1,1.45,0.6)); if(!o.eyeC) L.push(P(new Sp(0.009,5,4),'#ffffff',ex+s*0.01,ey+0.016,ez-0.014)); }); }
  return L.concat(o.x||[]); }
function RX(w){ return 0.2*(w||1)+0.045; }
function helm(c,hy,hr,cut,hz){ return P(new Sp(hr*1.08,16,8,0,2*PI,0,PI*(cut||0.5)),c,0,hy,hz||0); }
function brim(c,hy,hr,k,hz){ return P(new Cy(hr*(k||1.18),hr*(k||1.18),0.025,18),c,0,hy,hz||0); }
function hair(c,hy,hr,hz){ return P(new Sp(hr*1.05,14,10,0,2*PI,0,PI*0.56),c,0,hy+0.01,(hz||0)+0.015,1,1,1,0.42,0,0); }
function hood(c,hy,hr,hz){ hz=hz||0; var r=hr*1.13; return [P(new Sp(r,14,6,0,2*PI,0,PI*0.36),c,0,hy,hz+0.01),P(new Sp(r,14,6,PI*1.5+0.85,2*PI-1.7,PI*0.36,PI*0.3),c,0,hy,hz+0.01),P(new Co(0.07,0.18,8),c,0,hy+0.08,hz+r+0.01,1,1,1,1.9,0,0)]; }

/* ---------- てき ---------- */
TM.enemies=function(){ var E={}, x=RX(1), hy=0.84;
  function add(k,o,lg,hip){ E[k]={hipY:hip?hip[0]:HY,hipX:hip?hip[1]:HX,leg:lg||leg('#3c2a24'),body:M(fig(o))}; }
  function raw(k,L,lg,hip){ E[k]={hipY:hip?hip[0]:0.05,hipX:hip?hip[1]:0.05,leg:lg||noLeg(),body:M(L)}; }
  add('n',{c1:'#b5473b',skin:'#e8b38d',ey:-0.01,x:[helm(K.iron,hy+0.045,0.22),brim(K.iron,hy+0.05,0.22,1.2),P(new Cy(0.016,0.016,1.22,6),K.wood,x,0.62,-0.03),P(new Co(0.04,0.16,6),K.steel,x,1.31,-0.03)]},leg('#4a2f2a','#2a211d'));
  var wf=0.85, xf=RX(wf), hf=0.8;
  add('f',{c1:'#7a5534',w:wf,hr:0.2,hy:hf,skin:'#87ad4e',belt:'#3a2a1e',eyeC:'#3b0d0d',x:[
    P(new Co(0.05,0.2,6),'#87ad4e',-0.21,hf+0.03,0.02,1,1,1,0,0,1.25),P(new Co(0.05,0.2,6),'#87ad4e',0.21,hf+0.03,0.02,1,1,1,0,0,-1.25),P(new Sp(0.04,8,6),'#7a9c45',0,hf-0.04,-0.2),
    P(new Sp(0.212,14,8,0,2*PI,0,PI*0.42),K.red,0,hf+0.02,0.01,1,1,1,0.3,0,0),
    P(new Bx(0.03,0.012,0.24),K.steel,xf,0.33,-0.16),P(new Bx(0.08,0.025,0.03),K.brass,xf,0.33,-0.04)]},leg('#5b4430','#2a211d',0.05),[HY,0.07]);
  var wb=1.35, xb=RX(wb), hb=0.8;
  add('b',{c1:'#6e4a32',w:wb,hr:0.21,hy:hb,skin:'#c8744a',sleeve:'#c8744a',belt:'#3a281c',x:[
    P(new Co(0.045,0.2,8),'#efe5d0',-0.12,hb+0.19,0,1,1,1,0,0,0.45),P(new Co(0.045,0.2,8),'#efe5d0',0.12,hb+0.19,0,1,1,1,0,0,-0.45),
    P(new Co(0.022,0.07,6),'#efe5d0',-0.06,hb-0.1,-0.19),P(new Co(0.022,0.07,6),'#efe5d0',0.06,hb-0.1,-0.19),P(new Sp(0.12,10,8),K.iron,-0.3,0.6,0,1,0.7,1),
    P(new Cy(0.11,0.05,0.72,8),K.wood,xb,0.65,-0.17,1,1,1,-0.5,0,0),P(new Cy(0.115,0.115,0.04,8),K.iron,xb,0.9,-0.3,1,1,1,-0.5,0,0)]},leg('#5a3a28','#2a1d16',0.07),[HY,0.11]);
  add('sh',{c1:K.steelD,sleeve:'#5d6773',belt:'#3a3f47',skin:'#e8b38d',eyes:false,x:[
    P(new Sp(0.235,16,12),K.steelD,0,hy+0.01,0),P(new Bx(0.22,0.035,0.04),INK,0,hy,-0.225),P(new Bx(0.035,0.12,0.04),INK,0,hy-0.06,-0.225),P(new Ca(0.03,0.2,3,6),K.red,0,hy+0.26,0.03,1,1,1,PI/2,0,0),
    P(new Bx(0.46,0.6,0.04),K.steel,-0.07,0.46,-0.3),P(new Bx(0.4,0.54,0.05),K.red,-0.07,0.46,-0.305),P(new Oc(0.09,0),K.gold,-0.07,0.48,-0.33,1,1.3,0.3),
    P(new Cy(0.016,0.016,1.2,6),K.wood,x,0.62,-0.03),P(new Co(0.04,0.16,6),K.steel,x,1.3,-0.03)]},leg('#5d6773','#3a3f47'));
  add('heal',{c1:'#6b4f9e',robe:true,skin:'#e3b08a',x:hood('#54397f',hy,0.22).concat([P(new Cy(0.262,0.272,0.04,14),K.gold,0,0.05,0),
    P(new Cy(0.018,0.02,1.25,6),K.wood,x,0.6,-0.03),P(new Sp(0.08,12,8),mat('#7fdc8f',0,0.1),x,1.3,-0.03),P(new To(0.085,0.014,6,16),K.gold,x,1.3,-0.03,1,1,1,PI/2,0,0)])},noLeg(),[0.05,0.05]);
  var wk=1.1, xk=RX(wk), crown=[P(new Cy(0.15,0.16,0.08,12),K.gold,0,hy+0.2,0),P(new Sp(0.025,6,5),'#c0303a',0,hy+0.2,-0.158)];
  for(var ci=0;ci<5;ci++){ var ca=ci/5*2*PI; crown.push(P(new Co(0.035,0.11,5),K.gold,Math.sin(ca)*0.135,hy+0.29,Math.cos(ca)*0.135)); }
  add('kn',{c1:K.gold,w:wk,sleeve:K.gold,belt:'#5a2a22',skin:'#e8b38d',x:[hair('#5a3a24',hy,0.22),P(new Bx(0.44,0.58,0.025),'#8f2a2a',0,0.36,0.245,1,1,1,0.12,0,0),
    P(new Bx(0.055,0.018,0.58),K.steel,xk,0.33,-0.36),P(new Bx(0.2,0.035,0.04),K.gold,xk,0.33,-0.06),P(new Cy(0.02,0.02,0.1,6),'#4a2a20',xk,0.33,0.01,1,1,1,PI/2,0,0)].concat(crown)},leg(K.gold,'#4a2a20',0.064),[HY,0.09]);
  var wt=1.45, xt=RX(wt), ht=0.74;
  add('tr',{c1:'#5c4a38',w:wt,hr:0.2,hy:ht,hz:-0.07,skin:'#7d9652',sleeve:'#7d9652',belt:'#8a7a5a',eyeC:'#3a2a10',x:[
    P(new Bx(0.26,0.05,0.08),'#6c8546',0,ht+0.06,-0.23),P(new Co(0.025,0.09,6),'#efe5d0',-0.07,ht-0.1,-0.24),P(new Co(0.025,0.09,6),'#efe5d0',0.07,ht-0.1,-0.24),P(new Sp(0.05,8,6),'#6c8546',0,ht-0.02,-0.27),
    P(new Co(0.04,0.12,6),'#7d9652',-0.2,ht+0.02,-0.05,1,1,1,0,0,1.3),P(new Co(0.04,0.12,6),'#7d9652',0.2,ht+0.02,-0.05,1,1,1,0,0,-1.3),P(new Sp(0.22,12,8),'#6c8546',0,0.62,0.08,1.4,0.6,1),
    P(new Cy(0.12,0.055,0.8,8),K.wood,xt,0.68,-0.19,1,1,1,-0.5,0,0)]},leg('#6c8546','#4a3a2a',0.075),[HY,0.12]);
  add('flag',{c1:'#8f3229',skin:'#e8b38d',ey:-0.01,x:[helm(K.iron,hy+0.045,0.22),brim(K.iron,hy+0.05,0.22,1.2),P(new Cy(0.018,0.018,1.9,6),K.wood,x,0.95,-0.03),P(new Sp(0.04,8,6),K.gold,x,1.92,-0.03),
    P(new Bx(0.02,0.46,0.5),'#b5473b',x,1.6,0.23),P(new Bx(0.025,0.08,0.5),K.gold,x,1.39,0.23),P(new Oc(0.07,0),K.gold,x,1.64,0.23,0.4,1,1)]});
  add('bm',{c1:'#363a42',skin:'#e8b38d',belt:K.red,ey:-0.01,x:[P(new Sp(0.228,14,6,0,2*PI,0,PI*0.38),K.red,0,hy+0.02,0),P(new Sp(0.04,6,5),K.red,0.05,hy+0.08,0.22),
    P(new Sp(0.22,14,10),mat('#2b2e35',0.5,0.35),0,0.56,0.3),P(new Cy(0.06,0.07,0.06,10),K.brass,0,0.79,0.3),P(new Cy(0.01,0.01,0.12,4),'#c9b48a',0.02,0.86,0.3,1,1,1,0,0,0.4),P(new Sp(0.035,6,5),'#ffb347',0.045,0.92,0.3),
    P(new Bx(0.05,0.36,0.04),'#5a3a24',-0.06,0.46,-0.19,1,1,1,0,0,0.6)]});
  add('sa',{c1:'#c8772e',skin:'#e8b38d',belt:'#3a2a1e',ey:-0.01,x:[helm('#e6c13b',hy+0.045,0.22),brim('#e6c13b',hy+0.05,0.22,1.25),P(new Bx(0.05,0.05,0.04),'#fff3c4',0,hy+0.14,-0.23),
    P(new Bx(0.04,0.03,0.3),K.steel,x,0.33,-0.15),P(new To(0.05,0.018,6,12,PI*1.5),K.steel,x,0.33,-0.33,1,1,1,PI/2,0,0)]});
  add('gd',{c1:'#e4eef4',robe:true,x:hood('#4f8dbf',hy,0.22).concat([P(new Cy(0.262,0.272,0.04,14),'#4f8dbf',0,0.05,0),
    P(new Cy(0.2,0.2,0.04,22),K.iceD,-0.31,0.44,-0.08,1,1,1,0,0,PI/2),P(new Cy(0.16,0.16,0.05,22),K.ice,-0.315,0.44,-0.08,1,1,1,0,0,PI/2),P(new Oc(0.05,0),'#ffffff',-0.345,0.44,-0.08)])},noLeg(),[0.05,0.05]);
  add('nc',{c1:'#2e2934',robe:true,skin:'#d9d3c7',eyeC:'#a35cf0',x:hood('#221e28',hy,0.22).concat([P(new Cy(0.262,0.272,0.04,14),'#7d4fd0',0,0.05,0),
    P(new Cy(0.018,0.02,1.3,6),'#3c3540',x,0.62,-0.03),P(new Sp(0.075,10,8),'#ece6d8',x,1.33,-0.03,1,0.95,1.05),P(new Sp(0.02,5,4),INK,x-0.03,1.34,-0.1),P(new Sp(0.02,5,4),INK,x+0.03,1.34,-0.1),P(new Sp(0.045,8,6),mat('#a35cf0',0,0.1),x,1.45,-0.03)])},noLeg(),[0.05,0.05]);
  var hth=0.82, fur='#8e8984';
  add('th',{c1:'#4b4744',skin:fur,hand:'#3a3634',hy:hth,eyeC:'#f2ebdf',x:[P(new Sp(0.222,14,5,0,2*PI,PI*0.4,PI*0.14),'#2e2a28',0,hth,0),
    P(new Sp(0.065,8,6),fur,-0.13,hth+0.17,0.02,1,1,0.55),P(new Sp(0.065,8,6),fur,0.13,hth+0.17,0.02,1,1,0.55),P(new Sp(0.06,8,6),'#e8e2d6',0,hth-0.07,-0.19,1,0.8,1),P(new Sp(0.022,5,4),INK,0,hth-0.05,-0.245),
    P(new Sp(0.08,8,6),fur,0,0.3,0.25),P(new Sp(0.075,8,6),'#2e2a28',0,0.33,0.36),P(new Sp(0.07,8,6),fur,0,0.38,0.46),P(new Sp(0.06,8,6),'#2e2a28',0,0.45,0.53),
    P(new Sp(0.2,12,9),'#c9b48a',0.05,0.66,0.26,1,1.1,0.9),P(new To(0.06,0.018,5,10),'#7a5a34',0.05,0.86,0.26,1,1,1,PI/2,0,0)]},leg('#3a3634','#2a2624'));
  var bone='#ece4d4';
  raw('sk',[P(lathe([[0,0.24],[0.1,0.24],[0.13,0.34],[0.15,0.46],[0.13,0.56],[0.08,0.62],[0,0.63]]),'#4a443e'),
    P(new To(0.14,0.022,6,16),bone,0,0.43,0,1,1,1,PI/2,0,0),P(new To(0.145,0.022,6,16),bone,0,0.5,0,1,1,1,PI/2,0,0),P(new To(0.13,0.022,6,16),bone,0,0.57,0,1,1,1,PI/2,0,0),
    P(new Cy(0.03,0.03,0.4,6),bone,0,0.44,0.02),P(new Bx(0.24,0.07,0.12),bone,0,0.28,0),
    P(new Ca(0.025,0.16,3,6),bone,-0.19,0.46,0,1,1,1,0,0,-0.12),P(new Ca(0.025,0.16,3,6),bone,0.19,0.46,0,1,1,1,0,0,0.12),P(new Sp(0.035,6,5),bone,-0.2,0.34,0),P(new Sp(0.035,6,5),bone,0.2,0.34,0),
    P(new Sp(0.2,14,10),bone,0,0.83,0),P(new Bx(0.17,0.07,0.14),bone,0,0.68,-0.06),
    P(new Sp(0.05,8,6),INK,-0.075,0.84,-0.178,1,1.1,0.6),P(new Sp(0.05,8,6),INK,0.075,0.84,-0.178,1,1.1,0.6),P(new Sp(0.02,5,4),INK,0,0.77,-0.19),
    P(new Bx(0.04,0.012,0.4),'#8a7a6a',0.215,0.33,-0.2),P(new Bx(0.12,0.025,0.03),'#6a5a4a',0.215,0.33,-0.02)],leg(bone,bone,0.035),[HY,0.07]);
  var gl=mat('#5cc46a',0.02,0.22);
  raw('sl',[P(lathe([[0,0],[0.32,0.01],[0.37,0.1],[0.33,0.27],[0.2,0.42],[0.07,0.5],[0,0.51]],16),gl),P(new Co(0.05,0.12,8),gl,0.02,0.55,0.02,1,1,1,0,0,-0.3),
    P(new Sp(0.07,8,6),'#e9fbe6',-0.12,0.38,-0.21,1,0.7,0.6),P(new Sp(0.04,8,6),INK,-0.1,0.28,-0.33,1,1.4,0.6),P(new Sp(0.04,8,6),INK,0.1,0.28,-0.33,1,1.4,0.6),P(new Sp(0.03,6,5),'#2e6b36',0,0.2,-0.345,1.4,0.5,0.5)]);
  var mf='#6e5440', wm=1.12, xm=RX(wm);
  add('mo',{c1:mf,w:wm,skin:mf,hand:'#e9c9a6',belt:'#3a2a1e',hr:0.21,ey:0.02,x:[P(new Sp(0.07,10,8),'#e79aa0',0,hy-0.05,-0.205,1,0.8,1),P(new Sp(0.16,12,8),'#8a6a50',0,0.42,-0.1,1,1.2,0.6),
    helm('#e6c13b',hy+0.05,0.21),brim('#e6c13b',hy+0.055,0.21,1.2),P(new Cy(0.045,0.045,0.05,12),'#fff3c4',0,hy+0.15,-0.215,1,1,1,PI/2,0,0),
    P(new Cy(0.015,0.015,0.55,5),K.wood,xm,0.4,-0.1,1,1,1,-0.4,0,0),P(new Bx(0.32,0.05,0.05),K.steel,xm,0.64,-0.21,1,1,1,0,0,0.2)]},leg(mf,'#e9c9a6',0.055));
  var st='#8f8b82', st2='#a6a196', ms='#6e9145', glow='#8ff0ff';
  E.go={hipY:0.36,hipX:0.16,leg:M([P(new Do(0.14,0),st,0,-0.16,0,1,1.25,1),P(new Bx(0.26,0.1,0.3),shade(st,0.85),0,-0.32,-0.02)]),body:M([
    P(new Do(0.36,0),st,0,0.66,0,1.05,0.85,0.8),P(new Do(0.2,0),st2,0,1.04,-0.06),P(new Bx(0.07,0.04,0.03),glow,-0.07,1.05,-0.24),P(new Bx(0.07,0.04,0.03),glow,0.07,1.05,-0.24),P(new Bx(0.1,0.18,0.03),glow,0,0.68,-0.29),
    P(new Do(0.17,0),st2,-0.42,0.8,0),P(new Do(0.17,0),st2,0.42,0.8,0),P(new Do(0.13,0),st,-0.46,0.56,-0.02,1,1.3,1),P(new Do(0.13,0),st,0.46,0.56,-0.02,1,1.3,1),P(new Do(0.16,0),st2,-0.47,0.3,-0.04),P(new Do(0.16,0),st2,0.47,0.3,-0.04),
    P(new Sp(0.14,8,6),ms,-0.4,0.93,0.02,1,0.35,1),P(new Sp(0.12,8,6),ms,0.02,1.2,0.02,1,0.3,1),P(new Sp(0.16,8,6),ms,0.12,0.9,0.12,1,0.3,1)])};
  var rf='#8f8a86', pk='#d9a0a0';
  raw('ra',[P(new Sp(0.18,14,10),rf,0,0.22,0.04,1,0.85,1.45),P(new Sp(0.12,12,8),rf,0,0.26,-0.24),P(new Co(0.09,0.18,10),rf,0,0.24,-0.4,1,1,1,-PI/2,0,0),P(new Sp(0.03,6,5),pk,0,0.24,-0.49),
    P(new Sp(0.065,10,8),pk,-0.09,0.37,-0.2,1,1,0.4),P(new Sp(0.065,10,8),pk,0.09,0.37,-0.2,1,1,0.4),P(new Sp(0.022,6,5),INK,-0.06,0.3,-0.33),P(new Sp(0.022,6,5),INK,0.06,0.3,-0.33),
    P(new To(0.2,0.016,5,14,PI*1.1),pk,0,0.12,0.42,1,1,1,0,PI/2,0)],M([P(new Ca(0.03,0.06,3,6),rf,0,-0.06,0)]),[0.13,0.08]);
  var gw=mat('#f3f5f9',0,0.35), GH=[P(lathe([[0.29,0.14],[0.3,0.32],[0.27,0.54],[0.19,0.72],[0.08,0.8],[0,0.81]],16),gw)];
  for(var gi=0;gi<8;gi++){ var ga=gi/8*2*PI; GH.push(P(new Sp(0.085,8,6),gw,Math.sin(ga)*0.25,0.15,Math.cos(ga)*0.25)); }
  raw('gh',GH.concat([P(new Sp(0.045,8,6),INK,-0.09,0.58,-0.255,1,1.5,0.5),P(new Sp(0.045,8,6),INK,0.09,0.58,-0.255,1,1.5,0.5),P(new Sp(0.035,8,6),INK,0,0.45,-0.29,0.9,1.2,0.5),
    P(new Sp(0.03,6,5),'#f2a7b0',-0.16,0.5,-0.24,1,0.6,0.4),P(new Sp(0.03,6,5),'#f2a7b0',0.16,0.5,-0.24,1,0.6,0.4),
    P(new Ca(0.05,0.1,3,6),gw,-0.3,0.42,-0.05,1,1,1,0.4,0,0.9),P(new Ca(0.05,0.1,3,6),gw,0.3,0.42,-0.05,1,1,1,0.4,0,-0.9)]));
  var sc='#2e2937', SPL=[P(new Sp(0.3,14,10),sc,0,0.38,0.2,1,0.85,1.15),P(new Oc(0.06,0),'#c0303a',0,0.635,0.2,1,0.3,1.6),P(new Sp(0.17,12,10),'#3a3445',0,0.33,-0.18),
    P(new Sp(0.028,6,5),'#e0434b',-0.05,0.42,-0.31),P(new Sp(0.028,6,5),'#e0434b',0.05,0.42,-0.31),P(new Sp(0.022,6,5),'#e0434b',-0.1,0.38,-0.3),P(new Sp(0.022,6,5),'#e0434b',0.1,0.38,-0.3),
    P(new Co(0.02,0.08,5),'#efe5d0',-0.04,0.23,-0.3,1,1,1,PI,0,0),P(new Co(0.02,0.08,5),'#efe5d0',0.04,0.23,-0.3,1,1,1,PI,0,0)];
  [-1,1].forEach(function(s){ [-0.16,-0.04,0.08,0.2].forEach(function(z){ var r=[s*0.12,0.32,z], kn=[s*0.4,0.56,z*1.5-0.02], ft=[s*0.62,0.02,z*2.1-0.04]; SPL.push(seg(r,kn,0.03,0.026,sc),seg(kn,ft,0.024,0.012,sc),P(new Sp(0.03,6,5),sc,kn[0],kn[1],kn[2])); }); });
  raw('sp',SPL);
  var cg='#4fae5a', CH=[P(new Sp(0.2,14,10),cg,0,0.28,0.02,1,0.85,1.6),P(new Sp(0.15,12,8),'#9bd56a',0,0.2,0.02,0.9,0.6,1.4),P(new Sp(0.14,12,10),cg,0,0.34,-0.34,1,0.9,1.25),P(new Co(0.1,0.16,10),cg,0,0.47,-0.3,1,1,1,0.5,0,0),
    P(new Sp(0.06,10,8),'#e3d64a',-0.11,0.38,-0.38),P(new Sp(0.06,10,8),'#e3d64a',0.11,0.38,-0.38),P(new Sp(0.025,6,5),INK,-0.15,0.39,-0.4),P(new Sp(0.025,6,5),INK,0.15,0.39,-0.4),
    P(new To(0.12,0.04,8,16,PI*1.6),cg,0,0.24,0.4,1,1,1,0,PI/2,0)];
  for(var cr=0;cr<4;cr++) CH.push(P(new Co(0.035,0.08,5),'#3c8a48',0,0.46,-0.12+cr*0.12));
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(o){ CH.push(P(new Ca(0.035,0.08,3,6),cg,o[0]*0.17,0.1,o[1]*0.2,1,1,1,0,0,o[0]*0.4)); });
  raw('cham',CH);
  return E; };
TM.bat=function(){ var bc='#4a2f63', sh=new THREE.Shape(); sh.moveTo(0,0.06); sh.quadraticCurveTo(0.3,0.16,0.6,0.1); sh.lineTo(0.56,-0.04); sh.quadraticCurveTo(0.5,-0.02,0.45,-0.1);
  sh.quadraticCurveTo(0.38,-0.04,0.3,-0.12); sh.quadraticCurveTo(0.22,-0.04,0.14,-0.12); sh.quadraticCurveTo(0.08,-0.04,0,-0.06); sh.lineTo(0,0.06);
  var wg=new THREE.ExtrudeGeometry(sh,{depth:0.02,bevelEnabled:false,curveSegments:6}); wg.rotateX(-PI/2); wg.translate(0.06,-0.01,0);
  return {body:M([P(new Sp(0.18,12,10),bc,0,0,0,1,0.95,1.05),P(new Co(0.05,0.13,6),bc,-0.08,0.18,0,1,1,1,0,0,0.25),P(new Co(0.05,0.13,6),bc,0.08,0.18,0,1,1,1,0,0,-0.25),
    P(new Sp(0.035,6,5),'#ff6b6b',-0.065,0.04,-0.16),P(new Sp(0.035,6,5),'#ff6b6b',0.065,0.04,-0.16),P(new Co(0.015,0.05,4),'#f2ebdf',-0.03,-0.07,-0.16,1,1,1,PI,0,0),P(new Co(0.015,0.05,4),'#f2ebdf',0.03,-0.07,-0.16,1,1,1,PI,0,0)]),
    wing:M([P(wg,'#5b3a78')])}; };

TM._h={P:P,M:M,mat:mat,K:K,INK:INK,SK:SK,shade:shade,lathe:lathe,prism:prism,seg:seg,leg:leg,noLeg:noLeg,fig:fig,helm:helm,brim:brim,hair:hair,hood:hood,RX:RX,HY:HY,HX:HX};
window.TOWER_MODELS=TM;
})();
