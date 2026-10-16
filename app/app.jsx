import React, { useState, useEffect, useMemo } from "react";

// ════════════════════════════════════════════════════════════════
//  HACK × THE × 管工事（2級管工事施工管理技士 第一次検定）
//  lpic-reflex と同じ仕組み・UI。
//   ・覚える: 10問ずつのカード。正解肢の「正誤箇所」に黄マーカー（answerHints）
//   ・テスト: 選択肢から選ぶ → 正解肢＋黄マーカー＋💡正しくは（mnemonic）
//   ・ブロック: 3回分ずつ6グループ × 各3ブロック（分野の比率を揃えて分割済み）
//  ※ QUESTIONS / BLOCKS は questions.js（scripts/build_app_data.py が生成）
// ════════════════════════════════════════════════════════════════
const QUESTIONS = window.QUESTIONS || [];
const BLOCKS = window.BLOCKS || [];

function judge(q, input) {
  const a = [...q.answer].sort().join(",");
  const b = [...input].sort().join(",");
  return a === b;
}

// 正解肢 label の正誤箇所（黄マーカーを引く部分文字列の配列）
function hintsFor(q, label) {
  const k = q.answer.indexOf(label);
  return (k >= 0 && q.answerHints && q.answerHints[k]) ? q.answerHints[k] : [];
}

// ════════════════════════════════════════════════════════════════
//  マリオ風テーマ: ドット絵スプライト / 背景部品 / 効果音
// ════════════════════════════════════════════════════════════════
// 12×16 のドット絵。H=帽子 C=シャツ O=オーバーオール M=髪・ひげ S=肌 F=靴 Y=ボタン
const HERO = [
  "...HHHHH....",
  "..HHHHHHHHH.",
  "..MMMSSMS...",
  ".MSMSSSMSSS.",
  ".MSMMSSSMSSS",
  ".MMSSSSMMMM.",
  "...SSSSSSS..",
  "..CCOCCC....",
  ".CCCOCCOCCC.",
  "CCCCOOOOCCCC",
  "SSCOYOOYOCSS",
  "SSSOOOOOOSSS",
  "SSOOOOOOOOSS",
  "..OOO..OOO..",
  ".FFF....FFF.",
  "FFFF....FFFF",
];
const COIN = [
  "..KKKK..",
  ".KYYYYK.",
  "KYWYYYOK",
  "KYWYOYOK",
  "KYWYOYOK",
  "KYWYOYOK",
  "KYWYOYOK",
  "KYWYYYOK",
  ".KYYYYK.",
  "..KKKK..",
];
// クリボー 16×16。B=頭 D=まゆ・足 W=白目 T=顔・胴
const GOOMBA = [
  "......BBBB......",
  ".....BBBBBB.....",
  "....BBBBBBBB....",
  "...BBBBBBBBBB...",
  "..BDDBBBBBBDDB..",
  ".BBBWDBBBBDWBBB.",
  ".BBBWDDDDDDWBBB.",
  "BBBBWDWBBWDWBBBB",
  "BBBBWWWBBWWWBBBB",
  "BBBBBBBBBBBBBBBB",
  ".BBBBTTTTTTBBBB.",
  "....TTTTTTTT....",
  "....TTTTTTTTD...",
  "..DDDTTTTTTDDD..",
  ".DDDDDTTTTDDDDD.",
  ".DDDDDD..DDDDDD.",
];
// ピーチ 12×20。C=王冠 R=宝石・口 Y=髪 S=肌 B=目 P=ドレス p=ドレスの影
// キノピオ 12×16。W=かさ・ズボン R=かさの水玉 E=目 B=ベスト Y=ベストの縁 F=くつ
const TOAD = [
  "....WWWW....",
  "..WWRRRRWW..",
  ".WRRRRRRRRW.",
  "WWRRWWWWRRWW",
  "WWWWWWWWWWWW",
  "WRRWWWWWWRRW",
  ".WWWWWWWWWW.",
  "..SSSSSSSS..",
  "..SESSSSES..",
  "..SESSSSES..",
  "...SSSSSS...",
  "..BBYSSYBB..",
  ".SBBWWWWBBS.",
  ".SBWWWWWWBS.",
  "...WWWWWW...",
  "..FFF..FFF..",
];
// スター 16×15（キノピオが乗る）。Y=黄 O=縁 K=目
const STAR = [
  ".......OO.......",
  "......OYYO......",
  "......OYYO......",
  ".....OYYYYO.....",
  "OOOOOOYYYYOOOOOO",
  ".OYYYYYYYYYYYYO.",
  "..OYYYKYYKYYYO..",
  "...OYYKYYKYYO...",
  "....OYYYYYYO....",
  "....OYYYYYYO....",
  "...OYYYYYYYYO...",
  "...OYYYOOYYYO...",
  "..OYYYO..OYYYO..",
  "..OYYO....OYYO..",
  ".OOO........OOO.",
];
const PEACH = [
  "....C.C.C...",
  "....CCRCC...",
  "...YYYYYYY..",
  "..YYSSSSSYY.",
  "..YSSBSBSSY.",
  "..YSSSSSSSY.",
  "..YYSSRSSYY.",
  ".YYYYSSSYYYY",
  ".YYPPPPPPPYY",
  ".YYPpPPPpPYY",
  "..SPPPPPPPS.",
  "..SPPPPPPPS.",
  "...PPPPPPP..",
  "..PPPPPPPPP.",
  "..PPpPPPpPP.",
  ".PPPPPPPPPPP",
  ".PPPPPPPPPPP",
  "PPPPPPPPPPPP",
  "PpPPPPPPPPpP",
  "PPPPPPPPPPPP",
];
// クッパ 20×18（左向き）。H=角・爪・とげ R=髪 O=体 o=腹 K=目 G=甲羅
const BOWSER = [
  "...H......RR........",
  "..HH....RRRRR.......",
  "..OOOO.RRRRRRR......",
  ".OOKOOORRRRRR.H.H...",
  "OOOOOOOORRRGGHGGH...",
  "HOHOOOOOOGGGGGGGGH..",
  "OOOOOOOOGGHGGGGHGG..",
  ".OOOOOooGGGGGGGGGGH.",
  "..OOOooooGGHGGGHGGG.",
  "..HOOoooooGGGGGGGGG.",
  ".HOOOoooooGGGGGGGGH.",
  "..OOOoooooOGGGGGGG..",
  "...OOoooooOOGGGGG...",
  "...OOOoooOOOO.......",
  "..OOOOOOOOOOOO......",
  "..OOO......OOO......",
  ".HOOO.....HOOO......",
  "HHOOO....HHOOO......",
];
const SKIN = { M: "#6b3a12", S: "#f8b878", F: "#6b3a12", Y: "#fbd000", O: "#2038ec" };
const PALETTES = {
  mario: { ...SKIN, H: "#e52521", C: "#e52521" },
  luigi: { ...SKIN, H: "#20a030", C: "#20a030" },
  star: { Y: "#fbd000", O: "#d08800", K: "#1a1a1a" },
  toad: { W: "#ffffff", R: "#e52521", S: "#f8b878", E: "#1a1a1a", B: "#2038ec", Y: "#fbd000", F: "#8b4513" },
  coin: { K: "#6b3a00", Y: "#fbd000", W: "#fff6a0", O: "#d08800" },
  goomba: { B: "#a8501c", D: "#2a1400", W: "#fff4e0", T: "#f0c890" },
  peach: { C: "#fbd000", R: "#e52521", Y: "#fcd000", S: "#f8c8a0", B: "#2038ec", P: "#f878b0", p: "#c83c78" },
  bowser: { H: "#f4f0e0", R: "#e52521", O: "#e8a800", o: "#f8e0a0", K: "#1a1a1a", G: "#1f8a2a" },
};

// 結果が「よくできた」か（総合テスト＝合格 / それ以外＝9割以上）
function isGood(s) {
  if (!s) return false;
  if (s.exam) return !!s.pass;
  return s.pct >= PASS_PCT;
}

