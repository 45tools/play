// 45 Play ゲーム：maze（ころころ迷路）。開いたときだけ読み込まれる。共通の関数は index.html にある
// 板を傾けて玉をころがす迷路。表の穴に落ちると板が裏返って裏面へ続く。柵や落とし穴はジャンプでこえる。2D／3D表示を切り替えられる
BRAIN.def("maze",`
<section data-pane="maze" data-v="setup">
  <div class="vw" data-v="setup">
    <div class="panel">
      <h2 data-i="mzTitle"></h2>
      <p class="lead" data-i="mzLead"></p>
      <div class="opt"><span class="ol" data-i="mzView"></span><div class="chips" id="mzViewSel">
        <button class="chip" data-val="3d">3D</button><button class="chip" data-val="2d">2D</button></div></div>
      <div class="opt"><span class="ol" data-i="mzCtl"></span><div class="chips" id="mzCtlSel">
        <button class="chip" data-val="tilt" data-i="mzTilt"></button><button class="chip" data-val="lever" data-i="mzLever"></button></div></div>
      <p class="lead" id="mzCtlNote" style="margin-top:8px"></p>
      <div class="opt"><span class="ol" data-i="mzFrom"></span><div class="chips" id="mzFromSel"></div></div>
      <label class="opt sw"><span data-i="mzVib"></span><input type="checkbox" id="mzVibSw"></label>
    </div>
    <div class="panel">
      <h2 data-i="mzParts"></h2>
      <ul class="mzleg">
        <li><i class="mzk wall"></i><span data-i="mzPWall"></span></li>
        <li><i class="mzk fence"></i><span data-i="mzPFence"></span></li>
        <li><i class="mzk pit"></i><span data-i="mzPPit"></span></li>
        <li><i class="mzk warp"></i><span data-i="mzPWarp"></span></li>
        <li><i class="mzk goal"></i><span data-i="mzPGoal"></span></li>
      </ul>
    </div>
    <div class="panel">
      <h2 data-i="recTitle"></h2>
      <div class="best"><i class="ic" data-ic="trophy"></i><span data-i="mzBest"></span><b class="num" id="mzBestV"></b></div>
    </div>
  </div>
  <div class="vw" data-v="play">
    <div class="phead"><button class="btn icon" id="mzQuit" aria-label="quit"><i class="ic" data-ic="x"></i></button>
      <b class="num prog" id="mzStage"></b><span class="hearts" id="mzLives"></span><div class="sp"></div>
      <span class="mzface" id="mzFace"></span>
      <button class="btn mzvt num" id="mzViewBtn" aria-label="2D / 3D"></button>
      <span class="num timer" id="mzTime"></span></div>
    <div class="mzbox"><canvas id="mzCv"></canvas><div class="mzmsg" id="mzMsg"></div></div>
    <div class="mzctl">
      <div class="mzstick" id="mzStick" aria-label="lever"><i></i></div>
      <button class="btn mzcal" id="mzCal"><i class="ic" data-ic="level"></i><span data-i="mzCalib"></span></button>
      <button class="mzjump" id="mzJump"><span data-i="mzJump"></span></button>
    </div>
  </div>
</section>`,function(){
/* ===== 面のデータ =====
   タイル：0 床 / 1 かべ / 2 柵（横向き。上下の移動をふさぐ）/ 3 柵（縦向き。左右の移動をふさぐ）/ 4 落とし穴 / 5 ワープ穴 / 6 ゴール
   迷路は「部屋（奇数の座標）」と「通路（部屋のあいだ）」でできている。face 0＝表、1＝裏。
   裏面は、板を左右に裏返したときに見えるままの向きで持つ（表の (x,y) の真裏は 裏の (W-1-x, y)） */
const R=.3, FENCE_H=.32, GJ=16, VJ=Math.sqrt(2*GJ*1.0), ACC=15, VMAX=6.2;
// 面の一覧：最初の3つは「練習」。cw×ch は部屋の数、seg は 1＝表だけ／2＝表→裏／3＝表→裏→表
// nf：通り道の柵（ジャンプが必要）、np：通り道の落とし穴、ns：近道の柵、nt：行き止まりの落とし穴（わな）
const DEFS=[
  {p:1,cw:4,ch:5,seg:1,nf:0,np:0,ns:0,nt:0},
  {p:2,cw:4,ch:6,seg:1,nf:2,np:1,ns:1,nt:0},
  {p:3,cw:4,ch:6,seg:2,nf:1,np:0,ns:1,nt:0},
  {n:1,cw:5,ch:7,seg:2,nf:1,np:1,ns:1,nt:0},
  {n:2,cw:5,ch:7,seg:2,nf:2,np:1,ns:2,nt:1},
  {n:3,cw:5,ch:8,seg:3,nf:1,np:1,ns:1,nt:1},
  {n:4,cw:6,ch:8,seg:2,nf:2,np:2,ns:2,nt:1},
  {n:5,cw:6,ch:8,seg:3,nf:1,np:1,ns:1,nt:1},
  {n:6,cw:6,ch:9,seg:2,nf:3,np:2,ns:2,nt:2},
  {n:7,cw:6,ch:9,seg:3,nf:2,np:1,ns:1,nt:1},
  {n:8,cw:7,ch:9,seg:2,nf:3,np:3,ns:2,nt:2},
  {n:9,cw:7,ch:10,seg:3,nf:2,np:2,ns:1,nt:1},
  {n:10,cw:7,ch:10,seg:3,nf:2,np:2,ns:2,nt:2},
];
const STAGES=DEFS.length;
const label=i=>{ const d=DEFS[i]; return d.p?t("mzPracN",{n:d.p}):t("mzStageN",{n:d.n}); };
const chipLbl=i=>{ const d=DEFS[i]; return d.p?t("mzPracS",{n:d.p}):String(d.n); };
function rng(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }

function build(idx){
  const D=DEFS[idx], r=rng(7300+idx*131), W=D.cw*2+1, H=D.ch*2+1;
  const faces=[0,1].slice(0,D.seg>1?2:1).map(()=>({W,H,t:new Uint8Array(W*H).fill(1)}));
  const at=(f,x,y)=>(x<0||y<0||x>=W||y>=H)?1:faces[f].t[y*W+x];
  const put=(f,x,y,v)=>{ faces[f].t[y*W+x]=v; };
  const mir=x=>W-1-x;
  // 部屋の範囲（cy0〜cy1 行）の中に迷路をほる（穴ほり法）
  function carve(f,cy0,cy1){ const seen=new Set(), key=(x,y)=>x+","+y;
    const st=[[Math.floor(r()*D.cw),cy0+Math.floor(r()*(cy1-cy0+1))]]; seen.add(key(...st[0])); put(f,st[0][0]*2+1,st[0][1]*2+1,0);
    while(st.length){ const [x,y]=st[st.length-1];
      const nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[x+dx,y+dy,dx,dy]).filter(([a,b])=>a>=0&&a<D.cw&&b>=cy0&&b<=cy1&&!seen.has(key(a,b)));
      if(!nb.length){ st.pop(); continue; }
      const [a,b,dx,dy]=nb[Math.floor(r()*nb.length)]; seen.add(key(a,b));
      put(f,x*2+1+dx,y*2+1+dy,0); put(f,a*2+1,b*2+1,0); st.push([a,b]); } }
  // 部屋どうしの道のり（タイル単位の幅優先）
  function bfs(f,sx,sy){ const dist=new Int32Array(W*H).fill(-1), par=new Int32Array(W*H).fill(-1), q=[sy*W+sx]; dist[q[0]]=0;
    for(let h=0;h<q.length;h++){ const i=q[h],x=i%W,y=(i-x)/W;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a=x+dx,b=y+dy; if(at(f,a,b)===1) continue; const j=b*W+a; if(dist[j]>=0) continue; dist[j]=dist[i]+1; par[j]=i; q.push(j); } }
    return {dist,par}; }
  const isRoom=(x,y)=>x%2===1&&y%2===1;
  // 1つの区間：start の部屋から、条件に合ういちばん遠い部屋まで。通り道に柵・落とし穴を置く
  function segment(f,cy0,cy1,sx,sy,okEnd,si,sn){
    const {dist,par}=bfs(f,sx,sy); let best=-1,ex=sx,ey=sy;
    for(let cy=cy0;cy<=cy1;cy++) for(let cx=0;cx<D.cw;cx++){ const x=cx*2+1,y=cy*2+1,d=dist[y*W+x]; if(d>best&&(!okEnd||okEnd(x,y))){ best=d; ex=x; ey=y; } }
    const path=[]; for(let i=ey*W+ex;i>=0;i=par[i]) path.unshift(i);
    const onPath=new Set(path), used=new Set([0,path.length-1]);
    const far=i=>{ for(const u of used) if(Math.abs(u-i)<4) return false; return true; };
    const cnt=v=>Math.floor(v/sn)+((sn-1-si)<v%sn?1:0); // 区間ごとに分ける（あとの区間を多めに）
    // 通り道の落とし穴（まっすぐ通りぬける部屋）
    let cand=[]; for(let i=3;i<path.length-3;i++){ const p=path[i],x=p%W,y=(p-x)/W; if(!isRoom(x,y)) continue;
      const a=path[i-1],b=path[i+1]; if((a%W===x&&b%W===x)||(((a-a%W)/W)===y&&((b-b%W)/W)===y)) cand.push(i); }
    for(let k=cnt(D.np);k>0&&cand.length;){ const j=Math.floor(r()*cand.length), i=cand.splice(j,1)[0]; if(!far(i)) continue;
      const x=path[i]%W,y=(path[i]-x)/W; put(f,x,y,4); used.add(i); k--; }
    // 通り道の柵（通路のタイル）
    cand=[]; for(let i=3;i<path.length-3;i++){ const x=path[i]%W,y=(path[i]-x)/W; if(!isRoom(x,y)) cand.push(i); }
    for(let k=cnt(D.nf);k>0&&cand.length;){ const j=Math.floor(r()*cand.length), i=cand.splice(j,1)[0]; if(!far(i)) continue;
      const x=path[i]%W,y=(path[i]-x)/W; put(f,x,y,x%2===0?3:2); used.add(i); k--; }
    // 近道の柵：かべをへだてて、道のりがずっと先の部屋どうしをつなぐ
    cand=[]; for(let y=cy0*2+1;y<=cy1*2+1;y++) for(let x=1;x<W-1;x++){ if(at(f,x,y)!==1||(x%2)===(y%2)) continue;
      const hz=x%2===0, a=hz?[x-1,y]:[x,y-1], b=hz?[x+1,y]:[x,y+1]; if(a[1]<cy0*2+1||b[1]>cy1*2+1) continue;
      const da=dist[a[1]*W+a[0]],db=dist[b[1]*W+b[0]]; if(da<0||db<0||Math.abs(da-db)<14) continue; cand.push([x,y,hz]); }
    for(let k=cnt(D.ns);k>0&&cand.length;k--){ const [x,y,hz]=cand.splice(Math.floor(r()*cand.length),1)[0]; put(f,x,y,hz?3:2); }
    // わなの落とし穴：通り道から外れた行き止まり
    cand=[]; for(let cy=cy0;cy<=cy1;cy++) for(let cx=0;cx<D.cw;cx++){ const x=cx*2+1,y=cy*2+1; if(onPath.has(y*W+x)) continue;
      const open=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>at(f,x+dx,y+dy)!==1).length; if(open===1) cand.push([x,y]); }
    for(let k=cnt(D.nt);k>0&&cand.length;k--){ const [x,y]=cand.splice(Math.floor(r()*cand.length),1)[0]; put(f,x,y,4); }
    return [ex,ey]; }
  const sx=Math.floor(D.cw/2)*2+1, warps=[]; let start={f:0,x:sx,y:H-2}, goal;
  if(D.seg===1){ carve(0,0,D.ch-1); const [gx,gy]=segment(0,0,D.ch-1,sx,H-2,null,0,1); put(0,gx,gy,6); goal={f:0,x:gx,y:gy}; }
  else {
    const h1=D.seg===3?Math.floor(D.ch/2):0;
    carve(0,h1,D.ch-1); if(D.seg===3) carve(0,0,h1-1); carve(1,0,D.ch-1);
    const [ax,ay]=segment(0,h1,D.ch-1,sx,H-2,null,0,D.seg); put(0,ax,ay,5); put(1,mir(ax),ay,5); warps.push({f:0,x:ax,y:ay},{f:1,x:mir(ax),y:ay});
    if(D.seg===2){ const [gx,gy]=segment(1,0,D.ch-1,mir(ax),ay,(x,y)=>!(x===mir(ax)&&y===ay),1,2); put(1,gx,gy,6); goal={f:1,x:gx,y:gy}; }
    else { const [bx,by]=segment(1,0,D.ch-1,mir(ax),ay,(x,y)=>y<h1*2,1,3); put(1,bx,by,5); put(0,mir(bx),by,5); warps.push({f:1,x:bx,y:by},{f:0,x:mir(bx),y:by});
      const [gx,gy]=segment(0,0,h1-1,mir(bx),by,null,2,3); put(0,gx,gy,6); goal={f:0,x:gx,y:gy}; }
  }
  // ワープのつながり（表と裏で同じ場所の穴どうし）
  const link={}; for(let i=0;i<warps.length;i+=2){ const a=warps[i],b=warps[i+1]; link[a.f+":"+a.x+":"+a.y]=b; link[b.f+":"+b.x+":"+b.y]=a; }
  return {faces,W,H,start,goal,link,at}; }

