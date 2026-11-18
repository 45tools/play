// 45 Play ゲーム：one（1分体感）。開いたときだけ読み込まれる。共通の関数は index.html にある
BRAIN.def("one",`
<section data-pane="one" data-v="setup">
  <div class="vw" data-v="setup">
    <div class="panel">
      <h2 data-i="onTitle"></h2>
      <p class="lead" data-i="onLead"></p>
      <div class="opt"><span class="ol" data-i="onTarget"></span><div class="chips" id="onTgSel">
        <button class="chip" data-val="10" data-i="onS10"></button><button class="chip" data-val="30" data-i="onS30"></button><button class="chip" data-val="60" data-i="onS60"></button><button class="chip" data-val="180" data-i="onS180"></button></div></div>
      <div class="opt"><span class="ol" data-i="onStyle"></span><div class="chips" id="onStSel">
        <button class="chip" data-val="plain" data-i="onPlain"></button><button class="chip" data-val="noise" data-i="onNoise"></button><button class="chip" data-val="move" data-i="onMove"></button></div></div>
      <p class="lead" style="margin-top:0" id="onStNote"></p>
      <div class="opt" id="onLpOpt"><span class="ol" data-i="onLap"></span><div class="chips" id="onLpSel">
        <button class="chip" data-val="on" data-i="onLapOn"></button><button class="chip" data-val="off" data-i="onLapOff"></button></div></div>
      <div class="opt" id="onNzOpt"><span class="ol" data-i="onNz"></span><div class="chips" id="onNzSel">
        <button class="chip" data-val="1" data-i="onNz1"></button><button class="chip" data-val="2" data-i="onNz2"></button><button class="chip" data-val="3" data-i="onNz3"></button></div></div>
      <div class="opt"><span class="ol" data-i="onPlayers"></span><div class="chips" id="onPlSel">
        <button class="chip" data-val="1" data-i="onSolo"></button><button class="chip" data-val="2">2</button><button class="chip" data-val="3">3</button><button class="chip" data-val="4">4</button><button class="chip" data-val="5">5</button><button class="chip" data-val="6">6</button></div></div>
      <div class="opt" id="onTnOpt"><span class="ol" data-i="onTn"></span><div class="chips" id="onTnSel">
        <button class="chip" data-val="turn" data-i="onTurn"></button><button class="chip" data-val="tog" data-i="onTog"></button></div></div>
      <div class="opt"><span class="ol" data-i="onRule"></span><div class="chips" id="onRuSel">
        <button class="chip" data-val="near" data-i="onRuNear"></button><button class="chip" data-val="doban" data-i="onRuDoban"></button></div></div>
      <p class="lead" style="margin-top:0" id="onRuNote"></p>
    </div>
    <div class="panel">
      <h2 data-i="recTitle"></h2>
      <div class="onrec" id="onRec"></div>
    </div>
  </div>
  <div class="vw" data-v="play">
    <div class="phead"><button class="btn icon" id="onQuit" aria-label="quit"><i class="ic" data-ic="x"></i></button><div class="sp"></div><b id="onWho"></b><div class="sp"></div><span class="onprog" id="onProg"></span></div>
    <button class="onpad" id="onPad" type="button"><span class="onnoise" id="onNoiseBox"></span><span class="onmain" id="onMain"></span><span class="onsub" id="onSub"></span></button>
    <div class="onmulti" id="onMulti"></div>
    <div class="banner" id="onMsg"></div>
  </div>
</section>
<style>
.onpad{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:calc(100% - 20px);margin:6px 10px 0;min-height:min(58vh,440px);border:0;border-radius:28px;background:var(--panel);box-shadow:0 2px 0 var(--line);color:var(--ink);font:inherit;cursor:pointer;position:relative;overflow:hidden;touch-action:manipulation}
.onpad .onmain{font:700 clamp(30px,9vw,46px)/1.15 Fredoka,"M PLUS Rounded 1c",sans-serif;letter-spacing:.02em}
.onpad .onsub{font-size:14px;color:var(--muted);text-align:center;padding:0 18px;line-height:1.6}
.onpad.run{background:color-mix(in srgb,var(--accent) 14%,var(--panel))}
.onpad.dark{background:#10131F;color:#F2F4FA}.onpad.dark .onsub{color:#9AA3BA}
.onpad .onnoise{position:absolute;inset:0;pointer-events:none;font:700 30px Fredoka,sans-serif;color:color-mix(in srgb,var(--accent) 45%,transparent)}
.onpad .onnoise i{position:absolute;font-style:normal}
.onpad.shake{animation:onshk .35s infinite}@keyframes onshk{0%,100%{transform:translate(0,0)}25%{transform:translate(-5px,2px) rotate(-1deg)}75%{transform:translate(5px,-2px) rotate(1deg)}}
.onmulti{display:none;grid-template-columns:repeat(2,1fr);gap:8px;margin:8px 10px 0}.onmulti.on{display:grid}
.onmulti button{min-height:76px;border:0;border-radius:18px;background:#10131F;color:#F2F4FA;font:700 20px Fredoka,"M PLUS Rounded 1c",sans-serif;touch-action:manipulation}
.onmulti button.done{background:var(--panel);color:var(--ink);font-size:16px}
.onlaps{margin-top:6px;font-size:14px;line-height:1.7}
.onprog{font-size:13px;color:var(--muted);min-width:40px;text-align:right}
.onrec{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.onrec div{background:var(--bg);border-radius:12px;padding:8px 4px;text-align:center}
.onrec b{display:block;font:700 18px Fredoka,sans-serif}.onrec span{font-size:11px;color:var(--muted)}
.onrank{text-align:left;margin:6px 0 0;padding:0;list-style:none;font-size:14px}
.onrank li{display:flex;justify-content:space-between;gap:8px;padding:5px 2px;border-bottom:1px solid var(--line)}
</style>`,function(){
/* =========================================================
   1分体感：時計を見ずに、決めた時間ぴったりでストップ
   ========================================================= */
const ONE={
  s:Object.assign({tg:"60",st:"plain",pl:"1",nz:"2",tn:"turn",ru:"near",lp:"on"},store.get("p_one",{})),
  fx:0,
  st:null,rf:[],nt:0,
  save(){ store.set("p_one",this.s); },
  init(){
    if(this.s.st==="eyes") this.s.st="plain";
    this.pane=$('[data-pane="one"]');
    this.rf.push(chips($("#onTgSel"),()=>this.s.tg,v=>{this.s.tg=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#onStSel"),()=>this.s.st,v=>{this.s.st=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#onPlSel"),()=>this.s.pl,v=>{this.s.pl=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#onLpSel"),()=>this.s.lp,v=>{this.s.lp=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#onNzSel"),()=>this.s.nz,v=>{this.s.nz=v;this.save()}));
    this.rf.push(chips($("#onTnSel"),()=>this.s.tn,v=>{this.s.tn=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#onRuSel"),()=>this.s.ru,v=>{this.s.ru=v;this.save()},()=>this.refresh()));
    $("#onQuit").onclick=()=>this.quit();
    $("#onPad").addEventListener("pointerdown",e=>{ e.preventDefault(); this.tap(); });
    this.refresh();
  },
  CP:{10:[3,6,10],30:[10,20,30],60:[20,40,60],180:[60,120,180]},
  useLaps(){ const st=this.st; return st.lp&&!st.tog; },
  secLbl(x){ return x<60?x+t("onSecU"):t("onMinOnly",{m:x/60}); },
  tgLbl(v){ return t({10:"onS10",30:"onS30",60:"onS60",180:"onS180"}[v]); },
  refresh(){ this.rf.forEach(f=>f()); $("#onStNote").innerHTML=t({plain:"onPlainN",noise:"onNoiseN",move:"onMoveN"}[this.s.st]);
    $("#onNzOpt").style.display=this.s.st==="noise"?"":"none"; $("#onLpOpt").style.display=(this.s.pl!=="1"&&this.s.tn==="tog")?"none":""; $("#onTnOpt").style.display=this.s.pl!=="1"?"":"none";
    $("#onRuNote").innerHTML=t(this.s.ru==="doban"?"onRuDobanN":"onRuNearN");
    const rec=store.get("p_one_rec",{});
    $("#onRec").innerHTML=["10","30","60","180"].map(k=>{ const r=rec[k]; return `<div><b>${r?esc(this.fmtD(r.d)):"—"}</b><span>${esc(this.tgLbl(k))}</span></div>`; }).join("")+
      `<p class="lead" style="grid-column:1/-1;margin:4px 0 0;font-size:12px">${esc(t("onRecNote"))}</p>`;
    if(this.s.tg==="60"&&rec["60"]&&rec["60"].avg!=null) $("#onRec").insertAdjacentHTML("beforeend",`<p class="lead" style="grid-column:1/-1;margin:2px 0 0">${t("onMyMin",{s:esc(rec["60"].avg.toFixed(1))})}</p>`); },
  fmtD(d){ return (d<0.005?"±0.00":d.toFixed(2))+t("onSecU"); },
  fmtT(ms){ const s=ms/1000; return s<60?s.toFixed(2)+t("onSecU"):t("onMinSec",{m:Math.floor(s/60),s:(s%60).toFixed(2)}); },
  view(v){ this.pane.dataset.v=v; if(mode==="one") this.dock(); },
  dock(){ if(mode!=="one") return; if(this.pane.dataset.v==="setup") return setDock(`<button class="btn primary big" data-act="start"><i class="ic" data-ic="play"></i>${esc(t("start"))}</button>`);
    const st=this.st; if(st&&st.phase==="shown"){ const last=st.i>=st.n-1; return setDock(`<button class="btn primary big" data-act="next">${esc(t(last?(st.n>1?"onRankBtn":"onSeeRes"):"onNext"))}<i class="ic" data-ic="next"></i></button>`); }
    if(st&&st.phase==="round") return setDock(`<button class="btn big" data-act="end">${esc(t("onEnd"))}</button><button class="btn primary big" data-act="round">${esc(t("onNextRound"))}<i class="ic" data-ic="next"></i></button>`);
    setDock(""); },
  act(a){ const st=this.st; if(a==="start") this.start();
    else if(a==="next"){ if(st.i<st.n-1){ st.i++; this.ready(); } else if(st.n>1) this.roundRank(); else this.finish(); }
    else if(a==="round"){ st.rd++; st.i=0; st.res=[]; this.ready(); }
    else if(a==="end") this.finish(); },
  start(){ const n=+this.s.pl; this.st={i:0,n,rd:1,tg:+this.s.tg,style:this.s.st,nz:+this.s.nz,doban:this.s.ru==="doban",lp:this.s.lp==="on",tog:n>1&&this.s.tn==="tog",res:[],tot:Array(n).fill(0),wins:Array(n).fill(0)}; this.view("play"); this.ready(); },
  key(x){ return (this.st.doban&&x.diff>0?1e6:0)+x.ad; },
  dob(x){ return this.st.doban&&x.diff>0; },
  // 1周ごとの順位発表（この周の差と、ここまでの合計の差）
  roundRank(){ const st=this.st; st.phase="round"; this.noise(false);
    const order=st.res.map((x,i)=>({...x,i})).sort((a,b)=>this.key(a)-this.key(b)); if(!this.dob(order[0])) st.wins[order[0].i]++; else order.allOut=true;
    if(st.doban) order.forEach(x=>{ if(this.dob(x)) st.out=(st.out||Array(st.n).fill(0)), st.out[x.i]++; });
    const tot=st.tot.map((d,i)=>({d,i})).sort((a,b)=>a.d-b.d);
    $("#onWho").textContent=t("onRoundN",{n:st.rd}); $("#onProg").textContent="";
    this.pad("",order.allOut?t("onAllOut"):t("onRoundTop",{p:t("onPlayerN",{n:order[0].i+1})}),
      `<ol class="onrank">${order.map((x,k)=>`<li><span>${["🥇","🥈","🥉"][k]||(k+1)+"."} ${esc(t("onPlayerN",{n:x.i+1}))}</span><b>${this.dob(x)?esc(t("onDobanS"))+" ":""}${x.ad<=.1?"🎯 ":""}${x.diff<0?"−":"+"}${esc(this.fmtD(x.ad))}</b></li>`).join("")}</ol>`+
      (st.rd>1?`<div style="margin-top:10px;font-weight:700">${esc(t("onTotalT",{n:st.rd}))}</div><ol class="onrank">${tot.map((x,k)=>`<li><span>${k+1}. ${esc(t("onPlayerN",{n:x.i+1}))}</span><b>${esc(this.fmtD(x.d))}</b></li>`).join("")}</ol>`:""));
    $("#onMsg").innerHTML=""; $("#onMulti").className="onmulti"; sfx.win(); this.dock(); },
  who(){ const st=this.st; return st.n>1?t("onPlayerN",{n:st.i+1}):""; },
  pad(cls,main,sub){ const p=$("#onPad"); p.className="onpad "+(cls||""); $("#onMain").textContent=main; $("#onSub").innerHTML=sub||""; },
  ready(){ const st=this.st; st.phase="ready"; this.noise(false); st.laps=[]; $("#onMulti").className="onmulti"; $("#onMulti").innerHTML="";
    if(st.tog){ $("#onWho").textContent=t("onTogAll"); $("#onProg").textContent=t("onRoundN",{n:st.rd}); $("#onMsg").innerHTML="";
      this.pad("",t("onTapStartAll"),t("onTogSub",{t:esc(this.tgLbl(st.tg))})); this.dock(); return; }
    $("#onWho").textContent=this.who(); $("#onProg").textContent=st.n>1?`${t("onRoundN",{n:st.rd})} ${st.i+1}/${st.n}`:""; $("#onMsg").innerHTML="";
    this.pad("",t("onTapStart"),(this.useLaps()?t("onLapsSub",{l:esc(this.CP[st.tg].map(x=>this.secLbl(x)).join("・"))}):t("onReadySub",{t:esc(this.tgLbl(st.tg))}))+(st.style==="move"?"<br>"+t("onMoveTip"):"")); this.dock(); },
  tap(){ const st=this.st; if(!st) return;
    if(st.phase==="ready"){ st.phase="run"; st.t0=now(); sfx.tap(); try{ navigator.vibrate&&navigator.vibrate(60); }catch(e){}
      if(st.tog){ this.pad("run dark",t("onStop"),t("onTogRun")); this.multi(); }
      else if(this.useLaps()) this.pad("run dark",t("onTapAt",{s:esc(this.secLbl(this.CP[st.tg][0]))}),t("onRunSub"));
      else this.pad("run dark",t("onStop"),st.style==="move"?t("onMoveRun"):t("onRunSub"));
      if(st.style==="noise") this.noise(true); this.dock(); return; }
    if(st.phase==="run"&&!st.tog){ const ms=now()-st.t0; if(ms<400) return;
      if(this.useLaps()){ const cp=this.CP[st.tg]; if(st.laps.length<cp.length-1){ if(st.laps.length&&ms-st.laps[st.laps.length-1]<300) return; st.laps.push(ms); sfx.tap(); try{ navigator.vibrate&&navigator.vibrate(30); }catch(e){}
        $("#onMain").textContent=t("onTapAt",{s:this.secLbl(cp[st.laps.length])}); return; } }
      this.noise(false); this.stop(ms); }
    if(st.phase==="round") return; },
  // じゃまあり：ふざけた「ぷっ」音を不規則なリズムで鳴らす（数えるリズムを崩す）
  // じゃまあり：長さがバラバラの「ぷっ」と、いろいろなへんな音を不規則に鳴らす
  snd(fn){ if(!store.get("b_snd",true)) return; const a=ac(); if(!a) return; try{ fn(a,a.currentTime); }catch(e){} },
  osc(a,t0,type,f1,f2,d,v,dest){ const o=a.createOscillator(),g=a.createGain(); o.type=type; o.frequency.setValueAtTime(f1,t0); o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t0+d);
    g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(v,t0+.015); g.gain.exponentialRampToValueAtTime(.0001,t0+d); o.connect(g); g.connect(dest||a.destination); o.start(t0); o.stop(t0+d+.05); return o; },
  fart(){ this.snd((a,t0)=>{ const r=Math.random(), d=r<.35?.06+Math.random()*.1:r<.75?.2+Math.random()*.4:.7+Math.random()*1.3, f0=60+Math.random()*110;
    const o=a.createOscillator(),g=a.createGain(),lf=a.createOscillator(),lg=a.createGain(),fl=a.createBiquadFilter();
    o.type="sawtooth"; o.frequency.setValueAtTime(f0*(1.1+Math.random()*.6),t0); o.frequency.exponentialRampToValueAtTime(f0*(.4+Math.random()*.4),t0+d);
    lf.type="square"; lf.frequency.setValueAtTime(14+Math.random()*30,t0); lf.frequency.linearRampToValueAtTime(8+Math.random()*40,t0+d); lg.gain.value=f0*.5; lf.connect(lg); lg.connect(o.frequency);
    fl.type="lowpass"; fl.frequency.value=400+Math.random()*700; fl.Q.value=3+Math.random()*4;
    g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(.38,t0+.02);
    if(d>.6){ for(let k=1;k<5;k++) g.gain.linearRampToValueAtTime(.12+Math.random()*.28,t0+d*k/5); } else g.gain.setValueAtTime(.3,t0+d*.7);
    g.gain.exponentialRampToValueAtTime(.0001,t0+d); o.connect(fl); fl.connect(g); g.connect(a.destination); o.start(t0); lf.start(t0); o.stop(t0+d+.05); lf.stop(t0+d+.05); }); },
  // そのほかのへんな音
  boing(){ this.snd((a,t0)=>{ const o=this.osc(a,t0,"sine",180,520,.45,.3); o.frequency.setValueAtTime(180,t0); for(let k=0;k<6;k++) o.frequency.linearRampToValueAtTime(k%2?220:520-k*40,t0+.07*(k+1)); }); },
  honk(){ this.snd((a,t0)=>{ this.osc(a,t0,"square",330,310,.28,.12); this.osc(a,t0+.33,"square",330,300,.28,.12); }); },
  slide(){ this.snd((a,t0)=>{ const up=Math.random()<.5; this.osc(a,t0,"triangle",up?250:1200,up?1400:180,.5+Math.random()*.4,.22); }); },
  cuckoo(){ this.snd((a,t0)=>{ this.osc(a,t0,"sine",660,640,.22,.25); this.osc(a,t0+.28,"sine",520,510,.32,.25); }); },
  pop(){ this.snd((a,t0)=>{ for(let k=0;k<2+rnd(4);k++) this.osc(a,t0+k*.09,"sine",900+Math.random()*900,200,.07,.25); }); },
  tick(){ this.snd((a,t0)=>{ const n=3+rnd(6),iv=.25+Math.random()*.6; for(let k=0;k<n;k++) this.osc(a,t0+k*iv,"square",1800,1700,.03,.1); }); },
  burp(){ this.snd((a,t0)=>{ const fl=a.createBiquadFilter(); fl.type="bandpass"; fl.frequency.value=300; fl.Q.value=2; fl.connect(a.destination); this.osc(a,t0,"sawtooth",110,70,.5+Math.random()*.4,.5,fl); }); },
  weird(){ const L=["boing","honk","slide","cuckoo","pop","tick","burp"]; this[L[rnd(L.length)]](); },
  fartLoop(){ clearTimeout(this.fx); const go=()=>{ const r=Math.random();
      if(r<.5){ this.fart(); if(Math.random()<.3) setTimeout(()=>this.fart(),80+Math.random()*350); } else this.weird();
      this.fx=setTimeout(go,350+Math.random()*2600); }; this.fx=setTimeout(go,300+Math.random()*1200); },
  noise(on){ clearInterval(this.nt); clearTimeout(this.fx); clearTimeout(this.vt); try{ window.speechSynthesis&&speechSynthesis.cancel(); }catch(e){} $("#onPad").classList.remove("shake"); const box=$("#onNoiseBox"); box.innerHTML=""; if(!on) return;
    const lv=this.st?this.st.nz:2; if(lv>=2) this.fartLoop();
    if(lv>=3){ $("#onPad").classList.add("shake"); const v=()=>{ this.voice(); this.vt=setTimeout(v,1200+Math.random()*2500); }; this.vt=setTimeout(v,800); }
    // じゃまあり：数字があちこちに出て、頭の中で数えるのをじゃまする
    this.nt=setInterval(()=>{ const i=document.createElement("i"); i.textContent=1+rnd(59); i.style.left=(5+rnd(80))+"%"; i.style.top=(5+rnd(80))+"%";
      box.appendChild(i); if(box.children.length>4) box.firstChild.remove(); },650+rnd(500)); },
  stop(ms){ const st=this.st,tg=st.tg*1000,diff=(ms-tg)/1000,ad=Math.abs(diff); st.phase="shown"; const laps=(st.laps||[]).concat(ms); st.res.push({ms,ad,diff,laps}); if(st.tot) st.tot[st.i]+=ad;
    try{ navigator.vibrate&&navigator.vibrate([40,60,40]); }catch(e){}
    const g=ad/st.tg; const grade=g<=.02?"onG1":g<=.05?"onG2":g<=.12?"onG3":"onG4";
    g<=.05?sfx.ok():sfx.tap();
    let sub=t(diff<0?"onEarly":"onLate",{d:esc(this.fmtD(ad))});
    if(this.useLaps()){ const cp=this.CP[st.tg]; sub=`<div class="onlaps">${laps.map((x,k)=>{ const d=x/1000-cp[k]; return `${esc(this.secLbl(cp[k]))} → <b>${esc(this.fmtT(x))}</b>（${d<0?"−":"+"}${esc(this.fmtD(Math.abs(d)))}）`; }).join("<br>")}</div>`; }
    this.pad("",this.fmtT(ms),sub);
    const near=ad<=0.10, dob=this.dob({diff});
    if(near) sfx.win();
    $("#onMsg").innerHTML=dob?`<span class="ngc">${esc(t("onDoban"))}</span>`:near?`<span class="gold">${esc(t("onNear"))}</span>`:`<span class="${g<=.05?"okc":g<=.12?"gold":"ngc"}">${esc(t(grade))}</span>`;
    this.saveRec(ms,ad); this.dock(); },
  saveRec(ms,ad){ const st=this.st; if(!["plain","noise","move"].includes(st.style)) return;
    const rec=store.get("p_one_rec",{}),k=String(st.tg),r=rec[k]||{d:null,h:[]};
    st.best=st.best||{}; if(r.d==null||ad<r.d){ r.d=ad; st.best[st.i]=true; }
    r.h=(r.h||[]).concat(ms/1000).slice(-10); r.avg=r.h.reduce((a,x)=>a+x,0)/r.h.length*(60/st.tg);
    rec[k]=r; store.set("p_one_rec",rec); },
  finish(){ const st=this.st,r=st.res; this.view("setup"); this.refresh();
    if(st.n===1){ const x=r[0]; showResult({title:t("tOne"),big:this.fmtT(x.ms),bigLbl:t("onTarget")+"："+this.tgLbl(st.tg),isBest:!!(st.best&&st.best[0]),
        stats:[[t("onDiff"),(x.diff<0?"−":"+")+this.fmtD(x.ad)],[t("onBestL"),this.fmtD(store.get("p_one_rec",{})[st.tg].d)]],retry:()=>this.start()}); }
    else { const order=st.tot.map((d,i)=>({d,i,w:st.wins[i]})).sort((a,b)=>a.d-b.d);
      const list=`<ol class="onrank">${order.map((x,k)=>`<li><span>${k+1}. ${esc(t("onPlayerN",{n:x.i+1}))}</span><b>${esc(this.fmtD(x.d))}（${esc(t("onWinsN",{n:x.w}))}）</b></li>`).join("")}</ol>`;
      showResult({title:t("tOne"),big:t("onPlayerN",{n:order[0].i+1}),bigLbl:t("onWinner"),isBest:false,stats:[[t("onTarget"),this.tgLbl(st.tg)],[t("onRounds"),String(st.rd)]],extra:list,retry:()=>this.start()}); }
    this.st=null; },
  quit(){ this.noise(false); $("#onMulti").className="onmulti"; this.st=null; this.view("setup"); this.refresh(); }
};
return ONE;
});
