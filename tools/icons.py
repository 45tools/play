"""ゲームごとのアイコン（<id>/icon-180/192/512.png）と 45 Play の icon-180.png を作る。
シリーズ共通の形：紺の背景＋生成り色のボード＋青い「45」の駒。真ん中にホームと同じゲームの絵。
使い方：python3 tools/build.py の後に python3 tools/icons.py（Playwright を使う）
"""
import asyncio, os
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COLORS = {"ira": "#FF6A3D", "rv": "#1F9D6B", "kesi": "#0FAFB4", "one": "#8A5CF6", "taiko": "#E5484D", "sky": "#2E6BFF", "kart": "#F08A00"}

def svg(art, col):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{col}" stop-opacity=".62"/><stop offset=".7" stop-color="{col}"/></linearGradient></defs>
<rect width="512" height="512" fill="#14213D"/>
<rect x="42" y="42" width="428" height="428" rx="40" fill="#F3F0E8"/>
<rect x="72" y="72" width="368" height="368" rx="12" fill="none" stroke="#A9A9A9" stroke-width="6"/>
<rect x="112" y="104" width="288" height="288" rx="66" fill="#fff"/>
<rect x="112" y="104" width="288" height="288" rx="66" fill="url(#g)"/>
<g transform="translate(148 140) scale(4.67)" fill="none">{art}</g>
<path d="M318 318 L352 330 L332 352 Z" fill="#2456D6"/>
<circle cx="372" cy="374" r="50" fill="#2456D6"/>
<text x="372" y="393" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="52" fill="#FFFFFF">45</text>
</svg>'''

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        await pg.goto("file://" + os.path.join(ROOT, "index.html"))
        await pg.wait_for_timeout(300)
        for gid, col in COLORS.items():
            art = await pg.evaluate(f"TILE['{gid}'].replace(/^<svg[^>]*>/,'').replace(/<\\/svg>$/,'')")
            s = svg(art, col)
            for size in (512, 192, 180):
                await pg.set_viewport_size({"width": size, "height": size})
                await pg.set_content(f'<html><body style="margin:0">{s.replace("width=\"512\" height=\"512\"", f"width=\"{size}\" height=\"{size}\"", 1)}</body></html>')
                await pg.wait_for_timeout(50)
                await pg.screenshot(path=os.path.join(ROOT, gid, f"icon-{size}.png"))
        # 45 Play 本体（ゲーム機の十字キー＋A・Bボタン）
        art='<rect x="3" y="15" width="17" height="6.5" rx="1.6" fill="#fff"/><rect x="8.25" y="9.75" width="6.5" height="17" rx="1.6" fill="#fff"/><circle cx="29" cy="13" r="4.6" fill="#fff"/><circle cx="35" cy="20.5" r="4.6" fill="#14213D"/><path d="M14 33h14" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-opacity=".6"/>'
        s=svg(art,"#FF6A3D")
        for size in (512, 192, 180):
            await pg.set_viewport_size({"width": size, "height": size})
            await pg.set_content(f'<html><body style="margin:0">{s.replace("width=\"512\" height=\"512\"", f"width=\"{size}\" height=\"{size}\"", 1)}</body></html>')
            await pg.wait_for_timeout(50)
            await pg.screenshot(path=os.path.join(ROOT, f"icon-{size}.png"))
        await b.close()
    print("icons ok")

asyncio.run(main())
