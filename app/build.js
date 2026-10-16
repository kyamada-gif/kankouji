#!/usr/bin/env node
/*
 * ビルド: app.jsx -> app.js
 *   1) Babel(@babel/preset-react) で JSX をコンパイル
 *   2) ブラウザ素読み込み用に後処理:
 *      - `import React, {...} from "react"` を グローバルReactからの分割代入に置換
 *      - `export default function App` の `export default ` を除去
 *      - 末尾に ReactDOM の描画ブートストラップを追記
 *   index.html は <script src="./app.js"> で素読み込みするため、ESモジュール構文は使えない。
 *   依存: npx babel（@babel/core, @babel/cli, @babel/preset-react）。
 */
const { execSync } = require("child_process");
const fs = require("fs");

execSync("npx babel app.jsx --presets @babel/preset-react -o app.js", { stdio: "inherit" });

let code = fs.readFileSync("app.js", "utf8");

// 1) import 文 → グローバル React からの分割代入
code = code.replace(
  /^import React,\s*\{([^}]*)\}\s*from\s*"react";?\s*$/m,
  (_, names) => `const {${names}} = React;`
);

// 2) export default を除去
code = code.replace(/export default function App/, "function App");

// 3) 描画ブートストラップを末尾に追記（重複追記を防ぐ）
const boot = 'ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));';
if (!code.includes(boot)) code = code.trimEnd() + "\n" + boot + "\n";

// BOM 付きで書き出し（元 app.js に合わせる）
fs.writeFileSync("app.js", "﻿/* 自動生成: build.js（app.jsx -> app.js）。手で編集せず app.jsx を直して再ビルド。 */\n" + code);

// index.html の <script src="./app.js?v=...">  を内容に応じて更新（キャッシュバスト）。
// バージョン＝出力バイト数。内容が変わるたび値が変わり、ブラウザが必ず最新を読む。
try {
  const htmlPath = "index.html";
  let html = fs.readFileSync(htmlPath, "utf8");
  const ver = code.length;
  const next = html.replace(/(\.\/app\.js)(\?v=\d+)?/, `$1?v=${ver}`);
  if (next !== html) { fs.writeFileSync(htmlPath, next); console.log("bumped index.html app.js?v=" + ver); }
} catch (e) { console.warn("index.html version bump skipped:", e.message); }

console.log("built app.js (" + code.length + " bytes)");
