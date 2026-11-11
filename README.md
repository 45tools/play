# 45 Play

体を動かしたり、ひと息ついたりする無料の遊び（イライラ棒・リバーシ・消しゴムおとし）。
https://45tools.github.io/play/

- 作り方：`src/shell.html`＋`src/games/*.js` を編集 → `python3 tools/build.py`（アイコンは `python3 tools/icons.py`）
- 公開日時より前の確認は `?preview=1`（戻すときは `?preview=0`）
- 物理演算：matter-js（MIT License）を `lib/` に同梱
