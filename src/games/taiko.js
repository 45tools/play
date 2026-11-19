// 45 Play ゲーム：taiko（たいこ）。開いたときだけ読み込まれる。共通の関数は index.html にある
BRAIN.def("taiko",`
<section data-pane="taiko" data-v="setup">
  <div class="vw" data-v="setup">
    <div class="panel">
      <h2 data-i="tkTitle"></h2>
      <p class="lead" data-i="tkLead"></p>
      <div class="opt"><span class="ol" data-i="tkMode"></span><div class="chips" id="tkMdSel">
        <button class="chip" data-val="free" data-i="tkFree"></button><button class="chip" data-val="beat" data-i="tkBeat"></button></div></div>
      <p class="lead" style="margin-top:0" id="tkMdNote"></p>
      <div class="opt"><span class="ol" data-i="tkNum"></span><div class="chips" id="tkNSel">
        <button class="chip" data-val="1">1</button><button class="chip" data-val="2">2</button><button class="chip" data-val="4">4</button></div></div>
      <div id="tkSnd"></div>
      <p class="lead" style="margin:8px 0 0;font-size:12px" data-i="tkSndNote"></p>
      <div id="tkBeatOpt">
        <div class="opt"><span class="ol" data-i="tkSong"></span><div class="chips" id="tkSgSel">
          <button class="chip" data-val="s1" data-i="tkS1"></button><button class="chip" data-val="s2" data-i="tkS2"></button><button class="chip" data-val="s3" data-i="tkS3"></button></div></div>
        <div class="opt"><span class="ol" data-i="tkLv"></span><div class="chips" id="tkLvSel">
          <button class="chip" data-val="1" data-i="tkLv1"></button><button class="chip" data-val="2" data-i="tkLv2"></button><button class="chip" data-val="3" data-i="tkLv3"></button></div></div>
      </div>
      <div id="tkFreeOpt">
        <div class="opt"><span class="ol" data-i="tkBgm"></span><div class="chips" id="tkBgSel">
          <button class="chip" data-val="off" data-i="tkBgmOff"></button><button class="chip" data-val="s1" data-i="tkS1"></button><button class="chip" data-val="s2" data-i="tkS2"></button><button class="chip" data-val="s3" data-i="tkS3"></button></div></div>
      </div>
    </div>
    <div class="panel" id="tkRecP">
      <h2 data-i="recTitle"></h2>
      <div class="tkrec" id="tkRec"></div>
    </div>
  </div>
  <div class="vw" data-v="play">
    <div class="tkstage" id="tkStage">
      <canvas id="tkCv"></canvas>
      <button class="tkexit" id="tkExit" type="button" aria-label="quit"><i class="ic" data-ic="x"></i></button>
      <span class="tkhint" id="tkHint"></span>
    </div>
  </div>
</section>
<style>
.tkrow{display:flex;align-items:center;gap:8px;margin-top:10px}
.tkrow .tkn{min-width:64px;font-weight:700;font-size:14px;display:flex;align-items:center;gap:6px;white-space:nowrap}
.tkrow .tkn i{width:12px;height:12px;border-radius:50%;display:inline-block;flex:none}
.tkrow select{flex:1;min-width:0;height:42px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit;font-size:15px;padding:0 8px}
.tkrow .tkmic{white-space:nowrap;padding:0 12px;height:42px;min-width:88px;justify-content:center}
.tkrow .tkmic.rec{background:#E5484D;color:#fff;border-color:#E5484D}
html.tklock,html.tklock body{overscroll-behavior:none;overflow:hidden;touch-action:none}
.tkstage{position:fixed;inset:0;z-index:90;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;overflow:hidden;background:#141A2E}
.tkstage canvas{display:block;width:100%;height:100%}
.tkexit{position:absolute;left:max(12px,env(safe-area-inset-left,0px));top:calc(env(safe-area-inset-top,0px) + 12px);width:48px;height:48px;border-radius:50%;border:0;background:rgba(255,255,255,.88);color:#14213D;display:flex;align-items:center;justify-content:center;z-index:2;touch-action:none;padding:0}
.tkexit::after{content:"";position:absolute;inset:-5px;border-radius:50%;background:conic-gradient(#E5484D var(--tkp,0%),transparent 0);-webkit-mask:radial-gradient(circle,transparent 27px,#000 28px);mask:radial-gradient(circle,transparent 27px,#000 28px);pointer-events:none}
@property --tkp{syntax:'<percentage>';inherits:false;initial-value:0%}
.tkexit.hold::after{animation:tkhold 1.2s linear forwards}@keyframes tkhold{to{--tkp:100%}}
.tkhint{position:absolute;left:calc(max(12px,env(safe-area-inset-left,0px)) + 58px);top:calc(env(safe-area-inset-top,0px) + 27px);font-size:12px;font-weight:700;pointer-events:none}
.tkrec{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.tkrec div{background:var(--bg);border-radius:12px;padding:8px 4px;text-align:center}
.tkrec b{display:block;font:700 18px Fredoka,sans-serif}.tkrec span{font-size:11px;color:var(--muted)}
</style>`,function(){
/* =========================================================
   たいこ：画面をたたいて音を出す（じゆうにたたく／リズムゲーム）
   ========================================================= */
const TK={
  s:Object.assign({md:"free",n:"2",snd:["don","kan","pan","piyo"],song:"s1",lv:"1",bgm:"off"},store.get("p_taiko",{})),
  st:null,rf:[],my:{},raf:0,
  PRE:["don","pon","tan","kan","pan","shan","puu","piyo","bell"],
  COL:["#E5484D","#3D7BFF","#1DB765","#FF9F1C"],
  COLD:["#9E2B2F","#2148A8","#127A43","#B86A08"],
  PAL:["#FF5C7A","#FFB020","#3DD68C","#4FA3FF","#B57BFF","#FF7A3D","#FFE14D"],
  save(){ store.set("p_taiko",this.s); },
  init(){
    this.pane=$('[data-pane="taiko"]');
    if(!Array.isArray(this.s.snd)||this.s.snd.length<4) this.s.snd=["don","kan","pan","piyo"];
    this.rf.push(chips($("#tkMdSel"),()=>this.s.md,v=>{this.s.md=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#tkNSel"),()=>this.s.n,v=>{this.s.n=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#tkSgSel"),()=>this.s.song,v=>{this.s.song=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#tkLvSel"),()=>this.s.lv,v=>{this.s.lv=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#tkBgSel"),()=>this.s.bgm,v=>{this.s.bgm=v;this.save()}));
    const box=$("#tkSnd");
    box.addEventListener("change",e=>{ const sel=e.target.closest("select"); if(!sel) return; const i=+sel.dataset.d; this.s.snd[i]=sel.value; this.save(); this.hit(sel.value); });
    box.addEventListener("click",e=>{ const b=e.target.closest("[data-mic]"); if(!b) return; this.record(+b.dataset.mic); });
    const stg=$("#tkStage");
    stg.addEventListener("pointerdown",e=>{ if(e.target.closest("#tkExit")) return; e.preventDefault(); const r=stg.getBoundingClientRect(); this.tapAt(e.clientX-r.left,e.clientY-r.top); },{passive:false});
    stg.addEventListener("contextmenu",e=>e.preventDefault());
    stg.addEventListener("touchstart",e=>{ if(!e.target.closest("#tkExit")) e.preventDefault(); },{passive:false});
    stg.addEventListener("touchmove",e=>e.preventDefault(),{passive:false});
    // 遊んでいる間は ✕ 以外で画面が変わらないようにする（戻る・引っぱって再読み込み・拡大・ページを閉じる）
    document.addEventListener("gesturestart",e=>{ if(this.st) e.preventDefault(); });
    this.onPop=()=>{ if(this.st){ try{ history.pushState({tk:1},"",location.href); }catch(e){} } };
    this.onUnload=e=>{ if(this.st){ e.preventDefault(); e.returnValue=""; } };
    const ex=$("#tkExit"); let ht=0;
    const cancel=()=>{ clearTimeout(ht); ex.classList.remove("hold"); };
    ex.addEventListener("pointerdown",e=>{ e.preventDefault(); if(!this.st) return;
      if(this.st.md!=="free"){ this.quit(); return; }
      ex.classList.add("hold"); clearTimeout(ht); ht=setTimeout(()=>{ cancel(); this.quit(); },1200); });
    ["pointerup","pointerleave","pointercancel"].forEach(k=>ex.addEventListener(k,cancel));
    addEventListener("resize",()=>{ if(this.st) this.layout(); });
    document.addEventListener("visibilitychange",()=>{ if(document.hidden&&this.st&&this.st.md==="beat") this.quit(); });
    this.session("playback"); this.refresh(); this.loadMy();
  },
  sname(id){ return id&&id.startsWith("my")?t("tkMyN",{n:id.slice(2)}):t("sn_"+id); },
  ono(id){ return id&&id.startsWith("my")?"♪":t("o_"+id); },
  okSnd(id){ return this.PRE.includes(id)||!!this.my[id]; },
  refresh(){ this.rf.forEach(f=>f()); const s=this.s,n=+s.n;
    $("#tkMdNote").innerHTML=t(s.md==="free"?"tkFreeN":"tkBeatN");
    $("#tkBeatOpt").style.display=s.md==="beat"?"":"none"; $("#tkFreeOpt").style.display=s.md==="free"?"":"none"; $("#tkRecP").style.display=s.md==="beat"?"":"none";
    const mine=["my1","my2","my3","my4"].filter(k=>this.my[k]);
    $("#tkSnd").innerHTML=Array.from({length:n},(_,i)=>{ const cur=this.okSnd(s.snd[i])?s.snd[i]:"don";
      const opts=this.PRE.concat(mine).map(k=>`<option value="${k}"${k===cur?" selected":""}>${esc(this.sname(k))}</option>`).join("");
      return `<div class="tkrow"><span class="tkn"><i style="background:${this.COL[i]}"></i>${esc(t("tkDrumN",{n:i+1}))}</span><select data-d="${i}" aria-label="${esc(t("tkDrumN",{n:i+1}))}">${opts}</select><button class="btn tkmic" type="button" data-mic="${i}">🎤 ${esc(t("tkRecBtn"))}</button></div>`; }).join("");
    const rec=store.get("p_taiko_rec",{});
    $("#tkRec").innerHTML=["s1","s2","s3"].map(k=>{ const v=rec[k+"_"+s.lv]; return `<div><b>${v!=null?v+"%":"—"}</b><span>${esc(t("tkS"+k.slice(1)))}</span></div>`; }).join("")+
      `<p class="lead" style="grid-column:1/-1;margin:4px 0 0;font-size:12px">${esc(t("tkRecNote",{lv:t("tkLv"+s.lv)}))}</p>`; },
  view(v){ this.pane.dataset.v=v; if(mode==="taiko") this.dock(); },
  dock(){ if(mode!=="taiko") return; if(this.pane.dataset.v==="setup") return setDock(`<button class="btn primary big" data-act="start"><i class="ic" data-ic="play"></i>${esc(t("start"))}</button>`); setDock(""); },
  act(a){ if(a==="start") this.start(); },

  /* ---------- 音 ---------- */
  noiseBuf(a){ if(!this.nb||this.nb.sampleRate!==a.sampleRate){ const len=a.sampleRate,b=a.createBuffer(1,len,a.sampleRate),d=b.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1; this.nb=b; } return this.nb; },
  tn(a,t0,dest,type,f1,f2,d,v){ const o=a.createOscillator(),g=a.createGain(); o.type=type; o.frequency.setValueAtTime(f1,t0); o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t0+d);
    g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t0+.005); g.gain.exponentialRampToValueAtTime(.0001,t0+d); o.connect(g); g.connect(dest); o.start(t0); o.stop(t0+d+.05); },
  nz(a,t0,dest,ft,ff,q,d,v){ const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(); s.buffer=this.noiseBuf(a); f.type=ft; f.frequency.value=ff; f.Q.value=q;
    g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t0+.003); g.gain.exponentialRampToValueAtTime(.0001,t0+d); s.connect(f); f.connect(g); g.connect(dest); s.start(t0,Math.random()*.5); s.stop(t0+d+.05); },
  SY:{
    // スマホのスピーカーは低い音が出にくいので、少し高い音（200〜300Hz）と打つ音を重ねて大きく聞こえるようにする
    don(a,t,d,v){ this.tn(a,t,d,"sine",190,62,.6,1*v); this.tn(a,t,d,"triangle",290,115,.32,.7*v); this.tn(a,t,d,"square",140,72,.12,.14*v);
      this.nz(a,t,d,"bandpass",520,1.2,.08,.9*v); this.nz(a,t,d,"lowpass",2000,.7,.025,.5*v); },
    pon(a,t,d,v){ this.tn(a,t,d,"sine",430,230,.22,.75*v); this.nz(a,t,d,"bandpass",1800,2,.03,.25*v); },
    tan(a,t,d,v){ this.nz(a,t,d,"highpass",1500,.7,.18,.6*v); this.tn(a,t,d,"triangle",240,160,.1,.45*v); },
    kan(a,t,d,v){ this.tn(a,t,d,"square",1250,1150,.05,.22*v); this.nz(a,t,d,"bandpass",3000,6,.04,.45*v); this.tn(a,t,d,"sine",820,800,.09,.35*v); },
    pan(a,t,d,v){ [0,.012,.024].forEach(k=>this.nz(a,t+k,d,"bandpass",1300,1.5,.06,.65*v)); this.nz(a,t+.03,d,"bandpass",1100,1,.15,.25*v); },
    shan(a,t,d,v){ this.nz(a,t,d,"highpass",6000,.5,.9,.38*v); this.nz(a,t,d,"bandpass",9000,2,.4,.25*v); },
    puu(a,t,d,v){ const dur=.25+Math.random()*.35,f0=80+Math.random()*60,o=a.createOscillator(),g=a.createGain(),lf=a.createOscillator(),lg=a.createGain(),fl=a.createBiquadFilter();
      o.type="sawtooth"; o.frequency.setValueAtTime(f0*1.4,t); o.frequency.exponentialRampToValueAtTime(f0*.6,t+dur); lf.type="square"; lf.frequency.value=22+Math.random()*20; lg.gain.value=f0*.5; lf.connect(lg); lg.connect(o.frequency);
      fl.type="lowpass"; fl.frequency.value=700; fl.Q.value=4; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.5*v,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      o.connect(fl); fl.connect(g); g.connect(d); o.start(t); lf.start(t); o.stop(t+dur+.05); lf.stop(t+dur+.05); },
    piyo(a,t,d,v){ this.tn(a,t,d,"sine",1800,2600,.09,.32*v); this.tn(a,t+.11,d,"sine",1900,2900,.09,.32*v); },
    bell(a,t,d,v){ this.tn(a,t,d,"sine",1568,1560,.9,.28*v); this.tn(a,t,d,"sine",3920,3900,.4,.09*v); this.tn(a,t,d,"sine",2350,2340,.6,.08*v); },
  },
  // たたく音の通り道：音量を上げて、コンプレッサーで割れないようにまとめる（音の環境ごとに作り直す）
  bus(a){ if(this.busA!==a){ const g=a.createGain(),cp=a.createDynamicsCompressor(),mk=a.createGain(); g.gain.value=1;
      cp.threshold.value=-20; cp.knee.value=8; cp.ratio.value=5; cp.attack.value=.002; cp.release.value=.15; mk.gain.value=1.9;
      g.connect(cp); cp.connect(mk); mk.connect(a.destination); this.busA=a; this.busIn=g; } return this.busIn; },
  // 音が止まっていないか確かめる。iPhoneでは電話・通知・他のアプリの音で止まったり、時計が進まなくなることがある
  alive(){ let a=ac(); if(!a) return null; const p=performance.now()/1000,ck=this.ck;
    if(ck&&ck.a===a&&a.state==="running"&&p-ck.p>.5&&Math.abs(a.currentTime-ck.c)<.005&&!(this.st&&this.st.md==="beat")){ a=acReset(); if(!a) return null; this.restartBgm(); }
    this.ck={a,p,c:a.currentTime}; return a; },
  restartBgm(){ const st=this.st; if(st&&st.bgGo){ clearTimeout(st.bgT); st.mgs=[]; st.bgGo(ac().currentTime+.2); } },
  lock(on){ const de=document.documentElement; de.classList.toggle("tklock",on);
    if(on&&!this.locked){ this.locked=true; try{ history.pushState({tk:1},"",location.href); }catch(e){} addEventListener("popstate",this.onPop); addEventListener("beforeunload",this.onUnload); }
    else if(!on&&this.locked){ this.locked=false; removeEventListener("popstate",this.onPop); removeEventListener("beforeunload",this.onUnload); try{ if(history.state&&history.state.tk) history.back(); }catch(e){} } },
  session(type){ try{ if(navigator.audioSession) navigator.audioSession.type=type; }catch(e){} },
  hit(id,t0,dest,v){ if(!store.get("b_snd",true)) return; const a=this.alive(); if(!a) return; t0=t0||a.currentTime; dest=dest||this.bus(a); v=v==null?1:v;
    try{ const b=id&&id.startsWith("my")?this.my[id]:null;
      if(b){ const s=a.createBufferSource(),g=a.createGain(); s.buffer=b; g.gain.value=v; s.connect(g); g.connect(dest); s.start(t0); return; }
      (this.SY[id]||this.SY.don).call(this,a,t0,dest,v); }catch(e){} },

  /* ---------- 録音（2秒。前後の無音を切って、このスマホの中に保存） ---------- */
  async record(i){ if(this.recing) return; const a=ac(); if(!a) return;
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||typeof MediaRecorder==="undefined"){ toast(t("tkRecNo")); return; }
    this.session("play-and-record"); let stream; try{ stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false}}); }catch(e){ this.session("playback"); toast(t("tkMicNg")); return; }
    let mr; try{ mr=new MediaRecorder(stream); }catch(e){ stream.getTracks().forEach(x=>x.stop()); this.session("playback"); toast(t("tkRecNo")); return; }
    this.recing=true; const chunks=[]; mr.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); };
    const done=new Promise(r=>mr.onstop=r); const btn=$(`[data-mic="${i}"]`); let left=2;
    const lab=()=>{ if(btn){ btn.classList.add("rec"); btn.textContent=t("tkRecing",{s:left}); } };
    mr.start(); lab(); const iv=setInterval(()=>{ left--; if(left>0) lab(); },1000);
    await new Promise(r=>setTimeout(r,2000)); clearInterval(iv); try{ mr.stop(); }catch(e){} await done; stream.getTracks().forEach(x=>x.stop()); this.session("playback");
    try{ const blob=new Blob(chunks,{type:mr.mimeType||(chunks[0]&&chunks[0].type)||""}); const ab=await blob.arrayBuffer();
      const buf=await new Promise((res,rej)=>{ const p=a.decodeAudioData(ab,res,rej); if(p&&p.then) p.then(res,rej); });
      const b=this.trim(a,buf);
      if(!b) toast(t("tkRecQuiet"));
      else { const k="my"+(i+1); this.my[k]=b; this.s.snd[i]=k; this.save(); this.dbPut(k,{sr:b.sampleRate,d:b.getChannelData(0).slice()}); toast(t("tkRecOk")); this.hit(k); }
    }catch(e){ toast(t("tkRecNo")); }
    this.recing=false; this.refresh(); },
  trim(a,buf){ const src=buf.getChannelData(0),sr=buf.sampleRate; let pk=0; for(let i=0;i<src.length;i++){ const v=Math.abs(src[i]); if(v>pk) pk=v; }
    if(pk<.01) return null; const th=Math.max(.01,pk*.12); let s=0,e=src.length-1;
    while(s<src.length&&Math.abs(src[s])<th) s++; while(e>s&&Math.abs(src[e])<th) e--;
    s=Math.max(0,s-Math.round(sr*.01)); e=Math.min(src.length,e+Math.round(sr*.08)); if(e-s>sr*1.5) e=s+Math.round(sr*1.5);
    const n=e-s; if(n<sr*.02) return null; const b=a.createBuffer(1,n,sr),d=b.getChannelData(0),g=.9/pk,fo=Math.min(n,Math.round(sr*.02));
    for(let i=0;i<n;i++) d[i]=src[s+i]*g*(i>n-fo?(n-i)/fo:1); return b; },
  db(){ if(!this._db) this._db=new Promise((res,rej)=>{ try{ const r=indexedDB.open("p_taiko",1); r.onupgradeneeded=()=>r.result.createObjectStore("snd"); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }catch(e){ rej(e); } }); return this._db; },
  async dbPut(k,v){ try{ const d=await this.db(); d.transaction("snd","readwrite").objectStore("snd").put(v,k); }catch(e){} },
  async loadMy(){ try{ const d=await this.db(), a=ac(); if(!a) return;
      for(const k of ["my1","my2","my3","my4"]){ const v=await new Promise(res=>{ try{ const r=d.transaction("snd").objectStore("snd").get(k); r.onsuccess=()=>res(r.result); r.onerror=()=>res(null); }catch(e){ res(null); } });
        if(v&&v.d&&v.d.length){ const b=a.createBuffer(1,v.d.length,v.sr); b.getChannelData(0).set(v.d); this.my[k]=b; } } }catch(e){}
    this.refresh(); },

  /* ---------- 曲（オリジナル）。1小節＝8分音符8つ。pat の数字＝たたくたいこ（1〜4） ---------- */
  SONGS:{
    s1:{bpm:96,ch:"C G F C F C G C C G F C F C G C",
      mel:["E5 - G5 - E5 - C5 -","D5 - E5 - G5 - - -","A5 - G5 - F5 - A5 -","G5 - E5 - C5 - - -","F5 - A5 - C6 - A5 -","G5 - E5 - G5 - - -","D5 - E5 - F5 - D5 -","C5 - - - . . . .",
           "E5 - G5 - E5 - C5 -","D5 - E5 - G5 - - -","A5 - G5 - F5 - A5 -","G5 - E5 - C5 - - -","F5 - A5 - C6 - A5 -","G5 - E5 - D5 - - -","D5 - E5 - D5 - B4 -","C5 - - - . . . ."],
      pat:["1...1...","1...2...","1...1.1.","2...2...","1.1.1...","2.2.2...","1.2.1.2.","1.......",
           "1...1...","2...2...","1.1.2...","2.2.1...","1.2.1.2.","3.4.3.4.","1.1.2.2.","1...2..."]},
    s2:{bpm:112,ch:"C Am F G C Am G C C Am F G F G C C",
      mel:["C5 D5 E5 - G5 - E5 -","A5 - G5 - E5 - D5 -","C5 - D5 E5 G5 - A5 -","G5 - - - D5 - - -","E5 - G5 - A5 - G5 E5","D5 - E5 - C5 - A4 -","D5 - - - G4 - - -","C5 - - - . . . .",
           "G5 - A5 - G5 - E5 -","A5 - C6 - A5 - G5 -","A5 - G5 - E5 - C5 -","D5 - E5 - G5 - - -","A5 - G5 - A5 - C6 -","G5 - E5 - D5 - - -","E5 D5 C5 - D5 - E5 -","C5 - - - . . . ."],
      pat:["1.1.1...","1.2.1.2.","1.1.2...","2.2.2...","1.1.1.1.","1.2.1.2.","1.2.2.1.","1...2...",
           "1.1.1.2.","1.2.1.2.","3.4.3.4.","1.1.2.2.","1.2.1.2.","3.3.4.4.","1.2.3.4.","1...1..."]},
    s3:{bpm:132,ch:"Am F C G Am F C G F G Am Am F G C C",
      mel:["A4 - C5 - E5 - C5 -","F5 - E5 - C5 - A4 -","G4 - C5 - E5 - G5 -","D5 - - - B4 - - -","A4 - C5 - E5 - A5 -","F5 - A5 - C6 - A5 -","G5 - E5 - C5 - E5 -","D5 - - - . . G4 -",
           "A5 - G5 - F5 - - -","G5 - F5 - D5 - - -","E5 - C5 - A4 - C5 -","E5 - - - . . . .","F5 - E5 - D5 - C5 -","D5 - E5 - G5 - B5 -","C6 - G5 - E5 - G5 -","C6 - - - . . . ."],
      pat:["1.1.1.1.","1.2.1.2.","1.11.2..","2.2.22..","1.1.1.1.","1.2.1.22","1.2.3.4.","1...2.2.",
           "1.11.11.","2.22.22.","1.2.1.2.","3.4.3.44","1.2.3.4.","4.3.2.1.","1.1.2.21","1......."]},
  },
  RT:{C:48,D:50,E:52,F:53,G:55,A:45,Am:45,Dm:50,Em:52},
  mid(x){ const m=/^([A-G])(#?)(\d)$/.exec(x); return m?{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]?1:0)+(+m[3]+1)*12:60; },
  mf(m){ return 440*Math.pow(2,(m-69)/12); },
  mel(a,t,d,f,dur){ const o=a.createOscillator(),o2=a.createOscillator(),fl=a.createBiquadFilter(),g=a.createGain(); o.type="square"; o2.type="triangle"; o.frequency.value=f; o2.frequency.value=f*2;
    fl.type="lowpass"; fl.frequency.value=2200; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.11,t+.02); g.gain.setValueAtTime(.09,t+Math.max(.03,dur-.06)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(d); o.start(t); o2.start(t); o.stop(t+dur+.05); o2.stop(t+dur+.05); },
  // 曲を t0 から鳴らす（countIn なら最初の1小節は「カン」4つ）。曲の終わりの時刻を返す
  music(sg,t0,countIn,vol){ const a=ac(),st=this.st; if(!store.get("b_snd",true)) return t0+(sg.mel.length+(countIn?1:0))*60/sg.bpm*4;
    const g=a.createGain(); g.gain.value=vol||.55; g.connect(a.destination); (st.mgs=st.mgs||[]).push(g);
    const e=60/sg.bpm/2, bd=e*8, ch=sg.ch.split(" "); let t=t0;
    if(countIn){ for(let k=0;k<4;k++) this.SY.kan.call(this,a,t0+k*e*2,g,.7); t+=bd; }
    sg.mel.forEach((bar,bi)=>{ const tok=bar.split(" "),root=this.RT[ch[bi]]||48,tb=t+bi*bd;
      [0,2,4,6].forEach(p=>{ const f=this.mf(root+(p===2||p===6?7:0)); this.tn(a,tb+p*e,g,"triangle",f,f,e*1.7,.32); });
      [0,4].forEach(p=>this.tn(a,tb+p*e,g,"sine",110,45,.16,.22));
      for(let p=0;p<8;p++) this.nz(a,tb+p*e,g,"highpass",8000,.7,.04,p%2?.04:.07);
      tok.forEach((x,p)=>{ if(x==="-"||x===".") return; let L=1; while(tok[p+L]==="-") L++; this.mel(a,tb+p*e,g,this.mf(this.mid(x)),L*e*.92); }); });
    return t+sg.mel.length*bd; },
  stopMusic(){ const st=this.st; if(!st) return; clearTimeout(st.bgT); (st.mgs||[]).forEach(g=>{ try{ g.gain.value=0; g.disconnect(); }catch(e){} }); st.mgs=[]; },
  // 譜面：かんたん＝1拍目と3拍目だけ、むずかしい＝ところどころ8分音符を足す
  chart(sg,lv,n,tStart){ const e=60/sg.bpm/2, out=[];
    sg.pat.forEach((bar,bi)=>[...bar].forEach((c,p)=>{ if(c==="."||(lv===1&&p%4)) return; out.push({bi,p,c:+c}); }));
    if(lv===3){ const add=[]; for(let i=0;i<out.length-1;i++){ const x=out[i],y=out[i+1]; if((y.bi*8+y.p)-(x.bi*8+x.p)===2&&x.p%2===0&&x.bi%2===1) add.push({bi:x.bi,p:x.p+1,c:x.c%4+1}); } out.push(...add); }
    return out.map(x=>({t:tStart+(x.bi*8+x.p)*e,l:(x.c-1)%n,done:0})).sort((a,b)=>a.t-b.t); },

  /* ---------- あそぶ ---------- */
  now(){ const a=ac(); return a.currentTime-this.st.off; },
  start(){ const a=ac(); if(!a){ toast(t("tkRecNo")); return; } const s=this.s,n=+s.n;
    const st=this.st={md:s.md,n,snd:Array.from({length:n},(_,i)=>this.okSnd(s.snd[i])?s.snd[i]:"don"),parts:[],txt:[],hue:200,mgs:[],off:Math.min(.2,a.outputLatency||a.baseLatency||0)};
    this.view("play"); this.lock(true); $("#tkHint").textContent=st.md==="free"?t("tkHold"):""; $("#tkHint").style.color=st.md==="free"?"rgba(20,33,61,.55)":"rgba(255,255,255,.6)";
    this.layout();
    if(st.md==="beat"){ const sg=this.SONGS[s.song],lv=+s.lv,e=60/sg.bpm/2,t0=a.currentTime+.8;
      Object.assign(st,{sg,song:s.song,lv,e,t0,first:t0+e*8,lead:[0,2.2,1.75,1.4][lv],win:[0,[.08,.17],[.065,.13],[.05,.11]][lv],great:0,good:0,miss:0,combo:0,max:0});
      st.notes=this.chart(sg,lv,n,st.first); st.end=st.notes[st.notes.length-1].t+1.4; this.music(sg,t0,true); }
    else if(s.bgm!=="off"){ const sg=this.SONGS[s.bgm]; const go=st.bgGo=t0=>{ if(this.st!==st) return; const end=this.music(sg,t0,false,.4); st.bgT=setTimeout(()=>go(end),Math.max(0,(end-ac().currentTime-1.5)*1000)); }; go(a.currentTime+.3); }
    cancelAnimationFrame(this.raf); this.lt=0; this.loop(); },
  layout(){ const st=this.st,cv=$("#tkCv"),r=$("#tkStage").getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
    const W=this.W=r.width,H=this.H=r.height; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); this.cx=cv.getContext("2d"); this.cx.setTransform(dpr,0,0,dpr,0,0);
    const n=st.n,old=st.drums||[]; st.drums=[];
    if(st.md==="free"){ const top=64,h=H-top; let cells;
      if(n===1) cells=[[0,0,W,H,W/2,top+h/2,W,h]];
      else if(n===2) cells=H>=W?[[0,0,W,top+h/2,W/2,top+h/4,W,h/2],[0,top+h/2,W,h/2,W/2,top+h*3/4,W,h/2]]:[[0,0,W/2,H,W/4,top+h/2,W/2,h],[W/2,0,W/2,H,W*3/4,top+h/2,W/2,h]];
      else cells=[[0,0,W/2,top+h/2,W/4,top+h/4,W/2,h/2],[W/2,0,W/2,top+h/2,W*3/4,top+h/4,W/2,h/2],[0,top+h/2,W/2,h/2,W/4,top+h*3/4,W/2,h/2],[W/2,top+h/2,W/2,h/2,W*3/4,top+h*3/4,W/2,h/2]];
      cells.forEach(([x,y,w,hh,cx,cy,cw,ch],i)=>st.drums.push({x:cx,y:cy,r:Math.min(cw,ch)*.41,cell:[x,y,w,hh],ht:old[i]?old[i].ht:-9})); }
    else { const lw=W/n,r2=Math.min(lw*.4,72),jy=H-r2*1.25-Math.max(18,parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sab"))||18);
      Object.assign(st,{jy,top:70,lw}); for(let i=0;i<n;i++) st.drums.push({x:lw*(i+.5),y:jy,r:r2,cell:[lw*i,0,lw,H],ht:old[i]?old[i].ht:-9}); } },
  tapAt(x,y){ const st=this.st; if(!st) return; const i=st.drums.findIndex(d=>x>=d.cell[0]&&x<d.cell[0]+d.cell[2]&&y>=d.cell[1]&&y<d.cell[1]+d.cell[3]); if(i<0) return;
    const d=st.drums[i],tm=performance.now()/1000; d.ht=tm; this.hit(st.snd[i]); try{ navigator.vibrate&&navigator.vibrate(12); }catch(e){}
    if(st.md==="free"){ this.burst(x,y,14); st.txt.push({x,y:y-24,s:this.ono(st.snd[i]),t:tm,c:this.COLD[i]}); if(st.txt.length>12) st.txt.shift(); st.hue=(st.hue+37)%360; }
    else { this.burst(d.x,d.y-d.r*.2,6); this.judge(i); } },
  judge(L){ const st=this.st,now=this.now(),w=st.win; let best=null,bd=9;
    for(const nt of st.notes){ const dd=now-nt.t; if(dd<-w[1]) break; if(nt.done||nt.l!==L) continue; if(Math.abs(dd)<bd){ bd=Math.abs(dd); best=nt; } }
    if(!best||bd>w[1]) return; best.done=1; st.combo++; st.max=Math.max(st.max,st.combo);
    if(bd<=w[0]){ st.great++; this.say(t("tkGreat"),"#FFD23F"); } else { st.good++; this.say(t("tkGood"),"#7FD1FF"); } },
  say(s,c){ this.st.say={s,c,t:performance.now()/1000}; },
  burst(x,y,k){ const st=this.st; for(let i=0;i<k;i++){ const a=Math.random()*Math.PI*2,sp=120+Math.random()*300;
      st.parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-140,r:5+Math.random()*9,c:this.PAL[rnd(this.PAL.length)],life:0,max:.7+Math.random()*.5,sh:rnd(3)}); }
    if(st.parts.length>320) st.parts.splice(0,st.parts.length-320); },
  loop(){ if(!this.st) return; this.raf=requestAnimationFrame(()=>this.loop()); try{ this.draw(); }catch(e){ console.error(e); } },
  star(c,x,y,r){ c.beginPath(); for(let k=0;k<10;k++){ const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r; c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } c.closePath(); c.fill(); },
  drum(c,d,i,tm){ const k=Math.max(0,1-(tm-d.ht)/.18),r=d.r*(1-.07*k),col=this.COL[i],x=d.x,y=d.y;
    c.fillStyle="rgba(0,0,0,.16)"; c.beginPath(); c.ellipse(x,y+d.r*.34,d.r*1.02,d.r*.92,0,0,7); c.fill();
    c.fillStyle=this.COLD[i]; c.beginPath(); c.ellipse(x,y+d.r*.2,d.r,d.r*.96,0,0,7); c.fill();
    c.fillStyle=col; c.beginPath(); c.arc(x,y,r,0,7); c.fill();
    c.fillStyle=k>0?"#FFFFFF":"#FFF6E6"; c.beginPath(); c.arc(x,y,r*.84,0,7); c.fill();
    c.fillStyle="rgba(255,255,255,.8)"; for(let j=0;j<12;j++){ const a=j/12*Math.PI*2; c.beginPath(); c.arc(x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92,Math.max(1.8,r*.028),0,7); c.fill(); }
    c.globalAlpha=.16+.2*k; c.fillStyle=col; c.beginPath(); c.arc(x,y,r*.5,0,7); c.fill(); c.globalAlpha=1;
    if(k>0){ c.strokeStyle=col; c.globalAlpha=k; c.lineWidth=5; c.beginPath(); c.arc(x,y,r*(1+.4*(1-k)),0,7); c.stroke(); c.globalAlpha=1; }
    c.fillStyle="#4A3420"; c.font=`700 ${Math.round(Math.max(12,Math.min(r*.2,28)))}px "M PLUS Rounded 1c",sans-serif`; c.textAlign="center"; c.textBaseline="middle"; c.fillText(this.sname(this.st.snd[i]),x,y); },
  draw(){ const st=this.st,c=this.cx,W=this.W,H=this.H,tm=performance.now()/1000,dt=Math.min(.05,this.lt?tm-this.lt:0); this.lt=tm;
    if(st.md==="free"){ const bg=st.bgh==null?st.hue:(st.bgh+(((st.hue-st.bgh+540)%360)-180)*Math.min(1,dt*6)); st.bgh=(bg+360)%360; c.fillStyle=`hsl(${st.bgh},80%,91%)`; c.fillRect(0,0,W,H); st.drums.forEach((d,i)=>this.drum(c,d,i,tm)); }
    else { const now=this.now(); c.fillStyle="#141A2E"; c.fillRect(0,0,W,H);
      st.drums.forEach((d,i)=>{ c.fillStyle=i%2?"rgba(255,255,255,.035)":"rgba(255,255,255,.07)"; c.fillRect(d.cell[0],0,d.cell[2],H); });
      c.strokeStyle="rgba(255,255,255,.3)"; c.lineWidth=2; c.beginPath(); c.moveTo(0,st.jy); c.lineTo(W,st.jy); c.stroke();
      st.drums.forEach((d,i)=>this.drum(c,d,i,tm));
      for(const nt of st.notes){ if(!nt.done&&now-nt.t>st.win[1]){ nt.done=1; st.miss++; st.combo=0; this.say(t("tkMiss"),"#9AA3BA"); } }
      const span=st.jy-st.top;
      for(let k=st.notes.length-1;k>=0;k--){ const nt=st.notes[k]; if(nt.done) continue; const y=st.jy-(nt.t-now)/st.lead*span; if(y<-50||y>H+50) continue;
        const d=st.drums[nt.l],r=Math.min(d.r*.55,30); c.globalAlpha=y<st.top?Math.max(0,1-(st.top-y)/50):1;
        c.fillStyle=this.COL[nt.l]; c.beginPath(); c.arc(d.x,y,r,0,7); c.fill(); c.lineWidth=4; c.strokeStyle="#fff"; c.stroke(); c.globalAlpha=1; }
      if(now<st.first){ const k=Math.floor((now-st.t0)/(st.e*2)); if(k>=0&&k<4){ c.fillStyle="rgba(255,255,255,.9)"; c.font='700 72px Fredoka,sans-serif'; c.textAlign="center"; c.textBaseline="middle"; c.fillText(String(4-k),W/2,H*.36); } }
      // 上の表示：コンボ・進み具合
      const p=Math.max(0,Math.min(1,(now-st.first)/(st.end-1.4-st.first||1)));
      c.fillStyle="rgba(255,255,255,.15)"; c.fillRect(70,30,W-150,6); c.fillStyle="#FFD23F"; c.fillRect(70,30,(W-150)*p,6);
      c.fillStyle="#fff"; c.textAlign="right"; c.textBaseline="middle"; c.font='700 20px Fredoka,"M PLUS Rounded 1c",sans-serif'; c.fillText(st.combo>1?t("tkCombo",{n:st.combo}):"",W-14,33);
      if(st.say){ const a=1-(tm-st.say.t)/.6; if(a>0){ c.globalAlpha=a; c.fillStyle=st.say.c; c.textAlign="center"; c.font=`700 ${Math.round(40+10*a)}px Fredoka,"M PLUS Rounded 1c",sans-serif`; c.fillText(st.say.s,W/2,st.jy-st.drums[0].r-70); c.globalAlpha=1; } }
      if(now>st.end){ this.finish(); return; } }
    // 飛び散る星・丸
    for(let k=st.parts.length-1;k>=0;k--){ const q=st.parts[k]; q.life+=dt; if(q.life>q.max){ st.parts.splice(k,1); continue; } q.vy+=600*dt; q.x+=q.vx*dt; q.y+=q.vy*dt;
      c.globalAlpha=1-q.life/q.max; c.fillStyle=q.c; if(q.sh===0) this.star(c,q.x,q.y,q.r*1.3); else { c.beginPath(); c.arc(q.x,q.y,q.r*(q.sh===1?1:.6),0,7); c.fill(); } }
    c.globalAlpha=1;
    // 「どーん」などの文字
    for(let k=st.txt.length-1;k>=0;k--){ const q=st.txt[k],a=(tm-q.t)/.9; if(a>1){ st.txt.splice(k,1); continue; }
      c.globalAlpha=1-a; c.fillStyle=q.c; c.textAlign="center"; c.textBaseline="middle"; c.font=`800 ${Math.round(34+18*Math.sin(Math.min(1,a*3)*Math.PI/2))}px "M PLUS Rounded 1c",Fredoka,sans-serif`; c.fillText(q.s,q.x,q.y-a*60); }
    c.globalAlpha=1; },
  finish(){ const st=this.st,tot=st.notes.length||1,acc=Math.round((st.great+st.good*.5)/tot*100); this.stop();
    const key=st.song+"_"+st.lv,rec=store.get("p_taiko_rec",{}),best=rec[key]==null||acc>rec[key]; if(best){ rec[key]=acc; store.set("p_taiko_rec",rec); }
    this.view("setup"); this.refresh();
    showResult({title:t("tTaiko"),big:acc+"%",bigLbl:t("tkS"+st.song.slice(1))+"・"+t("tkLv"+st.lv),isBest:best&&acc>0,
      stats:[[t("tkGreat"),String(st.great)],[t("tkGood"),String(st.good)],[t("tkMiss"),String(st.miss)],[t("tkMaxC"),String(st.max)]],
      extra:`<p class="lead" style="margin:6px 0 0;text-align:center">${esc(t(acc>=95?"tkG1":acc>=80?"tkG2":acc>=50?"tkG3":"tkG4"))}</p>`,retry:()=>this.start()});
    if(!best||acc===0) sfx.win(); },
  stop(){ cancelAnimationFrame(this.raf); this.stopMusic(); this.st=null; this.lock(false); $("#tkExit").classList.remove("hold"); },
  quit(){ this.stop(); this.view("setup"); this.refresh(); }
};
return TK;
});
