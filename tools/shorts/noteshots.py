import asyncio, os
from playwright.async_api import async_playwright
from studio import FONT_CSS, FONT_FILES, FONTS, INIT
OUT="/home/claude/play/note-img"; os.makedirs(OUT,exist_ok=True)
APP="http://localhost:8770/"
DRIVE="""(k)=>{ const st=__b.MODS.ira.st; if(!st||st.phase!=='run') return; const P=st.c.P; const tg=P[Math.min(P.length-1,st.prog+k)]; const dx=tg.x-st.b.x,dy=tg.y-st.b.y,l=Math.hypot(dx,dy)||1,v=Math.min(l,3.4); st.pend.x+=dx/l*v; st.pend.y+=dy/l*v; }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":760},device_scale_factor=2,locale="ja-JP")
        await ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=FONT_CSS))
        await ctx.route("https://fonts.local/**", lambda r: r.fulfill(status=200, content_type="font/woff2", body=open(os.path.join(FONTS, FONT_FILES[r.request.url.rsplit("/",1)[1]]),"rb").read()))
        await ctx.add_init_script(INIT % (3,"ja"))
        pg=await ctx.new_page(); await pg.clock.install(time="2026-11-15T12:00:00+09:00"); await pg.clock.pause_at("2026-11-15T12:00:01+09:00")
        J=lambda c: pg.evaluate(c)
        async def shot(n): await pg.clock.run_for(400); await pg.wait_for_timeout(150); await pg.screenshot(path=f"{OUT}/{n}.png")
        async def frames(n,k=None):
            for _ in range(n):
                if k: await J(f"({DRIVE})({k})")
                await pg.clock.run_for(17)
        await pg.goto(APP); await pg.clock.run_for(1500); await pg.wait_for_timeout(800); await shot("01_home")
        await pg.click('[data-go="ira"]'); await pg.wait_for_selector('[data-pane="ira"].act'); await J("store.set('p_ira_rec',{stage:4,ms:83400}); __b.MODS.ira.s.ctl='tilt'; __b.MODS.ira.refresh()"); await shot("02_ira_setup")
        await pg.click('#iraCtlSel [data-val="finger"]'); await pg.click('#dock [data-act="start"]'); await frames(80); await frames(110,10); await shot("03_ira_play")
        await J("__b.MODS.ira.quit(); __b.MODS.ira.s.from=5; __b.MODS.ira.start()"); await frames(80); await frames(100,8); await shot("04_ira_bar")
        await J("__b.MODS.ira.quit()"); await pg.click('#homeBtn'); await pg.click('[data-go="rv"]'); await pg.wait_for_selector('[data-pane="rv"].act')
        await J("store.set('p_rv_rec',{1:{w:3,l:0,d:0},2:{w:1,l:2,d:0}}); __b.MODS.rv.refresh()"); await shot("05_rv_setup")
        await pg.click('#dock [data-act="start"]')
        for n in range(5):
            c=await J("(()=>{const hs=[...document.querySelectorAll('.rvh')].map(h=>+h.parentElement.dataset.c); return hs.length?hs[(hs.length*7+3)%hs.length]:-1})()")
            if c<0: break
            await pg.click(f'#rvBoard [data-c="{c}"]')
            for _ in range(40):
                if not await J("__b.MODS.rv.st.busy||__b.MODS.rv.st.turn!==__b.MODS.rv.st.human"): break
                await pg.clock.run_for(100)
            await pg.clock.run_for(400)
        await shot("06_rv_play")
        await pg.click('#rvQuit'); await pg.click('#rvVsSel [data-val="two"]'); await shot("07_rv_two")
        await pg.click('#homeBtn'); await pg.click('[data-go="kesi"]'); await pg.wait_for_selector('[data-pane="kesi"].act'); await pg.clock.run_for(800); await pg.wait_for_timeout(400)
        await J("(()=>{const m=__b.MODS.kesi; m.s={vs:'cpu',obs:2,p:[{type:'eraser',f:130,bend:60,rot:0},{type:'ruler',f:100,bend:0,rot:0}]}; m.refresh();})()"); await shot("08_kesi_setup")
        await pg.click('#dock [data-act="start"]'); await pg.clock.run_for(1200); await pg.wait_for_timeout(500); await shot("09_kesi_play")
        await pg.click('#homeBtn'); await pg.click('#menuBtn'); await shot("10_menu")
        await b.close()
    print(sorted(os.listdir(OUT)))
asyncio.run(main())
