#!/usr/bin/env python3
"""kankouji-sekou.com の年度別ページ（HTML）から問題文・選択肢・解答・図URLを抽出する。

入力: data/raw/questions_html/<SESSION>.html
出力: data/parsed/questions/<SESSION>.json（公式正答 answers.json と突き合わせて検証）
"""
import html as H, json, re, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "raw" / "questions_html"
OUT = ROOT / "data" / "parsed" / "questions"
ANS = json.loads((ROOT / "data" / "parsed" / "answers.json").read_text(encoding="utf-8"))
sys.path.insert(0, str(ROOT / "scripts"))
from parse_question_pdf import CATEGORIES, category_of  # 分野マップを共用

def clean(fragment: str) -> str:
    t = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", "", fragment, flags=re.S)
    t = re.sub(r"<img[^>]*>", "", t)
    t = re.sub(r"<br\s*/?>|</p>|</li>|</tr>|</h\d>", "\n", t)
    t = re.sub(r"</t[dh]>", "\t", t)
    t = re.sub(r"<[^>]+>", "", t)
    t = H.unescape(t)
    t = unicodedata.normalize("NFKC", t)
    t = re.sub(r"[ \t　]+", " ", t)
    t = re.sub(r"\s*\n\s*", "\n", t).strip()
    return t

def parse(session: str) -> list[dict]:
    s = (SRC / f"{session}.html").read_text(encoding="utf-8", errors="replace")
    body = re.search(r"<article.*?</article>", s, re.S)
    body = body.group(0) if body else s
    parts = re.split(r"(?=<p>【No,\d+】)", body)
    qs = []
    for seg in parts[1:]:
        m = re.match(r"<p>【No,(\d+)】", seg)
        n = int(m.group(1))
        seg = re.split(r"<h3 |<h2 ", seg)[0]  # 次の節見出しで切る
        ol = re.search(r"<ol>(.*?)</ol>", seg, re.S)
        before = seg[: ol.start()] if ol else seg
        choices = [clean(li) for li in re.findall(r"<li>(.*?)</li>", ol.group(1), re.S)] if ol else []
        stem = clean(re.sub(r"^<p>【No,\d+】", "", before))
        imgs = re.findall(r'data-lazy-src="([^"]+)"', before)
        if not imgs:
            imgs = [u for u in re.findall(r'<img[^>]+src="(https?://[^"]+)"', before)]
        imgs = list(dict.fromkeys(imgs))
        am = re.search(r"解答（([^）]*)）", seg)
        site_ans = [int(x) for x in re.findall(r"[1-4]", am.group(1))] if am else []
        qs.append({"number": n, "stem": stem, "choices": choices, "site_answers": site_ans, "figures": imgs})
    return qs

def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    rc = 0
    sessions = sys.argv[1:] or sorted(p.stem for p in SRC.glob("*.html") if p.stat().st_size > 60000)
    for s in sessions:
        meta = ANS[s]; fmt = meta["format"]
        qs = parse(s)
        probs = []
        out = []
        for q in qs:
            n = q["number"]
            official = meta["answers"].get(str(n))
            if len(q["choices"]) != 4: probs.append(f"No.{n}: 選択肢{len(q['choices'])}個")
            if not q["stem"]: probs.append(f"No.{n}: 問題文なし")
            if q["site_answers"] and not set(q["site_answers"]) <= set(official or []):
                probs.append(f"No.{n}: サイト解答{q['site_answers']} が公式{official}と矛盾")
            cat, req, note = category_of(n, fmt)
            out.append({
                "id": f"{s}_{n:02d}", "session": s, "era": meta["era"], "year": meta["year"],
                "term": meta["session"], "exam": meta["exam"], "format": fmt,
                "number": n, "category": cat, "required": req, "selection_note": note,
                "stem": q["stem"], "choices": q["choices"], "answers": official,
                "multi_answer": len(official or []) > 1,
                "has_figure": bool(q["figures"]) or ("図" in q["stem"]), "figures": q["figures"],
                "explanation": None,
                "source": {"html": f"data/raw/questions_html/{s}.html", "pdf": f"data/raw/questions/{s}_mondai.pdf"},
            })
        nums = [q["number"] for q in out]
        ok = nums == list(range(1, 53)) and not probs
        print(f"{s}: {len(out)}問 {'OK' if ok else 'NG'} " + "; ".join(probs))
        rc |= 0 if ok else 1
        (OUT / f"{s}.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    return rc

if __name__ == "__main__":
    sys.exit(main())
