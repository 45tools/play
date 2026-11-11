"""45 Play 紹介ショート（ゲーム別×3言語）。
python3 shorts.py ira ja   … 1本だけ
python3 shorts.py all      … 9本
"""
import asyncio, sys, os, json
from studio import Studio, APP

COL = {"ira": "#FF6A3D", "rv": "#1F9D6B", "kesi": "#0FAFB4"}
NAME = {"ira": {"ja": "イライラ棒", "en": "Steady", "zh-Hant": "穿越迷道"},
        "rv": {"ja": "リバーシ", "en": "Reversi", "zh-Hant": "黑白棋"},
        "kesi": {"ja": "消しゴムおとし", "en": "Eraser Flick", "zh-Hant": "橡皮擦大戰"}}
TAG = {"ira": {"ja": "かべに ふれずに ゴールへ", "en": "Don't touch the walls", "zh-Hant": "不碰牆，抵達終點"},
       "rv": {"ja": "はさんで、ひっくり返そう", "en": "Trap and flip", "zh-Hant": "夾住，翻過來"},
       "kesi": {"ja": "相手を 机から 落とそう", "en": "Knock it off the desk", "zh-Hant": "把對方撞下桌子"}}
END = {"ja": ("無料・広告なし・インストール不要", ["体を動かして", "1人でも、2人でも"], "毎週土曜、新しい遊びが増えます"),
       "en": ("Free · No ads · No install", ["Move a little", "Solo or with a friend"], "A new game every Saturday"),
       "zh-Hant": ("免費・無廣告・免安裝", ["動一動身體", "一個人或兩個人"], "每週六新增遊戲")}
L = {  # 読み上げ（字幕も同じ文）。最後は締めのことば
 "ira": {
  "ja": ["45 Play、イライラ棒。かべにふれずに、玉をゴールへ運ぼう。", "スマホを傾けて玉を転がします。指でなぞって動かすこともできます。",
         "かべにふれると、ハートがひとつ減って、チェックポイントからやり直し。", "全部で10面。だんだん道がせまくなり、回るバーも出てきます。",
         "45 Play。無料・広告なしで、ブラウザですぐ遊べます。"],
  "en": ["45 Play: Steady. Get the ball to the goal without touching the walls.", "Tilt your phone to roll the ball, or slide your finger to move it.",
         "Touch a wall and you lose a heart and go back to the checkpoint.", "Ten stages. The path gets narrower, and spinning bars appear.",
         "45 Play. Free, no ads, right in your browser."],
  "zh-Hant": ["45 Play，穿越迷道。不碰到牆，把球送到終點。", "傾斜手機讓球滾動，也可以用手指滑動來移動。",
         "碰到牆就會少一顆愛心，並從檢查點重來。", "共10關，通道越來越窄，還會出現旋轉的桿子。",
         "45 Play，免費、無廣告，用瀏覽器馬上就能玩。"]},
 "rv": {
  "ja": ["45 Play、リバーシ。相手の石をはさんで、ひっくり返そう。", "CPUと対戦するか、1台のスマホで2人対戦。CPUの強さは3段階です。",
         "置ける場所には、小さな点が出ます。", "まちがえたら「待った」で1手もどせます。最後に石が多いほうの勝ち！",
         "45 Play。無料・広告なしで、ブラウザですぐ遊べます。"],
  "en": ["45 Play: Reversi. Trap your opponent's discs and flip them.", "Play the CPU, or two players on one phone. The CPU has three levels.",
         "Small dots show where you can play.", "Made a mistake? Tap Undo. Most discs at the end wins!",
         "45 Play. Free, no ads, right in your browser."],
  "zh-Hant": ["45 Play，黑白棋。夾住對方的棋子，把它翻過來。", "可以和電腦對戰，或一支手機兩人對戰。電腦有三種強度。",
         "可以下的地方會出現小圓點。", "下錯了就按「悔棋」退回一步。最後棋子多的一方獲勝！",
         "45 Play，免費、無廣告，用瀏覽器馬上就能玩。"]},
 "kesi": {
  "ja": ["45 Play、消しゴムおとし。消しゴムを飛ばして、相手を机から落とそう。", "形は伸ばしたり曲げたりできますが、面積はいつも同じです。",
         "自分の消しゴムを指でスワイプ。長くスワイプするほど、強く飛びます。", "机の上には、動かない障害物も。先に相手を落としたほうの勝ち！",
         "45 Play。無料・広告なしで、ブラウザですぐ遊べます。"],
  "en": ["45 Play: Eraser Flick. Flick your eraser and knock the other one off the desk.", "Stretch or bend its shape — the area always stays the same.",
         "Swipe your eraser. The longer the swipe, the harder it flies.", "Watch out for obstacles on the desk. First to knock the other off wins!",
         "45 Play. Free, no ads, right in your browser."],
  "zh-Hant": ["45 Play，橡皮擦大戰。彈出橡皮擦，把對方撞下桌子。", "形狀可以拉長或彎曲，但面積永遠一樣。",
         "用手指滑動自己的橡皮擦，滑得越長，飛得越用力。", "桌上還有不會動的障礙物。先把對方撞下去的人贏！",
         "45 Play，免費、無廣告，用瀏覽器馬上就能玩。"]},
}
TILES = {}


