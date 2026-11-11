"""45 Play を組み立てる。
src/shell.html（共通の画面）と src/games/*.js（ゲームごと）から、公開用のファイルを書き出す。
  index.html            … 45 Play のホーム（待ち受け）
  <id>/index.html       … ゲームごとの入口（そのゲームだけをホーム画面に追加できる）
  <id>/manifest.json
  games/<id>.js         … 開いたときだけ読み込むゲーム本体
  sw.js                 … オフライン用（ネットの最新を優先）
使い方：python3 tools/build.py   （簡体字は繁体字から自動変換。pip install opencc-python-reimplemented）
"""
import json, os, re, shutil
from opencc import OpenCC

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = lambda *p: os.path.join(ROOT, *p)

GAMES = [  # id, 英語名（ホーム画面の名前）, 日本語名, 説明
    ("ira", "Steady", "イライラ棒", "かべにふれないように玉をゴールへ。スマホを傾けて、体を動かして遊べます。"),
    ("rv", "Reversi", "リバーシ", "1台で2人対戦、CPU（3段階）とも対戦できるリバーシ。"),
    ("kesi", "Flick", "消しゴムおとし", "スワイプで消しゴムを飛ばして、相手を机から落とす。"),
]
BRAND_DESC = "体を動かしたり、ひと息ついたりする無料の遊び。インストール不要・広告なし。"

shell = open(S("src", "shell.html"), encoding="utf-8").read()
# 簡体字：繁体字の文言から作る
a = shell.index('"zh-Hant":{'); b = shell.index("/*ZH*/")
zh = OpenCC("tw2sp").convert(shell[a:b].rstrip()).replace('"zh-Hant":{', '"zh":{', 1)
shell = shell[:b] + "," + zh + "\n" + shell[b + len("/*ZH*/"):]
ver = re.search(r'APP_VER="([^"]+)"', shell).group(1)

def page(base, d, title, short, desc, solo):
    return (shell.replace("{{BASE}}", base).replace("{{DIR}}", d).replace("{{TITLE}}", title)
            .replace("{{SHORT}}", short).replace("{{DESC}}", desc)
            .replace("{{SOLO}}", f"const SOLO={json.dumps(solo)};"))

def manifest(name, short, scope):
    return json.dumps({"name": name, "short_name": short, "start_url": "./", "scope": scope, "display": "standalone",
                       "background_color": "#EEF6FF", "theme_color": "#EEF6FF",
                       "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
                                 {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]},
                      ensure_ascii=False, indent=1)

open(S("index.html"), "w", encoding="utf-8").write(page("", "", "45 Play｜体を動かす・ひと息つく遊び", "45 Play", BRAND_DESC, None))
open(S("manifest.json"), "w", encoding="utf-8").write(manifest("45 Play", "45 Play", "./"))

os.makedirs(S("games"), exist_ok=True)
files = ["./", "index.html", "manifest.json", "icon-180.png", "icon-192.png", "icon-512.png"]
for gid, en, ja, desc in GAMES:
    os.makedirs(S(gid), exist_ok=True)
    open(S(gid, "index.html"), "w", encoding="utf-8").write(
        page('<base href="../">\n', gid + "/", f"{ja}｜45 Play", f"45 {en}", desc + " " + BRAND_DESC, gid))
    open(S(gid, "manifest.json"), "w", encoding="utf-8").write(manifest(f"45 {en}（{ja}）", f"45 {en}", "../"))
    shutil.copy(S("src", "games", gid + ".js"), S("games", gid + ".js"))
    files += [f"{gid}/", f"{gid}/index.html", f"games/{gid}.js", f"{gid}/icon-180.png"]
files += ["lib/matter.min.js"]

sw = f'''const C="play-{ver}";
const FILES={json.dumps(files)};
// 入れるときは必ずサーバーから取り直す（端末に残った古い版を使わない）
self.addEventListener("install",e=>{{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(u=>new Request(u,{{cache:"reload"}})))).catch(()=>{{}}));self.skipWaiting();}});
self.addEventListener("activate",e=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));}});
// いつもネット上の最新を確認し、つながらないときだけ保存版を使う
self.addEventListener("fetch",e=>{{
  const r=e.request; if(r.method!=="GET"||!r.url.startsWith(self.location.origin)) return;
  const key=r.url.split("#")[0].split("?")[0];
  e.respondWith(fetch(r,{{cache:"no-cache"}}).then(res=>{{ if(res.ok){{ const cp=res.clone(); caches.open(C).then(c=>c.put(key,cp)); }} return res; }})
    .catch(()=>caches.match(key).then(m=>m||caches.match(r,{{ignoreSearch:true}})).then(m=>m||(r.mode==="navigate"?caches.match(new URL("index.html",self.registration.scope).href):undefined))));
}});
'''
open(S("sw.js"), "w").write(sw)
print("built", ver, "games:", [g[0] for g in GAMES])
