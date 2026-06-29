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
  var ADULT=["....o..o......","....o..o......","..oowwwwwwoo..",".owwwwwwwwwwo.","owwwwwwwwwwwwo","owwoowwwwoowwo","owwwwwwwwwwwwo","owwggwwwwggwwo","owwwwoooowwwwo","owwwwwwwwwwwwo",".owwwwwwwwwwo.","..owwwwwwwwo..","...oo.oo.oo..."];
  var ADULT_GOOD=["...oo..oo.....","....o..o......","..oowwwwwwoo..",".owwwwwwwwwwo.","owwwwwwwwwwwwo","owwowwwwwwowwo","owwwwwwwwwwwwo","owwgwwwwwwgwwo","owwwowwwwowwwo","owwwwooooowwwo",".owwwwwwwwwwo.","..owwwwwwwwo..","...oo.oo.oo..."];
  var ADULT_WILD=["o.o.o..o.o.o..",".o.o.o.o.o.o..","..oowwwwwwoo..",".owwwwwwwwwwo.","owwwwwwwwwwwwo","owowwwwwwwwowo","owwwwwwwwwwwwo","owoooooooowwwo","owwwwwwwwwwwwo","oowwwwwwwwwwoo",".owwwwwwwwwwo.","..owwwwwwwwo..","..o.oo..oo.o.."];
  var ADULT_GOOD2=["....o.o.o.....",".....ooo......","..oowwwwwwoo..",".owwwwwwwwwwo.","owwwwwwwwwwwwo","owwowwwwwwowwo","owwwwwwwwwwwwo","owwwgwwwwgwwwo","owwwwoooowwwwo","owwwwwwwwwwwwo",".owwwwwwwwwwo.","..owwwwwwwwo..","...oo.oo.oo..."];
  var ADULT_NORMAL2=[".......o......",".......o......","..oowwwwwwoo..",".owwwwwwwwwwo.","owwwwwwwwwwwwo","owwoowwwwoowwo","owwwwwwwwwwwwo","owwwwwwwwwwwwo","owwwoowwwoowwo","owwwwwwwwwwwwo",".owwwwwwwwwwo.","..owwwwwwwwo..","...o.o..o.o..."];
  var ADULT_WILD2=[".oo......oo...","..oo....oo....","..oowwwwwwoo..",".owwwwwwwwwwo.","owwwwwwwwwwwwo","owooowwwwooowo","owwwwwwwwwwwwo","owoooooooowwwo","owwwwwwwwwwwwo",".owwwwwwwwwwo.","..owwwwwwwwo..","..oo.oo..oo...",".............."];
  var BABY2=[".......o......","......ooo.....","....oooooo....","...owwwwwwo...","..owwwwwwwwo..",".owooowwooowwo",".owwwwwwwwwwwo",".owwwwoowwwwwo","..owwwwwwwwo..","...owwwwwwo...","....oooooo....","....o.oo.o...."];
  var KID2=["..oo......oo..","..ow......wo..","..oowwwwwwoo..",".owwwwwwwwwwo.","owwoowwwwoowwo","owwwwwwwwwwwwo","owwwwoooooowwo","owwwwwwwwwwwwo",".owwwwwwwwwwo.","..owwwwwwwwo..","...oo.oo.oo..."];
  var KID3=["......oo......",".....o........","....oooooo....","...owwwwwwo...","..owwwwwwwwo..",".owooowwooowwo",".owooowwooowwo",".owwwwwwwwwwwo",".owwwooooowwwo","..owwwwwwwwo..","...owwwwwwo...","....oooooo...."];
  var KID4=["....oooooo....","...owwwwwwo...","..owwwwwwwwo..",".owwwwwwwwwwo.","owwwwwwwwwwwwo","owwoowwwwoowwo","owwwwwwwwwwwwo","owwgwwwwwwgwwo","owwwwoooowwwwo","owwwwwwwwwwwwo",".owwgwwwwgwwo.","..owwwwwwwwo..","...oo.oo.oo..."];
  var ADULT_STAR=["...o.o.o.o....","...oooooooo...","..oowwwwwwoo..",".owwwwwwwwwwo.","owwwwwwwwwwwwo","owwoowwwwoowwo","owwwwwwwwwwwwo","owwgwowwowgwwo","owwwwooooowwwo","owwwwwwwwwwwwo",".owwwwwwwwwwo.","..owwwwwwwwo..","...oo.oo.oo..."];
  var ADULT_STAR2=["...oooooo.....","...o....o.....","..oowwwwwwoo..",".owwwwwwwwwwo.","owwwwwwwwwwwwo","owwowwwwwwowwo","owwwwwwwwwwwwo","owwwgwwwwgwwwo","owwwowwwwowwwo","owwwwooooowwwo",".owwwwwwwwwwo.","..owwwwwwwwo..","...oo.oo.oo..."];
  var DEVIL_PAL = { o:'#15131a', k:'#2c2733', Y:'#f6d65e', e:'#15131a', p:'#f3a3bf' };
  var DEVIL=["..o.........o..",".ooo.......ooo.",".okko.....okko.","..ookkkkkkkoo..","...okkkkkkkkko.","okkYYkkkkkYYkko","okkYekkkkkeYkko","okkkkkpkpkkkkko","okkkkkkkkkkkkko",".okkkkkkkkkkko.","..okkkkkkkko.oo","...oo...oo...ok",".............oo"];

  var BABIES = {
    e: { img:'ぴよたま', map:BABY,  name:'ぴよたま', desc:'うまれたて。まんまるで げんきな あかちゃん。' },
    o: { img:'もふたま', map:BABY2, name:'もふたま', desc:'うまれたて。ふわふわの ねぼすけ あかちゃん。' }
  };
  var CHILDREN = {
    e_g: { img:'ぴな',     map:KID,  name:'ぴな',     desc:'すなおで げんきな こども。' },
    e_b: { img:'うさたま', map:KID2, name:'うさたま', desc:'みみが かわいい あまえんぼう こども。' },
    o_g: { img:'しろころ', map:KID3, name:'しろころ', desc:'まんまる ころころの げんき こども。' },
    o_b: { img:'ぷくたま', map:KID4, name:'ぷくたま', desc:'ぷくぷく ほっぺの たべるの だいすき こども。' }
  };
  var YOUNG=["...o......o...","...oo....oo...","..oowwwwwwoo..",".owwwwwwwwwwo.","owwwoowwwoowwo","owwwwwwwwwwwwo","owwwwoooooowwo","owwwwwwwwwwwwo","owwwwwwwwwwwwo",".owwwwwwwwwwo.","..owwwwwwwwo..","...oo.oo.oo...",".............."];
  var YOUNG2=[".....oooo.....","....o....o....","..oowwwwwwoo..",".owwwwwwwwwwo.","owwoowwwwoowwo","owwwwwwwwwwwwo","owwwwwwwwwwwwo","owwwoooooowwwo","owwwwwwwwwwwwo",".owwwwwwwwwwo.","..owwwwwwwwo..","...oo.oo.oo...",".............."];
  var YOUNGS = {
    e: { img:'すいすいたま', map:YOUNG,  name:'すいすいたま', desc:'すいすい うごく げんきな わかもの。' },
    o: { img:'くさたま',     map:YOUNG2, name:'くさたま',     desc:'しぜんが だいすきな おちついた わかもの。' }
  };
  // アダルトは おせわの せいせきで tier がきまり、その中から ランダムで しんかする
  var ADULT_TIERS = {
    star:   ['おひさま','みらたま','にんじゃ','ぴこぴこ'],
    good:   ['どきどき','はがた','かぶら','うらら','ねむね'],
    normal: ['はんば','もぐもぐ','げーむ','たまぱ','めっこ'],
    wild:   ['めらめら','ちゃめ','がくがく','くちぱ','ぴねむ','ばぶたま'],
    devil:  ['くろだま','おばけ']
  };
  var ADULT_DESC = {
    'おひさま':'せわ かんぺき！みんなを てらす たいようの子。',
    'みらたま':'せわ かんぺき！みらいから きた ロボの子。',
    'にんじゃ':'せわ かんぺき！しゅぎょうを つんだ にんじゃ。',
    'ぴこぴこ':'せわ かんぺき！げんきに うごく ロボの子。',
    'どきどき':'やさしさ いっぱい。みんなが だいすき。',
    'はがた':'れいぎ ただしい しっかりや。',
    'かぶら':'のんびりやさん。しぜんが だいすき。',
    'うらら':'ほんわか おっとり マイペース。',
    'ねむね':'ものしずかで かんがえぶかい まほうつかい。',
    'はんば':'たべるの だいすき。げんきな ふつうの子。',
    'もぐもぐ':'おっとり マイペース。たべるの だいすき。',
    'げーむ':'あそぶの だいすき。すなおな ふつうの子。',
    'たまぱ':'マイペースで のんびりやの ふつうの子。',
    'めっこ':'げんきで すなおな ふつうの子。',
    'めらめら':'やんちゃで ねっけつ。あばれんぼう。',
    'ちゃめ':'いたずら だいすきな やんちゃっ子。',
    'がくがく':'おちつきの ない げんきいっぱいっ子。',
    'くちぱ':'まけずぎらいの つよがり。',
    'ぴねむ':'いたずら まほうの わんぱくっ子。',
    'ばぶたま':'すこし わがままな あばれんぼう。',
    'くろだま':'レア！せわを サボりすぎると あらわれる くろねこ。',
    'おばけ':'レア！よなかに そっと あらわれる おばけ。'
  };
  var ADULTS = (function(){ var o={}; Object.keys(ADULT_TIERS).forEach(function(t){ ADULT_TIERS[t].forEach(function(id){ o[id]={ img:id, name:id, desc:ADULT_DESC[id]||'', tier:t, rare:(t==='devil') }; }); }); return o; })();
  // きゅうバージョンの セーブ（tier_parity / devil）との ごかんマップ
  var LEGACY_ADULT = { star_e:'おひさま',star_o:'みらたま',good_e:'どきどき',good_o:'はがた',normal_e:'はんば',normal_o:'もぐもぐ',wild_e:'めらめら',wild_o:'ちゃめ',devil:'くろだま' };
  function normAdult(id){ return ADULTS[id]?id:(LEGACY_ADULT[id]||id); }
  var imgCache={};
  function imgSrc(n){ return 'characters/'+encodeURIComponent(n)+'.png'; }
  function getImg(n){ if(!imgCache[n]){ var im=new Image(); im.src=imgSrc(n); imgCache[n]=im; } return imgCache[n]; }
  function babyInfo()  { return BABIES[state.babyType]  || BABIES.e; }
  function childInfo() { return CHILDREN[state.childType] || CHILDREN.e_g; }
  function youngInfo() { return YOUNGS[state.youngType] || YOUNGS.e; }
  function adultById(id){ return ADULTS[id] || (id&&LEGACY_ADULT[id]&&ADULTS[LEGACY_ADULT[id]]) || ADULTS[ADULT_TIERS.normal[0]]; }
  function adultInfo() { return adultById(state.adultType); }
  function adultMap()  { return adultInfo().map; }
  function predictedTier(){
    var ms=state.maxStreak||0, met=(state.metDates||[]).length, miss=state.careMiss+state.disciplineMiss;
    if(miss>=8) return 'devil';
    return (ms>=7&&met>=10)?'star':(ms>=3||met>=5)?'good':(met>=2)?'normal':'wild';
  }
  function predictedAdultKey(){ return ADULT_TIERS[predictedTier()][0]; }
  function pickAdult(tier){ var pool=ADULT_TIERS[tier]||ADULT_TIERS.normal; return pool[(Math.random()*pool.length)|0]; }
  function petInfo(){ if(state.lv>=5) return adultInfo(); if(state.lv>=4) return youngInfo(); if(state.lv>=3) return childInfo(); if(state.lv>=2) return babyInfo(); return {map:EGG}; }
  function petMap(){ var i=petInfo(); return i.map||EGG; }
  function drawPet(){
    var info=petInfo();
    var petSvg=document.getElementById('pet');
    var petImg=document.getElementById('petImg');
    if(info.img){
      if(petImg){ petImg.src=imgSrc(info.img); petImg.style.display='block'; }
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
    var def={ name:"ぴよ",lv:1,xp:0,hunger:80,happy:80,food:0,dirty:false,streak:1,learned:0,last:today(),grade:"g3",discipline:50,weight:5,careMiss:0,disciplineMiss:0,wagamama:false,babyType:null,childType:null,adultType:null,customImg:{},gameHi:0,dailyGoal:30,todayDate:today(),todayWords:[],lastGoalDate:null,metDates:[],wrongWords:[],petColor:'brown',bg:'meadow',freezeTickets:0,lastTicketDate:null,rewardHour:null,lastBoxWeek:null,titles:[],sound:true,mastery:{},learn:{},maxStreak:0,sick:false,born:Date.now(),stageSince:Date.now(),lifespanDays:12+Math.floor(Math.random()*3),youngType:null,memories:[],schemaV:2,lastBackupNudge:null,lastTick:Date.now() };
    s=Object.assign({},def,s||{});
    s.dailyGoal=30; // 1日の目標は30に固定
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
  function learnRec(k){ return state.learn[k]||{c:0,w:false,m:false}; }
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
  }
  function applyDaily(){
    if(state.todayDate!==today()){ state.todayDate=today(); state.todayWords=[]; }
    if(state.last===today()) return;
    var prev=new Date(state.last), now=new Date(today());
    var diff=Math.round((now-prev)/86400000);
    state.discipline=Math.max(0,state.discipline-5*Math.min(diff,3));
    if(state.hunger===0) state.careMiss++;
    if(state.happy===0) state.careMiss++;
    // 病気：健康なら基本5%、お腹/ごきげんが低い・太りすぎだと上がる
    if(state.lv>=2&&!state.sick){ var p=0.05+(state.hunger<30?0.12:0)+(state.happy<30?0.12:0)+Math.min(0.12,Math.max(0,(state.weight-20))*0.006); if(Math.random()<p*Math.min(diff,3)) state.sick=true; }
    // 寿命：よく勉強・世話できると延び、放置・病気放置で縮む（10〜15日）
    var good=(state.lastGoalDate===yesterday())&&state.hunger>0&&state.happy>0&&!state.sick;
    state.lifespanDays=Math.max(10,Math.min(15,(state.lifespanDays||12)+(good?0.5:-1*Math.min(diff,3))));
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
      var parity=(state.learned%2===0)?'e':'o';
      var miss=state.careMiss+state.disciplineMiss;
      var ms=state.maxStreak||0, met=(state.metDates||[]).length;
      state.lv++; state.stageSince=Date.now();
      if(state.lv===2&&!state.babyType){ state.babyType=parity; }
      else if(state.lv===3&&!state.childType){ state.childType=(state.babyType||'e')+'_'+(met>=2?'g':'b'); }
      else if(state.lv===4&&!state.youngType){ state.youngType=parity; }
      else if(state.lv===5&&!state.adultType){
        var tier=(miss>=8)?'devil':(ms>=7&&met>=10)?'star':(ms>=3||met>=5)?'good':(met>=2)?'normal':'wild';
        state.adultType=pickAdult(tier);
      }
      bubble(stageName()+"になった！"); sfx('fanfare'); save();
      if(typeof render==='function') render();
      return true;
    }
    return false;
  }
  function checkDeath(){
    if(state._farewell){ showFarewell(adultInfo()); return true; } // お別れ未完了で再起動した場合も再表示
    if(state.lv>=5 && ageDays()>=state.lifespanDays){ farewell(); return true; }
    return false;
  }
  function farewell(){
    state._farewell=true;
    var ai=adultInfo();
    state.memories=state.memories||[];
    state.memories.unshift({ name:state.name, adultType:state.adultType, adultName:ai.name, born:state.born, died:today(), days:Math.max(1,Math.round(ageDays())), learned:state.learned });
    if(state.memories.length>30) state.memories.length=30;
    save(); showFarewell(ai);
  }
  function rebirth(){
    state._farewell=false;
    state.lv=1; state.xp=0; state.born=Date.now(); state.stageSince=Date.now();
    state.hunger=80; state.happy=80; state.dirty=false; state.weight=5;
    state.careMiss=0; state.disciplineMiss=0; state.wagamama=false;
    state.babyType=null; state.childType=null; state.youngType=null; state.adultType=null;
    state.sick=false; state.lifespanDays=12+Math.floor(Math.random()*3);
    var fw=document.getElementById('farewell'); if(fw) fw.style.display='none';
    save(); show('home'); render();
  }
  function showFarewell(ai){
    var el=document.getElementById('farewell'); if(!el){ rebirth(); return; }
    var sp=document.getElementById('fwSprite'); if(sp) sp.innerHTML=spriteHTML(ai,4);
    var nm=document.getElementById('fwName'); if(nm) nm.textContent=state.name+'（'+ai.name+'）';
    var ms=document.getElementById('fwMsg'); if(ms) ms.innerHTML=Math.max(1,Math.round(ageDays()))+'日 いっしょに がんばったね。<br>たくさんの えいごを おぼえる おてつだいを ありがとう！';
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
    document.getElementById('xpBar').style.width=pct(state.lv>=5?100:Math.min(100,stageElapsed()/STAGE_DUR[state.lv-1]*100));
    document.getElementById('foodCnt').textContent='えさ '+state.food;
    document.getElementById('cleanCnt').textContent=state.dirty?'よごれてる':'きれい';
    document.getElementById('scoldCnt').textContent=state.wagamama?'いまだ！':'わがまま時';
    document.getElementById('learned').textContent=state.learned;
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
    document.querySelectorAll('.goalbtn').forEach(function(b){ b.classList.toggle('sel',(+b.dataset.goal)===state.dailyGoal); });
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
    document.querySelectorAll('#sndset .optbtn').forEach(function(b){ b.classList.toggle('sel',(b.dataset.v==='1')===!!state.sound); });
    var fc=document.getElementById('fcSprite');
    if(fc){
      if(state.lv>=5){ var ai=adultInfo(); fc.innerHTML=spriteHTML(ai,3); document.getElementById('fcTitle').textContent='そだった アダルト'; document.getElementById('fcName').textContent=ai.name; document.getElementById('fcMsg').textContent='りっぱに そだったね！'; }
      else { var tier2=predictedTier(), pa=ADULTS[predictedAdultKey()]; fc.innerHTML=spriteHTML(pa,3); document.getElementById('fcTitle').textContent='いまの ペースだと…'; document.getElementById('fcName').textContent=(tier2==='devil')?'？？？':(pa.name+' など'); var ms2=state.maxStreak||0, met3=(state.metDates||[]).length; var ns=Math.max(0,7-ms2), nm=Math.max(0,10-met3); document.getElementById('fcMsg').textContent=(tier2==='star')?'さいこうの おとな コース！この ちょうしで！':(tier2==='devil')?'サボりすぎ… べんきょう・おせわを しよう':('さいこうを めざすなら：れんぞく あと'+ns+'日 ／ たっせい あと'+nm+'日！'); }
    }
    var nd=document.getElementById('nudge');
    if(nd){ if(done>=goal){ nd.style.display='none'; } else { nd.style.display='block'; nd.textContent=done>0?('きょうは あと '+(goal-done)+'こ！ がくしゅうしよう →'):('きょうの べんきょうを はじめよう！ →'); } }
  }
  function showGoalCelebration(){ document.getElementById('celeMsg').innerHTML='きょう '+state.dailyGoal+'こ おぼえたよ！<br>'+displayStreak()+'にち れんぞく'; document.getElementById('celeReward').textContent='ごほうび：えさ +5 ／ ごきげん まんたん'; document.getElementById('goalCele').style.display='flex'; cheer(); }
  var bubT;
  function bubble(t){ var b=document.getElementById('bubble'); b.textContent=t; b.style.opacity=1; clearTimeout(bubT); bubT=setTimeout(function(){ b.style.opacity=0; },1100); }
  function cheer(){ var w=document.getElementById('petWrap'); if(!w) return; wakePet(); w.classList.add('happy'); setTimeout(function(){ w.classList.remove('happy'); },1200); }

  /* ---- care ---- */
  document.getElementById('bFeed').onclick=function(){ if(state.food<=0){ bubble("べんきょうして えさをあつめよう"); return; } state.food--; state.hunger=Math.min(100,state.hunger+25); state.happy=Math.min(100,state.happy+5); state.weight+=1; addXp(5); if(Math.random()<0.45) state.dirty=true; bubble("もぐもぐ"); cheer(); save(); render(); };
  document.getElementById('bSnack').onclick=function(){ state.happy=Math.min(100,state.happy+14); state.weight+=3; if(Math.random()<0.35) state.dirty=true; bubble("おいしい！でも たいじゅう+"); cheer(); save(); render(); };
  document.getElementById('bPlay').onclick=function(){ if(state.food<=0){ bubble("べんきょうして えさを あつめよう"); return; } show('gameSelect'); };
  function consumePlay(){ state.food--; state.weight=Math.max(5,state.weight-1); save(); }
  document.getElementById('backSelect').onclick=function(){ show('home'); render(); };
  document.getElementById('selJump').onclick=function(){ if(state.food<=0){ bubble('えさが たりない'); return; } consumePlay(); startGame(); };
  document.getElementById('selSea').onclick=function(){ if(state.food<=0){ bubble('えさが たりない'); return; } consumePlay(); startSeaGame(); };
  document.getElementById('bScold').onclick=function(){ if(state.wagamama){ state.wagamama=false; state.discipline=Math.min(100,state.discipline+12); clearTimeout(wagaTimer); bubble("いいこ だね！"); cheer(); } else { state.discipline=Math.max(0,state.discipline-6); bubble("いまは しからないで…"); } save(); render(); };
  var flushing=false;
  document.getElementById('bClean').onclick=function(){ if(flushing) return; if(state.dirty){ flushing=true; var p=document.getElementById('poop'), fl=document.getElementById('flush'); p.classList.add('flushing'); fl.classList.add('on'); bubble("ザブーン！"); sfx('flush'); setTimeout(function(){ p.classList.remove('flushing'); fl.classList.remove('on'); flushing=false; state.dirty=false; state.happy=Math.min(100,state.happy+10); bubble("ぴかぴか"); save(); render(); },1000); } else bubble("きれいだよ"); };
  var MED_COST=20;
  document.getElementById('bMed').onclick=function(){ if(!state.sick){ bubble("げんきだよ！"); return; } if(state.food<MED_COST){ bubble("おくすりは えさ"+MED_COST+"こ ひつよう…"); return; } state.food-=MED_COST; state.sick=false; state.happy=Math.min(100,state.happy+20); bubble("おくすりで げんきに なった！"); sfx('unlock'); cheer(); save(); render(); };
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
    var adultHTML='<div class="gstage">アダルト ずかん（'+got+'/'+ak.length+'）</div><div class="ggrid">'+ak.map(function(k){ var a=ADULTS[k], has=col[k]; return '<div class="gcard"'+(has?'':' style="opacity:.4;"')+'><div class="gsprite">'+(has?spriteHTML(a,5):'<div style="height:65px;display:flex;align-items:center;justify-content:center;font-size:28px;color:var(--mut);">？</div>')+'</div><div class="gname">'+(has?a.name:'？？？')+'</div><div class="gdesc">'+(has?a.desc:'まだ そだてていない')+'</div></div>'; }).join('')+'</div>';
    document.getElementById('adminGallery').innerHTML='<div class="gstage">タマゴ</div>'+gridHTML([{map:EGG,name:'タマゴ',desc:'もうすぐ うまれるよ。'}])+'<div class="gstage">ベビー</div>'+gridHTML(Object.values(BABIES))+'<div class="gstage">キッズ</div>'+gridHTML(Object.values(CHILDREN))+'<div class="gstage">ヤング</div>'+gridHTML(Object.values(YOUNGS))+adultHTML;
    var tree=tnode({map:EGG},'タマゴ')+'<div class="tarrow">↓</div><div class="eohead"><span>EVEN</span><span>ODD</span></div>';
    tree+='<div class="trow">'+tnode(BABIES.e,BABIES.e.name,true)+tnode(BABIES.o,BABIES.o.name,true)+'</div><div class="tarrow">↓</div>';
    tree+='<div class="trow">'+tnode(CHILDREN.e_g,CHILDREN.e_g.name,true)+tnode(CHILDREN.o_g,CHILDREN.o_g.name,true)+'</div>';
    tree+='<div class="trow">'+tnode(CHILDREN.e_b,CHILDREN.e_b.name,true)+tnode(CHILDREN.o_b,CHILDREN.o_b.name,true)+'</div><div class="tarrow">↓</div>';
    tree+='<div class="tiertag">ヤング</div><div class="trow">'+tnode(YOUNGS.e,YOUNGS.e.name,true)+tnode(YOUNGS.o,YOUNGS.o.name,true)+'</div><div class="tarrow">↓</div>';
    var tiers=[['star','⭐さいこう'],['good','◎よいこ'],['normal','○ふつう'],['wild','△わんぱく'],['devil','★レア']];
    for(var ti=0;ti<tiers.length;ti++){ var tl=tiers[ti]; tree+='<div class="tiertag">'+tl[1]+'</div><div class="trow">'+ADULT_TIERS[tl[0]].map(function(id){ return tnode(ADULTS[id],ADULTS[id].name,true); }).join('')+'</div>'; }
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
  function setAdminTab(t){ curAdminTab=t; ['zukan','kisekae','keifu','tango','data'].forEach(function(k){ document.getElementById('tab-'+k).style.display=(k===t)?'block':'none'; }); document.querySelectorAll('#atabs .atab').forEach(function(b){ b.classList.toggle('sel',b.dataset.t===t); }); if(t==='kisekae') renderCosmetics(); if(t==='data') renderData(); window.scrollTo(0,0); }
  function renderData(){ document.getElementById('dataStat').textContent='なまえ：'+state.name+' ／ レベル '+state.lv+' ／ おぼえた '+state.learned+'こ ／ 🔥'+displayStreak()+'にち'; document.getElementById('exportBox').style.display='none'; document.getElementById('btnCopy').style.display='none'; document.getElementById('importBox').value=''; document.getElementById('dataMsg').textContent=''; }
  function encodeState(){ return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); }
  document.getElementById('btnExport').onclick=function(){ var box=document.getElementById('exportBox'); box.value=encodeState(); box.style.display='block'; document.getElementById('btnCopy').style.display='block'; };
  document.getElementById('btnCopy').onclick=function(){ var box=document.getElementById('exportBox'); box.select(); var ok=function(){ document.getElementById('dataMsg').style.color='var(--g)'; document.getElementById('dataMsg').textContent='コピーしました！'; }; if(navigator.clipboard){ navigator.clipboard.writeText(box.value).then(ok,function(){ try{ document.execCommand('copy'); ok(); }catch(e){} }); } else { try{ document.execCommand('copy'); ok(); }catch(e){} } };
  document.getElementById('btnImport').onclick=function(){ var msg=document.getElementById('dataMsg'); var code=(document.getElementById('importBox').value||'').trim(); if(!code){ msg.style.color='#9b2222'; msg.textContent='コードを はりつけてね'; return; } var obj=null; try{ obj=JSON.parse(decodeURIComponent(escape(atob(code)))); }catch(e){ try{ obj=JSON.parse(code); }catch(e2){} } if(!obj||typeof obj!=='object'||(obj.lv===undefined&&obj.learned===undefined)){ msg.style.color='#9b2222'; msg.textContent='この コードは よみこめません'; return; } if(!confirm('いまの データを この バックアップで 上書きします。よろしいですか？')) return; state=Object.assign({},state,obj); if(!WORDBANK[state.grade]) state.grade='g3'; save(); msg.style.color='var(--g)'; msg.textContent='ふっかつしました！'; renderData(); render(); };
  document.getElementById('btnDownload').onclick=function(){ var msg=document.getElementById('dataMsg'); try{ var blob=new Blob([JSON.stringify(state)],{type:'application/json'}); var url=URL.createObjectURL(blob); var a=document.createElement('a'); var d=new Date(), ds=d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2); a.href=url; a.download='eigopet_backup_'+ds+'.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function(){ URL.revokeObjectURL(url); },1500); msg.style.color='var(--g)'; msg.textContent='ファイルに ほぞんしました！'; }catch(e){ msg.style.color='#9b2222'; msg.textContent='ほぞん できないときは コードを つかってね'; } };
  document.getElementById('fileImport').onchange=function(e){ var f=e.target.files&&e.target.files[0]; var msg=document.getElementById('dataMsg'); if(!f) return; var r=new FileReader(); r.onload=function(){ var obj=null; try{ obj=JSON.parse(r.result); }catch(err){} if(!obj||typeof obj!=='object'||(obj.lv===undefined&&obj.learned===undefined)){ msg.style.color='#9b2222'; msg.textContent='この ファイルは よみこめません'; return; } if(!confirm('いまの データを この バックアップで 上書きします。よろしいですか？')) return; state=Object.assign({},state,obj); if(!WORDBANK[state.grade]) state.grade='jun2'; save(); msg.style.color='var(--g)'; msg.textContent='ふっかつしました！'; renderData(); render(); }; r.readAsText(f); e.target.value=''; };
  document.getElementById('atabs').onclick=function(e){ var b=e.target.closest('.atab'); if(!b) return; setAdminTab(b.dataset.t); };
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
  function startGame(){ var s=gameSetup('ジャンプゲーム','タップで ジャンプ！ しょうがいぶつを よけよう','ジャンプ'); var groundY=s.H-26,petW=s.petW,petH=s.petH; if(game) cancelAnimationFrame(game.raf); game={ mode:'jump',ctx:s.ctx,W:s.W,H:s.H,groundY:groundY,map:s.map,cell:s.cell,img:s.img,petW:petW,petH:petH,px:34,py:groundY-petH,vy:0,onGround:true,jumps:0,obs:[],speed:2.4,t:0,score:0,over:false,raf:0 }; loopGame(); }
  function jump(){ if(game&&!game.over&&game.jumps<2){ game.vy=-9.6; game.jumps++; game.onGround=false; } }
  function startSeaGame(){ var s=gameSetup('うみゲーム','タップで うく！ いわの あいだを とおろう','うく'); var petW=s.petW,petH=s.petH; if(game) cancelAnimationFrame(game.raf); game={ mode:'sea',ctx:s.ctx,W:s.W,H:s.H,map:s.map,cell:s.cell,img:s.img,petW:petW,petH:petH,px:40,py:Math.round(s.H/2-petH/2),vy:0,obs:[],gap:Math.round(petH*2.6),speed:2.2,t:0,score:0,over:false,raf:0 }; loopSea(); }
  function floatUp(){ if(game&&!game.over&&game.mode==='sea'){ game.vy=-5.6; } }
  function loopSea(){ var g=game; if(!g||g.over) return; g.t++; g.speed+=0.0008; if(g.obs.length===0||(g.W-g.obs[g.obs.length-1].x)>(150+Math.random()*70)){ var gw=16+Math.floor(Math.random()*6),gy=24+Math.floor(Math.random()*(g.H-g.gap-48)); g.obs.push({x:g.W,w:gw,gy:gy}); } g.obs.forEach(function(o){ o.x-=g.speed; }); g.obs=g.obs.filter(function(o){ return o.x+o.w>-4; }); g.score=Math.floor(g.t/6); g.vy+=0.4; g.py+=g.vy; if(g.py<0||g.py+g.petH>g.H){ endGame(); return; } var pl=g.px+5,pr=g.px+g.petW-5,pt=g.py+3,pb=g.py+g.petH-3; for(var oi=0;oi<g.obs.length;oi++){ var o=g.obs[oi]; if(pl<o.x+o.w&&pr>o.x){ if(pt<o.gy||pb>o.gy+g.gap){ endGame(); return; } } } var ctx=g.ctx; ctx.fillStyle='#5fb0e8'; ctx.fillRect(0,0,g.W,g.H); ctx.fillStyle='#bfe3f7'; ctx.fillRect(8,14,16,3); ctx.fillRect(g.W-60,28,16,3); ctx.fillRect(g.W-120,10,16,3); g.obs.forEach(function(o){ ctx.fillStyle='#3b8a5a'; ctx.fillRect(o.x,0,o.w,o.gy); ctx.fillRect(o.x,o.gy+g.gap,o.w,g.H-(o.gy+g.gap)); ctx.fillStyle='#2e6e47'; ctx.fillRect(o.x,o.gy-3,o.w,3); ctx.fillRect(o.x,o.gy+g.gap,o.w,3); }); drawPetSprite(ctx,g,g.px,Math.round(g.py)); document.getElementById('gscore').textContent=g.score; g.raf=requestAnimationFrame(loopSea); }
  function gameInput(){ if(!game||game.over) return; if(game.mode==='sea') floatUp(); else jump(); }
  function loopGame(){ var g=game; if(!g||g.over) return; g.t++; g.speed+=0.0009; if(g.obs.length===0||(g.W-g.obs[g.obs.length-1].x)>(150+Math.random()*130)){ g.obs.push({x:g.W,w:14+Math.floor(Math.random()*8),h:18+Math.floor(Math.random()*22)}); } g.obs.forEach(function(o){ o.x-=g.speed; }); g.obs=g.obs.filter(function(o){ return o.x+o.w>-4; }); g.score=Math.floor(g.t/6); var prevFeet=g.py+g.petH; g.vy+=0.55; g.py+=g.vy; g.onGround=false; if(g.py>=g.groundY-g.petH){ g.py=g.groundY-g.petH; g.vy=0; g.onGround=true; g.jumps=0; } var pl=g.px+5,pr=g.px+g.petW-5; for(var oi=0;oi<g.obs.length;oi++){ var o=g.obs[oi]; var ol=o.x,orr=o.x+o.w,top=g.groundY-o.h; if(pl<orr&&pr>ol){ if(g.vy>=0&&prevFeet<=top+6&&g.py+g.petH>=top){ g.py=top-g.petH; g.vy=0; g.onGround=true; g.jumps=0; } else if(g.py+g.petH>top){ endGame(); return; } } } var ctx=g.ctx; ctx.clearRect(0,0,g.W,g.H); ctx.fillStyle='#e0d3b0'; ctx.fillRect(0,g.groundY,g.W,g.H-g.groundY); ctx.fillStyle='#4a3526'; ctx.fillRect(0,g.groundY,g.W,2); g.obs.forEach(function(o){ ctx.fillStyle='#7a5a2a'; ctx.fillRect(o.x,g.groundY-o.h,o.w,o.h); ctx.fillStyle='#4a3526'; ctx.fillRect(o.x,g.groundY-o.h,o.w,2); }); drawPetSprite(ctx,g,g.px,Math.round(g.py)); document.getElementById('gscore').textContent=g.score; g.raf=requestAnimationFrame(loopGame); }
  function endGame(){ var g=game; g.over=true; cancelAnimationFrame(g.raf); var sc=g.score; var happyGain=Math.min(30,6+Math.floor(sc/4)); state.happy=Math.min(100,state.happy+happyGain); var eBonus=sc>=40?2:sc>=20?1:0; state.food+=eBonus; addXp(5); if(sc>(state.gameHi||0)) state.gameHi=sc; save(); document.getElementById('goverScore').textContent='スコア '+sc+'（さいこう '+state.gameHi+'）'; document.getElementById('goverReward').textContent='ごきげん +'+happyGain+(eBonus?' ／ えさ +'+eBonus:''); document.getElementById('gover').style.display='flex'; }
  function leaveGame(){ if(game){ game.over=true; cancelAnimationFrame(game.raf); } show('home'); render(); }
  (function(){ var cv=document.getElementById('gcanvas'); cv.addEventListener('pointerdown',function(e){ e.preventDefault(); gameInput(); }); document.getElementById('gJump').onclick=gameInput; document.getElementById('gRetry').onclick=function(){ if(state.food<=0){ leaveGame(); bubble('えさが なくなった！べんきょうで あつめよう'); return; } consumePlay(); if(game&&game.mode==='sea') startSeaGame(); else startGame(); }; document.getElementById('gHome').onclick=leaveGame; document.getElementById('backGame').onclick=leaveGame; })();

  /* ---- study ---- */
  var session, qIdx, qList;
  var MAIN_TABS=['home','learn','shop','admin'];
  function show(id){ document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('on'); }); document.getElementById(id).classList.add('on'); var tb=document.getElementById('tabbar'); if(MAIN_TABS.indexOf(id)>=0){ tb.classList.add('on'); document.querySelectorAll('#tabbar .tab').forEach(function(b){ b.classList.toggle('sel',b.dataset.s===id); }); } else { tb.classList.remove('on'); } window.scrollTo(0,0); }
  function gotoTab(s){ if(s==='admin'){ renderAdmin(); wlGrade=state.grade; renderWordList(); setAdminTab('zukan'); } if(s==='shop'){ renderShop(); } show(s); render(); }
  /* ---- ショップ（エサの使い道） ---- */
  var SHOP=[
    {id:'ticket', icon:'🎫', name:'おやすみ券', desc:'れんぞく記録を 1日 まもれる', cost:25, max:function(){ return state.freezeTickets>=9; }, buy:function(){ state.freezeTickets=Math.min(9,state.freezeTickets+1); }},
    {id:'feast',  icon:'🍱', name:'ごちそう',   desc:'おなか まんたん＋ごきげん（太らない）', cost:12, buy:function(){ state.hunger=100; state.happy=Math.min(100,state.happy+25); }},
    {id:'toy',    icon:'🧸', name:'おもちゃ',   desc:'ごきげん +30', cost:8,  buy:function(){ state.happy=Math.min(100,state.happy+30); }},
    {id:'charm',  icon:'🛡', name:'いのちの おまもり', desc:'じゅみょう +1日（さいだい15）', cost:40, max:function(){ return (state.lifespanDays||12)>=15; }, buy:function(){ state.lifespanDays=Math.min(15,(state.lifespanDays||12)+1); }}
  ];
  function renderShop(){
    var esa=document.getElementById('shopEsa'); if(esa) esa.textContent='🍚 えさ '+state.food;
    var box=document.getElementById('shopList'); if(!box) return;
    box.innerHTML=SHOP.map(function(it){
      var maxed=it.max&&it.max(), afford=state.food>=it.cost;
      var btn = maxed ? '<span class="shopmax">MAX</span>'
        : '<button class="shopbuy" data-id="'+it.id+'"'+(afford?'':' disabled')+'>えさ '+it.cost+(afford?'':'<br><span style="font-size:10px;">たりない</span>')+'</button>';
      return '<div class="shopcard"><div class="shopinfo"><div class="shopname">'+it.icon+' '+it.name+'</div><div class="shopdesc">'+it.desc+'</div></div>'+btn+'</div>';
    }).join('');
  }
  document.getElementById('shopList').onclick=function(e){ var b=e.target.closest('.shopbuy'); if(!b) return; var it=SHOP.find(function(x){ return x.id===b.dataset.id; }); if(!it) return; if(it.max&&it.max()){ return; } if(state.food<it.cost){ bubble('えさが たりない'); return; } state.food-=it.cost; it.buy(); save(); sfx('unlock'); cheer(); bubble(it.name+' を かった！'); renderShop(); render(); };
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
  var curWord=null, reviewMode=false;
  function addWrong(w){ if(!w) return; if(!state.wrongWords.some(function(x){ return x[0]===w[0]; })){ state.wrongWords.push([w[0],w[1],w[2]||'',w[3]||'']); if(state.wrongWords.length>200) state.wrongWords=state.wrongWords.slice(-200); } }
  function clearWrong(en){ state.wrongWords=state.wrongWords.filter(function(x){ return x[0]!==en; }); }
  // まちがえた単語(復習まち)を出やすくする重み付き抽選。覚えた=低確率で再確認
  function pickWeighted(words,n){ var used={}, chosen=[], wt=words.map(function(w){ var r=state.learn[w[0].toLowerCase()]; return (r&&r.w&&!r.m)?5:(r&&r.m)?0.2:1; }); for(var s=0;s<n;s++){ var total=0,i; for(i=0;i<words.length;i++){ if(!used[i]) total+=wt[i]; } if(total<=0) break; var rnd=Math.random()*total, acc=0, idx=-1; for(i=0;i<words.length;i++){ if(used[i])continue; acc+=wt[i]; if(rnd<=acc){ idx=i; break; } } if(idx<0){ for(i=0;i<words.length;i++){ if(!used[i]){ idx=i; break; } } } if(idx<0) break; used[idx]=true; chosen.push(words[idx]); } return chosen; }
  function startStudy(){ reviewMode=false; qList=pickWeighted(currentWords(),QPER); qIdx=0; session={correct:0,combo:0,maxCombo:0,newMastered:0,total:qList.length}; document.getElementById('qTotal').textContent=qList.length; show('study'); nextQ(); }
  function escJa(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function choiceHtml(w){ var base='<span class="base">'+escJa(w[1])+'</span>'; var yomi=w[2]?'<span class="yomi">'+escJa(w[2])+'</span>':''; return yomi+base; }
  function firstSenseKana(w){ var s=(w[2]||w[1]||''); return s.split(/[\u3001,\uff0c]/)[0].trim(); }
  function easyText(w){ var k=(w[0]||''); var e=(typeof EASY!=='undefined')?(EASY[k]||EASY[k.toLowerCase()]):null; return e||firstSenseKana(w); }
  function showEasy(w){ var box=document.getElementById('easyHint'); box.innerHTML='<div class="ehlabel">やさしいいみ</div><div class="ehmean">'+escJa(easyText(w))+'</div>'; box.style.display='block'; }
  function attachLongPress(el,cb){
    var t=null, longFired=false, touched=false;
    function start(){ longFired=false; el._lp=false; clearTimeout(t); t=setTimeout(function(){ longFired=true; el._lp=true; cb(); },450); }
    function cancel(){ if(t){ clearTimeout(t); t=null; } }
    el.addEventListener('touchstart',function(){ touched=true; start(); },{passive:true});
    el.addEventListener('touchend',function(e){ cancel(); if(longFired){ try{ e.preventDefault(); }catch(_){} } }); // 長押し後の擬似クリックを抑止
    el.addEventListener('touchmove',cancel);
    el.addEventListener('mousedown',function(){ if(touched){ touched=false; return; } start(); }); // タッチ由来の擬似mousedownは無視(=_lpを消さない)
    el.addEventListener('mouseup',cancel);
    el.addEventListener('mouseleave',cancel);
  }
  function updateStudyProg(){ var fill=document.getElementById('studyProgFill'); if(fill) fill.style.width=((qIdx/(qList?qList.length:1))*100)+'%'; }
  function nextQ(){
    document.getElementById('easyHint').style.display='none';
    if(qIdx>=qList.length){ finishStudy(); return; }
    updateStudyProg();
    var correct=qList[qIdx]; curWord=correct;
    var en=correct[0];
    document.getElementById('qNo').textContent=qIdx+1;
    var qw=document.getElementById('qword');
    qw.textContent=en; qw.classList.toggle('long',en.length>12);
    document.getElementById('reward').textContent='';
    var pool=currentWords().filter(function(w){ return w[0]!==en&&w[1]!==correct[1]; });
    var opts=shuffle([correct].concat(shuffle(pool).slice(0,3)));
    var box=document.getElementById('choices'); box.innerHTML=''; box.style.pointerEvents='';
    opts.forEach(function(o){ var b=document.createElement('button'); b.className='ch'; b.innerHTML=choiceHtml(o); if(o===correct) b._isCorrect=true; b.onclick=function(){ if(b._lp){ b._lp=false; return; } answer(b,o===correct,en); }; attachLongPress(b,function(){ showEasy(o); }); box.appendChild(b); });
    speak(en);
  }
  function recordLearned(en){ if(state.todayDate!==today()){ state.todayDate=today(); state.todayWords=[]; } var k=en.toLowerCase(), already=state.todayWords.indexOf(k)>=0; if(!already) state.todayWords.push(k); if(!already&&state.todayWords.length===state.dailyGoal){ onGoalReached(); } }
  function streakOnGoal(){ if(state.lastGoalDate===today()) return; if(state.lastGoalDate===yesterday()){ state.streak++; } else if(state.lastGoalDate){ var gap=Math.round((new Date(today())-new Date(state.lastGoalDate))/86400000)-1; if(gap>0&&state.freezeTickets>=gap){ state.freezeTickets-=gap; state.streak++; bubble('おやすみ券で れんぞく キープ！'); } else state.streak=1; } else state.streak=1; state.lastGoalDate=today(); if(state.streak>(state.maxStreak||0)) state.maxStreak=state.streak; if(state.metDates.indexOf(today())<0) state.metDates.push(today()); if(state.metDates.length>60) state.metDates=state.metDates.slice(-60); }
  function onGoalReached(){ streakOnGoal(); state.food+=5; state.happy=100; gainGP(20); gainGP(Math.min(state.streak,15)); checkTitles(); setTimeout(showGoalCelebration,850); }
  function checkUnlock(prevLearned){ var items=BGS.filter(function(it){ return it.need>prevLearned&&it.need<=state.learned; }); if(items.length){ bubble('あたらしい はいけい アンロック！'); sfx('unlock'); } }
  function answer(btn,ok,en){ if(btn.classList.contains('ok')||btn.classList.contains('ng')) return; if(ok){ btn.classList.add('ok'); var prev=state.learned, kL=en.toLowerCase(), wasM=!!(state.learn[kL]&&state.learn[kL].m); session.combo=(session.combo||0)+1; if(session.combo>(session.maxCombo||0)) session.maxCombo=session.combo; var mult=session.combo>=6?3:session.combo>=3?2:1; var rt=isRewardTime()?2:1; var gain=mult*rt; session.correct++; state.food+=gain; state.learned++; gainGP((reviewMode?10:8)*gain); onAnswer(en,true); if(!wasM&&state.learn[kL]&&state.learn[kL].m) session.newMastered=(session.newMastered||0)+1; recordLearned(en); checkUnlock(prev); checkTickets(); checkTitles(); sfx(session.combo>=3?'combo':'correct'); var msg2='せいかい！'; if(mult>1) msg2+=' コンボ×'+mult; if(rt>1) msg2+=' ⏰2ばい'; msg2+=reviewMode?' おぼえたね':(' えさ+'+gain); document.getElementById('reward').textContent=msg2; save(); checkEvolve(); setTimeout(function(){ qIdx++; nextQ(); },800); } else { btn.classList.add('ng'); session.combo=0; onAnswer(en,false); save(); sfx('wrong'); document.getElementById('reward').textContent='もういちど！'; } }
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
  document.getElementById('speak').onclick=function(){ speak(document.getElementById('qword').textContent); };
  document.getElementById('dontKnow').onclick=function(){
    if(!curWord) return;
    var box=document.getElementById('choices');
    if(box.style.pointerEvents==='none') return; // すでに回答済み
    box.style.pointerEvents='none';
    var btns=box.querySelectorAll('.ch'); for(var i=0;i<btns.length;i++){ if(btns[i]._isCorrect) btns[i].classList.add('ok'); }
    onAnswer(curWord[0],false); save(); // わからない＝復習まちへ
    document.getElementById('reward').textContent='こたえ：'+curWord[1];
    showEasy(curWord);
    setTimeout(function(){ qIdx++; nextQ(); },2000);
  };

  /* ---- wagamama ---- */
  var wagaTimer=null;
  function homeVisible(){ return document.getElementById('home').classList.contains('on')&&!document.hidden; }
  function triggerWagamama(){ if(state.wagamama||state.lv<2) return; if(typeof wakePet==='function') wakePet(); state.wagamama=true; render(); bubble("！ かまって！"); clearTimeout(wagaTimer); wagaTimer=setTimeout(function(){ if(state.wagamama){ state.wagamama=false; state.disciplineMiss++; state.discipline=Math.max(0,state.discipline-4); save(); render(); } },22000); }
  setInterval(function(){ if(homeVisible()&&!state.wagamama&&Math.random()<0.30) triggerWagamama(); },60000);

  /* ---- 躍動感（ホームでの ふるまい：おさんぽ・おひるね） ---- */
  var asleep=false, walkTimer=null, behaveT=null;
  function petWrapEl(){ return document.getElementById('petWrap'); }
  function isNightTime(){ var b=curBg(); if(b&&b.id==='night') return true; try{ var h=new Date().getHours(); return h>=22||h<6; }catch(e){ return false; } }
  function wakePet(){ if(!asleep) return; asleep=false; var w=petWrapEl(); if(w) w.classList.remove('asleep'); var z=document.getElementById('zzz'); if(z) z.classList.remove('on'); }
  function sleepPet(){ if(asleep) return; asleep=true; var w=petWrapEl(); if(w){ w.classList.remove('walking'); w.classList.add('asleep'); } var z=document.getElementById('zzz'); if(z) z.classList.add('on'); }
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
    if(asleep){ if(!isNightTime()&&Math.random()<0.4) wakePet(); return; }
    var sleepChance=isNightTime()?0.55:(state.sick?0.30:(state.happy<25?0.28:0.07));
    if(Math.random()<sleepChance){ sleepPet(); return; }
    if(Math.random()<0.78) walkTo();                 // のこりは その場で ひとやすみ
  }
  function scheduleBehave(){ clearTimeout(behaveT); behaveT=setTimeout(behaveStep, 1700+Math.random()*2400); }
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
  setInterval(function(){ if(state._farewell) return; decayStats(); save(); var c=checkEvolve(); if(checkDeath()) return; if(homeVisible()&&!c) render(); },60000);
  // バックアップ催促（週1・進捗が貯まってから）
  if(!state._farewell && state.learned>=30){ var lb=state.lastBackupNudge; var due=!lb || (Math.round((new Date(today())-new Date(lb))/86400000)>=7); if(due){ state.lastBackupNudge=today(); save(); setTimeout(function(){ bubble('ときどき データを バックアップしてね（せってい→データ）'); },2500); } }
  try{ document.getElementById('rev').textContent='バージョン '+(typeof APP_REV!=='undefined'?APP_REV:'?'); }catch(e){}
};