async def title_card(s, game, lang):
    await s.stage(f"__card({json.dumps(f'<div class=chip><i>45</i>Play</div><div class=tile>{TILES[game]}</div><div class=big>{NAME[game][lang]}</div><div class=tag>{TAG[game][lang]}</div>')})")


async def end_card(s, lang):
    a, pills, wk = END[lang]
    html = (f'<div class=chip><i>45</i>Play</div><div class=tag>{a}</div><div class=url>45tools.github.io/play</div>'
            f'<div class=pills>{"".join(f"<span>{p}</span>" for p in pills)}</div><div class=small>{wk}</div>')
    await s.stage(f"__card({json.dumps(html)})")


async def opening(s, game, lang):
    await s.scene("title")
    await title_card(s, game, lang)
    await s.say(L[game][lang][0], caption="")
    await s.wait_speech(0.3)
    await s.stage(f"__card(''); __title({json.dumps(NAME[game][lang])}); __finger(true)")
    await s.stage(f"__app({json.dumps(APP + '?preview=1#' + game)})")
    await s.page.clock.run_for(1500)
    await s.page.wait_for_timeout(1500)
    await s.page.frame(name="app").wait_for_selector(f'[data-pane="{game}"].act', timeout=15000)


async def ending(s, game, lang):
    await s.wait_speech(0.4)
    await s.scene("end")
    await s.stage("__finger(false); __cap('')")
    await end_card(s, lang)
    await s.say(L[game][lang][-1], caption="")
    await s.wait_speech(0.8)


async def to_page(s, x, y):
    """アプリ内の座標 → 撮影ページの座標"""
    r = await s.page.evaluate("(()=>{const b=document.getElementById('app').getBoundingClientRect();return [b.x,b.y,b.width/390]})()")
    return r[0] + x * r[2], r[1] + y * r[2]


DRIVE = """(k,bad)=>{ const m=__b.MODS.ira, st=m.st; if(!st||st.phase!=='run') return st&&st.phase; const P=st.c.P;
  let tg=P[Math.min(P.length-1,st.prog+k)]; if(bad){ const a=P[st.prog],b=P[Math.min(P.length-1,st.prog+4)]; const tx=b.x-a.x,ty=b.y-a.y,l=Math.hypot(tx,ty)||1; tg={x:st.b.x-ty/l*30,y:st.b.y+tx/l*30}; }
  const dx=tg.x-st.b.x,dy=tg.y-st.b.y,l=Math.hypot(dx,dy)||1, v=Math.min(l,3.4); st.pend.x+=dx/l*v; st.pend.y+=dy/l*v; return st.phase; }"""


async def drive(s, frames, k=10, bad=False):
    for _ in range(frames):
        ph = await s.js(f"({DRIVE})({k},{json.dumps(bad)})")
        await s.tick()
        if bad and ph != "run": break


async def ira(s, lang):
    T = L["ira"][lang]
    await opening(s, "ira", lang)
    await s.js("store.set('p_ira_rec',{stage:9,ms:99000}); __b.MODS.ira.s.from=1; __b.MODS.ira.s.ctl='tilt'; __b.MODS.ira.refresh()")
    await s.scene("setup")
    await s.say(T[1]); await s.hold(0.6)
    await s.tap('#iraCtlSel [data-val="tilt"]', after=0.5)
    await s.tap('#iraCtlSel [data-val="finger"]', after=0.6)
    await s.tap('#iraFromSel [data-val="1"]', after=0.3)
    await s.wait_speech()
    await s.tap('#dock [data-act="start"]', after=0.2)
    await s.scene("run")
    await s.stage("__finger(false)")
    await s.hold(1.4)
    await drive(s, 75)
    await s.say(T[2])
    await drive(s, 40, bad=True)
    await s.hold(1.2)
    await drive(s, 60)
    await s.wait_speech(0.2)
    await s.scene("hard")
    await s.js("__b.MODS.ira.quit(); __b.MODS.ira.s.from=5; __b.MODS.ira.start()")
    await s.say(T[3]); await s.hold(1.4)
    await drive(s, 95, k=8)
    await s.hold(1.5)
    await s.wait_speech(0.3)
    await ending(s, "ira", lang)


