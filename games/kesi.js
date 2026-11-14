// 45 Brain ゲーム：kesi（開いたときだけ読み込まれる。共通の関数は index.html にある）
BRAIN.def("kesi","  <section data-pane=\"kesi\" data-v=\"setup\">\n    <div class=\"vw\" data-v=\"setup\">\n      <div class=\"panel\">\n        <h2 data-i=\"ksTitle\"></h2>\n        <p class=\"lead\" data-i=\"ksLead\"></p>\n        <div class=\"opt\"><span class=\"ol\" data-i=\"ksVs\"></span><div class=\"chips\" id=\"ksVsSel\">\n          <button class=\"chip\" data-val=\"cpu\" data-i=\"ksVsCpu\"></button><button class=\"chip\" data-val=\"two\" data-i=\"ksVsTwo\"></button></div></div>\n        <div class=\"opt\"><span class=\"ol\" data-i=\"ksMu\"></span><div class=\"chips\" id=\"ksMuSel\">\n          <button class=\"chip\" data-val=\"0.1\"><span data-i=\"ksMu1\"></span> μ0.1</button><button class=\"chip\" data-val=\"0.3\"><span data-i=\"ksMu2\"></span> μ0.3</button><button class=\"chip\" data-val=\"0.6\"><span data-i=\"ksMu3\"></span> μ0.6</button></div></div>\n        <p class=\"lead\" style=\"margin-top:0\" data-i=\"ksMuNote\"></p>\n        <div class=\"opt\"><span class=\"ol\" data-i=\"ksObs\"></span><div class=\"chips\" id=\"ksObsSel\">\n          <button class=\"chip num\" data-val=\"0\">0</button><button class=\"chip num\" data-val=\"1\">1</button><button class=\"chip num\" data-val=\"2\">2</button><button class=\"chip num\" data-val=\"3\">3</button><button class=\"chip num\" data-val=\"4\">4</button><button class=\"chip num\" data-val=\"5\">5</button><button class=\"chip num\" data-val=\"6\">6</button></div></div>\n        <p class=\"lead\" style=\"margin-top:6px\" data-i=\"ksObsNote\"></p>\n      </div>\n      <div class=\"panel kpl kcol0\" id=\"ksP0\">\n        <h3><i class=\"kdot\"></i><span class=\"kname\"></span></h3>\n        <div class=\"chips ktype\"><button class=\"chip\" data-val=\"eraser\" data-i=\"ksEraser\"></button><button class=\"chip\" data-val=\"ruler\" data-i=\"ksRuler\"></button></div>\n        <canvas class=\"kprev\" id=\"ksPrev0\"></canvas>\n        <div class=\"karea\"></div>\n        <label class=\"krow\"><span data-i=\"ksLen\"></span><input type=\"range\" class=\"kf\" id=\"ksF0\" min=\"60\" max=\"160\" step=\"1\"></label>\n        <label class=\"krow\"><span data-i=\"ksBend\"></span><input type=\"range\" class=\"kb\" id=\"ksB0\" min=\"0\" max=\"180\" step=\"5\"></label>\n        <label class=\"krow\"><span data-i=\"ksRot\"></span><input type=\"range\" class=\"kr\" id=\"ksR0\" min=\"0\" max=\"165\" step=\"15\"></label>\n        <button class=\"btn kreset\"><i class=\"ic\" data-ic=\"repeat\"></i><span data-i=\"ksReset\"></span></button>\n      </div>\n      <div class=\"panel kpl kcol1\" id=\"ksP1\">\n        <h3><i class=\"kdot\"></i><span class=\"kname\"></span></h3>\n        <div class=\"chips ktype\"><button class=\"chip\" data-val=\"eraser\" data-i=\"ksEraser\"></button><button class=\"chip\" data-val=\"ruler\" data-i=\"ksRuler\"></button></div>\n        <canvas class=\"kprev\" id=\"ksPrev1\"></canvas>\n        <div class=\"karea\"></div>\n        <label class=\"krow\"><span data-i=\"ksLen\"></span><input type=\"range\" class=\"kf\" id=\"ksF1\" min=\"60\" max=\"160\" step=\"1\"></label>\n        <label class=\"krow\"><span data-i=\"ksBend\"></span><input type=\"range\" class=\"kb\" id=\"ksB1\" min=\"0\" max=\"180\" step=\"5\"></label>\n        <label class=\"krow\"><span data-i=\"ksRot\"></span><input type=\"range\" class=\"kr\" id=\"ksR1\" min=\"0\" max=\"165\" step=\"15\"></label>\n        <button class=\"btn kreset\"><i class=\"ic\" data-ic=\"repeat\"></i><span data-i=\"ksReset\"></span></button>\n      </div>\n      <div class=\"panel\">\n        <h2 data-i=\"recTitle\"></h2>\n        <div class=\"best\"><i class=\"ic\" data-ic=\"trophy\"></i><span data-i=\"ksRecL\"></span><b class=\"num\" id=\"ksRec\"></b></div>\n      </div>\n    </div>\n    <div class=\"vw\" data-v=\"play\">\n      <div class=\"phead\"><button class=\"btn icon\" id=\"ksQuit\" aria-label=\"quit\"><i class=\"ic\" data-ic=\"x\"></i></button><b class=\"kturn\" id=\"ksTurn\"></b></div>\n      <div class=\"kbox\" id=\"ksBox\"><canvas id=\"ksCv\"></canvas></div>\n      <div class=\"banner\" id=\"ksMsg\"></div>\n    </div>\n  </section>",function(){
/* =========================================================
   消しゴムおとし（matter-js）
   ========================================================= */
const KS={
  s:(()=>{ const d={vs:"cpu",obs:2,mu:.3,p:[{type:"eraser",f:100,bend:0,rot:0},{type:"eraser",f:100,bend:0,rot:0}]}; const v=store.get("b_ks",null); if(!(v&&v.p&&v.p.length===2)) return d; if(v.obs==null) v.obs=2; if(v.mu==null) v.mu=.3; v.p.forEach(x=>{ if(x.rot==null) x.rot=0; }); return v; })(),
  BASE:{eraser:{L:44,W:22},ruler:{L:150,W:13}}, // mm
  DW:320,DH:460,M:20,VMAX:13,DRAG:150,
  st:null,rf:[],drag:null,
  save(){ store.set("b_ks",this.s); },
  init(){
    this.pane=$('[data-pane="kesi"]');
    this.rf.push(chips($("#ksVsSel"),()=>this.s.vs,v=>{this.s.vs=v;this.save()},()=>this.refresh()));
    this.rf.push(chips($("#ksMuSel"),()=>String(this.s.mu),v=>{this.s.mu=+v;this.save()}));
    this.rf.push(chips($("#ksObsSel"),()=>this.s.obs,v=>{this.s.obs=+v;this.save()}));
    [0,1].forEach(i=>{ const box=$(`#ksP${i}`),P=this.s.p[i];
      this.rf.push(chips($(".ktype",box),()=>this.s.p[i].type,v=>{this.s.p[i].type=v;this.save()},()=>this.refresh()));
      $(".kf",box).addEventListener("input",e=>{ this.s.p[i].f=+e.target.value; this.save(); this.drawPrev(i); });
      $(".kb",box).addEventListener("input",e=>{ this.s.p[i].bend=+e.target.value; this.save(); this.drawPrev(i); });
      $(".kr",box).addEventListener("input",e=>{ this.s.p[i].rot=+e.target.value; this.save(); this.drawPrev(i); });
      $(".kreset",box).onclick=()=>{ this.s.p[i].f=100; this.s.p[i].bend=0; this.s.p[i].rot=0; this.save(); this.refresh(); }; });
    const cv=$("#ksCv");
    cv.addEventListener("pointerdown",e=>this.pdown(e)); cv.addEventListener("pointermove",e=>this.pmove(e));
    cv.addEventListener("pointerup",e=>this.pup(e)); cv.addEventListener("pointercancel",()=>{ this.drag=null; });
    $("#ksQuit").onclick=()=>this.quit();
    window.addEventListener("resize",()=>{ if(this.st) this.fit(); if(mode==="kesi") [0,1].forEach(i=>this.drawPrev(i)); });
    try{ matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{ this.cols=null; [0,1].forEach(i=>this.drawPrev(i)); }); }catch(e){}
    this.refresh();
  },
  names(){ return this.s.vs==="cpu"?[t("ksYou"),t("ksCpu")]:[t("ksBlue"),t("ksRed")]; },
  refresh(){ this.rf.forEach(f=>f()); const N=this.names();
    [0,1].forEach(i=>{ const box=$(`#ksP${i}`); $(".kname",box).textContent=N[i]; $(".kf",box).value=this.s.p[i].f; $(".kb",box).value=this.s.p[i].bend; $(".kr",box).value=this.s.p[i].rot; this.drawPrev(i); });
    const r=store.get("b_ks_rec",{w:0,l:0,d:0}); $("#ksRec").textContent=t("ksRecV",r); },
  colors(){ if(this.cols) return this.cols; const cs=getComputedStyle(document.documentElement),g=k=>cs.getPropertyValue(k).trim();
    return this.cols={floor:g("--ks-floor"),w1:g("--ks-wood1"),w2:g("--ks-wood2"),edge:g("--ks-edge"),grain:g("--ks-grain"),p:[g("--c-count"),g("--c-clock")],ink:g("--ink"),panel:g("--soft")}; },
  // 形：面積 A=L×W は一定。長さ f%、曲げ bend°（円弧に沿って細かく分ける）
  geom(c){ const B=this.BASE[c.type],A=B.L*B.W,L=B.L*c.f/100,W=A/L;
    const th=Math.min(c.bend*Math.PI/180,L/(.62*W)); // 内側がつぶれない範囲で曲げる
    let P; if(th<0.03) P=(u,v)=>({x:L*(u-.5),y:v*W/2});
    else { const R=L/th; P=(u,v)=>{ const a=-th/2+u*th, r=R-v*W/2; return {x:r*Math.sin(a),y:R-r*Math.cos(a)}; }; }
    // 中心（面積の重心）を原点にする
    let sx=0,sy=0,N=0; for(let i=0;i<=40;i++) for(let j=-4;j<=4;j++){ const q=P(i/40,j/4); const w=th<0.03?1:(1-(j/4)*W/2/(L/th)); sx+=q.x*w; sy+=q.y*w; N+=w; }
    const cx=sx/N,cy=sy/N, F=(u,v)=>{ const q=P(u,v); return {x:q.x-cx,y:q.y-cy}; };
    const n=th<0.03?1:Math.max(3,Math.ceil(th/(Math.PI/14))), segs=[];
    for(let i=0;i<n;i++){ const u=(i+.5)/n, m=F(u,0), a=th<0.03?0:-th/2+u*th, outer=th<0.03?L:(L/th+W/2)*th/n*1.04; segs.push({x:m.x,y:m.y,a,len:th<0.03?L:outer}); }
    return {L,W,A,th,F,segs}; },
  quad(q,W,ext){ const c=Math.cos(q.a),s=Math.sin(q.a),hl=q.len*ext/2,hw=W/2; const P=(u,v)=>({x:q.x+u*c-v*s,y:q.y+u*s+v*c}); return [P(-hl,-hw),P(hl,-hw),P(hl,hw),P(-hl,hw)]; },
  // quads: 長さ方向に v0→v1、反対側 v3→v2 の四角の並び
  // g.F(u,v)：u=長さ方向0〜1、v=はば方向-1〜1 の点（その形の中心が原点）
  drawPiece(ctx,g,type,col,z){ const F=g.F,M=g.th<0.03?1:36,W=g.W,L=g.L;
    const band=(a,b)=>{ ctx.beginPath(); const st=Math.max(1,Math.round(M*(b-a)));
      for(let i=0;i<=st;i++){ const q=F(a+(b-a)*i/st,-1); i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y); }
      for(let i=st;i>=0;i--){ const q=F(a+(b-a)*i/st,1); ctx.lineTo(q.x,q.y); } ctx.closePath(); };
    ctx.lineJoin="round";
    if(type==="eraser"){
      band(0,1); ctx.fillStyle="#FBF9F3"; ctx.fill(); ctx.lineWidth=2.2/z; ctx.strokeStyle="#B9B3A6"; ctx.stroke();
      band(.2,.8); ctx.fillStyle=col; ctx.fill();
      ctx.fillStyle="rgba(255,255,255,.85)"; band(.2,.235); ctx.fill(); band(.765,.8); ctx.fill();
    } else {
      band(0,1); ctx.fillStyle="rgba(255,255,255,.92)"; ctx.fill(); ctx.globalAlpha=.32; ctx.fillStyle=col; ctx.fill(); ctx.globalAlpha=1;
      ctx.lineWidth=2/z; ctx.strokeStyle=col; ctx.stroke();
      ctx.strokeStyle="rgba(30,36,69,.75)"; ctx.lineWidth=Math.max(.6,1/z);
      for(let k=0;k<=L;k+=5){ const u=k/L, a=F(u,1), b=F(u,-1), dl=Math.hypot(b.x-a.x,b.y-a.y)||1, len=Math.min(W*(k%10===0?.42:.24),k%10===0?6:3.5);
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(a.x+(b.x-a.x)/dl*len,a.y+(b.y-a.y)/dl*len); ctx.stroke(); }
    } },
  drawBody(ctx,b,z,C){ ctx.save(); ctx.translate(b.position.x,b.position.y); ctx.rotate(b.angle); ctx.translate(b.kx.ox,b.kx.oy); this.drawPiece(ctx,b.kx.g,b.kx.type,C.p[b.kx.i],z); ctx.restore(); },
  outline(ctx,b){ const g=b.kx.g,F=g.F,M=g.th<0.03?1:36; ctx.save(); ctx.translate(b.position.x,b.position.y); ctx.rotate(b.angle); ctx.translate(b.kx.ox,b.kx.oy); ctx.beginPath();
    for(let i=0;i<=M;i++){ const q=F(i/M,-1); i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y); } for(let i=M;i>=0;i--){ const q=F(i/M,1); ctx.lineTo(q.x,q.y); } ctx.closePath(); ctx.restore(); },
  drawPrev(i){ const cv=$(`#ksPrev${i}`); if(!cv||!cv.offsetWidth) return; const dpr=window.devicePixelRatio||1, w=cv.offsetWidth, h=cv.offsetHeight;
    cv.width=w*dpr; cv.height=h*dpr; const ctx=cv.getContext("2d"),C=this.colors(); ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle=C.w1; ctx.fillRect(0,0,w,h); this.grainLines(ctx,w,h,C,i*7+3);
    const c=this.s.p[i],g=this.geom(c);
    const ra=(c.rot||0)*Math.PI/180,cr=Math.cos(ra),sr=Math.sin(ra);
    let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(let k=0;k<=36;k++) for(const v of [-1,1]){ const q=g.F(k/36,v),p={x:q.x*cr-q.y*sr,y:q.x*sr+q.y*cr}; x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y); }
    const z=Math.min((w-24)/(x1-x0),(h-20)/(y1-y0),2.2); ctx.save(); ctx.translate(w/2-(x0+x1)/2*z,h/2-(y0+y1)/2*z); ctx.scale(z,z); ctx.rotate(ra);
    this.drawPiece(ctx,g,c.type,C.p[i],z); ctx.restore();
    $(`#ksP${i} .karea`).innerHTML=t("ksArea",{a:`<b>${(g.A/100).toFixed(2)}</b>`})+"<br>"+esc(t("ksSize",{l:g.L.toFixed(0),w:g.W.toFixed(1)})); },
  grainLines(ctx,w,h,C,seed){ let r=seed; const R=()=>{ r=(r*9301+49297)%233280; return r/233280; };
    ctx.strokeStyle=C.grain; ctx.lineWidth=1.2; for(let k=0;k<Math.ceil(h/9);k++){ const y=k*9+R()*6, a=2+R()*4, ph=R()*6;
      ctx.beginPath(); for(let x=0;x<=w;x+=12){ const yy=y+Math.sin(x/(40+R()*30)+ph)*a; x?ctx.lineTo(x,yy):ctx.moveTo(x,yy); } ctx.stroke(); } },
  view(v){ this.pane.dataset.v=v; if(mode==="kesi") this.dock(); },
  dock(){ if(mode!=="kesi") return; if(this.pane.dataset.v==="setup") return setDock(`<button class="btn primary big" data-act="start"><i class="ic" data-ic="play"></i>${esc(t("start"))}</button>`); setDock(""); },
  act(a){ if(a==="start") this.start(); },
  mk(i){ const {Bodies,Body}=Matter, c=this.s.p[i], g=this.geom(c);
    const parts=g.segs.map(q=>Bodies.rectangle(q.x,q.y,q.len,g.W,{angle:q.a,density:.0012,chamfer:{radius:Math.min(2,g.W/4)}}));
    const b=Body.create({parts,frictionAir:0,restitution:.42,friction:.05});
    b.kx={i,type:c.type,W:g.W,L:g.L,g,ox:-b.position.x,oy:-b.position.y}; // 物理の重心と絵の原点のずれ
    Body.setPosition(b,{x:this.DW/2,y:i?this.DH*.25:this.DH*.75}); Body.setAngle(b,(i?Math.PI:0)+(c.rot||0)*Math.PI/180*(i?-1:1)); return b; },
  // 障害物：渦（相手の後ろへワープ）・ゴムボール（強くはね返す）・スポンジ（勢いを吸いとる）、4つ目からは動かないだけのもの。スタート位置と重ならないように置く
  mkObs(n){ const {Bodies}=Matter,out=[],starts=[{x:this.DW/2,y:this.DH*.75},{x:this.DW/2,y:this.DH*.25}];
    const KIND=["warp","ball","sponge","tape","box","sharp"];
    for(let k=0,tries=0;k<n&&tries<400;tries++){ const kind=KIND[k%KIND.length],x=36+Math.random()*(this.DW-72),y=50+Math.random()*(this.DH-100);
      if(starts.some(p=>Math.hypot(p.x-x,p.y-y)<(kind==="box"||kind==="sponge"?92:80))) continue; if(out.some(o=>Math.hypot(o.position.x-x,o.position.y-y)<70)) continue;
      const opt={isStatic:true,restitution:.5,friction:.05}; let b;
      if(kind==="warp") b=Bodies.circle(x,y,20,{...opt,isSensor:true});
      else if(kind==="ball") b=Bodies.circle(x,y,15,{...opt,restitution:1});
      else if(kind==="sponge") b=Bodies.rectangle(x,y,58,38,{...opt,isSensor:true,angle:Math.random()*Math.PI,chamfer:{radius:8}});
      else if(kind==="tape") b=Bodies.circle(x,y,15,opt); else if(kind==="sharp") b=Bodies.rectangle(x,y,24,18,{...opt,angle:Math.random()*Math.PI,chamfer:{radius:3}});
      else b=Bodies.rectangle(x,y,60,20,{...opt,angle:Math.random()*Math.PI,chamfer:{radius:6}});
      b.ob=kind; out.push(b); k++; }
    return out; },
  // 障害物のはたらき（毎フレーム）
  obsFx(){ const st=this.st,{Body,Query}=Matter;
    st.bodies.forEach(b=>{ if(b.out) return;
      st.obs.forEach(o=>{
        if(o.ob==="warp"&&!b.kx.warped&&Math.hypot(b.position.x-o.position.x,b.position.y-o.position.y)<20){
          const t=st.bodies[1-b.kx.i]; if(t.out) return;
          let dx=t.position.x-o.position.x,dy=t.position.y-o.position.y,l=Math.hypot(dx,dy)||1; dx/=l; dy/=l;
          const d=Math.max(t.kx.L,t.kx.W)/2+Math.max(b.kx.L,b.kx.W)/2+8;
          let nx=t.position.x+dx*d, ny=t.position.y+dy*d; const m=24; nx=Math.max(m,Math.min(this.DW-m,nx)); ny=Math.max(m,Math.min(this.DH-m,ny));
          Body.setPosition(b,{x:nx,y:ny}); const sp=Math.max(2,b.speed*.6); Body.setVelocity(b,{x:-dx*sp,y:-dy*sp});
          b.kx.warped=true; st.fx.push({x:o.position.x,y:o.position.y,t:now(),k:"warp"},{x:nx,y:ny,t:now(),k:"warp"}); tone(900,.18,"sine",.12); tone(450,.25,"sine",.1,.08); }
        else if(o.ob==="sponge"&&Query.collides(b,[o]).length){ Body.setVelocity(b,{x:b.velocity.x*.8,y:b.velocity.y*.8}); Body.setAngularVelocity(b,b.angularVelocity*.75);
          if(!b.kx.soak){ b.kx.soak=true; tone(160,.15,"sine",.1); } } }); });
    // ゴムボールに当たったものは、ボールから遠ざかる向きに強く飛ばす
    (st.boost||[]).forEach(([b,o])=>{ if(b.out) return; let dx=b.position.x-o.position.x,dy=b.position.y-o.position.y,l=Math.hypot(dx,dy)||1;
      const sp=Math.min(this.VMAX*1.15,Math.max(b.speed*2.2,this.VMAX*.8)); Body.setVelocity(b,{x:dx/l*sp,y:dy/l*sp}); st.fx.push({x:o.position.x,y:o.position.y,t:now(),k:"ball"}); tone(320,.12,"square",.08); });
    st.boost=[]; },
  // 床の動摩擦：速さに関係なく一定の減速（a=μg）。すべる距離は v²/(2μg)
  G:1.1,
  floorFric(){ const {Body}=Matter,a=this.s.mu*this.G;
    this.st.bodies.forEach(b=>{ if(b.out) return; const sp=b.speed; if(sp>0){ const k=Math.max(0,sp-a)/sp; Body.setVelocity(b,{x:b.velocity.x*k,y:b.velocity.y*k}); }
      const w=b.angularVelocity, da=a/(.3*Math.max(b.kx.L,b.kx.W)); Body.setAngularVelocity(b,Math.abs(w)<=da?0:w-Math.sign(w)*da); }); },
  // 力点：コマの上の位置をコマの座標で覚える（コマが動いても同じ場所）
  toLocal(b,w){ const c=Math.cos(-b.angle),s2=Math.sin(-b.angle),x=w.x-b.position.x,y=w.y-b.position.y; return {x:x*c-y*s2,y:x*s2+y*c}; },
  toW(b,l){ const c=Math.cos(b.angle),s2=Math.sin(b.angle); return {x:b.position.x+l.x*c-l.y*s2,y:b.position.y+l.x*s2+l.y*c}; },
  fpW(){ const st=this.st,b=st.bodies[st.cur],l=st.fp&&st.fp[st.cur]; return l?this.toW(b,l):null; },
  drawObs(ctx,o,z){ const T=now();
    if(o.ob==="warp"){ ctx.save(); ctx.translate(o.position.x,o.position.y); ctx.rotate(-T/400);
      const g=ctx.createRadialGradient(0,0,2,0,0,22); g.addColorStop(0,"#2B1B5E"); g.addColorStop(.7,"rgba(124,77,255,.75)"); g.addColorStop(1,"rgba(124,77,255,0)"); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,22,0,7); ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,.85)"; ctx.lineWidth=2; for(let a=0;a<3;a++){ ctx.beginPath(); for(let s2=0;s2<=24;s2++){ const r=2+s2*.75, th=s2*.32+a*2.09; s2?ctx.lineTo(Math.cos(th)*r,Math.sin(th)*r):ctx.moveTo(Math.cos(th)*r,Math.sin(th)*r); } ctx.stroke(); }
      ctx.restore(); return; }
    if(o.ob==="ball"){ ctx.save(); ctx.translate(o.position.x,o.position.y); ctx.fillStyle="rgba(40,20,0,.25)"; ctx.beginPath(); ctx.arc(2.5,3.5,15,0,7); ctx.fill();
      const g=ctx.createRadialGradient(-5,-6,2,0,0,16); g.addColorStop(0,"#FF9A8A"); g.addColorStop(1,"#E53935"); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,15,0,7); ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,.6)"; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(0,0,15,-.4,1.2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-15,0); ctx.quadraticCurveTo(0,6,15,0); ctx.stroke(); ctx.restore(); return; }
    ctx.save(); ctx.translate(o.position.x,o.position.y); ctx.rotate(o.angle);
    if(o.ob==="sponge"){ ctx.fillStyle="rgba(40,20,0,.2)"; this.rr(ctx,-29+2.5,-19+3.5,58,38,8); ctx.fill(); this.rr(ctx,-29,-19,58,38,8); ctx.fillStyle="#FFE26A"; ctx.fill();
      ctx.fillStyle="#3FA34D"; ctx.fillRect(-29,9,58,10); ctx.lineWidth=1.5/z; ctx.strokeStyle="#C9A820"; this.rr(ctx,-29,-19,58,38,8); ctx.stroke();
      ctx.fillStyle="rgba(201,168,32,.55)"; [[-18,-9,3],[-6,-4,2.4],[8,-11,2.8],[18,-3,2.2],[-14,2,2],[3,3,2.6]].forEach(([x,y,r])=>{ ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); }); ctx.restore(); return; }
    ctx.fillStyle="rgba(40,20,0,.25)"; if(o.ob==="tape"){ ctx.beginPath(); ctx.arc(2.5,3.5,15,0,7); ctx.fill(); }
    else { const w=o.ob==="box"?60:24,h=o.ob==="box"?20:18; this.rr(ctx,-w/2+2.5,-h/2+3.5,w,h,o.ob==="box"?6:3); ctx.fill(); }
    if(o.ob==="tape"){ ctx.beginPath(); ctx.arc(0,0,15,0,7); ctx.fillStyle="rgba(214,236,255,.92)"; ctx.fill(); ctx.lineWidth=1.5/z; ctx.strokeStyle="#7FA9D6"; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,8.5,0,7); ctx.fillStyle="#F2E2B8"; ctx.fill(); ctx.strokeStyle="#C9A96A"; ctx.stroke(); ctx.beginPath(); ctx.arc(0,0,6,0,7); ctx.fillStyle="rgba(255,255,255,.35)"; ctx.fill(); }
    else if(o.ob==="sharp"){ this.rr(ctx,-12,-9,24,18,3); ctx.fillStyle="#7C8BA8"; ctx.fill(); ctx.lineWidth=1.5/z; ctx.strokeStyle="#4E5A73"; ctx.stroke();
      ctx.beginPath(); ctx.arc(-3,0,4.5,0,7); ctx.fillStyle="#2A3142"; ctx.fill(); ctx.fillStyle="#C8D1E2"; ctx.fillRect(4,-6,5,12); }
    else { this.rr(ctx,-30,-10,60,20,6); ctx.fillStyle="#5C6BC0"; ctx.fill(); ctx.lineWidth=1.5/z; ctx.strokeStyle="#3A4590"; ctx.stroke();
      ctx.strokeStyle="rgba(255,255,255,.55)"; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(-27,0); ctx.lineTo(27,0); ctx.stroke(); ctx.fillStyle="#FFD23F"; ctx.fillRect(18,-3,6,6); }
    ctx.restore(); },
  start(){ if(typeof Matter==="undefined"){ toast("physics engine failed to load"); return; }
    if(this.st) this.st.id=null;
    const eng=Matter.Engine.create(); eng.gravity.x=0; eng.gravity.y=0; eng.gravity.scale=0;
    const bodies=[this.mk(0),this.mk(1)], obs=this.mkObs(this.s.obs); Matter.Composite.add(eng.world,bodies.concat(obs));
    this.cols=null; let seed=Math.floor(Math.random()*999);
    this.st={eng,bodies,obs,cur:0,phase:"aim",turns:0,falling:[],still:0,t0:0,id:Math.random(),arrow:null,seed,fx:[],boost:[],fp:[null,null]};
    const st0=this.st; Matter.Events.on(eng,"collisionStart",e=>{ e.pairs.forEach(pr=>{ const A=pr.bodyA.parent,B=pr.bodyB.parent; const o=A.ob==="ball"?A:B.ob==="ball"?B:null; if(!o) return; const b=o===A?B:A; if(b.kx) st0.boost.push([b,o]); }); });
    this.view("play"); this.fit(); this.label(); const id=this.st.id;
    const loop=()=>{ if(!this.st||this.st.id!==id) return; if(mode==="kesi"&&this.pane.dataset.v==="play"){ this.update(); this.render(); } requestAnimationFrame(loop); };
    requestAnimationFrame(loop); },
  fit(){ const box=$("#ksBox"),cv=$("#ksCv"); const w=box.clientWidth, top=box.getBoundingClientRect().top+window.scrollY;
    const h=Math.max(300,Math.min(window.innerHeight-top-64,w*1.7)); const dpr=window.devicePixelRatio||1;
    cv.style.height=h+"px"; cv.width=w*dpr; cv.height=h*dpr; this.vw={w,h,dpr};
    const z=Math.min(w/(this.DW+2*this.M),h/(this.DH+2*this.M)); this.vw.z=z; this.vw.ox=(w-this.DW*z)/2; this.vw.oy=(h-this.DH*z)/2; },
  toWorld(e){ const r=$("#ksCv").getBoundingClientRect(),v=this.vw; return {x:(e.clientX-r.left-v.ox)/v.z,y:(e.clientY-r.top-v.oy)/v.z}; },
  isCpuTurn(){ return this.s.vs==="cpu"&&this.st&&this.st.cur===1; },
  label(){ const st=this.st; if(!st) return; const N=this.names(),i=st.cur;
    $("#ksTurn").innerHTML=`<i class="kdot kcol${i}"></i>${esc(t("ksTurn",{name:N[i]}))}`;
    const m=$("#ksMsg"); if(st.phase==="aim"&&!this.isCpuTurn()) m.innerHTML=`<small>${esc(t("ksAim",{p:t(st.bodies[i].kx.type==="ruler"?"ksPR":"ksPE")}))}</small>`;
    else if(st.phase==="cpu") m.innerHTML=`<small>${esc(t("ksCpuThink"))}</small>`; else if(st.phase==="move") m.innerHTML=""; },
  pdown(e){ const st=this.st; if(!st||st.phase!=="aim"||this.isCpuTurn()) return; const w=this.toWorld(e),b=st.bodies[st.cur]; if(b.out) return;
    const inside=b.parts.slice(1).some(p=>Matter.Vertices.contains(p.vertices,w));
    const near=Math.hypot(w.x-b.position.x,w.y-b.position.y)<Math.max(b.kx.L,b.kx.W)/2+36;
    if(!inside&&!near){ toast(t("ksTouchOwn")); return; }
    const fp=this.fpW(); if(inside) st.fp[st.cur]=this.toLocal(b,w);
    this.drag={pid:e.pointerId,s:w,c:w,hit:inside?w:(fp||{x:b.position.x,y:b.position.y}),tap:inside}; try{ $("#ksCv").setPointerCapture(e.pointerId); }catch(_){}
    e.preventDefault(); },
  pmove(e){ if(this.drag&&e.pointerId===this.drag.pid) this.drag.c=this.toWorld(e); },
  pup(e){ const d=this.drag; if(!d||e.pointerId!==d.pid) return; this.drag=null; d.c=this.toWorld(e);
    const dx=d.c.x-d.s.x,dy=d.c.y-d.s.y,len=Math.hypot(dx,dy); if(len<10){ if(d.tap){ tone(700,.06,"sine",.08); } return; }
    this.flick(this.st.cur,{x:dx/len,y:dy/len},Math.min(len,this.DRAG)/this.DRAG,d.hit); },
  flick(i,dir,pw,hit){ const st=this.st,b=st.bodies[i],{Body}=Matter; const v=(.15+.85*Math.pow(pw,1.4))*this.VMAX, vel={x:dir.x*v,y:dir.y*v};
    Body.setVelocity(b,vel); const r={x:hit.x-b.position.x,y:hit.y-b.position.y};
    let om=(r.x*vel.y-r.y*vel.x)*b.mass/b.inertia; om=Math.max(-.32,Math.min(.32,om)); Body.setAngularVelocity(b,om);
    st.p0={i,x:b.position.x,y:b.position.y}; st.phase="move"; st.t0=now(); st.still=0; st.arrow=null; st.bodies.forEach(x=>{ x.kx.warped=false; x.kx.soak=false; }); tone(180,.12,"triangle",.2); tone(90,.18,"sine",.2,.02); this.label(); },
  cpu(){ const st=this.st,id=st.id; st.phase="cpu"; this.label(); const me=st.bodies[1],tg=st.bodies[0];
    const dx=tg.position.x-me.position.x,dy=tg.position.y-me.position.y,dist=Math.hypot(dx,dy);
    const ang=Math.atan2(dy,dx)+(Math.random()-.5)*.24, dir={x:Math.cos(ang),y:Math.sin(ang)};
    const need=(dist*.05+1.5+Math.random()*2.5)/this.VMAX, pw=Math.max(.3,Math.min(1,Math.pow(Math.max(0,(need-.15)/.85),1/1.4)));
    const off=(Math.random()-.5)*.5*me.kx.L/2, hit={x:me.position.x-dir.y*off,y:me.position.y+dir.x*off};
    setTimeout(()=>{ if(!this.st||this.st.id!==id) return; st.arrow={hit,dir,pw,t:now()};
      setTimeout(()=>{ if(!this.st||this.st.id!==id) return; this.flick(1,dir,pw,hit); },650); },650); },
  update(){ const st=this.st; if(st.phase!=="move") return; Matter.Engine.update(st.eng,1000/60); this.obsFx(); this.floorFric();
    st.bodies.forEach(b=>{ if(b.out) return; const p=b.position; if(p.x<0||p.x>this.DW||p.y<0||p.y>this.DH){
      b.out=true; Matter.Composite.remove(st.eng.world,b); st.falling.push({b,t:now(),v:{x:b.velocity.x,y:b.velocity.y}});
      tone(600,.5,"sine",.12); tone(150,.4,"triangle",.15,.35); $("#ksMsg").innerHTML=`<span class="ngc">${esc(t("ksFall",{name:this.names()[b.kx.i]}))}</span>`; } });
    const moving=st.bodies.some(b=>!b.out&&(b.speed>.06||Math.abs(b.angularVelocity)>.002));
    st.still=moving?0:st.still+1; if(st.still>14||now()-st.t0>9000) this.endTurn(); },
  endTurn(){ const st=this.st; st.turns++; st.phase="wait";
    const alive=st.bodies.map(b=>!b.out); if(!alive[0]||!alive[1]) return this.over(alive);
    if(st.p0){ const b=st.bodies[st.p0.i],dd=Math.hypot(b.position.x-st.p0.x,b.position.y-st.p0.y); if(dd>3) toast(t("ksSlid",{name:this.names()[st.p0.i],d:(dd/10).toFixed(1),mu:this.s.mu})); }
    st.cur=1-st.cur; st.phase="aim"; this.label(); if(this.isCpuTurn()) this.cpu(); },
  over(alive){ const st=this.st,id=st.id,N=this.names(); st.phase="over";
    const win=alive[0]&&!alive[1]?0:alive[1]&&!alive[0]?1:-1;
    if(this.s.vs==="cpu"){ const r=store.get("b_ks_rec",{w:0,l:0,d:0}); win===0?r.w++:win===1?r.l++:r.d++; store.set("b_ks_rec",r); }
    win>=0?sfx.win():sfx.ng(); $("#ksMsg").innerHTML=win>=0?`<span class="okc">${esc(N[win]+t("ksWinLbl"))}</span>`:esc(t("ksDraw"));
    setTimeout(()=>{ if(!this.st||this.st.id!==id) return; const turns=st.turns; this.st=null; this.view("setup"); this.refresh();
      const r=store.get("b_ks_rec",{w:0,l:0,d:0});
      showResult({title:t("ksTitle"),big:win>=0?N[win]:"—",bigLbl:win>=0?t("ksWinLbl"):t("ksDraw"),
        stats:[[t("ksTurns"),turns]].concat(this.s.vs==="cpu"?[[t("ksRecL"),t("ksRecV",r)]]:[]),retry:()=>this.start()}); },1300); },
  quit(){ if(this.st) this.st.id=null; this.st=null; this.drag=null; this.view("setup"); this.refresh(); },
  render(){ const st=this.st,cv=$("#ksCv"),v=this.vw; if(!v) return; const ctx=cv.getContext("2d"),C=this.colors(),z=v.z,T=now();
    ctx.setTransform(v.dpr,0,0,v.dpr,0,0); ctx.fillStyle=C.floor; ctx.fillRect(0,0,v.w,v.h);
    ctx.save(); ctx.translate(v.ox,v.oy); ctx.scale(z,z);
    // 机
    ctx.fillStyle="rgba(0,0,0,.18)"; this.rr(ctx,4,8,this.DW,this.DH,10); ctx.fill();
    const gr=ctx.createLinearGradient(0,0,this.DW,this.DH); gr.addColorStop(0,C.w1); gr.addColorStop(1,C.w2); ctx.fillStyle=gr; this.rr(ctx,0,0,this.DW,this.DH,10); ctx.fill();
    ctx.save(); this.rr(ctx,0,0,this.DW,this.DH,10); ctx.clip(); this.grainLines(ctx,this.DW,this.DH,C,st.seed); ctx.restore();
    ctx.lineWidth=4; ctx.strokeStyle=C.edge; this.rr(ctx,0,0,this.DW,this.DH,10); ctx.stroke();
    // 障害物
    st.obs.forEach(o=>this.drawObs(ctx,o,z));
    st.fx=st.fx.filter(f=>T-f.t<500); st.fx.forEach(f=>{ const k=(T-f.t)/500; ctx.save(); ctx.globalAlpha=1-k; ctx.strokeStyle=f.k==="warp"?"#7C4DFF":"#E53935"; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(f.x,f.y,16+k*30,0,7); ctx.stroke(); ctx.restore(); });
    // 落ちていくもの
    st.falling.forEach(f=>{ const k=Math.min(1,(T-f.t)/550); if(k>=1) return; const b=f.b,sc=1-k*.55;
      ctx.save(); ctx.globalAlpha=1-k; ctx.translate(b.position.x+f.v.x*k*14,b.position.y+f.v.y*k*14); ctx.scale(sc,sc); ctx.translate(-b.position.x,-b.position.y);
      this.drawBody(ctx,b,z,C); ctx.restore(); });
    // 影 → 本体
    st.bodies.forEach(b=>{ if(b.out) return; ctx.save(); ctx.translate(2.5,3.5); ctx.fillStyle="rgba(40,20,0,.22)"; this.outline(ctx,b); ctx.fill(); ctx.restore(); });
    st.bodies.forEach(b=>{ if(b.out) return;
      if(st.phase==="aim"&&b.kx.i===st.cur&&!this.isCpuTurn()){ const pulse=.5+.5*Math.sin(T/220); ctx.save(); ctx.strokeStyle=C.p[b.kx.i]; ctx.globalAlpha=.35+.35*pulse; ctx.lineWidth=5/z+3;
        this.outline(ctx,b); ctx.stroke(); ctx.restore(); }
      this.drawBody(ctx,b,z,C); });
    // 重心と力点
    if((st.phase==="aim"&&!this.isCpuTurn())||this.drag){ const b=st.bodies[st.cur]; if(!b.out){ const g=b.position,fp=this.drag?this.drag.hit:this.fpW();
      ctx.save(); ctx.font="700 11px sans-serif"; ctx.textAlign="center"; ctx.lineWidth=1.6;
      ctx.strokeStyle=C.ink; ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(g.x,g.y,4.5,0,7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(g.x-4.5,g.y); ctx.lineTo(g.x+4.5,g.y); ctx.moveTo(g.x,g.y-4.5); ctx.lineTo(g.x,g.y+4.5); ctx.stroke();
      ctx.fillStyle=C.ink; ctx.fillText(t("ksCg"),g.x,g.y-9);
      if(fp){ const col=C.p[st.cur],arm=Math.hypot(fp.x-g.x,fp.y-g.y); ctx.setLineDash([3,3]); ctx.strokeStyle=C.ink; ctx.beginPath(); ctx.moveTo(g.x,g.y); ctx.lineTo(fp.x,fp.y); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle=col; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(fp.x-5,fp.y-5); ctx.lineTo(fp.x+5,fp.y+5); ctx.moveTo(fp.x+5,fp.y-5); ctx.lineTo(fp.x-5,fp.y+5); ctx.stroke();
        ctx.fillStyle=C.ink; ctx.fillText(t("ksFp")+" "+t("ksArm",{d:Math.round(arm)}),fp.x,fp.y+18); } ctx.restore(); } }
    // 矢印
    let A=null; if(this.drag){ const d=this.drag,dx=d.c.x-d.s.x,dy=d.c.y-d.s.y,len=Math.hypot(dx,dy); if(len>4) A={hit:d.hit,dir:{x:dx/len,y:dy/len},pw:Math.min(len,this.DRAG)/this.DRAG}; }
    else if(st.arrow&&st.phase==="cpu"){ const k=Math.min(1,(T-st.arrow.t)/500); A={...st.arrow,pw:st.arrow.pw*k}; }
    if(A){ const col=C.p[st.cur],L0=30+A.pw*110,ex=A.hit.x+A.dir.x*L0,ey=A.hit.y+A.dir.y*L0;
      ctx.save(); ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=5; ctx.lineCap="round"; ctx.setLineDash([2,9]);
      ctx.beginPath(); ctx.moveTo(A.hit.x,A.hit.y); ctx.lineTo(ex,ey); ctx.stroke(); ctx.setLineDash([]);
      const a=Math.atan2(A.dir.y,A.dir.x); ctx.beginPath(); ctx.moveTo(ex+Math.cos(a)*12,ey+Math.sin(a)*12); ctx.lineTo(ex+Math.cos(a+2.4)*12,ey+Math.sin(a+2.4)*12); ctx.lineTo(ex+Math.cos(a-2.4)*12,ey+Math.sin(a-2.4)*12); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(A.hit.x,A.hit.y,5,0,7); ctx.fill();
      ctx.font=`700 ${15}px Fredoka, sans-serif`; ctx.textAlign="center"; ctx.fillStyle=C.ink; ctx.fillText(Math.round(A.pw*100)+"%",ex+A.dir.x*26,ey+A.dir.y*26+5); ctx.restore(); }
    ctx.restore(); },
  rr(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
};

return KS;
});
