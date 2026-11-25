// 45 Play ゲーム：kart（ミニカートGP）。開いたときだけ読み込まれる。共通の関数は index.html にある
// 後ろから見る疑似3Dのカートレース（地面の平面を奥へ伸ばして描く方式）。コース・車・アイテムはすべてオリジナル
BRAIN.def("kart",`
<section data-pane="kart" data-v="setup">
  <div class="vw" data-v="setup">
    <div class="panel">
      <h2 data-i="ktTitle"></h2>
      <p class="lead" data-i="ktLead"></p>
      <div class="opt"><span class="ol" data-i="ktCourse"></span><div class="chips" id="ktCsSel">
        <button class="chip" data-val="0" data-i="ktC1"></button><button class="chip" data-val="1" data-i="ktC2"></button><button class="chip" data-val="2" data-i="ktC3"></button></div></div>
      <div class="opt"><span class="ol" data-i="ktCls"></span><div class="chips" id="ktClSel">
        <button class="chip" data-val="1" data-i="ktCl1"></button><button class="chip" data-val="2" data-i="ktCl2"></button><button class="chip" data-val="3" data-i="ktCl3"></button></div></div>
      <div class="opt"><span class="ol" data-i="ktCtl"></span><div class="chips" id="ktCtSel">
        <button class="chip" data-val="btn" data-i="ktBtn"></button><button class="chip" data-val="tilt" data-i="ktTilt"></button></div></div>
      <p class="lead" style="margin-top:0" id="ktCtNote"></p>
      <div class="opt"><span class="ol" data-i="ktBgm"></span><div class="chips" id="ktBgSel">
        <button class="chip" data-val="off" data-i="ktOff"></button><button class="chip" data-val="on" data-i="ktOn"></button></div></div>
    </div>
    <div class="panel">
      <h2 data-i="recTitle"></h2>
      <p class="lead" style="margin:0 0 8px;font-size:12px" id="ktRecNote"></p>
      <div class="ktrec" id="ktRec"></div>
    </div>
  </div>
  <div class="vw" data-v="play">
    <div class="ktstage" id="ktStage">
      <canvas id="ktCv"></canvas>
      <button class="ktb ktx" id="ktExit" type="button" aria-label="pause"><i class="ic" data-ic="x"></i></button>
      <button class="ktb ktl" id="ktL" type="button" aria-label="left">◀</button>
      <button class="ktb ktr" id="ktR" type="button" aria-label="right">▶</button>
      <button class="ktb ktd" id="ktD" type="button"><span data-i="ktDrift"></span></button>
      <button class="ktb kti" id="ktI" type="button"><span data-i="ktItem"></span></button>
      <div class="ktpause" id="ktPause" hidden>
        <b data-i="ktPause"></b>
        <button class="btn primary big" id="ktResume"><i class="ic" data-ic="play"></i><span data-i="ktResume"></span></button>
        <button class="btn" id="ktQuit"><i class="ic" data-ic="x"></i><span data-i="ktQuit"></span></button>
      </div>
    </div>
  </div>
</section>
<style>
html.ktlock,html.ktlock body{overscroll-behavior:none;overflow:hidden;touch-action:none}
.ktstage{position:fixed;inset:0;z-index:90;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;overflow:hidden;background:#000}
.ktstage canvas{display:block;width:100%;height:100%}
.ktb{position:absolute;border:0;display:flex;align-items:center;justify-content:center;touch-action:none;-webkit-tap-highlight-color:transparent;z-index:2;font-weight:800;color:#fff}
.ktb[hidden]{display:none}
.ktx{left:max(10px,env(safe-area-inset-left,0px));top:calc(env(safe-area-inset-top,0px) + 10px);width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.82);color:#14213D}
.ktx .ic{width:20px;height:20px}
.ktl,.ktr{bottom:calc(env(safe-area-inset-bottom,0px) + 20px);width:76px;height:76px;border-radius:50%;background:rgba(20,33,61,.55);font-size:28px;box-shadow:0 0 0 3px rgba(255,255,255,.35)}
.ktl{left:max(14px,env(safe-area-inset-left,0px))}
.ktr{left:calc(max(14px,env(safe-area-inset-left,0px)) + 88px)}
.ktd{right:max(14px,env(safe-area-inset-right,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 20px);width:86px;height:86px;border-radius:50%;background:rgba(255,122,61,.85);font-size:14px;box-shadow:0 0 0 3px rgba(255,255,255,.4)}
.kti{right:calc(max(14px,env(safe-area-inset-right,0px)) + 96px);bottom:calc(env(safe-area-inset-bottom,0px) + 34px);width:64px;height:64px;border-radius:50%;background:rgba(61,123,255,.85);font-size:12px;box-shadow:0 0 0 3px rgba(255,255,255,.4)}
.ktb.on{filter:brightness(1.25);transform:scale(.94)}
.ktpause{position:absolute;inset:0;background:rgba(8,14,32,.72);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;z-index:3;color:#fff}
.ktpause[hidden]{display:none}
.ktpause b{font-size:24px;margin-bottom:6px}
.ktpause .btn{min-width:190px;justify-content:center}
.ktrec{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.ktrec div{background:var(--bg);border-radius:12px;padding:8px 4px;text-align:center}
.ktrec b{display:block;font:700 17px Fredoka,sans-serif}.ktrec span{display:block;font-size:11px;color:var(--muted)}
</style>`,function(){
/* =========================================================
   ミニカートGP
   世界の広さ 2048×2048（地面の絵は 1024×1024 で、1マス＝2単位）。コースは中心線（なめらかな閉じた線）＋はば TW
   ========================================================= */
const WORLD=2048, MS=1024, TW=120, NK=8, LAPS=3;
const CLS={1:{v:190,acc:1.0,turn:2.1},2:{v:235,acc:1.05,turn:2.25},3:{v:280,acc:1.1,turn:2.4}};
const COLS=["#FF7A1A","#2E6BFF","#22B35E","#F2C230","#9B5CF6","#FF5C9A","#19B8C8","#EDEDED"];
const COURSES=[
  {pts:[[400,1600],[380,760],[560,430],[1000,380],[1300,600],[1650,430],[1830,700],[1720,1100],[1400,1260],[1660,1500],[1500,1760],[900,1760],[560,1820]],
   theme:"day",ground:[104,170,80],off:[92,150,70],asph:[96,99,108],sky:["#6EC1FF","#CFEFFF"],hill:"#4E9A52",plates:[.06,.58],boxes:[.2,.47,.79]},
  {pts:[[300,1000],[340,520],[700,300],[1120,430],[1000,800],[1360,960],[1760,700],[1860,1160],[1600,1620],[1150,1500],[900,1820],[480,1700]],
   theme:"sea",ground:[230,206,140],off:[46,128,196],asph:[110,108,112],sky:["#FF9F6B","#FFE2B8"],hill:"#C9735A",plates:[.12,.66],boxes:[.25,.52,.8]},
  {pts:[[420,420],[1100,380],[1160,800],[1600,820],[1660,420],[1860,620],[1820,1600],[1300,1660],[1250,1250],[800,1250],[760,1660],[360,1620]],
   theme:"night",ground:[40,44,58],off:[30,32,42],asph:[70,72,86],sky:["#0B1030","#2A2F6A"],hill:"#141833",plates:[.04,.7],boxes:[.18,.5,.8]}
];
const REC={"race_count":{"layers":[{"wave":"sine","notes":"A4 A4 A4","step":1.0,"dur":0.35,"vol":0.5,"release":0.25},{"wave":"triangle","notes":"A5 A5 A5","step":1.0,"dur":0.3,"vol":0.15}]},"race_go":{"layers":[{"wave":"sine","freq":"A5","dur":0.9,"vol":0.5,"release":0.6},{"wave":"triangle","freq":"A6","dur":0.7,"vol":0.15,"release":0.5}]},"lap":{"layers":[{"wave":"triangle","notes":"E6 A6","step":0.1,"dur":0.25,"vol":0.4,"release":0.2}]},"final_lap":{"layers":[{"wave":"square","notes":"D5 D5 D5 A5","step":0.11,"dur":0.1,"vol":0.3,"filter":{"type":"lowpass","freq":4000}},{"wave":"square","freq":"A5","start":0.33,"dur":0.6,"vol":0.3,"release":0.4,"filter":{"type":"lowpass","freq":4000}},{"wave":"triangle","notes":"F#4 F#4 F#4 D5","step":0.11,"dur":0.1,"vol":0.3}]},"finish":{"echo":{"delay":0.12,"repeats":2},"layers":[{"wave":"square","notes":"C5 E5 G5 C6","step":0.1,"dur":0.1,"vol":0.3,"filter":{"type":"lowpass","freq":4500}},{"wave":"square","freq":"E6","start":0.4,"dur":0.9,"vol":0.3,"release":0.6,"vibrato":{"rate":6,"depth":0.01},"filter":{"type":"lowpass","freq":4500}},{"wave":"triangle","freq":"C5","start":0.4,"dur":0.9,"vol":0.3,"release":0.6}]},"drift":{"layers":[{"wave":"noise","dur":0.8,"vol":0.35,"attack":0.03,"release":0.3,"filter":{"type":"bandpass","freq":3200,"q":6}},{"wave":"sine","freq":2600,"freq_end":2300,"dur":0.8,"vol":0.08,"vibrato":{"rate":9,"depth":0.02}}]},"drift_spark":{"layers":[{"wave":"square","notes":"C6 G6","step":0.05,"dur":0.08,"vol":0.25},{"wave":"noise","dur":0.15,"vol":0.2,"filter":{"type":"highpass","freq":5000}}]},"boost":{"layers":[{"wave":"noise","dur":0.7,"vol":0.4,"attack":0.01,"release":0.5,"filter":{"type":"bandpass","freq":2000,"q":0.8}},{"wave":"saw","freq":200,"freq_end":900,"dur":0.6,"vol":0.25,"filter":{"type":"lowpass","freq":2500}}]},"itembox":{"layers":[{"wave":"noise","dur":0.1,"vol":0.4,"filter":{"type":"highpass","freq":4000}},{"wave":"square","notes":"C6 E6 G6 C6 E6 G6 C6 E6 G6 C6 E6 G6","step":0.06,"dur":0.04,"start":0.1,"vol":0.2,"filter":{"type":"lowpass","freq":5000}}]},"item_get":{"layers":[{"wave":"triangle","notes":"G5 C6 E6","step":0.05,"dur":0.4,"vol":0.35,"release":0.3}]},"crash":{"layers":[{"wave":"noise","dur":0.9,"vol":0.7,"attack":0.001,"release":0.8,"filter":{"type":"highpass","freq":1500}},{"wave":"sine","freq":150,"freq_end":40,"dur":0.3,"vol":0.7,"attack":0.001},{"wave":"square","freq":3100,"freq_end":2900,"dur":0.5,"vol":0.06,"release":0.4}]},"spin":{"layers":[{"wave":"sine","freq":1200,"freq_end":300,"dur":0.9,"vol":0.35,"vibrato":{"rate":10,"depth":0.25}}]},"horn":{"layers":[{"wave":"saw","freq":400,"dur":0.12,"vol":0.3,"filter":{"type":"lowpass","freq":1500}},{"wave":"saw","freq":500,"dur":0.12,"vol":0.25,"filter":{"type":"lowpass","freq":1500}},{"wave":"saw","freq":400,"start":0.2,"dur":0.45,"vol":0.3,"filter":{"type":"lowpass","freq":1500}},{"wave":"saw","freq":500,"start":0.2,"dur":0.45,"vol":0.25,"filter":{"type":"lowpass","freq":1500}}]},"gameover":{"layers":[{"wave":"triangle","notes":"G4 F#4 F4","step":0.28,"dur":0.28,"vol":0.5},{"wave":"triangle","freq":"E4","freq_end":"D4","start":0.84,"dur":0.9,"vol":0.5,"vibrato":{"rate":5,"depth":0.015}}]},"fanfare":{"layers":[{"wave":"square","notes":"G5 G5 G5","step":0.12,"dur":0.1,"vol":0.3,"filter":{"type":"lowpass","freq":4000}},{"wave":"square","freq":"C6","start":0.36,"dur":0.9,"vol":0.35,"release":0.6,"vibrato":{"rate":6,"depth":0.01},"filter":{"type":"lowpass","freq":4000}},{"wave":"triangle","notes":"E4 E4 E4","step":0.12,"dur":0.1,"vol":0.3},{"wave":"triangle","freq":"C4","start":0.36,"dur":0.9,"vol":0.35,"release":0.6},{"wave":"triangle","freq":"G4","start":0.36,"dur":0.9,"vol":0.25,"release":0.6}]}};

function rng(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const angD=(a,b)=>{ let d=a-b; while(d>Math.PI) d-=2*Math.PI; while(d<-Math.PI) d+=2*Math.PI; return d; };
const pack=(r,g,b)=>((255<<24)|(b<<16)|(g<<8)|r)>>>0;

/* ---------- コース（中心線の点の列・地面の絵） ---------- */
function buildTrack(ci){ const C=COURSES[ci], c=C.pts, n=c.length, P=[];
  for(let i=0;i<n;i++){ const p0=c[(i-1+n)%n],p1=c[i],p2=c[(i+1)%n],p3=c[(i+2)%n], steps=Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/8);
    for(let s=0;s<steps;s++){ const u=s/steps,u2=u*u,u3=u2*u, f=k=>.5*((2*p1[k])+(-p0[k]+p2[k])*u+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*u2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*u3);
      P.push({x:f(0),y:f(1)}); } }
  const N=P.length; P.forEach((p,i)=>{ const q=P[(i+1)%N], o=P[(i-1+N)%N], dx=q.x-o.x, dy=q.y-o.y, l=Math.hypot(dx,dy)||1; p.tx=dx/l; p.ty=dy/l; p.nx=-p.ty; p.ny=p.tx; });
  return {P,N,C}; }
function buildMap(tr){ const {P,N,C}=tr, cv=document.createElement("canvas"); cv.width=cv.height=MS; const c=cv.getContext("2d"), r=rng(5000+COURSES.indexOf(C));
  c.scale(MS/WORLD,MS/WORLD); const rgb=a=>`rgb(${a[0]},${a[1]},${a[2]})`;
  const path=()=>{ c.beginPath(); P.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y)); c.closePath(); };
  c.lineJoin="round"; c.lineCap="round";
  if(C.theme==="sea"){ c.fillStyle=rgb(C.off); c.fillRect(0,0,WORLD,WORLD);
    for(let i=0;i<900;i++){ c.fillStyle="rgba(255,255,255,.18)"; c.fillRect(r()*WORLD,r()*WORLD,18,3); }
    path(); c.strokeStyle=rgb(C.ground); c.lineWidth=TW+520; c.stroke(); path(); c.strokeStyle="rgba(255,255,255,.0)"; }
  else { c.fillStyle=rgb(C.ground); c.fillRect(0,0,WORLD,WORLD); }
  // 地面のつぶつぶ
  for(let i=0;i<6000;i++){ const x=r()*WORLD,y=r()*WORLD; c.fillStyle=r()<.5?"rgba(0,0,0,.06)":"rgba(255,255,255,.06)"; c.fillRect(x,y,6+r()*8,6+r()*8); }
  const far=(x,y,d)=>{ for(let i=0;i<N;i+=3){ const p=P[i]; if((p.x-x)*(p.x-x)+(p.y-y)*(p.y-y)<d*d) return false; } return true; };
  if(C.theme==="day"){ for(let i=0;i<260;i++){ const x=r()*WORLD,y=r()*WORLD; if(!far(x,y,TW*.5+60)) continue; const rr=14+r()*16;
    c.fillStyle="rgba(0,0,0,.18)"; c.beginPath(); c.arc(x+8,y+8,rr,0,7); c.fill(); c.fillStyle=r()<.5?"#2F7D3B":"#3A8F44"; c.beginPath(); c.arc(x,y,rr,0,7); c.fill(); c.fillStyle="rgba(255,255,255,.12)"; c.beginPath(); c.arc(x-rr*.3,y-rr*.3,rr*.45,0,7); c.fill(); } }
  if(C.theme==="sea"){ for(let i=0;i<120;i++){ const x=r()*WORLD,y=r()*WORLD; if(!far(x,y,TW*.5+40)||far(x,y,TW*.5+240)) continue; c.fillStyle="#3FA34D"; for(let k=0;k<5;k++){ const a=k*1.26; c.beginPath(); c.ellipse(x+Math.cos(a)*9,y+Math.sin(a)*9,11,4,a,0,7); c.fill(); } c.fillStyle="#8A5A2B"; c.beginPath(); c.arc(x,y,4,0,7); c.fill(); } }
  if(C.theme==="night"){ for(let i=0;i<180;i++){ const w=50+r()*90,h=50+r()*90,x=r()*WORLD,y=r()*WORLD; if(!far(x+w/2,y+h/2,TW*.5+Math.max(w,h)*.75)) continue;
    c.fillStyle=["#2B3150","#353B5E","#262A44"][i%3]; c.fillRect(x,y,w,h); c.fillStyle="rgba(0,0,0,.35)"; c.fillRect(x+w,y+8,10,h);
    for(let wy=y+10;wy<y+h-10;wy+=18) for(let wx=x+10;wx<x+w-10;wx+=18) if(r()<.45){ c.fillStyle=r()<.6?"#FFE38A":"#8AD8FF"; c.fillRect(wx,wy,8,8); } } }
  // 縁石（赤白）→ 道
  path(); c.strokeStyle=C.theme==="night"?"#E8F1FF":"#F4F4F4"; c.lineWidth=TW+18; c.stroke();
  path(); c.strokeStyle=C.theme==="night"?"#FF3FA4":"#E5484D"; c.setLineDash([26,26]); c.stroke(); c.setLineDash([]);
  path(); c.strokeStyle=rgb(C.asph); c.lineWidth=TW; c.stroke();
  path(); c.strokeStyle="rgba(255,255,255,.22)"; c.lineWidth=3; c.setLineDash([30,40]); c.stroke(); c.setLineDash([]);
  // スタートライン（白黒）
  const s0=P[0]; c.save(); c.translate(s0.x,s0.y); c.rotate(Math.atan2(s0.ty,s0.tx)); const cs=TW/10; for(let k=0;k<10;k++) for(let j=0;j<2;j++){ c.fillStyle=(k+j)%2?"#111":"#fff"; c.fillRect(j*cs-cs,-TW/2+k*cs,cs,cs); } c.restore();
  // 加速板（黄色の矢印）
  C.plates.forEach(f=>{ const p=P[Math.floor(N*f)]; c.save(); c.translate(p.x,p.y); c.rotate(Math.atan2(p.ty,p.tx)); c.fillStyle="#F5B800"; c.fillRect(-20,-TW*.22,40,TW*.44);
    c.fillStyle="#FFF4B0"; for(let k=0;k<3;k++){ c.beginPath(); c.moveTo(-14+k*11,-TW*.16); c.lineTo(-6+k*11,0); c.lineTo(-14+k*11,TW*.16); c.lineTo(-18+k*11,TW*.16); c.lineTo(-10+k*11,0); c.lineTo(-18+k*11,-TW*.16); c.fill(); } c.restore(); });
  const tex=new Uint32Array(c.getImageData(0,0,MS,MS).data.buffer);
  // 小さい地図（右上に出す）
  const mini=document.createElement("canvas"); mini.width=mini.height=180; const m=mini.getContext("2d"); m.scale(180/WORLD,180/WORLD); m.lineJoin="round";
  m.beginPath(); P.forEach((p,i)=>i?m.lineTo(p.x,p.y):m.moveTo(p.x,p.y)); m.closePath(); m.strokeStyle="rgba(255,255,255,.85)"; m.lineWidth=60; m.stroke();
  return {tex,mini,outC:pack(...C.off)}; }

