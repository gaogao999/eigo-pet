/* えいごタワー：ボス（おに・イノシシ王・イエティ・きょだいサソリ・ドラゴン・まおう）— リアルな かいぼうがく
   すべて -z を むく。anim(t, walk, atk, flash, phase) */
(function(){
'use strict';
var TM=window.TOWER_MODELS, H=TM._h, HU=TM._hum, P=H.P, M=H.M, mat=H.mat, K=H.K, INK=H.INK, PI=Math.PI;
var Cy=THREE.CylinderGeometry,Bx=THREE.BoxGeometry,Sp=THREE.SphereGeometry,Co=THREE.ConeGeometry,To=THREE.TorusGeometry,Oc=THREE.OctahedronGeometry;
var IV='#e8dcc2', IRN=mat('#3e424a',0.8,0.4), GLD=K.gold, V3=THREE.Vector3;
function seg(a,b,r0,r1,c,n){ return H.seg(a,b,r0,r1,c,n||10); }
function limb(L,a,b,r0,r1,c,n){ L.push(seg(a,b,r0,r1,c,n),P(new Sp(r0,12,8),c,a[0],a[1],a[2]),P(new Sp(r1,12,8),c,b[0],b[1],b[2])); }
function ell(c,x,y,z,rx,ry,rz,ax,ay,az){ return P(new Sp(1,16,12),c,x,y,z,rx,ry,rz,ax||0,ay||0,az||0); }
function box(c,x,y,z,w,h,d,ax,ay,az){ return P(new Bx(w,h,d),c,x,y,z,1,1,1,ax||0,ay||0,az||0); }
function chain(L,pts,r0,r1,c,n){ for(var i=0;i<pts.length-1;i++){ var a=r0+(r1-r0)*i/(pts.length-1), b=r0+(r1-r0)*(i+1)/(pts.length-1); L.push(seg(pts[i],pts[i+1],a,b,c,n||8)); if(i) L.push(P(new Sp(a,8,6),c,pts[i][0],pts[i][1],pts[i][2])); } }
function spike(c,base,dir,r,len,n){ var d=new V3(dir[0],dir[1],dir[2]).normalize(), g=new Co(r,len,n||6); g.translate(0,len/2,0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new V3(0,1,0),d)); return P(g,c,base[0],base[1],base[2]); }
function horn(L,x,y,z,s,dx,dz,col,n){ n=n||7; var pts=[[x,y,z]]; for(var i=1;i<=n;i++){ var t=i/n; pts.push([x+dx*s*Math.sin(t*1.5),y+0.45*s*Math.sin(t*1.9),z+dz*s*t*t]); } chain(L,pts,0.07*s,0.012*s,col,8); }
function rnd(i){ var x=Math.sin(i*127.1+311.7)*43758.5453; return x-Math.floor(x); }
function fur(L,cols,c,R,n,len,r,down,keep){ for(var i=0;i<n;i++){ var yy=1-2*(i+0.5)/n, rad=Math.sqrt(1-yy*yy), th=i*2.39996, u=[Math.cos(th)*rad,yy,Math.sin(th)*rad];
    var p=[c[0]+u[0]*R[0],c[1]+u[1]*R[1],c[2]+u[2]*R[2]]; if(keep&&!keep(p,u)) continue;
    var nr=new V3(u[0]/R[0],u[1]/R[1],u[2]/R[2]).normalize(), d=nr.clone().multiplyScalar(1-down).add(new V3(0,-down,0)).normalize(), ln=len*(0.75+rnd(i)*0.5);
    L.push(spike(cols[i%cols.length],[p[0]-nr.x*ln*0.25,p[1]-nr.y*ln*0.25,p[2]-nr.z*ln*0.25],[d.x,d.y,d.z],r*(0.8+rnd(i+9)*0.4),ln,5)); } }
function glowEyes(par,pts,c,r){ var m=new THREE.Mesh(M(pts.map(function(p){ return P(new Sp(r,8,6),'#ffffff',p[0],p[1],p[2],1,0.7,0.6); })),new THREE.MeshBasicMaterial({color:c})); par.add(m); return m; }

TM.boss=function(k,mat0){
  var g=new THREE.Group(), an={legs:[],wings:[]}, body=new THREE.Group(); g.add(body);
  function mesh(L,m,par){ var o=new THREE.Mesh(M(L),m||mat0); o.castShadow=true; (par||body).add(o); return o; }
  function grp(x,y,z,par){ var q=new THREE.Group(); q.position.set(x,y,z); (par||body).add(q); return q; }
  function legG(x,y,z,L,par){ var q=grp(x,y,z,par||g); mesh(L,null,q); an.legs.push(q); return q; }

  if(k==='ogre'){ var sk='#a2402e', skD='#7c2c20', skL='#b85a44', tg='#d69a32', hairC='#1b1515', wrap='#8a7a62';
    [-1,1].forEach(function(s){ var L=[]; limb(L,[0,0,0],[0,-0.48,-0.07],0.2,0.15,sk,12); L.push(ell(sk,s*0.02,-0.2,-0.03,0.2,0.3,0.21));
      limb(L,[0,-0.48,-0.07],[0,-0.92,0.02],0.14,0.095,sk,12); L.push(ell(skD,0,-0.62,0.05,0.13,0.2,0.12),P(new Cy(0.11,0.12,0.14,12),wrap,0,-0.84,0.01),ell(skD,0,-1.0,-0.1,0.13,0.07,0.22));
      for(var t=-1;t<=1;t++) L.push(ell(skD,t*0.065,-1.01,-0.3,0.042,0.036,0.05),spike(IV,[t*0.065,-1.0,-0.34],[0,-0.3,-1],0.018,0.05,5));
      legG(s*0.32,1.05,0.05,L); });
    var TB=[ell(sk,0,1.36,-0.04,0.42,0.36,0.36),ell(sk,0,1.74,0,0.5,0.38,0.38),ell(sk,0,2.0,0.18,0.48,0.3,0.32),ell(sk,0,2.0,-0.1,0.21,0.17,0.2),
      ell(skL,-0.2,1.82,-0.27,0.22,0.15,0.1,0,0,-0.15),ell(skL,0.2,1.82,-0.27,0.22,0.15,0.1,0,0,0.15),ell(sk,-0.37,1.66,0.04,0.17,0.34,0.24),ell(sk,0.37,1.66,0.04,0.17,0.34,0.24),ell(skD,0,1.86,0.34,0.08,0.3,0.08)];
    for(var r=0;r<3;r++) [-1,1].forEach(function(s){ TB.push(ell(skL,s*0.085,1.53-r*0.12,-0.355+r*0.012,0.075,0.055,0.04)); });
    TB.push(ell(tg,0,1.1,0.03,0.43,0.24,0.35),box(tg,0,0.84,-0.27,0.36,0.42,0.04,0.12,0,0),box(tg,0,0.86,0.34,0.4,0.42,0.04,-0.12,0,0),P(new Cy(0.45,0.45,0.08,22),'#3a2a1c',0,1.24,0,1,1,0.84));
    for(var st=0;st<5;st++){ TB.push(box(INK,-0.12+st*0.06,0.86,-0.295,0.022,0.3,0.01,0.12,0,(st%2?0.3:-0.3)),box(INK,0.24-st*0.06,1.13,-0.33,0.02,0.16,0.02,0,0,0.5)); }
    TB.push(P(new To(0.05,0.03,6,12),'#e6d7b8',0.42,1.22,-0.08,1,1,1,0,PI/2,0),P(new Cy(0.075,0.075,0.03,12),GLD,0,1.24,-0.38,1,1,1,PI/2,0,0)); mesh(TB);
    var hd=grp(0,2.12,-0.22); an.head=hd;
    var HL=[ell(sk,0,0.1,0.02,0.17,0.2,0.2),ell(sk,0,-0.04,-0.1,0.16,0.13,0.16),box(skD,0,0.15,-0.165,0.3,0.065,0.08,0.3,0,0),ell(skD,0,0.06,-0.215,0.055,0.045,0.05),ell(skD,0,-0.08,-0.17,0.14,0.07,0.1),box('#1e0a08',0,-0.05,-0.245,0.15,0.028,0.03)];
    [-1,1].forEach(function(s){ HL.push(spike(IV,[s*0.085,-0.07,-0.23],[s*0.15,1,-0.15],0.024,0.11,6),spike(sk,[s*0.17,0.08,0],[s,0.35,0.2],0.05,0.14,6)); for(var t=0;t<3;t++) HL.push(box(IV,s*(0.02+t*0.022),-0.035,-0.25,0.016,0.018,0.012)); });
    horn(HL,-0.08,0.24,-0.04,0.5,-0.3,0.25,IV); horn(HL,0.08,0.24,-0.04,0.5,0.3,0.25,IV);
    fur(HL,[hairC,'#2a201c'],[0,0.15,0.05],[0.18,0.17,0.19],46,0.14,0.035,0.25,function(p,u){ return u[1]>0.05&&!(u[2]<-0.55&&u[1]<0.7); }); mesh(HL,null,hd);
    glowEyes(hd,[[-0.07,0.1,-0.205],[0.07,0.1,-0.205]],0xffd23a,0.024);
    function oArm(s,club){ var L=[ell(sk,0,0,0,0.2,0.18,0.2)]; limb(L,[0,-0.02,0],[s*0.04,-0.5,0.02],0.15,0.12,sk,12); L.push(ell(skL,s*0.01,-0.25,-0.08,0.12,0.18,0.1));
      limb(L,[s*0.04,-0.5,0.02],[s*0.04,-0.92,-0.06],0.12,0.085,sk,12); L.push(P(new Cy(0.11,0.125,0.18,12),IRN,s*0.04,-0.8,-0.04),P(new To(0.12,0.015,5,14),GLD,s*0.04,-0.71,-0.03,1,1,1,PI/2,0,0),ell(sk,s*0.04,-1.02,-0.08,0.11,0.12,0.1));
      for(var f=0;f<4;f++) L.push(ell(skD,s*0.04+(f-1.5)*0.045,-1.07,-0.17,0.026,0.04,0.035));
      if(club){ L.push(seg([0.04,-1.04,0.18],[0.04,-1.04,-0.25],0.04,0.045,'#3a2a20',8),seg([0.04,-1.04,-0.25],[0.04,-1.04,-1.3],0.085,0.16,IRN,12));
        for(var z=0;z<5;z++) for(var a=0;a<7;a++){ var an2=a/7*2*PI+z*0.45, rr=0.09+0.065*(z+0.5)/5; L.push(spike(IRN,[0.04+Math.cos(an2)*rr,-1.04+Math.sin(an2)*rr,-0.38-z*0.19],[Math.cos(an2),Math.sin(an2),0],0.022,0.07,5)); } }
      return L; }
    an.arm=grp(0.58,1.98,0); mesh(oArm(1,true),null,an.arm); an.arm2=grp(-0.58,1.98,0); mesh(oArm(-1,false),null,an.arm2); an.bob=0.04; }

  else if(k==='boar'){ var fur1='#3e2c22', fur2='#56402e', dk='#20160f', snt='#7a6052', hf='#141010';
    function bLeg(x,z,front){ var L=[]; if(front){ L.push(ell(fur2,0,0.02,0,0.16,0.3,0.2)); limb(L,[0,-0.12,0],[0,-0.45,0.02],0.11,0.065,fur1,10); limb(L,[0,-0.45,0.02],[0,-0.8,-0.02],0.05,0.042,dk,8); }
      else { L.push(ell(fur2,0,-0.02,0.05,0.18,0.34,0.26)); limb(L,[0,-0.3,0.12],[0,-0.56,0.2],0.085,0.055,fur1,10); limb(L,[0,-0.56,0.2],[0,-0.82,0.08],0.048,0.04,dk,8); }
      var zf=front?-0.02:0.08; L.push(P(new Cy(0.05,0.065,0.11,8),hf,0,-0.88,zf),box(dk,0,-0.88,zf-0.06,0.012,0.1,0.03)); legG(x,0.95,z,L); }
    bLeg(-0.36,-0.6,true); bLeg(0.36,-0.6,true); bLeg(-0.34,0.72,false); bLeg(0.34,0.72,false);
    var BL=[ell(fur1,0,1.12,0.1,0.58,0.6,1.12),ell(fur1,0,1.38,-0.45,0.54,0.56,0.6),ell(fur2,0,0.92,0.1,0.48,0.38,0.88),ell(fur1,0,1.14,0.78,0.48,0.5,0.48)];
    fur(BL,[dk,fur1,'#2c2018'],[0,1.12,0.1],[0.6,0.62,1.14],150,0.17,0.035,0.55,function(p,u){ return u[1]>-0.2; });
    for(var m2=0;m2<16;m2++){ var zz=-0.95+m2*0.12, yy=1.98-Math.max(0,m2-3)*0.035-(m2<3?(3-m2)*0.05:0); BL.push(spike(m2%2?dk:'#2e2219',[0,yy-0.08,zz],[0,1,0.75],0.05,0.32-m2*0.012,5)); }
    chain(BL,[[0,1.3,1.22],[0,1.18,1.3],[0,1.0,1.32]],0.03,0.015,fur1,6); BL.push(spike(dk,[0,1.0,1.32],[0,-1,0.2],0.035,0.14,5));
    BL.push(P(new Sp(1,20,10,0,2*PI,0,PI*0.24),IRN,0,0.98,0.12,0.66,0.72,1.0),P(new To(1,0.025,5,28),GLD,0,1.5,0.12,0.4,0.62,1,PI/2,0,0)); mesh(BL);
    var bh=grp(0,1.22,-1.02); an.head=bh;
    var HL2=[ell(fur1,0,0.04,0,0.32,0.36,0.4),seg([0,-0.02,-0.22],[0,-0.13,-0.74],0.25,0.12,fur1,12),ell(fur2,0,-0.18,-0.38,0.18,0.1,0.32),P(new Cy(0.13,0.13,0.06,16),snt,0,-0.14,-0.76,1,1,1,PI/2,0,0),
      ell(INK,-0.045,-0.13,-0.795,0.02,0.028,0.01),ell(INK,0.045,-0.13,-0.795,0.02,0.028,0.01),P(new Sp(1,16,8,0,2*PI,0,PI*0.5),IRN,0,0.12,-0.3,0.2,0.22,0.36,-0.3,0,0),P(new Cy(0.26,0.29,0.16,12),GLD,0,0.42,-0.02)];
    for(var c2=0;c2<6;c2++){ var ca=c2/6*2*PI; HL2.push(P(new Co(0.045,0.17,5),GLD,Math.sin(ca)*0.25,0.58,-0.02+Math.cos(ca)*0.25)); } HL2.push(ell('#c0303a',0,0.42,-0.3,0.04,0.04,0.025));
    [-1,1].forEach(function(s){ chain(HL2,[[s*0.11,-0.2,-0.6],[s*0.2,-0.16,-0.7],[s*0.27,-0.04,-0.74],[s*0.28,0.1,-0.7]],0.05,0.014,IV,8); HL2.push(spike(fur2,[s*0.22,0.3,0.05],[s*0.5,1,0.4],0.09,0.24,6),spike(dk,[s*0.3,-0.05,0.02],[s,-0.4,0.6],0.07,0.2,5)); });
    mesh(HL2,null,bh); glowEyes(bh,[[-0.2,0.1,-0.3],[0.2,0.1,-0.3]],0xff4a3a,0.03); an.bob=0.05; }

  else if(k==='yeti'){ var wf='#eef2f5', wf2='#d8e0e8', wf3='#c4ced9', bs='#7a92aa', bsD='#5b7189';
    [-1,1].forEach(function(s){ var L=[ell(wf,0,-0.2,0.02,0.28,0.38,0.3)]; limb(L,[0,-0.3,0.02],[0,-0.82,0.08],0.22,0.15,wf2,10); fur(L,[wf,wf2,wf3],[0,-0.45,0.05],[0.24,0.42,0.24],40,0.2,0.07,0.6);
      L.push(ell(bs,0,-0.98,-0.08,0.2,0.08,0.3)); for(var t=-1.5;t<=1.5;t++) L.push(ell(bsD,t*0.075,-1.0,-0.36,0.04,0.04,0.05),spike(IV,[t*0.075,-0.99,-0.4],[0,-0.3,-1],0.016,0.06,5)); legG(s*0.42,1.05,0.15,L); });
    var YL=[ell(wf,0,1.45,0.02,0.6,0.55,0.5),ell(wf,0,2.0,-0.08,0.78,0.65,0.6),ell(wf,0,2.32,0.22,0.72,0.5,0.52),ell(bs,0,1.92,-0.6,0.36,0.42,0.14),ell(bsD,-0.15,2.08,-0.66,0.15,0.1,0.06),ell(bsD,0.15,2.08,-0.66,0.15,0.1,0.06)];
    fur(YL,[wf,wf2,wf3,wf],[0,1.85,0.02],[0.82,0.95,0.66],190,0.28,0.09,0.65,function(p,u){ return !(u[2]<-0.55&&p[1]>1.5&&p[1]<2.35&&Math.abs(p[0])<0.4); });
    YL.push(P(new Oc(0.14,0),K.ice,-0.62,2.55,0.25,0.7,2,0.7,0.3,0,0.5),P(new Oc(0.11,0),K.ice,-0.45,2.68,0.32,0.7,1.8,0.7,0.2,0,0.25),P(new Oc(0.13,0),K.ice,0.6,2.55,0.2,0.7,2,0.7,0.3,0,-0.5)); mesh(YL);
    var yh=grp(0,2.5,-0.55); an.head=yh;
    var HY=[ell(wf,0,0.1,0.08,0.36,0.36,0.36),ell(bs,0,-0.02,-0.2,0.25,0.27,0.16),box(bsD,0,0.11,-0.33,0.36,0.07,0.1,0.25,0,0),ell(bs,0,-0.15,-0.32,0.17,0.12,0.12),ell(bsD,0,-0.06,-0.4,0.06,0.04,0.04),box('#1e2a38',0,-0.2,-0.42,0.2,0.035,0.04)];
    [-1,1].forEach(function(s){ HY.push(spike(IV,[s*0.07,-0.22,-0.42],[0,-1,-0.1],0.024,0.1,6),spike(IV,[s*0.08,-0.18,-0.41],[0,1,-0.1],0.02,0.07,6)); });
    fur(HY,[wf,wf2],[0,0.12,0.08],[0.37,0.37,0.37],60,0.16,0.06,0.4,function(p,u){ return u[2]>-0.5||u[1]>0.55; });
    horn(HY,-0.3,0.28,0.05,0.75,-0.55,0.6,IV); horn(HY,0.3,0.28,0.05,0.75,0.55,0.6,IV); mesh(HY,null,yh); glowEyes(yh,[[-0.12,0.04,-0.33],[0.12,0.04,-0.33]],0x7fe8ff,0.035);
    [-1,1].forEach(function(s){ var L=[ell(wf,0,0,0,0.3,0.28,0.3)]; limb(L,[0,-0.1,0],[s*0.1,-0.78,-0.12],0.25,0.2,wf2,10); limb(L,[s*0.1,-0.78,-0.12],[s*0.05,-1.4,-0.24],0.19,0.15,wf2,10);
      fur(L,[wf,wf2,wf3],[s*0.07,-0.7,-0.1],[0.27,0.75,0.27],80,0.22,0.075,0.7);
      L.push(ell(bs,s*0.05,-1.52,-0.28,0.17,0.14,0.15)); for(var f=0;f<4;f++){ var fx=s*0.05+(f-1.5)*0.075; L.push(seg([fx,-1.6,-0.3],[fx,-1.74,-0.36],0.035,0.03,bs,6),spike(IV,[fx,-1.74,-0.37],[0,-0.6,-1],0.02,0.07,5)); }
      var ar=grp(s*0.88,2.3,-0.1); mesh(L,null,ar); if(s>0) an.arm=ar; else an.arm2=ar; }); an.bob=0.05; }

  else if(k==='scorp'){ var sh='#2e211c', sh2='#4a3026', rd='#6e2a1e', bel='#5e4a3a';
    var SL=[ell(sh,0,0.55,-0.75,0.46,0.15,0.5),ell(sh2,0,0.63,-0.72,0.3,0.08,0.4),box(rd,0,0.69,-0.74,0.04,0.03,0.4)];
    for(var i=0;i<7;i++){ var z=-0.32+i*0.21, wd=0.52-Math.abs(i-2)*0.03-(i>4?(i-4)*0.07:0); SL.push(ell(i%2?sh:sh2,0,0.57,z,wd,0.15,0.15),box(rd,0,0.69,z,0.04,0.025,0.16),ell(bel,0,0.47,z,wd*0.85,0.08,0.13)); [-1,1].forEach(function(s){ SL.push(ell(rd,s*wd*0.7,0.64,z,wd*0.18,0.04,0.11)); }); }
    SL.push(box('#1a1210',-0.11,0.47,-1.22,0.07,0.1,0.1,0.3,0,0.3),box('#1a1210',0.11,0.47,-1.22,0.07,0.1,0.1,0.3,0,-0.3)); mesh(SL);
    glowEyes(body,[[-0.06,0.72,-0.92],[0.06,0.72,-0.92],[-0.32,0.62,-1.1],[0.32,0.62,-1.1],[-0.36,0.62,-1.04],[0.36,0.62,-1.04]],0xffd33a,0.026);
    [-1,1].forEach(function(s){ var L=[]; chain(L,[[0,0,0],[s*0.32,0.06,-0.22],[s*0.42,0.12,-0.62]],0.075,0.06,sh,8);
      L.push(ell(sh2,s*0.45,0.12,-0.92,0.18,0.12,0.28),ell(rd,s*0.45,0.2,-0.92,0.1,0.05,0.2),spike(sh,[s*0.4,0.12,-1.12],[0,0,-1],0.065,0.42,7),spike(sh2,[s*0.53,0.12,-1.1],[s*0.25,0,-1],0.055,0.38,7));
      for(var t=0;t<4;t++) L.push(spike('#d9c9a8',[s*(0.44+0.02),0.12,-1.22-t*0.06],[-s,0,0],0.01,0.04,4));
      var cl=grp(s*0.34,0.55,-1.12); mesh(L,null,cl); if(s>0) an.arm=cl; else an.arm2=cl; });
    var tl=grp(0,0.62,0.98); an.tail=tl; var TL=[], R=0.62, prev=null;
    for(var t2=0;t2<=12;t2++){ var a=t2/12*PI*1.18, p=[0,R-R*Math.cos(a),R*Math.sin(a)*1.05], rr=0.17-t2*0.006; TL.push(ell(Math.floor(t2/2)%2?sh:sh2,p[0],p[1],p[2],rr,rr*0.9,rr*1.25,-a,0,0),box(rd,0,p[1]+Math.cos(a)*rr*0.85,p[2]+Math.sin(a)*rr*0.85,0.03,0.03,rr*1.4,-a,0,0)); prev=p; }
    TL.push(ell('#7a3a1e',0,prev[1]+0.08,prev[2]-0.12,0.13,0.12,0.16),spike(mat('#e8c24a',0.2,0.25),[0,prev[1]+0.02,prev[2]-0.24],[0,-0.9,-0.6],0.045,0.3,7)); mesh(TL,null,tl);
    for(var sl=0;sl<4;sl++) [-1,1].forEach(function(s){ var zo=(sl-1.5)*0.12, L=[]; chain(L,[[0,0,0],[s*0.36,0.26,zo],[s*0.72,0.1,zo*1.3],[s*0.92,-0.52,zo*1.6]],0.05,0.02,sh,6); legG(s*0.4,0.55,-0.6+sl*0.2,L,body); });
    an.bob=0.02; }

  else if(k==='dragon'){ var rd='#8e2620', rdD='#5e1814', bel='#d6b080', spn='#d9963a', mem='#6e1c1c';
    var DL=[ell(rd,0,0.05,-0.42,0.52,0.52,0.62),ell(rd,0,-0.02,0.22,0.46,0.46,0.66),ell(rd,0,0.0,0.72,0.4,0.4,0.38)];
    for(var b=0;b<7;b++) DL.push(ell(bel,0,-0.42+Math.abs(b-3)*0.012,-0.72+b*0.22,0.3-Math.abs(b-3)*0.02,0.08,0.12));
    var neck=[[0,0.28,-0.85],[0,0.5,-1.08],[0,0.76,-1.28],[0,1.0,-1.45],[0,1.15,-1.62]]; chain(DL,neck,0.3,0.17,rd,12);
    neck.forEach(function(p,i){ if(i) DL.push(ell(bel,0,p[1]-0.14+i*0.02,p[2]-0.12,0.15-i*0.015,0.06,0.1,0.7,0,0)); DL.push(spike(spn,[0,p[1]+0.22-i*0.02,p[2]+0.04],[0,1,0.5],0.06,0.2-i*0.02,4)); });
    for(var s3=0;s3<7;s3++) DL.push(spike(spn,[0,0.48-Math.abs(s3-2)*0.03,-0.7+s3*0.27],[0,1,0.45],0.08,0.3-s3*0.02,4));
    var tp=[[0,0,0.95]]; for(var tt=1;tt<=9;tt++) tp.push([Math.sin(tt*0.5)*0.12*tt/9,-0.04*tt,0.95+tt*0.3]); chain(DL,tp,0.3,0.05,rd,10);
    tp.forEach(function(p,i){ if(i&&i<9) DL.push(spike(spn,[p[0],p[1]+0.24-i*0.025,p[2]],[0,1,0.5],0.06-i*0.005,0.18-i*0.014,4)); });
    var e=tp[9]; DL.push(P(new Oc(0.2,0),spn,e[0],e[1],e[2]+0.15,0.25,1,1.5)); mesh(DL);
    var dh=grp(0,1.2,-1.74); an.head=dh;
    var HD=[ell(rd,0,0.05,0.05,0.2,0.17,0.24),seg([0,0.02,-0.08],[0,-0.04,-0.58],0.16,0.085,rd,6),seg([0,-0.12,-0.04],[0,-0.17,-0.52],0.11,0.06,rdD,6),ell(bel,0,-0.2,-0.22,0.09,0.05,0.24),
      box(rdD,0,-0.01,-0.6,0.12,0.06,0.06),ell(INK,-0.035,0.0,-0.63,0.015,0.012,0.01),ell(INK,0.035,0.0,-0.63,0.015,0.012,0.01)];
    [-1,1].forEach(function(s){ HD.push(box(rdD,s*0.1,0.13,-0.2,0.06,0.04,0.28,0.25,s*0.25,0)); chain(HD,[[s*0.11,0.15,0.08],[s*0.17,0.24,0.32],[s*0.21,0.3,0.56],[s*0.22,0.32,0.72]],0.055,0.012,IV,8); HD.push(spike(IV,[s*0.17,0.04,0.1],[s*0.6,0.2,1],0.03,0.22,5),spike(IV,[s*0.17,-0.06,0.08],[s*0.8,-0.2,1],0.025,0.16,5));
      for(var t=0;t<5;t++) HD.push(spike(IV,[s*0.07,-0.07,-0.2-t*0.08],[0,-1,0],0.012,0.04,4),spike(IV,[s*0.06,-0.12,-0.18-t*0.07],[0,1,0],0.01,0.035,4)); });
    mesh(HD,null,dh); glowEyes(dh,[[-0.12,0.08,-0.24],[0.12,0.08,-0.24]],0xffe14a,0.026);
    var fire=new THREE.Mesh(new Sp(0.08,8,6),new THREE.MeshBasicMaterial({color:0xff9a3a})); fire.position.set(0,-0.08,-0.62); dh.add(fire); an.fire=fire;
    var wm=new THREE.MeshStandardMaterial({color:mem,side:THREE.DoubleSide,roughness:0.8,metalness:0});
    [-1,1].forEach(function(s){ var wg=new THREE.Group(); wg.position.set(s*0.42,0.32,-0.38); g.add(wg); wg.userData.sd=s; an.wings.push(wg);
      var E=[s*0.75,0.38,0.18], Wr=[s*1.5,0.28,0.48], T=[[s*2.7,0.1,0.35],[s*2.5,0.02,1.05],[s*2.05,-0.02,1.55],[s*1.25,-0.04,1.7]], Bp=[s*0.05,-0.05,1.15];
      var BL2=[]; chain(BL2,[[0,0,0],E,Wr],0.08,0.05,rd,8); T.forEach(function(p){ chain(BL2,[Wr,[(Wr[0]+p[0])/2,(Wr[1]+p[1])/2+0.05,(Wr[2]+p[2])/2],p],0.035,0.012,rd,6); }); BL2.push(spike(IV,Wr,[s*0.3,1,-0.5],0.035,0.18,5)); mesh(BL2,null,wg);
      var tri=[[0,0,0],E,Wr, [0,0,0],Wr,Bp, Wr,T[0],T[1], Wr,T[1],T[2], Wr,T[2],T[3], Wr,T[3],Bp], pos=[]; tri.forEach(function(p){ pos.push(p[0],p[1]-0.01,p[2]); });
      var mg=new THREE.BufferGeometry(); mg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); mg.computeVertexNormals(); var mm=new THREE.Mesh(mg,wm); mm.castShadow=true; wg.add(mm); });
    [[-0.36,-0.15,-0.5,true],[0.36,-0.15,-0.5,true],[-0.34,-0.1,0.68,false],[0.34,-0.1,0.68,false]].forEach(function(q){ var L=[]; if(q[3]){ limb(L,[0,0,0],[0,-0.4,-0.08],0.13,0.08,rd,10); limb(L,[0,-0.4,-0.08],[0,-0.6,-0.28],0.075,0.06,rd,8); }
      else { L.push(ell(rd,0,-0.05,0.05,0.18,0.3,0.24)); limb(L,[0,-0.25,0.12],[0,-0.5,0.0],0.09,0.065,rd,8); limb(L,[0,-0.5,0],[0,-0.62,-0.2],0.06,0.05,rd,8); }
      var fz=q[3]?-0.3:-0.22, fy=q[3]?-0.62:-0.64; L.push(ell(rdD,0,fy,fz,0.08,0.04,0.09)); for(var c=-1;c<=1;c++) L.push(spike(IV,[c*0.045,fy,fz-0.07],[c*0.3,-0.6,-1],0.016,0.08,5)); legG(q[0],q[1],q[2],L); }); an.fly=true; }

  else { var S=2.45, B=HU.B, rb='#1d1626', rb2='#2e2240', ar=mat('#2c2f38',0.85,0.35), arD=mat('#1a1c22',0.8,0.45), cr2='#e2d8c4', vio=mat('#d23aff',0.1,0.08);
    var o={c1:rb2,robe:rb,chest:ar,belt:GLD,buckle:vio}, A={sleeve:rb2,fore:ar,glove:arD,vamb:ar,pad:ar,padTrim:GLD}, X=[];
    X.push(P(new Cy(0.205,0.205,0.02,22),GLD,0,0.012,0,1,1,0.8),P(new Cy(HU.tr(B,0.94)*1.12,HU.tr(B,0.94)*1.12,0.014,22),GLD,0,HU.ty(B,0.93),0,1,1,0.72),P(new Oc(0.035,0),vio,0,HU.ty(B,0.74),-HU.tr(B,0.74)*0.74-0.006,1,1.4,0.4),box(GLD,0,0.3,-0.15,0.035,0.5,0.008,-0.16,0,0));
    [-1,1].forEach(function(s){ for(var i=0;i<3;i++) X.push(spike(cr2,[s*(B.shX+0.01),B.sh+0.06-i*0.005,-0.03+i*0.035],[s*0.5,1,0.2*i],0.012,0.07-i*0.012,5)); });
    var hy=B.head; X.push(P(new Sp(0.09,20,10),arD,0,hy+0.005,0.004,0.95,1.05,1.05),box('#050307',0,hy+0.01,-0.088,0.1,0.016,0.02),box(ar,0,hy-0.03,-0.092,0.02,0.06,0.012),P(new Cy(0.084,0.09,0.035,16),GLD,0,hy+0.08,0.004));
    for(var c3=0;c3<7;c3++){ var c3a=c3/7*2*PI; X.push(P(new Co(0.011,0.05+(c3===0?0.03:0),5),GLD,Math.sin(c3a)*0.08,hy+0.12,Math.cos(c3a)*0.08+0.004)); }
    horn(X,-0.07,hy+0.05,0.0,0.22,-0.7,0.55,cr2); horn(X,0.07,hy+0.05,0.0,0.22,0.7,0.55,cr2);
    var bodyL=HU.body(B,o).concat(HU.head(B,{noFace:true,skin:'#1a1426'}),X); bodyL.push(HU.place(B,HU.arm(B,A),-0.25));
    var bg=M(bodyL); bg.scale(S,S,S); var bm=new THREE.Mesh(bg,mat0); bm.castShadow=true; body.add(bm);
    var mh=grp(0,0,0); an.head=null; an.eyes=glowEyes(body,[[-0.027*S,(hy+0.01)*S,-0.095*S],[0.027*S,(hy+0.01)*S,-0.095*S]],0xff2d2d,0.018*S);
    var AL=HU.arm(B,A), hd=-0.475; AL.push(seg([0,hd-0.35,-0.02],[0,hd+0.7,-0.02],0.012,0.01,'#14111a',7),P(new To(0.05,0.008,6,18,PI*1.4),GLD,0,hd+0.74,-0.02,1,1,1,0,PI/2,-PI*0.2),P(new Sp(0.04,14,10),vio,0,hd+0.76,-0.02));
    var ag=M(AL); ag.scale(S,S,S); an.arm=grp(B.shX*S,B.sh*S,0); var am=new THREE.Mesh(ag,mat0); am.castShadow=true; an.arm.add(am);
    var cape=new THREE.Mesh(new THREE.PlaneGeometry(0.42*S,0.86*S,4,6),new THREE.MeshStandardMaterial({color:0x4a1020,side:THREE.DoubleSide,roughness:0.85})); cape.position.set(0,(B.sh-0.42)*S,0.13*S); cape.rotation.x=0.1; body.add(cape); an.cape=cape;
    var aura=new THREE.Mesh(new THREE.RingGeometry(1.05,1.35,40),new THREE.MeshBasicMaterial({color:0x7c3aed,transparent:true,opacity:0.6,blending:THREE.AdditiveBlending,depthWrite:false})); aura.rotation.x=-PI/2; aura.position.y=0.06; g.add(aura); an.aura=aura; an.float=true; }

  return {g:g,fly:!!an.fly,anim:function(t,walk,atk,flash,phase){ var sw=walk?Math.sin(t*5)*0.45:0;
    an.legs.forEach(function(l,i){ l.rotation.x=((i+(i>>1))%2?sw:-sw)*(k==='scorp'?0.5:1); });
    body.position.y=an.float?0.12+Math.sin(t*2)*0.08:(walk?Math.abs(Math.sin(t*5))*(an.bob||0.04):0);
    an.wings.forEach(function(w){ w.rotation.z=w.userData.sd*Math.sin(t*4)*0.6; });
    if(an.arm&&k!=='scorp') an.arm.rotation.x=atk?(-2.2+Math.max(0,Math.sin(t*6))*1.6):(k==='maou'?0.25+Math.sin(t*1.5)*0.1:-sw*0.6);
    if(an.arm2&&k!=='scorp') an.arm2.rotation.x=sw*0.6;
    if(k==='scorp'){ var op=atk?0.35:Math.sin(t*3)*0.1; an.arm.rotation.y=-op; an.arm2.rotation.y=op; }
    if(an.head) an.head.rotation.y=Math.sin(t*0.9)*0.2;
    if(an.tail) an.tail.rotation.x=Math.sin(t*2)*0.08+(atk?-0.4:0);
    if(an.fire) an.fire.scale.setScalar(atk?2.2+Math.sin(t*30)*0.4:0.5+Math.sin(t*8)*0.15);
    if(an.cape) an.cape.rotation.x=0.1+Math.sin(t*3)*0.05;
    if(an.aura){ an.aura.rotation.z+=0.03; an.aura.material.color.setHex(phase>=3?0xef4444:phase>=2?0xc026d3:0x7c3aed); an.aura.scale.setScalar(1+(phase||1)*0.15); if(an.eyes) an.eyes.material.color.setHex(phase>=3?0xffffff:0xff2d2d); }
    g.scale.setScalar((flash?1.06:1)*1.35); }}; };
})();
