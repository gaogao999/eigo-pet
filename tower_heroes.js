/* えいごタワー：ゆうしゃ（7しょくぎょう × しんか3だんかい）— リアルな 7とうしん
   TM._hum に にんげんの くみたて（ボスでも つかう）を だす */
(function(){
'use strict';
var TM=window.TOWER_MODELS, H=TM._h, P=H.P, M=H.M, mat=H.mat, K=H.K, PI=Math.PI;
var Cy=THREE.CylinderGeometry,Bx=THREE.BoxGeometry,Sp=THREE.SphereGeometry,Co=THREE.ConeGeometry,To=THREE.TorusGeometry,Oc=THREE.OctahedronGeometry;
var SK='#d9a988', SKD='#b98666', HB='#4a3021', LEA='#6b4a30', LEAD='#3a2618', SOLE='#24180f';
var STEEL=mat('#c5ccd5',0.92,0.26), STEELD=mat('#7f8894',0.88,0.36), DARKM=mat('#34373f',0.8,0.4), GOLD=K.gold, PLAT=mat('#efebe3',0.6,0.24), GLOW=mat('#fff4d6',0.5,0.12), MAIL=mat('#8e959e',0.85,0.5);
function seg(a,b,r0,r1,c,n){ return H.seg(a,b,r0,r1,c,n||10); }
function limb(L,a,b,r0,r1,c,n){ L.push(seg(a,b,r0,r1,c,n),P(new Sp(r0,10,8),c,a[0],a[1],a[2]),P(new Sp(r1,10,8),c,b[0],b[1],b[2])); }
function ell(c,x,y,z,rx,ry,rz,ax,ay,az){ return P(new Sp(1,14,10),c,x,y,z,rx,ry,rz,ax||0,ay||0,az||0); }
function box(c,x,y,z,w,h,d,ax,ay,az){ return P(new Bx(w,h,d),c,x,y,z,1,1,1,ax||0,ay||0,az||0); }
function chain(L,pts,r0,r1,c,n){ for(var i=0;i<pts.length-1;i++){ var a=r0+(r1-r0)*i/(pts.length-1), b=r0+(r1-r0)*(i+1)/(pts.length-1); L.push(seg(pts[i],pts[i+1],a,b,c,n||8)); if(i) L.push(P(new Sp(a,8,6),c,pts[i][0],pts[i][1],pts[i][2])); } }

/* ---------- からだの ほね ---------- */
var BS={hip:0.58,hipX:0.066,sh:0.94,shX:0.165,head:1.105,w:1,hs:1,al:1};
var BD={hip:0.36,hipX:0.085,sh:0.74,shX:0.2,head:0.9,w:1.38,hs:1.08,al:0.8};
var BF={hip:0.6,hipX:0.055,sh:0.93,shX:0.138,head:1.085,w:0.82,hs:0.95,al:0.96,fem:true};
var SHM=[[0.68,0],[0.86,0.1],[0.88,0.2],[0.78,0.36],[0.75,0.45],[0.84,0.6],[0.97,0.75],[1,0.85],[0.88,0.94],[0.45,1]];
var SHF=[[0.76,0],[0.96,0.1],[0.93,0.2],[0.66,0.36],[0.64,0.45],[0.8,0.6],[0.92,0.72],[0.9,0.85],[0.8,0.94],[0.42,1]];
function ty(B,t){ var yb=B.hip-0.04, yt=B.sh+0.045; return yb+(yt-yb)*t; }
function tr(B,t){ var S=B.fem?SHF:SHM; for(var i=1;i<S.length;i++) if(S[i][1]>=t){ var a=S[i-1],b=S[i],u=(t-a[1])/(b[1]-a[1]); return (a[0]+(b[0]-a[0])*u)*0.15*B.w; } return 0; }
function tor(B,c,k,t0,t1,zs){ var S=B.fem?SHF:SHM, R=0.15*B.w*(k||1), pts=[];
  S.forEach(function(p){ if(p[1]>=t0-1e-6&&p[1]<=t1+1e-6) pts.push([p[0]*R,ty(B,p[1])]); });
  pts.unshift([0,pts[0][1]]); pts.push([0,pts[pts.length-1][1]]);
  var g=H.lathe(pts,22); g.scale(1,1,zs||0.64); return P(g,c); }

function headParts(B,o){ var L=[], hy=B.head, s=B.hs, sk=o.skin||SK, hc=o.hairC||HB;
  L.push(seg([0,B.sh-0.01,0.004],[0,hy-0.05*s,0.008],0.036*s,0.031*s,sk));
  L.push(ell(sk,0,hy+0.01*s,0.008*s,0.071*s,0.084*s,0.083*s),ell(sk,0,hy-0.036*s,-0.016*s,0.056*s,0.052*s,0.064*s),ell(sk,0,hy-0.07*s,-0.036*s,0.022*s,0.018*s,0.02*s));
  [-1,1].forEach(function(d){ L.push(ell(sk,d*0.07*s,hy-0.005*s,0.006*s,0.011*s,0.022*s,0.015*s)); if(o.elf) L.push(P(new Co(0.012*s,0.065*s,5),sk,d*0.085*s,hy+0.02*s,0.02*s,1,1,1,-0.5,0,-d*1.15)); });
  if(!o.noFace){ L.push(box(sk,0,hy-0.012*s,-0.077*s,0.016*s,0.032*s,0.02*s,-0.2,0,0),box(o.skinD||SKD,0,hy+0.021*s,-0.071*s,0.07*s,0.012*s,0.016*s),box('#8a4c42',0,hy-0.046*s,-0.071*s,0.024*s,0.005*s,0.006*s));
    [-1,1].forEach(function(d){ var ex=d*0.027*s, ey=hy+0.004*s, ez=-0.07*s;
      L.push(ell('#f1ebe2',ex,ey,ez,0.012*s,0.0075*s,0.006*s),ell(o.eyeC||'#2c3a48',ex,ey,ez-0.004*s,0.0062*s,0.0068*s,0.004*s),box(o.brow||hc,ex,ey+0.02*s,ez-0.004*s,0.03*s,0.006*s,0.008*s,0,0,-d*(o.browA||0.08))); }); }
  return L; }
function hairCap(B,c,k,tilt){ var s=B.hs; return P(new Sp(0.088*s*(k||1),18,10,0,2*PI,0,PI*0.56),c,0,B.head+0.012*s,0.012*s,0.9,1,1,tilt==null?0.45:tilt,0,0); }
function fringe(B,c){ var s=B.hs; return box(c,0.01*s,B.head+0.058*s,-0.06*s,0.11*s,0.026*s,0.03*s,-0.5,0,-0.12); }
function longHair(B,c,len){ var s=B.hs; return ell(c,0,B.head-0.04*s-len*0.5,0.05*s,0.068*s,0.06*s+len*0.5,0.035*s,0.12,0,0); }
function beard(B,c,len){ var s=B.hs, L=[ell(c,0,B.head-0.07*s,-0.03*s,0.058*s,0.04*s,0.054*s),box(c,0,B.head-0.032*s,-0.079*s,0.06*s,0.011*s,0.012*s)];
  if(len) L.push(P(new Co(0.052*s,len,10),c,0,B.head-0.08*s-len/2,-0.045*s,1,1,0.7,PI,0,0)); return L; }
function hood(B,c){ var s=B.hs, r=0.104*s, y=B.head+0.006*s, z=0.012*s;
  return [P(new Sp(r,18,8,0,2*PI,0,PI*0.4),c,0,y,z,0.95,1.08,1.05),P(new Sp(r,18,8,PI*1.5+0.95,2*PI-1.9,PI*0.4,PI*0.36),c,0,y,z,0.95,1.08,1.05),
    P(new Cy(0.075*s,0.2*B.w,0.13,22,1,true),c,0,B.sh,0.0,1,1,0.75),P(new Co(0.04*s,0.1*s,8),c,0,y+0.03*s,z+r*1.02,1,1,1,1.9,0,0)]; }
function wizHat(B,c,band,k){ var s=B.hs*(k||1), y=B.head+0.06*B.hs;
  return [P(new Cy(0.175*s,0.175*s,0.01,26),c,0,y,0),P(new Cy(0.062*s,0.088*s,0.11*s,18),c,0,y+0.055*s,0),P(new Cy(0.09*s,0.09*s,0.022*s,18),band,0,y+0.015*s,0),
    P(new Cy(0.034*s,0.06*s,0.11*s,14),c,0,y+0.15*s,0.012*s,1,1,1,0.25,0,0),P(new Co(0.034*s,0.13*s,12),c,0,y+0.25*s,0.05*s,1,1,1,0.65,0,0)]; }
function greatHelm(B,c,t,top){ var s=B.hs, y=B.head, L=[P(new Cy(0.088*s,0.084*s,0.16*s,20),c,0,y-0.01*s,0.004*s,1,1,1.04),P(new Sp(0.088*s,20,8,0,2*PI,0,PI*0.5),c,0,y+0.07*s,0.004*s,1,0.7,1.04),
    box('#15171b',0,y+0.012*s,-0.087*s,0.12*s,0.011*s,0.02*s),box(t,0,y-0.012*s,-0.09*s,0.016*s,0.15*s,0.012*s),P(new Cy(0.091*s,0.091*s,0.012*s,20),t,0,y-0.088*s,0.004*s,1,1,1.04)];
  for(var i=0;i<3;i++) [-1,1].forEach(function(d){ L.push(ell('#15171b',d*(0.026+i*0.013)*s,y-0.04*s,-0.087*s+i*0.003*s,0.004*s,0.004*s,0.003*s)); });
  if(top){ [-1,1].forEach(function(d){ for(var f=0;f<5;f++) L.push(box('#ffffff',d*(0.094+f*0.004)*s,y+0.03*s+f*0.03*s,0.03*s+f*0.022*s,0.008*s,0.024*s,(0.12-f*0.016)*s,-0.55-f*0.12,0,0)); }); L.push(box(GOLD,0,y+0.11*s,0.01*s,0.012*s,0.05*s,0.16*s)); }
  else L.push(ell('#9b1c22',0,y+0.12*s,0.035*s,0.022*s,0.045*s,0.085*s,-0.45,0,0));
  return L; }
function armParts(B,o){ var L=[], al=B.al, w=B.w, ue=-0.245*al, hd=-0.475*al, sl=o.sleeve, fa=o.fore||sl, gl=o.glove||SK;
  limb(L,[0,0,0],[0,ue,-0.004],0.042*w,0.033*w,sl);
  if(o.bell) L.push(seg([0,ue,-0.004],[0,hd+0.05,-0.01],0.034*w,0.072*w,fa,14),P(new Sp(0.034*w,10,8),fa,0,ue,-0.004)); else limb(L,[0,ue,-0.004],[0,hd+0.035,-0.01],0.033*w,0.025*w,fa);
  if(o.vamb) L.push(seg([0,ue-0.04,-0.006],[0,hd+0.045,-0.01],0.037*w,0.031*w,o.vamb));
  if(o.puff) L.push(ell(sl,0,-0.08*al,0,0.056*w,0.085*al,0.056*w));
  L.push(ell(gl,0,hd,-0.008,0.026*w,0.038*al,0.032*w),ell(gl,0,hd+0.012,-0.034,0.011,0.02,0.011));
  if(o.pad){ L.push(P(new Sp(0.068*w,14,8,0,2*PI,0,PI*0.5),o.pad,0,0.012,0,1.08,0.9,1.12),P(new Sp(0.07*w,14,6,0,2*PI,PI*0.5,PI*0.16),o.pad,0,0.012,0,1.1,1.6,1.14));
    if(o.padTrim) L.push(P(new To(0.069*w,0.006,5,18),o.padTrim,0,0.008,0,1.08,1.12,1,PI/2,0,0)); }
  return L; }
function legParts(B,o){ var L=[], h=B.hip, w=B.w, ky=-h*0.48, ay=-h+0.06, pc=o.pant, sc=o.shin||pc, bc=o.boot, bt=o.bootH==null?0.15:o.bootH;
  limb(L,[0,-0.005,0],[0,ky,-0.006],0.054*w,0.04*w,pc); limb(L,[0,ky,-0.006],[0,ay,0.004],0.039*w,0.027*w,sc); L.push(ell(sc,0,ky-0.075*h/0.58,0.012,0.04*w,0.075*h/0.58,0.038*w));
  L.push(seg([0,ay-0.03,0.004],[0,Math.min(ay+bt,ky-0.02),0],0.037*w,0.039*w,bc),ell(bc,0,-h+0.026,-0.03,0.034*w,0.027,0.072),box(o.sole||SOLE,0,-h+0.006,-0.028,0.062*w,0.012,0.145));
  if(o.greave) L.push(seg([0,ky-0.03,-0.006],[0,ay+0.02,0.002],0.045*w,0.035*w,o.greave),ell(o.greave,0,ky,-0.02,0.043*w,0.042,0.035*w));
  if(o.thighG) L.push(seg([0,-0.07,0],[0,ky+0.03,-0.006],0.06*w,0.047*w,o.thighG));
  return L; }
function bodyParts(B,o){ var L=[], w=B.w, yw=ty(B,0.4), rw=tr(B,0.4);
  L.push(tor(B,o.pant||o.c1,1,0,0.45),tor(B,o.c1,1.015,0.36,1));
  if(o.chest) L.push(tor(B,o.chest,1.085,0.36,1,0.68));
  [-1,1].forEach(function(d){ L.push(ell(o.sleeve||o.c1,d*B.shX*0.92,B.sh-0.008,0,0.048*w,0.05,0.05*w)); });
  if(o.skirt) L.push(P(new Cy(rw*1.1,rw*1.1*(o.skirt.fl||1.25),o.skirt.len,22,1,true),o.skirt.c,0,yw-o.skirt.len/2,0,1,1,o.skirt.zs||0.74));
  if(o.robe) L.push(P(H.lathe([[0,0],[0.205*w,0],[0.2*w,0.03],[0.16*w,0.26],[0.13*w,yw-0.1],[rw*1.07,yw],[0,yw]],22),o.robe,0,0,0,1,1,0.8));
  if(o.belt){ L.push(P(new Cy(rw*1.1,rw*1.1,0.032,22),o.belt,0,yw,0,1,1,0.72),box(o.buckle||GOLD,0,yw,-rw*0.8,0.034,0.03,0.012)); }
  return L; }
function placeLeft(B,list,rz){ var g=M(list); g.rotateZ(rz==null?-0.09:rz); g.translate(-B.shX,B.sh,0); return g; }

/* ---------- ぶき ---------- */
function sword(hd,len,bw,blade,guard,grip,gem){ var L=[P(new Cy(0.013,0.014,0.1,8),grip,0,hd,0.01,1,1,1,PI/2,0,0),ell(guard,0,hd,0.066,0.018,0.018,0.018),box(guard,0,hd,-0.048,bw*3.6,0.018,0.02),
    box(blade,0,hd,-0.058-len/2,bw,0.008,len),box(STEELD,0,hd,-0.058-len*0.45,bw*0.28,0.0095,len*0.8),P(new Oc(bw*0.5,0),blade,0,hd,-0.058-len,1,0.17,2.4)];
  if(gem) L.push(ell(gem,0,hd,-0.048,0.014,0.014,0.014)); return L; }
function staff(hd,len,c,z){ return [seg([0,hd-0.3,z||-0.01],[0,hd+len,z||-0.01],0.012,0.009,c,7)]; }
function bow(hd,len,c,recurve,grip){ var L=[], pts=[], n=10; for(var i=0;i<=n;i++){ var t=i/n*2-1, z=-0.075+0.075*t*t; if(recurve&&Math.abs(t)>0.8) z-=(Math.abs(t)-0.8)*0.35; pts.push([0,hd+t*len/2,z]); }
  for(var j=0;j<n;j++){ var r0=0.006+0.008*(1-Math.abs(j/n*2-1)), r1=0.006+0.008*(1-Math.abs((j+1)/n*2-1)); L.push(seg(pts[j],pts[j+1],r0,r1,c,6)); }
  L.push(seg(pts[0],pts[n],0.0025,0.0025,'#ece6d8',3),P(new Cy(0.017,0.017,0.09,8),grip||LEAD,0,hd,-0.075)); return L; }
function heater(w,h,d){ var s=new THREE.Shape(); s.moveTo(-w/2,h*0.42); s.lineTo(w/2,h*0.42); s.lineTo(w/2,0); s.quadraticCurveTo(w*0.46,-h*0.36,0,-h*0.58); s.quadraticCurveTo(-w*0.46,-h*0.36,-w/2,0); s.lineTo(-w/2,h*0.42);
  return new THREE.ExtrudeGeometry(s,{depth:d||0.018,bevelEnabled:true,bevelSize:0.006,bevelThickness:0.005,bevelSegments:1,curveSegments:10}); }
function shieldOn(B,parts,ry){ var g=M(parts); g.rotateY(ry==null?0.55:ry); g.translate(-B.shX-0.075,B.sh-0.33*B.al,-0.07); return g; }

/* ---------- ゆうしゃ ---------- */
TM.hero=function(k,f){
  var B=k==='dwarf'?BD:k==='fairy'?BF:BS, s=B.hs, hy=B.head, o={}, X=[], h={}, A={sleeve:'#555'}, LG={pant:'#4a4038',boot:LEA}, W=[], cape=null, top=f===3, headTop=hy+0.095*s, hd=-0.475*B.al, sh=null, al=B.al;
  if(k==='knight'){
    if(f===1){ var gam='#5a687c'; o.c1=gam; o.skirt={c:gam,len:0.21,fl:1.18}; o.belt=LEA; o.buckle=STEELD; o.pant='#4f4234'; A={sleeve:gam,glove:LEA,vamb:LEA}; LG={pant:'#4f4234',boot:LEA,bootH:0.2};
      h.hairC='#5a3a22'; X.push(hairCap(B,h.hairC),fringe(B,h.hairC));
      [0.52,0.64,0.76].forEach(function(t){ X.push(P(new Cy(tr(B,t)*1.035,tr(B,t)*1.035,0.006,22),'#4a5668',0,ty(B,t),0,1,1,0.67)); });
      var RS=[P(new Cy(0.13,0.13,0.02,26),'#7a5233',0,0,0,1,1,1,PI/2,0,0),P(new To(0.13,0.009,6,26),STEELD,0,0,0),ell(STEELD,0,0,-0.012,0.035,0.035,0.02)];
      [-0.06,0,0.06].forEach(function(x){ RS.push(box('#5f3f26',x,0,-0.0105,0.004,0.24,0.002)); }); sh=shieldOn(B,RS,0.6);
      W=sword(hd,0.36,0.04,STEEL,STEELD,LEAD); }
    else { var A1=top?PLAT:STEEL, T1=top?GOLD:STEELD, sur=top?'#ebe4d6':'#27407a';
      o.c1=sur; o.chest=A1; o.skirt={c:sur,len:0.25,fl:1.2}; o.belt=top?GOLD:LEAD; o.buckle=top?PLAT:GOLD; A={sleeve:A1,glove:A1,vamb:A1,pad:A1,padTrim:T1}; LG={pant:'#3a3a40',boot:A1,greave:A1,thighG:A1,sole:'#2a2a2e'};
      var cz=-tr(B,0.68)*1.085*0.68; X.push(box(T1,0,ty(B,0.7),cz-0.002,0.012,0.2,0.012));
      if(top){ X.push(P(new Cy(tr(B,0.94)*1.1,tr(B,0.94)*1.1,0.014,22),GOLD,0,ty(B,0.93),0,1,1,0.7),P(new Cy(tr(B,0.42)*1.1,tr(B,0.42)*1.1,0.014,22),GOLD,0,ty(B,0.43),0,1,1,0.7),P(new Oc(0.03,0),mat('#7fc4ff',0.1,0.1),0,ty(B,0.78),cz-0.008,1,1.3,0.4)); cape='#22386e'; }
      X=X.concat(greatHelm(B,A1,T1,top)); h.noFace=true; headTop=hy+0.13*s;
      var HS=[P(heater(0.26,0.36),top?PLAT:'#27407a'),P(heater(0.29,0.39,0.01),T1,0,0.0,0.012)];
      HS.push(box(GOLD,0,0.02,-0.008,0.026,0.24,0.006),box(GOLD,0,0.06,-0.008,0.17,0.026,0.006)); if(top) HS.push(ell(mat('#7fc4ff',0.1,0.1),0,0.06,-0.013,0.02,0.02,0.008));
      sh=shieldOn(B,HS,0.55);
      W=top?sword(hd,0.64,0.056,GLOW,GOLD,'#f2ead8',mat('#5aa8ff',0.1,0.1)):sword(hd,0.5,0.046,STEEL,STEELD,LEAD); } }
  else if(k==='mage'){ var rc=f===1?'#465877':f===2?'#4a3878':'#26204a';
    o.c1=rc; o.robe=rc; o.belt=f===1?'#a08a5a':GOLD; o.buckle=f===1?'#a08a5a':mat('#c9a3ff',0.1,0.1); A={sleeve:rc,fore:rc,bell:true,glove:SK};
    h.hairC=f===3?'#e9e5dc':f===2?'#6b5a48':'#7a5a3a'; h.brow=h.hairC;
    if(f===1){ X=X.concat(hood(B,'#38465f'),[fringe(B,h.hairC)]); W=staff(hd,0.62,'#7a5233').concat([ell(mat('#9fe8ff',0,0.08),0,hd+0.64,-0.01,0.022,0.035,0.022)]); }
    else { var hc2=f===2?'#3d2e66':'#1e1a3a', bd2=f===2?'#c8a24a':GOLD;
      X.push(hairCap(B,h.hairC)); X=X.concat(beard(B,h.hairC,f===3?0.2:0.05),wizHat(B,hc2,bd2,f===3?1.15:1)); headTop=hy+(f===3?0.4:0.36)*s;
      X.push(P(new Cy(0.07,0.2,0.15,22,1,true),f===2?'#3a2b60':'#5b1f33',0,B.sh-0.01,0,1,1,0.78));
      if(f===3){ cape='#5b1f33'; X.push(P(new Cy(0.205,0.205,0.02,22),GOLD,0,0.012,0,1,1,0.8),P(new Cy(tr(B,0.4)*1.12,tr(B,0.4)*1.12,0.012,22),GOLD,0,0.2,0,1,1,0.8),box(GOLD,0,0.3,-0.14,0.03,0.48,0.008,-0.16,0,0)); A.fore=rc; }
      if(f===2){ W=staff(hd,0.8,'#5a3e28').concat([ell(mat('#c49bff',0,0.06),0,hd+0.86,-0.01,0.045,0.045,0.045)]); [0,1,2].forEach(function(i){ var a=i/3*2*PI; W.push(seg([0,hd+0.78,-0.01],[Math.sin(a)*0.04,hd+0.88,-0.01+Math.cos(a)*0.04],0.008,0.004,'#5a3e28',5)); }); }
      else { W=staff(hd,0.95,'#2a2230').concat([P(new To(0.07,0.01,6,20,PI*1.5),GOLD,0,hd+1.02,-0.01,1,1,1,0,PI/2,PI*0.25),P(new Oc(0.05,0),mat('#bff4ff',0,0.05),0,hd+1.05,-0.01,1,1.8,1),P(new Cy(0.016,0.016,0.05,8),GOLD,0,hd+0.94,-0.01),P(new Cy(0.016,0.016,0.03,8),GOLD,0,hd-0.28,-0.01)]); } } }
  else if(k==='ranger'){ var gr=f===3?'#4c6e3a':'#3e5734';
    o.c1=f===1?'#6c7a4c':'#4a5a3a'; o.chest=f===3?gr:LEA; o.skirt={c:f===3?gr:LEA,len:0.18,fl:1.15}; o.belt=f===3?GOLD:LEAD; o.buckle=f===3?mat('#4fd18a',0.1,0.1):STEELD;
    A={sleeve:o.c1,glove:LEAD,vamb:f===3?LEA:LEAD}; LG={pant:'#4a4232',boot:LEAD,bootH:0.24};
    if(f<3){ X=X.concat(hood(B,f===1?'#4a6a3a':'#2c4229')); h.hairC='#7a4a2a'; X.push(fringe(B,h.hairC)); if(f===2) cape='#2c4229'; }
    else { h.elf=true; h.skin='#ecc8a8'; h.skinD='#d2a586'; h.hairC='#e6c87a'; h.brow='#c9a250'; X.push(hairCap(B,h.hairC),fringe(B,h.hairC),longHair(B,h.hairC,0.24),P(new To(0.082,0.005,5,24),GOLD,0,hy+0.04,0.006,1,1,1,PI/2-0.25,0,0),ell(mat('#4fd18a',0.1,0.1),0,hy+0.06,-0.08,0.012,0.012,0.008));
      A.pad=gr; A.padTrim=GOLD; cape='#2f5130'; X.push(P(new Cy(tr(B,0.94)*1.1,tr(B,0.94)*1.1,0.01,22),GOLD,0,ty(B,0.93),0,1,1,0.7)); }
    if(f>=2){ var qz=0.11; X.push(seg([0.07,0.62,qz],[-0.05,1.02,qz+0.02],0.04,0.034,LEA,12),seg([-0.05,1.0,qz+0.02],[-0.06,1.03,qz+0.02],0.036,0.036,f===3?GOLD:LEAD,12)); for(var q=0;q<4;q++) X.push(box(q%2?'#e6dfd0':'#a8392e',-0.06+q*0.012,1.08,qz+0.02+(q%2)*0.012,0.008,0.07,0.02,0,0,0.3)); X.push(seg([0.12,0.92,0.09],[-0.12,0.66,0.09],0.008,0.008,LEAD,5)); }
    W=bow(hd,f===1?0.5:f===2?0.78:0.84,f===3?GOLD:f===2?'#5a3a22':'#8a6a44',f===3,f===3?'#2f5130':LEAD); }
  else if(k==='support'){ var red='#8e3236';
    if(f===1){ o.c1=red; o.skirt={c:red,len:0.21,fl:1.2}; o.belt=LEA; o.pant='#5a4a3a'; A={sleeve:'#e6dcc6',fore:'#e6dcc6',puff:true,glove:SK}; LG={pant:'#5a4a3a',boot:LEA,bootH:0.2};
      h.hairC='#6b4226'; X.push(hairCap(B,h.hairC),fringe(B,h.hairC),ell(red,0.015,hy+0.07*s,0.01,0.1*s,0.035*s,0.1*s,0.1,0,-0.12),seg([0.06,hy+0.08,0.03],[0.14,hy+0.2,0.1],0.008,0.002,'#f2ead8',5),seg([0.06,hy+0.08,0.03],[0.13,hy+0.19,0.11],0.012,0.003,'#f2ead8',5));
      W=[ell('#a8703c',0,hd+0.02,-0.11,0.085,0.035,0.11),ell('#2a1a10',0,hd+0.052,-0.13,0.022,0.004,0.022),box('#5a3a22',0,hd+0.04,-0.32,0.03,0.016,0.22),box('#3a2618',0,hd+0.05,-0.45,0.035,0.02,0.07,0.6,0,0)]; }
    else if(f===2){ var dbl='#6a1f3c'; o.c1=dbl; o.skirt={c:dbl,len:0.22,fl:1.25}; o.belt=GOLD; o.pant='#2e2228'; A={sleeve:'#c9a24a',fore:dbl,puff:true,glove:'#efe6d6'}; LG={pant:'#2e2228',boot:LEAD,bootH:0.24};
      for(var b=0;b<4;b++) X.push(ell(GOLD,0,ty(B,0.5+b*0.12),-tr(B,0.5+b*0.12)*0.66-0.002,0.008,0.008,0.006));
      h.hairC='#6b4226'; X.push(hairCap(B,h.hairC),fringe(B,h.hairC),P(new Cy(0.17,0.17,0.01,26),'#2a1c26',0,hy+0.07,0,1,1,1,0.12,0,-0.1),P(new Cy(0.075,0.085,0.07,18),'#2a1c26',0,hy+0.1,0.0,1,1,1,0.12,0,-0.1),P(new Cy(0.087,0.087,0.018,18),GOLD,0,hy+0.08,0,1,1,1,0.12,0,-0.1));
      chain(X,[[0.05,hy+0.12,0.02],[0.12,hy+0.18,0.07],[0.2,hy+0.19,0.16],[0.25,hy+0.15,0.22]],0.03,0.012,'#f6efe2',6); cape=dbl; headTop=hy+0.16;
      W=[ell('#9a5e2e',0,hd+0.02,-0.12,0.1,0.04,0.13),P(new To(0.03,0.004,5,16),GOLD,0,hd+0.062,-0.14,1,1,1,PI/2,0,0),box('#3a2618',0,hd+0.045,-0.36,0.032,0.018,0.24),box(GOLD,0,hd+0.06,-0.5,0.04,0.024,0.08,0.6,0,0)]; }
    else { var wc='#efe8dc'; o.c1=wc; o.skirt={c:wc,len:0.4,fl:1.4}; o.belt='#b24a6e'; o.buckle=GOLD; o.pant='#efe8dc'; A={sleeve:wc,fore:wc,bell:true,glove:SK}; LG={pant:'#efe8dc',boot:'#c9a24a',bootH:0.22};
      X.push(P(new Cy(tr(B,0.4)*1.1*1.4+0.002,tr(B,0.4)*1.1*1.4+0.002,0.016,22),GOLD,0,ty(B,0.4)-0.4,0,1,1,0.74),box(GOLD,0,ty(B,0.7),-tr(B,0.7)*0.66-0.002,0.012,0.22,0.008),box(GOLD,0,ty(B,0.4)-0.2,-tr(B,0.4)*0.8-0.01,0.012,0.4,0.008,-0.2,0,0));
      h.hairC='#e8c46a'; h.brow='#c9a250'; X.push(hairCap(B,h.hairC),fringe(B,h.hairC),longHair(B,h.hairC,0.16),P(new To(0.084,0.005,5,24),GOLD,0,hy+0.045,0.006,1,1,1,PI/2-0.25,0,0)); cape='#b24a6e';
      W=[P(new To(0.14,0.014,6,22,PI*1.25),GOLD,0,hd+0.1,-0.12,1,1,1,0,PI/2,-PI*0.12),seg([0,hd,-0.02],[0,hd+0.25,-0.26],0.012,0.01,GOLD,6)];
      for(var st=0;st<6;st++) W.push(seg([0,hd+0.03+st*0.035,-0.05-st*0.035],[0,hd+0.2+st*0.012,-0.06-st*0.035],0.0018,0.0018,'#fff6dc',3)); } }
  else if(k==='assassin'){ var ch='#2a2d35', dk='#1c1e24';
    o.c1=ch; o.chest=f===3?DARKM:'#3a3330'; o.skirt={c:dk,len:0.16,fl:1.15}; o.belt=f===1?LEAD:'#5e2a3a'; o.buckle=STEELD; o.pant=dk;
    A={sleeve:ch,glove:dk,vamb:f===3?DARKM:LEAD}; LG={pant:dk,boot:'#17181c',bootH:0.26,greave:f===3?DARKM:null};
    X=X.concat(hood(B,dk)); h.hairC='#2a2a30'; h.eyeC=f===3?'#ff3344':'#2c3a48'; X.push(ell(dk,0,hy-0.036*s,-0.02*s,0.06*s,0.05*s,0.068*s));
    if(f>=2){ var sc2=f===3?'#a3262f':'#5a2e6e'; X.push(P(new To(0.06,0.022,8,18),sc2,0,B.sh+0.02,0.0,1,1,0.8,PI/2,0,0)); chain(X,[[0.03,B.sh+0.01,0.06],[0.06,B.sh-0.15,0.18],[0.1,B.sh-0.35,0.24],[0.12,B.sh-(f===3?0.6:0.48),0.26]],0.022,0.016,sc2,6);
      if(f===3) chain(X,[[-0.03,B.sh+0.01,0.06],[-0.07,B.sh-0.12,0.2],[-0.12,B.sh-0.3,0.28],[-0.15,B.sh-0.5,0.3]],0.02,0.014,sc2,6);
      X.push(box(LEAD,0.12,ty(B,0.4)-0.02,-0.04,0.05,0.06,0.04),box(STEELD,-0.13,0.42,-0.0,0.012,0.2,0.02,0,0,0.2)); }
    if(f===3){ A.pad=DARKM; A.padTrim='#a3262f'; }
    W=f===1?[P(new Cy(0.012,0.012,0.09,8),LEAD,0,hd,0.01,1,1,1,PI/2,0,0),box(STEELD,0,hd,-0.04,0.06,0.012,0.014),box(STEEL,0,hd,-0.14,0.03,0.006,0.18),P(new Oc(0.015,0),STEEL,0,hd,-0.23,1,0.2,2.2)]:
      f===2?sword(hd,0.34,0.034,STEEL,'#5a2e6e',dk):[P(new Cy(0.013,0.013,0.17,8),'#3a1a1e',0,hd,0.03,1,1,1,PI/2,0,0),P(new Cy(0.035,0.035,0.008,14),GOLD,0,hd,-0.058,1,1,1,PI/2,0,0)].concat((function(){ var L=[]; for(var i=0;i<4;i++) L.push(box(mat('#e6e9ee',0.9,0.15),0,hd+0.006+i*i*0.004,-0.12-i*0.15,0.026,0.006,0.16,0.04+i*0.03,0,0)); L.push(P(new Oc(0.013,0),mat('#e6e9ee',0.9,0.15),0,hd+0.046,-0.71,1,0.25,2.4,0.15,0,0)); return L; })()); }
  else if(k==='dwarf'){ var bd='#b8652e', mt=f===3?GOLD:f===2?STEEL:MAIL;
    o.c1='#7a5a3a'; o.chest=mt; o.skirt={c:f===1?MAIL:'#6a4426',len:0.16,fl:1.12}; o.belt=f===3?'#5a2a22':LEA; o.buckle=GOLD; o.pant='#5a4030';
    A={sleeve:f===1?MAIL:'#7a5a3a',glove:LEA,vamb:f>=2?mt:LEA}; if(f>=2){ A.pad=mt; A.padTrim=f===3?PLAT:STEELD; } LG={pant:'#5a4030',boot:LEAD,bootH:0.12,greave:f>=2?mt:null};
    h.hairC=bd; h.brow=bd; h.skin='#d9a080'; X=X.concat(beard(B,bd,0.22)); X.push(ell('#c98a6a',0,hy-0.008*s,-0.085*s,0.02*s,0.022*s,0.02*s));
    [-1,1].forEach(function(d){ X.push(seg([d*0.035*s,hy-0.1*s,-0.07*s],[d*0.045*s,hy-0.26*s,-0.06*s],0.012,0.009,bd,6),P(new Cy(0.014,0.014,0.016,8),GOLD,d*0.043*s,hy-0.22*s,-0.062*s)); });
    var hm=f===3?GOLD:f===2?STEEL:STEELD; X.push(P(new Sp(0.092*s,18,8,0,2*PI,0,PI*0.5),hm,0,hy+0.02*s,0.006*s,1,0.95,1.05),P(new Cy(0.096*s,0.096*s,0.02*s,20),f===3?PLAT:STEELD,0,hy+0.022*s,0.006*s,1,1,1.05),box(hm,0,hy-0.0,-0.094*s,0.014*s,0.07*s,0.01*s)); headTop=hy+0.12*s;
    if(f>=2) [-1,1].forEach(function(d){ chain(X,[[d*0.085*s,hy+0.05*s,0],[d*0.14*s,hy+0.09*s,-0.02],[d*0.17*s,hy+0.16*s,-0.03],[d*0.165*s,hy+0.22*s,-0.02]],0.022,0.006,'#ece3d0',8); });
    if(f===3){ for(var cp=0;cp<6;cp++){ var ca=cp/6*2*PI; X.push(P(new Co(0.014,0.05,5),GOLD,Math.sin(ca)*0.085*s,hy+0.1*s,Math.cos(ca)*0.085*s+0.006)); } cape='#5a1f22'; }
    var hs=f===1?0.8:f===2?1.05:1.25, hmM=f===3?GOLD:K.iron;
    W=[seg([0,hd,0.08],[0,hd,-0.42],0.014,0.013,'#5a3a22',8),P(new Cy(0.05*hs,0.05*hs,0.16*hs,12),hmM,0,hd,-0.44,1,1,1,0,0,PI/2),P(new Cy(0.054*hs,0.054*hs,0.016,12),f===3?PLAT:GOLD,0.06*hs,hd,-0.44,1,1,1,0,0,PI/2),P(new Cy(0.054*hs,0.054*hs,0.016,12),f===3?PLAT:GOLD,-0.06*hs,hd,-0.44,1,1,1,0,0,PI/2)];
    if(f===3) W.push(box(mat('#7fe0ff',0,0.06),0,hd+0.05*hs,-0.44,0.06,0.004,0.03)); }
  else { var dc=f===1?'#9cc8e4':f===2?'#e8a6c8':'#f6f1ea';
    o.c1=dc; o.robe=dc; o.belt=f===3?GOLD:null; A={sleeve:SK,fore:SK,glove:SK}; h.skin='#f0cdb2'; h.skinD='#d8ad92'; h.hairC='#efd27a'; h.brow='#c9a250';
    X.push(hairCap(B,h.hairC),fringe(B,h.hairC));
    [-1,1].forEach(function(d){ X.push(ell(dc,d*B.shX*0.92,B.sh-0.008,0,0.046*B.w,0.048,0.048*B.w)); });
    if(f===1) X.push(ell(h.hairC,0,hy+0.06*s,0.07*s,0.04*s,0.04*s,0.04*s));
    if(f>=2){ X.push(P(new Cy(0.16,0.2,0.12,22,1,true),f===2?'#f5d3e4':'#9cc8e4',0,0.42,0,1,1,0.8),longHair(B,h.hairC,f===3?0.3:0.14)); for(var fl=0;fl<7;fl++){ var fa=fl/7*2*PI; X.push(ell(['#ffffff','#ffc7df','#fff1a0'][fl%3],Math.sin(fa)*0.082*s,hy+0.055*s,Math.cos(fa)*0.082*s+0.008,0.014,0.014,0.014)); } }
    if(f===3) X.push(P(new Cy(0.2,0.2,0.016,22),GOLD,0,0.01,0,1,1,0.8),P(new Cy(0.095,0.15,0.08,22,1,true),GOLD,0,ty(B,0.92),0,1,1,0.75),ell(mat('#ff8fc4',0.1,0.1),0,hy+0.07*s,-0.07*s,0.012,0.016,0.008));
    W=[P(new Cy(0.007,0.007,0.3,6),f===3?GOLD:'#fef3c7',0,hd,-0.15,1,1,1,PI/2,0,0),P(new Oc(f===3?0.05:0.035,0),mat(f===3?'#ffe27a':'#f5c2ff',0,0.08),0,hd,-0.32,1,1,0.4)]; }
  var body=bodyParts(B,o).concat(headParts(B,h),X); body.push(placeLeft(B,armParts(B,A))); if(sh) body.push(sh);
  return {body:body,arm:armParts(B,A),wpn:W,leg:M(legParts(B,LG)),armX:B.shX,shY:B.sh,hipY:B.hip,hipX:B.hipX,hideLegs:!!o.robe,cape:cape,
    headTop:headTop,capeTop:B.sh+0.015,capeZ:tr(B,0.85)*0.7+0.016,capeW:2*B.shX+0.02*f,capeH:B.sh*(0.48+0.1*f),wingY:B.sh-0.1}; };
TM.HIPY=BS.hip; TM.HIPX=BS.hipX; TM.SHY=BS.sh;
TM._hum={body:bodyParts,leg:legParts,arm:armParts,head:headParts,place:placeLeft,tor:tor,ty:ty,tr:tr,B:BS,hairCap:hairCap,limb:limb,ell:ell,box:box,chain:chain,seg:seg};
})();
