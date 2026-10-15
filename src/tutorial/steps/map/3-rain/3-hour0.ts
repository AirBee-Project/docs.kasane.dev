// @hide-start
import { RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ db }: Tutorial) {
  const rain = db.table("rain");
  const h = Math.floor(Date.UTC(2025, 0, 1, 0) / 1000 / 3600);
// @hide-end
  // 0 時台：町全体に小雨（10）を書き込み、東側だけ雨（30）で上書きする
  const town = RangeId.create(20, [0, 5], [931375, 931402], [412890, 412913]);
  const east = RangeId.create(20, [0, 5], [931388, 931402], [412890, 412913]);
  await rain.insert(10, town.withTime(3600, h));
  await rain.insert(30, east.withTime(3600, h));

  // 町の西側と東側の 1 点ずつを検索する
  const westPoint = SingleId.create(20, 0, 931382, 412900);
  const eastPoint = SingleId.create(20, 0, 931388, 412900);
  for (const [label, place] of [["西", westPoint], ["東", eastPoint]] as const) {
    const [result] = await rain.search(place.withTime(3600, h)).toArray();
    console.log(`${label} =>`, result ? `${result.value}` : "値なし");
  }
// @hide-start
}
// @hide-end
