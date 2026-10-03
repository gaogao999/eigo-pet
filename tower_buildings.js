/* えいごタワー：タワー（Lv1〜5）と しせつ（Lv1〜3）
   Lv1＝木の とりで → Lv2＝石の とう → Lv3＝しろ → Lv4＝せいえい → Lv5＝でんせつ（しろい 大理石＋金） */
(function(){
'use strict';
var TM=window.TOWER_MODELS, H=TM._h, P=H.P, M=H.M, mat=H.mat, K=H.K, INK=H.INK, shade=H.shade, prism=H.prism, seg=H.seg, PI=Math.PI;
var Cy=THREE.CylinderGeometry,Bx=THREE.BoxGeometry,Sp=THREE.SphereGeometry,Co=THREE.ConeGeometry,To=THREE.TorusGeometry,Oc=THREE.OctahedronGeometry,Ic=THREE.IcosahedronGeometry,Do=THREE.DodecahedronGeometry;
var MB='#f3efe7', MB2='#dcd5c7', BAS='#5d616b', ICE='#dfe7ec', CRY=mat('#7fe0ff',0,0.06), RUNE=mat('#7ff0ff',0,0.1), VIO=mat('#b78cff',0,0.08);
function plinth(L,r,c,c2){ L.push(P(new Cy(r+0.06,r+0.12,0.12,24),c||K.stoneD,0,0.06,0),P(new Cy(r+0.02,r+0.05,0.08,24),c2||K.stone2,0,0.16,0)); }
function shaft(L,rb,rt,y0,y1,c,n,step,rot,lc){ L.push(P(new Cy(rt,rb,y1-y0,n||20),c,0,(y0+y1)/2,0,1,1,1,0,rot||0,0));
  if(step) for(var y=y0+step;y<y1-0.08;y+=step){ var r=rb+(rt-rb)*(y-y0)/(y1-y0); L.push(P(new Cy(r+0.014,r+0.014,0.03,n||20),lc||K.stone2,0,y,0,1,1,1,0,rot||0,0)); } }
function rAt(rb,rt,y0,y1,y){ return rb+(rt-rb)*(y-y0)/(y1-y0); }
function onR(L,geo,c,r,y,a){ L.push(P(geo,c,Math.sin(a)*r,y,Math.cos(a)*r,1,1,1,0,a,0)); }
function slit(L,r,y,a,lc){ onR(L,new Bx(0.07,0.2,0.04),INK,r,y,a); onR(L,new Bx(0.13,0.035,0.05),lc||K.stone2,r+0.005,y+0.12,a); }
function win(L,r,y,a,glow){ onR(L,new Bx(0.12,0.18,0.04),glow||INK,r,y,a); L.push(P(new Cy(0.06,0.06,0.04,10,1,false,-PI/2,PI),glow||INK,Math.sin(a)*r,y+0.09,Math.cos(a)*r,1,1,1,-PI/2,a,0)); }
function door(L,r,w,h,y0,c,fc){ y0=y0||0.2; L.push(P(new Bx(w+0.06,h,0.04),fc||K.stone2,0,y0+h/2,r-0.005),P(new Cy(w/2+0.03,w/2+0.03,0.04,12,1,false,-PI/2,PI),fc||K.stone2,0,y0+h,r-0.005,1,1,1,-PI/2,0,0),
  P(new Bx(w,h,0.05),c||K.woodD,0,y0+h/2,r),P(new Cy(w/2,w/2,0.05,12,1,false,-PI/2,PI),c||K.woodD,0,y0+h,r,1,1,1,-PI/2,0,0)); }
function merlons(L,r,y,n,c,sz,seg2,rot){ L.push(P(new Cy(r,r,0.12,seg2||24),c,0,y+0.06,0,1,1,1,0,rot||0,0)); for(var i=0;i<n;i++){ var a=(seg2?i:i+0.5)/n*2*PI, rr=r*(seg2?0.92:1)-0.05; L.push(P(new Bx(sz||0.16,0.14,0.11),c,Math.sin(a)*rr,y+0.19,Math.cos(a)*rr,1,1,1,0,a,0)); } }
function roof(L,r,h,y,c,n,fin,fc){ L.push(P(new Cy(r+0.03,r+0.03,0.045,n||16),fc||K.woodD,0,y,0),P(new Co(r,h,n||16),c,0,y+0.02+h/2,0)); if(fin) L.push(P(new Sp(0.05,8,6),fin,0,y+h+0.05,0),P(new Co(0.022,0.16,6),fin,0,y+h+0.16,0)); }
function turret(L,x,z,r,y0,y1,c,rc,lc,fin){ L.push(P(new Cy(r,r*1.1,y1-y0,14),c,x,(y0+y1)/2,z),P(new Cy(r*1.18,r,0.1,14),lc,x,y1-0.02,z)); for(var i=0;i<6;i++){ var a=i/6*2*PI; L.push(P(new Bx(0.08,0.1,0.06),c,x+Math.sin(a)*r*1.1,y1+0.08,z+Math.cos(a)*r*1.1,1,1,1,0,a,0)); }
  L.push(P(new Co(r*1.3,r*2.3,14),rc,x,y1+0.1+r*1.15,z)); if(fin) L.push(P(new Oc(0.05,0),fin,x,y1+0.12+r*2.3+0.05,z,1,1.6,1)); L.push(P(new Bx(0.05,0.12,0.03),INK,x+0.0,(y0+y1)/2+0.1,z+r*1.05)); }
function bannerOn(L,r,y,a,c,trim){ onR(L,new Bx(0.2,0.44,0.02),c,r,y,a); onR(L,new Bx(0.2,0.05,0.025),trim,r+0.004,y-0.2,a); onR(L,new Bx(0.24,0.03,0.03),K.woodD,r+0.006,y+0.23,a); }
function gable(L,x,y,z,w,d,ph,wc,rc,alongX){ var half=(alongX?d:w)/2, rh=half*Math.tan(ph), sl=(half+0.08)/Math.cos(ph), len=(alongX?w:d)+0.12;
  L.push(P(prism(alongX?d:w,rh,alongX?w:d,alongX),wc,x,y,z));
  [-1,1].forEach(function(s){ var cy=y+rh-(sl/2)*Math.sin(ph)+0.02, off=(sl/2)*Math.cos(ph);
    if(alongX) L.push(P(new Bx(len,0.045,sl),rc,x,cy,z+s*off,1,1,1,s*ph,0,0)); else L.push(P(new Bx(sl,0.045,len),rc,x+s*off,cy,z,1,1,1,0,0,-s*ph)); });
  L.push(alongX?P(new Bx(len,0.05,0.06),shade(rc,0.8),x,y+rh+0.035,z):P(new Bx(0.06,0.05,len),shade(rc,0.8),x,y+rh+0.035,z)); return rh; }
function logs(L,r,y0,y1,n,c){ for(var i=0;i<n;i++){ var a=i/n*2*PI, hh=y1-y0+(i%2?0.06:0); L.push(P(new Cy(0.065,0.07,hh,7),c||K.wood,Math.sin(a)*r,y0+hh/2,Math.cos(a)*r),P(new Co(0.065,0.12,7),c||K.wood,Math.sin(a)*r,y0+hh+0.06,Math.cos(a)*r)); } }
function rail(L,s,y,c){ [[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1],[-1,0],[1,0]].forEach(function(o){ L.push(P(new Cy(0.022,0.022,0.3,6),c,o[0]*s,y+0.15,o[1]*s)); });
  L.push(P(new Bx(s*2,0.04,0.04),c,0,y+0.28,s),P(new Bx(s*2,0.04,0.04),c,0,y+0.28,-s),P(new Bx(0.04,0.04,s*2),c,s,y+0.28,0),P(new Bx(0.04,0.04,s*2),c,-s,y+0.28,0)); }

/* ---------- ゆみの タワー ---------- */
function arrow(L,lv,h){
  if(lv===1){ L.push(P(new Cy(0.72,0.8,0.1,10),K.stoneD,0,0.05,0));
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(o){ L.push(seg([o[0]*0.44,0.08,o[1]*0.44],[o[0]*0.36,h+0.03,o[1]*0.36],0.07,0.06,K.wood,8)); });
    [-1,1].forEach(function(s){ L.push(seg([-0.42,0.3,s*0.42],[0.38,h*0.72,s*0.38],0.03,0.03,K.woodD),seg([0.42,0.3,s*0.42],[-0.38,h*0.72,s*0.38],0.03,0.03,K.woodD),seg([s*0.42,0.3,-0.42],[s*0.38,h*0.72,0.38],0.03,0.03,K.woodD)); });
    L.push(P(new Bx(1.0,0.1,1.0),K.wood,0,h+0.07,0)); for(var i=0;i<5;i++) L.push(P(new Bx(1.02,0.012,0.02),K.woodD,0,h+0.121,-0.4+i*0.2));
    rail(L,0.48,h+0.12,K.woodD); [-1,1].forEach(function(s){ L.push(seg([s*0.13,0.06,0.72],[s*0.12,h+0.08,0.5],0.022,0.022,K.woodD)); }); for(var r=1;r<6;r++) L.push(P(new Bx(0.24,0.025,0.03),K.wood,0,0.06+r*(h/6),0.72-r*(0.22/6)));
    L.push(P(new Cy(0.015,0.015,0.6,5),K.woodD,0.46,h+0.5,-0.46),P(new Bx(0.02,0.18,0.26),K.blue,0.46,h+0.68,-0.33));
    return; }
  var st=lv>=5?MB:K.stone, lc=lv>=5?MB2:K.stone2, rc=lv>=5?K.gold:lv>=4?'#2e4f78':K.blue, tr=lv>=5?K.gold:lv>=4?K.brass:K.woodD, rr=0.5;
  plinth(L,0.62,lv>=5?MB2:null,lc); shaft(L,0.62,rr,0.2,h,st,20,0.34,0,lc); door(L,0.61,0.2,0.3,0.2,null,lc);
  slit(L,0.56,h*0.55,PI*0.3,lc); slit(L,0.56,h*0.55,-PI*0.3,lc); slit(L,0.54,h*0.72,PI,lc);
  L.push(P(new Cy(0.72,rr,0.18,20),lc,0,h-0.05,0),P(new Cy(0.74,0.74,0.08,20),lv>=5?MB2:K.wood,0,h+0.08,0)); merlons(L,0.74,h+0.12,10,st);
  for(var i=0;i<4;i++){ var a=PI/4+i*PI/2; L.push(P(new Cy(0.035,0.035,0.92,6),lv>=5?K.gold:K.wood,Math.sin(a)*0.62,h+0.58,Math.cos(a)*0.62)); }
  var rr2=0.9+(lv-2)*0.04, rh=0.8+(lv-2)*0.12; roof(L,rr2,rh,h+1.04,rc,lv>=3?16:12,lv>=3?null:K.gold,tr);
  if(lv>=3){ [-1,1].forEach(function(s){ turret(L,s*0.62,0.08,0.2,0.2,h*0.66,st,rc,lc,lv>=4?(lv>=5?K.gold:CRY):null); }); bannerOn(L,rAt(0.62,rr,0.2,h,h-0.45)+0.01,h-0.45,0,lv>=5?'#24407a':K.blue,K.gold);
    for(var d=0;d<4;d++){ var da=d/4*2*PI+PI/4; L.push(P(prism(0.18,0.16,0.14),rc,Math.sin(da)*(rr2*0.62),h+1.06+rh*0.3,Math.cos(da)*(rr2*0.62),1,1,1,0,da,0)); } }
  if(lv>=4){ L.push(P(new Cy(0.62,0.6,0.07,20),lc,0,h*0.48,0)); for(var c=0;c<10;c++){ var ca=c/10*2*PI; L.push(P(new Bx(0.06,0.08,0.06),lc,Math.sin(ca)*0.6,h*0.48-0.06,Math.cos(ca)*0.6,1,1,1,0,ca,0)); } }
  if(lv>=5){ L.push(P(new Cy(0.6,0.6,0.04,20),K.gold,0,h*0.3,0),P(new To(0.74,0.02,6,32),K.gold,0,h+0.12,0,1,1,1,PI/2,0,0)); }
}
/* ---------- たいほう ---------- */
function cannon(L,lv,h){ var hh=h*0.7, R8=PI/8;
  if(lv===1){ L.push(P(new Cy(0.82,0.92,0.12,16),'#8a6a48',0,0.06,0),P(new Cy(0.74,0.82,hh-0.1,16),'#8a6a48',0,0.12+(hh-0.1)/2,0)); logs(L,0.86,0.1,hh+0.12,18);
    L.push(P(new Cy(0.76,0.76,0.06,16),K.wood,0,hh+0.07,0)); for(var i=0;i<12;i++){ var a=i/12*2*PI; L.push(P(new Sp(0.14,8,6),'#cdb98a',Math.sin(a)*0.66,hh+0.14,Math.cos(a)*0.66,1,0.55,0.8,0,a,0)); }
    L.push(P(new Bx(0.24,0.18,0.18),K.wood,0.7,0.2,0.62),P(new Bx(0.26,0.03,0.2),K.woodD,0.7,0.3,0.62)); return; }
  var st=lv>=5?BAS:K.stone, lc=lv>=5?'#7a7f89':K.stone2, ac=lv>=5?K.gold:K.red;
  plinth(L,0.9,lv>=5?'#45484f':null,lc); shaft(L,0.97,0.88,0.2,hh,st,8,0.28,R8,lc); door(L,0.87,0.22,0.28,0.2,null,lc);
  [PI/4,-PI/4,PI].forEach(function(b){ onR(L,new Bx(0.2,0.14,0.05),INK,0.84,hh*0.62,b); onR(L,new Bx(0.24,0.03,0.06),lc,0.845,hh*0.62+0.09,b); });
  L.push(P(new Cy(1.02,0.89,0.14,8),lc,0,hh-0.02,0,1,1,1,0,R8,0),P(new Cy(1.02,1.02,0.07,8),lc,0,hh+0.065,0,1,1,1,0,R8,0)); merlons(L,1.02,hh+0.1,8,st,0.3,8,R8);
  if(lv>=3){ for(var i=0;i<4;i++){ var a=R8+i*PI/2+PI/4; L.push(P(new Cy(0.15,0.1,0.3,10),st,Math.sin(a)*1.02,hh-0.05,Math.cos(a)*1.02),P(new Co(0.2,0.32,10),ac,Math.sin(a)*1.02,hh+0.26,Math.cos(a)*1.02)); }
    bannerOn(L,0.86,hh*0.45,PI/4,lv>=5?'#1b1b22':K.red,K.gold); bannerOn(L,0.86,hh*0.45,-PI/4,lv>=5?'#1b1b22':K.red,K.gold); }
  if(lv>=4){ [0.35,0.72].forEach(function(t){ L.push(P(new Cy(0.95-t*0.08,0.95-t*0.08,0.05,8),lv>=5?K.gold:K.iron,0,hh*t,0,1,1,1,0,R8,0)); });
    [[0,0],[0.17,0],[0.085,0],[0.085,0.14]].forEach(function(o,j){ L.push(P(new Sp(0.08,10,8),K.iron,-0.95+o[0],0.08+(j===3?0.12:0)+(j===2?0.0:0),0.75+o[1])); }); L.push(P(new Bx(0.26,0.2,0.2),K.wood,0.95,0.12,0.7)); }
  if(lv>=5){ for(var v=0;v<3;v++){ var va=PI*0.75+v*PI*0.25; onR(L,new Bx(0.14,0.08,0.05),'#ff8a2a',0.82,0.42,va); } }
}
/* ---------- まほう ---------- */
function magic(L,lv,h){
  if(lv===1){ L.push(P(new Cy(0.72,0.8,0.14,16),K.stoneD,0,0.07,0),P(new Cy(0.55,0.6,0.1,16),K.stone2,0,0.19,0));
    for(var i=0;i<4;i++){ var a=PI/4+i*PI/2, sh=0.5+(i%2)*0.14; L.push(P(new Bx(0.17,sh,0.11),'#8f8a9c',Math.sin(a)*0.64,0.14+sh/2,Math.cos(a)*0.64,1,1,1,Math.cos(a)*0.08,a,-Math.sin(a)*0.08)); onR(L,new Bx(0.05,0.18,0.012),RUNE,0.7,0.14+sh*0.55,a); }
    L.push(P(new Cy(0.11,0.15,h-0.24,8),K.stone2,0,0.24+(h-0.24)/2,0),P(new Cy(0.2,0.12,0.1,8),K.stone,0,h,0));
    for(var c=0;c<3;c++){ var ca=c/3*2*PI; L.push(P(new Co(0.04,0.34,6),K.indigo,Math.sin(ca)*0.15,h+0.18,Math.cos(ca)*0.15,1,1,1,Math.cos(ca)*0.35,0,-Math.sin(ca)*0.35)); }
    return; }
  var st=lv>=5?MB:K.stone, lc=lv>=5?MB2:K.stone2, ac=lv>=5?K.gold:K.indigo, rt=0.36+(lv-2)*0.02;
  plinth(L,0.58,lv>=5?MB2:null,lc); shaft(L,0.5,rt,0.2,h,st,16,0.4,0,lc); door(L,0.49,0.18,0.26,0.2,lv>=5?'#3b2f6e':null,lc);
  win(L,0.46,h*0.48,PI*0.75,lv>=4?RUNE:null); win(L,0.46,h*0.48,-PI*0.75,lv>=4?RUNE:null); win(L,rAt(0.5,rt,0.2,h,h*0.78)+0.01,h*0.78,0,lv>=4?RUNE:null);
  L.push(P(new Cy(0.47,0.47,0.05,16),ac,0,h*0.4,0),P(new Cy(0.52,rt,0.18,16),lc,0,h,0),P(new Cy(0.54,0.54,0.05,16),ac,0,h+0.1,0));
  for(var i=0;i<4;i++){ var a=PI/4+i*PI/2; L.push(P(new Co(0.06,0.58,6),ac,Math.sin(a)*0.46,h+0.4,Math.cos(a)*0.46,1,1,1,Math.cos(a)*0.32,0,-Math.sin(a)*0.32),P(new Oc(0.05,0),lv>=4?CRY:K.gold,Math.sin(a)*0.56,h+0.7,Math.cos(a)*0.56,1,1.5,1)); }
  if(lv>=3){ L.push(P(new Cy(0.15,0.17,h*0.55,12),st,0.44,0.2+h*0.275,-0.2),P(new Cy(0.21,0.21,0.03,12),lc,0.44,0.2+h*0.55,-0.2),P(new Co(0.21,0.4,12),ac,0.44,0.2+h*0.55+0.22,-0.2));
    L.push(P(new Cy(0.62,0.5,0.08,16),lc,0,h*0.62,0)); for(var b=0;b<3;b++) L.push(P(new To(0.78,0.025,6,20,PI*0.42),lv>=5?K.gold:VIO,0,h+0.9,0,1,1,1,PI/2,0,b*2*PI/3)); }
  if(lv>=4){ L.push(P(new Cy(0.13,0.15,h*0.42,12),st,-0.42,0.2+h*0.21,0.16),P(new Co(0.19,0.34,12),ac,-0.42,0.2+h*0.42+0.17,0.16)); for(var r=0;r<4;r++){ var ra=r/4*2*PI+0.4; L.push(P(new Oc(0.07,0),VIO,Math.sin(ra)*0.85,h*0.5+(r%2)*0.25,Math.cos(ra)*0.85,0.8,1.6,0.8)); } }
  if(lv>=5) L.push(P(new Cy(0.5,0.5,0.04,16),K.gold,0,h*0.2,0),P(new To(0.54,0.02,6,24),K.gold,0,h+0.12,0,1,1,1,PI/2,0,0));
}
/* ---------- こおり ---------- */
function ice(L,lv,h){ var R6=PI/6;
  if(lv===1){ plinth(L,0.6,'#a8b6c0','#c9d4db'); L.push(P(new Cy(0.48,0.56,0.26,6),ICE,0,0.33,0,1,1,1,0,R6,0),P(new Cy(0.2,0.24,h-0.66,6),ICE,0,0.46+(h-0.66)/2,0,1,1,1,0,R6,0),P(new Cy(0.38,0.22,0.16,6),K.iceD,0,h-0.12,0,1,1,1,0,R6,0));
    L.push(P(new Oc(0.12,0),K.ice,0,h+0.08,0,0.8,1.8,0.8),P(new Oc(0.08,0),K.ice,0.13,h,0.05,0.8,1.6,0.8,0,0,-0.5),P(new Oc(0.08,0),K.ice,-0.12,h,-0.05,0.8,1.6,0.8,0,0,0.5));
    for(var i=0;i<3;i++){ var a=i/3*2*PI+0.3; L.push(P(new Sp(0.14,8,6),'#ffffff',Math.sin(a)*0.5,0.46,Math.cos(a)*0.5,1,0.35,1)); } return; }
  var st=lv>=5?MB:ICE, lc=lv>=5?K.gold:K.iceD, tp=h*0.8;
  plinth(L,0.62,lv>=5?MB2:'#a8b6c0',lv>=5?MB:'#c9d4db'); shaft(L,0.54,0.42,0.2,tp,st,6,0.4,R6,lv>=5?MB2:'#c9d4db'); door(L,0.47,0.18,0.26,0.2,'#4f7f9e',lv>=5?MB2:'#c9d4db');
  L.push(P(new Cy(0.5,0.44,0.1,6),lc,0,tp,0,1,1,1,0,R6,0),P(new Cy(0.26,0.22,0.14,6),K.ice,0,tp+0.1,0,1,1,1,0,R6,0));
  for(var i=0;i<6;i++){ var a=i*PI/3, sl=0.55+(lv-2)*0.1; L.push(P(new Co(0.08,sl,6),K.ice,Math.sin(a)*0.36,tp+0.08+sl/2,Math.cos(a)*0.36,1,1,1,Math.cos(a)*0.35,0,-Math.sin(a)*0.35)); }
  if(lv>=3){ for(var b=0;b<3;b++){ var ba=b/3*2*PI+0.5; L.push(P(new Oc(0.16,0),K.ice,Math.sin(ba)*0.72,0.5,Math.cos(ba)*0.72,0.75,3.2,0.75,Math.cos(ba)*0.25,0,-Math.sin(ba)*0.25),P(new Oc(0.09,0),K.iceD,Math.sin(ba+0.35)*0.8,0.28,Math.cos(ba+0.35)*0.8,0.8,2.2,0.8)); }
    L.push(P(new Cy(0.53,0.53,0.06,6),lc,0,h*0.45,0,1,1,1,0,R6,0)); }
  if(lv>=4){ for(var r=0;r<5;r++){ var ra=r/5*2*PI; L.push(P(new Oc(0.07,0),CRY,Math.sin(ra)*0.72,tp+0.5+(r%2)*0.15,Math.cos(ra)*0.72,0.8,1.8,0.8)); } }
  if(lv>=5) for(var g=0;g<6;g++){ var ga=g*PI/3; L.push(P(new Sp(0.03,6,5),K.gold,Math.sin(ga)*0.48,tp+0.7+0.2,Math.cos(ga)*0.48)); }
}
/* ---------- しせつ ---------- */
function farm(L,lv){ L.push(P(new Bx(1.05,0.08,0.95),'#7a5236',-0.28,0.1,0.25));
  for(var r=0;r<3;r++){ var z=-0.05+r*0.3, n=3+lv; L.push(P(new Bx(0.95,0.05,0.13),'#5f3f28',-0.28,0.15,z));
    for(var i=0;i<n;i++){ var x=-0.68+i*(0.8/(n-1)); if(lv===1) L.push(P(new Co(0.045,0.14,6),'#6aa84f',x,0.24,z)); else if(lv===2) L.push(P(new Ic(0.075,0),'#5a9e45',x,0.24,z),P(new Sp(0.03,6,5),'#e0533a',x+0.03,0.28,z-0.03)); else L.push(P(new Cy(0.01,0.01,0.28,4),'#9c8a3c',x,0.31,z),P(new Sp(0.04,6,5),'#e2b84a',x,0.47,z,1,1.8,1)); } }
  for(var p=0;p<5;p++) L.push(P(new Bx(0.05,0.22,0.05),K.wood,-0.78+p*0.25,0.17,0.78)); L.push(P(new Bx(1.06,0.035,0.03),K.wood,-0.28,0.2,0.78),P(new Bx(1.06,0.035,0.03),K.wood,-0.28,0.12,0.78));
  if(lv===1){ L.push(P(new Cy(0.02,0.02,0.7,5),K.woodD,0.45,0.35,-0.2),P(new Bx(0.4,0.03,0.03),K.woodD,0.45,0.5,-0.2),P(new Sp(0.08,10,8),'#e6d3a3',0.45,0.72,-0.2),P(new Cy(0.14,0.14,0.02,12),'#b8963c',0.45,0.78,-0.2),P(new Co(0.08,0.1,10),'#b8963c',0.45,0.84,-0.2),P(new Bx(0.18,0.2,0.08),'#8a5a8a',0.45,0.45,-0.2)); return; }
  L.push(P(new Bx(0.62,0.44,0.56),K.red,0.5,0.3,-0.4)); gable(L,0.5,0.52,-0.4,0.62,0.56,0.7,K.red,'#4a3a33',false);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(o){ L.push(P(new Bx(0.04,0.44,0.04),K.cream,0.5+o[0]*0.3,0.3,-0.4+o[1]*0.27)); });
  L.push(P(new Bx(0.24,0.3,0.03),K.cream,0.5,0.23,-0.11),P(new Bx(0.2,0.26,0.035),'#7a2a22',0.5,0.23,-0.11),P(new Bx(0.26,0.025,0.04),K.cream,0.5,0.23,-0.1,1,1,1,0,0,0.85),P(new Bx(0.26,0.025,0.04),K.cream,0.5,0.23,-0.1,1,1,1,0,0,-0.85));
  L.push(P(new Cy(0.15,0.19,0.24,12),'#d9b45a',0.78,0.2,0.55),P(new Sp(0.15,12,6,0,2*PI,0,PI/2),'#d9b45a',0.78,0.32,0.55));
  if(lv>=3){ var wx=-0.7, wz=-0.5; L.push(P(new Cy(0.15,0.24,0.95,10),K.cream,wx,0.55,wz),P(new Co(0.22,0.32,10),'#4a3a33',wx,1.18,wz),P(new Cy(0.04,0.04,0.12,8),K.woodD,wx,0.98,wz+0.2,1,1,1,PI/2,0,0));
    for(var bl=0;bl<4;bl++){ var a=bl*PI/2+0.3; L.push(P(new Bx(0.035,0.6,0.02),K.woodD,wx+Math.sin(a)*0.3,0.98+Math.cos(a)*0.3,wz+0.27,1,1,1,0,0,-a),P(new Bx(0.13,0.42,0.012),K.cream,wx+Math.sin(a)*0.33+Math.cos(a)*0.07,0.98+Math.cos(a)*0.33-Math.sin(a)*0.07,wz+0.28,1,1,1,0,0,-a)); }
    L.push(P(new Bx(0.1,0.18,0.03),INK,wx,0.2,wz+0.21)); } }
