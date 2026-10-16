#!/usr/bin/env python3
"""questions_app.json + data/hints/*.json → app/questions.js（lpic-reflex と同じスキーマ）。

- answerHints: 正解肢の中の正誤箇所（黄マーカー）。正解肢ごとに部分文字列の配列。
- answerKeys : 問題文の「何を選ぶか」を決める語（適当でないもの 等）。問題文から自動抽出。
- mnemonic   : 正しくは何か（解答後の 💡 表示）。
ヒントが正解肢の部分文字列でない場合はエラーで止める。
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
Q = json.loads((ROOT / "data/parsed/questions_app.json").read_text(encoding="utf-8"))
REPORT = json.loads((ROOT / "data/parsed/dedupe_report.json").read_text(encoding="utf-8"))
HINTS = {}
for p in sorted((ROOT / "data/hints").glob("*.json")):
    HINTS.update(json.loads(p.read_text(encoding="utf-8")))

TERM = {"zenki": "前期", "kouki": "後期"}
def session_label(sid):  # "R04_kouki" -> "R4後期"
    era, term = sid.split("_")
    return f"{era[0]}{int(era[1:])}{TERM[term][0]}"

ASK = re.compile(r"(適当でないもの|適当なもの|誤っているもの|正しいもの|関係のないもの|該当しないもの|定められていないもの|必要のないもの|必要なもの)")
ASK_FALLBACK = re.compile(r"([^、。」\n]+)はどれか")  # 例: 「規定されていないもの」「選任が必要でない作業」
def ask_keys(stem):
    m = ASK.search(stem)
    if m:
        return [m.group(1)]
    m = ASK_FALLBACK.search(stem)
    if not m:
        return []
    clause = m.group(1).strip()
    # 長い節は、末尾16文字以内に収まる最初の「の・が・を」の直後から（語の途中で切らない）
    if len(clause) > 16:
        for i, ch in enumerate(clause):
            if ch in "のがを" and 4 <= len(clause) - i - 1 <= 16:
                return [clause[i + 1:]]
    return [clause]

CTRL = re.compile(r"[\x00-\x09\x0b-\x1f]")  # PDF抽出で混入した制御文字（改行以外）
for q in Q:
    q["stem"] = CTRL.sub("", q["stem"])
    q["choices"] = [CTRL.sub("", c) for c in q["choices"]]

out, errors = [], []
for q in Q:
    labels = [str(i) for i in range(1, len(q["choices"]) + 1)]
    answers = [str(a) for a in q["answers"]]
    texts = [q["choices"][a - 1] for a in q["answers"]]
    h = HINTS.get(q["id"], {})
    hints = h.get("answerHints", [])
    for t, hs in zip(texts, hints):
        for s in hs:
            if s not in t:
                errors.append(f"{q['id']}: '{s}' が正解肢にない")
    out.append({
        "id": q["id"],
        "source": " / ".join(session_label(s.rsplit("_", 1)[0]) + f" No.{int(s.rsplit('_', 1)[1])}" for s in q["sessions"]),
        "category": q["category"],
        "type": "multi" if q["multi_answer"] else "single",
        "question": q["stem"],
        "choices": [{"label": l, "text": c} for l, c in zip(labels, q["choices"])],
        "answer": answers,
        "selectCount": len(answers),
        "answerKeys": ask_keys(q["stem"]),
        "answerTexts": texts,
        "answerHints": hints,
        "mnemonic": h.get("mnemonic", ""),
        "block": q["block"],
        "group": q["group"],
    })

if errors:
    sys.exit("\n".join(errors))

blocks = [{"no": b["block"], "group": b["group"], "size": b["size"],
           "span": f"{session_label(b['sessions'][0])}〜{session_label(b['sessions'][-1])}"} for b in REPORT["blocks"]]
js = "window.QUESTIONS = " + json.dumps(out, ensure_ascii=False) + ";\nwindow.BLOCKS = " + json.dumps(blocks, ensure_ascii=False) + ";\n"
(ROOT / "app/questions.js").write_text("﻿" + js, encoding="utf-8")  # BOM付き（lpic-reflex と同じ文字化け対策）
print(f"questions {len(out)}, with hints {sum(1 for o in out if o['answerHints'])}, blocks {len(blocks)}")