// 色（表はピンク系、裏は水色系）
function palette(f){ const dk=matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches;
  if(f===0) return dk?{floor:"#3A2C3F",floor2:"#43334A",wall:"#E0559F",wallTop:"#F27BB8",wallSide:"#B23D7C",base:"#7A2E5A",grid:"rgba(255,255,255,.04)"}
                     :{floor:"#FFF4F8",floor2:"#FFE9F2",wall:"#F062A8",wallTop:"#FF8CC4",wallSide:"#C9478A",base:"#B93A7C",grid:"rgba(200,60,130,.07)"};
  return dk?{floor:"#24344A",floor2:"#2A3B53",wall:"#3E8EF0",wallTop:"#67A8FF",wallSide:"#2B6AC0",base:"#21508F",grid:"rgba(255,255,255,.04)"}
           :{floor:"#EFF7FF",floor2:"#E2F0FF",wall:"#4A95F5",wallTop:"#79B4FF",wallSide:"#2F72CC",base:"#2A62B0",grid:"rgba(40,110,220,.07)"}; }
const PIT="#1B1530", FENCE="#FFC23D", FENCE2="#C98A10", WARP="#22C08A", GOLD="#FFB21E";
const easeIO=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;

const MZ={
  s:Object.assign({view:"3d",ctl:("ontouchstart" in window&&"DeviceOrientationEvent" in window)?"tilt":"lever",from:0,vib:true},store.get("p_mz",{})),
  st:null,rf:[],tilt:null,stick:{x:0,y:0},keys:{},
  save(){ store.set("p_mz",this.s); },
  init(){ this.pane=$('[data-pane="maze"]');
    this.rf.push(chips($("#mzViewSel"),()=>this.s.view,v=>{this.s.view=v;this.save()}));
    this.rf.push(chips($("#mzCtlSel"),()=>this.s.ctl,v=>{this.s.ctl=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#mzFromSel"),()=>this.s.from,v=>{this.s.from=+v;this.save()}));
    $("#mzVibSw").onchange=e=>{ this.s.vib=e.target.checked; this.save(); };
    $("#mzQuit").onclick=()=>this.quit();
    $("#mzViewBtn").onclick=()=>{ this.s.view=this.s.view==="3d"?"2d":"3d"; this.save(); this.hud(); sfx.tap(); };
    $("#mzCal").onclick=()=>this.calib();
    const jb=$("#mzJump"); jb.addEventListener("pointerdown",e=>{ e.preventDefault(); this.jump(); });
    const cv=$("#mzCv"); cv.addEventListener("pointerdown",e=>{ if(this.st&&this.s.ctl==="tilt"){ e.preventDefault(); this.jump(); } });
    // 操作レバー
    const sk=$("#mzStick"), knob=sk.firstElementChild; let pid=null;
    const mv=e=>{ const b=sk.getBoundingClientRect(), rr=b.width/2, dx=e.clientX-b.left-rr, dy=e.clientY-b.top-rr, L=Math.hypot(dx,dy), m=rr*.62, k=L>m?m/L:1;
      this.stick={x:dx*k/m,y:dy*k/m}; knob.style.transform=`translate(${dx*k}px,${dy*k}px)`; };
    sk.addEventListener("pointerdown",e=>{ e.preventDefault(); pid=e.pointerId; sk.setPointerCapture(pid); sk.classList.add("on"); mv(e); });
    sk.addEventListener("pointermove",e=>{ if(e.pointerId===pid) mv(e); });
    const up=e=>{ if(e.pointerId!==pid) return; pid=null; this.stick={x:0,y:0}; knob.style.transform=""; sk.classList.remove("on"); };
    sk.addEventListener("pointerup",up); sk.addEventListener("pointercancel",up);
    // パソコン：矢印キー（WASD）とスペース
    const KM={ArrowLeft:"l",ArrowRight:"r",ArrowUp:"u",ArrowDown:"d",a:"l",d:"r",w:"u",s:"d",A:"l",D:"r",W:"u",S:"d"};
    document.addEventListener("keydown",e=>{ if(mode!=="maze"||!this.st) return; if(e.key===" "){ e.preventDefault(); if(!e.repeat) this.jump(); return; } const k=KM[e.key]; if(k){ this.keys[k]=1; e.preventDefault(); } });
    document.addEventListener("keyup",e=>{ const k=KM[e.key]; if(k) this.keys[k]=0; });
    window.addEventListener("blur",()=>{ this.keys={}; });
    window.addEventListener("deviceorientation",e=>{ if(e.beta==null) return; this.tilt={b:e.beta,g:e.gamma}; });
    window.addEventListener("resize",()=>{ if(this.st) this.fit(); });
    this.refresh(); },
  rec(){ return store.get("p_mz_rec",{idx:-1,ms:0}); },
  refresh(){ const r=this.rec(), top=Math.max(3,Math.min(STAGES-1,r.idx+1));
    $("#mzFromSel").innerHTML=[...Array(STAGES).keys()].map(i=>`<button class="chip num" data-val="${i}"${i>top?" disabled":""}>${esc(chipLbl(i))}</button>`).join("");
    if(!(this.s.from>=0&&this.s.from<=top)) this.s.from=0;
    this.rf.forEach(f=>f()); $("#mzVibSw").checked=!!this.s.vib;
    $("#mzCtlNote").innerHTML=t(this.s.ctl==="tilt"?"mzTiltNote":"mzLeverNote");
    $("#mzBestV").textContent=r.idx>=0?t("mzBestV",{n:label(Math.min(r.idx,STAGES-1)),tm:fmtSec(r.ms)}):"—";
    if(this.st) this.hud(); },
  view(v){ this.pane.dataset.v=v; if(mode==="maze") this.dock(); },
  dock(){ if(mode!=="maze") return; if(this.pane.dataset.v==="setup") return setDock(`<button class="btn primary big" data-act="start"><i class="ic" data-ic="play"></i>${esc(t("start"))}</button>`);
    setDock(""); },
  act(a){ if(a==="start") this.start(); },
  async start(){
    if(this.s.ctl==="tilt"){ // iPhoneは許可が必要（ボタンを押したときに聞く）
      try{ if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function"){ const p=await DeviceOrientationEvent.requestPermission(); if(p!=="granted") throw 0; } }
      catch(e){ toast(t("mzNoTilt")); this.s.ctl="lever"; this.save(); this.refresh(); } }
    this.st={lives:5,ms:0,total:0,id:Math.random()};
    $('[data-pane="maze"] .mzctl').dataset.ctl=this.s.ctl;
    this.view("play"); this.load(this.s.from); this.fit(); this.loop(); },
  load(n){ const st=this.st; st.lv=build(n); st.stage=n; st.ms=0; st.flash=0; st.vis={x:0,y:0};
    const s=st.lv.start; st.face=s.f; st.spawn={...s}; st.b={x:s.x+.5,y:s.y+.5,z:0,vx:0,vy:0,vz:0}; st.cool=null; st.flip=null; st.fall=null;
    st.phase="ready"; st.t0=now(); this.calib(true); this.fitCam(); this.hud(); this.msg(t("mzReady",{n:label(n)})); },
  calib(silent){ this.zero=this.tilt?{...this.tilt}:{b:0,g:0}; if(!silent){ toast(t("mzCalibDone")); sfx.tap(); } },
  quit(){ this.st=null; this.keys={}; this.view("setup"); this.refresh(); },
  fit(){ const cv=$("#mzCv"),box=cv.parentElement; if(!box.clientWidth) return;
    const top=box.getBoundingClientRect().top, ctl=$('[data-pane="maze"] .mzctl').offsetHeight||120;
    const avail=(window.innerHeight||700)-top-ctl-14;
    const w=Math.min(box.clientWidth,520), h=Math.max(240,Math.min(avail,w*1.75)), dpr=Math.min(2,window.devicePixelRatio||1);
    cv.style.width=w+"px"; cv.style.height=h+"px"; cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); this.CW=w; this.CH=h; this.dpr=dpr; this.fitCam(); },
  loop(){ const id=this.st.id; let last=now();
    const f=()=>{ if(!this.st||this.st.id!==id) return; const T=now(),dt=Math.min(50,T-last); last=T; if(mode==="maze"&&this.pane.dataset.v==="play"){ this.update(dt/1000,T); this.render(T); } requestAnimationFrame(f); };
    requestAnimationFrame(f); },
  vib(ms){ if(this.s.vib&&navigator.vibrate) try{ navigator.vibrate(ms); }catch(e){} },
  jump(big){ const st=this.st; if(!st||st.phase!=="run") return; const b=st.b; if(b.z>0.001||b.vz>0) return;
    b.vz=VJ*(big||1); tone(520,.12,"sine",.13); tone(780,.12,"sine",.1,.06); this.vib(15); },
  // 入力（-1〜1）
  input(){ let x=0,y=0;
    if(this.s.ctl==="tilt"&&this.tilt){ const z=this.zero||{b:0,g:0}; let gx=this.tilt.g-z.g, gy=this.tilt.b-z.b;
      const o=(screen.orientation&&screen.orientation.angle)||window.orientation||0; if(o===90){ [gx,gy]=[gy,-gx]; } else if(o===-90||o===270){ [gx,gy]=[-gy,gx]; }
      const dz=v=>Math.abs(v)<1.5?0:v-Math.sign(v)*1.5; x=dz(gx)/18; y=dz(gy)/18; }
    else { x=this.stick.x; y=this.stick.y; }
    const k=this.keys; x+=(k.r?1:0)-(k.l?1:0); y+=(k.d?1:0)-(k.u?1:0);
    const L=Math.hypot(x,y); if(L>1){ x/=L; y/=L; } return {x,y}; },
  boxes(f,tx,ty,z){ const v=this.st.lv.at(f,tx,ty);
    if(v===1) return [[tx,ty,tx+1,ty+1]];
    if(z<FENCE_H){ if(v===3) return [[tx+.36,ty,tx+.64,ty+1]]; if(v===2) return [[tx,ty+.36,tx+1,ty+.64]]; }
    return null; },
  update(dt,T){ const st=this.st, b=st.b;
    const inp=this.input(); st.vis.x+=(inp.x-st.vis.x)*Math.min(1,dt*8); st.vis.y+=(inp.y-st.vis.y)*Math.min(1,dt*8);
    if(st.phase==="ready"){ if(T-st.t0>1200){ st.phase="run"; this.msg(""); } return; }
    if(st.phase==="fall"){ if(T-st.fall.t>900){ st.fall=null; if(st.lives<=0){ st.phase="over"; this.msg(t("mzOver")); setTimeout(()=>{ if(this.st===st) this.finish(false); },900); return; }
        const s=st.spawn; if(st.face!==s.f){ st.face=s.f; this.fitCam(); } Object.assign(b,{x:s.x+.5,y:s.y+.5,z:0,vx:0,vy:0,vz:0}); st.cool=st.lv.link[s.f+":"+s.x+":"+s.y]?{x:s.x,y:s.y}:null; st.phase="run"; this.msg(""); } return; }
    if(st.phase==="warp"){ const u=(T-st.flip.t)/st.flip.dur; if(u>=1){ const to=st.flip.to; st.face=to.f; st.flip=null; this.fitCam();
        Object.assign(b,{x:to.x+.5,y:to.y+.5,z:0,vx:0,vy:0,vz:VJ*.55}); st.cool={x:to.x,y:to.y}; st.spawn={f:to.f,x:to.x,y:to.y}; st.phase="run"; this.msg(""); this.hud(); tone(880,.1,"sine",.1); } return; }
    if(st.phase!=="run") return;
    st.ms+=dt*1000; st.tick=(st.tick||0)+dt; if(st.tick>.1){ st.tick=0; $("#mzTime").textContent=fmtSec(st.total+st.ms); }
    const air=b.z>0.001||b.vz>0, acc=ACC*(air?.45:1);
    b.vx+=inp.x*acc*dt; b.vy+=inp.y*acc*dt;
    const fr=Math.exp(-(air?.3:1.1)*dt); b.vx*=fr; b.vy*=fr;
    const sp=Math.hypot(b.vx,b.vy); if(sp>VMAX){ b.vx*=VMAX/sp; b.vy*=VMAX/sp; }
    // ジャンプ（高さ）
    const wasAir=air; if(air){ b.vz-=GJ*dt; b.z+=b.vz*dt; if(b.z<=0){ b.z=0; b.vz=0; if(wasAir) tone(170,.07,"triangle",.09); } }
    // 少しずつ動かして、かべを通りぬけないように
    const steps=Math.max(1,Math.ceil(Math.hypot(b.vx,b.vy)*dt/.07)); let bump=0;
    for(let s=0;s<steps;s++){ b.x+=b.vx*dt/steps; b.y+=b.vy*dt/steps;
      const tx0=Math.floor(b.x),ty0=Math.floor(b.y);
      for(let ty=ty0-1;ty<=ty0+1;ty++) for(let tx=tx0-1;tx<=tx0+1;tx++){ const bx=this.boxes(st.face,tx,ty,b.z); if(!bx) continue;
        for(const [x0,y0,x1,y1] of bx){ const cx=Math.max(x0,Math.min(x1,b.x)), cy=Math.max(y0,Math.min(y1,b.y)); let dx=b.x-cx, dy=b.y-cy, d=Math.hypot(dx,dy);
          if(d>=R) continue;
          if(d<1e-6){ const pl=[[b.x-x0,-1,0],[x1-b.x,1,0],[b.y-y0,0,-1],[y1-b.y,0,1]].sort((a,c)=>a[0]-c[0])[0]; dx=pl[1]; dy=pl[2]; d=0; } else { dx/=d; dy/=d; }
          b.x+=dx*(R-d); b.y+=dy*(R-d); const vn=b.vx*dx+b.vy*dy; if(vn<0){ b.vx-=1.35*vn*dx; b.vy-=1.35*vn*dy; bump=Math.max(bump,-vn); } } } }
    if(bump>2.2&&T-(st.bumpT||0)>120){ st.bumpT=T; tone(200+bump*25,.05,"triangle",Math.min(.12,.03+bump*.012)); if(bump>4) this.vib(10); }
    // 床のしかけ（地面にいるとき）
    const lv=st.lv, tx=Math.floor(b.x), ty=Math.floor(b.y), v=lv.at(st.face,tx,ty), ox=b.x-tx-.5, oy=b.y-ty-.5, od=Math.hypot(ox,oy);
    if(st.cool&&Math.hypot(b.x-st.cool.x-.5,b.y-st.cool.y-.5)>.62) st.cool=null;
    if(b.z>0.001) return;
    if(v===4&&Math.abs(ox)<.36&&Math.abs(oy)<.36) return this.pit(T,tx,ty);
    if(v===5&&od<.3&&!(st.cool&&st.cool.x===tx&&st.cool.y===ty)){ const to=lv.link[st.face+":"+tx+":"+ty]; if(to) return this.warp(T,tx,ty,to); }
    if(v===6&&od<.42) return this.clear(); },
  pit(T,tx,ty){ const st=this.st; st.lives--; st.phase="fall"; st.fall={t:T,x:tx+.5,y:ty+.5}; st.flash=T; sfx.ng(); tone(400,.4,"sine",.08); tone(200,.4,"sine",.06,.15); this.vib(120); this.hud(); this.msg(t("mzFall")); },
  warp(T,tx,ty,to){ const st=this.st; st.phase="warp"; st.flip={t:T,dur:1500,from:st.face,to,x:tx+.5,y:ty+.5};
    [392,523,659,784,1047].forEach((f,i)=>tone(f,.12,"sine",.09,i*.07)); this.vib(30); this.msg(t(to.f===1?"mzToBack":"mzToFront")); },
  clear(){ const st=this.st; st.phase="clear"; st.total+=st.ms; sfx.win(); st.clearT=now();
    const r=this.rec(); if(st.stage>r.idx||(st.stage===r.idx&&st.total<r.ms)) store.set("p_mz_rec",{idx:st.stage,ms:st.total});
    if(st.stage>=STAGES-1){ this.msg(t("mzAll")); setTimeout(()=>{ if(this.st===st) this.finish(true); },1300); return; }
    this.msg(t("mzClear",{n:label(st.stage),tm:fmtSec(st.ms)})); const id=st.id;
    setTimeout(()=>{ if(!this.st||this.st.id!==id) return; this.load(st.stage+1); },1700); },
  finish(all){ const st=this.st; if(!st) return; const reached=all?STAGES-1:st.stage-1;
    const r=this.rec(); const best=reached>=this.s.from&&(reached>r.idx||(reached===r.idx&&st.total<=r.ms));
    if(best) store.set("p_mz_rec",{idx:reached,ms:st.total});
    showResult({title:all?t("mzAll"):t("mzOver"),big:reached>=this.s.from?label(reached):"—",bigLbl:t("mzCleared"),isBest:best,
      stats:[[t("mzStageLbl"),label(st.stage)],[t("mzTotal"),fmtSec(st.total)],[t("mzStart"),label(this.s.from)]],
      retry:()=>this.start(),close:()=>this.quit()}); },
  hud(){ const st=this.st; if(!st) return; $("#mzStage").textContent=label(st.stage);
    $("#mzLives").innerHTML=[0,1,2,3,4].map(i=>`<i class="ic${i<st.lives?"":" lost"}">${ico("heartf")}</i>`).join("");
    $("#mzTime").textContent=fmtSec(st.total+st.ms);
    const two=st.lv.faces.length>1, f=$("#mzFace"); f.hidden=!two; f.textContent=t(st.face===0?"mzFront":"mzBack"); f.dataset.f=st.face;
    $("#mzViewBtn").textContent=this.s.view==="3d"?"3D":"2D"; },
  msg(h){ $("#mzMsg").innerHTML=h||""; $("#mzMsg").classList.toggle("on",!!h); },

  /* ===== 3D：かんたんな透視投影 ===== */
  fitCam(){ const st=this.st; if(!st||!this.CW) return; const lv=st.lv, PH=.68;
    this.cam={ph:PH,D:Math.max(lv.W,lv.H)*2.1,S:1,ox:0,oy:0};
    const pts=[]; for(const [x,y] of [[0,0],[lv.W,0],[0,lv.H],[lv.W,lv.H]]) for(const z of [-.55,0,.8]) pts.push(this.P(x,y,z,0,0,0));
    const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]), bw=Math.max(...xs)-Math.min(...xs), bh=Math.max(...ys)-Math.min(...ys);
    const S=Math.min((this.CW-18)/bw,(this.CH-22)/bh); this.cam.S=S; this.cam.ox=this.CW/2-S*(Math.max(...xs)+Math.min(...xs))/2; this.cam.oy=this.CH/2-S*(Math.max(...ys)+Math.min(...ys))/2;
    // 2D の大きさ
    this.s2=Math.min((this.CW-12)/lv.W,(this.CH-12)/lv.H); },
  // 面の座標 (x,y,z) → 画面 [sx,sy,depth]。ry：裏返しと左右の傾き、rx：前後の傾き
  P(x,y,z,ry,rx){ const lv=this.st.lv, c=this.cam; let X=x-lv.W/2, Y=y-lv.H/2, Z=z;
    const cr=Math.cos(ry), sr=Math.sin(ry); let X1=X*cr+Z*sr, Z1=-X*sr+Z*cr;
    const cx=Math.cos(rx), sx=Math.sin(rx); const Y2=Y*cx-Z1*sx, Z2=Y*sx+Z1*cx;
    const zc=-Z2, yc=Y2*Math.cos(c.ph)+zc*Math.sin(c.ph), dc=-Y2*Math.sin(c.ph)+zc*Math.cos(c.ph);
    const k=c.D/(c.D+dc); return [c.ox+c.S*X1*k, c.oy+c.S*yc*k, dc, k]; },
  render(T){ const st=this.st, cv=$("#mzCv"), ctx=cv.getContext("2d");
    ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height); ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    // 裏返しの最中：角度 0→π。半分をこえたら次の面を描く
    let face=st.face, ang=0;
    if(st.flip){ const u=easeIO(Math.min(1,(T-st.flip.t)/st.flip.dur)); const a=Math.PI*u; if(a<Math.PI/2){ face=st.flip.from; ang=a; } else { face=st.flip.to.f; ang=a-Math.PI; } }
    if(this.s.view==="3d") this.draw3d(ctx,T,face,ang); else this.draw2d(ctx,T,face,ang); },
  ballState(T,face){ const st=this.st, b=st.b;
    if(st.fall){ const u=Math.min(1,(T-st.fall.t)/500); return {x:b.x+(st.fall.x-b.x)*u,y:b.y+(st.fall.y-b.y)*u,z:-u*.6,s:1-u*.85,a:1-u}; }
    if(st.flip){ const u=Math.min(1,(T-st.flip.t)/350); if(face!==st.flip.from||u>=1) return null; return {x:b.x+(st.flip.x-b.x)*u,y:b.y+(st.flip.y-b.y)*u,z:-u*.5,s:1-u*.8,a:1-u*.6}; }
    if(st.phase==="clear"){ const u=Math.min(1,(T-st.clearT)/600); return {x:b.x,y:b.y,z:b.z+Math.sin(u*Math.PI)*.8,s:1,a:1}; }
    return {x:b.x,y:b.y,z:b.z,s:1,a:1}; },
  draw3d(ctx,T,face,ang){ const st=this.st, lv=st.lv, F=lv.faces[face], C=palette(face), W=lv.W, H=lv.H;
    const ry=ang+st.vis.x*.07, rx=-st.vis.y*.07, P=(x,y,z)=>this.P(x,y,z,ry,rx);
    const poly=(pts,fill,stroke)=>{ ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); } };
    // 面が見えるか：法線がカメラのほうを向いているか
    // 板の厚み（下側）→ 床
    const TH=.55; const sides=[[[0,H,0],[W,H,0],[W,H,-TH],[0,H,-TH]],[[W,H,0],[W,0,0],[W,0,-TH],[W,H,-TH]],[[0,0,0],[0,H,0],[0,H,-TH],[0,0,-TH]],[[W,0,0],[0,0,0],[0,0,-TH],[W,0,-TH]]];
    sides.forEach((q,i)=>{ const pp=q.map(v=>P(...v)); if(this.facing(pp)) poly(pp,C.base); });
    poly([P(0,0,0),P(W,0,0),P(W,H,0),P(0,H,0)],C.floor);
    // 床のこうし模様
    ctx.fillStyle=C.floor2; for(let y=0;y<H;y++) for(let x=0;x<W;x++){ if((x+y)&1||F.t[y*W+x]===1) continue; poly([P(x,y,0),P(x+1,y,0),P(x+1,y+1,0),P(x,y+1,0)],C.floor2); }
    // 床のしかけ
    const circ=(cx,cy,rad,z,fill,n=22)=>{ const pts=[]; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; pts.push(P(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad,z)); } poly(pts,fill); };
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const v=F.t[y*W+x], cx=x+.5, cy=y+.5;
      if(v===4){ circ(cx,cy,.42,0.01,PIT); circ(cx,cy-.06,.34,0.01,"#000"); }
      else if(v===5){ const pulse=.04*Math.sin(T/200); circ(cx,cy,.44+pulse,0.01,WARP); circ(cx,cy,.32,0.01,"#0B4F3A"); circ(cx,cy-.05,.22,0.01,"#062A20");
        for(let k=0;k<3;k++){ const a=T/400+k*2.1; const p=P(cx+Math.cos(a)*.26,cy+Math.sin(a)*.26,0.02); ctx.fillStyle="#9FF5D4"; ctx.beginPath(); ctx.arc(p[0],p[1],1.6*p[3]+.6,0,7); ctx.fill(); } }
      else if(v===6){ circ(cx,cy,.45,0.01,GOLD); for(let yy=0;yy<4;yy++) for(let xx=0;xx<4;xx++){ if((xx+yy)&1) continue; const s=.16, x0=cx-.32+xx*s, y0=cy-.32+yy*s; poly([P(x0,y0,.02),P(x0+s,y0,.02),P(x0+s,y0+s,.02),P(x0,y0+s,.02)],"#3B2A00"); } }
      else if(lv.start.f===face&&lv.start.x===x&&lv.start.y===y){ circ(cx,cy,.36,0.01,"rgba(120,120,160,.18)"); } }
    // 立っているもの（かべ・柵・旗・玉）を奥から順に
    const items=[];
    const box=(x0,y0,x1,y1,h,top,side,side2,skip)=>{ const c=P((x0+x1)/2,(y0+y1)/2,h/2); items.push({d:c[2],f:()=>{
      const v=[[x0,y0,0],[x1,y0,0],[x1,y1,0],[x0,y1,0],[x0,y0,h],[x1,y0,h],[x1,y1,h],[x0,y1,h]].map(p=>P(...p));
      const fs=[[[7,6,2,3],side,"s"],[[5,4,0,1],side,"n"],[[6,5,1,2],side2,"e"],[[4,7,3,0],side2,"w"]];
      for(const [ix,col,k] of fs){ if(skip&&skip[k]) continue; const pp=ix.map(i=>v[i]); if(this.facing(pp)) poly(pp,col); }
      poly([v[4],v[5],v[6],v[7]],top); } }); };
    const wallAt=(x,y)=>lv.at(face,x,y)===1;
    const WH=.8;
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const v=F.t[y*W+x];
      if(v===1) box(x,y,x+1,y+1,WH,C.wallTop,C.wall,C.wallSide,{n:wallAt(x,y-1),s:wallAt(x,y+1),e:wallAt(x+1,y),w:wallAt(x-1,y)});
      else if(v===3) box(x+.38,y,x+.62,y+1,FENCE_H,FENCE,FENCE2,"#E0A020");
      else if(v===2) box(x,y+.38,x+1,y+.62,FENCE_H,FENCE,FENCE2,"#E0A020");
      else if(v===6){ const c=P(x+.5,y+.5,.6); items.push({d:c[2],f:()=>{ const a=P(x+.5,y+.5,0), b=P(x+.5,y+.5,1.25), m=P(x+.5,y+.5,.95), e=P(x+1.05,y+.5,1.1);
        ctx.strokeStyle="#6B5A3A"; ctx.lineWidth=Math.max(1.5,2.5*a[3]); ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke();
        const wv=Math.sin(T/180)*2; poly([b,[e[0],e[1]+wv],m],"#FF4F6B"); }}); } }
    const bs=this.ballState(T,face);
    if(bs){ const zc=bs.z+R*bs.s, c=P(bs.x,bs.y,zc);
      // 影
      if(bs.z>-.01){ const sh=Math.max(.35,1-bs.z*.35); const pts=[]; for(let i=0;i<16;i++){ const a=i/16*Math.PI*2; pts.push(P(bs.x+Math.cos(a)*R*sh,bs.y+Math.sin(a)*R*sh,.015)); } ctx.save(); ctx.globalAlpha=.28*sh; poly(pts,"#000"); ctx.restore(); }
      items.push({d:c[2]-.05,f:()=>{ const p=P(bs.x,bs.y,zc), rad=R*bs.s*this.cam.S*p[3]; this.ball(ctx,p[0],p[1],rad,bs.a,T); }}); }
    items.sort((a,b)=>b.d-a.d).forEach(it=>it.f());
  },
  // 多角形が手前を向いているか（画面上で時計回り）
  facing(pp){ let a=0; for(let i=0;i<pp.length;i++){ const p=pp[i],q=pp[(i+1)%pp.length]; a+=p[0]*q[1]-q[0]*p[1]; } return a>0; },
  ball(ctx,x,y,rad,alpha,T){ if(rad<=.3) return; ctx.save(); ctx.globalAlpha=alpha; const fl=this.st.flash&&T-this.st.flash<500;
    const g=ctx.createRadialGradient(x-rad*.35,y-rad*.4,rad*.1,x,y,rad); if(fl){ g.addColorStop(0,"#FFD0D6"); g.addColorStop(1,"#E0304A"); } else { g.addColorStop(0,"#FFFFFF"); g.addColorStop(.35,"#D7DEE9"); g.addColorStop(1,"#6E7A90"); }
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,rad,0,7); ctx.fill(); ctx.restore(); },
  /* ===== 2D：真上から ===== */
  draw2d(ctx,T,face,ang){ const st=this.st, lv=st.lv, F=lv.faces[face], C=palette(face), W=lv.W, H=lv.H, s=this.s2;
    ctx.save(); ctx.translate(this.CW/2,this.CH/2); ctx.scale(Math.max(.02,Math.cos(ang)),1); ctx.translate(-W*s/2,-H*s/2);
    ctx.fillStyle=C.floor; ctx.fillRect(0,0,W*s,H*s);
    ctx.fillStyle=C.floor2; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(!((x+y)&1)&&F.t[y*W+x]!==1) ctx.fillRect(x*s,y*s,s,s);
    const dot=(cx,cy,r,col)=>{ ctx.fillStyle=col; ctx.beginPath(); ctx.arc(cx*s,cy*s,r*s,0,7); ctx.fill(); };
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const v=F.t[y*W+x], cx=x+.5, cy=y+.5;
      if(v===1){ ctx.fillStyle=C.wallSide; ctx.fillRect(x*s,y*s,s,s); ctx.fillStyle=C.wall; ctx.fillRect(x*s,y*s,s,s*.82);
        if(lv.at(face,x,y+1)!==1){ ctx.fillStyle=C.wallSide; ctx.fillRect(x*s,(y+.78)*s,s,s*.22); } }
      else if(v===4){ dot(cx,cy,.42,PIT); dot(cx,cy+.05,.32,"#000"); }
      else if(v===5){ dot(cx,cy,.44+.04*Math.sin(T/200),WARP); dot(cx,cy,.32,"#0B4F3A"); dot(cx,cy,.2,"#062A20");
        for(let k=0;k<3;k++){ const a=T/400+k*2.1; dot(cx+Math.cos(a)*.26,cy+Math.sin(a)*.26,.05,"#9FF5D4"); } }
      else if(v===6){ dot(cx,cy,.45,GOLD); for(let yy=0;yy<4;yy++) for(let xx=0;xx<4;xx++) if(!((xx+yy)&1)){ ctx.fillStyle="#3B2A00"; ctx.fillRect((cx-.32+xx*.16)*s,(cy-.32+yy*.16)*s,.16*s,.16*s); }
        ctx.strokeStyle="#6B5A3A"; ctx.lineWidth=Math.max(1.5,s*.07); ctx.beginPath(); ctx.moveTo(cx*s,cy*s); ctx.lineTo(cx*s,(cy-.75)*s); ctx.stroke();
        ctx.fillStyle="#FF4F6B"; ctx.beginPath(); ctx.moveTo(cx*s,(cy-.75)*s); ctx.lineTo((cx+.5)*s,(cy-.62+Math.sin(T/180)*.03)*s); ctx.lineTo(cx*s,(cy-.48)*s); ctx.fill(); }
      else if(v===2||v===3){ const hz=v===2; ctx.fillStyle=FENCE2; if(hz) ctx.fillRect(x*s,(y+.36)*s,s,.28*s); else ctx.fillRect((x+.36)*s,y*s,.28*s,s);
        ctx.fillStyle=FENCE; if(hz) ctx.fillRect(x*s,(y+.36)*s,s,.18*s); else ctx.fillRect((x+.36)*s,y*s,.28*s,s*.88);
        ctx.fillStyle="rgba(0,0,0,.25)"; for(let k=1;k<4;k++){ if(hz) ctx.fillRect((x+k/4)*s-1,(y+.36)*s,2,.28*s); else ctx.fillRect((x+.36)*s,(y+k/4)*s-1,.28*s,2); } }
      else if(lv.start.f===face&&lv.start.x===x&&lv.start.y===y) dot(cx,cy,.36,"rgba(120,120,160,.18)"); }
    const bs=this.ballState(T,face);
    if(bs){ if(bs.z>-.01){ ctx.save(); ctx.globalAlpha=.25*Math.max(.3,1-bs.z*.4); dot(bs.x+.06,bs.y+.1,R*Math.max(.4,1-bs.z*.3),"#000"); ctx.restore(); }
      const lift=Math.max(0,bs.z)*.45, sc=bs.s*(1+Math.max(0,bs.z)*.3); this.ball(ctx,bs.x*s,(bs.y-lift)*s,R*sc*s,bs.a,T); }
    ctx.restore(); },
};
return MZ;
});