// 文字列グリッド → SVG（同色の連続は1つの rect にまとめる）
function Pixel({ rows, palette, px = 3, style, className, title }) {
  const rects = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let w = 1;
      while (x + w < row.length && row[x + w] === ch) w++;
      if (palette[ch]) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={w} height={1} fill={palette[ch]} />);
      x += w;
    }
  });
  const w = rows[0].length, h = rows.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w * px} height={h * px} shapeRendering="crispEdges" style={style} className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : "true"}>
      {rects}
    </svg>
  );
}
function Hero({ who = "mario", px = 3, pose = "", style }) {
  return <Pixel rows={HERO} palette={PALETTES[who]} px={px} style={style} className={"hero " + pose} title={HERO_NAMES[who]} />;
}
// 頭の上に小さく名前を付けたマリオ／ルイージ
const HERO_NAMES = { mario: "ゆーくん", luigi: "みっちゃん" };
function NamedHero({ who, style, king = false, ...rest }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: king ? 9 : 5 }}>
      <span style={{ fontSize: 9, fontWeight: 800, color: "#000", lineHeight: 1, whiteSpace: "nowrap" }}>{HERO_NAMES[who]}</span>
      {king ? <KingHero style={style} {...rest} /> : <Hero who={who} style={style} {...rest} />}
    </span>
  );
}
function Coin({ px = 2, style, className }) {
  return <Pixel rows={COIN} palette={PALETTES.coin} px={px} style={style} className={className} />;
}
// ?ブロック（装飾）
function QBlock({ size = 26, style }) {
  return <span className="qblock" aria-hidden="true" style={{ width: size, height: size, fontSize: size * 0.62, ...style }}>?</span>;
}
// 土管（装飾）
function Pipe({ w = 44, h = 34, style }) {
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", ...style }}>
      <span className="pipe" style={{ width: w, height: 14 }} />
      <span className="pipe" style={{ width: w - 8, height: h, borderTop: "none" }} />
    </span>
  );
}
// 背景の風景：空に浮かぶ雲＋画面下の地面（固定・操作の邪魔をしない）
function Cloud({ style }) {
  return (
    <svg viewBox="0 0 48 20" width={96} height={40} aria-hidden="true" style={{ position: "absolute", ...style }}>
      <g fill="#fff">
        <ellipse cx="14" cy="13" rx="10" ry="6" /><ellipse cx="24" cy="9" rx="10" ry="8" /><ellipse cx="35" cy="13" rx="10" ry="6" />
      </g>
    </svg>
  );
}
// かめおの城（背景）。灰色の石積み＋凸凹の城壁＋黒い門と窓。
// 城壁の上（塔の左右）に、攫われたピーチとクッパ。救出後はピーチがいなくなり（マリオの横へ）、クッパが悔しがる
function Castle({ style, rescued = false }) {
  const tiny = { position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 3, padding: "1px 5px", fontSize: 9, borderWidth: 2, whiteSpace: "nowrap" };
  const stone = { background: "#8c8c8c", backgroundImage: "linear-gradient(#4a4a4a 2px, transparent 2px), linear-gradient(90deg, #4a4a4a 2px, transparent 2px)", backgroundSize: "16px 10px", border: "2px solid #3a3a3a", boxSizing: "border-box" };
  const crenel = (w) => ({ height: 12, width: w, background: "repeating-linear-gradient(90deg, #8c8c8c 0 12px, transparent 12px 20px)", borderBottom: "none" });
  return (
    <div aria-hidden="true" style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.92, ...style }}>
      <div style={{ width: 2, height: 22, background: "#3a3a3a", position: "relative" }}>
        <span style={{ position: "absolute", left: 2, top: 0, width: 16, height: 11, background: "#e52521", clipPath: "polygon(0 0,100% 50%,0 100%)" }} />
      </div>
      <div style={crenel(70)} />
      <div style={{ ...stone, width: 70, height: 48, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, position: "relative" }}>
        {rescued && (
          <svg viewBox="0 0 70 48" width={70} height={48} style={{ position: "absolute", inset: 0 }} aria-hidden="true">
            <g fill="none" stroke="#1a1a1a" strokeWidth="2.5">
              <polyline points="8,0 14,10 6,18 12,30" />
              <polyline points="62,48 56,36 64,28 58,20" />
            </g>
          </svg>
        )}
        <span style={{ width: 9, height: 16, background: "#111", borderRadius: "5px 5px 0 0" }} />
        <span style={{ width: 9, height: 16, background: "#111", borderRadius: "5px 5px 0 0" }} />
      </div>
      <div style={{ ...crenel(150), position: "relative" }}>
        {!rescued && (
          <div style={{ position: "absolute", left: 6, bottom: 12 }}>
            <span className="bubble" style={{ ...tiny, borderColor: "#f878b0" }}>たすけて〜！</span>
            <Pixel rows={PEACH} palette={PALETTES.peach} px={2} className="hero idle" />
          </div>
        )}
        <div style={{ position: "absolute", right: 0, bottom: 12 }}>
          <span className="bubble" style={{ ...tiny, borderColor: "#1f8a2a" }}>{rescued ? "ぐぬぬ…" : "ガハハ！"}</span>
          <Pixel rows={BOWSER.map((r) => r.padEnd(20, "."))} palette={PALETTES.bowser} px={2} className="hero idle" style={{ animationDelay: ".4s" }} />
        </div>
      </div>
      <div style={{ ...stone, width: 150, height: 76, position: "relative" }}>
        {rescued && (  /* ピーチを救出したあとは城にヒビ */
          <svg viewBox="0 0 150 76" width={150} height={76} style={{ position: "absolute", inset: 0 }} aria-hidden="true">
            <g fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="miter">
              <polyline points="18,0 24,14 16,24 26,38 20,52" />
              <polyline points="24,14 34,18" />
              <polyline points="132,0 126,12 136,22 128,36" />
              <polyline points="136,22 146,26" />
              <polyline points="60,76 66,64 58,56 64,46" />
              <polyline points="98,0 94,10 102,16" />
            </g>
          </svg>
        )}
        <span style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", width: 30, height: 44, background: "#111", borderRadius: "15px 15px 0 0" }} />
        <span style={{ position: "absolute", left: 22, top: 16, width: 10, height: 16, background: "#111", borderRadius: "5px 5px 0 0" }} />
        <span style={{ position: "absolute", right: 22, top: 16, width: 10, height: 16, background: "#111", borderRadius: "5px 5px 0 0" }} />
      </div>
    </div>
  );
}
// 地面を歩くクリボー（左右反転を繰り返す＝ファミコンの歩き方）
function WalkingGoomba({ duration = 16, delay = 0 }) {
  return (
    <div className="goomba-walk" style={{ position: "absolute", bottom: 33, left: 0, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}>
      <Pixel rows={GOOMBA} palette={PALETTES.goomba} px={2} className="goomba-step" title="クリボー" />
    </div>
  );
}
// 飛ぶ軌道（画面幅・高さに対する割合）：右上から入り、ゆるい弧を描いて画面中ほどまで下り、左上へ抜ける。小さく上下にふわふわ揺れる
function toadAt(u) {
  const x = 1.08 - 1.2 * u;
  const y = 0.10 + 0.24 * Math.sin(Math.PI * u) + 0.012 * Math.sin(u * Math.PI * 8);
  return [x, y];
}
// スターに乗ったキノピオ：トップを開くたびに5%の確率で、空を1回だけ飛んでいく（毎フレーム位置を計算してなめらかに）
function FlyingToad() {
  const [show, setShow] = useState(() => Math.random() < 0.05);
  const ref = React.useRef(null), faceRef = React.useRef(null), trailRefs = React.useRef([]);
  useEffect(() => {
    if (!show) return;
    const DUR = 3900, DELAY = 1000;
    let raf, start = null, faceLeft = true;
    const step = (now) => {
      if (start == null) start = now + DELAY;
      const u = Math.max(0, (now - start) / DUR);
      if (u >= 1) { setShow(false); return; }
      const W = window.innerWidth, H = window.innerHeight;
      const [x, y] = toadAt(u), [x2, y2] = toadAt(Math.min(1, u + 0.004));
      const dx = (x2 - x) * W, dy = (y2 - y) * H;
      if (Math.abs(dx) > 0.3) faceLeft = dx < 0;                         // 進む向きを向く
      const tilt = Math.max(-25, Math.min(25, Math.atan2(dy, Math.abs(dx)) * 180 / Math.PI * 0.5)) * (faceLeft ? -1 : 1);
      if (ref.current) ref.current.style.transform = `translate3d(${x * W - 16}px, ${y * H - 20}px, 0) rotate(${tilt}deg)`;
      if (faceRef.current) faceRef.current.style.transform = faceLeft ? "scaleX(-1)" : "none";
      trailRefs.current.forEach((el, k) => {                              // 後ろに残るキラキラ
        if (!el) return;
        const [tx, ty] = toadAt(Math.max(0, u - 0.012 * (k + 1)));
        el.style.transform = `translate3d(${tx * W + 4}px, ${ty * H + 26 + Math.sin(now / 90 + k) * 3}px, 0)`;
        el.style.opacity = u > 0 ? String(0.8 - k * 0.14) : "0";
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [show]);
  if (!show) return null;
  return (
    <>
    {[0, 1, 2, 3, 4].map((k) => (
      <span key={k} ref={(el) => (trailRefs.current[k] = el)} style={{ position: "absolute", top: 0, left: 0, width: 6 - k, height: 6 - k, background: "#fff6a0", boxShadow: "0 0 6px #fbd000", opacity: 0, willChange: "transform" }} />
    ))}
    <div ref={ref} style={{ position: "absolute", top: 0, left: 0, display: "flex", flexDirection: "column", alignItems: "center", transform: "translate3d(-200px,-200px,0)", willChange: "transform" }}>
      <div ref={faceRef} style={{ transform: "scaleX(-1)", marginBottom: -12, position: "relative", zIndex: 1 }}>
        <Pixel rows={TOAD} palette={PALETTES.toad} px={2} className="hero" title="キノピオ" />
      </div>
      <Pixel rows={STAR} palette={PALETTES.star} px={2} className="star-spin" title="スター" />
    </div>
    </>
  );
}
// プクプク 16×15（右向き・ファミコン風）。R=体 W=背びれ・顔 T=ひれ・くちびる K=目・口
const CHEEP = [
  "......TTTTTT....",
  "..WW.RRRRRR.....",
  ".WWWRRRRRRRTT...",
  ".WWWWRRRRWWWWT..",
  "..WWWRRRWWWWWW..",
  "..WWRRRRWWKWWK..",
  "...WRRRRWWKWWK..",
  "...RRRRRRWWWWWR.",
  "..RRRRRRRRWWRR..",
  "T.RRRRRRRRRTTTT.",
  "TTRRRRRRRRTKKKT.",
  "TTTRRRRRRTTKKK..",
  "TT.RRRRRWWTTT...",
  "T...RRRWWWW.....",
  "......WWWW......",
];
// 宝箱（ふた LID ＋ 箱 CHEST_BODY）。K=輪郭 B=木 Y=金具 y=中の光
const CHEST_LID = [
  ".KKKKKKKKKKKK.",
  "KBBYBBBBBBYBBK",
  "KBBYBBBBBBYBBK",
  "KYYYYYYYYYYYYK",
];
const CHEST_BODY = [
  "KKKKKKYYKKKKKK",
  "KBBYBBYYBBYBBK",
  "KBBYBBKKBBYBBK",
  "KBBYBBBBBBYBBK",
  "KYYYYYYYYYYYYK",
  "KBBYBBBBBBYBBK",
  "KKKKKKKKKKKKKK",
];
const CHEST_PAL = { K: "#3b2a1a", B: "#a8501c", Y: "#f8c800", y: "#fff6a0" };
function Chest({ open = false, px = 3 }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      {open && <Pixel rows={CROWN} palette={CROWN_PAL} px={px} className="treasure-pop" style={{ position: "absolute", top: -14 * px, zIndex: 2 }} />}
      <div className={open ? "chest-lid-open" : ""} style={{ transformOrigin: "left bottom" }}>
        <Pixel rows={CHEST_LID} palette={CHEST_PAL} px={px} />
      </div>
      <Pixel rows={CHEST_BODY} palette={CHEST_PAL} px={px} />
    </div>
  );
}
// 王冠 9×5。Y=金 R=赤い宝石 B=青い宝石
const CROWN = [
  "Y...Y...Y",
  "YY.YYY.YY",
  "YYYYYYYYY",
  "YRYYBYYRY",
  "YYYYYYYYY",
];
const CROWN_PAL = { Y: "#f8c800", R: "#e52521", B: "#2038ec" };
// 王様のゆーくん：王冠と、白い毛皮の縁どりの赤いマント
function KingHero({ px = 3, pose = "", style }) {
  return (
    <span className={"hero " + pose} style={{ position: "relative", display: "inline-block", width: 12 * px, height: 16 * px, ...style }}>
      <svg viewBox="0 0 16 11" width={16 * px} height={11 * px} style={{ position: "absolute", left: -2 * px, top: 6.5 * px }} aria-hidden="true">
        <path d="M2 1 H14 L16 11 H0 Z" fill="#c8102e" />
        <rect x="1.5" y="0" width="13" height="2" fill="#ffffff" />
        <rect x="4" y="0.6" width="1" height="0.8" fill="#1a1a1a" /><rect x="8" y="0.6" width="1" height="0.8" fill="#1a1a1a" /><rect x="12" y="0.6" width="1" height="0.8" fill="#1a1a1a" />
      </svg>
      <Pixel rows={HERO} palette={PALETTES.mario} px={px} style={{ position: "relative" }} title="王様のゆーくん" />
      <Pixel rows={CROWN} palette={CROWN_PAL} px={px * 0.8} style={{ position: "absolute", left: 3.2 * px, top: -3.4 * px }} />
    </span>
  );
}
// カロン 16×24（右向き・立ち姿）。K=輪郭 W=骨 Y=目 g=こうら S=こうらの白 B=くつ O=くつ底
const DRYBONES = [
  ".......KKKK.....",
  "......KWWWWK....",
  ".....KWWWWWWK...",
  ".....KWWWKYWK...",
  ".....KWWWKKWWK..",
  "....KWWWWWWWWWK.",
  "....KWWWWWWWWWWK",
  "....KWWWWWgKKKK.",
  ".....KWWWWWWWK..",
  "......KKWWWKK...",
  "......KWWWK.....",
  "...KKKKWWWK.....",
  "..KgggKWWWWK....",
  ".KgSgSgKWWWK....",
  ".KgggggKWWWKK...",
  "KgSgSggKWWWWWK..",
  "KgggggKWWWWWKK..",
  "KggSggKWWWWK....",
  ".KgggKWWWWWK....",
  "..KKKKWWWWWK....",
  "....KWWK.KWWK...",
  "...KBBBK.KBBBK..",
  "..KBBBBK.KBBBBK.",
  "..KOOOOK.KOOOOK.",
];
const DRYBONES_PAL = { K: "#111111", W: "#f2eedc", Y: "#f8d800", g: "#9aa2ac", S: "#e8e8e0", B: "#a8d8e8", O: "#e07020" };
// 羽（カロンの背中に付けてパタパタ）
const WING = [
  "...WWW",
  ".WWWWW",
  "WWWWWW",
  ".WWWW.",
  "..WW..",
];
// 溶岩のワールドを歩くカロン（左向きのまま、ひょこひょこ跳ねて歩く）
function WalkingDryBones({ duration = 18, delay = 0 }) {
  return (
    <div className="goomba-walk" style={{ position: "absolute", bottom: 33, left: 0, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}>
      <div style={{ transform: "scaleX(-1)" }}>{/* 左向きに歩く */}
        <Pixel rows={DRYBONES} palette={DRYBONES_PAL} px={2} className="hero idle walker" title="カロン" />
      </div>
    </div>
  );
}
// 雲の上を飛ぶ羽つきカロン
const PARA_FLY = [
  { top: "26%", dur: 13, delay: 0 },
  { top: "58%", dur: 17, delay: -9 },
];
function FlyingDryBones({ top, dur, delay }) {
  return (
    <div className="swim-left" style={{ position: "absolute", top, left: 0, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
      <div className="cheep-bob" style={{ position: "relative", animationDelay: `${delay / 3}s` }}>
        <div style={{ position: "relative", transform: "scaleX(-1)" }}>{/* 左向きに飛ぶ。羽はこうら（背中）側 */}
          <Pixel rows={WING} palette={{ W: "#ffffff" }} px={3} className="wing-flap" style={{ position: "absolute", left: -8, top: 12 }} />
          <Pixel rows={DRYBONES} palette={DRYBONES_PAL} px={2} title="羽つきカロン" />
        </div>
      </div>
    </div>
  );
}
// 海のワールドを泳ぐプクプク（top=高さ、dur=横切る秒数、right=右向きに泳ぐ）
const CHEEP_SWIM = [
  { top: "22%", dur: 14, delay: 0, right: false },
  { top: "48%", dur: 19, delay: -8, right: true },
  { top: "70%", dur: 16, delay: -4, right: false },
];
function SwimmingCheep({ top, dur, delay, right }) {
  return (
    <div className={right ? "swim-right" : "swim-left"} style={{ position: "absolute", top, left: 0, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
      <div className="cheep-bob" style={{ animationDelay: `${delay / 3}s` }}>
        <div style={{ transform: right ? "none" : "scaleX(-1)" }}>
          <Pixel rows={CHEEP} palette={{ R: "#f01010", W: "#f8f8f8", T: "#d8b0a8", K: "#000000" }} px={2} title="プクプク" />
        </div>
      </div>
    </div>
  );
}
// ワールドごとの景色。bg=空の色、ground=地面の見た目、extra=景色の飾り
const WORLD_THEMES = {
  1: { name: "草原", bg: "linear-gradient(180deg,#6aa4ff 0%,#9cc8ff 70%,#b9dcff 100%)", clouds: 0.9 },
  2: { name: "砂漠", bg: "linear-gradient(180deg,#f7b955 0%,#fcd98f 65%,#fff0c8 100%)", clouds: 0.35 },
  3: { name: "海", bg: "linear-gradient(180deg,#4fb4f0 0%,#7fd0f8 55%,#b0e6ff 100%)", clouds: 0 },
  4: { name: "雪原", bg: "linear-gradient(180deg,#a9cdf2 0%,#d6e9fb 70%,#f4f9ff 100%)", clouds: 0.7 },
  5: { name: "雲の上", bg: "linear-gradient(180deg,#6cc0ff 0%,#bfe6ff 70%,#e8f6ff 100%)", clouds: 1 },
  6: { name: "溶岩地帯", bg: "linear-gradient(180deg,#f2774a 0%,#ffa66e 60%,#ffd09a 100%)", clouds: 0 },
};
const worldTheme = (w) => WORLD_THEMES[w] || WORLD_THEMES[1];
function Ground({ world }) {
  const base = { position: "absolute", left: 0, right: 0, bottom: 0, height: 30 };
  if (world === 2) return <div style={{ ...base, background: "#e0a448", borderTop: "3px solid #9a6420", backgroundImage: "radial-gradient(#b87a2c 1.5px, transparent 2px)", backgroundSize: "14px 9px" }} />;
  if (world === 3) return <div style={{ ...base, background: "#f0d38e", borderTop: "3px solid #b8954a", backgroundImage: "radial-gradient(#d8b46a 1.5px, transparent 2px)", backgroundSize: "12px 8px" }} />;
  if (world === 4) return <div style={{ ...base, background: "#ffffff", borderTop: "3px solid #8fb4d8", backgroundImage: "linear-gradient(#cfe0f2 2px, transparent 2px), linear-gradient(90deg, #cfe0f2 2px, transparent 2px)", backgroundSize: "30px 15px" }} />;
  if (world === 5) return <div style={{ ...base, height: 34, background: "#ffffff", backgroundImage: "radial-gradient(circle at 15px 0, #ffffff 14px, transparent 15px)", backgroundSize: "30px 30px", boxShadow: "0 -6px 0 -2px #ffffff", borderTop: "none" }} />;
  if (world === 6) return <div style={{ ...base, background: "#4a3434", borderTop: "4px solid #ff5a1a", boxShadow: "0 -6px 14px #ff6a2a88", backgroundImage: "linear-gradient(#2a1c1c 2px, transparent 2px), linear-gradient(90deg, #2a1c1c 2px, transparent 2px)", backgroundSize: "30px 15px" }} />;
  return <div style={{ ...base, background: "#c84c0c", borderTop: "3px solid #3b2a1a", backgroundImage: "linear-gradient(#3b2a1a 2px, transparent 2px), linear-gradient(90deg, #3b2a1a 2px, transparent 2px)", backgroundSize: "30px 15px" }} />;
}
// 景色の飾り（ピラミッド・泡と海藻・雪山と雪・浮かぶ雲・火山と火の粉）。位置は固定の乱数で決める
const DOTS = Array.from({ length: 14 }, (_, i) => ({ left: (i * 37 + 11) % 100, delay: -((i * 1.7) % 9), dur: 7 + (i * 1.3) % 5, size: 4 + (i * 3) % 7 }));
function WorldDecor({ world }) {
  const tri = (style) => <span style={{ position: "absolute", width: 0, height: 0, ...style }} />;
  if (world === 2) return (<>
    <span style={{ position: "absolute", top: 40, right: "12%", width: 54, height: 54, borderRadius: "50%", background: "#fff3b0", boxShadow: "0 0 30px #fff3b0" }} />
    {tri({ left: "4%", bottom: 33, borderLeft: "70px solid transparent", borderRight: "70px solid transparent", borderBottom: "80px solid #d9963e" })}
    {tri({ left: "calc(4% + 90px)", bottom: 33, borderLeft: "44px solid transparent", borderRight: "44px solid transparent", borderBottom: "52px solid #c98632" })}
    <span style={{ position: "absolute", right: "28%", bottom: 33, width: 10, height: 44, background: "#3f9a3a", borderRadius: 5, boxShadow: "-12px -6px 0 -2px #3f9a3a, 12px -12px 0 -2px #3f9a3a" }} />
  </>);
  if (world === 3) return (<>
    {DOTS.map((d, i) => <span key={i} className="bubble-up" style={{ left: `${d.left}%`, width: d.size + 4, height: d.size + 4, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }} />)}
    {CHEEP_SWIM.map((c, i) => <SwimmingCheep key={"c" + i} {...c} />)}
    {[6, 14, 82, 90].map((l, i) => <span key={"w" + i} className="seaweed" style={{ left: `${l}%`, height: 50 + (i % 2) * 22, animationDelay: `${-i * 0.7}s` }} />)}
  </>);
  if (world === 4) return (<>
    {tri({ left: "-2%", bottom: 33, borderLeft: "110px solid transparent", borderRight: "110px solid transparent", borderBottom: "120px solid #e8f1fb" })}
    {tri({ left: "calc(-2% + 150px)", bottom: 33, borderLeft: "80px solid transparent", borderRight: "80px solid transparent", borderBottom: "90px solid #dbe8f6" })}
    {DOTS.map((d, i) => <span key={i} className="snow-fall" style={{ left: `${d.left}%`, width: d.size, height: d.size, animationDuration: `${d.dur + 3}s`, animationDelay: `${d.delay}s` }} />)}
  </>);
  if (world === 5) return (<>
    {PARA_FLY.map((c, i) => <FlyingDryBones key={"p" + i} {...c} />)}
    <Cloud style={{ top: "30%", right: "-14px", opacity: 0.95, transform: "scale(1.3)" }} />
    <Cloud style={{ top: "62%", left: "4%", opacity: 0.85, transform: "scale(1.1)" }} />
    <Cloud style={{ top: "78%", right: "18%", opacity: 0.9 }} />
  </>);
  if (world === 6) return (<>
    {tri({ left: "2%", bottom: 33, borderLeft: "100px solid transparent", borderRight: "100px solid transparent", borderBottom: "110px solid #6a3030" })}
    <span style={{ position: "absolute", left: "calc(2% + 86px)", bottom: 128, width: 28, height: 16, borderRadius: "50%", background: "#ff7a2a", boxShadow: "0 0 18px #ff7a2a" }} />
    {DOTS.map((d, i) => <span key={i} className="ember-up" style={{ left: `${d.left}%`, width: 4, height: 4, animationDuration: `${d.dur - 2}s`, animationDelay: `${d.delay}s` }} />)}
  </>);
  return null;
}
function Scenery({ home = false, rescued = false, world = 1 }) {
  const th = worldTheme(world);
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <WorldDecor world={world} />
      {home && <Castle style={{ right: "3%", bottom: 33 }} rescued={rescued} />}
      {th.clouds > 0 && <>
        <Cloud style={{ top: 26, left: "6%", opacity: th.clouds }} />
        <Cloud style={{ top: 92, right: "8%", opacity: th.clouds * 0.9, transform: "scale(.8)" }} />
        <Cloud style={{ top: "46%", left: "-10px", opacity: th.clouds * 0.7, transform: "scale(.7)" }} />
      </>}
      <Ground world={world} />
      {/* 地面を歩くキャラ：草原・砂漠・雪原はクリボー、溶岩はカロン、海と雲の上はなし */}
      {home && [1, 2, 4].includes(world) && <><WalkingGoomba duration={18} /><WalkingGoomba duration={18} delay={-7} /></>}
      {home && world === 6 && <><WalkingDryBones duration={20} /><WalkingDryBones duration={20} delay={-8} /></>}
    </div>
  );
}
// ワールドが変わる演出：黒い画面に「WORLD N」とマリオ（本家のステージ開始画面風）
function WorldIntro({ world }) {
  return (
    <div className="world-intro" aria-live="polite" style={{ position: "fixed", inset: 0, zIndex: 120, background: "#000", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, fontFamily: "ui-monospace, Menlo, monospace" }}>
      <div style={{ fontSize: 15, letterSpacing: 4, opacity: 0.8 }}>NEXT WORLD</div>
      <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 4 }}>WORLD {world}-1</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Hero who="mario" px={3} />
        <span style={{ fontSize: 18, fontWeight: 800 }}>{worldTheme(world).name}</span>
      </div>
    </div>
  );
}

// ── BGM（矩形波のループ。先読みスケジューラで途切れずに鳴らす） ──
//   譜面は [音名, 長さ(8分音符の数)]。"r" は休符。
const NOTE_INDEX = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
function noteFreq(n) {
  const m = /^([A-G]#?)(\d)$/.exec(n);
  return m ? 440 * Math.pow(2, (NOTE_INDEX[m[1]] + (+m[2] + 1) * 12 - 69) / 12) : 0;
}
const seq = (str, len = 1) => str.trim().split(/\s+/).map((t) => { const [n, l] = t.split(":"); return [n, l ? +l : len]; });
const OVERWORLD_A = seq("C5 r r G4 r r E4 r r A4 r B4 r A#4 A4 r G4:1.33 E5:1.33 G5:1.34 A5 r F5 G5 r E5 r C5 D5 B4 r r");
const TRACKS = {
  // 地上のテーマ：イントロ → A → A → B
  overworld: { eighth: 0.15, notes: [
    ...seq("E5 E5 r E5 r C5 E5 r G5 r r r G4 r r r"),
    ...OVERWORLD_A, ...OVERWORLD_A,
    ...seq("r r G5 F#5 F5 D#5 r E5 r G#4 A4 C5 r A4 C5 D5 r r G5 F#5 F5 D#5 r E5 r C6 r C6 C6 r r r"),
    ...seq("r r G5 F#5 F5 D#5 r E5 r G#4 A4 C5 r A4 C5 D5 r r D#5 r r D5 r r C5 r r r r r r r"),
  ] },
  // 地下のテーマ（楽譜どおり：3/4拍子・♩=100、ここだけ1単位＝16分音符）。7小節でループ
  underground: { eighth: 0.15, notes: [
    ...seq("C4 C5 A3 A4 A#3 A#4 r:2 r:4"), ...seq("C4 C5 A3 A4 A#3 A#4 r:2 r:4"),
    ...seq("F3 F4 D3 D4 D#3 D#4 r:2 r:4"), ...seq("F3 F4 D3 D4 D#3 D#4 r:2 r:2"),
    ...seq("D#4 D4 C#4", 2 / 3),                    // 16分の3連符
    ...seq("C4 D#4 D4 G#3 G3 C#4", 2),              // 8分音符
    ...seq("C4 F#4 F4 E4 A#4 A4", 2 / 3),           // 16分の3連符
    ...seq("G#4 D#4 B3 A#3 A3 G#3", 4 / 3),         // 8分の3連符
    ...seq("r:12"),                                 // 1小節休み
  ] },
  // 城の雰囲気（オリジナル）：半音でうごめく短調のループ
  castle: { eighth: 0.13, notes: seq("A3 C4 D#4 E4 D#4 C4 A3 r A#3 C#4 E4 F4 E4 C#4 A#3 r A3 C4 D#4 E4 F4 E4 D#4 C4 B3 D4 F4 G#4 F4 D4 B3 r") },
};
const BGM = (() => {
  let cur = null, timer = null, out = null, idx = 0, nextT = 0;
  const ctx = () => (audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)());
  function schedule() {
    const c = ctx(), tr = TRACKS[cur];
    if (!tr) return;
    while (nextT < c.currentTime + 0.3) {
      const [n, l] = tr.notes[idx];
      const d = l * tr.eighth, f = noteFreq(n);
      if (f) {
        const o = c.createOscillator(), g = c.createGain();
        o.type = tr.wave || "square"; o.frequency.value = f;
        g.gain.setValueAtTime(0.05 * (tr.gain || 1), nextT);
        g.gain.exponentialRampToValueAtTime(0.001, nextT + d * 0.95);
        o.connect(g).connect(out);
        o.start(nextT); o.stop(nextT + d);
      }
      nextT += d;
      idx = (idx + 1) % tr.notes.length;
    }
  }
  function stop() {
    clearInterval(timer); timer = null; cur = null;
    if (out) { const g = out; try { g.gain.setTargetAtTime(0, ctx().currentTime, 0.05); } catch (e) {} setTimeout(() => g.disconnect(), 400); out = null; }
  }
  function play(name, vol) {
    try {
      const c = ctx();
      if (c.state === "suspended") c.resume();
      if (cur === name && out) { out.gain.setTargetAtTime(vol, c.currentTime, 0.2); return; }
      stop();
      cur = name; idx = 0; nextT = c.currentTime + 0.1;
      out = c.createGain(); out.gain.value = vol; out.connect(c.destination);
      timer = setInterval(schedule, 60); schedule();
    } catch (e) {}
  }
  return { play, stop };
})();
// 自動再生制限で止まった AudioContext を、最初の操作で再開する
if (typeof window !== "undefined" && window.addEventListener) {
  const resume = () => { try { if (audioCtx && audioCtx.state === "suspended") audioCtx.resume(); } catch (e) {} };
  window.addEventListener("pointerdown", resume);
  window.addEventListener("keydown", resume);
}

// ── コースクリア演出：旗ポールを滑り降りるマリオ＋左右からクラッカー ──
const CONFETTI_COLORS = ["#e52521", "#fbd000", "#43b047", "#2038ec", "#f878b0", "#ffffff", "#f8b800"];
function Confetti({ base = 0 }) {
  // 左右の下から斜め上に打ち出す紙片。2波（base+0.1秒・base+1.3秒）に分けて発射
  const pieces = useMemo(() => {
    const out = [];
    for (const side of ["left", "right"]) {
      for (let i = 0; i < 44; i++) {
        const dir = side === "left" ? 1 : -1;
        out.push({
          side, key: `${side}${i}`,
          dx: dir * (90 + Math.random() * 300),
          dy: -(220 + Math.random() * 360),
          r: (Math.random() * 720 - 360) | 0,
          w: 6 + Math.random() * 6, h: 4 + Math.random() * 8,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          delay: base + (i % 2 ? 1.3 : 0.1) + Math.random() * 0.15,
          dur: 1.6 + Math.random() * 0.8,
        });
      }
    }
    return out;
  }, [base]);
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none", overflow: "hidden" }}>
      {pieces.map((p) => (
        <span key={p.key} className="confetti" style={{ [p.side]: 6, bottom: 70, width: p.w, height: p.h, background: p.color,
          "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--r": `${p.r}deg`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
      ))}
    </div>
  );
}
function CourseClear() {
  return (
    <div className="card-in" style={{ marginTop: 14 }}>
      <Confetti />
      {/* 旗ポール：マリオが滑り降り、旗も一緒に下がる → 地面でジャンプ */}
      <div aria-hidden="true" style={{ position: "relative", width: 180, height: 200, margin: "0 auto" }}>
        <span style={{ position: "absolute", left: 88, top: 0, width: 12, height: 12, borderRadius: "50%", background: "#43b047", border: "2px solid #0b3d0b", boxSizing: "border-box" }} />
        <span style={{ position: "absolute", left: 92, top: 10, width: 4, height: 170, background: "#7ed957", borderLeft: "1px solid #1f8a2a", borderRight: "1px solid #1f8a2a" }} />
        <span style={{ position: "absolute", left: 82, top: 178, width: 24, height: 22, background: "#a8501c", border: "2px solid #3b2a1a", boxSizing: "border-box" }} />
        <span className="flag-down" style={{ position: "absolute", left: 60, width: 32, height: 26, background: "#ffffff", clipPath: "polygon(100% 0,100% 100%,0 50%)" }}>
          <span style={{ position: "absolute", right: 5, top: 8, width: 10, height: 10, borderRadius: "50%", background: "#1f9e3a" }} />
        </span>
        <div className="mario-slide" style={{ position: "absolute", left: 96 }}>
          <div className="mario-hop"><Hero who="mario" px={3} /></div>
        </div>
      </div>
      <div className="clear-title" style={{ fontSize: 30, fontWeight: 900, letterSpacing: 2, color: "#fff", textShadow: "2px 2px 0 #e52521, 4px 4px 0 #3b2a1a", marginTop: 8 }}>COURSE CLEAR!</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: "#1f9e3a", marginTop: 4 }}>🚩 ゴールの旗をゲット！</div>
    </div>
  );
}

// ── かめおの城クリア演出：橋が崩れてクッパが溶岩へ → ピーチ登場 ──
//   既定スタイル＝最終状態（reduced-motion でも結末が見える）。keyframes の from が開始状態。
const BRIDGE_SEGS = 10;
//   mode: "another"＝まだ救出前（ピーチは別の城）/ "rescue"＝今回で救出達成 / "thanks"＝救出済みで再挑戦
function CastleClear({ gold, mode = "another", remaining = 0, treasure = null }) {
  const rescue = mode === "rescue";
  return (
    <div className="card-in" style={{ marginTop: 14 }}>
      {(gold || rescue) && <Confetti base={rescue ? 3.4 : treasure && treasure.got ? 4.5 : 2.3} />}
      <div aria-hidden="true" style={{ position: "relative", width: 290, height: 196, margin: "0 auto", overflow: "hidden", borderRadius: 10, border: "3px solid #3b2a1a", background: "#1a1020" }}>
        {/* 溶岩 */}
        <div className="lava" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 40 }} />
        {/* 左右の足場 */}
        <div style={{ position: "absolute", left: 0, top: 120, width: 64, bottom: 0, background: "#8c8c8c", borderRight: "2px solid #3a3a3a",
          backgroundImage: "linear-gradient(#4a4a4a 2px, transparent 2px), linear-gradient(90deg, #4a4a4a 2px, transparent 2px)", backgroundSize: "16px 10px" }} />
        <div style={{ position: "absolute", right: 0, top: 120, width: 46, bottom: 0, background: "#8c8c8c", borderLeft: "2px solid #3a3a3a",
          backgroundImage: "linear-gradient(#4a4a4a 2px, transparent 2px), linear-gradient(90deg, #4a4a4a 2px, transparent 2px)", backgroundSize: "16px 10px" }} />
        {/* 橋（右から順に崩れる） */}
        {Array.from({ length: BRIDGE_SEGS }, (_, i) => (
          <span key={i} className="bridge-seg" style={{ position: "absolute", top: 120, left: 64 + i * 18, width: 18, height: 9,
            background: "#a8501c", border: "2px solid #3b2a1a", boxSizing: "border-box", animationDelay: `${0.3 + (BRIDGE_SEGS - 1 - i) * 0.09}s` }} />
        ))}
        {/* 斧 */}
        <span className={mode === "thanks" ? "axe-out" : ""} style={{ position: "absolute", right: 12, top: 90, fontSize: 24 }}>🪓</span>{/* 宝箱が出るときは消す */}
        {/* クッパ（溶岩へ落ちる） */}
        <div className="bowser-fall" style={{ position: "absolute", left: 128, top: 66 }}>
          <Pixel rows={BOWSER.map((r) => r.padEnd(20, "."))} palette={PALETTES.bowser} px={3} />
        </div>
        {/* マリオ（クッパが落ちたらジャンプ） */}
        <div style={{ position: "absolute", left: 12, top: 72 }}>
          <div className="castle-hop"><Hero who="mario" px={3} /></div>
        </div>
        {mode === "another" ? (
          /* まだ救出前：ピーチは別の城に */
          <span className="peach-in" style={{ position: "absolute", left: 70, right: 8, top: 14, background: "#fff", border: "2px solid #3b2a1a", borderRadius: 8, padding: "5px 8px", fontSize: 11.5, fontWeight: 800, color: "#1f1a14", lineHeight: 1.5, textAlign: "left" }}>
            ありがとう ゆーくん！<br />でも ピーチ姫は べつの城に いるよ…
          </span>
        ) : mode === "thanks" ? (
          /* 救出後：ピーチの代わりに宝箱（裏仕様：9割以上を10回で開く。回数はどこにも出さない） */
          <>
            {(() => {
              // まだ開かない宝箱：回数は見せず、近づくほど揺れと光とひと言が変わって「続けると何かありそう」と思わせる
              // 救出後のクリア回数ごとに毎回ようすが変わる（0〜1回目→4回目でだんだん激しく、5回目で開く）
              const c = treasure ? treasure.count : 0, open = !!(treasure && treasure.open);
              const stage = open ? 0 : Math.max(1, Math.min(4, c));
              const hint = ["", "……宝箱がある。びくともしない", "宝箱が カタッと うごいた…？", "宝箱が ガタガタ ゆれている…！", "宝箱から 光がもれている…！"][stage];
              return (<>
                <div className="peach-in" style={{ position: "absolute", right: 2, top: 84 }}>
                  <div className={stage ? `chest-shake chest-shake${stage}` : ""} style={{ filter: stage === 4 ? "drop-shadow(0 0 8px #fff6a0)" : "none" }}>
                    <Chest open={open} px={3} />
                  </div>
                </div>
                {stage > 0 && (
                  <span className="peach-in" style={{ position: "absolute", right: 8, top: 18, background: "#fff", border: "2px solid #a8501c", borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 800, color: "#1f1a14", whiteSpace: "nowrap" }}>{hint}</span>
                )}
              </>);
            })()}
            {treasure && treasure.got && (
              <span className="peach-in" style={{ position: "absolute", right: 52, top: 18, background: "#fff", border: "2px solid #f8c800", borderRadius: 8, padding: "2px 8px", fontSize: 11.5, fontWeight: 800, color: "#1f1a14", whiteSpace: "nowrap" }}>
                宝を手に入れた！王冠とマントだ！
              </span>
            )}
          </>
        ) : (
          <>
            {/* ピーチ（右の足場に登場） */}
            <div className="peach-in" style={{ position: "absolute", right: 5, top: 60 }}>
              <Pixel rows={PEACH} palette={PALETTES.peach} px={3} />
            </div>
            <span className="peach-in" style={{ position: "absolute", right: 52, top: 18, background: "#fff", border: "2px solid #f878b0", borderRadius: 8, padding: "2px 8px", fontSize: 11.5, fontWeight: 800, color: "#1f1a14", whiteSpace: "nowrap" }}>
              {rescue ? "ありがとう ゆーくん！" : "また来てくれたのね！"}
            </span>
          </>
        )}
        {treasure && treasure.got && (
          /* 宝を手に入れたシーン：ふたが開いて王冠が飛び出したあと、金色の画面に王様のゆーくん */
          <div className="treasure-scene" style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, #fff6c0, #f8c800 70%, #d98e00)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span className="treasure-sparkle" style={{ fontSize: 26 }}>✨</span>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 6 }}>
              <KingHero px={3} pose="idle" />
              <Chest open px={2} />
            </div>
            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 900, letterSpacing: 1, color: "#7a3d00" }}>TREASURE GET!</div>
            <div style={{ marginTop: 2, fontSize: 12, fontWeight: 800, color: "#3b2a1a" }}>王冠と王様のマントを手に入れた！</div>
          </div>
        )}
        {rescue && (
          /* 救出シーン：マリオとピーチが並び、ハートが浮かぶ */
          <div className="rescue-scene" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#ffd6ea,#ffeef6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span className="heart-pop" style={{ fontSize: 30 }}>❤️</span>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 4 }}>
              <Hero who="mario" px={3} pose="idle" />
              <Pixel rows={PEACH} palette={PALETTES.peach} px={3} className="hero idle" style={{ animationDelay: ".3s" }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 900, letterSpacing: 1, color: "#c83c78" }}>THANK YOU YU-KUN!</div>
          </div>
        )}
      </div>
      <div className="clear-title castle-title" style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1, color: "#fff", textShadow: "2px 2px 0 #e52521, 4px 4px 0 #3b2a1a", marginTop: 10 }}>
        {rescue ? "ピーチ姫を救出！" : treasure && treasure.got ? "宝を手に入れた！" : "かめおをたおした！"}
      </div>
      <div style={{ fontSize: 15, fontWeight: 900, color: gold ? "#d98e00" : "#1f9e3a", marginTop: 4 }}>
        {gold ? "👑 王冠ゲット！" : "⭐ スターゲット！"}
        {mode === "another" && <span style={{ color: "#1f1a14" }}> ・ あと{remaining}回でピーチ姫を救出</span>}
        {rescue && <span style={{ color: "#c83c78" }}> ・ 修了バッジ{EXAM_SLOTS}個コンプリート！</span>}
      </div>
      {gold && <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{EXAM_GOLD}問以上の豪華バッジ ✨</div>}
    </div>
  );
}

