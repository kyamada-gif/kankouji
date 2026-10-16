#!/usr/bin/env python3
"""分析結果からダッシュボード用の軽量JSONを作る（連結成分＝問題ファミリーの集計を含む）。"""
import json, csv, collections
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]; A = ROOT / "data/analysis"
S = json.loads((A / "summary.json").read_text(encoding="utf-8"))
T = json.loads((A / "topics.json").read_text(encoding="utf-8"))
E = json.loads((A / "questions_enriched.json").read_text(encoding="utf-8"))
P = list(csv.DictReader(open(A / "pairs.csv", encoding="utf-8")))
ORDER = [r["session"] for r in S["per_session"]]
LABEL = {r["session"]: f"{r['era'].replace('年度','')}{'前' if r['term']=='前期' else '後'}" for r in S["per_session"]}
# 問題ファミリー（同一/ほぼ同一で連結）
parent = {q["id"]: q["id"] for q in E}
def find(x):
    while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]
    return x
for p in P:
    if p["kind"] in ("同一", "ほぼ同一"): parent[find(p["a"])] = find(p["b"])
fam = collections.defaultdict(list)
for q in E: fam[find(q["id"])].append(q["id"])
families = sorted([v for v in fam.values() if len(v) >= 2], key=len, reverse=True)
QI = {q["id"]: q for q in E}
fam_rows = []
for f in families:
    sess = sorted({QI[i]["session"] for i in f}, key=ORDER.index)
    rep = QI[sorted(f, key=lambda i: ORDER.index(QI[i]["session"]))[0]]
    fam_rows.append({"size": len(f), "sessions": [LABEL[s] for s in sess], "category": rep["category"], "stem": rep["stem"][:80], "ids": f})
# 同一ペアを持つ問題数
same_q = {x for p in P if p["kind"] == "同一" for x in (p["a"], p["b"])}
near_q = {x for p in P if p["kind"] in ("同一", "ほぼ同一") for x in (p["a"], p["b"])}
# 直近4回の既出率
recent = S["per_session"][-4:]
rec_rate = sum(r["同一"] + r["ほぼ同一"] + r["類似"] for r in recent) / (52 * len(recent))
rec_near = sum(r["同一"] + r["ほぼ同一"] for r in recent) / (52 * len(recent))
# ユニーク度（全18回のどの問題とも関係がない＝完全ユニーク）
CATS = ['一般基礎','空調・衛生','設備（機器・材料・設計図書）','施工管理法','法規','施工管理法（基礎的な能力）']
best_any = collections.Counter((q["any"] or {}).get("kind", "新規") for q in E)
uniq = [q for q in E if q["any"] is None]
uniq_by_cat = {c: {"total": sum(1 for q in E if q["category"] == c), "unique": sum(1 for q in uniq if q["category"] == c),
                   "no_reuse": sum(1 for q in E if q["category"] == c and (q["any"] is None or q["any"]["kind"] == "同一論点"))} for c in CATS}
uniq_by_sess = {s: sum(1 for q in uniq if q["session"] == s) for s in ORDER}
unique_list = [{"id": q["id"], "s": q["session"], "n": q["number"], "c": q["category"], "stem": q["stem"], "fig": q["has_figure"]} for q in uniq]
stats = {
    "n_questions": S["n_questions"], "n_sessions": 18, "pairs": S["pairs_by_kind"],
    "q_same": len(same_q), "q_near": len(near_q), "families": len(families), "family_questions": sum(len(f) for f in families),
    "recent_reuse_rate": round(rec_rate, 3), "recent_near_rate": round(rec_near, 3),
    "choice_total": S["n_choices"], "choice_reused": S["choices_with_reuse"], "choice_prev": S["choices_prev_reused"],
    "answer_distribution": S["answer_distribution"], "n_clusters": S["n_clusters"], "noise": S["noise"],
    "best_any": dict(best_any), "unique": len(uniq), "no_reuse": best_any["新規"] + best_any["同一論点"],
    "unique_by_cat": uniq_by_cat, "unique_by_sess": uniq_by_sess,
}
pairs_out = [{"a": p["a"], "b": p["b"], "kind": p["kind"], "fr": float(p["full_ratio"]), "cm": int(p["choices_matched"]), "tf": float(p["tfidf_cos"])}
             for p in P if p["kind"] in ("同一", "ほぼ同一", "類似")]
qs_out = [{"id": q["id"], "s": q["session"], "n": q["number"], "c": q["category"], "cl": q["cluster"], "x": round(q["x"], 2), "y": round(q["y"], 2),
           "stem": q["stem"], "ch": q["choices"], "ans": q["answers"], "prev": (q["prev"] or {}).get("kind", "新規"), "prev_id": (q["prev"] or {}).get("other"),
           "cp": q["choice_prev"], "fig": q["has_figure"]} for q in E]
topics_out = [{"id": t["cluster"], "label": t["label"], "size": t["size"], "sessions": t["sessions"], "category": t["category"],
               "per": [t["per_session"][s] for s in ORDER], "example": t["example"]} for t in T]
data = {"order": ORDER, "labels": [LABEL[s] for s in ORDER], "per_session": S["per_session"], "category_by_session": S["category_by_session"],
        "stats": stats, "topics": topics_out, "families": fam_rows[:60], "pairs": pairs_out, "questions": qs_out, "unique_list": unique_list}
(A / "dashboard_data.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(json.dumps(stats, ensure_ascii=False, indent=1)); print("families top:", [(f["size"], f["stem"][:30]) for f in fam_rows[:8]])
print("size:", (A / "dashboard_data.json").stat().st_size)
