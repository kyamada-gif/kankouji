# 過去問の入手先と収集状況（2026-10-15 時点）

## 1. 収集結果サマリ

| データ | 状態 | 場所 |
|---|---|---|
| 正答肢（18回分・各52問） | **取得・構造化済み** | `data/parsed/answers.json` |
| 問題文（18回分） | **未取得**（公式サイトが本環境から遮断） | 取得スクリプト `scripts/fetch_official_questions.py` を用意 |
| 試験概要・出題構成 | 整理済み | `docs/01_exam_overview.md` |

正答肢は 九州建設専門学院（l-mate.net）が S3 に置いている JCTC 公式「問題・正答肢」ページの複製 PDF
（`https://s3-us-west-1.amazonaws.com/static.l-mate.net/pdf/answer_kankouji/`）から取得した。
中身は JCTC の公式ページそのもの（表組み・注意書きが同一）で、問題 PDF 本体へのリンクが埋め込まれている。
平成29年度分のみスキャン画像だったため目視で転記した（`data/parsed/answers_manual.json`、要ダブルチェック）。

## 2. 公式ソース（一般財団法人 全国建設研修センター）

- 試験問題/正答肢の索引: https://www.jctc.jp/mondai/
- 2級管工事 試験ページ: https://www.jctc.jp/exam/kankouji-2/
- 問題PDF の URL（正答肢PDFの埋め込みリンクから確定したもの）

| 回 | 問題PDF |
|---|---|
| 平成30年度 前期 | http://www.jctc.jp/kentei/180604k_isey83/kan01.pdf |
| 平成30年度 後期 | http://www.jctc.jp/kentei/181119k_fw44eg/kan01.pdf |
| 令和元年度 前期 | http://www.jctc.jp/kentei/190603k_5guddf/kan01.pdf |
| 令和元年度 後期 | http://www.jctc.jp/kentei/191118k_h983oo/kan01.pdf |
| 令和2年度 後期 | http://www.jctc.jp/kentei/201116k_niergy/kan01.pdf |
| 令和3年度 前期 | https://www.jctc.jp/kentei/210607k_a798k5/kan01.pdf |
| 令和3年度 後期 | https://www.jctc.jp/kentei/211122k_ip89as/kan01.pdf |
| 令和4年度 前期 | https://www.jctc.jp/kentei/220606k_4giohi/kan01.pdf |
| 令和4年度 後期 | https://www.jctc.jp/kentei/221121k_5futiy/221121k_mondai_1.pdf |
| 令和7年度 前期 | https://www.jctc.jp/wjctcp/wp-content/uploads/2025/06/20250602k_mondai.pdf（Web上の引用で確認） |
| 令和7年度 後期 | https://www.jctc.jp/wjctcp/wp-content/uploads/2025/11/20251117k_seitou.pdf が正答肢。問題は同ディレクトリの `20251117k_mondai.pdf` と推定 |
| 令和5年度 前期/後期、令和6年度 前期/後期、令和8年度 前期 | 未確認（索引ページ https://www.jctc.jp/mondai/ から辿る。令和6年度以降は `wp-content/uploads/YYYY/MM/YYYYMMDDk_mondai.pdf` 形式と推定） |
| 平成28年度・平成29年度 | 公式サイトには残っていない可能性が高い。下記ミラーから取得 |

公開ルール: 試験日の翌日 13 時に問題・正答肢を公開。解説は公開されない。

## 3. ミラー・解説サイト（二次情報）

| サイト | 内容 | URL |
|---|---|---|
| 1・2級 管工事施工管理技士の勉強法 | 18年分（平成20年度〜）の問題PDF＋年度別の解答解説ページ | https://www.kankouji-sekou.com/2kan/2kakomono/ |
| 施工管理技士試験対策ブログ | 19年分（平成19年度〜）のPDF、年度別解答ページ | https://www.sekoukannri.com/kankouji/2kyuu-kankouji-kakomono/ |
| どぼくじら.com | 平成21年度〜 問題・解答PDFリンク集 | https://dobokujira.com/2kan-pastproblems/ |
| nekomaru.site | 約10年分のPDFまとめ | https://nekomaru.site/category/sekoukakomon/２kyu-kankouji/ |
| 過去問.com（2級管工事） | 平成29年度〜令和8年度前期の問題を解説付きでWeb出題（PDFではない） | https://kansekou2.kakomonn.com/ |
| sekocan.jp | 過去問解説 | https://sekocan.jp/past-exam/kan2 |
| CIC 総評 | 年度ごとの出題分析 | https://www.cic-ct.co.jp/sohyo/kankouji2/ |
| 九州建設専門学院（l-mate） | 公式正答肢ページの複製PDF（取得済み） | https://s3-us-west-1.amazonaws.com/static.l-mate.net/pdf/answer_kankouji/ |

## 4. この実行環境のネットワーク制限

以下のホストへの接続が環境のネットワークポリシーで拒否された（CONNECT 403）。
問題PDFを取得するには、環境設定の「Allowed domains」に少なくとも `www.jctc.jp` を追加する必要がある。

- www.jctc.jp（公式・必須）
- www.kankouji-sekou.com、www.sekoukannri.com、dobokujira.com（ミラー。平成28・29年度分に必要）
- kansekou2.kakomonn.com（解説付き出題サイト。参照用）

到達できたのは `s3-us-west-1.amazonaws.com`（正答肢の取得元）、`api.github.com`、パッケージレジストリのみ。

## 5. 次の手順

1. 許可ドメイン追加後に `python3 scripts/fetch_official_questions.py` を実行 → `data/raw/questions/*.pdf`
2. `python3 scripts/parse_question_pdf.py --check` で各回52問抽出できるか確認し、パターン不一致があれば正規表現を調整
3. `python3 scripts/parse_question_pdf.py` → `data/parsed/questions_all.json`（約 936 問）
4. 図表を含む問題（ダクト・配管図、工程表、単線結線図など）は `has_figure` を付け、`pdftoppm` で該当ページを切り出して画像を添付
5. 解説は別途作成（公式は非公開）。分野タグ（空調/衛生/工程管理/安全衛生法…）も付与
