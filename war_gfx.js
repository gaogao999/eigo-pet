/* えいごウォー の え（Three.js）— うみ・そら・はし・へいたい・ボス・エフェクト
   ゲームの しくみ（war.js）とは わけて、見た目だけ ここに まとめる。 */
(function(){
'use strict';
var G={};
var _seed=12345; function R(){ _seed=(_seed*1664525+1013904223)>>>0; return _seed/4294967296; }   // 見た目用の 乱数（ゲームの 乱数を へらさない）
function rnd(a,b){ return a+R()*(b-a); }
function hash(i){ var x=Math.sin(i*127.1+311.7)*43758.5453; return x-Math.floor(x); }

/* ---------- ジオメトリを 1つに まとめる（色つき） ---------- */
function part(geo,color,x,y,z,sx,sy,sz,rx,ry,rz){
  geo=geo.index?geo.toNonIndexed():geo;
  var q=new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0));
  geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx||1,sy||1,sz||1)));
  var n=geo.attributes.position.count, col=new Float32Array(n*3), c=new THREE.Color(color);
  for(var i=0;i<n;i++){ col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; }
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  if(geo.attributes.uv) geo.deleteAttribute('uv');
  return geo;
}
function merge(list){
  var n=0; list.forEach(function(g){ n+=g.attributes.position.count; });
  var pos=new Float32Array(n*3), nor=new Float32Array(n*3), col=new Float32Array(n*3), o=0;
  list.forEach(function(g){ pos.set(g.attributes.position.array,o*3); nor.set(g.attributes.normal.array,o*3); col.set(g.attributes.color.array,o*3); o+=g.attributes.position.count; });
  var out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.BufferAttribute(pos,3)); out.setAttribute('normal',new THREE.BufferAttribute(nor,3)); out.setAttribute('color',new THREE.BufferAttribute(col,3));
  return out;
}
G.part=part; G.merge=merge;
function canvasTex(w,h,draw,srgb){ var c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h);
  var t=new THREE.CanvasTexture(c); t.anisotropy=8; if(srgb!==false) t.encoding=THREE.sRGBEncoding; return t; }
G.canvasTex=canvasTex;

G.setup=function(renderer){
  THREE.ColorManagement.legacyMode=false;        // '#2f6fe0' などを ただしく あつかう（あせた 色に ならない）
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.NoToneMapping;
};
function sc(hex){ return new THREE.Color(hex).convertLinearToSRGB(); }   // シェーダーに そのまま わたす 色

/* ---------- そら ---------- */
var SUN=null; function sunDir(){ return SUN||(SUN=new THREE.Vector3(-0.35,0.32,-1).normalize()); }   // THREE は あとから 読みこむので つかう ときに つくる
G.sky=function(scene){
  var m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
    uniforms:{top:{value:sc('#2a78cc')},hor:{value:sc('#cbe6f5')},sun:{value:sunDir()}},
    vertexShader:'varying vec3 vDir; void main(){ vDir=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:'uniform vec3 top; uniform vec3 hor; uniform vec3 sun; varying vec3 vDir;'+
      'void main(){ float h=max(vDir.y,0.0); vec3 c=mix(hor,top,pow(h,0.55));'+
      ' float s=max(dot(normalize(vDir),sun),0.0); c+=vec3(1.0,0.93,0.75)*(pow(s,420.0)*1.2+pow(s,12.0)*0.18);'+
      ' if(vDir.y<0.0) c=hor; gl_FragColor=vec4(c,1.0); }'});
  var sky=new THREE.Mesh(new THREE.SphereGeometry(300,32,16),m); scene.add(sky); return sky;
};
G.HORIZON=0xcfe9f7;

