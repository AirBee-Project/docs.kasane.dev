import { RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ db }: Tutorial) {
  // 時間を扱うテーブルを作る（値は雨の強さ）
  await db.createTable("rain", "int", 20, { isTemporal: true });
  const rain = db.table("rain");

  // 2025-01-01 0 時（UTC）の、1 時間単位の時間インデックス
  const h = Math.floor(Date.UTC(2025, 0, 1, 0) / 1000 / 3600);

  const town = RangeId.create(20, [0, 7], [931375, 931402], [412890, 412913]);
  const east = RangeId.create(20, [0, 7], [931388, 931402], [412890, 412913]);

  // 0 時台：町全体に小雨（10）を書き、東側だけ雨（30）で上書きする
  await rain.insert(10, town.withTime(3600, h));
  await rain.insert(30, east.withTime(3600, h));

  // 1 時台：町全体に強い雨（60）
  await rain.insert(60, town.withTime(3600, h + 1));

  // 町の西側と東側の 1 点で、時間ごとの雨を見る
  const west = SingleId.create(20, 0, 931382, 412900);
  const eastPoint = SingleId.create(20, 0, 931388, 412900);
  for (const [label, t] of [["0 時台", h], ["1 時台", h + 1]] as const) {
    const w = await rain.search(west.withTime(3600, t)).toArray();
    const e = await rain.search(eastPoint.withTime(3600, t)).toArray();
    console.log(`${label}  西:`, w.map((r) => r.value), " 東:", e.map((r) => r.value));
  }
}