function lab(L,lv){
  if(lv===1){ plinth(L,0.42); L.push(P(new Cy(0.42,0.45,0.5,16),K.stone,0,0.45,0),P(new Cy(0.48,0.48,0.06,16),K.wood,0,0.73,0),P(new Co(0.5,0.3,16),K.teal,0,0.91,0)); door(L,0.44,0.18,0.24);
    L.push(seg([0.62,0.05,0.25],[0.6,0.5,0.3],0.015,0.015,K.woodD),seg([0.75,0.05,0.4],[0.6,0.5,0.3],0.015,0.015,K.woodD),seg([0.5,0.05,0.45],[0.6,0.5,0.3],0.015,0.015,K.woodD),P(new Cy(0.045,0.06,0.42,10),K.brass,0.6,0.62,0.22,1,1,1,-0.8,0,0));
    L.push(P(new Bx(0.24,0.2,0.2),K.wood,-0.6,0.1,0.42),P(new Bx(0.18,0.16,0.18),K.wood,-0.62,0.28,0.4)); return; }
  var lh=0.75+lv*0.15; plinth(L,0.6); shaft(L,0.6,0.58,0.2,lh,K.stone,20,0.3); door(L,0.6,0.2,0.28); win(L,0.6,lh*0.62,PI*0.35,K.glass); win(L,0.6,lh*0.62,-PI*0.35,K.glass);
  L.push(P(new Cy(0.63,0.63,0.06,20),K.brass,0,lh,0),P(new Sp(0.6,20,10,0,2*PI,0,PI/2),K.teal,0,lh+0.02,0)); for(var i=0;i<4;i++) L.push(P(new To(0.605,0.012,4,24,PI),K.brass,0,lh+0.02,0,1,1,1,0,i*PI/4,0));
  var tl=lv>=3?1.0:0.7; L.push(P(new Cy(0.07,0.11,tl,12),K.brass,0.12,lh+0.3+tl*0.18,-0.18,1,1,1,-0.7,0,0),P(new Cy(0.08,0.08,0.03,12),K.glass,0.12,lh+0.3+tl*0.5,-0.18-tl*0.32,1,1,1,-0.7,0,0));
  L.push(P(new Bx(0.46,0.36,0.46),K.stone,-0.72,0.26,0.25),P(new Bx(0.52,0.05,0.52),K.stone2,-0.72,0.46,0.25));
  [['#a855f7',-0.85],['#22c55e',-0.72],['#f97316',-0.59]].forEach(function(f){ L.push(P(new Sp(0.06,8,6),mat(f[0],0,0.1),f[1],0.54,0.25),P(new Cy(0.02,0.02,0.08,6),K.glass,f[1],0.62,0.25)); });
  if(lv>=3){ L.push(P(new Cy(0.24,0.26,0.7,14),K.stone,0.66,0.43,0.2),P(new Sp(0.26,14,8,0,2*PI,0,PI/2),K.teal,0.66,0.78,0.2),P(new Cy(0.01,0.01,0.34,4),K.gold,0,lh+0.75,0),P(new Oc(0.06,0),K.gold,0,lh+0.95,0),P(new To(0.64,0.02,6,24),K.gold,0,lh+0.02,0,1,1,1,PI/2,0,0)); } }
