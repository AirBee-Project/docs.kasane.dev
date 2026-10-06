---
title: コードの早見表
sidebar:
  order: 2
---

## テーブル

```ts
await db.createTable("risk", "int", 25);
await db.createTable("weather", "enum", 18, {
  isTemporal: true,
  constraints: { kind: { case: "enumConstraint", value: { choices: ["晴れ", "曇り", "雨"] } } } as never,
});

await db.listTables();
await table.info();
await table.copy("backup");
await table.delete();
await client.tableClient.update({ dbName, tableName, newName }); // 改名（内部向け API）
```

## 書き込み

```ts
await table.insert(80, id);              // 上書き
await table.upsert(80, id);              // 空いている部分だけ
await table.remove(id);
await table.insert(80, [id1, id2]);      // 同じ値をまとめて
await table.insert(80, id, "normalize"); // 細かすぎる ID を親に丸める（"error" / "ignore"）
```

## 検索

```ts
const results = await table.search(area).toArray();
for await (const { id, value } of table.search(area, { format: "singleId" })) { /* ... */ }

// テーブル全体
await table.search(RangeId.create(0, [-1, 0], 0, 0)).toArray();
```

`table.info()` の `count` は、テーブル全体を `format: "flexId"` で検索した件数と一致します。

## 時空間ID

```ts
await weather.insert("晴れ", place.withTime(3600, t));
await weather.search(place.withTime(Interval.DAY, day)).toArray(); // その日に含まれるデータ
```

## クエリ

```ts
const q = query.source("city", "risk").filter({ min: 50 }).zoomOut(20, "max");
const results = await client.query(q, area, { format: "singleId" }).toArray();
```

## エラー

```ts
try {
  await table.insert(80, id);
} catch (e) {
  if (isNotFoundError(e)) { /* テーブルが無い */ }
  else if (isKasaneError(e)) console.error(e.message); // "[invalid_argument] ..."
}
```

種類の一覧は[エラー処理](/clients/typescript/guide/errors/#サーバーのエラー)にあります。
