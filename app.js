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
  // ヤングの姿は 確率制：本命ランクが いちばん でやすいが、はなれた ランクにも そこそこ なる
  // YOUNG_SPREAD が 小さいほど ランダム（1.0で 完全ランダム＝各25%、2.0だと 本命53%）
  var YOUNG_SPREAD=1.4;                                  // 本命 約34〜39%・となり 約24〜28%
  function rollYoungTier(){ var ei=TIER_ORDER.indexOf(earnedTierKey()); var ws=TIER_ORDER.map(function(k,i){ return 1/Math.pow(YOUNG_SPREAD,Math.abs(i-ei)); }); var tot=0,i; for(i=0;i<ws.length;i++) tot+=ws[i]; var r=Math.random()*tot; for(i=0;i<ws.length;i++){ r-=ws[i]; if(r<=0) return TIER_ORDER[i]; } return TIER_ORDER[ei]; }
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
    s=sanitizeImport(s);                                  // 保存データ経由の すりかえも ふせぐ
    if(!WORDBANK[s.grade]) s.grade="jun2";
    if((s.grade==='g3'||s.grade==='g1')&&!s.advGrades) s.grade='jun2'; // 上級モードOFFなら 子供向けの きゅうに もどす
    // ライフサイクル改修(schemaV2)への移行：旧アダルト(lv4)→新アダルト(lv5)
    if(!s.schemaV || s.schemaV<2){ if(s.lv>=4) s.lv=5; if(typeof s.born!=='number') s.born=Date.now(); if(typeof s.stageSince!=='number') s.stageSince=Date.now(); if(typeof s.lifespanDays!=='number') s.lifespanDays=12; if(!Array.isArray(s.memories)) s.memories=[]; s.schemaV=2; }
    // 間隔反復(schemaV3)への移行：これまでの おぼえた/にがて を SRSの レベルに 割りあてる
    if(!s.schemaV || s.schemaV<3){
      var t0=dayStr(new Date());
      var addD=function(n){ var d=new Date(t0); d.setDate(d.getDate()+n); return dayStr(d); };
      for(var lk in (s.learn||{})){ var r=s.learn[lk];
        if(r.m&&!r.w){ r.lv=2; r.ivl=7;  r.due=addD(7); }        // 一発正解で おぼえた
        else if(r.m&&r.w){ r.lv=1; r.ivl=3; r.due=addD(3); }     // 間違えたあと おぼえた
        else { r.lv=0; r.ivl=0; r.due=t0; r.m=false; }           // にがて＝きょうから
      }
      s.schemaV=3;
    }
    return s;
  })();
  function save(){ try{ var js=JSON.stringify(state); localStorage.setItem(KEY,js); localStorage.setItem(BAKKEY,js); }catch(e){} }

  /* ===== がくしゅうログ（この たんまつの中だけ・外には おくりません） =====
     1問こたえるごとに 1行ずつ 記録し、あとから CSV/JSON で とりだして
     出題アルゴリズムの チューニングに つかう。日ごとに 分けて保存するので
     書きこみは いつも かるい（1日ぶんだけ 書きかえる）。                        */
  var LOG_PREFIX='eigopet_log_', LOG_KEEP_DAYS=400;
  var LOG_COLS=['ts','day','word','grade','mode','ok','ms','kind','lvBefore','ivlBefore','lateDays','spellMiss','viaDontKnow','streak','todayIdx','fast'];
  function logDays(){ var out=[];
    try{ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i);
      if(k&&k.indexOf(LOG_PREFIX)===0) out.push(k.slice(LOG_PREFIX.length)); } }catch(e){}
    return out.sort(); }
  function logLoad(day){ try{ var v=localStorage.getItem(LOG_PREFIX+day); return v?(JSON.parse(v)||[]):[]; }catch(e){ return []; } }
  function logPrune(){ var ds=logDays();
    while(ds.length>LOG_KEEP_DAYS){ try{ localStorage.removeItem(LOG_PREFIX+ds.shift()); }catch(e){} } }
  function logPush(row){
    try{ var d=row[1], a=logLoad(d); a.push(row); localStorage.setItem(LOG_PREFIX+d,JSON.stringify(a)); logPrune(); }
    catch(e){ /* 容量オーバーなら いちばん ふるい日を すてて 1回だけ やりなおす */
      try{ var ds=logDays(); if(ds.length){ localStorage.removeItem(LOG_PREFIX+ds[0]);
        var a2=logLoad(row[1]); a2.push(row); localStorage.setItem(LOG_PREFIX+row[1],JSON.stringify(a2)); } }catch(e2){} }
  }
  function logAll(){ var out=[]; logDays().forEach(function(d){ out=out.concat(logLoad(d)); }); return out; }
  function logClear(){ logDays().forEach(function(d){ try{ localStorage.removeItem(LOG_PREFIX+d); }catch(e){} }); }
  var MODE_N={meaning:0,spell:1,reverse:2}, MODE_JA=['英→日4択','スペル入力','日→英4択'];
  /* ===== すでに 知っている語を はやく 見きわめる =====
     おなじ級の中には もともと 知っている語が まざっていて、そこに 復習の枠を
     使われるのは もったいない（試算：既知35%だと 出題の35%が そこに 消える）。
     ・ヒントも 音声も つかわず、その子にしては はやく 正解した＝「知っている」サイン
     ・2回 つづいたら 間隔を 一気に のばす（まぐれ当たりの 先送りを へらす安全版）
     ・「はやい」の基準は 固定値ではなく その子自身の 回答時間から きめる         */
  var FAST_DEFAULT=[3500,9000,4500];                  // まだ データが 少ないとき用（形式ごと・ミリ秒）
  var fastTh=null;                                    // 形式ごとの しきい値（べんきょう開始時に 計算）
  function calcFastThreshold(){
    var rows=logAll(), by=[[],[],[]];
    for(var i=0;i<rows.length;i++){ var r=rows[i];
      if(r[5]===1&&r[6]>300&&r[6]<120000&&by[r[4]]) by[r[4]].push(r[6]); }   // 正解ぶんだけ
    fastTh=FAST_DEFAULT.map(function(def,m){
      var a=by[m]; if(a.length<20) return def;         // サンプルが 少ないうちは 既定値
      a.sort(function(x,y){ return x-y; });
      return Math.round(a[Math.floor(a.length*0.4)]);  // その子の 正解の うち はやいほうから 40%
    });
  }
  function isFastAnswer(ms){
    if(!fastTh) calcFastThreshold();
    var m=MODE_N[qMode]; if(m===undefined) m=0;
    return ms>0 && ms<=fastTh[m];
  }

  var qStartAt=0, qUsedHint=false, qUsedAudio=false;     // 出した時刻と、ヒント・音声を つかったか
  // onAnswer の まえに よんで、こたえる直前の SRS状態も いっしょに のこす
  function recordAnswer(en,ok,via){
    var k=(en||'').toLowerCase(), r=state.learn[k];
    var ms=qStartAt?Math.min(600000,Date.now()-qStartAt):0;
    // ヒントも 音声も つかわず はやく 正解した＝「もう 知っている」サイン
    var fast=ok&&!qUsedHint&&!qUsedAudio&&!spellMiss&&via!=='dk'&&isFastAnswer(ms);
    var late=0;
    if(r&&r.due){ late=Math.round((new Date(today())-new Date(r.due))/86400000); if(!(late>=0)) late=0; }
    logPush([ Date.now(), today(), k, state.grade, MODE_N[qMode]===undefined?0:MODE_N[qMode], ok?1:0,
      ms, r?1:0,
      r?(r.lv||0):-1, r?(r.ivl||0):-1, late, spellMiss||0, via==='dk'?1:0,
      displayStreak(), todayCount(), fast?1:0 ]);
    onAnswer(en,ok,fast);
  }
  // 分析まとめ（アプリの中で ざっと 見るよう）
  function logSummary(){
    var rows=logAll();
    if(!rows.length) return null;
    var byMode=[[0,0],[0,0],[0,0]], byIvl={}, byLate={'0':[0,0],'1-2':[0,0],'3-6':[0,0],'7+':[0,0]},
        byHour={}, days={}, ms=[], newOk=[0,0], revOk=[0,0], dk=0;
    rows.forEach(function(r){
      var mode=r[4], ok=r[5];
      byMode[mode][0]++; byMode[mode][1]+=ok;
      var iv=r[9]; if(iv>=0){ var key=String(iv); if(!byIvl[key]) byIvl[key]=[0,0]; byIvl[key][0]++; byIvl[key][1]+=ok; }
      if(r[7]===1){ var L=r[10], b=L<=0?'0':(L<=2?'1-2':(L<=6?'3-6':'7+'));
        byLate[b][0]++; byLate[b][1]+=ok; revOk[0]++; revOk[1]+=ok; } else { newOk[0]++; newOk[1]+=ok; }
      var h=new Date(r[0]).getHours(); if(!byHour[h]) byHour[h]=[0,0]; byHour[h][0]++; byHour[h][1]+=ok;
      days[r[1]]=(days[r[1]]||0)+1;
      if(r[6]>0&&r[6]<120000) ms.push(r[6]);
      if(r[12]) dk++;
    });
    ms.sort(function(a,b){ return a-b; });
    return { rows:rows.length, days:Object.keys(days).length,
      first:rows[0][1], last:rows[rows.length-1][1],
      byMode:byMode, byIvl:byIvl, byLate:byLate, byHour:byHour,
      median:ms.length?Math.round(ms[Math.floor(ms.length/2)]/100)/10:0,
      newOk:newOk, revOk:revOk, dk:dk, perDay:Math.round(rows.length/Math.max(1,Object.keys(days).length)) };
  }
  function okPct(a){ return a[0]?Math.round(100*a[1]/a[0])+'%':'—'; }   // 正答率（既存の pct と 名前がかぶらないように）
  function renderLogStat(){
    var el=document.getElementById('logStat'); if(!el) return;
    var s=logSummary();
    if(!s){ el.innerHTML='<div style="color:var(--mut);font-weight:700;">まだ きろくが ありません。べんきょうすると たまります。</div>'; return; }
    var ivKeys=Object.keys(s.byIvl).map(Number).sort(function(a,b){ return a-b; });
    var hrs=Object.keys(s.byHour).map(Number).sort(function(a,b){ return s.byHour[b][0]-s.byHour[a][0]; }).slice(0,3);
    var row=function(l,v){ return '<div style="display:flex;justify-content:space-between;gap:8px;"><span>'+l+'</span><b>'+v+'</b></div>'; };
    el.innerHTML=
      row('きろく',s.rows+'問 ／ '+s.days+'日ぶん（1日 平均 '+s.perDay+'問）')+
      row('きかん',escJa(s.first)+' 〜 '+escJa(s.last))+
      row('新しい語の 正答率',okPct(s.newOk))+
      row('ふくしゅうの 正答率',okPct(s.revOk))+
      '<div style="height:6px;"></div>'+
      MODE_JA.map(function(m,i){ return row(m,okPct(s.byMode[i])+'（'+s.byMode[i][0]+'問）'); }).join('')+
      '<div style="height:6px;"></div>'+
      ivKeys.map(function(k){ return row('かんかく '+(k<0?'—':SRS_IVL[k]+'日')+' の正答率',okPct(s.byIvl[k])+'（'+s.byIvl[k][0]+'問）'); }).join('')+
      '<div style="height:6px;"></div>'+
      Object.keys(s.byLate).map(function(k){ return row('おくれ '+k+'日',okPct(s.byLate[k])+'（'+s.byLate[k][0]+'問）'); }).join('')+
      '<div style="height:6px;"></div>'+
      row('こたえるまで（中央値）',s.median+'びょう')+
      row('「わからない」',s.dk+'回')+
      row('よく べんきょうする 時間',hrs.map(function(h){ return h+'時('+okPct(s.byHour[h])+')'; }).join('・'));
  }
  // 表計算ソフトは = + - @ タブ 改行 ではじまる セルを 数式として 実行してしまうので
  // 先頭に ' を つけて 無害化してから 出す（CSVインジェクション対策）
  function csvCell(v){
    if(typeof v!=='string') return v;
    var s=v;
    if(/^[=+\-@\t\r]/.test(s)) s="'"+s;
    return /[",\n\r]/.test(s)?('"'+s.replace(/"/g,'""')+'"'):s;
  }
  function logCSV(){
    var rows=logAll(), out=[LOG_COLS.join(',')];
    rows.forEach(function(r){ out.push(r.map(function(v,i){
      return csvCell(i===0?new Date(v).toISOString():v); }).join(',')); });
    return '\ufeff'+out.join('\n');
  }
  function dlFile(name,text,mime){
    try{ var blob=new Blob([text],{type:mime}); var url=URL.createObjectURL(blob);
      var a=document.createElement('a'); a.href=url; a.download=name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); },1500); return true;
    }catch(e){ return false; }
  }

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
  /* ===== 間隔反復（SRS）=====
     ・Karpicke & Roediger (2008)：正解できた語も「テストし続ける」ことが定着の鍵
       （1週間後の再生率 テスト継続80% / 再学習のみ36%）→ おぼえた語も 引退させず
       間隔を のばして 出しつづける
     ・Cepeda et al. (2008)：最適な復習間隔は「おぼえていたい期間」の 10〜20%
       → 数か月〜1年 もたせる想定で 1→3→7→14→30→60日 の階段
     ・Nakata (2015) / Nakata & Webb (2016)：効くのは「間隔の量」。拡張か均等かの差は小さく、
       1回に学ぶ語数より 間隔のほうが大事 → 5問/回は そのまま、日をまたぐ間隔を入れる  */
  var SRS_IVL=[1,3,7,14,30,60];                       // レベルごとの 日数
  var SRS_MASTER_IVL=7;                               // これ以上のびたら「おぼえた」あつかい
  function dayAdd(ds,n){ var d=new Date(ds); d.setDate(d.getDate()+n); return dayStr(d); }
  function srsDue(r){ return !r || !r.due || r.due<=today(); }
  function dayGain(){                                   // きょう ふえた数（日が かわったら リセット）
    if(!state.gain||state.gain.d!==today()) state.gain={d:today(),m:0,seen:0};
    return state.gain; }
  var SRS_KNOWN_LV=3, SRS_SURE_LV=5;                   // 知っていそう→14日／たしかに知っている→60日
  function onAnswer(en,ok,fast){
    var k=(en||'').toLowerCase(); var r=state.learn[k]||{c:0,w:false,m:false,lv:0};
    var wasNew=!state.learn[k], wasM=!!r.m, g=dayGain();
    if(wasNew) g.seen++;
    if(typeof r.lv!=='number') r.lv=0;
    if(ok){
      r.c=(r.c||0)+1;
      r.fn=fast?((r.fn||0)+1):0;                        // そっこう正解が つづいた回数
      if(fast&&wasNew) r.lv=SRS_KNOWN_LV;                       // 初回から そっこう → 14日
      else if(fast&&r.fn>=2&&r.lv<=SRS_KNOWN_LV) r.lv=SRS_SURE_LV;  // 2回つづけば 60日
      else r.lv=(r.ivl>0)?Math.min(SRS_IVL.length-1,r.lv+1):0;   // はじめて／まちがえた直後は レベル0（1日後）から
      r.ivl=SRS_IVL[r.lv];
      r.due=dayAdd(today(),r.ivl);
      r.m=(r.ivl>=SRS_MASTER_IVL);
      if(!wasM&&r.m) g.m++;                              // ⭐に なった瞬間だけ 数える
    } else {
      r.c=0; r.w=true; r.m=false; r.fn=0;
      r.lv=0; r.ivl=0; r.due=today();                 // にがては すぐ また出す
    }
    state.learn[k]=r;
  }
  function isReviewWord(k){ var r=state.learn[k]; return !!(r&&!r.m); }
  function masteredCount(){ var n=0; for(var k in state.learn){ if(state.learn[k].m) n++; } return n; }
  function reviewCount(){ var n=0; for(var k in state.learn){ var r=state.learn[k]; if(!r.m) n++; } return n; }
  function dueCount(){ var n=0, ws=currentWords();     // きょう 復習の じゅんばんが きた語
    for(var i=0;i<ws.length;i++){ var r=state.learn[ws[i][0].toLowerCase()]; if(r&&srsDue(r)) n++; }
    return n; }
  function gradeProgress(){ var ws=currentWords(), m=0, rev=0;
    for(var i=0;i<ws.length;i++){ var r=state.learn[ws[i][0].toLowerCase()]; if(r){ if(r.m) m++; else rev++; } }
    return {total:ws.length, mastered:m, review:rev}; }
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
    var seenPct=gp.total?((gp.mastered+gp.review)/gp.total*100):0;
    var lb=document.getElementById('learnBar'); if(lb) lb.style.width=Math.min(100,Math.max(seenPct>0?2.5:0,seenPct))+'%';   // 1語でも 見えるように
    var mb=document.getElementById('masterBar'); if(mb){ var mp=gp.total?(gp.mastered/gp.total*100):0;
      mb.style.width=(mp>0?Math.max(2.5,mp):0)+'%'; }
    var mn=document.getElementById('masterN'); if(mn) mn.textContent=gp.mastered;
    var ln=document.getElementById('learnN'); if(ln) ln.textContent=gp.review;
    var tg=document.getElementById('todayGain'); if(tg){ var g2=dayGain();
      tg.textContent=(g2.seen||g2.m)?('きょう 🌱+'+g2.seen+(g2.m?' ⭐+'+g2.m:'')):''; tg.style.display=(g2.seen||g2.m)?'inline-block':'none'; }
    var gt=document.getElementById('gradeTotal'); if(gt) gt.textContent=gp.total;
    var rn=document.getElementById('reviewN'); if(rn) rn.textContent=dueCount();   // きょう じゅんばんが きた 復習の数
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
  document.getElementById('bPlay').onclick=function(){ if(state.lv<2){ bubble("タマゴは まだ あそべないよ"); return; } if(state.food<=0){ bubble("べんきょうして えさを あつめよう"); return; } renderGameSelect(); show('gameSelect'); };
  function consumePlay(cost){ state.food=Math.max(0,state.food-(cost||1)); state.weight=Math.max(5,state.weight-1); state.hunger=Math.max(0,state.hunger-4); state.gamesPlayed=(state.gamesPlayed||0)+1; state.lastPlay=Date.now(); state.happy=Math.min(100,state.happy+6); state.discipline=Math.min(100,state.discipline+3); save(); } // あそぶと なつく＝すなおさ+3 // あそぶと 運動：体重-2・おなか-4
  document.getElementById('backSelect').onclick=function(){ show('home'); render(); };
  var MARIO_CONT_COST=10, RETRY_COST=10;                     // 途中のステージから／やられてから 再開する ときの えさ
  function renderGameSelect(){                                // つづきから ボタンの 出しわけ
    var st=Math.floor(Number(state.marioStage)||0); if(!(st>0)) st=0;
    var el=document.getElementById('selJumpCont'), sub=document.getElementById('selContSub');
    if(!el) return;
    el.style.display=st>0?'block':'none';
    if(sub) sub.textContent='ステージ '+(st+1)+' から（えさ'+MARIO_CONT_COST+'）'+(state.food<MARIO_CONT_COST?'／えさが たりない':'');
    el.style.opacity=(state.food<MARIO_CONT_COST)?'0.5':'1';
  }
  var startPick=function(fn,cost,retry){ return function(){ cost=cost||1;
    if(state.food<cost){ bubble(cost>1?('えさが '+cost+'こ ひつよう だよ'):'えさが たりない'); return; }
    consumePlay(cost); lastGame=fn; lastCost=cost; lastRetry=retry||fn; fn(); }; };
  var lastGame=function(){ startMario(0); }, lastCost=1, lastRetry=function(){ startMario(); };
  var fromTop=function(){ startMario(0); };                 // 1面から
  var fromCont=function(){ startMario(); };                   // たどりついた ステージから
  var selK=document.getElementById('selJump'); if(selK) selK.onclick=startPick(fromTop,1,fromCont);   // やりなおしは たどりついた ステージから
  var selC=document.getElementById('selJumpCont'); if(selC) selC.onclick=startPick(fromCont,MARIO_CONT_COST,fromCont);
  var selA=document.getElementById('selMetalA'); if(selA) selA.onclick=startPick(function(){ startMetal('arcade'); });
  var selS=document.getElementById('selMetalS'); if(selS) selS.onclick=startPick(function(){ startMetal('surv'); });
  var selSn=document.getElementById('selSnake'); if(selSn) selSn.onclick=startPick(startSnake,1);
  window.__lastGame=function(){ return lastGame; };
  window.__lastCost=function(){ return lastCost; };
  window.__lastRetry=function(){ return lastRetry; };
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
    tree+='<div class="keifuHint" style="background:#eff6ff;border-color:#bfdbfe;"><div style="font-size:12px;font-weight:800;color:var(--ink);line-height:1.6;">いまの ランク：<b style="color:#2563eb;">'+TIER_LABEL[nowTier]+'</b>（もくひょうたっせい '+genMetDays()+'日／せわ・しつけミス '+careMissTotal()+'かい）<br><span style="font-size:11px;color:var(--mut);font-weight:700;">'+(isYoungFixed()?'ヤングに なったので 系統は かくてい。どの子に なるかは そだてかた しだい':'たっせい日が おおいほど 上の系統に なりやすい（でも かなり ランダム）')+'。★レアは とくべつな そだてかたで（せわ・しつけミス 3かい いじょうだと 出ない）</span></div></div>';
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
    document.getElementById('wlCount').textContent=list.length+'ご ／ おぼえた '+masteredCount()+' ／ きょうの ふくしゅう '+dueCount();
    document.getElementById('wlList').innerHTML=html;
    document.querySelectorAll('#wlGrades .gbtn').forEach(function(b){ b.classList.toggle('sel',b.dataset.g===wlGrade); });
    document.getElementById('wlWrongBtn').classList.toggle('sel',wlWrongOnly);
  }
  document.getElementById('wlGrades').onclick=function(e){ var b=e.target.closest('.gbtn'); if(!b) return; wlGrade=b.dataset.g; renderWordList(); };
  document.getElementById('wlSearch').oninput=function(){ renderWordList(); };
  document.getElementById('wlWrongBtn').onclick=function(){ wlWrongOnly=!wlWrongOnly; renderWordList(); };
  var curAdminTab='zukan';
  function setAdminTab(t){ curAdminTab=t; ['zukan','kisekae','keifu','tango','data'].forEach(function(k){ document.getElementById('tab-'+k).style.display=(k===t)?'block':'none'; }); document.querySelectorAll('#atabs .atab').forEach(function(b){ b.classList.toggle('sel',b.dataset.t===t); }); if(t==='kisekae') renderCosmetics(); if(t==='tango') renderWordList(); if(t==='data'){ renderData(); renderVoicePicker(); voicePoll(); } window.scrollTo(0,0); }
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
  function renderData(){ document.getElementById('dataStat').textContent='なまえ：'+state.name+' ／ レベル '+state.lv+' ／ おぼえた '+masteredCount()+'こ ／ 🔥'+displayStreak()+'にち'; document.getElementById('exportBox').style.display='none'; document.getElementById('btnCopy').style.display='none'; document.getElementById('importBox').value=''; document.getElementById('dataMsg').textContent=''; renderLogStat(); }
  function encodeState(){ return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); }
  document.getElementById('btnExport').onclick=function(){ var box=document.getElementById('exportBox'); box.value=encodeState(); box.style.display='block'; document.getElementById('btnCopy').style.display='block'; };
  document.getElementById('btnCopy').onclick=function(){ var box=document.getElementById('exportBox'); box.select(); var ok=function(){ document.getElementById('dataMsg').style.color='var(--g)'; document.getElementById('dataMsg').textContent='コピーしました！'; }; if(navigator.clipboard){ navigator.clipboard.writeText(box.value).then(ok,function(){ try{ document.execCommand('copy'); ok(); }catch(e){} }); } else { try{ document.execCommand('copy'); ok(); }catch(e){} } };
  // 読みこんだ データから プロトタイプを すりかえる キーを とりのぞく
  //（"__proto__" は Object.assign の [[Set]] で オブジェクトの 親を すりかえられるため）
  function sanitizeImport(v,depth){
    depth=depth||0;
    if(!v||typeof v!=='object'||depth>6) return v;
    if(Array.isArray(v)) return v.map(function(x){ return sanitizeImport(x,depth+1); });
    var clean={};
    for(var k in v){ if(!Object.prototype.hasOwnProperty.call(v,k)) continue;
      if(k==='__proto__'||k==='constructor'||k==='prototype') continue;   // ここが すりかえの 入口
      clean[k]=sanitizeImport(v[k],depth+1); }
    return clean;
  }
  document.getElementById('btnImport').onclick=function(){ var msg=document.getElementById('dataMsg'); var code=(document.getElementById('importBox').value||'').trim(); if(!code){ msg.style.color='#9b2222'; msg.textContent='コードを はりつけてね'; return; } var obj=null; try{ obj=JSON.parse(decodeURIComponent(escape(atob(code)))); }catch(e){ try{ obj=JSON.parse(code); }catch(e2){} } obj=sanitizeImport(obj); if(!obj||typeof obj!=='object'||(obj.lv===undefined&&obj.learned===undefined)){ msg.style.color='#9b2222'; msg.textContent='この コードは よみこめません'; return; } if(!confirm('いまの データを この バックアップで 上書きします。よろしいですか？')) return; state=Object.assign({},state,obj); if(!WORDBANK[state.grade]) state.grade='jun2'; save(); msg.style.color='var(--g)'; msg.textContent='ふっかつしました！'; renderData(); render(); };
  document.getElementById('btnDownload').onclick=function(){ var msg=document.getElementById('dataMsg'); try{ var blob=new Blob([JSON.stringify(state)],{type:'application/json'}); var url=URL.createObjectURL(blob); var a=document.createElement('a'); var d=new Date(), ds=d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2); a.href=url; a.download='eigopet_backup_'+ds+'.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function(){ URL.revokeObjectURL(url); },1500); msg.style.color='var(--g)'; msg.textContent='ファイルに ほぞんしました！'; }catch(e){ msg.style.color='#9b2222'; msg.textContent='ほぞん できないときは コードを つかってね'; } };
  document.getElementById('fileImport').onchange=function(e){ var f=e.target.files&&e.target.files[0]; var msg=document.getElementById('dataMsg'); if(!f) return; var r=new FileReader(); r.onload=function(){ var obj=null; try{ obj=JSON.parse(r.result); }catch(err){} obj=sanitizeImport(obj); if(!obj||typeof obj!=='object'||(obj.lv===undefined&&obj.learned===undefined)){ msg.style.color='#9b2222'; msg.textContent='この ファイルは よみこめません'; return; } if(!confirm('いまの データを この バックアップで 上書きします。よろしいですか？')) return; state=Object.assign({},state,obj); if(!WORDBANK[state.grade]) state.grade='jun2'; save(); msg.style.color='var(--g)'; msg.textContent='ふっかつしました！'; renderData(); render(); }; r.readAsText(f); e.target.value=''; };
  (function(){
    var stamp=function(){ var d=new Date(); return d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2); };
    var msg=function(t,bad){ var m=document.getElementById('logMsg'); if(!m) return; m.style.color=bad?'#9b2222':'var(--g)'; m.textContent=t; };
    var c=document.getElementById('btnLogCsv'); if(c) c.onclick=function(){
      var n=logAll().length; if(!n){ msg('まだ きろくが ありません',true); return; }
      msg(dlFile('eigopet_log_'+stamp()+'.csv',logCSV(),'text/csv;charset=utf-8')?(n+'問ぶんを ほぞんしました'):'ほぞん できませんでした',false); };
    var j=document.getElementById('btnLogJson'); if(j) j.onclick=function(){
      var rows=logAll(); if(!rows.length){ msg('まだ きろくが ありません',true); return; }
      var obj={app:'eigo-pet',rev:(typeof APP_REV!=='undefined'?APP_REV:''),exported:new Date().toISOString(),
        columns:LOG_COLS,modes:MODE_JA,srsIntervals:SRS_IVL,rows:rows};
      msg(dlFile('eigopet_log_'+stamp()+'.json',JSON.stringify(obj),'application/json')?(rows.length+'問ぶんを ほぞんしました'):'ほぞん できませんでした',false); };
    var cl=document.getElementById('btnLogClear'); if(cl) cl.onclick=function(){
      if(!confirm('がくしゅうログを ぜんぶ けします。よろしいですか？（そだてた しんちょくは けえません）')) return;
      logClear(); renderLogStat(); msg('けしました'); };
  })();
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
  function gameSetup(title,instr,btn){ show('game'); var isMa=(title==='メタルアサルト'), isSnake=(title==='スネーク'); padDown={}; padPrev={};
    padLabels(isSnake?'snake':(isMa?'ma':'mario'));
    var sce=document.getElementById('gscore'); if(sce) sce.style.display=(isMa||isSnake)?'none':'block'; document.getElementById('gover').style.display='none'; document.getElementById('gTitle').textContent=title; document.getElementById('gInstr').textContent=instr; var cv=document.getElementById('gcanvas'); var info=petInfo(); var img=info.img?getImg(info.img):null; var map=petMap(),cell=3; var pw=img?40:Math.max.apply(null,map.map(function(r){ return r.length; }))*cell, ph=img?40:map.length*cell; return { cv:cv,ctx:cv.getContext('2d'),W:cv.width,H:cv.height,map:map,cell:cell,img:img,petW:pw,petH:ph }; }
  function gpop(g,x,y,txt){ (g.pops=g.pops||[]).push({x:x,y:y,t:0,txt:txt}); }
  function drawPops(g,ctx){ if(!g.pops||!g.pops.length) return; g.pops.forEach(function(p){ p.t++; p.y-=0.6; }); g.pops=g.pops.filter(function(p){ return p.t<45; }); ctx.font='bold 11px sans-serif'; g.pops.forEach(function(p){ ctx.fillStyle='rgba(234,88,12,'+(1-p.t/45).toFixed(2)+')'; ctx.fillText(p.txt,p.x-g.cam,p.y); }); }
  function heartMark(ctx,x,y,r){ ctx.fillRect(x-r,y-r+1,r,r); ctx.fillRect(x,y-r+1,r,r); ctx.fillRect(x-r+1,y,2*r-2,r); ctx.fillRect(x-r+3,y+r-1,2*r-6,2); }
  /* ===== マリオ風 よこスクロール アクション =====
     タイル: # れんが / ? はてなブロック / o コイン / E てき / F ゴール旗 / _ 地面 / (空白)あな   */
  var TS=16; // タイルの大きさ
  // ── 初代スーパーマリオの うごきの 数値（1フレームあたり／16pxタイル基準）──
  var MV_WALK=1.5, MV_RUN=2.5;                       // 歩き・走りの さいこう速度
  var ACC_WALK=0.0369, ACC_RUN=0.0556;               // 加速（毎フレーム たす量）
  var ACC_FRIC=0.0369, ACC_SKID=0.1016;              // 減速・ブレーキ
  var MAX_FALL=4.5;                                  // 落下速度の 上限
  // ジャンプ：走行スピードで 初速と 重力の 組が かわる（おそい／ふつう／はやい）
  var JUMP_V0=[4.0,4.0,5.0];
  var GRAV=[[0.125,0.4375],[0.1171875,0.375],[0.15625,0.5625]];   // [おしている間, はなした/落下中]
  var STAGES=[
   // 12行マップ。手で設計した「パーツ」をつなげる。row11=地面／row9・row10=通路をふさぐ／row8以上=頭の上
   ["",
    "",
    "",
    "",
    "",
    "",
    "                               ooo",
    "          ?M   ?    ??   ?",
    "",
    "",
    "                                                 G    G                                  G    G              F",
    "_______________________________________________________________   ________________________________________________"],
   ["",
    "",
    "",
    "",
    "",
    "",
    "                                                                                                 ooo",
    "          ?M   ?                  ooo                   ooo       ??   ?      ooo                         ??   ?",
    "",
    "",
    "                                  K           PP        K                     K                                              F",
    "_______________________   ________________________________________________________________________________________________________"],
   ["",
    "",
    "",
    "",
    "",
    "",
    "                                 ooo                                 ooo",
    "          ?M   ?",
    "",
    "",
    "                     G    G                 PP                                 G    G                          F",
    "_____________________________________________________________________________________________   ____________________"],
   ["",
    "",
    "",
    "",
    "",
    "",
    "",
    "          ?M   ?                            oo  oo                    ooo                                               oo  oo",
    "                       XXXXX               #### ####                                                                   #### ####",
    "                      XXXXXX                                                              PP",
    "                     XXXXXXX      PP          G                       K                   PP       G    G                 G                  F",
    "___________________________________________________________   ____________________________________________________________________________________"],
   ["",
    "",
    "",
    "",
    "",
    "",
    "                                 ooo                         ooo",
    "          ?M   ?                          ??   ?                                    ooo                               ooo",
    "",
    "",
    "                     G    G                                                         K          G    G       PP        K                  F",
    "_________________________________________________________________________   __________________________________________________________________"],
   ["",
    "",
    "",
    "",
    "",
    "",
    "                                                                                             ooo",
    "          ?M   ?      ooo                                               ooo",
    "",
    "                                      G                                             PP                  PP",
    "                      K            XXXXXXXX       PP       G    G       K           PP                  PP                       F",
    "______________________________________________________________________________________________________________________________________"],
   ["",
    "",
    "",
    "",
    "",
    "",
    "                                                                                                                           ooo",
    "          ?M   ?                                      ooo                            ooo",
    "                                                                                                 XXXXX",
    "                      ##                                          PP                            XXXXXX          G",
    "                      ##        PP       G    G       K           PP                           XXXXXXX       XXXXXXXX                 PP       G    G                      F",
    "_____________________________________________________________________________________   ________________________________________________________________________________________"],
   ["",
    "",
    "",
    "",
    "",
    "",
    "",
    "          ?M   ?                            oo  oo                                                     ooo                                ooo",
    "                                           #### ####       XXXXX",
    "                                                          XXXXXX",
    "                      PP       G    G         G          XXXXXXX                 G    G                                      G    G       K                  F",
    "_______________________________________________________________________   _____________________________   _________   ____________________________________________"],
   ["",
    "",
    "",
    "",
    "",
    "                                                                       oooo                                            oooo",
    "                                                                      ######                                          ######",
    "          ?M   ?       oo                        ooo                                       oo                                                    #?#?#",
    "                      ##?##          PP                                                   ##?##",
    "                                     PP                            XXXX         XXXX                               XXXX         XXXX",
    "                     G      K        PP                            XXXX         XXXX     G      K      G    G      XXXX         XXXX                G                        F",
    "_________________________________________________   ______________________________________________________________________________________________________________________________"],
   ["",
    "",
    "",
    "",
    "                                                                                            ooooooo",
    "                                     oooo                                                 #########",
    "                                    ######                                                                                             ooo",
    "          ?M   ?",
    "                                                                                         X                                                      XXXXX          PP",
    "                                 XXXX         XXXX                                      XX                                  G                   XXXXXX         PP",
    "                     G    G      XXXX         XXXX     G    G              G    G      XXX          G                    XXXXXXXX               XXXXXXX        PP                F",
    "______________________________________________________________________________________________________________________________________________________________________________________"],
   ["",
    "",
    "",
    "",
    "                                                                                                          ooooooo",
    "                                                                                                        #########",
    "",
    "          ?M   ?      oo  oo                                          ooo",
    "                     #### ####                   XXXXX                                                 X",
    "                                                XXXXXX      PP                                        XX                          G                                  ##",
    "                        G          G    G      XXXXXXX      PP        K                  G    G      XXX          G            XXXXXXXX                                                  F",
    "_______________________________________________________________________________________________________________________________________________   _________________      _____________________"],
   ["",
    "",
    "",
    "",
    "                                                ooooooo                                                                                                                 ooooooo",
    "                         oooo                 #########                                                                oooo                                           #########",
    "                        ######                                                                                        ######",
    "          ?M   ?                                                    oo  oo                                                                                                                           oo            ooo",
    "                                             X                     #### ####                                                               PP                        X                              ##?##",
    "                     XXXX         XXXX      XX                                                                     XXXX         XXXX       PP                       XX",
    "                     XXXX         XXXX     XXX          G             G          G    G                   PP       XXXX         XXXX       PP        G  G  G       XXX          G                  G      K                          F",
    "_______________________________________________________________________________________________   _________________________________________________________________________________________________________________   ____________________"],
   ["",
    "",
    "",
    "",
    "",
    "",
    "",
    "          ?M   ?                                                                            ooo       ??   ?                      oo  oo                                   oo",
    "                                                         PP                                                                      #### ####       XXXXX                    ##?##",
    "                      PP                    G            PP                       PP                                                            XXXXXX",
    "                      PP                 XXXXXXXX        PP        G  G  G        PP        K                                       G          XXXXXXX     G  G  G       G      K              F",
    "____________________________________________________________________________________________________________________________________________________________________________________________________"],
   ["",
    "",
    "",
    "",
    "",
    "                                                                                 oooo",
    "                                                                                ######",
    "          ?M   ?      ooo                                         ooo                                                ooo                     oo           ooo       ??   ?",
    "                                   PP                                                                                                       ##?##                                                        XXXXX",
    "                                   PP                                        XXXX         XXXX          G                                                                                   G           XXXXXX",
    "                      K            PP        G    G               K          XXXX         XXXX       XXXXXXXX                  G    G      G      K       K                              XXXXXXXX      XXXXXXX                         F",
    "_____________________________________________________________________________________________________________________   _____________________________________________________________________________________________   ____________________"],
   ["",
    "",
    "",
    "",
    "",
    "",
    "",
    "          ?M   ?    ??   ?                ??   ?                                ooo          oo                                oo",
    "                                 PP                 XXXXX                                   ##?##                             ##?##          XXXXX",
    "                                 PP                 XXXXXX                                                                                  XXXXXX      ##",
    "                                 PP                 XXXXXXX      G  G  G        K          G      K                          G      K      XXXXXXX      ##       G  G  G               F",
    "___________________________________________________________________________________________________________   ____   _______________________________________________________________________"],
   ["",
    "",
    "",
    "",
    "                                                                      ooooooo",
    "                                                                    #########",
    "",
    "          ?M   ?     #?#?#                                                                                                                 oo           ooo       ??   ?",
    "                                                       XXXXX       X                                                      ###             ##?##",
    "                                                      XXXXXX      XX                         ##            PP                                                                     G",
    "                        G                G    G      XXXXXXX     XXX          G                         G  PP                            G      K       K                      XXXXXXXX      G  G  G               F",
    "___________________________________________________________________________________________      ______________________          _______________________________________________________________________________________"],
   ["",
    "",
    "",
    "",
    "",
    "                                                                                               oooo                                                                                    oooo",
    "                     ##########                                                               ######                                                                                  ######",
    "          ?M   ?                                                   #?#?#                                                               ooo                                                                                                   oo",
    "                                                                                                                                                           XX    XX                                                                         ##?##          PP",
    "                                           ##            PP                      PP        XXXX         XXXX                                              XXX    XXX               XXXX         XXXX                             PP                        PP",
    "                        G      K                      G  PP           G       G  PP        XXXX         XXXX     G    G                                  XXXX    XXXX              XXXX         XXXX     G  G  G              G  PP        G      K        PP                F",
    "_________________________________________      ________________________________________________________________________________________   _______________________   ______________________________________________________________________________________________________________"],
   ["",
    "",
    "",
    "",
    "                                                                    ooooooo",
    "                                                                  #########",
    "",
    "          ?M   ?                ??   ?                                                                       oo                              oo                                                                                                                               ooo",
    "                       XXXXX                                     X                          ###             ##?##          XX    XX         ##?##          XXXXX    XXXXX",
    "                      XXXXXX                         PP         XX                                                        XXX    XXX                      XXXXXX    XXXXXX            G                         PP                    G              ##            PP",
    "                     XXXXXXX                      G  PP        XXX          G                              G      K      XXXX    XXXX      G      K      XXXXXXX    XXXXXXX        XXXXXXXX      G  G  G        PP                 XXXXXXXX                     G  PP         K                  F",
    "_________________________________________________________________________________________          ______________________________   _______________________________________________________________________________________________________________      _____________________________________________"],
   ["",
    "",
    "",
    "",
    "                          ooooooo",
    "                        #########                                      XX                              XX                                                            XX",
    "                                                                      XXXX                            XXXX                         ##########                       XXXX",
    "          ?M   ?                                       oo            XXXXXX                          XXXXXX                                                        XXXXXX            #?#?#",
    "                       X                              ##?##         XXXXXXXX                        XXXXXXXX             PP                            XXXXX      XXXXXXXX                                          ###",
    "                      XX                                           XXXXXXXXXX                      XXXXXXXXXX            PP                           XXXXXX     XXXXXXXXXX                                                                       ##",
    "                     XXX          G                  G      K     XXXXXXXXXXXX         G    G     XXXXXXXXXXXX           PP           G      K       XXXXXXX    XXXXXXXXXXXX            G        G  G  G                           G  G  G        ##               F",
    "_________________________________________________________________________________________________________________________________________________________________________________________________________________          _____________________________________________"],
   ["",
    "",
    "",
    "",
    "",
    "                                                                                                                                                                                                                               oooo",
    "                                                                                                                                                                                                                              ######",
    "          ?M   ?    ??   ?      ooo                 ??   ?                                ooo                                                                      #?#?#        oo  oo",
    "                                                                                                          ###              XX    XX                                            #### ####",
    "                                                                 PP                                                       XXX    XXX                      PP                                                    G          XXXX         XXXX",
    "                                K           PP                G  PP        G  G  G        K                              XXXX    XXXX      G  G  G        PP          G           G          G  G  G         XXXXXXXX      XXXX         XXXX                                 F",
    "_______________________________________________________________________________________________________          ________________   _______________________________________________________________________________________________________________   ____   _____________________"],
   ["",
    "",
    "",
    "",
    "",
    "                                                   oooo",
    "                                                  ######",
    "          ?M   ?                   #?#?#                               ooo                                                        ooo",
    "                                                                                   XXXXX                                                                                    ###",
    "                                               XXXX         XXXX                  XXXXXX                             ##                                                                      PP",
    "                     G  G  G          G        XXXX         XXXX                 XXXXXXX     G    G                               K          G    G      G  G  G                          G  PP                                            G  G  G               F",
    "_______________________________________________________________________   _________________________________________      ________________________________________________          ______________________   ____   ___________________________________________________"],
   ["",
    "",
    "",
    "",
    "",
    "                         XX                                                                                                                          XX",
    "                        XXXX                                                                                                                        XXXX",
    "          ?M   ?       XXXXXX                     ooo                #?#?#                                                                         XXXXXX              oo           ooo",
    "                      XXXXXXXX                                                                                                                    XXXXXXXX            ##?##                      PP          XXXXX       XX    XX                       G",
    "                     XXXXXXXXXX                                                                                                         PP       XXXXXXXXXX                                      PP         XXXXXX      XXX    XXX        PP         XXXXXXXX",
    "                    XXXXXXXXXXXX                  K                     G        G  G  G       G  G  G                   G  G  G        PP      XXXXXXXXXXXX         G      K       K            PP        XXXXXXX     XXXX    XXXX       PP         XXXXXXXX                F",
    "_______________________________________________________________________________________________________________   _____________________________________________________________________________________________________________   ________________________________________________"],
   ["",
    "",
    "",
    "",
    "",
    "                                                                     oooo",
    "                                                                    ######",
    "          ?M   ?                                                                                         ooo                              ooo          oo           ooo                                         ??   ?                                   #?#?#",
    "                       XXXXX                                                                                                                          ##?##                                                                     G",
    "                      XXXXXX                           PP        XXXX         XXXX         ##                                                                                                                                XXXXXXXX          PP                                              PP",
    "                     XXXXXXX                        G  PP        XXXX         XXXX                                         G  G  G        K          G      K       K                      G  G  G                           XXXXXXXX       G  PP           G         PP       G  G  G      G  PP                F",
    "___________________________________   ____   ____________________________________________      __________   _____________________________________________________________________   __________________________________________________________________________________________________________________________________"]];
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
  function startMario(force){
    // まえに たどりついた ステージから 再開（force に 数字を わたすと そのステージから）
    var st0=(force!==undefined&&force!==null)?force:Math.floor(Number(state.marioStage)||0);
    if(!(st0>=0)) st0=0; if(st0>STAGES.length-1) st0=STAGES.length-1;
    var s=gameSetup('だいぼうけん',(st0>0?'ステージ '+(st0+1)+' から！ ':'')+'X/Y＝ダッシュ、A/B＝ジャンプ（ながおしで たかく）。てきは ふんで やっつけ、？ブロックの キノコで スーパーに！','ジャンプ');
    if(game) cancelAnimationFrame(game.raf);
    game={ mode:'mario',ctx:s.ctx,W:s.W,H:s.H,img:s.img,map:null,cell:s.cell,
      petW:20,petH:20,left:false,right:false,jump:false,dash:false,skid:0,
      hp:3,maxhp:3,inv:0,coinN:0,stage:st0,maxStage:STAGES.length,big:false,items:[],shells:[],flag:0,
      t:0,score:0,over:false,banner:0,bannerTxt:'',raf:0 };
    buildStage(game,st0); loopMario();
  }
  function mvSet(k,v){ var g=game; if(!g||g.over||g.mode!=='mario') return;
    if(k==='L') g.left=v; else if(k==='R') g.right=v; else if(k==='D') g.dash=v;
    else if(k==='J'){ if(v&&g.onGround&&g.t>90){ var sp=Math.abs(g.vx); g.gband=sp>=2.0?2:(sp>=1.0?1:0); g.vy=-JUMP_V0[g.gband]; g.onGround=false; if(state.sound) tone(560+Math.abs(g.vx)*40,0,0.06,'square'); } g.jump=v; }
  }
  function marioClear(){ var g=game; if(g.cleared) return; g.cleared=true; g.score+=50+g.hp*10;
    if(state.sound){ tone(660,0,0.1); tone(880,0.1,0.12); tone(1180,0.22,0.16); }
    if(g.stage>=g.maxStage-1){ setTimeout(function(){ if(game===g&&!g.over) endGame(true); },800); return; }
    g.bannerTxt='ステージ '+(g.stage+1)+' クリア！'; g.banner=110;
    setTimeout(function(){ if(game!==g||g.over) return; g.stage++; buildStage(g,g.stage);
      if(g.hp<g.maxhp) g.hp++;
      if(g.stage>(state.marioStage||0)){ state.marioStage=g.stage; save(); } },1100);
  }
  function marioHurt(g){ if(g.inv>0) return;
    if(g.big){ g.big=false; g.petH=20; g.py+=8; g.inv=90; if(state.sound) tone(300,0,0.12,'square'); return; } // スーパー→ちいさく（原作どおり1回耐える）
    g.hp--; g.inv=80; if(state.sound) tone(180,0,0.14,'square');
    if(g.hp<=0){ endGame(false); return; } g.vy=-4; }
  function goBig(g){ if(g.big) return; g.big=true; g.petH=28; g.py-=8; g.score+=20; gpop(g,g.px,g.py,'スーパー！'); if(state.sound){ tone(660,0,0.07); tone(880,0.07,0.09); } }
  function loopMario(){ var g=game; if(!g||g.over) return; g.t++; window.__mg=g;
    if(g.cleared&&g.flag<30) g.flag++;                    // はたが するする おりる
    var counting=g.t<=90;
    if(!counting&&!g.cleared){
      // よこ移動
      var dir=g.left?-1:(g.right?1:0);
      // よこの うごきは 初代スーパーマリオと おなじ「毎フレーム 一定量を たしひき」する方式（かけ算の摩擦ではない）
      var MAXV=g.dash?MV_RUN:MV_WALK;
      var ACC=(Math.abs(g.vx)>=MV_WALK||g.dash)?ACC_RUN:ACC_WALK;
      if(dir!==0){
        if(g.vx*dir<0){                                                      // ぎゃく方向＝ブレーキ（スキッド）
          g.vx+=dir*ACC_SKID; g.skid=6;
          if(g.vx*dir>0&&Math.abs(g.vx)>MV_WALK) g.vx=dir*MV_WALK;           // 向きが変わった直後は 歩き速度から
        } else g.vx+=dir*ACC;
        g.face=dir;
      } else if(g.onGround){                                                 // ボタンを はなすと 一定量ずつ 減速（空中は 慣性そのまま）
        if(g.vx>0){ g.vx-=ACC_FRIC; if(g.vx<0) g.vx=0; }
        else if(g.vx<0){ g.vx+=ACC_FRIC; if(g.vx>0) g.vx=0; }
      }
      if(g.skid>0) g.skid--;
      if(g.vx>MAXV) g.vx=MAXV; if(g.vx<-MAXV) g.vx=-MAXV;
      // 重力も原作方式：上昇ちゅうに ボタンを おしていると よわい重力、はなすか 落下中は つよい重力
      // しかも ジャンプした ときの スピードで 重力の 組が かわる（はやいほど よく とぶ）
      var gv=GRAV[g.gband||0];
      g.vy+=(g.jump&&g.vy<0)?gv[0]:gv[1]; if(g.vy>MAX_FALL) g.vy=MAX_FALL;
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
          ny=(hy+1)*TS+0.01; g.vy=0; } }
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
        e.vy=(e.vy||0)+0.5; if(e.vy>6) e.vy=6;                                   // てきにも 重力（地面に きちんと 立つ）
        var eny=e.y+e.vy; if(solidAt(g,e.x+e.w/2,eny+e.h)){ eny=Math.floor((eny+e.h)/TS)*TS-e.h-0.01; e.vy=0; e.grounded=true; } else e.grounded=false;
        e.y=eny;
        e.x+=e.vx;
        if(solidAt(g,e.x+(e.vx>0?e.w:0),e.y+e.h/2)) e.vx=-e.vx;                 // かべで はんてん
        if(e.grounded&&!solidAt(g,e.x+e.w/2,e.y+e.h+2)) e.vx=-e.vx;              // はしで はんてん（接地中のみ）
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
    var sky=['#8fd3ff','#ffd9a8','#c9b6ff','#a8e6cf','#ffc9de','#bcd4ff','#ffe9a8'][g.stage%7];
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
    if(g.skid>0&&g.onGround){ ctx.fillStyle='rgba(255,255,255,.75)'; var sx=Math.round(g.px-cam)+(g.face>0?-4:g.petW); ctx.fillRect(sx,Math.round(g.py)+g.petH-5,4,3); ctx.fillRect(sx+(g.face>0?-4:4),Math.round(g.py)+g.petH-8,3,3); }
    // HUD
    for(var i=0;i<g.maxhp;i++){ ctx.fillStyle=i<g.hp?'#ef4444':'rgba(0,0,0,.2)'; heartMark(ctx,12+i*13,14,4); }
    ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(g.W-118,7,106,12);
    ctx.fillStyle='#f6c445'; ctx.fillRect(g.W-114,10,6,6);
    ctx.fillStyle='#fff'; ctx.font='bold 10px sans-serif'; ctx.fillText('×'+g.coinN+'  ステージ '+(g.stage+1)+'/'+g.maxStage,g.W-104,17);
    drawPops(g,ctx);
    if(g.banner>0){ g.banner--; ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,g.H/2-18,g.W,36); ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.fillText(g.bannerTxt,g.W/2,g.H/2+6); ctx.textAlign='left'; }
    if(counting){ ctx.font='bold 44px sans-serif'; ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.fillText(String(3-Math.floor(g.t/31)),g.W/2,g.H/2+15); ctx.textAlign='left'; }
  }
  function endGame(won){ var g=game; g.over=true; cancelAnimationFrame(g.raf); var sc=g.score;
    if(won) state.marioStage=0;                                   // ぜんぶ クリアしたら 1面から あそべる
    var happyGain=Math.min(30,3+Math.floor(sc/8)); state.happy=Math.min(100,state.happy+happyGain); addXp(5); if(sc>(state.gameHi||0)) state.gameHi=sc; save();
    var medal=sc>=250?'🥇':sc>=150?'🥈':sc>=60?'🥉':'';
    var title=document.querySelector('#gover>div'); if(title) title.textContent=won?'ぜんステージ クリア！🎉':'ゲームオーバー';
    document.getElementById('goverScore').textContent=(medal?medal+' ':'')+'スコア '+sc+'（さいこう '+(state.gameHi||0)+'）';
    document.getElementById('goverReward').textContent='ごきげん +'+happyGain+' ／ '+(won?'ぜんぶ クリア！':'ステージ '+(g.stage+1)+' まで');
    var reached=Math.floor(Number(state.marioStage)||0);
    setRetryButtons(reached>0&&!won
      ? [{label:'ステージ '+(reached+1)+' から',cost:RETRY_COST,fn:function(){ startMario(); }},
         {label:'1面から',cost:1,fn:function(){ startMario(0); }}]
      : [{label:'1面から',cost:1,fn:function(){ startMario(0); }},null]);
    document.getElementById('gover').style.display='flex';
  }
  /* ================= メタルアサルト（METAL ASSAULT） =================
     もと: https://github.com/AndreaZero/metal-assault-game-claude-fable
     原作は 960x540。このアプリは 340x200 なので **縮尺 S=340/960** をかけて
     速度・重力・距離・当たり判定を そのまま うつしている（px/秒 → px/フレーム）。
     数値（武器レート・弾数・ダメージ、てきのHPと点数、コンボ式、ボスの段階、
     残機3、コヨーテタイム、ジャンプ先行入力 など）は 原作の値をつかう。      */
  var MA_S=340/960;                                   // 縮尺
  function mPS(v){ return v*MA_S/60; }                // px/秒   → px/フレーム
  function mPA(v){ return v*MA_S/3600; }              // px/秒^2 → px/フレーム^2
  function mL(v){ return v*MA_S; }                    // 長さ
  function mT(sec){ return sec*60; }                  // 秒 → フレーム
  var MA_GROUND=Math.round(mL(470)), MA_LEVEL_W=mL(7600);
  var MA_BOSS_X=mL(7350), MA_BOSS_TRIG=mL(6950);
  var MA_PW=Math.max(10,Math.round(mL(24))), MA_PH=Math.round(mL(54)), MA_PH_CR=Math.round(mL(36));

  var MA_WPN={                                        // rate は 原作の 秒 → フレーム
    pistol:{n:'ハンドガン',   rate:mT(0.16), auto:false, ammo:Infinity, dmg:1, spd:mPS(900), life:mT(0.9), recoil:3},
    mg    :{n:'ヘビーマシンガン',rate:mT(0.07), auto:true,  ammo:200,     dmg:1, spd:mPS(980), life:mT(0.9), recoil:2.2, jit:mPS(30)},
    spread:{n:'スプレッド',   rate:mT(0.45), auto:false, ammo:30,      dmg:2, spd:mPS(760), life:mT(0.32),recoil:6, sh:5, ang:0.16},
    rocket:{n:'ロケット',     rate:mT(0.5),  auto:false, ammo:25,      dmg:6, spd:mPS(640), life:mT(2.2), recoil:7, boom:mL(85)},
    flame :{n:'かえんしょう', rate:mT(0.055),auto:true,  ammo:90,      dmg:1, spd:mPS(430), life:mT(0.4), recoil:1.2}
  };
  var MA_WKEY={mg:'H',spread:'S',rocket:'R',flame:'F',grenades:'G'};
  var MA_PTS={soldier:100,knife:150,grenadier:150,bazooka:200,turret:300,heli:800,tank:1000,gunship:3000};
  var MA_HP ={soldier:1,knife:1,grenadier:1,bazooka:2,turret:4,heli:10,gunship:36,tank:14};
  var MA_SPAWNS=[[620,'soldier'],[780,'soldier'],[950,'pow'],[1150,'grenadier'],[1300,'soldier'],[1360,'soldier'],
    [1550,'knife'],[1700,'soldier'],[1840,'turret'],[1950,'grenadier'],[2150,'pow'],[2380,'heli'],[2480,'bazooka'],
    [2620,'soldier'],[2700,'soldier'],[2780,'soldier'],[2950,'knife'],[3010,'knife'],[3150,'grenadier'],[3380,'tank'],
    [3520,'turret'],[3650,'pow'],[3780,'bazooka'],[3850,'soldier'],[3930,'soldier'],[4150,'gunship'],[4260,'grenadier'],
    [4340,'soldier'],[4550,'knife'],[4610,'knife'],[4780,'tank'],[4880,'bazooka'],[5050,'pow'],[5180,'turret'],
    [5250,'soldier'],[5330,'soldier'],[5410,'soldier'],[5560,'heli'],[5650,'grenadier'],[5880,'tank'],[5960,'soldier'],
    [5990,'bazooka'],[6250,'pow'],[6420,'soldier'],[6500,'soldier'],[6580,'knife'],[6680,'turret'],[6720,'grenadier'],
    [6800,'grenadier'],[6860,'bazooka']];
  var MA_PLATS=[[1180,392,130],[2040,384,150],[3440,392,130],[4140,380,160],[5640,392,140],[6080,380,150]];
  var MA_PROPS=[[450,'crate'],[880,'crate'],[1340,'barrel'],[1620,'crate'],[2740,'barrel'],[2900,'crate'],
    [3000,'barrel'],[3700,'crate'],[4330,'barrel'],[4650,'crate'],[5390,'barrel'],[5820,'crate'],[6350,'crate'],
    [6470,'barrel'],[6900,'crate']];
  var MA_SLUGS=[2250,5480];
  var MA_ARENA_X=mL(350);

  function maR(a,b){ return a+Math.random()*(b-a); }
  function maPart(g,x,y,vx,vy,life,col,size,grav){ if(g.parts.length>140) return;
    g.parts.push({x:x,y:y,vx:vx,vy:vy,t:0,life:life,col:col,size:size,grav:grav||0}); }
  function maPop(g,x,y,txt,col){ g.pops.push({x:x,y:y,t:0,txt:txt,col:col||'#fff'}); }

  /* ---- 地形（原作は 平らな地面＋一方通行の足場） ---- */
  function maFloorY(g,p,prevY){                        // 足場のうち のれる面。なければ 地面
    if(p.dropT>0) return MA_GROUND;
    for(var i=0;i<g.plats.length;i++){ var pl=g.plats[i];
      if(p.x>pl.x-mL(4)&&p.x<pl.x+pl.w+mL(4)&&prevY<=pl.y+1&&p.y>=pl.y) return pl.y; }
    return MA_GROUND;
  }
  function maOnPlat(g,p){ return p.y<MA_GROUND-0.5; }

  /* ---- 生成 ---- */
  function maEnemy(g,t,x,opt){ opt=opt||{};
    var e={t:t,x:x,y:opt.y!==undefined?opt.y:MA_GROUND,vx:0,vy:0,face:-1,hp:MA_HP[t]||1,
      st:'patrol',fireT:maR(30,90),flash:0,burst:0,dead:false,spawnX:x,bobT:maR(0,6),animT:0};
    if(t==='heli'){ e.y=mL(130); e.fireT=mT(1.2); }
    else if(t==='gunship'){ e.y=-mL(60); e.fireT=mT(1.6); e.bombT=mT(3.0); e.enter=true; e.maxhp=36; }
    else if(t==='tank'){ e.fireT=mT(1.6); }
    else if(t==='bazooka') e.fireT=maR(mT(1.0),mT(1.8));
    else if(t==='turret') e.fireT=maR(mT(0.8),mT(1.4));
    g.enemies.push(e); return e;
  }
  function maEBox(e){
    if(e.t==='heli')    return {x:e.x-mL(50),y:e.y-mL(24),w:mL(100),h:mL(48)};
    if(e.t==='gunship') return {x:e.x-mL(78),y:e.y-mL(36),w:mL(156),h:mL(72)};
    if(e.t==='tank')    return {x:e.x-mL(52),y:e.y-mL(52),w:mL(104),h:mL(52)};
    return {x:e.x-mL(14),y:e.y-mL(50),w:mL(28),h:mL(50)};
  }
  function maPBox(p){ var h=p.crouch?MA_PH_CR:MA_PH; return {x:p.x-MA_PW/2,y:p.y-h,w:MA_PW,h:h}; }
  function maHit(a,b){ return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y; }
  function maProp(g,x,t){ g.props.push({x:x,y:MA_GROUND,t:t,hp:t==='barrel'?1:2,dead:false,flash:0}); }
  function maSlug(g,x){ g.slugs.push({x:x,y:MA_GROUND,vx:0,vy:0,face:1,hp:3,maxhp:3,onG:true,occ:false,hitCd:0,fireT:0,canT:0}); }
  function maPow(g,x){ g.pows.push({x:x,y:MA_GROUND,free:false,t:0}); }
  function maPick(g,x,t){ g.picks.push({x:x,y:MA_GROUND-mL(30),vy:-mPS(180),t:t,life:mT(18)}); }

  /* ---- スコアとコンボ（原作の式） ---- */
  function maScore(g,n,x,y){ g.score+=n; if(x!==undefined) maPop(g,x,y,'+'+n,'#ffd36b'); }
  function maComboKill(g,pts,x,y){
    var c=g.combo; c.n=c.t>0?c.n+1:1; c.t=mT(2.2);
    var mul=1+Math.min(2,(c.n-1)*0.15);                // 最大 x3
    maScore(g,Math.round(pts*mul/10)*10,x,y);
    if(c.n>=2) maPop(g,x,y-mL(18),'CHAIN x'+c.n,'#9ee7ff');
  }
  function maKillEnemy(g,e,dir,pts){
    if(e.dead) return; e.dead=true;
    maComboKill(g,pts||MA_PTS[e.t]||100,e.x,e.y-mL(60));
    g.kills++;
    maBlast(g,e.x,e.y-mL(20),e.t==='tank'||e.t==='heli'?mL(60):mL(24),false,false);
    if(state.sound) tone(e.t==='tank'?140:480,0,0.08,'square');
    var i=g.enemies.indexOf(e); if(i>=0) g.enemies.splice(i,1);
  }

  /* ---- ばくはつ（原作 explode の簡略版） ---- */
  function maBlast(g,x,y,r,hurtPlayer,chain){
    g.booms.push({x:x,y:y,r:r,t:0});
    g.shake=Math.max(g.shake,r*0.14); g.hitStop=Math.max(g.hitStop,2);
    for(var i=0;i<6;i++) maPart(g,x,y,maR(-3,3),maR(-3,1),maR(10,26),i%2?'#ffd36b':'#ff8a5c',maR(2,4),0.12);
    for(var j=g.enemies.length-1;j>=0;j--){ var e=g.enemies[j];
      if(Math.abs(e.x-x)<r&&Math.abs(e.y-mL(25)-y)<r+mL(10)){ e.hp-=3; e.flash=6; if(e.hp<=0) maKillEnemy(g,e,1); } }
    if(g.boss&&Math.abs(g.boss.x-x)<r+mL(80)&&g.boss.st==='fight'){ g.boss.hp-=3; g.boss.flash=6; }
    for(var k=g.props.length-1;k>=0;k--){ var pr=g.props[k];
      if(!pr.dead&&chain&&Math.abs(pr.x-x)<r) maDestroyProp(g,pr); }
    if(hurtPlayer){ var p=g.p; if(Math.abs(p.x-x)<r&&Math.abs(p.y-mL(25)-y)<r+mL(10)) maKillPlayer(g); }
    if(state.sound) tone(90,0,0.2,'square');
  }
  function maDestroyProp(g,pr){
    if(pr.dead) return; pr.dead=true;
    if(pr.t==='barrel'){ maBlast(g,pr.x,pr.y-mL(14),mL(85),true,true); return; }   // ドラム缶＝みんなに ダメージ・れんさばくはつ
    for(var i=0;i<7;i++) maPart(g,pr.x+maR(-4,4),pr.y-maR(1,8),maR(-2,2),maR(-3,-1),maR(20,40),Math.random()<0.5?'#8a6a3c':'#5e4626',maR(1,2),0.25);
    var r=Math.random();
    if(r<0.22) maPick(g,pr.x,['mg','spread','rocket','flame'][Math.floor(Math.random()*4)]);
    else if(r<0.42) maPick(g,pr.x,'grenades');
    else maScore(g,200,pr.x,pr.y-mL(30));
    if(state.sound) tone(300,0,0.06);
  }

  /* ---- プレイヤー ---- */
  function maKillPlayer(g){
    var p=g.p;
    if(p.inSlug){ var s=p.inSlug; if(s.hitCd<=0){ maDamageSlug(g,s,1); s.hitCd=mT(0.8); } return; }
    if(p.dead||p.inv>0) return;
    p.dead=true; p.deadT=0; p.vy=-mPS(560); p.vx=-p.face*mPS(120);
    g.shake=Math.max(g.shake,8); g.combo.t=0; g.combo.n=0;      // チェインは きれる
    if(state.sound) tone(200,0,0.16,'square');
  }
  function maRespawn(g){
    g.lives--;
    if(g.lives<0){ maEnd(g,false); return; }
    var p=g.p; p.dead=false; p.deadT=0; p.y=-mL(40); p.vy=0; p.vx=0; p.inv=mT(2.5);
    p.weapon='pistol'; p.ammo=Infinity; p.grenades=Math.max(p.grenades,5);
    maPop(g,p.x,p.y,'のこり '+g.lives,'#ffb3b3');
  }
  function maDamageSlug(g,s,n){
    s.hp-=n; g.shake=Math.max(g.shake,5);
    if(s.hp<=0){ maBlast(g,s.x,s.y-mL(20),mL(90),false,true);
      if(g.p.inSlug===s){ g.p.inSlug=null; g.p.mountCd=mT(0.8); g.p.y=s.y; g.p.vy=-mPS(300); g.p.inv=Math.max(g.p.inv,mT(1.2)); }
      var i=g.slugs.indexOf(s); if(i>=0) g.slugs.splice(i,1); }
  }
  function maTryKnife(g){                                        // 近きょりで じどう ナイフ（原作どおり）
    var p=g.p;
    for(var i=0;i<g.enemies.length;i++){ var e=g.enemies[i];
      if(e.dead||e.t==='heli'||e.t==='gunship'||e.t==='tank') continue;
      var dx=e.x-p.x, dy=Math.abs(e.y-p.y);
      if(dy<mL(50)&&Math.abs(dx)<mL(46)&&(dx===0||(dx>0)===(p.face>0))){
        maKillEnemy(g,e,p.face,150); p.knifeT=mT(0.18); g.hitStop=Math.max(g.hitStop,3);
        if(state.sound) tone(1200,0,0.05); return true; } }
    for(var j=0;j<g.props.length;j++){ var pr=g.props[j];
      if(pr.dead) continue; var d2=pr.x-p.x;
      if(Math.abs(p.y-pr.y)<mL(40)&&Math.abs(d2)<mL(44)&&(d2>0)===(p.face>0)){
        maDestroyProp(g,pr); p.knifeT=mT(0.18); return true; } }
    return false;
  }
  function maFire(g){
    var p=g.p, w=MA_WPN[p.weapon];
    var mx,my,dx,dy;
    if(p.aimUp&&!p.crouch){ mx=p.x+p.face*mL(4); my=p.y-MA_PH-mL(6); dx=0; dy=-1; }
    else { mx=p.x+p.face*mL(28); my=p.y-(p.crouch?mL(16):mL(28)); dx=p.face; dy=0; }
    p.recoil=w.recoil;
    if(p.weapon!=='flame'&&p.weapon!=='rocket')                  // やっきょう
      maPart(g,p.x-p.face*mL(6),my-mL(4),-p.face*maR(0.5,1.4),maR(-2.6,-1.5),mT(0.7),'#d8b84a',1.2,mPA(1100));
    for(var i=0;i<3;i++) maPart(g,mx,my,dx*maR(0.5,1.5)+maR(-.4,.4),dy*maR(0.5,1.5)+maR(-.4,.4),mT(0.08),'#ffe28a',maR(1,2),0);
    if(p.weapon==='spread'){
      for(var k=-2;k<=2;k++){ var a=k*w.ang;
        g.pb.push({x:mx,y:my,vx:(dx*Math.cos(a)-dy*Math.sin(a))*w.spd,vy:(dx*Math.sin(a)+dy*Math.cos(a))*w.spd,
          life:w.life,dmg:w.dmg,t:'spread'}); }
    } else if(p.weapon==='rocket'){
      g.pb.push({x:mx,y:my,vx:dx*w.spd,vy:dy*w.spd,life:w.life,dmg:w.dmg,t:'rocket',boom:w.boom});
    } else if(p.weapon==='flame'){
      g.pb.push({x:mx,y:my,vx:dx*w.spd+maR(-.15,.15)+p.vx*0.4,vy:dy*w.spd+maR(-.15,.15)-(dy===0?mPS(24):0),
        life:w.life,dmg:w.dmg,t:'flame',t2:0});
    } else {
      var jit=w.jit?maR(-w.jit,w.jit):0;
      g.pb.push({x:mx,y:my,vx:dx*w.spd+(dy!==0?jit:0),vy:dy*w.spd+(dx!==0?jit:0),life:w.life,dmg:w.dmg,t:p.weapon});
    }
    if(state.sound) tone(p.weapon==='rocket'?260:(p.weapon==='flame'?420:(p.weapon==='mg'?820:700)),0,0.04,'square');
    if(p.weapon!=='pistol'){ p.ammo--; if(p.ammo<=0){ p.weapon='pistol'; p.ammo=Infinity; maPop(g,p.x,p.y-mL(60),'たまぎれ','#ffb3b3'); } }
  }

  function maUpdatePlayer(g){
    var p=g.p;
    p.fireT--; p.knifeT--; p.dropT--; p.mountCd--; p.recoil=Math.max(0,p.recoil-0.75);
    if(p.inv>0) p.inv--;
    if(p.jump) p.jumpBufT=mT(0.12); else p.jumpBufT--;
    if(p.dead){ p.deadT++; p.vy+=mPA(2200); p.y+=p.vy; p.x+=p.vx;
      if(p.y>MA_GROUND){ p.y=MA_GROUND; p.vy=0; p.vx*=0.8; }
      if(p.deadT>mT(1.4)) maRespawn(g); return; }
    if(p.inSlug){ p.crouch=false; p.aimUp=p.up; return; }
    if(p.mountCd<=0){                                            // SLUGに ふれると のる
      for(var i=0;i<g.slugs.length;i++){ var s=g.slugs[i];
        if(s.hp>0&&!s.occ&&Math.abs(p.x-s.x)<mL(34)&&Math.abs(p.y-s.y)<mL(60)){
          s.occ=true; p.inSlug=s; p.crouch=false; maPop(g,p.x,p.y-mL(60),'SLUG！','#9ee7ff');
          if(state.sound) tone(520,0,0.12); return; } }
    }
    p.crouch=p.onG&&p.down;
    var mv=(p.right?1:0)-(p.left?1:0);
    if(p.crouch) mv*=0.45;
    p.vx=mv*mPS(270);
    if(mv!==0) p.face=mv>0?1:-1;
    p.aimUp=p.up;
    if(p.jumpBufT>0&&(p.onG||p.coyoteT>0)){
      if(p.crouch&&p.onG&&maOnPlat(g,p)){ p.dropT=mT(0.22); p.y+=mL(4); p.onG=false; p.vy=mPS(120); }  // 足場を すりぬけて おりる
      else { p.vy=-mPS(780); p.onG=false; if(state.sound) tone(520,0,0.05,'square'); }
      p.jumpBufT=0; p.coyoteT=0;
    }
    var wasAir=!p.onG, prevY=p.y;
    p.vy+=mPA(2200);
    p.x+=p.vx; p.y+=p.vy;
    p.x=Math.max(g.lockL+mL(14),Math.min(g.lockR-mL(14),p.x));
    p.onG=false;
    if(p.vy>=0){
      var fy=maFloorY(g,p,prevY);
      if(p.y>=fy){ p.y=fy; p.vy=0; p.onG=true; }
      if(p.y>MA_GROUND){ p.y=MA_GROUND; p.vy=0; p.onG=true; }
    }
    if(p.onG) p.coyoteT=mT(0.09); else p.coyoteT--;              // コヨーテタイム
    if(wasAir&&p.onG) for(var d=0;d<4;d++) maPart(g,p.x+maR(-4,4),p.y,maR(-1,1),maR(-1,-0.2),mT(0.3),'#b09a6a',maR(1,2),mPA(200));
    // うつ（オート武器は おしっぱ、それ以外は 押した瞬間＋長おしで ゆっくり連射）
    var w=MA_WPN[p.weapon];
    var want=w.auto?p.fire:(p.firePressed||(p.fire&&p.fireT<-mT(0.12)));
    if(want&&p.fireT<=0){ if(!maTryKnife(g)) maFire(g); p.fireT=w.rate; }
    p.firePressed=false;
    if(p.wantNade&&p.grenades>0){ p.grenades--; p.wantNade=false;
      g.nades.push({x:p.x+p.face*mL(10),y:p.y-mL(44),vx:p.face*mPS(300)+p.vx*0.35,vy:-mPS(440),t:mT(1.05)});
      if(state.sound) tone(300,0,0.07); }
    p.wantNade=false;
  }

  /* ---- SLUG ---- */
  function maUpdateSlugs(g){
    for(var i=g.slugs.length-1;i>=0;i--){ var s=g.slugs[i];
      s.hitCd--; s.fireT--; s.canT--;
      if(g.p.inSlug===s){ var p=g.p;
        var mv=(p.right?1:0)-(p.left?1:0);
        s.vx=mv*mPS(230); if(mv!==0) s.face=mv>0?1:-1;
        if(p.jumpBufT>0&&s.onG){
          if(p.down){ p.inSlug=null; s.occ=false; p.mountCd=mT(0.8); p.x=s.x; p.y=s.y; p.vy=-mPS(420); p.jumpBufT=0; maPop(g,p.x,p.y-mL(60),'おりた'); continue; }
          s.vy=-mPS(620); s.onG=false; p.jumpBufT=0;
        }
        s.vy+=mPA(2200); s.x+=s.vx; s.y+=s.vy;
        s.x=Math.max(g.lockL+mL(30),Math.min(g.lockR-mL(30),s.x));
        if(s.y>=MA_GROUND){ s.y=MA_GROUND; s.vy=0; s.onG=true; } else s.onG=false;
        p.x=s.x; p.y=s.y; p.face=s.face;
        // ほへいを ふみつぶす
        for(var j=g.enemies.length-1;j>=0;j--){ var e=g.enemies[j];
          if(e.t==='heli'||e.t==='gunship'||e.t==='tank') continue;
          if(Math.abs(e.x-s.x)<mL(46)&&Math.abs(e.y-s.y)<mL(40)) maKillEnemy(g,e,s.face); }
        if(p.fire&&s.fireT<=0){ s.fireT=mT(0.08);                 // きじゅう
          g.pb.push({x:p.up?s.x+s.face*mL(4):s.x+s.face*mL(46), y:p.up?s.y-mL(62):s.y-mL(34),
            vx:p.up?maR(-mPS(40),mPS(40)):s.face*mPS(980), vy:p.up?-mPS(980):maR(-mPS(30),mPS(30)),
            life:mT(0.9),dmg:1,t:'mg'});
          if(state.sound) tone(880,0,0.02,'square'); }
        if(p.wantNade&&s.canT<=0){ s.canT=mT(0.9); p.wantNade=false;  // しゅほう
          g.pb.push({x:s.x+s.face*mL(52),y:s.y-mL(40),vx:s.face*mPS(700),vy:0,life:mT(1.6),dmg:8,t:'rocket',boom:mL(95)});
          g.shake=Math.max(g.shake,5); if(state.sound) tone(140,0,0.16,'square'); }
      } else {
        s.vy+=mPA(2200); s.y+=s.vy; if(s.y>=MA_GROUND){ s.y=MA_GROUND; s.vy=0; s.onG=true; }
      }
    }
  }

  /* ---- てき AI（原作の役割を再現） ---- */
  function maUpdateEnemies(g){
    var p=g.p;
    for(var i=g.enemies.length-1;i>=0;i--){ var e=g.enemies[i];
      if(e.flash>0) e.flash--;
      if(e.x<g.cam-mL(400)||e.x>g.cam+g.W+mL(600)){ if(e.t!=='gunship'&&e.x<g.cam-mL(500)) g.enemies.splice(i,1); continue; }
      var dx=p.x-e.x, ad=Math.abs(dx);
      if(e.t!=='turret') e.face=dx<0?-1:1;
      e.fireT--;
      if(e.t==='soldier'){
        if(ad>mL(150)) e.x+=e.face*mPS(80); else if(ad<mL(90)) e.x-=e.face*mPS(60);
        if(e.fireT<=0&&ad<mL(420)){ e.fireT=mT(1.4);
          g.eb.push({x:e.x+e.face*mL(16),y:e.y-mL(32),vx:e.face*mPS(420),vy:0,life:mT(2),dmg:1,col:'#ff9a9a'}); }
      } else if(e.t==='knife'){
        e.x+=e.face*mPS(210);
        if(ad<mL(26)&&Math.abs(e.y-p.y)<mL(50)) maKillPlayer(g);
      } else if(e.t==='grenadier'){
        if(ad>mL(280)) e.x+=e.face*mPS(70); else if(ad<mL(160)) e.x-=e.face*mPS(70);
        if(e.fireT<=0&&ad<mL(460)){ e.fireT=mT(2.2);
          g.enades.push({x:e.x,y:e.y-mL(36),vx:e.face*mPS(230),vy:-mPS(380),t:mT(1.4)}); }
      } else if(e.t==='bazooka'){
        if(ad>mL(330)) e.x+=e.face*mPS(60);
        if(e.fireT<=0&&ad<mL(520)){ e.fireT=mT(2.4);
          g.eb.push({x:e.x+e.face*mL(20),y:e.y-mL(32),vx:e.face*mPS(300),vy:0,life:mT(3),dmg:1,boom:mL(60),col:'#ffb020'}); }
      } else if(e.t==='turret'){
        e.face=dx<0?-1:1;
        if(e.fireT<=0&&ad<mL(460)){ e.fireT=mT(1.6); e.burst=3; }
        if(e.burst>0&&e.fireT<mT(1.6)-e.burst*mT(0.12)){ e.burst--;
          g.eb.push({x:e.x+e.face*mL(18),y:e.y-mL(26),vx:e.face*mPS(430),vy:maR(-mPS(30),mPS(30)),life:mT(2),dmg:1,col:'#ff9a9a'}); }
      } else if(e.t==='heli'){
        e.bobT+=0.04; e.y=mL(130)+Math.sin(e.bobT)*mL(14);
        var wx=p.x-e.face*mL(120); e.x+=Math.max(-mPS(130),Math.min(mPS(130),(wx-e.x)*0.02));
        if(e.fireT<=0&&ad<mL(400)){ e.fireT=mT(1.4);
          g.eb.push({x:e.x,y:e.y+mL(20),vx:0,vy:mPS(360),life:mT(3),dmg:1,col:'#ff9a9a'}); }
      } else if(e.t==='gunship'){
        if(e.enter){ e.y+=mPS(120); if(e.y>=mL(110)){ e.y=mL(110); e.enter=false; } }
        else { e.bobT+=0.02; e.y=mL(110)+Math.sin(e.bobT)*mL(20);
          e.x+=Math.max(-mPS(150),Math.min(mPS(150),(p.x+Math.sin(g.t*0.012)*mL(160)-e.x)*0.03)); }
        var low=e.hp<=18;
        if(e.fireT<=0){ e.fireT=low?mT(1.0):mT(1.5);
          for(var k=-1;k<=1;k++) g.eb.push({x:e.x,y:e.y+mL(26),vx:k*mPS(120),vy:mPS(330),life:mT(3),dmg:1,col:'#ff9a9a'}); }
        e.bombT--;
        if(e.bombT<=0){ e.bombT=low?mT(2.2):mT(3.4); g.marks.push({x:p.x,t:0}); }   // ばくげき（予告つき）
      } else if(e.t==='tank'){
        if(ad>mL(300)) e.x+=e.face*mPS(46);
        if(e.fireT<=0&&ad<mL(560)){ e.fireT=mT(2.2);
          g.eb.push({x:e.x+e.face*mL(56),y:e.y-mL(40),vx:e.face*mPS(420),vy:0,life:mT(3),dmg:1,boom:mL(70),col:'#ffb020'}); }
      }
      // 体当たり
      if(!p.dead&&!p.inSlug&&maHit(maPBox(p),maEBox(e))&&e.t!=='turret') maKillPlayer(g);
    }
  }

  /* ---- ボス（HP70／60%で第2段階／35%で もうこう化） ---- */
  function maSpawnBoss(g){
    g.boss={x:g.lockR+mL(150),y:MA_GROUND,hp:70,maxhp:70,st:'enter',t:0,fireT:mT(2),mgT:mT(4),spawnT:mT(6),
      flash:0,dieT:0,phase2:false,rainT:0,mgBurst:0,mgShotT:0};
    g.bannerTxt='モーデン将軍 の ようさい！'; g.banner=110; g.shake=8;
    if(state.sound){ tone(120,0,0.3,'square'); tone(90,0.3,0.4,'square'); }
  }
  function maUpdateBoss(g){
    var b=g.boss, p=g.p; if(!b) return; b.t++; if(b.flash>0) b.flash--;
    if(b.st==='enter'){ b.x-=mPS(90); if(b.x<=MA_BOSS_X){ b.x=MA_BOSS_X; b.st='fight'; } return; }
    if(b.st==='die'){ b.dieT++;
      if(Math.random()<0.25) maBlast(g,b.x+maR(-mL(100),mL(100)),b.y-maR(0,mL(120)),maR(mL(40),mL(70)),false,false);
      if(b.dieT>mT(2.6)){ maBlast(g,b.x,b.y-mL(60),mL(140),false,false); g.boss=null; maEnd(g,true); }
      return; }
    var enraged=b.hp<b.maxhp*0.35, mul=enraged?0.62:1;
    if(!b.phase2&&b.hp<=b.maxhp*0.6){ b.phase2=true; b.rainT=mT(2.0);
      g.bannerTxt='そうこうが はがれた！'; g.banner=90; g.shake=8; }
    if(b.phase2){ b.rainT--;
      if(b.rainT<=0){ b.rainT=enraged?mT(4.6):mT(6.0);
        var n=enraged?5:4;
        for(var i=0;i<n;i++) g.marks.push({x:p.x+maR(-mL(220),mL(220)),t:0}); } }
    b.fireT--; b.mgT--; b.spawnT--;
    if(b.fireT<=0){ b.fireT=mT(2.4)*mul;                          // アークカノン
      g.enades.push({x:b.x-mL(90),y:b.y-mL(110),vx:-mPS(300),vy:-mPS(320),t:mT(1.6),boss:true}); }
    if(b.mgT<=0){ b.mgT=mT(3.2)*mul; b.mgBurst=enraged?8:5; b.mgShotT=0; }
    if(b.mgBurst>0){ b.mgShotT--;
      if(b.mgShotT<=0){ b.mgShotT=mT(0.09); b.mgBurst--;
        g.eb.push({x:b.x-mL(100),y:b.y-mL(70),vx:-mPS(520),vy:maR(-mPS(40),mPS(40)),life:mT(3),dmg:1,col:'#ff9a9a'}); } }
    if(b.spawnT<=0){ b.spawnT=mT(7.0)*mul; maEnemy(g,'soldier',b.x-mL(140)); }   // 増援
    if(!p.dead&&!p.inSlug&&maHit(maPBox(p),{x:b.x-mL(105),y:b.y-mL(130),w:mL(210),h:mL(130)})) maKillPlayer(g);
  }

  /* ---- サバイバル（アリーナ固定・ウェーブ） ---- */
  function maStartWave(g,n){
    g.wave=n; g.bannerTxt='ウェーブ '+n; g.banner=Math.round(mT(2.2));
    var q=[], inf=2+Math.min(8,Math.floor(n*1.1));
    for(var i=0;i<inf;i++){ var r=Math.random();
      if(n>=4&&r<0.18) q.push('bazooka');
      else if(n>=2&&r<0.4) q.push('knife');
      else if(n>=3&&r<0.6) q.push('grenadier');
      else q.push('soldier'); }
    if(n%5===0) q.push('gunship'); else if(n%3===0) q.push('heli');
    if(n>=4&&n%4===0) q.push('tank');
    g.waveQ=q; g.waveSpawnT=mT(1.0);
    if(n%6===0&&g.slugs.length===0) maSlug(g,g.cam+g.W/2+mL(120));
    while(g.props.length<2) maProp(g,g.cam+mL(150)+Math.random()*(g.W-mL(300)),'barrel');
  }
  function maUpdateSurvival(g){
    if(g.waveBreakT>0){ g.waveBreakT--; if(g.waveBreakT<=0) maStartWave(g,g.wave+1); return; }
    if(g.waveQ.length>0){ g.waveSpawnT--;
      if(g.waveSpawnT<=0){ var t=g.waveQ.shift(), side=Math.random()<0.5?-1:1;
        var e=maEnemy(g,t,side<0?g.cam-mL(60):g.cam+g.W+mL(60)); e.spawnX=g.cam+g.W/2; g.waveSpawnT=mT(0.7); }
    } else if(g.enemies.length===0){
      if(g.wave>0){ maScore(g,300+g.wave*100,g.p.x,g.p.y-mL(80)); }
      g.waveBreakT=mT(1.6);
    }
  }

  /* ---- 開始 ---- */
  function startMetal(mode){
    var s=gameSetup('メタルアサルト',
      (mode==='surv'?'サバイバル：ウェーブを たえぬけ！ ':'アーケード：モーデン将軍を たおせ！ ')+
      'A＝うつ（ちかくは じどうナイフ）、B＝ジャンプ、X＝ばくだん、▲うえうち／▼ふせる（▼＋Bで 足場を おりる）','ジャンプ');
    if(game) cancelAnimationFrame(game.raf);
    game={ mode:'ma', sub:mode, ctx:s.ctx, W:s.W, H:s.H, img:s.img, cell:s.cell,
      t:0, score:0, over:false, raf:0, cam:0, lockL:0, lockR:MA_LEVEL_W,
      enemies:[], pb:[], eb:[], nades:[], enades:[], booms:[], parts:[], pops:[], marks:[],
      props:[], slugs:[], pows:[], picks:[], plats:[], boss:null, spawnIdx:0,
      lives:3, kills:0, combo:{n:0,t:0}, hitStop:0, shake:0, banner:0, bannerTxt:'',
      wave:0, waveQ:[], waveSpawnT:0, waveBreakT:0,
      p:{ x:0,y:MA_GROUND,vx:0,vy:0,w:MA_PW,h:MA_PH,face:1,onG:true,crouch:false,aimUp:false,
          weapon:'pistol',ammo:Infinity,grenades:10,fireT:0,inv:mT(2),dead:false,deadT:0,
          dropT:0,knifeT:0,jumpBufT:0,coyoteT:0,recoil:0,inSlug:null,mountCd:0,
          left:false,right:false,up:false,down:false,jump:false,fire:false,firePressed:false,wantNade:false } };
    var g=game;
    for(var i=0;i<MA_PLATS.length;i++) g.plats.push({x:mL(MA_PLATS[i][0]),y:mL(MA_PLATS[i][1]),w:mL(MA_PLATS[i][2])});
    if(mode==='surv'){
      g.cam=MA_ARENA_X; g.lockL=MA_ARENA_X; g.lockR=MA_ARENA_X+g.W;
      g.p.x=MA_ARENA_X+g.W/2; g.waveBreakT=mT(1.6);
      g.plats=[{x:MA_ARENA_X+mL(120),y:mL(392),w:mL(130)},{x:MA_ARENA_X+g.W-mL(250),y:mL(384),w:mL(140)}];
      maProp(g,MA_ARENA_X+mL(170),'barrel'); maProp(g,MA_ARENA_X+g.W-mL(170),'barrel');
    } else {
      g.p.x=mL(120);
      for(var j=0;j<MA_SLUGS.length;j++) maSlug(g,mL(MA_SLUGS[j]));
      for(var k=0;k<MA_PROPS.length;k++) maProp(g,mL(MA_PROPS[k][0]),MA_PROPS[k][1]);
    }
    loopMetal();
  }

  window.MA_DBG={W:MA_WPN,HP:MA_HP,PTS:MA_PTS,trig:MA_BOSS_TRIG,destroy:maDestroyProp};   // テスト用
  function maSet(k,v){ var g=game; if(!g||g.over||g.mode!=='ma') return; var p=g.p;
    if(k==='L'){ p.left=v; if(v) p.face=-1; }
    else if(k==='R'){ p.right=v; if(v) p.face=1; }
    else if(k==='U') p.up=v;
    else if(k==='D') p.down=v;
    else if(k==='J') p.jump=v;
    else if(k==='F'){ p.fire=v; if(v) p.firePressed=true; }
    else if(k==='B'){ if(v) p.wantNade=true; }
  }
  function maExitSlug(g){ var p=g.p; if(!p.inSlug) return; var s=p.inSlug;
    p.inSlug=null; s.occ=false; p.mountCd=mT(0.8); p.y=s.y; p.vy=-mPS(420); maPop(g,p.x,p.y-mL(60),'おりた'); }

  function maEnd(g,won){
    if(g.over) return;
    g.over=true; cancelAnimationFrame(g.raf);
    if(won) g.score+=Math.max(0,g.lives)*1000;                    // のこり残機ボーナス（原作どおり）
    var sc=g.score, key=g.sub==='surv'?'maHiSurv':'maHiArcade';
    if(sc>(state[key]||0)) state[key]=sc;
    var happyGain=Math.min(30,3+Math.floor(sc/1500)); state.happy=Math.min(100,state.happy+happyGain); addXp(5); save();
    var medal=sc>=45000?'🥇':sc>=25000?'🥈':sc>=10000?'🥉':'';
    var title=document.querySelector('#gover>div'); if(title) title.textContent=won?'ミッション かんりょう！🎖':'ゲームオーバー';
    document.getElementById('goverScore').textContent=(medal?medal+' ':'')+'スコア '+sc+'（さいこう '+(state[key]||0)+'）';
    document.getElementById('goverReward').textContent='ごきげん +'+happyGain+' ／ たおした数 '+g.kills+
      (g.sub==='surv'?(' ／ ウェーブ '+g.wave):'');
    var sub=g.sub;
    setRetryButtons([{label:'もういちど',cost:1,fn:function(){ startMetal(sub); }},null]);
    document.getElementById('gover').style.display='flex';
  }

  /* ---- メインループ ---- */
  function loopMetal(){
    var g=game; if(!g||g.over||g.mode!=='ma') return; window.__mg=g;
    g.raf=requestAnimationFrame(loopMetal);
    if(g.hitStop>0){ g.hitStop--; drawMetal(g); return; }          // ヒットストップ
    g.t++;
    var p=g.p;
    if(g.combo.t>0){ g.combo.t--; if(g.combo.t<=0) g.combo.n=0; }
    if(g.shake>0) g.shake*=0.86;
    maUpdatePlayer(g); maUpdateSlugs(g);
    if(g.sub==='surv') maUpdateSurvival(g);
    else {                                                         // アーケード：ちかづくと 出てくる
      var lim=g.cam+g.W+mL(240);
      while(g.spawnIdx<MA_SPAWNS.length&&mL(MA_SPAWNS[g.spawnIdx][0])<lim){
        var sp=MA_SPAWNS[g.spawnIdx++];
        if(sp[1]==='pow') maPow(g,mL(sp[0])); else maEnemy(g,sp[1],mL(sp[0]));
      }
      if(!g.boss&&!g.bossDone&&p.x>MA_BOSS_TRIG){ g.bossDone=true; g.lockL=MA_LEVEL_W-g.W; maSpawnBoss(g); }
    }
    maUpdateEnemies(g); maUpdateBoss(g);
    // 自分の たま
    for(var i=g.pb.length-1;i>=0;i--){ var b=g.pb[i];
      b.x+=b.vx; b.y+=b.vy; b.life--; if(b.t==='flame') b.t2=(b.t2||0)+1;
      if(b.life<=0||b.y>MA_GROUND){ if(b.boom) maBlast(g,b.x,Math.min(b.y,MA_GROUND),b.boom,false,true); g.pb.splice(i,1); continue; }
      var r=b.t==='flame'?mL(6)+b.t2*mL(0.4):mL(4);
      var bb={x:b.x-r,y:b.y-r,w:r*2,h:r*2}, gone=false;
      for(var j=g.enemies.length-1;j>=0;j--){ var e=g.enemies[j];
        if(maHit(bb,maEBox(e))){ e.hp-=b.dmg; e.flash=5;
          if(b.boom) maBlast(g,b.x,b.y,b.boom,false,true);
          else maPart(g,b.x,b.y,maR(-1,1),maR(-1,1),mT(0.12),'#fff',1.5,0);
          if(e.hp<=0) maKillEnemy(g,e,b.vx>0?1:-1);
          if(b.t!=='flame'){ gone=true; } break; } }
      if(!gone&&g.boss&&g.boss.st==='fight'&&maHit(bb,{x:g.boss.x-mL(105),y:g.boss.y-mL(130),w:mL(210),h:mL(130)})){
        g.boss.hp-=b.dmg; g.boss.flash=4;
        if(b.boom) maBlast(g,b.x,b.y,b.boom,false,true);
        if(g.boss.hp<=0){ g.boss.st='die'; g.boss.dieT=0; maScore(g,5000,g.boss.x,g.boss.y-mL(120)); g.kills++; }
        if(b.t!=='flame') gone=true; }
      if(!gone) for(var k2=g.props.length-1;k2>=0;k2--){ var pr=g.props[k2];
        if(!pr.dead&&maHit(bb,{x:pr.x-mL(14),y:pr.y-mL(30),w:mL(28),h:mL(30)})){
          pr.hp-=b.dmg; if(pr.hp<=0) maDestroyProp(g,pr);
          if(b.t!=='flame') gone=true; break; } }
      if(gone) g.pb.splice(i,1);
    }
    // てきの たま
    for(var m=g.eb.length-1;m>=0;m--){ var eb=g.eb[m];
      eb.x+=eb.vx; eb.y+=eb.vy; eb.life--;
      if(eb.life<=0||eb.y>MA_GROUND){ if(eb.boom) maBlast(g,eb.x,Math.min(eb.y,MA_GROUND),eb.boom,true,true); g.eb.splice(m,1); continue; }
      if(p.inSlug){ var sl=p.inSlug;
        if(Math.abs(eb.x-p.x)<mL(50)&&Math.abs(eb.y-(p.y-mL(30)))<mL(34)){
          if(eb.boom) maBlast(g,eb.x,eb.y,eb.boom,false,true);
          else if(sl.hitCd<=0){ sl.hitCd=mT(0.8); maDamageSlug(g,sl,1); }   // 先に クールダウン（はかいで inSlug が null に なるため）
          g.eb.splice(m,1); continue; } }
      else if(!p.dead&&maHit({x:eb.x-2,y:eb.y-2,w:4,h:4},maPBox(p))){
        if(eb.boom) maBlast(g,eb.x,eb.y,eb.boom,true,true); else maKillPlayer(g);
        g.eb.splice(m,1); continue; }
    }
    // てりゅうだん（じぶん／てき）
    for(var n=g.nades.length-1;n>=0;n--){ var gr=g.nades[n];
      gr.vy+=mPA(1700); gr.x+=gr.vx; gr.y+=gr.vy; gr.t--;
      if(gr.y>=MA_GROUND){ gr.y=MA_GROUND; gr.vy*=-0.4; gr.vx*=0.6; }
      if(gr.t<=0){ maBlast(g,gr.x,gr.y-mL(8),mL(85),false,true); g.nades.splice(n,1); } }
    for(var n2=g.enades.length-1;n2>=0;n2--){ var eg=g.enades[n2];
      eg.vy+=mPA(1700); eg.x+=eg.vx; eg.y+=eg.vy; eg.t--;
      if(eg.y>=MA_GROUND){ eg.y=MA_GROUND; eg.vy*=-0.35; eg.vx*=0.6; }
      if(eg.t<=0){ maBlast(g,eg.x,eg.y-mL(8),mL(eg.boss?95:70),true,true); g.enades.splice(n2,1); } }
    // ばくげき予告
    for(var mk=g.marks.length-1;mk>=0;mk--){ var M=g.marks[mk]; M.t++;
      if(M.t>=mT(1.0)){ maBlast(g,M.x,MA_GROUND-mL(10),mL(80),true,true); g.marks.splice(mk,1); } }
    // ほりょ・ひろいもの
    for(var w2=g.pows.length-1;w2>=0;w2--){ var po=g.pows[w2]; po.t++;
      if(!po.free&&!p.dead&&Math.abs(po.x-p.x)<mL(30)&&Math.abs(po.y-p.y)<mL(60)){
        po.free=true; maScore(g,500,po.x,po.y-mL(50));
        var gift=Math.random();
        if(gift<0.5) maPick(g,po.x,['mg','spread','rocket','flame'][Math.floor(Math.random()*4)]);
        else maPick(g,po.x,'grenades');
        if(state.sound){ tone(660,0,0.07); tone(990,0.07,0.1); } }
      if(po.free&&po.t>mT(4)) g.pows.splice(w2,1); }
    for(var q=g.picks.length-1;q>=0;q--){ var it=g.picks[q];
      it.vy+=mPA(2200); it.y+=it.vy; if(it.y>=MA_GROUND-mL(16)){ it.y=MA_GROUND-mL(16); it.vy=0; }
      it.life--;
      if(!p.dead&&Math.abs(it.x-p.x)<mL(34)&&Math.abs(it.y-p.y)<mL(60)){
        if(it.t==='grenades'){ p.grenades+=5; maPop(g,p.x,p.y-mL(60),'てりゅうだん +5','#cbd5e1'); }
        else { p.weapon=it.t; p.ammo=MA_WPN[it.t].ammo; maPop(g,p.x,p.y-mL(60),MA_WPN[it.t].n,'#9ee7ff'); }
        if(state.sound) tone(980,0,0.08);
        g.picks.splice(q,1); continue; }
      if(it.life<=0) g.picks.splice(q,1); }
    // つぶ・エフェクト
    for(var f=g.parts.length-1;f>=0;f--){ var pa=g.parts[f];
      pa.vy+=pa.grav; pa.x+=pa.vx; pa.y+=pa.vy; pa.t++; if(pa.t>pa.life) g.parts.splice(f,1); }
    for(var bx=g.booms.length-1;bx>=0;bx--){ g.booms[bx].t++; if(g.booms[bx].t>14) g.booms.splice(bx,1); }
    for(var pp=g.pops.length-1;pp>=0;pp--){ g.pops[pp].t++; if(g.pops[pp].t>45) g.pops.splice(pp,1); }
    if(g.banner>0) g.banner--;
    // カメラ
    var want=Math.max(g.lockL,Math.min(g.lockR-g.W,p.x-g.W*0.38));
    g.cam+=(want-g.cam)*(g.sub==='surv'?1:0.12);
    if(g.sub==='surv') g.cam=MA_ARENA_X;
    drawMetal(g);
  }

  /* ---- 描画 ---- */
  function drawMetal(g){
    var ctx=g.ctx, W=g.W, H=g.H, p=g.p;
    var sh=g.shake>0.4?g.shake:0;
    var cam=Math.round(g.cam+(sh?maR(-sh,sh):0)), oy=sh?Math.round(maR(-sh,sh)*0.5):0;
    var sky=ctx.createLinearGradient(0,0,0,MA_GROUND); sky.addColorStop(0,'#2b3a55'); sky.addColorStop(1,'#8a6f52');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#3d4a63';
    for(var m=0;m<9;m++){ var mx=((m*140-cam*0.25)%(W+280))-90;
      ctx.beginPath(); ctx.moveTo(mx,MA_GROUND+oy); ctx.lineTo(mx+58,MA_GROUND-56+oy); ctx.lineTo(mx+116,MA_GROUND+oy); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle='#4a5568';
    for(var r2=0;r2<7;r2++){ var rx=((r2*190-cam*0.5)%(W+380))-120;
      ctx.fillRect(rx,MA_GROUND-30+oy,54,30); ctx.fillRect(rx+62,MA_GROUND-20+oy,38,20); }
    ctx.fillStyle='#7a6a44'; ctx.fillRect(0,MA_GROUND+oy,W,H-MA_GROUND);
    ctx.fillStyle='#96865a'; ctx.fillRect(0,MA_GROUND+oy,W,3);
    ctx.fillStyle='#6a5c3c';
    for(var d=0;d<14;d++){ var dx0=((d*47-cam*1)%(W+60))-30; ctx.fillRect(dx0,MA_GROUND+8+oy,7,2); ctx.fillRect(dx0+14,MA_GROUND+18+oy,5,2); }
    g.plats.forEach(function(pl){ var x=pl.x-cam; if(x<-80||x>W+80) return;
      ctx.fillStyle='#8d7f5c'; ctx.fillRect(x,pl.y+oy,pl.w,5);
      ctx.fillStyle='#5f5540'; ctx.fillRect(x+2,pl.y+5+oy,3,MA_GROUND-pl.y-5); ctx.fillRect(x+pl.w-5,pl.y+5+oy,3,MA_GROUND-pl.y-5); });
    // 木箱・ドラム缶
    g.props.forEach(function(pr){ if(pr.dead) return; var x=pr.x-cam; if(x<-30||x>W+30) return;
      if(pr.t==='barrel'){ ctx.fillStyle='#c0392b'; ctx.fillRect(x-4,pr.y-11+oy,8,11);
        ctx.fillStyle='#8c2a20'; ctx.fillRect(x-4,pr.y-8+oy,8,2); ctx.fillRect(x-4,pr.y-4+oy,8,2);
        ctx.fillStyle='#f0b429'; ctx.fillRect(x-2,pr.y-9+oy,2,2); }
      else { ctx.fillStyle='#8a6a3c'; ctx.fillRect(x-5,pr.y-10+oy,10,10);
        ctx.fillStyle='#5e4626'; ctx.fillRect(x-5,pr.y-6+oy,10,1.5); ctx.fillRect(x-1,pr.y-10+oy,1.5,10); } });
    // ほりょ
    g.pows.forEach(function(po){ var x=po.x-cam; if(x<-30||x>W+30) return;
      ctx.fillStyle=po.free?'#9ee7ff':'#e8d9b5'; ctx.fillRect(x-3,po.y-11+oy,6,11);
      ctx.fillStyle='#4a3526'; ctx.fillRect(x-2,po.y-9+oy,2,2); ctx.fillRect(x+1,po.y-9+oy,2,2);
      if(!po.free){ ctx.fillStyle='#c96a4a'; ctx.fillRect(x-4,po.y-6+oy,8,2); } });
    // ひろいもの
    g.picks.forEach(function(it){ var x=it.x-cam; if(x<-30||x>W+30) return;
      var bl=it.life<mT(3)&&Math.floor(g.t/4)%2===0; if(bl) return;
      ctx.fillStyle='#1f2937'; ctx.fillRect(x-7,it.y+oy,14,9);
      ctx.fillStyle=it.t==='grenades'?'#cbd5e1':'#f6c445'; ctx.fillRect(x-6,it.y+1+oy,12,7);
      ctx.fillStyle='#1f2937'; ctx.font='bold 7px sans-serif'; ctx.fillText(MA_WKEY[it.t]||'?',x-2,it.y+8+oy); });
    // SLUG
    g.slugs.forEach(function(s){ var x=s.x-cam; if(x<-60||x>W+60) return;
      ctx.fillStyle='#6b7f5a'; ctx.fillRect(x-16,s.y-16+oy,32,11);
      ctx.fillStyle='#4f6042'; ctx.fillRect(x-16,s.y-6+oy,32,6);
      ctx.fillStyle='#5c6b4a'; ctx.fillRect(x-6,s.y-24+oy,14,9);
      ctx.fillStyle='#3b4632';
      if(g.p.inSlug===s&&g.p.up) ctx.fillRect(x-1,s.y-36+oy,3,12); else ctx.fillRect(x+(s.face>0?8:-19),s.y-14+oy,12,3);
      for(var a=0;a<s.maxhp;a++){ ctx.fillStyle=a<s.hp?'#5cde94':'rgba(0,0,0,.35)'; ctx.fillRect(x-14+a*7,s.y-30+oy,5,3); }
      if(g.p.inSlug===s) drawPetSprite(ctx,{img:g.img,map:null,cell:g.cell,petW:11,petH:11},x-4,s.y-35+oy); });
    // てき
    g.enemies.forEach(function(e){ var x=e.x-cam; if(x<-120||x>W+120) return;
      var fl=e.flash>0&&Math.floor(g.t/2)%2===0;
      if(e.t==='gunship'){
        ctx.fillStyle=fl?'#fff':'#4a5568'; ctx.fillRect(x-27,e.y-11+oy,54,20);
        ctx.fillStyle='#2d3748'; ctx.fillRect(x-20,e.y+7+oy,40,4);
        ctx.fillStyle='#9ee7ff'; ctx.fillRect(x+12,e.y-6+oy,9,6);
        ctx.fillStyle='#cbd5e1'; ctx.fillRect(x-34,e.y-14+oy,68,2);
        ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(x-28,e.y-22+oy,56,4);
        ctx.fillStyle=e.hp>18?'#ffb020':'#ff5c5c'; ctx.fillRect(x-27,e.y-21+oy,54*Math.max(0,e.hp/36),2);
      } else if(e.t==='heli'){
        ctx.fillStyle=fl?'#fff':'#4a5568'; ctx.fillRect(x-17,e.y-7+oy,34,13);
        ctx.fillStyle='#cbd5e1'; ctx.fillRect(x-22,e.y-10+oy,44,2);
      } else if(e.t==='tank'){
        ctx.fillStyle=fl?'#fff':'#6b5f4a'; ctx.fillRect(x-18,e.y-14+oy,36,10);
        ctx.fillStyle='#544a3a'; ctx.fillRect(x-18,e.y-5+oy,36,5);
        ctx.fillStyle=fl?'#fff':'#7d6f56'; ctx.fillRect(x-8,e.y-21+oy,17,7);
        ctx.fillStyle='#3b3428'; ctx.fillRect(x+(e.face>0?8:-20),e.y-19+oy,13,3);
      } else if(e.t==='turret'){
        ctx.fillStyle=fl?'#fff':'#8d7f5c'; ctx.fillRect(x-9,e.y-11+oy,18,11);
        ctx.fillStyle='#6f6240'; ctx.fillRect(x-9,e.y-11+oy,18,3);
        ctx.fillStyle='#3b3428'; ctx.fillRect(x+(e.face>0?7:-14),e.y-8+oy,8,3);
      } else {
        var col=e.t==='bazooka'?'#8a5c9e':(e.t==='knife'?'#c96a4a':(e.t==='grenadier'?'#5c7f6b':'#7d6f56'));
        ctx.fillStyle=fl?'#fff':col; ctx.fillRect(x-5,e.y-13+oy,10,13);
        ctx.fillStyle='#e8c9a0'; ctx.fillRect(x-4,e.y-19+oy,8,6);
        ctx.fillStyle=fl?'#fff':'#3b4632'; ctx.fillRect(x-5,e.y-21+oy,10,3);
        ctx.fillStyle='#3b3428'; ctx.fillRect(x+(e.face>0?4:-11),e.y-12+oy,7,2); } });
    // ボス
    if(g.boss){ var b=g.boss, bx=b.x-cam, bf=b.flash>0&&Math.floor(g.t/2)%2===0;
      ctx.fillStyle=bf?'#fff':(b.phase2?'#4b5540':'#5c6b4a'); ctx.fillRect(bx-37,b.y-32+oy,74,32);
      ctx.fillStyle='#46543a'; ctx.fillRect(bx-33,b.y-9+oy,66,9);
      ctx.fillStyle=bf?'#fff':'#6b7f5a'; ctx.fillRect(bx-16,b.y-46+oy,32,15);
      if(!b.phase2){ ctx.fillStyle='#8a9a6b'; ctx.fillRect(bx-35,b.y-30+oy,70,5); }
      ctx.fillStyle='#3b4632'; ctx.fillRect(bx-52,b.y-40+oy,18,5); ctx.fillRect(bx-50,b.y-24+oy,14,4);
      for(var w3=0;w3<5;w3++){ ctx.fillStyle='#2f3a28'; ctx.fillRect(bx-32+w3*14,b.y-8+oy,10,8); }
      ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(bx-38,b.y-56+oy,76,6);
      var rr=Math.max(0,b.hp/b.maxhp);
      ctx.fillStyle=rr>0.6?'#5cde94':(rr>0.35?'#ffb020':'#ff5c5c'); ctx.fillRect(bx-37,b.y-55+oy,74*rr,4); }
    // 予告マーカー
    g.marks.forEach(function(M){ var x=M.x-cam; if(x<-20||x>W+20) return;
      var bl=Math.floor(M.t/5)%2===0;
      ctx.strokeStyle=bl?'#ff5c5c':'#ffb020'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(x,MA_GROUND-3+oy,7+Math.sin(M.t*0.25)*2,0,7); ctx.stroke();
      ctx.fillStyle='#ff5c5c'; ctx.fillRect(x-1,MA_GROUND-24+oy,2,9); });
    // たま
    g.pb.forEach(function(b){ var x=b.x-cam; if(x<-20||x>W+20) return;
      if(b.t==='flame'){ ctx.globalAlpha=Math.max(0.15,b.life/mT(0.4)); ctx.fillStyle='#ffb020';
        var r=mL(6)+b.t2*mL(0.4); ctx.fillRect(x-r,b.y-r+oy,r*2,r*2); ctx.globalAlpha=1; }
      else if(b.t==='rocket'){ ctx.fillStyle='#ff8a5c'; ctx.fillRect(x-3,b.y-1.5+oy,7,3); }
      else { ctx.fillStyle=b.t==='spread'?'#ffb3d9':'#ffe066'; ctx.fillRect(x-2,b.y-1+oy,5,2); } });
    g.eb.forEach(function(eb){ var x=eb.x-cam; if(x<-20||x>W+20) return;
      ctx.fillStyle=eb.col; ctx.fillRect(x-2,eb.y-1+oy,4,2); });
    g.nades.concat(g.enades).forEach(function(gr){ var x=gr.x-cam; if(x<-20||x>W+20) return;
      ctx.fillStyle='#cbd5e1'; ctx.fillRect(x-2,gr.y-2+oy,4,4); });
    // プレイヤー
    if(!p.inSlug&&!(p.inv>0&&Math.floor(g.t/4)%2===0)){
      var px=Math.round(p.x-cam-MA_PW/2-p.face*p.recoil*0.3), ph=p.crouch?MA_PH_CR:MA_PH;
      if(p.dead){ ctx.globalAlpha=Math.max(0,1-p.deadT/mT(1.6)); }
      drawPetSprite(ctx,{img:g.img,map:null,cell:g.cell,petW:MA_PW,petH:ph},px,p.y-ph+oy);
      ctx.globalAlpha=1;
      if(!p.dead){ ctx.fillStyle='#3b3428';
        if(p.aimUp&&!p.crouch) ctx.fillRect(px+MA_PW/2-1,p.y-ph-7+oy,2,8);
        else ctx.fillRect(px+(p.face>0?MA_PW-1:-7),p.y-(p.crouch?mL(16):mL(28))+oy,8,2); }
      if(p.knifeT>0){ ctx.fillStyle='#fff'; ctx.fillRect(px+(p.face>0?MA_PW:-mL(20)),p.y-mL(30)+oy,mL(20),2); }
    }
    g.parts.forEach(function(pa){ var x=pa.x-cam; if(x<-10||x>W+10) return;
      ctx.globalAlpha=Math.max(0,1-pa.t/pa.life); ctx.fillStyle=pa.col;
      ctx.fillRect(x,pa.y+oy,pa.size,pa.size); ctx.globalAlpha=1; });
    g.booms.forEach(function(bo){ var x=bo.x-cam;
      ctx.globalAlpha=Math.max(0,1-bo.t/14); ctx.fillStyle=bo.t<5?'#fff3c4':'#ff8a5c';
      ctx.beginPath(); ctx.arc(x,bo.y+oy,bo.r*(0.4+bo.t/14),0,7); ctx.fill(); ctx.globalAlpha=1; });
    g.pops.forEach(function(po){ var x=po.x-cam; ctx.fillStyle=po.col; ctx.font='bold 9px sans-serif';
      ctx.globalAlpha=Math.max(0,1-po.t/45); ctx.fillText(po.txt,x-8,po.y-po.t*0.35+oy); ctx.globalAlpha=1; });
    // HUD
    for(var lv=0;lv<Math.max(0,g.lives);lv++){ ctx.fillStyle='#ef4444'; heartMark(ctx,12+lv*13,14,4); }
    ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(W-128,6,116,38);
    ctx.fillStyle='#ffd36b'; ctx.font='bold 12px sans-serif'; ctx.fillText('SCORE '+g.score,W-123,18);
    ctx.fillStyle='#fff'; ctx.font='bold 9px sans-serif';
    var wn=p.inSlug?'SLUG きじゅう':MA_WPN[p.weapon].n;
    ctx.fillText(wn+(p.inSlug?'':(p.ammo===Infinity?' ∞':' '+p.ammo)),W-123,29);
    ctx.fillText('G'+p.grenades+'   '+(g.sub==='surv'?('ウェーブ '+g.wave):('のこり '+Math.max(0,Math.round((MA_LEVEL_W-p.x)/mL(100)))+'m')),W-123,40);
    if(g.combo.n>=2){ ctx.fillStyle='#9ee7ff'; ctx.font='bold 12px sans-serif';
      ctx.fillText('CHAIN x'+g.combo.n+' (x'+(1+Math.min(2,(g.combo.n-1)*0.15)).toFixed(2)+')',12,34); }
    if(g.banner>0){ ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(0,H/2-16,W,32);
      ctx.fillStyle='#ffd36b'; ctx.font='bold 15px sans-serif';
      ctx.fillText(g.bannerTxt,W/2-ctx.measureText(g.bannerTxt).width/2,H/2+5); }
  }

  /* ================= スネーク（へびさん） =================
     ・十字キーで むきを かえる（うしろには もどれない）
     ・りんごを たべると 1つ ながくなって はやくなる
     ・かべ か じぶんの からだに ぶつかると おわり
     ・A ボタン おしっぱなしで ダッシュ（あぶないけど 点が2ばい）
     ・たまに 光る りんご（じかんせいげんつき・高得点）                       */
  var SNK_C=10, SNK_COLS=34, SNK_ROWS=17, SNK_OY=26;      // ますの大きさ／よこ・たての数／うえのHUDぶん
  var SNK_BASE=5.5, SNK_MAX=13;                           // 1びょうあたりの すすむ数
  function snkFree(g){                                    // へびが いない ますを ひとつ
    var open=[];
    for(var y=0;y<SNK_ROWS;y++) for(var x=0;x<SNK_COLS;x++){
      var hit=false;
      for(var i=0;i<g.body.length;i++) if(g.body[i].x===x&&g.body[i].y===y){ hit=true; break; }
      if(!hit&&!(g.gold&&g.gold.x===x&&g.gold.y===y)&&!(g.apple&&g.apple.x===x&&g.apple.y===y)) open.push({x:x,y:y});
    }
    return open.length?open[Math.floor(Math.random()*open.length)]:null;
  }
  function startSnake(){
    var s=gameSetup('スネーク','十字キーで むきを かえる。りんごを たべて のばそう！ Aボタンで ダッシュ（点が2ばい）','ジャンプ');
    if(game) cancelAnimationFrame(game.raf);
    var mid=Math.floor(SNK_ROWS/2);
    game={ mode:'snake', ctx:s.ctx, W:s.W, H:s.H, img:s.img, cell:s.cell,
      body:[{x:6,y:mid},{x:5,y:mid},{x:4,y:mid}], dir:{x:1,y:0}, next:{x:1,y:0}, queue:[],
      apple:null, gold:null, goldT:0, grow:0, score:0, eaten:0, dash:false,
      acc:0, t:0, over:false, raf:0, flash:0, pops:[], banner:0, bannerTxt:'' };
    game.apple=snkFree(game);
    loopSnake();
  }
  function snkSet(k){                                     // むきの へんこう（うしろは むけない・1つだけ 先よみ）
    var g=game; if(!g||g.over||g.mode!=='snake') return;
    var d=k==='U'?{x:0,y:-1}:k==='D'?{x:0,y:1}:k==='L'?{x:-1,y:0}:k==='R'?{x:1,y:0}:null;
    if(!d) return;
    var base=g.queue.length?g.queue[g.queue.length-1]:g.dir;
    if(d.x===-base.x&&d.y===-base.y) return;              // 逆もどりは むし
    if(d.x===base.x&&d.y===base.y) return;
    if(g.queue.length<2) g.queue.push(d);
  }
  function snkPop(g,x,y,txt,col){ g.pops.push({x:x,y:y,t:0,txt:txt,col:col||'#fff'}); }
  function snkEnd(g){
    if(g.over) return;
    g.over=true; cancelAnimationFrame(g.raf);
    var sc=g.score;
    if(sc>(state.snakeHi||0)) state.snakeHi=sc;
    var happyGain=Math.min(30,3+Math.floor(sc/25)); state.happy=Math.min(100,state.happy+happyGain); addXp(5); save();
    var medal=sc>=600?'🥇':sc>=300?'🥈':sc>=120?'🥉':'';
    var title=document.querySelector('#gover>div'); if(title) title.textContent='ゲームオーバー';
    document.getElementById('goverScore').textContent=(medal?medal+' ':'')+'スコア '+sc+'（さいこう '+(state.snakeHi||0)+'）';
    document.getElementById('goverReward').textContent='ごきげん +'+happyGain+' ／ たべた りんご '+g.eaten+'こ ／ ながさ '+g.body.length;
    setRetryButtons([{label:'もういちど',cost:1,fn:startSnake},null]);
    document.getElementById('gover').style.display='flex';
  }
  function loopSnake(){
    var g=game; if(!g||g.over||g.mode!=='snake') return;
    window.__snk=g; g.raf=requestAnimationFrame(loopSnake); g.t++;
    if(g.flash>0) g.flash--;
    if(g.banner>0) g.banner--;
    for(var p=g.pops.length-1;p>=0;p--){ g.pops[p].t++; if(g.pops[p].t>35) g.pops.splice(p,1); }
    if(g.goldT>0){ g.goldT--; if(g.goldT<=0) g.gold=null; }
    // すすむ はやさ（たべるほど はやい・ダッシュで さらに）
    var spd=Math.min(SNK_MAX, SNK_BASE+g.eaten*0.28)*(g.dash?1.8:1);
    g.acc+=spd/60;
    while(g.acc>=1){
      g.acc-=1;
      if(g.queue.length) g.dir=g.queue.shift();
      var h=g.body[0], nx=h.x+g.dir.x, ny=h.y+g.dir.y;
      if(nx<0||ny<0||nx>=SNK_COLS||ny>=SNK_ROWS){ if(state.sound) tone(160,0,0.25,'square'); drawSnake(g); snkEnd(g); return; }
      for(var i=0;i<g.body.length-1;i++){                 // しっぽの先は この手で ぬけるので のぞく
        if(g.body[i].x===nx&&g.body[i].y===ny){ if(state.sound) tone(160,0,0.25,'square'); drawSnake(g); snkEnd(g); return; } }
      g.body.unshift({x:nx,y:ny});
      var got=false;
      if(g.apple&&g.apple.x===nx&&g.apple.y===ny){
        g.eaten++; g.grow+=1; got=true;
        var add=10*(g.dash?2:1); g.score+=add; snkPop(g,nx,ny,'+'+add,'#ffd36b');
        g.apple=snkFree(g); g.flash=4;
        if(state.sound){ tone(880,0,0.05); tone(1180,0.05,0.06); }
        if(g.eaten%5===0&&!g.gold){ g.gold=snkFree(g); g.goldT=60*7; }   // 5こごとに 光るりんご
      }
      if(g.gold&&g.gold.x===nx&&g.gold.y===ny){
        g.eaten++; g.grow+=2; got=true;
        var add2=50*(g.dash?2:1); g.score+=add2; snkPop(g,nx,ny,'+'+add2,'#ffe066');
        g.gold=null; g.goldT=0; g.flash=8; g.bannerTxt='ボーナス！'; g.banner=50;
        if(state.sound){ tone(660,0,0.06); tone(990,0.06,0.06); tone(1320,0.12,0.1); }
      }
      if(g.grow>0&&got) g.grow--; else g.body.pop();
    }
    drawSnake(g);
  }
  function drawSnake(g){
    var ctx=g.ctx, W=g.W, H=g.H;
    ctx.fillStyle=g.flash>0?'#22303f':'#1b2733'; ctx.fillRect(0,0,W,H);
    // ますめ
    ctx.strokeStyle='rgba(255,255,255,.05)'; ctx.lineWidth=1;
    for(var x=0;x<=SNK_COLS;x++){ ctx.beginPath(); ctx.moveTo(x*SNK_C+0.5,SNK_OY); ctx.lineTo(x*SNK_C+0.5,SNK_OY+SNK_ROWS*SNK_C); ctx.stroke(); }
    for(var y=0;y<=SNK_ROWS;y++){ ctx.beginPath(); ctx.moveTo(0,SNK_OY+y*SNK_C+0.5); ctx.lineTo(SNK_COLS*SNK_C,SNK_OY+y*SNK_C+0.5); ctx.stroke(); }
    // かべ
    ctx.strokeStyle='#5cde94'; ctx.lineWidth=2;
    ctx.strokeRect(1,SNK_OY+1,SNK_COLS*SNK_C-2,SNK_ROWS*SNK_C-2);
    var px=function(c){ return c*SNK_C; }, py=function(c){ return SNK_OY+c*SNK_C; };
    // りんご
    if(g.apple){ ctx.fillStyle='#ef5b5b'; ctx.fillRect(px(g.apple.x)+2,py(g.apple.y)+2,SNK_C-4,SNK_C-4);
      ctx.fillStyle='#7ee0a0'; ctx.fillRect(px(g.apple.x)+SNK_C/2-1,py(g.apple.y)+1,2,2); }
    if(g.gold){ var bl=Math.floor(g.t/6)%2===0, left=Math.ceil(g.goldT/60);
      ctx.fillStyle=bl?'#ffe066':'#f6c445'; ctx.fillRect(px(g.gold.x)+1,py(g.gold.y)+1,SNK_C-2,SNK_C-2);
      ctx.fillStyle='#8a6a10'; ctx.font='bold 7px sans-serif'; ctx.fillText(String(left),px(g.gold.x)+3,py(g.gold.y)+SNK_C-2); }
    // からだ（しっぽに いくほど うすく）
    for(var i=g.body.length-1;i>=1;i--){ var b=g.body[i], t=1-(i/g.body.length)*0.55;
      ctx.fillStyle='rgba(92,222,148,'+t.toFixed(2)+')';
      ctx.fillRect(px(b.x)+1,py(b.y)+1,SNK_C-2,SNK_C-2); }
    // あたま＝そだてている キャラ
    var hd=g.body[0];
    drawPetSprite(ctx,{img:g.img,map:null,cell:g.cell,petW:SNK_C+2,petH:SNK_C+2},px(hd.x)-1,py(hd.y)-1);
    // HUD
    ctx.fillStyle='#fff'; ctx.font='bold 12px sans-serif';
    ctx.fillText('SCORE '+g.score,8,17);
    ctx.font='bold 10px sans-serif'; ctx.fillStyle='#9ee7ff';
    ctx.fillText('ながさ '+g.body.length+'   りんご '+g.eaten+(g.dash?'   ダッシュ！':''),110,17);
    ctx.fillStyle='#ffd36b'; ctx.font='bold 10px sans-serif';
    var hi='さいこう '+(state.snakeHi||0); ctx.fillText(hi,W-ctx.measureText(hi).width-8,17);
    g.pops.forEach(function(po){ ctx.globalAlpha=Math.max(0,1-po.t/35); ctx.fillStyle=po.col; ctx.font='bold 10px sans-serif';
      ctx.fillText(po.txt,px(po.x)-4,py(po.y)-po.t*0.3); ctx.globalAlpha=1; });
    if(g.banner>0){ ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,H/2-14,W,28);
      ctx.fillStyle='#ffe066'; ctx.font='bold 15px sans-serif';
      ctx.fillText(g.bannerTxt,W/2-ctx.measureText(g.bannerTxt).width/2,H/2+5); }
  }

  var padDown={};                                          // いま おされている パッドのキー
  function padSet(k,v){ if(!!padDown[k]===!!v) return; padDown[k]=v; padApply(); }
  function padClear(){ padDown={}; padApply(); }
  var padPrev={};
  function padApply(){                                     // おされている キーの 組み合わせから ゲームの入力を つくる
    var g=game; if(!g) return;
    var want;
    if(g.mode==='snake'){                                  // スネークは 十字キーで むきを かえるだけ
      ['U','D','L','R'].forEach(function(k){ if(padDown[k]&&!padPrev['s'+k]) snkSet(k); padPrev['s'+k]=!!padDown[k]; });
      g.dash=!!(padDown.A||padDown.B||padDown.X||padDown.Y);
      return;
    }
    if(g.mode==='ma'){
      want={ U:!!padDown.U, D:!!padDown.D, L:!!padDown.L, R:!!padDown.R,
             F:!!padDown.A, J:!!padDown.B, B:!!padDown.X, Y:!!padDown.Y };
    } else {
      want={ L:!!padDown.L, R:!!padDown.R,
             J:!!(padDown.A||padDown.B), D:!!(padDown.X||padDown.Y) };   // A・B＝ジャンプ／X・Y＝ダッシュ
    }
    for(var k in want){
      if(padPrev[k]===want[k]) continue;                   // かわった ものだけ ゲームに つたえる
      padPrev[k]=want[k];
      if(g.mode==='ma'){
        if(k==='Y'){ if(want[k]&&g.p&&g.p.inSlug) maExitSlug(g); }
        else maSet(k,want[k]);
      } else mvSet(k,want[k]);
    }
  }
  var PAD_LABEL={
    mario:{A:'ジャンプ',B:'ジャンプ',X:'ダッシュ',Y:'ダッシュ'},
    ma   :{A:'うつ',    B:'ジャンプ',X:'ばくだん',Y:'おりる'},
    snake:{A:'ダッシュ',B:'ダッシュ',X:'ダッシュ',Y:'ダッシュ'}
  };
  function padLabels(kind){ var L=PAD_LABEL[kind]||PAD_LABEL.mario;
    ['A','B','X','Y'].forEach(function(k){ var el=document.getElementById('lbl'+k); if(el) el.textContent=L[k]; }); }

  /* やりなおしボタン：死んだ場所から つづける＝えさ10／さいしょから＝えさ1 */
  function setRetryButtons(list){
    var ids=['gRetry','gRetry2'];
    for(var i=0;i<ids.length;i++){
      var el=document.getElementById(ids[i]), o=list[i];
      if(!el) continue;
      if(!o){ el.style.display='none'; continue; }
      el.style.display='inline-block';
      el.textContent=o.label+'（えさ'+o.cost+'）';
      el.style.opacity=(state.food<o.cost)?'0.5':'1';
      (function(o){ el.onclick=function(){
        if(state.food<o.cost){ leaveGame(); bubble('えさが '+o.cost+'こ ひつよう だよ。べんきょうで あつめよう'); return; }
        consumePlay(o.cost); o.fn(); }; })(o);
    }
  }

  function leaveGame(){ if(game){ game.over=true; cancelAnimationFrame(game.raf); } show('home'); render(); }
  (function(){
    var padOwner={};                                          // ゆび(pointerId) ごとの 持ち主ボタン
    [['padU','U'],['padD','D'],['padL','L'],['padR','R'],
     ['btnA','A'],['btnB','B'],['btnX','X'],['btnY','Y']].forEach(function(pr){
      var el=document.getElementById(pr[0]); if(!el) return;
      el.addEventListener('pointerdown',function(e){ e.preventDefault();
        try{ el.setPointerCapture&&el.setPointerCapture(e.pointerId); }catch(_){}   // 指が ボタンから ずれても はなすまで きく
        padOwner[e.pointerId]=pr[1]; padSet(pr[1],true); });
      ['pointerup','pointercancel'].forEach(function(ev){ el.addEventListener(ev,function(e){
        delete padOwner[e.pointerId]; padSet(pr[1],false); }); }); });
    // 画面のどこで はなしても、その ゆびが おしていた キーだけを はなす（ほかの ボタンは そのまま）
    ['pointerup','pointercancel'].forEach(function(ev){ window.addEventListener(ev,function(e){
      var k=padOwner[e.pointerId]; if(!k) return; delete padOwner[e.pointerId]; padSet(k,false); }); });
    window.addEventListener('blur',padClear);                 // アプリが うらに いったら 全部 はなす
    // キーボードでも あそべる（矢印＋Z/X/A/S）
    var KMAP={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'U',ArrowDown:'D',KeyZ:'B',KeyX:'A',KeyA:'Y',KeyS:'X',Space:'B'};
    ['keydown','keyup'].forEach(function(ev){ document.addEventListener(ev,function(e){
      if(!game||game.over) return; var k=KMAP[e.code]; if(!k) return; e.preventDefault(); padSet(k,ev==='keydown'); }); });
    document.getElementById('gHome').onclick=leaveGame; document.getElementById('backGame').onclick=leaveGame; })();

  /* ---- study ---- */
  var session, qIdx, qList;
  var MAIN_TABS=['home','learn','okane','printsheet','admin'];
  /* ===== プリント：きゅうを えらんで たんご20こを A4に いんさつ =====
     おうちの ひとが 紙で テストする ための モード。
     ひだり＝英単語／みぎ＝いみ。「こたえを かくす」で みぎを 白くして 問題用紙に できる。 */
  var PR_N=20, prGrade='jun2', prWords=[], prHide=false;

  function prPick(g){
    var src=(WORDBANK[g]&&WORDBANK[g].words)||[];
    var pool=src.filter(function(w){ return w&&w[0]&&w[1]; });
    // フィッシャー・イェーツで シャッフルしてから 先頭N個（同じ語が 2回でない）
    var a=pool.slice();
    for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)),t=a[i]; a[i]=a[j]; a[j]=t; }
    return a.slice(0,Math.min(PR_N,a.length));
  }

  function prRender(){
    document.querySelectorAll('#prGrades .gbtn').forEach(function(b){ b.classList.toggle('sel',b.dataset.g===prGrade); });
    var hb=document.getElementById('prHide');
    if(hb){ hb.textContent=prHide?'こたえを だす':'こたえを かくす'; }
    document.body.classList.toggle('pr-hide',prHide);

    var lab=(WORDBANK[prGrade]&&WORDBANK[prGrade].label)||'';
    var d=new Date();
    var date=d.getFullYear()+'.'+(d.getMonth()+1)+'.'+d.getDate();
    var rows=prWords.map(function(w,i){
      // 品詞は もとデータに 誤りが まざるので 紙には ださない（まちがいを 刷らない）
      var ja=escJa(splitSenses(w[1]).join('，'));
      return '<tr><td class="prno">'+(i+1)+'</td>'
           +'<td class="pren">'+escJa(w[0])+'</td>'
           +'<td class="prja">'+ja+'</td></tr>';
    }).join('');
    document.getElementById('prSheet').innerHTML=
       '<div class="prhead"><div class="prtitle">たんごテスト　'+escJa(lab)+'</div>'
      +'<div class="prmeta">'+PR_N+'もん<br>'+date+'</div></div>'
      +'<div class="prfields"><span>なまえ：</span><span>てんすう：　　／'+PR_N+'</span></div>'
      +'<table class="prtbl">'+rows+'</table>'
      +'<div class="prfoot">えいごペット</div>';
  }

  function prOpen(){
    // 上級モードが OFF のときは 3級・1級を えらべないので、いまの きゅうに よせる
    if(!state.advGrades&&(prGrade==='g3'||prGrade==='g1')) prGrade='jun2';
    if(!prWords.length) prWords=prPick(prGrade);
    prRender();
  }

  (function(){
    var g=document.getElementById('prGrades'); if(!g) return;
    g.onclick=function(e){ var b=e.target.closest('.gbtn'); if(!b) return; prGrade=b.dataset.g; prWords=prPick(prGrade); prRender(); };
    document.getElementById('prShuffle').onclick=function(){ prWords=prPick(prGrade); prRender(); sfx('correct'); };
    document.getElementById('prHide').onclick=function(){ prHide=!prHide; prRender(); };
    document.getElementById('prPrint').onclick=function(){ window.print(); };
  })();

  function show(id){ document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('on'); }); document.getElementById(id).classList.add('on'); var tb=document.getElementById('tabbar'); if(MAIN_TABS.indexOf(id)>=0){ tb.classList.add('on'); document.querySelectorAll('#tabbar .tab').forEach(function(b){ b.classList.toggle('sel',b.dataset.s===id); }); } else { tb.classList.remove('on'); } window.scrollTo(0,0); }
  function gotoTab(s){ if(s==='printsheet'){ prOpen(); } if(s==='admin'){ renderAdmin(); wlGrade=state.grade; setAdminTab('zukan'); } if(s==='okane'){ renderMoney(); } if(s==='learn'){ announceBonuses(); } show(s); render(); } // 単語一覧(最大2258行)は たんごタブを開いたときだけ描画
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
  // 重みつき抽選。SRSを入れたので、いまは「まだ一度も出ていない語」の中から えらぶのに つかう
  // （復習の順番は buildQuestions が 期限順で きめる）
  function qWeight(w){ var r=state.learn[w[0].toLowerCase()];
    if(!r) return 4;              // 4) まだ一度も出てない新出：最優先グループ
    if(r.w&&!r.m) return 5;       // 1) 間違えた/未正解のにがて：最優先
    if(r.m&&r.w) return 1.5;      // 2) 間違えたが2回目で正解＝復習：中
    if(r.m&&!r.w) return 0.4;     // 3) 一発正解：低
    return 3;                     // その他
  }
  function pickWeighted(words,n){ var used={}, chosen=[], wt=words.map(qWeight); for(var s=0;s<n;s++){ var total=0,i; for(i=0;i<words.length;i++){ if(!used[i]) total+=wt[i]; } if(total<=0) break; var rnd=Math.random()*total, acc=0, idx=-1; for(i=0;i<words.length;i++){ if(used[i])continue; acc+=wt[i]; if(rnd<=acc){ idx=i; break; } } if(idx<0){ for(i=0;i<words.length;i++){ if(!used[i]){ idx=i; break; } } } if(idx<0) break; used[idx]=true; chosen.push(words[idx]); } return chosen; }
  var REVIEW_SLOTS=3;
  window.SRS_DBG={};   // テスト用（あとで 中身を いれる）                                  // 5問のうち 復習に あてる 上限
  // 期限のきた復習（ふるい順）→ のこりを 新出（重みつき抽選）で うめる。
  // 新出が つきたら 復習で うめ、それも なければ 期限前の語から えらぶ
  function buildQuestions(n){
    var ws=currentWords(), due=[], fresh=[], later=[];
    for(var i=0;i<ws.length;i++){ var r=state.learn[ws[i][0].toLowerCase()];
      if(!r) fresh.push(ws[i]);
      else if(srsDue(r)) due.push([ws[i],r.due||'']);
      else later.push([ws[i],r.due||'']); }
    due.sort(function(a,b){ return a[1]<b[1]?-1:(a[1]>b[1]?1:0); });   // 期限が ふるい順
    var out=due.slice(0,Math.min(REVIEW_SLOTS,n)).map(function(x){ return x[0]; });
    var need=n-out.length;
    if(need>0&&fresh.length) out=out.concat(pickWeighted(fresh,need));
    need=n-out.length;
    if(need>0&&due.length>out.length) out=out.concat(due.slice(REVIEW_SLOTS,REVIEW_SLOTS+need).map(function(x){ return x[0]; }));
    need=n-out.length;
    if(need>0&&later.length){ later.sort(function(a,b){ return a[1]<b[1]?-1:(a[1]>b[1]?1:0); });
      out=out.concat(later.slice(0,need).map(function(x){ return x[0]; })); }
    return shuffle(out);
  }
  window.__roll=function(){ return rollYoungTier(); };   // テスト用
  window.SRS_DBG={onAnswer:onAnswer,build:buildQuestions,due:srsDue,dueCount:dueCount,prog:gradeProgress,IVL:SRS_IVL,slots:REVIEW_SLOTS,state:function(){ return state; },
    calcFast:function(){ calcFastThreshold(); return fastTh; },th:function(){ return fastTh; },setMode:function(m){ qMode=m; },
    setFlags:function(h,a2){ qUsedHint=h; qUsedAudio=a2; }};
  function startStudy(){ reviewMode=false; requeued={}; calcFastThreshold(); qList=buildQuestions(QPER); window.__qList=qList; qIdx=0; session={correct:0,combo:0,maxCombo:0,newMastered:0,total:qList.length}; document.getElementById('qTotal').textContent=qList.length; show('study'); nextQ(); }
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
  function showEasy(w,noScroll){ if(!noScroll) qUsedHint=true;   // noScroll=まちがえた後の 自動表示なので ヒント扱いしない
    var box=document.getElementById('easyHint'); box.innerHTML='<div class="ehlabel">やさしいいみ</div><div class="ehmean">'+escJa(easyText(w))+'</div>'; box.style.display='block'; if(noScroll) return; try{ box.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){ try{ box.scrollIntoView(); }catch(_){} } }
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
    var correct=qList[qIdx]; curWord=correct; window.__curWord=correct[0]; qMissed=false; spellMiss=0; qStartAt=Date.now(); qUsedHint=false; qUsedAudio=false;
    var en=correct[0];
    qMode=pickQMode();
    if(qMode==='spell'&&!state.learn[(en||'').toLowerCase()]) qMode='meaning';   // はじめて 見る語に いきなり スペル入力は 出さない
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
    else { qMissed=true; spellMiss++; session.combo=0; recordAnswer(curWord[0],false); save(); sfx('wrong'); // まちがい＝この時点で「にがて・ふくしゅうゆき」に記録
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
    session.correct++; state.food+=gain; walletEarn(gain); state.learned++; gainGP((reviewMode?10:8)*gain); recordAnswer(en,true);
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
      session.combo=0; recordAnswer(en,false); save(); sfx('wrong'); speak(en); // 正しい はつおんを きかせる
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
  /* ===== えいごの こえ =====
     これまでは Samantha / Daniel / Karen の3つに しぼっていたが、
     iPhone・iPad には あとから ダウンロードできる「拡張(Enhanced)」音声が あり、
     そちらの ほうが ずっと 自然。端末に 入っている えいご音声を すべて出し、
     品質が よさそうな 順に ならべる。                                             */
  var VOICE_GOOD=/(enhanced|premium|neural|natural|siri)/i;              // 高品質の しるし
  // まともに 英語学習に つかえる こえ（Apple／Google／Microsoft の 標準的な よみあげ音声）
  var VOICE_NICE=['Ava','Allison','Samantha','Susan','Zoe','Evan','Nathan','Noelle','Joelle','Nicky','Aaron','Tom','Alex',
    'Serena','Daniel','Kate','Oliver','Stephanie','Malcolm','Jamie','Karen','Lee','Matilda','Moira','Tessa','Rishi','Veena','Isha',
    'Google US English','Google UK English','Aria','Jenny','Guy','Michelle','Christopher','Eric','Roger','Steffan','Ana',
    'Libby','Maisie','Ryan','Sonia','Thomas','Natasha','William'];
  // ふざけた こえ・ロボット声（学習には つかえない）
  var VOICE_BAD=/(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|organ|princess|ralph|superstar|trinoids|whisper|wobble|zarvox|fred|bruce|agnes|kathy|victoria|eloquence|reed|rocko|sandy|shelley|grandma|grandpa|flo|eddy|compact)/i;
  function allEnVoices(){ return (window.speechSynthesis?speechSynthesis.getVoices():[]).filter(function(v){ return /^en[-_]?/i.test(v.lang); }); }
  function usableVoice(v){
    var n=v.name||'';
    if(VOICE_BAD.test(n)) return false;                                  // ネタ・ロボット声は 出さない
    if(VOICE_GOOD.test(n)) return true;                                  // 拡張・プレミアム
    if(v.localService===false) return true;                              // ネットワーク音声
    return VOICE_NICE.some(function(nm){ return n.indexOf(nm)>=0; });    // 定番の こえ
  }
  function enVoices(){
    var all=allEnVoices(), good=all.filter(usableVoice);
    return good.length?good:all;                                         // ぜんぶ はじかれたら やむを得ず 全部出す
  }
  function voiceScore(v){
    var s=0, n=v.name||'';
    if(VOICE_GOOD.test(n)) s+=100;                                       // 拡張・プレミアム・ニューラル
    if(v.localService===false) s+=40;                                    // ネットワーク音声（Googleなど）は 高品質なことが多い
    var i=VOICE_NICE.findIndex(function(nm){ return n.indexOf(nm)>=0; });
    if(i>=0) s+=(VOICE_NICE.length-i);                                   // よく知られた 聞きやすい こえ
    if(/en[-_]US/i.test(v.lang)) s+=6; else if(/en[-_]GB/i.test(v.lang)) s+=4;
    return s;
  }
  function pickerVoices(){ return enVoices().slice().sort(function(a,b){ return voiceScore(b)-voiceScore(a); }); }
  function voiceLabel(v){
    var accent=/en[-_]GB/i.test(v.lang)?'イギリス':(/en[-_]AU/i.test(v.lang)?'オーストラリア':(/en[-_]IN/i.test(v.lang)?'インド':'アメリカ'));
    return v.name+'（'+accent+(VOICE_GOOD.test(v.name)?'・高品質':'')+'）';
  }
  function pickVoice(){
    var vs=enVoices(); if(!vs.length) return null;
    if(state.voiceName){ var sv=vs.find(function(v){ return v.name===state.voiceName; }); if(sv) return sv; }
    return pickerVoices()[0]||null;                                      // 何も えらんでいなければ いちばん よさそうな こえ
  }
  function ensureVoice(){ if(!enVoice) enVoice=pickVoice(); return enVoice; }
  function renderVoicePicker(){
    var sel=document.getElementById('voiceSel');
    if(sel){ var pv=pickerVoices(), cur=ensureVoice();
      if(!pv.length){ sel.innerHTML='<option>（この たんまつには えいご音声が ありません）</option>'; sel.disabled=true; }
      else { sel.disabled=false;
        sel.innerHTML=pv.map(function(v){ return '<option value="'+escJa(v.name)+'"'+(cur&&v.name===cur.name?' selected':'')+'>'+escJa(voiceLabel(v))+'</option>'; }).join(''); } }
    var rs=document.getElementById('rateSel'); if(rs){ var r=String(state.speechRate||0.8);
      Array.prototype.forEach.call(rs.options,function(o){ o.selected=(o.value===r); }); }
    var note=document.getElementById('voiceNote');
    if(note){ var pv2=pickerVoices(), best=pv2[0], hasGood=pv2.some(function(v){ return VOICE_GOOD.test(v.name); });
      note.innerHTML=hasGood
        ? '「ためす」で こえと はやさを かくにんできます。<b>（高品質）</b>と ついた こえが いちばん 自然です'
        : '「ためす」で こえと はやさを かくにんできます。<br><b style="color:#b45309;">もっと 自然な こえに できます：</b>iPhone/iPadの <b>設定 → アクセシビリティ → 読み上げコンテンツ → 声 → 英語</b> で「<b>拡張</b>」や「Premium」の こえを ダウンロードすると、ここに <b>（高品質）</b>として でてきます（むりょう）'
        + (best?'<br><span style="color:var(--mut);">いまの こえ：'+escJa(best.name)+'</span>':''); }
  }
  // iPhone は こえの 一覧が おくれて とどくことが あるので、しばらく 見にいく
  var voicePollT=null;
  function voicePoll(){
    if(voicePollT) clearInterval(voicePollT);
    var n=0, last=-1;
    voicePollT=setInterval(function(){
      var c=(window.speechSynthesis?speechSynthesis.getVoices():[]).length;
      if(c!==last){ last=c; enVoice=pickVoice(); renderVoicePicker(); }
      if(++n>20||c>0&&n>6){ clearInterval(voicePollT); voicePollT=null; }
    },500);
  }
  if(window.speechSynthesis){ speechSynthesis.onvoiceschanged=function(){ enVoice=pickVoice(); renderVoicePicker(); }; ensureVoice(); voicePoll(); }
  (function(){
    var sel=document.getElementById('voiceSel');
    if(sel) sel.onchange=function(){ state.voiceName=sel.value;
      enVoice=enVoices().find(function(v){ return v.name===sel.value; })||null; save(); speak('Hello! This is my voice.'); };
    var rs=document.getElementById('rateSel'); if(rs) rs.onchange=function(){ state.speechRate=parseFloat(rs.value)||0.8; save(); speak('Hello! Good job!'); };
    var tb=document.getElementById('voiceTest'); if(tb) tb.onclick=function(){ speak('Hello! Good job!'); };
    var va=document.getElementById('voiceAll'); if(va) va.onclick=function(){
      var box=document.getElementById('voiceDump'); if(!box) return;
      if(box.style.display==='block'){ box.style.display='none'; return; }
      var all=(window.speechSynthesis?speechSynthesis.getVoices():[]);
      var en=all.filter(function(v){ return /^en[-_]?/i.test(v.lang); });
      var shown=enVoices();
      box.style.display='block';
      box.innerHTML='<b>この たんまつが 出せる こえ：ぜんぶで '+all.length+'こ ／ えいご '+en.length+'こ ／ アプリに 出しているのは '+shown.length+'こ</b><br>'
        + (en.length?en.map(function(v){
            var used=shown.some(function(s2){ return s2.name===v.name; });
            return (used?'✅ ':'✖ ')+escJa(v.name)+' <span style="color:var(--mut);">('+escJa(v.lang)+(v.localService===false?'・ネット':'')+')</span>';
          }).join('<br>')
          : '<span style="color:#b45309;">えいごの こえが 1つも ありません。Safari で ひらいているか、iPhoneの 設定→アクセシビリティ→読み上げコンテンツ→声→英語 を かくにんしてね</span>');
    };
    renderVoicePicker();
  })();
  function speak(en){ try{
    if(!window.speechSynthesis) return;
    var u=new SpeechSynthesisUtterance(en);
    u.lang='en-US';
    // こえの わりあては 別に try する（ここで こけても 読み上げ自体は 止めない）
    try{ var v=ensureVoice(); if(v){ u.voice=v; if(v.lang) u.lang=v.lang; } }catch(e2){}
    u.rate=state.speechRate||0.8; u.pitch=1.0;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }catch(e){} }
  document.getElementById('speak').onclick=function(){ qUsedAudio=true; speak(curWord?curWord[0]:document.getElementById('qword').textContent); };
  (function(){ var sb=document.getElementById('spellSubmit'); if(sb) sb.onclick=submitSpell; var si=document.getElementById('spellInput'); if(si){ si.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); submitSpell(); } }); si.addEventListener('input',updateSpellBars); } var qw=document.getElementById('qword'); if(qw) attachLongPress(qw,function(){ if(curWord && (qMode==='reverse'||qMode==='spell')) showEasy(curWord); }); })();
  document.getElementById('dontKnow').onclick=function(){
    if(!curWord) return;
    if(qMode==='spell'){ var inp=document.getElementById('spellInput'); if(inp&&inp.disabled) return; if(inp) inp.disabled=true; var sb2=document.getElementById('spellSubmit'); if(sb2) sb2.disabled=true; qMissed=true; recordAnswer(curWord[0],false,'dk'); save(); speak(curWord[0]); requeueMissed(curWord); document.getElementById('reward').textContent='こたえ：'+curWord[0]; showEasy(curWord); showNext(); return; }
    var box=document.getElementById('choices');
    if(box.style.pointerEvents==='none') return; // すでに回答済み
    box.style.pointerEvents='none';
    var btns=box.querySelectorAll('.ch'); for(var i=0;i<btns.length;i++){ if(btns[i]._isCorrect) btns[i].classList.add('ok'); }
    qMissed=true; recordAnswer(curWord[0],false,'dk'); save(); speak(curWord[0]); requeueMissed(curWord); // わからない＝復習まちへ、正しい発音を きかせる
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
