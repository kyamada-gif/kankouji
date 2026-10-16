# スーパー管工事ブラザーズ（2級管工事 第一次検定 瞬間想起トレーナー）

lpic-reflex（`~/saiyou/lpic-reflex`）と同じ仕組み・UIで、2級管工事施工管理技士 第一次検定の過去問（平成28年度後期〜令和8年度前期の18回）を反射で解けるようにするアプリ。見た目はスーパーマリオ風。

## 使い方

`index.html` をブラウザで開くだけ（オフライン動作）。`index.html` / `app.js` / `questions.js` / `vendor/` は同じフォルダに置いたままにする。

- **覚える**：10問ずつのカード。正解肢＝緑、**正誤の決め手＝黄マーカー**、💡＝正しくは。
- **テスト**：選択肢から選ぶ。正解でコイン、不正解でダメージ。
- **ワールド 1-1〜6-3**：3回分ずつ6グループ × 各3コース（分野の比率を揃えて分割）。テスト9割でコースクリア🚩。
- **クッパ城（総合テスト）**：全範囲から40問、24問（6割）で合格＝⭐、32問以上で👑。修了バッジ5個でピーチ姫を救出。
- **ランダム演習**・**🔖要復習**：lpic-reflex と同じ。
- 🎵 BGM（覚える＝地下、テスト＝ワールドごと、クッパ城＝城）、🔊 効果音。どちらもホーム右上で切替。
- 進捗は localStorage（キー接頭辞 `kankouji-`）に保存。

## 収録データ

- 936問から、完全重複（記号の差だけのもの）44問を統合、図・表を使う問題65問を除外して **827問**。
- 正誤箇所（`answerHints`）と「正しくは」（`mnemonic`）は `../data/hints/blockNN.json` に手書き（AI生成を含む）。

## 作り直し手順

```bash
cd ..                                   # kankouji-app/
python3 scripts/dedupe_questions.py     # 重複統合・図問題除外・ブロック分け → data/parsed/questions_app.json
python3 scripts/check_hints.py 1 2 3    # ヒントの検査（ブロック番号）
python3 scripts/build_app_data.py       # → app/questions.js
cd app && npm install && node build.js  # app.jsx → app.js
```
