"""1分体感のnote用画像 → note-img/one/。python3 noteshots_one.py（localhost:8770 でアプリを配信しておく）"""
import asyncio, os
from playwright.async_api import async_playwright
from studio import FONT_CSS, FONT_FILES, FONTS, INIT
HERE=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.join(HERE,"..","..","note-img","one"); os.makedirs(OUT,exist_ok=True)
APP="http://localhost:8770/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":760},device_scale_factor=2,locale="ja-JP")
        await ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=FONT_CSS))
        await ctx.route("https://fonts.local/**", lambda r: r.fulfill(status=200, content_type="font/woff2", body=open(os.path.join(FONTS, FONT_FILES[r.request.url.rsplit("/",1)[1]]),"rb").read()))
        await ctx.add_init_script(INIT % (5,"ja"))
        pg=await ctx.new_page(); await pg.clock.install(time="2026-11-22T12:00:00+09:00"); await pg.clock.pause_at("2026-11-22T12:00:01+09:00")
        J=lambda c: pg.evaluate(c)
        async def shot(n): await pg.clock.run_for(300); await pg.wait_for_timeout(150); await pg.screenshot(path=f"{OUT}/{n}.png")
        async def tap(sel): await pg.dispatch_event(sel,"pointerdown")
        await pg.goto(APP); await pg.clock.run_for(1500); await pg.wait_for_timeout(800); await shot("01_home")
        await pg.click('[data-go="one"]'); await pg.wait_for_selector('[data-pane="one"].act')
        await J("(()=>{const m=__b.MODS.one; Object.assign(m.s,{tg:'10',st:'plain',pl:'1',lp:'on',ru:'near',tn:'turn',nz:'2'}); store.set('p_one_rec',{'10':{d:0.08,h:[9.9,10.4,10.1],avg:60.6},'60':{d:1.42,h:[57.1,62.3,58.6],avg:59.3}}); m.refresh();})()"); await shot("02_setup")
        await pg.click('#dock [data-act="start"]'); await tap('#onPad'); await pg.clock.run_for(1200); await shot("03_run")
        await pg.clock.run_for(1850); await tap('#onPad'); await pg.clock.run_for(2900); await tap('#onPad'); await pg.clock.run_for(4100); await tap('#onPad'); await shot("04_result")
        await J("(()=>{const m=__b.MODS.one; m.quit(); Object.assign(m.s,{st:'noise',nz:'3'}); m.refresh();})()"); await shot("05_noise_setup")
        await J("(()=>{const m=__b.MODS.one; Object.assign(m.s,{pl:'3',tn:'tog',st:'noise',nz:'1',ru:'doban'}); m.refresh(); m.start();})()"); await tap('#onPad'); await pg.clock.run_for(3500); await shot("06_together")
        await pg.clock.run_for(5300); await tap('#onMulti button[data-p="1"]'); await pg.clock.run_for(800); await tap('#onMulti button[data-p="0"]'); await pg.clock.run_for(1100); await tap('#onMulti button[data-p="2"]'); await shot("07_rank")
        await b.close()
    print(sorted(os.listdir(OUT)))
asyncio.run(main())
