#!/usr/bin/env python3
"""HTML由来（14回）とPDF由来（4回）の問題JSONを統合して問題バンクを作る。"""
import csv, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
HTML_DIR = ROOT / "data/parsed/questions"; PDF_DIR = ROOT / "data/parsed/questions_pdf"
ORDER = ["H28_kouki","H29_kouki","H30_zenki","H30_kouki","R01_zenki","R01_kouki","R02_kouki","R03_zenki","R03_kouki",
         "R04_zenki","R04_kouki","R05_zenki","R05_kouki","R06_zenki","R06_kouki","R07_zenki","R07_kouki","R08_zenki"]
allq = []
for s in ORDER:
    p = HTML_DIR / f"{s}.json"; src = "html"
    if not p.exists(): p = PDF_DIR / f"{s}.json"; src = "pdf"
    for q in json.loads(p.read_text(encoding="utf-8")):
        q["text_source"] = src; allq.append(q)
assert len(allq) == 936 and all(len(q["choices"]) == 4 and q["stem"] for q in allq)
(ROOT / "data/parsed/questions_all.json").write_text(json.dumps(allq, ensure_ascii=False, indent=1), encoding="utf-8")
with open(ROOT / "data/parsed/questions_all.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow(["id","era","term","number","category","required","answers","stem","choice1","choice2","choice3","choice4","has_figure","text_source"])
    for q in allq:
        w.writerow([q["id"], q["era"], q["term"], q["number"], q["category"], q["required"], "・".join(map(str, q["answers"])), q["stem"], *q["choices"], q["has_figure"], q["text_source"]])
print("questions:", len(allq), "| by source:", {k: sum(1 for q in allq if q["text_source"]==k) for k in ("html","pdf")}, "| figures:", sum(1 for q in allq if q["has_figure"]))
