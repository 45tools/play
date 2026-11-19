"""1分体感のnote見出し画像 → note-img/one/00_header.png"""
import asyncio, os
from playwright.async_api import async_playwright
from studio import FONT_CSS, FONT_FILES, FONTS
HERE=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.join(HERE,"..","..","note-img","one")
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={"width":1280,"height":670},device_scale_factor=2)
        await ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=FONT_CSS))
        await ctx.route("https://fonts.local/**", lambda r: r.fulfill(status=200, content_type="font/woff2", body=open(os.path.join(FONTS, FONT_FILES[r.request.url.rsplit("/",1)[1]]),"rb").read()))
        pg=await ctx.new_page(); await pg.goto("http://localhost:8770/?preview=1"); await pg.wait_for_timeout(1200)
        tile=await pg.evaluate("TILE['one']")
        html=f'''<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=x"><style>
        body{{margin:0;width:1280px;height:670px;background:#F3EEFF;background-image:radial-gradient(#E0D6F7 3px,transparent 3.4px);background-size:40px 40px;font-family:"M PLUS Rounded 1c",sans-serif;color:#1E2445;display:flex;align-items:center;gap:60px;padding:0 90px;box-sizing:border-box}}
        .l{{flex:1}} .chip{{display:inline-flex;align-items:center;gap:14px;font:700 50px Fredoka,sans-serif}} .chip i{{font-style:normal;width:70px;height:70px;border-radius:20px;background:#2456D6;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:35px}}
        h1{{font-size:96px;font-weight:800;line-height:1.1;margin:22px 0 14px;color:#8A5CF6}} h2{{font-size:46px;font-weight:800;margin:0 0 22px}} p{{margin:0;font-size:30px;font-weight:700;color:#66708F;line-height:1.5}} p b{{color:#2456D6}}
        .tile{{width:330px;height:330px;border-radius:78px;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,color-mix(in srgb,#8A5CF6 62%,#fff),#8A5CF6 70%);box-shadow:0 16px 0 color-mix(in srgb,#8A5CF6 62%,#000),0 28px 50px rgba(30,36,69,.22)}} .tile svg{{width:66%;height:66%}}
        </style></head><body><div class=l><div class=chip><i>45</i>Play</div><h1>1分体感</h1><h2>時計を見ずに、ぴったりストップ</h2><p>1人でも、みんなでも。じゃまありもドボンルールも<br><b>無料・広告なし・インストール不要</b></p></div><div class=tile>{tile}</div></body></html>'''
        await pg.set_content(html); await pg.wait_for_timeout(800)
        await pg.screenshot(path=os.path.join(OUT,"00_header.png")); await b.close()
asyncio.run(main())
