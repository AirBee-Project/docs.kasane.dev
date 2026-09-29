---
title: クエリの一覧
sidebar:
  order: 3
---

クエリは `query.source(データベース名, テーブル名)` から始めて、演算をつないで組み立てます。`client.query(クエリ, 取り出す範囲)` で実行すると、サーバー側で計算されて結果が返ります。参照するテーブルすべてに読み取り権限が必要です。

```ts
const q = query.source("tester_alice", "risk").filter({ min: 50 }).zoomOut(20, "max");
const results = await client.query(q, area, { format: "singleId" }).toArray();
```

`policy` を取る演算では、必ず `policy` を指定してください。省略するとエラーになります。

| 演算 | 内容 |
| --- | --- |
| `filter({ min, max })` | 値の範囲で絞り込む。`{ equals: 値 }`、`{ notInRange: { min, max } }` も使える |
| `intersection(q)` | 両方にあるボクセルだけ残す（値は左側） |
| `difference(q)` | 右側にあるボクセルを除く |
| `merge(q, { policy, defaultValue })` | 重ね合わせる。片方にしか無いボクセルは、無い側を `defaultValue` として計算する |
| `zoomOut(z, policy)` | 粗いズームレベルにまとめる |
| `shiftX(z, n)` / `shiftY` / `shiftF` | ズームレベル z で n ボクセル移動する |
| `extrudeX(z, start, end, policy)` / `extrudeY` / `extrudeF` | 指定した範囲いっぱいに引き延ばす |
| `falloffX(z, radius, { pattern, direction, policy })` / `falloffY` / `falloffF` | 周りに広げながら、radius ボクセル先で 0 になるよう減らす |
| `mapValues({ outputType, mapping, defaultValue })` | 対応表で値を置き換える。型が変わるときは `client.query` に `valueType` も渡す |
| `add(n)` / `subtract(n)` / `multiply(n)` / `divide(n)` | 四則演算。整数の割り算は切り捨て |

`policy` は、同じボクセルに値が重なったときの決め方です。左 80、右 30 の場合の結果を例に書いています。

| policy | 結果 |
| --- | --- |
| `overwrite` | 30（右側） |
| `keepExisting` | 80（左側） |
| `sum` | 110 |
| `max` / `min` | 80 / 30 |
| `average` | 55 |
| `difference` | 50（左 − 右） |

`falloff` の `pattern` は、`linear`（80 → 40 → 0 のように一定に減る）、`quadraticIn`（近くはゆっくり、遠くで急に減る）、`quadraticOut`（近くで急に、遠くはゆっくり減る）の 3 つです。`direction` に `upper` か `lower` を渡すと、インデックスが増える向き・減る向きの片側だけに広げます。
