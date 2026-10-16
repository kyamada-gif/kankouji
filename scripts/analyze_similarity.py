#!/usr/bin/env python3
"""2級管工事 第一次検定 936問の重複・類似・傾向分析。

手法（字面と意味の二段構え）
 1. 正規化: NFKC、空白除去、2解答問題の定型文削除
 2. 字面の近さ: 文字3-gram Jaccard（MinHash LSHで候補抽出→厳密計算）と difflib 一致率
 3. 意味の近さ: GiNZA(ja_ginza) 形態素の TF-IDF コサイン ＋ GiNZA 単語ベクトル平均のコサイン
 4. 論点クラスタ: TF-IDF → SVD → UMAP → HDBSCAN、c-TF-IDF で各クラスタにラベル
出力: data/analysis/*.json, pairs.csv
"""
import json, re, csv, unicodedata, difflib, itertools, collections, math
from pathlib import Path
import numpy as np
from datasketch import MinHash, MinHashLSH
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import normalize
import spacy, umap, hdbscan

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "analysis"; OUT.mkdir(exist_ok=True)
Q = json.loads((ROOT / "data/parsed/questions_all.json").read_text(encoding="utf-8"))
ORDER = ["H28_kouki","H29_kouki","H30_zenki","H30_kouki","R01_zenki","R01_kouki","R02_kouki","R03_zenki","R03_kouki",
         "R04_zenki","R04_kouki","R05_zenki","R05_kouki","R06_zenki","R06_kouki","R07_zenki","R07_kouki","R08_zenki"]
SIDX = {s: i for i, s in enumerate(ORDER)}
BOILER = re.compile(r"(適当でないものは|正しいものは|誤っているものは)二つあるので、?二つとも答えなさい。?")

def norm(s: str) -> str:
    s = unicodedata.normalize("NFKC", s)
    s = BOILER.sub("", s)
    s = re.sub(r"\s+", "", s)
    s = s.replace("，", "、").replace("．", "。")
    return s

for q in Q:
    q["n_stem"] = norm(q["stem"]); q["n_choices"] = [norm(c) for c in q["choices"]]
    q["n_full"] = q["n_stem"] + "|" + "|".join(q["n_choices"])
    q["sidx"] = SIDX[q["session"]]
N = len(Q)

FRAME = re.compile(r"(に関する|についての?|のうち|として|に用いる|に関し|の|における)?(次の)?(記述|文中|用語|組合せ|組み合わせ|語句|数値|名称|説明|順序|機器|もの)?(のうち|として|で)?、?(「[^」]*」上、?)?(最も)?(適当でない|適当な|正しい|誤っている|関係のない|該当しない|不適当な|必要のない|定められていない)(もの|組合せ)?はどれか。?$")
def core(stem: str) -> str:
    c = FRAME.sub("", stem)
    c = re.sub(r"^(次の|下図に示す|図に示す)", "", c)
    return c if len(c) >= 2 else stem

def shingles(s, n=3):
    return {s[i:i+n] for i in range(max(1, len(s) - n + 1))}
def jaccard(a, b):
    return len(a & b) / len(a | b) if a or b else 0.0
def ratio(a, b):
    return difflib.SequenceMatcher(None, a, b).ratio()

# ---------- 2. 字面: MinHash LSH で候補 → 厳密値 ----------
def lsh_candidates(texts, threshold=0.3, num_perm=128):
    lsh = MinHashLSH(threshold=threshold, num_perm=num_perm); mhs = []
    for i, t in enumerate(texts):
        m = MinHash(num_perm=num_perm)
        for sh in shingles(t): m.update(sh.encode("utf-8"))
        mhs.append(m); lsh.insert(str(i), m)
    cand = set()
    for i, m in enumerate(mhs):
        for j in lsh.query(m):
            j = int(j)
            if j > i: cand.add((i, j))
    return cand

full_sh = [shingles(q["n_full"]) for q in Q]
stem_sh = [shingles(q["n_stem"]) for q in Q]

# ---------- 3. 意味: GiNZA ----------
nlp = spacy.load("ja_ginza")
KEEP = {"NOUN", "PROPN", "VERB", "ADJ", "NUM"}
tokens, vecs = [], []
for doc in nlp.pipe([q["stem"] + "。" + "。".join(q["choices"]) for q in Q], batch_size=32):
    toks = [t.lemma_ for t in doc if t.pos_ in KEEP and not t.is_stop and len(t.lemma_) > 1]
    tokens.append(" ".join(toks))
    tv = [t.vector for t in doc if t.pos_ in KEEP and t.has_vector and not t.is_stop]
    vecs.append(np.mean(tv, axis=0) if tv else np.zeros(300))
tfidf = TfidfVectorizer(token_pattern=r"\S+", min_df=2, sublinear_tf=True).fit_transform(tokens)
tf_cos = (tfidf @ tfidf.T).toarray()
gv = normalize(np.array(vecs)); g_cos = gv @ gv.T

