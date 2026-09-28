/* えいごペット — app logic (called from componentDidMount) */
window._eigoPetInit = function() {
  /* きゅうの 設定を ととのえる（よみこみ・ふっかつ の どちらでも つかう）
     ・なくなった きゅう（3級など）は すてる　・出す きゅうは 1つか 2つ
     ・出していない きゅうを えらんでいたら 出している ほうへ */
  function fixGrades(s){
    if(s&&s.towerBestWave!==undefined) delete s.towerBestWave;   // むげんモードは はいし
    var v=Array.isArray(s.visGrades)?s.visGrades.filter(function(g,i,a){ return WORDBANK[g]&&a.indexOf(g)===i; }):[];
    if(v.length>2) v=v.slice(-2);                  // 2つまで（あたらしい ほうを のこす）
    if(!v.length) v=['jun2','g2'];
    s.visGrades=v;
    if(!WORDBANK[s.grade]||v.indexOf(s.grade)<0) s.grade=v[0];
  }
  if (window._eigoPetInitDone) return;
  window._eigoPetInitDone = true;

  const QPER = 5;
  function currentWords() { return (WORDBANK[state.grade] || WORDBANK.jun2).words; }

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
    var def={ name:"ぴよ",lv:1,xp:0,hunger:80,happy:80,food:0,dirty:false,streak:1,learned:0,last:today(),grade:"jun2",visGrades:["jun2","g2"],discipline:50,weight:5,careMiss:0,disciplineMiss:0,wagamama:false,babyType:null,childType:null,adultType:null,customImg:{},gameHi:0,dailyGoal:20,todayDate:today(),todayWords:[],lastGoalDate:null,metDates:[],wrongWords:[],petColor:'brown',bg:'meadow',freezeTickets:0,lastTicketDate:null,lastBoxWeek:null,titles:[],sound:true,mastery:{},learn:{},maxStreak:0,sick:false,sickSince:null,starveSince:null,gamesPlayed:0,genCorrect:0,sleepCount:0,dirtySince:null,poopDate:null,poopBits:0,voiceName:null,speechRate:0.8,advGrades:false,petNo:1,foodFrac:0,dblNext:null,dblSeen:null,ddSeen:null,tenSeen:null,lastPlay:Date.now(),mischiefAt:null,mischiefDate:null,mischiefN:0,born:Date.now(),stageSince:Date.now(),lifespanDays:12+Math.floor(Math.random()*3),youngType:null,memories:[],schemaV:2,lastBackupNudge:null,lastTick:Date.now(),keifuRevealed:[],moneyLog:[] };
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
    fixGrades(s);
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
  /* ===== ほかの タブ・ホーム画面アプリとの あいだで ずれない ように =====
     アプリが 2か所で ひらいていると（Safari の べつタブ、ホーム画面アイコン など）、
     ふるい ほうが じぶんの ふるい データで 上書きして、上級モードや 学習きろくが
     もどって しまう。そこで 保存のたびに 時刻を TSKEY に のこし、
     ・じぶんが 知らない あたらしい 保存が あれば、上書きせずに そちらを 読みこむ
     ・ほかの タブが 保存したら（storage）／この画面に もどったら（visibilitychange）読みなおす */
  var TSKEY=KEY+'_ts';
  var lastSavedAt=(function(){ try{ return +localStorage.getItem(TSKEY)||0; }catch(e){ return 0; } })();
  function storedAt(){ try{ return +localStorage.getItem(TSKEY)||0; }catch(e){ return 0; } }
  function adoptStored(){
    var o=null; try{ o=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){}
    if(!o||typeof o!=='object') return false;
    state=sanitizeImport(o); fixGrades(state); lastSavedAt=storedAt();
    try{ applyAdv(); render(); }catch(e){}
    return true;
  }
  function save(){ try{
    if(storedAt()>lastSavedAt&&adoptStored()) return;   // ほかで あたらしく 保存されていた → 上書きしない
    lastSavedAt=Date.now();
    var js=JSON.stringify(state); localStorage.setItem(KEY,js); localStorage.setItem(BAKKEY,js); localStorage.setItem(TSKEY,String(lastSavedAt));
  }catch(e){} }
  try{
    window.addEventListener('storage',function(e){ if(e.key===TSKEY&&storedAt()>lastSavedAt) adoptStored(); });
    document.addEventListener('visibilitychange',function(){ if(!document.hidden&&storedAt()>lastSavedAt) adoptStored(); });
    window.addEventListener('pageshow',function(){ if(storedAt()>lastSavedAt) adoptStored(); });
  }catch(e){}

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
      var iv=r[9]; if(iv>=0){ var key=String(iv); if(!byIvl[key]) byIvl[key]=[0,0]; byIvl[key][0]++; byIvl[key][1]+=ok; }  // iv は 日数
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

  /* ===== この1しゅうかん（曜日ごとの ようす） =====
     ログ1行ごとに「こたえた直前の SRS状態」が のこっているので、
     そこから その日に なにが 起きたかを 組みなおす。
     ・おぼえた   ＝ その回答で かんかくが SRS_MASTER_IVL日 いじょうに なった（＝⭐が ついた）
     ・おぼえかけ ＝ はじめて 出あって、まだ ⭐に とどかなかった語
     ・わすれた   ＝ ⭐が ついていた語を まちがえて ⭐が とれた
     ・まちがえ   ＝ その日の 誤答の数                                        */
  var DOW_JA=['にち','げつ','か','すい','もく','きん','ど'];
  function lvAfterOk(lvBefore,ivlBefore,wasNew,fast){       // onAnswer の 正解ぶんを なぞる
    if(fast&&wasNew) return SRS_KNOWN_LV;
    if(ivlBefore>0) return Math.min(SRS_IVL.length-1,lvBefore+1);
    return wasNew?0:lvBefore;                               // まちがえた直後は 2段もどした ところから
  }
  function weekStats(n){
    var days=[], idx={}, i, d=new Date(today());
    d.setDate(d.getDate()-(n-1));
    for(i=0;i<n;i++){
      var ds=dayStr(d);
      idx[ds]=days.length;
      days.push({ day:ds, dow:d.getDay(), q:0, ok:0, wrong:0, mastered:0, learning:0, forgot:0, words:{} });
      d.setDate(d.getDate()+1);
    }
    logAll().forEach(function(r){
      var e=days[idx[r[1]]]; if(!e) return;
      var wasNew=(r[7]!==1), lvB=r[8]<0?0:r[8], ivlB=r[9]<0?0:r[9], ok=(r[5]===1);
      e.q++; e.words[r[2]]=1;
      if(ok){
        e.ok++;
        var ivlA=SRS_IVL[lvAfterOk(lvB,ivlB,wasNew,r[15]===1)]||0;
        if(ivlA>=SRS_MASTER_IVL&&ivlB<SRS_MASTER_IVL) e.mastered++;       // ⭐が ついた しゅんかん
        else if(wasNew) e.learning++;                                      // はじめて だけど まだ ⭐じゃない
      } else {
        e.wrong++;
        if(ivlB>=SRS_MASTER_IVL) e.forgot++;                               // ⭐が とれた
        else if(wasNew) e.learning++;
      }
    });
    days.forEach(function(e){ e.uniq=Object.keys(e.words).length; delete e.words; });
    return days;
  }
  function renderWeekStat(){
    var el=document.getElementById('weekStat'); if(!el) return;
    var ds=weekStats(7), max=1;
    ds.forEach(function(e){ if(e.q>max) max=e.q; });
    var sum={q:0,mastered:0,learning:0,wrong:0,forgot:0};
    ds.forEach(function(e){ for(var k in sum) sum[k]+=e[k]; });
    if(!sum.q){ el.innerHTML='<div style="color:var(--mut);font-weight:700;">この1しゅうかんは まだ べんきょうの きろくが ありません。</div>'; return; }
    var rows=ds.map(function(e){
      var md=e.day.slice(5).replace('-','/'), w=Math.round(100*e.q/max);
      var today_=e.day===today();
      return '<div class="wkrow'+(today_?' wknow':'')+'">'
        +'<div class="wkd"><b>'+DOW_JA[e.dow]+'</b><span>'+md+'</span></div>'
        +'<div class="wkbar"><i style="width:'+w+'%;"></i><em>'+(e.q?e.q+'問':'—')+'</em></div>'
        +'<div class="wkn wkm">'+(e.mastered||'')+'</div>'
        +'<div class="wkn wkl">'+(e.learning||'')+'</div>'
        +'<div class="wkn wkw">'+(e.wrong||'')+'</div>'
        +'</div>';
    }).join('');
    el.innerHTML='<div class="wkhead"><div class="wkd">ようび</div><div class="wkbar">といた かず</div>'
      +'<div class="wkn wkm">⭐</div><div class="wkn wkl">かけ</div><div class="wkn wkw">✗</div></div>'
      +rows
      +'<div class="wksum">1しゅうかんで ⭐おぼえた <b>'+sum.mastered+'</b>こ ／ おぼえかけ <b>'+sum.learning
      +'</b>こ ／ まちがえ <b>'+sum.wrong+'</b>回'+(sum.forgot?' ／ わすれた <b>'+sum.forgot+'</b>こ':'')+'</div>'
      +'<div class="wknote">⭐＝その日に かんかくが '+SRS_MASTER_IVL+'日 いじょうに なった語　／　かけ＝はじめて 出あって まだ ⭐じゃない語　／　✗＝まちがえた かず</div>';
  }
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
      ivKeys.map(function(k){ return row('かんかく '+(k<=0?'はじめて':k+'日')+' の正答率',okPct(s.byIvl[k])+'（'+s.byIvl[k][0]+'問）'); }).join('')+
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
    else if(kind==='coin'){ tone(1319,0,0.06); tone(1760,0.05,0.08); }
    else if(kind==='jump'){ tone(440,0,0.08); tone(660,0.05,0.08); }
    else if(kind==='swoosh'){ tone(320,0,0.05,'triangle'); }
    else if(kind==='crash'){ tone(140,0,0.25,'sawtooth'); tone(90,0.1,0.3,'square'); }
    else if(kind==='flush'){ tone(520,0,0.12,'sawtooth'); tone(380,0.12,0.14,'sawtooth'); tone(260,0.26,0.22,'sawtooth'); }
  }

  /* ---- titles ---- */
  /* ===== 間隔反復（SRS）=====
     ・Karpicke & Roediger (2008)：正解できた語も「テストし続ける」ことが定着の鍵
       （1週間後の再生率 テスト継続80% / 再学習のみ36%）→ おぼえた語も 引退させず
       間隔を のばして 出しつづける
     ・Cepeda et al. (2008)：最適な復習間隔は「おぼえていたい期間」の 10〜20%
       → 数年 もたせる想定で 1→4→12→35→90→210→450日 の階段。
         60日どまりだと 覚えきった語が 2か月ごとに もどってきて 新しい語の枠を うばう
     ・Nakata (2015) / Nakata & Webb (2016)：効くのは「間隔の量」。拡張か均等かの差は小さく、
       1回に学ぶ語数より 間隔のほうが大事 → 5問/回は そのまま、日をまたぐ間隔を入れる  */
  var SRS_IVL=[1,4,12,35,90,210,450];                 // レベルごとの 日数（約2.5倍ずつ のばす）
  var SRS_MASTER_IVL=12;                              // これ以上のびたら「おぼえた」あつかい
  function dayAdd(ds,n){ var d=new Date(ds); d.setDate(d.getDate()+n); return dayStr(d); }
  function srsDue(r){ return !r || !r.due || r.due<=today(); }
  function dayGain(){                                   // きょう ふえた数（日が かわったら リセット）
    if(!state.gain||state.gain.d!==today()) state.gain={d:today(),m:0,seen:0};
    return state.gain; }
  var SRS_KNOWN_LV=3, SRS_SURE_LV=4;                   // 知っていそう→35日／たしかに知っている→90日
  function onAnswer(en,ok,fast){
    var k=(en||'').toLowerCase(); var r=state.learn[k]||{c:0,w:false,m:false,lv:0};
    var wasNew=!state.learn[k], wasM=!!r.m, g=dayGain();
    if(wasNew) g.seen++;
    if(typeof r.lv!=='number') r.lv=0;
    if(ok){
      r.c=(r.c||0)+1;
      r.fn=fast?((r.fn||0)+1):0;                        // そっこう正解が つづいた回数
      if(fast&&wasNew) r.lv=SRS_KNOWN_LV;                       // 初回から そっこう → 35日
      else if(fast&&r.fn>=2&&r.lv<=SRS_KNOWN_LV) r.lv=SRS_SURE_LV;  // 2回つづけば 90日
      else if(r.ivl>0) r.lv=Math.min(SRS_IVL.length-1,r.lv+1);
      else r.lv=(r.lv||0);   // はじめて＝レベル0（1日後）／まちがえた直後は 2段もどした レベルから やりなおし
      r.ivl=SRS_IVL[r.lv];
      r.due=dayAdd(today(),r.ivl);
      r.m=(r.ivl>=SRS_MASTER_IVL);
      if(!wasM&&r.m) g.m++;                              // ⭐に なった瞬間だけ 数える
    } else {
      r.c=0; r.w=true; r.m=false; r.fn=0;
      r.lv=Math.max(0,(r.lv||0)-2);                   // 全部もどさず 2段だけ もどす（90日→12日）
      r.ivl=0; r.due=today();                         // にがては すぐ また出す
    }
    state.learn[k]=r;
  }
  function isReviewWord(k){ var r=state.learn[k]; return !!(r&&!r.m); }
  // いま アプリに ある 単語だけを 数える（けした 3級だけの 語などは 数えない。きろく じたいは のこす）
  var bankKeys=null;
  function inBank(k){
    if(!bankKeys){ bankKeys={}; for(var g in WORDBANK) WORDBANK[g].words.forEach(function(w){ bankKeys[w[0].toLowerCase()]=1; }); }
    return !!bankKeys[k];
  }
  function masteredCount(){ var n=0; for(var k in state.learn){ if(state.learn[k].m&&inBank(k)) n++; } return n; }
  function reviewCount(){ var n=0; for(var k in state.learn){ var r=state.learn[k]; if(!r.m&&inBank(k)) n++; } return n; }
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
    document.querySelectorAll('#grades .gbtn').forEach(function(b){ b.classList.toggle('sel',b.dataset.g===state.grade); });   // がくしゅうの ボタンだけ（プリント・たんごリストは それぞれ じぶんで つける）
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
  var RETRY_COST=10;                                        // やられてから 再開する ときの えさ
  function renderGameSelect(){ var w=document.getElementById('selWarSub'); if(w) w.textContent='ステージ '+(state.warStage||1)+'　なかまを ふやして てきの ぐんだんを たおせ！';
    var tw=document.getElementById('selTowerSub'); if(tw){ var sv=state.towerStars||{}, tot=0; for(var k in sv) tot+=sv[k]; var ts=state.towerStage||1; tw.textContent='ワールド '+(((Math.ceil(ts/5)-1)%5)+1)+'-'+((ts-1)%5+1)+(tot?'　★'+tot:'')+'　タワーを たてて おしろを まもれ！'; } }
  var startPick=function(fn,cost,retry){ return function(){ cost=cost||1;
    if(state.food<cost){ bubble(cost>1?('えさが '+cost+'こ ひつよう だよ'):'えさが たりない'); return; }
    consumePlay(cost); lastGame=fn; lastCost=cost; lastRetry=retry||fn; fn(); }; };
  var lastGame=function(){}, lastCost=1, lastRetry=lastGame;
  var selRn=document.getElementById('selRun'); if(selRn) selRn.onclick=startPick(startRunner,1);
  var selWr=document.getElementById('selWar'); if(selWr) selWr.onclick=startPick(startWar,1);
  var selTw=document.getElementById('selTower'); if(selTw) selTw.onclick=startPick(startTower,1);

  /* ===== えいごウォー（war.js） ===== */
  var lastTowerLose=0;
  function startTower(pick){
    var stg=pick||state.towerStage||1;
    var root=document.getElementById('towerRoot');
    loadThree(function(){
      runQ=[];
      EigoTower.start({
        container:root, stage:stg, pickStage:function(n){ startTower(n); }, getQuestion:runnerQuestion, onAnswer:runnerAnswer, sfx:sfx, speak:speak,
        research:{ get:function(){ var sv=state.towerStars||{}, tot=0; for(var k in sv) tot+=sv[k]; return {lv:state.towerRes||{}, stars:tot-(state.towerSpent||0), total:tot, skin:state.towerSkin||'red', cls:state.towerCls||'knight', starsBy:state.towerStars||{}, maxStage:state.towerStage||1}; },
                   setCls:function(k){ state.towerCls=k; save(); } },
        onEnd:function(r){
          var happyGain=r.quit?Math.min(8,1+r.right):Math.min(30,4+r.right*2+(r.win?6:0));
          state.happy=Math.min(100,state.happy+happyGain); addXp(5);
          lastTowerLose=r.win?0:r.stage;
          var wasNew=r.win&&r.stage>=(state.towerStage||1); if(wasNew) state.towerStage=r.stage+1;
          if(r.stars){ state.towerStars=state.towerStars||{}; state.towerStars[r.stage]=Math.max(state.towerStars[r.stage]||0,r.stars); }
          save();
          return {reward:'ごきげん +'+happyGain+(r.right?'　／　えいご '+r.right+'もん せいかい':''),
                  retryLabel:(r.win?(wasNew?(r.stage%5===0?'つぎの ワールドへ':'ステージ '+(state.towerStage)+' へ'):'さいしんの ステージへ'):'もういちど')+'（えさ1）'+(state.food<1?'　えさが たりない':'')};
        },
        onRetry:function(){
          if(state.food<1){ bubble('えさが たりない'); EigoTower.stop(); renderGameSelect(); show('gameSelect'); return; }
          consumePlay(1); startTower(lastTowerLose||undefined);
        },
        onExit:function(){ render(); renderGameSelect(); show('gameSelect'); }
      });
    });
  }
  function startWar(){
    var root=document.getElementById('warRoot');
    loadThree(function(){
      runQ=[];
      EigoWar.start({
        research:{ get:function(){ return {lv:state.warRes||{}, medals:state.warMedals||0, leader:state.warLeader||'thunder'}; },
                   setLeader:function(k){ state.warLeader=k; save(); },
                   buy:function(k,cost){ if((state.warMedals||0)<cost) return false; state.warRes=state.warRes||{}; if((state.warRes[k]||0)>=5) return false; state.warRes[k]=(state.warRes[k]||0)+1; state.warMedals-=cost; save(); return true; } },
        container:root, stage:state.warStage||1, getQuestion:runnerQuestion, onAnswer:runnerAnswer, sfx:sfx, speak:speak,
        onEnd:function(r){
          var happyGain=r.quit?Math.min(8,1+r.right):Math.min(30,4+r.right*2+(r.win?6:0));
          state.happy=Math.min(100,state.happy+happyGain); addXp(5);
          if(r.win) state.warStage=(state.warStage||1)+1;
          if(r.medals) state.warMedals=(state.warMedals||0)+r.medals;
          state.warBest=Math.max(state.warBest||0,r.win?r.stage:(state.warBest||0)); save();
          return {reward:'ごきげん +'+happyGain+(r.right?'　／　えいご '+r.right+'もん せいかい':''),
                  retryLabel:(r.win?'ステージ '+(state.warStage)+' へ':'もういちど')+'（えさ1）'+(state.food<1?'　えさが たりない':'')};
        },
        onRetry:function(){
          if(state.food<1){ bubble('えさが たりない'); EigoWar.stop(); renderGameSelect(); show('gameSelect'); return; }
          consumePlay(1); startWar();
        },
        onExit:function(){ render(); renderGameSelect(); show('gameSelect'); }
      });
    });
  }

  /* ===== えいごダッシュ（3D ランゲーム・runner.js） =====
     Three.js（600KB）は はじめて あそぶ ときだけ 読みこむ。
     えいごゲートの 問題は ふだんの 学習と おなじ じゅんばん（復習が さき）で 出し、
     こたえは 学習きろく（SRS・ログ）に のこす。 */
  function loadThree(cb){
    if(window.THREE) return cb();
    var s=document.createElement('script'); s.src='./vendor/three.min.js';
    s.onload=function(){ cb(); };
    s.onerror=function(){ s.remove(); bubble('3Dの よみこみに しっぱい しました。つうしんを たしかめてね'); show('gameSelect'); };
    document.head.appendChild(s);
  }
  function shortJa(w){ var s=splitSenses(w[1])[0]||w[1]||''; return s.replace(/[～~]/g,'').trim(); }
  var runQ=[];
  function runnerQuestion(){
    if(!runQ.length) runQ=buildQuestions(10).slice();
    var w=runQ.shift(); if(!w) return null;
    var yo=function(x){ return (splitSenses(x[2]||'')[0]||'').replace(/[～~]/g,'').trim(); };   // ふりがな（いみの 1つめ）
    var ans=shortJa(w), pool=currentWords(), seen={}, ch=[ans], ys=[yo(w)];
    seen[ans]=1;
    for(var tries=0;ch.length<3&&tries<200;tries++){
      var d=pool[Math.floor(Math.random()*pool.length)], t=shortJa(d);
      if(!t||seen[t]||d[0]===w[0]||t.length>12) continue;
      seen[t]=1; ch.push(t); ys.push(yo(d));
    }
    if(ch.length<3) return null;
    return {en:w[0],choices:ch,yomi:ys};
  }
  function runnerAnswer(en,ok,ms){
    var k=(en||'').toLowerCase(), r=state.learn[k], late=0;
    if(r&&r.due){ late=Math.round((new Date(today())-new Date(r.due))/86400000); if(!(late>=0)) late=0; }
    logPush([Date.now(),today(),k,state.grade,0,ok?1:0,Math.min(600000,ms||0),r?1:0,r?(r.lv||0):-1,r?(r.ivl||0):-1,late,0,0,displayStreak(),todayCount(),0]);
    onAnswer(en,ok,false); save();
  }
  function startRunner(){
    var root=document.getElementById('runnerRoot');
    loadThree(function(){
      runQ=[];
      EigoRunner.start({
        container:root, getQuestion:runnerQuestion, onAnswer:runnerAnswer, sfx:sfx, speak:speak,
        onEnd:function(r){
          var happyGain=r.quit?Math.min(10,1+Math.floor(r.score/200)):Math.min(30,3+Math.floor(r.score/150));
          state.happy=Math.min(100,state.happy+happyGain); addXp(5);
          var best=Math.max(state.runHi||0,r.score); state.runHi=best; save();
          return {best:best,reward:'ごきげん +'+happyGain+(r.right?'　／　えいご '+r.right+'もん せいかい':''),
                  retryLabel:'もういちど（えさ1）'+(state.food<1?'　えさが たりない':'')};
        },
        onRetry:function(){
          if(state.food<1){ bubble('えさが たりない'); EigoRunner.stop(); renderGameSelect(); show('gameSelect'); return; }
          consumePlay(1); startRunner();
        },
        onExit:function(){ render(); renderGameSelect(); show('gameSelect'); }
      });
    });
  }
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
  function renderData(){ document.getElementById('dataStat').textContent='なまえ：'+state.name+' ／ レベル '+state.lv+' ／ おぼえた '+masteredCount()+'こ ／ 🔥'+displayStreak()+'にち'; document.getElementById('exportBox').style.display='none'; document.getElementById('btnCopy').style.display='none'; document.getElementById('importBox').value=''; document.getElementById('dataMsg').textContent=''; renderWeekStat(); renderLogStat(); }
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
  document.getElementById('btnImport').onclick=function(){ var msg=document.getElementById('dataMsg'); var code=(document.getElementById('importBox').value||'').trim(); if(!code){ msg.style.color='#9b2222'; msg.textContent='コードを はりつけてね'; return; } var obj=null; try{ obj=JSON.parse(decodeURIComponent(escape(atob(code)))); }catch(e){ try{ obj=JSON.parse(code); }catch(e2){} } obj=sanitizeImport(obj); if(!obj||typeof obj!=='object'||(obj.lv===undefined&&obj.learned===undefined)){ msg.style.color='#9b2222'; msg.textContent='この コードは よみこめません'; return; } if(!confirm('いまの データを この バックアップで 上書きします。よろしいですか？')) return; state=Object.assign({},state,obj); fixGrades(state); save(); applyAdv(); msg.style.color='var(--g)'; msg.textContent='ふっかつしました！'; renderData(); render(); };
  document.getElementById('btnDownload').onclick=function(){ var msg=document.getElementById('dataMsg'); try{ var blob=new Blob([JSON.stringify(state)],{type:'application/json'}); var url=URL.createObjectURL(blob); var a=document.createElement('a'); var d=new Date(), ds=d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2); a.href=url; a.download='eigopet_backup_'+ds+'.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function(){ URL.revokeObjectURL(url); },1500); msg.style.color='var(--g)'; msg.textContent='ファイルに ほぞんしました！'; }catch(e){ msg.style.color='#9b2222'; msg.textContent='ほぞん できないときは コードを つかってね'; } };
  document.getElementById('fileImport').onchange=function(e){ var f=e.target.files&&e.target.files[0]; var msg=document.getElementById('dataMsg'); if(!f) return; var r=new FileReader(); r.onload=function(){ var obj=null; try{ obj=JSON.parse(r.result); }catch(err){} obj=sanitizeImport(obj); if(!obj||typeof obj!=='object'||(obj.lv===undefined&&obj.learned===undefined)){ msg.style.color='#9b2222'; msg.textContent='この ファイルは よみこめません'; return; } if(!confirm('いまの データを この バックアップで 上書きします。よろしいですか？')) return; state=Object.assign({},state,obj); fixGrades(state); save(); applyAdv(); msg.style.color='var(--g)'; msg.textContent='ふっかつしました！'; renderData(); render(); }; r.readAsText(f); e.target.value=''; };
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
      logClear(); renderWeekStat(); renderLogStat(); msg('けしました'); };
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

  /* ---- study ---- */
  var session, qIdx, qList;
  var MAIN_TABS=['home','learn','okane','printsheet','admin'];
  /* ===== プリント：きゅうを えらんで たんご20こを A4に いんさつ =====
     おうちの ひとが 紙で テストする ための モード。
     ひだり＝英単語／まんなか＝品詞／みぎ＝いみ。
     「こたえを かくす」で みぎを 白くして 問題用紙に できる。
     いちど 出した語は state.prDone に のこして 二度と 出さない。 */
  var PR_N=20, PR_LOG_MAX=60, prGrade='jun2', prWords=[], prHide=false, prMsg='', prHistOn=false, prCarry={};  // prCarry：1しゅうめの のこり（2しゅうめの きろくには 入れない）

  /* 品詞：もとデータの pos は noun が ごみ箱に なっていて（動詞283語 対 名詞5854語）、
     demonstrate が「名詞」など まちがいが 多い。
     そこで noun 以外の ラベルだけ 信用し、noun は 訳文から みなおす。 */
  var PR_POS={noun:'名',verb:'動',adjective:'形',adverb:'副',phrase:'熟',preposition:'前',conjunction:'接',pronoun:'代'};
  function prPos(w){
    var t=(w[1]||'').split(/[，,、]/)[0].trim(), p=w[3];
    if(/[ \-]/.test(w[0])) return '熟';                       // 2語いじょうは 熟語
    if(p&&p!=='noun') return PR_POS[p]||'名';
    if(/^(を|に|と|が|から|へ)/.test(t)||/する$/.test(t)) return '動';
    if(/[うくぐすつぬぶむる]$/.test(t)) return '動';           // 「かむ」「飾る」など 動詞の じしょ形
    if(/(な|しい|い)$/.test(t)&&!/(こと|もの|ひと)$/.test(t)) return '形';
    if(/(に|く|で)$/.test(t)) return '副';
    return '名';
  }

  function prDoneSet(g){ if(!state.prDone) state.prDone={}; if(!state.prDone[g]) state.prDone[g]=[]; return state.prDone[g]; }

  function prPick(g){
    var src=(WORDBANK[g]&&WORDBANK[g].words)||[];
    var pool=src.filter(function(w){ return w&&w[0]&&w[1]; });
    var done=prDoneSet(g), dset={}; done.forEach(function(k){ dset[k]=1; });
    var rest=pool.filter(function(w){ return !dset[w[0]]; });
    var shuf=function(x){ var a=x.slice();                 // フィッシャー・イェーツ
      for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)),t=a[i]; a[i]=a[j]; a[j]=t; }
      return a; };
    prMsg=''; prCarry={};
    if(rest.length<PR_N){                                  // のこりが 20こ より すくない
      // まだ 出していない のこりを さきに ぜんぶ 入れて、たりない ぶんだけ 2しゅうめから たす
      var left={}; rest.forEach(function(w){ left[w[0]]=1; });
      prCarry=left;
      var fill=shuf(pool.filter(function(w){ return !left[w[0]]; })).slice(0,PR_N-rest.length);
      state.prDone[g]=[]; save();                          // 2しゅうめの はじまり
      prMsg='この きゅうの たんごを ひととおり 出しおわります。のこり '+rest.length+'こ と、2しゅうめの たんごを まぜています。';
      return shuf(rest).concat(fill);
    }
    return shuf(rest).slice(0,PR_N);
  }

  function prMark(){                                       // いんさつした語を きろくする
    if(!prWords.length) return;
    var done=prDoneSet(prGrade);
    prWords.forEach(function(w){ if(!prCarry[w[0]]&&done.indexOf(w[0])<0) done.push(w[0]); });
    if(!state.prLog) state.prLog=[];                       // 何を いつ 印刷したかの りれき
    state.prLog.unshift({ t:Date.now(), g:prGrade, ws:prWords.map(function(w){ return w[0]; }) });
    if(state.prLog.length>PR_LOG_MAX) state.prLog.length=PR_LOG_MAX;
    save(); prRender();
  }

  function prLogDate(t){
    var d=new Date(t), z=function(n){ return (n<10?'0':'')+n; };
    return d.getFullYear()+'.'+(d.getMonth()+1)+'.'+d.getDate()+' '+z(d.getHours())+':'+z(d.getMinutes());
  }

  function prHistRender(){
    var box=document.getElementById('prHist'); if(!box) return;
    var hb=document.getElementById('prHistBtn');
    if(hb) hb.textContent=prHistOn?'きろくを とじる':'きろくを みる';
    box.style.display=prHistOn?'block':'none';
    if(!prHistOn) return;
    var log=state.prLog||[];
    if(!log.length){ box.innerHTML='<div class="prhempty">まだ いんさつした きろくは ありません。</div>'; return; }
    box.innerHTML=log.map(function(e,i){
      var lab=(WORDBANK[e.g]&&WORDBANK[e.g].label)||({g3:'英検3級'})[e.g]||e.g;   // 3級は もう ないが りれきは のこす
      var ws=(e.ws||[]).map(function(en){
        return '<span class="prhw" data-en="'+escJa(en)+'">'+escJa(en)+'</span>';
      }).join('');
      return '<div class="prhitem"><div class="prhhead">'+escJa(lab)+'　'+prLogDate(e.t)
           +'<span class="prhn">'+(e.ws||[]).length+'こ</span></div>'
           +'<div class="prhws">'+ws+'</div></div>';
    }).join('');
  }

  function prRender(){
    document.querySelectorAll('#prGrades .gbtn').forEach(function(b){ b.classList.toggle('sel',b.dataset.g===prGrade); });
    var hb=document.getElementById('prHide');
    if(hb) hb.textContent=prHide?'こたえを だす':'こたえを かくす';
    document.body.classList.toggle('pr-hide',prHide);

    var total=((WORDBANK[prGrade]&&WORDBANK[prGrade].words)||[]).length, done=prDoneSet(prGrade).length;
    var st=document.getElementById('prStat');
    if(st) st.textContent='いんさつずみ '+done+' ／ '+total+' こ　（のこり '+(total-done)+'）';
    var mg=document.getElementById('prMsg');
    if(mg){ mg.textContent=prMsg; mg.style.display=prMsg?'block':'none'; }
    prHistRender();

    var lab=(WORDBANK[prGrade]&&WORDBANK[prGrade].label)||'';
    var d=new Date(), date=d.getFullYear()+'.'+(d.getMonth()+1)+'.'+d.getDate();
    var rows=prWords.map(function(w,i){
      return '<tr><td class="prno">'+(i+1)+'</td>'
           +'<td class="pren" data-en="'+escJa(w[0])+'">'+escJa(w[0])+'</td>'
           +'<td class="prp">'+prPos(w)+'</td>'
           +'<td class="prja">'+escJa(splitSenses(w[1]).join('，'))+'</td></tr>';
    }).join('');
    document.getElementById('prSheet').innerHTML=
       '<div class="prhead"><div class="prtitle">たんごテスト　'+escJa(lab)+'</div>'
      +'<div class="prmeta">'+PR_N+'もん<br>'+date+'</div></div>'
      +'<div class="prfields"><span>なまえ：</span><span>てんすう：　　／'+PR_N+'</span></div>'
      +'<table class="prtbl">'+rows+'</table>'
      +'<div class="prfoot">名=名詞／動=動詞／形=形容詞／副=副詞／熟=熟語　　えいごペット</div>';
  }

  function prOpen(){
    if(visGrades().indexOf(prGrade)<0) prGrade=visGrades()[0];
    if(!prWords.length) prWords=prPick(prGrade);
    prRender();
  }

  (function(){
    var g=document.getElementById('prGrades'); if(!g) return;
    g.onclick=function(e){ var b=e.target.closest('.gbtn'); if(!b) return; prGrade=b.dataset.g; prWords=prPick(prGrade); prRender(); };
    document.getElementById('prShuffle').onclick=function(){ prWords=prPick(prGrade); prRender(); sfx('correct'); };
    document.getElementById('prHide').onclick=function(){ prHide=!prHide; prRender(); };
    document.getElementById('prReset').onclick=function(){
      if(!confirm('「いんさつずみ」の きろくと りれきを けして、さいしょから えらべるように しますか？')) return;
      if(state.prDone) state.prDone[prGrade]=[];
      if(state.prLog) state.prLog=state.prLog.filter(function(e){ return e.g!==prGrade; });
      save(); prWords=prPick(prGrade); prRender(); bubble('きろくを けしました');
    };
    document.getElementById('prHistBtn').onclick=function(){ prHistOn=!prHistOn; prHistRender(); };
    var hbox=document.getElementById('prHist');
    if(hbox) hbox.onclick=function(e){
      var sp=e.target.closest('.prhw'); if(!sp) return;
      speak(sp.getAttribute('data-en'));
      sp.classList.add('sp'); setTimeout(function(){ sp.classList.remove('sp'); },600);
    };
    document.getElementById('prPrint').onclick=function(){ prMark(); window.print(); };
    /* 英単語を タップすると 読み上げる（紙に する まえの かくにん用） */
    var sh=document.getElementById('prSheet');
    if(sh) sh.onclick=function(e){
      var td=e.target.closest('td.pren'); if(!td) return;
      var en=td.getAttribute('data-en'); if(!en) return;
      speak(en);
      td.classList.add('sp'); setTimeout(function(){ td.classList.remove('sp'); },600);
    };
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
  // 上級モード：おうちの人コードで 出す きゅうを えらべるように する（子供には ふだん見えない）
  /* ===== 出す きゅうを 2つ えらぶ =====
     ふだんは 準2級・2級の 2つだけ 見せる。おうちの人が 上級モードを あけると、
     4つの きゅうから 1つか 2つ えらべる（3つめを えらぶと いちばん ふるいものが はずれる）。
     えらび直しても state.learn は きゅうに 関係なく 語ごとに のこるので、
     もどせば いつでも つづきから できる。 */
  var ALL_GRADES=['jun2','g2','jun1','g1'];
  function visGrades(){
    var v=(state.visGrades||[]).filter(function(g){ return ALL_GRADES.indexOf(g)>=0; });
    if(!v.length||v.length>2) v=['jun2','g2'];
    return v;
  }
  function applyVis(){
    var v=visGrades();
    document.querySelectorAll('.gbtn[data-g]').forEach(function(b){
      b.classList.toggle('ghide',v.indexOf(b.dataset.g)<0); });
    document.querySelectorAll('#visGrades .visbtn').forEach(function(b){
      b.classList.toggle('sel',v.indexOf(b.dataset.g)>=0); });
    if(v.indexOf(state.grade)<0){ state.grade=v[0]; save(); }
    if(v.indexOf(prGrade)<0){ prGrade=v[0]; prWords=[]; }
    if(typeof wlGrade!=='undefined'&&v.indexOf(wlGrade)<0) wlGrade=v[0];
  }
  function applyAdv(){
    document.body.classList.toggle('advgrades',!!state.advGrades);
    var as=document.getElementById('advState');
    if(as) as.innerHTML=state.advGrades?'<span style="color:var(--g);font-weight:900;">いま ON（出す きゅうを えらべます）</span>':'いま OFF';
    var vb=document.getElementById('visBox'); if(vb) vb.style.display=state.advGrades?'block':'none';
    applyVis();
  }
  (function(){
    var g=document.getElementById('visGrades'); if(!g) return;
    g.onclick=function(e){
      var b=e.target.closest('.visbtn'); if(!b) return;
      var k=b.dataset.g, v=visGrades().slice(), i=v.indexOf(k);
      if(i>=0){ if(v.length<=1) return; v.splice(i,1); }   // はずす（さいごの 1つは はずせない）
      else { v.push(k); while(v.length>2) v.shift(); }     // 3つめは いちばん ふるいものを おす
      state.visGrades=v; save(); applyVis(); render();
      bubble('出す きゅう：'+v.map(function(x){ return WORDBANK[x].label; }).join('・'));
    };
  })();
  (function(){ var bt=document.getElementById('advToggle'); if(!bt) return; bt.onclick=function(){ if(state.advGrades){ state.advGrades=false; save(); applyAdv(); render(); bubble('上級モードを もどしました'); return; } var en=prompt('おうちのひとコードを いれてね'); if(en===null) return; if((en||'').replace(/\D/g,'')==='0785770131'){ state.advGrades=true; save(); applyAdv(); render(); bubble('上級モード ON：出す きゅうを えらべます'); } else bubble('コードが ちがいます'); }; applyAdv(); })();
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