function forge(L,lv){
  if(lv===1){ L.push(P(new Bx(1.2,0.06,1.0),K.stoneD,0,0.03,0)); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(o){ L.push(P(new Cy(0.035,0.035,0.75,6),K.wood,o[0]*0.5,0.4,o[1]*0.38)); });
    L.push(P(new Bx(1.16,0.05,0.92),K.slate,0,0.8,0,1,1,1,0.18,0,0),P(new Do(0.24,0),K.stone2,0.3,0.24,-0.2,1.1,1,1),P(new Bx(0.14,0.1,0.06),'#ff8a2a',0.3,0.2,0.02),P(new Bx(0.16,0.7,0.16),K.stone2,0.3,0.6,-0.25));
    L.push(P(new Cy(0.12,0.14,0.16,10),K.wood,-0.25,0.14,0.1),P(new Bx(0.12,0.08,0.1),K.iron,-0.25,0.26,0.1),P(new Bx(0.26,0.06,0.13),K.iron,-0.25,0.33,0.1),P(new Co(0.05,0.12,8),K.iron,-0.44,0.33,0.1,1,1,1,0,0,PI/2)); return; }
  L.push(P(new Bx(1.3,0.08,1.0),K.stoneD,0,0.04,0),P(new Bx(1.1,0.5,0.8),K.stone,0,0.33,-0.05));
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(o){ L.push(P(new Bx(0.06,0.5,0.06),K.woodD,o[0]*0.55,0.33,-0.05+o[1]*0.4)); }); L.push(P(new Bx(1.12,0.05,0.82),K.woodD,0,0.58,-0.05));
  gable(L,0,0.6,-0.05,1.1,0.8,0.55,K.stone,K.slate,true);
  L.push(P(new Bx(0.26,0.95,0.26),K.stone2,0.36,0.98,-0.28),P(new Bx(0.32,0.06,0.32),K.stoneD,0.36,1.46,-0.28));
  L.push(P(new Bx(0.36,0.28,0.04),INK,0.22,0.3,0.36),P(new Bx(0.28,0.12,0.045),'#ff8a2a',0.22,0.22,0.365),P(new Bx(0.22,0.34,0.04),K.woodD,-0.25,0.25,0.36));
  L.push(P(new Cy(0.12,0.14,0.16,10),K.wood,-0.6,0.16,0.62),P(new Bx(0.12,0.08,0.1),K.iron,-0.6,0.28,0.62),P(new Bx(0.26,0.06,0.13),K.iron,-0.6,0.35,0.62),P(new Co(0.05,0.12,8),K.iron,-0.79,0.35,0.62,1,1,1,0,0,PI/2));
  if(lv>=3){ L.push(P(new Bx(0.24,1.15,0.24),K.stone2,-0.34,1.08,-0.3),P(new Bx(0.3,0.06,0.3),K.stoneD,-0.34,1.66,-0.3));
    L.push(P(new To(0.32,0.04,6,20),K.wood,0.72,0.36,0.05,1,1,1,0,PI/2,0)); for(var p=0;p<8;p++){ var a=p/8*2*PI; L.push(P(new Bx(0.12,0.08,0.03),K.woodD,0.74,0.36+Math.cos(a)*0.32,0.05+Math.sin(a)*0.32,1,1,1,-a,0,0)); }
    L.push(P(new Cy(0.11,0.11,0.24,12),K.wood,0.62,0.16,0.62),P(new Cy(0.11,0.11,0.24,12),K.wood,0.4,0.16,0.68),P(new Bx(0.04,0.04,0.3),K.woodD,-0.45,0.5,0.5),P(new Cy(0.11,0.11,0.03,16),K.gold,-0.45,0.38,0.64,1,1,1,PI/2,0,0)); } }
