---
title: Kasane の使い方
sidebar:
  order: 2
---

## データの持ち方

Kasane は「データベース → テーブル → 時空間ID と値」という構造です。テーブルは 1 種類の情報（建物、危険度、天気など）を入れる場所で、1 つのボクセルには 1 つの値しか入りません。

テーブルを作るときに、値の型と最大ズームレベルを決めます。この 2 つはあとから変えられません。

```ts
await db.createTable("risk", "int", 25);
await db.createTable("weather", "enum", 18, {
  isTemporal: true,
  constraints: { kind: { case: "enumConstraint", value: { choices: ["晴れ", "曇り", "雨"] } } } as never,
});
```

| 型 | 書く値 | 読んだときの値 |
| --- | --- | --- |
| `text` | 文字列 | `string` |
| `int` | 整数 | `bigint` |
| `boolean` | `true` / `false` | `boolean` |
| `enum` | 選択肢の文字列 | `string` |
| `presence` | `null` | `null` |

制約は `text` なら `{ case: "text", value: { minLength, maxLength } }`、`int` なら `{ case: "int", value: { min, max } }` の形で指定します（数値は `bigint`）。

テーブルの一覧は `db.listTables()`、情報は `table.info()`、コピーは `table.copy(名前)`、削除は `table.delete()` です。改名や説明文の変更は、クライアントに専用メソッドが無いので `client.tableClient.update({ dbName, tableName, newName })` を使います。

## 書き込み

```ts
await table.insert(80, id);           // 空いていれば書く、値があれば上書き
await table.upsert(80, id);           // 空いている部分にだけ書く
await table.remove(id);               // 消す
await table.insert(80, [id1, id2]);   // 配列でまとめて書ける
```

1 回に書ける値は 1 つです。値が違うデータは、値ごとに ID をまとめて送ると速くなります。隣り合うボクセルは RangeId 1 つにまとめると、さらに軽くなります。

テーブルの最大ズームレベルより細かい ID は、既定ではエラーになります。第 3 引数に `"ignore"`（無視）か `"normalize"`（親のボクセルに丸める）を渡すと扱いを変えられます。

## 検索

```ts
const results = await table.search(area).toArray();
for await (const { id, value } of table.search(area, { format: "singleId" })) { /* ... */ }
```

指定した範囲と重なる部分だけが返ります。結果はストリーミングで届くので、大量の結果は `for await` で 1 件ずつ処理できます。検索結果は 1 回しか読めず、2 回目は空になります。テーブル全体を取り出すときは `RangeId.create(0, [-1, 0], 0, 0)` で検索します。

`table.info()` の `count` は、内部の保存単位（FlexId）の数です。書き込んだ ID の数とは一致しませんが、テーブル全体を `format: "flexId"` で検索した件数とは一致します。

## 時空間ID

テーブルを `isTemporal: true` で作ると、時間つきの ID を書けます。

```ts
await weather.insert("晴れ", place.withTime(3600, t));
await weather.search(place.withTime(Interval.DAY, day)).toArray(); // その日に含まれるデータ
```

時間なしの ID で書くと全時間の値になります。時間を扱わないテーブルに時間つきの ID を書くとエラーです。

## エラー

失敗すると、クライアントは `ConnectError` を投げます。`e.message` の先頭に種類が入っています。

```text
[invalid_argument] Value type mismatch: expected String, got Int
```

| 種類 | よくある原因 |
| --- | --- |
| `invalid_argument` | 型違い、制約違反、ズームレベルの上限超え、使えない時間間隔、`policy` の指定漏れ |
| `not_found` | テーブルが無い |
| `already_exists` | 同じ名前のテーブルがある |
| `permission_denied` | 権限が無い |
| `unauthenticated` | ユーザー名・パスワードの誤り |
| `internal` | サーバー内部のエラー。不具合の可能性があるので報告をお願いします |

`isNotFoundError(e)`、`isAlreadyExistsError(e)`、`isPermissionDeniedError(e)` などで種類を判定できます。