/* ---------- うみ（なみが うごく シェーダー） ---------- */
G.sea=function(scene){
  var geo=new THREE.PlaneGeometry(520,520,140,140); geo.rotateX(-Math.PI/2);
  var m=new THREE.ShaderMaterial({fog:false,
    uniforms:{uT:{value:0},uOff:{value:0},sun:{value:sunDir()},deep:{value:sc('#0b3f78')},shal:{value:sc('#1c78c0')},hor:{value:sc('#cbe6f5')}},
    vertexShader:[
      'uniform float uT; uniform float uOff; varying vec3 vW; varying vec3 vN; varying float vFoam;',
      'float w(vec2 p,vec2 d,float f,float a,float s,inout vec2 g){ float ph=dot(p,d)*f+uT*s; g+=d*f*a*cos(ph); return a*sin(ph); }',
      'void main(){ vec3 p=position; vec2 q=vec2(p.x,p.z-uOff); vec2 g=vec2(0.0); float h=0.0;',
      ' h+=w(q,normalize(vec2(0.3,1.0)),0.18,0.35,1.3,g); h+=w(q,normalize(vec2(-0.7,0.6)),0.31,0.18,1.9,g);',
      ' h+=w(q,normalize(vec2(0.9,0.2)),0.55,0.08,2.6,g); h+=w(q,normalize(vec2(-0.2,-1.0)),0.9,0.04,3.4,g);',
      ' p.y+=h-3.0; vN=normalize(vec3(-g.x,1.0,-g.y)); vFoam=smoothstep(0.42,0.62,h);',
      ' vec4 wp=modelMatrix*vec4(p,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }'].join('\n'),
    fragmentShader:[
      'uniform vec3 sun; uniform vec3 deep; uniform vec3 shal; uniform vec3 hor; varying vec3 vW; varying vec3 vN; varying float vFoam;',
      'void main(){ vec3 v=normalize(cameraPosition-vW); vec3 n=normalize(vN);',
      ' float fr=pow(1.0-max(dot(n,v),0.0),3.0); vec3 c=mix(deep,shal,0.35+0.4*n.y*n.y);',
      ' c=mix(c,hor,fr*0.45); vec3 r=reflect(-sun,n); float sp=pow(max(dot(r,v),0.0),160.0);',
      ' c+=vec3(1.0,0.95,0.8)*sp*0.9; c=mix(c,vec3(0.9,0.96,1.0),vFoam*0.3);',
      ' float d=length(vW-cameraPosition); c=mix(c,hor,smoothstep(70.0,240.0,d)); gl_FragColor=vec4(c,1.0); }'].join('\n')});
  var sea=new THREE.Mesh(geo,m); sea.position.z=-150; scene.add(sea); return sea;
};

/* ---------- とおくの けしき（しま・とうだい・まち・ヨット） ---------- */
G.scenery=function(scene){
  var g=new THREE.Group(), P=[], C=THREE.CylinderGeometry;
  var isl=[[-95,-190,22],[120,-230,30],[-160,-260,18],[70,-150,12],[-60,-280,34]];
  isl.forEach(function(a,i){
    P.push(part(new C(a[2]*1.05,a[2]*1.15,1.5,18),'#e6d3a3',a[0],-2.8,a[1]));
    P.push(part(new THREE.DodecahedronGeometry(a[2]*0.8,1),i%2?'#3f8f4e':'#4f9a57',a[0],-2,a[1],1,0.45,0.8));
    for(var t=0;t<5;t++) P.push(part(new THREE.ConeGeometry(1.6,4.5,6),'#2f7a3e',a[0]+rnd(-a[2]*0.5,a[2]*0.5),a[2]*0.25+1,a[1]+rnd(-a[2]*0.3,a[2]*0.3)));
  });
  [['#ffffff',0],['#d9483b',2.2],['#ffffff',4.4],['#d9483b',6.6]].forEach(function(st){ P.push(part(new C(1.1-st[1]*0.05,1.2-st[1]*0.05,2.2,12),st[0],70,2+st[1],-150)); });
  for(var b=0;b<26;b++){ var h=rnd(8,34), bw=rnd(5,10);
    P.push(part(new THREE.BoxGeometry(bw,h,bw),'#'+new THREE.Color().setHSL(0.58,0.2,0.66+hash(b)*0.1).getHexString(),-60+b*6.5+rnd(-2,2),-3+h/2,-290-rnd(0,20))); }
  g.add(new THREE.Mesh(merge(P),new THREE.MeshLambertMaterial({vertexColors:true})));
  var lamp=new THREE.Mesh(new THREE.SphereGeometry(0.9,12,8),new THREE.MeshBasicMaterial({color:0xfff3b0})); lamp.position.set(70,10.6,-150); g.add(lamp);
  G.boats=[];
  for(var y=0;y<4;y++){ var boat=new THREE.Mesh(merge([part(new THREE.BoxGeometry(3.4,0.8,1.2),'#ffffff',0,0,0),part(new THREE.ConeGeometry(1.6,4.6,3),y%2?'#fef3c7':'#fda4af',0,2.6,0,1,1,0.15)]),new THREE.MeshLambertMaterial({vertexColors:true}));
    boat.position.set(y%2?rnd(24,60):-rnd(24,60),-2.6,-rnd(40,160)); boat.userData.v=rnd(0.6,1.4)*(y%2?1:-1); g.add(boat); G.boats.push(boat); }
  scene.add(g); return g;
};

