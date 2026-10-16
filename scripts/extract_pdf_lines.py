#!/usr/bin/env python3
"""問題PDF（JCTC公式/複製）から、ふりがな・装飾グリフを除いた行テキストを復元する（PyMuPDF）。

- ふりがな: サイズ6pt未満のかなのみスパンを除去
- 文字化けフォント（フォント名末尾 '.' のサイズ9.9）: 選択肢番号の直前の飾りグリフは除去、
  それ以外は '〓' に置換して位置を記録（後で目視で数字に対応付ける）
出力: 各行 (page, y, x, text) と、文字化けグリフの一覧
"""
import re, sys, json
from pathlib import Path
import pymupdf

def extract(pdf: Path):
    doc = pymupdf.open(pdf)
    lines_out, garbled = [], []
    for pno, page in enumerate(doc):
        frags = []
        for b in page.get_text("dict")["blocks"]:
            for l in b.get("lines", []):
                for s in l["spans"]:
                    t = s["text"]
                    if not t.strip():
                        continue
                    x0, y0, x1, y1 = s["bbox"]
                    small = s["size"] < 6
                    kana_only = all(("぀" <= c <= "ヿ") or c in " 　" for c in t)
                    if small and kana_only:
                        continue  # ふりがな
                    if small:
                        # 下付き添字（P1, A2 など）は本文に残す
                        frags.append((round(y1 - 2), x0, x1, t, False)); continue
                    gar = s["font"].endswith(".") and s["size"] > 7 and not kana_only
                    frags.append((round((y0 + y1) / 2), x0, x1, t, gar))
        # y でグルーピング
        frags.sort(key=lambda f: (f[0], f[1]))
        groups = []
        for f in frags:
            if groups and abs(groups[-1][0] - f[0]) <= 3:
                groups[-1][1].append(f)
            else:
                groups.append([f[0], [f]])
        for y, fs in groups:
            fs.sort(key=lambda f: f[1])
            text, prev_x1, prev_gar = "", None, None
            for (yy, x0, x1, t, gar) in fs:
                if prev_x1 is not None and x0 - prev_x1 > 6:
                    text += " "
                if gar:
                    # 選択肢番号の飾り（単独1文字で直後に数字）→ 除去
                    if len(t.strip()) == 1:
                        garbled.append({"page": pno + 1, "y": y, "x": x0, "glyph": t, "bbox": [x0, yy, x1, yy]})
                        text += "〓"
                    else:
                        for ch in t:
                            garbled.append({"page": pno + 1, "y": y, "x": x0, "glyph": ch, "bbox": [x0, yy, x1, yy]})
                        text += "〓" * len(t)
                else:
                    text += t
                prev_x1 = x1
            text = text.strip()
            if not text:
                continue
            if re.fullmatch(r"[―\-\s]*\d+[―\-\s]*", text) or ".smd" in text or "再生紙" in text:
                continue  # ページ番号・フッタ
            lines_out.append({"page": pno + 1, "y": y, "x": fs[0][1], "text": text})
    return lines_out, garbled

if __name__ == "__main__":
    pdf = Path(sys.argv[1])
    lines, gar = extract(pdf)
    for l in lines[:int(sys.argv[2]) if len(sys.argv) > 2 else 80]:
        print(l["page"], l["y"], round(l["x"]), l["text"])
    print("garbled:", len(gar))
