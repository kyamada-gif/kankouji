#!/usr/bin/env python3
"""正答肢PDF（JCTC公式「問題・正答肢」ページの複製）から正答を抽出し JSON にする。

入力: data/raw/answers_lmate/<SESSION>_seitou.pdf  (SESSION 例: R04_zenki)
出力: data/parsed/answers.json

レイアウトは年度により異なるため、pdftotext -layout の文字列上の列位置で
「番号」行の各問題番号と「解答」行の各数字を対応付ける。
令和3年度以降の No.49〜52（施工管理法・基礎的な能力）は正答が2つある（四肢択二）。
"""
import json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "answers_lmate"
OUT = ROOT / "data" / "parsed" / "answers.json"
MANUAL = ROOT / "data" / "parsed" / "answers_manual.json"  # 画像PDFなど手入力分

SESSION_META = {
    # key: (年度表記, 西暦, 回, 試験名, 形式)
    "H28_kouki": ("平成28年度", 2016, "後期", "学科試験", "old"),
    "H29_kouki": ("平成29年度", 2017, "後期", "学科試験", "old"),
    "H30_zenki": ("平成30年度", 2018, "前期", "学科試験", "old"),
    "H30_kouki": ("平成30年度", 2018, "後期", "学科試験", "old"),
    "R01_zenki": ("令和元年度", 2019, "前期", "学科試験", "old"),
    "R01_kouki": ("令和元年度", 2019, "後期", "学科試験", "old"),
    "R02_kouki": ("令和2年度", 2020, "後期", "学科試験", "old"),
    "R03_zenki": ("令和3年度", 2021, "前期", "第一次検定", "new"),
    "R03_kouki": ("令和3年度", 2021, "後期", "第一次検定", "new"),
    "R04_zenki": ("令和4年度", 2022, "前期", "第一次検定", "new"),
    "R04_kouki": ("令和4年度", 2022, "後期", "第一次検定", "new"),
    "R05_zenki": ("令和5年度", 2023, "前期", "第一次検定", "new"),
    "R05_kouki": ("令和5年度", 2023, "後期", "第一次検定", "new"),
    "R06_zenki": ("令和6年度", 2024, "前期", "第一次検定", "new"),
    "R06_kouki": ("令和6年度", 2024, "後期", "第一次検定", "new"),
    "R07_zenki": ("令和7年度", 2025, "前期", "第一次検定", "new"),
    "R07_kouki": ("令和7年度", 2025, "後期", "第一次検定", "new"),
    "R08_zenki": ("令和8年度", 2026, "前期", "第一次検定", "new"),
}

HEADER_RE = re.compile(r"(?:問題)?番号\s+\d")
ANS_ROW_RE = re.compile(r"^\s*(?:解答)?\s*(?:\d\s*)+$")


def pdf_text(pdf: Path) -> str:
    return subprocess.run(["pdftotext", "-layout", "-f", "1", "-l", "1", str(pdf), "-"],
                          check=True, capture_output=True, text=True).stdout


def ints(line: str) -> list[int]:
    return [int(m.group()) for m in re.finditer(r"\d+", line)]


def parse(text: str) -> dict[int, list[int]]:
    """「番号」行ごとにブロックを切り、続く数字のみの行を解答として対応付ける。

    ブロック内の行パターン:
      - [n個]                      … 1問1答（旧形式、または新形式の前半ブロック）
      - [4個] [n-4個] [4個]        … 新形式最終ブロック: 49〜52の1つ目、46〜48、49〜52の2つ目
      - [n個] [4個]                … 新形式最終ブロック: 全問の1つ目、49〜52の2つ目
    """
    answers: dict[int, list[int]] = {}
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        m = HEADER_RE.search(lines[i])
        if not m:
            i += 1
            continue
        qnums = ints(lines[i][m.start():])
        n = len(qnums)
        i += 1
        rows: list[list[int]] = []
        while i < len(lines) and not HEADER_RE.search(lines[i]):
            s = lines[i].strip()
            if s and ANS_ROW_RE.match(lines[i]):
                rows.append(ints(lines[i]))
            elif s and s != "解答":
                break  # 注意書き等が出たらブロック終了
            i += 1
        if not rows:
            continue
        main = [r for r in rows if len(r) in (n, n - 4)]
        extra = [r for r in rows if len(r) == 4 and r not in main]
        if len(main) != 1 or (extra and 52 not in qnums):
            raise ValueError(f"unexpected block layout for {qnums}: {rows}")
        seq = main[0]
        for q, a in zip(qnums, seq):
            answers.setdefault(q, []).append(a)
        if extra:
            for r in extra:
                for q, a in zip(qnums[-4:], r):
                    answers.setdefault(q, []).append(a)
    return {q: sorted(v) if len(v) > 1 else v for q, v in answers.items()}


def validate(key: str, ans: dict[int, list[int]]) -> list[str]:
    fmt = SESSION_META[key][4]
    errs = []
    missing = [q for q in range(1, 53) if q not in ans]
    if missing:
        errs.append(f"missing {missing}")
    for q, a in sorted(ans.items()):
        exp = 2 if (fmt == "new" and 49 <= q <= 52) else 1
        if len(a) != exp or any(not 1 <= x <= 4 for x in a):
            errs.append(f"No.{q}: {a} (expected {exp} answer(s))")
    return errs


def main() -> int:
    result = {}
    manual = json.loads(MANUAL.read_text()) if MANUAL.exists() else {}
    ok = True
    for key, (era, year, session, exam, fmt) in SESSION_META.items():
        pdf = RAW / f"{key}_seitou.pdf"
        src = str(pdf.relative_to(ROOT))
        if key in manual:
            ans = {int(k): v for k, v in manual[key]["answers"].items()}
            src = manual[key].get("source", src)
        elif pdf.exists():
            ans = parse(pdf_text(pdf))
        else:
            print(f"[WARN] {key}: PDF not found", file=sys.stderr)
            continue
        errs = validate(key, ans)
        status = "OK" if not errs else "NG"
        if errs:
            ok = False
        print(f"{key}: {status} {len(ans)}問 " + ("; ".join(errs) if errs else ""))
        result[key] = {
            "era": era, "year": year, "session": session, "exam": exam, "format": fmt,
            "source": src,
            "answers": {str(q): ans[q] for q in sorted(ans)},
        }
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"written {OUT} ({len(result)} sessions)")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