# ---------- ペア評価 ----------
cand = lsh_candidates([q["n_full"] for q in Q], 0.25) | lsh_candidates([q["n_stem"] for q in Q], 0.4)
# 意味側の候補も追加
for i in range(N):
    for j in np.where(tf_cos[i] >= 0.45)[0]:
        if j > i: cand.add((i, int(j)))
pairs = []
for i, j in cand:
    a, b = Q[i], Q[j]
    if a["session"] == b["session"]: continue
    jac = jaccard(full_sh[i], full_sh[j]); sj = jaccard(stem_sh[i], stem_sh[j])
    sr = ratio(a["n_stem"], b["n_stem"])
    # 選択肢の対応（最良マッチ、0.9以上を一致とみなす）
    cm = cm80 = 0
    used = set()
    for ca in a["n_choices"]:
        best, bk = 0, None
        for k, cb in enumerate(b["n_choices"]):
            if k in used: continue
            r = ratio(ca, cb)
            if r > best: best, bk = r, k
        if best >= 0.8: cm80 += 1; used.add(bk)
        if best >= 0.9: cm += 1
    fr = ratio(a["n_full"], b["n_full"])
    cr = ratio(core(a["n_stem"]), core(b["n_stem"]))
    t, g = float(tf_cos[i, j]), float(g_cos[i, j])
    if fr >= 0.92 or cm == 4: kind = "同一"              # 問題文も選択肢も同じ（再出題）
    elif cm == 3 or cm80 == 4: kind = "ほぼ同一"          # 選択肢1つ差替え／軽微な修正
    elif cm80 >= 2 or (cm >= 1 and (cr >= 0.6 or t >= 0.4)): kind = "類似"   # 選択肢の一部を再利用
    elif cr >= 0.85 or t >= 0.55: kind = "同一論点"       # 同じテーマだが文は別
    else: continue
    pairs.append({"a": a["id"], "b": b["id"], "kind": kind, "full_ratio": round(fr, 3), "stem_ratio": round(sr, 3),
                  "jaccard3": round(jac, 3), "core_ratio": round(cr, 3), "choices_matched": cm, "choices_matched80": cm80, "tfidf_cos": round(t, 3), "ginza_cos": round(g, 3),
                  "cat_a": a["category"], "cat_b": b["category"], "sa": a["sidx"], "sb": b["sidx"]})
pairs.sort(key=lambda p: (-p["full_ratio"], -p["tfidf_cos"]))

# ---------- 問題ごとの既出度（過去回に対して） ----------
RANK = {"同一": 4, "ほぼ同一": 3, "類似": 2, "同一論点": 1}
best_prev = {q["id"]: None for q in Q}; best_any = {q["id"]: None for q in Q}
for p in pairs:
    earlier, later = (p["a"], p["b"]) if p["sa"] < p["sb"] else (p["b"], p["a"])
    for key, other in ((later, earlier),):
        cur = best_prev[key]
        if cur is None or RANK[p["kind"]] > RANK[cur["kind"]] or (RANK[p["kind"]] == RANK[cur["kind"]] and p["full_ratio"] > cur["full_ratio"]):
            best_prev[key] = {"other": other, "kind": p["kind"], "full_ratio": p["full_ratio"], "tfidf_cos": p["tfidf_cos"]}
    for key, other in ((p["a"], p["b"]), (p["b"], p["a"])):
        cur = best_any[key]
        if cur is None or RANK[p["kind"]] > RANK[cur["kind"]]:
            best_any[key] = {"other": other, "kind": p["kind"]}

# ---------- 選択肢の再利用 ----------
choices = [(qi, k, c) for qi, q in enumerate(Q) for k, c in enumerate(q["n_choices"]) if len(c) >= 6]
ctexts = [c for _, _, c in choices]
ccand = lsh_candidates(ctexts, 0.5)
reused = collections.defaultdict(set)   # choice idx -> set of other question ids
choice_pairs = 0
for i, j in ccand:
    qi, qj = choices[i][0], choices[j][0]
    if Q[qi]["session"] == Q[qj]["session"]: continue
    if ratio(ctexts[i], ctexts[j]) >= 0.9:
        choice_pairs += 1; reused[i].add(Q[qj]["id"]); reused[j].add(Q[qi]["id"])
choice_reused_flags = {}
for idx, (qi, k, c) in enumerate(choices):
    choice_reused_flags.setdefault(Q[qi]["id"], [False]*4)[k] = idx in reused
# 過去回の選択肢と一致（学習上の「既出選択肢」）
choice_prev = {}
ID2I = {q["id"]: i for i, q in enumerate(Q)}
for idx, (qi, k, c) in enumerate(choices):
    prev = any(Q[ID2I[o]]["sidx"] < Q[qi]["sidx"] for o in reused.get(idx, ()))
    choice_prev.setdefault(Q[qi]["id"], [False]*4)[k] = prev

