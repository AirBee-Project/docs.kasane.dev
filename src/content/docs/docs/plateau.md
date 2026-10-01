---
title: 都市データを空間ID にする
sidebar:
  label: 都市データの変換
  order: 5
---

[Nazori](https://airbee-project.github.io/Nazori/) を使うと、国土交通省の [PLATEAU](https://www.mlit.go.jp/plateau/) が公開している建物・道路のデータ（CityGML）を空間ID に変換できます。ブラウザの中で動くので、インストールは要りません。

1. [G空間情報センター](https://www.geospatial.jp/ckan/dataset/plateau)から、好きな都市の CityGML をダウンロードします。建物は `udx/bldg/`、道路は `udx/tran/` にあります。
2. Nazori で、対象（建築物か道路）、変換方式 `Flat`、出力 `TXT`、ズームレベル（23〜25 くらい）を選んで変換します。
3. ダウンロードされた TXT は、[Senri](/concepts/spatial-id/#空間id-を地図で見る) で読み込んで地図に表示できます。

Nazori が対応しているのは、現時点で PLATEAU の建物と道路のみです。PLATEAU のデータを使った結果を公開するときは、PLATEAU の利用規約に従って出典を書いてください。
