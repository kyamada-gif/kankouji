#!/usr/bin/env python3
"""JCTC（全国建設研修センター）公式の 2級管工事 第一次検定（学科）問題PDFを取得する。

※ 本セッションの実行環境では www.jctc.jp への通信がネットワークポリシーで遮断されているため未実行。
   許可ドメインに www.jctc.jp（必要ならミラーも）を追加した環境で実行する。

使い方:
  python3 scripts/fetch_official_questions.py            # 既知URL + 推定URL + 索引ページ探索
  python3 scripts/fetch_official_questions.py --no-index # 索引ページを探索しない

出力: data/raw/questions/<SESSION>_mondai.pdf と data/raw/questions/fetch_report.json
"""
import argparse, json, re, sys, time, urllib.request, urllib.error
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "raw" / "questions"
UA = {"User-Agent": "Mozilla/5.0 (kankouji-study-app data collector)"}

# 正答肢PDFに埋め込まれていたリンク（確定）と、公開日の命名規則からの推定URL（要確認）。
KNOWN = {
    "H30_zenki": ["https://www.jctc.jp/kentei/180604k_isey83/kan01.pdf"],
    "H30_kouki": ["https://www.jctc.jp/kentei/181119k_fw44eg/kan01.pdf"],
    "R01_zenki": ["https://www.jctc.jp/kentei/190603k_5guddf/kan01.pdf"],
    "R01_kouki": ["https://www.jctc.jp/kentei/191118k_h983oo/kan01.pdf"],
    "R02_kouki": ["https://www.jctc.jp/kentei/201116k_niergy/kan01.pdf"],
    "R03_zenki": ["https://www.jctc.jp/kentei/210607k_a798k5/kan01.pdf"],
    "R03_kouki": ["https://www.jctc.jp/kentei/211122k_ip89as/kan01.pdf"],
    "R04_zenki": ["https://www.jctc.jp/kentei/220606k_4giohi/kan01.pdf"],
    "R04_kouki": ["https://www.jctc.jp/kentei/221121k_5futiy/221121k_mondai_1.pdf"],
    # 以下は推定（wp-content 配下の命名規則 YYYYMMDDk_mondai.pdf、日付は試験翌日）
    "R06_zenki": ["https://www.jctc.jp/wjctcp/wp-content/uploads/2024/06/20240603k_mondai.pdf"],
    "R06_kouki": ["https://www.jctc.jp/wjctcp/wp-content/uploads/2024/11/20241118k_mondai.pdf"],
    "R07_zenki": ["https://www.jctc.jp/wjctcp/wp-content/uploads/2025/06/20250602k_mondai.pdf"],  # 知恵袋回答で確認
    "R07_kouki": ["https://www.jctc.jp/wjctcp/wp-content/uploads/2025/11/20251117k_mondai.pdf"],
    "R08_zenki": ["https://www.jctc.jp/wjctcp/wp-content/uploads/2026/06/20260608k_mondai.pdf"],
    # H28, H29, R05前期, R05後期 は索引ページから探す
}

# 索引ページ（公式 + ミラー）。見つかった PDF リンクを年度・回に推定割当てする。
INDEX_PAGES = [
    "https://www.jctc.jp/mondai/",
    "https://www.jctc.jp/exam/kankouji-2/",
    "https://www.kankouji-sekou.com/2kan/2kakomono/",
    "https://www.sekoukannri.com/kankouji/2kyuu-kankouji-kakomono/",
    "https://dobokujira.com/2kan-pastproblems/",
]

