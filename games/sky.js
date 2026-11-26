// 45 Play ゲーム：sky（スカイシューター）。開いたときだけ読み込まれる。共通の関数は index.html にある
// 縦スクロールのシューティング。空の敵は弾、地上の的は爆弾（照準の地面に落ちる）。絵・面・敵はすべてオリジナル
BRAIN.def("sky",`
<section data-pane="sky" data-v="setup">
  <div class="vw" data-v="setup">
    <div class="panel">
      <h2 data-i="skTitle"></h2>
      <p class="lead" data-i="skLead"></p>
      <div class="opt"><span class="ol" data-i="skLv"></span><div class="chips" id="skLvSel">
        <button class="chip" data-val="1" data-i="skLv1"></button><button class="chip" data-val="2" data-i="skLv2"></button><button class="chip" data-val="3" data-i="skLv3"></button></div></div>
      <div class="opt"><span class="ol" data-i="skBomb"></span><div class="chips" id="skBmSel">
        <button class="chip" data-val="btn" data-i="skBombBtn"></button><button class="chip" data-val="auto" data-i="skBombAuto"></button></div></div>
      <p class="lead" style="margin-top:0" id="skBmNote"></p>
      <div class="opt"><span class="ol" data-i="skFrom"></span><div class="chips" id="skFromSel"></div></div>
      <div class="opt"><span class="ol" data-i="skBgm"></span><div class="chips" id="skBgSel">
        <button class="chip" data-val="off" data-i="skOff"></button><button class="chip" data-val="on" data-i="skOn"></button></div></div>
    </div>
    <div class="panel">
      <h2 data-i="recTitle"></h2>
      <div class="skrec" id="skRec"></div>
    </div>
  </div>
  <div class="vw" data-v="play">
    <div class="skstage" id="skStage">
      <canvas id="skCv"></canvas>
      <button class="skbtn skx" id="skExit" type="button" aria-label="pause"><i class="ic" data-ic="x"></i></button>
      <button class="skbtn skbomb" id="skBombBtn" type="button"><span data-i="skBombLbl"></span></button>
      <div class="skpause" id="skPause" hidden>
        <b data-i="skPause"></b>
        <button class="btn primary big" id="skResume"><i class="ic" data-ic="play"></i><span data-i="skResume"></span></button>
        <button class="btn" id="skQuit"><i class="ic" data-ic="x"></i><span data-i="skQuit"></span></button>
      </div>
    </div>
  </div>
</section>
<style>
html.sklock,html.sklock body{overscroll-behavior:none;overflow:hidden;touch-action:none}
.skstage{position:fixed;inset:0;z-index:90;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;overflow:hidden;background:#0B1226}
.skstage canvas{display:block;width:100%;height:100%}
.skbtn{position:absolute;border:0;display:flex;align-items:center;justify-content:center;touch-action:none;-webkit-tap-highlight-color:transparent;z-index:2}
.skx{left:max(10px,env(safe-area-inset-left,0px));top:calc(env(safe-area-inset-top,0px) + 10px);width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.82);color:#14213D}
.skx .ic{width:20px;height:20px}
.skbtn[hidden]{display:none}
.skbomb{right:max(14px,env(safe-area-inset-right,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 22px);width:84px;height:84px;border-radius:50%;background:rgba(255,92,60,.78);color:#fff;font-weight:800;font-size:15px;box-shadow:0 0 0 4px rgba(255,255,255,.35)}
.skbomb.on{background:rgba(255,140,60,.95);transform:scale(.94)}
.skpause{position:absolute;inset:0;background:rgba(8,14,32,.72);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;z-index:3;color:#fff}
.skpause[hidden]{display:none}
.skpause b{font-size:24px;margin-bottom:6px}
.skpause .btn{min-width:190px;justify-content:center}
.skrec{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.skrec div{background:var(--bg);border-radius:12px;padding:8px 4px;text-align:center}
.skrec b{display:block;font:700 18px Fredoka,sans-serif}.skrec span{font-size:11px;color:var(--muted)}
.skrec .wide{grid-column:1/-1}
</style>`,function(){
/* =========================================================
   スカイシューター
   座標：横 LW=360、縦 LH（画面の縦横比で 560〜780）。地面は「進んだ距離 s」で下から上へ流れる
   ========================================================= */
const LW=360, TS=24, COLS=15, CH=16*TS; // タイルの大きさ・横の数・地面の絵をまとめて描く高さ
const SPEED=40;            // 地面が流れる速さ（px/秒）
const STAGE_LEN=2600;      // 1面の長さ（要塞まで、約65秒）
const NSTAGE=4;
const LV={1:{lives:5,bs:.7,fire:.55,rate:.7,cap:5},2:{lives:3,bs:1,fire:1,rate:1,cap:9},3:{lives:3,bs:1.25,fire:1.45,rate:1.25,cap:14}};
const REC={"shot":{"layers":[{"wave":"square","freq":1800,"freq_end":400,"dur":0.09,"vol":0.3,"attack":0.001,"filter":{"type":"lowpass","freq":5000}}]},"enemy_hit":{"layers":[{"wave":"square","freq":900,"freq_end":600,"dur":0.05,"vol":0.35,"attack":0.001},{"wave":"noise","dur":0.03,"vol":0.25,"filter":{"type":"highpass","freq":3000}}]},"enemy_down":{"layers":[{"wave":"noise","dur":0.35,"vol":0.6,"attack":0.001,"release":0.3,"filter":{"type":"lowpass","freq":1800}},{"wave":"square","freq":400,"freq_end":60,"dur":0.25,"vol":0.3,"filter":{"type":"lowpass","freq":2000}}]},"bomb_drop":{"layers":[{"wave":"sine","freq":2200,"freq_end":700,"dur":0.32,"vol":0.22,"attack":0.005,"release":0.1},{"wave":"noise","dur":0.12,"vol":0.15,"filter":{"type":"bandpass","freq":2500,"q":1.2}}]},"ground_boom":{"layers":[{"wave":"sine","freq":150,"freq_end":38,"dur":0.45,"vol":0.85,"attack":0.001,"release":0.35},{"wave":"noise","dur":0.5,"vol":0.55,"attack":0.001,"release":0.45,"filter":{"type":"lowpass","freq":1000}},{"wave":"square","freq":220,"freq_end":55,"dur":0.18,"vol":0.2,"filter":{"type":"lowpass","freq":900}}]},"player_down":{"layers":[{"wave":"square","notes":"B5 G5 E5 C5 A4 F4 D4 B3","step":0.07,"dur":0.08,"vol":0.3,"filter":{"type":"lowpass","freq":4000}},{"wave":"noise","start":0.5,"dur":0.6,"vol":0.4,"release":0.5,"filter":{"type":"lowpass","freq":1200}}]},"warning":{"layers":[{"wave":"square","freq":700,"freq_end":1000,"dur":0.45,"vol":0.3,"filter":{"type":"lowpass","freq":3000}},{"wave":"square","freq":700,"freq_end":1000,"start":0.55,"dur":0.45,"vol":0.3,"filter":{"type":"lowpass","freq":3000}},{"wave":"square","freq":700,"freq_end":1000,"start":1.1,"dur":0.45,"vol":0.3,"filter":{"type":"lowpass","freq":3000}}]},"oneup":{"layers":[{"wave":"square","notes":"E5 G5 E6 C6 D6 G6","step":0.09,"dur":0.09,"vol":0.28,"filter":{"type":"lowpass","freq":6000}}]},"shield":{"layers":[{"wave":"sine","freq":300,"freq_end":600,"dur":0.5,"vol":0.4,"attack":0.05,"release":0.3,"vibrato":{"rate":12,"depth":0.06}},{"wave":"triangle","freq":900,"freq_end":1800,"dur":0.4,"vol":0.12,"attack":0.05}]},"powerup":{"layers":[{"wave":"saw","freq":200,"freq_end":1600,"dur":0.6,"vol":0.25,"vibrato":{"rate":14,"depth":0.04},"filter":{"type":"lowpass","freq":4000}}]},"item":{"layers":[{"wave":"square","notes":"E6 G6 E7","step":0.05,"dur":0.06,"vol":0.25,"filter":{"type":"lowpass","freq":6000}}]},"start":{"layers":[{"wave":"triangle","notes":"G5 C6 G6","step":0.08,"dur":0.18,"vol":0.5}],"echo":{"delay":0.09,"feedback":0.3,"repeats":2}},"fanfare":{"layers":[{"wave":"square","notes":"G5 G5 G5","step":0.12,"dur":0.1,"vol":0.3,"filter":{"type":"lowpass","freq":4000}},{"wave":"square","freq":"C6","start":0.36,"dur":0.9,"vol":0.35,"release":0.6,"vibrato":{"rate":6,"depth":0.01},"filter":{"type":"lowpass","freq":4000}},{"wave":"triangle","notes":"E4 E4 E4","step":0.12,"dur":0.1,"vol":0.3},{"wave":"triangle","freq":"C4","start":0.36,"dur":0.9,"vol":0.35,"release":0.6},{"wave":"triangle","freq":"G4","start":0.36,"dur":0.9,"vol":0.25,"release":0.6}]},"gameover":{"layers":[{"wave":"triangle","notes":"G4 F#4 F4","step":0.28,"dur":0.28,"vol":0.5},{"wave":"triangle","freq":"E4","freq_end":"D4","start":0.84,"dur":0.9,"vol":0.5,"vibrato":{"rate":5,"depth":0.015}}]},"explosion":{"layers":[{"wave":"noise","dur":2.5,"vol":0.8,"attack":0.002,"release":2.2,"filter":{"type":"lowpass","freq":1200}},{"wave":"noise","dur":0.35,"vol":0.6,"attack":0.001,"release":0.3,"filter":{"type":"highpass","freq":2000}},{"wave":"sine","freq":120,"freq_end":28,"dur":1.4,"vol":0.9,"attack":0.002,"release":1.0},{"wave":"saw","freq":80,"freq_end":30,"dur":0.8,"vol":0.3,"filter":{"type":"lowpass","freq":400}},{"wave":"noise","start":0.875,"dur":0.02,"vol":0.184,"filter":{"type":"bandpass","freq":3889,"q":2}},{"wave":"noise","start":0.637,"dur":0.02,"vol":0.259,"filter":{"type":"bandpass","freq":4087,"q":2}},{"wave":"noise","start":1.158,"dur":0.02,"vol":0.141,"filter":{"type":"bandpass","freq":4895,"q":2}},{"wave":"noise","start":0.83,"dur":0.02,"vol":0.264,"filter":{"type":"bandpass","freq":2308,"q":2}},{"wave":"noise","start":0.676,"dur":0.02,"vol":0.252,"filter":{"type":"bandpass","freq":2532,"q":2}},{"wave":"noise","start":1.918,"dur":0.02,"vol":0.199,"filter":{"type":"bandpass","freq":2156,"q":2}},{"wave":"noise","start":0.68,"dur":0.02,"vol":0.183,"filter":{"type":"bandpass","freq":3829,"q":2}},{"wave":"noise","start":1.913,"dur":0.02,"vol":0.129,"filter":{"type":"bandpass","freq":2877,"q":2}},{"wave":"noise","start":0.662,"dur":0.02,"vol":0.295,"filter":{"type":"bandpass","freq":1997,"q":2}},{"wave":"noise","start":0.388,"dur":0.02,"vol":0.112,"filter":{"type":"bandpass","freq":2877,"q":2}},{"wave":"noise","start":1.827,"dur":0.02,"vol":0.277,"filter":{"type":"bandpass","freq":4065,"q":2}},{"wave":"noise","start":1.996,"dur":0.02,"vol":0.286,"filter":{"type":"bandpass","freq":2652,"q":2}},{"wave":"noise","start":0.615,"dur":0.02,"vol":0.287,"filter":{"type":"bandpass","freq":4112,"q":2}},{"wave":"noise","start":0.354,"dur":0.02,"vol":0.233,"filter":{"type":"bandpass","freq":2825,"q":2}},{"wave":"noise","start":0.936,"dur":0.02,"vol":0.166,"filter":{"type":"bandpass","freq":2092,"q":2}},{"wave":"noise","start":0.305,"dur":0.02,"vol":0.156,"filter":{"type":"bandpass","freq":2730,"q":2}},{"wave":"noise","start":1.924,"dur":0.02,"vol":0.125,"filter":{"type":"bandpass","freq":4875,"q":2}},{"wave":"noise","start":0.653,"dur":0.02,"vol":0.171,"filter":{"type":"bandpass","freq":4376,"q":2}},{"wave":"noise","start":1.697,"dur":0.02,"vol":0.186,"filter":{"type":"bandpass","freq":1672,"q":2}},{"wave":"noise","start":1.105,"dur":0.02,"vol":0.175,"filter":{"type":"bandpass","freq":4718,"q":2}},{"wave":"noise","start":0.628,"dur":0.02,"vol":0.173,"filter":{"type":"bandpass","freq":4639,"q":2}},{"wave":"noise","start":0.351,"dur":0.02,"vol":0.182,"filter":{"type":"bandpass","freq":4341,"q":2}},{"wave":"noise","start":1.603,"dur":0.02,"vol":0.108,"filter":{"type":"bandpass","freq":1622,"q":2}},{"wave":"noise","start":0.406,"dur":0.02,"vol":0.284,"filter":{"type":"bandpass","freq":2400,"q":2}},{"wave":"noise","start":1.57,"dur":0.02,"vol":0.28,"filter":{"type":"bandpass","freq":2687,"q":2}}],"echo":{"delay":0.18,"repeats":3}}};

function rng(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const dist2=(ax,ay,bx,by)=>(ax-bx)*(ax-bx)+(ay-by)*(ay-by);

/* ---------- 地形（面ごとに種から作る） ---------- */
// タイルの種類
const T_DEEP=0,T_SEA=1,T_SAND=2,T_GRASS=3,T_FOREST=4,T_ROCK=5,T_ROAD=6,T_METAL=7,T_PIT=8;
const LAND=t=>t!==T_DEEP&&t!==T_SEA&&t!==T_PIT;
const DRIVE=t=>t===T_SAND||t===T_GRASS||t===T_ROAD||t===T_METAL||t===T_ROCK;
const TCOL={0:[22,74,140],1:[40,112,180],2:[226,198,130],3:[110,176,84],4:[52,120,62],5:[150,136,118],6:[118,112,104],7:[132,142,156],8:[46,52,64]};
function makeMap(stage){
  const rows=Math.ceil((STAGE_LEN+1400)/TS), r=rng(9100+stage*131);
  // なめらかな乱数の山（値ノイズ）
  const G=8, gw=Math.ceil(COLS/G)+2, gh=Math.ceil(rows/G)+2, grid=[...Array(gw*gh)].map(()=>r());
  const g2=[...Array(gw*2*gh*2)].map(()=>r());
  const sm=u=>u*u*(3-2*u);
  const vn=(x,y,gr,w,sz)=>{ const gx=x/sz,gy=y/sz,ix=Math.floor(gx),iy=Math.floor(gy),fx=sm(gx-ix),fy=sm(gy-iy),A=(i,j)=>gr[(j)*w+(i)];
    return (A(ix,iy)*(1-fx)+A(ix+1,iy)*fx)*(1-fy)+(A(ix,iy+1)*(1-fx)+A(ix+1,iy+1)*fx)*fy; };
  const m=new Uint8Array(rows*COLS);
  for(let y=0;y<rows;y++){ const road=7+Math.sin(y/9+stage)*3.2+Math.sin(y/23)*1.6;
    for(let x=0;x<COLS;x++){ let v=vn(x,y,grid,gw,G)*.72+vn(x,y,g2,gw*2,G/2)*.28; let tt;
      if(stage===0){ tt=v>.64?(v>.72?T_FOREST:T_GRASS):v>.58?T_SAND:v>.38?T_SEA:T_DEEP; if(y<10) tt=v>.5?T_SAND:T_SEA; }
      else if(stage===1){ tt=v<.3?T_SEA:v<.36?T_SAND:v<.5?T_GRASS:T_FOREST; if(Math.abs(x-road)<1.1) tt=T_ROAD; }
      else if(stage===2){ tt=v<.22?T_SEA:v<.27?T_GRASS:v>.68?T_ROCK:T_SAND; if(Math.abs(x-road)<.9&&v>=.22) tt=T_ROAD; }
      else { tt=v<.24?T_PIT:T_METAL; if(Math.abs(x-road)<1.1) tt=T_ROAD; }
      m[y*COLS+x]=tt; } }
  return {rows,m,seed:9100+stage*131};
}
const tileAt=(map,x,my)=>{ const cx=Math.floor(x/TS),cy=Math.floor(my/TS); if(cx<0||cx>=COLS||cy<0||cy>=map.rows) return T_SEA; return map.m[cy*COLS+cx]; };

/* ---------- 音（sound-studio のレシピをその場で鳴らす。ファイル0） ---------- */
const BASE={C:-9,D:-7,E:-5,F:-4,G:-2,A:0,B:2};
function hz(n){ if(typeof n==="number") return n; let s=BASE[n[0].toUpperCase()],i=1; while(n[i]==="#"||n[i]==="b"){ s+=n[i]==="#"?1:-1; i++; } const o=n.length>i?parseInt(n.slice(i),10):4; return 440*Math.pow(2,(s+(o-4)*12)/12); }
function expand(r){ const out=[]; (r.layers||[]).forEach(L=>{ if(L.notes==null){ out.push(L); return; } const step=L.step??.1, ns=typeof L.notes==="string"?L.notes.split(/\s+/):L.notes;
  ns.forEach((n,i)=>{ if(n==="-"||n==="_"||n==="r") return; const o=Object.assign({},L,{start:(L.start||0)+i*step,dur:L.dur??step,freq:n}); delete o.notes; delete o.step; out.push(o); }); }); return out; }
let NB=null;
const SND={ bus:null,busA:null,last:{},
  out(a){ if(this.busA!==a||!this.bus){ const g=a.createGain(),cp=a.createDynamicsCompressor(); cp.threshold.value=-14; cp.ratio.value=4; cp.attack.value=.003; cp.release.value=.2; g.gain.value=.8; g.connect(cp); cp.connect(a.destination); this.bus=g; this.busA=a; } return this.bus; },
  play(name,vol=1,minGap=0){ if(!store.get("p_snd",true)) return; const r=REC[name]; if(!r) return; const a=ac(); if(!a) return;
    const T=a.currentTime; if(minGap&&this.last[name]&&T-this.last[name]<minGap) return; this.last[name]=T;
    try{ const t0=T+.01; let master=a.createGain(); master.gain.value=vol*Math.pow(10,(r.peak_db??-1)/20)*.9; master.connect(this.out(a));
      if(r.echo){ const e=r.echo,d=a.createDelay(2),fb=a.createGain(),bus=a.createGain(); d.delayTime.value=e.delay??.12; fb.gain.value=e.feedback??.35; bus.connect(master); bus.connect(d); d.connect(fb); fb.connect(d); d.connect(master); master=bus; }
      expand(r).forEach(L=>{ const st=t0+(L.start||0),dur=L.dur??.2,end=st+dur; let src;
        if((L.wave||"sine")==="noise"){ if(!NB||NB.sampleRate!==a.sampleRate){ NB=a.createBuffer(1,a.sampleRate*2,a.sampleRate); const d=NB.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; } src=a.createBufferSource(); src.buffer=NB; }
        else { src=a.createOscillator(); src.type={saw:"sawtooth"}[L.wave]||L.wave||"sine"; const f1=hz(L.freq??440),f2=L.freq_end!=null?hz(L.freq_end):f1; src.frequency.setValueAtTime(f1,st); if(f2!==f1) src.frequency.exponentialRampToValueAtTime(Math.max(1,f2),end);
          if(L.vibrato){ const lfo=a.createOscillator(),lg=a.createGain(); lfo.frequency.value=L.vibrato.rate??6; lg.gain.value=f1*(L.vibrato.depth??.02); lfo.connect(lg); lg.connect(src.frequency); lfo.start(st); lfo.stop(end); } }
        let node=src; if(L.filter){ const f=a.createBiquadFilter(); f.type=L.filter.type||"lowpass"; f.frequency.value=L.filter.freq??2000; f.Q.value=L.filter.q??.707; node.connect(f); node=f; }
        const gn=a.createGain(), v=(L.vol??.5)*((L.wave==="square"||L.wave==="saw")?.6:1), atk=L.attack??.005, rel=Math.min(L.release??dur*.8,dur);
        gn.gain.setValueAtTime(0,st); gn.gain.linearRampToValueAtTime(v,st+atk); gn.gain.setValueAtTime(v,Math.max(st+atk,end-rel)); gn.gain.exponentialRampToValueAtTime(.0001,end);
        node.connect(gn); gn.connect(master); src.start(st); src.stop(end+.02); }); }catch(e){} }
};

/* ---------- 絵（キャンバスに直接かく。すべてオリジナルの形） ---------- */
function drawShip(c,x,y,T,blink){ if(blink&&Math.floor(T/80)%2) return;
  c.save(); c.translate(x,y);
  // 炎
  const fl=6+Math.sin(T/30)*2.5; c.fillStyle="#FFB23F"; c.beginPath(); c.moveTo(-4,11); c.lineTo(0,11+fl); c.lineTo(4,11); c.fill();
  c.fillStyle="#2E6BFF"; c.beginPath(); c.moveTo(0,-4); c.lineTo(17,9); c.lineTo(15,13); c.lineTo(0,8); c.lineTo(-15,13); c.lineTo(-17,9); c.closePath(); c.fill();
  c.fillStyle="#F4F7FF"; c.beginPath(); c.moveTo(0,-17); c.quadraticCurveTo(6,-6,5,12); c.lineTo(-5,12); c.quadraticCurveTo(-6,-6,0,-17); c.fill();
  c.fillStyle="#FF7A3D"; c.beginPath(); c.ellipse(0,-5,2.6,5,0,0,7); c.fill();
  c.fillStyle="#2E6BFF"; c.fillRect(-7,6,3,7); c.fillRect(4,6,3,7);
  c.restore(); }
function shadow(c,x,y,rx,ry){ c.fillStyle="rgba(0,0,0,.22)"; c.beginPath(); c.ellipse(x+10,y+18,rx,ry,0,0,7); c.fill(); }

/* ---------- 面の中身（地上の的・空の敵の出し方） ---------- */
function placeGround(map,stage,lvRate){ const r=rng(map.seed+7), out=[]; let my=380;
  while(my<STAGE_LEN-120){ my+=105+r()*120/lvRate; const tries=8;
    for(let k=0;k<tries;k++){ const x=24+r()*(LW-48), tt=tileAt(map,x,my); const p=r();
      if(stage===0&&(tt===T_SEA||tt===T_DEEP)&&p<.3){ out.push({k:"boat",x,my,vx:(r()<.5?-1:1)*(12+r()*10),hp:1}); break; }
      if(!LAND(tt)) continue;
      let k2=p<.32?"turret":p<.62&&DRIVE(tt)?"tank":p<.82?"dome":"crate"; if(stage===3&&k2==="dome"&&r()<.5) k2="turret";
      const o={k:k2,x,my,hp:1}; if(k2==="tank") o.vx=(r()<.5?-1:1)*(10+r()*12); if(k2==="crate") o.give=r()<.65?"P":"S"; out.push(o); break; } }
  // 最後の要塞（地上）。まわりに砲台4つ、まん中にコア
  const fy=STAGE_LEN+110; out.push({k:"fort",x:LW/2,my:fy,hp:3});
  [[-82,-40],[82,-40],[-82,48],[82,48]].forEach(([dx,dy])=>out.push({k:"turret",x:LW/2+dx,my:fy-dy,hp:1,onFort:1}));
  return out; }

const SKY={
  s:Object.assign({lv:"2",bm:"ontouchstart" in window?"btn":"btn",from:0,bgm:"off"},store.get("p_sky",{})),
  st:null,rf:[],
  save(){ store.set("p_sky",this.s); },
  rec(){ return Object.assign({hi:{1:0,2:0,3:0},reach:0},store.get("p_sky_rec",{})); },
  init(){ this.pane=$('[data-pane="sky"]');
    this.rf.push(chips($("#skLvSel"),()=>this.s.lv,v=>{this.s.lv=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#skBmSel"),()=>this.s.bm,v=>{this.s.bm=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#skFromSel"),()=>this.s.from,v=>{this.s.from=+v;this.save()}));
    this.rf.push(chips($("#skBgSel"),()=>this.s.bgm,v=>{this.s.bgm=v;this.save()}));
    const stage=$("#skStage"), cv=$("#skCv");
    // 指でなぞった分だけ動かす（機体の上をさわらなくてよい）
    cv.addEventListener("pointerdown",e=>{ if(!this.st) return; e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(_){} this.drag={id:e.pointerId,x:e.clientX,y:e.clientY}; if(this.st.paused) this.pause(false); });
    cv.addEventListener("pointermove",e=>{ const d=this.drag; if(!this.st||!d||d.id!==e.pointerId) return; const z=this.z||1; this.st.mv.x+=(e.clientX-d.x)/z*1.25; this.st.mv.y+=(e.clientY-d.y)/z*1.25; d.x=e.clientX; d.y=e.clientY; });
    const up=e=>{ if(this.drag&&this.drag.id===e.pointerId) this.drag=null; }; cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
    const bb=$("#skBombBtn");
    bb.addEventListener("pointerdown",e=>{ e.preventDefault(); e.stopPropagation(); bb.classList.add("on"); this.bombReq=true; });
    const bu=()=>bb.classList.remove("on"); bb.addEventListener("pointerup",bu); bb.addEventListener("pointercancel",bu); bb.addEventListener("pointerleave",bu);
    $("#skExit").addEventListener("click",e=>{ e.stopPropagation(); if(this.st) this.pause(!this.st.paused); });
    $("#skResume").onclick=()=>this.pause(false);
    $("#skQuit").onclick=()=>this.quit();
    this.keys={};
    addEventListener("keydown",e=>{ if(!this.st||mode!=="sky") return; const k=e.key; this.keys[k]=true;
      if(k==="x"||k==="X"||k===" "||k==="b"){ this.bombReq=true; e.preventDefault(); }
      if(k==="Escape"||k==="p"){ this.pause(!this.st.paused); } if(k.startsWith("Arrow")) e.preventDefault(); });
    addEventListener("keyup",e=>{ this.keys[e.key]=false; });
    addEventListener("resize",()=>{ if(this.st) this.layout(); });
    document.addEventListener("visibilitychange",()=>{ if(document.hidden&&this.st) this.pause(true); });
    this.onPop=()=>{ if(this.st){ try{ history.pushState({sk:1},"",location.href); }catch(e){} this.pause(true); } };
    this.onUnload=e=>{ if(this.st){ e.preventDefault(); e.returnValue=""; } };
    this.refresh(); },
  refresh(){ const r=this.rec(), top=Math.min(NSTAGE-1,r.reach);
    $("#skFromSel").innerHTML=[...Array(NSTAGE).keys()].map(i=>`<button class="chip" data-val="${i}"${i>top?" disabled":""}>${esc(t("skStageN",{n:i+1}))}</button>`).join("");
    if(!(this.s.from>=0&&this.s.from<=top)) this.s.from=0;
    this.rf.forEach(f=>f());
    $("#skBmNote").innerHTML=t(this.s.bm==="auto"?"skBombAutoN":"skBombBtnN");
    $("#skRec").innerHTML=[1,2,3].map(l=>`<div><b>${r.hi[l]?r.hi[l].toLocaleString():"—"}</b><span>${esc(t("skLv"+l))}</span></div>`).join("")
      +`<div class="wide"><span>${esc(t("skBestSt"))}</span><b>${esc(t("skStageT",{n:r.reach+1,name:t("skSt"+(r.reach+1))}))}</b></div>`; },
  view(v){ this.pane.dataset.v=v; if(mode==="sky") this.dock(); },
  dock(){ if(mode!=="sky") return; if(this.pane.dataset.v==="setup") return setDock(`<button class="btn primary big" data-act="start"><i class="ic" data-ic="play"></i>${esc(t("start"))}</button>`); setDock(""); },
  act(a){ if(a==="start") this.start(); },
  lock(on){ const de=document.documentElement; de.classList.toggle("sklock",on);
    if(on&&!this.locked){ this.locked=true; try{ history.pushState({sk:1},"",location.href); }catch(e){} addEventListener("popstate",this.onPop); addEventListener("beforeunload",this.onUnload); }
    else if(!on&&this.locked){ this.locked=false; removeEventListener("popstate",this.onPop); removeEventListener("beforeunload",this.onUnload); try{ if(history.state&&history.state.sk) history.back(); }catch(e){} } },

  /* ---------- 音楽（自作BGM。最初はオフ） ---------- */
  async bgmOn(){ if(this.s.bgm!=="on"||!store.get("p_snd",true)) return; const a=ac(); if(!a) return;
    try{ if(!this.bgBuf||this.bgA!==a){ const res=await fetch(`snd/sky.mp3?v=${APP_VER}`); const ab=await res.arrayBuffer(); this.bgBuf=await new Promise((ok,ng)=>a.decodeAudioData(ab,ok,ng)); this.bgA=a; }
      if(!this.st) return; this.bgmOff(); const s=a.createBufferSource(),g=a.createGain(); s.buffer=this.bgBuf; s.loop=true; g.gain.value=.32; s.connect(g); g.connect(SND.out(a)); s.start(a.currentTime+.05); this.bg={s,g}; }catch(e){} },
  bgmOff(){ if(this.bg){ try{ this.bg.s.stop(); }catch(e){} this.bg=null; } },

  /* ---------- あそぶ ---------- */
  start(){ ac(); const L=LV[this.s.lv]||LV[2];
    this.st={lv:+this.s.lv,L,loop:0,stage:this.s.from,startStage:this.s.from,lives:L.lives,score:0,next1up:20000,air:0,gnd:0,pow:1,shield:false,mv:{x:0,y:0},paused:false,id:Math.random()};
    this.bombReq=false; this.view("play"); this.lock(true); $("#skBombBtn").hidden=this.s.bm==="auto"; $("#skPause").hidden=true;
    this.layout(); this.load(this.st.stage); SND.play("start"); this.bgmOn();
    cancelAnimationFrame(this.raf); let last=now(); const id=this.st.id;
    const f=()=>{ if(!this.st||this.st.id!==id) return; const T=now(); let rem=Math.min(70,T-last)/1000; last=T;
      // 描画が遅い端末でも同じ速さで進むよう、1/60秒ずつ細かく進める
      if(mode==="sky"&&!this.st.paused){ while(rem>0&&this.st&&!this.st.paused){ const d=Math.min(1/60,rem); this.update(d,T); rem-=d; } } if(this.st) this.render(T); this.raf=requestAnimationFrame(f); };
    this.raf=requestAnimationFrame(f); },
  layout(){ const r=$("#skStage").getBoundingClientRect(), W=r.width||360, H=r.height||640, dpr=Math.min(2,window.devicePixelRatio||1);
    this.LH=clamp(Math.round(LW*H/W),560,780); this.z=Math.min(W/LW,H/this.LH); this.ox=(W-LW*this.z)/2; this.oy=(H-this.LH*this.z)/2;
    const cv=$("#skCv"); cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); this.dpr=dpr; this.cx=cv.getContext("2d"); this.chunks={}; },
  load(n){ const st=this.st, LH=this.LH; st.stage=n; st.map=makeMap(n); st.s=0; st.t=0; st.gr=placeGround(st.map,n,st.L.rate); st.air=st.air||0;
    st.en=[]; st.eb=[]; st.pb=[]; st.bombs=[]; st.items=[]; st.fx=[]; st.scorch=[]; st.r=rng(777+n*31+st.loop*5);
    st.ship={x:LW/2,y:LH-110,inv:2.2,dead:0}; st.fireT=0; st.waveT=2.5; st.phase="play"; st.fort=null; st.banner={txt:t("skStageT",{n:n+1,name:t("skSt"+(n+1))}),t:2.4};
    this.chunks={}; },
  pause(on){ const st=this.st; if(!st) return; st.paused=on; $("#skPause").hidden=!on; if(on) this.bgmOff(); else { this.drag=null; this.bgmOn(); } },
  quit(){ cancelAnimationFrame(this.raf); this.bgmOff(); this.st=null; this.lock(false); this.view("setup"); this.refresh(); },
  diff(){ const st=this.st; return {bs:st.L.bs*(1+st.loop*.15),fire:st.L.fire*(1+st.loop*.2),rate:st.L.rate*(1+st.loop*.15)}; },
  sy(st,my){ return this.LH-(my-st.s); },          // 地面の位置 → 画面の y
  add(p){ const st=this.st, before=st.score; st.score+=p; if(st.score>=st.next1up){ st.next1up+=st.next1up<40000?30000:40000; st.lives++; SND.play("oneup"); this.flash(t("skExtend")); } },
  flash(txt){ this.st.msg={txt,t:1.4}; },
  boom(x,y,big,col){ const st=this.st; st.fx.push({k:"ring",x,y,t:0,d:big?.7:.38,r:big?46:18,col:col||"#FFD34D"});
    for(let i=0;i<(big?22:9);i++){ const a=Math.random()*7,v=(big?120:70)*(.4+Math.random()); st.fx.push({k:"spark",x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,d:.35+Math.random()*.35,col:i%3?"#FFB23F":"#FFF3C4"}); } },
  // 空の敵を出す（面と時間で種類を変える）
  wave(){ const st=this.st, r=st.r, D=this.diff(), LH=this.LH, p=r(), n=st.stage;
    const pick=p<.34?"drift":p<.58?"swoop":p<.78?"spin":p<.92-.04*n?"row":"heavy";
    if(pick==="drift"){ const k=3+Math.floor(r()*2), x0=40+r()*(LW-80); for(let i=0;i<k;i++) st.en.push({k:"drift",x:x0,y:-20-i*34,ph:i*.8,amp:40+r()*30,x0,vy:70+r()*20,hp:1,pt:100,t:0}); }
    else if(pick==="swoop"){ const side=r()<.5?-1:1; for(let i=0;i<4;i++) st.en.push({k:"swoop",x:LW/2+side*(60+i*26),y:-20-i*30,vx:0,vy:150,hp:1,pt:150,t:0,turn:LH*(.3+r()*.15),fired:false}); }
    else if(pick==="spin"){ const fromL=r()<.5, y0=60+r()*LH*.3; for(let i=0;i<5;i++) st.en.push({k:"spin",x:fromL?-20-i*30:LW+20+i*30,y:y0+i*8,vx:(fromL?1:-1)*(110+r()*30),vy:18,hp:1,pt:120,t:0}); }
    else if(pick==="row"){ const y0=-20; for(let i=0;i<5;i++) st.en.push({k:"drift",x:50+i*65,y:y0-(i%2)*20,ph:0,amp:0,x0:50+i*65,vy:60,hp:1,pt:100,t:0,shoot:r()<.35}); }
    else { st.en.push({k:"heavy",x:60+r()*(LW-120),y:-30,vy:32,hp:7,pt:600,t:0,fireT:1}); }
    st.waveT=(2.2+r()*1.6)/D.rate; },
  shootAt(x,y,spd,spread){ const st=this.st, sh=st.ship; if(st.eb.length>=st.L.cap+st.loop*2) return; const a=Math.atan2(sh.y-y,sh.x-x); (spread||[0]).forEach(o=>st.eb.push({x,y,vx:Math.cos(a+o)*spd,vy:Math.sin(a+o)*spd})); },
  update(dt,T){ const st=this.st, LH=this.LH, sh=st.ship, D=this.diff();
    st.t+=dt; if(st.banner) { st.banner.t-=dt; if(st.banner.t<=0) st.banner=null; } if(st.msg){ st.msg.t-=dt; if(st.msg.t<=0) st.msg=null; }
    // 地面を流す（要塞が止まる位置まで来たら止める）
    const fort=st.gr.find(o=>o.k==="fort"); const stopAt=fort?fort.my-(LH-210):1e9;
    if(st.phase==="play"&&st.s>=stopAt-1&&fort&&fort.hp>0){ st.phase="boss"; SND.play("warning"); this.flash(t("skWarn")); st.bossT=0; }
    if(st.phase!=="boss") st.s+=SPEED*dt; else { st.s=Math.min(st.s+SPEED*dt,stopAt); st.bossT+=dt; }
    // 自機
    if(sh.dead>0){ sh.dead-=dt; if(sh.dead<=0){ if(st.lives<=0) return this.over(); sh.x=LW/2; sh.y=LH-110; sh.inv=2.4; st.mv={x:0,y:0}; } }
    else { let mx=st.mv.x,my=st.mv.y; st.mv={x:0,y:0}; const k=this.keys, ks=230*dt;
      if(k.ArrowLeft||k.a) mx-=ks; if(k.ArrowRight||k.d) mx+=ks; if(k.ArrowUp||k.w) my-=ks; if(k.ArrowDown||k.s) my+=ks;
      sh.x=clamp(sh.x+mx,14,LW-14); sh.y=clamp(sh.y+my,150,LH-26); sh.inv=Math.max(0,sh.inv-dt);
      // 弾は自動で撃つ（パワーで本数がふえる）
      st.fireT-=dt; if(st.fireT<=0){ st.fireT=.13; const P=st.pow; const v=-520;
        if(P===1) st.pb.push({x:sh.x,y:sh.y-16,vx:0,vy:v});
        else if(P===2){ st.pb.push({x:sh.x-6,y:sh.y-14,vx:0,vy:v}); st.pb.push({x:sh.x+6,y:sh.y-14,vx:0,vy:v}); }
        else { st.pb.push({x:sh.x,y:sh.y-16,vx:0,vy:v}); st.pb.push({x:sh.x-7,y:sh.y-12,vx:-70,vy:v}); st.pb.push({x:sh.x+7,y:sh.y-12,vx:70,vy:v}); }
        SND.play("shot",.32,.12); }
      // 爆弾：照準（機体の少し前）の地面に落ちる。落ちている途中は次を落とせない
      const sightY=sh.y-118, target=this.groundUnder(sh.x,sightY);
      st.sightRed=!!target;
      const want=this.s.bm==="auto"?!!target:this.bombReq;
      if(want&&!st.bombs.length){ st.bombs.push({x0:sh.x,y0:sh.y,x:sh.x,my:st.s+(LH-sightY),t:0}); SND.play("bomb_drop",.8); }
    }
    this.bombReq=false;
    // 爆弾
    st.bombs=st.bombs.filter(b=>{ b.t+=dt; if(b.t<.5) return true; this.groundHit(b.x,b.my); return false; });
    // 自機の弾
    st.pb=st.pb.filter(b=>{ b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.y<-10||b.x<-10||b.x>LW+10) return false;
      for(const e of st.en){ if(e.hp>0&&dist2(b.x,b.y,e.x,e.y)<(e.k==="heavy"?22*22:14*14)){ e.hp--; if(e.hp<=0){ this.add(e.pt); st.air++; this.boom(e.x,e.y,e.k==="heavy"); SND.play("enemy_down",.7); if(e.k==="heavy") st.items.push({x:e.x,y:e.y,k:st.r()<.5?"P":"S"}); } else SND.play("enemy_hit",.6,.05); return false; } }
      return true; });
    // 空の敵
    if(st.phase==="play"||st.phase==="boss"){ st.waveT-=dt; if(st.waveT<=0&&st.t>2) this.wave(); }
    st.en.forEach(e=>{ e.t+=dt;
      if(e.k==="drift"){ e.y+=e.vy*dt; e.x=e.x0+Math.sin(e.t*2.2+e.ph)*e.amp; if(e.shoot&&!e.fired&&e.y>LH*.25){ e.fired=true; this.shootAt(e.x,e.y,150*D.bs); } }
      else if(e.k==="swoop"){ if(e.y<e.turn&&e.vy>0){ e.y+=e.vy*dt; } else { if(!e.fired){ e.fired=true; if(st.r()<.6*D.fire) this.shootAt(e.x,e.y,160*D.bs); e.vx=(sh.x>e.x?1:-1)*90; } e.vy=Math.max(-190,e.vy-420*dt); e.y+=e.vy*dt; e.x+=e.vx*dt; } }
      else if(e.k==="spin"){ e.x+=e.vx*dt; e.y+=e.vy*dt; }
      else if(e.k==="heavy"){ e.y+=e.vy*dt; if(e.y>LH*.35) e.vy=Math.max(8,e.vy-10*dt); e.fireT-=dt*D.fire; if(e.fireT<=0&&e.y>20){ e.fireT=1.7; this.shootAt(e.x,e.y+16,130*D.bs,[-.28,0,.28]); } }
      if(sh.dead<=0&&sh.inv<=0&&e.hp>0&&dist2(e.x,e.y,sh.x,sh.y)<(e.k==="heavy"?26*26:15*15)){ if(e.k!=="heavy"){ e.hp=0; this.boom(e.x,e.y); } this.hurt(); } });
    st.en=st.en.filter(e=>e.hp>0&&e.y<LH+40&&e.y>-260&&e.x>-90&&e.x<LW+90);
    // 地上の的
    st.gr.forEach(o=>{ if(o.hp<=0) return; const y=this.sy(st,o.my); if(y<-80||y>LH+60) return;
      if((o.k==="tank"||o.k==="boat")&&y>-20){ const nx=o.x+o.vx*dt, tt=tileAt(st.map,nx,o.my); const ok=o.k==="boat"?(tt===T_SEA||tt===T_DEEP):DRIVE(tt); if(ok&&nx>14&&nx<LW-14) o.x=nx; else o.vx=-o.vx; }
      if(o.k==="turret"||o.k==="tank"||o.k==="boat"){ o.ft=(o.ft==null?.8+st.r()*1.6:o.ft)-dt*D.fire;
        if(o.ft<=0){ o.ft=(o.onFort?1.6:2.6)+st.r()*1.2; if(y>40&&y<LH*.62&&sh.dead<=0&&Math.abs(y-sh.y)>70) this.shootAt(o.x,y,(o.onFort?140:115)*D.bs,o.onFort&&st.r()<.4?[-.2,.2]:[0]); } } });
    // 敵の弾
    st.eb=st.eb.filter(b=>{ b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.y<-10||b.y>LH+10||b.x<-10||b.x>LW+10) return false;
      if(sh.dead<=0&&sh.inv<=0&&dist2(b.x,b.y,sh.x,sh.y)<6.5*6.5){ this.hurt(); return false; } return true; });
    // アイテム
    st.items=st.items.filter(it=>{ it.y+=38*dt; if(it.y>LH+20) return false;
      if(sh.dead<=0&&dist2(it.x,it.y,sh.x,sh.y)<22*22){ if(it.k==="P"){ if(st.pow<3) st.pow++; else this.add(1000); SND.play("powerup",.8); this.flash(t("skPower")); } else { st.shield=true; SND.play("shield"); this.flash(t("skShield")); } return false; } return true; });
    // 演出
    st.fx=st.fx.filter(f=>{ f.t+=dt; if(f.k==="spark"){ f.x+=f.vx*dt; f.y+=f.vy*dt; } return f.t<f.d; });
    if(st.shake) st.shake=Math.max(0,st.shake-dt*30);
    // 要塞をこわしたら、少し待って次の面へ
    if(st.phase==="clear"){ st.clearT-=dt; if(st.clearT<=0) this.nextStage(); }
    // 要塞をこわせないまま長くたったら、要塞は通りすぎる（スクロール再開）
    if(st.phase==="boss"&&st.bossT>45){ st.phase="pass"; }
    if(st.phase==="pass"&&st.s>stopAt+LH+60){ this.nextStage(true); }
  },
  groundUnder(x,y){ const st=this.st; for(const o of st.gr){ if(o.hp<=0) continue; const oy=this.sy(st,o.my), r=o.k==="fort"?20:17; if(dist2(o.x,oy,x,y)<r*r) return o; } return null; },
  groundHit(x,my){ const st=this.st, y=this.sy(st,my); let any=false;
    st.gr.forEach(o=>{ if(o.hp<=0) return; const oy=this.sy(st,o.my), r=o.k==="fort"?22:20; if(dist2(o.x,oy,x,y)>r*r) return;
      o.hp--; any=true;
      if(o.k==="fort"){ if(o.hp>0){ this.boom(o.x,oy,false,"#FF6B6B"); SND.play("enemy_hit",.9); st.shake=4; return; }
        this.add(5000); this.boom(o.x,oy,true); this.boom(o.x-40,oy+20,true); this.boom(o.x+40,oy-20,true); st.shake=10; SND.play("explosion");
        st.gr.forEach(q=>{ if(q.onFort&&q.hp>0){ q.hp=0; this.boom(q.x,this.sy(st,q.my)); } });
        st.phase="clear"; st.clearT=3.2; st.banner={txt:t("skClear",{n:st.stage+1}),t:3}; st.gnd++; return; }
      if(o.hp<=0){ st.gnd++; this.add({turret:300,tank:400,boat:350,dome:200,crate:100}[o.k]||100); st.scorch.push({x:o.x,my:o.my});
        if(o.k==="crate") st.items.push({x:o.x,y:oy,k:o.give}); } });
    if(!any) st.scorch.push({x,my,small:1});
    this.boom(x,y,false,"#FF9A3D"); SND.play("ground_boom",.8); st.shake=Math.max(st.shake||0,any?5:2);
    if(st.scorch.length>60) st.scorch.shift(); },
  hurt(){ const st=this.st, sh=st.ship;
    if(st.shield){ st.shield=false; sh.inv=1.2; SND.play("enemy_hit"); return; }
    st.lives--; sh.dead=1.6; st.pow=Math.max(1,st.pow-1); this.boom(sh.x,sh.y,true,"#9FD3FF"); SND.play("player_down"); st.shake=8;
    try{ navigator.vibrate&&navigator.vibrate(150); }catch(e){} st.eb=[]; },
  nextStage(passed){ const st=this.st; if(!passed) this.add(2000);
    const r=this.rec(); const reached=Math.min(NSTAGE-1,st.stage+1); if(reached>r.reach){ r.reach=reached; store.set("p_sky_rec",r); }
    if(st.stage+1>=NSTAGE){ st.loop++; SND.play("fanfare"); this.load(0); st.banner={txt:t("skAll"),t:3}; return; }
    SND.play("fanfare",.8); this.load(st.stage+1); },
  over(){ const st=this.st; SND.play("gameover"); this.bgmOff();
    const r=this.rec(), lv=st.lv, best=st.score>(r.hi[lv]||0); if(best){ r.hi[lv]=st.score; } if(st.stage>r.reach) r.reach=Math.min(NSTAGE-1,st.stage); store.set("p_sky_rec",r);
    const stg=t("skStageN",{n:st.stage+1})+(st.loop?` ×${st.loop+1}`:"");
    const keep=st; cancelAnimationFrame(this.raf); this.st=null; this.lock(false); this.view("setup"); this.refresh();
    showResult({title:t("skOver"),big:keep.score.toLocaleString(),bigLbl:t("skScore"),isBest:best&&keep.score>0,
      stats:[[t("skReach"),stg],[t("skAir"),String(keep.air)],[t("skGround"),String(keep.gnd)]],
      retry:()=>this.start(),close:()=>this.refresh()}); },

  /* ---------- 描く ---------- */
  chunk(st,i){ const key=st.stage+":"+i; if(this.chunks[key]) return this.chunks[key];
    const z=this.z*this.dpr, cv=document.createElement("canvas"); cv.width=Math.ceil(LW*z); cv.height=Math.ceil(CH*z);
    const c=cv.getContext("2d"); c.setTransform(z,0,0,z,0,0); const map=st.map, r=rng(map.seed*7+i*13);
    const y0=i*CH; // この絵の下の端の地面の位置（下が y0、上が y0+CH）
    for(let row=0;row<CH/TS;row++){ const my=y0+row*TS, cy=Math.floor(my/TS); if(cy>=map.rows) break;
      for(let cx=0;cx<COLS;cx++){ const tt=map.m[cy*COLS+cx], col=TCOL[tt], j=(r()-.5)*10, px=cx*TS, py=CH-(row+1)*TS;
        c.fillStyle=`rgb(${col[0]+j|0},${col[1]+j|0},${col[2]+j|0})`; c.fillRect(px,py,TS+.6,TS+.6);
        if(tt===T_FOREST){ c.fillStyle="rgba(20,70,34,.7)"; for(let k=0;k<3;k++){ c.beginPath(); c.arc(px+4+r()*16,py+4+r()*16,4+r()*4,0,7); c.fill(); } }
        else if(tt===T_GRASS&&r()<.3){ c.fillStyle="rgba(60,120,50,.5)"; c.beginPath(); c.arc(px+r()*TS,py+r()*TS,3,0,7); c.fill(); }
        else if((tt===T_SEA||tt===T_DEEP)&&r()<.35){ c.strokeStyle="rgba(255,255,255,.28)"; c.lineWidth=1.4; const wx=px+r()*14,wy=py+r()*20; c.beginPath(); c.moveTo(wx,wy); c.quadraticCurveTo(wx+4,wy-3,wx+8,wy); c.stroke(); }
        else if(tt===T_ROCK){ c.fillStyle="rgba(90,78,66,.7)"; c.beginPath(); c.moveTo(px+3,py+20); c.lineTo(px+10,py+5); c.lineTo(px+20,py+19); c.fill(); }
        else if(tt===T_SAND&&r()<.25){ c.fillStyle="rgba(180,150,90,.5)"; c.fillRect(px+r()*20,py+r()*20,3,2); }
        else if(tt===T_ROAD){ c.fillStyle="rgba(255,255,255,.35)"; c.fillRect(px+TS/2-1,py+4,2,9); }
        else if(tt===T_METAL){ c.strokeStyle="rgba(60,68,80,.45)"; c.lineWidth=1; c.strokeRect(px+.5,py+.5,TS-1,TS-1); c.fillStyle="rgba(60,68,80,.5)"; c.fillRect(px+3,py+3,2,2); c.fillRect(px+TS-5,py+TS-5,2,2); }
        else if(tt===T_PIT){ c.fillStyle="rgba(255,200,60,.08)"; c.fillRect(px,py+TS-3,TS,3); } } }
    return this.chunks[key]=cv; },
  render(T){ const st=this.st, c=this.cx, LH=this.LH, z=this.z*this.dpr, sh=st.ship;
    c.setTransform(1,0,0,1,0,0); c.fillStyle="#0B1226"; c.fillRect(0,0,c.canvas.width,c.canvas.height);
    const shk=st.shake?(Math.random()-.5)*st.shake:0, shk2=st.shake?(Math.random()-.5)*st.shake:0;
    c.setTransform(z,0,0,z,this.ox*this.dpr+shk*z,this.oy*this.dpr+shk2*z);
    c.save(); c.beginPath(); c.rect(0,0,LW,LH); c.clip();
    // 地面（下から上へ）
    const i0=Math.floor(st.s/CH), i1=Math.floor((st.s+LH)/CH);
    for(let i=i0;i<=i1;i++){ const cv=this.chunk(st,i), top=LH-((i+1)*CH-st.s); c.drawImage(cv,0,top-.5,LW,CH+1); }
    for(const k in this.chunks){ const [sg,ci]=k.split(":").map(Number); if(sg!==st.stage||ci<i0-1) delete this.chunks[k]; }
    // こげあと
    st.scorch.forEach(q=>{ const y=this.sy(st,q.my); if(y<-20||y>LH+20) return; c.fillStyle="rgba(30,20,10,.38)"; c.beginPath(); c.ellipse(q.x,y,q.small?7:12,q.small?5:9,0,0,7); c.fill(); });
    // 地上の的
    st.gr.forEach(o=>{ const y=this.sy(st,o.my); if(y<-90||y>LH+70) return; this.drawGround(c,o,o.x,y,T); });
    // 爆弾（落ちながら小さくなる）
    st.bombs.forEach(b=>{ const u=b.t/.5, ty=this.sy(st,b.my), x=b.x0+(b.x-b.x0)*u, y=b.y0+(ty-b.y0)*u, s=4.5*(1-u*.45);
      c.fillStyle="#2A2A2A"; c.beginPath(); c.arc(x,y,s,0,7); c.fill(); c.fillStyle="#FF5C3C"; c.beginPath(); c.arc(x,y,s*.45,0,7); c.fill(); });
    // アイテム
    st.items.forEach(it=>{ const p=1+Math.sin(T/120)*.08; c.save(); c.translate(it.x,it.y); c.scale(p,p);
      c.fillStyle=it.k==="P"?"#FF7A3D":"#3DC8FF"; c.beginPath(); c.arc(0,0,11,0,7); c.fill(); c.strokeStyle="#fff"; c.lineWidth=2; c.stroke();
      c.fillStyle="#fff"; c.font="700 13px Fredoka, sans-serif"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(it.k,0,1); c.restore(); });
    // 空のものの影 → 本体
    st.en.forEach(e=>shadow(c,e.x,e.y,e.k==="heavy"?18:9,e.k==="heavy"?8:4));
    if(sh.dead<=0) shadow(c,sh.x,sh.y,12,5);
    st.en.forEach(e=>this.drawAir(c,e,T));
    c.fillStyle="#FFF6B0"; st.pb.forEach(b=>{ c.fillRect(b.x-1.5,b.y-7,3,12); });
    st.eb.forEach(b=>{ c.fillStyle="#FF4D6D"; c.beginPath(); c.arc(b.x,b.y,4,0,7); c.fill(); c.fillStyle="#FFE3EA"; c.beginPath(); c.arc(b.x,b.y,1.8,0,7); c.fill(); });
    if(sh.dead<=0){ drawShip(c,sh.x,sh.y,T,sh.inv>0);
      if(st.shield){ c.strokeStyle=`rgba(120,220,255,${.55+Math.sin(T/90)*.25})`; c.lineWidth=2.5; c.beginPath(); c.arc(sh.x,sh.y,22,0,7); c.stroke(); }
      // 照準
      const sy=sh.y-118, red=st.sightRed; c.strokeStyle=red?"#FF3B3B":"rgba(255,255,255,.85)"; c.lineWidth=2;
      c.beginPath(); c.arc(sh.x,sy,9,0,7); c.moveTo(sh.x-15,sy); c.lineTo(sh.x-5,sy); c.moveTo(sh.x+5,sy); c.lineTo(sh.x+15,sy); c.moveTo(sh.x,sy-15); c.lineTo(sh.x,sy-5); c.moveTo(sh.x,sy+5); c.lineTo(sh.x,sy+15); c.stroke(); }
    // 爆発
    st.fx.forEach(f=>{ const u=f.t/f.d; if(f.k==="ring"){ c.globalAlpha=1-u; c.fillStyle=f.col; c.beginPath(); c.arc(f.x,f.y,f.r*(.3+u*.7),0,7); c.fill(); c.globalAlpha=(1-u)*.8; c.fillStyle="#fff"; c.beginPath(); c.arc(f.x,f.y,f.r*.35*(1-u),0,7); c.fill(); c.globalAlpha=1; }
      else { c.globalAlpha=1-u; c.fillStyle=f.col; c.fillRect(f.x-1.5,f.y-1.5,3,3); c.globalAlpha=1; } });
    c.restore();
    // 上の表示（スコア・残り・パワー）
    c.fillStyle="rgba(8,14,32,.42)"; c.fillRect(0,0,LW,44);
    c.fillStyle="#fff"; c.textBaseline="middle"; c.font="700 17px Fredoka, sans-serif"; c.textAlign="right"; c.fillText(st.score.toLocaleString(),LW-12,16);
    c.font="600 11px Fredoka, sans-serif"; c.fillStyle="rgba(255,255,255,.7)"; c.fillText(t("skStageN",{n:st.stage+1})+(st.loop?` ×${st.loop+1}`:""),LW-12,34);
    c.textAlign="left"; for(let i=0;i<Math.min(st.lives,6);i++){ c.save(); c.translate(64+i*17,22); c.scale(.42,.42); drawShip(c,0,0,0,false); c.restore(); }
    c.fillStyle="#FFB23F"; c.font="700 11px Fredoka, sans-serif"; c.fillText("P"+st.pow+(st.shield?" S":""),64+Math.min(st.lives,6)*17+4,22);
    // 文字のお知らせ
    const big=(txt,y,a)=>{ c.globalAlpha=a; c.textAlign="center"; c.font="800 24px 'M PLUS Rounded 1c', Fredoka, sans-serif"; c.lineWidth=5; c.strokeStyle="rgba(8,14,32,.8)"; c.strokeText(txt,LW/2,y); c.fillStyle="#fff"; c.fillText(txt,LW/2,y); c.globalAlpha=1; };
    if(st.banner) big(st.banner.txt,LH*.38,Math.min(1,st.banner.t*1.5));
    if(st.msg){ c.globalAlpha=Math.min(1,st.msg.t*2); c.textAlign="center"; c.font="800 17px 'M PLUS Rounded 1c', Fredoka, sans-serif"; c.lineWidth=4; c.strokeStyle="rgba(8,14,32,.8)"; c.strokeText(st.msg.txt,LW/2,LH*.47); c.fillStyle="#FFE07A"; c.fillText(st.msg.txt,LW/2,LH*.47); c.globalAlpha=1; }
    if(st.paused) c.setTransform(1,0,0,1,0,0);
  },
  drawGround(c,o,x,y,T){ const st=this.st, sh=st.ship;
    if(o.hp<=0&&o.k!=="fort") return;
    c.save(); c.translate(x,y);
    if(o.k==="fort"){ // 地上の大きな要塞（八角形の台＋まん中のコア）
      c.fillStyle="rgba(0,0,0,.25)"; this.oct(c,6,8,92); c.fill();
      c.fillStyle=o.hp>0?"#5E6878":"#3A3F48"; this.oct(c,0,0,92); c.fill(); c.strokeStyle="#9AA6B8"; c.lineWidth=3; this.oct(c,0,0,92); c.stroke();
      c.fillStyle=o.hp>0?"#7D889A":"#4A505A"; this.oct(c,0,0,60); c.fill();
      c.strokeStyle="rgba(255,255,255,.2)"; c.lineWidth=2; for(let k=0;k<4;k++){ c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(k*Math.PI/2+.785)*88,Math.sin(k*Math.PI/2+.785)*88); c.stroke(); }
      if(o.hp>0){ const p=.6+.4*Math.sin(T/(o.hp===1?70:160)); c.fillStyle="#2A2F38"; c.beginPath(); c.arc(0,0,20,0,7); c.fill();
        c.fillStyle=`rgba(255,${70+o.hp*30},70,${p})`; c.beginPath(); c.arc(0,0,13,0,7); c.fill();
        c.fillStyle="#fff"; for(let k=0;k<o.hp;k++){ c.beginPath(); c.arc(-8+k*8,30,2.6,0,7); c.fill(); } }
      c.restore(); return; }
    if(o.k==="turret"){ c.fillStyle="#6B7280"; c.fillRect(-11,-11,22,22); c.fillStyle="#9CA3AF"; c.fillRect(-11,-11,22,4);
      const a=Math.atan2(sh.y-y,sh.x-x); c.fillStyle="#374151"; c.beginPath(); c.arc(0,0,7,0,7); c.fill(); c.strokeStyle="#1F2937"; c.lineWidth=4; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(a)*13,Math.sin(a)*13); c.stroke(); }
    else if(o.k==="tank"){ c.rotate(o.vx>0?0:Math.PI); c.fillStyle="#3F4A2A"; c.fillRect(-12,-10,24,4); c.fillRect(-12,6,24,4); c.fillStyle="#7A8A4A"; c.fillRect(-10,-7,20,14);
      c.fillStyle="#5D6B37"; c.beginPath(); c.arc(0,0,5.5,0,7); c.fill(); c.strokeStyle="#3F4A2A"; c.lineWidth=3; c.beginPath(); c.moveTo(0,0); c.lineTo(12,0); c.stroke(); }
    else if(o.k==="boat"){ c.rotate(o.vx>0?0:Math.PI); c.fillStyle="rgba(255,255,255,.35)"; c.beginPath(); c.moveTo(-18,-5); c.lineTo(-26,0); c.lineTo(-18,5); c.fill();
      c.fillStyle="#E8E2D4"; c.beginPath(); c.moveTo(-14,-6); c.lineTo(10,-6); c.lineTo(16,0); c.lineTo(10,6); c.lineTo(-14,6); c.fill(); c.fillStyle="#4B5563"; c.fillRect(-6,-3.5,9,7); }
    else if(o.k==="dome"){ c.fillStyle="#D9DEE6"; c.beginPath(); c.arc(0,0,11,0,7); c.fill(); c.strokeStyle="#8B95A5"; c.lineWidth=1.5; c.stroke();
      const a=T/500; c.strokeStyle="#4B5563"; c.lineWidth=2.5; c.beginPath(); c.moveTo(Math.cos(a)*-8,Math.sin(a)*-8); c.lineTo(Math.cos(a)*8,Math.sin(a)*8); c.stroke(); }
    else if(o.k==="crate"){ c.fillStyle="#B7793A"; c.fillRect(-10,-10,20,20); c.strokeStyle="#7A4E22"; c.lineWidth=2; c.strokeRect(-10,-10,20,20); c.beginPath(); c.moveTo(-10,-10); c.lineTo(10,10); c.moveTo(10,-10); c.lineTo(-10,10); c.stroke(); }
    c.restore(); },
  oct(c,x,y,r){ c.beginPath(); for(let k=0;k<8;k++){ const a=k*Math.PI/4+Math.PI/8; c[k?"lineTo":"moveTo"](x+Math.cos(a)*r,y+Math.sin(a)*r); } c.closePath(); },
  drawAir(c,e,T){ c.save(); c.translate(e.x,e.y);
    if(e.k==="drift"){ c.fillStyle="#9B5CF6"; c.beginPath(); c.ellipse(0,2,14,6,0,0,7); c.fill(); c.fillStyle="#E9DDFF"; c.beginPath(); c.arc(0,-1,6.5,Math.PI,0); c.fill();
      c.fillStyle="#FFE07A"; for(let k=-1;k<=1;k++){ c.beginPath(); c.arc(k*8,3,1.6,0,7); c.fill(); } }
    else if(e.k==="swoop"){ c.rotate(Math.atan2(e.vy,e.vx)-Math.PI/2); c.fillStyle="#FF4D4D"; c.beginPath(); c.moveTo(0,13); c.lineTo(11,-9); c.lineTo(0,-4); c.lineTo(-11,-9); c.closePath(); c.fill(); c.fillStyle="#FFD1D1"; c.beginPath(); c.arc(0,2,3,0,7); c.fill(); }
    else if(e.k==="spin"){ c.rotate(T/90); c.fillStyle="#FFC83D"; c.beginPath(); for(let k=0;k<8;k++){ const r=k%2?5:13, a=k*Math.PI/4; c[k?"lineTo":"moveTo"](Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); c.fill(); c.fillStyle="#B45309"; c.beginPath(); c.arc(0,0,3,0,7); c.fill(); }
    else if(e.k==="heavy"){ c.fillStyle="#1F9D6B"; this.oct(c,0,0,22); c.fill(); c.fillStyle="#0E6B47"; c.fillRect(-28,-4,56,8);
      c.fillStyle=e.hp<3?"#FF6B6B":"#C6F6E2"; c.beginPath(); c.arc(0,0,8,0,7); c.fill(); }
    c.restore(); }
};
return SKY;
});
