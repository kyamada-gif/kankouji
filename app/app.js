/* 自動生成: build.js（app.jsx -> app.js）。手で編集せず app.jsx を直して再ビルド。 */
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const { useState, useEffect, useMemo } = React;
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
  return k >= 0 && q.answerHints && q.answerHints[k] ? q.answerHints[k] : [];
}

// ════════════════════════════════════════════════════════════════
//  マリオ風テーマ: ドット絵スプライト / 背景部品 / 効果音
// ════════════════════════════════════════════════════════════════
// 12×16 のドット絵。H=帽子 C=シャツ O=オーバーオール M=髪・ひげ S=肌 F=靴 Y=ボタン
const HERO = ["...HHHHH....", "..HHHHHHHHH.", "..MMMSSMS...", ".MSMSSSMSSS.", ".MSMMSSSMSSS", ".MMSSSSMMMM.", "...SSSSSSS..", "..CCOCCC....", ".CCCOCCOCCC.", "CCCCOOOOCCCC", "SSCOYOOYOCSS", "SSSOOOOOOSSS", "SSOOOOOOOOSS", "..OOO..OOO..", ".FFF....FFF.", "FFFF....FFFF"];
const COIN = ["..KKKK..", ".KYYYYK.", "KYWYYYOK", "KYWYOYOK", "KYWYOYOK", "KYWYOYOK", "KYWYOYOK", "KYWYYYOK", ".KYYYYK.", "..KKKK.."];
// クリボー 16×16。B=頭 D=まゆ・足 W=白目 T=顔・胴
const GOOMBA = ["......BBBB......", ".....BBBBBB.....", "....BBBBBBBB....", "...BBBBBBBBBB...", "..BDDBBBBBBDDB..", ".BBBWDBBBBDWBBB.", ".BBBWDDDDDDWBBB.", "BBBBWDWBBWDWBBBB", "BBBBWWWBBWWWBBBB", "BBBBBBBBBBBBBBBB", ".BBBBTTTTTTBBBB.", "....TTTTTTTT....", "....TTTTTTTTD...", "..DDDTTTTTTDDD..", ".DDDDDTTTTDDDDD.", ".DDDDDD..DDDDDD."];
// ピーチ 12×20。C=王冠 R=宝石・口 Y=髪 S=肌 B=目 P=ドレス p=ドレスの影
// キノピオ 12×16。W=かさ・ズボン R=かさの水玉 E=目 B=ベスト Y=ベストの縁 F=くつ
const TOAD = ["....WWWW....", "..WWRRRRWW..", ".WRRRRRRRRW.", "WWRRWWWWRRWW", "WWWWWWWWWWWW", "WRRWWWWWWRRW", ".WWWWWWWWWW.", "..SSSSSSSS..", "..SESSSSES..", "..SESSSSES..", "...SSSSSS...", "..BBYSSYBB..", ".SBBWWWWBBS.", ".SBWWWWWWBS.", "...WWWWWW...", "..FFF..FFF.."];
// スター 16×15（キノピオが乗る）。Y=黄 O=縁 K=目
const STAR = [".......OO.......", "......OYYO......", "......OYYO......", ".....OYYYYO.....", "OOOOOOYYYYOOOOOO", ".OYYYYYYYYYYYYO.", "..OYYYKYYKYYYO..", "...OYYKYYKYYO...", "....OYYYYYYO....", "....OYYYYYYO....", "...OYYYYYYYYO...", "...OYYYOOYYYO...", "..OYYYO..OYYYO..", "..OYYO....OYYO..", ".OOO........OOO."];
const PEACH = ["....C.C.C...", "....CCRCC...", "...YYYYYYY..", "..YYSSSSSYY.", "..YSSBSBSSY.", "..YSSSSSSSY.", "..YYSSRSSYY.", ".YYYYSSSYYYY", ".YYPPPPPPPYY", ".YYPpPPPpPYY", "..SPPPPPPPS.", "..SPPPPPPPS.", "...PPPPPPP..", "..PPPPPPPPP.", "..PPpPPPpPP.", ".PPPPPPPPPPP", ".PPPPPPPPPPP", "PPPPPPPPPPPP", "PpPPPPPPPPpP", "PPPPPPPPPPPP"];
// クッパ 20×18（左向き）。H=角・爪・とげ R=髪 O=体 o=腹 K=目 G=甲羅
const BOWSER = ["...H......RR........", "..HH....RRRRR.......", "..OOOO.RRRRRRR......", ".OOKOOORRRRRR.H.H...", "OOOOOOOORRRGGHGGH...", "HOHOOOOOOGGGGGGGGH..", "OOOOOOOOGGHGGGGHGG..", ".OOOOOooGGGGGGGGGGH.", "..OOOooooGGHGGGHGGG.", "..HOOoooooGGGGGGGGG.", ".HOOOoooooGGGGGGGGH.", "..OOOoooooOGGGGGGG..", "...OOoooooOOGGGGG...", "...OOOoooOOOO.......", "..OOOOOOOOOOOO......", "..OOO......OOO......", ".HOOO.....HOOO......", "HHOOO....HHOOO......"];
const SKIN = {
  M: "#6b3a12",
  S: "#f8b878",
  F: "#6b3a12",
  Y: "#fbd000",
  O: "#2038ec"
};
const PALETTES = {
  mario: {
    ...SKIN,
    H: "#e52521",
    C: "#e52521"
  },
  luigi: {
    ...SKIN,
    H: "#20a030",
    C: "#20a030"
  },
  star: {
    Y: "#fbd000",
    O: "#d08800",
    K: "#1a1a1a"
  },
  toad: {
    W: "#ffffff",
    R: "#e52521",
    S: "#f8b878",
    E: "#1a1a1a",
    B: "#2038ec",
    Y: "#fbd000",
    F: "#8b4513"
  },
  coin: {
    K: "#6b3a00",
    Y: "#fbd000",
    W: "#fff6a0",
    O: "#d08800"
  },
  goomba: {
    B: "#a8501c",
    D: "#2a1400",
    W: "#fff4e0",
    T: "#f0c890"
  },
  peach: {
    C: "#fbd000",
    R: "#e52521",
    Y: "#fcd000",
    S: "#f8c8a0",
    B: "#2038ec",
    P: "#f878b0",
    p: "#c83c78"
  },
  bowser: {
    H: "#f4f0e0",
    R: "#e52521",
    O: "#e8a800",
    o: "#f8e0a0",
    K: "#1a1a1a",
    G: "#1f8a2a"
  }
};

// 結果が「よくできた」か（総合テスト＝合格 / それ以外＝9割以上）
function isGood(s) {
  if (!s) return false;
  if (s.exam) return !!s.pass;
  return s.pct >= PASS_PCT;
}