# 試験実施日（公開PDFのファイル名/リンク文言の照合に使用）
SESSIONS = {
    "H28_kouki": ("平成28", 2016, "後期"), "H29_kouki": ("平成29", 2017, "後期"),
    "H30_zenki": ("平成30", 2018, "前期"), "H30_kouki": ("平成30", 2018, "後期"),
    "R01_zenki": ("令和元", 2019, "前期"), "R01_kouki": ("令和元", 2019, "後期"),
    "R02_kouki": ("令和2", 2020, "後期"),
    "R03_zenki": ("令和3", 2021, "前期"), "R03_kouki": ("令和3", 2021, "後期"),
    "R04_zenki": ("令和4", 2022, "前期"), "R04_kouki": ("令和4", 2022, "後期"),
    "R05_zenki": ("令和5", 2023, "前期"), "R05_kouki": ("令和5", 2023, "後期"),
    "R06_zenki": ("令和6", 2024, "前期"), "R06_kouki": ("令和6", 2024, "後期"),
    "R07_zenki": ("令和7", 2025, "前期"), "R07_kouki": ("令和7", 2025, "後期"),
    "R08_zenki": ("令和8", 2026, "前期"),
}


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.links = []; self._href = None; self._text = []
    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self._href = dict(attrs).get("href"); self._text = []
    def handle_data(self, data):
        if self._href is not None: self._text.append(data)
    def handle_endtag(self, tag):
        if tag == "a" and self._href:
            self.links.append((self._href, "".join(self._text).strip())); self._href = None


def get(url: str, timeout=60) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def download(url: str, dest: Path) -> tuple[bool, str]:
    try:
        data = get(url)
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError) as e:
        return False, f"{type(e).__name__}: {e}"
    if not data.startswith(b"%PDF"):
        return False, "not a PDF"
    dest.write_bytes(data)
    return True, f"{len(data)} bytes"


def guess_session(href: str, text: str) -> str | None:
    s = f"{href} {text}"
    if "管" not in s and "kan" not in s.lower():
        return None
    if "2級" not in s and "２級" not in s and "2kan" not in s and "/kentei/" not in href:
        pass  # 公式 /kentei/ 配下は種目を URL で判別できないので通す
    for key, (era, year, session) in SESSIONS.items():
        if (era in s or str(year) in s) and session in s:
            return key
        if (era in s or str(year) in s) and key.endswith("kouki") and "前期" not in s and year <= 2017:
            return key
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-index", action="store_true")
    args = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    report = {}

    for key, urls in KNOWN.items():
        dest = OUT / f"{key}_mondai.pdf"
        if dest.exists():
            report[key] = {"status": "exists", "path": str(dest)}; continue
        for url in urls:
            ok, msg = download(url, dest)
            print(f"{key}: {url} -> {msg}")
            report[key] = {"status": "ok" if ok else "fail", "url": url, "detail": msg}
            if ok: break
            time.sleep(1)

    if not args.no_index:
        candidates: dict[str, list[tuple[str, str]]] = {}
        for page in INDEX_PAGES:
            try:
                html = get(page).decode("utf-8", "replace")
            except Exception as e:  # noqa: BLE001
                print(f"[index] {page}: {type(e).__name__}: {e}"); continue
            p = LinkParser(); p.feed(html)
            for href, text in p.links:
                if not href or not re.search(r"\.pdf(\?|$)", href, re.I):
                    continue
                url = urljoin(page, href)
                key = guess_session(url, text)
                if key:
                    candidates.setdefault(key, []).append((url, text))
        (OUT / "index_candidates.json").write_text(
            json.dumps(candidates, ensure_ascii=False, indent=1), encoding="utf-8")
        for key, cands in candidates.items():
            dest = OUT / f"{key}_mondai.pdf"
            if dest.exists() or report.get(key, {}).get("status") == "ok":
                continue
            for url, text in cands:
                if re.search(r"seitou|正答|解答|実地|第二次|jitti|_2\.pdf|kan02", url + text):
                    continue
                ok, msg = download(url, dest)
                print(f"{key}: [index] {url} ({text}) -> {msg}")
                report[key] = {"status": "ok" if ok else "fail", "url": url, "detail": msg}
                if ok: break
                time.sleep(1)

    (OUT / "fetch_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    missing = [k for k in SESSIONS if not (OUT / f"{k}_mondai.pdf").exists()]
    print("\n未取得:", missing if missing else "なし")
    return 0 if not missing else 1


if __name__ == "__main__":
    sys.exit(main())