/* ---------- 音（sound-studio のレシピをその場で鳴らす。ファイル0） ---------- */
const NOTE={C:-9,D:-7,E:-5,F:-4,G:-2,A:0,B:2};
function hz(n){ if(typeof n==="number") return n; let s=NOTE[n[0].toUpperCase()],i=1; while(n[i]==="#"||n[i]==="b"){ s+=n[i]==="#"?1:-1; i++; } const o=n.length>i?parseInt(n.slice(i),10):4; return 440*Math.pow(2,(s+(o-4)*12)/12); }
function expand(r){ const out=[]; (r.layers||[]).forEach(L=>{ if(L.notes==null){ out.push(L); return; } const step=L.step??.1, ns=typeof L.notes==="string"?L.notes.split(/\s+/):L.notes;
  ns.forEach((n,i)=>{ if(n==="-"||n==="_"||n==="r") return; const o=Object.assign({},L,{start:(L.start||0)+i*step,dur:L.dur??step,freq:n}); delete o.notes; delete o.step; out.push(o); }); }); return out; }
let NB=null;
const SND={ bus:null,busA:null,last:{},
  out(a){ if(this.busA!==a||!this.bus){ const g=a.createGain(),cp=a.createDynamicsCompressor(); cp.threshold.value=-14; cp.ratio.value=4; cp.attack.value=.003; cp.release.value=.2; g.gain.value=.8; g.connect(cp); cp.connect(a.destination); this.bus=g; this.busA=a; } return this.bus; },
  play(name,vol=1,minGap=0){ if(!store.get("b_snd",true)) return; const r=REC[name]; if(!r) return; const a=ac(); if(!a) return;
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

/* ---------- 絵：カート（後ろから見た形。すべてオリジナル） ---------- */
function drawKart(c,x,y,w,col,tilt,side,num,spark){ // x,y＝地面に接する点、w＝はば(px)
  c.save(); c.translate(x,y); c.rotate(tilt*.12);
  c.fillStyle="rgba(0,0,0,.28)"; c.beginPath(); c.ellipse(0,0,w*.56,w*.13,0,0,7); c.fill();
  const sx=side*w*.12; // 横向きのぶん、上の部分を少しずらす
  c.fillStyle="#1D1F26"; c.beginPath(); c.roundRect(-w*.52,-w*.3,w*.26,w*.3,w*.05); c.roundRect(w*.26,-w*.3,w*.26,w*.3,w*.05); c.fill();
  c.fillStyle=col; c.beginPath(); c.roundRect(-w*.4+sx*.5,-w*.42,w*.8,w*.26,w*.08); c.fill();
  c.fillStyle="rgba(0,0,0,.25)"; c.fillRect(-w*.3+sx*.5,-w*.2,w*.6,w*.05);
  c.fillStyle="#2A2D36"; c.fillRect(-w*.12+sx*.5,-w*.2,w*.08,w*.08); c.fillRect(w*.04+sx*.5,-w*.2,w*.08,w*.08);
  // 運転する人（ヘルメット）
  c.fillStyle="#F7F7F7"; c.beginPath(); c.arc(sx,-w*.56,w*.17,0,7); c.fill();
  c.fillStyle=col; c.fillRect(sx-w*.17,-w*.6,w*.34,w*.07);
  if(num){ c.fillStyle="#2456D6"; c.beginPath(); c.arc(sx*.5,-w*.31,w*.09,0,7); c.fill(); c.fillStyle="#fff"; c.font=`700 ${Math.max(6,w*.11)|0}px Arial`; c.textAlign="center"; c.textBaseline="middle"; c.fillText("45",sx*.5,-w*.305); }
  if(spark){ const sc=spark===2?"#FF9A2E":"#4FC3FF"; c.fillStyle=sc; for(let k=0;k<5;k++){ const px=(k%2?1:-1)*w*(.4+Math.random()*.15), py=-Math.random()*w*.15; c.beginPath(); c.arc(px,py,w*(.03+Math.random()*.04),0,7); c.fill(); } }
  c.restore(); }

const KART={
  s:Object.assign({cs:"0",cl:"2",ct:"btn",bgm:"off"},store.get("p_kart",{})),
  st:null,rf:[],tilt:null,
  save(){ store.set("p_kart",this.s); },
  rec(){ return store.get("p_kart_rec",{}); },
  init(){ this.pane=$('[data-pane="kart"]');
    this.rf.push(chips($("#ktCsSel"),()=>this.s.cs,v=>{this.s.cs=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#ktClSel"),()=>this.s.cl,v=>{this.s.cl=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#ktCtSel"),()=>this.s.ct,v=>{this.s.ct=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#ktBgSel"),()=>this.s.bgm,v=>{this.s.bgm=v;this.save()}));
    this.inp={l:false,r:false,d:false,i:false};
    const hold=(id,k)=>{ const b=$(id); const on=e=>{ e.preventDefault(); e.stopPropagation(); try{ b.setPointerCapture(e.pointerId); }catch(_){} b.classList.add("on"); this.inp[k]=true; if(k==="i") this.useReq=true; if(this.st&&this.st.paused) this.pause(false); };
      const off=()=>{ b.classList.remove("on"); this.inp[k]=false; }; b.addEventListener("pointerdown",on); b.addEventListener("pointerup",off); b.addEventListener("pointercancel",off); b.addEventListener("lostpointercapture",off); };
    hold("#ktL","l"); hold("#ktR","r"); hold("#ktD","d"); hold("#ktI","i");
    $("#ktExit").addEventListener("click",e=>{ e.stopPropagation(); if(this.st) this.pause(!this.st.paused); });
    $("#ktResume").onclick=()=>this.pause(false); $("#ktQuit").onclick=()=>this.quit();
    this.keys={};
    addEventListener("keydown",e=>{ if(!this.st||mode!=="kart") return; const k=e.key; this.keys[k]=true;
      if(k==="x"||k==="X"||k===" "){ this.useReq=true; e.preventDefault(); } if(k==="Escape"||k==="p") this.pause(!this.st.paused); if(k.startsWith("Arrow")) e.preventDefault(); });
    addEventListener("keyup",e=>{ this.keys[e.key]=false; });
    addEventListener("deviceorientation",e=>{ if(e.gamma!=null) this.tilt={g:e.gamma,b:e.beta}; });
    addEventListener("resize",()=>{ if(this.st) this.layout(); });
    document.addEventListener("visibilitychange",()=>{ if(document.hidden&&this.st) this.pause(true); });
    this.onPop=()=>{ if(this.st){ try{ history.pushState({kt:1},"",location.href); }catch(e){} this.pause(true); } };
    this.onUnload=e=>{ if(this.st){ e.preventDefault(); e.returnValue=""; } };
    this.refresh(); },
  refresh(){ this.rf.forEach(f=>f()); const r=this.rec(), cl=this.s.cl;
    $("#ktCtNote").innerHTML=t(this.s.ct==="tilt"?"ktTiltN":"ktBtnN");
    $("#ktRecNote").textContent=t("ktRecNote",{c:t("ktCl"+cl)});
    $("#ktRec").innerHTML=[0,1,2].map(i=>{ const x=r[i+"_"+cl]; return `<div><span>${esc(t("ktC"+(i+1)))}</span><b>${x?esc(t("ktRank",{n:x.rank})):"—"}</b><span>${x?esc(this.fmt(x.time)):""}</span></div>`; }).join(""); },
  fmt(ms){ const s=ms/1000, m=Math.floor(s/60); return `${m}'${(s-m*60).toFixed(2).padStart(5,"0")}`; },
  view(v){ this.pane.dataset.v=v; if(mode==="kart") this.dock(); },
  dock(){ if(mode!=="kart") return; if(this.pane.dataset.v==="setup") return setDock(`<button class="btn primary big" data-act="start"><i class="ic" data-ic="play"></i>${esc(t("start"))}</button>`); setDock(""); },
  act(a){ if(a==="start") this.start(); },
  lock(on){ const de=document.documentElement; de.classList.toggle("ktlock",on);
    if(on&&!this.locked){ this.locked=true; try{ history.pushState({kt:1},"",location.href); }catch(e){} addEventListener("popstate",this.onPop); addEventListener("beforeunload",this.onUnload); }
    else if(!on&&this.locked){ this.locked=false; removeEventListener("popstate",this.onPop); removeEventListener("beforeunload",this.onUnload); try{ if(history.state&&history.state.kt) history.back(); }catch(e){} } },

  /* ---------- 音楽・エンジン音 ---------- */
  async bgmOn(){ if(this.s.bgm!=="on"||!store.get("b_snd",true)) return; const a=ac(); if(!a) return;
    try{ if(!this.bgBuf||this.bgA!==a){ const res=await fetch(`snd/kart.mp3?v=${APP_VER}`); const ab=await res.arrayBuffer(); this.bgBuf=await new Promise((ok,ng)=>a.decodeAudioData(ab,ok,ng)); this.bgA=a; }
      if(!this.st||this.st.paused) return; this.bgmOff(); const s=a.createBufferSource(),g=a.createGain(); s.buffer=this.bgBuf; s.loop=true; g.gain.value=.26; s.connect(g); g.connect(SND.out(a)); s.start(a.currentTime+.05); this.bg={s,g}; }catch(e){} },
  bgmOff(){ if(this.bg){ try{ this.bg.s.stop(); }catch(e){} this.bg=null; } },
  engOn(){ if(!store.get("b_snd",true)) return; const a=ac(); if(!a||this.eng) return;
    try{ const o1=a.createOscillator(),o2=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain(); o1.type="sawtooth"; o2.type="square"; f.type="lowpass"; f.frequency.value=600; g.gain.value=0;
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(SND.out(a)); o1.start(); o2.start(); this.eng={o1,o2,f,g,a}; }catch(e){} },
  engSet(v,boost){ const e=this.eng; if(!e) return; const T=e.a.currentTime, fr=55+v*.55+(boost?40:0);
    e.o1.frequency.setTargetAtTime(fr,T,.05); e.o2.frequency.setTargetAtTime(fr*.5,T,.05); e.f.frequency.setTargetAtTime(400+v*3,T,.08); e.g.gain.setTargetAtTime(.035+Math.min(.04,v/6000),T,.1); },
  engOff(){ const e=this.eng; if(!e) return; try{ e.o1.stop(); e.o2.stop(); }catch(_){} this.eng=null; },

  /* ---------- あそぶ ---------- */
  async start(){ ac();
    if(this.s.ct==="tilt"){ try{ if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function"){ const p=await DeviceOrientationEvent.requestPermission(); if(p!=="granted") throw 0; } }catch(e){ toast(t("ktNoTilt")); this.s.ct="btn"; this.save(); this.refresh(); } }
    const ci=+this.s.cs, tr=buildTrack(ci), C=CLS[this.s.cl]||CLS[2];
    if(!this.maps) this.maps={}; if(!this.maps[ci]) this.maps[ci]=buildMap(tr); const map=this.maps[ci];
    const r=rng(Date.now()&0xffff), ks=[];
    for(let i=0;i<NK;i++){ // スタートの並び：2列。自分はいちばん後ろ
      const row=Math.floor(i/2), idx=(tr.N-6-row*5)%tr.N, p=tr.P[idx], lat=(i%2?1:-1)*TW*.2;
      ks.push({i,isP:i===NK-1,x:p.x+p.nx*lat,y:p.y+p.ny*lat,a:Math.atan2(p.ty,p.tx),va:Math.atan2(p.ty,p.tx),v:0,idx,lap:0,half:false,lat,
        col:i===NK-1?COLS[0]:COLS[1+i%7],skill:.86+(i/(NK-1))*.1*0+r()*.1,lane:(r()-.5)*TW*.5,laneT:2+r()*3,item:null,uses:0,roll:0,useT:3+r()*6,boostT:0,spinT:0,spin:0,drift:0,dc:0,lapT0:0,best:0,off:0,fin:0,fT:0}); }
    // 速いCPUと遅いCPUを混ぜる（前のほうが少し遅め）
    ks.forEach((k,i)=>{ if(!k.isP) k.skill=.84+((NK-2-i)/(NK-2))*.1+r()*.05; });
    const boxes=[]; tr.C.boxes.forEach(f=>{ const p=tr.P[Math.floor(tr.N*f)]; [-.33,-.11,.11,.33].forEach(o=>boxes.push({x:p.x+p.nx*o*TW,y:p.y+p.ny*o*TW,on:true,t:0})); });
    const plates=tr.C.plates.map(f=>Math.floor(tr.N*f));
    this.st={ci,tr,map,C:tr.C,cls:+this.s.cl,ks,me:ks[NK-1],boxes,plates,oils:[],zaps:[],t:-3.6,cd:-1,phase:"count",paused:false,id:Math.random(),camA:ks[NK-1].a,msg:null,rank:NK,stars:[...Array(60)].map(()=>[r(),r()*.9,r()*1.5+.5]),
      hills:(()=>{ const h=[],q=rng(77+ci); let v=.5; for(let i=0;i<256;i++){ v=clamp(v+(q()-.5)*.25,.1,1); h.push(v); } for(let k=0;k<3;k++) for(let i=0;i<256;i++) h[i]=(h[(i+255)%256]+h[i]*2+h[(i+1)%256])/4; return h; })()};
    this.useReq=false; this.view("play"); this.lock(true); $("#ktL").hidden=$("#ktR").hidden=this.s.ct==="tilt"; $("#ktPause").hidden=true;
    this.layout(); this.engOn(); this.bgmOn();
    cancelAnimationFrame(this.raf); let last=now(); const id=this.st.id;
    const f=()=>{ if(!this.st||this.st.id!==id) return; const T=now(); let rem=Math.min(70,T-last)/1000; last=T;
      if(mode==="kart"&&!this.st.paused){ while(rem>0&&this.st&&!this.st.paused){ const d=Math.min(1/60,rem); this.update(d); rem-=d; } }
      if(this.st) this.render(T); this.raf=requestAnimationFrame(f); };
    this.raf=requestAnimationFrame(f); },
  layout(){ const r=$("#ktStage").getBoundingClientRect(), W=this.W=r.width||375, H=this.H=r.height||700, dpr=this.dpr=Math.min(2,window.devicePixelRatio||1);
    const cv=$("#ktCv"); cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); this.cx=cv.getContext("2d");
    this.hor=Math.round(H*.33); this.f=Math.min(W,H*.75)*.56; this.camD=34; this.camH=Math.round((H-this.hor)*.44*this.camD/this.f);
    this.RW=Math.min(320,Math.round(W*.6)); this.RH=Math.max(40,Math.round((H-this.hor)*this.RW/W));
    const g=this.gcv=document.createElement("canvas"); g.width=this.RW; g.height=this.RH; this.gx=g.getContext("2d"); this.img=this.gx.createImageData(this.RW,this.RH); this.buf=new Uint32Array(this.img.data.buffer); },
  pause(on){ const st=this.st; if(!st) return; st.paused=on; $("#ktPause").hidden=!on; if(on){ this.bgmOff(); this.engOff(); } else { this.bgmOn(); this.engOn(); } },
  quit(){ cancelAnimationFrame(this.raf); this.bgmOff(); this.engOff(); this.st=null; this.lock(false); this.view("setup"); this.refresh(); },
  msg(txt,sec){ this.st.msg={txt,t:sec||1.3}; },
  near(k){ const {P,N}=this.st.tr; let best=1e12,bi=k.idx; for(let d=-30;d<=30;d++){ const i=(k.idx+d+N)%N, p=P[i], q=(p.x-k.x)*(p.x-k.x)+(p.y-k.y)*(p.y-k.y); if(q<best){ best=q; bi=i; } }
    const p=P[bi]; k.lat=(k.x-p.x)*p.nx+(k.y-p.y)*p.ny; return bi; },
  prog(k){ const N=this.st.tr.N; return k.lap*N+k.idx-((!k.half&&k.idx>N*.6)?N:0)+(k.fin?1e6-k.fT:0); },
  giveItem(k){ const st=this.st, rk=k.rank, r=Math.random(); let it;
    if(rk<=2) it=r<.45?"oil":r<.8?"zap":"turbo"; else if(rk<=5) it=r<.35?"turbo":r<.7?"zap":r<.9?"oil":"turbo3"; else it=r<.35?"turbo3":r<.65?"turbo":"zap";
    k.item=it; k.uses=it==="turbo3"?3:1; if(k.isP) SND.play("item_get"); },
  useItem(k){ const st=this.st; if(!k.item||k.roll>0) return;
    if(k.item==="turbo"||k.item==="turbo3"){ k.boostT=Math.max(k.boostT,1.3); if(k.isP) SND.play("boost"); }
    else if(k.item==="oil"){ st.oils.push({x:k.x-Math.cos(k.a)*18,y:k.y-Math.sin(k.a)*18,t:22}); if(k.isP) SND.play("horn",.4); }
    else if(k.item==="zap"){ const ahead=st.ks.filter(o=>o!==k&&!o.fin&&o.rank===k.rank-1)[0]; st.zaps.push({x:k.x+Math.cos(k.a)*14,y:k.y+Math.sin(k.a)*14,a:k.a,tgt:ahead||null,t:5,from:k}); if(k.isP) SND.play("drift_spark"); }
    k.uses--; if(k.uses<=0) k.item=null; },
  hitSpin(k,pow){ if(k.spinT>0) return; k.spinT=pow||1.1; k.v*=.45; k.drift=0; k.dc=0; if(k.isP){ SND.play("spin"); try{ navigator.vibrate&&navigator.vibrate(120); }catch(e){} } else if(Math.hypot(k.x-this.st.me.x,k.y-this.st.me.y)<300) SND.play("spin",.5,.3); },
  update(dt){ const st=this.st, {P,N}=st.tr, C=CLS[st.cls], me=st.me;
    st.t+=dt; if(st.msg){ st.msg.t-=dt; if(st.msg.t<=0) st.msg=null; }
    if(st.phase==="count"){ const n=Math.ceil(-st.t); if(st.t>-3.05&&st.cd<0){ st.cd=1; SND.play("race_count"); } if(st.t>=0){ st.phase="race"; SND.play("race_go"); this.msg("GO!",1); st.ks.forEach(k=>k.lapT0=0); } }
    const racing=st.phase!=="count";
    // 順位
    const order=st.ks.slice().sort((a,b)=>this.prog(b)-this.prog(a)); order.forEach((k,i)=>k.rank=i+1);
    st.ks.forEach(k=>{
      // 入力（自分＝ボタン・傾き・キー、CPU＝中心線を追いかける）
      let steer=0, drift=false, use=false;
      if(k.isP&&!k.fin){ const K=this.keys, I=this.inp;
        if(this.s.ct==="tilt"&&this.tilt){ let g=this.tilt.g; const o=(screen.orientation&&screen.orientation.angle)||window.orientation||0; if(o===90) g=-this.tilt.b; else if(o===-90||o===270) g=this.tilt.b; steer=Math.abs(g)<3?0:clamp((g-Math.sign(g)*3)/22,-1,1); }
        if(I.l||K.ArrowLeft||K.a) steer-=1; if(I.r||K.ArrowRight||K.d) steer+=1; steer=clamp(steer,-1,1);
        drift=I.d||K.z||K.Z||K.Shift; use=this.useReq; this.useReq=false; }
      else { const ti=(k.idx+13)%N, p=P[ti]; k.laneT-=dt; if(k.laneT<=0){ k.laneT=2+Math.random()*3; k.lane=(Math.random()-.5)*TW*.55; }
        const tx=p.x+p.nx*k.lane, ty=p.y+p.ny*k.lane; steer=clamp(angD(Math.atan2(ty-k.y,tx-k.x),k.a)*2.4,-1,1);
        if(k.item&&k.roll<=0){ k.useT-=dt; if(k.useT<=0){ k.useT=2+Math.random()*6; use=true; } } }
      if(!racing) return;
      // 速さ
      let maxV=C.v*(k.isP?1:k.skill);
      if(!k.isP&&!k.fin){ const gap=(this.prog(k)-this.prog(me))/N; maxV*=gap>.25?.9:gap<-.2?1.07:1; }
      if(k.fin&&k.isP) maxV*=.6;
      const off=Math.abs(k.lat)>TW/2+6; if(off) maxV*=st.C.theme==="sea"&&Math.abs(k.lat)>TW/2+250?.3:.52;
      if(k.boostT>0){ k.boostT-=dt; maxV=Math.max(maxV,C.v*1.4); }
      if(k.spinT>0){ k.spinT-=dt; k.spin+=dt*16; k.v*=Math.pow(.3,dt); }
      else { k.spin=0; const rate=k.v<maxV?(k.boostT>0?3:C.acc*.85):2.2; k.v+=(maxV-k.v)*Math.min(1,dt*rate);
        // ハンドル・ドリフト
        const g=Math.min(1,k.v/70);
        if(drift&&!k.drift&&steer!==0&&k.v>100){ k.drift=Math.sign(steer); k.dc=0; if(k.isP) SND.play("drift",.6); }
        if(k.drift&&(!drift||k.v<70)){ const lv=k.dc>1.6?2:k.dc>.8?1:0; if(lv){ k.boostT=Math.max(k.boostT,lv===2?1.1:.6); if(k.isP){ SND.play("drift_spark"); SND.play("boost",.6); } } k.drift=0; k.dc=0; }
        let turn; if(k.drift){ k.dc+=dt; turn=(k.drift*.6+steer*.55)*C.turn*1.2*g; if(k.isP&&k.dc>.25) SND.play("drift",.35,.75); } else turn=steer*C.turn*g;
        k.a+=turn*dt; }
      k.va+=angD(k.a,k.va)*Math.min(1,dt*(k.drift?2.6:9));
      k.x=clamp(k.x+Math.cos(k.va)*k.v*dt,20,WORLD-20); k.y=clamp(k.y+Math.sin(k.va)*k.v*dt,20,WORLD-20);
      // コース上の位置・周回
      const pi=k.idx; k.idx=this.near(k);
      if(k.idx>N*.4&&k.idx<N*.6) k.half=true;
      if(pi>N*.8&&k.idx<N*.2&&k.half){ k.half=false; k.lap++; const lt=st.t*1000-k.lapT0; k.lapT0=st.t*1000; if(!k.best||lt<k.best) k.best=lt;
        if(k.lap>=LAPS&&!k.fin){ k.fin=1; k.fT=st.t*1000; if(k.isP) this.finish(); }
        else if(k.isP){ if(k.lap===LAPS-1){ SND.play("final_lap"); this.msg(t("ktFinal"),1.8); } else { SND.play("lap"); this.msg(t("ktLapN",{n:k.lap+1}),1.3); } } }
      // コースから大きく外れたら戻す
      if(Math.abs(k.lat)>TW*3.2){ k.off+=dt; if(k.off>1.2){ const p=P[k.idx]; k.x=p.x; k.y=p.y; k.a=k.va=Math.atan2(p.ty,p.tx); k.v=40; k.off=0; if(k.isP) this.msg(t("ktBack"),1.2); } } else k.off=0;
      // 加速板
      if(Math.abs(k.lat)<TW*.24) for(const pl of st.plates){ const d=Math.abs(angD((k.idx-pl)/N*2*Math.PI,0))*N/(2*Math.PI); if(d<3){ if(k.boostT<.5&&k.isP) SND.play("boost",.8); k.boostT=Math.max(k.boostT,1.0); } }
      // アイテム箱
      for(const b of st.boxes){ if(b.on&&(k.x-b.x)*(k.x-b.x)+(k.y-b.y)*(k.y-b.y)<15*15){ b.on=false; b.t=3; if(!k.item&&k.roll<=0){ k.roll=k.isP?1.1:.5; if(k.isP) SND.play("itembox"); } } }
      if(k.roll>0){ k.roll-=dt; if(k.roll<=0) this.giveItem(k); }
      if(use) this.useItem(k);
    });
    if(!racing) return;
    st.boxes.forEach(b=>{ if(!b.on){ b.t-=dt; if(b.t<=0) b.on=true; } });
    // カートどうしがぶつかる
    for(let i=0;i<NK;i++) for(let j=i+1;j<NK;j++){ const a=st.ks[i],b=st.ks[j], dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy);
      if(d<13&&d>0){ const o=(13-d)/2, nx=dx/d, ny=dy/d; a.x-=nx*o; a.y-=ny*o; b.x+=nx*o; b.y+=ny*o; a.v*=.97; b.v*=.97; if(a.isP||b.isP) SND.play("crash",.45,.5); } }
    // オイル・ビリビリ玉
    st.oils=st.oils.filter(o=>{ o.t-=dt; if(o.t<=0) return false; for(const k of st.ks){ if((k.x-o.x)*(k.x-o.x)+(k.y-o.y)*(k.y-o.y)<12*12&&k.boostT<=0){ this.hitSpin(k,1.0); return false; } } return true; });
    st.zaps=st.zaps.filter(z=>{ z.t-=dt; if(z.t<=0) return false; if(z.tgt){ z.a+=clamp(angD(Math.atan2(z.tgt.y-z.y,z.tgt.x-z.x),z.a),-4*dt,4*dt); }
      z.x+=Math.cos(z.a)*430*dt; z.y+=Math.sin(z.a)*430*dt; if(z.x<0||z.y<0||z.x>WORLD||z.y>WORLD) return false;
      for(const k of st.ks){ if(k!==z.from&&(k.x-z.x)*(k.x-z.x)+(k.y-z.y)*(k.y-z.y)<15*15){ this.hitSpin(k,1.2); return false; } } return true; });
    // カメラは進む向きをゆっくり追う
    st.camA+=angD(me.va,st.camA)*Math.min(1,dt*6);
    this.engSet(me.v,me.boostT>0);
    if(st.phase==="end"){ st.endT-=dt; if(st.endT<=0) this.result(); }
  },
  finish(){ const st=this.st, me=st.me; st.phase="end"; st.endT=3.4; st.final=me.rank; SND.play(me.rank<=3?"finish":"fanfare"); this.msg(t("ktGoal",{n:me.rank}),3.2); },
  result(){ const st=this.st, me=st.me, key=st.ci+"_"+st.cls, rec=this.rec(), old=rec[key];
    const best=!old||st.final<old.rank||(st.final===old.rank&&me.fT<old.time); if(best){ rec[key]={rank:st.final,time:me.fT,lap:me.best}; store.set("p_kart_rec",rec); }
    cancelAnimationFrame(this.raf); this.bgmOff(); this.engOff(); this.st=null; this.lock(false); this.view("setup"); this.refresh();
    showResult({title:st.final===1?t("ktWin"):t("ktGoalT"),big:t("ktRank",{n:st.final}),bigLbl:t("ktC"+(st.ci+1))+"・"+t("ktCl"+st.cls),isBest:best,
      stats:[[t("ktTime"),this.fmt(me.fT)],[t("ktBest"),this.fmt(me.best)],[t("ktRankL"),t("ktRank",{n:st.final})+" / "+NK]],
      retry:()=>this.start(),close:()=>this.refresh()}); },

  /* ---------- 描く ---------- */
  render(T){ const st=this.st, c=this.cx, W=this.W, H=this.H, hor=this.hor, f=this.f, camH=this.camH, me=st.me, C=st.C, dpr=this.dpr;
    const a=st.camA, fx=Math.cos(a), fy=Math.sin(a), rx=-fy, ry=fx, cx=me.x-fx*this.camD, cy=me.y-fy*this.camD;
    c.setTransform(dpr,0,0,dpr,0,0);
    // 空と遠くの山（向きで横に流れる）
    const sg=c.createLinearGradient(0,0,0,hor); sg.addColorStop(0,C.sky[0]); sg.addColorStop(1,C.sky[1]); c.fillStyle=sg; c.fillRect(0,0,W,hor+2);
    if(C.theme==="night"){ c.fillStyle="#fff"; st.stars.forEach(s=>{ const x=((s[0]*W*3-a/(2*Math.PI)*W*3)%(W*3)+W*3)%(W*3); if(x<W) c.fillRect(x,s[1]*hor*.8,s[2],s[2]); }); }
    c.fillStyle=C.hill; c.beginPath(); c.moveTo(0,hor+1);
    for(let x=0;x<=W;x+=4){ const ang=a+(x-W/2)/f, i=((Math.floor(ang/(2*Math.PI)*256*2)%256)+256)%256, h=st.hills[i];
      c.lineTo(x,hor-(C.theme==="night"?Math.round(h*6)*7:h*hor*.32)); } c.lineTo(W,hor+1); c.fill();
    if(C.theme==="night"){ c.fillStyle="rgba(255,226,120,.55)"; for(let x=0;x<W;x+=9){ const ang=a+(x-W/2)/f, i=((Math.floor(ang/(2*Math.PI)*256*2)%256)+256)%256; if((i*7)%5<2) c.fillRect(x,hor-st.hills[i]*30-4,2,2); } }
    // 地面（行ごとに奥行きを計算して、地面の絵から色をひろう）
    const RW=this.RW,RH=this.RH,buf=this.buf,tex=st.map.tex,outC=st.map.outC; let o=0; const gh=H-hor;
    for(let y=0;y<RH;y++){ const dy=(y+.5)*gh/RH, z=camH*f/dy, lat0=-W/2*z/f, step=(W/RW)*z/f;
      let wx=cx+fx*z+rx*lat0, wy=cy+fy*z+ry*lat0; const sx=rx*step, sy=ry*step;
      for(let x=0;x<RW;x++){ const mx=wx*.5|0, my=wy*.5|0; buf[o++]=(mx>=0&&mx<MS&&my>=0&&my<MS)?tex[my*MS+mx]:outC; wx+=sx; wy+=sy; } }
    this.gx.putImageData(this.img,0,0); c.imageSmoothingEnabled=false; c.drawImage(this.gcv,0,hor,W,gh); c.imageSmoothingEnabled=true;
    const hz=c.createLinearGradient(0,hor,0,hor+gh*.18); hz.addColorStop(0,C.sky[1]); hz.addColorStop(1,"rgba(255,255,255,0)"); c.globalAlpha=.75; c.fillStyle=hz; c.fillRect(0,hor,W,gh*.18); c.globalAlpha=1;
    // 物（奥から順に）
    const proj=(x,y)=>{ const dx=x-cx, dy=y-cy, z=dx*fx+dy*fy; if(z<6) return null; const l=dx*rx+dy*ry; return {x:W/2+l*f/z,y:hor+camH*f/z,s:f/z,z}; };
    const L=[];
    st.boxes.forEach(b=>{ if(!b.on) return; const p=proj(b.x,b.y); if(p&&p.z<1500) L.push({z:p.z,d:()=>{ const s=11*p.s, y=p.y-s*1.2-Math.sin(T/200+b.x)*s*.15, hue=(T/8+b.x)%360;
      c.fillStyle=`hsla(${hue},85%,60%,.9)`; c.strokeStyle="#fff"; c.lineWidth=Math.max(1,s*.08); c.beginPath(); c.roundRect(p.x-s/2,y-s/2,s,s,s*.18); c.fill(); c.stroke();
      c.fillStyle="#fff"; c.font=`800 ${Math.max(6,s*.7)|0}px Fredoka, sans-serif`; c.textAlign="center"; c.textBaseline="middle"; c.fillText("?",p.x,y+s*.04); }}); });
    st.oils.forEach(q=>{ const p=proj(q.x,q.y); if(p&&p.z<1400) L.push({z:p.z+1,d:()=>{ c.fillStyle="rgba(20,16,30,.85)"; c.beginPath(); c.ellipse(p.x,p.y,14*p.s,14*p.s*camH/p.z*1.5+1,0,0,7); c.fill(); c.fillStyle="rgba(180,120,255,.35)"; c.beginPath(); c.ellipse(p.x-3*p.s,p.y,5*p.s,2*p.s*camH/p.z*1.5+.5,0,0,7); c.fill(); }}); });
    st.zaps.forEach(q=>{ const p=proj(q.x,q.y); if(p&&p.z<1400) L.push({z:p.z,d:()=>{ const s=7*p.s, y=p.y-s*1.4; c.fillStyle="rgba(255,240,90,.35)"; c.beginPath(); c.arc(p.x,y,s*1.6,0,7); c.fill(); c.fillStyle="#FFE14D"; c.beginPath(); c.arc(p.x,y,s,0,7); c.fill();
      c.strokeStyle="#fff"; c.lineWidth=Math.max(1,s*.18); c.beginPath(); c.moveTo(p.x-s*.4,y-s*.6); c.lineTo(p.x+s*.1,y-s*.05); c.lineTo(p.x-s*.15,y+s*.1); c.lineTo(p.x+s*.4,y+s*.6); c.stroke(); }}); });
    st.ks.forEach(k=>{ const p=proj(k.x,k.y); if(!p||p.z>1600||(!k.isP&&p.z<this.camD-3)) return; const rel=angD(k.a+(k.spinT>0?k.spin:0),a);
      const side=Math.sin(rel), tilt=k.isP?(k.drift?k.drift*.8:0):0, spark=k.drift&&k.dc>.8?(k.dc>1.6?2:1):0;
      L.push({z:p.z,d:()=>{ drawKart(c,p.x,p.y,14*p.s,k.col,tilt,side,k.isP,spark);
        if(k.boostT>0){ c.fillStyle="rgba(255,170,40,.7)"; const w=14*p.s; for(let q=0;q<3;q++){ c.beginPath(); c.arc(p.x+(Math.random()-.5)*w*.5,p.y+w*.05,w*(.06+Math.random()*.06),0,7); c.fill(); } }
        if(!k.isP&&p.z<600&&p.z>this.camD+8){ c.fillStyle="rgba(0,0,0,.45)"; c.font=`700 ${Math.max(9,7*p.s)|0}px Fredoka, sans-serif`; c.textAlign="center"; c.fillText(String(k.rank),p.x,p.y-14*p.s*.85); } }}); });
    L.sort((p,q)=>q.z-p.z).forEach(o=>o.d());
    // 上の表示：順位・周・時間・アイテム・小さい地図
    const top=Math.max(10,(window.visualViewport?0:0))+10;
    c.textBaseline="alphabetic"; c.textAlign="left"; const big=(s,x,y,sz,col)=>{ c.font=`800 ${sz}px Fredoka, 'M PLUS Rounded 1c', sans-serif`; c.lineWidth=Math.max(3,sz*.16); c.strokeStyle="rgba(10,14,30,.75)"; c.strokeText(s,x,y); c.fillStyle=col||"#fff"; c.fillText(s,x,y); };
    big(t("ktRank",{n:me.rank}),62,top+36,34,me.rank===1?"#FFD84D":"#fff");
    big(`${t("ktLap")} ${Math.min(LAPS,me.lap+1)}/${LAPS}`,62,top+58,15);
    big(this.fmt(Math.max(0,(me.fin?me.fT:st.t*1000))),62,top+78,13);
    const bx=W-66, by=top; c.fillStyle="rgba(10,14,30,.55)"; c.strokeStyle="rgba(255,255,255,.8)"; c.lineWidth=2; c.beginPath(); c.roundRect(bx,by,56,56,12); c.fill(); c.stroke();
    let ic=me.item; if(me.roll>0) ic=["turbo","oil","zap","turbo3"][Math.floor(T/80)%4]; if(ic) this.drawItem(c,ic,bx+28,by+28,me.roll>0?1:me.uses);
    const mm=st.map.mini, ms=Math.min(96,W*.24), mx=W-ms-10, my=by+64; c.globalAlpha=.85; c.drawImage(mm,mx,my,ms,ms); c.globalAlpha=1;
    st.ks.forEach(k=>{ c.fillStyle=k.col; c.beginPath(); c.arc(mx+k.x/WORLD*ms,my+k.y/WORLD*ms,k.isP?4:2.6,0,7); c.fill(); if(k.isP){ c.strokeStyle="#fff"; c.lineWidth=1.5; c.stroke(); } });
    // カウントダウン・お知らせ
    if(st.phase==="count"){ const n=Math.ceil(-st.t); if(n<=3&&n>=1) big(String(n),W/2-12,H*.3,64,"#FFD84D"); }
    if(st.msg){ c.globalAlpha=Math.min(1,st.msg.t*2); c.textAlign="center"; big(st.msg.txt,W/2,H*.27,st.msg.txt.length>8?26:40,"#FFE07A"); c.textAlign="left"; c.globalAlpha=1; }
  },
  drawItem(c,k,x,y,n){ c.save(); c.translate(x,y);
    if(k==="turbo"||k==="turbo3"){ const cnt=k==="turbo3"?Math.max(1,n):1; for(let i=0;i<cnt;i++){ const ox=(i-(cnt-1)/2)*11; c.fillStyle="#FF7A1A"; c.beginPath(); c.moveTo(ox-5,8); c.lineTo(ox-5,-6); c.lineTo(ox,-14); c.lineTo(ox+5,-6); c.lineTo(ox+5,8); c.fill(); c.fillStyle="#FFD84D"; c.beginPath(); c.moveTo(ox-4,9); c.lineTo(ox,17); c.lineTo(ox+4,9); c.fill(); } }
    else if(k==="oil"){ c.fillStyle="#2A2140"; c.beginPath(); c.ellipse(0,6,18,8,0,0,7); c.fill(); c.fillStyle="#7A5CC8"; c.beginPath(); c.moveTo(0,-14); c.quadraticCurveTo(9,0,0,5); c.quadraticCurveTo(-9,0,0,-14); c.fill(); }
    else if(k==="zap"){ c.fillStyle="#FFE14D"; c.beginPath(); c.arc(0,0,14,0,7); c.fill(); c.strokeStyle="#B37400"; c.lineWidth=3; c.beginPath(); c.moveTo(-4,-9); c.lineTo(2,-1); c.lineTo(-2,1); c.lineTo(4,9); c.stroke(); }
    c.restore(); }
};
return KART;
});
