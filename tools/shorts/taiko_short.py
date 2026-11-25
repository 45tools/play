"""45 Play たいこ の紹介ショート。
撮影中はアプリの音の時計をページの時計に合わせ（AudioContext の currentTime を差し替え）、
たたいた音と曲の予定を記録 → 最後に OfflineAudioContext で同じ音を作って動画に重ねる。
準備：python3 -m http.server 8770 --directory ~/projects/45tools ／ python3 -m http.server 8771 --directory ~/projects/45tools/play/tools/shorts
使い方：python3 taiko_short.py ja|en|zh-Hant
"""
import asyncio, sys, os, json, base64, subprocess
import studio
studio.APP = APP = "http://localhost:8770/play/"
from studio import Studio, FPS

COL = "#E5484D"
NAME = {"ja": "たいこ", "en": "Drums", "zh-Hant": "打鼓"}
TAG = {"ja": "スマホが たいこになる！", "en": "Your phone is a drum!", "zh-Hant": "手機變成鼓！"}
END = {"ja": ("無料・広告なし・インストール不要", ["体を動かして", "1人でも、みんなでも"], "毎週土曜、新しい遊びが増えます"),
       "en": ("Free · No ads · No install", ["Move a little", "Solo or together"], "A new game every Saturday"),
       "zh-Hant": ("免費・無廣告・免安裝", ["動一動身體", "一個人或大家一起"], "每週六新增遊戲")}
L = {
 "ja": ["45 Play、たいこ。スマホが、たいこになる！", "じゆうにたたくモードは、どこをたたいても、音と色が出ます。赤ちゃんや小さな子にも。",
        "たいこは1つ、2つ、4つ。音は9種類から選べて、自分の声を録音して使うこともできます。",
        "リズムゲームでは、落ちてくる玉がたいこに重なったら、たたこう。曲は3つ、むずかしさは3段階です。",
        "45 Play。無料・広告なしで、ブラウザですぐ遊べます。"],
 "en": ["45 Play: Drums. Your phone becomes a drum!", "In Free play, tap anywhere for sounds and colors. Great for babies and little kids.",
        "Choose one, two or four drums, pick from nine sounds, or record your own voice.",
        "In the Rhythm game, hit the drum when a falling note reaches it. Three songs, three levels.",
        "45 Play. Free, no ads, right in your browser."],
 "zh-Hant": ["45 Play，打鼓。手機變成鼓！", "自由敲打模式，點哪裡都有聲音和顏色，寶寶和小小孩也能玩。",
        "可以選1個、2個或4個鼓，聲音有9種，也能錄自己的聲音來用。",
        "節奏遊戲裡，音符落到鼓上時就敲下去。共3首歌、3種難度。",
        "45 Play，免費、無廣告，用瀏覽器馬上就能玩。"],
}

# 音の時計をページの時計にそろえ、たたいた音・曲を記録する
HOOK = r"""(()=>{ if(window.__tkHook) return; window.__tkHook=1; window.__ev=[];
  const R=new (window.AudioContext||window.webkitAudioContext)(); const base=performance.now()/1000;
  const F=new Proxy(R,{get(o,k){ if(k==="currentTime") return performance.now()/1000-base; if(k==="state") return "running";
    if(k==="outputLatency"||k==="baseLatency") return 0; const v=o[k]; return typeof v==="function"?v.bind(o):v; }});
  window.__base=base; window.ac=()=>F; window.acReset=()=>F;
  const M=__b.MODS.taiko; const h=M.hit.bind(M), mu=M.music.bind(M);
  M.hit=(id,t0,dest,v)=>{ __ev.push({k:"hit",id,p:performance.now()}); return h(id,t0,dest,v); };
  M.music=(sg,t0,ci,vol)=>{ const key=Object.keys(M.SONGS).find(k=>M.SONGS[k]===sg); __ev.push({k:"music",song:key,p:(t0+base)*1000,ci,vol}); return mu(sg,t0,ci,vol); };
})()"""

