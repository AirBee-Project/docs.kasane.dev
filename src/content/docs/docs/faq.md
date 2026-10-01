---
title: よくある質問
sidebar:
  order: 6
---

## TypeScript で `has no exported member` と出る

`tsconfig.json` の `moduleResolution` を `"Bundler"` にしてください。

## 値が `42n` のように表示される

INT の値は `bigint` で返ります。`Number(value)` で普通の数値にできます。

## `count` が書き込んだ件数と合わない

`count` は内部の保存単位の数で、書き込んだ ID の数とは違います（[書き込む](/guide/write/#まとめて書き込む)）。

## 同じ場所に Insert してもエラーにならない

v0.7 の Insert は上書きです。元の値を残したいときは Upsert を使います。

## `policy must be specified` と出る

`zoomOut`、`merge`、`extrude`、`falloff` には `policy` を指定してください。

## 30 分単位のデータを扱いたい

時間間隔に 1800 秒は使えません。1 分単位で 30 個分の範囲（`withTime(60, [t, t + 29])`）として書き込んでください。
