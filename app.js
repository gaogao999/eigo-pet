/* えいごペット — app logic (called from componentDidMount) */
window._eigoPetInit = function() {
  if (window._eigoPetInitDone) return;
  window._eigoPetInitDone = true;

  const QPER = 5;
  function currentWords() { return (WORDBANK[state.grade] || WORDBANK.g3).words; }

  const PAL = { o: "#4a3526", w: "#faf6ec", g: "#d8cdb2" };
  const COLORS = [
    { id: 'brown', name: 'ちゃいろ', need: 0,   o: '#4a3526' },
    { id: 'green', name: 'みどり',   need: 30,  o: '#3b6d3b' },
    { id: 'blue',  name: 'あお',     need: 80,  o: '#2a5a8a' },
    { id: 'pink',  name: 'ピンク',   need: 150, o: '#b04a72' },
    { id: 'purple',name: 'むらさき', need: 250, o: '#6a4aa0' },
    { id: 'red',   name: 'あか',     need: 400, o: '#a83232' }
  ];
  function R(x,y,w,h,c){ return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"/>'; }
  function tri(cx,by,hw,h,c){ var s='',st=5,n=Math.ceil(h/st); for(var i=0;i<n;i++){ var yy=by-(i+1)*st, ww=Math.max(2,Math.round(hw*2*(1-i/n))); s+=R(Math.round(cx-ww/2),yy,ww,st+0.6,c); } return s; }
  function treeSc(x){ return R(x,49,5,12,'#7a5a2a')+tri(x+2.5,52,9,20,'#5fa83f'); }
  function bld(x,w,h,c){ var s=R(x,60-h,w,h,c); for(var yy=64-h;yy<58;yy+=7) for(var xx=x+3;xx<x+w-3;xx+=6) s+=R(xx,yy,3,4,'#dbe6f0'); return s; }
  var SCENES = {
    yama: function(){ return R(98,8,9,9,'#f6d65e')+tri(42,60,26,42,'#7fa86a')+tri(80,60,18,28,'#93bb7d')+R(0,60,120,10,'#d8c79a'); },
    mori: function(){ return R(0,60,120,10,'#bcd6a6')+treeSc(12)+treeSc(36)+treeSc(60)+treeSc(84)+treeSc(104); },
    umi:  function(){ return R(98,8,9,9,'#f6d65e')+R(0,40,120,30,'#5fb0e8')+R(6,46,18,3,'#bfe3f7')+R(42,52,20,3,'#bfe3f7')+R(80,46,18,3,'#bfe3f7'); },
    beach:function(){ return R(98,8,9,9,'#f6d65e')+R(0,40,120,13,'#5fb0e8')+R(0,53,120,17,'#f0dca8')+R(20,30,4,24,'#8a6234')+R(11,28,22,4,'#5fa83f')+R(15,24,14,4,'#5fa83f'); },
    sabaku:function(){ return R(98,8,9,9,'#f6d65e')+tri(62,64,62,22,'#ead095')+tri(20,64,28,12,'#dcc086')+R(86,44,6,18,'#5fa84f')+R(81,50,5,5,'#5fa84f')+R(92,46,5,5,'#5fa84f'); },
    tokai:function(){ return R(0,60,120,10,'#8893a0')+bld(8,18,30,'#79838f')+bld(30,16,42,'#8b95a2')+bld(50,20,24,'#79838f')+bld(74,18,36,'#8b95a2')+bld(96,16,28,'#79838f'); },
    gakko:function(){ return R(0,60,120,10,'#bcd6a6')+R(34,30,52,30,'#e7d6b0')+tri(60,30,30,11,'#b85c4a')+R(57,22,3,3,'#fff')+R(56,46,8,14,'#8a6234')+R(40,36,8,8,'#bfe3f7')+R(72,36,8,8,'#bfe3f7'); }
  };
  function sceneWrap(c){ return '<svg viewBox="0 0 120 70" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" shape-rendering="crispEdges">'+c+'</svg>'; }
  var BGS = [
    { id:'meadow', name:'はらっぱ', need:0,   bg:'#f1ead7', ground:'#e7dcbf', dot:'rgba(74,53,38,.10)' },
    { id:'sky',    name:'そら',     need:30,  bg:'#e3f0f7', ground:'#cfe4ef', dot:'rgba(40,80,110,.10)' },
    { id:'yama',   name:'やま',     need:60,  bg:'#dce9f2', scene:'yama' },
    { id:'mori',   name:'もり',     need:100, bg:'#e7f1e0', scene:'mori' },
    { id:'umi',    name:'うみ',     need:140, bg:'#d8eef6', scene:'umi' },
    { id:'beach',  name:'ビーチ',   need:180, bg:'#dff1f7', scene:'beach' },
    { id:'sabaku', name:'さばく',   need:220, bg:'#fbeede', scene:'sabaku' },
    { id:'tokai',  name:'とかい',   need:260, bg:'#e9eef3', scene:'tokai' },
    { id:'gakko',  name:'がっこう', need:300, bg:'#eaf0f5', scene:'gakko' },
    { id:'night',  name:'よる',     need:360, bg:'#2a2f45', ground:'#1f2336', dot:'rgba(255,255,255,.12)' }
  ];
  function curColor(){ return COLORS.find(function(c){ return c.id===state.petColor; }) || COLORS[0]; }
  function curBg(){ return BGS.find(function(b){ return b.id===state.bg; }) || BGS[0]; }
  function currentPAL(){ return { o: curColor().o, w: PAL.w, g: PAL.g }; }
  function applyBg(){
    var b=curBg();
    var y=document.querySelector('.yard'); if(y) y.style.background=b.bg;
    var gr=document.querySelector('.ground'); if(gr) gr.style.background=b.ground||'transparent';
    var d=document.querySelector('.yard .dots'); if(d) d.style.backgroundImage=b.scene?'none':('radial-gradient('+(b.dot||'rgba(74,53,38,.08)')+' 2px,transparent 2px)');
    var sc=document.getElementById('scene'); if(sc) sc.innerHTML=b.scene?sceneWrap(SCENES[b.scene]()):'';
  }

  var EGG=[".....oooo.....","...oowwwwoo...","..owwwwwwwwo..",".owwwwwwwwwwo.",".owwwgwwgwwwo.",".owwwwwwwwwwo.",".owwoowwoowwwo",".owwwoowwwwwo.",".owwwwwwwwwwo.","..owwwwwwwwo..","...owwwwwwo...","....oooooo...."];
  var BABY=["......oo......",".....o..o.....","....oooooo....","...owwwwwwo...","..owwwwwwwwo..",".owwoowwwoowwo","owwwwwwwwwwwwo",".owwwggwwwwwo.",".owwwoooowwwwo","..owwwwwwwwo..","...owwwwwwo...","....oooooo....","....o.oo.o...."];
  var KID=["..o........o..","..oo......oo..",".ooowwwwwwooo.",".owwwwwwwwwwwo","owwwoowwwoowwo","owwwwwwwwwwwwo","owwwwoooooowwo","owwwwwwwwwwwwo",".owwwwwwwwwwo.","o.owwwwwwwwo.o","...owwwwwwo...","....oooooo....","...oo.oo.oo..."];

  // 表示名マップ（画像ファイル名＝IDは変えず、見せる名前だけ変更）
  var NAME_MAP = {
    'ぴよっこ':'ぴよっち','ちびっこ':'ちびっち',
    'すいすいたま':'すいすいたまっち','しろころ':'しろころっち','くさたま':'くさたまっち',
    'おひさま':'おひさまっち','みらたま':'みらたまっち','にんじゃ':'にんじゃっち','ぴこぴこ':'ぴこぴこっち',
    'どきどき':'どきどきっち','はがた':'はがたっち','かぶら':'かぶらっち','うらら':'うららっち','ねむね':'ねむねっち','うさたま':'うさたまっち','ぴよたま':'ぴよたまっち',
    'もふたま':'もふたまっち',
    'はんば':'はんばっち','もぐもぐ':'もぐもぐっち','げーむ':'げーむっち','たまぱ':'たまぱっち','めっこ':'めっこっち','ぷくたま':'ぷくたまっち','ぴな':'ぴーなっち',
    'めらめら':'めらめらっち','ちゃめ':'ちゃめっち','がくがく':'がくがくっち','くちぱ':'くちぱっち','ぴねむ':'ぴねむっち','ばぶたま':'ばぶたまっち',
    'くろだま':'くろだまっち','おばけ':'おばけっち'
  };
  function dispName(id){ return NAME_MAP[id]||id; }
  var EGG_INFO = { img:'たまご', map:EGG, name:'タマゴ', desc:'もうすぐ うまれるよ。' };
  var BABIES = {
    a: { img:'ぴよっこ', map:BABY, name:dispName('ぴよっこ'), desc:'たまごから かえったばかり。からを かぶった あかちゃん。' }
  };
  var CHILDREN = {
    a: { img:'ちびっこ', map:KID, name:dispName('ちびっこ'), desc:'げんきに あるきまわる ちいさな こども。' }
  };
  var YOUNG=["...o......o...","...oo....oo...","..oowwwwwwoo..",".owwwwwwwwwwo.","owwwoowwwoowwo","owwwwwwwwwwwwo","owwwwoooooowwo","owwwwwwwwwwwwo","owwwwwwwwwwwwo",".owwwwwwwwwwo.","..owwwwwwwwo..","...oo.oo.oo...",".............."];
  var YOUNG2=[".....oooo.....","....o....o....","..oowwwwwwoo..",".owwwwwwwwwwo.","owwoowwwwoowwo","owwwwwwwwwwwwo","owwwwwwwwwwwwo","owwwoooooowwwo","owwwwwwwwwwwwo",".owwwwwwwwwwo.","..owwwwwwwwo..","...oo.oo.oo...",".............."];
  // ヤングは おせわランク（star/good/normal/wild）に わかれる。この子が どの アダルト系統に そだつかの よこく
  var YOUNGS = {
    star:   { img:'すいすいたま', map:YOUNG,  name:dispName('すいすいたま'), desc:'きらきら かがやく ゆうとうな わかもの。' },
    good:   { img:'しろころ',     map:YOUNG2, name:dispName('しろころ'),     desc:'やさしくて おだやかな わかもの。' },
    normal: { img:'もふたま',     map:YOUNG,  name:dispName('もふたま'),     desc:'マイペースで ふつうの わかもの。' },
    wild:   { img:'くさたま',     map:YOUNG2, name:dispName('くさたま'),     desc:'やんちゃで げんきな わかもの。' }
  };
  // アダルトは おせわの せいせきで tier がきまり、その中から ランダムで しんかする
  var ADULT_TIERS = {
    star:   ['おひさま','みらたま','にんじゃ','ぴこぴこ'],
    good:   ['どきどき','はがた','かぶら','うらら','ねむね','うさたま','ぴよたま'],
    normal: ['はんば','もぐもぐ','げーむ','たまぱ','めっこ','ぷくたま','ぴな'],
    wild:   ['めらめら','ちゃめ','がくがく','くちぱ','ぴねむ','ばぶたま'],
    devil:  ['くろだま','おばけ']
  };
  // けいふ：ヤング1種ごとに「見た目が似ている」アダルト6種へ進化する（レアは どのヤングからでも）
  // star=すいすいたま(あお) / good=しろころ(しろ・ふしぎ) / normal=もふたま(どうぶつ) / wild=くさたま(しぜん・たべもの)
  var LINEAGE = {
    star:   ['みらたま','ぴこぴこ','にんじゃ','ぷくたま','ぴねむ','げーむ'],
    good:   ['はがた','ばぶたま','うらら','おひさま','ねむね','がくがく'],
    normal: ['うさたま','どきどき','たまぱ','めっこ','もぐもぐ','ちゃめ'],
    wild:   ['かぶら','ぴよたま','くちぱ','はんば','ぴな','めらめら']
  };
  var RARE_ADULTS = ['くろだま','おばけ']; // じょうずに育てた子に まれに（どの系統からでも）。サボりでは出ない
  var RARE_CHANCE = 0.07;                  // レアが出る かくりつ（お世話が よい子のみ）
  var TIER_LABEL = { star:'⭐さいこう', good:'◎よいこ', normal:'○ふつう', wild:'△わんぱく' };
  var FAMILY_NAME = { star:'すいすいたま系（あお・メカ）', good:'しろころ系（しろ・ふしぎ）', normal:'もふたま系（どうぶつ）', wild:'くさたま系（しぜん・たべもの）' };
  var ADULT_DESC = {
    'おひさま':'いつも にこにこ、みんなを あかるく てらす たいようの子。あさが とくい。',
    'みらたま':'みらいから きた もの知り ロボ。なんでも けいさんしちゃう かしこい子。',
    'にんじゃ':'しゅぎょうで きたえた すばやい にんじゃ。しずかに みんなを まもってる。',
    'ぴこぴこ':'ピコピコ うごく げんきな メカ。ちょっぴり おもたいのが じまん。',
    'どきどき':'あいじょう たっぷり、みんなが だいすきな はぁとの子。',
    'はがた':'れいぎ ただしい しっかりや。あいさつは かかさないよ。',
    'かぶら':'のんびりやさん。おひさまと つちの においが だいすき。',
    'うらら':'ほんわか おっとり。いつも マイペースで にこにこ。',
    'ねむね':'ものしずかで かんがえぶかい まほうつかい。よふかしは にがて。',
    'うさたま':'ながい みみが チャームポイント。やさしい あまえんぼう。',
    'ぷくたま':'ぷくぷくの ほっぺが じまん。たべるのも あそぶのも だいすき。',
    'ぴよたま':'まんまるで ほんわか。げんきな あいさつが とくいな よいこ。',
    'ぴな':'すなおで げんきいっぱい。じっと してられない わんぱくさん。',
    'はんば':'たべるの だいすき！ こんがり やけた いいにおいの子。',
    'もぐもぐ':'おっとり マイペース。ほっぺに ごはんを ためこむ くせが あるよ。',
    'げーむ':'あそぶの だいすきな ゲームずき。ハイスコアを ねらってる。',
    'たまぱ':'まんまる おみみの ちゃめっけ者。あそびに さそうのが とくい。',
    'めっこ':'かいぬしに ちゅうじつな おりこうさん。おすわりも できるよ。',
    'めらめら':'ねっけつで あばれんぼう。やる気は だれにも まけない！',
    'ちゃめ':'いたずら だいすきな おさるさん。びっくりさせるのが すき。',
    'がくがく':'おちつきが なくて そわそわ。でも いつも げんきいっぱい。',
    'くちぱ':'おおきな おくちが じまん。なんでも パクッと たべちゃう。',
    'ぴねむ':'あおい ぼうしの おとぼけ まほうつかい。いつも うとうと ねむそう。',
    'ばぶたま':'すこし わがままな あかちゃん。だっこが だいすき。',
    'くろだま':'レア！ よなかに そっと あらわれる ふしぎな くろねこ。',
    'おばけ':'レア！ ふわふわ そらを ただよう やさしい おばけ。'
  };
  // 育て方の こだわり（相性）：体重・あそび・べんきょう・ねむり・しつけ 等で なりやすい子が かわる＝進化への 重みづけ
  var TRAITS = {
    heavy: { label:'おもい子',   hint:'ごはん・おかしで おもく（たいじゅう25+）すると なりやすい', test:function(s){ return s.weight>=25; } },
    light: { label:'かるい子',   hint:'ミニゲームで かるく（たいじゅう12-）すると なりやすい',      test:function(s){ return s.weight<=12; } },
    play:  { label:'あそびずき',  hint:'ミニゲームで 100かい あそぶと なりやすい',                 test:function(s){ return (s.gamesPlayed||0)>=100; } },
    study: { label:'べんきょうか', hint:'この子で 200もん せいかいすると なりやすい',              test:function(s){ return (s.genCorrect||0)>=200; } },
    sleep: { label:'ねぼすけ',    hint:'よく ねかせる（20かい すいみん）と なりやすい',            test:function(s){ return (s.sleepCount||0)>=20; } },
    disc:  { label:'おぎょうぎ◎',  hint:'しつけを きちんと（ミス0）すると なりやすい',              test:function(s){ return (s.disciplineMiss||0)===0 && s.discipline>=60; } },
    wild:  { label:'やんちゃ',    hint:'わがままを ほうっておく（しつけミス3+）と なりやすい',       test:function(s){ return (s.disciplineMiss||0)>=3; } },
    happy: { label:'ごきげん屋',  hint:'ごきげんを たかく（80+）たもつと なりやすい',              test:function(s){ return s.happy>=80; } },
    streak:{ label:'まいにちさん', hint:'7日 れんぞくで もくひょうたっせいすると なりやすい',        test:function(s){ return (s.streak||0)>=7; } }
  };
  var AFFINITY = {
    'ぴこぴこ':'heavy','もぐもぐ':'heavy','くちぱ':'heavy','はんば':'heavy',
    'おばけ':'light','ぴな':'light','はがた':'light','うさたま':'light',
    'げーむ':'play','たまぱ':'play',
    'がくがく':'study','みらたま':'study',
    'ぴねむ':'sleep','ねむね':'sleep','ばぶたま':'sleep',
    'にんじゃ':'disc','めっこ':'disc',
    'めらめら':'wild','ちゃめ':'wild','くろだま':'wild',
    'どきどき':'happy','うらら':'happy','ぷくたま':'happy','かぶら':'happy',
    'おひさま':'streak','ぴよたま':'streak'
  };
  var AFF_BOOST=4;
  function affinityWeight(id){ var a=AFFINITY[id]; if(!a) return 1; var t=TRAITS[a]; return (t&&t.test(state))?AFF_BOOST:1; }
  function affinityLabel(id){ var a=AFFINITY[id]; return a&&TRAITS[a]?TRAITS[a].label:''; }
  function affinityHint(id){ var a=AFFINITY[id]; return a&&TRAITS[a]?TRAITS[a].hint:''; }
  var ADULTS = (function(){ var o={}; Object.keys(ADULT_TIERS).forEach(function(t){ ADULT_TIERS[t].forEach(function(id){ o[id]={ img:id, name:dispName(id), desc:ADULT_DESC[id]||'', tier:t, rare:(t==='devil') }; }); }); return o; })();
  // きゅうバージョンの セーブ（tier_parity / devil）との ごかんマップ
  var LEGACY_ADULT = { star_e:'おひさま',star_o:'みらたま',good_e:'どきどき',good_o:'はがた',normal_e:'はんば',normal_o:'もぐもぐ',wild_e:'めらめら',wild_o:'ちゃめ',devil:'くろだま' };
  function normAdult(id){ return ADULTS[id]?id:(LEGACY_ADULT[id]||id); }
  var imgCache={};
  function imgSrc(n){ return 'characters/'+encodeURIComponent(n)+'.png'; }
  function getImg(n){ if(!imgCache[n]){ var im=new Image(); im.src=imgSrc(n); imgCache[n]=im; } return imgCache[n]; }
  function babyInfo()  { return BABIES[state.babyType]  || BABIES.a; }
  function childInfo() { return CHILDREN[state.childType] || CHILDREN.a; }
  var TIER_ORDER=['wild','normal','good','star'];
  // ランクは「その世代（生まれてから）の もくひょうたっせい日数」で判定（累積でないので 世代ごとに変わり 図鑑が埋まる）
  function genMetDays(){ try{ var b=dayStr(new Date(state.born||Date.now())); return (state.metDates||[]).filter(function(d){ return d>=b; }).length; }catch(e){ return (state.metDates||[]).length; } }
  function careTierIndex(){ var gm=genMetDays(); return gm>=3?3:gm>=2?2:gm>=1?1:0; }
  function youngTierKey(){ if((state.careMiss+state.disciplineMiss)>=8) return 'wild'; return TIER_ORDER[careTierIndex()]; } // ヤングは 4ランク（devilは wild あつかい）
  function youngInfo() { return YOUNGS[state.youngType] || YOUNGS.normal; }
  function adultById(id){ return ADULTS[id] || (id&&LEGACY_ADULT[id]&&ADULTS[LEGACY_ADULT[id]]) || ADULTS[ADULT_TIERS.normal[0]]; }
  function adultInfo() { return adultById(state.adultType); }
  function careMissTotal(){ return (state.careMiss||0)+(state.disciplineMiss||0); }
  function predictedTier(){ return youngTierKey(); } // いまの おせわランク（系統）。レアは予告しない
  function predictedAdultKey(){ var t=predictedTier(); return (LINEAGE[t]||LINEAGE.normal)[0]; }
  // アダルト確定：いまの ヤング(=おせわランク)の 系統から、見た目の似た6種のどれかに進化。
  // レアは「じょうずに育てた子（ミスが少ない）」だけ 低確率で（どの系統からでも）。サボりでは出ない。
  function pickWeightedAdult(pool){ // 育て方の こだわり(相性)で 重みづけして 1体えらぶ
    var wt=pool.map(affinityWeight), tot=0, i; for(i=0;i<wt.length;i++) tot+=wt[i];
    var r=Math.random()*tot, acc=0; for(i=0;i<pool.length;i++){ acc+=wt[i]; if(r<=acc) return pool[i]; }
    return pool[pool.length-1];
  }
  function pickAdultType(){
    var yt=state.youngType||youngTierKey();
    if(careMissTotal()<=2 && Math.random()<RARE_CHANCE){ return pickWeightedAdult(RARE_ADULTS); }
    return pickWeightedAdult(LINEAGE[yt]||LINEAGE.normal);
  }
  function petInfo(){ if(state.lv>=5) return adultInfo(); if(state.lv>=4) return youngInfo(); if(state.lv>=3) return childInfo(); if(state.lv>=2) return babyInfo(); return EGG_INFO; }
  function petMap(){ var i=petInfo(); return i.map||EGG; }
  function drawPet(){
    var info=petInfo();
    var petSvg=document.getElementById('pet');
    var petImg=document.getElementById('petImg');
    if(info.img){
      if(petImg){ var sleepy=(typeof asleep!=='undefined')&&asleep; petImg.onerror=sleepy?function(){ petImg.onerror=null; petImg.src=imgSrc(info.img); }:null; petImg.src=sleepy?imgSrc(info.img+'_sleep'):imgSrc(info.img); petImg.style.display='block'; } // 寝るときは 閉じ目スプライト
      if(petSvg){ petSvg.style.display='none'; petSvg.innerHTML=''; }
      applyBg(); return;
    }
    if(petImg) petImg.style.display='none';
    if(petSvg) petSvg.style.display='block';
    var map=info.map||EGG, ps=8, BOX=120;
    var cols=Math.max.apply(null,map.map(function(r){ return r.length; })), rows=map.length;
    var ox=Math.round((BOX-cols*ps)/2), oy=Math.round((BOX-rows*ps)/2);
    var P=currentPAL();
    var s='';
    for(var y=0;y<map.length;y++) for(var x=0;x<map[y].length;x++){
      var c=map[y][x]; if(P[c]) s+='<rect x="'+(ox+x*ps)+'" y="'+(oy+y*ps)+'" width="'+ps+'" height="'+ps+'" fill="'+P[c]+'"/>';
    }
    petSvg.setAttribute('width',BOX); petSvg.setAttribute('height',BOX); petSvg.setAttribute('viewBox','0 0 '+BOX+' '+BOX);
    petSvg.innerHTML=s;
    applyBg();
  }

  /* ---- state ---- */
  var KEY='eigopet_v1', BAKKEY=KEY+'_bak';
  function today(){ return dayStr(new Date()); }
  var state = (function(){
    var s=null;
    var keys=[KEY, BAKKEY];
    for(var ki=0;ki<keys.length;ki++){ try{ var raw=localStorage.getItem(keys[ki]); if(raw){ s=JSON.parse(raw); break; } }catch(e){} }
    var def={ name:"ぴよ",lv:1,xp:0,hunger:80,happy:80,food:0,dirty:false,streak:1,learned:0,last:today(),grade:"g3",discipline:50,weight:5,careMiss:0,disciplineMiss:0,wagamama:false,babyType:null,childType:null,adultType:null,customImg:{},gameHi:0,dailyGoal:20,todayDate:today(),todayWords:[],lastGoalDate:null,metDates:[],wrongWords:[],petColor:'brown',bg:'meadow',freezeTickets:0,lastTicketDate:null,lastBoxWeek:null,titles:[],sound:true,mastery:{},learn:{},maxStreak:0,sick:false,sickSince:null,starveSince:null,gamesPlayed:0,genCorrect:0,sleepCount:0,dirtySince:null,born:Date.now(),stageSince:Date.now(),lifespanDays:12+Math.floor(Math.random()*3),youngType:null,memories:[],schemaV:2,lastBackupNudge:null,lastTick:Date.now(),keifuRevealed:[],moneyLog:[] };
    s=Object.assign({},def,s||{});
    s.dailyGoal=20; // 1日の目標は20に固定
    // おこづかい機能の初期化（家庭内でえさを買い取ってお金に）
    if(!Array.isArray(s.moneyLog)) s.moneyLog=[];
    // だんかいレート：デフォルトは 3段階（฿100=えさ5／฿200=えさ10／฿300=えさ15）。
    // 一度だけ この新デフォルトに 統一（moneyTiersV=2）。以降は 親が変えた設定を そのまま保持
    if(s.moneyTiersV!==2 || !Array.isArray(s.moneyTiers) || !s.moneyTiers.length){
      s.moneyTiers=[{cap:100,rate:5},{cap:200,rate:10},{cap:300,rate:15}];
      s.moneyTiersV=2;
    }
    // 単語ごとの学習状況(learn)へ移行：旧mastery(正解数>=2でおぼえた)＋wrongWords(にがて)から復元
    if(!s.learn || typeof s.learn!=='object'){ s.learn={}; }
    if(Object.keys(s.learn).length===0 && ((s.mastery&&Object.keys(s.mastery).length)||(s.wrongWords&&s.wrongWords.length))){
      for(var mk in (s.mastery||{})){ var lk=mk.toLowerCase(); s.learn[lk]={c:0,w:false,m:(s.mastery[mk]>=2)}; }
      (s.wrongWords||[]).forEach(function(x){ var wk=(x[0]||'').toLowerCase(); if(!wk) return; s.learn[wk]={c:(s.learn[wk]&&s.learn[wk].c)||0,w:true,m:false}; });
    }
    if(!WORDBANK[s.grade]) s.grade="jun2";
    if(s.grade==='g3') s.grade='jun2';
    // ライフサイクル改修(schemaV2)への移行：旧アダルト(lv4)→新アダルト(lv5)
    if(!s.schemaV || s.schemaV<2){ if(s.lv>=4) s.lv=5; if(typeof s.born!=='number') s.born=Date.now(); if(typeof s.stageSince!=='number') s.stageSince=Date.now(); if(typeof s.lifespanDays!=='number') s.lifespanDays=12; if(!Array.isArray(s.memories)) s.memories=[]; s.schemaV=2; }
    return s;
  })();
  function save(){ try{ var js=JSON.stringify(state); localStorage.setItem(KEY,js); localStorage.setItem(BAKKEY,js); }catch(e){} }
  function dayStr(d){ return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
  function yesterday(){ var d=new Date(today()); d.setDate(d.getDate()-1); return dayStr(d); }
  function todayDone(){ return (state.todayDate===today())&&(state.todayWords.length>=state.dailyGoal); }
  function displayStreak(){ return (state.lastGoalDate===today()||state.lastGoalDate===yesterday())?state.streak:0; }
  function todayCount(){ return (state.todayDate===today())?state.todayWords.length:0; }
  function isRewardTime(){ var h=new Date().getHours(); return h>=15&&h<17; }
  function weekId(ds){ var d=new Date(ds); var day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); return dayStr(d); }
  function thisWeekMet(){ var wk=weekId(today()); return state.metDates.filter(function(m){ return weekId(m)===wk; }).length+((state.metDates.indexOf(today())<0&&todayDone())?1:0); }
  // 2ばいデー：月〜土を ぜんぶ 目標達成すると、にちようが 終日 えさ2倍
  function isDoubleDay(){
    try{ var now=new Date(today());
      if(now.getDay()!==0) return false;                 // にちようだけ
      var md=state.metDates||[];
      for(var i=1;i<=6;i++){ var d=new Date(now); d.setDate(now.getDate()-i); if(md.indexOf(dayStr(d))<0) return false; }
      return true;
    }catch(e){ return false; }
  }
  function boxAvailable(){ return thisWeekMet()>=5&&state.lastBoxWeek!==weekId(today()); }

  /* ---- sound ---- */
  var _ac=null;
  function tone(freq,t0,dur,type){ try{ if(!_ac) _ac=new (window.AudioContext||window.webkitAudioContext)(); var o=_ac.createOscillator(), g=_ac.createGain(); o.type=type||'sine'; o.frequency.value=freq; o.connect(g); g.connect(_ac.destination); var t=_ac.currentTime+t0; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.18,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.start(t); o.stop(t+dur+0.02); }catch(e){} }
  function sfx(kind){ if(!state.sound) return;
    if(kind==='correct'){ tone(660,0,0.12); tone(880,0.09,0.14); }
    else if(kind==='combo'){ tone(784,0,0.1); tone(988,0.08,0.1); tone(1175,0.16,0.14); }
    else if(kind==='wrong'){ tone(200,0,0.18,'square'); }
    else if(kind==='fanfare'){ [523,659,784,1047].forEach(function(f,i){ tone(f,i*0.12,0.18); }); }
    else if(kind==='unlock'){ tone(880,0,0.1); tone(1320,0.1,0.18); }
    else if(kind==='flush'){ tone(520,0,0.12,'sawtooth'); tone(380,0.12,0.14,'sawtooth'); tone(260,0.26,0.22,'sawtooth'); }
  }

  /* ---- titles ---- */
  function onAnswer(en,ok){ var k=(en||'').toLowerCase(); var r=state.learn[k]||{c:0,w:false,m:false}; if(ok){ r.c=(r.c||0)+1; if(r.c>=(r.w?2:1)) r.m=true; } else { r.c=0; r.w=true; r.m=false; } state.learn[k]=r; }
  function isReviewWord(k){ var r=state.learn[k]; return !!(r&&r.w&&!r.m); }
  function masteredCount(){ var n=0; for(var k in state.learn){ if(state.learn[k].m) n++; } return n; }
  function reviewCount(){ var n=0; for(var k in state.learn){ var r=state.learn[k]; if(r.w&&!r.m) n++; } return n; }
  function gradeProgress(){ var ws=currentWords(), m=0, rev=0; for(var i=0;i<ws.length;i++){ var r=state.learn[ws[i][0].toLowerCase()]; if(r){ if(r.m) m++; else if(r.w) rev++; } } return {total:ws.length, mastered:m, review:rev}; }
  var TITLES=[
    {id:'w50',name:'たんごの たまご',cond:function(s){return s.learned>=50;}},
    {id:'w100',name:'100ご マスター',cond:function(s){return s.learned>=100;}},
    {id:'w300',name:'300ご マスター',cond:function(s){return s.learned>=300;}},
    {id:'w500',name:'500ご マスター',cond:function(s){return s.learned>=500;}},
    {id:'w1000',name:'1000ご マスター',cond:function(s){return s.learned>=1000;}},
    {id:'s3',name:'3にち つづけたね',cond:function(s){return s.streak>=3;}},
    {id:'s7',name:'1しゅうかん たっせい',cond:function(s){return s.streak>=7;}},
    {id:'s14',name:'2しゅうかん たっせい',cond:function(s){return s.streak>=14;}},
    {id:'s30',name:'1かげつ つづけた えらい！',cond:function(s){return s.streak>=30;}},
    {id:'mst50',name:'50ご かんぺき',cond:function(){ return masteredCount()>=50;}},
    {id:'adult',name:'アダルトに そだてた',cond:function(s){return s.lv>=5;}}
  ];
  function checkTitles(){ var got=null; TITLES.forEach(function(t){ if(state.titles.indexOf(t.id)<0&&t.cond(state)){ state.titles.push(t.id); got=t.name; } }); if(got){ bubble('しょうごう ゲット！'); sfx('fanfare'); } }
  function checkTickets(){ if(state.lastTicketDate!==today()&&todayCount()>=state.dailyGoal*2){ state.freezeTickets=Math.min(5,state.freezeTickets+1); state.lastTicketDate=today(); bubble('おやすみ券 ゲット！'); } }
  // 時間で少しずつ お腹・ごきげんが へる（世話している感）
  function decayStats(){
    var now=Date.now(), last=state.lastTick||now, hrs=(now-last)/3600000;
    state.lastTick=now;
    if(hrs<=0) return;
    hrs=Math.min(hrs,72);
    state.hunger=Math.max(0, state.hunger - 1.5*hrs);   // 約 -36/日
    state.happy =Math.max(0, state.happy  - 1.0*hrs);   // 約 -24/日
    if(state.sick) state.happy=Math.max(0, state.happy - 0.5*hrs);
    if(state.dirty) state.happy=Math.max(0, state.happy - 0.8*hrs); // よごれ放置で ごきげん低下
    // 「毎日世話」を成立させる：おなかが0 / 病気 が つづくと あぶない → お別れ(checkDeath)
    if(state.hunger<=0){ if(!state.starveSince) state.starveSince=now; } else { state.starveSince=null; }
    if(state.sick){ if(!state.sickSince) state.sickSince=now; } else { state.sickSince=null; }
  }
  function applyDaily(){
    if(state.todayDate!==today()){ state.todayDate=today(); state.todayWords=[]; }
    if(state.last===today()) return;
    var prev=new Date(state.last), now=new Date(today());
    var diff=Math.round((now-prev)/86400000);
    state.discipline=Math.max(0,state.discipline-5*Math.min(diff,3));
    if(state.hunger===0) state.careMiss++;
    if(state.happy===0) state.careMiss++;
    if(state.dirty) state.careMiss++; // よごれを 1日 ほうっておくと お世話ミス
    // 病気：健康なら基本5%、お腹/ごきげんが低い・よごれ放置・太りすぎだと上がる
    if(state.lv>=2&&!state.sick){ var wOver=Math.max(0,state.weight-25); var fat=Math.min(0.3,wOver*0.01)+(state.weight>=45?0.2:0); var p=0.05+(state.hunger<30?0.12:0)+(state.happy<30?0.12:0)+(state.dirty?0.12:0)+fat; if(Math.random()<p*Math.min(diff,3)){ state.sick=true; state.sickSince=Date.now(); } }
    // 寿命：よく勉強・世話できると延び、放置・病気放置・よごれ放置で縮む（10〜15日）
    var good=(state.lastGoalDate===yesterday())&&state.hunger>0&&state.happy>0&&!state.sick&&!state.dirty;
    state.lifespanDays=Math.max(10,Math.min(15,(state.lifespanDays||12)+(good?0.5:-1.5*Math.min(diff,3))));
    state.last=today();
    save();
  }

  /* ---- time-based lifecycle ---- */
  var DAY_MS=86400000;
  var STAGE_DUR=[5*60000, 60*60000, DAY_MS, 2*DAY_MS]; // タマゴ5分/ベビー1時間/キッズ1日/ヤング2日（たまごっち準拠）。寿命は10〜15日
  function ageMs(){ return Date.now()-(state.born||Date.now()); }
  function ageDays(){ return ageMs()/DAY_MS; }
  function stageElapsed(){ return Date.now()-(state.stageSince||Date.now()); }
  function studiedToday(){ return todayCount()>0; }
  function growthMult(){ return 1+Math.min(displayStreak(),10)*0.08; }
  function gainGP(base){ state.xp=(state.xp||0)+Math.max(1,Math.round(base*growthMult()*(state.sick?0.5:1))); }
  function addXp(n){ state.xp=(state.xp||0)+n; } // 互換用（えさ・ゲーム）。進化は時間+勉強で判定
  function fmtDur(ms){ if(ms<0) ms=0; var mn=Math.ceil(ms/60000); if(mn<60) return mn+'ふん'; var hr=Math.ceil(mn/60); if(hr<24) return hr+'じかん'; return Math.ceil(hr/24)+'にち'; }
  function checkEvolve(){
    if(state._farewell) return false;
    if(state.lv<5 && stageElapsed()>=STAGE_DUR[state.lv-1] && studiedToday()){
      state.lv++; state.stageSince=Date.now();
      if(state.lv===2&&!state.babyType){ state.babyType='a'; }
      else if(state.lv===3&&!state.childType){ state.childType='a'; }
      else if(state.lv===4&&!state.youngType){ state.youngType=youngTierKey(); }
      else if(state.lv===5&&!state.adultType){ state.adultType=pickAdultType(); }
      bubble(stageName()+"になった！"); sfx('fanfare'); save();
      if(typeof render==='function') render();
      return true;
    }
    return false;
  }
  var NEGLECT_MS=40*3600000; // おなかが0 / 病気 が およそ1.7日つづくと お別れ（毎日世話が必要）
  function checkDeath(){
    if(state._farewell){ showFarewell(petInfo()); return true; } // お別れ未完了で再起動した場合も再表示
    if(state.lv>=5 && ageDays()>=state.lifespanDays){ state._deathCause='life'; farewell(); return true; }
    if(state.lv>=2){ var now=Date.now();
      if(state.starveSince && now-state.starveSince>=NEGLECT_MS){ state._deathCause='hunger'; farewell(); return true; }
      if(state.sick && state.sickSince && now-state.sickSince>=NEGLECT_MS){ state._deathCause='sick'; farewell(); return true; }
    }
    return false;
  }
  var DEFAULT_TIERS=[{cap:100,rate:5},{cap:200,rate:10},{cap:300,rate:15}];
  function moneyTiers(){ var t=state.moneyTiers; return (Array.isArray(t)&&t.length)?t:DEFAULT_TIERS; }
  function moneyFor(food){
    // えさ→おこづかい。だんかいレート：฿capまで えさrate個＝฿1。たまるほど レートが かわる。最後のcapが 上限
    var tiers=moneyTiers(), baht=0, prevCap=0, remaining=food;
    for(var i=0;i<tiers.length;i++){ var span=tiers[i].cap-prevCap; if(span<=0) continue;
      var rate=Math.max(1,tiers[i].rate), take=Math.min(Math.floor(remaining/rate), span);
      baht+=take; remaining-=take*rate; prevCap=tiers[i].cap;
      if(take<span) break; // えさが つきた
    }
    return {total:baht, bonus:0};
  }
  function buyoutFood(){
    // お別れ時に 余ったえさを お金(バーツ)に買い取り。えさは繰り越さない
    var had=state.food||0, m=moneyFor(had);
    state.food=0;
    if(m.total<=0) return {baht:0, food:had, bonus:0};
    state.moneyLog=state.moneyLog||[];
    state.moneyLog.unshift({ date:today(), baht:m.total, food:had, name:state.name });
    if(state.moneyLog.length>60) state.moneyLog.length=60;
    return {baht:m.total, food:had, bonus:m.bonus};
  }
  function farewell(){
    state._farewell=true;
    var ai=petInfo();
    // けいふ(図鑑)に のこすのは アダルトまで育った子だけ。早いお別れ(病気・空腹)は記録しない
    if(state.lv>=5){
      state.memories=state.memories||[];
      state.memories.unshift({ name:state.name, adultType:state.adultType, adultName:ai.name, born:state.born, died:today(), days:Math.max(1,Math.round(ageDays())), learned:state.learned });
      if(state.memories.length>30) state.memories.length=30;
    }
    // おこづかいの かいとりは「寿命を まっとうした とき」だけ。早いお別れ(空腹・病気)は なし＆えさも消える
    if(state._deathCause==='hunger'||state._deathCause==='sick'){ state.food=0; state._lastBuyout={baht:0,food:0}; }
    else { state._lastBuyout=buyoutFood(); }
    save(); showFarewell(ai);
  }
  function rebirth(){
    state._farewell=false;
    state.lv=1; state.xp=0; state.born=Date.now(); state.stageSince=Date.now();
    state.hunger=80; state.happy=80; state.dirty=false; state.dirtySince=null; state.weight=5;
    state.careMiss=0; state.disciplineMiss=0; state.wagamama=false; state.gamesPlayed=0; state.genCorrect=0; state.sleepCount=0;
    state.babyType=null; state.childType=null; state.youngType=null; state.adultType=null;
    state.sick=false; state.sickSince=null; state.starveSince=null; state._deathCause=null; state.lifespanDays=12+Math.floor(Math.random()*3);
    var fw=document.getElementById('farewell'); if(fw) fw.style.display='none';
    save(); show('home'); render();
  }
  // お墓のドット絵（おせわ不足で 早いお別れの とき）
  var GRAVE_SVG='<svg width="116" height="116" viewBox="0 0 36 36" shape-rendering="crispEdges">'
    +'<rect x="6" y="30" width="24" height="3" fill="#7bb661"/>'
    +'<rect x="12" y="8" width="12" height="2" fill="#4b5563"/><rect x="11" y="10" width="14" height="20" fill="#4b5563"/>'
    +'<rect x="13" y="9" width="10" height="1" fill="#9aa0a6"/><rect x="12" y="10" width="12" height="19" fill="#9aa0a6"/>'
    +'<rect x="13" y="10" width="3" height="2" fill="#c4c9cf"/>'
    +'<rect x="17" y="13" width="2" height="8" fill="#5b6470"/><rect x="14" y="15" width="8" height="2" fill="#5b6470"/>'
    +'<rect x="14" y="24" width="8" height="2" fill="#6b7280"/>'
    +'<rect x="7" y="27" width="2" height="2" fill="#f472b6"/><rect x="9" y="26" width="2" height="2" fill="#fbbf24"/><rect x="8" y="29" width="1" height="2" fill="#2f7d4f"/>'
    +'</svg>';
  function showFarewell(ai){
    var el=document.getElementById('farewell'); if(!el){ rebirth(); return; }
    var c=state._deathCause, neglect=(c==='hunger'||c==='sick');
    var sp=document.getElementById('fwSprite');
    if(sp){
      if(neglect) sp.innerHTML=GRAVE_SVG;
      else sp.innerHTML='<div style="position:relative;display:inline-block;"><div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);font-size:15px;">⭐</div><div style="position:absolute;top:6px;left:-20px;font-size:13px;">✨</div><div style="position:absolute;top:2px;right:-20px;font-size:13px;">✨</div>'+spriteHTML(ai,4)+'</div>';
    }
    var nm=document.getElementById('fwName'); if(nm) nm.textContent=state.name+'（'+ai.name+'）';
    var days=Math.max(1,Math.round(ageDays()));
    var ms=document.getElementById('fwMsg');
    if(ms){
      if(c==='hunger') ms.innerHTML=days+'日 いっしょに いたよ。<br>おなかが すいて げんきが なくなっちゃった…<br><strong style="color:#c2410c;">まいにち ごはんを あげてね。</strong>';
      else if(c==='sick') ms.innerHTML=days+'日 いっしょに いたよ。<br>びょうきを なおして あげられなかった…<br><strong style="color:#c2410c;">びょうきの ときは はやく おくすりを あげてね。</strong>';
      else ms.innerHTML='<strong style="color:#29a65e;">いままで ありがとう！</strong><br>'+days+'日 いっしょに がんばったね。<br>おほしさまに なって みまもってるよ。';
    }
    var mo=document.getElementById('fwMoney');
    if(mo){ var bo=state._lastBuyout||{baht:0,food:0};
      if(!neglect && bo.baht>0){
        mo.style.display='block';
        mo.innerHTML='そだてきった ごほうび！ のこった えさ '+bo.food+'こ ぶんの おこづかい<br><span style="font-size:30px;color:#ea580c;">฿'+bo.baht+'</span>'
          +((bo.bonus>0)?'<br><span style="font-size:12px;color:#16a34a;font-weight:800;">（がんばりボーナス +฿'+bo.bonus+' こみ）</span>':'')
          +'<div style="margin-top:8px;padding:8px;background:#fffbeb;border:2px dashed #f59e0b;border-radius:8px;font-size:13px;color:#92400e;">👨‍👩‍👧 おとうさん・おかあさんに<br>この ฿'+bo.baht+' を みせてね！</div>';
      }
      else if(neglect){ mo.style.display='block'; mo.innerHTML='<span style="font-size:12px;color:var(--mut);">はやい おわかれの ときは おこづかいは もらえないよ…<br>つぎは さいごまで そだてよう！</span>'; }
      else { mo.style.display='none'; }
    }
    var nt=document.getElementById('fwNote'); if(nt) nt.textContent=neglect?'あたらしい いのちが やってくる…':'けいふに きろくされたよ。あたらしい いのちが やってくる…';
    el.style.display='flex';
  }
  function stageName(){ if(state.lv>=5) return "アダルト（"+adultInfo().name+"）"; if(state.lv>=4) return "ヤング（"+youngInfo().name+"）"; if(state.lv>=3) return "キッズ（"+childInfo().name+"）"; if(state.lv>=2) return "ベビー（"+babyInfo().name+"）"; return "タマゴ"; }

  /* ---- render ---- */
  function pct(v){ return Math.max(0,Math.min(100,Math.round(v)))+'%'; }
  function render(){
    document.getElementById('petNameText').textContent=state.name;
    document.getElementById('lv').textContent=state.lv;
    document.getElementById('stageBadge').textContent=stageName();
    document.getElementById('hungerBar').style.width=pct(state.hunger);
    document.getElementById('happyBar').style.width=pct(state.happy);
    document.getElementById('discBar').style.width=pct(state.discipline);
    // アダルトは「いのち残り」、それまでは「つぎの姿への成長」をバーで表示
    var isAdult=state.lv>=5;
    document.getElementById('xpBar').style.width=pct(isAdult?Math.max(0,(state.lifespanDays-ageDays())/(state.lifespanDays||12)*100):Math.min(100,stageElapsed()/STAGE_DUR[state.lv-1]*100));
    var xl=document.getElementById('xpLabel'); if(xl) xl.textContent=isAdult?'いのち':'せいちょう';
    document.getElementById('foodCnt').textContent='えさ '+state.food;
    document.getElementById('cleanCnt').textContent=state.dirty?'よごれてる':'きれい';
    document.getElementById('scoldCnt').textContent=state.wagamama?'いまだ！':'わがまま時';
    document.getElementById('learned').textContent=gradeProgress().mastered; // 下の進捗バーと同じ「おぼえた単語の実数」に統一
    document.getElementById('weight').textContent=Math.round(state.weight);
    var gl=document.getElementById('growthLine');
    if(gl){
      if(state.lv>=5){ var rem=Math.max(0,Math.ceil(state.lifespanDays-ageDays())); gl.textContent='いのち：あと やく '+rem+'日 ／ いっしょに '+Math.floor(ageDays())+'日め'; }
      else { var ready=stageElapsed()>=STAGE_DUR[state.lv-1];
        gl.textContent=ready?(studiedToday()?'もうすぐ しんか！':'きょう べんきょうすると しんか するよ！'):('つぎの すがたまで あと '+fmtDur(STAGE_DUR[state.lv-1]-stageElapsed())+(studiedToday()?'':' ＋ きょうの べんきょう')); }
    }
    document.getElementById('poop').style.display=state.dirty?'block':'none';
    document.getElementById('wagamark').style.display=(state.wagamama&&state.lv>=2)?'block':'none';
    document.getElementById('sickmark').style.display=state.sick?'block':'none';
    document.getElementById('medCnt').textContent=state.sick?('えさ'+MED_COST+'で なおす'):('げんき／えさ'+MED_COST);
    document.querySelectorAll('.gbtn').forEach(function(b){ b.classList.toggle('sel',b.dataset.g===state.grade); });
    drawPet();
    renderGoal();
  }
  function renderGoal(){
    var goal=state.dailyGoal, done=todayCount(), circ=201, p2=Math.min(1,done/goal);
    var fg=document.getElementById('ringFg'); if(fg) fg.setAttribute('stroke-dashoffset',Math.round(circ*(1-p2)));
    var rt=document.getElementById('ringText'); if(rt) rt.textContent=done+'/'+goal;
    var msg=document.getElementById('goalMsg');
    if(msg){ if(done>=goal){ msg.textContent='たっせい！'; msg.style.color='#1a6b3a'; } else { msg.textContent='あと '+(goal-done)+'こ！'; msg.style.color='var(--g)'; } }
    var ds=displayStreak();
    var sl=document.getElementById('streakL'); if(sl) sl.textContent=ds;
    var sh=document.getElementById('streak'); if(sh) sh.textContent=ds;
    var wd=document.getElementById('weekdots');
    if(wd){ var h=''; var W='月火水木金土日'; var mon=new Date(weekId(today())); for(var i=0;i<7;i++){ var dd2=new Date(mon); dd2.setDate(mon.getDate()+i); var dds=dayStr(dd2); var met2=state.metDates.indexOf(dds)>=0||(dds===today()&&done>=goal); var isT=(dds===today()); h+='<div class="wdot'+(met2?' met':'')+(isT?' today':'')+'">'+W[i]+'</div>'; } wd.innerHTML=h; }
    var gp=gradeProgress();
    var mb=document.getElementById('masterBar'); if(mb) mb.style.width=(gp.total?Math.round(gp.mastered/gp.total*100):0)+'%';
    var mn=document.getElementById('masterN'); if(mn) mn.textContent=gp.mastered;
    var gt=document.getElementById('gradeTotal'); if(gt) gt.textContent=gp.total;
    var rn=document.getElementById('reviewN'); if(rn) rn.textContent=gp.review;
    var tn=document.getElementById('ticketN'); if(tn) tn.textContent=state.freezeTickets;
    var wm=document.getElementById('weekMet'); if(wm) wm.textContent=Math.min(5,thisWeekMet());
    var tt=document.getElementById('titleN'); if(tt) tt.textContent=(state.titles.length)+'/'+TITLES.length;
    var bb=document.getElementById('boxBtn'); if(bb) bb.style.display=boxAvailable()?'block':'none';
    var rb=document.getElementById('rewardBanner'); if(rb) rb.style.display=isRewardTime()?'block':'none';
    var db=document.getElementById('doubleBanner');
    if(db){ if(isDoubleDay()){ db.style.display='block'; db.textContent='🎉 きょうは 2ばいデー！ えさ 2ばい（月〜土 ぜんぶ たっせい！）'; }
      else { var now2=new Date(today()), wd2=(now2.getDay()+6)%7; if(wd2>=1&&wd2<=5){ db.style.display='block'; db.style.background='#f0fdf4'; db.style.borderColor='#bbf7d0'; db.style.color='#15803d'; db.textContent='月〜土 ぜんぶ たっせいで にちよう 2ばいデー！'; } else { db.style.display='none'; } }
    }
    document.querySelectorAll('#sndset .optbtn').forEach(function(b){ b.classList.toggle('sel',(b.dataset.v==='1')===!!state.sound); });
    var fc=document.getElementById('fcSprite');
    if(fc){
      if(state.lv>=5){ var ai=adultInfo(); fc.innerHTML=spriteHTML(ai,3); document.getElementById('fcTitle').textContent='そだった アダルト'; document.getElementById('fcName').textContent=ai.name; document.getElementById('fcMsg').textContent='りっぱに そだったね！'; }
      else { var tier2=predictedTier(), pa=ADULTS[predictedAdultKey()]; fc.innerHTML=spriteHTML(pa,3);
        document.getElementById('fcTitle').textContent='いまの ペースだと… '+(FAMILY_NAME[tier2]||'');
        document.getElementById('fcName').textContent=pa.name+' など';
        var met=genMetDays(), miss=careMissTotal(), needS=Math.max(0,3-met);
        var base='ランク：'+TIER_LABEL[tier2]+'（もくひょうたっせい '+met+'日／せわ・しつけミス '+miss+'かい）';
        var tail=(tier2==='star')?' さいこう！この ちょうしで！':(' さいこうまで あと '+needS+'日 たっせい');
        document.getElementById('fcMsg').textContent=base+'。'+tail+' ／ ミスを へらすと レアも！'; }
    }
    var nd=document.getElementById('nudge');
    if(nd){ if(done>=goal){ nd.style.display='none'; } else { nd.style.display='block'; nd.textContent=done>0?('きょうは あと '+(goal-done)+'こ！ がくしゅうしよう →'):('きょうの べんきょうを はじめよう！ →'); } }
  }
  function showGoalCelebration(){ document.getElementById('celeMsg').innerHTML='きょう '+state.dailyGoal+'こ おぼえたよ！<br>'+displayStreak()+'にち れんぞく'; document.getElementById('celeReward').textContent='ごほうび：えさ +5 ／ ごきげん まんたん'; document.getElementById('goalCele').style.display='flex'; cheer(); }
  var bubT;
  function bubble(t){ var b=document.getElementById('bubble'); b.textContent=t; b.style.opacity=1; clearTimeout(bubT); bubT=setTimeout(function(){ b.style.opacity=0; },1100); }
  function cheer(){ var w=document.getElementById('petWrap'); if(!w) return; wakePet(); w.classList.add('happy'); setTimeout(function(){ w.classList.remove('happy'); },1200); }

  /* ---- care ---- */
  document.getElementById('bFeed').onclick=function(){ if(state.lv<2){ bubble("タマゴは まだ たべられないよ"); return; } if(state.hunger>=99){ bubble("おなか いっぱい！"); return; } if(state.food<=0){ bubble("べんきょうして えさをあつめよう"); return; } state.food--; state.hunger=Math.min(100,state.hunger+25); if(state.hunger>0) state.starveSince=null; state.happy=Math.min(100,state.happy+5); state.weight+=1; addXp(5); if(Math.random()<0.45) makeDirty(); bubble("もぐもぐ"); cheer(); save(); render(); };
  document.getElementById('bSnack').onclick=function(){ if(state.lv<2){ bubble("タマゴは まだ たべられないよ"); return; } if(state.happy>=85){ bubble("もう ごきげん！ おかしは たまに ね"); return; } state.happy=Math.min(100,state.happy+14); state.weight+=3; if(Math.random()<0.35) makeDirty(); bubble("おいしい！でも たいじゅう+"); cheer(); save(); render(); };
  function makeDirty(){ if(!state.dirty){ state.dirty=true; state.dirtySince=Date.now(); } }
  document.getElementById('bPlay').onclick=function(){ if(state.food<=0){ bubble("べんきょうして えさを あつめよう"); return; } show('gameSelect'); };
  function consumePlay(){ state.food--; state.weight=Math.max(5,state.weight-2); state.hunger=Math.max(0,state.hunger-4); state.gamesPlayed=(state.gamesPlayed||0)+1; save(); } // あそぶと 運動：体重-2・おなか-4
  document.getElementById('backSelect').onclick=function(){ show('home'); render(); };
  document.getElementById('selJump').onclick=function(){ if(state.food<=0){ bubble('えさが たりない'); return; } consumePlay(); startGame(); };
  document.getElementById('selSea').onclick=function(){ if(state.food<=0){ bubble('えさが たりない'); return; } consumePlay(); startSeaGame(); };
  document.getElementById('bScold').onclick=function(){ if(state.wagamama){ state.wagamama=false; state.discipline=Math.min(100,state.discipline+12); clearTimeout(wagaTimer); bubble("いいこ だね！"); cheer(); } else { state.discipline=Math.max(0,state.discipline-6); bubble("いまは しからないで…"); } save(); render(); };
  var flushing=false;
  document.getElementById('bClean').onclick=function(){ if(flushing) return; if(state.dirty){ flushing=true; var p=document.getElementById('poop'), fl=document.getElementById('flush'); p.classList.add('flushing'); fl.classList.add('on'); bubble("ザブーン！"); sfx('flush'); setTimeout(function(){ p.classList.remove('flushing'); fl.classList.remove('on'); flushing=false; state.dirty=false; state.dirtySince=null; state.happy=Math.min(100,state.happy+10); bubble("ぴかぴか"); save(); render(); },1000); } else bubble("きれいだよ"); };
  var MED_COST=20;
  document.getElementById('bMed').onclick=function(){ if(!state.sick){ bubble("げんきだよ！"); return; } if(state.food<MED_COST){ bubble("おくすりは えさ"+MED_COST+"こ ひつよう…"); return; } state.food-=MED_COST; state.sick=false; state.sickSince=null; state.happy=Math.min(100,state.happy+20); bubble("おくすりで げんきに なった！"); sfx('unlock'); cheer(); save(); render(); };
  document.getElementById('petName').onclick=function(){ var n=prompt("ペットの なまえは？",state.name); if(n&&n.trim()){ state.name=n.trim().slice(0,8); save(); render(); } };
  document.getElementById('grades').onclick=function(e){ var b=e.target.closest('.gbtn'); if(!b) return; state.grade=b.dataset.g; save(); render(); bubble(WORDBANK[state.grade].label); };

  /* ---- admin ---- */
  function spriteSVG(map,cell,pal){ var P=pal||PAL; var cols=Math.max.apply(null,map.map(function(r){ return r.length; })), rows=map.length; var s=''; for(var y=0;y<map.length;y++) for(var x=0;x<map[y].length;x++){ var c=map[y][x]; if(P[c]) s+='<rect x="'+(x*cell)+'" y="'+(y*cell)+'" width="'+cell+'" height="'+cell+'" fill="'+P[c]+'"/>'; } return '<svg width="'+(cols*cell)+'" height="'+(rows*cell)+'" viewBox="0 0 '+(cols*cell)+' '+(rows*cell)+'" shape-rendering="crispEdges">'+s+'</svg>'; }
  function spriteHTML(info,cell,pal){ if(info&&info.img){ var sz=Math.round(cell*13); return '<img src="'+imgSrc(info.img)+'" width="'+sz+'" height="'+sz+'" style="image-rendering:pixelated;display:block;" alt="">'; } return spriteSVG(info.map,cell,(info&&info.pal)||pal); }
  function tnode(info,label,small,pal){ return '<div class="tnode'+(small?' small':'')+'"><div class="tsprite">'+spriteHTML(info,small?3:4,pal)+'</div><div class="tlabel">'+label+'</div></div>'; }
  function gcardHTML(info){ return '<div class="gcard"><div class="gsprite">'+spriteHTML(info,5)+'</div><div class="gname">'+info.name+'</div><div class="gdesc">'+info.desc+'</div></div>'; }
  function gridHTML(list){ return '<div class="ggrid">'+list.map(function(c){ return gcardHTML(c); }).join('')+'</div>'; }
  function collectedAdults(){ var set={}; (state.memories||[]).forEach(function(m){ if(m.adultType) set[normAdult(m.adultType)]=true; }); if(state.lv>=5&&state.adultType) set[normAdult(state.adultType)]=true; return set; }
  function renderAdmin(){
    var col=collectedAdults(), ak=Object.keys(ADULTS), got=ak.filter(function(k){return col[k];}).length;
    var adultHTML='<div class="gstage">アダルト ずかん（'+got+'/'+ak.length+'）</div><div class="ggrid">'+ak.map(function(k){ var a=ADULTS[k], has=col[k]; var aff=has&&affinityLabel(k)?'<div class="gaff">🌱 '+affinityLabel(k)+'<div style="font-size:9px;color:var(--mut);font-weight:700;margin-top:1px;">'+affinityHint(k)+'</div></div>':''; return '<div class="gcard"'+(has?'':' style="opacity:.4;"')+'><div class="gsprite">'+(has?spriteHTML(a,5):'<div style="height:65px;display:flex;align-items:center;justify-content:center;font-size:28px;color:var(--mut);">？</div>')+'</div><div class="gname">'+(has?a.name:'？？？')+'</div><div class="gdesc">'+(has?a.desc:'まだ そだてていない')+'</div>'+aff+'</div>'; }).join('')+'</div>';
    document.getElementById('adminGallery').innerHTML='<div class="gstage">タマゴ</div>'+gridHTML([EGG_INFO])+'<div class="gstage">ベビー</div>'+gridHTML(Object.values(BABIES))+'<div class="gstage">キッズ</div>'+gridHTML(Object.values(CHILDREN))+'<div class="gstage">ヤング</div>'+gridHTML(Object.values(YOUNGS))+adultHTML;
    var tree='<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:2px 0 4px;">'+tnode(EGG_INFO,'タマゴ',true)+'<span class="larrow">→</span>'+tnode(BABIES.a,BABIES.a.name,true)+'<span class="larrow">→</span>'+tnode(CHILDREN.a,CHILDREN.a.name,true)+'</div><div class="tarrow">↓</div>';
    var ytiers=[['star','⭐さいこう'],['good','◎よいこ'],['normal','○ふつう'],['wild','△わんぱく']];
    var nowTier=predictedTier();
    tree+='<div class="keifuHint" style="background:#eff6ff;border-color:#bfdbfe;"><div style="font-size:12px;font-weight:800;color:var(--ink);line-height:1.6;">いまの ランク：<b style="color:#2563eb;">'+TIER_LABEL[nowTier]+'</b>（もくひょうたっせい '+genMetDays()+'日／せわ・しつけミス '+careMissTotal()+'かい）<br><span style="font-size:11px;color:var(--mut);font-weight:700;">たっせい日が おおいほど 上の系統へ。ミスを へらすと まれに ★レア（サボりでは 出ない）</span></div></div>';
    tree+='<div class="tiertag">ヤング（おせわランクで きまる）</div><div class="tgrid4">'+ytiers.map(function(t){ return tnode(YOUNGS[t[0]],YOUNGS[t[0]].name,true); }).join('')+'</div><div class="tarrow">↓</div>';
    // アダルト：入手ずみは無料表示。それ以外は「？」を自分でタップ＋えさ で 1体ずつ ひらける
    var HINT_COST=50;
    var allAdults=[]; Object.keys(ADULT_TIERS).forEach(function(t){ ADULT_TIERS[t].forEach(function(id){ allAdults.push(id); }); });
    var rev=state.keifuRevealed||[], revealed={}, totalRev=0;
    allAdults.forEach(function(id){ if(col[id]||rev.indexOf(id)>=0){ revealed[id]=true; totalRev++; } });
    tree+='<div class="keifuHint"><div style="font-size:12px;font-weight:800;color:var(--ink);line-height:1.5;">そだてかたの ヒント <b>'+totalRev+' / '+allAdults.length+'</b><br><span style="font-size:11px;color:var(--mut);font-weight:700;">すきな「？」を タップ＋🍚'+HINT_COST+' で すがたが わかるよ</span></div></div>';
    var lockNode=function(id){ return '<button class="tnode small lock" data-id="'+id+'"><div class="tsprite">？</div><div class="tlabel">🍚×'+HINT_COST+'</div></button>'; };
    // ヤング1種ごとに「ヤング → アダルト6種」を 矢印つきの1行で 表示（レアは どのヤングからでも）
    var lineTiers=[['star','⭐さいこう'],['good','◎よいこ'],['normal','○ふつう'],['wild','△わんぱく']];
    lineTiers.forEach(function(t){ var y=YOUNGS[t[0]];
      tree+='<div class="tiertag">おせわ '+t[1]+' → '+FAMILY_NAME[t[0]]+'</div><div class="lrow"><div class="lfrom">'+tnode(y,y.name,true)+'</div><div class="larrow">→</div><div class="lgrid">'+LINEAGE[t[0]].map(function(id){ return revealed[id]?tnode(ADULTS[id],ADULTS[id].name,true):lockNode(id); }).join('')+'</div></div>';
    });
    tree+='<div class="tiertag">★レア（じょうずに そだてた ごほうび）</div><div class="lrow"><div class="lfrom" style="font-size:11px;font-weight:800;color:var(--mut);text-align:center;line-height:1.5;">どの系統<br>からでも<br><span style="font-size:10px;">(まれに)</span></div><div class="larrow">→</div><div class="lgrid">'+RARE_ADULTS.map(function(id){ return revealed[id]?tnode(ADULTS[id],ADULTS[id].name,true):lockNode(id); }).join('')+'</div></div>';
    if((state.memories||[]).length){
      var mh='<div class="gstage">おもいで（これまでの子）</div>';
      state.memories.forEach(function(m){ var ai=adultById(m.adultType); mh+='<div class="gcard" style="display:flex;gap:12px;align-items:center;text-align:left;margin-bottom:8px;"><div style="flex:none;">'+spriteHTML(ai,3)+'</div><div><div class="gname">'+m.name+'（'+(m.adultName||ai.name)+'）</div><div class="gdesc">'+m.days+'日 いっしょ ／ '+m.died+' たびだち ／ おぼえた '+m.learned+'こ</div></div></div>'; });
      tree=mh+'<div class="gstage">しんかの けいふ</div>'+tree;
    }
    document.getElementById('adminTree').innerHTML=tree;
  }
  var wlGrade='jun2', wlWrongOnly=false;
  function renderWordList(){
    var words=(WORDBANK[wlGrade]||WORDBANK.jun2).words;
    var q=(document.getElementById('wlSearch').value||'').trim().toLowerCase();
    var list=q?words.filter(function(w){ return w[0].toLowerCase().indexOf(q)>=0||(w[1]||'').indexOf(q)>=0||(w[2]||'').indexOf(q)>=0; }):words;
    if(wlWrongOnly) list=list.filter(function(w){ return isReviewWord(w[0].toLowerCase()); });
    var EZ=(typeof EASY!=='undefined')?EASY:{};
    var html='';
    for(var i=0;i<list.length;i++){
      var w=list[i], pos=POS_JA[w[3]]||w[3]||'';
      var yomi=w[2]?'<span class="wlyomi">'+escJa(w[2])+'</span>':'';
      var ez=EZ[w[0]]||EZ[w[0].toLowerCase()];
      var easyLine=ez?'<div class="wleasy">やさしく：'+escJa(ez)+'</div>':'';
      var r=state.learn[w[0].toLowerCase()], review=!!(r&&r.w&&!r.m), mastered=!!(r&&r.m);
      var badge=mastered?'<span class="wlmast">✓おぼえた</span>':(review?'<span class="wlwrong">🔁ふくしゅう</span>':'');
      html+='<div class="wlrow'+(review?' iswrong':'')+'"><div class="wltop"><div class="wlen">'+escJa(w[0])+(pos?'<span class="wlpos">'+pos+'</span>':'')+badge+'</div><div class="wlja">'+yomi+'<span>'+escJa(w[1])+'</span></div></div>'+easyLine+'</div>';
    }
    document.getElementById('wlCount').textContent=list.length+'ご ／ おぼえた '+masteredCount()+' ／ ふくしゅうまち '+reviewCount();
    document.getElementById('wlList').innerHTML=html;
    document.querySelectorAll('#wlGrades .gbtn').forEach(function(b){ b.classList.toggle('sel',b.dataset.g===wlGrade); });
    document.getElementById('wlWrongBtn').classList.toggle('sel',wlWrongOnly);
  }
  document.getElementById('wlGrades').onclick=function(e){ var b=e.target.closest('.gbtn'); if(!b) return; wlGrade=b.dataset.g; renderWordList(); };
  document.getElementById('wlSearch').oninput=function(){ renderWordList(); };
  document.getElementById('wlWrongBtn').onclick=function(){ wlWrongOnly=!wlWrongOnly; renderWordList(); };
  var curAdminTab='zukan';
  function setAdminTab(t){ curAdminTab=t; ['zukan','kisekae','keifu','tango','data'].forEach(function(k){ document.getElementById('tab-'+k).style.display=(k===t)?'block':'none'; }); document.querySelectorAll('#atabs .atab').forEach(function(b){ b.classList.toggle('sel',b.dataset.t===t); }); if(t==='kisekae') renderCosmetics(); if(t==='tango') renderWordList(); if(t==='data') renderData(); window.scrollTo(0,0); }
  function lockParent(){ var pp=document.getElementById('okParent'); if(pp) pp.style.display='none'; var lk=document.getElementById('okLock'); if(lk) lk.style.display='block'; }
  function unlockParent(){ var pp=document.getElementById('okParent'); if(pp) pp.style.display='block'; var lk=document.getElementById('okLock'); if(lk) lk.style.display='none'; }
  function renderMoney(){
    lockParent(); // タブを開くたび おうち設定は かくす（子供に見えないように）
    var f=document.getElementById('okFood'); if(f) f.textContent=(state.food||0);
    var m=moneyFor(state.food||0);
    var fb=document.getElementById('okFoodBaht'); if(fb) fb.textContent='฿'+m.total;   // 子供には 見込み額だけ（内訳は出さない）
    var cn=document.getElementById('okCapNote'); if(cn) cn.textContent='※この額は あくまで みこみです（じょうげん あり）';
    var tc=document.getElementById('okTiers'); if(tc) tc.innerHTML=moneyTiers().map(function(t){ return tierRowHTML(t.cap,t.rate); }).join('');
    var h=document.getElementById('okRateHint'); if(h){ var last=moneyTiers(); last=last.length?last[last.length-1].cap:0; h.textContent='いまの えさ '+(state.food||0)+'こ → みこみ ฿'+m.total+'（1匹 さいだい ฿'+last+'）'; }
    var log=document.getElementById('okLog');
    if(log){ var L=state.moneyLog||[];
      if(!L.length){ log.innerHTML='<div style="font-size:12px;color:var(--mut);font-weight:700;text-align:center;padding:12px;">まだ ありません</div>'; }
      else { log.innerHTML=L.map(function(e){ return '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border:2px solid var(--bdr);border-radius:8px;margin-bottom:6px;font-size:12px;font-weight:700;color:var(--ink);"><span>'+e.date+' <span style="color:var(--mut);">'+(e.name||'')+' えさ'+e.food+'</span></span><span style="color:#ea580c;font-weight:900;">＋฿'+e.baht+'</span></div>'; }).join(''); }
    }
  }
  function tierRowHTML(cap,rate){ var inp='padding:7px;border:2px solid var(--bdr);border-radius:8px;font-size:14px;font-family:inherit;text-align:center;background:var(--card);color:var(--ink);';
    return '<div class="oktier" style="display:flex;align-items:center;gap:5px;margin-bottom:6px;font-size:13px;font-weight:700;color:var(--ink);">฿<input class="okTierCap" type="number" min="1" max="99999" value="'+(cap||'')+'" style="width:64px;'+inp+'"> まで<span style="margin-left:auto;">えさ</span><input class="okTierRate" type="number" min="1" max="99999" value="'+(rate||'')+'" style="width:54px;'+inp+'">＝฿1<button class="okTierDel" type="button" style="border:none;background:none;color:#dc2626;font-size:16px;font-weight:900;cursor:pointer;font-family:inherit;padding:0 2px;">✕</button></div>'; }
  function readTiers(){ var arr=[]; document.querySelectorAll('#okTiers .oktier').forEach(function(r){ var cap=parseInt(r.querySelector('.okTierCap').value,10), rate=parseInt(r.querySelector('.okTierRate').value,10); if(cap>=1&&rate>=1) arr.push({cap:cap,rate:rate}); }); arr.sort(function(a,b){ return a.cap-b.cap; }); var out=[],prev=0; arr.forEach(function(t){ if(t.cap>prev){ out.push(t); prev=t.cap; } }); return out.length?out:DEFAULT_TIERS.slice(); }
  (function(){
    var PARENT_PW='0785770131'; // おうちのひとコード（固定）
    var lk=document.getElementById('okLock'); if(lk) lk.onclick=function(){
      var en=prompt('おうちのひとコードを いれてね');
      if(en===null) return;
      if((en||'').replace(/\D/g,'')===PARENT_PW) unlockParent();
      else bubble('コードが ちがいます');
    };
    var rl=document.getElementById('okRelock'); if(rl) rl.onclick=lockParent;
    var pc=document.getElementById('okPinChange'); if(pc) pc.style.display='none';
    var ta=document.getElementById('okTierAdd'); if(ta) ta.onclick=function(){ var tc=document.getElementById('okTiers'); if(tc) tc.insertAdjacentHTML('beforeend',tierRowHTML('','')); };
    var tcont=document.getElementById('okTiers'); if(tcont) tcont.addEventListener('click',function(e){ var d=e.target.closest('.okTierDel'); if(d){ var row=d.closest('.oktier'); if(row) row.remove(); } });
    var sv=document.getElementById('okSave'); if(sv) sv.onclick=function(){
      state.moneyTiers=readTiers(); save(); renderMoney(); bubble('せってい を ほぞんしたよ');
    };
  })();
  function renderData(){ document.getElementById('dataStat').textContent='なまえ：'+state.name+' ／ レベル '+state.lv+' ／ おぼえた '+masteredCount()+'こ ／ 🔥'+displayStreak()+'にち'; document.getElementById('exportBox').style.display='none'; document.getElementById('btnCopy').style.display='none'; document.getElementById('importBox').value=''; document.getElementById('dataMsg').textContent=''; }
  function encodeState(){ return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); }
  document.getElementById('btnExport').onclick=function(){ var box=document.getElementById('exportBox'); box.value=encodeState(); box.style.display='block'; document.getElementById('btnCopy').style.display='block'; };
  document.getElementById('btnCopy').onclick=function(){ var box=document.getElementById('exportBox'); box.select(); var ok=function(){ document.getElementById('dataMsg').style.color='var(--g)'; document.getElementById('dataMsg').textContent='コピーしました！'; }; if(navigator.clipboard){ navigator.clipboard.writeText(box.value).then(ok,function(){ try{ document.execCommand('copy'); ok(); }catch(e){} }); } else { try{ document.execCommand('copy'); ok(); }catch(e){} } };
  document.getElementById('btnImport').onclick=function(){ var msg=document.getElementById('dataMsg'); var code=(document.getElementById('importBox').value||'').trim(); if(!code){ msg.style.color='#9b2222'; msg.textContent='コードを はりつけてね'; return; } var obj=null; try{ obj=JSON.parse(decodeURIComponent(escape(atob(code)))); }catch(e){ try{ obj=JSON.parse(code); }catch(e2){} } if(!obj||typeof obj!=='object'||(obj.lv===undefined&&obj.learned===undefined)){ msg.style.color='#9b2222'; msg.textContent='この コードは よみこめません'; return; } if(!confirm('いまの データを この バックアップで 上書きします。よろしいですか？')) return; state=Object.assign({},state,obj); if(!WORDBANK[state.grade]) state.grade='g3'; save(); msg.style.color='var(--g)'; msg.textContent='ふっかつしました！'; renderData(); render(); };
  document.getElementById('btnDownload').onclick=function(){ var msg=document.getElementById('dataMsg'); try{ var blob=new Blob([JSON.stringify(state)],{type:'application/json'}); var url=URL.createObjectURL(blob); var a=document.createElement('a'); var d=new Date(), ds=d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2); a.href=url; a.download='eigopet_backup_'+ds+'.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function(){ URL.revokeObjectURL(url); },1500); msg.style.color='var(--g)'; msg.textContent='ファイルに ほぞんしました！'; }catch(e){ msg.style.color='#9b2222'; msg.textContent='ほぞん できないときは コードを つかってね'; } };
  document.getElementById('fileImport').onchange=function(e){ var f=e.target.files&&e.target.files[0]; var msg=document.getElementById('dataMsg'); if(!f) return; var r=new FileReader(); r.onload=function(){ var obj=null; try{ obj=JSON.parse(r.result); }catch(err){} if(!obj||typeof obj!=='object'||(obj.lv===undefined&&obj.learned===undefined)){ msg.style.color='#9b2222'; msg.textContent='この ファイルは よみこめません'; return; } if(!confirm('いまの データを この バックアップで 上書きします。よろしいですか？')) return; state=Object.assign({},state,obj); if(!WORDBANK[state.grade]) state.grade='jun2'; save(); msg.style.color='var(--g)'; msg.textContent='ふっかつしました！'; renderData(); render(); }; r.readAsText(f); e.target.value=''; };
  document.getElementById('atabs').onclick=function(e){ var b=e.target.closest('.atab'); if(!b) return; setAdminTab(b.dataset.t); };
  function buyReveal(id){
    if(!ADULTS[id]) return;
    if(!Array.isArray(state.keifuRevealed)) state.keifuRevealed=[];
    if(state.keifuRevealed.indexOf(id)>=0) return; // すでに開いてる
    var cost=50; if(state.food<cost){ bubble('えさが たりない（'+cost+'こ ひつよう）'); return; }
    state.food-=cost; state.keifuRevealed.push(id); save(); sfx('unlock'); cheer(); renderAdmin(); render();
  }
  document.getElementById('adminTree').addEventListener('click',function(e){ var b=e.target.closest('.tnode.lock'); if(b&&b.dataset.id) buyReveal(b.dataset.id); });
  function cosCard(kind,it,locked,sel){ var swatch; if(kind==='color'){ swatch='<div class="cosswatch" style="background:'+PAL.w+';border:3px solid '+it.o+'"></div>'; } else { var inner=it.scene?sceneWrap(SCENES[it.scene]()):('<div style="height:30%;background:'+(it.ground||'#dfd3b0')+'"></div>'); swatch='<div class="cosswatch" style="background:'+it.bg+'">'+inner+'</div>'; } var lbl=locked?('🔒 '+it.need+'ご'):it.name; return '<button class="coscard'+(sel?' sel':'')+(locked?' locked':'')+'" data-kind="'+kind+'" data-id="'+it.id+'"'+(locked?' disabled':'')+'>'+swatch+'<span>'+lbl+'</span></button>'; }
  function renderCosmetics(){ var bl=document.getElementById('bgList'); if(bl) bl.innerHTML=BGS.map(function(b){ return cosCard('bg',b,state.learned<b.need,state.bg===b.id); }).join(''); }
  function equipCos(kind,id){ if(kind==='color') state.petColor=id; else state.bg=id; save(); render(); renderCosmetics(); }
  document.getElementById('tab-kisekae').onclick=function(e){ var b=e.target.closest('.coscard'); if(!b||b.disabled) return; equipCos(b.dataset.kind,b.dataset.id); };
  document.getElementById('backAdmin').onclick=function(){ gotoTab('home'); };

  /* ---- games ---- */
  var game=null;
  function drawPetCanvas(ctx,map,ox,oy,cell){ for(var y=0;y<map.length;y++) for(var x=0;x<map[y].length;x++){ var c=map[y][x]; if(PAL[c]){ ctx.fillStyle=PAL[c]; ctx.fillRect(ox+x*cell,oy+y*cell,cell,cell); } } }
  function drawPetSprite(ctx,g,ox,oy){ if(g.img&&g.img.complete&&g.img.naturalWidth){ ctx.imageSmoothingEnabled=false; ctx.drawImage(g.img,ox,oy,g.petW,g.petH); } else if(g.map){ drawPetCanvas(ctx,g.map,ox,oy,g.cell); } }
  function gameSetup(title,instr,btn){ show('game'); document.getElementById('gover').style.display='none'; document.getElementById('gTitle').textContent=title; document.getElementById('gInstr').textContent=instr; document.getElementById('gJump').textContent=btn; var cv=document.getElementById('gcanvas'); var info=petInfo(); var img=info.img?getImg(info.img):null; var map=petMap(),cell=3; var pw=img?40:Math.max.apply(null,map.map(function(r){ return r.length; }))*cell, ph=img?40:map.length*cell; return { cv:cv,ctx:cv.getContext('2d'),W:cv.width,H:cv.height,map:map,cell:cell,img:img,petW:pw,petH:ph }; }
  function startGame(){ var s=gameSetup('ジャンプゲーム','タップで ジャンプ！ しょうがいぶつを よけよう','ジャンプ'); var groundY=s.H-26,petW=s.petW,petH=s.petH; if(game) cancelAnimationFrame(game.raf); game={ mode:'jump',ctx:s.ctx,W:s.W,H:s.H,groundY:groundY,map:s.map,cell:s.cell,img:s.img,petW:petW,petH:petH,px:34,py:groundY-petH,vy:0,onGround:true,jumps:0,obs:[],speed:2.6,t:0,score:0,over:false,raf:0 }; loopGame(); }
  function jump(){ if(game&&!game.over&&game.jumps<2){ game.vy=-10.4; game.jumps++; game.onGround=false; } } // 重力アップに合わせて 跳ぶ力も キビキビ
  function startSeaGame(){ var s=gameSetup('うみゲーム','タップで うく！ いわの あいだを とおろう','うく'); var petW=s.petW,petH=s.petH; if(game) cancelAnimationFrame(game.raf); game={ mode:'sea',ctx:s.ctx,W:s.W,H:s.H,map:s.map,cell:s.cell,img:s.img,petW:petW,petH:petH,px:40,py:Math.round(s.H/2-petH/2),vy:0,obs:[],gap:Math.round(petH*2.8),speed:2.2,t:0,score:0,over:false,raf:0 }; loopSea(); }
  function floatUp(){ if(game&&!game.over&&game.mode==='sea'){ game.vy=-3.6; } }
  function loopSea(){ var g=game; if(!g||g.over) return; g.t++; g.speed+=0.0012;
    if(g.t>90 && (g.obs.length===0||(g.W-g.obs[g.obs.length-1].x)>(155+Math.random()*70))){ var gw=16+Math.floor(Math.random()*6); var og=Math.max(Math.round(g.petH*2.0), g.gap-Math.floor(g.t/150)); g.gateN=(g.gateN||0)+1; var gy=(g.gateN<=3)?Math.round((g.H-og)/2+(Math.random()*30-15)):(24+Math.floor(Math.random()*Math.max(1,g.H-og-48))); g.obs.push({x:g.W,w:gw,gy:gy,og:og}); } // 最初の3枚は 中央よりで やさしく。すきまは だんだん せまく
    g.obs.forEach(function(o){ o.x-=g.speed; }); g.obs=g.obs.filter(function(o){ return o.x+o.w>-4; });
    // フラッピー系の ふんわり物理：おちるのは ゆっくり、さいこう速度つき
    g.vy+=0.22; if(g.vy>3.6) g.vy=3.6; g.py+=g.vy;
    if(g.py<0){ g.py=0; g.vy=0; } if(g.py+g.petH>g.H){ g.py=g.H-g.petH; g.vy=0; } // 上下の はしでは しなない（いわ だけが てき）
    var pl=g.px+5,pr=g.px+g.petW-5,pt=g.py+3,pb=g.py+g.petH-3;
    for(var oi=0;oi<g.obs.length;oi++){ var o=g.obs[oi]; var gp=o.og||g.gap;
      if(pl<o.x+o.w&&pr>o.x){ if(pt<o.gy||pb>o.gy+gp){ endGame(); return; } }
      if(!o.passed && o.x+o.w<g.px){ o.passed=true; g.score+=5; } // いわを 通過で +5
    }
    var ctx=g.ctx; ctx.fillStyle='#5fb0e8'; ctx.fillRect(0,0,g.W,g.H);
    // 背景の さかな と あわ
    if(!g.deco){ g.deco={fish:[],bub:[]}; }
    if(g.t%160===0) g.deco.fish.push({x:g.W+10,y:20+Math.random()*(g.H-60),v:0.8+Math.random()*0.7});
    if(g.t%22===0) g.deco.bub.push({x:10+Math.random()*(g.W-20),y:g.H,v:0.5+Math.random()*0.6});
    ctx.fillStyle='#8fd0f4';
    g.deco.fish.forEach(function(f){ f.x-=f.v; ctx.fillRect(f.x,f.y,10,5); ctx.fillRect(f.x+10,f.y+1,3,3); });
    g.deco.fish=g.deco.fish.filter(function(f){ return f.x>-16; });
    ctx.fillStyle='#cfeafd';
    g.deco.bub.forEach(function(bb){ bb.y-=bb.v; ctx.fillRect(bb.x,bb.y,3,3); });
    g.deco.bub=g.deco.bub.filter(function(bb){ return bb.y>-4; });
    ctx.fillStyle='#bfe3f7'; ctx.fillRect(8,14,16,3); ctx.fillRect(g.W-60,28,16,3); ctx.fillRect(g.W-120,10,16,3);
    g.obs.forEach(function(o){ var gp=o.og||g.gap; ctx.fillStyle='#3b8a5a'; ctx.fillRect(o.x,0,o.w,o.gy); ctx.fillRect(o.x,o.gy+gp,o.w,g.H-(o.gy+gp)); ctx.fillStyle='#2e6e47'; ctx.fillRect(o.x,o.gy-3,o.w,3); ctx.fillRect(o.x,o.gy+gp,o.w,3); });
    drawPetSprite(ctx,g,g.px,Math.round(g.py)); document.getElementById('gscore').textContent=g.score; g.raf=requestAnimationFrame(loopSea); }
  function gameInput(){ if(!game||game.over) return; if(game.mode==='sea') floatUp(); else jump(); }
  function loopGame(){ var g=game; if(!g||g.over) return; g.t++; g.speed+=0.0018; // だんだん はやく
    g.score=Math.floor(g.t/6);
    if(g.score>0 && g.score%100===0 && g.mile!==g.score){ g.mile=g.score; g.speed+=0.25; sfx('unlock'); } // 100点ごとに スピードアップ（恐竜ゲーム風の節目）
    if(g.obs.length===0||(g.W-g.obs[g.obs.length-1].x)>(Math.max(100,150-g.t*0.02)+Math.random()*110)){ // かんかくも だんだん せまく
      var fly=(g.t>250 && Math.random()<0.28);
      if(fly){ g.obs.push({x:g.W,w:16,h:12,fly:true}); } // とりは あたまの うえ：ジャンプすると あぶない
      else {
        g.obs.push({x:g.W,w:14+Math.floor(Math.random()*8),h:18+Math.floor(Math.random()*(22+Math.min(16,g.t/240)))}); // だんだん たかく
        if(g.t>400 && Math.random()<0.3){ g.obs.push({x:g.W+22+Math.random()*10,w:12+Math.floor(Math.random()*6),h:16+Math.floor(Math.random()*14)}); } // サボテンの むれ（恐竜ゲーム風）
      }
    }
    g.obs.forEach(function(o){ o.x-=g.speed; }); g.obs=g.obs.filter(function(o){ return o.x+o.w>-4; });
    var prevFeet=g.py+g.petH; g.vy+=0.7; g.py+=g.vy; g.onGround=false; // キビキビした重力（ふわふわ滞空を短く）
    if(g.py>=g.groundY-g.petH){ g.py=g.groundY-g.petH; g.vy=0; g.onGround=true; g.jumps=0; }
    var pl=g.px+5,pr=g.px+g.petW-5;
    for(var oi=0;oi<g.obs.length;oi++){ var o=g.obs[oi]; var ol=o.x,orr=o.x+o.w;
      if(o.fly){ var fb=g.groundY-g.petH-8, ft=fb-o.h; if(pl<orr&&pr>ol && g.py<fb && g.py+g.petH>ft && g.py+4<fb){ endGame(); return; } continue; } // ジャンプ中だけ あたる
      var top=g.groundY-o.h;
      if(pl<orr&&pr>ol){ if(g.vy>=0&&prevFeet<=top+6&&g.py+g.petH>=top){ g.py=top-g.petH; g.vy=0; g.onGround=true; g.jumps=0; } else if(g.py+g.petH>top){ endGame(); return; } } }
    var ctx=g.ctx; ctx.clearRect(0,0,g.W,g.H);
    // くも（うしろで ゆっくり ながれる）と 地面の こいし で スピード感
    if(!g.deco){ g.deco={cl:[],st:[]}; }
    if(g.t%140===0) g.deco.cl.push({x:g.W+10,y:8+Math.random()*50});
    if(g.t%30===0) g.deco.st.push({x:g.W,y:g.groundY+6+Math.random()*12});
    ctx.fillStyle='#efe7d3'; g.deco.cl.forEach(function(c){ c.x-=g.speed*0.35; ctx.fillRect(c.x,c.y,26,7); ctx.fillRect(c.x+5,c.y-4,14,5); }); g.deco.cl=g.deco.cl.filter(function(c){ return c.x>-30; });
    ctx.fillStyle='#e0d3b0'; ctx.fillRect(0,g.groundY,g.W,g.H-g.groundY); ctx.fillStyle='#4a3526'; ctx.fillRect(0,g.groundY,g.W,2);
    ctx.fillStyle='#c8b790'; g.deco.st.forEach(function(s2){ s2.x-=g.speed; ctx.fillRect(s2.x,s2.y,5,2); }); g.deco.st=g.deco.st.filter(function(s2){ return s2.x>-6; });
    g.obs.forEach(function(o){ if(o.fly){ var fb=g.groundY-g.petH-8, ft=fb-o.h; ctx.fillStyle='#5b6470'; ctx.fillRect(o.x,ft,o.w,o.h); var wing=(Math.floor(g.t/12)%2===0); ctx.fillStyle='#2f3640'; if(wing){ ctx.fillRect(o.x+2,ft-4,5,4); ctx.fillRect(o.x+9,ft-4,5,4); } else { ctx.fillRect(o.x+2,ft+o.h,5,4); ctx.fillRect(o.x+9,ft+o.h,5,4); } } // はばたく とり
      else { ctx.fillStyle='#2f7d4f'; ctx.fillRect(o.x,g.groundY-o.h,o.w,o.h); ctx.fillStyle='#1e5e3a'; ctx.fillRect(o.x,g.groundY-o.h,o.w,2); ctx.fillStyle='#3f9a64'; ctx.fillRect(o.x+2,g.groundY-o.h+3,2,Math.max(2,o.h-6)); } }); // サボテン風
    drawPetSprite(ctx,g,g.px,Math.round(g.py)); document.getElementById('gscore').textContent=g.score; g.raf=requestAnimationFrame(loopGame); }
  function endGame(){ var g=game; g.over=true; cancelAnimationFrame(g.raf); var sc=g.score; var happyGain=Math.min(30,6+Math.floor(sc/4)); state.happy=Math.min(100,state.happy+happyGain); addXp(5); if(sc>(state.gameHi||0)) state.gameHi=sc; save(); document.getElementById('goverScore').textContent='スコア '+sc+'（さいこう '+state.gameHi+'）'; document.getElementById('goverReward').textContent='ごきげん +'+happyGain+' ／ うんどうした！'; document.getElementById('gover').style.display='flex'; } // えさ報酬なし（えさは べんきょうで）
  function leaveGame(){ if(game){ game.over=true; cancelAnimationFrame(game.raf); } show('home'); render(); }
  (function(){ var cv=document.getElementById('gcanvas'); cv.addEventListener('pointerdown',function(e){ e.preventDefault(); gameInput(); }); document.getElementById('gJump').onclick=gameInput; document.getElementById('gRetry').onclick=function(){ if(state.food<=0){ leaveGame(); bubble('えさが なくなった！べんきょうで あつめよう'); return; } consumePlay(); if(game&&game.mode==='sea') startSeaGame(); else startGame(); }; document.getElementById('gHome').onclick=leaveGame; document.getElementById('backGame').onclick=leaveGame; })();

  /* ---- study ---- */
  var session, qIdx, qList;
  var MAIN_TABS=['home','learn','okane','admin'];
  function show(id){ document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('on'); }); document.getElementById(id).classList.add('on'); var tb=document.getElementById('tabbar'); if(MAIN_TABS.indexOf(id)>=0){ tb.classList.add('on'); document.querySelectorAll('#tabbar .tab').forEach(function(b){ b.classList.toggle('sel',b.dataset.s===id); }); } else { tb.classList.remove('on'); } window.scrollTo(0,0); }
  function gotoTab(s){ if(s==='admin'){ renderAdmin(); wlGrade=state.grade; setAdminTab('zukan'); } if(s==='okane'){ renderMoney(); } show(s); render(); } // 単語一覧(最大2258行)は たんごタブを開いたときだけ描画
  document.getElementById('tabbar').onclick=function(e){ var b=e.target.closest('.tab'); if(!b) return; gotoTab(b.dataset.s); };
  var ADMIN_TABS=['zukan','kisekae','keifu','tango','data'];
  function swipeTab(dir){ var cur=document.querySelector('.screen.on'); if(!cur) return; if(document.getElementById('goalCele').style.display==='flex') return; if(cur.id==='admin'){ var i=ADMIN_TABS.indexOf(curAdminTab),ni=i+dir; if(ni>=0&&ni<ADMIN_TABS.length){ setAdminTab(ADMIN_TABS[ni]); return; } if(dir<0&&i<=0){ gotoTab('learn'); } return; } if(MAIN_TABS.indexOf(cur.id)>=0){ var i2=MAIN_TABS.indexOf(cur.id),ni2=i2+dir; if(ni2>=0&&ni2<MAIN_TABS.length) gotoTab(MAIN_TABS[ni2]); } }
  var swX=0,swY=0,swOn=false;
  document.body.addEventListener('touchstart',function(e){ if(e.touches.length!==1){ swOn=false; return; } swX=e.touches[0].clientX; swY=e.touches[0].clientY; swOn=true; },{passive:true});
  document.body.addEventListener('touchend',function(e){ if(!swOn) return; swOn=false; var t=e.changedTouches[0],dx=t.clientX-swX,dy=t.clientY-swY; if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){ swipeTab(dx<0?1:-1); } },{passive:true});
  document.getElementById('sndset').onclick=function(e){ var b=e.target.closest('.optbtn'); if(!b) return; state.sound=b.dataset.v==='1'; save(); renderGoal(); if(state.sound) sfx('correct'); };
  document.getElementById('boxBtn').onclick=function(){ if(!boxAvailable()) return; state.lastBoxWeek=weekId(today()); state.food+=10; state.freezeTickets=Math.min(5,state.freezeTickets+1); addXp(20); bubble('たからばこ：えさ+10・おやすみ券+1！'); sfx('fanfare'); cheer(); save(); render(); };
  function renderTrophies(){ document.getElementById('trophyList').innerHTML=TITLES.map(function(t){ var got=state.titles.indexOf(t.id)>=0; return '<div class="trow2'+(got?' got':'')+'">'+(got?'★':'□')+' '+t.name+'</div>'; }).join(''); }
  document.getElementById('trophyChip').onclick=function(){ renderTrophies(); document.getElementById('trophyModal').style.display='flex'; };
  document.getElementById('trophyClose').onclick=function(){ document.getElementById('trophyModal').style.display='none'; };
  document.getElementById('ticketChip').onclick=function(){ bubble('おやすみ券：1日サボっても れんぞくキープ（もくひょうの2ばいで もらえる）'); };
  document.getElementById('boxChip').onclick=function(){ bubble('1しゅうで 5日 たっせいで たからばこ！'); };
  document.getElementById('celeClose').onclick=function(){ document.getElementById('goalCele').style.display='none'; render(); };
  document.getElementById('fwClose').onclick=function(){ rebirth(); };
  document.getElementById('sdClose').onclick=function(){ document.getElementById('sessDone').style.display='none'; show('learn'); render(); };
  document.getElementById('nudge').onclick=function(){ gotoTab('learn'); };
  document.getElementById('goStudy').onclick=startStudy;
  document.getElementById('back').onclick=function(){ show('learn'); render(); };
  function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=(Math.random()*(i+1))|0; var tmp=a[i]; a[i]=a[j]; a[j]=tmp; } return a; }
  var curWord=null, reviewMode=false, qMode='meaning', qMissed=false; // qMissed: この問題で一度でも まちがえたか（総当たり防止）
  // まちがえた単語(復習まち)を出やすくする重み付き抽選。覚えた=低確率で再確認
  // 出題の優先度：1)にがて と 4)新出 を最優先、2)間違えて覚えた は中、3)一発正解 は最低
  function qWeight(w){ var r=state.learn[w[0].toLowerCase()];
    if(!r) return 4;              // 4) まだ一度も出てない新出：最優先グループ
    if(r.w&&!r.m) return 5;       // 1) 間違えた/未正解のにがて：最優先
    if(r.m&&r.w) return 1.5;      // 2) 間違えたが2回目で正解＝復習：中
    if(r.m&&!r.w) return 0.4;     // 3) 一発正解：低
    return 3;                     // その他
  }
  function pickWeighted(words,n){ var used={}, chosen=[], wt=words.map(qWeight); for(var s=0;s<n;s++){ var total=0,i; for(i=0;i<words.length;i++){ if(!used[i]) total+=wt[i]; } if(total<=0) break; var rnd=Math.random()*total, acc=0, idx=-1; for(i=0;i<words.length;i++){ if(used[i])continue; acc+=wt[i]; if(rnd<=acc){ idx=i; break; } } if(idx<0){ for(i=0;i<words.length;i++){ if(!used[i]){ idx=i; break; } } } if(idx<0) break; used[idx]=true; chosen.push(words[idx]); } return chosen; }
  function startStudy(){ reviewMode=false; qList=pickWeighted(currentWords(),QPER); qIdx=0; session={correct:0,combo:0,maxCombo:0,newMastered:0,total:qList.length}; document.getElementById('qTotal').textContent=qList.length; show('study'); nextQ(); }
  function escJa(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function splitSenses(s){ return (s||'').split(/[，、,]/).map(function(x){ return x.trim(); }).filter(Boolean); }
  // 各いみの ふりがなを その漢字の 真上に（ruby）。コンマで 行を わける
  function rubyHTML(kanjiStr,yomiStr){ var ks=splitSenses(kanjiStr), ys=splitSenses(yomiStr); return ks.map(function(k,i){ var y=ys[i]; return y?('<ruby>'+escJa(k)+'<rt>'+escJa(y)+'</rt></ruby>'):escJa(k); }).join('，<br>'); }
  function choiceHtml(w){ var lng=(w[1]||'').length>9?' long':''; return '<span class="base'+lng+'">'+rubyHTML(w[1],w[2])+'</span>'; }
  function firstSenseKana(w){ var s=(w[2]||w[1]||''); return s.split(/[\u3001,\uff0c]/)[0].trim(); }
  function easyText(w){ var k=(w[0]||''); var e=(typeof EASY!=='undefined')?(EASY[k]||EASY[k.toLowerCase()]):null; return e||firstSenseKana(w); }
  function showEasy(w){ var box=document.getElementById('easyHint'); box.innerHTML='<div class="ehlabel">やさしいいみ</div><div class="ehmean">'+escJa(easyText(w))+'</div>'; box.style.display='block'; try{ box.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){ try{ box.scrollIntoView(); }catch(_){} } }
  function attachLongPress(el,cb){
    var t=null, longFired=false, touched=false;
    function start(){ longFired=false; el._lp=false; clearTimeout(t); t=setTimeout(function(){ longFired=true; el._lp=true; el._lpAt=Date.now(); cb(); },500); }
    function cancel(){ if(t){ clearTimeout(t); t=null; } }
    el.addEventListener('touchstart',function(){ touched=true; start(); },{passive:true});
    el.addEventListener('touchend',function(e){ cancel(); if(longFired){ try{ e.preventDefault(); }catch(_){} } }); // 長押し後の擬似クリックを抑止
    el.addEventListener('touchmove',cancel);
    el.addEventListener('touchcancel',cancel); // スクロール・通知等でタッチ中断 → タイマー解除（誤発火防止）
    el.addEventListener('mousedown',function(){ if(touched){ touched=false; return; } start(); }); // タッチ由来の擬似mousedownは無視(=_lpを消さない)
    el.addEventListener('mouseup',cancel);
    el.addEventListener('mouseleave',cancel);
  }
  function updateStudyProg(){ var fill=document.getElementById('studyProgFill'); if(fill) fill.style.width=((qIdx/(qList?qList.length:1))*100)+'%'; }
  function pickQMode(){ var r=Math.random(); return r<0.5?'meaning':(r<0.75?'spell':'reverse'); } // 1/2 いみ・1/4 スペル入力(リスニング)・1/4 ぎゃくびき
  var pendingNext=false;
  function showNext(){ // 問題が おわったら「つぎへ」ボタンで じぶんで すすむ（すぐ進まない・読み上げも 切れない）
    pendingNext=true;
    var nb=document.getElementById('nextBtn'); if(nb) nb.style.display='block';
    var dk=document.getElementById('dontKnow'); if(dk) dk.style.display='none';
  }
  function goNext(){ if(!pendingNext) return; pendingNext=false; var nb=document.getElementById('nextBtn'); if(nb) nb.style.display='none'; try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} qIdx++; nextQ(); }
  (function(){ var nb=document.getElementById('nextBtn'); if(nb) nb.onclick=goNext; })();
  function nextQ(){
    document.getElementById('easyHint').style.display='none';
    pendingNext=false; var nb0=document.getElementById('nextBtn'); if(nb0) nb0.style.display='none'; var dk0=document.getElementById('dontKnow'); if(dk0) dk0.style.display='block';
    if(qIdx>=qList.length){ finishStudy(); return; }
    updateStudyProg();
    var correct=qList[qIdx]; curWord=correct; qMissed=false;
    var en=correct[0];
    qMode=pickQMode();
    if(qMode==='spell'&&spellLetters(en).length>12) qMode='meaning'; // 長い単語・熟語のスペル入力は むずかしすぎるので 4択に
    document.getElementById('qNo').textContent=qIdx+1;
    document.getElementById('reward').textContent='';
    var qw=document.getElementById('qword'), prompt=document.getElementById('qPrompt'), hint=document.getElementById('qHint');
    var box=document.getElementById('choices'); box.innerHTML=''; box.style.pointerEvents='';
    var spellArea=document.getElementById('spellArea'); var isSpell=(qMode==='spell');
    box.style.display=isSpell?'none':'grid'; if(spellArea) spellArea.style.display=isSpell?'block':'none';
    var mkBtn=function(o,html){ var b=document.createElement('button'); b.className='ch'; b.innerHTML=html; if(o===correct) b._isCorrect=true; b.onclick=function(){ /* 長押し直後(700ms)のクリックだけ無視。古いフラグ残りでタップが押せなくなるのを防ぐ */ if(b._lp){ b._lp=false; if(Date.now()-(b._lpAt||0)<700) return; } answer(b,o===correct,en); }; if(qMode!=='reverse') attachLongPress(b,function(){ showEasy(o); }); box.appendChild(b); }; // 逆引きは 選択肢が英語＝長押しで答えが分かるので 無効
    var speakBtn=document.getElementById('speak'); if(speakBtn) speakBtn.style.display=(qMode==='reverse')?'none':'inline-flex'; // 逆引きは 答え(英語)を読み上げないよう きくボタンを隠す
    if(qMode==='reverse'){
      // いみ（漢字＋ふりがな）→ えいごを えらぶ
      prompt.textContent='この いみの えいごは？';
      var kanji=correct[1]||'', yom=correct[2]||'';
      qw.innerHTML='<div class="qmain">'+rubyHTML(kanji,yom)+'</div>';
      qw.classList.toggle('long', kanji.length>6);
      if(hint) hint.textContent='もんだいを ながおしで やさしいいみ';
      var poolR=currentWords().filter(function(w){ return w[0]!==en&&w[1]!==correct[1]; });
      shuffle([correct].concat(shuffle(poolR).slice(0,3))).forEach(function(o){ mkBtn(o,'<span class="base'+((o[0]||'').length>9?' long':'')+'">'+escJa(o[0])+'</span>'); });
    } else if(isSpell){
      // おとを きいて＋いみを みて 英語スペルを にゅうりょく
      prompt.textContent='きいて スペルを かこう';
      var kanjiS=correct[1]||'', yomS=correct[2]||'';
      qw.innerHTML='<div style="font-size:30px;">🔊</div><div class="qmain">'+rubyHTML(kanjiS,yomS)+'</div>';
      qw.classList.add('long');
      if(hint) hint.textContent='おとを きいて えいごを かいてね';
      var sinp=document.getElementById('spellInput'), ssub=document.getElementById('spellSubmit');
      if(sinp){ sinp.disabled=false; sinp.value=''; } if(ssub) ssub.disabled=false;
      var bars=document.getElementById('spellBars'); if(bars){ var bh=''; for(var ci=0;ci<en.length;ci++){ bh+=/[A-Za-z]/.test(en.charAt(ci))?'<span class="sbar"></span>':'<span class="sgap"></span>'; } bars.innerHTML=bh; } // 文字だけバー。スペース・ハイフン等は すきま
      updateSpellBars();
      setTimeout(function(){ try{ sinp&&sinp.focus(); }catch(e){} },60);
      speak(en);
    } else {
      prompt.textContent='この えいごの いみは？';
      qw.textContent=en; qw.classList.toggle('long', en.length>12);
      if(hint) hint.textContent='ながおしすると やさしいいみ';
      var pool=currentWords().filter(function(w){ return w[0]!==en&&w[1]!==correct[1]; });
      shuffle([correct].concat(shuffle(pool).slice(0,3))).forEach(function(o){ mkBtn(o,choiceHtml(o)); });
      speak(en);
    }
  }
  function spellLetters(s){ return (s||'').replace(/[^A-Za-z]/g,'').toLowerCase(); } // 判定は 文字だけ（ハイフン・スペースは 打たなくていい）
  function updateSpellBars(){
    var inp=document.getElementById('spellInput'), bars=document.getElementById('spellBars');
    if(!inp||!bars) return;
    var typed=spellLetters(inp.value).length;
    var sb=bars.querySelectorAll('.sbar');
    for(var i=0;i<sb.length;i++){ sb[i].classList.toggle('on', i<typed); }
  }
  function submitSpell(){
    if(!curWord||qMode!=='spell') return;
    var inp=document.getElementById('spellInput'); if(!inp||inp.disabled) return;
    var val=spellLetters(inp.value);
    if(!val) return;
    var target=spellLetters(curWord[0]);
    if(val===target){ inp.disabled=true; var sb=document.getElementById('spellSubmit'); if(sb) sb.disabled=true; speak(curWord[0]);
      if(qMissed){ document.getElementById('reward').textContent='かけたね！ つぎは いちどで せいかい しよう'; showEasy(curWord); save(); showNext(); return; } // まちがえてからの正解は ごほうびなし
      awardCorrect(curWord[0]); }
    else { qMissed=true; session.combo=0; onAnswer(curWord[0],false); save(); sfx('wrong'); document.getElementById('reward').textContent='おしい！ もういちど（「わからない」で こたえ）'; try{ inp.focus(); inp.select(); }catch(e){} }
  }
  function recordLearned(en){ if(state.todayDate!==today()){ state.todayDate=today(); state.todayWords=[]; } var k=en.toLowerCase(), already=state.todayWords.indexOf(k)>=0; if(!already) state.todayWords.push(k); if(!already&&state.todayWords.length===state.dailyGoal){ onGoalReached(); } }
  function streakOnGoal(){ if(state.lastGoalDate===today()) return; if(state.lastGoalDate===yesterday()){ state.streak++; } else if(state.lastGoalDate){ var gap=Math.round((new Date(today())-new Date(state.lastGoalDate))/86400000)-1; if(gap>0&&state.freezeTickets>=gap){ state.freezeTickets-=gap; state.streak++; bubble('おやすみ券で れんぞく キープ！'); } else state.streak=1; } else state.streak=1; state.lastGoalDate=today(); if(state.streak>(state.maxStreak||0)) state.maxStreak=state.streak; if(state.metDates.indexOf(today())<0) state.metDates.push(today()); if(state.metDates.length>60) state.metDates=state.metDates.slice(-60); }
  function onGoalReached(){ streakOnGoal(); state.food+=5; state.happy=100; gainGP(20); gainGP(Math.min(state.streak,15)); checkTitles(); setTimeout(showGoalCelebration,850); }
  function checkUnlock(prevLearned){ var items=BGS.filter(function(it){ return it.need>prevLearned&&it.need<=state.learned; }); if(items.length){ bubble('あたらしい はいけい アンロック！'); sfx('unlock'); } }
  function awardCorrect(en){
    var prev=state.learned, kL=en.toLowerCase(), wasM=!!(state.learn[kL]&&state.learn[kL].m);
    state.genCorrect=(state.genCorrect||0)+1; // この世代の せいかい数（べんきょうか 相性用）
    session.combo=(session.combo||0)+1; if(session.combo>(session.maxCombo||0)) session.maxCombo=session.combo;
    var mult=session.combo>=6?3:session.combo>=3?2:1; var rt=isRewardTime()?2:1; var dd=isDoubleDay()?2:1; var gain=mult*rt*dd;
    session.correct++; state.food+=gain; state.learned++; gainGP((reviewMode?10:8)*gain); onAnswer(en,true);
    if(!wasM&&state.learn[kL]&&state.learn[kL].m) session.newMastered=(session.newMastered||0)+1;
    recordLearned(en); checkUnlock(prev); checkTickets(); checkTitles(); sfx(session.combo>=3?'combo':'correct');
    var msg2='せいかい！'; if(mult>1) msg2+=' コンボ×'+mult; if(rt>1) msg2+=' ⏰2ばい'; if(dd>1) msg2+=' 🎉2ばいデー'; msg2+=reviewMode?' おぼえたね':(' えさ+'+gain);
    document.getElementById('reward').textContent=msg2; save(); checkEvolve();
    showNext();
  }
  function answer(btn,ok,en){ var _cb0=document.getElementById('choices'); if(_cb0&&_cb0.style.pointerEvents==='none') return; /* 回答済みなら無効 */ if(btn.classList.contains('ok')||btn.classList.contains('ng')) return;
    if(ok){
      if(qMode==='reverse') speak(en);
      btn.classList.add('ok'); if(_cb0) _cb0.style.pointerEvents='none';
      awardCorrect(en);
    } else {
      // まちがい → すぐ 正しいこたえを 見せて 復習。総当たりできないよう 選択肢を ロックし、つぎへ で すすむ
      btn.classList.add('ng'); if(_cb0) _cb0.style.pointerEvents='none';
      if(_cb0){ var cs=_cb0.querySelectorAll('.ch'); for(var i=0;i<cs.length;i++){ if(cs[i]._isCorrect) cs[i].classList.add('ok'); } } // 正解を みどりで しめす
      session.combo=0; onAnswer(en,false); save(); sfx('wrong'); speak(en); // 正しい はつおんを きかせる
      document.getElementById('reward').textContent='ざんねん… こたえは これ！ ふくしゅうに いれたよ';
      showEasy(curWord); showNext();
    } }
  function finishStudy(){ updateStudyProg();
    var sc=document.getElementById('sdCorrect'); if(sc) sc.textContent=(session.correct||0)+' / '+(session.total||qList.length);
    var sm=document.getElementById('sdMastered'); if(sm) sm.textContent=session.newMastered||0;
    var scb=document.getElementById('sdCombo'); if(scb) scb.textContent=session.maxCombo||0;
    var ov=document.getElementById('sessDone'); if(ov) ov.style.display='flex'; else { show('learn'); render(); }
    cheer();
  }
  var enVoice=null;
  function pickVoice(){ var vs=(window.speechSynthesis?speechSynthesis.getVoices():[]).filter(function(v){ return /^en[-_]?/i.test(v.lang); }); if(!vs.length) return null; var pref=['Samantha','Karen','Daniel','Aaron','Moira','Tessa','Google US English','Microsoft']; for(var pi=0;pi<pref.length;pi++){ var v=vs.find(function(vv){ return vv.name.indexOf(pref[pi])>=0; }); if(v) return v; } return vs.find(function(v){ return /en[-_]US/i.test(v.lang); })||vs[0]; }
  function ensureVoice(){ if(!enVoice) enVoice=pickVoice(); return enVoice; }
  if(window.speechSynthesis){ speechSynthesis.onvoiceschanged=function(){ enVoice=pickVoice(); }; ensureVoice(); }
  function speak(en){ try{ if(!window.speechSynthesis) return; var u=new SpeechSynthesisUtterance(en); var v=ensureVoice(); if(v){ u.voice=v; u.lang=v.lang; } else { u.lang='en-US'; } u.rate=0.8; u.pitch=1.0; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(e){} }
  document.getElementById('speak').onclick=function(){ speak(curWord?curWord[0]:document.getElementById('qword').textContent); };
  (function(){ var sb=document.getElementById('spellSubmit'); if(sb) sb.onclick=submitSpell; var si=document.getElementById('spellInput'); if(si){ si.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); submitSpell(); } }); si.addEventListener('input',updateSpellBars); } var qw=document.getElementById('qword'); if(qw) attachLongPress(qw,function(){ if(curWord && (qMode==='reverse'||qMode==='spell')) showEasy(curWord); }); })();
  document.getElementById('dontKnow').onclick=function(){
    if(!curWord) return;
    if(qMode==='spell'){ var inp=document.getElementById('spellInput'); if(inp&&inp.disabled) return; if(inp) inp.disabled=true; var sb2=document.getElementById('spellSubmit'); if(sb2) sb2.disabled=true; qMissed=true; onAnswer(curWord[0],false); save(); speak(curWord[0]); document.getElementById('reward').textContent='こたえ：'+curWord[0]; showEasy(curWord); showNext(); return; }
    var box=document.getElementById('choices');
    if(box.style.pointerEvents==='none') return; // すでに回答済み
    box.style.pointerEvents='none';
    var btns=box.querySelectorAll('.ch'); for(var i=0;i<btns.length;i++){ if(btns[i]._isCorrect) btns[i].classList.add('ok'); }
    qMissed=true; onAnswer(curWord[0],false); save(); speak(curWord[0]); // わからない＝復習まちへ、正しい発音を きかせる
    document.getElementById('reward').textContent='こたえ：'+(qMode==='reverse'?curWord[0]:curWord[1]);
    showEasy(curWord); showNext();
  };

  /* ---- wagamama ---- */
  var wagaTimer=null;
  function homeVisible(){ return document.getElementById('home').classList.contains('on')&&!document.hidden; }
  function triggerWagamama(){ if(state.wagamama||state.lv<2) return; if(typeof wakePet==='function') wakePet(); state.wagamama=true; render(); bubble("！ かまって！"); clearTimeout(wagaTimer); wagaTimer=setTimeout(function(){ if(state.wagamama){ state.wagamama=false; state.disciplineMiss++; state.discipline=Math.max(0,state.discipline-4); save(); render(); } },22000); }
  // しつけ(discipline)が ひくいほど わがままが おおく、たかいほど おだやかに（しつけを あげる意味）
  setInterval(function(){ if(homeVisible()&&!state.wagamama){ var ch=state.discipline<40?0.42:(state.discipline>=70?0.15:0.28); if(Math.random()<ch) triggerWagamama(); } },60000);

  /* ---- 躍動感（ホームでの ふるまい：おさんぽ・おひるね） ---- */
  var asleep=false, walkTimer=null, behaveT=null, napUntil=0, napCooldown=0;
  function petWrapEl(){ return document.getElementById('petWrap'); }
  function sleepProfile(){ // 成長段階ごとの ねむり：あかちゃんほど よくねる・おとなは 昼寝しない
    if(state.lv<=2) return {start:19,end:8, nap:0.10, napMin:50000,napMax:80000, cdMin:45000,cdMax:90000};    // ベビー：夜19時〜朝8時・ときどき昼寝
    if(state.lv===3) return {start:20,end:7, nap:0.05, napMin:35000,napMax:60000, cdMin:60000,cdMax:120000};  // キッズ：夜20時〜朝7時・たまに昼寝
    if(state.lv===4) return {start:21,end:7, nap:0.03, napMin:30000,napMax:50000, cdMin:90000,cdMax:150000};  // ヤング：夜21時〜朝7時・まれに昼寝
    return {start:22,end:6, nap:0, napMin:25000,napMax:50000, cdMin:90000,cdMax:150000};                      // アダルト：夜22時〜朝6時・昼寝なし（病気・ごきげん低下時のみ）
  }
  function isNightTime(){ try{ var pr=sleepProfile(), h=new Date().getHours(); return h>=pr.start||h<pr.end; }catch(e){ return false; } } // 背景ではなく 時刻だけで判定
  var lightsOff=false;
  function setLights(off){ lightsOff=off; document.body.classList.toggle('lights-off',off); var b=document.getElementById('bLight'); if(b) b.textContent=off?'でんきを つける':'でんきを けす'; }
  (function(){ var b=document.getElementById('bLight'); if(b) b.onclick=function(){ setLights(!lightsOff); }; })();
  function wakePet(){ if(!asleep) return; asleep=false; napUntil=0; var pr=sleepProfile(); napCooldown=Date.now()+(pr.cdMin+Math.random()*(pr.cdMax-pr.cdMin)); setLights(false); var w=petWrapEl(); if(w) w.classList.remove('asleep'); document.body.classList.remove('sleeping'); var z=document.getElementById('zzz'); if(z) z.classList.remove('on'); if(typeof drawPet==='function') drawPet(); }
  function sleepPet(){ if(asleep) return; asleep=true; state.sleepCount=(state.sleepCount||0)+1; /* ねぼすけ相性用 */ var w=petWrapEl(); if(w){ w.classList.remove('walking','flip'); w.style.left='50%'; w.dataset.lx='50'; w.classList.add('asleep'); } document.body.classList.add('sleeping'); var z=document.getElementById('zzz'); if(z) z.classList.add('on'); if(typeof drawPet==='function') drawPet(); }
  function walkTo(){
    var w=petWrapEl(); if(!w) return;
    var cur=parseFloat(w.dataset.lx||'50');
    var target=24+Math.random()*52;                 // 24%〜76% の はんいで うろうろ
    if(Math.abs(target-cur)<10){ target=cur<50?cur+18:cur-18; }
    target=Math.max(24,Math.min(76,target));
    w.classList.toggle('flip', target<cur);          // すすむ ほうこうを むく
    w.classList.add('walking');
    w.style.left=target+'%'; w.dataset.lx=target;
    clearTimeout(walkTimer); walkTimer=setTimeout(function(){ var ww=petWrapEl(); if(ww&&!asleep) ww.classList.remove('walking'); },1350);
  }
  function behaveStep(){
    scheduleBehave();
    if(state._farewell || !homeVisible() || state.wagamama) return;
    if(state.lv<2){ wakePet(); var w0=petWrapEl(); if(w0){ w0.classList.remove('flip','walking'); w0.style.left='50%'; w0.dataset.lx='50'; } return; } // タマゴは うごかない
    var night=isNightTime();
    if(asleep){
      // 夜は ずっと ねる（おこすのは おせわ）。ひるねは じかんが きたら おきる
      if(!night && Date.now()>=napUntil) wakePet();
      return;
    }
    if(night){ sleepPet(); return; }                 // 夜になったら ねる
    // 昼：たまに みじかい ひるね（連続でチラつかないよう クールダウンつき）
    if(Date.now()>=napCooldown){
      var pr=sleepProfile();
      var napChance=state.sick?0.16:(state.happy<25?0.12:pr.nap);
      if(Math.random()<napChance){ napUntil=Date.now()+(pr.napMin+Math.random()*(pr.napMax-pr.napMin)); sleepPet(); return; }
    }
    if(Math.random()<0.78) walkTo();                 // のこりは うろうろ／ひとやすみ
  }
  function scheduleBehave(){ clearTimeout(behaveT); behaveT=setTimeout(behaveStep, 1700+Math.random()*2400); }
  napCooldown=Date.now()+30000;   // ひらいた直後 しばらくは ひるねしない（夜は のぞく）
  scheduleBehave();

  /* ---- boot ---- */
  try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist(); }catch(e){} // 保存領域を消されにくくする(対応ブラウザのみ)
  decayStats();
  applyDaily();
  save();
  if(!checkDeath()) checkEvolve();
  document.body.classList.add('hastab');
  show('home');
  render();
  function warnNeglect(){ // お別れの まえに ちゃんと けいこく（毎日世話をうながす）
    if(state._farewell||state.lv<2||!homeVisible()) return;
    var now=Date.now();
    if(state.starveSince && now-state.starveSince>=NEGLECT_MS*0.4){ bubble('おなかが ぺこぺこ…ごはんを あげて！'); return; }
    if(state.sick && state.sickSince && now-state.sickSince>=NEGLECT_MS*0.4){ bubble('ぐあいが わるいよ…はやく おくすりを！'); return; }
    if(state.dirty && state.dirtySince && now-state.dirtySince>=6*3600000){ bubble('よごれてるよ…そうじ してね！'); } // 6時間 放置で けいこく
  }
  setInterval(function(){ if(state._farewell) return; decayStats(); save(); var c=checkEvolve(); if(checkDeath()) return; warnNeglect(); if(homeVisible()&&!c) render(); },60000);
  // バックアップ催促（週1・進捗が貯まってから）
  if(!state._farewell && state.learned>=30){ var lb=state.lastBackupNudge; var due=!lb || (Math.round((new Date(today())-new Date(lb))/86400000)>=7); if(due){ state.lastBackupNudge=today(); save(); setTimeout(function(){ bubble('ときどき データを バックアップしてね（せってい→データ）'); },2500); } }
  try{ document.getElementById('rev').textContent='バージョン '+(typeof APP_REV!=='undefined'?APP_REV:'?'); }catch(e){}
};