RENDER = r"""async (evs)=>{ const M=__b.MODS.taiko, D=Math.max(...evs.map(e=>e.t))+40, SR=44100;
  const off=new OfflineAudioContext(2,Math.ceil(D*SR),SR); const sa=window.ac; window.ac=()=>off; M.busA=null; M.ck=null; const st0=M.st; M.st={mgs:[]};
  for(const e of evs){ if(e.k==="hit") M.hit(e.id,e.t+0.0001); else M.music(M.SONGS[e.song],e.t,e.ci,e.vol); }
  const buf=await off.startRendering(); window.ac=sa; M.st=st0; M.busA=null;
  const n=buf.length, out=new DataView(new ArrayBuffer(44+n*4)); const w=(o,s)=>[...s].forEach((c,i)=>out.setUint8(o+i,c.charCodeAt(0)));
  w(0,"RIFF"); out.setUint32(4,36+n*4,true); w(8,"WAVEfmt "); out.setUint32(16,16,true); out.setUint16(20,1,true); out.setUint16(22,2,true);
  out.setUint32(24,SR,true); out.setUint32(28,SR*4,true); out.setUint16(32,4,true); out.setUint16(34,16,true); w(36,"data"); out.setUint32(40,n*4,true);
  const L=buf.getChannelData(0),Rr=buf.getChannelData(1); for(let i=0;i<n;i++){ out.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]))*32767,true); out.setInt16(46+i*4,Math.max(-1,Math.min(1,Rr[i]))*32767,true); }
  let s=""; const u=new Uint8Array(out.buffer); for(let i=0;i<u.length;i+=32768) s+=String.fromCharCode.apply(null,u.subarray(i,i+32768)); return btoa(s); }"""


class Clock:
    """シーンの中で、ページの時刻 → 動画の時刻 にする"""
    def __init__(self): self.marks = []
    async def mark(self, s): self.marks.append((s.frame / FPS, await s.js("performance.now()")))
    def vt(self, p):
        best = max((m for m in self.marks if m[1] <= p + 1), key=lambda m: m[1], default=self.marks[0])
        return best[0] + (p - best[1]) / 1000


async def drum_tap(s, i):
    d = await s.js(f"(()=>{{const m=__b.MODS.taiko,d=m.st.drums[{i}]; return [d.x,d.y,m.W];}})()")
    _, b = await s.box("#tkCv"); k = b["width"] / d[2]
    s.fx, s.fy = b["x"] + d[0] * k, b["y"] + d[1] * k
    await s.page.evaluate("window.__press&&__press()")
    await s.js(f"(()=>{{const d=__b.MODS.taiko.st.drums[{i}]; __b.MODS.taiko.tapAt(d.x,d.y);}})()")


