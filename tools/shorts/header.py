import asyncio, os, json
from playwright.async_api import async_playwright
import sys; sys.path.insert(0,'shp')
from studio import FONT_CSS, FONT_FILES, FONTS
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={"width":1280,"height":670},device_scale_factor=2)
        await ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=FONT_CSS))
        await ctx.route("https://fonts.local/**", lambda r: r.fulfill(status=200, content_type="font/woff2", body=open(os.path.join(FONTS, FONT_FILES[r.request.url.rsplit("/",1)[1]]),"rb").read()))
        pg=await ctx.new_page(); await pg.goto("http://localhost:8770/?preview=1"); await pg.wait_for_timeout(1200)
        tiles={g:await pg.evaluate(f"TILE['{g}']") for g in ("ira","rv","kesi")}
        col={"ira":"#FF6A3D","rv":"#1F9D6B","kesi":"#0FAFB4"}; nm={"ira":"イライラ棒","rv":"リバーシ","kesi":"消しゴムおとし"}
        t="".join(f'<div class=g><div class=tile style="--c:{col[g]}">{tiles[g]}</div><b>{nm[g]}</b></div>' for g in tiles)
        html=f'''<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=x"><style>
        body{{margin:0;width:1280px;height:670px;background:#EEF6FF;background-image:radial-gradient(#D3E2F7 3px,transparent 3.4px);background-size:40px 40px;font-family:"M PLUS Rounded 1c",sans-serif;color:#1E2445;display:flex;align-items:center;gap:40px;padding:0 70px;box-sizing:border-box}}
        .l{{flex:1}} .chip{{display:inline-flex;align-items:center;gap:14px;font:700 54px Fredoka,sans-serif}} .chip i{{font-style:normal;width:74px;height:74px;border-radius:21px;background:#2456D6;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:37px}}
        h1{{font-size:60px;font-weight:800;line-height:1.3;margin:26px 0 18px}} p{{margin:0;font-size:30px;font-weight:700;color:#66708F}} p b{{color:#2456D6}}
        .r{{display:flex;gap:26px}} .g{{display:flex;flex-direction:column;align-items:center;gap:16px;font-size:28px}}
        .tile{{width:170px;height:170px;border-radius:40px;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,color-mix(in srgb,var(--c) 62%,#fff),var(--c) 70%);box-shadow:0 9px 0 color-mix(in srgb,var(--c) 62%,#000),0 16px 30px rgba(30,36,69,.2)}} .tile svg{{width:66%;height:66%}}
        </style></head><body><div class=l><div class=chip><i>45</i>Play</div><h1>体を動かして、<br>ひと息つこう。</h1><p>無料・広告なし・インストール不要<br><b>毎週土曜、新しい遊びが増えます</b></p></div><div class=r>{t}</div></body></html>'''
        await pg.set_content(html); await pg.wait_for_timeout(800)
        await pg.screenshot(path="/home/claude/play/note-img/00_header.png"); await b.close()
asyncio.run(main())