// 文字列グリッド → SVG（同色の連続は1つの rect にまとめる）
function Pixel({
  rows,
  palette,
  px = 3,
  style,
  className,
  title
}) {
  const rects = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let w = 1;
      while (x + w < row.length && row[x + w] === ch) w++;
      if (palette[ch]) rects.push(/*#__PURE__*/React.createElement("rect", {
        key: `${x}-${y}`,
        x: x,
        y: y,
        width: w,
        height: 1,
        fill: palette[ch]
      }));
      x += w;
    }
  });
  const w = rows[0].length,
    h = rows.length;
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${w} ${h}`,
    width: w * px,
    height: h * px,
    shapeRendering: "crispEdges",
    style: style,
    className: className,
    role: title ? "img" : undefined,
    "aria-label": title,
    "aria-hidden": title ? undefined : "true"
  }, rects);
}
function Hero({
  who = "mario",
  px = 3,
  pose = "",
  style
}) {
  return /*#__PURE__*/React.createElement(Pixel, {
    rows: HERO,
    palette: PALETTES[who],
    px: px,
    style: style,
    className: "hero " + pose,
    title: who === "mario" ? "マリオ" : "ルイージ"
  });
}
// 頭の上に小さく名前を付けたマリオ／ルイージ
const HERO_NAMES = {
  mario: "ゆーくん",
  luigi: "みっちゃん"
};
function NamedHero({
  who,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 800,
      color: "#000",
      lineHeight: 1,
      whiteSpace: "nowrap"
    }
  }, HERO_NAMES[who]), /*#__PURE__*/React.createElement(Hero, _extends({
    who: who,
    style: style
  }, rest)));
}
function Coin({
  px = 2,
  style,
  className
}) {
  return /*#__PURE__*/React.createElement(Pixel, {
    rows: COIN,
    palette: PALETTES.coin,
    px: px,
    style: style,
    className: className
  });
}
// ?ブロック（装飾）
function QBlock({
  size = 26,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "qblock",
    "aria-hidden": "true",
    style: {
      width: size,
      height: size,
      fontSize: size * 0.62,
      ...style
    }
  }, "?");
}
// 土管（装飾）
function Pipe({
  w = 44,
  h = 34,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "pipe",
    style: {
      width: w,
      height: 14
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "pipe",
    style: {
      width: w - 8,
      height: h,
      borderTop: "none"
    }
  }));
}
// 背景の風景：空に浮かぶ雲＋画面下の地面（固定・操作の邪魔をしない）
function Cloud({
  style
}) {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 48 20",
    width: 96,
    height: 40,
    "aria-hidden": "true",
    style: {
      position: "absolute",
      ...style
    }
  }, /*#__PURE__*/React.createElement("g", {
    fill: "#fff"
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "14",
    cy: "13",
    rx: "10",
    ry: "6"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "24",
    cy: "9",
    rx: "10",
    ry: "8"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "35",
    cy: "13",
    rx: "10",
    ry: "6"
  })));
}
// かめおの城（背景）。灰色の石積み＋凸凹の城壁＋黒い門と窓。
// 城壁の上（塔の左右）に、攫われたピーチとクッパ。救出後はピーチがいなくなり（マリオの横へ）、クッパが悔しがる
function Castle({
  style,
  rescued = false
}) {
  const tiny = {
    position: "absolute",
    bottom: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    marginBottom: 3,
    padding: "1px 5px",
    fontSize: 9,
    borderWidth: 2,
    whiteSpace: "nowrap"
  };
  const stone = {
    background: "#8c8c8c",
    backgroundImage: "linear-gradient(#4a4a4a 2px, transparent 2px), linear-gradient(90deg, #4a4a4a 2px, transparent 2px)",
    backgroundSize: "16px 10px",
    border: "2px solid #3a3a3a",
    boxSizing: "border-box"
  };
  const crenel = w => ({
    height: 12,
    width: w,
    background: "repeating-linear-gradient(90deg, #8c8c8c 0 12px, transparent 12px 20px)",
    borderBottom: "none"
  });
  return /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      opacity: 0.92,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 2,
      height: 22,
      background: "#3a3a3a",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 2,
      top: 0,
      width: 16,
      height: 11,
      background: "#e52521",
      clipPath: "polygon(0 0,100% 50%,0 100%)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: crenel(70)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...stone,
      width: 70,
      height: 48,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 16,
      background: "#111",
      borderRadius: "5px 5px 0 0"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 16,
      background: "#111",
      borderRadius: "5px 5px 0 0"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...crenel(150),
      position: "relative"
    }
  }, !rescued && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 6,
      bottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bubble",
    style: {
      ...tiny,
      borderColor: "#f878b0"
    }
  }, "\u305F\u3059\u3051\u3066\u301C\uFF01"), /*#__PURE__*/React.createElement(Pixel, {
    rows: PEACH,
    palette: PALETTES.peach,
    px: 2,
    className: "hero idle"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 0,
      bottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bubble",
    style: {
      ...tiny,
      borderColor: "#1f8a2a"
    }
  }, rescued ? "ぐぬぬ…" : "ガハハ！"), /*#__PURE__*/React.createElement(Pixel, {
    rows: BOWSER.map(r => r.padEnd(20, ".")),
    palette: PALETTES.bowser,
    px: 2,
    className: "hero idle",
    style: {
      animationDelay: ".4s"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...stone,
      width: 150,
      height: 76,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "50%",
      bottom: 0,
      transform: "translateX(-50%)",
      width: 30,
      height: 44,
      background: "#111",
      borderRadius: "15px 15px 0 0"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 22,
      top: 16,
      width: 10,
      height: 16,
      background: "#111",
      borderRadius: "5px 5px 0 0"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 22,
      top: 16,
      width: 10,
      height: 16,
      background: "#111",
      borderRadius: "5px 5px 0 0"
    }
  })));
}
// 地面を歩くクリボー（左右反転を繰り返す＝ファミコンの歩き方）
function WalkingGoomba({
  duration = 16,
  delay = 0
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "goomba-walk",
    style: {
      position: "absolute",
      bottom: 33,
      left: 0,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`
    }
  }, /*#__PURE__*/React.createElement(Pixel, {
    rows: GOOMBA,
    palette: PALETTES.goomba,
    px: 2,
    className: "goomba-step",
    title: "\u30AF\u30EA\u30DC\u30FC"
  }));
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
  const ref = React.useRef(null),
    faceRef = React.useRef(null),
    trailRefs = React.useRef([]);
  useEffect(() => {
    if (!show) return;
    const DUR = 3900,
      DELAY = 1000;
    let raf,
      start = null,
      faceLeft = true;
    const step = now => {
      if (start == null) start = now + DELAY;
      const u = Math.max(0, (now - start) / DUR);
      if (u >= 1) {
        setShow(false);
        return;
      }
      const W = window.innerWidth,
        H = window.innerHeight;
      const [x, y] = toadAt(u),
        [x2, y2] = toadAt(Math.min(1, u + 0.004));
      const dx = (x2 - x) * W,
        dy = (y2 - y) * H;
      if (Math.abs(dx) > 0.3) faceLeft = dx < 0; // 進む向きを向く
      const tilt = Math.max(-25, Math.min(25, Math.atan2(dy, Math.abs(dx)) * 180 / Math.PI * 0.5)) * (faceLeft ? -1 : 1);
      if (ref.current) ref.current.style.transform = `translate3d(${x * W - 16}px, ${y * H - 20}px, 0) rotate(${tilt}deg)`;
      if (faceRef.current) faceRef.current.style.transform = faceLeft ? "scaleX(-1)" : "none";
      trailRefs.current.forEach((el, k) => {
        // 後ろに残るキラキラ
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
  return /*#__PURE__*/React.createElement(React.Fragment, null, [0, 1, 2, 3, 4].map(k => /*#__PURE__*/React.createElement("span", {
    key: k,
    ref: el => trailRefs.current[k] = el,
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 6 - k,
      height: 6 - k,
      background: "#fff6a0",
      boxShadow: "0 0 6px #fbd000",
      opacity: 0,
      willChange: "transform"
    }
  })), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      transform: "translate3d(-200px,-200px,0)",
      willChange: "transform"
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: faceRef,
    style: {
      transform: "scaleX(-1)",
      marginBottom: -12,
      position: "relative",
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement(Pixel, {
    rows: TOAD,
    palette: PALETTES.toad,
    px: 2,
    className: "hero",
    title: "\u30AD\u30CE\u30D4\u30AA"
  })), /*#__PURE__*/React.createElement(Pixel, {
    rows: STAR,
    palette: PALETTES.star,
    px: 2,
    className: "star-spin",
    title: "\u30B9\u30BF\u30FC"
  })));
}
// プクプク 16×15（右向き・ファミコン風）。R=体 W=背びれ・顔 T=ひれ・くちびる K=目・口
const CHEEP = ["......TTTTTT....", "..WW.RRRRRR.....", ".WWWRRRRRRRTT...", ".WWWWRRRRWWWWT..", "..WWWRRRWWWWWW..", "..WWRRRRWWKWWK..", "...WRRRRWWKWWK..", "...RRRRRRWWWWWR.", "..RRRRRRRRWWRR..", "T.RRRRRRRRRTTTT.", "TTRRRRRRRRTKKKT.", "TTTRRRRRRTTKKK..", "TT.RRRRRWWTTT...", "T...RRRWWWW.....", "......WWWW......"];
// カロン 16×24（右向き・立ち姿）。K=輪郭 W=骨 Y=目 g=こうら S=こうらの白 B=くつ O=くつ底
const DRYBONES = [".......KKKK.....", "......KWWWWK....", ".....KWWWWWWK...", ".....KWWWKYWK...", ".....KWWWKKWWK..", "....KWWWWWWWWWK.", "....KWWWWWWWWWWK", "....KWWWWWgKKKK.", ".....KWWWWWWWK..", "......KKWWWKK...", "......KWWWK.....", "...KKKKWWWK.....", "..KgggKWWWWK....", ".KgSgSgKWWWK....", ".KgggggKWWWKK...", "KgSgSggKWWWWWK..", "KgggggKWWWWWKK..", "KggSggKWWWWK....", ".KgggKWWWWWK....", "..KKKKWWWWWK....", "....KWWK.KWWK...", "...KBBBK.KBBBK..", "..KBBBBK.KBBBBK.", "..KOOOOK.KOOOOK."];
const DRYBONES_PAL = {
  K: "#111111",
  W: "#f2eedc",
  Y: "#f8d800",
  g: "#9aa2ac",
  S: "#e8e8e0",
  B: "#a8d8e8",
  O: "#e07020"
};
// 羽（カロンの背中に付けてパタパタ）
const WING = ["...WWW", ".WWWWW", "WWWWWW", ".WWWW.", "..WW.."];
// 溶岩のワールドを歩くカロン（左向きのまま、ひょこひょこ跳ねて歩く）
function WalkingDryBones({
  duration = 18,
  delay = 0
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "goomba-walk",
    style: {
      position: "absolute",
      bottom: 33,
      left: 0,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      transform: "scaleX(-1)"
    }
  }, /*#__PURE__*/React.createElement(Pixel, {
    rows: DRYBONES,
    palette: DRYBONES_PAL,
    px: 2,
    className: "hero idle walker",
    title: "\u30AB\u30ED\u30F3"
  })));
}
// 雲の上を飛ぶ羽つきカロン
const PARA_FLY = [{
  top: "26%",
  dur: 13,
  delay: 0
}, {
  top: "58%",
  dur: 17,
  delay: -9
}];
function FlyingDryBones({
  top,
  dur,
  delay
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "swim-left",
    style: {
      position: "absolute",
      top,
      left: 0,
      animationDuration: `${dur}s`,
      animationDelay: `${delay}s`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cheep-bob",
    style: {
      position: "relative",
      animationDelay: `${delay / 3}s`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      transform: "scaleX(-1)"
    }
  }, /*#__PURE__*/React.createElement(Pixel, {
    rows: WING,
    palette: {
      W: "#ffffff"
    },
    px: 3,
    className: "wing-flap",
    style: {
      position: "absolute",
      left: -8,
      top: 12
    }
  }), /*#__PURE__*/React.createElement(Pixel, {
    rows: DRYBONES,
    palette: DRYBONES_PAL,
    px: 2,
    title: "\u7FBD\u3064\u304D\u30AB\u30ED\u30F3"
  }))));
}
// 海のワールドを泳ぐプクプク（top=高さ、dur=横切る秒数、right=右向きに泳ぐ）
const CHEEP_SWIM = [{
  top: "22%",
  dur: 14,
  delay: 0,
  right: false
}, {
  top: "48%",
  dur: 19,
  delay: -8,
  right: true
}, {
  top: "70%",
  dur: 16,
  delay: -4,
  right: false
}];
function SwimmingCheep({
  top,
  dur,
  delay,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: right ? "swim-right" : "swim-left",
    style: {
      position: "absolute",
      top,
      left: 0,
      animationDuration: `${dur}s`,
      animationDelay: `${delay}s`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cheep-bob",
    style: {
      animationDelay: `${delay / 3}s`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      transform: right ? "none" : "scaleX(-1)"
    }
  }, /*#__PURE__*/React.createElement(Pixel, {
    rows: CHEEP,
    palette: {
      R: "#f01010",
      W: "#f8f8f8",
      T: "#d8b0a8",
      K: "#000000"
    },
    px: 2,
    title: "\u30D7\u30AF\u30D7\u30AF"
  }))));
}
// ワールドごとの景色。bg=空の色、ground=地面の見た目、extra=景色の飾り
const WORLD_THEMES = {
  1: {
    name: "草原",
    bg: "linear-gradient(180deg,#6aa4ff 0%,#9cc8ff 70%,#b9dcff 100%)",
    clouds: 0.9
  },
  2: {
    name: "砂漠",
    bg: "linear-gradient(180deg,#f7b955 0%,#fcd98f 65%,#fff0c8 100%)",
    clouds: 0.35
  },
  3: {
    name: "海",
    bg: "linear-gradient(180deg,#4fb4f0 0%,#7fd0f8 55%,#b0e6ff 100%)",
    clouds: 0
  },
  4: {
    name: "雪原",
    bg: "linear-gradient(180deg,#a9cdf2 0%,#d6e9fb 70%,#f4f9ff 100%)",
    clouds: 0.7
  },
  5: {
    name: "雲の上",
    bg: "linear-gradient(180deg,#6cc0ff 0%,#bfe6ff 70%,#e8f6ff 100%)",
    clouds: 1
  },
  6: {
    name: "溶岩地帯",
    bg: "linear-gradient(180deg,#f2774a 0%,#ffa66e 60%,#ffd09a 100%)",
    clouds: 0
  }
};
const worldTheme = w => WORLD_THEMES[w] || WORLD_THEMES[1];
function Ground({
  world
}) {
  const base = {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 30
  };
  if (world === 2) return /*#__PURE__*/React.createElement("div", {
    style: {
      ...base,
      background: "#e0a448",
      borderTop: "3px solid #9a6420",
      backgroundImage: "radial-gradient(#b87a2c 1.5px, transparent 2px)",
      backgroundSize: "14px 9px"
    }
  });
  if (world === 3) return /*#__PURE__*/React.createElement("div", {
    style: {
      ...base,
      background: "#f0d38e",
      borderTop: "3px solid #b8954a",
      backgroundImage: "radial-gradient(#d8b46a 1.5px, transparent 2px)",
      backgroundSize: "12px 8px"
    }
  });
  if (world === 4) return /*#__PURE__*/React.createElement("div", {
    style: {
      ...base,
      background: "#ffffff",
      borderTop: "3px solid #8fb4d8",
      backgroundImage: "linear-gradient(#cfe0f2 2px, transparent 2px), linear-gradient(90deg, #cfe0f2 2px, transparent 2px)",
      backgroundSize: "30px 15px"
    }
  });
  if (world === 5) return /*#__PURE__*/React.createElement("div", {
    style: {
      ...base,
      height: 34,
      background: "#ffffff",
      backgroundImage: "radial-gradient(circle at 15px 0, #ffffff 14px, transparent 15px)",
      backgroundSize: "30px 30px",
      boxShadow: "0 -6px 0 -2px #ffffff",
      borderTop: "none"
    }
  });
  if (world === 6) return /*#__PURE__*/React.createElement("div", {
    style: {
      ...base,
      background: "#4a3434",
      borderTop: "4px solid #ff5a1a",
      boxShadow: "0 -6px 14px #ff6a2a88",
      backgroundImage: "linear-gradient(#2a1c1c 2px, transparent 2px), linear-gradient(90deg, #2a1c1c 2px, transparent 2px)",
      backgroundSize: "30px 15px"
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...base,
      background: "#c84c0c",
      borderTop: "3px solid #3b2a1a",
      backgroundImage: "linear-gradient(#3b2a1a 2px, transparent 2px), linear-gradient(90deg, #3b2a1a 2px, transparent 2px)",
      backgroundSize: "30px 15px"
    }
  });
}
// 景色の飾り（ピラミッド・泡と海藻・雪山と雪・浮かぶ雲・火山と火の粉）。位置は固定の乱数で決める
const DOTS = Array.from({
  length: 14
}, (_, i) => ({
  left: (i * 37 + 11) % 100,
  delay: -(i * 1.7 % 9),
  dur: 7 + i * 1.3 % 5,
  size: 4 + i * 3 % 7
}));
function WorldDecor({
  world
}) {
  const tri = style => /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      width: 0,
      height: 0,
      ...style
    }
  });
  if (world === 2) return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 40,
      right: "12%",
      width: 54,
      height: 54,
      borderRadius: "50%",
      background: "#fff3b0",
      boxShadow: "0 0 30px #fff3b0"
    }
  }), tri({
    left: "4%",
    bottom: 33,
    borderLeft: "70px solid transparent",
    borderRight: "70px solid transparent",
    borderBottom: "80px solid #d9963e"
  }), tri({
    left: "calc(4% + 90px)",
    bottom: 33,
    borderLeft: "44px solid transparent",
    borderRight: "44px solid transparent",
    borderBottom: "52px solid #c98632"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: "28%",
      bottom: 33,
      width: 10,
      height: 44,
      background: "#3f9a3a",
      borderRadius: 5,
      boxShadow: "-12px -6px 0 -2px #3f9a3a, 12px -12px 0 -2px #3f9a3a"
    }
  }));
  if (world === 3) return /*#__PURE__*/React.createElement(React.Fragment, null, DOTS.map((d, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "bubble-up",
    style: {
      left: `${d.left}%`,
      width: d.size + 4,
      height: d.size + 4,
      animationDuration: `${d.dur}s`,
      animationDelay: `${d.delay}s`
    }
  })), CHEEP_SWIM.map((c, i) => /*#__PURE__*/React.createElement(SwimmingCheep, _extends({
    key: "c" + i
  }, c))), [6, 14, 82, 90].map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: "w" + i,
    className: "seaweed",
    style: {
      left: `${l}%`,
      height: 50 + i % 2 * 22,
      animationDelay: `${-i * 0.7}s`
    }
  })));
  if (world === 4) return /*#__PURE__*/React.createElement(React.Fragment, null, tri({
    left: "-2%",
    bottom: 33,
    borderLeft: "110px solid transparent",
    borderRight: "110px solid transparent",
    borderBottom: "120px solid #e8f1fb"
  }), tri({
    left: "calc(-2% + 150px)",
    bottom: 33,
    borderLeft: "80px solid transparent",
    borderRight: "80px solid transparent",
    borderBottom: "90px solid #dbe8f6"
  }), DOTS.map((d, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "snow-fall",
    style: {
      left: `${d.left}%`,
      width: d.size,
      height: d.size,
      animationDuration: `${d.dur + 3}s`,
      animationDelay: `${d.delay}s`
    }
  })));
  if (world === 5) return /*#__PURE__*/React.createElement(React.Fragment, null, PARA_FLY.map((c, i) => /*#__PURE__*/React.createElement(FlyingDryBones, _extends({
    key: "p" + i
  }, c))), /*#__PURE__*/React.createElement(Cloud, {
    style: {
      top: "30%",
      right: "-14px",
      opacity: 0.95,
      transform: "scale(1.3)"
    }
  }), /*#__PURE__*/React.createElement(Cloud, {
    style: {
      top: "62%",
      left: "4%",
      opacity: 0.85,
      transform: "scale(1.1)"
    }
  }), /*#__PURE__*/React.createElement(Cloud, {
    style: {
      top: "78%",
      right: "18%",
      opacity: 0.9
    }
  }));
  if (world === 6) return /*#__PURE__*/React.createElement(React.Fragment, null, tri({
    left: "2%",
    bottom: 33,
    borderLeft: "100px solid transparent",
    borderRight: "100px solid transparent",
    borderBottom: "110px solid #6a3030"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "calc(2% + 86px)",
      bottom: 128,
      width: 28,
      height: 16,
      borderRadius: "50%",
      background: "#ff7a2a",
      boxShadow: "0 0 18px #ff7a2a"
    }
  }), DOTS.map((d, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "ember-up",
    style: {
      left: `${d.left}%`,
      width: 4,
      height: 4,
      animationDuration: `${d.dur - 2}s`,
      animationDelay: `${d.delay}s`
    }
  })));
  return null;
}
function Scenery({
  home = false,
  rescued = false,
  world = 1
}) {
  const th = worldTheme(world);
  return /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(WorldDecor, {
    world: world
  }), home && /*#__PURE__*/React.createElement(Castle, {
    style: {
      right: "3%",
      bottom: 33
    },
    rescued: rescued
  }), th.clouds > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Cloud, {
    style: {
      top: 26,
      left: "6%",
      opacity: th.clouds
    }
  }), /*#__PURE__*/React.createElement(Cloud, {
    style: {
      top: 92,
      right: "8%",
      opacity: th.clouds * 0.9,
      transform: "scale(.8)"
    }
  }), /*#__PURE__*/React.createElement(Cloud, {
    style: {
      top: "46%",
      left: "-10px",
      opacity: th.clouds * 0.7,
      transform: "scale(.7)"
    }
  })), /*#__PURE__*/React.createElement(Ground, {
    world: world
  }), home && [1, 2, 4].includes(world) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(WalkingGoomba, {
    duration: 18
  }), /*#__PURE__*/React.createElement(WalkingGoomba, {
    duration: 18,
    delay: -7
  })), home && world === 6 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(WalkingDryBones, {
    duration: 20
  }), /*#__PURE__*/React.createElement(WalkingDryBones, {
    duration: 20,
    delay: -8
  })));
}
// ワールドが変わる演出：黒い画面に「WORLD N」とマリオ（本家のステージ開始画面風）
function WorldIntro({
  world
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "world-intro",
    "aria-live": "polite",
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 120,
      background: "#000",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 18,
      fontFamily: "ui-monospace, Menlo, monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      letterSpacing: 4,
      opacity: 0.8
    }
  }, "NEXT WORLD"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 34,
      fontWeight: 900,
      letterSpacing: 4
    }
  }, "WORLD ", world, "-1"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Hero, {
    who: "mario",
    px: 3
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 800
    }
  }, worldTheme(world).name)));
}

// ── BGM（矩形波のループ。先読みスケジューラで途切れずに鳴らす） ──
//   譜面は [音名, 長さ(8分音符の数)]。"r" は休符。
const NOTE_INDEX = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11
};
function noteFreq(n) {
  const m = /^([A-G]#?)(\d)$/.exec(n);
  return m ? 440 * Math.pow(2, (NOTE_INDEX[m[1]] + (+m[2] + 1) * 12 - 69) / 12) : 0;
}
const seq = (str, len = 1) => str.trim().split(/\s+/).map(t => {
  const [n, l] = t.split(":");
  return [n, l ? +l : len];
});
const OVERWORLD_A = seq("C5 r r G4 r r E4 r r A4 r B4 r A#4 A4 r G4:1.33 E5:1.33 G5:1.34 A5 r F5 G5 r E5 r C5 D5 B4 r r");
const TRACKS = {
  // 地上のテーマ：イントロ → A → A → B
  overworld: {
    eighth: 0.15,
    notes: [...seq("E5 E5 r E5 r C5 E5 r G5 r r r G4 r r r"), ...OVERWORLD_A, ...OVERWORLD_A, ...seq("r r G5 F#5 F5 D#5 r E5 r G#4 A4 C5 r A4 C5 D5 r r G5 F#5 F5 D#5 r E5 r C6 r C6 C6 r r r"), ...seq("r r G5 F#5 F5 D#5 r E5 r G#4 A4 C5 r A4 C5 D5 r r D#5 r r D5 r r C5 r r r r r r r")]
  },
  // 地下のテーマ（楽譜どおり：3/4拍子・♩=100、ここだけ1単位＝16分音符）。7小節でループ
  underground: {
    eighth: 0.15,
    notes: [...seq("C4 C5 A3 A4 A#3 A#4 r:2 r:4"), ...seq("C4 C5 A3 A4 A#3 A#4 r:2 r:4"), ...seq("F3 F4 D3 D4 D#3 D#4 r:2 r:4"), ...seq("F3 F4 D3 D4 D#3 D#4 r:2 r:2"), ...seq("D#4 D4 C#4", 2 / 3),
    // 16分の3連符
    ...seq("C4 D#4 D4 G#3 G3 C#4", 2),
    // 8分音符
    ...seq("C4 F#4 F4 E4 A#4 A4", 2 / 3),
    // 16分の3連符
    ...seq("G#4 D#4 B3 A#3 A3 G#3", 4 / 3),
    // 8分の3連符
    ...seq("r:12") // 1小節休み
    ]
  },
  // 城の雰囲気（オリジナル）：半音でうごめく短調のループ
  castle: {
    eighth: 0.13,
    notes: seq("A3 C4 D#4 E4 D#4 C4 A3 r A#3 C#4 E4 F4 E4 C#4 A#3 r A3 C4 D#4 E4 F4 E4 D#4 C4 B3 D4 F4 G#4 F4 D4 B3 r")
  }
};
const BGM = (() => {
  let cur = null,
    timer = null,
    out = null,
    idx = 0,
    nextT = 0;
  const ctx = () => audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  function schedule() {
    const c = ctx(),
      tr = TRACKS[cur];
    if (!tr) return;
    while (nextT < c.currentTime + 0.3) {
      const [n, l] = tr.notes[idx];
      const d = l * tr.eighth,
        f = noteFreq(n);
      if (f) {
        const o = c.createOscillator(),
          g = c.createGain();
        o.type = tr.wave || "square";
        o.frequency.value = f;
        g.gain.setValueAtTime(0.05 * (tr.gain || 1), nextT);
        g.gain.exponentialRampToValueAtTime(0.001, nextT + d * 0.95);
        o.connect(g).connect(out);
        o.start(nextT);
        o.stop(nextT + d);
      }
      nextT += d;
      idx = (idx + 1) % tr.notes.length;
    }
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    cur = null;
    if (out) {
      const g = out;
      try {
        g.gain.setTargetAtTime(0, ctx().currentTime, 0.05);
      } catch (e) {}
      setTimeout(() => g.disconnect(), 400);
      out = null;
    }
  }
  function play(name, vol) {
    try {
      const c = ctx();
      if (c.state === "suspended") c.resume();
      if (cur === name && out) {
        out.gain.setTargetAtTime(vol, c.currentTime, 0.2);
        return;
      }
      stop();
      cur = name;
      idx = 0;
      nextT = c.currentTime + 0.1;
      out = c.createGain();
      out.gain.value = vol;
      out.connect(c.destination);
      timer = setInterval(schedule, 60);
      schedule();
    } catch (e) {}
  }
  return {
    play,
    stop
  };
})();
// 自動再生制限で止まった AudioContext を、最初の操作で再開する
if (typeof window !== "undefined" && window.addEventListener) {
  const resume = () => {
    try {
      if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    } catch (e) {}
  };
  window.addEventListener("pointerdown", resume);
  window.addEventListener("keydown", resume);
}

// ── コースクリア演出：旗ポールを滑り降りるマリオ＋左右からクラッカー ──
const CONFETTI_COLORS = ["#e52521", "#fbd000", "#43b047", "#2038ec", "#f878b0", "#ffffff", "#f8b800"];
function Confetti({
  base = 0
}) {
  // 左右の下から斜め上に打ち出す紙片。2波（base+0.1秒・base+1.3秒）に分けて発射
  const pieces = useMemo(() => {
    const out = [];
    for (const side of ["left", "right"]) {
      for (let i = 0; i < 44; i++) {
        const dir = side === "left" ? 1 : -1;
        out.push({
          side,
          key: `${side}${i}`,
          dx: dir * (90 + Math.random() * 300),
          dy: -(220 + Math.random() * 360),
          r: Math.random() * 720 - 360 | 0,
          w: 6 + Math.random() * 6,
          h: 4 + Math.random() * 8,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          delay: base + (i % 2 ? 1.3 : 0.1) + Math.random() * 0.15,
          dur: 1.6 + Math.random() * 0.8
        });
      }
    }
    return out;
  }, [base]);
  return /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 50,
      pointerEvents: "none",
      overflow: "hidden"
    }
  }, pieces.map(p => /*#__PURE__*/React.createElement("span", {
    key: p.key,
    className: "confetti",
    style: {
      [p.side]: 6,
      bottom: 70,
      width: p.w,
      height: p.h,
      background: p.color,
      "--dx": `${p.dx}px`,
      "--dy": `${p.dy}px`,
      "--r": `${p.r}deg`,
      animationDelay: `${p.delay}s`,
      animationDuration: `${p.dur}s`
    }
  })));
}
function CourseClear() {
  return /*#__PURE__*/React.createElement("div", {
    className: "card-in",
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Confetti, null), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: "relative",
      width: 180,
      height: 200,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 88,
      top: 0,
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: "#43b047",
      border: "2px solid #0b3d0b",
      boxSizing: "border-box"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 92,
      top: 10,
      width: 4,
      height: 170,
      background: "#7ed957",
      borderLeft: "1px solid #1f8a2a",
      borderRight: "1px solid #1f8a2a"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 82,
      top: 178,
      width: 24,
      height: 22,
      background: "#a8501c",
      border: "2px solid #3b2a1a",
      boxSizing: "border-box"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "flag-down",
    style: {
      position: "absolute",
      left: 60,
      width: 32,
      height: 26,
      background: "#ffffff",
      clipPath: "polygon(100% 0,100% 100%,0 50%)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 5,
      top: 8,
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "#1f9e3a"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "mario-slide",
    style: {
      position: "absolute",
      left: 96
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mario-hop"
  }, /*#__PURE__*/React.createElement(Hero, {
    who: "mario",
    px: 3
  })))), /*#__PURE__*/React.createElement("div", {
    className: "clear-title",
    style: {
      fontSize: 30,
      fontWeight: 900,
      letterSpacing: 2,
      color: "#fff",
      textShadow: "2px 2px 0 #e52521, 4px 4px 0 #3b2a1a",
      marginTop: 8
    }
  }, "COURSE CLEAR!"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: "#1f9e3a",
      marginTop: 4
    }
  }, "\uD83D\uDEA9 \u30B4\u30FC\u30EB\u306E\u65D7\u3092\u30B2\u30C3\u30C8\uFF01"));
}

