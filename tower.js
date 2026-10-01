/* えいごタワー — みちを すすんでくる てきの ぐんだんから おしろを まもる 3D タワーディフェンス（Three.js）
   ・🪙の まるを タップ → タワーを えらんで たてる（ゆみ・まほう・こおり・たいほう）
   ・タワーを タップ → レベルアップ／うる
   ・てきは いろいろ：ふつう・はしりや・おおおとこ・よろい（かたい）・コウモリ（そらを とぶ）・まじゅつし（なかまを なおす）・ボス
   ・ウェーブの まえに えいごの もんだい：せいかいで コイン＋かみなり（⚡ボタンで てきの むれに おとす）
   app.js から EigoTower.start({...}) で よぶ。THREE と WAR_GFX を さきに 読みこんでおく。 */
(function(){
'use strict';
var R={}, FONT='"Hiragino Maru Gothic ProN","Hiragino Sans","M PLUS Rounded 1c","Noto Sans JP",sans-serif';
var MAX_EN=400, MAX_P=220;
function rnd(a,b){ return a+Math.random()*(b-a); }
function el(tag,css,html){ var e=document.createElement(tag); if(css) e.style.cssText=css; if(html!=null) e.innerHTML=html; return e; }
function escH(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function furi(t,y){ var a=0,b=0; while(a<t.length&&a<y.length&&t[a]===y[a]&&!/[一-鿿々]/.test(t[a])) a++; while(b<t.length-a&&b<y.length-a&&t[t.length-1-b]===y[y.length-1-b]&&!/[一-鿿々]/.test(t[t.length-1-b])) b++; return [t.slice(0,a),t.slice(a,t.length-b),y.slice(a,y.length-b),t.slice(t.length-b)]; }
function rb(t,y){ if(!(y&&/[一-鿿々]/.test(t))) return escH(t); var f=furi(t,y); return escH(f[0])+'<ruby style="white-space:nowrap;">'+escH(f[1])+'<rt style="font-size:.5em;">'+escH(f[2])+'</rt></ruby>'+escH(f[3]); }

// タワーの しゅるい（lv[0..2]＝レベル1〜3）。air＝そらの てきに とどく、magic＝よろいを むし
var TT={
  arrow: {name:'ゆみ',    ico:'🏹',desc:'はやい・そらにも',air:true, lv:[{cost:20,dmg:2,rate:1.2,range:4.0},{cost:30,dmg:3,rate:1.6,range:4.3},{cost:45,dmg:5,rate:2.0,range:4.7}]},
  magic: {name:'まほう',  ico:'🔮',desc:'よろいに つよい',air:true, magic:true, lv:[{cost:30,dmg:4,rate:0.8,range:3.8},{cost:40,dmg:7,rate:0.9,range:4.1},{cost:55,dmg:10,rate:1.0,range:4.4,chain:2}]},
  ice:   {name:'こおり',  ico:'❄️',desc:'てきを おそくする',air:true, lv:[{cost:25,dmg:1,rate:1.0,range:3.6,slow:0.4},{cost:35,dmg:1.5,rate:1.1,range:3.9,slow:0.5},{cost:45,dmg:2,rate:1.2,range:4.2,slow:0.6,splash:1.1}]},
  cannon:{name:'たいほう',ico:'💣',desc:'まとめて ドカン',air:false,lv:[{cost:35,dmg:4,rate:0.55,range:4.0,splash:1.0},{cost:45,dmg:6,rate:0.6,range:4.3,splash:1.2},{cost:60,dmg:9,rate:0.7,range:4.6,splash:1.4}]}
  ,mine:  {name:'きんこう',ico:'⛏',desc:'ウェーブごとに コイン',air:false,eco:true,lv:[{cost:40,gold:7,range:0},{cost:45,gold:14,range:0},{cost:55,gold:24,range:0}]}
  ,farm:  {name:'はたけ',ico:'🌾',desc:'ウェーブごとに すこし コイン',air:false,eco:true,fac:1,lv:[{cost:20,gold:4,range:0},{cost:25,gold:8,range:0},{cost:35,gold:13,range:0}]}
  ,lab:   {name:'けんきゅうじょ',ico:'🔬',desc:'けんきゅう ポイントを つくる',air:false,eco:true,fac:1,lv:[{cost:50,rp:1,range:0},{cost:60,rp:2,range:0},{cost:80,rp:3,range:0}]}
  ,forge: {name:'かじや',ico:'🔨',desc:'ちかくの タワーが つよく',air:false,eco:true,fac:1,lv:[{cost:45,buff:0.15,range:3.2},{cost:55,buff:0.25,range:3.6},{cost:70,buff:0.35,range:4.0}]}
  ,church:{name:'きょうかい',ico:'⛪',desc:'ウェーブごとに ❤️を なおす',air:false,eco:true,fac:1,lv:[{cost:40,heal:1,range:0},{cost:50,heal:2,range:0},{cost:65,heal:3,range:0}]}
}, TKEYS=['arrow','magic','ice','cannon'], FKEYS=['farm','mine','lab','forge','church'];
TT.mine.fac=1;
// けんきゅう（けんきゅうじょの ポイントで この ステージの あいだ つよくなる）
var RSCH=[{k:'arrow',ico:'🏹',name:'ゆみの つる',txt:'🏹 ダメージ +25%'},{k:'magic',ico:'🔮',name:'まほうの しょ',txt:'🔮 ダメージ +25%'},{k:'ice',ico:'❄️',name:'ひょうが',txt:'❄️ ダメージ+25%・こおる じかん+50%'},{k:'cannon',ico:'💣',name:'かやく',txt:'💣 ダメージ+15%・ばくはつ+20%'},
  {k:'rate',ico:'⏱',name:'はやうち',txt:'ぜんぶ +12% はやく うつ'},{k:'range',ico:'🔭',name:'ぼうえんきょう',txt:'しゃてい +10%'},{k:'crit',ico:'🎯',name:'ねらいうち',txt:'クリティカル +10%'},
  {k:'cost',ico:'🏗',name:'けんちく',txt:'たてる ねだん -12%'},{k:'hero',ico:'🗡',name:'ゆうしゃの けん',txt:'ゆうしゃ +40%'},{k:'bolt',ico:'🌩',name:'らいうん',txt:'⚡かみなり +30%'},{k:'combo',ico:'✨',name:'コンボの ひけつ',txt:'コンボ 1.5ばい'}];
// カード（ウェーブ クリアごとに 1まい えらぶ・かさなる）
var CARDS=[
  {k:'arrow',ico:'🏹',name:'ゆみの つる',txt:'🏹の ダメージ +25%',r:0},{k:'magic',ico:'🔮',name:'まほうの しょ',txt:'🔮の ダメージ +25%',r:0},
  {k:'ice',ico:'❄️',name:'ひょうが',txt:'❄️の ダメージ +25%・こおる じかん +50%',r:0},{k:'cannon',ico:'💣',name:'かやく',txt:'💣の ダメージ +15%・ばくはつ +20%',r:0},
  {k:'rate',ico:'⏱',name:'はやうち',txt:'ぜんぶの タワーが +12% はやく うつ',r:1},{k:'crit',ico:'🎯',name:'ねらいうち',txt:'クリティカル +10%（ぜんぶの タワー）',r:1},
  {k:'range',ico:'🔭',name:'ぼうえんきょう',txt:'しゃてい +10%',r:1},{k:'cost',ico:'🏗',name:'けんちく',txt:'タワーの ねだん -12%',r:1},
  {k:'interest',ico:'🏦',name:'りし',txt:'ウェーブ クリアで もっている 🪙の 10%（さいだい30）',r:1},{k:'hp',ico:'❤️',name:'しゅうり',txt:'おしろの ❤️ +5',r:0},
  {k:'bolt',ico:'🌩',name:'らいうん',txt:'⚡ +2・かみなり ダメージ +30%',r:1},{k:'hero',ico:'🗡',name:'ゆうしゃの けん',txt:'ゆうしゃの こうげき +40%',r:0},
  {k:'gold',ico:'💰',name:'おうごんの ほし',txt:'てきの コイン +1',r:2},{k:'combo',ico:'✨',name:'コンボの ひけつ',txt:'コンボの ボーナスが 1.5ばい',r:2}];
// ウェーブの じょうけん
var MODS=[{k:'fast',ico:'💨',name:'はやあし',txt:'てきが 25% はやい'},{k:'tough',ico:'🪨',name:'かたい',txt:'てきの たいりょく +30%・コイン +50%'},
  {k:'gold',ico:'🌟',name:'おうごん',txt:'コイン 2ばい！'},{k:'fog',ico:'🌫',name:'きり',txt:'タワーの しゃてい -15%'},{k:'swarm',ico:'🐜',name:'むれ',txt:'てきが 40% おおい・すこし よわい'}];
// Lv4 は 2つの みちから えらぶ（しんか）
var BR={
  arrow: [{key:'snipe',ico:'🎯',name:'スナイパー',desc:'とおく・いちげき 大',cost:80,dmg:15,rate:0.8,range:6.5,pierce:true},{key:'gat',ico:'🌀',name:'ガトリング',desc:'すごい れんしゃ',cost:80,dmg:2.2,rate:5,range:4.6}],
  magic: [{key:'thunder',ico:'⚡',name:'いかずち',desc:'5たいに れんさ',cost:80,dmg:9,rate:1.0,range:4.6,chain:5},{key:'curse',ico:'💀',name:'のろい',desc:'ダメージ+40%に する',cost:80,dmg:9,rate:1.1,range:4.6,curse:3}],
  ice:   [{key:'blizz',ico:'🌨',name:'ふぶき',desc:'ひろく おそくする',cost:80,dmg:3,rate:1.3,range:4.6,slow:0.7,splash:2.0},{key:'frost',ico:'🧊',name:'こおりづけ',desc:'ときどき とめる',cost:80,dmg:3.5,rate:1.3,range:4.4,slow:0.6,stop:0.3}],
  cannon:[{key:'meteor',ico:'☄',name:'メテオ',desc:'とても ひろい ばくはつ',cost:80,dmg:18,rate:0.35,range:5.0,splash:2.3},{key:'missile',ico:'🚀',name:'ミサイル',desc:'そらにも とどく',cost:80,dmg:8,rate:0.8,range:5.0,splash:1.2,air:true}]
};
// Lv5「きわみ」：Lv4の みちから さらに 2つに わかれる（ぜんぶで 16しゅ）
var B5={
  snipe:  [{key:'hawk',ico:'🦅',name:'ホークアイ',desc:'いちばん つよい てきを ねらう・よろい むし',cost:170,dmg:34,rate:0.75,range:8,pierce:true,force:1},
           {key:'dead',ico:'💀',name:'デッドショット',desc:'HPが 3わりの てきを いちげきで',cost:170,dmg:22,rate:0.9,range:7,exec:0.3}],
  gat:    [{key:'storm',ico:'🌪',name:'ストーム',desc:'2たいを どうじに うつ',cost:170,dmg:2.6,rate:7,range:5,multi:2},
           {key:'fire',ico:'🔥',name:'ほのおの や',desc:'もやして じわじわ ダメージ',cost:170,dmg:3,rate:5,range:4.8,burn:4}],
  thunder:[{key:'lord',ico:'👑',name:'ライトニングロード',desc:'8たいに れんさ',cost:170,dmg:12,rate:1.1,range:5,chain:8},
           {key:'tstorm',ico:'⛈',name:'かみなりぐも',desc:'4びょうごとに 3たいへ らくらい',cost:170,dmg:10,rate:1.0,range:5.2,chain:3,storm:3}],
  curse:  [{key:'death',ico:'☠',name:'デスカース',desc:'ダメージ +80%・たおすと まわりに うつる',cost:170,dmg:11,rate:1.1,range:4.8,curse:3,cmul:1.8,spread:1},
           {key:'soul',ico:'👻',name:'ソウルイーター',desc:'のろった てきは コイン +2',cost:170,dmg:12,rate:1.2,range:4.8,curse:3,soul:2}],
  blizz:  [{key:'zero',ico:'🧊',name:'ぜったいれいど',desc:'とても ひろく とても おそく',cost:170,dmg:5,rate:1.3,range:5,slow:0.8,splash:2.8},
           {key:'breath',ico:'🌬',name:'こおりの いき',desc:'5びょうごとに ぜんぶ こおらせる',cost:170,dmg:4,rate:1.3,range:4.8,slow:0.6,splash:1.6,nova:1.6}],
  frost:  [{key:'prison',ico:'⛓',name:'アイスプリズン',desc:'よく とめる・とまった てきは 2ばい ダメージ',cost:170,dmg:5,rate:1.4,range:4.6,slow:0.6,stop:0.55,prison:1},
           {key:'icicle',ico:'🔱',name:'つららの あめ',desc:'つららで はんい こうげき',cost:170,dmg:9,rate:1.1,range:4.8,slow:0.6,splash:1.6}],
  meteor: [{key:'bigm',ico:'🌋',name:'だいメテオ',desc:'ものすごく ひろい ばくはつ',cost:170,dmg:32,rate:0.3,range:5.6,splash:3.2},
           {key:'cluster',ico:'🎆',name:'クラスター',desc:'ばくだんが 5つに はじける',cost:170,dmg:16,rate:0.45,range:5.2,splash:1.6,cluster:5}],
  missile:[{key:'homing',ico:'🎯',name:'ホーミング',desc:'3はつ どうじ・そらにも',cost:170,dmg:9,rate:0.8,range:5.6,splash:1.2,air:true,multi:3},
           {key:'napalm',ico:'🔥',name:'ナパーム',desc:'もえる じめんを のこす・そらにも',cost:170,dmg:9,rate:0.8,range:5.4,splash:1.4,air:true,zone:3}]
};
function Lof(type,lv,br,br2){ if(lv>=5) return B5[BR[type][br||0].key][br2||0]; return lv>=4?BR[type][br||0]:TT[type].lv[lv-1]; }
// ペットの クラス（ペットの なまえで きまる）
var CLS=[
  {k:'knight',  ico:'🛡',name:'ナイト',      forms:['ナイト','パラディン','ホーリーロード'],       atk:4,  rate:1.4,range:1.6,spd:3.2,skill:'シールド バッシュ（まわりを きぜつ）',sk:8},
  {k:'mage',    ico:'🔥',name:'まほうつかい',forms:['まほうつかい','ウィザード','アークメイジ'],   atk:4.5,rate:0.9,range:3.6,spd:2.8,skill:'メテオ（ひろい ばくはつ）',sk:10},
  {k:'ranger',  ico:'🏹',name:'レンジャー',  forms:['レンジャー','ハンター','スターアーチャー'],   atk:1.8,rate:2.4,range:4.5,spd:3.6,skill:'やの あめ（たくさん うつ）',sk:9},
  {k:'support', ico:'🎵',name:'サポーター',  forms:['サポーター','バード','マエストロ'],           atk:2.2,rate:1.2,range:2.4,spd:3.0,skill:'おうえん（ちかくの タワーが はやく なる）',sk:12},
  {k:'assassin',ico:'🗡',name:'アサシン',    forms:['アサシン','シャドウ','カゲマスター'],         atk:2.6,rate:2.2,range:1.5,spd:4.2,skill:'かげぬい（てきを つぎつぎ きる）',sk:7,crit:0.3},
  {k:'dwarf',   ico:'🔨',name:'ドワーフ',    forms:['ドワーフ','ウォーロード','タイタン'],         atk:6,  rate:0.8,range:1.7,spd:2.6,skill:'じしん（まわりを きぜつ）',sk:9,cleave:1.1},
  {k:'fairy',   ico:'🧚',name:'ようせい',    forms:['ようせい','ピクシー','ようせいの おう'],       atk:2.2,rate:1.6,range:3.3,spd:3.8,skill:'いやし（おしろを なおし、てきを おそく）',sk:12}];
var FORM_MUL=[1,1.5,2.2], FORM_CD=[1,0.85,0.7];
// てきの しゅるい：hp＝きほんの なんばい、spd、sc＝おおきさ、coin、dmg＝おしろへの ダメージ、armor＝へらす ダメージ
var EICO={bm:'💣',sa:'🔧',gd:'🔰',nc:'💀',th:'🦝',sk:'🦴',kn:'👑',tr:'🧌',gh:'👻',sp:'🕷',spl:'🕷',flag:'🚩',cham:'🦎',fb:'🔥',n:'🪖',f:'👺',b:'👹',sh:'🛡',fly:'🦇',heal:'🧙',sl:'🟢',sl2:'🟢',mo:'🦔',go:'🗿',ra:'🐀',boss:'👑'}, TICO={arrow:'🏹',magic:'🔮',ice:'❄️',cannon:'💣',hero:'🐾'};
var ET={
  n:   {name:'へいし',     hp:1,  spd:1.5, sc:1.2, coin:1, dmg:1, weak:{}, role:'ふつう'},
  f:   {name:'はしりや',   hp:0.6,spd:2.6, sc:1.05,coin:1, dmg:1, weak:{ice:1.5}, role:'はやい'},
  b:   {name:'おおおとこ', hp:5,  spd:1.0, sc:1.35,coin:4, dmg:3, weak:{ice:1.5,cannon:0.7}, role:'かたい'},
  sh:  {name:'よろい',     hp:2.2,spd:1.25,sc:1.25,coin:3, dmg:2, armor:2, weak:{magic:2,arrow:0.5}, role:'かたい'},
  fly: {name:'コウモリ',   hp:0.8,spd:2.0, sc:1,   coin:2, dmg:1, air:true, weak:{arrow:1.5}, role:'そら'},
  heal:{name:'まじゅつし', hp:1.6,spd:1.3, sc:1.2, coin:3, dmg:1, heal:true, weak:{arrow:1.5,magic:1.3}, role:'しえん'},
  sl:  {name:'スライム',   hp:1.4,spd:1.2, sc:1.3, coin:1, dmg:1, split:true, army:'sl', hop:true, weak:{cannon:1.8,arrow:0.6}, role:'ふえる'},
  sl2: {name:'こスライム', hp:0.45,spd:1.8,sc:0.75,coin:1, dmg:1, army:'sl', hop:true, weak:{cannon:1.8}},
  mo:  {name:'モグラ',     hp:1.6,spd:1.5, sc:1.15,coin:2, dmg:1, dig:true, weak:{ice:1.5}, role:'とくしゅ'},
  go:  {name:'ゴーレム',   hp:7,  spd:0.8, sc:1.5, coin:5, dmg:3, weak:{arrow:1.4,magic:0.5,cannon:1.2}, role:'かたい'},
  ra:  {name:'ネズミ',     hp:0.35,spd:3.0,sc:0.75,coin:1, dmg:1, weak:{cannon:2,ice:1.5}, role:'はやい'},
  gh:  {name:'ゴースト',   hp:1.3,spd:1.4, sc:1.2, coin:2, dmg:1, weak:{magic:1.5}, ghost:true, role:'とくしゅ'},
  sp:  {name:'クモ',       hp:2.2,spd:1.15,sc:1.2, coin:3, dmg:1, weak:{cannon:1.5,ice:1.3}, egg:true, role:'ふえる'},
  spl: {name:'こグモ',     hp:0.3,spd:2.4, sc:0.6, coin:0, dmg:1, army:'sp', weak:{cannon:1.5}},
  flag:{name:'はたもち',   hp:1.8,spd:1.25,sc:1.2, coin:3, dmg:1, weak:{arrow:1.5}, flag:true, role:'しえん'},
  cham:{name:'カメレオン', hp:1.5,spd:1.6, sc:1.1, coin:3, dmg:1, weak:{ice:1.5}, hide:true, role:'とくしゅ'},
  fb:  {name:'ひのとり',   hp:0.9,spd:2.3, sc:1,   coin:2, dmg:1, air:true, weak:{arrow:1.5,ice:1.5}, role:'そら'},
  kn:  {name:'おうごんきし', hp:9,  spd:0.9, sc:1.55,coin:6, dmg:3, armor:4, army:'kn', weak:{magic:1.6,cannon:0.7}, role:'かたい'},
  tr:  {name:'トロール',   hp:7,  spd:1.0, sc:1.45,coin:5, dmg:3, regen:0.06, army:'tr', weak:{cannon:1.3,arrow:1.2}, role:'かたい'},
  bm:  {name:'じばくへい', hp:1.3,spd:1.6, sc:1.2, coin:2, dmg:3, bomb:true, weak:{arrow:1.4}, role:'とくしゅ'},
  sa:  {name:'こわしや',   hp:2.2,spd:1.3, sc:1.2, coin:3, dmg:1, sapper:true, weak:{ice:1.4,magic:1.2}, role:'とくしゅ'},
  gd:  {name:'まもりて',   hp:2.0,spd:1.2, sc:1.2, coin:3, dmg:1, guard:true, weak:{cannon:1.5}, role:'しえん'},
  nc:  {name:'ネクロマンサー',hp:2.6,spd:1.1,sc:1.2, coin:4, dmg:2, necro:true, weak:{arrow:1.3,magic:0.7}, role:'しえん'},
  th:  {name:'どろぼう',   hp:1.1,spd:2.5, sc:1.1, coin:3, dmg:1, thief:true, weak:{ice:1.6}, role:'はやい'},
  sk:  {name:'ガイコツ',   hp:0.6,spd:1.6, sc:1.1, coin:0, dmg:1, weak:{cannon:1.5}, role:'ふつう'},
  boss:{name:'ボス',       hp:45, spd:0.65,sc:1,   coin:30,dmg:10,armor:1}
};

function start(opt){
  stop();
  var GX=window.WAR_GFX, P=GX.part, M=GX.merge;
  var root=opt.container; root.innerHTML='';
  root.style.cssText='position:fixed;inset:0;z-index:200;overflow:hidden;background:#3f8f4a;touch-action:none;user-select:none;-webkit-user-select:none;';
  var renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
  root.appendChild(renderer.domElement); renderer.domElement.style.cssText='display:block;width:100%;height:100%;';
  GX.setup(renderer);
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  // マップ（ステージで かわる）：みどり → ゆき → さばく
  var MAPS=[
    {name:'みどりの おか',bg:0x8fcbe8,g:[0.29,0.55,0.42],path:'#e6c893',dot:['rgba(160,120,70,.25)','rgba(255,245,220,.35)'],edge:'#9c7a4c',cliff:'#8b8f96',cliff2:'#7b7f86',top:'#4f9e55',tree:'green',water:0x4fa3d9,
     pts:[[-3.8,-17],[-3.8,-10.5],[0,-9.6],[3.9,-8],[4,-3.2],[0.5,-1.4],[-3.9,0.2],[-4,4.6],[-0.5,6.2],[3.6,7.6],[3.4,11],[0.6,12.4],[0,14.2]]},
    {name:'ゆきの やま',bg:0xc8dff0,g:[0.58,0.3,0.86],path:'#dbe7f3',dot:['rgba(120,150,190,.25)','rgba(255,255,255,.6)'],edge:'#8aa3bd',cliff:'#9aa7b8',cliff2:'#8795a8',top:'#f8fafc',tree:'snow',water:0xbfe6ff,
     pts:[[3.8,-17],[3.8,-11],[0,-10],[-3.9,-8.4],[-4,-4],[-0.5,-2.6],[3.9,-1],[4,3.6],[0.5,5],[-3.7,6.8],[-3.4,11],[-0.6,12.4],[0,14.2]]},
    {name:'すなの さばく',bg:0xf1d9a8,g:[0.1,0.55,0.66],path:'#b98352',dot:['rgba(110,60,20,.25)','rgba(255,220,170,.3)'],edge:'#7c4a24',cliff:'#c47a45',cliff2:'#a8633a',top:'#e2a46a',tree:'cactus',water:0x2fb5e8,
     paths:[[[0,-17],[0,-12.5],[-3.8,-11],[-4.2,-6],[-1.3,-3.6],[-4.2,-0.5],[-4.2,5],[-1.6,9.5],[0,11.5],[0,14.2]],
            [[0,-17],[0,-12.5],[3.8,-11],[4.2,-6],[4.2,-1.2],[1.3,1.6],[4.2,4.2],[1.6,9.5],[0,11.5],[0,14.2]]]},
    {name:'ほのおの やま',bg:0x7c2d12,g:[0.03,0.22,0.24],path:'#6b5647',dot:['rgba(30,20,20,.3)','rgba(255,140,60,.25)'],edge:'#f97316',cliff:'#3f3a3a',cliff2:'#2d2828',top:'#ea580c',tree:'lava',water:0xff6a1a,dark:0.8,amb:0xfb923c,
     pts:[[-3.8,-17],[-3.8,-12],[3.8,-10],[3.8,-6],[-3.8,-4],[-3.8,0.5],[3.8,2.4],[3.8,6.5],[-1.5,8.6],[-0.6,11.5],[0,14.2]]},
    {name:'まおうの しろ',bg:0x1e1b4b,g:[0.72,0.28,0.24],path:'#8b8aa0',dot:['rgba(40,30,70,.3)','rgba(200,190,255,.2)'],edge:'#4c1d95',cliff:'#3b3355',cliff2:'#2e2745',top:'#6d28d9',tree:'dead',water:0x7c3aed,dark:0.55,amb:0xc4b5fd,
     paths:[[[0,-17],[0,-13],[-4.2,-11],[-4.2,-7],[-0.8,-5.5],[-4.2,-2],[-4.2,3],[-1.2,5.2],[-3.6,8.2],[-1,11],[0,14.2]],
            [[0,-17],[0,-13],[4.2,-11],[4.2,-5],[1.2,-2.2],[4.2,0.8],[4.2,6],[1.3,8.2],[1,11],[0,14.2]]]}];
  // ワールド（5ステージで 1ワールド。5ステージめは ワールドの ボス）
  var STG=Math.max(1,opt.stage||1), WPS=8, WORLD=((Math.ceil(STG/WPS)-1)%5)+1, SUB=(STG-1)%WPS+1, LOOP=Math.floor((STG-1)/(WPS*5));
  var MP=MAPS[WORLD-1];
  var scene=new THREE.Scene(); scene.fog=new THREE.Fog(MP.bg,45,80);
  scene.background=GX.canvasTex(4,256,function(c2,w,h){ var gr=c2.createLinearGradient(0,0,0,h), b=new THREE.Color(MP.bg); gr.addColorStop(0,'#'+b.clone().multiplyScalar(0.75).getHexString()); gr.addColorStop(0.6,'#'+b.getHexString()); gr.addColorStop(1,'#'+b.clone().lerp(new THREE.Color(0xffffff),0.4).getHexString()); c2.fillStyle=gr; c2.fillRect(0,0,w,h); });
  var cam=new THREE.PerspectiveCamera(50,1,0.1,200);
  var DK=MP.dark||1; var hemi; scene.add(hemi=new THREE.HemisphereLight(MP.tree==='dead'?0xc7d2fe:MP.tree==='lava'?0xffd7b0:0xf4f9ff,0x4d6e3f,0.8*DK));
  var key=new THREE.DirectionalLight(MP.tree==='dead'?0xa5b4fc:MP.tree==='lava'?0xffb070:0xffedd0,1.05*DK); key.position.set(-9,20,8); scene.add(key); scene.add(key.target);
  key.castShadow=true; key.shadow.mapSize.set(2048,2048); var kc=key.shadow.camera; kc.left=-15; kc.right=15; kc.top=19; kc.bottom=-19; kc.near=1; kc.far=60; key.shadow.bias=-0.0008; key.shadow.normalBias=0.03; key.shadow.radius=3;
  var fill=new THREE.DirectionalLight(0xc7e3ff,0.25); fill.position.set(8,6,12); scene.add(fill);
  R={renderer:renderer,scene:scene,root:root,raf:0};
  var lam=new THREE.MeshLambertMaterial({vertexColors:true});

  // --- みち（くねくね） ---
  // よこの いりぐち：ステージが すすむと ひらく（ひらく まえは うすく みえる・たてられない）
  var BASEP=(MP.paths||[MP.pts]), MAIN=BASEP[0], SIDES=[];
  [[-1,[-6,-3,-8,-4,-1][WORLD-1]],[1,[2,-6,1,3,-3][WORLD-1]]].forEach(function(sd,si){ var sx=sd[0]*14, sz=sd[1], tail=MAIN.filter(function(p){ return p[1]>sz+7; });
    SIDES.push([[sx,sz],[sx*0.78,sz+0.6],[sx*0.62,sz+2.6+si],[sx*0.56,sz+5],[sx*0.42,sz+6.6]].concat(tail)); });
  var OPEN=BASEP.length+(SUB>=3?1:0)+(SUB>=6?1:0);
  var NS=600, PATHS=BASEP.concat(SIDES).map(function(pp){ var q=pp.map(function(p){ return [p[0],p[1]*0.8]; });   // たてながの がめんに おさまるように
    var cv=new THREE.CatmullRomCurve3(q.map(function(p){ return new THREE.Vector3(p[0],0,p[1]); }),false,'catmullrom',0.3); return {pts:q,len:cv.getLength(),samp:cv.getSpacedPoints(NS)}; });
  var PTS=PATHS[0].pts, PLEN=PATHS[0].len, samp=PATHS[0].samp;
  function atS(s,pi){ var PP=PATHS[pi||0], sm=PP.samp, f=Math.max(0,Math.min(1,s/PP.len))*NS, i=Math.min(NS-1,Math.floor(f)), k=f-i, a=sm[i], b=sm[i+1];
    return {x:a.x+(b.x-a.x)*k, z:a.z+(b.z-a.z)*k, dx:b.x-a.x, dz:b.z-a.z}; }
  function distToPath(x,z){ var m=1e9; PATHS.forEach(function(PP){ var sm=PP.samp; for(var i=0;i<=NS;i+=3){ var d=(sm[i].x-x)*(sm[i].x-x)+(sm[i].z-z)*(sm[i].z-z); if(d<m) m=d; } }); return Math.sqrt(m); }

  // たてる ばしょ（みちの そば）
  var pads=[];
  (function(){ var cand=[];
    PATHS.forEach(function(PP,pi){ for(var s=4;s<PP.len-4;s+=1.2){ var p=atS(s,pi), l=Math.hypot(p.dx,p.dz)||1, nx=-p.dz/l, nz=p.dx/l;
      [1,-1].forEach(function(sd){ cand.push({x:p.x+nx*2.25*sd,z:p.z+nz*2.25*sd,s:s}); }); } });
    cand.sort(function(){ return Math.random()-0.5; });
    cand.forEach(function(c3){ if(pads.length>=2) return; if(Math.abs(c3.x)>6.6||c3.z<-11.8||c3.z>9.8) return;
      if(distToPath(c3.x,c3.z)<2.0) return; if(pads.some(function(q){ return Math.hypot(q.x-c3.x,q.z-c3.z)<5.0; })) return;
      pads.push({x:c3.x,z:c3.z,lv:0,type:null,cd:0,mesh:null,aim:0,spent:0,prio:0}); });
    pads.slice(0,2).forEach(function(q){ q.high=true; });   // たかだい：しゃてい +25%
  })();
  function nearPad(x,z,r){ return pads.some(function(p){ return Math.hypot(p.x-x,p.z-z)<r; }); }
  var CS={x:0,z:12.4}, g0=PTS[0];
  var pond={x:6.3,z:1.8,r:1.5}; if(distToPath(pond.x,pond.z)<pond.r+1.3||nearPad(pond.x,pond.z,pond.r+1.2)) pond=null;

  // じめん（くさの いろむら）
  (function ground(){
    var g=new THREE.PlaneGeometry(56,60,112,120); g.rotateX(-Math.PI/2);
    var pos=g.attributes.position, col=new Float32Array(pos.count*3), c=new THREE.Color();
    for(var i=0;i<pos.count;i++){ var x=pos.getX(i), z=pos.getZ(i)-1, d=distToPath(x,z);
      var n=Math.sin(x*1.3)*Math.cos(z*1.1)*0.5+Math.sin(x*0.4+z*0.7)*0.5+Math.sin(x*3.1+z*2.3)*0.15;
      c.setHSL(MP.g[0]+n*0.02,MP.g[1],MP.g[2]+n*0.045); if(d<2.4) c.multiplyScalar(0.78+0.22*Math.max(0,Math.min(1,(d-1.2)/1.2)));
      if(pond){ var pd=Math.hypot(x-pond.x,z-pond.z); if(pd<pond.r+0.5) c.multiplyScalar(0.85); }
      col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; }
    g.setAttribute('color',new THREE.BufferAttribute(col,3));
    var gtex=GX.canvasTex(256,256,function(c2,w,h){ c2.fillStyle='#ffffff'; c2.fillRect(0,0,w,h);
      for(var k=0;k<2600;k++){ var x=Math.random()*w, y=Math.random()*h, v=Math.random();
        if(MP.tree==='green'){ c2.strokeStyle=v<0.5?'rgba(40,90,30,.22)':'rgba(255,255,220,.22)'; c2.lineWidth=1.2; c2.beginPath(); c2.moveTo(x,y); c2.lineTo(x+rnd(-2,2),y-rnd(3,7)); c2.stroke(); }
        else if(MP.tree==='snow'){ c2.fillStyle=v<0.5?'rgba(150,180,220,.18)':'rgba(255,255,255,.5)'; c2.beginPath(); c2.arc(x,y,rnd(0.6,2.2),0,7); c2.fill(); }
        else if(MP.tree==='lava'){ c2.fillStyle=v<0.85?'rgba(20,10,10,.25)':'rgba(255,120,40,.5)'; c2.fillRect(x,y,rnd(1,4),rnd(1,2)); }
        else if(MP.tree==='dead'){ c2.fillStyle=v<0.6?'rgba(20,10,40,.25)':'rgba(200,180,255,.2)'; c2.beginPath(); c2.arc(x,y,rnd(0.6,1.8),0,7); c2.fill(); }
        else { c2.fillStyle=v<0.5?'rgba(150,90,40,.2)':'rgba(255,235,200,.3)'; c2.fillRect(x,y,rnd(1,3),1); } } });
    gtex.wrapS=gtex.wrapT=THREE.RepeatWrapping; gtex.repeat.set(11,13);
    var m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,map:gtex})); m.position.z=-1; m.receiveShadow=true; scene.add(m);
    // みちの おび（ふち＋すなの もよう）
    var sandTex=GX.canvasTex(128,256,function(c2,w,h){ c2.fillStyle=MP.path; c2.fillRect(0,0,w,h);
      for(var k=0;k<500;k++){ var v=Math.random(); c2.fillStyle=v<0.5?MP.dot[0]:MP.dot[1]; c2.beginPath(); c2.arc(Math.random()*w,Math.random()*h,0.8+Math.random()*2.2,0,7); c2.fill(); }
      c2.fillStyle='rgba(150,110,60,.18)'; c2.fillRect(0,0,10,h); c2.fillRect(w-10,0,10,h);
      c2.fillStyle='rgba(120,90,50,.25)'; for(var y=0;y<h;y+=32){ c2.fillRect(w*0.3,y,6,14); c2.fillRect(w*0.64,y+14,6,14); } });   // あしあと
    sandTex.wrapS=sandTex.wrapT=THREE.RepeatWrapping;
    function strip(wd,y,mat,samp,PLEN){ var pos2=[], idx=[], uvs=[];
      for(var i=0;i<=NS;i++){ var a=samp[Math.max(0,i-1)], b=samp[Math.min(NS,i+1)], dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz)||1, nx=-dz/l*wd, nz=dx/l*wd;
        pos2.push(samp[i].x+nx,y,samp[i].z+nz, samp[i].x-nx,y,samp[i].z-nz); var v=i/NS*PLEN/2.2; uvs.push(0,v,1,v); if(i<NS) idx.push(i*2,i*2+1,i*2+2, i*2+1,i*2+3,i*2+2); }
      var sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute(pos2,3)); sg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); var ax=pos2[3]-pos2[0], az=pos2[5]-pos2[2], bx=pos2[6]-pos2[0], bz=pos2[8]-pos2[2]; if(az*bx-ax*bz<0){ for(var ii=0;ii<idx.length;ii+=3){ var tt=idx[ii+1]; idx[ii+1]=idx[ii+2]; idx[ii+2]=tt; } }   // うえ むきの めんに そろえる
      sg.setIndex(idx); var nrm=new Float32Array(pos2.length); for(var ni=1;ni<nrm.length;ni+=3) nrm[ni]=1; sg.setAttribute('normal',new THREE.BufferAttribute(nrm,3));   // みちは まっすぐ うえ むき（すじが でない）
      mat.side=THREE.FrontSide; mat.polygonOffset=true; mat.polygonOffsetFactor=-y*40; mat.polygonOffsetUnits=-y*40;
      var sm=new THREE.Mesh(sg,mat); sm.receiveShadow=true; scene.add(sm); }
    var edgeM=new THREE.MeshLambertMaterial({color:MP.edge,emissive:MP.tree==='lava'?0xc2410c:0x000000}), roadM=new THREE.MeshLambertMaterial({map:sandTex});
    PATHS.forEach(function(PP,pi){ var m=edgeM.clone(); if(pi>=OPEN){ m.transparent=true; m.opacity=0.35; } strip(1.25,0.04,m,PP.samp,PP.len); });
    PATHS.forEach(function(PP,pi){ var m=roadM.clone(); if(pi>=OPEN){ m.transparent=true; m.opacity=0.3; } strip(1.02,0.16,m,PP.samp,PP.len); });
  })();

  // かざり（がけ・き・いし・はな・くさ・いけ・おしろ・もん）→ 1つに まとめる
  var DEC=[];
  var OBST=[], CLIFF=[[-12.6,-10,3,4.2,7],[12.4,-4,2.6,3.2,6],[-12.3,5,2.4,2.6,8],[12.6,10,2.2,3.6,6],[-8,-17,14,2.5,2.5],[8,-16.5,9,3.5,2.5]];
  CLIFF.forEach(function(c2){
    DEC.push(P(new THREE.BoxGeometry(c2[2],c2[3],c2[4]),MP.cliff,c2[0],c2[3]/2,c2[1]));
    DEC.push(P(new THREE.BoxGeometry(c2[2]*0.7,c2[3]*0.5,0.2),MP.cliff2,c2[0],c2[3]*0.4,c2[1]+c2[4]/2+0.05));
    DEC.push(P(new THREE.BoxGeometry(c2[2]+0.14,0.4,c2[4]+0.14),MP.top,c2[0],c2[3]+0.12,c2[1])); });
  function freeSpot(x,z,r){ return distToPath(x,z)>r+1.2&&!nearPad(x,z,r+0.9)&&Math.hypot(x-CS.x,z-CS.z)>3.3&&!(pond&&Math.hypot(x-pond.x,z-pond.z)<pond.r+0.6); }
  for(var t=0;t<90;t++){ var tx=rnd(-13.5,13.5), tz=rnd(-16,15); if(!freeSpot(tx,tz,0.9)) continue; if(Math.abs(tx)<7&&distToPath(tx,tz)<3.2) continue; if(OBST.some(function(o){ return Math.hypot(o.x-tx,o.z-tz)<1.2; })) continue; var h=rnd(0.8,1.5), kind=Math.random(); OBST.push({x:tx,z:tz,r:0.75});
    if(MP.tree==='cactus'){ DEC.push(P(new THREE.CylinderGeometry(0.22*h,0.25*h,1.5*h,8),'#4d7c3a',tx,0.75*h,tz), P(new THREE.SphereGeometry(0.22*h,8,6),'#4d7c3a',tx,1.5*h,tz),
        P(new THREE.CylinderGeometry(0.12*h,0.12*h,0.6*h,6),'#5a8a44',tx+0.35*h,0.9*h,tz), P(new THREE.CylinderGeometry(0.12*h,0.12*h,0.3*h,6),'#5a8a44',tx+0.2*h,0.7*h,tz,1,1,1,0,0,Math.PI/2),
        P(new THREE.CylinderGeometry(0.1*h,0.1*h,0.5*h,6),'#5a8a44',tx-0.33*h,1.1*h,tz), P(new THREE.CylinderGeometry(0.1*h,0.1*h,0.25*h,6),'#5a8a44',tx-0.2*h,0.9*h,tz,1,1,1,0,0,Math.PI/2)); continue; }
    if(MP.tree==='lava'){ if(kind<0.5){ DEC.push(P(new THREE.ConeGeometry(0.45*h,1.8*h,5),'#292524',tx,0.9*h,tz), P(new THREE.ConeGeometry(0.2*h,0.5*h,5),'#f97316',tx,1.75*h,tz)); }
        else { DEC.push(P(new THREE.CylinderGeometry(0.06,0.12,1.2*h,5),'#1c1917',tx,0.6*h,tz), P(new THREE.CylinderGeometry(0.04,0.05,0.6*h,4),'#1c1917',tx+0.2*h,1.0*h,tz,1,1,1,0,0,-0.8), P(new THREE.CylinderGeometry(0.03,0.04,0.5*h,4),'#1c1917',tx-0.18*h,0.8*h,tz,1,1,1,0,0,0.9)); } continue; }
    if(MP.tree==='dead'){ if(kind<0.6){ DEC.push(P(new THREE.CylinderGeometry(0.07,0.14,1.3*h,5),'#3b2f4a',tx,0.65*h,tz), P(new THREE.CylinderGeometry(0.035,0.05,0.7*h,4),'#3b2f4a',tx+0.25*h,1.1*h,tz,1,1,1,0,0,-0.9), P(new THREE.CylinderGeometry(0.03,0.045,0.6*h,4),'#3b2f4a',tx-0.22*h,0.95*h,tz,1,1,1,0,0,1.0), P(new THREE.SphereGeometry(0.08,6,4),'#a855f7',tx+0.5*h,1.3*h,tz)); }
        else { DEC.push(P(new THREE.BoxGeometry(0.45,0.6,0.14),'#57534e',tx,0.3,tz), P(new THREE.CylinderGeometry(0.22,0.22,0.14,10,1,false,0,Math.PI),'#57534e',tx,0.6,tz,1,1,1,Math.PI/2,0,Math.PI/2), P(new THREE.SphereGeometry(0.12,6,4),'#c084fc',tx+0.4,0.1,tz+0.2,1,0.6,1)); } continue; }
    DEC.push(P(new THREE.CylinderGeometry(0.1,0.14,0.55,6),'#7a5230',tx,0.27,tz));
    if(MP.tree==='snow'){ DEC.push(P(new THREE.ConeGeometry(0.62*h,1.1*h,7),'#2f6b4f',tx,0.55+0.5*h,tz), P(new THREE.ConeGeometry(0.45*h,0.5*h,7),'#f8fafc',tx,0.55+0.8*h,tz), P(new THREE.ConeGeometry(0.46*h,0.9*h,7),'#357a5a',tx,0.55+1.05*h,tz), P(new THREE.ConeGeometry(0.3*h,0.4*h,7),'#ffffff',tx,0.55+1.35*h,tz)); continue; }
    if(kind<0.6){ DEC.push(P(new THREE.ConeGeometry(0.6*h,1.1*h,7),'#2f7d3b',tx,0.55+0.5*h,tz), P(new THREE.ConeGeometry(0.45*h,0.9*h,7),'#3c9a48',tx,0.55+1.05*h,tz)); }
    else { DEC.push(P(new THREE.IcosahedronGeometry(0.6*h,0),'#3f9448',tx,0.6+0.5*h,tz), P(new THREE.IcosahedronGeometry(0.4*h,0),'#4fae57',tx+0.25*h,0.75+0.7*h,tz-0.1)); } }
  for(var k=0;k<260;k++){ var fx0=rnd(-13,13), fz0=rnd(-15,14); if(!freeSpot(fx0,fz0,-0.6)) continue; var r0=Math.random();
    if(MP.tree!=='green'){ if(r0<0.6) DEC.push(P(new THREE.DodecahedronGeometry(rnd(0.12,0.32),0),({snow:'#ffffff',cactus:'#d9a066',lava:'#44403c',dead:'#4b4563'})[MP.tree],fx0,0.05,fz0,1,0.5,1)); else DEC.push(P(new THREE.DodecahedronGeometry(rnd(0.12,0.3),0),({snow:'#94a3b8',cactus:'#a16a3c',lava:'#f97316',dead:'#7c3aed'})[MP.tree],fx0,0.05,fz0,1,0.6,1)); continue; }
    if(r0<0.45) DEC.push(P(new THREE.ConeGeometry(0.08,0.28,4),'#2d8a3c',fx0,0.14,fz0), P(new THREE.ConeGeometry(0.07,0.22,4),'#3aa14a',fx0+0.1,0.11,fz0+0.05));
    else if(r0<0.75) DEC.push(P(new THREE.SphereGeometry(0.07,5,4),['#fde047','#f472b6','#ffffff','#a78bfa'][k%4],fx0,0.14,fz0), P(new THREE.CylinderGeometry(0.015,0.015,0.14,3),'#2d8a3c',fx0,0.07,fz0));
    else DEC.push(P(new THREE.DodecahedronGeometry(rnd(0.12,0.3),0),'#9ca3af',fx0,0.05,fz0,1,0.6,1)); }
  PATHS.forEach(function(PP,pi){ for(var s2=2;s2<PP.len-2;s2+=0.9){ var q=atS(s2,pi), l2=Math.hypot(q.dx,q.dz)||1; [1,-1].forEach(function(sd){ if(Math.random()<0.55) return; var d2=1.25+Math.random()*0.15;
      DEC.push(P(new THREE.DodecahedronGeometry(rnd(0.1,0.18),0),Math.random()<0.5?'#a8a29e':'#8d8781',q.x-q.dz/l2*d2*sd,0.06,q.z+q.dx/l2*d2*sd,1,0.6,1)); }); } });
  if(pond){ DEC.push(P(new THREE.CylinderGeometry(pond.r+0.25,pond.r+0.35,0.1,24),'#8d8781',pond.x,0.02,pond.z));
    for(var pr=0;pr<5;pr++){ var pa=pr/5*6.28+0.4; DEC.push(P(new THREE.ConeGeometry(0.06,0.5,4),'#3f7f3a',pond.x+Math.cos(pa)*(pond.r+0.25),0.25,pond.z+Math.sin(pa)*(pond.r+0.25))); } }
  // てきの もん
  DEC.push(P(new THREE.BoxGeometry(3.6,2.0,1.2),'#57534e',g0[0],1.0,g0[1]+1), P(new THREE.BoxGeometry(1.7,1.5,1.25),'#1c1917',g0[0],0.75,g0[1]+1.02));
  [-1.5,1.5].forEach(function(o){ DEC.push(P(new THREE.CylinderGeometry(0.55,0.6,2.8,8),'#44403c',g0[0]+o,1.4,g0[1]+1), P(new THREE.ConeGeometry(0.75,1.2,8),'#991b1b',g0[0]+o,3.4,g0[1]+1),
    P(new THREE.ConeGeometry(0.08,0.4,5),'#f5f5f4',g0[0]+o-0.3,2.2,g0[1]+1.55,1,1,1,1.3,0,0.4), P(new THREE.ConeGeometry(0.08,0.4,5),'#f5f5f4',g0[0]+o+0.3,2.2,g0[1]+1.55,1,1,1,1.3,0,-0.4)); });
  for(var ci=0;ci<5;ci++) DEC.push(P(new THREE.BoxGeometry(0.4,0.35,0.4),'#57534e',g0[0]-1.2+ci*0.6,2.15,g0[1]+1));
  // おしろ
  DEC.push(P(new THREE.BoxGeometry(5.2,1.5,2.8),'#e7e0d0',CS.x,0.75,CS.z), P(new THREE.BoxGeometry(1.4,1.2,0.1),'#5b3a1e',CS.x,0.6,CS.z-1.42), P(new THREE.CylinderGeometry(0.7,0.7,0.1,12,1,false,0,Math.PI),'#5b3a1e',CS.x,1.2,CS.z-1.42,1,1,1,Math.PI/2,0,Math.PI/2));
  for(var cb=0;cb<9;cb++) DEC.push(P(new THREE.BoxGeometry(0.34,0.3,0.34),'#f1ece1',CS.x-2.4+cb*0.6,1.65,CS.z-1.25));
  [[-2.5,-1.3],[2.5,-1.3],[-2.5,1.3],[2.5,1.3]].forEach(function(o){ DEC.push(P(new THREE.CylinderGeometry(0.65,0.72,2.9,12),'#f4efe4',CS.x+o[0],1.45,CS.z+o[1]), P(new THREE.CylinderGeometry(0.78,0.78,0.2,12),'#d6cfbf',CS.x+o[0],2.95,CS.z+o[1]), P(new THREE.ConeGeometry(0.88,1.4,12),'#2563eb',CS.x+o[0],3.75,CS.z+o[1]), P(new THREE.BoxGeometry(0.18,0.3,0.05),'#3b2f22',CS.x+o[0],2.1,CS.z+o[1]-0.68)); });
  DEC.push(P(new THREE.BoxGeometry(2.2,2.2,1.6),'#f4efe4',CS.x,2.6,CS.z+0.3), P(new THREE.ConeGeometry(1.6,1.6,4),'#1d4ed8',CS.x,4.5,CS.z+0.3,1,1,1,0,Math.PI/4,0));
  DEC.push(P(new THREE.BoxGeometry(0.5,0.6,0.05),'#fbbf24',CS.x,2.9,CS.z-0.52), P(new THREE.BoxGeometry(0.3,0.3,0.06),'#1d4ed8',CS.x,2.9,CS.z-0.53));
  var decM=new THREE.Mesh(M(DEC),lam); decM.castShadow=true; decM.receiveShadow=true; scene.add(decM);
  // いけ（みずが ゆれる）
  var water=null; if(pond){ water=new THREE.Mesh(new THREE.CircleGeometry(pond.r,32),new THREE.MeshLambertMaterial({color:MP.water,transparent:true,opacity:0.9,emissive:MP.tree==='lava'?0xc2410c:MP.tree==='dead'?0x4c1d95:0x000000})); water.rotation.x=-Math.PI/2; water.position.set(pond.x,0.09,pond.z); scene.add(water);
    var shine=new THREE.Mesh(new THREE.RingGeometry(pond.r*0.3,pond.r*0.42,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.3})); shine.rotation.x=-Math.PI/2; shine.position.set(pond.x-0.3,0.1,pond.z-0.2); scene.add(shine); water.userData.shine=shine; }
  // おしろの はた（ゆれる）
  var flags=[]; [[-2.5,-1.3],[2.5,-1.3],[0,0.3]].forEach(function(o,i){ var fg=new THREE.Group(); fg.position.set(CS.x+o[0],i===2?5.3:4.45,CS.z+o[1]);
    var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1,4),new THREE.MeshLambertMaterial({color:0x555555})); pole.position.y=0.5; fg.add(pole);
    var fl=new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.42,6,1),new THREE.MeshLambertMaterial({color:i===2?0xfbbf24:0x60a5fa,side:THREE.DoubleSide})); fl.position.set(0.36,0.78,0); fg.add(fl); scene.add(fg); flags.push(fl); fl.userData.base=fl.geometry.attributes.position.array.slice(); });
  // もんの うずまき（ひかる）
  var portal=new THREE.Mesh(new THREE.CircleGeometry(0.8,24),new THREE.MeshBasicMaterial({map:GX.canvasTex(128,128,function(c2,w,h){ var r2=c2.createRadialGradient(64,64,4,64,64,64); r2.addColorStop(0,'rgba(255,120,255,1)'); r2.addColorStop(0.5,'rgba(140,40,200,.9)'); r2.addColorStop(1,'rgba(40,0,60,1)'); c2.fillStyle=r2; c2.fillRect(0,0,w,h);
      c2.strokeStyle='rgba(255,200,255,.6)'; c2.lineWidth=4; for(var a=0;a<3;a++){ c2.beginPath(); for(var tt=0;tt<40;tt++){ var an=a*2.1+tt*0.2, rr=tt*1.5; c2.lineTo(64+Math.cos(an)*rr,64+Math.sin(an)*rr); } c2.stroke(); } })}));
  portal.position.set(g0[0],0.8,g0[1]+1.66); scene.add(portal);
  var sidePortals=[]; PATHS.forEach(function(PP,pi){ if(pi<BASEP.length) return; var st=PP.pts[0], open=pi<OPEN;
    var gm=new THREE.Mesh(M([P(new THREE.BoxGeometry(0.5,2.2,2.6),open?'#57534e':'#9ca3af',0,1.1,0),P(new THREE.ConeGeometry(0.5,0.9,6),open?'#991b1b':'#9ca3af',0,2.6,-1.1),P(new THREE.ConeGeometry(0.5,0.9,6),open?'#991b1b':'#9ca3af',0,2.6,1.1)]),lam);
    gm.position.set(st[0]+(st[0]<0?-0.4:0.4),0,st[1]); scene.add(gm);
    if(open){ var pm=portal.clone(); pm.material=portal.material; pm.rotation.y=st[0]<0?Math.PI/2:-Math.PI/2; pm.position.set(st[0]+(st[0]<0?-0.1:0.1),0.8,st[1]); scene.add(pm); sidePortals.push(pm); } });
  // たてる ばしょの まる
  var padGeo=M([P(new THREE.CylinderGeometry(0.9,1.0,0.16,20),'#b9a27a',0,0.08,0),P(new THREE.CylinderGeometry(0.78,0.78,0.04,20),'#cdb88f',0,0.17,0)]);
  var ringMat=new THREE.MeshBasicMaterial({color:0xffe066,transparent:true,opacity:0.85});
  function padMeshes(p){ var m=new THREE.Mesh(padGeo,lam); m.position.set(p.x,0,p.z); m.receiveShadow=true; scene.add(m); p.base=m;
    if(p.high){ var hg=new THREE.Mesh(M([P(new THREE.CylinderGeometry(1.05,1.25,0.5,10),'#a8a29e',0,0.25,0),P(new THREE.CylinderGeometry(0.95,0.95,0.06,10),'#d6d3d1',0,0.52,0)]),lam); hg.position.set(p.x,0,p.z); scene.add(hg);
      var bn=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.3),new THREE.MeshLambertMaterial({color:0x2563eb,side:THREE.DoubleSide})); bn.position.set(p.x+0.85,1.1,p.z); scene.add(bn); var bp=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,1.1,4),new THREE.MeshLambertMaterial({color:0x444444})); bp.position.set(p.x+0.65,0.75,p.z); scene.add(bp); m.position.y=0.45; }
    var r=new THREE.Mesh(new THREE.RingGeometry(0.66,0.8,28),ringMat); r.rotation.x=-Math.PI/2; r.position.set(p.x,p.high?0.65:0.2,p.z); scene.add(r); p.ring=r; }
  pads.forEach(padMeshes);
  var rangeRing=new THREE.Mesh(new THREE.RingGeometry(0.96,1,64),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.7,depthWrite:false}));
  rangeRing.rotation.x=-Math.PI/2; rangeRing.visible=false; scene.add(rangeRing);
  var rangeFill=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.12,depthWrite:false}));
  rangeFill.rotation.x=-Math.PI/2; rangeFill.visible=false; scene.add(rangeFill);

  // --- タワーの かたち ---
  var TH=[1.3,1.7,2.1,2.1,2.1];
  function towerParts(type,lv){ var h=TH[lv-1], L=[], gold=lv===3;
    if(type==='arrow'){
      L.push(P(new THREE.CylinderGeometry(0.6,0.74,h,10),'#b5aea4',0,h/2,0));
      for(var i=0;i<4;i++) L.push(P(new THREE.BoxGeometry(0.64,0.05,0.05),'#8f877d',0,0.35+i*h/4,-0.0,1,1,1,0,i*0.8,0));
      L.push(P(new THREE.CylinderGeometry(0.72,0.66,0.2,10),'#8f877d',0,h,0));
      for(var j=0;j<8;j++){ var a=j/8*Math.PI*2; L.push(P(new THREE.BoxGeometry(0.2,0.24,0.2),'#c9c2b8',Math.cos(a)*0.64,h+0.2,Math.sin(a)*0.64)); }
      L.push(P(new THREE.BoxGeometry(0.34,0.5,0.06),'#5b3a1e',0,0.3,0.7));
      if(lv>=2){ [[0.5,0.5],[-0.5,0.5],[0.5,-0.5],[-0.5,-0.5]].forEach(function(o){ L.push(P(new THREE.CylinderGeometry(0.04,0.04,0.9,4),'#7a5230',o[0],h+0.5,o[1])); });
        L.push(P(new THREE.ConeGeometry(0.95,0.7,4),gold?'#b45309':'#9a3412',0,h+1.25,0,1,1,1,0,Math.PI/4,0)); }
      if(gold) L.push(P(new THREE.CylinderGeometry(0.75,0.75,0.08,10),'#fbbf24',0,h-0.35,0));
    } else if(type==='magic'){
      L.push(P(new THREE.CylinderGeometry(0.42,0.66,h,8),'#6b5b95',0,h/2,0));
      L.push(P(new THREE.CylinderGeometry(0.62,0.5,0.25,8),'#4c3d78',0,h+0.05,0));
      for(var m2=0;m2<4;m2++){ var a2=m2/4*Math.PI*2+0.4; L.push(P(new THREE.ConeGeometry(0.1,0.5,5),'#a78bfa',Math.cos(a2)*0.5,h+0.35,Math.sin(a2)*0.5)); }
      L.push(P(new THREE.BoxGeometry(0.1,0.3,0.05),'#fde68a',0,h*0.55,0.55), P(new THREE.BoxGeometry(0.1,0.3,0.05),'#fde68a',0.3,h*0.35,0.5));
      if(lv>=2) L.push(P(new THREE.TorusGeometry(0.55,0.05,6,16),gold?'#fbbf24':'#c4b5fd',0,h*0.7,0,1,1,1,Math.PI/2,0,0));
    } else if(type==='ice'){
      L.push(P(new THREE.CylinderGeometry(0.55,0.7,h,8),'#dbeafe',0,h/2,0));
      L.push(P(new THREE.CylinderGeometry(0.68,0.6,0.2,8),'#bfdbfe',0,h,0));
      for(var n2=0;n2<6;n2++){ var a3=n2/6*Math.PI*2; L.push(P(new THREE.ConeGeometry(0.1,0.55+(n2%2)*0.25,5),'#93c5fd',Math.cos(a3)*0.55,h+0.3,Math.sin(a3)*0.55)); }
      for(var n3=0;n3<4;n3++){ var a4=n3/4*Math.PI*2+0.3; L.push(P(new THREE.ConeGeometry(0.12,0.5,5),'#e0f2fe',Math.cos(a4)*0.72,0.2,Math.sin(a4)*0.72,1,1,1,Math.cos(a4)*0.5,0,-Math.sin(a4)*0.5)); }
      if(gold) L.push(P(new THREE.CylinderGeometry(0.72,0.72,0.08,8),'#fbbf24',0,h-0.3,0));
    } else if(type==='farm'){
      L.push(P(new THREE.BoxGeometry(1.5,0.12,1.3),'#7c4a1e',0,0.06,0)); for(var fr=0;fr<4;fr++){ L.push(P(new THREE.BoxGeometry(1.4,0.1,0.14),'#5b3416',0,0.13,-0.45+fr*0.3)); for(var fc=0;fc<4+lv;fc++) L.push(P(new THREE.ConeGeometry(0.07,0.3+lv*0.1,4),lv===3?'#facc15':'#65a30d',-0.6+fc*(1.2/(3+lv)),0.3+lv*0.05,-0.45+fr*0.3)); }
      L.push(P(new THREE.BoxGeometry(0.4,0.5,0.4),'#b45309',0.75,0.25,0.55),P(new THREE.ConeGeometry(0.34,0.3,4),'#dc2626',0.75,0.65,0.55,1,1,1,0,Math.PI/4,0)); if(lv>=2) L.push(P(new THREE.CylinderGeometry(0.03,0.03,0.8,4),'#78350f',-0.7,0.4,0.55),P(new THREE.BoxGeometry(0.4,0.04,0.04),'#78350f',-0.7,0.65,0.55));
    } else if(type==='lab'){
      L.push(P(new THREE.BoxGeometry(1.2,0.8+lv*0.15,1.0),'#e5e7eb',0,0.4+lv*0.07,0),P(new THREE.CylinderGeometry(0.42,0.42,0.1,16),'#94a3b8',0,0.85+lv*0.15,0),P(new THREE.SphereGeometry(0.42,16,10,0,Math.PI*2,0,Math.PI/2),'#60a5fa',0,0.9+lv*0.15,0),
        P(new THREE.CylinderGeometry(0.04,0.04,0.5,6),'#475569',0.25,1.3+lv*0.15,0,1,1,1,0,0,-0.6),P(new THREE.BoxGeometry(0.3,0.4,0.05),'#1e3a8a',0,0.35,0.51),P(new THREE.BoxGeometry(0.2,0.15,0.05),'#7dd3fc',-0.35,0.6,0.51),P(new THREE.BoxGeometry(0.2,0.15,0.05),'#7dd3fc',0.35,0.6,0.51));
      if(lv>=2) L.push(P(new THREE.CylinderGeometry(0.12,0.12,0.6,10),'#a855f7',-0.6,0.3,-0.3)); if(lv===3) L.push(P(new THREE.TorusGeometry(0.5,0.04,6,20),'#fbbf24',0,1.25,0,1,1,1,Math.PI/2,0,0));
    } else if(type==='forge'){
      L.push(P(new THREE.BoxGeometry(1.2,0.7,1.0),'#78716c',0,0.35,0),P(new THREE.ConeGeometry(0.85,0.5,4),'#7f1d1d',0,0.95,0,1,1,1,0,Math.PI/4,0),P(new THREE.BoxGeometry(0.22,0.9,0.22),'#57534e',0.4,1.0,-0.25),
        P(new THREE.BoxGeometry(0.45,0.3,0.06),'#f97316',0,0.25,0.51),P(new THREE.BoxGeometry(0.3,0.15,0.2),'#1c1917',-0.75,0.35,0.3),P(new THREE.BoxGeometry(0.4,0.08,0.18),'#374151',-0.75,0.47,0.3));
      if(lv>=2) L.push(P(new THREE.BoxGeometry(0.05,0.5,0.05),'#9ca3af',0.75,0.25,0.4),P(new THREE.BoxGeometry(0.25,0.06,0.05),'#9ca3af',0.75,0.45,0.4)); if(lv===3) L.push(P(new THREE.BoxGeometry(0.5,0.12,0.04),'#fbbf24',0,0.8,0.52));
    } else if(type==='church'){
      L.push(P(new THREE.BoxGeometry(0.9,0.9+lv*0.1,1.3),'#f8fafc',0,0.45+lv*0.05,0),P(new THREE.ConeGeometry(0.75,0.6,4),'#1d4ed8',0,1.2+lv*0.1,0,1,1,1.4,0,Math.PI/4,0),P(new THREE.BoxGeometry(0.4,0.9+lv*0.2,0.4),'#f1f5f9',0,0.9+lv*0.1,0.5),
        P(new THREE.ConeGeometry(0.3,0.5,4),'#1d4ed8',0,1.6+lv*0.2,0.5,1,1,1,0,Math.PI/4,0),P(new THREE.BoxGeometry(0.04,0.3,0.04),'#fbbf24',0,2.0+lv*0.2,0.5),P(new THREE.BoxGeometry(0.18,0.04,0.04),'#fbbf24',0,2.05+lv*0.2,0.5),
        P(new THREE.CylinderGeometry(0.12,0.12,0.04,12),'#f472b6',0,1.0+lv*0.1,0.71,1,1,1,Math.PI/2,0,0),P(new THREE.BoxGeometry(0.25,0.4,0.04),'#78350f',0,0.2,0.66));
    } else if(type==='mine'){
      L.push(P(new THREE.BoxGeometry(1.3,0.5,1.1),'#78716c',0,0.35,0), P(new THREE.BoxGeometry(0.7,0.55,0.08),'#1c1917',0,0.4,0.52));
      [-0.4,0.4].forEach(function(x){ L.push(P(new THREE.BoxGeometry(0.1,0.9,0.1),'#78350f',x,0.6,0.55)); }); L.push(P(new THREE.BoxGeometry(1.0,0.1,0.14),'#78350f',0,1.05,0.55));
      L.push(P(new THREE.BoxGeometry(0.5,0.25,0.35),'#57534e',0.5,0.35,0.8)); for(var gi=0;gi<3+lv;gi++) L.push(P(new THREE.DodecahedronGeometry(0.1,0),'#fbbf24',0.35+(gi%3)*0.12,0.52,0.72+Math.floor(gi/3)*0.1));
      L.push(P(new THREE.ConeGeometry(0.5,0.4+lv*0.15,6),'#a8a29e',-0.3,0.8+lv*0.08,-0.2)); if(gold) L.push(P(new THREE.BoxGeometry(0.3,0.2,0.04),'#fbbf24',0,1.2,0.6));
    } else {
      var hh=h*0.7; L.push(P(new THREE.CylinderGeometry(0.78,0.88,hh,8),'#78716c',0,hh/2,0));
      L.push(P(new THREE.CylinderGeometry(0.86,0.8,0.18,8),'#57534e',0,hh,0));
      for(var c3=0;c3<8;c3++){ var a5=c3/8*Math.PI*2; L.push(P(new THREE.BoxGeometry(0.26,0.26,0.26),'#a8a29e',Math.cos(a5)*0.74,hh+0.2,Math.sin(a5)*0.74)); }
      [[-0.5,0.3],[0.4,-0.2],[0.1,0.5]].forEach(function(o){ L.push(P(new THREE.SphereGeometry(0.1,6,5),'#1f2937',o[0]*0.5,hh+0.14,o[1]*0.5)); });
      if(gold) L.push(P(new THREE.CylinderGeometry(0.9,0.9,0.08,8),'#fbbf24',0,hh-0.3,0));
    }
    L.push(P(new THREE.CylinderGeometry(0.95,0.95,0.02,16),'#3f3f46',0,0.19,0));
    return M(L); }
  function headParts(type,lv){ var L=[];
    if(TT[type].fac&&type!=='mine') return M([P(new THREE.BoxGeometry(0.01,0.01,0.01),'#000',0,0,0)]);
    if(type==='mine') return M([P(new THREE.CylinderGeometry(0.04,0.04,0.5,4),'#78350f',0,0.2,0,1,1,1,0,0,0.8),P(new THREE.BoxGeometry(0.4,0.08,0.08),'#9ca3af',-0.18,0.4,0,1,1,1,0,0,0.8)]);
    if(type==='arrow'){ L.push(P(new THREE.BoxGeometry(0.3,0.36,0.22),'#2563eb',0,0.18,0), P(new THREE.SphereGeometry(0.15,8,6),'#f2c7a5',0,0.5,0), P(new THREE.SphereGeometry(0.165,8,6,0,Math.PI*2,0,Math.PI/2),lv===3?'#fbbf24':'#1d4ed8',0,0.53,0),
        P(new THREE.TorusGeometry(0.3,0.025,4,10,Math.PI),'#7c4a1e',0,0.32,-0.25,1,1,1,0,Math.PI/2,Math.PI/2), P(new THREE.BoxGeometry(0.03,0.03,0.55),'#a16207',0,0.32,-0.25)); }
    else if(type==='cannon'){ var hl=0.9+lv*0.1; L.push(P(new THREE.BoxGeometry(0.5,0.2,0.6),'#5b3a1e',0,0.1,0), P(new THREE.CylinderGeometry(0.16+lv*0.02,0.22+lv*0.02,hl,10),'#27272a',0,0.34,-hl*0.35,1,1,1,Math.PI/2-0.25,0,0),
        P(new THREE.TorusGeometry(0.2+lv*0.02,0.04,5,10),'#52525b',0,0.4,-hl*0.75,1,1,1,-0.25,0,0), P(new THREE.CylinderGeometry(0.12,0.12,0.62,8),'#3f3f46',0,0.12,0,1,1,1,0,0,Math.PI/2)); }
    else if(type==='magic'){ L.push(P(new THREE.OctahedronGeometry(0.3+lv*0.05,0),'#d946ef',0,0,0,1,1.6,1)); }
    else { L.push(P(new THREE.OctahedronGeometry(0.28+lv*0.04,0),'#7dd3fc',0,0,0,1,1.7,1), P(new THREE.OctahedronGeometry(0.16,0),'#e0f2fe',0.28,-0.1,0,1,1.5,1)); }
    return M(L); }
  var tGeo={}, hGeo={}; TKEYS.concat(FKEYS).forEach(function(k){ tGeo[k]=[null]; hGeo[k]=[null]; for(var i=1;i<=3;i++){ tGeo[k].push(towerParts(k,i)); hGeo[k].push(headParts(k,i)); } tGeo[k].push(tGeo[k][3]); hGeo[k].push(hGeo[k][3]); tGeo[k].push(tGeo[k][3]); hGeo[k].push(hGeo[k][3]); });
  var glowMat={magic:new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x7e22ce,emissiveIntensity:0.6}),ice:new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x0ea5e9,emissiveIntensity:0.45,transparent:true,opacity:0.92})};
  var auraTex=GX.glowTex();
  function setTower(p){ if(p.mesh) scene.remove(p.mesh);
    var g=new THREE.Group(); g.add(new THREE.Mesh(tGeo[p.type][p.lv],lam)); var h=TH[p.lv-1]*(p.type==='cannon'?0.7:1);
    var hd=new THREE.Mesh(hGeo[p.type][p.lv],glowMat[p.type]||lam);
    hd.position.y=TT[p.type].fac?0.9:p.type==='magic'||p.type==='ice'?h+(p.type==='magic'?0.9:0.85):h+(p.type==='arrow'?0.12:0.2); g.add(hd); p.head=hd; p.headY=hd.position.y;
    if(p.type==='magic'||p.type==='ice'){ var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:SPARK,color:p.type==='magic'?0xe879f9:0x7dd3fc,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); sp.scale.set(1.5,1.5,1); sp.position.y=hd.position.y; g.add(sp); p.aura=sp; }
    if(p.lv===5){ var L5=Lof(p.type,5,p.br,p.br2), c5=p.br2?0xa78bfa:0xfbbf24, cr5=new THREE.Mesh(M([P(new THREE.CylinderGeometry(0.34,0.38,0.14,10),'#fbbf24',0,0,0),P(new THREE.ConeGeometry(0.07,0.22,4),'#fbbf24',-0.24,0.16,0),P(new THREE.ConeGeometry(0.07,0.26,4),'#fbbf24',0,0.18,0),P(new THREE.ConeGeometry(0.07,0.22,4),'#fbbf24',0.24,0.16,0)]),new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x553300}));
      cr5.position.y=TH[4]*(p.type==='cannon'?0.7:1)+(p.type==='arrow'?1.75:p.type==='cannon'?0.75:1.55); g.add(cr5); p.orbs=[]; for(var oi=0;oi<3;oi++){ var ob=new THREE.Mesh(new THREE.OctahedronGeometry(0.12,0),new THREE.MeshBasicMaterial({color:c5})); g.add(ob); p.orbs.push(ob); }
      var au5=new THREE.Mesh(new THREE.RingGeometry(1.0,1.2,40),new THREE.MeshBasicMaterial({color:c5,transparent:true,opacity:0.75,blending:THREE.AdditiveBlending,depthWrite:false})); au5.rotation.x=-Math.PI/2; au5.position.y=0.12; g.add(au5); p.aur=au5; g.scale.setScalar(1.08); }
    if(p.lv>=4){ var bc=[0xf43f5e,0x22d3ee][p.br||0], gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.22,0),new THREE.MeshLambertMaterial({color:bc,emissive:bc,emissiveIntensity:0.6})); gem.position.set(0,h*0.55,0.72); g.add(gem);
      var au=new THREE.Mesh(new THREE.RingGeometry(0.9,1.05,32),new THREE.MeshBasicMaterial({color:bc,transparent:true,opacity:0.7,blending:THREE.AdditiveBlending,depthWrite:false})); au.rotation.x=-Math.PI/2; au.position.y=0.1; g.add(au); p.aur=au; }
    if(p.lv>=3){ var fl=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.26),new THREE.MeshLambertMaterial({color:p.lv>=4?[0xf43f5e,0x22d3ee][p.br||0]:0xfbbf24,side:THREE.DoubleSide})); fl.position.set(0.2,h+(p.type==='arrow'?2.0:1.2),0); g.add(fl);
      var pl=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.6,4),new THREE.MeshLambertMaterial({color:0x444444})); pl.position.set(0,h+(p.type==='arrow'?1.9:1.1),0); g.add(pl); p.flag=fl; }
    g.traverse(function(n){ if(n.isMesh&&!n.material.transparent){ n.castShadow=true; n.receiveShadow=true; } });
    g.position.set(p.x,p.high?0.6:0.16,p.z); scene.add(g); p.mesh=g; p.ring.visible=false; p.pop=0.35; }

  // --- てきの かたち ---
  function legGeo(c){ return M([P(new THREE.CylinderGeometry(0.065,0.06,0.3,6),c||'#3b1d1d',0,-0.15,0),P(new THREE.BoxGeometry(0.12,0.08,0.18),'#1b1b1f',0,-0.31,-0.03)]); }
  function eyes(y,z){ return [P(new THREE.BoxGeometry(0.05,0.035,0.02),'#111',-0.06,y,z),P(new THREE.BoxGeometry(0.05,0.035,0.02),'#111',0.06,y,z)]; }
  var C=THREE.CylinderGeometry, B=THREE.BoxGeometry, SP=THREE.SphereGeometry, K=THREE.ConeGeometry, To=THREE.TorusGeometry;
  // --- てきの すがた（くわしく） ---
  function boot(c,bc){ return M([P(new C(0.07,0.06,0.3,8),c||'#3b1d1d',0,-0.15,0),P(new B(0.13,0.09,0.2),bc||'#1b1b1f',0,-0.31,-0.03),P(new C(0.075,0.075,0.04,8),bc||'#1b1b1f',0,-0.26,0)]); }
  function face(y,z,o){ o=o||{}; var L=[P(new SP(0.035,6,5),'#ffffff',-0.06,y,z),P(new SP(0.035,6,5),'#ffffff',0.06,y,z),P(new SP(0.02,5,4),o.pupil||'#111',-0.06,y,z-0.025),P(new SP(0.02,5,4),o.pupil||'#111',0.06,y,z-0.025)];
    if(o.angry!==false) L.push(P(new B(0.07,0.018,0.02),'#1c1917',-0.06,y+0.05,z+0.005,1,1,1,0,0,-0.45),P(new B(0.07,0.018,0.02),'#1c1917',0.06,y+0.05,z+0.005,1,1,1,0,0,0.45));
    if(o.mouth) L.push(P(new B(0.08,0.02,0.02),o.mouth,0,y-0.08,z+0.01)); return L; }
  function hum(o){ var sk=o.skin||'#e2a47c', c1=o.c1||'#b91c1c', c2=o.c2||'#7f1d1d', w=o.w||1, L=[
      P(new C(0.2*w,0.17*w,0.44,10),c1,0,0.54,0),P(new C(0.21*w,0.21*w,0.07,10),o.belt||'#3b2e22',0,0.36,0),P(new B(0.06,0.06,0.02),'#fbbf24',0,0.36,-0.2*w),
      P(new SP(0.08*w,8,6),c2,-0.22*w,0.7,0),P(new SP(0.08*w,8,6),c2,0.22*w,0.7,0),
      P(new C(0.055,0.05,0.3,6),c1,-0.24*w,0.55,-0.05,1,1,1,0.45,0,0.15),P(new C(0.055,0.05,0.3,6),c1,0.24*w,0.55,-0.05,1,1,1,0.45,0,-0.15),
      P(new SP(0.055,6,5),sk,-0.25*w,0.42,-0.15),P(new SP(0.055,6,5),sk,0.25*w,0.42,-0.15),
      P(new SP(0.17,12,9),sk,0,0.88,0)].concat(face(0.9,-0.16,o.face));
    return L.concat(o.extra||[]); }
  var EG={
    n:{hipY:0.33,hipX:0.085,leg:boot('#3b1d1d'),body:M(hum({c1:'#c81e1e',c2:'#7f1d1d',extra:[P(new SP(0.19,12,6,0,Math.PI*2,0,Math.PI*0.55),'#262626',0,0.92,0),P(new C(0.2,0.2,0.03,12),'#404040',0,0.92,0),
        P(new B(0.03,0.12,0.2),'#dc2626',0,1.1,0.02),P(new B(0.22,0.2,0.1),'#7c2d12',0,0.6,0.18),P(new C(0.018,0.018,1.1,5),'#78350f',0.27,0.6,-0.1,1,1,1,0.15,0,0),P(new K(0.045,0.16,5),'#d4d4d8',0.27,1.18,-0.02)]}))},
    f:{hipY:0.3,hipX:0.08,leg:boot('#365314','#1c1917'),body:M(hum({skin:'#65a30d',c1:'#ea580c',c2:'#9a3412',w:0.85,face:{pupil:'#dc2626',mouth:'#1c1917'},extra:[P(new K(0.06,0.3,5),'#65a30d',-0.22,0.93,0,1,1,1,0,0,1.25),P(new K(0.06,0.3,5),'#65a30d',0.22,0.93,0,1,1,1,0,0,-1.25),
        P(new SP(0.05,6,5),'#4d7c0f',0,0.84,-0.17),P(new B(0.03,0.04,0.34),'#e5e7eb',0.22,0.44,-0.3),P(new B(0.1,0.03,0.03),'#78350f',0.22,0.44,-0.12),P(new B(0.3,0.08,0.02),'#7c2d12',0,0.66,-0.19,1,1,1,0,0,0.3)]}))},
    b:{hipY:0.33,hipX:0.13,leg:boot('#44200f','#1c1917'),body:M(hum({skin:'#c2410c',c1:'#7f1d1d',c2:'#5c1111',w:1.4,face:{mouth:'#fef3c7'},extra:[P(new SP(0.24,10,8),'#c2410c',0,0.5,-0.12,1,0.9,0.8),P(new K(0.06,0.22,6),'#f5f5f4',-0.14,1.08,0,1,1,1,0,0,0.5),P(new K(0.06,0.22,6),'#f5f5f4',0.14,1.08,0,1,1,1,0,0,-0.5),
        P(new B(0.4,0.16,0.3),'#57534e',0,0.3,0),P(new C(0.08,0.12,0.8,7),'#78350f',0.36,0.62,-0.25,1,1,1,-0.9,0,0),P(new SP(0.16,7,6),'#44403c',0.36,0.88,-0.55)].concat([0,1,2,3].map(function(t){ var a=t*1.57; return P(new K(0.04,0.12,4),'#d6d3d1',0.36+Math.cos(a)*0.15,0.88+Math.sin(a)*0.15,-0.55,1,1,1,0,0,-a+1.57); }))}))},
    sh:{hipY:0.33,hipX:0.09,leg:boot('#64748b','#334155'),body:M(hum({skin:'#cbd5e1',c1:'#94a3b8',c2:'#cbd5e1',belt:'#475569',face:{},extra:[P(new SP(0.19,12,9),'#94a3b8',0,0.9,0),P(new B(0.24,0.04,0.03),'#0f172a',0,0.88,-0.18),P(new B(0.03,0.2,0.03),'#0f172a',0,0.84,-0.18),
        P(new K(0.05,0.22,5),'#dc2626',0,1.12,0.04,1,1,1,-0.4),P(new B(0.46,0.56,0.06),'#1e293b',-0.08,0.55,-0.28),P(new B(0.38,0.48,0.07),'#b91c1c',-0.08,0.55,-0.29),P(new B(0.08,0.36,0.075),'#fbbf24',-0.08,0.55,-0.3),P(new B(0.3,0.08,0.075),'#fbbf24',-0.08,0.6,-0.3),
        P(new C(0.02,0.02,1.2,5),'#78350f',0.26,0.7,-0.05),P(new K(0.05,0.18,4),'#e5e7eb',0.26,1.36,-0.05)]}))},
    heal:{hipY:0.3,hipX:0.08,leg:boot('#3b0764'),body:M(hum({skin:'#d6a77a',c1:'#7e22ce',c2:'#6b21a8',belt:'#fbbf24',face:{angry:false},extra:[P(new K(0.32,0.62,10),'#7e22ce',0,0.42,0),P(new C(0.33,0.33,0.05,10),'#fbbf24',0,0.16,0),P(new K(0.22,0.42,9),'#581c87',0,1.05,0.03),
        P(new K(0.1,0.22,6),'#e5e7eb',0,0.75,-0.13,1,1,1,Math.PI),P(new C(0.025,0.025,1.2,5),'#78350f',0.3,0.62,-0.08),P(new To(0.09,0.02,5,10),'#fbbf24',0.3,1.22,-0.08),P(new SP(0.08,8,6),'#4ade80',0.3,1.22,-0.08)]}))},
    kn:{hipY:0.36,hipX:0.1,leg:boot('#ca8a04','#78350f'),body:M(hum({skin:'#fde68a',c1:'#eab308',c2:'#fde047',belt:'#78350f',w:1.15,extra:[P(new SP(0.2,12,9),'#eab308',0,0.9,0),P(new B(0.26,0.04,0.03),'#1c1917',0,0.89,-0.19),P(new C(0.2,0.22,0.1,8),'#fde047',0,1.07,0),
        P(new K(0.04,0.14,4),'#fde047',-0.12,1.18,0),P(new K(0.04,0.14,4),'#fde047',0,1.2,0),P(new K(0.04,0.14,4),'#fde047',0.12,1.18,0),P(new B(0.5,0.6,0.03),'#7f1d1d',0,0.55,0.22,1,1,1,0.15),
        P(new B(0.06,0.06,0.9),'#e5e7eb',0.28,0.5,-0.5,1,1,1,0.3),P(new B(0.24,0.05,0.05),'#fbbf24',0.28,0.46,-0.1),P(new C(0.28,0.28,0.05,12),'#ca8a04',-0.3,0.55,-0.1,1,1,1,0,0,Math.PI/2),P(new SP(0.06,6,5),'#dc2626',-0.33,0.55,-0.1)]}))},
    tr:{hipY:0.36,hipX:0.14,leg:boot('#3f6212','#1c1917'),body:M(hum({skin:'#4d7c0f',c1:'#65a30d',c2:'#3f6212',belt:'#78350f',w:1.45,face:{pupil:'#fde047',mouth:'#fef3c7'},extra:[P(new SP(0.27,10,8),'#65a30d',0,0.5,-0.12,1,0.9,0.8),
        P(new K(0.035,0.12,5),'#fef3c7',-0.06,0.8,-0.17,1,1,1,Math.PI),P(new K(0.035,0.12,5),'#fef3c7',0.06,0.8,-0.17,1,1,1,Math.PI),P(new K(0.08,0.2,5),'#1c1917',0,1.1,0.03),P(new B(0.44,0.14,0.32),'#78350f',0,0.3,0),
        P(new C(0.1,0.13,1.0,7),'#78350f',0.4,0.6,-0.3,1,1,1,-1.0,0,0)]}))},
    flag:{hipY:0.33,hipX:0.085,leg:boot('#3b1d1d'),body:M(hum({c1:'#b91c1c',extra:[P(new SP(0.19,12,6,0,Math.PI*2,0,Math.PI*0.55),'#1c1917',0,0.92,0),P(new C(0.022,0.022,1.7,5),'#78350f',0.26,1.05,0.05),P(new B(0.02,0.44,0.6),'#dc2626',0.27,1.6,0.35),P(new B(0.025,0.16,0.16),'#fde047',0.28,1.62,0.33),P(new SP(0.05,6,5),'#fbbf24',0.26,1.92,0.05)]}))},
    bm:{hipY:0.33,hipX:0.085,leg:boot('#111827'),body:M(hum({skin:'#e2a47c',c1:'#1f2937',c2:'#111827',belt:'#dc2626',face:{},extra:[P(new C(0.2,0.2,0.08,10),'#dc2626',0,1.0,0),P(new SP(0.26,12,9),'#111827',0,0.62,0.26),P(new B(0.06,0.1,0.06),'#78716c',0,0.9,0.26),P(new C(0.01,0.01,0.16,4),'#a8a29e',0.02,1.0,0.26,1,1,1,0,0,0.4)]}))},
    sa:{hipY:0.33,hipX:0.09,leg:boot('#78350f'),body:M(hum({c1:'#ea580c',c2:'#f97316',belt:'#1c1917',face:{},extra:[P(new SP(0.2,12,6,0,Math.PI*2,0,Math.PI*0.5),'#facc15',0,0.93,0),P(new C(0.25,0.25,0.03,12),'#facc15',0,0.93,-0.03),
        P(new B(0.4,0.05,0.02),'#fde047',0,0.6,-0.2),P(new C(0.025,0.025,0.6,5),'#78350f',0.28,0.6,-0.2,1,1,1,-0.5,0,0),P(new B(0.36,0.07,0.07),'#6b7280',0.28,0.84,-0.33,1,1,1,-0.5,0,0)]}))},
    gd:{hipY:0.3,hipX:0.08,leg:boot('#1e3a8a'),body:M(hum({skin:'#fcd34d',c1:'#e0f2fe',c2:'#38bdf8',belt:'#1d4ed8',face:{angry:false},extra:[P(new K(0.3,0.58,10),'#e0f2fe',0,0.42,0),P(new K(0.2,0.4,9),'#0284c7',0,1.05,0.03),
        P(new C(0.3,0.3,0.03,20),'#7dd3fc',-0.32,0.62,-0.12,1,1,1,0,0,Math.PI/2),P(new To(0.3,0.02,6,20),'#e0f2fe',-0.34,0.62,-0.12,1,1,1,0,Math.PI/2,0),P(new SP(0.06,6,5),'#bae6fd',-0.35,0.62,-0.12)]}))},
    nc:{hipY:0.3,hipX:0.08,leg:boot('#1c1917'),body:M(hum({skin:'#e7e5e4',c1:'#1c1917',c2:'#3f3f46',belt:'#7c3aed',face:{pupil:'#a855f7',angry:false},extra:[P(new K(0.33,0.64,10),'#1c1917',0,0.42,0),P(new K(0.22,0.44,9),'#27272a',0,1.05,0.03),
        P(new B(0.1,0.03,0.02),'#1c1917',0,0.8,-0.16),P(new C(0.022,0.022,1.3,5),'#44403c',0.3,0.66,-0.08),P(new B(0.4,0.06,0.03),'#d4d4d8',0.12,1.3,-0.08,1,1,1,0,0,-0.4),P(new SP(0.06,6,5),'#a855f7',0.3,1.32,-0.08)]}))},
    th:{hipY:0.3,hipX:0.08,leg:boot('#44403c'),body:M(hum({skin:'#a8a29e',c1:'#57534e',c2:'#44403c',w:0.9,face:{},extra:[P(new B(0.3,0.08,0.03),'#1c1917',0,0.9,-0.16),P(new K(0.06,0.14,5),'#78716c',-0.12,1.05,0),P(new K(0.06,0.14,5),'#78716c',0.12,1.05,0),
        P(new SP(0.22,10,8),'#d6c29f',0,0.72,0.26,1,1.1,1),P(new SP(0.05,6,5),'#fbbf24',0.08,0.95,0.26),P(new To(0.06,0.02,5,10),'#78350f',0,0.94,0.26,1,1,1,Math.PI/2,0,0)]}))},
    sk:{hipY:0.33,hipX:0.08,leg:boot('#e7e5e4','#d6d3d1'),body:M([P(new C(0.14,0.1,0.4,6),'#e7e5e4',0,0.54,0),P(new B(0.3,0.03,0.12),'#d6d3d1',0,0.62,0),P(new B(0.28,0.03,0.12),'#d6d3d1',0,0.54,0),P(new B(0.24,0.03,0.12),'#d6d3d1',0,0.46,0),
        P(new SP(0.16,10,8),'#f5f5f4',0,0.86,0),P(new SP(0.04,5,4),'#111',-0.06,0.88,-0.14),P(new SP(0.04,5,4),'#111',0.06,0.88,-0.14),P(new C(0.02,0.02,0.3,4),'#e7e5e4',-0.22,0.55,-0.05,1,1,1,0.4),P(new C(0.02,0.02,0.3,4),'#e7e5e4',0.22,0.55,-0.05,1,1,1,0.4)])}
  };
  EG.sl={hipY:0.05,hipX:0.05,leg:M([P(new THREE.BoxGeometry(0.01,0.01,0.01),'#16a34a',0,0,0)]),body:M([P(new SP(0.36,14,10),'#22c55e',0,0.3,0,1,0.78,1),P(new SP(0.25,12,9),'#4ade80',0,0.34,0,1,0.7,1),P(new SP(0.1,8,6),'#dcfce7',-0.12,0.46,-0.15,1,0.6,1),
    P(new SP(0.07,8,6),'#ffffff',-0.11,0.42,-0.29),P(new SP(0.07,8,6),'#ffffff',0.11,0.42,-0.29),P(new SP(0.035,6,5),'#111',-0.11,0.42,-0.35),P(new SP(0.035,6,5),'#111',0.11,0.42,-0.35),P(new B(0.1,0.02,0.02),'#14532d',0,0.3,-0.34),
    P(new K(0.05,0.14,5),'#16a34a',0,0.6,0.05)])};
  EG.mo={hipY:0.3,hipX:0.1,leg:boot('#44403c','#292524'),body:M([P(new SP(0.27,12,9),'#78350f',0,0.55,0,1,1.1,1),P(new SP(0.2,10,8),'#a16207',0,0.5,-0.12,1,1,0.6),P(new SP(0.08,8,6),'#f9a8d4',0,0.6,-0.27),
    P(new SP(0.035,6,5),'#111',-0.09,0.72,-0.21),P(new SP(0.035,6,5),'#111',0.09,0.72,-0.21),P(new C(0.15,0.19,0.13,10),'#facc15',0,0.87,0),P(new C(0.2,0.2,0.02,12),'#facc15',0,0.82,0),P(new SP(0.05,6,5),'#fef08a',0,0.9,-0.14),
    P(new B(0.14,0.05,0.14),'#fde68a',-0.25,0.42,-0.14),P(new B(0.14,0.05,0.14),'#fde68a',0.25,0.42,-0.14),P(new C(0.02,0.02,0.5,4),'#78350f',0.28,0.55,-0.1,1,1,1,0.6),P(new B(0.2,0.06,0.04),'#9ca3af',0.28,0.75,-0.25)])};
  EG.go={hipY:0.36,hipX:0.15,leg:M([P(new B(0.22,0.38,0.24),'#6b7280',0,-0.19,0),P(new B(0.26,0.1,0.3),'#57534e',0,-0.36,-0.02)]),body:M([P(new B(0.66,0.54,0.44),'#78716c',0,0.64,0),P(new B(0.4,0.34,0.36),'#6b7280',0,1.04,-0.02),P(new B(0.5,0.1,0.4),'#57534e',0,0.9,0),
    P(new B(0.08,0.06,0.02),'#38bdf8',-0.09,1.06,-0.2),P(new B(0.08,0.06,0.02),'#38bdf8',0.09,1.06,-0.2),P(new B(0.2,0.5,0.24),'#57534e',-0.45,0.56,0),P(new B(0.2,0.5,0.24),'#57534e',0.45,0.56,0),P(new B(0.24,0.18,0.26),'#44403c',-0.45,0.28,-0.02),P(new B(0.24,0.18,0.26),'#44403c',0.45,0.28,-0.02),
    P(new B(0.22,0.08,0.32),'#65a30d',0.06,1.22,0.04),P(new B(0.14,0.06,0.14),'#84cc16',-0.18,0.9,0.18),P(new B(0.1,0.3,0.02),'#38bdf8',0,0.66,-0.225)])};
  EG.ra={hipY:0.14,hipX:0.06,leg:M([P(new C(0.03,0.03,0.14,4),'#44403c',0,-0.07,0)]),body:M([P(new SP(0.17,10,8),'#9ca3af',0,0.24,0.02,1,0.8,1.4),P(new SP(0.11,10,8),'#a8a29e',0,0.3,-0.2),P(new K(0.05,0.1,6),'#f9a8d4',0,0.28,-0.32,1,1,1,-Math.PI/2),
    P(new SP(0.055,6,5),'#f9a8d4',-0.07,0.42,-0.18),P(new SP(0.055,6,5),'#f9a8d4',0.07,0.42,-0.18),P(new SP(0.022,5,4),'#dc2626',-0.045,0.34,-0.29),P(new SP(0.022,5,4),'#dc2626',0.045,0.34,-0.29),
    P(new C(0.015,0.01,0.45,4),'#f9a8d4',0,0.2,0.38,1,1,1,1.2,0,0),P(new B(0.02,0.04,0.02),'#ffffff',-0.015,0.24,-0.3),P(new B(0.02,0.04,0.02),'#ffffff',0.015,0.24,-0.3)])};
  EG.gh={hipY:0.05,hipX:0.05,leg:M([P(new B(0.01,0.01,0.01),'#fff',0,0,0)]),body:M([P(new C(0.14,0.36,0.72,14,1,true),'#f8fafc',0,0.45,0),P(new SP(0.25,14,10,0,Math.PI*2,0,Math.PI/2),'#f8fafc',0,0.8,0),
    P(new SP(0.06,6,5),'#111',-0.09,0.86,-0.21),P(new SP(0.06,6,5),'#111',0.09,0.86,-0.21),P(new SP(0.055,6,5),'#111',0,0.71,-0.24,1,1.4,1),P(new SP(0.02,5,4),'#ffffff',-0.07,0.88,-0.26),
    P(new C(0.04,0.02,0.3,5),'#f1f5f9',-0.3,0.6,-0.05,1,1,1,0.5,0,0.9),P(new C(0.04,0.02,0.3,5),'#f1f5f9',0.3,0.6,-0.05,1,1,1,0.5,0,-0.9),P(new B(0.12,0.02,0.02),'#fca5a5',-0.15,0.78,-0.22),P(new B(0.12,0.02,0.02),'#fca5a5',0.15,0.78,-0.22)])};
  var spLegs=[]; for(var sl=0;sl<4;sl++){ [-1,1].forEach(function(sd){ spLegs.push(P(new C(0.03,0.02,0.5,5),'#111827',sd*0.3,0.24,-0.2+sl*0.13,1,1,1,0,0,sd*1.0),P(new C(0.02,0.015,0.35,4),'#111827',sd*0.52,0.08,-0.2+sl*0.13,1,1,1,0,0,-sd*0.5)); }); }
  EG.sp={hipY:0.05,hipX:0.05,leg:M([P(new B(0.01,0.01,0.01),'#111',0,0,0)]),body:M([P(new SP(0.3,12,9),'#1f2937',0,0.34,0.14,1,0.8,1.2),P(new SP(0.17,10,8),'#111827',0,0.32,-0.2),P(new B(0.12,0.12,0.02),'#dc2626',0,0.55,0.1,1,1,1,-0.3,0,0.78),
    P(new SP(0.04,6,5),'#ef4444',-0.07,0.37,-0.35),P(new SP(0.04,6,5),'#ef4444',0.07,0.37,-0.35),P(new SP(0.03,5,4),'#ef4444',-0.04,0.42,-0.33),P(new SP(0.03,5,4),'#ef4444',0.04,0.42,-0.33),P(new K(0.02,0.08,4),'#e5e7eb',-0.04,0.24,-0.35,1,1,1,Math.PI),P(new K(0.02,0.08,4),'#e5e7eb',0.04,0.24,-0.35,1,1,1,Math.PI)].concat(spLegs))};
  EG.cham={hipY:0.14,hipX:0.12,leg:M([P(new C(0.04,0.04,0.16,5),'#15803d',0,-0.07,0)]),body:M([P(new SP(0.23,12,9),'#22c55e',0,0.28,0,1,0.7,1.6),P(new SP(0.15,10,8),'#16a34a',0,0.32,-0.38),P(new SP(0.07,8,6),'#fde047',-0.1,0.38,-0.44),P(new SP(0.07,8,6),'#fde047',0.1,0.38,-0.44),
    P(new SP(0.03,5,4),'#111',-0.12,0.38,-0.5),P(new SP(0.03,5,4),'#111',0.12,0.38,-0.5),P(new To(0.15,0.045,6,14),'#15803d',0,0.26,0.44,1,1,1,0,Math.PI/2,0),P(new C(0.05,0.08,0.06,6),'#86efac',0,0.46,0.1),P(new C(0.04,0.07,0.06,6),'#86efac',0,0.44,-0.1),
    P(new SP(0.05,6,5),'#a3e635',-0.12,0.35,0.1),P(new SP(0.05,6,5),'#a3e635',0.14,0.33,-0.05)])};
  var armies={}; ['n','f','b','sh','heal','sl','mo','go','ra','gh','sp','flag','cham','kn','tr','bm','sa','gd','nc','th','sk'].forEach(function(k){ armies[k]=GX.army(scene,'red',k==='n'?MAX_EN:160,EG[k]); armies[k].body.castShadow=true; armies[k].sh.material.opacity=0.5; });
  // コウモリ（はねが パタパタ）
  var batBody=new THREE.InstancedMesh(M([P(new SP(0.2,8,6),'#3b0764',0,0,0,1,0.9,1.1),P(new K(0.06,0.14,4),'#3b0764',-0.09,0.2,0),P(new K(0.06,0.14,4),'#3b0764',0.09,0.2,0),P(new SP(0.04,5,4),'#ef4444',-0.07,0.04,-0.17),P(new SP(0.04,5,4),'#ef4444',0.07,0.04,-0.17)]),lam,120);
  var wingG=M([P(new B(0.55,0.03,0.3),'#581c87',0.3,0,0),P(new B(0.25,0.03,0.2),'#6b21a8',0.62,0,0.05)]);
  var batWL=new THREE.InstancedMesh(wingG,lam,120), batWR=new THREE.InstancedMesh(wingG,lam,120), batSh=new THREE.InstancedMesh(new THREE.PlaneGeometry(0.6,0.6),new THREE.MeshBasicMaterial({map:GX.shadowTex(),transparent:true,depthWrite:false,opacity:0.6}),120);
  var BATC=new THREE.Color(1,1,1), FBC=new THREE.Color(3.2,1.3,0.4); [batBody,batWL,batWR].forEach(function(m){ for(var ci=0;ci<120;ci++) m.setColorAt(ci,BATC); });
  [batBody,batWL,batWR,batSh].forEach(function(m){ m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled=false; scene.add(m); });
  // ワールドの ボス（5ステージめ）。1〜4ステージめは ちゅうボスの おに
  var BK=SUB===WPS?['boar','yeti','scorp','dragon','maou'][WORLD-1]:'ogre';
  var BINFO={ogre:{name:'おに',h:2.9},boar:{name:'イノシシ王',h:3.2,hp:1.2,spd:0.8},yeti:{name:'イエティ',h:4.4,hp:1.3,spd:0.65},scorp:{name:'きょだいサソリ',h:3.0,hp:1.3,spd:0.75},dragon:{name:'ほのおの ドラゴン',h:3.4,hp:1.4,spd:0.7,fly:true},maou:{name:'まおう',h:4.6,hp:1.8,spd:0.6}}[BK];
  function makeBoss(k){ var g=new THREE.Group(), L=[], an={legs:[],wings:[]}, Bx=THREE.BoxGeometry, Cy=THREE.CylinderGeometry, Sp=THREE.SphereGeometry, Co=THREE.ConeGeometry;
    function leg(x,z,len,col,r){ var lg=new THREE.Group(); lg.position.set(x,len,z); lg.add(new THREE.Mesh(M([P(new Cy(r||0.12,(r||0.12)*0.8,len,6),col,0,-len/2,0),P(new Bx((r||0.12)*2.2,0.1,(r||0.12)*2.6),'#1c1917',0,-len+0.05,-0.04)]),lam)); g.add(lg); an.legs.push(lg); return lg; }
    if(k==='boar'){ L=[P(new Sp(0.8,14,10),'#7c4a2d',0,1.05,0.1,1.05,0.85,1.45),P(new Sp(0.5,12,9),'#6b3f26',0,1.15,-1.0),P(new Cy(0.2,0.24,0.28,10),'#f9a8d4',0,1.0,-1.45,1,1,1,Math.PI/2),
        P(new Co(0.07,0.45,6),'#fef3c7',-0.25,0.95,-1.3,1,1,1,-1.2,0,-0.4),P(new Co(0.07,0.45,6),'#fef3c7',0.25,0.95,-1.3,1,1,1,-1.2,0,0.4),P(new Co(0.14,0.3,5),'#6b3f26',-0.3,1.55,-0.9),P(new Co(0.14,0.3,5),'#6b3f26',0.3,1.55,-0.9),
        P(new Sp(0.07,6,5),'#111',-0.2,1.3,-1.35),P(new Sp(0.07,6,5),'#111',0.2,1.3,-1.35)];
        for(var m=0;m<6;m++) L.push(P(new Co(0.12,0.4,5),'#3b2416',0,1.8-m*0.03,-0.6+m*0.3,1,1,1,0.3));
        L.push(P(new Cy(0.3,0.34,0.22,8),'#fbbf24',0,1.62,-1.0),P(new Co(0.06,0.18,4),'#fbbf24',-0.2,1.8,-1.0),P(new Co(0.06,0.18,4),'#fbbf24',0,1.82,-1.0),P(new Co(0.06,0.18,4),'#fbbf24',0.2,1.8,-1.0));
        [[-0.45,-0.6],[0.45,-0.6],[-0.45,0.8],[0.45,0.8]].forEach(function(o){ leg(o[0],o[1],0.6,'#4a2c1a',0.16); }); }
    else if(k==='yeti'){ L=[P(new Sp(0.9,14,10),'#f1f5f9',0,1.7,0,1,1.15,0.85),P(new Sp(0.55,12,9),'#e2e8f0',0,2.75,-0.1),P(new Bx(0.6,0.45,0.1),'#7dd3fc',0,2.7,-0.6),P(new Sp(0.08,6,5),'#111',-0.14,2.8,-0.66),P(new Sp(0.08,6,5),'#111',0.14,2.8,-0.66),
        P(new Bx(0.3,0.08,0.05),'#0c4a6e',0,2.55,-0.66),P(new Co(0.1,0.3,5),'#e0f2fe',-0.35,3.2,-0.1,1,1,1,0,0,0.4),P(new Co(0.1,0.3,5),'#e0f2fe',0.35,3.2,-0.1,1,1,1,0,0,-0.4)];
        for(var f=0;f<10;f++){ var a=f/10*6.28; L.push(P(new Co(0.14,0.35,4),'#ffffff',Math.cos(a)*0.85,1.4+(f%3)*0.35,Math.sin(a)*0.7,1,1,1,Math.sin(a)*0.8,0,-Math.cos(a)*0.8)); }
        var arm=new THREE.Group(); arm.position.set(0.95,2.2,0); arm.add(new THREE.Mesh(M([P(new Cy(0.22,0.28,1.4,8),'#f1f5f9',0,-0.6,0),P(new Sp(0.3,8,6),'#e2e8f0',0,-1.35,0)]),lam)); g.add(arm); an.arm=arm;
        var arm2=arm.clone(); arm2.position.x=-0.95; g.add(arm2); an.arm2=arm2;
        leg(-0.4,0,0.9,'#e2e8f0',0.25); leg(0.4,0,0.9,'#e2e8f0',0.25); }
    else if(k==='scorp'){ L=[P(new Sp(0.7,14,10),'#7f1d1d',0,0.55,0,1,0.55,1.3),P(new Sp(0.45,12,9),'#991b1b',0,0.55,-0.95,1,0.6,1),P(new Sp(0.07,6,5),'#fde047',-0.15,0.75,-1.3),P(new Sp(0.07,6,5),'#fde047',0.15,0.75,-1.3)];
        [-1,1].forEach(function(sd){ L.push(P(new Cy(0.08,0.08,0.8,6),'#7f1d1d',sd*0.6,0.55,-1.3,1,1,1,Math.PI/2,0,0),P(new Bx(0.35,0.18,0.45),'#991b1b',sd*0.62,0.55,-1.85),P(new Bx(0.12,0.12,0.35),'#7f1d1d',sd*0.5,0.55,-2.05)); });
        var tail=new THREE.Group(); tail.position.set(0,0.6,0.8); g.add(tail); an.tail=tail; var TL=[];
        for(var t=0;t<6;t++){ var aa=t/5*Math.PI*0.9; TL.push(P(new Sp(0.26-t*0.025,10,8),'#991b1b',0,Math.sin(aa)*1.4,Math.cos(aa)*0.9-0.1+t*0.02)); }
        TL.push(P(new Co(0.1,0.4,6),'#facc15',0,1.3,-0.5,1,1,1,-2.2,0,0)); tail.add(new THREE.Mesh(M(TL),lam));
        for(var sl=0;sl<3;sl++){ [-1,1].forEach(function(sd){ var lg=new THREE.Group(); lg.position.set(sd*0.55,0.45,-0.4+sl*0.45); lg.add(new THREE.Mesh(M([P(new Cy(0.05,0.04,0.7,5),'#450a0a',sd*0.3,-0.2,0,1,1,1,0,0,sd*1.0)]),lam)); g.add(lg); an.legs.push(lg); }); } }
    else if(k==='dragon'){ L=[P(new Sp(0.75,14,10),'#b91c1c',0,0,0,0.9,0.8,1.5),P(new Sp(0.5,12,9),'#fca5a5',0,-0.25,-0.2,0.8,0.6,1.1),P(new Cy(0.25,0.35,0.9,8),'#b91c1c',0,0.5,-1.1,1,1,1,-0.9,0,0),P(new Bx(0.55,0.4,0.75),'#b91c1c',0,0.85,-1.6),
        P(new Bx(0.45,0.15,0.4),'#7f1d1d',0,0.7,-2.0),P(new Co(0.07,0.35,5),'#fef3c7',-0.18,1.15,-1.45,1,1,1,0.6),P(new Co(0.07,0.35,5),'#fef3c7',0.18,1.15,-1.45,1,1,1,0.6),P(new Sp(0.07,6,5),'#fde047',-0.2,0.95,-1.95),P(new Sp(0.07,6,5),'#fde047',0.2,0.95,-1.95),
        P(new Co(0.3,1.6,8),'#b91c1c',0,-0.1,1.6,1,1,1,-Math.PI/2-0.2,0,0),P(new Co(0.15,0.35,4),'#fde047',0,0.1,2.45,1,1,1,-Math.PI/2)];
        for(var sp3=0;sp3<5;sp3++) L.push(P(new Co(0.08,0.25,4),'#fde047',0,0.7-sp3*0.05,-0.6+sp3*0.35));
        var wm=new THREE.MeshLambertMaterial({color:0x7f1d1d,side:THREE.DoubleSide});
        [-1,1].forEach(function(sd){ var wg=new THREE.Group(); wg.position.set(sd*0.5,0.3,-0.2); var sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(2.2,0.6); sh.lineTo(2.0,-0.3); sh.lineTo(1.4,0); sh.lineTo(1.2,-0.6); sh.lineTo(0.7,-0.2); sh.lineTo(0.3,-0.7); sh.lineTo(0,-0.5);
          var wmesh=new THREE.Mesh(new THREE.ShapeGeometry(sh),wm); wmesh.rotation.x=-Math.PI/2; wmesh.scale.x=sd; wg.add(wmesh); g.add(wg); an.wings.push(wg); wg.userData.sd=sd; });
        leg(-0.4,0.3,0.4,'#991b1b',0.12); leg(0.4,0.3,0.4,'#991b1b',0.12); an.fly=true; }
    else if(k==='maou'){ L=[P(new Co(0.75,1.6,12),'#1e1b4b',0,0.8,0),P(new Cy(0.42,0.5,0.8,10),'#312e81',0,1.9,0),P(new Sp(0.18,8,6),'#4c1d95',-0.5,2.25,0),P(new Sp(0.18,8,6),'#4c1d95',0.5,2.25,0),
        P(new Co(0.18,0.35,6),'#6d28d9',-0.5,2.45,0),P(new Co(0.18,0.35,6),'#6d28d9',0.5,2.45,0),P(new Sp(0.32,12,9),'#a78bfa',0,2.62,0),P(new Bx(0.5,0.12,0.05),'#111',0,2.66,-0.3),
        P(new Co(0.08,0.55,6),'#e5e7eb',-0.25,3.05,0,1,1,1,0,0,0.5),P(new Co(0.08,0.55,6),'#e5e7eb',0.25,3.05,0,1,1,1,0,0,-0.5),P(new Cy(0.36,0.4,0.12,10),'#fbbf24',0,2.9,0),
        P(new Cy(0.04,0.04,2.6,6),'#1c1917',0.7,1.4,-0.25),P(new Sp(0.2,10,8),'#c026d3',0.7,2.8,-0.25)];
        var eyeM=new THREE.Mesh(M([P(new Sp(0.05,6,5),'#ffffff',-0.1,2.67,-0.32),P(new Sp(0.05,6,5),'#ffffff',0.1,2.67,-0.32)]),new THREE.MeshBasicMaterial({color:0xff2d2d})); g.add(eyeM);
        var cape=new THREE.Mesh(new THREE.PlaneGeometry(1.3,2.2,4,4),new THREE.MeshLambertMaterial({color:0x7f1d1d,side:THREE.DoubleSide})); cape.position.set(0,1.3,0.45); cape.rotation.x=0.12; g.add(cape); an.cape=cape;
        var aura=new THREE.Mesh(new THREE.RingGeometry(1.0,1.3,32),new THREE.MeshBasicMaterial({color:0x7c3aed,transparent:true,opacity:0.6,blending:THREE.AdditiveBlending,depthWrite:false})); aura.rotation.x=-Math.PI/2; aura.position.y=0.06; g.add(aura); an.aura=aura; }
    if(L.length){ var body=new THREE.Mesh(M(L),lam); g.add(body); an.body=body; }
    g.traverse(function(n){ if(n.isMesh&&!n.material.transparent) n.castShadow=true; });
    var shd=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.4),new THREE.MeshBasicMaterial({map:GX.shadowTex(),transparent:true,depthWrite:false})); shd.rotation.x=-Math.PI/2; shd.position.y=0.03; scene.add(shd); an.shadow=shd;
    g.visible=false; shd.visible=false; scene.add(g);
    return {g:g,anim:function(t,walk,atk,flash){ var sw=walk?Math.sin(t*6)*0.5:0; an.legs.forEach(function(l,i){ l.rotation.x=(i%2?sw:-sw); });
      an.wings.forEach(function(w){ w.rotation.z=w.userData.sd*Math.sin(t*5)*0.6; });
      if(an.arm){ an.arm.rotation.x=atk?-2.2:Math.sin(t*3)*0.3; an.arm2.rotation.x=-Math.sin(t*3)*0.3; }
      if(an.tail) an.tail.rotation.x=Math.sin(t*2)*0.12+(atk?-0.5:0);
      if(an.aura){ an.aura.rotation.z+=0.03; an.aura.material.color.setHex(this.phase>=3?0xef4444:this.phase>=2?0xc026d3:0x7c3aed); an.aura.scale.setScalar(1+(this.phase||1)*0.15); }
      if(an.cape){ an.cape.rotation.x=0.12+Math.sin(t*3)*0.06; }
      g.scale.setScalar((flash?1.06:1)*1.35); },shadow:shd,fly:an.fly}; }
  var bossM=BK==='ogre'?GX.boss(scene):makeBoss(BK); if(BK==='ogre'){ bossM.g.traverse(function(n){ if(n.isMesh) n.castShadow=true; }); bossM.g.scale.setScalar(0.42); } bossM.g.visible=false;
  var bubble=new THREE.Mesh(new THREE.SphereGeometry(1.7,20,14),new THREE.MeshBasicMaterial({color:0x7dd3fc,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false})); bubble.visible=false; scene.add(bubble);
  var fx=GX.particles(scene,900);
  var arrowM=GX.bullets(scene,MAX_P);
  var orbM=new THREE.InstancedMesh(new THREE.SphereGeometry(0.16,10,8),new THREE.MeshBasicMaterial({color:0xffffff}),MAX_P); orbM.frustumCulled=false; scene.add(orbM);
  for(var oi=0;oi<MAX_P;oi++) orbM.setColorAt(oi,new THREE.Color(1,1,1));
  var SPARK=GX.canvasTex(64,64,function(c2,w,h){ var r2=c2.createRadialGradient(32,32,0,32,32,32); r2.addColorStop(0,'rgba(255,255,255,1)'); r2.addColorStop(0.35,'rgba(255,255,255,.45)'); r2.addColorStop(1,'rgba(255,255,255,0)'); c2.fillStyle=r2; c2.fillRect(0,0,w,h); },false);
  var _c=new THREE.Color(), tmp=new THREE.Object3D(), tmp2=new THREE.Object3D();
  // くうきの つぶ（はっぱ・ゆき・すな）
  var AMB=(function(){ var n=MP.tree==='snow'?220:120, pos=new Float32Array(n*3), v=[];
    for(var i=0;i<n;i++){ pos[i*3]=rnd(-12,12); pos[i*3+1]=rnd(0.5,9); pos[i*3+2]=rnd(-18,16); v.push(rnd(0,6.28)); }
    var geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    var col=MP.amb||(MP.tree==='snow'?0xffffff:MP.tree==='cactus'?0xf5deb3:0xbef264);
    var mat=new THREE.PointsMaterial({size:MP.tree==='snow'?0.22:0.16,map:SPARK,color:col,transparent:true,opacity:MP.tree==='cactus'?0.45:0.85,blending:MP.dark?THREE.AdditiveBlending:THREE.NormalBlending,depthWrite:false});
    var pts=new THREE.Points(geo,mat); pts.frustumCulled=false; scene.add(pts);
    return function(dt){ for(var i=0;i<n;i++){ var k=i*3; v[i]+=dt; if(MP.tree==='snow'){ pos[k+1]-=dt*0.9; pos[k]+=Math.sin(v[i])*dt*0.4; } else if(MP.tree==='lava'){ pos[k+1]+=dt*1.2; pos[k]+=Math.sin(v[i]*1.5)*dt*0.4; if(pos[k+1]>9) pos[k+1]=0.2; } else if(MP.tree==='dead'){ pos[k]+=Math.sin(v[i]*0.8)*dt*0.6; pos[k+1]+=Math.cos(v[i])*dt*0.3; } else if(MP.tree==='cactus'){ pos[k]+=dt*2.2; pos[k+1]+=Math.sin(v[i]*2)*dt*0.3; }
        else { pos[k]+=dt*0.8; pos[k+1]-=dt*0.35; pos[k+2]+=Math.sin(v[i])*dt*0.5; }
        if(pos[k+1]<0.1) pos[k+1]=9; if(pos[k]>12) pos[k]=-12; } geo.attributes.position.needsUpdate=true; }; })();
  var bolt=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.5,30,8,1,true),new THREE.MeshBasicMaterial({color:0xbfe6ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  bolt.visible=false; scene.add(bolt);
  var rings=[]; function ringFx(x,z,color,size,life){ var m=new THREE.Mesh(new THREE.RingGeometry(0.7,1,32),new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    m.rotation.x=-Math.PI/2; m.position.set(x,0.25,z); scene.add(m); rings.push({m:m,t:0,life:life||0.4,size:size}); }
  var KNT=new THREE.Color(1.6,1.3,0.45), TRT=new THREE.Color(0.55,1.15,0.55), PHASE=new THREE.Color(0.5,0.6,1.1), NTINT=[null,new THREE.Color(0.85,0.95,1.4),new THREE.Color(1.3,1.15,0.8),new THREE.Color(1.5,0.8,0.45),new THREE.Color(0.7,0.65,1.05)][WORLD-1], SLOW=new THREE.Color(0.55,0.8,1.5), HIT=new THREE.Color(2,1.6,1.6), STUN=new THREE.Color(2,2,2.2), CURSE=new THREE.Color(1.1,0.6,1.4), ELITE=new THREE.Color(1.7,1.35,0.4);

  // --- ゆうしゃ（タップした ところへ あるく・ちかくの てきを きる） ---
  // --- ゆうしゃ（クラスごとの すがた・しんかで かわる） ---
  var HM={body:new THREE.MeshLambertMaterial({vertexColors:true}),cape:new THREE.MeshLambertMaterial({color:0xdc2626,side:THREE.DoubleSide}),trim:new THREE.MeshLambertMaterial({color:0xfbbf24,emissive:0x332200}),
    glow:new THREE.MeshBasicMaterial({color:0xfff3b0,transparent:true,opacity:0.7,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),
    wing:new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.75,side:THREE.DoubleSide,depthWrite:false})};
  var HLEG=GX.soldier('blue').leg;
  var HCOL={knight:['#2f6fe0','#1e40af'],mage:['#6d28d9','#a78bfa'],ranger:['#15803d','#4d7c0f'],support:['#db2777','#f9a8d4'],assassin:['#1f2937','#7c3aed'],dwarf:['#b45309','#78350f'],fairy:['#38bdf8','#f0abfc']};
  var hero={g:new THREE.Group(),x:0,z:9.2,tx:0,tz:9.2,cd:0,skill:4,swing:0,ry:Math.PI,walk:0,form:1,lv:1,xp:0,wings:[]};
  scene.add(hero.g); hero.g.position.set(hero.x,0,hero.z);
  function wingGeo(w,h){ var sh=new THREE.Shape(); sh.moveTo(0,0); sh.quadraticCurveTo(w*0.5,h*0.9,w,h); sh.quadraticCurveTo(w*0.8,h*0.4,w*0.95,h*0.05); sh.quadraticCurveTo(w*0.5,-h*0.15,0,0); return new THREE.ShapeGeometry(sh); }
  function buildHero(cls,form){ var H=hero, g=H.g; while(g.children.length) g.remove(g.children[0]); H.wings=[]; H.aura=null; H.orbs=[]; H.form=form;
    var Bx=THREE.BoxGeometry, Cy=THREE.CylinderGeometry, Sp=THREE.SphereGeometry, Co=THREE.ConeGeometry, To=THREE.TorusGeometry;
    var c1=HCOL[cls.k][0], c2=HCOL[cls.k][1], gold=form>=2, top=form>=3, skin='#f3c9a5';
    var armor=cls.k==='knight'||cls.k==='dwarf'?(top?'#fde68a':gold?'#e2e8f0':c1):c1;
    var L=[P(new Cy(0.19,0.17,0.42,10),armor,0,0.53,0),P(new Cy(0.205,0.205,0.07,10),gold?'#fbbf24':'#3b2e22',0,0.36,0),P(new Sp(0.165,12,9),skin,0,0.86,0),
      P(new Sp(gold?0.09:0.07,8,6),gold?'#fbbf24':c2,-0.21,0.68,0),P(new Sp(gold?0.09:0.07,8,6),gold?'#fbbf24':c2,0.21,0.68,0),P(new Cy(0.05,0.045,0.3,6),c1,-0.23,0.52,-0.02,1,1,1,0.3),
      P(new Bx(0.04,0.05,0.02),'#111',-0.06,0.87,-0.158),P(new Bx(0.04,0.05,0.02),'#111',0.06,0.87,-0.158)];
    if(gold) L.push(P(new Bx(0.1,0.1,0.02),'#fbbf24',0,0.6,-0.19));   // むねの しるし
    if(cls.k==='knight'){ L.push(P(new Sp(0.185,12,6,0,Math.PI*2,0,Math.PI*0.55),top?'#fbbf24':gold?'#cbd5e1':'#94a3b8',0,0.89,0),P(new Bx(0.26,0.03,0.03),'#111',0,0.86,-0.17),P(new Co(0.05,0.3,6),top?'#fde047':gold?'#dc2626':'#ef4444',0,1.12,0.05,1,1,1,-0.4));
      L.push(P(new Cy(0.2,0.2,0.04,12),top?'#fbbf24':'#1e3a8a',-0.3,0.55,-0.05,1,1,1,0,0,Math.PI/2),P(new Bx(0.02,0.18,0.06),'#fbbf24',-0.33,0.55,-0.05)); }
    else if(cls.k==='mage'){ L.push(P(new Co(0.3,0.55,10),c1,0,0.3,0),P(new Cy(0.3,0.3,0.03,14),c1,0,1.0,0),P(new Co(0.2,0.55,10),c1,0,1.28,0.04,1,1,1,-0.2));
      if(gold) for(var st=0;st<4;st++) L.push(P(new Bx(0.05,0.05,0.02),'#fde047',Math.cos(st*1.6)*0.14,1.1+st*0.08,-0.12)); if(top) L.push(P(new Sp(0.06,6,5),'#fde047',0,1.56,0.1)); }
    else if(cls.k==='ranger'){ L.push(P(new Sp(0.19,12,6,0,Math.PI*2,0,Math.PI*0.6),c2,0,0.88,0.02),P(new Bx(0.14,0.4,0.1),'#78350f',0.1,0.6,0.2,1,1,1,0,0,0.4));
      for(var ar=0;ar<3;ar++) L.push(P(new Cy(0.01,0.01,0.3,3),'#e5e7eb',0.06+ar*0.04,0.85,0.22,1,1,1,0,0,0.4)); if(gold) L.push(P(new Co(0.03,0.28,4),top?'#fde047':'#f97316',0.15,1.08,0.05,1,1,1,0,0,-0.6)); }
    else if(cls.k==='support'){ L.push(P(new Cy(0.2,0.22,0.08,12),c1,0,1.0,0,1,1,1,0.2),P(new Sp(0.05,6,5),'#fde047',0.12,1.06,0),P(new Co(0.27,0.35,10),c2,0,0.28,0)); if(gold) L.push(P(new Bx(0.3,0.06,0.02),'#fbbf24',0,0.44,-0.2)); }
    else if(cls.k==='assassin'){ L.push(P(new Sp(0.19,12,6,0,Math.PI*2,0,Math.PI*0.62),'#111827',0,0.88,0.01),P(new Bx(0.3,0.08,0.03),c2,0,0.8,-0.16),P(new Bx(0.3,0.06,0.3),c2,0,0.72,0.1));
      if(gold) L.push(P(new Bx(0.12,0.5,0.02),c2,0.1,0.5,0.22,1,1,1,0.3,0,0.2)); if(top) L.push(P(new Bx(0.04,0.03,0.02),'#ef4444',-0.06,0.87,-0.162),P(new Bx(0.04,0.03,0.02),'#ef4444',0.06,0.87,-0.162)); }
    else if(cls.k==='dwarf'){ L.push(P(new Co(0.16,0.34,8),'#a16207',0,0.66,-0.12,1,1,1,Math.PI+0.3),P(new Sp(0.19,12,6,0,Math.PI*2,0,Math.PI*0.5),top?'#fbbf24':'#9ca3af',0,0.92,0),
        P(new Co(0.05,0.22,6),'#f5f5f4',-0.19,1.05,0,1,1,1,0,0,0.9),P(new Co(0.05,0.22,6),'#f5f5f4',0.19,1.05,0,1,1,1,0,0,-0.9)); }
    else if(cls.k==='fairy'){ L.push(P(new Sp(0.18,12,8),'#fde047',0,0.93,0.03,1,0.8,1),P(new Co(0.22,0.3,10),c1,0,0.3,0),P(new Cy(0.01,0.01,0.2,3),'#111',-0.06,1.12,0,1,1,1,0,0,0.3),P(new Sp(0.03,5,4),'#f472b6',-0.09,1.21,0)); }
    var body=new THREE.Mesh(M(L),HM.body); g.add(body); H.body=body;
    if(typeof skinK==='undefined'||skinK==='red') HM.cape.color.set(c1);
    var lL=new THREE.Mesh(HLEG,lam), lR=new THREE.Mesh(HLEG,lam); lL.position.set(-0.085,0.33,0); lR.position.set(0.085,0.33,0); g.add(lL); g.add(lR); H.lL=lL; H.lR=lR; if(cls.k==='fairy'){ lL.visible=lR.visible=false; }
    // ぶき
    var arm=new THREE.Group(); arm.position.set(0.24,0.62,0); g.add(arm); H.arm=arm; var W=[], wm=top?HM.trim:lam, ws=1+0.15*(form-1);
    if(cls.k==='knight') W=[P(new Bx(0.06,0.06,0.72),top?'#fef9c3':'#e5e7eb',0,0,-0.46),P(new Bx(0.26,0.05,0.05),'#fbbf24',0,0,-0.1),P(new Bx(0.05,0.05,0.14),'#78350f',0,0,0)];
    else if(cls.k==='mage') W=[P(new Cy(0.02,0.02,0.9,5),'#78350f',0,0.1,-0.1,1,1,1,Math.PI/2+0.3),P(new Sp(0.09,8,6),top?'#fde047':'#f97316',0,0.22,-0.54)];
    else if(cls.k==='ranger') W=[P(new To(0.3,0.02,5,12,Math.PI),top?'#fde047':'#7c4a1e',0,0,-0.2,1,1,1,0,Math.PI/2,Math.PI/2),P(new Cy(0.004,0.004,0.6,3),'#e5e7eb',0,0,-0.2,1,1,1,Math.PI/2)];
    else if(cls.k==='support') W=[P(new Sp(0.14,10,8),'#b45309',0,0,-0.18,1,1,0.5),P(new Bx(0.04,0.04,0.4),'#78350f',0,0,-0.45),P(new Sp(0.04,6,4),'#fde047',0,0.05,-0.12)];
    else if(cls.k==='assassin') W=[P(new Bx(0.03,0.05,0.4),'#cbd5e1',0,0,-0.28),P(new Bx(0.1,0.03,0.03),'#7c3aed',0,0,-0.08),P(new Bx(0.03,0.05,0.4),'#cbd5e1',-0.48,0,-0.28)];
    else if(cls.k==='dwarf') W=[P(new Cy(0.03,0.03,0.7,5),'#78350f',0,0,-0.3,1,1,1,Math.PI/2),P(new Bx(0.22,0.2,0.34),top?'#fbbf24':'#6b7280',0,0,-0.66)];
    else W=[P(new Cy(0.012,0.012,0.4,4),'#fef3c7',0,0,-0.2,1,1,1,Math.PI/2),P(new Sp(0.06,6,5),'#f0abfc',0,0,-0.42)];
    var wpn=new THREE.Mesh(M(W),top?new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x665500}):lam); wpn.scale.setScalar(ws); arm.add(wpn);
    // マント
    if(cls.k==='knight'||cls.k==='ranger'||gold){ var cw=0.44+0.08*form, ch=0.52+0.1*form; var cp=new THREE.Mesh(new THREE.PlaneGeometry(cw,ch,4,4),HM.cape); cp.position.set(0,0.78-ch/2+0.02,0.21); cp.rotation.x=0.15; g.add(cp); H.cape=cp; cp.userData.b=cp.geometry.attributes.position.array.slice(); }
    // はね
    var wingOn=cls.k==='fairy'||(top&&(cls.k==='knight'||cls.k==='support'||cls.k==='mage'));
    if(wingOn){ var wmat=cls.k==='fairy'?new THREE.MeshBasicMaterial({color:top?0xfde68a:gold?0xf0abfc:0xbae6fd,transparent:true,opacity:0.7,side:THREE.DoubleSide,depthWrite:false}):HM.wing, ww=cls.k==='fairy'?0.4+0.12*form:0.75;
      [-1,1].forEach(function(sd){ var wg=new THREE.Group(), wmh=new THREE.Mesh(wingGeo(ww,ww*0.8),wmat); wmh.scale.x=sd; wg.add(wmh); wg.position.set(sd*0.06,0.72,0.16); g.add(wg); wg.userData.sd=sd; H.wings.push(wg); }); }
    // あたまの わ（さいご）・オーラ
    if(top){ var halo=new THREE.Mesh(new To(0.16,0.025,6,20),HM.trim); halo.rotation.x=Math.PI/2; halo.position.y=1.22+(cls.k==='mage'?0.4:0); g.add(halo);
      var au=new THREE.Mesh(new THREE.RingGeometry(0.5,0.62,32),new THREE.MeshBasicMaterial({color:{knight:0xfde047,mage:0xff7a2a,ranger:0x86efac,support:0xf9a8d4,assassin:0xa78bfa,dwarf:0xf59e0b,fairy:0xf0abfc}[cls.k],transparent:true,opacity:0.8,blending:THREE.AdditiveBlending,depthWrite:false}));
      au.rotation.x=-Math.PI/2; au.position.y=0.05; g.add(au); H.aura=au;
      var pil=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.5,2.2,16,1,true),new THREE.MeshBasicMaterial({color:au.material.color,transparent:true,opacity:0.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); pil.position.y=1.1; g.add(pil); H.pillar=pil; }
    if(gold&&cls.k==='mage'){ for(var ob=0;ob<form;ob++){ var o=new THREE.Mesh(new Sp(0.06,8,6),new THREE.MeshBasicMaterial({color:0xff9a3d})); g.add(o); H.orbs.push(o); } }
    var sh=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.9),new THREE.MeshBasicMaterial({map:GX.shadowTex(),transparent:true,depthWrite:false})); sh.rotation.x=-Math.PI/2; sh.position.y=0.02; g.add(sh);
    var ring=new THREE.Mesh(new THREE.RingGeometry(0.42,0.52,24),new THREE.MeshBasicMaterial({color:0x60a5fa,transparent:true,opacity:0.8,depthWrite:false})); ring.rotation.x=-Math.PI/2; ring.position.y=0.04; g.add(ring);
    g.traverse(function(n){ if(n.isMesh&&!n.material.transparent&&n.material.type!=='MeshBasicMaterial') n.castShadow=true; });
    g.scale.setScalar(1.55*(1+0.1*(form-1))*(cls.k==='fairy'?0.85:cls.k==='dwarf'?1.05:1)); }
  var marker=new THREE.Mesh(new THREE.RingGeometry(0.3,0.42,24),new THREE.MeshBasicMaterial({color:0x60a5fa,transparent:true,opacity:0,depthWrite:false})); marker.rotation.x=-Math.PI/2; marker.position.y=0.25; scene.add(marker);
  var HC=(function(){ var k=''; try{ k=opt.research.get().cls; }catch(e){} return CLS.filter(function(c){ return c.k===k; })[0]||CLS[0]; })();
  buildHero(HC,1);
  function heroNeed(){ return 4+hero.lv*3; }
  function heroXp(v){ if(hero.lv>=10) return; hero.xp+=v; while(hero.lv<10&&hero.xp>=heroNeed()){ hero.xp-=heroNeed(); hero.lv++; ringFx(hero.x,hero.z,0xfde047,2,0.6); fx.burst(hero.x,1.2,hero.z,24,0xfde047,4,0.6);
      if(hero.lv===4||hero.lv===8) evolve(); else { say(HC.ico+' ゆうしゃ Lv'+hero.lv+'！','#fde68a',900); snd('correct'); } } }
  var evoBeam=new THREE.Mesh(new THREE.CylinderGeometry(0.9,1.3,24,20,1,true),new THREE.MeshBasicMaterial({color:0xfff3b0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); evoBeam.visible=false; scene.add(evoBeam);
  function evolve(){ var f=Math.min(3,hero.form+1); buildHero(HC,f); S.slow=1.0; S.shake=0.6; snd('fanfare');
    evoBeam.position.set(hero.x,12,hero.z); evoBeam.visible=true; evoBeam.material.opacity=0.9; S.evoT=1.4;
    for(var i=0;i<3;i++) ringFx(hero.x,hero.z,[0xfff3b0,0xfde047,0xffffff][i],2+i*1.2,0.6+i*0.2); fx.burst(hero.x,1,hero.z,70,0xfde047,6,1); fx.burst(hero.x,1,hero.z,40,0xffffff,4,0.8);
    evoBan.innerHTML='✨ しんか！<div style="font-size:22px;">'+HC.ico+' '+HC.forms[f-1]+'</div>'; evoBan.style.display='block'; evoBan.style.animation='none'; void evoBan.offsetWidth; evoBan.style.animation='twBoss 2s ease-out forwards'; setTimeout(function(){ evoBan.style.display='none'; },2000); }
  function heroStep(dt){ if(hero.stun>0){ hero.stun-=dt; if(Math.random()<0.3) fx.emit(hero.x,1.8,hero.z,0,0.5,0,0xfde047,0.3); return; } var H=hero, dx=H.tx-H.x, dz=H.tz-H.z, d=Math.hypot(dx,dz), mul=(1+0.12*(stage-1))*(1+0.12*(H.lv-1))*FORM_MUL[H.form-1], F=H.form;
    var air=HC.range>2, tgt=null, td=1e9; S.en.forEach(function(a){ if(a.dead||((a.fly||ET[a.ty].air)&&!air)||a.under>0||!canHit(a,HC.k==='mage'||HC.k==='fairy'?'magic':'hero')) return; var e=Math.hypot(a.x-H.x,a.z-H.z); if(e<td){ td=e; tgt=a; } });
    if(d>0.08){ var sp=Math.min(d,HC.spd*dt); H.x+=dx/d*sp; H.z+=dz/d*sp; H.ry=Math.atan2(-dx,-dz); H.walk+=dt*12; }
    else if(tgt&&td<HC.range+0.1){ H.ry=Math.atan2(-(tgt.x-H.x),-(tgt.z-H.z)); }
    H.cd-=dt; H.skill-=dt; SRC='hero';
    if(tgt&&td<HC.range){ var near=S.en.filter(function(a){ return !a.dead&&!a.under&&Math.hypot(a.x-H.x,a.z-H.z)<HC.range+1; });
      if(H.skill<=0&&(near.length>=3||HC.k==='support'||HC.k==='fairy'||(HC.k==='assassin'&&near.length>=2))){ H.skill=HC.sk*FORM_CD[F-1]; H.spin=HC.k==='assassin'?0:0.5;
        if(HC.k==='knight'){ near.forEach(function(a){ if(!(a.fly||ET[a.ty].air)){ hurt(a,6*mul); if(a.ty!=='boss') a.stun=1.2+0.3*F; } }); if(F>=3) near.forEach(function(a){ hurt(a,4*mul,true); }); ringFx(H.x,H.z,0x93c5fd,2.6+0.4*F,0.5); say('🛡 シールド バッシュ！','#bfdbfe',800); }
        else if(HC.k==='mage'){ var cx=tgt.x, cz=tgt.z; S.en.forEach(function(a){ if(!a.dead&&Math.hypot(a.x-cx,a.z-cz)<2.2+0.4*F) hurt(a,12*mul,true); }); ringFx(cx,cz,0xff7a2a,2.6+0.5*F,0.6); fx.burst(cx,0.6,cz,50,0xff7a2a,6,0.7); S.shake=0.6; say('🔥 メテオ！','#fed7aa',800); }
        else if(HC.k==='ranger'){ for(var k=0;k<10+6*F;k++){ var a2=near[k%near.length]; S.proj.push({type:'hero',x:H.x,y:1.2,z:H.z,sx:H.x,sy:1.2,sz:H.z,tg:a2,t:-k*0.04,dur:0.3,L:{},lv:1,dmg:2.2*mul,col:0xfde047}); } say('🏹 やの あめ！','#fef08a',800); }
        else if(HC.k==='assassin'){ var list=near.slice().sort(function(a,b){ return Math.hypot(a.x-H.x,a.z-H.z)-Math.hypot(b.x-H.x,b.z-H.z); }).slice(0,2+2*F), px=H.x, pz=H.z;
          list.forEach(function(a){ for(var u=0;u<6;u++) fx.emit(px+(a.x-px)*u/6,0.8,pz+(a.z-pz)*u/6,0,0.2,0,0xa78bfa,0.4); hurt(a,5*mul,false,true); px=a.x; pz=a.z; });
          H.x=H.tx=px; H.z=H.tz=pz; say('🗡 かげぬい！','#ddd6fe',700); }
        else if(HC.k==='dwarf'){ S.en.forEach(function(a){ if(!a.dead&&!(a.fly||ET[a.ty].air)&&Math.hypot(a.x-H.x,a.z-H.z)<2.4+0.4*F){ hurt(a,7*mul); if(a.ty!=='boss') a.stun=1+0.2*F; } }); ringFx(H.x,H.z,0xf59e0b,2.8+0.5*F,0.6); fx.burst(H.x,0.2,H.z,40,0x92400e,5,0.7); S.shake=0.8; say('🔨 じしん！','#fed7aa',700); }
        else if(HC.k==='fairy'){ var hl=1+F; S.hp=Math.min(S.maxHp,S.hp+hl); hud2(); S.en.forEach(function(a){ if(!a.dead&&Math.hypot(a.x-H.x,a.z-H.z)<4+0.5*F){ a.slowT=3; a.slowK=Math.max(a.slowK,0.4); } }); ringFx(H.x,H.z,0xf0abfc,4+0.5*F,0.7); fx.burst(CS.x,2,CS.z,30,0xf0abfc,3,0.8); say('🧚 いやし！ ❤️+'+hl,'#fbcfe8',900); }
        else { if(F>=3){ S.hp=Math.min(S.maxHp,S.hp+1); hud2(); } pads.forEach(function(q){ if(q.lv&&Math.hypot(q.x-H.x,q.z-H.z)<4+F*0.8){ q.boostT=4+F; ringFx(q.x,q.z,0xf472b6,1.4,0.5); } }); ringFx(H.x,H.z,0xf472b6,4.5,0.6); say('🎵 おうえん！ タワーが はやく なった','#fbcfe8',1100); }
        snd('crash'); }
      else if(H.cd<=0){ H.cd=1/HC.rate; H.swing=0.25; H.lastTgt=tgt;
        if(HC.range<2){ var hm=HC.atk*mul*(1+0.4*cv('hero')), hc=HC.crit&&Math.random()<HC.crit; if(HC.cleave){ S.en.forEach(function(a){ if(!a.dead&&!(a.fly||ET[a.ty].air)&&Math.hypot(a.x-tgt.x,a.z-tgt.z)<HC.cleave) hurt(a,hm); }); ringFx(tgt.x,tgt.z,0xf59e0b,1,0.3); } else hurt(tgt,hm*(hc?2.5:1),false,hc); fx.burst(tgt.x,0.8,tgt.z,5,HC.k==='assassin'?0xa78bfa:0xe0f2fe,2.5,0.3); }
        else S.proj.push({type:'hero',x:H.x,y:1.1,z:H.z,sx:H.x,sy:1.1,sz:H.z,tg:tgt,t:0,dur:0.3,L:{},lv:1,dmg:HC.atk*mul,magic:HC.k==='mage',col:HC.k==='mage'?0xff7a2a:HC.k==='ranger'?0xfde047:HC.k==='fairy'?0xf0abfc:0xf472b6,magic:HC.k==='mage'||HC.k==='fairy'}); } }
    SRC=null; }
  function heroDraw(dt){ var H=hero; H.g.position.set(H.x,0,H.z); H.g.rotation.y+=(((H.ry-H.g.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI)*Math.min(1,dt*12);
    var moving=Math.hypot(H.tx-H.x,H.tz-H.z)>0.08, sw=moving?Math.sin(H.walk)*0.7:0; H.lL.rotation.x=sw; H.lR.rotation.x=-sw; H.g.position.y=moving?Math.abs(Math.sin(H.walk))*0.06:0;
    if(H.swing>0){ H.swing-=dt; H.arm.rotation.x=-1.6+(1-H.swing/0.25)*2.4; } else H.arm.rotation.x=-0.3;
    if(H.spin>0){ H.spin-=dt; H.g.rotation.y+=dt*30; }
    if(HC.k==='fairy') H.g.position.y=0.35+Math.sin(S.t*3)*0.08;
    H.wings.forEach(function(wg){ var f=HC.k==='fairy'?Math.sin(S.t*22)*0.6:Math.sin(S.t*4)*0.25; wg.rotation.y=wg.userData.sd*(0.5+f); });
    if(H.aura){ H.aura.rotation.z+=dt*2; H.aura.scale.setScalar(1+Math.sin(S.t*4)*0.08); H.pillar.material.opacity=0.12+Math.sin(S.t*3)*0.06; }
    (H.orbs||[]).forEach(function(o,i){ var a=S.t*2.5+i*Math.PI*2/H.orbs.length; o.position.set(Math.cos(a)*0.45,1.0+Math.sin(S.t*3+i)*0.08,Math.sin(a)*0.45); });
    if(H.cape){ var ca=H.cape.geometry.attributes.position, cb=H.cape.userData.b; for(var v=0;v<ca.count;v++){ var yy=cb[v*3+1]; ca.setZ(v,Math.sin(S.t*6+yy*6)*0.03*(0.3-yy)+(moving?(0.3-yy)*0.25:0)); } ca.needsUpdate=true; }
    if(H.form>=3&&HC.k==='assassin'&&moving&&Math.random()<0.6) fx.emit(H.x,0.8,H.z,0,0.3,0,0x7c3aed,0.4);
    if(H.form>=2&&Math.random()<0.08*H.form) fx.emit(H.x+rnd(-0.4,0.4),0.3,H.z+rnd(-0.4,0.4),0,1.2,0,H.aura?H.aura.material.color.getHex():0xfde68a,0.6);
    if(noMark.material.opacity>0) noMark.material.opacity=Math.max(0,noMark.material.opacity-dt*1.5);
    if(marker.material.opacity>0) marker.material.opacity=Math.max(0,marker.material.opacity-dt*1.2); }

  // --- HUD ---
  var hud=el('div','position:absolute;inset:0;pointer-events:none;font-family:'+FONT+';'); root.appendChild(hud);
  var css=document.createElement('style'); css.textContent=
    '.twb{position:relative;overflow:hidden;box-shadow:0 4px 0 rgba(0,0,0,.28),0 6px 14px rgba(0,0,0,.18),inset 0 2px 0 rgba(255,255,255,.35);text-shadow:0 1px 0 rgba(0,0,0,.25);transition:transform .08s,box-shadow .08s;}'+
    '.twb::after{content:"";position:absolute;left:0;right:0;top:0;height:48%;background:linear-gradient(rgba(255,255,255,.28),rgba(255,255,255,0));pointer-events:none;border-radius:inherit;}'+
    '.twb:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.28),inset 0 2px 0 rgba(255,255,255,.25);}'+
    '.twc{background:linear-gradient(180deg,#fffdf6,#fff6e3)!important;border:3px solid #fff;outline:3px solid rgba(21,128,61,.55);box-shadow:0 14px 40px rgba(0,0,0,.35)!important;}'+
    '.twc::before{content:"";display:block;height:6px;margin:-20px -18px 14px;border-radius:14px 14px 0 0;background:linear-gradient(90deg,#16a34a,#facc15,#16a34a);}'+
    '@keyframes twPop{0%{transform:scale(.85);opacity:0}100%{transform:scale(1);opacity:1}} .twc{animation:twPop .22s ease-out;}';
  root.appendChild(css);
  var vig=el('div','position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 55%,'+(WORLD===5?'rgba(5,0,20,.7)':'rgba(10,30,20,.35)')+' 100%);'); root.insertBefore(vig,hud);
  var pill='background:linear-gradient(180deg,rgba(34,78,52,.92),rgba(16,42,28,.92));color:#fff;border-radius:14px;padding:6px 12px;font-weight:900;border:2px solid rgba(255,255,255,.28);box-shadow:0 3px 10px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.2);text-shadow:0 1px 0 rgba(0,0,0,.35);';
  var topL=el('div','position:absolute;left:10px;top:calc(10px + env(safe-area-inset-top));display:flex;gap:6px;');
  topL.appendChild(el('div',pill,'<div style="font-size:10px;opacity:.75;">STAGE</div><div id="twStage" style="font-size:18px;line-height:1.1;"></div>'));
  topL.appendChild(el('div',pill,'<div style="font-size:10px;opacity:.75;">ウェーブ</div><div id="twWave" style="font-size:18px;line-height:1.1;"></div>'));
  hud.appendChild(topL);
  var right=el('div','position:absolute;right:10px;top:calc(10px + env(safe-area-inset-top));display:flex;gap:6px;align-items:center;pointer-events:auto;');
  right.appendChild(el('div',pill+'font-size:16px;','❤️ <span id="twHp"></span>'));
  right.appendChild(el('div',pill+'font-size:16px;','🪙 <span id="twCoin"></span>'));
  var pauseBtn=el('button',pill+'font-size:18px;border:none;width:40px;height:40px;padding:0;cursor:pointer;','Ⅱ'); right.appendChild(pauseBtn); hud.appendChild(right);
  var boltBtn=el('button','position:absolute;right:14px;bottom:calc(18px + env(safe-area-inset-bottom));pointer-events:auto;border:3px solid #fff;border-radius:50%;width:74px;height:74px;font-size:30px;font-weight:900;background:radial-gradient(circle at 35% 30%,#fde68a,#f59e0b);color:#7c2d12;box-shadow:0 4px 14px rgba(0,0,0,.35);display:none;cursor:pointer;font-family:inherit;line-height:1;','⚡<div id="twBolt" style="font-size:13px;"></div>');
  hud.appendChild(boltBtn);
  var spdBtn=el('button','position:absolute;left:12px;bottom:calc(18px + env(safe-area-inset-bottom));pointer-events:auto;'+pill+'border:2px solid #fff;font-size:16px;padding:8px 12px;cursor:pointer;font-family:inherit;','⏩ ×1');
  hud.appendChild(spdBtn); spdBtn.onclick=function(e){ e.stopPropagation(); S.speed=S.speed===1?2:1; spdBtn.innerHTML='⏩ ×'+S.speed; spdBtn.style.background=S.speed===2?'#ea580c':''; snd('tap'); };
  var nightBtn=el('button','position:absolute;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);pointer-events:auto;border:3px solid #fff;border-radius:18px;background:linear-gradient(#4338ca,#1e1b4b);color:#fff;font-weight:900;font-size:18px;padding:12px 22px;cursor:pointer;font-family:inherit;display:none;box-shadow:0 6px 18px rgba(0,0,0,.35);white-space:nowrap;','🌙 よるに する<div style="font-size:11px;opacity:.85;">てきが くる</div>');
  hud.appendChild(nightBtn);
  function dayStart(){ if(S.over) return; S.phase='day'; S.night=false; nightBtn.style.display='block'; say('☀️ あさ！ たてる じかん','#fef3c7',1200); }
  nightBtn.onclick=function(e){ e.stopPropagation(); if(S.over||S.paused||S.phase!=='day') return; nightBtn.style.display='none'; S.night=true; S.phase='wait'; snd('crash'); nextWave(); };
  var callBtn=el('button','position:absolute;left:50%;top:calc(62px + env(safe-area-inset-top));transform:translateX(-50%);pointer-events:auto;border:2px solid #fff;border-radius:12px;background:#b91c1c;color:#fff;font-weight:900;font-size:13px;padding:6px 12px;cursor:pointer;font-family:inherit;display:none;box-shadow:0 3px 10px rgba(0,0,0,.3);','⚔ つぎの ウェーブを よぶ 🪙+10');
  hud.appendChild(callBtn); callBtn.onclick=function(e){ e.stopPropagation(); if(S.over||S.paused||S.called) return; S.called=true; callBtn.style.display='none'; S.coins+=10; hud2(); say('はやよび！ 🪙+10','#fecaca',900); nextWave(); };
  var st=document.createElement('style'); st.textContent='@keyframes twBoss{0%{transform:translate(-50%,-50%) scale(2.2);opacity:0}15%{transform:translate(-50%,-50%) scale(1);opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.05)}}'; root.appendChild(st);
  var evoBan=el('div','position:absolute;left:50%;top:34%;display:none;font-weight:900;font-size:30px;color:#fff;text-align:center;background:linear-gradient(90deg,transparent,rgba(202,138,4,.92) 20%,rgba(202,138,4,.92) 80%,transparent);padding:8px 50px;white-space:nowrap;-webkit-text-stroke:5px rgba(80,50,0,.8);paint-order:stroke fill;line-height:1.2;',''); hud.appendChild(evoBan);
  var bossBan=el('div','position:absolute;left:50%;top:30%;display:none;font-weight:900;font-size:34px;color:#fff;background:linear-gradient(90deg,transparent,rgba(185,28,28,.9) 20%,rgba(185,28,28,.9) 80%,transparent);padding:8px 40px;white-space:nowrap;-webkit-text-stroke:5px rgba(60,0,0,.8);paint-order:stroke fill;','⚠ ボス しゅつげん！'); hud.appendChild(bossBan);
  var modLab=el('div','position:absolute;left:50%;top:calc(100px + env(safe-area-inset-top));transform:translateX(-50%);background:rgba(88,28,135,.88);color:#fff;border-radius:10px;padding:4px 10px;font-weight:900;font-size:12px;white-space:nowrap;display:none;'); hud.appendChild(modLab);
  var rsBtn=el('button','position:absolute;right:14px;bottom:calc(100px + env(safe-area-inset-bottom));pointer-events:auto;border:3px solid #fff;border-radius:16px;padding:6px 10px;font-size:16px;font-weight:900;background:linear-gradient(#3b82f6,#1d4ed8);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.3);display:none;cursor:pointer;font-family:inherit;','🔬 0');
  hud.appendChild(rsBtn);
  var newEn=el('div','position:absolute;left:10px;top:calc(62px + env(safe-area-inset-top));'+pill+'font-size:12px;display:none;'); hud.appendChild(newEn);
  var frz=el('div','position:absolute;inset:0;box-shadow:inset 0 0 60px 20px rgba(125,211,252,.7);opacity:0;transition:opacity .3s;'); hud.appendChild(frz);
  var blz=el('div','position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(255,255,255,.15),rgba(230,240,255,.6));opacity:0;transition:opacity .6s;'); hud.appendChild(blz);
  var labels=el('div','position:absolute;inset:0;'); hud.appendChild(labels);
  var toast=el('div','position:absolute;left:50%;top:36%;transform:translate(-50%,-50%);font-weight:900;font-size:30px;color:#fff;-webkit-text-stroke:6px rgba(20,40,20,.85);paint-order:stroke fill;opacity:0;transition:opacity .2s;text-align:center;white-space:nowrap;');
  hud.appendChild(toast);
  var hint=el('div','position:absolute;left:50%;bottom:calc(22px + env(safe-area-inset-bottom));transform:translateX(-50%);'+pill+'font-size:13px;text-align:center;line-height:1.7;white-space:nowrap;',
    'じめんを タップで どこでも タワーを たてる<br>みちを タップで ゆうしゃが いどう<br><span style="color:#fde047;">えいごに せいかいで コインと ⚡かみなり！</span>');
  hud.appendChild(hint);
  var menu=el('div','position:absolute;left:50%;bottom:calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(94vw,420px);background:linear-gradient(180deg,rgba(255,253,246,.98),rgba(255,246,227,.98));border:3px solid #fff;border-radius:18px;padding:10px;box-sizing:border-box;display:none;pointer-events:auto;box-shadow:0 6px 20px rgba(0,0,0,.3);color:#14532d;font-weight:900;');
  hud.appendChild(menu);
  var panel=el('div','position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,30,20,.45);pointer-events:auto;'); root.appendChild(panel);
  function say(t,color,ms){ toast.innerHTML=t; toast.style.color=color||'#fff'; toast.style.opacity='1'; clearTimeout(say.t); say.t=setTimeout(function(){ toast.style.opacity='0'; },ms||900); }
  function snd(k){ try{ opt.sfx&&opt.sfx(k); }catch(e){} }
  function showPanel(html,btns){ panel.innerHTML=''; panel.style.display='flex';
    var card=el('div','background:#fffaf0;border-radius:20px;padding:20px 18px;width:min(88vw,350px);max-height:86vh;overflow:auto;box-sizing:border-box;text-align:center;font-family:'+FONT+';color:#14532d;box-shadow:0 10px 30px rgba(0,0,0,.25);',html);
    btns.forEach(function(b){ var bt=el('button','display:block;width:100%;margin-top:10px;border:none;border-radius:12px;padding:13px 8px;font-size:17px;font-weight:900;color:#fff;background:'+b.c+';font-family:inherit;cursor:pointer;line-height:1.5;',b.t);
      bt.className='twb'; bt.onclick=function(e){ e.stopPropagation(); b.f(); }; card.appendChild(bt); });
    card.className='twc';
    panel.appendChild(card); }

  // --- じょうたい ---
  var stage=STG, NW=5+Math.min(4,Math.floor((WORLD+SUB-2)/2));
  // けんきゅう（★で つよくなる・ずっと のこる）
  var S={graves:[],speed:1,streak:0,freeze:0,slow:0,coins:40+stage*10,hp:20,maxHp:20,wave:0,phase:'prep',prepT:0,spawnQ:[],spawnT:0,en:[],proj:[],bolts:0,right:0,wrong:0,kills:0,over:false,paused:false,last:0,t:0,shake:0,seen:{}};
  R.S=S;
  document.getElementById('twStage').textContent=stage;
  var ECO=Math.max(0.65,1-0.01*(STG-1));   // あとの ステージは コインが すこし へる
  function baseHp(w){ return 4*(1+0.15*(SUB-1))*(1+0.22*(w-1))*(1+0.15*(stage-1))*Math.pow(1.05,stage-1)*(1+0.6*LOOP); }   // あとの ステージほど ぐんと つよく
  var WPOOL=[[['f',2],['sl',2],['ra',1],['b',1],['th',1]],[['f',2],['fly',2],['sh',2],['mo',2],['bm',1],['sp',1],['sa',1]],[['ra',1],['mo',2],['heal',1],['cham',2],['gd',1],['th',1],['go',1]],[['f',2],['fb',2],['b',1],['bm',2],['flag',1],['nc',1],['sl',2]],[['gh',2],['sh',2],['nc',1],['flag',1],['gd',1],['sa',1],['go',1],['sp',1],['cham',1]]];
  function heavy(){ var h=[]; if(SUB>=4||WORLD>=2) h.push(['tr',Math.min(2,0.5+stage*0.06)]); if(SUB>=6||WORLD>=3) h.push(['kn',Math.min(2,0.3+stage*0.05)]); return h; }
  function makeWave(w){ var q=[], n=Math.round((8+w*4+stage*1.4)*(S.mod&&S.mod.k==='swarm'?1.4:1)), u=w+SUB-1, pool=[['n',5]].concat(WPOOL[WORLD-1].slice(0,Math.min(9,1+Math.floor(u/1.6)))).concat(w>=3?heavy():[]);
    var tot=pool.reduce(function(a,b){ return a+b[1]; },0);
    for(var i=0;i<n;i++){ var r=Math.random()*tot, ty='n'; for(var j=0;j<pool.length;j++){ r-=pool[j][1]; if(r<=0){ ty=pool[j][0]; break; } }
      if(ty==='ra'){ for(var rr=0;rr<4;rr++) q.push({ty:'ra',gap:0.15}); }
      q.push({ty:ty,gap:ty==='b'||ty==='sh'||ty==='go'||ty==='kn'||ty==='tr'?1.0:ty==='f'?0.35:0.5}); }
    if(w===NW){ q.splice(Math.floor(n*0.6),0,{ty:'boss',gap:1.2}); }
    q.forEach(function(it){ if(it.ty==='fb') it.gap=0.4; });
    return q; }
  function hud2(){ var hasLab=pads.some(function(q){ return q.type==='lab'&&q.lv; }); rsBtn.style.display=(hasLab||(S.rp||0)>0)&&!S.over?'block':'none'; rsBtn.textContent='🔬 '+(S.rp||0); document.getElementById('twHp').textContent=Math.max(0,S.hp); document.getElementById('twCoin').textContent=S.coins;
    document.getElementById('twWave').textContent=Math.min(S.wave,NW)+'/'+NW; boltBtn.style.display=S.bolts>0&&!S.over?'block':'none'; document.getElementById('twBolt').textContent='×'+S.bolts; if(sel) renderMenu(); }

  // --- えいごの もんだい（ウェーブの まえ） ---
  function askEnglish(then,chest,bm){
    var q=opt.getQuestion&&opt.getQuestion(); if(!q){ then(false); return; } S.q=q;
    var order=[0,1,2].slice(0,q.choices.length).sort(function(){ return Math.random()-0.5; }), t0=Date.now();
    S.paused=true; S.asking=true; closeMenu();
    try{ opt.speak&&opt.speak(q.en); }catch(e){}
    var hot=S.streak>=2, bonus=Math.round((15+S.wave*5)*(hot?1.5:1));
    var head=bm?'<div style="font-size:24px;">⚔</div><div style="font-size:14px;font-weight:900;color:#b91c1c;">ボス えいごバトル '+bm.i+'/'+bm.n+'</div><div style="font-size:11px;opacity:.75;">せいかいで '+escH(bm.name)+'に だいダメージ！ まちがえると かいふく</div>'
      :chest?'<div style="font-size:26px;">🎁</div><div style="font-size:12px;font-weight:800;opacity:.7;">たからばこ！ せいかいで ごほうび</div>'
      :'<div style="font-size:12px;font-weight:800;opacity:.7;">えいごチャレンジ　せいかいで 🪙+'+bonus+' と ⚡</div>'+(hot?'<div style="font-size:12px;color:#ea580c;font-weight:900;">🔥 '+S.streak+'れんぞく せいかいちゅう！ ボーナス 1.5ばい</div>':'');
    showPanel(head+
      '<div style="font-size:34px;font-weight:900;font-family:Arial,Helvetica,sans-serif;color:#1e3a8a;margin:6px 0 4px;">'+escH(q.en)+'</div>'+
      '<div style="font-size:12px;opacity:.7;">いみは どれ？</div>',
      order.map(function(ci){ return {t:rb(q.choices[ci],(q.yomi||[])[ci]),c:'#15803d',f:function(){
        var ok=ci===0; try{ opt.onAnswer&&opt.onAnswer(q.en,ok,Date.now()-t0); }catch(e){}
        panel.style.display='none'; S.paused=false; S.asking=false; S.last=0;
        if(ok){ S.right++; S.streak++; snd('correct');
          if(bm){} else if(chest) chestReward(); else { S.coins+=bonus; S.bolts++; say((S.streak>=3?'🔥'+S.streak+'れんぞく！<br>':'せいかい！ ')+'🪙+'+bonus+' ⚡','#bbf7d0',1400); } }
        else { S.wrong++; S.streak=0; snd('wrong'); say('<span style="font-size:22px;">'+escH(q.en)+' ＝ '+rb(q.choices[0],(q.yomi||[])[0])+'</span>','#fecaca',2000); }
        hud2(); then(ok); }}; }));
  }
  // たからばこ（ウェーブの とちゅうに でる）：タップ → えいご → ごほうび
  var chestM=null;
  (function(){ var L=[P(new THREE.BoxGeometry(0.9,0.5,0.6),'#a16207',0,0.25,0),P(new THREE.BoxGeometry(0.94,0.08,0.64),'#fbbf24',0,0.5,0),P(new THREE.CylinderGeometry(0.3,0.3,0.92,10,1,false,0,Math.PI),'#b45309',0,0.52,0,1,1,1.05,0,0,Math.PI/2),
      P(new THREE.BoxGeometry(0.14,0.2,0.05),'#fde047',0,0.42,-0.32)];
    chestM=new THREE.Group(); chestM.add(new THREE.Mesh(M(L),lam)); var gl=new THREE.Sprite(new THREE.SpriteMaterial({map:SPARK,color:0xffe066,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); gl.scale.set(2.4,2.4,1); gl.position.y=0.5; chestM.add(gl); chestM.userData.glow=gl;
    chestM.visible=false; scene.add(chestM); })();
  function spawnChest(){ for(var tr=0;tr<30;tr++){ var s0=rnd(PLEN*0.2,PLEN*0.8), q0=atS(s0), l0=Math.hypot(q0.dx,q0.dz)||1, sd=Math.random()<0.5?1:-1, x=q0.x-q0.dz/l0*1.9*sd, z=q0.z+q0.dx/l0*1.9*sd;
      if(Math.abs(x)>6.5||nearPad(x,z,1.4)) continue; S.chest={x:x,z:z,t:9}; chestM.position.set(x,0,z); chestM.visible=true; ringFx(x,z,0xffe066,1.6,0.6); snd('coin'); say('🎁 たからばこ！ タップ！','#fde68a',1200); return; } }
  function chestReward(){ var r=Math.random();
    if(r<0.4){ S.freeze=4; say('⏸ じかんが とまった！','#bae6fd',1400); ringFx(0,0,0xbae6fd,14,0.8); }
    else if(r<0.75){ var c=30+S.wave*5; S.coins+=c; say('🪙+'+c+'！','#fde68a',1300); }
    else { S.bolts++; say('⚡ かみなり +1！','#fde68a',1300); } hud2(); }
  function weakTxt(k){ var w=ET[k].weak||{}, g=[], b=[]; for(var t in w){ if(w[t]>1) g.push(TICO[t]); else if(w[t]<1) b.push(TICO[t]); } return (g.length?'（よわい:'+g.join('')+(b.length?' つよい:'+b.join(''):'')+'）':b.length?'（つよい:'+b.join('')+'）':''); }
  function drawCards(then){ S.paused=true; S.asking=true; closeMenu();
    var pool=CARDS.slice(), pick=[]; while(pick.length<3&&pool.length){ var tot=pool.reduce(function(a,c){ return a+[6,3,1][c.r]; },0), r=Math.random()*tot;
      for(var i=0;i<pool.length;i++){ r-=[6,3,1][pool[i].r]; if(r<=0){ pick.push(pool.splice(i,1)[0]); break; } } }
    var RC=['#15803d','#2563eb','#c026d3'], RN=['ふつう','レア','スーパーレア'];
    showPanel('<div style="font-size:22px;font-weight:900;">🃏 カードを 1まい えらぼう</div><div style="font-size:12px;opacity:.7;">えらんだ こうかは この ステージの あいだ つづく（かさなる）</div>'+
      (Object.keys(S.card).length?'<div style="font-size:12px;margin-top:4px;">もっている：'+CARDS.filter(function(c){ return S.card[c.k]; }).map(function(c){ return c.ico+(S.card[c.k]>1?'×'+S.card[c.k]:''); }).join(' ')+'</div>':''),
      pick.map(function(c){ return {t:'<div style="display:flex;align-items:center;gap:8px;text-align:left;"><span style="font-size:28px;">'+c.ico+'</span><span style="flex:1;"><span style="font-size:10px;opacity:.85;">'+RN[c.r]+'</span><br>'+c.name+'<br><span style="font-size:12px;font-weight:700;">'+c.txt+'</span></span></div>',c:RC[c.r],f:function(){
        S.card[c.k]=(S.card[c.k]||0)+1; if(c.k==='hp'){ S.hp+=5; S.maxHp+=5; } if(c.k==='bolt') S.bolts+=2;
        panel.style.display='none'; S.paused=false; S.asking=false; S.last=0; snd('correct'); say(c.ico+' '+c.name+'！','#fde68a',900); hud2(); then(); }}; })); }
  function showLab(){ S.paused=true; closeMenu(); var rp=S.rp||0;
    showPanel('<div style="font-size:22px;font-weight:900;">🔬 けんきゅう</div><div style="font-size:12px;opacity:.75;">けんきゅうじょで たまった ポイントで つよくなる（のこり 🔬'+rp+'）</div>',
      RSCH.map(function(r){ var lv=S.card[r.k]||0, cost=1+lv; return {t:'<div style="display:flex;align-items:center;gap:6px;text-align:left;"><span style="font-size:22px;">'+r.ico+'</span><span style="flex:1;">'+r.name+(lv?' Lv'+lv:'')+'<br><span style="font-size:11px;font-weight:700;">'+r.txt+'</span></span><span>🔬'+cost+'</span></div>',
        c:rp>=cost?'#1d4ed8':'#9ca3af',f:function(){ if((S.rp||0)<cost){ snd('wrong'); return; } S.rp-=cost; S.card[r.k]=lv+1; snd('correct'); hud2(); showLab(); }}; }).concat([{t:'とじる',c:'#6b7280',f:function(){ panel.style.display='none'; S.paused=false; S.last=0; }}])); }
  rsBtn.onclick=function(e){ e.stopPropagation(); if(!S.over&&!S.asking) showLab(); };
  function nextWave(){ S.wave++; S.mod=(S.wave>=2&&Math.random()<0.5)?MODS[Math.floor(Math.random()*MODS.length)]:null; hud2();
    if(S.mod){ modLab.innerHTML=S.mod.ico+' '+S.mod.name+'：'+S.mod.txt; modLab.style.display='block'; } else modLab.style.display='none';
    askEnglish(function(){ S.phase='prep'; S.prepT=S.wave===1?1.5:3;
      var nw=makeWave(S.wave), fresh=[]; nw.forEach(function(it){ if(!S.seen[it.ty]&&it.ty!=='n'){ S.seen[it.ty]=1; fresh.push(it.ty); } }); S.nextQ=nw;
      if(fresh.length){ newEn.innerHTML='あたらしい てき：'+fresh.map(function(k){ return EICO[k]+ET[k].name+weakTxt(k); }).join('・'); newEn.style.display='block'; setTimeout(function(){ newEn.style.display='none'; },7000); }
      setTimeout(function(){ if(S.over) return; var bw=S.wave===NW; say('ウェーブ '+S.wave+(bw?'　ボスが くる！':''),bw?'#fecaca':'#fff',1300); },S.wave===1?0:1400); }); }

  // --- タップ：タワーを えらぶ／レベルアップ／うる ---
  var sel=null;
  function closeMenu(){ if(sel&&sel.temp&&!sel.lv) removePad(sel); sel=null; menu.style.display='none'; rangeRing.visible=false; rangeFill.visible=false; }
  S.card={}; S.mod=null;
  function cv(k){ return S.card[k]||0; }
  function rangeOf(q,L){ return (L.range||0)*(q.high?1.25:1)*(1+0.1*cv('range'))*(S.mod&&S.mod.k==='fog'?0.85:1)*(S.blizz>0?0.8:1)*(WORLD===5?0.92:1); }
  function costOf(c){ return Math.max(5,Math.round(c*(1-0.12*Math.min(4,cv('cost'))))); }
  function showRange(p,type,lv,br,br2){ var r=rangeOf(p,Lof(type,lv,br,br2)); if(!r){ rangeRing.visible=false; rangeFill.visible=false; return; } [rangeRing,rangeFill].forEach(function(m){ m.visible=true; m.position.set(p.x,0.22,p.z); m.scale.setScalar(r); }); }
  function btn(html,ok,f){ var b=el('button','flex:1;min-width:0;border:none;border-radius:12px;padding:7px 2px;font-family:inherit;font-weight:900;cursor:pointer;line-height:1.25;color:#fff;background:'+(ok?'#15803d':'#9ca3af')+';font-size:12px;',html);
    b.className='twb'; b.onclick=function(e){ e.stopPropagation(); f(); }; return b; }
  function renderMenu(){ var p=sel; if(!p) return; menu.innerHTML=''; menu.style.display='block';
    var row=el('div','display:flex;gap:6px;');
    if(!p.lv){ menu.appendChild(el('div','font-size:12px;opacity:.7;margin:0 0 6px 4px;','どの タワーに する？'));
      TKEYS.forEach(function(k){ var T=TT[k], c=costOf(T.lv[0].cost), ok=S.coins>=c;
        var b=btn('<div style="font-size:24px;">'+T.ico+'</div>'+T.name+'<div style="font-size:10px;opacity:.9;">'+T.desc+'</div><div>🪙'+c+'</div>',ok,function(){ build(p,k); });
        b.onpointerenter=function(){ showRange(p,k,1); }; row.appendChild(b); });
      menu.appendChild(row); menu.appendChild(el('div','font-size:12px;opacity:.7;margin:8px 0 6px 4px;','🏘 しせつ（まちづくり）')); row=el('div','display:flex;gap:6px;');
      FKEYS.forEach(function(k){ var T=TT[k], c=costOf(T.lv[0].cost), ok=S.coins>=c;
        var b=btn('<div style="font-size:22px;">'+T.ico+'</div>'+T.name+'<div style="font-size:9px;opacity:.9;">'+T.desc+'</div><div>🪙'+c+'</div>',ok,function(){ build(p,k); }); b.style.background=ok?'#a16207':'#9ca3af';
        b.onpointerenter=function(){ showRange(p,k,1); }; row.appendChild(b); });
      showRange(p,'arrow',1); }
    else { var T=TT[p.type]; menu.appendChild(el('div','font-size:14px;margin:0 0 6px 4px;',T.ico+' '+T.name+(T.fac?'':' タワー')+'　Lv'+p.lv+(p.lv===4?'　'+BR[p.type][p.br].ico+BR[p.type][p.br].name:p.lv>=5?'　'+Lof(p.type,5,p.br,p.br2).ico+Lof(p.type,5,p.br,p.br2).name+'（きわみ）':'')));
      if(p.lv===4){ B5[BR[p.type][p.br].key].forEach(function(bb,bi){ var cb=costOf(bb.cost), okb=S.coins>=cb; var b3=btn('<div style="font-size:18px;">'+bb.ico+'</div>'+bb.name+'<div style="font-size:9px;">'+bb.desc+'</div><div>🪙'+cb+'</div>',okb,function(){ upgrade(p,bi); }); b3.style.background=okb?(bi?'#6d28d9':'#b45309'):'#9ca3af'; b3.onpointerenter=function(){ showRange(p,p.type,5,p.br,bi); }; row.appendChild(b3); }); }
      if(p.lv===3&&BR[p.type]){ BR[p.type].forEach(function(bb,bi){ var okb=S.coins>=bb.cost; var b2=btn('<div style="font-size:18px;">'+bb.ico+'</div>'+bb.name+'<div style="font-size:10px;">'+bb.desc+'</div><div>🪙'+bb.cost+'</div>',okb,function(){ upgrade(p,bi); }); b2.style.background=okb?(bi?'#0e7490':'#be123c'):'#9ca3af'; b2.onpointerenter=function(){ showRange(p,p.type,4,bi); }; row.appendChild(b2); }); }
      if(p.lv<3){ var c2=costOf(T.lv[p.lv].cost), ok2=S.coins>=c2; row.appendChild(btn('<div style="font-size:18px;">⬆</div>レベル'+(p.lv+1)+'<div>🪙'+c2+'</div>'+(T.fac?'<div style="font-size:10px;">'+facTxt(p.type,p.lv+1)+'</div>':p.lv===2?'<div style="font-size:10px;">'+(p.type==='arrow'?'れんしゃ':p.type==='magic'?'れんさ まほう':p.type==='ice'?'まわりも こおる':'だい ばくはつ')+'</div>':''),ok2,function(){ upgrade(p); })); }
      if(!TT[p.type].eco){ var PR=['🚩さきとう','💪つよい','📍ちかい']; row.appendChild(btn('<div style="font-size:18px;">🎯</div>ねらい<div style="font-size:11px;">'+PR[p.prio||0]+'</div>',true,function(){ p.prio=((p.prio||0)+1)%3; snd('tap'); renderMenu(); })); row.lastChild.style.background='#b45309'; }
      else menu.appendChild(el('div','font-size:11px;margin:-2px 4px 6px;',facTxt(p.type,p.lv)));
      var back=Math.floor(p.spent*0.6); row.appendChild(btn('<div style="font-size:18px;">💰</div>うる<div>🪙+'+back+'</div>',true,function(){ sell(p); }));
      showRange(p,p.type,p.lv,p.br,p.br2); }
    row.appendChild(btn('<div style="font-size:18px;">✕</div>とじる',true,closeMenu)); row.lastChild.style.background='#6b7280'; row.lastChild.style.flex='0.6';
    menu.appendChild(row); hint.style.display='none'; }
  function facTxt(k,lv){ var X=TT[k].lv[lv-1]; return X.gold?'ウェーブごとに 🪙+'+X.gold:X.rp?'ウェーブごとに 🔬+'+X.rp:X.heal?'ウェーブごとに ❤️+'+X.heal:X.buff?'まわりの タワー ダメージ +'+Math.round(X.buff*100)+'%':''; }
  function build(p,k){ if(k==='mine') S.usedMine=true; setTimeout(function(){ S.maxTw=Math.max(S.maxTw||0,pads.filter(function(q){ return q.lv; }).length); },0); var c=costOf(TT[k].lv[0].cost); if(S.coins<c){ say('🪙が たりない','#fecaca',700); snd('wrong'); return false; }
    S.coins-=c; p.temp=false; p.type=k; p.lv=1; p.spent=c; p.cd=0.3; setTower(p); snd('coin'); fx.burst(p.x,1.2,p.z,26,0xfff1b8,4,0.7); ringFx(p.x,p.z,0xfff1b8,2,0.45); closeMenu(); hud2(); return true; }
  function upgrade(p,bi){ if(p.lv>=5||(TT[p.type].eco&&p.lv>=3)) return false; if(bi===undefined&&p.lv>=3) bi=Math.random()<0.5?0:1; var c=costOf(p.lv===4?Lof(p.type,5,p.br,bi).cost:Lof(p.type,p.lv+1,bi).cost); if(S.coins>=c){ if(p.lv===3) p.br=bi; if(p.lv===4) p.br2=bi; } if(S.coins<c){ say('🪙が たりない','#fecaca',700); snd('wrong'); return false; }
    S.coins-=c; p.spent+=c; p.lv++; setTower(p); snd('correct'); fx.burst(p.x,1.8,p.z,34,0x93c5fd,4.5,0.8); ringFx(p.x,p.z,0x93c5fd,2.4,0.5); if(p.lv===5){ var f5=Lof(p.type,5,p.br,p.br2); S.slow=0.6; fx.burst(p.x,2,p.z,60,0xfde047,6,1); ringFx(p.x,p.z,0xfde047,3.5,0.7); }
    say(p.lv===5?'✨ きわみ しんか！<br>'+Lof(p.type,5,p.br,p.br2).ico+' '+Lof(p.type,5,p.br,p.br2).name:p.lv===4?BR[p.type][p.br].ico+' '+BR[p.type][p.br].name+' に しんか！':'レベル '+p.lv+'！',p.lv>=4?'#fde68a':'#fff',1300); if(sel===p) renderMenu(); hud2(); return true; }
  // じゆうに たてる：みち・き・がけ・いけ・おしろ・もん・ほかの タワーの そば いがいなら どこでも
  function canBuild(x,z){ if(Math.abs(x)>9.8||z<-14.2||z>12.6) return 'そとがわ'; if(distToPath(x,z)<1.75) return 'みち';
    if(pads.some(function(q){ return Math.hypot(q.x-x,q.z-z)<1.8; })) return 'タワー'; if(OBST.some(function(o){ return Math.hypot(o.x-x,o.z-z)<o.r+0.8; })) return 'き';
    if(CLIFF.some(function(c){ return Math.abs(x-c[0])<c[2]/2+0.8&&Math.abs(z-c[1])<c[4]/2+0.8; })) return 'がけ';
    if(Math.hypot(x-CS.x,z-CS.z)<3.6||Math.hypot(x-g0[0],z-(g0[1]+1))<2.8) return 'おしろ'; if(pond&&Math.hypot(x-pond.x,z-pond.z)<pond.r+1.0) return 'いけ'; return null; }
  function newPad(x,z){ var p={x:x,z:z,lv:0,type:null,cd:0,mesh:null,aim:0,spent:0,prio:0,temp:true}; padMeshes(p); p.ring.visible=true; pads.push(p); addLbl(); return p; }
  function removePad(p){ var i=pads.indexOf(p); if(i<0||p.high) return; [p.base,p.ring,p.mesh].forEach(function(m){ if(m) scene.remove(m); }); pads.splice(i,1); var d=lbl.splice(i,1)[0]; if(d) d.remove(); }
  var noMark=new THREE.Mesh(new THREE.RingGeometry(0.4,0.6,4),new THREE.MeshBasicMaterial({color:0xef4444,transparent:true,opacity:0,depthWrite:false})); noMark.rotation.x=-Math.PI/2; noMark.position.y=0.3; scene.add(noMark);
  function sell(p){ S.coins+=Math.floor(p.spent*0.6); scene.remove(p.mesh); p.mesh=null; p.head=null; p.lv=0; p.br=undefined; p.br2=undefined; p.orbs=null; p.type=null; p.spent=0; p.ring.visible=true; fx.burst(p.x,1,p.z,20,0xffd34d,3,0.6); snd('coin'); closeMenu(); if(!p.high) removePad(p); hud2(); }
  var ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), gpl=new THREE.Plane(new THREE.Vector3(0,1,0),0), hitP=new THREE.Vector3();
  function tap(e){ if(S.over||S.paused) return; var pt=e.touches?e.touches[0]:e, rc=renderer.domElement.getBoundingClientRect();
    ndc.set((pt.clientX-rc.left)/rc.width*2-1,-(pt.clientY-rc.top)/rc.height*2+1); ray.setFromCamera(ndc,cam);
    if(!ray.ray.intersectPlane(gpl,hitP)) return;
    if(S.chest&&Math.hypot(S.chest.x-hitP.x,S.chest.z-0.4-hitP.z)<1.4){ var cx=S.chest.x, cz=S.chest.z; S.chest=null; chestM.visible=false; fx.burst(cx,0.6,cz,30,0xffe066,4,0.6); askEnglish(function(){},true); return; }
    var best=null, bd=1.2; pads.forEach(function(q){ if(q.temp) return; var d=Math.hypot(q.x-hitP.x,q.z-hitP.z); if(q.lv>0) d=Math.min(d,Math.hypot(q.x-hitP.x,q.z-1.3-hitP.z)); if(d<bd){ bd=d; best=q; } });
    if(best){ closeMenu(); sel=best; renderMenu(); snd('tap'); return; }
    closeMenu(); hint.style.display='none';
    if(distToPath(hitP.x,hitP.z)<1.5){ hero.tx=hitP.x; hero.tz=hitP.z; marker.position.set(hitP.x,0.25,hitP.z); marker.material.opacity=1; return; }   // みちを タップ → ゆうしゃが いどう
    var gx=Math.round(hitP.x*2)/2, gz=Math.round(hitP.z*2)/2, why=canBuild(gx,gz);
    if(why){ noMark.position.set(hitP.x,0.3,hitP.z); noMark.material.opacity=0.9; say('<span style="font-size:18px;">ここには たてられない（'+why+'）</span>','#fecaca',700); snd('wrong'); return; }
    sel=newPad(gx,gz); renderMenu(); snd('tap'); }
  renderer.domElement.addEventListener('pointerdown',tap);
  boltBtn.onclick=function(e){ e.stopPropagation(); if(S.bolts<=0||S.over||S.paused) return;
    var best=null, bn=-1; S.en.forEach(function(a){ if(a.dead) return; var n=0; S.en.forEach(function(b){ if(!b.dead&&Math.hypot(a.x-b.x,a.z-b.z)<2.6) n++; }); if(a.ty==='boss') n+=6; if(n>bn){ bn=n; best=a; } });
    if(!best){ say('てきが いない','#fff',600); return; }
    S.bolts--; hud2(); var bx=best.x, bz=best.z, dmg=baseHp(S.wave)*8*(1+0.3*cv('bolt'));
    S.en.forEach(function(a){ if(!a.dead&&Math.hypot(a.x-bx,a.z-bz)<2.8) hurt(a,a.ty==='boss'?dmg*0.6:dmg,true); });
    bolt.position.set(bx,15,bz); bolt.visible=true; bolt.material.opacity=1; S.boltT=0.5; ringFx(bx,bz,0xfff3b0,4,0.6); ringFx(bx,bz,0xbfe6ff,2.5,0.4);
    fx.burst(bx,0.5,bz,70,0xbfe6ff,8,0.8); fx.burst(bx,0.5,bz,30,0xffffff,4,0.5); S.shake=0.9; snd('crash'); };

  // --- ポーズ ---
  function setPause(p){ if(S.asking) return; S.paused=p; pauseBtn.textContent=p?'▶':'Ⅱ';
    if(p){ closeMenu(); showPanel('<div style="font-size:26px;font-weight:900;margin-bottom:14px;">ひとやすみ</div>',[{t:'つづける',c:'#15803d',f:function(){ setPause(false); }},{t:'やめる',c:'#8a9392',f:function(){ finish(false,true); }}]); }
    else { panel.style.display='none'; S.last=0; } }
  pauseBtn.onclick=function(e){ e.stopPropagation(); if(!S.over) setPause(!S.paused); };
  function vis(){ if(document.hidden&&!S.over&&!S.asking) setPause(true); } document.addEventListener('visibilitychange',vis);
  var camBase=new THREE.Vector3();
  function resize(){ var w=root.clientWidth||window.innerWidth, h=root.clientHeight||window.innerHeight; renderer.setSize(w,h,false); cam.aspect=w/h;
    var a=w/h; cam.fov=a<0.6?56:a<0.8?52:44; camBase.set(0,a<0.8?33:27,a<0.8?22:19); cam.position.copy(camBase); cam.lookAt(0,0,a<0.8?0.2:0); cam.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize',resize);
  R.off=function(){ window.removeEventListener('resize',resize); document.removeEventListener('visibilitychange',vis); };

  // --- たたかい ---
  var snowballs=[], zones=[];
  function bossAct(a,dt){ a.bcd-=dt; if(a.atkT>0) a.atkT-=dt; var m=1;
    if(a.bk==='boar'){ if(a.chg>0){ a.chg-=dt; m=4; if(Math.random()<0.6) fx.emit(a.x,0.2,a.z,rnd(-1,1),0.5,rnd(-1,1),0xa16207,0.4); }
      if(a.bcd<=0){ a.bcd=6; if(a.slowT>0){ say('❄️ とっしんを とめた！','#bae6fd',900); fx.burst(a.x,1,a.z,20,0xbae6fd,3,0.5); } else { a.chg=1.2; a.atkT=1.2; say('🐗 とっしん！','#fecaca',700); S.shake=0.5; snd('crash'); } } }
    else if(a.bk==='yeti'){ if(a.bcd<=0){ a.bcd=7; var ts=pads.filter(function(q){ return q.lv&&!TT[q.type].eco&&Math.hypot(q.x-a.x,q.z-a.z)<9; }); if(ts.length){ var tq=ts[Math.floor(Math.random()*ts.length)]; a.atkT=0.6;
        var ball=new THREE.Mesh(new THREE.SphereGeometry(0.35,10,8),new THREE.MeshLambertMaterial({color:0xf8fafc})); ball.position.set(a.x,3,a.z); scene.add(ball); snowballs.push({m:ball,sx:a.x,sz:a.z,q:tq,t:0}); } } }
    else if(a.bk==='scorp'){ if(a.bcd<=0){ a.bcd=8; a.under=2; fx.burst(a.x,0.3,a.z,24,0xd97706,3,0.6); }
      a.stg=(a.stg||0)-dt; if(a.stg<=0&&a.under<=0&&Math.hypot(hero.x-a.x,hero.z-a.z)<2.4){ a.stg=5; a.atkT=0.5; hero.stun=2; fx.burst(hero.x,1,hero.z,16,0xfacc15,3,0.5); say('🦂 ゆうしゃが まひ！','#fde68a',800); } }
    else if(a.bk==='dragon'){ if(a.bcd<=0){ a.bcd=7; a.atkT=1; var n=0; S.en.forEach(function(b){ if(!b.dead&&b!==a&&Math.hypot(b.x-a.x,b.z-a.z)<3.5){ b.hasteT=3; n++; } });
        for(var f=0;f<30;f++) fx.emit(a.x,2,a.z,rnd(-3,3),rnd(-1,0.5),rnd(-3,3),0xff7a1a,0.6); ringFx(a.x,a.z,0xff7a1a,3.5,0.6); say('🐉 ほのおの ブレス！ てきが はやく なった','#fed7aa',1000); } }
    else if(a.bk==='maou'){ var ph=a.hp<a.max*0.33?3:a.hp<a.max*0.66?2:1;
      if(ph>a.phase){ a.phase=ph; a.barrier=4; S.shake=1; ringFx(a.x,a.z,ph===3?0xef4444:0xc026d3,4,0.8); fx.burst(a.x,2,a.z,50,0xc026d3,5,0.8); say(ph===3?'👿 まおう さいごの すがた！':'👿 まおうが へんしん！','#f0abfc',1400); snd('crash');
        for(var k=0;k<(ph===3?4:6);k++){ spawn(ph===3?'gh':'n'); var mn=S.en[S.en.length-1]; mn.pi=a.pi; mn.s=Math.max(0,a.s-0.3-k*0.3); mn.off=rnd(-0.5,0.5); } }
      if(a.phase>=3&&a.bcd<=0){ a.bcd=6; fx.burst(a.x,1.5,a.z,30,0x7c3aed,4,0.5); a.s+=3; say('👿 テレポート！','#ddd6fe',700); } }
    return m; }
  function bossBattle(a){ if(S.over||a.dead) return; var i=0; S.paused=true;
    function next(){ if(S.over) return; if(i>=3||a.dead){ S.paused=false; S.last=0; return; }
      askEnglish(function(ok){ if(ok){ var dmg=a.max*0.12; a.hp-=dmg; a.brk=(a.brk||0)+1; a.flash=0.3; fx.burst(a.x,2,a.z,40,0xfde047,5,0.6); ringFx(a.x,a.z,0xfde047,3,0.5); dmgPop(a,dmg,true); S.shake=0.6; say('⚔ ボスの まもりが はがれた！','#fde68a',900); if(a.hp<=0) hurt(a,1,true); }
          else { a.hp=Math.min(a.max,a.hp+a.max*0.05); say('ボスが かいふく…','#fecaca',900); }
          i++; S.paused=true; setTimeout(next,700); },false,{i:i+1,n:3,name:BINFO.name}); }
    say('⚔ ボス えいごバトル！','#fde68a',1200); setTimeout(next,900); }
  function canHit(a,t){ if(a.phased&&t!=='magic') return false; if(ET[a.ty].hide&&!a.shown) return false; return true; }
  function hurt(a,d,magic,crit){ if(a.dead||a.under>0) return; if(a.phased&&!magic) return;
    var wk=(ET[a.ty].weak||{})[SRC]||1; d*=wk; if(a.brk) d*=1+0.2*a.brk; if(a.curse>0) d*=(a.cmul||1.4); if(a.prison>0&&a.stun>0) d*=2; if(a.elite) d*=1; if(wk>1&&Math.random()<0.25) fx.emit(a.x,1.2,a.z,0,1.5,0,0xfde047,0.3);
    if(a.barrier>0&&!magic){ d*=0.1; if(Math.random()<0.2) fx.emit(a.x,2,a.z,rnd(-1,1),1,rnd(-1,1),0x93c5fd,0.3); } var ar=magic?0:(ET[a.ty].armor||0); if(ar){ d=Math.max(d*0.25,d-ar); if(Math.random()<0.3) fx.emit(a.x,1,a.z,rnd(-1,1),2,rnd(-1,1),0xe5e7eb,0.25); }
    if(a.aff==='armor'&&!magic) d=Math.max(d*0.3,d-2);
    if(a.abs>0){ var ab=Math.min(a.abs,d); a.abs-=ab; d-=ab; if(Math.random()<0.3) fx.emit(a.x,1,a.z,rnd(-0.8,0.8),1,rnd(-0.8,0.8),0x7dd3fc,0.3); if(a.abs<=0) fx.burst(a.x,1,a.z,12,0x7dd3fc,2.5,0.4); }
    a.hp-=d; a.flash=0.08; if(d>=6||crit) dmgPop(a,d,crit);
    if(a.ty==='boss'&&a.bk!=='ogre'&&!a.eng&&a.hp<a.max*0.5&&a.hp>0){ a.eng=true; setTimeout(function(){ bossBattle(a); },300); }
    if(a.ty==='boss'&&a.bk==='ogre'&&!a.barUsed&&a.hp<a.max*0.5&&a.hp>0){ a.barUsed=true; a.barrier=5; say('🛡 バリア！ まほうで こわせ！','#bfdbfe',1600); snd('wrong'); ringFx(a.x,a.z,0x93c5fd,3,0.6); }
    if(a.hp<=0&&a.curse>0){ if(a.csoul){ S.coins+=a.csoul; } if(a.cspread){ S.en.forEach(function(b){ if(!b.dead&&b!==a&&Math.hypot(b.x-a.x,b.z-a.z)<2.2){ b.curse=3; b.cmul=a.cmul; b.cspread=1; fx.emit(b.x,1,b.z,0,1,0,0xa855f7,0.5); } }); } }
    if(a.hp<=0&&!a.dead){ var e3=ET[a.ty];
      if(e3.bomb){ ringFx(a.x,a.z,0xff5a1a,1.8,0.5); fx.burst(a.x,0.6,a.z,40,0xff7a1a,6,0.7); S.shake=Math.max(S.shake,0.4); snd('crash');
        if(Math.hypot(hero.x-a.x,hero.z-a.z)<1.8){ hero.stun=1.5; say('💣 ゆうしゃが ふらふら！','#fed7aa',700); }
        var nq=pads.filter(function(q){ return q.lv&&Math.hypot(q.x-a.x,q.z-a.z)<2.4; })[0]; if(nq){ nq.frozen=Math.max(nq.frozen||0,2); fx.burst(nq.x,1.2,nq.z,16,0x57534e,2,0.5); } }
      if(a.ty!=='boss'&&a.ty!=='sk'&&a.ty!=='spl'&&a.ty!=='sl2') S.graves.push({x:a.x,z:a.z,s:a.s,pi:a.pi,t:S.t});
      if(e3.thief){ S.coins+=5; coinPop(a.x,1.4,a.z,5); } }
    if(a.hp<=0){ a.dead=true; S.kills++; var et=ET[a.ty]; heroXp(a.ty==='boss'?10:a.elite?4:1); if(a.elite){ S.coins+=et.coin*2; coinPop(a.x,1.2,a.z,et.coin*3); }
      if(et.split){ for(var sp2=0;sp2<2;sp2++){ spawn('sl2'); var ch=S.en[S.en.length-1]; ch.pi=a.pi; ch.s=Math.max(0,a.s-0.4*sp2); ch.off=a.off+(sp2?0.35:-0.35); ch.x=a.x; ch.z=a.z; } fx.burst(a.x,0.4,a.z,12,0x4ade80,3,0.5); } var cg=(et.coin+cv('gold'))*(S.mod&&S.mod.k==='gold'?2:S.mod&&S.mod.k==='tough'?1.5:1); S.coins+=Math.max(1,Math.round(cg*ECO)); hud2(); var y=a.y||0.6;
      fx.burst(a.x,y,a.z,a.ty==='boss'?60:5,0xffd34d,a.ty==='boss'?6:2.2,0.5); fx.burst(a.x,y,a.z,a.ty==='fly'?8:4,a.ty==='fly'?0x7e22ce:0xffffff,2,0.35);
      if(et.coin>=3) coinPop(a.x,y+0.6,a.z,et.coin);
      if(a.ty==='boss'){ snd('fanfare'); say(BINFO.name+' げきは！','#fde047',1300); S.shake=1; ringFx(a.x,a.z,0xffd34d,4,0.7); }
      else if(Math.random()<0.25) snd('coin'); } }
  var pops=0;
  function dmgPop(a,d,crit){ if(pops>10) return; pops++; var sp=toScreen(a.x,(a.y||0)+1.4,a.z), dd=el('div','position:absolute;left:'+sp.x+'px;top:'+sp.y+'px;transform:translate(-50%,-50%) scale('+(crit?1.3:1)+');font-weight:900;font-size:'+(crit?17:13)+'px;color:'+(crit?'#fde047':'#fff')+';-webkit-text-stroke:3px rgba(80,0,0,.8);paint-order:stroke fill;transition:transform .6s ease-out,opacity .6s;pointer-events:none;',(crit?'クリティカル ':'')+(typeof d==='string'?d:Math.round(d)));
    labels.appendChild(dd); requestAnimationFrame(function(){ dd.style.transform='translate(-50%,-150%) scale(1)'; dd.style.opacity='0'; }); setTimeout(function(){ dd.remove(); pops--; },650); }
  function coinPop(x,y,z,v){ var sp=toScreen(x,y,z), d=el('div','position:absolute;left:'+sp.x+'px;top:'+sp.y+'px;transform:translate(-50%,-50%);font-weight:900;font-size:15px;color:#fde047;-webkit-text-stroke:3px rgba(60,40,0,.8);paint-order:stroke fill;transition:transform .8s ease-out,opacity .8s;pointer-events:none;','🪙+'+v);
    labels.appendChild(d); requestAnimationFrame(function(){ d.style.transform='translate(-50%,-160%)'; d.style.opacity='0'; }); setTimeout(function(){ d.remove(); },850); }
  function spawn(ty){ var et=ET[ty], hp=baseHp(S.wave)*et.hp*(ty==='boss'&&BINFO.hp?BINFO.hp:1), elite=ty!=='boss'&&ty!=='sl2'&&ty!=='ra'&&ty!=='spl'&&Math.random()<Math.min(0.2,0.004*stage)+0.06; if(elite) hp*=2.5; if(S.mod){ if(S.mod.k==='tough') hp*=1.3; if(S.mod.k==='swarm') hp*=0.8; } S.pc=(S.pc||0)+1; var spi=ty==='boss'?0:S.pc%OPEN; S.en.push({pi:spi,elite:elite,ty:ty,s:0,off:ty==='boss'?0:rnd(-0.55,0.55),hp:hp,max:hp,spd:et.spd*rnd(0.92,1.08)*(S.mod&&S.mod.k==='fast'?1.25:1),ph:Math.random()*6,x:PATHS[spi].pts[0][0],z:PATHS[spi].pts[0][1],y:et.air?1.7:0,dead:false,flash:0,slowT:0,slowK:0,healT:rnd(0,1)});
    var ne=S.en[S.en.length-1]; if(elite){ var AF=['shield','fast','regen','noslow','noburn','armor'], af=AF[Math.floor(Math.random()*AF.length)]; ne.aff=af;
      if(af==='shield') ne.abs=hp*0.4; if(af==='fast') ne.spd*=1.35; }
    if(ty!=='sl2') fx.burst(PTS[0][0],0.8,PTS[0][1]+1.2,4,0xd946ef,2,0.4);
    if(ty==='boss'){ var bo=S.en[S.en.length-1]; bo.bk=BK; bo.phase=1; bo.bcd=4; if(BINFO.spd) bo.spd=BINFO.spd; if(BINFO.fly){ bo.fly=true; bo.y=2.2; } bossBan.innerHTML='⚠ '+BINFO.name+' しゅつげん！';
      S.slow=1.4; S.shake=1.2; snd('crash'); ringFx(PTS[0][0],PTS[0][1]+1,0xff4d4d,5,1);
      bossBan.style.display='block'; bossBan.style.animation='none'; void bossBan.offsetWidth; bossBan.style.animation='twBoss 1.8s ease-out forwards'; setTimeout(function(){ bossBan.style.display='none'; },1800); } }
  function frame(now){
    R.raf=requestAnimationFrame(frame);
    var dt=S.last?Math.min(0.05,(now-S.last)/1000):0; S.last=now;
    if(S.slow>0){ S.slow-=dt; dt*=0.3; }                                    // ボスとうじょうは スローモーション
    dt*=S.speed;
    if(!S.paused&&!S.over){ S.t+=dt; step(dt); }
    draw(dt);
  }
  function step(dt){
    if(S.phase==='prep'){ if(S.wave>0){ S.prepT-=dt; if(S.prepT<=0){ S.phase='run'; S.spawnQ=S.nextQ||makeWave(S.wave); S.spawnT=0; S.called=false; } } }
    else if(S.phase==='run'){
      S.spawnT-=dt; if(S.spawnQ.length&&S.spawnT<=0){ var it=S.spawnQ.shift(); spawn(it.ty); S.spawnT=it.gap; }
      if(!S.spawnQ.length&&!S.called&&!S.en.some(function(a){ return !a.dead; })){ S.en=[];
        if(S.wave>=NW){ finish(true); return; }
        S.phase='wait'; var inc=Math.round((5+S.wave*2)*ECO), mine=0, rp=0, hl=0; pads.forEach(function(q){ if(!q.lv||!TT[q.type].eco) return; var LV=TT[q.type].lv[q.lv-1];
          if(LV.gold){ mine+=LV.gold; fx.burst(q.x,1.2,q.z,12,0xfbbf24,3,0.6); coinPop(q.x,1.5,q.z,LV.gold); } if(LV.rp){ rp+=LV.rp; fx.burst(q.x,1.5,q.z,12,0x60a5fa,3,0.6); } if(LV.heal) hl+=LV.heal; });
        if(rp){ S.rp=(S.rp||0)+rp; } if(hl){ S.hp=Math.min(S.maxHp,S.hp+hl); }
        var intr=cv('interest')?Math.min(30*cv('interest'),Math.floor(S.coins*0.1*cv('interest'))):0; S.coins+=inc+mine+intr; hud2();
        say('ウェーブ クリア！ 🪙+'+(inc+mine+intr)+(rp?' 🔬+'+rp:'')+(hl?' ❤️+'+hl:'')+(intr?'<div style="font-size:14px;">（りし +'+intr+'）</div>':''),'#bbf7d0',1100); setTimeout(dayStart,1300); }
      // はやく よぶ：でる てきが のこって いない とき
      callBtn.style.display=(!S.spawnQ.length&&S.wave<NW&&!S.called)?'block':'none';
      // たからばこ
      S.chestCd=(S.chestCd===undefined?rnd(8,14):S.chestCd)-dt; if(S.chestCd<=0&&!S.chest){ spawnChest(); S.chestCd=rnd(22,32); } }
    else callBtn.style.display='none';
    if(S.chest){ S.chest.t-=dt; if(S.chest.t<=0){ S.chest=null; chestM.visible=false; } }
    if(S.freeze>0){ S.freeze-=dt; }
    // ワールドの しかけ
    if(S.phase==='run'){ S.gim=(S.gim===undefined?12:S.gim)-dt;
      if(WORLD===2&&S.gim<=0){ S.gim=24; S.blizz=6; say('🌨 ふぶき！ しゃてい ダウン','#e0f2fe',1200); }
      if(WORLD===4&&S.gim<=0){ S.gim=17; var tw=pads.filter(function(q){ return q.lv&&!TT[q.type].eco&&!(q.frozen>0); }); if(tw.length){ var lq=tw[Math.floor(Math.random()*tw.length)]; lq.lavaWarn=1.5; ringFx(lq.x,lq.z,0xff4d00,1.6,1.5); say('🌋 ようがんが ふきだす！','#fed7aa',1000); } } }
    if(S.blizz>0){ S.blizz-=dt; } blz.style.opacity=S.blizz>0?'1':'0';
    pads.forEach(function(q){ if(q.lavaWarn>0){ q.lavaWarn-=dt; if(Math.random()<0.5) fx.emit(q.x+rnd(-0.6,0.6),0.3,q.z+rnd(-0.6,0.6),0,2,0,0xff6a1a,0.4); if(q.lavaWarn<=0){ q.frozen=4; q.lava=true; fx.burst(q.x,0.5,q.z,40,0xff5a1a,5,0.8); S.shake=0.4; snd('crash'); } } if(q.frozen<=0) q.lava=false; });
    heroStep(dt);
    // てきが すすむ
    var flags=S.en.filter(function(f){ return !f.dead&&ET[f.ty].flag; });
    for(var i=0;i<S.en.length;i++){ var a=S.en[i]; if(a.dead) continue; a.flash-=dt;
      var sp=a.spd; if(a.slowT>0){ a.slowT-=dt; sp*=1-a.slowK; }
      if(a.hasteT>0){ a.hasteT-=dt; sp*=1.4; } if(flags.length&&a.ty!=='flag'&&flags.some(function(f){ return Math.hypot(f.x-a.x,f.z-a.z)<2.5; })) sp*=1.3;
      var et2=ET[a.ty];
      if(et2.egg){ a.eggT=(a.eggT===undefined?3:a.eggT)-dt; if(a.eggT<=0){ a.eggT=4; for(var e=0;e<2;e++){ spawn('spl'); var cs=S.en[S.en.length-1]; cs.pi=a.pi; cs.s=Math.max(0,a.s-0.3); cs.off=a.off+rnd(-0.3,0.3); } fx.burst(a.x,0.3,a.z,8,0xe5e7eb,2,0.4); } }
      if(et2.ghost){ a.gT=(a.gT||0)+dt; a.phased=(a.gT%4)>2.5; }
      if(et2.hide){ a.shown=Math.hypot(hero.x-a.x,hero.z-a.z)<3||a.slowT>0||a.flash>0; }
      if(a.ty==='boss'&&a.bk!=='ogre') sp*=bossAct(a,dt);
      if(S.freeze>0) sp=0;
      var PL=PATHS[a.pi||0].len;
      if(ET[a.ty].dig&&!a.dug&&a.s>PL*0.3){ a.dug=true; a.under=2.2; fx.burst(a.x,0.3,a.z,16,0x92400e,3,0.6); }
      if(a.under>0){ a.under-=dt; sp*=2.2; if(Math.random()<0.5) fx.emit(a.x,0.15,a.z,rnd(-0.5,0.5),1,rnd(-0.5,0.5),0x92400e,0.4); if(a.under<=0) fx.burst(a.x,0.3,a.z,16,0x92400e,3,0.6); }
      if(a.barrier>0) a.barrier-=dt; if(a.curse>0) a.curse-=dt; if(a.prison>0) a.prison-=dt;
      if(a.aff==='noslow'){ a.slowT=0; } if(a.aff==='noburn'){ a.burnT=0; }
      if(a.aff==='regen'&&a.hp<a.max){ a.hp=Math.min(a.max,a.hp+a.max*0.04*dt); }
      if(et2.sapper){ a.sapT=(a.sapT||0)-dt; if(a.work>0){ a.work-=dt; sp=0; if(Math.random()<0.4) fx.emit(a.x,1,a.z,rnd(-0.5,0.5),1.5,rnd(-0.5,0.5),0xfacc15,0.3); }
        else if(a.sapT<=0){ var tq=pads.filter(function(q){ return q.lv&&!(q.frozen>0)&&Math.hypot(q.x-a.x,q.z-a.z)<2.4; })[0]; if(tq){ a.sapT=6; a.work=1.2; tq.frozen=3; ringFx(tq.x,tq.z,0xfacc15,1.4,0.5); fx.burst(tq.x,1.3,tq.z,16,0xfacc15,3,0.5); } } }
      if(et2.guard){ a.gT=(a.gT===undefined?1.5:a.gT)-dt; if(a.gT<=0){ a.gT=4; var gi2=0; S.en.forEach(function(b){ if(gi2<4&&!b.dead&&b!==a&&b.ty!=='boss'&&Math.hypot(b.x-a.x,b.z-a.z)<2.6){ b.abs=Math.max(b.abs||0,b.max*0.25); gi2++; } }); if(gi2){ ringFx(a.x,a.z,0x7dd3fc,2.6,0.5); } } }
      if(et2.necro){ a.nT=(a.nT===undefined?3:a.nT)-dt; if(a.nT<=0){ a.nT=5; var rv=0; S.graves=S.graves.filter(function(gv){ return S.t-gv.t<6; }); S.graves.slice().forEach(function(gv){ if(rv<2&&Math.hypot(gv.x-a.x,gv.z-a.z)<3.2){ rv++; S.graves.splice(S.graves.indexOf(gv),1); spawn('sk'); var ns=S.en[S.en.length-1]; ns.pi=gv.pi; ns.s=gv.s; fx.burst(gv.x,0.4,gv.z,16,0xa855f7,2.5,0.6); } }); if(rv) say('💀 ガイコツが よみがえった','#e9d5ff',700); } }
      if(et2.regen&&!(a.burnT>0)&&a.hp<a.max){ a.hp=Math.min(a.max,a.hp+a.max*et2.regen*dt); if(Math.random()<0.05) fx.emit(a.x,1.2,a.z,0,1,0,0x4ade80,0.4); }
      if(a.burnT>0){ a.burnT-=dt; SRC='arrow'; hurt(a,a.burnD*dt); SRC=null; if(Math.random()<0.4) fx.emit(a.x,0.8,a.z,rnd(-0.3,0.3),1,rnd(-0.3,0.3),0xff7a1a,0.35); if(a.dead) continue; } if(a.stun>0){ a.stun-=dt; sp=0; }
      a.s+=sp*dt;
      var p=atS(a.s,a.pi), l=Math.hypot(p.dx,p.dz)||1, off=(a.fly||ET[a.ty].air)?a.off*1.8:a.off; a.x=p.x-p.dz/l*off; a.z=p.z+p.dx/l*off; a.hx=p.dx/l; a.hz=p.dz/l;
      if(ET[a.ty].heal){ a.healT-=dt; if(a.healT<=0){ a.healT=1.4; var healed=0;
          S.en.forEach(function(b){ if(!b.dead&&b!==a&&b.hp<b.max&&Math.hypot(b.x-a.x,b.z-a.z)<2.2){ b.hp=Math.min(b.max,b.hp+b.max*0.2); healed++; fx.emit(b.x,1.2,b.z,0,1.5,0,0x4ade80,0.5); } });
          if(healed){ ringFx(a.x,a.z,0x4ade80,2.2,0.5); } } }
      if(a.s>=PL-0.8&&ET[a.ty].thief){ var st2=Math.min(60,Math.floor(S.coins*0.2)); S.coins-=st2; say('🦝 コインを '+st2+' ぬすまれた！','#fecaca',1000); }
      if(a.s>=PL-0.8){ a.dead=true; S.hp-=ET[a.ty].dmg; S.shake=0.5; snd('crash'); fx.burst(a.x,0.8,a.z,12,0xff5a3c,3,0.5); hud2();
        if(S.hp<=0){ S.hp=0; hud2(); finish(false); return; } } }
    if(S.en.length>60&&S.en.filter(function(a){ return a.dead; }).length>30) S.en=S.en.filter(function(a){ return !a.dead; });
    // タワーが うつ
    pads.forEach(function(q){ if(!q.lv||TT[q.type].eco) return; if(q.frozen>0){ q.frozen-=dt; if(Math.random()<0.2) fx.emit(q.x,1.5,q.z,rnd(-0.5,0.5),0.5,rnd(-0.5,0.5),q.lava?0x57534e:0xe0f2fe,0.5); return; } var T=TT[q.type], L=Lof(q.type,q.lv,q.br,q.br2), RG=rangeOf(q,L);
      if(L.storm||L.nova){ q.pT=(q.pT===undefined?2:q.pT)-dt; if(q.pT<=0){ q.pT=L.storm?4:5; var inR=S.en.filter(function(a){ return !a.dead&&!a.under&&canHit(a,'magic')&&Math.hypot(a.x-q.x,a.z-q.z)<=RG; });
          if(L.storm){ inR.sort(function(){ return Math.random()-0.5; }).slice(0,L.storm).forEach(function(a){ SRC='magic'; hurt(a,L.dmg*3,true); SRC=null; fx.burst(a.x,1,a.z,20,0xbfe6ff,4,0.5); for(var yb=0;yb<8;yb++) fx.emit(a.x+rnd(-0.2,0.2),1+yb*0.8,a.z,0,0,0,0xe0f2fe,0.25); }); if(inR.length) snd('crash'); }
          else { inR.forEach(function(a){ SRC='ice'; hurt(a,L.dmg*2); SRC=null; a.slowT=2; a.slowK=Math.max(a.slowK,0.6); if(a.ty!=='boss') a.stun=1.6; }); ringFx(q.x,q.z,0xbae6fd,RG,0.7); fx.burst(q.x,1,q.z,50,0xe0f2fe,6,0.8); } } }
      q.cd-=dt*(q.boostT>0?1.6:1)*(1+0.12*cv('rate')); if(q.boostT>0) q.boostT-=dt; if(q.cd>0) return;
      var tg=null, far=-1e9; for(var j=0;j<S.en.length;j++){ var a=S.en[j]; if(a.dead) continue; if((a.fly||ET[a.ty].air)&&!(L.air!==undefined?L.air:T.air)) continue; if(!canHit(a,q.type)) continue; if(a.under>0) continue;
        if(q.type==='ice'&&a.slowT>0.6&&tg) continue;
        var dd=Math.hypot(a.x-q.x,a.z-q.z); if(dd>RG) continue; var pr0=L.force||q.prio, sc=pr0===1?a.hp:pr0===2?-dd:a.s; if(sc>far){ far=sc; tg=a; } }
      if(!tg) return; q.cd=1/L.rate; q.aim=Math.atan2(-(tg.x-q.x),-(tg.z-q.z)); q.kick=0.15;
      var fb=1; pads.forEach(function(f){ if(f.type==='forge'&&f.lv){ var FL=TT.forge.lv[f.lv-1]; if(Math.hypot(f.x-q.x,f.z-q.z)<=FL.range) fb=Math.max(fb,1+FL.buff); } }); L=fb>1?Object.assign({},L,{dmg:L.dmg*fb}):L;
      var hy=q.headY+0.16+0.3; var buff=q.type==='arrow'&&pads.some(function(m){ return m.type==='magic'&&Math.hypot(m.x-q.x,m.z-q.z)<4; });
      if(buff&&Math.random()<0.5) fx.emit(q.x,q.headY+0.8,q.z,0,1,0,0xe879f9,0.4);
      var tgs=[tg]; if(L.multi){ S.en.filter(function(a){ return a!==tg&&!a.dead&&!a.under&&canHit(a,q.type)&&(!(a.fly||ET[a.ty].air)||L.air||T.air)&&Math.hypot(a.x-q.x,a.z-q.z)<=RG; }).slice(0,L.multi-1).forEach(function(a){ tgs.push(a); }); }
      tgs.forEach(function(t2,ti){ S.proj.push({buff:buff,type:q.type,x:q.x,y:hy,z:q.z,sx:q.x,sy:hy,sz:q.z,tg:t2,t:-ti*0.05,dur:q.type==='cannon'?0.5:q.type==='magic'?0.35:0.26,L:L,lv:q.lv}); });
      if(q.type==='cannon'){ fx.burst(q.x-Math.sin(q.aim)*0.9,hy,q.z-Math.cos(q.aim)*0.9,8,0xd6d3d1,1.5,0.4); snd('crash'); } });
    for(var zi=zones.length-1;zi>=0;zi--){ var zn=zones[zi]; zn.t-=dt; if(zn.t<=0){ if(zn.m){ scene.remove(zn.m); zn.m.geometry.dispose(); zn.m.material.dispose(); } zones.splice(zi,1); continue; } if(zn.m){ zn.m.material.opacity=0.55+0.3*Math.sin(S.t*14+zi)*Math.min(1,zn.t); zn.m.scale.setScalar(0.9+0.1*Math.sin(S.t*9+zi)); }
      for(var fl=0;fl<2;fl++) fx.emit(zn.x+rnd(-1.2,1.2),0.3,zn.z+rnd(-1.2,1.2),0,rnd(1.5,3),0,Math.random()<0.5?0xff7a1a:0xfde047,0.5); if(Math.random()<0.8) fx.emit(zn.x+rnd(-zn.r,zn.r)*0.8,0.3,zn.z+rnd(-zn.r,zn.r)*0.8,0,1.5,0,Math.random()<0.5?0xff5a1a:0xfde047,0.5);
      S.en.forEach(function(a){ if(!a.dead&&Math.hypot(a.x-zn.x,a.z-zn.z)<zn.r){ SRC='cannon'; hurt(a,zn.dps*dt); SRC=null; } }); }
    for(var sbi=snowballs.length-1;sbi>=0;sbi--){ var sb=snowballs[sbi]; sb.t+=dt/0.8; var q2=sb.q; sb.m.position.set(sb.sx+(q2.x-sb.sx)*sb.t,3+Math.sin(sb.t*Math.PI)*2-sb.t*1.5,sb.sz+(q2.z-sb.sz)*sb.t);
      if(sb.t>=1){ scene.remove(sb.m); snowballs.splice(sbi,1); if(q2.lv){ q2.frozen=3; fx.burst(q2.x,1.5,q2.z,30,0xe0f2fe,4,0.6); ringFx(q2.x,q2.z,0xbae6fd,1.5,0.5); say('❄️ タワーが こおった！','#bae6fd',800); } } }
    for(var k=S.proj.length-1;k>=0;k--){ var pr=S.proj[k]; pr.t+=dt; if(pr.t<0) continue; if(pr.tg.dead&&pr.type==='hero'){ S.proj.splice(k,1); continue; } var f=Math.min(1,pr.t/pr.dur), ty2=pr.tg.y||0.6;
      pr.x=pr.sx+(pr.tg.x-pr.sx)*f; pr.z=pr.sz+(pr.tg.z-pr.sz)*f; pr.y=pr.sy+(ty2+0.4-pr.sy)*f+Math.sin(f*Math.PI)*(pr.type==='cannon'?1.6:pr.type==='arrow'?0.5:0.2);
      if(pr.type==='magic'&&Math.random()<0.7) fx.emit(pr.x,pr.y,pr.z,rnd(-0.3,0.3),rnd(-0.3,0.3),rnd(-0.3,0.3),0xe879f9,0.3);
      if(pr.type==='ice'&&Math.random()<0.5) fx.emit(pr.x,pr.y,pr.z,0,0,0,0xbae6fd,0.25);
      if(f>=1){ land(pr); S.proj.splice(k,1); } }
  }
  var comboT=0;
  function combo(t,tg){ if(S.t-comboT<2.5) return; comboT=S.t; var sp=toScreen(tg.x,1.8,tg.z), d=el('div','position:absolute;left:'+sp.x+'px;top:'+sp.y+'px;transform:translate(-50%,-50%);font-weight:900;font-size:16px;color:#a5f3fc;-webkit-text-stroke:3px rgba(10,40,80,.85);paint-order:stroke fill;transition:transform .9s ease-out,opacity .9s;pointer-events:none;white-space:nowrap;',t);
    labels.appendChild(d); requestAnimationFrame(function(){ d.style.transform='translate(-50%,-180%)'; d.style.opacity='0'; }); setTimeout(function(){ d.remove(); },950); }
  var SRC=null;
  function land(pr){ SRC=pr.type; land0(pr); SRC=null; }
  function land0(pr){ var L0=pr.L, tg=pr.tg, am=(1+(pr.type==='cannon'?0.15:0.25)*cv(pr.type))*(pr.type!=='hero'&&Math.random()<0.1*cv('crit')?(pr.critc=2.2):1), L={dmg:L0.dmg*am,splash:L0.splash&&L0.splash*(1+0.2*(pr.type==='cannon'?cv('cannon'):0)),slow:L0.slow,chain:L0.chain,curse:L0.curse,stop:L0.stop,air:L0.air,pierce:L0.pierce,cmul:L0.cmul,spread:L0.spread,soul:L0.soul,prison:L0.prison,burn:L0.burn,exec:L0.exec,cluster:L0.cluster,zone:L0.zone};
    if(pr.critc&&pr.type!=='arrow'){ dmgPop(tg,L.dmg,true); }
    if(pr.type==='hero'){ hurt(tg,pr.dmg*(1+0.4*cv('hero')),pr.magic); fx.burst(tg.x,(tg.y||0.6)+0.3,tg.z,8,pr.col,2.5,0.35); return; }
    if(pr.type==='cannon'){ var cmb=false; S.en.forEach(function(a){ if(!a.dead&&(!(a.fly||ET[a.ty].air)||L.air)&&Math.hypot(a.x-tg.x,a.z-tg.z)<=L.splash){ var fz=a.slowT>0; if(fz) cmb=true; hurt(a,L.dmg*(fz?(cv('combo')?2.5:2):1),false,fz&&Math.random()<0.3); } }); if(cmb) combo('❄️×💣 コンボ！',tg);
      fx.burst(tg.x,0.5,tg.z,18,0xff8a3d,4,0.5); fx.burst(tg.x,0.5,tg.z,8,0x57534e,2,0.6); ringFx(tg.x,tg.z,0xffb347,L.splash,0.35); S.shake=Math.max(S.shake,0.15);
      if(L.cluster){ for(var cl=0;cl<L.cluster;cl++){ var ca=cl/L.cluster*6.28, cx=tg.x+Math.cos(ca)*1.5, cz=tg.z+Math.sin(ca)*1.5; S.en.forEach(function(a){ if(!a.dead&&!(a.fly||ET[a.ty].air)&&Math.hypot(a.x-cx,a.z-cz)<=1.0) hurt(a,L.dmg*0.5); }); fx.burst(cx,0.4,cz,10,0xfde047,3,0.4); ringFx(cx,cz,0xfde047,1,0.3); } }
      if(L.zone){ var zm=new THREE.Mesh(new THREE.CircleGeometry(1.6,28),new THREE.MeshBasicMaterial({map:SPARK,color:0xff5a1a,transparent:true,opacity:0.85,blending:THREE.AdditiveBlending,depthWrite:false})); zm.rotation.x=-Math.PI/2; zm.position.set(tg.x,0.2,tg.z); scene.add(zm);
        zones.push({x:tg.x,z:tg.z,r:1.6,t:L.zone,max:L.zone,dps:L.dmg*1.6,m:zm}); } }
    else if(pr.type==='ice'){ var hitIce=function(a){ if(L.prison) a.prison=2; a.slowT=1.6*(1+0.5*cv('ice')); a.slowK=Math.max(a.slowK*(a.slowT>0?1:0),L.slow); if(L.stop&&Math.random()<L.stop&&a.ty!=='boss'){ a.stun=1.2; fx.burst(a.x,0.8,a.z,8,0xffffff,1.5,0.4); } };
      if(L.splash){ S.en.forEach(function(a){ if(!a.dead&&Math.hypot(a.x-tg.x,a.z-tg.z)<=L.splash){ hurt(a,L.dmg); hitIce(a); } }); ringFx(tg.x,tg.z,0xbae6fd,L.splash,0.35); }
      else { hurt(tg,L.dmg); hitIce(tg); } fx.burst(tg.x,(tg.y||0.6)+0.3,tg.z,8,0xe0f2fe,2,0.4); }
    else if(pr.type==='magic'){ var fz2=tg.slowT>0; hurt(tg,L.dmg*(fz2?(cv('combo')?2:1.5):1),true); if(L.curse){ tg.curse=L.curse; tg.cmul=L.cmul||1.4; tg.cspread=L.spread; tg.csoul=L.soul; } if(fz2) combo('❄️×🔮 コンボ！',tg); fx.burst(tg.x,(tg.y||0.6)+0.3,tg.z,10,0xe879f9,2.5,0.4);
      if(L.chain){ var from=tg, hit=[tg]; for(var c=0;c<L.chain;c++){ var nx=null, nd=2.6; S.en.forEach(function(a){ if(a.dead||hit.indexOf(a)>=0) return; var d=Math.hypot(a.x-from.x,a.z-from.z); if(d<nd){ nd=d; nx=a; } });
          if(!nx) break; hit.push(nx); for(var s3=0;s3<6;s3++){ var u=s3/6; fx.emit(from.x+(nx.x-from.x)*u,1+(from.y||0)*0.5,from.z+(nx.z-from.z)*u,0,0,0,0xf0abfc,0.25); } hurt(nx,L.dmg*0.6,true); from=nx; } } }
    else { var cr=Math.random()<0.15; hurt(tg,L.dmg*(cr?2.5:1)*(pr.buff?(cv('combo')?1.5:1.3):1),!!L.pierce,cr); if(L.burn&&!tg.dead){ tg.burnT=L.burn; tg.burnD=L.dmg*0.6; } if(L.exec&&!tg.dead&&tg.ty!=='boss'&&!tg.elite&&tg.ty!=='kn'&&tg.hp<tg.max*L.exec){ tg.hp=0; hurt(tg,1,true); fx.burst(tg.x,1,tg.z,20,0x111827,3,0.5); dmgPop(tg,'きめた！',true); } if(cr) fx.burst(tg.x,(tg.y||0.6)+0.4,tg.z,10,0xfde047,3,0.35); if(Math.random()<0.4) fx.emit(tg.x,(tg.y||0.6)+0.2,tg.z,rnd(-1,1),1.5,rnd(-1,1),0xfff1b8,0.25); } }
  var lbl=[];
  function addLbl(){ var d=el('div','position:absolute;transform:translate(-50%,-100%);font-weight:900;font-size:12px;border-radius:10px;padding:1px 8px;white-space:nowrap;border:2px solid #fff;box-shadow:0 2px 0 rgba(0,0,0,.25),0 3px 8px rgba(0,0,0,.2);text-shadow:0 1px 0 rgba(0,0,0,.3);'); labels.appendChild(d); lbl.push(d); }
  pads.forEach(function(){ addLbl(); });
  var projV=new THREE.Vector3();
  function toScreen(x,y,z){ projV.set(x,y,z).project(cam); return {x:(projV.x*0.5+0.5)*root.clientWidth,y:(-projV.y*0.5+0.5)*root.clientHeight}; }
  var heroLab=el('div','position:absolute;transform:translate(-50%,-100%);font-weight:900;font-size:11px;color:#fff;background:rgba(37,99,235,.85);border:2px solid #fff;border-radius:8px;padding:0 5px;white-space:nowrap;'); labels.appendChild(heroLab);
  // たいりょく バー（3D・カメラを むく）
  var HBN=260, hbBg=new THREE.InstancedMesh(new THREE.PlaneGeometry(0.72,0.1),new THREE.MeshBasicMaterial({color:0x111827,transparent:true,opacity:0.75,depthWrite:false}),HBN),
      hbFg=new THREE.InstancedMesh(new THREE.PlaneGeometry(0.66,0.06),new THREE.MeshBasicMaterial({color:0xffffff,depthWrite:false,transparent:true}),HBN);
  [hbBg,hbFg].forEach(function(m){ m.frustumCulled=false; m.renderOrder=5; scene.add(m); }); for(var hb=0;hb<HBN;hb++) hbFg.setColorAt(hb,new THREE.Color(1,1,1));
  var _hq=new THREE.Quaternion(), _hr=new THREE.Vector3(), _hm=new THREE.Matrix4(), _hs=new THREE.Vector3(), _hc=new THREE.Color();
  var affPool=[], AFI={shield:'🛡',fast:'💨',regen:'💚',noslow:'🚫❄️',noburn:'🚫🔥',armor:'⚙'};
  var bossLab=el('div','position:absolute;transform:translate(-50%,-100%);display:none;width:60px;height:8px;background:#111;border:2px solid #fff;border-radius:5px;overflow:hidden;','<div style="height:100%;background:#ef4444;width:100%;"></div>'); labels.appendChild(bossLab);
  function draw(dt){
    // てき
    Object.keys(armies).forEach(function(k){ armies[k].begin(); }); var boss=null, nb=0;
    for(var i=0;i<S.en.length;i++){ var a=S.en[i]; if(a.dead) continue; if(a.ty==='boss'){ boss=a; continue; }
      if(ET[a.ty].hide&&!a.shown) continue; var tint=a.flash>0?HIT:a.phased?PHASE:a.stun>0?STUN:a.slowT>0?SLOW:a.curse>0?CURSE:a.elite?ELITE:a.ty==='n'?NTINT:null, ry=Math.atan2(-(a.hx||0),-(a.hz||1)), spd=a.slowT>0?1-a.slowK:1;
      if(a.ty==='fly'||a.ty==='fb'){ if(nb>=120) continue; batBody.setColorAt(nb,a.ty==='fb'?FBC:BATC); batWL.setColorAt(nb,a.ty==='fb'?FBC:BATC); batWR.setColorAt(nb,a.ty==='fb'?FBC:BATC); var yy=a.y+Math.sin(S.t*4+a.ph)*0.15, fl=Math.sin(S.t*18*spd+a.ph)*0.7;
        tmp.position.set(a.x,yy,a.z); tmp.rotation.set(0,ry,0); tmp.scale.setScalar(1); tmp.updateMatrix(); batBody.setMatrixAt(nb,tmp.matrix);
        tmp2.position.set(a.x,yy,a.z); tmp2.rotation.set(0,ry,fl,'YXZ'); tmp2.updateMatrix(); batWR.setMatrixAt(nb,tmp2.matrix);
        tmp2.rotation.set(0,ry+Math.PI,-fl,'YXZ'); tmp2.updateMatrix(); batWL.setMatrixAt(nb,tmp2.matrix);
        tmp.position.set(a.x,0.03,a.z); tmp.rotation.set(-Math.PI/2,0,0); tmp.updateMatrix(); batSh.setMatrixAt(nb,tmp.matrix); nb++; continue; }
      if(a.under>0) continue; var hopY=ET[a.ty].hop?Math.abs(Math.sin(S.t*6+a.ph))*0.25:0;
      armies[ET[a.ty].army||a.ty].put(a.x,(a.flash>0?0.06:0)+hopY,a.z,ry,a.stun>0?0:(S.t*9*a.spd/1.5)*spd+a.ph,ET[a.ty].sc*(a.elite?1.2:1),tint); }
    Object.keys(armies).forEach(function(k){ armies[k].end(); });
    // たいりょく バー・エリートの とくせい
    _hq.copy(cam.quaternion); _hr.set(1,0,0).applyQuaternion(_hq); var nh=0, na=0;
    for(var hi=0;hi<S.en.length&&nh<HBN;hi++){ var e4=S.en[hi]; if(e4.dead||e4.ty==='boss'||e4.under>0||(ET[e4.ty].hide&&!e4.shown)) continue;
      var heavy=e4.elite||ET[e4.ty].hp>=4||e4.abs>0; if(!(heavy||e4.hp<e4.max)) continue;
      var hy=(e4.y||0)+ET[e4.ty].sc*(e4.elite?1.2:1)*1.15+0.35, r4=Math.max(0,e4.hp/e4.max);
      _hs.set(1,1,1); _hm.compose(new THREE.Vector3(e4.x,hy,e4.z),_hq,_hs); hbBg.setMatrixAt(nh,_hm);
      _hs.set(Math.max(0.001,r4),1,1); _hm.compose(new THREE.Vector3(e4.x-_hr.x*0.33*(1-r4),hy-_hr.y*0.33*(1-r4),e4.z-_hr.z*0.33*(1-r4)),_hq,_hs); hbFg.setMatrixAt(nh,_hm);
      _hc.setHex(e4.abs>0?0x38bdf8:r4>0.6?0x22c55e:r4>0.3?0xfacc15:0xef4444); hbFg.setColorAt(nh,_hc); nh++;
      if(e4.aff&&na<14){ var ad=affPool[na]; if(!ad){ ad=el('div','position:absolute;transform:translate(-50%,-100%);font-size:12px;font-weight:900;background:rgba(120,53,15,.85);color:#fde68a;border:1px solid #fde047;border-radius:8px;padding:0 4px;white-space:nowrap;pointer-events:none;'); labels.appendChild(ad); affPool.push(ad); }
        var ap=toScreen(e4.x,hy+0.18,e4.z); ad.style.display='block'; ad.style.left=ap.x+'px'; ad.style.top=ap.y+'px'; if(ad._t!==e4.aff){ ad._t=e4.aff; ad.textContent='✨'+AFI[e4.aff]; } na++; } }
    hbBg.count=hbFg.count=nh; hbBg.instanceMatrix.needsUpdate=true; hbFg.instanceMatrix.needsUpdate=true; if(hbFg.instanceColor) hbFg.instanceColor.needsUpdate=true;
    for(var ai=na;ai<affPool.length;ai++) affPool[ai].style.display='none';
    [batBody,batWL,batWR,batSh].forEach(function(m){ m.count=nb; m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; });
    if(boss){ var bup=boss.under>0; bossM.g.visible=!bup; var by=bossM.fly?2.0+Math.sin(S.t*2)*0.2:0; bossM.g.position.set(boss.x,by,boss.z); if(bossM.shadow){ bossM.shadow.visible=true; bossM.shadow.position.set(boss.x,0.03,boss.z); }
      bossM.g.rotation.y=Math.atan2(boss.hx||0,boss.hz||1)+(BK!=='ogre'?Math.PI:0); bossM.phase=boss.phase; bossM.anim(S.t,!boss.stun,(boss.atkT||0)>0,boss.flash>0);
      var bp=toScreen(boss.x,BINFO.h+by,boss.z); bossLab.style.display='block'; bossLab.style.left=bp.x+'px'; bossLab.style.top=bp.y+'px'; bossLab.firstChild.style.width=Math.max(0,boss.hp/boss.max*100)+'%'; }
    else { bossM.g.visible=false; if(bossM.shadow) bossM.shadow.visible=false; bossLab.style.display='none'; }
    bubble.visible=!!(boss&&boss.barrier>0); if(bubble.visible){ bubble.position.set(boss.x,1.3,boss.z); bubble.material.opacity=0.25+Math.sin(S.t*8)*0.1; bubble.scale.setScalar(1+Math.sin(S.t*3)*0.04); }
    // たま
    var na=0, no=0;
    for(var k=0;k<S.proj.length;k++){ var pr=S.proj[k];
      if(pr.type==='arrow'||pr.type==='ice'){ var dx=pr.tg.x-pr.sx, dz=pr.tg.z-pr.sz; tmp.position.set(pr.x,pr.y,pr.z); tmp.rotation.set(0,Math.atan2(dx,dz),0);
        tmp.scale.set(pr.type==='ice'?2.4:1.5,pr.type==='ice'?2.4:1.5,pr.type==='ice'?0.4:0.55); tmp.updateMatrix(); arrowM.setMatrixAt(na,tmp.matrix); _c.setHex(pr.type==='ice'?0x7dd3fc:pr.buff?0xf0abfc:0xffe27a); arrowM.setColorAt(na,_c); na++; }
      else if(pr.t<0) continue;
      else { var big=pr.type==='cannon'; tmp.position.set(pr.x,pr.y,pr.z); tmp.rotation.set(0,0,0); tmp.scale.setScalar(big?0.9+pr.lv*0.15:0.8+pr.lv*0.15); tmp.updateMatrix(); orbM.setMatrixAt(no,tmp.matrix);
        _c.setHex(big?(pr.L&&pr.L.zone?0xff5a1a:pr.L&&pr.L.air?0xef4444:0x27272a):pr.type==='hero'?pr.col:0xf0abfc); orbM.setColorAt(no,_c); no++; } }
    arrowM.count=na; arrowM.instanceMatrix.needsUpdate=true; if(arrowM.instanceColor) arrowM.instanceColor.needsUpdate=true;
    orbM.count=no; orbM.instanceMatrix.needsUpdate=true; if(orbM.instanceColor) orbM.instanceColor.needsUpdate=true;
    // タワー
    pads.forEach(function(q,idx){
      if(q.head){ if(q.type==='arrow'||q.type==='cannon'){ q.head.rotation.y+=(((q.aim-q.head.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI)*Math.min(1,dt*12);
          if(q.kick>0){ q.kick-=dt; } q.head.position.y=q.headY-(q.kick>0?q.kick*0.3:0); }
        else { q.head.rotation.y+=dt*(q.type==='magic'?1.6:0.9); q.head.position.y=q.headY+Math.sin(S.t*2.2+idx)*0.1; if(q.aura){ q.aura.position.y=q.head.position.y; q.aura.material.opacity=0.55+Math.sin(S.t*4+idx)*0.25+(q.kick>0?0.4:0); if(q.kick>0) q.kick-=dt; } }
        if(q.flag) q.flag.rotation.y=Math.sin(S.t*3+idx)*0.4;
        if(q.orbs){ q.orbs.forEach(function(ob,oi){ var oa=S.t*2+oi*2.09; ob.position.set(Math.cos(oa)*0.95,1.2+Math.sin(S.t*3+oi)*0.25,Math.sin(oa)*0.95); ob.rotation.y+=dt*3; }); if(q.aur) q.aur.rotation.z+=dt; }
        if(q.pop>0){ q.pop-=dt; var ps=1+Math.sin(q.pop/0.35*Math.PI)*0.18; q.mesh.scale.set(ps,1/ps+0.0,ps); } else q.mesh.scale.set(1,1,1); }
      var d=lbl[idx];
      if(!d) return; if(q.lv>=5||S.over||sel===q||(!q.lv&&!q.high)){ d.style.display='none'; return; }
      if(q.lv>=3&&TT[q.type].eco){ d.style.display='none'; return; } var c=q.lv?costOf((q.lv===4?Lof(q.type,5,q.br,0):Lof(q.type,q.lv+1,0)).cost):costOf(20), ok=S.coins>=c, sp=toScreen(q.x,q.lv?TH[q.lv-1]*(q.type==='cannon'?0.7:1)+1.5:0.5,q.z);
      if(q.lv&&!ok){ d.style.display='none'; return; }
      d.style.display='block'; d.style.left=sp.x+'px'; d.style.top=sp.y+'px';
      var txt=q.lv?'⬆🪙'+c:'⛰ たかだい（しゃてい+25%）'; if(d._t!==txt+ok){ d._t=txt+ok; d.textContent=txt; d.style.background=ok?(q.lv?'linear-gradient(#3b82f6,#1d4ed8)':'linear-gradient(#22c55e,#15803d)'):'rgba(60,60,60,.75)'; d.style.color='#fff'; }
      if(!q.lv) q.ring.scale.setScalar(ok?1+Math.sin(S.t*5)*0.06:1); });
    // こうか
    for(var r=rings.length-1;r>=0;r--){ var rg=rings[r]; rg.t+=dt; var kk=rg.t/rg.life; if(kk>=1){ scene.remove(rg.m); rg.m.geometry.dispose(); rg.m.material.dispose(); rings.splice(r,1); continue; }
      rg.m.scale.setScalar(rg.size*(0.3+kk*0.8)); rg.m.material.opacity=0.9*(1-kk); }
    if(S.boltT>0){ S.boltT-=dt; bolt.material.opacity=Math.max(0,S.boltT/0.5); if(S.boltT<=0) bolt.visible=false; }
    heroDraw(dt); var hs=toScreen(hero.x,2.2+0.3*(hero.form-1),hero.z); heroLab.style.left=hs.x+'px'; heroLab.style.top=hs.y+'px'; var ht=HC.ico+HC.forms[hero.form-1]+' Lv'+hero.lv; if(heroLab._t!==ht){ heroLab._t=ht; heroLab.textContent=ht; }
    S.dn=(S.dn===undefined?1:S.dn); S.dn+=((S.night?0:1)-S.dn)*Math.min(1,dt*1.5);
    hemi.intensity=0.8*DK*(0.45+0.55*S.dn); key.intensity=1.05*DK*(0.35+0.65*S.dn); key.color.setRGB(0.55+0.45*S.dn,0.6+0.33*S.dn,0.85+0.0*S.dn); vig.style.background='radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) '+(55-20*(1-S.dn))+'%,rgba(10,15,45,'+(0.35+0.4*(1-S.dn))+') 100%)';
    portal.rotation.z-=dt*1.5; sidePortals.forEach(function(pm){ pm.rotation.z-=dt*1.5; });
    if(S.evoT>0){ S.evoT-=dt; evoBeam.material.opacity=Math.max(0,S.evoT/1.4)*0.9; evoBeam.scale.set(1+(1.4-S.evoT)*0.3,1,1+(1.4-S.evoT)*0.3); if(S.evoT<=0) evoBeam.visible=false; }
    if(chestM.visible){ chestM.position.y=Math.abs(Math.sin(S.t*4))*0.25; chestM.rotation.y=Math.sin(S.t*2)*0.4; chestM.userData.glow.material.opacity=0.6+Math.sin(S.t*8)*0.3; }
    frz.style.opacity=S.freeze>0?'1':'0';
    if(water){ water.userData.shine.scale.setScalar(1+Math.sin(S.t*1.5)*0.15); }
    flags.forEach(function(fl,i){ var pa=fl.geometry.attributes.position, b0=fl.userData.base; for(var v=0;v<pa.count;v++){ var x=b0[v*3]; pa.setZ(v,Math.sin(S.t*5+x*6+i)*0.08*(x+0.35)); } pa.needsUpdate=true; });
    fx.update(dt,0); AMB(dt);
    var sh=S.shake||0; S.shake=Math.max(0,sh-dt*2.5);
    cam.position.set(camBase.x+(Math.random()-0.5)*sh*0.5,camBase.y+(Math.random()-0.5)*sh*0.5,camBase.z);
    renderer.render(scene,cam);
  }
  function layout(){ return {world:WORLD,loop:LOOP,stage:STG,pads:pads.filter(function(q){ return q.lv; }).map(function(q){ return {x:q.x,z:q.z,type:q.type,lv:q.lv,br:q.br,br2:q.br2,prio:q.prio,high:!!q.high,spent:q.spent}; })}; }
  function restoreLayout(){ var L=opt.layout; if(!L||L.world!==WORLD||L.loop!==LOOP||SUB===1) return; var n=0;
    L.pads.forEach(function(d){ var p=pads.filter(function(q){ return Math.hypot(q.x-d.x,q.z-d.z)<0.6; })[0];
      if(!p){ if(distToPath(d.x,d.z)<1.75) return; p={x:d.x,z:d.z,lv:0,type:null,cd:0,mesh:null,aim:0,spent:0,prio:0}; padMeshes(p); pads.push(p); addLbl(); }
      p.type=d.type; p.lv=d.lv; p.br=d.br; p.br2=d.br2; p.prio=d.prio||0; p.spent=d.spent||0; p.temp=false; setTower(p); n++; });
    if(n){ S.coins=30+Math.round(stage*2); say('🏘 まちを ひきついだ！（'+n+'）','#bbf7d0',1400); } }
  function finish(win,quit){
    if(S.over) return; nightBtn.style.display='none'; S.over=true; panel.style.display='none'; S.asking=false; closeMenu();
    var gok=win&&goalOk(), stars=win?(1+(S.hp>=S.maxHp*0.6?1:0)+(gok&&S.hp>=S.maxHp*0.6?1:0)):0;
    var res={layout:win?layout():null,world:WORLD,win:!!win,quit:!!quit,stage:stage,wave:S.wave,waves:NW,right:S.right,wrong:S.wrong,kills:S.kills,hp:S.hp,stars:stars};
    var extra={}; try{ extra=opt.onEnd?opt.onEnd(res)||{}:{}; }catch(e){}
    hud2();
    setTimeout(function(){ if(!R.S||R.S!==S) return;
      showPanel('<div style="font-size:14px;font-weight:800;opacity:.7;">STAGE '+stage+'</div>'+
      '<div style="font-size:30px;font-weight:900;line-height:1.2;margin:4px 0 6px;color:'+(win?'#15803d':'#b91c1c')+';">'+(win?'おしろを まもった！':(quit?'おつかれさま':'おしろが おちた…'))+'</div>'+
      (win?'<div style="font-size:40px;letter-spacing:4px;margin-bottom:6px;">'+[1,2,3].map(function(i){ return '<span style="color:'+(i<=stars?'#f59e0b':'#d1d5db')+';">★</span>'; }).join('')+'</div><div style="font-size:11px;opacity:.7;margin-bottom:8px;">'+('<span style="color:'+(S.hp>=S.maxHp*0.6?'#16a34a':'#9ca3af')+';">'+(S.hp>=S.maxHp*0.6?'✔':'✘')+' ❤️を 6わり のこす</span>　<span style="color:'+(gok?'#16a34a':'#9ca3af')+';">'+(gok?'✔':'✘')+' '+GOAL.t+'</span>')+(SUB===WPS?'<div style="font-size:14px;color:#b45309;margin-top:4px;">🎉 ワールド '+WORLD+' クリア！</div>':'')+'</div>':'')+
      '<div style="display:flex;justify-content:space-around;background:#ecfdf5;border-radius:12px;padding:10px 4px;font-weight:900;font-size:15px;">'+
      '<div>🌊 '+Math.min(S.wave,NW)+'/'+NW+'</div><div>💥 '+S.kills+'</div><div style="color:#16a34a;">○ '+S.right+'</div><div style="color:#dc2626;">× '+S.wrong+'</div></div>'+
      (extra.reward?'<div style="font-size:12px;font-weight:800;margin-top:10px;opacity:.8;">'+extra.reward+'</div>':''),
      [{t:extra.retryLabel||'つぎへ',c:'#15803d',f:function(){ if(opt.onRetry) opt.onRetry(); }},{t:'もどる',c:'#8a9392',f:function(){ stop(); if(opt.onExit) opt.onExit(); }}]); },win?1200:600);
  }
  hud2();
  R.raf=requestAnimationFrame(frame);
  var skinK='red';
  var GOALS=[{k:'nodmg',t:'❤️を へらさずに クリア'},{k:'tower5',t:'タワー 5ほん いないで クリア'},{k:'eng',t:'えいごを ぜんもん せいかい'},{k:'hero5',t:'ゆうしゃを Lv5 いじょうに'},{k:'nomine',t:'⛏きんこうを つかわずに クリア'}];
  var GOAL=SUB===WPS?GOALS[0]:GOALS[(STG*3+1)%5];
  function goalOk(){ if(GOAL.k==='nodmg') return S.hp>=S.maxHp; if(GOAL.k==='tower5') return (S.maxTw||0)<=5; if(GOAL.k==='eng') return S.wrong===0&&S.right>0; if(GOAL.k==='hero5') return hero.lv>=5; return !S.usedMine; }
  function startGame(){ panel.style.display='none'; S.paused=false; S.asking=false; S.last=0;
    restoreLayout(); hud2(); dayStart(); }
  function showStart(){ S.paused=true; S.asking=true; var info=null; try{ info=opt.research&&opt.research.get(); }catch(e){}
    showPanel('<div style="font-size:13px;opacity:.7;font-weight:800;">ワールド '+WORLD+' - '+SUB+(LOOP?'　（'+(LOOP+1)+'しゅうめ）':'')+'</div><div style="font-size:28px;font-weight:900;margin:2px 0 4px;">'+MP.name+'</div>'+worldRow(WORLD)+
      '<div style="font-size:12px;opacity:.8;margin-top:6px;">ウェーブ '+NW+'　'+(SUB===WPS?'👑 ボス：'+BINFO.name:'さいごに ちゅうボス')+'</div><div style="font-size:12px;margin-top:4px;background:#fef3c7;border-radius:8px;padding:3px 6px;">⭐ ミッション：'+GOAL.t+'</div>',
      [{t:'▶ スタート',c:'#15803d',f:startGame}].concat(opt.pickStage?[{t:'🗺 ワールドマップ',c:'#0f766e',f:showWorld}]:[])
      
      .concat([{t:'🐾 ゆうしゃ ／ 📖 ずかん',c:'#b45309',f:showBook}])); }
  function bar(v,max){ var n=Math.max(1,Math.min(5,Math.round(v/max*5))); return '<span style="color:#f59e0b;letter-spacing:1px;">'+'■'.repeat(n)+'</span><span style="color:#e5e7eb;">'+'■'.repeat(5-n)+'</span>'; }
  function showBook(){ var nm='ゆうしゃ';
    var html='<div style="font-size:20px;font-weight:900;">🐾 '+escH(nm)+'</div><div style="font-size:14px;font-weight:900;color:#1d4ed8;">'+HC.ico+' '+HC.name+'</div>'+
      '<div style="text-align:left;font-size:13px;line-height:1.8;background:#eff6ff;border-radius:10px;padding:6px 10px;margin:6px 0;">こうげき '+bar(HC.atk*HC.rate,8)+'<br>しゃてい '+bar(HC.range,4.5)+'<br>はやさ '+bar(HC.spd,3.6)+'<br>とくぎ：'+HC.skill+'<br>しんか：'+HC.forms.join(' → ')+'<br><span style="font-size:11px;opacity:.7;">てきを たおすと レベルアップ。Lv4と Lv8で しんか（つよさ ×1.5 → ×2.2）</span></div>'+
      '<div style="font-size:16px;font-weight:900;margin-top:8px;">📖 てき ずかん</div><div style="max-height:34vh;overflow:auto;text-align:left;font-size:12px;line-height:1.5;">'+
      ['n','f','ra','th','b','sh','go','kn','tr','fly','fb','heal','flag','gd','nc','sl','sp','mo','gh','cham','bm','sa'].map(function(k){ var e=ET[k]; return '<div style="border-bottom:1px solid #e5e7eb;padding:4px 2px;"><b>'+EICO[k]+' '+e.name+'</b> <span style="font-size:10px;background:#e0e7ff;border-radius:6px;padding:0 4px;">'+(e.role||'')+'</span>　たいりょく '+bar(e.hp,7)+' はやさ '+bar(e.spd,3)+'<br><span style="opacity:.8;">'+
        (e.air?'そらを とぶ（💣が とどかない）。':e.armor?'よろいで ダメージを へらす。':e.heal?'まわりの なかまを なおす。':e.split?'たおすと 2ひきに わかれる。':e.dig?'とちゅうで もぐる。':k==='ra'?'むれで くる。':k==='go'?'とても かたい。まほうが ききにくい。':e.bomb?'たおすと ばくはつ（ちかくの タワーが とまる・ゆうしゃが ふらふら）。':e.sapper?'ちかくの タワーを こわして 3びょう とめる。':e.guard?'まわりの てきに バリアを はる。':e.necro?'たおれた てきを ガイコツに して よみがえらせる。':e.thief?'おしろに つくと コインを ぬすむ（たおすと 🪙+5）。':e.regen?'たいりょくが かいふくする（🔥で とまる）。':e.armor&&e.hp>5?'とても かたい よろい。':e.egg?'こグモを うむ。':e.flag?'まわりの てきを はやくする。さきに たおそう。':e.ghost?'ときどき すける（🔮だけ あたる）。':e.hide?'みえない。ゆうしゃが ちかづくか ❄️で みえる。':'')+weakTxt(k)+'</span></div>'; }).join('')+
      '<div style="font-size:14px;font-weight:900;margin-top:8px;">🗼 タワーの しんか（Lv4 → Lv5 きわみ）</div>'+['arrow','magic','ice','cannon'].map(function(t){ return '<div style="padding:3px 2px;border-bottom:1px solid #e5e7eb;"><b>'+TT[t].ico+' '+TT[t].name+'</b>'+BR[t].map(function(b){ return '<br>　'+b.ico+b.name+' → '+B5[b.key].map(function(c){ return c.ico+c.name; }).join(' ／ '); }).join('')+'</div>'; }).join('')+'<div style="font-size:14px;font-weight:900;margin-top:8px;">👑 ワールドの ボス</div>'+['🐗 イノシシ王：ときどき とっしん（❄️で とめられる）','❄️ イエティ：ゆきだまで タワーを こおらせる','🦂 きょだいサソリ：すなに もぐる・ちかくの ゆうしゃを まひ','🐉 ほのおの ドラゴン：そらを とぶ・ブレスで てきを はやく','👿 まおう：3かい へんしん（てしたを よぶ・バリア・テレポート）'].map(function(t){ return '<div style="padding:3px 2px;border-bottom:1px solid #e5e7eb;">'+t+'</div>'; }).join('')+'<div style="padding:4px 2px;opacity:.8;">⚔ ボスの HPが はんぶんに なると えいごバトル！</div>'+
      '<div style="padding:4px 2px;opacity:.8;">✨ きんいろの エリートは つよいけど コイン 3ばい。とくせい：🛡バリア 💨はやい 💚かいふく 🚫❄️こおらない 🚫🔥もえない ⚙かたい</div></div>';
    var pick='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:4px 0 8px;">'+CLS.map(function(c){ return '<button data-c="'+c.k+'" style="flex:1;border:none;border-radius:10px;padding:6px 2px;font-weight:900;font-size:11px;font-family:inherit;color:#fff;background:'+(c===HC?'#1d4ed8':'#93c5fd')+';">'+c.ico+'<br>'+c.name+'</button>'; }).join('')+'</div>';
    html=html.replace('</div><div style="text-align:left','</div>'+pick+'<div style="text-align:left');
    showPanel(html,[{t:'もどる',c:'#6b7280',f:showStart}]);
    [].forEach.call(panel.querySelectorAll('button[data-c]'),function(b){ b.onclick=function(e){ e.stopPropagation(); HC=CLS.filter(function(c){ return c.k===b.dataset.c; })[0]; try{ opt.research.setCls(HC.k); }catch(_){} buildHero(HC,1); hero.lv=1; hero.xp=0; snd('tap'); showBook(); }; }); }
  var WNAME=['みどりの おか','ゆきの やま','すなの さばく','ほのおの やま','まおうの しろ'], WBOSS=['🐗','❄️','🦂','🐉','👿'];
  function stInfo(){ try{ return opt.research.get(); }catch(e){ return {}; } }
  function worldRow(w){ var info=stInfo(), st=info.starsBy||{}, mx=info.maxStage||STG; var h='<div style="display:flex;justify-content:center;align-items:center;gap:4px;margin-top:4px;">';
    for(var i=1;i<=WPS;i++){ var n=(LOOP*WPS*5)+(w-1)*WPS+i, cur=n===STG, open=n<=mx, sv=st[n]||0;
      h+=(i>1?'<span style="width:4px;height:3px;background:'+(open?'#86efac':'#d1d5db')+';"></span>':'')+'<span data-st="'+n+'" style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:'+(i===WPS?38:28)+'px;height:'+(i===WPS?38:28)+'px;border-radius:50%;background:'+(cur?'#f59e0b':open?'#16a34a':'#d1d5db')+';color:#fff;font-weight:900;font-size:'+(i===WPS?16:11)+'px;border:3px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.3);cursor:'+(open?'pointer':'default')+';">'+(i===WPS?WBOSS[w-1]:i)+'<span style="font-size:8px;line-height:1;color:#fde047;">'+'★'.repeat(sv)+'</span></span>'; }
    return h+'</div>'; }
  function showWorld(){ var info=stInfo(), mx=info.maxStage||STG, h='<div style="font-size:22px;font-weight:900;">🗺 ワールドマップ</div><div style="font-size:11px;opacity:.7;margin-bottom:6px;">まるを タップで その ステージへ（★を あつめなおせる）</div>';
    for(var w=1;w<=5;w++){ var first=(LOOP*WPS*5)+(w-1)*WPS+1, open=first<=mx; h+='<div style="margin:6px 0;padding:6px;border-radius:12px;background:'+(open?'#f0fdf4':'#f3f4f6')+';opacity:'+(open?1:0.55)+';"><div style="font-weight:900;font-size:13px;text-align:left;">ワールド '+w+'　'+WNAME[w-1]+(open?'':'　🔒')+'</div>'+worldRow(w)+'</div>'; }
    showPanel(h,[{t:'もどる',c:'#6b7280',f:showStart}]);
    [].forEach.call(panel.querySelectorAll('[data-st]'),function(n){ n.onclick=function(e){ e.stopPropagation(); var v=+n.dataset.st; if(v>mx){ snd('wrong'); return; } if(v===STG){ showStart(); return; } snd('tap'); opt.pickStage(v); }; }); }
  setTimeout(function(){ if(R.S===S){ showStart(); [].forEach.call(panel.querySelectorAll('[data-st]'),function(n){ n.onclick=function(e){ e.stopPropagation(); var v=+n.dataset.st, mx=(stInfo().maxStage||STG); if(v<=mx&&v!==STG&&opt.pickStage){ snd('tap'); opt.pickStage(v); } }; }); } },300);
  R.debug={layout:layout,zones:function(){ return zones.length; },night:function(){ nightBtn.onclick({stopPropagation:function(){}}); },place:function(x,z,k){ if(canBuild(x,z)) return false; var p=newPad(x,z); return build(p,k||'arrow'); },canBuild:canBuild,camBase:camBase,PATHS:PATHS,W:WORLD,evolve:evolve,buildHero:buildHero,CLS:CLS,setHC:function(k){ HC=CLS.filter(function(c){ return c.k===k; })[0]; buildHero(HC,1); },cards:function(){ return S.card; },HC:HC,upgrade:upgrade,go:startGame,hero:hero,cam:cam,S:S,pads:pads,finish:finish,TT:TT,
    build:function(i,k){ var q=pads[i]; if(!q) return false; return q.lv?upgrade(q):build(q,k||'arrow'); },
    select:function(i){ sel=pads[i]; renderMenu(); },
    bolt:function(){ boltBtn.onclick({stopPropagation:function(){}}); },info:function(){ var i=renderer.info; return {calls:i.render.calls,tris:i.render.triangles}; }};
  return R;
}
function stop(){
  if(!R||!R.renderer){ R={}; return; }
  cancelAnimationFrame(R.raf); if(R.off) R.off(); if(R.S) R.S.over=true;
  try{ R.scene.traverse(function(n){ if(n.geometry) n.geometry.dispose(); if(n.material){ [].concat(n.material).forEach(function(m){ if(m.map) m.map.dispose(); m.dispose(); }); } }); }catch(e){}
  try{ R.renderer.dispose(); R.renderer.forceContextLoss(); }catch(e){}
  if(R.root){ R.root.innerHTML=''; R.root.style.display='none'; }
  R={};
}
window.EigoTower={ start:function(o){ o.container.style.display='block'; return start(o); }, stop:stop, _dbg:function(){ return R.debug; } };
})();
