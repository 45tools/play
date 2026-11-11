// 45 Play ゲーム：rv（リバーシ）。開いたときだけ読み込まれる。共通の関数は index.html にある
BRAIN.def("rv",`
<section data-pane="rv" data-v="setup">
  <div class="vw" data-v="setup">
    <div class="panel">
      <h2 data-i="rvTitle"></h2>
      <p class="lead" data-i="rvLead"></p>
      <div class="opt"><span class="ol" data-i="rvVs"></span><div class="chips" id="rvVsSel">
        <button class="chip" data-val="cpu" data-i="rvVsCpu"></button><button class="chip" data-val="two" data-i="rvVsTwo"></button></div></div>
      <div class="opt" id="rvLvRow"><span class="ol" data-i="rvLv"></span><div class="chips" id="rvLvSel">
        <button class="chip" data-val="1" data-i="rvLv1"></button><button class="chip" data-val="2" data-i="rvLv2"></button><button class="chip" data-val="3" data-i="rvLv3"></button></div></div>
      <div class="opt" id="rvColRow"><span class="ol" data-i="rvYour"></span><div class="chips" id="rvColSel">
        <button class="chip" data-val="0" data-i="rvBlackFirst"></button><button class="chip" data-val="1" data-i="rvWhiteSecond"></button></div></div>
      <label class="opt sw"><span data-i="rvHint"></span><input type="checkbox" id="rvHintSw"></label>
    </div>
    <div class="panel">
      <h2 data-i="recTitle"></h2>
      <div id="rvRec" class="rvrec"></div>
    </div>
  </div>
  <div class="vw" data-v="play">
    <div class="phead"><button class="btn icon" id="rvQuit" aria-label="quit"><i class="ic" data-ic="x"></i></button>
      <div class="rvsc" id="rvSc0"><i class="rvd b"></i><span class="nm"></span><b class="num"></b></div>
      <div class="rvsc" id="rvSc1"><i class="rvd w"></i><span class="nm"></span><b class="num"></b></div></div>
    <div class="rvbox"><div class="rvboard" id="rvBoard"></div></div>
    <div class="banner" id="rvMsg"></div>
  </div>
</section>`,function(){
const N=8, DIRS=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
// 盤の場所の価値（隅が強く、隅の隣は弱い）
const W=[100,-25,10,5,5,10,-25,100, -25,-45,-2,-2,-2,-2,-45,-25, 10,-2,2,1,1,2,-2,10, 5,-2,1,0,0,1,-2,5,
         5,-2,1,0,0,1,-2,5, 10,-2,2,1,1,2,-2,10, -25,-45,-2,-2,-2,-2,-45,-25, 100,-25,10,5,5,10,-25,100];
function flips(b,i,p){ if(b[i]!==-1) return []; const r=i>>3,c=i&7,o=1-p,out=[];
  for(const [dr,dc] of DIRS){ let rr=r+dr,cc=c+dc,tmp=[];
    while(rr>=0&&rr<N&&cc>=0&&cc<N&&b[rr*8+cc]===o){ tmp.push(rr*8+cc); rr+=dr; cc+=dc; }
    if(tmp.length&&rr>=0&&rr<N&&cc>=0&&cc<N&&b[rr*8+cc]===p) out.push(...tmp); }
  return out; }
function moves(b,p){ const m=[]; for(let i=0;i<64;i++){ if(b[i]===-1){ const f=flips(b,i,p); if(f.length) m.push([i,f]); } } return m; }
function play(b,i,p,f){ const n=b.slice(); n[i]=p; f.forEach(k=>n[k]=p); return n; }
function count(b){ let k=0,w=0; b.forEach(v=>{ if(v===0) k++; else if(v===1) w++; }); return [k,w]; }
function evalB(b,p){ const o=1-p; let s=0,emp=0; for(let i=0;i<64;i++){ if(b[i]===p) s+=W[i]; else if(b[i]===o) s-=W[i]; else emp++; }
  // 隅を取ったら、隣のマイナスは消す
  [[0,1,8,9],[7,6,15,14],[56,57,48,49],[63,62,55,54]].forEach(([c,...ns])=>{ if(b[c]!==-1) ns.forEach(n=>{ if(b[n]===p) s-=W[n]; else if(b[n]===o) s+=W[n]; }); });
  const mp=moves(b,p).length, mo=moves(b,o).length; s+=(mp-mo)*(emp>20?6:3);
  if(emp<=12){ const [k,w]=count(b); s+=((p===0?k-w:w-k))*4; }
  return s; }
function ab(b,p,me,d,a,be){ const ms=moves(b,p);
  if(d===0) return evalB(b,me);
  if(!ms.length){ if(!moves(b,1-p).length){ const [k,w]=count(b),diff=me===0?k-w:w-k; return diff*1000; } return ab(b,1-p,me,d-1,a,be); }
  ms.sort((x,y)=>W[y[0]]-W[x[0]]);
  if(p===me){ let v=-1e9; for(const [i,f] of ms){ v=Math.max(v,ab(play(b,i,p,f),1-p,me,d-1,a,be)); a=Math.max(a,v); if(a>=be) break; } return v; }
  let v=1e9; for(const [i,f] of ms){ v=Math.min(v,ab(play(b,i,p,f),1-p,me,d-1,a,be)); be=Math.min(be,v); if(a>=be) break; } return v; }
function cpuMove(b,p,lv){ const ms=moves(b,p); if(!ms.length) return null;
  if(lv===1){ // よわい：ほぼランダム（たまに多く返せる所）
    if(Math.random()<.3) return ms.reduce((x,y)=>y[1].length>x[1].length?y:x); return ms[rnd(ms.length)]; }
  if(lv===2){ // ふつう：場所の価値＋返せる数で1手先だけ見る（少しゆらぎ）
    let best=null,bv=-1e9; for(const m of ms){ const v=evalB(play(b,m[0],p,m[1]),p)+Math.random()*8; if(v>bv){ bv=v; best=m; } } return best; }
  const emp=b.filter(v=>v===-1).length, d=emp<=10?emp:4; // つよい：4手先（終盤は最後まで）
  let best=ms[0],bv=-1e9; ms.sort((x,y)=>W[y[0]]-W[x[0]]);
  for(const m of ms){ const v=ab(play(b,m[0],p,m[1]),1-p,p,d-1,-1e9,1e9); if(v>bv){ bv=v; best=m; } } return best; }

const RV={
  s:Object.assign({vs:"cpu",lv:2,col:0,hint:true},store.get("p_rv",{})),
  st:null,rf:[],
  save(){ store.set("p_rv",this.s); },
  init(){ this.pane=$('[data-pane="rv"]');
    this.rf.push(chips($("#rvVsSel"),()=>this.s.vs,v=>{this.s.vs=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#rvLvSel"),()=>this.s.lv,v=>{this.s.lv=+v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#rvColSel"),()=>this.s.col,v=>{this.s.col=+v;this.save()}));
    $("#rvHintSw").onchange=e=>{ this.s.hint=e.target.checked; this.save(); if(this.st) this.draw(); };
    $("#rvQuit").onclick=()=>this.quit();
    const bd=$("#rvBoard"); bd.innerHTML=[...Array(64).keys()].map(i=>`<button class="rvc" data-c="${i}" aria-label="${"abcdefgh"[i&7]}${(i>>3)+1}"></button>`).join("");
    bd.addEventListener("click",e=>{ const c=e.target.closest("[data-c]"); if(c) this.tap(+c.dataset.c); });
    this.refresh(); },
  refresh(){ this.rf.forEach(f=>f()); $("#rvHintSw").checked=!!this.s.hint;
    const cpu=this.s.vs==="cpu"; $("#rvLvRow").hidden=!cpu; $("#rvColRow").hidden=!cpu;
    const R=store.get("p_rv_rec",{});
    $("#rvRec").innerHTML=[1,2,3].map(l=>{ const r=R[l]||{w:0,l:0,d:0}; return `<div class="best"><i class="ic" data-ic="trophy"></i><span>${esc(t("rvLv"+l))}</span><b class="num" style="font-size:18px">${esc(t("rvRecV",r))}</b></div>`; }).join("");
    paintIcons($("#rvRec")); if(this.st) this.draw(); },
  names(){ const st=this.st; if(this.s.vs!=="cpu") return [t("rvBlack"),t("rvWhite")]; return st.human===0?[t("ksYou"),t("ksCpu")]:[t("ksCpu"),t("ksYou")]; },
  view(v){ this.pane.dataset.v=v; if(mode==="rv") this.dock(); },
  dock(){ if(mode!=="rv") return; if(this.pane.dataset.v==="setup") return setDock(`<button class="btn primary big" data-act="start"><i class="ic" data-ic="play"></i>${esc(t("start"))}</button>`);
    const st=this.st; const can=st&&st.hist.length>(this.s.vs==="cpu"?0:0)&&!st.over&&!st.busy;
    setDock(`<div class="row2"><button class="btn" data-act="undo"${can?"":" disabled"}><i class="ic" data-ic="undo"></i>${esc(t("rvUndo"))}</button><button class="btn" data-act="restart"><i class="ic" data-ic="repeat"></i>${esc(t("rvRestart"))}</button></div>`,true); },
  act(a){ if(a==="start") this.start(); else if(a==="undo") this.undo(); else if(a==="restart") this.start(); },
  start(){ const b=Array(64).fill(-1); b[27]=1; b[28]=0; b[35]=0; b[36]=1;
    this.st={b,turn:0,human:this.s.vs==="cpu"?this.s.col:-1,hist:[],last:-1,over:false,busy:false,id:Math.random(),flipped:[]};
    this.view("play"); this.draw(); this.next(); },
  quit(){ this.st=null; this.view("setup"); this.refresh(); },
  isCpu(){ const st=this.st; return this.s.vs==="cpu"&&st.turn!==st.human; },
  tap(i){ const st=this.st; if(!st||st.over||st.busy||this.isCpu()) return; const f=flips(st.b,i,st.turn);
    if(!f.length){ if(st.b[i]===-1){ sfx.ng(); this.msg(t("rvCant")); } return; }
    st.hist.push({b:st.b.slice(),turn:st.turn,last:st.last}); this.put(i,f); },
  put(i,f){ const st=this.st; st.b=play(st.b,i,st.turn,f); st.last=i; st.flipped=f; sfx.tap(); setTimeout(()=>tone(520+f.length*40,.08,"triangle",.08),60);
    st.turn=1-st.turn; this.draw(true); this.next(); },
  next(){ const st=this.st; if(!st) return; const id=st.id;
    if(!moves(st.b,st.turn).length){
      if(!moves(st.b,1-st.turn).length) return this.end();
      const who=this.names()[st.turn]; st.turn=1-st.turn; this.msg(t("rvPass",{n:who})); toast(t("rvPass",{n:who})); this.draw(); }
    else this.msg("");
    this.dock();
    if(this.isCpu()){ st.busy=true; this.msg(t("ksCpuThink")); this.dock();
      setTimeout(()=>{ if(!this.st||this.st.id!==id) return; const m=cpuMove(st.b,st.turn,this.s.lv); st.busy=false; this.msg(""); if(m) this.put(m[0],m[1]); else this.next(); },550+rnd(350)); } },
  undo(){ const st=this.st; if(!st||!st.hist.length||st.busy) return;
    let h=st.hist.pop(); // CPU戦では自分の手までもどす
    if(this.s.vs==="cpu") while(h.turn!==st.human&&st.hist.length) h=st.hist.pop();
    st.b=h.b; st.turn=h.turn; st.last=h.last; st.flipped=[]; st.over=false; this.msg(""); this.draw(); this.dock(); },
  end(){ const st=this.st; st.over=true; this.draw(); this.dock(); const [k,w]=count(st.b),N2=this.names();
    let title,res=null; if(k===w){ title=t("ksDraw"); res="d"; } else { const win=k>w?0:1; title=t("rvWin",{n:N2[win]}); if(this.s.vs==="cpu") res=win===st.human?"w":"l"; }
    if(this.s.vs==="cpu"){ const R=store.get("p_rv_rec",{}),r=R[this.s.lv]||{w:0,l:0,d:0}; r[res]++; R[this.s.lv]=r; store.set("p_rv_rec",R); }
    if(res==="w"||this.s.vs!=="cpu") sfx.win(); else if(res==="l") sfx.ng();
    setTimeout(()=>{ if(this.st!==st) return; showResult({title,big:`${k} - ${w}`,bigLbl:`${t("rvBlack")} - ${t("rvWhite")}`,
      stats:[[N2[0],k],[N2[1],w],[t("rvMoves"),st.hist.length]],retry:()=>this.start(),close:()=>{}}); },900); },
  msg(h){ $("#rvMsg").innerHTML=h||""; },
  draw(anim){ const st=this.st; if(!st) return; const ms=new Set(moves(st.b,st.turn).map(m=>m[0])); const showHint=this.s.hint&&!st.over&&!this.isCpu();
    $$("#rvBoard .rvc").forEach(c=>{ const i=+c.dataset.c,v=st.b[i]; let h="";
      if(v!==-1) h=`<i class="rvd ${v?"w":"b"}${anim&&st.flipped.includes(i)?" flip":""}${anim&&i===st.last?" put":""}"></i>`;
      else if(showHint&&ms.has(i)) h=`<i class="rvh ${st.turn?"w":"b"}"></i>`;
      c.innerHTML=h; c.classList.toggle("last",i===st.last); });
    const [k,w]=count(st.b),N2=this.names();
    [0,1].forEach(p=>{ const el=$("#rvSc"+p); $(".nm",el).textContent=N2[p]; $("b",el).textContent=p?w:k; el.classList.toggle("on",!st.over&&st.turn===p); }); }
};
return RV;
});
