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
  // ヤング4種を A=すいすいたま⭐ / B=しろころ◎ / C=もふたま○ / D=くさたま△ とし、
  // 「そのヤング専用3種」＋「となりあうヤングと共有する2種×2組」＝ 1ヤングにつき7種へ進化する
  var LIN_GROUPS = {
    onlyA: ['みらたま','ぴこぴこ','にんじゃ'],   // ⭐だけ
    onlyB: ['はがた','ばぶたま','うらら'],       // ◎だけ
    onlyC: ['うさたま','どきどき','たまぱ'],     // ○だけ
    onlyD: ['かぶら','ぴよたま','くちぱ'],       // △だけ
    ab:    ['ぷくたま','ぴねむ'],                // ⭐と◎ の どちらからでも
    bc:    ['めっこ','ちゃめ'],                  // ◎と○ の どちらからでも
    cd:    ['もぐもぐ','ぴな'],                  // ○と△ の どちらからでも
    ad:    ['めらめら','くろだま']               // △と⭐ の どちらからでも
  };
  var LINEAGE = {
    star:   LIN_GROUPS.onlyA.concat(LIN_GROUPS.ab, LIN_GROUPS.ad),
    good:   LIN_GROUPS.onlyB.concat(LIN_GROUPS.ab, LIN_GROUPS.bc),
    normal: LIN_GROUPS.onlyC.concat(LIN_GROUPS.bc, LIN_GROUPS.cd),
    wild:   LIN_GROUPS.onlyD.concat(LIN_GROUPS.cd, LIN_GROUPS.ad)
  };
  // ★レア＝特殊条件（実績）の6種。どのヤングからでも、条件を みたすほど 出やすい
  var RARE_ADULTS = ['げーむ','がくがく','ねむね','おひさま','はんば','おばけ'];
  var RARE_CHANCE = 0.08;          // レアの きほんかくりつ
  var RARE_CHANCE_SPECIAL = 0.35;  // 特殊条件を ひとつでも みたしていると ぐっと上がる
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
    heavy: { label:'おもい子',   hint:'おかしを たくさん あげて おもく（たいじゅう25+）すると なりやすい', test:function(s){ return s.weight>=25; } },
    light: { label:'かるい子',   hint:'おかしを ひかえて よく あそぶ（たいじゅう5）と なりやすい',  test:function(s){ return s.weight<=5; } },
    play:  { label:'あそびずき',  hint:'ミニゲームで 50かい あそぶと なりやすい',                  test:function(s){ return (s.gamesPlayed||0)>=50; } },
    study: { label:'べんきょうか', hint:'この子で 100もん せいかいすると なりやすい',              test:function(s){ return (s.genCorrect||0)>=100; } },
    sleep: { label:'ねぼすけ',    hint:'よく ねかせる（10かい すいみん）と なりやすい',            test:function(s){ return (s.sleepCount||0)>=10; } },
    disc:  { label:'おぎょうぎ◎',  hint:'すなおさを 70いじょうに たもつと なりやすい',               test:function(s){ return s.discipline>=70; } },
    wild:  { label:'やんちゃ',    hint:'すなおさが 30いかだと なりやすい',                        test:function(s){ return s.discipline<=30; } },
    happy: { label:'ごきげん屋',  hint:'ごきげんを たかく（80+）たもつと なりやすい',              test:function(s){ return s.happy>=80; } },
    streak:{ label:'まいにちさん', hint:'7日 れんぞくで もくひょうたっせいすると なりやすい',        test:function(s){ return (s.streak||0)>=7; } },
    full:  { label:'まんぷく',    hint:'おなかを 80いじょうに たもつと なりやすい',                 test:function(s){ return s.hunger>=80; } },
    tidy:  { label:'せわ上手',    hint:'せわミス 0かいで そだてると なりやすい',                    test:function(s){ return (s.careMiss||0)===0; } },
    effort:{ label:'がんばりや',  hint:'この子で 50もん せいかいすると なりやすい',                 test:function(s){ return (s.genCorrect||0)>=50; } },
    lazy:  { label:'ずぼら',      hint:'せわミスが 3かい いじょうだと なりやすい',                  test:function(s){ return (s.careMiss||0)>=3; } }
  };
  var AFFINITY = {
    // ★レア6種＝特殊条件（実績系）。1匹ずつ
    'はんば':'heavy',      // おもい子（体重25+）
    'おばけ':'light',      // かるい子（体重5）
    'げーむ':'play',       // あそびずき（ゲーム50回）
    'がくがく':'study',    // べんきょうか（100問）
    'ねむね':'sleep',      // ねぼすけ（すいみん10回）
    'おひさま':'streak',   // まいにちさん（7日連続）
    // 通常20種＝一般条件（ステータス系）7軸。
    //   ヤング専用3種は ごきげん屋／おぎょうぎ◎／やんちゃ を1つずつ、
    //   ペア共有は まんぷく・せわ上手（⭐◎ と ○△ 側）／ がんばりや・ずぼら（◎○ と △⭐ 側）
    //   → どのヤングでも 進化先7種の条件が すべて別になる
    'みらたま':'happy','うらら':'happy','どきどき':'happy','かぶら':'happy',           // ごきげん80+
    'にんじゃ':'disc','はがた':'disc','うさたま':'disc','ぴよたま':'disc',              // すなおさ70+
    'ぴこぴこ':'wild','ばぶたま':'wild','たまぱ':'wild','くちぱ':'wild',               // すなおさ30-
    'ぷくたま':'full','もぐもぐ':'full',                                               // おなか80+
    'ぴねむ':'tidy','ぴな':'tidy',                                                     // せわミス0
    'めっこ':'effort','めらめら':'effort',                                             // この子で50問せいかい
    'ちゃめ':'lazy','くろだま':'lazy'                                                  // せわミス3+
  };
  // 条件を みたすと えらばれやすくなる（確定では ない）。
  //   そのヤング専用の子は 狙いが よく効き、ふたつのヤングから なれる共有の子は ひかえめ
  var AFF_BOOST_ONLY=12, AFF_BOOST_SHARE=5;
  var SHARED_IDS=(function(){ var o={}; ['ab','bc','cd','ad'].forEach(function(k){ LIN_GROUPS[k].forEach(function(id){ o[id]=true; }); }); return o; })();
  function affinityWeight(id){ var a=AFFINITY[id]; if(!a) return 1; var t=TRAITS[a]; if(!(t&&t.test(state))) return 1; return SHARED_IDS[id]?AFF_BOOST_SHARE:AFF_BOOST_ONLY; }
  function affinityLabel(id){ var a=AFFINITY[id]; return a&&TRAITS[a]?TRAITS[a].label:''; }
  function affinityHint(id){ var a=AFFINITY[id]; return a&&TRAITS[a]?TRAITS[a].hint:''; }
  var ADULTS = (function(){ var o={}; Object.keys(ADULT_TIERS).forEach(function(t){ ADULT_TIERS[t].forEach(function(id){ o[id]={ img:id, name:dispName(id), desc:ADULT_DESC[id]||'', tier:t, rare:(RARE_ADULTS.indexOf(id)>=0) }; }); }); return o; })();
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
  function earnedTierKey(){ if((state.careMiss+state.disciplineMiss)>=8) return 'wild'; return TIER_ORDER[careTierIndex()]; } // がんばりで きまる「本命」ランク（表示・予告用）
  // ヤングの姿は 確率制：本命ランクが いちばん でやすく、1段はなれるごとに 半分（本命53〜64%・となり22〜27%）
  function rollYoungTier(){ var ei=TIER_ORDER.indexOf(earnedTierKey()); var ws=TIER_ORDER.map(function(k,i){ return 4/Math.pow(2,Math.abs(i-ei)); }); var tot=0,i; for(i=0;i<ws.length;i++) tot+=ws[i]; var r=Math.random()*tot; for(i=0;i<ws.length;i++){ r-=ws[i]; if(r<=0) return TIER_ORDER[i]; } return TIER_ORDER[ei]; }
  function youngInfo() { return YOUNGS[state.youngType] || YOUNGS.normal; }
  function adultById(id){ return ADULTS[id] || (id&&LEGACY_ADULT[id]&&ADULTS[LEGACY_ADULT[id]]) || ADULTS[ADULT_TIERS.normal[0]]; }
  function adultInfo() { return adultById(state.adultType); }
  function careMissTotal(){ return (state.careMiss||0)+(state.disciplineMiss||0); }
  // ヤングに なったあとは 系統が かくてい（pickAdultType と 同じ見かた）。それまでは がんばりで きまる 本命ランク
  function isYoungFixed(){ return state.lv>=4 && !!state.youngType; }
  function predictedTier(){ return isYoungFixed() ? state.youngType : earnedTierKey(); }
  // いま こだわり条件を みたしていて いちばん なりやすい子。だれも みたしていなければ boosted=false
  function predictedAdult(){ var pool=LINEAGE[predictedTier()]||LINEAGE.normal, best=pool[0], bw=1;
    pool.forEach(function(id){ var w=affinityWeight(id); if(w>bw){ bw=w; best=id; } });
    return { key:best, boosted:bw>1 }; }
  function predictedAdultKey(){ return predictedAdult().key; }
  // アダルト確定：いまの ヤング(=おせわランク)の 系統から、見た目の似た6種のどれかに進化。
  // レアは「じょうずに育てた子（ミスが少ない）」だけ 低確率で（どの系統からでも）。サボりでは出ない。
  function pickWeightedAdult(pool){ // 育て方の こだわり(相性)で 重みづけして 1体えらぶ
    var wt=pool.map(affinityWeight), tot=0, i; for(i=0;i<wt.length;i++) tot+=wt[i];
    var r=Math.random()*tot, acc=0; for(i=0;i<pool.length;i++){ acc+=wt[i]; if(r<=acc) return pool[i]; }
    return pool[pool.length-1];
  }
  var SPECIAL_TRAITS=['heavy','light','play','study','sleep','streak'];
  function metSpecial(){ return SPECIAL_TRAITS.some(function(k){ var t=TRAITS[k]; return !!(t&&t.test(state)); }); }
  function rareChance(){ return metSpecial()?RARE_CHANCE_SPECIAL:RARE_CHANCE; }
  function pickAdultType(){
    var yt=state.youngType||earnedTierKey();
    if(careMissTotal()<=2 && Math.random()<rareChance()){ return pickWeightedAdult(RARE_ADULTS); }
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
    var def={ name:"ぴよ",lv:1,xp:0,hunger:80,happy:80,food:0,dirty:false,streak:1,learned:0,last:today(),grade:"jun2",discipline:50,weight:5,careMiss:0,disciplineMiss:0,wagamama:false,babyType:null,childType:null,adultType:null,customImg:{},gameHi:0,dailyGoal:20,todayDate:today(),todayWords:[],lastGoalDate:null,metDates:[],wrongWords:[],petColor:'brown',bg:'meadow',freezeTickets:0,lastTicketDate:null,lastBoxWeek:null,titles:[],sound:true,mastery:{},learn:{},maxStreak:0,sick:false,sickSince:null,starveSince:null,gamesPlayed:0,genCorrect:0,sleepCount:0,dirtySince:null,poopDate:null,poopBits:0,voiceName:null,speechRate:0.8,advGrades:false,petNo:1,foodFrac:0,dblNext:null,dblSeen:null,ddSeen:null,tenSeen:null,lastPlay:Date.now(),mischiefAt:null,mischiefDate:null,mischiefN:0,born:Date.now(),stageSince:Date.now(),lifespanDays:12+Math.floor(Math.random()*3),youngType:null,memories:[],schemaV:2,lastBackupNudge:null,lastTick:Date.now(),keifuRevealed:[],moneyLog:[] };
    s=Object.assign({},def,s||{});
    s.dailyGoal=20; // 1日の目標は20に固定
    // おこづかい機能の初期化（家庭内でえさを買い取ってお金に）
    if(!Array.isArray(s.moneyLog)) s.moneyLog=[];
    // だんかいレート：デフォルトは 3段階（฿100=えさ5／฿200=えさ10／฿300=えさ15）。
    // 一度だけ この新デフォルトに 統一（moneyTiersV=3：カーブを緩やかに）。以降は 親が変えた設定を そのまま保持
    if(s.moneyTiersV!==5 || !Array.isArray(s.moneyTiers) || !s.moneyTiers.length){
      s.moneyTiers=[{cap:50,rate:5},{cap:100,rate:7},{cap:150,rate:9},{cap:200,rate:11},{cap:250,rate:13},{cap:300,rate:15}];
      s.moneyTiersV=5;
    }
    if(typeof s.petNo!=='number'){ s.petNo=((s.memories&&s.memories.length)||0)+1; } // 既存ユーザーの個体No.をこれまで育てた数から復元
    if(typeof s.lastPlay!=='number') s.lastPlay=Date.now(); // 既存ユーザーが いきなり すねないように
    if(typeof s.foodFrac!=='number'){ s.foodFrac=0; }
    // 単語ごとの学習状況(learn)へ移行：旧mastery(正解数>=2でおぼえた)＋wrongWords(にがて)から復元
    if(!s.learn || typeof s.learn!=='object'){ s.learn={}; }
    if(Object.keys(s.learn).length===0 && ((s.mastery&&Object.keys(s.mastery).length)||(s.wrongWords&&s.wrongWords.length))){
      for(var mk in (s.mastery||{})){ var lk=mk.toLowerCase(); s.learn[lk]={c:0,w:false,m:(s.mastery[mk]>=2)}; }
      (s.wrongWords||[]).forEach(function(x){ var wk=(x[0]||'').toLowerCase(); if(!wk) return; s.learn[wk]={c:(s.learn[wk]&&s.learn[wk].c)||0,w:true,m:false}; });
    }
    if(!WORDBANK[s.grade]) s.grade="jun2";
    if((s.grade==='g3'||s.grade==='g1')&&!s.advGrades) s.grade='jun2'; // 上級モードOFFなら 子供向けの きゅうに もどす
    // ライフサイクル改修(schemaV2)への移行：旧アダルト(lv4)→新アダルト(lv5)
    if(!s.schemaV || s.schemaV<2){ if(s.lv>=4) s.lv=5; if(typeof s.born!=='number') s.born=Date.now(); if(typeof s.stageSince!=='number') s.stageSince=Date.now(); if(typeof s.lifespanDays!=='number') s.lifespanDays=12; if(!Array.isArray(s.memories)) s.memories=[]; s.schemaV=2; }
    return s;
  })();
  function save(){ try{ var js=JSON.stringify(state); localStorage.setItem(KEY,js); localStorage.setItem(BAKKEY,js); }catch(e){} }
  function dayStr(d){ return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
  function yesterday(){ var d=new Date(today()); d.setDate(d.getDate()-1); return dayStr(d); }
  function tomorrow(){ var d=new Date(today()); d.setDate(d.getDate()+1); return dayStr(d); }
  // 継続がくしゅうボーナス：きのう 20こ たっせいしていたら きょうは えさ ×2（毎日つづけると ずっと2倍）
  function isDblDay(){ return state.dblNext===today(); }
  function todayDone(){ return (state.todayDate===today())&&(state.todayWords.length>=state.dailyGoal); }
  function displayStreak(){ return (state.lastGoalDate===today()||state.lastGoalDate===yesterday())?state.streak:0; }
  function todayCount(){ return (state.todayDate===today())?state.todayWords.length:0; }
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
    var hungerBefore=state.hunger;                       // 減る前のおなか（餓死開始時刻の計算用）
    hrs=Math.min(hrs,72);
    state.hunger=Math.max(0, state.hunger - 1.5*hrs);   // 約 -36/日
    state.happy =Math.max(0, state.happy  - 1.0*hrs);   // 約 -24/日
    if(state.sick) state.happy=Math.max(0, state.happy - 0.5*hrs);
    if(state.dirty) state.happy=Math.max(0, state.happy - 0.8*hrs); // よごれ放置で ごきげん低下
    // 自然な代謝：時間とともに少しずつ体重が減る（太っているほど よく燃える）→ 体重が一方通行で増え続けないように
    if(state.lv>=2){ var burn=0.07+(state.weight>=30?0.06:0); state.weight=Math.max(5, state.weight - burn*hrs); }
    // 「毎日世話」を成立させる：おなかが0 / 病気 が つづくと あぶない → お別れ(checkDeath)
    // おなかが0：実際に0へ到達した時刻から数える（アプリを閉じていた放置時間も カウントする＝世話ゼロで長生きしない）
    if(state.hunger<=0){ if(!state.starveSince){ var t=last + (hungerBefore/1.5)*3600000; state.starveSince=Math.min(t, now); } } else { state.starveSince=null; }
    if(state.sick){ if(!state.sickSince) state.sickSince=now; } else { state.sickSince=null; }
    maybePoop();
  }
  // うんこは ごはんと関係なく「時間帯」でする。ヤング・アダルトは 朝おきてから と 夕方、ベビー・キッズは 多め（朝・昼・夕）
  function poopWindows(){ if(state.lv>=4) return [[7,10],[16,20]]; if(state.lv>=2) return [[7,10],[11,14],[16,20]]; return []; }
  function maybePoop(){
    if(state.lv<2 || state.dirty) return;
    var d=today(); if(state.poopDate!==d){ state.poopDate=d; state.poopBits=0; }
    var h=new Date().getHours(), ws=poopWindows();
    for(var i=0;i<ws.length;i++){ if(state.poopBits&(1<<i)) continue; if(h>=ws[i][0]&&h<ws[i][1]){ if(Math.random()<0.5){ makeDirty(); state.poopBits|=(1<<i); } break; } }
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
      else if(state.lv===4&&!state.youngType){ state.youngType=rollYoungTier(); } // 本命ランクを軸に 抽選
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
    if(ageDays()>=state.lifespanDays){ state._deathCause=(state.lv>=5)?'life':'nogrow'; farewell(); return true; } // 寿命：育て切った子=祝福、育たなかった子(勉強不足)=nogrow（不老不死を防ぐ）
    if(state.lv>=2){ var now=Date.now();
      if(state.starveSince && now-state.starveSince>=NEGLECT_MS){ state._deathCause='hunger'; farewell(); return true; }
      if(state.sick && state.sickSince && now-state.sickSince>=NEGLECT_MS){ state._deathCause='sick'; farewell(); return true; }
    }
    return false;
  }
  var DEFAULT_TIERS=[{cap:50,rate:5},{cap:100,rate:7},{cap:150,rate:9},{cap:200,rate:11},{cap:250,rate:13},{cap:300,rate:15}];
  function moneyTiers(){ var t=state.moneyTiers; return (Array.isArray(t)&&t.length)?t:DEFAULT_TIERS; }
  // ▼ おこづかい不正対策：バックアップに含めない「外部の稼ぎ台帳」。
  //   復元でエサを巻き戻して何度も買い取り＝無限請求 を防ぐため、買い取りは「新たに稼いだエサ」の範囲だけに制限する。
  //   earned=いままで“勉強で”手に入れたエサの累計（単調増加）、cashed=買い取り済みの累計。復元してもこのキーは戻らない。
  var WKEY='eigopet_wallet';
  function walletGet(){ var w=null; try{ w=JSON.parse(localStorage.getItem(WKEY)||'null'); }catch(e){}
    if(!w||typeof w!=='object'){ var past=0; (state.moneyLog||[]).forEach(function(e){ past+=(e.food||0); }); // 初回：既存ユーザーの持ち分と履歴で初期化（損させない）
      w={earned:past+(state.food||0), cashed:past}; try{ localStorage.setItem(WKEY,JSON.stringify(w)); }catch(e){} }
    if(typeof w.earned!=='number') w.earned=0; if(typeof w.cashed!=='number') w.cashed=0; return w; }
  function walletSave(w){ try{ localStorage.setItem(WKEY,JSON.stringify(w)); }catch(e){} }
  function walletEarn(n){ if(!(n>0)) return; var w=walletGet(); w.earned+=n; walletSave(w); }
  function walletAvail(){ var w=walletGet(); return Math.max(0, w.earned - w.cashed); }
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
    // 「新たに稼いだエサ」の範囲だけ買い取る（復元でエサを巻き戻しての二重請求を防ぐ）
    var w=walletGet(), avail=Math.max(0, w.earned - w.cashed);
    var had=Math.min(state.food||0, avail), m=moneyFor(had);
    state.food=0;
    w.cashed+=had; walletSave(w);
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
    if(state._deathCause==='hunger'||state._deathCause==='sick'||state._deathCause==='nogrow'){ state.food=0; state._lastBuyout={baht:0,food:0}; } // 早いお別れ・育たなかった子は おこづかいなし
    else { state._lastBuyout=buyoutFood(); }
    save(); showFarewell(ai);
  }
  function rebirth(){
    state._farewell=false;
    state.lv=1; state.xp=0; state.born=Date.now(); state.stageSince=Date.now();
    state.petNo=(state.petNo||1)+1; state.foodFrac=0; // 新しい個体No.（連番）
    state.hunger=80; state.happy=80; state.dirty=false; state.dirtySince=null; state.poopDate=null; state.poopBits=0; state.weight=5;
    state.careMiss=0; state.disciplineMiss=0; state.wagamama=false; state.gamesPlayed=0; state.genCorrect=0; state.sleepCount=0;
    state.discipline=50; // すなおさは まんなか(50)から スタート（前の子から 引きつがない）
    state.lastPlay=Date.now(); state.mischiefAt=null; state.mischiefDate=null; state.mischiefN=0;
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
  function petIdStr(){ var no=('00'+(state.petNo||1)).slice(-3); var code=(state.born||0).toString(36).slice(-4).toUpperCase(); return 'No.'+no+' ・ #'+code; }
  function showFarewell(ai){
    var el=document.getElementById('farewell'); if(!el){ rebirth(); return; }
    var c=state._deathCause, neglect=(c==='hunger'||c==='sick'||c==='nogrow');
    var sp=document.getElementById('fwSprite');
    if(sp){
      if(neglect) sp.innerHTML=GRAVE_SVG;
      else sp.innerHTML='<div style="position:relative;display:inline-block;"><div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);font-size:15px;">⭐</div><div style="position:absolute;top:6px;left:-20px;font-size:13px;">✨</div><div style="position:absolute;top:2px;right:-20px;font-size:13px;">✨</div>'+spriteHTML(ai,4)+'</div>';
    }
    var nm=document.getElementById('fwName'); if(nm) nm.textContent=state.name+'（'+ai.name+'）';
    var idEl=document.getElementById('fwId'); if(idEl) idEl.textContent='こたい ID：'+petIdStr(); // 個体ごとの通し番号＋コード（使い回し・重複に気づけるように）
    var days=Math.max(1,Math.round(ageDays()));
    var ms=document.getElementById('fwMsg');
    if(ms){
      if(c==='hunger') ms.innerHTML=days+'日 いっしょに いたよ。<br>おなかが すいて げんきが なくなっちゃった…<br><strong style="color:#c2410c;">まいにち ごはんを あげてね。</strong>';
      else if(c==='sick') ms.innerHTML=days+'日 いっしょに いたよ。<br>びょうきを なおして あげられなかった…<br><strong style="color:#c2410c;">びょうきの ときは はやく おくすりを あげてね。</strong>';
      else if(c==='nogrow') ms.innerHTML=days+'日 いっしょに いたよ。<br>おおきく なれないまま おわかれ…<br><strong style="color:#c2410c;">まいにち べんきょうすると そだつよ。</strong>';
      else ms.innerHTML='<strong style="color:#29a65e;">いままで ありがとう！</strong><br>'+days+'日 いっしょに がんばったね。<br>おほしさまに なって みまもってるよ。';
    }
    var mo=document.getElementById('fwMoney');
    if(mo){ var bo=state._lastBuyout||{baht:0,food:0};
      if(!neglect && bo.baht>0){
        mo.style.display='block';
        mo.innerHTML='そだてきった ごほうび！ のこった えさ '+escJa(String(bo.food))+'こ ぶんの おこづかい<br><span style="font-size:30px;color:#ea580c;">฿'+escJa(String(bo.baht))+'</span>'
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
    var sm=document.getElementById('sulkmark');            // すねている ときは バッジだけ（理由の文言は 出さない）
    if(sm){ var sulk=(typeof isSulking==='function')&&isSulking()&&!state.sick;
      sm.style.display=sulk?'block':'none';
      var why=document.getElementById('sulkwhy'); if(why){ why.textContent=''; why.style.display='none'; } }
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
    // いまの えさボーナス パネル（コンボ以外・重なると倍率アップ）
    var rb=document.getElementById('rewardBanner'); if(rb){ var ab=activeBonuses();
      if(ab.length){ rb.style.display='block';
        rb.innerHTML='<div style="font-size:16px;font-weight:900;color:#b45309;margin-bottom:4px;">いま えさ ×'+bonusMult()+'！</div>'
          +ab.map(function(b){ return '<div style="font-size:12px;color:#92400e;">'+b.e+' '+b.t+'　<span style="color:#a16207;font-weight:700;">'+b.d+'</span></div>'; }).join('');
      } else rb.style.display='none';
    }
    // あすへの ヒント：きょう 20こ たっせいで あした えさ×2
    var db=document.getElementById('doubleBanner');
    if(db){ if(!todayDone()){ db.style.display='block'; db.style.background='#f0fdf4'; db.style.borderColor='#bbf7d0'; db.style.color='#15803d'; db.textContent='きょう '+state.dailyGoal+'こ たっせいで、あしたは えさ ×2！'; }
      else { db.style.display='block'; db.style.background='#eff6ff'; db.style.borderColor='#bfdbfe'; db.style.color='#1d4ed8'; db.textContent='✅ きょうの もくひょう たっせい！ あしたは えさ ×2だよ'; } }
    document.querySelectorAll('#sndset .optbtn').forEach(function(b){ b.classList.toggle('sel',(b.dataset.v==='1')===!!state.sound); });
    var fc=document.getElementById('fcSprite');
    if(fc){
      if(state.lv>=5){ var ai=adultInfo(); fc.innerHTML=spriteHTML(ai,3); document.getElementById('fcTitle').textContent='そだった アダルト'; document.getElementById('fcName').textContent=ai.name; document.getElementById('fcMsg').textContent='りっぱに そだったね！'; }
      else { var tier2=predictedTier(), pa=ADULTS[predictedAdultKey()]; fc.innerHTML=spriteHTML(pa,3);
        var miss=careMissTotal(), pd=predictedAdult();
        if(isYoungFixed()){ // すでに ヤング＝系統は かくてい。あとは そだてかたで どの子に なるか
          document.getElementById('fcTitle').textContent='この子は… '+(FAMILY_NAME[tier2]||'')+' へ';
          document.getElementById('fcName').textContent=pd.boosted?(pa.name+' に なりやすい'):'7しゅるいの どれか';
          document.getElementById('fcMsg').textContent='ヤングの すがたで 系統は きまったよ。どの子に なるかは そだてかた しだい（ずかんの 🌱ヒント） ／ ★レアは とくべつな そだてかたで（せわ・しつけミス '+miss+'かい／3かい いじょうだと 出ない）';
        } else {
          document.getElementById('fcTitle').textContent='いまの ペースなら… '+(FAMILY_NAME[tier2]||'')+' に なりやすい';
          document.getElementById('fcName').textContent=pd.boosted?(pa.name+' に なりやすい'):'7しゅるいの どれか';
          var met=genMetDays(), needS=Math.max(0,3-met);
          var base='ランク：'+TIER_LABEL[tier2]+'（もくひょうたっせい '+met+'日／せわ・しつけミス '+miss+'かい）';
          var tail=(tier2==='star')?' さいこう！この ちょうしで！':(' さいこうまで あと '+needS+'日 たっせい');
          document.getElementById('fcMsg').textContent=base+'。'+tail+' ／ ほかの系統に なることも あるよ ／ ★レアは とくべつな そだてかたで';
        } }
    }
    var nd=document.getElementById('nudge');
    if(nd){ if(done>=goal){ nd.style.display='none'; } else { nd.style.display='block'; nd.textContent=done>0?('きょうは あと '+(goal-done)+'こ！ がくしゅうしよう →'):('きょうの べんきょうを はじめよう！ →'); } }
  }
  function showGoalCelebration(){ document.getElementById('celeMsg').innerHTML='きょう '+state.dailyGoal+'こ おぼえたよ！<br>'+displayStreak()+'にち れんぞく<br><span style="color:#ea580c;">✨ あしたは えさ ×2！</span>'; document.getElementById('celeReward').textContent='ごほうび：えさ +5 ／ ごきげん まんたん ／ あした えさ2ばい'; document.getElementById('goalCele').style.display='flex'; cheer(); }
  // ×2デーの あさ、1回だけ おしらせ（きのう20こ たっせいの ごほうび）
  // いま はつどう中の えさボーナス（コンボは のぞく）。それぞれ ×2
  function activeBonuses(){ var a=[];
    if(isDblDay()) a.push({e:'✨',t:'まいにちボーナス',d:'きのう 20こ たっせい'});
    if(state.lv>=5 && ageDays()>=10) a.push({e:'🌟',t:'10日ボーナス',d:'10日 いっしょに いられた'});
    if(isDoubleDay()) a.push({e:'🎉',t:'2ばいデー',d:'月〜土 ぜんぶ たっせい'});
    return a; }
  function bonusMult(){ return Math.pow(2, activeBonuses().length); }
  // 新しく はつどうした ボーナスを 1回だけ おしらせ
  function announceBonuses(){
    if(!activeBonuses().length) return;
    var news=[];
    if(isDblDay() && state.dblSeen!==today()){ news.push('✨まいにちボーナス'); state.dblSeen=today(); }
    if(isDoubleDay() && state.ddSeen!==today()){ news.push('🎉2ばいデー'); state.ddSeen=today(); }
    if(state.lv>=5 && ageDays()>=10 && state.tenSeen!==state.petNo){ news.push('🌟10日ボーナス'); state.tenSeen=state.petNo; }
    if(news.length){ save(); bubble('えさボーナス はつどう！ '+news.join('・')+' → えさ ×'+bonusMult()); }
  }
  var bubT;
  function bubble(t){ var b=document.getElementById('bubble'); b.textContent=t; b.style.opacity=1; clearTimeout(bubT); bubT=setTimeout(function(){ b.style.opacity=0; },1100); }
  function cheer(){ var w=document.getElementById('petWrap'); if(!w) return; wakePet(); w.classList.add('happy'); setTimeout(function(){ w.classList.remove('happy'); },1200); }

  /* ---- care ---- */
  document.getElementById('bFeed').onclick=function(){ if(state.lv<2){ bubble("タマゴは まだ たべられないよ"); return; } if(state.hunger>=99){ bubble("おなか いっぱい！"); return; } if(state.food<=0){ bubble("べんきょうして えさをあつめよう"); return; } state.food--; state.hunger=Math.min(100,state.hunger+20); if(state.hunger>0) state.starveSince=null; state.happy=Math.min(100,state.happy+5); state.weight+=2; addXp(5); bubble("もぐもぐ"); cheer(); save(); render(); };
  document.getElementById('bSnack').onclick=function(){ if(state.lv<2){ bubble("タマゴは まだ たべられないよ"); return; } if(state.happy>=99.5){ /* 見た目が まんたん(四捨五入で100)の あいだは あげられない */ bubble("ごきげん まんたん！ おかしは また こんど ね"); return; } state.hunger=Math.min(100,state.hunger+3); if(state.hunger>0) state.starveSince=null; state.happy=Math.min(100,state.happy+10); state.weight+=4; bubble("おいしい！でも たいじゅう++"); cheer(); save(); render(); };
  function makeDirty(){ if(!state.dirty){ state.dirty=true; state.dirtySince=Date.now(); } }
  document.getElementById('bPlay').onclick=function(){ if(state.lv<2){ bubble("タマゴは まだ あそべないよ"); return; } if(state.food<=0){ bubble("べんきょうして えさを あつめよう"); return; } consumePlay(); startMario(); };
  function consumePlay(){ state.food--; state.weight=Math.max(5,state.weight-1); state.hunger=Math.max(0,state.hunger-4); state.gamesPlayed=(state.gamesPlayed||0)+1; state.lastPlay=Date.now(); state.happy=Math.min(100,state.happy+6); state.discipline=Math.min(100,state.discipline+3); save(); } // あそぶと なつく＝すなおさ+3 // あそぶと 運動：体重-2・おなか-4
  document.getElementById('backSelect').onclick=function(){ show('home'); render(); };
  var selK=document.getElementById('selJump'); if(selK) selK.onclick=function(){ if(state.food<=0){ bubble('えさが たりない'); return; } consumePlay(); startMario(); };
  // しつけは「わがまま・悪さ」のタイミングだけ有効。すなおさが上がる。ミスると ごきげんが さがる
  document.getElementById('bScold').onclick=function(){ if(state.wagamama){ state.wagamama=false; state.discipline=Math.min(100,state.discipline+12); clearTimeout(wagaTimer); bubble("いいこ だね！ すなおさ+"); cheer(); } else { state.happy=Math.max(0,state.happy-8); bubble("いまは しからないで… ごきげん-"); } save(); render(); };
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
    tree+='<div class="keifuHint" style="background:#eff6ff;border-color:#bfdbfe;"><div style="font-size:12px;font-weight:800;color:var(--ink);line-height:1.6;">いまの ランク：<b style="color:#2563eb;">'+TIER_LABEL[nowTier]+'</b>（もくひょうたっせい '+genMetDays()+'日／せわ・しつけミス '+careMissTotal()+'かい）<br><span style="font-size:11px;color:var(--mut);font-weight:700;">'+(isYoungFixed()?'ヤングに なったので 系統は かくてい。どの子に なるかは そだてかた しだい':'たっせい日が おおいほど 上の系統に なりやすく（かくりつ）')+'。★レアは とくべつな そだてかたで（せわ・しつけミス 3かい いじょうだと 出ない）</span></div></div>';
    tree+='<div class="tiertag">ヤング（おせわランクで なりやすさが かわる）</div><div class="tgrid4">'+ytiers.map(function(t){ return tnode(YOUNGS[t[0]],YOUNGS[t[0]].name,true); }).join('')+'</div><div class="tarrow">↓</div>';
    // アダルト：入手ずみは無料表示。それ以外は「？」を自分でタップ＋えさ で 1体ずつ ひらける
    var HINT_COST=50;
    var allAdults=[]; Object.keys(ADULT_TIERS).forEach(function(t){ ADULT_TIERS[t].forEach(function(id){ allAdults.push(id); }); });
    var rev=state.keifuRevealed||[], revealed={}, totalRev=0;
    allAdults.forEach(function(id){ if(col[id]||rev.indexOf(id)>=0){ revealed[id]=true; totalRev++; } });
    tree+='<div class="keifuHint"><div style="font-size:12px;font-weight:800;color:var(--ink);line-height:1.5;">そだてかたの ヒント <b>'+totalRev+' / '+allAdults.length+'</b><br><span style="font-size:11px;color:var(--mut);font-weight:700;">すきな「？」を タップ＋🍚'+HINT_COST+' で すがたが わかるよ<br><span style="color:#7c5cd6;">⇄マーク</span>は もういっぽうの ヤングからも なれる子</span></div></div>';
    var lockNode=function(id){ return '<button class="tnode small lock" data-id="'+id+'"><div class="tsprite">？</div><div class="tlabel">🍚×'+HINT_COST+'</div></button>'; };
    // ヤング1種ごとに「ヤング → アダルト6種」を 矢印つきの1行で 表示（レアは どのヤングからでも）
    var lineTiers=[['star','⭐さいこう'],['good','◎よいこ'],['normal','○ふつう'],['wild','△わんぱく']];
    var SHARE_LABEL={}; // どのヤングと 共有しているか（けいふに 表示）
    (function(){ var m=[['ab','star','good'],['bc','good','normal'],['cd','normal','wild'],['ad','wild','star']];
      m.forEach(function(p){ LIN_GROUPS[p[0]].forEach(function(id){ SHARE_LABEL[id]=[p[1],p[2]]; }); }); })();
    var TIER_MARK={star:'⭐',good:'◎',normal:'○',wild:'△'};
    lineTiers.forEach(function(t){ var y=YOUNGS[t[0]];
      tree+='<div class="tiertag">おせわ '+t[1]+' → '+FAMILY_NAME[t[0]]+'</div><div class="lrow"><div class="lfrom">'+tnode(y,y.name,true)+'</div><div class="larrow">→</div><div class="lgrid">'+LINEAGE[t[0]].map(function(id){
        if(!revealed[id]) return lockNode(id);
        var sh=SHARE_LABEL[id], nm=ADULTS[id].name;
        if(sh){ var other=(sh[0]===t[0])?sh[1]:sh[0]; nm+='<span style="color:#7c5cd6;font-size:9px;"> ⇄'+TIER_MARK[other]+'</span>'; } // 共有マーク
        return tnode(ADULTS[id],nm,true);
      }).join('')+'</div></div>';
    });
    tree+='<div class="tiertag">★レア（とくべつな そだてかたで）</div><div class="lrow"><div class="lfrom" style="font-size:11px;font-weight:800;color:var(--mut);text-align:center;line-height:1.5;">どの系統<br>からでも<br><span style="font-size:10px;">(とくべつ条件で<br>でやすく)</span></div><div class="larrow">→</div><div class="lgrid">'+RARE_ADULTS.map(function(id){ return revealed[id]?tnode(ADULTS[id],ADULTS[id].name,true):lockNode(id); }).join('')+'</div></div>';
    if((state.memories||[]).length){
      var mh='<div class="gstage">おもいで（これまでの子）</div>';
      state.memories.forEach(function(m){ var ai=adultById(m.adultType); mh+='<div class="gcard" style="display:flex;gap:12px;align-items:center;text-align:left;margin-bottom:8px;"><div style="flex:none;">'+spriteHTML(ai,3)+'</div><div><div class="gname">'+escJa(m.name)+'（'+escJa(m.adultName||ai.name)+'）</div><div class="gdesc">'+escJa(String(m.days))+'日 いっしょ ／ '+escJa(String(m.died))+' たびだち ／ おぼえた '+escJa(String(m.learned))+'こ</div></div></div>'; });
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
      var wlp=tildePair(w[1],w[2]); // 助詞ではじまる訳は「～」つき表示（よみ側も そろえる）
      var yomi=w[2]?'<span class="wlyomi">'+escJa(wlp[1].join('，'))+'</span>':'';
      var ez=EZ[w[0]]||EZ[w[0].toLowerCase()];
      var easyLine=ez?'<div class="wleasy">やさしく：'+escJa(ez)+'</div>':'';
      var r=state.learn[w[0].toLowerCase()], review=!!(r&&r.w&&!r.m), mastered=!!(r&&r.m);
      var badge=mastered?'<span class="wlmast">✓おぼえた</span>':(review?'<span class="wlwrong">🔁ふくしゅう</span>':'');
      html+='<div class="wlrow'+(review?' iswrong':'')+'"><div class="wltop"><div class="wlen">'+escJa(w[0])+(pos?'<span class="wlpos">'+pos+'</span>':'')+badge+'</div><div class="wlja">'+yomi+'<span>'+escJa(wlp[0].join('，'))+'</span></div></div>'+easyLine+'</div>';
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
  function setAdminTab(t){ curAdminTab=t; ['zukan','kisekae','keifu','tango','data'].forEach(function(k){ document.getElementById('tab-'+k).style.display=(k===t)?'block':'none'; }); document.querySelectorAll('#atabs .atab').forEach(function(b){ b.classList.toggle('sel',b.dataset.t===t); }); if(t==='kisekae') renderCosmetics(); if(t==='tango') renderWordList(); if(t==='data'){ renderData(); renderVoicePicker(); } window.scrollTo(0,0); }
  function lockParent(){ var pp=document.getElementById('okParent'); if(pp) pp.style.display='none'; var lk=document.getElementById('okLock'); if(lk) lk.style.display='block'; }
  function unlockParent(){ var pp=document.getElementById('okParent'); if(pp) pp.style.display='block'; var lk=document.getElementById('okLock'); if(lk) lk.style.display='none'; }
  function renderMoney(){
    lockParent(); // タブを開くたび おうち設定は かくす（子供に見えないように）
    var f=document.getElementById('okFood'); if(f) f.textContent=(state.food||0);
    var payFood=Math.min(state.food||0, walletAvail()); // 買い取り対象は「新たに稼いだエサ」の範囲だけ
    var m=moneyFor(payFood);
    var fb=document.getElementById('okFoodBaht'); if(fb) fb.textContent='฿'+m.total;   // 子供には 見込み額だけ（内訳は出さない）
    var cn=document.getElementById('okCapNote'); if(cn) cn.textContent='※この額は あくまで みこみです（じょうげん あり）';
    var tc=document.getElementById('okTiers'); if(tc) tc.innerHTML=moneyTiers().map(function(t){ return tierRowHTML(t.cap,t.rate); }).join('');
    var h=document.getElementById('okRateHint'); if(h){ var last=moneyTiers(); last=last.length?last[last.length-1].cap:0; h.textContent='いまの えさ '+(state.food||0)+'こ → みこみ ฿'+m.total+'（1匹 さいだい ฿'+last+'）'; }
    var log=document.getElementById('okLog');
    if(log){ var L=state.moneyLog||[];
      if(!L.length){ log.innerHTML='<div style="font-size:12px;color:var(--mut);font-weight:700;text-align:center;padding:12px;">まだ ありません</div>'; }
      else { log.innerHTML=L.map(function(e){ return '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border:2px solid var(--bdr);border-radius:8px;margin-bottom:6px;font-size:12px;font-weight:700;color:var(--ink);"><span>'+escJa(String(e.date))+' <span style="color:var(--mut);">'+escJa(e.name||'')+' えさ'+escJa(String(e.food))+'</span></span><span style="color:#ea580c;font-weight:900;">＋฿'+escJa(String(e.baht))+'</span></div>'; }).join(''); }
    }
  }
  function numAttr(v){ var n=parseInt(v,10); return (isFinite(n)&&n>0)?String(Math.min(99999,n)):''; } // 属性に入れる値は 数値だけに正規化
  function tierRowHTML(cap,rate){ cap=numAttr(cap); rate=numAttr(rate); var inp='padding:7px;border:2px solid var(--bdr);border-radius:8px;font-size:14px;font-family:inherit;text-align:center;background:var(--card);color:var(--ink);';
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
  document.getElementById('btnImport').onclick=function(){ var msg=document.getElementById('dataMsg'); var code=(document.getElementById('importBox').value||'').trim(); if(!code){ msg.style.color='#9b2222'; msg.textContent='コードを はりつけてね'; return; } var obj=null; try{ obj=JSON.parse(decodeURIComponent(escape(atob(code)))); }catch(e){ try{ obj=JSON.parse(code); }catch(e2){} } if(!obj||typeof obj!=='object'||(obj.lv===undefined&&obj.learned===undefined)){ msg.style.color='#9b2222'; msg.textContent='この コードは よみこめません'; return; } if(!confirm('いまの データを この バックアップで 上書きします。よろしいですか？')) return; state=Object.assign({},state,obj); if(!WORDBANK[state.grade]) state.grade='jun2'; save(); msg.style.color='var(--g)'; msg.textContent='ふっかつしました！'; renderData(); render(); };
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
  function drawPetSprite(ctx,g,ox,oy,squash){ if(g.img&&g.img.complete&&g.img.naturalWidth){ ctx.imageSmoothingEnabled=false; if(squash){ ctx.drawImage(g.img,ox-2,oy+Math.round(g.petH*0.35),Math.round(g.petW*1.12),Math.round(g.petH*0.65)); } else { ctx.drawImage(g.img,ox,oy,g.petW,g.petH); } } else if(g.map){ drawPetCanvas(ctx,g.map,ox,oy+(squash?Math.round(g.petH*0.3):0),g.cell); } } // squash=しゃがみ（ひらたく）
  function gameSetup(title,instr,btn){ show('game'); document.getElementById('gover').style.display='none'; document.getElementById('gTitle').textContent=title; document.getElementById('gInstr').textContent=instr; document.getElementById('gJump').textContent=btn; var cv=document.getElementById('gcanvas'); var info=petInfo(); var img=info.img?getImg(info.img):null; var map=petMap(),cell=3; var pw=img?40:Math.max.apply(null,map.map(function(r){ return r.length; }))*cell, ph=img?40:map.length*cell; return { cv:cv,ctx:cv.getContext('2d'),W:cv.width,H:cv.height,map:map,cell:cell,img:img,petW:pw,petH:ph }; }
  function gpop(g,x,y,txt){ (g.pops=g.pops||[]).push({x:x,y:y,t:0,txt:txt}); }
  function drawPops(g,ctx){ if(!g.pops||!g.pops.length) return; g.pops.forEach(function(p){ p.t++; p.y-=0.6; }); g.pops=g.pops.filter(function(p){ return p.t<45; }); ctx.font='bold 11px sans-serif'; g.pops.forEach(function(p){ ctx.fillStyle='rgba(234,88,12,'+(1-p.t/45).toFixed(2)+')'; ctx.fillText(p.txt,p.x-g.cam,p.y); }); }
  function heartMark(ctx,x,y,r){ ctx.fillRect(x-r,y-r+1,r,r); ctx.fillRect(x,y-r+1,r,r); ctx.fillRect(x-r+1,y,2*r-2,r); ctx.fillRect(x-r+3,y+r-1,2*r-6,2); }
  /* ===== マリオ風 よこスクロール アクション =====
     タイル: # れんが / ? はてなブロック / o コイン / E てき / F ゴール旗 / _ 地面 / (空白)あな   */
  var TS=16; // タイルの大きさ
  var STAGES=[
   ["                                                                                                            ",
    "                                                                                                            ",
    "                            o o o                                                                           ",
    "                    ?M     #####            o o                        ?  ?                                 ",
    "              o                            ?#                   o o                          o o o          ",
    "         ?   ###          G         P     ###             PP   #####       G                #####         F ",
    "                                                                                                            ",
    "____________________________________    ______________________    _______________________________________"],
   ["                                                                                                            ",
    "                     o o                                    o o o                                           ",
    "            ?M      #####          ?  ?                    #####            ?                               ",
    "                                                  o o                                   o o o               ",
    "      o     P      G          P   ###      K     ###          PP      G     ###         #####               F",
    "     ###                                                                                                    ",
    "                                                                                                            ",
    "_____________________    ____________________    _________________________    __________________________"],
   ["                                                                                                            ",
    "        o o o                        ?  ?M ?                     o o o o                                    ",
    "       #######                                                  ########              ?  ?                  ",
    "                        o o o                      G                          o o                           ",
    "   ?M   P     G    PP  #######     K         P    ###        G      PP      ####       K        PP         F",
    "                                                                                                            ",
    "                                                                                                            ",
    "________________   ____________________   ______________    ___________________    ______________________"]];
  function tileAt(g,tx,ty){ var row=g.map[ty]; if(!row) return ' '; return row.charAt(tx)||' '; }
  function solidCh(c){ return c==='#'||c==='_'||c==='?'||c==='X'||c==='P'||c==='M'; }
  function solidAt(g,px,py){ var tx=Math.floor(px/TS), ty=Math.floor(py/TS); if(ty<0) return false; if(ty>=g.map.length) return false; return solidCh(tileAt(g,tx,ty)); }
  function setTile(g,tx,ty,ch){ var row=g.map[ty]; if(!row) return; g.map[ty]=row.substring(0,tx)+ch+row.substring(tx+1); }
  function buildStage(g,n){
    var raw=STAGES[Math.min(n,STAGES.length-1)];
    g.map=raw.slice(); g.rows=g.map.length; g.cols=Math.max.apply(null,g.map.map(function(r){ return r.length; }));
    g.map=g.map.map(function(r){ while(r.length<g.cols) r+=' '; return r; });
    g.levelW=g.cols*TS; g.enemies=[]; g.coins=[]; g.goal=null; g.pops=[];
    g.items=[]; g.shells=[];
    for(var y=0;y<g.rows;y++) for(var x=0;x<g.cols;x++){ var c=tileAt(g,x,y);
      if(c==='G'||c==='E'){ g.enemies.push({kind:'goomba',x:x*TS+2,y:y*TS+3,w:13,h:13,vx:-0.55,alive:true,sq:0}); setTile(g,x,y,' '); }
      else if(c==='K'){ g.enemies.push({kind:'koopa',x:x*TS+2,y:y*TS-3,w:13,h:19,vx:-0.45,alive:true,sq:0}); setTile(g,x,y,' '); }
      else if(c==='o'){ g.coins.push({x:x*TS+8,y:y*TS+8,got:false}); setTile(g,x,y,' '); }
      else if(c==='F'){ g.goal={x:x*TS,y:y*TS}; setTile(g,x,y,' '); } }
    g.px=TS*1.5; g.py=g.rows*TS-TS*2-24; g.vx=0; g.vy=0; g.onGround=false; g.cam=0; g.cleared=false; g.face=1; g.flag=0;
  }
  function startMario(){
    var s=gameSetup('だいぼうけん','◀▶で うごく／ジャンプ ながおしで たかく！ てきは ふんで やっつけ、？ブロックから キノコで スーパーに！','ジャンプ');
    if(game) cancelAnimationFrame(game.raf);
    game={ mode:'mario',ctx:s.ctx,W:s.W,H:s.H,img:s.img,map:null,cell:s.cell,
      petW:20,petH:20,left:false,right:false,jump:false,jumpHeld:0,
      hp:3,maxhp:3,inv:0,coinN:0,stage:0,maxStage:STAGES.length,big:false,items:[],shells:[],flag:0,
      t:0,score:0,over:false,banner:0,bannerTxt:'',raf:0 };
    buildStage(game,0); loopMario();
  }
  function mvSet(k,v){ var g=game; if(!g||g.over||g.mode!=='mario') return;
    if(k==='L') g.left=v; else if(k==='R') g.right=v;
    else if(k==='J'){ if(v&&g.onGround&&g.t>90){ g.vy=-7.2; g.onGround=false; g.jumpHeld=10; if(state.sound) tone(620,0,0.06,'square'); } if(!v) g.jumpHeld=0; g.jump=v; }
  }
  function marioClear(){ var g=game; if(g.cleared) return; g.cleared=true; g.score+=50+g.hp*10;
    if(state.sound){ tone(660,0,0.1); tone(880,0.1,0.12); tone(1180,0.22,0.16); }
    if(g.stage>=g.maxStage-1){ setTimeout(function(){ if(game===g&&!g.over) endGame(true); },800); return; }
    g.bannerTxt='ステージ '+(g.stage+1)+' クリア！'; g.banner=110;
    setTimeout(function(){ if(game!==g||g.over) return; g.stage++; buildStage(g,g.stage); if(g.hp<g.maxhp) g.hp++; },1100);
  }
  function marioHurt(g){ if(g.inv>0) return;
    if(g.big){ g.big=false; g.petH=20; g.py+=8; g.inv=90; if(state.sound) tone(300,0,0.12,'square'); return; } // スーパー→ちいさく（原作どおり1回耐える）
    g.hp--; g.inv=80; if(state.sound) tone(180,0,0.14,'square');
    if(g.hp<=0){ endGame(false); return; } g.vy=-4; }
  function goBig(g){ if(g.big) return; g.big=true; g.petH=28; g.py-=8; g.score+=20; gpop(g,g.px,g.py,'スーパー！'); if(state.sound){ tone(660,0,0.07); tone(880,0.07,0.09); } }
  function loopMario(){ var g=game; if(!g||g.over) return; g.t++;
    if(g.cleared&&g.flag<30) g.flag++;                    // はたが するする おりる
    var counting=g.t<=90;
    if(!counting&&!g.cleared){
      // よこ移動
      var acc=g.left?-0.42:(g.right?0.42:0);
      if(acc!==0){ g.vx+=acc; g.face=acc<0?-1:1; } else { g.vx*=0.82; if(Math.abs(g.vx)<0.06) g.vx=0; }
      if(g.vx>2.6) g.vx=2.6; if(g.vx<-2.6) g.vx=-2.6;
      // ジャンプの ながおしで たかく
      if(g.jump&&g.jumpHeld>0){ g.vy-=0.20; g.jumpHeld--; }
      g.vy+=0.46; if(g.vy>8) g.vy=8;
      // よこ判定
      var nx=g.px+g.vx, top=g.py+2, bot=g.py+g.petH-2;
      if(g.vx>0){ if(solidAt(g,nx+g.petW,top)||solidAt(g,nx+g.petW,bot)){ nx=Math.floor((nx+g.petW)/TS)*TS-g.petW-0.01; g.vx=0; } }
      else if(g.vx<0){ if(solidAt(g,nx,top)||solidAt(g,nx,bot)){ nx=(Math.floor(nx/TS)+1)*TS+0.01; g.vx=0; } }
      if(nx<0){ nx=0; g.vx=0; }
      g.px=nx;
      // たて判定
      var ny=g.py+g.vy, lx=g.px+3, rx=g.px+g.petW-3;
      g.onGround=false;
      if(g.vy>0){ if(solidAt(g,lx,ny+g.petH)||solidAt(g,rx,ny+g.petH)){ ny=Math.floor((ny+g.petH)/TS)*TS-g.petH-0.01; g.vy=0; g.onGround=true; } }
      else if(g.vy<0){ if(solidAt(g,lx,ny)||solidAt(g,rx,ny)){
          var hy=Math.floor(ny/TS), hx=Math.floor((g.px+g.petW/2)/TS);
          var hc=tileAt(g,hx,hy);
          if(hc==='M'){ setTile(g,hx,hy,'X'); g.items.push({kind:'mush',x:hx*TS+2,y:hy*TS-14,vx:0.7,vy:0}); if(state.sound) tone(700,0,0.1); }
          else if(hc==='?'){ setTile(g,hx,hy,'X'); g.coinN++; g.score+=10; gpop(g,hx*TS+6,hy*TS,'+10'); if(state.sound) tone(1046,0,0.08); }
          else if(hc==='#'&&g.big){ setTile(g,hx,hy,' '); g.score+=5; gpop(g,hx*TS+4,hy*TS,'+5'); if(state.sound) tone(240,0,0.07,'square'); }
          ny=(hy+1)*TS+0.01; g.vy=0; g.jumpHeld=0; } }
      g.py=ny;
      // あなに おちた
      if(g.py>g.rows*TS+20){
        var btx=Math.floor(g.px/TS);
        while(btx>1&&!solidCh(tileAt(g,btx,g.rows-1))) btx--;                    // 地面のある 手前の列を さがす
        btx=Math.max(1,btx-3);                                                    // ふちから 3タイル 手前に もどす（すぐ また 落ちないように）
        while(btx>1&&!solidCh(tileAt(g,btx,g.rows-1))) btx--;
        g.px=btx*TS; g.py=(g.rows-1)*TS-g.petH-2; g.vx=0; g.vy=0;
        marioHurt(g); if(g.over) return; }
      if(g.inv>0) g.inv--;
      // てき
      g.enemies.forEach(function(e){ if(!e.alive){ e.sq++; return; }
        e.x+=e.vx;
        if(solidAt(g,e.x+(e.vx>0?e.w:0),e.y+e.h/2)) e.vx=-e.vx;                 // かべで はんてん
        if(!solidAt(g,e.x+e.w/2,e.y+e.h+2)) e.vx=-e.vx;                          // はしで はんてん
        if(e.x<0){ e.x=0; e.vx=Math.abs(e.vx); } });
      // こうら（ノコノコを ふむと でる）：うごいて てきを なぎたおす
      g.shells.forEach(function(sh){ if(sh.vx!==0){ sh.x+=sh.vx;
          if(solidAt(g,sh.x+(sh.vx>0?14:0),sh.y+7)) sh.vx=-sh.vx;
          g.enemies.forEach(function(e2){ if(e2.alive&&Math.abs(e2.x-sh.x)<14&&Math.abs(e2.y-sh.y)<16){ e2.alive=false; e2.sq=0; g.score+=20; gpop(g,e2.x,e2.y,'+20'); if(state.sound) tone(1000,0,0.05); } }); }
        if(!solidAt(g,sh.x+7,sh.y+16)) sh.y+=2; });
      g.shells=g.shells.filter(function(sh){ return sh.x>g.cam-60&&sh.x<g.cam+g.W+60; });
      // アイテム（キノコ）：ころがって おちる
      g.items.forEach(function(it){ it.vy+=0.4; if(it.vy>5) it.vy=5;
        var nyI=it.y+it.vy; if(solidAt(g,it.x+7,nyI+14)){ nyI=Math.floor((nyI+14)/TS)*TS-14-0.01; it.vy=0; } it.y=nyI;
        it.x+=it.vx; if(solidAt(g,it.x+(it.vx>0?14:0),it.y+7)) it.vx=-it.vx; });
      for(var mi=g.items.length-1;mi>=0;mi--){ var it=g.items[mi];
        if(g.px+3<it.x+14&&g.px+g.petW-3>it.x&&g.py+g.petH>it.y&&g.py<it.y+14){ g.items.splice(mi,1); goBig(g); } }
      // てきとの あたり
      for(var i=0;i<g.enemies.length;i++){ var e=g.enemies[i]; if(!e.alive) continue;
        if(g.px+3<e.x+e.w&&g.px+g.petW-3>e.x&&g.py+g.petH>e.y&&g.py<e.y+e.h){
          if(g.vy>0&&g.py+g.petH-e.y<14){ e.alive=false; e.sq=0; g.vy=-5.6;
            if(e.kind==='koopa'){ g.shells.push({x:e.x,y:e.y+e.h-16,vx:0}); g.score+=10; gpop(g,e.x,e.y,'+10'); } // ノコノコ→こうら
            else { g.score+=10; gpop(g,e.x,e.y,'+10'); }
            if(state.sound) tone(900,0,0.06); } // ふんだ
          else { marioHurt(g); if(g.over) return; } } }
      g.enemies=g.enemies.filter(function(e){ return e.alive||e.sq<26; });
      for(var sj=0;sj<g.shells.length;sj++){ var sh=g.shells[sj];
        if(g.px+3<sh.x+14&&g.px+g.petW-3>sh.x&&g.py+g.petH>sh.y&&g.py<sh.y+16){
          if(sh.vx===0){ sh.vx=(g.px+g.petW/2<sh.x+7)?3.4:-3.4; g.score+=10; gpop(g,sh.x,sh.y,'ケリ+10'); if(state.sound) tone(760,0,0.06); } // とまっている こうらを ける
          else if(g.vy>0&&g.py+g.petH-sh.y<14){ sh.vx=0; g.vy=-5; }              // うごく こうらを ふんで とめる
          else { marioHurt(g); if(g.over) return; } } }
      // コイン
      g.coins.forEach(function(c){ if(c.got) return;
        if(Math.abs(c.x-(g.px+g.petW/2))<12&&Math.abs(c.y-(g.py+g.petH/2))<14){ c.got=true; g.coinN++; g.score+=5; gpop(g,c.x,c.y,'+5'); if(state.sound) tone(1200,0,0.06); } });
      // ゴール
      if(g.goal&&g.px+g.petW>g.goal.x&&g.px<g.goal.x+16&&g.py+g.petH>g.goal.y-70){
        var hRatio=Math.max(0,Math.min(1,(g.goal.y-(g.py+g.petH))/60));           // たかい ところで つかむほど ボーナス
        g.flagBonus=[10,20,40,60,100][Math.min(4,Math.floor(hRatio*5))];
        g.score+=g.flagBonus; gpop(g,g.px,g.py,'はた+'+g.flagBonus); marioClear(); }
      // カメラ
      var want=g.px-g.W*0.38; g.cam+=(want-g.cam)*0.16;
      if(g.cam<0) g.cam=0; if(g.cam>g.levelW-g.W) g.cam=g.levelW-g.W;
    }
    drawMario(g,counting);
    document.getElementById('gscore').textContent=g.score;
    g.raf=requestAnimationFrame(loopMario);
  }
  function drawMario(g,counting){ var ctx=g.ctx, cam=Math.round(g.cam);
    var sky=['#8fd3ff','#ffd9a8','#c9b6ff'][g.stage%3];
    ctx.fillStyle=sky; ctx.fillRect(0,0,g.W,g.H);
    // とおくの くも
    ctx.fillStyle='rgba(255,255,255,.75)';
    for(var c=0;c<7;c++){ var cx=((c*180-cam*0.3)%(g.W+220))-60, cy=16+(c%3)*22; ctx.fillRect(cx,cy,26,7); ctx.fillRect(cx+6,cy-4,14,5); }
    // タイル
    var x0=Math.floor(cam/TS), x1=Math.min(g.cols-1,x0+Math.ceil(g.W/TS)+1);
    for(var ty=0;ty<g.rows;ty++) for(var tx=x0;tx<=x1;tx++){ var ch=tileAt(g,tx,ty); if(ch===' ') continue;
      var dx=tx*TS-cam, dy=ty*TS;
      if(ch==='_'){ ctx.fillStyle='#6cc06c'; ctx.fillRect(dx,dy,TS,TS); ctx.fillStyle='#4a9e4a'; ctx.fillRect(dx,dy,TS,4); ctx.fillStyle='#8b5a2b'; ctx.fillRect(dx,dy+4,TS,TS-4); }
      else if(ch==='#'){ ctx.fillStyle='#c9793a'; ctx.fillRect(dx,dy,TS,TS); ctx.fillStyle='#a35d28'; ctx.fillRect(dx,dy+7,TS,2); ctx.fillRect(dx+7,dy,2,7); ctx.fillRect(dx+3,dy+9,2,7); }
      else if(ch==='?'){ ctx.fillStyle='#f6c445'; ctx.fillRect(dx,dy,TS,TS); ctx.fillStyle='#d99a1c'; ctx.fillRect(dx,dy,TS,2); ctx.fillRect(dx,dy+TS-2,TS,2); ctx.fillStyle='#7a4a10'; ctx.fillRect(dx+5,dy+4,6,2); ctx.fillRect(dx+9,dy+6,2,3); ctx.fillRect(dx+7,dy+9,3,2); ctx.fillRect(dx+7,dy+12,3,2); }
      else if(ch==='M'){ ctx.fillStyle='#f6c445'; ctx.fillRect(dx,dy,TS,TS); ctx.fillStyle='#d99a1c'; ctx.fillRect(dx,dy,TS,2); ctx.fillRect(dx,dy+TS-2,TS,2); ctx.fillStyle='#7a4a10'; ctx.fillRect(dx+5,dy+4,6,2); ctx.fillRect(dx+9,dy+6,2,3); ctx.fillRect(dx+7,dy+9,3,2); ctx.fillRect(dx+7,dy+12,3,2); }
      else if(ch==='P'){ ctx.fillStyle='#3fa34d'; ctx.fillRect(dx,dy,TS,TS); ctx.fillStyle='#2d7a38'; ctx.fillRect(dx,dy,3,TS); ctx.fillStyle='#6fd07f'; ctx.fillRect(dx+4,dy,3,TS);
        var above=tileAt(g,tx,ty-1); if(above!=='P'){ ctx.fillStyle='#3fa34d'; ctx.fillRect(dx-2,dy,TS+4,5); ctx.fillStyle='#2d7a38'; ctx.fillRect(dx-2,dy,TS+4,2); ctx.fillStyle='#6fd07f'; ctx.fillRect(dx+2,dy+2,3,3); } }
      else if(ch==='X'){ ctx.fillStyle='#a3762f'; ctx.fillRect(dx,dy,TS,TS); ctx.fillStyle='#87611f'; ctx.fillRect(dx+2,dy+2,TS-4,TS-4); } }
    // コイン
    g.coins.forEach(function(co){ if(co.got) return; var dx=co.x-cam; if(dx<-12||dx>g.W+12) return;
      var w=Math.abs(Math.sin(g.t*0.09))*5+2; ctx.fillStyle='#f6c445'; ctx.fillRect(dx-w/2,co.y-7,w,14); ctx.fillStyle='#fde68a'; ctx.fillRect(dx-w/4,co.y-4,Math.max(1,w/2),8); });
    // ゴール旗
    if(g.goal){ var gx=g.goal.x-cam; if(gx>-40&&gx<g.W+40){
      ctx.fillStyle='#cfd8dc'; ctx.fillRect(gx+5,g.goal.y-70,3,70);                 // ポール
      ctx.fillStyle='#f6c445'; ctx.fillRect(gx+3,g.goal.y-74,7,5);                  // てっぺんの たま
      var fy=g.cleared? Math.min(g.goal.y-14, g.goal.y-70+g.flag*2) : (g.goal.y-64);
      ctx.fillStyle='#2e9e4f'; ctx.beginPath(); ctx.moveTo(gx+8,fy); ctx.lineTo(gx+24,fy+6); ctx.lineTo(gx+8,fy+12); ctx.closePath(); ctx.fill(); // はた
      ctx.fillStyle='#9e9e9e'; ctx.fillRect(gx-2,g.goal.y-2,14,18); } }              // だい
    // てき
    g.enemies.forEach(function(e){ var dx=e.x-cam; if(dx<-20||dx>g.W+20) return;
      if(!e.alive){ ctx.fillStyle=e.kind==='koopa'?'#3fa34d':'#8a5a4a'; ctx.fillRect(dx,e.y+e.h-4,e.w,4); return; }
      var st=(Math.floor(g.t/8)%2===0);
      if(e.kind==='koopa'){ // ノコノコ：みどりの こうら＋あたま
        ctx.fillStyle='#3fa34d'; ctx.fillRect(dx,e.y+6,e.w,e.h-6); ctx.fillStyle='#2d7a38'; ctx.fillRect(dx+2,e.y+9,e.w-4,3);
        ctx.fillStyle='#f6e05e'; ctx.fillRect(dx+2,e.y,9,7); ctx.fillStyle='#000'; ctx.fillRect(dx+7,e.y+2,1,2);
        ctx.fillStyle='#f6e05e'; ctx.fillRect(dx+(st?0:e.w-3),e.y+e.h-3,3,3);
      } else { // クリボー：ちゃいろい きのこ形
        ctx.fillStyle='#8a5a2b'; ctx.fillRect(dx,e.y+1,e.w,8); ctx.fillRect(dx+2,e.y,e.w-4,2);
        ctx.fillStyle='#f0d9b5'; ctx.fillRect(dx+1,e.y+9,e.w-2,3);
        ctx.fillStyle='#fff'; ctx.fillRect(dx+2,e.y+3,4,4); ctx.fillRect(dx+7,e.y+3,4,4);
        ctx.fillStyle='#000'; ctx.fillRect(dx+4,e.y+4,2,2); ctx.fillRect(dx+8,e.y+4,2,2);
        ctx.fillStyle='#5c3a19'; ctx.fillRect(dx+(st?-1:e.w-2),e.y+e.h-3,3,3); } });
    // こうら
    g.shells.forEach(function(sh){ var dx=sh.x-cam; if(dx<-20||dx>g.W+20) return;
      ctx.fillStyle='#3fa34d'; ctx.fillRect(dx,sh.y,14,14); ctx.fillStyle='#2d7a38'; ctx.fillRect(dx+2,sh.y+4,10,3); ctx.fillRect(dx+2,sh.y+8,10,2);
      ctx.fillStyle='#f6e05e'; ctx.fillRect(dx+1,sh.y+11,12,3); });
    // キノコ
    g.items.forEach(function(it){ var dx=it.x-cam; if(dx<-20||dx>g.W+20) return;
      ctx.fillStyle='#e2444d'; ctx.fillRect(dx,it.y,14,8); ctx.fillRect(dx+2,it.y-2,10,2);
      ctx.fillStyle='#fff'; ctx.fillRect(dx+2,it.y+1,4,4); ctx.fillRect(dx+8,it.y+1,4,4); ctx.fillRect(dx,it.y+8,14,6);
      ctx.fillStyle='#000'; ctx.fillRect(dx+3,it.y+10,2,2); ctx.fillRect(dx+9,it.y+10,2,2); });
    // プレイヤー
    if(!(g.inv>0&&Math.floor(g.t/4)%2===0)){
      drawPetSprite(ctx,{img:g.img,map:null,cell:g.cell,petW:g.big?26:g.petW,petH:g.petH},Math.round(g.px-cam),Math.round(g.py));
      if(g.big){ ctx.fillStyle='#f6c445'; ctx.fillRect(Math.round(g.px-cam)+2,Math.round(g.py)-5,4,3); ctx.fillRect(Math.round(g.px-cam)+20,Math.round(g.py)-5,4,3); } }
    // HUD
    for(var i=0;i<g.maxhp;i++){ ctx.fillStyle=i<g.hp?'#ef4444':'rgba(0,0,0,.2)'; heartMark(ctx,12+i*13,14,4); }
    ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(g.W-92,7,80,12);
    ctx.fillStyle='#f6c445'; ctx.fillRect(g.W-88,10,6,6);
    ctx.fillStyle='#fff'; ctx.font='bold 10px sans-serif'; ctx.fillText('×'+g.coinN+'  ステージ '+(g.stage+1),g.W-78,17);
    drawPops(g,ctx);
    if(g.banner>0){ g.banner--; ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,g.H/2-18,g.W,36); ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.fillText(g.bannerTxt,g.W/2,g.H/2+6); ctx.textAlign='left'; }
    if(counting){ ctx.font='bold 44px sans-serif'; ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.fillText(String(3-Math.floor(g.t/31)),g.W/2,g.H/2+15); ctx.textAlign='left'; }
  }
  function endGame(won){ var g=game; g.over=true; cancelAnimationFrame(g.raf); var sc=g.score;
    var happyGain=Math.min(30,3+Math.floor(sc/8)); state.happy=Math.min(100,state.happy+happyGain); addXp(5); if(sc>(state.gameHi||0)) state.gameHi=sc; save();
    var medal=sc>=250?'🥇':sc>=150?'🥈':sc>=60?'🥉':'';
    var title=document.querySelector('#gover>div'); if(title) title.textContent=won?'ぜんステージ クリア！🎉':'ゲームオーバー';
    document.getElementById('goverScore').textContent=(medal?medal+' ':'')+'スコア '+sc+'（さいこう '+(state.gameHi||0)+'）';
    document.getElementById('goverReward').textContent='ごきげん +'+happyGain+' ／ '+(won?'ぜんぶ クリア！':'ステージ '+(g.stage+1)+' まで');
    document.getElementById('gover').style.display='flex';
  }
  function leaveGame(){ if(game){ game.over=true; cancelAnimationFrame(game.raf); } show('home'); render(); }
  (function(){
    var bind=function(id,key){ var el=document.getElementById(id); if(!el) return;
      el.addEventListener('pointerdown',function(e){ e.preventDefault(); mvSet(key,true); });
      ['pointerup','pointercancel','pointerleave'].forEach(function(ev){ el.addEventListener(ev,function(){ mvSet(key,false); }); }); };
    bind('gLeft','L'); bind('gRight','R'); bind('gJump','J');
    var cv=document.getElementById('gcanvas');
    if(cv){ cv.addEventListener('pointerdown',function(e){ e.preventDefault(); mvSet('J',true); });
      ['pointerup','pointercancel'].forEach(function(ev){ cv.addEventListener(ev,function(){ mvSet('J',false); }); }); }
    document.getElementById('gRetry').onclick=function(){ if(state.food<=0){ leaveGame(); bubble('えさが なくなった！べんきょうで あつめよう'); return; } consumePlay(); startMario(); };
    document.getElementById('gHome').onclick=leaveGame; document.getElementById('backGame').onclick=leaveGame; })();

  /* ---- study ---- */
  var session, qIdx, qList;
  var MAIN_TABS=['home','learn','okane','admin'];
  function show(id){ document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('on'); }); document.getElementById(id).classList.add('on'); var tb=document.getElementById('tabbar'); if(MAIN_TABS.indexOf(id)>=0){ tb.classList.add('on'); document.querySelectorAll('#tabbar .tab').forEach(function(b){ b.classList.toggle('sel',b.dataset.s===id); }); } else { tb.classList.remove('on'); } window.scrollTo(0,0); }
  function gotoTab(s){ if(s==='admin'){ renderAdmin(); wlGrade=state.grade; setAdminTab('zukan'); } if(s==='okane'){ renderMoney(); } if(s==='learn'){ announceBonuses(); } show(s); render(); } // 単語一覧(最大2258行)は たんごタブを開いたときだけ描画
  document.getElementById('tabbar').onclick=function(e){ var b=e.target.closest('.tab'); if(!b) return; gotoTab(b.dataset.s); };
  var ADMIN_TABS=['zukan','kisekae','keifu','tango','data'];
  function swipeTab(dir){ var cur=document.querySelector('.screen.on'); if(!cur) return; if(document.getElementById('goalCele').style.display==='flex') return; if(cur.id==='admin'){ var i=ADMIN_TABS.indexOf(curAdminTab),ni=i+dir; if(ni>=0&&ni<ADMIN_TABS.length){ setAdminTab(ADMIN_TABS[ni]); return; } if(dir<0&&i<=0){ gotoTab('learn'); } return; } if(MAIN_TABS.indexOf(cur.id)>=0){ var i2=MAIN_TABS.indexOf(cur.id),ni2=i2+dir; if(ni2>=0&&ni2<MAIN_TABS.length) gotoTab(MAIN_TABS[ni2]); } }
  var swX=0,swY=0,swOn=false;
  document.body.addEventListener('touchstart',function(e){ if(e.touches.length!==1){ swOn=false; return; } swX=e.touches[0].clientX; swY=e.touches[0].clientY; swOn=true; },{passive:true});
  document.body.addEventListener('touchend',function(e){ if(!swOn) return; swOn=false; var t=e.changedTouches[0],dx=t.clientX-swX,dy=t.clientY-swY; if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){ swipeTab(dx<0?1:-1); } },{passive:true});
  document.getElementById('sndset').onclick=function(e){ var b=e.target.closest('.optbtn'); if(!b) return; state.sound=b.dataset.v==='1'; save(); renderGoal(); if(state.sound) sfx('correct'); };
  document.getElementById('boxBtn').onclick=function(){ if(!boxAvailable()) return; state.lastBoxWeek=weekId(today()); state.food+=10; walletEarn(10); state.freezeTickets=Math.min(5,state.freezeTickets+1); addXp(20); bubble('たからばこ：えさ+10・おやすみ券+1！'); sfx('fanfare'); cheer(); save(); render(); };
  // 上級モード：おうちの人コードで 英検3級・1級を がくしゅうの きゅう選択に出す（子供には ふだん見えない）
  function applyAdv(){ document.body.classList.toggle('advgrades',!!state.advGrades); var as=document.getElementById('advState'); if(as) as.innerHTML=state.advGrades?'<span style="color:var(--g);font-weight:900;">いま ON（3級・1級が えらべます）</span>':'いま OFF（準2級・2級のみ）'; }
  (function(){ var bt=document.getElementById('advToggle'); if(!bt) return; bt.onclick=function(){ if(state.advGrades){ state.advGrades=false; if(state.grade==='g3'||state.grade==='g1') state.grade='jun2'; save(); applyAdv(); render(); bubble('上級モードを もどしました'); return; } var en=prompt('おうちのひとコードを いれてね'); if(en===null) return; if((en||'').replace(/\D/g,'')==='0785770131'){ state.advGrades=true; save(); applyAdv(); render(); bubble('上級モード ON：3級・1級が えらべます'); } else bubble('コードが ちがいます'); }; applyAdv(); })();
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
  var curWord=null, reviewMode=false, qMode='meaning', qMissed=false, spellMiss=0, requeued={}; // qMissed:一度でも まちがえたか（総当たり防止） / spellMiss:スペルの誤答回数（2回で確定） / requeued:このセッションで再出題ずみの語
  // ④ 紛らわしいダミー：まず同じ品詞の語から、足りなければランダムで
  function pickDistractors(correct,n){ var en=correct[0], pos=correct[3];
    var pool=currentWords().filter(function(w){ return w[0]!==en&&w[1]!==correct[1]; });
    var same=pool.filter(function(w){ return w[3]===pos; });
    var picks=shuffle(same).slice(0,n);
    if(picks.length<n){ var rest=shuffle(pool.filter(function(w){ return picks.indexOf(w)<0; })).slice(0,n-picks.length); picks=picks.concat(rest); }
    return picks; }
  // 1回のべんきょうは つねに QPER(5)問で固定。まちがえた語は 同セッションでは増やさず、
  //   次回に 重み×5 で 優先的に 再登場する（requeueMissedは 何もしない）
  function requeueMissed(w){ /* no-op: セッションを のばさない */ }
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
  function startStudy(){ reviewMode=false; requeued={}; qList=pickWeighted(currentWords(),QPER); qIdx=0; session={correct:0,combo:0,maxCombo:0,newMastered:0,total:qList.length}; document.getElementById('qTotal').textContent=qList.length; show('study'); nextQ(); }
  function escJa(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); } // HTMLに入れる文字列は かならず これを通す
  function splitSenses(s){ return (s||'').split(/[，、,]/).map(function(x){ return x.trim(); }).filter(Boolean); }
  // 各いみの ふりがなを その漢字の 真上に（ruby）。コンマで 行を わける
  // 助詞ではじまる訳に「～」をつけて分かりやすく（例：をし続ける → ～をし続ける）
  //   「を」は日本語の語頭に来ないので つねに助詞。ほかの助詞は 直後が漢字のときだけ
  //   （「とても」「がん」「へや」「かつて」などの ふつうの語を まちがえて 変えないため）
  var TILDE_KANJI=/[一-鿿]/, TILDE_MULTI=['から','より','について','における'], TILDE_ONE=['に','の','へ','で','と','が','は','も'];
  function needsTilde(ja){
    if(!ja || /^[～〜]/.test(ja)) return false;
    if(ja.charAt(0)==='を') return true;
    for(var i=0;i<TILDE_MULTI.length;i++){ var m=TILDE_MULTI[i]; if(ja.indexOf(m)===0 && TILDE_KANJI.test(ja.charAt(m.length))) return true; }
    for(var j=0;j<TILDE_ONE.length;j++){ if(ja.charAt(0)===TILDE_ONE[j] && TILDE_KANJI.test(ja.charAt(1))) return true; }
    return false;
  }
  // いみ ごとに 判定して「～」をつける。漢字側で きめて、よみにも 同じだけ つける（ルビが ずれないように）
  function tildePair(kanjiStr,yomiStr){
    var ks=splitSenses(kanjiStr), ys=splitSenses(yomiStr), ko=[], yo=[];
    for(var i=0;i<ks.length;i++){ var k=ks[i], y=ys[i];
      if(needsTilde(k)){ k='～'+k; if(y) y='～'+y; }
      ko.push(k); if(y!==undefined) yo.push(y); }
    return [ko,yo];
  }
  function jaT(ja){ return tildePair(ja,'')[0].join('，')||ja; } // プレーン表示用（WORDBANKは書きかえない）
  function rubyHTML(kanjiStr,yomiStr){
    var pr=tildePair(kanjiStr,yomiStr), ks=pr[0], ys=pr[1];
    return ks.map(function(k,i){ var y=ys[i]; return y?('<ruby>'+escJa(k)+'<rt>'+escJa(y)+'</rt></ruby>'):escJa(k); }).join('，<br>'); }
  function choiceHtml(w){ var lng=(w[1]||'').length>9?' long':''; return '<span class="base'+lng+'">'+rubyHTML(w[1],w[2])+'</span>'; }
  function firstSenseKana(w){ var s=(w[2]||w[1]||''); return s.split(/[\u3001,\uff0c]/)[0].trim(); }
  function easyText(w){ var k=(w[0]||''); var e=(typeof EASY!=='undefined')?(EASY[k]||EASY[k.toLowerCase()]):null; return e||firstSenseKana(w); }
  function showEasy(w,noScroll){ var box=document.getElementById('easyHint'); box.innerHTML='<div class="ehlabel">やさしいいみ</div><div class="ehmean">'+escJa(easyText(w))+'</div>'; box.style.display='block'; if(noScroll) return; try{ box.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){ try{ box.scrollIntoView(); }catch(_){} } }
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
    var correct=qList[qIdx]; curWord=correct; qMissed=false; spellMiss=0;
    var en=correct[0];
    qMode=pickQMode();
    if(qMode==='spell'&&spellLetters(en).length>12) qMode='meaning'; // 長い単語・熟語のスペル入力は むずかしすぎるので 4択に
    document.getElementById('qNo').textContent=qIdx+1;
    document.getElementById('reward').textContent='';
    var qw=document.getElementById('qword'), prompt=document.getElementById('qPrompt'), hint=document.getElementById('qHint');
    var box=document.getElementById('choices'); box.innerHTML=''; box.style.pointerEvents='';
    var spellArea=document.getElementById('spellArea'); var isSpell=(qMode==='spell');
    box.style.display=isSpell?'none':'grid'; if(spellArea) spellArea.style.display=isSpell?'block':'none';
    var mkBtn=function(o,html){ var b=document.createElement('button'); b.className='ch'; b.innerHTML=html; b._word=o; if(o===correct) b._isCorrect=true; b.onclick=function(){ /* 長押し直後(700ms)のクリックだけ無視。古いフラグ残りでタップが押せなくなるのを防ぐ */ if(b._lp){ b._lp=false; if(Date.now()-(b._lpAt||0)<700) return; } answer(b,o===correct,en); }; if(qMode!=='reverse') attachLongPress(b,function(){ showEasy(o); }); box.appendChild(b); }; // 逆引きは 選択肢が英語＝長押しで答えが分かるので 無効
    var speakBtn=document.getElementById('speak'); if(speakBtn) speakBtn.style.display=(qMode==='reverse')?'none':'inline-flex'; // 逆引きは 答え(英語)を読み上げないよう きくボタンを隠す
    if(qMode==='reverse'){
      // いみ（漢字＋ふりがな）→ えいごを えらぶ
      prompt.textContent='この いみの えいごは？';
      var kanji=correct[1]||'', yom=correct[2]||'';
      qw.innerHTML='<div class="qmain">'+rubyHTML(kanji,yom)+'</div>';
      qw.classList.toggle('long', kanji.length>6);
      if(hint) hint.textContent='もんだいを ながおしで やさしいいみ';
      shuffle([correct].concat(pickDistractors(correct,3))).forEach(function(o){ mkBtn(o,'<span class="base'+((o[0]||'').length>9?' long':'')+'">'+escJa(o[0])+'</span>'); });
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
      shuffle([correct].concat(pickDistractors(correct,3))).forEach(function(o){ mkBtn(o,choiceHtml(o)); });
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
    else { qMissed=true; spellMiss++; session.combo=0; onAnswer(curWord[0],false); save(); sfx('wrong'); // まちがい＝この時点で「にがて・ふくしゅうゆき」に記録
      if(spellMiss>=2){ inp.disabled=true; var sb=document.getElementById('spellSubmit'); if(sb) sb.disabled=true; speak(curWord[0]); requeueMissed(curWord); document.getElementById('reward').textContent='ざんねん… こたえは「'+curWord[0]+'」　ふくしゅうに いれたよ'; showEasy(curWord); showNext(); } // 2回まちがい＝確定・答え表示
      else { document.getElementById('reward').textContent='おしい！ もう1かい かいてみよう（タイプミス？）'; try{ inp.focus(); inp.select(); }catch(e){} } }
  }
  function recordLearned(en){ if(state.todayDate!==today()){ state.todayDate=today(); state.todayWords=[]; } var k=en.toLowerCase(), already=state.todayWords.indexOf(k)>=0; if(!already) state.todayWords.push(k); if(!already&&state.todayWords.length===state.dailyGoal){ onGoalReached(); } }
  function streakOnGoal(){ if(state.lastGoalDate===today()) return; if(state.lastGoalDate===yesterday()){ state.streak++; } else if(state.lastGoalDate){ var gap=Math.round((new Date(today())-new Date(state.lastGoalDate))/86400000)-1; if(gap>0&&state.freezeTickets>=gap){ state.freezeTickets-=gap; state.streak++; bubble('おやすみ券で れんぞく キープ！'); } else state.streak=1; } else state.streak=1; state.lastGoalDate=today(); if(state.streak>(state.maxStreak||0)) state.maxStreak=state.streak; if(state.metDates.indexOf(today())<0) state.metDates.push(today()); if(state.metDates.length>60) state.metDates=state.metDates.slice(-60); }
  function onGoalReached(){ streakOnGoal(); state.food+=5; walletEarn(5); state.happy=100; gainGP(20); gainGP(Math.min(state.streak,15)); state.dblNext=tomorrow(); checkTitles(); setTimeout(showGoalCelebration,850); } // きょう20こ→あした えさ×2
  function checkUnlock(prevLearned){ var items=BGS.filter(function(it){ return it.need>prevLearned&&it.need<=state.learned; }); if(items.length){ bubble('あたらしい はいけい アンロック！'); sfx('unlock'); } }
  function awardCorrect(en){
    var prev=state.learned, kL=en.toLowerCase(), wasM=!!(state.learn[kL]&&state.learn[kL].m);
    state.genCorrect=(state.genCorrect||0)+1; // この世代の せいかい数（べんきょうか 相性用）
    session.combo=(session.combo||0)+1; if(session.combo>(session.maxCombo||0)) session.maxCombo=session.combo;
    var mult=session.combo>=3?2:1; var gb=isDblDay()?2:1; var dd=isDoubleDay()?2:1; var gain=mult*gb*dd;
    var longLive=state.lv>=5 && ageDays()>=10; // 10日いっしょに いられたら えさ ×2
    if(longLive) gain*=2;
    session.correct++; state.food+=gain; walletEarn(gain); state.learned++; gainGP((reviewMode?10:8)*gain); onAnswer(en,true);
    if(!wasM&&state.learn[kL]&&state.learn[kL].m) session.newMastered=(session.newMastered||0)+1;
    recordLearned(en); checkUnlock(prev); checkTickets(); checkTitles(); sfx(session.combo>=3?'combo':'correct');
    var msg2='せいかい！'; if(mult>1) msg2+=' コンボ×'+mult; if(gb>1) msg2+=' ✨まいにちボーナス×2'; if(dd>1) msg2+=' 🎉2ばいデー'; if(longLive) msg2+=' 🌟10日ボーナス×2'; msg2+=reviewMode?' おぼえたね':(' えさ+'+gain);
    document.getElementById('reward').textContent=msg2; save(); checkEvolve();
    showNext();
  }
  function answer(btn,ok,en){ var _cb0=document.getElementById('choices'); if(_cb0&&_cb0.style.pointerEvents==='none') return; /* 回答済みなら無効 */ if(btn.classList.contains('ok')||btn.classList.contains('ng')) return;
    if(ok){
      if(qMode==='reverse') speak(en);
      btn.classList.add('ok'); if(_cb0) _cb0.style.pointerEvents='none';
      awardCorrect(en);
    } else {
      // まちがい → 正しいこたえを 見せ、②「せいかいを タップ」で 能動的に確認してから すすむ。①同セッションで 再出題
      btn.classList.add('ng'); if(_cb0) _cb0.style.pointerEvents='none';
      session.combo=0; onAnswer(en,false); save(); sfx('wrong'); speak(en); // 正しい はつおんを きかせる
      requeueMissed(curWord);
      showEasy(curWord,true); // 選択肢を 見える位置に のこす（スクロールしない）
      var pickedInfo='';                                   // えらんだ ほうの 単語も おしえる（1問で 2語 おぼえられる）
      var pw=btn._word;
      if(pw && pw!==curWord){
        if(qMode==='reverse') pickedInfo='えらんだ「'+escJa(pw[0])+'」は '+escJa(splitSenses(pw[1])[0]||pw[1])+' だよ';
        else pickedInfo='えらんだ いみは「'+escJa(pw[0])+'」だよ';
      }
      document.getElementById('reward').innerHTML=(pickedInfo?'<span style="font-size:12px;color:#7c5cd6;font-weight:800;">'+pickedInfo+'</span><br>':'')+'ざんねん… せいかい（みどり）を タップしてね';
      var dk=document.getElementById('dontKnow'); if(dk) dk.style.display='none';
      if(_cb0){ var cs=_cb0.querySelectorAll('.ch'); for(var i=0;i<cs.length;i++){ var c=cs[i];
        if(c._isCorrect){ c.classList.add('ok','tapnext'); c.style.pointerEvents='auto'; c.onclick=function(){ this.classList.remove('tapnext'); document.getElementById('reward').textContent='こたえは これ！ ふくしゅうに いれたよ'; showNext(); var nb=document.getElementById('nextBtn'); if(nb) try{ nb.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){} }; }
        else { c.classList.add('dim'); } } }
    } }
  function finishStudy(){ updateStudyProg();
    var sc=document.getElementById('sdCorrect'); if(sc) sc.textContent=(session.correct||0)+' / '+(session.total||qList.length);
    var sm=document.getElementById('sdMastered'); if(sm) sm.textContent=session.newMastered||0;
    var scb=document.getElementById('sdCombo'); if(scb) scb.textContent=session.maxCombo||0;
    var ov=document.getElementById('sessDone'); if(ov) ov.style.display='flex'; else { show('learn'); render(); }
    cheer();
  }
  var enVoice=null;
  var VOICE_NAMES=['Samantha','Daniel','Karen']; // つかえる こえは この3つだけ
  function enVoices(){ return (window.speechSynthesis?speechSynthesis.getVoices():[]).filter(function(v){ return /^en[-_]?/i.test(v.lang); }); }
  function pickerVoices(){ var vs=enVoices(); var picks=[]; VOICE_NAMES.forEach(function(nm){ var v=vs.find(function(vv){ return vv.name.indexOf(nm)>=0; }); if(v) picks.push(v); }); return picks; }
  function pickVoice(){ var pv=pickerVoices(); if(pv.length){ if(state.voiceName){ var sv=pv.find(function(v){ return v.name===state.voiceName; }); if(sv) return sv; } return pv[0]; } var vs=enVoices(); if(!vs.length) return null; return vs.find(function(v){ return /en[-_]US/i.test(v.lang); })||vs[0]; }
  function ensureVoice(){ if(!enVoice) enVoice=pickVoice(); return enVoice; }
  function renderVoicePicker(){ var sel=document.getElementById('voiceSel'); if(sel){ var pv=pickerVoices(), cur=ensureVoice(); if(!pv.length){ sel.innerHTML='<option>（このタブレットには えいご音声が ありません）</option>'; sel.disabled=true; } else { sel.disabled=false; sel.innerHTML=pv.map(function(v){ return '<option value="'+v.name.replace(/"/g,'&quot;')+'"'+(cur&&v.name===cur.name?' selected':'')+'>'+escJa(v.name)+'</option>'; }).join(''); } } var rs=document.getElementById('rateSel'); if(rs){ var r=String(state.speechRate||0.8); Array.prototype.forEach.call(rs.options,function(o){ o.selected=(o.value===r); }); } }
  if(window.speechSynthesis){ speechSynthesis.onvoiceschanged=function(){ enVoice=pickVoice(); renderVoicePicker(); }; ensureVoice(); }
  (function(){ var sel=document.getElementById('voiceSel'); if(sel) sel.onchange=function(){ state.voiceName=sel.value; enVoice=enVoices().find(function(v){ return v.name===sel.value; })||null; save(); speak('Hello!'); }; var rs=document.getElementById('rateSel'); if(rs) rs.onchange=function(){ state.speechRate=parseFloat(rs.value)||0.8; save(); speak('Hello! Good job!'); }; var tb=document.getElementById('voiceTest'); if(tb) tb.onclick=function(){ speak('Hello! Good job!'); }; renderVoicePicker(); })();
  function speak(en){ try{ if(!window.speechSynthesis) return; var u=new SpeechSynthesisUtterance(en); var v=ensureVoice(); if(v){ u.voice=v; u.lang=v.lang; } else { u.lang='en-US'; } u.rate=state.speechRate||0.8; u.pitch=1.0; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(e){} }
  document.getElementById('speak').onclick=function(){ speak(curWord?curWord[0]:document.getElementById('qword').textContent); };
  (function(){ var sb=document.getElementById('spellSubmit'); if(sb) sb.onclick=submitSpell; var si=document.getElementById('spellInput'); if(si){ si.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); submitSpell(); } }); si.addEventListener('input',updateSpellBars); } var qw=document.getElementById('qword'); if(qw) attachLongPress(qw,function(){ if(curWord && (qMode==='reverse'||qMode==='spell')) showEasy(curWord); }); })();
  document.getElementById('dontKnow').onclick=function(){
    if(!curWord) return;
    if(qMode==='spell'){ var inp=document.getElementById('spellInput'); if(inp&&inp.disabled) return; if(inp) inp.disabled=true; var sb2=document.getElementById('spellSubmit'); if(sb2) sb2.disabled=true; qMissed=true; onAnswer(curWord[0],false); save(); speak(curWord[0]); requeueMissed(curWord); document.getElementById('reward').textContent='こたえ：'+curWord[0]; showEasy(curWord); showNext(); return; }
    var box=document.getElementById('choices');
    if(box.style.pointerEvents==='none') return; // すでに回答済み
    box.style.pointerEvents='none';
    var btns=box.querySelectorAll('.ch'); for(var i=0;i<btns.length;i++){ if(btns[i]._isCorrect) btns[i].classList.add('ok'); }
    qMissed=true; onAnswer(curWord[0],false); save(); speak(curWord[0]); requeueMissed(curWord); // わからない＝復習まちへ、正しい発音を きかせる
    document.getElementById('reward').textContent='こたえ：'+(qMode==='reverse'?curWord[0]:jaT(curWord[1]));
    showEasy(curWord); showNext();
  };

  /* ---- すねる・いたずら ---- */
  // かまってあげない（あそばない）／すなおさが ひくいと ふてくされて、えさを ちらかす
  var SULK_IDLE_H=24, MISCHIEF_COOL=60*60000, MISCHIEF_MAX=4; // 24時間あそばない / 1時間に1回まで / 1日4回まで
  function playIdleH(){ return (Date.now()-(state.lastPlay||state.born||Date.now()))/3600000; }
  function isSulking(){ return state.lv>=2 && !state._farewell && (playIdleH()>=SULK_IDLE_H || state.discipline<30); }
  function sulkReason(){ return (state.discipline<30 && playIdleH()>=SULK_IDLE_H) ? 'both' : (state.discipline<30 ? 'disc' : 'play'); }
  function doMischief(){
    if(!isSulking() || state.food<=0 || asleep) return;
    var now=Date.now();
    if(state.mischiefDate!==today()){ state.mischiefDate=today(); state.mischiefN=0; }
    if((state.mischiefN||0)>=MISCHIEF_MAX) return;
    if(state.mischiefAt && now-state.mischiefAt<MISCHIEF_COOL) return;
    if(Math.random()>=0.5) return;                       // すねていても 毎回では ない
    var lost=Math.min(state.food, 2+Math.floor(Math.random()*2)); // えさ 2〜3
    state.food-=lost; state.mischiefAt=now; state.mischiefN=(state.mischiefN||0)+1;
    state.happy=Math.max(0,state.happy-4);
    save(); render();
    bubble('ふてくされて えさを ちらかした！ えさ-'+lost);
    sfx('wrong');
  }
  /* ---- wagamama ---- */
  var wagaTimer=null;
  function homeVisible(){ return document.getElementById('home').classList.contains('on')&&!document.hidden; }
  function triggerWagamama(){ if(state.wagamama||state.lv<2) return; if(typeof wakePet==='function') wakePet(); state.wagamama=true; render(); bubble("！ かまって！"); clearTimeout(wagaTimer); wagaTimer=setTimeout(function(){ if(state.wagamama){ state.wagamama=false; state.disciplineMiss++; state.discipline=Math.max(0,state.discipline-4); save(); render(); } },22000); }
  // すなおさ(discipline)が ひくいほど わがままが おおく、たかいほど おだやかに
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
  setTimeout(announceBonuses,600); // アプリを ひらいた ときにも ×2デーを おしらせ
  function warnNeglect(){ // お別れの まえに ちゃんと けいこく（毎日世話をうながす）
    if(state._farewell||state.lv<2||!homeVisible()) return;
    var now=Date.now();
    if(state.starveSince && now-state.starveSince>=NEGLECT_MS*0.4){ bubble('おなかが ぺこぺこ…ごはんを あげて！'); return; }
    if(state.sick && state.sickSince && now-state.sickSince>=NEGLECT_MS*0.4){ bubble('ぐあいが わるいよ…はやく おくすりを！'); return; }
    if(state.dirty && state.dirtySince && now-state.dirtySince>=6*3600000){ bubble('よごれてるよ…そうじ してね！'); } // 6時間 放置で けいこく
  }
  setInterval(function(){ if(state._farewell) return; decayStats(); save(); var c=checkEvolve(); if(checkDeath()) return; warnNeglect(); if(homeVisible()) doMischief(); if(homeVisible()&&!c) render(); },60000);
  // バックアップ催促（週1・進捗が貯まってから）
  if(!state._farewell && state.learned>=30){ var lb=state.lastBackupNudge; var due=!lb || (Math.round((new Date(today())-new Date(lb))/86400000)>=7); if(due){ state.lastBackupNudge=today(); save(); setTimeout(function(){ bubble('ときどき データを バックアップしてね（せってい→データ）'); },2500); } }
  try{ document.getElementById('rev').textContent='バージョン '+(typeof APP_REV!=='undefined'?APP_REV:'?'); }catch(e){}
};
