// @hide-start
import { RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ db }: Tutorial) {
  const rain = db.table("rain");
  const h = Math.floor(Date.UTC(2025, 0, 1, 0) / 1000 / 3600);
  const town = RangeId.create(20, [0, 5], [931375, 931402], [412890, 412913]);
  const westPoint = SingleId.create(20, 0, 931382, 412900);
  const eastPoint = SingleId.create(20, 0, 931388, 412900);
// @hide-end
  // 1 時台：町全体に強い雨（60）を書き込む
  await rain.insert(60, town.withTime(3600, h + 1));

  for (const [label, place] of [["西", westPoint], ["東", eastPoint]] as const) {
    const [result] = await rain.search(place.withTime(3600, h + 1)).toArray();
    console.log(`${label} =>`, result ? `${result.value}` : "値なし");
  }
// @hide-start
}
// @hide-end
