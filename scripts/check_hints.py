#!/usr/bin/env python3
"""data/hints/blockNN.json の検査（ブロック番号を引数に）。

- そのブロックの全問にヒントがあるか
- answerHints の各文字列が正解肢の部分文字列か（制御文字は除去して比較）
- 正解肢の数と answerHints の要素数が一致するか
- mnemonic が空でないか
使い方: python3 scripts/check_hints.py 2 3
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CTRL = re.compile(r"[\x00-\x09\x0b-\x1f]")
Q = json.loads((ROOT / "data/parsed/questions_app.json").read_text(encoding="utf-8"))

ok = True
for b in map(int, sys.argv[1:]):
    path = ROOT / f"data/hints/block{b:02d}.json"
    if not path.exists():
        print(f"block{b:02d}: ファイルがない"); ok = False; continue
    hints = json.loads(path.read_text(encoding="utf-8"))
    qs = [q for q in Q if q["block"] == b]
    errs = []
    for q in qs:
        h = hints.get(q["id"])
        if not h:
            errs.append(f"{q['id']}: ヒントがない"); continue
        texts = [CTRL.sub("", q["choices"][a - 1]) for a in q["answers"]]
        ah = h.get("answerHints", [])
        if len(ah) != len(texts):
            errs.append(f"{q['id']}: answerHints は正解肢ごと（{len(texts)}個）の配列にする")
        for t, hs in zip(texts, ah):
            for s in hs:
                if not s or s not in t:
                    errs.append(f"{q['id']}: '{s}' が正解肢「{t}」の部分文字列でない")
        if not h.get("mnemonic"):
            errs.append(f"{q['id']}: mnemonic が空")
    extra = set(hints) - {q["id"] for q in qs}
    if extra:
        errs.append(f"このブロックにない id: {sorted(extra)}")
    print(f"block{b:02d}: {len(qs)}問 / エラー {len(errs)}")
    for e in errs:
        print("  " + e)
    ok = ok and not errs
sys.exit(0 if ok else 1)