async def rv(s, lang):
    T = L["rv"][lang]
    await opening(s, "rv", lang)
    await s.scene("setup")
    await s.say(T[1]); await s.hold(0.5)
    await s.tap('#rvVsSel [data-val="cpu"]', after=0.3)
    await s.tap('#rvLvSel [data-val="2"]', after=0.3)
    await s.tap('#rvColSel [data-val="0"]', after=0.3)
    await s.wait_speech()
    await s.tap('#dock [data-act="start"]', after=0.6)
    await s.scene("play")
    await s.say(T[2])
    for n in range(4):
        # 返せる数が多い所を選ぶ（見ばえのため）
        c = await s.js("(()=>{const st=__b.MODS.rv.st; const hs=[...document.querySelectorAll('.rvh')].map(h=>+h.parentElement.dataset.c); return hs.length?hs[(hs.length*7+3)%hs.length]:-1})()")
        if c < 0: break
        await s.tap(f'#rvBoard [data-c="{c}"]', after=0.4)
        for _ in range(60):
            busy = await s.js("__b.MODS.rv.st.busy||__b.MODS.rv.st.turn!==__b.MODS.rv.st.human")
            if not busy: break
            await s.hold(0.1)
        await s.hold(0.5)
        if n == 1: await s.wait_speech(); await s.say(T[3])
    await s.tap('#dock [data-act="undo"]', after=1.0)
    await s.wait_speech(0.4)
    await ending(s, "rv", lang)


async def kesi(s, lang):
    T = L["kesi"][lang]
    await opening(s, "kesi", lang)
    await s.js("(()=>{const m=__b.MODS.kesi; m.s={vs:'cpu',obs:2,p:[{type:'eraser',f:100,bend:0,rot:0},{type:'eraser',f:100,bend:0,rot:0}]}; m.refresh();})()")
    await s.scene("setup")
    await s.say(T[1]); await s.hold(0.3)
    # 長さのスライダーを動かす
    for sel, vals in (("#ksF0", range(100, 151, 5)), ("#ksB0", range(0, 121, 10))):
        loc, b = await s.box(sel)
        await s.move_to(b["x"] + b["width"] * .45, b["y"] + b["height"] / 2)
        for v in vals:
            await s.js(f"(()=>{{const e=document.querySelector('{sel}'); e.value={v}; e.dispatchEvent(new Event('input',{{bubbles:true}}));}})()")
            await s.tick(3)
        await s.hold(0.3)
    await s.wait_speech()
    await s.tap('#dock [data-act="start"]', after=0.8)
    await s.scene("play")
    await s.say(T[2])
    for turn in range(3):
        # 自分の番まで待つ
        for _ in range(120):
            ok = await s.js("(()=>{const m=__b.MODS.kesi; return !!(m.st&&m.st.phase==='aim'&&!m.isCpuTurn())})()")
            if ok: break
            await s.hold(0.1)
        else:
            break
        pts = await s.js("""(()=>{const m=__b.MODS.kesi,st=m.st,a=st.bodies[0].position,b=st.bodies[1].position,r=document.getElementById('ksCv').getBoundingClientRect(),v=m.vw;
          const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy); const S=k=>[r.left+v.ox+(a.x+dx/l*k)*v.z, r.top+v.oy+(a.y+dy/l*k)*v.z]; return [S(0),S(70+40)];})()""")
        x0, y0 = await to_page(s, *pts[0]); x1, y1 = await to_page(s, *pts[1])
        await s.move_to(x0, y0)
        await s.page.evaluate("window.__press&&__press()")
        await s.page.mouse.move(x0, y0); await s.page.mouse.down()
        for i in range(1, 13):
            k = i / 12; s.fx, s.fy = x0 + (x1 - x0) * k, y0 + (y1 - y0) * k
            await s.page.mouse.move(s.fx, s.fy); await s.tick()
        await s.page.mouse.up()
        await s.hold(2.2)
        if turn == 0: await s.wait_speech(); await s.say(T[3])
        over = await s.js("!__b.MODS.kesi.st||__b.MODS.kesi.st.phase==='over'")
        if over: break
    await s.wait_speech(0.6)
    await ending(s, "kesi", lang)


async def run(game, lang, bgm=None):
    async with Studio(f"{game}_{lang}", lang, COL[game]) as s:
        if not TILES:
            await s.stage(f"__app({json.dumps(APP + '?preview=1')})"); await s.page.clock.run_for(1500); await s.page.wait_for_timeout(1200)
            for g in COL: TILES[g] = await s.page.frame(name="app").evaluate(f"TILE['{g}']")
            await s.stage("__app('about:blank')")
        await {"ira": ira, "rv": rv, "kesi": kesi}[game](s, lang)
    return s.finish(bgm)


if __name__ == "__main__":
    bgm = os.environ.get("BGM")
    if sys.argv[1] == "all":
        for g in COL:
            for lg in ("ja", "en", "zh-Hant"):
                TILES.clear()
                if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", f"{g}_{lg}", "final.mp4")): continue
                try: print("OK", g, lg, asyncio.run(run(g, lg, bgm)), flush=True)
                except Exception as e: print("FAIL", g, lg, repr(e)[:300], flush=True)
    else:
        print(asyncio.run(run(sys.argv[1], sys.argv[2], bgm)))
