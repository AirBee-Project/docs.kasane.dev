import { Interval, RangeId, SingleId, isKasaneError } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ db }: Tutorial) {
  // 時間を扱うテーブルを作る
  await db.createTable("weather", "text", 25, { isTemporal: true });
  const table = db.table("weather");

  // 2025-01-01 0 時（UTC）の UNIX 時間から、1 時間単位の時間インデックスを求める
  const unix = Date.UTC(2025, 0, 1, 0) / 1000;
  const hour = Math.floor(unix / 3600);
  const place = SingleId.create(20, 0, 931389, 412900);

  await table.insert("晴れ", place.withTime(3600, hour)); // 0 時台
  await table.insert("雨", place.withTime(3600, hour + 1)); // 1 時台

  // 0 時台だけを検索
  const first = await table.search(place.withTime(3600, hour)).toArray();
  console.log("0 時台:", first.map((r) => r.value));

  // 0 時台〜1 時台を範囲で検索
  const range = RangeId.create(20, 0, 931389, 412900).withTime(3600, [hour, hour + 1]);
  console.log("0〜1 時台:", (await table.search(range).toArray()).map((r) => r.value));

  // 1 日単位で検索しても、その日に含まれるデータが返る
  const day = Math.floor(unix / 86400);
  console.log("その日:", (await table.search(place.withTime(Interval.DAY, day)).toArray()).map((r) => r.value));

  // 時間を付けずに書くと「全時間」の値になり、どの時刻で検索しても返る
  const station = SingleId.create(20, 0, 931390, 412900);
  await table.insert("駅", station);
  console.log("100 時間後:", (await table.search(station.withTime(3600, hour + 100)).toArray()).map((r) => r.value));

  // 使える時間間隔は 1 / 60 / 3600 / 86400 秒だけ
  try {
    await table.search(place.withTime(1800, hour * 2)).toArray();
  } catch (e) {
    if (isKasaneError(e)) console.log("1800 秒:", e.message);
  }
}