// ── かめおの城クリア演出：橋が崩れてクッパが溶岩へ → ピーチ登場 ──
//   既定スタイル＝最終状態（reduced-motion でも結末が見える）。keyframes の from が開始状態。
const BRIDGE_SEGS = 10;
//   mode: "another"＝まだ救出前（ピーチは別の城）/ "rescue"＝今回で救出達成 / "thanks"＝救出済みで再挑戦
function CastleClear({
  gold,
  mode = "another",
  remaining = 0
}) {
  const rescue = mode === "rescue";
  return /*#__PURE__*/React.createElement("div", {
    className: "card-in",
    style: {
      marginTop: 14
    }
  }, (gold || rescue) && /*#__PURE__*/React.createElement(Confetti, {
    base: rescue ? 3.4 : 2.3
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: "relative",
      width: 290,
      height: 196,
      margin: "0 auto",
      overflow: "hidden",
      borderRadius: 10,
      border: "3px solid #3b2a1a",
      background: "#1a1020"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lava",
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 120,
      width: 64,
      bottom: 0,
      background: "#8c8c8c",
      borderRight: "2px solid #3a3a3a",
      backgroundImage: "linear-gradient(#4a4a4a 2px, transparent 2px), linear-gradient(90deg, #4a4a4a 2px, transparent 2px)",
      backgroundSize: "16px 10px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 0,
      top: 120,
      width: 46,
      bottom: 0,
      background: "#8c8c8c",
      borderLeft: "2px solid #3a3a3a",
      backgroundImage: "linear-gradient(#4a4a4a 2px, transparent 2px), linear-gradient(90deg, #4a4a4a 2px, transparent 2px)",
      backgroundSize: "16px 10px"
    }
  }), Array.from({
    length: BRIDGE_SEGS
  }, (_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "bridge-seg",
    style: {
      position: "absolute",
      top: 120,
      left: 64 + i * 18,
      width: 18,
      height: 9,
      background: "#a8501c",
      border: "2px solid #3b2a1a",
      boxSizing: "border-box",
      animationDelay: `${0.3 + (BRIDGE_SEGS - 1 - i) * 0.09}s`
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 12,
      top: 90,
      fontSize: 24
    }
  }, "\uD83E\uDE93"), /*#__PURE__*/React.createElement("div", {
    className: "bowser-fall",
    style: {
      position: "absolute",
      left: 128,
      top: 66
    }
  }, /*#__PURE__*/React.createElement(Pixel, {
    rows: BOWSER.map(r => r.padEnd(20, ".")),
    palette: PALETTES.bowser,
    px: 3
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 12,
      top: 72
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "castle-hop"
  }, /*#__PURE__*/React.createElement(Hero, {
    who: "mario",
    px: 3
  }))), mode === "another" ?
  /*#__PURE__*/
  /* まだ救出前：ピーチは別の城に */
  React.createElement("span", {
    className: "peach-in",
    style: {
      position: "absolute",
      left: 70,
      right: 8,
      top: 14,
      background: "#fff",
      border: "2px solid #3b2a1a",
      borderRadius: 8,
      padding: "5px 8px",
      fontSize: 11.5,
      fontWeight: 800,
      color: "#1f1a14",
      lineHeight: 1.5,
      textAlign: "left"
    }
  }, "\u3042\u308A\u304C\u3068\u3046 \u30DE\u30EA\u30AA\uFF01", /*#__PURE__*/React.createElement("br", null), "\u3067\u3082 \u30D4\u30FC\u30C1\u59EB\u306F \u3079\u3064\u306E\u57CE\u306B \u3044\u308B\u3088\u2026") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "peach-in",
    style: {
      position: "absolute",
      right: 5,
      top: 60
    }
  }, /*#__PURE__*/React.createElement(Pixel, {
    rows: PEACH,
    palette: PALETTES.peach,
    px: 3
  })), /*#__PURE__*/React.createElement("span", {
    className: "peach-in",
    style: {
      position: "absolute",
      right: 52,
      top: 18,
      background: "#fff",
      border: "2px solid #f878b0",
      borderRadius: 8,
      padding: "2px 8px",
      fontSize: 11.5,
      fontWeight: 800,
      color: "#1f1a14",
      whiteSpace: "nowrap"
    }
  }, rescue ? "ありがとう マリオ！" : "また来てくれたのね！")), rescue &&
  /*#__PURE__*/
  /* 救出シーン：マリオとピーチが並び、ハートが浮かぶ */
  React.createElement("div", {
    className: "rescue-scene",
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg,#ffd6ea,#ffeef6)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "heart-pop",
    style: {
      fontSize: 30
    }
  }, "\u2764\uFE0F"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 10,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(Hero, {
    who: "mario",
    px: 3,
    pose: "idle"
  }), /*#__PURE__*/React.createElement(Pixel, {
    rows: PEACH,
    palette: PALETTES.peach,
    px: 3,
    className: "hero idle",
    style: {
      animationDelay: ".3s"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: 900,
      letterSpacing: 1,
      color: "#c83c78"
    }
  }, "THANK YOU MARIO!"))), /*#__PURE__*/React.createElement("div", {
    className: "clear-title castle-title",
    style: {
      fontSize: 26,
      fontWeight: 900,
      letterSpacing: 1,
      color: "#fff",
      textShadow: "2px 2px 0 #e52521, 4px 4px 0 #3b2a1a",
      marginTop: 10
    }
  }, rescue ? "ピーチ姫を救出！" : "かめおをたおした！"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: gold ? "#d98e00" : "#1f9e3a",
      marginTop: 4
    }
  }, gold ? "👑 王冠ゲット！" : "⭐ スターゲット！", mode === "another" && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#1f1a14"
    }
  }, " \u30FB \u3042\u3068", remaining, "\u56DE\u3067\u30D4\u30FC\u30C1\u59EB\u3092\u6551\u51FA"), rescue && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#c83c78"
    }
  }, " \u30FB \u4FEE\u4E86\u30D0\u30C3\u30B8", EXAM_SLOTS, "\u500B\u30B3\u30F3\u30D7\u30EA\u30FC\u30C8\uFF01")), gold && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      opacity: 0.75,
      marginTop: 4
    }
  }, EXAM_GOLD, "\u554F\u4EE5\u4E0A\u306E\u8C6A\u83EF\u30D0\u30C3\u30B8 \u2728"));
}

// キャラの吹き出し
function Bubble({
  who = "mario",
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Hero, {
    who: who,
    px: 3,
    style: {
      flex: "0 0 auto"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "bubble",
    style: {
      borderColor: who === "mario" ? "#e52521" : "#20a030"
    }
  }, children));
}

// ── 効果音（Web Audio で矩形波を合成。音源ファイル不要） ──
let audioCtx = null;
// 勝利演出の音（ジングル・クラッカー等）はこの経路にまとめ、画面を離れたら stopJingles で一斉に消す
let jingleBus = null;
function jingleOut() {
  if (!jingleBus) {
    jingleBus = audioCtx.createGain();
    jingleBus.connect(audioCtx.destination);
  }
  return jingleBus;
}
function stopJingles() {
  if (!jingleBus) return;
  const b = jingleBus;
  jingleBus = null;
  try {
    b.gain.setTargetAtTime(0, audioCtx.currentTime, 0.03);
  } catch (e) {}
  setTimeout(() => {
    try {
      b.disconnect();
    } catch (e) {}
  }, 300);
}
function tone(seq, jingle = false) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const dest = jingle ? jingleOut() : audioCtx.destination;
    let t = audioCtx.currentTime;
    for (const [freq, dur, slideTo] of seq) {
      if (!freq) {
        t += dur;
        continue;
      } // 0 = 休符
      const o = audioCtx.createOscillator(),
        g = audioCtx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(dest);
      o.start(t);
      o.stop(t + dur);
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
  bridge: () => tone(Array.from({
    length: 10
  }, (_, i) => [260 - i * 12, 0.09]), true),
  fall: () => tone([[700, 0.9, 70]], true),
  popper: () => {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const len = Math.floor(audioCtx.sampleRate * 0.25);
      const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = audioCtx.createBufferSource(),
        g = audioCtx.createGain();
      g.gain.value = 0.25;
      src.buffer = buf;
      src.connect(g).connect(jingleOut());
      src.start();
    } catch (e) {}
  }
};

// 問題文中の識別キー（複数）に下線を引く。keys が空/未指定なら素のテキスト。
function Highlight({
  text,
  keys,
  color,
  on,
  variant = "underline"
}) {
  if (!on || !keys || keys.length === 0) return /*#__PURE__*/React.createElement(React.Fragment, null, text);
  // 出現位置を集めて重複・重なりを除去
  const ranges = [];
  for (const k of keys) {
    if (!k) continue;
    let from = 0,
      idx;
    while ((idx = text.indexOf(k, from)) !== -1) {
      ranges.push([idx, idx + k.length]);
      from = idx + k.length;
    }
  }
  if (ranges.length === 0) return /*#__PURE__*/React.createElement(React.Fragment, null, text);
  ranges.sort((a, b) => a[0] - b[0]);
  // 重なりをマージ
  const merged = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]);else merged.push(ranges[i]);
  }
  const parts = [];
  let pos = 0;
  merged.forEach(([s, e], i) => {
    if (s > pos) parts.push(/*#__PURE__*/React.createElement("span", {
      key: "n" + i
    }, text.slice(pos, s)));
    const hStyle = variant === "marker" ? {
      background: color,
      color: "#15140a",
      fontWeight: 800,
      borderRadius: 3,
      padding: "1px 3px",
      WebkitBoxDecorationBreak: "clone",
      boxDecorationBreak: "clone"
    } : variant === "soft" ? {
      color,
      fontWeight: 700
    } // 下線なし・太字・色のみ（リンク誤認を避ける）
    : {
      color,
      borderBottom: `2px solid ${color}`,
      fontWeight: 800
    };
    parts.push(/*#__PURE__*/React.createElement("span", {
      key: "h" + i,
      style: hStyle
    }, text.slice(s, e)));
    pos = e;
  });
  if (pos < text.length) parts.push(/*#__PURE__*/React.createElement("span", {
    key: "tail"
  }, text.slice(pos)));
  return /*#__PURE__*/React.createElement(React.Fragment, null, parts);
}

