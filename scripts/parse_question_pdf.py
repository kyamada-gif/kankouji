#!/usr/bin/env python3
"""問題PDF → 問題JSON。extract_pdf_lines で復元した行を問題・選択肢に分割し、公式正答と結合する。

文字化けフォントのグリフは data/parsed/glyph_maps.json（目視で作成）で数字等に戻す。
"""
import json, re, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from extract_pdf_lines import extract

QDIR = ROOT / "data" / "raw" / "questions"
ANS = ROOT / "data" / "parsed" / "answers.json"
GLYPH = ROOT / "data" / "parsed" / "glyph_maps.json"
OUTDIR = ROOT / "data" / "parsed" / "questions_pdf"

CATEGORIES = {
    "old": [(1, 6, "一般基礎", True, "6問必須"), (7, 23, "空調・衛生", False, "17問中9問選択"),
            (24, 28, "設備（機器・材料・設計図書）", True, "5問必須"), (29, 42, "施工管理法", False, "14問中12問選択"),
            (43, 52, "法規", False, "10問中8問選択")],
    "new": [(1, 6, "一般基礎", True, "6問必須"), (7, 23, "空調・衛生", False, "17問中9問選択"),
            (24, 28, "設備（機器・材料・設計図書）", True, "5問必須"), (29, 38, "施工管理法", False, "10問中8問選択"),
            (39, 48, "法規", False, "10問中8問選択"), (49, 52, "施工管理法（基礎的な能力）", True, "4問必須・正答2つ")],
}
SYMBOL_MAP = {"唖": "．", "穐": "＝", "姶": "×", "挨": "-", "愛": "+", "\ue054": ""}

def category_of(n, fmt):
    for lo, hi, name, req, note in CATEGORIES[fmt]:
        if lo <= n <= hi: return name, req, note
    return "不明", False, ""

Q_START = re.compile(r"^【\s*No\.?\s*(\d{1,2})\s*】\s*(.*)$")
CHOICE = re.compile(r"^(?:〓\s*)?[\(（]?\s*([1-4])[\)）]?(?:\s+|　)(.*)$")
SKIP = re.compile(r"^(※|問題番号|当該問題番号|〓?\s*問について|1\s*問について|.*ぬりつぶし)")

def norm(s):
    s = unicodedata.normalize("NFKC", s)
    for k, v in SYMBOL_MAP.items(): s = s.replace(k, v)
    s = re.sub(r"\s+", " ", s)
    return s.strip()

def parse_pdf(session, glyph_map):
    lines, gar = extract(QDIR / f"{session}_mondai.pdf")
    # 〓 をグリフ対応表で置換（行内の出現順に対応）
    gi = 0
    fixed = []
    for l in lines:
        t = l["text"]
        if "〓" in t:
            out = ""
            for ch in t:
                if ch == "〓":
                    g = gar[gi]["glyph"]; gi += 1
                    out += glyph_map.get(g, "〓")
                else:
                    out += ch
            t = out
        fixed.append(dict(l, text=t))
    assert gi == len(gar), (gi, len(gar))
    qs, cur, cno = [], None, 0
    for l in fixed:
        if l["page"] == 1: continue
        t = l["text"].strip()
        m = Q_START.match(t)
        if m and (cur is None or int(m.group(1)) == cur["number"] + 1):
            if cur: qs.append(cur)
            cur = {"number": int(m.group(1)), "stem": [m.group(2)], "choices": {}, "pages": {l["page"]}}; cno = 0
            continue
        if cur is None or SKIP.match(t): continue
        c = CHOICE.match(t)
        if c and int(c.group(1)) == cno + 1 and l["x"] < 100:
            cno = int(c.group(1)); cur["choices"][cno] = [c.group(2)]; cur["pages"].add(l["page"]); continue
        if cno: cur["choices"][cno].append(t)
        else: cur["stem"].append(t)
        cur["pages"].add(l["page"])
    if cur: qs.append(cur)
    for q in qs:
        q["stem"] = norm(" ".join(q["stem"]))
        q["choices"] = [norm(" ".join(q["choices"].get(i, []))) for i in (1, 2, 3, 4)]
        q["pages"] = sorted(q["pages"])
    return qs

def main():
    answers = json.loads(ANS.read_text(encoding="utf-8"))
    glyph_maps = json.loads(GLYPH.read_text(encoding="utf-8")) if GLYPH.exists() else {}
    sessions = sys.argv[1:] or list(answers)
    OUTDIR.mkdir(parents=True, exist_ok=True)
    rc = 0
    for s in sessions:
        meta = answers[s]; fmt = meta["format"]
        qs = parse_pdf(s, glyph_maps.get(s, {}))
        out, probs = [], []
        for q in qs:
            n = q["number"]
            if not all(q["choices"]): probs.append(f"No.{n}:選択肢欠")
            if "〓" in q["stem"] + "".join(q["choices"]): probs.append(f"No.{n}:未対応グリフ")
            cat, req, note = category_of(n, fmt)
            out.append({"id": f"{s}_{n:02d}", "session": s, "era": meta["era"], "year": meta["year"],
                        "term": meta["session"], "exam": meta["exam"], "format": fmt, "number": n,
                        "category": cat, "required": req, "selection_note": note,
                        "stem": q["stem"], "choices": q["choices"], "answers": meta["answers"].get(str(n)),
                        "multi_answer": len(meta["answers"].get(str(n), [])) > 1,
                        "has_figure": "図" in q["stem"], "figures": [], "explanation": None,
                        "source": {"pdf": f"data/raw/questions/{s}_mondai.pdf", "pages": q["pages"]}})
        nums = [q["number"] for q in out]
        ok = nums == list(range(1, 53)) and not probs
        print(f"{s}: {len(out)}問 {'OK' if ok else 'NG'} {'; '.join(probs[:8])}")
        rc |= 0 if ok else 1
        (OUTDIR / f"{s}.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    return rc

if __name__ == "__main__":
    sys.exit(main())
