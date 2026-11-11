// 45 Play ゲーム：ira（イライラ棒）。開いたときだけ読み込まれる。共通の関数は index.html にある
BRAIN.def("ira",`
<section data-pane="ira" data-v="setup">
  <div class="vw" data-v="setup">
    <div class="panel">
      <h2 data-i="iraTitle"></h2>
      <p class="lead" data-i="iraLead"></p>
      <div class="opt"><span class="ol" data-i="iraCtl"></span><div class="chips" id="iraCtlSel">
        <button class="chip" data-val="tilt" data-i="iraTilt"></button><button class="chip" data-val="finger" data-i="iraFinger"></button></div></div>
      <p class="lead" id="iraCtlNote" style="margin-top:8px"></p>
      <div class="opt"><span class="ol" data-i="iraFrom"></span><div class="chips" id="iraFromSel"></div></div>
      <label class="opt sw"><span data-i="iraVib"></span><input type="checkbox" id="iraVibSw"></label>
    </div>
    <div class="panel">
      <h2 data-i="recTitle"></h2>
      <div class="best"><i class="ic" data-ic="trophy"></i><span data-i="iraBest"></span><b class="num" id="iraBestV"></b></div>
    </div>
  </div>
  <div class="vw" data-v="play">
    <div class="phead"><button class="btn icon" id="iraQuit" aria-label="quit"><i class="ic" data-ic="x"></i></button>
      <b class="num prog" id="iraStage"></b><span class="hearts" id="iraLives"></span><div class="sp"></div><span class="num timer" id="iraTime"></span></div>
    <div class="irabox"><canvas id="iraCv"></canvas></div>
    <div class="banner" id="iraMsg"></div>
  </div>
</section>`,function(){
const LW=360, LH=600, R=7, STAGES=10;
const HW=[32,28,25,22,20,18,16.5,15,14,13];
function rng(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
// コース：下のスタートから上のゴールへ、くねくね曲がる通路（中心線の点の列）
function course(n){ const r=rng(4500+n*97), hw=HW[n-1], k=5+n, ctrl=[{x:LW/2,y:LH-46}];
  let x=LW/2; for(let i=1;i<k;i++){ const y=LH-46-(LH-92)*i/k; const lim=40+n*9; x=Math.max(hw+22,Math.min(LW-hw-22,x+(r()*2-1)*lim*(i%2?1.6:1))); ctrl.push({x,y}); }
  ctrl.push({x:LW/2+(r()*2-1)*60,y:46});
  // なめらかにつなぐ（Catmull-Rom）
  const P=[]; for(let i=0;i<ctrl.length-1;i++){ const p0=ctrl[Math.max(0,i-1)],p1=ctrl[i],p2=ctrl[i+1],p3=ctrl[Math.min(ctrl.length-1,i+2)];
    const steps=Math.ceil(Math.hypot(p2.x-p1.x,p2.y-p1.y)/3);
    for(let s=0;s<steps;s++){ const u=s/steps,u2=u*u,u3=u2*u;
      P.push({x:.5*((2*p1.x)+(-p0.x+p2.x)*u+(2*p0.x-5*p1.x+4*p2.x-p3.x)*u2+(-p0.x+3*p1.x-3*p2.x+p3.x)*u3),
              y:.5*((2*p1.y)+(-p0.y+p2.y)*u+(2*p0.y-5*p1.y+4*p2.y-p3.y)*u2+(-p0.y+3*p1.y-3*p2.y+p3.y)*u3)}); } }
  P.push(ctrl[ctrl.length-1]);
  // 回るバー（4面から）：かべに軸があり、通路の半分ほどをはらう。チェックポイントの近くには置かない
  const bars=[]; const nb=n>=4?Math.floor((n-2)/2):0, FR={1:[.5],2:[.2,.5],3:[.18,.5,.82],4:[.15,.45,.56,.85]}[nb]||[];
  FR.forEach((fr,j)=>{ const idx=Math.floor(P.length*fr), a=P[Math.max(0,idx-3)], b=P[Math.min(P.length-1,idx+3)];
    const tx=b.x-a.x,ty=b.y-a.y,tl=Math.hypot(tx,ty)||1, side=j%2?1:-1, nx=-ty/tl*side, ny=tx/tl*side;
    bars.push({x:P[idx].x+nx*hw,y:P[idx].y+ny*hw,L:hw*1.15,sp:(1.1+n*.1)*(j%2?-1:1),ph:r()*6,full:true}); });
  // チェックポイント（3分の1ごと）
  const cps=[0,Math.floor(P.length/3),Math.floor(P.length*2/3)];
  return {P,hw,bars,cps}; }
function segDist(px,py,a,b){ const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy; let u=l?((px-a.x)*dx+(py-a.y)*dy)/l:0; u=Math.max(0,Math.min(1,u)); const x=a.x+dx*u,y=a.y+dy*u; return Math.hypot(px-x,py-y); }

const IRA={
  s:Object.assign({ctl:("ontouchstart" in window&&"DeviceOrientationEvent" in window)?"tilt":"finger",from:1,vib:true},store.get("p_ira",{})),
  st:null,rf:[],tilt:null,
  save(){ store.set("p_ira",this.s); },
  init(){ this.pane=$('[data-pane="ira"]');
    this.rf.push(chips($("#iraCtlSel"),()=>this.s.ctl,v=>{this.s.ctl=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#iraFromSel"),()=>this.s.from,v=>{this.s.from=+v;this.save()}));
    $("#iraVibSw").onchange=e=>{ this.s.vib=e.target.checked; this.save(); };
    $("#iraQuit").onclick=()=>this.quit();
    const cv=$("#iraCv");
    cv.addEventListener("pointerdown",e=>{ if(!this.st) return; cv.setPointerCapture(e.pointerId); this.drag={x:e.clientX,y:e.clientY}; });
    cv.addEventListener("pointermove",e=>{ if(!this.st||!this.drag||this.s.ctl!=="finger") return; const z=this.z||1; this.st.pend.x+=(e.clientX-this.drag.x)/z; this.st.pend.y+=(e.clientY-this.drag.y)/z; this.drag={x:e.clientX,y:e.clientY}; });
    const up=()=>{ this.drag=null; }; cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
    window.addEventListener("deviceorientation",e=>{ if(e.beta==null) return; this.tilt={b:e.beta,g:e.gamma}; });
    window.addEventListener("resize",()=>{ if(this.st) this.fit(); });
    try{ matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{ this.cols=null; }); }catch(e){}
    this.refresh(); },
  rec(){ return store.get("p_ira_rec",{stage:0,ms:0}); },
  refresh(){ const r=this.rec(), top=Math.max(1,Math.min(STAGES,r.stage+1));
    $("#iraFromSel").innerHTML=[...Array(STAGES).keys()].map(i=>i+1).map(n=>`<button class="chip num" data-val="${n}"${n>top?" disabled":""}>${n}</button>`).join("");
    if(this.s.from>top) this.s.from=1;
    this.rf.forEach(f=>f()); $("#iraVibSw").checked=!!this.s.vib;
    $("#iraCtlNote").innerHTML=t(this.s.ctl==="tilt"?"iraTiltNote":"iraFingerNote");
    $("#iraBestV").textContent=r.stage?t("iraBestV",{n:Math.min(r.stage,STAGES),tm:fmtSec(r.ms)}):"—"; },
  view(v){ this.pane.dataset.v=v; if(mode==="ira") this.dock(); },
  dock(){ if(mode!=="ira") return; if(this.pane.dataset.v==="setup") return setDock(`<button class="btn primary big" data-act="start"><i class="ic" data-ic="play"></i>${esc(t("start"))}</button>`);
    setDock(this.s.ctl==="tilt"?`<button class="btn" data-act="calib"><i class="ic" data-ic="level"></i>${esc(t("iraCalib"))}</button>`:""); },
  act(a){ if(a==="start") this.start(); else if(a==="calib") this.calib(); },
  async start(){
    if(this.s.ctl==="tilt"){ // iPhoneは許可が必要（ボタンを押したときに聞く）
      try{ if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function"){ const p=await DeviceOrientationEvent.requestPermission(); if(p!=="granted"){ toast(t("iraNoTilt")); this.s.ctl="finger"; this.save(); this.refresh(); } } }catch(e){ toast(t("iraNoTilt")); this.s.ctl="finger"; this.save(); this.refresh(); } }
    this.st={stage:this.s.from,lives:3,ms:0,total:0,id:Math.random(),pend:{x:0,y:0}};
    this.view("play"); this.fit(); this.load(this.st.stage); this.loop(); },
  load(n){ const st=this.st; st.c=course(n); st.stage=n; st.cp=0; st.prog=0; st.v={x:0,y:0}; st.phase="ready"; st.t0=now(); st.flash=0;
    const p=st.c.P[0]; st.b={x:p.x,y:p.y}; st.ms=0; this.calib(true); this.hud(); this.msg(t("iraReady",{n})); },
  calib(silent){ this.zero=this.tilt?{...this.tilt}:{b:0,g:0}; if(!silent) toast(t("iraCalibDone")); },
  quit(){ this.st=null; this.view("setup"); this.refresh(); },
  fit(){ const cv=$("#iraCv"),box=cv.parentElement; const avail=Math.max(260,(window.innerHeight||700)-150);
    const w=Math.min(box.clientWidth||340,avail*LW/LH); const h=w*LH/LW, dpr=Math.min(2,window.devicePixelRatio||1);
    cv.style.width=w+"px"; cv.style.height=h+"px"; cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); this.z=w/LW; this.dpr=dpr; },
  loop(){ const id=this.st.id; let last=now();
    const f=()=>{ if(!this.st||this.st.id!==id) return; const T=now(),dt=Math.min(50,T-last); last=T; if(mode==="ira"&&this.pane.dataset.v==="play"){ this.update(dt,T); this.render(T); } requestAnimationFrame(f); };
    requestAnimationFrame(f); },
  hit(){ const st=this.st; st.lives--; st.flash=now(); sfx.ng(); if(this.s.vib&&navigator.vibrate) try{ navigator.vibrate(120); }catch(e){}
    this.hud();
    if(st.lives<=0){ st.phase="over"; this.msg(t("iraOver")); setTimeout(()=>this.finish(false),900); return; }
    // チェックポイントからやり直し
    const p=st.c.P[st.c.cps[st.cp]]; st.b={x:p.x,y:p.y}; st.v={x:0,y:0}; st.pend={x:0,y:0}; st.prog=st.c.cps[st.cp]; st.phase="wait"; st.t0=now(); this.msg(t("iraOuch")); },
  update(dt,T){ const st=this.st, c=st.c;
    if(st.phase==="ready"||st.phase==="wait"){ if(T-st.t0>(st.phase==="ready"?1300:900)){ st.phase="run"; this.msg(""); st.pend={x:0,y:0}; st.v={x:0,y:0}; } return; }
    if(st.phase!=="run") return;
    st.ms+=dt; st.tick=(st.tick||0)+dt; if(st.tick>100){ st.tick=0; $("#iraTime").textContent=fmtSec(st.total+st.ms); }
    // 動かす量
    let mx=0,my=0;
    if(this.s.ctl==="tilt"&&this.tilt){ const z=this.zero||{b:0,g:0}; let gx=this.tilt.g-z.g, gy=this.tilt.b-z.b;
      const o=(screen.orientation&&screen.orientation.angle)||window.orientation||0; if(o===90){ [gx,gy]=[gy,-gx]; } else if(o===-90||o===270){ [gx,gy]=[-gy,gx]; }
      const dz=v=>Math.abs(v)<1.2?0:v-Math.sign(v)*1.2; // 少しの傾きは無視
      const k=.0016*dt; st.v.x=(st.v.x+dz(gx)*k)*.93; st.v.y=(st.v.y+dz(gy)*k)*.93;
      const sp=Math.hypot(st.v.x,st.v.y),mxs=2.4; if(sp>mxs){ st.v.x*=mxs/sp; st.v.y*=mxs/sp; }
      mx=st.v.x*dt/16; my=st.v.y*dt/16; }
    else { mx=st.pend.x; my=st.pend.y; st.pend={x:0,y:0}; const L=Math.hypot(mx,my),cap=12; if(L>cap){ mx*=cap/L; my*=cap/L; } }
    // 少しずつ進めて、壁を通り抜けないように
    const steps=Math.max(1,Math.ceil(Math.hypot(mx,my)/1.5));
    for(let s=0;s<steps;s++){ st.b.x+=mx/steps; st.b.y+=my/steps;
      st.b.x=Math.max(R,Math.min(LW-R,st.b.x)); st.b.y=Math.max(R,Math.min(LH-R,st.b.y));
      // いちばん近い通路の点（今の進み具合のまわりだけ探す）
      const P=c.P; let best=1e9,bi=st.prog; const a0=Math.max(0,st.prog-50),a1=Math.min(P.length-2,st.prog+50);
      for(let i=a0;i<=a1;i++){ const d=segDist(st.b.x,st.b.y,P[i],P[i+1]); if(d<best){ best=d; bi=i; } }
      st.prog=bi;
      if(best>c.hw-R){ return this.hit(); }
      for(const b of c.bars){ const a=b.ph+b.sp*(T/1000),ex=Math.cos(a)*b.L,ey=Math.sin(a)*b.L;
        if(segDist(st.b.x,st.b.y,{x:b.x,y:b.y},{x:b.x+ex,y:b.y+ey})<R+2.5) return this.hit(); } }
    // チェックポイント
    for(let k=c.cps.length-1;k>st.cp;k--){ if(st.prog>=c.cps[k]){ st.cp=k; sfx.flash(); this.msg(t("iraCp")); setTimeout(()=>{ if(this.st===st&&st.phase==="run") this.msg(""); },900); break; } }
    // ゴール
    const g=c.P[c.P.length-1]; if(Math.hypot(st.b.x-g.x,st.b.y-g.y)<c.hw*.8){ this.clear(); } },
  clear(){ const st=this.st; st.phase="clear"; st.total+=st.ms; sfx.win();
    const r=this.rec(); if(st.stage>r.stage||(st.stage===r.stage&&st.total<r.ms)) store.set("p_ira_rec",{stage:st.stage,ms:st.total});
    if(st.stage>=STAGES){ this.msg(t("iraAll")); setTimeout(()=>this.finish(true),1100); return; }
    this.msg(t("iraClear",{n:st.stage,tm:fmtSec(st.ms)})); const id=st.id;
    setTimeout(()=>{ if(!this.st||this.st.id!==id) return; this.load(st.stage+1); },1500); },
  finish(all){ const st=this.st; if(!st) return; const reached=all?STAGES:st.stage-(st.phase==="over"?1:0);
    const r=this.rec(); const best=reached>0&&(reached>r.stage||(reached===r.stage&&st.total<=r.ms));
    if(reached>0&&best) store.set("p_ira_rec",{stage:reached,ms:st.total});
    showResult({title:all?t("iraAll"):t("iraOver"),big:String(Math.max(0,reached)),bigLbl:t("iraCleared"),isBest:best&&reached>0,
      stats:[[t("iraStageLbl"),`${st.stage}`],[t("iraTotal"),fmtSec(st.total)],[t("iraStart"),String(this.s.from)]],
      retry:()=>this.start(),close:()=>this.quit()}); },
  hud(){ const st=this.st; $("#iraStage").textContent=t("iraStageN",{n:st.stage}); $("#iraLives").innerHTML=[0,1,2].map(i=>`<i class="ic${i<st.lives?"":" lost"}">${ico("heartf")}</i>`).join(""); $("#iraTime").textContent=fmtSec(st.total+st.ms); },
  msg(h){ $("#iraMsg").innerHTML=h||""; },
  colors(){ if(this.cols) return this.cols; const cs=getComputedStyle(document.documentElement),g=k=>cs.getPropertyValue(k).trim();
    return this.cols={bg:g("--panel"),path:g("--soft"),wall:g("--c-ira"),ink:g("--ink"),line:g("--line"),ball:g("--c-ball"),bar:g("--danger"),ok:g("--ok"),star:g("--star")}; },
  render(T){ const st=this.st,c=st.c,cv=$("#iraCv"),ctx=cv.getContext("2d"),C=this.colors(),z=this.z*this.dpr;
    ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height); ctx.setTransform(z,0,0,z,0,0);
    ctx.fillStyle=C.bg; ctx.fillRect(0,0,LW,LH);
    const P=c.P, path=()=>{ ctx.beginPath(); ctx.moveTo(P[0].x,P[0].y); for(let i=1;i<P.length;i++) ctx.lineTo(P[i].x,P[i].y); };
    ctx.lineJoin="round"; ctx.lineCap="round";
    // 壁（外側の太い線）→ 通路
    path(); ctx.strokeStyle=C.wall; ctx.lineWidth=c.hw*2+8; ctx.stroke();
    path(); ctx.strokeStyle=C.path; ctx.lineWidth=c.hw*2; ctx.stroke();
    // 通った所
    ctx.save(); ctx.globalAlpha=.18; ctx.beginPath(); ctx.moveTo(P[0].x,P[0].y); for(let i=1;i<=st.prog;i++) ctx.lineTo(P[i].x,P[i].y); ctx.strokeStyle=C.ball; ctx.lineWidth=c.hw*2; ctx.stroke(); ctx.restore();
    // チェックポイント
    c.cps.forEach((k,j)=>{ if(!j) return; const p=P[k],q=P[Math.min(P.length-1,k+3)],a=Math.atan2(q.y-p.y,q.x-p.x)+Math.PI/2;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(a); ctx.strokeStyle=j<=st.cp?C.ok:C.line; ctx.lineWidth=3; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(-c.hw,0); ctx.lineTo(c.hw,0); ctx.stroke(); ctx.restore(); });
    // スタート・ゴール
    const s0=P[0],g=P[P.length-1];
    ctx.fillStyle=C.line; ctx.beginPath(); ctx.arc(s0.x,s0.y,c.hw*.75,0,7); ctx.fill();
    ctx.save(); ctx.translate(g.x,g.y); for(let yy=-2;yy<2;yy++) for(let xx=-2;xx<2;xx++){ ctx.fillStyle=(xx+yy)&1?C.ink:"#fff"; const s=c.hw*.42; ctx.fillRect(xx*s,yy*s,s,s); } ctx.restore();
    // 回るバー
    c.bars.forEach(b=>{ const a=b.ph+b.sp*(T/1000),ex=Math.cos(a)*b.L,ey=Math.sin(a)*b.L;
      ctx.strokeStyle=C.bar; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(b.x,b.y); ctx.lineTo(b.x+ex,b.y+ey); ctx.stroke();
      ctx.fillStyle=C.ink; ctx.beginPath(); ctx.arc(b.x,b.y,4.5,0,7); ctx.fill(); });
    // 玉
    const fl=st.flash&&T-st.flash<500; ctx.fillStyle="rgba(0,0,0,.18)"; ctx.beginPath(); ctx.arc(st.b.x+1.5,st.b.y+2.5,R,0,7); ctx.fill();
    ctx.fillStyle=fl?C.bar:C.ball; ctx.beginPath(); ctx.arc(st.b.x,st.b.y,R,0,7); ctx.fill();
    ctx.fillStyle="rgba(255,255,255,.7)"; ctx.beginPath(); ctx.arc(st.b.x-2.2,st.b.y-2.4,2.2,0,7); ctx.fill();
    if(fl){ ctx.save(); ctx.globalAlpha=1-(T-st.flash)/500; ctx.strokeStyle=C.bar; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(st.b.x,st.b.y,R+4+(T-st.flash)/30,0,7); ctx.stroke(); ctx.restore(); }
    if(st.phase==="ready"){ const k=Math.max(0,1-(T-st.t0)/1300); ctx.fillStyle=C.ink; ctx.font=`700 ${44}px Fredoka, sans-serif`; ctx.textAlign="center"; ctx.globalAlpha=.25+.5*k; ctx.fillText(t("iraStageN",{n:st.stage}),LW/2,LH/2); ctx.globalAlpha=1; }
  }
};
return IRA;
});
