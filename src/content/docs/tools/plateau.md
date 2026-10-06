---
title: 都市データを空間ID にする
sidebar:
  label: 都市データの変換
  order: 5
---

[Nazori](https://airbee-project.github.io/Nazori/) は、[PLATEAU](https://www.mlit.go.jp/plateau/) の建物・道路データ（CityGML）を空間ID に変換するブラウザアプリです。

1. [G空間情報センター](https://www.geospatial.jp/ckan/dataset/plateau)から CityGML をダウンロードします。建物は `udx/bldg/`、道路は `udx/tran/` にあります。
2. Nazori で、対象（建築物か道路）、変換方式 `Flat`、出力 `TXT`、ズームレベル（23〜25 程度）を選んで変換します。
3. 出力した TXT は [Senri](/concepts/spatial-id/#空間id-を地図で見る) で表示できます。

現時点の対応は PLATEAU の建物と道路のみです。結果を公開するときは、PLATEAU の利用規約に従って出典を書いてください。