// キャラの吹き出し
function Bubble({ who = "mario", children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
      <Hero who={who} px={3} style={{ flex: "0 0 auto" }} />
      <div className="bubble" style={{ borderColor: who === "mario" ? "#e52521" : "#20a030" }}>{children}</div>
    </div>
  );
}

// ── 効果音（Web Audio で矩形波を合成。音源ファイル不要） ──
let audioCtx = null;
// 勝利演出の音（ジングル・クラッカー等）はこの経路にまとめ、画面を離れたら stopJingles で一斉に消す
let jingleBus = null;
function jingleOut() {
  if (!jingleBus) { jingleBus = audioCtx.createGain(); jingleBus.connect(audioCtx.destination); }
  return jingleBus;
}
function stopJingles() {
  if (!jingleBus) return;
  const b = jingleBus; jingleBus = null;
  try { b.gain.setTargetAtTime(0, audioCtx.currentTime, 0.03); } catch (e) {}
  setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 300);
}
function tone(seq, jingle = false) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const dest = jingle ? jingleOut() : audioCtx.destination;
    let t = audioCtx.currentTime;
    for (const [freq, dur, slideTo] of seq) {
      if (!freq) { t += dur; continue; }  // 0 = 休符
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(dest);
      o.start(t); o.stop(t + dur);
      t += dur;
    }
  } catch (e) {}
}
// 譜面（seq 記法）→ tone 用の [周波数, 秒] 列
const melody = (str, eighth) => seq(str).map(([n, l]) => [noteFreq(n), l * eighth]);
const SFX = {
  coin: () => tone([[988, 0.07], [1319, 0.35]]),
  damage: () => tone([[494, 0.1], [370, 0.1], [262, 0.25, 130]]),
  jump: () => tone([[300, 0.18, 900]]),
  clear: () => tone([[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.12], [784, 0.1], [1047, 0.35]], true),
  pipe: () => tone([[392, 0.08], [262, 0.08], [196, 0.18]], true),
  flagpole: () => tone([[1568, 0.9, 196]], true),
  select: () => tone([[1047, 0.035], [1568, 0.05]]),
  back: () => tone([[1047, 0.06]]),
  // コースクリア（旗のあと）／かめおの城クリア（落下のあと）：ステージクリアの曲
  stageClear: () => tone(melody("G3 C4 E4 G4 C5 E5 G5:3 E5:3 G#3 C4 D#4 G#4 C5 D#5 G#5:3 D#5:3 A#3 D4 F4 A#4 D5 F5 A#5:3 A#5 A#5 A#5 C6:6", 0.1), true),
  // 土管に入る（テスト開始）：低い「ボッ」を3回、それぞれ下へ滑らせる
  warp: () => tone([[330, 0.12, 110], [0, 0.05], [330, 0.12, 110], [0, 0.05], [330, 0.16, 98]]),
  bridge: () => tone(Array.from({ length: 10 }, (_, i) => [260 - i * 12, 0.09]), true),
  fall: () => tone([[700, 0.9, 70]], true),
  popper: () => {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const len = Math.floor(audioCtx.sampleRate * 0.25);
      const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = audioCtx.createBufferSource(), g = audioCtx.createGain();
      g.gain.value = 0.25;
      src.buffer = buf; src.connect(g).connect(jingleOut()); src.start();
    } catch (e) {}
  },
};

// 問題文中の識別キー（複数）に下線を引く。keys が空/未指定なら素のテキスト。
function Highlight({ text, keys, color, on, variant = "underline" }) {
  if (!on || !keys || keys.length === 0) return <>{text}</>;
  // 出現位置を集めて重複・重なりを除去
  const ranges = [];
  for (const k of keys) {
    if (!k) continue;
    let from = 0, idx;
    while ((idx = text.indexOf(k, from)) !== -1) {
      ranges.push([idx, idx + k.length]);
      from = idx + k.length;
    }
  }
  if (ranges.length === 0) return <>{text}</>;
  ranges.sort((a, b) => a[0] - b[0]);
  // 重なりをマージ
  const merged = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]);
    else merged.push(ranges[i]);
  }
  const parts = [];
  let pos = 0;
  merged.forEach(([s, e], i) => {
    if (s > pos) parts.push(<span key={"n" + i}>{text.slice(pos, s)}</span>);
    const hStyle = variant === "marker"
      ? { background: color, color: "#15140a", fontWeight: 800, borderRadius: 3, padding: "1px 3px", WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }
      : variant === "soft"
      ? { color, fontWeight: 700 } // 下線なし・太字・色のみ（リンク誤認を避ける）
      : { color, borderBottom: `2px solid ${color}`, fontWeight: 800 };
    parts.push(<span key={"h" + i} style={hStyle}>{text.slice(s, e)}</span>);
    pos = e;
  });
  if (pos < text.length) parts.push(<span key="tail">{text.slice(pos)}</span>);
  return <>{parts}</>;
}

// ════════════════════════════════════════════════════════════════
//  学習モデル: ブロック単位で「覚える→テスト」を反復。
//   ・覚える: 1ページ10問のリスト。正解肢と正誤箇所（黄マーカー）を表示。
//   ・テスト: 同じブロックの問題をまるごと出題。とにかく覚えるテスト。
//   ・バッジ: テスト正答率90%以上でそのブロックに🚩（localStorageで永続化）。
// ════════════════════════════════════════════════════════════════
const PAGE_SIZE = 10;      // 覚える画面の1ページ表示数
const PASS_PCT = 90;       // バッジ獲得ライン（正答率%）
// 総合テスト（模試）: 全範囲から EXAM_SIZE 問。EXAM_PASS 以上で合格＝修了バッジ(銀)、EXAM_GOLD 以上で金バッジ。
// 本番は解答40問・6割（24問）で合格。
const EXAM_SIZE = 40;      // 出題数
const EXAM_PASS = 24;      // 合格ライン（6割）
const EXAM_GOLD = 32;      // 金バッジライン（8割・豪華演出）
const EXAM_SLOTS = 5;      // 修了バッジのコレクション枠
const RANDOM_BLOCK_N = 20; // ランダム演習（復習用）: 選んだブロックからランダム出題する固定数