function church(L,lv){
  if(lv===1){ L.push(P(new Bx(0.9,0.06,1.1),K.stoneD,0,0.03,0),P(new Bx(0.6,0.5,0.8),K.cream,0,0.31,0)); gable(L,0,0.56,0,0.6,0.8,0.75,K.cream,K.blue,false);
    L.push(P(new Bx(0.18,0.24,0.14),K.cream,0,0.98,0.32),P(new Bx(0.1,0.12,0.15),INK,0,0.98,0.32),P(new Sp(0.035,8,6),K.gold,0,0.96,0.32),P(new Co(0.14,0.2,4),K.blue,0,1.2,0.32,1,1,1,0,PI/4,0),P(new Bx(0.02,0.12,0.02),K.gold,0,1.36,0.32));
    door(L,0.405,0.16,0.22,0.06); return; }
  var nh=0.55+lv*0.08, th=0.9+lv*0.2; L.push(P(new Bx(1.1,0.08,1.5),K.stoneD,0,0.04,-0.05));
  L.push(P(new Bx(0.74,nh,1.0),K.cream,0,0.08+nh/2,-0.25)); gable(L,0,0.08+nh,-0.25,0.74,1.0,0.75,K.cream,K.blue,false);
  [-1,1].forEach(function(s){ [-0.5,-0.1].forEach(function(z){ L.push(P(new Bx(0.03,0.24,0.12),K.glass,s*0.37,0.08+nh*0.55,z)); }); });
  var tw=function(x,w2,t2){ L.push(P(new Bx(w2,t2,w2),K.cream,x,0.08+t2/2,0.45),P(new Bx(w2+0.04,0.04,w2+0.04),K.stone2,x,0.08+t2*0.5,0.45),P(new Bx(w2+0.06,0.05,w2+0.06),K.stone2,x,0.08+t2,0.45),
    P(new Bx(w2*0.45,0.2,w2+0.02),INK,x,t2-0.12,0.45),P(new Bx(w2+0.02,0.2,w2*0.45),INK,x,t2-0.12,0.45),P(new Co(w2*0.8,0.72,4),K.blue,x,0.08+t2+0.38,0.45,1,1,1,0,PI/4,0),P(new Bx(0.03,0.2,0.03),K.gold,x,0.08+t2+0.84,0.45),P(new Bx(0.12,0.03,0.03),K.gold,x,0.08+t2+0.87,0.45)); };
  if(lv===2){ tw(0,0.42,th); L.push(P(new Sp(0.06,8,6),K.gold,0,th-0.15,0.45)); }
  else { tw(-0.3,0.34,th); tw(0.3,0.34,th); L.push(P(new Bx(0.3,nh+0.1,0.3),K.cream,0,0.13+nh/2,0.5),P(new Cy(0.11,0.11,0.03,18),K.glass,0,0.08+nh*0.7,0.66,1,1,1,PI/2,0,0),P(new To(0.11,0.02,5,18),K.gold,0,0.08+nh*0.7,0.67));
    [-1,1].forEach(function(s){ [-0.55,-0.05].forEach(function(z){ L.push(P(new Bx(0.12,nh*0.7,0.1),K.stone2,s*0.42,0.08+nh*0.35,z)); }); }); }
  if(lv===2) L.push(P(new Cy(0.09,0.09,0.03,16),K.glass,0,0.08+th*0.66,0.665,1,1,1,PI/2,0,0),P(new To(0.09,0.015,5,16),K.stone2,0,0.08+th*0.66,0.67));
  door(L,lv===2?0.67:0.66,0.18,0.24,0.08); }
