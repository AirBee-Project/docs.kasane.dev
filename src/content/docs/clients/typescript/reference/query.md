---
title: クエリの一覧
sidebar:
  order: 3
---

各演算の意味は[クエリの考え方](/concepts/query/)にあります。

```ts
const q = query.source("city", "risk").filter({ min: 50 }).zoomOut(20, "max");
const results = await client.query(q, area, { format: "singleId" }).toArray();
```

| 演算 | 書き方 |
| --- | --- |
| filter | `filter({ min, max })`・`filter({ equals })`・`filter({ notInRange: { min, max } })` |
| intersection | `intersection(q)` |
| difference | `difference(q)` |
| merge | `merge(q, { policy, defaultValue })` |
| zoomOut | `zoomOut(z, policy)` |
| shift | `shiftX(z, n)`・`shiftY`・`shiftF` |
| extrude | `extrudeX(z, start, end, policy)`・`extrudeY`・`extrudeF` |
| falloff | `falloffX(z, radius, { pattern, direction, policy })`・`falloffY`・`falloffF` |
| mapValues | `mapValues({ outputType, mapping, defaultValue })`。型が変わるときは `client.query` に `valueType` も渡す |
| 四則演算 | `add(n)`・`subtract(n)`・`multiply(n)`・`divide(n)` |
