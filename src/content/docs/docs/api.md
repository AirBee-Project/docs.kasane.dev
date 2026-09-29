---
title: クライアント API
description: TypeScript クライアント（@airbee-project/kasane-client v0.0.3）のメソッド一覧です。
sidebar:
  order: 4
---

```sh
npm install https://github.com/AirBee-Project/Kasane-Client-ts/releases/download/v0.0.3/airbee-project-kasane-client-0.0.3.tgz
```

Node.js 20 以上、Bun、ブラウザで動きます。通信には gRPC-Web を使います。

## KasaneClient

```ts
const client = await KasaneClient.connect(url, username, password); // url は配列でも可
client.listDatabases();
client.database(name);                    // DatabaseHandle
client.query(query, ids, { format, valueType });
client.logout();
```

## DatabaseHandle

```ts
db.table(name);                           // TableHandle
db.info();
db.update({ newName, description });      // description: null で削除
db.listTables();
db.createTable(name, dataType, maxZoomLevel, { isTemporal, constraints, description, valueIndex });
```

`client.createDatabase`、`db.copy`、`db.delete` は管理者向けなので、テスターのアカウントでは使えません。

## TableHandle

```ts
table.insert(value, ids, policy);         // policy: "error" | "ignore" | "normalize"
table.upsert(value, ids, policy);
table.remove(ids, policy);
table.search(ids, { format, policy });    // ResultStream（for await / toArray / toDictionaryMap）
table.info();
table.copy(copyTableName, copyDbName);
table.delete();
```

`ids` には `SingleId`・`RangeId`・`FlexId` か、その配列を渡せます。`format` は `"singleId"`・`"rangeId"`（既定）・`"flexId"` です。

## 空間ID

```ts
SingleId.create(z, f, x, y);  SingleId.parse(text);  id.withTime(i, t);
RangeId.create(z, f, x, y);   RangeId.parse(text);   id.withTime(i, [tMin, tMax]);
FlexId.create(fz, f, xz, x, yz, y);  FlexId.parse(text);
Interval.SECOND / MINUTE / HOUR / DAY
```

## v0.0.3 で足りないもの

テーブルの改名・説明文・制約の変更は、`client.tableClient.update(...)` を直接呼んでください。パスワード変更、自分の権限の確認、サーバー情報の取得はクライアントに含まれていません。

API の定義（proto）は [Kasane のリポジトリ](https://github.com/AirBee-Project/Kasane/tree/main/proto)にあります。サーバーはリフレクションに対応しているので、grpcurl などからも呼べます。