function mine(L,lv){ var s=lv>=3?1.15:1;
  L.push(P(new Do(0.55*s,0),'#8a7a66',0,0.25,-0.35,1.4,0.9,1),P(new Do(0.38,0),'#7a6a58',-0.6,0.2,-0.15),P(new Do(0.32,0),'#9a8a74',0.62,0.18,-0.25),P(new Sp(0.2,8,6),'#6e9145',-0.2,0.66*s,-0.4,1.4,0.3,1));
  L.push(P(new Bx(0.36,0.4,0.2),INK,0,0.28,0.14),P(new Bx(0.07,0.46,0.07),K.wood,-0.21,0.31,0.24),P(new Bx(0.07,0.46,0.07),K.wood,0.21,0.31,0.24),P(new Bx(0.56,0.08,0.09),K.wood,0,0.56,0.24));
  L.push(P(new Bx(0.03,0.03,0.7),K.iron,-0.1,0.1,0.58),P(new Bx(0.03,0.03,0.7),K.iron,0.1,0.1,0.58)); for(var i=0;i<4;i++) L.push(P(new Bx(0.3,0.025,0.05),K.wood,0,0.085,0.3+i*0.17));
  L.push(P(new Bx(0.34,0.18,0.26),K.woodD,0,0.24,0.66),P(new Bx(0.36,0.03,0.28),K.iron,0,0.33,0.66)); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(o){ L.push(P(new Cy(0.055,0.055,0.04,10),K.iron,o[0]*0.17,0.13,0.66+o[1]*0.09,1,1,1,0,0,PI/2)); });
  for(var g=0;g<2+lv;g++) L.push(P(new Oc(0.06,0),K.gold,-0.1+(g%3)*0.1,0.37,0.62+Math.floor(g/3)*0.08));
  if(lv>=2){ var tp=1.25+lv*0.12; L.push(seg([-0.4,0.4,-0.3],[0,tp,-0.3],0.035,0.03,K.wood),seg([0.4,0.4,-0.3],[0,tp,-0.3],0.035,0.03,K.wood),seg([0,0.5,-0.75],[0,tp,-0.3],0.03,0.03,K.wood),P(new To(0.15,0.025,6,16),K.iron,0,tp,-0.26),P(new Cy(0.015,0.015,tp-0.6,4),INK,0.15,tp/2+0.25,-0.26)); }
  if(lv>=3){ L.push(P(new Sp(0.05,8,6),mat('#ffd36b',0,0.2),0.3,0.5,0.3),P(new Cy(0.04,0.06,0.04,8),K.iron,0.3,0.56,0.3),P(new Do(0.14,0),K.gold,0.62,0.12,0.45),P(new Do(0.1,0),K.gold,0.75,0.08,0.3),P(new Oc(0.07,0),CRY,0.55,0.1,0.25)); } }
