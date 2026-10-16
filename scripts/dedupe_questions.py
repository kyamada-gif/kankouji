#!/usr/bin/env python3
"""アプリ収録用の問題セットを作る（完全重複の統合・図問題の除外・ブロック分け）。

- 完全重複: 正規化した問題文・選択肢（順不同）・正答の選択肢文がすべて一致するもの。
  正規化では空白と記号（括弧・句読点・長音・波ダッシュ等）の差だけを無視する。
  語句の差（「請負」と「受注」、「下図に示す」の有無など）は別の問題として残す。
  選択肢が同じでも正答が異なる問題は「別の問い方」なので残す。
- 代表は最新回の問題。出題された全回を `sessions` に持たせる。
- 図・表を使う問題（has_figure）は除外。
- ブロック: 3回分ずつ6グループにまとめ、各グループを約50問ずつに分割。
  分野の比率が各ブロックで揃うよう、分野ごとに順に配る（層化）。統合した問題は代表（最新回）のグループに入る。
出力: data/parsed/questions_app.json, data/parsed/dedupe_report.json
"""
import json, re, unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
Q = json.loads((ROOT / "data/parsed/questions_all.json").read_text(encoding="utf-8"))
ORDER = ["H28_kouki","H29_kouki","H30_zenki","H30_kouki","R01_zenki","R01_kouki","R02_kouki","R03_zenki","R03_kouki",
         "R04_zenki","R04_kouki","R05_zenki","R05_kouki","R06_zenki","R06_kouki","R07_zenki","R07_kouki","R08_zenki"]
SIDX = {s: i for i, s in enumerate(ORDER)}

# 暗記に関係しない表記差（空白・括弧・句読点・長音・ダッシュ類）だけを吸収する。定型文は残す（1解答/2解答の区別）
NOTATION = re.compile(r"[\s「」『』()（）〔〕\[\]【】<>〈〉、。,.，．・:：;；ー―‐\-~〜～]")
def norm(s: str) -> str:
    return NOTATION.sub("", unicodedata.normalize("NFKC", s))

def key(q):
    choices = [norm(c) for c in q["choices"]]
    answers = sorted(choices[a - 1] for a in q["answers"])
    return (norm(q["stem"]), tuple(sorted(choices)), tuple(answers))

groups = defaultdict(list)
for q in Q:
    groups[key(q)].append(q)

kept, merged, figures = [], [], []
for g in groups.values():
    g.sort(key=lambda q: SIDX[q["session"]])
    rep = dict(g[-1])
    rep["sessions"] = [q["id"] for q in g]
    if len(g) > 1:
        merged.append({"kept": rep["id"], "dropped": [q["id"] for q in g[:-1]]})
    if rep["has_figure"]:
        figures.append(rep["id"])
        continue
    kept.append(rep)

kept.sort(key=lambda q: (SIDX[q["session"]], q["number"]))

# ── ブロック分け ──
CATS = ["一般基礎", "空調・衛生", "設備（機器・材料・設計図書）", "施工管理法", "施工管理法（基礎的な能力）", "法規"]  # 試験の出題順
GROUP_SPAN, BLOCK_TARGET = 3, 50
blocks = []
for g in range(len(ORDER) // GROUP_SPAN):
    sess = ORDER[g * GROUP_SPAN:(g + 1) * GROUP_SPAN]
    qs = [q for q in kept if q["session"] in sess]
    nb = max(1, round(len(qs) / BLOCK_TARGET))
    bins = [[] for _ in range(nb)]
    i = 0  # 分野をまたいで配り先を回し続け、ブロック間の問題数差を1以内にする
    for c in CATS:
        for q in [q for q in qs if q["category"] == c]:
            bins[i % nb].append(q); i += 1
    for b, items in enumerate(bins):
        no = len(blocks) + 1
        for q in items:
            q["group"], q["block"] = g + 1, no
        blocks.append({"block": no, "group": g + 1, "sessions": sess, "size": len(items),
                       "categories": {c: sum(q["category"] == c for q in items) for c in CATS}})
# 選択肢が図だけ／数式が崩れていて解けない問題。ブロック分けを変えないよう、分けた後で抜く
BROKEN = {"R03_kouki_23", "R04_kouki_23", "R06_kouki_02"}
kept = [q for q in kept if q["id"] not in BROKEN]
for b in blocks:
    b["size"] = sum(q["block"] == b["block"] for q in kept)
kept.sort(key=lambda q: (q["block"], CATS.index(q["category"]), SIDX[q["session"]], q["number"]))
(ROOT / "data/parsed/questions_app.json").write_text(json.dumps(kept, ensure_ascii=False, indent=1), encoding="utf-8")
(ROOT / "data/parsed/dedupe_report.json").write_text(json.dumps(
    {"total": len(Q), "groups": len(groups), "merged_groups": merged, "figure_excluded": figures, "broken_excluded": sorted(BROKEN), "kept": len(kept), "blocks": blocks},
    ensure_ascii=False, indent=1), encoding="utf-8")
print(f"total {len(Q)} -> unique {len(groups)} (merged groups {len(merged)}, dropped {len(Q) - len(groups)})")
print(f"figure excluded {len(figures)} -> kept {len(kept)}")
for b in blocks:
    print(b["block"], b["group"], b["size"], list(b["categories"].values()))