// ════════════════════════════════════════════════════════════════
//  学習モデル: ブロック単位で「覚える→テスト」を反復。
//   ・覚える: 1ページ10問のリスト。正解肢と正誤箇所（黄マーカー）を表示。
//   ・テスト: 同じブロックの問題をまるごと出題。とにかく覚えるテスト。
//   ・バッジ: テスト正答率90%以上でそのブロックに🚩（localStorageで永続化）。
// ════════════════════════════════════════════════════════════════
const PAGE_SIZE = 10; // 覚える画面の1ページ表示数
const PASS_PCT = 90; // バッジ獲得ライン（正答率%）
// 総合テスト（模試）: 全範囲から EXAM_SIZE 問。EXAM_PASS 以上で合格＝修了バッジ(銀)、EXAM_GOLD 以上で金バッジ。
// 本番は解答40問・6割（24問）で合格。
const EXAM_SIZE = 40; // 出題数
const EXAM_PASS = 24; // 合格ライン（6割）
const EXAM_GOLD = 32; // 金バッジライン（8割・豪華演出）
const EXAM_SLOTS = 5; // 修了バッジのコレクション枠
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
function StudyCard({
  q,
  mono,
  flagged,
  onToggleFlag
}) {
  const [showChoices, setShowChoices] = useState(true); // 暗記のテンポ優先：最初から正解の選択肢を開いておく（折りたたみも可）
  const ansSet = new Set(q.answer);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#ffffff",
      border: `3px solid ${flagged ? "#d98e00" : "#3b2a1a"}`,
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 12,
      boxShadow: "0 4px 0 #3b2a1a55"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 11,
      opacity: 0.4,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", null, q.source, "\u30FB", q.category), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#43b047",
      opacity: 0.8
    }
  }, showChoices ? "▲ 閉じる" : "▼ クリックで選択肢")), /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowChoices(s => !s),
    style: {
      fontSize: 17,
      fontWeight: 600,
      lineHeight: 1.75,
      whiteSpace: "pre-wrap",
      cursor: "pointer",
      letterSpacing: 0.2
    }
  }, /*#__PURE__*/React.createElement(Highlight, {
    text: q.question,
    keys: q.answerKeys,
    color: "#1a5fd0",
    on: true,
    variant: "soft"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onToggleFlag,
    "aria-pressed": !!flagged,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      width: "100%",
      marginTop: 10,
      padding: "9px 0",
      borderRadius: 10,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 800,
      transition: "background .15s, border-color .15s, box-shadow .15s",
      background: flagged ? "linear-gradient(90deg,#f0a000,#d98e00)" : "#fff8e7",
      border: `1.5px solid ${flagged ? "#d98e00" : "#3b2a1a"}`,
      color: flagged ? "#3b2a1a" : "#3b3024",
      boxShadow: flagged ? "0 0 14px #d98e0055" : "none"
    }
  }, flagged ? "🔖 要復習に登録中（押して解除）" : "🔖 要復習に追加する"), showChoices && /*#__PURE__*/React.createElement("div", {
    className: "card-in",
    style: {
      marginTop: 10,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, q.choices.map(c => {
    const correct = ansSet.has(c.label);
    return /*#__PURE__*/React.createElement("div", {
      key: c.label,
      style: {
        display: "flex",
        gap: 10,
        alignItems: "baseline",
        padding: "7px 11px",
        borderRadius: 9,
        background: correct ? "#e3f7df" : "transparent",
        border: `1px solid ${correct ? "#1f9e3a55" : "#d9c7a0"}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: correct ? "#1f9e3a" : "#9a8a70",
        minWidth: 14,
        textAlign: "center",
        fontWeight: 800
      }
    }, c.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontFamily: mono,
        lineHeight: 1.5,
        color: correct ? "#1f1a14" : "#4a3d2e"
      }
    }, correct ? /*#__PURE__*/React.createElement(Highlight, {
      text: c.text,
      keys: hintsFor(q, c.label),
      color: "#ffd84a",
      on: true,
      variant: "marker"
    }) : c.text));
  }), q.mnemonic && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: 13,
      color: "#6b4a00",
      background: "#fff4c2",
      border: "1px solid #e0b000",
      borderRadius: 10,
      padding: "8px 12px",
      lineHeight: 1.6
    }
  }, "\uD83D\uDCA1 ", q.mnemonic)));
}
function App() {
  const questions = QUESTIONS;
  // ブロックは questions.js の q.block（3回分ずつ6グループ × 各3ブロック・分野比率を揃えて分割済み）。
  //   sections[i] = ブロックiの問題配列 / sectionLabels[i] = "ワールド G-N"（グループG の N 番目）
  //   blocks[i]   = { no, kind(グループ名), size, chapSpan(対象回), chunkCount }
  const {
    sections,
    sectionLabels,
    blocks
  } = useMemo(() => {
    const secs = BLOCKS.map(b => questions.filter(q => q.block === b.no));
    const course = BLOCKS.map((b, i) => `${b.group}-${BLOCKS.slice(0, i + 1).filter(x => x.group === b.group).length}`);
    const labels = course.map(c => `ワールド ${c}`);
    const blks = BLOCKS.map((b, i) => ({
      no: b.no,
      course: course[i],
      kind: `グループ${b.group}`,
      group: b.group,
      size: secs[i].length,
      chapSpan: b.span,
      chunkCount: Math.max(1, Math.ceil(secs[i].length / PAGE_SIZE))
    }));
    return {
      sections: secs,
      sectionLabels: labels,
      blocks: blks
    };
  }, [questions]);
  const [screen, setScreen] = useState("home"); // home | testpick | study | test | result
  const [secIdx, setSecIdx] = useState(0);
  const [pickedSec, setPickedSec] = useState(null); // ホームのグリッドで開いているブロック（null=未選択）
  const [pickChunks, setPickChunks] = useState(() => new Set()); // testpick で選択中のチャンクindex集合

  // バッジ/最高スコア（localStorageで永続化）。8ブロック化で index 体系が変わるため新キーに移行。
  const [records, setRecords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kankouji-records-blk") || "{}");
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("kankouji-records-blk", JSON.stringify(records));
    } catch (e) {}
  }, [records]);

  // 総合テスト（模試）の修了バッジ。"silver"(42〜49) / "gold"(50〜) を最大 EXAM_SLOTS 枠まで貯める。localStorageで永続化。
  const [examSlots, setExamSlots] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem("kankouji-exam") || "[]");
      return Array.isArray(v) ? v.slice(0, EXAM_SLOTS) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("kankouji-exam", JSON.stringify(examSlots));
    } catch (e) {}
  }, [examSlots]);

  // 間違えた問題（id→true）。テストで誤答→追加、正解→除去。localStorageで永続化。
  const [wrongIds, setWrongIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kankouji-wrong") || "{}");
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("kankouji-wrong", JSON.stringify(wrongIds));
    } catch (e) {}
  }, [wrongIds]);

  // 効果音の ON/OFF（localStorageで永続化）
  const [soundOn, setSoundOn] = useState(() => {
    try {
      return localStorage.getItem("kankouji-sound") !== "off";
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("kankouji-sound", soundOn ? "on" : "off");
    } catch (e) {}
  }, [soundOn]);
  const play = name => {
    if (soundOn) SFX[name]();
  };
  function toggleSound() {
    setSoundOn(v => {
      if (!v) SFX.coin();
      return !v;
    });
  }
  // 曲：覚える（暗記カード）＝地上、テスト（覚えるの10問テストも）＝地下、かめおの城＝城（全コース共通）
  function testTrack() {
    return testMode === "exam" || testMode === "exammiss" ? "castle" : "underground";
  }

  // 操作音：ボタンを押すと data-sfx の音（未指定は "select"、"none" は鳴らさない）
  useEffect(() => {
    const h = e => {
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
    try {
      return localStorage.getItem("kankouji-bgm") === "on";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("kankouji-bgm", bgmOn ? "on" : "off");
    } catch (e) {}
  }, [bgmOn]);

  // 要復習フラグ（id→true）。正解・不正解に関係なくユーザーが手動でON/OFF。自動では外れない・localStorageで永続化。
  const [flaggedIds, setFlaggedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kankouji-flagged") || "{}");
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("kankouji-flagged", JSON.stringify(flaggedIds));
    } catch (e) {}
  }, [flaggedIds]);
  function toggleFlag(id) {
    setFlaggedIds(f => {
      const n = {
        ...f
      };
      if (n[id]) delete n[id];else n[id] = true;
      return n;
    });
  }

  // 暗記モード: 10問ずつ「覚える→テスト」を繰り返す
  const [studyChunk, setStudyChunk] = useState(0); // 現在の10問セット
  const [studySub, setStudySub] = useState("learn"); // learn | quizdone
  const [quizScore, setQuizScore] = useState(null); // 暗記内テストの点 {correct,total}
  // セットごとの学習状態（localStorageで永続化）。studyProgress[secIdx][chunk] = 一発正解できなかった問題ID配列。
  //   undefined=未挑戦 / []=全問一発正解(完了) / [id,...]=ミスが残っている
  const [studyProgress, setStudyProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kankouji-study-blk") || "{}");
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("kankouji-study-blk", JSON.stringify(studyProgress));
    } catch (e) {}
  }, [studyProgress]);

  // テスト/クイズ共通ランナー状態
  const [testQueue, setTestQueue] = useState([]); // 出題中の問題配列
  const [testMode, setTestMode] = useState("section"); // section(章・バッジ) | study(10・暗記)
  const [testPos, setTestPos] = useState(0);
  const [testResults, setTestResults] = useState([]); // [{id, ok}]
  const [phase, setPhase] = useState("answer"); // answer | reveal
  const [multiSel, setMultiSel] = useState([]);
  const [cursor, setCursor] = useState(0); // PC操作：矢印でハイライト中の選択肢index
  const [lastOk, setLastOk] = useState(null);
  const [lastInput, setLastInput] = useState(null); // 直近のユーザー回答（選択肢の印用）
  const [lastScore, setLastScore] = useState(null); // セクション結果画面用
  const [retry, setRetry] = useState(false); // 暗記10問テストで同じ問題をやり直し中（採点には影響させない）
  const [fullBlock, setFullBlock] = useState(true); // 直近のsectionテストがブロック全問か（🏅バッジ判定用）

  // ランダム出題モード
  const [randomLabel, setRandomLabel] = useState(""); // 実行中のスコープ表示名（"総合" or "ブロックN"）
  const [lastRandom, setLastRandom] = useState(null); // 再実行用 {scopeIdx, count}

  const secQuestions = sections[secIdx] || [];
  const chunkCount = Math.max(1, Math.ceil(secQuestions.length / PAGE_SIZE));
  const chunkQs = secQuestions.slice(studyChunk * PAGE_SIZE, studyChunk * PAGE_SIZE + PAGE_SIZE);
  const badgeCount = Object.values(records).filter(r => r && r.badge).length;
  const wrongList = questions.filter(q => wrongIds[q.id]); // 間違えた問題
  const flaggedList = questions.filter(q => flaggedIds[q.id]); // 要復習フラグを付けた問題（手動で外すまで残る）

  // ── 覚える進捗（セット単位） ──
  const blockChunks = i => Math.max(1, Math.ceil((sections[i] || []).length / PAGE_SIZE)); // そのブロックのセット数
  const setDoneCount = i => {
    // 全問一発正解でクリアしたセット数
    const p = studyProgress[i] || {};
    let n = 0;
    for (let k = 0; k < blockChunks(i); k++) {
      const m = p[k];
      if (m && m.length === 0) n++;
    }
    return n;
  };
  const setDots = i => {
    // 各セットの状態ドット（● 完了 / ◐ ミス残り / ○ 未着手）
    const p = studyProgress[i] || {};
    return Array.from({
      length: blockChunks(i)
    }, (_, k) => {
      const m = p[k];
      const done = m && m.length === 0,
        partial = m && m.length > 0;
      const color = done ? "#1f9e3a" : partial ? "#d98e00" : "#5e4f3c";
      return /*#__PURE__*/React.createElement("span", {
        key: k,
        "aria-hidden": "true",
        style: {
          fontSize: 14,
          lineHeight: 1,
          color
        }
      }, done ? "●" : partial ? "◐" : "○");
    });
  };

  // ── 総合テストの修了バッジ表示 ──
  const examGoldCount = examSlots.filter(s => s === "gold").length;
  const examComplete = examSlots.length >= EXAM_SLOTS; // 5枠コンプ
  // 今いるワールド＝まだ3コースともクリアしていない一番若いワールド（全部クリアなら最後のワールド）
  const groupNos = [...new Set(blocks.map(b => b.group))];
  const groupCleared = g => blocks.every((b, k) => b.group !== g || records[k] && records[k].badge);
  const clearedWorld = groupNos.find(g => !groupCleared(g)) || groupNos[groupNos.length - 1] || 1;
  const [pendingWorld, setPendingWorld] = useState(null); // ワールドを全クリアした直後：ホームに戻ったら演出
  const [worldIntro, setWorldIntro] = useState(null); // 演出中のワールド番号
  // 演出の途中は前のワールドの景色のまま、演出が終わってから新しい景色へ
  const currentWorld = worldIntro ? worldIntro : pendingWorld ? pendingWorld - 1 : clearedWorld;
  useEffect(() => {
    if (screen === "home" && pendingWorld) {
      setWorldIntro(pendingWorld);
      setPendingWorld(null);
    }
  }, [screen, pendingWorld]);
  useEffect(() => {
    if (!worldIntro) return;
    const t = setTimeout(() => setWorldIntro(null), 2800);
    return () => clearTimeout(t);
  }, [worldIntro]);
  const examMastered = examComplete && examGoldCount >= EXAM_SLOTS; // 全枠金＝完全制覇
  const rescued = examComplete; // 修了バッジが揃った＝ピーチ救出（ホームでマリオの横へ）
  // 5枠のコレクション帯（🥇金 / 🏅銀 / 空）。size でアイコンの大きさを変える。
  const examStrip = (size = 26) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 6
    }
  }, Array.from({
    length: EXAM_SLOTS
  }, (_, k) => {
    const t = examSlots[k];
    return /*#__PURE__*/React.createElement("span", {
      key: k,
      "aria-hidden": "true",
      style: {
        width: size + 8,
        height: size + 8,
        borderRadius: 9,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size,
        background: t === "gold" ? "#fff4c2" : t === "silver" ? "#eef7ea" : "#fff8e7",
        border: `1px solid ${t === "gold" ? "#f0a00088" : t === "silver" ? "#1f9e3a55" : "#d9c7a0"}`
      }
    }, t === "gold" ? "👑" : t === "silver" ? "⭐" : "");
  }));

  // ── スタイル（暗記特化: 落ち着いた濃紺、最小限のグロー） ──
  const wrap = {
    minHeight: "100vh",
    boxSizing: "border-box",
    background: worldTheme(currentWorld).bg,
    transition: "background .6s",
    color: "#1f1a14",
    fontFamily: "system-ui, -apple-system, 'Hiragino Sans', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 16px 64px",
    overflowX: "hidden",
    position: "relative"
  };
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

  // ── 操作 ──
  function openStudy(i) {
    setSecIdx(i);
    setStudyChunk(0);
    setStudySub("learn");
    setScreen("study");
  }
  function beginRun(queue, mode) {
    setTestQueue(queue);
    setTestMode(mode);
    setTestPos(0);
    setTestResults([]);
    setPhase("answer");
    setMultiSel([]);
    setLastOk(null);
    setRetry(false);
    setScreen("test");
  }
  // チャンク選択テスト画面を開く（初期は全チャンク選択）
  function openTestPick(i) {
    setSecIdx(i);
    const n = Math.max(1, Math.ceil((sections[i] || []).length / PAGE_SIZE));
    setPickChunks(new Set(Array.from({
      length: n
    }, (_, k) => k)));
    setScreen("testpick");
  }
  function startTest(i) {
    setSecIdx(i);
    setFullBlock(true);
    beginRun(sections[i] || [], "section");
  } // ブロック全問・🏅
  // testpick で選んだチャンクの問題をフラット順に連結して出題。全チャンク選択のときだけ🏅対象。
  function startPickTest() {
    const all = sections[secIdx] || [];
    const n = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    const idxs = [...pickChunks].sort((a, b) => a - b);
    const queue = idxs.flatMap(c => all.slice(c * PAGE_SIZE, c * PAGE_SIZE + PAGE_SIZE));
    if (queue.length === 0) return;
    setFullBlock(pickChunks.size === n);
    beginRun(queue, "section");
  }
  function startChunkQuiz() {
    beginRun(chunkQs, "study");
  } // この10問
  function startChunkMisses() {
    // この回で一発正解できなかった問題だけ
    const ids = new Set((studyProgress[secIdx] || {})[studyChunk] || []);
    beginRun(chunkQs.filter(q => ids.has(q.id)), "study");
  }
  function startReview() {
    beginRun(wrongList.slice(), "review");
  } // 間違えた問題に挑戦
  // 要復習フラグを付けた問題に挑戦（正解するまで繰り返す・フラグは正解しても外れない＝ユーザーが手動で外すまで残る）
  function startFlagged() {
    if (flaggedList.length) beginRun(shuffle(flaggedList), "flagged");
  }

  // ── ランダム出題 ──
  const poolOf = scope => scope >= 0 ? sections[scope] || [] : questions; // 0〜7=ブロック
  // ランダム演習（復習用）: ブロックを選ぶだけの画面。ブロックをタップ＝RANDOM_BLOCK_N 問で即開始。
  function openBlockRandom() {
    setScreen("randompick");
  }
  function startRandom(scopeIdx, count) {
    const pool = poolOf(scopeIdx);
    const queue = shuffle(pool).slice(0, Math.min(count, pool.length));
    if (queue.length === 0) return;
    setRandomLabel(scopeIdx >= 0 ? sectionLabels[scopeIdx] : "総合");
    setLastRandom({
      scopeIdx,
      count
    });
    setFullBlock(false); // 🏅対象外（純粋な演習）
    beginRun(queue, "random");
  }
  // 直近ランダム演習で間違えた問題だけを再出題（結果はまた random 扱いなので連鎖する）。
  function startRandomMisses(missed) {
    if (missed && missed.length) beginRun(shuffle(missed), "random");
  }

  // ── 総合テスト（模試）: 全範囲から EXAM_SIZE 問をランダム出題 ──
  function startExam() {
    const queue = shuffle(questions).slice(0, Math.min(EXAM_SIZE, questions.length));
    if (queue.length === 0) return;
    setFullBlock(false);
    beginRun(queue, "exam");
  }
  // 総合テストの間違えた問題を、正解するまで繰り返す覚えるモードで再出題（結果はまた exammiss 扱いなので連鎖する）。
  function startExamMisses(missed) {
    if (missed && missed.length) beginRun(shuffle(missed), "exammiss");
  }
  function submitAnswer(input) {
    const q = testQueue[testPos];
    if (!q || phase !== "answer") return;
    const ok = judge(q, input);
    play(ok ? "coin" : "damage");
    setLastOk(ok);
    setLastInput(input);
    // やり直し中（暗記10問テスト）は採点・復習プールに反映しない＝最初の不正解のまま。
    if (!retry) {
      setTestResults(r => [...r, {
        id: q.id,
        ok
      }]);
      // 誤答は復習プールへ。正解したら除外（どのテストでも共通）。
      setWrongIds(w => {
        const n = {
          ...w
        };
        if (ok) delete n[q.id];else n[q.id] = true;
        return n;
      });
    }
    setPhase("reveal");
  }
  // 暗記10問テストで同じ問題を解き直す（採点は最初の結果のまま）。
  function retryQuestion() {
    setPhase("answer");
    setMultiSel([]);
    setLastOk(null);
    setRetry(true);
  }
  // 「正解するまで繰り返す」覚えるモード挙動を使うモード（暗記10問／ランダム演習／総合テストの覚え直し／要復習）。
  const isCram = m => m === "study" || m === "random" || m === "exammiss" || m === "flagged";
  function nextTest() {
    const next = testPos + 1;
    if (next >= testQueue.length) {
      const correct = testResults.filter(r => r.ok).length; // 直近回答まで反映済み
      const total = testQueue.length;
      const pct = Math.round(correct / total * 100);
      if (testMode === "section") {
        const pass = pct >= PASS_PCT; // このテスト単体の合否（部分選択でも表示する）
        const badge = fullBlock && pass; // 🏅ブロック合格は「全チャンク選択で合格」のときだけ
        // 成績(best/badge)は全ブロックテストのときだけ永続化。部分選択は記録しない。
        if (fullBlock) {
          setRecords(rec => {
            const prev = rec[secIdx] || {
              best: 0,
              badge: false
            };
            return {
              ...rec,
              [secIdx]: {
                best: Math.max(prev.best, pct),
                badge: prev.badge || badge
              }
            };
          });
        }
        // このコースで、ワールドの3コースが揃ってクリアになったら、次のワールドへの演出を予約
        const g = blocks[secIdx] && blocks[secIdx].group;
        const othersCleared = blocks.every((b, k) => b.group !== g || k === secIdx || records[k] && records[k].badge);
        if (badge && !(records[secIdx] && records[secIdx].badge) && othersCleared && groupNos.includes(g + 1)) setPendingWorld(g + 1);
        setLastScore({
          correct,
          total,
          pct,
          badge,
          pass,
          full: fullBlock
        });
        setScreen("result");
      } else if (testMode === "exam") {
        // 総合テスト（模試）: 合否＋修了バッジ
        const pass = correct >= EXAM_PASS;
        const gold = correct >= EXAM_GOLD;
        const tier = gold ? "gold" : "silver";
        if (pass) {
          // 空き枠があれば埋める。満杯かつ金なら銀を1つ金に格上げ（＝全枠金＝完全制覇へ）。
          setExamSlots(prev => {
            const slots = prev.slice(0, EXAM_SLOTS);
            if (slots.length < EXAM_SLOTS) slots.push(tier);else if (gold) {
              const i = slots.indexOf("silver");
              if (i >= 0) slots[i] = "gold";
            }
            return slots;
          });
        }
        // 総合テストで間違えた問題を lastScore に持たせ、「間違えた問題を覚える」導線に使う。
        const examMissedIds = new Set(testResults.filter(r => !r.ok).map(r => r.id));
        const examMissed = testQueue.filter(q => examMissedIds.has(q.id));
        const rescue = pass && examSlots.length === EXAM_SLOTS - 1; // 今回の合格で修了バッジが揃う＝ピーチ救出
        setLastScore({
          correct,
          total,
          pct,
          exam: true,
          pass,
          gold,
          tier: pass ? tier : null,
          missed: examMissed,
          rescue
        });
        setScreen("result");
      } else if (testMode === "exammiss") {
        // 総合テストの覚え直し: 正解するまで繰り返した後、まだ残るミスを返す
        const missedIds = new Set(testResults.filter(r => !r.ok).map(r => r.id));
        const missed = testQueue.filter(q => missedIds.has(q.id));
        setLastScore({
          correct,
          total,
          pct,
          badge: false,
          exammiss: true,
          missed
        });
        setScreen("result");
      } else if (testMode === "flagged") {
        // 要復習フラグの挑戦: バッジ無し、フラグは正解しても外れない（結果画面は現在のフラグ数を見る）
        setLastScore({
          correct,
          total,
          pct,
          badge: false,
          flagged: true
        });
        setScreen("result");
      } else if (testMode === "review") {
        // 間違えた問題の復習: バッジ無し、結果画面へ
        setLastScore({
          correct,
          total,
          pct,
          badge: false,
          review: true
        });
        setScreen("result");
      } else if (testMode === "random") {
        // ランダム演習: バッジ無し、結果画面へ
        // この回で間違えた問題を lastScore に持たせ、「この演習のミスに挑戦」導線に使う。
        const missedIds = new Set(testResults.filter(r => !r.ok).map(r => r.id));
        const missed = testQueue.filter(q => missedIds.has(q.id));
        setLastScore({
          correct,
          total,
          pct,
          badge: false,
          random: true,
          label: randomLabel,
          missed
        });
        setScreen("result");
      } else {
        // 暗記内テスト: 採点して暗記画面へ戻る
        setQuizScore({
          correct,
          total
        });
        // このセットで一発正解できなかった問題IDを永続化（retry分は testResults に載らないので「最初の回答」で判定）。
        // 出題キュー内の誤答のみを残す。ミス挑戦時はキュー＝前回のミスなので、正解できたものが自動的に外れて完了(=[])に近づく。
        const missedIds = new Set(testResults.filter(r => !r.ok).map(r => r.id));
        const stillMissedIds = testQueue.filter(q => missedIds.has(q.id)).map(q => q.id);
        setStudyProgress(prev => {
          const sec = {
            ...(prev[secIdx] || {})
          };
          sec[studyChunk] = stillMissedIds;
          return {
            ...prev,
            [secIdx]: sec
          };
        });
        setStudySub("quizdone");
        setScreen("study");
      }
      return;
    }
    setTestPos(next);
    setPhase("answer");
    setMultiSel([]);
    setLastOk(null);
    setRetry(false);
  }

  // BGM：トップ・覚える＝地上、テスト＝地下（かめおの城は城の曲）。いずれも小さく。結果は無音
  useEffect(() => {
    const studying = screen === "study" && studySub === "learn" || screen === "home"; // トップも地上
    if (!bgmOn || screen !== "test" && !studying) {
      BGM.stop();
      return;
    }
    // テストは土管の音（約0.5秒）が鳴り終わり、少し間を置いてから流し始める
    const t = setTimeout(() => BGM.play(studying ? "overworld" : testTrack(), 0.2), studying ? 300 : 1300);
    return () => clearTimeout(t);
  }, [bgmOn, screen, studySub, testMode]);

  // 結果が出たら効果音（クリア＝ファンファーレ / 未達＝土管の音）
  useEffect(() => {
    if (screen === "result" && lastScore && lastScore.badge) {
      play("popper");
      play("flagpole");
      const t1 = setTimeout(() => play("popper"), 1300),
        t2 = setTimeout(() => play("stageClear"), 1450);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        stopJingles();
      };
    }
    if (screen === "result" && lastScore && lastScore.exam && lastScore.pass) {
      // かめおの城：橋が崩れる → 落下 → ファンファーレ
      // 落下音（1.4秒から0.9秒間）が鳴り終わったところでステージクリアのファンファーレ
      const ts = [setTimeout(() => play("bridge"), 300), setTimeout(() => play("fall"), 1400), setTimeout(() => play("stageClear"), 2300)];
      if (lastScore.gold && !lastScore.rescue) ts.push(setTimeout(() => play("popper"), 2400));
      if (lastScore.rescue) ts.push(setTimeout(() => play("popper"), 3400));
      return () => {
        ts.forEach(clearTimeout);
        stopJingles();
      };
    }
    if (screen === "result" && lastScore) play(isGood(lastScore) ? "clear" : "pipe");
    if (screen === "study" && studySub === "quizdone" && quizScore) play(quizScore.correct === quizScore.total ? "clear" : "pipe");
    return stopJingles;
  }, [screen, lastScore, studySub, quizScore]);
  // 結果表示用：マリオとルイージ（よくできた＝ジャンプ / 未達＝しょんぼり）
  const heroes = good => /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 18,
      marginTop: 14,
      height: 76,
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(NamedHero, {
    who: "mario",
    px: 4,
    pose: good ? "jump" : "sad"
  }), /*#__PURE__*/React.createElement(NamedHero, {
    who: "luigi",
    px: 4,
    pose: good ? "jump" : "sad",
    style: {
      animationDelay: ".15s"
    }
  }));

  // 問題が変わったらハイライト位置を先頭に戻す
  useEffect(() => {
    setCursor(0);
  }, [testPos, screen]);

  // キーボード（テスト）: 矢印↑↓で選択肢を移動→Enterで決定。single=1〜4即決も併用、multi=Spaceで選択。reveal=Enterで次へ
  useEffect(() => {
    if (screen !== "test") return;
    const q = testQueue[testPos];
    const h = e => {
      if (e.repeat) return; // キーリピート（押しっぱなし）での連続発火を無視
      if (phase === "reveal") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // 覚えるモード系（暗記10問／ランダム演習／総合の覚え直し）で不正解なら Enter はやり直し（次へは出さない）。それ以外は次へ。
          if (isCram(testMode) && !lastOk) retryQuestion();else nextTest();
        }
        return;
      }
      if (!q) return;
      // 矢印で選択肢ハイライトを移動（single / multi 共通）。↑←=上/↓→=下。
      // multi は選択肢の次に「決定」ボタンも移動先に含める（最後の位置＝決定ボタン）。
      if ((q.type === "single" || q.type === "multi") && q.choices.length) {
        const maxIdx = q.type === "multi" ? q.choices.length : q.choices.length - 1;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          setCursor(c => Math.min(c + 1, maxIdx));
          return;
        }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          setCursor(c => Math.max(c - 1, 0));
          return;
        }
      }
      if (q.type === "single") {
        if (e.key === "Enter") {
          e.preventDefault();
          const c = q.choices[cursor];
          if (c) submitAnswer([c.label]);
          return;
        }
        // 1〜4 キーで即決（選択肢ラベル＝番号）
        if (q.choices.some(c => c.label === e.key)) submitAnswer([e.key]);
      } else if (q.type === "multi") {
        // カーソルが選択肢の位置ならEnterでON/OFF、決定ボタンの位置（=choices.length）ならEnterで決定（マウスクリックと同じ効果）。
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (cursor >= q.choices.length) {
            if (multiSel.length) submitAnswer(multiSel);
            return;
          }
          const c = q.choices[cursor];
          if (!c) return;
          setMultiSel(s => s.includes(c.label) ? s.filter(x => x !== c.label) : [...s, c.label]);
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
    const getBtns = () => Array.from(document.querySelectorAll("button")).filter(b => !b.disabled && b.offsetParent !== null);
    // 初期フォーカス: 意味のあるラベル（3文字以上）を持つ最初のボタン＝主要アクションに寄せる（← 等のアイコンボタンは初期選択から外す。矢印では行ける）
    const btns = getBtns();
    if (btns.length && !btns.includes(document.activeElement)) {
      (btns.find(b => (b.textContent || "").trim().length >= 3) || btns[0]).focus();
    }
    const h = e => {
      const tag = document.activeElement && document.activeElement.tagName || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return; // 入力欄では矢印を奪わない
      if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
      const list = getBtns();
      if (!list.length) return;
      e.preventDefault();
      const idx = list.indexOf(document.activeElement);
      const down = e.key === "ArrowDown" || e.key === "ArrowRight";
      const n = idx < 0 ? 0 : down ? Math.min(idx + 1, list.length - 1) : Math.max(idx - 1, 0);
      list[n].focus();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [screen]);

  // 🎵BGM／🔊効果音の切替（ホームは右上、ほかの画面は右下に浮かせる）
  const soundToggles = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    "data-sfx": "none",
    onClick: () => setBgmOn(v => !v),
    "aria-label": bgmOn ? "BGMをオフにする" : "BGMをオンにする",
    "aria-pressed": bgmOn,
    className: "iconbtn",
    style: {
      width: 34,
      height: 34,
      borderRadius: 999,
      background: "#ffffff",
      border: "2px solid #3b2a1a",
      cursor: "pointer",
      fontSize: 15,
      lineHeight: 1,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: bgmOn ? 1 : 0.45
    }
  }, "\uD83C\uDFB5"), /*#__PURE__*/React.createElement("button", {
    "data-sfx": "none",
    onClick: toggleSound,
    "aria-label": soundOn ? "効果音をオフにする" : "効果音をオンにする",
    "aria-pressed": soundOn,
    className: "iconbtn",
    style: {
      width: 34,
      height: 34,
      borderRadius: 999,
      background: "#ffffff",
      border: "2px solid #3b2a1a",
      cursor: "pointer",
      fontSize: 15,
      lineHeight: 1,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, soundOn ? "🔊" : "🔇"));
  const styleTag = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Scenery, {
    home: screen === "home",
    rescued: rescued,
    world: currentWorld
  }), worldIntro && /*#__PURE__*/React.createElement(WorldIntro, {
    world: worldIntro
  }), screen === "home" && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 40,
      pointerEvents: "none",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(FlyingToad, null)), screen !== "home" && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      right: 12,
      bottom: 40,
      zIndex: 50,
      display: "flex",
      gap: 6
    }
  }, soundToggles), /*#__PURE__*/React.createElement("style", null, `
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
      .rescue-scene{ animation: rescue-in .6s 3.3s ease-out both; }
      @keyframes rescue-in{ from{ opacity:0 } to{ opacity:1 } }
      .heart-pop{ display:inline-block; animation: clear-pop .5s 3.8s cubic-bezier(.3,1.6,.5,1) both; }
      .coinpop{ position:absolute; animation: coinpop .6s ease-out forwards; pointer-events:none; }
      @keyframes coinpop{ 0%{transform:translateY(0);opacity:1} 70%{transform:translateY(-34px);opacity:1} 100%{transform:translateY(-40px);opacity:0} }
      .hideans{ filter: blur(6px); cursor: pointer; transition: filter .12s; border-radius: 5px; }
      .hideans:hover, .hideans.shown{ filter: none; }
      .row:hover{ border-color:#3b2a1a !important; }
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
    `));

  // ════════════════ HOME（ブロック一覧） ════════════════
  if (screen === "home") {
    return /*#__PURE__*/React.createElement("div", {
      style: wrap,
      className: "wrap"
    }, styleTag, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 480,
        width: "100%",
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6,
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 3,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "clamp(17px, 5.4vw, 22px)",
        fontWeight: 900,
        letterSpacing: 1,
        margin: 0,
        whiteSpace: "nowrap",
        color: "#fff",
        textShadow: "2px 2px 0 #e52521, 4px 4px 0 #3b2a1a"
      }
    }, "\u30B9\u30FC\u30D1\u30FC\u7BA1\u5DE5\u4E8B\u30D6\u30E9\u30B6\u30FC\u30BA"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 2,
        color: "#1f1a14"
      }
    }, "2\u7D1A\u7BA1\u5DE5\u4E8B \u7B2C\u4E00\u6B21\u691C\u5B9A")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        flex: "0 0 auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        borderRadius: 999,
        background: "#ffffff",
        border: "2px solid #3b2a1a"
      }
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "\uD83D\uDEA9"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: badgeCount > 0 ? "#1f9e3a" : "#3b3024"
      }
    }, badgeCount, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#5e4f3c",
        fontWeight: 700
      }
    }, " / ", sections.length))), soundToggles)), /*#__PURE__*/React.createElement("div", {
      "aria-hidden": "true",
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 14,
        margin: "6px 0 2px",
        height: 64
      }
    }, rescued && /*#__PURE__*/React.createElement(Pixel, {
      rows: PEACH,
      palette: PALETTES.peach,
      px: 3,
      className: "hero idle",
      style: {
        animationDelay: ".3s"
      },
      title: "\u30D4\u30FC\u30C1"
    }), /*#__PURE__*/React.createElement(NamedHero, {
      who: "mario",
      px: 3,
      pose: "idle"
    }), /*#__PURE__*/React.createElement(NamedHero, {
      who: "luigi",
      px: 3,
      pose: "idle",
      style: {
        animationDelay: ".6s"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        gap: 0,
        alignSelf: "flex-start"
      }
    }, /*#__PURE__*/React.createElement(QBlock, null), /*#__PURE__*/React.createElement(QBlock, null), /*#__PURE__*/React.createElement(QBlock, null)), /*#__PURE__*/React.createElement(Pipe, null)), /*#__PURE__*/React.createElement("div", {
      style: {
        margin: "4px 0 20px"
      }
    }, /*#__PURE__*/React.createElement(Bubble, {
      who: "mario"
    }, "\u9EC4\u8272\u3044\u30DE\u30FC\u30AB\u30FC\u304C", /*#__PURE__*/React.createElement("b", null, "\u6B63\u8AA4\u306E\u6C7A\u3081\u624B"), "\u3060\uFF01\u305D\u3053\u3060\u3051\u899A\u3048\u3066\u53CD\u5C04\u3067\u9078\u307C\u3046\u3002", /*#__PURE__*/React.createElement("br", null), "\u5404\u30B3\u30FC\u30B9\u306E\u30C6\u30B9\u30C8\u30679\u5272\u3092\u53D6\u308B\u3068\u30B4\u30FC\u30EB\u306E\u65D7\uD83D\uDEA9\u3092\u30B2\u30C3\u30C8\u3002", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("b", null, "\u5168", sections.length, "\u672C\u306E\u65D7\u3092\u96C6\u3081\u305F\u3089\u3001\u6E96\u5099\u5B8C\u4E86\uFF01"))), flaggedList.length > 0 && /*#__PURE__*/React.createElement("button", {
      "data-sfx": "warp",
      onClick: startFlagged,
      className: "secbtn",
      style: {
        width: "100%",
        marginBottom: 14,
        padding: "11px 0",
        borderRadius: 10,
        fontSize: 13.5,
        fontWeight: 800,
        cursor: "pointer",
        background: "#fff4c2",
        border: "1px solid #d98e00",
        color: "#d98e00"
      }
    }, "\uD83D\uDD16 \u8981\u5FA9\u7FD2\u306B\u6311\u6226\uFF08", flaggedList.length, "\u554F\uFF09"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, sections.map((sec, i) => {
      const rec = records[i] || {
        best: 0,
        badge: false
      };
      const picked = pickedSec === i;
      const blk = blocks[i] || {
        no: i + 1,
        kind: "",
        chapSpan: "",
        group: 1
      };
      // ワールドの区切り：グループが変わるところに見出し（ワールド番号・対象回・クリア数）
      const newWorld = i === 0 || (blocks[i - 1] && blocks[i - 1].group) !== blk.group;
      const worldIdx = blocks.map((b, k) => b.group === blk.group ? k : -1).filter(k => k >= 0);
      const worldClear = worldIdx.filter(k => records[k] && records[k].badge).length;
      return /*#__PURE__*/React.createElement(React.Fragment, {
        key: i
      }, newWorld && /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: i === 0 ? 0 : 14
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "world-tag"
      }, "WORLD ", blk.group), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          fontWeight: 800,
          color: "#1f1a14"
        }
      }, blocks[worldIdx[0]].chapSpan.split("〜")[0], "\u301C", blocks[worldIdx[worldIdx.length - 1]].chapSpan.split("〜").pop()), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          height: 2,
          background: "#3b2a1a33",
          borderRadius: 1
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          fontWeight: 800,
          color: worldClear === worldIdx.length ? "#1f9e3a" : "#3b3024"
        }
      }, "\uD83D\uDEA9 ", worldClear, "/", worldIdx.length)), /*#__PURE__*/React.createElement("div", {
        className: "seccard",
        style: {
          background: "#ffffff",
          border: `1px solid ${picked ? "#1d7a2f" : rec.badge ? "#1f9e3a33" : "#d9c7a0"}`,
          borderRadius: 13,
          overflow: "hidden",
          transition: "border-color .15s"
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setPickedSec(picked ? null : i),
        className: "secrow",
        "aria-expanded": picked,
        "aria-label": `${sectionLabels[i]}・${blk.kind}${rec.badge ? "・達成" : rec.best > 0 ? `・${rec.best}%` : "・未挑戦"}`,
        style: {
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          cursor: "pointer",
          background: "transparent",
          border: "none",
          color: "inherit",
          textAlign: "left"
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: rec.badge ? "" : "qblock",
        style: {
          width: 28,
          height: 28,
          flex: "0 0 auto",
          borderRadius: rec.badge ? 8 : 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: rec.badge ? 16 : 16,
          fontWeight: 900,
          background: rec.badge ? "#e3f7df" : "#ffffff",
          border: `1px solid ${rec.badge ? "#1f9e3a55" : "#3b2a1a"}`,
          color: rec.badge ? "#1f9e3a" : "#fff8e0"
        }
      }, rec.badge ? "🚩" : "?"), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontSize: 15,
          fontWeight: 800
        }
      }, sectionLabels[i]), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 600,
          color: "#5e4f3c"
        }
      }, blk.chapSpan, " \u30FB ", sec.length, "\u554F")), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 700,
          whiteSpace: "nowrap",
          color: rec.badge ? "#1f9e3a" : rec.best > 0 ? "#d98e00" : "#5e4f3c"
        }
      }, rec.badge ? "🚩 CLEAR" : rec.best > 0 ? `${rec.best}%` : "未挑戦"), /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true",
        style: {
          flex: "0 0 auto",
          color: "#5e4f3c",
          fontSize: 12,
          transition: "transform .18s",
          transform: picked ? "rotate(180deg)" : "none"
        }
      }, "\u25BE")), picked && /*#__PURE__*/React.createElement("div", {
        className: "panel-in",
        style: {
          display: "flex",
          gap: 10,
          padding: "0 14px 13px"
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => openStudy(i),
        className: "secbtn",
        style: {
          flex: 1,
          padding: "10px 0",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 800,
          cursor: "pointer",
          background: "#ffe3e0",
          border: "2px solid #e52521",
          color: "#c81e1a"
        }
      }, "\u899A\u3048\u308B"), /*#__PURE__*/React.createElement("button", {
        onClick: () => openTestPick(i),
        className: "secbtn",
        style: {
          flex: 1,
          padding: "10px 0",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 800,
          cursor: "pointer",
          background: "#e6f6e1",
          border: "2px solid #1d7a2f",
          color: "#1d7a2f"
        }
      }, "\u30C6\u30B9\u30C8"))));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 22,
        padding: "14px 16px",
        borderRadius: 13,
        background: "#fff8e7",
        border: "1px solid #d9c7a0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 900
      }
    }, /*#__PURE__*/React.createElement(QBlock, {
      size: 20,
      style: {
        verticalAlign: "-0.2em",
        marginRight: 6
      }
    }), "\u30E9\u30F3\u30C0\u30E0\u6F14\u7FD2"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 0.5,
        color: "#1d7a2f",
        background: "#e6f6e1",
        border: "1px solid #1d7a2f44",
        borderRadius: 6,
        padding: "1px 6px"
      }
    }, "\u5FA9\u7FD2")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        fontWeight: 600,
        color: "#4a3d2e",
        marginBottom: 11
      }
    }, "\u5FD8\u308C\u304B\u3051\u305F\u30B3\u30FC\u30B9\u3092\u9078\u3093\u3067\u30E9\u30F3\u30C0\u30E0", RANDOM_BLOCK_N, "\u554F\u3002\u8A18\u61B6\u306E\u30E1\u30F3\u30C6\u30CA\u30F3\u30B9\u306B\u3002"), /*#__PURE__*/React.createElement("button", {
      onClick: openBlockRandom,
      className: "secbtn",
      style: {
        width: "100%",
        padding: "11px 0",
        borderRadius: 10,
        fontSize: 13.5,
        fontWeight: 800,
        cursor: "pointer",
        background: "#e6f6e1",
        border: "1px solid #1d7a2f",
        color: "#1d7a2f"
      }
    }, "\u30B3\u30FC\u30B9\u3092\u9078\u3093\u3067\u5FA9\u7FD2\uFF08", RANDOM_BLOCK_N, "\u554F\uFF09")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        padding: "16px 16px 15px",
        borderRadius: 14,
        background: "linear-gradient(180deg,#e3f7df,#fff8e7)",
        border: `1px solid ${examMastered ? "#f0a00088" : examComplete ? "#1f9e3a55" : "#1f9e3a"}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 900,
        color: "#1f9e3a"
      }
    }, "\uD83C\uDFF0 \u304B\u3081\u304A\u306E\u57CE\uFF08\u7DCF\u5408\u30C6\u30B9\u30C8\uFF09"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 0.5,
        color: "#d98e00",
        background: "#fff4c2",
        border: "1px solid #f0a00055",
        borderRadius: 6,
        padding: "1px 6px"
      }
    }, "\u4ED5\u4E0A\u3052\u30FB\u672C\u756A\u5F62\u5F0F")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        fontWeight: 600,
        color: "#4a3d2e",
        marginBottom: 12
      }
    }, "\u5168\u7BC4\u56F2\u304B\u3089", EXAM_SIZE, "\u554F\u30E9\u30F3\u30C0\u30E0\u51FA\u984C\u30FB", EXAM_PASS, "\u554F\uFF086\u5272\uFF09\u3067\u5408\u683C\uFF1D\u30B9\u30BF\u30FC\u2B50\uFF0F", EXAM_GOLD, "\u554F\u4EE5\u4E0A\u3067\u738B\u51A0\uD83D\uDC51"), examStrip(26), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: 11.5,
        fontWeight: 700,
        marginTop: 8,
        color: examMastered ? "#d98e00" : examComplete ? "#1f9e3a" : "#4a3d2e"
      }
    }, examMastered ? "🎉 完全制覇！" : `修了バッジ ${examSlots.length} / ${EXAM_SLOTS}`), /*#__PURE__*/React.createElement("button", {
      "data-sfx": "warp",
      onClick: startExam,
      style: {
        width: "100%",
        marginTop: 13,
        padding: "13px 0",
        borderRadius: 11,
        fontSize: 15,
        fontWeight: 900,
        cursor: "pointer",
        color: "#ffffff",
        background: "linear-gradient(90deg,#1f9e3a,#1f9e3a)",
        border: "none",
        boxShadow: "0 0 20px #1f9e3a33"
      }
    }, "\uD83C\uDFF0 \u304B\u3081\u304A\u306E\u57CE\u306B\u6311\u6226\uFF08", Math.min(EXAM_SIZE, questions.length), "\u554F\uFF09")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 18,
        justifyContent: "center",
        marginTop: 14,
        paddingBottom: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (confirm("バッジ・成績をすべてリセットします（修了バッジも含む）。よろしいですか？")) {
          setRecords({});
          setExamSlots([]);
        }
      },
      style: {
        ...linkBtn,
        color: "#e52521"
      }
    }, "\u6210\u7E3E\u3092\u30EA\u30BB\u30C3\u30C8"))));
  }

  // ════════════════ TESTPICK（テスト範囲をチャンク単位で選ぶ） ════════════════
  if (screen === "testpick") {
    const blk = blocks[secIdx] || {
      no: secIdx + 1,
      kind: "",
      chapSpan: ""
    };
    // 各チャンクの問数（最後のチャンクは端数）
    const chunkSizes = Array.from({
      length: chunkCount
    }, (_, i) => Math.min(PAGE_SIZE, secQuestions.length - i * PAGE_SIZE));
    const selectedCount = [...pickChunks].reduce((s, c) => s + (chunkSizes[c] || 0), 0);
    const allSelected = pickChunks.size === chunkCount;
    const toggleChunk = c => setPickChunks(prev => {
      const n = new Set(prev);
      if (n.has(c)) n.delete(c);else n.add(c);
      return n;
    });
    const toggleAll = () => setPickChunks(allSelected ? new Set() : new Set(Array.from({
      length: chunkCount
    }, (_, k) => k)));
    return /*#__PURE__*/React.createElement("div", {
      style: wrap,
      className: "wrap"
    }, styleTag, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 480,
        width: "100%",
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      "data-sfx": "back",
      onClick: () => setScreen("home"),
      "aria-label": "\u30DB\u30FC\u30E0\u3078\u623B\u308B",
      className: "iconbtn",
      style: {
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "#ffffff",
        border: "1px solid #3b2a1a",
        color: "#3b3024",
        cursor: "pointer",
        fontSize: 17,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, "\u2190"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: 1.15
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        fontWeight: 900,
        letterSpacing: 0.5
      }
    }, sectionLabels[secIdx], " \u30C6\u30B9\u30C8"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: "#5e4f3c"
      }
    }, blk.kind, " \u30FB ", blk.chapSpan)), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 36
      },
      "aria-hidden": "true"
    })), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "18px 0 12px",
        fontSize: 12.5,
        lineHeight: 1.7,
        color: "#4a3d2e"
      }
    }, "\u51FA\u984C\u3059\u308B\u7BC4\u56F2\u309210\u554F\u305A\u3064\u9078\u3079\u307E\u3059\u3002", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#1d7a2f",
        fontWeight: 700
      }
    }, "\u5168\u90E8\u3092\u9078\u3093\u30679\u5272\u5408\u683C\u3059\u308B\u3068\u3001\u3053\u306E\u30B3\u30FC\u30B9\u30AF\u30EA\u30A2\uD83D\uDEA9"), "\u306B\u306A\u308A\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("button", {
      onClick: toggleAll,
      style: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        marginBottom: 8,
        borderRadius: 11,
        cursor: "pointer",
        background: "#fff8e7",
        border: "1px solid #3b2a1a",
        color: "#3b3024",
        fontSize: 13,
        fontWeight: 800,
        textAlign: "left"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 20,
        height: 20,
        borderRadius: 6,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 900,
        background: allSelected ? "#e6f6e1" : "transparent",
        border: `1px solid ${allSelected ? "#43b047" : "#3b2a1a"}`,
        color: "#1d7a2f"
      }
    }, allSelected ? "✓" : ""), allSelected ? "すべて解除" : "すべて選択"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 7
      }
    }, Array.from({
      length: chunkCount
    }).map((_, i) => {
      const on = pickChunks.has(i);
      return /*#__PURE__*/React.createElement("button", {
        key: i,
        onClick: () => toggleChunk(i),
        "aria-pressed": on,
        "aria-label": `セット${i + 1}（${chunkSizes[i]}問）${on ? "・選択中" : ""}`,
        style: {
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          borderRadius: 12,
          cursor: "pointer",
          textAlign: "left",
          background: on ? "#e6f6e1" : "#ffffff",
          border: `1px solid ${on ? "#1d7a2f" : "#d9c7a0"}`,
          color: "inherit",
          transition: "border-color .12s, background .12s"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 22,
          height: 22,
          flex: "0 0 auto",
          borderRadius: 6,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 900,
          background: on ? "#e6f6e1" : "transparent",
          border: `1px solid ${on ? "#43b047" : "#3b2a1a"}`,
          color: "#1d7a2f"
        }
      }, on ? "✓" : ""), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontSize: 15,
          fontWeight: 800
        }
      }, "\u30BB\u30C3\u30C8", i + 1, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 600,
          color: "#5e4f3c",
          marginLeft: 8
        }
      }, chunkSizes[i], "\u554F")));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 18,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "#4a3d2e",
        marginBottom: 10
      }
    }, "\u51FA\u984C\u6570 ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        fontWeight: 900,
        color: selectedCount > 0 ? "#1f1a14" : "#5e4f3c"
      }
    }, selectedCount), " \u554F", allSelected ? "（コース全問）" : ""), /*#__PURE__*/React.createElement("button", {
      "data-sfx": "warp",
      onClick: startPickTest,
      disabled: selectedCount === 0,
      style: {
        ...primaryBtn("linear-gradient(90deg,#43b047,#1f9e3a)"),
        width: "100%",
        opacity: selectedCount === 0 ? 0.4 : 1,
        cursor: selectedCount === 0 ? "not-allowed" : "pointer"
      }
    }, "\u26A1 \u30C6\u30B9\u30C8\u958B\u59CB\uFF08", selectedCount, "\u554F\uFF09"), /*#__PURE__*/React.createElement("button", {
      "data-sfx": "back",
      onClick: () => setScreen("home"),
      style: {
        ...linkBtn,
        marginTop: 16
      }
    }, "\u30B3\u30FC\u30B9\u4E00\u89A7\u3078"))));
  }

  // ════════════════ RANDOMPICK（ランダム演習＝復習用: ブロックを選ぶ） ════════════════
  if (screen === "randompick") {
    return /*#__PURE__*/React.createElement("div", {
      style: wrap,
      className: "wrap"
    }, styleTag, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 480,
        width: "100%",
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      "data-sfx": "back",
      onClick: () => setScreen("home"),
      "aria-label": "\u30DB\u30FC\u30E0\u3078\u623B\u308B",
      className: "iconbtn",
      style: {
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "#ffffff",
        border: "1px solid #3b2a1a",
        color: "#3b3024",
        cursor: "pointer",
        fontSize: 17,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, "\u2190"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        fontWeight: 900,
        letterSpacing: 0.5
      }
    }, /*#__PURE__*/React.createElement(QBlock, {
      size: 20,
      style: {
        verticalAlign: "-0.2em",
        marginRight: 6
      }
    }), "\u30E9\u30F3\u30C0\u30E0\u6F14\u7FD2\uFF08\u5FA9\u7FD2\uFF09"), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 36
      },
      "aria-hidden": "true"
    })), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "18px 0 12px",
        fontSize: 12.5,
        lineHeight: 1.7,
        color: "#4a3d2e"
      }
    }, "\u5FD8\u308C\u304B\u3051\u305F\u30B3\u30FC\u30B9\u3092\u9078\u3076\u3068\u3001\u305D\u306E\u4E2D\u304B\u3089", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#1d7a2f",
        fontWeight: 700
      }
    }, "\u30E9\u30F3\u30C0\u30E0", RANDOM_BLOCK_N, "\u554F"), "\u3092\u30B7\u30E3\u30C3\u30D5\u30EB\u3057\u3066\u51FA\u984C\u3057\u307E\u3059\u3002", /*#__PURE__*/React.createElement("br", null), "\u30D0\u30C3\u30B8\u5224\u5B9A\u306F\u306A\u3057\u30FB\u8A18\u61B6\u30E1\u30F3\u30C6\u30CA\u30F3\u30B9\u7528\u3067\u3059\u3002"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 2,
        color: "#5e4f3c",
        margin: "6px 0 10px"
      }
    }, "\u5FA9\u7FD2\u3059\u308B\u30B3\u30FC\u30B9\u3092\u9078\u3076"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, sections.map((sec, i) => {
      const blk = blocks[i] || {
        no: i + 1,
        kind: ""
      };
      return /*#__PURE__*/React.createElement("button", {
        "data-sfx": "warp",
        key: i,
        onClick: () => startRandom(i, RANDOM_BLOCK_N),
        className: "secbtn",
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "13px 14px",
          borderRadius: 12,
          cursor: "pointer",
          background: "#fff8e7",
          border: "1px solid #3b2a1a",
          color: "#1f1a14",
          textAlign: "left",
          width: "100%"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 28,
          height: 28,
          flex: "0 0 auto",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 800,
          background: "#e6f6e1",
          border: "1px solid #1d7a2f",
          color: "#1d7a2f"
        }
      }, blk.no), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          minWidth: 0,
          fontSize: 14.5,
          fontWeight: 800
        }
      }, sectionLabels[i]), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11.5,
          fontWeight: 800,
          color: "#1f9e3a",
          whiteSpace: "nowrap"
        }
      }, /*#__PURE__*/React.createElement(QBlock, {
        size: 15,
        style: {
          verticalAlign: "-0.2em",
          marginRight: 6
        }
      }), Math.min(RANDOM_BLOCK_N, sec.length), "\u554F"));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "18px 0 10px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: "#d9c7a0"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 1.5,
        color: "#5e4f3c",
        whiteSpace: "nowrap"
      }
    }, "\u307E\u305F\u306F"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: "#d9c7a0"
      }
    })), /*#__PURE__*/React.createElement("button", {
      "data-sfx": "warp",
      onClick: () => startRandom(-1, RANDOM_BLOCK_N),
      className: "secbtn",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "15px 16px",
        borderRadius: 12,
        cursor: "pointer",
        background: "linear-gradient(180deg,#43b047,#2e8b3a)",
        border: "3px solid #3b2a1a",
        boxShadow: "0 4px 0 #3b2a1a",
        color: "#ffffff",
        textAlign: "left",
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, "\uD83C\uDF10"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14.5,
        fontWeight: 900
      }
    }, "\u5168\u4F53\u304B\u3089\u30E9\u30F3\u30C0\u30E0"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        opacity: 0.75,
        marginTop: 1
      }
    }, "\u5168\u30B3\u30FC\u30B9\u6A2A\u65AD")), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        fontWeight: 800,
        color: "#fff4c2",
        whiteSpace: "nowrap"
      }
    }, /*#__PURE__*/React.createElement(QBlock, {
      size: 15,
      style: {
        verticalAlign: "-0.2em",
        marginRight: 6
      }
    }), RANDOM_BLOCK_N, "\u554F")), /*#__PURE__*/React.createElement("button", {
      "data-sfx": "back",
      onClick: () => setScreen("home"),
      style: {
        ...linkBtn,
        display: "block",
        margin: "20px auto 0"
      }
    }, "\u30DB\u30FC\u30E0\u3078")));
  }

  // ════════════════ STUDY（暗記: 10覚える→10テスト の繰り返し） ════════════════
  if (screen === "study") {
    // 暗記内テストの結果
    if (studySub === "quizdone") {
      const s = quizScore || {
        correct: 0,
        total: 0
      };
      const isLast = studyChunk + 1 >= chunkCount;
      const perfect = s.total > 0 && s.correct === s.total;
      const misses = (studyProgress[secIdx] || {})[studyChunk] || []; // この回で一発正解できなかった問題ID
      const remaining = chunkCount - (studyChunk + 1); // このブロックで残っているセット数
      return /*#__PURE__*/React.createElement("div", {
        style: wrap,
        className: "wrap"
      }, styleTag, /*#__PURE__*/React.createElement("div", {
        style: {
          maxWidth: 460,
          width: "100%",
          textAlign: "center",
          paddingTop: 30
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          letterSpacing: 3,
          opacity: 0.6
        }
      }, sectionLabels[secIdx], " \u30FB \u30BB\u30C3\u30C8 ", studyChunk + 1, " / ", chunkCount), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 54,
          fontWeight: 900,
          margin: "10px 0 0",
          color: perfect ? "#7ed957" : "#1f9e3a"
        }
      }, s.correct, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 22,
          opacity: 0.7
        }
      }, " / ", s.total)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          opacity: 0.6,
          marginTop: 2
        }
      }, perfect ? "全問正解 ✓" : "正解"), heroes(perfect), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 20,
          padding: "12px 14px",
          borderRadius: 12,
          background: "#fff8e7",
          border: "1px solid #d9c7a0"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12.5,
          fontWeight: 800,
          color: "#3b3024"
        }
      }, sectionLabels[secIdx], "\uFF1A", /*#__PURE__*/React.createElement("span", {
        style: {
          color: "#1f9e3a"
        }
      }, setDoneCount(secIdx)), " / ", chunkCount, " \u30BB\u30C3\u30C8\u5B8C\u4E86"), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginTop: 8
        }
      }, setDots(secIdx))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 22
        }
      }, misses.length > 0 && /*#__PURE__*/React.createElement("button", {
        "data-sfx": "warp",
        onClick: startChunkMisses,
        style: primaryBtn("linear-gradient(90deg,#f0a000,#d98e00)")
      }, "\uD83D\uDD01 \u30DF\u30B9\u306B\u6311\u6226\uFF08", misses.length, "\u554F\uFF09"), !isLast ?
      /*#__PURE__*/
      /* 前進導線は常に目立つ primary。残りセット数を明示して“終わった誤解”を防ぐ */
      React.createElement("button", {
        onClick: () => {
          setStudyChunk(c => c + 1);
          setStudySub("learn");
        },
        style: primaryBtn("linear-gradient(90deg,#43b047,#1f9e3a)")
      }, "\u6B21\u306E\u30BB\u30C3\u30C8\u3078\uFF08\u6B8B\u308A", remaining, "\uFF09\u2192") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13.5,
          fontWeight: 800,
          color: "#7ed957",
          marginTop: 2
        }
      }, "\uD83C\uDF89 \u6700\u5F8C\u306E\u30BB\u30C3\u30C8\uFF01\u4ED5\u4E0A\u3052\u306B\u30B3\u30FC\u30B9\u30C6\u30B9\u30C8\u3067\u529B\u8A66\u3057"), /*#__PURE__*/React.createElement("button", {
        "data-sfx": "warp",
        onClick: () => startTest(secIdx),
        style: primaryBtn("linear-gradient(90deg,#1f9e3a,#7ed957)")
      }, "\u26A1 \u30B3\u30FC\u30B9\u30C6\u30B9\u30C8\uFF08", secQuestions.length, "\u554F\uFF09")), /*#__PURE__*/React.createElement("button", {
        onClick: () => setStudySub("learn"),
        style: ghostBtn
      }, "\u899A\u3048\u308B\u753B\u9762\u306B\u623B\u308B"), /*#__PURE__*/React.createElement("button", {
        "data-sfx": "back",
        onClick: () => setScreen("home"),
        style: {
          ...linkBtn,
          marginTop: 6
        }
      }, "\u30B3\u30FC\u30B9\u4E00\u89A7\u3078"))));
    }
    // learn: 現在の10問を覚える
    return /*#__PURE__*/React.createElement("div", {
      style: wrap,
      className: "wrap"
    }, styleTag, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 560,
        width: "100%",
        paddingBottom: 92
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("button", {
      "data-sfx": "back",
      onClick: () => setScreen("home"),
      "aria-label": "\u30DB\u30FC\u30E0\u3078\u623B\u308B",
      className: "iconbtn",
      style: {
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "#ffffff",
        border: "1px solid #3b2a1a",
        color: "#3b3024",
        cursor: "pointer",
        fontSize: 17,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, "\u2190"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: 1.1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: 3,
        color: "#1f1a14"
      }
    }, "WORLD"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 17,
        fontWeight: 900,
        letterSpacing: 0.5
      }
    }, (blocks[secIdx] || {}).course)), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 36
      },
      "aria-hidden": "true"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement(Bubble, {
      who: "mario"
    }, "\u7DD1\u304C\u6B63\u89E3\u306E\u9078\u629E\u80A2\u3001", /*#__PURE__*/React.createElement("b", null, "\u9EC4\u8272\u3044\u30DE\u30FC\u30AB\u30FC\u304C\u6B63\u8AA4\u306E\u6C7A\u3081\u624B"), "\u3002\uD83D\uDCA1\u3067\u300C\u6B63\u3057\u304F\u306F\u300D\u3082\u78BA\u8A8D\u3057\u3088\u3046\uFF01")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 800,
        color: "#3b3024"
      }
    }, "\u899A\u3048\u308B \u30FB \u30BB\u30C3\u30C8 ", studyChunk + 1, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#5e4f3c",
        fontWeight: 700
      }
    }, "/ ", chunkCount)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: "#5e4f3c"
      }
    }, "\u5B8C\u4E86 ", setDoneCount(secIdx), " / ", chunkCount)), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        borderRadius: 999,
        background: "#ffffff",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        width: `${Math.round(setDoneCount(secIdx) / chunkCount * 100)}%`,
        background: "linear-gradient(90deg,#1f9e3a,#7ed957)",
        borderRadius: 999,
        transition: "width .25s"
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        gap: 4,
        padding: 4,
        marginTop: 14,
        marginBottom: 4,
        background: "#fff8e7",
        border: "1px solid #d9c7a0",
        borderRadius: 999
      }
    }, Array.from({
      length: chunkCount
    }).map((_, i) => {
      const cur = i === studyChunk;
      const m = (studyProgress[secIdx] || {})[i]; // undefined=未挑戦 / []=完了 / [..]=ミス残り
      const done = m && m.length === 0; // 全問正解で学習完了
      const partial = m && m.length > 0; // 挑戦したがミスが残っている
      return /*#__PURE__*/React.createElement("button", {
        key: i,
        onClick: () => {
          setStudyChunk(i);
          setStudySub("learn");
        },
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          minWidth: 54,
          padding: "7px 14px",
          fontSize: 14,
          fontWeight: 800,
          borderRadius: 999,
          cursor: "pointer",
          border: "none",
          color: cur ? "#ffffff" : done ? "#1f9e3a" : partial ? "#d98e00" : "#4a3d2e",
          background: cur ? "linear-gradient(90deg,#43b047,#7ed957)" : "transparent",
          boxShadow: cur ? "0 2px 10px #43b04755" : "none",
          transition: "background .15s, color .15s"
        }
      }, "\u30BB\u30C3\u30C8", i + 1, done && /*#__PURE__*/React.createElement("span", {
        "aria-label": "\u5B66\u7FD2\u5B8C\u4E86",
        style: {
          fontSize: 13,
          fontWeight: 900,
          color: cur ? "#ffffff" : "#1f9e3a"
        }
      }, "\u2713"), partial && /*#__PURE__*/React.createElement("span", {
        "aria-label": `ミス残り${m.length}問`,
        style: {
          minWidth: 16,
          height: 16,
          padding: "0 4px",
          boxSizing: "border-box",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 99,
          fontSize: 10,
          fontWeight: 900,
          lineHeight: 1,
          color: cur ? "#ffffff" : "#d98e00",
          background: cur ? "#d98e00" : "#fff4c2",
          border: `1px solid ${cur ? "#d98e00" : "#d98e0066"}`
        }
      }, m.length));
    })), /*#__PURE__*/React.createElement("div", {
      className: "card-in",
      style: {
        marginTop: 14
      }
    }, chunkQs.map(q => /*#__PURE__*/React.createElement(StudyCard, {
      key: q.id,
      q: q,
      mono: mono,
      flagged: !!flaggedIds[q.id],
      onToggleFlag: () => toggleFlag(q.id)
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        pointerEvents: "none",
        padding: "16px 16px calc(16px + env(safe-area-inset-bottom))",
        background: "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 560,
        margin: "0 auto",
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, ((studyProgress[secIdx] || {})[studyChunk] || []).length > 0 && /*#__PURE__*/React.createElement("button", {
      "data-sfx": "warp",
      onClick: startChunkMisses,
      style: {
        width: "100%",
        padding: "12px",
        fontSize: 15,
        fontWeight: 800,
        borderRadius: 13,
        cursor: "pointer",
        color: "#6b4a00",
        border: "1px solid #d98e0066",
        background: "linear-gradient(180deg,#fff4c2,#ffe9a0)"
      }
    }, "\uD83D\uDD01 \u30DF\u30B9\u306B\u6311\u6226\uFF08", ((studyProgress[secIdx] || {})[studyChunk] || []).length, "\u554F\uFF09"), /*#__PURE__*/React.createElement("button", {
      "data-sfx": "warp",
      onClick: startChunkQuiz,
      style: {
        width: "100%",
        padding: "17px",
        fontSize: 18,
        fontWeight: 900,
        border: "none",
        borderRadius: 16,
        cursor: "pointer",
        color: "#ffffff",
        background: "linear-gradient(90deg,#1f9e3a,#7ed957)",
        boxShadow: "0 6px 26px #1f9e3a55"
      }
    }, "\u26A1 \u3053\u306E", chunkQs.length, "\u554F\u3092\u30C6\u30B9\u30C8"))));
  }

  // ════════════════ TEST（テスト/暗記内チェック 共通ランナー） ════════════════
  if (screen === "test") {
    const q = testQueue[testPos];
    if (!q) return /*#__PURE__*/React.createElement("div", {
      style: wrap,
      className: "wrap"
    }, styleTag);
    const qTotal = testQueue.length;
    const isSection = testMode === "section";
    const isReview = testMode === "review";
    const isRandom = testMode === "random";
    const isExam = testMode === "exam";
    const isExamMiss = testMode === "exammiss";
    const isFlagged = testMode === "flagged";
    const coins = testResults.filter(r => r.ok).length; // 一発正解の数＝コイン
    const runTitle = isSection ? `${sectionLabels[secIdx]} テスト` : isExam ? "🏰 かめおの城（総合テスト）" : isExamMiss ? "🔁 総合テストの覚え直し" : isFlagged ? "🔖 要復習に挑戦" : isReview ? "🔁 間違えた問題に挑戦" : isRandom ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(QBlock, {
      size: 15,
      style: {
        verticalAlign: "-0.2em",
        marginRight: 6
      }
    }), randomLabel, " \u30E9\u30F3\u30C0\u30E0") : `第${studyChunk + 1}セット チェック`;
    return /*#__PURE__*/React.createElement("div", {
      style: wrap,
      className: "wrap"
    }, styleTag, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 560,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 12.5,
        fontWeight: 700
      }
    }, /*#__PURE__*/React.createElement("button", {
      "data-sfx": "back",
      onClick: () => {
        if (isRandom) openBlockRandom();else if (isSection || isReview || isExam || isExamMiss || isFlagged) setScreen("home");else {
          setStudySub("learn");
          setScreen("study");
        }
      },
      style: {
        background: "none",
        border: "none",
        color: "#4a3d2e",
        cursor: "pointer",
        fontSize: 13
      }
    }, "\u2190 \u4E2D\u65AD"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700
      }
    }, runTitle), /*#__PURE__*/React.createElement("span", null, testPos + 1, " / ", qTotal)), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        background: "#e8dcc0",
        borderRadius: 99,
        overflow: "hidden",
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${testPos / qTotal * 100}%`,
        height: "100%",
        background: "linear-gradient(90deg,#43b047,#1f9e3a)",
        transition: "width .3s"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginTop: 10,
        height: 56
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement(Hero, {
      key: `${testPos}-${phase}`,
      who: "luigi",
      px: 3,
      pose: phase === "reveal" ? lastOk ? "jump" : "sad" : "idle"
    }), phase === "reveal" && lastOk && /*#__PURE__*/React.createElement(Coin, {
      key: `c${testPos}`,
      className: "coinpop",
      style: {
        left: 10,
        top: -8
      }
    })), /*#__PURE__*/React.createElement("div", {
      "aria-label": `コイン ${coins}枚`,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 999,
        background: "#ffffff",
        border: "2px solid #3b2a1a",
        fontWeight: 900,
        fontSize: 15
      }
    }, /*#__PURE__*/React.createElement(Coin, {
      px: 2
    }), " \xD7 ", coins)), /*#__PURE__*/React.createElement("button", {
      onClick: () => toggleFlag(q.id),
      "aria-pressed": !!flaggedIds[q.id],
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        width: "100%",
        marginTop: 12,
        padding: "11px 0",
        borderRadius: 12,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 800,
        transition: "background .15s, border-color .15s, box-shadow .15s",
        background: flaggedIds[q.id] ? "linear-gradient(90deg,#f0a000,#d98e00)" : "#ffffff",
        border: `1.5px solid ${flaggedIds[q.id] ? "#d98e00" : "#3b2a1a"}`,
        color: flaggedIds[q.id] ? "#3b2a1a" : "#3b3024",
        boxShadow: flaggedIds[q.id] ? "0 0 16px #d98e0055" : "none"
      }
    }, flaggedIds[q.id] ? "🔖 要復習に登録中（押して解除）" : "🔖 要復習に追加する"), /*#__PURE__*/React.createElement("div", {
      className: phase === "reveal" && !lastOk ? "shake" : "",
      style: {
        marginTop: 16,
        background: "linear-gradient(180deg,#ffffff,#fffaf0)",
        border: `3px solid ${phase === "reveal" ? lastOk ? "#1f9e3a" : "#e52521" : "#3b2a1a"}`,
        borderRadius: 14,
        padding: "22px 20px",
        boxShadow: "0 5px 0 #3b2a1a55",
        transition: "border-color .2s"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 10,
        fontSize: 11,
        opacity: 0.5
      }
    }, /*#__PURE__*/React.createElement("span", null, q.source, "\u30FB", q.category), /*#__PURE__*/React.createElement("span", null, q.type === "multi" ? `${q.selectCount}つ選ぶ` : "1つ選ぶ")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1.65,
        whiteSpace: "pre-wrap"
      }
    }, q.question), phase === "reveal" && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16,
        borderTop: "1px solid #3b2a1a",
        paddingTop: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 900,
        marginBottom: 10,
        color: lastOk ? "#1f9e3a" : "#e52521"
      }
    }, lastOk ? "✓ 正解" : "✕ 不正解"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, q.choices.map(c => {
      const correct = q.answer.includes(c.label);
      const picked = Array.isArray(lastInput) && lastInput.includes(c.label);
      const hint = hintsFor(q, c.label);
      return /*#__PURE__*/React.createElement("div", {
        key: c.label,
        style: {
          display: "flex",
          gap: 10,
          alignItems: "baseline",
          padding: "8px 11px",
          borderRadius: 9,
          background: correct ? "#e3f7df" : "transparent",
          border: `1px solid ${correct ? "#1f9e3a66" : picked ? "#e5252166" : "#d9c7a0"}`
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 800,
          minWidth: 14,
          textAlign: "center",
          color: correct ? "#1f9e3a" : picked ? "#e52521" : "#9a8a70"
        }
      }, c.label), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 15,
          fontFamily: mono,
          lineHeight: 1.5,
          flex: 1,
          color: correct ? "#1f1a14" : "#4a3d2e"
        }
      }, correct ? /*#__PURE__*/React.createElement(Highlight, {
        text: c.text,
        keys: hint,
        color: "#ffd84a",
        on: true,
        variant: "marker"
      }) : c.text), picked && !correct && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: "#e52521",
          whiteSpace: "nowrap"
        }
      }, "\u3042\u306A\u305F\u306E\u56DE\u7B54"));
    })), q.mnemonic && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        fontSize: 13,
        color: "#6b4a00",
        background: "#fff4c2",
        border: "1px solid #e0b000",
        borderRadius: 10,
        padding: "8px 12px",
        lineHeight: 1.6
      }
    }, "\uD83D\uDCA1 ", q.mnemonic))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14
      }
    }, phase === "answer" ? /*#__PURE__*/React.createElement(React.Fragment, null, q.type === "single" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 9
      }
    }, q.choices.map((c, i) => /*#__PURE__*/React.createElement("button", {
      "data-sfx": "none",
      key: c.label,
      className: "choice",
      onMouseDown: e => e.preventDefault(),
      onClick: () => submitAnswer([c.label]),
      onMouseEnter: () => setCursor(i),
      style: {
        ...choiceRow("#ffffff", "#3b2a1a"),
        ...(i === cursor ? {
          boxShadow: "inset 0 0 0 2px #7ed957"
        } : {})
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        opacity: 0.3,
        minWidth: 16,
        textAlign: "center"
      }
    }, c.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        fontFamily: mono,
        lineHeight: 1.5
      }
    }, c.text))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        opacity: 0.4,
        marginTop: 4,
        textAlign: "center"
      }
    }, "\u2191\u2193\u3067\u79FB\u52D5\u30FBEnter\u3067\u6C7A\u5B9A\uFF081\u301C4\u30AD\u30FC\u3067\u3082\u5373\u6C7A\uFF09")), q.type === "multi" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 9
      }
    }, q.choices.map((c, i) => {
      const on = multiSel.includes(c.label);
      return /*#__PURE__*/React.createElement("button", {
        key: c.label,
        className: "choice",
        onMouseDown: e => e.preventDefault(),
        onMouseEnter: () => setCursor(i),
        onClick: () => setMultiSel(s => on ? s.filter(x => x !== c.label) : [...s, c.label]),
        style: {
          ...choiceRow(on ? "#d4f0cc" : "#ffffff", on ? "#43b047" : "#3b2a1a"),
          ...(i === cursor ? {
            boxShadow: "inset 0 0 0 2px #7ed957"
          } : {})
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 16,
          fontWeight: 900,
          color: on ? "#43b047" : "#b0a080",
          minWidth: 22,
          textAlign: "center"
        }
      }, on ? "✓" : "○"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 16,
          fontFamily: mono,
          lineHeight: 1.5
        }
      }, c.text));
    })), /*#__PURE__*/React.createElement("button", {
      "data-sfx": "none",
      onMouseDown: e => e.preventDefault(),
      onMouseEnter: () => setCursor(q.choices.length),
      onClick: () => multiSel.length && submitAnswer(multiSel),
      disabled: !multiSel.length,
      style: {
        ...primaryBtn("linear-gradient(90deg,#43b047,#1f9e3a)"),
        width: "100%",
        marginTop: 10,
        opacity: multiSel.length ? 1 : 0.4,
        ...(cursor === q.choices.length ? {
          boxShadow: "inset 0 0 0 2px #7ed957"
        } : {})
      }
    }, "\u6C7A\u5B9A\uFF08", multiSel.length, "/", q.selectCount, "\uFF09"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        opacity: 0.4,
        marginTop: 6,
        textAlign: "center"
      }
    }, "\u2191\u2193\u3067\u79FB\u52D5\u30FBEnter\u3067\u9078\u629E\uFF0F\u6C7A\u5B9A\u30DC\u30BF\u30F3\u307E\u3067\u52D5\u304B\u3057\u3066Enter\u3067\u56DE\u7B54"))) : isCram(testMode) && !lastOk ?
    /*#__PURE__*/
    /* 覚えるモード系（暗記10問／ランダム演習／総合の覚え直し）で不正解のときは「次へ」を出さず、正解するまで「もう一度チャレンジ」だけ（採点は最初の不正解のまま）。学習動線の制御。 */
    React.createElement("button", {
      onClick: retryQuestion,
      style: {
        width: "100%",
        padding: "13px",
        fontSize: 15,
        fontWeight: 800,
        border: "1px solid #1d7a2f",
        borderRadius: 12,
        cursor: "pointer",
        color: "#ffffff",
        background: "linear-gradient(180deg,#43b047,#2e8b3a)"
      }
    }, "\uD83D\uDD01 \u3082\u3046\u4E00\u5EA6\u30C1\u30E3\u30EC\u30F3\u30B8\uFF08Enter\uFF09") :
    /*#__PURE__*/
    /* 次へは主張を抑える（彩度/サイズを下げ、問題文と黄マーカーが一番目立つように） */
    React.createElement("button", {
      onClick: nextTest,
      style: {
        width: "100%",
        padding: "13px",
        fontSize: 15,
        fontWeight: 800,
        border: "1px solid #8e1411",
        borderRadius: 12,
        cursor: "pointer",
        color: "#ffffff",
        background: "linear-gradient(180deg,#e52521,#b81c18)"
      }
    }, testPos + 1 >= qTotal ? isSection ? "結果を見る（Enter）" : "採点する（Enter）" : "次へ →（Enter）"))));
  }

  // ════════════════ RESULT（結果） ════════════════
  if (screen === "result") {
    const s = lastScore || {
      correct: 0,
      total: 0,
      pct: 0,
      badge: false
    };
    if (s.exam) {
      // 総合テスト（模試）の結果
      const need = Math.max(0, EXAM_PASS - s.correct);
      return /*#__PURE__*/React.createElement("div", {
        style: wrap,
        className: "wrap"
      }, styleTag, /*#__PURE__*/React.createElement("div", {
        style: {
          maxWidth: 460,
          width: "100%",
          textAlign: "center",
          paddingTop: 30
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          letterSpacing: 3,
          opacity: 0.6
        }
      }, "\uD83C\uDFF0 \u304B\u3081\u304A\u306E\u57CE\u306E\u7D50\u679C"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 64,
          fontWeight: 900,
          lineHeight: 1.1,
          margin: "10px 0 0",
          color: s.pass ? s.gold ? "#d98e00" : "#1f9e3a" : "#3b3024",
          textShadow: s.pass ? s.gold ? "0 0 30px #d98e0066" : "0 0 28px #1f9e3a55" : "none"
        }
      }, s.correct, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 24,
          opacity: 0.7
        }
      }, " / ", s.total)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14,
          opacity: 0.6,
          marginTop: 2
        }
      }, "\u6B63\u89E3\uFF08", s.pct, "%\uFF09\u30FB\u5408\u683C\u30E9\u30A4\u30F3 ", EXAM_PASS, "\u554F"), s.pass ? /*#__PURE__*/React.createElement(CastleClear, {
        gold: s.gold,
        mode: s.rescue ? "rescue" : examComplete ? "thanks" : "another",
        remaining: EXAM_SLOTS - examSlots.length
      }) : /*#__PURE__*/React.createElement(React.Fragment, null, heroes(false), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 18
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 20,
          fontWeight: 900,
          color: "#d98e00"
        }
      }, "\u4E0D\u5408\u683C"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          opacity: 0.6,
          marginTop: 6,
          lineHeight: 1.7
        }
      }, "\u3042\u3068", need, "\u554F\u3067\u5408\u683C\uFF08", EXAM_PASS, "\u554F\uFF1D6\u5272\uFF09\u3002"))), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 22,
          padding: "14px",
          borderRadius: 13,
          background: "#fff8e7",
          border: "1px solid #d9c7a0"
        }
      }, examStrip(28), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          fontWeight: 700,
          marginTop: 9,
          color: examMastered ? "#d98e00" : examComplete ? "#1f9e3a" : "#4a3d2e"
        }
      }, examMastered ? "🎉 完全制覇！" : `修了バッジ ${examSlots.length} / ${EXAM_SLOTS}`)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 24
        }
      }, s.missed && s.missed.length > 0 && /*#__PURE__*/React.createElement("button", {
        "data-sfx": "warp",
        onClick: () => startExamMisses(s.missed),
        style: primaryBtn("linear-gradient(90deg,#f0a000,#d98e00)")
      }, "\uD83D\uDD01 \u9593\u9055\u3048\u305F\u554F\u984C\u3092\u899A\u3048\u308B\uFF08", s.missed.length, "\u554F\uFF09"), /*#__PURE__*/React.createElement("button", {
        onClick: startExam,
        style: primaryBtn("linear-gradient(90deg,#1f9e3a,#1f9e3a)")
      }, "\uD83C\uDFF0 \u3082\u3046\u4E00\u5EA6 \u304B\u3081\u304A\u306E\u57CE\u3078"), /*#__PURE__*/React.createElement("button", {
        "data-sfx": "back",
        onClick: () => setScreen("home"),
        style: ghostBtn
      }, "\u30DB\u30FC\u30E0\u3078"))));
    }
    if (s.exammiss) {
      // 総合テストの覚え直し結果（正解するまで繰り返した後、まだ残るミス）
      const remain = s.missed ? s.missed.length : 0;
      return /*#__PURE__*/React.createElement("div", {
        style: wrap,
        className: "wrap"
      }, styleTag, /*#__PURE__*/React.createElement("div", {
        style: {
          maxWidth: 460,
          width: "100%",
          textAlign: "center",
          paddingTop: 34
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          letterSpacing: 3,
          opacity: 0.6
        }
      }, "\uD83D\uDD01 \u899A\u3048\u76F4\u3057\u306E\u7D50\u679C"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 60,
          fontWeight: 900,
          lineHeight: 1.1,
          margin: "10px 0 0",
          color: "#1f9e3a"
        }
      }, s.correct, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 22,
          opacity: 0.7
        }
      }, " / ", s.total)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14,
          opacity: 0.6,
          marginTop: 2
        }
      }, "\u6B63\u89E3"), heroes(isGood(s)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14,
          marginTop: 18,
          lineHeight: 1.7,
          color: remain === 0 ? "#1f9e3a" : "#3b3024"
        }
      }, remain === 0 ? "🎉 全部覚えた！" : `残り ${remain}問`), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 26
        }
      }, remain > 0 && /*#__PURE__*/React.createElement("button", {
        onClick: () => startExamMisses(s.missed),
        style: primaryBtn("linear-gradient(90deg,#f0a000,#d98e00)")
      }, "\u3082\u3046\u4E00\u5EA6 \u9593\u9055\u3048\u305F\u554F\u984C\u3092\u899A\u3048\u308B"), /*#__PURE__*/React.createElement("button", {
        "data-sfx": "back",
        onClick: () => setScreen("home"),
        style: ghostBtn
      }, "\u30DB\u30FC\u30E0\u3078"))));
    }
    if (s.review) {
      // 間違えた問題の復習結果
      const remain = wrongList.length;
      return /*#__PURE__*/React.createElement("div", {
        style: wrap,
        className: "wrap"
      }, styleTag, /*#__PURE__*/React.createElement("div", {
        style: {
          maxWidth: 460,
          width: "100%",
          textAlign: "center",
          paddingTop: 34
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          letterSpacing: 3,
          opacity: 0.6
        }
      }, "\uD83D\uDD01 \u5FA9\u7FD2\u306E\u7D50\u679C"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 60,
          fontWeight: 900,
          lineHeight: 1.1,
          margin: "10px 0 0",
          color: "#1f9e3a"
        }
      }, s.correct, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 22,
          opacity: 0.7
        }
      }, " / ", s.total)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14,
          opacity: 0.6,
          marginTop: 2
        }
      }, "\u6B63\u89E3"), heroes(isGood(s)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14,
          marginTop: 18,
          lineHeight: 1.7,
          color: remain === 0 ? "#1f9e3a" : "#3b3024"
        }
      }, remain === 0 ? "🎉 苦手をすべてクリア！" : `残り苦手 ${remain}問`), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 26
        }
      }, remain > 0 && /*#__PURE__*/React.createElement("button", {
        onClick: startReview,
        style: primaryBtn("linear-gradient(90deg,#43b047,#1f9e3a)")
      }, "\u3082\u3046\u4E00\u5EA6 \u9593\u9055\u3048\u305F\u554F\u984C\u306B\u6311\u6226"), /*#__PURE__*/React.createElement("button", {
        "data-sfx": "back",
        onClick: () => setScreen("home"),
        style: ghostBtn
      }, "\u30DB\u30FC\u30E0\u3078"))));
    }
    if (s.flagged) {
      // 要復習フラグの挑戦結果（フラグは正解しても外れない＝残り数はflaggedListそのもの）
      const remain = flaggedList.length;
      return /*#__PURE__*/React.createElement("div", {
        style: wrap,
        className: "wrap"
      }, styleTag, /*#__PURE__*/React.createElement("div", {
        style: {
          maxWidth: 460,
          width: "100%",
          textAlign: "center",
          paddingTop: 34
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          letterSpacing: 3,
          opacity: 0.6
        }
      }, "\uD83D\uDD16 \u8981\u5FA9\u7FD2\u306E\u7D50\u679C"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 60,
          fontWeight: 900,
          lineHeight: 1.1,
          margin: "10px 0 0",
          color: "#1f9e3a"
        }
      }, s.correct, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 22,
          opacity: 0.7
        }
      }, " / ", s.total)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14,
          opacity: 0.6,
          marginTop: 2
        }
      }, "\u6B63\u89E3"), heroes(isGood(s)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14,
          marginTop: 18,
          lineHeight: 1.7,
          color: remain === 0 ? "#1f9e3a" : "#3b3024"
        }
      }, remain === 0 ? "🎉 要復習が0問に！" : `要復習に残っている問題 ${remain}問`), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11.5,
          opacity: 0.5,
          marginTop: 6,
          lineHeight: 1.7
        }
      }, "\u6B63\u89E3\u3057\u3066\u3082\uD83D\uDD16\u306F\u81EA\u52D5\u3067\u5916\u308C\u307E\u305B\u3093\u3002\u89E3\u8AAC\u753B\u9762\u306E\uD83D\uDD16\u30DC\u30BF\u30F3\u3067\u624B\u52D5\u3067\u5916\u3057\u3066\u304F\u3060\u3055\u3044\u3002"), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 26
        }
      }, remain > 0 && /*#__PURE__*/React.createElement("button", {
        onClick: startFlagged,
        style: primaryBtn("linear-gradient(90deg,#f0a000,#d98e00)")
      }, "\u3082\u3046\u4E00\u5EA6 \u8981\u5FA9\u7FD2\u306B\u6311\u6226"), /*#__PURE__*/React.createElement("button", {
        "data-sfx": "back",
        onClick: () => setScreen("home"),
        style: ghostBtn
      }, "\u30DB\u30FC\u30E0\u3078"))));
    }
    if (s.random) {
      // ランダム演習の結果（バッジ無し）
      const pass = s.pct >= PASS_PCT;
      return /*#__PURE__*/React.createElement("div", {
        style: wrap,
        className: "wrap"
      }, styleTag, /*#__PURE__*/React.createElement("div", {
        style: {
          maxWidth: 460,
          width: "100%",
          textAlign: "center",
          paddingTop: 34
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          letterSpacing: 3,
          opacity: 0.6
        }
      }, /*#__PURE__*/React.createElement(QBlock, {
        size: 16,
        style: {
          verticalAlign: "-0.2em",
          marginRight: 6
        }
      }), s.label, " \u30E9\u30F3\u30C0\u30E0\u306E\u7D50\u679C"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 64,
          fontWeight: 900,
          lineHeight: 1.1,
          margin: "10px 0 0",
          color: pass ? "#1f9e3a" : "#3b3024",
          textShadow: pass ? "0 0 28px #1f9e3a55" : "none"
        }
      }, s.pct, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 26
        }
      }, "%")), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14,
          opacity: 0.6,
          marginTop: 2
        }
      }, s.correct, " / ", s.total, " \u554F\u6B63\u89E3"), heroes(isGood(s)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 26
        }
      }, s.missed && s.missed.length > 0 && /*#__PURE__*/React.createElement("button", {
        "data-sfx": "warp",
        onClick: () => startRandomMisses(s.missed),
        style: primaryBtn("linear-gradient(90deg,#f0a000,#d98e00)")
      }, "\uD83D\uDD01 \u3053\u306E\u6F14\u7FD2\u306E\u30DF\u30B9\u306B\u6311\u6226\uFF08", s.missed.length, "\u554F\uFF09"), /*#__PURE__*/React.createElement("button", {
        onClick: openBlockRandom,
        style: primaryBtn("linear-gradient(90deg,#43b047,#1f9e3a)")
      }, /*#__PURE__*/React.createElement(QBlock, {
        size: 18,
        style: {
          verticalAlign: "-0.2em",
          marginRight: 6
        }
      }), "\u3082\u3046\u4E00\u5EA6\u30E9\u30F3\u30C0\u30E0\uFF08\u30B3\u30FC\u30B9\u3092\u9078\u3076\uFF09"), /*#__PURE__*/React.createElement("button", {
        "data-sfx": "back",
        onClick: () => setScreen("home"),
        style: ghostBtn
      }, "\u30DB\u30FC\u30E0\u3078"))));
    }
    return /*#__PURE__*/React.createElement("div", {
      style: wrap,
      className: "wrap"
    }, styleTag, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 460,
        width: "100%",
        textAlign: "center",
        paddingTop: 30
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        letterSpacing: 4,
        opacity: 0.6
      }
    }, sectionLabels[secIdx], " \u7D50\u679C", s.full ? "" : "（範囲選択）"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 64,
        fontWeight: 900,
        lineHeight: 1.1,
        margin: "10px 0 0",
        color: s.pass ? "#1f9e3a" : "#3b3024",
        textShadow: s.pass ? "0 0 28px #1f9e3a55" : "none"
      }
    }, s.pct, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 26
      }
    }, "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        opacity: 0.6,
        marginTop: 2
      }
    }, s.correct, " / ", s.total, " \u554F\u6B63\u89E3"), !s.badge && heroes(isGood(s)), s.badge ?
    /*#__PURE__*/
    /* ブロック全問を選択して合格＝🏅ブロック合格 */
    React.createElement(CourseClear, null) : s.pass ?
    /*#__PURE__*/
    /* 合格ラインは超えたが、部分選択なのでブロック合格(🏅)ではない */
    React.createElement("div", {
      className: "card-in",
      style: {
        marginTop: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 900,
        color: "#1f9e3a"
      }
    }, "\u2713 \u5408\u683C"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        opacity: 0.7,
        marginTop: 6,
        lineHeight: 1.7
      }
    }, "\u5168\u30C1\u30E3\u30F3\u30AF\u3092\u9078\u3093\u3067\u5408\u683C\u3059\u308B\u3068", /*#__PURE__*/React.createElement("br", null), "\u30B3\u30FC\u30B9\u30AF\u30EA\u30A2\uD83D\uDEA9\u306B\u306A\u308A\u307E\u3059\u3002")) : /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 900,
        color: "#d98e00"
      }
    }, "\u4E0D\u5408\u683C"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        opacity: 0.6,
        marginTop: 6,
        lineHeight: 1.7
      }
    }, "\u3042\u3068", Math.max(1, Math.ceil(s.total * PASS_PCT / 100) - s.correct), "\u554F\u3067\u5408\u683C\uFF08", PASS_PCT, "%\uFF09\u3002", /*#__PURE__*/React.createElement("br", null), "\u899A\u3048\u76F4\u3057\u3066\u3082\u3046\u4E00\u5EA6\u3002")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginTop: 26
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => openTestPick(secIdx),
      style: primaryBtn("linear-gradient(90deg,#43b047,#1f9e3a)")
    }, "\u3082\u3046\u4E00\u5EA6\u30C6\u30B9\u30C8"), /*#__PURE__*/React.createElement("button", {
      "data-sfx": "back",
      onClick: () => openStudy(secIdx),
      style: ghostBtn
    }, "\u899A\u3048\u76F4\u3059")), /*#__PURE__*/React.createElement("button", {
      "data-sfx": "back",
      onClick: () => setScreen("home"),
      style: {
        ...linkBtn,
        marginTop: 18
      }
    }, "\u30B3\u30FC\u30B9\u4E00\u89A7\u3078")));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: wrap,
    className: "wrap"
  }, styleTag);
}
const linkBtn = {
  background: "none",
  border: "none",
  color: "#1f1a14",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 12,
  padding: 0,
  textDecoration: "underline"
};
const ghostBtn = {
  padding: "16px 22px",
  fontSize: 15,
  fontWeight: 800,
  color: "#3b3024",
  background: "#ffffff",
  border: "3px solid #3b2a1a",
  borderRadius: 12,
  cursor: "pointer",
  boxShadow: "0 4px 0 #3b2a1a55"
};
function primaryBtn(grad) {
  return {
    flex: 1,
    padding: "16px",
    fontSize: 16,
    fontWeight: 900,
    color: "#ffffff",
    background: grad,
    border: "3px solid #3b2a1a",
    borderRadius: 12,
    cursor: "pointer",
    boxShadow: "0 4px 0 #3b2a1a",
    textShadow: "1px 1px 0 #3b2a1a88"
  };
}
function choiceRow(bg, bd) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 14,
    textAlign: "left",
    padding: "16px 18px",
    background: bg,
    border: `2px solid ${bd}`,
    borderRadius: 16,
    cursor: "pointer",
    color: "#1f1a14",
    transition: "transform .08s, background .15s, border .15s"
  };
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