TM.tower=function(type,lv,h){ var L=[];
  ({arrow:arrow,cannon:cannon,magic:magic,ice:ice,farm:farm,lab:lab,forge:forge,church:church,mine:mine}[type]||arrow)(L,lv,h);
  return M(L); };
/* ---------- タワーの あたま（うごく ぶぶん） ---------- */
function archer(lv){ var c=lv>=5?'#24407a':K.blue, F=H.fig({c1:c,w:0.9,x:H.hood(lv>=3?'#1f3557':'#2f557a',0.84,0.22).concat([P(new Bx(0.05,0.05,0.42),K.wood,0.1,0.38,-0.22),P(new Bx(lv>=3?0.6:0.5,0.03,0.04),lv>=5?K.gold:K.woodD,0.1,0.4,-0.4),P(new Cy(0.004,0.004,0.5,3),'#efe9dc',0.1,0.4,-0.36,1,1,1,0,0,PI/2)])});
  [-1,1].forEach(function(s){ var lg=H.leg('#2e3550'); lg.translate(s*H.HX,H.HY,0); F.push(lg); }); var g=M(F); g.scale(0.72,0.72,0.72); return g; }
TM.head=function(type,lv){ var L=[];
  if(type==='arrow') return archer(lv);
  if(type==='cannon'){ var band=lv>=5?K.gold:lv>=3?K.brass:K.iron;
    function barrel(x,bl,rb,rm,tilt){ var th=PI/2+tilt, cy=0.36, cz=-0.08, dy=Math.sin(tilt), dz=-Math.cos(tilt);
      L.push(P(new Cy(rb,rm,bl,16),K.iron,x,cy,cz,1,1,1,th,0,0),P(new To(rm+0.01,0.03,6,16),band,x,cy+dy*bl/2,cz+dz*bl/2,1,1,1,tilt,0,0),P(new To((rb+rm)/2+0.01,0.024,6,16),band,x,cy,cz,1,1,1,tilt,0,0),P(new Sp(rb*0.8,10,8),K.iron,x,cy-dy*bl/2,cz-dz*bl/2)); }
    L.push(P(new Bx(0.5,0.1,0.56),K.woodD,0,0.05,0),P(new Bx(0.07,0.24,0.5),K.wood,-0.22,0.22,0.02),P(new Bx(0.07,0.24,0.5),K.wood,0.22,0.22,0.02));
    [-1,1].forEach(function(s){ [-0.17,0.17].forEach(function(z){ L.push(P(new Cy(0.11,0.11,0.05,14),K.woodD,s*0.29,0.11,z,1,1,1,0,0,PI/2),P(new Cy(0.04,0.04,0.06,8),band,s*0.29,0.11,z,1,1,1,0,0,PI/2)); }); });
    if(lv===1) barrel(0,0.36,0.17,0.2,0.9); else if(lv<=3) barrel(0,0.7+lv*0.1,0.15+lv*0.015,0.11+lv*0.012,0.2); else { barrel(-0.12,0.95,0.13,0.1,0.2); barrel(0.12,0.95,0.13,0.1,0.2); }
    if(lv>=5) L.push(P(new Oc(0.06,0),K.gold,0,0.5,0.15)); }
  else if(type==='magic'){ var r=0.2+lv*0.03; L.push(P(new Ic(r,1),K.orb),P(new To(r+0.1,0.016,6,32),K.gold,0,0,0,1,1,1,PI/2,0,0)); if(lv>=2) L.push(P(new To(r+0.16,0.012,6,32),K.gold,0,0,0,1,1,1,PI/2+0.5,0,0.4)); if(lv>=4) L.push(P(new To(r+0.22,0.012,6,32),VIO,0,0,0,1,1,1,PI/2-0.6,0,-0.5)); }
  else { var s=0.18+lv*0.03; L.push(P(new Oc(s,0),K.ice,0,0,0,0.75,1.9,0.75)); if(lv>=2) L.push(P(new Oc(s*0.55,0),K.iceD,s*0.75,-0.12,0.05,0.7,1.7,0.7,0,0,-0.45),P(new Oc(s*0.5,0),K.iceD,-s*0.7,-0.14,-0.06,0.7,1.6,0.7,0,0,0.5));
    if(lv>=4) L.push(P(new Oc(s*0.45,0),K.ice,0.02,-0.1,s*0.7,0.7,1.6,0.7,0.5,0,0)); L.push(P(new To(0.3,0.02,6,24),lv>=5?K.gold:K.steel,0,-s*1.4,0,1,1,1,PI/2,0,0)); }
  return M(L); };
})();