# ---------- 4. クラスタリング ----------
svd = TruncatedSVD(n_components=60, random_state=42).fit_transform(tfidf)
X = normalize(np.hstack([normalize(svd), 0.5 * gv]))
emb2 = umap.UMAP(n_components=2, n_neighbors=12, min_dist=0.05, metric="cosine", random_state=42).fit_transform(X)
emb5 = umap.UMAP(n_components=5, n_neighbors=12, min_dist=0.0, metric="cosine", random_state=42).fit_transform(X)
labels = hdbscan.HDBSCAN(min_cluster_size=6, min_samples=2, cluster_selection_method="leaf").fit_predict(emb5)
# c-TF-IDF ラベル
vocab = np.array(TfidfVectorizer(token_pattern=r"\S+", min_df=2).fit(tokens).get_feature_names_out())
cv = TfidfVectorizer(token_pattern=r"\S+", min_df=2, use_idf=False, norm=None).fit(tokens)
counts = cv.transform(tokens); vocab = np.array(cv.get_feature_names_out())
topics = []
for c in sorted(set(labels)):
    if c == -1: continue
    idx = np.where(labels == c)[0]
    tf_c = np.asarray(counts[idx].sum(axis=0)).ravel()
    tf_all = np.asarray(counts.sum(axis=0)).ravel()
    ctf = (tf_c / max(1, tf_c.sum())) * np.log(1 + tf_all.mean() / (tf_all + 1e-9))
    top = [vocab[i] for i in np.argsort(-ctf)[:5]]
    cats = collections.Counter(Q[i]["category"] for i in idx)
    sess = collections.Counter(Q[i]["session"] for i in idx)
    topics.append({"cluster": int(c), "label": "・".join(top[:3]), "terms": top, "size": int(len(idx)),
                   "sessions": len(sess), "category": cats.most_common(1)[0][0],
                   "per_session": {s: sess.get(s, 0) for s in ORDER},
                   "example": Q[idx[0]]["stem"][:60]})
topics.sort(key=lambda t: -t["size"])

# ---------- 集計 ----------
by_kind = collections.Counter(p["kind"] for p in pairs)
q_flag = collections.Counter((best_any[q["id"]] or {}).get("kind", "新規") for q in Q)
prev_flag = collections.Counter((best_prev[q["id"]] or {}).get("kind", "新規") for q in Q if q["sidx"] > 0)
per_session = []
for s in ORDER:
    qs = [q for q in Q if q["session"] == s]
    kinds = collections.Counter((best_prev[q["id"]] or {}).get("kind", "新規") for q in qs)
    cp = [choice_prev.get(q["id"], [False]*4) for q in qs]
    per_session.append({"session": s, "era": qs[0]["era"], "term": qs[0]["term"], **{k: kinds.get(k, 0) for k in ["同一","ほぼ同一","類似","同一論点","新規"]},
                        "choice_prev_rate": round(sum(map(sum, cp)) / (4*len(qs)), 3)})
cat_year = collections.defaultdict(lambda: collections.Counter())
for q in Q: cat_year[q["category"]][q["session"]] += 1
ans_dist = collections.Counter(a for q in Q for a in q["answers"])

enriched = []
for i, q in enumerate(Q):
    enriched.append({"id": q["id"], "session": q["session"], "era": q["era"], "term": q["term"], "number": q["number"],
                     "category": q["category"], "format": q["format"], "answers": q["answers"], "stem": q["stem"], "choices": q["choices"],
                     "cluster": int(labels[i]), "x": float(emb2[i, 0]), "y": float(emb2[i, 1]),
                     "prev": best_prev[q["id"]], "any": best_any[q["id"]],
                     "choice_prev": choice_prev.get(q["id"], [False]*4), "has_figure": q["has_figure"], "text_source": q["text_source"]})
summary = {
    "n_questions": N, "n_sessions": len(ORDER), "pairs_by_kind": by_kind, "questions_by_best_link": q_flag,
    "questions_by_prev_link_excluding_first": prev_flag, "per_session": per_session,
    "n_choices": len(choices), "choice_pairs_reused": choice_pairs,
    "choices_with_reuse": sum(1 for v in reused.values() if v),
    "choices_prev_reused": sum(sum(v) for v in choice_prev.values()),
    "category_by_session": {c: {s: cat_year[c].get(s, 0) for s in ORDER} for c in cat_year},
    "answer_distribution": dict(sorted(ans_dist.items())),
    "n_clusters": len(topics), "noise": int((labels == -1).sum()),
}
(OUT / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=1), encoding="utf-8")
(OUT / "topics.json").write_text(json.dumps(topics, ensure_ascii=False, indent=1), encoding="utf-8")
(OUT / "questions_enriched.json").write_text(json.dumps(enriched, ensure_ascii=False), encoding="utf-8")
with open(OUT / "pairs.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(pairs[0].keys())); w.writeheader(); w.writerows(pairs)
np.save(OUT / "tfidf_cos.npy", tf_cos.astype(np.float32))
print(json.dumps({k: v for k, v in summary.items() if k not in ("per_session", "category_by_session")}, ensure_ascii=False, indent=1))
for r in per_session: print(r)
print("topics:", len(topics)); 
for t in topics[:15]: print(t["size"], t["sessions"], t["category"], t["label"], "|", t["example"][:40])
