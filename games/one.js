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
      <div class="opt"><span class="ol" data-i="onPlayers"></span><div class="chips" id="onPlSel">
        <button class="chip" data-val="1" data-i="onSolo"></button><button class="chip" data-val="2">2</button><button class="chip" data-val="3">3</button><button class="chip" data-val="4">4</button><button class="chip" data-val="5">5</button><button class="chip" data-val="6">6</button></div></div>
    </div>
    <div class="panel">
      <h2 data-i="recTitle"></h2>
      <div class="onrec" id="onRec"></div>
    </div>
  </div>
  <div class="vw" data-v="play">
    <div class="phead"><button class="btn icon" id="onQuit" aria-label="quit"><i class="ic" data-ic="x"></i></button><div class="sp"></div><b id="onWho"></b><div class="sp"></div><span class="onprog" id="onProg"></span></div>
    <button class="onpad" id="onPad" type="button"><span class="onnoise" id="onNoiseBox"></span><span class="onmain" id="onMain"></span><span class="onsub" id="onSub"></span></button>
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
  s:Object.assign({tg:"60",st:"plain",pl:"1"},store.get("p_one",{})),
  fx:0,
  st:null,rf:[],nt:0,
  save(){ store.set("p_one",this.s); },
  init(){
    if(this.s.st==="eyes") this.s.st="plain";
    this.pane=$('[data-pane="one"]');
    this.rf.push(chips($("#onTgSel"),()=>this.s.tg,v=>{this.s.tg=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#onStSel"),()=>this.s.st,v=>{this.s.st=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#onPlSel"),()=>this.s.pl,v=>{this.s.pl=v;this.save()}));
    $("#onQuit").onclick=()=>this.quit();
    $("#onPad").addEventListener("pointerdown",e=>{ e.preventDefault(); this.tap(); });
    this.refresh();
  },
  tgLbl(v){ return t({10:"onS10",30:"onS30",60:"onS60",180:"onS180"}[v]); },
  refresh(){ this.rf.forEach(f=>f()); $("#onStNote").innerHTML=t({plain:"onPlainN",noise:"onNoiseN",move:"onMoveN"}[this.s.st]);
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
  start(){ const n=+this.s.pl; this.st={i:0,n,rd:1,tg:+this.s.tg,style:this.s.st,res:[],tot:Array(n).fill(0),wins:Array(n).fill(0)}; this.view("play"); this.ready(); },
  // 1周ごとの順位発表（この周の差と、ここまでの合計の差）
  roundRank(){ const st=this.st; st.phase="round"; this.noise(false);
    const order=st.res.map((x,i)=>({...x,i})).sort((a,b)=>a.ad-b.ad); st.wins[order[0].i]++;
    const tot=st.tot.map((d,i)=>({d,i})).sort((a,b)=>a.d-b.d);
    $("#onWho").textContent=t("onRoundN",{n:st.rd}); $("#onProg").textContent="";
    this.pad("",t("onRoundTop",{p:t("onPlayerN",{n:order[0].i+1})}),
      `<ol class="onrank">${order.map((x,k)=>`<li><span>${["🥇","🥈","🥉"][k]||(k+1)+"."} ${esc(t("onPlayerN",{n:x.i+1}))}</span><b>${x.diff<0?"−":"+"}${esc(this.fmtD(x.ad))}</b></li>`).join("")}</ol>`+
      (st.rd>1?`<div style="margin-top:10px;font-weight:700">${esc(t("onTotalT",{n:st.rd}))}</div><ol class="onrank">${tot.map((x,k)=>`<li><span>${k+1}. ${esc(t("onPlayerN",{n:x.i+1}))}</span><b>${esc(this.fmtD(x.d))}</b></li>`).join("")}</ol>`:""));
    $("#onMsg").innerHTML=""; sfx.win(); this.dock(); },
  who(){ const st=this.st; return st.n>1?t("onPlayerN",{n:st.i+1}):""; },
  pad(cls,main,sub){ const p=$("#onPad"); p.className="onpad "+(cls||""); $("#onMain").textContent=main; $("#onSub").innerHTML=sub||""; },
  ready(){ const st=this.st; st.phase="ready"; this.noise(false);
    $("#onWho").textContent=this.who(); $("#onProg").textContent=st.n>1?`${t("onRoundN",{n:st.rd})} ${st.i+1}/${st.n}`:""; $("#onMsg").innerHTML="";
    this.pad("",t("onTapStart"),t("onReadySub",{t:esc(this.tgLbl(st.tg))})+(st.style==="move"?"<br>"+t("onMoveTip"):"")); this.dock(); },
  tap(){ const st=this.st; if(!st) return;
    if(st.phase==="ready"){ st.phase="run"; st.t0=now(); sfx.tap(); try{ navigator.vibrate&&navigator.vibrate(60); }catch(e){}
      this.pad("run dark",t("onStop"),st.style==="move"?t("onMoveRun"):t("onRunSub"));
      if(st.style==="noise") this.noise(true); this.dock(); return; }
    if(st.phase==="run"){ const ms=now()-st.t0; if(ms<400) return; this.noise(false); this.stop(ms); }
    if(st.phase==="round") return; },
  // じゃまあり：ふざけた「ぷっ」音を不規則なリズムで鳴らす（数えるリズムを崩す）
  fart(){ if(!store.get("b_snd",true)) return; const a=ac(); if(!a) return;
    try{ const t0=a.currentTime,d=.18+Math.random()*.5,f0=70+Math.random()*90;
      const o=a.createOscillator(),g=a.createGain(),lf=a.createOscillator(),lg=a.createGain(),fl=a.createBiquadFilter();
      o.type="sawtooth"; o.frequency.setValueAtTime(f0*1.4,t0); o.frequency.exponentialRampToValueAtTime(f0*.6,t0+d);
      lf.type="square"; lf.frequency.value=18+Math.random()*25; lg.gain.value=f0*.5; lf.connect(lg); lg.connect(o.frequency);
      fl.type="lowpass"; fl.frequency.value=500+Math.random()*500; fl.Q.value=4;
      g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(.35,t0+.02); g.gain.setValueAtTime(.3,t0+d*.7); g.gain.exponentialRampToValueAtTime(.0001,t0+d);
      o.connect(fl); fl.connect(g); g.connect(a.destination); o.start(t0); lf.start(t0); o.stop(t0+d+.05); lf.stop(t0+d+.05); }catch(e){} },
  fartLoop(){ clearTimeout(this.fx); const go=()=>{ this.fart(); if(Math.random()<.3) setTimeout(()=>this.fart(),120+Math.random()*200); this.fx=setTimeout(go,500+Math.random()*2800); }; this.fx=setTimeout(go,300+Math.random()*1500); },
  noise(on){ clearInterval(this.nt); clearTimeout(this.fx); const box=$("#onNoiseBox"); box.innerHTML=""; if(!on) return; this.fartLoop();
    // じゃまあり：数字があちこちに出て、頭の中で数えるのをじゃまする
    this.nt=setInterval(()=>{ const i=document.createElement("i"); i.textContent=1+rnd(59); i.style.left=(5+rnd(80))+"%"; i.style.top=(5+rnd(80))+"%";
      box.appendChild(i); if(box.children.length>4) box.firstChild.remove(); },650+rnd(500)); },
  stop(ms){ const st=this.st,tg=st.tg*1000,diff=(ms-tg)/1000,ad=Math.abs(diff); st.phase="shown"; st.res.push({ms,ad,diff}); if(st.tot) st.tot[st.i]+=ad;
    try{ navigator.vibrate&&navigator.vibrate([40,60,40]); }catch(e){}
    const g=ad/st.tg; const grade=g<=.02?"onG1":g<=.05?"onG2":g<=.12?"onG3":"onG4";
    g<=.05?sfx.ok():sfx.tap();
    this.pad("",this.fmtT(ms),t(diff<0?"onEarly":"onLate",{d:esc(this.fmtD(ad))}));
    $("#onMsg").innerHTML=`<span class="${g<=.05?"okc":g<=.12?"gold":"ngc"}">${esc(t(grade))}</span>`;
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
  quit(){ this.noise(false); this.st=null; this.view("setup"); this.refresh(); }
};
return ONE;
});
