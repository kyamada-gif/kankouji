# 2級管工事施工管理技士 第一次検定 対策アプリ

## 現在の状態（データ収集フェーズ）

```
kankouji-app/
├── README.md
├── docs/
│   ├── 01_exam_overview.md        # 試験概要・出題構成・対象18回の一覧・合格率
│   └── 02_sources_and_status.md   # 入手先URL・収集状況・ネットワーク制限・次の手順
├── data/
│   ├── raw/
│   │   ├── answers_lmate/         # 公式「問題・正答肢」ページの複製PDF 18回分（取得済み）
│   │   └── questions/             # 公式問題PDF（未取得。fetch スクリプトの出力先）
│   └── parsed/
│       ├── answers.json           # 18回 × 52問の正答（構造化済み）
│       ├── answers_manual.json    # 画像PDFから目視転記した分（平成29年度）
│       ├── sessions.json          # 回ごとのメタデータ（試験日・形式・PDF URL）
│       └── questions/             # 問題JSON（parse スクリプトの出力先）
└── scripts/
    ├── parse_answer_keys.py       # 正答肢PDF → answers.json
    ├── fetch_official_questions.py# 公式問題PDFの取得（要: www.jctc.jp への通信許可）
    └── parse_question_pdf.py      # 問題PDF → questions JSON（正答と結合）
```

## データ形式

`data/parsed/answers.json`

```json
{
  "R04_zenki": {
    "era": "令和4年度", "year": 2022, "session": "前期", "exam": "第一次検定", "format": "new",
    "answers": {"1": [4], "2": [3], "...": "...", "49": [2, 4], "52": [1, 3]}
  }
}
```

- `format`: `old` = 令和2年度以前の学科試験（52問中40問、施工管理法14問中12問）、`new` = 令和3年度以降（基礎的な能力4問が追加）
- `new` の No.49〜52 は正答が 2 つ（四肢択二）。配列で保持する。

問題JSON（`parse_question_pdf.py` 出力）の1件:

```json
{
  "id": "R04_zenki_01", "session": "R04_zenki", "number": 1,
  "category": "一般基礎", "required": true, "selection_note": "6問必須",
  "stem": "…に関する記述のうち、適当でないものはどれか。",
  "choices": ["…", "…", "…", "…"],
  "answers": [4], "multi_answer": false,
  "has_figure": null, "explanation": null,
  "source": {"pdf": "data/raw/questions/R04_zenki_mondai.pdf"}
}
```

## 再現手順

```bash
python3 scripts/parse_answer_keys.py          # 正答の再生成（pdftotext が必要）
python3 scripts/fetch_official_questions.py   # 問題PDF取得（ネットワーク許可後）
python3 scripts/parse_question_pdf.py --check # 抽出件数の検証
python3 scripts/parse_question_pdf.py         # questions_all.json 生成
```
