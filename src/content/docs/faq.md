---
title: よくある質問
---

TypeScript クライアントについては [TypeScript の FAQ](/clients/typescript/reference/faq/) を見てください。

## テーブルの count が、書き込んだ空間ID の数と合わない

count は内部の保存単位（[FlexId](/concepts/kasane-spatial-id/#flexid)）の数です。隣り合うボクセルはまとめて保存されます。

## 同じ場所に書き込んでもエラーにならない

書き込み（insert）は上書きです。既存の値を残すときは、空いている部分にだけ書き込む upsert を使います。

## `policy must be specified` と出る

クエリの merge・zoom out・extrude・falloff には policy が必須です（[policy](/concepts/query/#policy)）。

## 30 分単位のデータを扱いたい

時間間隔は 1・60・3600・86400 秒しか使えません（[時間](/concepts/kasane-spatial-id/#時間)）。60 秒間隔で 30 区間分の範囲として書き込みます。