async def run(lang, bgm=None):
    T = L[lang]; ck = Clock()
    async with Studio(f"taiko_{lang}", lang, COL) as s:
        await s.stage(f"__app({json.dumps(APP + '?preview=1')})"); await s.page.clock.run_for(1500); await s.page.wait_for_timeout(1200)
        tile = await s.page.frame(name="app").evaluate("TILE['taiko']")
        await s.stage("__app('about:blank')")
        await s.scene("title")
        await s.stage(f"__card({json.dumps(f'<div class=chip><i>45</i>Play</div><div class=tile>{tile}</div><div class=big>{NAME[lang]}</div><div class=tag>{TAG[lang]}</div>')})")
        await s.say(T[0], caption=""); await s.wait_speech(0.3)
        await s.stage(f"__card(''); __title({json.dumps(NAME[lang])}); __finger(true)")
        await s.stage(f"__app({json.dumps(APP + '?preview=1#taiko')})")
        await s.page.clock.run_for(1500); await s.page.wait_for_timeout(1500)
        await s.page.frame(name="app").wait_for_selector('[data-pane="taiko"].act', timeout=15000)
        await s.js("(()=>{const m=__b.MODS.taiko; Object.assign(m.s,{md:'free',n:'2',snd:['don','kan','pan','piyo'],song:'s2',lv:'1',bgm:'off'}); m.refresh();})()")
        await s.js(HOOK)
        # じゆうにたたく（2つ）
        await s.scene("free"); await ck.mark(s)
        await s.say(T[1]); await s.hold(0.4)
        await s.tap('#dock [data-act="start"]', after=0.4); await ck.mark(s)
        for i, gap in [(0, .45), (1, .3), (0, .3), (0, .3), (1, .45), (1, .25), (0, .25), (1, .5), (0, .35), (1, .35), (0, .3), (1, .3), (0, .6)]:
            await drum_tap(s, i); await s.hold(gap)
        await s.wait_speech(0.2)
        await s.js("__b.MODS.taiko.quit()")
        # 4つ・音を選ぶ
        await s.scene("sounds"); await ck.mark(s)
        await s.say(T[2]); await s.hold(0.3)
        await s.tap('#tkNSel [data-val="4"]', after=0.6)
        await s.js("(()=>{const m=__b.MODS.taiko; m.s.snd=['don','shan','piyo','bell']; m.refresh();})()"); await s.hold(0.8)
        await s.tap('#dock [data-act="start"]', after=0.3); await ck.mark(s)
        for i, gap in [(0, .3), (1, .3), (2, .3), (3, .4), (3, .25), (2, .25), (1, .25), (0, .5), (2, .3), (1, .3)]:
            await drum_tap(s, i); await s.hold(gap)
        await s.wait_speech(0.2)
        await s.js("__b.MODS.taiko.quit()")
        # リズムゲーム
        await s.scene("beat"); await ck.mark(s)
        await s.js("(()=>{const m=__b.MODS.taiko; Object.assign(m.s,{md:'beat',n:'4',song:'s2',lv:'2'}); m.refresh();})()"); await s.hold(0.4)
        await s.say(T[3])
        await s.tap('#dock [data-act="start"]', after=0); await ck.mark(s)
        frames = 0
        while frames < FPS * 13:
            due = await s.js("(()=>{const m=__b.MODS.taiko,st=m.st; if(!st) return []; const now=m.now(); const out=[]; for(const nt of st.notes){ if(!nt.done&&!nt.sd&&now>=nt.t-0.017){ nt.sd=1; out.push(nt.l);} } return out;})()")
            for l in due: await drum_tap(s, l)
            await s.tick(); frames += 1
        await s.wait_speech(0.2)
        beat_end = s.frame / FPS
        await s.js("__b.MODS.taiko.quit()")
        evs = await s.js("__ev")
        # 終わり
        await s.scene("end")
        await s.stage("__finger(false); __cap('')")
        x, pills, wk = END[lang]
        html = (f'<div class=chip><i>45</i>Play</div><div class=tag>{x}</div><div class=url>45tools.github.io/play</div>'
                f'<div class=pills>{"".join(f"<span>{p}</span>" for p in pills)}</div><div class=small>{wk}</div>')
        await s.stage(f"__card({json.dumps(html)})")
        await s.say(T[-1], caption=""); await s.wait_speech(0.8)
        for e in evs: e["t"] = round(ck.vt(e["p"]), 4)
        evs = [e for e in evs if e["t"] >= 0]
        wav64 = await s.js(f"({RENDER})({json.dumps(evs)})")
    path = s.finish(bgm)
    wav = os.path.join(s.out, "drums.wav"); open(wav, "wb").write(base64.b64decode(wav64))
    final2 = os.path.join(s.out, "final_drums.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", path, "-i", wav, "-filter_complex",
                    f"[0:a]asplit=2[v][sc];[1:a]atrim=0:{beat_end:.2f},afade=t=out:st={beat_end-0.5:.2f}:d=0.5,volume=0.6,aresample=48000[d0];[d0][sc]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=300[d];[v][d]amix=inputs=2:normalize=0:duration=first[a]",
                    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", final2], check=True)
    return final2


if __name__ == "__main__":
    print(asyncio.run(run(sys.argv[1], os.environ.get("BGM"))))
