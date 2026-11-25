// 45 Play ゲーム：anzan（瞬間暗算）。開いたときだけ読み込まれる。共通の関数は index.html にある
BRAIN.def("anzan",`
<section data-pane="anzan" data-v="setup">
  <div class="vw" data-v="setup">
    <div class="panel">
      <h2 data-i="azTitle"></h2>
      <p class="lead" data-i="azLead"></p>
      <div class="opt"><span class="ol" data-i="azMode"></span><div class="chips" id="azMdSel">
        <button class="chip" data-val="test" data-i="azTest"></button><button class="chip" data-val="judge" data-i="azJudge"></button><button class="chip" data-val="free" data-i="azFree"></button></div></div>
      <p class="lead" style="margin-top:4px" id="azMdNote"></p>
      <div id="azTestOpt">
        <div class="azlv"><button class="btn icon" id="azLvDn" aria-label="down">◀</button><div class="azlvc"><b id="azLvName"></b><span id="azLvSpec"></span></div><button class="btn icon" id="azLvUp" aria-label="up">▶</button></div>
        <p class="lead azlvnote" id="azLvNote"></p>
      </div>
      <div id="azJudgeOpt"><div class="opt"><span class="ol" data-i="azStartLv"></span><div class="chips" id="azJsSel"></div></div></div>
      <div id="azFreeOpt">
        <div class="opt"><span class="ol" data-i="azDig"></span><div class="chips" id="azFdSel"><button class="chip" data-val="1">1</button><button class="chip" data-val="2">2</button><button class="chip" data-val="3">3</button></div></div>
        <div class="opt"><span class="ol" data-i="azCnt"></span><div class="stepper"><button class="btn icon" id="azFcDn">−</button><b class="num" id="azFc"></b><button class="btn icon" id="azFcUp">＋</button></div></div>
        <div class="opt"><span class="ol" data-i="azSec"></span><div class="stepper"><button class="btn icon" id="azFsDn">−</button><b class="num" id="azFs"></b><button class="btn icon" id="azFsUp">＋</button></div></div>
      </div>
      <div class="opt"><span class="ol" data-i="azAns"></span><div class="chips" id="azAnSel"><button class="chip" data-val="in" data-i="azAnsIn"></button><button class="chip" data-val="vo" data-i="azAnsVo"></button></div></div>
      <p class="lead" style="margin-top:4px" id="azAnNote"></p>
    </div>
    <div class="panel">
      <h2 data-i="recTitle"></h2>
      <div class="azrec" id="azRec"></div>
      <p class="lead" style="margin:8px 0 0;font-size:12px" data-i="azNote"></p>
    </div>
  </div>
  <div class="vw" data-v="play">
    <div class="phead"><button class="btn icon" id="azQuit" aria-label="quit"><i class="ic" data-ic="x"></i></button><div class="azhd"><b id="azHdLv"></b><span id="azHdSpec"></span></div><div class="sp"></div><span class="azprog" id="azProg"></span></div>
    <div class="azbox" id="azBox"><div class="azmain" id="azMain"></div></div>
    <div class="banner" id="azMsg"></div>
  </div>
</section>
<style>
.azlv{display:flex;align-items:center;gap:8px;margin-top:12px}
.azlv .btn{font-size:16px}
.azlvc{flex:1;text-align:center;background:var(--soft);border-radius:14px;padding:8px 6px;min-width:0}
.azlvc b{display:block;font-size:26px;line-height:1.2;color:var(--accent)}
.azlvc span{font-size:13px;color:var(--muted)}
.azlvnote{margin-top:6px;min-height:1.6em}
.azrec{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.azrec div{background:var(--bg);border-radius:12px;padding:8px 4px;text-align:center}
.azrec b{display:block;font-size:22px;color:var(--accent)}.azrec span{font-size:11px;color:var(--muted)}
.azhd{display:flex;flex-direction:column;line-height:1.15;min-width:0}
.azhd b{font-size:18px}.azhd span{font-size:11px;color:var(--muted)}
.azprog{font-size:14px;color:var(--muted);text-align:right;white-space:nowrap}
.azprog i{font-style:normal;display:inline-block;width:12px;text-align:center;font-weight:800}
.azprog i.o{color:var(--ok)}.azprog i.x{color:var(--danger)}
.azbox{margin:6px 10px 0;height:min(44vh,360px);border-radius:28px;background:var(--panel);box-shadow:0 2px 0 var(--line);display:flex;align-items:center;justify-content:center;overflow:hidden;user-select:none;-webkit-user-select:none}
@supports (height:100dvh){.azbox{height:min(44dvh,360px)}}
.azbox.dark{background:#10131F;color:#F2F4FA}
.azbox.okf{background:color-mix(in srgb,var(--ok) 16%,var(--panel))}
.azbox.ngf{background:color-mix(in srgb,var(--danger) 14%,var(--panel))}
.azmain{font:700 clamp(84px,30vw,190px)/1 Fredoka,"M PLUS Rounded 1c",sans-serif;font-variant-numeric:tabular-nums;letter-spacing:.02em;text-align:center}
.azmain .neg{color:#FF7A8A}
.azmain.sm{font-size:clamp(22px,6.5vw,30px);line-height:1.5;font-family:"M PLUS Rounded 1c",sans-serif}
.azmain.ans{font-size:clamp(60px,20vw,120px)}
.azmain .q{display:block;font:700 18px "M PLUS Rounded 1c",sans-serif;color:var(--muted);margin-bottom:6px;letter-spacing:0}
.azmain .cur{color:var(--accent)}
.azdots{display:flex;gap:18px}.azdots i{width:22px;height:22px;border-radius:50%;background:#3A4160}.azdots i.on{background:var(--accent)}
.azsoro{height:min(36vh,300px);display:block}
.azsum{display:block;margin-top:4px;font-size:13px;color:var(--muted);line-height:1.5;word-break:break-all}
.azsum b{color:var(--ink)}
</style>`,function(){
/* =========================================================
   瞬間暗算：次々に出る数を頭の中でたして、合計を答える
   級は、フラッシュ暗算の検定でよく使われる基準（けた・口数・秒数）を参考にした目安
   k: img＝そろばんの玉の絵（たし算だけ・合計9まで） / nc1＝1けた・ひき算まじり・繰り上がりなし
      ten＝10・20…90のひき算まじり / nc2＝2けた・各位とも繰り上がりなし / n＝ふつうのたし算
   ========================================================= */
const LV=[ // [名前, けた, 口数, 秒, 種類]  0＝20級 … 19＝1級, 20＝初段, 21＝2段 … 39＝20段
 ["k20",1,3,5,"img4"],["k19",1,3,5,"img"],["k18",1,5,7,"img"],["k17",1,8,10,"nc1"],["k16",1,10,12,"nc1"],["k15",1,12,15,"nc1"],["k14",1,15,15,"nc1"],["k13",1,20,15,"nc1"],
 ["k12",2,10,10,"ten"],["k11",2,15,15,"nc2"],["k10",2,2,4,"n"],["k9",2,3,6,"n"],["k8",2,4,7,"n"],["k7",2,5,8,"n"],["k6",2,6,9,"n"],["k5",2,7,10,"n"],["k4",2,8,11,"n"],["k3",2,10,12,"n"],["k2",2,12,12,"n"],["k1",2,15,13,"n"],
 ["d1",2,15,10,"n"],["d2",3,4,4,"n"],["d3",3,6,5,"n"],["d4",3,8,6,"n"],["d5",3,10,7,"n"],["d6",3,12,8,"n"],["d7",3,15,8,"n"],["d8",3,15,6,"n"],["d9",3,15,4.5,"n"],["d10",3,15,3,"n"],
 ["d11",3,15,2.8,"n"],["d12",3,15,2.6,"n"],["d13",3,15,2.4,"n"],["d14",3,15,2.2,"n"],["d15",3,15,2,"n"],["d16",3,15,1.9,"n"],["d17",3,15,1.8,"n"],["d18",3,15,1.7,"n"],["d19",3,15,1.6,"n"],["d20",3,15,1.5,"n"]
].map(([id,d,c,s,k])=>({id,d,c,s,k}));
const TOP=LV.length-1;
const SECS=[1,1.5,2,2.5,3,3.5,4,5,6,7,8,9,10,12,15,20];
const JS=[0,10,20,29]; // 級判定のはじめる級：20級・10級・初段・10段

const AZ={
  s:Object.assign({md:"test",lv:0,js:"0",fd:"1",fc:5,fs:5,an:"in"},store.get("p_az",{})),
  st:null,rf:[],raf:0,
  save(){ store.set("p_az",this.s); },
  rec(){ return Object.assign({pass:-1,judge:null},store.get("p_az_rec",{})); },
  lvName(i){ const id=LV[i].id, n=id.slice(1); return id[0]==="k"?t("azKyu",{n}):n==="1"?t("azShodan"):t("azDan",{n}); },
  spec(L){ return t("azSpec",{d:L.d,c:L.c,s:L.s}); },
  init(){
    this.pane=$('[data-pane="anzan"]');
    const r=this.rec(); if(store.get("p_az",null)==null) this.s.lv=Math.min(TOP,r.pass+1);
    this.rf.push(chips($("#azMdSel"),()=>this.s.md,v=>{this.s.md=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#azFdSel"),()=>this.s.fd,v=>{this.s.fd=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#azAnSel"),()=>this.s.an,v=>{this.s.an=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#azJsSel"),()=>this.s.js,v=>{this.s.js=v;this.save()}));
    const step=(id,f)=>$(id).onclick=()=>{ f(); this.save(); sfx.tap(); this.refresh(); };
    step("#azLvDn",()=>this.s.lv=Math.max(0,this.s.lv-1)); step("#azLvUp",()=>this.s.lv=Math.min(TOP,this.s.lv+1));
    step("#azFcDn",()=>this.s.fc=Math.max(2,this.s.fc-1)); step("#azFcUp",()=>this.s.fc=Math.min(30,this.s.fc+1));
    const si=()=>Math.max(0,SECS.indexOf(+this.s.fs));
    step("#azFsDn",()=>this.s.fs=SECS[Math.max(0,si()-1)]); step("#azFsUp",()=>this.s.fs=SECS[Math.min(SECS.length-1,si()+1)]);
    $("#azQuit").onclick=()=>this.quit();
    this.refresh();
  },
  refresh(){
    $("#azJsSel").innerHTML=JS.map(i=>`<button class="chip" data-val="${i}">${esc(this.lvName(i))}</button>`).join("");
    this.rf.forEach(f=>f());
    const md=this.s.md;
    $("#azMdNote").innerHTML=t({test:"azTestN",judge:"azJudgeN",free:"azFreeN"}[md]);
    $("#azTestOpt").hidden=md!=="test"; $("#azJudgeOpt").hidden=md!=="judge"; $("#azFreeOpt").hidden=md!=="free";
    const r=this.rec(), L=LV[this.s.lv];
    $("#azLvName").textContent=this.lvName(this.s.lv)+(r.pass>=this.s.lv?" ✓":"");
    $("#azLvSpec").textContent=this.spec(L);
    $("#azLvNote").innerHTML=L.k.startsWith("img")?t("azImgN"):(L.k==="nc1"||L.k==="ten"||L.k==="nc2")?t("azNcN"):"";
    $("#azLvDn").disabled=this.s.lv<=0; $("#azLvUp").disabled=this.s.lv>=TOP;
    $("#azFc").textContent=t("azCntN",{n:this.s.fc}); $("#azFs").textContent=t("azSecN",{s:this.s.fs});
    $("#azAnNote").innerHTML=this.s.an==="vo"?t("azAnsVoN"):"";
    $("#azRec").innerHTML=`<div><b>${esc(r.pass>=0?this.lvName(r.pass):t("azNone"))}</b><span>${esc(t("azRecPass"))}</span></div>`+
      `<div><b>${esc(r.judge==null?t("azNone"):r.judge>=0?this.lvName(r.judge):t("azJudgeNo",{lv:this.lvName(r.jfrom||0)}))}</b><span>${esc(t("azRecJudge"))}</span></div>`;
  },
  view(v){ this.pane.dataset.v=v; if(mode==="anzan") this.dock(); },
  dock(){ if(mode!=="anzan") return;
    if(this.pane.dataset.v==="setup") return setDock(`<button class="btn primary big" data-act="start"><i class="ic" data-ic="play"></i>${esc(t("start"))}</button>`);
    const st=this.st; if(!st) return setDock("");
    if(st.phase==="answer"){ if(st.an==="in") return setDock(kpHTML(t("answer"),!st.typed),true);
      return setDock(`<button class="btn primary big" data-act="reveal">${esc(t("azSeeAns"))}</button>`); }
    if(st.phase==="self") return setDock(`<div class="row2"><button class="btn big" data-act="wrong">✕ ${esc(t("azWrong"))}</button><button class="btn primary big" data-act="right">◯ ${esc(t("azRight"))}</button></div>`,true);
    if(st.phase==="shown"){ const last=this.isLast();
      return setDock(`<div class="row2">${st.md==="free"?`<button class="btn big" data-act="replay"><i class="ic" data-ic="repeat"></i>${esc(t("azReplay"))}</button>`:""}<button class="btn primary big" data-act="next">${esc(t(last?"seeResult":"next"))}<i class="ic" data-ic="next"></i></button></div>`,true); }
    setDock(""); },
  isLast(){ const st=this.st; return st.md==="test"?st.q>=st.n-1:st.md==="judge"?!!st.over:false; },
  act(a){ const st=this.st;
    if(a==="start") return this.start(this.s.md, this.s.md==="test"?this.s.lv:+this.s.js);
    if(!st) return;
    if(a==="reveal"&&st.phase==="answer"){ st.phase="self"; this.showAns(null); this.dock(); }
    else if((a==="right"||a==="wrong")&&st.phase==="self") this.judge(a==="right");
    else if(a==="next"&&st.phase==="shown") this.next();
    else if(a==="replay"&&st.phase==="shown"){ this.play(true); } },
  key(k){ const st=this.st; if(!st) return;
    if(st.phase==="shown"){ if(k==="ok") this.next(); return; }
    if(st.phase!=="answer"||st.an!=="in") return;
    if(k==="del") st.typed=st.typed.slice(0,-1);
    else if(k==="ok"){ if(st.typed) this.judge(+st.typed===st.sum); return; }
    else if(/^[0-9]$/.test(k)&&st.typed.length<7) st.typed=(st.typed==="0"?"":st.typed)+k;
    this.paintAns(); this.dock(); },
  /* ---------- 問題を作る ---------- */
  gen(L){ const c=L.c,k=L.k,out=[]; let s=0,prev=null;
    const pick=(a,b)=>a+rnd(b-a+1);
    for(let i=0;i<c;i++){ let x=0;
      for(let tr=0;tr<12;tr++){
        if(k==="img"||k==="img4"){ const left=9-s-Math.ceil((c-1-i)*1.5); const hi=Math.min(k==="img4"?4:9,left); x=pick(1,Math.max(1,hi)); }
        else if(k==="nc1"||k==="ten"){ const m=k==="ten"?10:1, v=s/m, canP=v<9, canM=v>0&&i>0; const plus=canP&&(!canM||Math.random()<.55);
          x=(plus?pick(1,9-v):-pick(1,v))*m; }
        else if(k==="nc2"){ const T=Math.floor(s/10),O=s%10, canP=T<9, canM=T>0&&i>0; const plus=canP&&(!canM||Math.random()<.55);
          x=plus?pick(1,9-T)*10+pick(0,9-O):-(pick(1,T)*10+pick(0,O)); }
        else { const lo=L.d===1?1:10**(L.d-1); x=pick(lo,10**L.d-1); }
        if(x!==prev) break; }
      out.push(x); s+=x; prev=x; }
    return out; },
  /* ---------- 進め方 ---------- */
  start(md,lv){ const an=this.s.an;
    const L=md==="free"?{id:"free",d:+this.s.fd,c:this.s.fc,s:+this.s.fs,k:"n"}:LV[lv];
    this.st={md,an,lv,L,q:0,n:md==="test"?10:0,ok:0,cnt:0,marks:[],jc:0,jw:0,passed:-1,jfrom:lv,typed:""};
    this.view("play"); this.newQ(); },
  newQ(){ const st=this.st; st.nums=this.gen(st.L); st.sum=st.nums.reduce((a,x)=>a+x,0); st.typed=""; this.play(false); },
  head(){ const st=this.st;
    $("#azHdLv").textContent=st.md==="free"?t("azFree"):this.lvName(st.lv); $("#azHdSpec").textContent=this.spec(st.L);
    const mk=a=>a.map(x=>`<i class="${x?"o":"x"}">${x?"◯":"✕"}</i>`).join("");
    $("#azProg").innerHTML=st.md==="test"?`${mk(st.marks)}<span style="margin-left:6px">${Math.min(st.q+1,st.n)}/${st.n}</span>`:
      st.md==="judge"?mk(st.marks):(st.cnt?t("azFreeProg",{c:st.ok,n:st.cnt}):""); },
  box(cls,html,mcls){ $("#azBox").className="azbox "+(cls||""); const m=$("#azMain"); m.className="azmain "+(mcls||""); m.innerHTML=html; },
  numHTML(x,L){ if(L.k.startsWith("img")) return this.soro(x); return x<0?`<span class="neg">−</span>${-x}`:String(x); },
  soro(d){ // そろばん1けた分（上の玉＝5、下の玉＝1）
    const bead=(cy,on)=>`<path d="M8 ${cy} L22 ${cy-8} H38 L52 ${cy} L38 ${cy+8} H22Z" fill="${on?"#F2A541":"#8A6A4A"}" stroke="#2A1C10" stroke-width="1.2"/>`;
    let s=`<svg class="azsoro" viewBox="0 0 60 122"><rect x="1.5" y="1.5" width="57" height="119" rx="5" fill="#3A2A1A"/><rect x="5" y="5" width="50" height="112" rx="2" fill="#F3E6CF"/><path d="M30 5v112" stroke="#7A5A3A" stroke-width="3"/><rect x="5" y="38" width="50" height="5" fill="#3A2A1A"/>`;
    s+=bead(d>=5?29:14,d>=5); const e=d%5;
    for(let k=0;k<4;k++) s+=k<e?bead(52+k*17,true):bead(110-(3-k)*17,false);
    return s+"</svg>"; },
  // フラッシュ：よーい（ピッ・ピッ・ピー）→ 数を順に表示
  play(replay){ const st=this.st; cancelAnimationFrame(this.raf); st.phase="flash"; this.head(); this.dock(); $("#azMsg").innerHTML="";
    const L=st.L, I=L.s*1000/L.c, on=I*.72, t0=now()+1500, my=st; let last=-9, beeps=0;
    this.box("dark",`<div class="azdots"><i></i><i></i><i></i></div>`);
    const loop=()=>{ if(this.st!==my||st.phase!=="flash") return; const e=now()-t0;
      if(e<0){ const b=Math.floor((e+1500)/500); if(b>beeps-1&&b<3){ beeps=b+1; $$(".azdots i").forEach((x,k)=>x.classList.toggle("on",k<=b)); tone(b<2?880:1320,b<2?.07:.16,"sine",.13); } }
      else { const i=Math.floor(e/I); if(i>=L.c){ this.ask(); return; }
        const show=(e-i*I)<on, key=show?i:-1-i;
        if(key!==last){ last=key; if(show){ $("#azMain").innerHTML=this.numHTML(st.nums[i],L); if(I>=250) tone(1000,.035,"sine",.05); } else $("#azMain").innerHTML=""; } }
      this.raf=requestAnimationFrame(loop); };
    this.raf=requestAnimationFrame(loop); },
  ask(){ const st=this.st; st.phase="answer"; st.typed=""; this.paintAns(); this.dock(); },
  paintAns(){ const st=this.st; if(st.an==="in") this.box("",`<span class="q">${esc(t("azWhat"))}</span><span class="cur">${st.typed?esc(st.typed):"?"}</span>`,"ans");
    else this.box("",`<span class="q">${esc(t("azVoiceQ"))}</span>?`,"ans"); },
  fml(){ const st=this.st; return st.nums.map((x,i)=>i?(x<0?" − ":" + ")+Math.abs(x):String(x)).join("")+" = <b>"+st.sum+"</b>"; },
  showAns(ok){ const st=this.st; this.box(ok==null?"":ok?"okf":"ngf",`<span class="q">${esc(t("azAnsIs"))}</span>${st.sum}`,"ans");
    $("#azMsg").innerHTML=(ok==null?"":ok?`<span class="okc">${esc(t("azOk"))}</span>`:`<span class="ngc">${esc(st.an==="in"?t("azNg",{a:st.typed}):t("azNgV"))}</span>`)+`<small class="azsum">${this.fml()}</small>`; },
  judge(ok){ const st=this.st; st.phase="shown"; st.cnt++; if(ok) st.ok++; st.marks.push(ok);
    ok?sfx.ok():sfx.ng(); this.showAns(ok);
    if(st.md==="judge"){ if(ok) st.jc++; else st.jw++;
      if(st.jc>=2){ st.passed=st.lv; const msg=t("azLvClear",{lv:this.lvName(st.lv)});
        if(st.lv>=TOP){ st.over=true; $("#azMsg").insertAdjacentHTML("beforeend",`<small class="gold">${esc(t("azMax"))}</small>`); }
        else { st.lv++; st.L=LV[st.lv]; st.jc=st.jw=0; st.marks=[]; $("#azMsg").insertAdjacentHTML("afterbegin",`<span class="gold">${esc(msg)}</span><br>`); sfx.win(); } }
      else if(st.jw>=2) st.over=true; }
    this.head(); this.dock(); },
  next(){ const st=this.st;
    if(st.md==="test"){ st.q++; if(st.q>=st.n) return this.endTest(); }
    if(st.md==="judge"&&st.over) return this.endJudge();
    this.newQ(); },
  endTest(){ const st=this.st, sc=st.ok*10, pass=sc>=70, semi=!pass&&sc>=50, r=this.rec(); let best=false;
    if(pass&&st.lv>r.pass){ r.pass=st.lv; best=true; store.set("p_az_rec",r); }
    const nx=Math.min(TOP,st.lv+1), lv=st.lv;
    if(pass&&lv<TOP){ this.s.lv=nx; this.save(); }
    this.st=null; this.view("setup"); this.refresh();
    const sub=pass?(lv<TOP?t("azNextLv",{lv:this.lvName(nx)}):t("azMax")):semi?t("azSemiSub",{lv:this.lvName(lv)}):t("azFailSub");
    const btn=pass&&lv<TOP?`<button class="btn primary big" id="azGoNext" style="width:100%;margin-top:12px">${esc(t("azTryLv",{lv:this.lvName(nx)}))}</button>`:"";
    showResult({title:this.lvName(lv)+"　"+this.spec(LV[lv]),big:t(pass?"azPass":semi?"azSemi":"azFail"),bigLbl:sub,isBest:best,
      stats:[[t("azScore"),sc+t("azPoint")],[t("correct"),st.ok+"/10"]],extra:btn,retry:()=>this.start("test",lv)});
    if(!best&&pass) sfx.win();
    const b=$("#azGoNext"); if(b) b.onclick=()=>{ hideResult(); this.start("test",nx); }; },
  endJudge(){ const st=this.st, r=this.rec(); r.judge=st.passed; r.jfrom=st.jfrom; store.set("p_az_rec",r);
    const p=st.passed, cnt=st.cnt, ok=st.ok, from=st.jfrom; this.st=null; this.view("setup"); this.refresh();
    // 判定の級をまだ検定で合格していなければその級、合格ずみなら1つ上の検定をすすめる
    const tl=p<0?from:r.pass>=p?Math.min(TOP,p+1):p;
    const btn=`<button class="btn primary big" id="azGoTest" style="width:100%;margin-top:12px">${esc(t("azTryTest",{lv:this.lvName(tl)}))}</button>`;
    showResult({title:t("azJudgeRes"),big:p>=0?this.lvName(p):t("azJudgeNo",{lv:this.lvName(from)}),bigLbl:p>=0?t("azJudgeSub"):t("azJudgeSub0"),isBest:false,
      stats:[[t("azAnswered"),String(cnt)],[t("correct"),String(ok)]],extra:btn,retry:()=>this.start("judge",from)});
    sfx.win();
    $("#azGoTest").onclick=()=>{ hideResult(); this.s.md="test"; this.s.lv=tl; this.save(); this.refresh(); this.start("test",this.s.lv); }; },
  quit(){ cancelAnimationFrame(this.raf); this.st=null; this.view("setup"); this.refresh(); }
};
return AZ;
});