/* ---------- はし ---------- */
G.roadTex=function(HW){
  var t=canvasTex(512,1024,function(g,w,h){
    g.fillStyle='#5f646c'; g.fillRect(0,0,w,h);
    for(var i=0;i<9000;i++){ var v=Math.floor(80+R()*50); g.fillStyle='rgba('+v+','+v+','+(v+4)+','+(0.25+R()*0.35)+')'; g.fillRect(R()*w,R()*h,1+R()*2,1+R()*2); }
    g.fillStyle='rgba(0,0,0,.08)'; for(var k=0;k<8;k++) g.fillRect(R()*w,R()*h,R()*120,2);   // ひび
    g.fillStyle='#f4f4f0'; g.fillRect(18,0,10,h); g.fillRect(w-28,0,10,h);                                                   // はしの 白線
    g.fillStyle='#f2c230'; for(var y=0;y<h;y+=128){ g.fillRect(w/2-6,y+20,12,70); }                                          // まんなかの 黄色
    g.fillStyle='rgba(255,255,255,.75)'; for(var y2=0;y2<h;y2+=128){ g.fillRect(w*0.26-4,y2+30,8,56); g.fillRect(w*0.74-4,y2+30,8,56); }
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1,260/16); return t;
};
G.bridge=function(scene,HW){
  var out={scroll:[]}, L=function(c){ return new THREE.MeshLambertMaterial({color:c}); };
  var roadTex=G.roadTex(HW);
  var road=new THREE.Mesh(new THREE.BoxGeometry(HW*2+1.2,0.6,260),[L(0x8d9199),L(0x8d9199),new THREE.MeshLambertMaterial({map:roadTex}),L(0x6b6f76),L(0x8d9199),L(0x8d9199)]);
  road.position.set(0,-0.3,-110); scene.add(road); out.roadTex=roadTex;
  var girder=new THREE.Mesh(new THREE.BoxGeometry(HW*2-1,1.6,260),L(0x6b7079)); girder.position.set(0,-1.3,-110); scene.add(girder);
  // コンクリートの かべ（台形の だんめん）
  var sh=new THREE.Shape(); sh.moveTo(-0.45,0); sh.lineTo(0.45,0); sh.lineTo(0.2,0.35); sh.lineTo(0.14,0.95); sh.lineTo(-0.14,0.95); sh.lineTo(-0.2,0.35); sh.closePath();
  var bgeo=new THREE.ExtrudeGeometry(sh,{depth:260,bevelEnabled:false}); bgeo.translate(0,0,-240);
  [-1,1].forEach(function(s){ var b=new THREE.Mesh(bgeo,L(0xd8d6d0)); b.position.x=s*(HW+0.25); scene.add(b); });
  // くりかえし：はんしゃ板・がいとう・はしら・タワー
  var d=new THREE.Object3D();
  function inst(geo,mat,list){ var im=new THREE.InstancedMesh(geo,mat,list.length); list.forEach(function(p,i){ d.position.set(p[0],p[1],p[2]); d.rotation.set(p[3]||0,p[4]||0,p[5]||0); d.scale.set(1,1,1); d.updateMatrix(); im.setMatrixAt(i,d.matrix); }); return im; }
  var refl=[]; for(var z=12;z>-150;z-=4){ refl.push([-(HW+0.08),0.62,z,0,0,0.26]); refl.push([HW+0.08,0.62,z,0,0,-0.26]); }
  var gr=new THREE.Group(); gr.add(inst(new THREE.BoxGeometry(0.05,0.14,0.5),new THREE.MeshBasicMaterial({color:0xffb020}),refl)); scene.add(gr); out.scroll.push({g:gr,p:4});
  var poles=[], arms=[], heads=[];
  for(var z2=12;z2>-150;z2-=24){ [-1,1].forEach(function(s){ var x=s*(HW+0.5); poles.push([x,3,z2]); arms.push([x-s*0.9,6,z2,0,0,Math.PI/2]); heads.push([x-s*1.7,5.9,z2]); }); }
  var gl=new THREE.Group(); var pm=L(0x9aa0a8);
  gl.add(inst(new THREE.CylinderGeometry(0.1,0.14,6,8),pm,poles)); gl.add(inst(new THREE.CylinderGeometry(0.07,0.07,1.8,6),pm,arms));
  gl.add(inst(new THREE.BoxGeometry(0.7,0.18,0.35),new THREE.MeshBasicMaterial({color:0xfff6d6}),heads)); scene.add(gl); out.scroll.push({g:gl,p:24});
  // はしげた（うみに たつ はしら）＋ あわ
  var pil=[], foam=[];
  for(var z3=12;z3>-150;z3-=30){ [-1,1].forEach(function(s){ pil.push([s*3.4,-2.5,z3]); foam.push([s*3.4,-2.9,z3,-Math.PI/2]); }); }
  var gp=new THREE.Group(); gp.add(inst(new THREE.BoxGeometry(2.4,4,2.4),L(0xa3a8af),pil));
  var foamTex=canvasTex(128,128,function(g,w,h){ var r=g.createRadialGradient(64,64,30,64,64,62); r.addColorStop(0,'rgba(255,255,255,0)'); r.addColorStop(0.5,'rgba(255,255,255,.85)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,w,h); });
  var fm=new THREE.MeshBasicMaterial({map:foamTex,transparent:true,depthWrite:false}); out.foamMat=fm;
  gp.add(inst(new THREE.PlaneGeometry(4.6,4.6),fm,foam)); scene.add(gp); out.scroll.push({g:gp,p:30});
  // しゃちょう橋の タワー（ときどき）— ぜんぶ 1つの メッシュに まとめる
  var P=[], Bx=THREE.BoxGeometry;
  for(var z4=-40;z4>-330;z4-=120){ [-1,1].forEach(function(s){ var x=s*(HW+1.4);
      P.push(part(new Bx(1.1,24,1.4),'#e9ebee',x,9,z4)); P.push(part(new Bx(1.4,1.2,1.7),'#d9483b',x,21.6,z4));
      for(var c=1;c<=5;c++){ [-1,1].forEach(function(dz){ var tz=z4+dz*c*6, ty=0.8, top=20-c*1.1, len=Math.hypot(c*6,top-ty);
        var ang=Math.atan2(top-ty,c*6)*(dz>0?-1:1);
        P.push(part(new Bx(0.06,0.06,len),'#f2f4f7',x,(top+ty)/2,(z4+tz)/2,1,1,1,ang,0,0)); }); }
    });
    P.push(part(new Bx(HW*2+3.4,1,1.2),'#e9ebee',0,19,z4));
  }
  var tw=new THREE.Group(); tw.add(new THREE.Mesh(merge(P),new THREE.MeshLambertMaterial({vertexColors:true})));
  scene.add(tw); out.scroll.push({g:tw,p:120});
  return out;
};

/* ---------- へいたい（からだ＋あし2本。あしは こしで まわして あるかせる） ---------- */
G.soldier=function(team){
  var B=THREE.BoxGeometry, S=THREE.SphereGeometry, C=THREE.CylinderGeometry, K=THREE.ConeGeometry;
  var blue=team==='blue';
  var uni=blue?'#2f6fe0':'#d8342b', uniD=blue?'#214fa8':'#9e231c', helm=blue?'#1c3f9a':'#2a1d1d', skin=blue?'#f3c9a5':'#e2a47c';
  var body=[
    part(new C(0.19,0.17,0.42,8),uni,0,0.53,0),                                      // どう
    part(new C(0.2,0.2,0.07,8),'#3b2e22',0,0.36,0),                                  // ベルト
    part(new S(0.165,10,7),skin,0,0.86,0),                                           // あたま
    part(new S(0.19,10,5,0,Math.PI*2,0,Math.PI*0.55),helm,0,0.88,0),                  // ヘルメット
    part(new C(0.205,0.205,0.04,10),blue?'#e2e8f0':'#111',0,0.86,0),                 // ヘルメットの ふち
    part(new S(0.07,6,4),uniD,-0.21,0.68,0), part(new S(0.07,6,4),uniD,0.21,0.68,0), // かた
    part(new C(0.05,0.045,0.3,5),uni,-0.23,0.52,-0.06,1,1,1,0.5), part(new C(0.05,0.045,0.3,5),uni,0.23,0.52,-0.06,1,1,1,0.5),  // うで
    part(new B(0.06,0.07,0.46),'#2a2b30',0.08,0.55,-0.25), part(new B(0.05,0.12,0.06),'#2a2b30',0.08,0.48,-0.12)   // じゅう
  ];
  if(blue){ body.push(part(new B(0.26,0.28,0.12),'#1e3a72',0,0.58,0.19)); body.push(part(new B(0.2,0.06,0.13),'#fbbf24',0,0.66,0.2)); }   // リュック（せなか＝カメラがわ）
  else { // つの・おこった かお（こちら＝-z を むいて いる）
    body.push(part(new K(0.05,0.16,6),'#f5f5f4',-0.13,1.02,0,1,1,1,0,0,0.5)); body.push(part(new K(0.05,0.16,6),'#f5f5f4',0.13,1.02,0,1,1,1,0,0,-0.5));
    body.push(part(new B(0.05,0.035,0.02),'#111',-0.06,0.87,-0.158)); body.push(part(new B(0.05,0.035,0.02),'#111',0.06,0.87,-0.158));
    body.push(part(new B(0.07,0.02,0.02),'#111',-0.06,0.915,-0.155,1,1,1,0,0,-0.4)); body.push(part(new B(0.07,0.02,0.02),'#111',0.06,0.915,-0.155,1,1,1,0,0,0.4)); }
  var leg=function(){ return merge([ part(new C(0.065,0.06,0.3,6),blue?'#1f2a44':'#3b1d1d',0,-0.15,0), part(new B(0.12,0.08,0.18),'#1b1b1f',0,-0.31,-0.03) ]); };
  return {body:merge(body),leg:leg(),hipY:0.33,hipX:0.085};
};
G.shadowTex=function(){ return canvasTex(64,64,function(g,w,h){ var r=g.createRadialGradient(32,32,2,32,32,30); r.addColorStop(0,'rgba(0,0,0,.55)'); r.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=r; g.fillRect(0,0,w,h); },false); };

/* 1チームぶんの インスタンス（からだ・ひだりあし・みぎあし・かげ） */
G.army=function(scene,team,max,custom){
  var geo=custom||G.soldier(team), mat=new THREE.MeshLambertMaterial({vertexColors:true});
  var a={body:new THREE.InstancedMesh(geo.body,mat,max),lL:new THREE.InstancedMesh(geo.leg,mat,max),lR:new THREE.InstancedMesh(geo.leg,mat,max),
         sh:new THREE.InstancedMesh(new THREE.PlaneGeometry(0.62,0.62),new THREE.MeshBasicMaterial({map:G.shadowTex(),transparent:true,depthWrite:false}),max),n:0,geo:geo};
  ['body','lL','lR','sh'].forEach(function(k){ a[k].instanceMatrix.setUsage(THREE.DynamicDrawUsage); a[k].frustumCulled=false; scene.add(a[k]); });
  var o=new THREE.Object3D(), h=new THREE.Object3D();
  a.begin=function(){ a.n=0; };
  var WH=new THREE.Color(1,1,1); for(var ci=0;ci<max;ci++) a.body.setColorAt(ci,WH);
  a.put=function(x,y,z,ry,phase,scale,tint){ if(a.n>=max) return; var i=a.n++, s=scale||1, sw=Math.sin(phase)*0.7;
    o.position.set(x,y,z); o.rotation.set(0,ry,0); o.scale.set(s,s,s); o.updateMatrix(); a.body.setMatrixAt(i,o.matrix);
    a.body.setColorAt(i,tint||WH);   // こおり・ダメージの いろ
    var c=Math.cos(ry), sn=Math.sin(ry);
    [[-1,a.lL,sw],[1,a.lR,-sw]].forEach(function(L){ var hx=L[0]*geo.hipX*s;
      h.position.set(x+hx*c,y+geo.hipY*s,z-hx*sn); h.rotation.set(L[2],ry,0,'YXZ'); h.scale.set(s,s,s); h.updateMatrix(); L[1].setMatrixAt(i,h.matrix); });
    o.position.set(x,0.02,z); o.rotation.set(-Math.PI/2,0,0); o.scale.set(s,s,s); o.updateMatrix(); a.sh.setMatrixAt(i,o.matrix); };
  a.end=function(){ ['body','lL','lR','sh'].forEach(function(k){ a[k].count=a.n; a[k].instanceMatrix.needsUpdate=true; }); if(a.body.instanceColor) a.body.instanceColor.needsUpdate=true; };
  return a;
};

/* ---------- ボス（つのの ある あかい きょじん・トゲの こんぼう） ---------- */
G.boss=function(scene){
  var g=new THREE.Group(), L=function(c,e){ return new THREE.MeshLambertMaterial({color:c,emissive:e||0x000000}); };
  var skin=L(0xc9362b), dark=L(0x2b1b1b), gold=L(0xe0a93a), metal=L(0x6b6f76);
  var mats=[skin,dark,gold,metal];
  var body=new THREE.Group(); body.position.y=2.6; g.add(body);
  var torso=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.0,2.2,14),skin); torso.position.y=0.9; body.add(torso);
  var belly=new THREE.Mesh(new THREE.SphereGeometry(1.05,16,12),skin); belly.position.set(0,0.35,-0.25); belly.scale.set(1,0.9,0.8); body.add(belly);
  var plate=new THREE.Mesh(new THREE.CylinderGeometry(1.32,1.2,1.1,14,1,true,-Math.PI*0.75,Math.PI*1.5),dark); plate.position.y=1.3; plate.rotation.y=Math.PI; body.add(plate);
  var belt=new THREE.Mesh(new THREE.CylinderGeometry(1.12,1.12,0.3,14),dark); belt.position.y=-0.1; body.add(belt);
  var buckle=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.36,0.1),gold); buckle.position.set(0,-0.1,-1.12); body.add(buckle);
  var head=new THREE.Group(); head.position.y=2.55; body.add(head);
  head.add(new THREE.Mesh(new THREE.SphereGeometry(0.72,16,12),skin));
  var hm=new THREE.Mesh(new THREE.SphereGeometry(0.78,16,10,0,Math.PI*2,0,Math.PI*0.5),metal); hm.position.y=0.08; head.add(hm);
  [-1,1].forEach(function(s){ var h=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.8,8),L(0xf3efe6)); h.position.set(s*0.62,0.55,0); h.rotation.z=-s*0.7; head.add(h); });
  var eyeM=new THREE.MeshBasicMaterial({color:0xffe14d});
  [-1,1].forEach(function(s){ var e=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,6),eyeM); e.position.set(s*0.24,0.05,-0.64); head.add(e);
    var br=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.08,0.08),dark); br.position.set(s*0.24,0.22,-0.66); br.rotation.z=s*0.4; head.add(br); });
  var tusk=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.22,6),L(0xf3efe6)); tusk.position.set(-0.2,-0.32,-0.62); tusk.rotation.x=Math.PI; head.add(tusk);
  var tusk2=tusk.clone(); tusk2.position.x=0.2; head.add(tusk2);
  var arms={};
  [-1,1].forEach(function(s){ var sh=new THREE.Group(); sh.position.set(s*1.45,1.75,0); body.add(sh);
    var pad=new THREE.Mesh(new THREE.SphereGeometry(0.62,12,8,0,Math.PI*2,0,Math.PI*0.55),metal); pad.position.y=0.1; sh.add(pad);
    for(var k=0;k<3;k++){ var sp=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.4,6),L(0xe5e7eb)); sp.position.set(s*0.2*(k-1)+s*0.2,0.55,0.2*(k-1)); sh.add(sp); }
    var arm=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.34,1.9,10),skin); arm.position.y=-0.95; sh.add(arm);
    var fist=new THREE.Mesh(new THREE.SphereGeometry(0.42,10,8),skin); fist.position.y=-1.95; sh.add(fist);
    var cuff=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.3,10),gold); cuff.position.y=-1.55; sh.add(cuff);
    arms[s]=sh; });
  // こんぼう
  var club=new THREE.Group(); club.position.set(0,-2.05,-0.2); arms[1].add(club);
  var hd=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,1.6,8),L(0x6b4423)); hd.rotation.x=Math.PI/2; hd.position.z=-0.7; club.add(hd);
  var cb=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.3,1.8,10),L(0x7a4e2b)); cb.rotation.x=Math.PI/2; cb.position.z=-2.2; club.add(cb);
  for(var q=0;q<10;q++){ var a=q/10*Math.PI*2, sp2=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.35,6),metal);
    sp2.position.set(Math.cos(a)*0.46,Math.sin(a)*0.46,-2.2-((q%3)-1)*0.5); sp2.lookAt(Math.cos(a)*3,Math.sin(a)*3,-2.2-((q%3)-1)*0.5); sp2.rotateX(Math.PI/2); club.add(sp2); }
  var legs={};
  [-1,1].forEach(function(s){ var hip=new THREE.Group(); hip.position.set(s*0.55,2.3,0); g.add(hip);
    var th=new THREE.Mesh(new THREE.CylinderGeometry(0.46,0.38,1.6,10),dark); th.position.y=-0.8; hip.add(th);
    var boot=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.6,1.1),L(0x1b1b1f)); boot.position.set(0,-1.9,-0.15); hip.add(boot);
    legs[s]=hip; });
  var shadow=new THREE.Mesh(new THREE.PlaneGeometry(5.5,5.5),new THREE.MeshBasicMaterial({map:G.shadowTex(),transparent:true,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2; shadow.position.y=0.03; g.add(shadow);
  g.scale.setScalar(1.25); scene.add(g);
  return {g:g,body:body,arms:arms,legs:legs,club:club,head:head,
    anim:function(t,walk,attack,flash){
      var sw=walk?Math.sin(t*4)*0.45:0;
      legs[-1].rotation.x=sw; legs[1].rotation.x=-sw; body.position.y=2.6+Math.abs(Math.sin(t*4))*(walk?0.12:0.04);
      arms[-1].rotation.x=-sw*0.6; arms[1].rotation.x=attack?(-2.4+Math.max(0,Math.sin(t*5))*2.6):(sw*0.6-0.2);
      head.rotation.y=Math.sin(t*0.9)*0.25;
      mats.forEach(function(m){ m.emissive.setHex(flash?0x661111:0x000000); }); }};
};

/* ---------- つぶ（けむり・ひばな・ぼん） ---------- */
G.particles=function(scene,max){
  var geo=new THREE.BufferGeometry(), pos=new Float32Array(max*3), col=new Float32Array(max*3);
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  var tex=canvasTex(64,64,function(g,w,h){ var r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(0.4,'rgba(255,255,255,.6)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,w,h); },false);
  var m=new THREE.PointsMaterial({size:0.55,map:tex,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
  var pts=new THREE.Points(geo,m); pts.frustumCulled=false; scene.add(pts);
  var P=[], cc=new THREE.Color();
  return {emit:function(x,y,z,vx,vy,vz,color,life){ if(P.length>=max) P.shift(); P.push({x:x,y:y,z:z,vx:vx,vy:vy,vz:vz,c:new THREE.Color(color),life:life,t:0}); },
    burst:function(x,y,z,n,color,spd,life){ for(var i=0;i<n;i++){ var a=R()*Math.PI*2, e=R()*1.2; this.emit(x,y,z,Math.cos(a)*spd*R(),e*spd,Math.sin(a)*spd*R(),color,life*(0.6+R()*0.6)); } },
    update:function(dt,dz){ for(var i=P.length-1;i>=0;i--){ var p=P[i]; p.t+=dt; if(p.t>=p.life){ P.splice(i,1); continue; }
        p.vy-=6*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt+dz; if(p.y<0.05){ p.y=0.05; p.vy*=-0.3; } }
      for(var j=0;j<P.length;j++){ var q=P[j], k=1-q.t/q.life; pos[j*3]=q.x; pos[j*3+1]=q.y; pos[j*3+2]=q.z; cc.copy(q.c).multiplyScalar(k); col[j*3]=cc.r; col[j*3+1]=cc.g; col[j*3+2]=cc.b; }
      geo.setDrawRange(0,P.length); geo.attributes.position.needsUpdate=true; geo.attributes.color.needsUpdate=true; }};
};

/* ---------- たま（ひかる せん） ---------- */
G.bullets=function(scene,max){
  var m=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending,depthWrite:false});
  var im=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035,0.035,1.1,5).rotateX(Math.PI/2),m,max);
  for(var i=0;i<max;i++) im.setColorAt(i,new THREE.Color(0xffe27a));            // たまごとの いろ（ぶきで かわる）
  im.frustumCulled=false; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(im); return im;
};

/* ---------- ゲート ---------- */
G.gateTex=function(text,good,eng,wpn,yomi){
  if(yomi&&G.furi) yomi=G.furi(text,yomi)[2];
  return canvasTex(512,256,function(g,w,h){
    var c1=wpn==='UNIT'?'rgba(45,212,191,.82)':wpn?'rgba(190,130,255,.8)':eng?'rgba(255,200,60,.78)':good?'rgba(80,150,250,.8)':'rgba(245,90,90,.8)', c2=wpn==='UNIT'?'rgba(15,118,110,.92)':wpn?'rgba(90,30,170,.92)':eng?'rgba(200,100,0,.9)':good?'rgba(25,70,210,.92)':'rgba(150,20,20,.92)';
    var gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,c1); gr.addColorStop(1,c2); g.fillStyle=gr; g.fillRect(0,0,w,h);
    g.fillStyle='rgba(255,255,255,.08)'; for(var x=-h;x<w;x+=46){ g.beginPath(); g.moveTo(x,h); g.lineTo(x+h,0); g.lineTo(x+h+18,0); g.lineTo(x+18,h); g.fill(); }   // ななめの ひかり
    var hl=g.createLinearGradient(0,0,0,h*0.4); hl.addColorStop(0,'rgba(255,255,255,.35)'); hl.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=hl; g.fillRect(0,0,w,h*0.4);
    g.textAlign='center'; g.textBaseline='middle';
    var FONT='"Hiragino Maru Gothic ProN","Hiragino Sans","M PLUS Rounded 1c","Noto Sans JP",sans-serif';
    if(wpn){ g.fillStyle='rgba(40,10,90,.85)'; g.fillRect(w/2-80,14,160,40); g.fillStyle='#f3e8ff'; g.font='900 26px '+FONT; g.fillText(typeof wpn==='string'?wpn:'WEAPON',w/2,35); }
    if(eng){ g.fillStyle='rgba(120,53,15,.9)'; g.fillRect(w/2-90,14,180,40); g.fillStyle='#fff7d6'; g.font='900 26px '+FONT; g.fillText('ENGLISH',w/2,35); }
    var fs=(eng||wpn)?84:128; g.font='900 '+fs+'px '+FONT; while(g.measureText(text).width>w-50&&fs>30){ fs-=4; g.font='900 '+fs+'px '+FONT; }
    var ty=(eng||wpn)?h/2+24:h/2+6;
    if(yomi&&/[\u4e00-\u9fff\u3005]/.test(text)){ ty+=18; var yf=34; g.font='800 '+yf+'px '+FONT; while(g.measureText(yomi).width>w-40&&yf>16){ yf-=2; g.font='800 '+yf+'px '+FONT; }
      g.fillStyle='#fff'; g.lineWidth=6; g.strokeStyle='rgba(0,0,0,.35)'; g.strokeText(yomi,w/2,ty-fs*0.5-yf*0.5-2); g.fillText(yomi,w/2,ty-fs*0.5-yf*0.5-2); fs=Math.min(fs,76); g.font='900 '+fs+'px '+FONT; while(g.measureText(text).width>w-50&&fs>30){ fs-=4; g.font='900 '+fs+'px '+FONT; } }
    g.lineWidth=14; g.strokeStyle='rgba(0,0,0,.35)'; g.lineJoin='round'; g.strokeText(text,w/2,ty);
    g.fillStyle='#ffffff'; g.fillText(text,w/2,ty);
  });
};
G.glowTex=function(){ return canvasTex(64,128,function(g,w,h){ var gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'rgba(255,255,255,.9)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); },false); };

G.R=R;
window.WAR_GFX=G;
})();