// 配列をシャッフルして新配列を返す（Fisher–Yates・非破壊）。ランダム出題で使用。
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 覚える画面の1問カード。
//  ・問題文をクリック → 全選択肢を展開（正解の「見分けポイント」に下線）。
//    「下線だけ見れば、他の選択肢の中から答えを選べる」を自分で確認するため。
//  ・答えはホバー/タップで表示（赤シート式）。
function StudyCard({ q, mono, flagged, onToggleFlag }) {
  const [showChoices, setShowChoices] = useState(true); // 暗記のテンポ優先：最初から正解の選択肢を開いておく（折りたたみも可）
  const ansSet = new Set(q.answer);
  return (
    <div style={{ background: "#ffffff", border: `3px solid ${flagged ? "#d98e00" : "#3b2a1a"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 12, boxShadow: "0 4px 0 #3b2a1a55" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.4, marginBottom: 6 }}>
        <span>{q.source}・{q.category}</span>
        <span style={{ color: "#43b047", opacity: 0.8 }}>{showChoices ? "▲ 閉じる" : "▼ クリックで選択肢"}</span>
      </div>
      <div onClick={() => setShowChoices((s) => !s)}
        style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.75, whiteSpace: "pre-wrap", cursor: "pointer", letterSpacing: 0.2 }}>
        <Highlight text={q.question} keys={q.answerKeys} color="#1a5fd0" on={true} variant="soft" />
      </div>

      {/* 要復習フラグ: 覚える画面でもいつでも目立つ場所でON/OFF。正解・不正解に関係なく手動管理・自動では外れない。 */}
      <button onClick={onToggleFlag} aria-pressed={!!flagged}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", marginTop: 10, padding: "9px 0", borderRadius: 10, cursor: "pointer",
          fontSize: 13, fontWeight: 800, transition: "background .15s, border-color .15s, box-shadow .15s",
          background: flagged ? "linear-gradient(90deg,#f0a000,#d98e00)" : "#fff8e7",
          border: `1.5px solid ${flagged ? "#d98e00" : "#3b2a1a"}`,
          color: flagged ? "#3b2a1a" : "#3b3024",
          boxShadow: flagged ? "0 0 14px #d98e0055" : "none" }}>
        {flagged ? "🔖 要復習に登録中（押して解除）" : "🔖 要復習に追加する"}
      </button>

      {/* 問題文クリックで展開: 全選択肢（正解＝緑、見分けポイントに下線）。記述式は答えを表示。 */}
      {showChoices && (
        <div className="card-in" style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {q.choices.map((c) => {
            const correct = ansSet.has(c.label);
            return (
              <div key={c.label} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "7px 11px", borderRadius: 9,
                background: correct ? "#e3f7df" : "transparent", border: `1px solid ${correct ? "#1f9e3a55" : "#d9c7a0"}` }}>
                <span style={{ fontSize: 11, color: correct ? "#1f9e3a" : "#9a8a70", minWidth: 14, textAlign: "center", fontWeight: 800 }}>{c.label}</span>
                <span style={{ fontSize: 15, fontFamily: mono, lineHeight: 1.5, color: correct ? "#1f1a14" : "#4a3d2e" }}>
                  {correct ? <Highlight text={c.text} keys={hintsFor(q, c.label)} color="#ffd84a" on={true} variant="marker" /> : c.text}
                </span>
              </div>
            );
          })}
          {q.mnemonic && (
            <div style={{ marginTop: 4, fontSize: 13, color: "#6b4a00", background: "#fff4c2", border: "1px solid #e0b000", borderRadius: 10, padding: "8px 12px", lineHeight: 1.6 }}>💡 {q.mnemonic}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const questions = QUESTIONS;
  // ブロックは questions.js の q.block（3回分ずつ6グループ × 各3ブロック・分野比率を揃えて分割済み）。
  //   sections[i] = ブロックiの問題配列 / sectionLabels[i] = "ワールド G-N"（グループG の N 番目）
  //   blocks[i]   = { no, kind(グループ名), size, chapSpan(対象回), chunkCount }
  const { sections, sectionLabels, blocks } = useMemo(() => {
    const secs = BLOCKS.map((b) => questions.filter((q) => q.block === b.no));
    const course = BLOCKS.map((b, i) => `${b.group}-${BLOCKS.slice(0, i + 1).filter((x) => x.group === b.group).length}`);
    const labels = course.map((c) => `ワールド ${c}`);
    const blks = BLOCKS.map((b, i) => ({
      no: b.no,
      course: course[i],
      kind: `グループ${b.group}`,
      group: b.group,
      size: secs[i].length,
      chapSpan: b.span,
      chunkCount: Math.max(1, Math.ceil(secs[i].length / PAGE_SIZE)),
    }));
    return { sections: secs, sectionLabels: labels, blocks: blks };
  }, [questions]);

  const [screen, setScreen] = useState("home"); // home | testpick | study | test | result
  const [secIdx, setSecIdx] = useState(0);
  const [pickedSec, setPickedSec] = useState(null); // ホームのグリッドで開いているブロック（null=未選択）
  const [pickChunks, setPickChunks] = useState(() => new Set()); // testpick で選択中のチャンクindex集合

  // バッジ/最高スコア（localStorageで永続化）。8ブロック化で index 体系が変わるため新キーに移行。
  const [records, setRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kankouji-records-blk") || "{}"); } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem("kankouji-records-blk", JSON.stringify(records)); } catch (e) {}
  }, [records]);

  // 総合テスト（模試）の修了バッジ。"silver"(42〜49) / "gold"(50〜) を最大 EXAM_SLOTS 枠まで貯める。localStorageで永続化。
  const [examSlots, setExamSlots] = useState(() => {
    try { const v = JSON.parse(localStorage.getItem("kankouji-exam") || "[]"); return Array.isArray(v) ? v.slice(0, EXAM_SLOTS) : []; } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem("kankouji-exam", JSON.stringify(examSlots)); } catch (e) {}
  }, [examSlots]);

  // 間違えた問題（id→true）。テストで誤答→追加、正解→除去。localStorageで永続化。
  const [wrongIds, setWrongIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kankouji-wrong") || "{}"); } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem("kankouji-wrong", JSON.stringify(wrongIds)); } catch (e) {}
  }, [wrongIds]);

  // 効果音の ON/OFF（localStorageで永続化）
  const [soundOn, setSoundOn] = useState(() => {
    try { return localStorage.getItem("kankouji-sound") === "on"; } catch { return false; }  // 初めは効果音もオフ
  });
  useEffect(() => {
    try { localStorage.setItem("kankouji-sound", soundOn ? "on" : "off"); } catch (e) {}
  }, [soundOn]);
  const play = (name) => { if (soundOn) SFX[name](); };
  function toggleSound() { setSoundOn((v) => { if (!v) SFX.coin(); return !v; }); }
  // 曲：覚える（暗記カード）＝地上、テスト（覚えるの10問テストも）＝地下、かめおの城＝城（全コース共通）
  function testTrack() {
    return testMode === "exam" || testMode === "exammiss" ? "castle" : "underground";
  }

  // 操作音：ボタンを押すと data-sfx の音（未指定は "select"、"none" は鳴らさない）
  useEffect(() => {
    const h = (e) => {
      const b = e.target && e.target.closest ? e.target.closest("button") : null;
      if (!b || b.disabled) return;
      const k = b.dataset.sfx || "select";
      if (k !== "none" && soundOn && SFX[k]) SFX[k]();
    };
    document.addEventListener("click", h, true);
    return () => document.removeEventListener("click", h, true);
  }, [soundOn]);

  // BGM の ON/OFF（効果音とは別。初期は OFF）
  const [bgmOn, setBgmOn] = useState(() => {
    try { return localStorage.getItem("kankouji-bgm") === "on"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem("kankouji-bgm", bgmOn ? "on" : "off"); } catch (e) {}
  }, [bgmOn]);

  // 要復習フラグ（id→true）。正解・不正解に関係なくユーザーが手動でON/OFF。自動では外れない・localStorageで永続化。
  const [flaggedIds, setFlaggedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kankouji-flagged") || "{}"); } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem("kankouji-flagged", JSON.stringify(flaggedIds)); } catch (e) {}
  }, [flaggedIds]);
  function toggleFlag(id) {
    setFlaggedIds((f) => { const n = { ...f }; if (n[id]) delete n[id]; else n[id] = true; return n; });
  }

  // 暗記モード: 10問ずつ「覚える→テスト」を繰り返す
  const [studyChunk, setStudyChunk] = useState(0);       // 現在の10問セット
  const [studySub, setStudySub] = useState("learn");     // learn | quizdone
  const [quizScore, setQuizScore] = useState(null);      // 暗記内テストの点 {correct,total}
  // セットごとの学習状態（localStorageで永続化）。studyProgress[secIdx][chunk] = 一発正解できなかった問題ID配列。
  //   undefined=未挑戦 / []=全問一発正解(完了) / [id,...]=ミスが残っている
  const [studyProgress, setStudyProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kankouji-study-blk") || "{}"); } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem("kankouji-study-blk", JSON.stringify(studyProgress)); } catch (e) {}
  }, [studyProgress]);

  // テスト/クイズ共通ランナー状態
  const [testQueue, setTestQueue] = useState([]);        // 出題中の問題配列
  const [testMode, setTestMode] = useState("section");   // section(章・バッジ) | study(10・暗記)
  const [testPos, setTestPos] = useState(0);
  const [testResults, setTestResults] = useState([]);    // [{id, ok}]
  const [phase, setPhase] = useState("answer");          // answer | reveal
  const [multiSel, setMultiSel] = useState([]);
  const [cursor, setCursor] = useState(0);               // PC操作：矢印でハイライト中の選択肢index
  const [lastOk, setLastOk] = useState(null);
  const [lastInput, setLastInput] = useState(null);      // 直近のユーザー回答（選択肢の印用）
  const [lastScore, setLastScore] = useState(null);      // セクション結果画面用
  const [retry, setRetry] = useState(false);             // 暗記10問テストで同じ問題をやり直し中（採点には影響させない）
  const [fullBlock, setFullBlock] = useState(true);      // 直近のsectionテストがブロック全問か（🏅バッジ判定用）

  // ランダム出題モード
  const [randomLabel, setRandomLabel] = useState("");    // 実行中のスコープ表示名（"総合" or "ブロックN"）
  const [lastRandom, setLastRandom] = useState(null);    // 再実行用 {scopeIdx, count}

  const secQuestions = sections[secIdx] || [];
  const chunkCount = Math.max(1, Math.ceil(secQuestions.length / PAGE_SIZE));
  const chunkQs = secQuestions.slice(studyChunk * PAGE_SIZE, studyChunk * PAGE_SIZE + PAGE_SIZE);
  const badgeCount = Object.values(records).filter((r) => r && r.badge).length;
  const wrongList = questions.filter((q) => wrongIds[q.id]); // 間違えた問題
  const flaggedList = questions.filter((q) => flaggedIds[q.id]); // 要復習フラグを付けた問題（手動で外すまで残る）

  // ── 覚える進捗（セット単位） ──
  const blockChunks = (i) => Math.max(1, Math.ceil((sections[i] || []).length / PAGE_SIZE)); // そのブロックのセット数
  const setDoneCount = (i) => {  // 全問一発正解でクリアしたセット数
    const p = studyProgress[i] || {};
    let n = 0;
    for (let k = 0; k < blockChunks(i); k++) { const m = p[k]; if (m && m.length === 0) n++; }
    return n;
  };
  const setDots = (i) => {  // 各セットの状態ドット（● 完了 / ◐ ミス残り / ○ 未着手）
    const p = studyProgress[i] || {};
    return Array.from({ length: blockChunks(i) }, (_, k) => {
      const m = p[k];
      const done = m && m.length === 0, partial = m && m.length > 0;
      const color = done ? "#1f9e3a" : partial ? "#d98e00" : "#5e4f3c";
      return <span key={k} aria-hidden="true" style={{ fontSize: 14, lineHeight: 1, color }}>{done ? "●" : partial ? "◐" : "○"}</span>;
    });
  };

  // ── 総合テストの修了バッジ表示 ──
  const examGoldCount = examSlots.filter((s) => s === "gold").length;
  const examComplete = examSlots.length >= EXAM_SLOTS;                 // 5枠コンプ
  // 裏仕様：かめおの城を累計10回クリア（＝ピーチ救出の5回＋その後の5回）で宝箱が開き、トップのゆーくんが王冠と赤いマントに
  const TREASURE_NEED = EXAM_SLOTS;  // 救出後にクリアする回数
  const [treasure, setTreasure] = useState(() => { try { return +localStorage.getItem("kankouji-treasure") || 0; } catch { return 0; } });
  useEffect(() => { try { localStorage.setItem("kankouji-treasure", String(treasure)); } catch (e) {} }, [treasure]);
  const hasTreasure = treasure >= TREASURE_NEED;
  // 今いるワールド＝まだ3コースともクリアしていない一番若いワールド（全部クリアなら最後のワールド）
  const groupNos = [...new Set(blocks.map((b) => b.group))];
  const groupCleared = (g) => blocks.every((b, k) => b.group !== g || (records[k] && records[k].badge));
  const clearedWorld = groupNos.find((g) => !groupCleared(g)) || groupNos[groupNos.length - 1] || 1;
  const [pendingWorld, setPendingWorld] = useState(null);   // ワールドを全クリアした直後：ホームに戻ったら演出
  const [worldIntro, setWorldIntro] = useState(null);       // 演出中のワールド番号
  // 演出の途中は前のワールドの景色のまま、演出が終わってから新しい景色へ
  // トップの景色＝今いるワールド（演出の途中は前のワールドのまま、演出が終わってから新しい景色へ）
  // ピーチを救出したあとは、平和になった草原（ワールド1）の景色に戻る
  const currentWorld = worldIntro ? worldIntro : pendingWorld ? pendingWorld - 1 : examComplete ? 1 : clearedWorld;
  // ワールドの解放：前のワールドを3コースともクリアすると次のワールドに進める
  const isLocked = (k) => !!blocks[k] && blocks[k].group > clearedWorld;
  const allWorldsCleared = groupNos.every(groupCleared);   // かめおの城は全ワールドクリアで挑戦できる
  // 【確認用・公開前に削除】?debug=1 でテスト中に「全問正解で終える」「6割正解で終える」、トップに「記録をリセット」
  const [debug] = useState(() => new URLSearchParams(location.search).get("debug") === "1");
  const [debugFinish, setDebugFinish] = useState(false);
  function debugEnd(ratio) {
    const n = Math.ceil(testQueue.length * ratio);
    setTestResults(testQueue.map((q, k) => ({ id: q.id, ok: k < n })));
    setTestPos(testQueue.length - 1); setDebugFinish(true);
  }
  // コースを開いた先（覚える・テスト選択・テスト・結果・演出）は、そのコースのワールドの景色
  const courseWorld = (() => {
    if (screen === "home") return null;
    if (screen === "study" || screen === "testpick") return blocks[secIdx] && blocks[secIdx].group;
    if (screen === "test" || screen === "result") {
      if (testMode === "section" || testMode === "study") return blocks[secIdx] && blocks[secIdx].group;
      if (testMode === "random" && lastRandom && lastRandom.scopeIdx >= 0) return blocks[lastRandom.scopeIdx] && blocks[lastRandom.scopeIdx].group;
    }
    return null;
  })();
  const sceneWorld = worldIntro ? currentWorld : courseWorld || currentWorld;
  useEffect(() => {
    if (screen === "home" && pendingWorld) { setWorldIntro(pendingWorld); setPendingWorld(null); }
  }, [screen, pendingWorld]);
  useEffect(() => {
    if (!worldIntro) return;
    const t = setTimeout(() => setWorldIntro(null), 2800);
    return () => clearTimeout(t);
  }, [worldIntro]);
  const examMastered = examComplete && examGoldCount >= EXAM_SLOTS;    // 全枠金＝完全制覇
  const rescued = examComplete;                                // 修了バッジが揃った＝ピーチ救出（ホームでマリオの横へ）
  // 5枠のコレクション帯（🥇金 / 🏅銀 / 空）。size でアイコンの大きさを変える。
  const examStrip = (size = 26) => (
    <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
      {Array.from({ length: EXAM_SLOTS }, (_, k) => {
        const t = examSlots[k];
        return (
          <span key={k} aria-hidden="true" style={{ width: size + 8, height: size + 8, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size,
            background: t === "gold" ? "#fff4c2" : t === "silver" ? "#eef7ea" : "#fff8e7",
            border: `1px solid ${t === "gold" ? "#f0a00088" : t === "silver" ? "#1f9e3a55" : "#d9c7a0"}` }}>
            {t === "gold" ? "👑" : t === "silver" ? "⭐" : ""}
          </span>
        );
      })}
    </div>
  );

  // ── スタイル（暗記特化: 落ち着いた濃紺、最小限のグロー） ──
  const wrap = {
    minHeight: "100vh", boxSizing: "border-box",
    background: worldTheme(sceneWorld).bg, transition: "background .6s",
    color: "#1f1a14", fontFamily: "system-ui, -apple-system, 'Hiragino Sans', sans-serif",
    display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px 64px", overflowX: "hidden", position: "relative",
  };
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  // ── 操作 ──
  function openStudy(i) { setSecIdx(i); setStudyChunk(0); setStudySub("learn"); setScreen("study"); }
  function beginRun(queue, mode) {
    setTestQueue(queue); setTestMode(mode);
    setTestPos(0); setTestResults([]); setPhase("answer");
    setMultiSel([]); setLastOk(null); setRetry(false); setScreen("test");
  }
  // チャンク選択テスト画面を開く（初期は全チャンク選択）
  function openTestPick(i) {
    setSecIdx(i);
    const n = Math.max(1, Math.ceil((sections[i] || []).length / PAGE_SIZE));
    setPickChunks(new Set(Array.from({ length: n }, (_, k) => k)));
    setScreen("testpick");
  }
  function startTest(i) { setSecIdx(i); setFullBlock(true); beginRun(sections[i] || [], "section"); }  // ブロック全問・🏅
  // testpick で選んだチャンクの問題をフラット順に連結して出題。全チャンク選択のときだけ🏅対象。
  function startPickTest() {
    const all = sections[secIdx] || [];
    const n = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    const idxs = [...pickChunks].sort((a, b) => a - b);
    const queue = idxs.flatMap((c) => all.slice(c * PAGE_SIZE, c * PAGE_SIZE + PAGE_SIZE));
    if (queue.length === 0) return;
    setFullBlock(pickChunks.size === n);
    beginRun(queue, "section");
  }
  function startChunkQuiz() { beginRun(chunkQs, "study"); }                          // この10問
  function startChunkMisses() {                                                      // この回で一発正解できなかった問題だけ
    const ids = new Set(((studyProgress[secIdx] || {})[studyChunk]) || []);
    beginRun(chunkQs.filter((q) => ids.has(q.id)), "study");
  }
  function startReview() { beginRun(wrongList.slice(), "review"); }                  // 間違えた問題に挑戦
  // 要復習フラグを付けた問題に挑戦（正解するまで繰り返す・フラグは正解しても外れない＝ユーザーが手動で外すまで残る）
  function startFlagged() { if (flaggedList.length) beginRun(shuffle(flaggedList), "flagged"); }

  // ── ランダム出題 ──
  const poolOf = (scope) => (scope >= 0 ? (sections[scope] || []) : questions);      // 0〜7=ブロック
  // ランダム演習（復習用）: ブロックを選ぶだけの画面。ブロックをタップ＝RANDOM_BLOCK_N 問で即開始。
  function openBlockRandom() { setScreen("randompick"); }
  function startRandom(scopeIdx, count) {
    const pool = poolOf(scopeIdx);
    const queue = shuffle(pool).slice(0, Math.min(count, pool.length));
    if (queue.length === 0) return;
    setRandomLabel(scopeIdx >= 0 ? sectionLabels[scopeIdx] : "総合");
    setLastRandom({ scopeIdx, count });
    setFullBlock(false);                                  // 🏅対象外（純粋な演習）
    beginRun(queue, "random");
  }
  // 直近ランダム演習で間違えた問題だけを再出題（結果はまた random 扱いなので連鎖する）。
  function startRandomMisses(missed) { if (missed && missed.length) beginRun(shuffle(missed), "random"); }

  // ── 総合テスト（模試）: 全範囲から EXAM_SIZE 問をランダム出題 ──
  function startExam() {
    const queue = shuffle(questions).slice(0, Math.min(EXAM_SIZE, questions.length));
    if (queue.length === 0) return;
    setFullBlock(false);
    beginRun(queue, "exam");
  }
  // 総合テストの間違えた問題を、正解するまで繰り返す覚えるモードで再出題（結果はまた exammiss 扱いなので連鎖する）。
  function startExamMisses(missed) { if (missed && missed.length) beginRun(shuffle(missed), "exammiss"); }

  function submitAnswer(input) {
    const q = testQueue[testPos];
    if (!q || phase !== "answer") return;
    const ok = judge(q, input);
    play(ok ? "coin" : "damage");
    setLastOk(ok); setLastInput(input);
    // やり直し中（暗記10問テスト）は採点・復習プールに反映しない＝最初の不正解のまま。
    if (!retry) {
      setTestResults((r) => [...r, { id: q.id, ok }]);
      // 誤答は復習プールへ。正解したら除外（どのテストでも共通）。
      setWrongIds((w) => {
        const n = { ...w };
        if (ok) delete n[q.id]; else n[q.id] = true;
        return n;
      });
    }
    setPhase("reveal");
  }
  // 暗記10問テストで同じ問題を解き直す（採点は最初の結果のまま）。
  function retryQuestion() {
    setPhase("answer"); setMultiSel([]); setLastOk(null); setRetry(true);
  }
  // 「正解するまで繰り返す」覚えるモード挙動を使うモード（暗記10問／ランダム演習／総合テストの覚え直し／要復習）。
  const isCram = (m) => m === "study" || m === "random" || m === "exammiss" || m === "flagged";
  useEffect(() => { if (debugFinish) { setDebugFinish(false); nextTest(); } }, [debugFinish]);
  function nextTest() {
    const next = testPos + 1;
    if (next >= testQueue.length) {
      const correct = testResults.filter((r) => r.ok).length; // 直近回答まで反映済み
      const total = testQueue.length;
      const pct = Math.round((correct / total) * 100);
      if (testMode === "section") {
        const pass = pct >= PASS_PCT;                 // このテスト単体の合否（部分選択でも表示する）
        const badge = fullBlock && pass;              // 🏅ブロック合格は「全チャンク選択で合格」のときだけ
        // 成績(best/badge)は全ブロックテストのときだけ永続化。部分選択は記録しない。
        if (fullBlock) {
          setRecords((rec) => {
            const prev = rec[secIdx] || { best: 0, badge: false };
            return { ...rec, [secIdx]: { best: Math.max(prev.best, pct), badge: prev.badge || badge } };
          });
        }
        // このコースで、ワールドの3コースが揃ってクリアになったら、次のワールドへの演出を予約
        const g = blocks[secIdx] && blocks[secIdx].group;
        const othersCleared = blocks.every((b, k) => b.group !== g || k === secIdx || (records[k] && records[k].badge));
        if (badge && !(records[secIdx] && records[secIdx].badge) && othersCleared && groupNos.includes(g + 1)) setPendingWorld(g + 1);
        setLastScore({ correct, total, pct, badge, pass, full: fullBlock });
        setScreen("result");
      } else if (testMode === "exam") {     // 総合テスト（模試）: 合否＋修了バッジ
        const pass = correct >= EXAM_PASS;
        const gold = correct >= EXAM_GOLD;
        const tier = gold ? "gold" : "silver";
        if (pass) {
          // 空き枠があれば埋める。満杯かつ金なら銀を1つ金に格上げ（＝全枠金＝完全制覇へ）。
          setExamSlots((prev) => {
            const slots = prev.slice(0, EXAM_SLOTS);
            if (slots.length < EXAM_SLOTS) slots.push(tier);
            else if (gold) { const i = slots.indexOf("silver"); if (i >= 0) slots[i] = "gold"; }
            return slots;
          });
        }
        // 総合テストで間違えた問題を lastScore に持たせ、「間違えた問題を覚える」導線に使う。
        const examMissedIds = new Set(testResults.filter((r) => !r.ok).map((r) => r.id));
        const examMissed = testQueue.filter((q) => examMissedIds.has(q.id));
        const rescue = pass && examSlots.length === EXAM_SLOTS - 1;   // 今回の合格で修了バッジが揃う＝ピーチ救出
        // 救出後にクリアしたら宝箱の回数を進める（救出後5回目＝累計10回目で宝を手に入れる）
        const tCount = examComplete && pass ? Math.min(TREASURE_NEED, treasure + 1) : treasure;
        if (tCount !== treasure) setTreasure(tCount);
        const treasureInfo = { count: tCount, open: tCount >= TREASURE_NEED, got: tCount >= TREASURE_NEED && treasure < TREASURE_NEED };
        setLastScore({ correct, total, pct, exam: true, pass, gold, tier: pass ? tier : null, missed: examMissed, rescue, treasure: treasureInfo });
        setScreen("result");
      } else if (testMode === "exammiss") { // 総合テストの覚え直し: 正解するまで繰り返した後、まだ残るミスを返す
        const missedIds = new Set(testResults.filter((r) => !r.ok).map((r) => r.id));
        const missed = testQueue.filter((q) => missedIds.has(q.id));
        setLastScore({ correct, total, pct, badge: false, exammiss: true, missed });
        setScreen("result");
      } else if (testMode === "flagged") {  // 要復習フラグの挑戦: バッジ無し、フラグは正解しても外れない（結果画面は現在のフラグ数を見る）
        setLastScore({ correct, total, pct, badge: false, flagged: true });
        setScreen("result");
      } else if (testMode === "review") {   // 間違えた問題の復習: バッジ無し、結果画面へ
        setLastScore({ correct, total, pct, badge: false, review: true });
        setScreen("result");
      } else if (testMode === "random") {   // ランダム演習: バッジ無し、結果画面へ
        // この回で間違えた問題を lastScore に持たせ、「この演習のミスに挑戦」導線に使う。
        const missedIds = new Set(testResults.filter((r) => !r.ok).map((r) => r.id));
        const missed = testQueue.filter((q) => missedIds.has(q.id));
        setLastScore({ correct, total, pct, badge: false, random: true, label: randomLabel, missed });
        setScreen("result");
      } else {                              // 暗記内テスト: 採点して暗記画面へ戻る
        setQuizScore({ correct, total });
        // このセットで一発正解できなかった問題IDを永続化（retry分は testResults に載らないので「最初の回答」で判定）。
        // 出題キュー内の誤答のみを残す。ミス挑戦時はキュー＝前回のミスなので、正解できたものが自動的に外れて完了(=[])に近づく。
        const missedIds = new Set(testResults.filter((r) => !r.ok).map((r) => r.id));
        const stillMissedIds = testQueue.filter((q) => missedIds.has(q.id)).map((q) => q.id);
        setStudyProgress((prev) => {
          const sec = { ...(prev[secIdx] || {}) };
          sec[studyChunk] = stillMissedIds;
          return { ...prev, [secIdx]: sec };
        });
        setStudySub("quizdone");
        setScreen("study");
      }
      return;
    }
    setTestPos(next); setPhase("answer"); setMultiSel([]); setLastOk(null); setRetry(false);
  }

  // BGM：トップ・覚える＝地上、テスト＝地下（かめおの城は城の曲）。いずれも小さく。結果は無音
  useEffect(() => {
    const studying = (screen === "study" && studySub === "learn") || screen === "home";  // トップも地上
    if (!bgmOn || (screen !== "test" && !studying)) { BGM.stop(); return; }
    // テストは土管の音（約0.5秒）が鳴り終わり、少し間を置いてから流し始める
    const t = setTimeout(() => BGM.play(studying ? "overworld" : testTrack(), 0.2), studying ? 300 : 1300);
    return () => clearTimeout(t);
  }, [bgmOn, screen, studySub, testMode]);

  // 結果が出たら効果音（クリア＝ファンファーレ / 未達＝土管の音）
  useEffect(() => {
    if (screen === "result" && lastScore && lastScore.badge) {
      play("flagpole");  // クラッカーは見た目だけ（音はうるさいので鳴らさない）
      const t = setTimeout(() => play("stageClear"), 1450);
      return () => { clearTimeout(t); stopJingles(); };
    }
    if (screen === "result" && lastScore && lastScore.exam && lastScore.pass) {  // かめおの城：橋が崩れる → 落下 → ファンファーレ
      // 落下音（1.4秒から0.9秒間）が鳴り終わったところでステージクリアのファンファーレ
      const ts = [setTimeout(() => play("bridge"), 300), setTimeout(() => play("fall"), 1400), setTimeout(() => play("stageClear"), 2300)];
      if (lastScore.gold && !lastScore.rescue) ts.push(setTimeout(() => play("popper"), 2400));
      if (lastScore.rescue) ts.push(setTimeout(() => play("popper"), 3400));
      if (lastScore.treasure && lastScore.treasure.got) ts.push(setTimeout(() => play("coin"), 3200), setTimeout(() => play("popper"), 4500));
      return () => { ts.forEach(clearTimeout); stopJingles(); };
    }
    if (screen === "result" && lastScore) play(isGood(lastScore) ? "clear" : "pipe");
    if (screen === "study" && studySub === "quizdone" && quizScore) play(quizScore.correct === quizScore.total ? "clear" : "pipe");
    return stopJingles;
  }, [screen, lastScore, studySub, quizScore]);
  // 結果表示用：マリオとルイージ（よくできた＝ジャンプ / 未達＝しょんぼり）
  const heroes = (good) => (
    <div aria-hidden="true" style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 14, height: 76, alignItems: "flex-end" }}>
      <NamedHero who="mario" px={4} pose={good ? "jump" : "sad"} />
      <NamedHero who="luigi" px={4} pose={good ? "jump" : "sad"} style={{ animationDelay: ".15s" }} />
    </div>
  );

  // 問題が変わったらハイライト位置を先頭に戻す
  useEffect(() => { setCursor(0); }, [testPos, screen]);

  // キーボード（テスト）: 矢印↑↓で選択肢を移動→Enterで決定。single=1〜4即決も併用、multi=Spaceで選択。reveal=Enterで次へ
  useEffect(() => {
    if (screen !== "test") return;
    const q = testQueue[testPos];
    const h = (e) => {
      if (e.repeat) return; // キーリピート（押しっぱなし）での連続発火を無視
      if (phase === "reveal") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // 覚えるモード系（暗記10問／ランダム演習／総合の覚え直し）で不正解なら Enter はやり直し（次へは出さない）。それ以外は次へ。
          if (isCram(testMode) && !lastOk) retryQuestion(); else nextTest();
        }
        return;
      }
      if (!q) return;
      // 矢印で選択肢ハイライトを移動（single / multi 共通）。↑←=上/↓→=下。
      // multi は選択肢の次に「決定」ボタンも移動先に含める（最後の位置＝決定ボタン）。
      if ((q.type === "single" || q.type === "multi") && q.choices.length) {
        const maxIdx = q.type === "multi" ? q.choices.length : q.choices.length - 1;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); setCursor((c) => Math.min(c + 1, maxIdx)); return; }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); return; }
      }
      if (q.type === "single") {
        if (e.key === "Enter") { e.preventDefault(); const c = q.choices[cursor]; if (c) submitAnswer([c.label]); return; }
        // 1〜4 キーで即決（選択肢ラベル＝番号）
        if (q.choices.some((c) => c.label === e.key)) submitAnswer([e.key]);
      } else if (q.type === "multi") {
        // カーソルが選択肢の位置ならEnterでON/OFF、決定ボタンの位置（=choices.length）ならEnterで決定（マウスクリックと同じ効果）。
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (cursor >= q.choices.length) { if (multiSel.length) submitAnswer(multiSel); return; }
          const c = q.choices[cursor];
          if (!c) return;
          setMultiSel((s) => s.includes(c.label) ? s.filter((x) => x !== c.label) : [...s, c.label]);
          return;
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  // メニュー系画面（test以外＝ホーム/結果/ランダム選択/テスト選択/暗記など）: ↑↓で画面内のボタンを巡回フォーカス、Enterは標準でそのボタンを実行。
  useEffect(() => {
    if (screen === "test") return; // テスト画面は独自のキーボード操作を持つ
    const getBtns = () => Array.from(document.querySelectorAll("button")).filter((b) => !b.disabled && b.offsetParent !== null);
    // 初期フォーカス: 意味のあるラベル（3文字以上）を持つ最初のボタン＝主要アクションに寄せる（← 等のアイコンボタンは初期選択から外す。矢印では行ける）
    const btns = getBtns();
    if (btns.length && !btns.includes(document.activeElement)) {
      (btns.find((b) => (b.textContent || "").trim().length >= 3) || btns[0]).focus();
    }
    const h = (e) => {
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return; // 入力欄では矢印を奪わない
      if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
      const list = getBtns();
      if (!list.length) return;
      e.preventDefault();
      const idx = list.indexOf(document.activeElement);
      const down = e.key === "ArrowDown" || e.key === "ArrowRight";
      const n = idx < 0 ? 0 : (down ? Math.min(idx + 1, list.length - 1) : Math.max(idx - 1, 0));
      list[n].focus();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [screen]);

  // 🎵BGM／🔊効果音の切替（ホームは右上、ほかの画面は右下に浮かせる）
  const soundToggles = (
    <>
    <button data-sfx="none" onClick={() => setBgmOn((v) => !v)} aria-label={bgmOn ? "BGMをオフにする" : "BGMをオンにする"} aria-pressed={bgmOn} className="iconbtn"
      style={{ width: 34, height: 34, borderRadius: 999, background: "#ffffff", border: "2px solid #3b2a1a", cursor: "pointer", fontSize: 15, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: bgmOn ? 1 : 0.45 }}>🎵</button>
    <button data-sfx="none" onClick={toggleSound} aria-label={soundOn ? "効果音をオフにする" : "効果音をオンにする"} aria-pressed={soundOn} className="iconbtn"
      style={{ width: 34, height: 34, borderRadius: 999, background: "#ffffff", border: "2px solid #3b2a1a", cursor: "pointer", fontSize: 15, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{soundOn ? "🔊" : "🔇"}</button>
    </>
  );
  const styleTag = (
    <>
    <Scenery home={screen === "home"} rescued={rescued} world={sceneWorld} />
    {worldIntro && <WorldIntro world={worldIntro} />}
    {screen === "home" && <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 40, pointerEvents: "none", overflow: "hidden" }}><FlyingToad /></div>}{/* 目立つよう画面の手前を飛ぶ */}
    {screen !== "home" && <div style={{ position: "fixed", right: 12, bottom: 40, zIndex: 50, display: "flex", gap: 6 }}>{soundToggles}</div>}
    <style>{`
      .wrap > *{ position: relative; z-index: 1; }
      .qblock{ display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box; flex:0 0 auto; font-weight:900; color:#fff8e0;
        background:#f8b800; border:2px solid #7a3d00; border-radius:3px; text-shadow:2px 2px 0 #7a3d00;
        box-shadow: inset 2px 2px 0 #ffe08a, inset -2px -2px 0 #c86c00; }
      .pipe{ display:block; box-sizing:border-box; border:2px solid #0b3d0b;
        background: linear-gradient(90deg,#1a7a1a 0%,#7ed957 22%,#43b047 45%,#1f8a2a 80%,#0f5a14 100%); }
      .bubble{ position:relative; background:#fff; border:3px solid #e52521; border-radius:10px; padding:9px 12px; font-size:12.5px; line-height:1.7; color:#1f1a14; font-weight:600; box-shadow:0 3px 0 #3b2a1a33; }
      .hero{ display:block; }
      .hero.idle{ animation: bob 1.2s steps(2) infinite; }
      .hero.jump{ animation: jump .55s ease-out; }
      .hero.sad{ filter: saturate(.35) brightness(.9); transform: rotate(-10deg) translateY(4px); transition: transform .2s; }
      @keyframes bob{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
      @keyframes jump{ 0%{transform:translateY(0)} 40%{transform:translateY(-26px)} 100%{transform:translateY(0)} }
      .goomba-walk{ animation-name: goomba-walk; animation-timing-function: linear; animation-iteration-count: infinite; }
      @keyframes goomba-walk{ from{ transform: translateX(calc(100vw + 10px)) } to{ transform: translateX(-40px) } }
      .star-spin{ display:block; animation: star-twinkle .3s steps(2) infinite; }
      @keyframes star-twinkle{ 50%{ filter: brightness(1.35) } }
      .goomba-step{ display:block; animation: goomba-step .5s steps(1) infinite; }
      @keyframes goomba-step{ 0%{ transform: scaleX(1) } 50%{ transform: scaleX(-1) } }
      .confetti{ position:absolute; opacity:0; border-radius:1px; animation-name: confetti; animation-timing-function: cubic-bezier(.2,.7,.4,1); animation-fill-mode: both; }
      @keyframes confetti{
        0%{ transform: translate(0,0) rotate(0); opacity:1 }
        55%{ transform: translate(calc(var(--dx) * .8), var(--dy)) rotate(var(--r)); opacity:1 }
        100%{ transform: translate(var(--dx), calc(var(--dy) + 320px)) rotate(calc(var(--r) * 2)); opacity:0 }
      }
      .flag-down{ top: 150px; animation: flag-down 1s .3s ease-in both; }
      @keyframes flag-down{ from{ top: 14px } to{ top: 150px } }
      .mario-slide{ top: 130px; animation: mario-slide 1s .3s ease-in both; }
      @keyframes mario-slide{ from{ top: 6px } to{ top: 130px } }
      .mario-hop{ transform: translate(34px, 0); animation: mario-hop .6s 1.4s ease-out both; }
      @keyframes mario-hop{ 0%{ transform: translate(0,0) scaleX(-1) } 45%{ transform: translate(20px,-30px) } 100%{ transform: translate(34px,0) } }
      .clear-title{ animation: clear-pop .5s 1.5s cubic-bezier(.3,1.6,.5,1) both; }
      @keyframes clear-pop{ from{ transform: scale(0); opacity:0 } to{ transform: scale(1); opacity:1 } }
      .lava{ background: repeating-linear-gradient(90deg, #f83800 0 14px, #fc7400 14px 28px); border-top: 4px solid #fca044; animation: lava 1s linear infinite; }
      @keyframes lava{ from{ background-position: 0 0 } to{ background-position: 28px 0 } }
      .bridge-seg{ opacity:0; animation: bridge-fall .4s ease-in both; }
      @keyframes bridge-fall{ from{ transform: translateY(0); opacity:1 } to{ transform: translateY(70px); opacity:0 } }
      .bowser-fall{ opacity:0; animation: bowser-fall 1s 1.4s ease-in both; }
      @keyframes bowser-fall{ 0%{ transform: translateY(0) rotate(0); opacity:1 } 85%{ opacity:1 } 100%{ transform: translateY(150px) rotate(30deg); opacity:0 } }
      .castle-hop{ animation: jump .55s 2.3s ease-out both; }
      .peach-in{ animation: peach-in .5s 2.6s ease-out both; }
      @keyframes peach-in{ from{ transform: translateY(-14px); opacity:0 } to{ transform: none; opacity:1 } }
      .castle-title{ animation-delay: 2.3s; }
      .treasure-scene{ animation: rescue-in .6s 4.4s ease-out both; }
      .treasure-sparkle{ display:inline-block; animation: clear-pop .5s 4.9s cubic-bezier(.3,1.6,.5,1) both; }
      .rescue-scene{ animation: rescue-in .6s 3.3s ease-out both; }
      @keyframes rescue-in{ from{ opacity:0 } to{ opacity:1 } }
      .heart-pop{ display:inline-block; animation: clear-pop .5s 3.8s cubic-bezier(.3,1.6,.5,1) both; }
      .coinpop{ position:absolute; animation: coinpop .6s ease-out forwards; pointer-events:none; }
      @keyframes coinpop{ 0%{transform:translateY(0);opacity:1} 70%{transform:translateY(-34px);opacity:1} 100%{transform:translateY(-40px);opacity:0} }
      .hideans{ filter: blur(6px); cursor: pointer; transition: filter .12s; border-radius: 5px; }
      .hideans:hover, .hideans.shown{ filter: none; }
      .row:hover{ border-color:#3b2a1a !important; }
      .axe-out{ animation: axe-out .3s 2.5s ease-in both; }
      @keyframes axe-out{ to{ opacity:0; transform: translateY(-8px) } }
      .chest-shake{ animation-delay: 3.2s; animation-iteration-count: infinite; animation-timing-function: steps(2); }
      .chest-shake1{ animation-name: shake1; animation-duration: 3s; }
      .chest-shake2{ animation-name: shake2; animation-duration: 1.6s; }
      .chest-shake3{ animation-name: shake2; animation-duration: .8s; }
      .chest-shake4{ animation-name: shake3; animation-duration: .7s; }
      @keyframes shake1{ 0%,90%{ transform: none } 95%{ transform: rotate(-2deg) } }
      @keyframes shake2{ 0%,70%{ transform: none } 78%{ transform: rotate(-4deg) } 86%{ transform: rotate(4deg) } 94%{ transform: rotate(-3deg) } }
      @keyframes shake3{ 0%,40%{ transform: none } 50%{ transform: translateY(-3px) rotate(-5deg) } 60%{ transform: rotate(5deg) } 70%{ transform: translateY(-2px) rotate(-4deg) } 80%{ transform: rotate(3deg) } }
      .chest-lid-open{ animation: lid-open .5s 2.8s ease-out both; }
      @keyframes lid-open{ to{ transform: translate(-6px,-10px) rotate(-35deg) } }
      .treasure-pop{ animation: treasure-pop .8s 3.2s ease-out both; filter: drop-shadow(0 0 6px #fff6a0); }
      @keyframes treasure-pop{ from{ opacity:0; transform: translateY(20px) scale(.4) } to{ opacity:1; transform: translateY(0) scale(1) } }
      .world-intro{ animation: world-intro 2.8s ease both; }
      @keyframes world-intro{ 0%{ opacity:0 } 10%{ opacity:1 } 85%{ opacity:1 } 100%{ opacity:0 } }
      .bubble-up{ position:absolute; bottom:30px; border-radius:50%; border:2px solid #ffffffcc; background:#ffffff33; animation: bubble-up linear infinite; }
      @keyframes bubble-up{ from{ transform: translateY(0) } to{ transform: translateY(-105vh) } }
      .hero.walker{ animation-duration: .45s; }
      .wing-flap{ transform-origin: bottom left; animation: wing-flap .25s steps(2) infinite; }
      @keyframes wing-flap{ 50%{ transform: scaleY(.45) } }
      .swim-left{ animation: swim-left linear infinite; }
      @keyframes swim-left{ from{ transform: translateX(calc(100vw + 20px)) } to{ transform: translateX(-60px) } }
      .swim-right{ animation: swim-right linear infinite; }
      @keyframes swim-right{ from{ transform: translateX(-60px) } to{ transform: translateX(calc(100vw + 20px)) } }
      .cheep-bob{ animation: cheep-bob 1.6s ease-in-out infinite alternate; }
      @keyframes cheep-bob{ from{ transform: translateY(-10px) rotate(-4deg) } to{ transform: translateY(10px) rotate(4deg) } }
      .seaweed{ position:absolute; bottom:30px; width:10px; background:#2f9e4a; border-radius:6px 6px 0 0; transform-origin: bottom center; animation: sway 3s ease-in-out infinite alternate; }
      @keyframes sway{ from{ transform: rotate(-8deg) } to{ transform: rotate(8deg) } }
      .snow-fall{ position:absolute; top:-10px; border-radius:50%; background:#fff; animation: snow-fall linear infinite; }
      @keyframes snow-fall{ from{ transform: translateY(0) } to{ transform: translateY(105vh) } }
      .ember-up{ position:absolute; bottom:30px; background:#ffb03a; box-shadow:0 0 6px #ff7a2a; animation: bubble-up linear infinite; }
      .world-tag{ font-size:12px; font-weight:900; letter-spacing:1px; color:#fff; padding:3px 9px; border:2px solid #3b2a1a; border-radius:4px;
        background:#c84c0c; background-image: linear-gradient(#3b2a1a55 1px, transparent 1px), linear-gradient(90deg, #3b2a1a55 1px, transparent 1px); background-size: 12px 7px;
        text-shadow: 1px 1px 0 #3b2a1a; white-space:nowrap; }
      .seccard:hover{ background:#e8dcc0 !important; }  /* 開いた状態でもカード全体の色が変わるように、行ではなくカードに付ける */
      .secrow:active{ background:#f3e9d2 !important; }
      .panel-in{ animation: panelin .2s ease; }
      @keyframes panelin{ from{ opacity:0; transform:translateY(-6px) } to{ opacity:1; transform:none } }
      .iconbtn:hover{ border-color:#3b2a1a !important; color:#1f1a14 !important; background:#f3e9d2 !important; }
      .secbtn:hover{ filter: brightness(1.18); }
      .secbtn:active{ transform: scale(.97); }
      .choice:hover{ border-color:#43b047 !important; }
      .choice:active{ transform: scale(.99); }
      .card-in{ animation: fadein .25s ease; }
      /* opacity は 0 にしない（不正解→次へ で shake と animation を奪い合い fadein が再発火し、カードが一瞬消える＝白フラッシュになるため）。スライドのみ。 */
      @keyframes fadein{ from{transform:translateY(4px)} to{transform:none} }
      @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(6px)}}
      .shake{ animation: shake .3s; }
      button:focus-visible,input:focus-visible{ outline:2px solid #7ed957; outline-offset:2px; }
      @media (prefers-reduced-motion: reduce){ *{animation:none !important} }
    `}</style>
    </>
  );

  // ════════════════ HOME（ブロック一覧） ════════════════
  if (screen === "home") {
    return (
      <div style={wrap} className="wrap">
        {styleTag}
        <div style={{ maxWidth: 480, width: "100%", minWidth: 0 }}>
          <div style={{ marginTop: 6, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              <h1 style={{ fontSize: "clamp(17px, 5.4vw, 22px)", fontWeight: 900, letterSpacing: 1, margin: 0, whiteSpace: "nowrap", color: "#fff",
                textShadow: "2px 2px 0 #e52521, 4px 4px 0 #3b2a1a" }}>スーパー管工事ブラザーズ</h1>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#1f1a14" }}>2級管工事 第一次検定</span>
            </div>
            {/* 旗（ブロック合格）の数＋効果音の切替。スマホで折り返したときも右寄せ */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "0 0 auto", marginLeft: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "#ffffff", border: "2px solid #3b2a1a" }}>
                <span aria-hidden="true">🚩</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: badgeCount > 0 ? "#1f9e3a" : "#3b3024" }}>{badgeCount}<span style={{ color: "#5e4f3c", fontWeight: 700 }}> / {sections.length}</span></span>
              </div>
              {soundToggles}
            </div>
          </div>

          {/* マリオとルイージが土管・?ブロックと並ぶ看板 */}
          <div aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 14, margin: "6px 0 2px", height: 64 }}>
            {rescued && <Pixel rows={PEACH} palette={PALETTES.peach} px={3} className="hero idle" style={{ animationDelay: ".3s" }} title="ピーチ" />}
            <NamedHero who="mario" px={3} pose="idle" king={hasTreasure} />
            <NamedHero who="luigi" px={3} pose="idle" style={{ animationDelay: ".6s" }} />
            <span style={{ display: "flex", gap: 0, alignSelf: "flex-start" }}><QBlock /><QBlock /><QBlock /></span>
            <Pipe />
          </div>
          {/* アプリの軽い説明 */}
          <div style={{ margin: "4px 0 20px" }}>
            <Bubble who="mario">
              黄色いマーカーが<b>正誤の決め手</b>だ！そこだけ覚えて反射で選ぼう。<br />
              各コースのテストで9割を取るとゴールの旗🚩をゲット。<br />
              <b>全{sections.length}本の旗を集めたら、準備完了！</b>
            </Bubble>
          </div>

          {debug && (
            <button data-sfx="none" onClick={() => { setRecords({}); setExamSlots([]); setTreasure(0); setPendingWorld(null); setPickedSec(null); }} style={{ width: "100%", marginBottom: 10, padding: "8px", fontSize: 12, fontWeight: 800, border: "2px dashed #7b2c9c", borderRadius: 8, background: "#f4e8ff", color: "#5a1a7a", cursor: "pointer" }}>【確認用】コースとかめおの城の記録をリセット</button>
          )}
          {debug && (
            <button data-sfx="none" onClick={() => { setRecords(Object.fromEntries(sections.map((_, k) => [k, { best: 100, badge: true }]))); setPendingWorld(null); setPickedSec(null); }} style={{ width: "100%", marginBottom: 10, padding: "8px", fontSize: 12, fontWeight: 800, border: "2px dashed #7b2c9c", borderRadius: 8, background: "#f4e8ff", color: "#5a1a7a", cursor: "pointer" }}>【確認用】ワールド6-3まで全部クリアした状態にする</button>
          )}
          {/* 要復習：ほっそりした帯ボタン。🔖を付けた問題があるときだけ、ブロック一覧の直前に表示。 */}
          {flaggedList.length > 0 && (
            <button data-sfx="warp" onClick={startFlagged} className="secbtn" style={{ width: "100%", marginBottom: 14, padding: "11px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 800, cursor: "pointer", background: "#fff4c2", border: "1px solid #d98e00", color: "#d98e00" }}>🔖 要復習に挑戦（{flaggedList.length}問）</button>
          )}

          {/* ブロック選択：スリムな縦リスト。行をタップで「覚える/テスト」が開く。タグ=グループ（3回分のまとまり） */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sections.map((sec, i) => {
              const rec = records[i] || { best: 0, badge: false };
              const locked = isLocked(i);
              const picked = pickedSec === i && !locked;
              const blk = blocks[i] || { no: i + 1, kind: "", chapSpan: "", group: 1 };
              // ワールドの区切り：グループが変わるところに見出し（ワールド番号・対象回・クリア数）
              const newWorld = i === 0 || (blocks[i - 1] && blocks[i - 1].group) !== blk.group;
              const worldIdx = blocks.map((b, k) => (b.group === blk.group ? k : -1)).filter((k) => k >= 0);
              const worldClear = worldIdx.filter((k) => records[k] && records[k].badge).length;
              return (
                <React.Fragment key={i}>
                {newWorld && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: i === 0 ? 0 : 14 }}>
                    <span className="world-tag">{blk.group > clearedWorld ? "🔒 " : ""}WORLD {blk.group}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#1f1a14" }}>{blocks[worldIdx[0]].chapSpan.split("〜")[0]}〜{blocks[worldIdx[worldIdx.length - 1]].chapSpan.split("〜").pop()}</span>
                    <span style={{ flex: 1, height: 2, background: "#3b2a1a33", borderRadius: 1 }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: worldClear === worldIdx.length ? "#1f9e3a" : "#3b3024" }}>{blk.group > clearedWorld ? `WORLD ${blk.group - 1} をクリアで解放` : `🚩 ${worldClear}/${worldIdx.length}`}</span>
                  </div>
                )}
                <div className={locked ? "" : "seccard"} style={{ opacity: locked ? 0.6 : 1, background: "#ffffff", border: `1px solid ${picked ? "#1d7a2f" : rec.badge ? "#1f9e3a33" : "#d9c7a0"}`, borderRadius: 13, overflow: "hidden", transition: "border-color .15s" }}>
                  {/* 行本体（1行・タップで開閉） */}
                  <button onClick={() => setPickedSec(picked ? null : i)} className="secrow" disabled={locked}
                    aria-expanded={picked} aria-label={`${sectionLabels[i]}・${blk.kind}${rec.badge ? "・達成" : rec.best > 0 ? `・${rec.best}%` : "・未挑戦"}`}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", background: "transparent", border: "none", color: "inherit", textAlign: "left" }}>
                    {/* 番号 / 達成メダル */}
                    <span className={rec.badge ? "" : "qblock"} style={{ width: 28, height: 28, flex: "0 0 auto", borderRadius: rec.badge ? 8 : 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: rec.badge ? 16 : 16, fontWeight: 900,
                      background: rec.badge ? "#e3f7df" : "#ffffff", border: `1px solid ${rec.badge ? "#1f9e3a55" : "#3b2a1a"}`, color: rec.badge ? "#1f9e3a" : "#fff8e0" }}>{rec.badge ? "🚩" : "?"}</span>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 15, fontWeight: 800 }}>
                        {sectionLabels[i]}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#5e4f3c" }}>{blk.chapSpan} ・ {sec.length}問</span>
                    </span>
                    {/* 状態 */}
                    <span style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", color: rec.badge ? "#1f9e3a" : rec.best > 0 ? "#d98e00" : "#5e4f3c" }}>{locked ? "🔒 未解放" : rec.badge ? "🚩 CLEAR" : rec.best > 0 ? `${rec.best}%` : "未挑戦"}</span>
                    {/* 開閉シェブロン */}
                    {!locked && <span aria-hidden="true" style={{ flex: "0 0 auto", color: "#5e4f3c", fontSize: 12, transition: "transform .18s", transform: picked ? "rotate(180deg)" : "none" }}>▾</span>}
                  </button>
                  {/* 展開部：覚える / テスト */}
                  {picked && (
                    <div className="panel-in" style={{ display: "flex", gap: 10, padding: "0 14px 13px" }}>
                      <button onClick={() => openStudy(i)} className="secbtn" style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", background: "#ffe3e0", border: "2px solid #e52521", color: "#c81e1a" }}>覚える</button>
                      <button onClick={() => openTestPick(i)} className="secbtn" style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", background: "#e6f6e1", border: "2px solid #1d7a2f", color: "#1d7a2f" }}>テスト</button>
                    </div>
                  )}
                </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* ランダム演習（上）＝復習用：忘れかけたコースをランダム20問でメンテナンス。バッジなし。 */}
          <div style={{ marginTop: 22, padding: "14px 16px", borderRadius: 13, background: "#fff8e7", border: "1px solid #d9c7a0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 900 }}><QBlock size={20} style={{ verticalAlign: "-0.2em", marginRight: 6 }} />ランダム演習</span>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, color: "#1d7a2f", background: "#e6f6e1", border: "1px solid #1d7a2f44", borderRadius: 6, padding: "1px 6px" }}>復習</span>
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#4a3d2e", marginBottom: 11 }}>忘れかけたコースを選んでランダム{RANDOM_BLOCK_N}問。記憶のメンテナンスに。</div>
            <button onClick={openBlockRandom} className="secbtn" style={{ width: "100%", padding: "11px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 800, cursor: "pointer", background: "#e6f6e1", border: "1px solid #1d7a2f", color: "#1d7a2f" }}>コースを選んで復習（{RANDOM_BLOCK_N}問）</button>
          </div>

          {/* 総合テスト（模試・下）：全範囲60問・本番形式。仕上げに挑戦。修了バッジを5個集める。 */}
          <div style={{ marginTop: 14, padding: "16px 16px 15px", borderRadius: 14, background: "linear-gradient(180deg,#e3f7df,#fff8e7)", border: `1px solid ${examMastered ? "#f0a00088" : examComplete ? "#1f9e3a55" : "#1f9e3a"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: "#1f9e3a" }}>🏰 かめおの城（総合テスト）</span>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, color: "#d98e00", background: "#fff4c2", border: "1px solid #f0a00055", borderRadius: 6, padding: "1px 6px" }}>仕上げ・本番形式</span>
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#4a3d2e", marginBottom: 12 }}>全範囲から{EXAM_SIZE}問ランダム出題・{EXAM_PASS}問（6割）で合格＝スター⭐／{EXAM_GOLD}問以上で王冠👑</div>
            {examStrip(26)}
            <div style={{ textAlign: "center", fontSize: 11.5, fontWeight: 700, marginTop: 8, color: examMastered ? "#d98e00" : examComplete ? "#1f9e3a" : "#4a3d2e" }}>
              {examMastered ? "🎉 完全制覇！" : `修了バッジ ${examSlots.length} / ${EXAM_SLOTS}`}
            </div>
            {allWorldsCleared ? (
              <button data-sfx="warp" onClick={startExam} style={{ width: "100%", marginTop: 13, padding: "13px 0", borderRadius: 11, fontSize: 15, fontWeight: 900, cursor: "pointer", color: "#ffffff", background: "linear-gradient(90deg,#1f9e3a,#1f9e3a)", border: "none", boxShadow: "0 0 20px #1f9e3a33" }}>
                🏰 かめおの城に挑戦（{Math.min(EXAM_SIZE, questions.length)}問）
              </button>
            ) : (
              <button disabled style={{ width: "100%", marginTop: 13, padding: "13px 0", borderRadius: 11, fontSize: 14, fontWeight: 900, color: "#5e4f3c", background: "#e8dcc0", border: "none", opacity: 0.8 }}>
                🔒 全ワールドをクリアすると挑戦できる
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 14, paddingBottom: 6 }}>
            <button onClick={() => { if (confirm("バッジ・成績をすべてリセットします（修了バッジも含む）。よろしいですか？")) { setRecords({}); setExamSlots([]); } }} style={{ ...linkBtn, color: "#e52521" }}>成績をリセット</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════ TESTPICK（テスト範囲をチャンク単位で選ぶ） ════════════════
  if (screen === "testpick") {
    const blk = blocks[secIdx] || { no: secIdx + 1, kind: "", chapSpan: "" };
    // 各チャンクの問数（最後のチャンクは端数）
    const chunkSizes = Array.from({ length: chunkCount }, (_, i) =>
      Math.min(PAGE_SIZE, secQuestions.length - i * PAGE_SIZE));
    const selectedCount = [...pickChunks].reduce((s, c) => s + (chunkSizes[c] || 0), 0);
    const allSelected = pickChunks.size === chunkCount;
    const toggleChunk = (c) => setPickChunks((prev) => {
      const n = new Set(prev);
      if (n.has(c)) n.delete(c); else n.add(c);
      return n;
    });
    const toggleAll = () => setPickChunks(allSelected ? new Set() : new Set(Array.from({ length: chunkCount }, (_, k) => k)));
    return (
      <div style={wrap} className="wrap">
        {styleTag}
        <div style={{ maxWidth: 480, width: "100%", minWidth: 0 }}>
          {/* ヘッダ */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
            <button data-sfx="back" onClick={() => setScreen("home")} aria-label="ホームへ戻る" className="iconbtn" style={{ width: 36, height: 36, borderRadius: 10, background: "#ffffff", border: "1px solid #3b2a1a", color: "#3b3024", cursor: "pointer", fontSize: 17, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>←</button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 }}>
              <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: 0.5 }}>{sectionLabels[secIdx]} テスト</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5e4f3c" }}>{blk.kind} ・ {blk.chapSpan}</span>
            </div>
            <span style={{ width: 36 }} aria-hidden="true" />
          </div>

          <p style={{ margin: "18px 0 12px", fontSize: 12.5, lineHeight: 1.7, color: "#4a3d2e" }}>
            出題する範囲を10問ずつ選べます。<br />
            <span style={{ color: "#1d7a2f", fontWeight: 700 }}>全部を選んで9割合格すると、このコースクリア🚩</span>になります。
          </p>

          {/* 全選択トグル */}
          <button onClick={toggleAll} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 8, borderRadius: 11, cursor: "pointer", background: "#fff8e7", border: "1px solid #3b2a1a", color: "#3b3024", fontSize: 13, fontWeight: 800, textAlign: "left" }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900,
              background: allSelected ? "#e6f6e1" : "transparent", border: `1px solid ${allSelected ? "#43b047" : "#3b2a1a"}`, color: "#1d7a2f" }}>{allSelected ? "✓" : ""}</span>
            {allSelected ? "すべて解除" : "すべて選択"}
          </button>

          {/* チャンクのチェックボックス一覧 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {Array.from({ length: chunkCount }).map((_, i) => {
              const on = pickChunks.has(i);
              return (
                <button key={i} onClick={() => toggleChunk(i)}
                  aria-pressed={on} aria-label={`セット${i + 1}（${chunkSizes[i]}問）${on ? "・選択中" : ""}`}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    background: on ? "#e6f6e1" : "#ffffff", border: `1px solid ${on ? "#1d7a2f" : "#d9c7a0"}`, color: "inherit", transition: "border-color .12s, background .12s" }}>
                  <span style={{ width: 22, height: 22, flex: "0 0 auto", borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900,
                    background: on ? "#e6f6e1" : "transparent", border: `1px solid ${on ? "#43b047" : "#3b2a1a"}`, color: "#1d7a2f" }}>{on ? "✓" : ""}</span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 800 }}>セット{i + 1}
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#5e4f3c", marginLeft: 8 }}>{chunkSizes[i]}問</span></span>
                </button>
              );
            })}
          </div>

          {/* 出題数プレビュー＋開始 */}
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#4a3d2e", marginBottom: 10 }}>出題数 <span style={{ fontSize: 18, fontWeight: 900, color: selectedCount > 0 ? "#1f1a14" : "#5e4f3c" }}>{selectedCount}</span> 問{allSelected ? "（コース全問）" : ""}</div>
            <button data-sfx="warp" onClick={startPickTest} disabled={selectedCount === 0}
              style={{ ...primaryBtn("linear-gradient(90deg,#43b047,#1f9e3a)"), width: "100%", opacity: selectedCount === 0 ? 0.4 : 1, cursor: selectedCount === 0 ? "not-allowed" : "pointer" }}>
              ⚡ テスト開始（{selectedCount}問）
            </button>
            <button data-sfx="back" onClick={() => setScreen("home")} style={{ ...linkBtn, marginTop: 16 }}>ワールド選択に戻る</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════ RANDOMPICK（ランダム演習＝復習用: ブロックを選ぶ） ════════════════
  if (screen === "randompick") {
    return (
      <div style={wrap} className="wrap">
        {styleTag}
        <div style={{ maxWidth: 480, width: "100%", minWidth: 0 }}>
          {/* ヘッダ */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
            <button data-sfx="back" onClick={() => setScreen("home")} aria-label="ホームへ戻る" className="iconbtn" style={{ width: 36, height: 36, borderRadius: 10, background: "#ffffff", border: "1px solid #3b2a1a", color: "#3b3024", cursor: "pointer", fontSize: 17, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>←</button>
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: 0.5 }}><QBlock size={20} style={{ verticalAlign: "-0.2em", marginRight: 6 }} />ランダム演習（復習）</span>
            <span style={{ width: 36 }} aria-hidden="true" />
          </div>

          <p style={{ margin: "18px 0 12px", fontSize: 12.5, lineHeight: 1.7, color: "#4a3d2e" }}>
            忘れかけたコースを選ぶと、その中から<span style={{ color: "#1d7a2f", fontWeight: 700 }}>ランダム{RANDOM_BLOCK_N}問</span>をシャッフルして出題します。<br />
            バッジ判定はなし・記憶メンテナンス用です。
          </p>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#5e4f3c", margin: "6px 0 10px" }}>復習するコースを選ぶ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sections.map((sec, i) => {
              const blk = blocks[i] || { no: i + 1, kind: "" };
              return (
                <button data-sfx="warp" key={i} onClick={() => startRandom(i, RANDOM_BLOCK_N)} className="secbtn" disabled={isLocked(i)}
                  style={{ opacity: isLocked(i) ? 0.5 : 1, display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 12, cursor: isLocked(i) ? "default" : "pointer", background: "#fff8e7", border: "1px solid #3b2a1a", color: "#1f1a14", textAlign: "left", width: "100%" }}>
                  <span style={{ width: 28, height: 28, flex: "0 0 auto", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, background: "#e6f6e1", border: "1px solid #1d7a2f", color: "#1d7a2f" }}>{blk.no}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800 }}>{sectionLabels[i]}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: "#1f9e3a", whiteSpace: "nowrap" }}><QBlock size={15} style={{ verticalAlign: "-0.2em", marginRight: 6 }} />{Math.min(RANDOM_BLOCK_N, sec.length)}問</span>
                </button>
              );
            })}
          </div>

          {/* 全体からランダム: ブロック選択リストの一番下に強調表示 */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 10px" }}>
            <div style={{ flex: 1, height: 1, background: "#d9c7a0" }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#5e4f3c", whiteSpace: "nowrap" }}>または</span>
            <div style={{ flex: 1, height: 1, background: "#d9c7a0" }} />
          </div>
          <button data-sfx="warp" onClick={() => startRandom(-1, RANDOM_BLOCK_N)} className="secbtn"
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", borderRadius: 12, cursor: "pointer",
              background: "linear-gradient(180deg,#43b047,#2e8b3a)", border: "3px solid #3b2a1a", boxShadow: "0 4px 0 #3b2a1a", color: "#ffffff", textAlign: "left", width: "100%" }}>
            <span style={{ fontSize: 22 }}>🌐</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 900 }}>全体からランダム</div>
              <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 1 }}>全コース横断</div>
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: "#fff4c2", whiteSpace: "nowrap" }}><QBlock size={15} style={{ verticalAlign: "-0.2em", marginRight: 6 }} />{RANDOM_BLOCK_N}問</span>
          </button>

          <button data-sfx="back" onClick={() => setScreen("home")} style={{ ...linkBtn, display: "block", margin: "20px auto 0" }}>ホームへ</button>
        </div>
      </div>
    );
  }

  // ════════════════ STUDY（暗記: 10覚える→10テスト の繰り返し） ════════════════
  if (screen === "study") {
    // 暗記内テストの結果
    if (studySub === "quizdone") {
      const s = quizScore || { correct: 0, total: 0 };
      const isLast = studyChunk + 1 >= chunkCount;
      const perfect = s.total > 0 && s.correct === s.total;
      const misses = (studyProgress[secIdx] || {})[studyChunk] || []; // この回で一発正解できなかった問題ID
      const remaining = chunkCount - (studyChunk + 1);                 // このブロックで残っているセット数
      return (
        <div style={wrap} className="wrap">
          {styleTag}
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center", paddingTop: 30 }}>
            <div style={{ fontSize: 13, letterSpacing: 3, opacity: 0.6 }}>{sectionLabels[secIdx]} ・ セット {studyChunk + 1} / {chunkCount}</div>
            <div style={{ fontSize: 54, fontWeight: 900, margin: "10px 0 0", color: perfect ? "#7ed957" : "#1f9e3a" }}>{s.correct}<span style={{ fontSize: 22, opacity: 0.7 }}> / {s.total}</span></div>
            <div style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>{perfect ? "全問正解 ✓" : "正解"}</div>
            {heroes(perfect)}

            {/* ブロック全体の進捗（“まだ続く”ことを示す途中経過） */}
            <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 12, background: "#fff8e7", border: "1px solid #d9c7a0" }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#3b3024" }}>
                {sectionLabels[secIdx]}：<span style={{ color: "#1f9e3a" }}>{setDoneCount(secIdx)}</span> / {chunkCount} セット完了
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>{setDots(secIdx)}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
              {/* この回のミスだけに挑戦（残っている間だけ・前進導線の上に併置） */}
              {misses.length > 0 && (
                <button data-sfx="warp" onClick={startChunkMisses} style={primaryBtn("linear-gradient(90deg,#f0a000,#d98e00)")}>🔁 ミスに挑戦（{misses.length}問）</button>
              )}
              {!isLast ? (
                /* 前進導線は常に目立つ primary。残りセット数を明示して“終わった誤解”を防ぐ */
                <button onClick={() => { setStudyChunk((c) => c + 1); setStudySub("learn"); }} style={primaryBtn("linear-gradient(90deg,#43b047,#1f9e3a)")}>次のセットへ（残り{remaining}）→</button>
              ) : (
                <>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#7ed957", marginTop: 2 }}>🎉 最後のセット！仕上げにコーステストで力試し</div>
                  <button data-sfx="warp" onClick={() => startTest(secIdx)} style={primaryBtn("linear-gradient(90deg,#1f9e3a,#7ed957)")}>⚡ コーステスト（{secQuestions.length}問）</button>
                </>
              )}
              <button onClick={() => setStudySub("learn")} style={ghostBtn}>覚える画面に戻る</button>
              <button data-sfx="back" onClick={() => setScreen("home")} style={{ ...linkBtn, marginTop: 6 }}>ワールド選択に戻る</button>
            </div>
          </div>
        </div>
      );
    }
    // learn: 現在の10問を覚える
    return (
      <div style={wrap} className="wrap">
        {styleTag}
        <div style={{ maxWidth: 560, width: "100%", paddingBottom: 92 }}>
          {/* ヘッダ */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button data-sfx="back" onClick={() => setScreen("home")} aria-label="ホームへ戻る" className="iconbtn" style={{ width: 36, height: 36, borderRadius: 10, background: "#ffffff", border: "1px solid #3b2a1a", color: "#3b3024", cursor: "pointer", fontSize: 17, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>←</button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.1 }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 3, color: "#1f1a14" }}>WORLD</span>
              <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: 0.5 }}>{(blocks[secIdx] || {}).course}</span>
            </div>
            <span style={{ width: 36 }} aria-hidden="true" />
          </div>

          <div style={{ marginTop: 12 }}>
            <Bubble who="mario">緑が正解の選択肢、<b>黄色いマーカーが正誤の決め手</b>。💡で「正しくは」も確認しよう！</Bubble>
          </div>

          {/* セット進捗：初見でも「全Nセット中の何番目か」が分かるよう明示 */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#3b3024" }}>覚える ・ セット {studyChunk + 1} <span style={{ color: "#5e4f3c", fontWeight: 700 }}>/ {chunkCount}</span></span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5e4f3c" }}>完了 {setDoneCount(secIdx)} / {chunkCount}</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "#ffffff", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round(setDoneCount(secIdx) / chunkCount * 100)}%`, background: "linear-gradient(90deg,#1f9e3a,#7ed957)", borderRadius: 999, transition: "width .25s" }} />
            </div>
          </div>

          {/* セット選択：まとまったセグメントコントロール（現在=青で塗り / 完了=緑文字 / 未着手=淡色） */}
          <div style={{ display: "inline-flex", gap: 4, padding: 4, marginTop: 14, marginBottom: 4, background: "#fff8e7", border: "1px solid #d9c7a0", borderRadius: 999 }}>
            {Array.from({ length: chunkCount }).map((_, i) => {
              const cur = i === studyChunk;
              const m = (studyProgress[secIdx] || {})[i]; // undefined=未挑戦 / []=完了 / [..]=ミス残り
              const done = m && m.length === 0;        // 全問正解で学習完了
              const partial = m && m.length > 0;       // 挑戦したがミスが残っている
              return (
                <button key={i} onClick={() => { setStudyChunk(i); setStudySub("learn"); }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, minWidth: 54, padding: "7px 14px", fontSize: 14, fontWeight: 800, borderRadius: 999, cursor: "pointer", border: "none",
                    color: cur ? "#ffffff" : done ? "#1f9e3a" : partial ? "#d98e00" : "#4a3d2e",
                    background: cur ? "linear-gradient(90deg,#43b047,#7ed957)" : "transparent",
                    boxShadow: cur ? "0 2px 10px #43b04755" : "none", transition: "background .15s, color .15s" }}>
                  セット{i + 1}
                  {done && <span aria-label="学習完了" style={{ fontSize: 13, fontWeight: 900, color: cur ? "#ffffff" : "#1f9e3a" }}>✓</span>}
                  {partial && <span aria-label={`ミス残り${m.length}問`} style={{ minWidth: 16, height: 16, padding: "0 4px", boxSizing: "border-box",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 99, fontSize: 10, fontWeight: 900, lineHeight: 1,
                    color: cur ? "#ffffff" : "#d98e00", background: cur ? "#d98e00" : "#fff4c2", border: `1px solid ${cur ? "#d98e00" : "#d98e0066"}` }}>{m.length}</span>}
                </button>
              );
            })}
          </div>

          <div className="card-in" style={{ marginTop: 14 }}>
            {chunkQs.map((q) => (<StudyCard key={q.id} q={q} mono={mono} flagged={!!flaggedIds[q.id]} onToggleFlag={() => toggleFlag(q.id)} />))}
          </div>

        </div>
        {/* 最下部に固定表示するテストボタン */}
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30, pointerEvents: "none",
          padding: "16px 16px calc(16px + env(safe-area-inset-bottom))",
          background: "none" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", pointerEvents: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* このセットにミスが残っていれば、ミスだけ再挑戦する導線も出す */}
            {((studyProgress[secIdx] || {})[studyChunk] || []).length > 0 && (
              <button data-sfx="warp" onClick={startChunkMisses} style={{ width: "100%", padding: "12px", fontSize: 15, fontWeight: 800,
                borderRadius: 13, cursor: "pointer", color: "#6b4a00",
                border: "1px solid #d98e0066", background: "linear-gradient(180deg,#fff4c2,#ffe9a0)" }}>
                🔁 ミスに挑戦（{((studyProgress[secIdx] || {})[studyChunk] || []).length}問）
              </button>
            )}
            <button data-sfx="warp" onClick={startChunkQuiz} style={{ width: "100%", padding: "17px", fontSize: 18, fontWeight: 900,
              border: "none", borderRadius: 16, cursor: "pointer", color: "#ffffff",
              background: "linear-gradient(90deg,#1f9e3a,#7ed957)", boxShadow: "0 6px 26px #1f9e3a55" }}>
              ⚡ この{chunkQs.length}問をテスト
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════ TEST（テスト/暗記内チェック 共通ランナー） ════════════════
  if (screen === "test") {
    const q = testQueue[testPos];
    if (!q) return <div style={wrap} className="wrap">{styleTag}</div>;
    const qTotal = testQueue.length;
    const isSection = testMode === "section";
    const isReview = testMode === "review";
    const isRandom = testMode === "random";
    const isExam = testMode === "exam";
    const isExamMiss = testMode === "exammiss";
    const isFlagged = testMode === "flagged";
    const coins = testResults.filter((r) => r.ok).length; // 一発正解の数＝コイン
    const runTitle = isSection ? `${sectionLabels[secIdx]} テスト` : isExam ? "🏰 かめおの城（総合テスト）" : isExamMiss ? "🔁 総合テストの覚え直し" : isFlagged ? "🔖 要復習に挑戦" : isReview ? "🔁 間違えた問題に挑戦" : isRandom ? <><QBlock size={15} style={{ verticalAlign: "-0.2em", marginRight: 6 }} />{randomLabel} ランダム</> : `第${studyChunk + 1}セット チェック`;
    return (
      <div style={wrap} className="wrap">
        {styleTag}
        <div style={{ maxWidth: 560, width: "100%", display: "flex", flexDirection: "column", flex: 1 }}>
          {/* ヘッダ */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, fontWeight: 700 }}>
            <button data-sfx="back" onClick={() => { if (isRandom) openBlockRandom(); else if (isSection || isReview || isExam || isExamMiss || isFlagged) setScreen("home"); else { setStudySub("learn"); setScreen("study"); } }} style={{ background: "none", border: "none", color: "#4a3d2e", cursor: "pointer", fontSize: 13 }}>← 中断</button>
            <span style={{ fontWeight: 700 }}>{runTitle}</span>
            <span>{testPos + 1} / {qTotal}</span>
          </div>
          {debug && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button data-sfx="none" onClick={() => debugEnd(1)} style={{ flex: 1, padding: "6px", fontSize: 12, fontWeight: 800, border: "2px dashed #7b2c9c", borderRadius: 8, background: "#f4e8ff", color: "#5a1a7a", cursor: "pointer" }}>【確認用】全問正解で終える</button>
              <button data-sfx="none" onClick={() => debugEnd(0.6)} style={{ flex: 1, padding: "6px", fontSize: 12, fontWeight: 800, border: "2px dashed #7b2c9c", borderRadius: 8, background: "#f4e8ff", color: "#5a1a7a", cursor: "pointer" }}>【確認用】6割正解で終える</button>
            </div>
          )}
          <div style={{ height: 6, background: "#e8dcc0", borderRadius: 99, overflow: "hidden", marginTop: 8 }}>
            <div style={{ width: `${(testPos / qTotal) * 100}%`, height: "100%", background: "linear-gradient(90deg,#43b047,#1f9e3a)", transition: "width .3s" }} />
          </div>

          {/* ルイージ（正解でジャンプ＋コイン／不正解でしょんぼり）とコイン枚数 */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 10, height: 56 }}>
            <div style={{ position: "relative" }}>
              <Hero key={`${testPos}-${phase}`} who="luigi" px={3} pose={phase === "reveal" ? (lastOk ? "jump" : "sad") : "idle"} />
              {phase === "reveal" && lastOk && <Coin key={`c${testPos}`} className="coinpop" style={{ left: 10, top: -8 }} />}
            </div>
            <div aria-label={`コイン ${coins}枚`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "#ffffff", border: "2px solid #3b2a1a", fontWeight: 900, fontSize: 15 }}>
              <Coin px={2} /> × {coins}
            </div>
          </div>

          {/* 要復習フラグ: 問題が表示されている間（回答前・回答後どちらも）いつでもON/OFFできる目立つボタン。正解・不正解に関係なく手動管理・自動では外れない。 */}
          <button onClick={() => toggleFlag(q.id)} aria-pressed={!!flaggedIds[q.id]}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", marginTop: 12, padding: "11px 0", borderRadius: 12, cursor: "pointer",
              fontSize: 14, fontWeight: 800, transition: "background .15s, border-color .15s, box-shadow .15s",
              background: flaggedIds[q.id] ? "linear-gradient(90deg,#f0a000,#d98e00)" : "#ffffff",
              border: `1.5px solid ${flaggedIds[q.id] ? "#d98e00" : "#3b2a1a"}`,
              color: flaggedIds[q.id] ? "#3b2a1a" : "#3b3024",
              boxShadow: flaggedIds[q.id] ? "0 0 16px #d98e0055" : "none" }}>
            {flaggedIds[q.id] ? "🔖 要復習に登録中（押して解除）" : "🔖 要復習に追加する"}
          </button>

          {/* 問題カード（card-in の入場アニメは付けない＝問題遷移ごとの再発火による描画フラッシュを防ぐ。不正解時の shake のみ） */}
          <div className={phase === "reveal" && !lastOk ? "shake" : ""} style={{ marginTop: 16,
            background: "linear-gradient(180deg,#ffffff,#fffaf0)",
            border: `3px solid ${phase === "reveal" ? (lastOk ? "#1f9e3a" : "#e52521") : "#3b2a1a"}`,
            borderRadius: 14, padding: "22px 20px",
            boxShadow: "0 5px 0 #3b2a1a55", transition: "border-color .2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11, opacity: 0.5 }}>
              <span>{q.source}・{q.category}</span>
              <span>{q.type === "multi" ? `${q.selectCount}つ選ぶ` : "1つ選ぶ"}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{q.question}</div>

            {phase === "reveal" && (
              <div style={{ marginTop: 16, borderTop: "1px solid #3b2a1a", paddingTop: 14 }}>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10, color: lastOk ? "#1f9e3a" : "#e52521" }}>
                  {lastOk ? "✓ 正解" : "✕ 不正解"}
                </div>
                {/* 暗記モードと同じ: 全選択肢表示・正解だけ濃く（緑＋黄マーカー）。誤答した自分の選択も印 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.choices.map((c) => {
                    const correct = q.answer.includes(c.label);
                    const picked = Array.isArray(lastInput) && lastInput.includes(c.label);
                    const hint = hintsFor(q, c.label);
                    return (
                      <div key={c.label} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "8px 11px", borderRadius: 9,
                        background: correct ? "#e3f7df" : "transparent",
                        border: `1px solid ${correct ? "#1f9e3a66" : (picked ? "#e5252166" : "#d9c7a0")}` }}>
                        <span style={{ fontSize: 11, fontWeight: 800, minWidth: 14, textAlign: "center", color: correct ? "#1f9e3a" : (picked ? "#e52521" : "#9a8a70") }}>{c.label}</span>
                        <span style={{ fontSize: 15, fontFamily: mono, lineHeight: 1.5, flex: 1, color: correct ? "#1f1a14" : "#4a3d2e" }}>
                          {correct ? <Highlight text={c.text} keys={hint} color="#ffd84a" on={true} variant="marker" /> : c.text}
                        </span>
                        {picked && !correct && <span style={{ fontSize: 10, color: "#e52521", whiteSpace: "nowrap" }}>あなたの回答</span>}
                      </div>
                    );
                  })}
                </div>
                {q.mnemonic && (
                  <div style={{ marginTop: 12, fontSize: 13, color: "#6b4a00", background: "#fff4c2", border: "1px solid #e0b000", borderRadius: 10, padding: "8px 12px", lineHeight: 1.6 }}>💡 {q.mnemonic}</div>
                )}
              </div>
            )}
          </div>

          {/* 操作 */}
          <div style={{ marginTop: 14 }}>
            {phase === "answer" ? (
              <>
                {q.type === "single" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {q.choices.map((c, i) => (
                      <button data-sfx="none" key={c.label} className="choice" onMouseDown={(e) => e.preventDefault()} onClick={() => submitAnswer([c.label])} onMouseEnter={() => setCursor(i)}
                        style={{ ...choiceRow("#ffffff", "#3b2a1a"), ...(i === cursor ? { boxShadow: "inset 0 0 0 2px #7ed957" } : {}) }}>
                        <span style={{ fontSize: 11, opacity: 0.3, minWidth: 16, textAlign: "center" }}>{c.label}</span>
                        <span style={{ fontSize: 16, fontFamily: mono, lineHeight: 1.5 }}>{c.text}</span>
                      </button>
                    ))}
                    <div style={{ fontSize: 11, opacity: 0.4, marginTop: 4, textAlign: "center" }}>↑↓で移動・Enterで決定（1〜4キーでも即決）</div>
                  </div>
                )}
                {q.type === "multi" && (
                  <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {q.choices.map((c, i) => {
                        const on = multiSel.includes(c.label);
                        return (
                          <button key={c.label} className="choice" onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setCursor(i)}
                            onClick={() => setMultiSel((s) => on ? s.filter((x) => x !== c.label) : [...s, c.label])}
                            style={{ ...choiceRow(on ? "#d4f0cc" : "#ffffff", on ? "#43b047" : "#3b2a1a"), ...(i === cursor ? { boxShadow: "inset 0 0 0 2px #7ed957" } : {}) }}>
                            <span style={{ fontSize: 16, fontWeight: 900, color: on ? "#43b047" : "#b0a080", minWidth: 22, textAlign: "center" }}>{on ? "✓" : "○"}</span>
                            <span style={{ fontSize: 16, fontFamily: mono, lineHeight: 1.5 }}>{c.text}</span>
                          </button>
                        );
                      })}
                    </div>
                    <button data-sfx="none" onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setCursor(q.choices.length)} onClick={() => multiSel.length && submitAnswer(multiSel)} disabled={!multiSel.length}
                      style={{ ...primaryBtn("linear-gradient(90deg,#43b047,#1f9e3a)"), width: "100%", marginTop: 10, opacity: multiSel.length ? 1 : 0.4, ...(cursor === q.choices.length ? { boxShadow: "inset 0 0 0 2px #7ed957" } : {}) }}>
                      決定（{multiSel.length}/{q.selectCount}）
                    </button>
                    <div style={{ fontSize: 11, opacity: 0.4, marginTop: 6, textAlign: "center" }}>↑↓で移動・Enterで選択／決定ボタンまで動かしてEnterで回答</div>
                  </div>
                )}
              </>
            ) : (isCram(testMode) && !lastOk) ? (
              /* 覚えるモード系（暗記10問／ランダム演習／総合の覚え直し）で不正解のときは「次へ」を出さず、正解するまで「もう一度チャレンジ」だけ（採点は最初の不正解のまま）。学習動線の制御。 */
              <button onClick={retryQuestion} style={{ width: "100%", padding: "13px", fontSize: 15, fontWeight: 800,
                border: "1px solid #1d7a2f", borderRadius: 12, cursor: "pointer", color: "#ffffff",
                background: "linear-gradient(180deg,#43b047,#2e8b3a)" }}>
                🔁 もう一度チャレンジ（Enter）
              </button>
            ) : (
              /* 次へは主張を抑える（彩度/サイズを下げ、問題文と黄マーカーが一番目立つように） */
              <button onClick={nextTest} style={{ width: "100%", padding: "13px", fontSize: 15, fontWeight: 800,
                border: "1px solid #8e1411", borderRadius: 12, cursor: "pointer", color: "#ffffff",
                background: "linear-gradient(180deg,#e52521,#b81c18)" }}>
                {testPos + 1 >= qTotal ? (isSection ? "結果を見る（Enter）" : "採点する（Enter）") : "次へ →（Enter）"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════ RESULT（結果） ════════════════
  if (screen === "result") {
    const s = lastScore || { correct: 0, total: 0, pct: 0, badge: false };
    if (s.exam) {  // 総合テスト（模試）の結果
      const need = Math.max(0, EXAM_PASS - s.correct);
      return (
        <div style={wrap} className="wrap">
          {styleTag}
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center", paddingTop: 30 }}>
            <div style={{ fontSize: 13, letterSpacing: 3, opacity: 0.6 }}>🏰 かめおの城の結果</div>
            <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1, margin: "10px 0 0", color: s.pass ? (s.gold ? "#d98e00" : "#1f9e3a") : "#3b3024", textShadow: s.pass ? (s.gold ? "0 0 30px #d98e0066" : "0 0 28px #1f9e3a55") : "none" }}>
              {s.correct}<span style={{ fontSize: 24, opacity: 0.7 }}> / {s.total}</span>
            </div>
            <div style={{ fontSize: 14, opacity: 0.6, marginTop: 2 }}>正解（{s.pct}%）・合格ライン {EXAM_PASS}問</div>
            {s.pass ? (
              <CastleClear gold={s.gold} mode={s.rescue ? "rescue" : examComplete ? "thanks" : "another"} remaining={EXAM_SLOTS - examSlots.length} treasure={s.treasure} />
            ) : (
              <>{heroes(false)}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#d98e00" }}>不合格</div>
                <div style={{ fontSize: 13, opacity: 0.6, marginTop: 6, lineHeight: 1.7 }}>あと{need}問で合格（{EXAM_PASS}問＝6割）。</div>
              </div>
              </>
            )}

            {/* コレクション */}
            <div style={{ marginTop: 22, padding: "14px", borderRadius: 13, background: "#fff8e7", border: "1px solid #d9c7a0" }}>
              {examStrip(28)}
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 9, color: examMastered ? "#d98e00" : examComplete ? "#1f9e3a" : "#4a3d2e" }}>
                {examMastered ? "🎉 完全制覇！" : `修了バッジ ${examSlots.length} / ${EXAM_SLOTS}`}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
              {s.missed && s.missed.length > 0 && (
                <button data-sfx="warp" onClick={() => startExamMisses(s.missed)} style={primaryBtn("linear-gradient(90deg,#f0a000,#d98e00)")}>🔁 間違えた問題を覚える（{s.missed.length}問）</button>
              )}
              <button onClick={startExam} style={primaryBtn("linear-gradient(90deg,#1f9e3a,#1f9e3a)")}>🏰 もう一度 かめおの城へ</button>
              <button data-sfx="back" onClick={() => setScreen("home")} style={ghostBtn}>ホームへ</button>
            </div>
          </div>
        </div>
      );
    }
    if (s.exammiss) {  // 総合テストの覚え直し結果（正解するまで繰り返した後、まだ残るミス）
      const remain = s.missed ? s.missed.length : 0;
      return (
        <div style={wrap} className="wrap">
          {styleTag}
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center", paddingTop: 34 }}>
            <div style={{ fontSize: 13, letterSpacing: 3, opacity: 0.6 }}>🔁 覚え直しの結果</div>
            <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.1, margin: "10px 0 0", color: "#1f9e3a" }}>{s.correct}<span style={{ fontSize: 22, opacity: 0.7 }}> / {s.total}</span></div>
            <div style={{ fontSize: 14, opacity: 0.6, marginTop: 2 }}>正解</div>
            {heroes(isGood(s))}
            <div style={{ fontSize: 14, marginTop: 18, lineHeight: 1.7, color: remain === 0 ? "#1f9e3a" : "#3b3024" }}>
              {remain === 0 ? "🎉 全部覚えた！" : `残り ${remain}問`}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 26 }}>
              {remain > 0 && <button onClick={() => startExamMisses(s.missed)} style={primaryBtn("linear-gradient(90deg,#f0a000,#d98e00)")}>もう一度 間違えた問題を覚える</button>}
              <button data-sfx="back" onClick={() => setScreen("home")} style={ghostBtn}>ホームへ</button>
            </div>
          </div>
        </div>
      );
    }
    if (s.review) {  // 間違えた問題の復習結果
      const remain = wrongList.length;
      return (
        <div style={wrap} className="wrap">
          {styleTag}
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center", paddingTop: 34 }}>
            <div style={{ fontSize: 13, letterSpacing: 3, opacity: 0.6 }}>🔁 復習の結果</div>
            <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.1, margin: "10px 0 0", color: "#1f9e3a" }}>{s.correct}<span style={{ fontSize: 22, opacity: 0.7 }}> / {s.total}</span></div>
            <div style={{ fontSize: 14, opacity: 0.6, marginTop: 2 }}>正解</div>
            {heroes(isGood(s))}
            <div style={{ fontSize: 14, marginTop: 18, lineHeight: 1.7, color: remain === 0 ? "#1f9e3a" : "#3b3024" }}>
              {remain === 0 ? "🎉 苦手をすべてクリア！" : `残り苦手 ${remain}問`}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 26 }}>
              {remain > 0 && <button onClick={startReview} style={primaryBtn("linear-gradient(90deg,#43b047,#1f9e3a)")}>もう一度 間違えた問題に挑戦</button>}
              <button data-sfx="back" onClick={() => setScreen("home")} style={ghostBtn}>ホームへ</button>
            </div>
          </div>
        </div>
      );
    }
    if (s.flagged) {  // 要復習フラグの挑戦結果（フラグは正解しても外れない＝残り数はflaggedListそのもの）
      const remain = flaggedList.length;
      return (
        <div style={wrap} className="wrap">
          {styleTag}
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center", paddingTop: 34 }}>
            <div style={{ fontSize: 13, letterSpacing: 3, opacity: 0.6 }}>🔖 要復習の結果</div>
            <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.1, margin: "10px 0 0", color: "#1f9e3a" }}>{s.correct}<span style={{ fontSize: 22, opacity: 0.7 }}> / {s.total}</span></div>
            <div style={{ fontSize: 14, opacity: 0.6, marginTop: 2 }}>正解</div>
            {heroes(isGood(s))}
            <div style={{ fontSize: 14, marginTop: 18, lineHeight: 1.7, color: remain === 0 ? "#1f9e3a" : "#3b3024" }}>
              {remain === 0 ? "🎉 要復習が0問に！" : `要復習に残っている問題 ${remain}問`}
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.5, marginTop: 6, lineHeight: 1.7 }}>正解しても🔖は自動で外れません。解説画面の🔖ボタンで手動で外してください。</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 26 }}>
              {remain > 0 && <button onClick={startFlagged} style={primaryBtn("linear-gradient(90deg,#f0a000,#d98e00)")}>もう一度 要復習に挑戦</button>}
              <button data-sfx="back" onClick={() => setScreen("home")} style={ghostBtn}>ホームへ</button>
            </div>
          </div>
        </div>
      );
    }
    if (s.random) {  // ランダム演習の結果（バッジ無し）
      const pass = s.pct >= PASS_PCT;
      return (
        <div style={wrap} className="wrap">
          {styleTag}
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center", paddingTop: 34 }}>
            <div style={{ fontSize: 13, letterSpacing: 3, opacity: 0.6 }}><QBlock size={16} style={{ verticalAlign: "-0.2em", marginRight: 6 }} />{s.label} ランダムの結果</div>
            <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1, margin: "10px 0 0", color: pass ? "#1f9e3a" : "#3b3024", textShadow: pass ? "0 0 28px #1f9e3a55" : "none" }}>
              {s.pct}<span style={{ fontSize: 26 }}>%</span>
            </div>
            <div style={{ fontSize: 14, opacity: 0.6, marginTop: 2 }}>{s.correct} / {s.total} 問正解</div>
            {heroes(isGood(s))}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 26 }}>
              {s.missed && s.missed.length > 0 && (
                <button data-sfx="warp" onClick={() => startRandomMisses(s.missed)} style={primaryBtn("linear-gradient(90deg,#f0a000,#d98e00)")}>🔁 この演習のミスに挑戦（{s.missed.length}問）</button>
              )}
              <button onClick={openBlockRandom} style={primaryBtn("linear-gradient(90deg,#43b047,#1f9e3a)")}><QBlock size={18} style={{ verticalAlign: "-0.2em", marginRight: 6 }} />もう一度ランダム（コースを選ぶ）</button>
              <button data-sfx="back" onClick={() => setScreen("home")} style={ghostBtn}>ホームへ</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div style={wrap} className="wrap">
        {styleTag}
        <div style={{ maxWidth: 460, width: "100%", textAlign: "center", paddingTop: 30 }}>
          <div style={{ fontSize: 13, letterSpacing: 4, opacity: 0.6 }}>{sectionLabels[secIdx]} 結果{s.full ? "" : "（範囲選択）"}</div>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1, margin: "10px 0 0", color: s.pass ? "#1f9e3a" : "#3b3024", textShadow: s.pass ? "0 0 28px #1f9e3a55" : "none" }}>
            {s.pct}<span style={{ fontSize: 26 }}>%</span>
          </div>
          <div style={{ fontSize: 14, opacity: 0.6, marginTop: 2 }}>{s.correct} / {s.total} 問正解</div>
          {!s.badge && heroes(isGood(s))}

          {s.badge ? (
            /* ブロック全問を選択して合格＝🏅ブロック合格 */
            <CourseClear />
          ) : s.pass ? (
            /* 合格ラインは超えたが、部分選択なのでブロック合格(🏅)ではない */
            <div className="card-in" style={{ marginTop: 18 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#1f9e3a" }}>✓ 合格</div>
              <div style={{ fontSize: 12.5, opacity: 0.7, marginTop: 6, lineHeight: 1.7 }}>全チャンクを選んで合格すると<br />コースクリア🚩になります。</div>
            </div>
          ) : (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#d98e00" }}>不合格</div>
              <div style={{ fontSize: 13, opacity: 0.6, marginTop: 6, lineHeight: 1.7 }}>あと{Math.max(1, Math.ceil(s.total * PASS_PCT / 100) - s.correct)}問で合格（{PASS_PCT}%）。<br />覚え直してもう一度。</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
            <button onClick={() => openTestPick(secIdx)} style={primaryBtn("linear-gradient(90deg,#43b047,#1f9e3a)")}>もう一度テスト</button>
            <button data-sfx="back" onClick={() => openStudy(secIdx)} style={ghostBtn}>覚え直す</button>
          </div>
          <button data-sfx="back" onClick={() => setScreen("home")} style={{ ...linkBtn, marginTop: 18 }}>ワールド選択に戻る</button>
        </div>
      </div>
    );
  }

  return <div style={wrap} className="wrap">{styleTag}</div>;
}

const linkBtn = { background: "none", border: "none", color: "#1f1a14", fontWeight: 700, cursor: "pointer", fontSize: 12, padding: 0, textDecoration: "underline" };
const ghostBtn = { padding: "16px 22px", fontSize: 15, fontWeight: 800, color: "#3b3024", background: "#ffffff", border: "3px solid #3b2a1a", borderRadius: 12, cursor: "pointer", boxShadow: "0 4px 0 #3b2a1a55" };
function primaryBtn(grad) { return { flex: 1, padding: "16px", fontSize: 16, fontWeight: 900, color: "#ffffff", background: grad, border: "3px solid #3b2a1a", borderRadius: 12, cursor: "pointer", boxShadow: "0 4px 0 #3b2a1a", textShadow: "1px 1px 0 #3b2a1a88" }; }
function choiceRow(bg, bd) { return { display: "flex", alignItems: "center", gap: 14, textAlign: "left", padding: "16px 18px", background: bg, border: `2px solid ${bd}`, borderRadius: 16, cursor: "pointer", color: "#1f1a14", transition: "transform .08s, background .15s, border .15s" }; }

